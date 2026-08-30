import { expect, test } from "@playwright/test";

/**
 * Who we are bolumu. docs/design-spec.md §3.4 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor; burada
 * tekrarlanmiyor.
 *
 * Testler metne DEGIL yapiya bagli.
 */

const SECTION = "section#who-we-are";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde ve kendi basligina bagli", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();
  expect(await section.evaluate((el) => el.closest("main") !== null)).toBe(true);

  const labelledby = await section.getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();

  const heading = page.locator(`#${labelledby}`);
  expect(await heading.evaluate((el) => el.tagName)).toBe("H2");
  await expect(heading).not.toBeEmpty();

  // Tek h1 Hero'da kaliyor; bu bolum h1 uretmiyor (§7.1).
  await expect(section.locator("h1")).toHaveCount(0);
});

test("manifesto dolu", async ({ page }) => {
  await expect(page.locator(`${SECTION} p`).first()).not.toBeEmpty();
});

/**
 * §3.4: okunabilirlik icin metin genisligi 65ch ile sinirli. Kapsayici 1600px
 * oldugu icin bu sinir olmadan manifesto satir basina 150+ karakter olurdu.
 */
test("metin genisligi okunabilirlik icin sinirli", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  test.skip(width < 1024, "sinir ancak genis ekranda baglayici");

  const box = await page.locator(`${SECTION} p`).first().boundingBox();
  const container = await page.locator(`${SECTION} > div`).first().boundingBox();
  expect(box).not.toBeNull();
  expect(container).not.toBeNull();
  expect(box!.width).toBeLessThan(container!.width);
});

/**
 * §3.4: kolektifi BIRLIKTE anlatir, kisiler bir sonraki bolumde. Bu bolum
 * kisi karti veya portre uretmez - o sinir Team'in.
 */
test("bolum kisi karti veya gorsel uretmiyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} img`)).toHaveCount(0);
  await expect(page.locator(`${SECTION} h3`)).toHaveCount(0);
});

/**
 * Yesil disiplini (§5.1): Who we are'da birincil aksiyon yok, yani accent
 * kotasi SIFIR. Baslik, manifesto ve liste isaretleri accent kullanmaz.
 * footer.spec.ts ile ayni olcum yaklasimi.
 */
test("bolumde accent renk kullanilmiyor", async ({ page }) => {
  const usesAccent = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*")).some((el) => {
      const s = getComputedStyle(el);
      return (
        s.color === accent ||
        s.backgroundColor === accent ||
        s.borderTopColor === accent ||
        s.borderRightColor === accent ||
        s.borderBottomColor === accent ||
        s.borderLeftColor === accent
      );
    });
  });

  expect(usesAccent).toBe(false);
});

/**
 * Bu bolum var oldugu icin Hero'nun ikinci aksiyonu artik ciziliyor.
 * hero.spec.ts'teki "her link var olan bir bolume gider" degismezi bunu
 * zaten kapsiyor; burada dugmenin GELDIGI dogrulaniyor.
 */
test("Hero'nun ikincil aksiyonu bu bolume geldi", async ({ page }) => {
  const link = page.locator('section#hero a[href="#who-we-are"]');
  await expect(link).toHaveCount(1);
  await expect(page.locator(SECTION)).toHaveCount(1);
});

/**
 * Prensip destesi. design-spec.md §3.4
 *
 * Burada pinlenen bir dizi VARDI (#56). Manifestoyu ekrandan atip geriye bir
 * viewport'ta tek satir biraktigi icin kaldirildi; yerine ayni ekranda duran,
 * tuslarla gezilen bir deste geldi.
 *
 * Iki yol da test ediliyor: JS'siz duz liste ve gelismis deste. Onemli olan
 * ilki - icerigin JS'e rehin verilmedigini o kanitliyor.
 */
test.describe("prensip destesi - JS gelmezse", () => {
  test.use({ javaScriptEnabled: false });

  /**
   * ASIL SOZLESME: JS hic calismazsa BES PRENSIP DE okunur olmali. Bunun tersi
   * (sunucuda tek prensip, gerisini JS acar) bes cumlenin dordunu JS'e rehin
   * verirdi. Bu test o yonu yanlislikla ters cevirirsek duser.
   */
  test("bes prensip de duz liste olarak okunur", async ({ page }) => {
    const items = page.locator(`${SECTION} ul li`);
    const count = await items.count();

    // Sema 3-5 ile sinirliyor; bolum o araligin disina cikamaz.
    expect(count).toBeGreaterThanOrEqual(3);
    expect(count).toBeLessThanOrEqual(5);
    for (let i = 0; i < count; i++) await expect(items.nth(i)).not.toBeEmpty();
  });

  test("gezinme tuslari hic cizilmiyor", async ({ page }) => {
    // Calismayan bir tus cizmek, hicbir yere gitmeyen bir dugme cizmekle ayni
    // hata (§3.2'deki `secondary` gerekcesi).
    await expect(page.getByLabel("Next principle")).toHaveCount(0);
    await expect(page.getByLabel("Previous principle")).toHaveCount(0);
  });
});

/**
 * Tuslara BASAN testler reduced-motion altinda kosuyor ve gerekcesi olculdu.
 *
 * Normal yolda Playwright'in ilk tiklamasi duzenli olarak bosa dusuyor: 24
 * kosunun 7'sinde sayac ilerlemedi. Reduced-motion altinda 24/24 gecti. Sebep
 * uygulamada degil - tusun DOM'a girdigi anda calistigi ayrica olculdu (12/12,
 * olu pencere 0ms). Sorun `scroll-behavior: smooth` ve scroll'a bagli reveal
 * animasyonu: Playwright tusu goruse kaydirip kutusunu olcuyor, tiklama
 * gonderilene kadar oge hala hareket ediyor.
 *
 * Ayni sinif mudahale depoda zaten kayitli: axe taramasi da bu yuzden
 * reduced-motion altinda kosuyor (architecture.md §9).
 *
 * Kapsam bilerek DAR: yalnizca tiklayan testler burada. Duzen, canli bolge ve
 * varlik testleri normal yolda kaliyor - hepsini buraya tasimak animasyonlu
 * yolu test disi birakirdi.
 */
test.describe("prensip destesi - gezinme", () => {
  // `test.use({ reducedMotion })` DEGIL: bu Playwright surumunun secenek tipinde
  // o alan yok ve `tsc` reddediyor. Deponun kendi ornegi de bu - a11y.spec.ts ve
  // projects.spec.ts ayni sekilde `emulateMedia` kullaniyor.
  //
  // Yeniden yuklemeye gerek yok: medya durumu aninda uygulaniyor, yani
  // `scroll-behavior: auto` ve `animation-name: none` ilk tiklamadan once
  // yururlukte.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  /**
   * Sayac ile gorunen prensip birlikte ILERLIYOR. Yalnizca sayaci olcmek
   * yetmez: sayac artip metin sabit kalsaydi test yine gecerdi.
   */
  test("ileri tusu hem metni hem sayaci ilerletiyor", async ({ page }) => {
    const stage = page.locator(`${SECTION} [data-active]`);
    const counter = page.locator(`${SECTION} [aria-roledescription="carousel"] p`).last();

    const first = await stage.textContent();
    await expect(counter).toContainText("01");

    await page.getByLabel("Next principle").click();

    await expect(counter).toContainText("02");
    expect(await stage.textContent()).not.toBe(first);
  });

  test("geri tusu basa donduruyor", async ({ page }) => {
    const stage = page.locator(`${SECTION} [data-active]`);
    const first = await stage.textContent();

    await page.getByLabel("Next principle").click();
    await page.getByLabel("Previous principle").click();

    expect(await stage.textContent()).toBe(first);
  });

  /**
   * Sona gelince basa sariyor. Sonu olan bir gezinmede son tus devre disi
   * kalir ve odak bosa duser; bes ogede sarma yonu kaybettirmiyor.
   */
  test("son prensipten sonra basa sariyor", async ({ page }) => {
    const stage = page.locator(`${SECTION} [data-active]`);
    const counter = page.locator(`${SECTION} [aria-roledescription="carousel"] p`).last();

    const first = await stage.textContent();
    const total = Number(((await counter.textContent()) ?? "").split("/")[1]?.trim());
    expect(total).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < total; i++) await page.getByLabel("Next principle").click();

    await expect(counter).toContainText("01");
    expect(await stage.textContent()).toBe(first);
  });
});

/** Tiklamayan testler normal yolda - animasyonlu bicim de kapsamda kalsin. */
test.describe("prensip destesi - bicim", () => {
  test("tek seferde tek prensip gorunuyor", async ({ page }) => {
    const deck = page.locator(`${SECTION} [aria-roledescription="carousel"]`);
    await expect(deck).toBeVisible();
    await expect(deck.locator("[data-active]")).toHaveCount(1);
  });

  /**
   * Odak tusta kaliyor, yani degisen metin kendiliginden duyulmaz. Canli bolge
   * olmadan ekran okuyucu kullanicisi tusun bir sey yaptigini anlamaz - ve bu
   * gozle bakinca fark edilmez.
   */
  test("degisen prensip canli bolgede duyuruluyor", async ({ page }) => {
    const live = page.locator(`${SECTION} [aria-live="polite"]`);
    await expect(live).toHaveCount(1);
    await expect(live.locator("[data-active]")).toHaveCount(1);
  });

  /**
   * §3.4 iki kolon istiyor: manifesto solda, deste sagda AYNI ekranda. Onceki
   * bicimin kusuru tam olarak buydu - ikisi ayni anda gorunmuyordu.
   */
  test("lg ustunde manifesto ve deste yan yana", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width < 1024, "iki kolon yalnizca lg ustunde");

    const manifesto = await page.locator(`${SECTION} p`).first().boundingBox();
    const deck = await page.locator(`${SECTION} [data-active]`).boundingBox();
    expect(manifesto).not.toBeNull();
    expect(deck).not.toBeNull();

    // Yan yana: destenin solu manifestonun sag kenarindan sonra basliyor.
    expect(deck!.x).toBeGreaterThan(manifesto!.x + manifesto!.width);
    // ...ve ayni ekranda: dikey olarak ortusuyorlar.
    expect(deck!.y).toBeLessThan(manifesto!.y + manifesto!.height);
  });
});
