# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-27
**Yer:** iş
**Aşama:** 3 — Bölge işi (bkz. `docs/working-agreement.md` §6). Aşama 1 ve Faz 0 kapandı.

## Dal ve çalışma ağacı

- Dal: `main` (`b2d6617`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`).

## Açık PR'lar

- yok

## Sıradaki tek iş

**#15 — Hero cümlesi ve About manifestosunu yaz.** Bölge A'nın tek işi olan #12 Hero buna
bağlı, ve #9 About ile #11 SEO da aynı metni bekliyor. Paylaşılan karar alanı: iki tarafın
onayı gerekiyor, placeholder konulmayacak.

## Bitmemiş iş

- **#7 Navigation açık kaldı.** Component tamam ve merge edildi, ama **anchor scroll ve aktif
  link E2E'si yazılamadı** — gözlenecek bölüm yok. `useActiveSection` boş durumu karşılıyor
  (bölüm yoksa hiçbir link aktif olmuyor). O iki test ilk bölümle birlikte yazılacak.
- **#14 gerçek ekran görüntüsü bekliyor.** `scripts/optimize-images.mjs` de yazılmadı ve `sharp`
  henüz bağımlılık değil — eklenmesi ayrı onay ister.
- **Branch protection'a status check eklenmedi.** `gates` ve `e2e` artık gerçekten var.
- **`@tunayaslan`'ın yazma yetkisi yok.** Yetkisiz CODEOWNERS sahibi sessizce yok sayılır.
- **Katkıcı listesi kenar çubuğunda hâlâ üç isim.** `main`, API ve Insights temiz; kalıntı
  `refs/pull/*` ref'lerinde. GitHub Support'a talep açıldı, yanıt bekleniyor.

## Alınan kararlar

Bu devirde alınan kalıcı kararların hepsi `docs/architecture.md` §9'daki karar kaydında.
Burada tekrar edilmiyor.

## Tuzaklar ve notlar

- **Payload kapısında kalan pay 19.7 KiB.** Boş sayfa 130.3 KiB / 150 KiB. Faz 3'ün tamamı bu
  paya sığmak zorunda. İlk bölüm component'lerinden sonra tekrar ölçün; eşiği yükseltmek çözüm
  değil.
- **TypeScript 7 ve ESLint 10 kullanılamıyor.** `typescript-eslint` TS 7'yi desteklemiyor,
  `eslint-plugin-react` ESLint 10 altında çöküyor. TS `6.0.3` ve ESLint `9.39.5`'e sabitli.
  Yukarı çıkış ayrı bir `chore:` PR'ı olmalı ve upstream düzelmeden denenmemeli.
- **`corepack enable pnpm` yönetici izni istiyor** (`C:\Program Files\nodejs`). Bu makinede
  `npm install -g pnpm` ile kuruldu; PATH'e `%APPDATA%\npm` eklemek gerekebiliyor.
- **`gh` token'ında `workflow` scope'u olmalı**, yoksa `.github/workflows/` içeren dal push
  edilemiyor (`gh auth refresh -h github.com -s workflow`).
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2). Bu kural bir kez ihlal
  edildi ve geçmişi yeniden yazmak gerekti; `refs/pull/*` kalıntısı geri alınamadı.
- **Payload payı 17.9 KiB.** Boş sayfa 132.1 / 150 KiB. Navigation client component'i 1.8 KiB'a
  mal oldu; Footer sunucu component'i olduğu için 0. Kalan dört bölüm bu paya sığmak zorunda —
  hangi bölümün `"use client"` gerektirdiğini önceden düşünün.
- **Yeşil disiplini artık ölçülüyor.** `tests/e2e/footer.spec.ts` bölümdeki her elemanın
  hesaplanmış rengini okuyup accent'e çözülürse düşüyor. Team ve About bölümlerine de aynı test
  eklenmeli.
- Ev makinesinde ilk kurulum `gh auth login` + repo-yerel credential helper gerektiriyor
  (`git config --local credential.https://github.com.helper` — **önce boş değer, sonra gh çağrısı**).
  GCM'de `fatssy` hesabı önbellekte, silinmedi.
- **Logo'nun kaliteli SVG'si hâlâ yok**; favicon ve OG görselleri buna bağlı (#18).
- **Hero/About metinleri, ekip biyografileri ve imza sayısının metni yazılmadı** (#15, #16, #17).
  Placeholder konulmayacak; metin gelene kadar ilgili bölüm yayınlanmaz.
- `pnpm create next-app` **kullanılmadı**; iskelet elle kuruldu, sürümler tam sabitli.
