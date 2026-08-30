/**
 * Tek nav linki. Pill yuzeyi (docs/design-spec.md §3.1).
 *
 * Aktif durum renkle YALNIZ BASINA anlatilmaz: accent renk + aria-current
 * birlikte. Renk tek basina bilgi tasimaz (§7.5).
 *
 * `roll` (#55): etiket iki kez yaziliyor ve hover/focus'ta dikey kayiyor.
 * Kural app/globals.css'te tek yerde; burada yalnizca yapisi kuruluyor.
 *
 * IKINCI KOPYA aria-hidden: erisilebilir ad TEK kalmali. Aksi halde ekran
 * okuyucu her nav linkini iki kez okurdu - gorsel bir detay, gezinmeyi
 * bozardi.
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
      <span className="roll">
        <span className="roll-track">
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
    </a>
  );
}
