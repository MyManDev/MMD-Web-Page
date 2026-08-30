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

test("bolum numarasi dekoratif - ekran okuyucuya okunmuyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} [aria-hidden="true"]`).first()).toHaveText("03");
});

test("manifesto ve prensipler dolu", async ({ page }) => {
  await expect(page.locator(`${SECTION} p`).first()).not.toBeEmpty();

  const items = page.locator(`${SECTION} ul li`);
  const count = await items.count();
  // Sema 3-5 ile sinirliyor; bolum o araligin disina cikamaz.
  expect(count).toBeGreaterThanOrEqual(3);
  expect(count).toBeLessThanOrEqual(5);
  for (let i = 0; i < count; i++) await expect(items.nth(i)).not.toBeEmpty();
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
