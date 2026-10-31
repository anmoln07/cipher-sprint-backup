export type TileState = "empty" | "next" | "typed" | "wrong" | "solved" | "scramble";

/** One split-flap tile. `solved` flips in (staggered by index) and turns lime. */
export function Tile({ letter, state, index = 0, size = "lg" }: { letter: string | null; state: TileState; index?: number; size?: "lg" | "md" }) {
  const dims = size === "lg" ? "h-14 w-12 text-3xl sm:h-20 sm:w-16 sm:text-5xl" : "h-12 w-10 text-2xl sm:h-14 sm:w-12 sm:text-3xl";
  const look: Record<TileState, string> = {
    empty: "border-white/10 bg-white/[0.03] text-transparent",
    next: "border-lime-400/60 bg-white/[0.05] text-transparent",
    typed: "border-white/25 bg-white/[0.08] text-[#e7e9ea]",
    wrong: "border-red-500/80 bg-red-500/10 text-red-400",
    solved: "border-lime-400 bg-lime-400 text-black",
    scramble: "border-white/15 bg-white/[0.06] text-zinc-400",
  };
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 font-black uppercase leading-none transition-colors duration-150 ${dims} ${look[state]} ${state === "solved" ? "flip-in" : state === "typed" ? "type-in" : ""}`}
      style={state === "solved" ? { animationDelay: `${index * 55}ms` } : undefined}
    >
      {/* split-flap hinge line */}
      <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-1/2 h-px ${state === "solved" ? "bg-black/20" : "bg-black/60"}`} />
      <span className="relative">{letter ?? "·"}</span>
      {state === "next" && <span aria-hidden className="caret absolute bottom-2 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-lime-400 sm:w-7" />}
    </span>
  );
}

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*?";
export function scrambleChar(seed: number) {
  return SCRAMBLE[Math.abs(Math.floor(seed)) % SCRAMBLE.length];
}
