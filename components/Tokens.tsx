import type { CipherKind } from "@/lib/ciphers";
import MorseGlyph from "./MorseGlyph";

/** One encoded symbol, drawn big. */
export function Token({ kind, value }: { kind: CipherKind; value: string }) {
  switch (kind) {
    case "caesar":
      return <span className="font-black text-5xl leading-none tracking-tighter sm:text-7xl">{value}</span>;
    case "numbers":
      return <span className="font-anton text-5xl leading-none tabular-nums sm:text-7xl">{value}</span>;
    case "binary":
      return <span className="font-mono text-lg font-bold leading-none tracking-[0.04em] sm:text-3xl">{value}</span>;
    case "morse":
      return <MorseGlyph code={value} size="lg" />;
  }
}
