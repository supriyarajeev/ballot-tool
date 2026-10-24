# Retest 2. Evidence and validation findings after commit 7b9b06e (Oct 23, 2026)

Independent retest auditor. Audit only. The only repository file written is this report. Scratch work is in `/tmp/qa-retest2/` (repo copies `run/` and `src/`, harnesses in `harness/`, logs `npmtest.log`, `plant.log`, `plant2.log`, `mutate.log`). Nothing here is marked Verified. Web checks used WebFetch, whose answers come from a summarizing reader. "Matches" below means the reader's quoted text matched, not a person's word for word reading of the original.

**What was tested.** Commit 7b9b06e. My scratch copies were taken at about 20:00 and byte-match `git show HEAD:` for the key files. Around 21:17 to 21:20, after my copies, someone else changed 18 tracked files in the working tree (for example `tools/validate.mjs`, `data/2026-11-03/contests.json`, `docs/RELEASE-CHECKLIST.md`) and added `audit/reports/retest-round2.md` and `audit/logs/2026-10-23-round3.log`. I did not make those changes, and this report does not cover them. Some findings below, such as R2-05, may already be addressed there.

Fix claims in `audit/2026-10-23/fix-C-summary.md`, `fix-D-summary.md` and `integration_fixes.py` were treated as claims and re-tested.

## 1. `npm test` (Task 4)

Run in a full copy (`cp -r <repo> /tmp/qa-retest2/run`), Node v22.22.0. Exit 0. `git status --short` in the copy was empty afterwards, so no tracked file was written.

```
=== generated files match their generators: node tests/check-generated.mjs
generated files: 9 checked, all match their generators.

=== data validation: node tools/validate.mjs
Evidence: 1988 records, 1076 with claim-level excerpts, 0 human-reviewed. Sources: 404, 0 not fully read (0 text not extracted, 0 unavailable).
INFO  7 http URLs kept as documented exceptions: ca-alpine electionsUrl, ca-calaveras electionsUrlPrevious (history only), ca-colusa electionsUrlPrevious (history only), ca-lassen electionsUrlPrevious (history only), ca-mariposa electionsUrl, ca-placer electionsUrlPrevious (history only), ca-stanislaus electionsUrlPrevious (history only)
0 errors, 0 warnings, 666 ids checked (run date 2026-10-23).

=== validator self-test: node tests/validator.test.mjs
validator tests: 165 passed, 0 failed

=== scoring regression: node tests/scoring-regression.mjs
1008 scoring results compared, 0 differences.
1008 reason and limited-flag lines, 81 quality words, 14 limited-flag sets, 8 saved-state cases, 42 slider cases compared, 0 differences.

=== static HTML validation: node node_modules/html-validate/bin/html-validate.js index.html propositions.html

=== browser tests: node tests/browser/run.mjs
external hosts requested (blocked in test): fonts.googleapis.com, gc.zgo.at
guide browser tests: 304 passed, 0 failed
@1280 light external hosts requested (blocked in test): fonts.googleapis.com, gc.zgo.at
@768 dark external hosts requested (blocked in test): gc.zgo.at, fonts.googleapis.com
@360 light external hosts requested (blocked in test): gc.zgo.at, fonts.googleapis.com
@360 dark external hosts requested (blocked in test): fonts.googleapis.com, gc.zgo.at
weighing tool browser tests: 224 passed, 0 failed
goatcounter stand-in tests: 124 passed, 0 failed

=== Summary
pass             generated files match their generators (0.3 s)
pass             data validation (0.1 s)
pass             validator self-test (29.5 s)
pass             scoring regression (0.1 s)
pass             static HTML validation (0.4 s)
pass             browser tests (158.9 s)
```

"Passes" means the commands exit 0. It does not show the facts are right.

## 2. Planted-defect experiment (Task 4)

`/tmp/qa-agent4/plant.mjs` reused unchanged except for paths (source `/tmp/qa-retest2/src`, a copy of HEAD; output `/tmp/qa-retest2/plant/`) and one added case, P02b, which the earlier report lists but the script did not contain. Full output in `/tmp/qa-retest2/plant.log`. Current data gives 0 errors and 0 warnings, so every line below is caused by the plant.

| # | Plant | Before (baseline) | Now | Message now (exact, first lines) |
|---|---|---|---|---|
| P01 | city parent is a school district | no | **caught** | `ERROR jurisdiction ca-alameda-oakland: a city's parent must be a county, but "ca-alameda-sd-dublin-unified-school-district" is a school-district` |
| P02 | Oakland under Marin | by accident | **caught** | `ERROR jurisdiction ca-alameda-sd-oakland-unified-school-district: area "ca-alameda-oakland" is in ca-marin, outside this district's county (ca-alameda)` and `ERROR county ca-alameda: cityInventory is "complete" with count 14, but the data has 13 cities` |
| P02b | Fremont under Sonoma | no | **caught** (count only) | `ERROR county ca-alameda: cityInventory is "complete" with count 14, but the data has 13 cities` |
| P03 | second "Oakland" in Alameda | no | **caught** | `ERROR county ca-alameda: duplicate city name "oakland" (ca-alameda-oakland, ca-alameda-oakland-2)` |
| P04 | Napa region removed | no | **caught** | `ERROR county ca-napa: listed in data/region.json but region is undefined` |
| P05 | Fresno tagged bay-area | no | **caught** | `ERROR county ca-fresno: region is "bay-area" but it is not in data/region.json counties` |
| P06 | SF note says not collected | no | **warning only, exit 0** | `WARN  county ca-sf: coverage.note says measures are not collected, but inventory.measures is "collected" (11 listed)` |
| P07 | Governor order reversed | no | **caught** | `ERROR contest 2026-11-03.ca.governor: candidate order changed from the recorded order. ...` |
| P08 | duplicate candidate | no | **caught** | `ERROR ... 2026-11-03.ca.governor: candidate "2026-11-03.ca.governor.xavier-becerra" is listed more than once` |
| P09 | unrelated excerpt | no | **not caught** (documented limit) | `0 errors, 0 warnings, 666 ids checked` |
| P10 | `unsupported` verdict | no | **caught** | `ERROR evidence evc-prop1-cost: verdict "unsupported" cannot back the published field "fiscal" ...` |
| P11 | claim on missing field | no | **caught** | `ERROR evidence evc-plant-foo: field "nonexistentField" is not published on 2026-11-03.ca.prop-1` |
| P12 | docs count edited | no | not by validator; **caught by `npm run check`** | check: `FAIL 1 generated file(s) differ ... docs/COVERAGE-REPORT.md: first difference at line 7` |
| P13 | SF school contest removed | other reason | **caught**; doc now computed | `ERROR contest ...board-of-education: in tests/fixtures/candidate-order.json but no longer in the data`. Regenerated doc says `**San Francisco local (10 contests now in data).**` |
| P14 | needs-review, notes, no gaps | no | not caught (policy) | `0 errors, 0 warnings` |
| P15 | needs-review, no notes, no gaps | yes | caught | unchanged message |
| P16 | http in jurisdiction source, no rebuild | no | **caught** | `ERROR data/jurisdictions.json jurisdictions.174.sources.0.url: URL must be https (http://www.marincounty.gov/plant)` |
| P17 | same, rebuilt | yes | caught | |
| P18 | http citySource | no | **caught** | `ERROR data/jurisdictions.json jurisdictions.1.citySource: URL must be https (...)` |
| P19, P20 | http contest / claim URL | yes | caught | |
| P21 | lastVerified 2027-06-01 | no | **caught** | `... lastVerified 2027-06-01 is after today (2026-10-23)` |
| P22 | lastChecked 2030-01-01 | no | **caught** | `jurisdictions[54] (ca-sf): inventory.lastChecked 2030-01-01 is after today` |
| P23 | retrieved 2099-01-01 | no | **caught** | `ERROR evidence evc-prop1-cost: retrieved 2099-01-01 is after today` |
| P24 | 2026-02-30 | no | **caught** | `lastVerified must be a real YYYY-MM-DD date (got "2026-02-30")` |
| P25 | only source unavailable | no | **warning only, exit 0** | `WARN  evidence evc-prop1-cost: every source behind this claim is unavailable ...` |
| P26 | one threshold claim removed | no | not caught, correctly | Albany O still has `evc-ca-alameda-albany.measure-o-threshold-registrar`. Removing both (X04 below) is caught |
| P27 | Napa parent = Sonoma | no | **caught** | `ERROR jurisdiction ca-napa: a county's parent must be a state, but "ca-sonoma" is a county` |
| P28 | parent cycle | hang | **caught, no hang** | `ERROR jurisdiction ca-alameda-oakland: parent cycle (ca-alameda-oakland -> ca-alameda-oakland-council-district-2 -> ca-alameda-oakland)` |
| P29 | Prop 1 name edited | no | **caught** | `ERROR statewide.json Prop 1 shortTitle "Affordable housing and veterans bond" differs from propositions.html "PLANTED NAME"` |
| P30 | Dublin USD area in Marin | no | **caught** | `... area "ca-marin-novato" is in ca-marin, outside this district's county (ca-alameda)` |
| P31 | stale evidence.json | no | **caught** | `ERROR evidence evc-prop1-cost: data/evidence.json does not match data/evidence-claims.json` |
| P32 | incumbent links deleted | no | **caught** (via staleness) | `... mark-humbert-incumbent: data/evidence.json does not match data/evidence-claims.json` |

Result. 34 cases. 28 fail the validator for the planted reason, 1 more fails `npm run check` (P12). P06 and P25 give only a WARN, and `npm test` passes with warnings. P09 and P14 still pass, as Fix C documents. P26 passes correctly. Baseline was 4 of 33 caught as intended.

### Extra plants (looking for false passes)

`/tmp/qa-retest2/harness/plant2.mjs`, same method, ledger rebuilt where marked. Output in `/tmp/qa-retest2/plant2.log`.

| # | Plant | Result |
|---|---|---|
| X01 | Fremont moved to Sonoma and Petaluma moved to Alameda (counts unchanged) | **exit 0**, not caught |
| X02 | Fremont renamed "Fremount" | **exit 0** |
| X03 | Berkeley U ballot question left with only its `superseded` claim row | **exit 0** (R2-01) |
| X04 | both Albany O threshold claims removed | caught: `published "threshold" needs claim-level evidence ...` |
| X05 | Berkeley U threshold changed to majority (excerpts say two-thirds) | **exit 0** (R2-02) |
| X06 | Berkeley U ballot question $300,000,000 changed to $30,000,000 | **exit 0** (R2-02) |
| X07 | Rent Board seats 5 changed to 3 | **exit 0** (R2-03) |
| X08 | Michael Wallman marked incumbent | **exit 0** (R2-03) |
| X09 | Mendonca's `contest` points to Rent Board while listed in D8 | caught |
| X10 | Albany O threshold backed only by an `Independent` `attribution` row on example.org | **exit 0** (R2-01) |
| X11 | measure marked verified with no review | caught |
| X12 | claim row marked verified with no reviewer | caught |
| X13 | OUSD District 2 contest moved to Berkeley USD's jurisdiction | **exit 0** (R2-03) |
| X14 | registrar threshold row `sourceType: Official` on an example.org URL | **exit 0** (R2-01) |
| X15 | superseded row given verdict `unsupported` | caught (arguably too strict for a superseded row) |

### Scoring plants (VAL-12)

`/tmp/qa-agent4/score.mjs` reused with paths changed and `scoring-extended.json` copied. All 9 caught (exit 1): S1 7 differences, S2 10, S3 17, S4 154, S5 1, S6 31, S7 2, S8 41, S9 1. Baseline missed S3, S5, S6, S7, S8.

### Validator mutation coverage (VAL-14)

**Result (recorded by the integration lead from the agent's final message and its log, which finished after the report was first written).** The run disabled the validator's 142 error and warning rules (at commit 7b9b06e) one at a time. The self-test failed for 132 of them, which matches Fix C's claim. These 10 rules were not tested:

```
Rules tested (suite fails when disabled): 132
Rules NOT tested (suite still passes when disabled): 10
  L99: ${where}: missing id
  L133: propositions.html not found
  L144: ${w}: missing name
  L234: ${R}: missing name
  L236: ${R}: counties must be an array
  L247: ${w}: missing text
  L415: ${w}: reconciliation.summary says reconciled, but inventory.measures is "${inv.measures}"
  L494: ...and ${stale - 5} more claims out of date in data/evidence.json
  L512: ...and ${uncovered - 20} more fields without evidence
  L523: statewide.json has no item for Prop ${p.n}. Rerun npm run build
```

## 3. Re-check of earlier findings (Task 1)

| Old id | Status | Evidence |
|---|---|---|
| EVD-01 Berkeley D8 / Rent Board | **Fixed** | D8 now Humbert, Wallman, Feller, Mendonca. New contest `2026-11-03.ca-alameda-berkeley.rent-stabilization-board-commissioner`, `seats: 5`, Ortiz, Arbaugh, Rodriguez, Marasovic, Martinac (I), Mizell (I). Matches the cited roster (section 5) |
| EVD-02 Albany USD | **Fixed, differently than recommended** | Anne Hsu removed. Contest kept as one with `seats: 4`. Notice (reader) prints `"MEMBER, BOARD OF EDUCATION – 3 seats 4-year term; 1 seat 2-year term"` and `"Vote for four (4) seats"`, and lists Hsu last, directly before the `"CITY CLERK"` line. Which winner gets the 2-year term is still open and disclosed in the notes |
| EVD-03 judgment rows counted as supported | **Partly fixed** | `evc-prop39-r-oc-1` now `interpretive: true`, `partly-supported`; `evc-prop5-r-nb-1`, `evc-prop2-tw-2` now `partly-supported`. No separate judgment verdict was added: 332 rows are still `supported` with `interpretive: true`, and 8 rows have no `interpretive` key |
| EVD-04 stale rows | **Fixed** | `evc-prop5-noE-2` absent. `evc-prop5-succession` now says the Lt. Governor "serves until voters elect a new governor at a future statewide election", `partly-supported` |
| EVD-05 partial excerpts marked supported | **Fixed (by heuristic)** | 264 `partly-supported` rows. All rows I named (`evc-prop1-r-nb-1`, `evc-prop4-does-2`, LGSUHSD N plainEnglish) are now `partly-supported` with the reason in `limitations`. Re-labeling was done by `recheck_verdicts.py` heuristics, not by reading |
| EVD-06 Prop 44 accountability 5 | **Not fixed (deferred to owner)** | `propositions.html` prop 44 still `ac: 5`. Disclosed in the item's gaps: "Accountability rating (5) may not match its corrected rationale ... (EVD-06)" |
| EVD-07 Props 37, 38 evidence 3 | **Not fixed (deferred)** | Both still `ev: 3`, `u: {}`. Disclosed in gaps |
| EVD-08 Prop 41 date wording | **Fixed by disclosure** | Text kept. Ledger row `evc-prop41-does-1` quotes legal text "enacted or takes effect on or after January 1, 2026". Gap states the summary/legal text difference. I could not open the legal text to confirm |
| EVD-09 Prop 3 2030 vs 2031 | **Fixed in text; stale gap left** | plainEnglish now "The rates now apply through 2030 and are set to expire in 2031". But the gap list still says the page uses two phrasings (R2-04) |
| EVD-10 Prop 4 sourcing | **Partly fixed** | New rows `evc-prop4-does-4` (Assembly Elections Committee analysis, 1988) and `evc-prop4-yesE-3` (text of proposed laws, party/incumbency). Correction 7's reason in `audit/2026-10-22/statewide-changes.json` still credits "LAO and the Assembly analysis" |
| EVD-11 Prop 44 example label | **Fixed in text; stale gap left** | money now ends "(this tool's example, using the 90% rule)". Gap still says it "is not yet labeled on the page" (R2-04) |
| EVD-12 Berkeley USD | **Fixed** | `seats: 3`; Park "Education Consultant", Shanoski and Brown "Incumbent", both `incumbent: true`. Roster shows `Ka'Dijah Brown (I)`, `Jennifer E. Shanoski (I)`, `"School Board (3 seats)"`; write-in Reichi Lee is mentioned in contest notes |
| EVD-13 OUSD missing | **Fixed, mapping not independently confirmed** | Three contests added (D2 Fleisher, Brouhard; D4 Hutchinson, Camp, Pfeiffer Williams; D6 A. Williams, Powell, Bachelor). The PDF text layer (reader) has 9 tables; tables 6, 7, 8 hold exactly these names, and the three SCHOOL BOARD DIRECTOR headings appear apart from the tables. The order is consistent with the data, but I could not see the rendered layout the integration script says was read |
| VAL-01 parent cycle hang | **Fixed** | P28 exits 1 with `parent cycle (...)`. `report.mjs` and `tests/browser/lib.cjs` use a visited set. `assets/guide.js` line 74 `countyOf` still has no cycle guard (the validator now blocks such data) |
| VAL-02 geography | **Partly fixed** | P01, P02, P02b, P03, P04, P05, P27, P30 caught. City lists are checked by count only: X01 (two cities swapped between counties) and X02 (city renamed) pass. No official name list cross-check |
| VAL-03 claim content | **Partly fixed** | P10, P11 caught; P25 WARN only; P09 not caught (documented in EVIDENCE-LEDGER.md). X05, X06 show the published value is never compared with its excerpt (R2-02) |
| VAL-04 thresholds need claim-level evidence | **Fixed for the reported case; loopholes** | X04 caught. 87 of 87 published thresholds, 84 of 84 ballot questions and 119 of 119 measure types have a non-superseded claim row with an excerpt. But superseded, Independent and attribution rows also count as backing (R2-01) |
| VAL-05 shared field list | **Fixed** | `validate.mjs` imports `CLAIM_FIELDS` from `build-ledger.mjs`; list includes `incumbent`, `candidates`. P32 caught |
| VAL-06 dates | **Fixed** | P21 to P24 caught |
| VAL-07 order and duplicates | **Partly fixed** | P07, P08 caught. The order fixture is recorded from the data (`--update-candidate-order`), not from a source, although its note says "as listed by the official source" (R2-07) |
| VAL-08 https | **Fixed** | P16, P18 caught without a ledger rebuild |
| VAL-09 drift and writes | **Fixed, one doc stale** | `npm run check` in `npm test`; P12, P29, P31 caught; tracked files unchanged after `npm test`. `docs/RELEASE-CHECKLIST.md` still describes the old `npm test` steps (R2-05) |
| VAL-10 hardcoded report text | **Fixed, hand-written notes stale** | P13 doc count now computed. Hand-written notes are labeled, but two are now wrong (R2-05) |
| VAL-11 SF reconciliation sentence | **Fixed** | `guide.js` line 451 branches on `rc.notReachable`; SF data has `notReachable: 0` and a matching summary |
| VAL-12 scoring coverage | **Fixed** | All 9 scoring plants caught (section 2) |
| VAL-13 weak browser assertions | **Fixed** | No `|| true` or `evaluate(() => null)` in tests. Weighing suite asserts `errs.length === 0` (line 95). GoatCounter stand-in suite exists. `isErrorPage` covers "Something went wrong". Rendered DOM is html-validated. I checked the loosest regex (invalid-URL "clear message", guide line 214) against 5 valid ballot pages; it matched none, so it does not pass falsely there |
| VAL-14 self-test coverage | **Fixed** | 132 of 142 rules are caught by the self-test when disabled; 10 untested rules are listed in section 2 (recorded by the integration lead from the finished run) |
| VAL-15 generic gap | **Fixed** | No statewide item carries "A person's review ..." now. P14 still allowed by policy |
| VAL-16 coverage notes | **Partly fixed** | P06 is a WARN only and `npm test` passes. Alameda note now matches data (27 measures, 26 questions, 26 thresholds) |
| VAL-17 clean-machine setup | **Fixed** | README lines 28 to 31 document `npx playwright install --with-deps chromium` and `PLAYWRIGHT_BROWSERS_PATH`; `"engines": {"node": ">=18"}`; `PORT` honored in `run.mjs` |

Counts are in the summary table (section 7). No regressions found.

## 4. Alameda ballot questions and thresholds (Task 2)

Source of the new values: `audit/2026-10-23/alameda-ocr.json` (27 measures). Script check: every OCR `question` equals the published `ballotQuestion` except Sunol Glen K (no question published, by design); every OCR `percent` matches the published threshold; Emeryville BB has no threshold or type, and its gaps say so.

### Word-for-word comparison with city pages (10 measures)

The reader limits quotes to 125 characters, so each question was requested as consecutive segments and joined. Compared after collapsing whitespace.

| Measure | City source | Data vs city |
|---|---|---|
| Albany O | albanyca.gov Ballot Measures page | identical |
| Albany P | same | identical |
| Albany Q | same | identical |
| Albany R | same | identical |
| Albany S | same | differs only in apostrophe: data `property's` (straight), city `property’s` (curly, per reader). Data follows the registrar form; the old city row is `superseded` |
| Albany T | same | identical |
| Berkeley V | 2026-06-16 Item 39 resolution | identical |
| Berkeley Y | 2026-07-14 Item 02 resolution | identical |
| Berkeley Z | 2026-07-14 Item 03 resolution | differs in one word: data `non-residential`, city `nonresidential`. Documented in the superseded row's limitations |
| Hayward CC | hayward-ca.gov ballot measures | identical, including `HAYWARD BUSINESS LICENSE TAX MODERNIZATION:` and `$.30` |

Not compared. Berkeley U, W, X, AA: the Impartial Analyses PDF does not print the questions, and the council item PDFs for U, W and X were refused by the fetch allowlist. The registrar PDFs themselves were refused, and are scans, so the OCR text could not be checked against the image.

### Threshold evidence

- 87 published thresholds (50 majority, 27 two-thirds, 10 at 55%). Every one has at least one non-superseded claim-level row with an excerpt, and every excerpt states the same threshold class (script check of 2/3, 55% and majority wording).
- 12 Alameda thresholds rest only on the OCR'd registrar checkbox (Dublin I, San Lorenzo J, Sunol Glen K, Alameda L, M, N, Newark DD, Oakland EE, FF, Piedmont GG, Pleasanton HH, Union City II). All 26 registrar threshold rows have `readingsMatched: null` (one reading). These are claim-level but single-reading and not checkable by me.
- Hayward CC threshold matches the city page: `"A simple majority of voters (50% + one vote) is required to adopt the Measure."`
- Berkeley Y, Z, AA are citizen-initiative special taxes at majority; both the registrar row ("50% + 1 (checked box)") and the impartial analysis row ("It requires a majority vote for passage.") agree.

## 5. Berkeley District 8 and Rent Board (Task 3)

Source cited in the data: `https://berkeleyca.gov/sites/default/files/2026-05/01%20Candidate%20Information%20and%20Roster%20Nov%202026.pdf`. Reader quotes:

- Title `"FINAL Notice of Candidate Activity - November 3, 2026 General Municipal Election"`, `"Updated: 10/20/2026"`.
- `"Offices to be Elected: Auditor; City Council Districts 1, 4, 7, 8; Rent Board (5 seats); School Board (3 seats)"`.
- District 8 rows: `Fred M. Feller`, `Charles Mark Humbert (I)`, `Mari Mendonca`, `Michael Wallman`, each `City Council, District 8`.
- Rent Board rows: `Avery Arbaugh`, `Carole A. Marasovic`, `Vanessa Marrero (I)`, `Ida Martinac (I)`, `Nathan H. Mizell (I)`, `Vylma Ortiz`, `Derek A. Rodriguez`, each `Rent Board Commissioner`. Only Marrero's row ends in `"DNQ"`.

Result. The data's split (4 in D8, 6 on the Rent Board, 5 seats, Martinac and Mizell incumbent, Marrero left out) matches the roster. Designations match the Aug 19 notice of nominees (reader), which prints all ten names under `"City Council, Distirict 8"` with no Rent Board heading, which explains the earlier error. Two roster rows are not in the data and not explained: `Kelsea Jackson` (District 1) and `John A. Espinoza` (District 7). Both rows are incomplete (5 of 14 cells) and neither name is on the notice of nominees, so they probably did not qualify, but the data does not say so (R2-06).

## 6. New findings

### R2-01 Superseded, Independent and attribution rows count as backing for required fields
- **Severity** medium
- **Affected** `tools/validate.mjs` lines 28 (`BACKING_VERDICTS`), 474 (`backed.add`), 503 to 506; `docs/EVIDENCE-LEDGER.md`
- **Reproduction** Plants X03, X10, X14 in `/tmp/qa-retest2/harness/plant2.mjs`
- **Evidence** X03: with `evc-ca-alameda-berkeley.measure-u-ballotQuestion-registrar` removed, the only row left is `reviewStatus: "superseded"`, whose limitations say the record no longer publishes its text. Result `0 errors, 0 warnings`. X10: threshold backed only by an `Independent` `attribution` row on example.org, exit 0. X14: `sourceType: "Official"` on example.org, exit 0. The ledger doc's "supported 782" also includes the 4 superseded rows (778 needs-review + 4 superseded).
- **Expected** A superseded row never backs a published field. Thresholds and ballot questions need an Official-source row, and Official is checked against the source register's publisher.
- **Correction** Skip `reviewStatus === "superseded"` when filling `backed`; require `sourceType === "Official"` and a non-attribution verdict for `REQUIRED_CLAIM_FIELDS`; check the URL host against known official publishers; count superseded rows separately in the ledger doc.
- **Blocks release** No. Current data passes these rules (script check, section 4).

### R2-02 The validator never compares a published value with its excerpt
- **Severity** medium
- **Affected** `tools/validate.mjs` (claim checks); `data/2026-11-03/local-measures.json`
- **Reproduction** X05 (Berkeley U threshold set to majority, both excerpts say two-thirds) and X06 (`$300,000,000` changed to `$30,000,000` in the ballot question), ledger rebuilt
- **Evidence** Both `0 errors, 0 warnings, 666 ids checked`. All other steps of `npm test` would also pass after `npm run build`, because no test reads the values.
- **Expected** A ballot question must appear in its backing excerpt (after quote normalization), and a threshold's class (majority, 55%, two-thirds) must match its excerpt. A script check shows today's data already meets both, so the rule would not add false errors.
- **Correction** Add those two rules. Keep paraphrased fields out of scope.
- **Blocks release** No

### R2-03 Seats, incumbency and contest jurisdiction are unchecked
- **Severity** low
- **Affected** `data/2026-11-03/contests.json`, `candidates.json`, `tools/validate.mjs`
- **Reproduction** X07, X08, X13
- **Evidence** Rent Board `seats` 5 changed to 3, Wallman marked incumbent, OUSD District 2 moved to Berkeley USD: all exit 0. `seats` is not in `CLAIM_FIELDS`; `incumbent: true` needs only the auto-generated record-level link.
- **Expected** "Vote for N" and incumbent marks need claim-level evidence. A contest id's jurisdiction segment matches its `jurisdiction`.
- **Correction** Add `seats` to the claim fields and require claim-level rows for `seats` and `incumbent: true`; check the id prefix.
- **Blocks release** No

### R2-04 Voter-visible gaps describe problems that were fixed
- **Severity** low
- **Affected** `data/2026-11-03/statewide.json` gaps for `prop-3`, `prop-39`, `prop-44`; shown by `assets/guide.js` `statusNote` (line 218) on `#/item/2026-11-03.ca.prop-N`
- **Reproduction** `node -e 'require("<repo>/data/2026-11-03/statewide.json").items.filter(i=>/prop-(3|39|44)$/.test(i.id)).forEach(i=>console.log(i.id,i.gaps))'`
- **Evidence** Prop 3: "The page says the rates end after 2030 in one field and expire in 2031 in others; one phrasing is proposed ..." (all fields now agree). Prop 44: "The $5 million penalty example is this tool's arithmetic and is not yet labeled on the page" (it is now labeled). Prop 39: "The outcome-clarity rationale calls the ID rule clear ... a rewording is proposed" (it was reworded). Also `evc-prop39-r-oc-1` limitations still say "A rewording ... is proposed", and the LAO passage the correction asked to add as its own row for the new wording was not added (the row's excerpt is the yearly reporting sentence only).
- **Expected** Gaps and limitations describe the current text.
- **Correction** Remove the three gaps; update the row's limitations; add the LAO p. 50 row for `tool.r.oc`.
- **Blocks release** No

### R2-05 Stale documents after the integration
- **Severity** low
- **Affected** `docs/CANDIDATE-AUDIT.md` (from `tools/report.mjs` lines 313 and 320 to 324), `docs/MEASURE-AUDIT.md` hand-written notes, `docs/RELEASE-CHECKLIST.md`, `propositions.html` line 391
- **Evidence**
  - CANDIDATE-AUDIT "Left out on purpose": `**Oakland Unified board districts.** The city list does not show which candidates run in which district.` The three OUSD contests are now in the same doc (lines 711 to 730). "Still missing" lists `the Berkeley Rent Stabilization Board`, now present (line 501).
  - MEASURE-AUDIT hand note: "Many registrar measure PDFs could not be read as text, so ballot questions and thresholds were taken from city documents where possible." 26 now come from the registrar forms.
  - RELEASE-CHECKLIST lines 10 to 27 still list the old `npm test` steps (build-ledger, report) and do not mention `npm run build` or `npm run check`.
  - `propositions.html` "Last checked" mentions only the Oct 22 audit and "93 statements were corrected". The three Oct 23 text changes (Prop 3 `does`, Prop 39 `r.oc`, Prop 44 `money`) are not mentioned.
- **Correction** Delete or regenerate the hand-written lines, update the checklist, add an Oct 23 sentence to the tool's note.
- **Blocks release** No

### R2-06 Berkeley candidate details left inconsistent
- **Severity** low
- **Affected** Berkeley Auditor, D1, D4, D7 candidates in `candidates.json`
- **Evidence** The same notice of nominees that the data trusts for D8, Rent Board and BUSD designations (notes: "read three times ... with the same name and designation pairs") also prints Auditor, D1, D4 and D7 designations, for example `Jenny Wong: City Auditor`, `Igor A. Tregub: Berkeley City Councilmember, District 4`, `Aidan Hill: Medical Case Manager`. Those records keep `designation: null` with the note "Designations are not recorded because the document layout made it unclear which designation belongs to which name." The roster's `Kelsea Jackson` (D1) and `John A. Espinoza` (D7) are not in the data and not mentioned.
- **Correction** Record the designations from the notice with the same caveat, or explain why these offices differ; add a note that the two roster names are not on the notice of nominees.
- **Blocks release** No

### R2-07 Candidate-order fixture describes itself as the official order
- **Severity** low
- **Affected** `tests/fixtures/candidate-order.json` `note`
- **Evidence** `"note": "Candidate order per contest, as listed by the official source."` It is written from the data by `node tools/validate.mjs --update-candidate-order` (`validate.mjs` line 367) and records no source per contest. It catches accidental reordering only; a wrong order re-recorded on purpose passes.
- **Correction** Reword the note ("order as recorded in the data on <date>") or store the source and excerpt per contest.
- **Blocks release** No

## 7. Summary

| Severity | New findings |
|---|---|
| Blocker | 0 |
| High | 0 |
| Medium | 2 (R2-01, R2-02) |
| Low | 5 (R2-03 to R2-07) |

| Earlier findings | Fixed | Fixed with caveat | Partly fixed | Not fixed | Regressed |
|---|---|---|---|---|---|
| EVD-01 to EVD-13 | 3 (01, 04, 12) | 6 (02, 05, 08, 09, 11, 13) | 2 (03, 10) | 2 (06, 07, deferred to owner) | 0 |
| VAL-01 to VAL-17 | 10 (01, 05, 06, 08, 11, 12, 13, 14, 15, 17) | 3 (04, 09, 10) | 4 (02, 03, 07, 16) | 0 | 0 |

The VAL row was tallied by the integration lead from the agent's own status table in section 3, because the agent left it as a placeholder. It matches the agent's final message (10 fixed, 3 with caveat, 4 partly).

None of the remaining items blocks release by itself. The release still depends on human review: 0 evidence rows are human-reviewed, and the OCR text, OUSD mapping and Berkeley designations rest on automated reading.

## 8. Not checked, and why

- The registrar submittal-form PDFs (acvote): fetch refused by the allowlist, and they are scans. The OCR text and checkbox readings were not compared with the images.
- Berkeley U, W, X, AA question text: council item PDFs for U, W, X refused; the impartial analyses do not print questions.
- The rendered layout of the Oakland qualified-candidate PDF that the integration script says was read visually. Only the text layer was available to me.
- Prop 41 and Prop 4 legal text (EVD-08, EVD-10): not fetched this session.
- Ballot order of Berkeley contests: neither city document states ballot order (the roster is alphabetical, the notice is in filing order).
