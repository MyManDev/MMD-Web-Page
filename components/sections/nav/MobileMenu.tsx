"use client";

import { type RefObject, useEffect, useRef } from "react";
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
  email,
  githubUrl,
  activeId,
  headerRef,
  onClose,
}: {
  id: string;
  open: boolean;
  items: Site["nav"];
  email: string;
  githubUrl: string;
  activeId: string | null;
  headerRef: RefObject<HTMLElement | null>;
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

  // Menu, header'in backdrop-filter sinirindan bagimsiz bir govde cocugu.
  useEffect(() => {
    if (!open) return;
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== headerRef.current && el !== panelRef.current && el instanceof HTMLElement,
    ) as HTMLElement[];
    const previous = siblings.map((el) => [el, el.inert] as const);
    for (const el of siblings) el.inert = true;
    return () => {
      for (const [el, inert] of previous) el.inert = inert;
    };
  }, [open, headerRef]);

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
      className="fixed inset-x-0 top-[var(--nav-height)] bottom-0 z-50 overflow-y-auto overscroll-contain bg-surface px-5 py-8 lg:hidden"
    >
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink
              href={item.href}
              label={item.label}
              active={activeId === item.id}
              onNavigate={onClose}
            />
          </li>
        ))}
      </ul>
      {/* Masaustu nav ile ayni iki aksiyon: menu bir kisayol degil, ayni
          olanaklarin dar ekrandaki hali. */}
      <div className="mt-8 flex flex-col items-start gap-3">
        <Button href={`mailto:${email}`} variant="ghost">
          Contact
        </Button>
        <Button href={githubUrl} variant="ghost" external>
          GitHub
        </Button>
      </div>
    </div>
  );
}
