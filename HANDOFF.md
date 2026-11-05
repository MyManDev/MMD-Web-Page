# HANDOFF

> Güncel durum kaydı. Geçmiş git log'unda; protokol `docs/working-agreement.md` §7.

**Tarih:** 2026-11-05
**Yer:** yerel Windows çalışma alanı
**Aşama:** Üç sayfalı vitrin ve görsel iyileştirmeler yayında. Son kaynak PR #156,
`1c27e1c` ile `main`'e birleşti; mobil menünün sayfa metnine binmesini düzeltiyor.

## Dal ve çalışma ağacı

- Kaynak #156; devir ve tasarım sözleşmesi ayrı doküman PR'ında.
- Son yerel `pnpm gates`: **62 birim, 260 E2E**, 26 viewport atlaması.
- Dört yeni mobil test önce mevcut kodda başarısız oldu, düzeltmeden sonra geçti:
  normal/reduced-motion örtü geometrisi, masaüstüne genişletince kilit temizliği,
  kısa ekranda son menü aksiyonuna kaydırma. Geometri üç sayfada ve kaydırılmış halde ölçülüyor.
- En ağır sayfa `/projects`: **139.4 KiB / 150 KiB**. Ana sayfa 136.2, Team 137.1 KiB.
- #156 `gates`, `e2e`, `lighthouse` ve Cloudflare kontrolleri başarılı; #155 kapandı.
- Görsel test önkoşulları #158 ve #160'ta: karuselin hazır sinyali ve yakınlaştırmada
  iki yönde taşma beklenir. Görüntüleyici senaryolarının 100 tekrarı ve tam `pnpm gates`
  başarılı; uygulama kodu değişmedi.

## Sayfa sözleşmesi

- `/`: MyManDev, kısa ekip ve çalışma alanı anlatımı; varsayılan açılış.
- `/projects`: mevcut SquadOpt kartı, güncel görüntüler ve bağlantılar.
- `/team`: mevcut ekip kartları ve biyografiler.
- Hero / Who We Are / prensip destesi kaldırıldı. Menü gerçek sayfa bağlantıları ve
  `aria-current="page"` kullanır. Kalıcı layout nav/footer'ı; `SitePage` main'i taşır.
- Mobil örtü header'ın kardeşidir; bulanıklık filtresinin içine geri koyma. Panel nav'ın
  altından ekranın sonuna uzanır, kısa ekranda kendi içinde kayar. Masaüstüne genişletince
  kapanır, sayfa kilidi kalkar ve odak masaüstü aktif linkine geçer.
- Reveal gözlemcisini kalıcı layout'a taşıma: yeni route DOM'undan önce kurulursa metin
  gizli kalabiliyor. Sayfa içeriğiyle mount olması gezinme testinde doğrulanıyor.
- Sayfa girişleri ve kayan aktif menü çizgisi 200ms. Amblem zemine karışır; hafif ışığı
  yalnız açılışta 4 saniyede yerleşir. Reduced-motion altında hareket yoktur.
- Proje görüntüleri yerel dialog içinde açılır: Escape, odak dönüşü, yön tuşları,
  mobil kaydırma ve en az 1200px yakınlaştırma. Açıkken arka sayfa ve karusel durur.
  Yakınlaştırınca odak resim alanına gelir; yön tuşları slaytı değiştirmeden resmi kaydırır.
- Team fotoğraflarında karartma %10, odak `center 65%`; metin perdesi %92 korunur.
- Sayfa metinleri, proje içeriği ve mavi-mor footer imzası korunuyor.

## Yayın

- Kanonik adres: `https://mymandev.com`; Cloudflare Pages projesi `mymandev`.
- Son kaynak production deployment: `c8fb6ae8-0b78-46d2-b553-ba1eebb4bef4`, kaynak `1c27e1c`.
- Son kaynak preview: `https://8e660b8b.mymandev.pages.dev`, PR head `295fb43`.
- Menü hatası canlı 390×844 görünümde yeniden üretildi: panel top=72, height=32,
  bottom=104. Düzeltmenin aynı boyuttaki yerel kontrolü: top=72, height=772, bottom=844;
  menü dışındaki sayfa görünmüyor. 1280×900'e geçişte kilit ve odak kontrolü başarılı.
- Canlı yayında da 390×844 panel top=72, height=772, bottom=844 doğrulandı. Menüden
  Team'e geçişte menü kapalı, sayfa kilidi ve `inert` kalkmış; konsol hatası yok.
- Görsel karşılaştırma: `docs/review/menu-2026-11-05/`; önceki karşılaştırmalar korunuyor.

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

- `backdrop-filter` sabit çocuklar için containing block oluşturur. Eski menü testleri
  bağlantı ve odağı tutarken örtünün yüksekliğini ölçmediği için #155'i kaçırdı.
- Sentetik `dispatchEvent` hidrasyonu beklemez: #157'de resmin JS'siz bağlantısına gitti.
  Görsel testleri önce mevcut Next screenshot düğmesinin görünmesini bekler; sabit süre yok.
- Klavye kaydırma testi, büyütülen resmin iki yönde taşmasını bekler (#159). Görünür
  dialog ve odak tek başına resmin kaydırma ölçülerinin hazır olduğunu göstermiyor.
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
