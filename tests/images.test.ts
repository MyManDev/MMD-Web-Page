import { existsSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";
import { describe, expect, it } from "vitest";
import { PORTRAIT_WIDTHS, SCREENSHOT_WIDTHS, portraitSrcSet, screenshotSrcSet } from "@/lib/images";
import { projects, team } from "@/content";

describe("screenshotSrcSet", () => {
  it("her genislik icin bir aday uretir", () => {
    const srcSet = screenshotSrcSet("/projects/ornek-1792.webp");
    expect(srcSet).toBe("/projects/ornek-896.webp 896w, /projects/ornek-1792.webp 1792w");
  });

  /**
   * Sessizce bos donmek en kotu davranis olurdu: tarayici src'ye duser,
   * herkes en buyuk dosyayi indirir ve hicbir sey hata vermez.
   */
  it.each([
    ["genislik eki yok", "/projects/ornek.webp"],
    ["webp degil", "/projects/ornek-1440.png"],
    ["bos", ""],
  ])("%s ise patlar", (_label, src) => {
    expect(() => screenshotSrcSet(src)).toThrow();
  });
});

describe("uretilmis varyantlar", () => {
  const screenshots = projects.flatMap((project) =>
    project.screenshots.map(({ src }) => ({ slug: project.slug, src })),
  );

  /**
   * Sema her `src`'nin var oldugunu dogruluyor, srcset'in bahsettigi DIGER
   * genisliklerin var oldugunu degil. Script kosturulmadan bir genislik
   * eklenirse build temiz gecer ve tarayici 404 alir - bu test o araligi
   * kapatiyor.
   */
  it("srcset'in gosterdigi her dosya public/ altinda duruyor", () => {
    for (const { slug, src } of screenshots) {
      for (const width of SCREENSHOT_WIDTHS) {
        const path = src.replace(/-\d+\.webp$/, `-${width}.webp`);
        const file = join(process.cwd(), "public", path);
        expect(existsSync(file), `${slug}: ${path} bulunamadi`).toBe(true);
      }
    }
  });

  it("icerikteki yol en buyuk varyanti gosteriyor", () => {
    const largest = Math.max(...SCREENSHOT_WIDTHS);
    for (const { src } of screenshots) {
      expect(src).toContain(`-${largest}.webp`);
    }
  });

  /**
   * TERS YON, portre testinin ekran goruntusu karsiligi (genel gerekce orada).
   * Bir proje birden fazla goruntu tasiyabildiginden beri
   * goruntu DEGISTIRMEK siradan bir icerik isi: eski goruntunun varyantlari
   * unutulursa sessizce yayinlanir, kaynagi unutulursa bir sonraki
   * `pnpm images` onlari geri uretir.
   */
  it("public/projects/ ve assets/screenshots/ altinda yalnizca icerikteki goruntuler var", () => {
    expect(
      orphans(
        "screenshot",
        screenshots.map(({ src }) => src),
      ),
    ).toEqual({
      published: [],
      sources: [],
    });
  });
});

describe("portraitSrcSet", () => {
  it("her genislik icin bir aday uretir", () => {
    expect(portraitSrcSet("/people/ornek-1000.webp")).toBe(
      "/people/ornek-500.webp 500w, /people/ornek-1000.webp 1000w",
    );
  });

  it("srcset'in gosterdigi her fotograf public/ altinda duruyor", () => {
    for (const member of team) {
      for (const width of PORTRAIT_WIDTHS) {
        const path = member.photo.replace(/-\d+\.webp$/, "-" + width + ".webp");
        expect(existsSync(join(process.cwd(), "public", path)), path).toBe(true);
      }
    }
  });

  /**
   * TERS YON: public/people/ ve assets/people/ altinda YALNIZCA ekibin
   * fotograflari var. Ustteki test isaret edilen dosyanin VAR oldugunu olcuyor,
   * fazlasini degil.
   *
   * scripts/optimize-images.mjs dosya silmiyor ve `next build` public/'in
   * tamamini out/'a kopyaliyor: kayittan cikan birinin fotografi unutulursa
   * sessizce yayinlanir. Kaynak unutulursa bir sonraki `pnpm images` varyantlari
   * geri uretir.
   *
   * Nasil olculdugu `orphans`ta, dosyanin sonunda.
   */
  it("public/people/ ve assets/people/ altinda yalnizca ekibin fotograflari var", () => {
    expect(
      orphans(
        "portrait",
        team.map((member) => member.photo),
      ),
    ).toEqual({
      published: [],
      sources: [],
    });
  });

  /**
   * Iki tur ayni listeyi PAYLASMAMALI: portre 350px'lik bir karta, ekran
   * goruntusu 638px'lik bir kutuya giriyor. Ayni genislikleri kullanmak
   * birinde gereksiz buyuk dosya indirtirdi.
   */
  it("portre ve ekran goruntusu genislikleri ayri", () => {
    expect(PORTRAIT_WIDTHS).not.toEqual(SCREENSHOT_WIDTHS);
  });
});

/**
 * Yayindaki ve kaynaktaki fazla dosyalar. Iki ters yon testi de bunu kullaniyor;
 * klasorler scripts/optimize-images.mjs'in JOBS listesiyle ayni eslesme.
 *
 * Varyant adlari her iki yarida da srcset yardimcisindan turetiliyor, regex ile
 * yeniden yazilmiyor. Kaynaklar script'in okudugu gibi okunuyor: yalnizca
 * `.webp`, ad `parse().name`; boylece .DS_Store gibi bir dosya testi dusurmez,
 * script'in isleyecegi her kaynak olculur.
 */
function orphans(kind: "screenshot" | "portrait", used: string[]) {
  const { srcSetOf, widths, from, to } =
    kind === "screenshot"
      ? {
          srcSetOf: screenshotSrcSet,
          widths: SCREENSHOT_WIDTHS,
          from: "assets/screenshots",
          to: "projects",
        }
      : { srcSetOf: portraitSrcSet, widths: PORTRAIT_WIDTHS, from: "assets/people", to: "people" };

  const variants = (src: string) =>
    srcSetOf(src)
      .split(", ")
      .map((candidate) => candidate.slice(0, candidate.lastIndexOf(" ")));
  const served = new Set(used.flatMap(variants));

  const published = readdirSync(join(process.cwd(), "public", to))
    .map((file) => `/${to}/${file}`)
    .filter((path) => !served.has(path));

  const sources = readdirSync(join(process.cwd(), from))
    .filter((file) => file.endsWith(".webp"))
    .filter((file) => {
      const { name } = parse(file);
      const src = `/${to}/${name}-${widths.at(-1)}.webp`;
      return !variants(src).every((path) => served.has(path));
    });

  return { published, sources };
}
