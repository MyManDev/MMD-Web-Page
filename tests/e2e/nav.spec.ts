import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Navigation davranisi. docs/design-spec.md §3.1 ve §7.4
 *
 * KAPSAM NOTU: anchor scroll ve aktif link testleri BURADA YOK, cunku
 * gozlenecek bolum henuz yok - Hero, Projects, Team ve About kendi
 * issue'larinda geliyor. O testler ilk bolumle birlikte yazilacak.
 * Var olmayan bir davranisi test ediyormus gibi yapmak, testi hic yazmamaktan
 * kotudur.
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
    for (const id of ["hero", "projects", "team", "about"]) {
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
