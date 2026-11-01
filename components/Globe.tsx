"use client";
import { useEffect, useRef } from "react";

/** A slowly turning globe whose surface is made of Morse dots and dashes. Canvas 2D, pauses off-screen. */
export default function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, g = cv.getContext("2d")!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, R = 0, CX = 0, CY = 0, raf = 0, visible = true;
    const size = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
      const phone = W < 720;
      R = phone ? W * 0.66 : Math.min(W * 0.46, H * 1.05);
      CX = W / 2; CY = phone ? H * 0.52 : H * 0.08 + R;
      if (still) frame(0);
    };
    const N = 2600, pts: [number, number, number, boolean][] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r, (i * 7919) % 11 < 3]);
    }
    const tilt = -0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
    const line = (a: number, latFirst: boolean, fixed: number) => {
      g.beginPath(); let fresh = true;
      for (let v = latFirst ? 0 : -90; v <= (latFirst ? 360 : 270); v += 4) {
        const L = ((latFirst ? fixed : v) * Math.PI) / 180, O = ((latFirst ? v : fixed) * Math.PI) / 180 + a;
        const x = Math.cos(L) * Math.cos(O), y = Math.sin(L), z = Math.cos(L) * Math.sin(O);
        const y2 = y * ct - z * st, z2 = y * st + z * ct;
        if (z2 < 0) { fresh = true; continue; }
        const X = CX + x * R, Y = CY - y2 * R;
        if (fresh) g.moveTo(X, Y); else g.lineTo(X, Y);
        fresh = false;
      }
      g.stroke();
    };
    function frame(t: number) {
      g.clearRect(0, 0, W, H);
      const a = still ? 0.6 : t * 0.00006, ca = Math.cos(a), sa = Math.sin(a);
      g.lineWidth = 1; g.strokeStyle = "rgba(70,61,53,.09)";
      for (let lat = -75; lat <= 75; lat += 15) line(a, true, lat);
      for (let lo = 0; lo < 180; lo += 20) line(a, false, lo);
      for (const [x0, y0, z0, dash] of pts) {
        const x = x0 * ca - z0 * sa, z = x0 * sa + z0 * ca;
        const y = y0 * ct - z * st, z2 = y0 * st + z * ct;
        if (z2 < -0.05) continue;
        const X = CX + x * R, Y = CY - y * R, al = 0.3 + 0.62 * Math.pow(1 - z2, 1.4);
        if (dash) {
          g.strokeStyle = `rgba(70,61,53,${al})`; g.lineWidth = 1.6;
          const len = 4 * Math.max(0.35, z2);
          g.beginPath(); g.moveTo(X - len, Y); g.lineTo(X + len, Y); g.stroke();
        } else {
          g.fillStyle = `rgba(70,61,53,${al})`; g.beginPath(); g.arc(X, Y, 1.15, 0, 6.283); g.fill();
        }
      }
    }
    const loop = (t: number) => { if (visible && !document.hidden) frame(t); raf = requestAnimationFrame(loop); };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(cv);
    if (!still) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden className={className} />;
}
