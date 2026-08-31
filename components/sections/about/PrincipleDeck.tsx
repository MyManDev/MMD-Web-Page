"use client";

import { type CSSProperties, useEffect, useState, useSyncExternalStore } from "react";

/*
  Aralik DISA AKTARILIYOR cunku testin "o gunku sayiyi" tekrar yazmasi bir
  kusurdur - beklenen deger turetilebiliyorsa turetilir. E2E bu sabiti import
  edip bekleme suresini ondan hesapliyor.
*/
export const AUTO_ADVANCE_MS = 7000;

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
 *
 * OTOMATIK GECIS. Deste 7 saniyede bir kendiliginden ilerliyor. WCAG 2.2.2
 * kendiliginden baslayan ve bes saniyeden uzun suren otomatik guncellemede bir
 * duraklatma mekanizmasi istiyor; buradaki mekanizma ETKILESIM: fare uzerine
 * gelince veya iceriye odak dusunce duruyor, etkilesim bitince kaldigi yerden
 * devam ediyor. Gorunur yeni bir tus eklenmedi - design-spec.md §3.4'te olmayan
 * bir kontrol tasarim karari olurdu.
 *
 * `prefers-reduced-motion` acikken otomatik gecis HIC calismiyor. Bu ayni
 * zamanda tiklayan E2E testlerini deterministik tutuyor: onlar zaten
 * reduced-motion altinda kosuyor, yani zamanlayici oraya hic girmiyor.
 *
 * GECIS KELIME KELIME BELIRME ve tamami CSS'te (`RevealedPrinciple`). Daktilo
 * denendi ve fazla sade okundu; kaldirildi.
 *
 * CANLI BOLGE OTOMATIK GECISTE SUSUYOR. `aria-live="polite"` her degisikligi
 * duyurursa ekran okuyucu kullanicisi yedi saniyede bir, istemedigi halde
 * sozunun kesildigini yasar. Bu yuzden otomatik ilerleme `aria-live="off"`
 * yaziyor; kullanici etkilesimi (odak veya fare) bolgeyi yeniden `polite`
 * yapiyor. Sira onemli ve tesadufi degil: odak olayi tiklamadan ONCE geliyor
 * (mousedown -> focus -> click), yani tusa basildigi commit'te bolge zaten
 * canli. Ikisini ayni commit'te degistirmek gerekmiyor.
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
  /*
    Reduced-motion CSS'te tek yerde ele aliniyor (globals.css), ama bir
    ZAMANLAYICI CSS ile ifade edilemez - bu yuzden burada ikinci bir okuma var.
    Ayni kanca, ayni gerekce: tek render, hidrasyon uyusmazligi yok.
  */
  const reducedMotion = useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /* Baslangicta `true`: ilk render'da bolge canli, kullanici bir sey yapmadan
     once de oyle. Yalnizca otomatik ilerleme onu susturuyor. */
  const [announce, setAnnounce] = useState(true);

  const total = principles.length;
  const pad = (value: number) => String(value).padStart(2, "0");
  const step = (delta: number) => setIndex((current) => (current + delta + total) % total);

  /*
    `index` bagimlilikta: her degisiklikten sonra zamanlayici bastan kuruluyor.
    Yani kullanici ileri tusuna bastiginda yedi saniye sifirdan sayiliyor -
    tusa basip yarim saniye sonra kendiliginden atlamasi olmuyor.

    `setInterval` DEGIL `setTimeout`: aralik degil tek adim kuruluyor ve her
    adimdan sonra yeniden. Interval, duraklatma sirasinda gecen sureyi
    biriktirip birden fazla atlama uretebilir.
  */
  useEffect(() => {
    if (!enhanced || reducedMotion || paused) return;

    const timer = setTimeout(() => {
      setAnnounce(false);
      /* Fonksiyonel guncelleyici DEGIL: `index` boylece gercekten bir
         bagimlilik oluyor ve `exhaustive-deps` onu gereksiz gormuyor. */
      setIndex((index + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [enhanced, reducedMotion, paused, index, total]);

  /* Etkilesim BASLAYINCA: durakla ve bolgeyi yeniden canli yap. Ikincisi
     onemli - kullanici birazdan tusa basacak ve degisikligi duymali. */
  const hold = () => {
    setPaused(true);
    setAnnounce(true);
  };
  const release = () => setPaused(false);

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
      /* `onFocus`/`onBlur` React'te baloncuklaniyor, yani bunlar kapsayici
         icin `focusin`/`focusout` gibi davraniyor - `:focus-within`in JS
         karsiligi. Klavye kullanicisi deste icine girdiginde duraklatiyor. */
      onBlur={release}
      onFocus={hold}
      onPointerEnter={hold}
      onPointerLeave={release}
      role="group"
    >
      {/*
        Canli bolge KOSULLU. `polite` oldugunda: tusa basildiginda odak tusta
        kaliyor, yani degisen metin kendiliginden duyulmaz - canli bolge olmadan
        ekran okuyucu kullanicisi tusun bir sey yaptigini anlamaz.

        `off` oldugunda: gecis otomatikti ve kimse bir sey istememisti. Yedi
        saniyede bir sozu kesmek, tusun ne yaptigini soylemekle ayni sey degil.
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
      <div aria-live={announce ? "polite" : "off"} className="principle-stage">
        {principles.map((principle, slot) => (
          <RevealedPrinciple
            key={principle}
            active={slot === index}
            className="principle-slot max-w-statement font-mono text-display-m font-medium text-balance lg:text-display-l-lg"
            text={principle}
          />
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

/**
 * Prensip KELIME KELIME beliriyor. design-spec.md §6
 *
 * Once harf harf yaziliyordu (daktilo, ~28ms/harf) ve fazla sade okundu. Simdi
 * her kelime sirayla, hafif yukselerek ve netleserek geliyor.
 *
 * EFEKT SAF CSS, SIFIR JS. Kademeyi `--word` ozel ozelligi tasiyor ve
 * animasyonu `.principle-slot[data-active] > span` kurali calistiriyor. Bu
 * secim onemli: oge kurala UYMAYA BASLADIGI anda animasyon bastan basliyor,
 * yani `data-active` her el degistirdiginde giris kendiliginden yeniden
 * tetikleniyor. Daktiloda bunun icin bir zamanlayici, bir `useEffect` ve bir
 * `matchMedia` okumasi gerekiyordu; hicbiri kalmadi.
 *
 * `prefers-reduced-motion` da bedelsiz cozuluyor: evrensel blok
 * `animation-name: none` uyguluyor ve keyframe yalnizca `from` tanimladigi
 * icin kelimeler dinlenme haline - yani tam gorunur haline - donuyor.
 *
 * ERISILEBILIRLIK: metin DOM'da her zaman TAM ve gizleme yalnizca `opacity`
 * ile. Kelimeler erisilebilirlik agacinda kaliyor, canli bolge kelime kelime
 * konusmuyor, ekran okuyucu yarim cumle duymuyor.
 *
 * Bosluk span'in ICINDE: disarida birakmak JSX'te bosluk kaybina acik ve
 * satir sonu hesabini bozar. Icinde kalinca satir kirilmasi degismiyor.
 */
function RevealedPrinciple({
  active,
  className,
  text,
}: {
  active: boolean;
  className?: string;
  text: string;
}) {
  const words = text.split(" ");

  return (
    <p className={className} data-active={active ? "" : undefined}>
      {words.map((word, position) => (
        <span
          // Sabit bir dizinin sabit sirasi; index burada kararli bir key.
          key={position}
          style={{ "--word": position } as CSSProperties}
        >
          {position < words.length - 1 ? `${word} ` : word}
        </span>
      ))}
    </p>
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
