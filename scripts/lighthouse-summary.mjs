/**
 * Lighthouse raporlarini OZETLER - kapi degil, rapor (architecture.md §8).
 *
 * Neden birden fazla kosu: 27 Agustos'ta ayni sayfa uc kosuda 74 ile 92
 * arasinda salindi, TBT 330 ile 1370ms arasinda. Bu genlikte tek bir sayi bir
 * olgu degil, bir orneklem. §8 bunu zaten ongormustu: "Lighthouse skorlari
 * kosucudan kosucuya oynar; kapi yapilirsa flaky olur, insanlar zorla gecer,
 * kapi olur."
 *
 * Bu yuzden ozet MEDYANI ve ARALIGI birlikte yaziyor. Aralik gizlenirse
 * medyan da tek koşu kadar yaniltici olur - okuyan kisi sayinin ne kadar
 * oynadigini gormeli.
 *
 * Yeni bagimlilik YOK (CLAUDE.md kural 4): raporlari `lighthouse` CLI uretiyor,
 * bu dosya yalnizca okuyup topluyor.
 */
import { readFile, readdir } from "node:fs/promises";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Sayisal medyan. Cift sayida kosuda ortadaki ikisinin ortalamasi. */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Kosulardan tek bir ozet cikarir: medyan + en dusuk/en yuksek. */
export function summarise(runs) {
  const pick = (fn) => runs.map(fn).filter((v) => typeof v === "number" && Number.isFinite(v));

  const categories = ["performance", "accessibility", "best-practices", "seo"].map((key) => {
    const scores = pick((run) => run.categories?.[key]?.score).map((s) => Math.round(s * 100));
    return { key, title: runs[0]?.categories?.[key]?.title ?? key, ...spread(scores) };
  });

  const metrics = [
    ["largest-contentful-paint", "LCP"],
    ["cumulative-layout-shift", "CLS"],
    ["total-blocking-time", "TBT"],
    ["first-contentful-paint", "FCP"],
  ].map(([id, label]) => {
    const values = pick((run) => run.audits?.[id]?.numericValue);
    return { id, label, unit: id === "cumulative-layout-shift" ? "" : "ms", ...spread(values) };
  });

  return { runs: runs.length, categories, metrics };
}

function spread(values) {
  if (values.length === 0) return { median: null, min: null, max: null, amplitude: null };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { median: median(values), min, max, amplitude: max - min };
}

const round = (value) => (value === null ? "—" : Math.round(value * 100) / 100);

/** Markdown tablosu. GitHub is ozetine de, terminale de ayni sey yaziliyor. */
export function toMarkdown(summary) {
  const lines = [
    `## Lighthouse — ${summary.runs} koşunun medyanı`,
    "",
    "Tek koşu bir olgu değil bir örneklemdir; aralık bu yüzden gizlenmiyor.",
    "",
    "| Kategori | Medyan | En düşük | En yüksek | Genlik |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...summary.categories.map(
      (c) =>
        `| ${c.title} | **${round(c.median)}** | ${round(c.min)} | ${round(c.max)} | ${round(c.amplitude)} |`,
    ),
    "",
    "| Metrik | Medyan | En düşük | En yüksek | Genlik |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...summary.metrics.map(
      (m) =>
        `| ${m.label} | **${round(m.median)}${m.unit}** | ${round(m.min)}${m.unit} | ${round(m.max)}${m.unit} | ${round(m.amplitude)}${m.unit} |`,
    ),
    "",
    "Eşikler `architecture.md` §8'de ve **raporlanır, kapı değildir**.",
  ];
  return lines.join("\n");
}

async function main() {
  const dir = process.argv[2] ?? ".";
  const names = (await readdir(dir))
    .filter((n) => /^lighthouse-run-\d+\.report\.json$/.test(n))
    .sort();
  if (names.length === 0) {
    console.error(`Rapor bulunamadi: ${join(dir, "lighthouse-run-*.report.json")}`);
    process.exitCode = 1;
    return;
  }

  const runs = [];
  for (const name of names) runs.push(JSON.parse(await readFile(join(dir, name), "utf8")));

  const markdown = toMarkdown(summarise(runs));
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown + "\n");
}

/* Dogrudan calistirildiginda main(), import edildiginde sessiz - testler
   saf fonksiyonlari import edebilsin diye. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
