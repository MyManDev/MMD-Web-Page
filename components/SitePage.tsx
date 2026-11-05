import type { ReactNode } from "react";
import { RevealOnView } from "@/components/ui";

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main" tabIndex={-1} className="page-enter flex flex-1 flex-col">
        {children}
      </main>
      <RevealOnView />
    </>
  );
}
