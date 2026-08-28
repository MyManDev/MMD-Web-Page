import type { Project } from "./schema";

/**
 * Yayinlanan proje kayitlari. Football Squad Optimizer'in gercek verileri
 * architecture.md §3'te kararlastirildi; buradaki kayit onlari tekrar etmiyor,
 * uyguluyor.
 *
 * `summary` uygulamanin kendi basligindaki cumle - vitrine ozel yeni bir metin
 * yazilmadi (CLAUDE.md kural 5).
 *
 * `metrics` BILEREK yok: imza sayisinin ifadesi paylasilan karar alani ve henuz
 * yazilmadi (#17). design-spec.md §3.3.1'e gore `metrics` bossa satir hic render
 * edilmez; bos cerceve veya "—" gosterilmez.
 *
 * `screenshot` en buyuk uretilmis varyanti gosterir - srcset destegi olmayan
 * tarayicinin dusecegi yer burasi. Diger genislikler ayni tabandan turetiliyor
 * (lib/images.ts) ve dosyalari scripts/optimize-images.mjs uretiyor. Kaynak
 * goruntu servis edilmiyor: assets/screenshots/ altinda duruyor.
 */
export const projects: Project[] = [
  {
    slug: "football-squad-optimizer",
    name: "Football Squad Optimizer",
    summary: "A decision, and what it rests on.",
    tags: ["Python", "OR-Tools CP-SAT", "ML", "React"],
    repoUrl: "https://github.com/MyManDev/football-squad-optimizer",
    liveUrl: "https://squadopt.mymandev.com/",
    screenshot: "/projects/football-squad-optimizer-1440.webp",
    order: 0,
  },
];
