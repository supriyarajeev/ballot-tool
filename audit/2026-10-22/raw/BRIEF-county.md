# Local measure audit and reconciliation brief

Read RULES.md in this folder first.

Your county's current records are in measures-<county-id>.json in this folder. Most have only a letter, a jurisdiction and sometimes a short title from the county's official list (status "incomplete").

Tasks, in priority order:
1. **Confirm each record.** Re-read the county's official measure list (URL in each record's sources). Confirm letter, jurisdiction and title exactly. Report any mismatch.
2. **Collect official details for each measure, only from official sources:**
   - the exact ballot question/ballot label (verbatim);
   - the measure type (tax, bond, charter amendment, ordinance, initiative, advisory);
   - the vote threshold, only if an official document states it (impartial analysis, resolution, ballot label);
   - the impartial analysis or digest;
   - any fiscal or tax-rate statement and duration;
   - whether official arguments for/against were filed;
   - the URLs of each document.

   Look at county measure detail pages, the county's sample ballot/voter information pamphlet if it is HTML or text PDF, city clerk election pages, city council agenda resolutions calling the election, and school/college/special district board resolutions. Record a "plainEnglish" one or two sentence description ONLY if an official ballot question or analysis supports every word. Otherwise leave it null. Do not summarize from a title alone.
3. **Reconcile.**
   - For every incorporated city in the county, check the city clerk or city election page for Nov 3, 2026 measures, where reachable. Report measures the county list lacks, and county-list measures the city does not show.
   - For districts on the list, check the district site when practical.
   - Note any multi-county district measure that this county's voters will see but that another county administers.
   - Record each page checked, with its result.
4. Do not spend more than about 60 fetches. If you run short, prioritize ballot questions for tax, bond and charter measures, then reconciliation.

Output file: county-<county-id>.json:
{
 "county": "ca-...",
 "listUrl": "...", "listRecheck": {"matched": true, "notes": "..."},
 "measures": [
   {"id": "<our record id>", "identifierOK": true, "jurisdictionOK": true, "titleOK": true, "titleOnList": "<verbatim>",
    "ballotQuestion": {"text": "<verbatim or null>", "url": "...", "location": null, "readingsMatched": true},
    "measureType": {"value": "...", "evidence": "<verbatim excerpt>", "url": "..."},
    "threshold": {"value": "majority|55%|two-thirds|null", "evidence": "<verbatim excerpt stating it>", "url": "..."},
    "fiscal": {"text": "<verbatim, e.g. rate and duration>", "url": "..."},
    "impartialAnalysisUrl": null, "argumentsFiled": {"for": null, "against": null, "url": null},
    "plainEnglish": "<only if fully supported, else null>",
    "otherSources": [{"url": "...", "title": "...", "access": "read|partial|failed", "notes": "..."}],
    "remainingGaps": ["..."]}
 ],
 "reconciliation": [{"jurisdiction": "City of X", "pageChecked": "url", "result": "matches|extra measure found|no measures listed|not reachable", "details": "..."}],
 "missingMeasures": [{"letter": "...", "jurisdiction": "...", "title": "...", "source": "url", "excerpt": "..."}],
 "blockers": ["..."]
}
In your final message give: counts (records confirmed, ballot questions found, thresholds found), any mismatches or missing measures, and blockers, in no more than 20 lines.
