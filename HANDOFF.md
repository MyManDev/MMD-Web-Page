# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-31
**Yer:** ev
**Aşama:** Faz 4. **Site yayında: https://mymandev.com.** #19 ve #54 kapandı; açık issue #20 ve #83.
Bir tur tasarım geri bildirimi de kapandı (#86–#90).

## Dal ve çalışma ağacı

- Dal: `main`
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` bugün uçtan uca geçti (`EXIT=0`): **47 birim, 216 E2E** (26'sı viewport'a göre
  atlanıyor), payload **133.4 KiB / 150.0 KiB**, kalan pay 16.6 KiB
- `e2e` işi CI'da ~1m40s'den **~2m30s**'ye çıktı: otomatik geçiş testleri aralığın geçmesini
  beklemek zorunda ve süreyi ölçen bir test kısaltılamaz
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

> **AÇIK İŞ — panelde:** `cache html at edge` Cache Rule'u **silinmeli.** Ölçüldü: üç merge'den
> **61 dakika sonra** `mymandev.com` hâlâ eski HTML'i sunuyordu (`Age: 3665`, `cf-cache-status:
HIT`) — em dash'ler orada, "Who We Are" yok, GitHub linkleri eski. Aynı build
> `https://mymandev.pages.dev/` üzerinde **doğru** görünüyor, çünkü zone cache kuralları
> `pages.dev`'e uygulanmıyor. Yani deploy zinciri sağlam, sorun yalnızca bu kural.
>
> Kuralın **ölçülen kazancı yok**, **ölçülen bedeli deploy başına 2 saate kadar bayatlama**.
> `cache hashed assets` **kalsın** — hash'li adda bayatlama olamaz ve tekrar ziyarette gerçek
> kazancı var. Panel: `Caching` → `Configuration` → `Purge Everything`, sonra `Cache Rules`.
>
> Bir Claude oturumu bunu yapamaz: Cloudflare API token'ı gerekir ve token sohbete girmez.

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

**#83'ün 1. adımı bitti.** Gerçek domain ölçüldü ve **CI'dan daha kötü çıktı** — beklentinin tersi:

|             |           Gerçek domain | CI `localhost:4173` |
| ----------- | ----------------------: | ------------------: |
| Performance |          **81** (80–92) |               94–95 |
| LCP         | **3754 ms** (3265–3891) |        2382–3063 ms |
| FCP         | **2684 ms** (1794–2787) |            ~1234 ms |
| TBT         |             **29.5 ms** |           51–121 ms |
| CLS         |                       0 |                   0 |

**FCP iki katına çıktı, TBT düştü** — yani darboğaz CPU değil, kritik yoldaki ağ. `curl` ile
doğrudan ölçülen iki kalem:

- **HTML edge'de önbelleklenmiyor:** `cf-cache-status: DYNAMIC`, `Cache-Control: max-age=0,
must-revalidate`, TTFB 255–281 ms. Tamamen statik bir export için gereksiz.
- **İçerik-hash'li CSS `immutable` değil:** `max-age=14400, must-revalidate` ve durum
  `REVALIDATED` — adı içeriğine bağlı bir dosya 4 saatte bir origin'e gidiyor. TTFB 243–299 ms.
- Sıkıştırma **sorun değil**, elendi: Brotli açık, CSS telde 7 339 B (ham 33 012 B).

**#83'ün 2. adımı da bitti ve kazanç çıkmadı.** İki Cache Rule uygulandı; `cf-cache-status` HTML'de
`DYNAMIC`→`HIT`, CSS'te `REVALIDATED`→`HIT` oldu ama **Lighthouse kıpırdamadı**: Performance 81→81,
LCP 3754→3921 ms, FCP 2684→2662 ms. Sebep anlaşılır — Pages'in "origin"i zaten Cloudflare ağında,
yani kısaltılacak uzun bir gidiş-dönüş hiç yoktu.

O ölçümün kusuru da kayıtta: iki ölçüm arasında **iki değişken** değişti (kurallar _ve_ deploy
edilen build), yani karşılaştırma önbelleğin etkisini yalıtamıyor. Doğru ifade "kazanç yoktur"
değil, **"bu düzenekle görülemedi."**

**Kalan tek adım (3):** eşik hâlâ tutmuyorsa §8'i kanıtla revize et. Kapsamı bu turda **genişledi**:
§8 eşiğin sayısını yazıyor ama **nerede ölçüldüğünü yazmıyor**, ve elimizdeki iki nokta 700–1400 ms
farkla ayrışıyor. Ölçüm yerini söylemeyen bir eşik kapı değil yorumdur. Yedi CI okuması + iki gerçek
domain ölçümünde eşiği tutan tek bir medyan yok.

**#20 — yayın öncesi kontrol listesi.** Sekiz maddenin **beşi kapandı**, sayıları issue'da. Kalan
üç madde:

- Lighthouse mobil Performance, LCP, CLS — **#83 kapanmadan işaretlenmez**
- LinkedIn'in üç linki **gözle** açılıyor — `curl` `999` dönüyor (LinkedIn'in bot engeli); bu ne
  kırık link kanıtı ne de çalıştığının kanıtı, ve profilin **doğru kişiye** ait olduğunu HTTP kodu
  hiç söylemez
- Paylaşım kartı **büyük biçimde** görünüyor — `og.png` ve `summary_large_image` gerçek URL'de
  doğru, ama ilk paylaşımda ekrana bakılması gerekiyor

Kapanan beşi: sert kapılar · gerçek domainde 404 · OG/metadata gerçek URL'de · klavye ile tüm sayfa
(20 durak, göstergesi olmayan 0, footer dahil, tur ilk durağa dönüyor) · reduced-motion altında
dört bölümün dördü de görünür (opacity 1) · placeholder yok. Yani **iki madde göz istiyor, biri
#83'ü bekliyor** — bu issue artık depodan tek başına kapatılamaz.

## Bitmemiş iş

**Depoda yok.** Panelde bir tane var ve yukarıda yazılı: `cache html at edge` kuralının silinmesi.
O silinene kadar `mymandev.com` her deploy'dan sonra 2 saate kadar eski build'i sunar.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da. Bu turda **altı** satır eklendi: yayın hedefi, `www`
yönlendirmesinin nerede yaşadığı, query korunumu, prensip otomatik geçişi, prensip geçişinin biçimi,
ve Hero amblemi rengi. Burada tekrar edilmiyor — ama biri **bir kuralı gevşetti** ve o yüzden burada
adı geçiyor:

**§4.4'ün "sayfa yüklenirken giriş animasyonu yok" yasağı KALDIRILDI** (#93). Karar sahibi kaldırdı.
Kalkan şey yasak, **zarf değil**: yükleme girişi de 150–250ms içinde (uygulama 180ms + 60ms kademe).
Eski test silinmedi, yeni sözleşmeyi ölçecek biçimde yeniden yazıldı. Metin girişi artık bölüm
sarmalayıcısında değil **öğe seviyesinde** (16 blok), kademe `view()`'den geliyor — elle
`animation-delay` yazılmıyor. Amblem plakası conic gradyan taşıyor ve açısı **scroll'a bağlı**
dönüyor (ölçüldü: 0° → 360°, sayfa boyunca); sonsuz döngü yok.

**Hero'da artık iki yeşil var.** Amblem logonun kendi turkuazını (`#0D9488`) taşıyor, CTA ise
accent'i (`#14B8A6`). `CLAUDE.md` kural 2'nin "ekran başına tek yeşil odak" cümlesi harfiyen
okunursa bu bir ihlal. Karar sahibi verdi, azaltıcı ölçüler ölçüldü ve `design-spec.md` §5.1'e
tablonun altına not olarak yazıldı. Yeni bir yeşil eklemek isteyen biri **önce o notu okumalı** —
kural gevşedi ama kalkmadı.

## Tuzaklar ve notlar

Ölçümle bulunan, gözle bulunamayacak olanlar:

- **İki CSS kuralı aynı ögede `animation` yazarsa biri SESSIZCE kaybolur.** Amblem plakası hem
  `reveal-on-load` hem `mark-sweep` taşıyordu; ikisi de `animation` yazıyor ve aynı specificity'de,
  yani sıra karar verdi. Sonuç: amblemin yükleme girişi hiç çalışmadı, gecikmesi `0s`'e döndü.
  **Yakalayan şey testin SABİT bir süre değil SIRA ölçmesiydi** — "gecikme 180ms mi" diye sorsam
  yakalamazdım, "her öğe öncekinden sonra mı başlıyor" diye sorunca yakaladım. İki animasyon iki
  ayrı ögeye ayrıldı.
- **`globals.css`'te bir sınıfa `display` vermek Tailwind'in `hidden` utility'sini yenebilir.** Aynı
  specificity (0,1,0) ve `globals.css` sonra geldiği için kazanıyor. Amblem plakasına `display: grid`
  yazıldığında amblem **mobilde de** görünür hâle geldi. **Tek sinyal atlanan test sayısıydı:** üç
  mobil amblem testi `skip` olmaktan çıkıp koşmaya başladı (23 → 20). Yerleşim utility'leri markup'ta
  kalmalı, renk ve ölçü CSS'te.
- **Sayfa hareketlenince hover testleri de düşer, tıklama testleri gibi.** Giriş animasyonu öğe
  seviyesine taşınınca Footer ve Team hover testleri düştü: `hover()` sayfayı kaydırıyor, hedef
  Playwright kutuyu hesapladıktan sonra yer değiştiriyor ve işaretçi yanına düşüyor (ölçüldü:
  beklenen 1 → gelen 0, beklenen 16 → gelen 0). Çözüm tıklama testlerindekiyle aynı: o testler
  `reducedMotion: "reduce"` altında koşar.
- **Bir efekti iki kez ölçmeden "aynı" sanma.** TBT bu turda CI'da **47 ms** çıktı ve plan "24 ms'ten
  belirgin artarsa kapsamı daralt" diyordu — ama o 24 ms **gerçek domain** ölçümüydü. CI'ın kendi
  bandı 51–121 ms; yani 47 ms bir gerileme değil, iyileşme. **Ölçüm noktası değişmişse sayılar
  karşılaştırılamaz** (#83 aynı şeyi söylüyor).
- **`count()` BEKLEMEZ, assertion bekler.** Yeni bir test span'leri doğrudan sayıyordu ve CI'da 0
  döndü: yavaş makinede hidrasyon bitmemişti, yani component'in geliştirilmiş biçimi henüz yoktu ve
  sunucunun bastığı düz liste duruyordu. Yerelde geçiyordu — **yani test doğru olduğu için değil,
  makine hızlı olduğu için yeşildi.** Düzeltme sayıyı değil yapıyı değiştirmek: önce bekleyen bir
  assertion (`expect(locator).not.toHaveCount(0)`), sonra say.
- **Zone cache kuralları `pages.dev`'e uygulanmıyor.** Canlı domain bayatken önizlemeler ve
  production `*.pages.dev` adresi **güncel** kalıyor. Bir değişikliğin yayına girip girmediğini
  anlamak için ikisini yan yana ölçmek en hızlı ayrım: içerik farklıysa suçlu deploy değil önbellek.
- **Cloudflare Pages deploy'da zone cache'ini purge ETMİYOR.** Bu varsayılmıştı ve ölçümle yanlış
  çıktı: üç merge'den 61 dakika sonra `Age: 3665` ile aynı HTML dönüyordu.
- **`curl` bir adresi açabiliyorsa tarayıcının açacağı garanti değil.** Önizleme adresi `200` ve
  73 KB dönerken kullanıcının tarayıcısında boş kalıyordu; headless Chromium'da da kusursuz açıldı
  (konsol hatası yok, düşen istek yok). Yani sorun sayfada değil o makinenin ağında/eklentisinde.
  Bunu ayırmanın yolu **aynı sayfayı bir tarayıcıyla ölçmek**, sadece `curl` ile değil.
- **Bir efekti JS zamanlayıcısıyla kurmak zorunda değilsin.** Prensip girişi harf harf yazılırken bir
  `useEffect`, bir `setInterval` ve bir `matchMedia` okuması gerekiyordu. Kelime kelime belirmeye
  geçince hepsi kalktı: animasyonu **selektörün eşleşmesi** tetikliyor — `data-active` bir öğeye
  geçtiği an kural uymaya başlıyor ve animasyon baştan çalışıyor. Payload 0.1 KiB geri geldi.
- **Süreyi ölçen bir test kısaltılamaz.** Otomatik geçiş testleri aralığın (7s) geçmesini beklemek
  zorunda; `e2e` işi CI'da ~1m40s'den ~2m30s'ye çıktı. `waitForTimeout` burada meşru, çünkü ölçülen
  şey sürenin kendisi — ama bedeli her PR'a biniyor.
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
- **LCP eşiği tek koşunun şansı değil, kalıcı bir sapma** (#83). CI `main` medyanları:
  **2382 / 2839 / 3063 / 3063 / 2885 ms**, eşik 2000 ms; gerçek domainde **3754 ms**. Altı okumada
  eşiği tutan **tek bir medyan yok.** Genliğe bakıp "gürültüdür" demek geçmiyor — ve genliğin
  kendisi de kararsız: bir turda 329–427 ms'ye indi, sonraki turda 1167 ms'ye çıktı. **Sapmayı
  gösteren şey genliğin küçüklüğü değil, medyanın hiç tutmaması.**
- **Ölçüm noktası belirtilmemiş bir eşik, kapı değil yorumdur.** §8 "mobil LCP < 2000 ms" diyor ama
  nerede ölçüldüğünü söylemiyor. İki nokta 700–1400 ms farkla ayrışıyor ve **ikisi de simülasyon:**
  CI `localhost`'ta sıfıra yakın gerçek gecikme + sentetik throttling; gerçek domain ölçümü ise
  gerçek gecikme **artı** aynı sentetik throttling, yani çift cezalı. Saha verisi (CrUX/RUM) yeni
  bir domainde henüz yok.
- **`localhost` ölçümü daha iyimser, ama sebebi tek değil.** TBT gerçek domainde **düştü**
  (59 → 29.5 ms) ve FCP **iki katına çıktı** (1234 → 2684 ms). Bir sayının kötüleşmesi her zaman
  aynı kalemden gelmez; hangi metriğin hangi yöne gittiğine bakmak, "site yavaşladı" demekten
  bilgi veriyor.
- **Performance skoru için aynı şey geçerli DEĞİL:** 94 / 98 / 95 / 94. İki kez üst üste düşmüyor,
  aradaki koşular eşiği tutuyor. Salınan bir skoru kovalamak ölçmeden düzeltmek olur; #83 bu yüzden
  yalnızca LCP için açıldı.
- **Lighthouse'un LCP sayısı simülasyondur, gözlem değil.** Artifact'ten okundu:
  `throttlingMethod: "simulate"`, istek gecikmesi **562 ms**, CPU **4×**. Aynı koşuda **gözlenen**
  alt bölümler TTFB 5 ms + element render delay 103 ms. Yani 3063 ms'in içinde gerçek render 108 ms.
  Tek somut kalem (render-blocking CSS, 7 691 B, iddia edilen kazanç 550 ms) tamamen alınsa bile
  ~2500 ms kalıyor — mikro-optimizasyonla 2000 ms'e inilmiyor.
- **Bir yokluğu kanıt saymamak lazım.** CSS'in sıkıştırılmadığını düşündüm: `content-encoding`
  başlığı yoktu ve dosya 33 012 B iniyordu. Sebep sunucu değildi — `curl` varsayılan olarak
  `Accept-Encoding` göndermiyor. `--compressed` ile Brotli geldi ve 7 339 B indi. **İstemediğin bir
  şeyin gelmemesi, sunucunun onu vermediği anlamına gelmez.**
- **Yanlış kesme koşulu eksik kapsamı tam kapsam gibi gösterir.** Klavye turunu "aynı durak tekrar
  geldi" diye kesince tur **19** durakta bitti ve footer kapsam dışında kaldı: footer'ın tek linki
  nav'daki GitHub ile aynı href'i taşıyor, yani anahtar çakışıyordu. Doğru koşul "**ilk** durağa
  dönene kadar" — o zaman 20. durak (footer) göründü.
- **`textContent` erişilebilirlik ağacı değildir.** Nav linkleri `"HeroHero"` diye çift okunuyor
  çünkü durumlar aynı ızgara hücresinde yığılı. Ölçüldü: ikinci kopya `visibility: hidden`, görünür
  metin düğümü **tek** (`["Hero"]`), yani ekran okuyucu çift söylemiyor. Çifti görüp kusur sanmak
  kolay; ölçülecek şey ağacın kendisi.
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
