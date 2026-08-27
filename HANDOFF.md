# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-27
**Yer:** iş
**Aşama:** 2 — Faz 0 (bkz. `docs/working-agreement.md` §6). Aşama 1 (Design lock) kapandı.

## Dal ve çalışma ağacı

- Dal: `main` (`415efef` + bu devir commit'i)
- Commit'lenmemiş değişiklik: yok
- Yerel kurulum: `pnpm` **global değil**, `C:\Users\123456\AppData\Roaming\npm` altında; git kimliği
  ve credential helper repo-yerel (aşağıdaki tuzaklar).

## Açık PR'lar

- **#21 — `feature/phase-0-skeleton`** · Faz 0 iskeleti. Kapılar yerelde ve CI'da geçti
  (`gates`, `e2e`, `lighthouse` üçü de yeşil). **Bilerek merge edilmedi:** baştan sona yeni
  bağımlılık getiriyor, insan onayı gerekiyor.

## Sıradaki tek iş

**PR #21'i incele ve merge et.** Merge edilmeden başka hiçbir iş başlayamaz: bütün Faz 3
issue'ları ona bağlı, ve `gates` / `e2e` status check adları ancak o merge edildiğinde var oluyor.
Merge sonrası branch protection açılabilir.

## Bitmemiş iş

- **`docs/design-spec.md` §10 — 13 ölçü önerisi onay bekliyor** (#6). Navbar yüksekliği, focus
  halkası, Hero kolon oranı, gutter, kart iç boşluğu... Onaylanmadan bölüm component'i yazılmamalı;
  yazılırsa her component kendi sayısını uydurur.
- **`--nav-height`** şu an `app/globals.css`'te "ONAY BEKLIYOR" yorumuyla duruyor. §10.1
  onaylanınca `app/tokens.css`'e taşınacak.
- **`@tunayaslan`'ın repoya yazma yetkisi yok.** Hesap gerçek (API ile doğrulandı) ama yetki
  doğrulanamadı. Yetkisiz bir CODEOWNERS sahibini GitHub **sessizce yok sayar** — satır
  uygulanıyormuş gibi görünür, uygulanmaz.
- **Branch protection kapalı.** Faz 0 merge edildikten sonra açılacak, önce değil.

## Alınan kararlar

Bu devirde alınan kalıcı kararların hepsi `docs/architecture.md` §9'daki karar kaydında.
Burada tekrar edilmiyor. (Faz 0 kararlarının satırları PR #21 içinde.)

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
- Ev makinesinde ilk kurulum `gh auth login` + repo-yerel credential helper gerektiriyor
  (`git config --local credential.https://github.com.helper` — **önce boş değer, sonra gh çağrısı**).
  GCM'de `fatssy` hesabı önbellekte, silinmedi.
- **Logo'nun kaliteli SVG'si hâlâ yok**; favicon ve OG görselleri buna bağlı (#18).
- **Hero/About metinleri, ekip biyografileri ve imza sayısının metni yazılmadı** (#15, #16, #17).
  Placeholder konulmayacak; metin gelene kadar ilgili bölüm yayınlanmaz.
- `pnpm create next-app` **kullanılmadı**; iskelet elle kuruldu, sürümler tam sabitli.
