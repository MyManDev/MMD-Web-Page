import type { Project } from "@/content";
import { Button, Tag } from "@/components/ui";
import { screenshotSrcSet } from "@/lib/images";
import { MetricRow } from "./MetricRow";

/**
 * Tek proje blogu. design-spec.md §3.3.1
 *
 * V1'de kart degil, kendi basina bir bolum gibi duran tam genislikte blok:
 * mobilde tek kolon ve ekran goruntusu metnin altinda, lg ustunde iki kolon
 * ve goruntu sagda.
 *
 * Kolon orani 5/7 - goruntu metinden GENIS. design-spec.md §3.3.1 Projects
 * icin oran vermiyor (7/5 orani Hero'nun, §3.2); architecture.md §3 ise V1
 * tasarimini "buyuk gercek ekran goruntusu" diye tarif ediyor. Vitrinin ana
 * ogesi metinden dar duramaz.
 *
 * `index` ve `total` yigin davranisi icin (§3.3.2). V1'de total === 1 ve yigin
 * HIC devreye girmez; kap normal akisa doner. Ikinci proje icerik dosyasina
 * eklendigi anda sticky + z-index yigini kendiliginden calisir:
 *   - yalnizca lg ustunde (mobilde viewport yuksekligi yigini tasimiyor)
 *   - prefers-reduced-motion altinda position: static, duz liste
 *   - z-index 10 + index, sonraki kart oncekinin ustune biner
 *
 * Baslik seviyesi total'e bagli: tek projede blok bolumun kendi basligidir
 * (h2), cok projede bolum basligi Projects'e gecer ve kartlar h3 olur - seviye
 * atlanmiyor (§7.1).
 *
 * BOLUMUN TEK YESILI Live Demo'nun primary zemini (§5.1). Proje adi, Tag'ler,
 * MetricRow sayisi ve GitHub aksiyonu yesil DEGIL.
 */
export function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const stacked = total > 1;
  const Heading = stacked ? "h3" : "h2";

  return (
    <article
      style={stacked ? { zIndex: 10 + index } : undefined}
      className={
        "grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-[var(--spacing-gutter-lg)]" +
        (stacked ? " lg:sticky lg:top-[calc(var(--nav-height)+24px)] motion-reduce:lg:static" : "")
      }
    >
      <div className="flex flex-col gap-6 lg:col-span-5">
        <Heading
          id={`${project.slug}-title`}
          className="font-sans text-display-m font-semibold lg:text-display-m-lg"
        >
          {project.name}
        </Heading>

        <p className="max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
          {project.summary}
        </p>

        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ul>

        <MetricRow metrics={project.metrics} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={project.repoUrl} variant="ghost" external>
            GitHub
          </Button>
          {project.liveUrl ? (
            <Button href={project.liveUrl} variant="primary" external>
              Live Demo
            </Button>
          ) : null}
        </div>
      </div>

      {/*
        next/image DEGIL, duz <img> - ve bu olculerek secildi. design-spec.md
        §3.3.1 once next/image yaziyordu; statik export + images.unoptimized
        altinda ne optimizasyon ne srcset uretiyor, ama sayfaya 5.5 KiB client
        JS ekliyor (132.1 -> 137.6 KiB). Payload kapisinin kalan payi o anda
        17.9 KiB'di: bedeli payin ucte biri, karsiligi sifir. architecture.md
        §8 "esik yukseltilmez, asarsa geri donup azaltilir" diyor; burada esige
        dayanmadan once azaltildi.

        srcset ELLE yaziliyor: next/image dusunce beraberinde srcset'i de
        goturmustu ve o bosluk doldurulmadan kaldi (#33). Dosyalari
        scripts/optimize-images.mjs uretiyor, genislikler lib/images.ts ile
        ortak tek kayittan geliyor.

        sizes olculdu: lg ustunde gorsel 12 kolonun 7'si, yani kapsayici tam
        genisligindeyken 883px (kapsayici 1600'e cikinca 717'den yukseldi).
        56vw bunu her zaman bir parca ASIYOR ve asmasi kasitli - eksik tahmin
        bulanik goruntu demek, fazla tahmin birkac KB.

        width/height artik en buyuk varyantin GERCEK olcusu (1792x1120) ve ayni
        zamanda tasarimin 16/10 orani. Yeri fiilen ayiran sey CSS aspect kutusu;
        bu iki sayi orani tarayiciya HTML'den de bildiriyor, boylece CLS esigi
        (< 0.05) goruntu inmeden once de korunuyor. Semada boyut alani yok cunku
        oran her proje icin ayni.
      */}
      <div className="overflow-hidden rounded-card border border-border lg:col-span-7">
        {/* eslint-disable-next-line @next/next/no-img-element -- gerekce yukarida: olculmus 5.5 KiB */}
        <img
          src={project.screenshot}
          srcSet={screenshotSrcSet(project.screenshot)}
          sizes="(min-width: 1600px) 883px, (min-width: 1024px) 58vw, calc(100vw - 40px)"
          alt={`${project.name} screenshot`}
          width={1792}
          height={1120}
          loading="lazy"
          decoding="async"
          className="aspect-screenshot h-full w-full object-cover"
        />
      </div>
    </article>
  );
}
