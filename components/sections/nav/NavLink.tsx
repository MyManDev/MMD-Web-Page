import Link from "next/link";

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
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-[var(--height-nav-link)] items-center rounded-[var(--radius-pill)] px-4 font-mono text-nav uppercase transition-colors duration-150 ease-out ${
        active ? "text-accent" : "text-text-muted hover:text-text"
      }`}
    >
      <span className="roll">
        <span className="roll-track">
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
    </Link>
  );
}
