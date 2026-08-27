import type { ReactNode } from "react";

/**
 * Sayfadaki tek gercek aksiyon yuzeyi.
 * Durum matrisi: docs/design-spec.md §2.1. Olculer onay bekliyor: §10.9.
 *
 * href varsa <a>, yoksa <button>. external ise yeni sekme + rel guvenligi.
 */
type ButtonProps = {
  variant?: "primary" | "ghost";
  href?: string;
  external?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm px-5 font-mono text-xs tracking-[0.08em] uppercase transition-colors duration-150 ease-out";

const variants = {
  primary: "bg-accent text-page hover:bg-accent/90",
  ghost: "border border-border text-text hover:border-accent hover:bg-surface-2",
} as const;

const disabledStyle = "bg-surface-2 text-text-muted cursor-not-allowed";

export function Button({
  variant = "primary",
  href,
  external = false,
  disabled = false,
  children,
}: ButtonProps) {
  const className = `${base} ${disabled ? disabledStyle : variants[variant]}`;

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} aria-disabled={disabled}>
      {children}
    </button>
  );
}
