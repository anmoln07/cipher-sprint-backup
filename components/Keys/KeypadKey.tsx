import type { KeypadKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";

/** A little old-phone keypad. Count the presses: 444 = third letter on 4 = I. */
export default function KeypadKey({ data }: { data: KeypadKeyData }) {
  const cells: ({ digit: string; letters: string } | { digit: string; letters: "" })[] = [
    { digit: "1", letters: "" },
    ...data.keys,
    { digit: "*", letters: "" },
    { digit: "0", letters: "" },
    { digit: "#", letters: "" },
  ];
  return (
    <KeyCard title="Key · phone keypad" aside={<span className="whitespace-nowrap">presses = letter no.</span>}>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5 sm:gap-2">
        {cells.map((c) => (
          <div
            key={c.digit}
            className={`flex h-12 flex-col items-center justify-center rounded-xl sm:h-14 ${c.letters ? "bg-zinc-900 text-white" : "bg-zinc-900/10 text-zinc-400"}`}
          >
            <span className="font-anton text-xl leading-none sm:text-2xl">{c.digit}</span>
            {c.letters && (
              <span className="mt-1 flex gap-1 font-mono text-[11px] font-bold leading-none tracking-wider sm:text-xs">
                {c.letters.split("").map((l, i) => (
                  <span key={l} className={i === 0 ? "text-lime-400" : ""}>{l}</span>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
    </KeyCard>
  );
}
