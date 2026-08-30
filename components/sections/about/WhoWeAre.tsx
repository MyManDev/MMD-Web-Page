import type { CSSProperties } from "react";
import type { Site } from "@/content";
import { Container } from "@/components/ui";

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
 * Sunucu component'i: durum yok, etkilesim yok, payload'a eklemiyor.
 *
 * PRENSIPLER PINLENEN BIR DIZI (#56). Kural app/globals.css'te tek yerde;
 * burada yalnizca yapisi kuruluyor. Uc kapi birden duz listeye dusuyor:
 * @supports yoksa, lg altindaysa, veya prefers-reduced-motion aciksa. Yani
 * bu bir KATMAN - listenin kendisi her durumda tam ve okunur.
 *
 * Liste her zaman gercek bir <ul>: ekran okuyucu oge sayisini duyurur ve
 * prensiplerin hepsini bastan okur. Gorunurluk degisir, icerik degismez.
 */
export function WhoWeAre({ section, whoWeAre }: { section: NavItem; whoWeAre: Site["whoWeAre"] }) {
  const headingId = `${section.id}-title`;
  const total = whoWeAre.principles.length;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <section id={section.id} aria-labelledby={headingId}>
      <Container>
        {/*
          Bolum girisi ICERIGE bagli, section'a degil - kural globals.css'te (§6).
        */}
        <div className="reveal-on-enter flex flex-col gap-8 py-section lg:gap-10 lg:pt-section-lg">
          <h2 id={headingId} className="font-mono text-display-l font-medium lg:text-display-l-lg">
            {section.label}
          </h2>

          {/*
            Metin genisligi 65ch: sinir okunabilirlikten geliyor, kapsayicidan
            degil. Kapsayici 1600px ve manifesto bu sinir olmadan satir basina
            150+ karakter olurdu.
          */}
          <p className="max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
            {whoWeAre.manifesto}
          </p>
        </div>
      </Container>

      {/*
        Pinlenen dizi. `--n` prensip sayisini CSS'e tasiyor: kap yuksekligi ve
        her prensibin scroll dilimi ondan hesaplaniyor. Sema sayiyi 3-5 ile
        sinirladigi icin bu deger hic bos veya asiri olamaz.
      */}
      <div className="principle-track" style={{ "--n": total } as CSSProperties}>
        <div className="principle-pin pb-section lg:pb-section-lg">
          <Container>
            <ul className="principle-list flex max-w-prose list-disc flex-col gap-2 pl-5 marker:text-text-muted">
              {whoWeAre.principles.map((principle, index) => (
                <li
                  key={principle}
                  className="principle font-sans text-body-s text-text-muted lg:text-body"
                  style={{ "--i": index } as CSSProperties}
                >
                  {/*
                    Sayac DEKORATIF DEGIL: pinlenen bicimde kullanici dizinin
                    neresinde oldugunu baska turlu bilemez, o yuzden
                    aria-hidden yok. Duz listede CSS ile gizleniyor.
                  */}
                  <span className="principle-index mb-3 font-mono text-mono text-text-muted">
                    {pad(index + 1)} / {pad(total)}
                  </span>
                  {principle}
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </div>
    </section>
  );
}
