import type { Project } from "@/content";

/**
 * Imza ogesi (architecture.md §4.6): durust sayi satiri.
 * Sayi Display M, etiketi mono ve text-muted. design-spec.md §3.3.1
 *
 * `metrics` yoksa satir HIC render edilmez - bos cerceve, tire veya
 * placeholder gosterilmez (CLAUDE.md kural 6). V1'de imza sayisinin ifadesi
 * henuz yazilmadi (#17), yani bu component bugun her zaman null donuyor.
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
          <dt className="font-mono text-xs leading-[1.4] tracking-[0.08em] text-text-muted uppercase">
            {metric.label}
          </dt>
          <dd className="m-0 font-sans text-[20px] leading-[1.25] font-semibold tracking-[-0.02em] lg:text-[24px]">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
