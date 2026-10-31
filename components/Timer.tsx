export function TimerNumber({ remainingMs }: { remainingMs: number }) {
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const urgent = remainingMs <= 10_000;
  return (
    <div className={`flex items-baseline gap-1 ${urgent ? "text-red-500" : "text-[#e7e9ea]"}`} role="timer" aria-label={`${secs} seconds left`} data-testid="timer">
      <span className={`font-anton text-4xl leading-none tabular-nums sm:text-6xl ${urgent ? "pulse-red inline-block" : ""}`}>{secs}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 sm:text-xs">sec</span>
    </div>
  );
}

export function TimerBar({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
  const urgent = remainingMs <= 10_000;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div
        className={`h-full origin-left rounded-full transition-[background-color] ${urgent ? "bg-red-500" : "bg-lime-400"}`}
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}
