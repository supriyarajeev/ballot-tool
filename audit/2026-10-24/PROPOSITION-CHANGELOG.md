# Propositions: source check and rating change log (October 24, 2026)

## Independent check in this round

A separate reviewer compared all 14 propositions with the Secretary of State's official guide (https://voterguide.sos.ca.gov/propositions/ and each proposition's page and LAO analysis). It checked:
- the number and official title;
- the measure type;
- the YES and NO meanings;
- the fiscal summaries.

**Result.** No critical discrepancy. All numbers, official titles, measure types, dollar figures and percentages match. The lao.ca.gov site could not be opened from the reviewer's tools, so LAO figures were checked inside the official guide.

This round also verified that statewide.json is regenerated from propositions.html (`tools/extract-statewide.mjs`; `tests/check-generated.mjs` fails if they differ). Titles and numbers are therefore the same everywhere on the site.

## Text changes (no rating changed)

| Prop | Field | Before | After | Source | Human approval |
|---|---|---|---|---|---|
| 2 | YES detail (`yesE`) | "LAO says state budget reserves would be higher, with more saved in the rainy day fund in certain years." | Adds: "The state also would be required to make extra debt payments for longer, through 2040 instead of 2030." | Official guide, Prop 2: "The state also would be required to make extra debt payments for longer." LAO analysis: extra debt payments through 2040 instead of 2030. https://voterguide.sos.ca.gov/propositions/2/ | Recommended (wording only) |
| 2 | Cost or revenue (`money`) | "No new tax or program. It shifts when money is spent. ..." | Adds "higher reserves, and extra debt payments required through 2040 instead of 2030" | Same | Recommended (wording only) |

**Not changed.** Prop 43's official title in the guide reads "Limits voters' ability…". The official list prints "Limit's Voters' Ability…", which is the state's typo, so the guide keeps the corrected spelling.

## Rating changes (owner-approved, October 24, 2026)

The owner authorized resolving the four flagged ratings. Each was re-read against the legal text in the official voter guide and the LAO analysis, and against the rubric's definitions. Only one value changed. A rating was never moved to improve or worsen a result.

| Prop | Factor | Before | After | Evidence | Human approval |
|---|---|---:|---:|---|---|
| 44 | Accountability | 5 | **4** | The legal text requires yearly filings posted online by the Attorney General, fines, a shortfall penalty, patient lawsuits and criminal penalties for false reports. Audits by the Attorney General and the health department are "may", not "shall" (Gov. Code 12586.3(f) as added), and no independent audit is required. The rubric's 5 requires audits plus public reporting and enforcement, so 4. | Owner authorized resolving; no outside reviewer |
| 37 | Accountability | 3 | 3 | The legal text (proposed 51515.05(g)) requires an independent annual audit but not its publication, sets no yearly public report and no penalties, and exempts program rules from the Administrative Procedure Act (51515.05(a)). Some oversight short of audits plus public reporting, so 3 stays. Reason rewritten. | Same |
| 37 | Evidence strength | 3 | 3 | LAO: "CalHFA has a few programs that provide down payment assistance", with no evaluation, and says effects on home building and buying are unknown. Similar existing programs are the rubric's example of indirect evidence (3). Reason rewritten. | Same |
| 38 | Evidence strength | 3 | 3 | Propositions 71 and 14 ($8.5 billion for stem cell research) are similar past programs, which the rubric counts as indirect evidence (3). LAO notes most research does not reach a treatment. Reason rewritten. | Same |

**Old and new reasons.** The full before and after reason texts are in the git diff of propositions.html for this release. The four review flags were removed from data/statewide-review.json, and statewide.json was regenerated.

**Effect on results.** Standard weights: Prop 44 moved from 2.75 (shown 2.8, 56%) to 2.625 (shown 2.6, 52%). Of the 1,008 regression cases, the 24 that involve Prop 44 changed score. One changed lean: Equal weights with "Support" goes from Leans toward YES (3.0) to Mixed / uncertain (2.9). The fixtures were recaptured with a note; the earlier baseline is in scoring-baseline-before-prop44.json.

## Ratings reviewed and not changed

All 14 propositions had their facts checked against the official guide earlier the same day (above). While the four flags were resolved, two other ratings were noticed that could be argued one point higher under the rubric's "similar policies elsewhere" wording. They are noted, not changed, because the official materials give no evaluation of those similar policies:
- Prop 40, evidence strength 2 (one-time wealth taxes elsewhere).
- Prop 44, evidence strength 2 (other spending-ratio rules).

A full factor-by-factor re-rating of all 14 was not done in this round. No person outside the project has reviewed any rating. Every rating remains a structured judgment made with AI research assistance.
