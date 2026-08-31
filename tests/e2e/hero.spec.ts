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
 * HERO ZEMINI - tema uyumlu renk gecisi. design-spec.md §3.2
 *
 * Iki sey birden olculuyor ve ikincisi kapinin kendisi:
 *
 * 1. Zeminde gercekten bir gecis var mi (duz renk degil).
 * 2. Gecis metni okunmaz yapiyor mu. Olcum EN KOTU DURUM uzerinden: metin
 *    gradyanin EN UZAK ucunda bile AA'yi geciyorsa arada kalan her noktada
 *    geciyor - luminans iki durak arasinda tekduze degisiyor. Bu, piksel
 *    ornekleyip "en acik piksel hangisi" diye aramaktan hem daha saglam hem
 *    daha hizli (o tuzak navbar'da bir kez yasandi: en acik piksel zemin degil
 *    YAZI cikti).
 *
 * Gecisin BIR TINT oldugu de olculuyor: iki durak arasindaki kontrast 1.6'nin
 * altinda kalmali. Ustune cikarsa bu artik bir tint degil bir parlama olur ve
 * CLAUDE.md kural 2 onu yasakliyor.
 */
test("Hero zemini gecisli, ama metin en kotu noktada bile okunuyor", async ({ page }) => {
  const field = page.locator("#hero");

  const image = await field.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(image).toContain("gradient");

  /*
    Renkler CANVAS'TAN okunuyor, `getComputedStyle` dizesinden DEGIL. Sebep
    olculdu: `color-mix(in oklab, ...)` ile yazilmis bir token Chrome'da
    `oklab(0.515 -0.079 ...)` olarak seri hale geliyor ve dizeden sayi
    ayiklamak ondalik basamaklari kanal saniyor - ilk denemede "kontrast"
    280 milyon cikti. Canvas hangi notasyonda yazildigina bakmadan sRGB
    baytlarini veriyor.
  */
  const measured = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const toRgb = (value: string): [number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!];
    };
    return {
      far: toRgb(root.getPropertyValue("--hero-field-far").trim()),
      pageColor: toRgb(root.getPropertyValue("--color-page").trim()),
      heading: toRgb(getComputedStyle(document.querySelector("#hero h1")!).color),
      body: toRgb(getComputedStyle(document.querySelector("#hero p")!).color),
    };
  });

  const channel = (raw: number) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]: [number, number, number]) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const contrast = (a: [number, number, number], b: [number, number, number]) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (high + 0.05) / (low + 0.05);
  };

  // 1 - Gecis bir TINT: iki ucun kontrasti kucuk.
  expect(contrast(measured.pageColor, measured.far)).toBeLessThan(1.6);

  // 2 - Metin gradyanin en uzak ucunda bile AA geciyor.
  expect(contrast(measured.heading, measured.far)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(measured.body, measured.far)).toBeGreaterThanOrEqual(4.5);
});

/**
 * YUKLEME ANINDA KADEMELI GIRIS. design-spec.md §3.2, §6 ve architecture.md §4.4
 *
 * Burada once "Hero'da acilis animasyonu yok" testi duruyordu ve yasagi
 * tutuyordu. Yasak karar sahibi tarafindan kaldirildi; test SILINMEDI, yeni
 * sozlesmeyi olcecek bicimde yeniden yazildi - cunku kalkan sey yasak, kapi
 * degil.
 *
 * `reveal-on-enter` DEGIL `reveal-on-load`: Hero acilista ekranda oldugu icin
 * `view()` cizelgesi onu "gecmis" sayiyor ve oge son halinde aciliyor.
 */
test.describe("Hero yukleme girisi", () => {
  const REVEAL = `${SECTION} .reveal-on-load`;

  test("dort oge kademeli beliriyor", async ({ page }) => {
    const reveal = page.locator(REVEAL);
    await expect(reveal).not.toHaveCount(0);

    const rows = await reveal.evaluateAll((nodes) =>
      nodes.map((node) => {
        const computed = getComputedStyle(node);
        return { name: computed.animationName, delay: parseFloat(computed.animationDelay) || 0 };
      }),
    );

    for (const row of rows) expect(row.name).not.toBe("none");

    /* Olculen sey SURE DEGIL SIRA: 180ms veya 60ms yazsam sure degistiginde
       davranis bozulmadigi halde test duserdi. Kademenin ARTTIGI olculuyor. */
    expect(rows.length).toBeGreaterThan(2);
    rows
      .map((row) => row.delay)
      .reduce((previous, current) => {
        expect(current).toBeGreaterThan(previous);
        return current;
      });
  });

  test("reduced-motion altinda animasyon kalmiyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const names = await page
      .locator(REVEAL)
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
    expect(names.length).toBeGreaterThan(2);
    for (const name of names) expect(name).toBe("none");
  });

  /**
   * EN ONEMLI TEST. Keyframe'de yalnizca `from` tanimli olmasinin kapisi:
   * `to` yazilirsa reduced-motion blogu ogeleri `from` karesinde dondurur ve
   * HERO HIC GORUNMEZ. Depo bu hatayi daha once yasadi.
   */
  test("reduced-motion altinda Hero icerigi tam gorunur", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const opacities = await page
      .locator(REVEAL)
      .evaluateAll((nodes) => nodes.map((node) => Number(getComputedStyle(node).opacity)));
    for (const opacity of opacities) expect(opacity).toBe(1);
  });
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

  /**
   * PLAKA GRADYAN TASIYOR. design-spec.md §6
   *
   * Duz renk degil uc tonlu conic gradyan; duraklar tokens.css'te `color-mix`
   * ile turetildi (architecture.md §4.5 - yeni hex uydurulmaz).
   */
  test("plaka conic gradyan tasiyor", async ({ page }) => {
    const plate = page.locator(".hero-mark-plate");
    test.skip(!(await plate.isVisible()), "amblem yalnizca lg ustunde");

    const image = await plate.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(image).toContain("conic-gradient");
  });

  /** Hareket SCROLL'A bagli, zamana degil - sayfada kalici bir dongu yok. */
  test("gradyan scroll'a bagli doniyor", async ({ page }) => {
    const plate = page.locator(".hero-mark-plate");
    test.skip(!(await plate.isVisible()), "amblem yalnizca lg ustunde");

    const timeline = await plate.evaluate((el) => getComputedStyle(el).animationTimeline);
    expect(timeline).toContain("scroll");
  });

  /**
   * Hareket kalktiginda plaka BOS KALMIYOR - statik dususun kanıtı. Gradyan
   * hala cizili, yalnizca aci baslangic degerinde duruyor. Ayrica zeminde duz
   * marka rengi var, yani gradyan hic cizilemese bile kutu dolu.
   */
  test("reduced-motion altinda gradyan duruyor ama cizili kaliyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const plate = page.locator(".hero-mark-plate");
    test.skip(!(await plate.isVisible()), "amblem yalnizca lg ustunde");

    const style = await plate.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        name: computed.animationName,
        image: computed.backgroundImage,
        color: computed.backgroundColor,
      };
    });

    expect(style.name).toBe("none");
    expect(style.image).toContain("conic-gradient");
    expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
  });
});
