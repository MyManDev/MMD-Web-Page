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
  weight: ["400", "500", "600", "700"],
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
