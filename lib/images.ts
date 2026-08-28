import kinds from "./image-widths.json";

/**
 * Servis edilen gorsel genisliklerinin TEK kaydi.
 *
 * Liste neden JSON'da: `scripts/optimize-images.mjs` ayni degerleri okumak
 * zorunda ve node bir .ts modulunu import edemiyor. Sayilari iki yere yazmak
 * yerine iki taraf da ayni dosyayi okuyor - dosyalar bir genislikte uretilip
 * srcset baska bir genislikten bahsedemez.
 *
 * Degerler olculdu, secilmedi. Kapsayici 1600px, yatay padding 32px, yani
 * ic genislik 1536px:
 *
 *   screenshot  12 kolonun 7'si = (1536-11*32)/12*7 + 6*32 = 883px
 *               -> 1x icin 896, 2x icin 1792
 *   portrait    3 kolonun 1'i   = (1536-2*32)/3          = 491px
 *               -> 1x icin 500, 2x icin 1000
 *
 * Her genislik kendi en-boy oranina tam bolunuyor; yarim piksel yok
 * (896x560, 1792x1120, 500x800, 1000x1600).
 *
 * Kaynaklar servis EDILMIYOR: assets/ altinda duruyorlar ve hicbir cihazin
 * ihtiyaci olmayan boyutlardalar.
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
