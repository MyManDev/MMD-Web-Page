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

  it("projects ve team V1'de bos - gercek icerik Faz 3'te", () => {
    expect(projects).toEqual([]);
    expect(team).toEqual([]);
  });
});
