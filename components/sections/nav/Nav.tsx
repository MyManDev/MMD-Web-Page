"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";

export function Nav({ site }: { site: Site }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return <Navigation key={pathname} site={site} pathname={pathname} />;
}

function Navigation({ site, pathname }: { site: Site; pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuId = "mobile-menu";
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = site.nav.find((item) => item.href === pathname)?.id ?? null;
  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <header className="nav-bar sticky top-0 z-40">
      <Container>
        <div className="flex h-[var(--nav-height)] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="MyManDev home"
            className="rule font-mono text-nav font-medium text-text uppercase"
          >
            {site.wordmark}
          </Link>
          <nav aria-label="Pages" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <NavLink href={item.href} label={item.label} active={active === item.id} />
                </li>
              ))}
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
            onClick={() => (open ? close() : setOpen(true))}
            className="inline-flex h-[var(--height-nav-link)] items-center rounded-sm border border-border px-4 font-mono text-nav text-text uppercase transition-colors duration-150 ease-out hover:bg-surface-2 lg:hidden"
          >
            Menu
          </button>
        </div>
      </Container>
      <MobileMenu
        id={menuId}
        open={open}
        items={site.nav}
        email={site.email}
        githubUrl={site.githubUrl}
        activeId={active}
        onClose={close}
      />
    </header>
  );
}
