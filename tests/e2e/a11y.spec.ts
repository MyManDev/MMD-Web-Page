import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Sert kapi: axe erisilebilirlik ihlali 0 (architecture.md §8).
 * Desktop ve mobil viewport'ta taranir - proje ayarlari ikisini de kosuyor.
 */
for (const path of ["/", "/bu-yol-yok-12345"]) {
  test(`axe ihlali yok: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip link klavyeyle erisilebilir ve gorunur oluyor", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});
