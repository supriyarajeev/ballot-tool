# Proposed corrections to the statewide proposition text, from Fix D after the Oct 23, 2026 evidence audit (audit/reports/evidence-audit.md).
# NOT APPLIED. The integration lead decides and applies them to propositions.html (same format as audit/2026-10-22/statewide_corrections.py,
# so audit/2026-10-22/apply_statewide.py can apply it once its input path is pointed here).
# Each entry: (prop, field, new_text, reason). Field "r.xx" is a rating reason; ratings themselves are unchanged.
# new_text None means "keep the current text"; such entries only record a decision.
# Excerpts below were captured on Oct 23, 2026 with WebFetch verbatim-quote requests (an automated reader); they still need a word-for-word human check.
C = []
def fix(n, field, new, why): C.append((n, field, new, why))

# ---- Prop 41 (EVD-08)
fix("41", "does", None,
    "Keep. The official legal text, Article XXIV, Section 3(b), says the state shall not impose, collect, or enforce 'any state tax that is enacted or takes effect "
    "on or after January 1, 2026' if it is excluded from the spending limit; Section 3(a) uses the same date wording. Read twice on Oct 23, 2026 "
    "(https://vig.cdn.sos.ca.gov/2026/general/pdf/prop41-text-proposed-laws.pdf, and the GrowSF copy). The Attorney General summary and the official guide page "
    "say 'enacted after January 1, 2026' (https://voterguide.sos.ca.gov/propositions/41/index.htm); the page follows the legal text. Evidence rows evc-prop41-does-1, evc-prop41-does-4, evc-prop41-ag-date.")

# ---- Prop 3 (EVD-09)
fix("3", "does",
    "Makes permanent the higher income tax rates on income over about $371,000 for single filers, adjusted yearly for inflation. The rates now apply through 2030 and are set to expire in 2031. Rates themselves do not change.",
    "The page said 'Removes the 2030 end date' here and 'expiring in 2031' in YES and NO. Both dates are official. LAO, prop3-title-summ-analysis.pdf page 26: "
    "'In 2016, voters approved Proposition 55 to extend these higher rates until 2030.' Page 27 and the Attorney General summary: 'expire in 2031' and "
    "'currently set to expire in 2031.' The legal text applies the rates to tax years 'before January 1, 2031' (evc-prop3-does-3). One sentence now gives both. "
    "When applied, update the claim text of evc-prop3-does-1 to -4 to the new wording.")
fix("3", "ask", None, "Keep. 'After 2030' matches LAO Figure 1 ('After 2030, if This Proposal Is ...') and the tax-year wording.")

# ---- Prop 4 (EVD-10)
fix("4", "does", None,
    "Keep. 'The 1988 ban' rests on the Assembly Committee on Elections analysis of SB 42 (https://aelc.assembly.ca.gov/media/2586), committee comment 2: "
    "'In 1988, voters approved two separate initiatives that sought to regulate campaign financing' and 'Proposition 73 prohibited public funding of campaigns and set "
    "contribution limits for state and local elections'. No SOS or LAO 2026 document states the year. Ledger row added (evc-prop4-does-4). If an official 2026 source is "
    "preferred, a fallback is 'Repeals the state ban on public campaign funding, so ...'.")
fix("4", "yesE", None,
    "Keep the text, but correct the Oct 22 log reason (correction 7 credited LAO). The party and incumbency rule is in the final legal text, Government Code 85300(g): "
    "'Public funding statutes, charters, ordinances, and resolutions shall not discriminate based on party or according to whether a candidate is a challenger or an incumbent.' "
    "Broad support and spending limits are in 85300(e)(7)(A) and (b). Read twice from https://vig.cdn.sos.ca.gov/2026/general/pdf/prop4-text-proposed-laws.pdf. Ledger row evc-prop4-yesE-3.")

# ---- Prop 44 (EVD-11)
fix("44", "money",
    "A $50 million clinic at 80% would owe $5 million that year (this tool's example, using the 90% rule). LAO estimates state enforcement costs of low tens of millions of dollars a year, covered by fees on clinics.",
    "The example is this tool's arithmetic and is now labeled like the Prop 37 example. LAO: 'The penalty would equal the amount of spending needed to reach the 90 percent minimum.' "
    "(90% minus 80%) times $50 million is $5 million. Ledger row evc-prop44-money-1.")

# ---- Prop 39 (EVD-03, rating reason only; the rating itself is the owner's decision)
fix("39", "r.oc",
    "Required yearly reporting of citizenship-verified shares. Which IDs count is left for the Legislature to define.",
    "'Clear ID rule' was this tool's judgment and conflicts with LAO, prop39.pdf page 50: 'The Legislature would need to clarify several details that are not defined "
    "in the proposition, like which forms of identification could be used'. Read twice. Ledger row evc-prop39-r-oc-1 quotes it; when this is applied, add the LAO passage as its own supported row for the new wording. The score (oc: 4) was not changed; see fix-D-summary.md.")
