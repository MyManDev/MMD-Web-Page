# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-09-30
**Yer:** iş
**Aşama:** Faz 4, site yayında. Karar sahibi dünkü SquadOpt kartını beğendi ("beğendim genel
olarak"). Bugün iki iş yapıldı:

- **Temizlik:** salt okunur bir denetim 57 bulgu doğruladı. Kopyalar ayıklanınca yaklaşık 40 iş
  kaldı ve beş PR'da kapandı (#132–#136).
- **Contributors listesi:** GitHub sayfasındaki listede `claude` görünüyor. Sebep bulundu ve
  yenisinin oluşması mekanik olarak engellendi (#136). **Mevcut girdi hâlâ görünüyor**; kaldırma
  adımı karar sahibinde (aşağıda).

Açık issue: yok.

## Dal ve çalışma ağacı

- Dal: `main` (`e061cb1`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor (`EXIT=0`). İlk adım artık trailer kapısı. Sayılar:
  **62 birim, 323 E2E** (33'ü viewport'a göre atlanıyor), payload **135.3 KiB / 150.0 KiB**.
- Açık PR: yok
- GitHub'da yalnızca `main` var; merge edilen dal kendiliğinden siliniyor. Eski 67 dal
  `archive/<dal>` etiketlerinde; hiçbiri trailer'lı bir commit'e ulaşmıyor (ölçüldü).
- **Yerel durum:**
  - Tek çalışma ağacı ve yalnızca `main`.
  - `refs/original/*` silindi. Bu 27 Ağustos'taki geçmiş yeniden yazımının yerel yedeğiydi ve
    trailer'lı eski commit'leri tutuyordu; GitHub'a hiç gitmemişti.
  - Ölçüm script'leri `node_modules/.cache/mmd-measure/` altında (commit'lenmez). İçerik: nav ve
    proje kontrastı, `ghost-contrast.mjs` (hayalet üstünde kontrast, üç cihaz),
    `verify-live.cjs` (canlı doğrulama), ekran görüntüsü alma.

## Yayın

| Ne              | Nerede                                 |
| --------------- | -------------------------------------- |
| Kanonik adres   | `https://mymandev.com`                 |
| Host            | Cloudflare Pages, proje adı `mymandev` |
| Production dalı | `main` → otomatik deploy               |

#136'nın production deploy'u (`e061cb1`) başarılı. Bugünkü PR'lar görsel çıktıyı değiştirmedi;
dün #129 üzerinde yapılan canlı ölçüm (geçiş, daktilo, hayalet, taşma) geçerli.

## Sıradaki iş

**1. Contributors'taki `claude` girdisi — karar sahibinin adımı.**

Ölçülen durum (2026-09-30):

- **Temiz olanlar:**
  - `main`'deki hiçbir commit `Co-authored-by:` taşımıyor; 67 etiket de temiz.
  - REST `contributors?anon=1` ve `stats/contributors` iki kişi döndürüyor. `stats/contributors`
    co-author'ları da sayıyor, Insights grafiği onunla aynı.
- **Hâlâ görünen:** sidebar (`contributors_list`) üç kişi gösteriyor, üçüncüsü `claude`
  (08:42 UTC).
- **Silemediğimiz:** trailer'lı 8 commit yalnızca PR #1–#5 ve #22'nin ref'lerinde
  (`refs/pull/N/head`). Kullanıcı bu ref'leri silemiyor.
- **Muhtemel sebep:** GitHub sidebar'ın nasıl hesaplandığını belgelemiyor. Topluluktaki kanıt,
  bunun bayat bir önbellek olduğu yönünde: PR ref'i yerinde duran bir başka depoda girdi bir süre
  sonra kendiliğinden kalktı.

Denenecek sıra:

1. **Varsayılan dalı yeniden adlandırıp geri almak** (en çok doğrulanan topluluk çözümü).
   - Nasıl: Settings → Branches'ta `main` → `main-tmp` → `main`. Ya da
     `gh api -X POST repos/MyManDev/MMD-Web-Page/branches/main/rename -f new_name=main-tmp` ve
     aynısı geri.
   - Bu oturum denedi; Claude Code'un izin denetimi adımı "paylaşılan kaynak" diye durdurdu.
     Karar sahibi yapmalı.
   - Açık PR olmadığında yapılmalı.
   - Ruleset `main protect` `~DEFAULT_BRANCH`'e bağlı, yani dalı takip eder. Ama `deletion` kuralı
     adlandırmayı engelleyebilir. Engellerse ruleset birkaç dakikalığına kapatılıp geri açılır.
2. **Ölçüm:** her adımdan hemen sonra ve birkaç dakika sonra
   `curl -s "https://github.com/MyManDev/MMD-Web-Page/contributors_list?current_repository=MMD-Web-Page&deferred=true" | grep -o 'alt="@[^"]*"'`.
   Tarayıcının önbelleği işe karışmaz.
3. **Kalkmazsa:**
   - **GitHub Community'de gönderi.** Ücretsiz planda Support bu talepleri kapatıyor; 30 Ağustos'taki
     talebimiz de kapandı (#67).
   - **Daha ağır seçenekler, hepsi karar sahibinin:**
     - Görünürlüğü özel yapıp geri açmak. Yıldız ve izleyici sıfır, bedel düşük; ama ücretsiz planda
       ruleset'ler özel depoda uygulanmayabilir.
     - Depoyu başka bir hesaba devredip geri almak.

**2. İki tasarım sorusu (denetimin reddettiği, çünkü karar insanda):**

- **Kart iç boşluğu ve ızgara aralığı:** design-spec §1 24/32px diyor ve bunlar token olarak
  tanımlı (`--spacing-gutter`, `--spacing-card-lg`). Kod bu token'ları kullanmıyor: mobilde
  `gap-8`/`gap-10`, kart iç boşluğu `lg`'de de 24px. Belge mi koda uysun, kod mu belgeye?
- **`NOTICE`:** var olmayan bir `public/favicon*` yolunu sayıyor; ikon `app/icon.png`. Hukuki
  metin, karar sahibinin.

**Ayar noktaları** (dünkü hareketler, beğenildi):

| Ne                     | Nerede                                                           | Bugün               |
| ---------------------- | ---------------------------------------------------------------- | ------------------- |
| Görüntü geçişi         | `ScreenshotCarousel.tsx`, `SLOT` (`delay-900`, `duration-900`)   | 900ms               |
| Hayaletin geçişi       | `ScreenshotGhost.tsx`, `IMAGE` — test karuselle eşitliği tutuyor | 900ms               |
| Hayaletin görünümü     | `ScreenshotGhost.tsx`, `LAYER`                                   | %12, 6px, %60, 48px |
| Daktilo hızı           | `TypedCaption.tsx`, `CAPTION_STEP_MS`                            | 25ms/harf           |
| Otomatik geçiş aralığı | `lib/deck.ts`, `AUTO_ADVANCE_MS` (desteyle ortak)                | 7s                  |

## Bitmemiş iş

- **WAF kuralı** `block removed portraits`: ~2026-10-05'ten sonra kuralı kapat ve iki adresi ölç.
  404 dönüyorsa kuralı sil; hâlâ resim dönüyorsa kuralı geri aç.
- **İkinci proje geldiğinde yığın ölçülmeli.** `Projects.tsx`'teki "yığın uyandığında
  doğrulanacak" notu bunu işaret ediyor. Tek projede görünmeyen üç şey:
  - **Zemin:** `ProjectCard`'ın kendi zemini yok; üste binen kart alttakini örtmeyebilir. Ölçülmedi.
  - **Odak:** odaklanan kartın `z-index` kazanması (`:focus-within`) uygulanmadı. `z-index` satır içi
    style'da, tek bir sınıf onu ezemez. design-spec §3.3.2'de "henüz uygulanmadı" diye yazılı.
  - **Hayalet:** sonraki kartın hayaleti, yaklaşırken öncekinin alt kenarına biniyor. Bu bilerek
    bırakıldı (`ScreenshotGhost.tsx`). Reduced-motion'daki düz listede kartlar arasında 64px var.
- **Git geçmişi** ayrılan kişinin fotoğrafını ve biyografisini taşıyor (depo herkese açık, #44
  dahil). Yeniden yazmak `non_fast_forward` kuralına çarpar; yalnızca kendisi talep ederse ayrı bir iş.

**Bugün kapanan:**

- **Yüksek DPR'de hayalet kontrastı** ölçüldü: 1440 DPR 1, 390 DPR 2 ve Pixel 7 DPR 2.625'te en
  kötü 5.92; hayaletsiz 8.50. design-spec §3.3.1 güncel.
- **Dünkü "konu dışı" maddeler** #134 ve #135'te kapandı: "5/8", bekleyen biyografi satırları,
  yorum dili.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da; bugün yeni satır yok. Bugünkü PR'lar kararları
değil, belgeyi ve yorumları koda uydurdu.

**Karar sahibinin bugünkü sözleri:**

- İstek: "beğendim genel olarak yapmamız gereken ufak şeyler varsa yap temiz bir şkeilde bırakalım"
- Contributors: "buna sebep olabilecek her şeyi bak bunun gözükmesini istemiyoruz. her şeyi
  denediğinden emin ol hala kalkmamış olursa ticket atarız"
- **Onay.** #132–#136 ve bu devir PR'ı şu cevapla merge edildi: "Evet, hepsini merge et
  (Önerilen)". Soru şuydu: "Temizlik PR'larından paylaşılan yüzeye (docs/, CLAUDE.md, .github/,
  app/globals.css) dokunanları da kapılar ve CI yeşil olunca merge edeyim mi?" Onay bu işler
  içindi; genel kural değişmedi (`working-agreement.md` §1).

## Tuzaklar ve notlar

Bugün ölçümle bulunanlar:

- **Trailer'ın tek kaynağı Claude Code'un kendi yönergesi.** `.claude/settings.json`
  (`attribution` boş) onu kapatıyor ve yönerge DALLA BİRLİKTE değişiyor (ölçüldü). Ayar dosyası
  olmayan bir dala geçince oturum yeniden "imza satırı ekle" dedi, dosyanın olduğu dala dönünce
  "ekleme". Yani #136'dan eski bir dalda çalışırken son savunma `pnpm gates`'in ilk adımı
  (`pnpm trailers`). O da `origin/main` yoksa kontrolü atlar ve bunu yazar.
- **Contributor sayımları üç ayrı yerden geliyor:**
  - REST `/contributors` co-author'ları saymıyor. Temiz bir cevap bir şey kanıtlamaz.
  - `stats/contributors` sayıyor.
  - Sidebar ayrı ve belgelenmemiş; `contributors_list` uç noktasıyla ölç.
- **Claude Code'un izin denetimi dal yeniden adlandırmayı durdurdu**, bir kez de
  `git fetch --prune` içeren bir komutu ("paylaşılan kaynak"). Bu tür adımlar karar sahibinde.
- **Workflow'un `isolation: 'worktree'` seçeneği:**
  - `.claude/worktrees/` altında ağaç açıyor ve `worktree-*` dalları bırakıyor. Klasör artık
    `.gitignore`'da; iş bitince `git worktree remove` ile kaldır ve dalları sil.
  - Kabuğun cwd'si ağacın içindeyse Windows klasörü kilitliyor; silmeyi ana dizinden yap.
  - Bu ağaçlarda `node_modules` yok. `../../../node_modules/.bin/<araç>` çalışıyor ama
    `pnpm gates` çalışmıyor; kapıları ana ağaçta koş.
- **Birden fazla PR'ı sırayla göndermek:**
  - Dalları üst üste diz ve her birinin kapısını yığılmış ağaçta koş.
  - Alttaki squash edilince üsttekini `git rebase --onto origin/main <eski-alt-uç>` ile taşı.
  - Tree SHA'ları karşılaştır (`git rev-parse <uç>^{tree}`). Aynıysa koşulan kapı hâlâ geçerli.
- **Denetim ajanları da hata yapıyor.** Gözden geçirme iki yanlış gerekçe yakaladı: "observer yolu
  hidrasyona kadar gizler" ve "reveal deste tuşlarını oynatıyor". Yeni yazılan her gerekçeyi koda
  karşı oku.
- **Sahte saatte `install` + `pauseAt` sayfa YÜKLENMEDEN önce.** Olumsuz bir assertion gerçek
  saatte hiçbir şey ölçmeyebilir: guard'ı koruyan testi bir mutasyonla dene.
- **Reduced-motion altında HER stil değişimi bir geçiş** (0.01ms, `transition-property: all`) ve
  **`emulateMedia` stile bir sonraki karede yansıyor.** Değişimden ya da emülasyondan sonra stili
  yeniden deneyerek oku (`toHaveCSS`, `expect.poll`); #130 ve #133.
- **Mutasyon kanıtında TypeScript her zaman yanlış bir koşulu reddediyor** (`false && x`); değişkene
  bağlı bir koşul yaz.
- **İki çalışma ağacı aynı E2E portunu (4173) paylaşıyor** ve yerelde `reuseExistingServer: true`.
  Birinde `pnpm gates` koşarken ötekinde E2E başlatma.
- **`srcset` kullanan iki `img` aynı dosyayı ancak aynı `sizes` ile seçer.** İndirmeyi Resource
  Timing'den ölç; sahte saat `performance`'ı da taklit ediyor ve orada liste boş döner.
- **CI'da e2e düşerse** artık `playwright-report` artifact'ı ve düşen testin trace'i var (#132).

Önceki günlerden, hâlâ geçerli:

- **`*.pages.dev` iş ağında açılmıyor** (DNS `::1` ve `213.14.227.50`); `WebFetch` de aynı DNS'i
  kullanıyor. Preview kontrolü bu makinede aynı commit'in yerel build'inde yapılır. Cloudflare dal
  alias'ını 28 karaktere kısaltıyor; preview linkini bot yorumundan al.
- **CI'da ara sıra sebepsiz düşüşler:** Cloudflare Pages build'i bir kez "Build failed" verdi, boş
  bir commit'le geçti. `lighthouse` bir kez `next/font/google` dosyasını çekemedi,
  `gh run rerun <id> --failed` ile geçti.
- **Silinen bir Pages dosyası Pages'in iç önbelleğinde 7 güne kadar yaşayabilir** (`s-maxage=604800`).
  Alan adı purge'ü oraya ulaşmıyor; kesin çözüm alan adında bir WAF kuralı.
- **Ekip verisi yalnızca `index.html`'de değil**, üç RSC dosyasında da (`/index.txt`,
  `/__next._full.txt`, `/__next.__PAGE__.txt`). Bir şeyin yayından kalktığını dördünü birden
  ölçerek doğrula.
- **Flex bir öğede `gridTemplateColumns` başka bir breakpoint'in iz listesini döndürüyor**; kolon
  sayan bir test hiçbir şey ölçmeden geçer.
- **`scripts/optimize-images.mjs` dosya silmiyor** ve `next build` `public/`'in tamamını kopyalıyor;
  `tests/images.test.ts` kalan bir dosyayı yakalıyor.
- **Bir adı ağaçta ararken `git grep -w` kullanma**; `@handle`'ları ve URL'leri kaçırıyor.
- **`gh pr merge --match-head-commit` tam SHA istiyor**; kısa SHA GraphQL hatası verir.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2; artık `pnpm trailers` da
  tutuyor).
