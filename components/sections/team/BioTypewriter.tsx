"use client";

import { useEffect, useRef, useState } from "react";

/**
 * DENEME - biyografinin daktilo efektiyle yazilmasi.
 *
 * Bolumun geri kalani sunucu component'i; client'a donen tek sey bu. Efekt
 * begenilmezse silinecek dosya bu tek dosya, TeamCard'a dokunulmadan.
 *
 * GIZLEME KARARI CSS'TE, BURADA DEGIL. Yazilmamis harfler `data-pending`
 * tasiyor, ama onlari gizleyen kural yalnizca `[data-typing]` altinda
 * calisiyor - ve o isareti JS koyuyor. Sonuc:
 *
 *   JS calismazsa        isaret hic konmaz -> butun harfler gorunur
 *   reduced-motion       effect erken doner -> isaret konmaz -> gorunur
 *   (hover: none)        ayni -> gorunur
 *   hover'li cihaz       isaret konur -> harfler gizli baslar, hover'da yazilir
 *
 * Ilk satir onemli: gizlemeyi JS'e degil CSS'e birakmak, JS'in hic gelmedigi
 * bir sayfada biyografiyi gorunmez birakirdi. Isaret sirasi tersine cevrildi.
 *
 * ERISILEBILIRLIK: metin DOM'da HER ZAMAN TAM duruyor. Gizleme `opacity` ile,
 * `display` veya `visibility` ile degil - ekran okuyucu ilk andan itibaren
 * cumlenin tamamini okur, yarim yazilmis bir metin duymaz.
 *
 * Harfler yerlerini bastan isgal ettigi icin metin yazilirken BUYUMEZ: satir
 * sonlari en bastan hesaplanir, kart zipla-kaydir yapmaz.
 */
const STEP_MS = 12;

export function BioTypewriter({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const paragraph = ref.current;
    const card = paragraph?.closest("article");
    if (!paragraph || !card) return;

    const staysOpen =
      matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches;
    if (staysOpen) return;

    // Isaret DOM'a dogrudan konuyor: bir render durumu degil, "JS burada"
    // beyani. CSS gizlemeyi buna bakarak yapiyor.
    paragraph.dataset.typing = "";

    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      clearInterval(timer);
      let index = 0;
      timer = setInterval(() => {
        index += 1;
        setTyped(index);
        if (index >= text.length) clearInterval(timer);
      }, STEP_MS);
    };

    const stop = () => {
      clearInterval(timer);
      setTyped(0);
    };

    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", stop);

    return () => {
      clearInterval(timer);
      delete paragraph.dataset.typing;
      card.removeEventListener("mouseenter", start);
      card.removeEventListener("mouseleave", stop);
      card.removeEventListener("focusin", start);
      card.removeEventListener("focusout", stop);
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {Array.from(text).map((character, index) => (
        <span
          // Harfler sabit bir dizinin sabit sirasi; index burada kararli bir key.
          key={index}
          {...(index < typed ? {} : { "data-pending": "" })}
        >
          {character}
        </span>
      ))}
    </p>
  );
}
