import type { ReactNode } from "react";

/** The card that holds every key: serif title, a one-line how-to, and the key itself. */
export default function KeyCard({ title, aside, art, children }: { title: string; aside?: ReactNode; art?: string; children: ReactNode }) {
  return (
    <section className="card p-3.5 sm:p-5" aria-label={title}>
      <header className="mb-3 flex items-center gap-3 sm:mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {art && <img src={`/art/${art}.svg`} alt="" className="hidden h-12 w-12 object-contain sm:block" />}
        <div className="min-w-0">
          <h2 className="serif text-xl leading-tight sm:text-[22px]">{title}</h2>
          {aside && <p className="mt-0.5 text-[13px] text-ink-soft sm:text-sm">{aside}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
