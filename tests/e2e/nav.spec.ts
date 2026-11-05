import AxeBuilder from "@axe-core/playwright";

import { site } from "@/content/site";
import { expect, test } from "@playwright/test";

const isDesktop = (width: number) => width >= 1024;

/**
 * Mobil menu panelini dugmenin aria-controls'u uzerinden bulur.
 * Desktop nav mobilde CSS ile gizli ama DOM'da duruyor, o yuzden linkleri
 * href ile aramak iki eleman buluyor. Panele sabitlemek hem dogru elemani
 * secer hem de aria-controls baginin gercekten kurulu oldugunu dogrular.
 */
async function openMenu(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /menu/i });
  const id = await toggle.getAttribute("aria-controls");
  expect(id).toBeTruthy();
  await toggle.click();
  return { toggle, panel: page.locator(`#${id}`) };
}

test.describe("navbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sticky ve wordmark tasiyor", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: "MyManDev home" })).toBeVisible();
    await expect(header).toHaveCSS("position", "sticky");
  });

  test("zemin saydam degil", async ({ page }) => {
    // Referans mockup'taki blur'lu saydam bar bilincli olarak reddedildi.
    const bg = await page
      .getByRole("banner")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toBe("transparent");
  });

  test("uc sayfa kendi adresine baglaniyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const scope = isDesktop(width)
      ? page.getByLabel("Pages", { exact: true })
      : (await openMenu(page)).panel;
    for (const item of site.nav) {
      await expect(scope.getByRole("link", { name: item.label, exact: true })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  test("GitHub aksiyonu yeni sekmede ve rel guvenli", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    if (!isDesktop(width)) await openMenu(page);
    const link = page.getByRole("link", { name: "GitHub" }).first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  });
});

/**
 * TEPEDE SESSIZ, SCROLL'DA BELIRGIN. design-spec.md §3.1
 *
 * Blur ve yari saydam zemin ZATEN vardi; degisen sey barin tepede ve scroll'da
 * ayni gorunmemesi. Tetikleyici `animation-timeline: scroll()` - scroll
 * listener degil, yani CLAUDE.md kural 3 degismedi.
 *
 * Olculen sey FARK, sabit degerler degil: iki durumdaki `background-color`
 * ayni olmamali. Degeri yazsam opaklik ayarlandiginda davranis bozulmadigi
 * halde test duserdi.
 *
 * Tek istisna, bilerek: #106'nin tint tabani sabit bir ALT SINIR tutuyor
 * (asagida). Opaklik o sinirin altina indiginde dusmesi gereken test o.
 */
test.describe("navbar scroll'da yerlesiyor", () => {
  const bar = ".nav-bar";

  /* Bu dosyada her `describe` sayfayi KENDI `beforeEach`inde aciyor. Ilk
     yazimda atlamistim ve iki test `about:blank` uzerinde kosup 30s zaman
     asimina dustu - locator hic cozulmedi. Hata mesaji "element bulunamadi"
     demiyor, "timeout" diyor; kalibi bilmeyen biri buna bakip animasyonda
     sorun arar. */
  test.beforeEach(async ({ page }) => {
    await page.goto("/team");
  });

  test("scroll 0 ile scroll sonrasi ayni degil", async ({ page }) => {
    const read = () => page.locator(bar).evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.evaluate(() => window.scrollTo(0, 0));
    const top = await read();

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(read).not.toBe(top);
  });

  /**
   * EN ONEMLI TEST: bar dinlenme halinde OKUNUR olan tarafa dusuyor.
   * Keyframe'de yalnizca `from` tanimli, yani animasyon kalktiginda tanimli
   * zemin kaliyor. Ters yazilsaydi bar saydam kalirdi ve Team'in acik gokyuzlu
   * fotograflari uzerinde nav yazisi okunmaz olurdu.
   */
  test("reduced-motion altinda bar tanimli zemine dusuyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const state = await page.locator(bar).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, background: cs.backgroundColor };
    });

    expect(state.name).toBe("none");
    /* Saydam DEGIL: alfa 0 olan bir zemin okunurlugu fotografa birakirdi. */
    expect(state.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(state.background).not.toMatch(/\/\s*0\s*\)$/);
  });

  /**
   * TINT TABANI (#106). Bar rengi page'in kendisi, yani nav yazisinin
   * kontrastini belirleyen tek sayi opaklik. %92, bugunku icerik uzerinde
   * olculen her noktada AA'yi tutan deger; olcum ve sayilar design-spec.md §3.1.
   * Once %87'ydi; SquadOpt'un acik renkli ekran goruntuleri onu yetersiz birakti.
   *
   * SINIRI: bu test yalnizca opakligi tutuyor, kontrasti degil. %92 bembeyaz
   * bir zeminde AA'yi tutmaz; bir bolumun ust kenarina acik bir gorsel eklenirse
   * olcum yinelenir. axe da bunu goremez: arkadaki gorseli ve backdrop-filter'i
   * hesaba katmiyor. Olculen sey dinlenme halindeki alfa - reduced-motion'da
   * animasyon yok.
   */
  test("dinlenme halindeki tint #106 tabaninin altina inmiyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const alpha = await page.locator(bar).evaluate((el) => {
      const value = getComputedStyle(el).backgroundColor;
      // Chromium bunu `oklab(... / 0.92)` diye donduruyor; alfa egik cizgiden sonra.
      // Eski rgba() bicimi icin dorduncu bilesene dusuyoruz (team.spec.ts ile ayni).
      const slash = value.split("/")[1];
      if (slash) return Number.parseFloat(slash);
      const parts = value.replace(/[^0-9.,]/g, "").split(",");
      return parts.length === 4 ? Number(parts[3]) : 1;
    });

    expect(alpha).toBeGreaterThanOrEqual(0.92);
  });
});

/**
 * ILETISIM AKSIYONU. design-spec.md §3.1
 *
 * Contact bir sure kendi bolumuydu ve kaldirildi: tek bir adres icin kendi
 * basligi olan bir bolum fazla agirdi. Artik bir OLANAK - ziyaretcinin iletisim
 * aradigi yer nav, adresi okudugu yer footer (§3.6).
 */
test.describe("iletisim aksiyonu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("nav'da bir mailto aksiyonu var ve adres icerikten geliyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width < 1024, "masaustu aksiyonlari yalnizca lg ustunde");

    /*
      `filter({ visible: true })` SART ve bunu bir dusus ogretti: kapali mobil
      menu de `<header>` icinde yasiyor ve ayni `mailto` aksiyonunu tasiyor -
      `display: none` oldugu icin odaklanamiyor ve gorunmuyor, ama SECICI onu
      buluyor. Filtresiz `toHaveCount(1)` iki oge gorup dustu.

      Sayiyi 2 yapmak yanlis olurdu: o, mobil menunun DOM'da durdugunu
      sozlesmeye cevirirdi. Olculen sey gorunur aksiyonun tekligi.
    */
    const action = page.locator(`header a[href="mailto:${site.email}"]`).filter({ visible: true });
    await expect(action).toHaveCount(1);
  });

  /**
   * `external` DEGIL: o bayrak yeni sekme aciyor ve dis link ikonu koyuyor. Bir
   * `mailto` yeni sekmede acilacak bir sayfa degil - ikon orada bilgi katmaz,
   * YANLIS soyler. O yuzden yoklugu olculuyor.
   */
  test("yeni sekmede acilmiyor ve dis link ikonu tasimiyor", async ({ page }, testInfo) => {
    test.skip((testInfo.project.use.viewport?.width ?? 0) < 1024, "lg ustunde");

    const action = page.locator(`header a[href="mailto:${site.email}"]`).filter({ visible: true });
    expect(await action.getAttribute("target")).toBeNull();
    await expect(action.locator("svg")).toHaveCount(0);
  });

  /**
   * §5.1: Navigation'in tek yesili AKTIF NAV LINKI. Iki aksiyon da `ghost`,
   * yani accent tasimiyor - ikinci bir yesil odak acilmiyor.
   */
  test("aksiyonlar accent tasimiyor", async ({ page }, testInfo) => {
    test.skip((testInfo.project.use.viewport?.width ?? 0) < 1024, "lg ustunde");

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
      ({ accentColor, email }) =>
        [
          ...document.querySelectorAll(
            `header a[href="mailto:${email}"], header a[href^="https://github"]`,
          ),
        ]
          .filter((el) => {
            const style = getComputedStyle(el);
            return style.color === accentColor || style.backgroundColor === accentColor;
          })
          .map((el) => el.textContent?.trim() ?? ""),
      { accentColor: accent, email: site.email },
    );

    expect(users).toEqual([]);
  });

  /** Mobil menu bir kisayol degil: ayni iki olanagin dar ekrandaki hali. */
  test("mobil menude de duruyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(width >= 1024, "mobil menu yalnizca lg altinda");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Menu" }).click();

    const panel = page.locator(
      "#" + (await page.getByRole("button", { name: "Menu" }).getAttribute("aria-controls")),
    );
    await expect(panel.locator(`a[href="mailto:${site.email}"]`)).toHaveCount(1);
  });
});

test.describe("mobil menu", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(isDesktop(width), "yalnizca < lg viewport");
    await page.goto("/");
  });

  test("dugme aria-expanded ve aria-controls tasiyor", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /menu/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-controls", /.+/);
  });

  test("acilinca focus ilk linke geciyor", async ({ page }) => {
    const { panel } = await openMenu(page);
    await expect(panel.locator('a[href="/"]')).toBeFocused();
  });

  test("Escape kapatiyor ve focus'u dugmeye GERI VERIYOR", async ({ page }) => {
    const { toggle } = await openMenu(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("focus menu icinde donuyor", async ({ page }) => {
    const { panel } = await openMenu(page);
    const firstLink = panel.locator('a[href="/"]');
    await expect(firstLink).toBeFocused();

    /*
      SAYI MENUDEN SAYILIYOR, elle yazilmiyor. Burada `i < 5` ve "dort link +
      GitHub = bes oge" yorumu vardi; Contact bolumu eklenince alti oldu ve test
      davranis bozulmadigi halde dustu. Odaklanabilir oge sayisi sozlesme degil,
      DONMESI sozlesme.
    */
    const focusable = await panel.locator("a, button").count();
    expect(focusable).toBeGreaterThan(1);

    for (let i = 0; i < focusable; i += 1) await page.keyboard.press("Tab");
    await expect(firstLink).toBeFocused();
  });

  test("acikken arkadaki sayfa inert ve scroll kilitli", async ({ page }) => {
    await openMenu(page);

    await expect(page.getByRole("main")).toHaveAttribute("inert", "");
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).toBe("hidden");
  });

  test("kapaninca inert ve scroll kilidi kalkiyor", async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press("Escape");

    await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).not.toBe("hidden");
  });

  test("menu acikken axe ihlali yok", async ({ page }) => {
    await openMenu(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("sayfalar arasi gezinme", () => {
  test("sayfa linkleri, aktif durum ve geri-ileri calisiyor", async ({ page }, testInfo) => {
    const desktop = isDesktop(testInfo.project.use.viewport?.width ?? 0);
    await page.goto("/");
    for (const [href, title] of [
      ["/projects", "Projects"],
      ["/team", "Team"],
      ["/", "MyManDev"],
    ]) {
      const scope = desktop
        ? page.getByLabel("Pages", { exact: true })
        : (await openMenu(page)).panel;
      await scope.locator(`a[href="${href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
      await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
      if (!desktop)
        await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
          "aria-expanded",
          "false",
        );
      const nav = page.getByLabel("Pages", { exact: true });
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveAttribute("href", href!);
      const main = page.locator("main");
      await expect(main.locator("#hero, #who-we-are")).toHaveCount(0);
      if (href !== "/projects") await expect(main.locator("#projects")).toHaveCount(0);
      if (href !== "/team") await expect(main.locator("#team")).toHaveCount(0);
      const reveal = main.locator(".reveal-on-enter").first();
      if (await reveal.count()) {
        await reveal.scrollIntoViewIfNeeded();
        await expect(reveal).toHaveCSS("opacity", "1");
      }
    }
    await page.goBack();
    await expect(page).toHaveURL(/\/team$/);
    await expect(
      page.getByLabel("Pages", { exact: true }).locator('[aria-current="page"]'),
    ).toHaveAttribute("href", "/team");
    await page.goForward();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "MyManDev" })).toBeVisible();
  });

  test("wordmark ana sayfaya geri donuyor", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "MyManDev home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "MyManDev" })).toBeVisible();
  });
});

/**
 * Mikro etkilesimler (#55). docs/design-spec.md §6
 *
 * `roll`: nav etiketi iki kez yaziliyor ve hover/focus'ta dikey kayiyor.
 * Kural app/globals.css'te; burada davranisi olculuyor.
 */
test.describe("nav mikro etkilesimleri", () => {
  const NAV = 'nav[aria-label="Pages"]';

  test.beforeEach(async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    // Masaustu nav'i lg altinda gizli; roll ve wordmark oradaki yuzeyler.
    test.skip(width < 1024, "masaustu nav yalnizca lg ustunde gorunur");
    await page.goto("/");
  });

  /**
   * EN KRITIK DEGISMEZ: etiket iki kez YAZILIYOR ama bir kez OKUNUYOR.
   * Ikinci kopya aria-hidden degilse ekran okuyucu her linki iki kez okur ve
   * gorsel bir detay gezinmeyi bozar.
   */
  test("etiket iki kez yaziliyor ama erisilebilir ad tek", async ({ page }) => {
    const names = await page.evaluate((nav) => {
      return [...document.querySelectorAll(`${nav} a`)].map((a) => {
        const clone = a.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        return clone.textContent?.trim() ?? "";
      });
    }, NAV);

    /* Beklenen deger TURETILIYOR, sabit yazilmiyor: etiketler `content/site.ts`de
       tek yerde duruyor ve baslik bicimi degistiginde (ornek: "Who we are" ->
       "Who We Are") sabit bir liste davranis bozulmadigi halde duser. Deponun
       daha once yasadigi hata bu. */
    expect(names).toEqual(site.nav.map((item) => item.label));

    // Gorsel kopya gercekten VAR - yoksa test bir sey kanitlamiyor olurdu.
    const rendered = await page.locator(`${NAV} a`).first().innerText();
    expect(rendered.split("\n").filter(Boolean)).toHaveLength(2);
  });

  test("roll kutusu tam bir satir ve tasan kismi gizli", async ({ page }) => {
    const geometry = await page.evaluate((nav) => {
      const roll = document.querySelector(`${nav} .roll`) as HTMLElement;
      const track = roll.querySelector(".roll-track") as HTMLElement;
      const first = track.firstElementChild as HTMLElement;
      return {
        roll: roll.getBoundingClientRect().height,
        track: track.getBoundingClientRect().height,
        line: first.getBoundingClientRect().height,
        overflow: getComputedStyle(roll).overflow,
      };
    }, NAV);

    expect(geometry.overflow).toBe("hidden");
    expect(geometry.roll).toBeCloseTo(geometry.line, 1);
    expect(geometry.track).toBeCloseTo(geometry.line * 2, 1);
  });

  test("hover'da kayiyor", async ({ page }) => {
    const track = page.locator(`${NAV} .roll-track`).first();
    expect(await track.evaluate((el) => getComputedStyle(el).translate)).toBe("none");

    await page.locator(`${NAV} a`).first().hover();
    await expect
      .poll(() => track.evaluate((el) => getComputedStyle(el).translate))
      .not.toBe("none");
  });

  /**
   * KLAVYE PARITESI. Yalnizca hover'a baglanan bir detayi klavye kullanicisi
   * HIC gormez; detay olmaktan cikip fare sahiplerine ozel bir sey olur.
   * `link.focus()` yerine gercek Tab kullaniliyor cunku :focus-visible
   * programatik focus'ta tetiklenmeyebiliyor.
   */
  test("focus-visible'da da kayiyor", async ({ page }) => {
    const first = page.locator(`${NAV} a`).first();

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      if (await first.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(first).toBeFocused();

    const translate = await page
      .locator(`${NAV} .roll-track`)
      .first()
      .evaluate((el) => getComputedStyle(el).translate);
    expect(translate).not.toBe("none");
  });

  test("wordmark alt cizgi aliyor ve cizgi accent degil", async ({ page }) => {
    const rule = page.locator("header .rule").first();
    await expect(rule).toHaveCount(1);

    const line = await rule.evaluate((el) => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      document.body.appendChild(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      const after = getComputedStyle(el, "::after");
      return { scale: after.scale, background: after.backgroundColor, accent };
    });

    // Dinlenme halinde cizgi kapali.
    expect(line.scale).toBe("0 1");
    expect(line.background).not.toBe(line.accent);
  });
});
