/** Draws a Morse letter as real dots and dashes (not tiny ASCII). */
export default function MorseGlyph({ code, size = "lg", className = "" }: { code: string; size?: "lg" | "md" | "sm"; className?: string }) {
  const s = size === "lg" ? "h-2.5 sm:h-4" : size === "md" ? "h-2.5" : "h-[6px]";
  const dot = size === "lg" ? "w-2.5 sm:w-4" : size === "md" ? "w-2.5" : "w-[6px]";
  const dash = size === "lg" ? "w-7 sm:w-11" : size === "md" ? "w-6" : "w-[14px]";
  const gap = size === "lg" ? "gap-[5px] sm:gap-2" : size === "md" ? "gap-1" : "gap-[3px]";
  return (
    <span className={`inline-flex items-center ${gap} ${className}`} role="img" aria-label={code.split("").map((c) => (c === "." ? "dot" : "dash")).join(" ")}>
      {code.split("").map((c, i) => (
        <span key={i} className={`${s} ${c === "." ? dot : dash} shrink-0 rounded-full bg-current`} />
      ))}
    </span>
  );
}
