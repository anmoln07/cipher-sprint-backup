// Dot, the tour guide: a chibi magnifying glass with a sprout, happy ^^ eyes and rosy cheeks.
// Warm palette: brown outline, cream lens, lime sprout and handle. Original character, drawn in code.
export default function Dot({ size = 44, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <span className={`relative inline-block shrink-0 ${animated ? "dot-float" : ""}`} style={{ width: size, height: size }}>
      {animated && <span aria-hidden className="dot-halo absolute left-[8%] top-[12%] h-[66%] w-[66%] rounded-full bg-lime-400/50 blur-md" />}
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className="relative overflow-visible">
        <g className={animated ? "dot-sprout" : ""} style={{ transformOrigin: "20px 6px" }}>
          <path d="M20 6.4 Q19.6 3.6 20.6 1.6" fill="none" stroke="#5B7A12" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M20.6 2.4 Q22.4 -1.4 26.6 -0.6 Q25.4 3.4 20.8 3.2 Z" fill="#A3E635" />
          <path d="M20.2 3.4 Q17.6 0.2 14 1.4 Q15.6 4.8 20 4.4 Z" fill="#7FA81E" />
        </g>
        <path d="M31.5 31.5 L41 41" stroke="#463D35" strokeWidth="8" strokeLinecap="round" />
        <path d="M33.5 33.5 L41 41" stroke="#A3E635" strokeWidth="8" strokeLinecap="round" />
        <circle cx="20" cy="21" r="15.5" fill="#FBFAF6" stroke="#463D35" strokeWidth="3.4" />
        <circle cx="20" cy="21" r="12.5" fill="#E4ECCB" />
        <g className={animated ? "dot-blink" : ""} style={{ transformOrigin: "20px 19px" }}>
          <path d="M12.2 20.4 Q14.6 17 17 20.4" fill="none" stroke="#463D35" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 20.4 Q25.4 17 27.8 20.4" fill="none" stroke="#463D35" strokeWidth="2" strokeLinecap="round" />
        </g>
        <ellipse cx="11" cy="24.5" rx="2.3" ry="1.3" fill="#F2A7A0" />
        <ellipse cx="29" cy="24.5" rx="2.3" ry="1.3" fill="#F2A7A0" />
        <path d="M16.6 24 Q20 28.4 23.4 24 Z" fill="#463D35" />
        <path d="M18.4 25.7 Q20 27.6 21.6 25.7 Q20 25 18.4 25.7Z" fill="#F2A7A0" />
        <path d="M9.6 14 Q12 10 16.4 9.2" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
      </svg>
    </span>
  );
}
