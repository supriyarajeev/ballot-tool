// Builds data/2026-11-03/candidate-quotes.json from the research files in research/2026-10-31/.
//   node tools/build-quotes.mjs
// A quote is published only when research/2026-10-31/checks.json records that it matched its source ("match").
// One quote per candidate per issue. An official statement is preferred over any other source for the same issue.
// A contest is listed only when its research group file exists. Candidate order is never changed here: the guide
// reads it from contests.json (certified-list order).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const R = path.join(root, "research/2026-10-31");
const OUT = path.join(root, "data/2026-11-03/candidate-quotes.json");
const readJ = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const has = (f) => fs.existsSync(path.join(R, f));

// Issue categories, in display order, per office. Labels follow the owner-approved prompt (Oct 30, 2026).
const ISSUES = {
  governor: [["cost-of-living", "Cost of living and affordability"], ["budget-taxes", "State budget, taxes and spending"], ["housing-homelessness", "Housing and homelessness"], ["accountability", "Accountability and results"], ["climate-water-wildfire", "Climate, water and wildfire"], ["immigration", "Immigration"], ["public-safety", "Public safety"], ["health-care", "Health care"]],
  "lieutenant-governor": [["cost-of-living-jobs", "Cost of living and jobs"], ["higher-education", "Higher education costs and access"], ["coast-lands-climate", "Coast, state lands and climate"], ["accountability", "Accountability and results"], ["housing", "Housing"]],
  "attorney-general": [["public-safety", "Public safety and crime"], ["consumer-protection", "Consumer protection and prices"], ["immigration-law", "Immigration enforcement and California law"], ["environmental-enforcement", "Environmental enforcement"], ["civil-rights", "Civil rights"], ["accountability", "Accountability and results"]],
  "secretary-of-state": [["election-security", "Election security and trust"], ["voter-access", "Voter access"], ["voter-id-rolls", "Voter ID and voter rolls"], ["campaign-finance", "Campaign finance transparency"], ["accountability", "Accountability and results"]],
  controller: [["audits-waste", "Audits and government waste"], ["budget-oversight", "State budget oversight"], ["spending-transparency", "Transparency of public spending"], ["pensions-debt", "Public pensions and debt"]],
  treasurer: [["debt-bonds", "State debt and bonds"], ["housing-finance", "Housing finance"], ["pensions-investments", "Public pensions and investments"], ["accountability", "Accountability and results"]],
  "insurance-commissioner": [["home-insurance-wildfire", "Home insurance availability and wildfire risk"], ["insurance-rates", "Insurance rates"], ["consumer-protection", "Consumer protection"], ["climate-risk", "Climate risk"], ["accountability", "Accountability and results"]],
  superintendent: [["reading-math", "Reading and math outcomes"], ["school-funding", "School funding"], ["teacher-shortage", "Teacher shortages"], ["school-safety", "School safety"], ["school-choice", "Charter schools and school choice"], ["accountability", "Accountability and results"]],
  house: [["cost-of-living-economy", "Cost of living and economy"], ["federal-budget-taxes", "Federal budget, taxes and spending"], ["health-care", "Health care"], ["immigration", "Immigration"], ["public-safety", "Public safety"], ["climate-energy", "Climate and energy"], ["housing", "Housing"], ["accountability", "Accountability and results"]],
  local: [["homelessness", "Homelessness"], ["housing", "Housing supply and affordability"], ["public-safety", "Public safety"], ["city-budget", "City budget and services"], ["cost-of-living-economy", "Cost of living and local economy"], ["streets-transit-clean", "Streets, transit and clean neighborhoods"], ["accountability", "Accountability and results"]]
};

const S = "2026-11-03.ca.";
const STATEWIDE = { [S + "governor"]: "governor", [S + "lieutenant-governor"]: "lieutenant-governor", [S + "attorney-general"]: "attorney-general", [S + "secretary-of-state"]: "secretary-of-state", [S + "controller"]: "controller", [S + "treasurer"]: "treasurer", [S + "insurance-commissioner"]: "insurance-commissioner", [S + "superintendent-of-public-instruction"]: "superintendent" };

// Research groups: the files that hold quotes, and which group of the roster they cover.
const GROUPS = [
  { files: ["statewide-official.json", "statewide-campaign.json"], roster: "statewide", kind: "statewide" },
  { files: ["oakland-sf.json", "sf-d10.json"], roster: "oakland_sf", kind: "local" },
  { files: ["sj-fremont.json", "pa-mp.json"], roster: "south_bay", kind: "local" },
  { files: ["mayors-eastbay.json", "mayors-other.json"], kind: "local" },
  { files: ["sv-cities-official.json", "sv-cities.json"], kind: "local", researched: "2026-10-31" },
  { files: ["house.json"], kind: "house" }
];

// Official campaign finance records for each compared contest. Statewide: Cal-Access Power Search. US House: the FEC
// page for the district. Local: the city's own disclosure site where one was found, otherwise the Secretary of State's
// list of city and county filing sites.
const LOCAL_FINANCE = {
  "ca-sf": ["https://campaign.sfethics.org/", "San Francisco Ethics Commission campaign finance dashboards"],
  "ca-alameda-oakland": ["https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/Disclosure-Information-and-Data/Explore-Campaign-Finance-Disclosures", "Oakland Public Ethics Commission, campaign finance disclosures"],
  "ca-santa-clara-san-jose": ["https://www.sanjoseca.gov/your-government/appointees/city-clerk/elections/campaign-reports", "City of San José, campaign reports"]
};
const SOS_LOCAL = ["https://www.sos.ca.gov/campaign-lobbying/helpful-resources/how-to-file-electronically/city-and-county-electronic-filings", "Secretary of State list of city and county online filing sites. A city not on the list keeps its filings at the city clerk's office"];
function financeFor(c) {
  if (c.jurisdiction === "ca") return ["https://powersearch.sos.ca.gov/", "Cal-Access Power Search (Secretary of State)"];
  const m = /^ca-cd-(\d+)$/.exec(c.jurisdiction);
  if (m) return ["https://www.fec.gov/data/elections/house/CA/" + m[1].padStart(2, "0") + "/2026/", "Federal Election Commission, California District " + m[1] + " in 2026"];
  for (const [k, v] of Object.entries(LOCAL_FINANCE)) if (c.jurisdiction === k || c.jurisdiction.startsWith(k + "-")) return v;
  return SOS_LOCAL;
}
const contests = readJ(path.join(root, "data/2026-11-03/contests.json")).contests;
const cands = readJ(path.join(root, "data/2026-11-03/candidates.json")).candidates;
const cById = new Map(contests.map((c) => [c.id, c])), pById = new Map(cands.map((p) => [p.id, p]));
const rosters = readJ(path.join(R, "rosters.json"));
const checks = has("checks.json") ? readJ(path.join(R, "checks.json")).checks : [];
const norm = (s) => String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
const key = (c, i, q) => c + "|" + i + "|" + norm(q);
const siteOk = new Set((has("site-checks.json") ? readJ(path.join(R, "site-checks.json")).results : []).filter((x) => x.result === "ok").map((x) => x.candidate + "|" + x.url));
// Quotes kept out after review (issue fit, readability), even though they match their source.
const excl = has("exclusions.json") ? readJ(path.join(R, "exclusions.json")).exclusions : [];
const isExcluded = (q) => excl.some((e) => (e.url && e.url === q.sourceUrl) || (e.candidate === q.candidate && e.issue === q.issue && (!e.quote || norm(e.quote) === norm(q.quote))));
const passed = new Map();
for (const k of checks) if (k.result === "match") passed.set(key(k.candidate, k.issue, k.quote), k);

const rank = { "official-statement": 0, campaign: 1, questionnaire: 2, news: 3 };
const outContests = {}, outCands = {}, quotes = [], dropped = [];
for (const g of GROUPS) {
  const present = g.files.filter(has);
  if (!present.length) continue;
  // Statewide: all eight offices. Local: the contests of the candidates each research file lists, so a contest
  // appears only once its own research is in.
  let ids;
  if (g.kind === "statewide") { const rg = rosters[g.roster]; ids = (Array.isArray(rg) ? rg : rg.contests || []).map((c) => c.contest || c.id); }
  else ids = [...new Set(present.flatMap((f) => (readJ(path.join(R, f)).candidates || []).map((m) => (pById.get(m.id) || {}).contest)).filter(Boolean))];
  for (const id of ids) {
    const c = cById.get(id); if (!c) throw new Error("Roster contest not in contests.json: " + id);
    const set = g.kind === "statewide" ? STATEWIDE[id] : g.kind;
    if (!set) throw new Error("No issue set for " + id);
    const fin = financeFor(c);
    outContests[id] = { issueSet: set, researched: g.researched || "2026-10-30", financeUrl: fin[0], financeLabel: fin[1] };
  }
  const best = new Map();
  for (const f of present) {
    const d = readJ(path.join(R, f));
    for (const m of d.candidates || []) {
      if (!pById.has(m.id)) throw new Error(f + ": unknown candidate " + m.id);
      const o = outCands[m.id] || (outCands[m.id] = {});
      // A campaign website is shown only after it was opened and found to name the candidate (siteChecks).
      if (m.campaignUrl && /^https:\/\//.test(m.campaignUrl) && !o.campaignUrl && siteOk.has(m.id + "|" + m.campaignUrl)) o.campaignUrl = new URL(m.campaignUrl).href;
    }
    for (const q of d.quotes || []) {
      const p = pById.get(q.candidate);
      if (!p) throw new Error(f + ": unknown candidate " + q.candidate);
      if (p.contest !== q.contest || !outContests[q.contest]) throw new Error(f + ": contest mismatch for " + q.candidate);
      if (!ISSUES[outContests[q.contest].issueSet].some((x) => x[0] === q.issue)) { dropped.push([q.candidate, q.issue, "issue not in this office's list"]); continue; }
      // A quote with an ellipsis has words left out by someone else, so it is not a complete passage.
      if (/…|\.\.\./.test(q.quote)) { dropped.push([q.candidate, q.issue, "contains an ellipsis"]); continue; }
      if (isExcluded(q)) { dropped.push([q.candidate, q.issue, "kept out after review"]); continue; }
      const ck = passed.get(key(q.candidate, q.issue, q.quote));
      if (!ck) { dropped.push([q.candidate, q.issue, "no recorded source match"]); continue; }
      if (!/^https:\/\//.test(q.sourceUrl) || !/^\d{4}-\d{2}-\d{2}$/.test(q.sourceDate)) { dropped.push([q.candidate, q.issue, "bad url or date"]); continue; }
      const k = q.candidate + "|" + q.issue, prev = best.get(k);
      if (!prev || rank[q.sourceType] < rank[prev.sourceType]) best.set(k, { ...q, check: { date: ck.date, method: ck.method } });
    }
  }
  quotes.push(...best.values());
}
// A contest with no published quote is not shown as a comparison. It keeps the plain candidate list.
const withQuotes = new Set(quotes.map((q) => q.contest));
const noQuotes = Object.keys(outContests).filter((id) => !withQuotes.has(id));
for (const id of noQuotes) { delete outContests[id]; for (const p of cById.get(id).candidates) delete outCands[p]; }
const order = new Map(); Object.keys(outContests).forEach((id) => cById.get(id).candidates.forEach((p, i) => order.set(p, i)));
quotes.sort((a, b) => a.contest.localeCompare(b.contest) || order.get(a.candidate) - order.get(b.candidate));
const out = {
  schemaVersion: 1,
  election: "2026-11-03",
  researched: "2026-10-30",
  method: "This guide organizes publicly available candidate statements and reporting by common issue categories. Quotations are attributed and linked to their sources. Missing information is identified rather than inferred. The guide does not rate, rank or endorse candidates. It is an independent educational resource and is not an official election publication.",
  issueSets: Object.fromEntries(Object.entries(ISSUES).map(([k, v]) => [k, v.map(([id, label]) => ({ id, label }))])),
  contests: outContests,
  candidates: outCands,
  quotes: quotes.map((q) => ({ candidate: q.candidate, contest: q.contest, issue: q.issue, quote: q.quote, sourceTitle: q.sourceTitle, sourceUrl: new URL(q.sourceUrl).href, sourceDate: q.sourceDate, dateKind: q.dateKind, sourceType: q.sourceType, check: q.check }))
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
if (noQuotes.length) console.log("  not compared, no quote passed: " + noQuotes.join(", "));
console.log(`candidate-quotes.json: ${Object.keys(outContests).length} contests, ${quotes.length} quotes, ${dropped.length} left out`);
for (const d of dropped) console.log("  left out:", d.join(" · "));
