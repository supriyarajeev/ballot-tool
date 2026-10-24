# Fix D summary (evidence and records), Oct 23, 2026

Fix Agent D could not create this file (the tool refused the write), so the integration lead saved its final report here. The text below is condensed from that report. Nothing was committed by Fix D, and nothing is marked Verified.

## Results at a glance

| Task | Result |
|---|---|
| 1 Alameda scanned measures | 27 records updated: 26 ballot questions, 25 thresholds, 11 new measure types, 69 new evidence rows. All 27 source-access entries are now "accessed" (OCR plus visual check of critical passages) |
| 2 EVD-01 Berkeley | Resolved from the City Clerk's final candidate roster. District 8 now has 4 candidates. A new Rent Stabilization Board contest has 6 candidates and 5 seats |
| 3 EVD-02 Albany USD | Not split: the official notice prints one contest, "Vote for four (4) seats". Anne Hsu removed: she is the City Clerk, not a candidate |
| 4 EVD-12 Berkeley USD | 3 seats, ballot designations and 2 incumbents recorded from the official roster |
| 5 EVD-13 OUSD | Not added. No official source that Fix D could read ties each candidate to a district |
| 6 EVD-03 and EVD-05 | 260 rows changed to partly-supported (259 by script, 1 by hand), including all 18 rows the auditor sampled. The Prop 39 row was relabeled |
| 7 EVD-04 | `evc-prop5-noE-2` removed. `evc-prop5-succession` rewritten to the current wording |
| 8 EVD-08 to EVD-11 | 3 text changes plus keep-decisions in `statewide_corrections_2.py` (not applied by Fix D). 5 new evidence rows. Review gaps updated |
| 9 EVD-06 and EVD-07 | Ratings unchanged; notes for the owner below |
| 10 FE-09 | 78 gap lists cleaned. No measure has duplicate ballot-question or threshold gaps |

## 1. Alameda scanned measures

**Ballot questions.** Set on 26 records, all except Sunol Glen K.

**Thresholds.** Set on 25 records. The exception is Emeryville BB, which has no submittal form. Every threshold already in the data matched the form.

**Measure types.** Set where the record had none:
- "Parcel tax": I, J
- "Bond measure": K
- "Charter amendment": M, N, EE
- "Regular measure (per the county submittal form)": DD, FF, GG, HH, II

Where a city document already gave a more specific type, it was kept and the form's box was noted.

**New evidence rows.** Named `evc-<record>-ballotQuestion-registrar`, `-threshold-registrar` and `-measureType-registrar`.
- Location: "Ballot Measure Submittal Form, page 1". For BB it is "City Council Resolution No. 26-65, page 4 of the file".
- `readingsMatched` is true where the city text is identical (Albany O, P, Q, R, T; Berkeley V, W, Y; Hayward CC) and null otherwise.
- Limitations name the OCR method and the corrections.

**Status.** All 27 stay Incomplete, because the summary, YES/NO and fiscal fields are still missing.

**Where the registrar form and the city text differ**, the registrar version is published, and the old city-sourced claim rows are marked `superseded`:
- **Albany S:** apostrophe only.
- **Berkeley U:** the form adds a "Financial Implications" sentence.
- **Berkeley X:** the form wording differs from one of the two July 7 versions, which settles that gap.
- **Berkeley Z:** "non-residential" on the form, "nonresidential" in the city text.

**Measure K.** Threshold and type recorded, no ballot question (handwritten edits on the form).

**Side fixes.**
- Albany T's shortTitle held the question text; it is now "Street Trees & Streetlighting Parcel Tax Measure".
- An aggregator source on Alameda L that was typed "Official" is now "Independent".

## 2. EVD-01 Berkeley District 8 and Rent Board (resolved)

**Source.** Berkeley City Clerk, "FINAL Notice of Candidate Activity - November 3, 2026 General Municipal Election", "Updated: 10/20/2026" (berkeleyca.gov `.../2026-05/01%20Candidate%20Information%20and%20Roster%20Nov%202026.pdf`).

**Quotes from the roster:**
- "Offices to be Elected: Auditor; City Council Districts 1, 4, 7, 8; Rent Board (5 seats); School Board (3 seats)". Read twice.
- Feller, Charles Mark Humbert (I), Mendonca and Wallman each appear as "City Council, District 8".
- Ortiz, Arbaugh, Derek A. Rodriguez, Carole A. Marasovic, Ida Martinac (I) and Nathan H. Mizell (I) each appear as "Rent Board Commissioner".
- Legend: "Incumbent candidates are noted with (I) after their name"; "DNQ = Did Not Qualify". Vanessa Marrero, marked DNQ, was not added.

**Designations.** Taken from the Aug 19 notice of nominees. Each name is directly followed by its designation, and three readings agreed.

**Changes.**
- **District 8:** 4 candidates.
- **New contest** `2026-11-03.ca-alameda-berkeley.rent-stabilization-board-commissioner`, 5 seats, 6 candidates in notice order.
- Jenny Wong (Auditor) and Igor A. Tregub (District 4) are also marked (I), so they are now incumbents.

## 3. EVD-02 Albany USD

The notice prints "MEMBER, BOARD OF EDUCATION – 3 seats 4-year term; 1 seat 2-year term" and "Vote for four (4) seats", read twice. It shows no separate 2-year race, so the contest was not split, and both lines are quoted in the notes.

Anne Hsu signs the notice as City Clerk and is not on the city's candidate page, so her record was removed (evidence row `evc-albany-city-clerk-anne-hsu`).

## 4. EVD-12 Berkeley USD

Per the roster:
- 3 seats.
- Designations: Park, "Education Consultant"; Shanoski and Brown, "Incumbent".
- Shanoski and Brown are marked as incumbents from the roster's (I).

## 5. EVD-13 OUSD

Not added.
- The extracted text of the Oakland clerk's list separates the headings from the name groups.
- The county candidate app needs interaction.
- The Oakland council, mayor and auditor contests rest on the same order inference and need a visual check.

## 6. EVD-03 and EVD-05

`audit/2026-10-23/recheck_verdicts.py` (dry run by default; `--apply` writes) flags a "supported" row as partly supported in four cases:
- the claim has numbers missing from the excerpt;
- the claim has capitalized names missing from the excerpt;
- the claim is long, with at least 12 words and more than 2.5 times the excerpt's length;
- the auditor listed the row.

259 rows changed, and each one's limitations record the reason. A 30-row spot check found one false-positive pattern, the measure's own city name, which is now excluded.

Prop 39 row `evc-prop39-r-oc-1` is now interpretive and partly-supported. It quotes LAO p. 50: "The Legislature would need to clarify several details that are not defined in the proposition, like which forms of identification could be used".

## 7. EVD-04

`evc-prop5-noE-2` (48.6%) was removed. `evc-prop5-succession` was rewritten to the current LAO-based wording, as partly-supported. `evc-prop44-ratio` was moved to the YES field, where the 80% average now appears.

## 8. Statewide corrections proposed (`statewide_corrections_2.py`)

- **EVD-08, Prop 41: keep the text.** The official legal text, Art. XXIV §3(a) and (b), says "enacted or takes effect on or after January 1, 2026", read twice. The official summary says "enacted after January 1, 2026".
- **EVD-09, Prop 3: change "does".** The rates apply through 2030 and are set to expire in 2031. LAO p. 26 says "extend these higher rates until 2030"; the AG summary and LAO p. 27 say "expire in 2031".
- **EVD-10, Prop 4: keep the text and fix the log reason.**
  - "1988" comes from the Assembly Elections Committee analysis of SB 42 (June 25, 2025 version).
  - The party and incumbency rule is in the legal text, Gov. Code §85300(g), not in LAO.
- **EVD-11, Prop 44:** label the $5 million example as this tool's example.
- **Prop 39 rating reason (r.oc):** "Required yearly reporting of citizenship-verified shares. Which IDs count is left for the Legislature to define."

## 9. Ratings for the owner (not changed)

**Rubric.**
- Accountability:
  - 5 = "Independent audits, public reporting and penalties all required"
  - 4 = "independent audits plus public reporting"
  - 3 = "Required public reporting or a built-in enforcement remedy, but no independent audit"
- Evidence strength: 3 = "Mixed or indirect evidence".
- Outcome clarity: 4 = "a clear observable rule or required reporting on results".

**Prop 44 accountability (rated 5).** The text supports:
- required public posting, §12586.3(b)(4);
- penalties, §12586.3(d);
- a patient right to sue, Corp. Code §5142.1(a).

No required independent audit was found. Under the rubric this reads as 3.

**Props 37 and 38 evidence strength (rated 3).** The rationales now say no direct evidence was found. The options are to re-rate them 2, or keep 3 and flag the factor as limited.

**Prop 39 outcome clarity (rated 4).** It can still rest on required reporting.

## 10. FE-09

Exact duplicates and short aliases were merged into the standard gaps. Standard gaps were dropped where the field now has a value. 78 lists changed.

## Unresolved

1. The three OUSD district contests.
2. How Albany USD assigns the 2-year term.
3. Sunol Glen K's final wording.
4. Emeryville BB's threshold and type.
5. Berkeley District 1 designations.
6. Prop 3 claim text once the correction is applied.
7. Prop 4's "1988" rests on a 2025 committee analysis.
8. The rating decisions.
9. The Oakland coverage text should name the OUSD gap.
10. The OCR text of Berkeley Z and Hayward CC compared with the city text.

## Validator output at the end of Fix D's run

17 errors and 1 warning, none in Fix D's files:
- 3 candidate-order fixture changes (deliberate roster corrections);
- 14 errors from the generic gap that `tools/extract-statewide.mjs` adds;
- 1 warning: the Alameda coverage note understates ballot-question counts.
