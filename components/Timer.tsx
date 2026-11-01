export function TimerNumber({ remainingMs }: { remainingMs: number }) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const urgent = remainingMs <= 10_000;
  const mm = Math.floor(total / 60), ss = String(total % 60).padStart(2, "0");
  return (
    <div className="text-right" role="timer" aria-label={`${total} seconds left`} data-testid="timer">
      <b className={`serif block text-[34px] font-normal leading-[.9] tabular-nums sm:text-[44px] ${urgent ? "pulse-red text-red-600" : ""}`}>{mm}:{ss}</b>
      <small className="text-[12.5px] text-ink-soft">left</small>
    </div>
  );
}

export function TimerBar({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
  const urgent = remainingMs <= 10_000;
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-ink/[.08]" aria-hidden>
      <div className={`h-full origin-left rounded-full ${urgent ? "bg-red-500" : "bg-lime-400"}`} style={{ transform: `scaleX(${pct})` }} />
    </div>
  );
}
