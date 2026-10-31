export type CipherKind = "caesar" | "morse" | "numbers" | "keypad";

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface CaesarKeyData {
  kind: "caesar";
  shift: number;
  /** Plain alphabet A..Z */
  top: string[];
  /** Same alphabet pushed forward by `shift` (under A sits the letter A becomes). */
  bottom: string[];
}
export interface MorseKeyData {
  kind: "morse";
  chart: { letter: string; code: string }[];
}
export interface NumbersKeyData {
  kind: "numbers";
  strip: { letter: string; value: number }[];
}
export interface KeypadKeyData {
  kind: "keypad";
  /** Phone keys 2–9 with their letters, in order. */
  keys: { digit: string; letters: string }[];
}
export type KeyData = CaesarKeyData | MorseKeyData | NumbersKeyData | KeypadKeyData;

export interface Encoded<K extends KeyData = KeyData> {
  /** Tokens shown big on screen (one per letter, or one string for Caesar letters). */
  display: string[];
  /** The plain word the player must type, uppercase. */
  answer: string;
  /** Short instruction shown with the puzzle. */
  hint: string;
  keyData: K;
}
