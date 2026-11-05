import type { Metadata } from "next";
import { site } from "@/content";

export function pageMetadata(path: string, name: string, description: string): Metadata {
  const title = path === "/" ? site.wordmark : `${name} | ${site.wordmark}`;
  return {
    metadataBase: new URL(site.canonicalUrl),
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.wordmark,
      title,
      description,
      url: path,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.wordmark }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
