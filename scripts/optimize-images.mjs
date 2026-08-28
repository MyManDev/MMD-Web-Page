/**
 * Gorselleri servis edilecek genisliklere indirger.
 *
 *   assets/screenshots/<isim>.webp -> public/projects/<isim>-<genislik>.webp
 *   assets/people/<isim>.webp      -> public/people/<isim>-<genislik>.webp
 *
 * Kaynaklar assets/ altinda cunku servis edilmemeli: hicbir cihaz o
 * boyutlari istemiyor ve public/ altindaki her sey out/'a kopyalanir.
 *
 * KODLAYICI: Playwright Chromium. `sharp` EKLENMEDI - Chromium zaten
 * devDependency (pnpm e2e onu kullaniyor), yani bu script yeni bir bagimlilik
 * getirmiyor (CLAUDE.md kural 4). Kodlama canvas.toDataURL('image/webp') ile
 * yapiliyor; tarayicinin kendi webp kodlayicisi.
 *
 * Genislikler ve oranlar burada YAZILI DEGIL: lib/image-widths.json'dan
 * okunuyor, ayni dosyayi component tarafi da okuyor (lib/images.ts). Boylece
 * uretilen dosya adlari ile srcset'in bahsettigi adlar ayrisamaz.
 *
 * Kullanim: pnpm images
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import kinds from "../lib/image-widths.json" with { type: "json" };

/** Hangi kaynak klasoru hangi cikti klasorune ve hangi tanima gidiyor. */
const JOBS = [
  { kind: "screenshot", from: "assets/screenshots", to: "public/projects" },
  { kind: "portrait", from: "assets/people", to: "public/people" },
];

/**
 * Kalite. 0.9: kaynak zaten kayipli bir webp, yani bu ikinci kodlama.
 * Nesil kaybi once kucuk metinde ve yuz detayinda gorunur; 0.8'e inmek birkac
 * KB kazandirip ikisini de bulaniklastiriyordu.
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
  // Kucultmede varsayilan filtre metni ve yuz detayini bozuyor.
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  /*
   * KIRP, ESNETME. Onceki hali kaynagi hedef kutuya dogrudan ciziyordu; kaynak
   * ile hedef ayni orandayken fark etmiyordu, ama oran degistigi anda goruntu
   * EZILIYORDU - bir portrede bu, yuzun bozulmasi demek.
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

const browser = await chromium.launch();
const page = await browser.newPage();

console.log(`Gorsel pipeline - kalite ${QUALITY}`);

try {
  for (const job of JOBS) {
    const spec = kinds[job.kind];
    const widths = [...spec.widths].sort((a, b) => a - b);
    const [aspectW, aspectH] = spec.aspect;

    let sources;
    try {
      sources = (await readdir(job.from)).filter((name) => name.endsWith(".webp"));
    } catch {
      // Klasor henuz yoksa bu tur atlanir - bos bir klasor hata degil, bir durum.
      console.log(`  ${job.from} yok, atlandi`);
      continue;
    }
    if (sources.length === 0) {
      console.log(`  ${job.from} bos, atlandi`);
      continue;
    }

    await mkdir(job.to, { recursive: true });
    console.log(`  ${job.kind}: ${aspectW}/${aspectH}, genislikler ${widths.join(", ")}`);

    for (const source of sources) {
      const { name } = parse(source);
      const bytes = await readFile(join(job.from, source));
      const dataUrl = `data:image/webp;base64,${bytes.toString("base64")}`;

      for (const width of widths) {
        if ((width * aspectH) % aspectW !== 0) {
          throw new Error(`${width}px ${aspectW}/${aspectH}'a tam bolunmuyor; yarim piksel olur.`);
        }
        const height = (width * aspectH) / aspectW;

        const encoded = await page.evaluate(encode, { dataUrl, width, height, quality: QUALITY });
        const payload = encoded.split(",")[1];
        if (!payload) throw new Error(`${name}-${width}: bos data URL dondu.`);

        const output = join(job.to, `${name}-${width}.webp`);
        const buffer = Buffer.from(payload, "base64");
        await writeFile(output, buffer);

        console.log(`    ${output.padEnd(46)} ${width}x${height}  ${buffer.length} byte`);
      }
    }
  }
} finally {
  await browser.close();
}
