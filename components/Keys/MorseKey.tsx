import type { MorseKeyData } from "@/lib/ciphers";
import MorseGlyph from "../MorseGlyph";
import KeyCard from "./KeyCard";

export default function MorseKey({ data }: { data: MorseKeyData }) {
  return (
    <KeyCard title="The key: Morse A to Z" art="terminal" aside="Match the dots and dashes to a letter.">
      <ul className="grid grid-cols-3 gap-x-1.5 gap-y-1 sm:grid-cols-5 lg:grid-cols-7">
        {data.chart.map((e) => (
          <li key={e.letter} className="flex h-7 min-w-0 items-center gap-1.5 rounded-lg bg-paper px-1.5 sm:h-9 sm:px-2">
            <span className="w-3.5 font-mono text-sm font-bold sm:text-base">{e.letter}</span>
            <MorseGlyph code={e.code} size="sm" className="text-ink" />
          </li>
        ))}
      </ul>
    </KeyCard>
  );
}
