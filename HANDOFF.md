# HANDOFF

> Güncel durum kaydı. Geçmiş git log'unda; protokol `docs/working-agreement.md` §7.

**Tarih:** 2026-11-05
**Yer:** yerel Windows çalışma alanı
**Aşama:** MyManDev vitrini güncellendi. SquadOpt içerik PR'ı #143 ve footer imzası #144
`main` ile birleşti. Kalıcı tasarım kararları `docs/architecture.md` §9'da.

## Dal ve çalışma ağacı

- Kaynak temeli: `main`, #143 ve #144.
- Bu devir ve tasarım notları ayrı doküman dalında; uygulama değişikliği içermez.
- Uygulamanın son birleşik ağacında `pnpm gates` geçti: **62 birim, 323 E2E**,
  33 viewport atlaması; JS **135.3 KiB / 150 KiB**.
- Her iki kaynak PR'ının zorunlu `gates` ve `e2e` işleri başarılı.
- İlgili takip: #142. Yeni SquadOpt görüntüleri, kısa açıklama ve imza bu kapsamda.

## Yayın

- Kanonik adres: `https://mymandev.com`.
- Cloudflare Pages projesi: `mymandev`; `main` otomatik production deploy üretir.
- Canlı kontrol başarılı: masaüstü 1440×900 ve mobil 390×844, yeni metin ve imza,
  altı görsel ve fontun kaynakla SHA-256 eşleşmesi, gerçek HTTP 404. Production deployment:
  `69a92908-b9a8-4971-877e-84372e962380`, kaynak `5719167` (#144).
- Görsel karşılaştırma: `docs/review/footer-2026-11-05/` (1440×900 ve 390×844).
- #144 Lighthouse medyanları: Performance / Accessibility / Best Practices / SEO **100**;
  Performance aralığı **87–100**, LCP medyanı **918ms**, CLS **0**. Bunlar CI localhost ölçümüdür.

## Sıradaki tek iş

Yeni ürün veya görünüm isteğiyle ilerle. Bu teslimin kapsamı SquadOpt vitrini ve footer imzası.

## Bitmemiş ve kapsam dışı işler

Önceki devirden taşınanlar; bu teslimde işlem yapılmadı:

- **WAF `block removed portraits`:** eski not, kuralı geçici kapatıp iki eski adresin 404
  döndüğünü ölçmeyi istiyor. Hâlâ resim dönüyorsa geri açılmalı. Sonuç doğrulanmadan silinmez.
- **İkinci proje eklendiğinde yığın:** üstteki kartın alttakini örtmesi, klavye odağının
  `z-index` kazanması ve hayaletlerin birleşimi ölçülecek. `Projects.tsx` ve design-spec §3.3.2.
- **Git geçmişindeki eski kişi bilgileri:** yalnızca ilgili kişi isterse ayrı iş.
- **Katkıcı listesindeki `claude` girdisi kabul edildi;** yeni depo açılmıyor. Karar
  `docs/architecture.md` §9'da. Kullanıcı istemedikçe yeniden açma.

## Tuzaklar ve notlar

- Node **24.15.0**, pnpm **11.24.0**; sürümler `.nvmrc` ve `package.json` ile sabit.
- `pnpm gates` çalışırken **4173 portunda başka çalışma ağacının preview'u açık olmasın**.
  Yerel Playwright `reuseExistingServer` yüzünden yanlış build'i test edebilir.
- İç içe çalışma ağacının `.next` çıktıları root ESLint taramasına karışır. Kapıları
  temiz ağaçta çalıştır; bu teslimin geçici footer ağacı kaldırıldı.
- pnpm 11 çalışma ağaçları arasında `node_modules` junction'ını reddediyor. Her ağaçta
  kendi `pnpm install --frozen-lockfile` kurulumu kullanılmalı.
- #144 ilk E2E işi, testlerden önce mevcut IBM Plex `next/font/google` dosyasını çözerken
  Turbopack hatası verdi. Aynı SHA yerel, Cloudflare ve diğer CI derlemelerinde başarılıydı;
  yalnız başarısız işi yeniden çalıştırınca geçti. Production build de aynı hatayı bir kez
  verdi; aynı SHA ile Cloudflare Retry deployment başarılı oldu. Yeni Allura fontu yerel dosyadır.
- `*.pages.dev` bu ağda açılmayabilir. Gerçek preview adresini Cloudflare botundan al;
  yerelde aynı commit'in statik çıktısını incele, yayın sonrasında kanonik domaini doğrula.
- `scripts/optimize-images.mjs` eski dosyaları silmez. Kullanılmayan kaynak ve türevleri
  birlikte kaldır; `tests/images.test.ts` artıkları denetler.
- `metrics` şemada isteğe bağlıdır. SquadOpt kartı artık metrik kullanmıyor; E2E kontrolleri
  varsa değerleri ve sıralarını, yoksa boş metrik alanı oluşmadığını doğrular.
- Reduced-motion tercihini değiştirince stilleri bir sonraki karede tekrar oku. Sahte saat
  kurulumu sayfa yüklenmeden önce yapılmalı; `performance` ölçümü sahte saatle boş dönebilir.
- Silinen Pages dosyaları iç önbellekte kalabilir. İçerik kaldırma doğrulaması HTML yanında
  `/index.txt`, `/__next._full.txt` ve `/__next.__PAGE__.txt` yüzeylerini de kapsamalı.
- `git add -A` yerine ilgili dosyaları tek tek ekle. Commit/PR/issue metnine araç imzası
  veya co-author trailer yazılmaz. `gh pr merge --match-head-commit` tam SHA ister.
- Geçici çalışma ağaçları `.claude/worktrees/` altında ve ignore edilir; kaldırmadan önce
  sunucularını kapat, ana dizinden `git worktree remove` kullan.
