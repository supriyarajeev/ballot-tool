# Optional corrections O1 to O8 from audit/2026-10-24/stage1/STAGE1-REPORT.md, applied on Oct 24, 2026 under the owner's
# instruction to apply optional items "only when independently supported by authoritative evidence". Each official quote
# below was re-read on Oct 24, 2026 before the change. Ratings, weights, reasons and scoring are untouched.
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
p = root / "propositions.html"; s = p.read_text()
G = "https://voterguide.sos.ca.gov/propositions/"
C = [
 ("O1","5","src (official arguments link)",
  '["Official arguments", SOSPDF + "prop5.pdf", "Official, campaign arguments"]',
  '["Official arguments", SOS + "5/arguments-rebuttals.htm", "Official, campaign arguments"]',
  "Page heading \"ARGUMENT IN FAVOR OF PROPOSITION 5\" on the official Arguments and Rebuttals page (same signers as the print PDF). Same position in the list, so reason-source indexes are unchanged.", G+"5/arguments-rebuttals.htm"),
 ("O2","37","does",
  "up to 17% of a new home's price. The buyer puts at least 3% down.",
  "up to 17% of a new home's price. Homes must be priced below about $1 million to $1.5 million depending on county, and buyers must have lived in California for one year and live in the home. The buyer puts at least 3% down.",
  "Official summary: a qualified new home is \"priced below about $1 million–$1.5 million, depending on county, adjusted annually\"; borrowers \"must be California residents for one year, occupy the home\".", G+"37/title-summary.htm"),
 ("O3","37","pro",
  'pro: "California Conference of Carpenters, Fiona Ma (CalHFA board), California State Commanders Veterans Council (official argument). CalMatters also lists',
  'pro: "California Conference of Carpenters, Fiona Ma (CalHFA board), California State Commanders Veterans Council (official argument). The official guide also lists United Nurses Associations of California. CalMatters also lists',
  "Official supporters listing: \"United Nurses Associations of California; California Conference of Carpenters; California State Treasurer Fiona Ma\".", G+"37/"),
 ("O4","40","risk",
  "risk: \"Court challenges are likely. LAO's analyses of Props 41 and 42 say courts could find that either one conflicts with Prop 40, so Prop 40 could be stopped if either gets more yes votes.\"",
  "risk: \"Court challenges are likely. LAO's analysis of Prop 40 says that if Prop 41 or 42 gets more yes votes, courts could find a conflict and Prop 40 could be stopped even if a majority votes yes.\"",
  "LAO Prop 40 analysis, Figure 1: Proposition 40 \"could be stopped from becoming law even if it gets yes votes from a majority of voters\" (if Proposition 41 or 42 gets more yes votes).", G+"40/analysis.htm"),
 ("O5","45","con",
  "News reports add the California Labor Federation, Sierra Club California, the League of Women Voters and the California Democratic Party.",
  "News reports add the California Labor Federation, Sierra Club California and the California Democratic Party. The League of Women Voters of California recommends a No vote in its own guide.",
  "League of Women Voters of California: recommends NO on Prop 45; \"The League opposes speeding projects by weakening environmental review\". Its guide is added to the sources (appended).", "https://my.lwv.org/node/73812"),
 ("O6","42","pro",
  "Peace Officers Research Association of California (official listing and argument).",
  "Peace Officers Research Association of California (official listing, argument and rebuttal).",
  "PORAC's Brian R. Marvel signed the rebuttal to the argument against; the other names appear in the official listing or argument.", G+"42/arguments-rebuttals.htm"),
 ("O7","45","con",
  'con: "Coalition for Clean Air, Clean Water Action, California Environmental Voters (official argument).',
  'con: "Coalition for Clean Air, Clean Water Action, California Environmental Voters (official argument). The official listing also names Physicians for Social Responsibility, Los Angeles and the National Wildlife Federation.',
  "Official opponents listing: \"Coalition for Clean Air; CA Environmental Voters; Physicians for Social Responsibility, LA; National Wildlife Federation\".", G+"45/"),
]
log = []
for cid, prop, field, old, new, quote, url in C:
    assert s.count(old) == 1, (cid, s.count(old))
    s = s.replace(old, new)
    log.append({"id": cid, "prop": prop, "field": field, "old": old, "new": new, "officialQuote": quote, "url": url})
lwv = '["League of Women Voters of California, ballot recommendations", "https://my.lwv.org/node/73812", "Independent"]'
i = s.index('n: "45"'); j = s.index('src: std("45", [', i); k = s.index("]]) }", j)
assert "my.lwv.org" not in s[j:k]
s = s[:j] + s[j:k + 1] + ", " + lwv + "]" + s[k + 2:]
p.write_text(s)
# O8: close review gaps that the official text now answers (each answer quoted in the Stage 1 reports).
rp = root / "data/statewide-review.json"; r = json.loads(rp.read_text())
CLOSE = {
 "3": ("Income thresholds for joint filers and the number of rate brackets, from LAO Figure 1 or the Franchise Tax Board rate schedule", "Number of rate brackets, from LAO Figure 1 or the Franchise Tax Board rate schedule (thresholds confirmed in the official summary: about $371,000 single, $742,000 joint, $505,000 head of household, 2025 levels)"),
 "4a": ("Legal text read Oct 23, 2026 for the party and incumbency rule, broad-support criteria and the tripled foreign contribution fine; the ethics commission wording in the final text is still unconfirmed", None),
 "4b": ("Official argument signers read once only", None),
 "5": ("Official legal text not read: confirm the special election wording in Article V, Section 10(b)", None),
 "42a": ("Official legal text could not be fetched; excerpts came from an independent copy and must be checked against the official guide", None),
 "42b": ("Whether the revenue-use limit applies to the fiscal emergency exception as well as the disaster exception", None),
 "45a": ("The official voter guide page for Prop 45 could not be read, so the official supporter and opponent listing is unconfirmed", None),
 "45b": ("LAO Figure 1 project types were read from image descriptions; confirm against the printed figure", None),
}
closed = []
for key, (old, new) in CLOSE.items():
    prop = key.rstrip("ab")
    g = r["props"][prop]["gaps"]; assert old in g, (key, old[:40])
    if new: g[g.index(old)] = new
    else: g.remove(old)
    closed.append({"prop": prop, "gap": old, "now": new or "(closed)"})
rp.write_text(json.dumps(r, indent=1, ensure_ascii=False) + "\n")
out = {"date": "2026-10-24", "approvedBy": "the site owner's instruction of Oct 24, 2026 to apply optional items only when independently supported by authoritative evidence",
       "note": "Text, source links and review gaps only. Ratings, weights, reasons and scoring are unchanged.", "changes": log, "gapsClosed": closed}
(root / "audit/2026-10-24/statewide-changes-4.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(len(log), "text changes,", len(closed), "gaps updated")
