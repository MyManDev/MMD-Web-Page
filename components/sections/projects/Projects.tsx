import type { Project, Site } from "@/content";
import { Container } from "@/components/ui";
import { ProjectCard } from "./ProjectCard";

type NavItem = Site["nav"][number];

/**
 * Projects bolumu. design-spec.md §3.3
 *
 * Zemin viewport genisliginde (§1'deki tam genislik istisnasi), icerik yine
 * Container icinde.
 *
 * Bolum basligi HER ZAMAN var (#58). Onceden tek projede baslik proje adiydi
 * ve bolum kimligini "02 PROJECTS" etiketi tasiyordu; etiketler kalkinca o
 * kimlik bosta kaldi. Artik bolum kendi basligini tasiyor (Display XL) ve proje
 * adi h3 - seviye atlanmiyor, tek h1 Hero'da kaliyor (§7.1).
 *
 * Baslik metni uydurulmuyor: nav etiketi content/site.ts'ten geliyor, ikinci
 * kez yazilmiyor.
 *
 * `projects` bossa bolum HIC render edilmez - bos cerceve veya "coming soon"
 * yok (CLAUDE.md kural 6). Karar cagiran tarafta: app/page.tsx.
 */
export function Projects({ section, projects }: { section: NavItem; projects: Project[] }) {
  const stacked = projects.length > 1;
  const headingId = `${section.id}-title`;

  return (
    /* `overflow-x-clip`: kartlarin hayalet arka plani (ScreenshotGhost.tsx)
       kartin 48px yanina tasiyor ve dar ekranda sayfaya yatay kaydirma
       ekliyordu (olculdu: 390px'te 28px). `clip` kaydirma kabi OLUSTURMUYOR,
       yani sticky yigin ve nav etkilenmiyor. Dikey tasma hayaletin kendisinde
       bolumun bosluklarina gore ayarli. */
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="section-edge overflow-x-clip bg-surface"
    >
      <Container>
        {/*
          Bolum girisi ICERIGE bagli, section'a degil: zemin viewport genisliginde
          ve onu soldurmak bolumun kendisini yanip sonuyormus gibi gosterirdi.
          Kural app/globals.css'te tek yerde; burada yalnizca uygulaniyor.

          Yigin uyandiginda (§3.3.2) dogrulanacak; bugun total === 1, sticky hic
          uygulanmiyor. Kartlarin hicbir atasi translate tasimiyor: giris sinifi
          #93'te bu sarmalayicidan metin bloklarina tasindi.
        */}
        <div className="flex flex-col gap-10 py-section lg:gap-14 lg:py-section-lg">
          <h2
            id={headingId}
            className="reveal-on-enter font-mono text-display-xl font-medium lg:text-display-xl-lg"
          >
            {section.label}
          </h2>

          {/*
            Yigin kabi. KARTLAR DOGRUDAN COCUK ve bu duzeltme olcumle geldi.

            Once her kart kendi `lg:min-h-dvh` sarmalayicisinin icindeydi ve
            yigin CALISMIYORDU: `position: sticky` ebeveyninin kutusuyla
            sinirli, yani kart 01 yalnizca kendi 100vh'lik yuvasi ekranda
            kaldigi surece sabit durabiliyordu. Yerel bir ikinci kayitla
            olculdu - kart 01, kart 02 hala 436px asagidayken sabitlenmeyi
            birakiyordu; ikisi hic ust uste gelmiyordu. §3.3.2 "sonraki kart
            oncekinin ustune biner" diyor ve bu olmuyordu.

            Simdi araligi kartin kendi yuksekligi veriyor (ProjectCard,
            `lg:min-h-*`), yani her kartin sticky menzili KABIN TAMAMINI kapsiyor.

            Mobil bosluk `gap` ile ve `lg`de sifirlaniyor: orada araligi kartin
            yuksekligi tasiyor, ikisi birlikte cift bosluk yapardi.

            Reduced-motion'da yigin duz listeye donuyor ve kartin yuksekligi
            kalkiyor (ProjectCard), yani orada bosluk GERI GELIYOR: yoksa kartlar
            birbirine yapisir ve sonraki kartin hayaleti oncekinin en alttaki
            aksiyonlarinin ustune binerdi (incelemede bulundu).
          */}
          <div
            className={
              stacked ? "flex flex-col gap-16 lg:gap-0 motion-reduce:lg:gap-16" : "flex flex-col"
            }
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                total={projects.length}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
