import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { RevealOnView } from "@/components/ui";
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
   * Open Graph ve Twitter card bir zamanlar #18'i bekliyordu; goruntusuz bir OG
   * etiketi yazmak olmayan bir varliga isaret eden bir vaat olurdu. #18 kapandi,
   * gorsel `public/og.png` olarak var, etiketler asagida.
   */
  description: site.description,
  /**
   * Kanonik adres marka metni DEGIL, bir adres - architecture.md §7'de
   * karara baglandi ve content/site.ts'te duruyor. "/" veriliyor cunku
   * metadataBase onu mutlak adrese cevirir; adres burada ikinci kez yazilmaz.
   */
  alternates: { canonical: "/" },

  /*
    Adres ve metin IKINCI KEZ YAZILMIYOR: `url` ve `images` goreli veriliyor,
    `metadataBase` onlari mutlak adrese ceviriyor; baslik ve aciklama zaten
    yukarida tanimli degerlerin ta kendisi. Bir gun alan adi degistiginde
    degisecek tek yer `content/site.ts`.

    `width`/`height` gorselin GERCEK olcusu ve `scripts/build-og.mjs` uretirken
    o olcuyu dogruluyor - eslesmedigi anda atiyor. Bazi paylasim onizlemeleri
    bu iki sayiya bakip yer ayiriyor; yanlis olduklarinda kart kayiyor.

    `alt` marka adinin kendisi: gorselde zaten amblem ve wordmark var, yani
    baska bir cumle yazmak yeni bir marka metni yazmak olurdu (kural 5).
  */
  openGraph: {
    type: "website",
    siteName: site.wordmark,
    title: site.wordmark,
    description: site.description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.wordmark }],
  },

  /*
    `summary_large_image`: kart 1200x630 ve buyuk bicimde gosterilmek uzere
    tasarlandi. Varsayilan `summary` onu kucuk bir kareye kirpardi.
  */
  twitter: {
    card: "summary_large_image",
    title: site.wordmark,
    description: site.description,
    images: ["/og.png"],
  },
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
        <RevealOnView />
      </body>
    </html>
  );
}
