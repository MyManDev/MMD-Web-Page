import type { CSSProperties } from "react";

import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";

type NavItem = Site["nav"][number];

/**
 * Hero. design-spec.md §3.2
 *
 * Sayfanin TEK h1'i burada (§7.1). Metin #15'te yazildi ve semada zorunlu:
 * site.hero.title ve site.hero.subtitle.
 *
 * YUKLEME ANINDA KADEMELI GIRIS - ve bu bir kurali geri aliyor. §4.4 "sayfa
 * yuklenirken giris animasyonu yok" diyordu; karar sahibi kaldirdi. Yasak
 * sessizce kalkmadi: gerekce architecture.md §4.4 ile §9'da, ve eski test
 * silinmedi, yeni sozlesmeyi olcecek bicimde yeniden yazildi.
 *
 * `reveal-on-enter` DEGIL `reveal-on-load`, ve sebep teknik: `view()` cizelgesi
 * Hero'yu "gecmis" sayiyor cunku Hero acilista zaten ekranda - scroll'a bagli
 * bir reveal burada ya hic gorunmez ya da yanip sonuyormus gibi gorunur.
 * Zarf korundu: 180ms sure, 60ms kademe (§4.4'un 150-250ms sinirinin icinde).
 *
 * Sira `--reveal` ile veriliyor: baslik -> alt cumle -> aksiyonlar -> amblem.
 *
 * SAG KOLONDA AMBLEM var. §3.2 orada bir gorsel istiyor ve artik bir tane var:
 * markanin kendi isareti - uc kafa ve bir "m", yani uc kisi.
 *
 * Once orada buyutulmus WORDMARK duruyordu ve kaldirildi: bir kelime ancak
 * kenardan tasarsa grafik gibi okunuyor, tasinca da yarim bir kelime olarak
 * gorunuyordu ("MyManD"). Amblem o ikilemi tasimiyor.
 *
 * Kaynak `public/logo-mark.svg` - orijinal PNG'den `scripts/trace-mark.mjs`
 * ile turetilmis vektor, sapmasi olculdu (en kotu 0.098px). Zemini saydam:
 * markanin dolu turkuaz karesini oldugu gibi koymak ekran boyunda ikinci bir
 * yesil odak eklerdi (§5.1).
 *
 * Sekil `mask-image` ile boyaniyor, `<img>` olarak degil: rengi token'dan
 * geliyor, bir dosyanin icine gomulu kalmiyor (CLAUDE.md kural 1).
 *
 * TASMIYOR - ve bu, yerini aldigi wordmark'tan farki. Bir amblem BUTUN olmak
 * zorunda; yarisi kirpilmis bir logo bozuk gorunur.
 *
 * `aria-hidden`: amblem bilgi tasimiyor, agirlik tasiyor. Marka adi sayfada
 * zaten navbar ve footer'da okunuyor.
 *
 * Aksiyon etiketleri UYDURULMUYOR: ikisi de content/site.ts'teki nav
 * kayitlarindan geliyor.
 *
 * `secondary` OPSIYONEL ve bu kasitli: arkasinda bir sey olmayan aksiyon
 * cizilmez. Karar cagiran tarafta: app/page.tsx.
 */
export function Hero({
  section,
  hero,
  primary,
  secondary,
}: {
  section: NavItem;
  hero: Site["hero"];
  primary: NavItem;
  secondary?: NavItem;
}) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId}>
      <Container>
        <div className="grid grid-cols-1 items-center lg:grid-cols-12 lg:gap-[var(--spacing-gutter-lg)]">
          <div className="flex flex-col gap-8 py-section lg:col-span-7 lg:gap-10 lg:py-section-lg">
            {/*
              `text-wrap: balance` burada susleme degil. Basligin tum anlami iki
              cumlenin karsitliginda ve tarayici onu ortasindan boluyordu:
              390, 1024, 1920 ve 2560'ta satir "changed. We" / "didn't." diye
              kiriliyordu. Balance ile alti genislikte de cift bozulmuyor.

              Genislik siniri EKLENMEDI: denendi ve 768'i bozuyor - orada
              baslik tek satira sigiyor, bir cap onu gereksiz yere ikiye
              boluyordu.
            */}
            <h1
              id={headingId}
              className="reveal-on-load font-mono text-display-xl font-medium text-balance lg:text-display-xl-lg"
              style={{ "--reveal": 0 } as CSSProperties}
            >
              {hero.title}
            </h1>

            <p
              className="reveal-on-load max-w-prose font-sans text-body text-text-muted lg:text-body-lg"
              style={{ "--reveal": 1 } as CSSProperties}
            >
              {hero.subtitle}
            </p>

            {/* Mobilde alt alta ve tam genislik, sm'den itibaren yan yana (§3.2). */}
            <div
              className="reveal-on-load flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ "--reveal": 2 } as CSSProperties}
            >
              <Button href={`#${primary.id}`} variant="primary">
                {primary.label}
              </Button>
              {secondary ? (
                <Button href={`#${secondary.id}`} variant="ghost">
                  {secondary.label}
                </Button>
              ) : null}
            </div>
          </div>

          {/*
            Amblem yalnizca lg ustunde: dar ekranda metnin yanina degil, yerine
            gecerdi.
          */}
          {/*
            IKI ANIMASYON, IKI OGE - ve bu ayrim olcumle ogrenildi. Once ikisi
            ayni ogedeydi: `reveal-on-load` (yukleme girisi) ve `mark-sweep`
            (scroll'a bagli gradyan). Ikisi de `animation` yaziyor ve ayni
            specificity'de, yani sonra gelen kazandi - amblemin yukleme girisi
            SESSIZCE kayboldu, gecikmesi 0s'e dondu. Kademe sirasini olcen test
            bunu yakaladi.

            Simdi disardaki sarmalayici giriyor, icerdeki plaka doniyor.
          */}
          <div
            aria-hidden="true"
            className="reveal-on-load hidden lg:col-span-5 lg:block"
            style={{ "--reveal": 3 } as CSSProperties}
          >
            <div className="hero-mark-plate grid place-items-center">
              <div className="hero-mark" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
