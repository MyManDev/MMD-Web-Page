import type { Site } from "@/content";
import { Button, Container } from "@/components/ui";

type NavItem = Site["nav"][number];

/**
 * Contact. design-spec.md §3.7
 *
 * NEDEN VAR: ölçüldü, sitede hiçbir iletişim yolu yoktu. Nav'da ve footer'da
 * yalnızca GitHub duruyordu, yani işi beğenen bir ziyaretçinin gidebileceği tek
 * yer bir kod deposuydu. "Her projeyi ürettiği sayılarla yayınlıyoruz" diyen bir
 * kolektifin kapısının olmaması en büyük işlevsel boşluktu.
 *
 * FORM DEĞİL. Site tamamen statik (architecture.md §6); bir form backend, bir
 * uç nokta ve spam koruması ister. `mailto` aynı işi sıfır altyapıyla yapıyor.
 *
 * DÜZ `mailto` ve bunun bir bedeli var: herkese açık bir sayfada yazılı bir
 * adres taranır. Alternatifi JS ile gizlemekti ve o reddedildi - iletişim yolu
 * JS'in gelmesine bağlı olmamalı. Aynı gerekçe `BioTypewriter` ve
 * `RevealOnView`da da yazılı: gizleyen taraf, gelmeyebilecek olan taraf olmalı.
 * Bedel bilerek kabul edildi.
 *
 * CÜMLE UYDURULMADI (CLAUDE.md kural 5). Bölüm başlık ve adresten oluşuyor;
 * başlık `content/site.ts`teki nav kaydından geliyor, ikinci kez yazılmıyor.
 * Bir cümle isteniyorsa onu karar sahibi yazar.
 *
 * BÖLÜMÜN TEK YEŞİLİ adres aksiyonunun zemini (§5.1). Başlık yeşil değil.
 *
 * `external` DEĞİL: `Button`ın `external` bayrağı yeni sekme açıyor ve dış link
 * ikonu koyuyor. Bir `mailto` yeni sekmede açılacak bir sayfa değil, posta
 * istemcisine devrediyor - ikon orada bilgi katmaz, yanlış söyler.
 *
 * Bölüm TAM EKRAN DEĞİL: içinde bir başlık ve bir aksiyon var. Bir ekranı tek
 * bir adresle doldurmak boşluğu tasarım gibi göstermek olurdu.
 */
export function Contact({ section, email }: { section: NavItem; email: string }) {
  const headingId = `${section.id}-title`;

  return (
    <section id={section.id} aria-labelledby={headingId} className="section-edge">
      <Container>
        <div className="flex flex-col gap-6 py-section lg:gap-8 lg:py-section-lg">
          <h2
            id={headingId}
            className="reveal-on-enter font-mono text-display-xl font-medium lg:text-display-xl-lg"
          >
            {section.label}
          </h2>

          {/*
            Adres AKSIYONUN ETIKETI: ziyaretçi tıklamadan da adresi görüyor ve
            kopyalayabiliyor. "Send us an email" gibi bir etiket adresi
            saklardı ve tıklamayı zorunlu kılardı.
          */}
          <div className="reveal-on-enter flex">
            <Button href={`mailto:${email}`} variant="primary">
              {email}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
