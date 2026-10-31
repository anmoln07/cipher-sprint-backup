import type { CaesarKeyData } from "@/lib/ciphers";
import KeyCard from "./KeyCard";
import TwoRowStrip from "./TwoRowStrip";

export default function CaesarKey({ data }: { data: CaesarKeyData }) {
  return (
    <KeyCard title={`Key · shift ${data.shift}`} aside={<span>find code <b className="text-zinc-900">↓</b> read real <b className="text-zinc-900">↑</b></span>}>
      <TwoRowStrip top={data.top} bottom={data.bottom} topLabel="Real" bottomLabel="Code" />
    </KeyCard>
  );
}
