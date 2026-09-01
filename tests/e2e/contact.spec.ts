import { expect, test } from "@playwright/test";

import { site } from "@/content";

/**
 * Contact bolumu. docs/design-spec.md §3.7
 *
 * Bu bolumun varlik sebebi olculmus bir boslukti: sitede hicbir iletisim yolu
 * yoktu. O yuzden testler "gorunuyor mu"dan fazlasini soruyor - KAPI GERCEKTEN
 * ACIYOR MU.
 */

const SECTION = "section#contact";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde ve kendi basligina bagli", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();

  const inMain = await section.evaluate((el) => el.closest("main") !== null);
  expect(inMain).toBe(true);

  const heading = section.locator("h2");
  await expect(heading).toHaveCount(1);
  const labelledBy = await section.getAttribute("aria-labelledby");
  expect(labelledBy).toBe(await heading.getAttribute("id"));
});

/**
 * ADRES ICERIKTEN geliyor, component'te sabit yazilmiyor - ve test de onu
 * icerikten turetiyor. Adres iki yerde yasarsa ayrildiklarinda kimse fark
 * etmez: kapi calisiyor gorunur, baska bir yere acar.
 */
test("mailto adresi icerikteki adresle ayni", async ({ page }) => {
  const link = page.locator(`${SECTION} a[href^="mailto:"]`);
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", `mailto:${site.email}`);

  /* Adres AKSIYONUN ETIKETI: tiklamadan da gorunuyor ve kopyalanabiliyor. */
  await expect(link).toHaveText(site.email);
});

/**
 * `external` DEGIL. `Button`in dis link bicimi yeni sekme aciyor ve ikon
 * koyuyor; bir `mailto` yeni sekmede acilacak bir sayfa degil. Ikon orada
 * bilgi katmaz, YANLIS soyler - o yuzden yoklugu de olculuyor.
 */
test("yeni sekmede acilmiyor ve dis link ikonu tasimiyor", async ({ page }) => {
  const link = page.locator(`${SECTION} a[href^="mailto:"]`);

  expect(await link.getAttribute("target")).toBeNull();
  await expect(link.locator("svg")).toHaveCount(0);
});

/**
 * §5.1: bolumun TEK yesili adres aksiyonunun zemini. Baslik yesil degil.
 */
test("tek accent kullanimi adres aksiyonunun zemini", async ({ page }) => {
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });

  const users = await page.evaluate(
    ({ selector, accentColor }) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll(`${selector} *`)) {
        const style = getComputedStyle(el);
        if (style.color === accentColor || style.backgroundColor === accentColor)
          out.push(el.tagName + (el.getAttribute("href") ?? ""));
      }
      return out;
    },
    { selector: SECTION, accentColor: accent },
  );

  expect(users).toEqual([`Amailto:${site.email}`]);
});

/**
 * NAV'DAN ULASILIYOR. Bir kapinin varligi, ona giden bir yol olmadan yarim.
 * Etiket ve id `content/site.ts`ten turetiliyor.
 */
test("nav'dan bolume gidiliyor", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  test.skip(width < 1024, "masaustu nav yalnizca lg ustunde");

  /* Tiklayan test reduced-motion altinda: hareketli sayfada ilk tiklama bosa
     dusuyor (HANDOFF'ta olculmus). */
  await page.emulateMedia({ reducedMotion: "reduce" });

  const item = site.nav.find((entry) => entry.id === "contact");
  expect(item).toBeDefined();

  await page.locator(`nav[aria-label="Sections"] a[href="#${item!.id}"]`).click();

  /*
    "TEPEDE MI" DEGIL "EKRANDA MI". Ilk yazimda `|top| < 200` vardi ve dustu:
    Contact ile footer birlikte bir ekrandan kisa, yani tarayici bu bolumu
    tepeye CIKARAMIYOR - sayfanin altinda kaydiracak yer kalmiyor. Iddia
    yanlisti, davranis dogruydu.

    Olculmesi gereken sozlesme: linke basan kisi bolumu GORUYOR.
  */
  await expect
    .poll(() =>
      page.locator(SECTION).evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.top < window.innerHeight && box.bottom > 0;
      }),
    )
    .toBe(true);
});
