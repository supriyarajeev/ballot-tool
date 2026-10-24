# Validation and test infrastructure audit (Agent 4)

Date 2026-10-23. Repository HEAD = tag `baseline-2026-10-23` (3d4a73f). Audit only. No repository file was edited except this report. All experiments ran in copies under `/tmp/qa-agent4/`.

Scope read in full. `tools/validate.mjs`, `tools/report.mjs`, `tools/build-ledger.mjs`, `tools/extract-statewide.mjs`, `tests/scoring-regression.mjs`, `tests/fixtures/scoring-baseline.json` (header and structure), `tests/validator.test.mjs`, `tests/browser/guide.test.cjs`, `tests/browser/weighing-tool.test.cjs`, `tests/browser/run.mjs`, `package.json`, `package-lock.json` (structure), `.htmlvalidate.json`, `README.md`, the counts in `assets/guide.js` and `index.html`.

"Passes" below means a command exited 0. It says nothing about whether the data is factually right.

## 1. Declared commands and exact output

Run in a full copy (`cp -r <repo> /tmp/qa-agent4/run`) because `npm test` rewrites tracked files (see VAL-09). Node v22.22.0, npm 10.9.4.

| Command | Exit | Exact output (tail) |
| --- | --- | --- |
| `npm ci` | 0 | `npm warn deprecated glob@10.5.0 ...` then `added 60 packages, and audited 61 packages in 2s` `found 0 vulnerabilities` |
| `npm run data` | 0 | `396 sources, 1835 evidence records (982 claim-level).` / `Evidence: 1835 records, 982 with claim-level excerpts, 0 human-reviewed. Sources: 396, 27 not fully read.` / `INFO  2 county elections URLs stay http with a documented exception: ca-alpine, ca-mariposa` / `0 errors, 0 warnings, 654 ids checked.` / `Wrote 6 reports in docs/.` |
| `npm run test:scoring` | 0 | `1008 scoring results compared, 0 differences.` |
| `npm run test:validator` | 0 | `validator tests: 25 passed, 0 failed` |
| `npm run test:html` | 0 | (no output) |
| `npm run test:browser` | 0 | `390 external hosts requested (blocked in test): fonts.googleapis.com, gc.zgo.at` / `1100 external hosts requested (blocked in test): fonts.googleapis.com, gc.zgo.at` / `guide browser tests: 115 passed, 0 failed` / `axe 1100 []` `errors 1100 []` ... / `weighing tool browser tests: 144 passed, 0 failed` |
| `npm test` (all of the above) | 0 | same as above |
| `node tools/extract-statewide.mjs` (not part of npm test) | 0 | `Wrote 14 statewide items.` No diff against the committed `statewide.json`. |

After the full run, `diff -rq` against the repository showed no content change in tracked files, so the committed generated files are currently in sync with their generators.

## 2. Planted defects

Harness `/tmp/qa-agent4/plant.mjs`. Each case is a fresh copy of the repo, one mutation, then `VALIDATE_ROOT=<copy> node <copy>/tools/validate.mjs`. "Ledger rebuilt" means `node <copy>/tools/build-ledger.mjs` ran first, as `npm run data` would. Results in `/tmp/qa-agent4/plant-results.json`.

| # | Planted defect | Caught | Validator message (exact) |
| --- | --- | --- | --- |
| P01 | City `ca-alameda-oakland` parent set to a school district | no | `0 errors, 0 warnings, 654 ids checked.` |
| P02 | Oakland moved under `ca-marin` | yes, by accident | `ERROR county ca-marin: 5 local contests recorded but inventory.contests is "not-collected"` |
| P02b | `ca-alameda-fremont` (no measures or contests) moved under `ca-sonoma` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P03 | Second city named "Oakland" in Alameda County | no | `0 errors, 0 warnings, 655 ids checked.` |
| P04 | `region` removed from Napa County | no (the guide browser test "9 Bay Area county choices" would fail) | `0 errors, 0 warnings, 654 ids checked.` |
| P05 | Fresno County tagged `region: "bay-area"` | no (browser count test would fail) | `0 errors, 0 warnings, 654 ids checked.` |
| P06 | SF inventory `collected`, coverage note changed to "Local measures have not been collected yet." | no | `0 errors, 0 warnings, 654 ids checked.` |
| P07 | Governor candidate order reversed | no | `0 errors, 0 warnings, 654 ids checked.` |
| P08 | Same candidate id listed twice in a contest | no | `0 errors, 0 warnings, 654 ids checked.` |
| P09 | Excerpt of `evc-prop1-cost` replaced with an unrelated sentence about polling hours (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P10 | Verdict of `evc-prop1-cost` set to `unsupported` on a published field (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P11 | Claim-level record on a field the subject does not have (`nonexistentField`) (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P12 | `docs/COVERAGE-REPORT.md` count edited to "15 records" | no (validator never reads docs) | `0 errors, 0 warnings, 654 ids checked.` |
| P13 | SF school board contest and its candidates removed, ledger and report rebuilt | yes, for a different reason | `ERROR evidence evc-roster-ca-sf-sd-san-francisco-unified-school-district.board-of-education: subject "..." does not exist`. Regenerated `CANDIDATE-AUDIT.md` still says `**San Francisco local (11 contests).**` |
| P14 | Needs-review measure (Measure RTM) with `gaps: []`, notes kept | no (allowed by rule "notes or gaps") | `0 errors, 0 warnings, 654 ids checked.` |
| P15 | Same, notes also removed | yes | `ERROR data/2026-11-03/local-measures.json 2026-11-03.ca-bayarea-rtm.measure-rtm: status "needs-review" must explain the gap in notes or gaps` |
| P16 | `http://` URL in a special district's `sources` (ledger not rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P17 | Same, ledger rebuilt | yes | `ERROR source src-2c6ad9d4ef: url must be https` |
| P18 | `http://` in county `citySource` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P19 | `http://` in a contest source | yes | `ERROR data/2026-11-03/contests.json 2026-11-03.ca.governor: source 1 URL is missing, malformed or not https` |
| P20 | `http://` in a claim's `url` (ledger rebuilt) | yes | `ERROR source src-38a961c493: url must be https` |
| P21 | Measure `lastVerified` = `2027-06-01` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P22 | County `inventory.lastChecked` = `2030-01-01` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P23 | Claim `retrieved` = `2099-01-01` (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P24 | Measure `lastVerified` = `2026-02-30` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P25 | Source of a `supported` claim set to `accessStatus: "unavailable"` in `source-access.json` (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P26 | Only claim-level record for a measure threshold removed (ledger rebuilt) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P27 | County `ca-napa` parent set to `ca-sonoma` | no | `0 errors, 0 warnings, 654 ids checked.` |
| P28 | Parent cycle, Oakland parent = its own council district | validator never finishes | killed by `timeout 15` (exit 124), no output |
| P29 | Prop 1 `name` edited in `propositions.html`, `statewide.json` not re-extracted | no | `0 errors, 0 warnings, 654 ids checked.` |
| P30 | Dublin USD `areas` pointed at `ca-marin-novato` (city in another county) | no | `0 errors, 0 warnings, 654 ids checked.` |
| P31 | Claim excerpt emptied in `evidence-claims.json`, ledger not rebuilt | no | `0 errors, 0 warnings, 654 ids checked.` |
| P32 | All `incumbent` evidence records removed from `evidence.json` | no | `0 errors, 0 warnings, 654 ids checked.` |

33 cases. Caught as intended 4 (P15, P17, P19, P20). Caught for an unrelated reason 2 (P02, only because Oakland happens to have contests, and P13). Not caught 26. One hang (P28).

## 3. Findings

### VAL-01 Validator hangs forever on a jurisdiction parent cycle
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/validate.mjs` lines 150-153 and 167 (`while (j && j.type !== "county" && j.parent)`) |
| Reproduction | Copy repo to `/tmp/x`, set `ca-alameda-oakland.parent = "ca-alameda-oakland-council-district-2"`, run `timeout 15 env VALIDATE_ROOT=/tmp/x node /tmp/x/tools/validate.mjs` |
| Evidence | Exit 124, no output (P28). The parent-exists check at line 81 passes because both ids exist, and errors are printed only at the end. `tools/report.mjs` line 30 and `assets/guide.js` use the same loop shape |
| Expected | Validator reports `parent cycle` and exits 1 |
| Correction | Detect cycles with a visited set in every parent walk. Add a validator self-test |
| Blocks release | no (current data has no cycle) |

### VAL-02 Geography integrity is not validated
| Field | Value |
| --- | --- |
| Severity | high |
| Affected | `tools/validate.mjs` lines 63-85 |
| Reproduction | Planted cases P01, P02b, P03, P04, P05, P27, P30 |
| Evidence | All exit 0 (table above). The only geography rules are "parent exists", "non-state has a parent", and listed `counties`/`areas` ids exist |
| Expected | Errors for a city whose parent is not a county, a county whose parent is not the state, duplicate names under one parent, a district `areas` entry outside its parent county, and a Bay Area set that is not exactly the nine expected counties |
| Correction | Add type-aware parent rules (city to county, county to state, council and supervisor districts to city or county), unique (parent, name) pairs, `areas` within the parent county, and an explicit nine-county Bay Area list. A wrong county assignment cannot be caught by structure alone. Add an official-list cross-check (for example a checked-in county-to-cities table with its source) |
| Blocks release | no by itself. It means a geography error would ship silently, so release depends on the separate geography audit |

### VAL-03 Claim-level evidence content is not checked
| Field | Value |
| --- | --- |
| Severity | high |
| Affected | `tools/validate.mjs` lines 187-208, `docs/EVIDENCE-LEDGER.md` |
| Reproduction | P09, P10, P11, P25 |
| Evidence | An unrelated excerpt, an `unsupported` verdict on a published field, a claim attached to a field the record does not have, and a `supported` claim citing a source marked `unavailable` all exit 0 |
| Expected | At minimum, `unsupported` or `not-found` verdicts on a published field are errors, the `field` must exist on the subject, a claim may not rest only on an `unavailable` source, and some relevance check exists (for example the key numbers in the claim must appear in the excerpt, or the record is flagged for review) |
| Correction | Add those rules. State in `EVIDENCE-LEDGER.md` that excerpt relevance is not machine-checked and needs a person |
| Blocks release | no, provided nothing is shown as Verified (currently 0 human-reviewed). The UI must not present claim-level records as proof |

### VAL-04 Thresholds and other key facts need only a record-level link
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/validate.mjs` lines 209-220 |
| Reproduction | P26, removing the one claim-level record for a measure's `threshold` and rebuilding the ledger |
| Evidence | Exit 0. Claim-level coverage is required only for `status === "verified"` records. Any non-verified record is satisfied by the auto-generated `link-only` record |
| Expected | A published vote threshold or ballot question has claim-level evidence, or the field is withheld or labeled |
| Correction | Add a required claim-level field list (`threshold`, `ballotQuestion`, `fiscal`) for every published record |
| Blocks release | no (today all 75 thresholds have a claim-level record) |

### VAL-05 Validator skips fields that the ledger covers, and the doc overstates the check
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/validate.mjs` line 177 `CLAIM_FIELDS` vs `tools/build-ledger.mjs` line 14. `tools/report.mjs` line 164 |
| Reproduction | P32, deleting every `incumbent` evidence record |
| Evidence | Exit 0. The validator list omits `incumbent` and `candidates`. `docs/EVIDENCE-LEDGER.md` still says the validator enforces "every published field has an evidence record" |
| Expected | One shared field list, and the doc derived from it |
| Correction | Export one `CLAIM_FIELDS` constant used by both tools |
| Blocks release | no |

### VAL-06 Date checks accept impossible and future dates
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/validate.mjs` line 23 `isDate` |
| Reproduction | P21, P22, P23, P24 |
| Evidence | `2026-02-30` passes because `new Date("2026-02-30T12:00:00")` rolls over to March 2. Dates in 2027, 2030 and 2099 pass for `lastVerified`, `inventory.lastChecked` and `retrieved` |
| Expected | Reject dates that are not real calendar dates and dates after the run date |
| Correction | Compare `toISOString().slice(0,10)` with the input, and reject dates after today |
| Blocks release | no |

### VAL-07 Candidate order and duplicate listings are not checked
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/validate.mjs` lines 125-147, `tools/report.mjs` line 238-240 |
| Reproduction | P07, P08 |
| Evidence | Reversed order and a duplicated candidate id both exit 0. `CANDIDATE-AUDIT.md` states "All names, parties, designations and order match" as fixed text, so it would still say this after P07 |
| Expected | Duplicate ids in `contest.candidates` are an error. Order is checked against a recorded snapshot of the official order (for example a `ballotOrder` hash per contest) |
| Correction | Add a uniqueness rule. Store the certified order per contest with its source and compare |
| Blocks release | no |

### VAL-08 HTTPS is enforced on some URL fields only
| Field | Value |
| --- | --- |
| Severity | low |
| Affected | `tools/validate.mjs` lines 63-78. Jurisdiction `sources` and `citySource` are not checked directly |
| Reproduction | P16, P18 |
| Evidence | `http://` in a jurisdiction source passes unless `build-ledger.mjs` runs first (P17 caught). `citySource` is never checked |
| Expected | Every URL field is https or carries a documented exception |
| Correction | Run `checkSources` on jurisdiction `sources`, and check `citySource` |
| Blocks release | no |

### VAL-09 Generated files can drift, and `npm test` rewrites tracked files
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `package.json` scripts, `tools/extract-statewide.mjs`, `tests/browser/weighing-tool.test.cjs` line 61 |
| Reproduction | P29, P31. Then `npm test` in a git checkout and `git status` |
| Evidence | The validator alone accepts a stale `evidence.json` (P31) and a stale `statewide.json` after a `propositions.html` text edit (P29, it compares only the item count). `npm test` runs `build-ledger.mjs` and `report.mjs`, which overwrite `data/sources.json`, `data/evidence.json` and `docs/*.md`, and the weighing test writes `links.txt` into the current directory. `extract-statewide.mjs` is not in `npm test`, and the README says to run it by hand |
| Expected | CI fails when committed generated files differ from what the generators produce |
| Correction | Add `extract-statewide.mjs` to `npm run data`, then `git diff --exit-code data docs links.txt` at the end of `npm test`. Write `links.txt` to a temp dir or stop writing it |
| Blocks release | no (the outputs matched today, see section 1) |

### VAL-10 Report text is hardcoded where it should come from data
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tools/report.mjs` (generated `docs/*.md`) |
| Reproduction | Read the lines listed. P13 shows one going stale |
| Evidence | (a) Line 199 says `25 registrar measure PDFs are scanned images`, but `data/sources.json` has 27 `accessed-text-not-extracted` sources, all Alameda registrar PDFs. That status is set by a heuristic in `build-ledger.mjs` line 46, not by an observed read. (b) Lines 238-253 hardcode `(12 contests)`, `(14 contests)`, `(11 contests)` and "order match". After P13 the regenerated doc still says 11 SF contests. (c) Line 114 hardcodes `14 (Needs review)` and `(Needs review)` for statewide contests, and `"No"` for Reconciled. (d) Line 84 hardcodes "none is Verified". (e) Line 193 asserts "the scoring regression test still shows 0 differences" without running it. (f) Line 46 hardcodes "All 58" and "nine". (g) Lines 92-94, 199-208 and 255-270 are fixed prose about coverage. (h) Line 57 says "No county's list is reconciled, because not every city and district page was reached", but SF data shows `pagesReached 4 of pagesChecked 4, notReachable 0` |
| Expected | Every number and status is computed, or the fixed prose is moved to a hand-written doc and dated |
| Correction | Compute (a) to (f) from data. Move (g) to a hand-maintained file. Fix (h) wording or the data |
| Blocks release | no. Fix (a) and (h) before the docs are cited publicly |

### VAL-11 Voter-facing text contradicts the SF cross-check data
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `assets/guide.js` line 254, `data/jurisdictions.json` `ca-sf.inventory.reconciliation.summary` |
| Reproduction | Open `#/ballot/ca-sf/ca-sf-city`, expand "What has been checked for San Francisco" |
| Evidence | guide.js always appends "Not every city and district was reached, so this county's list is not fully reconciled." The SF record has `"pagesChecked":4,"pagesReached":4,"notReachable":0` and a summary saying "Not every city and district was reached". The validator does not check reconciliation fields |
| Expected | The sentence matches the data, or the data explains why 4 of 4 is still incomplete |
| Correction | Branch the sentence on `notReachable`, and add a validator rule that `pagesReached + notReachable === pagesChecked` |
| Blocks release | no (low harm, but it is a factual statement shown to voters) |

Other counts in the UI. `assets/guide.js` derives the statewide count (`state.length`) and county lists from data. Hardcoded values are `index.html` line 29 "all 14" (privacy note, matches the GoatCounter event `finished-all-14`) and the audit date "October 22, 2026" in `guide.js` lines 185 and 255. No mismatch today.

### VAL-12 Scoring regression covers less than its header claims
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tests/scoring-regression.mjs`, `tests/fixtures/scoring-baseline.json` |
| Reproduction | `/tmp/qa-agent4/score.mjs` plants changes in a copied `propositions.html` and runs the copied test. The test has no path argument for comparison (only `--capture <file>`), so the copy is the only way |
| Evidence | Baseline provenance. Recomputing with the test's own `run()` on `git show 0ddb37d:propositions.html` gives 1008 results, 0 diffs, identical meta. The fixture's `"capturedFrom": "baseline-index.html"` names a file that is not in any commit, so the label is wrong though the content matches. Results per planted change. S1 preset `def.nb` 5 to 4, caught (7 diffs). S2 Prop 1 rating, caught (31). S4 cut 2 to 2.5, caught (27). S9 rounding removed, caught (300). S3 `qualityWord` Fair boundary 3.25 to 3.5, NOT caught (0 diffs, the word is only in `r.why`, which is not compared). S5 a second `function quality` declared after `lean`, NOT caught (the regex takes the first declaration, the browser uses the last). The weighing browser test did catch S5. S6 limited flags `p.u`, NOT caught by either test. S7 saved-weight clamp 5 to 4 on load, NOT caught by either test. S8 slider handler halving the weight, NOT caught by either test |
| Expected | The test covers the displayed reason text, the caution logic and the code that turns UI input into `state.w` |
| Correction | Add `r.why` and `limitedWeighted(p)` to each result line, add `p.u` to meta, fail if any scoring function name is declared twice, and add a browser check that moving a slider to N sets `state.w` to N and survives reload. Fix the `capturedFrom` label |
| Blocks release | no |

### VAL-13 Browser tests with always-true or missing assertions, and partial privacy checks
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tests/browser/guide.test.cjs`, `tests/browser/weighing-tool.test.cjs` |
| Reproduction | Read the lines listed |
| Evidence | (a) guide line 85 `ok(!(...).match(/score\|rank.../i) \|\| true, "no scoring text")` always passes. (b) weighing lines 29-30 "independent check of math" is `const data = await p.evaluate(() => null)` and asserts nothing. (c) weighing line 67 only logs `errs` and external requests, so console errors never fail the weighing suite. (d) Every external request is answered with an empty body in both suites, so Google Fonts and GoatCounter code never runs. The cookie and storage checks (guide lines 128-129) therefore cover first-party code only, and only on the last page visited. The tool's GoatCounter event code (`propositions.html` lines 950-955) is never run. I stubbed `count.js` in a scratch script and it sent only `{"path":"used-tool",...}` and `{"path":"finished-all-14",...}`, which matches the privacy note, but no test does this. (e) The internal-link check (guide line 139) fails only on an h1 of "Not found", not on "Something went wrong". (f) `html-validate` checks only the static `index.html` shell, not the markup `guide.js` generates. Positive control. I planted an unescaped route id in a copy of `guide.js`, and the XSS assertion failed as it should (`FAIL no script injection through routes or search`) |
| Expected | Every named test asserts what its name says |
| Correction | Remove `\|\| true` and fix the regex target. Delete or implement the math check. Assert `errs.length === 0` in the weighing suite. Add a stubbed `count.js` test that records the payloads. Treat any error h1 as a broken link. Validate rendered DOM snapshots with html-validate |
| Blocks release | no |

### VAL-14 The validator self-test exercises 23 of 81 error rules
| Field | Value |
| --- | --- |
| Severity | medium |
| Affected | `tests/validator.test.mjs` |
| Reproduction | `node /tmp/qa-agent4/mutate-validator.mjs` disables one `err(` line at a time in a copy and reruns the self-test |
| Evidence | `Rules tested (suite fails when disabled): 23` / `Rules NOT tested (suite still passes when disabled): 58`. Untested rules include `jurisdiction ... parent "..." does not exist`, `missing parent`, `invalid type`, `level "..." does not match jurisdiction type`, `inventory.lastChecked must be YYYY-MM-DD`, `lastVerified must be YYYY-MM-DD`, `must explain the gap in notes or gaps`, `verified records need at least one source typed "Official"`, `source ... url must be https`, `verdict must be one of`, `cannot be verified from a source whose text was not extracted`, `verified record has no claim-level evidence`, and `statewide.json has N items but propositions.html has M`. Several patterns are also loose (`/does not exist/` matches messages other than the one intended) |
| Expected | One self-test per rule, each matching the exact message for the mutated record |
| Correction | Add the missing cases and anchor patterns to the mutated id |
| Blocks release | no |

### VAL-15 The generic-gap rule is bypassed by a reworded gap
| Field | Value |
| --- | --- |
| Severity | low |
| Affected | `tools/validate.mjs` line 49, `tools/extract-statewide.mjs` line 137 |
| Reproduction | `node -e 'console.log(require("<repo>/data/2026-11-03/statewide.json").items[0].gaps)'` |
| Evidence | Every statewide item ends with the gap "A person's review of the audited fields and excerpts against the official sources". The rule rejects only gaps starting with "Human review". P14 also shows a needs-review record passes with notes and no gaps |
| Expected | Generic review gaps are either allowed openly or caught consistently |
| Correction | Decide the policy. Then either remove the rule or widen it and drop the auto-appended gap |
| Blocks release | no |

### VAL-16 Coverage notes are free text with no consistency check
| Field | Value |
| --- | --- |
| Severity | low |
| Affected | `data/jurisdictions.json` `coverage.note`, `tools/validate.mjs` |
| Reproduction | P06 |
| Evidence | A note saying measures were not collected, beside `inventory.measures: "collected"`, exits 0. The Alameda note hardcodes "All 28 local measures" and "14 now have", which match the data today (27 own measures + Measure RTM, 14 with a ballot question or threshold) |
| Expected | Counts in notes are generated, or the note is checked against inventory |
| Correction | Generate the count parts of coverage notes, or add a rule that flags digits in notes that differ from computed counts |
| Blocks release | no |

### VAL-17 Missing setup steps for a clean machine
| Field | Value |
| --- | --- |
| Severity | low |
| Affected | `README.md`, `docs/RELEASE-CHECKLIST.md`, `package.json` |
| Reproduction | `env -u PLAYWRIGHT_BROWSERS_PATH HOME=/tmp/qa-agent4/fakehome node tests/browser/weighing-tool.test.cjs` |
| Evidence | `browserType.launch: Executable doesn't exist at /tmp/qa-agent4/fakehome/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell`, exit 1. This environment works only because `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` are set. Neither doc mentions `npx playwright install chromium`. No `engines` field, though the tests need Node >= 16.7 (`fs.cpSync`). `run.mjs` uses fixed port 8765 |
| Expected | A clean clone plus documented commands passes |
| Correction | Document `npx playwright install --with-deps chromium`, add `"engines": {"node": ">=18"}`, and let the port be overridden |
| Blocks release | no |

## 4. Reproducible commands

All are run from a copy so the repository is not touched. `cp -r <repo> /tmp/qa-agent4/run && cd /tmp/qa-agent4/run`, then
- `npm ci`, `npm test`, `npm run data`, `npm run test:scoring`, `npm run test:validator`, `npm run test:html`, `npm run test:browser`
- `node tools/extract-statewide.mjs && git status --porcelain data` (drift check)
- `node /tmp/qa-agent4/plant.mjs` (planted data defects, section 2)
- `node /tmp/qa-agent4/mutate-validator.mjs` (self-test coverage, VAL-14)
- `node /tmp/qa-agent4/score.mjs` (scoring plants, VAL-12), then `node tests/browser/weighing-tool.test.cjs /tmp/qa-agent4/score/S5/propositions.html` for the browser cross-check
- `node /tmp/qa-agent4/gc/gc.cjs` (stubbed GoatCounter payloads)

Missing dependencies. None in this environment. On a clean machine Chromium must be installed separately (VAL-17). `python3` is present but only needed for the manual server option.

## 5. Summary by severity

| Severity | Count | Ids |
| --- | --- | --- |
| blocker | 0 | none |
| high | 2 | VAL-02, VAL-03 |
| medium | 11 | VAL-01, VAL-04, VAL-05, VAL-06, VAL-07, VAL-09, VAL-10, VAL-11, VAL-12, VAL-13, VAL-14 |
| low | 4 | VAL-08, VAL-15, VAL-16, VAL-17 |

Total 17 findings. None blocks release alone. Together they mean a green `npm test` does not show that geography, candidate order, or evidence relevance are correct. Those depend on human review and the other audits.

## 6. Not checked, and why

- What GoatCounter's real `count.js` sends on the guide's automatic pageview (whether the `#/ballot/<county>/<city>` hash is included). The shell cannot reach `gc.zgo.at`, and I did not spend web budget on it.
- Whether any excerpt in `evidence.json` actually appears in its source. That is content verification, outside this audit.
- Whether the 27 `accessed-text-not-extracted` PDFs are in fact scanned images. The status comes from a heuristic plus `source-access.json`, and the files could not be downloaded.
- Behavior on Node versions other than 22.22.0.
