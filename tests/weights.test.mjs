// Tests the shared percentage arithmetic (assets/weights.js) and checks that it agrees with the tool's own scoring.
//   node tests/weights.test.mjs
// The tool's quality() is copied out of propositions.html, as the scoring regression does, so a drift between the
// display arithmetic and the real score fails here.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

const ctx = { globalThis: {} }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "assets/weights.js"), "utf8"), ctx);
const BW = ctx.BallotWeights;
const D = BW.DEFAULT;

// 1. Default weights and their shares (computed, not hard-coded in the code). Five factors since Oct 29, 2026.
const sh = BW.shares(D);
ok(BW.KEYS.join() === "ev,lr,ac,if,fc", "five factor keys");
ok(sh.total === 17, "default weights total 17 (5 + 4 + 3 + 3 + 2)");
const want = { ev: 29.4118, lr: 23.5294, ac: 17.6471, if: 17.6471, fc: 11.7647 };
for (const k of BW.KEYS) ok(near(sh.pct[k], want[k], 1e-3), `default share ${k} = ${want[k]}%`);
ok(near(BW.KEYS.reduce((s, k) => s + sh.pct[k], 0), 100, 1e-9), "default shares sum to 100 before rounding");
ok(BW.fmt(sh.pct.ev, 2) === "29.41" && BW.fmt(sh.pct.lr, 2) === "23.53" && BW.fmt(sh.pct.fc, 2) === "11.76", "two-decimal display");

// 2. Weight changes, a single criterion, and all zero.
const w2 = Object.assign({}, D, { ev: 0 });
ok(near(BW.shares(w2).pct.lr, 100 * 4 / 12), "share updates when a weight changes (Evidence off: Low risk 4 of 12)");
const only = { ev: 0, lr: 0, ac: 0, if: 3, fc: 0 };
ok(BW.shares(only).pct.if === 100 && BW.shares(only).pct.ev === 0, "single criterion gets 100%");
const zero = { ev: 0, lr: 0, ac: 0, if: 0, fc: 0 };
ok(BW.shares(zero).total === 0 && BW.KEYS.every((k) => BW.shares(zero).pct[k] === null), "all zero gives no shares and no division by zero");
ok(BW.weighted({ ev: 3 }, zero).off === true, "all zero gives no weighted result");

// 3. Boundary ratings, missing ratings, half points, rounding, and the sum of contributions.
const all = (r) => Object.fromEntries(BW.KEYS.map((k) => [k, r]));
ok(BW.weighted(all(5), D).percent === 100 && near(BW.weighted(all(5), D).exactPercent, 100), "all 5/5 gives 100%");
ok(BW.weighted(all(1), D).percent === 20 && near(BW.weighted(all(1), D).exactPercent, 20), "all 1/5 gives 20%");
const miss = Object.assign(all(4), { ev: null });
const wm = BW.weighted(miss, D);
ok(wm.weightUsed === 12 && near(wm.exactAverage, 4) && wm.rows.find((r) => r.k === "ev").counted === false, "a missing rating is left out and the others are rescaled, never counted as 0 or 5");
ok(BW.weighted({ ev: 0, lr: 6, ac: "3" }, D).off === true, "invalid ratings (0, 6, text) are not counted");
const half = BW.weighted({ ac: 3.5 }, { ev: 0, lr: 0, ac: 3, if: 0, fc: 0 });
ok(!half.off && half.average === 3.5 && half.percent === 70, "a half-point rating (Accountability and results, 3.5) counts as 3.5 of 5 = 70%");
const r1 = BW.weighted({ ev: 3, lr: 3, ac: 3, if: 4, fc: 4 }, D);
ok(near(r1.rows.find((r) => r.k === "ev").points, 100 * 5 * 3 / (17 * 5)), "Evidence strength 5/17 at 3/5 adds 17.65 points");
ok(near(r1.rows.reduce((s, r) => s + r.points, 0), r1.exactPercent), "contributions add up to the exact percentage");
ok(r1.average === 3.3 && r1.percent === 66, "Prop 1 example, 56/17 = 3.29, shows 3.3 of 5 as 66%");

// 4. Agreement with the tool's quality() for all 14 propositions, every preset and each single factor.
const s = fs.readFileSync(path.join(root, "propositions.html"), "utf8");
const block = s.slice(s.indexOf("  var FACTORS = ["), s.indexOf("\n  ];", s.indexOf("  var PROPS = [")) + 5);
const fn = (n) => s.match(new RegExp("  function " + n + "\\([\\s\\S]*?\\n  \\}"))[0];
const tool = { state: { w: {}, g: {} } }; vm.createContext(tool);
vm.runInContext(block + "\n" + ["rated", "quality"].map(fn).join("\n") + "\nthis.PROPS = PROPS; this.PRESETS = PRESETS; this.FACTORS = FACTORS; this.quality = quality;", tool);
ok(tool.PROPS.length === 14, "14 propositions read from the tool");
ok(JSON.stringify(tool.FACTORS.map((f) => f.k)) === JSON.stringify(BW.KEYS), "factor keys match the tool");
ok(JSON.stringify(tool.PRESETS[0].w) === JSON.stringify(D), "default weights match the tool's Standard preset");
const sets = tool.PRESETS.map((p) => p.w).concat(BW.KEYS.map((k) => Object.fromEntries(BW.KEYS.map((x) => [x, x === k ? 3 : 0])))).concat([zero]);
let cmp = 0, bad = [];
for (const w of sets) for (const p of tool.PROPS) {
  Object.assign(tool.state.w, w);
  const q = tool.quality(p), r = BW.weighted(p.s, w); cmp++;
  if (q.off !== r.off || (!q.off && (q.avg !== r.average || Math.round(q.avg * 20) !== r.percent))) bad.push(p.n + " " + JSON.stringify(w));
  if (!r.off && !near(r.rows.reduce((t, x) => t + x.points, 0), r.exactPercent, 1e-9)) bad.push("sum " + p.n);
}
ok(bad.length === 0, `display arithmetic agrees with quality() in ${cmp} cases: ` + bad.slice(0, 5).join("; "));

// 5. Print the standard results for the report.
Object.assign(tool.state.w, D);
if (process.argv.includes("--print")) for (const p of tool.PROPS) { const r = BW.weighted(p.s, D); console.log(`Prop ${p.n}\t${r.percent}%\t${r.average.toFixed(1)}\t${r.exactAverage.toFixed(4)}\t${r.exactPercent.toFixed(2)}`); }

console.log(`weights tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
