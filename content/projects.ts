import type { Project } from "./schema";

/**
 * Yayinlanan proje kayitlari. Football Squad Optimizer'in gercek verileri
 * architecture.md §3'te kararlastirildi; buradaki kayit onlari tekrar etmiyor,
 * uyguluyor.
 *
 * METIN 2026-09-29'DA YENIDEN YAZILDI. Eski metin tek bir sistem kadrosunu
 * anlatiyordu; uygulama ise bir ligin uyelerini tek tek danisiyor. Uye
 * gorunumleri SquadOpt #215'le (2026-08-23) geldi, 2026-09-09'da ziyaretcinin
 * giris noktasi oldu ve #798 (2026-09-25) arayuzu yeniden tasarladi. Karar
 * sahibi metni SquadOpt deposuna dayanarak yazmayi devretti ve okuyup onayladi.
 * Dayanaklar o depoda (develop 152146bc; canli site site-2026-27-gw06-fix4,
 * web/src agaci develop ile ayni).
 *
 * `summary` uygulamanin KENDI cumlesi: Ingilizce meta aciklamasi
 * (web/src/i18n/messages.ts:123, "SquadOpt: a weekly FPL decision, and what it
 * rests on."), bastaki "SquadOpt: " olmadan. Eski ozet ("A decision, and what
 * it rests on.") uygulamanin basligindaki kisa cumleydi ve #798 o basligi
 * kaldirdi; bu uzun cumle hep meta aciklamasiydi. Vitrine ozel yeni bir cumle
 * yazilmadi (CLAUDE.md kural 5).
 *
 * `description` DOGRULANABILIR olgulara dayaniyor; hicbiri uydurulmadi:
 *   - bir lig, uyenin kendi kadrosu -> web/src/features/league/data.ts:237
 *       (SUPPORTED_LEAGUE_ID = 352490) ve messages.ts:552 ("The computation
 *       starts from this member's public squad.")
 *   - CP-SAT, 1/3/5 hafta -> pyproject.toml:15 (ortools) ve
 *       src/squadopt/application/advice_capabilities.py:21 (MEMBER_WINDOWS)
 *   - transfer, kaptan, ilk on bir -> web/src/features/league/pages/
 *       MemberAdviceCard.tsx:200 (her hamle icin bir degisiklik panosu), :838
 *       ve :851 (kaptan, yardimci kaptan); sahadaki ilk on bir MemberSquad.tsx:90
 *       (MemberPitch)
 *   - oyunun kurallari -> src/squadopt/optimization/config.py:72-73
 *       (squad_size 15, budget_tenths 1000 yani £100.0m); planlayici ayrica
 *       bankayi, transfer cezasini ve chip'leri modelliyor
 *   - kanitli / kanit eksik -> messages.ts:936-937 ("PROVEN · OPTIMAL",
 *       "Proved the best plan for its own objective.") ve :839 ("Proof
 *       incomplete")
 *   - kendi kagit kadrosu -> messages.ts:989-999 ("The system's record":
 *       SquadOpt squad, League mean, FPL average; "Its good weeks and its bad
 *       weeks are both here.")
 *
 * Eski metnin iki iddiasi bu yuzden kalkti. "A proof that no better one
 * exists" her plan icin dogru degil: GW6'da 45 saf-puan planinin 8'i kanitsiz
 * ve sayfa onlari oyle isaretliyor. "Every gameweek" de dogru degil: GW2 ve
 * GW3'te karar verilmedi. Yeni metin ikisini de uygulamanin kendi ayrimiyla
 * soyluyor.
 *
 * "Fantasy Premier League" ibaresi 2026-08-30'da sahibi tarafindan ONAYLANDI;
 * SquadOpt'un README'si de ayni adi kullaniyor.
 *
 * `metrics` iki kisit ve bir kanit sarti tasiyor (§4.6, karar sahibi
 * tarafindan degistirildi) ve yeniden yazimda DEGISMEDI: ucu de hala dogru. Etiketler dogal yazimda
 * duruyor; buyuk harfe MetricRow'un CSS'i ceviriyor, metin iki farkli bicimde
 * iki kez yazilmiyor.
 *
 * `screenshots` uygulamanin Ingilizce arayuzunden, 352490 liginde ve karar
 * sahibinin kendi uye satirindan alindi: ekrandaki takim adi ve FPL numarasi
 * onun ve yayinlanmalarini onayladi. Lig tablosu KULLANILMADI, cunku on dort
 * baska kisinin adini tasiyor. Sira bir okuma sirasi: bu haftanin hamlesi,
 * hamleden sonraki kadro, sonra onerilerin gecmisi.
 *
 * `caption`lar karenin kendi ekran metinlerinden (SquadOpt web/src/i18n/
 * messages.ts): "This week's move" (:887), "PROVEN · OPTIMAL" (:936), "Squad
 * after the transfers" (:957), "Weekly suggestion history" (:12), "the site
 * published, recorded before the deadline" (:30), uyenin gercek sonucu (:24).
 *
 * `alt` basligi TEKRARLAMIYOR, basligin soylemedigini tasiyor: figur adini
 * basliktan aliyor ve ekran okuyucu ikisini art arda okuyor (WAI'nin gorsel
 * rehberi bitisik basligin alt'ta yinelenmemesini istiyor). Alt'taki her sey
 * kendi karesinde gorunuyor: iki degisiklik panosu, +2.63 ve kaptan Haaland;
 * "3-5-2 · captain doubled: 56.15 xP" ve dort yedek; GW4 ve GW5'te 83.0 / 82.0
 * ve 67.0 / 59.0.
 *
 * Her `src` en buyuk uretilmis varyanti gosterir - srcset destegi olmayan
 * tarayicinin dusecegi yer burasi. Diger genislikler ayni tabandan turetiliyor
 * (lib/images.ts) ve dosyalari scripts/optimize-images.mjs uretiyor. Kaynak
 * goruntuler servis edilmiyor: assets/screenshots/ altinda duruyorlar.
 */
export const projects: Project[] = [
  {
    slug: "football-squad-optimizer",
    name: "Football Squad Optimizer",
    summary: "A weekly FPL decision, and what it rests on.",
    description:
      "SquadOpt treats Fantasy Premier League as the constrained optimisation problem it is. " +
      "For each member of one mini-league it starts from that member's own squad and uses " +
      "CP-SAT to plan the next one, three or five gameweeks: transfers, captain and starting " +
      "eleven, inside the game's rules. A plan is marked proven only when the solver proved it " +
      "best for its own objective; otherwise the page says the proof is incomplete. It also " +
      "keeps a paper squad of its own and publishes its record beside the league mean and the " +
      "FPL average, bad weeks included.",
    tags: ["Python", "OR-Tools CP-SAT", "ML", "React"],
    repoUrl: "https://github.com/MyManDev/football-squad-optimizer",
    liveUrl: "https://squadopt.mymandev.com/",
    screenshots: [
      {
        src: "/projects/football-squad-optimizer-move-1792.webp",
        alt:
          "Gameweek 6 for one member: two substitution boards, +2.63 expected points against " +
          "keeping the squad, and Haaland as captain.",
        caption: "This week's move: two transfers and the captain, proven optimal.",
      },
      {
        src: "/projects/football-squad-optimizer-pitch-1792.webp",
        alt:
          "A 3-5-2 with the captain counted twice for 56.15 expected points, and four " +
          "substitutes below the pitch.",
        caption: "The squad after the move, on the pitch, with each player's expected points.",
      },
      {
        src: "/projects/football-squad-optimizer-history-1792.webp",
        alt:
          "A table for gameweeks 4 and 5: the suggestion scored 83 and 67 net, the member's " +
          "squad 82 and 59.",
        caption:
          "The suggestion the site published, recorded before the deadline, beside the member's " +
          "actual score.",
      },
    ],
    order: 0,
    /* UC SAYI, ve bu bir kararı geri aliyor. Once burada tek bir sayi vardi:
       `0 - ML models promoted to production`. architecture.md §4.6 onu IMZA OGE
       olarak secmisti ve gerekcesi yaziliydi: 215 commit ve 2.600 test her
       vitrinde bulunur, terfi etmemis model ise olculmus bir basarisizlik ve
       tamamen size ait.

       Karar sahibi degistirdi ve NE KAYBEDILDIGI §4.6'da yazili: uc yeni sayi
       da dogrulanabilir (FPL kadrosu 15 oyuncu ve £100m butce SquadOpt'un cozucu
       ayarinda, src/squadopt/optimization/config.py:72-73; "1 optimal squad"
       sistemin kendi kadrosu icin CP-SAT'in dondurdugu kanit - canli bir karar
       OPTIMAL olmak zorunda) - yani kaybedilen sey dogruluk degil, IMZA.

       Sayilar uydurulmadi ve ovunme de degil: ikisi projenin KISITI, ucuncusu
       bir KANIT SARTI, yani "ne kadar iyiyiz" degil "hangi kutuya sigmak ve
       neyi kanitlamak zorundaydi" diyor. */
    metrics: [
      { value: "15", label: "Players optimised" },
      { value: "£100m", label: "Budget constraint" },
      { value: "1", label: "Optimal squad" },
    ],
  },
];
