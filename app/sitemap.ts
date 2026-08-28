import type { MetadataRoute } from "next";
import { site } from "@/content";

/**
 * sitemap.xml. Tek sayfa, tek giris - bolumler anchor, ayri URL degil
 * (architecture.md §2). 404 sitemap'e girmez.
 *
 * `lastModified` BILEREK yok: bugunun tarihini yazmak build'i deterministik
 * olmaktan cikarirdi - ayni kaynak her koşuda farkli bir sitemap uretirdi ve
 * fark gercek bir degisikligi degil saati gosterirdi.
 */
/**
 * `output: 'export'` altinda Next bu route'un statik oldugunu ACIKCA duymak
 * istiyor; olmadan build patiyor. Zaten dinamik hicbir sey yok - deger
 * content/site.ts'ten geliyor ve build sirasinda sabit.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.canonicalUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
