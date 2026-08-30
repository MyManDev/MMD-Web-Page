import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { site } from "@/content";
import "./tokens.css";
import "./globals.css";

/**
 * next/font ile self-host: fontlar build sirasinda gomulur, runtime'da dis
 * istek yok. architecture.md §4.2
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  /* 600 ve 700 dusuruldu: display rolu IBM Plex Mono'ya gecti (§4.2), yani
     font-sans yalnizca govde metninde kaliyor ve orada 400/500 yetiyor.

     BAYT KAZANDIRMIYOR - olculdu, 169.888 byte iki durumda da ayni. Sebebi
     next/font'un kullanilmayan agirligi elemesi DEGIL: ilan edilen her agirlik
     icin bir @font-face kurali uretiyor, kullanilmayan 700 icin bile. Bayt
     degismiyor cunku Plex Sans degisken font olarak geliyor ve dort agirlik da
     ayni .woff2 dosyalarini isaret ediyor. Liste yine de kullanilana
     esitleniyor: burada yazan sey, hangi agirligin beklendigidir. */
  weight: ["400", "500"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/**
 * NOT: `description` BILEREK yok. SEO aciklamasi marka metnidir ve paylasilan
 * karar alanina girer (CLAUDE.md kural 5). Metin yazildiginda eklenir.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalUrl),
  title: site.wordmark,
  /**
   * Metin #15'te yazildi ve `content/schema.ts` onu ZORUNLU tutuyor, ama
   * buraya baglanmamisti: depoda duruyor, HTML'e girmiyordu. #11'in artik
   * engellenmemis yarisi bu.
   *
   * Open Graph ve Twitter card HALA #18'i (OG gorseli) bekliyor. Goruntusuz
   * bir OG etiketi yazmak, olmayan bir varliga isaret eden bir vaat olurdu -
   * ayni gerekce Hero gorselinde de yazili (§3.2).
   */
  description: site.description,
  /**
   * Kanonik adres marka metni DEGIL, bir adres - architecture.md §7'de
   * karara baglandi ve content/site.ts'te duruyor. "/" veriliyor cunku
   * metadataBase onu mutlak adrese cevirir; adres burada ikinci kez yazilmaz.
   */
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-page font-sans text-text antialiased">
        <a
          href="#main"
          className="sr-only z-[60] focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
