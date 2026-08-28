import type { Site } from "./schema";

/**
 * Marka ve navigasyon. Yalnizca KARAR VERILMIS degerler.
 * Wordmark ve kanonik adres: architecture.md §7. Bolum sirasi: §2.
 *
 * 03 "Who we are" kolektifi birlikte anlatir, 04 "Team" kisileri tek tek
 * tanitir. Once kim oldugumuz, sonra kim oldugumuz - genelden tekile.
 *
 * Etiketler UYDURULMADI: "Who we are" karar sahibinden geldi, "Team" ise
 * zaten commit'liydi ve korundu (CLAUDE.md kural 5).
 */
export const site: Site = {
  wordmark: "MyManDev",
  canonicalUrl: "https://mymandev.com",
  repoUrl: "https://github.com/MyManDev/MMD-Web-Page",
  copyrightYear: 2026,
  nav: [
    { id: "hero", number: "01", label: "Hero" },
    { id: "projects", number: "02", label: "Projects" },
    { id: "who-we-are", number: "03", label: "Who we are" },
    { id: "team", number: "04", label: "Team" },
  ],
};
