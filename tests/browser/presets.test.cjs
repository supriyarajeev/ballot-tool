// Starting points and custom weights on all 14 propositions (Nov 1, 2026). Reads the score each card shows under
// Guide default, Equal, all five weights at 5, and Evidence strength alone, and compares it with an independent
// calculation from the ratings shown in tests/fixtures/scoring-baseline.json (captured from the tool's own code).
// Weights count only relative to each other, so all 5s must match Equal exactly.
//   node tests/browser/presets.test.cjs   (needs BASE; tests/browser/run.mjs sets it)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { BASE, ROOT, counter } = require("./lib.cjs");
const { ok, done } = counter("starting points tests");
const fx = JSON.parse(fs.readFileSync(path.join(ROOT, "tests/fixtures/scoring-baseline.json"), "utf8")).results;
const want = {}; // weight set -> prop -> average (answer Yes)
for (const line of fx) { const [ws, n, g, avg] = line.split("|"); if (g === "1") (want[ws] = want[ws] || {})[n] = avg; }
const NS = Object.keys(want.def);
const pctOf = (a) => Math.round(parseFloat(a) * 20) + "%";
(async () => {
  const b = await chromium.launch();
  try {
    for (const w of [1280, 390]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
      await p.goto(BASE + "propositions.html"); await p.waitForSelector("article.prop");
      await p.evaluate(() => { localStorage.clear(); });
      await p.reload(); await p.waitForSelector("article.prop");
      await p.evaluate(() => { document.querySelectorAll("button.sec-fold").forEach((x) => { if (x.getAttribute("aria-expanded") !== "true") x.click(); }); document.getElementById("customize").open = true; const f = document.getElementById("fold-all"); if (f.getAttribute("aria-pressed") !== "true") f.click(); });
      for (const n of NS) await p.click(`label[for="g-${n}-3"]`);
      const read = () => p.evaluate((ns) => ns.map((n) => document.getElementById("q-" + n).textContent), NS);
      const check = async (name, ws) => {
        const got = await read(); const bad = [];
        NS.forEach((n, i) => { const exp = pctOf(want[ws][n]) + " " + want[ws][n].replace(/^(\d)$/, "$1.0") + " of 5"; if (!got[i].startsWith(exp)) bad.push(n + ": " + got[i] + " (expected " + exp + ")"); });
        ok(bad.length === 0, name + ": all 14 scores match the independent calculation @" + w + (bad.length ? " " + bad.join("; ") : ""));
        return got;
      };
      await p.click('.preset[data-id="def"]'); const gDef = await check("Guide default", "def");
      await p.click('.preset[data-id="eq"]'); const gEq = await check("Equal", "eq");
      await p.click("#pr-custom");
      for (const k of ["ev", "lr", "ac", "if", "fc"]) await p.fill("#w-" + k, "5");
      const g5 = await check("Set my own, every factor 5", "eq");
      ok(JSON.stringify(g5) === JSON.stringify(gEq), "all 5s gives exactly the Equal scores @" + w);
      ok(/matches Equal/.test(await p.textContent("#preset-desc")), "all 5s says the scores match Equal @" + w);
      for (const k of ["lr", "ac", "if", "fc"]) await p.fill("#w-" + k, "0");
      await check("Set my own, Evidence strength only", "only-ev");
      const diff = NS.filter((n, i) => gDef[i] !== gEq[i]).length;
      ok(diff >= 1, "Guide default and Equal differ on " + diff + " of 14 @" + w);
      await p.click('.preset[data-id="def"]');
      await p.close();
    }
  } catch (e) { ok(false, "starting points suite crashed: " + e.message); }
  await b.close(); done();
})();
