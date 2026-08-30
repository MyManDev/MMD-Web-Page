/**
 * Ekran goruntulerini servis edilecek genisliklere indirger.
 *
 *   assets/screenshots/<isim>.webp  ->  public/projects/<isim>-<genislik>.webp
 *
 * Kaynak assets/ altinda cunku servis edilmemeli: 2360 piksel genisliginde ve
 * hicbir cihaz o kadarini istemiyor. public/ altindaki her sey out/'a kopyalanir.
 *
 * KODLAYICI: Playwright Chromium. `sharp` EKLENMEDI - Chromium zaten
 * devDependency (pnpm e2e onu kullaniyor), yani bu script yeni bir bagimlilik
 * getirmiyor (CLAUDE.md kural 4). Kodlama canvas.toDataURL('image/webp') ile
 * yapiliyor; tarayicinin kendi webp kodlayicisi.
 *
 * Genislikler burada YAZILI DEGIL: lib/screenshot-widths.json'dan okunuyor,
 * ayni dosyayi component tarafi da okuyor (lib/images.ts). Boylece uretilen
 * dosya adlari ile srcset'in bahsettigi adlar ayrisamaz.
 *
 * Kullanim: pnpm images
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import widthsFile from "../lib/screenshot-widths.json" with { type: "json" };

const SOURCE_DIR = "assets/screenshots";
const OUTPUT_DIR = "public/projects";

/**
 * 16/10 (docs/design-spec.md §3.3.1, token --aspect-screenshot).
 *
 * Tam sayi olarak tutuluyor, 16/10 diye bolunmuyor: ikili tabanda 1.6 tam
 * temsil edilmiyor ve 720/1.6 = 450.00000000000006 cikiyor. Yuksekligi tam
 * sayi aritmetigiyle hesaplamak yarim piksel tartismasini bastan kapatiyor.
 */
const ASPECT_W = 16;
const ASPECT_H = 10;

/**
 * Kalite. 0.9: kaynak zaten kayipli bir webp, yani bu ikinci kodlama.
 * Ekran goruntusunde kucuk metin var ve nesil kaybi once orada gorunur;
 * 0.8'e inmek birkac KB kazandirip metni bulaniklastiriyordu.
 */
const QUALITY = 0.9;

/**
 * Chromium icinde kosar. Kaynagi data URL olarak alir, hedef genislige
 * olceklendirir, webp olarak geri verir.
 */
async function encode({ dataUrl, width, height, quality }) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d context alinamadi");
  // Kucultmede varsayilan filtre metni bozuyor.
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  /*
   * KIRP, ESNETME. Onceki hali kaynagi hedef kutuya dogrudan ciziyordu; kaynak
   * ile hedef ayni orandayken fark etmiyordu, ama oran degistigi anda goruntu
   * EZILIYORDU. Bugun her kaynak 16/10 oldugu icin cikti degismiyor - bu bir
   * gorunmez kusur, ve gorunur hale geldigi an bir yuzu ya da bir ekrani bozar.
   *
   * CSS tarafi zaten object-cover kullaniyor; dosyayi da ayni sekilde uretmek
   * ikisinin ayni kadraji gormesini sagliyor. Kirpma ORTADAN: bir yani secmek
   * icin gorseli tanimak gerekir, ve script gorseli tanimiyor.
   */
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sWidth = image.naturalWidth;
  let sHeight = image.naturalHeight;
  if (sourceRatio > targetRatio) {
    sWidth = Math.round(image.naturalHeight * targetRatio);
    sx = Math.round((image.naturalWidth - sWidth) / 2);
  } else if (sourceRatio < targetRatio) {
    sHeight = Math.round(image.naturalWidth / targetRatio);
    sy = Math.round((image.naturalHeight - sHeight) / 2);
  }
  context.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, width, height);

  const encoded = canvas.toDataURL("image/webp", quality);
  if (!encoded.startsWith("data:image/webp")) {
    throw new Error("Chromium webp kodlayamadi - donen tur: " + encoded.slice(0, 30));
  }
  return encoded;
}

const widths = [...widthsFile.widths].sort((a, b) => a - b);

const sources = (await readdir(SOURCE_DIR)).filter((name) => name.endsWith(".webp"));
if (sources.length === 0) {
  throw new Error(`${SOURCE_DIR} altinda kaynak gorsel yok.`);
}

await mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

console.log(`Ekran goruntusu pipeline - kalite ${QUALITY}, genislikler ${widths.join(", ")}`);

try {
  for (const source of sources) {
    const { name } = parse(source);
    const bytes = await readFile(join(SOURCE_DIR, source));
    const dataUrl = `data:image/webp;base64,${bytes.toString("base64")}`;

    for (const width of widths) {
      if ((width * ASPECT_H) % ASPECT_W !== 0) {
        throw new Error(`${width}px ${ASPECT_W}/${ASPECT_H}'a tam bolunmuyor; yarim piksel olur.`);
      }
      const height = (width * ASPECT_H) / ASPECT_W;

      const encoded = await page.evaluate(encode, { dataUrl, width, height, quality: QUALITY });
      const payload = encoded.split(",")[1];
      if (!payload) throw new Error(`${name}-${width}: bos data URL dondu.`);

      const output = join(OUTPUT_DIR, `${name}-${width}.webp`);
      const buffer = Buffer.from(payload, "base64");
      await writeFile(output, buffer);

      console.log(`  ${output.padEnd(48)} ${width}x${height}  ${buffer.length} byte`);
    }
  }
} finally {
  await browser.close();
}
