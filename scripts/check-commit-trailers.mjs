/**
 * Commit mesajlarinda TRAILER ARAR - working-agreement.md §3.2 kapisi.
 *
 * Neden bir kapi: `Co-Authored-By: ... <noreply@anthropic.com>` satiri
 * GitHub'da "claude" hesabini co-author yapiyor ve deponun katkici listesine
 * gercek olmayan bir isim sokuyor. main'e hic girmese bile PR'in kendi ref'i
 * (refs/pull/N/head) commit'i sonsuza kadar tutuyor ve o ref'i kullanici
 * silemiyor; Agustos'ta boyle olan sekiz commit bugun hala orada (#67).
 * Yani yakalamanin tek anlamli yeri PR ACILMADAN ONCE: `pnpm gates` bu yuzden
 * bununla basliyor.
 *
 * Birinci savunma `.claude/settings.json` (`attribution` bos); bu dosya onun
 * kacirdigini yakaliyor.
 *
 * Aralik `origin/main`'den bu yana. `origin/main` yoksa (derinligi 1 olan bir
 * CI kopyasi gibi) kontrol atlanir ve bu acikca yazilir - sessizce gecilmez.
 *
 * Yeni bagimlilik YOK (CLAUDE.md kural 4): yalnizca git.
 */
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/*
  Satir basinda aranan trailer'lar ve govdenin herhangi bir yerindeki imzalar.
  Duz yazidaki bir anma ("Co-authored-by satiri yazilmaz") eslesmiyor: trailer
  iki nokta ve bir deger ister.
*/
const PATTERNS = [
  { pattern: /^co-authored-by:\s*\S/im, reason: "Co-authored-by satiri" },
  { pattern: /^claude-session:\s*\S/im, reason: "oturum linki (Claude-Session)" },
  { pattern: /claude\.ai\/code\/session/i, reason: "oturum linki" },
  { pattern: /generated with \[?claude code/i, reason: "arac imzasi (Generated with Claude Code)" },
];

/** Bir commit mesajindaki yasak satirlarin nedenleri. Temizse bos liste. */
export function findTrailers(message) {
  return PATTERNS.filter(({ pattern }) => pattern.test(message)).map(({ reason }) => reason);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });

function main() {
  try {
    git("rev-parse", "--verify", "--quiet", "origin/main");
  } catch {
    console.log("trailer kapisi: origin/main yok, kontrol ATLANDI.");
    return;
  }

  const base = git("merge-base", "HEAD", "origin/main").trim();
  // Kayit ayirici: commit'ler \x1e, SHA ile govde \x1f ile ayriliyor.
  const log = git("log", "--format=%H%x1f%s%x1f%B%x1e", `${base}..HEAD`);
  const offenders = log
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha, subject, body] = record.split("\x1f");
      return { sha: sha.slice(0, 7), subject, reasons: findTrailers(body) };
    })
    .filter(({ reasons }) => reasons.length > 0);

  if (offenders.length === 0) {
    console.log("trailer kapisi: origin/main'den bu yana commit'lerde trailer yok.");
    return;
  }

  console.error("trailer kapisi DUSTU (working-agreement.md §3.2):");
  for (const { sha, subject, reasons } of offenders) {
    console.error(`  ${sha} ${subject} -> ${reasons.join(", ")}`);
  }
  console.error("Commit mesajini duzelt (git commit --amend / rebase) ve PR'i ondan sonra ac.");
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
