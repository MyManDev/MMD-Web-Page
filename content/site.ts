import type { Site } from "./schema";

/** Ana sayfa metni mevcut ekip hikayesi ve calisma alanlarindan kisaltildi. */
export const site: Site = {
  wordmark: "MyManDev",
  canonicalUrl: "https://mymandev.com",
  githubUrl: "https://github.com/MyManDev",
  description:
    "Two engineers from Antalya Anadolu Lisesi building things together: applied AI, optimisation and modelling.",
  home: {
    lead: "Two friends, building together.",
    story:
      "We met at Antalya Anadolu Lisesi. Today, we build software and explore applied AI, optimisation and modelling — learning from each other and checking each other's work along the way.",
  },
  email: "team@mymandev.com",
  footer: {
    tagline: "Built by friends.",
    closing: "Still Building",
  },
  copyrightYear: 2026,
  nav: [
    { id: "mymandev", label: "MyManDev", href: "/" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "team", label: "Team", href: "/team" },
  ],
};
