import { ALPHABET, type CaesarKeyData, type Encoded } from "./types";

export const CAESAR_SHIFTS = [1, 2, 3] as const;

export function shiftLetter(letter: string, shift: number): string {
  const i = ALPHABET.indexOf(letter);
  if (i < 0) throw new Error(`Not a letter: ${letter}`);
  return ALPHABET[(((i + shift) % 26) + 26) % 26];
}

export function encode(word: string, opts: { shift: number }): Encoded<CaesarKeyData> {
  const answer = word.toUpperCase();
  const { shift } = opts;
  if (!Number.isInteger(shift) || shift < 1 || shift > 25) throw new Error(`Bad shift ${shift}`);
  const display = answer.split("").map((c) => shiftLetter(c, shift));
  return {
    display,
    answer,
    hint: `Each letter was pushed forward by ${shift}`,
    keyData: { kind: "caesar", shift, top: [...ALPHABET], bottom: ALPHABET.map((c) => shiftLetter(c, shift)) },
  };
}

export function decode(display: string[], keyData: CaesarKeyData): string {
  return display.map((c) => keyData.top[keyData.bottom.indexOf(c)]).join("");
}
