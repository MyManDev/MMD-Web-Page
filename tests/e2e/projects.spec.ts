import { expect, test, type Page } from "@playwright/test";

import { projects } from "@/content";

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
  const images = page.locator(`${SECTION} img`);
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

test("srcset iki genisligi de sayiyor ve sizes yazili", async ({ page }) => {
  const images = page.locator(`${SECTION} img`);
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
  const image = page.locator(`${SECTION} img`).first();
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

  expect(style.position).toBe("static");
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
  const box = await page.locator(`${SECTION} img`).first().boundingBox();
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
  expect(position).toBe("static");
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
 * kosuyor ve iki yonu birden olcuyor - tek goruntulu kartta karusel YOK, cok
 * goruntulude VAR. Digerleri cok goruntulu bir proje yoksa atlaniyor; icerige
 * ilk ikinci goruntu girdigi gun kendiliginden kosmaya basliyorlar.
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
   * OTOMATIK GECIS YOK (§3.3.1): ekran goruntusu inceleniyor. Saat Playwright'in
   * sahte saati; bir dakikayi gercekten beklemeden ilerletiyor. Bu test
   * reduced-motion ALTINDA DEGIL - otomatik gecis tipik olarak orada kapali
   * olurdu ve test hicbir sey olcmezdi.
   */
  test("kendiliginden ilerlemiyor", async ({ page }) => {
    await page.clock.install();
    await page.reload();

    const carousel = carouselOf(page);
    await expect(carousel.getByRole("button", { name: "Next screenshot" })).toBeVisible();
    await page.clock.runFor(60_000);

    await expect(carousel.locator("p")).toHaveText(`01 / ${pad(SHOTS.length)}`);
    await expect(carousel.locator(SLIDE).first()).toBeVisible();
  });

  /**
   * Capraz sonumleme: gelen slayt 200ms'de beliriyor, giden 200ms ALTTA kalip
   * tek adimda kayboluyor. Reduced-motion altinda gecis HIC yok - globals.css'in
   * blogu yalnizca sureyi kisaltiyor, gecikmeyi degil; gecikme kalsaydi giden
   * slayt 200ms gorunur kalirdi (CLAUDE.md kural 10).
   */
  test("gecis capraz sonumleme, reduced-motion altinda hic yok", async ({ page }) => {
    const slides = carouselOf(page).locator(SLIDE);
    const timing = (i: number) =>
      slides.nth(i).evaluate((el) => {
        const cs = getComputedStyle(el);
        const longest = (value: string) => Math.max(...value.split(",").map(parseFloat));
        return { duration: longest(cs.transitionDuration), delay: longest(cs.transitionDelay) };
      });

    expect(await timing(0)).toEqual({ duration: 0.2, delay: 0 });
    expect(await timing(1)).toEqual({ duration: 0, delay: 0.2 });

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (let i = 0; i < SHOTS.length; i++) {
      const { duration, delay } = await timing(i);
      expect(duration).toBeLessThan(0.001);
      expect(delay).toBe(0);
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

  /** Slaytlar ayni hucrede ust uste: gezinirken ne cerceve ne tus oynuyor. */
  test("gezinirken cerceve ve tuslar yerinden oynamiyor", async ({ page }) => {
    const carousel = carouselOf(page);
    const next = carousel.getByRole("button", { name: "Next screenshot" });
    const frame = carousel.locator(SLIDE).first().locator("..");

    await next.scrollIntoViewIfNeeded();
    const before = { next: await next.boundingBox(), frame: await frame.boundingBox() };
    for (let i = 0; i < SHOTS.length; i++) {
      await next.click();
      expect(await next.boundingBox()).toEqual(before.next);
      expect(await frame.boundingBox()).toEqual(before.frame);
    }
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
