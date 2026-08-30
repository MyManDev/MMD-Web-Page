import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Sert kapi: axe erisilebilirlik ihlali 0 (architecture.md §8).
 * Desktop ve mobil viewport'ta taranir - proje ayarlari ikisini de kosuyor.
 *
 * TARAMA REDUCED-MOTION ALTINDA KOSAR ve bu bir gevsetme DEGIL, tarama
 * kosulunun kendisi.
 *
 * Sebebi olculdu: bolum girisi (`reveal-on-enter`, design-spec.md §6)
 * opakligi scroll'a bagli animasyonla degistiriyor. axe kontrast hesabini
 * yaparken ust ogelerin opakligini kendisi katliyor - yani sayfanin herhangi
 * bir yerinde yariya gelmis bir fade varsa, o andaki KARISMIS rengi olcuyor.
 * Hero eklendiginde Projects asagi kaydi ve tarama animasyonun ortasina denk
 * gelmeye basladi: Live Demo dugmesi 4.34 verdi ve rapor edilen renkler
 * #149f90 / #1e2d2f idi - token'lar ise #14b8a6 ve #203033.
 *
 * Dinlenme halinde ayni cift 5.51:1 veriyor (app/tokens.css'te yazili ve
 * hesaplandi), yani kusur renkte degil OLCUM ANINDA. WCAG kontrasti duragan
 * durumun ozelligidir; gecici bir animasyon karesinin degil.
 *
 * Sayfanin tamami tek seferde taraniyor ve ekranin altindaki her bolum tanimi
 * geregi girisin ortasinda oluyor - yani "once tam gorunur olmasini bekle"
 * diye bir konum yok. Animasyonu kapatmak, sayfayi duragan halinde taramanin
 * TEK deterministik yolu.
 *
 * Hareketli halin kendisi ayrica test ediliyor: projects.spec.ts "bolum
 * girisi" testleri reduced-motion'da ve scroll sonrasi icerigin tam gorunur
 * oldugunu olcuyor.
 */
for (const path of ["/", "/bu-yol-yok-12345"]) {
  test(`axe ihlali yok: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);

    // Tarama duragan halde kosuyor mu - iddia degil kontrol.
    const animating = await page.evaluate(() =>
      Array.from(document.querySelectorAll("*")).some(
        (el) => getComputedStyle(el).animationName !== "none",
      ),
    );
    expect(animating, "reduced-motion altinda calisan animasyon kalmamali").toBe(false);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip link klavyeyle erisilebilir ve gorunur oluyor", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});

/**
 * §58: bolum numaralari (`01`-`04`) kalkti ve `SectionLabel` primitive'i silindi.
 *
 * Testi tek tek bolumlere degil SAYFAYA yaziyorum: kaldirma isi dort bolumu
 * birden ilgilendiriyor ve geri gelmesi de oyle olur. Numaranin bir bolume
 * sessizce geri donmesi, kaldirma gerekcesini (etiket bilgi katmadigi yerde
 * durmaz, §3.5) ihlal eder.
 */
test("bolumlerde 01-04 numarasi kalmadi", async ({ page }) => {
  await page.goto("/");

  const markers = await page.evaluate(() =>
    [...document.querySelectorAll("main section")].flatMap((section) =>
      [...section.querySelectorAll("*")]
        .filter((el) => el.children.length === 0 && /^0[1-4]$/.test((el.textContent ?? "").trim()))
        /*
          Karusel icindeki sayac BOLUM NUMARASI DEGIL, konum gostergesi -
          "kacinci prensipteyim" sorusunu cevapliyor ve kaldirilan sey o degildi.
          #58'in gerekcesi "etiket bilgi katmadigi yerde durmaz"; burada bilgi
          katiyor, cunku gezinen kullanici konumu baska turlu bilemez.

          Dislama SECICIYE degil ROLE bagli: `aria-roledescription="carousel"`
          kalkarsa sayac yeniden kapsama giriyor. Sinif adiyla dislasaydim
          yeniden adlandirma testi sessizce kor birakirdi.
        */
        .filter((el) => el.closest('[aria-roledescription="carousel"]') === null)
        .map((el) => `${section.id}: ${el.textContent?.trim()}`),
    ),
  );

  expect(markers).toEqual([]);
});
