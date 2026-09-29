"use client";

import { ArrowIcon } from "@/components/ui";
import type { Project } from "@/content";
import { useAutoAdvancingDeck } from "@/lib/deck";
import { Screenshot } from "./Screenshot";

/*
  Slaytlarin hepsi AYNI izgara hucresinde ust uste; yalnizca `data-active`
  gorunur. Kap boylece tek bir goruntu kadar ve gezinirken tuslar yerinden
  oynamiyor - prensip destesinin olcerek buldugu duzen (globals.css
  `.principle-slot`).

  Gorunmeyenler `visibility: hidden` ve bunun iki sonucu var. Erisilebilirlik
  agacindan ve odak sirasindan cikiyorlar, yani ekran okuyucu yalnizca ekrandaki
  goruntuyu duyuyor. Ama kutulari duruyor, yani `loading="lazy"` onlari da
  bolum yaklasirken indiriyor ve ileri tusu bos bir kareye acilmiyor.
  `display: none` ikincisini kaybettirirdi.

  GECIS CAPRAZ SONUMLEME, 200ms ve yalnizca hareket isteniyorsa. Hile
  gecikmede: gelen slayt ustte (z-index 1) 0'dan 1'e cikarken giden slayt ALTTA
  200ms daha gorunur kaliyor, sonra tek adimda kayboluyor. Iki slayt ayni anda
  sonseydi arada kartin zemini parlardi.

  Gecis `motion-safe:` altinda yaziliyor: reduced-motion altinda gecis hic
  yok, degisim aninda (CLAUDE.md kural 10). Global blogun da ayni seyi yaptigi
  ve bu satirlarin neden ikinci kat oldugu design-spec.md §6.1'de.
*/
const SLOT =
  "invisible col-start-1 row-start-1 opacity-0 data-active:visible data-active:z-1 data-active:opacity-100" +
  " motion-safe:transition-[opacity,visibility] motion-safe:delay-200 motion-safe:duration-0 motion-safe:ease-out" +
  " motion-safe:data-active:delay-0 motion-safe:data-active:duration-200";

/**
 * Ekran goruntusu karuseli. design-spec.md §3.3.1
 *
 * Yalnizca birden fazla goruntu oldugunda cizilir; tek goruntude ProjectCard
 * duz <img>'i basiyor.
 *
 * GEZINME PRENSIP DESTESININ KENDISI (§3.4, lib/deck.ts): ayni tuslar, ayni
 * sayac, basa saran gezinme ve KENDILIGINDEN GECIS. Karusel once elle
 * gecisliydi; gerekcesi "ekran goruntusu inceleniyor, bakilirken degismemeli"
 * idi. Karar sahibi goruntulerin kendiliginden degismesini istedi (2026-09-29)
 * ve o gerekceyi karsilayan sey zaten kancada: fare goruntunun uzerindeyken
 * veya odak icerideyken deste duruyor, birakinca kaldigi yerden suruyor.
 * Reduced-motion altinda hic ilerlemiyor. Otomatik geciste canli bolge susuyor,
 * etkilesimde yeniden aciliyor.
 *
 * Desteden bilerek AYRILDIGI tek yer:
 *
 *   SUNUCUDA DA KARUSEL. Deste sunucuda duz liste basiyor, cunku bes cumlenin
 *   dordunu JS'e rehin vermek istemiyor. Burada ayni hamle SAYFAYI KAYDIRIRDI:
 *   goruntuler alt alta basilip hidrasyonda teke inse bolum, goruntu sayisinin
 *   bir eksigi kadar goruntu boyu kisalirdi. Onun yerine sunucu da ilk goruntuyu
 *   gosteriyor ve tus satirini YER TUTAN ama GORUNMEYEN halde basiyor. JS
 *   gelmezse ziyaretci tek bir goruntu gorur ve calismayan bir tusla
 *   karsilasmaz - destenin testindeki kural ("calismayan bir tus cizmek").
 *   Gelince tuslar yerinden oynamadan gorunur oluyor.
 *
 * Ok tuslari (klavye) YOK, destede de yok. APG'nin karusel deseni onlari
 * istemiyor; tuslar Tab ile ulasilan iki dugme ve Enter/Space ile calisiyor.
 */
export function ScreenshotCarousel({
  name,
  screenshots,
  className,
}: {
  name: string;
  screenshots: Project["screenshots"];
  className: string;
}) {
  const total = screenshots.length;
  /* `enhanced`: tus satiri hidrasyona kadar gorunmez (yukarida). */
  const { hydrated: enhanced, index, step, announce, pauseOn } = useAutoAdvancingDeck(total);
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div
      aria-label={`${name} screenshots`}
      aria-roledescription="carousel"
      className={`flex flex-col gap-4 ${className}`}
      role="group"
      {...pauseOn}
    >
      <div
        aria-live={announce ? "polite" : "off"}
        className="grid overflow-hidden rounded-card border border-border"
      >
        {screenshots.map((screenshot, slot) => (
          <div
            key={screenshot.src}
            aria-label={`${slot + 1} of ${total}`}
            aria-roledescription="slide"
            className={SLOT}
            data-active={slot === index ? "" : undefined}
            role="group"
          >
            <Screenshot {...screenshot} />
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-4 ${enhanced ? "" : "invisible"}`}>
        <p className="font-mono text-mono text-text-muted tabular-nums">
          <span className="text-text">{pad(index + 1)}</span> / {pad(total)}
        </p>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous screenshot"
            className="deck-button"
            onClick={() => step(-1)}
            type="button"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            aria-label="Next screenshot"
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
