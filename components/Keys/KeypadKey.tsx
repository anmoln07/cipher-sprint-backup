import type { KeypadKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";

/** A little old-phone keypad. Count the presses: 444 = third letter on 4 = I. */
export default function KeypadKey({ data }: { data: KeypadKeyData }) {
  const cells: { digit: string; letters: string }[] = [
    { digit: "1", letters: "" }, ...data.keys, { digit: "*", letters: "" }, { digit: "0", letters: "" }, { digit: "#", letters: "" },
  ];
  return (
    <KeyCard title="The key: an old phone keypad" art="keypad" aside="Count the presses. One press is the first letter.">
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5 sm:gap-2">
        {cells.map((c) => (
          <div key={c.digit} className={`flex h-12 flex-col items-center justify-center rounded-xl sm:h-14 ${c.letters ? "bg-paper text-ink" : "bg-paper/50 text-ink-soft/50"}`}>
            <span className="font-mono text-lg font-medium leading-none sm:text-xl">{c.digit}</span>
            {c.letters && (
              <span className="mt-1 flex gap-1 text-[11px] font-semibold leading-none tracking-wider text-ink-soft sm:text-xs">
                {c.letters.split("").map((l, i) => <span key={l} className={i === 0 ? "text-leaf-deep" : ""}>{l}</span>)}
              </span>
            )}
          </div>
        ))}
      </div>
    </KeyCard>
  );
}
