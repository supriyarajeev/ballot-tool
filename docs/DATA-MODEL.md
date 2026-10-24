# Data model

All content is static JSON under `data/`, served by GitHub Pages. The app (`assets/guide.js`) reads it in the browser. No backend, database or API key.

```
data/
  elections.json            one entry per election; never delete past ones, set status "past"
  jurisdictions.json        state, counties, cities, districts (shared across elections)
  2026-11-03/
    statewide.json          generated from propositions.html (do not hand-edit)
    local-measures.json     county, city, school and special district measures
    contests.json           candidate contests
    candidates.json         candidate profiles
```

A new election gets its own folder (for example `data/2028-03-07/`) and a new entry in `elections.json`. Older folders stay as history.

## Statuses (every measure, contest and candidate)

Public labels are fixed and tested. The guide shows exactly these words.

| status | public label | meaning |
|---|---|---|
| `verified` | Verified | Checked against appropriate evidence, and the source supports it. The jurisdiction and election match, and the review criteria below are met. |
| `needs-review` | Needs review | Evidence exists, but an ambiguity, contradiction, interpretation or required review is still open. |
| `incomplete` | Incomplete (required info or evidence is missing) | Required information or evidence is missing. `gaps` must list exactly what is missing. |
| `source-unavailable` | Source unavailable | A documented retrieval process could not obtain the source. |
| `not-researched` | Not yet researched | Research has not been done. |
| `not-applicable` | Not applicable | Authoritative evidence shows the item does not apply. Needs `notes` and a source. |
| `archived` | Archived | No longer current. Kept for history. |
| `superseded` | Superseded | Replaced by a newer record, named in `supersededBy`. Kept for history. |

Every record has `lastVerified` (the date it was last checked, YYYY-MM-DD) and `sources` (label, https url, type). Unless a record is verified, it also has `notes` or `gaps` explaining what is missing. Generic gaps such as "Human review against the official voter guide" are rejected by the validator.

### When a record may be Verified

1. A named person reviewed every published field against the official source and the claim-level excerpts. `review.reviewer` and `review.date` record this.
2. A straightforward field may instead be verified by a reproducible automated check. That check must compare it by script with a stored, checksummed copy of an official machine-readable or text document, for example a candidate name against the certified list. No such check exists yet.
3. Ambiguous, conflicting, interpretive or consequential claims always need a person. That covers legal effect, money, thresholds and eligibility.

Automated validation (`tools/validate.mjs`) checks structure. It never establishes facts. An automated reader's excerpt is evidence for a reviewer, not verification.

## jurisdictions.json

```json
{ "id": "ca-alameda", "name": "Alameda County", "type": "county", "parent": "ca",
  "electionsUrl": "https://...", "lookupUrl": "https://...", "lookupLabel": "voter information lookup",
  "region": "bay-area", "participates2026": "yes", "electionAuthority": "...",
  "coverage": { "status": "pilot", "note": "...", "listComplete": false },
  "inventory": { "measures": "collected", "contests": "partial", "candidates": "partial", "districts": "not-collected", "lastChecked": "2026-10-22" } }
```

`coverage.status` is `pilot` (some content researched), `list-only` (official list collected) or `not-started`. Each `inventory` field is `not-collected`, `partial`, `collected` (from an official list, not cross-checked), `reconciled` (cross-checked with city and district records) or `none-found-confirmed` (needs a source). Unknown is never written as zero.

Types: `state`, `state-district`, `region` (multi-county, with `counties`), `county`, `city`, `supervisor-district`, `council-district` (parent is a city), `school-district`, `community-college-district`, `special-district`.

A district that crosses county lines keeps one record, with `parent` set to its home county and `counties` listing every county the official lists name.

Districts may list `areas` (city ids they serve, used only to hide clearly irrelevant districts) and are always shown as "may apply", because district lines do not follow city lines. `state-district` records may list `counties`. With `countiesKnown: true` the list is exact, as for the Board of Equalization districts. Otherwise it lists only the counties checked so far, as for congressional and legislative districts, and the district shows as "may apply" there.

State districts that split a county list it in `partialCounties` as well as `counties` (only with `countiesKnown: true`). In those counties the district shows as "may apply", because only part of the county is inside it. The Board of Equalization District 1 and 4 records list San Bernardino County this way.

### County fields added on October 23, 2026

- `cityInventory`: `{ status, count, source, checked, note }`. `status` is `complete` (every incorporated city and town from the source is recorded, and `count` must equal the city records), `partial` or `not-collected`. The source is the MTC/ABAG census page for the nine Bay Area counties.
- `unincorporated`: `{ listed, source }`. When `listed` is true, the city menu offers "Unincorporated area" for that county. Every Bay Area county has this field.
- `consolidatedCity`: San Francisco is one city and county, so `ca-sf` names `ca-sf-city`. City-level items show on the county ballot, and the city menu has one option, already selected.

## region.json

`data/region.json` names the nine Bay Area counties and the regional counts (9 counties, 101 cities and towns), each with the publisher's exact wording, URL and retrieval date. The validator checks the counties against the jurisdiction data and `municipalityCount` against the number of city records. These counts describe the region; they are not a measure of the guide's coverage, which is computed from the records.

## Contest ids

A contest id starts with the election id and then its jurisdiction id, for example `2026-11-03.ca-alameda-berkeley.city-auditor`. The validator rejects an id that does not match its jurisdiction. `seats` is `null` when not known.

IDs are stable and lowercase: `ca`, `ca-alameda`, `ca-alameda-fremont`, `ca-alameda-sd-fremont-unified`.

## Measures (statewide.json, local-measures.json)

Required: `id`, `election`, `jurisdiction`, `level` (state, county, city, school, community-college, special), `identifier` ("Measure A"), `officialTitle` or `shortTitle`, `status`, `lastVerified`, `sources`.
Official facts, recorded only with an official excerpt in the evidence ledger:
- `ballotQuestion`, the exact wording;
- `measureType`;
- `threshold`, which is never inferred from the measure type.
Content fields, all optional until researched: `plainEnglish`, `why`, `yes`, `no`, `benefits`, `risks`, `affected`, `fiscal`, `evidence`, `uncertain`, `argFor`, `argAgainst`, `supporters`, `opponents`, `threshold`, `notes`, `gaps`.
Verified measures must have `plainEnglish`, `yes` and `no`. Missing fields show as "Not yet researched", never as blank.

ID pattern: `<election>.<jurisdiction>.<slug>`, for example `2026-11-03.ca-alameda.measure-a`.

## Contests and candidates

Contest: `id`, `election`, `jurisdiction`, `office`, `district`, `seats` (optional), `candidates` (candidate ids in the official source's order), `status`, `lastVerified`, `sources`.
Candidate: `id`, `name`, `contest`, `party` (as listed), `designation` (ballot designation), `statementUrl`, `financeUrl`, `qualifications`, `positions`, `publicRecord`, `status`, `lastVerified`, `sources`.

Candidates are never scored, ranked or recommended. Candidate statements are labeled as the candidate's own claims.

## Review files

- `data/statewide-review.json` holds each proposition's specific open questions. `tools/extract-statewide.mjs` merges them into `gaps`.
- `data/source-access.json` records retrieval attempts and the alternative official document for each source that could not be fully read.
- `audit/<date>/` keeps the raw audit outputs and the scripts that applied them, as history.
- County records carry `inventory.reconciliation`, which shows how many city and district pages were cross-checked and how many could be reached.

## Evidence ledger and source register

`tools/build-ledger.mjs` writes `data/sources.json` (one record per source URL, with publisher, type, retrieval date and access status) and `data/evidence.json`. Evidence records come in two kinds:

- **`claim` records**, from `data/evidence-claims.json`. Each holds:
  - the claim;
  - its verdict: supported, partly-supported, unsupported, attribution or not-found;
  - whether it is interpretive;
  - the source: id, URL, title and publisher, plus whether it is primary;
  - the document date and retrieval date;
  - the exact excerpt and its location;
  - how the excerpt was captured, and whether two readings matched;
  - an explanation and its limitations;
  - review status, reviewer and date.
- **`record` links**, with verdict `link-only`. They cover any published field that has no claim record yet. `tools/validate.mjs` fails if a published field has no evidence record. `tools/report.mjs` turns all of this into the audit documents in `docs/`.

## The evaluation framework

The 14 statewide propositions keep their full evidence ratings and weighing tool in `propositions.html`. `tools/extract-statewide.mjs` copies their facts into `data/2026-11-03/statewide.json` so the guide and the tool never drift apart. Local measures do not get evidence scores until they have been rated with the same rubric.
