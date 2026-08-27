/**
 * Bolum numarasi + etiket. Mono rolu (architecture.md §4.2).
 * Numara DEKORATIF: ekran okuyucu "sifir bir Projects" diye okumasin diye
 * aria-hidden. design-spec.md §7.1
 */
export function SectionLabel({ number, children }: { number: string; children: string }) {
  return (
    <p className="font-mono text-xs tracking-[0.08em] text-text-muted uppercase">
      <span aria-hidden="true">{number}</span> <span>{children}</span>
    </p>
  );
}
