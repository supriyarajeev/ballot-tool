# Framework v3 audit (October 29, 2026)

Built on the live version (commit c61b628), branch `factors-v3`. Not deployed.

## What changed

| Area | Before | After |
|---|---|---|
| Rated factors | 7 | 5 |
| Net benefit | Rated 2 or 3 on every prop | Not rated. Described as who could gain and who pays |
| Accountability, Outcome clarity | Two factors | One factor, Accountability and results, the average of the two existing ratings (kept in `sub`) |
| Safety, Feasibility, Fiscal clarity | Old names | Low risk of side effects, Implementation readiness, Cost clarity. Ratings unchanged |
| Standard weights | 5, 5, 4, 3, 3, 2, 2 (24) | ev 5, lr 4, ac 3, if 3, fc 2 (17) |
| Standard score range | 2.5 to 3.7 | 2.3 to 3.9 |
| Card, visible | YES and NO meaning | Plus who could gain, who pays or gives something up, how hard to change later |
| More facts | | Plus other measures on this ballot, campaign money link |
| Evidence check | Score first, strongest and weakest factor after | Strong on, weak on, in the middle first, then the score |
| Step 1 | Long intro, weights caveats, scoring box open | One paragraph, factor list, How these ratings behave, scoring box folded |
| Step 3 | Scores on every row | Answers only, switch to show scores (remembered on the device) |
| Methods | Summary block repeated the header idea box | Weights caveats and limits once, here |
| Review wording | "not yet officially reviewed or verified" | "this project's own and not reviewed by any outside organization" |
| Share image | 7 factor chips | 5 factor chips, rebuilt from tools/og-image.html |

No rating value was changed. Every earlier rating is preserved, either as a factor or as one of the two parts in `sub`. Removed Net benefit ratings and reasons are kept in `net-benefit-removed.json`.

## New scores, Standard weights (hand check: sum of weight x rating / 17)

| Prop | ev | lr | ac (parts) | if | fc | Sum | Score |
|---|---|---|---|---|---|---|---|
| 1 | 3 | 3 | 3 (3, 3) | 4 | 4 | 56 | 3.3 |
| 2 | 3 | 3 | 2.5 (2, 3) | 5 | 2 | 53.5 | 3.1 |
| 3 | 4 | 3 | 3.5 (4, 3) | 5 | 4 | 65.5 | 3.9 |
| 4 | 3 | 3 | 2 (2, 2) | 4 | 3 | 51 | 3.0 |
| 5 | 2 | 3 | 3 (2, 4) | 5 | 3 | 52 | 3.1 |
| 37 | 3 | 3 | 3 (3, 3) | 3 | 4 | 53 | 3.1 |
| 38 | 3 | 2 | 3.5 (4, 3) | 4 | 4 | 53.5 | 3.1 |
| 39 | 3 | 2 | 4 (4, 4) | 2 | 3 | 47 | 2.8 |
| 40 | 2 | 2 | 3 (3, 3) | 2 | 3 | 39 | 2.3 |
| 41 | 3 | 2 | 4 (4, 4) | 4 | 3 | 53 | 3.1 |
| 42 | 3 | 2 | 2.5 (2, 3) | 4 | 2 | 46.5 | 2.7 |
| 43 | 4 | 3 | 3 (2, 4) | 5 | 2 | 60 | 3.5 |
| 44 | 2 | 2 | 4 (4, 4) | 3 | 3 | 45 | 2.6 |
| 45 | 2 | 2 | 3.5 (3, 4) | 3 | 3 | 43.5 | 2.6 |

## Sources for the new facts, checked October 29, 2026

**How hard to change later.** Each measure's legal text (Secretary of State, `prop{N}-text-proposed-laws.pdf`), read in a browser.
- Constitutional amendments (2, 3, 5, 39, 41, 42, 43, and the constitutional part of 40). California Constitution Article XVIII. Any change needs another statewide vote.
- Prop 1. "The Legislature may amend this chapter in order to reallocate the proceeds of bonds ... among the programs".
- Prop 4. "Subdivisions (e), (f), and (h) of this section may be amended by statute pursuant to subdivision (a) of Section 81012. The remaining subdivisions ... only by a statute that complies with subdivision (b)". Government Code 81012(a) is a two-thirds vote to further the Act's purposes. 81012(b) needs voter approval.
- Prop 37. Amendable "by a statute that is passed by over a 60 percent vote of the members of each house ... and signed by the Governor", consistent with and furthering its purposes.
- Prop 38. "two-thirds vote ... provided that such amendments further the purposes of this act, except no such statute shall amend the provisions ... regarding the allocation and disbursement of bond proceeds or the purposes".
- Prop 40. The Billionaire Tax Act statute is amendable by two-thirds of each house if consistent with and furthering its purposes.
- Prop 44. "amended either by a subsequent measure submitted to a vote of the people ... or by statute validly passed by the Legislature and signed by the Governor, but only to further the purposes of this act".
- Prop 45. Two-thirds of each house, consistent with and furthering its purposes, bill published 12 business days before passage.

**Other measures on this ballot.** The printed Official Voter Information Guide analysis (`prop{N}-title-summ-analysis.pdf`) for all 14 was searched. Only Props 40, 41 and 42 carry the "Potential Interactions With Other Propositions" box. Finding. The voter guide's web page version of the Prop 40 analysis and the lao.ca.gov PDF do not include that box. The live note's wording matches the printed guide, so it stays. "Related" lines say only that two measures deal with the same subject, from each one's own official analysis.

**Campaign money.** One Secretary of State "2026 ballot measure contribution totals" page per measure. All 14 links were opened and each names the right proposition.

**Who could gain, who pays.** Written only from each card's existing audited fields (money, who, yesE, tw, risk, argFor). Claims from one side are attributed to that side.

## Rubric and judgment notes

- 2 and 4 anchors were added for Low risk of side effects only, written to match how 2 was already used (a specific named risk). Props 5 and 43 rate 3 with risks that are close to that line. They were left unchanged, because re-rating would be a new judgment.
- Evidence strength rates Prop 43 at 4 and Prop 42 at 3 although both effects follow mostly from the text. This difference existed before and was not changed.

## Tests (run October 29, 2026, log in npm-test.log)

All 8 suites pass. Guide 601, weighing tool 616, GoatCounter 124 browser checks, validator self-test 207, three-choice 27, percentage arithmetic 25, scoring regression 840 cases plus extended checks, HTML validation, data validation, generated files. The 840 recaptured scoring rows were also recomputed by a separate script written from the rules (decimal arithmetic, half-up rounding), with 0 mismatches. The seven-factor fixtures are kept here as `scoring-*-before.json`.

## Independent wording review (October 29, 2026)

A separate review agent, without access to this report, checked every new who-could-gain, who-pays, change-later and other-measures line against each card's audited fields. It found no high-severity errors. It confirmed that every averaged rating and quoted part score is correct, that only Props 40, 41 and 42 claim a legal conflict, and that every "Related" line is accurate. It raised 6 medium and 14 low findings, all about attribution, missing caveats or wording. All 20 were applied, for example:
- Supporters' claims are now attributed (Prop 2).
- "Part or all" is restored for the Prop 38 offset.
- The Prop 40 conflict lines on Props 41 and 42 now say "per the official analysis" and "if courts find a conflict".
- Opponents' "limits public input" is attributed on Prop 45.
- The label is "More than 60%" on Prop 37.
- LAO caveats are restored on Props 4, 41, 44 and 45.

`apply_framework_v3.mjs` records the first pass. The final wording is in propositions.html.

## Percentages (added after the first preview)

Each score also shows as a percentage of the top rating, computed from the same rounded score (score x 20), so the two can never disagree. Prop 40, 2.3 of 5, shows 46%. The 3.0 midpoint is 60%. Display only, no score or rule changed.

## Folded list and repeats (added after the second preview)

Measured in Chromium with all cards in their default state. Phone (390 px) page 38,503 px to 13,348 px. Step 2 28,874 px to 3,841 px. Desktop (1366 px) page 18,357 px to 7,649 px. No fact, rating, source or score changed. Removed from the cards: the Expected outcome and Worth weighing rows (their content is in what it does, the YES box, who could gain and who pays), and per-card copies of the PDF tip, calculation legend, rating disclaimer and skip hint (each now appears once). These fields are still in the data and in statewide.json for the guide pages.

## Folded sections (added after the third preview)

Step 1 details, the Step 3 list and the method notes fold behind a bordered "Show details" button. The cheat sheet button, answer counts, weights status and the all-zero warning stay visible. Page height with everything in its default state: phone 6,841 px (38,503 px before October 29), desktop 4,225 px (18,357 px). Content unchanged.

## Disclaimer consolidation (owner request, October 29, 2026)

Removed. The beta banner (index.html, propositions.html) and the "Local coverage is incomplete" warning box (assets/guide.js, What's covered). The About page's yellow "Beta release" box and its four-box summary, replaced by the statement below.

Added. About this guide opens with four short parts (what it is, Coverage, Sources and methodology, Development status). A small grey scope note on the home page links to it. The tool's header links to it.

Kept, so nothing is lost. "Not a complete list" and "consult your county elections office" (About and home). "The project's own analytical assessments ... not official government ratings or independent validations" and "Linking to an official source does not make this guide's summaries or ratings official" (About). "A missing item does not mean it is not on your ballot" (What's covered, plain text). The footer credit, unchanged as the owner set it. The tool's methods section and "This tool's own ratings" label on each card. The About page's detailed sections (disclaimer, how information is checked, labels).

Checked. No warning banner on home, Find My Ballot, a ballot page, Candidates or About (browser tests). Scoring regression, three-choice and percentage tests unchanged and passing.

Files changed. index.html, propositions.html, assets/guide.js, assets/guide.css, tests/browser/guide.test.cjs, tests/browser/weighing-tool.test.cjs, CHANGELOG.md.
