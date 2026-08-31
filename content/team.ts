import type { TeamMember } from "./schema";

/**
 * Yayinlanan ekip kayitlari. Uc kisi de GERCEK ve hepsi onaylandi (#16).
 *
 * Biyografiler uc CV'den cikarildi: ovgu sifati eklenmedi ve dogrulanamayan
 * hicbir sey yazilmadi. Uzunluklar olculdu, secilmedi - 26-28 kelime, her
 * kartta 5 satir. 30'u gecen bir biyografi kartlari birbirinden farkli
 * yukseklige goturuyor (design-spec.md §3.5).
 *
 * Fotograflar gercek ve sahiplerinden geldi; mock donem kapandi. Kaynaklar
 * assets/people/ altinda, servis edilen varyantlari scripts/optimize-images.mjs
 * uretiyor. Kadraj kart icin secildi: kartin alt ucte biri metin paneli, yani
 * yuz ust yarida durmali (§3.5).
 */
export const team: TeamMember[] = [
  {
    slug: "ibrahim-ersan-ozdemir",
    name: "İbrahim Ersan Özdemir",
    role: "Full-stack & applied AI",
    bio: "Computer engineering graduate. React and React Native on the surface; ANNs, LLMs and retrieval pipelines underneath: RAG with local inference, computer vision, and machine learning on real datasets.",
    githubUrl: "https://github.com/SpeedyV5",
    linkedinUrl: "https://www.linkedin.com/in/ibrahim-ersan-ozdemir15",
    photo: "/people/ibrahim-ersan-ozdemir-1000.webp",
    order: 0,
  },
  {
    slug: "tunay-aslan",
    name: "Tunay Aslan",
    role: "Backend & security engineering",
    bio: "Computer engineering student at Boğaziçi. Builds systems that watch other systems: a secret-scanning pipeline across an organisation's repositories, and a routing engine over a hundred thousand hosts.",
    githubUrl: "https://github.com/tunayaslan",
    linkedinUrl: "https://www.linkedin.com/in/halis-tunay-aslan/",
    photo: "/people/tunay-aslan-1000.webp",
    order: 1,
  },
  {
    slug: "ertugrul-soydal",
    name: "Ertuğrul Soydal",
    role: "Optimisation & modelling",
    bio: "Computer science and industrial engineering, double major, mathematics minor at Sabancı. Optimisation and modelling: Gurobi, statistical analysis, and the maths under the models. Also taught calculus.",
    githubUrl: "https://github.com/ErtugrulS32175",
    linkedinUrl: "https://www.linkedin.com/in/ertuğrul-soydal-32b94a256/",
    photo: "/people/ertugrul-soydal-1000.webp",
    order: 2,
  },
];
