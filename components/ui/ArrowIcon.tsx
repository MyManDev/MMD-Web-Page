/**
 * Ileri/geri oku. docs/design-spec.md §3.3.1 ve §3.4
 *
 * Once PrincipleDeck'in icinde ozel bir yardimciydi; ekran goruntusu karuseli
 * ayni tuslari istedi ve ok primitive'e tasindi - ExternalIcon ile ayni yol,
 * ikonun sekli tek yerde yasar.
 *
 * Inline SVG: tek bir ok icin bir ikon paketi eklemek CLAUDE.md kural 4'e gore
 * gerekcesi yazilamayacak bir bagimlilik olurdu. `aria-hidden` cunku
 * erisilebilir ad zaten tusun uzerinde.
 */
export function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : undefined}
      fill="none"
      height="16"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
      width="16"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
