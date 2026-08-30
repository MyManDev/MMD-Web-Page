import { describe, expect, it } from "vitest";
import { median, summarise, toMarkdown } from "../scripts/lighthouse-summary.mjs";

/**
 * Ozetleyicinin testi. #39'un butun amaci tek kosuya guvenmemek; medyan
 * sessizce yanlis olursa yerine gecen sey tek kosudan DAHA yaniltici olur,
 * cunku artik guvenilir gorunuyor.
 */
describe("median", () => {
  it("tek sayida degerde ortadakini verir", () => {
    expect(median([74, 92, 82])).toBe(82);
  });

  it("cift sayida degerde ortadaki ikisinin ortalamasini verir", () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  /**
   * Asil tuzak: JS'in varsayilan sort'u SOZLUKSEL. [9, 10, 8].sort() -> [10, 8, 9]
   * ve medyan 8 cikardi. Karsilastirici olmadan bu test duser.
   */
  it("sayisal siralar, sozluksel degil", () => {
    expect(median([9, 10, 8])).toBe(9);
    expect(median([100, 9, 80])).toBe(80);
  });

  it("bos listede null", () => {
    expect(median([])).toBeNull();
  });

  it("girdiyi degistirmez", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });
});

const run = (perf: number, lcp: number) => ({
  categories: {
    performance: { title: "Performance", score: perf / 100 },
    accessibility: { title: "Accessibility", score: 1 },
    "best-practices": { title: "Best Practices", score: 0.96 },
    seo: { title: "SEO", score: 0.91 },
  },
  audits: {
    "largest-contentful-paint": { numericValue: lcp },
    "cumulative-layout-shift": { numericValue: 0 },
    "total-blocking-time": { numericValue: 330 },
    "first-contentful-paint": { numericValue: 800 },
  },
});

describe("summarise", () => {
  it("medyani ve araligi birlikte verir", () => {
    const s = summarise([run(74, 1800), run(92, 2700), run(82, 2000)]);
    const perf = s.categories.find((c) => c.key === "performance");

    expect(s.runs).toBe(3);
    expect(perf?.median).toBe(82);
    expect(perf?.min).toBe(74);
    expect(perf?.max).toBe(92);
    // Genlik ASIL SAYI: 18 puanlik bir salinim medyani da suphe altina alir.
    expect(perf?.amplitude).toBe(18);
  });

  it("eksik denetimi atlar, uydurmaz", () => {
    const partial = { categories: {}, audits: {} };
    const s = summarise([partial]);
    expect(s.categories.every((c) => c.median === null)).toBe(true);
    expect(s.metrics.every((m) => m.median === null)).toBe(true);
  });
});

describe("toMarkdown", () => {
  it("genligi rapora yaziyor", () => {
    const md = toMarkdown(summarise([run(74, 1800), run(92, 2700), run(82, 2000)]));
    expect(md).toContain("3 koşunun medyanı");
    expect(md).toContain("Genlik");
    expect(md).toContain("**82**");
    expect(md).toContain("raporlanır, kapı değildir");
  });
});
