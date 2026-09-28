import type { Site, TeamMember } from "@/content";
import { Container } from "@/components/ui";
import { TeamCard } from "./TeamCard";

type NavItem = Site["nav"][number];

/**
 * Team bolumu - kisileri tek tek tanitan kartlar. design-spec.md §3.5
 *
 * Kolektifi anlatan metin bir onceki bolumde (03 Who we are); burasi tekil.
 * Genelden tekile, architecture.md §2.
 *
 * Baslik metni uydurulmuyor: nav etiketi content/site.ts'ten geliyor, ikinci
 * kez yazilmiyor. Bolum h2, kartlar h3 - seviye atlanmiyor (§7.1).
 *
 * SectionLabel YOK. "04 TEAM" etiketi ile "Team" basligi ayni kelimeyi iki kez
 * soyluyordu; numara da tek basina kaldiginda bir sey anlatmiyordu. Projects'te
 * etiket duruyor cunku orada baslik proje adi ve etiket bilgi katiyor.
 *
 * `members` bossa bolum HIC render edilmez - bos cerceve veya "coming soon"
 * yok (CLAUDE.md kural 6). Karar cagiran tarafta: app/page.tsx.
 *
 * Kartlar <ul>/<li>: ekran okuyucu kac kisi oldugunu duyurur (§7.5, Tag
 * listesiyle ayni gerekce).
 */
export function Team({ section, members }: { section: NavItem; members: TeamMember[] }) {
  const headingId = `${section.id}-title`;

  return (
    /*
      TAM EKRAN (istek: "team tek basina ekrana sigmiyor, tam bir ekran boyutu
      olmali"). Onceki hali viewport'un %115'i, 1600x900'de %125 - yani
      kartlarin alti her zaman kesiliyordu.

      YUKSEKLIK ORANDAN DEGIL KALAN ALANDAN geliyor ve bu hesaplanarak secildi:
      1440x900'de 2/3 orani sigdiriyor, ama 1600x900'de kart genisligi 490px'e
      ciktigi icin yine %109 tasiyor. Kart genisligi kapsayiciyla buyurken ekran
      yuksekligi sabit kaliyor, yani TEK BIR SABIT ORAN her viewport'ta
      sigdiramaz.

      Zincir: bolum `h-dvh` -> Container `flex-1` -> ic sarmalayici `flex-1` ->
      liste `flex-1`. Her halka `min-h-0` tasimak zorunda; taşimazsa flex
      cocugu icerigin dogal yuksekliginden kucuk olamiyor ve tasma geri geliyor.

      Yalnizca `lg`de: mobilde bolum dogal akista kaliyor ve oran token'i
      (`--aspect-portrait`) orada gecerli.
    */
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="section-edge lg:flex lg:h-dvh lg:flex-col"
    >
      <Container className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="flex flex-col gap-6 py-section lg:min-h-0 lg:flex-1 lg:gap-8 lg:py-section-lg">
          {/*
            Basliktan karta mesafe 40/56'dan 24/32'ye indi (istek: "baslik biraz
            yukari"). Bolumun dis ritmi (py-section) DEGISMEDI - o paylasilan bir
            olcu ve tek bir bolum icin oynatilmaz (§4.2).
          */}
          <h2
            id={headingId}
            className="reveal-on-enter font-mono text-display-xl font-medium lg:text-display-xl-lg"
          >
            {section.label}
          </h2>

          {/*
            lg'de her kart UC KOLONLUK IZIN genisliginde: (liste - 2 x gap) / 3.
            Satir tek ve ortada (§3.5). Uc kisiyle satir tam doluyor; daha az
            kisiyle kartlar ne buyuyor ne kuculuyor, ortada duruyor. Genislik
            breakpoint'ten geliyor, dizinin uzunlugundan hesaplanmiyor - `sizes`
            ve gorsel genislikleri bu sayiya bagli (TeamCard.tsx, lib/images.ts).

            flex, grid degil: grid'de bos kalan bir kolon satiri sola yaslar,
            `repeat(auto-fit, ...)` kolon sayisini tam yuvarlama sinirinda
            hesapliyor ve ucuncu kart alt satira dusebilir. Varsayilan nowrap ve
            shrink 1/64px'lik yuvarlama farkini yutuyor. calc, gap-8 ile ayni
            `--spacing`'i okuyor. Yerlesim markup'ta: globals.css katmansiz ve
            lg:/sm: utility'lerini ezerdi.
          */}
          <ul
            data-cards
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:flex lg:min-h-0 lg:flex-1 lg:justify-center"
          >
            {members.map((member) => (
              <li key={member.slug} className="lg:w-[calc((100%-var(--spacing)*16)/3)]">
                <TeamCard member={member} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
