import type { Project } from "./schema";

/**
 * Yayinlanan proje kayitlari. Football Squad Optimizer'in gercek verileri
 * architecture.md §3'te kararlastirildi; buradaki kayit onlari tekrar etmiyor,
 * uyguluyor.
 *
 * `summary` uygulamanin kendi basligindaki cumle - vitrine ozel yeni bir metin
 * yazilmadi (CLAUDE.md kural 5).
 *
 * `description` yazildi ve DOGRULANABILIR olgulara dayaniyor; hicbiri
 * uydurulmadi. Dayandigi yerler:
 *   - 100m butce           -> uygulamanin kendi ekraninda "Budget GBP100.0m"
 *   - CP-SAT ve optimallik -> tech tag'i + ekranda "Solver: OPTIMAL,
 *                             Proved Optimal, Single Thread"
 *   - oyuncu basina tahmin -> Starting XI kartlarindaki projeksiyon degerleri
 *   - projeksiyon vs sonuc -> "Projection Versus Outcome" ve sezon satirindaki
 *                             "Versus Projection -30.1"
 *
 * "Fantasy Premier League" ibaresi bu listeden TURETILMISTI, dogrudan
 * gorulmemisti - ekrandaki `Gameweek`, `Transfer hit points` ve butce ifadesi
 * oraya isaret ediyordu. Cikarim olarak kaldigi surece kayda gecirildi ve
 * 2026-08-30'da sahibi tarafindan ONAYLANDI. Artik cikarim degil.
 *
 * Son cumle ovunme degil: uygulama kendi tahmininin KAYBETTIGI haftalari da
 * yayinliyor. Ayni durustluk bu deponun kendi sayisinda da var - "0 ML models
 * promoted to production".
 *
 * `metrics` artik UC KISIT tasiyor (§4.6, karar sahibi tarafindan degistirildi).
 * Etiketler dogal yazimda duruyor; buyuk harfe MetricRow'un CSS'i ceviriyor,
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
    description:
      "A Fantasy Premier League squad is a constrained optimisation problem, so SquadOpt solves it " +
      "as one: a £100m budget, the squad rules and a projection for every player go in, and " +
      "CP-SAT returns not a good squad but a proof that no better one exists under those " +
      "constraints. Every gameweek it publishes what it projected beside what actually happened, " +
      "including the weeks the projection lost.",
    tags: ["Python", "OR-Tools CP-SAT", "ML", "React"],
    repoUrl: "https://github.com/MyManDev/football-squad-optimizer",
    liveUrl: "https://squadopt.mymandev.com/",
    screenshot: "/projects/football-squad-optimizer-1792.webp",
    order: 0,
    /* UC KISIT, ve bu bir kararı geri aliyor. Once burada tek bir sayi vardi:
       `0 - ML models promoted to production`. architecture.md §4.6 onu IMZA OGE
       olarak secmisti ve gerekcesi yaziliydi: 215 commit ve 2.600 test her
       vitrinde bulunur, terfi etmemis model ise olculmus bir basarisizlik ve
       tamamen size ait.

       Karar sahibi degistirdi ve NE KAYBEDILDIGI §4.6'da yazili: uc yeni sayi
       da dogrulanabilir (FPL kadrosu 15 oyuncu, £100m butce uygulamanin kendi
       ekraninda, "1 optimal squad" CP-SAT'in dondurdugu kanit) - yani kaybedilen
       sey dogruluk degil, IMZA.

       Sayilar uydurulmadi ve ovunme de degil: ucu de projenin KISITLARI, yani
       "ne kadar iyiyiz" degil "hangi kutuya sigmak zorundaydi" diyor. */
    metrics: [
      { value: "15", label: "Players optimised" },
      { value: "£100m", label: "Budget constraint" },
      { value: "1", label: "Optimal squad" },
    ],
  },
];
