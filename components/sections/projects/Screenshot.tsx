import type { Project } from "@/content";
import { screenshotSrcSet } from "@/lib/images";
import { TypedCaption } from "./TypedCaption";

/**
 * Tek ekran goruntusu ve basligi. design-spec.md §3.3.1
 *
 * Kendi dosyasinda cunku iki yerden cagriliyor: tek goruntulu kart onu sunucu
 * component'inde basiyor, karusel her slaytta. `use client` YOK ve kanca da
 * yok; iki taraf da ayni figuru basiyor ve `sizes` tek yerde yasiyor.
 *
 * <figure> + <figcaption>: baslik goruntunun kendi basligi, yani figur onunla
 * adlaniyor. Cerceve (border, kose) yalnizca goruntunun etrafinda; baslik
 * cercevenin disinda, altinda.
 *
 * next/image DEGIL, duz <img> - ve bu olculerek secildi. design-spec.md
 * §3.3.1 once next/image yaziyordu; statik export + images.unoptimized
 * altinda ne optimizasyon ne srcset uretiyor, ama sayfaya 5.5 KiB client
 * JS ekliyor (132.1 -> 137.6 KiB). Payload kapisinin kalan payi o anda
 * 17.9 KiB'di: bedeli payin ucte biri, karsiligi sifir. architecture.md
 * §8 "esik yukseltilmez, asarsa geri donup azaltilir" diyor; burada esige
 * dayanmadan once azaltildi.
 *
 * srcset ELLE yaziliyor: next/image dusunce beraberinde srcset'i de
 * goturmustu ve o bosluk doldurulmadan kaldi (#33). Dosyalari
 * scripts/optimize-images.mjs uretiyor, genislikler lib/images.ts ile
 * ortak tek kayittan geliyor.
 *
 * sizes olculdu: lg ustunde gorsel 12 kolonun 7'si, yani kapsayici tam
 * genisligindeyken 883px (kapsayici 1600'e cikinca 717'den yukseldi).
 * 58vw bunu her zaman bir parca ASIYOR ve asmasi kasitli - eksik tahmin
 * bulanik goruntu demek, fazla tahmin birkac KB.
 *
 * `sizes` DISA AKTARILIYOR: hayalet arka plan (ScreenshotGhost.tsx) ayni srcset'i
 * ayni `sizes` ile istiyor, tarayici her cihazda ayni adayi seciyor ve dosya
 * onbellekten geliyor. Iki yerde ayri yazilsaydi biri degisince hayalet her
 * goruntuyu ikinci kez indirirdi.
 *
 * width/height en buyuk varyantin GERCEK olcusu (1792x1120) ve ayni zamanda
 * tasarimin 16/10 orani. Yeri fiilen ayiran sey CSS aspect kutusu; bu iki sayi
 * orani tarayiciya HTML'den de bildiriyor, boylece CLS esigi (< 0.05) goruntu
 * inmeden once de korunuyor. Semada boyut alani yok cunku oran her proje icin
 * ayni.
 */
export const SCREENSHOT_SIZES =
  "(min-width: 1600px) 883px, (min-width: 1024px) 58vw, calc(100vw - 40px)";

export function Screenshot({
  src,
  alt,
  caption,
  className = "",
  typing,
  onOpen,
}: Project["screenshots"][number] & {
  className?: string;
  onOpen?: () => void;
  /* Karuselden: slayt etkin mi ve karusel kac kez yer degistirdi. Yoksa baslik
     duz metin (tek goruntulu kart). */
  typing?: { active: boolean; steps: number };
}) {
  const captionClass =
    "font-sans text-body-s text-text-muted motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out";
  return (
    <figure className={`flex flex-col gap-3 ${className}`}>
      <a
        href={src}
        aria-label={`Enlarge screenshot: ${alt}`}
        onClick={
          onOpen
            ? (event) => {
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
                onOpen();
              }
            : undefined
        }
        className="pressable screenshot-open overflow-hidden rounded-card border border-border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- gerekce yukarida: olculmus 5.5 KiB */}
        <img
          src={src}
          srcSet={screenshotSrcSet(src)}
          sizes={SCREENSHOT_SIZES}
          alt={alt}
          width={1792}
          height={1120}
          loading="lazy"
          decoding="async"
          className="aspect-screenshot h-full w-full object-cover"
        />
        <span aria-hidden="true" className="screenshot-expand">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6" />
          </svg>
        </span>
      </a>
      {/* Kendi gecisi karusel icin: giden slaytin basligi beklemeden sonuyor
          (ScreenshotCarousel.tsx, SLOT). Tek goruntude hicbir sey tetiklemiyor. */}
      {typing ? (
        <TypedCaption
          className={captionClass}
          text={caption}
          active={typing.active}
          steps={typing.steps}
        />
      ) : (
        <figcaption className={captionClass}>{caption}</figcaption>
      )}
    </figure>
  );
}
