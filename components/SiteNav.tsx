import Logo from "./Logo";

export default function SiteNav({ onHome, right }: { onHome?: () => void; right?: React.ReactNode }) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-4 sm:top-5">
      <div className="pointer-events-auto flex h-12 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] pl-2 pr-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,.8)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onHome}
          className="flex h-9 items-center gap-2.5 rounded-full pl-2 pr-1 font-mono text-sm font-bold uppercase tracking-[0.12em] outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          aria-label="Cipher Sprint, back to title"
        >
          <Logo size={24} />
          <span>Cipher <span className="text-lime-400">Sprint</span></span>
        </button>
        {right}
      </div>
    </nav>
  );
}
