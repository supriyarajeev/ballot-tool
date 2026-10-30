// Framework v3 data change (October 29, 2026). Run once on the live version (c61b628) of propositions.html.
//   node audit/2026-10-29/apply_framework_v3.mjs
// 1. Drops the Net benefit rating (s.nb, r.nb, rs.nb). Its reasons are kept in audit/2026-10-29/net-benefit-removed.json.
// 2. Merges Accountability (ac) and Outcome clarity (oc) into one factor, key ac:
//      rating = (ac + oc) / 2, kept as is (it can be x.5). The two parts are kept in sub: { ac, oc } for display.
//      limited if either part was limited; reason = both reasons, labeled; sources = both lists, merged.
// 3. No other rating changes. ev, lr, if, fc are copied unchanged.
// 4. Adds fact fields, written only from the card's already audited text and from official documents checked on
//    October 29, 2026 (see FRAMEWORK-V3-AUDIT.md): gain, pay (who could gain, who pays or gives something up),
//    chg (how hard to change later, from each measure's legal text), rel (other measures on this ballot), fund
//    (Secretary of State contribution totals page for the measure).
import fs from "node:fs";
import vm from "node:vm";

const file = new URL("../../propositions.html", import.meta.url);
let s = fs.readFileSync(file, "utf8");
const a = s.indexOf("  var FACTORS = ["), b = s.indexOf("\n  ];", s.indexOf("  var PROPS = [")) + 5;
const ctx = {}; vm.createContext(ctx);
vm.runInContext(s.slice(a, b) + ";this.P = PROPS;", ctx);
const P = ctx.P;

const SOSFUND = "https://www.sos.ca.gov/campaign-lobbying/helpful-resources/measure-contributions/2026-ballot-measure-contribution-totals/";
const FUND = {
  "1": "proposition-1-sb-417-limon-veterans-and-affordable-housing-bond-act-2026-ch-16-2026",
  "2": "proposition-2-aca-20-gabriel-save-californias-future-act-res-ch-130-2026",
  "3": "proposition-3-provides-permanent-funding-schools-and-healthcare-extending-existing-tax-high-incomes-initiative-constitutional-am",
  "4": "proposition-4-sb-42-umberg-political-reform-act-1974-public-campaign-financing-california-fair-elections-act-2026-ch-245-2025",
  "5": "proposition-5-sca-1-newman-elections-recall-state-officers-res-ch-204-2024",
  "37": "proposition-37-creates-loan-program-middle-income-buyers-qualified-new-homes-initiative-statute",
  "38": "proposition-38-authorizes-bonds-immunology-research-initiative-statut",
  "39": "proposition-39-establishes-additional-voter-identification-and-citizenship-verification-requirements-initiative-constitutional-a",
  "40": "proposition-40-imposes-one-time-tax-certain-individuals-and-trusts-initiative-constitutional-amendment-and-statute",
  "41": "proposition-41-requires-audits-programs-funded-new-state-special-taxes-prohibits-new-state-taxes-are-excluded-existing-voter-app",
  "42": "proposition-42-prohibits-new-state-personal-property-taxes-and-certain-retroactive-state-taxes-initiative-constitutional-amendme",
  "43": "proposition-43-aca-22-wicks-local-taxes-limitation-res-ch-132-2026",
  "44": "proposition-44-requires-community-health-clinics-spend-90-percent-revenue-program-services-initiative-statute",
  "45": "proposition-45-modifies-environmental-review-certain-projects-initiative-statute"
};

// How hard to change later. [short label, detail]. Constitutional amendments: California Constitution Article XVIII.
// Statutes: each measure's own amendment clause in its legal text (quoted in FRAMEWORK-V3-AUDIT.md).
const CA = ["Another statewide vote", "It changes the California Constitution, so any later change needs another statewide vote."];
const CHG = {
  "1": ["The Legislature can shift the money", "This bond law lets the Legislature, by passing a law, move the bond money among the housing programs it lists."],
  "2": CA, "3": CA, "5": CA, "39": CA, "41": CA, "42": CA, "43": CA,
  "4": ["Mostly another statewide vote", "Most of the new public funding rules can be changed only with another statewide vote. Its definitions, the rule for raising spending limits and the line on state enforcement can be changed by a two-thirds vote of the Legislature, if the change furthers the Political Reform Act's purposes."],
  "37": ["60% of the Legislature, within limits", "The Legislature can change it with more than 60% of each house and the Governor's signature, if the change is consistent with and furthers its purposes. Other changes need another statewide vote."],
  "38": ["Two-thirds of the Legislature, within limits", "The Legislature can change it with two-thirds of each house and the Governor's signature, if the change furthers its purposes. How the bond money is allocated and what it can be spent on cannot be changed this way."],
  "40": ["Mixed", "The parts that change the California Constitution need another statewide vote. The Legislature can change the Billionaire Tax Act part with two-thirds of each house, if the change is consistent with and furthers its purposes."],
  "44": ["Majority of the Legislature, within limits", "The Legislature can change it with an ordinary law signed by the Governor, but only to further its purposes. Other changes need another statewide vote."],
  "45": ["Two-thirds of the Legislature, within limits", "The Legislature can change it with two-thirds of each house, if the change is consistent with and furthers its purposes. The bill must be published 12 business days before the vote."]
};

// Who could gain, and who pays or gives something up. Only from the card's audited text (money, who, yesE, tw,
// risk, argFor). Claims made by one side are attributed to that side.
const GP = {
  "1": ["Low and moderate income renters and buyers, and veterans through CalVet home loans. LAO estimates up to 40,000 subsidized rentals and up to 40,000 households helped to buy.", "State taxpayers, about $500 million to $600 million a year for about 25 years, per LAO. Veterans repay the CalVet share through their loans."],
  "2": ["People and programs that rely on state services in a downturn. LAO says state budget reserves would be higher.", "Programs or taxpayer rebates in years when more is saved. The state must also make extra debt payments through 2040 instead of 2030."],
  "3": ["Public schools and community colleges, roughly 40% of the money, and other state programs including health care. LAO estimates $5 billion to $15 billion a year from 2031.", "About the top 2% of filers, on income above about $371,000 for single filers. The higher rates stay instead of expiring in 2031."],
  "4": ["Candidates who qualify for public money where a government creates a program. Supporters say this helps candidates without wealthy backers.", "Taxpayers where programs are created, at costs set later. LAO estimates state costs of a few hundred thousand dollars a year."],
  "5": ["Supporters say voters avoid replacements chosen by a small plurality.", "Voters lose the question of who replaces a recalled official. The office is filled by succession, special election or appointment. LAO puts the net cost or savings under 0.1% of the General Fund."],
  "37": ["Middle-income buyers of newly built homes who use the program, and home builders.", "Buyers, who repay a state loan of up to 17% of the price. LAO finds no direct state or local cost."],
  "38": ["Researchers and institutions that receive the money, including one institute picked by the state health department, and patients if the research leads to treatments.", "State taxpayers, about $500 million to $600 million a year for about 20 years, per LAO. Licensing revenue could offset part of this, but LAO says that is uncertain and could take decades."],
  "39": ["Supporters say voter trust grows with a uniform ID rule and yearly public citizenship reports.", "State and county budgets, tens of millions to low hundreds of millions of dollars a year, per LAO. Mail voters whose ballots lack matching ID digits, whose ballots would not count."],
  "40": ["Public health care programs, which get 90% of the money after administrative costs, plus education and food assistance.", "A few hundred billionaires who lived in California on January 1, 2026, per LAO. The state could lose under $1 billion a year in income tax if billionaires leave."],
  "41": ["Voters and taxpayers, who get State Auditor reviews of programs funded by new special taxes.", "The state pays audit costs of low millions of dollars a year, per LAO, and LAO says the state might not be able to leave new special tax spending out of the spending limit. Prop 40 could be stopped if Prop 41 gets more yes votes."],
  "42": ["Owners of financial assets and other personal property, who would be protected from new state taxes on owning them.", "The state gives up that way of raising money. LAO says future tax revenue might not grow as much. Prop 40 could be stopped if Prop 42 gets more yes votes."],
  "43": ["Taxpayers in places where a citizen-proposed special tax would pass with a simple majority but not with two-thirds.", "Local services those taxes would pay for. LAO says local revenue could be lower. Citizen tax campaigns face a higher bar."],
  "44": ["Supporters say patients gain when more clinic revenue goes to program services.", "Clinics below 90%, which pay the gap as a penalty, refundable if they comply within five years. LAO says some clinics might close. State costs of low tens of millions a year are covered by fees on clinics."],
  "45": ["Developers and public agencies with eligible projects, which get firm review and court deadlines.", "Environmental review and public input become narrower, and tribal consultation is limited to federally recognized tribes. LAO estimates early state and local costs in the high tens of millions a year."]
};

// Other measures on this ballot. Legal interactions only where the official analysis names one (Props 40, 41, 42, in
// the "Potential Interactions With Other Propositions" box of the printed Official Voter Information Guide).
// "Related" lines say only that two measures deal with the same thing, from each one's official analysis.
const NONE = "The official analysis names no interaction with other measures on this ballot.";
const REL = {
  "1": NONE + " Related. Prop 37 also helps people buy homes, through state loans for new homes.",
  "2": NONE + " Related. Prop 41 also changes what counts under the state spending limit.",
  "3": NONE + " Related. Prop 40 also taxes the wealthiest Californians, mostly for health care.",
  "4": NONE, "5": NONE, "38": NONE, "39": NONE, "44": NONE, "45": NONE,
  "37": NONE + " Related. Prop 1 also helps people buy homes, including CalVet home loans for veterans.",
  "40": "The official analysis says Prop 40 could be stopped if Prop 41 or Prop 42 gets more yes votes, because courts could find a conflict. See the note on this card. Related. Prop 3 also taxes the highest earners, partly for health care.",
  "41": "The official analysis says Prop 40 could be stopped if Prop 41 gets more yes votes than Prop 40. See the note on this card. Related. Prop 2 also changes what counts under the state spending limit, and Prop 43 also deals with special taxes, at the local level.",
  "42": "The official analysis says Prop 40 could be stopped if Prop 42 gets more yes votes than Prop 40. See the note on this card.",
  "43": NONE + " Related. Prop 41 also deals with special taxes, at the state level."
};

const q = (x) => JSON.stringify(x).replace(/","/g, '", "');
const obj = (o) => "{ " + Object.keys(o).map((k) => k + ": " + (typeof o[k] === "string" ? q(o[k]) : Array.isArray(o[k]) ? "[" + o[k].join(", ") + "]" : o[k])).join(", ") + " }";
const removed = {};
const KEYS = ["ev", "lr", "ac", "if", "fc"];

for (const p of P) {
  const n = p.n;
  removed[n] = { nb: p.s.nb, reason: p.r.nb, sources: p.rs.nb, ac: p.s.ac, oc: p.s.oc };
  const s2 = { ev: p.s.ev, lr: p.s.lr, ac: (p.s.ac + p.s.oc) / 2, if: p.s.if, fc: p.s.fc };
  const u2 = {}; ["ev", "lr", "if", "fc"].forEach((k) => { if (p.u[k]) u2[k] = 1; }); if (p.u.ac || p.u.oc) u2.ac = 1;
  const r2 = { ev: p.r.ev, lr: p.r.lr, ac: "Checks on the work, " + p.s.ac + " of 5. " + p.r.ac + " Measurable results, " + p.s.oc + " of 5. " + p.r.oc, if: p.r.if, fc: p.r.fc };
  const rs2 = {}; KEYS.forEach((k) => { rs2[k] = k === "ac" ? [...new Set([...(p.rs.ac || []), ...(p.rs.oc || [])])] : p.rs[k]; });

  const start = s.indexOf('{ n: "' + n + '"');
  const end = s.indexOf("\n    { n: ", start + 5) > 0 ? s.indexOf("\n    { n: ", start + 5) : s.indexOf("\n  ];", start);
  let block = s.slice(start, end);
  const lines = block.split("\n");
  const iS = lines.findIndex((l) => l.startsWith("      s: {"));
  const iR = lines.findIndex((l) => l.startsWith("      r: {"));
  const iRs = lines.findIndex((l) => l.startsWith("      rs: {"));
  const iTw = lines.findIndex((l) => l.startsWith("      tw: "));
  if (iS < 0 || iR !== iS + 1 || iRs !== iR + 1 || iTw < 0) throw new Error("unexpected layout for " + n);
  lines[iS] = "      s: " + obj(s2) + ", u: " + (Object.keys(u2).length ? obj(u2) : "{}") + ", sub: { ac: " + p.s.ac + ", oc: " + p.s.oc + " },";
  lines[iR] = "      r: " + obj(r2) + ",";
  lines[iRs] = "      rs: " + obj(rs2) + ",";
  lines.splice(iTw + 1, 0,
    "      gain: " + q(GP[n][0]) + ",",
    "      pay: " + q(GP[n][1]) + ",",
    "      chg: " + q(CHG[n]) + ",",
    "      rel: " + q(REL[n]) + ",",
    "      fund: " + q(SOSFUND + FUND[n]) + ",");
  s = s.slice(0, start) + lines.join("\n") + s.slice(end);
}
fs.writeFileSync(file, s);
fs.writeFileSync(new URL("./net-benefit-removed.json", import.meta.url), JSON.stringify(removed, null, 1) + "\n");
console.log("updated", P.length, "propositions");
