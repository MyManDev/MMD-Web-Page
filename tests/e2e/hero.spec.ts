import { expect, test } from "@playwright/test";

/**
 * Hero bolumu. docs/design-spec.md §3.2 ve §7.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor; burada
 * tekrarlanmiyor.
 *
 * Testler metne DEGIL yapiya bagli: icerik degistiginde dusmesinler, bolum
 * sozlesmesi bozuldugunda dussunler.
 */

const SECTION = "section#hero";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde ve nav'in bekledigi id ile duruyor", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();
  expect(await section.evaluate((el) => el.closest("main") !== null)).toBe(true);
});

/**
 * §7.1: sayfada TEK h1 ve o Hero'nun. Projects'in basligi h2, kartlar h3.
 * Bu test hem Hero'yu hem de digerlerini birden korur.
 */
test("sayfanin tek h1'i Hero'da ve bolum ona bagli", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);

  const inHero = await h1.evaluate((el) => el.closest("section#hero") !== null);
  expect(inHero).toBe(true);
  await expect(h1).not.toBeEmpty();

  const labelledby = await page.locator(SECTION).getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();
  expect(await h1.getAttribute("id")).toBe(labelledby);
});

test("baslik ve alt cumle dolu", async ({ page }) => {
  await expect(page.locator(`${SECTION} h1`)).not.toBeEmpty();
  await expect(page.locator(`${SECTION} p`).first()).not.toBeEmpty();
});

test("bolum numarasi dekoratif - ekran okuyucuya okunmuyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} [aria-hidden="true"]`).first()).toHaveText("01");
});

/**
 * ASIL DEGISMEZ. §3.2 iki aksiyon tarif ediyor ama ikincisi Who we are'a
 * gidiyor ve o bolum henuz yok (#9). Hicbir yere goturmeyen bir dugme
 * cizmemek icin ikincisi opsiyonel yapildi.
 *
 * Bu test o karari korur ve #9 gelince kendiliginden ikinci dugmeyi de
 * kapsar: Hero'daki her ic link, sayfada GERCEKTEN var olan bir bolume
 * isaret etmeli.
 */
test("Hero'daki her aksiyon var olan bir bolume gidiyor", async ({ page }) => {
  const hrefs = await page
    .locator(`${SECTION} a[href^="#"]`)
    .evaluateAll((links) => links.map((el) => el.getAttribute("href") ?? ""));
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    await expect(page.locator(href), `${href} bir bolume gitmiyor`).toHaveCount(1);
  }
});

test("birincil aksiyon Projects'e gidiyor", async ({ page }) => {
  const primary = page.locator(`${SECTION} a[href="#projects"]`);
  await expect(primary).toHaveCount(1);
  await expect(primary).not.toBeEmpty();
});

/**
 * §3.2 ve §4.4: sayfa yuklenirken giris animasyonu YOK. Hero acilista zaten
 * ekranda; scroll'a bagli bir reveal burada sayfayi yanip sonuyormus gibi
 * gosterirdi.
 */
test("Hero'da acilis animasyonu yok", async ({ page }) => {
  const running = await page
    .locator(SECTION)
    .evaluate((section) =>
      Array.from(section.querySelectorAll("*")).some(
        (el) => getComputedStyle(el).animationName !== "none",
      ),
    );
  expect(running).toBe(false);
});

test("aksiyonlar mobilde alt alta, sm ustunde yan yana", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const direction = await page
    .locator(`${SECTION} a[href^="#"]`)
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).flexDirection);
  expect(direction).toBe(width >= 640 ? "row" : "column");
});

/**
 * Yesil disiplini (§5.1): Hero'nun tek yesil odagi primary CTA'nin zemini.
 * SectionLabel, baslik, alt cumle ve ghost aksiyon yesil DEGIL.
 */
test("bolumdeki tek accent kullanimi birincil aksiyonun zemini", async ({ page }) => {
  const users = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*"))
      .filter((el) => {
        const s = getComputedStyle(el);
        return (
          s.color === accent ||
          s.backgroundColor === accent ||
          s.borderTopColor === accent ||
          s.borderRightColor === accent ||
          s.borderBottomColor === accent ||
          s.borderLeftColor === accent
        );
      })
      .map((el) => (el.textContent ?? "").trim());
  });

  expect(users).toEqual(["Projects"]);
});
