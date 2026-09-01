# CLAUDE.md

MyManDev'in tanıtım sitesi. Tek sayfa, statik, İngilizce. Projeler (Football Squad Optimizer gibi)
kendi repolarında yaşar; bu repo yalnızca vitrin.

**Bu dosya kısadır ve kural kopyalamaz.** Tek kayıt kuralı: aynı olgu iki yerde yaşamaz.

- Ne inşa ediyoruz, hangi stack, hangi eşikler → [`docs/architecture.md`](docs/architecture.md)
- Nasıl çalışıyoruz, dal/PR/kapı düzeni, devir protokolü → [`docs/working-agreement.md`](docs/working-agreement.md)
- Hangi component, hangi ölçü, hangi durum, hangi breakpoint → [`docs/design-spec.md`](docs/design-spec.md)
- Bugün nerede kaldık → [`HANDOFF.md`](HANDOFF.md)

Bir işe başlamadan önce `HANDOFF.md`'yi oku. Mimari, süreç veya tasarım sorusu varsa yukarıdaki
belgelere git, buradaki özete güvenme.

---

## Komutlar

```bash
pnpm dev          # geliştirme sunucusu
pnpm build        # statik export -> out/
pnpm preview      # out/ klasörünü 4173'te sun
pnpm lint         # eslint
pnpm format       # prettier --check
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
pnpm size         # out/ altındaki JS'in gzip toplamı < 150 KB
pnpm e2e          # playwright
pnpm gates        # lint, format, typecheck, test, build, size, e2e — PR öncesi bunu koştur
```

## Dil

- Kod, dosya adları, commit mesajları, PR başlıkları, kod içi yorumlar: **İngilizce**
- Site içeriği: **İngilizce**
- Dokümanlar (`docs/`), issue ve PR gövdeleri, sohbet: **Türkçe**

## Klasör yapısı ve bölge sahipliği

```
app/                           layout + page                    PAYLAŞILAN
app/tokens.css                 tasarım token'ları               PAYLAŞILAN
components/ui/                 paylaşılan primitive'ler         PAYLAŞILAN
components/sections/hero/      Hero                             BÖLGE A
components/sections/projects/  Projects + kart + etkileşim      BÖLGE A
components/sections/nav/       navbar, anchor scroll, mobil menü BÖLGE B
components/sections/team/      Team                             BÖLGE B
components/sections/about/     About                            BÖLGE B
components/sections/footer/    Footer                           BÖLGE B
content/                       içerik + Zod şeması              BÖLGE A
lib/                           yardımcılar                      dosya bazında
tests/e2e/                     Playwright                       dosya bazında
docs/                          belgeler                         PAYLAŞILAN
```

Bölge A: İbrahim. Bölge B: Tunay. Detay ve paylaşılan yüzey listesi:
[`docs/working-agreement.md`](docs/working-agreement.md).

**Başka bölgenin klasörüne dokunma.** Gerekiyorsa dur ve söyle; daha büyük bir PR yazma.

---

## Sert kurallar

1. **Renk yalnızca `app/tokens.css`'te.** Hiçbir component'te literal hex veya `rgb()` yok.
   Tailwind token sınıfları kullanılır.
2. **Büyük neon glow yok.** Yeşil accent: CTA, aktif nav, ikon, ince border, mikro highlight.
   Ekran başına tek yeşil odak.
3. **Scroll listener yazma.** Yığın ve sticky davranış `position: sticky` + z-index ile.
   `IntersectionObserver` **iki** yerde: aktif nav linki, ve metin bloklarının ekrana girince
   belirmesi (`components/ui/RevealOnView.tsx`). Her ikisi de tek bir dosyada tanımlı ve hiçbiri
   scroll listener değil. Üçüncüsü için sor — bu iki kullanımın gerekçesi
   [`docs/architecture.md`](docs/architecture.md) §4.4'te yazılı.
4. **Yeni bağımlılık eklemeden önce sor.** Gerekçesi yazılı olmayan paket eklenmez.
5. **Marka metni, proje açıklaması, ekip biyografisi veya sayı uydurma.** Bunlar paylaşılan karar
   alanı. Eksikse boş bırak ve sor. Uydurulmuş bir metin, hatadan kötüdür; çünkü makul görünür.
6. **Placeholder proje veya kişi ekleme.** "Coming soon" kartı, boş çerçeve, lorem ipsum yok.
   Yayınlanan her proje ve kişi gerçektir.
7. **Şema gevşetme.** Zod alanı eksikse build patlar. `.optional()` veya `.default()` ekleyerek
   hatayı susturma; eksik olan içeriği sor.
8. **Kapıları sen onaylamazsın.** "Testler geçti" beyanı bir ölçüm değil. `pnpm gates` çıktısını
   göster, sonucu insan okur.
9. **Tek konu.** Bir refactor görsel çıktı değiştirmez; bir içerik değişikliği component'e
   dokunmaz; bir doküman değişikliği kaynağa dokunmaz.
10. **`prefers-reduced-motion`** her hareketli öğede baştan ele alınır, sonradan eklenmez.

## Bir PR hazırlarken

Gövde şunları söylemek zorunda: ne değişti, **kasıtlı olarak ne değişmedi**, nasıl kontrol edildi.
Şablon `.github/PULL_REQUEST_TEMPLATE.md`'de hazır; alanları boş bırakma.

## Devir (iki ayrı Claude hesabı)

Gün sonunda `/handoff`, güne başlarken `/pickup`. İki hesap arasında paylaşılan tek bellek bu repo —
sohbet geçmişi taşınmaz. Protokol `docs/working-agreement.md` §7'de.
