import { expect, test, type Locator, type Page } from "@playwright/test";

import { projects } from "@/content";
import { CAPTION_STEP_MS } from "@/components/sections/projects/TypedCaption";
import { AUTO_ADVANCE_MS } from "@/lib/deck";

/**
 * Projects bolumu. docs/design-spec.md §3.3.1 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor ve Projects o
 * taramaya dahil; burada tekrarlanmiyor.
 *
 * Testler proje ADINA degil YAPIYA bagli: icerik dosyasi degistiginde
 * dusmesinler, bolum sozlesmesi bozuldugunda dussunler.
 */

const SECTION = "section#projects";

/* Icerikteki butun goruntuler, sayfadaki siralariyla: `projects` zaten
   `order`a gore sirali ve kartlar o sirayla basiliyor. */
const SCREENSHOTS = projects.flatMap((project) => project.screenshots);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

/**
 * Nav linklerinin dogru anchor'a isaret ettigi Bolge B'nin nav.spec.ts'inde
 * zaten olculuyor; burada tekrarlanmiyor. Bu testin sordugu sey bolumun kendi
 * sozlesmesi: id nav'in bekledigi id, ve landmark icinde dogru yerde.
 */
test("bolum main icinde ve nav'in bekledigi id ile duruyor", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();

  const inMain = await section.evaluate((el) => el.closest("main") !== null);
  expect(inMain).toBe(true);
});

test("bolum kendi basligina bagli ve baslik seviyesi atlanmiyor", async ({ page }) => {
  const section = page.locator(SECTION);

  const labelledby = await section.getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();

  const heading = page.locator(`#${labelledby}`);
  await expect(heading).toBeVisible();
  expect(await heading.evaluate((el) => el.tagName)).toBe("H2");
  await expect(heading).not.toBeEmpty();

  // #58: bolum kendi basligini tasiyor, proje adi bir alt seviyede.
  await expect(section.locator("h3")).toHaveCount(1);
  await expect(section.locator("h1")).toHaveCount(0);
});

test("tech tag'leri liste olarak diziliyor", async ({ page }) => {
  const tags = page.locator(`${SECTION} ul li`);
  await expect(tags).toHaveCount(4);
});

/**
 * Imza sayisinin ifadesi yazilmadi (#17). design-spec.md §3.3.1: metrics bossa
 * satir HIC render edilmez - bos cerceve, tire veya placeholder yok.
 */
/**
 * Imza ogesi. architecture.md §4.6, design-spec.md §3.3.1
 *
 * Metnin kendisi test edilmiyor - icerik dosyasi degistiginde test dusmemeli.
 * Olculen sey isaretleme sozlesmesi: gecerli bir tanim listesi, sayi ve etiket
 * eslesmis, ve placeholder yok.
 */
test("imza sayisi gecerli bir tanim listesi olarak render ediliyor", async ({ page }) => {
  const list = page.locator(`${SECTION} dl`);
  await expect(list).toHaveCount(1);

  const terms = list.locator("dt");
  const values = list.locator("dd");
  await expect(terms).toHaveCount(await values.count());
  await expect(values.first()).not.toBeEmpty();
  await expect(terms.first()).not.toBeEmpty();

  /*
    Placeholder tire yok (CLAUDE.md kural 6): eksik bir sayinin yerine "—"
    konmaz, satir hic render edilmez.

    Kontrol BOLUMUN TAMAMINDA degil, tanim listesinde. Once bolum geneline
    bakiyordu ve proje aciklamasi eklenince dustu - cumlenin icindeki uzun
    tire, noktalama isareti olarak. Test yanlis yeri olcuyordu: yasak olan sey
    metinde tire GECMESI degil, bir DEGERIN yerine tire konmasi.
  */
  await expect(list).not.toContainText("—");
});

/**
 * DOM sirasi dt -> dd (gecerli tanim listesi), gorsel sira sayi ustte.
 * Siralamayi CSS cozuyor; isaretlemeyi bozarak degil.
 */
test("sayi etiketin USTUNDE gorunuyor ama DOM'da altinda", async ({ page }) => {
  const pair = page.locator(`${SECTION} dl > div`).first();

  const order = await pair.evaluate((el) => {
    const term = el.querySelector("dt")!;
    const value = el.querySelector("dd")!;
    return {
      domTermFirst: term.compareDocumentPosition(value) === Node.DOCUMENT_POSITION_FOLLOWING,
      valueIsAbove: value.getBoundingClientRect().top < term.getBoundingClientRect().top,
    };
  });

  expect(order.domTermFirst).toBe(true);
  expect(order.valueIsAbove).toBe(true);
});

/**
 * SAYI ICERIKTEN: karuselde goruntulerin hepsi DOM'da (gorunmeyenler
 * `visibility: hidden`), yani sayfadaki <img> sayisi icerikteki goruntu
 * sayisina esit. Tek goruntude bugun oldugu gibi bir.
 */
test("ekran goruntuleri gercekten yukleniyor ve yerini onceden ayiriyor", async ({ page }) => {
  const images = page.locator(`${SECTION} figure img`);
  await expect(images).toHaveCount(SCREENSHOTS.length);

  for (const [i, screenshot] of SCREENSHOTS.entries()) {
    // Alt her goruntunun KENDI metni, ortak bir "X screenshot" degil - ve bos
    // degil (sema): dekoratif degil, gercek icerik (design-spec.md §7.5).
    await expect(images.nth(i)).toHaveAttribute("alt", screenshot.alt);

    // width/height HTML'de: goruntu inmeden once de oran biliniyor, CLS olusmuyor.
    await expect(images.nth(i)).toHaveAttribute("width", /^\d+$/);
    await expect(images.nth(i)).toHaveAttribute("height", /^\d+$/);
  }

  // Kayit var olmayan bir dosyaya isaret ediyorsa burada dusiyor. Gorunmeyen
  // slaytlar da iniyor: kutulari duruyor, `loading="lazy"` onlari da goruyor.
  await images.first().scrollIntoViewIfNeeded();
  for (let i = 0; i < SCREENSHOTS.length; i++) {
    await expect
      .poll(() =>
        images.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
  }
});

/**
 * BASLIK (design-spec.md §3.3.1): her goruntunun altinda icerikteki kendi
 * basligi, <figcaption> olarak. Sayi ve metin icerikten; tek goruntulu kartta
 * da ayni figur basiliyor.
 *
 * Olculen uc sey: metin icerikteki metin; figur adini basliktan aliyor (gorunen
 * ilk figurde - gizli slaytlar erisilebilirlik agacinda degil); ve baslik
 * goruntunun ALTINDA, cercevenin DISINDA.
 */
test("her goruntunun altinda icerikteki kendi basligi var", async ({ page }) => {
  const figures = page.locator(`${SECTION} figure`);
  await expect(figures).toHaveCount(SCREENSHOTS.length);
  for (const [i, screenshot] of SCREENSHOTS.entries()) {
    await expect(figures.nth(i).locator("img")).toHaveAttribute("alt", screenshot.alt);
    await expect(figures.nth(i).locator("figcaption")).toHaveText(screenshot.caption);
  }

  await expect(figures.first()).toHaveAccessibleName(SCREENSHOTS[0]?.caption ?? "");
  await figures.first().scrollIntoViewIfNeeded();
  const frame = await figures.first().locator("img").locator("..").boundingBox();
  const caption = await figures.first().locator("figcaption").boundingBox();
  expect(caption!.y).toBeGreaterThanOrEqual(frame!.y + frame!.height);
});

/**
 * HAYALET ARKA PLAN (design-spec.md §3.3.1): her kartin arkasinda kendi ekran
 * goruntulerinin soluk kopyasi; etkin olan gorunur. Susleme, bilgi degil:
 * `aria-hidden`, `alt=""`, figurle ayni aday listesi. Icerigin ARKASINDA ve
 * karti kapliyor - kartin dogrudan cocugu, karuselin icinde degil.
 */
test("her kartin arkasinda kendi goruntulerinin hayaleti var", async ({ page }) => {
  const cards = page.locator(`${SECTION} article`);
  for (const [i, project] of projects.entries()) {
    const card = cards.nth(i);
    const ghost = card.locator(":scope > [data-ghost]");
    await expect(ghost).toHaveCount(1);
    await expect(ghost).toHaveAttribute("aria-hidden", "true");

    const images = ghost.locator("img");
    const figures = card.locator("figure img");
    await expect(images).toHaveCount(project.screenshots.length);
    for (let slot = 0; slot < project.screenshots.length; slot++) {
      await expect(images.nth(slot)).toHaveAttribute("alt", "");
      // Figurle AYNI aday listesi ve AYNI `sizes`: tarayici ayni dosyayi secer.
      for (const name of ["src", "srcset", "sizes"]) {
        const expected = await figures.nth(slot).getAttribute(name);
        expect(expected).toBeTruthy();
        await expect(images.nth(slot)).toHaveAttribute(name, expected ?? "");
      }
    }
    await expect(ghost.locator("img[data-active]")).toHaveCount(1);
    await expect(images.first()).toHaveAttribute("data-active", "");

    const layout = await card.evaluate((el) => {
      const layer = el.querySelector(":scope > [data-ghost]") as HTMLElement;
      const a = el.getBoundingClientRect();
      const g = layer.getBoundingClientRect();
      return {
        isolation: getComputedStyle(el).isolation,
        zIndex: getComputedStyle(layer).zIndex,
        covers: g.left <= a.left && g.top <= a.top && g.right >= a.right && g.bottom >= a.bottom,
      };
    });
    expect(layout).toEqual({ isolation: "isolate", zIndex: "-10", covers: true });
  }
});

/**
 * Hayalet kartin disina tasiyor; bolum onu yatayda kirpiyor. Olculdu: kirpma
 * yokken sayfa 390px'te 28px, 1440px'te 16px yatay kayiyordu.
 */
test("hayalet arka plan sayfaya yatay tasma eklemiyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} [data-ghost]`).first()).toBeAttached();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

/**
 * Dikeyde de yerinde: hayalet ilk kartin ustunde bolum basligina, son kartin
 * altinda sonraki bolumun cizgisine binmiyor. Olculdu: 48px'lik tasmada dar
 * ekranda ikisine de 8px biniyordu (oradaki bosluklar 40px).
 *
 * Reduced-motion altinda olculuyor: metin girisi basligi 14px asagidan
 * getiriyor ve `getBoundingClientRect` o kaymayi da sayardi.
 *
 * Emulasyon stile BIR SONRAKI KAREDE yansiyor, yani hemen okunan stil eski
 * olabiliyor. Olculdu: baslik gecilip ekrana hic girmemisken `emulateMedia`
 * ardindan okunan `translate` hala `0px 14px`, 100ms sonra `none`. Bu yuzden
 * olcmeden once basligin kendi stili yeniden denenerek bekleniyor.
 */
test("hayalet arka plan basliga ve bolumun disina dikeyde tasmiyor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(`${SECTION} h2`)).toHaveCSS("translate", "none");
  await expect(page.locator(`${SECTION} [data-ghost]`).first()).toBeAttached();
  const gap = await page.locator(SECTION).evaluate((section) => {
    const ghosts = [...section.querySelectorAll("article > [data-ghost]")].map((el) =>
      el.getBoundingClientRect(),
    );
    const heading = section.querySelector("h2")!.getBoundingClientRect();
    const box = section.getBoundingClientRect();
    return {
      belowHeading: Math.min(...ghosts.map((g) => g.top)) - heading.bottom,
      insideSection: box.bottom - Math.max(...ghosts.map((g) => g.bottom)),
    };
  });
  expect(gap.belowHeading).toBeGreaterThanOrEqual(-0.5);
  expect(gap.insideSection).toBeGreaterThanOrEqual(-0.5);
});

/**
 * Hayalet ek indirme getirmiyor. Once sabit en kucuk varyanti istiyordu ve
 * yuksek DPR'de - karusel orada 1792'yi seciyor - her goruntu IKI KEZ iniyordu
 * (Pixel 7'de 123 KB fazla). Olculen iki sey: hayaletin sectigi dosya figurunku
 * ile ayni, ve sayfa her goruntuyu TEK bir genislikte istedi.
 *
 * Istekler Resource Timing'den okunuyor, istek dinleyicisinden degil: dinleyici
 * `goto`dan sonra baglanirdi ve o ana kadar inenleri kacirirdi.
 */
test("hayalet ek indirme getirmiyor, her goruntu tek genislikte iniyor", async ({ page }) => {
  const cards = page.locator(`${SECTION} article`);
  for (let i = 0; i < projects.length; i++) {
    const card = cards.nth(i);
    await card.locator("figure").first().scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluateAll((els) =>
            els.every(
              (el) =>
                (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);

    const ghosts = card.locator(":scope > [data-ghost] img");
    const figures = card.locator("figure img");
    const count = await figures.count();
    for (let slot = 0; slot < count; slot++) {
      const chosen = await figures.nth(slot).evaluate((el: HTMLImageElement) => el.currentSrc);
      expect(await ghosts.nth(slot).evaluate((el: HTMLImageElement) => el.currentSrc)).toBe(chosen);
    }
  }

  const files = await page.evaluate(() => [
    ...new Set(
      performance
        .getEntriesByType("resource")
        .map((entry) => new URL(entry.name).pathname)
        .filter((path) => /^\/projects\/.+-\d+\.webp$/.test(path)),
    ),
  ]);
  const bases = files.map((path) => path.replace(/-\d+\.webp$/, ""));
  expect(bases.length).toBeGreaterThan(0);
  expect(bases.length, files.join(", ")).toBe(new Set(bases).size);
});

test("srcset iki genisligi de sayiyor ve sizes yazili", async ({ page }) => {
  const images = page.locator(`${SECTION} figure img`);
  for (let i = 0; i < SCREENSHOTS.length; i++) {
    await expect(images.nth(i)).toHaveAttribute("srcset", /-896\.webp 896w/);
    await expect(images.nth(i)).toHaveAttribute("srcset", /-1792\.webp 1792w/);
    await expect(images.nth(i)).toHaveAttribute("sizes", /.+/);
  }
});

/**
 * Asil olcum: tarayici HANGI dosyayi indirdi. srcset'in yazili olmasi onu
 * kullanildigi anlamina gelmiyor - yanlis bir `sizes` ile her cihaz en buyugu
 * indirir ve hicbir sey hata vermez.
 *
 * Beklenen secim cihazin piksel yogunlugundan cikiyor, viewport genisliginden
 * degil - ve ikisi burada ters yonde calisiyor:
 *   desktop  1280px, DPR 1     -> gorsel kutusu ~700px -> 896 yetiyor
 *   mobil     412px, DPR 2.625 -> 372 * 2.625 = 977px  -> 1792 gerekiyor
 * Yani dar viewport DAHA BUYUK dosyayi aliyor, ve dogrusu bu.
 */
test("tarayici cihaza uyan varyanti indiriyor", async ({ page }, testInfo) => {
  const image = page.locator(`${SECTION} figure img`).first();
  await image.scrollIntoViewIfNeeded();

  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const expected = dpr > 1.5 ? "-1792.webp" : "-896.webp";

  await expect
    .poll(() => image.evaluate((el: HTMLImageElement) => el.currentSrc))
    .toContain(expected);

  // Kaynak goruntuler servis edilmiyor - assets/ altinda, public/ degil. Adlari
  // icerikten turetiliyor: `<taban>-1792.webp`in kaynagi `<taban>.webp`.
  for (const { src } of SCREENSHOTS) {
    const source = src.replace(/-\d+\.webp$/, ".webp");
    const response = await page.request.get(source);
    expect(response.status(), `${testInfo.project.name}: ${source} yayinlanmis`).toBe(404);
  }
});

/**
 * Metin girisi. design-spec.md §6 ve §6.1
 *
 * TETIKLEYICI `IntersectionObserver` ve bu bir kural degisikligiydi
 * (CLAUDE.md kural 3 genisletildi). Once `animation-timeline: view()` ile
 * yazildi: o hareket scroll KONUMUNA bagli oldugu icin scroll durunca donuyor
 * ve "yazi geldi" hissi vermiyordu.
 *
 * Hareketin kendisi olculmuyor - hangi karede oldugu kirilgan olurdu. Olculen
 * sey SOZLESME: isaret konuyor mu, bir kez mi oynuyor, ve hareket
 * calismadigi her durumda icerik GORUNUR mu.
 */
test.describe("metin girisi", () => {
  const REVEAL = `${SECTION} .reveal-on-enter`;

  test("her metin blogu ayri ayri, zeminin kendisi degil", async ({ page }) => {
    expect(await page.locator(REVEAL).count()).toBeGreaterThan(1);

    const sectionIsTarget = await page
      .locator(SECTION)
      .evaluate((el) => el.classList.contains("reveal-on-enter"));
    expect(sectionIsTarget).toBe(false);
  });

  /** JS burada ve hareket isteniyorsa isaret `<html>`de. */
  test("hareket isteniyorsa isaret konuyor", async ({ page }) => {
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.reveal !== undefined))
      .toBe(true);
  });

  /**
   * ASAGI INERKEN oynar. Once gizli, ekrana girince isaretlenir ve tam gorunur
   * hale gelir.
   */
  test("ekrana girince beliriyor", async ({ page }) => {
    const target = page.locator(`${SECTION} .reveal-on-enter`).last();
    await expect
      .poll(() => target.evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeLessThan(0.99);

    await target.scrollIntoViewIfNeeded();

    await expect
      .poll(() => target.evaluate((el) => el.dataset.revealShown !== undefined))
      .toBe(true);
    await expect.poll(() => target.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  /**
   * YUKARI KAYDIRIRKEN OYNAMAZ - istek buydu, "cift tarafli olmasin". Observer
   * isaretledigi ogeyi birakiyor (`unobserve`), yani ayni metin ikinci kez
   * "gelirken" gorunmuyor.
   */
  test("yukari donunce tekrar oynamiyor", async ({ page }) => {
    const target = page.locator(`${SECTION} .reveal-on-enter`).last();
    await target.scrollIntoViewIfNeeded();
    await expect.poll(() => target.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await target.scrollIntoViewIfNeeded();

    /* Bekleme YOK ve bu kasitli: tekrar oynasaydi bu anda opacity 1'in altinda
       olurdu. Poll etmek hatayi gizlerdi. */
    expect(await target.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  /**
   * EN ONEMLI TEST: hareket calismadiginda icerik GORUNMEZ kalmamali.
   * reduced-motion altinda JS isareti hic koymuyor, yani gizleyen kural hic
   * uygulanmiyor - bir animasyonun "sifir sureye inmesi" degil, hic
   * baslamamasi.
   */
  test("reduced-motion altinda hicbir sey gizlenmiyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForTimeout(400);

    const state = await page.evaluate(() => {
      const targets = [...document.querySelectorAll(".reveal-on-enter")];
      return {
        armed: document.documentElement.dataset.reveal !== undefined,
        total: targets.length,
        hidden: targets.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length,
      };
    });

    expect(state.armed).toBe(false);
    expect(state.total).toBeGreaterThan(1);
    expect(state.hidden).toBe(0);
  });
});

/**
 * SIRA NUMARASI. design-spec.md §3.3, architecture.md §9
 *
 * #58 bolum numaralarini kaldirmisti; bu onu KISMEN geri aliyor - yalnizca
 * proje kartinin sirasi.
 *
 * Deger `index`ten turetiliyor, elle yazilmiyor. Test de bunu olcuyor: birinci
 * kartta "01" ve numara sayisi kart sayisina esit.
 */
test("her kart sira numarasi tasiyor ve numara turetilmis", async ({ page }) => {
  const cards = page.locator(`${SECTION} article`);
  const numbers = page.locator(`${SECTION} article > div > p.text-mono`).first();

  await expect(numbers).toHaveText("01");

  /* Sayi KART SAYISINDAN turetiliyor: sabit bir 1 yazmak ikinci proje
     eklendiginde davranis bozulmadigi halde duserdi. */
  const count = await cards.count();
  await expect(page.locator(`${SECTION} article > div > p.text-mono`)).toHaveCount(count);
});

/**
 * Numara EKRAN OKUYUCUYA OKUNMAZ. Sira bilgisi DOM sirasinda zaten var;
 * "sifir bir Football Squad Optimizer" diye okumak baslikin adini kirletirdi.
 */
test("sira numarasi erisilebilir ada karismiyor", async ({ page }) => {
  const number = page.locator(`${SECTION} article > div > p.text-mono`).first();
  await expect(number).toHaveAttribute("aria-hidden", "true");

  const heading = page.locator(`${SECTION} article h3`).first();
  const name = await heading.evaluate((el) => el.textContent?.trim() ?? "");
  expect(name).not.toMatch(/^0\d/);
});

/**
 * TEK PROJEDE YIGIN UYGULANMAZ (§3.3.2). Yigin yalnizca ikinci proje
 * eklendiginde devreye girer; bugun `total === 1`.
 *
 * Bu test yigini olcmuyor - olcemez, cunku icerikte tek proje var. Olctugu sey
 * TEK PROJE SOZLESMESI: sticky yok, viewport yuksekligi yok, z-index yok.
 * Yigin davranisi yerel bir gecici kayitla olculdu ve videoya alindi; ikinci
 * proje eklendigi gun buraya gercek bir test yazilir.
 */
test("tek projede sticky yigin uygulanmiyor", async ({ page }) => {
  const cards = page.locator(`${SECTION} article`);
  test.skip((await cards.count()) > 1, "yigin aktif - bu test tek proje sozlesmesini olcuyor");

  const style = await cards.first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { position: cs.position, minHeight: cs.minHeight, zIndex: cs.zIndex };
  });

  // `relative`, `static` degil: hayalet arka plan kartin kutusuna gore
  // konumlaniyor (ScreenshotGhost.tsx). Olculen sey yiginin YOKLUGU: sticky yok.
  expect(style.position).toBe("relative");
  expect(style.zIndex).toBe("auto");
  expect(["0px", "auto"]).toContain(style.minHeight);
});

/**
 * METRIK SATIRI - uc kisit. architecture.md §4.6 (karar sahibi tarafindan
 * degistirildi), design-spec.md §3.3.1
 *
 * Beklenen sayi ICERIKTEN turetiliyor, elle yazilmiyor: metrik listesi
 * degistiginde test degeri kendisi takip ediyor.
 */
test("metrik satiri icerikteki kisitlari basiyor", async ({ page }) => {
  const expected = projects[0]?.metrics ?? [];
  expect(expected.length).toBeGreaterThan(0);

  const values = page.locator(`${SECTION} dl dd`);
  await expect(values).toHaveCount(expected.length);
  expect(await values.allTextContents()).toEqual(expected.map((metric) => metric.value));
});

/**
 * IMZA SAYISI KALDIRILDI ve bu onun kapisi. §4.6 bir zamanlar
 * `0 - ML models promoted to production` satirini imza oge olarak seciyordu;
 * karar sahibi uc kisitla degistirdi. Ibarenin sessizce geri donmesi kararin
 * uygulanmadigi anlamina gelir.
 */
test("eski imza sayisi sayfada kalmadi", async ({ page }) => {
  const text = await page.locator(SECTION).innerText();
  expect(text).not.toMatch(/ML models promoted/i);
});

/**
 * SAYFA SONUNA KADAR KAYDIRILDIGINDA GIZLI HICBIR SEY KALMAZ.
 *
 * Bu testin varlik sebebi olculmus bir hata: gozlemciye `rootMargin:
 * "0px 0px -12% 0px"` yaziliydi ve o negatif alt marj BELGENIN SON %12'SINDE
 * bir olu bolge yaratiyordu - orada duran ogeler hic kesismiyor, isaret
 * almiyor ve gizleyen kural sonsuza kadar uygulaniyordu. Canli sitede
 * footer'in UC metin blogu da gorunmezdi.
 *
 * Test sayfanin TAMAMINI tariyor, tek bir bolumu degil: hata bolume ozel
 * degildi, "en altta olmak"la ilgiliydi. Ve `poll` ediyor cunku gozlemci
 * asenkron.
 */
test("sayfa sonuna kadar kaydirilinca gizli kalan metin yok", async ({ page }) => {
  /*
    KADEMELI iniyor, tek hamlede atlamiyor - ve bu bir duzeltme. Ilk yazimda
    dogrudan `scrollTo(bottom)` vardi ve test kararsizdi: bir hamlede atlamak
    ARADA KALAN bolumleri atliyor, o ogeler hic kesismiyor ve gizli kaliyor.
    Yani test bazen kendi olcum yontemi yuzunden dusuyordu, urun yuzunden degil.

    Gercek kullanici da oyle inmiyor. Kademeli inmek hem daha durust hem de
    kararli.
  */
  const step = await page.evaluate(() => Math.round(window.innerHeight * 0.6));
  const total = await page.evaluate(() => document.documentElement.scrollHeight);

  for (let y = 0; y <= total; y += step) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll(".reveal-on-enter")].filter(
              (el) => Number(getComputedStyle(el).opacity) < 0.99,
            ).length,
        ),
      { timeout: 5000 },
    )
    .toBe(0);
});

test("16/10 oraninda ve tasmiyor", async ({ page }) => {
  const box = await page.locator(`${SECTION} figure img`).first().boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width / box!.height).toBeCloseTo(1.6, 1);
});

/**
 * design-spec.md §2.1 ve §7.5: dis linkte gorunur ikon, ama ikon bilgi
 * TASIMAZ - tekrarlar. Bu yuzden iki sey birden olculuyor: ikon var, ve
 * erisilebilir ad hala yalnizca metinden geliyor.
 */
test("dis link aksiyonlari gorunur ikon tasiyor, erisilebilir ad degismiyor", async ({ page }) => {
  const section = page.locator(SECTION);

  for (const name of ["GitHub", "Live Demo"]) {
    const link = section.getByRole("link", { name });
    await expect(link).toHaveCount(1);

    const icon = link.locator('svg[aria-hidden="true"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toBeVisible();

    // currentColor: ikonun kendi rengi yok, zeminin metin rengini aliyor.
    const [iconColor, linkColor] = await link.evaluate((el) => [
      getComputedStyle(el.querySelector("svg")!).color,
      getComputedStyle(el).color,
    ]);
    expect(iconColor).toBe(linkColor);
  }
});

test("iki aksiyon da yeni sekmede ve rel guvenli", async ({ page }) => {
  const section = page.locator(SECTION);

  for (const name of ["GitHub", "Live Demo"]) {
    const link = section.getByRole("link", { name });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
});

/**
 * Yesil disiplini (§5.1): Projects bolumunun TEK yesil odagi Live Demo'nun
 * primary zemini. Proje adi, Tag'ler ve GitHub aksiyonu yesil degil.
 * Yazili kural yerine olculen kural - footer.spec.ts ile ayni yaklasim.
 */
test("bolumdeki tek accent kullanimi Live Demo'nun zemini", async ({ page }) => {
  const users = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accentRgb = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*"))
      .filter((el) => {
        const style = getComputedStyle(el);
        return (
          style.color === accentRgb ||
          style.backgroundColor === accentRgb ||
          style.borderTopColor === accentRgb ||
          style.borderRightColor === accentRgb ||
          style.borderBottomColor === accentRgb ||
          style.borderLeftColor === accentRgb
        );
      })
      .map((el) => (el.textContent ?? "").trim());
  });

  expect(users).toEqual(["Live Demo"]);
});

/**
 * §3.3.2: yigin ikinci proje eklendiginde devreye girer. V1'de total === 1,
 * yani sticky HIC uygulanmamali ve kap normal akista kalmali.
 */
test("tek projede yigin devreye girmiyor", async ({ page }) => {
  const position = await page
    .locator(`${SECTION} article`)
    .evaluate((el) => getComputedStyle(el).position);
  expect(position).not.toBe("sticky");
});

/**
 * Cip ile gelen gezinmede bolum basligi sticky navbar'in ALTINDA kalmamali.
 *
 * Beklenen deger SABIT YAZILMIYOR, token'dan turetiliyor. Onceden "88px" /
 * "80px" diye elle yazilmisti ve nav yuksekligi degisince test, davranis
 * bozulmadigi halde dustu - yani gercek sozlesmeyi degil o gunku sayiyi
 * tutuyordu. Olculen sey artik su: pay, nav yuksekligi + 24px.
 */
test("sticky navbar bolum basligini kapatmiyor", async ({ page }) => {
  const { margin, navHeight } = await page.locator(SECTION).evaluate((el) => ({
    margin: parseFloat(getComputedStyle(el).scrollMarginTop),
    navHeight: parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
    ),
  }));

  expect(navHeight).toBeGreaterThan(0);
  expect(margin).toBe(navHeight + 24);
});

test("mobilde tek kolon, lg ustunde 12 kolonluk izgara", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const columns = await page
    .locator(`${SECTION} article`)
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(columns.split(" ")).toHaveLength(width >= 1024 ? 12 : 1);
});

/**
 * EKRAN GORUNTUSU KARUSELI. design-spec.md §3.3.1
 *
 * Testler SAYIDAN BAGIMSIZ, #105'teki takim testleriyle ayni yol: karusel
 * yalnizca birden fazla goruntusu olan bir projede cizilir. Ilk test HER ZAMAN
 * kosuyor ve her kart icin kendi yonunu olcuyor: tek goruntulu kartta karusel
 * YOK, cok goruntulude VAR. Icerikte yalnizca tek goruntulu kart varken
 * yalnizca ilk yon kosar. Digerleri cok goruntulu bir proje yoksa atlaniyor;
 * icerige ilk ikinci goruntu girdigi gun kendiliginden kosmaya basliyorlar.
 *
 * Sorgular YAPIYA bagli: rol (`carousel`, `slide`) ve tusun erisilebilir adi.
 * Sinif adiyla sorgulamak yeniden adlandirmada testi sessizce kor birakirdi
 * (a11y.spec.ts'teki ders).
 */
const CAROUSEL = '[aria-roledescription="carousel"]';
const SLIDE = '[aria-roledescription="slide"]';
const MULTI = projects.findIndex((project) => project.screenshots.length > 1);
const SHOTS = projects[MULTI]?.screenshots ?? [];
const NO_CAROUSEL = "icerikte birden fazla goruntulu proje yok";

const pad = (value: number) => String(value).padStart(2, "0");
const carouselOf = (page: Page) => page.locator(`${SECTION} article`).nth(MULTI).locator(CAROUSEL);

test("karusel yalnizca birden fazla goruntulu projede ciziliyor", async ({ page }) => {
  const cards = page.locator(`${SECTION} article`);
  await expect(cards).toHaveCount(projects.length);

  for (const [i, project] of projects.entries()) {
    const expected = project.screenshots.length > 1 ? 1 : 0;
    await expect(cards.nth(i).locator(CAROUSEL)).toHaveCount(expected);
    // DOM'da sayiliyor, gorunurlukte degil: tek goruntude tuslar gorunmez halde
    // de basilmamali - gidilecek ikinci goruntu yok.
    await expect(cards.nth(i).locator('button[aria-label$=" screenshot"]')).toHaveCount(
      expected * 2,
    );
  }
});

test.describe("ekran goruntusu karuseli", () => {
  test.skip(MULTI < 0, NO_CAROUSEL);

  test("karusel, her goruntu icin bir slayt ve tek gorunur slayt", async ({ page }) => {
    const carousel = carouselOf(page);
    await expect(carousel).toHaveAttribute("role", "group");
    await expect(carousel).toHaveAttribute("aria-label", `${projects[MULTI]?.name} screenshots`);

    const slides = carousel.locator(SLIDE);
    await expect(slides).toHaveCount(SHOTS.length);
    for (let i = 0; i < SHOTS.length; i++) {
      await expect(slides.nth(i)).toHaveAttribute("role", "group");
      await expect(slides.nth(i)).toHaveAttribute("aria-label", `${i + 1} of ${SHOTS.length}`);
    }

    await expect(slides.filter({ visible: true })).toHaveCount(1);
    await expect(slides.first()).toBeVisible();

    // Tusa basildiginda odak tusta kaliyor; degisen goruntuyu canli bolge duyuruyor.
    await expect(carousel.locator('[aria-live="polite"]')).toHaveCount(1);
  });

  test("hidrasyondan sonra tuslar gorunur ve sayac ilk goruntude", async ({ page }) => {
    const carousel = carouselOf(page);
    await expect(carousel.getByRole("button", { name: "Next screenshot" })).toBeVisible();
    await expect(carousel.getByRole("button", { name: "Previous screenshot" })).toBeVisible();
    await expect(carousel.locator("p")).toHaveText(`01 / ${pad(SHOTS.length)}`);
  });

  /**
   * Giden slaytin BASLIGI beklemeden soner (design-spec.md §3.3.1): zemini yok,
   * altta kalsaydi yeni baslikla ust uste okunurdu. Olculen sey sozlesme: durgun
   * halde gizli slaytin basligi opaklik 0, basligin gecisi gecikmesiz. Slaytin
   * kendisi gelenin suresi kadar bekliyor (asagidaki test), baslik beklemiyor.
   */
  test("giden basligin gecisi beklemiyor", async ({ page }) => {
    const slides = carouselOf(page).locator(SLIDE);
    const captionStyle = (i: number) =>
      slides
        .nth(i)
        .locator("figcaption")
        .evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            opacity: cs.opacity,
            delay: Math.max(...cs.transitionDelay.split(",").map(parseFloat)),
            duration: Math.max(...cs.transitionDuration.split(",").map(parseFloat)),
          };
        });

    const shown = await captionStyle(0);
    const hidden = await captionStyle(1);
    expect(shown.opacity).toBe("1");
    expect(hidden.opacity).toBe("0");
    expect(hidden.delay).toBe(0);
    expect(hidden.duration).toBeGreaterThan(0);
  });

  /**
   * Hayaletin gecisi karuselinkiyle AYNI surede (ScreenshotGhost.tsx). Sure iki
   * sinif dizisinde ayri yaziliyor; esitligi bu test tutuyor. Reduced-motion
   * altinda hic yok.
   */
  test("hayaletin gecisi karuselle ayni surede, reduced-motion altinda hic yok", async ({
    page,
  }) => {
    const duration = (locator: Locator) =>
      locator.evaluate((el) =>
        Math.max(...getComputedStyle(el).transitionDuration.split(",").map(parseFloat)),
      );
    const slide = carouselOf(page).locator(SLIDE).first();
    const ghost = page
      .locator(`${SECTION} article`)
      .nth(MULTI)
      .locator(":scope > [data-ghost] img")
      .first();

    const expected = await duration(slide);
    expect(expected).toBeGreaterThan(0);
    expect(await duration(ghost)).toBe(expected);

    // Emulasyon bir sonraki karede yansiyor: yeniden denenerek okunuyor.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => duration(ghost)).toBeLessThan(0.001);
  });

  /**
   * Capraz sonumleme: gelen slayt USTTE beliriyor, giden onun suresi kadar
   * ALTTA kalip tek adimda kayboluyor. Olculen sey SAYI DEGIL ILISKI - sure
   * degisirse test takip etmeli, ama giden slaytin bekledigi sure gelenin
   * suresinden farkli olursa arada zemin parlar ve test dusmeli.
   *
   * Reduced-motion altinda gecis HIC yok (CLAUDE.md kural 10): ne sure ne
   * gecikme. Gecikme kalsaydi giden slayt gorunur kalirdi (design-spec.md §6.1).
   */
  test("gecis capraz sonumleme, reduced-motion altinda hic yok", async ({ page }) => {
    const slides = carouselOf(page).locator(SLIDE);
    const timing = (i: number) =>
      slides.nth(i).evaluate((el) => {
        const cs = getComputedStyle(el);
        const longest = (value: string) => Math.max(...value.split(",").map(parseFloat));
        return {
          duration: longest(cs.transitionDuration),
          delay: longest(cs.transitionDelay),
          zIndex: cs.zIndex,
        };
      });

    const incoming = await timing(0);
    const outgoing = await timing(1);
    expect(incoming.duration).toBeGreaterThan(0);
    expect(incoming.delay).toBe(0);
    expect(outgoing.duration).toBe(0);
    expect(outgoing.delay).toBe(incoming.duration);
    // Etkin slayt ustte: geri gezinmede ve basa sarmada gelen slayt DOM'da
    // gidenden ONCE duruyor ve z-index olmadan onun altinda kalirdi.
    expect(Number(incoming.zIndex)).toBeGreaterThan(0);
    expect(outgoing.zIndex).toBe("auto");

    // Emulasyon bir sonraki karede yansiyor: once sure yeniden denenerek
    // bekleniyor, gecikme ayni stil hesabinda geliyor.
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (let i = 0; i < SHOTS.length; i++) {
      await expect.poll(async () => (await timing(i)).duration).toBeLessThan(0.001);
      expect((await timing(i)).delay).toBe(0);
    }
  });
});

/**
 * Tuslara BASAN testler reduced-motion altinda, destenin testleriyle ayni
 * gerekceyle (who-we-are.spec.ts): smooth scroll ve reveal animasyonu altinda
 * Playwright'in ilk tiklamasi bosa dusebiliyor. Gecisin kendisi yukarida,
 * normal yolda olculuyor.
 */
test.describe("ekran goruntusu karuseli - gezinme", () => {
  test.skip(MULTI < 0, NO_CAROUSEL);

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  /**
   * Sayac ile gorunen goruntu BIRLIKTE degisiyor. Yalnizca sayaci olcmek
   * yetmez: sayac artip goruntu sabit kalsaydi test yine gecerdi.
   */
  test("ileri ve geri tusu goruntuyu ve sayaci birlikte degistiriyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const shown = carousel.locator(SLIDE).filter({ visible: true });
    const counter = carousel.locator("p");

    await carousel.getByRole("button", { name: "Next screenshot" }).click();
    await expect(counter).toHaveText(`02 / ${pad(SHOTS.length)}`);
    await expect(shown).toHaveCount(1);
    await expect(shown.locator("img")).toHaveAttribute("alt", SHOTS[1]?.alt ?? "");

    await carousel.getByRole("button", { name: "Previous screenshot" }).click();
    await expect(counter).toHaveText(`01 / ${pad(SHOTS.length)}`);
    await expect(shown.locator("img")).toHaveAttribute("alt", SHOTS[0]?.alt ?? "");
  });

  test("baslik goruntuyle birlikte degisiyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const slides = carousel.locator(SLIDE);
    await expect(slides.nth(0).locator("figcaption")).toBeVisible();
    await expect(slides.nth(1).locator("figcaption")).toBeHidden();

    await carousel.getByRole("button", { name: "Next screenshot" }).click();
    await expect(slides.nth(1).locator("figcaption")).toBeVisible();
    await expect(slides.nth(1).locator("figcaption")).toHaveText(SHOTS[1]?.caption ?? "");
    await expect(slides.nth(0).locator("figcaption")).toBeHidden();
  });

  /**
   * Hayalet gorunen goruntuyle birlikte degisiyor. Opaklik YENIDEN DENENEREK
   * okunuyor: reduced-motion altinda da 0.01ms'lik bir gecis olusuyor (global
   * blok `transition-duration`i kisaltiyor, `transition-property` `all`da
   * kaliyor) ve tek seferlik bir okuma degisimin hemen ardindan eski degeri
   * gorebiliyordu - CI'da boyle dustu.
   */
  test("hayalet arka plan goruntuyle birlikte degisiyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const ghost = page
      .locator(`${SECTION} article`)
      .nth(MULTI)
      .locator(":scope > [data-ghost] img");
    await carousel.getByRole("button", { name: "Next screenshot" }).click();

    await expect(ghost.nth(1)).toHaveAttribute("data-active", "");
    await expect(ghost.nth(0)).not.toHaveAttribute("data-active");
    await expect(ghost.nth(1)).toHaveCSS("opacity", "1");
    await expect(ghost.nth(0)).toHaveCSS("opacity", "0");
  });

  test("iki uctan basa sariyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const counter = carousel.locator("p");

    await carousel.getByRole("button", { name: "Previous screenshot" }).click();
    await expect(counter).toHaveText(`${pad(SHOTS.length)} / ${pad(SHOTS.length)}`);
    await expect(carousel.locator(SLIDE).last()).toBeVisible();

    await carousel.getByRole("button", { name: "Next screenshot" }).click();
    await expect(counter).toHaveText(`01 / ${pad(SHOTS.length)}`);
    await expect(carousel.locator(SLIDE).first()).toBeVisible();
  });

  /**
   * Slaytlar ayni hucrede ust uste: kap TEK bir slayt boyunda (goruntu ve en
   * uzun baslik) ve gezinirken ne kap ne tus oynuyor. Ilk yarisi sart - ikinci
   * yari tek basina bos gecerdi, cunku slaytlar alt alta dizilse de hepsi DOM'da
   * duruyor ve kutular yine sabit kaliyor.
   */
  test("kap tek slayt boyunda, gezinirken kap ve tuslar oynamiyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const next = carousel.getByRole("button", { name: "Next screenshot" });
    const slides = carousel.locator(SLIDE);
    const frame = slides.first().locator("..");

    await next.scrollIntoViewIfNeeded();
    const first = await slides.first().boundingBox();
    for (let i = 1; i < SHOTS.length; i++) {
      expect(await slides.nth(i).boundingBox()).toEqual(first);
    }
    // Yuvarlama payi disinda yukseklik tek slayt kadar.
    const frameBox = await frame.boundingBox();
    expect(Math.abs((frameBox?.height ?? 0) - (first?.height ?? 0))).toBeLessThanOrEqual(2);

    const before = { next: await next.boundingBox(), frame: frameBox };
    for (let i = 0; i < SHOTS.length; i++) {
      await next.click();
      expect(await next.boundingBox()).toEqual(before.next);
      expect(await frame.boundingBox()).toEqual(before.frame);
    }
  });
});

/**
 * OTOMATIK GECIS (§3.3.1): destenin kancasi (lib/deck.ts), destenin kurallari.
 * who-we-are.spec.ts ayni sozlesmeyi desteye karsi GERCEK saatle olcuyor; burada
 * Playwright'in sahte saati kullaniliyor, yani aralik beklenmeden ilerletiliyor
 * ve testler `AUTO_ADVANCE_MS` ne olursa olsun ayni hizda kosuyor. Aralik
 * turetiliyor, elle yazilmiyor.
 *
 * Bu blok reduced-motion ALTINDA DEGIL, cunku olculen sey hareketin kendisi;
 * reduced-motion'daki davranis ayri bir testte olculuyor.
 *
 * Gecisten sonra GORUNUR SLAYT SAYISI SAYILMIYOR ve bu olculerek secildi: gecisin
 * ilk karesinde gelen slayt henuz gizli, giden gorunur - yani "tek gorunur
 * slayt" iddiasi bir an ESKI durum icin dogru cikiyor ve test yanlis sebeple
 * geciyordu. Gecis boyunca iki slayt birlikte gorunur (capraz sonumleme). Bu
 * yuzden slaytlar adiyla soruluyor: gelen gorunur, giden gizli.
 */
test.describe("ekran goruntusu karuseli - otomatik gecis", () => {
  test.skip(MULTI < 0, NO_CAROUSEL);

  /* Saat sayfa YUKLENMEDEN ONCE durduruluyor. `install` tek basina sahte saati
     gercek zamanla birlikte akitiyor; hidrasyondan sonra durdurmak da yetmiyordu,
     cunku ilk zamanlayici hidrasyonda, saat hala akarken kuruluyordu. Durmus
     saatte zamani yalnizca `runFor` ilerletiyor ve sonuc makinenin hizina bagli
     degil. */
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await page.reload();
    await expect(carouselOf(page).getByRole("button", { name: "Next screenshot" })).toBeVisible();
  });

  const counterOf = (page: Page) => carouselOf(page).locator("p");

  /** Sayac ile gorunen goruntu BIRLIKTE ilerliyor. */
  test("kendiliginden ilerliyor", async ({ page }) => {
    const slides = carouselOf(page).locator(SLIDE);
    await expect(counterOf(page)).toHaveText(`01 / ${pad(SHOTS.length)}`);
    await page.clock.runFor(AUTO_ADVANCE_MS);

    await expect(counterOf(page)).toHaveText(`02 / ${pad(SHOTS.length)}`);
    await expect(slides.nth(1)).toBeVisible();
    await expect(slides.nth(0)).toBeHidden();
    await expect(slides.nth(1).locator("img")).toHaveAttribute("alt", SHOTS[1]?.alt ?? "");
  });

  /** Her ara adim dogrulaniyor: yalnizca sondaki "01" bakilsaydi, hic
      ilerlemeyen bir deste de testi gecerdi. */
  test("sondan sonra basa sariyor", async ({ page }) => {
    for (let step = 1; step <= SHOTS.length; step++) {
      await page.clock.runFor(AUTO_ADVANCE_MS);
      await expect(counterOf(page)).toHaveText(
        `${pad((step % SHOTS.length) + 1)} / ${pad(SHOTS.length)}`,
      );
    }
  });

  /** Goruntuyu inceleyen biri icin: fare uzerindeyken kare degismiyor. */
  test("fare uzerindeyken duruyor, cekilince suruyor", async ({ page }) => {
    await carouselOf(page).locator(SLIDE).first().hover();
    await page.clock.runFor(AUTO_ADVANCE_MS * 2);
    await expect(counterOf(page)).toHaveText(`01 / ${pad(SHOTS.length)}`);

    await page.mouse.move(0, 0);
    await page.clock.runFor(AUTO_ADVANCE_MS);
    await expect(counterOf(page)).toHaveText(`02 / ${pad(SHOTS.length)}`);
  });

  test("iceriye odak dusunce duruyor, cikinca kaldigi yerden suruyor", async ({ page }) => {
    const next = carouselOf(page).getByRole("button", { name: "Next screenshot" });
    await next.focus();
    await page.clock.runFor(AUTO_ADVANCE_MS * 2);
    await expect(counterOf(page)).toHaveText(`01 / ${pad(SHOTS.length)}`);

    await next.blur();
    await page.clock.runFor(AUTO_ADVANCE_MS);
    await expect(counterOf(page)).toHaveText(`02 / ${pad(SHOTS.length)}`);
  });

  /**
   * Elle yapilan adimdan sonra sure SIFIRDAN sayiliyor: tusa basip bir an sonra
   * kendiliginden atlamasi, basilan tusu bosa cikarirdi.
   *
   * Tiklama `dispatchEvent` ile - pointer ve odak olayi URETMEDEN. Gercek bir
   * tiklama desteyi duraklatir ve sureyi baslatan sey duraklamanin bitmesi olur;
   * olculen sey ise adimin kendisi (`index` degisince zamanlayici bastan).
   */
  test("elle adimdan sonra sure bastan sayiliyor", async ({ page }) => {
    const next = carouselOf(page).getByRole("button", { name: "Next screenshot" });
    await page.clock.runFor(AUTO_ADVANCE_MS - 1000);
    await next.dispatchEvent("click");
    await expect(counterOf(page)).toHaveText(`02 / ${pad(SHOTS.length)}`);

    await page.clock.runFor(AUTO_ADVANCE_MS - 1000);
    await expect(counterOf(page)).toHaveText(`02 / ${pad(SHOTS.length)}`);
    await page.clock.runFor(1000);
    await expect(counterOf(page)).toHaveText(`03 / ${pad(SHOTS.length)}`);
  });

  /**
   * CANLI BOLGE otomatik geciste SUSUYOR, etkilesimde geri aciliyor
   * (lib/deck.ts). Aksi halde ekran okuyucu her aralikta sozu keserdi.
   */
  test("otomatik geciste canli bolge susuyor, etkilesimde geri aciliyor", async ({ page }) => {
    const stage = carouselOf(page).locator("[aria-live]");
    await expect(stage).toHaveAttribute("aria-live", "polite");

    await page.clock.runFor(AUTO_ADVANCE_MS);
    await expect(stage).toHaveAttribute("aria-live", "off");

    await carouselOf(page).getByRole("button", { name: "Next screenshot" }).focus();
    await expect(stage).toHaveAttribute("aria-live", "polite");
  });

  /**
   * Ayar sayfa yuklenmeden ONCE aciliyor, kanca degeri ilk render'da okusun.
   * Her aralikta AYRI AYRI "01" bekleniyor: tek bir uzun bekleme, tam bir tur
   * atip "01"e donen bozuk bir desteyi hic ilerlemeyen desteden ayiramazdi.
   */
  test("reduced-motion altinda hic ilerlemiyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(carouselOf(page).getByRole("button", { name: "Next screenshot" })).toBeVisible();
    for (let step = 0; step < SHOTS.length; step++) {
      await page.clock.runFor(AUTO_ADVANCE_MS);
      await expect(counterOf(page)).toHaveText(`01 / ${pad(SHOTS.length)}`);
    }
  });
});

/**
 * DAKTILO (design-spec.md §3.3.1): goruntu degisince altindaki yazi harf harf
 * geliyor. Metin DOM'da BASTAN TAM (ekran okuyucu ve figur adi icin), gizleme
 * yalnizca `[data-typing]` altinda `opacity` ile. Bekleme sureleri
 * `CAPTION_STEP_MS`ten turetiliyor.
 *
 * Saat burada da DURMUS (yukaridaki blokla ayni sebep) ve olumsuz testler icin
 * bu sart. Gercek saatte yazi iki saniyede kendiliginden bitip isaretini
 * kaldiriyordu; "isaret yok" bekleyen, kendini tekrarlayan bir assertion yaziyi
 * hic engellemeyen bir koda karsi da geciyordu (incelemede bulundu). Durmus
 * saatte baslamis bir yazi, `runFor` onu ilerletmedikce isaretini tasiyor.
 *
 * Elle adimlar `dispatchEvent` ile: gercek bir tiklama desteyi duraklatirdi,
 * olculen sey ise yazinin kendisi.
 */
test.describe("ekran goruntusu karuseli - daktilo", () => {
  test.skip(MULTI < 0, NO_CAROUSEL);

  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
  });

  /* Sayfa ayarlar (reduced-motion) konduktan SONRA yukleniyor, kanca degeri ilk
     render'da okusun. */
  const load = async (page: Page) => {
    await page.reload();
    await expect(carouselOf(page).getByRole("button", { name: "Next screenshot" })).toBeVisible();
  };
  const captionOf = (page: Page, slot: number) =>
    carouselOf(page).locator(SLIDE).nth(slot).locator("figcaption");
  const opacityOf = (letter: Locator) =>
    letter.evaluate((el) => Number(getComputedStyle(el).opacity));
  /* `count` harf yazdiriyor. Yarim adimlik pay: `runFor`un tam sinirdaki
     zamanlayiciyi atesleyip atesletmedigine test baglanmasin. */
  const typeLetters = (page: Page, count: number) =>
    page.clock.runFor(CAPTION_STEP_MS * count + Math.floor(CAPTION_STEP_MS / 2));

  test("goruntu degisince yazi harf harf, sirayla geliyor", async ({ page }) => {
    await load(page);
    const text = SHOTS[1]?.caption ?? "";
    const caption = captionOf(page, 1);
    const letters = caption.locator("span");
    await page.clock.runFor(AUTO_ADVANCE_MS);

    await expect(caption).toHaveAttribute("data-typing", "");
    await expect(caption).toHaveText(text);
    expect(await opacityOf(letters.first())).toBe(0);

    // Ara durum: ilk bes harf acik, sonrasi gizli. Hepsini sonda birden acan ya
    // da sondan baslayan bir yazi burada duser.
    await typeLetters(page, 5);
    for (let i = 0; i < 5; i++) expect(await opacityOf(letters.nth(i))).toBe(1);
    expect(await opacityOf(letters.nth(5))).toBe(0);
    expect(await opacityOf(letters.last())).toBe(0);

    await typeLetters(page, Array.from(text).length);
    await expect(caption).not.toHaveAttribute("data-typing");
    expect(await opacityOf(letters.last())).toBe(1);
  });

  /** Yazi yalnizca DEGISIMDE yaziliyor; sayfa acilinca ilki zaten tam. */
  test("sayfa acilinca ilk yazi daktiloyla yazilmiyor", async ({ page }) => {
    await load(page);
    const caption = captionOf(page, 0);
    await expect(caption).not.toHaveAttribute("data-typing");
    expect(await opacityOf(caption.locator("span").last())).toBe(1);
  });

  test("reduced-motion altinda yazi daktilosuz, tam geliyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page);
    await carouselOf(page).getByRole("button", { name: "Next screenshot" }).dispatchEvent("click");
    const caption = captionOf(page, 1);
    await expect(caption).toBeVisible();
    await expect(caption).not.toHaveAttribute("data-typing");
    expect(await opacityOf(caption.locator("span").last())).toBe(1);
  });

  /**
   * #125'in hata sinifi (team.spec.ts'te biyografi icin ayni test): yazi
   * surerken reduced-motion acilirsa yazi yarida DONMUYOR, hemen tamamlaniyor.
   *
   * Harfin opakligi YENIDEN DENENEREK okunuyor, team.spec.ts'teki gibi.
   * Reduced-motion altinda global blok her gecisi 0.01ms yapiyor ve
   * `transition-property` `all`da kaliyor. Yani isaret kalkinca harfin 0 -> 1
   * degisimi de bir gecis; hemen okunan deger bir kare boyunca 0. CI'da mobilde
   * boyle dustu (#130).
   */
  test("yazarken reduced-motion acilinca yazi hemen tamamlaniyor", async ({ page }) => {
    await load(page);
    const caption = captionOf(page, 1);
    await page.clock.runFor(AUTO_ADVANCE_MS);
    await expect(caption).toHaveAttribute("data-typing", "");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(caption).not.toHaveAttribute("data-typing");
    await expect.poll(() => opacityOf(caption.locator("span").last())).toBe(1);
  });

  /**
   * Yazi bitmeden goruntu yeniden degisirse giden yazinin KALANI gizli kaliyor
   * ve basligiyla birlikte soner (TypedCaption.tsx). Isaret orada kalksaydi
   * kalan harfler tek karede belirir, gelen yaziyla ust uste okunurdu.
   */
  test("yazi bitmeden goruntu degisirse giden yazinin kalani belirmiyor", async ({ page }) => {
    await load(page);
    const outgoing = captionOf(page, 1);
    await page.clock.runFor(AUTO_ADVANCE_MS);
    await expect(outgoing).toHaveAttribute("data-typing", "");
    await typeLetters(page, 5);

    await carouselOf(page).getByRole("button", { name: "Next screenshot" }).dispatchEvent("click");
    await expect(captionOf(page, 2 % SHOTS.length)).toHaveAttribute("data-typing", "");
    expect(await opacityOf(outgoing.locator("span").last())).toBe(0);
  });
});

/**
 * JS GELMEZSE: sunucunun bastigi ilk goruntu gorunur ve tus satiri YER TUTUYOR
 * ama gorunmuyor. Calismayan bir tus cizmek, hicbir yere gitmeyen bir dugme
 * cizmekle ayni hata (who-we-are.spec.ts'teki destenin kurali); yer tutmasi ise
 * hidrasyonda sayfanin kaymamasi icin.
 */
test.describe("ekran goruntusu karuseli - JS yok", () => {
  test.use({ javaScriptEnabled: false });
  test.skip(MULTI < 0, NO_CAROUSEL);

  test("ilk goruntu gorunur, tuslar yer tutuyor ama gorunmuyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const slides = carousel.locator(SLIDE);
    await expect(slides.first()).toBeVisible();
    await expect(slides.first().locator("figcaption")).toBeVisible();
    await expect(slides.first().locator("figcaption")).toHaveText(SHOTS[0]?.caption ?? "");
    await expect(slides.filter({ visible: true })).toHaveCount(1);

    const buttons = carousel.locator("button");
    await expect(buttons).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(buttons.nth(i)).toBeHidden();
      const height = await buttons.nth(i).evaluate((el) => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThan(0);
    }
  });
});
