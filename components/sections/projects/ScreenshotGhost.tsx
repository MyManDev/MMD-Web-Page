import type { Project } from "@/content";
import { screenshotSrcSet } from "@/lib/images";
import { SCREENSHOT_SIZES } from "./Screenshot";

/*
  Olculer karar sahibinin sectigi "2 · Orta" varyanti (design-spec.md §3.3.1):
  %12 opaklik, 6px bulaniklik, doygunluk %60, kenarlara dogru sonen radyal
  maske. Maske renksiz bir alfa - `var(--color-page)` yalnizca opak bir deger
  oldugu icin orada, rengi hicbir yerde gorunmuyor (CLAUDE.md kural 1).

  Kartin yanlara 48px disina tasiyor, maske kenari yumusattigi icin bir cerceve
  gibi okunmuyor. Dikeyde lg altinda 40px: orada baslikla kart arasi da bolumun
  alt boslugu da 40px, ve 48px hayaleti basligin ve sonraki bolumun cizgisinin
  8px ustune bindiriyordu (incelemede olculdu). Maske goruntuyu kutuya kirptigi
  icin (`mask-clip: border-box`) bulanikligin yayilmasi da kutunun disina
  cikmiyor. Yatay tasmayi bolum kirpiyor (Projects.tsx).

  Yiginda (ikinci proje gelince, design-spec.md §3.3.2) sonraki kartin hayaleti
  onceki kartin alt kenarina biniyor; yigin zaten sonraki karti oncekinin ustune
  bindiriyor, yani bu yiginin kendi hareketi. Duz listede (reduced-motion)
  kartlar arasinda bosluk var (Projects.tsx).
*/
const LAYER =
  "pointer-events-none absolute -inset-x-12 -inset-y-10 -z-10 opacity-[.12] blur-[6px] saturate-[.6] lg:-inset-y-12" +
  " [mask-image:radial-gradient(ellipse_85%_80%_at_50%_50%,var(--color-page)_50%,transparent_100%)]";

/* Karuselle ayni sure (ScreenshotCarousel.tsx, SLOT). Soluk ve bulanik oldugu
   icin burada simetrik sonumleme yeterli; ust uste binen iki hayalet okunmuyor. */
const IMAGE =
  "absolute inset-0 h-full w-full object-cover object-top opacity-0 data-active:opacity-100" +
  " motion-safe:transition-opacity motion-safe:duration-900 motion-safe:ease-out";

/**
 * Hayalet arka plan: o an etkin olan ekran goruntusunun soluk, bulanik kopyasi
 * kartin arkasinda. design-spec.md §3.3.1. Karar sahibinin istegi: "her proje
 * icin resim koyacagiz, o resimler hayalet ekran olsun arkaya, resim gectiginde
 * hayalet arka plan da degissin".
 *
 * Kartin (`article`) DOGRUDAN cocugu olarak basilmali, karuselin icinde degil:
 * karuselin koku giris animasyonunda `translate` tasiyor ve `translate` tasiyan
 * bir oge, mutlak konumlu torunlarinin referans kutusu olur - hayalet kart
 * yerine karuseli kaplardi. Kart `relative isolate`; hayalet `-z-10` ile icerigin
 * arkasinda, bolumun zemininin onunde.
 *
 * Susleme, bilgi degil: `aria-hidden`, goruntuler `alt=""`.
 *
 * KARUSELLE AYNI `srcset` VE `sizes` (Screenshot.tsx): tarayici ayni adayi
 * seciyor ve dosyayi onbellekten aliyor, hayalet ek indirme getirmiyor. Once
 * sabit en kucuk varyant (896px) isteniyordu; yuksek DPR'de karusel 1792'yi
 * sectigi icin hayalet her goruntuyu ikinci kez indiriyordu (Pixel 7'de uc
 * dosya, 123 KB; incelemede olculdu).
 *
 * `use client` YOK: tek goruntulu kart onu sunucuda basiyor, karusel etkin
 * indeksi vererek istemcide.
 */
export function ScreenshotGhost({
  screenshots,
  index,
}: {
  screenshots: Project["screenshots"];
  index: number;
}) {
  return (
    <div aria-hidden="true" className={LAYER} data-ghost="">
      {screenshots.map((screenshot, slot) => (
        /* eslint-disable-next-line @next/next/no-img-element -- Screenshot.tsx'teki gerekce: olculmus 5.5 KiB */
        <img
          key={screenshot.src}
          src={screenshot.src}
          srcSet={screenshotSrcSet(screenshot.src)}
          sizes={SCREENSHOT_SIZES}
          alt=""
          loading="lazy"
          decoding="async"
          data-active={slot === index ? "" : undefined}
          className={IMAGE}
        />
      ))}
    </div>
  );
}
