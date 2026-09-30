import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projectSchema, siteSchema, teamMemberSchema } from "@/content/schema";
import { projects, site, team } from "@/content";
import { validProject, validTeamMember } from "./fixtures";

describe("projectSchema", () => {
  it("gecerli bir kaydi kabul eder", () => {
    expect(projectSchema.parse(validProject)).toEqual(validProject);
  });

  it("liveUrl opsiyoneldir", () => {
    const withoutLive: Record<string, unknown> = { ...validProject };
    delete withoutLive.liveUrl;
    expect(() => projectSchema.parse(withoutLive)).not.toThrow();
  });

  it("birden fazla goruntuyu verildigi sirayla kabul eder", () => {
    const screenshots = [
      { src: "/projects/a-1792.webp", alt: "A", caption: "A." },
      { src: "/projects/b-1792.webp", alt: "B", caption: "B." },
    ];
    expect(projectSchema.parse({ ...validProject, screenshots }).screenshots).toEqual(screenshots);
  });

  it.each([
    ["screenshots eksik", { screenshots: undefined }],
    ["screenshots bos", { screenshots: [] }],
    // Her goruntunun kendi alt metni var; karuselde ortak bir metin hangisinin
    // ekranda oldugunu soylemezdi.
    [
      "bir goruntunun alt'i bos",
      { screenshots: [{ src: "/projects/x-1792.webp", alt: "", caption: "X." }] },
    ],
    [
      "bir goruntunun src'si goreli",
      { screenshots: [{ src: "projects/x-1792.webp", alt: "X", caption: "X." }] },
    ],
    // Baslik gorunur ve zorunlu: eksikse kart basliksiz yayinlanmaz.
    ["bir goruntunun basligi eksik", { screenshots: [{ src: "/projects/x-1792.webp", alt: "X" }] }],
    [
      "bir goruntunun basligi bos",
      { screenshots: [{ src: "/projects/x-1792.webp", alt: "X", caption: "" }] },
    ],
    ["tags bos", { tags: [] }],
    ["repoUrl http", { repoUrl: "http://github.com/MyManDev/x" }],
    ["slug kebab-case degil", { slug: "Football Squad" }],
    ["order negatif", { order: -1 }],
    ["summary bos", { summary: "" }],
    // Bir proje karti tek satirla yayina cikamaz - "cok az anlatiyoruz"
    // durumunun ta kendisi buydu. Alan ZORUNLU, opsiyonel degil.
    ["description eksik", { description: undefined }],
    ["description bos", { description: "" }],
  ])("%s ise reddeder", (_label, patch) => {
    expect(() => projectSchema.parse({ ...validProject, ...patch })).toThrow();
  });
});

describe("teamMemberSchema", () => {
  it("gecerli bir kaydi kabul eder", () => {
    expect(teamMemberSchema.parse(validTeamMember)).toEqual(validTeamMember);
  });

  it.each([
    ["bio eksik", { bio: undefined }],
    ["role bos", { role: "" }],
    ["githubUrl url degil", { githubUrl: "MyManDev" }],
  ])("%s ise reddeder", (_label, patch) => {
    expect(() => teamMemberSchema.parse({ ...validTeamMember, ...patch })).toThrow();
  });
});

describe("siteSchema", () => {
  it("wordmark yalnizca MyManDev olabilir", () => {
    expect(() => siteSchema.parse({ ...site, wordmark: "myman.dev" })).toThrow();
  });

  it("copyrightYear zorunlu ve tam sayi", () => {
    const withoutYear: Record<string, unknown> = { ...site };
    delete withoutYear.copyrightYear;
    expect(() => siteSchema.parse(withoutYear)).toThrow();
    expect(() => siteSchema.parse({ ...site, copyrightYear: 2026.5 })).toThrow();
  });

  /**
   * Bolum numarasi (`number`) #58'de kalkti - etiketler kaldirilinca sema da
   * gevsetilmedi, alan tamamen dustu. Geriye kalan sozlesme id + label ve
   * ikisi de zorunlu; bu test o sozlesmeyi tutuyor ki `number` gidince nav
   * testsiz kalmasin.
   */
  it("nav kaydi id ve label ister", () => {
    expect(() => siteSchema.parse({ ...site, nav: [{ id: "hero" }] })).toThrow();
    expect(() => siteSchema.parse({ ...site, nav: [{ label: "Hero" }] })).toThrow();
    expect(() => siteSchema.parse({ ...site, nav: [{ id: "", label: "Hero" }] })).toThrow();
    expect(() => siteSchema.parse({ ...site, nav: [{ id: "hero", label: "Hero" }] })).not.toThrow();
  });

  it("nav bos olamaz", () => {
    expect(() => siteSchema.parse({ ...site, nav: [] })).toThrow();
  });
});

describe("content/index loader", () => {
  it("site kaydi semadan geciyor", () => {
    expect(site.wordmark).toBe("MyManDev");

    /*
      SAYI DEGIL SOZLESME. Burada `toHaveLength(4)` yaziliydi ve Contact bolumu
      eklenince dustu - davranis bozulmadigi halde. Dort hicbir zaman sozlesme
      degildi; deponun iki kez kaydettigi tuzagin aynisi (HANDOFF: "testin o
      gunku sayiyi tutmasi bir kusurdur").

      Olculen sey: liste bos degil, her kaydin id ve etiketi var, id'ler
      TEKIL ve kebab-case. Bir bolum eklendiginde bunlar hala dogru; bozuk bir
      kayit eklendiginde dusuyor.
    */
    expect(site.nav.length).toBeGreaterThan(0);
    for (const item of site.nav) {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(site.nav.map((item) => item.id)).size).toBe(site.nav.length);
  });

  /**
   * Iletisim adresi. Bir vitrinin kapisi opsiyonel degil (§3.7) ve yanlis
   * yazilmis bir adres sessizce calismayan bir kapi olurdu - o yuzden bicimi
   * semada zorlaniyor, burada da okunuyor.
   */
  it("iletisim adresi var ve bicimi gecerli", () => {
    expect(site.email.length).toBeGreaterThan(0);
    expect(() => siteSchema.parse({ ...site, email: "bu bir adres degil" })).toThrow();
    expect(() => siteSchema.parse({ ...site, email: site.email })).not.toThrow();
  });

  /**
   * SAYI DEGIL SOZLESME (nav testiyle ayni gerekce). Burada `toHaveLength(1)`
   * ve sabit bir slug yaziliydi; ikinci proje eklendiginde davranis bozulmadigi
   * halde duserdi.
   *
   * Olculen sey: kayit bos degil; slug'lar TEKIL, cunku kartin React key'i
   * slug'dan geliyor (Projects.tsx).
   */
  it("projects kaydi bos degil ve slug'lar tekil", () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
  });

  /**
   * Sema her `src`'nin "/" ile basladigini dogruluyor, dosyanin VAR OLDUGUNU
   * degil. Var olmayan bir yola isaret eden kayit build'i gecer ve sitede kirik
   * gorsel cikar - bu test o araligi kapatiyor.
   */
  it("her projenin ekran goruntuleri public/ altinda gercekten duruyor", () => {
    for (const project of projects) {
      for (const { src } of project.screenshots) {
        const file = join(process.cwd(), "public", src);
        expect(existsSync(file), `${project.slug}: ${src} bulunamadi`).toBe(true);
      }
    }
  });

  /**
   * Karusel slaytlarinin React `key`'i `src` (ScreenshotCarousel.tsx). Ayni
   * goruntu bir kartta iki kez gecerse key'ler cakisir ve React slaytlari
   * karistirir. Sema bunu zorlamiyor; ekibin slug'lari gibi burada olculuyor.
   */
  it("bir projenin ekran goruntuleri tekil", () => {
    for (const project of projects) {
      const sources = project.screenshots.map(({ src }) => src);
      expect(new Set(sources).size, project.slug).toBe(sources.length);
    }
  });

  /**
   * SAYI DEGIL SOZLESME (nav testiyle ayni gerekce). Burada `toHaveLength(3)`
   * yaziliydi ve ekip degisince davranis bozulmadigi halde duserdi.
   *
   * Olculen sey: ekip bos degil; slug'lar TEKIL, cunku React key'i ve
   * aria-describedby id'si slug'dan turuyor (Team.tsx, TeamCard.tsx); `order`
   * 0'dan ARDISIK, yani bir kisi ciktiginda sirada bosluk kalmaz.
   */
  it("ekip kaydi bos degil, tekil ve ardisik", () => {
    expect(team.length).toBeGreaterThan(0);
    expect(new Set(team.map((member) => member.slug)).size).toBe(team.length);
    expect(team.map((member) => member.order)).toEqual(team.map((_, index) => index));
  });

  /**
   * Sema `photo`'nun "/" ile basladigini dogruluyor, dosyanin VAR OLDUGUNU
   * degil. Ayni aralik proje ekran goruntusu icin tests/images.test.ts'te
   * kapatilmisti; kisi fotografi onu yeniden aciyor.
   */
  it("her kisinin fotografi public/ altinda gercekten duruyor", () => {
    for (const member of team) {
      const file = join(process.cwd(), "public", member.photo);
      expect(existsSync(file), member.slug + ": " + member.photo + " bulunamadi").toBe(true);
    }
  });
});
