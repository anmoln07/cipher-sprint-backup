"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { encodeKind, KIND_LABEL, type CipherKind } from "@/lib/ciphers";
import Dot from "./Dot";
import Globe from "./Globe";
import PlayButton from "./PlayButton";
import QR from "./QR";
import { Token } from "./Tokens";

const DEMO: { kind: CipherKind; word: string; secs: string }[] = [
  { kind: "morse", word: "PING", secs: "4.2" },
  { kind: "caesar", word: "HACK", secs: "3.1" },
  { kind: "keypad", word: "CODE", secs: "5.0" },
  { kind: "numbers", word: "KEYS", secs: "3.8" },
];
const PILLS: { kind?: CipherKind; label: string; art: string; pos: string; far?: boolean }[] = [
  { kind: "caesar", label: "Caesar", art: "scroll", pos: "left-[27%] top-[9%] sm:left-[20%] sm:top-[22%]" },
  { kind: "numbers", label: "Numbers", art: "map", pos: "left-[27%] top-[91%] sm:left-[11%] sm:top-[50%]" },
  { label: "You're next", art: "bottle", pos: "left-[19%] top-[76%]", far: true },
  { kind: "keypad", label: "Keypad", art: "keypad", pos: "left-[73%] top-[9%] sm:left-[80%] sm:top-[22%]" },
  { kind: "morse", label: "Morse", art: "terminal", pos: "left-[73%] top-[91%] sm:left-[89%] sm:top-[50%]" },
  { label: "60 seconds", art: "clock", pos: "left-[81%] top-[76%]", far: true },
];
const STRIP: [string, string][] = [
  ["scroll", "Caesar shift"], ["terminal", "Morse code"], ["keypad", "Phone keypad"],
  ["map", "Number swap"], ["clock", "Sixty seconds"], ["bottle", "Skip costs three"],
];

/** The demo card in the middle of the globe: cycles through the ciphers, "typing" each answer. */
function useDemo() {
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(4); return; }
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      if (n <= 4) setTyped(n);
      else if (n > 7) { n = 0; setTyped(0); setI((v) => (v + 1) % DEMO.length); }
    }, 420);
    return () => window.clearInterval(id);
  }, []);
  return { demo: DEMO[i], typed };
}

export default function TitleScreen({ best, onPlay }: { best: number; onPlay: () => void }) {
  const { demo, typed } = useDemo();
  const enc = encodeKind(demo.kind, demo.word, { shift: 3 });
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState("");

  // dotted connector from the demo card to the matching pill
  const link = useCallback(() => {
    const stage = stageRef.current, card = cardRef.current;
    const pill = stage?.querySelector<HTMLElement>(`[data-kind="${demo.kind}"]`);
    if (!stage || !card || !pill) return;
    const s = stage.getBoundingClientRect(), c = card.getBoundingClientRect(), p = pill.getBoundingClientRect();
    const px = p.left + p.width / 2 - s.left, py = p.top + p.height / 2 - s.top;
    if (px > c.left - s.left && px < c.right - s.left) {
      const up = py < c.top - s.top;
      setPath(`M${px} ${up ? c.top - s.top : c.bottom - s.top} L${px} ${up ? p.bottom - s.top + 4 : p.top - s.top - 4}`);
      return;
    }
    const left = px < c.left - s.left;
    const cx = left ? c.left - s.left : c.right - s.left;
    const cy = Math.min(Math.max(py, c.top - s.top + 30), c.bottom - s.top - 30);
    const ex = left ? p.right - s.left + 4 : p.left - s.left - 4;
    setPath(`M${cx} ${cy} C ${(cx + ex) / 2} ${cy}, ${(cx + ex) / 2} ${py}, ${ex} ${py}`);
  }, [demo.kind]);
  useLayoutEffect(() => {
    link();
    const ro = new ResizeObserver(link);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [link]);

  return (
    <main className="min-h-[100svh]" data-testid="title">
      <header className="flex items-center justify-center gap-2.5 py-6">
        <Dot size={30} />
        <span className="serif text-[26px] text-ink">Cipher Sprint</span>
      </header>

      {/* ---------- hero ---------- */}
      <section className="hero-wash relative mx-2.5 overflow-hidden rounded-[28px] sm:mx-4 sm:rounded-[40px]">
        <div className="absolute right-6 top-6 z-10 hidden 2xl:block"><QR size={96} /></div>
        <div className="rise relative z-[3] px-5 pt-11 text-center sm:pt-16">
          <h1 className="serif mx-auto max-w-[15ch] text-[clamp(40px,6.2vw,84px)] leading-[1.02]">Crack as many codes as you can in a minute.</h1>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft sm:mt-6 sm:text-base">
            Every puzzle comes with its key. Type the real word and the next one appears. Stuck? Skip it for three seconds.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <PlayButton onPress={onPlay} testId="play" />
            <span className="mt-2 min-h-5 text-[13px] text-ink-soft empty:hidden">
              {best > 0 ? <>Your best: <b className="font-semibold text-leaf-deep">{best} {best === 1 ? "word" : "words"}</b></> : null}
            </span>
          </div>
        </div>

        <div ref={stageRef} className="relative mt-4 h-[470px] sm:mt-2 sm:h-[clamp(400px,40vw,520px)]">
          <Globe className="absolute inset-0 h-full w-full" />
          <svg aria-hidden className="pointer-events-none absolute inset-0 z-[2] h-full w-full">
            <path d={path} fill="none" stroke="#7FA81E" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 7" />
          </svg>
          {PILLS.map((p) => (
            <div key={p.label} data-kind={p.kind} className={`pill absolute z-[3] -translate-x-1/2 -translate-y-1/2 ${p.pos} ${p.far ? "hidden sm:inline-flex" : ""} ${p.kind === demo.kind ? "on" : ""}`}>
              <i aria-hidden><img src={`/art/${p.art}.svg`} alt="" /></i>{p.label}
            </div>
          ))}
          <div ref={cardRef} className="card absolute left-1/2 top-1/2 z-[3] w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 px-[18px] pt-4 sm:top-[46%]" aria-hidden>
            <span className="tag">{KIND_LABEL[demo.kind]}</span>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {enc.display.map((t, k) => <Token key={k} kind={demo.kind} value={t} size="sm" />)}
            </div>
            <div className="mt-3 flex gap-1.5">
              {[...demo.word].map((ch, k) => (
                <span key={k} className={`grid h-[46px] w-10 place-items-center rounded-[10px] font-serif text-[22px] ${k < typed ? "bg-lime-400 text-[#1f2a07]" : "bg-paper"}`}>{k < typed ? ch : ""}</span>
              ))}
            </div>
            <div className="-mx-[18px] mt-4 flex items-center gap-2 border-t border-line px-[18px] py-[11px] text-[12.5px] font-semibold text-ink-soft">
              <Dot size={20} /> Cracked by Dot in {demo.secs} seconds
            </div>
          </div>
        </div>
      </section>

      {/* ---------- strip ---------- */}
      <div className="overflow-hidden border-b border-line py-[22px]" aria-hidden>
        <div className="strip-track flex w-max gap-16">
          {[...STRIP, ...STRIP].map(([art, label], k) => (
            <div key={k} className="serif flex items-center gap-2.5 whitespace-nowrap text-[22px]">

              <img src={`/art/${art}.svg`} alt="" className="h-[34px]" />{label}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- how it plays ---------- */}
      <section className="px-4 pb-10 pt-[72px] text-center sm:pt-24">
        <span className="tag">How it plays</span>
        <h2 className="serif mx-auto mt-[18px] max-w-[16ch] text-[clamp(34px,4.6vw,60px)] leading-[1.04]">Three moves, one minute on the clock</h2>
        <div className="mx-auto mt-14 grid max-w-[1140px] items-start gap-4 md:grid-cols-3 md:gap-[22px]">
          <Step art="bottle" title="Read the code" text="A secret word shows up as shifted letters, Morse, phone taps or numbers."
            chip={<span className="font-mono">KDFN</span>} />
          <Step art="keypad" title="Use the key" text="The key sits right under the puzzle. Match each piece of code to its letter." className="md:mt-12"
            chip={<><span className="font-mono">44</span> means H</>} />
          <Step art="chest-closed" title="Crack the word" text="Type it and the next code drops in. See how many you crack before time runs out." className="md:mt-24"
            chip={<span className="flex gap-1.5">{[..."HACK"].map((c) => <span key={c} className="grid h-[38px] w-8 place-items-center rounded-lg bg-lime-400 font-serif text-xl text-[#1f2a07]">{c}</span>)}</span>} />
        </div>
      </section>

      {/* ---------- end ---------- */}
      <section className="end-wash mx-2.5 mt-16 rounded-[28px] px-5 py-16 text-center sm:mx-4 sm:mt-20 sm:rounded-[40px] sm:py-20">
        <h2 className="serif mx-auto max-w-[18ch] text-[clamp(32px,4.4vw,56px)] leading-[1.05]">Your minute starts when you press Play.</h2>
        <div className="mt-10 flex justify-center"><PlayButton onPress={onPlay} testId="play-bottom" /></div>
        <div className="mt-12 hidden justify-center lg:flex"><QR size={96} /></div>
      </section>
      <footer className="py-8 text-center text-[13px] text-ink-soft">Made by Cipher club, Bennett University · Illustrations from Kitbitz (CC0)</footer>
    </main>
  );
}

function Step({ art, title, text, chip, className = "" }: { art: string; title: string; text: string; chip: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-gradient-to-b from-[#EFEDE8] to-[#E9E6DE] px-6 pb-8 pt-7 shadow-[0_0_0_1px_rgba(70,61,53,.07)] ${className}`}>
      <div className="relative grid h-[170px] place-items-center sm:h-[210px]">

        <img src={`/art/${art}.svg`} alt="" className="h-[120px] drop-shadow-[0_16px_18px_rgba(70,61,53,.18)] sm:h-[150px]" />
        <div className="card absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-2 text-[15px]">{chip}</div>
      </div>
      <h3 className="serif mt-6 text-[28px]">{title}</h3>
      <p className="mx-auto mt-2.5 max-w-[30ch] text-[15px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
