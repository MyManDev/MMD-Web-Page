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

/**
 * Open Graph ve Twitter card. #11 / #18
 *
 * Bu etiketler sayfada GORUNMUYOR, yani bozulduklarinda kimse fark etmez -
 * bir link paylasilana kadar. O yuzden olculuyorlar.
 */
test.describe("paylasim karti", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  const content = (page: import("@playwright/test").Page, selector: string) =>
    page.locator(selector).getAttribute("content");

  test("og:url canonical ile ayni adresi gosteriyor", async ({ page }) => {
    // `href`, `content` DEGIL: canonical bir <link>, adresi href'te durur.
    // Yardimci her zaman `content` okuyordu ve bu test kendi hatasiyla dustu.
    const canonical = await page.locator('head link[rel="canonical"]').getAttribute("href");
    const ogUrl = await content(page, 'head meta[property="og:url"]');

    // Ikisi de mutlak olmali: goreli bir OG adresi paylasimda cozulmez.
    expect(ogUrl).toMatch(/^https:\/\//);
    expect(ogUrl?.replace(/\/$/, "")).toBe(canonical?.replace(/\/$/, ""));
  });

  test("og:image mutlak, ulasilabilir ve gercekten bir gorsel", async ({ page }) => {
    const url = await content(page, 'head meta[property="og:image"]');
    expect(url).toMatch(/^https:\/\//);

    // Mutlak adres gercek alan adini gosteriyor; testte yerel kopyayi cekiyoruz.
    const path = new URL(url as string).pathname;
    const response = await page.request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image");
  });

  /**
   * ILAN EDILEN olcu ile GERCEK olcu ayni olmali.
   *
   * Ayrildiklarinda hicbir sey patlamaz: bazi paylasim onizlemeleri bu iki
   * sayiya bakip yer ayiriyor ve kart kayiyor. Gorseli degistirip sayilari
   * guncellemeyi unutmak tam olarak boyle bir hata.
   */
  test("ilan edilen olcu gorselin gercek olcusu", async ({ page }) => {
    const url = await content(page, 'head meta[property="og:image"]');
    const declared = {
      width: Number(await content(page, 'head meta[property="og:image:width"]')),
      height: Number(await content(page, 'head meta[property="og:image:height"]')),
    };

    const actual = await page.evaluate(
      (src) =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error("gorsel yuklenemedi"));
          image.src = src;
        }),
      new URL(url as string).pathname,
    );

    expect(actual).toEqual(declared);
  });

  test("twitter karti buyuk bicimde gosteriliyor", async ({ page }) => {
    // Varsayilan `summary` 1200x630'luk karti kucuk bir kareye kirpar.
    expect(await content(page, 'head meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  test("baslik ve aciklama iki kanalda da ayni", async ({ page }) => {
    // Metin iki yerde yaziliysa bir gun ayrilir; ayni kaynaktan geldiginin kaniti.
    expect(await content(page, 'head meta[name="twitter:title"]')).toBe(
      await content(page, 'head meta[property="og:title"]'),
    );
    expect(await content(page, 'head meta[name="twitter:description"]')).toBe(
      await content(page, 'head meta[property="og:description"]'),
    );
  });
});
