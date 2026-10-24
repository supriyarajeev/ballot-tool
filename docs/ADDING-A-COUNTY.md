# Adding the next county

1. **Jurisdictions.** In `data/jurisdictions.json`, find the county record and set `coverage.status` to `list-only` (titles collected) or `pilot` (some content researched). Make sure `electionsUrl` and `lookupUrl` (with `lookupLabel` describing what it actually shows) are the official pages. Add any school or special districts that have measures, with `parent` set to the county id and, if known, `areas` listing the city ids they serve.
2. **Measures.** Add one record per measure to `data/<election>/local-measures.json`. Start with `status: "incomplete"`, the official title, the official source URL and a `gaps` note. Fill in content as you verify it.
3. **Contests and candidates.** Add contests to `contests.json` and candidates to `candidates.json`, using the certified candidate list. Keep candidates in list order.
4. **Check.** Set the county's `inventory` values honestly (`collected` only for what you read from an official list). Run `node tools/build-ledger.mjs`, then `node tools/validate.mjs` until it reports 0 errors, then `node tools/report.mjs`. Then run `python3 -m http.server` in the site folder, open `http://localhost:8000/#/ballot/<county-id>`, and look at it at phone width.
5. **Verify.** Work through `docs/VERIFICATION-CHECKLIST.md` before changing any record to `verified`.
6. **Deploy.** Upload the changed files to the repository with the same folder paths. Nothing else needs to change.

Never add a measure, candidate or source you have not seen in an official or clearly cited source. An empty section is shown to voters as "not yet researched", which is honest. A guessed one is not.
