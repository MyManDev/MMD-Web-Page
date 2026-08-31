"use client";

import { useEffect, useRef } from "react";
import type { Site } from "@/content";
import { Button } from "@/components/ui";
import { NavLink } from "./NavLink";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mobil menu. Klavye davranisi docs/design-spec.md §7.4:
 * acilinca focus ilk linke gecer, focus menu icinde doner, arkadaki sayfa
 * inert, Escape kapatir ve focus'u dugmeye GERI VERIR, acikken scroll kilitli.
 */
export function MobileMenu({
  id,
  open,
  items,
  githubUrl,
  activeId,
  onClose,
}: {
  id: string;
  open: boolean;
  items: Site["nav"];
  githubUrl: string;
  activeId: string | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Acilinca focus ilk odaklanabilir ogeye gecer.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open]);

  // Sayfa scroll kilidi - pozisyon korunarak.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Arkadaki sayfa inert. Menu <header> icinde yasadigi icin header disindaki
  // govde cocuklari isaretlenir; kapaninca geri alinir.
  useEffect(() => {
    if (!open) return;
    const header = panelRef.current?.closest("header");
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== header && el instanceof HTMLElement,
    ) as HTMLElement[];
    for (const el of siblings) el.inert = true;
    return () => {
      for (const el of siblings) el.inert = false;
    };
  }, [open]);

  // Escape kapatir; Tab focus'u menu icinde dondurur.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      id={id}
      ref={panelRef}
      hidden={!open}
      className="fixed inset-x-0 top-[var(--nav-height)] bottom-0 z-50 bg-surface px-5 pt-8 lg:hidden"
    >
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink
              href={`#${item.id}`}
              label={item.label}
              active={activeId === item.id}
              onNavigate={onClose}
            />
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button href={githubUrl} variant="ghost" external>
          GitHub
        </Button>
      </div>
    </div>
  );
}
