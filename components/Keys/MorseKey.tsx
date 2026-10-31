import type { MorseKeyData } from "@/lib/ciphers";
import MorseGlyph from "../MorseGlyph";
import KeyCard from "./KeyCard";

export default function MorseKey({ data }: { data: MorseKeyData }) {
  return (
    <KeyCard title="Key · Morse A–Z" aside={<span>● dot &nbsp;▬ dash</span>}>
      <ul className="grid grid-cols-3 gap-x-1.5 gap-y-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9">
        {data.chart.map((e) => (
          <li key={e.letter} className="flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-zinc-900/[0.06] px-1.5 sm:h-9 sm:px-2">
            <span className="w-3.5 font-mono text-sm font-black sm:text-base">{e.letter}</span>
            <MorseGlyph code={e.code} size="sm" className="text-zinc-900" />
          </li>
        ))}
      </ul>
    </KeyCard>
  );
}
