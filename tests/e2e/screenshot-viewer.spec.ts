import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
});

test("goruntu buyur, klavyeyle gezinilir ve kapaninca odak geri gelir", async ({ page }) => {
  const trigger = page.getByRole("link", { name: /^Enlarge screenshot:/ }).first();
  await trigger.click();
  const viewer = page.getByRole("dialog", { name: /screenshot viewer/ });
  await expect(viewer).toBeVisible();
  const first = await viewer.getByRole("img").getAttribute("src");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByRole("img")).not.toHaveAttribute("src", first!);
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.getByRole("img")).toHaveAttribute("src", first!);
  expect((await new AxeBuilder({ page }).include("dialog").analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("mobil surukleme ilerletir, dikey hareket ilerletmez ve goruntu ekrana sigar", async ({
  page,
}) => {
  await page
    .getByRole("link", { name: /^Enlarge screenshot:/ })
    .first()
    .click();
  const viewer = page.getByRole("dialog");
  const image = viewer.locator(".lightbox-image");
  const first = await viewer.getByRole("img").getAttribute("src");
  await image.dispatchEvent("pointerdown", {
    pointerId: 1,
    isPrimary: true,
    clientX: 250,
    clientY: 200,
    pointerType: "touch",
  });
  await image.dispatchEvent("pointerup", {
    pointerId: 1,
    isPrimary: true,
    clientX: 250,
    clientY: 300,
    pointerType: "touch",
  });
  await expect(viewer.getByRole("img")).toHaveAttribute("src", first!);
  await image.dispatchEvent("pointerdown", {
    pointerId: 2,
    isPrimary: true,
    clientX: 280,
    clientY: 200,
    pointerType: "touch",
  });
  await image.dispatchEvent("pointerup", {
    pointerId: 2,
    isPrimary: true,
    clientX: 80,
    clientY: 205,
    pointerType: "touch",
  });
  await expect(viewer.getByRole("img")).not.toHaveAttribute("src", first!);
  expect(await viewer.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await viewer.getByRole("button", { name: "Zoom into screenshot" }).click();
  await expect(viewer.getByRole("button", { name: "Fit screenshot to screen" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect.poll(() => image.evaluate((el) => el.scrollWidth)).toBeGreaterThanOrEqual(1200);
  expect(await viewer.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await viewer.getByRole("button", { name: "Fit screenshot to screen" }).click();
  await expect(viewer.getByRole("button", { name: "Zoom into screenshot" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await viewer.getByRole("button", { name: "Close screenshot viewer" }).click();
  await expect(viewer).toHaveCount(0);
});

test("buyutulen goruntu klavyeyle kayar ve slayt degismez", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  const trigger = page.getByRole("link", { name: /^Enlarge screenshot:/ }).first();
  await trigger.click();
  const viewer = page.getByRole("dialog");
  const source = await viewer.getByRole("img").getAttribute("src");
  await viewer.getByRole("button", { name: "Zoom into screenshot" }).click();
  const pane = viewer.getByRole("group", { name: "Enlarged screenshot" });
  await expect(pane).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => pane.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(viewer.getByRole("img")).toHaveAttribute("src", source!);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("odak almayan tiklamada da acan baglantiya doner", async ({ page }) => {
  const trigger = page.getByRole("link", { name: /^Enlarge screenshot:/ }).first();
  await trigger.dispatchEvent("click");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("goruntu JavaScript olmadan da acilabilir", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/projects");
  const trigger = page.getByRole("link", { name: /^Enlarge screenshot:/ }).first();
  const href = await trigger.getAttribute("href");
  await trigger.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
  await context.close();
});
