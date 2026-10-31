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
import AttractDemo from "./AttractDemo";
import Counter from "./Counter";
import Dot from "./Dot";
import Flame from "./Flame";
import PuzzleKey from "./Keys";
import Magnetic from "./Magnetic";
import Marquee from "./Marquee";
import QR from "./QR";
import SiteNav, { pill } from "./SiteNav";
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

const btnPrimary =
  "group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full bg-lime-400 px-9 py-5 font-mono text-lg font-bold uppercase text-black outline-none transition-colors duration-200 hover:bg-white focus-visible:bg-white";
const btnGhost =
  "inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.12em] text-zinc-300 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400";
const micro = "font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-500";

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
// Title
// =====================================================================
function TitleScreen({ best, onPlay }: { best: number; onPlay: () => void }) {
  // Same cover-sheet layout as SOCIALTRACE's hero: centred title, crop marks, file microtype, scan line.
  const mark = "absolute h-6 w-6 border-zinc-600";
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#0a0a08] text-white selection:bg-lime-400 selection:text-black">
      <SiteNav right={best > 0 ? <span className={pill}>Best <b className="text-lime-400">{best}</b></span> : null} />
      <section className="relative flex min-h-[calc(100svh-5rem)] w-full flex-col items-center justify-center px-4 pb-6 pt-24 sm:min-h-[calc(100svh-7rem)] sm:pt-32">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div aria-hidden className="scan pointer-events-none absolute inset-x-0 top-0 h-px bg-lime-400/70 shadow-[0_0_24px_4px_rgba(163,230,53,.35)]" />
        <span aria-hidden className={`${mark} left-4 top-20 border-l border-t sm:left-8 sm:top-24`} />
        <span aria-hidden className={`${mark} right-4 top-20 border-r border-t sm:right-8 sm:top-24`} />
        <span aria-hidden className={`${mark} bottom-2 left-4 border-b border-l sm:left-8`} />
        <span aria-hidden className={`${mark} bottom-2 right-4 border-b border-r sm:right-8`} />
        {/* file microtype: in the flow on phones (so big system text can't collide with the title), pinned on larger screens */}
        <div className="relative z-10 mb-8 flex w-full items-center justify-between gap-3 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:absolute sm:inset-x-12 sm:top-[7.5rem] sm:mb-0 sm:w-auto sm:px-0 sm:text-xs sm:tracking-[0.25em]">
          <span>Cipher club<span className="hidden sm:inline"> · stall game</span></span>
          <span className="flex shrink-0 items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />60 sec</span>
        </div>

        <div className="rise relative z-10 text-center">
          <h1 className="select-none text-[17vw] font-black uppercase leading-[0.82] tracking-tighter sm:text-[13vw] lg:text-[10vw] 2xl:text-[150px]">
            Cipher<br /><span className="bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">Sprint</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl font-mono text-[13px] uppercase leading-relaxed tracking-[0.18em] text-zinc-400 sm:text-base sm:tracking-widest">
            <span className="block sm:inline">Read the code.</span>{" "}<span className="block sm:inline">Use the key.</span>{" "}
            <span className="block sm:inline"><span className="relative inline-block"><span className="text-white">Crack</span>
              <span aria-hidden className="draw-line absolute inset-x-0 -bottom-1 h-[3px] bg-lime-400" /></span> the word.</span>
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Magnetic>
              <button type="button" onClick={onPlay} className={btnPrimary} data-testid="play">
                Play
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </Magnetic>
            <span className="hidden font-mono text-xs uppercase tracking-widest text-zinc-500 sm:inline">[ or press enter ]</span>
          </div>
        </div>

        <div className="rise relative z-10 mt-10 w-full max-w-md sm:max-w-xl [animation-delay:150ms]"><AttractDemo /></div>

        <div className="absolute bottom-6 right-8 z-10 hidden xl:block"><QR size={112} /></div>
      </section>
      <Marquee />
    </main>
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
    <div onMouseDown={(e) => e.preventDefault()} className={`vv-frame z-10 flex flex-col overflow-hidden bg-[#0a0a08] ${urgent ? "shadow-[inset_0_0_120px_-40px_rgba(239,68,68,.55)]" : ""}`} data-testid="play-frame">
      <div aria-hidden className="bg-grain pointer-events-none absolute inset-0" />
      {flashKey > 0 && <div key={flashKey} aria-hidden className="flash pointer-events-none absolute inset-0 z-20 bg-lime-400" />}

      {/* top bar */}
      <header className="relative z-10 mx-auto w-full max-w-5xl shrink-0 px-4 pt-3 sm:px-8 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={props.onHome} className="flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1.5 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white sm:text-xs" aria-label="Back to title (Esc)">
            <Dot size={34} />
            <span className="hidden sm:inline">Esc</span>
            <span className="sm:hidden">Quit</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2" data-testid="score">
              {streak >= 3 && (
                <span className="pop flex items-center gap-0.5 font-mono text-xs font-bold text-amber-400" key={streak} aria-label={`${streak} in a row`}>
                  <Flame size={22} />×{streak}
                </span>
              )}
              <div className="text-right">
                <div className="font-anton text-4xl leading-none tabular-nums text-lime-400 sm:text-6xl"><Counter value={score} duration={300} /></div>
              </div>
              <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.2em] text-zinc-500 sm:text-xs">words<br />decoded</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="relative">
              <TimerNumber remainingMs={remaining} />
              {skipKey > 0 && <span key={skipKey} className="float-up pointer-events-none absolute -top-1 right-0 font-mono text-sm font-bold text-amber-400">−3s</span>}
            </div>
          </div>
        </div>
        <div className="mt-3"><TimerBar remainingMs={remaining} totalMs={RUN_MS} /></div>
      </header>

      {/* puzzle */}
      {puzzle && (
        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-3 sm:px-8 sm:pb-6">
          <div key={puzzle.id} className="slide-in flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col items-center pt-3 text-center sm:pt-8">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime-400 sm:text-xs" data-testid="kind">{KIND_LABEL[puzzle.kind]}</p>
              <p className="mt-1 text-sm text-zinc-400 sm:text-base">{puzzle.hint}</p>
            </div>

            <div className="flex shrink-0 items-end justify-center gap-2 pt-4 sm:gap-4 sm:pt-8">
              <div
                key={shakeKey}
                role="button"
                tabIndex={-1}
                aria-label="Tap to type"
                onPointerDown={(e) => { e.preventDefault(); props.onBoardTap(); }}
                className={`flex cursor-text justify-center gap-2.5 sm:gap-5 ${status === "wrong" ? "shake" : ""}`}
                data-testid="board"
              >
                {puzzle.display.map((tok, i) => {
                  const typed = value[i] ?? null;
                  let state: TileState = typed ? "typed" : i === value.length && focused && !dim ? "next" : "empty";
                  if (status === "wrong" && typed) state = "wrong";
                  if (status === "correct") state = "solved";
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 sm:gap-5">
                      <div className="flex h-10 items-center text-[#e7e9ea] sm:h-[72px]"><Token kind={puzzle.kind} value={tok} /></div>
                      <Tile letter={status === "correct" ? puzzle.answer[i] : typed} state={state} index={i} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-3 pt-3 sm:pt-5">
              {!focused && !dim ? (
                <button type="button" onPointerDown={(e) => { e.preventDefault(); props.onBoardTap(); }} className="h-12 rounded-full border border-lime-400/50 px-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime-400">
                  Tap to type
                </button>
              ) : (
                <span className={`${micro} hidden sm:inline`}>
                  {status === "wrong" ? <span className="text-red-400">Not quite. Keep typing.</span> : "Type the real word · it jumps ahead by itself"}
                </span>
              )}
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={props.onSkip}
                className="flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-amber-400 hover:text-amber-400"
                data-testid="skip"
              >
                Skip <span className="text-amber-400">−3s</span>
                <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">Tab</kbd>
              </button>
            </div>
            {status === "wrong" && <p className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-red-400 sm:hidden">Not quite. Keep typing.</p>}

            <div className="no-scrollbar mx-auto mt-3 w-full min-h-0 flex-1 overflow-y-auto pb-1 sm:mt-8" data-testid="key">
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
    <div className="vv-frame z-30 flex flex-col items-center justify-center bg-[#0a0a08]/80 backdrop-blur-sm" data-testid="countdown">
      <p className={micro}>Get ready</p>
      <div key={n} className="count-num font-anton text-[44vw] leading-none text-lime-400 sm:text-[16rem]">{n > 0 ? n : "GO"}</div>
      <p className={`${micro} mt-2`}>60 seconds · type to decode</p>
    </div>
  );
}

function IntroOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="vv-frame z-30 flex items-end justify-center bg-[#0a0a08]/70 p-4 backdrop-blur-[2px] sm:items-center" data-testid="intro">
      <div className="rise w-full max-w-lg rounded-3xl border border-white/10 bg-[#121210] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <Dot size={48} animated />
          <div>
            <p className={micro}>How it works · 5 sec</p>
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Crack the code</h2>
          </div>
        </div>
        <ol className="mt-5 space-y-3 text-base text-zinc-300 sm:text-lg">
          <li className="flex gap-3"><b className="font-anton text-xl text-lime-400">1</b><span>A word appears in code, like <b className="font-mono text-white">KDFN</b> behind this card.</span></li>
          <li className="flex gap-3"><b className="font-anton text-xl text-lime-400">2</b><span>Use the key underneath it. Here, find each letter in the <b className="text-white">code</b> row and read the <b className="text-white">real</b> letter above: <b className="font-mono text-lime-400">HACK</b>.</span></li>
          <li className="flex gap-3"><b className="font-anton text-xl text-lime-400">3</b><span>Type it. Right answers jump ahead by themselves. Stuck? <b className="text-amber-400">Skip</b> costs 3 seconds.</span></li>
        </ol>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10"><div className="progress-5s h-full bg-lime-400" /></div>
        <button type="button" onClick={onDone} className={`${btnPrimary} mt-5 w-full`} data-testid="intro-go">Got it · start</button>
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
    <main className="bg-grain relative min-h-[100svh] overflow-hidden" data-testid="results">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <SiteNav onHome={onHome} />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-10 pt-20 text-center sm:px-8 sm:pt-28">
        <p className={`${micro} rise`}>Time! · You decoded</p>
        <div className="rise mt-3 flex items-end justify-center gap-3 sm:mt-4 [animation-delay:80ms]">
          <span className="font-anton text-[34vw] leading-[0.85] text-lime-400 sm:text-[12rem]" data-testid="final-score">
            <Counter value={result.score} duration={1100} />
          </span>
        </div>
        <p className="rise -mt-1 text-2xl font-black uppercase tracking-tight sm:text-4xl [animation-delay:120ms]">
          {result.score === 1 ? "word" : "words"}
        </p>

        <div className="rise mt-6 flex w-full max-w-xl items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left sm:mt-8 sm:p-6 [animation-delay:220ms]">
          <Dot size={64} animated />
          <div className="min-w-0">
            <p className={micro}>Your rank</p>
            <p className="text-3xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl" data-testid="rank">{rank.name}</p>
            <p className="mt-1.5 text-base text-zinc-300">“{rank.dot}”</p>
          </div>
        </div>

        <div className="rise mt-3 flex w-full max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 [animation-delay:280ms]">
          <span className={micro}>Best this session · <b className="text-lime-400">{result.best}</b></span>
          {result.newBest && <span className="pop rounded-full bg-lime-400 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black">New best</span>}
          {result.skips > 0 && <span className={micro}>Skipped · {result.skips}</span>}
        </div>

        <figure className="rise mt-6 w-full max-w-xl -rotate-[0.6deg] rounded-2xl bg-[#ECEAE2] p-4 text-left text-zinc-900 sm:p-5 [animation-delay:340ms]">
          <figcaption className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Field note</figcaption>
          <p className="mt-1 text-base font-semibold leading-snug sm:text-lg" data-testid="lesson">{result.lesson}</p>
        </figure>

        <div className="rise mt-8 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center [animation-delay:400ms]">
          <Magnetic className="w-full sm:w-auto">
            <button type="button" onClick={onAgain} className={`${btnPrimary} w-full px-12 text-xl sm:w-auto`} data-testid="again" autoFocus>Play again</button>
          </Magnetic>
          <button type="button" onClick={onHome} className={`${btnGhost} w-full sm:w-auto`} data-testid="home">Back to title</button>
        </div>
        <p className={`${micro} mt-5 transition-opacity ${idleSecs <= 10 ? "opacity-100" : "opacity-0"}`} aria-live="polite">
          Back to title in {idleSecs}s
        </p>
      </div>
    </main>
  );
}
