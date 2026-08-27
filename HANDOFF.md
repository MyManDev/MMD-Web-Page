# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-27
**Yer:** iş
**Aşama:** 3 — Bölge işi (bkz. `docs/working-agreement.md` §6). Aşama 1 ve Faz 0 kapandı.

## Dal ve çalışma ağacı

- Dal: `main` (`6e4cd45` — Faz 0 merge edildi)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` merge edilmiş `main` üzerinde uçtan uca geçiyor; CI'da da yeşil
  (`gates` · `e2e` · `lighthouse`).

## Açık PR'lar

- yok

## Sıradaki tek iş

**#6 — `docs/design-spec.md` §10'daki 13 ölçü önerisini onayla ve `app/tokens.css`'e taşı.**
Bu issue diğer bütün Faz 3 issue'larını (#7–#14) engelliyor: ölçüler kesinleşmeden bölüm
component'i yazılmamalı, yoksa her component kendi sayısını uydurur.

## Bitmemiş iş

- **Branch protection'a status check eklenmedi.** `gates` ve `e2e` işleri artık gerçekten var;
  `main protect` ruleset'i şu an yalnızca `deletion` + `non_fast_forward` tutuyor. Zorunlu check'ler
  eklenebilir.
- **`@tunayaslan`'ın repoya yazma yetkisi yok.** Hesap gerçek ama yetki doğrulanamadı. Yetkisiz bir
  CODEOWNERS sahibini GitHub **sessizce yok sayar**.
- **Katkıcı listesi kenar çubuğunda hâlâ üç isim gösteriyor.** `main`, `/contributors` API'si ve
  Insights sayfası temiz; kalıntı `refs/pull/*/head` ref'lerinde ve GitHub önbelleğinde.
  Bu ref'ler sunucu tarafında, silinemiyor. GitHub Support'a talep açıldı.
- **`--nav-height`** hâlâ `app/globals.css`'te "ONAY BEKLIYOR" yorumuyla; #6 ile `tokens.css`'e
  taşınacak.

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
- Ev makinesinde ilk kurulum `gh auth login` + repo-yerel credential helper gerektiriyor
  (`git config --local credential.https://github.com.helper` — **önce boş değer, sonra gh çağrısı**).
  GCM'de `fatssy` hesabı önbellekte, silinmedi.
- **Logo'nun kaliteli SVG'si hâlâ yok**; favicon ve OG görselleri buna bağlı (#18).
- **Hero/About metinleri, ekip biyografileri ve imza sayısının metni yazılmadı** (#15, #16, #17).
  Placeholder konulmayacak; metin gelene kadar ilgili bölüm yayınlanmaz.
- `pnpm create next-app` **kullanılmadı**; iskelet elle kuruldu, sürümler tam sabitli.
