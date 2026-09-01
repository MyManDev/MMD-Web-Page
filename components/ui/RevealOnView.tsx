"use client";

import { useEffect } from "react";

/**
 * Metin blokları ekrana girdiğinde belirir. design-spec.md §6
 *
 * NEDEN `IntersectionObserver` VE NEDEN CSS YETMEDI. Önce `animation-timeline:
 * view()` ile yazıldı ve o hareket scroll KONUMUNA bağlıdır: scroll durunca
 * animasyon da donuyor, hızlı kaydırınca atlıyor. Ölçüldü ve "hiçbir değişiklik
 * fark etmedim" geri bildirimi bununla geldi. Referans alınan davranış
 * (zaffiro-tambe.framer.website) ise ZAMANA bağlı: öğe görünür olduğu an
 * animasyon başlıyor ve kendi süresinde bitiyor. Bunu CSS ile yazmanın yolu yok.
 *
 * `CLAUDE.md` kural 3 bu yüzden genişletildi: `IntersectionObserver` artık iki
 * yerde - aktif nav linki ve burası. İkisi de TEK yerde tanımlı, ve hiçbiri
 * scroll listener değil.
 *
 * GIZLEME KARARI CSS'TE, BURADA DEGIL. Bu dosyanın yaptığı tek şey işaret
 * koymak: `<html>` üzerine `data-reveal` ("JS burada ve hareket isteniyor"),
 * sonra her öğeye `data-reveal-shown` ("bu göründü"). Gizleyen kural
 * `globals.css`'te ve yalnızca ilk işaretin altında çalışıyor. Sonuç:
 *
 *   JS gelmezse       işaret hiç konmaz -> bütün metin görünür
 *   reduced-motion    erken dönülür     -> işaret konmaz -> görünür
 *   observer düşerse  cleanup işareti kaldırır -> görünür
 *
 * Tersi yazılsaydı (CSS gizler, JS gösterir) JS'in gelmediği bir sayfada metin
 * görünmez kalırdı. Aynı gerekçe `BioTypewriter`'da da yazılı.
 *
 * ILK BOYAMADAN ONCE ISARET KONMUYOR ve bu ölçümle alınmış bir karar. Önce
 * `app/layout.tsx`'e satır içi bir script koyup işareti ilk boyamadan önce
 * koymayı denedim - flash'ı önlüyordu ama iki bedeli vardı:
 *
 *   1. Metin HIDRASYONA KADAR gizli kalıyor. Ölçüldü: bu ortamda ~1.5s. JS
 *      yavaş gelirse sayfa o kadar süre boş görünür.
 *   2. Hero'nun `h1`'i sayfanın LCP ögesi. Onu JS gelene kadar gizlemek LCP'yi
 *      doğrudan bozar - ve LCP zaten açık bir issue (#83).
 *
 * Bu yüzden HERO BU MEKANIZMAYI KULLANMIYOR: onun girişi saf CSS
 * (`reveal-on-load`), ilk boyamada başlıyor ve JS'e hiç bağlı değil. Observer
 * yalnızca ekran ALTINDAKI metni yönetiyor - o ögeler işaret konduğunda
 * ekranda olmadığı için gizlenmeleri hiçbir şeyi kırpmıyor.
 *
 * Yan fayda: failsafe'e de gerek kalmadı. JS hiç gelmezse işaret hiç konmaz ve
 * bütün metin görünür kalır; bir zaman aşımıyla kendini kurtarmaya çalışan bir
 * kod yok.
 */

/** Aynı karede açılan öğeler arasındaki kademe. */
const STEP_MS = 90;

/**
 * Kademe tavanı. Bir bölümde on iki blok birden görünür olursa on ikinci
 * 1080ms bekler ve bu artık kademe değil gecikme olur.
 */
const STAGGER_CAP = 5;

export function RevealOnView() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    /* Satır içi script bunu zaten koydu; burada tekrar konuyor ki script
       kaldırılırsa davranış yine çalışsın (yalnızca flash geri gelir). */
    root.dataset.reveal = "";

    const observer = new IntersectionObserver(
      (entries) => {
        /* SIRALAMA SART: `entries` belge sırasında gelmiyor. Sıralanmazsa
           Hero'nun dört öğesi rastgele bir sırayla belirirdi. */
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) =>
            a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );

        arriving.forEach((entry, order) => {
          const element = entry.target as HTMLElement;
          element.style.setProperty("--reveal", String(Math.min(order, STAGGER_CAP)));
          element.dataset.revealShown = "";
          /* Bir kez oynar. Aksi halde her geri dönüşte tekrar oynardı ve okuma
             sırasında yukarı kaydıran biri aynı metni yeniden "gelirken"
             görürdü. */
          observer.unobserve(element);
        });
      },
      {
        /*
          `rootMargin` SIFIR ve bu bir hata düzeltmesi. Önce `0px 0px -12% 0px`
          yazıyordu: amaç öğenin ekranın en altında değil görülebilir bir yerde
          başlaması. Sonuç bir ÖLÜ BÖLGE oldu.

          Negatif bir alt marj kökü alttan kısıyor, yani BELGENIN SON %12'SINDEKI
          hiçbir öğe hiç kesişmiyor - sayfa sonuna kadar kaydırılsa bile. O
          öğeler `data-reveal-shown` almıyor ve gizleyen kural sonsuza kadar
          uygulanıyor.

          Ölçüldü, canlı sitede: 1600x900'de footer'ın üç metin bloğu da
          `opacity: 0.00`, `top >= 800`. Mobilde ilk satır şeridin üstüne
          düştüğü için görünüyordu, diğer ikisi orada da gizliydi. Yani içerik
          KAYBOLMUŞTU ve bunu bir test yakalamadı.

          Negatif alt marjın HER degeri bu bölgeyi yaratır - `-60px` de. Tek
          güvenli değer sıfır. "Görülebilir bir yerde başla" isteği artık
          `threshold` ile: ögenin %12'si görünür olduğunda başlıyor.

          Bilinen sınır: viewport'tan ~8 kat uzun bir öge %12'ye hiç
          ulaşamazdi. Bugün en uzun oge kartlar (655px / 900px viewport), yani
          bu sınıra yakın bir şey yok - ama bir gün olursa sebebi burada yazılı.
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

export { STEP_MS as REVEAL_STEP_MS };
