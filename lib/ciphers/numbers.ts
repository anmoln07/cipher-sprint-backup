import { ALPHABET, type Encoded, type NumbersKeyData } from "./types";

export const NUMBER_STRIP = ALPHABET.map((letter, i) => ({ letter, value: i + 1 }));

export function encode(word: string): Encoded<NumbersKeyData> {
  const answer = word.toUpperCase();
  const display = answer.split("").map((c) => {
    const i = ALPHABET.indexOf(c);
    if (i < 0) throw new Error(`Not a letter: ${c}`);
    return String(i + 1);
  });
  return { display, answer, hint: "A = 1, B = 2, C = 3…", keyData: { kind: "numbers", strip: NUMBER_STRIP } };
}

export function decode(display: string[], keyData: NumbersKeyData): string {
  return display.map((n) => keyData.strip.find((e) => e.value === Number(n))?.letter ?? "?").join("");
}
