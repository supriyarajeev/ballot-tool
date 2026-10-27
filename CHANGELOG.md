# Changelog

## October 26, 2026, you're here

- **The card you're working on stands out.** In the Ballot Weighing Tool, the proposition you click, tap, answer, tab into, jump to or scroll to read gets a blue ring, a lifted shadow and a filled "Prop N · you're here" label. Only one card is marked at a time.
- **Always named.** The sticky progress bar shows the current Prop while its card is on screen, and the result headings read "Your answer · Prop N" and "Evidence check · Prop N".
- **Striped ratings explained.** Cards with a rating based on limited information show a key (solid means enough information, striped means limited information, read with caution) and a visible "limited" tag beside each striped rating. No rating changed.
- **Tests.** 27 new browser checks (click, keyboard, scroll, jump, touch at 320 and 390 px, and the limited-information key).

## October 26, 2026, Yes | Not sure | No

- **Three answers.** Each proposition now asks "How would you vote on this proposition?" with Yes, Not sure and No buttons in one row. The selected one is filled and shows a check mark. Each answered card has a Clear answer link.
- **Scoring unchanged.** Yes uses the existing 3.0 evidence line, No is always Leans toward NO, Not sure and skipped stay separate. Saved Strongly for and Strongly against answers load as Yes and No. See audit/2026-10-26/THREE-CHOICE-REPORT.md.
- **Your answer is the result.** Each card shows your answer exactly as chosen and, beside it, the same evidence check for every answer, with a marker at the 3.0 midpoint and a link to the argument on the other side. The "Leans toward" and "Mixed / uncertain" labels are gone. Step 3 counts Yes, No, Not sure and Not answered.
- **On to the cheat sheet.** Answering all 14 shows "That's all 14" with a button to your cheat sheet, and the sticky bar becomes "Next: my cheat sheet". Your Yes and No answers are ticked on the sheet; Not sure and unanswered stay blank. Changes made on the sheet are kept.
- **Tests.** New `tests/three-choice.test.mjs` and browser checks for tapping, keyboard, refresh and layout.

## October 25, 2026, ballot cheat sheet, sharing and How to vote

- **Ballot cheat sheet.** Every ballot page links to `#/sheet/<county>/<city>`. Voters tick YES or NO on each measure and pick candidates, then print it or keep it on their phone. Vote-for limits are enforced. Contests that depend on the address are grouped separately.
- **Weighing Tool leans on the sheet.** Each statewide proposition shows the lean the tool last computed on this device, read from a copy the tool now saves (`ballot-leans-v1`). No rating, weight or lean logic changed.
- **Private by design.** Marks stay in this browser (`ballot-sheet-v1`). Share, WhatsApp and Copy link send the page link only.
- **How to vote page** (`#/how-to-vote`, in the menu). Key dates already in the data, the Secretary of State's registration check, ballot tracking, drop box finder and voter guide, and each Bay Area county's elections office.
- **Tests.** 42 new browser checks for the sheet, sharing, print layout and How to vote.

## October 24, 2026, source link audit

- **All 68 links checked.** Every source link in the Ballot Weighing Tool was checked at its destination. None was broken, and a blank page could not be reproduced in Chrome.
- **HTML first.** LAO analyses (14) and the official arguments for Props 38, 39, 40, 42, 44 and 45 now open the official HTML pages. The PDFs are kept beside them.
- **Redirects.** Four redirecting addresses now point to their final pages.
- **Safe new tabs.** Every source link uses `noopener noreferrer`.
- **New check.** `tools/check-source-links.mjs` checks the links before a release. See audit/2026-10-24/SOURCE-LINK-AUDIT.md.
- **PDF labels.** Each PDF source link shows a PDF tag, and a short note under the sources explains how to view PDFs.
- **Fresh files.** Script and style version tags were updated so returning visitors get the new files at once.

## October 24, 2026, one experience for statewide propositions

- **Statewide propositions open in the tool.** On every ballot page and the statewide page, each of the 14 opens its own card in the Ballot Weighing Tool, with a link back to the ballot. A "Go to Ballot Weighing Tool — All 14 Propositions" button above the list opens the full tool.
- **Local measures** keep their own pages.
- **Old links** to statewide item pages forward to the tool.
- **In the tool:** a "Back to your ballot" link, a Ballot link in the progress bar, and jump links for all 14 propositions.
- **No scoring change.** See audit/2026-10-24/UNIFY-REPORT.md.

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
