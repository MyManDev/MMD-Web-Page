import type { TeamMember } from "@/content";
import { ExternalIcon } from "@/components/ui";
import { portraitSrcSet } from "@/lib/images";

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
 * BOLUMDE YESIL YOK (§5.1): hover yalnizca zemini degistiriyor, accent
 * getirmiyor. Team'de birincil aksiyon yok, dolayisiyla accent kotasi sifir.
 */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex h-full flex-col gap-4 rounded-card border border-border bg-surface p-[var(--spacing-card)] transition-colors duration-200 ease-out hover:bg-surface-2 lg:p-[var(--spacing-card-lg)]">
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
        <p className="overflow-hidden text-[14px] leading-[1.55] text-text-muted">{member.bio}</p>
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
