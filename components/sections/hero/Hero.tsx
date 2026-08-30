import type { Site } from "@/content";
import { Button, Container, SectionLabel } from "@/components/ui";

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
 * TEK KOLON - ve bu bir sapma, kayda geciyor. §3.2 lg'de iki kolon ve sagda
 * gorsel istiyor. Boyle bir varlik YOK: elimizde yalnizca assets/brand/logo.png
 * var, o da 9 KB'lik favicon'un kendisi. Onu hero olceginde gostermek
 * placeholder gorsel koymak olurdu (CLAUDE.md kural 6). Gorsel uretildiginde
 * iki kolonlu bicim kurulur; o zamana kadar bos bir sag kolon acilmiyor.
 *
 * Aksiyon etiketleri UYDURULMUYOR: ikisi de content/site.ts'teki nav
 * kayitlarindan geliyor.
 *
 * `secondary` OPSIYONEL ve bu kasitli. §3.2 iki aksiyon istiyor, ama ikincisi
 * Who we are'a gidiyor ve o bolum henuz yok (#9) - cizilseydi hicbir yere
 * goturmeyen bir dugme olurdu. Deponun kendi kalibi bu: "projects bossa bolum
 * hic render edilmez". Arkasinda bir sey olmayan aksiyon da cizilmez.
 * Karar cagiran tarafta: app/page.tsx.
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
        <div className="flex flex-col gap-8 py-section lg:gap-10 lg:py-section-lg">
          <SectionLabel number={section.number}>{section.label}</SectionLabel>

          <h1
            id={headingId}
            className="font-mono text-display-xl font-medium lg:text-display-xl-lg"
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
      </Container>
    </section>
  );
}
