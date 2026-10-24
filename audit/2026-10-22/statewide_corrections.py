# Corrections to the statewide proposition text, decided after the Oct 22, 2026 audit (raw/statewide-<n>.json).
# Each entry: (prop, field, new_text, reason). Field "r.xx" is a rating reason; ratings themselves are unchanged.
# new_text None means "keep the current text"; such entries only record a decision.
C = []
def fix(n, field, new, why): C.append((n, field, new, why))

# ---- Prop 1
fix("1", "no", "The state could not borrow this money for veterans and affordable housing.", "Second sentence ('rely on yearly budgets') had no source; the official NO statement is followed.")
fix("1", "acct", "An annual public report on the bond. Existing law it points to requires homes assisted, households served and where the homes are, plus cost per unit for the main rental program. A yearly independent accountant review of CalVet's home loan finances. No target for homes built or cost per home.", "Section 54088 ties the annual report to Health and Safety Code 50408, which lists units, households and distribution. The old text understated the reporting.")
fix("1", "argAgainst", "No official argument against was filed. In news reports, critics such as state Sen. Tony Strickland say the state should not take on more debt.", "No source found for the Howard Jarvis Taxpayers Association opposing this measure; Strickland is reported by Spectrum News.")
fix("1", "con", "No official argument against was filed. News reports name Sen. Tony Strickland as a critic. No organized campaign against.", "HJTA not found in any source; Strickland only in independent reporting, now labeled.")
fix("1", "r.ac", "Required annual public report covering homes assisted and where, and a yearly independent review of CalVet's loan finances, but no audit of the housing money.", "Report is broader than the old wording said.")
fix("1", "r.lr", "Fixed debt for about 25 years, at $500 million to $600 million a year.", "'Small share of the budget' had no source; replaced with LAO's figures.")
fix("1", "r.nb", "Up to 40,000 rentals and 40,000 buyers helped, against roughly $12.5 billion to $15 billion repaid over 25 years (this tool's arithmetic from LAO's yearly cost). Cost per home unknown.", "The total is our arithmetic, now labeled as such.")

# ---- Prop 4
fix("4", "yesE", "Programs cannot favor candidates by party or incumbency. Candidates must show broad support and accept spending limits.", "Eligibility rules per LAO and the Assembly analysis; 'open to' overstated.")
fix("4", "acct", "Existing campaign disclosure rules apply. No new audit or outcome target. The state ethics commission is not required to enforce local programs.", "LAO: the FPPC 'is not required to administer or enforce' local programs.")
fix("4", "r.ac", "Relies on existing disclosure rules, and the state ethics commission is not required to enforce local programs.", "Same correction as acct.")
fix("4", "risk", "Opponents say there is no limit on how many candidates get public money or how much. LAO says program costs could be significant for governments that create them.", "No neutral source states 'no statewide cap'; now attributed to opponents, with LAO's cost statement.")

# ---- Prop 5
fix("5", "does", "Recall ballots for state officers ask only whether to remove the official. If a governor is recalled, the Lieutenant Governor becomes governor. If the recall happens in the first two years of the term, before the next statewide nomination period closes, the Lieutenant Governor serves until voters elect a new governor at a future statewide election. Other recalled offices are filled under existing rules, usually a special election for legislators and a governor's appointment for other statewide offices.", "LAO wording replaces 'triggers a special election', which read as immediate.")
fix("5", "noE", "In 2003 there were 135 replacement candidates on the ballot, and the winner needed only the most votes.", "The 48.6% figure had only an independent source.")
fix("5", "money", "LAO says the net fiscal effect is unknown, could be savings or costs, and is under 0.1% of the General Fund.", "'Net cost' implied only costs.")
fix("5", "argFor", "Supporters' official argument says a replacement should not take office with a small fraction of the vote, and recalls should not be used to redo an election.", "Matches the argument's own wording.")
fix("5", "con", "Senate Minority Leader Brian Jones and Assemblymember Joe Patterson (official argument). CalMatters reports almost all legislative Republicans also opposed it.", "Independent claim now labeled.")
fix("5", "r.ev", "Only 11 state recalls have reached the ballot since 1913, nine of them of legislators, so there is little data either way.", "The 11 were not all statewide recalls.")
fix("5", "acct", "No new audit or reporting requirement was found in the official materials.", "Old text described enforcement mechanisms with no source.")

# ---- Prop 37
fix("37", "money", "LAO finds no direct state or local cost, and the bonds are repaid by homeowners, not the state. On an $800,000 home a buyer would put at least $24,000 down and could borrow up to $136,000 from the program (this tool's example, using the 3% minimum and 17% maximum).", "Example amounts are our arithmetic and are now labeled; 'townhome' removed.")
fix("37", "acct", "Supporters' official argument says it requires annual audits of the loans and the fund. An independent analysis (Hoover Institution) says program rules are exempt from normal state rulemaking. No target for homes or loans.", "Audit appears only in the argument; rulemaking exemption only in an independent source. Legal text not yet read.")
fix("37", "argAgainst", "No official argument against was filed. CalMatters lists Reform California and the League of Women Voters as opponents.", "Reasons attributed to opponents had no source.")
fix("37", "pro", "California Conference of Carpenters, Fiona Ma (CalHFA board), California State Commanders Veterans Council (official argument). CalMatters also lists the California Association of Realtors.", "Independent listing labeled.")
fix("37", "con", "No official argument against was filed. CalMatters lists Reform California and the League of Women Voters.", "Carl DeMaio link unsupported.")
fix("37", "risk", "Buyers carry a second loan of up to 17% of the price. More buying power could also push new-home prices up, a risk no official analysis addresses.", "Price effect is this tool's judgment, now marked as such.")
fix("37", "r.ac", "Supporters cite annual audits, but program rules are reported to skip normal rulemaking.", "Same as acct.")
fix("37", "r.ev", "No track record for this design was found in the official materials.", "PPIC modeling could not be located.")
fix("37", "r.nb", "No direct taxpayer cost and real help for some buyers. How many renters it would make able to buy is unknown.", "PPIC renter finding could not be verified.")

# ---- Prop 38
fix("38", "noE", "", "No source said the stem cell agency continues under a NO vote.")
fix("38", "acct", "Annual public reports, including progress toward research goals, and independent financial audits for the institute and the grant council. The health department reviews the institute's agreement every five years. No numeric research targets.", "Legal text requires progress and milestone reporting.")
fix("38", "argAgainst", "Opponents' official argument says borrowing is the wrong way to fund research, the benefits rarely flow back to the state treasury, and ballot measures should not steer research toward chosen topics.", "Matches the argument's wording.")
fix("38", "con", "Robert M. Kaplan (official argument). CalMatters also lists the League of Women Voters and several newspaper editorial boards.", "Independent listing labeled; Stanford affiliation not in the official argument.")
fix("38", "r.oc", "Spending and grants are measurable, and reports must describe progress, but there are no numeric research targets.", "Legal text requires progress reporting.")
fix("38", "r.ev", "No direct evidence on how well this kind of institute funding leads to treatments was found in the official materials.", "Old claim about past state research funding had no source in the audit.")
fix("38", "r.nb", "About $10 billion to $12 billion repaid over about 20 years, before inflation (this tool's arithmetic from LAO's yearly cost), against patient benefits that are likely years away.", "Total is our arithmetic; LAO states the total differently.")

# ---- Prop 39
fix("39", "out", "Every counted ballot tied to a government ID, with yearly public reports of the share of each county's voters whose citizenship is verified.", "Reporting covers the verified share, per the legal text.")
fix("39", "pro", "Californians for Voter ID (official argument). LAist also lists the Howard Jarvis Taxpayers Association and the California Republican Party.", "Independent listing labeled.")
fix("39", "con", "ACLU California Action, Common Cause, League of Women Voters of California (official argument).", "Printed signer name is Common Cause.")
fix("39", "risk", "The official summary says mail ballots without matching ID digits would not count, and the measure sets no notice or fix-it process. Opponents say valid ballots could be thrown out.", "Old text said the measure is silent; the Attorney General's summary says such ballots would not count.")
fix("39", "r.nb", "LAO projects net costs, and a national study found strict ID laws had no effect on fraud, actual or perceived. A possible gain in voter trust is unmeasured.", "States what the cited study found.")

# ---- Prop 40
fix("40", "does", "Taxes people worth $1 billion or more who lived in California on January 1, 2026 at 5% of their net worth, once, with a lower rate just above $1 billion. It can be paid over five years with a 7.5% yearly charge on the unpaid balance. Real estate, pensions and retirement accounts are generally excluded. After administrative costs, 90% goes to public health care and 10% to education and food assistance.", "Threshold and split corrected to the legal text.")
fix("40", "who", "A few hundred billionaires according to LAO (the supporters' argument says about 200), and public health care programs.", "Supporters say about 200, not 200 to 250; 'Medi-Cal' not named in the excerpts.")
fix("40", "pro", "SEIU-UHW (official argument). Wikipedia reports Sen. Bernie Sanders endorsed it.", "Planned Parenthood signer is a staff member; Democratic Party support not found; Sanders only independent.")
fix("40", "con", "California Medical Association, California Primary Care Association, California School Boards Association (official argument). Independent reports add Gov. Newsom. A committee funded largely by Sergey Brin backs Props 41 and 42 and opposes Prop 40.", "Independent items labeled.")
fix("40", "risk", "Court challenges are likely. LAO's analyses of Props 41 and 42 say courts could find that either one conflicts with Prop 40, so Prop 40 could be stopped if either gets more yes votes.", "The blocking effect is described in LAO's analyses of Props 41 and 42 (not of Prop 40) and rests on their conflict clauses.")
fix("40", "r.fc", "LAO says tens of billions. Hoover estimates about $40 billion and supporters claim about $100 billion.", "$100 billion is the supporters' claim.")
fix("40", "r.if", "A new kind of state tax that needs new valuation work.", "'First U.S. wealth tax of its kind' had no source.")
fix("40", "r.ev", "No precedent for this approach was found in the official materials.", "Narrowed to what was checked.")

# ---- Prop 41
fix("41", "does", "New state taxes enacted or taking effect on or after January 1, 2026 cannot be excluded from the state spending limit, or the state cannot collect them. The State Auditor reviews the programs a special tax proposed by citizen initiative would fund, while signatures are being gathered, and audits programs funded by new state special taxes every four years. If it gets more yes votes than another initiative on this ballot with a tax excluded from the spending limit, that whole measure is void.", "Pre-election review applies only to citizen-initiative special taxes; conflict clause added.")
fix("41", "acct", "Pre-election audits are posted online, summarized in the voter guide, and must recommend ways to save at least 10% a year. Programs are audited again every four years. Nothing in the measure requires anyone to adopt the recommendations.", "10% rule confirmed only for the pre-election audit.")
fix("41", "argAgainst", "Opponents' official argument says it is billionaire-funded and designed to undo the Prop 40 billionaire tax.", "'For health care' not in the captured argument.")
fix("41", "pro", "CalCPAs, CalAsian Chamber of Commerce, California Taxpayers Association, former State Auditor Tom Hayes, former State Controller Steve Westly (official listing). CalMatters also lists Reform California. Backed by Building a Better California, which news reports say Sergey Brin funds heavily.", "Official supporters added; independent items labeled.")
fix("41", "con", "SEIU-UHW, Sen. Bernie Sanders (official listing). News reports add the California Democratic Party.", "Independent item labeled.")
fix("41", "risk", "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. Counting new taxes under the spending limit could also trigger rebates under existing spending-limit rules, leaving less for other programs.", "'Automatic refunds' is not in LAO or the text; reworded as a possibility under existing rules.")
fix("41", "r.ac", "State Auditor reviews before elections, posted publicly, and audits every four years.", "Posting confirmed only for the pre-election audit.")

# ---- Prop 42
fix("42", "does", "Bans new state taxes on owning financial assets or other personal property, and new state taxes based on past conduct or past residency. The Legislature may pass a tax reaching back up to 365 days only during a declared disaster or fiscal emergency. Conflicting state taxes enacted on or after January 1, 2026 are void. If it gets more yes votes than a conflicting initiative on this ballot, that whole measure is void.", "Exception is narrower than 'emergency taxes'; conflict clause added. Legal text read from an independent copy; check against the official guide.")
fix("42", "argFor", "Supporters' official argument says it protects retirement and savings from new and retroactive taxes.", "'Money already taxed as income' not in the captured argument.")
fix("42", "argAgainst", "Opponents' official argument says it is billionaire-funded and designed to undo the Prop 40 billionaire tax.", "'Fund health care' not in the captured argument.")
fix("42", "pro", "California Professional Firefighters, State Building and Construction Trades Council, AMVETS Department of California, California Small Business Association, California Senior Alliance, Peace Officers Research Association of California (official listing and argument).", "Gov. Newsom's support not found in any source.")
fix("42", "risk", "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. Undefined terms, such as ownership or control, may invite lawsuits.", "No source found for a drafting cross-reference error.")
fix("42", "r.lr", "Scope questions, undefined terms, and possible blocking of Prop 40.", "Same as risk.")

# ---- Prop 43
fix("43", "does", "From January 1, 2027, new, increased or extended local special taxes need two-thirds voter approval even when citizens put them on the ballot, the same bar as those placed by city councils and boards. General taxes are not covered. It also bars citizen initiatives from adding local property taxes beyond what the state constitution already allows. News reports say it came from a deal that kept a broader anti-tax initiative off the ballot.", "Property tax clause added; ballot deal attributed to news reports.")
fix("43", "money", "No dollar estimate. LAO says local revenue could be lower. CalMatters reports that Sonoma County's 2024 half-cent sales tax for wildfire and emergency services passed with 62%, below two-thirds.", "Sonoma figure attributed; not yet confirmed with the county.")
fix("43", "out", "From 2027, citizen-proposed local special taxes, including renewals, need two-thirds approval, so fewer may pass.", "LAO says 'harder', not that fewer will pass.")
fix("43", "argAgainst", "Opponents' official argument and rebuttal say it cuts no taxes and lets just over one-third of voters block funding for fire, police, schools and roads.", "Matches the argument and rebuttal wording.")
fix("43", "con", "California Professional Firefighters, California Federation of Teachers, Nurse Alliance of SEIU California, California School Employees Association (official listing and argument). News reports add the California Democratic Party.", "CSAC and Gov. Newsom not found as opponents.")
fix("43", "r.ev", "Text and LAO are clear, and a reported local example shows the effect.", "LAO names no specific court case; local example is from news reporting.")

# ---- Prop 2
fix("2", "does", "Raises the rainy day fund's limit for required deposits from 10% to 20% of General Fund taxes, saves extra in big capital gains years, counts deposits against the state spending limit only when the money is withdrawn, and extends extra pension and retiree health debt payments from 2030 to 2040.", "LAO: deposits count toward the limit when withdrawn.")
fix("2", "acct", "No new audit or evaluator. The Department of Finance must report deposit estimates to the Legislature and each budget must include them. Deposits can still be suspended only in a budget emergency.", "Legal text adds reporting duties.")
fix("2", "con", "David Tangipa (Assembly Budget Committee vice chair), Steven Choi (Senate Elections and Constitutional Amendments Committee vice chair) and Carl DeMaio (Reform California), official argument.", "Signer titles corrected.")
fix("2", "risk", "Lawmakers can still suspend deposits or withdraw money in a budget emergency.", "The 2024-25 and 2025-26 suspensions could not be confirmed from an official source.")
fix("2", "r.ev", "The mechanics are clear in LAO and the text. Recent withdrawal amounts could not be confirmed from an official budget source.", "$12.2 billion figure not confirmed.")

# ---- Prop 3
fix("3", "does", "Removes the 2030 end date on the higher income tax rates for income over about $371,000 for single filers, adjusted yearly for inflation. Rates themselves do not change.", "Joint threshold, year and bracket count were not confirmed.")
fix("3", "yesE", "LAO estimates $5 billion to $15 billion a year from 2031 on, roughly 40% for schools and community colleges.", "LAO wording.")
fix("3", "money", "LAO estimates the rates keep $5 billion to $15 billion a year in state revenue. They apply only to income above about $371,000 for single filers, adjusted for inflation. No official per-filer example was found.", "The $1,830 example rested on unverified bracket breakpoints and was removed.")
fix("3", "who", "About the top 2% of filers, public schools and community colleges, and other state programs including health care.", "'Medi-Cal patients' overstated LAO.")
fix("3", "pro", "California Teachers Association, California School Nurses Organization, Planned Parenthood Affiliates of California (official argument), California State PTA.", "California Medical Association not found in any source.")
fix("3", "con", "California Taxpayers Association, Family Business Association of California, California Hispanic Chambers of Commerce (official argument), Howard Jarvis Taxpayers Association (rebuttal).", "Reform California not found in any source.")
fix("3", "r.ev", "More than a decade of revenue data on these rates, since 2012.", "'Thirteen years' miscounted and 'studies' were not checked.")
fix("3", "r.nb", "Keeps $5 billion to $15 billion a year, about 40% for schools and colleges, but no link to student results is established.", "'For schools and health' overstated.")

# ---- Prop 44
fix("44", "who", "Community health centers that served about 5.3 million patients in 2022, most with low incomes, according to their national association.", "Only source is the National Association of Community Health Centers; official HRSA page could not be read.")
fix("44", "out", "Clinics spend at least 90% of revenue on program services or pay the gap as a penalty, refundable if they comply within five years.", "Penalty is held in escrow for five years.")
fix("44", "risk", "LAO says some clinics that could not meet the requirement might close.", "LAO does not say clinics would cut services; that is the opponents' claim.")
fix("44", "r.ac", "Required reporting and penalties, with audits, patient lawsuits and criminal charges authorized.", "Audits and suits are allowed, not required.")
fix("44", "pro", "The official argument is signed by the initiative proponent and a community clinic worker. SEIU-UHW is the committee contact in the official guide and is named as the main proponent in news reports.", "No organization signed the argument.")
fix("44", "con", "California Medical Association, American Academy of Pediatrics California (official argument). News reports add the California Primary Care Association, Planned Parenthood Affiliates of California, and the Democratic and Republican parties.", "Independent items labeled.")

# ---- Prop 45
fix("45", "does", "Nine project types (housing, water, clean energy, health facilities, fire and police stations, wildfire risk reduction, broadband, education facilities, transportation) can opt into a faster environmental review (CEQA) with firm deadlines. Lawsuits must be filed within 30 days and decided within 270 days including appeals. Courts may add up to 90 days, and longer only if all parties agree. Courts can pause only the flawed part of a project.", "Extension rule and LAO's category name.")
fix("45", "noE", "This includes CEQA exemptions the Legislature passed in 2025.", "The count of ten came from one law firm alert.")
fix("45", "risk", "Narrower review, including fewer alternatives considered and consultation only with federally recognized tribes.", "Qualification disputes had no source; alternatives limit is in the official summary.")
fix("45", "unk", "How many projects opt in and whether housing gets built faster. There is no neutral figure for how long CEQA lawsuits take today. A Holland & Knight study led by Jennifer Hernandez, who HousingWire reports helped write the measure, puts it at four to five years.", "Source wording and attribution.")
fix("45", "r.lr", "Narrower review and consultation only with federally recognized tribes.", "Qualification disputes had no source.")
fix("45", "r.nb", "Faster approvals at a public cost LAO puts in the high tens of millions a year. Housing gains and environmental trade-offs both unmeasured.", "'Modest' conflicted with LAO's estimate.")
fix("45", "pro", "California Water Association, California Children's Hospital Association (official argument). News reports add the California Chamber of Commerce (sponsor), the California Hospital Association and the California Republican Party.", "Official signers separated from news-reported supporters.")
fix("45", "con", "Coalition for Clean Air, Clean Water Action, California Environmental Voters (official argument). News reports add the California Labor Federation, Sierra Club California, the League of Women Voters and the California Democratic Party.", "None of the previously listed opponents signed the official argument.")
