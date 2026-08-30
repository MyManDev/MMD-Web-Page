# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-30
**Yer:** ev
**Aşama:** Faz 3 bitti; iki tur tasarım geri bildirimi de kapandı. Kalan her şey Faz 4 — ve
**hepsi depo dışında bir erişim bekliyor.**

## Dal ve çalışma ağacı

- Dal: `main` (`b8234b0`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`)
- Payload: **133.1 KiB / 150.0 KiB**, kalan pay 16.9 KiB
- Test: **47 birim, 191 E2E** (23'ü viewport'a göre atlanıyor)

## Açık PR'lar

**Yok.** #67–#80 merge edildi.

#18 ve #11 kapandı: logo SVG, OG görseli ve paylaşım etiketleri yayında. Ayrıntı
`docs/design-spec.md` ve `docs/architecture.md` §9'da; burada tekrar edilmiyor.

## Sıradaki tek iş

**#19 — Cloudflare Pages bağlantısı ve alan adı.**

**Depoda yapılabilecek iş kalmadı.** Açık üç issue'nun üçü de depo dışında bir erişim bekliyor:

| Issue | Neden burada yapılamaz                                         |
| ----- | -------------------------------------------------------------- |
| #19   | Cloudflare hesabı ve DNS erişimi gerekiyor                     |
| #54   | Depo ayarı; `gh api --method PUT` izin katmanınca reddediliyor |
| #20   | Yayın sonrası ölçüm — #19'a bağlı, en sona kalmalı             |

#19 sırada çünkü diğer ikisini de o açıyor: #20 yayın olmadan koşamaz, ve yayın sonrası
doğrulama listesine #18'den taşınan **"OG görseli gerçek URL'de doğru görünüyor"** maddesi de
eklendi.

**API token'ı gerekmiyor:** dashboard'dan "Connect to Git" GitHub App yetkisi kullanılıyor. Token
yalnızca CI'dan deploy edilirse gerekir, ve o token sohbete yapıştırılmaz — gerekirse arayüzden
uygulanır.

## Bitmemiş iş

- **#54 — branch protection hâlâ uygulanmadı.** Ruleset `main protect` yalnızca `deletion` ve
  `non_fast_forward` içeriyor; §3'ün istediği beş maddenin hiçbiri yok. Hazırlanan payload
  uygulanamadı: `gh api --method PUT` çağrısı izin katmanı tarafından reddedildi. Uygulamak için
  ya depo ayarlarından elle, ya da `gh api` için Bash izni gerekiyor.
- **#19 Cloudflare depodan yapılamaz** — hesap ve DNS erişimi gerekiyor. **API token'ı gerekmiyor:**
  dashboard'dan "Connect to Git" GitHub App yetkisi kullanılıyor. Token yalnızca CI'dan deploy
  edilirse gerekir. Token sohbete yapıştırılmaz; gerekirse arayüzden uygulanır.

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
- **Duyarsız bir metrikle eşik seçilmez.** Logo SVG'sinin sadeleştirme eşiğini seçerken önce
  çıktıyı render edip kaynakla piksel karşılaştırması yapıyordum; sonuç eşik 0.05'ten 0.8'e
  çıkarken **değişmiyordu**, çünkü o fark sadeleştirmeden değil kenar yumuşatmasından geliyordu.
  Bir sayıya bakıp karar vermeden önce o sayının **değişmesi gerektiğinde değiştiğini** görmek
  lazım.
- **`mask-image` bulunamayan bir dosyada sessizdir.** Tarayıcı hata vermez, öğe sadece hiç
  görünmez: kutu yerinde, ölçüler doğru, ekranda hiçbir şey yok. `tests/e2e/hero.spec.ts` maskenin
  gerçekten yüklendiğini ayrıca ölçüyor.
- **`page.goto` bağlantı reddedildiğinde anında atıyor**, zaman aşımını beklemeden. Beklemesiz bir
  yeniden deneme döngüsü 80 denemeyi bir saniyede tüketip sunucu ayağa kalkmadan pes eder.
  Denemeler arasına bekleme koy.
- **canonical `href` taşır, `content` değil.** `<link>` ile `<meta>` karıştırıldığında test kendi
  hatasıyla düşer.
- **`NOTICE`'in saydığı yollar ile gerçek dosya yolları ayrılabiliyor.** `public/brand/mark.png` o
  listenin dışında kalıyordu — yani amblem, onu kapsaması gereken bildirimin kapsamı dışındaydı.
  Yeni marka varlıkları `public/logo*` altında ve kalıp tutuyor.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
