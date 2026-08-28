import { Button, Container, SectionLabel } from "@/components/ui";

/**
 * Gercek 404. Statik export bunu out/404.html olarak uretir ve host bilinmeyen
 * yolda bu dosyayi 404 durum koduyla dondurur.
 *
 * Optimizer'da statik host'un uygulama kabugunu 404 yerine 200 ile dondurmesi
 * gercek yayinda cikmisti; bu yuzden E2E'de kapi olarak test ediliyor
 * (architecture.md §7, §8).
 */
export default function NotFound() {
  return (
    <main id="main">
      <Container>
        <div className="py-section-lg">
          <SectionLabel number="404">Not found</SectionLabel>
          <p className="mt-4 mb-8 text-body text-text-muted lg:text-body-lg">
            This page does not exist.
          </p>
          <Button href="/" variant="ghost">
            Back to home
          </Button>
        </div>
      </Container>
    </main>
  );
}
