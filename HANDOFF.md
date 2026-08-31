# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-31
**Yer:** ev
**Aşama:** Faz 4. **Site yayında: https://mymandev.com.** #19 ve #54 kapandı; açık issue #20 ve #83.

## Dal ve çalışma ağacı

- Dal: `main`
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` bugün uçtan uca geçti (`EXIT=0`): **47 birim, 191 E2E** (23'ü viewport'a göre
  atlanıyor), payload **133.1 KiB / 150.0 KiB**, kalan pay 16.9 KiB
- Açık PR: yok
- `main`'e doğrudan push artık **kapalı** — #54 uygulandı, iş `feature/*` dallarında ve PR'dan geçer

## Yayın

| Ne              | Nerede                                          |
| --------------- | ----------------------------------------------- |
| Kanonik adres   | `https://mymandev.com`                          |
| Host            | Cloudflare Pages, proje adı `mymandev`          |
| Production dalı | `main` → otomatik deploy                        |
| Preview         | PR başına, `*.pages.dev`                        |
| `www`           | Zone seviyesinde Redirect Rule ile köke **301** |

Yayın günü gerçek domain üzerinde ölçülen sayılar:

- `GET /` → `200`, 73 213 B · `GET /og.png` → `200 image/png` **13 806 B** (yerel dosyayla birebir)
- `GET /yok-1234` → **`404`**, 10 454 B, gövdede `This page does not exist.` — yani `out/404.html`
  dönüyor, 73 KB'lik `index.html` kabuğu değil
- `www/x?y=1` → `301` → `https://mymandev.com/x?y=1` (yol ve query korunuyor)
- `http://` → `https://` `301`; `robots.txt`, `sitemap.xml`, `logo.svg` → `200`
- canonical `https://mymandev.com` · `og:image` `…/og.png` · `twitter:card` `summary_large_image`

## Sıradaki iş

**#83 — mobil LCP eşiği dört koşu üst üste düştü.** Sırada bu var, çünkü #20'nin Lighthouse
maddesi buna bağlı: sayıyı kaydetmek ile eşiği tutmak aynı şey değil.

#83 üç adımı **sırayla** istiyor ve sıra önemli: (1) aynı sayfayı **gerçek domain** üzerinde ölç —
CI `localhost:4173`'ü simüle throttling ile ölçüyor, (2) render-blocking CSS kalemini ölçerek
uygula, (3) hâlâ tutmuyorsa §8'deki 2000 ms'i kanıtla revize et. §8 bu sayıları **rapor** olarak
tanımlıyor, kapı olarak değil.

**#20 — yayın öncesi kontrol listesi.** Engelini #19 kaldırdı. Listenin **üç maddesi bu turda
kapandı** ve sayıları issue'ya yazıldı: sert kapılar, gerçek domainde 404, OG/metadata gerçek
URL'de. Kalanlar:

- Lighthouse mobil Performance, LCP, CLS — **#83 kapanmadan işaretlenmez**
- Klavye ile tüm sayfa gezilebiliyor, focus görünür
- `prefers-reduced-motion` açıkken sayfa kullanılabilir
- Live Demo ve GitHub linkleri açılıyor
- Paylaşım kartının **büyük biçimde** göründüğü hâlâ gözle teyit edilmedi; `summary_large_image`
  etiketi ve `og.png` gerçek URL'de doğru, ama ilk paylaşımda ekrana bakılması gerekiyor

## Bitmemiş iş

Yok. Depoda bekleyen bir yarım iş kalmadı.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da. Bu turda üç satır eklendi: yayın hedefi, `www`
yönlendirmesinin nerede yaşadığı, ve query korunumu. Burada tekrar edilmiyor.

## Tuzaklar ve notlar

Ölçümle bulunan, gözle bulunamayacak olanlar:

- **Cloudflare'in `Create` düğmesi Pages değil Workers akışını açıyor.** İşareti şu: "Configure your
  Worker project", `npx wrangler deploy` gibi bir deploy komutu, ve **`Build output directory`
  alanının hiç olmaması**. O akış bu depo için yanlış — `wrangler` yapılandırması ister ve 404
  davranışını elle kurmayı gerektirir. Doğru yol `Compute` → `Workers & Pages` → Pages'in kendi
  `Get started` ekranı → `Import an existing Git repository`. Doğru ekranın işareti `Framework
preset` + `Build command` + `Build output directory` üçünün birlikte görünmesi.
- **Cloudflare'in "DNS may not be proxying traffic for www" uyarısı yanlış olabilir.** Kural deploy
  edilmeden modalda bekletiyor. `www` Pages custom domain'i üzerinden proxy'liydi — ölçüldü:
  Cloudflare IP + `Server: cloudflare` — kontrol o kaydı görmüyor. Doğru seçim `Ignore and deploy
rule anyway`; `Create a new proxied DNS record` custom domain'in kaydıyla çakışır.
- **Bir kuralın deploy edilmediğini `cf-cache-status` ayırt ettirir.** `www` 301 yerine 200
  dönüyordu; `DYNAMIC` görmek "bu önbellekten gelmiyor, kural gerçekten eşleşmiyor" demekti ve
  şüpheyi doğrudan kuralın kendisine getirdi. Sebep basitti: modal açık kalmıştı.
- **`Preserve query string`'i belgeye göre değil ölçüme göre ayarla.** `Redirect from WWW to root`
  şablonu wildcard kullanıyor (`https://www.*` → `https://${1}`) ve `${1}` query'yi **zaten**
  taşıyor: kutu kapalıyken `www/x?y=1` → `…/x?y=1` çıktı. İşaretlemiş olsaydık query iki kez
  eklenecekti — ve bu, kimsenin bakmadığı bir yerde sessizce bozulan türden bir hata.
- **`curl -w` format string'ine `\n` yazarken dikkat.** Bir ölçümde `Location` değeri
  `https://www.mymandev.com//n` gibi göründü; gerçek header değil, format string'in artığıydı.
  Şüpheli bir çıktıyı düzeltmenin yolu `printf` ile tek satırlık temiz bir format kullanmak.
- **GitHub, ruleset PUT'unda göndermediğin varsayılanı ekliyor.**
  `require_extra_approval_for_unattributed_changes: true` kendiliğinden geldi. Atfedilemeyen bir
  commit için 1 onay ister; `@tunayaslan` onay veremediği için böyle bir commit merge edilemez.
  Şu an tetiklenmiyor (commit'ler atfedilebiliyor, trailer yazılmıyor) — ölçmeden değiştirilmedi.
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
- **LCP eşiği tek koşunun şansı değil, kalıcı bir sapma** (#83). `main` üzerindeki dört koşunun
  medyanları: **2382 / 2839 / 3063 / 3063 ms**, eşik 2000 ms. Eşiği tutan tek bir medyan yok. Genlik
  bu turda daraldı (329–427 ms, önceki ölçümde 1491 ms) ama medyan yukarı kaydı — yani genliğe
  bakıp "gürültüdür" demek artık geçerli değil.
- **Performance skoru için aynı şey geçerli DEĞİL:** 94 / 98 / 95 / 94. İki kez üst üste düşmüyor,
  aradaki koşular eşiği tutuyor. Salınan bir skoru kovalamak ölçmeden düzeltmek olur; #83 bu yüzden
  yalnızca LCP için açıldı.
- **Lighthouse'un LCP sayısı simülasyondur, gözlem değil.** Artifact'ten okundu:
  `throttlingMethod: "simulate"`, istek gecikmesi **562 ms**, CPU **4×**. Aynı koşuda **gözlenen**
  alt bölümler TTFB 5 ms + element render delay 103 ms. Yani 3063 ms'in içinde gerçek render 108 ms.
  Tek somut kalem (render-blocking CSS, 7 691 B, iddia edilen kazanç 550 ms) tamamen alınsa bile
  ~2500 ms kalıyor — mikro-optimizasyonla 2000 ms'e inilmiyor.
- **Lighthouse skorları job log'unda, artifact'in içinde değil.** `scripts/lighthouse-summary.mjs`
  özeti `gh run view <id> --log` ile okunuyor; artifact yalnızca ayrıntı için gerekiyor
  (`gh run download <id> -n lighthouse-report`). Ve dikkat: Windows'ta Node, kabuğun `/tmp` yolunu
  aynı yere çözmüyor — indirilen dosyayı `node`'a verirken yol `cygpath -m` ile çevrilmeli.
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
