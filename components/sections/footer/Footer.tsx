import type { Site } from "@/content";
import { Container } from "@/components/ui";

/**
 * Footer. docs/design-spec.md §3.6 — navbar'in aynasi: surface zemin, ustte
 * 1px border, tamami mono rolu.
 *
 * Sunucu component'i: durum yok, etkilesim yok, payload'a eklemiyor.
 *
 * BOLUMDE YESIL YOK (§5.1). Burada birincil aksiyon olmadigi icin accent
 * kotasi sifir; GitHub linki de duz mono link, Button degil - footer'da
 * 44px'lik bir dokunma hedefi fazla agir durur.
 *
 * Telif cumlesi content/site.ts'teki copyrightYear'dan kuruluyor; metin
 * burada ikinci kez yazilmiyor (NOTICE tek kayit).
 */
export function Footer({ site }: { site: Site }) {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="flex flex-col gap-4 py-8 font-mono text-xs tracking-[0.08em] uppercase md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
            <span className="text-text">{site.wordmark}</span>
            <span className="text-text-muted">
              © {site.copyrightYear} {site.wordmark}
            </span>
          </div>

          <a
            href={site.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted transition-colors duration-150 ease-out hover:text-text"
          >
            GitHub
          </a>
        </div>
      </Container>
    </footer>
  );
}
