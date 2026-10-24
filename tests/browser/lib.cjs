// Shared helpers for the browser suites. Data expectations are computed from the files in data/, never hardcoded.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const BASE = process.env.BASE || "http://127.0.0.1:8765/";
const AXE = require.resolve("axe-core/axe.min.js");
// External hosts the pages may contact. All are blocked in tests (answered with an empty body) and reported.
const ALLOWED_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com", "gc.zgo.at", "supriyarajeev.goatcounter.com"]);
const STATUS_LABELS = ["Verified", "Needs review", "Incomplete (required info or evidence is missing)", "Source unavailable", "Not yet researched", "Not applicable", "Archived", "Superseded"];
const OUTSIDE_BAY_MSG = "Statewide California propositions are available here. Local city and district coverage outside the Bay Area is still being developed.";

const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
function loadData() {
  const elections = readJSON("data/elections.json").elections;
  const election = elections.find((e) => e.status === "current") || elections[0];
  const jur = readJSON("data/jurisdictions.json").jurisdictions;
  const J = new Map(jur.map((j) => [j.id, j]));
  const region = fs.existsSync(path.join(ROOT, "data/region.json")) ? readJSON("data/region.json") : null;
  const measures = election.files.measures.flatMap((p) => readJSON(p).items);
  const contests = readJSON(election.files.contests).contests;
  const candidates = readJSON(election.files.candidates).candidates;
  const countyOf = (j) => { const seen = new Set(); while (j && !seen.has(j.id)) { seen.add(j.id); if (j.type === "county") return j; if (["state", "region", "state-district"].includes(j.type)) return null; j = J.get(j.parent); } return null; };
  const inCounty = (jid, cid) => { const j = J.get(jid); if (!j || j.type === "state") return false; if (j.type === "region" || j.type === "state-district") return (j.counties || []).includes(cid); return (countyOf(j) || {}).id === cid || (j.counties || []).includes(cid); };
  const bayIds = region ? region.counties : [];
  const counties = jur.filter((j) => j.type === "county");
  const citiesOf = (cid) => jur.filter((j) => j.type === "city" && j.parent === cid);
  return { election, jur, J, region, measures, contests, candidates, countyOf, inCounty, bayIds, counties, citiesOf };
}

// Routes every request that is not to the local server to an empty response, and records the host.
async function blockExternal(page, hosts, extra) {
  await page.route("**/*", async (r) => {
    const u = r.request().url();
    if (u.startsWith(BASE) || u.startsWith("file:")) return extra ? extra(r) : r.continue();
    hosts.add(new URL(u).host);
    return r.fulfill({ body: "" });
  });
}
// The only console error tolerated: the browser refusing the blocked (empty) GoatCounter script because it does not
// match the pinned integrity hash. That is the integrity check working, caused by the test's own blocking.
const benign = (msg) => /Failed to find a valid digest in the 'integrity' attribute for resource 'https:\/\/gc\.zgo\.at\//.test(msg);
function watchErrors(page, errs) {
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !benign(m.text())) errs.push("console: " + m.text()); });
}
function counter(label) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL", m); } return !!c; };
  const done = () => { console.log(`${label}: ${pass} passed, ${fail} failed`); return fail; };
  return { ok, done };
}
module.exports = { ROOT, BASE, AXE, ALLOWED_HOSTS, STATUS_LABELS, OUTSIDE_BAY_MSG, loadData, blockExternal, watchErrors, counter, readJSON };
