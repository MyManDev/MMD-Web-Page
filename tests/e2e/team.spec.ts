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
  const items = page.locator(`${SECTION} ul[data-cards] > li`);
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
    await expect(image).toHaveAttribute("srcset", /-500\.webp 500w/);
    await expect(image).toHaveAttribute("srcset", /-1000\.webp 1000w/);

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
  // Daralan sey yukseklik: gizliyken yer isgal etseydi ad kartin ortasinda
  // asili kalirdi. Perde ayri bir katman ve o opacity ile calisiyor.
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

  // Perdenin acilmasi yetmez: metin ayrica DAKTILO ile yaziliyor. Olculen sey
  // son harfin GORUNUR olmasi - yarim kalan bir animasyon da "acildi" sayilirdi.
  const lastCharacter = row.locator("p span").last();
  await expect
    .poll(() => lastCharacter.evaluate((el) => Number(getComputedStyle(el).opacity)), {
      timeout: 15_000,
    })
    .toBe(1);
});

/**
 * REDUCED-MOTION SONRADAN ACILINCA daktilo birakiyor (design-spec.md §6).
 * Efekt ayari once yalnizca yuklenirken okuyordu: sayfa acikken reduced-motion
 * acilirsa harfler yine harf harf yaziliyordu. Olculen sey: ayar degisince
 * isaret kalkiyor ve yazilmamis harfler de gorunur.
 */
test("reduced-motion sonradan acilinca daktilo birakiyor", async ({ page }) => {
  test.skip(!(await hoverCapable(page)), "hoversiz cihazda daktilo zaten calismiyor");

  const bio = page.locator(`${CARD} [data-bio] p`).first();
  await expect(bio).toHaveAttribute("data-typing", "");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const lastCharacter = bio.locator("span").last();
  await expect
    .poll(() => lastCharacter.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(1);
  await expect(bio).not.toHaveAttribute("data-typing");
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

  /*
    REDUCED-MOTION ALTINDA. Giris animasyonu artik KARTIN KENDISINDE ve her
    kartin kendi `view()` cizelgesi var; `hover()` sayfayi kaydirdigi icin komsu
    kartin kendi giris ilerlemesi de degisiyor. Yani asagidaki "komsu yerinde
    kaldi mi" olcumu hover'i degil reveal'i olcmeye baslamisti (olculdu:
    beklenen 16, gelen 0).

    Hareket kapatilinca geriye yalnizca hover'in `translate`i kaliyor - testin
    sordugu sey tam olarak o. Gecis suresi 0.01ms'e indigi icin hover hala
    uyguluyor, sadece aninda.
  */
  await page.emulateMedia({ reducedMotion: "reduce" });

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
   * Referans BOLUM DEGIL LISTE: reveal sarmalayicisi bolumun icinde, yani
   * bolume gore olcum de o 16px'i tasiyordu (olculdu). Liste ile komsu ayni
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
 * Linkler perdenin ICINDE, ve bunun calismasi `opacity: 0`'in odaklanmayi
 * engellememesine bagli. `display: none` olsaydi linkler tab sirasindan
 * duserdi ve klavye onlara HIC ulasamazdi - focus'lanmak icin perdenin
 * acilmasi, acilmasi icin focus'lanmasi gerekirdi.
 *
 * Olculen sey tam olarak bu: link odaklanabiliyor mu, ve odaklaninca gorunur
 * hale geliyor mu.
 */
test("her kartta iki link var, ikisi de odaklanabilir ve odaklaninca gorunuyor", async ({
  page,
}) => {
  const card = page.locator(CARD).first();
  const links = card.getByRole("link");
  await expect(links).toHaveCount(2);

  const reveal = card.locator("[data-bio]");
  const count = await links.count();
  for (let i = 0; i < count; i += 1) {
    const link = links.nth(i);
    await link.focus();
    await expect(link).toBeFocused();
    await expect
      .poll(() => reveal.evaluate((el) => parseFloat(getComputedStyle(el).gridTemplateRows)))
      .toBeGreaterThan(0);
  }
});

/**
 * Sayfada ayni adi tasiyan birden fazla link var (her ag adi kisi sayisi kadar
 * tekrar ediyor). Erisilebilir ad
 * tek basina hangisinin kime ait oldugunu soylemiyor; aria-describedby kartin
 * adini bagliyor. Renk gibi, tek basina metin de bilgi tasimaz.
 */
test("linkler hangi kisiye ait oldugunu ekran okuyucuya soyluyor", async ({ page }) => {
  const cards = page.locator(CARD);
  const total = await cards.count();

  for (let i = 0; i < total; i += 1) {
    const card = cards.nth(i);
    const nameId = await card.locator("h3").getAttribute("id");
    expect(nameId).toBeTruthy();

    const links = card.getByRole("link");
    for (let j = 0; j < (await links.count()); j += 1) {
      await expect(links.nth(j)).toHaveAttribute("aria-describedby", nameId!);
    }
  }
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

/**
 * Metin bir FOTOGRAFIN uzerinde duruyor, yani kontrast fotografin icerigine
 * baglanamaz: acik bir fotografta ad ve rol okunmaz olurdu. Panelin zemini
 * yeterince opak oldugu surece kontrast fotograftan BAGIMSIZ kaliyor.
 *
 * Olculen sey opakligin kendisi. Gercek fotograflar geldiginde bu test,
 * birinin acik cikmasi durumunda da gecerli kalir - ki mock fotograflar koyu
 * oldugu icin goz bunu yakalamiyordu.
 */
test("ad ve rolun zemini fotograftan bagimsiz okunabilir", async ({ page }) => {
  const panel = page.locator(`${CARD} h3`).first();

  const alpha = await panel.evaluate((el) => {
    const box = el.closest("div")!;
    const value = getComputedStyle(box).backgroundColor;
    // Tailwind v4 opakligi color-mix ile uretiyor ve tarayici bunu
    // `oklab(... / 0.92)` diye geri veriyor - `rgba(...)` degil (olculdu).
    // Alfa hangi renk uzayinda olursa olsun egik cizgiden sonra geliyor;
    // eski rgba() bicimi icin de dorduncu bilesene dusuyoruz.
    const slash = value.split("/")[1];
    if (slash) return Number.parseFloat(slash);
    const parts = value.replace(/[^0-9.,]/g, "").split(",");
    return parts.length === 4 ? Number(parts[3]) : 1;
  });

  // %90 altinda bembeyaz bir fotograf uzerinde rol yazisi 4.5:1'i gecemiyor.
  expect(alpha).toBeGreaterThanOrEqual(0.9);
});

/**
 * TAM EKRAN - yalnizca `lg`de. design-spec.md §3.5
 *
 * Onceki hali viewport'un %115'iydi (1600x900'de %125), yani kartlarin alti
 * her zaman kesiliyordu. Yukseklik ORANDAN DEGIL KALAN ALANDAN geliyor: tek bir
 * sabit oran her viewport'ta sigdiramaz, cunku kart genisligi kapsayiciyla
 * buyurken ekran yuksekligi sabit kaliyor (hesaplandi: 2/3 orani 1440'ta
 * sigiyor, 1600x900'de %109 tasiyor).
 *
 * Olculen sey iki parcali: bolum bir ekran kadar, VE butun kartlar gercekten gorunur
 * alanda. Ikincisi olmadan birincisi bir sey kanitlamiyor - bolum bir ekran
 * olup kartlari tasirabilirdi.
 */
test("lg'de bolum bir ekrana sigiyor ve butun kartlar gorunuyor", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  const height = testInfo.project.use.viewport?.height ?? 0;
  test.skip(width < 1024, "tam ekran yalnizca lg ustunde");

  const section = await page.locator("#team").evaluate((el) => el.getBoundingClientRect().height);
  /* 2px tolerans: `dvh` ve piksel yuvarlanmasi. */
  expect(Math.abs(section - height)).toBeLessThanOrEqual(2);

  const fits = await page.evaluate(() => {
    /* `!` yerine kontrol: `strictNullChecks` altinda `querySelector` null
       dondurebilir ve susturmak yerine olcuyu once dogrulamak dogru - bozuk bir
       secici burada dussun, asagida sessizce true uretmesin. */
    const section = document.querySelector("#team");
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return [...document.querySelectorAll("#team article")].every((card) => {
      const box = card.getBoundingClientRect();
      return box.top >= rect.top - 1 && box.bottom <= rect.bottom + 1;
    });
  });
  expect(fits, "butun kartlar bolumun icinde kalmali").toBe(true);
});

/**
 * BUTUN KARTLAR AYNI MUAMELEDEN GECIYOR. Istek kartlar icin "ayni sistemin
 * parcasi gibi gorunsun" idi; portrelerin olculen parlaklik farki
 * TeamCard.tsx'teki karartma yorumunda.
 *
 * Olculen sey PERDENIN ESITLIGI, fotografin parlakligi degil - CSS pozlamayi
 * esitlemez ve bunu iddia etmiyoruz. Perde ayrilirsa kartlar yeniden ayri
 * sistemler gibi gorunur ve bunu gozle yakalamak zor.
 */
test("butun kartlarin karartmasi birebir ayni", async ({ page }) => {
  const scrims = await page.evaluate(() =>
    [...document.querySelectorAll("#team article")].map((card) => {
      const layer = card.querySelector(":scope > div[aria-hidden='true']");
      return layer ? getComputedStyle(layer).backgroundColor : null;
    }),
  );

  expect(scrims.length).toBeGreaterThan(1);
  expect(new Set(scrims).size, `karartmalar ayrildi: ${scrims.join(" | ")}`).toBe(1);
  expect(scrims[0]).not.toBeNull();
});

/**
 * Desktop projesi yalnizca 1280x720 kosuyor; lg'nin geri kalani test icinde.
 * 1024 lg esigi ve `sizes`'in 34vw dali; 1600 kapsayicinin kapandigi yer ve
 * `sizes`'in 491px dalinin basladigi yer; 1920 kapanmis kapsayicinin otesi.
 */
const LG_VIEWPORTS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 },
];

/**
 * lg: kart = (liste - 2 x gap) / 3, satir tek ve ortada. design-spec.md §3.5
 *
 * Kolon SAYISI olculmuyor: flex bir ogede `gridTemplateColumns` sm'nin computed
 * degerini ("repeat(2, minmax(0px, 1fr))") donduruyor ve uc parca sayilir - eski
 * test tam bunu yapiyordu ve hicbir sey olcmeden gecerdi. Gap OKUNUYOR: gap-8
 * degisip calc guncellenmezse test duser - dolu bir satirda gap buyurse shrink
 * farki yutar, o durumda yalnizca eksik bir satirda duser. `li` olculuyor, `article`
 * degil - article giris animasyonunda ve hover'da translate tasiyor.
 *
 * Kisi sayisindan bagimsiz: uc kisiyle satir tam dolar (sol ve sag bosluk 0),
 * daha azla kartlar ayni genislikte ortada durur.
 */
test("lg'de kart uc kolonluk izin genisliginde, satir tek ve ortada", async ({
  page,
}, testInfo) => {
  test.skip((testInfo.project.use.viewport?.width ?? 0) < 1024, "yalnizca lg ustunde");
  const list = page.locator(`${SECTION} ul[data-cards]`);
  /* `count()` beklemez; once bekleyen bir assertion. */
  await expect(list.locator(":scope > li")).not.toHaveCount(0);

  for (const viewport of LG_VIEWPORTS) {
    const at = `${viewport.width}x${viewport.height}`;
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(viewport.width);

    const row = await list.evaluate((el) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        wrap: style.flexWrap,
        gap: Number.parseFloat(style.columnGap),
        left: box.left + Number.parseFloat(style.paddingLeft),
        right: box.right - Number.parseFloat(style.paddingRight),
        top: box.top,
        height: box.height,
        items: [...el.children].map((item) => {
          const rect = item.getBoundingClientRect();
          const card = item.querySelector("article");
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            cardHeight: card ? card.getBoundingClientRect().height : Number.NaN,
          };
        }),
      };
    });

    /* Dolu bir satirda (uc kolonluk iz + iki gap) liste tam doluyor; 1/64px
       yuvarlama toplami asabilir, nowrap + shrink bunu yutar. */
    expect(row.wrap, `${at}: satir kirilamaz`).toBe("nowrap");

    const expected = (row.right - row.left - 2 * row.gap) / 3;
    row.items.forEach((item, index) => {
      const card = `${at} kart ${index}`;
      /* toBeCloseTo(x, 0): |fark| < 0.5px */
      expect(item.width, `${card}: genislik`).toBeCloseTo(expected, 0);
      expect(item.top, `${card}: ayni satir`).toBeCloseTo(row.top, 0);
      expect(item.height, `${card}: satiri dolduruyor`).toBeCloseTo(row.height, 0);
      expect(item.cardHeight, `${card}: lg:h-full cozuluyor`).toBeCloseTo(item.height, 0);
      const previous = row.items[index - 1];
      if (previous) expect(item.left - previous.right, `${card}: aralik`).toBeCloseTo(row.gap, 0);
    });

    const first = row.items.at(0);
    const last = row.items.at(-1);
    if (!first || !last) throw new Error(`${at}: listede kart yok`);
    expect(first.left - row.left, `${at}: sol bosluk = sag bosluk`).toBeCloseTo(
      row.right - last.right,
      0,
    );
  }
});

test("lg altinda izgara: mobilde tek kolon, sm'de iki", async ({ page }, testInfo) => {
  const columns = () =>
    page.locator(`${SECTION} ul[data-cards]`).evaluate((el) => {
      const style = getComputedStyle(el);
      /* Yalnizca izgarada anlamli; baska bir ogede computed deger parca sayisini yalanlar. */
      return style.display === "grid" ? style.gridTemplateColumns.split(" ").length : Number.NaN;
    });

  if ((testInfo.project.use.viewport?.width ?? 0) < 640) {
    expect(await columns()).toBe(1);
    return;
  }
  /* Iki proje de sm'yi kosmuyor (412, 1280); eski testin sm dali hic calismamisti. */
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(768);
  expect(await columns()).toBe(2);
});
