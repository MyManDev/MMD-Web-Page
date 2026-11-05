import { expect, test } from "@playwright/test";

test("ana sayfa kisa ekip anlatimini ve sayfa baglantilarini gosteriyor", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("MyManDev");
  await expect(main.getByText("Two friends, building together.")).toBeVisible();
  await main.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await main.getByRole("link", { name: "Team", exact: true }).click();
  await expect(page).toHaveURL(/\/team$/);
});

for (const [path, title] of [
  ["/", "MyManDev"],
  ["/projects", "Projects"],
  ["/team", "Team"],
]) {
  test(`${path} JavaScript olmadan okunuyor ve yatay tasmiyor`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto(path!);
    await expect(page.getByRole("heading", { level: 1, name: title!, exact: true })).toBeVisible();
    const viewport = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(viewport.content).toBe(viewport.width);
    await expect(page.getByRole("main")).toHaveCSS("opacity", "1");
    await context.close();
  });
}
