import kinds from "./image-widths.json";

/**
 * Servis edilen gorsel genisliklerinin TEK kaydi.
 *
 * Liste neden JSON'da: `scripts/optimize-images.mjs` ayni degerleri okumak
 * zorunda ve node bir .ts modulunu import edemiyor. Sayilari iki yere yazmak
 * yerine iki taraf da ayni dosyayi okuyor - dosyalar bir genislikte uretilip
 * srcset baska bir genislikten bahsedemez.
 *
 * Degerler olculdu, secilmedi:
 *   screenshot  lg ustunde 12 kolonun 7'si = 638px -> 1x icin 720, 2x icin 1440
 *   portrait    lg ustunde 3 kolonun 1'i  = 350px -> 1x icin 360, 2x icin 720
 * Her genislik kendi en-boy oranina tam bolunuyor; yarim piksel yok.
 */
export const SCREENSHOT_WIDTHS: readonly number[] = kinds.screenshot.widths;
export const PORTRAIT_WIDTHS: readonly number[] = kinds.portrait.widths;

/** `/people/isim-720.webp` -> `/people/isim` */
const BASE = /^(.*)-\d+\.webp$/;

/**
 * Icerikteki tek yoldan srcset kurar. Dosya adlari sozlesme:
 * `<taban>-<genislik>.webp`, ve script tam olarak bu adlari uretiyor.
 *
 * Yol sozlesmeye uymuyorsa SESSIZCE bos donmez, patlar. Bos bir srcset,
 * tarayicinin src'ye dusmesi demek - yani hata gorunmez olur ve herkes tam
 * boyutlu dosyayi indirir. Sunucu component'inde atilan hata `pnpm build`'i
 * dusurur; istenen de bu (docs/architecture.md §5).
 */
function srcSet(src: string, widths: readonly number[]): string {
  const match = BASE.exec(src);
  if (!match?.[1]) {
    throw new Error(
      `Gorsel yolu <taban>-<genislik>.webp bicimine uymuyor: ${src}. ` +
        `Dosyalari scripts/optimize-images.mjs uretir.`,
    );
  }

  const base = match[1];
  return widths.map((width) => `${base}-${width}.webp ${width}w`).join(", ");
}

export const screenshotSrcSet = (src: string) => srcSet(src, SCREENSHOT_WIDTHS);
export const portraitSrcSet = (src: string) => srcSet(src, PORTRAIT_WIDTHS);
