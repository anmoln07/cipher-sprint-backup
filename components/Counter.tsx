"use client";
import { useEffect, useRef, useState } from "react";

/** Ticks from 0 (or the previous value) up to `value`. */
export default function Counter({ value, duration = 900, className = "" }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { setShown(value); from.current = value; return; }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, duration]);

  return <span className={`tabular-nums ${className}`}>{shown}</span>;
}
