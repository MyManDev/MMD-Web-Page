import { expect, test } from "@playwright/test";

/**
 * Team bolumu - kisi kartlari. docs/design-spec.md §3.5 ve §5.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor ve Team o taramaya
 * dahil; burada tekrarlanmiyor.
 *
 * Testler kisi ADINA bagli DEGIL: icerik dosyasi degistiginde dusmesinler,
 * bolum sozlesmesi bozuldugunda dussunler.
 */

const SECTION = "section#team";
const CARD = `${SECTION} article`;

/** Hover destekleyen bir cihazda miyiz - beklenen davranis buna bagli. */
const hoverCapable = (page: import("@playwright/test").Page) =>
  page.evaluate(() => matchMedia("(hover: hover)").matches);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde, kendi basligina bagli, seviye atlanmiyor", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();

  const inMain = await section.evaluate((el) => el.closest("main") !== null);
  expect(inMain).toBe(true);

  const labelledby = await section.getAttribute("aria-labelledby");
  const heading = page.locator(`#${labelledby}`);
  expect(await heading.evaluate((el) => el.tagName)).toBe("H2");

  await expect(section.locator("h1")).toHaveCount(0);
  await expect(section.locator("h3")).toHaveCount(await page.locator(CARD).count());
});

test("kartlar liste olarak diziliyor - ekran okuyucu sayiyi duyurur", async ({ page }) => {
  const items = page.locator(`${SECTION} ul > li`);
  await expect(items).toHaveCount(await page.locator(CARD).count());
});

test("her kartin fotografi gercekten yukleniyor ve yerini onceden ayiriyor", async ({ page }) => {
  const images = page.locator(`${CARD} img`);
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute("width", /^\d+$/);
    await expect(image).toHaveAttribute("height", /^\d+$/);
    await expect(image).toHaveAttribute("srcset", /-360\.webp 360w/);
    await expect(image).toHaveAttribute("srcset", /-720\.webp 720w/);

    expect((await image.getAttribute("alt"))?.trim()).toBeTruthy();

    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
});

/**
 * ACIKLAMA HER ZAMAN DOM'DA. Acilip kapanan sey yuksekligi; display: none
 * veya visibility: hidden kullanilmiyor cunku ekran okuyucu onu her durumda
 * okuyabilmeli. design-spec.md §3.5
 */
test("aciklama kapaliyken bile DOM'da ve okunabilir durumda", async ({ page }) => {
  const bio = page.locator(`${CARD} [data-bio] p`).first();

  const style = await bio.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { display: computed.display, visibility: computed.visibility };
  });
  expect(style.display).not.toBe("none");
  expect(style.visibility).not.toBe("hidden");

  expect((await bio.textContent())?.trim()).toBeTruthy();
});

test("hoversiz cihazda aciklama HER ZAMAN acik, hoverli cihazda kapali baslar", async ({
  page,
}) => {
  const rows = await page
    .locator(`${CARD} [data-bio]`)
    .first()
    .evaluate((el) => getComputedStyle(el).gridTemplateRows);

  if (await hoverCapable(page)) {
    expect(rows).toBe("0px");
  } else {
    // Dokunmatikte :hover ya hic tetiklenmiyor ya ilk dokunusta takili
    // kaliyor; aciklama yalnizca hover'a baglanirsa ERISILEMEZ icerik olurdu.
    expect(parseFloat(rows)).toBeGreaterThan(0);

    // Dokunmatikte daktilo HIC calismaz: metin bastan tam gorunur olmali.
    const lastCharacter = page.locator(`${CARD} [data-bio] p span`).last();
    expect(await lastCharacter.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  }
});

test("fare hover'i aciklamayi aciyor ve metni gorunur kiliyor", async ({ page }) => {
  test.skip(!(await hoverCapable(page)), "hoversiz cihazda aciklama zaten acik");

  const card = page.locator(CARD).first();
  const row = card.locator("[data-bio]");

  await card.hover();
  await expect
    .poll(() => row.evaluate((el) => parseFloat(getComputedStyle(el).gridTemplateRows)))
    .toBeGreaterThan(0);

  // Satirin acilmasi yetmez: metin ayrica DAKTILO ile yaziliyor. Yazilan harf
  // sayisi metnin tamamina ulasmali - yarim kalan bir animasyon da gecerdi.
  // Olculen sey son harfin GORUNUR olmasi - yarim kalan bir animasyon da
  // "acildi" sayilirdi.
  const lastCharacter = row.locator("p span").last();
  await expect
    .poll(() => lastCharacter.evaluate((el) => Number(getComputedStyle(el).opacity)), {
      timeout: 15_000,
    })
    .toBe(1);
});

/**
 * Kart hover'da kalkiyor. design-spec.md §6: kalkma yasagi ProjectCard'a ait
 * ve gerekcesi sticky yigin; TeamCard yiginda degil.
 *
 * `transform` ile: layout'a dokunmadigi icin komsu kartlar kaymiyor. Olculen
 * sey de bu - yalnizca kalkmis olmasi degil, komsunun YERINDE kalmasi.
 */
test("kart hover'da kalkiyor, komsusu yerinde kaliyor", async ({ page }) => {
  test.skip(!(await hoverCapable(page)), "hoversiz cihazda hover yok");

  const cards = page.locator(CARD);
  if ((await cards.count()) < 2) test.skip(true, "komsu kart yok");

  const first = cards.first();
  const second = cards.nth(1);

  // Tailwind v4 `translate` ozelligini kullaniyor, `transform` degil.
  const resting = await first.evaluate((el) => getComputedStyle(el).translate);
  /**
   * Komsunun yeri BOLUME GORE olculuyor. Mutlak koordinat iki sebeple oynuyor:
   * hover() karti gorunur kilmak icin sayfayi kaydiriyor, ve bolum girisi
   * animasyonu (reveal-on-enter) scroll'a bagli olarak icerigi 16px'e kadar
   * tasiyor. Ikisi de bu testin sordugu sey degil.
   *
   * Referans BOLUM DEGIL IZGARA: reveal sarmalayicisi bolumun icinde, yani
   * bolume gore olcum de o 16px'i tasiyordu (olculdu). Izgara ile komsu ayni
   * sarmalayicinin icinde ve birlikte hareket ediyor, dolayisiyla aradaki
   * fark yalnizca kartin kalkmasina duyarli kaliyor.
   */
  const offsetInGrid = () =>
    second.evaluate((el) =>
      Math.round(el.getBoundingClientRect().top - el.closest("ul")!.getBoundingClientRect().top),
    );
  const neighbourBefore = await offsetInGrid();

  await first.hover();

  await expect.poll(() => first.evaluate((el) => getComputedStyle(el).translate)).not.toBe(resting);

  expect(await offsetInGrid()).toBe(neighbourBefore);
});

/**
 * KLAVYE: hover tek yol degil. Karttaki linke focus gelince ayni aciklama
 * aciliyor (:focus-within). Klavye erisimi sert kapi - architecture.md §8.
 */
test("klavye focus'u aciklamayi aciyor - hover tek yol degil", async ({ page }) => {
  test.skip(!(await hoverCapable(page)), "hoversiz cihazda aciklama zaten acik");

  const card = page.locator(CARD).first();
  const row = card.locator("[data-bio]");
  await expect.poll(() => row.evaluate((el) => getComputedStyle(el).gridTemplateRows)).toBe("0px");

  await card.getByRole("link").first().focus();

  await expect
    .poll(() => row.evaluate((el) => parseFloat(getComputedStyle(el).gridTemplateRows)))
    .toBeGreaterThan(0);
});

/**
 * Linkin acilan alanin DISINDA durmasi sart: icinde olsaydi klavyeyle
 * ulasilamazdi - focus'lanmak icin acilmasi, acilmak icin focus'lanmasi
 * gerekirdi.
 */
test("GitHub linki acilan alanin disinda ve her zaman odaklanabilir", async ({ page }) => {
  const link = page.locator(CARD).first().getByRole("link").first();

  const insideReveal = await link.evaluate((el) => el.closest("[data-bio]") !== null);
  expect(insideReveal).toBe(false);

  await link.focus();
  await expect(link).toBeFocused();
});

test("kart linkleri yeni sekmede ve rel guvenli", async ({ page }) => {
  const links = page.locator(`${CARD} a`);
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    await expect(links.nth(i)).toHaveAttribute("target", "_blank");
    await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
    await expect(links.nth(i)).toHaveAttribute("rel", /noreferrer/);
  }
});

/**
 * Yesil disiplini (§5.1): Team'de accent KULLANILMAZ - bolumde birincil
 * aksiyon yok. Hover'da da gelmiyor, ki asil risk orada.
 */
test("bolumde accent renk kullanilmiyor - hover'da bile", async ({ page }) => {
  const usesAccent = () =>
    page.locator(SECTION).evaluate((section) => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      document.body.appendChild(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();

      return Array.from(section.querySelectorAll("*")).some((el) => {
        const style = getComputedStyle(el);
        return (
          style.color === accent ||
          style.backgroundColor === accent ||
          style.borderTopColor === accent
        );
      });
    });

  expect(await usesAccent()).toBe(false);

  await page.locator(CARD).first().hover();
  expect(await usesAccent()).toBe(false);
});

test("mobilde tek kolon, sm'de iki, lg'de uc", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const columns = await page
    .locator(`${SECTION} ul`)
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);

  expect(columns).toBe(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
});
