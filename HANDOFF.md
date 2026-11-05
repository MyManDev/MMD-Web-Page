# HANDOFF

> Güncel durum kaydı. Geçmiş git log'unda; protokol `docs/working-agreement.md` §7.

**Tarih:** 2026-11-05
**Yer:** yerel Windows çalışma alanı
**Aşama:** Üç sayfalı vitrin ve görsel iyileştirmeler yayında. Kaynak PR #150,
`6cc5388` ile `main`'e birleşti.

## Dal ve çalışma ağacı

- Kaynak #150; bu devir ve tasarım sözleşmesi ayrı doküman PR'ında.
- Yerel `pnpm gates`: **62 birim, 252 E2E**, 22 viewport atlaması.
- Son mobil düzeltme: 24 tekrarlı görüntüleyici testi; son CI'da 252 E2E geçti.
- En ağır sayfa `/projects`: **139.2 KiB / 150 KiB**. Ana sayfa 136.0, Team 137.0 KiB.
- #150 `gates`, `e2e`, `lighthouse` ve Cloudflare kontrolleri başarılı.
- İlk CI mobil büyütme ölçümü başarısızdı. Açık minimum genişlik, büyütmeye uygun
  `sizes` ve render edilmiş boyutu bekleyen kontrolle düzeltildi; test atlanmadı.
- İlgili #149 kapandı. Önceki sayfa ayrımı #147 ve imza #144'te tamamlandı.

## Sayfa sözleşmesi

- `/`: MyManDev, kısa ekip ve çalışma alanı anlatımı; varsayılan açılış.
- `/projects`: mevcut SquadOpt kartı, güncel görüntüler ve bağlantılar.
- `/team`: mevcut ekip kartları ve biyografiler.
- Hero / Who We Are / prensip destesi kaldırıldı. Menü gerçek sayfa bağlantıları ve
  `aria-current="page"` kullanır. Kalıcı layout nav/footer'ı; `SitePage` main'i taşır.
- Reveal gözlemcisini kalıcı layout'a taşıma: yeni route DOM'undan önce kurulursa metin
  gizli kalabiliyor. Sayfa içeriğiyle mount olması gezinme testinde doğrulanıyor.
- Sayfa girişleri ve kayan aktif menü çizgisi 200ms. Amblem zemine karışır; hafif ışığı
  yalnız açılışta 4 saniyede yerleşir. Reduced-motion altında hareket yoktur.
- Proje görüntüleri yerel dialog içinde açılır: Escape, odak dönüşü, yön tuşları,
  mobil kaydırma ve en az 1200px yakınlaştırma. Açıkken arka sayfa ve karusel durur.
- Team fotoğraflarında karartma %10, odak `center 65%`; metin perdesi %92 korunur.
- Sayfa metinleri, proje içeriği ve mavi-mor footer imzası korunuyor.

## Yayın

- Kanonik adres: `https://mymandev.com`; Cloudflare Pages projesi `mymandev`.
- Kaynak production deployment: `e1096fb6-00f9-4139-9423-af0db8acf5fc`, kaynak `6cc5388`.
- Son kaynak preview: `https://9e2d141d.mymandev.pages.dev`, PR head `ad3e473`.
- Canlı tarayıcı doğrulaması: 390×844 mobil görüntüleyici ve yakınlaştırma, Escape ile
  bağlantıya odak dönüşü, mobil menüden Team'e geçiş ve menünün kapanması; masaüstü
  Team ve ana sayfa. Kaydedilen tarayıcı hatası yok.
- Görsel karşılaştırma: `docs/review/polish-2026-11-05/`; önceki sayfa ve footer
  karşılaştırmaları kendi dizinlerinde korunuyor.

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
