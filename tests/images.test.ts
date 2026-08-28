import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PORTRAIT_WIDTHS, SCREENSHOT_WIDTHS, portraitSrcSet, screenshotSrcSet } from "@/lib/images";
import { projects, team } from "@/content";

describe("screenshotSrcSet", () => {
  it("her genislik icin bir aday uretir", () => {
    const srcSet = screenshotSrcSet("/projects/ornek-1440.webp");
    expect(srcSet).toBe("/projects/ornek-720.webp 720w, /projects/ornek-1440.webp 1440w");
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
  /**
   * Sema `screenshot`'in var oldugunu dogruluyor, srcset'in bahsettigi DIGER
   * genisliklerin var oldugunu degil. Script kosturulmadan bir genislik
   * eklenirse build temiz gecer ve tarayici 404 alir - bu test o araligi
   * kapatiyor.
   */
  it("srcset'in gosterdigi her dosya public/ altinda duruyor", () => {
    for (const project of projects) {
      for (const width of SCREENSHOT_WIDTHS) {
        const path = project.screenshot.replace(/-\d+\.webp$/, `-${width}.webp`);
        const file = join(process.cwd(), "public", path);
        expect(existsSync(file), `${project.slug}: ${path} bulunamadi`).toBe(true);
      }
    }
  });

  it("icerikteki yol en buyuk varyanti gosteriyor", () => {
    const largest = Math.max(...SCREENSHOT_WIDTHS);
    for (const project of projects) {
      expect(project.screenshot).toContain(`-${largest}.webp`);
    }
  });
});

describe("portraitSrcSet", () => {
  it("her genislik icin bir aday uretir", () => {
    expect(portraitSrcSet("/people/ornek-720.webp")).toBe(
      "/people/ornek-360.webp 360w, /people/ornek-720.webp 720w",
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
   * Iki tur ayni listeyi PAYLASMAMALI: portre 350px'lik bir karta, ekran
   * goruntusu 638px'lik bir kutuya giriyor. Ayni genislikleri kullanmak
   * birinde gereksiz buyuk dosya indirtirdi.
   */
  it("portre ve ekran goruntusu genislikleri ayri", () => {
    expect(PORTRAIT_WIDTHS).not.toEqual(SCREENSHOT_WIDTHS);
  });
});
