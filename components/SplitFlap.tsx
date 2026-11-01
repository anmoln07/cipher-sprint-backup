export type TileState = "empty" | "next" | "typed" | "wrong" | "solved" | "scramble";

/** One letter tile. `solved` flips in (staggered by index) and turns lime. */
export function Tile({ letter, state, index = 0, size = "lg" }: { letter: string | null; state: TileState; index?: number; size?: "lg" | "md" }) {
  const dims = size === "lg" ? "h-[60px] w-[50px] text-[32px] sm:h-[76px] sm:w-[66px] sm:text-[44px]" : "h-12 w-10 text-2xl sm:h-14 sm:w-12 sm:text-3xl";
  const look: Record<TileState, string> = {
    empty: "bg-card text-transparent shadow-[inset_0_0_0_1.5px_#DAD5CB]",
    next: "bg-card text-transparent shadow-[inset_0_0_0_2px_#463D35]",
    typed: "bg-card text-ink shadow-[inset_0_0_0_1.5px_#B9B2A6]",
    wrong: "bg-red-50 text-red-600 shadow-[inset_0_0_0_2px_#ef4444]",
    solved: "bg-lime-400 text-[#1f2a07]",
    scramble: "bg-paper text-ink-soft",
  };
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] font-serif uppercase leading-none transition-colors duration-150 ${dims} ${look[state]} ${state === "solved" ? "flip-in" : state === "typed" ? "type-in" : ""}`}
      style={state === "solved" ? { animationDelay: `${index * 55}ms` } : undefined}
    >
      <span className="relative">{letter ?? "·"}</span>
      {state === "next" && <span aria-hidden className="caret absolute bottom-2 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-leaf sm:w-7" />}
    </span>
  );
}
