"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR for this page's own URL (no query string), generated locally as SVG. */
export default function QR({ size = 112 }: { size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const u = `${window.location.origin}/`;
    setUrl(u.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    QRCode.toString(u, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#463D35", light: "#00000000" } })
      .then(setSvg)
      .catch(() => setSvg(null));
  }, []);

  return (
    <div className="card flex items-center gap-4 p-3 pr-5 text-left">
      <div className="rounded-xl bg-paper p-2.5" style={{ width: size, height: size }} aria-label="QR code to play on your phone" role="img">
        {svg && <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      <div className="max-w-[10rem]">
        <p className="serif text-lg leading-tight">Play on your phone</p>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">Scan to race on your own screen.</p>
        {url && <p className="mt-1.5 break-all font-mono text-[11px] text-leaf-deep">{url}</p>}
      </div>
    </div>
  );
}
