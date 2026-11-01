"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { caesar, KIND_LABEL } from "@/lib/ciphers";
import { normalise } from "@/lib/normalise";
import { parseSeed, randomSeed } from "@/lib/rng";
import {
  hasSeenIntro, loadBest, loadRecent, markIntroSeen, pushRecent, PuzzleGenerator, saveBest, type Puzzle,
} from "@/lib/generate";
import { rankFor } from "@/content/ranks";
import { LESSONS } from "@/content/lessons";
import Counter from "./Counter";
import Dot from "./Dot";
import Flame from "./Flame";
import PuzzleKey from "./Keys";
import PlayButton from "./PlayButton";
import TitleScreen from "./Title";
import { Tile, type TileState } from "./SplitFlap";
import { TimerBar, TimerNumber } from "./Timer";
import { Token } from "./Tokens";

type Phase = "title" | "intro" | "countdown" | "playing" | "results";

export const RUN_MS = 60_000;
const SKIP_MS = 3_000;
const IDLE_MS = 30_000;
const ADVANCE_MS = 420;
const INTRO_MS = 5_000;
const COUNT_STEP_MS = 800;

const SAMPLE: Puzzle = { ...caesar.encode("HACK", { shift: 3 }), id: 0, kind: "caesar" };

interface Result { score: number; skips: number; best: number; newBest: boolean; lesson: string }

declare global {
  interface Window { __answer?: string; __kind?: string; __phase?: string; __score?: number }
}

const micro = "text-[13px] text-ink-soft";

/** Keep CSS vars in sync with the visual viewport so the play screen sits above the phone keyboard. */
function useVisualViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    const update = () => {
      const h = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      root.style.setProperty("--vvh", `${Math.round(h)}px`);
      root.style.setProperty("--vvt", `${Math.round(top)}px`);
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

export default function Game({ initial }: { initial: "title" | "play" }) {
  useVisualViewportVars();

  const [phase, setPhase] = useState<Phase>("title");
  const [count, setCount] = useState(3);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [remaining, setRemaining] = useState(RUN_MS);
  const [flashKey, setFlashKey] = useState(0);
  const [skipKey, setSkipKey] = useState(0);
  const [focused, setFocused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [idleLeft, setIdleLeft] = useState(IDLE_MS);
  const [best, setBest] = useState(0);

  const phaseRef = useRef<Phase>("title");
  const inputRef = useRef<HTMLInputElement>(null);
  const genRef = useRef<PuzzleGenerator | null>(null);
  const puzzleRef = useRef<Puzzle | null>(null);
  const endAtRef = useRef(0);
  const lockRef = useRef(false);
  const scoreRef = useRef(0);
  const skipsRef = useRef(0);
  const advanceTimer = useRef<number | undefined>(undefined);
  const timers = useRef<number[]>([]);
  const runIndex = useRef(0);
  const lessonOffset = useRef(0);
  const params = useRef<{ seed?: number; test: boolean }>({ test: false });

  const go = useCallback((p: Phase) => { phaseRef.current = p; setPhase(p); }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    window.clearTimeout(advanceTimer.current);
  }, []);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);

  const focusInput = useCallback(() => { inputRef.current?.focus({ preventScroll: true }); }, []);

  const showPuzzle = useCallback((p: Puzzle) => {
    puzzleRef.current = p;
    setPuzzle(p);
    setValue("");
    setStatus("idle");
    lockRef.current = false;
  }, []);

  // ---------- run lifecycle ----------
  const beginCountdown = useCallback(() => {
    clearTimers();
    const seedBase = params.current.seed;
    const seed = seedBase !== undefined ? (seedBase + runIndex.current) >>> 0 : randomSeed();
    runIndex.current += 1;
    genRef.current = new PuzzleGenerator({ seed, avoid: loadRecent() });
    showPuzzle(genRef.current.next());
    scoreRef.current = 0; skipsRef.current = 0;
    setScore(0); setStreak(0); setRemaining(RUN_MS); setResult(null);
    setCount(3);
    go("countdown");
    later(() => setCount(2), COUNT_STEP_MS);
    later(() => setCount(1), COUNT_STEP_MS * 2);
    later(() => setCount(0), COUNT_STEP_MS * 3);
    later(() => {
      endAtRef.current = performance.now() + RUN_MS;
      go("playing");
      focusInput();
    }, COUNT_STEP_MS * 3 + 350);
  }, [clearTimers, focusInput, go, later, showPuzzle]);

  const startRun = useCallback((fromGesture: boolean) => {
    const p = phaseRef.current;
    if (p === "countdown" || p === "playing") return;
    if (!hasSeenIntro()) {
      clearTimers();
      go("intro");
      inputRef.current?.blur();
      later(() => { if (phaseRef.current === "intro") { markIntroSeen(); beginCountdown(); } }, INTRO_MS);
      return;
    }
    // Focusing inside the tap keeps the phone keyboard open for the whole run (iOS needs a gesture).
    if (fromGesture) focusInput();
    beginCountdown();
  }, [beginCountdown, clearTimers, focusInput, go, later]);

  const dismissIntro = useCallback(() => {
    if (phaseRef.current !== "intro") return;
    markIntroSeen();
    focusInput();
    beginCountdown();
  }, [beginCountdown, focusInput]);

  const goTitle = useCallback(() => {
    clearTimers();
    lockRef.current = false;
    inputRef.current?.blur();
    go("title");
    try { if (window.location.pathname !== "/") window.history.replaceState(null, "", "/" + window.location.search); } catch { /* ignore */ }
  }, [clearTimers, go]);

  const finishRun = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    clearTimers();
    lockRef.current = true;
    inputRef.current?.blur();
    const s = scoreRef.current;
    const prev = loadBest();
    const newBest = s > prev && s > 0;
    if (newBest) saveBest(s);
    if (genRef.current) pushRecent(Array.from(genRef.current.usedWords));
    const lesson = LESSONS[(lessonOffset.current + runIndex.current) % LESSONS.length];
    setResult({ score: s, skips: skipsRef.current, best: Math.max(prev, s), newBest, lesson });
    setRemaining(0);
    go("results");
  }, [clearTimers, go]);

  const nextPuzzle = useCallback(() => {
    if (!genRef.current) return;
    showPuzzle(genRef.current.next());
  }, [showPuzzle]);

  const correct = useCallback(() => {
    lockRef.current = true;
    setStatus("correct");
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setStreak((s) => s + 1);
    setFlashKey((k) => k + 1);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      if (phaseRef.current === "playing") { nextPuzzle(); focusInput(); }
    }, ADVANCE_MS);
  }, [focusInput, nextPuzzle]);

  const wrong = useCallback(() => {
    setStatus("wrong");
    setShakeKey((k) => k + 1);
  }, []);

  const skip = useCallback(() => {
    if (phaseRef.current !== "playing" || lockRef.current) return;
    endAtRef.current -= SKIP_MS;
    skipsRef.current += 1;
    setStreak(0);
    setSkipKey((k) => k + 1);
    nextPuzzle();
    focusInput();
  }, [focusInput, nextPuzzle]);

  // ---------- input ----------
  const onChange = (raw: string) => {
    const p = puzzleRef.current;
    if (phaseRef.current !== "playing" || !p || lockRef.current) return;
    const n = normalise(raw);
    if (n.length > p.answer.length) return;
    setValue(n);
    if (n === p.answer) correct();
    else if (n.length === p.answer.length) wrong();
    else setStatus("idle");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") { e.preventDefault(); skip(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const p = puzzleRef.current;
      if (phaseRef.current !== "playing" || !p || lockRef.current) return;
      if (normalise(value) === p.answer) correct();
      else if (value.length > 0) wrong();
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    params.current = { seed: parseSeed(sp.get("seed")), test: sp.get("test") === "1" };
    lessonOffset.current = params.current.seed !== undefined ? 0 : Math.floor(Math.random() * LESSONS.length);
    setBest(loadBest());
    if (initial === "play") startRun(false);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (phase === "title" || phase === "results") setBest(loadBest()); }, [phase]);

  // timer loop
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let lastTenth = -1;
    const tick = () => {
      const rem = endAtRef.current - performance.now();
      if (rem <= 0) { finishRun(); return; }
      const tenth = Math.floor(rem / 100);
      if (tenth !== lastTenth) { lastTenth = tenth; setRemaining(rem); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, finishRun]);

  // global keys: Enter = play / play again, Esc = back to title
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current;
      if (e.key === "Escape" && p !== "title") { e.preventDefault(); goTitle(); return; }
      if (e.key === "Enter") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return; // native activation / input handles it
        if (p === "title" || p === "results") { e.preventDefault(); startRun(true); }
        else if (p === "intro") { e.preventDefault(); dismissIntro(); }
      }
      if (p === "playing" && e.target !== inputRef.current) {
        if (e.key === "Tab") { e.preventDefault(); skip(); }
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) focusInput(); // the keystroke lands in the input
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissIntro, focusInput, goTitle, skip, startRun]);

  // idle on results -> back to title
  useEffect(() => {
    if (phase !== "results") return;
    let last = performance.now();
    const bump = () => { last = performance.now(); };
    const evs = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    evs.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    setIdleLeft(IDLE_MS);
    const id = window.setInterval(() => {
      const left = IDLE_MS - (performance.now() - last);
      setIdleLeft(left);
      if (left <= 0) goTitle();
    }, 250);
    return () => { window.clearInterval(id); evs.forEach((ev) => window.removeEventListener(ev, bump)); };
  }, [phase, goTitle]);

  // test hook (only with ?test=1)
  useEffect(() => {
    if (!params.current.test) return;
    window.__answer = phase === "playing" ? puzzle?.answer : undefined;
    window.__kind = puzzle?.kind;
    window.__phase = phase;
    window.__score = score;
  }, [phase, puzzle, score]);

  // lock page scroll while the play frame is up
  useEffect(() => {
    const lock = phase === "countdown" || phase === "playing" || phase === "intro";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }, [phase]);

  // ---------- render ----------
  const showPlayFrame = phase === "countdown" || phase === "playing" || phase === "intro";

  return (
    <div className="relative">
      {/* One input for the whole game: focused inside the PLAY tap so phones keep their keyboard up. */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Type the decoded word"
        data-testid="answer-input"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        tabIndex={showPlayFrame ? 0 : -1}
        className="fixed left-0 top-[30%] z-0 h-10 w-px border-0 bg-transparent p-0 text-[16px] text-transparent caret-transparent opacity-0 outline-none"
      />

      {phase === "title" && <TitleScreen best={best} onPlay={() => startRun(true)} />}

      {showPlayFrame && (
        <PlayFrame
          puzzle={phase === "intro" ? SAMPLE : puzzle}
          value={phase === "intro" ? "" : value}
          status={status}
          shakeKey={shakeKey}
          score={score}
          streak={streak}
          remaining={phase === "playing" ? remaining : RUN_MS}
          flashKey={flashKey}
          skipKey={skipKey}
          focused={focused}
          dim={phase !== "playing"}
          onBoardTap={() => { if (phaseRef.current === "playing") focusInput(); }}
          onSkip={skip}
          onHome={goTitle}
        />
      )}

      {phase === "countdown" && <CountdownOverlay n={count} />}
      {phase === "intro" && <IntroOverlay onDone={dismissIntro} />}

      {phase === "results" && result && (
        <ResultsScreen result={result} idleLeft={idleLeft} onAgain={() => startRun(true)} onHome={goTitle} />
      )}
    </div>
  );
}

// =====================================================================
// Play
// =====================================================================
function PlayFrame(props: {
  puzzle: Puzzle | null; value: string; status: "idle" | "wrong" | "correct"; shakeKey: number;
  score: number; streak: number; remaining: number; flashKey: number; skipKey: number; focused: boolean;
  dim: boolean; onBoardTap: () => void; onSkip: () => void; onHome: () => void;
}) {
  const { puzzle, value, status, shakeKey, score, streak, remaining, flashKey, skipKey, focused, dim } = props;
  const urgent = remaining <= 10_000 && !dim;

  return (
    <div onMouseDown={(e) => e.preventDefault()} className={`vv-frame play-wash z-10 flex flex-col overflow-hidden ${urgent ? "shadow-[inset_0_0_140px_-50px_rgba(239,68,68,.5)]" : ""}`} data-testid="play-frame">
      {flashKey > 0 && <div key={flashKey} aria-hidden className="flash pointer-events-none absolute inset-0 z-20 bg-lime-300" />}

      {/* top bar */}
      <header className="relative z-10 mx-auto w-full max-w-5xl shrink-0 px-3 pt-3 sm:px-8 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={props.onHome} className="flex h-11 items-center gap-2 rounded-full bg-card pl-1.5 pr-4 text-sm font-semibold text-ink-soft shadow-[0_0_0_1px_rgba(70,61,53,.08)] hover:text-ink" aria-label="Back to title (Esc)">
            <Dot size={32} />
            <span>Quit</span>
            <kbd className="hidden font-mono text-[11px] font-medium sm:inline">Esc</kbd>
          </button>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2" data-testid="score">
              {streak >= 3 && (
                <span className="pop flex items-center gap-0.5 font-mono text-xs font-bold text-warn" key={streak} aria-label={`${streak} in a row`}>
                  <Flame size={22} />×{streak}
                </span>
              )}
              <div className="text-right">
                <b className="serif block text-[34px] font-normal leading-[.9] tabular-nums sm:text-[44px]"><Counter value={score} duration={300} /></b>
                <small className="text-[12.5px] text-ink-soft">{score === 1 ? "word" : "words"} cracked</small>
              </div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div className="relative">
              <TimerNumber remainingMs={remaining} />
              {skipKey > 0 && <span key={skipKey} className="float-up pointer-events-none absolute -top-2 right-0 font-mono text-sm font-bold text-warn">−3s</span>}
            </div>
          </div>
        </div>
        <div className="mt-3"><TimerBar remainingMs={remaining} totalMs={RUN_MS} /></div>
      </header>

      {/* puzzle */}
      {puzzle && (
        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-6">
          <div key={puzzle.id} className="slide-in flex min-h-0 flex-1 flex-col">
            <section className="card mt-3 shrink-0 px-3 pb-4 pt-4 text-center sm:mt-7 sm:px-6 sm:pb-6 sm:pt-6">
              <span className="tag" data-testid="kind">{KIND_LABEL[puzzle.kind]}</span>
              <p className="mt-2 text-sm text-ink-soft sm:text-[15px]">{puzzle.hint}</p>

              <div
                key={shakeKey}
                role="button"
                tabIndex={-1}
                aria-label="Tap to type"
                onPointerDown={(e) => { e.preventDefault(); props.onBoardTap(); }}
                className={`mt-4 flex cursor-text justify-center gap-2 sm:mt-6 sm:gap-3.5 ${status === "wrong" ? "shake" : ""}`}
                data-testid="board"
              >
                {puzzle.display.map((tok, i) => {
                  const typed = value[i] ?? null;
                  let state: TileState = typed ? "typed" : i === value.length && focused && !dim ? "next" : "empty";
                  if (status === "wrong" && typed) state = "wrong";
                  if (status === "correct") state = "solved";
                  return (
                    <div key={i} className="flex flex-col items-center gap-2.5 sm:gap-3.5">
                      <Token kind={puzzle.kind} value={tok} />
                      <Tile letter={status === "correct" ? puzzle.answer[i] : typed} state={state} index={i} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3 sm:mt-5">
                {!focused && !dim ? (
                  <button type="button" onPointerDown={(e) => { e.preventDefault(); props.onBoardTap(); }} className="h-11 rounded-full bg-lime-400 px-5 text-sm font-semibold text-[#1f2a07]">
                    Tap to type
                  </button>
                ) : (
                  <span className={`${micro} hidden sm:inline`}>
                    {status === "wrong" ? <span className="text-red-600">Not quite. Keep typing.</span> : "Type the real word. It moves on by itself."}
                  </span>
                )}
                <button
                  type="button"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={props.onSkip}
                  className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_#DAD5CB] transition-colors hover:bg-paper"
                  data-testid="skip"
                >
                  Skip <span className="text-warn">−3s</span>
                  <kbd className="hidden rounded-md bg-paper px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-soft sm:inline">Tab</kbd>
                </button>
              </div>
              {status === "wrong" && <p className="pt-2 text-center text-[13px] text-red-600 sm:hidden">Not quite. Keep typing.</p>}
            </section>

            <div className="no-scrollbar mt-3 min-h-0 w-full flex-1 overflow-y-auto pb-1 sm:mt-4" data-testid="key">
              <PuzzleKey data={puzzle.keyData} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function CountdownOverlay({ n }: { n: number }) {
  return (
    <div className="vv-frame z-30 flex flex-col items-center justify-center bg-paper/80 backdrop-blur-sm" data-testid="countdown">
      <p className={micro}>Get ready</p>
      <div key={n} className="count-num serif text-[44vw] leading-none text-ink sm:text-[15rem]">{n > 0 ? n : <span className="text-leaf">Go</span>}</div>
      <p className={`${micro} mt-2`}>Sixty seconds. Type to decode.</p>
    </div>
  );
}

function IntroOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="vv-frame z-30 flex items-end justify-center bg-paper/70 p-3 backdrop-blur-[3px] sm:items-center" data-testid="intro">
      <div className="card rise w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Dot size={52} animated />
          <div>
            <p className={micro}>How it works, in five seconds</p>
            <h2 className="serif text-3xl leading-tight">Crack the code</h2>
          </div>
        </div>
        <ol className="mt-5 space-y-3 text-base leading-relaxed text-ink-soft sm:text-[17px]">
          <li className="flex gap-3"><b className="serif text-xl text-leaf-deep">1</b><span>A word appears in code, like <b className="font-mono text-ink">KDFN</b> behind this card.</span></li>
          <li className="flex gap-3"><b className="serif text-xl text-leaf-deep">2</b><span>Use the key underneath. Here, find each letter in the <b className="text-ink">code</b> row and read the <b className="text-ink">real</b> letter above: <b className="font-mono text-leaf-deep">HACK</b>.</span></li>
          <li className="flex gap-3"><b className="serif text-xl text-leaf-deep">3</b><span>Type it. Right answers move on by themselves. Stuck? <b className="text-warn">Skip</b> costs three seconds.</span></li>
        </ol>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-ink/10"><div className="progress-5s h-full bg-lime-400" /></div>
        <button type="button" onClick={onDone} className="mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-lime-400 text-base font-semibold text-[#1f2a07] shadow-[0_4px_0_#6E9A16]" data-testid="intro-go">Got it, start</button>
      </div>
    </div>
  );
}

// =====================================================================
// Results
// =====================================================================
function ResultsScreen({ result, idleLeft, onAgain, onHome }: { result: Result; idleLeft: number; onAgain: () => void; onHome: () => void }) {
  const rank = rankFor(result.score);
  const idleSecs = Math.max(0, Math.ceil(idleLeft / 1000));
  return (
    <main className="min-h-[100svh] pb-6" data-testid="results">
      <section className="result-wash mx-2.5 mt-2.5 rounded-[28px] px-3.5 pb-11 pt-4 text-center sm:mx-4 sm:mt-4 sm:rounded-[40px] sm:px-5 sm:pb-16 sm:pt-6">
        <nav className="-mx-0.5 mb-6 flex items-center justify-between sm:mx-2 sm:mb-8">
          <button type="button" onClick={onHome} className="flex items-center gap-2.5 py-1 pr-2" aria-label="Back to title">
            <Dot size={34} />
            <span className="serif text-[24px] leading-none sm:text-[26px]">Cipher Sprint</span>
          </button>
        </nav>
        <h1 className="serif rise text-[clamp(28px,3.4vw,40px)] text-ink-soft">Time&apos;s up. You cracked</h1>
        <div className="rise mt-1.5 flex items-center justify-center gap-3 sm:gap-7 [animation-delay:80ms]">
          <span className="serif text-[clamp(150px,18vw,230px)] font-[350] leading-[.9]" data-testid="final-score"><Counter value={result.score} duration={1100} /></span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/chest-open.svg" alt="" className="h-[clamp(110px,13vw,170px)] drop-shadow-[0_18px_20px_rgba(70,61,53,.2)]" />
        </div>
        <p className="rise mt-1 text-lg text-ink-soft [animation-delay:120ms]">{result.score === 1 ? "word" : "words"} in sixty seconds</p>
        {result.newBest && <span className="pop mt-3.5 inline-block rounded-full bg-lime-400 px-3 py-1 text-[13px] font-semibold text-[#1f2a07]">New best</span>}

        <div className="mx-auto mt-6 grid max-w-[620px] gap-3">
          <div className="card rise flex items-center gap-4 px-5 py-[18px] text-left [animation-delay:200ms]">
            <Dot size={64} animated />
            <div className="min-w-0">
              <small className="text-[13px] text-ink-soft">Your rank</small>
              <h2 className="serif text-[34px] leading-[1.05]" data-testid="rank">{rank.name}</h2>
              <p className="mt-1 text-[15px] text-ink-soft">“{rank.dot}”</p>
            </div>
          </div>
          <figure className="card rise bg-[#F6F1E4] px-5 py-4 text-left [animation-delay:260ms]">
            <figcaption className="text-[13px] text-ink-soft">Something to know</figcaption>
            <p className="mt-1 text-[17px] leading-snug" data-testid="lesson">{result.lesson}</p>
          </figure>
          <div className="flex justify-center gap-6 text-sm text-ink-soft">
            <span>Your best <b className="text-ink">{result.best}</b></span>
            {result.skips > 0 && <span>Skipped <b className="text-ink">{result.skips}</b></span>}
          </div>
        </div>

        <div className="rise mx-auto mt-8 flex max-w-[620px] flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:320ms]">
          <PlayButton label="Play again" onPress={onAgain} testId="again" autoFocus />
          <button type="button" onClick={onHome} className="btn-ghost w-full sm:w-auto" data-testid="home">Back to title</button>
        </div>
      </section>
      <p className={`${micro} mt-4 text-center transition-opacity ${idleSecs <= 10 ? "opacity-100" : "opacity-0"}`} aria-live="polite">
        Back to the title in {idleSecs} seconds
      </p>
    </main>
  );
}
