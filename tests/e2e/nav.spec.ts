import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Navigation davranisi. docs/design-spec.md §3.1 ve §7.4
 *
 * KAPSAM NOTU: anchor scroll ve aktif link testleri artik VAR (#7). Gozlenecek
 * bir bolum ciktigi anda yazildilar; oncesinde yazilmis olsalari var olmayan
 * bir davranisi test ediyor gorunurlerdi.
 *
 * Testler bolum ADINA bagli DEGIL: hangi bolumlerin var oldugunu sayfadan
 * okuyorlar. Bolum sirasi veya etiketleri degistiginde dusmemeliler; nav ile
 * bolumler arasindaki bag bozuldugunda dusmeliler.
 */

const isDesktop = (width: number) => width >= 1024;

/**
 * Mobil menu panelini dugmenin aria-controls'u uzerinden bulur.
 * Desktop nav mobilde CSS ile gizli ama DOM'da duruyor, o yuzden linkleri
 * href ile aramak iki eleman buluyor. Panele sabitlemek hem dogru elemani
 * secer hem de aria-controls baginin gercekten kurulu oldugunu dogrular.
 */
async function openMenu(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /menu/i });
  const id = await toggle.getAttribute("aria-controls");
  expect(id).toBeTruthy();
  await toggle.click();
  return { toggle, panel: page.locator(`#${id}`) };
}

test.describe("navbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sticky ve wordmark tasiyor", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: "MyManDev" })).toBeVisible();
    await expect(header).toHaveCSS("position", "sticky");
  });

  test("zemin saydam degil", async ({ page }) => {
    // Referans mockup'taki blur'lu saydam bar bilincli olarak reddedildi.
    const bg = await page
      .getByRole("banner")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toBe("transparent");
  });

  test("dort bolum linki dogru anchor'a isaret ediyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    // Bolum sirasi: architecture.md §2. 03 kolektifi, 04 kisileri anlatir.
    for (const id of ["hero", "projects", "who-we-are", "team"]) {
      await expect(scope.locator(`a[href="#${id}"]`)).toBeVisible();
    }
  });

  test("GitHub aksiyonu yeni sekmede ve rel guvenli", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    if (!isDesktop(width)) await openMenu(page);
    const link = page.getByRole("link", { name: "GitHub" }).first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  });
});

test.describe("mobil menu", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(isDesktop(width), "yalnizca < lg viewport");
    await page.goto("/");
  });

  test("dugme aria-expanded ve aria-controls tasiyor", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /menu/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-controls", /.+/);
  });

  test("acilinca focus ilk linke geciyor", async ({ page }) => {
    const { panel } = await openMenu(page);
    await expect(panel.locator('a[href="#hero"]')).toBeFocused();
  });

  test("Escape kapatiyor ve focus'u dugmeye GERI VERIYOR", async ({ page }) => {
    const { toggle } = await openMenu(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("focus menu icinde donuyor", async ({ page }) => {
    const { panel } = await openMenu(page);
    const firstLink = panel.locator('a[href="#hero"]');
    await expect(firstLink).toBeFocused();

    // Dort link + GitHub = bes odaklanabilir oge; besinciden sonra basa doner.
    for (let i = 0; i < 5; i += 1) await page.keyboard.press("Tab");
    await expect(firstLink).toBeFocused();
  });

  test("acikken arkadaki sayfa inert ve scroll kilitli", async ({ page }) => {
    await openMenu(page);

    await expect(page.getByRole("main")).toHaveAttribute("inert", "");
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).toBe("hidden");
  });

  test("kapaninca inert ve scroll kilidi kalkiyor", async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press("Escape");

    await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).not.toBe("hidden");
  });

  test("menu acikken axe ihlali yok", async ({ page }) => {
    await openMenu(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

/**
 * Anchor scroll ve aktif link (#7). docs/design-spec.md §3.1 ve §7.3
 *
 * Hangi bolumlerin YAYINDA oldugunu sayfadan okuyoruz. Faz 3 boyunca bolumler
 * tek tek geliyor; testin bilmesi gereken sey hangi bolumun var oldugu degil,
 * var olan her bolumun nav'la dogru baglanmis olmasi.
 */
async function liveSections(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    // YALNIZCA bolum navigasyonu. `header a[href^='#']` demek wordmark'in
    // #main linkini de toplardi ve #main gercekten var - test nav'da olmayan
    // bir linke tiklamaya calisirdi. Desktop nav mobilde CSS ile gizli ama
    // DOM'da duruyor, o yuzden kesif her viewport'ta buradan yapiliyor.
    Array.from(document.querySelectorAll("nav[aria-label='Sections'] a[href^='#']"))
      .map((link) => link.getAttribute("href")!.slice(1))
      .filter((id) => document.getElementById(id) !== null),
  );
}

test.describe("anchor scroll ve aktif link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("en az bir bolum yayinda - yoksa asagidaki testler bos gecerdi", async ({ page }) => {
    expect((await liveSections(page)).length).toBeGreaterThan(0);
  });

  /**
   * Sticky navbar hedef basligi KAPATMAMALI. design-spec.md §7.3 bunu
   * scroll-margin-top ile cozuyor ve §8'in "klavye ile tum bolum ve aksiyonlar
   * erisilebilir" satiri bunu kapsiyor.
   *
   * Olculen sey CSS degeri degil SONUC: bolumun ust kenari navbar'in altinda mi.
   * projects.spec.ts scroll-margin-top'un degerini zaten okuyor; burada o degerin
   * ise yarayip yaramadigina bakiliyor.
   */
  test("anchor'a gidince bolum sticky navbar'in altinda kalmiyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const [id] = await liveSections(page);
    expect(id).toBeTruthy();

    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    await scope.locator(`a[href="#${id}"]`).click();

    await expect
      .poll(async () => {
        const header = await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect());
        const section = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect());
        return Math.round(section.top - header.bottom);
      })
      // scroll-margin-top navbar + 24px; birkac pikselik yuvarlama payi birakiyoruz.
      .toBeGreaterThanOrEqual(0);
  });

  test("anchor tiklamasi URL'e bolum id'sini yaziyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const [id] = await liveSections(page);

    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    await scope.locator(`a[href="#${id}"]`).click();

    await expect(page).toHaveURL(new RegExp(`#${id}$`));
  });

  /**
   * Aktif link tespiti tek bir IntersectionObserver ile yapiliyor
   * (useActiveSection). Renk TEK BASINA bilgi tasimaz (§7.5): aktif link ayni
   * zamanda aria-current="true" tasimak zorunda.
   */
  test("bolume gidince o linkin aria-current'i aciliyor, digerlerininki kapali", async ({
    page,
  }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(!isDesktop(width), "aktif link yalnizca desktop nav'da gorunur");

    const [id] = await liveSections(page);
    const nav = page.getByLabel("Sections");

    // Acilis durumu VARSAYILMIYOR: hangi bolumun ilk ekranda gozlem bandina
    // girdigi sayfa yuksekligine bagli ve bolumler geldikce degisecek.
    // Olculen sey scroll SONRASI durum.
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();

    await expect(nav.locator(`a[href="#${id}"]`)).toHaveAttribute("aria-current", "true");
    await expect(nav.locator("[aria-current]")).toHaveCount(1);
  });

  test("aktif link accent rengini aliyor - renk aria-current'a EK", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(!isDesktop(width), "aktif link yalnizca desktop nav'da gorunur");

    const [id] = await liveSections(page);
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();

    const link = page.getByLabel("Sections").locator(`a[href="#${id}"]`);
    await expect(link).toHaveAttribute("aria-current", "true");

    const accentColor = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    });

    // Tek okuma YETMEZ: NavLink'te transition-colors 150ms var ve rengi gecis
    // ortasinda okumak ara bir ton veriyor (olculdu: rgb(130, 215, 134)).
    // Beklenen sey gecisin BITTIGI deger.
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).toBe(accentColor);
  });

  test("mobil menude bir linke tiklayinca menu kapaniyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(isDesktop(width), "yalnizca < lg viewport");

    const [id] = await liveSections(page);
    const { toggle, panel } = await openMenu(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await panel.locator(`a[href="#${id}"]`).click();

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(new RegExp(`#${id}$`));

    // NOT: link tiklamasindan SONRA focus'un nereye gittigi §7.4'te YAZILI
    // DEGIL - orada yalnizca Escape'in focus'u dugmeye geri verdigi belirtiliyor.
    // Olculdu: tiklamadan sonra focus dugmede DEGIL. Burada bir sozlesme
    // uydurmuyoruz; davranis once yazilmali, sonra test edilmeli. Bolge B.
  });
});
