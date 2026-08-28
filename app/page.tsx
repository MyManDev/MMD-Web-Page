import { Container } from "@/components/ui";
import { Footer } from "@/components/sections/footer";
import { Nav } from "@/components/sections/nav";
import { Projects } from "@/components/sections/projects";
import { Team } from "@/components/sections/team";
import { projects, site, team } from "@/content";

/**
 * Bolumler Faz 3'te tek tek geliyor. Su an Navigation, Projects ve Footer var;
 * Hero ve Who we are kendi issue'larinda eklenecek.
 *
 * Nav layout'ta degil burada duruyor: anchor linkleri (#hero, #projects ...)
 * yalnizca tek sayfada anlamli, 404'te degil.
 *
 * Projects yalnizca YAYINLANACAK bir proje varsa render ediliyor. Bos icerik
 * bos bir bolum uretmiyor - "coming soon" karti veya bos cerceve yok
 * (CLAUDE.md kural 6). Bolum numarasi ve etiketi content/site.ts'teki nav
 * kaydindan geliyor; ikinci kez yazilmiyor.
 */
export default function Home() {
  const projectsSection = site.nav.find((item) => item.id === "projects");
  const teamSection = site.nav.find((item) => item.id === "team");

  return (
    <>
      <Nav site={site} />
      <main id="main">
        <Container>
          <h1 className="py-section font-sans text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] lg:text-[64px]">
            {site.wordmark}
          </h1>
        </Container>

        {projectsSection && projects.length > 0 ? (
          <Projects section={projectsSection} projects={projects} />
        ) : null}

        {teamSection && team.length > 0 ? <Team section={teamSection} members={team} /> : null}
      </main>
      <Footer site={site} />
    </>
  );
}
