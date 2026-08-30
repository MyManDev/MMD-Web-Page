import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Nav } from "@/components/sections/nav";
import { Projects } from "@/components/sections/projects";
import { projects, site } from "@/content";

/**
 * Bolumler Faz 3'te tek tek geliyor. Su an Navigation, Hero, Projects ve Footer
 * var; Who we are ve Team kendi issue'larinda eklenecek.
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

  /*
    Hero'nun ikincil aksiyonu Who we are'a gidiyor ve o bolum henuz yok (#9).
    Var olmayan bir bolume goturen dugme cizilmiyor; bolum eklendiginde bu
    satir onu bulur ve dugme kendiliginden gelir.
  */
  const whoWeAreSection = undefined;

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
      </main>
      <Footer site={site} />
    </>
  );
}
