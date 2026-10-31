import { type Encoded, type KeypadKeyData } from "./types";

/** Old phone keypad (multi-tap): press a key N times for its Nth letter. 44 = H, 2 = A, 222 = C. */
export const KEYPAD: { digit: string; letters: string }[] = [
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
];

export function toTaps(letter: string): string {
  const k = KEYPAD.find((e) => e.letters.includes(letter));
  if (!k) throw new Error(`Not a letter: ${letter}`);
  return k.digit.repeat(k.letters.indexOf(letter) + 1);
}

export function encode(word: string): Encoded<KeypadKeyData> {
  const answer = word.toUpperCase();
  return {
    display: answer.split("").map(toTaps),
    answer,
    hint: "Old phone keypad: 44 = press 4 twice = H",
    keyData: { kind: "keypad", keys: KEYPAD },
  };
}

export function decode(display: string[], keyData: KeypadKeyData): string {
  return display
    .map((taps) => keyData.keys.find((k) => k.digit === taps[0])?.letters[taps.length - 1] ?? "?")
    .join("");
}
