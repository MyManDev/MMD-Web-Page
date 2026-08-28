import type { MetadataRoute } from "next";
import { site } from "@/content";

/**
 * robots.txt. #11'in metin gerektirmeyen yarisi - SEO aciklamasi marka metni
 * ve bekliyor (#15), ama bu dosya yalnizca kanonik adresi istiyor.
 *
 * Adres content/site.ts'ten geliyor; ikinci kez yazilmiyor. architecture.md §7
 * kanonik adresi mymandev.com olarak sabitledi.
 *
 * Statik export: Next bu dosyayi build sirasinda out/robots.txt olarak uretir.
 */
/**
 * `output: 'export'` altinda Next bu route'un statik oldugunu ACIKCA duymak
 * istiyor; olmadan build patiyor. Zaten dinamik hicbir sey yok - deger
 * content/site.ts'ten geliyor ve build sirasinda sabit.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.canonicalUrl}/sitemap.xml`,
  };
}
