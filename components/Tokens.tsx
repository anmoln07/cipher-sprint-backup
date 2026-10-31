import type { CipherKind } from "@/lib/ciphers";
import MorseGlyph from "./MorseGlyph";

/** One encoded symbol, drawn big. */
export function Token({ kind, value }: { kind: CipherKind; value: string }) {
  switch (kind) {
    case "caesar":
      return <span className="font-black text-5xl leading-none tracking-tighter sm:text-7xl">{value}</span>;
    case "numbers":
      return <span className="font-anton text-5xl leading-none tabular-nums sm:text-7xl">{value}</span>;
    case "keypad":
      return <span className="rounded-xl bg-white/[0.07] px-1.5 py-1.5 font-anton text-[32px] leading-none tabular-nums tracking-wide ring-1 ring-white/10 sm:px-3 sm:py-2 sm:text-6xl">{value}</span>;
    case "morse":
      return <MorseGlyph code={value} size="lg" />;
  }
}
