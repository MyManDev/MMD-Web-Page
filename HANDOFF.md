# HANDOFF

> Güncel durum kaydı. Geçmiş git log'unda; protokol `docs/working-agreement.md` §7.

**Tarih:** 2026-11-05
**Yer:** yerel Windows çalışma alanı
**Aşama:** Üç sayfalı vitrin yayında. Kaynak PR #147, `c54bc3e` ile `main`'e birleşti.

## Dal ve çalışma ağacı

- Kaynak #147; belge ve görsel karşılaştırmalar ayrı doküman PR'ında.
- Yerel `pnpm gates`: **62 birim, 246 E2E**, 22 viewport atlaması.
- En ağır sayfa `/projects`: **138.3 KiB / 150 KiB**. Diğerleri: ana sayfa 136.5, Team 137.1 KiB.
- #147 zorunlu `gates` ve `e2e` başarılı. İlk gates denemesinde mevcut Google font/Turbopack
  hatası oluştu; yalnız başarısız işin aynı SHA ile tekrarı geçti. Cloudflare ve E2E ilkinde geçti.
- İlgili takip: #146. Önceki SquadOpt ve footer işleri #142–145'te tamamlandı.

## Sayfa sözleşmesi

- `/`: MyManDev, kısa ekip ve çalışma alanı anlatımı; varsayılan açılış.
- `/projects`: mevcut SquadOpt kartı, güncel görüntüler ve bağlantılar.
- `/team`: mevcut ekip kartları ve biyografiler.
- Hero / Who We Are / prensip destesi kaldırıldı. Menü gerçek sayfa bağlantıları ve
  `aria-current="page"` kullanır. Ortak kabuk `components/SitePage.tsx`.
- Reveal gözlemcisini kalıcı layout'a taşıma: yeni route DOM'undan önce kurulursa metin
  gizli kalabiliyor. Sayfa içeriğiyle mount olması gezinme testinde doğrulanıyor.
- Proje görüntü karuseli ve mavi-mor footer imzası korunuyor.

## Yayın

- Kanonik adres: `https://mymandev.com`; Cloudflare Pages projesi `mymandev`.
- Kaynak production deployment: `136f4244-8f08-4d68-a475-aa761d3d233b`, kaynak `c54bc3e`.
- Canlı HTTP doğrulaması: üç sayfa 200, her birinde doğru başlık/canonical ve tek h1;
  13 JS/CSS dosyası 200, sitemap üç adres, bilinmeyen yol gerçek 404.
- Tarayıcı incelemesi: 1440×900 masaüstü ve 390×844 mobil; sayfa bağlantıları,
  mobil menü, geri dönüş, metin görünürlüğü ve footer. Cloudflare preview'da tarayıcı hatası yok.
- Görsel karşılaştırma: `docs/review/pages-2026-11-05/`. Önceki footer karşılaştırması
  `docs/review/footer-2026-11-05/` altında duruyor.

## Sıradaki tek iş

Yeni kullanıcı talebiyle ilerle. Bu teslimde ek özellik veya metin kalabalığı eklenmedi.

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
