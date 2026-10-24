# Stage 1 audit, Props 37 to 41 (November 3, 2026 General Election)

Auditor scope. Statewide Propositions 37, 38, 39, 40 and 41. Site records checked are `propositions.html` PROPS entries (lines 564 to 668) and the matching items in `data/2026-11-03/statewide.json` (`2026-11-03.ca.prop-37` to `prop-41`). Read only. No repository file other than this report was touched.

Method notes
- `statewide.json` mirrors PROPS exactly for all five props (name, title, type, does, yes plus yesE, no plus noE, money, who, out, unk, argFor, argAgainst, pro, con, source URLs). A scripted field by field comparison found zero differences. Every correction below therefore applies to both files (edit PROPS, then regenerate JSON with `tools/extract-statewide.mjs`).
- Direct downloads (curl) were refused by the session proxy (HTTP 403 on CONNECT). All official text was read through WebFetch, which returns short quoted excerpts. Quotes below are the excerpts it returned. Where a passage was not returned, this report says so and does not guess.
- Official pages used, all on voterguide.sos.ca.gov/propositions/N/ with the subpages `index.htm`, `title-summary.htm`, `analysis.htm` (LAO analysis as reproduced in the guide) and `arguments-rebuttals.htm`, plus the legal text PDFs `vig.cdn.sos.ca.gov/2026/general/pdf/propN-text-proposed-laws.pdf` (Text of Proposed Laws, printed pages 119 to 150).
- Independent sources the site cites (CalMatters, Hoover, LAist, Wikipedia, GrowSF, NBER) were not audited, per the brief.

## Summary table

| # | Prop | Field(s) | Finding | Type | Proposed action | Confidence |
|---|---|---|---|---|---|---|
| 1 | 37 | `acct` | Audit and rulemaking exemption are requirements in the legal text, site attributes them to the supporters' argument and Hoover | Misattribution, could mislead | Replace text (below) | High |
| 2 | 37 | `r.ac` | Rationale calls the audits a supporters' claim and the rulemaking exemption "reported", legal text requires both | Rationale conflict (owner) | Owner review, no rating proposal | High |
| 3 | 37 | `does` | Omits the official home price cap and one-year residency rule | Omission, could mislead | Add sentence (optional) | Medium |
| 4 | 37 | `pro` | Official listing also names United Nurses Associations of California | Omission | Optional addition | Low |
| 5 | 37 | `r.ev` | No conflict. Official materials contain no track record for this design | None | No change | High |
| 6 | 38 | `money` | "10% of any revenue from resulting treatments" drops that it goes to the General Fund only until bond costs are repaid, and omits LAO's possible offset | Imprecise, could mislead | Replace text (below) | Medium |
| 7 | 38 | `src` | No legal text link, official PDF exists and resolves | Missing official source | Add link | High |
| 8 | 38 | `r.ev` | Not contradicted. LAO does name prior state research bonds (Props 71 and 14) but gives no outcome evidence | Observation for owner, not a conflict | No change | Medium |
| 9 | 38 | LAO link | `lao.ca.gov/ballot/2026/prop38-110326.pdf` could not be fetched (tool allowlist refusal) | Unreachable from this session | Recheck manually | n/a |
| 10 | 39 | `pro` | Official guide lists Howard Jarvis Taxpayers Association as a supporter, site credits LAist for it. Official rebuttal signers omitted | Weaker source than available | Replace text (below) | Medium |
| 11 | 39 | LAO link | `lao.ca.gov/ballot/2026/prop39-110326.pdf` could not be fetched (tool allowlist refusal) | Unreachable from this session | Recheck manually | n/a |
| 12 | 40 | `pro` | Official guide lists Sen. Bernie Sanders as a supporter, site credits Wikipedia | Weaker source than available | Replace text (below) | High |
| 13 | 40 | `risk` | LAO's own Prop 40 analysis states the Prop 41/42 conflict, site cites only the 41 and 42 analyses | Attribution nuance | Optional wording | Low |
| 14 | 41 | `risk` | Rebate claim is not in the official LAO analysis or summary | Unsupported by official text | Replace text (below) | Medium |
| 15 | 41 | `src` | Legal text links to a GrowSF copy, official PDF exists and resolves | Non-official source where official exists | Replace link | High |
| 16 | 41 | `does` | Earlier flag EVD-08 ("enacted or taking effect on or after") is resolved in the site's favor by the legal text | Prior flag cleared | No change | High |
| 17 | 37 to 41 | titles, types, yes/no, LAO fiscal lines, argument signers not listed above | Match the official guide | None | No change | High |

Link check (official links the site gives)

| Prop | Link | Result |
|---|---|---|
| 37 | voterguide.sos.ca.gov/propositions/37/ | Resolves, Prop 37 page |
| 37 | lao.ca.gov/ballot/2026/prop37-110326.pdf | Resolves, Prop 37 LAO analysis, Nov 3 2026 |
| 37 | vig.cdn.sos.ca.gov/2026/general/pdf/prop37-text-proposed-laws.pdf | Resolves, Prop 37 text (pp. 119 to 122) |
| 38 | voterguide.sos.ca.gov/propositions/38/ | Resolves, Prop 38 page |
| 38 | lao.ca.gov/ballot/2026/prop38-110326.pdf | Unreachable from this session (WebFetch allowlist refusal). A web search lists this exact URL titled "prop38 110326", so it likely exists. Not verified |
| 38 | vig.cdn.sos.ca.gov/2026/general/pdf/prop38.pdf ("Official arguments") | Resolves, Prop 38 print pages with title, summary, LAO analysis, arguments and rebuttals |
| 39 | voterguide.sos.ca.gov/propositions/39/ | Resolves, Prop 39 page |
| 39 | lao.ca.gov/ballot/2026/prop39-110326.pdf | Unreachable from this session (WebFetch allowlist refusal). A web search lists this exact URL titled "prop39 110326". Not verified |
| 39 | vig.cdn.sos.ca.gov/2026/general/pdf/prop39-text-proposed-laws.pdf | Resolves, Prop 39 text (p. 133) |
| 39 | vig.cdn.sos.ca.gov/2026/general/pdf/prop39.pdf ("Official arguments") | Resolves, includes arguments and rebuttals |
| 40 | voterguide.sos.ca.gov/propositions/40/ | Resolves, Prop 40 page |
| 40 | lao.ca.gov/ballot/2026/prop40-110326.pdf | Resolves, Prop 40 LAO analysis |
| 40 | vig.cdn.sos.ca.gov/2026/general/pdf/prop40-text-proposed-laws.pdf | Resolves, Prop 40 text (pp. 134 to 147) |
| 40 | vig.cdn.sos.ca.gov/2026/general/pdf/prop40.pdf ("Official arguments") | Resolves, includes arguments and rebuttals |
| 41 | voterguide.sos.ca.gov/propositions/41/ | Resolves, Prop 41 page |
| 41 | lao.ca.gov/ballot/2026/prop41-110326.pdf | Resolves, Prop 41 analysis |
| 41 | vig.cdn.sos.ca.gov/2026/general/pdf/prop41-title-summ-analysis.pdf | Resolves, Prop 41 AG title and summary plus LAO analysis |
| 41 | (not linked by site) vig.cdn.sos.ca.gov/2026/general/pdf/prop41-text-proposed-laws.pdf | Resolves, Prop 41 text (pp. 147 to 150) |
| 38 | (not linked by site) vig.cdn.sos.ca.gov/2026/general/pdf/prop38-text-proposed-laws.pdf | Resolves, Prop 38 text (pp. 123 to 132) |

## Details

### Proposition 37

Official title (title-summary.htm). "CREATES LOAN PROGRAM FOR MIDDLE-INCOME BUYERS OF QUALIFIED NEW HOMES. INITIATIVE STATUTE." Site `title` "Creates loan program for middle-income buyers of qualified new homes", `type` "Initiative statute". Match.

Checked and matching. $25 billion revenue bonds, 17% maximum (legal text Sec. 51515.05(b) "finance no more than 17 percent of the purchase price"), 3% down (Sec. 51515.01(a)(1)(D) "pay no less than 3 percent of the purchase price"), 200% AMI (Sec. 51515.01(a)(1)(C) "does not exceed 200 percent of the area median income"), fixed rate set by CalHFA (Sec. 51515.05(c)), LAO "No direct state or local costs", qualified builder labor standards and different construction defect rules (LAO, legal text Sec. 51515.02 and 51515.04(e)). The $800,000 example arithmetic ($24,000 and $136,000) is correct and labeled as the tool's own. Argument signers. Site `pro` "California Conference of Carpenters, Fiona Ma (CalHFA board), California State Commanders Veterans Council (official argument)". Official (arguments-rebuttals.htm) "Danny Curtin, Director, California Conference of Carpenters", "Fiona Ma, Boardmember, California Housing Finance Agency (CalHFA)", "David West, Chair, California State Commanders Veterans Council". Match. "NO ARGUMENT AGAINST PROPOSITION 37 WAS SUBMITTED." Site says no argument against was filed. Match.

**37-1 `acct` misattributes measure requirements.** High confidence.
- Site. "Supporters' official argument says it requires annual audits of the loans and the fund. An independent analysis (Hoover Institution) says program rules are exempt from normal state rulemaking. No target for homes or loans."
- Official. Legal text Sec. 51515.05(g) requires an "independent annual audit of the program". Sec. 51515.05(a) says rules adopted under the part "shall not be subject to Chapter 3.5 (commencing with Section 11340)" (the Administrative Procedure Act rulemaking chapter), with board approval still required. Source https://vig.cdn.sos.ca.gov/2026/general/pdf/prop37-text-proposed-laws.pdf, pp. 119 to 122. The supporters' argument wording is "annual audits detailing the status of loans made" (https://voterguide.sos.ca.gov/propositions/37/arguments-rebuttals.htm). "and the fund" was not found in the returned argument text.
- Proposed replacement. "The measure requires an independent annual audit of the program to confirm bond money is used as the law requires. Program rules are exempt from the state's normal rulemaking process, though CalHFA's board must approve them. No target for homes or loans."

**37-2 `r.ac` rationale conflict (for owner).** High confidence. No rating change proposed.
- Site. "Supporters cite annual audits, but program rules are reported to skip normal rulemaking."
- Official. Both the annual audit and the rulemaking exemption are in the legal text (Sec. 51515.05(g) and (a), as quoted in 37-1). The rationale frames both as unverified claims.

**37-3 `does` omits the price cap and residency rule.** Medium confidence. Optional.
- Site. "Lets the state housing finance agency (CalHFA) sell up to $25 billion in revenue bonds to lend buyers earning up to 200% of area median income up to 17% of a new home's price. The buyer puts at least 3% down. ..."
- Official. AG summary "priced below about $1 million–$1.5 million, depending on county, adjusted annually" and "Borrowers must be California residents for one year, occupy the home" (https://voterguide.sos.ca.gov/propositions/37/title-summary.htm). Legal text Sec. 51515.01(b)(2) maximum price "shall not exceed 125 percent of the conforming loan limit for a one-unit property" in the county.
- Proposed addition after "...up to 17% of a new home's price." Insert "Homes must be priced below about $1 million to $1.5 million depending on county, and buyers must have lived in California for one year and live in the home."

**37-4 `pro` omits one official supporter.** Low confidence. Optional.
- Official index page (https://voterguide.sos.ca.gov/propositions/37/) lists supporters "United Nurses Associations of California, California Conference of Carpenters, and California State Treasurer Fiona Ma". Site lists the three argument signers correctly. Optional add "The official guide also lists United Nurses Associations of California."

**37-5 `r.ev` (flagged prop).** No rationale conflict. Rationale "No track record for this design was found in the official materials." The LAO analysis (https://voterguide.sos.ca.gov/propositions/37/analysis.htm) mentions that CalHFA "has a few programs that provide down payment assistance" but gives no outcome data, and its returned text "does not cite evidence from programs such as Dream For All". Consistent. No change.

### Proposition 38

Official title. "AUTHORIZES BONDS FOR IMMUNOLOGY MEDICAL RESEARCH. INITIATIVE STATUTE." Site matches, type "Initiative statute" matches.

Checked and matching. $8.4 billion general obligation bonds. Half to a single UC-affiliated institute selected by CDPH (LAO "California Department of Public Health (CDPH) would select the institute"). Grant council of "representatives from 7 UC campuses and 10 to 15 other universities and nonprofit research institutions". "at least $4.2 billion ... on cancer, heart disease, and Alzheimer's disease" (LAO; legal text Sec. 130354 gives "Not less than" $2.1 billion in each half). Repayment "$500 million to $600 million annually for about 20 years". Five-year agreement review (legal text Sec. 130353(c)(1) "The department shall review the agreement ... every five years"). Annual report with "progress toward project goals" (Sec. 130359(b)(2)). Independent financial audits (Sec. 130361). YES and NO meanings match. Argument signers. Site `pro` "The official argument is signed by leaders of Alzheimer's Los Angeles, the ALS Association and the Kidney Cancer Association". Official "Susan Disney Lord, Board Chair, Alzheimer's Los Angeles", "Eugene P. Brandon, Ph.D., Board of Trustees, ALS Association", "Dr. Brian Shuch, M.D., Board of Directors Member, Kidney Cancer Association". Match. Site `con` "Robert M. Kaplan (official argument)". Official argument against and rebuttal to argument in favor are both signed "Robert M Kaplan, Ph.D.". Match. Site `argAgainst` matches the argument's lines "borrowing is an inappropriate way to finance scientific research", "they generally do not flow back to the state treasury", "not by election campaigns". The rationale arithmetic ($10 billion to $12 billion over 20 years) is correct and labeled.

**38-1 `money` revenue share is imprecise.** Medium confidence.
- Site. "LAO estimates taxpayers repay $500 million to $600 million a year for about 20 years. The state gets 10% of any revenue from resulting treatments."
- Official. AG summary "General Fund receives 10% of licensing royalties until bonds are repaid." LAO "Ten percent of any revenue generated must be given to the state", first to the General Fund until bond costs are repaid, then to future research. LAO fiscal summary "The state could recover part or all of this cost in subsequent decades" "if the funded research leads to discoveries that generate revenue." Legal text Sec. 130358(a) "10 percent of all revenues derived by" recipients from licensing or commercializing funded intellectual property, to the General Fund until it covers "the total cost to the state of the bonds", then to the research fund. Sources https://voterguide.sos.ca.gov/propositions/38/title-summary.htm, /analysis.htm, and prop38-text-proposed-laws.pdf pp. 123 to 132.
- Proposed replacement. "LAO estimates taxpayers repay $500 million to $600 million a year for about 20 years. Funded researchers must pay the state 10% of revenue from licensing or selling their discoveries, which goes to the General Fund until the bond costs are covered. LAO says this could offset part or all of the cost, but it is uncertain and could take decades."

**38-2 `src` missing legal text.** High confidence.
- Site. Prop 38 `src` lists LAO, voter guide page, prop38.pdf, two CalMatters links. No legal text entry, unlike every other prop in scope.
- Official. https://vig.cdn.sos.ca.gov/2026/general/pdf/prop38-text-proposed-laws.pdf resolves to the Prop 38 text ("California Immunology Research and Cures Initiative", pp. 123 to 132).
- Proposed. Add `["Legal text", SOSPDF + "prop38-text-proposed-laws.pdf", "Official"]` as the third entry. Note that inserting it shifts the 0-based `rs` indexes (`lr: [3, 0]` points to the CalMatters institute article), so append it at the end instead, or update `rs` to match.

**38-3 `r.ev` (flagged prop).** No rationale conflict. Observation for the owner only.
- Site. "No direct evidence on how well this kind of institute funding leads to treatments was found in the official materials."
- Official. The LAO analysis says "Proposition 71 (2004) and Proposition 14 (2020)" "allowed the state to issue $8.5 billion in bonds for stem cell research", and the returned text gives no evidence on the outcomes of that funding. The rationale's "no direct evidence" statement is therefore accurate. The official materials do name a similar prior state program, which bears on prior flag EVD-07 (audit/reports/evidence-audit.md). No rating change proposed.

**38-4 LAO link unreachable.** `https://lao.ca.gov/ballot/2026/prop38-110326.pdf` was refused by the WebFetch allowlist in this session. The same LAO text was read on the guide's analysis page instead. Recheck the link manually.

### Proposition 39

Official title. "PROHIBITS CITIZENS FROM VOTING UNLESS THEY PRESENT GOVERNMENT-ISSUED IDENTIFICATION. INITIATIVE CONSTITUTIONAL AMENDMENT." Site matches.

Checked and matching. In-person ID, last four digits on mail ballots, free voter ID (legal text Sec. 2.1(b) "the State shall provide, at no charge, a voter ID card"), "best efforts" citizenship verification and annual county reporting (Sec. 2.1(a)), State Auditor audits "[d]uring every oddnumbered year" (Sec. 2.1(c)), "Citizens may seek judicial review and remedy" (Sec. 2.1(c)), no penalties and no notice or cure process in the text, LAO cost "tens of millions of dollars to low hundreds of millions of dollars", "About 13 million voted using a VBM ballot" in 2024, Legislature to define accepted IDs. YES and NO meanings match. Site `con` "ACLU California Action, Common Cause, League of Women Voters of California (official argument)". Official signers "David Trujillo, Executive Director, ACLU California Action", "Darius Kemp, California State Director, Common Cause", "Lorrel Plimier, Co-President, League of Women Voters of California". Match. Argument in favor signed by three coalition chairs of "Californians for Voter ID". Site matches.

**39-1 `pro` uses a news source where the official guide has the fact.** Medium confidence.
- Site. "Californians for Voter ID (official argument). LAist also lists the Howard Jarvis Taxpayers Association and the California Republican Party."
- Official. Index page (https://voterguide.sos.ca.gov/propositions/39/) supporters "The Transparency Foundation; Latino American Political Assn; Howard Jarvis Taxpayers Assn; CA Women's Leadership Assn". Rebuttal to argument against signed by "Johnathan Hale, Executive Director, The Transparency Foundation", "Cynthia Kaui, Executive Director, California Women's Leadership Association", "Ed Cervantes, President, Latino American Political Association" (arguments-rebuttals.htm).
- Proposed replacement. "Californians for Voter ID (official argument). The Transparency Foundation, California Women's Leadership Association and Latino American Political Association (official rebuttal). The official guide also lists the Howard Jarvis Taxpayers Association. LAist also lists the California Republican Party."
- Optional, `con`. The rebuttal to the argument in favor is signed by "Alex Padilla, U.S. Senator for California", "Catherine Kennedy, President, California Nurses Association" and "Adam Weinberger, President, California School Employees Association". Could be appended as "(official rebuttal)". Low.

**39-2 LAO link unreachable.** `https://lao.ca.gov/ballot/2026/prop39-110326.pdf` was refused by the WebFetch allowlist. LAO text was read on the guide's analysis page. Recheck manually.

### Proposition 40

Official title. "IMPOSES ONE-TIME TAX ON CERTAIN TAXPAYERS. INITIATIVE CONSTITUTIONAL AMENDMENT AND STATUTE." Site matches.

Checked and matching. January 1, 2026 residency (legal text Sec. 50308 "'Tax obligation date' means January 1, 2026"). 5% with a phase-in "reduced by 0.1 percentage point ... for each two million dollars" below $1.1 billion (Sec. 50301(b)), so "a lower rate just above $1 billion" is accurate. Five installments with "annual nondeductible deferral charge of 7.5 percent of the remaining unpaid balance" (Sec. 50301(c)). Exclusions (LAO "Real estate, pensions, and retirement accounts generally would be excluded"). "After accounting for administrative expenses", 90% health and 10% education and food assistance (Sec. 4, art. XIII Sec. 37(d)). Department of Finance report (Gov. Code Sec. 16355(f)), FTB examination of all returns (Sec. 50301(e)), understatement penalties (Sec. 50312), Sacramento validation action (Sec. 50314). LAO "tens of billions of dollars", "less than $1 billion per year", "a few hundred people with net worth over $1 billion". Supporters' "approximately 200 California billionaires". YES meaning matches. Site `con` "California Medical Association, California Primary Care Association, California School Boards Association (official argument)". Official signers "René Bravo, M.D., President, California Medical Association", "Francisco Silva, CEO, California Primary Care Association", "Dr. Debra Schade, President, California School Boards Association". Match. `r.ev` "No precedent for this approach was found in the official materials" is consistent, the LAO analysis mentions no wealth tax precedent.

**40-1 `pro` cites Wikipedia for a fact the official guide states.** High confidence.
- Site. "SEIU-UHW (official argument). Wikipedia reports Sen. Bernie Sanders endorsed it."
- Official. Index page (https://voterguide.sos.ca.gov/propositions/40/) supporters "US Senator Bernie Sanders; SEIU United Healthcare Workers West". Argument in favor and its rebuttal are signed by "Suzanne Jimenez, Chief of Staff, SEIU-United Healthcare Workers West", "Victoria Barron, Patient Access Specialist, Planned Parenthood of Pacific Southwest" and "Denise Robb, Ph.D., Member of American Federation of Teachers Local 1521, Los Angeles College Faculty Guild".
- Proposed replacement. "SEIU-UHW (official argument and rebuttal). The official guide also lists U.S. Sen. Bernie Sanders as a supporter."
- Optional, `con`. Rebuttal to argument in favor is signed by "April O'Connor, Teacher, California Teachers Association", "Rob Gutierrez, President, California Taxpayers Association (CalTax)" and "Chris Hannan, President, State Building and Construction Trades Council of California". The index page lists CalTax among opponents. Low.

**40-2 `risk` attribution.** Low confidence. Optional.
- Site. "LAO's analyses of Props 41 and 42 say courts could find that either one conflicts with Prop 40, so Prop 40 could be stopped if either gets more yes votes."
- Official. LAO's Prop 40 analysis itself (Figure 1 caption) says Prop 40 "could be stopped from becoming law even if it gets yes votes from a majority of voters" if Props 41 or 42 get more yes votes (https://voterguide.sos.ca.gov/propositions/40/analysis.htm). The site's statement is not wrong.
- Optional replacement of the first clause. "LAO's analysis of Prop 40 says that if Prop 41 or 42 gets more yes votes, Prop 40 could be stopped even if a majority votes yes."

### Proposition 41

Official title. "PROHIBITS NEW STATE TAXES THAT EXCLUDE REVENUES FROM STATE SPENDING LIMIT. REQUIRES AUDITS FOR NEW STATE SPECIAL TAXES. INITIATIVE CONSTITUTIONAL AMENDMENT." Site matches.

Checked and matching. Audit trigger during signature gathering (LAO "after supporters collect 25 percent of the signatures needed"). Savings recommendations (legal text Sec. 1(b)(10) "budgetary savings of at least 10 percent annually"). Online posting (Sec. 1(e)(1)) and voter guide summary (Sec. 1(e)(2)). Audits "every four years" (Sec. 2(a)(2)). Conflict clause, other measure "shall be null and void" (Sec. 5(a)(1)). LAO audit costs "in the range of the low millions of dollars per year but would grow over time" and "net fiscal effect ... is unknown". Signers. Site `pro` "CalCPAs, CalAsian Chamber of Commerce, California Taxpayers Association, former State Auditor Tom Hayes, former State Controller Steve Westly (official listing)". Official argument in favor signed by "Denise LeDuc Froemming, CPA, President, California Society of Certified Public Accountants (CalCPAs)", "Tom Hayes, Fmr. California State Auditor", "Robert Gutierrez, President, California Taxpayers Association (CalTax)". Rebuttal signed by "Pat Fong Kushida, President, California Asian Pacific Chamber of Commerce (CalAsian Chamber)", "Steve Westly, Fmr. California State Controller", "Robert Gutierrez". Match. Site `con` "SEIU-UHW, Sen. Bernie Sanders (official listing)". Index page opponents "U.S. Senator Bernie Sanders; SEIU United Healthcare Workers West". Argument against and rebuttal signed by Suzanne Jimenez, SEIU-UHW. Match (Sanders is listed, not a signer, and the site says "listing").

**41-1 `risk` rebate claim not in the official text.** Medium confidence.
- Site. "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. Counting new taxes under the spending limit could also trigger rebates under existing spending-limit rules, leaving less for other programs."
- Official. The LAO analysis (https://lao.ca.gov/ballot/2026/prop41-110326.pdf and https://voterguide.sos.ca.gov/propositions/41/analysis.htm) contains no text on rebates or school payments. Its only spending-limit statements are "The State Constitution limits how much tax revenues the state can spend each year." and "Under Proposition 41, the state might not be able to exclude new special tax spending from the limit." The AG fiscal summary says "Unknown net fiscal effect."
- Proposed replacement. "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. LAO also says the state might not be able to exclude new special tax spending from the spending limit, and calls the net fiscal effect unknown."

**41-2 `src` legal text points to a non-official copy.** High confidence.
- Site. `["Legal text (GrowSF copy)", "https://growsf.org/voter-guide/san-francisco-voter-guide-november-2026-election/measures/prop-41/legal-text/", "Independent copy of official text"]`
- Official. https://vig.cdn.sos.ca.gov/2026/general/pdf/prop41-text-proposed-laws.pdf resolves to the Prop 41 text, pp. 147 to 150.
- Proposed replacement. `["Legal text", SOSPDF + "prop41-text-proposed-laws.pdf", "Official"]` in the same array position (index 2), so `rs` indexes are unchanged.

**41-3 Prior flag EVD-08 cleared.** High confidence. No change.
- Site `does` "New state taxes enacted or taking effect on or after January 1, 2026 cannot be excluded from the spending limit, or the state cannot collect them."
- Official legal text Article XXIV Sec. 3(a) "No state tax that is enacted or takes effect on or after January 1, 2026, shall be exempted or excluded from the Government Spending Limitation." Sec. 3(b) the state "shall not impose, collect, or enforce" such a tax. The AG summary's shorter "enacted after January 1, 2026" refers to the recurring audits. The site wording follows the legal text.

### Ratings note (Props 37 and 38)

Per the brief, no rating, weight or score change is proposed. Rationale review for the two flagged props found one rationale conflict (37 `r.ac`, item 37-2) and no conflict in either `r.ev` rationale (items 37-5 and 38-3). All other `r` rationales for Props 37 to 41 were read against the official text and none was contradicted.
