import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Deste davranisinin TEK kaydi: hidrasyon, reduced-motion okumasi ve kendiliginden
 * ilerleyen, etkilesimde duraklayan gezinme. design-spec.md §3.4
 *
 * Once hepsi PrincipleDeck'in icindeydi. Ekran goruntusu karuseli (§3.3.1) ayni
 * davranisi isteyince buraya tasindi: iki kopya, bir gun birinde duzeltilip
 * digerinde unutulan bir hata demekti. Kancalar yalnizca client component'lerden
 * cagriliyor; bu dosya kendisi "use client" degil, cunku JSX tasimiyor.
 */

/*
  Aralik DISA AKTARILIYOR cunku testin "o gunku sayiyi" tekrar yazmasi bir
  kusurdur - beklenen deger turetilebiliyorsa turetilir. E2E bu sabiti import
  edip bekleme suresini ondan hesapliyor.
*/
export const AUTO_ADVANCE_MS = 7000;

const noSubscription = () => () => {};

/**
 * Hidrasyon oldu mu. Sunucunun anlik goruntusu false, istemcininki true.
 *
 * Once `useEffect` icinde setState yaziliyordu ve `react-hooks/set-state-in-effect`
 * onu reddetti. Bu kanca React'in dis bir degeri okumak icin verdigi arac.
 * Hidrasyon sunucunun degeriyle (false) yapiliyor, yani uyusmazlik yok; React
 * hemen ardindan istemcinin degeriyle (true) ikinci bir render yapiyor.
 *
 * `subscribe` bos: abone olunacak bir sey yok, deger mount'tan sonra bir daha
 * degismiyor.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Reduced-motion CSS'te tek yerde ele aliniyor (globals.css), ama bir
 * ZAMANLAYICI CSS ile ifade edilemez - bu yuzden burada ikinci bir okuma var.
 * Ayar degisirse (`change`) deger de degisiyor. Sunucuda false.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Kendiliginden ilerleyen, etkilesimde duraklayan deste.
 *
 * OTOMATIK GECIS `AUTO_ADVANCE_MS`te bir. WCAG 2.2.2 kendiliginden baslayan ve
 * bes saniyeden uzun suren otomatik guncellemede bir duraklatma mekanizmasi
 * istiyor; buradaki mekanizma ETKILESIM: fare uzerine gelince veya iceriye odak
 * dusunce duruyor, etkilesim bitince kaldigi yerden devam ediyor. `pauseOn`
 * kapsayiciya yayilacak dort olay.
 *
 * `prefers-reduced-motion` acikken ve hidrasyondan once otomatik gecis HIC
 * calismiyor. Ilki ayni zamanda tiklayan E2E testlerini deterministik tutuyor:
 * onlar reduced-motion altinda kosuyor, yani zamanlayici oraya hic girmiyor.
 *
 * CANLI BOLGE OTOMATIK GECISTE SUSUYOR. `aria-live="polite"` her degisikligi
 * duyurursa ekran okuyucu kullanicisi her aralikta, istemedigi halde
 * sozunun kesildigini yasar. Bu yuzden otomatik ilerleme `announce`u false
 * yapiyor; kullanici etkilesimi (odak veya fare) onu yeniden true yapiyor. Sira
 * onemli ve tesadufi degil: odak olayi tiklamadan ONCE geliyor
 * (mousedown -> focus -> click), yani tusa basildigi commit'te bolge zaten
 * canli.
 *
 * Basa saran gezinme (sondan sonra ilk): sonu olan bir gezinmede son tus devre
 * disi kalir ve odak bosa duser. Sayac konumu zaten soyluyor.
 */
export function useAutoAdvancingDeck(total: number) {
  const hydrated = useHydrated();
  const reducedMotion = usePrefersReducedMotion();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /* Baslangicta `true`: ilk render'da bolge canli, kullanici bir sey yapmadan
     once de oyle. Yalnizca otomatik ilerleme onu susturuyor. */
  const [announce, setAnnounce] = useState(true);

  const step = (delta: number) => setIndex((current) => (current + delta + total) % total);

  /*
    `index` bagimlilikta: her degisiklikten sonra zamanlayici bastan kuruluyor.
    Yani kullanici ileri tusuna bastiginda sure sifirdan sayiliyor - tusa basip
    yarim saniye sonra kendiliginden atlamasi olmuyor.

    `setInterval` DEGIL `setTimeout`: aralik degil tek adim kuruluyor ve her
    adimdan sonra yeniden. Interval, duraklatma sirasinda gecen sureyi
    biriktirip birden fazla atlama uretebilir.
  */
  useEffect(() => {
    if (!hydrated || reducedMotion || paused) return;

    const timer = setTimeout(() => {
      setAnnounce(false);
      /* Fonksiyonel guncelleyici DEGIL: `index` boylece gercekten bir
         bagimlilik oluyor ve `exhaustive-deps` onu gereksiz gormuyor. */
      setIndex((index + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [hydrated, reducedMotion, paused, index, total]);

  /* Etkilesim BASLAYINCA: durakla ve bolgeyi yeniden canli yap. Ikincisi
     onemli - kullanici birazdan tusa basacak ve degisikligi duymali. */
  const hold = () => {
    setPaused(true);
    setAnnounce(true);
  };
  const release = () => setPaused(false);

  return {
    hydrated,
    index,
    step,
    announce,
    /* `onFocus`/`onBlur` React'te baloncuklaniyor, yani kapsayicida bunlar
       `focusin`/`focusout` gibi davraniyor - `:focus-within`in JS karsiligi.
       Klavye kullanicisi deste icine girdiginde duraklatiyor. */
    pauseOn: {
      onBlur: release,
      onFocus: hold,
      onPointerEnter: hold,
      onPointerLeave: release,
    },
  };
}
