import type { CipherKind } from "@/lib/ciphers";
import MorseGlyph from "./MorseGlyph";

/** One encoded symbol, drawn as a chip. `sm` is the compact size used in the title demo card. */
export function Token({ kind, value, size = "lg" }: { kind: CipherKind; value: string; size?: "lg" | "sm" }) {
  const sm = size === "sm";
  if (kind === "morse")
    return (
      <span className={`inline-flex items-center rounded-xl bg-paper ${sm ? "h-8 px-2" : "h-10 px-2 sm:h-[60px] sm:px-3.5"}`}>
        <MorseGlyph code={value} size={sm ? "sm" : "lg"} className="text-ink" />
      </span>
    );
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-paper font-mono font-medium leading-none tabular-nums text-ink ${
        sm ? "h-8 min-w-[2rem] px-2 text-lg" : "h-10 min-w-[2.5rem] px-1.5 text-2xl sm:h-[60px] sm:min-w-[4rem] sm:px-3 sm:text-[34px]"
      }`}
    >
      {value}
    </span>
  );
}
