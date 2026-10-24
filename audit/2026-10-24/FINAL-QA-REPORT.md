# Final QA and release report (October 24, 2026, production push)

## Decision

**READY TO PUBLISH AS AN INFORMATIONAL BETA.**

Every automated check passed on the final build. Every known gap is disclosed on the site and in LIMITATIONS.md. Nothing was deployed or pushed. The owner uploads the build (UPLOAD-INSTRUCTIONS.md).

- **Completeness rating.** 8.0 of 10.
- **Overall rating.** 8.5 of 10 (section 4). The earlier round was 8.0.

## 1. What this push did, by priority

| Priority | Item | Result |
|---|---|---|
| P1 | Local contests and candidates, nine counties | **Done.** 356 contests and 996 candidates added from county lists. The guide now lists 412 local contests (cross-county ones counted in each county) with 1,161 candidate entries. 363 are confirmed against an official on-ballot or final qualified list; 2 Sonoma fire contests are pending. 322 seats not on the ballot are listed with sources. See COVERAGE-MATRIX.md. |
| P1 | Existing contests | Six candidate names corrected to the ballot name on the county list. City of Alameda designations and seat counts and EBMUD designations added (name-corrections.log). |
| P2 | Photos | 19 Legislature portraits removed and 1 replaced with a CC BY-SA file. 121 local office-holders and mayoral and supervisor candidates searched; 3 found, none met the rule. **Coverage 31 of 1,225 (2.5%).** The 80% target was not reachable legitimately. See PHOTO-AUDIT.md. |
| P3 | Flagged ratings | Resolved. Prop 44 accountability 5 to 4; the other three stay at 3 with new reasons. Prop 44 moves from 56% to 52%. See PROPOSITION-CHANGELOG.md. |
| P4 | Regional stats | No newer registration report exists (only the 60-day report was posted as of October 24). Figures unchanged. See REGIONAL-STATS.md. |
| P5 | Consistency and accessibility | Contest pages show list status and no-candidate contests. County pages list seats not on the ballot. Coverage notes rewritten from the data. axe-core is clean on every tested route. |
| P6 | Footer | The owner's exact wording on every guide page and the Weighing Tool, with the link to https://www.sos.ca.gov/elections. Tested on three routes and the tool. |
| P7 | Sharing | Open Graph and Twitter metadata on both pages; a 1200 by 630 preview image. |
| P8 | Tests and deliverables | All run and passed (section 2). |

## 2. Tests actually run (final build)

Full log: `audit/logs/2026-10-24-production-npm-test.log`. Command `npm test`, exit 0.

| Check | Result |
|---|---|
| Generated files match their generators | Passed |
| Data validation | Passed: 0 errors, 0 warnings, 2,308 ids |
| Validator self-test | Passed, 207 of 207 |
| Scoring regression (fixtures recaptured after the Prop 44 change) | Passed: 1,008 cases, 0 differences |
| Percentage arithmetic | Passed, 25 of 25 |
| Static HTML (html-validate) | Passed |
| Guide in Chromium (4 viewports, light and dark, axe-core) | Passed, 510 of 510 |
| Weighing Tool in Chromium | Passed, 272 of 272 |
| Visitor counter stand-in | Passed, 124 of 124 |
| Photo audit script | Passed: 0 problems, 0 orphans |
| Route tour, 17 routes at 390 and 1280 px (overflow, broken images, console errors) | Passed: none found |

**What the tests do not show.** A passing test is not proof that a fact is right. No person compared any record with an official source. Nothing was tested on the live site, because nothing was deployed. Safari and Firefox were not tested.

## 3. How the local data was read

| County | Read by | Readings |
|---|---|---|
| Alameda | Research agent, county ROV online list | Two, matched |
| Contra Costa | Project lead, two county PDFs in a browser | One each; the lists agree |
| Marin, Napa, San Mateo, Sonoma | Research agents, county lists | Two each; differences noted per contest |
| Santa Clara | Project lead, final qualified list PDF in a browser | One; agrees with the county's write-in contest list |
| Solano | Project lead, filing log PDF in a browser | One |
| San Francisco | Already in the guide; rechecked against the Department of Elections page | Matched |

No contact details from any list were copied.

## 4. Evidence-based quality score

| Category | Weight | Score | Why |
|---|---|---:|---|
| Factual accuracy and source quality | 25% | 8.0 | Every local contest now traces to an official county list. No human review, some capitalization is guessed, and a few counties were read once. |
| Completeness | 20% | 8.0 | Propositions, statewide, congressional, legislative and local contests are covered in all nine counties. Candidate statements and details and most local measure content are still missing. |
| Scoring correctness and transparency | 20% | 9.5 | Flags resolved with cited evidence, change logged, regression rebaselined with the old fixture kept. |
| Usability, design, mobile | 15% | 8.5 | Consistent layout, no overflow at 390 px. Long county notes and long pages remain. |
| Accessibility and reliability | 10% | 9.0 | axe-core clean on every tested route and theme. Chromium only. |
| Documentation, photo rights, deployment | 10% | 8.5 | Complete reports and a ZIP. Unsettled photo bases removed. Photo coverage is very low. |
| **Weighted total** | | **8.5 / 10** | |

**What would reach 9 or more.**
- A person spot-checking local contests against sample ballots.
- Candidate statement links and ballot designations for all counties.
- Local measure content outside Alameda.
- The 15-day registration report when published.

## 5. Related reports

COVERAGE-MATRIX.md, PHOTO-AUDIT.md, PROPOSITION-CHANGELOG.md, SCORING-REPORT.md, REGIONAL-STATS.md, OWNER-REVIEW.md, LIMITATIONS.md, and CHANGELOG.md and UPLOAD-INSTRUCTIONS.md at the root.
