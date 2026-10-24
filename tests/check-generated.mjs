// Check mode for generated files (VAL-09). Regenerates statewide.json, the source register, the evidence ledger
// and the docs into a temporary folder, then fails if any differ from the committed files. Writes nothing in the repo.
//   node tests/check-generated.mjs        (npm run check)
// To update the committed files on purpose, run: npm run build
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENERATED = [
  "data/2026-11-03/statewide.json",
  "data/sources.json",
  "data/evidence.json",
  "docs/JURISDICTION-INVENTORY.md",
  "docs/COVERAGE-REPORT.md",
  "docs/SOURCE-REGISTER.md",
  "docs/EVIDENCE-LEDGER.md",
  "docs/MEASURE-AUDIT.md",
  "docs/CANDIDATE-AUDIT.md",
];
// Inputs the generators read. The generators locate the site from their own path, so they run from the copy.
const INPUTS = ["data", "docs", "tools", "propositions.html", "audit/2026-10-22/statewide-changes.json", "tests/fixtures/candidate-order.json"];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ballot-check-"));
try {
  for (const p of INPUTS) {
    const from = path.join(root, p);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true });
    fs.cpSync(from, path.join(tmp, p), { recursive: true });
  }
  for (const t of ["tools/extract-statewide.mjs", "tools/build-ledger.mjs", "tools/report.mjs"]) {
    const r = spawnSync(process.execPath, [path.join(tmp, t)], { cwd: tmp, encoding: "utf8" });
    if (r.status !== 0) { console.log(`FAIL ${t} exited ${r.status}\n${r.stdout}${r.stderr}`); process.exit(1); }
  }
  const stale = [];
  for (const p of GENERATED) {
    const a = fs.existsSync(path.join(root, p)) ? fs.readFileSync(path.join(root, p), "utf8") : null;
    const b = fs.readFileSync(path.join(tmp, p), "utf8");
    if (a === b) continue;
    let detail = "missing in repo";
    if (a !== null) {
      const al = a.split("\n"), bl = b.split("\n");
      const i = al.findIndex((l, k) => l !== bl[k]);
      const at = i < 0 ? Math.min(al.length, bl.length) : i;
      detail = `first difference at line ${at + 1}\n    committed:   ${(al[at] ?? "(end of file)").slice(0, 160)}\n    regenerated: ${(bl[at] ?? "(end of file)").slice(0, 160)}`;
    }
    stale.push(`${p}: ${detail}`);
  }
  if (stale.length) {
    console.log(`FAIL ${stale.length} generated file(s) differ from what the generators produce. Run npm run build and commit the result.`);
    stale.forEach((s) => console.log("  " + s));
    process.exit(1);
  }
  console.log(`generated files: ${GENERATED.length} checked, all match their generators.`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
