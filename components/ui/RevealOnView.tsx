"use client";

import { useEffect } from "react";

/**
 * Metin bloklari ekrana girdiginde belirir. design-spec.md §6
 *
 * NEDEN `IntersectionObserver` VE NEDEN CSS YETMEDI. Once `animation-timeline:
 * view()` ile yazildi ve o hareket scroll KONUMUNA baglidir: scroll durunca
 * animasyon da donuyor, hizli kaydirinca atliyor. Olculdu ve "hicbir degisiklik
 * fark etmedim" geri bildirimi bununla geldi. Referans alinan davranis
 * (zaffiro-tambe.framer.website) ise ZAMANA bagli: oge gorunur oldugu an
 * animasyon basliyor ve kendi suresinde bitiyor. Bunu CSS ile yazmanin yolu yok.
 *
 * `CLAUDE.md` kural 3 bu yuzden genisletildi: `IntersectionObserver` artik iki
 * yerde - aktif nav linki ve burasi. Ikisi de TEK yerde tanimli, ve hicbiri
 * scroll listener degil.
 *
 * GIZLEME KARARI CSS'TE, BURADA DEGIL. Bu dosyanin yaptigi tek sey isaret
 * koymak: `<html>` uzerine `data-reveal` ("JS burada ve hareket isteniyor"),
 * sonra her ogeye `data-reveal-shown` ("bu gorundu"). Gizleyen kural
 * `globals.css`'te ve yalnizca ilk isaretin altinda calisiyor. Sonuc:
 *
 *   JS gelmezse       isaret hic konmaz -> butun metin gorunur
 *   reduced-motion    erken donulur     -> isaret konmaz -> gorunur
 *   observer duserse  cleanup isareti kaldirir -> gorunur
 *
 * Tersi yazilsaydi (CSS gizler, JS gosterir) JS'in gelmedigi bir sayfada metin
 * gorunmez kalirdi. Ayni gerekce `BioTypewriter`'da da yazili.
 *
 * ILK BOYAMADAN ONCE ISARET KONMUYOR ve bu olcumle alinmis bir karar. Once
 * `app/layout.tsx`'e satir ici bir script koyup isareti ilk boyamadan once
 * koymayi denedim - flash'i onluyordu ama iki bedeli vardi:
 *
 *   1. Metin HIDRASYONA KADAR gizli kaliyor. Olculdu: bu ortamda ~1.5s. JS
 *      yavas gelirse sayfa o kadar sure bos gorunur.
 *   2. Hero'nun `h1`'i sayfanin LCP ogesi. Onu JS gelene kadar gizlemek LCP'yi
 *      dogrudan bozar - ve LCP zaten acik bir issue (#83).
 *
 * Bu yuzden HERO BU MEKANIZMAYI KULLANMIYOR: onun girisi saf CSS
 * (`reveal-on-load`), ilk boyamada basliyor ve JS'e hic bagli degil. Observer
 * yalnizca ekran ALTINDAKI metni yonetiyor - o ogeler isaret kondugunda
 * ekranda olmadigi icin gizlenmeleri hicbir seyi kirpmiyor.
 *
 * Yan fayda: failsafe'e de gerek kalmadi. JS hic gelmezse isaret hic konmaz ve
 * butun metin gorunur kalir; bir zaman asimiyla kendini kurtarmaya calisan bir
 * kod yok.
 */

/**
 * Kademe tavani. Kademenin suresi globals.css'te
 * (`.reveal-on-enter[data-reveal-shown]`). Bir bolumde on iki blok birden
 * gorunur olursa on ikinci 990ms bekler ve bu artik kademe degil gecikme olur.
 */
const STAGGER_CAP = 5;

export function RevealOnView() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    /* Isaret burada, mount aninda konuyor (ilk boyamadan once DEGIL -
       yukaridaki gerekce). */
    root.dataset.reveal = "";

    const observer = new IntersectionObserver(
      (entries) => {
        /* SIRALAMA SART: `entries` belge sirasinda gelmiyor. Siralanmazsa
           ayni karede giren bloklar (or. kartin metin bloklari) rastgele bir
           sirayla belirirdi. */
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) =>
            a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );

        arriving.forEach((entry, order) => {
          const element = entry.target as HTMLElement;
          element.style.setProperty("--reveal", String(Math.min(order, STAGGER_CAP)));
          element.dataset.revealShown = "";
          /* Bir kez oynar. Aksi halde her geri donuste tekrar oynardi ve okuma
             sirasinda yukari kaydiran biri ayni metni yeniden "gelirken"
             gorurdu. */
          observer.unobserve(element);
        });
      },
      {
        /*
          `rootMargin` SIFIR ve bu bir hata duzeltmesi. Once `0px 0px -12% 0px`
          yaziyordu: amac ogenin ekranin en altinda degil gorulebilir bir yerde
          baslamasi. Sonuc bir OLU BOLGE oldu.

          Negatif bir alt marj koku alttan kisiyor, yani BELGENIN SON %12'SINDEKI
          hicbir oge hic kesismiyor - sayfa sonuna kadar kaydirilsa bile. O
          ogeler `data-reveal-shown` almiyor ve gizleyen kural sonsuza kadar
          uygulaniyor.

          Olculdu, canli sitede: 1600x900'de footer'in uc metin blogu da
          `opacity: 0.00`, `top >= 800`. Mobilde ilk satir seridin ustune
          dustugu icin gorunuyordu, diger ikisi orada da gizliydi. Yani icerik
          KAYBOLMUSTU ve bunu bir test yakalamadi.

          Negatif alt marjin HER degeri bu bolgeyi yaratir - `-60px` de. Tek
          guvenli deger sifir. "Gorulebilir bir yerde basla" istegi artik
          `threshold` ile: ogenin %12'si gorunur oldugunda basliyor.

          Bilinen sinir: viewport'tan ~8 kat uzun bir oge %12'ye hic
          ulasamazdi. Bugun en uzun oge kartlar (655px / 900px viewport), yani
          bu sinira yakin bir sey yok - ama bir gun olursa sebebi burada yazili.
        */
        rootMargin: "0px",
        threshold: 0.12,
      },
    );

    for (const element of document.querySelectorAll(".reveal-on-enter")) observer.observe(element);

    return () => {
      observer.disconnect();
      delete root.dataset.reveal;
    };
  }, []);

  return null;
}
