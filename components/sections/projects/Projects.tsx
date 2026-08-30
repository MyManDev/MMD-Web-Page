import type { Project, Site } from "@/content";
import { Container, SectionLabel } from "@/components/ui";
import { ProjectCard } from "./ProjectCard";

type NavItem = Site["nav"][number];

/**
 * Projects bolumu. design-spec.md §3.3
 *
 * Zemin viewport genisliginde (§1'deki tam genislik istisnasi), icerik yine
 * Container icinde.
 *
 * Bolum basligi TOTAL'E BAGLI ve bu bilincli:
 *   - V1 tek proje: §3.3.1 ve Design/design.drawio blok ici sirayi
 *     "SectionLabel 02 -> proje adi" diye veriyor, ayri bir Projects basligi
 *     YOK. Blok bolumun kendisi oldugu icin proje adi h2 ve bolum ona
 *     aria-labelledby ile bagli.
 *   - Cok proje: §4'teki "Display L = bolum basligi" satiri devreye girer,
 *     Projects basligi h2 olur ve kartlar h3'e iner.
 * Iki durumda da tek h1 Hero'da kaliyor ve seviye atlanmiyor (§7.1).
 *
 * Baslik metni uydurulmuyor: nav etiketi content/site.ts'ten geliyor, ikinci
 * kez yazilmiyor.
 *
 * `projects` bossa bolum HIC render edilmez - bos cerceve veya "coming soon"
 * yok (CLAUDE.md kural 6). Karar cagiran tarafta: app/page.tsx.
 */
export function Projects({ section, projects }: { section: NavItem; projects: Project[] }) {
  const stacked = projects.length > 1;
  const headingId = stacked ? `${section.id}-title` : `${projects[0]?.slug ?? section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId} className="bg-surface">
      <Container>
        {/*
          Bolum girisi ICERIGE bagli, section'a degil: zemin viewport genisliginde
          ve onu soldurmak bolumun kendisini yanip sonuyormus gibi gosterirdi.
          Kural app/globals.css'te tek yerde; burada yalnizca uygulaniyor.

          Yigin uyandiginda (§3.3.2) dogrulanacak: animasyon suresince buradaki
          transform bir kapsayici blok yaratiyor ve sticky kartlarin ona gore
          konumlanmasi kontrol edilmeli. Bugun total === 1, sticky hic uygulanmiyor.
        */}
        <div className="reveal-on-enter flex flex-col gap-10 py-section lg:gap-14 lg:py-section-lg">
          <SectionLabel number={section.number}>{section.label}</SectionLabel>

          {stacked ? (
            <h2
              id={headingId}
              className="font-mono text-display-l font-medium lg:text-display-l-lg"
            >
              {section.label}
            </h2>
          ) : null}

          {/*
            Yigin kabi: kart basina bir viewport yuksekligi (§3.3.2). Tek
            projede yigin uygulanmadigi icin kap da normal akista kaliyor.
          */}
          <div className={stacked ? "flex flex-col lg:gap-0" : "flex flex-col"}>
            {projects.map((project, index) => (
              <div key={project.slug} className={stacked ? "lg:min-h-dvh" : undefined}>
                <ProjectCard project={project} index={index} total={projects.length} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
