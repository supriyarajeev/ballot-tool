# Final report, October 23, 2026

**Release recommendation. Ready for limited publication.** It is not ready for full publication, because no record has had a person's review. Nothing was deployed or pushed. The public link (https://supriyarajeev.github.io/ballot-tool/) is unchanged.

## Tests (final run, `audit/logs/2026-10-23-round3.log`)

| Step | Result |
|---|---|
| Generated files match their generators | pass (9 files) |
| Data validation | pass, 0 errors, 0 warnings, 666 ids |
| Validator self-test | pass, 178 of 178 plants caught |
| Scoring regression (both fixtures) | pass, 0 differences in 1,008 results |
| HTML validation | pass |
| Guide browser tests | pass, 306 of 306 |
| Ballot Weighing Tool browser tests | pass, 224 of 224 |
| GoatCounter stand-in tests | pass, 124 of 124 |

No test is failing. The baseline log (`audit/logs/2026-10-23-baseline-npm-test.log`) also passed, but with a weaker suite: 165 validator plants, and no check of the counter's privacy or of the Bay Area region.

## Agents, fixes and retests

These are recorded in `docs/INDEPENDENT-REVIEW.md` (section "Second review, October 23, 2026"):
- 5 QA agents;
- 4 fix agents with separate file ownership;
- 4 independent retest agents.

The reports are in `audit/reports/` and the fix summaries are in `audit/2026-10-23/fix-*-summary.md`.

**Checks repeated independently:**
- Every QA finding was rechecked by a retest agent that did not write the fix.
- The R4-01 to 06 fixes made after the last retest were checked by the test suite and new plants only.

## Before and after counts

See the table in `docs/INDEPENDENT-REVIEW.md`.
- **Local ballot questions:** 71 to 84 of 143.
- **Local thresholds:** 75 to 87.
- **Candidate contests:** 67 to 71.
- **Designations:** 67 to 97.
- **Sources whose text was not extracted:** 27 to 0.
- **Records marked Verified:** 0 before and 0 after.

## Remaining gaps

- 0 of 2,007 evidence records have had a person's review.
- No county's local list is reconciled.
- District boundaries are not mapped, so districts show as "may apply" (GEO-07).
- Three ratings are left to the owner: Prop 44 accountability, and Props 37 and 38 evidence strength. Scoring is unchanged.
- The Alameda OCR readings, the Oakland Unified district mapping and the Berkeley designations rest on automated and visual reading by an AI.
- Sunol Glen K has no published ballot question. Emeryville BB has no threshold or type.
- The validator does not check source URLs against official domains. Ten validator rules are not covered by the self-test (listed in `audit/reports/retest-evidence-validation.md`).
- Owner decisions:
  - the owner's name in files (PRD-04);
  - "clear all" for saved weights (PRD-06);
  - no Content Security Policy;
  - auditor scratch paths `/tmp/qa-*` cited inside the audit reports (R3-02).
