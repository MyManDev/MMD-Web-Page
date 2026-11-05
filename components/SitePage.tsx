import type { ReactNode } from "react";
import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";
import { RevealOnView } from "@/components/ui";
import { site } from "@/content";

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav site={site} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer site={site} />
      <RevealOnView />
    </>
  );
}
