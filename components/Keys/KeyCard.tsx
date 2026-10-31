import type { ReactNode } from "react";

/** "Paper" evidence card that holds every key. */
export default function KeyCard({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-[#ECEAE2] p-3 text-zinc-900 shadow-[0_20px_60px_-30px_rgba(163,230,53,.35)] sm:rounded-3xl sm:p-5" aria-label={title}>
      <header className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-xs">{title}</h2>
        {aside && <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">{aside}</div>}
      </header>
      {children}
    </section>
  );
}
