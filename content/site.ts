import type { Site } from "./schema";

/**
 * Marka, metin ve navigasyon. Yalnizca KARAR VERILMIS degerler.
 * Wordmark ve kanonik adres: architecture.md §7. Bolum sirasi: §2.
 *
 * METINLER UYDURULMADI (#15). Manifesto karar sahibinin kendi anlatimindan
 * yazildi; prensipler docs/working-agreement.md §2.1, §2, §3.2 ve
 * architecture.md §8 ile CLAUDE.md kural 8'den damitildi - yani zaten bu
 * ekibin yazdigi kurallarin Ingilizcesi. Hero basligi manifestonun kendi
 * cumlesinden turedi, tersi degil.
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
  description:
    "Three engineers from Antalya Anadolu Lisesi building things together — applied AI, backend and security, optimisation and modelling.",
  hero: {
    title: "The goal changed. We didn't.",
    subtitle:
      "Applied AI, backend and security, optimisation and modelling — three disciplines, one collective, and every project published with the numbers it actually produced.",
  },
  whoWeAre: {
    manifesto:
      "We met at Antalya Anadolu Lisesi, one of Turkey's most prestigious high schools, and grew close studying for the university entrance exam — three friends held together by a shared goal. The goal has changed; the shape has not. We are here to do the work as well as it can be done, to catch each other's mistakes before they ship, to teach each other what we know, and to enjoy it.",
    principles: [
      "An observation becomes an issue, with evidence.",
      "A handed-over plan is checked against the code, not believed.",
      "Every change says what it did not change.",
      "Thresholds are written before the work, never fitted to it.",
      "A claim is not a measurement.",
    ],
  },
  copyrightYear: 2026,
  nav: [
    { id: "hero", label: "Hero" },
    { id: "projects", label: "Projects" },
    { id: "who-we-are", label: "Who we are" },
    { id: "team", label: "Team" },
  ],
};
