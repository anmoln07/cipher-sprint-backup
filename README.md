# Cipher Sprint

**Decode as many secret words as you can in 60 seconds.** A stall game for the Cipher club:
Caesar shift, Morse code, Numbers (A = 1) and Phone keypad (44 = H) puzzles, each with its own on-screen key.

Next.js 14 (App Router) + TypeScript + Tailwind 3.4. Everything runs in the browser: no backend, no API
routes, no accounts, no analytics, no runtime network requests. The only stored data is in `localStorage`
(best score this session, last 30 words played, "seen the intro" flag), all wrapped in try/catch.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
# or a production build:
npm run build && npm start
```

Useful URL params:

- `?seed=123` replays the same sequence of puzzles (for debugging).
- `?test=1` exposes `window.__answer`, `__kind`, `__phase`, `__score` for the e2e test. Off otherwise.

Controls: **Enter** = play / submit, **Esc** = back to title, **Tab** = skip (costs 3 s).
Typing the right word advances instantly; case, spaces and hyphens are ignored.

## Test

```bash
npm run typecheck    # tsc --noEmit
npm test             # vitest: cipher tables, normalise, content rules, 1,000-seed property test
npm run build && npm run e2e
```

`npm run e2e` (`e2e/run.mjs`) starts `next start` on port 3123 itself, plays a full 60 s run at
1440×900 and at 390×844 (the phone run goes offline after first load), checks skip/wrong-guess/idle
reset/no sideways scroll/no runtime requests, saves screenshots to `docs/`, and stops the server.
It uses `require("playwright")` and `chromium.launch()`. Playwright is **not** a project dependency (the
build machine had it installed globally); on a fresh machine run
`npm i -D playwright && npx playwright install chromium` once first.
A run takes about 3.5 minutes because it plays real 60-second games and waits out the 30 s idle reset.

## Deploy (Vercel)

1. Push this folder to its own GitHub repo, `anmoln07/cipher-sprint`.
2. In Vercel: **Add New → Project**, import the repo. Framework preset is detected as Next.js; no env vars,
   no build settings to change. Project name: `cipher-sprint`.
3. Vercel → Project → **Settings → Domains** → add `cipher.cipherbu.tech`.
4. At the DNS provider for `cipherbu.tech`, add:

   | Type  | Name     | Value                  |
   |-------|----------|------------------------|
   | CNAME | `cipher` | `cname.vercel-dns.com` |

   Wait for Vercel to show the domain as valid (HTTPS is issued automatically).
5. Every push to `main` redeploys. The QR on the title screen is generated from the page's own URL, so once
   people open it at `cipher.cipherbu.tech` the QR points there too. Print it from the stall laptop's title
   screen.

## Add or change words

All words live in `content/words.ts`:

| List           | Used by                      | Rule                |
|----------------|------------------------------|---------------------|
| `CLUB` / `EVERYDAY` (→ `WORDS_4`) | Caesar, Morse, Numbers, Keypad | exactly 4 letters |
| `WORDS_5`      | Caesar only (25% of Caesar puzzles, `CAESAR_FIVE_CHANCE`) | exactly 5 letters |

Uppercase A–Z only. Then run `npm test`: `tests/content.test.ts` fails if a word has the wrong length,
is duplicated, is one typo away from a rude word, or turns into a rude word under a Caesar shift of 1–3
(the blocklist is in `tests/blocklist.ts`). That check is why a few obvious club words are missing
(see the comment at the top of `words.ts`). Keep words friendly and never use real people or brands.

## Ranks and lesson lines

- **Rank thresholds:** `content/ranks.ts` (`RANKS`, each with a `min` word count and Dot's line).
  Currently 0–2 Rookie, 3–4 Decoder, 5–6 Codebreaker, 7+ Cipher Master, as in the plan. After playtests,
  move the `min` values so about 1 in 6 players reaches Cipher Master. (If you change them, update the
  matching expectations in `tests/content.test.ts`.)
- **Lesson lines:** `content/lessons.ts`, one rotates per run. Sources for each fact are noted in the file.

## Layout

```
app/page.tsx, app/play/page.tsx   title (attract mode) and the run; both render components/Game.tsx
components/Game.tsx               phases: title → intro (first play) → 3-2-1 → playing → results
components/Keys/*                 Caesar / Morse / Numbers / Keypad keys
lib/ciphers/*                     pure encode/decode per cipher + registry
lib/generate.ts                   seeded puzzle generator (never 3 of a kind in a row, no repeats)
lib/rng.ts, lib/normalise.ts      mulberry32, seed parsing, forgiving answer matching
content/                          words, ranks, lessons
tests/, e2e/run.mjs, docs/*.png   unit/property tests, full-run browser test, screenshots
```

## Look (v3, backup repo)
Light redesign inspired by decimals.co: cream paper, soft Fraunces serif headlines, Instrument Sans body, JetBrains Mono for code, lime accent.
Title has a turning globe made of Morse dots and dashes, cipher pills, a live demo card and a WebGL "Play" button
(dithered lime shader, label that decodes itself, Morse ring, burst on press; falls back to CSS without WebGL, still under reduced motion).
Illustrations in `public/art/` are from [Kitbitz](https://kitbitz.art) (CC0).
