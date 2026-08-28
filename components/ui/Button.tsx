import type { ReactNode } from "react";

/**
 * Sayfadaki tek gercek aksiyon yuzeyi.
 * Durum matrisi: docs/design-spec.md §2.1. Yukseklik 44px: mobil dokunma
 * hedefi esigi; deger app/tokens.css'te --height-button.
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
  "inline-flex h-[var(--height-button)] items-center justify-center gap-2 rounded-sm px-5 font-mono text-xs tracking-[0.08em] uppercase transition-colors duration-150 ease-out";

const variants = {
  primary: "bg-accent text-page hover:bg-accent/90",
  ghost: "border border-border text-text hover:border-accent hover:bg-surface-2",
} as const;

const disabledStyle = "bg-surface-2 text-text-muted cursor-not-allowed";

/**
 * Dis link gostergesi. design-spec.md §2.1 ve §7.5'in yazili ama yazilmamis borcu.
 *
 * aria-hidden: ikon bilgi TASIMIYOR, tekrarliyor. Erisilebilir ad zaten metinde
 * ("GitHub", "Live Demo") ve §7.5 "yalnizca ikonla anlasilmasin" diyor - ekran
 * okuyucuya ikinci bir "link" duyurmak gurultu olurdu.
 *
 * currentColor: ikon zemininin metin rengini aliyor, yani kendi rengi yok.
 * primary'de page rengi, ghost'ta text rengi. Bolum basina tek yesil odak
 * kuralina (§5.1) yeni bir eleman sokmuyor - accent'i olan zemin, ikon degil.
 *
 * Inline SVG, ikon kutuphanesi degil: tek glif icin bagimlilik eklenmez
 * (CLAUDE.md kural 4) ve inline SVG sunucu component'inde sifir JS.
 */
function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

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
        {external ? <ExternalIcon /> : null}
      </a>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} aria-disabled={disabled}>
      {children}
    </button>
  );
}
