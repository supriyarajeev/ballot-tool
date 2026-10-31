# Candidate comparisons audit (October 31, 2026)

## Result

| Measure | Count |
|---|---|
| Contests compared | 54 (8 statewide, 14 US House, 32 city) |
| Candidates in those contests | 150 |
| Candidates with at least one quote | 125 |
| Issue cells | 1,052 |
| Cells with a quote | 443 |
| Cells marked "No public statement found in our sources." | 609 |

Quotes by source type are 157 campaign website, 139 questionnaire, 104 official candidate statement and 43 news report.

## Pipeline counts

| Step | Count |
|---|---|
| Quotes researched (11 research files) | 650 |
| Matched on the source page in a browser | 610 (408 exact, 182 quote marks or spacing only, 15 PDF spacing, 5 PDF line numbers) |
| Not found on the page, or page unreadable | 36 |
| Source page could not be opened for the check | 4 |
| Kept out after matching (exclusions.json) | 120 entries, mostly the issue fit and readability pass (117 flags) |
| Contests researched but not shown, no quote passed | 11 |
| Published | 443 |

Every published quote carries its check date and method in the data. Matching was done by script in Claude in Chrome against the page text (pdf.js 4.4.168 for PDFs). Raw results are in research/2026-10-31/web-checks.json, web-checks2.json and web-checks3.json.

## Links checked in a browser on October 31

- Campaign websites. 82 entries opened, 79 loaded on the same site and named the candidate, 3 refused the check and are not linked. See site-checks.json.
- Campaign money links. Cal-Access Power Search, San Francisco Ethics, Oakland PEC, San Jose campaign reports, the Secretary of State list of city filing sites, and FEC pages for 14 districts. All loaded. See finance-checks.json.

## Tests

`npm test` on October 31, 2026, exit 0. Validator self-test 215 passed. Guide browser 657 passed. Weighing tool browser 688 passed. Goatcounter stand-in 124 passed. Three-choice 27. Weights 25. Data validation 0 errors. Static HTML validation passed. Log in npm-test.log.

## Known limits

- Coverage is uneven. Some candidates publish little, and some pages could not be read.
- The issue fit and readability pass was one automated reviewer applying one written standard to every candidate. It is this project's own and not reviewed by any outside organization.
- School board, water district and open space races list candidates and official links only.
