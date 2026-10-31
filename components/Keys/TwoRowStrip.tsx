/** A–Z strip: real letters on top, code underneath. 13 + 13 on small screens, 26 in a row on large. */
function Row({ top, bottom, topLabel, bottomLabel, smallBottom }: { top: string[]; bottom: string[]; topLabel: string; bottomLabel: string; smallBottom?: boolean }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-zinc-900/15">
      <div className="flex w-9 shrink-0 flex-col border-r border-zinc-900/15 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-500 sm:w-11 sm:text-[9px]">
        <span className="flex flex-1 items-center justify-center py-1 sm:py-1.5">{topLabel}</span>
        <span className="flex flex-1 items-center justify-center bg-zinc-900 py-1 text-zinc-400 sm:py-1.5">{bottomLabel}</span>
      </div>
      <div className="grid min-w-0 flex-1" style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}>
        {top.map((t, i) => (
          <div key={t} className="flex flex-col border-zinc-900/10 [&:not(:last-child)]:border-r">
            <span className="flex flex-1 items-center justify-center py-1 font-mono text-sm font-bold text-zinc-900 sm:py-1.5 sm:text-base">{t}</span>
            <span className={`flex flex-1 items-center justify-center bg-zinc-900 py-1 font-mono font-bold text-lime-400 sm:py-1.5 ${smallBottom ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>{bottom[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TwoRowStrip(props: { top: string[]; bottom: string[]; topLabel: string; bottomLabel: string; smallBottom?: boolean }) {
  const { top, bottom } = props;
  return (
    <>
      <div className="flex flex-col gap-1.5 lg:hidden">
        <Row {...props} top={top.slice(0, 13)} bottom={bottom.slice(0, 13)} />
        <Row {...props} top={top.slice(13)} bottom={bottom.slice(13)} />
      </div>
      <div className="hidden lg:block"><Row {...props} /></div>
    </>
  );
}
