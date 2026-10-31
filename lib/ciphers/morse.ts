import { type Encoded, type MorseKeyData } from "./types";

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
};

export const MORSE_CHART = Object.entries(MORSE).map(([letter, code]) => ({ letter, code }));

export function encode(word: string): Encoded<MorseKeyData> {
  const answer = word.toUpperCase();
  const display = answer.split("").map((c) => {
    const code = MORSE[c];
    if (!code) throw new Error(`No Morse for ${c}`);
    return code;
  });
  return {
    display,
    answer,
    hint: "Dots and dashes. Find each pattern in the chart",
    keyData: { kind: "morse", chart: MORSE_CHART },
  };
}

export function decode(display: string[], keyData: MorseKeyData): string {
  return display.map((code) => keyData.chart.find((e) => e.code === code)?.letter ?? "?").join("");
}
