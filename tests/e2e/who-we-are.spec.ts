import { expect, test } from "@playwright/test";

/**
 * Who we are bolumu. docs/design-spec.md §3.4 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor; burada
 * tekrarlanmiyor.
 *
 * Testler metne DEGIL yapiya bagli.
 */

const SECTION = "section#who-we-are";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde ve kendi basligina bagli", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();
  expect(await section.evaluate((el) => el.closest("main") !== null)).toBe(true);

  const labelledby = await section.getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();

  const heading = page.locator(`#${labelledby}`);
  expect(await heading.evaluate((el) => el.tagName)).toBe("H2");
  await expect(heading).not.toBeEmpty();

  // Tek h1 Hero'da kaliyor; bu bolum h1 uretmiyor (§7.1).
  await expect(section.locator("h1")).toHaveCount(0);
});

test("manifesto ve prensipler dolu", async ({ page }) => {
  await expect(page.locator(`${SECTION} p`).first()).not.toBeEmpty();

  const items = page.locator(`${SECTION} ul li`);
  const count = await items.count();
  // Sema 3-5 ile sinirliyor; bolum o araligin disina cikamaz.
  expect(count).toBeGreaterThanOrEqual(3);
  expect(count).toBeLessThanOrEqual(5);
  for (let i = 0; i < count; i++) await expect(items.nth(i)).not.toBeEmpty();
});

/**
 * §3.4: okunabilirlik icin metin genisligi 65ch ile sinirli. Kapsayici 1600px
 * oldugu icin bu sinir olmadan manifesto satir basina 150+ karakter olurdu.
 */
test("metin genisligi okunabilirlik icin sinirli", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  test.skip(width < 1024, "sinir ancak genis ekranda baglayici");

  const box = await page.locator(`${SECTION} p`).first().boundingBox();
  const container = await page.locator(`${SECTION} > div`).first().boundingBox();
  expect(box).not.toBeNull();
  expect(container).not.toBeNull();
  expect(box!.width).toBeLessThan(container!.width);
});

/**
 * §3.4: kolektifi BIRLIKTE anlatir, kisiler bir sonraki bolumde. Bu bolum
 * kisi karti veya portre uretmez - o sinir Team'in.
 */
test("bolum kisi karti veya gorsel uretmiyor", async ({ page }) => {
  await expect(page.locator(`${SECTION} img`)).toHaveCount(0);
  await expect(page.locator(`${SECTION} h3`)).toHaveCount(0);
});

/**
 * Yesil disiplini (§5.1): Who we are'da birincil aksiyon yok, yani accent
 * kotasi SIFIR. Baslik, manifesto ve liste isaretleri accent kullanmaz.
 * footer.spec.ts ile ayni olcum yaklasimi.
 */
test("bolumde accent renk kullanilmiyor", async ({ page }) => {
  const usesAccent = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*")).some((el) => {
      const s = getComputedStyle(el);
      return (
        s.color === accent ||
        s.backgroundColor === accent ||
        s.borderTopColor === accent ||
        s.borderRightColor === accent ||
        s.borderBottomColor === accent ||
        s.borderLeftColor === accent
      );
    });
  });

  expect(usesAccent).toBe(false);
});

/**
 * Bu bolum var oldugu icin Hero'nun ikinci aksiyonu artik ciziliyor.
 * hero.spec.ts'teki "her link var olan bir bolume gider" degismezi bunu
 * zaten kapsiyor; burada dugmenin GELDIGI dogrulaniyor.
 */
test("Hero'nun ikincil aksiyonu bu bolume geldi", async ({ page }) => {
  const link = page.locator('section#hero a[href="#who-we-are"]');
  await expect(link).toHaveCount(1);
  await expect(page.locator(SECTION)).toHaveCount(1);
});

/**
 * Pinlenen prensip dizisi (#56). design-spec.md §3.4 ve §6
 *
 * Uc yol var ve ucu de test ediliyor: gelismis bicim, reduced-motion, ve lg
 * alti. `@supports` yoksa hicbir kural uygulanmadigi icin o da duz listeye
 * dusuyor - dorduncu yol yazilmadan ayni davranisa variyor.
 */
test.describe("pinlenen prensip dizisi", () => {
  test("lg ustunde pinleniyor ve tek seferde tek prensip gorunuyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width < 1024, "gelismis bicim yalnizca lg ustunde");

    const geometry = await page.evaluate(() => {
      const track = document.querySelector(".principle-track") as HTMLElement;
      const pin = document.querySelector(".principle-pin") as HTMLElement;
      return {
        trackHeight: track.getBoundingClientRect().height,
        viewport: window.innerHeight,
        pinPosition: getComputedStyle(pin).position,
        trackTop: track.getBoundingClientRect().top + window.scrollY,
      };
    });

    // Kap viewport'tan yuksek olmali; yoksa pinlenecek bir aralik yok.
    expect(geometry.trackHeight).toBeGreaterThan(geometry.viewport);
    expect(geometry.pinPosition).toBe("sticky");

    const span = geometry.trackHeight - geometry.viewport;
    const seen = new Set<number>();

    for (const fraction of [0.05, 0.3, 0.5, 0.7, 0.95]) {
      await page.evaluate((y) => window.scrollTo(0, y), geometry.trackTop + fraction * span);
      await page.waitForTimeout(200);

      const visible = await page.evaluate(() =>
        [...document.querySelectorAll(".principle")]
          .map((el, index) => ({ index, opacity: Number(getComputedStyle(el).opacity) }))
          .filter((row) => row.opacity > 0.5)
          .map((row) => row.index),
      );

      expect(visible, `${fraction} noktasinda tek prensip gorunmeli`).toHaveLength(1);
      seen.add(visible[0] as number);
    }

    // Dizi gercekten ILERLIYOR - hep ayni prensipte takili kalmiyor.
    expect(seen.size).toBeGreaterThan(1);
  });

  /**
   * ASIL TUZAK, olculerek bulundu: `animation-name: none` hareketi kaldiriyor
   * ama DUZENI kaldirmiyordu. Prensipler mutlak konumda ust uste binip
   * okunmaz oluyordu. Bu yuzden gelismis duzen reduced-motion kapisinin
   * ICINDE.
   */
  test("reduced-motion altinda duz listeye donuyor ve hepsi okunur", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width < 1024, "lg altinda zaten duz liste");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const state = await page.evaluate(() => {
      const track = document.querySelector(".principle-track") as HTMLElement;
      const pin = document.querySelector(".principle-pin") as HTMLElement;
      const items = [...document.querySelectorAll(".principle")];
      return {
        trackHeight: track.getBoundingClientRect().height,
        viewport: window.innerHeight,
        pinPosition: getComputedStyle(pin).position,
        positions: items.map((el) => getComputedStyle(el).position),
        opacities: items.map((el) => Number(getComputedStyle(el).opacity)),
        animations: items.map((el) => getComputedStyle(el).animationName),
      };
    });

    expect(state.pinPosition).toBe("static");
    expect(state.positions.every((p) => p === "static")).toBe(true);
    expect(state.opacities.every((o) => o === 1)).toBe(true);
    expect(state.animations.every((a) => a === "none")).toBe(true);
    // Kap normal akista: viewport'tan yuksek bir bosluk birakmiyor.
    expect(state.trackHeight).toBeLessThan(state.viewport);
  });

  test("lg altinda pin yok, prensipler duz liste", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width >= 1024, "bu yol yalnizca lg altinda");

    const state = await page.evaluate(() => {
      const pin = document.querySelector(".principle-pin") as HTMLElement;
      const items = [...document.querySelectorAll(".principle")];
      return {
        pinPosition: getComputedStyle(pin).position,
        positions: items.map((el) => getComputedStyle(el).position),
        opacities: items.map((el) => Number(getComputedStyle(el).opacity)),
      };
    });

    expect(state.pinPosition).toBe("static");
    expect(state.positions.every((p) => p === "static")).toBe(true);
    expect(state.opacities.every((o) => o === 1)).toBe(true);
  });

  /**
   * Sayac dekoratif DEGIL: pinlenen bicimde kullanici dizinin neresinde
   * oldugunu baska turlu bilemez. Duz listede madde isaretleri sirayi zaten
   * soyluyor, o yuzden orada gizleniyor.
   */
  test("sayac gelismis bicimde gorunur, duz listede gizli", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const index = page.locator(`${SECTION} .principle-index`).first();

    expect(await index.evaluate((el) => el.getAttribute("aria-hidden"))).toBeNull();

    const display = await index.evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe(width >= 1024 ? "block" : "none");

    if (width >= 1024) await expect(index).toHaveText(/^\d{2} \/ \d{2}$/);
  });
});
