// Regression test for the Ballot Weighing Tool's scoring.
// Runs the ACTUAL scoring code copied out of propositions.html (not a re-implementation) and compares it with fixtures
// captured from the original tool (git show 0ddb37d:propositions.html).
//
// Part 1, tests/fixtures/scoring-baseline.json (unchanged values): every proposition x every preset, all-zero weights and
//   each single-factor weighting x every preference value -> evidence average, lean class and label.
// Part 2, tests/fixtures/scoring-extended.json (VAL-12):
//   - the reason text shown under each lean (r.why, which carries the quality word), and the limited-information flag
//     (limitedWeighted) for the same 1008 cases;
//   - the limited-information flags p.u of every proposition;
//   - qualityWord at every 0.05 step from 1 to 5;
//   - the saved-weight and saved-answer clamp that runs on page load, for valid and invalid stored values;
//   - the slider handler that turns a range input into state.w;
//   - each scoring function is declared exactly once (a second declaration would silently override the first).
//
//   node tests/scoring-regression.mjs [path/to/propositions.html]      compare (exit 1 on any difference)
//   node tests/scoring-regression.mjs --capture <file.html>            rewrite Part 1 from a given file (do not use casually)
//   node tests/scoring-regression.mjs --capture-extended <file.html>   rewrite Part 2 from a given file
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = path.join(root, "tests/fixtures/scoring-baseline.json");
const extFixture = path.join(root, "tests/fixtures/scoring-extended.json");
const SCORING_FNS = ["rated", "totalWeight", "quality", "qualityWord", "offText", "limitedWeighted", "lean"];

function grab(src, re, label) { const m = src.match(re); if (!m) throw new Error("Could not find " + label); return m[0]; }
const fnSrc = (s, n) => grab(s, new RegExp("  function " + n + "\\([\\s\\S]*?\\n  \\}"), n);
const oneLineFn = (s, n) => grab(s, new RegExp("  function " + n + "\\(.*\\n"), n);
const dataBlock = (s) => s.slice(s.indexOf("  var FACTORS = ["), s.indexOf("\n  ];", s.indexOf("  var PROPS = [")) + 5);

export function run(htmlPath) {
  const s = fs.readFileSync(htmlPath, "utf8");
  const block = dataBlock(s);
  const fns = ["rated", "totalWeight", "quality", "qualityWord", "lean"].map((n) => fnSrc(s, n)).join("\n");
  const prefText = grab(s, /  var PREF_TEXT = \{[^}]*\};/, "PREF_TEXT");
  const ctx = { state: { w: {}, g: {} }, out: [] };
  vm.createContext(ctx);
  vm.runInContext(block + "\n" + prefText + "\n" + fns + `
    function setW(w) { FACTORS.forEach(function (f) { state.w[f.k] = w[f.k] || 0; }); }
    var weightSets = PRESETS.map(function (p) { return { name: p.id, w: p.w }; });
    weightSets.push({ name: "all-zero", w: {} });
    FACTORS.forEach(function (f) { var w = {}; w[f.k] = 3; weightSets.push({ name: "only-" + f.k, w: w }); });
    weightSets.forEach(function (ws) {
      setW(ws.w);
      PROPS.forEach(function (p) {
        [null, -2, -1, 0, 1, 2].forEach(function (g) {
          state.g[p.n] = g;
          var r = lean(p);
          out.push([ws.name, p.n, g, r.qu.off ? "off" : r.qu.avg, r.cls, r.label].join("|"));
        });
      });
    });
    this.meta = { presets: PRESETS.map(function (p) { return p.id + ":" + JSON.stringify(p.w); }), props: PROPS.map(function (p) { return p.n + ":" + JSON.stringify(p.s); }) };
  `, ctx);
  return { meta: ctx.meta, results: ctx.out };
}

export function runExtended(htmlPath) {
  const s = fs.readFileSync(htmlPath, "utf8");
  const declared = Object.fromEntries(SCORING_FNS.map((n) => [n, (s.match(new RegExp("\\bfunction " + n + "\\s*\\(", "g")) || []).length]));
  const block = dataBlock(s);
  const prefText = grab(s, /  var PREF_TEXT = \{[^}]*\};/, "PREF_TEXT");
  const fns = ["rated", "totalWeight", "quality", "qualityWord", "lean"].map((n) => fnSrc(s, n)).join("\n") + "\n" + oneLineFn(s, "offText") + oneLineFn(s, "limitedWeighted");
  // Page-load state: KEY, state, applyPreset, defaults, and the clamp of saved values.
  const loadBlock = s.slice(s.indexOf('  var KEY = "ballot-weighing-v2";'), s.indexOf("  function save()"));
  if (loadBlock.length < 50) throw new Error("Could not find the saved-state loader");
  // Slider handler: the code that turns a range input into state.w.
  const slider = grab(s, /  FACTORS\.forEach\(function \(f\) \{\n    \$\("w-" \+ f\.k\)\.addEventListener\("input"[\s\S]*?\n  \}\);/, "slider handler");

  const ctx = { out: [], words: [], u: [] };
  vm.createContext(ctx);
  vm.runInContext(block + "\n" + prefText + "\n" + `var state = { w: {}, g: {} };` + "\n" + fns + `
    function setW(w) { FACTORS.forEach(function (f) { state.w[f.k] = w[f.k] || 0; }); }
    var weightSets = PRESETS.map(function (p) { return { name: p.id, w: p.w }; });
    weightSets.push({ name: "all-zero", w: {} });
    FACTORS.forEach(function (f) { var w = {}; w[f.k] = 3; weightSets.push({ name: "only-" + f.k, w: w }); });
    weightSets.forEach(function (ws) {
      setW(ws.w);
      PROPS.forEach(function (p) {
        [null, -2, -1, 0, 1, 2].forEach(function (g) {
          state.g[p.n] = g;
          var r = lean(p);
          out.push([ws.name, p.n, g, limitedWeighted(p) ? "limited" : "-", r.qu.off ? offText() : "on", r.why].join("|"));
        });
      });
    });
    for (var i = 100; i <= 500; i += 5) words.push((i / 100).toFixed(2) + ":" + qualityWord(i / 100));
    PROPS.forEach(function (p) { u.push(p.n + ":" + JSON.stringify(p.u || {})); });
  `, ctx);

  // Clamp of saved state, run with a fake localStorage.
  const savedCases = [
    ["valid", { w: { nb: 0, ev: 1, lr: 2, ac: 3, if: 4, fc: 5, oc: 5 }, g: { 1: 2, 2: -2, 3: 0, 4: null } }],
    ["fractions", { w: { nb: 2.4, ev: 2.6, lr: 4.5 }, g: { 1: 1.4, 2: -1.6 } }],
    ["out-of-range", { w: { nb: -1, ev: 6, lr: 5.01 }, g: { 1: 3, 2: -3, 3: 2.01 } }],
    ["wrong-types", { w: { nb: "3", ev: null, lr: true }, g: { 1: "1", 2: {} } }],
    ["unknown-keys", { w: { zz: 3, nb: 1 }, g: { 99: 1, 5: 1 } }],
    ["missing-g", { w: { nb: 1 } }],
    ["not-json", "{not json"],
    ["empty", null],
  ];
  const clamp = savedCases.map(([name, v]) => {
    const c = { localStorage: { getItem: () => (v === null ? null : typeof v === "string" ? v : JSON.stringify(v)) } };
    vm.createContext(c);
    vm.runInContext(block + "\n" + loadBlock + "\nthis.result = JSON.stringify(state);", c);
    return name + "|" + c.result;
  });

  // Slider handler with fake elements: set each slider to each value and record state.w after the input event.
  const sc = { saves: 0 };
  vm.createContext(sc);
  vm.runInContext(block + `
    var state = { w: {}, g: {} }; FACTORS.forEach(function (f) { state.w[f.k] = 3; });
    var els = {}; function $(id) { return els[id] || (els[id] = { listeners: {}, addEventListener: function (t, fn) { this.listeners[t] = fn; } }); }
    function save() { saves++; } function renderAll() {}
  ` + "\n" + slider + `
    var log = [];
    FACTORS.forEach(function (f) { ["0", "1", "2", "3", "4", "5"].forEach(function (v) {
      var before = saves; els["w-" + f.k].listeners.input({ target: { value: v } });
      log.push(f.k + "=" + v + "|" + JSON.stringify(state.w) + "|saved:" + (saves - before));
    }); });
    this.slider = log;
  `, sc);

  return { declared, why: ctx.out, qualityWords: ctx.words, limitedFlags: ctx.u, clamp, slider: sc.slider };
}

function compareLists(label, a, b, max = 10) {
  let d = 0;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) { if (d++ < max) console.log(`DIFF ${label}`, a[i], "=>", b[i]); }
  return d;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv[2] === "--capture") {
  const r = run(path.resolve(process.argv[3]));
  fs.writeFileSync(fixture, JSON.stringify({ capturedFrom: path.basename(process.argv[3]), capturedOn: localDate(), ...r }, null, 1) + "\n");
  console.log(`Captured ${r.results.length} results.`);
} else if (isMain && process.argv[2] === "--capture-extended") {
  const r = runExtended(path.resolve(process.argv[3]));
  const label = process.argv[4] || path.basename(process.argv[3]);
  fs.writeFileSync(extFixture, JSON.stringify({ capturedFrom: label, capturedOn: localDate(), ...r }, null, 1) + "\n");
  console.log(`Captured extended fixture: ${r.why.length} reason lines, ${r.qualityWords.length} quality words, ${r.clamp.length} clamp cases, ${r.slider.length} slider cases.`);
} else if (isMain) {
  const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "propositions.html");
  const base = JSON.parse(fs.readFileSync(fixture, "utf8"));
  const now = run(target);
  let diffs = 0;
  if (JSON.stringify(base.meta) !== JSON.stringify(now.meta)) { diffs++; console.log("DIFF presets or ratings changed"); }
  diffs += compareLists("result", base.results, now.results);
  console.log(`${now.results.length} scoring results compared, ${diffs} differences.`);

  let ext = 0;
  const xb = JSON.parse(fs.readFileSync(extFixture, "utf8"));
  const xn = runExtended(target);
  for (const [n, c] of Object.entries(xn.declared)) if (c !== 1) { ext++; console.log(`DIFF function ${n} is declared ${c} times in ${path.basename(target)} (expected exactly once)`); }
  for (const k of ["why", "qualityWords", "limitedFlags", "clamp", "slider"]) ext += compareLists(k, xb[k], xn[k], 5);
  console.log(`${xn.why.length} reason and limited-flag lines, ${xn.qualityWords.length} quality words, ${xn.limitedFlags.length} limited-flag sets, ${xn.clamp.length} saved-state cases, ${xn.slider.length} slider cases compared, ${ext} differences.`);
  process.exit(diffs || ext ? 1 : 0);
}
