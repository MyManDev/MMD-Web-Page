import { SitePage } from "@/components/SitePage";
import { Team } from "@/components/sections/team";
import { team, site } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/team",
  "Team",
  "Meet the MyManDev team working across software development, applied AI, optimisation and modelling.",
);

export default function TeamPage() {
  const section = site.nav.find((item) => item.id === "team");
  if (!section) throw new Error("Team navigation is missing");
  return (
    <SitePage>
      <Team section={section} members={team} />
    </SitePage>
  );
}
