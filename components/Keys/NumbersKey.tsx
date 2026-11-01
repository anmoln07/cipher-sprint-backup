import type { NumbersKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";
import TwoRowStrip from "./TwoRowStrip";

export default function NumbersKey({ data }: { data: NumbersKeyData }) {
  return (
    <KeyCard title="The key: A = 1, B = 2…" art="map" aside="Find each number in the bottom row, then read the letter above it.">
      <TwoRowStrip top={data.strip.map((e) => e.letter)} bottom={data.strip.map((e) => String(e.value))} topLabel="Real" bottomLabel="Code" smallBottom />
    </KeyCard>
  );
}
