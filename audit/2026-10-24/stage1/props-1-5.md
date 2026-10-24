# Stage 1 audit, statewide Propositions 1 to 5 (November 3, 2026)

Audited October 23 to 24, 2026 against the Official Voter Information Guide (voterguide.sos.ca.gov and vig.cdn.sos.ca.gov). Read only. Site text checked in `propositions.html` (PROPS entries n "1" to "5") and `data/2026-11-03/statewide.json` (items `2026-11-03.ca.prop-1` to `prop-5`). A script compared the two files field by field (title, type, does, yes plus yesE, no plus noE, money, argFor, argAgainst, pro, con, name, source URLs). They match exactly for all five, so every correction below applies to both files.

Method note. Direct downloads of vig.cdn.sos.ca.gov were refused by the network proxy (HTTP 403 on CONNECT), so all official text was read through WebFetch, which returns short quotes. Quotes below are as returned. Where a quote is partial it is marked as such.

## Summary table

| # | Prop | Field | Finding | Severity | Proposed action | Confidence |
|---|------|-------|---------|----------|-----------------|------------|
| 1 | 3 | src, LAO analysis link | Site URL returned the LAO page for Proposition 45, not Prop 3 | High | Replace with LAO PDF link | Medium |
| 2 | 4 | argFor | "California alone bans" claim is in supporters' rebuttal, not their argument in favor | Low | Reword attribution | High |
| 3 | 4 | does | "the 1988 ban" year not stated in any official 2026 guide text | Low | Drop the year | Medium |
| 4 | 1 | acct | "cost per unit for the main rental program" not supported by the measure text, which points only to H&S Code 50408 | Low | Reword | Medium |
| 5 | 2 | pro | Omits official argument signer Los Angeles Area Chamber of Commerce | Low | Add signer | High |
| 6 | 5 | src, "Official arguments" | Points to print PDF prop5.pdf (works, arguments on pp. 38 to 39) instead of the arguments page used for Props 1 to 4 | Low | Optional consistency fix | High |
| 7 | 2 | src, budget summary | ebudget.ca.gov FullBudgetSummary.pdf unreachable from this session | n/a | Recheck by hand | n/a |
| 8 | 3 | src, SPUR guide | spur.org page unreachable from this session | n/a | Recheck by hand | n/a |
| 9 | 1 to 5 | gaps | Several open gaps now answerable from official text | Info | Update gaps lists | High |
| 10 | 1 to 5 | title, type, ballot label, LAO fiscal, YES/NO, other signers | Match the official guide | None | No change | High |

No rationale conflicts found for Props 1 to 5.

## Link check

| Prop | Label | URL | Result |
|------|-------|-----|--------|
| 1 | LAO analysis | https://lao.ca.gov/ballot/2026/prop1-110326.pdf | Resolves. Title "Authorizes Bonds for Housing Affordability Programs." |
| 1 | Official voter guide page | https://voterguide.sos.ca.gov/propositions/1/ | Resolves, 2026 Prop 1 |
| 1 | Legal text | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop1-text-proposed-laws.pdf | Resolves, "PROPOSITION 1", Veterans and Affordable Housing Bond Act of 2026 |
| 1 | Official arguments | https://voterguide.sos.ca.gov/propositions/1/arguments-rebuttals.htm | Resolves |
| 2 | LAO analysis | https://lao.ca.gov/ballot/2026/prop2-110326.pdf | Resolves. Title "Increases State's Rainy Day Fund." |
| 2 | Official voter guide page | https://voterguide.sos.ca.gov/propositions/2/ | Resolves, 2026 Prop 2 |
| 2 | Legal text | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop2-text-proposed-laws.pdf | Resolves, "PROPOSITION 2", ACA 20 |
| 2 | Official arguments | https://voterguide.sos.ca.gov/propositions/2/arguments-rebuttals.htm | Resolves |
| 2 | 2026-27 budget summary | https://ebudget.ca.gov/2026-27/pdf/Enacted/BudgetSummary/FullBudgetSummary.pdf | Unreachable (fetch tool refused the host path; a web search did not return this file) |
| 3 | LAO analysis | https://lao.ca.gov/BallotAnalysis/Proposition?number=3&year=2026 | Resolved to the wrong page. Fetch returned Proposition 45 ("State and local government agencies are responsible for reviewing and approving certain projects before they can be built."). The near identical URL `...number=3&year=2026+` returned Prop 3, so the server may be inconsistent. |
| 3 | Official voter guide page | https://voterguide.sos.ca.gov/propositions/3/ | Resolves, 2026 Prop 3 |
| 3 | Legal text | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop3-text-proposed-laws.pdf | Resolves, "California Children's Education and Health Care Protection Act of 2026" |
| 3 | Official arguments | https://voterguide.sos.ca.gov/propositions/3/arguments-rebuttals.htm | Resolves |
| 3 | SPUR voter guide | https://www.spur.org/voter-guide/2026-11/ca-prop-3-high-earner-income-tax-extension | Unreachable (fetch tool refused; a web search did not return this page) |
| 4 | LAO analysis | https://lao.ca.gov/ballot/2026/prop4-110326.pdf | Resolves. Title "Repeals Prohibition Against Public Funding of Election Campaigns." |
| 4 | Official voter guide page | https://voterguide.sos.ca.gov/propositions/4/ | Resolves, 2026 Prop 4 |
| 4 | Legal text | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop4-text-proposed-laws.pdf | Resolves, "California Fair Elections Act of 2026", SB 42 |
| 4 | Official arguments | https://voterguide.sos.ca.gov/propositions/4/arguments-rebuttals.htm | Resolves |
| 5 | LAO analysis | https://lao.ca.gov/ballot/2026/prop5-110326.pdf | Resolves. Title "Changes Recall Election Process for Statewide Officers." |
| 5 | Official voter guide page | https://voterguide.sos.ca.gov/propositions/5/ | Resolves, 2026 Prop 5 |
| 5 | Legal text | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop5-text-proposed-laws.pdf | Resolves, "PROPOSITION 5", SCA 1 (Res. Ch. 204, Stats. 2024) |
| 5 | Official arguments | https://vig.cdn.sos.ca.gov/2026/general/pdf/prop5.pdf | Resolves. Print PDF of the whole Prop 5 section, analysis pp. 34 to 37, arguments pp. 38 to 39 |
| 5 | Hoover Institution analysis | https://www.hoover.org/research/prop-5-recall-reform-eliminate-replacement-question | Resolves. "PROP 5 Recall Reform (Eliminate the Replacement Question)", no author or date shown |

Side note, not a site link. https://voterguide.sos.ca.gov/propositions/4/title-summary.htm returned the 2024 Proposition 4 climate bond title and summary ("AUTHORIZES BONDS FOR SAFE DRINKING WATER, WILDFIRE PREVENTION...", SB 867, Chapter 83, Statutes of 2024) when fetched. The print PDF prop4.pdf has the correct 2026 title and summary. This may be a stale page on the SOS server or a fetch cache artifact. The site does not link it, so no change, but do not use that page as a source.

## Details

### Finding 1. Prop 3 LAO link resolves to the wrong proposition

Site, `propositions.html` Prop 3 `src` and `statewide.json` prop-3 `sources[0].url`
> "https://lao.ca.gov/BallotAnalysis/Proposition?number=3&year=2026"

Fetched October 23, 2026. The page shown was "Proposition 45" with first sentence "State and local government agencies are responsible for reviewing and approving certain projects before they can be built." The LAO PDF for Prop 3 resolves correctly. https://lao.ca.gov/ballot/2026/prop3-110326.pdf has title "Provides Permanent Funding for Schools and Health Care by Extending Existing Tax on High Incomes." and first sentence "The income tax is the state's largest tax."

Proposed correction. In `propositions.html` replace
`["LAO analysis", "https://lao.ca.gov/BallotAnalysis/Proposition?number=3&year=2026", "Official"]`
with
`["LAO analysis", LAO + "prop3-110326.pdf", "Official"]`
and in `statewide.json` prop-3 set `sources[0].url` to `"https://lao.ca.gov/ballot/2026/prop3-110326.pdf"`. This also matches the pattern used for Props 1, 2, 4 and 5.
Confidence medium (the server behaved inconsistently, but the PDF link is verified and stable in pattern).

### Finding 2. Prop 4 argFor attributes a rebuttal claim to the argument in favor

Site, Prop 4 `argFor` / `argFor`
> "Supporters' official argument says California alone bans public financing, and this lets communities choose it, with safeguards."

Official, prop4.pdf (https://vig.cdn.sos.ca.gov/2026/general/pdf/prop4.pdf), Argument in Favor contains no sentence saying California is the only state with the ban. Its theme is "ELECTIONS SHOULD BE WON, NOT BOUGHT." The claim appears in the Rebuttal to Argument Against, "California is the ONLY state that bans public funding of campaigns." (also confirmed on https://voterguide.sos.ca.gov/propositions/4/arguments-rebuttals.htm).

Proposed replacement text
> "Supporters' official argument says elections should be won, not bought, and this lets communities choose public financing, with safeguards. Their rebuttal says California is the only state that bans it."

Confidence high.

### Finding 3. Prop 4 "1988" is not in any official 2026 text

Site, Prop 4 `does` / `plainEnglish`
> "Repeals the 1988 ban, so governments may create voluntary public funding programs for candidates."

Official. The LAO analysis (https://voterguide.sos.ca.gov/propositions/4/analysis.htm, Background) says only "The Political Reform Act bans the use of public funds for political candidates' campaigns." with no year or proposition number. The AG summary in prop4.pdf says "Current law prohibits state and local governments from using public funds for election campaigns". The legal text (prop4-text-proposed-laws.pdf) mentions neither 1988 nor Proposition 73. The site's own gaps list already says the year rests on a legislative committee analysis.

Proposed replacement text
> "Repeals the state ban on public funding of campaigns, so governments may create voluntary public funding programs for candidates."

(rest of the sentence unchanged). Confidence medium. The year is likely historically right but is unsupported by the official guide.

### Finding 4. Prop 1 acct overstates what the measure points to

Site, Prop 1 `acct` / `evidence`
> "An annual public report on the bond. Existing law it points to requires homes assisted, households served and where the homes are, plus cost per unit for the main rental program."

Official, prop1-text-proposed-laws.pdf (https://vig.cdn.sos.ca.gov/2026/general/pdf/prop1-text-proposed-laws.pdf), Health and Safety Code Section 54088, "The administering entity shall publish in an annual report detailed information regarding the investments resulting from this bond." The section points to Section 50408 only. Section 50675.12 does not appear in the measure text. The LAO analysis does not discuss reporting.

Proposed replacement text
> "An annual public report on the bond's investments, using the existing state housing annual report (Health and Safety Code Section 50408)."

Keep the CalVet and "No target" sentences. Confidence medium. Whether Section 50408 itself requires the listed items was not checked against the code.

### Finding 5. Prop 2 supporters list omits an official argument signer

Site, Prop 2 `pro` / `supporters`
> "California Professional Firefighters, Assembly Budget Chair Jesse Gabriel, Gov. Newsom."

Official, https://voterguide.sos.ca.gov/propositions/2/arguments-rebuttals.htm, Argument in Favor signed by "Darrell Roberts, President, California Professional Firefighters", "Jesse Gabriel, Chair, California State Assembly Budget Committee", "Maria S. Salinas, CEO, Los Angeles Area Chamber of Commerce". The quick reference on https://voterguide.sos.ca.gov/propositions/2/index.htm lists "CA Professional Firefighters; LA Chamber of Commerce; Gavin Newsom; Xavier Becerra; Assemblymember Jesse Gabriel". Gov. Newsom is supported by that list.

Proposed replacement text
> "California Professional Firefighters, Assembly Budget Chair Jesse Gabriel, Los Angeles Area Chamber of Commerce (official argument). The official guide also lists Gov. Newsom."

Confidence high. Omission only, not a wrong fact.

### Finding 6. Prop 5 "Official arguments" link differs from Props 1 to 4

Site, Prop 5 `src`
> `["Official arguments", SOSPDF + "prop5.pdf", "Official, campaign arguments"]`

The PDF resolves and contains the arguments (pp. 38 to 39) with the same signers as the web page. https://voterguide.sos.ca.gov/propositions/5/arguments-rebuttals.htm also resolves. Proposed optional replacement for consistency
`["Official arguments", SOS + "5/arguments-rebuttals.htm", "Official, campaign arguments"]`
and the matching URL in `statewide.json`. Confidence high. Not a factual error.

### Findings 7 and 8. Unreachable links

The Prop 2 budget summary and the Prop 3 SPUR page could not be fetched in this session (the fetch tool refused both hosts, and web searches did not surface those exact URLs). These are unreachable, not shown broken. No change proposed. A person should open them once.

### Finding 9. Gaps that official text now answers

- Prop 1 gap "Confirm Health and Safety Code sections 50408 and 50675.12". The measure text cites 50408 (in Section 54088) and does not cite 50675.12.
- Prop 1 gap "Whether the CalVet accountant review is made public". Military and Veterans Code Section 998.759(a) in the measure text sends the independent public accountant's results to "the Secretary of Veterans Affairs, the California Veterans Board, the Senate and Assembly policy committees on veterans affairs, and the Veterans' Finance Committee of 1943" (as paraphrased by the fetch tool). No public posting was found.
- Prop 2 gap on Department of Finance duties. Legal text Section 20(b)(1) "the Department of Finance shall provide to the Legislature all of the following information" and Section 20(h) "The annual Budget Act shall include the estimates described in all of the following." The extracted copy lost strikeout and italics, so new versus existing text is still unknown.
- Prop 3 gap on thresholds. AG summary (https://voterguide.sos.ca.gov/propositions/3/title-summary.htm) "Rates apply to income over about $371,000 for single filers, $742,000 for joint filers, and $505,000 for heads of household" "(2025 levels; adjusted annually for inflation)."
- Prop 4 gap on ethics commission wording. Legal text Section 85300(h) "The Commission is not responsible for the administration or enforcement of a system of public funding" of local candidates. LAO analysis "the Fair Political Practices Commission is not required to administer or enforce local public campaign finance programs." The site's acct text is supported.
- Prop 4 gap on a cap. No aggregate cap on total public funds was found in the legal text.
- Prop 4 gap "Official argument signers read once only". Read again, they match (see below).
- Prop 5 gap "Official legal text not read". Read. Art. V, Sec. 10(b) "the Lieutenant Governor shall become Governor for the remainder of the unexpired term", with a special election consolidated with the statewide primary if removal is before the close of the nomination period in the first two years. No reporting or audit duty found.

Proposed action. Update each `gaps` array. Confidence high.

### Finding 10. Items that match (no change)

Official titles (https://voterguide.sos.ca.gov/propositions/) match the site `title` and `type` for all five, case aside.

- Prop 1. "AUTHORIZES BONDS FOR HOUSING AFFORDABILITY PROGRAMS. LEGISLATIVE STATUTE." LAO fiscal "Increased state cost of $500 million to $600 million annually for about 25 years to repay the housing bond." matches `money`. LAO "$7.2 billion to acquire, build, or renovate rental housing", "$1.25 billion for home loan assistance to veterans", "up to 40,000 multifamily rental units", "help up to 40,000 households" match `does`, `yesE`, `out`. YES "The state could borrow $11.25 billion to support veterans and affordable housing." matches exactly. NO is "The state could not borrow $11.25 billion to support veterans and affordable housing." Site says "this money", same meaning. Argument in Favor signed by Anni Chung (Self-Help for the Elderly), Jeffery Freitas (California Federation of Teachers), John H. Ing (US Vets), matching `pro`. "NO ARGUMENT AGAINST PROPOSITION 1 WAS SUBMITTED." matches `con`. The Sen. Strickland claim is from news reports and was not checked against the guide.
- Prop 2. "INCREASES STATE'S RAINY DAY FUND. LEGISLATIVE CONSTITUTIONAL AMENDMENT." LAO "until it reaches 20 percent of General Fund taxes", deposits "would not count toward the state appropriations limit", "extra debt payments through 2040 (instead of through 2030)", no dollar estimate, match `does` and `money`. YES and NO first sentences match exactly. Argument Against signed by David Tangipa, Steven Choi, Carl DeMaio, matching `con`. "SLUSH FUND FOR SACRAMENTO POLITICIANS" supports `argAgainst`.
- Prop 3. "PROVIDES PERMANENT FUNDING FOR SCHOOLS AND HEALTH CARE BY EXTENDING EXISTING TAX ON HIGH INCOMES." LAO "The top 2 percent of California taxpayers pay these higher rates", "$5 Billion and $15 Billion Each Year", "Roughly 40 percent of the funding would go to schools and community colleges" match. Legal text Sec. 36(e)(6), 36(e)(7) and 36(g)(1) support `acct`. Argument in Favor (CTA, CSNO, Planned Parenthood Affiliates of California), Argument Against (CalTax, Family Business Association of California, California Hispanic Chambers of Commerce), Rebuttal to Argument in Favor led by Jon Coupal of HJTA, all match `pro` and `con`. The PTA is in the quick reference supporters list.
- Prop 4. LAO "state costs would be a few hundred thousand dollars each year" and "The cost of these programs could be significant for governments that choose to create them" match `money` and `risk`. AG "Triples maximum fine for campaign contributions by foreign entities" and legal text "not exceeding an amount equal to three times the amount contributed or expended" support `does`. Legal text "shall not discriminate based on party or according to whether a candidate is a challenger or an incumbent" and "broad-based support" support `yesE`. LAO charter city exception supports `noE`. Signers match `pro` (Plimier, Kennedy, Umberg in favor; Common Cause on the rebuttal) and `con` (Gutierrez, Coupal, Schnur on the rebuttal; Schnur also on the argument against). "NO LIMIT on the number of candidates" and "NO LIMIT on how much taxpayer money a candidate can receive" support `argAgainst`.
- Prop 5. "CHANGES RECALL ELECTION PROCESS FOR STATEWIDE OFFICERS. LEGISLATIVE CONSTITUTIONAL AMENDMENT." LAO "before the close of the nomination period for the next statewide election during the first two years of the term", "less than one-tenth of 1 percent (0.1 percent) of the state's total General Fund budget", "Since 1913, 11 state recall efforts have qualified for the ballot" "(nine legislators and two Governors)", 135 candidates in 2003, match `does`, `money`, `noE` and the `ev` reason. YES "Recall elections would no longer include a question about who should fill the vacancy." and NO "Voters would continue to be asked who should fill the vacancy as part of recall elections." match. Argument in Favor (Plimier, Kemp, Schnur) and Argument Against (Brian W. Jones, Joe Patterson) match `pro` and `con`. The CalMatters claim was not checked against the guide.
