/**
 * Tek loader. Component'ler content/ dosyalarini DOGRUDAN OKUMAZ, yalnizca
 * buradan erisir. `lint-imports`'un bu projedeki tek karsiligi bu sinir.
 * docs/architecture.md §5, docs/working-agreement.md §4
 *
 * Dogrulama modul yuklenirken kosar: sema tutmuyorsa `pnpm build` patlar.
 */
import { projectSchema, siteSchema, teamMemberSchema } from "./schema";
import { projects as rawProjects } from "./projects";
import { site as rawSite } from "./site";
import { team as rawTeam } from "./team";

export type { Project, Site, TeamMember } from "./schema";

export const site = siteSchema.parse(rawSite);

export const projects = projectSchema
  .array()
  .parse(rawProjects)
  .sort((a, b) => a.order - b.order);

export const team = teamMemberSchema
  .array()
  .parse(rawTeam)
  .sort((a, b) => a.order - b.order);
