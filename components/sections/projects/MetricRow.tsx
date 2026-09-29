import type { Project } from "@/content";

/**
 * Metrik satiri (architecture.md §4.6). Eskiden imza ogesiydi - tek bir durust
 * sayi; karar sahibi onu kaldirdi ve satir bugun projenin kisitlarini tasiyor.
 * Sayi Display M, etiketi mono ve text-muted. design-spec.md §3.3.1
 *
 * `metrics` yoksa satir HIC render edilmez - bos cerceve, tire veya
 * placeholder gosterilmez (CLAUDE.md kural 6).
 *
 * DOM sirasi dt -> dd (gecerli tanim listesi), gorsel sira flex-col-reverse
 * ile sayi ustte. Siralamayi CSS cozuyor, isaretlemeyi bozarak degil.
 */
export function MetricRow({ metrics }: { metrics: Project["metrics"] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col-reverse gap-1">
          <dt className="font-mono text-mono text-text-muted uppercase">{metric.label}</dt>
          <dd className="m-0 font-mono text-display-m font-medium lg:text-display-m-lg">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
