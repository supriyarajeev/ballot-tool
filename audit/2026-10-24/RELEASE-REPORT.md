# Release report (October 24, 2026)

> Later the same day the final audit added 20 missing districts and 17 photos, and rebuilt the region card. Final counts: 91 contests, 229 candidates, 50 photos. See CHANGELOG.md and FINAL-QA-REPORT.md; figures below describe the earlier pass.

## Summary

This release corrects the statewide proposition text against the Official Voter Information Guide, adds official voter resources, and adds a candidate photo system with license records (33 photos shown, on the owner's decision), and a disclaimer. It also includes the visual upgrade (county map, key dates, coverage bars, evidence cues) and the skip-link fix.

Nothing was deployed. The Ballot Weighing Tool's ratings, weights, formulas, reasons, saved state and results are unchanged. The scoring regression against the original tool shows 0 differences.

## 1. Factual corrections

**Approved corrections P1 to P19.** These are wording, attribution and source links for Props 1, 2, 3, 4, 37, 38, 39, 40, 41, 43, 44 and 45. Each one is logged with the old text, new text, official quote and URL in `statewide-changes-3.json`. Highlights:
- The Prop 3 LAO link opened the Prop 45 page; it now links the Prop 3 LAO analysis.
- Missing official argument signers were added for Props 2, 44 and 45.
- An unsupported Prop 45 sentence about 2025 exemptions was removed.
- An unsupported Prop 41 rebate claim was replaced with the LAO's own wording.
- The Prop 41 legal text now links the official PDF instead of a third-party copy.

**Optional corrections O1 to O7.** Each was applied only after its source was re-read on October 24, 2026. They are logged in `statewide-changes-4.json`:
- the Prop 5 arguments link;
- the Prop 37 price cap and residency rule;
- an extra official supporter for Prop 37;
- the Prop 40 conflict wording, now from its own LAO analysis;
- the Prop 42 label;
- the official opponents of Prop 45;
- the League of Women Voters of California's position on Prop 45, now sourced to the League's own page.

**Review gaps.**
- Seven gaps the official text now answers were closed or narrowed, each with its quote. They are logged in `statewide-changes-4.json`.
- Three gaps about wording that changed were removed.
- One closure was reopened after review, because it still rested on an image's alt text (the Prop 45 LAO figure).

**Evidence ledger.**
- The claim text on rows behind changed fields was updated.
- 22 new rows quote the official text.
- No row is marked human-reviewed.

**Owner decisions not taken.**
- The three flagged ratings are unchanged: Prop 44 accountability, and Props 37 and 38 evidence strength.
- The Stage 1 audit also found that the written reason for Prop 37's accountability rating calls the audits a supporters' claim, while the legal text requires them. The reason and the rating are unchanged.

## 2. Official voter resources

**Home page, "Before you vote."**
- County elections offices.
- Same-day (conditional) registration. The text says the online deadline has passed and how to register and vote through Election Day.
- Registration status, early voting and drop-off locations, and ballot tracking.
- The official voter guide and its audio, large-print and other-language versions.
- Voter hotlines in ten languages.
- Assistance for voters with disabilities.

**About page.** The full list of 13 official links.

**Statewide page.** All propositions in the official guide, the guide home and other formats.

**Contests page.** Official candidate statements and the certified list of candidates.

**Ballot Weighing Tool.** One sentence added to its "Last checked" note, linking the propositions index and other formats.

**Not reachable from here.** Registration status (`voterstatus.sos.ca.gov`) and early voting (`caearlyvoting.sos.ca.gov`) could not be opened by the audit's tools. Both are linked by name from checked Secretary of State pages. Open each once in a browser after publishing.

## 3. Candidate photos

**Owner decision, Oct 24, 2026.** The site owner chose to show every candidate photo found on Wikimedia Commons with a public-domain or Creative Commons tag, and to rely on a disclaimer for this beta.

**Shown.** 33 of 190 candidates, in 29 contests, including Weber, Wagner, Allen and Wiener, whose photos had been withdrawn. Each has a credit, a source link and a license link on its contest and candidate pages. The 26 added photos had their Commons license templates, artist, date and description read through the Commons API. Event photos of Hilton, Kounalakis, Gipson and Umberg were cropped around the candidate.

**Rule change.** A photo is no longer hidden when an opponent has none. A candidate without a photo gets a neutral grey placeholder, and the page says the placeholder means no reusable photo was found.

**Legal basis, stated plainly.** 11 shown photos are credited to the State Assembly or Senate and tagged PD-CAGov. That tag rests on the California Public Records Act, which does not cover the Legislature, so their basis is not settled. Each record says so. A disclaimer does not by itself create a license; the About page offers removal on request through the GitHub repository.

**Not used.** The official voter guide photos (no license given) and Gloria Romero's Commons file (license doubtful, sourced from a news site).

**Disclaimer.** The About page has a "Disclaimer and who made this" section. It names the project as independent civic technology built by Supriya Rajeev for educational and informational purposes, not an official election resource, unaffiliated, provided as is without warranty, with photo credits and a removal route. A short version is in every page footer, in the BETA strip, and on the Ballot Weighing Tool.

The full list is in `PHOTO-MANIFEST.md`.

## 3a. Visual and navigation fixes (final pass)

- Home page order puts voter actions first. Key dates, then Before you vote, then the Ballot Weighing Tool, then the regional figures and coverage.
- The region-at-a-glance card has two labeled groups, Bay Area and California, with even tiles, the figure and unit on one line, and a compact source line.
- The county coverage table stacks on phones, so the contests column no longer wraps one word per line.
- Every collapsible list header shows the title, then the count on its own line, then the open sign, in the same layout on every page.
- The ballot page merges two notes that said the same thing.

## 3b. Percentage scoring and candidate evaluation mode

The full write-up, with all 14 results and a sample calculation, is in `SCORING-REPORT.md`.

- **Weighing Tool.** Weights are shown as percentages of the voter's total. A "How scoring works" box explains the method, and each proposition shows "Weighted evidence rating: N% (x.x/5)" with a calculation table. The scoring functions, cutoffs and leans are unchanged (0 differences in the regression). The meter bar now fills to the same percentage as the text.
- **Candidate evaluation mode.** It is on contest pages, uses the same seven factors and the voter's weights, and has office-specific guidance. No candidate is rated yet, so every factor shows Insufficient evidence and nothing is calculated or ranked.
- **Review fixes.**
  - The San Mateo map label is no longer covered.
  - Ballot Weighing Tool steps align on desktop.
  - The short "Incomplete" badge in lists (the full label stays for screen readers and on item pages).
  - The rubric table scrolls instead of splitting words.
  - A BETA note and matching disclaimer on the tool.
  - A better Steve Hilton crop from a closer Commons photo.
  - Aisha Wahab's House portrait was confirmed against Wikipedia (she has served in Congress since 2026).
  - Coverage box entries are capitalized.
  - The photo comment in the code is corrected.

## 4. Outstanding issues

**Human review.** No record has been reviewed by a person; nothing is marked Verified.

**Ratings.** Three owner rating decisions remain, plus the Prop 37 accountability reason.

**Sources not reachable from here.**
- The LAO PDFs for Props 38 and 39.
- The Prop 2 budget summary.
- The Prop 3 SPUR page.
- The registration status and early voting pages.

**Photos.**
- The photo licenses were read once, from Commons records; an independent recheck could not open those pages.
- 11 Legislature photos have no settled legal basis (see section 3). Other PD-CAGov photos rely on Commons' reading for state and local government works, which is a common reading, not a court ruling.
- Photos were matched by Wikidata item or file description naming the office, not compared with the official guide photos.

**Local coverage.** No county list is reconciled, and district boundaries are not mapped.

**Security.** There is no Content Security Policy, because the pages use inline scripts.

## 5. Files changed in this release

- **`propositions.html`.** Proposition text and source links only, plus one line in the "Last checked" note.
- **`assets/guide.js`, `assets/guide.css`, `index.html`.** The visual upgrade, the official links, the photo frames and credits, and the skip-link fix.
- **`assets/candidates/`.** New: `raju.jpg`, `kim.jpg` and `chan.jpg`, each 192×192 px.
- **`data/`.**
  - `candidates.json`: photo records.
  - `elections.json`: key dates.
  - `region.json`: regional figures.
  - `bay-map.json`: new.
  - `statewide-review.json`: gaps.
  - `evidence-claims.json`: new and updated rows.
  - Regenerated files: `statewide.json`, `evidence.json` and `sources.json`.
- **`tools/validate.mjs`.** Rules for photos, key dates and the map. `tools/build-map.mjs` is new.
- **`tests/`.** New plants and browser checks.
- **`docs/`, `README.md`, `UPLOAD-INSTRUCTIONS.md`.** Documentation.
- **`audit/2026-10-24/`.** The Stage 1 reports, change logs, photo manifest, these reports, and the review reports in `audit/reports/`.
