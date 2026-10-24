// Self-test for tools/validate.mjs (VAL-14). It checks that each rule fires, with the right message, for the record that was broken.
//   node tests/validator.test.mjs            run every plant
//   node tests/validator.test.mjs --list     list the plants
// How it works:
//   1. Copy data/, propositions.html and the candidate-order fixture into a temporary base folder.
//   2. Rebuild the evidence ledger there and record the candidate order, so the base reflects the current source data.
//      This makes the self-test about the validator, not about whether the committed generated files are current
//      (npm run check covers that).
//   3. Run the validator on the base. Its ERROR and WARN lines are the baseline. A clean baseline is one test.
//   4. For each plant: copy the base, break one thing, optionally rebuild the ledger, run the validator, and require
//      (a) exit 1 for error plants, and (b) a NEW error or warning line, not in the baseline, matching the pattern.
//      Patterns name the broken record's id, so a different rule that happens to fire does not count.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(root, "tools/validate.mjs");
const ledger = path.join(root, "tools/build-ledger.mjs");
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ballot-validate-"));
let pass = 0, fail = 0;
const results = [];

const rd = (dir, p) => JSON.parse(fs.readFileSync(path.join(dir, p), "utf8"));
const wr = (dir, p, v) => fs.writeFileSync(path.join(dir, p), JSON.stringify(v, null, 1));
const run = (dir) => spawnSync(process.execPath, [validator], { env: { ...process.env, VALIDATE_ROOT: dir }, encoding: "utf8", timeout: 20000 });
const rebuild = (dir) => { const r = spawnSync(process.execPath, [ledger, "--root", dir], { encoding: "utf8" }); if (r.status !== 0) throw new Error("ledger rebuild failed: " + r.stderr); };
const lines = (r, kind) => (r.stdout || "").split("\n").filter((l) => l.startsWith(kind));

// ---------- base sandbox ----------
const base = path.join(tmpRoot, "base");
fs.mkdirSync(path.join(base, "tests/fixtures"), { recursive: true });
fs.cpSync(path.join(root, "data"), path.join(base, "data"), { recursive: true });
fs.copyFileSync(path.join(root, "propositions.html"), path.join(base, "propositions.html"));
rebuild(base);
spawnSync(process.execPath, [validator, "--update-candidate-order"], { env: { ...process.env, VALIDATE_ROOT: base }, encoding: "utf8" });
const baseRun = run(base);
const baseErr = new Set(lines(baseRun, "ERROR")), baseWarn = new Set(lines(baseRun, "WARN"));
if (baseRun.status === 0) { pass++; results.push("PASS baseline: current source data validates"); }
else {
  fail++;
  console.log(`FAIL baseline: the current source data has ${baseErr.size} validator errors (plants below still test only new errors):`);
  [...baseErr].slice(0, 8).forEach((l) => console.log("  " + l));
}

function sandbox() { const d = fs.mkdtempSync(path.join(tmpRoot, "case-")); fs.cpSync(base, d, { recursive: true }); return d; }
function plant(kind, name, mutate, pattern, opts = {}) {
  if (process.argv.includes("--list")) { console.log(kind, name); return; }
  const dir = sandbox();
  try {
    mutate(dir);
    if (opts.rebuild) rebuild(dir);
    const r = run(dir);
    const fresh = kind === "warn" ? lines(r, "WARN").filter((l) => !baseWarn.has(l)) : lines(r, "ERROR").filter((l) => !baseErr.has(l));
    let ok, why = "";
    if (kind === "error") { ok = r.status === 1 && fresh.some((l) => pattern.test(l)); why = r.error ? `validator did not finish (${r.error.code})` : `exit ${r.status}`; }
    else if (kind === "warn") { ok = fresh.some((l) => pattern.test(l)); why = `exit ${r.status}`; }
    else { ok = !lines(r, "ERROR").concat(lines(r, "WARN")).some((l) => pattern.test(l)); why = "rule fired on valid data"; } // "none": the rule must NOT fire
    if (ok) { pass++; results.push(`PASS ${name}`); }
    else { fail++; console.log(`FAIL ${name}: ${why}\n  expected ${kind} ${pattern}\n  new lines: ${(kind === "none" ? lines(r, "ERROR").concat(lines(r, "WARN")).filter((l) => pattern.test(l)) : fresh).slice(0, 3).join("\n  ") || "(none)"}`); }
  } catch (e) { fail++; console.log(`FAIL ${name}: plant could not be applied (${e.message})`); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const E = (n, m, p, o) => plant("error", n, m, p, o), W = (n, m, p, o) => plant("warn", n, m, p, o), N = (n, m, p, o) => plant("none", n, m, p, o);

const LM = "data/2026-11-03/local-measures.json", SW = "data/2026-11-03/statewide.json", CT = "data/2026-11-03/contests.json", CA = "data/2026-11-03/candidates.json";
const JU = "data/jurisdictions.json", EV = "data/evidence.json", EC = "data/evidence-claims.json", EL = "data/elections.json", RG = "data/region.json", SR = "data/sources.json", SA = "data/source-access.json", FX = "tests/fixtures/candidate-order.json";
const edit = (p, fn) => (dir) => { const d = rd(dir, p); fn(d); wr(dir, p, d); };
const txt = (p, fn) => (dir) => { const f = path.join(dir, p); fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8"))); };
const j = (d, id) => { const x = d.jurisdictions.find((v) => v.id === id); if (!x) throw new Error("no jurisdiction " + id); return x; };
const m = (d, id) => { const x = d.items.find((v) => v.id === id); if (!x) throw new Error("no measure " + id); return x; };
const claim = (d, id) => { const x = d.claims.find((v) => v.id === id); if (!x) throw new Error("no claim " + id); return x; };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SFA = "2026-11-03.ca-sf-city.a", RTM = "2026-11-03.ca-bayarea-rtm.measure-rtm", GOV = "2026-11-03.ca.governor", P1C = "evc-prop1-cost";
const jIdx = (dir, id) => rd(dir, JU).jurisdictions.findIndex((v) => v.id === id);

// ---------- VAL-01 parent cycles ----------
E("parent cycle is reported, not a hang", edit(JU, (d) => (j(d, "ca-alameda-oakland").parent = "ca-alameda-oakland-council-district-2")), /jurisdiction ca-alameda-oakland(-council-district-2)?: parent cycle/);
E("self-parent cycle", edit(JU, (d) => (j(d, "ca-marin-novato").parent = "ca-marin-novato")), /jurisdiction ca-marin-novato: parent cycle/);

// ---------- VAL-02 geography ----------
E("city parent is a school district", edit(JU, (d) => (j(d, "ca-alameda-oakland").parent = "ca-alameda-sd-dublin-unified-school-district")), /jurisdiction ca-alameda-oakland: a city's parent must be a county/);
E("county parent is another county", edit(JU, (d) => (j(d, "ca-napa").parent = "ca-sonoma")), /jurisdiction ca-napa: a county's parent must be a state/);
E("council district parent is a county", edit(JU, (d) => (j(d, "ca-alameda-oakland-council-district-2").parent = "ca-alameda")), /jurisdiction ca-alameda-oakland-council-district-2: a council-district's parent must be a city/);
E("state with a parent", edit(JU, (d) => (j(d, "ca").parent = "ca-alameda")), /jurisdiction ca: the state has no parent/);
E("missing parent", edit(JU, (d) => delete j(d, "ca-alameda-fremont").parent), /jurisdiction ca-alameda-fremont: missing parent/);
E("parent does not exist", edit(JU, (d) => (j(d, "ca-alameda-fremont").parent = "ca-nowhere")), /jurisdiction ca-alameda-fremont: parent "ca-nowhere" does not exist/);
E("invalid jurisdiction type", edit(JU, (d) => (j(d, "ca-alameda-fremont").type = "village")), /\(ca-alameda-fremont\): invalid type "village"/);
E("duplicate city name in a county", edit(JU, (d) => d.jurisdictions.push({ id: "ca-alameda-oakland-2", name: "Oakland ", type: "city", parent: "ca-alameda" })), /county ca-alameda: duplicate city name "oakland" \(ca-alameda-oakland, ca-alameda-oakland-2\)/);
E("Bay Area county loses its region tag", edit(JU, (d) => delete j(d, "ca-napa").region), /county ca-napa: listed in data\/region\.json but region is/);
E("non-Bay county tagged bay-area", edit(JU, (d) => (j(d, "ca-fresno").region = "bay-area")), /county ca-fresno: region is "bay-area" but it is not in data\/region\.json/);
E("region.json missing", (dir) => fs.rmSync(path.join(dir, RG)), /data\/region\.json: file not found/);
E("region.json lists 8 counties", edit(RG, (d) => (d.counties = d.counties.filter((c) => c !== "ca-napa"))), /data\/region\.json: counties must list exactly 9 counties \(found 8\)/);
E("region.json swaps in a non-Bay county", edit(RG, (d) => (d.counties = d.counties.map((c) => (c === "ca-napa" ? "ca-fresno" : c)))), /data\/region\.json: counties must be the nine Bay Area counties \(missing: ca-napa; not Bay Area: ca-fresno\)/);
E("region.json lists a county twice", edit(RG, (d) => d.counties.push("ca-napa")), /data\/region\.json: county "ca-napa" listed twice/);
E("region.json lists a city as a county", edit(RG, (d) => (d.counties[0] = "ca-alameda-oakland")), /data\/region\.json: "ca-alameda-oakland" is a city, not a county/);
E("region.json countyCount wrong", edit(RG, (d) => (d.countyCount = 8)), /data\/region\.json: countyCount is 8 but counties lists 9/);
E("region.json municipalityCount wrong", edit(RG, (d) => (d.municipalityCount = 100)), /data\/region\.json: municipalityCount is 100 but the data has \d+ city records/);
E("extra city changes the municipality count", edit(JU, (d) => d.jurisdictions.push({ id: "ca-napa-plantville", name: "Plantville", type: "city", parent: "ca-napa" })), /data\/region\.json: municipalityCount is \d+ but the data has \d+ city records/);
E("region.json schemaVersion", edit(RG, (d) => (d.schemaVersion = 2)), /data\/region\.json: schemaVersion must be 1/);
E("region.json wrong id", edit(RG, (d) => (d.id = "norcal")), /data\/region\.json: id must be "bay-area"/);
E("region.json no facts", edit(RG, (d) => (d.facts = [])), /data\/region\.json: facts must be a non-empty array/);
E("region fact with http URL", edit(RG, (d) => (d.facts[0].url = "http://mtc.ca.gov/about-mtc/what-mtc")), /data\/region\.json facts\[0\]: url must be https/);
E("region fact without publisher", edit(RG, (d) => delete d.facts[0].publisher), /data\/region\.json facts\[0\]: missing publisher/);
E("region fact retrieved in the future", edit(RG, (d) => (d.facts[0].retrieved = "2099-01-01")), /data\/region\.json facts\[0\]: retrieved 2099-01-01 is after today/);
W("region fact text contradicts municipalityCount", edit(RG, (d) => (d.facts[0].text = "The Bay Area is home to 102 cities and nine counties.")), /data\/region\.json facts\[0\]: text says 102 cities but municipalityCount is \d+/);
W("region fact text contradicts countyCount", edit(RG, (d) => (d.facts[0].text = "The Bay Area is home to 101 cities and ten counties.")), /data\/region\.json facts\[0\]: text says ten counties but countyCount is 9/);
E("cityInventory complete with the wrong count", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "complete", count: 12, source: "https://census.bayareametro.gov/cities-counties", checked: "2026-10-23" })), /county ca-marin: cityInventory is "complete" with count 12, but the data has 11 cities/);
E("cityInventory complete without a source", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "complete", count: 11, checked: "2026-10-23" })), /county ca-marin: cityInventory "complete" needs an https source/);
E("cityInventory complete without a checked date", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "complete", count: 11, source: "https://census.bayareametro.gov/cities-counties" })), /county ca-marin: cityInventory\.checked must be a real YYYY-MM-DD date/);
E("cityInventory missing", edit(JU, (d) => delete j(d, "ca-fresno").cityInventory), /county ca-fresno: missing cityInventory/);
E("cityInventory invalid status", edit(JU, (d) => (j(d, "ca-fresno").cityInventory = { status: "done" })), /county ca-fresno: cityInventory\.status must be one of/);
E("cityInventory partial below recorded cities", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "partial", count: 3, source: "https://census.bayareametro.gov/cities-counties", checked: "2026-10-23" })), /county ca-marin: cityInventory "partial" count 3 is below the 11 cities/);
W("cityInventory note contradicts count", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "complete", count: 11, source: "https://census.bayareametro.gov/cities-counties", checked: "2026-10-23", note: "Matches the official list of 12 cities and towns." })), /county ca-marin: cityInventory\.note says 12 cities and towns but the data has 11/);
E("unincorporated.listed not boolean", edit(JU, (d) => (j(d, "ca-marin").unincorporated = { listed: "yes", source: "https://census.bayareametro.gov/cities-counties" })), /county ca-marin: unincorporated\.listed must be true or false/);
E("unincorporated without source", edit(JU, (d) => (j(d, "ca-marin").unincorporated = { listed: true })), /county ca-marin: unincorporated needs an https source/);
E("Bay county without unincorporated", edit(JU, (d) => delete j(d, "ca-marin").unincorporated), /county ca-marin: Bay Area county needs unincorporated/);
E("consolidatedCity is a city of another county", edit(JU, (d) => (j(d, "ca-sf").consolidatedCity = "ca-alameda-oakland")), /county ca-sf: consolidatedCity "ca-alameda-oakland" must be a city of this county/);
E("consolidated city and county lists an unincorporated area", edit(JU, (d) => { j(d, "ca-sf").consolidatedCity = "ca-sf-city"; j(d, "ca-sf").unincorporated = { listed: true, source: "https://census.bayareametro.gov/cities-counties" }; }), /county ca-sf: a consolidated city and county has no unincorporated area/);
E("municipalityType invalid", edit(JU, (d) => (j(d, "ca-marin-ross").municipalityType = "village")), /jurisdiction ca-marin-ross: municipalityType must be "city" or "town"/);
E("municipalityType on a county", edit(JU, (d) => (j(d, "ca-marin").municipalityType = "town")), /jurisdiction ca-marin: municipalityType is only for city records/);
E("district area in another county", edit(JU, (d) => (j(d, "ca-alameda-sd-dublin-unified-school-district").areas = ["ca-marin-novato"])), /jurisdiction ca-alameda-sd-dublin-unified-school-district: area "ca-marin-novato" is in ca-marin, outside this district's county/);
E("district area is not a city", edit(JU, (d) => (j(d, "ca-alameda-sd-dublin-unified-school-district").areas = ["ca-alameda"])), /jurisdiction ca-alameda-sd-dublin-unified-school-district: area "ca-alameda" is a county; areas must be cities/);
E("district area does not exist", edit(JU, (d) => (j(d, "ca-alameda-sd-dublin-unified-school-district").areas = ["ca-nope"])), /jurisdiction ca-alameda-sd-dublin-unified-school-district: area "ca-nope" does not exist/);
E("counties entry is a city", edit(JU, (d) => j(d, "ca-bayarea-rtm").counties.push("ca-alameda-oakland")), /jurisdiction ca-bayarea-rtm: counties entry "ca-alameda-oakland" is a city, not a county/);
E("counties entry does not exist", edit(JU, (d) => j(d, "ca-bayarea-rtm").counties.push("ca-nope")), /jurisdiction ca-bayarea-rtm: county "ca-nope" does not exist/);

// ---------- county coverage and inventory ----------
E("county missing coverage status", edit(JU, (d) => (j(d, "ca-fresno").coverage.status = "full")), /\(ca-fresno\): county needs coverage\.status/);
E("county missing electionsUrl", edit(JU, (d) => delete j(d, "ca-fresno").electionsUrl), /\(ca-fresno\): county needs an electionsUrl/);
E("invalid inventory value", edit(JU, (d) => (j(d, "ca-fresno").inventory.measures = "some")), /\(ca-fresno\): inventory\.measures must be one of/);
E("lookupUrl http", edit(JU, (d) => (j(d, "ca-alameda").lookupUrl = "http://www.alamedacountyca.gov/rovmvp_app/mvp.do")), /\(ca-alameda\): lookupUrl must be https/);
E("coverage says not collected but data exists", edit(JU, (d) => (j(d, "ca-marin").inventory.measures = "not-collected")), /county ca-marin: has \d+ local measures but inventory\.measures is "not-collected"/);
E("inventory collected with no measures", edit(JU, (d) => (j(d, "ca-fresno").inventory.measures = "collected")), /county ca-fresno: inventory\.measures is "collected" but no local measures are recorded/);
E("coverage not-started with measures", edit(JU, (d) => (j(d, "ca-marin").coverage.status = "not-started")), /county ca-marin: coverage "not-started" but \d+ local measures/);
E("coverage pilot with no measures", edit(JU, (d) => (j(d, "ca-fresno").coverage.status = "pilot")), /county ca-fresno: coverage "pilot" but no local measures are recorded/);
E("reconciled without records", edit(JU, (d) => (j(d, "ca-marin").inventory.measures = "reconciled")), /county ca-marin: "reconciled" needs inventory\.reconciledWith/);
E("none-found-confirmed without a source", edit(JU, (d) => { j(d, "ca-fresno").inventory.measures = "none-found-confirmed"; delete j(d, "ca-fresno").sources; }), /county ca-fresno: "none-found-confirmed" needs a source/);
E("contest inventory says not collected but contests exist", edit(JU, (d) => (j(d, "ca-sf").inventory.contests = "not-collected")), /county ca-sf: \d+ local contests recorded but inventory\.contests is "not-collected"/);
E("contest inventory collected with no contests", edit(JU, (d) => (j(d, "ca-fresno").inventory.contests = "collected")), /county ca-fresno: inventory\.contests is "collected" but no local contests are recorded/);

// ---------- VAL-11 / VAL-16 coverage text vs numbers ----------
E("reconciliation numbers do not add up", edit(JU, (d) => (j(d, "ca-alameda").inventory.reconciliation.pagesReached = 3)), /county ca-alameda: reconciliation pagesReached \(3\) \+ notReachable \(\d+\) must equal pagesChecked/);
W("summary says not every page reached when all were", edit(JU, (d) => { const r = j(d, "ca-alameda").inventory.reconciliation; r.pagesReached = r.pagesChecked; r.notReachable = 0; r.summary = "Partial cross-check. Not every city and district was reached, so the list is not reconciled."; }), /county ca-alameda: reconciliation\.summary says not every page was reached/);
W("summary says every page reached when some were not", edit(JU, (d) => { const r = j(d, "ca-alameda").inventory.reconciliation; r.pagesChecked = 14; r.pagesReached = 10; r.notReachable = 4; r.summary = "Every city and district page was reached."; }), /county ca-alameda: reconciliation\.summary says every page was reached, but notReachable is 4/);
W("coverage note says not collected while collected", edit(JU, (d) => (j(d, "ca-sf").coverage.note = "Local measures have not been collected yet.")), /county ca-sf: coverage\.note says measures are not collected, but inventory\.measures is "collected"/);
W("coverage note count is wrong", edit(JU, (d) => (j(d, "ca-marin").coverage.note = "All 99 local measures are listed from the official county page.")), /county ca-marin: coverage\.note says 99 local measures/);
W("coverage note ballot-question count is wrong", edit(JU, (d) => (j(d, "ca-marin").coverage.note = "Measures are listed; 99 now have an official ballot question or vote threshold.")), /county ca-marin: coverage\.note says 99 have a ballot question or threshold/);
W("coverage note claims reconciled", edit(JU, (d) => (j(d, "ca-marin").coverage.note = "The list is reconciled with city records.")), /county ca-marin: coverage\.note says reconciled/);
W("coverage note says all listed while not collected", edit(JU, (d) => (j(d, "ca-fresno").coverage.note = "All local measures are listed.")), /county ca-fresno: coverage\.note says all local measures are listed, but inventory\.measures is "not-collected"/);
W("listComplete true while not collected", edit(JU, (d) => (j(d, "ca-fresno").coverage.listComplete = true)), /county ca-fresno: coverage\.listComplete is true, but inventory\.measures is "not-collected"/);

// ---------- VAL-06 dates ----------
E("impossible date 2026-02-30", edit(LM, (d) => (m(d, SFA).lastVerified = "2026-02-30")), new RegExp(esc(SFA) + ": lastVerified must be a real YYYY-MM-DD date"));
E("future lastVerified", edit(LM, (d) => (m(d, SFA).lastVerified = "2099-06-01")), new RegExp(esc(SFA) + ": lastVerified 2099-06-01 is after today"));
E("future inventory.lastChecked", edit(JU, (d) => (j(d, "ca-sf").inventory.lastChecked = "2099-01-01")), /\(ca-sf\): inventory\.lastChecked 2099-01-01 is after today/);
E("impossible inventory.lastChecked", edit(JU, (d) => (j(d, "ca-sf").inventory.lastChecked = "2026-13-01")), /\(ca-sf\): inventory\.lastChecked must be a real YYYY-MM-DD date/);
E("future reconciliation date", edit(JU, (d) => (j(d, "ca-alameda").inventory.reconciliation.date = "2099-01-01")), /county ca-alameda: inventory\.reconciliation\.date 2099-01-01 is after today/);
E("future cityInventory.checked", edit(JU, (d) => (j(d, "ca-marin").cityInventory = { status: "complete", count: 11, source: "https://census.bayareametro.gov/cities-counties", checked: "2099-01-01" })), /county ca-marin: cityInventory\.checked 2099-01-01 is after today/);
E("future claim retrieved date (ledger rebuilt)", edit(EC, (d) => (claim(d, P1C).retrieved = "2099-01-01")), new RegExp(`evidence ${P1C}: retrieved 2099-01-01 is after today`), { rebuild: true });
E("future source retrieved date", edit(SR, (d) => (d.sources[0].retrieved = "2099-01-01")), /source src-[0-9a-f]+: retrieved 2099-01-01 is after today/);
E("impossible source documentDate", edit(SR, (d) => (d.sources[0].documentDate = "2026-02-31")), /source src-[0-9a-f]+: documentDate must be a real YYYY-MM-DD date or null/);
E("future review.date", edit(LM, (d) => { const x = m(d, SFA); x.status = "verified"; x.review = { reviewer: "A. Person", date: "2099-01-01" }; }), new RegExp(esc(SFA) + ": review\\.date 2099-01-01 is after today"));
E("future evidence reviewDate", edit(EV, (d) => { const e = d.evidence.find((x) => x.linkLevel === "claim"); e.reviewDate = "2099-01-01"; }), /evidence [^:]+: reviewDate 2099-01-01 is after today/);

// ---------- VAL-07 candidates and order ----------
E("candidate order changed", edit(CT, (d) => d.contests.find((c) => c.id === GOV).candidates.reverse()), new RegExp(`contest ${esc(GOV)}: candidate order changed from the recorded order`));
E("same candidate listed twice", edit(CT, (d) => { const c = d.contests.find((x) => x.id === GOV); c.candidates.push(c.candidates[0]); }), new RegExp(`${esc(GOV)}: candidate "[^"]+" is listed more than once`));
E("contest with no recorded order", edit(FX, (d) => delete d.contests[GOV]), new RegExp(`contest ${esc(GOV)}: no recorded candidate order`));
E("recorded contest removed from data", edit(FX, (d) => (d.contests["2026-11-03.ca.plant"] = ["x"])), /contest 2026-11-03\.ca\.plant: in tests\/fixtures\/candidate-order\.json but no longer in the data/);
E("candidate order fixture missing", (dir) => fs.rmSync(path.join(dir, FX)), /tests\/fixtures\/candidate-order\.json is missing or invalid/);
E("candidate in unknown contest", edit(CA, (d) => (d.candidates[0].contest = "2026-11-03.ca.nope")), new RegExp(esc(rdBase(CA).candidates[0].id) + ': contest "2026-11-03\\.ca\\.nope" does not exist'));
E("contest lists missing candidate", edit(CT, (d) => d.contests.find((c) => c.id === GOV).candidates.push("2026-11-03.ca.ghost")), new RegExp(`${esc(GOV)}: candidate "2026-11-03\\.ca\\.ghost" does not exist`));
E("candidate not listed by its contest", edit(CT, (d) => d.contests.find((c) => c.id === GOV).candidates.pop()), /: contest 2026-11-03\.ca\.governor does not list this candidate/);
E("contest candidates not an array", edit(CT, (d) => (d.contests.find((c) => c.id === GOV).candidates = "x")), new RegExp(`${esc(GOV)}: candidates must be an array`));
E("contest election mismatch", edit(CT, (d) => (d.contests.find((c) => c.id === GOV).election = "2028-11-07")), new RegExp(`${esc(GOV)}: election mismatch`));
E("contest unknown jurisdiction", edit(CT, (d) => (d.contests.find((c) => c.id === GOV).jurisdiction = "ca-nope")), new RegExp(`${esc(GOV)}: unknown jurisdiction "ca-nope"`));
E("candidate statementUrl http", edit(CA, (d) => (d.candidates.find((c) => c.statementUrl).statementUrl = "http://voterguide.sos.ca.gov/x")), /: statementUrl must be https/);
E("candidate financeUrl http", edit(CA, (d) => (d.candidates[0].financeUrl = "http://powersearch.sos.ca.gov/x")), /: financeUrl must be https/);

// ---------- records ----------
E("duplicate id", edit(LM, (d) => d.items.push({ ...d.items[0] })), new RegExp(`Duplicate id "${esc(SFA)}"`));
E("missing required field", edit(LM, (d) => delete m(d, SFA).identifier), new RegExp(esc(SFA) + ': missing "identifier"'));
E("invalid status", edit(LM, (d) => (m(d, SFA).status = "done")), new RegExp(esc(SFA) + ': invalid status "done"'));
E("verified without human review", edit(LM, (d) => (m(d, SFA).status = "verified")), new RegExp(esc(SFA) + ': "verified" requires review\\.reviewer'));
E("needs-review with neither notes nor gaps", edit(LM, (d) => { const x = m(d, RTM); x.gaps = []; delete x.notes; }), new RegExp(esc(RTM) + ': status "needs-review" must explain the gap'));
E("incomplete without gaps", edit(LM, (d) => (m(d, SFA).gaps = [])), new RegExp(esc(SFA) + ': "incomplete" records must list the missing information'));
E("generic gap: Human review", edit(LM, (d) => m(d, SFA).gaps.push("Human review against the official voter guide")), new RegExp(esc(SFA) + ': replace the generic gap "Human review'));
E("generic gap: a person's review (VAL-15)", edit(LM, (d) => m(d, SFA).gaps.push("A person's review of the audited fields and excerpts against the official sources")), new RegExp(esc(SFA) + ": replace the generic gap \"A person's review"));
E("generic gap: needs review", edit(LM, (d) => m(d, SFA).gaps.push("Needs independent review")), new RegExp(esc(SFA) + ': replace the generic gap "Needs independent review"'));
E("generic gap: not yet verified", edit(LM, (d) => m(d, SFA).gaps.push("Not yet verified.")), new RegExp(esc(SFA) + ': replace the generic gap "Not yet verified\\."'));
N("specific gap is not flagged as generic", edit(LM, (d) => m(d, SFA).gaps.push("Review the vote threshold on page 3 of the city attorney's analysis")), new RegExp(esc(SFA) + ": replace the generic gap"));
W("duplicate gap", edit(LM, (d) => { const x = m(d, SFA); x.gaps.push(x.gaps[0]); }), new RegExp(esc(SFA) + ": gap listed twice"));
E("superseded without successor", edit(LM, (d) => (m(d, SFA).status = "superseded")), new RegExp(esc(SFA) + ': "superseded" requires supersededBy'));
E("not-applicable without notes and source", edit(LM, (d) => { const x = m(d, SFA); x.status = "not-applicable"; delete x.notes; }), new RegExp(esc(SFA) + ': "not-applicable" requires notes and a supporting source'));
E("no title", edit(LM, (d) => { const x = m(d, SFA); delete x.officialTitle; delete x.shortTitle; }), new RegExp(esc(SFA) + ": needs officialTitle or shortTitle"));
E("wrong election on record", edit(LM, (d) => (m(d, SFA).election = "2028-11-07")), new RegExp(esc(SFA) + ': election "2028-11-07" does not match'));
E("unknown jurisdiction", edit(LM, (d) => (m(d, SFA).jurisdiction = "ca-nowhere")), new RegExp(esc(SFA) + ': unknown jurisdiction "ca-nowhere"'));
E("invalid level", edit(LM, (d) => (m(d, SFA).level = "planet")), new RegExp(esc(SFA) + ': invalid level "planet"'));
E("level does not match jurisdiction type", edit(LM, (d) => (m(d, SFA).level = "county")), new RegExp(esc(SFA) + ': level "county" does not match jurisdiction type "city"'));
E("id without election prefix", edit(LM, (d) => { d.items.push({ ...m(d, SFA), id: "plant.ca-sf-city.a" }); }), /plant\.ca-sf-city\.a: id should start with "2026-11-03\."/);
E("malformed source URL", edit(LM, (d) => (m(d, SFA).sources[0].url = "https://nodot")), new RegExp(esc(SFA) + ": source 1 URL is missing, malformed or not https"));
E("http source URL", edit(LM, (d) => (m(d, SFA).sources[0].url = "http://example.com/x")), new RegExp(esc(SFA) + ": source 1 URL is missing, malformed or not https"));
E("source without label", edit(LM, (d) => delete m(d, SFA).sources[0].label), new RegExp(esc(SFA) + ": source 1 has no label"));
E("missing sources", edit(LM, (d) => (m(d, SFA).sources = [])), new RegExp(esc(SFA) + ': status "incomplete" requires at least one official source'));
E("sources not an array", edit(LM, (d) => (m(d, SFA).sources = "x")), new RegExp(esc(SFA) + ": sources must be an array"));
E("verified without an Official source", edit(LM, (d) => { const x = m(d, SFA); x.status = "verified"; x.review = { reviewer: "A. Person", date: "2026-10-22" }; x.sources.forEach((s) => (s.type = "News")); }), new RegExp(esc(SFA) + ': verified records need at least one source typed "Official"'));
E("verified without plainEnglish", edit(LM, (d) => { const x = m(d, SFA); x.status = "verified"; x.review = { reviewer: "A. Person", date: "2026-10-22" }; delete x.plainEnglish; }), new RegExp(esc(SFA) + ': verified items need "plainEnglish"'));
E("verified record without claim-level evidence", edit(LM, (d) => { const x = m(d, SFA); x.status = "verified"; x.review = { reviewer: "A. Person", date: "2026-10-22" }; }), new RegExp(esc(SFA) + ': verified record has no claim-level evidence for "'));
E("bad detailUrl anchor", edit(SW, (d) => (d.items[0].detailUrl = "propositions.html#prop-99")), /2026-11-03\.ca\.prop-1: detailUrl anchor prop-99 is not rendered/);
E("malformed detailUrl", edit(SW, (d) => (d.items[0].detailUrl = "index.html#prop-1")), /2026-11-03\.ca\.prop-1: detailUrl must look like propositions\.html#prop-N/);

// ---------- elections ----------
E("election id and date differ", edit(EL, (d) => (d.elections[0].date = "2026-11-04")), /\(2026-11-03\): election id and date must match/);
E("election date impossible", edit(EL, (d) => (d.elections[0].date = "2026-02-30")), /\(2026-11-03\): invalid date/);
E("election status invalid", edit(EL, (d) => (d.elections[0].status = "soon")), /\(2026-11-03\): status must be current, past or upcoming/);
E("election files missing", edit(EL, (d) => delete d.elections[0].files), /election 2026-11-03: files\.measures, files\.contests and files\.candidates are required/);
E("election source http", edit(EL, (d) => (d.elections[0].sources[0].url = "http://www.sos.ca.gov/x")), /\(2026-11-03\): source 1 URL is missing, malformed or not https/);

// ---------- VAL-08 https on every URL field ----------
E("http in a jurisdiction source (ledger not rebuilt)", (dir) => { const i = jIdx(dir, "ca-marin-spd-county-services-area-27-ross-valley-paramedic-authority"); edit(JU, (d) => (d.jurisdictions[i].sources[0].url = "http://www.marincounty.gov/plant"))(dir); }, /data\/jurisdictions\.json jurisdictions\.\d+\.sources\.0\.url: URL must be https/);
E("http in county citySource", edit(JU, (d) => (j(d, "ca-alameda").citySource = "http://acgov.org/about/cities.htm")), /data\/jurisdictions\.json jurisdictions\.\d+\.citySource: URL must be https/);
E("malformed cityInventory source", edit(JU, (d) => (j(d, "ca-marin").cityInventory.source = "census list")), /data\/jurisdictions\.json jurisdictions\.\d+\.cityInventory\.source: URL is malformed or not https/);
E("http electionsUrl without a documented exception", edit(JU, (d) => (j(d, "ca-fresno").electionsUrl = "http://www.fresnocountyca.gov/plant")), /data\/jurisdictions\.json jurisdictions\.\d+\.electionsUrl: URL must be https \(http:\/\/www\.fresnocountyca\.gov\/plant\)/);
N("documented http electionsUrl exception is allowed", (dir) => {}, /electionsUrl(Previous)?: URL must be https/);
E("http in a contest source", edit(CT, (d) => (d.contests[0].sources[0].url = "http://elections.cdn.sos.ca.gov/x.pdf")), /contests\.json contests\.0\.sources\.0\.url: URL must be https/);
E("http in a claim url (ledger not rebuilt)", edit(EC, (d) => (claim(d, P1C).url = "http://voterguide.sos.ca.gov/propositions/1/analysis.htm")), /data\/evidence-claims\.json claims\.\d+\.url: URL must be https/);
E("http in a claim url (ledger rebuilt)", edit(EC, (d) => (claim(d, P1C).url = "http://voterguide.sos.ca.gov/propositions/1/analysis.htm")), /source src-[0-9a-f]+: url must be https/, { rebuild: true });
E("http key in source-access.json", edit(SA, (d) => (d.sources["http://plant.example.gov/x"] = { accessStatus: "unavailable", attempts: [], note: "x" })), /data\/source-access\.json key sources\.http:\/\/plant\.example\.gov\/x: URL must be https/);
E("invalid accessStatus", edit(SR, (d) => (d.sources[0].accessStatus = "maybe")), /source src-[0-9a-f]+: invalid accessStatus/);

// ---------- VAL-03 / VAL-04 evidence ----------
E("claim evidence with empty excerpt", edit(EV, (d) => (d.evidence.find((e) => e.id === P1C).excerpt = " ")), new RegExp(`evidence ${P1C}: claim-level evidence needs claim and a non-empty excerpt`));
E("claim evidence without location key", edit(EV, (d) => delete d.evidence.find((e) => e.id === P1C).location), new RegExp(`evidence ${P1C}: claim-level evidence needs a location key`));
E("claim evidence without explanation", edit(EV, (d) => delete d.evidence.find((e) => e.id === P1C).explanation), new RegExp(`evidence ${P1C}: claim-level evidence needs an explanation`));
E("claim evidence with invalid verdict", edit(EV, (d) => (d.evidence.find((e) => e.id === P1C).verdict = "probably")), new RegExp(`evidence ${P1C}: verdict must be one of`));
E("claim evidence without excerptMethod", edit(EV, (d) => delete d.evidence.find((e) => e.id === P1C).excerptMethod), new RegExp(`evidence ${P1C}: excerptMethod is required`));
E("unsupported verdict on a published field (ledger rebuilt)", edit(EC, (d) => (claim(d, P1C).verdict = "unsupported")), new RegExp(`evidence ${P1C}: verdict "unsupported" cannot back the published field`), { rebuild: true });
E("not-found verdict on a published field (ledger rebuilt)", edit(EC, (d) => (claim(d, P1C).verdict = "not-found")), new RegExp(`evidence ${P1C}: verdict "not-found" cannot back the published field`), { rebuild: true });
E("claim on a field the record does not publish (ledger rebuilt)", edit(EC, (d) => d.claims.push({ ...claim(d, P1C), id: "evc-plant-foo", field: "nonexistentField" })), /evidence evc-plant-foo: field "nonexistentField" is not published on 2026-11-03\.ca\.prop-1/, { rebuild: true });
W("claim whose every source is unavailable (ledger rebuilt)", (dir) => { const c = rd(dir, EC).claims.find((x) => x.id === P1C); edit(SA, (d) => (d.sources[c.url] = { accessStatus: "unavailable", attempts: ["planted"], alternative: "None found", note: "planted" }))(dir); }, new RegExp(`evidence ${P1C}: every source behind this claim is unavailable or its text was not extracted`), { rebuild: true });
E("claim verified from a not-extracted source", (dir) => { const c = rd(dir, EC).claims.find((x) => x.id === P1C); edit(SA, (d) => (d.sources[c.url] = { accessStatus: "accessed-text-not-extracted", attempts: ["planted"], alternative: "None", note: "planted" }))(dir); edit(EC, (d) => { const x = claim(d, P1C); x.reviewStatus = "verified"; x.reviewer = "A. Person"; x.reviewDate = "2026-10-22"; })(dir); }, new RegExp(`evidence ${P1C}: cannot be verified from a source whose text was not extracted`), { rebuild: true });
E("reviewed evidence without reviewer", edit(EV, (d) => { const e = d.evidence.find((x) => x.id === P1C); e.reviewStatus = "verified"; e.reviewer = null; }), new RegExp(`evidence ${P1C}: reviewed evidence needs reviewer and reviewDate`));
E("invalid reviewStatus", edit(EV, (d) => (d.evidence.find((x) => x.id === P1C).reviewStatus = "ok")), new RegExp(`evidence ${P1C}: invalid reviewStatus "ok"`));
E("invalid linkLevel", edit(EV, (d) => (d.evidence.find((x) => x.id === P1C).linkLevel = "page")), new RegExp(`evidence ${P1C}: linkLevel must be "claim" or "record"`));
E("record link with excerpt", edit(EV, (d) => (d.evidence.find((e) => e.linkLevel === "record").excerpt = "x")), /evidence ev-[^:]+: record-level links must not carry excerpts/);
E("record link marked verified", edit(EV, (d) => { const e = d.evidence.find((x) => x.linkLevel === "record"); e.reviewStatus = "verified"; e.reviewer = "x"; e.reviewDate = "2026-10-22"; }), /evidence ev-[^:]+: a record-level link cannot be verified evidence/);
E("evidence for missing subject", edit(EV, (d) => (d.evidence.find((x) => x.id === P1C).subject = "nothing")), new RegExp(`evidence ${P1C}: subject "nothing" does not exist`));
E("evidence cites a source not in the register", edit(EV, (d) => d.evidence.find((x) => x.id === P1C).sources.push("src-nope")), new RegExp(`evidence ${P1C}: source "src-nope" not in data/sources\\.json`));
E("evidence without sources", edit(EV, (d) => (d.evidence.find((x) => x.id === P1C).sources = [])), new RegExp(`evidence ${P1C}: no sources`));
E("stale ledger: claim edited, ledger not rebuilt", edit(EC, (d) => (claim(d, P1C).excerpt = "Planted new excerpt text.")), new RegExp(`evidence ${P1C}: data/evidence\\.json does not match data/evidence-claims\\.json`));
E("stale ledger: claim missing from evidence.json", edit(EV, (d) => (d.evidence = d.evidence.filter((x) => x.id !== P1C))), /data\/evidence\.json has \d+ claim-level records but data\/evidence-claims\.json has \d+/);
for (const f of ["threshold", "ballotQuestion", "measureType"]) {
  const subj = rdBase(EC).claims.find((c) => c.field === f && c.subject.includes("ca-bayarea-rtm"))?.subject || rdBase(EC).claims.find((c) => c.field === f).subject;
  E(`published ${f} without claim-level evidence (ledger rebuilt)`, edit(EC, (d) => (d.claims = d.claims.filter((c) => !(c.subject === subj && c.field === f)))), new RegExp(`${esc(subj)}: published "${f}" needs claim-level evidence`), { rebuild: true });
}
// ---------- round 2 (R2-01, R2-02, R2-03, partialCounties) ----------
const DUB_I = "2026-11-03.ca-alameda-sd-dublin-unified-school-district.measure-i", BER_U = "2026-11-03.ca-alameda-berkeley.measure-u";
E("published threshold contradicts its excerpts (R2-02)", edit(LM, (d) => (m(d, DUB_I).threshold = "majority of votes")), new RegExp(`${esc(DUB_I)}: the published threshold \\("majority of votes"\\) does not match`), { rebuild: true });
E("published ballot question not in its excerpts (R2-02)", edit(LM, (d) => (m(d, DUB_I).ballotQuestion = m(d, DUB_I).ballotQuestion.replace(/quality education/, "planted education"))), new RegExp(`${esc(DUB_I)}: the published ballot question does not match`), { rebuild: true });
E("only superseded rows behind a ballot question (R2-01)", edit(EC, (d) => d.claims.filter((c) => c.subject === BER_U && c.field === "ballotQuestion").forEach((c) => (c.reviewStatus = "superseded"))), new RegExp(`${esc(BER_U)}: published "ballotQuestion" needs claim-level evidence`), { rebuild: true });
E("only attribution rows behind a threshold (R2-01)", edit(EC, (d) => d.claims.filter((c) => c.subject === DUB_I && c.field === "threshold").forEach((c) => (c.verdict = "attribution"))), new RegExp(`${esc(DUB_I)}: published "threshold" needs a current claim row from an Official source`), { rebuild: true });
E("contest id does not match its jurisdiction (R2-03)", edit(CT, (d) => ((d.items || d.contests).find((c) => c.id === "2026-11-03.ca-alameda-berkeley.city-auditor").jurisdiction = "ca-alameda-albany")), /2026-11-03\.ca-alameda-berkeley\.city-auditor: id must start with "2026-11-03\.ca-alameda-albany\."/);
E("contest with zero seats (R2-03)", edit(CT, (d) => ((d.items || d.contests).find((c) => c.id === "2026-11-03.ca-alameda-berkeley.city-auditor").seats = 0)), /2026-11-03\.ca-alameda-berkeley\.city-auditor: seats must be null/);
E("partialCounties entry outside counties", edit(JU, (d) => j(d, "ca-boe-1").partialCounties.push("ca-marin")), /jurisdiction ca-boe-1: partialCounties entry "ca-marin" is not in counties/);
E("partialCounties entry is not a county", edit(JU, (d) => j(d, "ca-boe-1").partialCounties.push("ca-alameda-oakland")), /jurisdiction ca-boe-1: partialCounties entry "ca-alameda-oakland" is not a county/);
E("partialCounties without countiesKnown", edit(JU, (d) => (j(d, "ca-boe-1").countiesKnown = false)), /jurisdiction ca-boe-1: partialCounties needs countiesKnown true/);
E("ballot question cut to a fragment of its excerpt (R4-02)", edit(LM, (d) => (m(d, DUB_I).ballotQuestion = m(d, DUB_I).ballotQuestion.slice(0, 60))), new RegExp(`${esc(DUB_I)}: the published ballot question does not match`), { rebuild: true });
E("threshold source typed as a non-official copy (R4-02)", edit(EC, (d) => d.claims.filter((c) => c.subject === DUB_I && c.field === "threshold").forEach((c) => (c.sourceType = "Independent copy of official text"))), new RegExp(`${esc(DUB_I)}: published "threshold" needs a current claim row from an Official source`), { rebuild: true });
N("threshold written as two thirds without a hyphen passes (R4-02)", edit(LM, (d) => (m(d, DUB_I).threshold = "two thirds of votes")), new RegExp(`${esc(DUB_I)}: the published threshold`), { rebuild: true });
N("registrar wording that differs from the superseded city text passes", () => {}, new RegExp(`${esc(BER_U)}: the published ballot question`));

E("published field without any evidence record", edit(EV, (d) => (d.evidence = d.evidence.filter((e) => !(e.subjectKind === "candidate" && e.field === "name")))), /: published field "name" has no evidence record/);
E("incumbent field without evidence (VAL-05)", edit(EV, (d) => (d.evidence = d.evidence.filter((e) => e.field !== "incumbent"))), /: published field "incumbent" has no evidence record/);

// ---------- statewide items match the tool ----------
E("statewide item missing", edit(SW, (d) => d.items.pop()), /statewide\.json has 13 items but propositions\.html has 14/);
E("statewide title differs from the tool", txt("propositions.html", (s) => s.replace(/(\{ n: "1", name: ")([^"]+)/, "$1PLANTED NAME")), /statewide\.json Prop 1 shortTitle ".*" differs from propositions\.html "PLANTED NAME"/);

function rdBase(p) { return rd(base, p); }

fs.rmSync(tmpRoot, { recursive: true, force: true });
if (process.argv.includes("--verbose")) results.forEach((r) => console.log(r));
console.log(`validator tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
