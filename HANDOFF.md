# HANDOFF

> Bu dosya **şu anki durumu** tutar, geçmişi tutmaz — geçmiş git log'unda yaşar.
> Her devirde üzerine yazılır. Protokol: `docs/working-agreement.md` §7.

**Tarih:** 2026-08-30
**Yer:** ev
**Aşama:** 3 bitti — dört bölüm de `main`'de. Kalan her şey Faz 4: varlık, yayın ve iki karar.

## Dal ve çalışma ağacı

- Dal: `main` (`7eabcf8`)
- Commit'lenmemiş değişiklik: yok
- `pnpm gates` uçtan uca geçiyor; CI'da da yeşil (`gates` · `e2e` · `lighthouse`).
- Payload: **132.7 KiB / 150.0 KiB**, kalan pay 17.3 KiB.
- Test: **37 birim, 166 E2E** (22'si viewport'a göre atlanıyor).

## Açık PR'lar

**Yok.** Bugün on PR merge edildi (#50–#63) ve hiçbiri açık kalmadı.

Kapanan issue'lar: #8 #9 #12 #13 #14 #15 #16 #39 #55 #56.

Sayfada artık `01 Hero` · `02 Projects` · `03 Who we are` · `04 Team` ve footer var.

## Sıradaki tek iş

**`site.description` yazıldı ama yayınlanmıyor.**

`content/site.ts` bir SEO açıklaması taşıyor ve `content/schema.ts` onu **zorunlu** alan olarak
tutuyor (#15'te yazıldı). Ama `app/layout.tsx`'teki `metadata` nesnesi onu **hiç kullanmıyor** —
içinde `metadataBase`, `title` ve `alternates.canonical` var, `description` yok. Yani metin
depoda duruyor, HTML'e girmiyor.

Bu **#11'in artık engellenmemiş yarısı**: `description` için gereken tek şey #15'ti ve o kapandı.
Open Graph ve Twitter card hâlâ #18'i (OG görseli) bekliyor, ama `description` beklemiyor.

Yapılacak: `app/layout.tsx`'e `description: site.description` eklemek ve `tests/e2e/seo.spec.ts`'e
meta etiketin gerçekten üretildiğini doğrulayan bir test yazmak.

## Bitmemiş iş

- **#11 yarım.** `robots.txt`, `sitemap.xml`, canonical yayında (#42) ve `description` metni hazır
  ama bağlanmadı (yukarıda). OG ve Twitter card #18'e bağlı.
- **#57 — daktilo kararı verilmedi.** `components/sections/team/BioTypewriter.tsx` `design-spec.md`
  §6'da hâlâ **DENEME** işaretli. Karar gerçek fotoğraflarla verilecekti; fotoğraflar bugün geldi,
  yani engel kalktı. Kalırsa ibare kalkar, kalkarsa dosya silinir (−0.3 KiB).
- **#58 — `02 PROJECTS` etiketine karar verilmedi.** Hero, Who we are ve Projects etiket taşıyor,
  Team taşımıyor. Görsel kanıt issue'ya yorum olarak eklendi: "03 WHO WE ARE" ile "Who we are"
  aynı kelimeyi iki kez söylüyor. Kalkarsa `components/ui/SectionLabel.tsx` ve şemadaki zorunlu
  `nav[].number` alanı da düşer.
- **#54 — branch protection hâlâ uygulanmadı.** Ruleset `main protect` yalnızca `deletion` ve
  `non_fast_forward` içeriyor; §3'ün istediği beş maddenin hiçbiri yok. Hazırlanan payload
  uygulanamadı: `gh api --method PUT` çağrısı izin katmanı tarafından reddedildi. Uygulamak için
  ya depo ayarlarından elle, ya da `gh api` için Bash izni gerekiyor.
- **#19 Cloudflare depodan yapılamaz** — hesap ve DNS erişimi gerekiyor. **API token'ı gerekmiyor:**
  dashboard'dan "Connect to Git" GitHub App yetkisi kullanıyor. Token yalnızca CI'dan deploy
  edilirse gerekir.
- **Who we are'ın sağ yarısı geniş ekranda boş.** §3.4 tek kolon ve `65ch` istiyor ve uygulandı;
  ama o spec kapsayıcı 1180px iken yazılmıştı, `#51` ile 1600'e çıktı. Bir tercih değil,
  genişletmenin yan etkisi. Issue açılmadı.
- **Nav wordmark'ı tip ölçeği token'larında değil.** `components/sections/nav/Nav.tsx` içinde hâlâ
  `text-sm tracking-[0.08em]` satır içi duruyor; #46 diğer her şeyi token'lara taşırken bu satır
  atlanmış. Issue açılmadı.

## Alınan kararlar

Bugün alınan kalıcı kararlar `docs/architecture.md` §9'da: axe taramasının duragan halde koşması ve
Lighthouse'un üç koşunun medyanıyla raporlanması. Burada tekrar edilmiyor.

## Tuzaklar ve notlar

Bugün ölçümle bulunan, gözle bulunamayacak olanlar:

- **`animation-name: none` reduced-motion'da YETMİYOR.** Hareketi durduruyor ama **düzeni**
  bırakıyor: pinlenen prensipler mutlak konumda üst üste binip okunmaz oluyordu. Gelişmiş düzenin
  tamamı `prefers-reduced-motion: no-preference` kapısının **içinde** olmalı. Bu, deponun
  `animation-timeline: none` ile yaşadığı hatanın ikinci sürümü.
- **axe, scroll'a bağlı fade'in ortasına denk gelebiliyor.** Üst öğe opaklığını kontrast hesabına
  kattığı için Live Demo butonu 4.34 verdi; renkler `#149f90 / #1e2d2f` diye raporlandı ve ikisi de
  token değil — token'ların zemine karışmış hali. Dinlenme halinde aynı çift **5.51:1**. Tarama
  artık reduced-motion altında koşuyor ve taramadan önce hiçbir şeyin animasyon yapmadığını
  doğruluyor.
- **Lighthouse'un Accessibility skoru bu yüzden bizim kapımızdan düşük çıkabilir** (ölçüldü: 96).
  Kusur değil, ölçüm anı. `architecture.md` §8'de yazılı.
- **LCP'nin genliği eşiğin kendisinden büyük.** Gerçek CI verisi: medyan 2438ms, aralık
  1761–3253ms, genlik **1491ms**; eşik 2000ms. Bu sayıyı tek koşuya bakarak kovalamak ölçmeden
  düzeltmek olur.
- **`next/font` ilan edilen ağırlığı üretir, kullanılanı değil.** Devir kaydında tersi yazıyordu.
  Bayt değişmemesinin sebebi eleme değil, **Plex Sans'ın değişken font olması**: dört ağırlık da
  aynı altı `.woff2` dosyasını işaret ediyor. Ölçüm: her kuruluşta 169.888 byte.
- **`.next` önbelleği font ölçümünü yalanlıyor.** İki dal aynı sayıyı verdi; doğru sayılar ancak
  `rm -rf .next` sonrası çıktı.
- **Görsel hattı kırpmıyordu, esnetiyordu.** Kaynak ve hedef aynı orandayken görünmüyordu. Artık
  ortadan cover-crop yapıyor; düzeltme çıktıyı bayt bayt değiştirmedi (#50).
- **Hat genişliği kırpar, yüksekliği değil** (3/4 kaynak, 5/8 hedeften geniş). Yani portrenin dikey
  çerçevelemesi **kaynaktan gelir ve aşağıda düzeltilemez**. İbrahim'in fotoğrafı bu yüzden hatta
  girmeden önce 5/8'lik bir pencereye kırpıldı.
- **`scale` tekdüzeyken tarayıcı tek sayıya kısaltıyor:** açık halde `"1 1"` değil `"1"`. Dize
  karşılaştıran test düşer; yatay bileşen okunmalı.
- **`nav.spec.ts`'te `beforeEach` her `describe`'ın içinde**, dosya seviyesinde değil. Yeni bir
  describe eklerken unutulursa testler sayfaya hiç gitmez ve "eleman yok" diye düşer.
- **`pnpm preview` bir sunucudur, biten bir iş değil.** Arka planda başlatılıp durdurulmazsa
  birikiyor; bugün sekiz tane bulundu, en eskisi üç saatlik. Ölçüm scriptleri kendi sunucusunu
  açıp kapatmalı. `pkill -f "serve out"` eşleşmiyor — süreç `node.exe` olarak görünüyor.
- **Katkıcı listesi sorunu bu depoda YOK.** Ölçüldü: `main`'de gerçek trailer 0, contributors API
  iki gerçek kişi. Kalıntı yalnızca `refs/pull/*`'ta ve listeyi etkilemiyor. Sorun
  `football-squad-optimizer` deposundaydı; orada da API (`anon=1` dahil) üç gerçek kişi
  döndürüyor, yani kenar çubuğundaki dördüncü isim **bayat önbellek**. GitHub Support talebi
  kapatıldı — düzeltilecek kayıt olmadığı için yapabilecekleri bir şey yoktu.
- **Bu depoda `git add -A` kullanma**, dosyaları tek tek ekle.
- **Commit mesajlarına trailer yazılmaz** (`working-agreement.md` §3.2).
