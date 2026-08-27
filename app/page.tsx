import { Container } from "@/components/ui";
import { site } from "@/content";

/**
 * BOS - bolumler Faz 3'te gelir (working-agreement.md §6).
 * Burada yalnizca landmark iskeleti ve wordmark var; wordmark uydurulmus bir
 * metin degil, architecture.md §7'de karar verilmis deger.
 */
export default function Home() {
  return (
    <main id="main">
      <Container>
        <h1 className="py-section font-sans text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] lg:text-[64px]">
          {site.wordmark}
        </h1>
      </Container>
    </main>
  );
}
