// Full-run end-to-end test with plain Playwright (uses the preinstalled browser).
// Builds nothing: run `npm run build` first. Starts `next start`, plays a real 60 s run at
// 1440x900 and 390x844, saves screenshots to docs/, then stops the server.
//
//   npm run build && npm run e2e
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const PORT = Number(process.env.PORT ?? 3123);
const BASE = `http://127.0.0.1:${PORT}`;
const KINDS = ["caesar", "morse", "numbers", "binary"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(DOCS, { recursive: true });

let failures = 0;
function check(cond, msg) {
  if (cond) console.log(`  ok   ${msg}`);
  else { failures++; console.log(`  FAIL ${msg}`); }
}

async function startServer() {
  const proc = spawn(process.execPath, [path.join(ROOT, "node_modules/next/dist/bin/next"), "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  proc.stderr.on("data", (d) => process.stderr.write(d));
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(BASE); if (r.ok) return proc; } catch { /* not yet */ }
    await sleep(200);
  }
  proc.kill();
  throw new Error("server did not start");
}

const phase = (page) => page.evaluate(() => window.__phase);
async function waitPhase(page, want, timeout = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if ((await phase(page)) === want) return true; await sleep(50); }
  return false;
}
async function noSideScroll(page, label) {
  const { sw, w } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
  check(sw <= w, `${label}: no sideways scroll (${sw} <= ${w})`);
}

async function runViewport(browser, { name, viewport, mobile, offline, idleCheck }) {
  console.log(`\n== ${name} ${viewport.width}x${viewport.height}${offline ? " (offline after load)" : ""}`);
  const context = await browser.newContext({ viewport, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: mobile ? 2 : 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  let loaded = false;
  const lateRequests = [];
  page.on("request", (r) => { if (loaded) lateRequests.push(r.url()); });
  const shot = (n) => page.screenshot({ path: path.join(DOCS, `${name}-${n}.png`) });

  await page.goto(`${BASE}/?seed=123&test=1`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  loaded = true;
  if (offline) await context.setOffline(true);

  // ---- title
  await sleep(2600); // let the demo scramble into its answer
  check(await page.getByTestId("play").isVisible(), "title: PLAY visible");
  const qrVisible = await page.getByRole("img", { name: /QR code/ }).isVisible().catch(() => false);
  check(mobile ? !qrVisible : qrVisible, `title: QR ${mobile ? "hidden on phone" : "shown on desktop"}`);
  await noSideScroll(page, "title");
  await shot("title");

  // ---- intro (first play on this device)
  await page.getByTestId("play").click();
  check(await page.getByTestId("intro").isVisible(), "intro overlay shows on first play");
  await sleep(500);
  await shot("intro");
  await page.getByTestId("intro-go").click();

  // ---- countdown -> playing
  check(await page.getByTestId("countdown").isVisible(), "3-2-1 countdown shows");
  check(await waitPhase(page, "playing"), "run starts");
  const input = page.getByTestId("answer-input");
  check(await input.evaluate((el) => el === document.activeElement), "input is focused at start");

  const seen = new Set();
  let solved = 0, wrongTested = false, skipTested = false, urgentShot = false, kbShot = false;
  const runStart = Date.now();
  while ((await phase(page)) === "playing") {
    const answer = await page.evaluate(() => window.__answer);
    const kind = await page.evaluate(() => window.__kind);
    if (!answer) { await sleep(30); continue; }

    if (!seen.has(kind)) {
      seen.add(kind);
      await page.keyboard.type(answer.slice(0, 2).toLowerCase(), { delay: 40 });
      await sleep(250);
      await noSideScroll(page, `puzzle ${kind}`);
      const box = await page.getByTestId("board").boundingBox();
      check(box && box.x >= 0 && box.x + box.width <= viewport.width, `puzzle ${kind}: board fits the width`);
      if (kind === "morse") {
        // Every chart cell must fully contain its dots and dashes (the 4-symbol codes are the widest).
        const spill = await page.getByTestId("key").locator("li").evaluateAll((lis) =>
          lis.filter((li) => {
            const r = li.getBoundingClientRect();
            return [...li.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > r.right + 0.5);
          }).map((li) => li.textContent.trim()));
        check(spill.length === 0, `morse chart: no code spills out of its cell${spill.length ? ": " + spill.join(",") : ""}`);
      }
      await shot(`puzzle-${kind}`);
      if (mobile && !kbShot && kind === "morse") {
        // Simulate the phone keyboard taking ~45% of the screen: the input + key must still be on screen.
        kbShot = true;
        await page.setViewportSize({ width: viewport.width, height: 470 });
        await sleep(300);
        const b = await page.getByTestId("board").boundingBox();
        const k = await page.getByTestId("key").boundingBox();
        check(b && b.y + b.height <= 470, "keyboard open: answer tiles visible");
        check(k && k.y < 470 - 60, "keyboard open: key starts above the keyboard");
        await shot("puzzle-keyboard-open");
        await page.setViewportSize(viewport);
        await sleep(200);
      }
      await page.keyboard.type(answer.slice(2), { delay: 40 });
    } else if (!wrongTested) {
      wrongTested = true;
      const wrong = answer.split("").map((c) => (c === "Q" ? "X" : "Q")).join("");
      await page.keyboard.type(wrong, { delay: 30 });
      await sleep(80);
      check((await page.evaluate(() => window.__answer)) === answer, "wrong full-length guess does not advance");
      check(await page.locator(".shake").count() > 0, "wrong guess shakes");
      for (let i = 0; i < wrong.length; i++) await page.keyboard.press("Backspace");
      await page.keyboard.type(answer.toLowerCase().split("").join(" "), { delay: 30 }); // spaces are forgiven
    } else if (!skipTested && solved >= 3) {
      skipTested = true;
      const before = Number((await page.getByTestId("timer").innerText()).match(/\d+/)[0]);
      await page.keyboard.press("Tab");
      await sleep(150);
      const after = Number((await page.getByTestId("timer").innerText()).match(/\d+/)[0]);
      const nextAnswer = await page.evaluate(() => window.__answer);
      check(nextAnswer !== answer, "Tab skips to a new puzzle");
      check(before - after >= 3 && before - after <= 4, `skip costs 3 s (${before} -> ${after})`);
      continue;
    } else {
      await page.keyboard.type(answer, { delay: 50 });
    }
    // wait for the advance
    const t0 = Date.now();
    while (Date.now() - t0 < 2000) {
      const now = await page.evaluate(() => [window.__answer, window.__phase]);
      if (now[1] !== "playing" || (now[0] && now[0] !== answer)) break;
      await sleep(25);
    }
    if ((await phase(page)) === "playing" || (await phase(page)) === "results") solved++;

    if (!urgentShot && !mobile) {
      const secs = Number((await page.getByTestId("timer").innerText()).match(/\d+/)[0]);
      if (secs <= 8 && secs > 2) { urgentShot = true; await shot("last-seconds"); }
    }
    await sleep(3200); // human-ish pace so the run uses the whole minute
  }
  const runSecs = (Date.now() - runStart) / 1000;
  check(runSecs > 52 && runSecs < 66, `run lasted ~60 s minus one skip (${runSecs.toFixed(1)} s)`);
  check(KINDS.every((k) => seen.has(k)), `all four kinds appeared (${[...seen].join(", ")})`);

  // ---- results
  check(await waitPhase(page, "results"), "results screen");
  await sleep(1800);
  const final = Number(await page.getByTestId("final-score").innerText());
  check(final === solved, `score counts decoded words (${final} == ${solved})`);
  check((await page.getByTestId("rank").innerText()).length > 0, "rank shown");
  check((await page.getByTestId("lesson").innerText()).length > 0, "lesson shown");
  await noSideScroll(page, "results");
  await shot("results");

  if (idleCheck) {
    console.log("  .... waiting 31 s idle on results");
    await sleep(31_000);
    check((await phase(page)) === "title", "30 s idle on results returns to title");
    await page.keyboard.press("Enter");
  } else {
    await page.keyboard.press("Enter"); // PLAY AGAIN has focus
  }
  check(await waitPhase(page, "countdown", 3000), "Enter starts another run (no intro the second time)");
  await page.keyboard.press("Escape");
  check(await waitPhase(page, "title", 3000), "Esc goes back to title");

  check(errors.length === 0, `no console errors${errors.length ? ": " + errors.join(" | ") : ""}`);
  const external = lateRequests.filter((u) => !u.startsWith(BASE));
  check(external.length === 0, `no external requests after load${external.length ? ": " + external.join(", ") : ""}`);
  if (!offline) check(lateRequests.length === 0, `no runtime requests at all after load (${lateRequests.length})`);
  await context.close();
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch();
  await runViewport(browser, { name: "desktop", viewport: { width: 1440, height: 900 }, idleCheck: true });
  await runViewport(browser, { name: "mobile", viewport: { width: 390, height: 844 }, mobile: true, offline: true });
} catch (e) {
  failures++;
  console.error(e);
} finally {
  await browser?.close();
  server.kill();
}
console.log(failures ? `\n${failures} check(s) failed` : "\nAll e2e checks passed");
process.exit(failures ? 1 : 0);
