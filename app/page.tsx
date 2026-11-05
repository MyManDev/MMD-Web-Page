import { SitePage } from "@/components/SitePage";
import { Button, Container } from "@/components/ui";
import { site } from "@/content";

export default function Home() {
  return (
    <SitePage>
      <section
        aria-labelledby="mymandev-title"
        className="flex flex-1 items-center py-section lg:py-section-lg"
      >
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-12">
            <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-7">
              <h1
                id="mymandev-title"
                className="reveal-on-load font-mono text-display-xl font-medium lg:text-display-xl-lg"
              >
                {site.wordmark}
              </h1>
              <p className="reveal-on-load font-mono text-display-m text-balance lg:text-display-m-lg">
                {site.home.lead}
              </p>
              <p className="reveal-on-load max-w-prose text-body text-text-muted lg:text-body-lg">
                {site.home.story}
              </p>
              <div className="reveal-on-load mt-2 flex flex-col gap-3 sm:flex-row">
                <Button href="/projects">Projects</Button>
                <Button href="/team" variant="ghost">
                  Team
                </Button>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="reveal-on-load hidden md:col-span-4 md:block lg:col-span-5"
            >
              <div className="brand-mark-plate grid place-items-center">
                <div className="brand-mark" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </SitePage>
  );
}
