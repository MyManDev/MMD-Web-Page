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
| `WhoWeAre`    | Who we are | **B** | `site.whoWeAre`                 | —                                    |
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
| Yükseklik | 56px                | 64px                                           |
| Sol       | wordmark `MyManDev` | wordmark                                       |
| Orta      | —                   | dört nav linki, pill radius                    |
| Sağ       | menü düğmesi        | GitHub aksiyonu (`ghost` Button, ikon + metin) |
| Zemin     | `surface`           | `surface`                                      |
| Alt kenar | 1px `border`        | 1px `border`                                   |

Zemin **saydam değil**. Referans mockup'ta blur'lu saydam bar vardı; altından geçen metin
okunurluğu bozuyor ve `backdrop-filter` mobilde bedava değil. Düz `surface` zemin seçildi.

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

Sayfa yüklenirken **giriş animasyonu yok** (§4.4). Hero açılışta zaten ekranda; `reveal-on-enter`
burada bilerek uygulanmıyor.

**Sağ kolonda görsel değil işaret var.**

Tablo `lg`'de sağda bir görsel istiyor ve **öyle bir varlık hâlâ yok.** Depodaki tek marka görseli
`assets/brand/logo.png` ve o 9 KB'lik favicon'un kendisi; hero ölçeğinde göstermek placeholder
görsel koymak olurdu (`CLAUDE.md` kural 6). Yerini **wordmark'ın kendisi** dolduruyor — yeni bir
varlık değil, zaten sahip olduğumuz tipografinin büyütülmüş hâli. **Hiçbir issue hero görselini
takip etmiyor**; #18 logo SVG ve OG görselini kapsıyor, hero görselini değil.

Kuralları:

- **`aria-hidden`.** Wordmark sayfada zaten iki kez okunuyor (navbar ve footer). Üçüncüsü bilgi
  değil ağırlık taşıyor; ekran okuyucuya üçüncü kez "MyManDev" duyurmak gürültüdür.
- **Kenardan taşar ve taşması şart.** Çerçeveye sığan bir metin grafik değil, ikinci bir başlıktır.
  Sabit `px` bunu vermiyor: 168px'te işaret 1024'te 339px taşıyor ama 1920'de 61px **içeride**
  kalıyordu. Ölçü bu yüzden viewport'a bağlı — `--text-mark: max(168px, 13vw)`, türetmesi
  `app/tokens.css`'te. Ölçüldü: 1024–2560 arası beş genişlikte taşma 233–358px.
- **Yatay kaydırma üretmez.** Taşan kısmı bölümdeki `overflow-hidden` kırpıyor; beş genişlikte de
  `scrollWidth == innerWidth`.
- **Accent değil.** Rengi `surface-2`; Hero'nun tek yeşili primary CTA (§5.1).
- **Yalnızca `lg` üstünde.** Dar ekranda taşan bir wordmark metnin yerini alır, yanına gelmez.

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

Blok içi sıra: proje adı (Display M) → özet (Body) → tech tag'leri (`Tag`
listesi, mono) → `MetricRow` → aksiyonlar (GitHub `ghost`, Live Demo `primary`).

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
- Yığın kabının yüksekliği kart sayısıyla büyür: kart başına bir viewport yüksekliği.

`architecture.md` §3'ün dört açık sorusu burada cevaplanıyor:

| Soru                     | Cevap                                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mobilde davranış         | Yığın **yok**. `< lg` altında kartlar düz liste; viewport yüksekliği yığını taşımıyor ve sticky kart mobilde ekranın çoğunu yiyor.                                                                                                                                       |
| `prefers-reduced-motion` | Yığın düz listeye döner, `position: static` (§4.4).                                                                                                                                                                                                                      |
| Alttaki kartın focus'u   | Kart içeriği `inert` **değildir**; sticky yalnızca konumu değiştirir, kartlar DOM'da normal sırada ve klavyeyle erişilebilir. Üste binen kart alttakinin focus'unu görsel olarak kapatırsa, focus'lanan kart `z-index` sırasını geçici olarak kazanır (`:focus-within`). |
| Yığın yüksekliği         | Kap yüksekliği = kart sayısı × viewport yüksekliği. Tek kartta kap normal akışa döner ve sticky hiç uygulanmaz.                                                                                                                                                          |

### 3.4 Who we are — Bölge B

Kolektifi **birlikte** anlatır; kişiler bir sonraki bölümde tek tek geliyor. Genelden tekile.

**İki kolon (`lg` üstünde).** Solda başlık (Display L) → manifesto (Body), sağda prensip destesi.
Mobilde alt alta. Metin genişliği okunabilirlik için `65ch` ile sınırlı — sınır kapsayıcıdan değil
okunabilirlikten geliyor, kapsayıcı 1600px.

Bölüm başlığı (Display L) doğrudan manifestonun üstünde; ayrı bir etiket yok (§9, #58).

- Manifesto ve prensipler: `site.whoWeAre` — #15'te yazıldı

Prensip sayısı **3–5** ve bu sınır belgede değil şemada zorlanıyor
(`content/schema.ts`, `.min(3).max(5)`): altıncı bir madde eklenirse `pnpm build` patlar.

#### Prensip destesi

Prensipler **tek tek** gösterilir; kullanıcı ileri/geri tuşlarıyla gezer ve `01 / 05` sayacı
konumu söyler. Prensip Display L'de durur — ekranı hak eden cümle Body S'te kaybolur. Ölçü
genişliği `--max-width-statement` (22ch): `65ch` gövde metni için doğru ama `ch` yazı boyutuyla
büyüdüğü için 40px'te sınır işlevini yitirir (§4.3).

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
bölüm başlığı da aynı ölçüde mono (40px); çizgisiz hâlde ikisi yan yana iki **başlık** gibi
okunuyordu. Alternatifi denendi — prensibi 24px'e düşürmek — ve sağ kolonu yeniden boşaltıyordu,
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

**Kart fotoğrafın kendisidir.** Kutu **5/8** oranında (token: `--aspect-portrait`) ve görüntü onu
tamamen kaplar; ad, rol ve linkler görüntünün alt kenarında, üzerinde durur. Hover'da görüntü
hayaletleşir ve biyografi üstünde belirir.

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

İçerik: wordmark, telif satırı, GitHub linki. Tamamı mono rolü. Sosyal ikon duvarı yok.

GitHub linki `Button` **değil**, düz mono `<a>` — footer'da 44px'lik bir dokunma hedefi fazla
ağır durur. Ama dış link olduğu için §7.5'in görünür ikonunu taşır; ikon `ExternalIcon`
primitive'inden gelir ve 12px'e küçültülür, çünkü footer'ın mono satırı `Button`'ınkinden küçük.

---

## 4 · Tipografi uygulaması

Rollerin boyut ve satır yüksekliği değerleri `architecture.md` §4.2'de. Buradaki iş, hangi
elemanın hangi rolü aldığı.

| Rol        | Nerede                                                       |
| ---------- | ------------------------------------------------------------ |
| Display XL | Yalnızca Hero başlığı. Sayfada **bir kez**.                  |
| Display L  | Bölüm başlıkları: Projects, Who we are, Team.                |
| Display M  | Proje adı, `TeamCard` adı, `MetricRow` sayısı.               |
| Body       | Hero alt cümlesi, proje özeti, About manifestosu.            |
| Body S     | `TeamCard` biyografisi, About prensip listesi, footer telif. |
| Mono label | `Tag`, `MetricRow` etiketi, nav linkleri, footer linkleri.   |

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

| Bölüm      | **Tek** yeşil odak              | Yeşil **olmayan**                                                 |
| ---------- | ------------------------------- | ----------------------------------------------------------------- |
| Navigation | aktif nav linki                 | wordmark, diğer linkler, GitHub aksiyonu                          |
| Hero       | `primary` CTA zemini            | başlık, alt cümle, `ghost` CTA                                    |
| Projects   | Live Demo `primary` zemini      | başlık, proje adı, `Tag`'ler, `MetricRow` sayısı, GitHub aksiyonu |
| Who we are | yok                             | başlık, manifesto, liste madde işaretleri                         |
| Team       | yok — bölümde yeşil kullanılmaz | fotoğraf, ad, rol, biyografi, linkler                             |
| Footer     | yok                             | wordmark, linkler, telif                                          |

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

§4.4 sınırları: CSS öncelikli, 150–250ms, `ease-out`, sayfa yüklenirken giriş animasyonu yok,
motion kütüphanesi yok. Zaffiro etkileşim dili §4.4'te benimsendi; **renk ve yazı ailesi
değişmiyor**, değişen ölçek, hareket ve mikro detaylar.

Aşağıdaki tablo **bugün uygulanmış** geçişleri sayar. Scroll'a bağlı hareketler
`animation-timeline: view()` / `scroll()` ile yazılır ve sıfır JS'e mal olur (§4.4); hangi öğenin
nasıl hareket ettiği, o bölümün PR'ında **bu tabloya satır olarak** eklenir. Önceden bir satır
uydurulmaz — yazılmamış bir hareketi belgede tarif etmek, `content/` altına placeholder koymakla
aynı sınıf hatadır.

| Etkileşim                 | Süre           | Özellik                                    |
| ------------------------- | -------------- | ------------------------------------------ |
| Button hover / active     | 150ms          | `background-color`, `border-color`         |
| NavLink hover / focus     | 150ms          | `translate` — etiket rulosu (`roll`)       |
| NavLink aktif geçişi      | 150ms          | `color`                                    |
| Metin linki hover / focus | 150ms          | `scale` — alt çizgi soldan açılır (`rule`) |
| Kart hover                | 200ms          | `background-color`                         |
| `TeamCard` hover / focus  | 200ms          | `translate: 0 -10px`                       |
| `TeamCard` biyografisi    | ~12ms/harf     | daktilo — aşağıdaki nota bakın             |
| Mobil menü açılış/kapanış | 200ms          | `opacity` + `transform: translateY`        |
| Anchor scroll             | —              | `scroll-behavior: smooth` (CSS)            |
| Bölüm girişi              | scroll'a bağlı | `opacity` + `transform: translateY(16px)`  |
| Prensip dizisi (`lg`)     | scroll'a bağlı | `opacity` + `transform: translateY(12px)`  |

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
Tek dosyada duruyor (`components/sections/team/BioTypewriter.tsx`) ve şu koşulları karşıladığı için
kalıyor:

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
