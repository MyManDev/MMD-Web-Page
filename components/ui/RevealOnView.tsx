"use client";

import { useEffect } from "react";

/** Sayfa icerigiyle birlikte mount olur, yeni metinleri gozlemler; JS yokken icerik gorunur kalir. */
const STAGGER_CAP = 5;

export function RevealOnView() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    // JS calismadiginda CSS metinleri gizlemez.
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
