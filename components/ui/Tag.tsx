/**
 * Tech tag. Statik - tiklanabilir degil, <li> olarak dizilir.
 * Yukseklik app/tokens.css'te --height-tag. Tiklanabilir olmadigi icin 44px
 * dokunma hedefi gerekmiyor.
 */
export function Tag({ children }: { children: string }) {
  return (
    <li className="inline-flex h-[var(--height-tag)] items-center rounded-sm bg-surface-2 px-2.5 font-mono text-xs tracking-[0.08em] text-text-muted uppercase">
      {children}
    </li>
  );
}
