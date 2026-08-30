import { expect, test } from "@playwright/test";

/**
 * robots.txt, sitemap.xml ve kanonik adres. #11'in metin gerektirmeyen yarisi.
 *
 * SEO aciklamasi ve OG gorseli BURADA YOK: ikisi de marka metni/varlik ve
 * bekliyor (#15, #18). Var olmayan bir metadata'yi test ediyormus gibi yapmak,
 * testi hic yazmamaktan kotudur.
 *
 * Testler adresi content/site.ts'ten degil URETILEN CIKTIDAN okuyor ve
 * birbirine karsi dogruluyor - iki dosyanin ayni adresten bahsettigini
 * gormek, ikisinin de ayni sabiti import ettigini gormekten daha degerli.
 */

test("robots.txt gercekten yayinlaniyor ve sitemap'i gosteriyor", async ({ page }) => {
  const response = await page.request.get("/robots.txt");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toMatch(/User-Agent:\s*\*/i);
  expect(body).toMatch(/Allow:\s*\//i);
  expect(body).toMatch(/Sitemap:\s*https:\/\/\S+\/sitemap\.xml/i);
});

test("sitemap.xml gecerli ve tek sayfayi sayiyor", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("<urlset");
  // Tek sayfa, tek giris: bolumler anchor, ayri URL degil (architecture.md §2).
  expect(body.match(/<loc>/g)).toHaveLength(1);

  // 404 sitemap'e girmez.
  expect(body).not.toContain("_not-found");
  expect(body).not.toContain("404");
});

/**
 * Uc kayit da ayni kanonik adresten bahsetmek zorunda. Biri degisip digerleri
 * kalirsa arama motoruna celiskili bir site tarif edilmis olur ve hicbir kapi
 * bunu soylemez.
 */
test("robots, sitemap ve canonical ayni adresi gosteriyor", async ({ page }) => {
  const robots = await (await page.request.get("/robots.txt")).text();
  const sitemap = await (await page.request.get("/sitemap.xml")).text();

  const fromRobots = robots.match(/Sitemap:\s*(https:\/\/[^/\s]+)/i)?.[1];
  const fromSitemap = sitemap.match(/<loc>(https:\/\/[^/<]+)/)?.[1];
  expect(fromRobots).toBeTruthy();
  expect(fromSitemap).toBe(fromRobots);

  await page.goto("/");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBeTruthy();
  expect(canonical!.startsWith(fromRobots!)).toBe(true);
});

test("canonical adres localhost'u degil gercek alan adini gosteriyor", async ({ page }) => {
  await page.goto("/");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toMatch(/^https:\/\//);
  expect(canonical).not.toContain("localhost");
  expect(canonical).not.toContain("127.0.0.1");
});

/**
 * Aciklama meta etiketi. #11
 *
 * Metin #15'te yazildi ve sema onu zorunlu tutuyor, ama uzun sure HTML'e
 * girmedi: `content/site.ts`'te duruyor, `metadata` nesnesi kullanmiyordu.
 * Sema bir alanin VAR oldugunu garanti ediyor, YAYINLANDIGINI degil - bu test
 * o araligi kapatiyor.
 */
test("aciklama meta etiketi gercekten uretiliyor", async ({ page }) => {
  await page.goto("/");

  const description = page.locator('head meta[name="description"]');
  await expect(description).toHaveCount(1);

  const content = (await description.getAttribute("content")) ?? "";

  // Metne DEGIL, dolulugu ve makullugune bagli: icerik degistiginde dusmesin,
  // etiket bosaldiginda veya kaybolduğunda dussun.
  expect(content.trim().length).toBeGreaterThan(50);

  // Arama sonucunda kirpilmadan gorunen sinir ~160 karakter. Ustune cikmak
  // hata degil ama sessiz bir kayip, o yuzden burada tutuluyor.
  expect(content.trim().length).toBeLessThanOrEqual(160);
});
