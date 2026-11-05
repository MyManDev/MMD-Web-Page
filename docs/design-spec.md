# Tasarım Spesifikasyonu — MyManDev sitesi (V1)

Bu belge, `architecture.md` §4'te **karar verilmiş** token, ölçek ve ölçüleri **nereye
uyguladığımızı** yazar. Kararların kendisi orada; burada tekrar edilmez.

- Renk paleti, tip ölçeği, ölçü tablosu, motion kuralı → [`architecture.md` §4](architecture.md)
- Bölüm sırası ve navigation kararı → [`architecture.md` §2](architecture.md)
- Projects bölümünün tek-proje kararı → [`architecture.md` §3](architecture.md)
- İçerik şeması → [`architecture.md` §5](architecture.md)
- Bölge sahipliği → [`working-agreement.md` §1](working-agreement.md)

**Bu belge metin içermez.** Metinler `content/site.ts`'te yaşar ve şema onları **zorunlu**
tutar; bu belge yalnızca nereye girdiklerini söyler. Güncel sayfa yapısı
`architecture.md` §2'de; MyManDev anlatımı mevcut ekip hikâyesinden kısaltılmıştır.

---

## 1 · Kapsayıcı ve ızgara

Tek `Container` primitive'i bütün bölümlerin genişliğini belirler: `max-width` ve yatay padding
§4.3'ten gelir. Hiçbir bölüm kendi genişliğini tanımlamaz.

| Breakpoint          | Kolon | Izgara                                                |
| ------------------- | ----- | ----------------------------------------------------- |
| `< 640` (mobil)     | 1     | tek kolon, kenar padding 20px                         |
| `640–1023` (tablet) | 2     | eşit iki kolon                                        |
| `≥ 1024` (desktop)  | 12    | 12 kolonluk ızgara, bölümler bunun üstünde konumlanır |

Projects ve Team ızgara boşluğu **32px**, kart iç boşluğu **24px** kalır.
MyManDev ana sayfasında metin ile amblem arasında 48px bulunur.

Bölüm arası dikey boşluk §4.3'teki iki değerden gelir: mobilde küçük olan, `lg` ve üstünde büyük
olan. Ara breakpoint'lerde arada bir değer **uydurulmaz**, `lg`'de sıçrar.

**Tam genişlik istisnası:** yalnızca navbar'ın arka planı ve Projects bloğunun zemini viewport
genişliğindedir; içerikleri yine `Container` içinde durur.

---

## 2 · Component envanteri

Durumlar yalnızca **anlamlı olduğu yerde** listelendi. `focus` her zaman `:focus-visible`
demektir — fare tıklamasında halka çıkmaz, klavyede çıkar.

### 2.1 `components/ui/` — paylaşılan primitive'ler

Onay kuralı: `working-agreement.md` §1.

| Component   | Props                                                                          | Durumlar                                    | Not                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Container` | `as?`, `children`                                                              | —                                           | Genişlik ve yatay padding'in tek kaynağı. `as` ile `section`/`div`/`nav` olabilir.                                                                                                               |
| `Button`    | `variant: 'primary' \| 'ghost'`, `href?`, `external?`, `disabled?`, `children` | default · hover · focus · active · disabled | `href` varsa `<a>`, yoksa `<button>`. `external` ise `target="_blank"` + `rel="noopener noreferrer"` + görünür dış link ikonu — ikon `external`'ın kendisinden gelir, ayrı bir prop'la geçilmez. |
| `Tag`       | `children`                                                                     | —                                           | Statik. Tech tag'leri. Tıklanabilir değil, `<li>` olarak dizilir.                                                                                                                                |

`Button` ölçüsü: yükseklik 44px (mobil dokunma hedefi eşiği), yatay padding 20px,
`radius-sm`. `Tag`: yükseklik 24px, yatay padding 10px, `surface-2` zemin, `radius-sm`.
`NavLink`: yükseklik 44px, yatay padding 16px, `radius-pill` — sayfadaki tek pill yüzeyi.

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
| `Projects`    | Projects   | **A** | `projects: Project[]`           | —                                    |
| `ProjectCard` | Projects   | **A** | `project`, `index`, `total`     | —                                    |
| `MetricRow`   | Projects   | **A** | `metrics: Metric[]`             | —                                    |
| `Team`        | Team       | **B** | `members: TeamMember[]`         | —                                    |
| `TeamCard`    | Team       | **B** | `member`                        | default · hover · focus-within       |
| `Footer`      | Footer     | **B** | `site.footer`                   | —                                    |

`ProjectCard` `index` ve `total` alır çünkü yığın davranışı (§3.3.2) kartın kaçıncı olduğunu bilmek
zorunda. V1'de `total === 1` ve yığın hiç devreye girmez.

Hiçbir bölüm component'i `content/` dosyalarını doğrudan okumaz; veriyi props olarak alır
(`architecture.md` §5).

---

## 3 · Bölüm bölüm layout

### 3.1 Navigation — Bölge B

Sticky, sayfanın en üstünde, `position: sticky; top: 0`. **Scroll listener yok**
(`CLAUDE.md` kural 3).

|           | Mobil               | `≥ lg`                                          |
| --------- | ------------------- | ----------------------------------------------- |
| Yükseklik | 72px                | 88px                                            |
| Sol       | wordmark `MyManDev` | wordmark                                        |
| Orta      | —                   | üç sayfa linki, pill radius                     |
| Sağ       | menü düğmesi        | Contact + GitHub aksiyonları (ikisi de `ghost`) |
| Zemin     | blur + hafif tint   | blur + hafif tint                               |
| Alt kenar | **yok**             | **yok**                                         |

**Sağda iki aksiyon var ve ikisi de `ghost`.** §5.1 Navigation'a tek yeşil odak veriyor ve o aktif
nav linki — aksiyonların hiçbiri accent taşımıyor.

`Contact` bir `mailto` ve `external` **değil**: o bayrak yeni sekme açıp dış link ikonu koyuyor, ama
bir `mailto` yeni sekmede açılacak bir sayfa değil, posta istemcisine devrediyor. İkon orada bilgi
katmaz, **yanlış söyler**.

Etiket kısa (`Contact`), **tam adres footer'da** (§3.6). Ölçü: `lg` eşiği 1024px ve orada kap 960px,
içerik 716px — 244px pay kalıyor, yani iki aksiyon sığıyor. Tam adresi buraya yazmak o payı
tüketirdi.

**Contact bir bölüm değil.** Bir süre öyleydi ve kaldırıldı: tek bir adres için kendi başlığı olan
bir bölüm fazla ağırdı. Ziyaretçinin iletişim aradığı yer nav, adresi okuduğu yer footer.

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

Ölçüldü: bar saydamken bile wordmark **12.49:1**, pasif nav linkleri **6.65:1** — ikisi de AA'nın
üstünde. Aktif (accent) link sayfa renginde **5.51:1** (hesaplandı).

**Okunurluk ölçüldü, göz kararı değil (#106).**

- **Yöntem:** sayfa baştan sona kaydırılıyor; her adımda nav yazısı gizleniyor (`color: transparent`,
  geçişler kapalı) ve her metin satırının arkasındaki **en parlak tek piksel** okunuyor.
- **Ortam:** Chromium (Playwright), DPR 1, hareket açık.
- **Viewport'lar:** 1024×768, 1280×720, 1440×900, 1920×1080.
- **Adım:** 100px; Hero'da (y=300–500) ve sayfanın son 300px'inde 25px.
- **Nokta:** herhangi bir nav yazısının 4.5:1'in altına indiği bir (viewport, scroll) örneği.

| Tint | Accent aktif link | Pasif link | Wordmark ve düğmeler | Eşik altı nokta |
| ---- | ----------------: | ---------: | -------------------: | --------------: |
| %72  |              3.72 |       4.04 |                 5.63 |              29 |
| %85  |              4.49 |       5.11 |                 8.19 |               3 |
| %86  |              4.55 |       5.19 |                 8.44 |               0 |
| %87  |          **4.62** |   **5.28** |             **8.59** |           **0** |

%72'de Hero başlığı ve Team fotoğraflarının açık gökyüzü blur'dan sızıyordu:

- **En kötü accent:** 1920×1080'de y=450, Hero.
- **En kötü pasif link:** 1024×768'de y=2800, Team kartlarının üst kenarı. İki kişilik Team'le kartlar
  ortalanınca soldaki kartın gökyüzü linklerin altına denk geldi.
- **%85:** üç noktada 4.49, üçü de Hero'da accent link.

**%87** o günkü içerikte ölçülen her noktada AA'yı geçiyordu. Düz zeminde bar değişmiyor, yalnızca
açık içeriğin üzerinde koyulaşıyor.

**%87 → %92: SquadOpt'un açık renkli ekran görüntüleri.** Uygulama açık temaya geçti ve kartın yeni
görüntüleri neredeyse beyaz zeminli; aşağıdaki "Sınırı" paragrafının öngördüğü durum buydu. Yeni
içerikte nav'ın karusel görüntüsünün üstünden geçtiği her konum **25px adımla** ve **üç slaytın her
biri için ayrı** ölçüldü (aynı yöntem, dört viewport, 282 nokta):

| Tint | Accent aktif link | Pasif link | Wordmark ve düğmeler | Eşik altı nokta |
| ---- | ----------------: | ---------: | -------------------: | --------------: |
| %87  |              3.97 |       4.48 |                 8.45 |              72 |
| %90  |              4.34 |       4.93 |                 9.40 |              64 |
| %92  |          **4.56** |   **5.24** |             **9.88** |           **0** |
| %94  |              4.77 |       5.57 |                10.49 |               0 |

- **En kötü nokta:** 1920×1080'de aktif "Projects" linki, ilk slaytın üstünde. O genişlikte nav
  linkleri görüntünün tam üstüne düşüyor; %87'de oradaki 81 noktanın 68'i eşiğin altındaydı.
- **Karar sahibinin seçimi %92:** ölçülen değerler içinde sıfır hatalı en düşüğü. Pay ince (accent
  4.56). %94 daha geniş pay veriyordu ama bar neredeyse opak oluyordu.
- **Sayfanın tamamı** da %92'de, yeni içerikle, yukarıdaki yöntemle yeniden tarandı: eşik altı nokta
  yok. En kötü değerler accent 4.56 (aynı nokta), pasif 5.26, wordmark ve düğmeler 9.88.

**Sınırı:** bu, bugünkü içerik için ölçülmüş bir taban; içerikten bağımsız bir garanti değil.
Bembeyaz bir zemin üzerinde %92'de accent ~4.30, pasif link ~5.19 olurdu (hesaplandı).
`tests/e2e/nav.spec.ts` yalnızca opaklığı tutuyor. Nav'ın altından geçecek açık bir görsel ekleyen
her PR bu ölçümü yinelemeli; SquadOpt'unki bir bölümün üst kenarında değil, kartın ortasındaydı.

Eski "en kötü durum 5.49:1" başka bir örneklemeyle ölçülmüştü (%72, zemin örneklemesi). En parlak
piksel yöntemi aynı tint'te 3.72 veriyor.

Zemin rengi token'dan türetiliyor (`color-mix(in srgb, var(--color-page) 92%, transparent)`), sabit
bir `rgba()` yazılmıyor (`CLAUDE.md` kural 1).

**`@supports` kapısı:** `backdrop-filter` desteklenmiyorsa bar **saydam değil dolu zemine** düşer.
Okunurluk bir tercih değil; desteğin yokluğunda gerileme yönü her zaman okunur olan taraf olmalı.

**Yazı ölçüsü token'da.** Nav yazısı 15px (`--text-nav`) ve mono kalıyor: sitenin bütün başlıkları
mono, nav'ı başka bir aileye geçirmek kimliği bölerdi — ihtiyaç olan şey aile değil **ölçü** idi,
yeni font eklenmedi. Daha önce `Nav.tsx` içinde `text-sm tracking-[0.08em]` diye **satır içi**
duruyordu; #46 diğer her şeyi token'a taşırken bu satır atlanmıştı.

**Aktif link tespiti:** URL pathname'i nav kaydının `href` değeriyle eşleşir.
Aktif bağlantı `aria-current="page"` taşır. Bölüm gözlemcisi yoktur.
Wordmark `/` adresine döner; mobil menü sayfa geçişinde kapanır.
`MotionLink` iç gezinmede çıkışı tamamlayıp Next router'a geçer; `PageMotion` yeni
sayfanın girişini taşır. Hızlı seçimlerde son tıklama kazanır, geçmişe ara seçim eklenmez.
Ctrl/Meta tıklaması ve dış bağlantılar tarayıcıya bırakılır; aynı sayfayı seçmek bekleyen
çıkışı iptal eder. Geri/ileri gezinme bekleyen çıkışı temizler. Süreler §6'da.

**Mobil menü** `< lg` (1024px) altında devreye girer: üç sayfa linki + wordmark + GitHub
aksiyonu `md` genişlikte sıkışıyor. Menü düğmesi `aria-expanded` taşır ve `MobileMenu`'yü `aria-controls` ile
işaret eder. Açıkken tam ekran örtü, `surface` zemin, linkler tek kolon. Klavye davranışı §7.4.
Panel header'ın kardeşi olan bir gövde çocuğudur; header'ın `backdrop-filter` etkisinin
içine konmaz. Nav'ın altından ekranın sonuna uzanır; kısa ekranda kendi içinde kayar.
Panel `clip-path` ile açılıp kapanır; linkler sıralı belirir. Kapanan panel hemen `inert`
olur ve işaretçi olaylarını bırakır; CSS çıkışı sürerken sayfa kilidi temizlenir.
Discrete display geçişini desteklemeyen tarayıcıda menü anında kapanabilir.

### 3.2 MyManDev ana sayfası — Bölge A

`/` varsayılan sayfadır. Başlık MyManDev; altında kısa giriş ve ekip hikâyesi bulunur.
İki aksiyon `/projects` ve `/team` sayfalarına gider. Eski Hero kaldırılmıştır.

Mobilde tek kolon ve tam genişlikte aksiyonlar; `md` üstünde metin solda, mevcut marka
amblemi sağdadır. Sayfa yüksekliği nav ve footer arasında kalan alanı doldurur; eski
Hero'nun tam ekran zorunluluğu, tint zemini ve scroll göstergesi yoktur.

Başlık ve giriş ilk boyamada `reveal-on-load` kullanır. Amblemin mevcut SVG maskesi
`text` token rengiyle görünür. `brand-mark-plate` ayrı bir yüzey çizmez; arkasındaki
hafif radyal ışık `mark` token'ından gelir ve açılışta 4 saniyede bir kez yerleşir.
Reduced-motion altında ışık sabittir.

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

**Metrik satırı iki kısıt ve bir kanıt şartı taşır:** `15 PLAYERS OPTIMISED`,
`£100M BUDGET CONSTRAINT`, `1 OPTIMAL SQUAD` (ayrımı `architecture.md` §4.6'da). Önceki tek sayı (`0`, "ML models promoted to production")
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
cümlesi — bir çengel, tek satır; açıklama projenin ne yaptığını anlatan gövde. İkisi aynı ölçüde
basıldığında yan yana iki paragraf gibi okunuyordu, o yüzden özet Display M'e çıktı ve
`text-muted` oldu. Özet eskiden uygulamanın başlığındaydı; başlık değişince kaynağı
`content/projects.ts`'te yeniden yazıldı.

Proje adı da Display M'den **Display L**'e çıktı: özetle aynı ölçüdeyken hangisinin ad olduğu
okunmuyordu. Bölüm içi ölçü sırası artık 80 → 56 → 28 → 18.

**Açıklama metni doğrulanabilir olgulara dayanır, uydurulmaz** (`CLAUDE.md` kural 5). Football
Squad Optimizer'ınki için dayanaklar `content/projects.ts`'te tek tek yazılı; her biri SquadOpt
deposundaki kaynağına işaret ediyor (arayüz metinleri, çözücü ayarı, plan pencereleri).

`MetricRow` — imza öğesi (`architecture.md` §4.6). Sayı Display M, etiketi mono ve `text-muted`.
İfade seçildi ve `architecture.md` §4.6'da kayıtlı. `metrics` boşsa satır **render edilmez**;
boş çerçeve veya "—" gösterilmez.

Ekran görüntüsü: gerçek uygulamadan. Yoksa blok yayınlanmaz — placeholder görsel konmaz
(`CLAUDE.md` kural 6). Düz `<img>`, elle üretilmiş webp, `width`/`height` verilir ki CLS
oluşmasın.

**Birden fazla ekran görüntüsü, kendiliğinden geçen bir karuselde gösterilir.** Şemada `screenshots` en az
bir öğeli bir dizi ve her öğe kendi `alt` metnini taşır: görüntüler birbirinin yerine geçtiği için
ortak bir "X screenshot" metni hangisinin ekranda olduğunu söylemezdi. Tek görüntüde aynı
figür ve büyütme bağlantısı basılır; otomatik geçiş, sayaç ve gezinme tuşu yoktur.

Görüntü bağlantısı tam ekran yerel `dialog` açar. Escape ve kapatma tuşu odağı açan
bağlantıya döndürür; arka sayfanın kaydırması ve etkileşimi kilitlenir. Sığdırılmış
görünümde sağ/sol tuşları, önceki/sonraki düğmeleri ve yatay dokunma görüntüyü değiştirir.
Yakınlaştırma görüntüyü en az 1200px açar ve odağı resim alanına getirir; odak bu alandayken
dört yön tuşu 48px adımla aynı resmi kaydırır. Yerel tarayıcı kaydırmasının hızlı eksen
değişiminde hareket kaçırmaması için tuş adımları doğrudan uygulanır; dokunma yerel kaydırmadır.
Açan bağlantı, tarayıcı tıklamayla kendiliğinden
odak vermese de açıkça odaklanır; Escape bu bağlantıya döner.
Kaynak seçimi büyütme genişliğine göre yapılır. Görüntüleyici açıkken karusel durur.
JavaScript yoksa bağlantı doğrudan resim dosyasını açar.

- **Başlık.** Her görüntünün altında kendi kısa başlığı var (`caption`, şemada zorunlu):
  `<figure>` + `<figcaption>`, Body S, `text-muted`; dar ekranda iki satıra kırılabilir. Başlık
  slaytın parçası, yani görüntüyle birlikte değişir ve JS yokken de ilk başlık görünür. Geçişte
  giden başlık beklemeden söner: zemini olmadığı için altta kalsaydı yeni başlıkla üst üste
  okunurdu. Figür adını başlıktan alır; `alt` başlığı **tekrarlamaz**, başlığın söylemediğini
  taşır, çünkü ekran okuyucu ikisini art arda okur. Proje metni; uydurulmaz, kaynağı
  `content/projects.ts`'te. Karar sahibinin isteği: "ekrana çıkan resme göre metni de
  değiştirebiliriz".
- **Yerleşim.** Slaytlar aynı ızgara hücresinde üst üste durur, yalnızca etkin olanı görünür
  (`visibility`). Kap bir slayt boyunda kalır (görüntü ve en uzun başlık); gezinirken ne kap ne
  tuşlar oynar. Çerçeve (border, köşe) yalnızca görüntünün etrafında.
  Görüntünün altında destenin (§3.4) sayacı (`01 / 03`) ve `deck-button` tuşları var. Yeşil yok:
  bölümün tek yeşili Live Demo (§5.1).
- **Kendiliğinden geçiş, destenin kuralları ve kodu (§3.4, `lib/deck.ts`).** Aralık, duraklama,
  reduced-motion ve canlı bölge davranışı destedekiyle aynı; ayrıntısı ve bilinen sınırları §3.4'te,
  reduced-motion davranışı §6.1'de.
  Karusel önce elle geçişliydi ve gerekçe "ekran görüntüsü incelenir, bakılırken değişmemeli" idi.
  **Karar sahibi görüntülerin kendiliğinden değişmesini istedi**; o gerekçeyi fare karuselin
  üzerindeyken (görüntü ve tuş satırı) veya odak içerideyken duraklama karşılıyor. Bir tuşa
  basılınca süre baştan sayılır.
- **Geçiş.** 900ms çapraz sönümleme, yalnızca `motion-safe` altında: gelen slayt üstte belirir,
  giden aynı süre altta kalıp tek adımda kaybolur. Önce 200ms'ydi ve görüntü bir anda değişiyor
  gibi okunuyordu; **karar sahibi 900ms'yi seçti** (§6'daki zarfın dışında). Reduced-motion altında
  geçiş hiç yok, değişim anında (§6.1).
- **Hayalet arka plan.** Kartın arkasında, o an etkin olan ekran görüntüsünün soluk ve bulanık bir
  kopyası; görüntü değişince o da aynı sürede değişir. Karar sahibinin isteği: "her proje için resim
  koyacağız, o resimler hayalet ekran olsun arkaya, resim geçtiğinde hayalet arka plan da
  değişsin". Beş varyant denendi, karar sahibi "Orta"yı seçti: %12 opaklık, 6px bulanıklık, %60
  doygunluk, kenarlara doğru sönen radyal maske, kartın 48px dışına taşar (dikeyde `lg` altında
  40px: orada başlıkla kart arası ve bölümün alt boşluğu 40px). Karuselle aynı `srcset` ve `sizes`'ı
  kullanır: tarayıcı aynı dosyayı seçer, hayalet ek indirme getirmez. Tek görüntülü kartta da
  durur. Süsleme, bilgi değil: `aria-hidden`, `alt=""`. Kartın doğrudan çocuğudur, karuselin
  değil: karusel giriş animasyonunda `translate` taşıyor ve öyle bir öğe mutlak konumlu
  torunlarının referansı olur. Bölüm yatay taşmayı kırpar (`overflow-x: clip`), yoksa dar ekranda
  sayfa 28px yana kayıyordu. Kartın yazılarının kontrastı hayaletin üstünde ölçüldü: en kötüsü
  1440px, 390px ve Pixel 7'de 5.92; hayaletsiz 8.50 (AA 4.5).
- **Daktilo.** Görüntü değişince altındaki yazı harf harf gelir (harf başına 25ms,
  `TypedCaption.tsx`); karar sahibinin isteği: "resmin altındaki yazı resim değişince daktilo
  olarak değişsin". Takım kartının biyografisiyle aynı ilke: gizleme CSS'te ve yalnızca
  `[data-typing]` altında, metin DOM'da her zaman tam. Sayfa açılınca ilk yazı zaten tam durur;
  JS yoksa ve reduced-motion'da daktilo hiç çalışmaz. Yazı bitmeden görüntü yeniden değişirse
  giden yazının kalanı gizli kalır ve başlıkla birlikte söner; yazarken reduced-motion açılırsa
  yazı hemen tamamlanır.
- **Erişilebilirlik.** APG karusel deseninin rolleri ve etiketleri: kap `role="group"` ve
  `aria-roledescription="carousel"`, her slayt `"slide"` ve `"2 of 3"` etiketi. APG'nin
  kendiliğinden dönen karusel için istediği görünür durdur/başlat tuşu **yok** (§3.4). Görüntü alanının
  canlı bölgesi destedeki gibi: otomatik geçişte `off`, etkileşimde `polite` (tuşa basıldığında
  odak çoğu tarayıcıda tuşta kalıyor ve değişen slaytı, yani görüntüyü ve başlığını canlı bölge
  duyuruyor). Ok tuşu yok, destede de yok;
  APG karusel deseni onları istemiyor.
- **JS gelmezse.** Sunucu ilk görüntüyü gösterir ve tuş satırını yer tutan ama görünmeyen hâlde
  basar. Ziyaretçi çalışmayan bir tuşla karşılaşmaz; JS gelince tuşlar sayfayı kaydırmadan görünür
  olur. Deste sunucuda düz liste basıyor, burada aynısı yapılmadı: görüntüler alt alta basılıp
  hidrasyonda teke inse bölüm kısalır ve sayfa kayardı.
- **İndirme.** Gizli slaytların kutusu durduğu için `loading="lazy"` onları da bölüm yaklaşırken
  indirir; ileri tuşu boş bir kareye açılmaz. Bedeli, ilk görüntüden sonraki her görüntü için bir
  varyant daha.

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

| Soru                     | Cevap                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobilde davranış         | Yığın **yok**. `< lg` altında kartlar düz liste; viewport yüksekliği yığını taşımıyor ve sticky kart mobilde ekranın çoğunu yiyor.                                                                                                                                                                                                                                               |
| `prefers-reduced-motion` | Yığın düz listeye döner: sticky yok, kart `position: relative` (hayalet arka plan kartın kutusuna göre konumlanıyor), kartlar arasında mobildeki 64px boşluk (§4.4).                                                                                                                                                                                                             |
| Alttaki kartın focus'u   | Kart içeriği `inert` **değildir**; sticky yalnızca konumu değiştirir, kartlar DOM'da normal sırada ve klavyeyle erişilebilir. Üste binen kart alttakinin focus'unu görsel olarak kapatırsa, focus'lanan kart `z-index` sırasını geçici olarak kazanır (`:focus-within`). Henüz uygulanmadı; `z-index` satır içi style'da (`ProjectCard.tsx`), bu yüzden tek bir sınıf onu ezmez. |
| Yığın yüksekliği         | Kap yüksekliği = kart sayısı × viewport yüksekliği. Tek kartta kap normal akışa döner ve sticky hiç uygulanmaz.                                                                                                                                                                                                                                                                  |

### 3.4 Karusel davranışı ve kaldırılan Who We Are

Who We Are ve prensip destesi 2026-11-05 sayfa ayrımında kaldırıldı. Kısa ekip hikâyesi
`/` sayfasındadır. Proje karuselinin kullandığı `lib/deck.ts` korunur:

- Otomatik ilerleme 7 saniyede bir; son slayttan sonra ilkine döner.
- Fare içerideyken veya klavye odağı karuseldeyken duraklar; iki koşul ayrı izlenir.
- Elle adım sonrası süre baştan başlar. Reduced-motion altında otomatik ilerleme yoktur.
- JS yokken ilk proje görüntüsü ve başlığı görünür; gezinme tuşları gizlidir.
- Otomatik adımda canlı bölge `off`, kullanıcı etkileşiminde `polite` olur.
- Görünür durdur/başlat tuşu yoktur; önceki tasarımın kabul edilen erişilebilirlik sınırı
  devam eder. Dokunmatik cihazda kalıcı durdurma garanti edilmez; hover/focus kalıcı
  durdurma düğmesinin eşdeğeri değildir.

### 3.5 Team — Bölge B

İki kişiyi tek tek tanıtan kartlar. Fotoğraf odağı `center 65%`, sabit karartma %10 ve
alt geçiş alanı 32px'tir. Biyografinin %92 opak okunurluk perdesi korunur.

|                | Mobil | `sm`                | `≥ lg`                                  |
| -------------- | ----- | ------------------- | --------------------------------------- |
| Kolon          | 1     | 2                   | tek satır, ortada                       |
| Kart genişliği | tam   | `(liste − gap) / 2` | üç kolonluk iz: `(liste − 2 × gap) / 3` |

`lg`'de kart genişliği **üç kolonluk izden** gelir ve satır ortalanır. Üç kişiyle satır tam dolar;
daha az kişiyle kartlar ne büyür ne küçülür, aynı genişlikte ortada durur. `sm`'de iki kolon kişi
sayısı tekse bir hücreyi boş bırakır; alternatifi mobilden `lg`'ye kadar tek kolon tutmaktı ve o da
tablette bir sütunluk uzun bir şerit üretirdi.

Genişlik **içerikten değil breakpoint'ten** gelir; dizinin uzunluğundan hesaplanmaz. `sizes` ve
görsel genişlikleri (`lib/images.ts`) bu sayıya bağlı, yani kart genişliği kişi sayısıyla
değişseydi görseller yanlış boyutta kalırdı. Kişi sayısı üçü geçerse bu tablo yeniden düşünülür.

**`lg`'de liste flex, grid değil.** Izgarada boş kalan bir kolon satırı sola yaslar ve bir kişi
eksikmiş gibi okunur; `repeat(auto-fit, …)` ise kolon sayısını tam yuvarlama sınırında hesaplar ve
üçüncü kart alt satıra düşebilir. Flex'te varsayılan `nowrap` ve `flex-shrink` 1/64px'lik yuvarlama
farkını yutar. Genişlik `calc`'i `gap-8` ile aynı `--spacing`'i okur. Ölçüldü: üç kişiyle kart
kutuları eski ızgarayla 1024, 1280, 1440, 1600 ve 1920'de en fazla 0.016px ayrışıyor.

**Etiket yok.** "04 TEAM" ile "Team" aynı kelimeyi iki kez söylüyordu;
numara tek başına kaldığında da bir şey anlatmıyordu. Projects'te etiket duruyor, çünkü orada
başlık proje adı ve "02 PROJECTS" bilgi katıyor. Etiket, tekrar ettiği yerde değil **bilgi kattığı
yerde** durur.

**Team `lg`de navbar sonrası kalan ekrana sığar:** `100dvh - var(--nav-height)`.
Container, iç sarmalayıcı ve liste `flex-1` / `min-h-0` zincirini korur. Mobilde doğal
akış devam eder. Kartlar mevcut üç kolonluk iz genişliğiyle ortada kalır.

Oran token'ı (`--aspect-portrait`, 5/9) **mobilde** geçerli kalır; `tests/portrait-aspect.test.ts`
anlamını korur çünkü görsel hattı ile token hâlâ aynı sayıyı söylüyor. Görseller yeniden üretilmedi.

**Kart fotoğrafın kendisidir.** Kutu **5/9** oranında (token: `--aspect-portrait`) ve görüntü onu
tamamen kaplar; ad, rol ve linkler görüntünün alt kenarında, üzerinde durur. Hover'da görüntü
hayaletleşir ve biyografi üstünde belirir.

Oran **5/8 idi, kartlar büyüsün diye 5/9 oldu.** Kart zaten kapsayıcının tam genişliğini
kaplıyor — üç kolonluk iz, `lg`'de 1440px'te 437px — yani büyüme ancak **yükseklikten** gelebilirdi.
Ölçüldü: 708px → **787px**. Kolon boşluğuna dokunulmadı; 32px'ten 24px'e indirmek kart genişliğine
yalnızca 6px katıyordu, yani gürültü.

**Neden 9/16 değil:** hat yarım piksel üretmemek için genişliğin orana tam bölünmesini şart koşuyor
(`scripts/optimize-images.mjs`). 9/16, mevcut genişliklerle (500, 1000) bu kapıyı geçemiyor; 5/9
geçiyor (900 ve 1800) ve 0.5556 ile 0.5625 arasındaki fark gözle ayırt edilmiyor.

Kutu kaynaktan **dar** olduğu için kırpma yatayda oluyor, dikeyde değil — yüzler kırpılmıyor.
Görseller yeni oranda yeniden üretildi; `lib/image-widths.json` ile token **aynı sayıyı** söylemek
zorunda, yoksa `cover` sessizce kırpar ve `width`/`height` nitelikleri kutuyu yanlış tarif eder.

Başlıktan karta mesafe **24/32** (önce 40/56). Bölümün dış ritmi (`py-section`) değişmedi — o
paylaşılan bir ölçü ve tek bir bölüm için oynatılmaz (`architecture.md` §4.3).

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

- Rol ve biyografi: `content/team.ts`'te (#16).
- Fotoğraflar: gerçek fotoğraflar. Avatar placeholder konmaz (`CLAUDE.md` kural 6); şemada `photo`
  alanı **zorunlu**, yani fotoğrafsız bir kişi build'i düşürür. Görseller
  `scripts/optimize-images.mjs` hattından geçer (`architecture.md` §6).

### 3.6 Footer — Bölge B

Navbar'ın aynası: `surface` zemin, üstte 1px `border`.

|             | Mobil                               | `≥ md`                            |
| ----------- | ----------------------------------- | --------------------------------- |
| Üst sıra    | tagline, telif ve GitHub dikey      | tagline/telif solda, GitHub sağda |
| Alt sıra    | iletişim, ardından sağa hizalı imza | iletişim solda, imza sağ altta    |
| İmza yazısı | 34px / 17px                         | 44px / 21px                       |

İletişim satırı `CONTACT team@mymandev.com`; etiket ve adres aynı satırda, gerektiğinde
sarılır. GitHub düz mono dış bağlantıdır ve 12px `ExternalIcon` taşır. Sosyal ikon duvarı yok.

İmza **MyManDev**, alt satırda **Still Building**. Metin `content/site.ts` içindeki `wordmark`
ve `footer.closing` alanlarından gelir; `footer.tagline` hâlâ **Built by friends.** İmza dışında
footer mono rolünü korur. Yeni açıklama eklenmez.

İmza self-host Allura 400 kullanır, 6 derece sola eğilir. Mavi-mor gradyanın üç rengi
`app/tokens.css` içindeki `--signature-*` tokenlarından gelir. Font lisansı `public/fonts/` ve
`NOTICE` içinde kayıtlıdır.

Mevcut `RevealOnView` işaretiyle bir kez yazılır: üst satır 1.7s, alt satır 0.6s gecikmeyle 1.2s.
Bu, imza için seçilen özel süredir; genel hareket zarfını değiştirmez. Yeni JS veya gözlemci yok.
`prefers-reduced-motion` altında hareketsiz ve görünürdür; JS yokken içerik görünür kalır.
`forced-colors` altında gradyan ve gölge yerine sistemin yazı rengi kullanılır.

---

## 4 · Tipografi uygulaması

Rollerin boyut ve satır yüksekliği değerleri `architecture.md` §4.2'de. Buradaki iş, hangi
elemanın hangi rolü aldığı.

| Rol        | Nerede                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| Display XL | MyManDev, Projects ve Team sayfa başlıkları.                               |
| Display L  | Proje adı.                                                                 |
| Display M  | MyManDev giriş cümlesi, proje özeti, `TeamCard` adı ve `MetricRow` sayısı. |
| Body       | MyManDev ekip anlatımı ve proje açıklaması.                                |
| Body S     | `TeamCard` biyografisi, resim altı yazısı.                                 |
| Mono label | `Tag`, `MetricRow` etiketi, footer linkleri, footer telif.                 |
| Nav        | Nav yazısı, wordmark dahil (`--text-nav`).                                 |

**Ölçek bir basamak büyüdü** (istek: "yazılar çok küçük", "bu sayfa çok küçük"). Önceki değerler
sırasıyla 40/64 · 28/40 · 20/24 · 15/16 · 14 · 12; bugün 48/80 · 32/56 · 22/28 · 16/18 · 15 · 13.
Component'lerin hiçbirine dokunulmadı — hepsi zaten bu token'ları okuyor, yani büyüme tek yerden
geldi.

**Sayfa başlıkları Display XL kullanır.** Her sayfada tek `h1`; kart başlıkları
bir alt seviyede `h2` olarak yer alır (§7.1).

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

Ölçeğin dışındaki tek rol nav yazısı (wordmark dahil): `--text-nav`, 15px mono, token'da (§3.1).

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
| MyManDev   | `primary` CTA zemini            | başlık, alt cümle, `ghost` CTA — amblem ayrı, aşağıdaki nota bakın |
| Projects   | Live Demo `primary` zemini      | başlık, proje adı, `Tag`'ler, `MetricRow` sayısı, GitHub aksiyonu  |
| Team       | yok — bölümde yeşil kullanılmaz | fotoğraf, ad, rol, biyografi, linkler                              |
| Footer     | yok                             | wordmark, linkler, telif                                           |

**MyManDev amblemi `text` rengindedir.** Arkasındaki hafif ışık `mark` token'ını %24
opaklıkla kullanır. Amblem tıklanmaz ve `aria-hidden` dekorasyondur; sayfanın etkileşimli
yeşil odağı CTA olarak kalır.

Team ve Footer'da bilinçli olarak yeşil yok: yeşil bir aksiyon rengi ve bu iki bölümde
birincil aksiyon yok. Her bölüme bir yeşil serpmek §4.1'in tarif ettiği hatanın kendisi.

**Tek istisna — focus halkası** (§7.2). Halka accent renklidir ve bölüm kotasına sayılmaz; bir
anda yalnızca tek eleman focus'lu olur ve bu durum kalıcı değil geçicidir.

### 5.2 Türetilmiş değerler

§4.5: ara ton gerektiğinde yeni hex **uydurulmaz**, mevcut token'ın opaklığı kullanılır
(`color-mix` veya Tailwind `/60`). Bu belgede opaklık gereken tek yer `primary` Button hover'ı
(`accent/90`) ve `Tag` zemini (`surface-2`).

---

## 6 · Etkileşim ve motion

§4.4 sınırları: CSS öncelikli, motion kütüphanesi yok. 150–250ms varsayılan zarfın dışında,
kullanıcının akıcı PC/mobil etkileşim talebiyle sayfa çıkışı 120ms, girişi 300ms;
mobil panel 260ms ve aktif menü çizgisi 280ms kullanır. Çıkışın gezinme/unmount ile
eşgüdümü tarayıcının Web Animations API'siyle yapılır; reduced-motion altında atlanır.
Sayfa başlığı ilk boyamada 240ms giriş kullanır. Metin girişi 520ms,
ekran görüntüsü ve hayalet arka plan geçişi 900ms olarak korunur. Eski prensip animasyonları
ve scroll göstergesi kaldırılmıştır.

Aşağıdaki tablo **bugün uygulanmış** geçişleri sayar. Scroll'a bağlı hareketler
`animation-timeline: scroll()` ile yazılır ve sıfır JS'e mal olur (§4.4); bugün navbar
zemininde kullanılır. Metin girişi zamana bağlı ve `IntersectionObserver` ile
tetikleniyor (aşağıda). Hangi öğenin
nasıl hareket ettiği, o bölümün PR'ında **bu tabloya satır olarak** eklenir. Önceden bir satır
uydurulmaz — yazılmamış bir hareketi belgede tarif etmek, `content/` altına placeholder koymakla
aynı sınıf hatadır.

| Etkileşim                        | Süre                 | Özellik                                                       |
| -------------------------------- | -------------------- | ------------------------------------------------------------- |
| Button hover                     | 150ms                | `background-color`, `border-color`                            |
| Menu düğmesi hover               | 150ms                | `background-color`                                            |
| NavLink hover / focus            | 150ms                | `translate` — etiket rulosu (`roll`); hover'da `color`        |
| NavLink aktif geçişi             | 150ms / 280ms        | `color`; kalıcı menüde kayan alt çizgi `transform`            |
| Sayfa çıkışı / girişi            | 120ms / 300ms        | `opacity`; çıkış `translateY(-8px)`, giriş `translateY(14px)` |
| Mobil panel açılışı / kapanışı   | 260ms / 200ms        | `clip-path`; `display` için discrete transition               |
| Mobil menü öğeleri               | 280ms + 25ms         | `opacity` + `translate: 0 -8px`                               |
| Tıklanabilir aksiyonlar          | 180ms / 90ms         | hover `scale: 1.025`, basılı `0.97`; opacity 160ms / 90ms     |
| Görüntüleyici açılışı / kapanışı | 220ms / 160ms        | `opacity`; kapanış bitince dialog kaldırılır ve odak döner    |
| Büyük resim değişimi / zoom      | 220ms                | `opacity` + `transform`; `scale: 0.985` başlangıcı            |
| Metin linki hover / focus        | 150ms                | `scale` — alt çizgi soldan açılır (`rule`)                    |
| Düz link hover                   | 150ms                | `color` — footer ve `TeamCard` linkleri                       |
| Deste tuşu hover / focus         | 150ms                | `color`, `border-color` (`deck-button`)                       |
| `TeamCard` hover / focus         | 200ms                | `translate: 0 -10px`                                          |
| `TeamCard` perdesi               | 200ms                | `opacity` — `surface/92` perde, hover / focus-within          |
| `TeamCard` biyografi alanı       | 200ms, 100ms gecikme | `grid-template-rows: 0fr → 1fr`                               |
| `TeamCard` biyografisi           | ~12ms/harf           | daktilo — aşağıdaki nota bakın                                |
| Anchor scroll                    | —                    | `scroll-behavior: smooth` (CSS)                               |
| Sayfa başlığı girişi             | 240ms + 70ms         | `opacity` + `translate: 0 10px`, öğe öğe                      |
| Metin girişi (`reveal-on-enter`) | 520ms + 90ms         | `opacity` + `translate: 0 14px`, ekrana girince bir kez       |
| Navbar zemini                    | scroll'a bağlı       | `background-color` + `backdrop-filter`, ilk 120px             |
| Amblem ışığı                     | 4s, bir kez          | `opacity` + `transform`; reduced-motion altında sabit         |
| Ekran görüntüsü karuseli         | 7s aralık            | `lib/deck.ts`; hover/focus sırasında duraklar                 |
| Ekran görüntüsü geçişi           | 900ms                | çapraz sönümleme: `opacity`, `visibility`; başlık hemen söner |
| Giden resim altı yazısı          | 200ms                | `opacity`, beklemeden söner (`Screenshot.tsx`)                |
| Resim altı yazısı                | 25ms/harf            | daktilo, görüntü değişince (`TypedCaption`)                   |
| Hayalet arka plan                | 900ms                | `opacity`, görüntüyle birlikte (`ScreenshotGhost`)            |

Süre sütununda "X + Y", Y'nin öğeler arası kademe olduğunu söyler; gecikme ayrıca yazılır.
Görüntüyü açan büyük yüzeyde ölçek daha hafiftir: hover `1.005`, basılı `0.992`.
Hover ölçeği yalnız `(hover: hover)` altında çalışır. Yavaş veya kesilen iç gezinmede
700ms sonra çıkış kaldırılır; eski sayfa soluk kalmaz. Yeni sayfa geldiğinde ve
geri/ileri gezinmede bekleyen animasyon temizlenir.

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

**Metin girişi zamana bağlı.** Tetikleyici `IntersectionObserver` (`components/ui/RevealOnView.tsx`, sayfa kabuğuyla birlikte kurulur;
eşik `0.12`, `rootMargin: 0px`): öğe görünür olunca `data-reveal-shown` alır ve `reveal-in` 520ms'de
`cubic-bezier(0.22, 0.61, 0.36, 1)` ile oynar. Aynı karede açılan öğeler 90ms kademeyle gelir;
kademe beşte sabitlenir. Bir kez oynar, yukarı dönerken metin zaten oradadır. `@supports` yok: JS
gelmezse ya da reduced-motion açıksa işaret konmaz ve öğe son hâlinde durur. Gerekçe
`architecture.md` §4.4.

Hareket **bölümün zeminine değil içeriğine** uygulanır. Zemin viewport genişliğinde (§1) ve onu
soldurmak bölümün kendisini yanıp sönüyormuş gibi gösterir.

Metin girişi, sayfa başlığı, `roll` ve `TeamCard` hareketi `translate`; `rule` `scale`
kullanır. Footer imzasının eğimi kendi CSS modülündedir.

**Kalkma kuralı bölüm bazına ayrıldı.** `ProjectCard`'da hover'da büyüme/kalkma **yok** — sticky
yığınla birlikte katman sırasını okunmaz hale getiriyor (§3.3.2). `TeamCard` yığında değil, yani o
gerekçe orada geçerli değil: kart hover ve focus'ta **10px kalkıyor**. Kalkma layout'a dokunmuyor,
komşu kartlar kaymıyor.

> Tailwind v4 `translate-y-*` için `transform` değil **`translate`** özelliğini üretir. Geçiş
> listesi ve testi de onu okur; `transform` bu kartta `none` kalır.

**Daktilo efekti kalıcı** (#57). Gerçek portrelerle bakıldı ve benimsendi; deneme dönemi kapandı.
Tek dosyada duruyor (`components/sections/team/BioTypewriter.tsx`). Prensip destesi bir süre aynı
kuralı kullandı; kelime kelime belirmeye geçince bıraktı. Kuralın bugünkü ikinci kullanıcısı
karuselin resim altı yazısı (`TypedCaption.tsx`, §3.3.1). Efekt şu
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
- `pressable` ölçeği kaldırılır; sayfa ve görüntüleyici çıkışları beklemeden tamamlanır.
- Tüm `transition-duration` ve `animation-duration` `0.01ms`'e iner. (`0ms` yerine `0.01ms`,
  çünkü bazı tarayıcılar `transitionend` beklerken 0'da olayı hiç üretmiyor.)
- `transition-delay` `0`'a iner. Önce yalnızca süre kısalıyordu ve gecikme kalıyordu: `TeamCard`'ın
  açıklaması 100ms geç açılıyordu. `tests/e2e/a11y.spec.ts` sayfanın tamamında hiçbir öğede gecikme
  kalmadığını ölçüyor.
- Projects yığını düz liste: sticky yok, kart `position: relative`, kartlar arasında 64px.
- Prensip destesi ve ekran görüntüsü karuseli kendiliğinden **ilerlemez** (`lib/deck.ts`).
- Ekran görüntüsü karuselinde geçiş **hiç uygulanmaz**, slayt anında değişir (§3.3.1); resim altı
  yazısı daktilosuz, tam gelir; hayalet arka plan da anında değişir.
- Bütün animasyonlar **tamamen kaldırılır**: `animation-name: none`. Bu, scroll'a bağlı olanları
  (`nav-settle`, `mark-sweep`) da zamana bağlı olanları (`reveal-in`, `reveal-on-load`,
  `principle-word-in`, `scroll-hint-travel`) da kapsar. Keyframe uygulanmaz, öğe kendi taban
  stiliyle, yani hareketin bittiği hâlde çizilir. Scroll'a bağlı olanlarda süreyi kısaltmak yetmezdi,
  çünkü zaman çizelgesi süreye değil scroll konumuna bağlı — öğe yine scroll'la birlikte hareket
  ederdi.

  **`animation-timeline: none` değil**, ve bu ölçüldü: zaman çizelgesi olmayan bir animasyonun
  geçerli zamanı çözümlenemiyor ve `fill-mode: both` o durumda `from` karesini uyguluyor. Öğe
  `opacity: 0`'da donar — yani reduced-motion açık bir kullanıcı bölümü hiç görmez. Sessizce.
  E2E bu hatayı bir kez yakaladı ve o yüzden duruyor.

Evrensel kural global bir `@media` bloğunda **bir kez** yazılır (`app/globals.css`). Ayrı yazılan
üç yer var: metin girişinin gizleme kuralı `no-preference` sorgusunda, Projects yığını
`motion-reduce:` ile (`ProjectCard.tsx`, `Projects.tsx`), ekran görüntüsü karuselinin ve
hayaletinin geçişi `motion-safe:` ile — sonuncusu global blok gecikmeyi sıfırlamadan önce
gerekliydi, çünkü giden slayt gecikme süresince görünür kalırdı; bugün ikinci kat.

---

## 7 · Erişilebilirlik

`architecture.md` §8: axe ihlali 0, klavye erişimi, görünür focus ve `prefers-reduced-motion`
**sert kapı**.

### 7.1 Landmark'lar ve belge yapısı

| Landmark      | Eleman                           |
| ------------- | -------------------------------- |
| `banner`      | `<header>` — navbar              |
| `main`        | `<main>` — açık sayfanın içeriği |
| `contentinfo` | `<footer>`                       |

Her bölüm `<section>` ve `aria-labelledby` ile kendi başlığına bağlanır. Başlık hiyerarşisi:
her sayfada tek `h1`; proje ve ekip kartı başlıkları `h2`. Seviye atlanmaz.

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

1. **Skip link** — ilk odaklanabilir öğe; `#main`'e atlar.
2. Wordmark → MyManDev / Projects / Team → Contact / GitHub.
3. Açık sayfanın aksiyonları ve kart bağlantıları.
4. Footer bağlantıları.

İç sayfa linkleri URL değiştirir; bölüm kaydırmaz. Skip link ve doğrudan bölüm hash'i
kullanıldığında `scroll-margin-top` sticky navbar için boşluk bırakır.

### 7.4 Mobil menü klavye davranışı

- Menü düğmesi `aria-expanded` ve `aria-controls` taşır.
- Açılınca focus menünün ilk linkine geçer.
- Menü açıkken focus menü içinde döner (focus trap); arkadaki sayfa `inert`.
- `Escape` menüyü kapatır ve focus'u **menü düğmesine geri verir**.
- Kapanınca veya sayfa değişince `inert` ve scroll kilidi kalkar.
- `lg` genişliğine çıkınca da menü kapanır, kilit kalkar ve odak masaüstü aktif linkine geçer.
- Menü açıkken sayfa scroll'u kilitlenir; kilit `overflow: hidden` ile, scroll pozisyonu
  korunarak.

### 7.5 Diğer

- Dış linkler (`Live Demo`, `GitHub`): `rel="noopener noreferrer"`, görünür ikon, ve yalnızca
  ikonla anlaşılmasın diye erişilebilir ad metinde geçer.
- Görsellerde gerçek `alt`; dekoratif olanlarda `alt=""`.
- `Tag` listesi `<ul>`/`<li>`; ekran okuyucu öğe sayısını duyurur.
- Renk tek başına bilgi taşımaz: aktif nav linki yalnızca yeşil değil, aynı zamanda
  `aria-current="page"`.

---

## 8 · Katman sırası

| Katman | `z-index` | Kim                                         |
| ------ | --------- | ------------------------------------------- |
| 0      | `auto`    | normal içerik                               |
| −10    | `-10`     | kartın hayalet arka planı (kartın içinde)   |
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
