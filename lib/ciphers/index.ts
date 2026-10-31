import * as caesar from "./caesar";
import * as morse from "./morse";
import * as numbers from "./numbers";
import * as keypad from "./keypad";
import type { CipherKind, Encoded, KeyData } from "./types";

export * from "./types";
export { caesar, morse, numbers, keypad };

export const KINDS: readonly CipherKind[] = ["caesar", "morse", "numbers", "keypad"];

export const KIND_LABEL: Record<CipherKind, string> = {
  caesar: "Caesar shift",
  morse: "Morse code",
  numbers: "Numbers",
  keypad: "Phone keypad",
};

/** Decode a puzzle using only what is shown on screen (display + key). Used by tests. */
export function decodeWithKey(display: string[], keyData: KeyData): string {
  switch (keyData.kind) {
    case "caesar": return caesar.decode(display, keyData);
    case "morse": return morse.decode(display, keyData);
    case "numbers": return numbers.decode(display, keyData);
    case "keypad": return keypad.decode(display, keyData);
  }
}

export function encodeKind(kind: CipherKind, word: string, opts: { shift?: number } = {}): Encoded {
  switch (kind) {
    case "caesar": return caesar.encode(word, { shift: opts.shift ?? 3 });
    case "morse": return morse.encode(word);
    case "numbers": return numbers.encode(word);
    case "keypad": return keypad.encode(word);
  }
}
