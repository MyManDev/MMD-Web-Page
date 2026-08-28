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
/**
 * Imza ogesi. architecture.md §4.6, design-spec.md §3.3.1
 *
 * Metnin kendisi test edilmiyor - icerik dosyasi degistiginde test dusmemeli.
 * Olculen sey isaretleme sozlesmesi: gecerli bir tanim listesi, sayi ve etiket
 * eslesmis, ve placeholder yok.
 */
test("imza sayisi gecerli bir tanim listesi olarak render ediliyor", async ({ page }) => {
  const list = page.locator(`${SECTION} dl`);
  await expect(list).toHaveCount(1);

  const terms = list.locator("dt");
  const values = list.locator("dd");
  await expect(terms).toHaveCount(await values.count());
  await expect(values.first()).not.toBeEmpty();
  await expect(terms.first()).not.toBeEmpty();

  // Bos cerceve, tire veya "coming soon" yok (CLAUDE.md kural 6).
  await expect(page.locator(SECTION)).not.toContainText("—");
});

/**
 * DOM sirasi dt -> dd (gecerli tanim listesi), gorsel sira sayi ustte.
 * Siralamayi CSS cozuyor; isaretlemeyi bozarak degil.
 */
test("sayi etiketin USTUNDE gorunuyor ama DOM'da altinda", async ({ page }) => {
  const pair = page.locator(`${SECTION} dl > div`).first();

  const order = await pair.evaluate((el) => {
    const term = el.querySelector("dt")!;
    const value = el.querySelector("dd")!;
    return {
      domTermFirst: term.compareDocumentPosition(value) === Node.DOCUMENT_POSITION_FOLLOWING,
      valueIsAbove: value.getBoundingClientRect().top < term.getBoundingClientRect().top,
    };
  });

  expect(order.domTermFirst).toBe(true);
  expect(order.valueIsAbove).toBe(true);
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

test("srcset iki genisligi de sayiyor ve sizes yazili", async ({ page }) => {
  const image = page.locator(`${SECTION} img`);
  await expect(image).toHaveAttribute("srcset", /-720\.webp 720w/);
  await expect(image).toHaveAttribute("srcset", /-1440\.webp 1440w/);
  await expect(image).toHaveAttribute("sizes", /.+/);
});

/**
 * Asil olcum: tarayici HANGI dosyayi indirdi. srcset'in yazili olmasi onu
 * kullanildigi anlamina gelmiyor - yanlis bir `sizes` ile her cihaz en buyugu
 * indirir ve hicbir sey hata vermez.
 *
 * Beklenen secim cihazin piksel yogunlugundan cikiyor, viewport genisliginden
 * degil - ve ikisi burada ters yonde calisiyor:
 *   desktop  1280px, DPR 1     -> gorsel kutusu 638px  -> 720 yetiyor
 *   mobil     412px, DPR 2.625 -> 372 * 2.625 = 977px  -> 1440 gerekiyor
 * Yani dar viewport DAHA BUYUK dosyayi aliyor, ve dogrusu bu.
 */
test("tarayici cihaza uyan varyanti indiriyor", async ({ page }, testInfo) => {
  const image = page.locator(`${SECTION} img`);
  await image.scrollIntoViewIfNeeded();

  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const expected = dpr > 1.5 ? "-1440.webp" : "-720.webp";

  await expect
    .poll(() => image.evaluate((el: HTMLImageElement) => el.currentSrc))
    .toContain(expected);

  // Kaynak goruntu (2360px) servis edilmiyor - assets/ altinda, public/ degil.
  const response = await page.request.get("/projects/football-squad-optimizer.webp");
  expect(response.status(), `${testInfo.project.name}: kaynak gorsel yayinlanmis`).toBe(404);
});

/**
 * Bolum girisi. design-spec.md §6 ve §6.1
 *
 * Hareketin kendisi olculmuyor - hangi karede oldugu scroll'a bagli ve testte
 * kirilgan olurdu. Olculen sey SOZLESME: zaman cizelgesi scroll'a bagli mi, ve
 * hareket calismadigi her durumda icerik GORUNUR mu.
 */
test.describe("bolum girisi", () => {
  const REVEAL = `${SECTION} .reveal-on-enter`;

  test("icerige bagli, zeminin kendisine degil", async ({ page }) => {
    await expect(page.locator(REVEAL)).toHaveCount(1);

    // Zemin animasyonun disinda kalmali: soldurulan sey bolumun kendisi degil.
    const sectionIsTarget = await page
      .locator(SECTION)
      .evaluate((el) => el.classList.contains("reveal-on-enter"));
    expect(sectionIsTarget).toBe(false);
  });

  test("zaman cizelgesi scroll'a bagli - sure degil", async ({ page }) => {
    const timeline = await page
      .locator(REVEAL)
      .evaluate((el) => getComputedStyle(el).animationTimeline);
    expect(timeline).toContain("view");
  });

  /**
   * En onemli test: hareket calismadiginda icerik GORUNMEZ kalmamali.
   * opacity: 0 ile baslayan bir animasyon, calismadigi her yerde bolumu
   * silmis olur - ve bu sessizce olur.
   */
  test("reduced-motion altinda icerik tam gorunur", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const reveal = page.locator(REVEAL);
    await reveal.scrollIntoViewIfNeeded();

    const style = await reveal.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        name: computed.animationName,
        opacity: computed.opacity,
        transform: computed.transform,
      };
    });

    // Animasyon tamamen kaldirildi. `animation-timeline: none` ise oge'yi
    // opacity: 0'da dondururdu - zaman cizelgesi yoksa `both` fill `from`
    // karesini uyguluyor. Bu test o hatayi bir kez yakaladi; ondan duruyor.
    expect(style.name).toBe("none");
    expect(Number(style.opacity)).toBe(1);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(style.transform);
  });

  test("scroll edildiginde icerik tam gorunur hale geliyor", async ({ page }) => {
    const reveal = page.locator(REVEAL);
    await reveal.scrollIntoViewIfNeeded();
    // Bolum tamamen gecilene kadar scroll: animasyon araligi bitmis olmali.
    await page.mouse.wheel(0, 1200);

    await expect.poll(() => reveal.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("16/10 oraninda ve tasmiyor", async ({ page }) => {
  const box = await page.locator(`${SECTION} img`).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width / box!.height).toBeCloseTo(1.6, 1);
});

/**
 * design-spec.md §2.1 ve §7.5: dis linkte gorunur ikon, ama ikon bilgi
 * TASIMAZ - tekrarlar. Bu yuzden iki sey birden olculuyor: ikon var, ve
 * erisilebilir ad hala yalnizca metinden geliyor.
 */
test("dis link aksiyonlari gorunur ikon tasiyor, erisilebilir ad degismiyor", async ({ page }) => {
  const section = page.locator(SECTION);

  for (const name of ["GitHub", "Live Demo"]) {
    const link = section.getByRole("link", { name });
    await expect(link).toHaveCount(1);

    const icon = link.locator('svg[aria-hidden="true"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toBeVisible();

    // currentColor: ikonun kendi rengi yok, zeminin metin rengini aliyor.
    const [iconColor, linkColor] = await link.evaluate((el) => [
      getComputedStyle(el.querySelector("svg")!).color,
      getComputedStyle(el).color,
    ]);
    expect(iconColor).toBe(linkColor);
  }
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
