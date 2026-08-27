import type { Site } from "./schema";

/**
 * Marka ve navigasyon. Yalnizca KARAR VERILMIS degerler.
 * Wordmark ve kanonik adres: architecture.md §7. Bolum sirasi: §2.
 */
export const site: Site = {
  wordmark: "MyManDev",
  canonicalUrl: "https://mymandev.com",
  repoUrl: "https://github.com/MyManDev/MMD-Web-Page",
  copyrightYear: 2026,
  nav: [
    { id: "hero", number: "01", label: "Hero" },
    { id: "projects", number: "02", label: "Projects" },
    { id: "team", number: "03", label: "Team" },
    { id: "about", number: "04", label: "About" },
  ],
};
