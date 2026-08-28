import type { Project } from "./schema";

/**
 * Yayinlanan proje kayitlari. Football Squad Optimizer'in gercek verileri
 * architecture.md §3'te kararlastirildi; buradaki kayit onlari tekrar etmiyor,
 * uyguluyor.
 *
 * `summary` uygulamanin kendi basligindaki cumle - vitrine ozel yeni bir metin
 * yazilmadi (CLAUDE.md kural 5).
 *
 * `metrics` imza ogesi (architecture.md §4.6): olculmus, dogrulanabilir ve
 * ovunme olmayan tek sayi. Deger uydurulmadi - §4.6'nin sayilan gercek
 * malzemesinden secildi ve ifadesi paylasilan karar alaninda onaylandi (#17).
 * Etiket dogal yazimda duruyor; buyuk harfe MetricRow'un CSS'i ceviriyor,
 * metin iki farkli bicimde iki kez yazilmiyor.
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
    metrics: [{ value: "0", label: "ML models promoted to production" }],
  },
];
