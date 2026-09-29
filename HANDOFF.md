# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-09-29
**Yer:** iş
**Aşama:** Faz 4, site yayında. **Ekipten bir kişi ayrıldı**; site ve depo iki kişilik ekibe göre
güncellendi (#103, #104, #105, #107, #108). Cloudflare tarafındaki temizlik 2026-09-29'da bitti.
Açık issue: #106.

## Dal ve çalışma ağacı

- Dal: `main` (`f64b8fa`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor (`EXIT=0`): **49 birim, 256 E2E** (32'si viewport'a göre atlanıyor),
  payload **133.8 KiB / 150.0 KiB**
- Açık PR: yok
- `wip/team-section-2026-08-29`: yeniden yazılmadan önceki Team dalının yedeği; #44 merge edilmiş,
  toplanacak bir şey yok.

## Yayın

| Ne              | Nerede                                 |
| --------------- | -------------------------------------- |
| Kanonik adres   | `https://mymandev.com`                 |
| Host            | Cloudflare Pages, proje adı `mymandev` |
| Production dalı | `main` → otomatik deploy               |

#107'nin production deploy'u gerçek domain üzerinde ölçüldü:

- `/`, `/index.txt`, `/__next._full.txt`, `/__next.__PAGE__.txt`: dördünde de ayrılan kişinin adı **0** kez geçiyor.
- Yeni metinler yayında; "Three engineers" ve "backend and security" **0**.
- HTML `cf-cache-status: DYNAMIC` ve `max-age=0` dönüyor; eski `cache html at edge` kuralı artık
  uygulanmıyor (ölçüldü).

**Cloudflare temizliği (2026-09-29, karar sahibi panelden):**

- **Eski deployment'lar:** #107'nin merge'ünden önce oluşan **53 deployment silindi**, 53/53, hata
  yok. Kalan 5 deployment'ın hepsi sonradan oluştu; yayındaki #109 production'ı da onların içinde.
  Silme, karar sahibinin kendi terminalinde çalıştırdığı bir PowerShell script'iyle yapıldı; token
  sohbete girmedi. Script depoda değil. Geçici token 2026-09-30'da kendiliğinden düşüyor.
- **Silinen iki portre:** alan adı purge'ü **yetmedi**. Purge'den sonraki ilk istek `MISS` döndü, ama
  cevap `Age: 49644`, `s-maxage=604800` ve `x-robots-tag: noindex` taşıyordu. Yani kopya
  **Cloudflare Pages'in iç önbelleğindeydi**; alan adı purge'ü oraya ulaşmıyor. Çözüm alan adında bir
  **WAF custom rule** oldu: `block removed portraits`, URI Path `/people/` altındaki silinen portre
  önekiyle başlıyorsa Block.
- **Ölçüldü:** iki adres **403** dönüyor, sorgu dizesiyle de. Diğer dört portre, proje görseli, `/`,
  `/og.png` ve `/index.txt` **200**; canlı HTML'de ad **0**.
- `mymandev.pages.dev` alan adı kuralının dışında kalıyor. Oradaki iç kopya en geç ~2026-10-05'te
  kendiliğinden düşer; bu ağdan ölçülemiyor.

## Sıradaki iş

**#106 — nav yazısı bazı scroll konumlarında AA kontrastın altına iniyor.** Karar sahibinin seçimi
bekleniyor: bar tint'i, pasif nav rengi veya accent aktif link. Hepsi paylaşılan yüzey
(`app/tokens.css`, `app/globals.css`).

Ölçüm yöntemi ve sayılar issue'da. En kötü noktalar: pasif linkte **4.09:1** (1440×900, Team
kartlarının üst kenarı — iki kişilik Team'le geldi, üç kişiyken 5.30:1) ve accent aktif linkte
**3.90:1** (1280×720, Hero — daha önce de vardı). `design-spec.md` §3.1'deki 5.49:1 bu yöntemle
yeniden üretilemedi ve spec'te böyle yazılı.

## Bitmemiş iş

- **WAF kuralı** `block removed portraits`: ~2026-10-05'ten sonra kuralı kapat ve iki adresi ölç.
  404 dönüyorsa kuralı sil; hâlâ resim dönüyorsa kuralı geri aç.
- **Konu dışı, fark edildi, ayrı PR ister:**
  - `components/sections/team/TeamCard.tsx:9` ve `lib/images.ts:20` oranı "5/8" diyor; token
    `--aspect-portrait` 5/9.
  - `docs/design-spec.md` L14-15 ve L528-531 biyografi ve fotoğrafları hâlâ "bekliyor" diyor; #16
    kapalı.
  - `.github/CODEOWNERS`'ın "Paylasilan yuzeyler" bloğu `content/index.ts`'i sayıyor,
    `working-agreement.md` §1 saymıyor. Karar sahibi birini seçmeli.
  - Kod yorumları Türkçe (ASCII); `CLAUDE.md` "kod içi yorumlar İngilizce" diyor. Eski bir ayrışma.
- **Git geçmişi** ayrılan kişinin fotoğrafını ve biyografisini taşıyor (depo herkese açık, #44
  dahil). Yeniden yazmak `non_fast_forward` kuralına çarpar; yalnızca kendisi talep ederse ayrı bir iş.

## Alınan kararlar

Kalıcı kararlar `docs/architecture.md` §9'da. Bugün **üç** satır eklendi: bölge sahipliği (Bölge B
İbrahim'e, paylaşılan yüzey onayı karar sahibinde), Team genişliği (`lg`'de kart üç kolonluk iz
genişliğinde, eksik satır ortalanır) ve logo (ekip iki kişiye inse de üç kafalı işaret kalıyor).
Metinler için karar sahibi "en az düzeltme"yi seçti; onaylanan cümleler #107'de birebir.

**Onay kuralı değişti.** "İki bölge sahibinin onayı" yerine artık **karar sahibinin açık onayı**
var; bir Claude oturumu paylaşılan yüzeye veya marka metnine dokunan bir PR'ı kendi başına merge
etmez (`working-agreement.md` §1, §3.1). 2026-09-28'deki PR'lar karar sahibinin "koşullu merge et"
onayıyla merge edildi; onay ve koşul her PR gövdesinde kelimesi kelimesine yazılı.

## Tuzaklar ve notlar

Bugün ölçümle bulunanlar:

- **`*.pages.dev` iş ağında açılmıyor.** DNS `::1` ve `213.14.227.50` dönüyor; aynı anda
  `mymandev.com` 200 veriyor. Preview kontrolü bu makinede aynı commit'in yerel build'inde yapılır.
- **Cloudflare dal alias'ını 28 karaktere kısaltıyor.** Preview linkini bot yorumundan al, dal
  adından türetme (`chore-point-ownership-commen.mymandev.pages.dev`).
- **Cloudflare Pages build'i bir kez sebepsiz düştü** ("Build failed", log yalnızca panelde). Aynı
  ağaç boş bir commit'le yeniden koşunca 60 saniyede geçti. GitHub'daki `lighthouse` işi de bir
  kez `next/font/google` dosyasını çekemeyip düştü
  (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`); `gh run rerun <id> --failed`
  ile geçti. İkisinde de aynı commit'in diğer build'leri yeşildi.
- **Flex bir öğede `gridTemplateColumns` başka bir breakpoint'in iz listesini döndürüyor**
  (`repeat(2, minmax(0px, 1fr))`, üç parça). Kolon sayan bir test, liste flex'e geçince hiçbir şey
  ölçmeden geçerdi; `team.spec.ts` artık kart genişliğini ve ortalamayı ölçüyor.
- **Team kartı (`article`) giriş animasyonunda `translate` taşıyor.** Yerleşimi ölçerken `li`'yi ölç;
  400ms'de ölçülen `article` konumu animasyonun ortasını yakaladı (2–8px).
- **Düz bir JS Playwright config'inde `use.reducedMotion` uygulanmadı** (`matchMedia` false döndü);
  `page.emulateMedia({ reducedMotion: "reduce" })` çalışıyor. Deponun kendi testleri zaten öyle.
- **Silinen bir Pages dosyası Pages'in iç önbelleğinde 7 güne kadar yaşayabilir** (`s-maxage=604800`).
  Alan adı purge'ü bu katmana ulaşmıyor. İşareti: purge'den sonraki ilk istek `MISS` ama `Age` büyük.
  Sorgu dizeli istek (`?x=…`) iç önbelleği ıskaladığı için 404 görürsün; bu "dosya kalktı" demek
  değil. Kesin çözüm alan adında bir WAF kuralı. Dün yazılan "4 saatte kendiliğinden düşer" yanlıştı;
  12 saat sonra hâlâ sunuluyordu.
- **Silinen bir deployment'ın adresi de bir süre sunulmaya devam edebilir** (Cloudflare'in açık bir
  hatası). Toplu silme API ile yapılır: listele → `created_on`'a göre seç → `DELETE …?force=true`.
  Liste sayfası en fazla 25.
- **`WebFetch` de bu makinenin DNS'ini kullanıyor**; `pages.dev`'e o da ulaşamıyor.
- **Ekip verisi yalnızca `index.html`'de değil,** üç RSC dosyasında da (`/index.txt`,
  `/__next._full.txt`, `/__next.__PAGE__.txt`) yayınlanıyor. Bir şeyin yayından kalktığını dördünü
  birden ölçerek doğrula.
- **`scripts/optimize-images.mjs` dosya silmiyor** ve `next build` `public/`'in tamamını kopyalıyor.
  Artık `tests/images.test.ts` ekipte olmayan bir fotoğrafı yakalıyor (iki yarısı da kanıtlandı).
- **`gh pr merge --match-head-commit` tam SHA istiyor**; kısa SHA GraphQL hatası verir.
- **Bir adı ağaçta ararken `git grep -w` kullanma.** Kelime sınırı `@handle`'ları ve URL'lerin
  içindeki adı kaçırıyor (bugün 27 satırın 19'unu kaçırdı). `-w`'siz `git grep -i -E` ve dosya adları
  için `git ls-files | grep` birlikte gerekir.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
