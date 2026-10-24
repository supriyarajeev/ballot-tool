# Candidate and contest audit brief

Read RULES.md in this folder first. The current data is in candidates-current.json (contests and candidates).

Published candidate fields are: name, party (partisan offices only), designation (ballot designation), incumbent (true only where we mark it), statementUrl and statementNote, and financeUrl. Contests have office, district, seats and the candidate order. We never publish positions, scores or endorsements. Do not add any.

Tasks:
1. **Statewide offices and Board of Equalization (12 contests).**
   - Re-read the Secretary of State certified list, https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf. Confirm each name, party, designation and order exactly, and how the list marks incumbents.
   - Check https://voterguide.sos.ca.gov/candidates/ and its sub-pages for which statewide candidates have candidate statements. The statement URLs must be exact. Our statementNote says "No candidate statement ... appears in the official state voter guide" for some candidates, and you must confirm or refute each one.
   - Note that statements for Board of Equalization, congressional and legislative candidates may be in county guides, not the state guide.
2. **Congressional, State Senate and Assembly contests (14).** Re-read the same certified list and confirm each contest. Also confirm, from an official county source, which of these districts appear on Alameda County ballots and on San Francisco ballots.
3. **San Francisco local contests (11).**
   - Re-read https://www.sf.gov/candidates-november-3-2026-general-election. Confirm the names, the order, and the seat counts (Board of Education and Community College Board "3 seats").
   - Look for an official SF source that gives ballot designations, such as a candidate list PDF or the SF voter information pamphlet if it is posted. Record designations only if an official document shows them.
   - Resolve whether each candidate is "qualified" or "filed".
4. **Oakland, Berkeley and Hayward contests.**
   - Re-read each city clerk source in the data.
   - For Berkeley, try to resolve exactly which designation goes with which name. Look for another official Berkeley or Alameda County document that pairs them. If you can't resolve it, say so.
   - For Oakland Unified School District board districts, find an official source (the Oakland city clerk, OUSD, or the Alameda County registrar) that states which candidates run in which district. Our data currently leaves these contests out.
5. **Alameda County roster.**
   - Look for any readable official county roster, such as a "Candidate list" PDF on acvote.alamedacountyca.gov, a sample ballot or a certified list of local candidates.
   - Look for official rosters of other Alameda cities and districts: Fremont, Alameda, Albany, Dublin, Emeryville, Livermore, Newark, Piedmont, Pleasanton, San Leandro, Union City, AC Transit, BART, EBMUD, the Peralta and Chabot-Las Positas college districts, and school districts.
   - Capture contest, seats, names and designations exactly, with the URL.
6. **Incumbency.** Report incumbency only where an official source marks it.

Output: candidates-audit.json
{
 "contests": [{"id": "<our id or NEW>", "office": "...", "district": "...", "seats": null, "source": "url", "rosterMatches": true, "differences": "...",
   "candidates": [{"id": "<our id or NEW>", "name": "<verbatim>", "party": null, "designation": "<verbatim or null>", "incumbentMarked": false, "statementUrl": null, "statementEvidence": "...", "notes": ""}],
   "excerpt": "<short verbatim excerpt from the roster>", "readingsMatched": true}],
 "newContests": [ same shape, for contests we do not have yet, with jurisdiction described in words ],
 "unresolved": ["..."],
 "sourcesChecked": [{"url": "...", "access": "read|partial|failed", "notes": "..."}]
}
In your final message, list in no more than 25 lines: any differences from our data, new contests found (with counts), and what remains unresolved.
