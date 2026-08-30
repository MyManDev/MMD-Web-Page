import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";

type NavItem = Site["nav"][number];

/**
 * Hero. design-spec.md §3.2
 *
 * Sayfanin TEK h1'i burada (§7.1). Metin #15'te yazildi ve semada zorunlu:
 * site.hero.title ve site.hero.subtitle.
 *
 * GIRIS ANIMASYONU YOK - `reveal-on-enter` bilerek uygulanmadi. §3.2 ve §4.4
 * "sayfa yuklenirken giris animasyonu yok" diyor; Hero acilista zaten
 * ekranda, yani scroll'a bagli bir reveal burada ya hic gorunmez ya da
 * sayfayi yanip sonuyormus gibi gosterir.
 *
 * SAG KOLONDA AMBLEM var. §3.2 orada bir gorsel istiyor ve artik bir tane var:
 * markanin kendi isareti - uc kafa ve bir "m", yani uc kisi.
 *
 * Once orada buyutulmus WORDMARK duruyordu ve kaldirildi: bir kelime ancak
 * kenardan tasarsa grafik gibi okunuyor, tasinca da yarim bir kelime olarak
 * gorunuyordu ("MyManD"). Amblem o ikilemi tasimiyor.
 *
 * Kaynak `assets/brand/logo.png` dolu turkuaz bir KARE. Kareyi oldugu gibi
 * koymak ekran boyunda ikinci bir yesil odak eklerdi (§5.1), o yuzden zemin
 * ayrildi ve geriye yalnizca sekil kaldi - `scripts/extract-mark.mjs`.
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
              className="font-mono text-display-xl font-medium text-balance lg:text-display-xl-lg"
            >
              {hero.title}
            </h1>

            <p className="max-w-prose font-sans text-body text-text-muted lg:text-body-lg">
              {hero.subtitle}
            </p>

            {/* Mobilde alt alta ve tam genislik, sm'den itibaren yan yana (§3.2). */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <div aria-hidden="true" className="hero-mark hidden lg:col-span-5 lg:block" />
        </div>
      </Container>
    </section>
  );
}
