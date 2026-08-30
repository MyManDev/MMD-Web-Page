import type { Project, TeamMember } from "@/content/schema";

/**
 * Sema testleri icin fixture'lar. BURADA yasarlar, content/ altinda degil -
 * content/ yayinlanan icerigin kaydi ve orada gercek olmayan bir proje veya
 * kisi bulunamaz (CLAUDE.md kural 6).
 */
export const validProject: Project = {
  slug: "football-squad-optimizer",
  name: "Football Squad Optimizer",
  summary: "Squad selection under real constraints.",
  description: "A fixture paragraph, long enough to stand in for a real description.",
  tags: ["Python", "OR-Tools CP-SAT", "ML", "React"],
  repoUrl: "https://github.com/MyManDev/football-squad-optimizer",
  liveUrl: "https://squadopt.mymandev.com/",
  screenshot: "/projects/football-squad-optimizer-1792.webp",
  order: 0,
};

export const validTeamMember: TeamMember = {
  slug: "test-member",
  name: "Test Member",
  role: "Test Role",
  bio: "Fixture only.",
  githubUrl: "https://github.com/MyManDev",
  linkedinUrl: "https://www.linkedin.com/in/fixture",
  photo: "/people/test-member-1000.webp",
  order: 0,
};
