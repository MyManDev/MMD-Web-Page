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

  it.each([
    ["screenshot eksik", { screenshot: undefined }],
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
    expect(site.nav).toHaveLength(4);
  });

  it("projects tek gercek kaydi tasiyor", () => {
    expect(projects).toHaveLength(1);
    expect(projects.at(0)?.slug).toBe("football-squad-optimizer");
  });

  /**
   * Sema `screenshot`'in "/" ile basladigini dogruluyor, dosyanin VAR OLDUGUNU
   * degil. Var olmayan bir yola isaret eden kayit build'i gecer ve sitede kirik
   * gorsel cikar - bu test o araligi kapatiyor.
   */
  it("her projenin ekran goruntusu public/ altinda gercekten duruyor", () => {
    for (const project of projects) {
      const file = join(process.cwd(), "public", project.screenshot);
      expect(existsSync(file), `${project.slug}: ${project.screenshot} bulunamadi`).toBe(true);
    }
  });

  it("team uc kisiyi tasiyor", () => {
    expect(team).toHaveLength(3);
    expect(team.map((member) => member.order)).toEqual([0, 1, 2]);
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
