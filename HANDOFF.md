# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-28
**Yer:** iş
**Aşama:** 3 — Bölge işi (bkz. `docs/working-agreement.md` §6).

## Dal ve çalışma ağacı

- Dal: `main` (`a01c084`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`).
- Payload: **132.3 KiB / 150.0 KiB**, kalan pay 17.7 KiB.
- Test: 25 birim, 79 E2E (7'si viewport'a göre atlanıyor).

## Açık PR'lar

- yok

## Sıradaki tek iş

**#15 — Hero cümlesi ve About manifestosunu yaz.**

Bu iş bu sabah da sıradaki tek işti ve bugün ona dokunulmadı; bugün yapılan sekiz PR, **metin
gerektirmeyen ne kaldıysa** oydu. Artık o kaynak tükendi: #12 Hero, #9 About ve #11 SEO'nun
üçü de aynı metni bekliyor, yani Faz 3'ün kalanı tek bir yazma işinin arkasında duruyor.

Paylaşılan karar alanı: iki tarafın onayı gerekiyor, placeholder konulmayacak.

> Ekip biyografileri (#16) de yazılmamış durumda ve #8 Team'i bloke ediyor. İkisinden birini
> seçmek gerekirse #15 önce gelir, çünkü üç issue'yu birden açıyor.

## Bitmemiş iş

- **#7 Navigation açık.** Anchor scroll ve aktif link E2E'si hâlâ yazılmadı — ama **artık
  yazılabilir**: gözlenecek bir bölüm var ve `useActiveSection` fiilen çalışıyor. Dosya
  `tests/e2e/nav.spec.ts`, **Bölge B**.
- **`ProjectCard` hover/focus-within bilerek yazılmadı** (`design-spec.md` §2.2). V1'de blok tam
  genişlikte, kendi border'ı ve zemini yok (§3.3.1) — oraya hover koymak hiçbir şeyi vurgulamayan
  bir vurgu olurdu. O satır §3.3.2'nin yığılmış kartlarına ait; yığın uykuda ve test edilemez.
- **Yığın uyandığında doğrulanacak yeni bir nokta var:** bölüm girişi animasyonu süresince
  `transform` bir kapsayıcı blok yaratıyor ve sticky kartların ona göre konumlanması kontrol
  edilmeli. Yorum `components/sections/projects/Projects.tsx`'te duruyor.
- **Footer'ın GitHub linki dış link ikonu almadı.** `Button` değil, düz mono `<a>`.
  `design-spec.md` §7.5 açısından tutarsızlık — **Bölge B**'nin dosyası.
- **Tip ölçeği component'lerde gömülü** (`text-[40px]` gibi), `tokens.css`'te değil. Kendi
  `refactor:` PR'ını ve öncesi/sonrası görsel kontrolünü hak ediyor (§3.4).
- **Lighthouse için issue açılmadı.** Dün ev makinesinde Perf 82 / LCP 2.7s ölçüldü ama aynı sayfa
  üç koşuda 74↔92 salındı. §8 zaten "raporlanır, kapı değil" diyor; açılacak issue sayıyı değil
  **ölçümün güvenilirliğini** konu almalı (üç koşunun medyanı) ve "unused JavaScript 53 KiB"in
  kaynağını (Next'in kendi JS'i).
- **Branch protection'a status check eklenmedi.** `gates` ve `e2e` gerçekten var.
- **`@tunayaslan`'ın yazma yetkisi yok.** CODEOWNERS satırları sessizce yok sayılıyor, yani
  paylaşılan yüzey koruması fiilen yok ve zorunlu review 0.
- **Katkıcı listesi kenar çubuğunda hâlâ üç isim.** GitHub Support'tan yanıt bekleniyor.
- **#18 logo SVG bekliyor**; favicon ve OG görselleri buna bağlı.

## Alınan kararlar

Bugün alınan kalıcı kararların hepsi `docs/architecture.md` §9'daki karar kaydında — beş satır
eklendi veya güncellendi: görsel yüzeyi, görsel pipeline, etkileşim dili, hareket sistemi, ve
imza sayısının değeri. Burada tekrar edilmiyor.

`Tag`'in pill yapılmaması bir **değişiklik değil**, sorulup reddedilen bir öneri; gerekçesi
`design-spec.md` §2.1'de duruyor ki soru bir daha açılmasın.

## Tuzaklar ve notlar

- **`animation-timeline: none` reduced-motion'da YANLIŞ.** Zaman çizelgesi olmayan bir animasyonun
  geçerli zamanı çözümlenemiyor ve `fill-mode: both` o durumda `from` karesini uyguluyor — öğe
  `opacity: 0`'da donuyor. Doğrusu `animation-name: none`. Bu kural sabah belgeye **yanlış**
  yazıldı ve akşam E2E yakaladı; yazılmasaydı reduced-motion açık bir kullanıcı Projects bölümünü
  hiç görmeyecekti ve hiçbir kapı bunu söylemeyecekti. Gerekçe `app/globals.css` ve
  `design-spec.md` §6.1'de.
- **Tailwind v4'te `--width-*` diye bir namespace yok.** `max-w-*` `--max-width-*` okur. Token adı
  yanlış namespace'teyse **çıktı CSS'e hiç girmez** ve hiçbir şey hata vermez; utility sessizce
  Tailwind'in varsayılanını kullanır. Yeni token eklerken üretilen CSS'te değişkenin gerçekten
  yayınlandığını kontrol edin.
- **Payload payı 17.7 KiB.** Boş sayfa değil, bugünkü sayfa 132.3 / 150 KiB. Hero, Team ve About
  bu paya sığmak zorunda. `Button`'a eklenen ikon 0.2 KiB'a mal oldu ve sebebi öğretici:
  `Button` sunucu component'i **ama** `Nav` ve `MobileMenu` client component ve onu kullanıyor,
  yani `components/ui/` içindeki her şey client bundle'a girebiliyor.
- **Playwright Chromium webp kodlayabiliyor.** `scripts/optimize-images.mjs` bunu kullanıyor;
  `sharp` gerekmedi ve eklenmedi. Kaynak görüntüler `assets/screenshots/` altında ve **servis
  edilmiyor**; `public/projects/` altındakiler üretilmiş varyantlar.
- **`next-env.d.ts` bu makinede build/lint/typecheck/test ile değişmiyor** — tek tek ölçüldü.
  Değişim yalnızca `.next/dev/` kalıntısı dururken yapılan ilk gates koşusunda görüldü. Commit'li
  hali build varyantı (`./.next/types/...`); dev varyantı (`./.next/dev/types/...`) commit'lenmez.
  `.gitignore` kararı verilmedi.
- **`gh` CLI PR gövdesine görsel yükleyemiyor.** Görselli PR'larda dosyaları elle sürüklemek
  gerekiyor; şablonun görsel alanına "var ama henüz yüklenmedi" yazmak boş bırakmaktan iyi.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
- Ev makinesinde ilk kurulum `gh auth login` + repo-yerel credential helper gerektiriyor.
  GCM'de `fatssy` hesabı önbellekte, silinmedi.
