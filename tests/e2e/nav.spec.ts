import AxeBuilder from "@axe-core/playwright";

import { site } from "@/content/site";
import { expect, test } from "@playwright/test";

/**
 * Navigation davranisi. docs/design-spec.md §3.1 ve §7.4
 *
 * KAPSAM NOTU: anchor scroll ve aktif link testleri artik VAR (#7). Gozlenecek
 * bir bolum ciktigi anda yazildilar; oncesinde yazilmis olsalari var olmayan
 * bir davranisi test ediyor gorunurlerdi.
 *
 * Testler bolum ADINA bagli DEGIL: hangi bolumlerin var oldugunu sayfadan
 * okuyorlar. Bolum sirasi veya etiketleri degistiginde dusmemeliler; nav ile
 * bolumler arasindaki bag bozuldugunda dusmeliler.
 */

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
    await expect(header.getByRole("link", { name: "MyManDev" })).toBeVisible();
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

  test("dort bolum linki dogru anchor'a isaret ediyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    // Bolum sirasi: architecture.md §2. 03 kolektifi, 04 kisileri anlatir.
    for (const id of ["hero", "projects", "who-we-are", "team"]) {
      await expect(scope.locator(`a[href="#${id}"]`)).toBeVisible();
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
 */
test.describe("navbar scroll'da yerlesiyor", () => {
  const bar = ".nav-bar";

  /* Bu dosyada her `describe` sayfayi KENDI `beforeEach`inde aciyor. Ilk
     yazimda atlamistim ve iki test `about:blank` uzerinde kosup 30s zaman
     asimina dustu - locator hic cozulmedi. Hata mesaji "element bulunamadi"
     demiyor, "timeout" diyor; kalibi bilmeyen biri buna bakip animasyonda
     sorun arar. */
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
    await expect(panel.locator('a[href="#hero"]')).toBeFocused();
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
    const firstLink = panel.locator('a[href="#hero"]');
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

/**
 * Anchor scroll ve aktif link (#7). docs/design-spec.md §3.1 ve §7.3
 *
 * Hangi bolumlerin YAYINDA oldugunu sayfadan okuyoruz. Faz 3 boyunca bolumler
 * tek tek geliyor; testin bilmesi gereken sey hangi bolumun var oldugu degil,
 * var olan her bolumun nav'la dogru baglanmis olmasi.
 */
async function liveSections(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    // YALNIZCA bolum navigasyonu. `header a[href^='#']` demek wordmark'in
    // #main linkini de toplardi ve #main gercekten var - test nav'da olmayan
    // bir linke tiklamaya calisirdi. Desktop nav mobilde CSS ile gizli ama
    // DOM'da duruyor, o yuzden kesif her viewport'ta buradan yapiliyor.
    Array.from(document.querySelectorAll("nav[aria-label='Sections'] a[href^='#']"))
      .map((link) => link.getAttribute("href")!.slice(1))
      .filter((id) => document.getElementById(id) !== null),
  );
}

test.describe("anchor scroll ve aktif link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("en az bir bolum yayinda - yoksa asagidaki testler bos gecerdi", async ({ page }) => {
    expect((await liveSections(page)).length).toBeGreaterThan(0);
  });

  /**
   * Sticky navbar hedef basligi KAPATMAMALI. design-spec.md §7.3 bunu
   * scroll-margin-top ile cozuyor ve §8'in "klavye ile tum bolum ve aksiyonlar
   * erisilebilir" satiri bunu kapsiyor.
   *
   * Olculen sey CSS degeri degil SONUC: bolumun ust kenari navbar'in altinda mi.
   * projects.spec.ts scroll-margin-top'un degerini zaten okuyor; burada o degerin
   * ise yarayip yaramadigina bakiliyor.
   */
  test("anchor'a gidince bolum sticky navbar'in altinda kalmiyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const [id] = await liveSections(page);
    expect(id).toBeTruthy();

    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    await scope.locator(`a[href="#${id}"]`).click();

    await expect
      .poll(async () => {
        const header = await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect());
        const section = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect());
        return Math.round(section.top - header.bottom);
      })
      // scroll-margin-top navbar + 24px; birkac pikselik yuvarlama payi birakiyoruz.
      .toBeGreaterThanOrEqual(0);
  });

  test("anchor tiklamasi URL'e bolum id'sini yaziyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    const [id] = await liveSections(page);

    const scope = isDesktop(width) ? page.getByLabel("Sections") : (await openMenu(page)).panel;
    await scope.locator(`a[href="#${id}"]`).click();

    await expect(page).toHaveURL(new RegExp(`#${id}$`));
  });

  /**
   * Aktif link tespiti tek bir IntersectionObserver ile yapiliyor
   * (useActiveSection). Renk TEK BASINA bilgi tasimaz (§7.5): aktif link ayni
   * zamanda aria-current="true" tasimak zorunda.
   */
  test("bolume gidince o linkin aria-current'i aciliyor, digerlerininki kapali", async ({
    page,
  }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(!isDesktop(width), "aktif link yalnizca desktop nav'da gorunur");

    const [id] = await liveSections(page);
    const nav = page.getByLabel("Sections");

    // Acilis durumu VARSAYILMIYOR: hangi bolumun ilk ekranda gozlem bandina
    // girdigi sayfa yuksekligine bagli ve bolumler geldikce degisecek.
    // Olculen sey scroll SONRASI durum.
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();

    await expect(nav.locator(`a[href="#${id}"]`)).toHaveAttribute("aria-current", "true");
    await expect(nav.locator("[aria-current]")).toHaveCount(1);
  });

  test("aktif link accent rengini aliyor - renk aria-current'a EK", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(!isDesktop(width), "aktif link yalnizca desktop nav'da gorunur");

    const [id] = await liveSections(page);
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();

    const link = page.getByLabel("Sections").locator(`a[href="#${id}"]`);
    await expect(link).toHaveAttribute("aria-current", "true");

    const accentColor = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    });

    // Tek okuma YETMEZ: NavLink'te transition-colors 150ms var ve rengi gecis
    // ortasinda okumak ara bir ton veriyor (olculdu: rgb(130, 215, 134)).
    // Beklenen sey gecisin BITTIGI deger.
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).toBe(accentColor);
  });

  test("mobil menude bir linke tiklayinca menu kapaniyor", async ({ page }, testInfo) => {
    const width = testInfo.project.use.viewport?.width ?? 0;
    test.skip(isDesktop(width), "yalnizca < lg viewport");

    const [id] = await liveSections(page);
    const { toggle, panel } = await openMenu(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await panel.locator(`a[href="#${id}"]`).click();

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(new RegExp(`#${id}$`));

    // NOT: link tiklamasindan SONRA focus'un nereye gittigi §7.4'te YAZILI
    // DEGIL - orada yalnizca Escape'in focus'u dugmeye geri verdigi belirtiliyor.
    // Olculdu: tiklamadan sonra focus dugmede DEGIL. Burada bir sozlesme
    // uydurmuyoruz; davranis once yazilmali, sonra test edilmeli. Bolge B.
  });
});

/**
 * Mikro etkilesimler (#55). docs/design-spec.md §6
 *
 * `roll`: nav etiketi iki kez yaziliyor ve hover/focus'ta dikey kayiyor.
 * Kural app/globals.css'te; burada davranisi olculuyor.
 */
test.describe("nav mikro etkilesimleri", () => {
  const NAV = 'nav[aria-label="Sections"]';

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
