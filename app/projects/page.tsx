import { SitePage } from "@/components/SitePage";
import { Projects } from "@/components/sections/projects";
import { projects, site } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/projects",
  "Projects",
  "Projects by MyManDev: software, applied AI and optimisation, including SquadOpt for Fantasy Premier League.",
);

export default function ProjectsPage() {
  const section = site.nav.find((item) => item.id === "projects");
  if (!section) throw new Error("Projects navigation is missing");
  return (
    <SitePage>
      <Projects section={section} projects={projects} />
    </SitePage>
  );
}
