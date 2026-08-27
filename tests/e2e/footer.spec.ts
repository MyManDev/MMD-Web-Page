import { expect, test } from "@playwright/test";

/**
 * Footer davranisi. docs/design-spec.md §3.6 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor ve Footer o taramaya
 * dahil; burada tekrarlanmiyor.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("contentinfo landmark'i var", async ({ page }) => {
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("main'in DISINDA - contentinfo main icinde olamaz", async ({ page }) => {
  const nested = await page.getByRole("contentinfo").evaluate((el) => el.closest("main") !== null);
  expect(nested).toBe(false);
});

test("wordmark ve telif satiri gorunuyor", async ({ page }) => {
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("MyManDev").first()).toBeVisible();
  await expect(footer.getByText(/©\s*2026\s*MyManDev/i)).toBeVisible();
});

test("GitHub linki yeni sekmede ve rel guvenli", async ({ page }) => {
  const link = page.getByRole("contentinfo").getByRole("link", { name: "GitHub" });
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute("rel", /noreferrer/);
});

test("sosyal ikon duvari yok - tek dis link", async ({ page }) => {
  // §3.6 bilincli bir daraltma: footer'da yalnizca GitHub var.
  const links = page.getByRole("contentinfo").getByRole("link");
  await expect(links).toHaveCount(1);
});

/**
 * Yesil disiplini (§5.1): Team, About ve Footer'da accent KULLANILMAZ, cunku
 * o bolumlerde birincil aksiyon yok. Yazili kural yerine olculen kural.
 */
test("bolumde accent renk kullanilmiyor", async ({ page }) => {
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim(),
  );
  expect(accent).not.toBe("");

  const usesAccent = await page.getByRole("contentinfo").evaluate((footer) => {
    const toRgb = (value: string) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    };
    const accentRgb = toRgb(
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim(),
    );

    return Array.from(footer.querySelectorAll("*")).some((el) => {
      const style = getComputedStyle(el);
      return (
        style.color === accentRgb ||
        style.backgroundColor === accentRgb ||
        style.borderTopColor === accentRgb
      );
    });
  });

  expect(usesAccent).toBe(false);
});

test("mobilde dikey, md ustunde yatay", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  // Yapiya degil davranisa bagli: Container kendi div'ini de ekliyor, o block.
  // Belge sirasindaki ilk flex kutusu footer'in kolon satiri.
  const direction = await page.getByRole("contentinfo").evaluate((footer) => {
    const flex = Array.from(footer.querySelectorAll("div")).find(
      (el) => getComputedStyle(el).display === "flex",
    );
    return flex ? getComputedStyle(flex).flexDirection : null;
  });
  expect(direction).toBe(width >= 768 ? "row" : "column");
});
