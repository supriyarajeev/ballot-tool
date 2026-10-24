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

**Where labels appear (beta, from October 23, 2026).** Each record's own page shows its label and, for any status other than Verified, an explanation with the record's gaps. Lists leave out the badge only for `needs-review`:
- ballot overviews;
- the contest list;
- the statewide list;
- candidate cards.

During the beta every record is either `needs-review` or `incomplete`, so that badge carried no information in a list. The beta notice and the About page explain it once. Every other label, including Incomplete, still shows in lists. The status in the data is unchanged. This is done in `listBadge()` in `assets/guide.js`, and the browser tests check it.

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

### region.json glance (added for the beta)

`glance` holds the dated official figures for "The region at a glance" on the home page:
- `population`, from the California Department of Finance E-1 estimates for January 1, 2026 (provisional);
- `registration`, from the Secretary of State's Report of Registration as of September 4, 2026. It also holds `eligibleByCounty`;
- `californiaCounties`, the 58 counties on the Secretary of State's county elections office list.

Each figure has `publisher`, `title`, `url`, `retrieved` and, where it applies, `asOf`. `byCounty` lists exactly the nine region counties. The guide adds them to get the Bay Area total and shows the date; it never stores a hand-made total. The validator checks the following:
- the county keys;
- whole numbers;
- that the Bay Area sum is below the state total;
- registered is not above eligible;
- the California county count against the county records.

## Key dates (elections.json)

`keyDates` on an election lists the dates shown in the home page timeline. Each entry has:
- `date`;
- `label` and `text` (plain wording shown to voters);
- `quote`, the sentence from the official page;
- `url`, which must be an https page on sos.ca.gov.

The validator checks the following:
- the dates are in order;
- each quote names the same day as its date;
- the election date is included.

The page marks dates before the visitor's own date as "Passed".

## bay-map.json

These are the county outlines for the home page map. They come from the U.S. Census Bureau cartographic boundary files (2017, 1:10,000,000), through the `us-atlas` package. They are projected once with `tools/build-map.mjs`, which needs its own install and is not part of `npm run build`. Each county has:
- `id`, `fips` and `name`;
- `d`, the SVG path, limited to M, L, Z and numbers;
- `label`, the label position.

San Francisco's label was moved off the county by hand. The validator checks that the counties are exactly the nine region counties and that the names match the jurisdictions. The outlines are simplified, for orientation only, and are never used to place an address or a district.

## readingNote (measures and contests)

`readingNote` is a voter-facing sentence on a record whose key facts were read by OCR or by an AI assistant looking at a page image. It is shown as "How this was read" next to those facts. On October 23, 2026 it is set on these records:
- 27 Alameda measures (registrar forms read by OCR);
- the three Oakland Unified trustee district contests (district mapping read from the page layout);
- six Berkeley contests (ballot designations read from the notice's page image).

It does not change the record's status.

## Candidate photos (candidates.json `photo`)

Photos are stored in `assets/candidates/` as 192×192 JPEG files, never linked from another site. A `photo` record holds:
- `src`;
- `sourceUrl`, the original file, and `sourcePage`, the file page with its license;
- `retrieved`;
- `credit`, `license`, `licenseUrl`, `year` and `modified`. Accepted licenses are public domain, CC0, CC BY, CC BY-SA, or recorded written permission;
- `identityCheck`, which says how the photo was matched to this candidate, never by name alone;
- `permission`, with `grantedBy`, `date` and `evidence`, which records the legal basis: a license on the file, or written permission.

The validator rejects a photo that is missing any of these, or whose file is absent.

The guide shows a photo for each candidate who has a `photo` record, on contest pages and candidate pages. A candidate without one gets a neutral grey placeholder, and the page says the placeholder means no reusable photo was found. Photos never change the candidate order or the wording. Until October 24, 2026 a photo was hidden when any opponent lacked one; the site owner dropped that rule for the beta.

The official voter guide photos are not reused, because the guide gives no license for them. On the owner's decision, photos tagged PD-CAGov on Wikimedia Commons are shown even for members of the Legislature, although the basis of that tag, the California Public Records Act, does not cover the Legislature. Each such record says so in `permission.evidence`. The About page carries a disclaimer and a removal route. `audit/2026-10-24/photo-manifest.json` lists every candidate's photo status.

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


## Candidate evaluation (data/candidate-rubric.json and candidates.json `evaluation`)

`data/candidate-rubric.json` holds:
- the evidence bases (record, proposal, statement, independent);
- the missing-data policy;
- the rating guidance for each office type, matched to a contest's `office` by the first `match` pattern that fits (the last is a catch-all).

A candidate's ratings go in `evaluation.ratings.<factor>` with:
- `rating` (whole number 1 to 5);
- `basis` (one of the bases);
- `note`;
- `source {title, url}`.

`evaluation.reviewed` holds the date. The validator rejects incomplete ratings, and an Evidence strength rating based only on a campaign statement. No candidate has an `evaluation` yet. The percentage arithmetic for both the tool and candidate mode is in `assets/weights.js`. It is display only; the tool's `quality()` and `lean()` remain the source of every proposition score and lean.
