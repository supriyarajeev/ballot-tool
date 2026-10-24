// Runs every check in order, even when an earlier one fails, then prints a summary. Exit 1 if any step failed.
//   node tests/run-all.mjs        (npm test)
// Nothing here writes to tracked files. To regenerate the generated files on purpose, run npm run build.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STEPS = [
  ["generated files match their generators", ["tests/check-generated.mjs"]],
  ["data validation", ["tools/validate.mjs"]],
  ["validator self-test", ["tests/validator.test.mjs"]],
  ["scoring regression", ["tests/scoring-regression.mjs"]],
  ["static HTML validation", [path.join("node_modules", "html-validate", "bin", "html-validate.js"), "index.html", "propositions.html"]],
  ["browser tests", ["tests/browser/run.mjs"]],
];
const summary = [];
for (const [name, args] of STEPS) {
  console.log(`\n=== ${name}: node ${args.join(" ")}`);
  const t = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit", env: process.env });
  summary.push([name, r.status === 0 ? "pass" : `FAIL (exit ${r.status ?? r.signal})`, ((Date.now() - t) / 1000).toFixed(1) + " s"]);
}
console.log("\n=== Summary");
summary.forEach(([n, s, t]) => console.log(`${s.padEnd(16)} ${n} (${t})`));
process.exit(summary.some((x) => x[1] !== "pass") ? 1 : 0);
