const ITEMS = ["Caesar", "Morse", "Binary", "Numbers"];

export default function Marquee() {
  const run = Array.from({ length: 4 }, () => ITEMS).flat();
  return (
    <div className="relative overflow-hidden border-y border-black bg-lime-400 py-3 text-black" aria-hidden>
      <div className="marquee-track flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {run.map((t, i) => (
              <span key={i} className="flex items-center font-black uppercase tracking-tight">
                <span className="px-5 text-2xl sm:text-3xl">{t}</span>
                <span className="text-lg">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
