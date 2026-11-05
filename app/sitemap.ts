import type { MetadataRoute } from "next";
import { site } from "@/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return site.nav.map(({ href }) => ({
    url: new URL(href, site.canonicalUrl).href,
    changeFrequency: "monthly",
    priority: href === "/" ? 1 : 0.8,
  }));
}
