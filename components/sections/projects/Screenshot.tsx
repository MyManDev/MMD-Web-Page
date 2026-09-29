import type { Project } from "@/content";
import { screenshotSrcSet } from "@/lib/images";

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
 * width/height en buyuk varyantin GERCEK olcusu (1792x1120) ve ayni zamanda
 * tasarimin 16/10 orani. Yeri fiilen ayiran sey CSS aspect kutusu; bu iki sayi
 * orani tarayiciya HTML'den de bildiriyor, boylece CLS esigi (< 0.05) goruntu
 * inmeden once de korunuyor. Semada boyut alani yok cunku oran her proje icin
 * ayni.
 */
export function Screenshot({
  src,
  alt,
  caption,
  className = "",
}: Project["screenshots"][number] & { className?: string }) {
  return (
    <figure className={`flex flex-col gap-3 ${className}`}>
      <div className="overflow-hidden rounded-card border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element -- gerekce yukarida: olculmus 5.5 KiB */}
        <img
          src={src}
          srcSet={screenshotSrcSet(src)}
          sizes="(min-width: 1600px) 883px, (min-width: 1024px) 58vw, calc(100vw - 40px)"
          alt={alt}
          width={1792}
          height={1120}
          loading="lazy"
          decoding="async"
          className="aspect-screenshot h-full w-full object-cover"
        />
      </div>
      <figcaption className="font-sans text-body-s text-text-muted">{caption}</figcaption>
    </figure>
  );
}
