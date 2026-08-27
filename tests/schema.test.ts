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

  it("bolum numarasi iki haneli olmali", () => {
    expect(() =>
      siteSchema.parse({ ...site, nav: [{ id: "hero", number: "1", label: "Hero" }] }),
    ).toThrow();
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

  it("team hala bos - biyografiler yazilmadi (#16)", () => {
    expect(team).toEqual([]);
  });
});
