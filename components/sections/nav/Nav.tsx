"use client";

import { useCallback, useRef, useState } from "react";
import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { useActiveSection } from "./useActiveSection";

/**
 * Sticky navbar. docs/design-spec.md §3.1
 *
 * Zemin saydam DEGIL: blur'lu bar altindan gecen metnin okunurlugunu bozuyor
 * ve backdrop-filter mobilde bedava degil.
 *
 * Sticky davranis position:sticky ile; scroll listener yok (CLAUDE.md kural 3).
 */
export function Nav({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);
  // Sabit id: sayfada tek nav var. useId "«r0»" gibi degerler uretiyor ve
  // bunlar CSS secicisinde kacis istiyor - testte de, ileride bir stilde de.
  const menuId = "mobile-menu";
  const toggleRef = useRef<HTMLButtonElement>(null);
  const ids = site.nav.map((item) => item.id);
  const active = useActiveSection(ids);

  // Escape veya link tiklamasi menuyu kapatir ve focus'u dugmeye GERI VERIR.
  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <header className="nav-bar sticky top-0 z-40">
      <Container>
        <div className="flex h-[var(--nav-height)] items-center justify-between gap-4">
          <a href="#main" className="rule font-mono text-nav font-medium text-text uppercase">
            {site.wordmark}
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <NavLink href={`#${item.id}`} label={item.label} active={active === item.id} />
                </li>
              ))}
            </ul>
          </nav>

          {/*
            IKI AKSIYON, IKISI DE `ghost`. §5.1 Navigation'a tek yesil odak
            veriyor ve o aktif nav linki - buradaki tuslarin hicbiri accent
            tasimiyor.

            Contact bir BOLUM DEGIL artik: tek bir adres icin kendi basligi olan
            bir bolum fazla agirdi. Ziyaretcinin iletisim aradigi yer nav, adresi
            okudugu yer footer.

            Nav.da etiket kisa (`Contact`), adresin kendisi footer'da tam yazili.
            Sebebi olculdu: `lg` esigi 1024px ve orada wordmark + bes... dort nav
            linki + iki aksiyon zaten dar; tam adresi buraya yazmak bari
            tasitiyordu.

            `external` YOK: `mailto` yeni sekmede acilacak bir sayfa degil, posta
            istemcisine devrediyor - dis link ikonu orada yanlis soyler.
          */}
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
