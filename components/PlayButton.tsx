"use client";
import { useEffect, useRef } from "react";

// The Play button: a dithered lime "plasma" drawn by a tiny WebGL shader, a label that keeps
// decoding itself out of Morse / Caesar / keypad / numbers, a spinning Morse ring, a tilt that
// follows the pointer, and a burst of dots and dashes on press. Falls back to a CSS gradient
// without WebGL, and to a still version under prefers-reduced-motion.

const STATES = ["·−−· ·−·· ·− −·−−", "SODB", "7 555 2 999", "16 12 1 25"]; // PLAY in each cipher
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789·−";

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS = `precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float h; uniform float px;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
float bayer(vec2 p){p=mod(p,4.);int x=int(p.x),y=int(p.y);
  float b=(y==0)?((x==0)?0.:(x==1)?8.:(x==2)?2.:10.):(y==1)?((x==0)?12.:(x==1)?4.:(x==2)?14.:6.):
          (y==2)?((x==0)?3.:(x==1)?11.:(x==2)?1.:9.):((x==0)?15.:(x==1)?7.:(x==2)?13.:5.);return b/16.;}
void main(){
  vec2 cell=floor(gl_FragCoord.xy/px); vec2 uv=(cell*px)/r; vec2 a=vec2(r.x/r.y,1.);
  float d=length((uv-m)*a);
  float f=fbm(uv*a*2.6+vec2(t*.35,-t*.22)+fbm(uv*a*3.+t*.2));
  f+=h*.55*exp(-d*d*9.)+.18*sin(d*26.-t*7.)*exp(-d*3.)*h;
  f+=.12*(1.-uv.y);
  vec3 deep=vec3(.36,.55,.05),mid=vec3(.64,.90,.21),hi=vec3(.86,.98,.55);
  float q=f*2.;float th=bayer(cell);
  vec3 c=q+th*.5<.8?deep:(q+th*.5<1.5?mid:hi);
  float band=uv.x*.9+uv.y*.35-mod(t*.28,2.2)+.6;
  float s=exp(-band*band*90.);
  vec3 rainbow=.5+.5*cos(6.283*(uv.x*1.4+t*.3+vec3(0.,.33,.67)));
  c=mix(c,rainbow*.55+.55,s*.55);
  gl_FragColor=vec4(c,1.);
}`;

function burst(btn: HTMLElement) {
  const b = btn.getBoundingClientRect();
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  const ring = document.createElement("i");
  ring.className = "cbtn-shock";
  Object.assign(ring.style, { left: `${cx}px`, top: `${cy}px`, width: `${b.width}px`, height: `${b.height}px` });
  document.body.appendChild(ring);
  window.setTimeout(() => ring.remove(), 800);
  for (let i = 0; i < 48; i++) {
    const p = document.createElement("i");
    p.className = "cbtn-bit" + (Math.random() < 0.4 ? " dash" : "");
    const ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 150;
    p.style.left = `${cx}px`; p.style.top = `${cy}px`;
    p.style.setProperty("--dx", `${Math.cos(ang) * dist * 1.5}px`);
    p.style.setProperty("--dy", `${Math.sin(ang) * dist}px`);
    p.style.setProperty("--rot", `${ang * 57.3}deg`);
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 900);
  }
}

export default function PlayButton({
  label = "Play", onPress, kbd = true, wide = false, testId, autoFocus,
}: { label?: string; onPress: () => void; kbd?: boolean; wide?: boolean; testId?: string; autoFocus?: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const still = useRef(false);

  useEffect(() => {
    const btn = btnRef.current!, cv = cvRef.current!, code = codeRef.current!, word = wordRef.current!;
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, hov = 0, hovT = 0, mx = 0.5, my = 0.5, alive = true, busy = false, si = 0;
    const timers: number[] = [];

    // ---- shader
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    const u: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const sh = (ty: number, src: string) => { const s = gl.createShader(ty)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const k of ["r", "t", "m", "h", "px"]) u[k] = gl.getUniformLocation(pr, k);
    } else btn.classList.add("cbtn-nogl");
    const size = () => { const d = Math.min(2, window.devicePixelRatio || 1); cv.width = btn.clientWidth * d; cv.height = btn.clientHeight * d; gl?.viewport(0, 0, cv.width, cv.height); };
    size();
    const ro = new ResizeObserver(size); ro.observe(btn);
    const t0 = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(btn);
    const draw = (now: number) => {
      if (!alive) return;
      hov += (hovT - hov) * 0.08;
      if (gl && visible) {
        const d = Math.min(2, window.devicePixelRatio || 1);
        gl.uniform2f(u.r, cv.width, cv.height); gl.uniform1f(u.t, still.current ? 2 : (now - t0) / 1000);
        gl.uniform2f(u.m, mx, 1 - my); gl.uniform1f(u.h, hov); gl.uniform1f(u.px, 3 * d);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!still.current) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // ---- label: code -> scramble -> word
    const scrambleTo = (target: string, ms: number, el: HTMLElement, done?: () => void) => {
      const start = performance.now();
      const step = (n: number) => {
        if (!alive) return;
        const k = Math.min(1, (n - start) / ms);
        let s = "";
        for (let i = 0; i < target.length; i++) s += target[i] === " " || i / target.length < k ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = s;
        if (k < 1) requestAnimationFrame(step); else done?.();
      };
      requestAnimationFrame(step);
    };
    const wave = () => {
      word.innerHTML = "";
      [...label].forEach((c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.animationDelay = `${i * 60}ms`; word.appendChild(s); });
      word.classList.remove("wave"); void word.offsetWidth; word.classList.add("wave");
    };
    const cycle = () => {
      if (busy || hovT || document.hidden) return;
      busy = true;
      btn.classList.add("show-code");
      scrambleTo(STATES[si++ % STATES.length], 380, code, () => {
        timers.push(window.setTimeout(() => {
          btn.classList.remove("show-code");
          scrambleTo(label, 420, word, () => { busy = false; });
        }, 900));
      });
    };
    const iv = still.current ? 0 : window.setInterval(cycle, 3400);

    // ---- pointer: tilt + gloss + ripple
    const move = (e: PointerEvent) => {
      const b = btn.getBoundingClientRect();
      mx = (e.clientX - b.left) / b.width; my = (e.clientY - b.top) / b.height;
      btn.style.setProperty("--gx", `${mx * 100}%`); btn.style.setProperty("--gy", `${my * 100}%`);
      if (!still.current && e.pointerType === "mouse")
        btn.style.transform = `perspective(600px) translate(${(mx - 0.5) * 10}px,${(my - 0.5) * 8}px) rotateX(${(0.5 - my) * 10}deg) rotateY(${(mx - 0.5) * 14}deg)`;
    };
    const enter = () => { hovT = 1; btn.classList.remove("show-code"); if (!still.current) scrambleTo(label, 260, word, wave); };
    const leave = () => { hovT = 0; btn.style.transform = ""; };
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerenter", enter);
    btn.addEventListener("pointerleave", leave);

    return () => {
      alive = false; cancelAnimationFrame(raf); window.clearInterval(iv); timers.forEach(window.clearTimeout);
      ro.disconnect(); io.disconnect();
      btn.removeEventListener("pointermove", move); btn.removeEventListener("pointerenter", enter); btn.removeEventListener("pointerleave", leave);
    };
  }, [label]);

  const press = () => {
    const btn = btnRef.current!;
    btn.classList.remove("boom"); void btn.offsetWidth; btn.classList.add("boom");
    if (!still.current) burst(btn);
    onPress();
  };

  return (
    <button ref={btnRef} type="button" onClick={press} className={`cbtn ${wide ? "cbtn-wide" : ""} ${kbd ? "has-kbd" : ""}`} aria-label={label} data-testid={testId} autoFocus={autoFocus}>
      <canvas ref={cvRef} aria-hidden />
      <span className="cbtn-gloss" aria-hidden />
      <span className="cbtn-label">
        <span ref={codeRef} className="cbtn-code" aria-hidden />
        {/* innerHTML so the letter-wave animation can split it without fighting React */}
        <span ref={wordRef} className="cbtn-word" dangerouslySetInnerHTML={{ __html: label }} />
      </span>
      {kbd && <kbd className="cbtn-kbd" aria-hidden>Enter</kbd>}
    </button>
  );
}
