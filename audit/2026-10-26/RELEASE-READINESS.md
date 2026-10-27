# Public release readiness (October 26, 2026)

## 1. What was inspected

- **Live site.** Build 2026-10-26d, checked in a desktop Chrome browser: the home page, the Ballot Weighing Tool and the beta notice.
- **Code.** `index.html`, `assets/guide.js`, `propositions.html` (scoring, data, interface) and the test suites.
- **Content.** All 14 propositions' voter-facing text. An independent reviewer, given only the text, checked it for loaded wording, asymmetry, unattributed claims and rating language.
- **Official wording.** The YES and NO meaning of all 14, compared with the official voter guide at voterguide.sos.ca.gov, read in the browser on October 26, 2026.

## 2. What changed and why

**Wording.** 45 changes, each logged with old text, new text and reason in `neutrality-changes.json`. No rating, weight, threshold or formula changed.

| Prop | Field | Reason |
|---|---|---|
| 1 | risk | 'Decades' overstated the LAO's 25-year repayment period. |
| 3 | tw | 'Steady' conflicted with the tool's own note that this revenue swings with markets. |
| 3 | out | The outcome named only the benefit, not the tax that produces it. |
| 4 | tw | A contested benefit was stated in the tool's own voice; now attributed to supporters. |
| 4 | argFor | Only one side's rebuttal was quoted; dropped so both sides get their main argument only. |
| 4 | r.lr | 'Familiar, limited' read as dismissive and conflicted with the LAO cost statement in the risk field. Rating unchanged. |
| 5 | noE | The NO box carried a fact framed in support of YES; the YES box had no matching note. |
| 5 | con | Party positions were named for one side only. Rule now: party positions are not listed; see the official guide. |
| 37 | risk | The price-increase risk was the tool's own, with no source. |
| 37 | tw | Same unsourced price risk. |
| 37 | r.lr | Same unsourced price risk, restated as what the official materials do and do not cover. Rating unchanged. |
| 37 | r.nb | 'Real help' was approving language in the tool's voice. |
| 37 | out | The outcome was stated as certain while the uncertainty field says usage is unknown. |
| 37 | argAgainst | Gave names but no argument. No sourced statement of opponents' reasons is in this tool, so none is invented. |
| 38 | who | Stated as fact what the risk field says is contested; now matches the summary. |
| 39 | r.nb | One study was used to dismiss supporters' core claim; now presented as one study with its limits. Rating unchanged. |
| 39 | risk | The tool's own legal reading was stated as fact. |
| 39 | pro | Party rule, as for Prop 5. |
| 40 | risk | 'Likely' was an unattributed prediction. The 40/41/42 conflict moves to one neutral note shown on all three cards. |
| 40 | r.lr | Conflict moved to the shared note. Rating unchanged. |
| 40 | r.nb | Emphasis word removed. |
| 41 | does | Stated a court outcome as certain; now attributed to the measure's text and LAO. |
| 41 | risk | Blocking Prop 40 was framed as a harm; it is now in the shared neutral note. |
| 41 | tw | 'Discipline' was approving; blocking Prop 40 was framed as a cost. The interaction is in the shared note. |
| 41 | r.lr | Same. Rating unchanged. |
| 41 | r.nb | Neutral wording for the interaction. |
| 41 | con | Party rule, as for Prop 5. |
| 42 | does | Same as Prop 41. |
| 42 | risk | Same as Prop 41. |
| 42 | tw | Same as Prop 41. |
| 42 | r.lr | Same. Rating unchanged. |
| 43 | money | A single vivid example helpful to one side, with no counterexample. |
| 43 | r.ev | Same example removed. Rating unchanged. |
| 43 | risk | Echoed opponents in the tool's voice; now states the rule and the LAO's finding. |
| 43 | does | 'Anti-tax' is a loaded label. |
| 43 | con | Party rule, as for Prop 5. |
| 44 | src role | The clinics' national association is an affected party, not an independent source. |
| 44 | r.nb | Absolute claim softened to what was found. |
| 44 | con | Party rule, as for Prop 5. |
| 45 | pro | Party rule, as for Prop 5. |
| 45 | con | Party rule, as for Prop 5. |
| 45 | src role | The League of Women Voters is a listed opponent of Prop 45, so 'Independent' was misleading. |
| 45 | src role | Co-written by an attorney whom HousingWire reports helped write the measure, as the card already says. |
| 2 | yes | Matched to the official voter guide's YES statement, which includes both consequences (checked October 26, 2026). |
| 5 | yes | The official YES statement says 'typically'; the qualifier had been dropped (checked October 26, 2026). |

**Trust signals**
- The tool's beta note gives the check dates, says the checks were automated, and says no person has reviewed them yet.
- The ratings heading now reads "This tool's own ratings ... Not LAO or state ratings."
- "Biggest risk" is now "Biggest risk if it passes".
- The methods section opens with a three-line summary: from sources, from you, and what you see.
- A source-labeling and party rule is stated.

**Props 40, 41 and 42.** One neutral note on all three cards replaces the framing of blocking Prop 40 as a harm.

**Landing page**
- Your positioning copy and the three key attributes.
- The disclaimer, with a link to the official voter guide.
- The Ballot Weighing Tool is the primary button and Find My Ballot the second.
- The beta label now reads "Beta Tool".
- A statewide-first description, with the local coverage limits stated.

**Guide.** Two leftover mentions of "lean" were reworded.

## 3. Tests run and results

`npm test` exited 0. Log in `audit/logs/2026-10-26-release-readiness-npm-test.log`.

| Suite | Result |
|---|---|
| Data validation | 0 errors |
| Validator self-test | 207 of 207 |
| Scoring regression | 1,008 cases, 0 differences in both parts |
| Unit tests | 24 of 24 |
| Percentage arithmetic | 25 of 25 |
| Guide browser tests | 595 of 595 |
| Weighing Tool browser tests | 568 of 568 |
| Visitor counter stand-in | 124 of 124 |

**Coverage of the browser tests**
- Widths of 320 to 1280 px, light and dark, plus touch input.
- axe accessibility checks.
- Keyboard use, refresh, Back, deep links and the hand-off to the cheat sheet.
- The new content rules: the interaction note on exactly Props 40, 41 and 42, the risk label, the ratings label, the beta dates, no party names, source roles, and the home page attributes and disclaimer.

**YES and NO meanings.** 12 of 14 matched the official guide. Props 2 and 5 omitted official wording and were corrected.

## 4. Remaining concerns

- **No human review.** The content checks were automated. The tool says so.
- **Prop 37.** No sourced statement of opponents' reasons, so only "No official argument against was filed" is shown.
- **One-sided risk field.** The risk field covers passage only. What a NO vote keeps is in "A NO vote means". No "risk if it fails" lines were written, because they could not all be sourced.
- **Party positions** are no longer listed, by rule.
- **Colors.** Yes is green and No is red, as you chose.
- **Prop 4.** The supporters' rebuttal sentence was dropped for symmetry. The official PRO argument does contain it.

## 5. Not tested

- **Source links were not re-checked today.** All 68 were checked on October 24, 2026 and none has changed since. Only three role labels changed.
- Safari, Firefox and real phones.
- This build on the live site, until it is pushed.

## 6. Files changed since the last push

`index.html`, `assets/guide.js`, `assets/guide.css`, `propositions.html`, `data/2026-11-03/statewide.json`, `data/sources.json`, `docs/SOURCE-REGISTER.md`, the tests, `CHANGELOG.md`, `UPLOAD-INSTRUCTIONS.md`, this report, `neutrality-changes.json` and the test logs.

## 7. Your action

Push the ZIP (steps in UPLOAD-INSTRUCTIONS.md). After that, a person should read the changes log and the 14 cards before announcing broadly.
