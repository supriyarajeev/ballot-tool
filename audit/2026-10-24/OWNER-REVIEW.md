# Items for the owner or a person to review (October 24, 2026, production push)

Most important first. The owner authorized resolving the earlier list; what was resolved is marked, and what still needs a person is below. Nothing here blocks upload as an informational beta.

## Resolved in this push

- **Proposition ratings.** Prop 44 accountability changed from 5 to 4. Prop 37 evidence and accountability and Prop 38 evidence stayed at 3, with rewritten reasons. See PROPOSITION-CHANGELOG.md.
- **Legislature portraits (19 removed, 1 replaced).** The PD-CAGov basis does not cover the Legislature, so those photos were removed and initials are shown. Scott Wiener's portrait was replaced with a Commons file under CC BY-SA 3.0 with a VRT permission ticket. Record: photos-removed-legislature.json.
- **Local contests in all nine counties.** 356 contests and 996 candidates were added from the county lists (COVERAGE-MATRIX.md).
- **Six name corrections** in existing contests (five Alameda candidates and EBMUD Ward 3's Don Gray), plus City of Alameda designations and seat counts and EBMUD designations, from the county lists (name-corrections.log).
- **Footer.** Every page carries the owner's exact credit and disclaimer wording.

## Still needs a person

1. **Spot-check local contests against sample ballots.** No contest has been compared with a sample ballot by a person. Suggested first checks:
   - one Santa Clara and one Contra Costa contest (both read by the project lead from the PDFs in a browser);
   - Solano, which was read once from the filing log;
   - Sonoma's two fire district contests (Gold Ridge, Sonoma County Fire), which are from the filing list only and are marked pending.
2. **Candidate name capitalization.** Contra Costa prints names in capitals. The guide's capitalization is a best guess (for example McGill, Mary Ann "MJ" Jawili). Alameda has the same issue in a few names (see the Alameda research file notes).
3. **Twenty congressional and legislative contests added earlier today.** They were read twice from the certified list; no person has looked. Also confirm "Mark Rendon, Green" in AD 14.
4. **Photos relying on Commons' PD-CAGov reading (8).** These are state and local government works (for example the San Francisco Public Defender). The reading is Wikimedia Commons', not a court ruling on these photos.
5. **Photos that need permission.** Berkeley's website forbids reuse without written permission (webmaster@berkeleyca.gov). Ten Berkeley, EBMUD and OUSD incumbents could get photos this way. Local campaign photos would also need each candidate's permission.
6. **Three local photos found but not used:** Nora Campos (Legislature portrait), Kathy Watanabe (image too small), Tom Schwedhelm (license basis not shown). See PHOTO-AUDIT.md.
7. **California's 483 incorporated cities.** Confirm against the Department of Finance E-1 table.
8. **The 15-day Report of Registration.** Not published when checked on October 24. When it appears, update `data/region.json` `glance.registration`.
9. **Deleted files on GitHub.** The 19 removed photo files must be deleted from the repository by hand (UPLOAD-INSTRUCTIONS.md, step 3). A web upload does not delete files.

## Known gaps (disclosed on the site)

- Candidate statements, qualifications, positions and records are not collected for most local candidates.
- No candidate has evaluation ratings.
- Local measures are listed by letter and title only outside Alameda.
- No record has been reviewed by a person, and nothing is marked Verified.
