# Stage 1 brief (read-only audit), October 24, 2026

The site: California Bay Area Ballot Guide, repo at /home/claude/site.
- Statewide proposition facts live in `propositions.html`, in the `PROPS` array starting near line 458. Each has fields such as name, does, yesE, noE, money, risk, acct, sup, opp, ratings `u` and reasons `r`.
- They are copied into `data/2026-11-03/statewide.json`.
- Claim-level evidence rows are in `data/evidence-claims.json`.
- Candidates are in `data/2026-11-03/candidates.json` and contests in `data/2026-11-03/contests.json`.
- Earlier audit logs are in `audit/2026-10-22/` and `audit/2026-10-23/`.

## Rules

- **Read only.** Do not edit any file in the repository except your own report in `audit/2026-10-24/stage1/`. Do not commit.
- **Official sources first.** Use the California Secretary of State's Official Voter Information Guide for the November 3, 2026 General Election (https://voterguide.sos.ca.gov/), its PDF parts on vig.cdn.sos.ca.gov, and https://www.sos.ca.gov/elections. Use the LAO only where the guide reproduces or links its analysis.
- **Quote exactly.** For every discrepancy, quote the site's current text, then quote the official text with its URL and location (page or section). Read numbers, dates and names twice. If a page cannot be fetched, say so and do not guess.
- **Scope of a discrepancy.** A discrepancy is a factual mismatch: wrong number, title, date, name, office, threshold or effect, or a claim the official text contradicts or does not support. Differences in plain-English wording that keep the meaning are not discrepancies; list them only if they could mislead.
- **Ratings are out of scope.** Never propose changes to ratings, weights or scores. If a rating's written reason conflicts with the official text, note it as "rationale conflict" for the owner.
- **No inferred positions.** Never infer a candidate's position from party, endorsements or other indirect evidence.
- **Image licensing.** Do not download, copy or rehost any image. Only find where images are published and what the reuse terms say. Quote the terms with their URL.
- **Report format.** Write Markdown: a summary table first, then details. For each item give a proposed correction with its exact replacement text, or "no change", and a confidence level (high, medium or low).
