import type { Project } from "@/content";
import { Button, Tag } from "@/components/ui";
import { MetricRow } from "./MetricRow";
import { Screenshot } from "./Screenshot";
import { ScreenshotCarousel } from "./ScreenshotCarousel";
import { ScreenshotGhost } from "./ScreenshotGhost";

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
 *   - prefers-reduced-motion altinda duz liste: sticky yok, position: relative
 *     (hayalet arka plan kartin kutusuna gore konumlaniyor)
 *   - z-index 10 + index, sonraki kart oncekinin ustune biner
 *
 * Proje adi HER ZAMAN h3 (#58): bolum basligini artik Projects'in kendisi
 * tasiyor, yani kart basligi bir alt seviyede. Seviye atlanmiyor (§7.1).
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

  return (
    <article
      style={stacked ? { zIndex: 10 + index } : undefined}
      className={
        /* `relative isolate`: hayalet arka plan (ScreenshotGhost.tsx) kartin
           kutusuna gore konumlaniyor ve `-z-10` ile icerigin arkasinda kaliyor. */
        "relative isolate grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-[var(--spacing-gutter-lg)]" +
        /* YUKSEKLIK KARTIN KENDISINDE ve bu iki denemeden sonra OLCULEREK
           bulundu:

             1. sarmalayicida `min-h-dvh` -> sticky sarmalayicinin kutusuna
                hapsoluyor; kart 01, kart 02 hala 436px asagidayken birakiyor
             2. kartta `margin-bottom: 100dvh` -> DAHA KOTU. Sticky kisitlama
                dikdortgeni kapsayicinin ic kutusundan ELEMANIN MARJLARI KADAR
                kuculuyor, yani 900px'lik margin menzili tam 900px kisaltiyor.
                Olculdu: kart 01, kart 02 880px asagidayken birakti.

           Yukseklik kartin KENDI kutusunda oldugunda ikisi hizalaniyor: kap
           kendiliginden N x yukseklik oluyor, kart 01'in menzili (N-1) x
           yukseklik kadar kaliyor, ve kart 02 tam o menzilin icinde tepeye
           varip ustune biniyor.

           Olcu `100dvh` DEGIL `100dvh - nav - 24px`: sabitlenen kart tam
           sabitlendigi yerden ekranin altina kadar dolsun, tasmasin. */
        (stacked
          ? " lg:sticky lg:top-[calc(var(--nav-height)+24px)]" +
            " lg:min-h-[calc(100dvh-var(--nav-height)-24px)]" +
            /* `static` DEGIL `relative`: yigin kapansa da hayalet kartin
               kutusuna gore konumlanmali. */
            " motion-reduce:lg:relative motion-reduce:lg:min-h-0"
          : "")
      }
    >
      <div className="flex flex-col gap-6 lg:col-span-5">
        {/*
          SIRA NUMARASI. #58 bolum numaralarini kaldirmisti ve bu onu KISMEN
          geri aliyor: bolum etiketleri geri gelmedi, yalnizca proje kartinin
          sirasi. Karar sahibinin istegi; §9'da kayitli.

          Deger `index`ten TURETILIYOR, elle yazilmiyor - iki kayit arasinda
          sira degistiginde numara kendiliginden takip ediyor.

          `aria-hidden`: sira bilgisi DOM sirasinda zaten var, ekran okuyucuya
          "sifir bir Football Squad Optimizer" diye okutmak baslikin adini
          kirletirdi. Gorsel bir isaret, bilgi degil.

          Yesil DEGIL (§5.1): bolumun tek yesili Live Demo'nun zemini.
        */}
        <p aria-hidden="true" className="reveal-on-enter font-mono text-mono text-text-muted">
          {String(index + 1).padStart(2, "0")}
        </p>

        <h3
          id={`${project.slug}-title`}
          className="reveal-on-enter font-mono text-display-l font-medium lg:text-display-l-lg"
        >
          {project.name}
        </h3>

        {/*
          Ozet CENGEL, aciklama GOVDE. Ikisi ayri tipografik rolde: ozet
          uygulamanin kendi cumlesi ve tek satir, aciklama projenin ne yaptigini
          anlatiyor. Ayni boyutta bassaydik iki paragraf birbirine karisirdi.
        */}
        <p className="reveal-on-enter max-w-prose font-mono text-display-m text-text-muted lg:text-display-m-lg">
          {project.summary}
        </p>

        <p className="reveal-on-enter max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
          {project.description}
        </p>

        <ul className="reveal-on-enter flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ul>

        {/* Sarmalayici yalnizca giris icin: `MetricRow` paylasilan bir
            primitive ve ona bir animasyon sinifi gecirmek onu bu bolume
            baglardi. */}
        <div className="reveal-on-enter">
          <MetricRow metrics={project.metrics} />
        </div>

        <div className="reveal-on-enter flex flex-col gap-3 sm:flex-row sm:items-center">
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
        Birden fazla goruntu -> kendiliginden gecen karusel (design-spec.md §3.3.1).
        Tek goruntu -> ayni figur (goruntu ve basligi), tus satiri yok: gidilecek
        ikinci goruntu yokken tus cizmek, hicbir yere gitmeyen bir dugme cizmek
        olurdu. Figurun kendisi ve olculmus gerekceleri Screenshot.tsx'te.
      */}
      {project.screenshots.length > 1 ? (
        <ScreenshotCarousel
          className="reveal-on-enter lg:col-span-7"
          name={project.name}
          screenshots={project.screenshots}
        />
      ) : (
        <>
          <ScreenshotGhost screenshots={project.screenshots} index={0} />
          <Screenshot {...project.screenshots[0]} className="reveal-on-enter lg:col-span-7" />
        </>
      )}
    </article>
  );
}
