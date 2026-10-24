# Changelog

## October 24, 2026, polish and mobile pass

- **Phones.** A compact Menu replaces wrapped links. The home title breaks as "California Bay Area / Ballot Guide". The main buttons appear right after the tagline. Spacing is tighter and the beta notice is smaller.
- **Candidate evaluation.** The zero-score interface is replaced by a "Research pending" status panel. No candidate has a score. Scores stay behind a switch until every candidate in a contest is rated and reviewed (docs/CANDIDATE-EVALUATION.md).
- **Ballot Weighing Tool.** On phones the progress bar is one compact row that never covers step headings. Calculation tables scroll on their own, and the contribution bar has a color key. No scoring change.
- **About.** A status summary at the top, plus new sections on evidence and preferences, "Insufficient evidence", candidate evaluation and sources.
- **Tests.** Phone menu, header and title layout, back and forward, overflow at 9 widths, the candidate switch and the sticky bar. Details are in audit/2026-10-24/POLISH-REPORT.md.

## October 24, 2026, production push (informational beta)

### Local contests in all nine counties
- **356 local contests and 996 candidates added** from each county's official candidate list: Alameda 50, Contra Costa 55, Marin 40, Napa 14, San Mateo 62, Santa Clara 73, Solano 27, Sonoma 35. San Francisco's 11 were already listed and match the Department of Elections page.
- **List status.** Every added contest is marked confirmed (on the county's official on-ballot or final qualified list) except two Sonoma fire district contests, which are pending and say so on their pages.
- **Seats not on the ballot.** Each county page lists the seats filled without an election (322 in total), with sources.
- **Cross-county contests** appear once and show in each county they cover (for example Livermore Valley Joint Unified, Calistoga Joint Unified, the Sonoma County Board of Education area shared with Marin, and the EBMUD wards).
- **Corrections to existing contests.** Six candidate names now match the ballot name on the county list. City of Alameda contests gained ballot designations and seat counts, and the EBMUD wards gained designations.
- **Coverage matrix.** audit/2026-10-24/COVERAGE-MATRIX.md.

### Propositions
- **Ratings resolved (owner-approved).** Prop 44 accountability 5 to 4: audits are allowed, not required. Props 37 and 38 evidence strength and Prop 37 accountability stay at 3 with rewritten reasons. Prop 44 moves from 56% to 52% with standard weights. The review flags were removed.

### Photos
- **19 Legislature portraits removed.** The PD-CAGov basis does not cover the Legislature. Scott Wiener's portrait was replaced with a CC BY-SA 3.0 file with a VRT permission ticket.
- **Local candidates.** 121 local office-holders and mayoral and supervisor candidates were searched; three images were found and none met the rule. Coverage is 31 of 1,225 (2.5%).

### Site
- **Footer.** The owner's exact credit and disclaimer, with a link to the Secretary of State's elections page, on every page of the guide and the Weighing Tool.
- **Sharing.** Open Graph and Twitter card metadata and a 1200 by 630 preview image (assets/og-image.png).
- **Contest pages** say whether the contest is on an official on-ballot list, and when a contest has no qualified candidates.

### Tests
- New browser checks for list status, no-candidate contests, the seats-not-on-the-ballot list and the nine-county summary. The scoring fixtures were recaptured after the Prop 44 change (earlier baseline kept).

## October 24, 2026, final beta release

### Completeness
- **20 Bay Area districts added.** These were missing:
  - 8 U.S. Representative districts (1, 2, 4, 8, 9, 16, 18 and 19), with 16 candidates;
  - State Senate District 2, with 2 candidates;
  - 11 Assembly districts (2, 4, 11, 12, 15, 21, 23, 25, 26, 28 and 29), with 21 candidates.

  All come from the Secretary of State's certified list, read twice, with district counties from the Offices and Subdivisions list. The guide now has 91 contests and 229 candidates.
- **Check of the existing contests.** An independent check compared the existing 26 statewide, Board of Equalization, congressional and legislative contests with the certified list. It found no mismatches.

### Region at a glance
- **Layout.** Two parallel sections, San Francisco Bay Area and California statewide, each with the same four cards in the same order: counties, incorporated cities, residents, registered voters.
- **New card.** California's 483 incorporated cities (Department of Finance, January 1, 2026).
- **Sources.** Each section has its own source line.
- **Method note.** It explains the nine-county definition, the summed county rows, and the different reference dates.

### Photos
- **More photos.** 50 of 229 candidates now show a photo, up from 33 of 190. The 17 added are official portraits on Wikimedia Commons matched through each candidate's Wikidata item. Three were found but not used: one has an unconfirmed identity and two have a doubtful license.
- **Placeholders.** Candidates without a photo show their initials in a neutral circle.
- **Audit.** PHOTO-AUDIT.md covers every record (generated by `audit/2026-10-24/photo_audit.py`).

### Propositions
- **Independent check.** All 14 were checked against the official voter guide, with no critical discrepancy.
- **Prop 2.** The YES detail and the cost text now say the state must make extra debt payments through 2040 instead of 2030, as the official guide does.
- **Ratings.** No rating changed. The three flagged ratings remain flagged.

### Weighing Tool and scoring (earlier the same day)
- **Percentages.** Weights are shown as percentages of the voter's total. A "How scoring works" box was added, and each proposition shows a weighted evidence rating with a points table. Scores and leans are unchanged (regression: 0 differences).
- **Candidate evaluation mode.** It is on contest pages, with office-specific guidance. No candidate is rated.

### Photos, disclaimer and design (earlier the same day)
- **Disclaimer.** Independent civic tech, built by Supriya Rajeev for educational and informational purposes; unofficial; as is. It is on About, in the footers, in the BETA strip and on the tool.
- **Home page.** It leads with Key dates and Before you vote.
- **Layout.** Section headers are consistent, phone tables are fixed, and duplicate notes are merged.
- **Pre-launch review fixes.**
  - The San Mateo label.
  - Step alignment.
  - Short list badges.
  - The rubric table.
  - The Hilton crop.
  - Wording.

### Tests
- **Validator self-test.** 207 checks, adding the candidate rating and rubric rules.
- **Percentage arithmetic.** 25 checks (new `tests/weights.test.mjs`).
- **Guide browser tests.** 498 checks, adding parallel regional sections, candidate mode and photos.
- **Weighing Tool browser tests.** 268 checks.
- **Visitor counter tests.** 124 checks.
- **Scoring regression.** 1,008 cases, 0 differences.
