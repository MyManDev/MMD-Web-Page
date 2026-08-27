import { Container } from "@/components/ui";
import { Nav } from "@/components/sections/nav";
import { site } from "@/content";

/**
 * Bolumler Faz 3'te tek tek geliyor. Su an yalnizca Navigation var; Hero,
 * Projects, Team ve About kendi issue'larinda eklenecek.
 *
 * Nav layout'ta degil burada duruyor: anchor linkleri (#hero, #projects ...)
 * yalnizca tek sayfada anlamli, 404'te degil.
 */
export default function Home() {
  return (
    <>
      <Nav site={site} />
      <main id="main">
        <Container>
          <h1 className="py-section font-sans text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] lg:text-[64px]">
            {site.wordmark}
          </h1>
        </Container>
      </main>
    </>
  );
}
