import type { Site } from "@/content";
import { Container, ExternalIcon } from "@/components/ui";
import styles from "./Footer.module.css";

/** Marka imzasi sunucuda cizilir; giris mevcut RevealOnView ile bir kez oynar. */
export function Footer({ site }: { site: Site }) {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="flex flex-col gap-4 py-8 font-mono text-mono uppercase md:flex-row md:items-center md:justify-between">
          <div className="reveal-on-enter flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
            <span className="text-text-muted">{site.footer.tagline}</span>
            <span className="text-text-muted">
              © {site.copyrightYear} {site.wordmark}
            </span>
          </div>
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable reveal-on-enter inline-flex items-center gap-2 text-text-muted transition-colors duration-150 ease-out hover:text-text"
          >
            <span className="rule">GitHub</span>
            <ExternalIcon className="h-3 w-3" />
          </a>
        </div>
        <div className="flex flex-col gap-8 pb-8 md:flex-row md:items-end md:justify-between">
          <p className="reveal-on-enter flex flex-wrap items-center gap-2 font-mono text-mono uppercase">
            <span className="text-text-muted">Contact</span>
            <a
              href={`mailto:${site.email}`}
              className="pressable text-text transition-colors duration-150 ease-out hover:text-text-muted"
            >
              <span className="rule">{site.email}</span>
            </a>
          </p>
          <p className={`reveal-on-enter self-end ${styles.signature}`}>
            <span className={styles.name}>{site.wordmark}</span>
            <span className={styles.closing}>{site.footer.closing}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
