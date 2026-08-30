# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-30
**Yer:** ev
**Aşama:** Faz 3 bitti; iki tur tasarım geri bildirimi de kapandı. Kalan her şey Faz 4 — ve
**hepsi depo dışında bir erişim bekliyor.**

## Dal ve çalışma ağacı

- Dal: `main` (`932bdf8`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`)
- Payload: **133.1 KiB / 150.0 KiB**, kalan pay 16.9 KiB
- Test: **42 birim, 181 E2E** (23'ü viewport'a göre atlanıyor)

## Açık PR'lar

**Yok.** Bugün on PR merge edildi: #67–#76.

Sayfanın görünen yüzü bu turda ölçek olarak bir basamak büyüdü ve Hero'nun sağına marka amblemi
geldi. Ayrıntı `docs/design-spec.md`'de; burada tekrar edilmiyor.

## Sıradaki tek iş

**#18 — logo SVG ve OG görseli.**

Kalan beş issue'nun dördü depo dışında bir erişim bekliyor: #54 (ayar/izin), #19 (Cloudflare
hesabı), #20 (en sona kalması gereken kontrol listesi), #11'in kalanı (#18'e bağlı). Depoda
yapılabilecek tek iş #18 ve **üç şeyi birden açıyor:**

1. #11'in kalan yarısı (Open Graph + Twitter card) yazılabilir hâle geliyor.
2. Hero amblemindeki **380px tavan** kalkıyor — bugünkü sınır kaynağın 400×400 olması.
3. `scripts/extract-mark.mjs` silinebiliyor; o script yalnızca gerçek SVG gelene kadar var.

Not: **hero görselini hiçbir issue takip etmiyor** ve #73'ten sonra hero'nun bir görsele ihtiyacı
da kalmadı — amblem o yeri dolduruyor.

## Bitmemiş iş

- **#11 yarım.** `robots.txt`, `sitemap.xml`, canonical (#42) ve `description` (#71) yayında.
  Kalan yalnızca OG ve Twitter card, ikisi de #18'e bağlı.
- **#54 — branch protection hâlâ uygulanmadı.** Ruleset `main protect` yalnızca `deletion` ve
  `non_fast_forward` içeriyor; §3'ün istediği beş maddenin hiçbiri yok. Hazırlanan payload
  uygulanamadı: `gh api --method PUT` çağrısı izin katmanı tarafından reddedildi. Uygulamak için
  ya depo ayarlarından elle, ya da `gh api` için Bash izni gerekiyor.
- **#19 Cloudflare depodan yapılamaz** — hesap ve DNS erişimi gerekiyor. **API token'ı gerekmiyor:**
  dashboard'dan "Connect to Git" GitHub App yetkisi kullanılıyor. Token yalnızca CI'dan deploy
  edilirse gerekir. Token sohbete yapıştırılmaz; gerekirse arayüzden uygulanır.
- **Proje açıklamasının bir yeri doğrulanmayı bekliyor.** `content/projects.ts`'teki metin
  uydurulmadı; her cümlesi uygulamanın kendi ekranındaki bir olguya dayanıyor ve dayanaklar dosyada
  tek tek yazılı. Tek **çıkarım** "Fantasy Premier League" ibaresi: ekrandaki `Gameweek`,
  `Transfer hit points` ve £100.0m bütçeden türetildi, doğrudan doğrulanmadı.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da. Bu turda dört satır eklendi: tip ölçeği, navbar
zemini, Hero sağ kolonu, proje açıklamasının zorunluluğu. Burada tekrar edilmiyor.

## Tuzaklar ve notlar

Ölçümle bulunan, gözle bulunamayacak olanlar:

- **Testin "o günkü sayıyı" tutması bir kusurdur.** Bu turda iki test **davranış bozulmadığı hâlde**
  düştü: biri `scroll-margin`'i `"88px"` diye sabit yazmıştı, diğeri bölümün **tamamında** uzun
  tire arıyordu ve bir cümlenin noktalamasını yakaladı. İkisi de gerçek sözleşmeyi ölçmüyordu.
  Beklenen değer türetilebiliyorsa **türet** (token'dan), ve yasağı doğru kapsama uygula.
- **Bir ölçüyü token'a bağlamak yetmez, DOĞRU token'a bağlamak gerekir.** `roll` kutusunun
  yüksekliği `--text-mono`dan hesaplanıyordu; nav `--text-nav`e geçince 18.19px'lik kutu 18px'lik
  satırı kırptı ve hover'da ikinci kopyadan ince bir şerit göründü. `1lh` bu sınıfı tümden
  kapatıyor — kutu öğenin **kendi** satırına bağlı.
- **Koyu bir barda "en açık piksel" zemin değil, YAZIDIR.** Navbar kontrastını ölçerken ilk sonucum
  1.00 çıktı çünkü yazının kendi pikselini örnekliyordum. Doğrusu: yazıyı `visibility: hidden` ile
  gizleyip aynı koordinatı örneklemek. Gerçek sayı 5.49:1.
- **`fullPage: true` ekran görüntüsü scroll'a bağlı reveal'ı YALANLIYOR.** Chromium viewport'u
  büyütmeden kaydırıyor, ekran altındaki bölümler `opacity: 0`'da yakalanıyor. Bölümlere tek tek
  bakmak lazım.
- **Playwright'ın ilk tıklaması hareketli sayfada boşa düşüyor.** Ölçüldü: normal yolda 24 koşunun
  7'sinde, reduced-motion altında 0'ında. Sebep uygulama **değil** — tuşun DOM'a girdiği anda
  çalıştığı ayrıca ölçüldü (12/12, ölü pencere 0 ms). Tıklayan testler reduced-motion altında
  koşmalı, axe'in aynı sebeple koşması gibi.
- **Bir taşıyıcının yüksekliği içerikle değişiyorsa üstündeki tuşlar kayar** ve tıklama kaybolur.
  Çözüm: bütün durumları aynı ızgara hücresinde üst üste yığıp yüksekliği en uzununa sabitlemek.
  Görünmeyenler `visibility: hidden` — `display: none` yüksekliği götürür, `opacity: 0` öğeyi odak
  sırasında bırakır.
- **axe, `aria-hidden` bir metni kontrast için yine de tartıyor.** Doğru cevap kuralı susturmak veya
  rengi parlatmak değil: WCAG 1.4.3 saf dekorasyonu muaf tutuyor ve makineye bunu söylemenin yolu
  **metin düğümü kullanmamak**.
- **Sabit `px` bir "taşma" garantisi değildir.** 1024'te 339px taşan bir işaret 1920'de 61px
  **içeride** kalıyordu. Taşması gereken şeyin ölçüsü viewport'a bağlanmalı.
- **Şemayı sıkılaştırmak fixture'ları düşürür ve bu doğru davranıştır.** `description` zorunlu
  olunca `tests/fixtures.ts` ve iki şema testi düştü; kapının çalıştığının kanıtı bu.
- **`test.use({ reducedMotion })` bu Playwright sürümünde `tsc`'den geçmiyor**; deponun kendi örneği
  `page.emulateMedia({ reducedMotion: "reduce" })`.
- **`useEffect` içinde `setState` lint'ten geçmiyor** (`react-hooks/set-state-in-effect`). Hidrasyon
  tespiti için doğru araç `useSyncExternalStore`: sunucu anlık görüntüsü `false`, istemcininki
  `true`, tek render.
- **Aynı olgu iki yerde yaşıyorsa test yaz.** Portre oranı hem `app/tokens.css`'te hem
  `lib/image-widths.json`'da yazılı; ayrıldıklarında hiçbir şey patlamıyor, `object-fit: cover`
  farkı sessizce kırpıyor. `tests/portrait-aspect.test.ts` o aralığı tutuyor.
- **Lighthouse'un Accessibility skoru bizim kapımızdan düşük çıkabilir** (ölçüldü: 96). Kusur değil,
  ölçüm anı. `architecture.md` §8'de yazılı.
- **LCP'nin genliği eşiğin kendisinden büyük.** Gerçek CI verisi: medyan 2438ms, aralık 1761–3253ms,
  genlik **1491ms**; eşik 2000ms. Tek koşuya bakarak kovalamak ölçmeden düzeltmek olur.
- **`.next` önbelleği font ölçümünü yalanlıyor.** Doğru sayılar ancak `rm -rf .next` sonrası çıktı.
- **`pnpm preview` bir sunucudur, biten bir iş değil.** Arka planda başlatılıp durdurulmazsa
  birikiyor. Ölçüm scriptleri kendi sunucusunu açıp kapatmalı. `pkill -f "serve out"` eşleşmiyor —
  süreç `node.exe` olarak görünüyor.
- **Katkıcı listesi sorunu bu depoda YOK.** Ölçüldü: `main`'de gerçek trailer 0. Kalıntı yalnızca
  `refs/pull/*`'ta ve listeyi etkilemiyor.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
