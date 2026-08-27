import type { ElementType, ReactNode } from "react";

/**
 * Genislik ve yatay padding'in TEK kaynagi. Hicbir bolum kendi genisligini
 * tanimlamaz. Olculer: docs/architecture.md §4.3, uygulama: design-spec.md §1
 */
export function Container({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-content px-5 lg:px-8 ${className}`.trim()}>
      {children}
    </Tag>
  );
}
