import { expect, test } from "@playwright/test";

/**
 * Projects bolumu. docs/design-spec.md §3.3.1 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor ve Projects o
 * taramaya dahil; burada tekrarlanmiyor.
 *
 * Testler proje ADINA degil YAPIYA bagli: icerik dosyasi degistiginde
 * dusmesinler, bolum sozlesmesi bozuldugunda dussunler.
 */

const SECTION = "section#projects";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

/**
 * Nav linklerinin dogru anchor'a isaret ettigi Bolge B'nin nav.spec.ts'inde
 * zaten olculuyor; burada tekrarlanmiyor. Bu testin sordugu sey bolumun kendi
 * sozlesmesi: id nav'in bekledigi id, ve landmark icinde dogru yerde.
 */
test("bolum main icinde ve nav'in bekledigi id ile duruyor", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();

  const inMain = await section.evaluate((el) => el.closest("main") !== null);
  expect(inMain).toBe(true);
});

test("bolum kendi basligina bagli ve baslik seviyesi atlanmiyor", async ({ page }) => {
  const section = page.locator(SECTION);

  const labelledby = await section.getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();

  const heading = page.locator(`#${labelledby}`);
  await expect(heading).toBeVisible();
  expect(await heading.evaluate((el) => el.tagName)).toBe("H2");
  await expect(heading).not.toBeEmpty();

  // Tek projede blok bolumun kendisidir: h3 yok, ikinci bir h1 hic yok.
  await expect(section.locator("h3")).toHaveCount(0);
  await expect(section.locator("h1")).toHaveCount(0);
});

test("bolum numarasi dekoratif - ekran okuyucuya okunmuyor", async ({ page }) => {
  const decorative = page.locator(`${SECTION} [aria-hidden="true"]`).first();
  await expect(decorative).toHaveText("02");
});

test("tech tag'leri liste olarak diziliyor", async ({ page }) => {
  const tags = page.locator(`${SECTION} ul li`);
  await expect(tags).toHaveCount(4);
});

/**
 * Imza sayisinin ifadesi yazilmadi (#17). design-spec.md §3.3.1: metrics bossa
 * satir HIC render edilmez - bos cerceve, tire veya placeholder yok.
 */
test("metrics yazilmadigi icin MetricRow hic render edilmiyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} dl`)).toHaveCount(0);
  await expect(page.locator(SECTION)).not.toContainText("—");
});

test("ekran goruntusu gercekten yukleniyor ve yerini onceden ayiriyor", async ({ page }) => {
  const image = page.locator(`${SECTION} img`);
  await expect(image).toHaveCount(1);

  // Bos olmayan alt: dekoratif degil, gercek icerik (design-spec.md §7.5).
  const alt = await image.getAttribute("alt");
  expect(alt?.trim()).toBeTruthy();

  // width/height HTML'de: goruntu inmeden once de oran biliniyor, CLS olusmuyor.
  await expect(image).toHaveAttribute("width", /^\d+$/);
  await expect(image).toHaveAttribute("height", /^\d+$/);

  // Kayit var olmayan bir dosyaya isaret ediyorsa burada dusiyor.
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
    .toBe(true);
});

test("16/10 oraninda ve tasmiyor", async ({ page }) => {
  const box = await page.locator(`${SECTION} img`).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width / box!.height).toBeCloseTo(1.6, 1);
});

test("iki aksiyon da yeni sekmede ve rel guvenli", async ({ page }) => {
  const section = page.locator(SECTION);

  for (const name of ["GitHub", "Live Demo"]) {
    const link = section.getByRole("link", { name });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
});

/**
 * Yesil disiplini (§5.1): Projects bolumunun TEK yesil odagi Live Demo'nun
 * primary zemini. Proje adi, Tag'ler ve GitHub aksiyonu yesil degil.
 * Yazili kural yerine olculen kural - footer.spec.ts ile ayni yaklasim.
 */
test("bolumdeki tek accent kullanimi Live Demo'nun zemini", async ({ page }) => {
  const users = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accentRgb = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*"))
      .filter((el) => {
        const style = getComputedStyle(el);
        return (
          style.color === accentRgb ||
          style.backgroundColor === accentRgb ||
          style.borderTopColor === accentRgb ||
          style.borderRightColor === accentRgb ||
          style.borderBottomColor === accentRgb ||
          style.borderLeftColor === accentRgb
        );
      })
      .map((el) => (el.textContent ?? "").trim());
  });

  expect(users).toEqual(["Live Demo"]);
});

/**
 * §3.3.2: yigin ikinci proje eklendiginde devreye girer. V1'de total === 1,
 * yani sticky HIC uygulanmamali ve kap normal akista kalmali.
 */
test("tek projede yigin devreye girmiyor", async ({ page }) => {
  const position = await page
    .locator(`${SECTION} article`)
    .evaluate((el) => getComputedStyle(el).position);
  expect(position).toBe("static");
});

test("sticky navbar bolum basligini kapatmiyor", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const margin = await page.locator(SECTION).evaluate((el) => getComputedStyle(el).scrollMarginTop);
  // --nav-height 56px mobil / 64px lg ustunde, ustune 24px. design-spec.md §7.3
  expect(margin).toBe(width >= 1024 ? "88px" : "80px");
});

test("mobilde tek kolon, lg ustunde 12 kolonluk izgara", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const columns = await page
    .locator(`${SECTION} article`)
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(columns.split(" ")).toHaveLength(width >= 1024 ? 12 : 1);
});
