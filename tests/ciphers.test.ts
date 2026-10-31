import { describe, expect, it } from "vitest";
import { caesar, decodeWithKey, keypad, morse, numbers } from "@/lib/ciphers";
import { normalise, matches } from "@/lib/normalise";
import { mulberry32, parseSeed } from "@/lib/rng";

describe("hand-checked encodings", () => {
  it("Morse", () => {
    expect(morse.encode("HACK").display.join(" ")).toBe(".... .- -.-. -.-");
    expect(morse.encode("SOS").display.join(" ")).toBe("... --- ...");
    expect(morse.encode("code").display.join(" ")).toBe("-.-. --- -.. .");
    expect(morse.encode("HACK").answer).toBe("HACK");
  });
  it("Numbers", () => {
    expect(numbers.encode("HACK").display.join(" ")).toBe("8 1 3 11");
    expect(numbers.encode("ZERO").display.join(" ")).toBe("26 5 18 15");
  });
  it("Phone keypad", () => {
    expect(keypad.encode("HACK").display.join(" ")).toBe("44 2 222 55");
    expect(keypad.encode("SWIZ").display.join(" ")).toBe("7777 9 444 9999");
    expect(keypad.encode("PING").display.join(" ")).toBe("7 444 66 4");
    expect(keypad.encode("HACK").keyData.keys.map((k) => k.digit).join("")).toBe("23456789");
  });
  it("Caesar", () => {
    expect(caesar.encode("HACK", { shift: 3 }).display.join("")).toBe("KDFN");
    expect(caesar.encode("HELLO", { shift: 3 }).display.join("")).toBe("KHOOR");
    expect(caesar.encode("ZOOM", { shift: 1 }).display.join("")).toBe("APPN");
    expect(caesar.encode("YAWN", { shift: 2 }).display.join("")).toBe("ACYP");
    expect(caesar.encode("HACK", { shift: 3 }).hint).toBe("Each letter was pushed forward by 3");
  });
  it("Caesar key: bottom row is the shifted alphabet", () => {
    const k = caesar.encode("HACK", { shift: 2 }).keyData;
    expect(k.top[0]).toBe("A");
    expect(k.bottom[0]).toBe("C");
    expect(k.bottom[25]).toBe("B");
  });
  it("decodeWithKey round-trips", () => {
    for (const enc of [morse.encode("WIFI"), numbers.encode("CHAI"), keypad.encode("BYTE"), caesar.encode("PIZZA", { shift: 2 })]) {
      expect(decodeWithKey(enc.display, enc.keyData)).toBe(enc.answer);
    }
  });
});

describe("normalise", () => {
  it("ignores case, spaces and hyphens", () => {
    expect(normalise("hack")).toBe("HACK");
    expect(normalise(" h a c k ")).toBe("HACK");
    expect(normalise("ha-ck")).toBe("HACK");
    expect(normalise("Ha - Ck.")).toBe("HACK");
    expect(normalise("")).toBe("");
  });
  it("matches", () => {
    expect(matches("w-i f i", "WIFI")).toBe(true);
    expect(matches("wifo", "WIFI")).toBe(false);
  });
});

describe("rng", () => {
  it("is deterministic per seed", () => {
    const a = mulberry32(123), b = mulberry32(123);
    for (let i = 0; i < 10; i++) expect(a()).toBe(b());
  });
  it("stays in [0,1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 10000; i++) { const x = r(); expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(1); }
  });
  it("parses ?seed", () => {
    expect(parseSeed("123")).toBe(123);
    expect(parseSeed("abc")).toBeUndefined();
    expect(parseSeed(null)).toBeUndefined();
    expect(parseSeed("")).toBeUndefined();
  });
});
