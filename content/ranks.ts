// Rank thresholds. Tune after playtests: aim for about 1 in 6 players reaching the top rank.
export interface Rank {
  /** Minimum words decoded to earn this rank. */
  min: number;
  name: string;
  dot: string;
}

export const RANKS: readonly Rank[] = [
  { min: 0, name: "Rookie", dot: "Everyone starts somewhere!" },
  { min: 3, name: "Decoder", dot: "Nice, you're getting the hang of it." },
  { min: 5, name: "Codebreaker", dot: "Sharp. Very sharp." },
  { min: 7, name: "Cipher Master", dot: "Okay, show-off." },
];

export function rankFor(words: number): Rank {
  let r = RANKS[0];
  for (const rank of RANKS) if (words >= rank.min) r = rank;
  return r;
}
