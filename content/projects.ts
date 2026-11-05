import type { Project } from "./schema";

/** Guncel urun: SquadOpt README'si ve 5 Kasim 2026'da yayindaki GW10 ekranlari. */
export const projects: Project[] = [
  {
    slug: "football-squad-optimizer",
    name: "SquadOpt",
    summary: "Your next FPL gameweek.",
    description:
      "Transfers, captain picks and your next XI, alongside fixtures and the mini-league table. " +
      "Currently built for our league, with wider access on the way.",
    tags: ["Python", "React", "TypeScript", "HiGHS"],
    repoUrl: "https://github.com/MyManDev/football-squad-optimizer",
    liveUrl: "https://squadopt.mymandev.com/",
    screenshots: [
      {
        src: "/projects/squadopt-plan-1792.webp",
        alt: "SquadOpt's gameweek 10 member page with transfer suggestions and captain picks.",
        caption: "Transfers and captain picks.",
      },
      {
        src: "/projects/squadopt-fixtures-1792.webp",
        alt: "Upcoming fixtures for all twenty clubs across gameweeks 10 to 14.",
        caption: "The next five gameweeks.",
      },
      {
        src: "/projects/squadopt-league-1792.webp",
        alt: "The mini-league table with each manager's points and position.",
        caption: "The mini-league race.",
      },
    ],
    order: 0,
  },
];
