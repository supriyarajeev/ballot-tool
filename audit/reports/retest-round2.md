# Retest 4. Round 2 changes (commit e052f56 against 7b9b06e), Oct 23, 2026

Independent retest auditor. I did not write any of the changes under test. The only repository file written is this report. Nothing committed. Nothing here is marked Verified. Rules from `audit/reports/QA-BRIEF.md`.

## Method

- Code under test is commit `e052f56`. The original working tree also holds an uncommitted edit to `docs/RELEASE-CHECKLIST.md` that is not part of the commit and was not written by me. In my copy I reverted it (`git checkout -- docs/RELEASE-CHECKLIST.md`) so that the copy equals `e052f56`. The diff is saved at `/tmp/qa-r4/uncommitted-release-checklist.diff`.
- Copy at `/tmp/qa-r4/site` (full `cp -r`, node_modules included). Node v22.22.0. Playwright 1.56.0 Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), site served with `python3 -m http.server 8847 --bind 127.0.0.1`. Every request to another host was answered with an empty body.
- Harnesses and raw output in `/tmp/qa-r4/` (`harness/mut.mjs` and `mut.out`, `harness/mut2.mjs` and `mut2.out`, `harness/browser.cjs` and `browser.out`, `harness/find.cjs` and `find.out`, `harness/sb.cjs`, `harness/boe.cjs`, `harness/sf.cjs`, `harness/gc.cjs` and `gc.out`, `npmtest.log`).
- Mutations follow the self-test's method. Copy `data/`, `propositions.html` and the order fixture to a base folder, rebuild the ledger (`tools/build-ledger.mjs --root`), run `tools/validate.mjs` with `VALIDATE_ROOT`. Base result `0 errors, 0 warnings, 666 ids checked`. For each case only lines not in the base output are reported.
- One web check (WebFetch of `https://voterguide.sos.ca.gov/voter-info/boe-map.htm`, a summarizing reader). It listed District 1 as 34 counties including Solano and San Bernardino, District 4 as "Imperial, Orange, Riverside, San Bernardino, San Diego", and said the page "contains no statement that any county is split", while San Bernardino appears in both lists.

## 1. `npm test` (copy at e052f56)

Exit 0. `git status --short` in the copy was empty afterwards.

```
generated files: 9 checked, all match their generators.
Evidence: 2007 records, 1086 with claim-level excerpts, 0 human-reviewed. Sources: 404, 0 not fully read (0 text not extracted, 0 unavailable).
0 errors, 0 warnings, 666 ids checked (run date 2026-10-23).
validator tests: 175 passed, 0 failed
1008 scoring results compared, 0 differences.
1008 reason and limited-flag lines, 81 quality words, 14 limited-flag sets, 8 saved-state cases, 42 slider cases compared, 0 differences.
guide browser tests: 304 passed, 0 failed
weighing tool browser tests: 224 passed, 0 failed
goatcounter stand-in tests: 124 passed, 0 failed
```

All six summary steps `pass`.

## 2. Validator mutations (tools/validate.mjs)

"caught" means exit 1 with a new line naming the record. Exact new lines are in `/tmp/qa-r4/mut.out` and `mut2.out`.

| Case | Mutation | Result |
|---|---|---|
| M01 | Berkeley U, registrar ballotQuestion row removed, only the `superseded` row left (old X03) | caught. `published "ballotQuestion" needs claim-level evidence ...` |
| M20 | Dublin I, all threshold rows set `superseded` | caught |
| M02 | Albany O threshold backed only by an `Independent` `attribution` row on example.org (old X10) | caught. `needs a current claim row from an Official source ...` |
| M03 | Albany O threshold row URL moved to example.org, `sourceType` left `Official` (old X14) | **exit 0** |
| M04 | same, `sourceType: "Independent copy of official text"` | **exit 0** |
| M05 | same, `sourceType: "Unofficial blog"` | **exit 0** |
| M06 | Berkeley U threshold set to majority, excerpts say two-thirds (old X05) | caught. `the published threshold (...) does not match ...` |
| M10 | Dublin I threshold published as `50% + 1 of votes`, excerpt two-thirds | caught |
| M07 | Berkeley U ballot question `$300,000,000` to `$30,000,000` (old X06) | caught. `the published ballot question does not appear in any of its official excerpts` |
| M09 | Berkeley U ballot question `be adopted` to `not be adopted` | caught |
| M08 | Berkeley U ballot question cut to its first 60 characters | **exit 0** |
| M21 | Alameda L ballot question with its last clauses (`, requiring oversight ... be adopted?`) removed | **exit 0** |
| M22 | Alameda L ballot question replaced by `SAFER Alameda Act` | **exit 0** |
| M11 | Dublin I measureType `Parcel tax` to `General obligation bond` | **exit 0** (not in scope of R2-02, which named only ballot question and threshold) |
| M12 | OUSD District 2 contest moved to Berkeley USD (old X13) | caught. `id must start with "2026-11-03.ca-alameda-sd-berkeley-unified-school-district." ...` |
| M14 / M15 | Rent Board seats `"5"` / `2.5` | caught. `seats must be null (not known) or a whole number of at least 1` |
| M13 | Rent Board seats 5 to 3 (old X07) | **exit 0** |
| M16 | Michael Wallman marked incumbent (old X08) | **exit 0** |
| M18 | BOE 1 `partialCounties` as a string | caught. `partialCounties must be an array` |
| M17 | BOE 1 `partialCounties` gains `ca-solano` | exit 0 (structurally valid; no source rule) |
| M19 | BOE 4 `partialCounties` removed | exit 0 (San Bernardino would then show D4 as applying) |

Valid edits (false-positive checks)

| Case | Edit | Result |
|---|---|---|
| V01b | Berkeley U question, `Shall the measure` to `SHALL  THE  measure` (case and spacing) | exit 0, correct |
| V07 | Alameda L question, ` — ` to ` - ` | exit 0, correct |
| V03 | Albany O, extra Independent attribution threshold row next to the official one | exit 0, correct |
| V05 | Dublin I threshold `66 2/3 percent of votes` | exit 0, correct |
| V06 | Berkeley Auditor seats null to 1 | exit 0, correct |
| V04 | Dublin I threshold `two thirds of votes` (no hyphen) | **exit 1, false positive** (`thresholdClass` knows only `two-thirds`, `2/3`, `66.6`) |
| V08 | Alameda L question, ` — ` to ` -- ` | **exit 1, false positive** (normalization maps each dash to one hyphen) |
| V02 | Rent Board seats 5 to null | exit 1, `field "seats" is not published` for the existing seats claim row. Expected; the row must go too. |

Code review of the new rules

- R2-01. Superseded rows no longer fill `backed`. "Official" is `/official/i.test(source.sourceType) || x.primary === true`. `sourceType` is free text copied from the claim, and `build-ledger.mjs` line 41 sets `primary` with the same regex, so the `primary` test adds nothing and anything containing "official" passes (`Unofficial ...`, `Independent copy of official text`, `Official, campaign arguments`). Today 1 source has `Independent copy of official text` and 12 have `Official, campaign arguments`. The URL host is not compared with any publisher list (M03).
- R2-02. Ballot question check is `normText(excerpt).includes(normText(value))`, so any substring of the excerpt passes (M08, M21, M22). Threshold check accepts if any official excerpt has the same class. Class regex misses `two thirds`, `fifty-five percent` and spelled-out forms (V04). Today's 87 thresholds use only three strings, so the data passes.
- R2-03. Id prefix and seats type rules work. Seats values and `incumbent: true` still need no claim-level row. 22 contests publish `seats`, 2 have a `seats` claim row. 21 candidates are `incumbent: true`, 7 `incumbent` claim rows exist.
- partialCounties. Array, county, in `counties` and `countiesKnown` rules all fire (self-test plants). Nothing requires a county listed in two districts to be partial (M19).

tests/validator.test.mjs. 10 new plants, each targets the new rule's exact message and record. All pass. The `N` plant "registrar wording that differs from the superseded city text passes" applies no mutation (`() => {}`), so it only repeats the clean-baseline check. No plant covers a non-Official `sourceType`, a truncated ballot question, or seats and incumbent evidence.

## 3. Guide behavior in Chromium

| Check | Result |
|---|---|
| Solano, BOE 1 | Row reads `Board of Equalization District 1`, no "May apply". Applies. Fresno (D1) and Riverside (D4) the same. |
| San Bernardino | D1 and D4 both read `Board of Equalization District N · May apply, check your sample ballot`. The new note "This county is split between districts..." from `applies()` is **not shown anywhere** (0 matches in page text or HTML on the ballot page or either contest page). `applies()`'s `note` is never read (only `ap.fit` at guide.js line 438). See R4-04. |
| City headings | `Ballot choices for Napa, Napa County`, `Ballot choices for Alameda, Alameda County`, `Ballot choices for Novato, Marin County`. `#/ballot/ca-sf` and `#/ballot/ca-sf/ca-sf-city` both `Ballot choices for City and County of San Francisco`. |
| `#/find?county=ca-sf&city=unincorporated` | `Please choose again. San Francisco (City and County) is one consolidated city and county, so it has no unincorporated area.` (`#/ballot/ca-sf/unincorporated` still says "has no unincorporated area listed in this guide", same substance.) |
| `#/find?city=ca-alameda-oakland` | `Please choose again. This page address names a city or town but no county, so it was not used. Choose your county first.` City select disabled. |
| Other Find cases | `county=ca-alameda&city=unincorporated` no notice, preselected. `city=bogus` gives the not-listed notice. `county=bogus&city=...` gives the county notice. |
| Home region sentence | `The San Francisco Bay Area has 9 counties and 101 incorporated cities and towns. These counts come from the Metropolitan Transportation Commission and the Association of Bay Area Governments; their exact wording is below.` Then `Elsewhere in California, this guide covers statewide items, plus the few local district items it found that cross county lines from the Bay Area.` |
| Contra Costa | Coverage note on its page: `Local candidate contests are only partly collected: the two East Bay Municipal Utility District wards that cross into the county are listed; city, school and other district contests are not.` The "What has been checked" list on the same page still says `Local candidate contests. not collected yet.` Home and `#/browse` say `13 local measures listed · 2 local contests listed`. Indicator `3 / 9 counties with local candidate contests listed`. See R4-03. |
| Berkeley contests | Auditor, D1, D4, D7, D8 and Rent Board list a designation for every candidate except Mari Mendonca (`Details not yet collected`; her page says `Ballot designation not collected.`). But the Research notes on Auditor, D1, D4 and D7 still say "Designations are not recorded because the document layout made it unclear ...", and the D8 notes say "Mari Mendonca's ballot designation is \"Rent Stabilization Board Commissioner\"". See R4-01. |
| Console | No page errors. The only console error was the blocked `count.v5.js` integrity check caused by my empty stub. |

## 4. propositions.html GoatCounter dedupe

Stub `window.goatcounter.count` installed by init script. 17 answer clicks (all 14 answered, then 3 changes).

```
STORAGE OK clicks 17, events ["used-tool","finished-all-14"]
STORAGE OK after reload + 1 click, events this load []
STORAGE BLOCKED clicks 17, events ["used-tool","finished-all-14"]
STORAGE BLOCKED after reload + 1 click, events this load ["used-tool"]
```

Each event is sent once per page load when storage throws (before the fix the retest saw 19 events). With storage blocked it is sent again after a reload, so the privacy text "so each count is sent only once" holds only when storage works. Scoring regression 0 differences (section 1).

## 5. Data

- BOE. Counties covered by districts 1 to 4 are 34, 19, 1 and 5, all 58 counties once, except `ca-san-bernardino` in D1 and D4. Both D1 and D4 have `countiesKnown: true` and `partialCounties: ["ca-san-bernardino"]`. This matches the lists and the SOS page reading above. Correct.
- Props 3, 39, 44. The three stale gaps are gone from `statewide.json` (Prop 3 now 2 gaps, Prop 39 3, Prop 44 3, none about the fixed text). No "two phrasings", "not yet labeled" or "is proposed" in `statewide-review.json` or `statewide.json`. `evc-prop39-r-oc-1` limitations updated and `evc-prop39-r-oc-lao` (Page 50) added. Two ledger rows still describe the old state in `explanation`. `evc-prop3-does-4` "so the page uses two phrasings for one date. A single phrasing is proposed ..." and `evc-prop44-money-1` "A label is proposed in statewide_corrections_2.py." Not shown by the guide. R4-06.
- Contra Costa. `inventory.contests` is still `"not-collected"` while `coverage.note` says partly collected. R4-03.
- Berkeley. Kelsea Jackson and John A. Espinoza are now explained in the D1 and D7 contest notes.

## 6. Docs

- `docs/DATA-MODEL.md`. partialCounties, region.json and contest id text match the validator. One statement is wrong. "`consolidatedCity` ... no separate city menu is shown". `#/find?county=ca-sf` shows a visible `select#city` with one option, `City and County of San Francisco`, "selected for you". R4-05.
- `docs/PRODUCT-SCOPE.md` (new text) says "The Metropolitan Transportation Commission and the Association of Bay Area Governments describe the region as nine counties and 101 cities and towns". `data/region.json` MTC text is "The Bay Area is home to 101 cities and nine counties". This repeats R1-04 in the docs. R4-05.
- `docs/MEASURE-AUDIT.md`. The Alameda note ("27 scanned submittal forms", Sunol Glen K no ballot question, Emeryville BB no form) matches the data (27 OCR entries in `alameda-ocr.json`, 26 registrar-sourced ballot questions, Sunol K `ballotQuestion` empty). The SF and Solano notes still match the data (SF 0 of 10 ballot questions, Solano 0 of 11 titles).
- `docs/CANDIDATE-AUDIT.md`. "Still missing" lists "the Berkeley Rent Stabilization Board (added on October 23 ...)", an added item under a missing heading. "Other counties (computed)" lists Contra Costa as "marked not collected", consistent with `inventory` but not with the coverage note or home counts (R4-03). The Berkeley designation line ("added from the city's Aug 19 notice") contradicts the contest notes (R4-01).
- `docs/RELEASE-CHECKLIST.md` at e052f56 still lists the old `npm test` steps (Ledger, Reports). A rewrite exists only as an uncommitted change in the original tree.
- Scratch paths. `git grep -nE "/tmp/claude|/home/claude|claude-0|8fdb0247" e052f56 -- audit docs` returns only the quoted grep command inside `retest-production.md`. Session paths in fix-A, fix-B and the integration log are now `<session scratch folder, not in the repo>` and `<repo>`. Auditor scratch paths `/tmp/qa-*` remain in `audit/reports/*.md` and in `audit/2026-10-23/recheck_verdicts.py` line 9. The commit message of e052f56 again ends with the `Claude-Session` link.

## 7. Status of earlier findings

| Id | Status | Note |
|---|---|---|
| R1-01 | Partly fixed | Coverage note fixed. Inventory, "What has been checked" row and CANDIDATE-AUDIT still say not collected (R4-03) |
| R1-02 | Fixed | Solano and other whole counties show "applies". San Bernardino "may apply". The split note is not rendered (R4-04) |
| R1-03 | Fixed | New wording allows for cross-county districts |
| R1-04 | Fixed on site, reintroduced in docs | PRODUCT-SCOPE (R4-05) |
| R1-05 | Fixed | Both notices shown |
| R2-01 | Partly fixed | Superseded and attribution rows excluded (M01, M02, M20). Official test is a substring regex on free text, no host check (M03 to M05, R4-02) |
| R2-02 | Partly fixed | Changed values caught (M06, M07, M09, M10). Substring loophole (M08, M21, M22) and two false positives (V04, V08) (R4-02) |
| R2-03 | Partly fixed | Id prefix and seats type checked (M12, M14, M15). Seats value and incumbency still unevidenced (M13, M16) |
| R2-04 | Fixed for voter-visible text | Two ledger explanations stale (R4-06) |
| R2-05 | Partly fixed | CANDIDATE-AUDIT, MEASURE-AUDIT, propositions.html note updated. RELEASE-CHECKLIST not updated in the commit |
| R2-06 | Partly fixed | Designations recorded and two roster names explained. Contest notes now contradict them (R4-01) |
| R2-07 | Fixed | Fixture note reworded |
| R3-01 | Fixed | Once per page load without storage. Text "sent only once" still assumes storage |
| R3-02 | Partly fixed | Session scratch paths replaced. `/tmp/qa-*` and the session link remain (owner decision) |
| R3-03 | Fixed | Napa, Alameda and Novato headings name the county, SF does not repeat it |

## 8. New findings

### R4-01. Berkeley contest notes contradict the candidate records (Medium)
- Affected. `data/2026-11-03/contests.json` notes of `2026-11-03.ca-alameda-berkeley.city-auditor` and council districts 1, 4, 7 and 8. Shown under "Research notes" on `#/contest/<id>`.
- Evidence. Auditor, D1, D4, D7 notes say "Designations are not recorded because the document layout made it unclear which designation belongs to which name", while every candidate there now has a designation. The D8 note says "Mari Mendonca's ballot designation is \"Rent Stabilization Board Commissioner\"", while her record has `designation: null` and notes that a designation "recorded earlier from the PDF's text layer was wrong and was removed on Oct 23, 2026".
- Expected. Notes describe the current data. A voter should not read a designation the data says is wrong.
- Correction. Rewrite the four notes to say designations come from the Aug 19 notice. Remove the Mendonca designation sentence from the D8 note.
- Blocks release. No, but it is voter-visible and names a real candidate.

### R4-02. Loopholes and false positives in the R2-01 and R2-02 rules (Medium)
- Affected. `tools/validate.mjs` (official test, `normText`, `thresholdClass`), `tools/build-ledger.mjs` line 41.
- Evidence. M03, M04, M05 exit 0 with the only threshold row on example.org. M08, M21, M22 exit 0 with a truncated or 17-character ballot question. V04 (`two thirds of votes`) and V08 (` -- ` for an em dash) are rejected although they are faithful.
- Correction. Use an exact `sourceType === "Official"` (decide separately on "Official, campaign arguments") and compare the URL host with the registered publisher. Require the whole normalized excerpt segment, for example equality with the excerpt or a minimum share of its length. Extend `thresholdClass` to `two thirds`, spelled-out percentages, and normalize runs of dashes.
- Blocks release. No. Current data passes.

### R4-03. Contra Costa contest coverage still stated two ways (Low)
- Affected. `ca-contra-costa.inventory.contests` (`not-collected`), the "What has been checked" list on `#/ballot/ca-contra-costa`, `docs/CANDIDATE-AUDIT.md` "Other counties (computed)".
- Evidence. Same page shows "Local candidate contests are only partly collected ..." and "Local candidate contests. not collected yet." Home counts Contra Costa among 3 of 9 counties with contests.
- Correction. Set `inventory.contests` to a partial value and let the list and the report use it.
- Blocks release. No.

### R4-04. The split-county note is never shown (Low)
- Affected. `assets/guide.js` `applies()` returns `note`, but only `ap.fit` is used (line 438).
- Evidence. San Bernardino ballot page and both BOE contest pages contain no "split between districts" text. The voter sees only the generic "May apply, check your sample ballot".
- Correction. Render `ap.note` on the row or contest page, or drop the dead string and the claim that it is shown.
- Blocks release. No.

### R4-05. Two new doc statements contradict the site or data (Low)
- Affected. `docs/DATA-MODEL.md` ("no separate city menu is shown" for SF), `docs/PRODUCT-SCOPE.md` (MTC said to describe "101 cities and towns").
- Evidence. Section 6.
- Correction. Say the city menu is preselected with one option. Attribute "cities and towns" to ABAG and "cities" to MTC.
- Blocks release. No.

### R4-06. Two ledger rows still describe the fixed text (Low)
- Affected. `evc-prop3-does-4`, `evc-prop44-money-1` `explanation` in `data/evidence-claims.json` (and generated `evidence.json`).
- Evidence. Section 5. Not voter-visible in the guide.
- Correction. Update the explanations.
- Blocks release. No.

## 9. Summary

| Severity | New | Ids |
|---|---|---|
| Blocker | 0 | |
| High | 0 | |
| Medium | 2 | R4-01, R4-02 |
| Low | 4 | R4-03, R4-04, R4-05, R4-06 |

Of the 15 earlier findings, 8 are fixed (R1-02, R1-03, R1-05, R2-04 for voter-visible text, R2-07, R3-01, R3-03, and R1-04 on the site), and 7 are partly fixed (R1-01, R2-01, R2-02, R2-03, R2-05, R2-06, R3-02). None regressed. `npm test` passes and scoring is unchanged.

Conclusion. The round 2 code changes do what they claim for the reported cases, and the guide behaves as intended for BOE, headings and Find notices. The new validator rules still accept non-official URLs and truncated ballot questions, and the Berkeley contest notes now contradict the candidate data in a way voters can see. None blocks release.

## Not checked, and why

- Word-for-word source checks of Berkeley designations and Alameda ballot questions. Out of scope for this retest, and WebFetch output is a reader's summary.
- Visual layout, axe and dark mode beyond what `npm test` covers. Not changed by this commit except the region sentence.
- Real GoatCounter traffic. Only a stub was used.
