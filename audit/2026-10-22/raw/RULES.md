# Evidence rules for every audit agent (read fully before starting)

Context: a nonpartisan static voter guide for the November 3, 2026 California General Election. Today is Oct 22-23, 2026. You are auditing published content against official sources. Your output is a JSON file; another person will apply corrections. Accuracy matters more than coverage.

Tools: use WebFetch and WebSearch only. The shell cannot reach the web (curl/wget are blocked), so do not try. WebFetch passes pages through a reader model, so when you need wording, ask it explicitly to "quote verbatim, character for character, the sentence(s) that ..." and say in your output that excerpts were captured through that reader (field excerptMethod: "WebFetch verbatim-quote request"). Fetch the same passage twice when a number, date, percentage, threshold or negation matters, and record whether both readings matched.

Hard rules
1. Never invent a quotation, page number, section number, date, URL, amount, name, or reviewer. If you did not see it in fetched content, it does not go in the file.
2. An excerpt must be text the source returned, not a paraphrase. Keep excerpts short (one to three sentences) and only what supports or refutes the claim.
3. Location: give the section heading, page number or table name only if the fetched content showed it. Otherwise null.
4. A URL that opens is not support. A claim is "supported" only if an excerpt states it (or it follows directly and you explain how).
5. Mark interpretations or syntheses (for example "no target for homes built") as interpretive: true and give the underlying excerpts.
6. Never infer a vote threshold from measure type. Record a threshold only if an official document states it.
7. Never infer candidate positions from party, profession or endorsements.
8. If a source cannot be read (scanned PDF, blocked, 404), record the attempts and the exact error text, and look for another official source (city clerk, district board agenda/resolution, county impartial analysis page, SOS) before giving up.
9. Official sources first: CA Secretary of State, LAO, county registrar, city clerk, district board documents. Independent sources (news, League of Women Voters, Ballotpedia) may be listed only as independent and never as the sole support for a fact.
10. Do not write anything persuasive. No recommendations.
11. Write valid JSON (UTF-8). Validate it by running: python3 -m json.tool <file> > /dev/null
12. Use plain text in proposed corrections: short sentences, no em dashes, no colons inside sentences where avoidable, same tone as the existing text, and never longer than needed.

Verdict values for a field: "supported", "partly-supported" (some part not confirmed or imprecise), "unsupported" (source contradicts it), "not-found" (could not find evidence either way), "attribution" (field reports what a campaign or person says; verify that they said it).
