import { ALPHABET, type BinaryKeyData, type Encoded } from "./types";

export const PLACE_VALUES = [16, 8, 4, 2, 1];

export function toBits(letter: string): string {
  const i = ALPHABET.indexOf(letter);
  if (i < 0) throw new Error(`Not a letter: ${letter}`);
  return (i + 1).toString(2).padStart(5, "0");
}

export function encode(word: string): Encoded<BinaryKeyData> {
  const answer = word.toUpperCase();
  const display = answer.split("").map(toBits);
  const unique = Array.from(new Set(answer.split(""))).sort();
  return {
    display,
    answer,
    hint: "Each 5-bit group is one letter (A = 1)",
    keyData: {
      kind: "binary",
      placeValues: PLACE_VALUES,
      table: unique.map((letter) => ({ letter, bits: toBits(letter), value: ALPHABET.indexOf(letter) + 1 })),
    },
  };
}

export function decode(display: string[], keyData: BinaryKeyData): string {
  return display.map((bits) => keyData.table.find((e) => e.bits === bits)?.letter ?? "?").join("");
}
