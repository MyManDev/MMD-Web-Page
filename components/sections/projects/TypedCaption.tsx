"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/deck";

/*
  Harf basina sure. DISA AKTARILIYOR, cunku testin bekleme suresini "o gunku
  sayiyi" yazmadan buradan turetmesi gerekiyor. 25ms'de en uzun baslik (~100
  harf) 2.5 saniyede biter; otomatik gecis araligi 7 saniye.
*/
export const CAPTION_STEP_MS = 25;

/**
 * Karuselde goruntunun altindaki yazi, goruntu DEGISINCE daktiloyla yaziliyor.
 * design-spec.md §3.3.1. Karar sahibinin istegi: "resmin altindaki yazi resim
 * degisince daktilo olarak degissin".
 *
 * Takim kartinin biyografisiyle ayni ilke (BioTypewriter.tsx): GIZLEME CSS'TE.
 * Yazilmamis harfler `data-pending` tasiyor, ama onlari gizleyen kural
 * (globals.css) yalnizca `[data-typing]` altinda calisiyor ve o isareti bu
 * dosya koyuyor. Yani:
 *
 *   JS yoksa / ilk render     isaret yok -> yazinin tamami gorunur
 *   reduced-motion            isaret kalkar -> tamami gorunur (yazarken
 *                             acilirsa da: yazi hemen tamamlanir)
 *   goruntu degisti           isaret konur, harfler sirayla acilir
 *   yazi bitti                isaret kalkar -> tamami gorunur
 *   yazarken slayt degisti    isaret KALIR: giden yazinin kalan harfleri
 *                             gizli kalip basligiyla birlikte soner
 *
 * Son satir bilerek: isaret orada kalkarsa yazilmamis harfler tek karede belirir
 * ve giden baslik 200ms boyunca gelenin ustunde okunurdu (incelemede bulundu).
 * Slayt yeniden etkinlesince effect her seyi bastan kuruyor.
 *
 * Yalnizca DEGISIMDE yaziliyor: `written` son ele alinan adim ve effect yalnizca
 * `steps` ondan farkliysa yaziyor. Sayfa acilinca (0 = 0) ilk yazi zaten tam
 * duruyor; reduced-motion kapaninca da goruntu degismeden yeniden yazilmiyor.
 * Bu bir DEGER karsilastirmasi: "ilk render mi" diye bir bayrak tutulsaydi
 * React'in gelistirme kipindeki cift effect'i yaziyi sayfa acilirken de
 * yazdirirdi.
 *
 * Harfler React state'iyle degil DOM'da aciliyor: harf basina bir render olmasin
 * diye. React bu ozniteliklere hic dokunmuyor (sanal DOM'da yoklar), yani bir
 * yeniden render yazinin yarisini silmiyor.
 *
 * ERISILEBILIRLIK: metin DOM'da HER ZAMAN TAM. Gizleme `opacity` ile, figurun
 * adi ve canli bolgenin duyurusu cumlenin tamamini okur; harf harf konusmaz,
 * cunku degisen sey metin degil bir oznitelik.
 */
export function TypedCaption({
  text,
  active,
  steps,
  className,
}: {
  text: string;
  active: boolean;
  steps: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const written = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const caption = ref.current;
    if (!caption || !active) return;
    if (reducedMotion) {
      delete caption.dataset.typing;
      written.current = steps;
      return;
    }
    if (steps === written.current) return;
    written.current = steps;

    const letters = Array.from(caption.children);
    for (const letter of letters) letter.setAttribute("data-pending", "");
    caption.dataset.typing = "";

    let typed = 0;
    const timer = setInterval(() => {
      letters[typed]?.removeAttribute("data-pending");
      typed += 1;
      if (typed >= letters.length) {
        clearInterval(timer);
        delete caption.dataset.typing;
      }
    }, CAPTION_STEP_MS);

    // Yalnizca zamanlayici: isaret burada kalkmiyor (yukaridaki tablo).
    return () => clearInterval(timer);
  }, [active, steps, reducedMotion]);

  return (
    <figcaption ref={ref} className={className}>
      {Array.from(text).map((character, position) => (
        // Sabit bir metnin sabit sirasi; index burada kararli bir key.
        <span key={position}>{character}</span>
      ))}
    </figcaption>
  );
}
