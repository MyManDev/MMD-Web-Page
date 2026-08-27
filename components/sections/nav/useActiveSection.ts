"use client";

import { useEffect, useState } from "react";

/**
 * Aktif bolum tespiti. TEK IntersectionObserver, yalnizca burada.
 * Baska hicbir yerde scroll dinlenmez (CLAUDE.md kural 3).
 *
 * rootMargin ust marji navbar'i duser, alt marj -%55 bir bolumun ekranin ust
 * yarisina girdigi anda aktif sayilmasini saglar; aksi halde iki bolum ayni
 * anda aktif gorunuyor. docs/design-spec.md §3.1
 *
 * Bolumler henuz yoksa (Faz 3 devam ediyor) hicbir link aktif olmaz.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Navbar yuksekligi breakpoint'e gore degisiyor; degeri token'dan okuyoruz
    // ki burada ikinci bir kayit olusmasin (app/tokens.css).
    const navHeight =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height"), 10) ||
      0;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Birden fazla bolum gorunurse belge sirasinda ilk olan kazanir.
        const first = ids.find((id) => visible.has(id));
        setActive(first ?? null);
      },
      { rootMargin: `-${navHeight}px 0px -55% 0px`, threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
