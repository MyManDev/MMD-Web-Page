# Mimari — MyManDev sitesi (V1)

Bu belge **ne inşa ettiğimizi** ve hangi kararla inşa ettiğimizi yazar. Nasıl çalıştığımız
[`working-agreement.md`](working-agreement.md)'de.

Kaynak: _MyMan.dev Final Tasarım ve Teknik Plan V1_ (görsel yön ve kapsam) ve
_Nasıl Çalıştık — Football Squad Optimizer_ (mühendislik ilkeleri).

---

## 1 · Ürün ve kapsam

Tek sayfa, statik, İngilizce bir vitrin ve proje hub'ı. Projeler kendi repo ve deployment'larında
bağımsız yaşar; bu site onlara işaret eder, onları barındırmaz.

**V1'de var:** Hero, Projects, Team, About, Footer. Anchor + smooth scroll. Sticky navbar. SEO
metadata, Open Graph, sitemap, robots. Responsive. Gerçek 404.

**V1'de YOK:** veritabanı, auth, CMS, admin panel, contact form, blog, i18n switcher, tema toggle,
analytics, Docker, sunucu tarafı hiçbir şey.

Bir şeyi eklemek istiyorsan: issue aç, hangi soruyu cevaplayacağını yaz. "Faydalı olabilir" bir
gerekçe değil.

**V1 tamamlanma kriteri:** desktop + mobil temiz; Projects bölümü sorunsuz; ekip profilleri tam;
Football Squad Optimizer gerçek veri, gerçek ekran görüntüsü ve çalışan Live Demo linkiyle ekli;
kapılar geçiyor; `mymandev.com` yayında.

---

## 2 · Bilgi mimarisi

Header linkleri yeni sayfa açmaz. Tek sayfa, dört bölüm, anchor + smooth scroll.

| #   | Bölüm      | İş                                                                |
| --- | ---------- | ----------------------------------------------------------------- |
| 01  | Hero       | Kim olduğumuzu tek cümlede anlat. Projects CTA + About CTA.       |
| 02  | Projects   | Sitenin ana vitrini.                                              |
| 03  | Who we are | Kolektifi birlikte anlatan kısa manifesto ve çalışma prensipleri. |
| 04  | Team       | Kişileri tek tek tanıtan kartlar.                                 |

**Navigation:** sticky navbar; aktif bölüm linki yeşil; GitHub sağda sabit aksiyon; mobilde kompakt
menü. Aktif link tespiti için tek bir `IntersectionObserver`, başka hiçbir yerde scroll listener yok.

**Responsive:** desktop iki kolon hero; tablet kontrollü daralma; mobilde tek kolon, proje görseli
alt satıra iner. Kırılma noktaları Tailwind varsayılanları (`sm 640 / md 768 / lg 1024 / xl 1280`),
özel breakpoint tanımlanmaz.

**Proje detay sayfaları V1'de yok.** İçerik şemasında `slug` alanı bulunur, böylece
`/projects/[slug]` route'ları sonradan şemayı değiştirmeden eklenebilir.

---

## 3 · Projects bölümü — tek gerçek proje

**Karar: V1'de yığın yok, tek proje bloğu var.**

Gerekçe: gerçek projeniz bir tane (Football Squad Optimizer). Tasarım referansındaki
stacked/sticky yığın üç kart varsayıyor; tek kartla üst üste gelecek bir şey yok, davranış anlamını
yitiriyor. "Project Nexus / Aurora" mockup placeholder'ıydı ve yayınlanmayacak — var olmayan bir
ürünü vitrinde göstermek, uydurulmuş bir sayı göstermekle aynı sınıf hatadır.

**V1 tasarımı:** tam genişlikte, kendi başına bir bölüm gibi duran tek proje bloğu. Büyük gerçek
ekran görüntüsü, mono tech tag'leri, GitHub ve Live Demo aksiyonları, ve §5.4'teki dürüst sayı.

**Component `N` proje alacak şekilde yazılır.** İçerik dosyasına ikinci proje eklendiğinde
sticky/z-index yığını devreye girer. Yani mimari bugünden çok-projeli, görünen yüz tek projeli.

**Football Squad Optimizer kartı — gerçek veriler:**

- Repo: `https://github.com/MyManDev/football-squad-optimizer`
- Live Demo: `https://squadopt.mymandev.com/`
- Tech tag'leri: `Python` · `OR-Tools CP-SAT` · `ML` · `React`
- Ekran görüntüsü: gerçek uygulamadan, mockup'tan değil

Bu kart **baştan gerçek veriyle** bağlanır. Optimizer'ın kendi dersi: ön yüz ile üretici
birbirlerinin tarifine karşı geliştirildiği için ilk gerçek yayında üç uyuşmazlık birden çıkmıştı,
ve asıl ders üç hata değil şuydu — _geliştiricinin baktığı yüzey kurgu gösteriyordu, o yüzden üçü de
incelemeden sağ kaldı._ "Sonra doldururuz" aynı tuzağın adı.

**Yığın devreye girdiğinde çözülmüş olması gerekenler** (Draw.io'da planlanır): mobilde davranış
(viewport yüksekliği kartı taşıyor mu, yoksa mobilde düz liste mi); `prefers-reduced-motion` açıkken
davranış; sticky katman altında kalan kartın klavye ile focus alabilmesi; yığın yüksekliğinin kart
sayısıyla büyümesi.

---

## 4 · Tasarım sistemi

### 4.1 Renk

`app/tokens.css` tek kaynaktır. Component'lerde literal renk yok.

| Rol        | Hex       | Kullanım                                                 |
| ---------- | --------- | -------------------------------------------------------- |
| Page       | `#203033` | sayfa zemini                                             |
| Surface    | `#111B1D` | navbar, kartlar (zeminden koyu)                          |
| Surface 2  | `#2A3A34` | ikincil yüzey, hover zemini                              |
| Border     | `#486354` | ince ayrım çizgileri                                     |
| Brand      | `#0D9488` | logonun kendi rengi — **CSS token'ı yok**, aşağıya bakın |
| Accent     | `#14B8A6` | CTA, aktif nav, ikon, mikro highlight                    |
| Text       | `#F2F5F3` | birincil metin                                           |
| Text muted | `#A9B8B2` | ikincil metin (türetilmiş, §4.5)                         |

**Yüzey mantığı:** sayfa zemini kartlardan daha açık. Katmanlar koyulaşarak öne gelir.

**Marka rengi ile accent neden ayrı.** Logo `#0D9488`; o renk üzerinde `page` renginde bir metin
**3.66:1** veriyor ve WCAG AA 4.5 istiyor — yani `primary` Button'ın etiketi axe kapısını
düşürürdü (§8). Accent, aynı ailenin bir tık açığı: buton etiketi 5.51:1, aktif nav linki 7.04:1,
focus halkası en kötü zeminde 4.81:1. Logo kendi rengiyle çizilir; **etkileşim** accent'i kullanır.

Ölçüm önce, renk sonra: bir marka rengini arayüze taşımak onu okunabilir yapmaz.

**Brand'in `tokens.css`'te bir token'ı YOK ve bu bilinçli.** Bugün o renk yalnızca logo
dosyasının içinde yaşıyor; hiçbir yüzey onu CSS'ten boyamıyor. Kullanılmayan bir token Tailwind
tarafından çıktıya hiç yazılmıyor, yani dosyada duran ama hiçbir yere ulaşmayan ölü bir kayıt
olurdu — `--width-prose` bu hatayı bir kez yaptı. Token, onu ilk kullanan yüzeyle birlikte gelir.

**Yeşil disiplini:** ekran başına **tek** vurgu odağı. Referans mockup'ta yeşil aynı anda eyebrow'da,
CTA'da, ikonlarda ve hover'da vardı; dördü birden olunca hiçbiri vurgu olmuyor. Bir bölümde CTA
yeşilse eyebrow beyaz kalır.

### 4.2 Tipografi

**Karar: IBM Plex Sans + IBM Plex Mono**, `next/font` ile self-host (Google Fonts kaynağından,
build sırasında gömülür; runtime'da dış istek yok).

| Rol     | Yüz                                                      | Kullanım                                                  |
| ------- | -------------------------------------------------------- | --------------------------------------------------------- |
| Display | IBM Plex Mono 500, `letter-spacing: -0.02em`             | Hero, bölüm başlıkları                                    |
| Body    | IBM Plex Sans 400/500                                    | paragraf, kart açıklamaları                               |
| Utility | IBM Plex Mono 500, `uppercase`, `letter-spacing: 0.08em` | bölüm etiketleri, tech tag'leri, proje numaraları, footer |

Gerekçe: tek süper-aile olduğu için uyumsuzluk riski yok; mühendislik geçmişi olan bir yüz;
`Inter + Space Grotesk` kadar her yerde görülmüyor. Asıl kazanç mono katmanı — referans mockup'taki
jenerik geometric sans, "şablon" hissinin renkten çok daha büyük kaynağıydı. Yeşil uppercase sans
etiketler yerine mono etiketler tek başına en büyük farkı yaratıyor.

**Display rolü mono'ya geçti.** Başlıklar da IBM Plex Mono 500 kullanıyor — büyük harf ve geniş
`letter-spacing` olmadan, display ölçeğinde ve `-0.02em` ile. Yukarıdaki gerekçenin devamı: mono
katmanı "şablon" hissine karşı en büyük tekil kazançsa, başlığı da ona vermek o kazancı sayfanın
en görünür yerine taşıyor.

Bricolage Grotesque denendi ve seçilmedi. **Bayt farkı yok, ölçüldü:** her iki durumda da indirilen
font 169.888 byte. Yani seçim tamamen görünüş; maliyet argümanı yok.

**Sebebi neden önemli:** `next/font` ilan edilen her ağırlık için bir `@font-face` kuralı üretir —
kullanılanı değil, **ilan edileni**. Ölçüldü: `weight: ["400","500","600","700"]` ile hiç
kullanılmayan 700 için de kural çıkıyor. Bayt değişmemesinin sebebi ağırlıkların elenmesi değil,
**IBM Plex Sans'ın değişken font olarak gelmesi**: dört ağırlık da unicode altkümesi başına aynı
altı `.woff2` dosyasını işaret ediyor. Yani ağırlık listesini uzatmak da kısaltmak da bedava.
Listeyi kısaltmak bayt kazandırmaz; yalnızca hangi ağırlıkların kullanılmasının beklendiğini
söyler.

**Tip ölçeği** (mobil / desktop):

| Rol                       | Boyut       | Satır yüksekliği |
| ------------------------- | ----------- | ---------------- |
| Display XL (hero)         | 40px / 64px | 1.05             |
| Display L (bölüm başlığı) | 28px / 40px | 1.15             |
| Display M (kart başlığı)  | 20px / 24px | 1.25             |
| Body                      | 15px / 16px | 1.6              |
| Body S                    | 14px        | 1.55             |
| Mono label                | 12px        | 1.4              |

### 4.3 Ölçü ve biçim

| Token                     | Değer                                          |
| ------------------------- | ---------------------------------------------- |
| İçerik genişliği          | `max-width: 1600px`, yatay padding 20px / 32px |
| Bölüm arası dikey boşluk  | 80px / 128px — bölüm başına 40/64, toplamı bu  |
| Kart radius               | 14px                                           |
| Küçük radius (tag, buton) | 8px                                            |
| Pill radius (nav)         | 999px                                          |
| Border kalınlığı          | 1px                                            |

### 4.4 Motion

**Etkileşim dili: Zaffiro referansı, benimsendi.** Renk paleti ve yazı aileleri **değişmiyor** —
§4.1 ve §4.2 aynen geçerli. Değişen: ölçek, hareket ve mikro detaylar. Yani bu bir tema değişikliği
değil; aynı palet üstünde hareketin ve ayrıntının sıkılaşması.

Öncelik CSS: hover, sticky, smooth scroll. Geçiş süresi 150–250ms, `ease-out`.

**Sayfa yüklenirken giriş animasyonu yasağı KALDIRILDI.** Karar sahibi kaldırdı ("her şeyde
animasyon olabilir"). Kalkan şey yasak, **ölçü değil**: yükleme anındaki giriş de 150–250ms zarfında
kalır ve `ease-out` kullanır — bugünkü uygulama 240ms süre, 70ms kademe. "Hareket taşıyıcı değil,
üstüne binen bir katman" ilkesi aynen geçerli: animasyon çalışmadığı her durumda içerik tam görünür
olmak zorunda, ve bu bir kapıyla ölçülüyor (`tests/e2e/hero.spec.ts`).

Yasağın gerekçesi geçersiz olmadı, kapsamı daraldı: Hero açılışta ekranda olduğu için scroll'a bağlı
bir reveal orada ya hiç görünmez ya da sayfayı yanıp sönüyormuş gibi gösterir. Bu yüzden Hero
`view()` değil **zamana bağlı** bir animasyon kullanır; scroll'a bağlı olanlar ekrana sonradan giren
bölümlerde kalır.

**Hareket sistemi saf CSS.** Scroll'a bağlı hareket `animation-timeline: view()` ve `scroll()` ile
yazılır; iki özelliğin de desteklendiği doğrulandı. Kazanç iki katmanlı: sayfaya **0 KiB JS**
eklenmiyor, ve `CLAUDE.md` kural 3 ("scroll listener yazma") değişmeden duruyor çünkü zaman
çizelgesini tarayıcının kendisi yürütüyor.

**Metin girişi `animation-timeline: view()` ile YAZILDI VE BIRAKILDI.** O hareket scroll
**konumuna** bağlı: scroll durunca animasyon da donuyor, hızlı kaydırınca atlıyor. Aralık iki kez
ayarlandı (`entry 45%`, sonra `cover 50%`) ve ölçüm her seferinde "çalışıyor" dedi — ama hareket
"yazı geldi" hissi vermedi ve geri bildirim bunu söyledi.

Referans davranış **zamana** bağlı: öğe görünür olduğu an animasyon başlıyor ve kendi süresinde
bitiyor. Bunu CSS ile yazmanın yolu yok, çünkü "görünür oldu" bir **olaydır**, bir scroll konumu
değil. Tetikleyici bu yüzden `IntersectionObserver` oldu ve `CLAUDE.md` kural 3 genişletildi:
gözlemci artık iki yerde, ikisi de tek dosyada.

**Hero bu mekanizmayı kullanmıyor** ve gerekçesi ölçüldü: gözlemci yolu öğeyi hidrasyona kadar gizli
tutuyor, ve Hero'nun `h1`'i sayfanın **LCP öğesi** — onu JS gelene kadar gizlemek LCP'yi doğrudan
bozardı (§8, ve LCP zaten açık bir issue). Hero'nun girişi saf CSS ve ilk boyamada başlıyor.

**İşaret sırası ters:** gizleyen CSS kuralı yalnızca JS'in koyduğu işaretin altında çalışıyor. JS
gelmezse, `prefers-reduced-motion` açıksa veya gözlemci düşerse işaret hiç konmaz ve bütün metin
görünür kalır. Bir zaman aşımıyla kendini kurtaran kod yok, çünkü gerekmiyor.

**Bir kez oynar.** Gözlemci işaretlediği öğeyi bırakıyor: aşağı inerken metin gelir, yukarı
dönerken zaten oradadır.

Desteklemeyen tarayıcıda öğe **son halinde** durur. Hiçbir içerik, okunabilirlik veya aksiyon
hareket desteğine bağlı olmaz; hareket üstüne binen bir katman, taşıyıcı değil.

`prefers-reduced-motion: reduce` altında: smooth scroll kapanır, tüm geçişler 0ms'e iner,
scroll'a bağlı animasyonlar hiç bağlanmaz, sticky yığın düz listeye döner. Bu kalite tabanının
parçası, sonradan eklenecek bir iş değil.

Motion kütüphanesi V1'de **yok** ve bu Zaffiro'dan sonra da geçerli — pivotun bedeli bir bağımlılık
değil. CSS yetmediği bir yer çıkarsa issue açılır.

### 4.5 Türetilmiş değerler

Palet altı değer veriyor; ara tonlar gerektiğinde **yeni hex uydurulmaz**, mevcut token'ın opaklığı
kullanılır (`color-mix` veya Tailwind `/60` sözdizimi). Tek istisna `Text muted` (`#A9B8B2`), o da
token dosyasında adıyla durur.

### 4.6 İmza öğe — dürüst sayı

**Karar: benimsendi.**

Bu kolektifin ayırt edici tarafı, çalışma disiplininin negatifi olduğu gibi yayınlaması. Sitede buna
karşılık gelen bir öğe olacak: Football bloğunda gerçek ve dürüst bir sayı satırı.

Kullanılabilir gerçek malzeme: 15 günde 215 commit, ~2.600 test, 17 sprint, ve **terfi eden model
sayısı sıfır** — sistem hâlâ deterministik temelle karar veriyor. İlk canlı hafta 56.08 projekte
edildi, 26 gerçekleşti.

**Seçilen sayı `0` — "ML models promoted to production" idi. KARAR SAHİBİ DEĞİŞTİRDİ.** Yerine üç
kısıt geçti: `15 PLAYERS OPTIMISED`, `£100M BUDGET CONSTRAINT`, `1 OPTIMAL SQUAD`.

**Ne kaybedildiği burada yazılı, çünkü kaybedilen bir şey var.** `0`ın seçilme gerekçesi şuydu:
215 commit ve 2.600 test çalışma hacmini gösterir ve **her vitrinde benzeri vardır**; terfi etmemiş
model ise ölçülmüş bir başarısızlık ve bu bölümün tarif ettiği şeyin ta kendisi. Üç yeni sayı o
işlevi görmüyor.

Üç yeni sayı **uydurma değil**, hepsi doğrulanabilir: FPL kadrosu 15 oyuncu, £100m bütçe
uygulamanın kendi ekranında yazılı, "1 optimal squad" CP-SAT'ın döndürdüğü kanıt. Övünme de
değiller — üçü de projenin **kısıtları**, yani "ne kadar iyiyiz" değil "hangi kutuya sığmak
zorundaydı" diyorlar.

Yani kaybedilen şey **doğruluk değil, imza.** Bu bölümün "vitrinde ölçülmüş bir başarısızlık
göstermek nadir ve tamamen size ait" cümlesi hâlâ doğru; sitede artık karşılığı yok. Geri gelmesi
istenirse yapılacak şey dördüncü bir metrik eklemek.

Gerekçe: sticky kart ödünç alınmış ve yaygın bir davranış, imza olamaz. Bir vitrinde ölçülmüş bir
başarısızlık göstermek ise nadir ve tamamen size ait.

---

## 5 · İçerik modeli

**Karar: MDX yok. Tipli TypeScript içerik dosyaları + Zod.**

Gerekçe: V1'de dört bölüm, bir proje, iki kişi var. MDX'in kazandırdığı şey uzun gövde metni içinde
component kullanmak; burada uzun gövde metni yok. Bir derleme bağımlılığı, bir loader
yapılandırması ve bir tip köprüsü ekliyor, karşılığında bugün hiçbir şey vermiyor. Case-study
route'ları geldiğinde MDX o zaman eklenir — o zaman gerçekten gerekecek.

```
content/
  schema.ts        Zod şemaları ve türetilmiş TypeScript tipleri
  projects.ts      proje kayıtları
  team.ts          ekip kayıtları
  site.ts          marka metinleri, nav, SEO varsayılanları
  index.ts         tek loader: şemadan geçirir, tipli veri döner
```

**Şema serttir.** Alan eksik veya yanlışsa `pnpm build` patlar. Alan default'a düşmez, kart
placeholder göstermez, `.optional()` eklenerek hata susturulmaz. Optimizer'ın kuralı birebir
geçerli: _sessizce yanlış olmaktansa reddet._ Makul görünen bir placeholder, build hatasından
kötüdür.

**Component'ler `content/` dosyalarını doğrudan okumaz**, yalnızca `content/index.ts` üzerinden
erişir. `lint-imports`'un bu projedeki tek karşılığı bu sınır.

Proje kaydının zorunlu alanları: `slug`, `name`, `summary`, `tags[]`, `repoUrl`, `screenshot`,
`order`. Opsiyonel: `liveUrl`, `metrics[]` (imza sayısı için).

---

## 6 · Stack

| Karar               | Seçim                                                                        | Gerekçe                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Next.js, App Router                                                          | Tasarım planında seçili; statik export ile host bağımsız                                                                                                                                                                                                                                                                                                                                                                                                            |
| Render              | **`output: 'export'`** — tamamen statik                                      | V1'de sunucu tarafı hiçbir şey yok. Statik kalmak host'u değiştirilebilir tutuyor; bu bir performans değil bağımsızlık kararı                                                                                                                                                                                                                                                                                                                                       |
| Dil                 | TypeScript, `strict: true`                                                   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Paket yöneticisi    | **pnpm**                                                                     | Hızlı, lock dosyası net                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Node                | Kurulu LTS; `.nvmrc` + `package.json > engines` ile **tam sürüm sabitlenir** | İki makinenin (iş/ev) aynı sürümde koşması bu projede özellikle önemli                                                                                                                                                                                                                                                                                                                                                                                              |
| Styling             | **Tailwind v4**                                                              | CSS-first `@theme`, tek-token-dosyası kuralına birebir oturuyor. v3'te token'lar JS config'inde yaşar ve CSS ile arasında köprü gerekir                                                                                                                                                                                                                                                                                                                             |
| Lint                | **ESLint** + `next/core-web-vitals` + **Prettier**                           | Buradaki asıl değer Next'in kendi kuralları (`next/image` kullanımı, hooks, link davranışı). Oxlint hızlı ama bu kapsamı henüz vermiyor; hız bu boyutta kazanç değil                                                                                                                                                                                                                                                                                                |
| İçerik              | TypeScript + Zod                                                             | §5                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Görseller           | Düz **`<img>`** + elle yazılmış `srcset`, elle üretilmiş webp                | `next/image` **kullanılmıyor** ve bu ölçülerek seçildi: statik export + `unoptimized` altında ne optimizasyon ne srcset üretiyor, karşılığında 5.5 KiB client JS ekliyor (132.1 → 137.6 KiB). srcset elle yazılıyor, CLS'i `width`/`height` karşılıyor. Görseller `scripts/optimize-images.mjs` ile iki genişlikte webp'e çevrilip commit'lenir; script **Playwright Chromium** kullanır, `sharp` eklenmez — Chromium zaten devDependency (`design-spec.md` §3.3.1) |
| Statik sunucu (dev) | **`serve`** (devDependency)                                                  | `output: 'export'` ile `next start` çalışmıyor. `pnpm preview` ve Playwright, gerçek `404.html` döndüren bir statik sunucuya ihtiyaç duyuyor                                                                                                                                                                                                                                                                                                                        |
| Test                | Vitest + Playwright                                                          | §8                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Motion kütüphanesi  | yok                                                                          | §4.4                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Analytics           | **yok**                                                                      | Trafik hakkında cevaplamak istediğiniz bir soru henüz yok. Olmayan bir soruya araç kurmak kapsam ihlali. Ayrıca sıfır çerez = sıfır KVKK/GDPR yüzeyi, banner yok. Gerekirse sonra çerezsiz bir çözüm + gizlilik notu                                                                                                                                                                                                                                                |
| Lisans              | Kod MIT; marka ve tasarım varlıkları hariç (`NOTICE`)                        | Kimse wordmark'ı ve logoyu yeniden kullanmasın                                                                                                                                                                                                                                                                                                                                                                                                                      |

**Sürüm sabitleme:** `package.json`'da caret yok. `pnpm add next@latest` sonrası yüklenen tam sürüm
yazılır. Güncelleme bilinçli bir `chore:` PR'ıdır, sessiz bir sürüklenme değil.

### Klasör yapısı

```
app/
  layout.tsx          root layout, font ve metadata
  page.tsx            tek sayfa, bölümleri sırayla dizer
  tokens.css          @theme token'ları (TEK renk kaynağı)
  globals.css         reset ve taban stiller
  not-found.tsx       404
components/
  ui/                 Button, Tag, ExternalIcon, Container ...
  sections/
    hero/  projects/  nav/  team/  about/  footer/
content/              §5
lib/                  yardımcılar
assets/               kaynak görüntüler (screenshots/, people/) — servis EDİLMEZ
public/               logo, favicon, og, üretilmiş proje görselleri
scripts/              optimize-images.mjs
tests/e2e/            Playwright
docs/                 bu belge ve kardeşleri
```

Her bölüm kendi klasöründe kendi stilini taşır. İki kişi aynı dosyada buluşmuyor — bu bir kural
değil, yapının kendisi sağlıyor.

### `app/tokens.css` (başlangıç hali)

```css
@import "tailwindcss";

@theme {
  --color-page: #203033;
  --color-surface: #111b1d;
  --color-surface-2: #2a3a34;
  --color-border: #486354;
  --color-accent: #78df7b;
  --color-text: #f2f5f3;
  --color-text-muted: #a9b8b2;

  --font-sans: var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;

  --radius-card: 14px;
  --radius-sm: 8px;

  --spacing-section: 40px;
  --spacing-section-lg: 64px;
  --container-content: 1600px;
}
```

### `package.json` script'leri

```json
{
  "dev": "next dev",
  "build": "next build",
  "preview": "serve out -l 4173",
  "lint": "eslint .",
  "format": "prettier --check .",
  "format:write": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "e2e": "playwright test",
  "size": "node scripts/check-bundle-size.mjs",
  "gates": "pnpm lint && pnpm format && pnpm typecheck && pnpm test && pnpm build && pnpm size && pnpm e2e"
}
```

---

## 7 · Altyapı ve yayın

### Domain

**Karar: kanonik adres `https://mymandev.com`.**

Tasarım belgesi boyunca "myman.dev" yazıyordu, ama sahip olunan ve çalışan domain `mymandev.com`
(`squadopt.mymandev.com` ayakta). İkisi aynı şey değil ve wordmark, metadata, OG, sitemap hepsi buna
bağlı.

- Site kökte: `mymandev.com`. Projeler subdomain'de: `squadopt.mymandev.com`. Temiz hiyerarşi,
  tek marka, tek DNS paneli.
- `www.mymandev.com` → köke 301.
- `myman.dev` gerçekten kayıtlıysa köke 301 yönlenir; ikinci bir kanonik adres olmaz.
- **Wordmark: `MyManDev`.** Sitede domain gibi görünen bir metin yazmıyoruz; yazarsak tıklandığında
  çalışmak zorunda kalır ve mockup'taki "myman.dev" bunu karşılamıyor.

### Hosting

**Karar: Cloudflare Pages.**

Gerekçe: `squadopt.mymandev.com` zaten Cloudflare'de, yani DNS orada ve ekipte bilgi var. §6'daki
tamamen statik build sayesinde adapter gerekmiyor — `out/` klasörü doğrudan yayınlanıyor. Tek panel,
sıfır DNS işi, PR başına preview var.

Vercel bir alternatifti ve Next.js için sıfır yapılandırmayla çalışıyor; ama ücretsiz planı kişisel
kullanım için ve repo bir organization'da olduğu için sürtünme çıkma ihtimali var. Statik export
sayesinde ileride geçmek isterseniz maliyet neredeyse sıfır.

**Build ayarı:** build komutu `pnpm build`, çıktı dizini `out`, Node sürümü `.nvmrc`'den.

**404 kontrolü:** statik host'ların klasik hatası, bilinmeyen bir yolda 404 yerine uygulama kabuğunu
döndürmek. Optimizer'da bu hata gerçek yayında çıktı. Yayın öncesi gerçek domain üzerinde rastgele
bir yol denenir ve gerçekten 404 döndüğü doğrulanır; lokal `pnpm preview` bu kontrolün yerine
geçmez.

**Preview deployment'lar public.** Saklanacak bir şey yok, paylaşmak kolaylaşıyor.

### CI

GitHub Actions, her PR'da: lint, format, typecheck, test, build, payload ölçümü, Playwright,
Lighthouse raporu. Repo public olduğu için dakikalar ücretsiz, bütçe kısıtı yok.

**İş adları sözleşmedir.** Workflow `.github/workflows/ci.yml`. İş adları tam olarak:

| İş           | İçerik                                     | Zorunlu status check mi? |
| ------------ | ------------------------------------------ | ------------------------ |
| `gates`      | lint, format, typecheck, test, build, size | **evet**                 |
| `e2e`        | Playwright + axe                           | **evet**                 |
| `lighthouse` | Lighthouse raporu                          | hayır (bkz. §8)          |

Branch protection bu iki adı isimle zorunlu kılıyor (`working-agreement.md` §3); ad değişirse koruma
sessizce boşa düşer, çünkü GitHub var olmayan bir check'i beklemez.

---

## 8 · Kalite eşikleri

Eşikler **implementasyondan önce** yazıldı. Sonradan seçilen eşik, eşiğe fit etmektir.

| Nicelik                                         | Eşik     | Kapı mı?            |
| ----------------------------------------------- | -------- | ------------------- |
| axe erişilebilirlik ihlali                      | 0        | **Sert kapı**       |
| Sayfanın toplam JS'i (gzip)                     | < 150 KB | **Sert kapı**       |
| Klavye ile tüm bölüm ve aksiyonlar erişilebilir | evet     | **Sert kapı** (E2E) |
| Görünür focus göstergesi                        | evet     | **Sert kapı** (E2E) |
| `prefers-reduced-motion` desteği                | evet     | **Sert kapı** (E2E) |
| Bilinmeyen yolda gerçek 404                     | evet     | **Sert kapı** (E2E) |
| Lighthouse mobil Performance                    | ≥ 95     | Raporlanır          |
| LCP (mobil, kısıtlı bağlantı)                   | < 2.0 s  | Raporlanır          |
| CLS                                             | < 0.05   | Raporlanır          |

**Payload kapısının koşucusu:** `scripts/check-bundle-size.mjs`, script adı `size`. `build`'den
sonra koşar, çünkü ölçtüğü şey build çıktısıdır. Faz 0'da yazılır.

**Ne ölçülür:** `out/` altındaki **her HTML sayfası için ayrı ayrı**, o sayfanın yüklediği benzersiz
JS dosyalarının gzip'lenmiş toplamı. Sayfaların en büyüğü **153.600 byte'ı (150 KiB)** aşarsa kapı
düşer. Ölçüm yalnızca `out/`'a bakar: her HTML'in `<script src>` ve JS `<link rel="preload">`
referansları toplanır, build manifest'ine bağımlı değildir.

**`nomodule` script'leri toplama sayılmaz.** Modern tarayıcılar onları hiç indirmez; yalnızca
eski tarayıcılar indirir. Ölçümün sorusu "kullanıcı bu sayfayı açtığında ne kadar JS iniyor"
olduğu için bunları saymak ölçümü kendi tanımına aykırı hale getirirdi. Görünmez de olmasınlar
diye raporda ayrı sütunda yazılırlar. Faz 0'da Next.js'in polyfill chunk'ı bu sınıfa giriyor ve
tek başına 38.7 KiB — sayılsaydı boş sayfa eşiği aşardı.

Sayfa başına ölçülür çünkü eşiğin cevapladığı soru _"kullanıcı bu sayfayı açtığında ne kadar JS
iniyor?"_ — `out/` altındaki bütün dosyaların toplamı bu soruyu cevaplamaz ve route sayısıyla
birlikte büyür, yani eşik zamanla anlamını yitirirdi. Paylaşılan chunk'lar onu yükleyen her sayfaya
tam olarak sayılır; kullanıcı da öyle indiriyor.

**Neden ikiye ayrıldı.** Optimizer'da var olmayan bir kapının hiç olmamasından kötü olduğu
ölçülmüştü. axe, payload ve klavye testleri deterministik — kapı olabilirler. Lighthouse skorları
koşucudan koşucuya oynar; kapı yapılırsa flaky olur, insanlar zorla geçer, kapı ölür. Bu yüzden
Lighthouse her PR'da **raporlanır, engellemez.** Bir eşik iki kez üst üste düşerse issue açılır.

**Üç koşunun medyanı, aralığıyla birlikte** (#39). Tek koşu bir olgu değil bir örneklemdi: aynı
sayfa 74, 92 ve 82 verdi. Medyanı tek başına yazmak da yanıltıcı olurdu — okuyan kişi stabil bir 82
ile 18 puan sallanarak gelen bir 82'yi ayırt edemez. Skorlar artifact'in içinde değil iş özetinde.

**Lighthouse'un Accessibility skoru bizim axe kapımızdan düşük çıkabilir ve bu bir çelişki
değil.** İkisi sayfayı farklı anda tarıyor: bizim kapımız `prefers-reduced-motion` altında, yani
sayfa **duragan** haldeyken (`tests/e2e/a11y.spec.ts`); Lighthouse hareket açıkken tarıyor ve bölüm
girişi fade'inin ortasına denk gelebiliyor. O anda üst öğe opaklığı renklere karışıyor ve
`color-contrast` düşüyor — ölçülen örnek: Live Demo butonu, dinlenme halinde **5.51:1**. WCAG
kontrastı duragan durumun özelliğidir, geçici bir animasyon karesinin değil. Yani o satır bir
kusuru değil, **ölçüm anını** gösteriyor.

**Playwright kapsamı:** navigation + anchor scroll + aktif link; Projects bölümü davranışı; mobil
menü; dış linkler (Live Demo ve GitHub gerçekten açılıyor mu); 404; ve desktop + mobil viewport'ta
axe taraması.

**Vitest kapsamı:** içerik şeması doğrulama ve `lib/` yardımcıları. Component render testi V1'de
yok — statik bir vitrinde gerçek davranışı Playwright kapsıyor, render testi bakım maliyeti getirip
karşılığını vermiyor. Bu bilinçli bir daraltma, atlanmış bir iş değil.

**Görsel regresyon snapshot'ı V1'de yok.** Review + preview linki. Gerçek bir regresyon yaşanırsa
o zaman eklenir.

---

## 9 · Karar kaydı

Bir kararı değiştirirsen bu tabloya satır ekle; sessizce değiştirme.

| Konu                       | Karar                                                                                        | Nerede |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| Yığın vs tek proje         | V1'de tek proje bloğu, mimari çok-projeli                                                    | §3     |
| Placeholder proje          | Yayınlanmaz                                                                                  | §3     |
| Font                       | IBM Plex Sans + Mono; **display rolü de mono** (bayt farkı yok)                              | §4.2   |
| Sayfa genişliği            | 1180 → 1320 → **1600px**; 1600'e kadar tamamen akışkan                                       | §4.3   |
| Bölüm dikey boşluğu        | Bölüm başına 40/64; aradaki boşluk toplamı 80/128 — önceden iki katıydı                      | §4.3   |
| İmza öğe                   | Dürüst sayı satırı; sayı `0` — ML models promoted to production                              | §4.6   |
| İçerik formatı             | TS + Zod, MDX yok                                                                            | §5     |
| Render                     | Tamamen statik export                                                                        | §6     |
| Styling                    | Tailwind v4                                                                                  | §6     |
| Lint                       | ESLint + Prettier                                                                            | §6     |
| Analytics                  | Yok                                                                                          | §6     |
| Domain                     | `mymandev.com` kanonik, wordmark `MyManDev`                                                  | §7     |
| Hosting                    | Cloudflare Pages                                                                             | §7     |
| Lighthouse                 | Raporlanır, kapı değil                                                                       | §8     |
| axe taraması               | `prefers-reduced-motion` altında, sayfa duragan halde                                        | §8     |
| Lighthouse ölçümü          | Üç koşunun medyanı, aralığıyla birlikte                                                      | §8     |
| Daktilo efekti             | Kalıcı; `TeamCard` biyografisi harf harf yazılıyor                                           | §6     |
| Bölüm numaraları           | Kaldırıldı; her bölüm kendi başlığını taşır                                                  | §3     |
| Component render testi     | V1'de yok                                                                                    | §8     |
| Payload ölçümü             | Sayfa başına first-load; `nomodule` script'leri hariç                                        | §8     |
| Toolchain sürümleri        | TypeScript 6.0.3, ESLint 9.39.5 — üst sürümler lint zincirini kırıyor                        | §6     |
| İçerik dosyaları V1'de     | Boş dizi; gerçek veri gelene kadar şema gevşetilmez                                          | §5     |
| Bölüm sırası               | 03 Who we are (kolektif) → 04 Team (kişiler); genelden tekile                                | §2     |
| Marka rengi                | Logo `#0D9488`; accent `#14B8A6` — logo rengi kontrast kapısını düşürüyor                    | §4.1   |
| İçerik genişliği           | 1180px → 1320px; 1440'lık ekranda kenarlar 130'ar pikselden 60'a iniyor                      | §4.3   |
| Görsel yüzeyi              | `next/image` değil düz `<img>` + elle `srcset`; ölçülmüş 5.5 KiB                             | §6     |
| Görsel pipeline            | `sharp` yok; `optimize-images.mjs` Playwright Chromium ile kodluyor                          | §6     |
| Etkileşim dili             | Zaffiro referansı benimsendi; renk ve yazı ailesi değişmiyor                                 | §4.4   |
| Hareket sistemi            | Saf CSS `animation-timeline`; 0 KiB JS, motion kütüphanesi yok                               | §4.4   |
| Tip ölçeği                 | Bir basamak büyütüldü; bölüm başlıkları da **Display XL**                                    | §4.2   |
| Navbar zemini              | Ayrı bar rengi yok — blur + tint; desteklenmiyorsa **dolu** zemine düşer                     | §4.1   |
| Hero sağ kolonu            | Wordmark değil **marka amblemi**; zemini ayrılmış PNG, rengi token'dan                       | §4.1   |
| Proje açıklaması           | Şemada **zorunlu** alan; tek satırla proje yayınlanmaz                                       | §5     |
| Logo SVG                   | Vektör kaynağı yok; PNG'den türetildi, sapması ölçülü (0.098px)                              | §6     |
| OG kartı                   | Siteden üretiliyor — renk ve font ikinci kez yazılmıyor                                      | §6     |
| Yayın                      | Pages projesi `mymandev`; `main` → `mymandev.com`, preview `*.pages.dev`                     | §7     |
| `www` yönlendirmesi        | Zone seviyesinde Redirect Rule; Pages `_redirects` hostname'e bakmaz                         | §7     |
| Query korunumu             | Şablon wildcard'ı query'yi taşıyor — `Preserve query string` **kapalı**                      | §7     |
| Prensip otomatik geçişi    | 7s; etkileşimde duraklar, bırakınca sürer — kalıcı durdurma yok                              | §4.4   |
| Prensip geçişi             | **Kelime kelime belirme**, saf CSS; daktilo ve blok girişi bırakıldı                         | §4.4   |
| Hero amblemi rengi         | Logonun turkuazi `#0D9488`; accent degil — §5.1'in tek-yesil okumasi gevsetildi              | §4.1   |
| Yükleme animasyonu         | Yasak **kaldırıldı**; zarf (150–250ms, `ease-out`) korundu                                   | §4.4   |
| Metin girişi               | Bölüm sarmalayıcısı değil **öğe seviyesi**; kademe `view()`'den, elle değil                  | §4.4   |
| Amblem gradyanı            | Conic, açısı **scroll'a bağlı**; sonsuz döngü yok, durakları `color-mix`                     | §4.1   |
| Hero zemini                | Sayfa renginden marka rengine `118deg` tint; glow degil, kapisi var                          | §4.1   |
| Metin girişi tetikleyicisi | `IntersectionObserver` — `view()` scroll konumuna bağlıydı, "geldi" hissi vermedi            | §4.4   |
| Proje sıra numarası        | `01`, `02` geri geldi — #58'i **kısmen** geri alır, bölüm etiketleri gelmedi                 | §3     |
| Yığın yüksekliği           | Viewport yüksekliği **kartın kendisinde**; sarmalayıcı ve margin sticky menzilini kısaltıyor | §3     |
| İmza sayısı                | `0 ML models promoted` **kaldırıldı**; yerine üç kısıt — imza kayboldu                       | §4.6   |
| Hero yüksekliği            | `min-h-dvh`; amblem %18 küçüldü, zemine ince çizgi dokusu                                    | §3     |
| Team yüksekliği            | `lg`de bir ekran; kutu orandan değil **kalan alandan**                                       | §3     |
| Navbar scroll davranışı    | Tepede saydam, 120px'te yerleşiyor; `animation-timeline: scroll()`                           | §4.4   |
| Bölüm sınırı               | `1px` çizgi + Hero'da metinsiz scroll göstergesi (iki tur)                                   | §4.4   |
