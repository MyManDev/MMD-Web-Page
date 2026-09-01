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
          {/* Sinif SPAN'lere degil bu kapsayiciya: `translate` inline bir
              ogede hic uygulanmiyor, yani span'de efektin yarisi sessizce
              kaybolurdu. */}
          <div className="reveal-on-enter flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
            <span className="text-text">{site.wordmark}</span>
            {/*
              Iki cumle de `content/site.ts`ten geliyor, burada SABIT
              YAZILMIYOR: marka metni paylasilan karar alani (CLAUDE.md kural 5)
              ve component onu okur, yeniden yazmaz.
            */}
            <span className="text-text-muted">{site.footer.tagline}</span>
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
            className="reveal-on-enter inline-flex items-center gap-2 text-text-muted transition-colors duration-150 ease-out hover:text-text"
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

        {/*
          KAPANIS CUMLESI ayri bir satirda ve sayfanin son sozu. Ustteki satirin
          icine sikistirmak onu bir etikete cevirirdi; burada kendi satirinda
          durdugu icin okunuyor.

          `border-t` YOK: footer'in kendi ust kenari zaten bir cizgi, ikincisi
          bandi ikiye bolerdi.
        */}
        {/*
          ADRESIN OKUNDUGU YER BURASI. Nav'daki aksiyonun etiketi kisa
          (`Contact`); tam adres burada yazili, yani ziyaretci tiklamadan da
          gorebiliyor ve kopyalayabiliyor.

          Etiket ve adres AYNI satirda: "CONTACT" tek basina bir baslik olsaydi
          footer'da ikinci bir hiyerarsi katmani acardi.
        */}
        <p className="reveal-on-enter flex flex-wrap items-center gap-2 font-mono text-mono uppercase">
          <span className="text-text-muted">Contact</span>
          <a
            href={`mailto:${site.email}`}
            className="text-text transition-colors duration-150 ease-out hover:text-text-muted"
          >
            <span className="rule">{site.email}</span>
          </a>
        </p>

        <p className="reveal-on-enter pb-8 font-mono text-mono text-text-muted uppercase">
          {site.footer.closing}
        </p>
      </Container>
    </footer>
  );
}
