# Çalışma Anlaşması — MyManDev sitesi

Bu belge **nasıl çalıştığımızı** yazar. Ne inşa ettiğimiz [`architecture.md`](architecture.md)'de.

Düzen, *Nasıl Çalıştık — Football Squad Optimizer* belgesinden süzülerek taşındı, kopyalanarak
değil. O belgenin kendi uyarısı geçerli: *"Küçük işlerde fazla ağırdır."* Burada ön-kayıt
dokümanları, parmak izi dondurma ve ölçüm artifact indeksi yok — bu projede ölçülecek bir tahmin
iddiası yok. Kalanların hepsi bedava taşındı.

---

## 1 · Bölgeler

Sahiplik = **inceleme yetkisi**, dışlayıcı erişim değil. Herkes her şeyi okur ve her şeye değişiklik
önerebilir; sahip, o bölgenin tutarlı kalmasından sorumlu kişidir.

| | Bölge A — Vitrin ve içerik | Bölge B — Kabuk ve teslim |
|---|---|---|
| **Sahip** | İbrahim | Tunay |
| **Sahip olduğu soru** | Ürünlerimiz sitede doğru ve etkileyici görünüyor mu? | Site kendini doğru sunuyor, kendini doğru taşıyor mu? |
| **Kapsam** | Hero, Projects bölümü, proje kartı ve etkileşimi, `content/` ve Zod şeması, proje görselleri | Navigation (sticky navbar, anchor scroll, aktif link, mobil menü), Team, About, Footer, 404, SEO/metadata/OG/sitemap/robots, CI ve deployment bakımı |
| **Kendi testleri** | Şema testleri, Projects E2E | Navigation E2E, a11y taraması, 404 E2E |

Ayrım katmana göre değil, **sayfanın hangi işini yaptığına** göre. İkisi de React yazıyor, ikisi de
içerik ve test yazıyor: A tarafında Zod şeması var, B tarafında Team layout'u var. Kimse "sadece
görünüm" veya "sadece altyapı" değil.

**Ertuğrul** bu projede bölge sahibi değil; optimizer'a odaklı devam ediyor, review'a çağrılabilir.
Faz 0 (§6) onun tarafından tek seferlik kuruluyor; sonrasında bölgeler yukarıdaki gibi işler.

**Rollerin adı değil mekanizması kalıcı.** V1 sonunda taraflardan biri bölgesinin daraldığını
düşünürse bölgeler takas edilir.

### Paylaşılan yüzeyler

Değişiklik **her iki bölge sahibinin** onayını ister. `CODEOWNERS` bunu mekanik hale getirir.

- `app/tokens.css` ve `app/globals.css`
- `app/layout.tsx`, `app/page.tsx`
- `components/ui/`
- `content/schema.ts` (şemanın şekli; içeriğin kendisi Bölge A)
- Marka metinleri, logo/sembol kullanımı, proje açıklamaları, imza sayısının metni
- `docs/`, `CLAUDE.md`, `.github/`

Next.js'te iki kişi de `components/` ve token dosyasına dokunur; çakışma riski optimizer'a göre
**arttı**, azalmadı. §2'nin son maddesi bu yüzden var.

---

## 2 · Habersiz ilerlemeyiz

1. **Gözlem issue olur.** "Şu bozuk" değil: neyin, nerede, hangi kanıtla bozuk olduğu. UI
   issue'sunda kanıt = ekran görüntüsü + viewport + tarayıcı.
2. **Sahiplik açıkça belirlenir.** Issue bir bölgeye düşmüyorsa veya atanan kişi ile dosyanın sahibi
   farklıysa, kod yazılmadan önce konuşulur.
3. **Dal açılır, tek konu.** Başkasının bölgesi gerekiyorsa bu bir konuşmadır, daha büyük bir PR değil.
4. **PR açılır ve ne değiştirmediğini söyler.**
5. **Kapılar geçer, review alınır, merge edilir, dal silinmez.**

**Devralınan planın öncülleri kontrol edilir.** Bir issue size iş devrediyorsa gövdesindeki iddialar
koda karşı doğrulanır, inanılmaz. Bir öncülü doğrulamak on dakika; yanlış öncül üzerine kurulmuş bir
günü geri almak bir gün.

**Bu kural Claude Code için de geçerli, hatta özellikle.** Ajanın çıkardığı plan da devralınan bir
plandır: "bu component zaten var", "bu token tanımlı", "bu test bunu kapsıyor" türü iddialar repoya
karşı kontrol edilir.

**Aynı dosyada iki kişi:** işlevle değil dosyayla bölün, ve başlamadan önce söyleyin.

---

## 3 · Dal, commit, PR

### Dallar

Gövde **`main`**. `develop` yok: iki kişi, sürekli deploy, release yok — fazladan bir katman olurdu.

`main`'e doğrudan push kapalı. İş `feature/*` dallarında, her PR bir preview üretir, merge sonrası
otomatik production.

Önekler: `feature/`, `fix/`, `design/`, `content/`, `docs/`, `chore/`, `test/`, `wip/` (§7).
Önek, PR açılmadan önce "bu ne tür bir değişiklik?" sorusunu cevaplamaya zorlar.

Küçük ve sık dallar; bir dal bir incelenebilir parça. Üst üste yığılmış PR'lar CI almaz.
`delete_branch_on_merge` **kapalı** — squash merge sonrası dallar korunur. Force-push ve dal silme
koruma ile engelli.

### Branch protection (uygulanacak ayarlar)

`main` üzerinde:

- [x] Require a pull request before merging
- [x] Require status checks to pass — `gates` ve `e2e` işleri zorunlu
- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings ← **üçünüz de yönetici olduğunuz için kritik**
- [ ] Allow force pushes — kapalı
- [ ] Allow deletions — kapalı
- Required approving reviews: **§3.1**

**Zorunlu status check'ler Faz 0 merge edildikten sonra açılır, önce değil.** `gates` ve `e2e`
işleri `.github/workflows/ci.yml` ile birlikte Faz 0'da doğuyor; var olmayan bir check'i zorunlu
kılmak Faz 0 PR'ının kendisini merge edilemez hale getirir. Adlar `architecture.md` §7'de sabit.

Optimizer'da iki dal, deponun politikası tersine olmasına rağmen `--delete-branch` ile merge
edilmişti ve bu kayda geçmişti. Kuralı hatırlamaktan çok uygulatmak ucuz.

Ayarları kim uyguladıysa bu listeyi işaretleyip commit'ler. Yazılı olmayan bir koruma, kontrol
edilebilir değildir.

### 3.1 Zorunlu review — iki fazlı

**Faz 0 ve tek kişinin aktif olduğu dönem:** required approving reviews = **0**. PR şartı ve kapılar
yine geçerli; `main`'e doğrudan push yine kapalı. Tek kişi kendi PR'ını merge edebilir, ama PR
gövdesi disiplini (§3.3) aynen uygulanır.

**İki kişi aktif olduğu andan itibaren:** required approving reviews = **1**, istisnasız.

Gerekçe: optimizer'da zorunlu review sıfırdı çünkü *"kapı, kapılardır"* — davranışın test
edilebilir olduğu bir sistemde doğru. Burada **kapılar görsel regresyonu göremez.** `next build`
geçer, Hero mobilde kırılmıştır. Ayrıca metin, isim ve marka kararları paylaşılan yüzey; onları tek
kişi merge etmez.

Bedeli küçük tutmanın yolu PR'ları küçük tutmak. `chore/` ve `docs/` PR'larında review gerektiğinde
atlanır; **kaynağa veya içeriğe dokunan hiçbir PR'da atlanmaz.**

### 3.2 Commit mesajları

Conventional Commits, İngilizce, emir kipinde başlık:
`feat:`, `fix:`, `style:`, `docs:`, `chore:`, `test:`, `content:`, `design:`

Gövde üç şey söyler: ne değişti, nasıl kontrol edildi, **ve kasıtlı olarak ne değişmedi.**

Son madde bu ekibin eklediği kısım ve bir UI projesinde optimizer'dakinden daha değerli. CSS'te bir
yeri düzeltip üç yeri bozmanın tek panzehiri, "bu PR Hero ve Team layout'una dokunmadı" cümlesini
yazmak zorunda olmaktır.

### 3.3 PR gövdesi

Aynı üçü + **preview linki** + görsel değişiklik varsa önce/sonra görüntüsü (mobil dahil).
Şablon `.github/PULL_REQUEST_TEMPLATE.md`'de hazır durur; alanlar boş bırakılmaz.

### 3.4 Tek konu kuralı

- Bir refactor görsel çıktı değiştirmez. Ekran görüntüsü değiştiyse o PR refactor değildi.
- Bir içerik PR'ı component değiştirmez.
- Bir doküman PR'ı kaynağa dokunmaz.

Hedef ~300 satır incelenebilir değişiklik. Lock dosyaları ve üretilen görseller bu sayıya dahil değil.

### 3.5 Sembolü taşımak

Bir component ev değiştirdiğinde: yeni yer tanım olur, eski yer yeniden dışa aktarır (taşıyan PR'da
hiçbir import kırılmaz), ve **ayrı bir sonraki PR** yeniden dışa aktarımı kaldırır. Re-export tam
bir sürüm yaşar; daha uzun yaşarsa kalıcılaşır ve eski sınır hiç ölmez.

---

## 4 · Kapılar

Her PR'da, istisnasız. Yerelde tek komut: `pnpm gates`.

| Kapı | Komut | Neyi tutar |
|---|---|---|
| lint | `pnpm lint` | stil, Next kuralları, hooks, `next/image` |
| format | `pnpm format` | biçim |
| tipler | `pnpm typecheck` | strict tip kontrolü |
| test | `pnpm test` | şema + `lib/` |
| build | `pnpm build` | derleme; içerik şeması burada da patlar |
| payload | `pnpm size` | en ağır sayfanın JS'i gzip < 150 KiB (`architecture.md` §8) |
| E2E + a11y | `pnpm e2e` | davranış, erişilebilirlik, 404 |
| review | — | görsel regresyon, metin ve isim kararları (§3.1) |

**`lint-imports`'un tek karşılığı:** component'ler `content/` dosyalarını doğrudan okumaz, yalnızca
`content/index.ts` üzerinden erişir. V1'de yazılı kural + review; ihlal tekrarlarsa mekanik hale
getirilir.

**Dürüst açık:** optimizer'da `scripts/` klasörü kapıların dışındaydı ve bu yazılı bir açıktı.
Buradaki karşılığı **içerik metinleri**. Zod şeması alanların var olduğunu tutar, metnin doğru
olduğunu tutmaz. Bu yüzden içerik değişiklikleri review'da **okunur**, göz gezdirilmez.

---

## 5 · Kod ve doküman ilkeleri

**Sessizce yanlış olmaktansa reddet.** Şema tutmuyorsa build patlar; alan default'a düşmez. Görsel
eksikse kart placeholder göstermez. Uydurulmuş bir metin hatadan kötüdür, çünkü ürettiği sonuç
makul görünür.

**İddia etme, ölç.** "Hızlı hissettiriyor" bir ölçüm değil. Eşik CI'da kontrol edilmiyorsa, yazılı
da olsa kapı değildir (bkz. `architecture.md` §8).

**Tek kayıt kuralı.** Bir olgu tek yerde yaşar. Başka bir belgede çözülmüş bir mesele için ikinci
kayıt yazılmaz, link verilir. `CLAUDE.md` bu yüzden kural kopyalamaz, bu iki belgeye işaret eder.

**Dokümanı da ölç.** Bir belge dosya, fonksiyon, token veya komut adı veriyorsa, o hâlâ var mı?
Bir madde gerçek işe dönüştüğünde listeden silinir ve issue'ya taşınır.

---

## 6 · Teslim sırası

| Aşama | İçerik | Kim |
|---|---|---|
| **1. Design lock** | Draw.io: design system, component envanteri, Home desktop/mobil, Projects (tek proje + gelecekteki çok proje), Team, About, responsive/navigation. Logo SVG. | ortak |
| **2. Faz 0** | Repo iskeleti, sürüm sabitleme, `tokens.css`, layout, UI primitive'leri, kapılar, Actions, Cloudflare Pages, domain. Boş sayfa canlıda. | tek PR, Ertuğrul |
| **3. Bölge işi** | A: Hero + Projects + içerik. B: Navigation + Team + About + Footer + SEO. Paralel, çakışmasız. | İbrahim / Tunay |
| **4. Production** | Gerçek görseller, metinler, testler, eşik ölçümü, yayın. | ortak |

Claude Code 2. aşamada devreye girer. 1. aşamada işi yok.

---

## 7 · İki hesap arasında devir protokolü

Proje iki ayrı Claude hesabıyla yürüyor (iş ve ev). **İki hesap arasında paylaşılan tek bellek bu
repodur.** Sohbet geçmişi, oturum bağlamı ve hafıza taşınmaz. Bu yüzden devir bir alışkanlık değil,
zorunlu bir adım.

### Kurallar

1. **Gün sonunda hiçbir iş commit'lenmemiş halde bırakılmaz.** PR'a hazır değilse
   `wip/<yer>-<YYYY-MM-DD>` dalına push edilir (`wip/ev-2026-08-27`). `wip/` dalları kapılardan muaf
   ve asla `main`'e merge edilmez; ertesi gün düzgün bir `feature/` dalına toplanır.
2. **`HANDOFF.md` repo kökünde ve tek durum kaydıdır.** Geçmiş git log'unda yaşar; bu dosya
   *şu anki durumu* tutar ve her devirde üzerine yazılır. İkinci bir kopya, tarih klasörü veya
   günlük dosyası tutulmaz.
3. **Gün sonu:** `/handoff` → dosya güncellenir, commit'lenir, push edilir.
4. **Gün başı:** `git pull` → `/pickup` → ajan `HANDOFF.md` + git durumunu okur, planı söyler,
   **onay almadan dosya değiştirmez.**
5. **Sohbete özet yapıştırmak ikincildir.** Faydalı, ama asıl kayıt repoda. Yapıştırılan özet ile
   `HANDOFF.md` çelişirse **repo doğrudur**; sohbet bayattır.
6. **Bir hesapta alınan karar `HANDOFF.md`'ye yazılmakla kalmaz.** Kalıcı bir karar ise
   `architecture.md` §9'daki karar kaydına satır olarak eklenir. `HANDOFF.md` geçici durum tutar,
   kalıcı karar tutmaz.

### `HANDOFF.md` bölümleri

Şablon repoda hazır. Alanlar: tarih ve yer · dal ve çalışma ağacı durumu · açık PR'lar ·
**sıradaki tek iş** · bitmemiş iş ve nerede kaldığı · alınan kararlar · tuzaklar ve notlar.

"Sıradaki tek iş" alanı tek maddedir. Beş maddelik bir liste devir değil, dağılmış bir gündür.

---

## 8 · Kontrol listeleri

### Bir işe başlamadan
- [ ] `git pull` yapıldı, `HANDOFF.md` okundu.
- [ ] Bu bir issue mı? Gözlem, kanıt ve önerilen şekil yazılı mı?
- [ ] Hangi bölgeye düşüyor?
- [ ] Paylaşılan yüzeye dokunuyor mu? Öyleyse diğer taraf haberdar mı?
- [ ] Devralınan bir plan varsa (insan veya ajan): öncülleri repoya karşı doğrulandı mı?
- [ ] Aynı dosyada başkası çalışıyor mu? Öyleyse önce söylendi mi?

### PR açmadan önce
- [ ] `pnpm gates` yerelde geçiyor.
- [ ] Tek konu. Refactor'da görsel değişiklik yok; içerik PR'ında component yok; doküman PR'ında kaynak yok.
- [ ] `app/tokens.css` dışında renk yok.
- [ ] Taşınan component'ler eski yerinden yeniden dışa aktarılıyor.
- [ ] Conventional Commits başlığı, İngilizce.
- [ ] Gövde: ne değişti, kasıtlı olarak ne değişmedi, nasıl kontrol edildi, preview linki.
- [ ] Görsel değişiklik varsa önce/sonra görüntüsü, mobil dahil.

### Yayına almadan önce
- [ ] Sert kapılar geçiyor; raporlanan Lighthouse sayılarına bakıldı.
- [ ] Klavye ile tüm sayfa gezilebiliyor, focus görünür.
- [ ] `prefers-reduced-motion` açıkken sayfa kullanılabilir.
- [ ] Gerçek domain üzerinde rastgele bir yol gerçekten 404 dönüyor.
- [ ] Yayınlanan her proje ve kişi gerçek; placeholder kalmadı.
- [ ] Live Demo ve GitHub linkleri açılıyor.
- [ ] OG görseli ve metadata gerçek URL'de doğru görünüyor.

### Gün sonunda
- [ ] Her şey commit'li veya `wip/` dalında push'lu.
- [ ] `/handoff` koşturuldu, `HANDOFF.md` push edildi.
- [ ] Kalıcı bir karar alındıysa `architecture.md` §9'a satır eklendi.

### Bir kayıt yazarken
- [ ] Bu olgu başka yerde yazılı mı? Öyleyse link ver, ikinci kayıt yazma.
- [ ] Belge bir dosya, fonksiyon, token veya komut adı veriyorsa, o hâlâ var mı?
- [ ] Kapsam daraltıldıysa neyin dışarıda bırakıldığı yazılı mı?
