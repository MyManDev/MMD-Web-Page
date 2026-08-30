import { expect, test } from "@playwright/test";

/**
 * Hero bolumu. docs/design-spec.md §3.2 ve §7.1
 *
 * axe taramasi a11y.spec.ts'te "/" uzerinde zaten kosuyor; burada
 * tekrarlanmiyor.
 *
 * Testler metne DEGIL yapiya bagli: icerik degistiginde dusmesinler, bolum
 * sozlesmesi bozuldugunda dussunler.
 */

const SECTION = "section#hero";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("bolum main icinde ve nav'in bekledigi id ile duruyor", async ({ page }) => {
  const section = page.locator(SECTION);
  await expect(section).toBeVisible();
  expect(await section.evaluate((el) => el.closest("main") !== null)).toBe(true);
});

/**
 * §7.1: sayfada TEK h1 ve o Hero'nun. Projects'in basligi h2, kartlar h3.
 * Bu test hem Hero'yu hem de digerlerini birden korur.
 */
test("sayfanin tek h1'i Hero'da ve bolum ona bagli", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);

  const inHero = await h1.evaluate((el) => el.closest("section#hero") !== null);
  expect(inHero).toBe(true);
  await expect(h1).not.toBeEmpty();

  const labelledby = await page.locator(SECTION).getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();
  expect(await h1.getAttribute("id")).toBe(labelledby);
});

test("baslik ve alt cumle dolu", async ({ page }) => {
  await expect(page.locator(`${SECTION} h1`)).not.toBeEmpty();
  await expect(page.locator(`${SECTION} p`).first()).not.toBeEmpty();
});

/**
 * ASIL DEGISMEZ. §3.2 iki aksiyon tarif ediyor ama ikincisi Who we are'a
 * gidiyor ve o bolum henuz yok (#9). Hicbir yere goturmeyen bir dugme
 * cizmemek icin ikincisi opsiyonel yapildi.
 *
 * Bu test o karari korur ve #9 gelince kendiliginden ikinci dugmeyi de
 * kapsar: Hero'daki her ic link, sayfada GERCEKTEN var olan bir bolume
 * isaret etmeli.
 */
test("Hero'daki her aksiyon var olan bir bolume gidiyor", async ({ page }) => {
  const hrefs = await page
    .locator(`${SECTION} a[href^="#"]`)
    .evaluateAll((links) => links.map((el) => el.getAttribute("href") ?? ""));
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    await expect(page.locator(href), `${href} bir bolume gitmiyor`).toHaveCount(1);
  }
});

test("birincil aksiyon Projects'e gidiyor", async ({ page }) => {
  const primary = page.locator(`${SECTION} a[href="#projects"]`);
  await expect(primary).toHaveCount(1);
  await expect(primary).not.toBeEmpty();
});

/**
 * §3.2 ve §4.4: sayfa yuklenirken giris animasyonu YOK. Hero acilista zaten
 * ekranda; scroll'a bagli bir reveal burada sayfayi yanip sonuyormus gibi
 * gosterirdi.
 */
test("Hero'da acilis animasyonu yok", async ({ page }) => {
  const running = await page
    .locator(SECTION)
    .evaluate((section) =>
      Array.from(section.querySelectorAll("*")).some(
        (el) => getComputedStyle(el).animationName !== "none",
      ),
    );
  expect(running).toBe(false);
});

test("aksiyonlar mobilde alt alta, sm ustunde yan yana", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const direction = await page
    .locator(`${SECTION} a[href^="#"]`)
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).flexDirection);
  expect(direction).toBe(width >= 640 ? "row" : "column");
});

/**
 * Yesil disiplini (§5.1): Hero'nun tek yesil odagi primary CTA'nin zemini.
 * SectionLabel, baslik, alt cumle ve ghost aksiyon yesil DEGIL.
 */
test("bolumdeki tek accent kullanimi birincil aksiyonun zemini", async ({ page }) => {
  const users = await page.locator(SECTION).evaluate((section) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();

    return Array.from(section.querySelectorAll("*"))
      .filter((el) => {
        const s = getComputedStyle(el);
        return (
          s.color === accent ||
          s.backgroundColor === accent ||
          s.borderTopColor === accent ||
          s.borderRightColor === accent ||
          s.borderBottomColor === accent ||
          s.borderLeftColor === accent
        );
      })
      .map((el) => (el.textContent ?? "").trim());
  });

  expect(users).toEqual(["Projects"]);
});

/**
 * Hero amblemi. design-spec.md §3.2
 *
 * Sag kolonda markanin kendi isareti duruyor - uc kafa ve bir "m". Once orada
 * buyutulmus wordmark vardi; bir kelime ancak kenardan tasarsa grafik gibi
 * okunuyor, tasinca da yarim kelime olarak gorunuyordu. Amblem butun duruyor.
 */
test.describe("hero amblemi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  /**
   * Amblem erisilebilir ada KARISMAMALI. Marka adi sayfada zaten navbar ve
   * footer'da okunuyor; ucuncusu bilgi degil agirlik tasiyor.
   */
  test("ekran okuyucuya ucuncu bir marka adi duyurmuyor", async ({ page }) => {
    const spoken = await page.locator(SECTION).evaluate((section) => {
      const clone = section.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return (clone.textContent ?? "").toLowerCase();
    });

    expect(spoken).not.toContain("mymandev");
  });

  /**
   * BUTUN duruyor - tasmiyor. Yerini aldigi wordmark'in tam tersi sozlesme:
   * yarisi kirpilmis bir logo bozuk gorunur, o yuzden kutusu gorunur alanin
   * icinde kalmali.
   */
  test("amblem gorunur alanin icinde, kirpilmadan duruyor", async ({ page }) => {
    const mark = page.locator(".hero-mark");
    test.skip(!(await mark.isVisible()), "amblem yalnizca lg ustunde");

    const box = await mark.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
        vw: window.innerWidth,
      };
    });

    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(box.vw);
    // Kare: maske `contain` ve kutu 1/1, yani bozulma olmamali.
    expect(Math.round(box.width)).toBe(Math.round(box.height));
  });

  /**
   * Maske dosyasi GERCEKTEN yukleniyor.
   *
   * Bu testin varlik sebebi sessizlik: `mask-image` bulunamayan bir dosyaya
   * isaret ederse tarayici hata vermez, oge sadece hic gorunmez. Kutu yerinde
   * durur, olculeri dogrudur, ekranda hicbir sey yoktur - yukaridaki
   * testlerin hicbiri bunu yakalamaz.
   */
  test("maske dosyasi yukleniyor", async ({ page }) => {
    const mark = page.locator(".hero-mark");
    test.skip(!(await mark.isVisible()), "amblem yalnizca lg ustunde");

    const url = await mark.evaluate((el) => {
      const match = /url\("?([^")]+)"?\)/.exec(getComputedStyle(el).maskImage);
      return match?.[1] ?? null;
    });
    expect(url, "maske bir dosyaya isaret etmeli").not.toBeNull();

    const response = await page.request.get(url as string);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("svg");
  });

  /** Amblem sayfayi yatay kaydirilir hale getirmiyor. */
  test("yatay kaydirma uretmiyor", async ({ page }) => {
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(overflows).toBe(false);
  });

  /**
   * §5.1: Hero'nun tek yesili primary CTA. Amblemi de accent yapmak ekranda
   * ikinci bir odak acardi - bu test o gerilemeyi tutar.
   */
  test("amblem accent renk kullanmiyor", async ({ page }) => {
    const mark = page.locator(".hero-mark");
    test.skip(!(await mark.isVisible()), "amblem yalnizca lg ustunde");

    const { markColor, accent } = await mark.evaluate((el) => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      document.body.appendChild(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      return { markColor: getComputedStyle(el).backgroundColor, accent };
    });

    expect(markColor).not.toBe(accent);
  });
});
