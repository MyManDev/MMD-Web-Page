import { expect, test, type Locator, type Page } from "@playwright/test";

async function settle(element: Locator) {
  await element.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})),
    );
  });
}

async function navigation(page: Page) {
  const toggle = page.getByRole("button", { name: "Menu", exact: true });
  if (!(await toggle.isVisible())) return page.getByLabel("Pages", { exact: true });
  await toggle.click();
  const panel = page.locator("#mobile-menu");
  await settle(panel);
  return panel;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "Next screenshot", exact: true }).first(),
  ).toBeVisible();
});

test("hizli sayfa seciminde son tiklama kazanir ve gecmis temiz kalir", async ({
  page,
}, testInfo) => {
  test.skip((testInfo.project.use.viewport?.width ?? 0) < 1024, "masaustu nav");
  await page.getByLabel("Pages", { exact: true }).evaluate((nav) => {
    nav.querySelector<HTMLAnchorElement>('a[href="/"]')!.click();
    nav.querySelector<HTMLAnchorElement>('a[href="/team"]')!.click();
  });
  await expect(page).toHaveURL(/\/team$/);
  await expect(page.getByRole("heading", { level: 1, name: "Team", exact: true })).toBeVisible();
  await expect(page.locator("main")).toHaveCSS("opacity", "1");
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/team$/);
  await expect(page.locator("main")).toHaveCSS("opacity", "1");
});

test("menu gecisi kesilip yeniden acilinca ortu ve gezinme calisir", async ({ page }, testInfo) => {
  test.skip((testInfo.project.use.viewport?.width ?? 0) >= 1024, "mobil menu");
  const toggle = page.getByRole("button", { name: "Menu", exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await toggle.click();
  const panel = page.locator("#mobile-menu");
  await settle(panel);
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(
    await panel.evaluate((el) =>
      el.contains(document.elementFromPoint(innerWidth / 2, innerHeight - 1)),
    ),
  ).toBe(true);
  await panel.getByRole("link", { name: "Team", exact: true }).click();
  await expect(page).toHaveURL(/\/team$/);
  await expect(panel).toBeHidden();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("main")).toHaveCSS("opacity", "1");
});

test("degistiricili tiklama tarayiciya birakilir ve menuyu kapatmaz", async ({ page }) => {
  const scope = await navigation(page);
  const team = scope.getByRole("link", { name: "Team", exact: true });
  for (const modifier of ["ctrlKey", "metaKey"]) {
    const prevented = await team.evaluate((el, key) => {
      let applicationPrevented: boolean | undefined;
      // Uygulamadan sonra yalniz test, sentetik olayin yerel tarayici aksiyonunu durdurur.
      document.addEventListener(
        "click",
        (event) => {
          applicationPrevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, [key]: true });
      el.dispatchEvent(event);
      return applicationPrevented;
    }, modifier);
    expect(prevented).toBe(false);
  }
  await expect(page).toHaveURL(/\/projects$/);
  const toggle = page.getByRole("button", { name: "Menu", exact: true });
  if (await toggle.isVisible()) {
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
  }
});

test("reduced motion altinda klavye gezinmesi ve tuslar hareketsiz", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const next = page.getByRole("button", { name: "Next screenshot", exact: true }).first();
  await next.hover();
  await page.mouse.down();
  await expect(next).toHaveCSS("scale", "none");
  await page.mouse.up();
  const scope = await navigation(page);
  await scope.getByRole("link", { name: "Team", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/team$/);
  await expect(page.locator("main")).toHaveCSS("animation-name", "none");
  await expect(page.locator("main")).toHaveCSS("opacity", "1");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("hareketli goruntuleyici acilir, slayt degisir ve odak geri doner", async ({ page }) => {
  const opener = page.getByRole("link", { name: /^Enlarge screenshot:/ }).first();
  await opener.click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toHaveCSS("opacity", "1");
  const source = await viewer.getByRole("img").getAttribute("src");
  await viewer.getByRole("button", { name: "Next enlarged screenshot" }).click();
  await expect(viewer.getByRole("img")).not.toHaveAttribute("src", source!);
  await expect(viewer.getByRole("img")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
