import { describe, expect, it } from "vitest";
import { WORDS_4, WORDS_5 } from "@/content/words";
import { RANKS, rankFor } from "@/content/ranks";
import { LESSONS } from "@/content/lessons";
import { caesar } from "@/lib/ciphers";
import { isBlocked, isRisky } from "./blocklist";

const lists = { WORDS_4, WORDS_5 } as const;

describe("word lists", () => {
  it("are big enough", () => {
    expect(WORDS_4.length).toBeGreaterThanOrEqual(150);
    expect(WORDS_5.length).toBeGreaterThanOrEqual(30);
  });
  it("have the right lengths and only A–Z", () => {
    for (const w of WORDS_4) expect(w).toMatch(/^[A-Z]{4}$/);
    for (const w of WORDS_5) expect(w).toMatch(/^[A-Z]{5}$/);
  });
  it("have no duplicates", () => {
    for (const [name, list] of Object.entries(lists)) expect(new Set(list).size, name).toBe(list.length);
  });
  it("have nothing one typo away from a rude word", () => {
    for (const [name, list] of Object.entries(lists)) for (const w of list) expect(isRisky(w), `${name}: ${w}`).toBeNull();
  });
  it("never show a rude word as Caesar output", () => {
    for (const w of [...WORDS_4, ...WORDS_5]) for (const s of [1, 2, 3]) {
      expect(isBlocked(caesar.encode(w, { shift: s }).display.join("")), `${w}+${s}`).toBe(false);
    }
  });
});

describe("ranks + lessons", () => {
  it("rank thresholds match the plan", () => {
    expect(rankFor(0).name).toBe("Rookie");
    expect(rankFor(2).name).toBe("Rookie");
    expect(rankFor(3).name).toBe("Decoder");
    expect(rankFor(4).name).toBe("Decoder");
    expect(rankFor(5).name).toBe("Codebreaker");
    expect(rankFor(6).name).toBe("Codebreaker");
    expect(rankFor(7).name).toBe("Cipher Master");
    expect(rankFor(99).name).toBe("Cipher Master");
  });
  it("ranks are sorted", () => {
    for (let i = 1; i < RANKS.length; i++) expect(RANKS[i].min).toBeGreaterThan(RANKS[i - 1].min);
  });
  it("lessons are short", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(3);
    for (const l of LESSONS) expect(l.length).toBeLessThanOrEqual(120);
  });
});
