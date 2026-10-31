"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR for this page's own URL (no query string), generated locally as SVG. */
export default function QR({ size = 132 }: { size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const u = `${window.location.origin}/`;
    setUrl(u.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    QRCode.toString(u, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0a0a08", light: "#00000000" } })
      .then(setSvg)
      .catch(() => setSvg(null));
  }, []);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/50 p-3 pr-5 backdrop-blur-md">
      <div className="rounded-xl bg-[#ECEAE2] p-2.5" style={{ width: size, height: size }} aria-label="QR code to play on your phone" role="img">
        {svg && <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      <div className="max-w-[9rem]">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime-400">Play on your phone</p>
        <p className="mt-1.5 text-sm leading-snug text-zinc-400">Scan to race on your own screen.</p>
        {url && <p className="mt-2 break-all font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{url}</p>}
      </div>
    </div>
  );
}
