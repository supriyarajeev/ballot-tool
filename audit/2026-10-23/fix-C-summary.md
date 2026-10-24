# Fix C summary: validation and regression tests (Oct 23, 2026)

Nothing committed. Files edited, all inside Fix C's scope:

- `tools/validate.mjs`, `tools/report.mjs`, `tools/build-ledger.mjs`
- `tests/validator.test.mjs`, `tests/scoring-regression.mjs`, `tests/browser/guide.test.cjs`, `tests/browser/weighing-tool.test.cjs`, `tests/browser/run.mjs`
- new `tests/check-generated.mjs`, `tests/run-all.mjs`, `tests/browser/goatcounter.test.cjs`, `tests/browser/lib.cjs`, `tests/fixtures/candidate-order.json`, `tests/fixtures/scoring-extended.json`
- `tests/fixtures/scoring-baseline.json` (only the `capturedFrom` label changed, see VAL-12)
- `package.json`, and the "Setup and testing" section of `README.md`
- `.htmlvalidate.json` needed no change

Generated files in the repo (`data/sources.json`, `data/evidence.json`, `docs/*.md`, `statewide.json`) were not written by me. Every generator run I did used `--root` on a temporary copy. `data/evidence.json` and `data/sources.json` show as modified in git because another agent rebuilt the ledger at 18:58:54, 100 ms after `data/evidence-claims.json` was written.

## Commands

```
npm run build                 # writes statewide.json, sources.json, evidence.json, docs/*.md
npm test                      # node tests/run-all.mjs: runs every step below, prints a summary, writes no tracked file
npm run check                 # regenerate into a temp folder, fail on any difference (VAL-09)
npm run validate              # node tools/validate.mjs
npm run test:validator        # node tests/validator.test.mjs (174 plants)
npm run test:scoring          # node tests/scoring-regression.mjs [path/to/propositions.html]
npm run test:html
npm run test:browser          # node tests/browser/run.mjs [guide|weighing|goatcounter]; PORT overrides 8765
npm run fixtures:candidate-order   # deliberately re-record candidate order (VAL-07)
```

## VAL ids

| Id | Change |
| --- | --- |
| VAL-01 | Every parent walk in `validate.mjs` and `report.mjs` uses a visited set. A cycle is reported once as `jurisdiction X: parent cycle (a -> b -> a)` and the run finishes. The audit's P28, which used to hang, now exits 1 in under a second. |
| VAL-02 | Type-aware parent rules: county to state, city to county, council district to city, and district types to county. Exactly the nine `data/region.json` counties, checked against the contract list. `region` tags must match region.json. `countyCount` and `municipalityCount` must match the data. Facts need text, an https url, a publisher and a real past `retrieved` date. No duplicate city names in a county. `cityInventory` is required on every county. "complete" needs an https source, a checked date and a count equal to the city records. `unincorporated` needs a boolean `listed` and an https source, and is required for Bay counties. `consolidatedCity` must be a city of that county, with `listed:false`. `municipalityType` must be city or town, on cities only. `areas` must be cities inside the district's county or its `counties`. `counties` entries must be counties. Fix A's data passes all of these. |
| VAL-03/04 | A claim on a field the record does not publish is an error. `tool.*` fields count for statewide items. An "unsupported" or "not-found" verdict on a published field is an error. Every published `threshold`, `ballotQuestion` and `measureType` needs claim-level evidence with a non-empty excerpt and a supported, partly-supported or attribution verdict, whatever the status. A WARN fires when every source behind a claim is unavailable or text-not-extracted. A new check fails when `evidence.json` is stale against `evidence-claims.json` (P31). Excerpt relevance (P09) is still not machine-checked. A numbers-in-excerpt heuristic flagged 109 of 377 numeric claims, all paraphrases, so I did not add it. EVIDENCE-LEDGER.md now says relevance needs a person. |
| VAL-05 | `build-ledger.mjs` exports `CLAIM_FIELDS` and `isPublished`, and the validator imports them. Importing the module has no side effects. Its output is byte-identical to the old script on the same data. |
| VAL-06 | Dates must round-trip as real calendar dates, so `2026-02-30` is rejected. These dates may not be after today (system local date): lastVerified, review.date, inventory.lastChecked, reconciliation.date, cityInventory.checked, region facts retrieved, source retrieved and documentDate, and evidence retrieved and reviewDate. Election dates are exempt. `VALIDATE_TODAY` can override the date, but the self-test plants 2099 dates and does not use it. |
| VAL-07 | A duplicate candidate in a contest is an error. `tests/fixtures/candidate-order.json` records the order of all 67 contests from the committed `contests.json` (commit 3d4a73f / HEAD). The validator fails on a changed order, a contest with no recorded order, or a recorded contest that is gone. `npm run fixtures:candidate-order` re-records it on purpose. |
| VAL-08 | Every string in every data file is scanned. An `http://` value is an error, as is a malformed value under `url`, `*Url`, `citySource` or `source`. Object keys are scanned too (source-access.json). Documented exceptions: `electionsUrl` with an `electionsUrlNote` (Alpine, Mariposa) and `electionsUrlPrevious` (history only). They are listed in an INFO line. P16 and P18 are now caught without rebuilding the ledger. |
| VAL-09 | `npm run build` writes the generated files. `npm run check` (`tests/check-generated.mjs`) copies the inputs to a temp folder, runs extract-statewide, build-ledger and report there, and diffs the 9 generated files, reporting the first differing line. `npm test` (`tests/run-all.mjs`) runs every step even after a failure and writes nothing tracked. The weighing test writes links.txt only when `LINKS_OUT` is set. The validator also compares each statewide `shortTitle` with propositions.html (P29). |
| VAL-10 | `report.mjs` takes `--root`. It computes the county counts (58, nine, 49), statewide and contest status text, the Reconciled column, the Verified count, contest counts per section in CANDIDATE-AUDIT, the per-county local contest coverage, the counties with nothing collected, and the not-extracted and unavailable source counts by publisher. It no longer claims "order match" (it points to the order fixture) or "0 differences" (it points to `npm run test:scoring`). The reconciliation sentence is computed from `notReachable` per county. Remaining hand-written prose is labeled "hand-written notes from the October 22, 2026 audit" and has no counts. New sections cover region facts and the Bay city lists. |
| VAL-11/16 | Errors: `pagesReached + notReachable === pagesChecked`. Warnings: summary says "not every page reached" while notReachable is 0, or "every page reached" while it is above 0; text claims "reconciled" while the inventory is not; a coverage.note says measures are "not collected" while they are collected; "N local measures" matches neither the own count nor the listed count; "N have an official ballot question or threshold" differs from the data; "all local measures are listed" or `listComplete:true` while not collected; a region fact's "N cities" or "nine counties" differs from region.json; a cityInventory.note count differs. On current data: one warning, the Alameda note says 14 have a ballot question or threshold and the data has 28 (Fix A or D). |
| VAL-12 | New `tests/fixtures/scoring-extended.json`, captured from `git show 0ddb37d:propositions.html`. It covers the reason text r.why (which carries the quality word) and limitedWeighted for all 1008 cases, p.u for all 14 props, qualityWord at every 0.05 step, 8 saved-state clamp cases run through the real loader, 42 slider-handler cases run through the real handler, and a check that each scoring function is declared exactly once. The test takes a path argument. The `capturedFrom` label in scoring-baseline.json now names `git show 0ddb37d:propositions.html`, and no values changed. The brief said "0ddb37d's index.html", but at 0ddb37d the tool is in propositions.html and index.html has no PROPS, as the audit itself says. All 9 audit plants S1 to S9 are caught now. S3 and S5 to S8 were missed before. The browser test also checks that slider to N saves N and survives a reload, that out-of-range saved weights are ignored, and that fractional ones are rounded. |
| VAL-13 | The `|| true` assertion and the no-op math check are removed. Console errors and unexpected hosts now fail all suites. The only tolerated console error is the browser refusing the test's empty count.js because of Fix B's SRI hash. New `tests/browser/goatcounter.test.cjs` serves a stand-in count.js that follows GoatCounter's documented defaults (settings attribute, no_onload, path, title and referrer defaults) and records what it would send. It strips `integrity` from the served HTML, because a stand-in cannot match the SRI hash. It checks 8 guide deep links with count.js arriving at 0 and at 2 s, plus an in-app hash change. It asserts no automatic pageview, exactly one pageview per load, a fixed title and path across all deep links, and no county, city, measure, office, id or `#` in any field. For the tool it asserts exactly the two events with their fixed titles, each sent once and not resent after reload, sending only path, title and event. As a positive control, against HEAD's frontend it fails 43 checks and reproduces PRD-01 ("Ballot choices for Oakland, Alameda County" in the title). Internal-link checks also treat "Something went wrong" and not-found headings as broken. Rendered DOM is now validated with html-validate. |
| VAL-14 | `tests/validator.test.mjs` has 174 plants. It builds one base copy with a rebuilt ledger and freshly recorded order, then requires each plant to produce a new ERROR or WARN line, anchored to the broken id, that is not in the base output. Mutation coverage (disable one err/warn line at a time, rerun the self-test) is now 132 of 142 rules, up from 23 of 81. The 10 untested: missing id, propositions.html not found, jurisdiction missing name, region missing name, region counties not an array, fact missing text, the "summary says reconciled" warning, the two "...and N more" overflow lines, and "no item for Prop N". The audit's 33 planted defects, rerun against new-only lines: all caught except P09 (excerpt relevance, by design), P12 (a docs edit is caught by `npm run check`, not the validator), P14 (needs-review with notes but no gaps is allowed by policy) and P26 (correctly passes, since that measure still has a second threshold claim). |
| VAL-15 | The generic-gap rule now also matches "A person's review ...", "Needs (independent) review", "Not yet verified." and "Review of/against the audited/official ...". A negative-control plant makes sure a specific gap ("Review the vote threshold on page 3 ...") is not flagged. Duplicate gaps are a WARN (FE-09). |
| VAL-17 | README "Setup and testing" documents `npx playwright install --with-deps chromium`, `PLAYWRIGHT_BROWSERS_PATH` and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD`, and every command. package.json now has `"engines": {"node": ">=18"}`. `PORT` overrides the server port. |

## Browser tests for the new county and city UX (`tests/browser/guide.test.cjs`)

Every expectation is computed from data/ and region.json. The suite covers:

- only the nine region.json counties in the Bay Area selector, and no non-Bay county anywhere in the find form;
- the exact control labels and subtitle;
- for each county, city options equal to its city records;
- "Unincorporated area of X" only when listed, and separate from "not sure";
- the SF consolidated city auto-selected with no unincorporated option, and all SF measures on `#/ballot/ca-sf`;
- incomplete and missing city lists disclosed (simulated by serving modified jurisdictions.json to one page);
- changing the county resets the city;
- six invalid ballot URLs plus three invalid find params, each with no false heading, a message and a way back;
- back and forward, including back to Find and "Change place";
- regional facts showing "9 counties and 101 cities and towns" from region.json, with a visible source link;
- coverage-indicator numbers equal to counts from data;
- the exact outside-Bay message on `#/ballot/ca-fresno` and on the statewide section linked from home;
- the district limitations note;
- exact badge wording, with "Needs human review" absent;
- incomplete items show the explanation and never "Not yet researched";
- XSS, storage and cookies, prototype ids, malformed encoding, and the load error state;
- internal links on 7 pages;
- 10 pages at 360, 768 and 1280 in light and dark: axe, overflow, console errors and external hosts.

Dependence on A and B. The whole suite is written against the contract, so it needed Fix A's data (now present) and Fix B's UI (in progress). Against Fix B's in-progress tree it passes 299 of 304. The remaining failures are frontend issues for Fix B:

1. `#/ballot/ca-alameda/ca-alameda-oakland`. The district note links Alameda's `lookupUrl`, labeled "voter profile lookup (registration status)", and never mentions the sample ballot. The requirement is the official sample-ballot lookup.
2. `no-redundant-for` in the rendered HTML of the find and ballot pages. A label wraps its control and also has a `for` attribute.

The weighing suite (224 of 224) and the GoatCounter suite (124 of 124) pass against Fix B's current work. They depend on B's propositions.html CSS, its no_onload setup and its manual count calls.

## Exact output of the final `npm test` (Oct 23, 2026)

```
=== generated files match their generators: node tests/check-generated.mjs
FAIL 7 generated file(s) differ from what the generators produce. Run npm run build and commit the result.
=== data validation: node tools/validate.mjs
17 errors, 1 warnings, 654 ids checked (run date 2026-10-23).
=== validator self-test: node tests/validator.test.mjs
FAIL baseline: the current source data has 14 validator errors (plants below still test only new errors):
validator tests: 164 passed, 1 failed
=== scoring regression: node tests/scoring-regression.mjs
1008 scoring results compared, 0 differences.
1008 reason and limited-flag lines, 81 quality words, 14 limited-flag sets, 8 saved-state cases, 42 slider cases compared, 0 differences.
=== static HTML validation: (no output)
=== browser tests: node tests/browser/run.mjs
guide browser tests: 299 passed, 5 failed
weighing tool browser tests: 224 passed, 0 failed
goatcounter stand-in tests: 124 passed, 0 failed
=== Summary
FAIL (exit 1)    generated files match their generators (0.3 s)
FAIL (exit 1)    data validation (0.2 s)
FAIL (exit 1)    validator self-test (28.8 s)
pass             scoring regression (0.1 s)
pass             static HTML validation (0.4 s)
FAIL (exit 1)    browser tests (157.1 s)
```

The `npm test` run left every tracked file unchanged (links.txt, docs and the ledger were not touched).

Why the remaining failures are expected, and what clears them:

- **check (7 files).** The committed statewide.json and docs predate the new data and the new report.mjs. The fix is `npm run build` by the integration lead after A, B and D finish. sources.json and evidence.json already match, because another agent rebuilt them.
- **validate (17 errors, 1 warning).** In a built scratch copy, exactly these remain:
  - 14 statewide items carry the auto-appended gap "A person's review of the audited fields and excerpts against the official sources", now rejected by VAL-15;
  - 3 candidate-order errors from Fix D's edits: the order changed in `2026-11-03.ca-alameda-berkeley-council-district-8.city-council` and `2026-11-03.ca-alameda-sd-albany-unified-school-district.board-of-education`, and `2026-11-03.ca-alameda-berkeley.rent-stabilization-board-commissioner` is new;
  - 1 warning on the Alameda coverage note.
- **validator self-test.** Its one failure is the baseline test, failing for the same 14 statewide gaps. All 164 plants pass.

## Requests to the integration lead

1. `tools/extract-statewide.mjs` (not mine), line 54: drop `.concat(["A person's review of the audited fields and excerpts against the official sources"])`. The needs-review status already says this, and VAL-15 rejects it. Then run `npm run build`.
2. Ask Fix D to confirm the three candidate-order changes against the official sources, then run `npm run fixtures:candidate-order` and commit the fixture with the data.
3. Ask Fix A or D to update the Alameda `coverage.note` ("14 now have ...", data has 28).
4. Pass the two guide failures above to Fix B.
5. `docs/RELEASE-CHECKLIST.md` (not mine) still describes the old `npm test`, which wrote the ledger and docs. It should now say: `npm run build`, commit, then `npm test`.
