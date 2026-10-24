# Evidence and election facts audit (Agent 2), Oct 23, 2026

Scope follows QA-BRIEF.md. Audit only. The only repository file written is this report; scratch files are in /tmp/qa-agent2/. Nothing here is marked Verified. Every web check was done with WebFetch/WebSearch, and WebFetch answers come from a summarizing reader, so "found" below means the reader reported the text on the page, not a person's word for word comparison.

## Method and access limits

- WebFetch in this session only opened URLs that a WebSearch had returned. Direct fetches of voterguide.sos.ca.gov pages, most lao.ca.gov PDFs, riovistacity.com, cityofvacaville.gov and joincalifornia.com were refused with `URL_NOT_ON_ALLOWLIST`. I used 16 searches to surface official URLs. Where the cited URL could not be opened I checked the same official text in another official copy (for example the LAO analysis as printed in the SOS `vig.cdn.sos.ca.gov/.../prop<n>.pdf`) and say so.
- **Source retrieval** (a URL opened) and **substantive verification** (the fact matches the source) are reported separately in every section.

## 1. Statewide propositions

### Retrieval

| Opened | URLs |
|---|---|
| SOS title, summary and analysis PDFs | prop1-title-summ-analysis, prop3-title-summ-analysis, prop43-title-summ-analysis, prop44-title-summ-analysis, prop45-title-summ-analysis |
| SOS proposition PDFs | prop2.pdf, prop4.pdf, prop38.pdf, prop39.pdf, prop41.pdf, prop42.pdf, complete-vig.pdf (partial read) |
| SOS legal text PDFs | prop40-, prop42- (holds end of 41), prop44-, prop45-text-proposed-laws.pdf |
| LAO PDFs | prop1, prop4, prop5, prop37, prop40, prop42, prop43 (`https://lao.ca.gov/ballot/2026/prop<n>-110326.pdf`) |
| Refused or not reached | every voterguide.sos.ca.gov page (analysis.htm, arguments-rebuttals.htm), LAO prop2, 3, 38, 39, 41, 44, 45 PDFs, legal text for props 1 to 5, 37 to 39, 41 and 43 |

### Substantive results, plainEnglish / yes / no / fiscal (all 14)

| Prop | Result | Notes |
|---|---|---|
| 1 | Consistent | $11.25B total, $7.2B rental, $1.25B CalVet, 40,000 rentals and 40,000 buyers, $500M to $600M a year for about 25 years (LAO p.3, found) |
| 2 | Consistent | 10% to 20% of GF taxes, counted against the limit at withdrawal, 2030 to 2040, no LAO dollar estimate |
| 3 | Consistent, one wording issue | Threshold about $371,000, $5B to $15B, roughly 40% to schools and community colleges, top 2%. See EVD-09 |
| 4 | Mostly consistent | "No program created", charter city exemption, FPPC wording, a few hundred thousand dollars a year, "Triples maximum fine" all found. "1988" not in SOS or LAO. See EVD-10 |
| 5 | Consistent | LAO confirms the Lt. Governor serves until a future statewide election (no special election), 135 candidates, 11 recalls (9 legislators), under 0.1% GF |
| 37 | Consistent | $25B cap, 17%, 3% down, "no more than double the typical income", qualified builder option, no direct cost. NO sentence "CalHFA's existing down payment programs continue" is not stated by LAO (low, an inference) |
| 38 | Consistent | $8.4B, half to one institute picked by CDPH, $4.2B minimum, $500M to $600M a year for about 20 years, 10% of revenue to state |
| 39 | Consistent | ID in person, last four digits on mail envelope, free ID, "best efforts", yearly reporting, tens to low hundreds of millions |
| 40 | Consistent | Legal text section 50301 says "$1,000,000,000 or more", phase-in by 0.1 point per $2M below $1.1B, five installments, 7.5% deferral charge; art. XIII sec. 37(d) admin costs first then 90/10. LAO tens of billions, under $1B a year income tax loss |
| 41 | One date issue | See EVD-08 |
| 42 | Consistent | Legal text confirms ownership or control of personal property, past conduct and past residency, 365-day exception only under a declared disaster or fiscal emergency, Jan 1 2026, other measure void in its entirety |
| 43 | Partly checked | Jan 1 2027, voter-proposed special taxes including extended ones, LAO revenue wording all found. The property tax initiative clause is not in the LAO or SOS summary text I could read; legal text not reached |
| 44 | Consistent, one labeling issue | Legal text confirms FQHCs and look-alikes, tribal exclusion, penalty "held in escrow for a period of five years", Form 990 line 4e starting point with AG guidance. LAO about 80%, low tens of millions in fees. See EVD-11 |
| 45 | Consistent | Legal text section 21027: 30 days, 270 days including appeals, court may add up to 90 days, further extension only with written consent of plaintiff, agency and applicant; partial remedy. LAO nine categories, high tens of millions possibly over $100M |

### Corrections log spot check (20 of 93 entries in audit/2026-10-22/statewide-changes.json)

All 93 `new` values are present in propositions.html and statewide.json (script check, prefix match).

| Log index | Prop/field | Does the corrected text match the source? |
|---|---|---|
| 0 | P1 no | Cannot judge. Official NO statement page not reachable |
| 5, 6 | P1 r.lr, r.nb | Yes. LAO $500M to $600M for about 25 years; $12.5B to $15B arithmetic correct |
| 7 | P4 yesE | Partly. "Broad support" and "spending limits" are in LAO. "Cannot favor candidates by party or incumbency" appears in the supporters' argument (prop4.pdf) and was not found in LAO, though the log says LAO |
| 8 | P4 acct | Yes, LAO "is not required to administer or enforce" |
| 11 | P5 does | Yes, LAO "It is not a special election" |
| 12 | P5 noE | Yes, LAO 135 candidates. But see EVD-04 on the leftover evidence row |
| 13 | P5 money | Yes |
| 16 | P5 r.ev | Yes, "11 state recall efforts ... (nine legislators and two Governors)" |
| 18 | P37 money | Yes, 3% and 17% in LAO; $24,000 and $136,000 arithmetic correct and labeled |
| 39 | P40 does | Yes, legal text section 50301 and art. XIII sec. 37(d) |
| 40 | P40 who | Yes, LAO "a few hundred people" |
| 47 | P41 does | Partly. Pre-election audit for voter-proposed taxes and conflict clause confirmed; date wording not confirmed (EVD-08) |
| 48 | P41 acct | Yes, LAO "reduce ... annual costs by 10 percent" for the pre-election audit |
| 54 | P42 does | Yes. Official legal text now confirms what the log says came from an independent copy |
| 56 | P42 argAgainst | Yes, "billionaire-funded initiative designed specifically to undo the California Billionaire Tax, Prop. 40" |
| 57 | P42 pro | Partly. Argument signers are California Small Business Association, AMVETS Department of California, California Senior Alliance. Firefighters, Building Trades and PORAC were not seen in the material read |
| 66 | P2 does | Yes |
| 71, 72, 73 | P3 does, yesE, money | Yes |
| 80 | P44 out | Yes, legal text escrow for five years |
| 81, 82 | P44 risk, r.ac | Yes on wording, but the rating was not updated (EVD-06) |
| 85 | P45 does | Yes, legal text section 21027 |

Result. 15 of 20 accurate, 4 partly accurate, 1 cannot judge, 0 wrong.

## 2. Evidence ledger

data/evidence.json holds 982 claim-level rows (952 `supported`, 30 `attribution`); 415 of the `supported` rows have `interpretive: true`. All 982 are `needs-review`.

### Sample (45 rows, `random.seed(20261023); random.sample(sorted claim rows by id, 45)`)

```
evc-ca-solano-rio-vista.measure-o-threshold evc-ca-sonoma-ccd-sonoma-county-junior-college-district.measure-ab-threshold evc-prop44-no-1 evc-ca-san-mateo.measure-l-threshold evc-prop39-acct-1 evc-prop1-title-1 evc-ca-sf-city.e-measureType evc-prop39-type-1 evc-prop2-argAgainst-1 evc-ca-alameda-berkeley.measure-u-ballotQuestion evc-prop3-acct-2 evc-ca-contra-costa-sd-acalanes-union-high-school-district.measure-w-measureType evc-prop5-r-nb-1 evc-prop2-tw-2 evc-prop44-r-oc-2 evc-ca-san-mateo.measure-u-plainEnglish evc-prop1-argAgainst-1 evc-prop1-r-nb-1 evc-ca-sonoma-spd-schell-vista-fire-protection-district.measure-n-ballotQuestion evc-prop4-does-2 evc-ca-solano-vacaville.measure-v-threshold evc-prop39-yes-1 evc-roster-ca.insurance-commissioner evc-prop1-tw-1 evc-ca-alameda-hayward.measure-cc-measureType evc-prop39-r-oc-1 evc-prop2-yes-2 evc-ca-alameda-albany.measure-t-threshold evc-ca-marin-spd-sleepy-hollow-fire-protection-district.measure-dd-ballotQuestion evc-prop37-argAgainst-2 evc-prop5-noE-2 evc-prop5-who-2 evc-prop4-noE-1 evc-prop45-con-1 evc-prop2-does-1 evc-ca-marin-spd-stinson-beach-county-water-district.measure-ee-measureType evc-ca-sonoma-sd-windsor-unified-school-district.measure-j-threshold evc-prop43-con-2 evc-rtm-plainEnglish evc-ca-contra-costa-clayton.measure-n-plainEnglish evc-ca-sonoma-sd-west-sonoma-county-union-high-school-district.measure-g-ballotQuestion evc-ca-santa-clara-sd-los-gatos-saratoga-union-high-school-district.measure-n-plainEnglish evc-prop39-unk-2 evc-prop3-acct-3 evc-ca-sonoma-ccd-sonoma-county-junior-college-district.measure-ab-ballotQuestion
```

### Does the excerpt support the claim (judged on the row's own excerpt)

| Judgment | Count | Rows (sample index order) |
|---|---|---|
| Supports | 26 (58%) | rio-vista O thr, AB thr, prop44-no-1, SMC L thr, prop1-title-1, prop39-type-1, Berkeley U bq, Acalanes W type, SMC U plain, Schell Vista N bq, Vacaville V thr, prop39-yes-1, roster insurance commissioner, prop1-tw-1, Hayward CC type, prop2-yes-2, Albany T thr, Sleepy Hollow DD bq, prop37-argAgainst-2, prop4-noE-1, Stinson EE type, Windsor J thr, RTM plain, Clayton N plain, West Sonoma G bq, AB bq |
| Partly | 18 (40%) | prop39-acct-1, SF E type, prop2-argAgainst-1, prop3-acct-2, prop5-r-nb-1, prop2-tw-2, prop44-r-oc-2, prop1-argAgainst-1, prop1-r-nb-1, prop4-does-2, prop39-r-oc-1, prop5-who-2, prop45-con-1, prop2-does-1, prop43-con-2, LGSUHSD N plain, prop39-unk-2, prop3-acct-3 |
| Does not support | 1 (2%) | prop5-noE-2 |
| Cannot judge | 0 | |

Most "partly" rows are one of several rows that together cover a multi-part claim (for example prop4-does-1..3, prop2-argAgainst-1..3). Read as a group, 14 of the 18 are covered; the remaining 4 (prop5-r-nb-1, prop2-tw-2, prop44-r-oc-2, prop39-r-oc-1) carry judgment that no excerpt states.

### Does the excerpt appear in the source (16 rows re-fetched)

| Where checked | Rows | Result |
|---|---|---|
| At the cited URL | prop1-r-nb-1, prop1-tw-1 (LAO prop1), prop4-does-2, prop4-noE-1 (LAO prop4), prop5-who-2 (LAO prop5), prop44-r-oc-2 (prop44 legal text), Hayward CC type (hayward-ca.gov ballot measures), roster insurance commissioner (cert list), Sleepy Hollow DD bq (marincounty.gov), RTM plain (acvote PDF) | 10 of 10 found. prop5-who-2 only the first sentence could be checked |
| In another official copy of the same text | prop2-argAgainst-1, prop2-tw-2, prop2-does-1 (LAO text inside SOS prop2.pdf), prop39-type-1, prop39-unk-2 (SOS prop39.pdf), prop5-r-nb-1 (LAO prop5, cited the SOS copy) | 6 of 6 found |
| Not found in the alternate copy | prop39-yes-1, prop2-yes-2 (LAO YES/NO statements) | Inconclusive. The SOS PDFs read do not include the YES/NO quick reference; the cited LAO pages could not be opened |

Retrieval rate for sampled source URLs. 10 of 45 cited URLs opened directly; the rest were refused or not surfaced by search.

## 3. Local measures (data/2026-11-03/local-measures.json, 143 records)

Script checks on all records.
- 75 records set `threshold`; every one has a claim-level evidence row with a non-empty excerpt from a source marked `primary`. 0 thresholds without an official excerpt.
- 142 records are `incomplete`; every one has a `gaps` list. Gaps are specific where research happened (for example "Ballot question says $28 average levy; impartial analysis says $27.55"), but three gap strings appear on nearly every record ("Summary of the official arguments" on 143, "Fiscal effect" on 140, "What a YES vote and a NO vote would do" on 137).

Sample. Seeded draw of 22 records with ballotQuestion or threshold (seed 20261023): Marin San Anselmo V, San Rafael W, Walnut Creek T, Harmony Union M, Marin P, Mill Valley T, Napa B, Albany Q, SMC J, Berkeley W, SMC AA, Walnut Creek U, Inverness PUD AA, Upper Bay PRD FF, Hercules P, CSA 27 Y, Clayton N, Reed Union O, Cupertino L, Acalanes W, Old Adobe O, Palo Alto J. Because most cited URLs were refused, I added fetchable records to reach 18 checked.

| Record | Retrieved | Matches |
|---|---|---|
| Marin P | marincounty.gov measure-p page | Ballot question and "simple majority" match |
| Marin DD (Sleepy Hollow FPD) | county page | Question, $105,000, "2/3 voter approval" match |
| Sonoma JC District AB | Marin copy (measure-ab-110326) | $830M, $25 per $100,000, $55.3M, "55% voter approval" match |
| Reed Union O | county page | $115M, $30, $6.2M, 55% match |
| Miller Creek N | county page | $67M, $28 average, $3.8M, 55% match |
| Hayward CC | hayward-ca.gov | General tax, "simple majority (50% + one vote)" match |
| RTM | acvote PDF | Question matches, "Majority Vote Required" matches |
| SMC J | LWV copy of question (not an official source) | Question matches; threshold not stated there |
| Berkeley U, V, W, X, Y, Z, AA | Berkeley Nov 2026 Impartial Analyses PDF | All seven thresholds match (U two-thirds; Y, Z, AA initiative special taxes "requires a majority vote") |
| Cupertino L | cupertino.gov | "Measure L requires majority (50 + 1) voter approval" found |
| Albany T | acvote submittal form | Question matches; "66.6667% 2/3" marked |
| Palo Alto J | City Attorney impartial analysis | 0.5%, about $15.6M, until repealed, general tax, simple majority match |

18 of 18 consistent. Not checked because the URL was refused or not surfaced. San Anselmo V, San Rafael W, Walnut Creek T and U, Harmony M, Mill Valley T, Napa B, Albany Q, SMC AA, Inverness AA, Upper Bay FF, Hercules P, CSA 27 Y, Clayton N, Old Adobe O, Acalanes W.

## 4. Candidates and contests

**Certified list** (opened `https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf`). 21 contests compared. Governor, Lt. Governor, SOS, Controller, Treasurer, AG, Insurance Commissioner, SPI, BOE 1 to 4, CD 10, 11, 12, 14, 15, 17, SD 10, AD 14, 16, 17, 18, 19, 20, 24. Names, party, designations and order all match. Incumbent flags match the list's asterisks (Weber, Cohen, Bonta, Lieber and the seven Assembly members). The list marks no U.S. Representative incumbent, and the data follows it.

**Local rosters** (6 contests sets checked).
- Oakland mayor, council D2, D4, D6, auditor. Match the City Clerk list, including designations. The same list includes OUSD board D2, D4, D6, which the data does not have (EVD-13).
- Hayward mayor, D1, D6. Match. The city page labels Syrop and Roche as incumbents; the data deliberately does not mark them, and its notes say so.
- Albany city council (2 seats). Match.
- Albany USD board. Problem (EVD-02).
- Berkeley auditor, D1, D4, D7. Names match. D8 and Rent Board wrong (EVD-01). BUSD issue (EVD-12).

## 5. Public page text

- index.html footer and guide.js status text (lines 185, 245 to 262, 392) accurately describe automated audit status and partial local coverage. guide.js line 392 lists Berkeley and Oakland as covered without saying OUSD and Berkeley Rent Board contests are missing; the general "not a full list" caveat is present.
- propositions.html prose outside PROPS. "93 statements were corrected" matches the log (93 entries). "The ratings themselves were not changed" is true, and that is the cause of EVD-06 and EVD-07.

## Findings

### EVD-01 Berkeley Council District 8 lists the six Rent Board candidates; the Rent Board contest is missing
- **Severity** blocker
- **Record** `2026-11-03.ca-alameda-berkeley-council-district-8.city-council` in data/2026-11-03/contests.json and the matching candidates
- **Reproduction** List the candidates for that contest. It has 10 names: Mark Humbert, Michael Wallman, Fred M. Feller, Mari Mendonca, Vylma Ortiz, Avery Arbaugh, Derek Rodriguez, Carole Marasovic, Ida Martinac, Nathan Mizell. No contest id contains "rent".
- **Evidence** The cited notice `https://berkeleyca.gov/sites/default/files/Notice%20of%20Candidates%20Nov%203%202026%20-%20WEB%20Version.pdf` (reader output) lists D8 as Humbert "City Councilmember", Wallman "Systems Engineer", Feller "Attorney", Mendonca "Rent Stabilization Board Commissioner", followed by Ortiz "Attorney/Meditation Teacher", Arbaugh "Tenant Union Organizer", Rodriguez "Student/National Guardsman", Marasovic "Attorney/City Commissioner", Martinac and Mizell "Rent Stabilization Board Commissioner". `https://berkeleyca.gov/your-government/elections/candidate-information` lists "Rent Board Commissioners" among the offices on the Nov 3, 2026 ballot. The reader said the notice layout is scrambled, so a person must confirm the split from the PDF.
- **Expected** D8 has 4 candidates; a citywide Rent Stabilization Board contest with its own seat count holds the other 6.
- **Fix** Re-read the notice by hand, split the contest, add the Rent Board contest and seat count, and check the other Berkeley contests for the same layout issue.
- **Blocks release** Yes. D8 voters would see the wrong candidates.

### EVD-02 Albany USD board merged into one "vote for 4" contest
- **Severity** high
- **Record** `2026-11-03.ca-alameda-sd-albany-unified-school-district.board-of-education` (`seats: 4`, 6 candidates)
- **Evidence** `https://www.albanyca.gov/Government/Election-Information/Candidates-for-General-Municipal-Election-2026` (reader) "Board of Education (3 seats, 4-year term; 1 seat, 2-year term)", listing Hopwood, Mahoney, Boyd, McKinney, Allen. Anne Hsu is on the notice of nominees per the record's own note, not on this page.
- **Expected** Two contests (vote for 3 full-term; vote for 1 two-year term) with each candidate in the right one.
- **Fix** Split the contest using the notice of nominees and county sample ballot; record which race Anne Hsu filed for.
- **Blocks release** Yes. Tells voters the wrong number to vote for.

### EVD-03 Ledger rows marked `supported` that contain judgment (415 `interpretive: true`, plus mislabeled rows)
- **Severity** medium
- **Records** for example `evc-prop5-r-nb-1` ("Trades plurality winners for less voter choice of successor"; excerpt is the 11 recalls count), `evc-prop2-tw-2` (excerpt supports only the cushion half), `evc-prop39-r-oc-1` (see below)
- **Evidence** 415 of 952 `supported` rows are `interpretive: true`. `evc-prop39-r-oc-1` is `interpretive: false` and claims a "Clear ID rule", while the LAO analysis in `https://vig.cdn.sos.ca.gov/2026/general/pdf/prop39.pdf` (reader) says the Legislature must clarify which forms of identification could be used.
- **Expected** A judgment claim gets a separate verdict (for example `interpretive` or `judgment`) and does not count toward a support rate; `interpretive` is true whenever the claim adds an evaluation.
- **Fix** Add the verdict value, re-label, and reword the Prop 39 outcome-clarity rationale or cite the reporting rule only.
- **Blocks release** No

### EVD-04 Stale evidence rows left after the Oct 22 corrections
- **Severity** medium
- **Records** `evc-prop5-noE-2`, `evc-prop5-succession`
- **Evidence** `evc-prop5-noE-2` supports "In 2003 there were 135 replacement candidates ..." with the excerpt "Republican 48.6% Win." from joincalifornia.com; the 48.6% figure was removed by correction 12. `evc-prop5-succession` still asserts "A recall in the first two years ... triggers a special election for governor", verdict `supported`. Correction 11 removed that wording, and LAO prop5 (reader) says "It is not a special election."
- **Expected** Rows describe the current text, and superseded claims are removed or marked superseded.
- **Fix** Delete or retire both rows; scan for other rows whose claim no longer appears in statewide.json (my prefix scan found 7 candidates, most are only reworded).
- **Blocks release** No

### EVD-05 Per-row `supported` verdict when the excerpt covers only part of the claim
- **Severity** medium
- **Records** 18 of 45 sampled rows, for example `evc-prop1-r-nb-1`, `evc-prop4-does-2`, `evc-ca-santa-clara-sd-los-gatos-saratoga-union-high-school-district.measure-n-plainEnglish` ("expected through fiscal year 2056-57" is not in the excerpt)
- **Evidence** Section 2 table
- **Expected** The verdict shows partial coverage, or the claim is split so each row's excerpt covers its claim.
- **Fix** Add `partial`, or group rows and report the group verdict.
- **Blocks release** No

### EVD-06 Prop 44 accountability rating not updated after correction
- **Severity** medium
- **Record** propositions.html PROPS prop 44 `s.ac: 5`
- **Evidence** Correction 82 changed the rationale to "Required reporting and penalties, with audits, patient lawsuits and criminal charges authorized" because "Audits and suits are allowed, not required." The rubric for 5 is "Independent audits, public reporting and penalties all required"; 4 is "independent audits plus public reporting".
- **Expected** The score agrees with its own rationale under the rubric.
- **Fix** Re-rate (3 or 4 by the rubric) and note it in the log; the page text "The ratings themselves were not changed" then needs updating.
- **Blocks release** No

### EVD-07 Evidence-strength scores left at 3 after rationales were cut back (Props 37, 38)
- **Severity** low
- **Records** PROPS prop 37 `s.ev: 3` and prop 38 `s.ev: 3`
- **Evidence** New rationales say "No track record for this design was found" (37) and "No direct evidence ... was found in the official materials" (38). Rubric 3 is "Mixed or indirect evidence, such as similar policies elsewhere." The earlier indirect evidence (PPIC modeling, past state research funding) was removed as unsourced.
- **Fix** Re-rate or mark `u.ev` limited.
- **Blocks release** No

### EVD-08 Prop 41 date wording not supported by the official summary
- **Severity** low
- **Record** `2026-11-03.ca.prop-41` plainEnglish "New state taxes enacted or taking effect on or after January 1, 2026 ..."
- **Evidence** `https://vig.cdn.sos.ca.gov/2026/general/pdf/prop41.pdf` (reader) AG summary "Prohibits any new state taxes that exclude their revenues from the state spending limit approved by voters in 1979." and "... special taxes enacted after January 1, 2026." The Quick Reference in complete-vig.pdf "Nullifies state taxes enacted after January 1, 2026 ...". "Enacted or take effect on or after January 1, 2026" is the AG wording for Prop 42 (prop42.pdf).
- **Fix** Check the Prop 41 legal text; if it does not say "or taking effect on or after", use the SOS wording.
- **Blocks release** No

### EVD-09 Prop 3 says the rates end in 2030 in one field and 2031 in others
- **Severity** low
- **Record** `2026-11-03.ca.prop-3` plainEnglish "Removes the 2030 end date", yes and no "expiring in 2031"
- **Evidence** SOS prop3-title-summ-analysis has both: summary "currently set to expire in 2031"; LAO "until 2030" / "Now Through 2030" (tax years through 2030).
- **Fix** Use one phrasing, for example "after the 2030 tax year".
- **Blocks release** No

### EVD-10 Prop 4 facts sourced outside the ledger or misattributed
- **Severity** low
- **Record** `2026-11-03.ca.prop-4` plainEnglish ("the 1988 ban") and yes ("Programs cannot favor candidates by party or incumbency"); correction 7
- **Evidence** Neither LAO prop4 nor SOS prop4.pdf gives a year. `evc-prop4-does-*` explanations say 1988 "comes from the Assembly Elections Committee analysis", but no ledger row cites that source. The party/incumbency rule appears in the supporters' argument in prop4.pdf; LAO does not mention it, although correction 7 credits LAO.
- **Fix** Add a row for the Assembly analysis or the legal text; correct the log reason.
- **Blocks release** No

### EVD-11 Prop 44 fiscal field shows an unlabeled example
- **Severity** low
- **Record** `2026-11-03.ca.prop-44` fiscal "A $50 million clinic at 80% would owe $5 million that year."
- **Evidence** Arithmetic is right under the legal text, but it is not from LAO and is not labeled, unlike the Prop 37 example ("this tool's example").
- **Fix** Add the same label.
- **Blocks release** No

### EVD-12 Berkeley USD board. Source shows "Incumbent" designations; data records none and no seat count
- **Severity** low
- **Record** `2026-11-03.ca-alameda-sd-berkeley-unified-school-district.school-board-director`
- **Evidence** Berkeley notice (reader) "Jennifer Shanoski: Incumbent", "Ka'Dijah Brown: Incumbent". Data `incumbent: false`, designation null, `seats: null`. The guide marks Lieber as incumbent on the same kind of evidence.
- **Fix** Record designations from the notice once the layout is read by a person (EVD-01) and add the seat count.
- **Blocks release** No

### EVD-13 Oakland school board contests missing although Oakland is listed as covered
- **Severity** low
- **Record** contests.json; guide.js line 392
- **Evidence** Oakland City Clerk list (reader) has School Board Director D2 (Fleisher, Brouhard), D4 (Hutchinson "Incumbent", Camp, Pfeiffer Williams), D6 (Williams, Powell, Bachelor). None are in the data.
- **Fix** Add them, or name the gap in the Oakland coverage text.
- **Blocks release** No

## Summary

| Area | Retrieval | Substantive |
|---|---|---|
| Statewide fields | 14 of 14 props had at least one official source opened | 9 consistent (1, 2, 5, 37, 38, 39, 40, 42, 45); 4 with low issues (3, 4, 41, 44); 43 partly checked (property tax clause not checkable) |
| Corrections | 20 of 93 checked | 15 accurate, 4 partly, 1 cannot judge |
| Ledger rows | 10 of 45 cited URLs opened; 16 excerpts checked for presence | 26 supports, 18 partly, 1 does not. Excerpt found 16 of 16 checkable |
| Local measures | 18 records checked against an official or county copy | 18 of 18 consistent; 0 thresholds without excerpt; 0 incomplete without gaps |
| Contests | Cert list opened; 6 local roster sources opened | 21 of 21 state contests match; 2 local contest structure errors |

| Severity | Count | IDs |
|---|---|---|
| Blocker | 1 | EVD-01 |
| High | 1 | EVD-02 |
| Medium | 4 | EVD-03, EVD-04, EVD-05, EVD-06 |
| Low | 7 | EVD-07 to EVD-13 |

## Not checked, and why

- Official voter guide web pages (YES/NO statements, arguments, candidate statement pages), refused by the fetch allowlist. statementUrl links were not tested for that reason.
- Legal text for Props 1 to 5, 37 to 39, 41, 43. Not surfaced by search, so the Prop 43 property tax clause, Prop 41 date and Prop 4 party/incumbency rule are unconfirmed.
- Hoover ($40B) and CalMatters (Sonoma 62%) figures, not fetched.
- 16 of the 22 sampled local measures, URLs refused or not surfaced.
- Sonoma sources in the data use `...local-measures-that-have-been-filed`; the live county page found by search is `...local-measures-that-were-filed`. The old URL was not tested.
- The congressional statement links to the SF voter guide PDF (for example Mullin, CD 15) were not checked.
