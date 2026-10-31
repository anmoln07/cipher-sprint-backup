import { encodeKind, KINDS, type CipherKind, type Encoded } from "./ciphers";
import { mulberry32, pick, randInt, type Rng } from "./rng";
import { BINARY_WORDS, CAESAR_FIVE_CHANCE, WORDS_4, WORDS_5 } from "@/content/words";

export interface Puzzle extends Encoded {
  id: number;
  kind: CipherKind;
}

export interface GeneratorOptions {
  seed: number;
  /** Words played recently on this device; avoided while possible. */
  avoid?: readonly string[];
  /** Override pools (tests). */
  pools?: Partial<WordPools>;
}

export interface WordPools {
  four: readonly string[];
  five: readonly string[];
  binary: readonly string[];
}

const DEFAULT_POOLS: WordPools = { four: WORDS_4, five: WORDS_5, binary: BINARY_WORDS };

/** Pick a kind at random, but never the same kind three times in a row. */
export function pickKind(rng: Rng, history: readonly CipherKind[]): CipherKind {
  const n = history.length;
  const blocked = n >= 2 && history[n - 1] === history[n - 2] ? history[n - 1] : null;
  const options = KINDS.filter((k) => k !== blocked);
  return pick(rng, options);
}

export class PuzzleGenerator {
  private rng: Rng;
  private kinds: CipherKind[] = [];
  private used = new Set<string>();
  private avoid: Set<string>;
  private pools: WordPools;
  private nextId = 1;

  constructor(opts: GeneratorOptions) {
    this.rng = mulberry32(opts.seed);
    this.avoid = new Set(opts.avoid ?? []);
    this.pools = { ...DEFAULT_POOLS, ...opts.pools };
  }

  get history(): readonly CipherKind[] {
    return this.kinds;
  }

  /** Words already used this run. */
  get usedWords(): ReadonlySet<string> {
    return this.used;
  }

  private chooseWord(pool: readonly string[]): string | null {
    const fresh = pool.filter((w) => !this.used.has(w) && !this.avoid.has(w));
    if (fresh.length) return pick(this.rng, fresh);
    // Device history is only a preference: fall back to anything not used this run.
    const unusedThisRun = pool.filter((w) => !this.used.has(w));
    if (unusedThisRun.length) return pick(this.rng, unusedThisRun);
    return null;
  }

  private wordFor(kind: CipherKind): string | null {
    if (kind === "binary") return this.chooseWord(this.pools.binary);
    if (kind === "caesar" && this.rng() < CAESAR_FIVE_CHANCE) {
      const w = this.chooseWord(this.pools.five);
      if (w) return w;
    }
    return this.chooseWord(this.pools.four) ?? (kind === "caesar" ? this.chooseWord(this.pools.five) : null);
  }

  next(): Puzzle {
    let kind = pickKind(this.rng, this.kinds);
    let word = this.wordFor(kind);
    if (!word) {
      // This pool is exhausted (only possible in very long test runs). Try the other kinds.
      for (const k of KINDS) {
        if (k === kind) continue;
        const n = this.kinds.length;
        if (n >= 2 && this.kinds[n - 1] === k && this.kinds[n - 2] === k) continue;
        word = this.wordFor(k);
        if (word) { kind = k; break; }
      }
    }
    if (!word) {
      // Everything used: start a fresh cycle rather than crash.
      this.used.clear();
      return this.next();
    }
    this.used.add(word);
    this.kinds.push(kind);
    const shift = kind === "caesar" ? randInt(this.rng, 1, 3) : undefined;
    const enc = encodeKind(kind, word, { shift });
    return { ...enc, id: this.nextId++, kind };
  }
}

// ---- device history (localStorage, best effort) ----
const RECENT_KEY = "cipher-sprint:recent";
const BEST_KEY = "cipher-sprint:best";
const SEEN_INTRO_KEY = "cipher-sprint:seen-intro";
export const RECENT_LIMIT = 30;

function safeGet(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* private mode etc. */ }
}

export function loadRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(safeGet(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((w): w is string => typeof w === "string").slice(-RECENT_LIMIT) : [];
  } catch { return []; }
}

export function pushRecent(words: readonly string[]) {
  const merged = [...loadRecent().filter((w) => !words.includes(w)), ...words].slice(-RECENT_LIMIT);
  safeSet(RECENT_KEY, JSON.stringify(merged));
}

export function loadBest(): number {
  const n = Number(safeGet(BEST_KEY));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}
export function saveBest(n: number) { safeSet(BEST_KEY, String(n)); }

export function hasSeenIntro(): boolean { return safeGet(SEEN_INTRO_KEY) === "1"; }
export function markIntroSeen() { safeSet(SEEN_INTRO_KEY, "1"); }
