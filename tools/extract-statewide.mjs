// Generates data/2026-11-03/statewide.json from the PROPS data embedded in propositions.html,
// so the ballot guide and the full proposition tool share one source of truth.
// Usage: node tools/extract-statewide.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const html = fs.readFileSync(path.join(root, "propositions.html"), "utf8");
const start = html.indexOf("  var LAO = ");
const end = html.indexOf("\n  ];", html.indexOf("  var PROPS = [")) + 5;
if (start < 0 || end < 5) throw new Error("Could not find the PROPS block in propositions.html");
const ctx = {};
vm.runInNewContext(html.slice(start, end) + "\nthis.PROPS = PROPS;", ctx);

const ELECTION = "2026-11-03";
const VERIFIED = "2026-10-22";
const review = JSON.parse(fs.readFileSync(path.join(root, "data", "statewide-review.json"), "utf8"));
const sentence = (s) => (s ? String(s).trim() : null);

const items = ctx.PROPS.map((p) => {
  const placedBy = /Legislature/.test(p.kind) ? "Placed on the ballot by the California Legislature." : "Placed on the ballot by citizen petition (initiative).";
  return {
    id: `${ELECTION}.ca.prop-${p.n}`,
    election: ELECTION,
    jurisdiction: "ca",
    level: "state",
    kind: "measure",
    identifier: `Prop ${p.n}`,
    shortTitle: p.name,
    officialTitle: p.title,
    measureType: p.type,
    topic: p.topic,
    status: "needs-review",
    review: null,
    lastVerified: VERIFIED,
    detailUrl: `propositions.html#prop-${p.n}`,
    plainEnglish: sentence(p.does),
    why: `${placedBy} The official arguments below explain each side's stated goals.`,
    yes: [sentence(p.yes), sentence(p.yesE)].filter(Boolean).join(" "),
    no: [sentence(p.no), sentence(p.noE)].filter(Boolean).join(" "),
    benefits: sentence(p.out),
    risks: [sentence(p.risk), "Trade-off. " + sentence(p.tw)].filter(Boolean).join(" "),
    affected: sentence(p.who),
    fiscal: sentence(p.money),
    evidence: `Accountability. ${sentence(p.acct)} Ratings on seven evidence factors, with reasons and sources, are in the full proposition tool.`,
    uncertain: sentence(p.unk),
    argFor: sentence(p.argFor),
    argAgainst: sentence(p.argAgainst),
    supporters: sentence(p.pro),
    opponents: sentence(p.con),
    sources: p.src.map((s) => ({ label: s[0], url: s[1], type: s[2] })),
    notes: `Every field was audited on ${review.auditDate} against the official voter guide, the LAO analysis, the official arguments and, where it could be read, the legal text, by automated research. A log of the corrections is kept with the guide's records. No person has reviewed the result, so it is not marked Verified.`,
    gaps: ((review.props[p.n] || {}).gaps || [])
  };
});

const out = { schemaVersion: 1, election: ELECTION, generatedFrom: "propositions.html", items };
fs.writeFileSync(path.join(root, "data", ELECTION, "statewide.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${items.length} statewide items.`);
