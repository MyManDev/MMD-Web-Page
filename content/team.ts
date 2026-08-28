import type { TeamMember } from "./schema";

/**
 * ================================================================
 *  MOCK VERI - BU DOSYA `main`'E MERGE EDILMEZ.
 * ================================================================
 *
 * Bolumun tasarimi, hover davranisi ve testleri gorulebilsin diye gecici
 * veriyle dolduruldu. Gercek biyografiler (#16) ve gercek fotograflar gelene
 * kadar bu dal acik kalir.
 *
 * Sahte olan her metin "MOCK" diye BAGIRIYOR ve fotograflarin uzerinde de
 * "MOCK" yazili. Bu kasitli: makul gorunen bir sahte metin, hatadan kotudur
 * cunku incelemeden sagi kalir (architecture.md §3). Gozden kacip yayina
 * giderse rezil olsun, inandirici olmasin.
 *
 * Gercek olan tek sey isimler ve bilinen GitHub adresleri - onlar repoda
 * zaten kayitli (CODEOWNERS, working-agreement.md §1). Ertugrul'un soyadi ve
 * GitHub adresi BILINMIYOR, o yuzden uydurulmadi.
 */
export const team: TeamMember[] = [
  {
    slug: "ibrahim-ersan-ozdemir",
    name: "İbrahim Ersan Özdemir",
    role: "MOCK — rol yazilmadi (#16)",
    bio: "MOCK — biyografi yazilmadi (#16). Bu metin yayina girmez; kart duzeni ve hover davranisi gorulebilsin diye duruyor.",
    githubUrl: "https://github.com/SpeedyV5",
    linkedinUrl: "https://www.linkedin.com/in/ibrahim-ersan-özdemir15",
    photo: "/people/ibrahim-ersan-ozdemir-720.webp",
    order: 0,
  },
  {
    slug: "tunay-aslan",
    name: "Tunay Aslan",
    role: "MOCK — rol yazilmadi (#16)",
    bio: "MOCK — biyografi yazilmadi (#16). Bu metin yayina girmez; kart duzeni ve hover davranisi gorulebilsin diye duruyor.",
    githubUrl: "https://github.com/tunayaslan",
    linkedinUrl: "https://www.linkedin.com/in/halis-tunay-aslan/",
    photo: "/people/tunay-aslan-720.webp",
    order: 1,
  },
  {
    slug: "ertugrul-soydal",
    name: "Ertuğrul Soydal",
    role: "MOCK — rol yazilmadi (#16)",
    bio: "MOCK — biyografi yazilmadi (#16). Bu metin yayina girmez; kart duzeni ve hover davranisi gorulebilsin diye duruyor.",
    githubUrl: "https://github.com/ErtugrulS32175",
    // MOCK - LinkedIn adresi CV'de yok ve uydurulmadi; gercegi beklenıyor.
    linkedinUrl: "https://www.linkedin.com/in/ertuğrul-soydal-32b94a256/",
    photo: "/people/ertugrul-soydal-720.webp",
    order: 2,
  },
];
