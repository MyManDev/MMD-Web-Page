# Tasarım Spesifikasyonu — MyManDev sitesi (V1)

Bu belge, `architecture.md` §4'te **karar verilmiş** token, ölçek ve ölçüleri **nereye
uyguladığımızı** yazar. Kararların kendisi orada; burada tekrar edilmez.

- Renk paleti, tip ölçeği, ölçü tablosu, motion kuralı → [`architecture.md` §4](architecture.md)
- Bölüm sırası ve navigation kararı → [`architecture.md` §2](architecture.md)
- Projects bölümünün tek-proje kararı → [`architecture.md` §3](architecture.md)
- İçerik şeması → [`architecture.md` §5](architecture.md)
- Bölge sahipliği → [`working-agreement.md` §1](working-agreement.md)

**Bu belge metin içermez.** Metinler `content/site.ts`'te yaşar ve şema onları **zorunlu**
tutar; bu belge yalnızca nereye girdiklerini söyler. Hero cümlesi, Who we are manifestosu ve
çalışma prensipleri #15'te yazıldı; imza sayısı #17'de kapandı. Bekleyen tek metin ekip
biyografileri ve rolleri (#16).

---

## 1 · Kapsayıcı ve ızgara

Tek `Container` primitive'i bütün bölümlerin genişliğini belirler: `max-width` ve yatay padding
§4.3'ten gelir. Hiçbir bölüm kendi genişliğini tanımlamaz.

| Breakpoint          | Kolon | Izgara                                                |
| ------------------- | ----- | ----------------------------------------------------- |
| `< 640` (mobil)     | 1     | tek kolon, kenar padding 20px                         |
| `640–1023` (tablet) | 2     | eşit iki kolon                                        |
| `≥ 1024` (desktop)  | 12    | 12 kolonluk ızgara, bölümler bunun üstünde konumlanır |

Izgara boşluğu (gutter) ve kart iç boşluğu: **24px mobil / 32px `≥ lg`** — `architecture.md`
§4.3'teki yatay padding değerleriyle aynı iki sayı, yeni bir ölçü ailesi doğurmuyor.

Bölüm arası dikey boşluk §4.3'teki iki değerden gelir: mobilde küçük olan, `lg` ve üstünde büyük
olan. Ara breakpoint'lerde arada bir değer **uydurulmaz**, `lg`'de sıçrar.

**Tam genişlik istisnası:** yalnızca navbar'ın arka planı ve Projects bloğunun zemini viewport
genişliğindedir; içerikleri yine `Container` içinde durur.

---

## 2 · Component envanteri

Durumlar yalnızca **anlamlı olduğu yerde** listelendi. `focus` her zaman `:focus-visible`
demektir — fare tıklamasında halka çıkmaz, klavyede çıkar.

### 2.1 `components/ui/` — paylaşılan primitive'ler

Değişiklikleri iki bölge sahibinin de onayını ister.

| Component   | Props                                                                          | Durumlar                                    | Not                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Container` | `as?`, `children`                                                              | —                                           | Genişlik ve yatay padding'in tek kaynağı. `as` ile `section`/`div`/`nav` olabilir.                                                                                                               |
| `Button`    | `variant: 'primary' \| 'ghost'`, `href?`, `external?`, `disabled?`, `children` | default · hover · focus · active · disabled | `href` varsa `<a>`, yoksa `<button>`. `external` ise `target="_blank"` + `rel="noopener noreferrer"` + görünür dış link ikonu — ikon `external`'ın kendisinden gelir, ayrı bir prop'la geçilmez. |
| `Tag`       | `children`                                                                     | —                                           | Statik. Tech tag'leri. Tıklanabilir değil, `<li>` olarak dizilir.                                                                                                                                |

`Button` ölçüsü: yükseklik 44px (mobil dokunma hedefi eşiği), yatay padding 20px,
`radius-sm`. `Tag`: yükseklik 24px, yatay padding 10px, `surface-2` zemin, `radius-sm`.
`NavLink`: yükseklik 40px, yatay padding 16px, `radius-pill` — sayfadaki tek pill yüzeyi.

**`Tag` pill yapılmadı** ve bu soru bir kez açıldı, kapandı. Zaffiro pivotu (§4.4) renk ve yazı
ailesini değil ölçek, hareket ve mikro detayları değiştiriyor; `radius-pill`'i tag'lere yaymak ise
yukarıdaki cümleyi geçersiz kılar ve nav'ın tek ayırt edici yüzeyini sıradanlaştırırdı. `Tag`
`radius-sm` kalıyor.

**`Button` durum matrisi**

| Durum    | `primary`                                                                     | `ghost`                                        |
| -------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| default  | accent zemin, page rengi metin                                                | şeffaf zemin, border, text rengi metin         |
| hover    | zemin opaklığı düşer (`/90`)                                                  | zemin `surface-2`, border rengi accent'e döner |
| focus    | zeminden bağımsız focus halkası (§7.2)                                        | aynı halka                                     |
| active   | hover ile aynı, 0 transform — sıçrama yok                                     | aynı                                           |
| disabled | `text-muted` metin, `surface-2` zemin, `cursor: not-allowed`, `aria-disabled` | aynı                                           |

V1'de `disabled` kullanan bir yüzey **yok**; durum tanımlı ki sonradan uydurulmasın.

### 2.2 Bölüm component'leri

| Component     | Bölüm      | Bölge | Props                           | Durumlar                             |
| ------------- | ---------- | ----- | ------------------------------- | ------------------------------------ |
| `Nav`         | Navigation | **B** | `items: NavItem[]`              | —                                    |
| `NavLink`     | Navigation | **B** | `href`, `label`, `active`       | default · hover · focus · **active** |
| `MobileMenu`  | Navigation | **B** | `items`, `open`, `onOpenChange` | kapalı · açık · focus                |
| `Hero`        | Hero       | **A** | `site.hero`                     | —                                    |
| `Projects`    | Projects   | **A** | `projects: Project[]`           | —                                    |
| `ProjectCard` | Projects   | **A** | `project`, `index`, `total`     | default · hover · focus-within       |
| `MetricRow`   | Projects   | **A** | `metrics: Metric[]`             | —                                    |
| `WhoWeAre`    | Who We Are | **B** | `site.whoWeAre`                 | —                                    |
| `Team`        | Team       | **B** | `members: TeamMember[]`         | —                                    |
| `TeamCard`    | Team       | **B** | `member`                        | default · hover · focus-within       |
| `Footer`      | Footer     | **B** | `site.footer`                   | —                                    |

`ProjectCard` `index` ve `total` alır çünkü yığın davranışı (§4.2) kartın kaçıncı olduğunu bilmek
zorunda. V1'de `total === 1` ve yığın hiç devreye girmez.

Hiçbir bölüm component'i `content/` dosyalarını doğrudan okumaz; veriyi props olarak alır
(`architecture.md` §5).

---

## 3 · Bölüm bölüm layout

### 3.1 Navigation — Bölge B

Sticky, sayfanın en üstünde, `position: sticky; top: 0`. **Scroll listener yok**
(`CLAUDE.md` kural 3).

|           | Mobil               | `≥ lg`                                         |
| --------- | ------------------- | ---------------------------------------------- |
| Yükseklik | 72px                | 88px                                           |
| Sol       | wordmark `MyManDev` | wordmark                                       |
| Orta      | —                   | dört nav linki, pill radius                    |
| Sağ       | menü düğmesi        | GitHub aksiyonu (`ghost` Button, ikon + metin) |
| Zemin     | blur + hafif tint   | blur + hafif tint                              |
| Alt kenar | **yok**             | **yok**                                        |

**Ayrı bir bar rengi yok** ve bu bir karar değişikliği. Burada bir zamanlar şu yazıyordu: "Zemin
saydam değil… `backdrop-filter` mobilde bedava değil, düz `surface` zemin seçildi." Sonuç, sayfa
zemininden (`#203033`) belirgin şekilde koyu (`#111b1d`) bir şerit oldu — üstte duran, sayfaya ait
olmayan ayrı bir bant. Kaldırıldı.

Yerine `backdrop-filter`: bar arkasındaki neyse onu alıp bulanıklaştırıyor ve hafifçe koyultuyor.
Düz bir bant değil, ama üzerinden geçen her şeyde yazı okunur kalıyor.

**Bar tepede sessiz, scroll'da belirgin.** İlk 120px boyunca saydam ve blur'suz; sonra bugünkü
tanımlı hâline yerleşiyor. Tetikleyici **scroll listener değil** — `animation-timeline: scroll()`,
yani kural 3 değişmedi.

Keyframe'de **yalnızca `from`** tanımlı: dinlenme hâli tanımlı (okunur) bar. Destek yoksa,
`prefers-reduced-motion` açıksa veya animasyon kalkarsa bar okunur tarafa düşer. Ters yazılsaydı bar
saydam kalırdı ve Team'in açık gökyüzlü fotoğrafları üzerinde nav yazısı okunmaz olurdu.

Ölçüldü: bar saydamken bile wordmark **12.49:1**, nav linkleri **6.65:1** — ikisi de AA'nın
üstünde.

**Okunurluk ölçüldü, göz kararı değil.** Sayfa baştan sona kaydırılıp nav yazısının arkasındaki
zemin her 100px'te örneklendi; en kötü durum **5.49:1** — AA eşiği 4.5. Team'in açık gökyüzlü
fotoğrafları dahil. Düz saydam bırakmak orada beyaz mono yazıyı okunmaz yapardı; tint'in görevi
estetik değil, o tabanı garanti etmek.

Zemin rengi token'dan türetiliyor (`color-mix(in srgb, var(--color-page) 72%, transparent)`), sabit
bir `rgba()` yazılmıyor (`CLAUDE.md` kural 1).

**`@supports` kapısı:** `backdrop-filter` desteklenmiyorsa bar **saydam değil dolu zemine** düşer.
Okunurluk bir tercih değil; desteğin yokluğunda gerileme yönü her zaman okunur olan taraf olmalı.

**Yazı ölçüsü token'da.** Nav yazısı 15px (`--text-nav`) ve mono kalıyor: sitenin bütün başlıkları
mono, nav'ı başka bir aileye geçirmek kimliği bölerdi — ihtiyaç olan şey aile değil **ölçü** idi,
yeni font eklenmedi. Daha önce `Nav.tsx` içinde `text-sm tracking-[0.08em]` diye **satır içi**
duruyordu; #46 diğer her şeyi token'a taşırken bu satır atlanmıştı.

**Aktif link tespiti:** tek bir `IntersectionObserver`, yalnızca `Nav` içinde. Başka hiçbir yerde
scroll dinlenmez. Gözlem ayarı: `rootMargin: '-<navbar>px 0px -55% 0px'`, `threshold: 0`.
Alt marj −%55, bir bölümün ekranın üst yarısına girdiği anda aktif sayılmasını sağlıyor;
aksi halde iki bölüm aynı anda aktif görünüyor.

**Mobil menü** `< lg` (1024px) altında devreye girer: dört nav linki + wordmark + GitHub
aksiyonu `md` genişlikte sıkışıyor. Menü düğmesi `aria-expanded` taşır ve `MobileMenu`'yü `aria-controls` ile
işaret eder. Açıkken tam ekran örtü, `surface` zemin, linkler tek kolon. Klavye davranışı §7.4.

### 3.2 Hero — Bölge A

|             | Mobil   | `md` | `≥ lg`                         |
| ----------- | ------- | ---- | ------------------------------ |
| Kolon       | 1       | 1    | 2 — metin solda, işaret sağda  |
| Kolon oranı | —       | —    | 7 / 5, arada 1 kolon boşluk    |
| Sağ kolon   | **yok** | yok  | wordmark işareti, dikey ortalı |
| Hizalama    | sola    | sola | sola                           |

Sıra: başlık (Display XL) → alt cümle (Body) → iki aksiyon
(`primary` Projects CTA + `ghost` About CTA).

- Başlık metni: `site.hero.title` — #15'te yazıldı
- Alt cümle: `site.hero.subtitle`

Aksiyonlar mobilde alt alta ve tam genişlik, `sm`'den itibaren yan yana.

**Hero yüklenirken kademeli belirir:** başlık → alt cümle → aksiyonlar → amblem, 240ms süre ve
kelime başına değil öğe başına 70ms kademe. Bu, "sayfa yüklenirken giriş animasyonu yok" yasağını
geri alıyor (§4.4) — yasak kaldırıldı, zarf korundu.

Sınıf `reveal-on-enter` **değil** `reveal-on-load` ve sebep teknik: Hero açılışta ekranda olduğu için
`animation-timeline: view()` onu "geçmiş" sayar ve öğe son hâlinde açılır. Hero'daki efekt yükleme
anına bağlı olmak zorunda.

Keyframe'de **yalnızca `from`** tanımlı. `prefers-reduced-motion` bloğu `animation-name: none`
uyguladığında öğe tam görünür hâline döner; `to` yazılsaydı aynı blok onu `from` karesinde dondurur
ve **Hero hiç görünmezdi**.

**Bölüm bir ekran yüksekliğinde** (`min-h-dvh`), içerik dikeyde ortalı. Önceki hâli **478px**, yani
900px'lik bir ekranın %53'ü — Projects'in üstü açılışta ekrana giriyordu. Yan fayda: metin giriş
efekti artık Projects'te de çalışıyor, çünkü o öğeler ilk ekranın altına indi.

**Zemin iki katmanlı:** ince çizgiler (`repeating-linear-gradient`, 118 derece, 1px, 88px aralık) ve
altında tint. Çizgiler **noise değil** ve bu bir seçim — noise bir görsel dosya ister ve payload'a
biner; çizgi deseni saf CSS ve 0 bayt. Rengi `--hero-line`, metin renginin **%6'sı**: %10'da bir
ızgara gibi okunuyor, %3'te hiç görünmüyor.

**Alt kenarda scroll göstergesi:** ince dikey bir çizgi ve içinde aşağı inen küçük bir işaret.
**Metin yok** — "SCROLL" yazmak yeni bir UI metni uydurmak olurdu, ve `aria-hidden` bir metin
kontrast için yine tartılır (depo bunu bir kez yaşadı). `aria-hidden`, yeşil değil, ve **iki tur**
oynayıp duruyor: iki kez 2200ms, yani 4400ms — WCAG 2.2.2'nin beş saniye çizgisinin altında, o
yüzden duraklatma mekanizması maddesi hiç tetiklenmiyor.

**Sağ kolonda amblem var.** Markanın kendi işareti — üç kafa ve bir "m", yani üç kişi.

Orada bir zamanlar **büyütülmüş wordmark** duruyordu ve kaldırıldı. Bir kelime ancak kenardan
taşarsa grafik gibi okunuyor (çerçeveye sığan bir metin ikinci bir başlıktır), taşınca da **yarım
bir kelime** olarak görünüyordu — "MyManD". Amblem o ikilemi taşımıyor.

Kuralları:

- **Kaynak vektör** (#18): `public/logo-mark.svg`. Orijinal 400×400 PNG'den
  `scripts/trace-mark.mjs` ile türetildi — başka bir vektör kaynağı yok, PNG'nin kendisi orijinal.
  Zemini **saydam**: markanın dolu turkuaz karesini olduğu gibi koymak ekran boyunda ikinci bir
  yeşil odak eklerdi (§5.1). Tam logo ayrı dosyada: `public/logo.svg`.
- **`mask-image` + `background-color`, `<img>` değil.** Renk token'dan (`--color-mark`) geliyor ve
  bir dosyanın içine gömülü kalmıyor (`CLAUDE.md` kural 1).
- **Rengi logonun kendi turkuazı** (`--color-mark`, `#0D9488`). Önceki sessiz ton (`#3d5a53`) amblemi
  zemine karıştırıyordu; karar sahibi orijinal rengi istedi. **Accent değil** (`#14B8A6`) ve bu ayrım
  korunuyor: amblem tıklanmıyor, metin taşımıyor, hiçbir aksiyonu işaret etmiyor. Kare zemin **yok**
  — 460px'lik dolu bir blok Hero'nun ağırlık merkezini başlıktan amblemin üstüne kaydırıyor. Şekil
  orijinal, zemin değil. §5.1'in tek-yeşil okumasına etkisi orada yazılı.
- **Bütün durur, taşmaz.** Yerini aldığı wordmark'ın tam tersi sözleşme: yarısı kırpılmış bir logo
  bozuk görünür.
- **Ölçü 460px'te kapanıyor** ve bu artık bir **tasarım** sınırı, çözünürlük sınırı değil. Vektöre
  geçmeden önce tavan 380px'ti ve sebebi kaynağın 400×400 olmasıydı; vektörde öyle bir tavan yok.
  Bugünkü sınırın gerekçesi: amblem başlığın ağırlığını geçmemeli. **Ölçü %18 küçüldü** (istek:
  "biraz fazla büyük, ayrı bir banner görseli gibi duruyor"): `clamp(220px, 26vw, 460px)` yerine
  `clamp(180px, 21vw, 380px)`, 1440'ta 374px'ten **302px**'e.
- **`aria-hidden`.** Marka adı sayfada zaten navbar ve footer'da okunuyor; amblem bilgi değil
  ağırlık taşıyor.
- **Yalnızca `lg` üstünde.** Dar ekranda metnin yanına değil, yerine geçerdi.

**Başlık `text-wrap: balance` kullanır.** Süsleme değil: başlığın anlamı iki cümlenin
karşıtlığında ve tarayıcı onu ortasından bölüyordu — 390, 1024, 1920 ve 2560'ta satır
`changed. We / didn't.` diye kırılıyor, "We" önceki cümlenin kuyruğuna takılıyordu. Balance ile
altı genişlikte de çift bozulmuyor. **Genişlik sınırı eklenmedi:** denendi, 768'i bozuyor — orada
başlık tek satıra sığıyor ve bir `22ch` capı onu gereksiz yere ikiye bölüyordu.

**İki aksiyon da çiziliyor.** Burada bir zamanlar "tek aksiyon" sapması yazılıydı: ikinci düğme
Who we are'a gidiyordu ve o bölüm henüz yoktu (#9). #9 kapandı, bölüm sayfada, düğme çiziliyor —
sapma bitti. `Hero`'nun `secondary` prop'u yine de opsiyonel kalıyor; hiçbir yere götürmeyen bir
düğme çizilmemesi kuralı ("`projects` boşsa bölüm render edilmez"in aynısı) hâlâ geçerli.

### 3.3 Projects — Bölge A

`architecture.md` §3 kararı: **V1'de tek proje bloğu, mimari N proje.** İki durum ayrı
spesifiye edilir; `ProjectCard` ikisini de karşılayacak şekilde yazılır.

#### 3.3.1 V1 — tek proje

Kart değil, kendi başına bir bölüm gibi duran tam genişlikte blok.

|                 | Mobil                        | `≥ lg`                                       |
| --------------- | ---------------------------- | -------------------------------------------- |
| Yapı            | tek kolon                    | 2 kolon — solda metin, sağda ekran görüntüsü |
| Ekran görüntüsü | metnin altında, tam genişlik | sağ kolon                                    |
| En-boy          | 16 / 10                      | 16 / 10                                      |

Blok içi sıra: **sıra numarası (mono, `text-muted`)** → proje adı (Display L) → özet (Display M,
`text-muted`) → **açıklama (Body)** → tech tag'leri (`Tag` listesi, mono) → `MetricRow` → aksiyonlar
(GitHub `ghost`, Live Demo `primary`).

**Metrik satırı üç kısıt taşır:** `15 PLAYERS OPTIMISED`, `£100M BUDGET CONSTRAINT`,
`1 OPTIMAL SQUAD`. Önceki tek sayı (`0`, "ML models promoted to production")
`architecture.md` §4.6'nın imza öğesiydi ve karar sahibi tarafından değiştirildi; **ne
kaybedildiği** §4.6'da yazılı.

**Sıra numarası `01`, `02`…** ve bu #58'i **kısmen** geri alıyor: bölüm etiketleri geri gelmedi,
yalnızca proje kartının sırası. Değer `index`ten türetilir, elle yazılmaz. `aria-hidden`: sıra
bilgisi DOM sırasında zaten var ve ekran okuyucuya "sıfır bir Football Squad Optimizer" diye
okutmak başlığın adını kirletirdi. Yeşil değil (§5.1).

**Açıklama alanı sonradan eklendi ve şemada `zorunlu`.** Blok bir zamanlar yalnızca tek satırlık
özetle yayına çıkıyordu; sol kolon dolmuyor, proje de anlatılmıyordu — "projemizi çok az
açıklıyoruz". `.optional()` yazmak o kusuru sessizce geri getirirdi (`CLAUDE.md` kural 7), bu
yüzden açıklaması olmayan bir proje **build'i düşürür.**

Özet ile açıklama **ayrı tipografik roldedir** ve bu ayrım kasıtlı: özet uygulamanın kendi
başlığındaki cümle — bir çengel, tek satır; açıklama projenin ne yaptığını anlatan gövde. İkisi
aynı ölçüde basıldığında yan yana iki paragraf gibi okunuyordu, o yüzden özet Display M'e çıktı ve
`text-muted` oldu.

Proje adı da Display M'den **Display L**'e çıktı: özetle aynı ölçüdeyken hangisinin ad olduğu
okunmuyordu. Bölüm içi ölçü sırası artık 80 → 56 → 28 → 18.

**Açıklama metni doğrulanabilir olgulara dayanır, uydurulmaz** (`CLAUDE.md` kural 5). Football
Squad Optimizer'ınki için dayanaklar `content/projects.ts`'te tek tek yazılı: bütçe rakamı, çözücü
çıktısı (`OPTIMAL — Proved Optimal`), oyuncu başına projeksiyon ve "Projection Versus Outcome"
satırı — hepsi uygulamanın kendi ekranında görünüyor.

`MetricRow` — imza öğesi (`architecture.md` §4.6). Sayı Display M, etiketi mono ve `text-muted`.
İfade seçildi ve `architecture.md` §4.6'da kayıtlı. `metrics` boşsa satır **render edilmez**;
boş çerçeve veya "—" gösterilmez.

Ekran görüntüsü: gerçek uygulamadan. Yoksa blok yayınlanmaz — placeholder görsel konmaz
(`CLAUDE.md` kural 6). Düz `<img>`, elle üretilmiş webp, `width`/`height` verilir ki CLS
oluşmasın.

**`next/image` kullanılmıyor** ve bu ölçülerek seçildi. Statik export + `images.unoptimized`
altında ne optimizasyon ne srcset üretiyor, ama sayfaya **5.5 KiB client JS** ekliyor:
132.1 → 137.6 KiB. Payload kapısının kalan payı o anda 17.9 KiB'dı, yani bedeli payın üçte biri
ve karşılığı sıfır. `architecture.md` §8 "eşik yükseltilmez — aşarsa geri dönüp azaltılır" diyor;
burada eşiğe dayanmadan önce azaltıldı. CLS'i `width`/`height` ile `--aspect-screenshot` kutusu
birlikte karşılıyor; `loading="lazy"` ve `decoding="async"` elle veriliyor ve
`@next/next/no-img-element` uyarısı tek satırda, gerekçesiyle susturulur.

#### 3.3.2 N proje — yığın

İçerik dosyasına ikinci proje eklendiğinde devreye girer. **CSS `position: sticky` + z-index**,
scroll listener yok.

- Her kart `position: sticky; top: calc(var(--nav-height) + 24px)`.
- `z-index` kart sırasıyla artar; sonraki kart öncekinin üstüne biner.
- **Viewport yüksekliği kartın KENDİSİNDE:** `min-height: calc(100dvh - nav - 24px)`. Kap böylece
  kendiliğinden kart sayısı × yükseklik oluyor.

**İki yol denendi ve ölçümle elendi** — yığın uyandığında ikisi de sessizce çalışmıyordu:

| Deneme                             | Neden çalışmadı                                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sarmalayıcıda `min-height: 100dvh` | `position: sticky` **ebeveyninin kutusuyla sınırlı**; kart 01 yalnızca kendi yuvası ekranda kaldığı sürece sabit durdu, kart 02 hâlâ 436px aşağıdayken bıraktı                              |
| Kartta `margin-bottom: 100dvh`     | Daha kötü: sticky kısıtlama dikdörtgeni kapsayıcının iç kutusundan **elemanın marjları kadar küçülüyor**, yani 900px margin menzili tam 900px kısalttı (ölçüldü: 880px aşağıdayken bıraktı) |

Yükseklik kartın kendi kutusunda olduğunda geometri hizalanıyor: kart 01'in menzili (N−1) × yükseklik
kadar kalıyor ve kart 02 tam o menzilin içinde tepeye varıp üstüne biniyor. **Ölçüldü:** 16 scroll
adımının 14'ünde iki kart üst üste.

**Bilinen sınır:** tam iki kart varken son kartın kendi "sabit kalma" süresi yok — kart 02 tepeye
vardığı anda kart 01 menzilini bitiriyor ve ikisi birlikte kayıp gidiyor. Son karta da bekleme
vermek kabın sonuna fazladan yükseklik eklemek demek; üçüncü proje geldiğinde ölçülüp karara
bağlanacak.

`architecture.md` §3'ün dört açık sorusu burada cevaplanıyor:

| Soru                     | Cevap                                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mobilde davranış         | Yığın **yok**. `< lg` altında kartlar düz liste; viewport yüksekliği yığını taşımıyor ve sticky kart mobilde ekranın çoğunu yiyor.                                                                                                                                       |
| `prefers-reduced-motion` | Yığın düz listeye döner, `position: static` (§4.4).                                                                                                                                                                                                                      |
| Alttaki kartın focus'u   | Kart içeriği `inert` **değildir**; sticky yalnızca konumu değiştirir, kartlar DOM'da normal sırada ve klavyeyle erişilebilir. Üste binen kart alttakinin focus'unu görsel olarak kapatırsa, focus'lanan kart `z-index` sırasını geçici olarak kazanır (`:focus-within`). |
| Yığın yüksekliği         | Kap yüksekliği = kart sayısı × viewport yüksekliği. Tek kartta kap normal akışa döner ve sticky hiç uygulanmaz.                                                                                                                                                          |

### 3.4 Who we are — Bölge B

Kolektifi **birlikte** anlatır; kişiler bir sonraki bölümde tek tek geliyor. Genelden tekile.

**İki kolon (`lg` üstünde).** Solda başlık (Display XL) → manifesto (Body), sağda prensip destesi.
Mobilde alt alta. Metin genişliği okunabilirlik için `65ch` ile sınırlı — sınır kapsayıcıdan değil
okunabilirlikten geliyor, kapsayıcı 1600px.

Bölüm başlığı (Display XL) doğrudan manifestonun üstünde; ayrı bir etiket yok (§9, #58).

- Manifesto ve prensipler: `site.whoWeAre` — #15'te yazıldı

Prensip sayısı **3–5** ve bu sınır belgede değil şemada zorlanıyor
(`content/schema.ts`, `.min(3).max(5)`): altıncı bir madde eklenirse `pnpm build` patlar.

#### Prensip destesi

Prensipler **tek tek** gösterilir; kullanıcı ileri/geri tuşlarıyla gezer ve `01 / 05` sayacı
konumu söyler. Prensip Display L'de durur — ekranı hak eden cümle Body S'te kaybolur. Ölçü
genişliği `--max-width-statement` (22ch): `65ch` gövde metni için doğru ama `ch` yazı boyutuyla
büyüdüğü için 40px'te sınır işlevini yitirir (§4.3).

**Deste kendiliğinden ilerler: 7 saniyede bir sonraki prensip.** Duraklatma mekanizması
**etkileşim** — fare desteye girdiğinde veya içeriye odak düştüğünde durur, çıkınca kaldığı yerden
sürer. Kalıcı durdurma değil. WCAG 2.2.2 kendiliğinden başlayan ve beş saniyeden uzun süren
otomatik güncellemede bir duraklatma yolu istiyor; bu o yol. **Görünür bir Pause tuşu eklenmedi:**
burada olmayan bir kontrol demekti ve klavye turunu bir durak uzatırdı. Bilinen sınır — dokunmatikte
hover yok; tuşa dokunulduğunda odak orada kaldığı için duraklama yolu var, ama sayfayı yalnızca
kaydırarak okuyan bir dokunmatik kullanıcısının yolu yok.

**Geçiş, prensibin kelime kelime belirmesidir.** İki biçim denendi ve bırakıldı: bloğun tamamını
birlikte kaydıran giriş animasyonu (240ms, sonra 600ms) bir geçiş değil sıçrama gibi okunuyordu,
harf harf daktilo ise fazla sade okundu. Şimdi her kelime sırayla, hafif yükselerek ve netleşerek
geliyor: 520ms süre, kelime başına 70ms kademe. On kelimelik en uzun prensipte son kelime 630ms'de
başlıyor ve 1.15s'de bitiyor, yani 7 saniyelik aralığın belirgin şekilde altında.

**Efekt saf CSS, sıfır JS.** Animasyonu tetikleyen şey bir zamanlayıcı değil, **selektörün
eşleşmesi**: `data-active` bir slot'a geçtiği anda kural o slot'un kelimelerine uymaya başlıyor ve
animasyon baştan çalışıyor. Daktilo için bir `useEffect`, bir zamanlayıcı ve bir `matchMedia`
okuması gerekiyordu; hiçbiri kalmadı. `prefers-reduced-motion` da bedelsiz çözülüyor — evrensel blok
`animation-name: none` uyguluyor ve keyframe yalnızca `from` tanımladığı için kelimeler tam görünür
hâline dönüyor. Metin DOM'da her zaman tam, gizleme yalnızca `opacity` ile.

**Canlı bölge otomatik geçişte susar.** `aria-live` her değişikliği duyurursa ekran okuyucu
kullanıcısı yedi saniyede bir, istemediği hâlde sözünün kesildiğini yaşar. Otomatik ilerleme
`off` yazar; kullanıcı etkileşimi `polite`'a döndürür. Sıra çalışır durumda: odak olayı tıklamadan
önce geldiği için kullanıcının adımı zaten canlı bir bölgede iner.

**Burada pinlenen bir dizi vardı (#56) ve kaldırıldı.** O biçim bölümü bir viewport'a sabitleyip
prensipleri scroll'la değiştiriyordu. Kusuru yapısaldı, ayarla düzelmiyordu: **manifestoyu ekrandan
atıyordu.** Geriye bir viewport dolusu boşlukta tek bir cümle kalıyordu — bölümün boş görünmesinin
sebebi buydu. Manifesto ve prensipler artık aynı ekranda: biri kolektifin ne olduğunu, diğeri nasıl
çalıştığını söylüyor ve ikisi birlikte okunuyor.

**İlerleme bir katman, taşıyıcı değil.** Sunucu çıktısı **beş prensibi de** düz liste olarak
basar; tuşlar yoktur. Deste ancak hidrasyondan sonra devreye girer.

| JS durumu           | Sonuç                                                      |
| ------------------- | ---------------------------------------------------------- |
| Hiç gelmedi / düştü | Beş prensip de okunur düz liste, gezinme tuşu **çizilmez** |
| Geldi               | Tek prensip + ileri/geri tuşları + sayaç                   |

Tersini yazmak (sunucuda tek prensip, gerisini JS açar) beş cümlenin dördünü JS'e rehin verirdi.
Aynı gerekçe daktilo efektinde de yazılı (§6): gizleyen taraf, gelmeyebilecek olan taraf olmalı.
Çalışmayan bir tuş da çizilmez — hiçbir yere gitmeyen düğme çizmemekle aynı kural (§3.2).

**Beş prensip de aynı ızgara hücresinde üst üste durur**, yalnızca aktif olan görünür. Sebep
ölçüldü: tek prensip basıldığında kap yüksekliği prensibin uzunluğuyla değişiyor, iki satırdan üç
satıra geçerken **tuşlar aşağı kayıyordu**. Art arda tıklamaların biri boşa düştü — beş tıklamada
sayaç 01 yerine 05'te kaldı. Gerçek kullanıcıda bu "tuşa bastım, bir şey olmadı" olur. Üst üste
yığmak kap yüksekliğini en uzun prensibe sabitliyor; ölçüldü, tuş konumu beş adımda da aynı.

Görünmeyenler `visibility: hidden`. `display: none` yüksekliği de götürür ve sabitleme bozulur;
`opacity: 0` ise öğeyi erişilebilirlik ağacında ve odak sırasında bırakırdı.

**Erişilebilirlik.** Sahne `aria-live="polite"`: odak tuşta kaldığı için değişen metin
kendiliğinden duyulmaz ve canlı bölge olmadan ekran okuyucu kullanıcısı tuşun bir şey yaptığını
anlamaz. Deste `role="group"` + `aria-roledescription="carousel"`; erişilebilir adı `Principles` ve
bu **uydurulmuş marka metni değil** — alanın `content/site.ts`'teki adı zaten o. Görünür bir başlık
yazmak yeni bir marka cümlesi yazmak olurdu (`CLAUDE.md` kural 5).

Gezinme **başa sarar**. Sonu olan bir gezinmede son tuş devre dışı kalır ve odak boşa düşer; beş
öğede sarma yönü kaybettirmiyor, sayaç konumu zaten söylüyor.

**Destenin üstünde ince bir çizgi var ve bu süsleme değil, hiyerarşi düzeltmesi.** Prensip de
bölüm başlığı bir zamanlar aynı ölçüde mono'ydu (40px) ve çizgisiz hâlde ikisi yan yana iki
**başlık** gibi okunuyordu. Başlık Display XL'e çıktıktan sonra ölçü farkı bu işi tek başına da
yapıyor; çizgi yine de duruyor çünkü mobilde kolonlar yığıldığında ayıran tek şey o. Alternatifi denendi — prensibi 24px'e düşürmek — ve sağ kolonu yeniden boşaltıyordu,
yani bu bölümün ilk şikâyetini geri getiriyordu. Çizgi desteyi ayrı bir modül olarak işaretliyor,
ölçüyü düşürmeden. Mobilde de durur; orada işi daha açık, kolonlar yığıldığında manifestoyla
prensipleri ayıran tek şey odur.

**Bölümde yeşil yok** (§5.1). Birincil aksiyon olmadığı için accent kotası sıfır; tuşlar ince
border ve renk değişimiyle çalışır. Tek istisna focus halkası ve o kotaya sayılmıyor (§7.2).

### 3.5 Team — Bölge B

Üç kişiyi tek tek tanıtan kartlar.

|       | Mobil | `sm` | `≥ lg` |
| ----- | ----- | ---- | ------ |
| Kolon | 1     | 2    | 3      |

`lg`'de üç kolon çünkü üç kişi var ve üçü tek satıra oturuyor. `sm`'de iki kolon bir hücreyi boş
bırakıyor; alternatifi mobilden `lg`'ye kadar tek kolon tutmaktı ve o da tablette bir sütunluk
uzun bir şerit üretirdi. Kolon sayısı **içerikten değil breakpoint'ten** gelir; kişi sayısı
değişirse bu tablo yeniden düşünülür, `grid-cols` içeriğe göre hesaplanmaz.

**Etiket yok.** "04 TEAM" ile "Team" aynı kelimeyi iki kez söylüyordu;
numara tek başına kaldığında da bir şey anlatmıyordu. Projects'te etiket duruyor, çünkü orada
başlık proje adı ve "02 PROJECTS" bilgi katıyor. Etiket, tekrar ettiği yerde değil **bilgi kattığı
yerde** durur.

**Bölüm `lg`de bir ekran yüksekliğinde.** Önceki hâli viewport'un **%115'i** (1600x900'de %125),
yani üçüncü kart her zaman kesiliyordu.

**Yükseklik orandan değil kalan alandan gelir** ve bu hesaplanarak seçildi: 1440x900'de 2/3 oranı
sığdırıyor, ama 1600x900'de kart genişliği 490px'e çıktığı için yine %109 taşıyor. Kart genişliği
kapsayıcıyla büyürken ekran yüksekliği sabit kalıyor — yani **tek bir sabit oran her viewport'ta
sığdıramaz.** Zincir: bölüm `h-dvh`, `Container` `flex-1`, sarmalayıcı `flex-1`, liste `flex-1` — her
halkada `min-h-0`. Ölçüldü: 1440x900, 1600x900 ve 1920x1080'de bölüm tam %100 ve üç kart da içinde.

Oran token'ı (`--aspect-portrait`, 5/9) **mobilde** geçerli kalır; `tests/portrait-aspect.test.ts`
anlamını korur çünkü görsel hattı ile token hâlâ aynı sayıyı söylüyor. Görseller yeniden üretilmedi.

**Kart fotoğrafın kendisidir.** Kutu **5/9** oranında (token: `--aspect-portrait`) ve görüntü onu
tamamen kaplar; ad, rol ve linkler görüntünün alt kenarında, üzerinde durur. Hover'da görüntü
hayaletleşir ve biyografi üstünde belirir.

Oran **5/8 idi, kartlar büyüsün diye 5/9 oldu.** Kart zaten kapsayıcının tam genişliğini
kaplıyor — üç kolon, `lg`'de 1440px'te 437px — yani büyüme ancak **yükseklikten** gelebilirdi.
Ölçüldü: 708px → **787px**. Kolon boşluğuna dokunulmadı; 32px'ten 24px'e indirmek kart genişliğine
yalnızca 6px katıyordu, yani gürültü.

**Neden 9/16 değil:** hat yarım piksel üretmemek için genişliğin orana tam bölünmesini şart koşuyor
(`scripts/optimize-images.mjs`). 9/16, mevcut genişliklerle (500, 1000) bu kapıyı geçemiyor; 5/9
geçiyor (900 ve 1800) ve 0.5556 ile 0.5625 arasındaki fark gözle ayırt edilmiyor.

Kutu kaynaktan **dar** olduğu için kırpma yatayda oluyor, dikeyde değil — yüzler kırpılmıyor.
Görseller yeni oranda yeniden üretildi; `lib/image-widths.json` ile token **aynı sayıyı** söylemek
zorunda, yoksa `cover` sessizce kırpar ve `width`/`height` nitelikleri kutuyu yanlış tarif eder.

Başlıktan karta mesafe **24/32** (önce 40/56). Bölümün dış ritmi (`py-section`) değişmedi — o
paylaşılan bir ölçü ve tek bir bölüm için oynatılmaz (§4.2).

Bu düzen bir estetik tercih değil, **kaymayı ortadan kaldıran şeyin kendisi**: açılan her şey
mutlak konumlu, yani kartın yüksekliği hiç değişmiyor. Biyografi akışa eklendiğinde bölüm hover'da
108px büyüyordu ve Team'in altındaki her şey — footer dahil — aşağı kayıyordu.

Metin panelinin zemini **düz %92 opaklık**, gradyan değil. Gradyan denendi ve metnin durduğu yerde
~%54'e düşüyordu; beyaz bir fotoğrafta rol satırı 1.84:1 veriyordu (gereken 4.5). %92'de en kötü
durum ad için 12.83:1, rol ve biyografi için 6.83:1 — yani kontrast fotoğrafın içeriğine bağlı
değil. Koyu fotoğraflarla sorun görünmüyordu; bu yüzden ölçülüyor, bakılmıyor.

**Biyografi hover ile açılır** — ve hover **tek yol değildir.** Üç durum birden karşılanır:

| Giriş yolu                   | Davranış                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| Fare                         | `:hover` — açıklama açılır                                 |
| Klavye                       | `:focus-within` — karttaki bir linke tab'landığında açılır |
| Dokunmatik / hover'sız cihaz | `@media (hover: none)` — açıklama **her zaman açık**       |

Gerekçe: klavye erişimi ve görünür focus **sert kapı** (`architecture.md` §8), ve dokunmatik
cihazda `:hover` ya hiç tetiklenmez ya da ilk dokunuşta takılı kalır. Yalnızca hover'a bağlanan
bir açıklama, o cihazlarda **erişilemez içerik** olur. Bu, sonradan eklenecek bir yama değil,
bölümün tanımının parçası (`CLAUDE.md` kural 10 ile aynı mantık).

Açıklama **DOM'da her zaman vardır**; açılıp kapanan şey görünürlüğü. `display: none` ile
saklanmaz, çünkü ekran okuyucu onu okuyabilmeli.

- Rol ve biyografi: **metin bekliyor** (#16)
- Fotoğraflar: **gerçek fotoğraf bekliyor.** Avatar placeholder konmaz (`CLAUDE.md` kural 6);
  şemaya `photo` alanı **zorunlu** olarak eklenir, yani fotoğrafsız bir kişi build'i düşürür.
  Görseller `scripts/optimize-images.mjs` hattından geçer (`architecture.md` §6).

### 3.6 Footer — Bölge B

Navbar'ın aynası: `surface` zemin, üstte 1px `border`.

|      | Mobil            | `≥ md`                        |
| ---- | ---------------- | ----------------------------- |
| Yapı | tek kolon, dikey | wordmark solda, linkler sağda |

İçerik: wordmark, **tagline**, telif satırı, GitHub linki, ve ayrı bir satırda **kapanış cümlesi**.
Tamamı mono rolü. Sosyal ikon duvarı yok.

İki cümle de **marka metni** ve ikisini karar sahibi yazdı (`CLAUDE.md` kural 5).
`content/site.ts`te `footer.tagline` ("Built by friends.") ve `footer.closing`
("Still building.") olarak yaşıyorlar; component onları okur, yeniden yazmaz. Şemada `.optional()`
yok (kural 7) — bir footer cümlesinin sessizce kaybolması, olmamasından kötüdür çünkü kimse fark
etmez.

Kapanış cümlesi **ayrı bir satırda**: üstteki satırın içine sıkıştırmak onu bir etikete çevirirdi.

GitHub linki `Button` **değil**, düz mono `<a>` — footer'da 44px'lik bir dokunma hedefi fazla
ağır durur. Ama dış link olduğu için §7.5'in görünür ikonunu taşır; ikon `ExternalIcon`
primitive'inden gelir ve 12px'e küçültülür, çünkü footer'ın mono satırı `Button`'ınkinden küçük.

---

## 4 · Tipografi uygulaması

Rollerin boyut ve satır yüksekliği değerleri `architecture.md` §4.2'de. Buradaki iş, hangi
elemanın hangi rolü aldığı.

| Rol        | Nerede                                                            |
| ---------- | ----------------------------------------------------------------- |
| Display XL | Hero başlığı **ve** bölüm başlıkları: Projects, Who we are, Team. |
| Display L  | Prensip destesindeki cümle.                                       |
| Display M  | Proje adı, `TeamCard` adı, `MetricRow` sayısı.                    |
| Body       | Hero alt cümlesi, proje özeti, About manifestosu.                 |
| Body S     | `TeamCard` biyografisi, About prensip listesi, footer telif.      |
| Mono label | `Tag`, `MetricRow` etiketi, nav linkleri, footer linkleri.        |

**Ölçek bir basamak büyüdü** (istek: "yazılar çok küçük", "bu sayfa çok küçük"). Önceki değerler
sırasıyla 40/64 · 28/40 · 20/24 · 15/16 · 14 · 12; bugün 48/80 · 32/56 · 22/28 · 16/18 · 15 · 13.
Component'lerin hiçbirine dokunulmadı — hepsi zaten bu token'ları okuyor, yani büyüme tek yerden
geldi.

**Bölüm başlığı Display L'den Display XL'e çıktı ve bu ayrı bir karar.** Yalnızca ölçeği büyütmek
yetmedi: Who we are'da başlık ile yanındaki prensip **aynı ölçüye** düşüyor ve hiyerarşi
düzleşiyordu — şikâyet zaten tam olarak buydu. Başlık 80px, prensip 56px; artık hangisinin başlık
olduğu ölçüden okunuyor.

Bunun sonucu olarak Display XL **sayfada bir kez değil**, her bölüm başlığında görünüyor. Hero'nun
h1'i yerini ölçüyle değil **bağlamla** koruyor: sayfanın ilk ekranı ve tek `h1`'i (§7.1).

`ch` ile tanımlı ölçü sınırları (`--max-width-prose`, `--max-width-statement`) yazı boyutuyla
birlikte büyüdüğü için ayrıca ayarlanmadı.

Mono katmanı `architecture.md` §4.2'ye göre "şablon hissi"ne karşı en büyük tekil kazanç. Bu
yüzden nav ve footer linkleri de mono — jenerik sans nav, referans mockup'ın en jenerik yeriydi.

**Display rolü de mono** (§4.2). Başlıklarda büyük harf ve geniş `letter-spacing` **yok**; ortak
olan yalnızca yüz. Ölçek ve `letter-spacing` display'in kendi değerleri (`-0.02em`).

`letter-spacing` değerleri role bağlıdır ve §4.2'de yazılı; component'te ayrıca tanımlanmaz.

**Roller token'dır, sayı değil.** Her rol `app/tokens.css`'te bir `--text-*` token'ı ve
component'te bir utility olarak yaşar; boyut, satır yüksekliği ve `letter-spacing` üçü birden
oradan gelir:

| Rol        | Mobil             | `≥ lg`                  |
| ---------- | ----------------- | ----------------------- |
| Display XL | `text-display-xl` | `lg:text-display-xl-lg` |
| Display L  | `text-display-l`  | `lg:text-display-l-lg`  |
| Display M  | `text-display-m`  | `lg:text-display-m-lg`  |
| Body       | `text-body`       | `lg:text-body-lg`       |
| Body S     | `text-body-s`     | —                       |
| Mono label | `text-mono`       | —                       |

`text-[28px]` gibi gömülü bir değer artık yok. `clamp()` de **bilerek yok**: §1 ara
breakpoint'lerde değer uydurulmayacağını söylüyor, `lg`'de sıçrıyor.

**Tek istisna navbar wordmark'ı:** 14px mono, ve bu ölçü §4.2'nin ölçeğinde yok. Token'a
bağlanmadı çünkü bağlamak için önce ölçeğe eklenmesi gerekir; o da bir karar.

---

## 5 · Renk uygulaması

Token adları ve hex değerleri `architecture.md` §4.1'de; **tek kaynak `app/tokens.css`**.
Component'te literal renk yok (`CLAUDE.md` kural 1).

| Yüzey                                        | Token        |
| -------------------------------------------- | ------------ |
| Sayfa zemini                                 | `page`       |
| Navbar, Footer, Projects bloğu, `TeamCard`   | `surface`    |
| Hover zemini, `Tag` zemini, `disabled` zemin | `surface-2`  |
| Ayrım çizgileri, kart kenarları              | `border`     |
| Birincil metin                               | `text`       |
| İkincil metin, roller, etiketler             | `text-muted` |
| Tek yeşil odak                               | `accent`     |

**Yüzey mantığı** §4.1'de: sayfa zemini kartlardan **açık**; katmanlar koyulaşarak öne gelir.

### 5.1 Yeşil disiplini — bölüm başına tek odak

§4.1 kuralı: ekran başına tek yeşil odak. Bölüm bölüm bağlandı:

| Bölüm      | **Tek** yeşil odak              | Yeşil **olmayan**                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------------------ |
| Navigation | aktif nav linki                 | wordmark, diğer linkler, GitHub aksiyonu                           |
| Hero       | `primary` CTA zemini            | başlık, alt cümle, `ghost` CTA — amblem ayrı, aşağıdaki nota bakın |
| Projects   | Live Demo `primary` zemini      | başlık, proje adı, `Tag`'ler, `MetricRow` sayısı, GitHub aksiyonu  |
| Who we are | yok                             | başlık, manifesto, liste madde işaretleri                          |
| Team       | yok — bölümde yeşil kullanılmaz | fotoğraf, ad, rol, biyografi, linkler                              |
| Footer     | yok                             | wordmark, linkler, telif                                           |

**Hero amblemi bu okumayı gevşetti ve bu sessizce olmadı.** Amblem artık logonun kendi turkuazını
taşıyor (`#0D9488`), yani Hero'da **iki yeşil** var: CTA'nın accent'i ve amblem. §4.1'in "ekran
başına tek yeşil odak" cümlesi harfiyen okunursa bu bir ihlal.

Kararı karar sahibi verdi; azaltıcı ölçüler ölçüldü ve yazılı:

- Amblemin turkuazı (`#0D9488`) accent'ten (`#14B8A6`) **daha koyu**, yani ikisi aynı tonda yarışmıyor.
- Amblem **tıklanmıyor, metin taşımıyor, hiçbir aksiyonu işaret etmiyor** — `aria-hidden`, saf dekorasyon.
  Accent hâlâ ekrandaki tek etkileşimli yeşil.
- **Hero'nun zemini de geçişli** (`.hero-field`): sayfa renginden marka rengine doğru `118deg`'lik
  bir tint, yönü amblemin durduğu köşeye bakıyor — plaka sayfanın üzerinde duran ayrı bir blok
  olmaktan çıkıp zeminin koyulaştığı yerde oturuyor. **Bu bir glow değil:** ölçüldü, iki ucun
  kontrastı 1.6'nın altında ve bir kapı bunu tutuyor. Metin solda, orada zemin saf `page` rengi;
  en kötü noktada bile başlık ve alt cümle AA'yı geçiyor (ölçüldü: 11.9:1 ve 6.5:1).
- **Kare zemin geri geldi ve artık gradyanlı.** Plaka üç tonlu bir conic gradyan taşıyor ve açısı
  scroll'a bağlı dönüyor. Durakları uydurulmadı: `--color-mark`tan `color-mix` ile türetildi (§4.5),
  biri sayfa zeminine biri metin rengine doğru. Yani palet büyümedi, aynı renk derinlik kazandı.
- **Sonsuz döngü yok.** Gradyan yalnızca kullanıcı kaydırdıkça dönüyor; sayfa dururken plaka sakin.
  WCAG 2.2.2'nin duraklatma mekanizması istediği durum hiç doğmuyor.
- `tests/e2e/hero.spec.ts` "amblem accent renk kullanmiyor" testi **duruyor ve hâlâ anlamlı**: accent'in
  amblemde kullanılmasını engelliyor.

Who we are, Team ve Footer'da bilinçli olarak yeşil yok: yeşil bir aksiyon rengi ve o üç bölümde
birincil aksiyon yok. Her bölüme bir yeşil serpmek §4.1'in tarif ettiği hatanın kendisi.

**Tek istisna — focus halkası** (§7.2). Halka accent renklidir ve bölüm kotasına sayılmaz; bir
anda yalnızca tek eleman focus'lu olur ve bu durum kalıcı değil geçicidir.

### 5.2 Türetilmiş değerler

§4.5: ara ton gerektiğinde yeni hex **uydurulmaz**, mevcut token'ın opaklığı kullanılır
(`color-mix` veya Tailwind `/60`). Bu belgede opaklık gereken tek yer `primary` Button hover'ı
(`accent/90`) ve `Tag` zemini (`surface-2`).

---

## 6 · Etkileşim ve motion

§4.4 sınırları: CSS öncelikli, 150–250ms, `ease-out`, motion kütüphanesi yok. **Yükleme anında
giriş animasyonu yasağı kaldırıldı** (§4.4); zarf aynen duruyor. Zaffiro etkileşim dili §4.4'te benimsendi; **renk ve yazı ailesi
değişmiyor**, değişen ölçek, hareket ve mikro detaylar.

Aşağıdaki tablo **bugün uygulanmış** geçişleri sayar. Scroll'a bağlı hareketler
`animation-timeline: view()` / `scroll()` ile yazılır ve sıfır JS'e mal olur (§4.4); hangi öğenin
nasıl hareket ettiği, o bölümün PR'ında **bu tabloya satır olarak** eklenir. Önceden bir satır
uydurulmaz — yazılmamış bir hareketi belgede tarif etmek, `content/` altına placeholder koymakla
aynı sınıf hatadır.

| Etkileşim                 | Süre           | Özellik                                        |
| ------------------------- | -------------- | ---------------------------------------------- |
| Button hover / active     | 150ms          | `background-color`, `border-color`             |
| NavLink hover / focus     | 150ms          | `translate` — etiket rulosu (`roll`)           |
| NavLink aktif geçişi      | 150ms          | `color`                                        |
| Metin linki hover / focus | 150ms          | `scale` — alt çizgi soldan açılır (`rule`)     |
| Kart hover                | 200ms          | `background-color`                             |
| `TeamCard` hover / focus  | 200ms          | `translate: 0 -10px`                           |
| `TeamCard` biyografisi    | ~12ms/harf     | daktilo — aşağıdaki nota bakın                 |
| Mobil menü açılış/kapanış | 200ms          | `opacity` + `transform: translateY`            |
| Anchor scroll             | —              | `scroll-behavior: smooth` (CSS)                |
| Bölüm girişi              | scroll'a bağlı | `opacity` + `transform: translateY(16px)`      |
| Prensip girişi            | 520ms + 70ms   | kelime kelime `opacity` + `translate` + `blur` |
| Prensip otomatik geçişi   | 7s aralık      | etkileşimde duraklar, bırakınca sürer          |

**`rule` ve `roll` (#55).** İkisi de `:hover` **ve** `:focus-visible` altında çalışır — yalnızca
hover'a bağlanan bir detayı klavye kullanıcısı hiç görmez, yani detay olmaktan çıkıp fare
sahiplerine özel bir şey olur.

`rule` çizgisi `currentColor` kullanır, yani **hiçbir zaman accent olamaz**: §5.1'in "Footer'da
yeşil yok" kuralı sonradan hatırlanması gereken bir şey değil, renk kendiliğinden doğru. Çizgi
metni kapsar, dış link ikonunu değil.

`roll` etiketi iki kez yazar ve kutuyu tam bir satır yüksekliğinde tutar. **İkinci kopya
`aria-hidden`**: erişilebilir ad tek kalmalı, aksi halde ekran okuyucu her nav linkini iki kez
okur.

**Ölçülen bedel +0.1 KiB** (132.6 → 132.7). Sıfır değil ve sebebi kayda değer: CSS bedava ama
`NavLink`'in markup'ı client component olan `Nav`'ın içinde yaşıyor, yani ikinci etiket birkaç bayt
JavaScript'e mal oluyor. Aynı `rule` Footer'da — sunucu component'i — hiçbir şeye mal olmuyor.

**Bölüm girişi** `animation-timeline: view()`, `animation-range: entry 0% cover 20%`. Süre yok:
ilerlemeyi scroll konumu belirliyor. Erken bitmesi kasıtlı — okumaya başlanan bir metin hâlâ
hareket ediyorsa hareket okunurluğun önüne geçiyor. Kural `@supports` içinde: desteği olmayan
tarayıcıda hiç uygulanmıyor ve öğe son halinde duruyor.

Hareket **bölümün zeminine değil içeriğine** uygulanır. Zemin viewport genişliğinde (§1) ve onu
soldurmak bölümün kendisini yanıp sönüyormuş gibi gösterir.

`transform` mobil menüde ve bölüm girişinde; `TeamCard` `translate` kullanır.

**Kalkma kuralı bölüm bazına ayrıldı.** `ProjectCard`'da hover'da büyüme/kalkma **yok** — sticky
yığınla birlikte katman sırasını okunmaz hale getiriyor (§3.3.2). `TeamCard` yığında değil, yani o
gerekçe orada geçerli değil: kart hover ve focus'ta **10px kalkıyor**. Kalkma layout'a dokunmuyor,
komşu kartlar kaymıyor.

> Tailwind v4 `translate-y-*` için `transform` değil **`translate`** özelliğini üretir. Geçiş
> listesi ve testi de onu okur; `transform` bu kartta `none` kalır.

**Daktilo efekti kalıcı** (#57). Gerçek portrelerle bakıldı ve benimsendi; deneme dönemi kapandı.
Tek dosyada duruyor (`components/sections/team/BioTypewriter.tsx`). Prensip destesi bir süre aynı
kuralı kullandı; kelime kelime belirmeye geçince bıraktı ve kural tek kullanıcıda kaldı. Efekt şu
koşulları karşıladığı için kalıyor:

- Bölümün client JavaScript'i **yalnızca** bu component; gerisi sunucu tarafında. Ölçülen bedel
  **+0.3 KiB** (132.3 → 132.6 KiB).
- Metin DOM'da **her zaman tam** durur; yazılmamış harfler `opacity: 0` ile gizlenir, `display`
  veya `visibility` ile değil. Ekran okuyucu ilk andan itibaren cümlenin tamamını okur, yarım
  yazılmış bir metin duymaz.
- Harfler yerlerini baştan işgal ettiği için metin yazılırken **büyümez**; satır sonları baştan
  hesaplanır ve kart zıplamaz.
- `prefers-reduced-motion`, `(hover: none)` ve **JavaScript hiç çalışmazsa** efekt devreye girmez;
  metin anında tam görünür.

### 6.1 `prefers-reduced-motion: reduce`

§4.4'ün gereği, sonradan eklenecek iş değil (`CLAUDE.md` kural 10):

- `scroll-behavior: auto` — smooth scroll kapanır.
- Tüm `transition-duration` ve `animation-duration` `0.01ms`'e iner. (`0ms` yerine `0.01ms`,
  çünkü bazı tarayıcılar `transitionend` beklerken 0'da olayı hiç üretmiyor.)
- Projects yığını `position: static` — düz liste.
- Mobil menü anında açılır/kapanır; `opacity` ve `transform` geçişi uygulanmaz.
- Scroll'a bağlı animasyonlar **tamamen kaldırılır**: `animation-name: none`. Süreyi kısaltmak
  yetmez, çünkü zaman çizelgesi süreye değil scroll konumuna bağlı — öğe yine scroll'la birlikte
  hareket ederdi. Öğe animasyonsuz doğal haliyle, yani hareketin bittiği halde render edilir.

  **`animation-timeline: none` değil**, ve bu ölçüldü: zaman çizelgesi olmayan bir animasyonun
  geçerli zamanı çözümlenemiyor ve `fill-mode: both` o durumda `from` karesini uyguluyor. Öğe
  `opacity: 0`'da donar — yani reduced-motion açık bir kullanıcı bölümü hiç görmez. Sessizce.
  E2E bu hatayı bir kez yakaladı ve o yüzden duruyor.

Kural global bir `@media` bloğunda **bir kez** yazılır (`app/globals.css`), her component'te
tekrar edilmez.

---

## 7 · Erişilebilirlik

`architecture.md` §8: axe ihlali 0, klavye erişimi, görünür focus ve `prefers-reduced-motion`
**sert kapı**.

### 7.1 Landmark'lar ve belge yapısı

| Landmark      | Eleman                                         |
| ------------- | ---------------------------------------------- |
| `banner`      | `<header>` — navbar                            |
| `main`        | `<main>` — Hero + Projects + Who we are + Team |
| `contentinfo` | `<footer>`                                     |

Her bölüm `<section>` ve `aria-labelledby` ile kendi başlığına bağlanır. Başlık hiyerarşisi:
sayfada tek `h1` (Hero başlığı), bölüm başlıkları `h2`, kart başlıkları `h3`. Seviye atlanmaz.

Bölüm numaraları (`01`–`04`) **kaldırıldı** (#58). Etiket, tekrar ettiği yerde değil bilgi kattığı
yerde durur (§3.5); Hero, Who we are ve Team'de kalktıktan sonra Projects'teki tek başına kaldı ve
dizi olmaktan çıktı. Projects artık kendi bölüm başlığını taşıyor ve proje adı bir alt seviyede.
404 sayfasındaki `404 / Not found` işareti bir bölüm etiketi değil, orada kendi işaretiyle duruyor.

### 7.2 Focus göstergesi

Tek bir global `:focus-visible` kuralı: accent renkli halka + zeminden ayıran offset. Kalınlık
`outline: 2px solid var(--color-accent)`, `outline-offset: 2px`.

`outline: none` hiçbir yerde tek başına yazılmaz. Halka `outline` ile çizilir (`box-shadow`
değil), çünkü Windows yüksek kontrast modunda `box-shadow` kaybolur.

### 7.3 Focus sırası

DOM sırası = görsel sıra. Hiçbir yerde pozitif `tabindex` yok.

1. **Skip link** — `<body>`nin ilk odaklanabilir elemanı, normalde görünmez, focus alınca
   görünür. `#main`'e atlar. Sticky navbar'da dört link + GitHub aksiyonunu her sayfada geçmek
   zorunda kalmamak için gerekli.
2. Wordmark → nav linkleri (`01`–`04` sırasıyla) → GitHub aksiyonu
3. Hero: Projects CTA → About CTA
4. Projects: her kart için GitHub → Live Demo
5. Who we are: gövde içi linkler
6. Team: kart sırasıyla linkler
7. Footer: linkler

**Sticky navbar focus'u kapatmamalı.** Anchor hedefine atlandığında hedef başlık sabit bar'ın
altında kalır. Çözüm: her `<section>`a `scroll-margin-top: calc(var(--nav-height) + 24px)`. Bu bir E2E kapısıdır —
`architecture.md` §8'deki "klavye ile tüm bölüm ve aksiyonlar erişilebilir" satırı bunu kapsar.

### 7.4 Mobil menü klavye davranışı

- Menü düğmesi `aria-expanded` ve `aria-controls` taşır.
- Açılınca focus menünün ilk linkine geçer.
- Menü açıkken focus menü içinde döner (focus trap); arkadaki sayfa `inert`.
- `Escape` menüyü kapatır ve focus'u **menü düğmesine geri verir**.
- Kapanınca `inert` kalkar.
- Menü açıkken sayfa scroll'u kilitlenir; kilit `overflow: hidden` ile, scroll pozisyonu
  korunarak.

### 7.5 Diğer

- Dış linkler (`Live Demo`, `GitHub`): `rel="noopener noreferrer"`, görünür ikon, ve yalnızca
  ikonla anlaşılmasın diye erişilebilir ad metinde geçer.
- Görsellerde gerçek `alt`; dekoratif olanlarda `alt=""`.
- `Tag` listesi `<ul>`/`<li>`; ekran okuyucu öğe sayısını duyurur.
- Renk tek başına bilgi taşımaz: aktif nav linki yalnızca yeşil değil, aynı zamanda
  `aria-current="true"`.

---

## 8 · Katman sırası

| Katman | `z-index` | Kim                                         |
| ------ | --------- | ------------------------------------------- |
| 0      | `auto`    | normal içerik                               |
| 10     | `10`      | Projects yığınındaki kartlar (`10 + index`) |
| 40     | `40`      | sticky navbar                               |
| 50     | `50`      | mobil menü örtüsü                           |
| 60     | `60`      | skip link (focus'lu haldeyken)              |

Aradaki boşluklar bilinçli: yeni bir katman gerektiğinde bütün sayı dizisi yeniden
numaralanmasın.

---

## 9 · Bu belgenin kapsamadıkları

- **Metinlerin kendisi** — paylaşılan karar alanı, yukarıda yerleri işaretli.
- **Logo ve favicon** — kaliteli SVG henüz yok (`HANDOFF.md`).
- **OG görseli tasarımı** — Bölge B, Faz 3.
- **Proje detay sayfaları** — V1'de yok (`architecture.md` §2).
- **Piksel hassasiyetinde görsel ince ayar** — Draw.io ve review aşamasında.

---
