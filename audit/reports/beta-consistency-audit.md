# Beta consistency audit (Oct 23, 2026)

Auditor: beta-consistency QA agent (read-only). Scope: the uncommitted beta changes (beta notice, About page, "The region at a glance", "What's covered", `readingNote`, `listBadge`, `region.json` `glance`). Experiments ran in a copy at `/tmp/qa-beta/site`. Pages were rendered with Playwright (Chromium) from `python3 -m http.server` and the visible text captured for `#/`, `#/about`, `#/statewide`, `#/item/2026-11-03.ca.prop-44`, `#/item/2026-11-03.ca.prop-37`, `#/item/2026-11-03.ca-alameda-alameda.measure-l` and `#/candidate/2026-11-03.ca.governor.xavier-becerra`. `node tools/validate.mjs` in the copy gives `0 errors, 0 warnings, 666 ids checked`. Nothing here is marked Verified.

## Findings

### BC-01 (High). About says the guide covers "all of California" for congressional and legislative contests, but the data has only 14 Bay Area districts
- File: `assets/guide.js`, `viewAbout`, section "What it covers".
- Rendered text: "All of California for the 14 statewide propositions and the statewide, congressional and legislative contests. Local measures and contests only for the 9 Bay Area counties…"
- Data (`data/2026-11-03/contests.json`, contests whose jurisdiction type is `state` or `state-district`): 26 contests. These are 8 statewide offices, 4 BOE districts, U.S. Representative districts 10, 11, 12, 14, 15 and 17, State Senator District 10, and Assembly districts 14, 16, 17, 18, 19, 20 and 24. California has far more congressional and legislative districts on the ballot. `docs/COVERAGE-REPORT.md` line 9 agrees with the data: "14 contests are recorded, for districts on ballots in Alameda, Contra Costa, San Francisco, San Mateo and Santa Clara."
- Expected: the About page claims only what the data has.
- Fix: say "All of California for the 14 statewide propositions and the statewide offices and Board of Equalization contests. Congressional and legislative contests only for some Bay Area districts (14 so far)." Better still, compute the number from the data.
- Blocks release: yes. It is a false coverage claim on the scope page voters are pointed to.

### BC-02 (Medium). "Only the last one confirms a fact" points at the wrong item
- File: `assets/guide.js`, `viewAbout`, "How information is checked".
- Rendered text: "Four different things happen, and only the last one confirms a fact." The list order is 1. Software tests, 2. Automated and AI-assisted reading, 3. Review by a person, 4. Completeness. So "the last one" is Completeness, but the review that confirms a fact is item 3.
- In the same list: "Automated checks confirm the site works and the data is consistent." Using "confirm" here weakens the next sentence, which says the checks cannot tell whether a source was read correctly.
- Fix: "…and only review by a person confirms a fact". Alternatively, make Review by a person the last item. Change the software-tests wording to "check that the site works and that the data agrees with itself".
- Blocks release: no. It is a quick fix and recommended before beta.

### BC-03 (Medium). The beta notice says "some" items are unverified, but no record has been checked by a person
- File: `assets/guide.js`, `viewAbout`, beta note.
- Rendered text: "Some summaries, evidence, ratings and local ballot listings have not yet been independently verified."
- Data: 0 records have status `verified`. Statuses are only `needs-review` and `incomplete`. 142 of 143 local measures are Incomplete. The validator reports "0 human-reviewed". On the same page: "No record has yet been checked by a person against the official source."
- Fix: "None of the summaries, evidence, ratings or local ballot listings has yet been checked by a person." The header notice ("Coverage and evidence are still being verified") can stay, but "checked" would match the About wording better.
- Blocks release: no. Recommended before beta.

### BC-04 (Medium). Internal file paths and audit jargon show up in voter-facing notes and gaps
- `data/2026-11-03/statewide.json`, `notes` on all 14 props, rendered under "Research notes": "Corrections are logged in audit/2026-10-22/statewide-changes.json."
- `gaps`, rendered in the "What still needs review" box (seen rendered on `#/item/2026-11-03.ca.prop-44` and `…prop-37`):
  - prop-37 and prop-38: "Evidence-strength rating (3) may not match its corrected rationale under the rubric; the owner decides (EVD-07)"
  - prop-44: "Accountability rating (5) may not match its corrected rationale under the rubric; the owner decides (EVD-06)"
- Voters cannot use "EVD-06/07", "the owner decides", "corrected rationale" or a repo path. The gaps come from `data/statewide-review.json` through `tools/extract-statewide.mjs`, so the fix belongs there.
- Fix: in the notes, drop the path sentence or replace it with "A log of corrections is kept with the guide's records." Reword the gaps to something like "This rating may not match its written reason under the rating rubric. It is under review and has not been changed."
- `guide.js` has `FE-xx` ids only in code comments, which do not render. No personal data (name, email, phone) appears in rendered strings, notes, gaps or readingNotes.
- Blocks release: no.

### BC-05 (Medium). "How the Ballot Weighing Tool works" step 3 does not match the tool's logic or labels
- File: `assets/guide.js`, `toolSteps()`. Shown on `#/statewide` and `#/about`.
- Text: "The tool combines your answer with the evidence score under your weights and shows a lean, such as Leans YES, Leans NO or Mixed."
- `propositions.html` `lean()` (around lines 806 to 821):
  - Against or Strongly against always gives "Leans toward NO", whatever the evidence. The tool's own text says it "reflects your opposition to the goal".
  - "Not sure" gives "Not sure", and no answer gives "Not answered".
  - The evidence score only counts when you support the goal. It then decides between "Leans toward YES" and "Mixed / uncertain", with a cut of 3.0, or 2.0 for Strongly for.
- The labels shown in the tool are "Leans toward YES", "Leans toward NO" and "Mixed / uncertain", not "Leans YES / Leans NO / Mixed".
- Steps 1 and 2 match: the Standard preset is the default, there are 7 factors including Net benefit, Evidence strength and Fiscal clarity, and the answer scale runs from Strongly against to Strongly for.
- Fix: "If you support a measure's goal, the tool checks the evidence score under your weights and shows Leans toward YES or Mixed / uncertain. If you oppose the goal, it shows Leans toward NO. Not sure is not counted either way."
- Blocks release: no.

### BC-06 (Medium). About says each flagged item "lists the open question", but the Ballot Weighing Tool shows these ratings without any flag
- About text: "Three ratings are flagged … Proposition 44's accountability and the evidence strength of Propositions 37 and 38. Their values are unchanged until that review is done, and each item lists the open question."
- What matches:
  - Ratings in `propositions.html` PROPS: 37 `ev: 3`, 38 `ev: 3`, 44 `ac: 5`. These match the gaps ("(3)", "(3)", "(5)").
  - The gaps appear on the guide item pages (BC-04).
  - `docs/RELEASE-CHECKLIST.md` line 45 and `audit/2026-10-23/FINAL-REPORT.md` ("Three ratings are left to the owner: Prop 44 accountability, and Props 37 and 38 evidence strength") list the same three.
- What does not: `grep -ciE 'may not match|under review|flagged' propositions.html` gives `0`. A voter who uses the tool, where the ratings feed the lean, sees no flag. `u` (limited-info) is `{}` for 37 and 38, and `{ if: 1 }` for 44, not `ac`.
- Fix (tool behavior must not change): say "each item's page in this guide lists the open question; the Ballot Weighing Tool shows the current ratings without this flag". Link the three item pages.
- Blocks release: no.

### BC-07 (Low). Two uses of "checked" on the home card can be read as contradicting each other
- Home "What's covered" says: "No county's list has been checked against every city and district". The tile right below says: "9 of 9 Bay Area counties have a city and town list checked as complete". The first is about the local measure and contest lists. The second is about the city inventory, which `jurisdictions.json` `cityInventory` gives as "Matches the regional list of incorporated cities and towns", compared against MTC. The same card also says "No record has been checked by a person yet."
- Fix: make the tile say "city and town list matched to the regional list (MTC/ABAG)".
- Blocks release: no.

### BC-08 (Low). Some data notes use definitive verbs for automated reading
- `local-measures.json` notes:
  - 5 SF records (`ca-sf-city.a`, `.c`, `.d`, …): "Title and short description confirmed from official San Francisco sources."
  - 5 more (`ca-sf-city.b`, `.e`, `.g`, …): "Title confirmed from San Francisco's official list of qualified measures."
  - The same notes begin "Audited Oct 22, 2026 against official sources by automated research", so the context is given.
- 28 records (for example `ca-bayarea-rtm.measure-rtm`, `ca-alameda-alameda.measure-l`) open with "Audited Oct 22 and 23, 2026 against official sources" and do not say "automated" in that sentence.
- Fix: "matched" or "read from" in place of "confirmed", and "Audited by automated research…" for the 28.
- Blocks release: no.

### BC-09 (Low). Capitalization of measure types and office names is inconsistent
- `measureType`:
  - San Mateo records use Title Case: "Bond Measure", "Parcel Tax Measure", "Special Tax Measure", "Transactions and Use Tax Measure", "Term Limits Measure".
  - Elsewhere they use sentence case or a different form: "Bond measure" (`ca-alameda-sd-sunol-glen-unified-school-district.measure-k`), "Bond", "Parcel tax", "Special tax".
  - `ca-santa-clara-cupertino.measure-l` has no `measureType`.
- `office`: "Community College Board, Partial Term" (`ca-sf-ccd-…community-college-board-partial-term`) against "City Council, partial two-year term" (`ca-alameda-san-leandro-council-district-2…`).
- Fix: normalize to sentence case in the data.
- Blocks release: no.

### BC-10 (Low). docs/INDEPENDENT-REVIEW.md has two count tables, 183 and 190 candidates
- Line 40 (Oct 22 table, "End" column): "Candidates | 133, all needs-review | 183, all Needs review". Line 206 (Oct 23 table): "Candidates | 183 | 190".
- The data has 190, and so do the guide, `docs/RELEASE-CHECKLIST.md` line 48 ("71 contests, 190 candidates in all") and the home and About pages. The line-40 table is historical. Its heading, "Starting and ending counts", does not say "Oct 22 round", so a reader can take 183 as current.
- Small wording issue in the same area: RELEASE-CHECKLIST line 48 is on the row "Local candidates", but its 71/190 counts include the 26 statewide and district contests (local alone is 45 contests with 138 candidates, per COVERAGE-REPORT).
- Fix: label the first table "Oct 22 round". On the checklist row, say "45 local contests, 138 candidates (71 and 190 including statewide and district)".
- Blocks release: no.

### BC-11 (Low, informational, not from this diff). Owner's account name is in page markup
- `index.html` line 39 (and `propositions.html` line 1041): `data-goatcounter="https://supriyarajeev.goatcounter.com/count"`. README gives the same GitHub Pages URL. This was noted earlier as PRD-04 and left to the owner. It does not render as page text.

## Checked and found consistent

1. **Proposition numbers and titles.** The 14 statewide records (Props 1 to 5 and 37 to 45) in `statewide.json` match `propositions.html` PROPS one to one on `n` and `name`. The `detailUrl` anchors exist (`id="prop-' + p.n`).
2. **Election date.** It is `2026-11-03` on every record's `election` field and in `elections.json`. Free text uses only "November 3, 2026" or "Nov 3, 2026". No other election date was found in the data, `index.html` or `propositions.html`.
3. **No duplicate records.** No duplicate ids across measures, contests and candidates. No two measures share a jurisdiction and identifier, or a county and identifier. No two contests share a jurisdiction, office and district. No candidate name repeats within a contest or appears in two contests.
4. **References between records.**
   - Every contest's candidate id exists and points back to that contest. There are no orphan candidates.
   - Every record's jurisdiction exists, and every measure or contest id starts with `2026-11-03.<jurisdiction>.`.
5. **Seats against candidates.** No contest has fewer candidates than seats. Six contests are uncontested (seats = candidates). That is possible and is not flagged.
6. **Type against threshold.** All bonds have 55% (school or college) or two-thirds (city GO bonds: Alameda L, Berkeley U, Richmond Q). Every non-initiative special or parcel tax has two-thirds. The majority special taxes are all marked citizen initiative or petition (Berkeley Y, Z, AA; Marin P; Marin Healthcare CC; RTM; Napa B). General taxes have a majority. There are no bond-with-majority or Council-placed parcel-tax-with-majority conflicts.
7. **Statuses and the "Needs review" badge.** Statuses are only `needs-review` and `incomplete`, with 0 `verified`. That fits the About wording: "every item is at this stage or Incomplete" and "No item has this label yet". `listBadge` hides only `needs-review` in lists, and item, contest and candidate pages still call `badge()`. This was seen rendered on the Prop 44 and Becerra pages.
8. **Home and About counts, recomputed from the JSON.**
   - Measures: 14 statewide, 143 local, 84 with a ballot question, 87 with a threshold.
   - Contests: 71, of which 26 statewide or district and 45 local.
   - 190 candidates, 0 verified, 101 cities.
   - Counties: 9 of 9 have measures, 3 of 9 have local contests, 9 of 9 have a complete city list.
   - These all match the rendered text. They also match INDEPENDENT-REVIEW (Oct 23 table), FINAL-REPORT, RELEASE-CHECKLIST and COVERAGE-REPORT, apart from BC-10.
   - The Alameda coverage note ("All 27 … 26 have the ballot question and 26 the vote threshold") matches the data: 27 records, with Sunol Glen K lacking a question and Emeryville BB lacking a threshold.
9. **readingNote.** 36 records carry a readingNote: 27 Alameda measures, 6 Berkeley contests and 3 Oakland Unified contests. Every Alameda record whose notes mention OCR has a readingNote. Each readingNote's list of fields (question, threshold, type) matches fields the record actually has. Each says "A person has not checked this reading." The candidate page shows the contest's readingNote, which fits because those notes are about the contest roster and designations.
10. **https links.** The About claim about "two county links that offer only http" matches the data: `ca-alpine` and `ca-mariposa` `electionsUrl`. The others are `electionsUrlPrevious`. `ext()` labels http links.
11. **Validator rule.** The About claim "every published ballot question must match its quoted official source" is backed by `tools/validate.mjs` line 563.
12. **Glance figures (item 4).**
    - DOF E-1, fetched with WebFetch from https://dof.ca.gov/media/docs/forecasting/demographics/estimates/e-1_2026_press_release.Pdf. The tool's summary gave Jan 1, 2026 county totals of Alameda 1,666,136; Contra Costa 1,163,891; Marin 250,823; Napa 136,374; San Francisco 845,658; San Mateo 748,182; Santa Clara 1,932,468; Solano 452,050; Sonoma 484,022; state 39,592,978; release May 1, 2026, described as preliminary.
    - SOS 60-day Report of Registration, fetched from https://elections.cdn.sos.ca.gov/ror/60day-gen-2026/county.pdf, "as of September 4, 2026". Eligible / Total registered: Alameda 1,153,209 / 979,046; Contra Costa 808,848 / 729,193; Marin 181,855 / 173,434; Napa 97,804 / 86,139; San Francisco 665,620 / 534,048; San Mateo 520,413 / 447,165; Santa Clara 1,291,087 / 1,077,082; Solano 322,691 / 276,817; Sonoma 358,541 / 319,568; State 27,172,905 / 23,164,977.
    - **All 9 county values, the state totals and the eligible values in `data/region.json` match.** Caveat: WebFetch returns a model summary of the PDF, not the raw text, so this is a second reading and not a person's check.
    - Sums: population 7,679,604 (shown as "About 7.7 million"), registered 4,622,492. Both match the rendered tiles.
    - The 58-county figure was not fetched from the cited SOS page. It equals the 58 county records in `jurisdictions.json` (enforced by the validator).
13. **Flagged ratings.** The three named in About (Prop 44 accountability, Props 37 and 38 evidence strength) are the same three in the data gaps, RELEASE-CHECKLIST and FINAL-REPORT, with the same values (see BC-06 for the tool-side gap).

## Not checked
- The full test suite (`npm test`). Only the validator was run.
- The SOS county elections offices page for the 58-county figure. The rendered figures are read from the PDFs only through WebFetch summaries.
- Facts and rubric logic inside each proposition beyond the three flagged ratings.

## Summary

| Id | Severity | Area | Blocks release |
|---|---|---|---|
| BC-01 | High | About claims all-California congressional and legislative coverage, but only 14 Bay Area districts are in the data | Yes |
| BC-02 | Medium | "Only the last one confirms a fact" points to Completeness; software checks "confirm" | No |
| BC-03 | Medium | Beta note says "some" items unverified, but none has been checked by a person | No |
| BC-04 | Medium | Repo path and EVD ids / "owner" jargon in rendered notes and gaps (14 props + 3 gaps) | No |
| BC-05 | Medium | Tool steps misstate lean logic and labels | No |
| BC-06 | Medium | Flagged ratings not disclosed in propositions.html, though About implies they are | No |
| BC-07 | Low | "checked as complete" city-list tile next to "not checked" wording | No |
| BC-08 | Low | "confirmed" and "Audited" wording in automated notes | No |
| BC-09 | Low | measureType and office capitalization; Cupertino L has no type | No |
| BC-10 | Low | 183 vs 190 in INDEPENDENT-REVIEW tables; checklist row label | No |
| BC-11 | Low (info) | Owner's GoatCounter account name in markup (pre-existing PRD-04) | No |
