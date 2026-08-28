/**
 * Dis link gostergesi. docs/design-spec.md §2.1 ve §7.5
 *
 * Once Button'in icinde ozel bir yardimciydi; Footer'in GitHub linki Button
 * DEGIL (duz mono <a>, §3.6) ve ayni gostergeyi istiyor. Iki yerde ayni SVG'yi
 * yazmak yerine primitive'e tasindi - ikonun sekli tek yerde yasar.
 *
 * aria-hidden: ikon bilgi TASIMIYOR, tekrarliyor. Erisilebilir ad zaten metinde
 * ("GitHub", "Live Demo") ve §7.5 "yalnizca ikonla anlasilmasin" diyor - ekran
 * okuyucuya ikinci bir "link" duyurmak gurultu olurdu. focusable="false" da
 * ikonun tab sirasina girmesini engelliyor.
 *
 * currentColor: ikonun kendi rengi yok, zeminin metin rengini aliyor. Button
 * primary'de page, ghost'ta text, footer'da text-muted. Bolum basina tek yesil
 * odak kuralina (§5.1) yeni bir eleman sokmuyor.
 *
 * Inline SVG, ikon kutuphanesi degil: tek glif icin bagimlilik eklenmez
 * (CLAUDE.md kural 4) ve inline SVG sunucu component'inde sifir JS.
 *
 * Olcu cagiran tarafta: Button 14px (h-3.5) ile mono metnine, Footer 12px
 * (h-3) ile kendi kucuk mono satirina oturuyor.
 */
export function ExternalIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      className={`shrink-0 ${className}`}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
