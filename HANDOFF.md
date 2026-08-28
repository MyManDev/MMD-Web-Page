# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-28 (akşam)
**Yer:** iş
**Aşama:** 3 — Bölge işi. Metin gerektirmeyen iş bitti; kalan her şey metin veya varlık bekliyor.

## Dal ve çalışma ağacı

- Dal: `main` (`43467d9`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`).
- Payload: **132.3 KiB / 150.0 KiB** (`main`), kalan pay 17.7 KiB.
- Test: 25 birim, 98 E2E — `feature/team-section` dalında 29 ve 123.

## Açık PR'lar

**#44 — feat: build the Team section with mock people · TASLAK · MERGE EDİLMEYECEK**

`main`'in **15 commit önünde** ve bugünün görünür işinin büyük kısmı burada:

|                 |                                                                       |
| --------------- | --------------------------------------------------------------------- |
| Team bölümü     | üç kişi kartı, kart = fotoğrafın kendisi (5/8), hover'da hayaletleşme |
| Daktilo efekti  | `BioTypewriter.tsx`, biyografi harf harf yazılıyor                    |
| Şema            | `photo` ve `linkedinUrl` zorunlu alan olarak eklendi                  |
| Görsel pipeline | portre türü, kırpma düzeltmesi, 500/1000 genişlikler                  |
| Sayfa ölçüleri  | kolon 1600px, bölüm boşluğu yarıya indi, görseller büyüdü             |
| Tipografi       | display rolü IBM Plex Mono'ya geçti                                   |
| Etiketler       | Team'den `SectionLabel` kalktı                                        |

**Neden merge edilmedi:** `assets/people/` altındaki üç portre **mock** — üzerlerinde "MOCK"
yazıyor. Biyografiler ve roller gerçek ve CV'lerden çıkarıldı ama **onaylanmadı** (#16).

> Bu dal her gün `main`'den uzaklaşıyor. Bugün üç kez `main` birleştirildi ve bir çakışma
> çözüldü. Fotoğraflar gelmezse yarın da aynı iş tekrarlanır.

## Sıradaki tek iş

**#16 — Gerçek fotoğrafları koy ve biyografi/rolleri onayla, #44'ü merge et.**

Fotoğraflar `assets/people/` altındaki üç mock dosyanın yerine konur, `pnpm images` koşturulur,
`content/team.ts`'teki taslak uyarısı kaldırılır ve PR taslaktan çıkarılır.

**Fotoğraf çekim notu:** kart 5/8 dikey ve **alt üçte biri metin paneli**. Yüz üst yarıda olsun.
Kaynak farklı orandaysa script ortadan kırpar.

## Bitmemiş iş

- **#15 — Hero cümlesi ve "Who we are" manifestosu yazılmadı.** #12 Hero ve #9 Who we are buna
  bağlı. Ölçüldü: hero başlığı **5–7 kelime** (2–3 satır), alt cümle **20–25**, manifesto
  **60–80** + 3–5 prensip maddesi. Biyografiler 26–28 kelimede tutuldu, üçü de 5 satır.
- **Projects'in `02 PROJECTS` etiketine karar verilmedi.** Team, Hero ve Who we are etiketsiz
  olduğuna göre o tek başına kalıyor; `01–04` dizisi artık bir dizi değil. Karar verilirse
  `SectionLabel` component'i ve `content/schema.ts`'teki zorunlu `number` alanı da kalkar.
- **#11 yarım:** `robots.txt`, `sitemap.xml` ve canonical yayında; `description`, Open Graph ve
  Twitter card **yok** — üçü de marka metni.
- **#18 yarım:** favicon var (`app/icon.png`), kaliteli SVG ve OG görseli yok.
- **Tunay'ın GitHub adresi doğrulanmadı.** CV'sinde yok; kayıtta `github.com/tunayaslan` duruyor
  ve bu CODEOWNERS'tan geliyor. Gönderilen `github.com/orgs/MyManDev/people/tunayaslan` adresi
  **kişisel profil değil**, org üye listesi — dışarıdan bakan 404 görür.
- **İbrahim'in LinkedIn adresi test edilmedi:** `linkedin.com/in/ibrahim-ersan-ozdemir15`.
- **Branch protection çalışmıyor.** Bugün `edac703` doğrudan `main`'e push edildi (GitHub web
  arayüzünden dosya yükleme). `working-agreement.md` §3 bunu kapatıyor olmalıydı. Zorunlu status
  check'ler (`gates`, `e2e`) de hâlâ eklenmedi.
- **`@tunayaslan`'ın yazma yetkisi yok**; CODEOWNERS satırları sessizce yok sayılıyor.
- **Katkıcı listesi kenar çubuğunda hâlâ üç isim.** GitHub Support yanıtı bekleniyor.

## Alınan kararlar

Bugün alınan kalıcı kararların hepsi `docs/architecture.md` §9'daki karar kaydında: marka rengi,
içerik genişliği, bölüm dikey boşluğu, bölüm sırası, görsel yüzeyi ve pipeline'ı, etkileşim dili,
hareket sistemi, imza sayısı, tip ölçeği, display rolünün mono'ya geçmesi.

## Tuzaklar ve notlar

Bugün ölçümle bulunan, gözle bulunamayacak olanlar:

- **`animation-timeline: none` reduced-motion'da YANLIŞ.** Zaman çizelgesi olmayan animasyonun
  geçerli zamanı çözümlenemiyor, `fill-mode: both` `from` karesini uyguluyor → öğe `opacity: 0`'da
  donuyor. Doğrusu `animation-name: none`. Bu kural sabah **yanlış** yazıldı, akşam E2E yakaladı.
- **Tailwind v4 `translate-y-*` için `transform` değil `translate` üretiyor.** Geçiş listesi ve
  test onu okumalı; `transform` `none` kalıyor.
- **Tailwind v4'te `--width-*` namespace'i yok**, `max-w-*` `--max-width-*` okur. Yanlış
  namespace'teki token üretilen CSS'e **hiç girmez** ve utility sessizce varsayılana düşer.
- **Tailwind v4 opaklığı `color-mix` ile üretiyor**; `getComputedStyle` `oklab(... / 0.92)`
  döndürüyor, `rgba()` ayrıştırması `null` veriyor.
- **`next/font` yalnızca CSS'in kullandığı ağırlıkları üretiyor**, ilan edileni değil. Font
  değiştirmek bu yüzden bayt olarak nötr çıktı (169.888 byte, üç yapılandırmada da aynı).
- **Bölüm dikey boşluğu spec'in iki katıydı** (256px, olması gereken 128). Her bölüm değeri hem
  üstüne hem altına uyguluyordu.
- **Görsel pipeline kırpmıyor, esnetiyordu.** Kaynak ve hedef aynı orandayken görünmüyordu;
  oran değişince yüzler ezilecekti. Artık ortadan cover-crop yapıyor.
- **Kart perdesi gradyan olduğunda kontrast düşüyordu** — beyaz bir fotoğrafta rol satırı 1.84:1
  (gereken 4.5). Koyu mock fotoğraflarla **görünmüyordu**. Düz %92 perde: en kötü durum 6.83:1.
- **E2E körlüğü:** üç kart aynı ızgara satırında, üst kenarları aynı. "Komşu yerinde kaldı" testi
  satır büyümesini göremez — sayfa 108px zıplarken test geçiyordu.
- **`next dev` `CLAUDE.md`'ye kendi bloğunu yazıyordu**; `next.config.ts`'te `agentRules: false`
  ile kapatıldı. Eklediği metin "bunu işinle birlikte commit et" diyordu ve bir kez `git add -A`
  ile commit'e sızdı, geri alındı.
- **`pnpm dev` çalışırken `next-env.d.ts` dev varyantına dönüyor**; commit'lenmez.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
