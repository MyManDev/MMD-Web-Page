import { type FocusEvent, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Deste davranisinin TEK kaydi: hidrasyon, reduced-motion okumasi ve kendiliginden
 * ilerleyen, etkilesimde duraklayan gezinme. design-spec.md §3.4
 *
 * Once hepsi PrincipleDeck'in icindeydi. Ekran goruntusu karuseli (§3.3.1) de
 * ayni davranisa gecebilsin diye buraya tasindi: iki kopya, bir gun birinde
 * duzeltilip digerinde unutulan bir hata demekti. Bugun karusel buradan yalnizca
 * `useHydrated`'i kullaniyor.
 *
 * "use client" YOK ve bu bilerek: dosyayi yalnizca client component'ler ve
 * Node'daki E2E import ediyor. Yonerge konsaydi, bir Server Component'in import
 * ettigi `AUTO_ADVANCE_MS` sayi olarak degil bir client referansi olarak
 * giderdi. Kancalar zaten yalnizca client component'lerden cagrilabilir.
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

/* Modul duzeyinde: `useSyncExternalStore` `subscribe`un kimligi degisince
   aboneligi bastan kuruyor. Satir icinde yazilsaydi her render'da kurulurdu. */
const subscribeToReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Reduced-motion'in JS okumasi. Gecisleri CSS kendisi kapatiyor (globals.css),
 * ama bir ZAMANLAYICI CSS ile ifade edilemez; otomatik gecisin durmasi icin
 * degerin burada okunmasi gerekiyor. Ayar degisirse (`change`) deger de
 * degisiyor. Sunucuda false.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Kendiliginden ilerleyen, etkilesimde duraklayan deste.
 *
 * OTOMATIK GECIS `AUTO_ADVANCE_MS`te bir. WCAG 2.2.2, kendiliginden baslayan ve
 * baska icerikle birlikte sunulan otomatik guncellemede durdurma, duraklatma,
 * gizleme ya da guncelleme sikligini denetleme yolu istiyor. Buradaki yol ETKILESIM: fare uzerine gelince veya
 * iceriye odak dusunce duruyor, etkilesim bitince kaldigi yerden devam ediyor.
 * Bu yolun kapsamadigi kullanicilar var; sinirlar design-spec.md §3.4'te.
 * `pauseOn` kapsayiciya yayilacak dort olay.
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
  /* Kac kez yer degistirildi - elle ya da kendiliginden. Degisime baglanan
     etkiler (karuselin daktilo yazisi) ilk render'i degisimden ayirmak icin
     buna bakiyor: 0 ise hic degisim olmadi. */
  const [steps, setSteps] = useState(0);
  /* Fare ve odak AYRI iki sebep. Tek bir bayrakta en son gelen olay kazaniyordu:
     fare ustteyken bir tusa tiklayip fareyi cekmek, odak iceride kaldigi halde
     desteyi yeniden baslatiyordu. Deste ikisinden biri surdukce duruyor. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  /* Baslangicta `true`: ilk render'da bolge canli, kullanici bir sey yapmadan
     once de oyle. Yalnizca otomatik ilerleme onu susturuyor. */
  const [announce, setAnnounce] = useState(true);

  const step = (delta: number) => {
    setIndex((current) => (current + delta + total) % total);
    setSteps((count) => count + 1);
  };

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
      setSteps((count) => count + 1);
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [hydrated, reducedMotion, paused, index, total]);

  /* Etkilesim BASLAYINCA: durakla ve bolgeyi yeniden canli yap. Ikincisi
     onemli - kullanici birazdan tusa basacak ve degisikligi duymali. */
  const onPointerEnter = () => {
    setHovered(true);
    setAnnounce(true);
  };
  const onFocus = () => {
    setFocused(true);
    setAnnounce(true);
  };
  /* Odak kapsayicinin ICINDE yer degistiriyorsa (bir tustan digerine) odak
     cikmis sayilmiyor: `relatedTarget` odagin gittigi oge. */
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setFocused(false);
  };

  return {
    hydrated,
    index,
    steps,
    step,
    announce,
    /* `onFocus`/`onBlur` React'te baloncuklaniyor, yani kapsayicida bunlar
       `focusin`/`focusout` gibi davraniyor - `:focus-within`in JS karsiligi.
       Klavye kullanicisi deste icine girdiginde duraklatiyor. */
    pauseOn: {
      onBlur,
      onFocus,
      onPointerEnter,
      onPointerLeave: () => setHovered(false),
    },
  };
}
