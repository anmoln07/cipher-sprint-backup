import type { KeyData } from "@/lib/ciphers";
import CaesarKey from "./CaesarKey";
import MorseKey from "./MorseKey";
import NumbersKey from "./NumbersKey";
import BinaryKey from "./BinaryKey";

export default function PuzzleKey({ data }: { data: KeyData }) {
  switch (data.kind) {
    case "caesar": return <CaesarKey data={data} />;
    case "morse": return <MorseKey data={data} />;
    case "numbers": return <NumbersKey data={data} />;
    case "binary": return <BinaryKey data={data} />;
  }
}
