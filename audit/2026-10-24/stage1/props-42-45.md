# Stage 1 audit, Props 42 to 45 (read only)

Audited October 23 to 24, 2026 against the Official Voter Information Guide for the November 3, 2026 General Election. Site text was read from `propositions.html` (PROPS entries for 42 to 45, lines 669 to 752) and `data/2026-11-03/statewide.json` (items `2026-11-03.ca.prop-42` to `prop-45`). The JSON items are verbatim copies of the PROPS fields (JSON `yes` = PROPS `yes` + `yesE`, `no` = `no` + `noE`, `risks` = `risk` + `tw`), so every correction below applies to both files unless noted.

Fetch method. Direct `curl` to sos.ca.gov and lao.ca.gov was refused by the proxy (HTTP 403 on CONNECT), so every official page was read with WebFetch. WebFetch returns short verbatim quotes and summaries, so a few long passages below are quoted in parts. Page numbers for the printed guide come from the PDF footers as reported by the fetch tool.

## Summary table

| # | Prop | Field (PROPS / JSON) | Issue | Proposed correction | Confidence |
|---|------|----------------------|-------|---------------------|------------|
| 1 | 44 | `con` / `opponents` | Lists two of the three signers of the official argument against. Omits California School Nurses Organization | Replace text (see 44.1) | High |
| 2 | 45 | `pro` / `supporters` | Lists two of the three signers of the official argument in favor. Omits California Council on Affordable Housing | Replace text (see 45.1) | High |
| 3 | 45 | `noE` / `no` | "This includes CEQA exemptions the Legislature passed in 2025" is not in the guide or LAO analysis, yet sits in the field the code says is the official meaning of a NO vote | Remove `noE`, use official NO wording (see 45.2) | Medium |
| 4 | 45 | `unk` / `uncertain` | "four to five years" is not in the cited HousingWire article. The Holland & Knight report says "about five years" | Replace text (see 45.3) | Medium |
| 5 | 44 | `does` / `plainEnglish` | Refund condition incomplete. Legal text also requires a spending plan agreed with the Department of Public Health. Waiver not mentioned | Replace text (see 44.2) | Medium |
| 6 | 43 | `does` / `plainEnglish` | Property tax clause described as applying to citizen initiatives only. Legal text applies it to every local government, including voters using the initiative | Replace sentence (see 43.1) | Medium |
| 7 | 44 | `yes` / `yes` | Drops the word "care" from the official YES statement | Replace text (see 44.3) | High (wording only) |
| 8 | 45 | `con` / `opponents` | "League of Women Voters" is attributed to news reports, but the cited LAist guide does not name it | Remove or cite a source (see 45.4) | Low |
| 9 | 42 | `pro` / `supporters` | Label "(official listing and argument)". PORAC signed only the rebuttal | Replace label (see 42.1) | Low |
| 10 | 45 | `con` / `opponents` | Official listing also names Physicians for Social Responsibility, LA and National Wildlife Federation (optional addition) | Optional addition (see 45.5) | Low |
| 11 | 42 | titles, label, LAO, YES/NO, arguments, links | All match | No change | High |
| 12 | 43 | titles, label, LAO, YES/NO, arguments, links | All match except row 6 | No change | High |
| 13 | 44 | Accountability rating `s.ac` = 5, reason `r.ac` | Owner flag. No rationale conflict with the official text found | No change (ratings out of scope) | High |
| 14 | 42, 44, 45 | `gaps` | Several open gaps can now be closed from official text (see Gap updates) | Owner to update gaps | High |

### Source link check

| Prop | Link on site | Result |
|------|--------------|--------|
| 42 | https://lao.ca.gov/ballot/2026/prop42-110326.pdf | Resolves. LAO "Analysis of Proposition 42", Nov 3, 2026 ballot |
| 42 | https://voterguide.sos.ca.gov/propositions/42/ | Resolves. Prop 42 guide page |
| 42 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop42-text-proposed-laws.pdf | Resolves. Prop 42 text (Retirement and Personal Savings Protection Act) |
| 42 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop42.pdf ("Official arguments") | Resolves. Full printed section, pages 62 to 65, including arguments and rebuttals |
| 43 | https://lao.ca.gov/ballot/2026/prop43-110326.pdf | Resolves. LAO analysis of Prop 43 |
| 43 | https://voterguide.sos.ca.gov/propositions/43/ | Resolves |
| 43 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop43-text-proposed-laws.pdf | Resolves. Section 4.5 of Article XIII A |
| 43 | https://voterguide.sos.ca.gov/propositions/43/arguments-rebuttals.htm | Resolves. Arguments and rebuttals page |
| 44 | https://lao.ca.gov/ballot/2026/prop44-110326.pdf | Resolves (first fetch refused by the tool allowlist, resolved after a web search surfaced it). LAO analysis of Prop 44 |
| 44 | https://voterguide.sos.ca.gov/propositions/44/ | Resolves |
| 44 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop44-text-proposed-laws.pdf | Resolves. Clinic Funding Accountability and Transparency Act |
| 44 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop44.pdf | Resolves. Printed section pages 70 to 73 |
| 44 | NACHC fact sheet (independent) | Resolves. 5,312,677 patients in 2022, 53% below 100% FPL. Supports `who` |
| 45 | https://lao.ca.gov/ballot/2026/prop45-110326.pdf | Resolves (same allowlist note as 44). LAO analysis of Prop 45 |
| 45 | https://voterguide.sos.ca.gov/propositions/45/ | Resolves (the site's gap says it could not be read on Oct 22. It can now) |
| 45 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop45-text-proposed-laws.pdf | Resolves. Building an Affordable California Act |
| 45 | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop45.pdf | Resolves. Printed section pages 74 to 79 |
| 45 | HousingWire (independent) | Resolves. Supports "helped write" claim. Does not give a lawsuit duration (see 45.3) |
| 45 | LAist (independent) | Resolves. Does not name League of Women Voters (see 45.4) |

---

## Prop 42

Official title (guide page and title-summary page, https://voterguide.sos.ca.gov/propositions/42/title-summary.htm) is "PROHIBITS NEW STATE PERSONAL PROPERTY TAXES AND CERTAIN RETROACTIVE STATE TAXES. INITIATIVE CONSTITUTIONAL AMENDMENT." Site `title` "Prohibits new state personal property taxes and certain retroactive state taxes" and `type` "Initiative constitutional amendment" match.

Checked and matching
- YES. Site and guide both read "The state could not establish new taxes on the ownership of financial assets or other personal property." (https://voterguide.sos.ca.gov/propositions/42/index.htm)
- NO. Site "The state would continue to have the option to establish such taxes." Guide "The state would continue to have the option to establish new taxes on the ownership of financial assets or other personal property." Same meaning, no change needed.
- Fiscal. Site `money` "No dollar estimate. LAO says future tax revenue might not grow as much." Guide fiscal summary "Possibility that tax revenues will not go up as much in the future." LAO Fiscal Effects "When and by how much future revenues would be reduced is unclear." Matches.
- `does`. The 365 day limit and disaster or fiscal emergency condition match legal text Art. VIII §2(c)(1) "does not apply retroactively for more than 365 days prior to the date the statute takes effect" and §2(c)(2)(A),(B). "enacted on or after January 1, 2026" matches §1(a) and §2(a)(1). "that whole measure is void" matches §5(a)(1) "all the provisions of the other measure shall be null and void". Legal text is cited at guide page 150 (printed section, prop42.pdf).
- `risk`. LAO figure "Potential Interactions With Other Propositions" says "the courts could find that Proposition 42 conflicts with Proposition 40" and "then Proposition 40 could be stopped from becoming law even if it gets yes votes from a majority of voters." Matches. "Undefined terms, such as ownership or control" is the site's own reading. The phrase "ownership or control" is in §1(a) and the LAO does not discuss it. Not contradicted, no change.
- `argFor`. Argument in favor says "Prohibits new taxes on personal property, such as retirement funds, pensions and savings accounts" and "Prohibits retroactive taxes". Supported.
- `argAgainst`. Argument against says "This is a billionaire-funded initiative designed specifically to undo the California Billionaire Tax, Prop. 40." Supported.
- `con`. Guide opponents listing "US Senator Bernie Sanders" and "SEIU United Healthcare Workers West". Argument against and rebuttal signed by Suzanne Jimenez, Chief of Staff, SEIU-United Healthcare Workers West. Matches.

### 42.1 Supporter label (low)
- Site `pro` "California Professional Firefighters, State Building and Construction Trades Council, AMVETS Department of California, California Small Business Association, California Senior Alliance, Peace Officers Research Association of California (official listing and argument)."
- Official. Guide supporters listing "CA Professional Firefighters", "State Building & Construction Trades Council of CA", "AMVETS Department of CA". Argument in favor signed by "Michael Hedges, President, California Small Business Association", "Shelley Huff, Commander, AMVETS, Department of California", "Jennifer Yoder, Board Member, California Senior Alliance". Rebuttal to argument against signed by "Darrell Roberts, President, California Professional Firefighters", "Chris Hannan, President, State Building and Construction Trades Council of California", "Brian R. Marvel, President, Peace Officers Research Association of California". Source https://voterguide.sos.ca.gov/propositions/42/arguments-rebuttals.htm
- Every name is official. PORAC appears only on the rebuttal.
- Proposed replacement for the label "(official listing and argument)" is "(official listing, argument and rebuttal)". Confidence low (labeling only).

---

## Prop 43

Official title "LIMITS VOTERS' ABILITY TO RAISE REVENUES FOR LOCAL GOVERNMENT SERVICES. LEGISLATIVE CONSTITUTIONAL AMENDMENT." (ACA 22, Chapter 132, Statutes of 2026. Senate 35 to 1, Assembly 68 to 2). Site title and type match.

Checked and matching
- YES and NO match the guide word for word.
- Fiscal. Guide "Possibility that local government tax revenues will not go up as much in the future". LAO Fiscal Effects "local governments' tax revenues could be lower in the future than they otherwise would be" and "The actual revenue impact is unknown." Site `money` matches. The CalMatters Sonoma County example is not in official sources and has no CalMatters link in `src` (already listed in `gaps`).
- Start date and scope. LAO Proposal "beginning on January 1, 2027, any new, increased, or extended local special taxes proposed by voters would require a two-thirds vote." Legal text §4.5(a) "Beginning on January 1, 2027 ... may impose, extend, or increase any special tax ... unless and until that tax is submitted to the electorate and approved by a two-thirds vote." Matches.
- `argFor`. Argument in favor "Prop. 43 closes these loopholes and restores the two-thirds vote requirement to pass local special taxes." Supported.
- `argAgainst`. Rebuttal to argument in favor "But Proposition 43 doesn't cut your taxes a penny." Argument against "letting just one-third of voters (33.4%) block local voter decisions" and headings on fire, police, roads and schools. Supported.
- `pro`. Guide listing "California Taxpayers Association", "Family Business Association of California", "California Hispanic Chambers of Commerce". Argument signed by those three. Howard Jarvis Taxpayers Association is the official "For" contact (Jon Coupal) and signs the rebuttal. Matches.
- `con`. Guide listing "California Professional Firefighters", "California Federation of Teachers", "Nurse Alliance of SEIU CA". Argument against adds "Adam Weinberger, President, California School Employees Association". Matches the label "(official listing and argument)".

### 43.1 Property tax clause (medium)
- Site `does` "It also bars citizen initiatives from adding local property taxes beyond what the state constitution already allows."
- Official legal text §4.5(b), https://vig.cdn.sos.ca.gov/2026/general/pdf/prop43-text-proposed-laws.pdf, reads "Notwithstanding Article II and Article XI, no local government, including the electorate of a local government exercising the initiative power, may impose ad valorem taxes on real property, except as provided in paragraph (1) of subdivision (a) of Section 3 of Article XIII D."
- The clause covers every local government, with voters using the initiative included, and it is limited to ad valorem taxes on real property. Neither the LAO analysis nor the official summary mentions it.
- Proposed replacement sentence "It also says no local government, including voters using the initiative, may impose ad valorem taxes on real property except as Article XIII D, Section 3(a)(1) of the state constitution allows. The official analysis does not discuss this clause." Confidence medium.

---

## Prop 44

Official title "REQUIRES COMMUNITY HEALTH CLINICS SPEND 90% OF REVENUE ON PROGRAM SERVICES. INITIATIVE STATUTE." Site title and type match.

Checked and matching
- NO matches the guide word for word.
- Fiscal. Guide "Increased state costs in the low tens of millions of dollars per year, covered by fees." LAO "would be in the low tens of millions of dollars per year", covered by fees on affected clinics. Site matches. The $5 million example is correct arithmetic (penalty equals the shortfall to 90% of revenue, LAO Proposal and legal text H&S §1234.5).
- `yesE`. LAO Background "currently report spending an average of about 80 percent of their revenue on providing health care services". Matches.
- `risk`. LAO "Some clinics that could not meet the minimum spending requirement might close instead." Matches.
- `does`, coverage. Legal text Gov. Code §12586.3(a)(1) covers FQHC clinic corporations and look-alikes and says "Clinic shall not include federally recognized Indian tribes, tribal organizations, or urban Indian organizations." Matches "similar clinics, with tribal clinics exempt". The Attorney General starting point is IRS Form 990 Part III line 4e, adjusted by AG guidance. Matches "starting from IRS tax-form categories".
- `acct`. Legal text §12586.3(b)(1) annual filing, (b)(4) and (e) AG posts within 90 days, (f) AG may audit, (d) late fines of $5,000 then $10,000 a month, Corp. Code §5142.1(a) "any patient of that FQHC may bring an action", Corp. Code §6814.1 criminal penalties for knowing misreporting. Matches.
- `argFor`. Argument in favor "Yet some clinics spend less than half of their funding on patient care and services" and "diverting millions to inflated executive salaries". Supported.
- `argAgainst`. Argument against "Prop. 44 is a dangerous, poorly drafted measure that would threaten care for millions of California patients" and "Force thousands of clinics throughout the state to cut back patient services or shut down entirely." Supported.
- `pro`. Argument in favor and its rebuttal are signed by "Shawna Brown, Initiative Proponent" and "Brisa J. Barrera, Community Clinic Worker". "For" contact is "Gustavo Medina, SEIU-UHW". The guide supporters listing reads "None submitted". Site text matches.

### 44.1 Opponent list (high)
- Site `con` "California Medical Association, American Academy of Pediatrics California (official argument). News reports add the California Primary Care Association, Planned Parenthood Affiliates of California, and the Democratic and Republican parties."
- Official argument against, https://voterguide.sos.ca.gov/propositions/44/arguments-rebuttals.htm, is signed by "Eric Ball, MD, FAAP, President, American Academy of Pediatrics, California", "Katie Nilsson, RN, President, California School Nurses Organization", "René Bravo, M.D., President, California Medical Association". The guide opponents listing (https://voterguide.sos.ca.gov/propositions/44/) is "American Academy of Pediatrics CA", "CA School Nurses Org", "CA Academy of Family Physicians", "CA Medical Assoc."
- Proposed replacement "American Academy of Pediatrics California, California School Nurses Organization, California Medical Association (official argument). The official listing also names the California Academy of Family Physicians. News reports add the California Primary Care Association, Planned Parenthood Affiliates of California, and the Democratic and Republican parties." The news-report names were not checked in this stage. Confidence high.

### 44.2 Refund condition and waiver (medium)
- Site `does` "Any shortfall is paid as a penalty into escrow and returned only if the clinic reaches 90% within five years."
- Official. Legal text H&S §1234.5 says moneys are "held in escrow for a period of five years" and are reimbursed only if the clinic meets the 90 percent requirement and agrees with the Department of Public Health on a plan to spend the reimbursed amount on mission-directed expenses. After five years they are "subject to appropriation by the Legislature" for clinical worker training, recruitment and retention. H&S §1234.5(c) lets the department grant "a temporary pause of the 90 percent requirement" for one year. The official summary (https://voterguide.sos.ca.gov/propositions/44/title-summary.htm) also says the department could waive the requirement in exceptional circumstances.
- Proposed replacement sentence "Any shortfall is paid as a penalty into escrow. It is returned only if the clinic reaches 90% within five years and agrees with the Department of Public Health on a plan to spend it on patient services. The department can grant one-year waivers." Confidence medium (omission, the current sentence is not wrong).

### 44.3 YES wording (high, wording only)
- Site `yes` "Certain private nonprofit health clinics would have to spend at least 90 percent of their revenue each year on providing health care services."
- Official "Certain private nonprofit health care clinics would have to spend at least 90 percent of their revenue each year on providing health care services." (https://voterguide.sos.ca.gov/propositions/44/index.htm)
- Proposed replacement is the official sentence above. Meaning is the same. Listed because the code comment says `yes` holds the official meaning.

### 44.4 Accountability rating (owner flag)
- `s.ac` = 5 with `r.ac` "Required reporting and penalties, with audits, patient lawsuits and criminal charges authorized."
- Every element of the reason is in the legal text (see `acct` above). No rationale conflict with the official text. Whether 5 fits the rubric is outside this audit. No change proposed.
- Other Prop 44 reasons (`r.fc`, `r.oc`, `r.if`, `r.lr`) also agree with LAO and the legal text.

---

## Prop 45

Official title "MODIFIES ENVIRONMENTAL REVIEW FOR CERTAIN PROJECTS. INITIATIVE STATUTE." Site title and type match.

Checked and matching
- YES matches the guide word for word.
- Fiscal. Guide "Initial costs for state and local governments, likely in the high tens of millions of dollars" potentially over $100 million annually, partly covered by fees, long term uncertain. LAO "high tens of millions of dollars annually, potentially exceeding $100 million annually". Site `money` matches.
- Nine project types match LAO Figure 1 (read from the HTML analysis, https://voterguide.sos.ca.gov/propositions/45/analysis.htm), which lists Housing, Water system, Clean energy, Health facility clinic and medical office building, Fire police and sheriff's stations, Wildfire risk reduction, Broadband Internet access, Education facility, Transportation. LAO "The proposition gives eligible project applicants the option of using the new procedures or existing procedures."
- Court deadlines. Legal text §21027(a)(1)(A) "shall be commenced within 30 days from the date the public agency files a notice of determination or notice of exemption" and "shall be completed within 270 days, inclusive of original and appellate court proceedings". §21027(a)(1)(B) up to 90 more days. §21027(a)(2) further extension only "upon mutual written consent of the plaintiff or petitioner, the public agency, and the applicant." Site "longer only if all parties agree" matches.
- Remedies. §21027(c)(2) "The remedy shall be limited only to prohibiting commencement of the noncomplying part, phase, or activity". LAO "the court can only stop the part of the project where the environmental review did not comply with CEQA." Matches.
- `risk`. LAO "Allows the applicant to develop only one project alternative" and tribal consultation limited to tribes "formally recognized by the federal government". Legal text §21025(b) and §21028(e)(1). Matches.
- `acct`. No reporting or audit requirement found in the legal text. LAO says applicants may request a hearing and sue when the EIR deadline is missed. Matches.
- `argFor`. Argument in favor "is too slow, too bureaucratic, and too costly" and "projects must comply with all of California strong environmental laws". Supported.
- `argAgainst`. Argument against "PROPOSITION 45 LIMITS ENVIRONMENTAL AND PUBLIC REVIEW OF PROJECTS BUILT IN YOUR COMMUNITY." and "The corporations paying for Prop. 45 will profit while you keep paying." Supported.
- "California Chamber of Commerce (sponsor)". Argument against says "Prop. 45 was written by the California Chamber of Commerce". LAist also lists it as a supporter.

### 45.1 Supporter list (high)
- Site `pro` "California Water Association, California Children's Hospital Association (official argument). News reports add the California Chamber of Commerce (sponsor), the California Hospital Association and the California Republican Party."
- Official argument in favor, https://voterguide.sos.ca.gov/propositions/45/arguments-rebuttals.htm and printed guide pages 74 to 79 (https://vig.cdn.sos.ca.gov/2026/general/pdf/prop45.pdf), is signed by "Ann-Louise Kuhns, President, California Children's Hospital Association", "Jennifer Capitolo, Executive Director, California Water Association", "Jenna Abbott, Executive Director, California Council on Affordable Housing". The guide supporters listing names the same three groups (the fetched listing rendered the third as "California Council for Affordable Housing"; the signed argument in the printed PDF reads "on"). Rebuttal to argument against adds "Ruben Grijalva, Former California State Fire Marshal, CAL FIRE" and "Robert Rivinius, President, Family Business Association of California".
- Proposed replacement "California Children's Hospital Association, California Water Association, California Council on Affordable Housing (official listing and argument). News reports add the California Chamber of Commerce (sponsor), the California Hospital Association and the California Republican Party." Confidence high. Owner should confirm "on" vs "for" against the printed page.

### 45.2 NO statement and the 2025 exemptions sentence (medium)
- Site `no` "Projects would continue to use existing review and court challenge procedures." `noE` "This includes CEQA exemptions the Legislature passed in 2025." JSON `no` joins both.
- Official NO, guide page and LAO Yes/No Statement, "Public and private projects would continue to use existing project review and court challenge procedures."
- The LAO analysis does not mention AB 130, SB 131 or any 2025 law. Its only exemption example is "state law exempts certain housing developments located near public transit from needing a CEQA review." The sentence is unattributed and the code comment says yesE/noE hold attributed estimates.
- Proposed replacement. `no` "Public and private projects would continue to use existing project review and court challenge procedures." `noE` "" (empty). JSON `no` "Public and private projects would continue to use existing project review and court challenge procedures." If the owner wants to keep the 2025 point, move it to `unk` with a named source. Confidence medium.

### 45.3 CEQA lawsuit duration (medium, independent source)
- Site `unk` "A Holland & Knight study led by Jennifer Hernandez, who HousingWire reports helped write the measure, puts it at four to five years."
- HousingWire (https://www.housingwire.com/articles/california-prop-45-ceqa-timelines/) says Hernandez "helped write the ballot language" but gives no lawsuit duration and describes a study of "498 published and unpublished CEQA appellate decisions from 2013 through 2023." The Holland & Knight report by Jennifer L. Hernandez, Scott Levin Gesundheit and Daniela de la Rosa (https://www.hklaw.com/en/insights/publications/2026/09/why-california-cant-build-reliable-and-affordable-essential-projects) says "CEQA trial and appellate court proceedings typically take about five years to complete".
- Proposed replacement sentence "A Holland & Knight report co-written by Jennifer Hernandez, who HousingWire reports helped write the measure, says CEQA trial and appellate proceedings typically take about five years." Add the Holland & Knight URL to `src` as "Independent". Confidence medium. Rating reasons `r.ev` do not depend on the figure.

### 45.4 League of Women Voters attribution (low)
- Site `con` "News reports add the California Labor Federation, Sierra Club California, the League of Women Voters and the California Democratic Party."
- The cited LAist guide (updated October 19, 2026) lists opponents California Democratic Party, Sierra Club of California, California Labor Federation, Physicians for Social Responsibility Los Angeles, and Communities for a Better Environment. It does not mention the League of Women Voters. Earlier audit notes cite an LWV page (my.lwv.org/node/73812), which is not linked on the site and was not read here.
- Proposed. Either remove "the League of Women Voters" or add a source that names it. Confidence low.

### 45.5 Official opponents listing (low, optional)
- Site `con` lists "Coalition for Clean Air, Clean Water Action, California Environmental Voters (official argument)". These match the argument signers (Joe Lyou, Jennifer Clary, Matt Abularach-Macias).
- The guide opponents listing (https://voterguide.sos.ca.gov/propositions/45/) reads "Coalition for Clean Air", "CA Environmental Voters", "Physicians for Social Responsibility, LA", "National Wildlife Federation".
- Optional addition after "(official argument)" is " The official listing also names Physicians for Social Responsibility, Los Angeles and the National Wildlife Federation." Confidence low. No error in current text.

---

## Gap updates for the owner

These `gaps` entries in statewide.json can now be answered from official text. No file was changed.
- Prop 42 "Official legal text could not be fetched". The official PDF was read this time.
- Prop 42 "Whether the revenue-use limit applies to the fiscal emergency exception as well". Yes. §2(c)(2)(B) requires revenue "expressly limited by the statute to responding to the fiscal emergency", matching the disaster clause in §2(c)(2)(A).
- Prop 42 "Full official arguments not read word for word". Signers and key sentences were read (42.1).
- Prop 44 "Whether the summary should mention the health department's waiver and the spending-plan condition". Both are in the legal text and the waiver is in the official summary (44.2).
- Prop 45 "official voter guide page could not be read". It now resolves. Official listing is in 45.1 and 45.5.
- Prop 45 "Confirm ... that Jennifer Hernandez helped write the measure". HousingWire says so. No official source names the drafters, so it stays one independent source.
- Prop 45 "LAO Figure 1 project types were read from image descriptions". The HTML analysis lists the same nine types in text.
