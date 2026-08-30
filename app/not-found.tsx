import { Button, Container } from "@/components/ui";

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
          {/*
            Bu bir BOLUM etiketi degil, bir durum isareti - 01-04 dizisi
            kalktiginda (#58) `SectionLabel` primitive'i de kalkti ve tek bir
            bolum-disi kullanim icin paylasilan bir component ayakta tutmak
            yanlis sekil olurdu.
          */}
          <p className="font-mono text-mono text-text-muted uppercase">
            <span aria-hidden="true">404</span> <span>Not found</span>
          </p>
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
