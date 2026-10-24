// Builds the source register (data/sources.json) and the evidence ledger (data/evidence.json).
//   node tools/build-ledger.mjs [--root <dir>]
// Two kinds of evidence records:
//   linkLevel "record": every published field of a record is linked to that record's listed sources.
//     This proves traceability to a source document, NOT that the document supports each sentence.
//   linkLevel "claim":  hand-curated records in data/evidence-claims.json with an excerpt and location.
// Neither kind makes anything Verified. Only a recorded human review can (see docs/DATA-MODEL.md).
// Importing this module has no side effects. tools/validate.mjs imports CLAIM_FIELDS and isPublished
// from here, so the validator and the ledger always agree on which fields need evidence (VAL-05).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const CLAIM_FIELDS = ["officialTitle", "plainEnglish", "why", "yes", "no", "benefits", "risks", "affected", "fiscal", "evidence", "uncertain", "argFor", "argAgainst", "supporters", "opponents", "threshold", "name", "party", "designation", "incumbent", "office", "district", "candidates"];
// A field counts as published when it has a value a voter would see.
export function isPublished(field, v) {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && !v.length) return false;
  if (field === "incumbent" && v === false) return false;
  return true;
}
// Heuristic used to mark Alameda registrar PDFs as scanned. It is a guess from the record, not an observed read;
// data/source-access.json overrides it with recorded retrieval attempts.
export const SCANNED_NOTE = "Scanned PDF; text could not be extracted, so its contents have not been reviewed.";

export function build(root) {
  const rd = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
  const sid = (url) => "src-" + crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const publisher = (url) => {
    const h = new URL(url).hostname.replace(/^www\./, "");
    const map = { "lao.ca.gov": "Legislative Analyst's Office", "voterguide.sos.ca.gov": "California Secretary of State", "vig.cdn.sos.ca.gov": "California Secretary of State", "elections.cdn.sos.ca.gov": "California Secretary of State", "sos.ca.gov": "California Secretary of State", "powersearch.sos.ca.gov": "California Secretary of State", "acvote.alamedacountyca.gov": "Alameda County Registrar of Voters", "sf.gov": "City and County of San Francisco", "media.api.sf.gov": "City and County of San Francisco", "boe.ca.gov": "California State Board of Equalization", "ebudget.ca.gov": "California Department of Finance" };
    return map[h] || h;
  };

  const sources = new Map();
  function addSource(s, retrieved, extra) {
    if (!s || !s.url) return null;
    const id = sid(s.url);
    const prev = sources.get(id);
    const primary = /^Official\b/.test(s.type || "");
    const rec = prev || { id, title: s.label, publisher: publisher(s.url), url: s.url, sourceType: s.type || "Unspecified", primary, documentDate: null, retrieved: retrieved || null, accessStatus: "accessed", notes: [] };
    if (retrieved && (!rec.retrieved || retrieved > rec.retrieved)) rec.retrieved = retrieved;
    if (extra && extra.accessStatus) rec.accessStatus = extra.accessStatus;
    if (extra && extra.note && !rec.notes.includes(extra.note)) rec.notes.push(extra.note);
    sources.set(id, rec);
    return id;
  }

  const elections = rd("data/elections.json").elections;
  const jur = rd("data/jurisdictions.json").jurisdictions;
  jur.forEach((j) => (j.sources || []).forEach((s) => addSource(s, j.inventory && j.inventory.lastChecked)));
  const evidence = [];
  for (const e of elections) {
    const recs = [];
    e.files.measures.forEach((p) => rd(p).items.forEach((x) => recs.push(["measure", x])));
    rd(e.files.contests).contests.forEach((x) => recs.push(["contest", x]));
    rd(e.files.candidates).candidates.forEach((x) => recs.push(["candidate", x]));
    for (const [kind, x] of recs) {
      const scanned = x.status === "incomplete" && /acvote\.alamedacountyca\.gov/.test(JSON.stringify(x.sources));
      const ids = (x.sources || []).map((s) => addSource(s, x.lastVerified, scanned && /Official measure document/.test(s.label) ? { accessStatus: "accessed-text-not-extracted", note: SCANNED_NOTE } : null)).filter(Boolean);
      for (const f of CLAIM_FIELDS) {
        if (!isPublished(f, x[f])) continue;
        evidence.push({ id: `ev-${x.id}-${f}`, subject: x.id, subjectKind: kind, field: f, linkLevel: "record", sources: ids,
          verdict: "link-only", excerpt: null, location: null, explanation: "Linked to the sources listed on this record. No claim-level excerpt has been recorded for this field, so this link shows where to look, not that the source supports the wording.",
          reviewStatus: "needs-review", reviewer: null, reviewDate: null });
      }
    }
  }
  // Hand-curated claim-level evidence
  const claimsPath = path.join(root, "data/evidence-claims.json");
  const claims = fs.existsSync(claimsPath) ? JSON.parse(fs.readFileSync(claimsPath, "utf8")).claims : [];
  for (const c of claims) {
    const srcId = addSource({ label: c.sourceTitle, url: c.url, type: c.sourceType }, c.retrieved);
    const extra = (c.additionalSources || []).map((s) => ({ id: addSource({ label: s.title, url: s.url, type: s.sourceType }, s.retrieved || c.retrieved), role: s.role || null }));
    const src = sources.get(srcId);
    evidence.push({ id: c.id, subject: c.subject, subjectKind: c.subjectKind, field: c.field, linkLevel: "claim", sources: [srcId, ...extra.map((x) => x.id)],
      claim: c.claim, interpretive: !!c.interpretive, verdict: c.verdict,
      sourceUrl: c.url, sourceTitle: src.title, sourceType: c.sourceType || src.sourceType, publisher: src.publisher, primary: src.primary, documentDate: c.documentDate || src.documentDate || null,
      retrieved: c.retrieved, excerpt: c.excerpt, location: c.location || null, excerptMethod: c.excerptMethod, readingsMatched: c.readingsMatched ?? null,
      explanation: c.explanation, sourceRoles: extra.length ? [{ id: srcId, role: c.sourceRole || "primary support" }, ...extra] : null,
      limitations: c.limitations || null, reviewStatus: c.reviewStatus, reviewer: c.reviewer || null, reviewDate: c.reviewDate || null });
  }

  // Recorded retrieval attempts for sources that could not be fully read
  const accessPath = path.join(root, "data/source-access.json");
  const access = fs.existsSync(accessPath) ? JSON.parse(fs.readFileSync(accessPath, "utf8")).sources : {};
  for (const s of sources.values()) {
    const a = access[s.url];
    if (a) { s.accessStatus = a.accessStatus; s.retrievalAttempts = a.attempts; s.alternativeSource = a.alternative; s.notes = [a.note]; }
  }
  const srcList = [...sources.values()].sort((a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title));
  fs.writeFileSync(path.join(root, "data/sources.json"), JSON.stringify({ schemaVersion: 1, generatedBy: "tools/build-ledger.mjs", sources: srcList }, null, 1) + "\n");
  fs.writeFileSync(path.join(root, "data/evidence.json"), JSON.stringify({ schemaVersion: 1, generatedBy: "tools/build-ledger.mjs", evidence }, null, 1) + "\n");
  return { sources: srcList.length, evidence: evidence.length, claims: evidence.filter((e) => e.linkLevel === "claim").length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--root");
  const root = i > 0 ? path.resolve(process.argv[i + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const r = build(root);
  console.log(`${r.sources} sources, ${r.evidence} evidence records (${r.claims} claim-level).`);
}
