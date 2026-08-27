# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-27
**Yer:** iş
**Aşama:** 1 — Design lock (bkz. `docs/working-agreement.md` §6)

## Dal ve çalışma ağacı
- Dal: `main`
- Commit'lenmemiş değişiklik: yok

## Açık PR'lar
- yok

## Sıradaki tek iş
Draw.io planlaması: design system sayfası + Home desktop wireframe. Kod yazılmayacak.

## Bitmemiş iş
- yok

## Alınan kararlar
Bu devirde alınan kalıcı kararların hepsi `docs/architecture.md` §9'daki karar kaydında.
Burada tekrar edilmiyor.

## Tuzaklar ve notlar
- Faz 0 (repo iskeleti, Next.js kurulumu, CI, Cloudflare Pages) tek PR'da yapılacak.
  Ondan önce `pnpm create next-app` çalıştırılmayacak.
- Logo'nun kaliteli SVG'si henüz yok; favicon ve OG görselleri için gerekiyor.
- Hero/About metinleri ve imza sayısının son hali henüz yazılmadı; placeholder konulmayacak.
- Ev makinesinde ilk kurulum `gh auth login` + repo-yerel credential helper gerektiriyor
  (`git config --local credential.https://github.com.helper` — **önce boş değer, sonra gh çağrısı**).
  GCM'de `fatssy` hesabı önbellekte, silinmedi.
