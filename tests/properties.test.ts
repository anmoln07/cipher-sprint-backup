import { describe, expect, it } from "vitest";
import { decodeWithKey, type Encoded } from "@/lib/ciphers";
import { pickKind, PuzzleGenerator } from "@/lib/generate";
import { mulberry32 } from "@/lib/rng";

/** Every symbol drawn in the puzzle must be findable in the on-screen key. */
function keyCoversDisplay(p: Encoded): boolean {
  const k = p.keyData;
  switch (k.kind) {
    case "caesar": return p.display.every((c) => k.bottom.includes(c));
    case "morse": return p.display.every((c) => k.chart.some((e) => e.code === c));
    case "numbers": return p.display.every((n) => k.strip.some((e) => String(e.value) === n));
    case "keypad": return p.display.every((t) => k.keys.some((e) => e.digit === t[0] && t.length <= e.letters.length && /^(\d)\1*$/.test(t)));
  }
}

const SEEDS = 1000;
// 60 s with -3 s per skip means at most ~20 skips + ~15 solves; 40 is a generous ceiling per run.
const PUZZLES_PER_RUN = 40;

describe("generated runs (1,000 seeds)", () => {
  it("every puzzle decodes back to its answer, key covers every symbol, no repeats, no 3-in-a-row", () => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const gen = new PuzzleGenerator({ seed });
      const seen = new Set<string>();
      const kinds: string[] = [];
      for (let i = 0; i < PUZZLES_PER_RUN; i++) {
        const p = gen.next();
        expect(decodeWithKey(p.display, p.keyData), `seed ${seed} #${i}`).toBe(p.answer);
        expect(keyCoversDisplay(p), `seed ${seed} key`).toBe(true);
        expect(seen.has(p.answer), `seed ${seed} repeat ${p.answer}`).toBe(false);
        seen.add(p.answer);
        kinds.push(p.kind);
        const n = kinds.length;
        if (n >= 3) expect(kinds[n - 1] === kinds[n - 2] && kinds[n - 2] === kinds[n - 3], `seed ${seed} 3x ${p.kind}`).toBe(false);
        // Word-length rules per kind.
        if (p.kind === "caesar") expect([4, 5]).toContain(p.answer.length);
        else expect(p.answer.length).toBe(4);
        if (p.kind === "caesar" && p.keyData.kind === "caesar") expect([1, 2, 3]).toContain(p.keyData.shift);
      }
    }
  });

  it("same seed reproduces the same run", () => {
    const a = new PuzzleGenerator({ seed: 123 }), b = new PuzzleGenerator({ seed: 123 });
    for (let i = 0; i < 30; i++) {
      const pa = a.next(), pb = b.next();
      expect(pa.answer).toBe(pb.answer);
      expect(pa.display).toEqual(pb.display);
    }
  });

  it("avoids words recently played on this device while it can", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const first = new PuzzleGenerator({ seed });
      const recent = Array.from({ length: 30 }, () => first.next().answer);
      const second = new PuzzleGenerator({ seed: seed + 99999, avoid: recent });
      for (let i = 0; i < 15; i++) expect(recent).not.toContain(second.next().answer);
    }
  });

  it("all four kinds show up", () => {
    const gen = new PuzzleGenerator({ seed: 42 });
    const kinds = new Set(Array.from({ length: 40 }, () => gen.next().kind));
    expect(kinds.size).toBe(4);
  });

  it("never crashes when pools run dry", () => {
    const gen = new PuzzleGenerator({ seed: 5, pools: { four: ["CODE", "HACK"], five: ["PIZZA"] } });
    for (let i = 0; i < 50; i++) {
      const p = gen.next();
      expect(decodeWithKey(p.display, p.keyData)).toBe(p.answer);
    }
  });

  it("pickKind never allows a third repeat", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 5000; i++) expect(pickKind(rng, ["morse", "morse"])).not.toBe("morse");
  });
});
