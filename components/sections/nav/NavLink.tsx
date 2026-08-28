/**
 * Tek nav linki. Pill yuzeyi (docs/design-spec.md §3.1).
 *
 * Aktif durum renkle YALNIZ BASINA anlatilmaz: accent renk + aria-current
 * birlikte. Renk tek basina bilgi tasimaz (§7.5).
 */
export function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-[var(--height-nav-link)] items-center rounded-[var(--radius-pill)] px-4 font-mono text-mono uppercase transition-colors duration-150 ease-out ${
        active ? "text-accent" : "text-text-muted hover:text-text"
      }`}
    >
      {label}
    </a>
  );
}
