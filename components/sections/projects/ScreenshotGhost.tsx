import type { Project } from "@/content";
import { smallestScreenshot } from "@/lib/images";

/*
  Olculer karar sahibinin sectigi "2 · Orta" varyanti (design-spec.md §3.3.1):
  %12 opaklik, 6px bulaniklik, doygunluk %60, kenarlara dogru sonen radyal
  maske. Maske renksiz bir alfa - `var(--color-page)` yalnizca opak bir deger
  oldugu icin orada, rengi hicbir yerde gorunmuyor (CLAUDE.md kural 1).

  Kartin 48px disina tasiyor (`-inset-12`), maske kenari yumusattigi icin bir
  cerceve gibi okunmuyor.
*/
const LAYER =
  "pointer-events-none absolute -inset-12 -z-10 opacity-[.12] blur-[6px] saturate-[.6]" +
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
 * Susleme, bilgi degil: `aria-hidden`, goruntuler `alt=""`. En kucuk varyant
 * (896px) yetiyor, cunku 6px bulanik ve %12 opak; buyugunu indirmek bosa bant.
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
          src={smallestScreenshot(screenshot.src)}
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
