// Unit tests for the three-choice answer model (Yes, Not sure, No) in the Ballot Weighing Tool, October 26, 2026.
//   node tests/three-choice.test.mjs
// Runs the ACTUAL code copied out of propositions.html (data, ANSWERS, PREF_TEXT, quality(), lean(), and the saved-state
// loader), never a re-implementation. Expected values are fixed numbers worked out by hand from the ratings and
// weights below, and they match tests/fixtures/scoring-baseline.json, which was captured from the original tool.
//
// Hand calculations used below (Standard weights: nb 5, ev 5, lr 4, ac 3, if 3, fc 2, oc 2; total 24)
//   Prop 1 ratings nb 3, ev 3, lr 3, ac 3, if 4, fc 4, oc 3 -> (15+15+12+9+12+8+6)/24 = 77/24 = 3.208 -> 3.2
//   Prop 4 ratings nb 3, ev 3, lr 3, ac 2, if 4, fc 3, oc 2 -> (15+15+12+6+12+6+4)/24 = 70/24 = 2.917 -> 2.9
//   Prop 4 under Research-focused weights (nb 5, ev 5, lr 3, ac 1, if 2, fc 1, oc 1; total 18)
//          -> (15+15+9+2+8+3+2)/18 = 54/18 = 3.0
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };

const s = fs.readFileSync(path.join(root, "propositions.html"), "utf8");
const grab = (re, label) => { const m = s.match(re); if (!m) throw new Error("Could not find " + label); return m[0]; };
const fn = (n) => grab(new RegExp("  function " + n + "\\([\\s\\S]*?\\n  \\}"), n);
const line = (n) => grab(new RegExp("  function " + n + "\\(.*\\n"), n);
const block = s.slice(s.indexOf("  var FACTORS = ["), s.indexOf("\n  ];", s.indexOf("  var PROPS = [")) + 5);
const answers = grab(/  var ANSWERS = \[[\s\S]*?\];/, "ANSWERS");
const prefText = grab(/  var PREF_TEXT = \{[^}]*\};/, "PREF_TEXT");
const loader = s.slice(s.indexOf('  var KEY = "ballot-weighing-v2";'), s.indexOf("  function save()"));
if (loader.length < 50) throw new Error("Could not find the saved-state loader");

// Builds a fresh copy of the tool's state, optionally loading a stored value the way the page does on load.
function tool(stored) {
  const store = stored === undefined ? {} : { "ballot-weighing-v2": typeof stored === "string" ? stored : JSON.stringify(stored) };
  const ctx = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } } };
  vm.createContext(ctx);
  vm.runInContext(block + "\n" + answers + "\n" + prefText + "\n" + loader + "\n" +
    ["rated", "totalWeight", "quality", "qualityWord", "lean"].map(fn).join("\n") + "\n" + line("offText") + line("limitedWeighted") +
    "\nthis.T = { PROPS: PROPS, PRESETS: PRESETS, FACTORS: FACTORS, ANSWERS: ANSWERS, state: state, lean: lean, applyPreset: applyPreset };", ctx);
  return ctx.T;
}
const P = (T, n) => T.PROPS.find((p) => String(p.n) === String(n));
function leanFor(T, n, g) { T.state.g[n] = g; return T.lean(P(T, n)); }
function tally(T) {
  const c = { yes: 0, no: 0, close: 0, unsure: 0, none: 0 }; let answered = 0;
  T.PROPS.forEach((p) => { c[T.lean(p).cls]++; if (T.state.g[p.n] !== null) answered++; });
  return Object.assign(c, { answered });
}

const T = tool();

// 0. The card offers exactly three answers, in this order, with these stored values.
ok(JSON.stringify(T.ANSWERS.map((a) => [a.t, a.v])) === JSON.stringify([["Yes", 1], ["Not sure", 0], ["No", -1]]), "the card offers Yes (1), Not sure (0), No (-1), in that order");
ok(T.PROPS.length === 14, "14 propositions");

// 1. Yes, Standard weights.
let r = leanFor(T, 1, 1);
ok(r.cls === "yes" && r.label === "Leans toward YES" && r.qu.avg === 3.2 && r.pref === "Yes", "Prop 1, Yes: 3.2 is at or above 3.0, Leans toward YES (" + r.qu.avg + ", " + r.cls + ")");
ok(r.why === "You would vote yes, and on your priorities it rates Fair (3.2), at or above the 3.0 line.", "Prop 1, Yes: the reason names the score and the 3.0 line: " + r.why);
r = leanFor(T, 4, 1);
ok(r.cls === "close" && r.label === "Mixed / uncertain" && r.qu.avg === 2.9, "Prop 4, Yes: 2.9 is below 3.0, Mixed / uncertain, not a confident YES (" + r.qu.avg + ", " + r.cls + ")");

// 2. No, same inputs.
r = leanFor(T, 1, -1);
ok(r.cls === "no" && r.label === "Leans toward NO" && r.qu.avg === 3.2 && r.pref === "No", "Prop 1, No: Leans toward NO, evidence score unchanged at 3.2");
r = leanFor(T, 4, -1);
ok(r.cls === "no" && r.qu.avg === 2.9, "Prop 4, No: Leans toward NO, evidence score unchanged at 2.9");

// 3. Not sure: its own result, counted neither way.
r = leanFor(T, 1, 0);
ok(r.cls === "unsure" && r.label === "Not sure" && r.pref === "Not sure", "Prop 1, Not sure: shows Not sure");
ok(r.cls !== "yes" && r.cls !== "no" && r.cls !== "none", "Not sure is not counted as YES, NO or unanswered");

// 4. Skipped is not No, and not Not sure.
r = leanFor(T, 1, null);
ok(r.cls === "none" && r.label === "Not answered" && r.pref === "Not answered", "Prop 1, skipped: Not answered");
ok(leanFor(T, 1, null).cls !== leanFor(T, 1, -1).cls && leanFor(T, 1, null).cls !== leanFor(T, 1, 0).cls, "skipped differs from No and from Not sure");

// 5. Changing weights changes the result.
T.applyPreset("res");
r = leanFor(T, 4, 1);
ok(r.qu.avg === 3 && r.cls === "yes", "Prop 4, Yes, Research-focused weights: 3.0 reaches the line, Leans toward YES (" + r.qu.avg + ")");
{ T.FACTORS.forEach((f) => { T.state.w[f.k] = 0; }); r = leanFor(T, 4, 1);
  ok(r.qu.off === true && r.cls === "yes" && /answer only/.test(r.why), "all weights off: Yes follows the answer alone and says so"); }
T.applyPreset("def");
ok(leanFor(T, 4, 1).cls === "close", "back to Standard weights: Prop 4, Yes is Mixed again");

// 6. Changing the answer changes the result for that proposition only.
T.PROPS.forEach((p) => { T.state.g[p.n] = null; });
leanFor(T, 1, 1); const other = T.lean(P(T, 2)).cls;
ok(T.lean(P(T, 1)).cls === "yes", "Prop 1 set to Yes");
leanFor(T, 1, -1);
ok(T.lean(P(T, 1)).cls === "no" && T.lean(P(T, 2)).cls === other, "Yes to No changes Prop 1 to Leans toward NO and leaves Prop 2 alone");

// 7. All 14 handled the same way: No always NO, Not sure always Not sure, skipped always Not answered,
//    Yes is YES exactly when the rounded score is 3.0 or more (or no score can be computed), else Mixed.
const sets = T.PRESETS.map((p) => p.id);
let checked = 0, wrong = [];
for (const id of sets) {
  T.applyPreset(id);
  for (const p of T.PROPS) {
    const y = leanFor(T, p.n, 1), n = leanFor(T, p.n, -1), u = leanFor(T, p.n, 0), k = leanFor(T, p.n, null);
    const wantY = y.qu.off || y.qu.avg >= 3 ? "yes" : "close";
    if (y.cls !== wantY || n.cls !== "no" || u.cls !== "unsure" || k.cls !== "none") wrong.push(id + "/" + p.n);
    checked++;
  }
}
ok(checked === 56 && wrong.length === 0, "all 14 propositions x 4 presets follow the same rule: " + (wrong.join(", ") || "56 of 56"));

// 8. Totals and the answered count (the same counting as the page's progress bar and Step 3 tally).
T.applyPreset("def");
T.PROPS.forEach((p) => { T.state.g[p.n] = 1; });
let t = tally(T);
ok(t.yes === 8 && t.close === 6 && t.no === 0 && t.unsure === 0 && t.none === 0 && t.answered === 14, "all Yes, Standard weights: 8 Leans YES, 6 Mixed, 14 answered: " + JSON.stringify(t));
T.PROPS.forEach((p) => { T.state.g[p.n] = null; });
T.state.g[1] = 1; T.state.g[2] = -1; T.state.g[3] = 0; T.state.g[4] = 1;
t = tally(T);
ok(t.yes === 1 && t.close === 1 && t.no === 1 && t.unsure === 1 && t.none === 10 && t.answered === 4, "Yes, No, Not sure, Yes(weak) and 10 skipped: " + JSON.stringify(t));

// 9. Saved answers: kept as saved, old strength levels converted, bad values ignored.
let L = tool({ w: { nb: 5, ev: 5, lr: 4, ac: 3, if: 3, fc: 2, oc: 2 }, g: { 1: 1, 2: 0, 3: -1, 4: null } });
ok(L.state.g[1] === 1 && L.state.g[2] === 0 && L.state.g[3] === -1 && L.state.g[4] === null && L.state.g[5] === null, "saved Yes, Not sure, No and skipped load back unchanged");
L = tool({ w: {}, g: { 1: 2, 2: -2 } });
ok(L.state.g[1] === 1 && L.state.g[2] === -1, "old Strongly for loads as Yes, old Strongly against as No");
ok(L.lean(P(L, 1)).cls === "yes" && L.lean(P(L, 2)).cls === "no", "converted answers give the Yes and No results");
L = tool({ w: {}, g: { 1: 3, 2: "1", 3: -7, 999: 1 } });
ok(L.state.g[1] === null && L.state.g[2] === null && L.state.g[3] === null && !(999 in L.state.g), "out-of-range, text and unknown answers are ignored, never treated as No");
L = tool("not json");
ok(Object.values(L.state.g).every((v) => v === null), "a broken saved value starts every answer as skipped");

console.log(`three-choice tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
