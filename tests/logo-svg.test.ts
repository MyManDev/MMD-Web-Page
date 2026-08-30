import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Marka SVG'leri. #18
 *
 * Iki dosya var ve AYRIMLARI islevsel, kozmetik degil:
 *
 *   public/logo.svg      - markanin tamami, zemin karesi dahil
 *   public/logo-mark.svg - yalnizca isaret, zemini SAYDAM
 *
 * Ikisi karisirsa hicbir sey patlamaz ve testler yesil kalir: Hero maskesi
 * `mask-image` ile alfa okuyor, yani zemini dolu bir dosya verildiginde
 * ekrana amblem degil DOLU BIR KARE ciziyor. Gozle bakan biri "yesil bir
 * kare var" der ama sebebini bulmaz. Bu yuzden olculuyor.
 */
const read = (name: string) => readFileSync(new URL(`../public/${name}`, import.meta.url), "utf8");

describe("marka SVG'leri", () => {
  const mark = read("logo-mark.svg");
  const logo = read("logo.svg");

  it("isaret dosyasinda zemin karesi YOK", () => {
    // Maske olarak kullanilan dosya bu; bir `rect` alfayi her yerde 1 yapar.
    expect(mark).not.toContain("<rect");
  });

  it("logo dosyasinda zemin karesi VAR", () => {
    expect(logo).toContain("<rect");
  });

  it("ikisi de ayni cizimi tasiyor", () => {
    /*
      Govde yolu ve uc kafa iki dosyada da ayni olmali. Ayrildiklarinda
      marka iki farkli sekilde gorunmeye baslar ve bunu kimse fark etmez -
      biri favicon'da, digeri Hero'da.
    */
    const path = /<path d="([^"]+)"/.exec(mark);
    expect(path).not.toBeNull();
    expect(logo).toContain(path![1]);

    const circles = (source: string) => source.match(/<circle[^/]+\/>/g) ?? [];
    expect(circles(mark)).toHaveLength(3);
    expect(circles(mark)).toEqual(circles(logo));
  });

  it("olcek referansi 400x400 kaynakla ayni", () => {
    // viewBox degisirse Hero'daki `mask-size: contain` sessizce baska bir
    // kadraj gosterir.
    for (const source of [mark, logo]) {
      expect(source).toContain('viewBox="0 0 400 400"');
    }
  });

  it("isaret rengi dosyaya gomulu degil", () => {
    // Hero rengi token'dan veriyor (§5.1: amblem accent DEGIL). Dosyaya sabit
    // bir renk yazilirsa token'in bir hukmu kalmaz.
    expect(mark).toContain('fill="currentColor"');
  });
});
