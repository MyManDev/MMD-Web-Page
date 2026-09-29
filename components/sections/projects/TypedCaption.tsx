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
 *   reduced-motion            effect erken doner -> isaret yok -> gorunur
 *   goruntu degisti           isaret konur, harfler sirayla acilir
 *   yazi bitti ya da slayt    isaret kalkar -> tamami gorunur
 *   degisti
 *
 * Yalnizca DEGISIMDE yaziliyor: `steps` 0 iken (sayfa acildi, kimse bir sey
 * yapmadi) ilk yazi zaten tam duruyor. Sayac yerine "ilk render mi" diye bir
 * ref tutulsaydi React'in gelistirme kipindeki cift effect'i yaziyi sayfa
 * acilirken de yazdirirdi.
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
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const caption = ref.current;
    if (!caption || !active || steps === 0 || reducedMotion) return;

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

    return () => {
      clearInterval(timer);
      delete caption.dataset.typing;
    };
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
