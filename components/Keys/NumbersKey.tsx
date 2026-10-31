import type { NumbersKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";
import TwoRowStrip from "./TwoRowStrip";

export default function NumbersKey({ data }: { data: NumbersKeyData }) {
  return (
    <KeyCard title="Key · A = 1, B = 2…" aside={<span>find number <b className="text-zinc-900">↓</b> read letter <b className="text-zinc-900">↑</b></span>}>
      <TwoRowStrip top={data.strip.map((e) => e.letter)} bottom={data.strip.map((e) => String(e.value))} topLabel="Real" bottomLabel="Code" smallBottom />
    </KeyCard>
  );
}
