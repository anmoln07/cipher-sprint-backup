"use client";
import { useEffect, useState } from "react";
import { encodeKind, KIND_LABEL, type CipherKind } from "@/lib/ciphers";
import { Tile, scrambleChar, type TileState } from "./SplitFlap";
import { Token } from "./Tokens";

const DEMOS: { kind: CipherKind; word: string; shift?: number }[] = [
  { kind: "morse", word: "CODE" },
  { kind: "caesar", word: "HACK", shift: 3 },
  { kind: "binary", word: "BYTE" },
  { kind: "numbers", word: "CHAI" },
];

// timeline per demo (ms)
const HOLD_CODE = 1100, PER_LETTER = 380, HOLD_ANSWER = 1500;

/** Title-screen loop: an encoded word scrambles and snaps into its answer letter by letter. */
export default function AttractDemo() {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0);
  const [calm, setCalm] = useState(false);

  useEffect(() => { setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  const demo = DEMOS[i % DEMOS.length];
  const enc = encodeKind(demo.kind, demo.word, { shift: demo.shift });
  const total = HOLD_CODE + enc.answer.length * PER_LETTER + HOLD_ANSWER;

  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const el = performance.now() - t0;
      if (el >= total) { setI((x) => x + 1); setT(0); } else setT(el);
    }, calm ? 400 : 60);
    return () => window.clearInterval(id);
  }, [i, total, calm]);

  const solvedCount = Math.max(0, Math.min(enc.answer.length, Math.floor((t - HOLD_CODE) / PER_LETTER)));
  const scrambling = t > HOLD_CODE - 400 && solvedCount < enc.answer.length;
  const allDone = solvedCount === enc.answer.length;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7" aria-hidden>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 sm:text-xs">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-lime-400" />Live demo</span>
        <span key={i} className="slide-in text-lime-400">{KIND_LABEL[demo.kind]}</span>
      </div>
      <div key={`b${i}`} className="slide-in mt-6 flex justify-center gap-3 sm:gap-5">
        {enc.display.map((tok, k) => {
          let state: TileState = "empty";
          let letter: string | null = null;
          if (k < solvedCount) { state = "solved"; letter = enc.answer[k]; }
          else if (scrambling && !calm) { state = "scramble"; letter = scrambleChar(t / 70 + k * 7); }
          return (
            <div key={k} className="flex flex-col items-center gap-4">
              <div className="flex h-12 items-center sm:h-16"><Token kind={demo.kind} value={tok} /></div>
              <Tile letter={letter} state={state} index={0} size="md" />
            </div>
          );
        })}
      </div>
      <p className={`mt-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] transition-opacity sm:text-xs ${allDone ? "text-lime-400 opacity-100" : "text-zinc-500 opacity-70"}`}>
        {allDone ? `Decoded · ${enc.answer}` : enc.hint}
      </p>
    </div>
  );
}
