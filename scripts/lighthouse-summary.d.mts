/**
 * `lighthouse-summary.mjs` icin tip bildirimi.
 *
 * Script `.mjs` cunku CI onu node ile dogrudan calistiriyor ve bir derleme
 * adimi istemiyoruz. Testler saf fonksiyonlari import ediyor, o yuzden tipler
 * burada yaziliyor - alternatif tsconfig'e `allowJs` eklemekti ve o paylasilan
 * bir yuzeyi tek bir dosya icin gevsetmek olurdu.
 */

/** Bir olcumun medyani ve aralii. Deger yoksa hepsi null. */
export interface Spread {
  median: number | null;
  min: number | null;
  max: number | null;
  amplitude: number | null;
}

export interface CategorySummary extends Spread {
  key: string;
  title: string;
}

export interface MetricSummary extends Spread {
  id: string;
  label: string;
  unit: string;
}

export interface Summary {
  runs: number;
  categories: CategorySummary[];
  metrics: MetricSummary[];
}

/** Sayisal medyan; girdiyi degistirmez. Bos listede null. */
export function median(values: number[]): number | null;

/** Lighthouse JSON raporlarindan tek ozet. Eksik denetim atlanir, uydurulmaz. */
export function summarise(runs: unknown[]): Summary;

/** GitHub is ozetine ve terminale yazilan markdown. */
export function toMarkdown(summary: Summary): string;
