# Independent review and audit, October 22, 2026

This file records what the October 22, 2026 audit found and changed. Raw audit outputs, with every excerpt, are in `audit/2026-10-22/raw/`. The scripts that applied them are in `audit/2026-10-22/`.

## How the audit was done

Fifteen research passes ran in parallel, each under the same written rules (`audit/2026-10-22/raw/RULES.md`):
- five for the statewide propositions;
- nine for the county measure lists, one of them shared by Napa, Solano and the regional measure;
- two for the candidate rosters.

Each pass:
- read official pages through an automated reader;
- asked for passages word for word;
- read numbers, dates and thresholds twice where it could;
- recorded what supported each published sentence and what contradicted it.

No pass was allowed to:
- invent a quotation, page, date or reviewer;
- infer a vote threshold from a measure type;
- infer a candidate's position.

Limits that applied to every pass:
- The shell cannot download from election sites, because the network allowlist blocks it. OCR therefore could not run on scanned PDFs, even though OCR software is installed.
- No browser was connected, so scanned pages could not be viewed as images either.
- The shared web-search limit ran out partway through. Several city and district pages were never searched.

## Starting and ending counts (October 22 round)

| Item | Start (reproduced Oct 22) | End |
|---|---|---|
| Data JSON files parsing | 9 of 9 | 11 of 11 (adds statewide-review.json and source-access.json) |
| Validator | 0 errors, 7 warnings, 578 ids | 0 errors, 0 warnings, 654 ids, plus 2 documented http exceptions |
| Scoring regression | 1,008 compared, 0 differences | 1,008 compared, 0 differences |
| Statewide propositions | 14, all needs-review | 14, all Needs review, with every field audited |
| Local measures | 143 (140 incomplete, 3 needs-review) | 143 (142 Incomplete, 1 Needs review) |
| Local measures with official ballot question | 0 (field did not exist) | 71 |
| Local measures with a vote threshold | 7 (5 of them had no official excerpt) | 75, each with an official excerpt |
| Contests | 51, all needs-review | 67, all Needs review |
| Candidates | 133, all needs-review | 183, all Needs review |
| Candidates with an official statement link | 20 | 51 |
| Jurisdictions | 236 | 246 |
| Sources | 136 (111 accessed, 25 text not extracted) | 396 (369 accessed, 27 text not extracted) |
| Evidence records | 665 (9 claim-level) | 1,835 (982 claim-level, 853 link-only) |
| Human-reviewed records or evidence | 0 | 0 |

Why some counts went down:
- **Two measures moved from Needs review to Incomplete.** Oakland Measures EE and FF had plain-English summaries built only from news reporting. Those were withdrawn, because independent reporting may not be the only support for a published fact.
- **Five vote thresholds were removed.** They had no official excerpt behind them.
- **Not-extracted sources rose from 25 to 27.** The two Oakland scanned PDFs are now counted, because those records no longer rely on other content.

## Statewide propositions

All 14 were checked field by field: 409 field checks in all, including every rating reason. Each was compared against:
- the Secretary of State voter guide;
- the LAO analysis;
- the official arguments;
- the legal text, where it could be read. The Prop 4 and 37 texts were not read. The Prop 42 text was read only from an independent copy.

Results before corrections: 287 supported, 78 partly supported, 13 attributions, 29 with no evidence found and 2 contradicted.

93 statements in `propositions.html` were corrected or relabeled. The log, with old text, new text and the reason for each, is `audit/2026-10-22/statewide-changes.json`. The material corrections were:

- **Prop 1.** The accountability line now says the annual report must show homes assisted, households served and where the homes are, plus cost per unit for the main rental program. The measure points to existing Health and Safety Code section 50408, which sets these out. The audit confirmed there is no enforceable target for homes built or cost per home: LAO's 40,000 figures are "up to" estimates. The Howard Jarvis Taxpayers Association was removed as an opponent, because no source was found.
- **Prop 2.** Deposits count against the spending limit when the money is withdrawn. Opponent signer titles were corrected. Unconfirmed 2024-25 and 2025-26 suspension claims were removed.
- **Prop 3.** The joint-filer threshold and the $1,830 per-filer example were removed, because the bracket breakpoints were not confirmed. Roughly 40% of the money goes to schools and community colleges, not "schools and health". The California Medical Association and Reform California were removed, because no source was found.
- **Prop 4.** The state ethics commission "is not required to" enforce local programs. The old text said it "does not".
- **Prop 5.** The succession wording now follows LAO. The 48.6% figure, which had only an independent source, was removed. The 11 recalls since 1913 were state recalls that reached the ballot, mostly of legislators, not statewide recalls.
- **Prop 37.** The $800,000 example is labeled as this guide's arithmetic. The audit and rulemaking claims are attributed to the supporters' argument and the Hoover Institution. Unsupported PPIC claims were removed.
- **Prop 38.** Reports must describe progress toward research milestones, so "no research milestones" became "no numeric research targets". The opponents' argument is restated in its own terms.
- **Prop 39.** The official summary says mail ballots without matching ID digits would not count. The old risk text said the measure was silent on this.
- **Prop 40.** The threshold is $1 billion or more, and the 90/10 split applies after administrative costs. The blocking risk is now attributed to LAO's analyses of Props 41 and 42.
- **Props 41 and 42.** The descriptions now include their conflict clauses. The Prop 41 pre-election audit covers only citizen-initiative special taxes. Unsourced "automatic refunds" and "drafting cross-reference error" claims were replaced. Gov. Newsom was removed as a supporter of Prop 42, because no source was found.
- **Prop 43.** The separate ban on initiative property taxes was added. The ballot-deal history is attributed to news reports. CSAC and Gov. Newsom were removed as opponents, because no source was found.
- **Prop 44.** LAO says some clinics might close. It does not say they would cut services. A penalty is refundable within five years, not forfeited.
- **Prop 45.** Courts may extend the 270-day limit by 90 days, or longer if all parties agree. The count of ten 2025 exemptions was removed, because only one law firm stated it. Supporters and opponents now separate official signers from names reported in the news.

In every proposition, supporters and opponents named only in news reports are now labeled that way.

Each proposition now lists its specific open questions, in `data/statewide-review.json`. That replaces the old generic gap, "Human review against the official voter guide".

## Sources that could not be read

- **25 Alameda County registrar measure PDFs, plus 2 Oakland ones.** Each is a scanned image.
  - **Attempts:**
    - WebFetch returned "This PDF is empty or contains no machine-readable text".
    - A shell download was refused by the allowlist.
    - No browser was available to view the page images.
  - **Alternatives used:** official city documents covered 14 Alameda measures. They were:
    - Albany's clerk page and impartial analyses;
    - Berkeley council resolutions and impartial analyses;
    - Hayward's ballot measure page;
    - Alameda's Measure L page.
  - Each file's attempts and alternative are recorded in `data/source-access.json` and listed in `docs/SOURCE-REGISTER.md`.
- **Other blocked or unreadable sources.**
  - Most San Francisco api.sf.gov documents, including the Ballot Questions PDF.
  - Solano County's measure document server.
  - Oakland's Legistar.
  - The Prop 42 official legal text.
  - The Prop 45 voter guide page.
  - Several city sites that are not on the allowlist.

## Candidates

- **Statewide, Board of Equalization, congressional and legislative rosters.** These match the certified list in every reading.
- **San Francisco.** Names and seats match the Department of Elections page. Statement page numbers now come from the Voter Information Pamphlet.
- **Additions.** 16 contests were added from official city and district rosters.
- **Left out on purpose.** Some contests were left out where the office or district had to be inferred:
  - the three Oakland school board districts;
  - Newark, which has only a filing notice, not a final roster;
  - Pleasanton, where the list does not say which office each name seeks.
- **No candidate claims beyond the official facts were added.** That means no positions, scores or endorsements.

## Local measures

All 143 records were re-checked against their county lists. Two corrections came out of that:
- "Old Adboe" was a typo on Sonoma's filed list. Sonoma's final table and the measure document say "Old Adobe", which is now used.
- The Sonoma Measure AB title is now recorded.

Every Incomplete record lists its specific missing items. Partial cross-checks against city and district pages are recorded on each county, under `inventory.reconciliation`. No county list is fully reconciled, because too many pages could not be reached.

## What "Verified" means here

The rule (see `docs/DATA-MODEL.md`) has two parts:
- A record becomes Verified only when a named person has reviewed it against the official source, and their name and the date are recorded.
- A reproducible automated check could also qualify a straightforward field. Examples are a candidate name compared by script against a stored, checksummed copy of the official certified list.

No such check exists yet, because this environment cannot download official files. So nothing is Verified. Excerpts captured by an automated reader are evidence for a reviewer to confirm. They are not verification.

## Privacy and security review

- **Network.** The browser tests record every request. The pages request only:
  - fonts.googleapis.com (and fonts.gstatic.com for font files);
  - gc.zgo.at, the GoatCounter visitor counter, matching the privacy note.

  No other third-party scripts, APIs or AI services are used.
- **Storage.** The guide writes no browser storage and sets no cookies (tested). The Ballot Weighing Tool saves answers only in localStorage, under "ballot-weighing-v2" and "ballot-gc-sent-v1", as the privacy note says.
- **Visitor counter events.** GoatCounter receives only "answered at least one" and "answered all 14" events. It never receives answers, county or city.
- **Input handling.** All data is HTML-escaped before display. Route and search injection attempts are tested and do not execute.
- **Links.** Links that open a new tab use rel="noopener".
- **Secrets and personal data.** There are no secrets, API keys, address fields or personal data in the repository.

# Second review, October 23, 2026: Bay Area coverage, independent QA and production readiness

The October 23 work followed a written plan (`audit/2026-10-23/FIX-PLAN.md`). The starting state is tagged `baseline-2026-10-23` in git, and its test log is `audit/logs/2026-10-23-baseline-npm-test.log`.

## Agents used, and what each inspected

Each agent was a separate AI worker with its own instructions. None of them reviewed its own fixes. The shared auditor rules are in `audit/reports/QA-BRIEF.md`.

| Round | Agent | What it inspected | Report |
|---|---|---|---|
| QA 1 | Geography | The nine counties and 101 cities and towns against MTC/ABAG, county and city records, district county lists, routing | `audit/reports/geography-audit.md` (GEO-01 to 09) |
| QA 2 | Evidence | Claim rows against their excerpts, the statewide wording, Alameda and Berkeley rosters | `audit/reports/evidence-audit.md` (EVD-01 to 13) |
| QA 3 | Frontend, UX and accessibility | Selectors, routes, empty states, phone and desktop, light and dark, axe | `audit/reports/frontend-qa.md` (FE-01 to 12) |
| QA 4 | Validation and tests | The validator and test suites, by planting errors | `audit/reports/validation-audit.md` (VAL-01 to 17) |
| QA 5 | Privacy and production | The page counter, storage, external hosts, no-JavaScript behavior, deploy files | `audit/reports/production-audit.md` (PRD-01 to 12) |
| Fix A | Geography data | `data/region.json`, `data/jurisdictions.json` | `audit/2026-10-23/fix-A-summary.md` |
| Fix B | Front end | `assets/`, `index.html`, `propositions.html` (outside the scoring code) | `audit/2026-10-23/fix-B-summary.md` |
| Fix C | Validator and tests | `tools/`, `tests/` | `audit/2026-10-23/fix-C-summary.md` |
| Fix D | Evidence and records | `data/2026-11-03/`, `data/evidence-claims.json`, review files | `audit/2026-10-23/fix-D-summary.md` (saved by the integration lead from the agent's report) |
| Retest 1 | Geography and front end | The integrated fixes for GEO and FE findings | `audit/reports/retest-geography-frontend.md` |
| Retest 2 | Evidence and validation | The integrated fixes for EVD and VAL findings | `audit/reports/retest-evidence-validation.md` |
| Retest 3 | Privacy and production | The integrated fixes for PRD findings | `audit/reports/retest-production.md` |
| Retest 4 | Round-2 changes | The integration lead's round-2 fixes | `audit/reports/retest-round2.md` |

The fix agents owned separate files, so no two edited the same file at once. The integration lead (the coordinating AI) reviewed each diff, ran the full test suite after each merge, and made the round-2 fixes. The integration lead also read the 27 scanned Alameda submittal forms by OCR in a browser and compared the key passages with the page images, and read the Berkeley notice of nominees and the Oakland clerk's list visually. These are automated or AI readings. No person has reviewed them.

The five QA reports list 63 findings. The retests found 21 more (R1-01 to 05, R2-01 to 07, R3-01 to 03, R4-01 to 06), all medium or low.

## Fixes accepted

- **Region and selectors.** The nine counties and 101 cities and towns are recorded in `data/region.json`, with MTC and ABAG wording and links. Every county's city list matches its count. The county selector shows only the nine counties. The city selector shows only that county's cities and towns, plus an unincorporated-area choice where the county has one. San Francisco is shown as one city and county (GEO-01, which had hidden its city measures).
- **Statewide-only areas.** Other counties get a statewide page that says local coverage outside the Bay Area is still being developed. Board of Equalization districts 1 and 4 split San Bernardino County, so they show there as "may apply".
- **Privacy.** The page counter now sends a fixed page title and path, never the county or city choice (PRD-01, a blocker). The counter script is pinned to a version with an integrity hash. Repeated tool events in one page load are sent once.
- **Evidence.** Ballot questions, thresholds and measure types were added for 27 Alameda measures from the registrar forms, and the city-sourced rows they replace are marked superseded. The Berkeley District 8 and Rent Stabilization Board rosters were corrected, and Berkeley designations were added where the notice prints them. Three Oakland Unified district contests were added. Albany USD's City Clerk, wrongly listed as a candidate, was removed. 264 claim rows whose excerpts only partly support them were relabeled partly supported. Three statewide wording fixes were made (Props 3, 39 and 44) without changing any rating. The scoring regression still shows 0 differences.
- **Validation.** The validator now catches:
  - parent cycles;
  - geography mismatches;
  - evidence that does not back a published threshold, ballot question or measure type. The backing must be a current, official, non-attribution row whose excerpt contains the published question and states the same vote requirement.
  - contest ids that do not match their jurisdiction;
  - bad split-county lists;
  - stale generated files.

  The self-test plants 178 errors and catches all of them.

## Retests repeated independently

| Area | Retest result |
|---|---|
| Geography and front end | 16 of 21 earlier findings fixed, 4 partly fixed, 1 not fixed (GEO-07: district boundaries are not mapped, so districts show as "may apply"). R1-01 to 05 are low and were addressed in round 2 |
| Evidence and validation | EVD: 9 fixed (6 with caveats), 2 partly fixed, 2 deferred to the owner (ratings). VAL: 13 fixed (3 with caveats), 4 partly fixed. Disabling the validator's 142 rules one at a time, the self-test caught 132. R2-01 to 07 were addressed in round 2 |
| Privacy and production | No blockers. PRD-01 was retested with 74 scenarios and fixed. PRD-04 (the owner's name in files) and PRD-06 (no "clear all" for saved weights) are left to the owner |
| Round 2 | No blocker or high finding. R4-01 to 06 (2 medium, 4 low) were fixed afterward and the full suite rerun (`audit/logs/2026-10-23-round3.log`). Those last fixes were checked by the test suite and new plants, not by another independent agent; see `audit/reports/retest-round2.md` |

## Before and after counts (computed from data)

| Item | Baseline (Oct 23, start) | After |
|---|---|---|
| Bay Area cities and towns recorded | 101 | 101, now checked against `data/region.json` |
| Local measures | 143 | 143 |
| with ballot question | 71 | 84 |
| with threshold | 75 | 87 |
| with measure type | 108 | 119 |
| Candidate contests | 67 | 71 |
| Candidates | 183 | 190 |
| with ballot designation | 67 | 97 |
| Claim-level evidence rows | 982 (952 supported, 30 attribution) | 1,086 (792 supported, 264 partly supported, 30 attribution) |
| Sources | 396 (27 with text not extracted) | 404 (all read) |
| Records marked Verified | 0 | 0 |

## Erratum for the October 22 log

Correction 7 in `audit/2026-10-22/statewide-changes.json` (Prop 4, `yesE`) gives its reason as "Eligibility rules per LAO and the Assembly analysis". The party and incumbency rule comes from the proposition's legal text (Gov. Code §85300(g)), not from LAO. The corrected sourcing is in the evidence rows `evc-prop4-yesE-3` and `evc-prop4-does-4`. The wording on the page is unchanged.

## Still open

- No record has had a person's review, so nothing is Verified.
- District boundaries are not mapped (GEO-07).
- The owner should decide on three ratings: Prop 44 accountability (rated 5; the rubric reads as 3), and Props 37 and 38 evidence strength (rated 3; no direct evidence found).
- Sunol Glen K has no published ballot question, because the form has handwritten edits. Emeryville BB has no threshold or type, because no submittal form was found.
- There is no Content Security Policy, because the pages use inline scripts.
- Two county election links (Alpine, Mariposa) are http only; they are labeled.

# Beta-release changes, October 23, 2026 (evening)

This round prepared the guide for a limited beta. It did not change any rating, score, weight, formula, saved-state behavior or status in the data. It marked nothing Verified.

## Changes made

- **Beta notice.** A one-line notice sits under the top bar of every guide page. It reads "BETA. Coverage and evidence are still being verified. Confirm your ballot with your county elections office." It links to a new About page (`#/about`), which is also in the top navigation. The About page covers:
  - what the guide does and covers;
  - the four kinds of checking (software tests, automated and AI-assisted reading, review by a person, completeness);
  - districts and eligibility;
  - how the Ballot Weighing Tool works;
  - the three ratings under review;
  - what each label means;
  - official links.
- **Labels.** The "Needs review" badge was removed from lists only (ballot overviews, the contest list, the statewide list and candidate cards). Each record's own page still shows it, with what still needs checking. Incomplete badges and "May apply" stay in lists. Statuses in the data are unchanged.
- **Item-level warnings.** A "How this was read" note now appears next to the facts on 36 records. Those facts were read by OCR or by an AI assistant looking at a page image:
  - 27 Alameda measures;
  - 3 Oakland Unified district contests;
  - 6 Berkeley contests.

  Candidate pages repeat their contest's note.
- **Home page.**
  - **"The region at a glance."** About 7.7 million Bay Area residents (California Department of Finance, Jan 1, 2026, provisional). 4,622,492 registered voters in the nine counties and 23,164,977 statewide (Secretary of State, Report of Registration as of Sept 4, 2026). 58 California counties. Each figure is stored by county in `data/region.json` with its source and date. The guide adds the county values, and the validator checks them.
  - **"What's covered."** Counts computed from the records, with a statement that recorded is not checked by a person and that local coverage is incomplete.
  - **"Before you vote."** Official county, statewide, language-hotline and accessibility links, each opened and checked on Oct 23, 2026.
- **Wording.** Several notes said "confirmed" or "audited" about automated reading; they now say so plainly. Internal file paths and audit codes were removed from text voters see. The Ballot Weighing Tool's "Last checked" note now names the three ratings under review, and the ratings themselves are unchanged.
- **Validator self-test.** Plants now run in parallel, each in its own sandbox, with progress printed every 25 plants. Every plant and every pattern is kept; 8 plants were added for the new region figures. A rule deliberately disabled in a copy was still caught.

## Independent check

A separate agent checked this round's changes against the data (`audit/reports/beta-consistency-audit.md`). It found 1 high, 5 medium and 5 low issues. All were fixed except two:
- BC-09: inconsistent capitalization of measure types (San Mateo uses title case), and Cupertino Measure L has no measure type recorded.
- BC-11: the visitor-counter account name, left to the owner as PRD-04.

The fixes after that audit were checked by the test suite, not by another agent.

## The self-test timeout

A run of the full suite by someone else reportedly timed out during the validator self-test. That timeout could not be reproduced here:
- On a 2-CPU machine the self-test finished in 35 seconds before this change with Node.js 22, and in 45 seconds with Node.js 18.20.8.
- It now takes about 20 seconds.

The most likely cause is a command time limit in the environment. The full `npm test` takes several minutes, and the self-test used to print nothing until it finished. No hang or defect was found. `README.md` lists the measured times and how to run the steps one at a time.
