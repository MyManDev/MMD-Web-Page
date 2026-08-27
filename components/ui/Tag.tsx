/**
 * Tech tag. Statik - tiklanabilir degil, <li> olarak dizilir.
 * Olculer onay bekliyor: design-spec.md §10.7
 */
export function Tag({ children }: { children: string }) {
  return (
    <li className="inline-flex h-6 items-center rounded-sm bg-surface-2 px-2.5 font-mono text-xs tracking-[0.08em] text-text-muted uppercase">
      {children}
    </li>
  );
}
