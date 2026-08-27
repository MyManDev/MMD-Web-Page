# Mimari — MyManDev sitesi (V1)

Bu belge **ne inşa ettiğimizi** ve hangi kararla inşa ettiğimizi yazar. Nasıl çalıştığımız
[`working-agreement.md`](working-agreement.md)'de.

Kaynak: *MyMan.dev Final Tasarım ve Teknik Plan V1* (görsel yön ve kapsam) ve
*Nasıl Çalıştık — Football Squad Optimizer* (mühendislik ilkeleri).

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

| # | Bölüm | İş |
|---|---|---|
| 01 | Hero | Kim olduğumuzu tek cümlede anlat. Projects CTA + About CTA. |
| 02 | Projects | Sitenin ana vitrini. |
| 03 | Team | Ekip, farklı yetkinlikler, ortak üretim. |
| 04 | About | Kısa manifesto, çalışma prensipleri, footer. |

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
ve asıl ders üç hata değil şuydu — *geliştiricinin baktığı yüzey kurgu gösteriyordu, o yüzden üçü de
incelemeden sağ kaldı.* "Sonra doldururuz" aynı tuzağın adı.

**Yığın devreye girdiğinde çözülmüş olması gerekenler** (Draw.io'da planlanır): mobilde davranış
(viewport yüksekliği kartı taşıyor mu, yoksa mobilde düz liste mi); `prefers-reduced-motion` açıkken
davranış; sticky katman altında kalan kartın klavye ile focus alabilmesi; yığın yüksekliğinin kart
sayısıyla büyümesi.

---

## 4 · Tasarım sistemi

### 4.1 Renk

`app/tokens.css` tek kaynaktır. Component'lerde literal renk yok.

| Rol | Hex | Kullanım |
|---|---|---|
| Page | `#203033` | sayfa zemini |
| Surface | `#111B1D` | navbar, kartlar (zeminden koyu) |
| Surface 2 | `#2A3A34` | ikincil yüzey, hover zemini |
| Border | `#486354` | ince ayrım çizgileri |
| Accent | `#78DF7B` | CTA, aktif nav, ikon, mikro highlight |
| Text | `#F2F5F3` | birincil metin |
| Text muted | `#A9B8B2` | ikincil metin (türetilmiş, §4.5) |

**Yüzey mantığı:** sayfa zemini kartlardan daha açık. Katmanlar koyulaşarak öne gelir.

**Yeşil disiplini:** ekran başına **tek** yeşil odak. Referans mockup'ta yeşil aynı anda eyebrow'da,
CTA'da, ikonlarda ve hover'da vardı; dördü birden olunca hiçbiri vurgu olmuyor. Bir bölümde CTA
yeşilse eyebrow beyaz kalır.

### 4.2 Tipografi

**Karar: IBM Plex Sans + IBM Plex Mono**, `next/font` ile self-host (Google Fonts kaynağından,
build sırasında gömülür; runtime'da dış istek yok).

| Rol | Yüz | Kullanım |
|---|---|---|
| Display | IBM Plex Sans 600/700, `letter-spacing: -0.02em` | Hero, bölüm başlıkları |
| Body | IBM Plex Sans 400/500 | paragraf, kart açıklamaları |
| Utility | IBM Plex Mono 500, `uppercase`, `letter-spacing: 0.08em` | bölüm etiketleri, tech tag'leri, proje numaraları, footer |

Gerekçe: tek süper-aile olduğu için uyumsuzluk riski yok; mühendislik geçmişi olan bir yüz;
`Inter + Space Grotesk` kadar her yerde görülmüyor. Asıl kazanç mono katmanı — referans mockup'taki
jenerik geometric sans, "şablon" hissinin renkten çok daha büyük kaynağıydı. Yeşil uppercase sans
etiketler yerine mono etiketler tek başına en büyük farkı yaratıyor.

Draw.io aşamasında display için alternatif denenebilir (ör. Bricolage Grotesque). Denenmezse veya
karar verilmezse **commit'li seçim Plex'tir**; belirsizlik kalmaz.

**Tip ölçeği** (mobil / desktop):

| Rol | Boyut | Satır yüksekliği |
|---|---|---|
| Display XL (hero) | 40px / 64px | 1.05 |
| Display L (bölüm başlığı) | 28px / 40px | 1.15 |
| Display M (kart başlığı) | 20px / 24px | 1.25 |
| Body | 15px / 16px | 1.6 |
| Body S | 14px | 1.55 |
| Mono label | 12px | 1.4 |

### 4.3 Ölçü ve biçim

| Token | Değer |
|---|---|
| İçerik genişliği | `max-width: 1180px`, yatay padding 20px / 32px |
| Bölüm arası dikey boşluk | 80px / 128px |
| Kart radius | 14px |
| Küçük radius (tag, buton) | 8px |
| Pill radius (nav) | 999px |
| Border kalınlığı | 1px |

### 4.4 Motion

Öncelik CSS: hover, sticky, smooth scroll. Geçiş süresi 150–250ms, `ease-out`. Motion yalnızca
seçili mikro geçişlerde; sayfa yüklenirken giriş animasyonu yok.

`prefers-reduced-motion: reduce` altında: smooth scroll kapanır, tüm geçişler 0ms'e iner, sticky
yığın düz listeye döner. Bu kalite tabanının parçası, sonradan eklenecek bir iş değil.

Motion kütüphanesi V1'de **yok**. CSS yetmediği bir yer çıkarsa issue açılır.

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

Metnin son hali paylaşılan karar alanıdır (ikisinin onayı). Ama yer tasarımda ayrılır ve
placeholder ile doldurulmaz: metin hazır olana kadar bölüm yayınlanmaz.

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
geçerli: *sessizce yanlış olmaktansa reddet.* Makul görünen bir placeholder, build hatasından
kötüdür.

**Component'ler `content/` dosyalarını doğrudan okumaz**, yalnızca `content/index.ts` üzerinden
erişir. `lint-imports`'un bu projedeki tek karşılığı bu sınır.

Proje kaydının zorunlu alanları: `slug`, `name`, `summary`, `tags[]`, `repoUrl`, `screenshot`,
`order`. Opsiyonel: `liveUrl`, `metrics[]` (imza sayısı için).

---

## 6 · Stack

| Karar | Seçim | Gerekçe |
|---|---|---|
| Framework | Next.js, App Router | Tasarım planında seçili; statik export ile host bağımsız |
| Render | **`output: 'export'`** — tamamen statik | V1'de sunucu tarafı hiçbir şey yok. Statik kalmak host'u değiştirilebilir tutuyor; bu bir performans değil bağımsızlık kararı |
| Dil | TypeScript, `strict: true` | — |
| Paket yöneticisi | **pnpm** | Hızlı, lock dosyası net |
| Node | Kurulu LTS; `.nvmrc` + `package.json > engines` ile **tam sürüm sabitlenir** | İki makinenin (iş/ev) aynı sürümde koşması bu projede özellikle önemli |
| Styling | **Tailwind v4** | CSS-first `@theme`, tek-token-dosyası kuralına birebir oturuyor. v3'te token'lar JS config'inde yaşar ve CSS ile arasında köprü gerekir |
| Lint | **ESLint** + `next/core-web-vitals` + **Prettier** | Buradaki asıl değer Next'in kendi kuralları (`next/image` kullanımı, hooks, link davranışı). Oxlint hızlı ama bu kapsamı henüz vermiyor; hız bu boyutta kazanç değil |
| İçerik | TypeScript + Zod | §5 |
| Görseller | `next/image` **`unoptimized`** + elle üretilmiş webp | Statik export runtime optimizasyonu desteklemiyor. Görseller `scripts/optimize-images.mjs` (sharp) ile iki genişlikte webp'e çevrilip commit'lenir. Az görsel var, bedeli düşük, karşılığı tam portabilite |
| Statik sunucu (dev) | **`serve`** (devDependency) | `output: 'export'` ile `next start` çalışmıyor. `pnpm preview` ve Playwright, gerçek `404.html` döndüren bir statik sunucuya ihtiyaç duyuyor |
| Test | Vitest + Playwright | §8 |
| Motion kütüphanesi | yok | §4.4 |
| Analytics | **yok** | Trafik hakkında cevaplamak istediğiniz bir soru henüz yok. Olmayan bir soruya araç kurmak kapsam ihlali. Ayrıca sıfır çerez = sıfır KVKK/GDPR yüzeyi, banner yok. Gerekirse sonra çerezsiz bir çözüm + gizlilik notu |
| Lisans | Kod MIT; marka ve tasarım varlıkları hariç (`NOTICE`) | Kimse wordmark'ı ve logoyu yeniden kullanmasın |

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
  ui/                 Button, Tag, SectionLabel, Container ...
  sections/
    hero/  projects/  nav/  team/  about/  footer/
content/              §5
lib/                  yardımcılar
public/               logo, favicon, og, proje görselleri
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

  --spacing-section: 80px;
  --spacing-section-lg: 128px;
  --container-content: 1180px;
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

| İş | İçerik | Zorunlu status check mi? |
|---|---|---|
| `gates` | lint, format, typecheck, test, build, size | **evet** |
| `e2e` | Playwright + axe | **evet** |
| `lighthouse` | Lighthouse raporu | hayır (bkz. §8) |

Branch protection bu iki adı isimle zorunlu kılıyor (`working-agreement.md` §3); ad değişirse koruma
sessizce boşa düşer, çünkü GitHub var olmayan bir check'i beklemez.

---

## 8 · Kalite eşikleri

Eşikler **implementasyondan önce** yazıldı. Sonradan seçilen eşik, eşiğe fit etmektir.

| Nicelik | Eşik | Kapı mı? |
|---|---|---|
| axe erişilebilirlik ihlali | 0 | **Sert kapı** |
| Sayfanın toplam JS'i (gzip) | < 150 KB | **Sert kapı** |
| Klavye ile tüm bölüm ve aksiyonlar erişilebilir | evet | **Sert kapı** (E2E) |
| Görünür focus göstergesi | evet | **Sert kapı** (E2E) |
| `prefers-reduced-motion` desteği | evet | **Sert kapı** (E2E) |
| Bilinmeyen yolda gerçek 404 | evet | **Sert kapı** (E2E) |
| Lighthouse mobil Performance | ≥ 95 | Raporlanır |
| LCP (mobil, kısıtlı bağlantı) | < 2.0 s | Raporlanır |
| CLS | < 0.05 | Raporlanır |

**Payload kapısının koşucusu:** `scripts/check-bundle-size.mjs`, script adı `size`. `build`'den
sonra koşar, çünkü ölçtüğü şey build çıktısıdır. Faz 0'da yazılır.

**Ne ölçülür:** `out/` altındaki **her HTML sayfası için ayrı ayrı**, o sayfanın yüklediği benzersiz
JS dosyalarının gzip'lenmiş toplamı. Sayfaların en büyüğü **153.600 byte'ı (150 KiB)** aşarsa kapı
düşer. Ölçüm yalnızca `out/`'a bakar: her HTML'in `<script src>` ve JS `<link rel="preload">`
referansları toplanır, build manifest'ine bağımlı değildir.

Sayfa başına ölçülür çünkü eşiğin cevapladığı soru *"kullanıcı bu sayfayı açtığında ne kadar JS
iniyor?"* — `out/` altındaki bütün dosyaların toplamı bu soruyu cevaplamaz ve route sayısıyla
birlikte büyür, yani eşik zamanla anlamını yitirirdi. Paylaşılan chunk'lar onu yükleyen her sayfaya
tam olarak sayılır; kullanıcı da öyle indiriyor.

**Neden ikiye ayrıldı.** Optimizer'da var olmayan bir kapının hiç olmamasından kötü olduğu
ölçülmüştü. axe, payload ve klavye testleri deterministik — kapı olabilirler. Lighthouse skorları
koşucudan koşucuya oynar; kapı yapılırsa flaky olur, insanlar zorla geçer, kapı ölür. Bu yüzden
Lighthouse her PR'da **raporlanır, engellemez.** Bir eşik iki kez üst üste düşerse issue açılır.

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

| Konu | Karar | Nerede |
|---|---|---|
| Yığın vs tek proje | V1'de tek proje bloğu, mimari çok-projeli | §3 |
| Placeholder proje | Yayınlanmaz | §3 |
| Font | IBM Plex Sans + Mono | §4.2 |
| İmza öğe | Dürüst sayı satırı, benimsendi | §4.6 |
| İçerik formatı | TS + Zod, MDX yok | §5 |
| Render | Tamamen statik export | §6 |
| Styling | Tailwind v4 | §6 |
| Lint | ESLint + Prettier | §6 |
| Analytics | Yok | §6 |
| Domain | `mymandev.com` kanonik, wordmark `MyManDev` | §7 |
| Hosting | Cloudflare Pages | §7 |
| Lighthouse | Raporlanır, kapı değil | §8 |
| Component render testi | V1'de yok | §8 |
