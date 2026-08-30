# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-30
**Yer:** ev
**Aşama:** 3 bitti ve tasarım geri bildirimleri kapandı. Kalan her şey Faz 4 — ve **hepsi depo
dışında bir erişim bekliyor.**

## Dal ve çalışma ağacı

- Dal: `main` (`f4ba250`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`).
- Payload: **133.1 KiB / 150.0 KiB**, kalan pay 16.9 KiB.
- Test: **40 birim, 179 E2E** (21'i viewport'a göre atlanıyor).

## Açık PR'lar

**Yok.** Bu turda beş PR merge edildi: #67 #68 #69 #70 #71.

Dört tasarım geri bildirimi de bitti:

| İstek                              | Nasıl çözüldü                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| Hero'nun sağındaki boşluk          | Wordmark grafik öğe olarak; ölçü viewport'a bağlı, kenardan taşıyor (#68)     |
| Who we are çok boş                 | İki kolon; prensipler tuşlarla gezilen deste — pinlenen dizi **kalktı** (#69) |
| Team başlığı yukarı, kartlar büyük | Oran 5/8 → 5/9, kart 708 → 787px; başlık mesafesi 56 → 32px (#70)             |
| (planlanan)                        | `description` meta etiketi yayına girdi (#71)                                 |

#56 kapalı ama **ürettiği biçim kaldırıldı**; gerekçe issue'ya yorum olarak yazıldı.

## Sıradaki tek iş

**#18 — logo SVG ve OG görseli.**

Kalan beş issue'nun dördü depo dışında bir erişim bekliyor: #54 (ayar/izin), #19 (Cloudflare
hesabı), #20 (en sona kalması gereken kontrol listesi), #11'in kalanı (#18'e bağlı). Depoda
yapılabilecek tek iş #18 ve **iki şeyi birden açıyor:** OG görseli gelince #11'in kalan yarısı
(Open Graph + Twitter card) da yazılabilir hâle geliyor. Şu an görüntüsü olmayan bir OG etiketi
yazmak, var olmayan bir varlığa işaret eden bir vaat olurdu.

Not: **hero görselini hiçbir issue takip etmiyor** — ve #68'den sonra hero'nun bir görsele
ihtiyacı da kalmadı.

## Bitmemiş iş

- **#11 yarım.** `robots.txt`, `sitemap.xml`, canonical (#42) ve `description` (#71) yayında.
  Kalan yalnızca OG ve Twitter card, ikisi de #18'e bağlı.
- **#54 — branch protection hâlâ uygulanmadı.** Ruleset `main protect` yalnızca `deletion` ve
  `non_fast_forward` içeriyor; §3'ün istediği beş maddenin hiçbiri yok. Hazırlanan payload
  uygulanamadı: `gh api --method PUT` çağrısı izin katmanı tarafından reddedildi. Uygulamak için
  ya depo ayarlarından elle, ya da `gh api` için Bash izni gerekiyor.
- **#19 Cloudflare depodan yapılamaz** — hesap ve DNS erişimi gerekiyor. **API token'ı gerekmiyor:**
  dashboard'dan "Connect to Git" GitHub App yetkisi kullanıyor. Token yalnızca CI'dan deploy
  edilirse gerekir.
- ~~Who we are'ın sağ yarısı geniş ekranda boş.~~ **#69'da çözüldü** — sağ yarı artık prensip
  destesini taşıyor.
- **Nav wordmark'ı tip ölçeği token'larında değil.** `components/sections/nav/Nav.tsx` içinde hâlâ
  `text-sm tracking-[0.08em]` satır içi duruyor; #46 diğer her şeyi token'lara taşırken bu satır
  atlanmış. Issue açılmadı.

## Alınan kararlar

Bugün alınan kalıcı kararlar `docs/architecture.md` §9'da: axe taramasının duragan halde koşması ve
Lighthouse'un üç koşunun medyanıyla raporlanması. Burada tekrar edilmiyor.

## Tuzaklar ve notlar

Bugün ölçümle bulunan, gözle bulunamayacak olanlar:

- **`animation-name: none` reduced-motion'da YETMİYOR.** Hareketi durduruyor ama **düzeni**
  bırakıyor: pinlenen prensipler mutlak konumda üst üste binip okunmaz oluyordu. Gelişmiş düzenin
  tamamı `prefers-reduced-motion: no-preference` kapısının **içinde** olmalı. Bu, deponun
  `animation-timeline: none` ile yaşadığı hatanın ikinci sürümü.
- **axe, scroll'a bağlı fade'in ortasına denk gelebiliyor.** Üst öğe opaklığını kontrast hesabına
  kattığı için Live Demo butonu 4.34 verdi; renkler `#149f90 / #1e2d2f` diye raporlandı ve ikisi de
  token değil — token'ların zemine karışmış hali. Dinlenme halinde aynı çift **5.51:1**. Tarama
  artık reduced-motion altında koşuyor ve taramadan önce hiçbir şeyin animasyon yapmadığını
  doğruluyor.
- **Lighthouse'un Accessibility skoru bu yüzden bizim kapımızdan düşük çıkabilir** (ölçüldü: 96).
  Kusur değil, ölçüm anı. `architecture.md` §8'de yazılı.
- **LCP'nin genliği eşiğin kendisinden büyük.** Gerçek CI verisi: medyan 2438ms, aralık
  1761–3253ms, genlik **1491ms**; eşik 2000ms. Bu sayıyı tek koşuya bakarak kovalamak ölçmeden
  düzeltmek olur.
- **`next/font` ilan edilen ağırlığı üretir, kullanılanı değil.** Devir kaydında tersi yazıyordu.
  Bayt değişmemesinin sebebi eleme değil, **Plex Sans'ın değişken font olması**: dört ağırlık da
  aynı altı `.woff2` dosyasını işaret ediyor. Ölçüm: her kuruluşta 169.888 byte.
- **`.next` önbelleği font ölçümünü yalanlıyor.** İki dal aynı sayıyı verdi; doğru sayılar ancak
  `rm -rf .next` sonrası çıktı.
- **Görsel hattı kırpmıyordu, esnetiyordu.** Kaynak ve hedef aynı orandayken görünmüyordu. Artık
  ortadan cover-crop yapıyor; düzeltme çıktıyı bayt bayt değiştirmedi (#50).
- **Hat genişliği kırpar, yüksekliği değil** (3/4 kaynak, 5/8 hedeften geniş). Yani portrenin dikey
  çerçevelemesi **kaynaktan gelir ve aşağıda düzeltilemez**. İbrahim'in fotoğrafı bu yüzden hatta
  girmeden önce 5/8'lik bir pencereye kırpıldı.
- **`scale` tekdüzeyken tarayıcı tek sayıya kısaltıyor:** açık halde `"1 1"` değil `"1"`. Dize
  karşılaştıran test düşer; yatay bileşen okunmalı.
- **`nav.spec.ts`'te `beforeEach` her `describe`'ın içinde**, dosya seviyesinde değil. Yeni bir
  describe eklerken unutulursa testler sayfaya hiç gitmez ve "eleman yok" diye düşer.
- **`pnpm preview` bir sunucudur, biten bir iş değil.** Arka planda başlatılıp durdurulmazsa
  birikiyor; bugün sekiz tane bulundu, en eskisi üç saatlik. Ölçüm scriptleri kendi sunucusunu
  açıp kapatmalı. `pkill -f "serve out"` eşleşmiyor — süreç `node.exe` olarak görünüyor.
- **Katkıcı listesindeki `claude` duruyor ve kaldırılamıyor.** Ölçüldü, üç ayrı yoldan:
  `main`'de trailer taşıyan commit **0**; contributors API (`anon=1` dahil) **iki gerçek kişi**;
  ama kenar çubuğu **üç** gösteriyor. Aradaki farkı `refs/pull/*` üretiyor — trailer taşıyan
  **sekiz commit** orada duruyor ve hiçbiri `main`'den veya herhangi bir daldan erişilemiyor
  (`git merge-base --is-ancestor` ile doğrulandı).

  **Contributors API sidebar'ı beslemiyor.** Bir önceki devir kaydı bunu doğru yazmıştı
  ("kalıntı `refs/pull/*`'ta ve silinemiyor"); 30 Ağustos'ta API'ye bakılıp "sorun çözülmüş"
  diye düzeltildi ve **o düzeltme yanlıştı**.

  `refs/pull/*` kullanıcı tarafından silinemez, yeniden yazılamaz. GitHub Support talebi
  self-service'e yönlendirilerek kapatıldı. Geriye iki yol kalıyor: depoyu silip temiz geçmişle
  yeniden kurmak — 66 PR ve bütün issue kaydı gider — ya da kabul etmek. O commit'ler gerçek
  geçmiş: o PR'lar incelendiği anda gerçekten o trailer'ı taşıyordu.

- **`fullPage: true` ekran görüntüsü scroll'a bağlı reveal'ı YALANLIYOR.** Chromium viewport'u
  büyütmeden kaydırıyor, yani ekran altındaki bölümler `opacity: 0`'da yakalanıyor: tam sayfa
  görüntüsünde Who we are ve Team **hiç yokmuş gibi** göründü. Ölçüldü — 900px viewport'ta ikisi
  de 0.00, 2649px'te 1.00. Kusur değil, yakalama yöntemi. Bölümlere tek tek bakmak lazım.
- **Playwright'ın ilk tıklaması hareketli sayfada boşa düşüyor.** Ölçüldü: normal yolda 24 koşunun
  7'sinde, reduced-motion altında 0'ında. Sebep uygulama **değil** — tuşun DOM'a girdiği anda
  çalıştığı ayrıca ölçüldü (12/12, ölü pencere 0 ms). `scroll-behavior: smooth` ve scroll'a bağlı
  reveal, tuşu ölçümle gönderim arasında oynatıyor. Tıklayan testler reduced-motion altında
  koşmalı — axe'in aynı sebeple koşması gibi.
- **Bir taşıyıcının yüksekliği içerikle değişiyorsa üstündeki tuşlar kayar.** Prensip destesinde
  tam bu oldu; art arda tıklamaların biri boşa düştü. Çözüm: bütün durumları aynı ızgara hücresinde
  üst üste yığıp yüksekliği en uzununa sabitlemek. Görünmeyenler `visibility: hidden` —
  `display: none` yüksekliği götürür, `opacity: 0` öğeyi odak sırasında bırakır.
- **axe, `aria-hidden` bir metni kontrast için yine de tartıyor.** Hero işareti metin düğümüyken
  1.14:1 verip kapıyı düşürdü. Doğru cevap kuralı susturmak veya rengi parlatmak değil: WCAG 1.4.3
  saf dekorasyonu muaf tutuyor ve makineye bunu söylemenin yolu **metin düğümü kullanmamak** —
  `content` ile CSS'ten üretmek.
- **Sabit `px` bir "taşma" garantisi değildir.** Hero işareti 168px'te 1024'te 339px taşıyordu ama
  1920'de 61px **içeride** kalıyordu. Taşması gereken şeyin ölçüsü viewport'a bağlanmalı.
- **`test.use({ reducedMotion })` bu Playwright sürümünde `tsc`'den geçmiyor**; deponun kendi
  örneği `page.emulateMedia({ reducedMotion: "reduce" })`.
- **`useEffect` içinde `setState` lint'ten geçmiyor** (`react-hooks/set-state-in-effect`).
  Hidrasyon tespiti için doğru araç `useSyncExternalStore`: sunucu anlık görüntüsü `false`,
  istemcininki `true`, tek render.
- **Aynı olgu iki yerde yaşıyorsa test yaz.** Portre oranı hem `app/tokens.css`'te hem
  `lib/image-widths.json`'da yazılı; ayrıldıklarında hiçbir şey patlamıyor, `object-fit: cover`
  farkı sessizce kırpıyor. `tests/portrait-aspect.test.ts` o aralığı tutuyor.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
