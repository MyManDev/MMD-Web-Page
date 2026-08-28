import type { TeamMember } from "@/content";
import { ExternalIcon } from "@/components/ui";
import { portraitSrcSet } from "@/lib/images";
import { BioTypewriter } from "./BioTypewriter";

/**
 * Tek kisi karti. docs/design-spec.md §3.5
 *
 * BIYOGRAFI HOVER ILE ACILIR - ve hover TEK YOL DEGIL. Uc giris yolu birden
 * karsilaniyor:
 *   fare      group-hover
 *   klavye    group-focus-within  (karttaki GitHub linkine tab'lanınca)
 *   dokunmatik  @media (hover: none) - aciklama HER ZAMAN acik
 *
 * Ucuncusu sart: Tailwind v4'te `hover:` zaten `@media (hover: hover)` icinde,
 * yani dokunmatik cihazda hic tetiklenmiyor. Yalnizca hover'a baglanan bir
 * aciklama o cihazlarda ERISILEMEZ ICERIK olurdu; klavye erisimi de sert kapi
 * (architecture.md §8).
 *
 * Aciklama DOM'DAN HIC CIKMIYOR: grid satiri 0fr'den 1fr'ye aciliyor,
 * `display: none` veya `visibility: hidden` kullanilmiyor - ekran okuyucu onu
 * her durumda okuyabilmeli. Kapali haldeyken de metin oradadir, yalnizca
 * yuksekligi sifirdir.
 *
 * GitHub linki ACILAN ALANIN DISINDA duruyor. Icinde olsaydi klavye ile
 * ulasilamazdi: focus'lanabilmesi icin once acilmasi, acilmasi icin de
 * focus'lanmasi gerekirdi.
 *
 * KART HOVER'DA KALKIYOR (-10px). design-spec.md §6 bunu Projects icin
 * yasakliyor ve gerekcesi orada yazili: sticky yigin ile birlikte katman
 * sirasini okunmaz hale getiriyor. Team kartlari yiginda DEGIL, o yuzden
 * gerekce burada gecerli degil. Kural §6'da bolum bazina ayrildi.
 *
 * Kalkma layout'a dokunmuyor, yani komsu kartlar kaymiyor. Tailwind v4
 * `translate-y-*` icin `transform` DEGIL `translate` ozelligini kullaniyor;
 * gecis listesi ve testi de onu okuyor (olculdu: `transform` "none" kaliyor).
 *
 * `focus-within:` grubun KENDISINE uygulaniyor, `group-focus-within:` degil -
 * ikincisi yalnizca .group'un ALT ogelerine iner ve kartin kendisi kalkmazdi.
 * Metin kalkmadan 100ms SONRA beliriyor (delay-100) - once kart hareket
 * ediyor, sonra yazi geliyor.
 *
 * BOLUMDE YESIL YOK (§5.1): hover zemini ve konumu degistiriyor, accent
 * getirmiyor. Team'de birincil aksiyon yok, dolayisiyla accent kotasi sifir.
 */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex h-full -translate-y-0 flex-col gap-4 rounded-card border border-border bg-surface p-[var(--spacing-card)] transition-[translate,background-color] duration-200 ease-out hover:-translate-y-2.5 hover:bg-surface-2 focus-within:-translate-y-2.5 focus-within:bg-surface-2 lg:p-[var(--spacing-card-lg)]">
      <div className="overflow-hidden rounded-sm border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element -- olculdu, #34: next/image 5.5 KiB client JS ekliyor, statik export'ta karsiligi sifir */}
        <img
          src={member.photo}
          srcSet={portraitSrcSet(member.photo)}
          sizes="(min-width: 1024px) 351px, (min-width: 640px) calc(50vw - 36px), calc(100vw - 40px)"
          alt={member.name}
          width={720}
          height={900}
          loading="lazy"
          decoding="async"
          className="aspect-portrait h-full w-full object-cover"
        />
      </div>

      <h3
        id={`${member.slug}-name`}
        className="font-sans text-[20px] leading-[1.25] font-semibold tracking-[-0.02em] lg:text-[24px]"
      >
        {member.name}
      </h3>

      <p className="font-mono text-xs tracking-[0.08em] text-text-muted uppercase">{member.role}</p>

      {/*
        0fr -> 1fr: yuksekligi CSS'in kendisi hesapliyor, sabit bir max-height
        tahmin edilmiyor. Tahmin edilen bir yukseklik uzun bir biyografiyi
        keserdi ve kesildigi hicbir kapida gorunmezdi.
      */}
      <div
        data-bio
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]"
      >
        <BioTypewriter
          text={member.bio}
          className="overflow-hidden text-[14px] leading-[1.55] text-text-muted"
        />
      </div>

      <a
        href={member.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={`${member.slug}-name`}
        className="mt-auto inline-flex items-center gap-2 self-start font-mono text-xs tracking-[0.08em] text-text-muted uppercase transition-colors duration-150 ease-out hover:text-text"
      >
        GitHub
        <ExternalIcon className="h-3 w-3" />
      </a>
    </article>
  );
}
