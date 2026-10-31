import type { BinaryKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";

export default function BinaryKey({ data }: { data: BinaryKeyData }) {
  return (
    <KeyCard title="Key · this word" aside={<span className="whitespace-nowrap">add the 1s</span>}>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 sm:gap-x-5">
        <span className="self-end pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500 sm:text-[10px]">Place</span>
        <div className="flex gap-1">
          {data.placeValues.map((v) => (
            <span key={v} className="flex h-7 w-9 items-center justify-center rounded-md bg-zinc-900 font-mono text-xs font-bold text-lime-400 sm:h-8 sm:w-11 sm:text-sm">{v}</span>
          ))}
        </div>
        {data.table.map((row) => (
          <div key={row.letter} className="contents">
            <span className="flex items-center gap-2 font-mono text-sm sm:text-base">
              <b className="w-4 text-base font-black sm:text-lg">{row.letter}</b>
              <span className="text-zinc-500">= {row.value}</span>
            </span>
            <div className="flex gap-1">
              {row.bits.split("").map((b, i) => (
                <span key={i} className={`flex h-7 w-9 items-center justify-center rounded-md font-mono text-sm font-bold sm:h-8 sm:w-11 sm:text-base ${b === "1" ? "bg-zinc-900/15 text-zinc-900" : "text-zinc-400"}`}>{b}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </KeyCard>
  );
}
