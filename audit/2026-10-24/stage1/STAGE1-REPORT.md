# Stage 1 report: official sources, links and candidate photos (October 24, 2026)

This is a read-only audit. Five independent checks ran against the Official Voter Information Guide and other Secretary of State pages. Each wrote its own report in this folder:
- `props-1-5.md`
- `props-37-41.md`
- `props-42-45.md`
- `candidates-and-photos.md`
- `official-links.md`

Each report gives the exact current text, the official quote, the URL and the proposed replacement. Nothing in the site or the data was changed. Nothing was deployed.

How the official text was read:
- Through a fetch tool that returns quoted excerpts. Direct downloads from the Secretary of State and LAO servers were blocked here.
- A few long passages were read in parts.
- A few hosts could not be reached and are listed as unreachable, not broken.
- None of this is a person's review.

## 1. Statewide propositions

The basics match for all 14 propositions:
- official numbers and titles;
- measure types;
- ballot summaries;
- what YES and NO mean;
- the LAO fiscal lines;
- nearly all official argument signers.

`propositions.html` and `data/2026-11-03/statewide.json` match field for field.

### Proposed corrections (factual or attribution), high or medium confidence

| # | Prop | Field | Problem | Proposed fix | Confidence |
|---|---|---|---|---|---|
| P1 | 3 | LAO link | The link returned the LAO page for Prop 45 | Link the LAO PDF `prop3-110326.pdf` (checked, opens Prop 3) | Medium |
| P2 | 4 | argument for | The "California alone bans public financing" claim comes from the supporters' rebuttal, not their argument | Attribute it to the rebuttal | High |
| P3 | 4 | what it does | "the 1988 ban". The official 2026 guide gives no year. The year comes from a 2025 committee analysis | "Repeals the state ban on public funding of campaigns..." | Medium |
| P4 | 1 | accountability | "cost per unit for the main rental program" is not supported by the measure's text | Reword to what the text requires | Medium |
| P5 | 2 | supporters | Leaves out an official argument signer, the Los Angeles Area Chamber of Commerce | Add | High |
| P6 | 37 | accountability | The annual program audit and the rulemaking exemption are written into the legal text, but the site credits them to the supporters and Hoover | Attribute them to the legal text (Sec. 51515.05(g) and (a)) | High |
| P7 | 38 | money | The 10% share is licensing and sales revenue, paid to the General Fund only until the bond costs are covered. The LAO's possible offset is missing | Replace the text | Medium |
| P8 | 38 | sources | No legal text link | Add the official legal text PDF | High |
| P9 | 39 | supporters | Credits LAist for a signer the official guide itself lists | Cite the official guide and add the official rebuttal signers | Medium |
| P10 | 40 | supporters | Credits Wikipedia for Sen. Sanders, whom the official guide lists as a supporter | Cite the official guide | High |
| P11 | 41 | risk | The rebate claim does not appear in the LAO analysis or the official summary | Replace with what the official text says | Medium |
| P12 | 41 | sources | The legal text link points to a GrowSF copy | Link the official legal text PDF instead | High |
| P13 | 44 | opponents | Leaves out an official signer, the California School Nurses Organization | Add | High |
| P14 | 45 | supporters | Leaves out an official signer, the California Council on Affordable Housing | Add | High |
| P15 | 45 | NO meaning | "This includes CEQA exemptions the Legislature passed in 2025" is not in the guide or the LAO analysis | Use the official NO wording only | Medium |
| P16 | 45 | key uncertainty | "four to five years" is not in the cited article. The other source says "about five years" | Quote the source accurately | Medium |
| P17 | 44 | what it does | The refund condition is incomplete. A spending plan agreed with the Department of Public Health is also required, and there is a waiver | Replace the text | Medium |
| P18 | 43 | what it does | The property tax clause is described as applying only to citizen initiatives. Legal text §4.5(b) applies it to every local government | Replace the sentence | Medium |
| P19 | 44 | YES meaning | Drops the word "care" from the official YES statement | Use the official sentence | High |

### Optional or low confidence

| # | Prop | Item |
|---|---|---|
| O1 | 5 | Link to the arguments page instead of the print PDF, matching Props 1 to 4 |
| O2 | 37 | Add the price cap and the one-year residency rule to "what it does" |
| O3 | 37 | Add United Nurses Associations of California to the supporters |
| O4 | 40 | Note that the LAO's Prop 40 analysis itself states the conflict with Props 41 and 42 |
| O5 | 45 | The League of Women Voters is credited to a news source that does not name it. Remove it or find a source |
| O6 | 42 | Change the PORAC label to "official listing, argument and rebuttal" |
| O7 | 45 | Add Physicians for Social Responsibility, LA and the National Wildlife Federation from the official listing |
| O8 | 1 to 5, 42, 44, 45 | Close the open "gaps" entries that the official text now answers (listed in the reports) |

### Ratings (owner decisions, not proposed changes)

- **Prop 37, accountability reason.** It calls the audits a supporters' claim, but the legal text requires them. The written reason conflicts with the official text. The rating value is untouched.
- **Prop 37 and Prop 38, evidence strength.** No conflict with official text was found. The reasons say no direct evidence was found, and that stands. The question of whether 3 is the right rating remains open.
- **Prop 44, accountability.** No conflict with official text was found. Every part of the written reason is in the legal text. The October 23 question about the rubric (5 against 3) remains open.

### Links that could not be checked from here

Open these once in a normal browser:
- the LAO PDFs for Props 38 and 39;
- the ebudget.ca.gov budget summary (Prop 2);
- the SPUR page (Prop 3).

## 2. Statewide and legislative candidates

- **Statewide.** All 16 statewide candidates match the certified list of August 27, 2026: name as printed, office, party preference, ballot designation and order.
- **Congressional and legislative.** 26 candidates were spot-checked, with the same result.
- **Statements.** All statement links and "no statement" notes match the official guide. Becerra, Hilton and Bonta have "No candidate statement."
- **Incumbents.** The certified list marks no sitting U.S. House members with an incumbent star. So DeSaulnier, Simon, Mullin and Khanna are not marked as incumbents on the site, which matches the list.
- **Optional.** Add, as a source for Becerra, Hilton and Bonta, the official page that shows "No candidate statement."

## 3. Official voter links

Already linked and correct:
- the voter guide home;
- assistance for voters with disabilities;
- voter hotlines in ten languages;
- county elections offices.

Proposed additions, each opened and checked unless marked:

| Resource | URL | Checked |
|---|---|---|
| Same-day (conditional) registration (the online deadline has passed) | https://www.sos.ca.gov/elections/voter-registration/same-day-reg | yes |
| Check registration status | https://voterstatus.sos.ca.gov/ | not reachable from here (bot check) |
| Early voting and drop-off locations | https://caearlyvoting.sos.ca.gov/ | not reachable from here |
| Polling place lookup by county | https://www.sos.ca.gov/elections/polling-place | yes |
| Track your ballot (Where's My Ballot?) | https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot | yes |
| Audio, large print and other languages | https://voterguide.sos.ca.gov/en/alt-versions/ | yes (no braille mentioned, so none promised) |
| All propositions in the official guide | https://voterguide.sos.ca.gov/propositions/ | yes |
| Candidate statements | https://voterguide.sos.ca.gov/candidates/ | yes |
| Certified List of Candidates | https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf | yes |

Proposed placement:
- Home "Before you vote": registration, status, locations, tracking and formats, in one compact paragraph.
- About "Confirm your ballot": the full list.
- Statewide page and each proposition page: the official guide and the propositions index.
- Contests page: candidate statements and the certified list.
- `propositions.html`: one line in the existing "Last checked" paragraph. The tool's controls and scoring are untouched.

## 4. Candidate photos

- **What exists.** The state voter guide publishes 13 candidate photos for the statewide contests. Becerra, Hilton and Bonta show "No Photo Submitted."
- **Reuse rights: unclear, treat as not cleared.** The only rights text is "© California Secretary of State." No license is given. The photos are submitted by candidates, and nothing says who owns them.
- **San Francisco.** sf.gov reserves all rights.
- **Alameda.** No photos or terms were found.

**Recommendation.** Do not copy or rehost any photo now. Show the same neutral placeholder for every candidate in a contest, with a link to the candidate's official statement page, where the official photo appears. Photos would be added only for candidates whose campaigns give written permission, with the permission recorded.

## 5. What Stage 2 would change (pending approval)

- **`propositions.html` (PROPS text and source links only).**
  - Approved items from section 1.
  - Ratings, weights, formulas, reasons (`r.*`) and saved state are untouched.
  - The scoring regression must still show 0 differences.
  - The changes are logged in `audit/2026-10-24/statewide-changes-3.json` with old text, new text and the official quote.
- **Generated data.**
  - `data/2026-11-03/statewide.json` is rebuilt.
  - The evidence rows in `data/evidence-claims.json` behind changed fields are updated.
  - Closed gaps are removed in `data/statewide-review.json`.
- **`assets/guide.js`, `index.html`.**
  - The approved links.
  - Candidate cards with a uniform placeholder and an "official statement" link.
  - No change to the data structure except an optional `photo` record per candidate (source URL, page, retrieval date, permission), left empty until permission exists.
- **Tests and docs.**
  - New link and placeholder tests.
  - The validator rejects a `photo` without a permission record.
  - A change log.
