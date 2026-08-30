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

/**
 * §7.5: dis linkte gorunur ikon. Button'a #35'te eklenmisti; footer'in linki
 * Button degil (§3.6) ve o yuzden atlanmisti.
 */
test("GitHub linki gorunur dis link ikonu tasiyor", async ({ page }) => {
  const link = page.getByRole("contentinfo").getByRole("link", { name: "GitHub" });
  const icon = link.locator('svg[aria-hidden="true"]');

  await expect(icon).toHaveCount(1);
  await expect(icon).toBeVisible();

  // currentColor: ikonun kendi rengi yok. Footer'da yesil YASAK (§5.1) ve
  // ikon metnin rengini aldigi icin o kotaya eleman sokmuyor.
  const [iconColor, linkColor] = await link.evaluate((el) => [
    getComputedStyle(el.querySelector("svg")!).color,
    getComputedStyle(el).color,
  ]);
  expect(iconColor).toBe(linkColor);
});

test("sosyal ikon duvari yok - tek dis link", async ({ page }) => {
  // §3.6 bilincli bir daraltma: footer'da yalnizca GitHub var.
  const links = page.getByRole("contentinfo").getByRole("link");
  await expect(links).toHaveCount(1);
});

/**
 * Yesil disiplini (§5.1): Who we are, Team ve Footer'da accent KULLANILMAZ, cunku
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

/**
 * `rule` alt cizgisi (#55). docs/design-spec.md §6
 *
 * Cizgi `currentColor` kullaniyor, yani §5.1'in "Footer'da yesil yok" kurali
 * sonradan hatirlanmasi gereken bir sey degil - renk kendiliginden dogru.
 * Yukaridaki "bolumde accent renk kullanilmiyor" testi zaten bunu kapsiyor;
 * burada cizginin DAVRANISI olculuyor.
 */
test("GitHub linki hover'da alt cizgi aliyor", async ({ page }) => {
  const rule = page.locator("footer .rule");
  await expect(rule).toHaveCount(1);

  // Cizgi yalnizca METNI kapsiyor, dis link ikonunu degil.
  await expect(rule).toHaveText("GitHub");
  expect(await rule.locator("svg").count()).toBe(0);

  /*
    `scale` tekduze oldugunda tarayici tek sayiya kisaltiyor: kapali halde
    "0 1", acik halde "1 1" DEGIL "1". Bu yuzden dize karsilastirmak yerine
    yatay bilesen okunuyor.
  */
  const xScale = (value: string) => (value === "none" ? 1 : Number(value.split(" ")[0]));
  const read = () => rule.evaluate((el) => getComputedStyle(el, "::after").scale).then(xScale);

  expect(await read()).toBe(0);

  await page.getByRole("contentinfo").getByRole("link", { name: "GitHub" }).hover();
  await expect.poll(read).toBe(1);
});
