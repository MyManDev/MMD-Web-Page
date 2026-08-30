import type { Site } from "@/content";
import { Container, SectionLabel } from "@/components/ui";

type NavItem = Site["nav"][number];

/**
 * Who we are. design-spec.md §3.4
 *
 * Kolektifi BIRLIKTE anlatir; kisiler bir sonraki bolumde tek tek geliyor
 * (§3.4, "genelden tekile"). Bu yuzden burada uc uzmanlik SAYILMIYOR - o
 * cumle Team bolumunun.
 *
 * Tek kolon ve metin genisligi 65ch (`max-w-prose`, token). Genislik
 * kapsayicidan degil okunurluktan geliyor: kapsayici 1600px ve manifesto o
 * genislikte satir basina 150+ karakter olurdu.
 *
 * BOLUMDE YESIL YOK (§5.1). Burada birincil aksiyon yok, yani accent kotasi
 * sifir - baslik, manifesto ve liste isaretleri accent kullanmaz. Tek istisna
 * focus halkasi ve o bolum kotasina sayilmiyor (§7.2).
 *
 * Sunucu component'i: durum yok, etkilesim yok, payload'a eklemiyor.
 *
 * Baslik metni uydurulmuyor: nav etiketi content/site.ts'ten geliyor.
 * Manifesto ve prensipler #15'te yazildi ve sema ikisini de zorunlu tutuyor;
 * prensip sayisi 3-5 ile sinirli, yani buradaki liste hic bos olamaz.
 */
export function WhoWeAre({ section, whoWeAre }: { section: NavItem; whoWeAre: Site["whoWeAre"] }) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId}>
      <Container>
        {/*
          Bolum girisi ICERIGE bagli, section'a degil - kural app/globals.css'te
          tek yerde, burada yalnizca uygulaniyor (§6).
        */}
        <div className="reveal-on-enter flex flex-col gap-8 py-section lg:gap-10 lg:py-section-lg">
          <SectionLabel number={section.number}>{section.label}</SectionLabel>

          <h2 id={headingId} className="font-mono text-display-l font-medium lg:text-display-l-lg">
            {section.label}
          </h2>

          <p className="max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
            {whoWeAre.manifesto}
          </p>

          {/*
            Prensipler gercek bir liste: ekran okuyucu oge sayisini duyurur.
            Isaretler `text-muted` - accent DEGIL (§5.1).
          */}
          <ul className="marker:text-text-muted flex max-w-prose list-disc flex-col gap-2 pl-5">
            {whoWeAre.principles.map((principle) => (
              <li key={principle} className="font-sans text-body-s text-text-muted">
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
