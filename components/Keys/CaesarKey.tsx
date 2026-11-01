import type { CaesarKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";
import TwoRowStrip from "./TwoRowStrip";

export default function CaesarKey({ data }: { data: CaesarKeyData }) {
  return (
    <KeyCard title={`The key: shift ${data.shift}`} art="scroll" aside="Find each code letter in the bottom row, then read the real letter above it.">
      <TwoRowStrip top={data.top} bottom={data.bottom} topLabel="Real" bottomLabel="Code" />
    </KeyCard>
  );
}
