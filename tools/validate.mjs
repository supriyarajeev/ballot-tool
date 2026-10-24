// Data validator for the California Ballot Guide. Run before every deploy:
//   node tools/validate.mjs                           validate (exit 1 on any error; warnings do not fail)
//   node tools/validate.mjs --update-candidate-order  deliberately re-record tests/fixtures/candidate-order.json
// Environment:
//   VALIDATE_ROOT=<dir>   validate a copy of the site instead of this checkout
//   VALIDATE_TODAY=YYYY-MM-DD  override the run date (self-tests only). Default is the system date.
// Every rule below is exercised by tests/validator.test.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLAIM_FIELDS, isPublished } from "./build-ledger.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.VALIDATE_ROOT ? path.resolve(process.env.VALIDATE_ROOT) : path.resolve(here, "..");
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const read = (p) => {
  let text;
  try { text = fs.readFileSync(path.join(root, p), "utf8"); } catch (e) { errors.push(`${p}: file not found`); return null; }
  try { return JSON.parse(text); } catch (e) { errors.push(`${p}: invalid JSON (${e.message})`); return null; }
};
const cache = new Map();
const readOnce = (p) => { if (!cache.has(p)) cache.set(p, read(p)); return cache.get(p); };

// ---------- constants ----------
const STATUSES = new Set(["verified", "needs-review", "incomplete", "source-unavailable", "not-researched", "not-applicable", "archived", "superseded"]);
const VERDICTS = new Set(["supported", "partly-supported", "unsupported", "not-found", "attribution", "link-only"]);
const BACKING_VERDICTS = new Set(["supported", "partly-supported", "attribution"]);
const INVENTORY = new Set(["not-collected", "partial", "collected", "reconciled", "none-found-confirmed"]);
const CITY_INVENTORY = new Set(["complete", "partial", "not-collected"]);
const JUR_TYPES = new Set(["state", "state-district", "region", "county", "city", "supervisor-district", "school-district", "community-college-district", "special-district", "council-district"]);
// Allowed parent type for each jurisdiction type (VAL-02).
const PARENT_TYPES = { county: ["state"], city: ["county"], region: ["state"], "state-district": ["state"], "supervisor-district": ["county"], "council-district": ["city"], "school-district": ["county"], "community-college-district": ["county"], "special-district": ["county"] };
const COVERAGE = new Set(["pilot", "list-only", "not-started"]);
const LEVELS = new Set(["state", "county", "city", "school", "community-college", "special"]);
// The nine counties of the San Francisco Bay Area (MTC and ABAG). data/region.json must list exactly these.
const BAY_COUNTIES = ["ca-alameda", "ca-contra-costa", "ca-marin", "ca-napa", "ca-sf", "ca-san-mateo", "ca-santa-clara", "ca-solano", "ca-sonoma"];
// Fields that must rest on claim-level evidence whenever they are published, whatever the record status (VAL-04).
const REQUIRED_CLAIM_FIELDS = ["threshold", "ballotQuestion", "measureType"];
// Generic review placeholders are not gaps: the status already says the record needs review (VAL-15).
const GENERIC_GAP = [
  /^\s*(a |an |the )?(human|person'?s?|people'?s|manual|independent|editorial|expert)\s+(review|check|verification)\b/i,
  /^\s*(needs?|requires?|awaiting|pending|still needs)\s+(a |an )?(human |person'?s? |manual |independent |final )?(review|check|verification)\b/i,
  /^\s*(review|verification|check)\s+(of|against|by)\s+(the |a )?(audited|all|official|person|human)/i,
  /^\s*(not yet )?(reviewed|verified)( by a (person|human))?\.?\s*$/i,
];
const CANDIDATE_ORDER_FIXTURE = "tests/fixtures/candidate-order.json";

// ---------- dates (VAL-06) ----------
const pad = (n) => String(n).padStart(2, "0");
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const TODAY = process.env.VALIDATE_TODAY || localToday();
// A real calendar date: 2026-02-30 is rejected because it does not round-trip.
const isDate = (s) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
};
// Dates that record something already done (checked, retrieved, verified, reviewed) cannot be after today.
function pastDate(v, where, key, { nullable = false } = {}) {
  if (nullable && v === null) return;
  if (!isDate(v)) return err(`${where}: ${key} must be a real YYYY-MM-DD date${nullable ? " or null" : ""} (got ${JSON.stringify(v)})`);
  if (v > TODAY) err(`${where}: ${key} ${v} is after today (${TODAY})`);
}

// ---------- URLs (VAL-08) ----------
const isUrl = (s) => { if (typeof s !== "string" || !/^https:\/\/[^\s]+$/.test(s)) return false; try { const u = new URL(s); return /\./.test(u.hostname); } catch (e) { return false; } };
const httpExceptions = [];
// Walk every string in a data file. Any "http://" value is an error unless it is a documented exception:
//   - a county electionsUrl with an electionsUrlNote explaining why no https address exists;
//   - electionsUrlPrevious, which records a superseded address for history and is never linked.
function scanUrls(obj, file) {
  const walk = (o, at, parent) => {
    if (typeof o === "string") {
      const key = at[at.length - 1];
      if (/^http:\/\//i.test(o)) {
        if (key === "electionsUrl" && parent && parent.electionsUrlNote) httpExceptions.push(`${parent.id} electionsUrl`);
        else if (key === "electionsUrlPrevious") httpExceptions.push(`${parent && parent.id} electionsUrlPrevious (history only)`);
        else err(`${file} ${at.join(".")}: URL must be https (${o})`);
      } else if (typeof key === "string" && /(^url$|Url$|^citySource$|^source$)/.test(key) && o && !/^propositions\.html#/.test(o) && !isUrl(o)) {
        err(`${file} ${at.join(".")}: URL is malformed or not https (${o})`);
      }
      return;
    }
    if (Array.isArray(o)) return o.forEach((v, i) => walk(v, at.concat(i), o));
    if (o && typeof o === "object") for (const k of Object.keys(o)) {
      if (/^http:\/\//i.test(k)) err(`${file} key ${at.concat(k).join(".")}: URL must be https`);
      walk(o[k], at.concat(k), o);
    }
  };
  if (obj) walk(obj, [], null);
}

// ---------- shared record rules ----------
const needsSources = (status) => status !== "source-unavailable";
const ids = new Map();
const allRecords = new Map(); // id -> record, for evidence checks
function claimId(id, where) {
  if (typeof id !== "string" || !id) return err(`${where}: missing id`);
  if (ids.has(id)) err(`Duplicate id "${id}" in ${where} and ${ids.get(id)}`);
  else ids.set(id, where);
}
function checkSources(list, where, status) {
  if (!Array.isArray(list)) return err(`${where}: sources must be an array`);
  if (needsSources(status) && !list.length) err(`${where}: status "${status}" requires at least one official source`);
  list.forEach((s, i) => {
    if (!s || !s.label) err(`${where}: source ${i + 1} has no label`);
    if (!isUrl(s && s.url)) err(`${where}: source ${i + 1} URL is missing, malformed or not https`);
  });
  if (status === "verified" && !list.some((s) => s && /official/i.test(s.type || ""))) err(`${where}: verified records need at least one source typed "Official"`);
}
function checkRecord(x, where, required) {
  for (const k of required) if (x[k] === undefined || x[k] === null || x[k] === "") err(`${where}: missing "${k}"`);
  if (!STATUSES.has(x.status)) err(`${where}: invalid status "${x.status}"`);
  pastDate(x.lastVerified, where, "lastVerified");
  if (x.status !== "verified" && x.status !== "archived" && x.status !== "superseded" && !(x.notes || (x.gaps && x.gaps.length))) err(`${where}: status "${x.status}" must explain the gap in notes or gaps`);
  if (x.status === "incomplete" && !(Array.isArray(x.gaps) && x.gaps.length)) err(`${where}: "incomplete" records must list the missing information in gaps`);
  if (Array.isArray(x.gaps)) {
    const g = x.gaps.find((s) => GENERIC_GAP.some((re) => re.test(String(s))));
    if (g) err(`${where}: replace the generic gap "${g}" with the specific unresolved question`);
    const seen = new Set();
    for (const s of x.gaps) { const k = String(s).trim().toLowerCase(); if (seen.has(k)) warn(`${where}: gap listed twice: "${s}"`); seen.add(k); }
  }
  if (x.status === "superseded" && !x.supersededBy) err(`${where}: "superseded" requires supersededBy`);
  // Verified requires a recorded human review, never just automated checks.
  if (x.status === "verified" && !(x.review && x.review.reviewer && isDate(x.review.date))) err(`${where}: "verified" requires review.reviewer and review.date from a human review`);
  if (x.review && x.review.date) pastDate(x.review.date, where, "review.date");
  if (x.status === "not-applicable" && !(x.notes && x.sources && x.sources.length)) err(`${where}: "not-applicable" requires notes and a supporting source`);
  if (x.id) allRecords.set(x.id, x);
}

let toolHtml = "";
try { toolHtml = fs.readFileSync(path.join(root, "propositions.html"), "utf8"); } catch (e) { err("propositions.html not found"); }

// ---------- jurisdictions ----------
const jurFile = readOnce("data/jurisdictions.json");
scanUrls(jurFile, "data/jurisdictions.json");
const jur = (jurFile || {}).jurisdictions || [];
const J = new Map();
jur.forEach((j, i) => {
  const w = `jurisdictions[${i}] (${j.id})`;
  claimId(j.id, "jurisdictions.json");
  J.set(j.id, j);
  if (!j.name) err(`${w}: missing name`);
  if (!JUR_TYPES.has(j.type)) err(`${w}: invalid type "${j.type}"`);
  if (j.type === "county") {
    if (!j.coverage || !COVERAGE.has(j.coverage.status)) err(`${w}: county needs coverage.status`);
    // An http electionsUrl is reported by scanUrls unless electionsUrlNote documents the exception.
    if (!/^https?:\/\/\S+$/.test(j.electionsUrl || "")) err(`${w}: county needs an electionsUrl`);
    const inv = j.inventory || {};
    for (const k of ["measures", "contests", "candidates", "districts"]) if (!INVENTORY.has(inv[k])) err(`${w}: inventory.${k} must be one of ${[...INVENTORY].join(", ")}`);
    pastDate(inv.lastChecked, w, "inventory.lastChecked");
    if (j.lookupUrl && !isUrl(j.lookupUrl)) err(`${w}: lookupUrl must be https`);
  }
  if (j.municipalityType !== undefined) {
    if (j.type !== "city") err(`jurisdiction ${j.id}: municipalityType is only for city records`);
    else if (!["city", "town"].includes(j.municipalityType)) err(`jurisdiction ${j.id}: municipalityType must be "city" or "town"`);
  }
});

// Parent walks are cycle-safe (VAL-01). Every walk goes through walkUp.
function walkUp(j) {
  const seen = new Set(), chain = [];
  while (j) {
    if (seen.has(j.id)) return { chain, cycle: true };
    seen.add(j.id); chain.push(j);
    if (!j.parent) break;
    j = J.get(j.parent);
  }
  return { chain, cycle: false };
}
const cycleSeen = new Set();
jur.forEach((j) => {
  const { chain, cycle } = walkUp(j);
  if (!cycle) return;
  // Report the loop itself once, not every record that leads into it.
  const again = J.get(chain[chain.length - 1].parent);
  const loop = chain.slice(chain.findIndex((x) => x.id === again.id));
  const key = loop.map((x) => x.id).sort().join(",");
  if (cycleSeen.has(key)) return;
  cycleSeen.add(key);
  err(`jurisdiction ${loop[0].id}: parent cycle (${loop.map((x) => x.id).join(" -> ")} -> ${loop[0].id})`);
});
function countyOf(j) {
  const { chain, cycle } = walkUp(j);
  if (cycle) return null;
  for (const x of chain) { if (x.type === "county") return x; if (x.type === "state" || x.type === "region" || x.type === "state-district") return null; }
  return null;
}
// Does a jurisdiction's item appear in a county? Same rule as tools/report.mjs.
function inCounty(jid, cid) {
  const j = J.get(jid); if (!j || j.type === "state") return false;
  if (j.type === "region" || j.type === "state-district") return (j.counties || []).includes(cid);
  return (countyOf(j) || {}).id === cid || (j.counties || []).includes(cid);
}

jur.forEach((j) => {
  if (j.parent && !J.has(j.parent)) err(`jurisdiction ${j.id}: parent "${j.parent}" does not exist`);
  if (j.type === "state" && j.parent) err(`jurisdiction ${j.id}: the state has no parent`);
  if (j.type !== "state" && !j.parent) err(`jurisdiction ${j.id}: missing parent`);
  const p = J.get(j.parent);
  if (p && PARENT_TYPES[j.type] && !PARENT_TYPES[j.type].includes(p.type)) err(`jurisdiction ${j.id}: a ${j.type}'s parent must be a ${PARENT_TYPES[j.type].join(" or ")}, but "${p.id}" is a ${p.type}`);
  (j.counties || []).forEach((a) => {
    if (!J.has(a)) err(`jurisdiction ${j.id}: county "${a}" does not exist`);
    else if (J.get(a).type !== "county") err(`jurisdiction ${j.id}: counties entry "${a}" is a ${J.get(a).type}, not a county`);
  });
  (j.areas || []).forEach((a) => {
    const A = J.get(a);
    if (!A) return err(`jurisdiction ${j.id}: area "${a}" does not exist`);
    if (A.type !== "city") return err(`jurisdiction ${j.id}: area "${a}" is a ${A.type}; areas must be cities`);
    const ac = (countyOf(A) || {}).id, own = [(countyOf(j) || {}).id, ...(j.counties || [])];
    if (!own.includes(ac)) err(`jurisdiction ${j.id}: area "${a}" is in ${ac}, outside this district's county (${own.filter(Boolean).join(", ")})`);
  });
});

// Cities: no duplicate names within a county (VAL-02).
const citiesOf = new Map();
jur.filter((j) => j.type === "city").forEach((c) => { if (!citiesOf.has(c.parent)) citiesOf.set(c.parent, []); citiesOf.get(c.parent).push(c); });
for (const [cid, list] of citiesOf) {
  const byName = new Map();
  for (const c of list) { const k = String(c.name || "").trim().replace(/\s+/g, " ").toLowerCase(); if (!byName.has(k)) byName.set(k, []); byName.get(k).push(c.id); }
  for (const [n, idsWithName] of byName) if (idsWithName.length > 1) err(`county ${cid}: duplicate city name "${n}" (${idsWithName.join(", ")})`);
}

// Region: data/region.json is the single source of Bay Area membership (VAL-02).
const counties = jur.filter((j) => j.type === "county");
const region = readOnce("data/region.json");
scanUrls(region, "data/region.json");
const regionCounties = new Set();
if (region) {
  const R = "data/region.json";
  if (region.schemaVersion !== 1) err(`${R}: schemaVersion must be 1`);
  if (region.id !== "bay-area") err(`${R}: id must be "bay-area"`);
  if (!region.name) err(`${R}: missing name`);
  const list = Array.isArray(region.counties) ? region.counties : [];
  if (!Array.isArray(region.counties)) err(`${R}: counties must be an array`);
  list.forEach((c) => { if (regionCounties.has(c)) err(`${R}: county "${c}" listed twice`); regionCounties.add(c); if (!J.has(c)) err(`${R}: county "${c}" does not exist`); else if (J.get(c).type !== "county") err(`${R}: "${c}" is a ${J.get(c).type}, not a county`); });
  if (regionCounties.size !== 9) err(`${R}: counties must list exactly 9 counties (found ${regionCounties.size})`);
  const missing = BAY_COUNTIES.filter((c) => !regionCounties.has(c)), extra = [...regionCounties].filter((c) => !BAY_COUNTIES.includes(c));
  if (missing.length || extra.length) err(`${R}: counties must be the nine Bay Area counties (missing: ${missing.join(", ") || "none"}; not Bay Area: ${extra.join(", ") || "none"})`);
  if (region.countyCount !== regionCounties.size) err(`${R}: countyCount is ${region.countyCount} but counties lists ${regionCounties.size}`);
  const nCities = jur.filter((j) => j.type === "city" && regionCounties.has(j.parent)).length;
  if (region.municipalityCount !== nCities) err(`${R}: municipalityCount is ${region.municipalityCount} but the data has ${nCities} city records in those counties`);
  if (!Array.isArray(region.facts) || !region.facts.length) err(`${R}: facts must be a non-empty array`);
  (region.facts || []).forEach((f, i) => {
    const w = `${R} facts[${i}]`;
    if (!f || !f.text) err(`${w}: missing text`);
    if (!isUrl(f && f.url)) err(`${w}: url must be https`);
    if (!f || !f.publisher) err(`${w}: missing publisher`);
    pastDate(f && f.retrieved, w, "retrieved");
    // VAL-16: numbers quoted in a fact must agree with the counts the guide uses.
    const t = String((f && f.text) || "").toLowerCase();
    const num = (s) => (/^\d+$/.test(s) ? +s : { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 }[s]);
    for (const m of t.matchAll(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve) counties\b/g)) if (num(m[1]) !== region.countyCount) warn(`${w}: text says ${m[1]} counties but countyCount is ${region.countyCount}`);
    for (const m of t.matchAll(/\b(\d+) cities\b/g)) if (+m[1] !== region.municipalityCount) warn(`${w}: text says ${m[1]} cities but municipalityCount is ${region.municipalityCount}`);
  });
  // "The region at a glance": dated official figures. The guide sums the county values, so each table must list exactly the nine counties.
  const G = region.glance;
  if (G !== undefined) {
    const src = (o, w) => { if (!isUrl(o && o.url)) err(`${w}: url must be https`); if (!o || !o.publisher) err(`${w}: missing publisher`); if (!o || !o.title) err(`${w}: missing title`); pastDate(o && o.retrieved, w, "retrieved"); };
    for (const k of ["population", "registration"]) {
      const o = G[k], w = `${R} glance.${k}`;
      if (!o) { err(`${w}: missing`); continue; }
      src(o, w); pastDate(o.asOf, w, "asOf");
      for (const tk of ["byCounty"].concat(k === "registration" ? ["eligibleByCounty"] : [])) {
        const t = o[tk] || {}, keys = Object.keys(t);
        const miss = [...regionCounties].filter((c) => !(c in t)), extra = keys.filter((c) => !regionCounties.has(c));
        if (miss.length || extra.length) err(`${w}.${tk}: must list exactly the region's counties (missing: ${miss.join(", ") || "none"}; extra: ${extra.join(", ") || "none"})`);
        keys.forEach((c) => { if (!(Number.isInteger(t[c]) && t[c] > 0)) err(`${w}.${tk}.${c}: must be a whole number above 0`); });
      }
      if (!(Number.isInteger(o.state) && o.state > 0)) err(`${w}.state: must be a whole number above 0`);
      const sum = Object.values(o.byCounty || {}).reduce((a, b) => a + (+b || 0), 0);
      if (o.state && sum >= o.state) err(`${w}: the nine counties add up to ${sum}, which is not below the state total ${o.state}`);
      if (k === "registration") Object.keys(o.byCounty || {}).forEach((c) => { if (o.eligibleByCounty && o.byCounty[c] > o.eligibleByCounty[c]) err(`${w}.byCounty.${c}: more registered than eligible`); });
    }
    const cc = G.californiaCounties, w = `${R} glance.californiaCounties`;
    if (!cc) err(`${w}: missing`);
    else { src(cc, w); if (cc.count !== counties.length) err(`${w}: count is ${cc.count} but the data has ${counties.length} county records`); }
    // California's incorporated cities (Oct 24, 2026): dated, sourced, and at least the region's own count.
    const ci = G.californiaCities, wc = `${R} glance.californiaCities`;
    if (!ci) err(`${wc}: missing`);
    else { src(ci, wc); pastDate(ci.asOf, wc, "asOf"); if (!Number.isInteger(ci.count) || ci.count < region.municipalityCount) err(`${wc}: count must be a whole number at least the region's ${region.municipalityCount} cities`); if (!ci.derivation) err(`${wc}: needs derivation (how the count was read)`); }
  }
}
counties.forEach((c) => {
  const tagged = c.region === "bay-area", listed = regionCounties.has(c.id);
  if (region && tagged && !listed) err(`county ${c.id}: region is "bay-area" but it is not in data/region.json counties`);
  if (region && !tagged && listed) err(`county ${c.id}: listed in data/region.json but region is ${JSON.stringify(c.region)}`);
});

// County city inventory, unincorporated areas, consolidated city (VAL-02).
counties.forEach((c) => {
  const w = `county ${c.id}`, isBay = regionCounties.has(c.id) || BAY_COUNTIES.includes(c.id);
  const n = (citiesOf.get(c.id) || []).length;
  const ci = c.cityInventory;
  if (!ci) err(`${w}: missing cityInventory (use {"status":"not-collected"} when the list has not been collected)`);
  else {
    if (!CITY_INVENTORY.has(ci.status)) err(`${w}: cityInventory.status must be one of ${[...CITY_INVENTORY].join(", ")}`);
    if (ci.status === "complete" || ci.status === "partial") {
      if (!isUrl(ci.source)) err(`${w}: cityInventory "${ci.status}" needs an https source`);
      pastDate(ci.checked, w, "cityInventory.checked");
    }
    if (ci.status === "complete" && ci.count !== n) err(`${w}: cityInventory is "complete" with count ${ci.count}, but the data has ${n} cities`);
    if (ci.status === "partial" && typeof ci.count === "number" && ci.count < n) err(`${w}: cityInventory "partial" count ${ci.count} is below the ${n} cities recorded`);
    if (ci.note) for (const m of String(ci.note).matchAll(/\b(\d+) (cities and towns|cities|towns)\b/g)) if (+m[1] !== n) warn(`${w}: cityInventory.note says ${m[1]} ${m[2]} but the data has ${n}`);
  }
  const u = c.unincorporated;
  if (u === undefined) { if (isBay) err(`${w}: Bay Area county needs unincorporated { listed, source }`); }
  else {
    if (typeof u.listed !== "boolean") err(`${w}: unincorporated.listed must be true or false`);
    if (!isUrl(u.source)) err(`${w}: unincorporated needs an https source`);
  }
  if (c.consolidatedCity !== undefined) {
    const x = J.get(c.consolidatedCity);
    if (!x || x.type !== "city" || x.parent !== c.id) err(`${w}: consolidatedCity "${c.consolidatedCity}" must be a city of this county`);
    if (u && u.listed === true) err(`${w}: a consolidated city and county has no unincorporated area, so unincorporated.listed must be false`);
  }
});

// ---------- elections and their files ----------
const elFile = readOnce("data/elections.json");
scanUrls(elFile, "data/elections.json");
const elections = (elFile || {}).elections || [];
elections.forEach((e, i) => {
  const w = `elections[${i}] (${e.id})`;
  claimId(e.id, "elections.json");
  if (!isDate(e.date)) err(`${w}: invalid date`); // an election date may be in the future
  if (e.date !== e.id) err(`${w}: election id and date must match (id ${e.id}, date ${e.date})`);
  if (!["current", "past", "upcoming"].includes(e.status)) err(`${w}: status must be current, past or upcoming`);
  checkSources(e.sources || [], w, "verified");
  // Key dates shown on the home page: official, quoted, in order, and not after the last day ballots can arrive.
  if (e.keyDates !== undefined) {
    if (!Array.isArray(e.keyDates) || !e.keyDates.length) err(`${w}: keyDates must be a non-empty array`);
    else {
      pastDate(e.keyDatesRetrieved, w, "keyDatesRetrieved");
      let prev = "";
      e.keyDates.forEach((k, j) => {
        const kw = `${w} keyDates[${j}]`;
        if (!k || !isDate(k.date)) { err(`${kw}: date must be a real YYYY-MM-DD date`); return; }
        if (k.date < prev) err(`${kw}: dates must be in order (${k.date} comes after ${prev})`);
        prev = k.date;
        if (!k.label || !k.text) err(`${kw}: needs label and text`);
        if (!isUrl(k.url) || !/^https:\/\/(www\.)?sos\.ca\.gov\//.test(k.url)) err(`${kw}: url must be an https page on sos.ca.gov`);
        if (!k.quote || !String(k.quote).trim()) err(`${kw}: needs the quote from the official page`);
        else {
          // The quoted sentence must name the same day as the date field.
          const d = new Date(k.date + "T12:00:00Z"), mon = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" }), day = d.getUTCDate();
          if (!new RegExp(`\\b${mon} ${day}\\b`).test(k.quote)) err(`${kw}: the quote does not mention ${mon} ${day}`);
        }
        if (k.date === e.date && !/election day/i.test(k.label)) warn(`${kw}: the election date is not labeled Election Day`);
      });
      if (!e.keyDates.some((k) => k && k.date === e.date)) err(`${w}: keyDates must include the election date ${e.date}`);
    }
  }
});
// Candidate evaluation rubric (data/candidate-rubric.json, Oct 24, 2026): seven factors per office, a catch-all last.
const FACTOR_KEYS = ["nb", "ev", "lr", "ac", "if", "fc", "oc"];
const rubric = readOnce("data/candidate-rubric.json");
const rubricBases = new Set(((rubric && rubric.bases) || []).map((b) => b.id));
if (rubric) {
  const RB = "data/candidate-rubric.json";
  if (!Array.isArray(rubric.offices) || !rubric.offices.length) err(`${RB}: needs offices`);
  else {
    rubric.offices.forEach((o, i) => {
      try { new RegExp(o.match); } catch (e) { err(`${RB} office ${o.id}: match is not a valid pattern`); }
      FACTOR_KEYS.forEach((k) => { if (!o.guide || typeof o.guide[k] !== "string" || o.guide[k].length < 20) err(`${RB} office ${o.id}: needs guidance for factor ${k}`); });
    });
    if (rubric.offices[rubric.offices.length - 1].match !== ".") err(`${RB}: the last office must be a catch-all (match ".")`);
  }
  ["record", "proposal", "statement", "independent"].forEach((b) => { if (!rubricBases.has(b)) err(`${RB}: missing evidence basis ${b}`); });
  if (!rubric.missingPolicy) err(`${RB}: needs missingPolicy`);
}
// County map (data/bay-map.json): the shapes must be exactly the region's counties, with a source.
const bayMap = readOnce("data/bay-map.json");
if (bayMap) {
  const M = "data/bay-map.json";
  if (!/^0 0 \d+ \d+$/.test(bayMap.viewBox || "")) err(`${M}: viewBox must be "0 0 width height"`);
  if (!bayMap.source || !isUrl(bayMap.source.url) || !bayMap.source.publisher) err(`${M}: source needs publisher and an https url`);
  const ids = (bayMap.counties || []).map((c) => c.id);
  const miss = [...regionCounties].filter((c) => !ids.includes(c)), extra = ids.filter((c) => !regionCounties.has(c));
  if (miss.length || extra.length || ids.length !== new Set(ids).size) err(`${M}: counties must be exactly the region's counties, once each (missing: ${miss.join(", ") || "none"}; extra or repeated: ${extra.join(", ") || (ids.length !== new Set(ids).size ? "a repeat" : "none")})`);
  (bayMap.counties || []).forEach((c) => {
    if (typeof c.d !== "string" || !/^M[MLZz0-9.,\- ]+$/.test(c.d)) err(`${M} ${c.id}: d must be SVG path data (M, L, Z and numbers only)`);
    const jj = J.get(c.id);
    if (jj && c.name && jj.name.replace(/ County$| \(City and County\)$/, "") !== c.name) err(`${M} ${c.id}: name "${c.name}" does not match the jurisdiction "${jj.name}"`);
    if (!Array.isArray(c.label) || c.label.length !== 2 || !c.label.every(Number.isFinite)) err(`${M} ${c.id}: label must be [x, y]`);
  });
}
const allContests = [];
const measuresAll = [];
for (const e of elections) {
  const f = e.files;
  if (!f || !Array.isArray(f.measures) || !f.contests || !f.candidates) { err(`election ${e.id}: files.measures, files.contests and files.candidates are required`); continue; }
  f.measures.forEach((p) => scanUrls(readOnce(p), p));
  scanUrls(readOnce(f.contests), f.contests); scanUrls(readOnce(f.candidates), f.candidates);
  const measures = f.measures.flatMap((p) => ((readOnce(p) || {}).items || []).map((x) => ({ x, file: p })));
  const contests = (readOnce(f.contests) || {}).contests || [];
  const candidates = (readOnce(f.candidates) || {}).candidates || [];
  measures.forEach(({ x: m, file }) => {
    const w = `${file} ${m.id}`;
    measuresAll.push(m);
    claimId(m.id, file);
    checkRecord(m, w, ["election", "jurisdiction", "level", "identifier", "status", "lastVerified"]);
    if (!m.officialTitle && !m.shortTitle) err(`${w}: needs officialTitle or shortTitle`);
    if (m.election !== e.id) err(`${w}: election "${m.election}" does not match ${e.id}`);
    if (!J.has(m.jurisdiction)) err(`${w}: unknown jurisdiction "${m.jurisdiction}"`);
    if (!LEVELS.has(m.level)) err(`${w}: invalid level "${m.level}"`);
    const jt = (J.get(m.jurisdiction) || {}).type;
    const expect = { state: ["state"], county: ["county"], city: ["city"], school: ["school-district"], "community-college": ["community-college-district"], special: ["special-district", "region", "state-district"] }[m.level] || [];
    if (jt && !expect.includes(jt)) err(`${w}: level "${m.level}" does not match jurisdiction type "${jt}"`);
    if (!String(m.id).startsWith(e.id + ".")) err(`${w}: id should start with "${e.id}."`);
    checkSources(m.sources, w, m.status);
    if (m.status === "verified") for (const k of ["plainEnglish", "yes", "no"]) if (!m[k]) err(`${w}: verified items need "${k}"`);
    if (m.detailUrl) {
      const mm = /^propositions\.html#(prop-\d+)$/.exec(m.detailUrl);
      if (!mm) err(`${w}: detailUrl must look like propositions.html#prop-N`);
      else if (!(toolHtml.includes(`{ n: "${mm[1].slice(5)}",`) && toolHtml.includes(`id="prop-' + p.n`))) err(`${w}: detailUrl anchor ${mm[1]} is not rendered by propositions.html`);
    }
  });
  const contestIds = new Map();
  contests.forEach((c) => {
    const w = `${f.contests} ${c.id}`;
    claimId(c.id, f.contests); contestIds.set(c.id, c); allContests.push(c);
    checkRecord(c, w, ["election", "jurisdiction", "office", "status", "lastVerified"]);
    if (c.election !== e.id) err(`${w}: election mismatch`);
    if (!J.has(c.jurisdiction)) err(`${w}: unknown jurisdiction "${c.jurisdiction}"`);
    // R2-03: the id names the jurisdiction, so a contest moved to another jurisdiction must be renamed too.
    if (!String(c.id).startsWith(`${e.id}.${c.jurisdiction}.`)) err(`${w}: id must start with "${e.id}.${c.jurisdiction}." to match its jurisdiction`);
    if (c.seats !== undefined && c.seats !== null && !(Number.isInteger(c.seats) && c.seats >= 1)) err(`${w}: seats must be null (not known) or a whole number of at least 1`);
    if (!Array.isArray(c.candidates)) { err(`${w}: candidates must be an array`); c.candidates = []; }
    const dup = c.candidates.filter((x, i) => c.candidates.indexOf(x) !== i);
    if (dup.length) err(`${w}: candidate "${dup[0]}" is listed more than once`);
    checkSources(c.sources, w, c.status);
  });
  const candIds = new Set();
  candidates.forEach((p) => {
    // Candidate photos: only with a recorded permission, a local file and its source (Stage 2, Oct 24, 2026).
    if (p.photo !== undefined && p.photo !== null) {
      const ph = p.photo, w = `candidate ${p.id} photo`;
      if (typeof ph.src !== "string" || !/^assets\/candidates\/[a-z0-9-]+\.(jpg|png|webp)$/.test(ph.src)) err(`${w}: src must be a file under assets/candidates/`);
      else if (!fs.existsSync(path.join(root, ph.src))) err(`${w}: file ${ph.src} does not exist`);
      if (!isUrl(ph.sourceUrl) || !isUrl(ph.sourcePage)) err(`${w}: needs sourceUrl and sourcePage (https)`);
      pastDate(ph.retrieved, w, "retrieved");
      const pm = ph.permission || {};
      if (!pm.grantedBy || !pm.evidence) err(`${w}: needs permission.grantedBy and permission.evidence; public availability is not permission`);
      pastDate(pm.date, w, "permission.date");
      if (!ph.identityCheck) err(`${w}: needs identityCheck saying how the photo was matched to this candidate (never by name alone)`);
      if (!ph.credit || !ph.license) err(`${w}: needs credit and license for attribution`);
      // Accepted bases: public domain, CC0, CC BY, CC BY-SA, or recorded written permission.
      if (ph.license && !/^(Public domain|CC0|CC BY(-SA)? \d\.\d|Written permission)\b/.test(ph.license)) err(`${w}: license "${ph.license}" is not an accepted reuse basis`);
      if (!isUrl(ph.licenseUrl)) err(`${w}: needs licenseUrl (https) so the license can be linked`);
      if (!ph.year || !ph.modified) err(`${w}: needs year and modified (what was changed for this guide)`);
    }
    // Candidate evaluation ratings: each needs a 1-5 rating, a known basis, a note and an https source. A campaign
    // statement alone cannot support Evidence strength (a promise is not evidence that a policy works).
    if (p.evaluation !== undefined && p.evaluation !== null) {
      const ev = p.evaluation, w = `candidate ${p.id} evaluation`;
      if (!ev.ratings || typeof ev.ratings !== "object") err(`${w}: needs ratings`);
      else Object.entries(ev.ratings).forEach(([k, r]) => {
        if (!FACTOR_KEYS.includes(k)) { err(`${w}: unknown factor ${k}`); return; }
        if (!r || !Number.isInteger(r.rating) || r.rating < 1 || r.rating > 5) err(`${w} ${k}: rating must be a whole number from 1 to 5`);
        if (!r || !rubricBases.has(r.basis)) err(`${w} ${k}: basis must be one of ${[...rubricBases].join(", ")}`);
        if (!r || !r.note) err(`${w} ${k}: needs a note explaining the rating`);
        if (!r || !r.source || !isUrl(r.source.url)) err(`${w} ${k}: needs an https source`);
        if (r && k === "ev" && r.basis === "statement") err(`${w} ev: Evidence strength cannot rest on a campaign statement alone`);
      });
      pastDate(ev.reviewed, w, "reviewed");
    }
    const w = `${f.candidates} ${p.id}`;
    claimId(p.id, f.candidates); candIds.add(p.id);
    checkRecord(p, w, ["name", "contest", "status", "lastVerified"]);
    const c = contestIds.get(p.contest);
    if (!c) err(`${w}: contest "${p.contest}" does not exist`);
    else if (!c.candidates.includes(p.id)) err(`${w}: contest ${c.id} does not list this candidate`);
    if (p.statementUrl && !isUrl(p.statementUrl)) err(`${w}: statementUrl must be https`);
    if (p.financeUrl && !isUrl(p.financeUrl)) err(`${w}: financeUrl must be https`);
    checkSources(p.sources, w, p.status);
  });
  contests.forEach((c) => c.candidates.forEach((cid) => { if (!candIds.has(cid)) err(`${f.contests} ${c.id}: candidate "${cid}" does not exist`); }));
}

// ---------- candidate order (VAL-07) ----------
// The recorded order is the official ballot order as the guide currently lists it. Any change must be deliberate:
// rerun with --update-candidate-order after checking the official source, and commit the fixture with the data.
const orderNow = Object.fromEntries(allContests.map((c) => [c.id, c.candidates.slice()]));
if (process.argv.includes("--update-candidate-order")) {
  const out = { note: "Candidate order per contest, as listed by the official source. Changed only on purpose with: node tools/validate.mjs --update-candidate-order", recordedOn: TODAY, contests: orderNow };
  fs.mkdirSync(path.join(root, path.dirname(CANDIDATE_ORDER_FIXTURE)), { recursive: true });
  fs.writeFileSync(path.join(root, CANDIDATE_ORDER_FIXTURE), JSON.stringify(out, null, 1) + "\n");
  console.log(`Recorded candidate order for ${allContests.length} contests in ${CANDIDATE_ORDER_FIXTURE}.`);
  process.exit(0);
}
{
  let fx = null;
  try { fx = JSON.parse(fs.readFileSync(path.join(root, CANDIDATE_ORDER_FIXTURE), "utf8")).contests; } catch (e) { err(`${CANDIDATE_ORDER_FIXTURE} is missing or invalid. Record it with: node tools/validate.mjs --update-candidate-order`); }
  if (fx) {
    for (const [cid, list] of Object.entries(orderNow)) {
      if (!fx[cid]) err(`contest ${cid}: no recorded candidate order in ${CANDIDATE_ORDER_FIXTURE}. If the contest is new, check the official order and rerun with --update-candidate-order`);
      else if (JSON.stringify(fx[cid]) !== JSON.stringify(list)) err(`contest ${cid}: candidate order changed from the recorded order. If this is a deliberate correction from the official source, rerun with --update-candidate-order`);
    }
    for (const cid of Object.keys(fx)) if (!orderNow[cid]) err(`contest ${cid}: in ${CANDIDATE_ORDER_FIXTURE} but no longer in the data. If removed on purpose, rerun with --update-candidate-order`);
  }
}

// ---------- coverage labels must match the data ----------
const ownMeasures = new Map();
for (const m of measuresAll) { const c = countyOf(J.get(m.jurisdiction)); if (c) ownMeasures.set(c.id, (ownMeasures.get(c.id) || 0) + 1); }
counties.forEach((c) => {
  const n = ownMeasures.get(c.id) || 0, inv = (c.inventory || {}).measures;
  if (n && inv === "not-collected") err(`county ${c.id}: has ${n} local measures but inventory.measures is "not-collected"`);
  if (!n && (inv === "collected" || inv === "reconciled")) err(`county ${c.id}: inventory.measures is "${inv}" but no local measures are recorded; use "none-found-confirmed" with evidence, or "not-collected"`);
  if (c.coverage && c.coverage.status === "not-started" && n) err(`county ${c.id}: coverage "not-started" but ${n} local measures are recorded`);
  if (c.coverage && c.coverage.status !== "not-started" && !n) err(`county ${c.id}: coverage "${c.coverage.status}" but no local measures are recorded`);
  if (inv === "reconciled" && !(c.inventory.reconciledWith && c.inventory.reconciledWith.length)) err(`county ${c.id}: "reconciled" needs inventory.reconciledWith listing the official records checked`);
  if (inv === "none-found-confirmed" && !(c.sources && c.sources.length)) err(`county ${c.id}: "none-found-confirmed" needs a source`);
});
counties.forEach((c) => {
  const n = allContests.filter((x) => { const j = J.get(x.jurisdiction); return j && j.type !== "state-district" && (countyOf(j) || {}).id === c.id; }).length;
  const inv = (c.inventory || {}).contests;
  if (n && inv === "not-collected") err(`county ${c.id}: ${n} local contests recorded but inventory.contests is "not-collected"`);
  if (!n && (inv === "collected" || inv === "partial" || inv === "reconciled")) err(`county ${c.id}: inventory.contests is "${inv}" but no local contests are recorded`);
});

// ---------- coverage text vs inventory and reconciliation numbers (VAL-11, VAL-16) ----------
// Simple, explicit rules. Each one compares a phrase in free text with a number or status in the data.
counties.forEach((c) => {
  const w = `county ${c.id}`, inv = c.inventory || {}, r = inv.reconciliation;
  if (r) {
    if (r.date) pastDate(r.date, w, "inventory.reconciliation.date");
    if ([r.pagesChecked, r.pagesReached, r.notReachable].every((v) => typeof v === "number") && r.pagesReached + r.notReachable !== r.pagesChecked) err(`${w}: reconciliation pagesReached (${r.pagesReached}) + notReachable (${r.notReachable}) must equal pagesChecked (${r.pagesChecked})`);
    const s = String(r.summary || "");
    if (r.notReachable === 0 && /not (every|all)\b[^.]*\breached/i.test(s)) warn(`${w}: reconciliation.summary says not every page was reached, but ${r.pagesReached} of ${r.pagesChecked} were reached (notReachable 0)`);
    if (r.notReachable > 0 && /\b(every|all)\b[^.]*\b(were |was )?reached/i.test(s) && !/not (every|all)/i.test(s)) warn(`${w}: reconciliation.summary says every page was reached, but notReachable is ${r.notReachable}`);
    if (/\bthe list is reconciled\b|\bfully reconciled\b(?! )/i.test(s) && !/not (fully )?reconciled/i.test(s) && inv.measures !== "reconciled") warn(`${w}: reconciliation.summary says reconciled, but inventory.measures is "${inv.measures}"`);
  }
  const note = String((c.coverage || {}).note || "");
  if (!note) return;
  const listed = measuresAll.filter((m) => inCounty(m.jurisdiction, c.id));
  if (/\bmeasures? (have|has|are|is) not (yet )?(been )?collected\b|\bno local measures (have been|are) (collected|listed)\b/i.test(note) && ["collected", "partial", "reconciled"].includes(inv.measures)) warn(`${w}: coverage.note says measures are not collected, but inventory.measures is "${inv.measures}" (${listed.length} listed)`);
  // A note may count the county's own measures, or every measure item listed for it (own plus regional and shared districts).
  const own = ownMeasures.get(c.id) || 0;
  for (const m of note.matchAll(/\b(?:all )?(\d+) local measures\b/gi)) if (+m[1] !== listed.length && +m[1] !== own) warn(`${w}: coverage.note says ${m[1]} local measures, but the data has ${own} own measures and ${listed.length} measure items listed for the county`);
  for (const m of note.matchAll(/\b(\d+) (?:now )?have an official ballot question or (?:vote )?threshold\b/gi)) { const k = listed.filter((x) => x.level !== "state" && (x.ballotQuestion || x.threshold)).length; if (+m[1] !== k) warn(`${w}: coverage.note says ${m[1]} have a ballot question or threshold, but the data has ${k}`); }
  if (/\b(is|are|has been) reconciled\b/i.test(note) && !/not (yet )?(been )?reconciled/i.test(note) && inv.measures !== "reconciled") warn(`${w}: coverage.note says reconciled, but inventory.measures is "${inv.measures}"`);
  if (/\ball local measures are listed\b/i.test(note) && !["collected", "reconciled"].includes(inv.measures)) warn(`${w}: coverage.note says all local measures are listed, but inventory.measures is "${inv.measures}"`);
  if ((c.coverage || {}).listComplete === true && !["collected", "reconciled", "none-found-confirmed"].includes(inv.measures)) warn(`${w}: coverage.listComplete is true, but inventory.measures is "${inv.measures}"`);
});

// ---------- evidence ledger and source register ----------
const srcFile = readOnce("data/sources.json");
const srcReg = (srcFile || {}).sources || [];
const SRC = new Map(srcReg.map((s) => [s.id, s]));
srcReg.forEach((s) => {
  if (!isUrl(s.url)) err(`source ${s.id}: url must be https`);
  pastDate(s.retrieved, `source ${s.id}`, "retrieved", { nullable: true });
  pastDate(s.documentDate, `source ${s.id}`, "documentDate", { nullable: true });
  if (!["accessed", "accessed-text-not-extracted", "unavailable"].includes(s.accessStatus)) err(`source ${s.id}: invalid accessStatus`);
});
scanUrls(srcFile, "data/sources.json");
const accessFile = readOnce("data/source-access.json");
scanUrls(accessFile, "data/source-access.json");
const claimsFile = readOnce("data/evidence-claims.json");
scanUrls(claimsFile, "data/evidence-claims.json");
const evFile = readOnce("data/evidence.json");
scanUrls(evFile, "data/evidence.json");
const ev = (evFile || {}).evidence || [];

// The value of a published field. "tool.*" fields refer to the PROPS data in propositions.html.
function fieldValue(rec, field) {
  if (!rec) return undefined;
  if (field.startsWith("tool.")) return rec.level === "state" ? "(propositions.html)" : undefined;
  return rec[field];
}
// partialCounties: counties split between districts (the district covers only part of them).
jur.forEach((j) => {
  if (j.partialCounties === undefined) return;
  const w = `jurisdiction ${j.id}`;
  if (!Array.isArray(j.partialCounties)) { err(`${w}: partialCounties must be an array`); return; }
  if (!j.countiesKnown) err(`${w}: partialCounties needs countiesKnown true`);
  j.partialCounties.forEach((cid) => {
    const c = J.get(cid);
    if (!c || c.type !== "county") err(`${w}: partialCounties entry "${cid}" is not a county`);
    else if (!(j.counties || []).includes(cid)) err(`${w}: partialCounties entry "${cid}" is not in counties`);
  });
});
const officialBacked = new Set(), excerptsFor = new Map();
const covered = new Set(), backed = new Set();
ev.forEach((x) => {
  const rec = allRecords.get(x.subject);
  if (!rec) err(`evidence ${x.id}: subject "${x.subject}" does not exist`);
  (x.sources || []).forEach((sid) => { if (!SRC.has(sid)) err(`evidence ${x.id}: source "${sid}" not in data/sources.json`); });
  if (!(x.sources || []).length) err(`evidence ${x.id}: no sources`);
  if (x.linkLevel === "claim") {
    if (!(x.excerpt && String(x.excerpt).trim() && x.claim)) err(`evidence ${x.id}: claim-level evidence needs claim and a non-empty excerpt`);
    if (!("location" in x)) err(`evidence ${x.id}: claim-level evidence needs a location key (null if the source shows none)`);
    if (!x.explanation) err(`evidence ${x.id}: claim-level evidence needs an explanation`);
    if (!VERDICTS.has(x.verdict)) err(`evidence ${x.id}: verdict must be one of ${[...VERDICTS].join(", ")}`);
    pastDate(x.retrieved, `evidence ${x.id}`, "retrieved");
    if (!x.excerptMethod) err(`evidence ${x.id}: excerptMethod is required`);
    const published = rec && isPublished(x.field, fieldValue(rec, x.field));
    if (rec && x.field && !published) err(`evidence ${x.id}: field "${x.field}" is not published on ${x.subject}`);
    // VAL-03: a negative verdict cannot sit behind text the guide shows.
    if (published && (x.verdict === "unsupported" || x.verdict === "not-found")) err(`evidence ${x.id}: verdict "${x.verdict}" cannot back the published field "${x.field}" of ${x.subject}; withhold or correct the field`);
    const st = (x.sources || []).map((sid) => (SRC.get(sid) || {}).accessStatus);
    if (st.length && st.every((s) => s === "unavailable" || s === "accessed-text-not-extracted")) warn(`evidence ${x.id}: every source behind this claim is unavailable or its text was not extracted (${st.join(", ")})`);
    if (published && BACKING_VERDICTS.has(x.verdict) && x.excerpt && String(x.excerpt).trim() && x.reviewStatus !== "superseded") {
      backed.add(x.subject + "|" + x.field);
      // R2-01: thresholds, ballot questions and measure types need an official, non-attribution, current row.
      // The source type must start with "Official" ("Independent copy of official text" and "Unofficial ..." do not count).
      const official = /^Official\b/.test(x.sourceType || ((SRC.get((x.sources || [])[0]) || {}).sourceType) || "");
      if (official && x.verdict !== "attribution") {
        officialBacked.add(x.subject + "|" + x.field);
        if (!excerptsFor.has(x.subject + "|" + x.field)) excerptsFor.set(x.subject + "|" + x.field, []);
        excerptsFor.get(x.subject + "|" + x.field).push(String(x.excerpt));
      }
    }
  } else if (x.linkLevel === "record") {
    if (x.excerpt) err(`evidence ${x.id}: record-level links must not carry excerpts`);
    if (x.reviewStatus === "verified") err(`evidence ${x.id}: a record-level link cannot be verified evidence`);
  } else err(`evidence ${x.id}: linkLevel must be "claim" or "record"`);
  if (x.reviewStatus && !STATUSES.has(x.reviewStatus)) err(`evidence ${x.id}: invalid reviewStatus "${x.reviewStatus}"`);
  if (x.reviewStatus === "verified" && !(x.reviewer && isDate(x.reviewDate))) err(`evidence ${x.id}: reviewed evidence needs reviewer and reviewDate`);
  if (x.reviewDate) pastDate(x.reviewDate, `evidence ${x.id}`, "reviewDate");
  if ((x.sources || []).some((sid) => (SRC.get(sid) || {}).accessStatus === "accessed-text-not-extracted") && x.reviewStatus === "verified") err(`evidence ${x.id}: cannot be verified from a source whose text was not extracted`);
  covered.add(x.subject + "|" + x.field);
});
// data/evidence.json is generated from data/evidence-claims.json. A stale ledger hides edits (VAL-09).
{
  const byId = new Map(ev.filter((x) => x.linkLevel === "claim").map((x) => [x.id, x]));
  const claims = (claimsFile || {}).claims || [];
  let stale = 0;
  for (const c of claims) {
    const e = byId.get(c.id);
    if (!e || e.excerpt !== c.excerpt || e.verdict !== c.verdict || e.field !== c.field || e.subject !== c.subject || e.retrieved !== c.retrieved || e.sourceUrl !== c.url) { if (stale++ < 5) err(`evidence ${c.id}: data/evidence.json does not match data/evidence-claims.json. Run npm run build`); }
  }
  if (stale > 5) err(`...and ${stale - 5} more claims out of date in data/evidence.json`);
  if (claims.length && byId.size !== claims.length) err(`data/evidence.json has ${byId.size} claim-level records but data/evidence-claims.json has ${claims.length}. Run npm run build`);
}
// Verified records need claim-level evidence for every published field.
for (const [id, r] of allRecords) if (r.status === "verified") for (const f of CLAIM_FIELDS) {
  if (!isPublished(f, r[f])) continue;
  if (!backed.has(id + "|" + f)) err(`${id}: verified record has no claim-level evidence for "${f}"`);
}
// Thresholds, ballot questions and measure types need claim-level evidence whatever the status (VAL-04).
const normText = (t) => String(t || "").replace(/[“”"‘’'`]/g, "").replace(/\s*(--|[–—-])\s*/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
// A ballot question passes when it is the excerpt (allowing at most 10% of the excerpt to be left out), not a fragment of it.
const questionMatches = (q, e) => { q = normText(q); e = normText(e); return q.length > 0 && e.includes(q) && q.length >= 0.9 * e.length; };
const thresholdClass = (t) => { t = String(t || "").toLowerCase(); return /two[- ]thirds|2\/3|66\.6/.test(t) ? "2/3" : /55\s*%|55 percent/.test(t) ? "55%" : /majority|50\s*%\s*\+\s*1|50%\+1|50 percent/.test(t) ? "majority" : null; };
for (const m of measuresAll) for (const f of REQUIRED_CLAIM_FIELDS) {
  if (!isPublished(f, m[f])) continue;
  const key = m.id + "|" + f;
  if (!backed.has(key)) { err(`${m.id}: published "${f}" needs claim-level evidence with a non-empty excerpt and a supporting verdict`); continue; }
  if (!officialBacked.has(key)) { err(`${m.id}: published "${f}" needs a current claim row from an Official source (superseded and attribution rows do not count)`); continue; }
  const ex = excerptsFor.get(key) || [];
  // R2-02: the published value must match what its evidence says.
  if (f === "ballotQuestion" && !ex.some((e) => questionMatches(m[f], e))) err(`${m.id}: the published ballot question does not match any of its official excerpts (it must be the excerpt's full text, not a fragment)`);
  if (f === "threshold" && !ex.some((e) => thresholdClass(e) && thresholdClass(e) === thresholdClass(m[f]))) err(`${m.id}: the published threshold ("${m[f]}") does not match the vote requirement stated in its official excerpts`);
}
let uncovered = 0;
for (const [id, r] of allRecords) for (const f of CLAIM_FIELDS) {
  if (!isPublished(f, r[f])) continue;
  if (!covered.has(id + "|" + f)) { uncovered++; if (uncovered <= 20) err(`${id}: published field "${f}" has no evidence record. Run npm run build`); }
}
if (uncovered > 20) err(`...and ${uncovered - 20} more fields without evidence`);
const claimLevel = ev.filter((x) => x.linkLevel === "claim").length;
console.log(`Evidence: ${ev.length} records, ${claimLevel} with claim-level excerpts, ${ev.filter((x) => x.reviewStatus === "verified").length} human-reviewed. Sources: ${srcReg.length}, ${srcReg.filter((s) => s.accessStatus !== "accessed").length} not fully read (${srcReg.filter((s) => s.accessStatus === "accessed-text-not-extracted").length} text not extracted, ${srcReg.filter((s) => s.accessStatus === "unavailable").length} unavailable).`);

// ---------- statewide items must match the full proposition tool ----------
{
  const props = [...toolHtml.matchAll(/\{ n: "(\d+)", name: "((?:[^"\\]|\\.)*)"/g)].map((m) => ({ n: m[1], name: JSON.parse('"' + m[2] + '"') }));
  const items = ((readOnce("data/2026-11-03/statewide.json") || {}).items || []);
  if (props.length !== items.length) err(`statewide.json has ${items.length} items but propositions.html has ${props.length}. Rerun npm run build`);
  for (const p of props) {
    const it = items.find((x) => x.id === `2026-11-03.ca.prop-${p.n}`);
    if (!it) err(`statewide.json has no item for Prop ${p.n}. Rerun npm run build`);
    else if (it.shortTitle !== p.name) err(`statewide.json Prop ${p.n} shortTitle "${it.shortTitle}" differs from propositions.html "${p.name}". Rerun npm run build`);
  }
}

warnings.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
if (httpExceptions.length) console.log(`INFO  ${httpExceptions.length} http URLs kept as documented exceptions: ${httpExceptions.join(", ")}`);
console.log(`${errors.length} errors, ${warnings.length} warnings, ${ids.size} ids checked (run date ${TODAY}).`);
process.exit(errors.length ? 1 : 0);
