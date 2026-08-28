import type { TeamMember } from "@/content";
import { ExternalIcon } from "@/components/ui";
import { portraitSrcSet } from "@/lib/images";
import { BioTypewriter } from "./BioTypewriter";

/**
 * Tek kisi karti. docs/design-spec.md §3.5
 *
 * KART FOTOGRAFIN KENDISI. Kutu 5/8 oraninda ve goruntu onu tamamen kapliyor;
 * ad ve rol altta, goruntunun uzerinde duruyor. Hover'da goruntu hayaletlesiyor
 * ve biyografi ustunde beliriyor.
 *
 * KAYMA YOK, ve sebebi bu duzenin kendisi: acilan her sey MUTLAK konumlu, yani
 * kartin yuksekligi hicbir zaman degismiyor. Onceki duzen biyografiyi akisa
 * ekliyordu ve hover'da bolum 108px buyuyordu - Team'in altindaki her sey,
 * footer dahil, asagi kayiyordu (uc breakpoint'te de olculdu).
 *
 * HOVER TEK YOL DEGIL. Uc giris yolu birden karsilaniyor:
 *   fare        group-hover
 *   klavye      group-focus-within - linkler durgun halde de gorunur; birine
 *               tab'lanmak perdeyi aciyor
 *   dokunmatik  @media (hover: none) - perde HER ZAMAN acik
 *
 * Ucuncusu sart: Tailwind v4'te `hover:` zaten `@media (hover: hover)` icinde,
 * yani dokunmatikte `group-hover` hic tetiklenmiyor. Yalnizca hover'a baglanan
 * bir aciklama o cihazlarda ERISILEMEZ ICERIK olurdu (architecture.md §8).
 *
 * PERDE OKUNABILIRLIK ICIN, dekorasyon icin degil. Metin bir fotografin
 * uzerinde duruyor; perdesiz birakmak kontrasti goruntunun icerigine
 * birakirdi - acik bir fotografta metin kaybolurdu. Perde `surface` zemini
 * %92 opaklikla getiriyor, yani kontrast fiilen "surface uzerinde metin".
 *
 * BOLUMDE YESIL YOK (§5.1): hover perdeyi ve konumu degistiriyor, accent
 * getirmiyor. Team'de birincil aksiyon yok, dolayisiyla accent kotasi sifir.
 */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group relative aspect-portrait w-full overflow-hidden rounded-card border border-border bg-surface transition-[translate] duration-200 ease-out hover:-translate-y-2.5 focus-within:-translate-y-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- olculdu, #34: next/image 5.5 KiB client JS ekliyor, statik export'ta karsiligi sifir */}
      <img
        src={member.photo}
        srcSet={portraitSrcSet(member.photo)}
        sizes="(min-width: 1600px) 491px, (min-width: 1024px) 34vw, (min-width: 640px) calc(50vw - 36px), calc(100vw - 40px)"
        alt={member.name}
        width={1000}
        height={1600}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/*
        Hover perdesi: kartin tamami. Goruntu ardinda hayalet gibi kaliyor.
        `(hover: none)` altinda bastan acik, cunku orada hover hic gelmiyor.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface/92 opacity-0 transition-opacity duration-200 ease-out group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      />

      {/*
        Metin panelinin zemini GRADYAN DEGIL, olculebilir bir opaklik - ve bu
        olculerek secildi. Once altta yariya kadar bir gradyan vardi; metnin
        durdugu yerde perde ~%54'e dusuyordu ve BEMBEYAZ bir fotografta rol
        yazisi 1.84:1 veriyordu (gereken 4.5). Mock fotograflar koyu oldugu icin
        sorun GORUNMUYORDU - sahte veriyle iyi gorunen bir hata.

        %92'de en kotu durum (beyaz fotograf) olculdu: ad 12.83:1, rol ve
        biyografi 6.83:1. Yani kontrast artik fotografin icerigine bagli degil.

        Gecis yumusakligi panelin USTUNDEKI seride birakildi (bottom-full).
      */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-surface/92 p-[var(--spacing-card)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-full h-20 bg-gradient-to-t from-surface/92 to-transparent"
        />
        <h3
          id={`${member.slug}-name`}
          className="font-mono text-display-m font-medium lg:text-display-m-lg"
        >
          {member.name}
        </h3>

        <p className="font-mono text-mono text-text-muted uppercase">{member.role}</p>

        {/*
          Biyografi DARALIYOR (0fr -> 1fr), yalnizca solmakla kalmiyor: gizliyken
          yer isgal etseydi ad kartin ortasinda asili kalirdi ve altinda bos bir
          alan olurdu (olculdu ve gorunuyordu). Kart yuksekligi yine sabit - blok
          mutlak konumlu ve alta cakili, yani buyume disari tasmiyor.
        */}
        <div
          data-bio
          className="grid grid-rows-[0fr] transition-[grid-template-rows,opacity] delay-100 duration-200 ease-out group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]"
        >
          <BioTypewriter
            text={member.bio}
            className="overflow-hidden text-body-s text-text-muted"
          />
        </div>

        {/*
          Linkler DARALAN ALANIN DISINDA ve durgun halde de gorunur. Icinde
          olsalardi sifir yukseklikli bir kutunun icinde kalirlardi; odaklanmak
          teknik olarak mumkun ama kullanici odaklandigi seyin nerede oldugunu
          goremezdi.

          Erisilebilir adlari tek basina "GitHub" olsaydi sayfada ayni adi
          tasiyan alti link olurdu; aria-describedby her birini kartin adina
          bagliyor.
        */}
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: "GitHub", href: member.githubUrl },
            { label: "LinkedIn", href: member.linkedinUrl },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby={`${member.slug}-name`}
                className="inline-flex items-center gap-2 font-mono text-mono text-text-muted uppercase transition-colors duration-150 ease-out hover:text-text"
              >
                {link.label}
                <ExternalIcon className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
