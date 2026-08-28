import type { TeamMember } from "./schema";

/**
 * ================================================================
 *  BU DOSYA `main`'E MERGE EDILMEZ - HENUZ.
 * ================================================================
 *
 * Adlar, roller, biyografiler ve linkler GERCEK. Biyografiler uc CV'den
 * cikarildi, ovgu sifati eklenmedi ve dogrulanamayan hicbir sey yazilmadi.
 * Yine de ONAY BEKLIYORLAR (#16): kisinin kendi metnini gormeden yayina
 * girmez.
 *
 * MOCK OLAN TEK SEY FOTOGRAFLAR. assets/people/ altindaki uc dosya uzerinde
 * "MOCK" yazili; gercek fotograflar gelince degistirilecek. Sahtenin bagirmasi
 * kasitli - makul gorunen bir sahte, hatadan kotudur cunku incelemeden sag
 * kalir (architecture.md §3).
 *
 * Uzunluklar olculdu, secilmedi: 26-28 kelime, her kartta 5 satir. 30'u gecen
 * bir biyografi kartlari birbirinden farkli yukseklige goturuyor
 * (design-spec.md §3.5).
 */
export const team: TeamMember[] = [
  {
    slug: "ibrahim-ersan-ozdemir",
    name: "İbrahim Ersan Özdemir",
    role: "Full-stack & applied AI",
    bio: "Computer engineering graduate. React and React Native on the surface; ANNs, LLMs and retrieval pipelines underneath — RAG with local inference, computer vision, and machine learning on real datasets.",
    githubUrl: "https://github.com/SpeedyV5",
    linkedinUrl: "https://www.linkedin.com/in/ibrahim-ersan-ozdemir15",
    photo: "/people/ibrahim-ersan-ozdemir-800.webp",
    order: 0,
  },
  {
    slug: "tunay-aslan",
    name: "Tunay Aslan",
    role: "Backend & security engineering",
    bio: "Computer engineering student at Boğaziçi. Builds systems that watch other systems: a secret-scanning pipeline across an organisation's repositories, and a routing engine over a hundred thousand hosts.",
    githubUrl: "https://github.com/tunayaslan",
    linkedinUrl: "https://www.linkedin.com/in/halis-tunay-aslan/",
    photo: "/people/tunay-aslan-800.webp",
    order: 1,
  },
  {
    slug: "ertugrul-soydal",
    name: "Ertuğrul Soydal",
    role: "Optimisation & modelling",
    bio: "Computer science and industrial engineering, double major, mathematics minor at Sabancı. Optimisation and modelling: Gurobi, statistical analysis, and the maths under the models. Also taught calculus.",
    githubUrl: "https://github.com/ErtugrulS32175",
    linkedinUrl: "https://www.linkedin.com/in/ertuğrul-soydal-32b94a256/",
    photo: "/people/ertugrul-soydal-800.webp",
    order: 2,
  },
];
