# Candidate quote research brief (October 30, 2026)

You are collecting **direct quotations** from candidates in the November 3, 2026 California general election, for a nonpartisan voter guide. The guide shows, for each race, a table with one row per issue and one column per candidate. Each cell is an exact quote with a linked source, or "No public statement found in our sources."

Accuracy beats coverage. An empty cell is fine. An invented, paraphrased or misattributed quote is a serious failure.

## Rules

1. **Exact words only.** Copy the candidate's own words verbatim, character for character, as they appear on the page. Do not fix typos, shorten mid-sentence, merge sentences from different places, or add words. You may quote one to three consecutive sentences. Keep the original punctuation and capitalization. Straight vs curly quotes may differ; that is fine.
2. **The candidate's own words.** Use text the candidate wrote or said: an official candidate statement, the candidate's own campaign website, a questionnaire the candidate answered, or a direct quote of the candidate in a news article or forum write-up. Campaign-website text written in third person ("Becerra will ...") counts as the campaign's own words; mark it sourceType "campaign".
3. **Never use:** endorsements, party or interest-group descriptions, opponents' descriptions, a reporter's paraphrase, polls, social-media summaries, or anything you wrote yourself.
4. **Source order** (prefer the higher one when both exist): official California Secretary of State or county voter guide statement > the candidate's campaign website (issues/priorities page) > the candidate's answers to a published questionnaire (League of Women Voters, Ballotpedia Candidate Connection, news outlet Q&A) > a direct quote in reputable local news or a forum write-up.
5. **One quote per candidate per issue.** Pick the clearest statement of what the candidate says they will do or believes on that issue. Prefer the most recent and most specific. If nothing fits the issue, leave it out; do not stretch a quote to fit.
6. **Same effort for every candidate in a race.** Look for each candidate on every issue. Do not stop after the leading candidates.
7. **How to read pages.** Find pages with WebSearch, then read them with WebFetch. When you call WebFetch, ask it to return the exact verbatim sentences (for example: "Return, verbatim and unedited, every sentence on this page about housing, homelessness, public safety ..."). If WebFetch says it cannot quote verbatim, or the text looks paraphrased, do not use it. Record the exact page URL you fetched (not a search result URL).
8. **Dates.** Record the publication date shown on the page if there is one (YYYY-MM-DD). Otherwise record the date you read it as "accessed" with today's date, 2026-10-30.
9. **Campaign website.** For each candidate, also record the official campaign website URL if you can confirm it is the candidate's own site (it names the candidate and the office). Do not guess URLs.

## Issue lists (use these exact issue ids)

- Governor: cost-of-living, budget-taxes, housing-homelessness, accountability, climate-water-wildfire, immigration, public-safety, health-care
- Lieutenant Governor: cost-of-living-jobs, higher-education, coast-lands-climate, accountability, housing
- Attorney General: public-safety, consumer-protection, immigration-law, environmental-enforcement, civil-rights, accountability
- Secretary of State: election-security, voter-access, voter-id-rolls, campaign-finance, accountability
- Controller: audits-waste, budget-oversight, spending-transparency, pensions-debt
- Treasurer: debt-bonds, housing-finance, pensions-investments, accountability
- Insurance Commissioner: home-insurance-wildfire, insurance-rates, consumer-protection, climate-risk, accountability
- Superintendent of Public Instruction: reading-math, school-funding, teacher-shortage, school-safety, school-choice, accountability
- US House: cost-of-living-economy, federal-budget-taxes, health-care, immigration, public-safety, climate-energy, housing, accountability
- Mayor, City Council, Board of Supervisors: homelessness, housing, public-safety, city-budget, cost-of-living-economy, streets-transit-clean, accountability

"accountability" means what the candidate says about delivering results, transparency, ethics, or how they will be held responsible.

## Output

Write one JSON file to the path you are given:

```json
{
  "group": "<name>",
  "candidates": [
    { "id": "<candidate id from the roster>", "name": "...", "campaignUrl": "https://... or null", "notes": "anything worth knowing, e.g. no campaign site found" }
  ],
  "quotes": [
    {
      "candidate": "<candidate id>",
      "contest": "<contest id>",
      "issue": "<issue id>",
      "quote": "<exact words>",
      "sourceTitle": "<page title, e.g. 'Campaign website, Housing'>",
      "sourceUrl": "https://...",
      "sourceDate": "YYYY-MM-DD",
      "dateKind": "published" or "accessed",
      "sourceType": "official-statement" | "campaign" | "questionnaire" | "news"
    }
  ]
}
```

Only include issues that apply to the candidate's office. Validate that the file is valid JSON before you finish. In your final reply, give counts (candidates, quotes, candidates with no sources found) and list any sources you were unsure about.

## Added October 30, 2026
- Every quote will be re-opened in a browser and matched word for word against its page. Quotes that do not match are dropped. So copy exactly, prefer quotes you could see in full, and never join pieces.
- A single sentence is best. Do not reuse one sentence for two issues.
- Do not use automatic or computer-generated transcripts (for example podcast or radio auto-transcripts).
- For US House: prefer the candidate's campaign website issues page, then House.gov pages written in the incumbent's own voice (press releases quoting the member), then questionnaires and news quotes. Do not use votes or bill summaries as quotes.
