/** A–Z strip: real letters on top, code underneath. 13 + 13 on small screens, 26 in a row on large. */
function Row({ top, bottom, topLabel, bottomLabel, smallBottom }: { top: string[]; bottom: string[]; topLabel: string; bottomLabel: string; smallBottom?: boolean }) {
  return (
    <div className="flex overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_#DAD5CB]">
      <div className="flex w-10 shrink-0 flex-col border-r border-line text-[10px] font-semibold text-ink-soft sm:w-12 sm:text-[11px]">
        <span className="flex flex-1 items-center justify-center py-1 sm:py-1.5">{topLabel}</span>
        <span className="flex flex-1 items-center justify-center bg-paper py-1 sm:py-1.5">{bottomLabel}</span>
      </div>
      <div className="grid min-w-0 flex-1" style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}>
        {top.map((t, i) => (
          <div key={t} className="flex flex-col border-line [&:not(:last-child)]:border-r">
            <span className="flex flex-1 items-center justify-center py-1 font-mono text-sm font-bold text-ink sm:py-1.5 sm:text-base">{t}</span>
            <span className={`flex flex-1 items-center justify-center bg-paper py-1 font-mono font-bold text-leaf-deep sm:py-1.5 ${smallBottom ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>{bottom[i]}</span>
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
