# Scoring transparency and candidate evaluation (October 24, 2026)

## 1. The scoring formula actually used

Read from `quality()` and `lean()` in propositions.html. The formula is unchanged in this release. One rating changed (Prop 44 accountability, 5 to 4, owner-approved; see PROPOSITION-CHANGELOG.md), so Prop 44's result below changed from 56% (2.8) to 52% (2.6).

- **Ratings.** Each proposition has a 1 (weak) to 5 (strong) rating on seven factors. A rating outside 1 to 5 or missing is Not rated.
- **Weights.** The voter picks 0 (Ignore) to 5 (Top priority) per factor. Standard preset 5, 5, 4, 3, 3, 2, 2 (24 points).
- **Average.** sum(weight × rating) ÷ sum(weight), over factors with weight above 0 and a valid rating. Not rated factors are left out and the rest rescale; missing evidence is never counted as 0 or 5.
- **Rounding.** The average is rounded to one decimal and kept between 1 and 5. The rounded value is shown and drives the quality word and the lean.
- **No score.** If every weight is 0, or no weighted factor is rated, no score is computed and the lean follows the preference alone.
- **Lean.** Support needs 3.0 or more for Leans toward YES, Strongly support needs 2.0; otherwise Mixed / uncertain. Oppose gives Leans toward NO. Not sure and skipped never count.
- **Saved state.** localStorage `ballot-weighing-v2` holds weights and answers, clamped on load.

**Is it a weighted average?** Yes. So the percentage form is the same number on a different scale.

- Weighted evidence rating (%) = average ÷ 5 × 100.
- Points from a factor = weight ÷ (total weight of weighted, rated factors) × rating ÷ 5 × 100. The points add to the unrounded percentage.
- The headline percentage is shown from the tool's rounded average (3.2 of 5 shows as 64%) so the percentage and the "of 5" figure always agree. The calculation table shows the exact value (for example 64.17%) and explains the rounding.
- The meter bar now fills to the same percentage (it previously filled (average − 1) ÷ 4, a visual-only difference). **No score, quality word, cutoff or lean changed.** The scoring regression against the original tool showed 0 differences in 1,008 cases before the Prop 44 rating change. After it, the 24 cases that involve Prop 44 changed score and the fixtures were recaptured; the earlier fixture is kept in audit/2026-10-24/scoring-baseline-before-prop44.json.

## 2. Default weights as percentages

Computed from the weights in code (`assets/weights.js`, `shares()`), not hard-coded, and recomputed whenever a slider moves.

| Factor | Weight | Share |
|---|---:|---:|
| Net benefit | 5 | 20.83% |
| Evidence strength | 5 | 20.83% |
| Safety | 4 | 16.67% |
| Accountability | 3 | 12.50% |
| Feasibility | 3 | 12.50% |
| Fiscal clarity | 2 | 8.33% |
| Outcome clarity | 2 | 8.33% |
| **Total** | **24** | **100%** |

If every weight is 0, shares are not computed (no division by zero) and the page says every factor is set to Ignore.

## 3. Results for all 14 propositions (standard weights)

All 14 have all seven factors rated, so nothing is left out.

| Prop | Name | Weighted evidence rating | Average of 5 (shown) | Exact average | Exact % |
|---|---|---:|---:|---:|---:|
| Prop 1 | Affordable housing and veterans bond | 64% | 3.2 | 3.21 | 64.17% |
| Prop 2 | Bigger rainy day fund | 60% | 3.0 | 3.04 | 60.83% |
| Prop 3 | Permanent top income tax rates | 74% | 3.7 | 3.67 | 73.33% |
| Prop 4 | Public campaign funding | 58% | 2.9 | 2.92 | 58.33% |
| Prop 5 | Recall without a replacement vote | 60% | 3.0 | 3.00 | 60.00% |
| Prop 37 | Loans for middle-income new-home buyers | 62% | 3.1 | 3.08 | 61.67% |
| Prop 38 | Immunology research bond | 60% | 3.0 | 2.96 | 59.17% |
| Prop 39 | Voter ID and citizenship checks | 54% | 2.7 | 2.71 | 54.17% |
| Prop 40 | One-time billionaire tax | 50% | 2.5 | 2.50 | 50.00% |
| Prop 41 | Special tax audits and spending limit | 64% | 3.2 | 3.17 | 63.33% |
| Prop 42 | Ban on new asset and look-back taxes | 56% | 2.8 | 2.75 | 55.00% |
| Prop 43 | Two-thirds vote for citizen local special taxes | 66% | 3.3 | 3.33 | 66.67% |
| Prop 44 | Clinic 90% spending rule | 52% | 2.6 | 2.63 | 52.50% |
| Prop 45 | Environmental review fast track | 54% | 2.7 | 2.71 | 54.17% |

The exact column differs from the shown one only by the tool's one-decimal rounding (for example Prop 42, 2.75 rounds to 2.8, shown as 56%; its points add to 55.00).

## 4. Sample calculation, Prop 1, standard weights

| Factor | Importance | Rating | Points |
|---|---:|---:|---:|
| Net benefit | 20.83% | 3/5 | 12.50 |
| Evidence strength | 20.83% | 3/5 | 12.50 |
| Safety | 16.67% | 3/5 | 10.00 |
| Accountability | 12.50% | 3/5 | 7.50 |
| Feasibility | 12.50% | 4/5 | 10.00 |
| Fiscal clarity | 8.33% | 4/5 | 6.67 |
| Outcome clarity | 8.33% | 3/5 | 5.00 |
| **Total** | 100% | | **64.17** |

Exact average 3.21 of 5. The tool rounds to 3.2, shown as **Weighted evidence rating: 64% (3.2/5)**.

## 5. What changed on the Ballot Weighing Tool page

- **Framework list.** Each factor shows its share of the total.
- **Sliders.** Each slider shows "x% of your weighting", live. A factor at 0 shows "Not counted".
- **How scoring works.** A four-step box: choose what matters, review ratings, calculate, understand. It has a worked example bar (Net benefit, Prop 1) and a "Show calculation" disclosure with the exact rules and a table of all 14 propositions under the current weights.
- **Each result panel.** It shows "Weighted evidence rating: N% (x.x/5)" under the existing score. A "How this score is calculated" disclosure holds the Importance, Rating and Points table, the rounding note, and the voter's preference kept separate ("Preference alignment not calculated" when unanswered).
- **Disclaimers stay.** The percentage is not a chance of success, a share of voters, a guarantee, or a Yes/No recommendation.
- **Other fixes.** A BETA note was added to the tool. The rubric table scrolls instead of breaking words on phones.

## 6. Candidate evaluation mode, status and limits

- **Where.** On every contest page with candidates, as a collapsed section, "Evaluate candidates with your priorities (beta)".
- **Weights.** The same seven factors and the voter's own weights. They are read from the tool's saved state in the same browser, or the standard weights, and the same percentages apply to every candidate.
- **Office guidance.** It comes from `data/candidate-rubric.json`, with separate wording for:
  - Governor (as specified in the brief);
  - statewide executive offices;
  - the Board of Equalization;
  - legislative offices;
  - local executive offices;
  - local boards and councils.
- **Evidence bases.** Each rating must name one:
  - documented past record;
  - published policy proposal;
  - campaign statement;
  - independent evidence.

  The validator rejects a rating without a 1 to 5 value, basis, note and https source. It also rejects an Evidence strength rating that rests on a campaign statement alone.
- **Missing data.** A missing rating shows Insufficient evidence and is never counted. A weighted summary is shown only when every factor the voter weights is rated; otherwise "Weighted rating not calculated, n of 7 factors rated".
- **No ranking.** Candidates stay in the official order, with no overall ranking, prediction or recommendation.
- **Status.** **No candidate has been rated.** Ratings need sourced research on each candidate's record and proposals, which was not done in this release. Inventing them would break the guide's evidence rules. Every candidate therefore shows Insufficient evidence. The calculation path is tested with injected test data only.

## 7. Tests

See TEST-REPORT.md for the full run. Added in this release:
- **`tests/weights.test.mjs`** (25 checks):
  - default shares;
  - weight changes;
  - a single factor;
  - all zero;
  - boundary ratings 1/5 and 5/5;
  - missing and invalid ratings;
  - two-decimal rounding;
  - points summing to the exact percentage;
  - agreement with the tool's own `quality()` for all 14 propositions under every preset, each single factor and all zero (168 cases).
- **Weighing Tool browser tests** (+44 across 4 viewports):
  - shares on the framework list and sliders;
  - live update, single factor and all zero;
  - percentage results;
  - the 14-row table;
  - contributions summing to the total;
  - the worked example;
  - saved weights restored after reload;
  - the preference kept separate.
- **Guide browser tests** (+5):
  - candidate mode weight shares;
  - office guidance;
  - no calculated rating;
  - official order;
  - saved weights carried over;
  - a complete injected rating set calculated, and an incomplete one not.
- **Validator self-test** (+5 plants) covering the candidate rating and rubric rules.

## 8. Outstanding

- No candidate ratings yet (see section 6).
- Three proposition ratings flagged earlier remain under the owner's review; their values are unchanged.
- No person has reviewed the ratings or the audit.
