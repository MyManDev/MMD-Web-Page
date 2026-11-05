"use client";

import { MotionLink } from "@/components/ui/MotionLink";
import { usePathname } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";

export function Nav({ site }: { site: Site }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return <Navigation site={site} pathname={pathname} />;
}

function Navigation({ site, pathname }: { site: Site; pathname: string }) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  if (openPath !== null && openPath !== pathname) setOpenPath(null);
  const menuId = "mobile-menu";
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = site.nav.find((item) => item.href === pathname)?.id ?? null;
  const close = useCallback(() => {
    setOpenPath(null);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (!desktop.matches) return;
      setOpenPath(null);
      headerRef.current?.querySelector<HTMLElement>('nav [aria-current="page"]')?.focus();
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="nav-bar sticky top-0 z-40">
        <Container>
          <div className="flex h-[var(--nav-height)] items-center justify-between gap-4">
            <MotionLink
              href="/"
              aria-label="MyManDev home"
              className="pressable rule font-mono text-nav font-medium text-text uppercase"
            >
              {site.wordmark}
            </MotionLink>
            <nav aria-label="Pages" className="hidden lg:block">
              <ul
                className="nav-pages"
                style={
                  {
                    "--active-page": Math.max(
                      0,
                      site.nav.findIndex((item) => item.id === active),
                    ),
                    "--page-count": site.nav.length,
                  } as CSSProperties
                }
              >
                {site.nav.map((item) => (
                  <li key={item.id}>
                    <NavLink href={item.href} label={item.label} active={active === item.id} />
                  </li>
                ))}
                {active && <li aria-hidden="true" className="nav-indicator" />}
              </ul>
            </nav>
            <div className="hidden items-center gap-2 lg:flex">
              <Button href={`mailto:${site.email}`} variant="ghost">
                Contact
              </Button>
              <Button href={site.githubUrl} variant="ghost" external>
                GitHub
              </Button>
            </div>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => (open ? close() : setOpenPath(pathname))}
              className="pressable inline-flex h-[var(--height-nav-link)] items-center rounded-sm border border-border px-4 font-mono text-nav text-text uppercase transition-colors duration-150 ease-out hover:bg-surface-2 lg:hidden"
            >
              Menu
            </button>
          </div>
        </Container>
      </header>
      <MobileMenu
        id={menuId}
        open={open}
        items={site.nav}
        email={site.email}
        githubUrl={site.githubUrl}
        activeId={active}
        headerRef={headerRef}
        onClose={close}
      />
    </>
  );
}
