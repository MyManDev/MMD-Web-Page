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
 * GIRIS ANIMASYONU YOK - `reveal-on-enter` bilerek uygulanmadi. §3.2 ve §4.4
 * "sayfa yuklenirken giris animasyonu yok" diyor; Hero acilista zaten
 * ekranda, yani scroll'a bagli bir reveal burada ya hic gorunmez ya da
 * sayfayi yanip sonuyormus gibi gosterir.
 *
 * SAG KOLONDA GORSEL DEGIL ISARET var. §3.2 lg'de sagda bir gorsel istiyor ve
 * oyle bir varlik hala YOK - depodaki tek marka gorseli 9 KB'lik favicon ve onu
 * hero olceginde gostermek placeholder koymak olurdu (CLAUDE.md kural 6).
 * Yerini wordmark'in kendisi dolduruyor: yeni bir varlik degil, zaten sahip
 * oldugumuz tipografinin buyutulmus hali.
 *
 * Isaret bir METIN DUGUMU DEGIL, CSS uretilen icerik - ve bu bir kacamak degil,
 * dogru model. Wordmark sayfada zaten iki kez okunuyor (navbar ve footer);
 * ucuncusu bilgi tasimiyor, agirlik tasiyor. Bir metin dugumu olarak yazmak
 * "bu icerik" demek olurdu ve degil.
 *
 * Olculen sonuc: metin dugumuyken axe onu 1.14:1 kontrastla ihlal saydi.
 * Kural susturulmadi ve renk parlatilmadi - ikisi de yanlis cevap olurdu.
 * WCAG 1.4.3 saf dekorasyonu acikca muaf tutuyor; makineye "bu dekorasyon"
 * demenin yolu, icerik gibi davranmayan bir kaynak kullanmak. Yan fayda:
 * metin secilirken ve okuyucu modunda araya "MyManDev" karismiyor.
 *
 * Metin yine `content/site.ts`'ten geliyor - CSS'e sabitlenmedi, ozel ozellik
 * olarak gecirildi. Tek kayit kurali bozulmuyor.
 *
 * Kenardan tasiyor ve tasmasi kasitli: cerceveye sigan bir metin grafik degil,
 * ikinci bir basliktir. Tasan kismi bolum kirpiyor.
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
  wordmark,
  primary,
  secondary,
}: {
  section: NavItem;
  hero: Site["hero"];
  wordmark: Site["wordmark"];
  primary: NavItem;
  secondary?: NavItem;
}) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId} className="overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 items-center lg:grid-cols-12 lg:gap-[var(--spacing-gutter-lg)]">
          <div className="flex flex-col gap-8 py-section lg:col-span-7 lg:gap-10 lg:py-section-lg">
            {/*
              `text-wrap: balance` burada susleme degil. Basligin tum anlami iki
              cumlenin karsitliginda ve tarayici onu ortasindan boluyordu:
              390, 1024, 1920 ve 2560'ta satir "changed. We" / "didn't." diye
              kiriliyor, "We" onceki cumlenin kuyruguna takiliyordu. (Sag kolon
              acilmadan once de boyleydi - bu sapma yeni degil, yalnizca
              olculdugunde gorundu.)

              Olculen sonuc, balance ile alti genislikte de cift bozulmuyor.
              Genislik siniri EKLENMEDI: denendi ve 768'i bozuyor - orada
              baslik tek satira sigiyor, 22ch capi onu gereksiz yere ikiye
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
            Isaret yalnizca lg ustunde: dar ekranda tasan bir wordmark metnin
            yerini alir, yanina gelmez.
          */}
          <div
            aria-hidden="true"
            className="hero-mark hidden lg:col-span-5 lg:block"
            style={{ "--mark": `"${wordmark}"` } as CSSProperties}
          />
        </div>
      </Container>
    </section>
  );
}
