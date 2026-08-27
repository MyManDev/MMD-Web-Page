import { expect, test } from "@playwright/test";

/**
 * Sert kapi: bilinmeyen yolda GERCEK 404 (architecture.md §8).
 *
 * Statik host'larin klasik hatasi, bilinmeyen bir yolda 404 yerine uygulama
 * kabugunu 200 ile dondurmek. Optimizer'da bu hata gercek yayinda cikti.
 * Bu yuzden test durum kodunu okur, sayfada "404" yazmasina bakmakla yetinmez.
 */
test("bilinmeyen yol gercek 404 dondurur", async ({ page }) => {
  const response = await page.goto("/bu-yol-yok-12345");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("main")).toBeVisible();
});

test("404 sayfasindan ana sayfaya donulebiliyor", async ({ page }) => {
  await page.goto("/bu-yol-yok-12345");
  await page.getByRole("link", { name: /back to home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
