"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { cancelRouteMotion } from "@/lib/route-motion";

export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    cancelRouteMotion();
    window.addEventListener("popstate", cancelRouteMotion);
    return () => {
      cancelRouteMotion();
      window.removeEventListener("popstate", cancelRouteMotion);
    };
  }, [pathname]);

  return (
    <main key={pathname} id="main" tabIndex={-1} className="page-enter flex flex-1 flex-col">
      {children}
    </main>
  );
}
