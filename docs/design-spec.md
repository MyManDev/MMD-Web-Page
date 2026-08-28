# Tasarım Spesifikasyonu — MyManDev sitesi (V1)

Bu belge, `architecture.md` §4'te **karar verilmiş** token, ölçek ve ölçüleri **nereye
uyguladığımızı** yazar. Kararların kendisi orada; burada tekrar edilmez.

- Renk paleti, tip ölçeği, ölçü tablosu, motion kuralı → [`architecture.md` §4](architecture.md)
- Bölüm sırası ve navigation kararı → [`architecture.md` §2](architecture.md)
- Projects bölümünün tek-proje kararı → [`architecture.md` §3](architecture.md)
- İçerik şeması → [`architecture.md` §5](architecture.md)
- Bölge sahipliği → [`working-agreement.md` §1](working-agreement.md)

**Bu belge metin içermez.** Hero cümlesi, About manifestosu, biyografiler ve imza sayısının
ifadesi paylaşılan karar alanıdır (`CLAUDE.md` kural 5). Hepsinin yeri ayrıldı, içi
**metin bekliyor** olarak işaretlendi.

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

| Component      | Props                                                                          | Durumlar                                    | Not                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Container`    | `as?`, `children`                                                              | —                                           | Genişlik ve yatay padding'in tek kaynağı. `as` ile `section`/`div`/`nav` olabilir.                                                                                                               |
| `SectionLabel` | `number`, `children`                                                           | —                                           | `01`–`04` bölüm numarası + etiket. Mono rolü. Bölüm başlıklarının üstünde.                                                                                                                       |
| `Button`       | `variant: 'primary' \| 'ghost'`, `href?`, `external?`, `disabled?`, `children` | default · hover · focus · active · disabled | `href` varsa `<a>`, yoksa `<button>`. `external` ise `target="_blank"` + `rel="noopener noreferrer"` + görünür dış link ikonu — ikon `external`'ın kendisinden gelir, ayrı bir prop'la geçilmez. |
| `Tag`          | `children`                                                                     | —                                           | Statik. Tech tag'leri. Tıklanabilir değil, `<li>` olarak dizilir.                                                                                                                                |

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
| `Team`        | Team       | **B** | `members: TeamMember[]`         | —                                    |
| `TeamCard`    | Team       | **B** | `member`                        | default · hover · focus-within       |
| `About`       | About      | **B** | `site.about`                    | —                                    |
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

|             | Mobil              | `md`    | `≥ lg`                        |
| ----------- | ------------------ | ------- | ----------------------------- |
| Kolon       | 1                  | 1       | 2 — metin solda, görsel sağda |
| Kolon oranı | —                  | —       | 7 / 5, arada 1 kolon boşluk   |
| Görsel      | metnin **altında** | altında | sağda, dikey ortalı           |
| Hizalama    | sola               | sola    | sola                          |

Sıra: `SectionLabel 01` → başlık (Display XL) → alt cümle (Body) → iki aksiyon
(`primary` Projects CTA + `ghost` About CTA).

- Başlık metni: **metin bekliyor**
- Alt cümle: **metin bekliyor**

Aksiyonlar mobilde alt alta ve tam genişlik, `sm`'den itibaren yan yana.

Sayfa yüklenirken **giriş animasyonu yok** (§4.4).

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

Blok içi sıra: `SectionLabel 02` → proje adı (Display M) → özet (Body) → tech tag'leri (`Tag`
listesi, mono) → `MetricRow` → aksiyonlar (GitHub `ghost`, Live Demo `primary`).

`MetricRow` — imza öğesi (`architecture.md` §4.6). Sayı Display M, etiketi mono ve `text-muted`.
Metin **paylaşılan karar alanı: metin bekliyor.** `metrics` boşsa satır **render edilmez**;
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

### 3.4 Team — Bölge B

|       | Mobil | `sm` | `≥ lg` |
| ----- | ----- | ---- | ------ |
| Kolon | 1     | 2    | 2      |

İki kişi var; üç kolonluk bir ızgara boş hücre üretirdi. `TeamMember` sayısı arttığında kolon
sayısı **içerikten** değil breakpoint'ten gelir; boş hücre oluşmaması için `sm`'de 2 kolon
yeterli.

Kart içi: ad (Display M) → rol (mono, `text-muted`) → kısa biyografi (Body S) → link(ler).

- Rol ve biyografi: **metin bekliyor**
- Profil görseli: V1'de **yok**. Gerçek fotoğraf gelene kadar avatar placeholder konmaz.

### 3.5 About — Bölge B

Tek kolon, okunabilirlik için metin genişliği `65ch` ile sınırlı. `SectionLabel 04` → başlık
(Display L) → manifesto (Body) → çalışma prensipleri listesi (Body S).

- Manifesto ve prensipler: **metin bekliyor**

### 3.6 Footer — Bölge B

Navbar'ın aynası: `surface` zemin, üstte 1px `border`.

|      | Mobil            | `≥ md`                        |
| ---- | ---------------- | ----------------------------- |
| Yapı | tek kolon, dikey | wordmark solda, linkler sağda |

İçerik: wordmark, telif satırı, GitHub linki. Tamamı mono rolü. Sosyal ikon duvarı yok.

---

## 4 · Tipografi uygulaması

Rollerin boyut ve satır yüksekliği değerleri `architecture.md` §4.2'de. Buradaki iş, hangi
elemanın hangi rolü aldığı.

| Rol        | Nerede                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Display XL | Yalnızca Hero başlığı. Sayfada **bir kez**.                                                      |
| Display L  | Bölüm başlıkları: Projects, Team, About.                                                         |
| Display M  | Proje adı, `TeamCard` adı, `MetricRow` sayısı.                                                   |
| Body       | Hero alt cümlesi, proje özeti, About manifestosu.                                                |
| Body S     | `TeamCard` biyografisi, About prensip listesi, footer telif.                                     |
| Mono label | `SectionLabel`, `Tag`, `MetricRow` etiketi, nav linkleri, footer linkleri, `01`–`04` numaraları. |

Mono katmanı `architecture.md` §4.2'ye göre "şablon hissi"ne karşı en büyük tekil kazanç. Bu
yüzden nav ve footer linkleri de mono — jenerik sans nav, referans mockup'ın en jenerik yeriydi.

`letter-spacing` değerleri role bağlıdır ve §4.2'de yazılı; component'te ayrıca tanımlanmaz.

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

| Bölüm      | **Tek** yeşil odak              | Yeşil **olmayan**                                                         |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| Navigation | aktif nav linki                 | wordmark, diğer linkler, GitHub aksiyonu                                  |
| Hero       | `primary` CTA zemini            | `SectionLabel`, başlık, alt cümle, `ghost` CTA                            |
| Projects   | Live Demo `primary` zemini      | `SectionLabel`, proje adı, `Tag`'ler, `MetricRow` sayısı, GitHub aksiyonu |
| Team       | yok — bölümde yeşil kullanılmaz | ad, rol, biyografi, linkler                                               |
| About      | yok                             | başlık, manifesto, liste madde işaretleri                                 |
| Footer     | yok                             | wordmark, linkler, telif                                                  |

Team, About ve Footer'da bilinçli olarak yeşil yok: yeşil bir aksiyon rengi ve o üç bölümde
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

| Etkileşim                     | Süre           | Özellik                                   |
| ----------------------------- | -------------- | ----------------------------------------- |
| Button hover / active         | 150ms          | `background-color`, `border-color`        |
| NavLink hover ve aktif geçişi | 150ms          | `color`                                   |
| Kart hover                    | 200ms          | `border-color`, `background-color`        |
| Mobil menü açılış/kapanış     | 200ms          | `opacity` + `transform: translateY`       |
| Anchor scroll                 | —              | `scroll-behavior: smooth` (CSS)           |
| Bölüm girişi                  | scroll'a bağlı | `opacity` + `transform: translateY(16px)` |

**Bölüm girişi** `animation-timeline: view()`, `animation-range: entry 0% cover 20%`. Süre yok:
ilerlemeyi scroll konumu belirliyor. Erken bitmesi kasıtlı — okumaya başlanan bir metin hâlâ
hareket ediyorsa hareket okunurluğun önüne geçiyor. Kural `@supports` içinde: desteği olmayan
tarayıcıda hiç uygulanmıyor ve öğe son halinde duruyor.

Hareket **bölümün zeminine değil içeriğine** uygulanır. Zemin viewport genişliğinde (§1) ve onu
soldurmak bölümün kendisini yanıp sönüyormuş gibi gösterir.

`transform` mobil menüde ve bölüm girişinde. Kartlarda hover'da büyüme/kalkma **yok** — sticky
yığınla birlikte katman sırasını okunmaz hale getiriyor.

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

| Landmark      | Eleman                                    |
| ------------- | ----------------------------------------- |
| `banner`      | `<header>` — navbar                       |
| `main`        | `<main>` — Hero + Projects + Team + About |
| `contentinfo` | `<footer>`                                |

Her bölüm `<section>` ve `aria-labelledby` ile kendi başlığına bağlanır. Başlık hiyerarşisi:
sayfada tek `h1` (Hero başlığı), bölüm başlıkları `h2`, kart başlıkları `h3`. Seviye atlanmaz.

`SectionLabel`'daki `01`–`04` numaraları **dekoratiftir** ve `aria-hidden`; ekran okuyucu
"sıfır bir Projects" diye okumaz.

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
5. Team: kart sırasıyla linkler
6. About: gövde içi linkler
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
