// Test-only content filter. Never imported by the app, never shipped in the bundle.
// A word list entry fails if it equals, or is ONE letter away from, any of these,
// so a single typo (or a Caesar output) can never put one of them on a stall screen.
export const BLOCK_3 = ["ASS", "TIT", "CUM", "FAG", "POO", "GAY", "SEX", "WTF", "FML", "NAZ"];
export const BLOCK_4 = [
  "SHIT", "FUCK", "CUNT", "DICK", "COCK", "PISS", "CRAP", "SLUT", "TWAT", "WANK", "TITS", "PORN",
  "ARSE", "BOOB", "DAMN", "HELL", "POOP", "FART", "JERK", "HOMO", "PUBE", "SPAZ", "DYKE", "NAZI",
  "KILL", "DEAD", "GUNS", "BOMB", "NUDE", "SEXY", "HUMP", "THOT", "MILF", "FFS", "SUCK", "BUTT",
];
export const BLOCK_5 = [
  "BITCH", "WHORE", "PUSSY", "DILDO", "PENIS", "BOOBS", "SLUTS", "TWATS", "DICKS", "COCKS", "SHITS",
  "FUCKS", "CUNTS", "PRICK", "BALLS", "HORNY", "NUDES", "SEXES", "DRUGS", "BOOZE", "WEEDS", "IDIOT", "MORON",
];

export function hamming1OrEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d <= 1;
}

export function isRisky(word: string): string | null {
  const all = [...BLOCK_3, ...BLOCK_4, ...BLOCK_5];
  for (const bad of all) if (hamming1OrEqual(word, bad)) return bad;
  return null;
}

/** Plain-equality check for things players never type (e.g. Caesar output on screen). */
export function isBlocked(word: string): boolean {
  return [...BLOCK_3, ...BLOCK_4, ...BLOCK_5].includes(word);
}
