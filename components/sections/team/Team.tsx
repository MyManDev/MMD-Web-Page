import type { Site, TeamMember } from "@/content";
import { Container, SectionLabel } from "@/components/ui";
import { TeamCard } from "./TeamCard";

type NavItem = Site["nav"][number];

/**
 * Team bolumu - kisileri tek tek tanitan kartlar. design-spec.md §3.5
 *
 * Kolektifi anlatan metin bir onceki bolumde (03 Who we are); burasi tekil.
 * Genelden tekile, architecture.md §2.
 *
 * Baslik metni uydurulmuyor: nav etiketi content/site.ts'ten geliyor, ikinci
 * kez yazilmiyor. Bolum h2, kartlar h3 - seviye atlanmiyor (§7.1).
 *
 * `members` bossa bolum HIC render edilmez - bos cerceve veya "coming soon"
 * yok (CLAUDE.md kural 6). Karar cagiran tarafta: app/page.tsx.
 *
 * Kartlar <ul>/<li>: ekran okuyucu kac kisi oldugunu duyurur (§7.5, Tag
 * listesiyle ayni gerekce).
 */
export function Team({ section, members }: { section: NavItem; members: TeamMember[] }) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId}>
      <Container>
        <div className="reveal-on-enter flex flex-col gap-10 py-section lg:gap-14 lg:py-section-lg">
          <SectionLabel number={section.number}>{section.label}</SectionLabel>

          <h2
            id={headingId}
            className="font-sans text-display-l font-semibold lg:text-display-l-lg"
          >
            {section.label}
          </h2>

          {/*
            lg'de uc kolon cunku uc kisi var ve ucu tek satira oturuyor
            (§3.5). Kolon sayisi icerikten degil breakpoint'ten geliyor;
            grid-cols dizinin uzunluguyla hesaplanmiyor.
          */}
          <ul data-cards className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li key={member.slug}>
                <TeamCard member={member} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
