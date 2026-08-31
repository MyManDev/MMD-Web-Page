import type { Site } from "@/content";
import { Container, ExternalIcon } from "@/components/ui";

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
        <div className="flex flex-col gap-4 py-8 font-mono text-mono uppercase md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
            <span className="text-text">{site.wordmark}</span>
            <span className="text-text-muted">
              © {site.copyrightYear} {site.wordmark}
            </span>
          </div>

          {/*
            Dis link gostergesi §7.5'in gerekliligi ve Button'a #35'te eklendi;
            buradaki link Button DEGIL (duz mono <a>, §3.6 - footer'da 44px'lik
            bir dokunma hedefi fazla agir durur), o yuzden ikonu atlamisti.
            Ikon 12px: footer'in mono satiri Button'inkinden kucuk.
          */}
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-text-muted transition-colors duration-150 ease-out hover:text-text"
          >
            {/*
              `rule` ikonu DEGIL yalnizca metni kapsiyor: alt cizgi dis link
              ikonunun da altindan gecerse cizgi bir alti cizili metin gibi
              degil, kutuyu bolen bir sinir gibi okunuyor. Tetikleyen sey yine
              linkin kendisi (globals.css'te `a:hover .rule`).
            */}
            <span className="rule">GitHub</span>
            <ExternalIcon className="h-3 w-3" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
