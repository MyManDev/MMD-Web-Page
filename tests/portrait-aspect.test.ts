import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import kinds from "../lib/image-widths.json" with { type: "json" };

/**
 * Portre orani IKI yerde yaziyor ve ikisi ayni sayiyi soylemek zorunda:
 *
 *   - `app/tokens.css`        -> kartin CSS kutusu (`--aspect-portrait`)
 *   - `lib/image-widths.json` -> hattin urettigi dosyanin orani
 *
 * Ayrildiklarinda hicbir sey patlamiyor: `object-fit: cover` farki sessizce
 * kirpiyor ve `<img>`'in `width`/`height` nitelikleri kutuyu yanlis tarif
 * ediyor. Gozle bakinca gorunmez, o yuzden olculuyor.
 *
 * Bu tek kayit kuralinin (CLAUDE.md) test edilebilir hali: ayni olgu iki yerde
 * yasiyorsa, en azindan ayrildiklarinda haber versin.
 */
describe("portre orani", () => {
  const tokens = readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8");

  it("token ile gorsel hatti ayni orani soyluyor", () => {
    const match = /--aspect-portrait:\s*(\d+)\s*\/\s*(\d+)\s*;/.exec(tokens);
    expect(match, "--aspect-portrait token'i bulunamadi").not.toBeNull();

    const fromToken = [Number(match![1]), Number(match![2])];
    expect(fromToken).toEqual(kinds.portrait.aspect);
  });

  /**
   * Hattin kendi kapisi: genislik orana tam bolunmezse yarim piksel olur ve
   * `optimize-images.mjs` atiyor. Burada da tutuluyor cunku hata ancak gorseller
   * YENIDEN URETILDIGINDE cikar - oran degistirip hatti kosturmayan biri
   * bunu CI'da degil aylar sonra gorurdu.
   */
  it("her genislik orana tam boluniyor", () => {
    for (const [kind, spec] of Object.entries(kinds)) {
      // Dizi cozumlemesi `noUncheckedIndexedAccess` altinda `undefined` veriyor.
      // Susturmak yerine olcuyu once dogruluyorum: bozuk bir JSON burada dussun,
      // asagida sessizce NaN uretmesin.
      expect(spec.aspect, `${kind} orani iki sayi olmali`).toHaveLength(2);
      const [aspectW, aspectH] = spec.aspect as [number, number];

      for (const width of spec.widths) {
        expect((width * aspectH) % aspectW, `${kind} ${width}px yarim piksel uretiyor`).toBe(0);
      }
    }
  });
});
