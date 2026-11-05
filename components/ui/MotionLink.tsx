"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { animateRouteChange, cancelRouteMotion } from "@/lib/route-motion";

type Props = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
  onNavigate?: () => void;
};

export function MotionLink({ href, onNavigate, replace, scroll, ...props }: Props) {
  const router = useRouter();
  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={scroll}
      onNavigate={(event) => {
        onNavigate?.();
        const target = new URL(href, window.location.href);
        if (target.pathname === window.location.pathname) {
          cancelRouteMotion();
          return;
        }
        event.preventDefault();
        animateRouteChange(() => {
          if (replace) router.replace(href, { scroll });
          else router.push(href, { scroll });
        });
      }}
    />
  );
}
