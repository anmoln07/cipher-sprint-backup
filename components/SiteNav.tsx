import Logo from "./Logo";

// Floating "liquid glass" top bar, same as SOCIALTRACE's SiteNav (see .glass in globals.css).
export default function SiteNav({ onHome, right }: { onHome?: () => void; right?: React.ReactNode }) {
  return (
    <nav className="glass fixed inset-x-3 top-3 z-40 mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-3 pr-2 sm:inset-x-6 sm:top-4 sm:pl-4">
      <button
        type="button"
        onClick={onHome}
        className="relative flex items-center gap-2 font-mono text-base font-bold uppercase tracking-tighter outline-none focus-visible:ring-2 focus-visible:ring-lime-400 sm:text-lg"
        aria-label="Cipher Sprint, back to title"
      >
        <Logo size={28} />
        <span>CIPHER<span className="text-lime-400">SPRINT</span></span>
      </button>
      <div className="relative flex min-h-[36px] items-center gap-2">{right}</div>
    </nav>
  );
}

export const pill = "glass-pill flex items-center gap-2 rounded-full px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider sm:px-4 sm:text-sm";
