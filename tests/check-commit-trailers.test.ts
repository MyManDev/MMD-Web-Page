import { describe, expect, it } from "vitest";
import { findTrailers } from "../scripts/check-commit-trailers.mjs";

/**
 * Trailer kapisinin testi (working-agreement.md §3.2). Kapinin iki yonlu
 * hatasi da pahali: kacirirsa "claude" katkici listesine girer ve PR ref'i onu
 * sonsuza kadar tutar; yanlis alarm verirse kapi zorla gecilir ve oler.
 */
describe("findTrailers", () => {
  it("Claude Code'un varsayilan co-author satirini yakaliyor", () => {
    const message =
      "docs: hand off\n\nBody line.\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>";
    expect(findTrailers(message)).toEqual(["Co-authored-by satiri"]);
  });

  it("buyuk-kucuk harfe bakmiyor (GitHub squash'i kucuk yaziyor)", () => {
    expect(findTrailers("fix: x\n\nCo-authored-by: Someone <a@b.c>")).toEqual([
      "Co-authored-by satiri",
    ]);
  });

  it("arac imzasini ve oturum linkini yakaliyor", () => {
    const message =
      "feat: y\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n" +
      "Claude-Session: https://claude.ai/code/session_123";
    expect(findTrailers(message)).toEqual([
      "oturum linki (Claude-Session)",
      "oturum linki",
      "arac imzasi (Generated with Claude Code)",
    ]);
  });

  /**
   * Yanlis alarm yok: bu depodaki gercek mesajlar kuralin kendisini anlatiyor
   * (#23, #67). Duz yazidaki anma iki nokta ve deger tasimadigi icin trailer
   * degil.
   */
  it("kurali anlatan duz yaziyi trailer saymiyor", () => {
    const prose =
      "docs: forbid commit message trailers\n\n" +
      "No Co-Authored-By line, no tool signature, no session link.\n" +
      "Co-authored-by trailer. The contributors API returns two people.";
    expect(findTrailers(prose)).toEqual([]);
  });

  it("temiz bir mesajda bos liste donuyor", () => {
    expect(findTrailers("test: tidy stale comments\n\nBody.")).toEqual([]);
  });
});
