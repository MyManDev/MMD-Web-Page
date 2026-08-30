/**
 * Marka isaretini zeminden ayirir. design-spec.md §3.2
 *
 * `assets/brand/logo.png` dolu turkuaz bir KARE ve uzerinde beyaz bir sekil
 * var - uc kafa ve bir "m". Hero'da istenen sey o kare degil, seklin kendisi.
 * Kareyi oldugu gibi koymak sayfaya ekran boyunda ikinci bir yesil odak
 * eklerdi (design-spec.md §5.1).
 *
 * Bu script zemini saydama cevirir ve geriye yalnizca sekli birakir. Cikti
 * BEYAZ DEGIL, ALFA: sekil opak, zemin saydam. Boylece CSS tarafi
 * `mask-image` ile rengi token'dan verebiliyor - renk hicbir zaman bir
 * dosyanin icine gomulu kalmiyor (CLAUDE.md kural 1).
 *
 * Neden yeniden cizim degil: sekil geometrik gorunuyor ama elle SVG'ye
 * cevirmek onu TAHMIN etmek olur. #18 gercek logo SVG'sini getirdiginde bu
 * dosya da script de silinir; o zamana kadar elimizdeki varlik kullaniliyor.
 *
 * Kodlama Chromium canvas'inda - optimize-images.mjs ile ayni yol, ayni
 * gerekce: `sharp` eklemeden goruntu isleyebilmek icin.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const SOURCE = "assets/brand/logo.png";
const OUTPUT = "public/brand/mark.png";

/**
 * Esik degil, MESAFE. Zemin tek bir duz renk oldugu icin her pikselin o renge
 * uzakligi olculuyor; yakin olanlar saydam, uzak olanlar opak oluyor ve
 * aradaki dar bant kenar yumusatmasini (antialias) koruyor.
 *
 * Sert bir esik yazilsaydi kenarlar merdiven olurdu - 400px'lik bir kaynagi
 * 300px'te gostereceksek o merdiven gorunur.
 */
async function cut({ dataUrl }) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d context alinamadi");
  context.drawImage(image, 0, 0);

  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  const p = data.data;

  // Zemin rengi kose pikselinden okunuyor - dosyaya sabit yazilmiyor.
  const [bgR, bgG, bgB] = [p[0], p[1], p[2]];

  // Sekil ile zemin arasindaki mesafe; gecis bandinin genisligi bunun kesri.
  const span = Math.hypot(255 - bgR, 255 - bgG, 255 - bgB);
  const soft = span * 0.5;

  for (let i = 0; i < p.length; i += 4) {
    const distance = Math.hypot(p[i] - bgR, p[i + 1] - bgG, p[i + 2] - bgB);
    const alpha = Math.max(0, Math.min(1, distance / soft));
    // Renk beyaza sabitleniyor: tasinan bilgi SEKIL, renk CSS'ten gelecek.
    p[i] = 255;
    p[i + 1] = 255;
    p[i + 2] = 255;
    p[i + 3] = Math.round(alpha * 255);
  }

  context.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const bytes = await readFile(SOURCE);
  const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;

  const encoded = await page.evaluate(cut, { dataUrl });
  const payload = encoded.split(",")[1];
  if (!payload) throw new Error("bos data URL dondu");

  const out = Buffer.from(payload, "base64");
  await mkdir("public/brand", { recursive: true });
  await writeFile(OUTPUT, out);

  console.log(`Marka isareti: ${SOURCE} -> ${OUTPUT}  ${out.length} byte`);
} finally {
  await browser.close();
}
