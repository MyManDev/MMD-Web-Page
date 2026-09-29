"use client";

import type { CSSProperties } from "react";

import { ArrowIcon } from "@/components/ui";
import { useAutoAdvancingDeck } from "@/lib/deck";

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
 * GEZINME lib/deck.ts'te: basa saran ileri/geri, `AUTO_ADVANCE_MS`te bir
 * otomatik gecis, etkilesimde duraklama, reduced-motion altinda durma ve otomatik
 * geciste susan canli bolge. Davranisin gerekcesi orada, bir kez yazili.
 *
 * GECIS KELIME KELIME BELIRME ve tamami CSS'te (`RevealedPrinciple`). Daktilo
 * denendi ve fazla sade okundu; kaldirildi.
 */
export function PrincipleDeck({ principles }: { principles: readonly string[] }) {
  const total = principles.length;
  const { hydrated: enhanced, index, step, announce, pauseOn } = useAutoAdvancingDeck(total);
  const pad = (value: number) => String(value).padStart(2, "0");

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
      {...pauseOn}
    >
      {/*
        Canli bolge KOSULLU. `polite` oldugunda: tusa basildiginda odak tusta
        kaliyor, yani degisen metin kendiliginden duyulmaz - canli bolge olmadan
        ekran okuyucu kullanicisi tusun bir sey yaptigini anlamaz. Otomatik
        geciste neden sustugu lib/deck.ts'te.
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
            <ArrowIcon direction="left" />
          </button>
          <button
            aria-label="Next principle"
            className="deck-button"
            onClick={() => step(1)}
            type="button"
          >
            <ArrowIcon direction="right" />
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
