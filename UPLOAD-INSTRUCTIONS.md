# Upload instructions (October 24, 2026 production release)

These steps replace the site files in the existing repository `supriyarajeev/ballot-tool`. GitHub Pages settings, the domain and the public link (https://supriyarajeev.github.io/ballot-tool/) do not change.

## 1. Unzip

Unzip `ballot-tool-site.zip`. The folder holds:
- `index.html` and `propositions.html`;
- the folders `assets/` (including the new `assets/candidates/` photos), `data/`, `docs/`, `tools/`, `tests/` and `audit/`;
- `README.md`, `UPLOAD-INSTRUCTIONS.md`, `package.json` and `package-lock.json`;
- three hidden files: `.nojekyll`, `.gitignore` and `.htmlvalidate.json`.

On a Mac, press Cmd+Shift+Period in Finder to see the hidden files.

## 2. Upload in four commits

GitHub's web upload accepts at most 100 files per commit.

1. On GitHub, open the repository and choose **Add file**, then **Upload files**.
2. **First commit (42 files).**
   - Drag in `index.html`, `propositions.html`, `README.md`, `CHANGELOG.md`, `UPLOAD-INSTRUCTIONS.md`, `package.json` and `package-lock.json`.
   - Drag in the `assets` folder.
   - Choose **Commit directly to the main branch** and commit, with a message such as "October 24 production release, part 1".
3. **Second commit (44 files).** Upload the folders `data`, `docs`, `tools` and `tests` the same way.
4. **Third commit (72 files).** Open the unzipped `audit` folder and drag in its subfolders `2026-10-22`, `2026-10-23`, `logs` and `reports`. GitHub keeps them under `audit/` only if you first open the repository's existing `audit` folder and choose **Add file**, then **Upload files** from there.
5. **Fourth commit (49 files).** The same way, upload `audit/2026-10-24`.
6. **Hidden files.** `.nojekyll` should already be in the repository. If it is not, choose **Add file**, then **Create new file**, name it `.nojekyll`, leave it empty and commit. Without it, the Pages build can fail.

Upload the first and second commits soon after each other. The new page code expects the new data files.

## 3. Delete the 19 removed photos

A web upload adds and replaces files but never deletes them. These Legislature portraits were removed from the guide because their reuse basis is not settled. Nothing links to them any more, but they stay publicly reachable until deleted. In `assets/candidates/` on GitHub, open each file, choose the **…** menu, then **Delete file**, and commit:

alex-lee.jpg, allen.jpg, buffy-wicks.jpg, catherine-stefani.jpg, chris-rogers.jpg, damon-connolly.jpg, diane-papan.jpg, gail-pellerin.jpg, liz-ortega.jpg, lori-d-wilson.jpg, marc-berman.jpg, mia-bonta.jpg, mike-mcguire.jpg, patrick-ahrens.jpg, rebecca-bauer-kahan.jpg, robert-rivas.jpg, shannon-grove.jpg, wagner.jpg, weber.jpg

`wiener.jpg` is replaced, not deleted.

## 4. Wait for the deploy

Open the **Actions** tab. Wait for the newest "pages build and deployment" run to show a green check, usually 1 to 3 minutes. If it fails, open the run and read the red line.

## 5. Check the live site

Open https://supriyarajeev.github.io/ballot-tool/ and do a hard refresh (Cmd+Shift+R).

- **Home.** The BETA line, the county map, Key dates, Before you vote, the Ballot Weighing Tool steps, The region at a glance (two matching sections of four cards) and What's covered all appear.
- **Local contests.** Choose Find My Ballot, then Contra Costa, then Concord. Candidate elections include Concord City Council districts and the Concord City Treasurer. Open "What has been checked for Contra Costa County" and check that "Not on the ballot" lists 61 seats.
- **Footer.** Every page ends with "California Ballot Guide", "Developed by Supriya Rajeev for educational purposes." and a link to the Secretary of State's elections page.
- **Sharing preview.** Paste the site link into a chat app or a link-preview checker; the card shows "California Ballot Guide" and the preview image.
- **About.** The About page opens from the menu.
- **Candidates.**
  - Choose Candidates, then Governor. Both candidates show photos, with photo credits below the list.
  - Open a local contest such as Oakland Mayor. Candidates without a photo show a grey placeholder, with a note explaining it.
- **Ballot page.** Choose Find My Ballot, then Alameda, then Oakland. The ballot page lists items with "Incomplete" and "May apply" labels.
- **Weighing Tool.** Open the Ballot Weighing Tool, answer one question and check that a lean appears. Each result shows "Weighted evidence rating: N%", and "How this score is calculated" opens a table of points.
- **Candidate evaluation.** Open Governor and expand "Evaluate candidates with your priorities (beta)". Every factor shows Insufficient evidence.
- **Phone.** Open the site once on a phone.

## 6. If something is wrong

Open the repository's commit list and revert the October 24 production release commits. The site returns to the previous version within a few minutes.
