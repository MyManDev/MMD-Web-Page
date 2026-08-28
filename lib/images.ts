import widthsFile from "./screenshot-widths.json";

/**
 * Ekran goruntusu genisliklerinin TEK kaydi.
 *
 * Liste neden JSON'da: `scripts/optimize-images.mjs` ayni degerleri okumak
 * zorunda ve node bir .ts modulunu import edemiyor. Sayilari iki yere yazmak
 * yerine iki taraf da ayni JSON'u okuyor - dosyalar bir genislikte uretilip
 * srcset baska bir genislikten bahsedemez.
 *
 * Degerler olculdu, secilmedi. lg ustunde gorsel kutusu 12 kolonluk izgaranin
 * 7 kolonu: (1320 - 64 - 11*32) / 12 * 7 + 6*32 = 717px. Yani 1x icin 720,
 * 2x icin 1440 yetiyor; 390px'lik bir telefonda 3x bile 1050px istiyor ve
 * 1440 onu da karsiliyor. Kaynak 2360 piksel genisliginde ve hicbir cihazin
 * ihtiyaci degil - servis edilmiyor, assets/screenshots/ altinda kaynak olarak
 * duruyor.
 *
 * Ikisi de 16/10'a tam bolunuyor (720x450, 1440x900); yarim piksel yok.
 */
export const SCREENSHOT_WIDTHS: readonly number[] = widthsFile.widths;

/** `/projects/isim-1440.webp` -> `/projects/isim` */
const BASE = /^(.*)-\d+\.webp$/;

/**
 * Icerikteki tek yoldan srcset kurar. Dosya adlari sozlesme: `<taban>-<genislik>.webp`,
 * ve script tam olarak bu adlari uretiyor.
 *
 * Yol sozlesmeye uymuyorsa SESSIZCE bos donmez, patlar. Bos bir srcset,
 * tarayicinin src'ye dusmesi demek - yani hata gorunmez olur ve herkes tam
 * boyutlu dosyayi indirir. Sunucu component'inde atilan hata `pnpm build`'i
 * dusurur; istenen de bu (docs/architecture.md §5).
 */
export function screenshotSrcSet(src: string): string {
  const match = BASE.exec(src);
  if (!match?.[1]) {
    throw new Error(
      `Ekran goruntusu yolu <taban>-<genislik>.webp bicimine uymuyor: ${src}. ` +
        `Dosyalari scripts/optimize-images.mjs uretir.`,
    );
  }

  const base = match[1];
  return SCREENSHOT_WIDTHS.map((width) => `${base}-${width}.webp ${width}w`).join(", ");
}
