# HANDOFF

> Güncel durum kaydı. Geçmiş git log'unda; protokol `docs/working-agreement.md` §7.

**Tarih:** 2026-11-05
**Yer:** yerel Windows çalışma alanı
**Aşama:** Üç sayfalı vitrin, mobil menü düzeltmesi ve PC/mobil etkileşim hareketleri.
Son kaynak PR #163, `7bae2c6` ile main'e birleşti ve production kabulü tamamlandı.

## Dal ve çalışma ağacı

- Kaynak #163; devir ve tasarım sözleşmesi ayrı doküman PR'ında.
- Son yerel `pnpm gates`: **62 birim, 268 E2E**, 28 viewport atlaması.
- #163'ün dört kontrolü başarılı; #162 kapandı. CI E2E de 268/28 sonuçlandı.
- Lighthouse üç koşu medyanı: Performance / Accessibility / Best Practices / SEO **100**;
  LCP **762.2ms**. Performance aralığı 97–100; bu localhost mobil ölçümüdür.
- Yeni kontroller: hızlı seçimde son hedef, geri/ileri, Ctrl/Meta tıklaması, menü geçişini
  kesip yeniden açma, reduced-motion ve hareketli görüntüleyicide odak dönüşü.
- En ağır sayfa `/projects`: **140.0 KiB / 150 KiB**. Ana sayfa 136.7, Team 137.4 KiB.
- #155'te düzeltilen mobil örtü geometrisi, kısa ekran ve masaüstüne genişletince kilit
  temizliği korunur. Testler artık örtünün CSS hareketinin tamamlanmasını da bekler.
- #158/#160 test önkoşulları korunur. Bu teslimde hızlı eksen değişiminde yerel klavye
  kaydırmasının bazen adımı kaçırdığı görüldü; odaklı resim alanı dört yönü doğrudan kaydırır.
  Düzeltme sonrası masaüstü/mobil klavye senaryosunun ek 20 tekrarı başarılı.

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
- İç bağlantılar ortak `MotionLink`, sayfa gövdesi `PageMotion` kullanır. Mobil panel,
  düğmeler, linkler ve görüntüleyicide tutarlı giriş/çıkış ve basılma hareketleri var.
  Süreler ve reduced-motion sözleşmesi `docs/design-spec.md` §6'da.
- Amblem zemine karışır; hafif ışığı yalnız açılışta 4 saniyede yerleşir.
- Proje görüntüleri yerel dialog içinde açılır: Escape, odak dönüşü, yön tuşları,
  mobil kaydırma ve en az 1200px yakınlaştırma. Açıkken arka sayfa ve karusel durur.
  Yakınlaştırınca odak resim alanına gelir; yön tuşları slaytı değiştirmeden resmi kaydırır.
- Team fotoğraflarında karartma %10, odak `center 65%`; metin perdesi %92 korunur.
- Sayfa metinleri, proje içeriği ve mavi-mor footer imzası korunuyor.

## Yayın

- Kanonik adres: `https://mymandev.com`; Cloudflare Pages projesi `mymandev`.
- Son kaynak production deployment: `54696b87-796a-43a1-8c9d-a2e917f6ce00`, kaynak `7bae2c6`.
- Son kaynak preview: `https://0811c38f.mymandev.pages.dev`, PR head `d1de04e`.
- Production Cloudflare kontrolü başarılı. Kanonik domain üzerinde mevcut masaüstü/mobil
  kabul testleri **7 başarılı, 3 viewport atlaması**: menü, Escape/odak dönüşü, sayfalar,
  hızlı seçim, geri/ileri ve hareketli görüntüleyici.
- İlk canlı kontrolde iki yeni JS dosyasının `Origin: https://mymandev.com` cache varyantı
  404 döndü; Origin'siz istek 200'dü. Yalnız `3_kxxqkmxdoq6.js` ve `26n-4cng_zf7n.js`
  için tam dosya yolu prefix purge uygulandı. Ardından üç sayfanın tüm JS dosyaları
  Origin başlığıyla 200/application-javascript, canlı kabul testleri başarılı.
- Menü hatası canlı 390×844 görünümde yeniden üretildi: panel top=72, height=32,
  bottom=104. Düzeltmenin aynı boyuttaki yerel kontrolü: top=72, height=772, bottom=844;
  menü dışındaki sayfa görünmüyor. 1280×900'e geçişte kilit ve odak kontrolü başarılı.
- Canlı yayında da 390×844 panel top=72, height=772, bottom=844 doğrulandı. Menüden
  Team'e geçişte menü kapalı, sayfa kilidi ve `inert` kalkmış; konsol hatası yok.
- Yeni görsel karşılaştırma ve gerçek ekran hareket kayıtları:
  `docs/review/motion-2026-11-05/`; önceki menü karşılaştırması korunuyor.

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
  Bu bekleme tek başına hızlı yatay/dikey tuş kaybını çözmedi; #163 uygulamada odaklı
  resim alanının dört yönünü açıkça işler. Sağ/aşağı ardından sol/yukarı dönüşü test edilir.
- Ctrl/Meta testinde sentetik olayın tarayıcı varsayılanı platforma göre değişir. Test,
  uygulamadan sonra document üzerinde `defaultPrevented` değerini okuyup yalnız testin
  yerel varsayılan aksiyonunu durdurur; uygulamanın bağlantıyı engellemediği ölçülür.
- Yayın kabulünde JS dosyalarını tarayıcıdaki Origin başlığıyla da kontrol et. Headersız
  200, CORS cache varyantının da sağlam olduğunu kanıtlamaz. Dashboard URL purge, Origin
  varyantını temizlemeyebilir; tam dosya yolu prefix purge kullanıldı.
  [Cloudflare sınırlamaları](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-single-file/#resources-with-special-headers)
  ve [prefix biçimi](https://developers.cloudflare.com/cache/how-to/purge-cache/purge_by_prefix/).
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
