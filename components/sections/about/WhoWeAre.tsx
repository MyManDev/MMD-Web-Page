import type { Site } from "@/content";
import { Container } from "@/components/ui";
import { PrincipleDeck } from "./PrincipleDeck";

type NavItem = Site["nav"][number];

/**
 * Who we are. design-spec.md §3.4
 *
 * Kolektifi BIRLIKTE anlatir; kisiler bir sonraki bolumde tek tek geliyor
 * (§3.4, "genelden tekile"). Bu yuzden burada uc uzmanlik SAYILMIYOR - o
 * cumle Team bolumunun.
 *
 * BOLUMDE YESIL YOK (§5.1). Birincil aksiyon olmadigi icin accent kotasi
 * sifir. Tek istisna focus halkasi ve o kotaya sayilmiyor (§7.2).
 *
 * IKI KOLON ve bu bir duzeltme. Onceki bicimde (#56) prensipler scroll'a
 * pinlenmis ayri bir diziydi: manifesto ekrandan cikiyor, geriye bir ekranda
 * tek bir satir kaliyordu. Bolumun bos gorunmesinin sebebi buydu. Manifesto ve
 * prensipler artik ayni ekranda - biri kolektifin ne oldugunu, digeri nasil
 * calistigini soyluyor ve ikisi birlikte okunuyor.
 *
 * Bolumun kendisi sunucu component'i. Yalnizca deste istemci tarafinda ve
 * gerekcesi PrincipleDeck.tsx'te yazili.
 */
export function WhoWeAre({ section, whoWeAre }: { section: NavItem; whoWeAre: Site["whoWeAre"] }) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId}>
      <Container>
        {/*
          Bolum girisi ICERIGE bagli, section'a degil - kural globals.css'te (§6).
        */}
        <div className="reveal-on-enter grid grid-cols-1 gap-10 py-section lg:grid-cols-12 lg:gap-[var(--spacing-gutter-lg)] lg:py-section-lg">
          <div className="flex flex-col gap-8 lg:col-span-6 lg:gap-10">
            <h2
              id={headingId}
              className="font-mono text-display-l font-medium lg:text-display-l-lg"
            >
              {section.label}
            </h2>

            {/*
              Metin genisligi 65ch: sinir okunabilirlikten geliyor, kapsayicidan
              degil. Iki kolonda dahi gecerli - kolon 65ch'ten genis oldugunda
              satir yine 65ch'te kesiliyor.
            */}
            <p className="max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
              {whoWeAre.manifesto}
            </p>
          </div>

          {/*
            Deste manifestoyla dikey ORTALANMIYOR, ustten hizali: iki kolonun
            yuksekligi icerige gore degisiyor ve ortalama, prensibi manifestonun
            ortasina kaydirip iki sutunun baslangicini birbirinden kopariyordu.

            Ust cizgi susleme degil, HIYERARSI duzeltmesi. Prensip de h2 de
            ayni olcude mono (40px) ve cizgisiz halde ikisi yan yana iki BASLIK
            gibi okunuyordu. Alternatifi denendi - prensibi 24px'e dusurmek -
            ve sag kolonu yeniden bosaltiyordu; yani bu bolumun ilk sikayetini
            geri getiriyordu. Cizgi desteyi ayri bir modul olarak isaretliyor,
            olcuyu dusurmeden.

            Mobilde de duruyor ve orada isi daha acik: kolonlar alt alta
            yiginldiginda manifestoyla prensipleri ayiran tek sey bu.
          */}
          <div className="border-t border-border pt-6 lg:col-span-5 lg:col-start-8">
            <PrincipleDeck principles={whoWeAre.principles} />
          </div>
        </div>
      </Container>
    </section>
  );
}
