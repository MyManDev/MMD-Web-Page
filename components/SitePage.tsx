import type { ReactNode } from "react";
import { RevealOnView } from "@/components/ui";
import { PageMotion } from "@/components/ui/PageMotion";

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <>
      <PageMotion>{children}</PageMotion>
      <RevealOnView />
    </>
  );
}
