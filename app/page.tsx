import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Nav } from "@/components/sections/nav";
import { WhoWeAre } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Team } from "@/components/sections/team";
import { projects, site, team } from "@/content";

/**
 * Bolumler Faz 3'te tek tek geliyor. Faz 3 bu bolumle kapaniyor: Navigation,
 * Hero, Projects, Who we are, Team ve Footer.
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
  const heroSection = site.nav.find((item) => item.id === "hero");
  const projectsSection = site.nav.find((item) => item.id === "projects");
  const whoWeAreSection = site.nav.find((item) => item.id === "who-we-are");
  const teamSection = site.nav.find((item) => item.id === "team");

  return (
    <>
      <Nav site={site} />
      <main id="main">
        {heroSection && projectsSection ? (
          <Hero
            section={heroSection}
            hero={site.hero}
            primary={projectsSection}
            secondary={whoWeAreSection}
          />
        ) : null}

        {projectsSection && projects.length > 0 ? (
          <Projects section={projectsSection} projects={projects} />
        ) : null}

        {whoWeAreSection ? <WhoWeAre section={whoWeAreSection} whoWeAre={site.whoWeAre} /> : null}

        {teamSection && team.length > 0 ? <Team section={teamSection} members={team} /> : null}
      </main>
      <Footer site={site} />
    </>
  );
}
