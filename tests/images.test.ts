import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SCREENSHOT_WIDTHS, screenshotSrcSet } from "@/lib/images";
import { projects } from "@/content";

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
