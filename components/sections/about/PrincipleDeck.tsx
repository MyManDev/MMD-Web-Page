"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * Prensip destesi. design-spec.md §3.4
 *
 * Prensipler tek tek gosterilir ve kullanici ileri/geri tuslariyla gezer.
 * Onceki bicim (#56) bunu scroll'a pinlenmis bir dizi olarak yapiyordu; o
 * bicim manifestoyu ekrandan atiyor ve bolumu bos gosteriyordu. Simdi ikisi
 * ayni ekranda: manifesto solda, deste sagda.
 *
 * ILERLEME BIR KATMAN, TASIYICI DEGIL. Sunucuda `enhanced` false ve bileşen
 * BES PRENSIBI DE duz liste olarak basiyor - tuslar yok, hepsi okunur. `enhanced`
 * ancak mount'tan sonra true oluyor. Yani JS hic gelmezse veya hidrasyon
 * duserse sayfada eksik icerik kalmiyor; kaybedilen yalnizca gezinme.
 *
 * Tersini yazmak (sunucuda tek prensip, gerisini JS acar) bes cumlenin dordunu
 * JS'e rehin verirdi. Ayni gerekce BioTypewriter'da da yazili: gizleyen taraf
 * gelmeyebilecek olan taraf olmali.
 *
 * `useState(false)` + `useEffect` hidrasyon uyusmazligini de onluyor: ilk
 * render sunucununkiyle birebir ayni, degisiklik ikinci render'da geliyor.
 *
 * Basa saran gezinme (5'ten sonra 1): sonu olan bir gezinmede son tus devre
 * disi kalir ve odak bosa duser. Bes ogede sarma yonunu kaybettirmiyor, sayac
 * konumu zaten soyluyor.
 */
export function PrincipleDeck({ principles }: { principles: readonly string[] }) {
  /*
    Hidrasyon olup olmadigini `useSyncExternalStore` soyluyor: sunucu anlik
    goruntusu false, istemcininki true. Once `useEffect` icinde setState
    yaziliyordu; `react-hooks/set-state-in-effect` onu hakli olarak reddetti -
    o bicim fazladan bir render turu tetikliyor. Bu kanca React'in bu is icin
    verdigi arac ve tek render'da cozuluyor.

    `subscribe` bos: abone olunacak bir sey yok, deger mount'tan sonra bir daha
    degismiyor.
  */
  const enhanced = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [index, setIndex] = useState(0);

  const total = principles.length;
  const pad = (value: number) => String(value).padStart(2, "0");
  const step = (delta: number) => setIndex((current) => (current + delta + total) % total);

  /*
    Etiket UYDURULMUS MARKA METNI DEGIL: alanin `content/site.ts`'teki adi
    zaten `principles`. Gorunur bir baslik yazmak yeni bir marka cumlesi
    yazmak olurdu (CLAUDE.md kural 5), o yuzden yalnizca erisilebilir ad.
  */
  const label = "Principles";

  if (!enhanced) {
    return (
      <ul
        aria-label={label}
        className="flex max-w-prose list-disc flex-col gap-3 pl-5 font-sans text-body text-text-muted marker:text-text-muted lg:text-body-lg"
      >
        {principles.map((principle) => (
          <li key={principle}>{principle}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      aria-label={label}
      aria-roledescription="carousel"
      className="flex flex-col gap-6"
      role="group"
    >
      {/*
        `aria-live="polite"`: tusa basildiginda odak tusta kaliyor, yani degisen
        metin kendiliginden duyulmaz. Canli bolge olmadan ekran okuyucu
        kullanicisi tusun bir sey yaptigini anlamaz.
      */}
      {/*
        BES PRENSIP DE basiliyor ve hepsi ayni izgara hucresinde ust uste
        duruyor; yalnizca aktif olan gorunur. Sebep olculdu: once tek prensip
        basiliyordu ve kap yuksekligi prensibin uzunluguyla degisiyordu - iki
        satirdan uc satira gecerken TUSLAR ASAGI KAYIYORDU. Testte ard arda
        tiklamalarin biri bosa dustu; gercek kullanicida ayni sey "tusa bastim,
        bir sey olmadi" olur.

        Ust uste yigmak kap yuksekligini EN UZUN prensibe sabitliyor, yani
        gezinirken hicbir sey oynamiyor.

        Gorunmeyenler `visibility: hidden`: `display: none` yuksekligi de
        goturur ve sorun geri gelirdi; `opacity: 0` ise ogeyi erisilebilirlik
        agacinda ve odak sirasinda BIRAKIRDI. `visibility` ikisini de cozuyor.

        `key` prensip metni - indeks DEGIL. Indeks olsaydi React her adimda
        ayni dugumu geri kullanip animasyonu tetiklemezdi.
      */}
      <div aria-live="polite" className="principle-stage">
        {principles.map((principle, slot) => (
          <p
            key={principle}
            className="principle-slot max-w-statement font-mono text-display-m font-medium text-balance lg:text-display-l-lg"
            data-active={slot === index ? "" : undefined}
          >
            {principle}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <p className="font-mono text-mono text-text-muted tabular-nums">
          <span className="text-text">{pad(index + 1)}</span> / {pad(total)}
        </p>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous principle"
            className="deck-button"
            onClick={() => step(-1)}
            type="button"
          >
            <Arrow direction="left" />
          </button>
          <button
            aria-label="Next principle"
            className="deck-button"
            onClick={() => step(1)}
            type="button"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

/*
  Ikon inline SVG: tek bir ok icin bir ikon paketi eklemek CLAUDE.md kural 4'e
  gore gerekcesi yazilamayacak bir bagimlilik olurdu. `aria-hidden` cunku
  erisilebilir ad zaten tusun uzerinde.
*/
function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : undefined}
      fill="none"
      height="16"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
      width="16"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
