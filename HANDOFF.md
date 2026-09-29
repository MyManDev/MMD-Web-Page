# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-09-29
**Yer:** iş
**Aşama:** Faz 4, site yayında. Bugün SquadOpt kartı yenilendi:

- üç ekran görüntüsü, kendiliğinden geçen bir karuselde;
- her görüntünün altında bir yazı, görüntü değişince daktiloyla geliyor;
- geçiş 900ms;
- kartın arkasında etkin görüntünün hayaleti.

Nav tint'i %92'ye çıktı (#114). Açık issue: yok.

## Dal ve çalışma ağacı

- Dal: `main` (`dfbed11`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor (`EXIT=0`): **57 birim, 325 E2E** (33'ü viewport'a göre atlanıyor),
  payload **135.3 KiB / 150.0 KiB**
- Açık PR: yok
- GitHub'da yalnızca `main` var; merge edilen dal kendiliğinden siliniyor. Eski 67 dal
  `archive/<dal>` etiketlerinde.
- Yerel ek çalışma ağaçları (`MMD-work`, `MMD-docs`) kaldırıldı, merge edilmiş yerel dallar silindi.
  Ölçüm script'leri `node_modules/.cache/mmd-measure/` altında duruyor (commit'lenmez; nav ve proje
  kontrastı, ekran görüntüsü alma, canlı doğrulama).

## Yayın

| Ne              | Nerede                                 |
| --------------- | -------------------------------------- |
| Kanonik adres   | `https://mymandev.com`                 |
| Host            | Cloudflare Pages, proje adı `mymandev` |
| Production dalı | `main` → otomatik deploy               |

#129'un production deploy'u (`07afceb`) gerçek domain üzerinde ölçüldü, 1440 (DPR 1) ve Pixel 7
(DPR 2.625):

- **Geçiş:** etkin slayt `0.9s`, giden slaytın gecikmesi `0.9s`, hayaletin süresi `0.9s`.
- **Daktilo:** kendiliğinden geçişten sonra yazı işaretlendi, son harf önce gizli, yazı bitince
  görünür ve işaret kalktı.
- **Hayalet:** görüntüyle birlikte değişiyor ve figürle aynı dosyayı seçiyor. Her görüntü tek
  genişlikte indi: masaüstünde 896, Pixel 7'de 1792.
- **Taşma:** yatay taşma 0. Hayalet dikeyde bölümün içinde: başlığa 8/0px, bölümün altına 16/0px
  pay kalıyor (masaüstü/mobil).

Ölçüm script'i `node_modules/.cache/mmd-measure/verify-live.cjs` (commit'lenmez).

## Sıradaki iş

**Karar sahibi bugünkü hareketleri canlıda deneyip bakacak.** Beğenilmeyen bir şey olursa ayar
noktaları:

| Ne                     | Nerede                                                           | Bugün               |
| ---------------------- | ---------------------------------------------------------------- | ------------------- |
| Görüntü geçişi         | `ScreenshotCarousel.tsx`, `SLOT` (`delay-900`, `duration-900`)   | 900ms               |
| Hayaletin geçişi       | `ScreenshotGhost.tsx`, `IMAGE` — test karuselle eşitliği tutuyor | 900ms               |
| Hayaletin görünümü     | `ScreenshotGhost.tsx`, `LAYER`                                   | %12, 6px, %60, 48px |
| Daktilo hızı           | `TypedCaption.tsx`, `CAPTION_STEP_MS`                            | 25ms/harf           |
| Otomatik geçiş aralığı | `lib/deck.ts`, `AUTO_ADVANCE_MS` (desteyle ortak)                | 7s                  |

Zarfın dışında kalan üç giriş animasyonu (metin girişi 520ms, prensip kelimeleri 520ms, scroll
göstergesi): karar sahibi "şimdilik kod doğru kalsın test edeyim" dedi. Belgeler koda uyduruldu
(#127); ölçü değişecekse karar onun.

## Bitmemiş iş

- **WAF kuralı** `block removed portraits`: ~2026-10-05'ten sonra kuralı kapat ve iki adresi ölç.
  404 dönüyorsa kuralı sil; hâlâ resim dönüyorsa kuralı geri aç.
- **Hayaletin üstündeki kontrast yüksek DPR'de yeniden ölçülmedi.** Ölçülen hâllerde (1440 DPR 1,
  390 DPR 2) en kötü 5.92 idi. Oralarda hayalet hâlâ aynı 896 dosyasını kullanıyor. Pixel 7 gibi
  DPR 2.625'te ise artık 1792'yi kullanıyor (#129). 6px bulanıklıkta farkın ölçülebilir olmaması
  beklenir, ama bu bir çıkarım.
- **İkinci proje geldiğinde yığın ölçülmeli** (`Projects.tsx`'te "yığın uyandığında doğrulanacak"
  notu). Bugün fark edilen iki şey var, ikisi de tek projede görünmüyor:
  - `ProjectCard`'ın kendi zemini yok. Üste binen kart alttakini örtmeyebilir; ölçülmedi.
  - Sonraki kartın hayaleti, yaklaşırken öncekinin alt kenarına biniyor. Bu bilerek bırakıldı
    (`ScreenshotGhost.tsx`). Reduced-motion'daki düz listede kartlar arasına 64px boşluk kondu (#129).
- **Git geçmişi** ayrılan kişinin fotoğrafını ve biyografisini taşıyor (depo herkese açık, #44
  dahil). Yeniden yazmak `non_fast_forward` kuralına çarpar; yalnızca kendisi talep ederse ayrı bir iş.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da. Bugün eklenen ya da güncellenen satırlar şunlar:

- proje ekran görüntüleri (birden fazlaysa kendiliğinden geçen karusel);
- otomatik geçişte durdurma (görünür tuş yok, kabul edilen risk);
- görüntü başlığı;
- karusel geçişi (900ms ve daktilo);
- hayalet arka plan;
- daktilo efekti (iki kullanıcı);
- navbar tint'i (%92);
- dal politikası;
- kod yorumlarının dili (Türkçe, ASCII);
- `content/index.ts`'in paylaşılan yüzey sayılması.

**Karar sahibinin bugünkü seçimleri:**

- **Karusel:** kendiliğinden geçiyor; durdurma tuşu yok ("Tuş ekleme, sınırı belgele").
- **Kart:** adı "Football Squad Optimizer" kaldı. Doğrulanamayan iddialar çıkarıldı ("Bilmiyorum, kaldır").
- **Görüntünün altındaki yazı:** kısa bir başlık.
- **Geçiş:** 900ms.
- **Hayalet:** "2 · Orta" varyantı. Karşılaştırma görseli masaüstünde:
  `mymandev-hayalet-ekran-tasarim.png`.

**Onay.** Bugünkü PR'lar karar sahibinin açık onayıyla merge edildi. #126–#130 ve bu devir PR'ı
şu onayla merge edildi, kelimesi kelimesine: "sana tüm mergeler için izin veriyorum ben çıkıyorum
yarın geldiğimde halletmiş ol". Onay bugünkü işler içindi; genel kural değişmedi, paylaşılan yüzey
ve marka metni yine karar sahibinin açık onayını ister (`working-agreement.md` §1).

## Tuzaklar ve notlar

Bugün ölçümle bulunanlar:

- **Sahte saatte `install` + `pauseAt` sayfa YÜKLENMEDEN önce.** `install` tek başına saati gerçek
  zamanla akıtıyor; hidrasyondan sonra durdurmak da yetmiyor. Kalıp:
  `projects.spec.ts`'in "otomatik geçiş" ve "daktilo" blokları.
- **Olumsuz bir assertion gerçek saatte hiçbir şey ölçmeyebilir.** `not.toHaveAttribute` 5 saniye
  yeniden deniyor. Kendiliğinden biten bir efekt (2 saniyelik daktilo) o sürede işaretini kaldırınca
  test, efekti hiç engellemeyen koda karşı da geçiyordu. Durmuş saatte başlamış efekt işaretini
  taşımaya devam eder. Guard'ı koruyan her testi bir mutasyonla dene.
- **Reduced-motion altında HER stil değişimi bir geçiş.** Hiç geçişi olmayan bir öğede de
  `transition-property` `all`da kalıyor ve global blok süreyi 0.01ms yapıyor. Değişimin hemen ardından
  tek seferlik bir `getComputedStyle` bir kare boyunca eski değeri görüyor. CI bu yüzden iki kez
  düştü: #129'da hayaletin opaklığı, #130'da daktilo harfinin opaklığı. Reduced-motion altında bir
  değişimden sonra her zaman yeniden deneyen assertion kullan (`toHaveCSS`, `expect.poll`).
- **`emulateMedia` stile bir sonraki karede yansıyor.** `matchMedia` hemen `true` dönse de hemen
  okunan `getComputedStyle` eski olabiliyor (ölçüldü: 0ms'de `0px 14px`, 100ms'de `none`). Sayfa
  açıkken emüle ettikten sonra stili yeniden denenerek oku (#130).
- **Mutasyon kanıtında TypeScript her zaman yanlış bir koşulu reddediyor** (`false && x`): build
  düşer, mutasyon bir şey ölçmemiş olur. Değişkene bağlı bir koşul yaz (`x && steps < 0`).
- **İki çalışma ağacı aynı E2E portunu (4173) paylaşıyor** ve yerelde `reuseExistingServer: true`.
  Birinde `pnpm gates` koşarken ötekinde E2E başlatırsan, test ötekinin `out/`'unu ölçer. Sırayla koş.
- **`translate` taşıyan bir öğe mutlak konumlu torunlarının referans kutusu olur.** Karuselin kökü
  giriş animasyonunda `translate` taşıdığı için hayalet kartın doğrudan çocuğu.
- **`srcset` kullanan iki `img` aynı dosyayı ancak aynı `sizes` ile seçer.** Sabit bir `src`,
  yüksek DPR'de aynı görüntüyü ikinci kez indirir. İndirmeyi Resource Timing'den ölç, istek
  dinleyicisinden değil; dinleyici `goto`dan sonra bağlanır ve öncekileri kaçırır.
- **`overflow-x: clip` dikeyi kırpmıyor.** Hayaletin dikey taşması bölümün boşluklarına göre ayarlı
  (`lg` altında 40px).
- **Squash merge'den sonra yığılmış PR:** `git rebase --onto origin/main <eski-taban-ucu>`. Önce
  `origin/main^{tree}` ile eski ucun ağacının aynı olduğunu doğrula.
- **Bash aracında karmaşık heredoc bozulabiliyor** ("unexpected EOF"). Düzenleme script'lerini
  dosyaya yazıp `node` ile çalıştır.
  Önceki günlerden, hâlâ geçerli:

- **`*.pages.dev` iş ağında açılmıyor** (DNS `::1` ve `213.14.227.50`); `WebFetch` de aynı DNS'i
  kullanıyor. Preview kontrolü bu makinede aynı commit'in yerel build'inde yapılır. Cloudflare dal
  alias'ını 28 karaktere kısaltıyor; preview linkini bot yorumundan al.
- **CI'da ara sıra sebepsiz düşüşler:** Cloudflare Pages build'i bir kez "Build failed" verdi, boş
  bir commit'le geçti. `lighthouse` bir kez `next/font/google` dosyasını çekemedi,
  `gh run rerun <id> --failed` ile geçti.
- **Silinen bir Pages dosyası Pages'in iç önbelleğinde 7 güne kadar yaşayabilir** (`s-maxage=604800`).
  Alan adı purge'ü oraya ulaşmıyor; işareti, purge'den sonraki ilk istekte `MISS` ama büyük bir `Age`.
  Kesin çözüm alan adında bir WAF kuralı. Silinen bir deployment'ın adresi de bir süre sunulabilir;
  toplu silme API ile (liste sayfası en fazla 25).
- **Ekip verisi yalnızca `index.html`'de değil**, üç RSC dosyasında da (`/index.txt`,
  `/__next._full.txt`, `/__next.__PAGE__.txt`). Bir şeyin yayından kalktığını dördünü birden
  ölçerek doğrula.
- **Flex bir öğede `gridTemplateColumns` başka bir breakpoint'in iz listesini döndürüyor**; kolon
  sayan bir test hiçbir şey ölçmeden geçer.
- **Team kartı (`article`) giriş animasyonunda `translate` taşıyor**; yerleşimi `li` üzerinden ölç.
- **Düz bir JS Playwright config'inde `use.reducedMotion` uygulanmadı**;
  `page.emulateMedia({ reducedMotion: "reduce" })` çalışıyor.
- **`scripts/optimize-images.mjs` dosya silmiyor** ve `next build` `public/`'in tamamını kopyalıyor;
  `tests/images.test.ts` artık kalan bir dosyayı yakalıyor.
- **Bir adı ağaçta ararken `git grep -w` kullanma**; `@handle`'ları ve URL'leri kaçırıyor.
  `git grep -i -E` ve `git ls-files | grep` birlikte gerekir.
- **`gh pr merge --match-head-commit` tam SHA istiyor**; kısa SHA GraphQL hatası verir.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
