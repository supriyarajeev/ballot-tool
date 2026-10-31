// Browser tests for the ballot guide (index.html + assets/guide.js), written against the data contract and UI
// requirements in audit/2026-10-23/FIX-PLAN.md. Every expected count is computed from data/, never hardcoded.
//   node tests/browser/run.mjs guide       (starts a local server and sets BASE)
// External requests (fonts, visitor counter) are blocked during tests and reported.
const { chromium } = require("playwright");
const { HtmlValidate } = require("html-validate");
const { BASE: B, AXE, ALLOWED_HOSTS, STATUS_LABELS, OUTSIDE_BAY_MSG, loadData, blockExternal, watchErrors, counter, readJSON } = require("./lib.cjs");
const { ok, done } = counter("guide browser tests");

const D = loadData();
const R = D.region;
const bay = D.bayIds.map((id) => D.J.get(id));
const others = D.counties.filter((c) => !D.bayIds.includes(c.id));
const shortName = (c) => c.name.replace(/ County$/, "").replace(/ \(City and County\)$/, "");
const statewide = D.measures.filter((m) => m.level === "state");
const incomplete = D.measures.filter((m) => m.status === "incomplete" && m.level !== "state");
const localItem = D.measures.find((m) => m.level !== "state");
const sfCounty = D.J.get("ca-sf");
const sfMeasures = D.measures.filter((m) => m.jurisdiction === "ca-sf" || (sfCounty && m.jurisdiction === sfCounty.consolidatedCity));

// Coverage counts, computed from data the way the requirement describes them (counts per Bay Area county).
const localMeasuresIn = (cid) => D.measures.filter((m) => m.level !== "state" && D.inCounty(m.jurisdiction, cid));
const localContestsIn = (cid) => D.contests.filter((c) => { const j = D.J.get(c.jurisdiction); return j && j.type !== "state" && j.type !== "state-district" && D.inCounty(c.jurisdiction, cid); });
const COV = {
  measures: bay.filter((c) => localMeasuresIn(c.id).length).length,
  cityLists: bay.filter((c) => (c.cityInventory || {}).status === "complete").length,
  cities: bay.reduce((n, c) => n + D.citiesOf(c.id).length, 0),
  contests: bay.filter((c) => localContestsIn(c.id).length).length,
  counties: bay.length,
};

// ---------- form helpers (radio group or select, whichever the page uses) ----------
async function countyControl(p) {
  const group = p.getByRole("group", { name: "Select a Bay Area county" });
  if (await group.count()) return { kind: "radio", loc: group.first() };
  const sel = p.getByLabel("Select a Bay Area county");
  if (await sel.count()) return { kind: "select", loc: sel.first() };
  return null;
}
async function countyChoices(p) {
  const c = await countyControl(p); if (!c) return null;
  if (c.kind === "radio") return c.loc.locator('input[type="radio"]').evaluateAll((xs) => xs.map((x) => x.value));
  return c.loc.locator("option").evaluateAll((xs) => xs.map((x) => x.value).filter(Boolean));
}
async function chooseCounty(p, id) {
  const c = await countyControl(p);
  if (c.kind === "radio") await c.loc.locator(`input[value="${id}"]`).check({ force: true });
  else await c.loc.selectOption(id);
  await p.waitForTimeout(50);
}
async function checkedCounty(p) {
  const c = await countyControl(p); if (!c) return null;
  if (c.kind === "radio") return c.loc.locator('input[type="radio"]:checked').evaluateAll((xs) => (xs[0] ? xs[0].value : ""));
  return c.loc.inputValue();
}
const citySelect = (p) => p.getByLabel("Select a city or town").first();
async function cityOptions(p) {
  const s = citySelect(p);
  if (!(await s.count())) return null;
  return s.locator("option").evaluateAll((xs) => xs.map((o) => ({ value: o.value, text: o.textContent.trim(), selected: o.selected, disabled: o.disabled })));
}
const submit = async (p) => { await p.locator("#findform button[type=submit], #findform input[type=submit]").first().click(); await p.waitForSelector("h1"); await p.waitForTimeout(100); };
const H1 = async (p) => ((await p.textContent("h1")) || "").trim();
const main = async (p) => (await p.textContent("main")) || "";
const go = async (p, h, sel = "h1") => { await p.goto(B + h); await p.waitForSelector(sel); await p.waitForTimeout(50); };
const openAll = (p) => p.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
const isErrorPage = async (p) => { const h = await H1(p); return /^Not found$|Something went wrong/i.test(h) || /not (listed|found|in) /i.test(h); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [], hosts = new Set(), badges = new Set();
  watchErrors(p, errs);
  await blockExternal(p, hosts);
  const collectBadges = async () => (await p.$$eval(".badge", (bs) => bs.map((x) => x.textContent.trim()))).forEach((t) => badges.add(t));

  ok(R && R.counties && R.counties.length === 9, "data/region.json lists 9 counties (Fix A)");

  // ---------- Home ----------
  await go(p, "#/");
  // Folded sections (Oct 29, 2026): the home page starts with its reference sections folded behind Show details.
  { const f = await p.$$eval("main button.sec-fold", (bs) => bs.map((b) => [b.getAttribute("data-body"), b.getAttribute("aria-expanded"), document.getElementById(b.getAttribute("data-body")).hidden]));
    ok(f.length >= 3 && f.every((x) => x[1] === "false" && x[2] === true), "home starts with its reference sections folded: " + f.map((x) => x[0]).join(", "));
    ok(await p.isVisible("[data-eday]") && /Election Day is Tuesday, November 3/.test(await p.textContent("[data-eday]")), "home leads its key dates with Election Day");
    const pill = await p.$eval("main .sec-fold .fold-hint", (e) => { const c = getComputedStyle(e); return [parseFloat(c.borderTopWidth), c.borderTopStyle, e.textContent]; });
    ok(pill[0] >= 1 && pill[1] === "solid" && pill[2] === "Show details", "Show details is a bordered button, as in the tool");
    await p.click('main button.sec-fold[data-body="region-body"]');
    ok(await p.isVisible("[data-glance]") && (await p.textContent('main button.sec-fold[data-body="region-body"] .fold-hint')) === "Hide details", "Show details opens the regional figures");
    await p.click('main button.sec-fold[data-body="region-body"]'); ok(await p.isHidden("[data-glance]"), "and Hide details folds them");
    ok(await p.$eval("#foot-body", (e) => e.hidden) && await p.isVisible("footer.site [data-credit]"), "the footer folds How this guide works but keeps the credit visible"); }
  await p.evaluate(() => document.querySelectorAll("button.sec-fold").forEach((b) => { if (b.getAttribute("aria-expanded") !== "true") b.click(); }));
  ok((await H1(p)) === "California Bay Area Ballot Guide", "home h1");
  ok((await p.title()).startsWith("California Bay Area Ballot Guide"), "document title");
  ok(await p.isVisible('a:has-text("Find My Ballot")'), "Find My Ballot entry point");
  ok(await p.isVisible('main a[href="propositions.html"]'), "Ballot Weighing Tool entry point");
  ok((await main(p)).includes("November 3, 2026"), "election date on home");
  // Regional facts block: 9 counties and 101 cities and towns, read from region.json, with a source link.
  const card = p.locator('[data-region-card], section:has-text("cities and towns")').first();
  ok(await card.count(), "regional facts block present");
  const cardText = (await card.count()) ? (await card.innerText()).replace(/\s+/g, " ") : "";
  ok(R && cardText.includes(`${R.countyCount} counties in the Bay Area`) && cardText.includes(`${R.municipalityCount} incorporated cities and towns in the Bay Area`), `regional facts name ${R && R.countyCount} counties and ${R && R.municipalityCount} incorporated cities and towns: ${cardText.slice(0, 160)}`);
  const factUrls = R ? R.facts.map((f) => f.url) : [];
  const cardLinks = (await card.count()) ? await card.locator("a").evaluateAll((as) => as.map((a) => a.href)) : [];
  ok(cardLinks.some((u) => factUrls.includes(u)), "regional facts link to their source: " + factUrls.join(", "));
  ok(await card.locator(`a[href="${factUrls[0]}"]`).first().isVisible().catch(() => false), "source link is visible without expanding anything");
  // "The region at a glance": figures summed from region.json, each with its date and an official source link.
  const G = R.glance, sumC = (o) => D.bayIds.reduce((n, id) => n + o.byCounty[id], 0), fmt = (n) => n.toLocaleString("en-US");
  const glance = await p.$$eval("[data-glance] li", (ls) => ls.map((l) => l.textContent.replace(/\s+/g, " ").trim()));
  ok(glance.length === 8, "region at a glance has 8 tiles in two groups: " + glance.length);
  { const groups = await p.$$eval("[data-glance] .gl-group", (gs) => gs.map((g) => [...g.querySelectorAll(".gl .gl-l")].map((x) => x.textContent)));
    ok(groups.length === 2 && JSON.stringify(groups[0]) === JSON.stringify(groups[1]) && JSON.stringify(groups[0]) === JSON.stringify(["counties", "incorporated cities", "residents", "registered voters"]), "both regional sections have the same four cards in the same order: " + JSON.stringify(groups));
    ok(glance.some((t) => /483 incorporated cities in California, as of January 1, 2026/.test(t)) && G.californiaCities.count === 483, "California incorporated cities card, dated, from the data");
    ok(glance.some((t) => t.includes(fmt(G.population.state)) && /California residents/.test(t)), "California residents card");
    ok((await p.$$eval("[data-glance-sources]", (e) => e.length)) === 2 && /15-day report was not yet published/.test(await p.textContent("[data-glance-method]")), "each section has its own sources; the method note explains the dates"); }
  ok(await p.locator("[data-glance] .gl-h").count() === 2, "glance has Bay Area and California group headings");
  ok(glance.some((t) => t.includes(`About ${Math.round(sumC(G.population) / 1e5) / 10} million`) && t.includes(fmt(sumC(G.population)))), "Bay Area residents tile is the sum of the nine county estimates: " + fmt(sumC(G.population)));
  ok(glance.some((t) => t.includes(fmt(sumC(G.registration))) && /nine Bay Area counties/.test(t) && /September 4, 2026/.test(t)), "Bay Area registered voters tile is the sum of the nine county rows, dated: " + fmt(sumC(G.registration)));
  ok(glance.some((t) => t.includes(fmt(G.registration.state)) && /in California/.test(t)), "statewide registered voters tile");
  ok(glance.some((t) => /^58\D/.test(t) && D.counties.length === 58), "58 California counties tile matches the county records");
  const gsrc = await p.$$eval("[data-glance-sources] a", (as) => as.map((a) => a.href));
  ok([G.population.url, G.registration.url, G.californiaCounties.url].every((u) => gsrc.includes(u)), "each glance figure links to its official source");
  ok(/Residents and registered voters are different counts/.test(cardText) && /unincorporated communities/.test(cardText), "glance distinguishes residents from voters and mentions unincorporated communities");
  // "What's covered": counts computed from the records, and recorded is not presented as verified.
  const covText = (await p.locator("[data-covered-card]").innerText()).replace(/\s+/g, " ");
  const loc = D.measures.filter((m) => m.level !== "state");
  for (const [label, n] of [["statewide propositions", statewide.length], ["local measures", loc.length], ["have their ballot question recorded", loc.filter((m) => m.ballotQuestion).length], ["candidate contests", D.contests.length], ["candidates", D.candidates.length]]) {
    ok(new RegExp(label === "have their ballot question recorded" ? `${n} ${label}` : `${fmt(n)} ${label}`).test(covText), `What's covered says ${fmt(n)} ${label}`);
  }
  ok(covText.includes(`${loc.filter((m) => m.threshold).length} their vote threshold`), "What's covered threshold count from data");
  ok(/No record has been officially reviewed or verified yet/.test(covText) === (D.measures.concat(D.contests, D.candidates).every((x) => x.status !== "verified")), "What's covered states the human-review count from statuses");
  ok(/does not mean it is not on your ballot/.test(covText) && (await p.$$eval("[data-covered-card] .note.warn", (e) => e.length)) === 0, "What's covered still says a missing item may be on your ballot, as plain text, not a warning box");
  ok(!/\bverified\b/i.test(covText.replace(/officially reviewed or verified/g, "")), "What's covered never calls recorded items verified");
  ok(/growing county by county/i.test(covText), "says local coverage is growing county by county");
  // Next steps: official links only.
  const nsLinks = await p.$$eval("[data-next-steps] a", (as) => as.map((a) => a.getAttribute("href")));
  ok(["https://voterguide.sos.ca.gov/", "https://www.sos.ca.gov/elections/voting-resources/county-elections-offices", "https://www.sos.ca.gov/elections/voting-resources/voting-california/voter-hotlines", "https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm"].every((u) => nsLinks.includes(u)), "Before you vote links to the official guide, county offices, language hotlines and accessibility help");
  ok(/does not confirm your districts/.test(await p.locator("[data-next-steps]").innerText()), "Before you vote says choosing a place does not confirm districts");
  { const want = ["https://voterstatus.sos.ca.gov/", "https://caearlyvoting.sos.ca.gov/", "https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot", "https://voterguide.sos.ca.gov/en/alt-versions/", "https://www.sos.ca.gov/elections/voter-registration/same-day-reg"];
    ok(want.every((u) => nsLinks.includes(u)), "Before you vote links to registration status, early voting, ballot tracking, other formats and same-day registration");
    ok(nsLinks.every((u) => !/^https?:/.test(u) || /^https:\/\/([a-z]+\.)?sos\.ca\.gov\/|^https:\/\/voterguide\.sos\.ca\.gov\/|^https:\/\/(voterstatus|caearlyvoting)\.sos\.ca\.gov\//.test(u)), "Before you vote links only to Secretary of State pages"); }
  // Candidates: one 48px frame for everyone. A candidate with a credited photo shows it; others get a neutral placeholder
  // (owner decision, Oct 24, 2026: photos are shown per candidate, not only when every candidate has one).
  { await go(p, "#/contest/2026-11-03.ca.governor", ".detail"); await p.waitForTimeout(300);
    const frames = await p.$$eval("a.cand .cphoto", (fs) => fs.map((f) => { const r = f.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), f.tagName, f.getAttribute("aria-hidden"), f.naturalWidth || 0, f.alt || ""]; }));
    const gov = D.contests.find((c) => c.id === "2026-11-03.ca.governor");
    ok(frames.length === gov.candidates.length && frames.every((f) => f[0] === 48 && f[1] === 48), "every Governor candidate has the same 48px photo frame: " + JSON.stringify(frames.map((f) => f.slice(0, 3))));
    ok(frames.every((f) => f[2] === "IMG" && f[4] > 0 && /^Photo of /.test(f[5])), "Governor candidates with credited photos show loaded, labeled photos");
    const order = await p.$$eval("a.cand b", (bs) => bs.map((b) => b.textContent));
    ok(JSON.stringify(order) === JSON.stringify(gov.candidates.map((id) => D.candidates.find((c) => c.id === id).name)), "candidate order is unchanged by the photo frames");
    const cr = await p.$$eval(".credits a", (as) => as.map((a) => a.href));
    ok(cr.length === 2 * gov.candidates.length && cr.filter((u) => /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(u)).length === gov.candidates.length, "each Governor photo is credited with links to its source and its license");
    const noPhoto = D.candidates.find((c) => !c.photo && c.contest.startsWith("2026-11-03.ca") && /^https:/.test(c.statementUrl || ""));
    if (noPhoto) { await go(p, "#/candidate/" + encodeURIComponent(noPhoto.id), ".detail");
      ok((await p.$$eval(".cand-head img", (is) => is.length)) === 0 && (await p.$$eval(".cand-head .cphoto.ph[aria-hidden=true]", (is) => is.length)) === 1, "a candidate without a photo gets the hidden placeholder");
      ok((await p.$$eval("main a", (as) => as.map((a) => a.href))).includes(noPhoto.statementUrl) && /grey placeholder means this guide did not find a photo/.test(await main(p)), "candidate page without a photo explains the placeholder and links to the official statement page"); } }
  // Every contest: photo where the record has one, placeholder otherwise, and the note when any placeholder shows.
  { let mixed = null, bad = [];
    for (const con of D.contests.filter((c) => (c.candidates || []).length)) {
      await go(p, "#/contest/" + con.id, ".detail");
      const want = con.candidates.map((id) => !!(D.candidates.find((c) => c.id === id) || {}).photo);
      const got = await p.$$eval("a.cand .cphoto", (fs) => fs.map((f) => f.tagName === "IMG"));
      if (JSON.stringify(want) !== JSON.stringify(got)) bad.push(con.id);
      if (!mixed && want.some(Boolean) && !want.every(Boolean)) { mixed = con.id; ok(/grey placeholder means this guide did not find a photo/.test(await main(p)), `${con.id}: a contest with some placeholders explains them`); }
    }
    ok(bad.length === 0, "every contest shows a photo exactly for the candidates with a photo record: " + bad.join(", "));
    await go(p, "#/candidate/2026-11-03.ca-sf.public-defender.manohar-raju", ".detail"); await p.waitForTimeout(200);
    ok((await p.$$eval(".cand-head img", (is) => is.filter((i) => i.naturalWidth > 0).length)) === 1 && /License/.test(await main(p)), "a shown photo appears on the candidate page with its credit and license link"); }
  // Local contests from the county lists (Oct 24, 2026): list status, no-candidate contests and seats not on the ballot.
  { const jur = readJSON("data/jurisdictions.json").jurisdictions;
    const conf = D.contests.find((c) => c.listStatus === "confirmed" && (c.candidates || []).length);
    await go(p, "#/contest/" + conf.id, ".detail");
    ok((await p.$$eval("[data-list-status=confirmed]", (e) => e.length)) === 1 && (await p.$$eval("[data-list-status=pending]", (e) => e.length)) === 0, "a confirmed local contest says it is on the county's official on-ballot list");
    const pend = D.contests.find((c) => c.listStatus === "pending");
    if (pend) { await go(p, "#/contest/" + pend.id, ".detail");
      ok(/Not yet confirmed on a final official list/.test(await main(p)), "a pending contest warns it is not yet on a final official list"); }
    const none = D.contests.find((c) => c.noQualifiedCandidates);
    if (none) { await go(p, "#/contest/" + none.id, ".detail");
      ok((await p.$$eval("[data-no-candidates]", (e) => e.length)) === 1 && !/have not been collected for this contest/.test(await main(p)), "a contest with no qualified candidates says so instead of 'not collected'"); }
    for (const cid of ["ca-contra-costa", "ca-santa-clara"]) {
      const cty = jur.find((j) => j.id === cid); await go(p, "#/ballot/" + cid, "h1"); await openAll(p);
      const n = await p.$eval("[data-not-on-ballot]", (e) => +e.getAttribute("data-not-on-ballot")).catch(() => -1);
      const items = await p.$$eval("[data-not-on-ballot] details.nob li", (e) => e.length).catch(() => -1);
      ok(n === cty.notOnBallot.length && items === n && n > 0, `${cid} lists the ${cty.notOnBallot.length} seats not on the ballot (${n}, ${items})`);
      const rows = await p.$$eval("a.row", (as) => as.length);
      const want = D.contests.filter((c) => { const j = jur.find((x) => x.id === c.jurisdiction); let k = j; while (k && k.type !== "county") k = jur.find((x) => x.id === k.parent); return j && !["state", "state-district"].includes(j.type) && ((k && k.id === cid) || (j.counties || []).includes(cid)); }).length;
      ok(rows >= want, `${cid} ballot page lists at least its ${want} local contests (${rows} rows)`); }
    await go(p, "#/contests", "h1");
    ok(/Local contests are listed for all 9 Bay Area counties/.test(await main(p)), "the contests page says local contests are listed for all nine counties"); }
  // Candidate evaluation: research pending. No scores, rating tables, weight shares or "0 of 7" messages are public.
  // Contests with a candidate comparison show it instead; the notice stays on every other contest (Oct 30, 2026).
  const CMP = new Set(Object.keys((D.quotes || {}).contests || {}));
  const uncovered = D.contests.find((c) => !CMP.has(c.id) && (c.candidates || []).length >= 2 && D.J.get(c.jurisdiction) && D.J.get(c.jurisdiction).type === "state-district");
  { await go(p, "#/contest/" + uncovered.id, "[data-candidate-eval]");
    const t = await p.$eval("[data-candidate-eval]", (d) => d.textContent);
    ok((await p.getAttribute("[data-candidate-eval]", "data-candidate-eval")) === "pending" && /Research pending/.test(t) && /No candidate has been given a score or rating in this release/.test(t) && /Missing information is not a low score/.test(t), "a contest without a comparison shows the research-pending notice");
    ok(!/Weighted rating|of 5 factors|Insufficient evidence|%/.test(t) && (await p.$$eval(".ce-pct, .ce-t, .ce-cand, [data-candidate-eval] input, [data-candidate-eval] table", (e) => e.length)) === 0, "the pending notice has no scores, percentages, tables or controls");
    await go(p, "#/contest/2026-11-03.ca.governor", ".detail");
    const order = await p.$$eval("a.cand b", (bs) => bs.map((b) => b.textContent));
    ok(JSON.stringify(order) === JSON.stringify(D.contests.find((c) => c.id === "2026-11-03.ca.governor").candidates.map((id) => D.candidates.find((c) => c.id === id).name)), "candidates stay in the official order");
    await go(p, "#/contest/" + D.contests.find((c) => !CMP.has(c.id) && c.listStatus === "confirmed" && (c.candidates || []).length > 2).id, "[data-candidate-eval]");
    ok(/Research pending/.test(await p.textContent("[data-candidate-eval]")), "local contests show the same pending notice");
    // The full mode still works behind the gate: release.public true plus reviewed ratings for every candidate (test data, not real ratings).
    const gov = D.contests.find((k) => k.id === "2026-11-03.ca.governor");
    const ratings = (vals) => Object.fromEntries(["ev", "lr", "ac", "if", "fc"].map((k, i) => [k, { rating: vals[i], basis: "record", note: "test", source: { title: "test", url: "https://example.gov/" } }]));
    async function gated(pub, reviewers) {
      const ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await ctx2.newPage();
      await q.route(/candidate-rubric\.json/, async (route) => { const r = await route.fetch(); const j = await r.json(); j.release.public = pub; await route.fulfill({ response: r, json: j }); });
      await q.route(/candidates\.json/, async (route) => { const r = await route.fetch(); const j = await r.json();
        gov.candidates.forEach((id, i) => { const c = j.candidates.find((x) => x.id === id); c.evaluation = { reviewed: "2026-10-24", reviewedBy: reviewers[i], ratings: ratings(i ? [4, 3, 3, 3, 3] : [3, 3, 3, 4, 4]) }; if (!reviewers[i]) delete c.evaluation.reviewedBy; });
        await route.fulfill({ response: r, json: j }); });
      await q.route(/fonts\.g|gc\.zgo/, (r) => r.abort());
      // The evaluation gate is tested on the Governor contest with the comparison file withheld.
      await q.route(/candidate-quotes\.json/, (r) => r.fulfill({ status: 404, body: "" }));
      await q.goto(B + "#/contest/2026-11-03.ca.governor"); await q.waitForSelector("[data-candidate-eval]", { state: "attached", timeout: 10000 });
      const out = { mode: await q.getAttribute("[data-candidate-eval]", "data-candidate-eval"), sums: await q.$$eval(".ce-sum", (e) => e.map((x) => x.textContent)), pct: await q.$$eval(".ce-pct", (e) => e.map((x) => x.textContent)) };
      await ctx2.close(); return out; }
    const off = await gated(false, ["Test Reviewer", "Test Reviewer"]);
    ok(off.mode === "pending" && !off.sums.length, "with release.public false, even complete ratings stay hidden");
    const partial = await gated(true, ["Test Reviewer", ""]);
    ok(partial.mode === "pending", "with release.public true, one unreviewed candidate keeps the contest pending");
    const on = await gated(true, ["Test Reviewer", "Test Reviewer"]);
    ok(on.mode === "1" && /Weighted rating: 66% \(3\.3\/5\)/.test(on.sums[0]) && JSON.stringify(on.pct) === JSON.stringify(["29.4%", "23.5%", "17.6%", "17.6%", "11.8%"]), "when enabled with reviewed ratings, the shared engine calculates with the standard weights: " + on.sums.join(" | ")); }
  // ---------- Candidate comparisons (Oct 30, 2026) ----------
  // Every covered contest: one row per issue in the data's order, one cell per candidate in ballot order, each cell either
  // the exact recorded quote with an https source, its date and its match date, or the one fixed missing sentence.
  if (D.quotes) {
    const Q = D.quotes, NOQ = "No public statement found in our sources.";
    const qOf = (pid, iss) => Q.quotes.find((q) => q.candidate === pid && q.issue === iss);
    let cells = 0, quoted = 0, bad = [];
    for (const cid of Object.keys(Q.contests)) {
      const con = D.contests.find((c) => c.id === cid), iss = Q.issueSets[Q.contests[cid].issueSet];
      await go(p, "#/contest/" + encodeURIComponent(cid), "[data-compare]");
      const got = await p.$$eval(".ws-row", (rs) => rs.map((r) => ({ issue: r.getAttribute("data-issue"), label: r.querySelector(".fold-name").textContent, cells: [...r.querySelectorAll(".ws-cell")].map((c) => ({ id: c.getAttribute("data-cand"), q: (c.querySelector(".ws-q") || {}).textContent || null, none: (c.querySelector("[data-no-quote]") || {}).textContent || null, href: (c.querySelector(".ws-src a") || {}).href || null, chk: (c.querySelector("[data-check]") || {}).textContent || "" })) })));
      if (JSON.stringify(got.map((r) => r.issue)) !== JSON.stringify(iss.map((i) => i.id)) || got.some((r, i) => r.label !== iss[i].label)) bad.push(cid + ": issue rows");
      for (const r of got) {
        if (JSON.stringify(r.cells.map((c) => c.id)) !== JSON.stringify(con.candidates)) bad.push(cid + " " + r.issue + ": ballot order");
        for (const c of r.cells) { cells++; const want = qOf(c.id, r.issue);
          if (want) { quoted++; if (c.q !== "“" + want.quote + "”" || c.href !== want.sourceUrl || !/^https:/.test(c.href) || !/^Quote matched its source on [A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(c.chk)) bad.push(c.id + " " + r.issue + ": quote cell"); }
          else if (c.none !== NOQ || c.q) bad.push(c.id + " " + r.issue + ": missing cell"); } }
      if ((await p.$$eval("[data-candidate-eval], [data-status-note]", (e) => e.length)) !== 0) bad.push(cid + ": pending or status box still shown");
    }
    ok(bad.length === 0, `comparisons: ${Object.keys(Q.contests).length} contests, ${cells} cells, ${quoted} quotes match the data exactly, in ballot order` + (bad.length ? ": " + bad.slice(0, 8).join("; ") : ""));
    ok(quoted === Q.quotes.length, "every quote in the data appears in its contest (" + quoted + " of " + Q.quotes.length + ")");
    ok(!Q.quotes.some((q) => /verified|reviewed/i.test(q.check.method + " " + (q.check.note || ""))), "match records describe what was done, never 'verified' or 'reviewed'");
    // Issue rows start folded; Open all issues opens every row and closes them again.
    const cid = Object.keys(Q.contests)[0];
    await go(p, "#/contest/" + encodeURIComponent(cid), "[data-compare]");
    const hid = () => p.$$eval(".ws-row .sec-body", (b) => b.map((x) => x.hidden));
    ok((await hid()).every(Boolean), "issue rows start folded");
    await p.click("[data-ws-all]"); ok((await hid()).every((h) => !h) && (await p.textContent("[data-ws-all]")) === "Close all issues", "Open all issues opens every row");
    await p.click("[data-ws-all]"); ok((await hid()).every(Boolean), "Close all issues folds them again");
    await p.click("[data-about-method]"); await p.waitForSelector("[data-about]"); await p.waitForTimeout(150);
    ok(await p.$eval("#compare-method", (d) => d.open) && (await p.textContent("[data-compare-method]")).includes(Q.method), "How quotes are chosen opens the method on About, with the exact methodology text");
    // Profiles: the same issues and quotes, a link back to the comparison, and no empty research sections.
    const con = D.contests.find((c) => c.id === cid), pid = con.candidates[0];
    await go(p, "#/candidate/" + encodeURIComponent(pid), "[data-profile-quotes]");
    const pi = await p.$$eval(".ws-pi", (r) => r.map((x) => ({ h: x.querySelector("h3").textContent, q: (x.querySelector(".ws-q") || {}).textContent || null })));
    const iss = Q.issueSets[Q.contests[cid].issueSet];
    ok(pi.length === iss.length && pi.every((r, i) => r.h === iss[i].label && (qOf(pid, iss[i].id) ? r.q === "“" + qOf(pid, iss[i].id).quote + "”" : r.q === null)), "profile shows the same issues and quotes as the comparison");
    ok((await p.getAttribute("[data-compare-link]", "href")) === "#/contest/" + encodeURIComponent(cid), "profile links to Compare everyone in this race");
    ok(!/Not yet collected for this candidate|Qualifications and experience|Documented public record/.test(await main(p)) && !(await p.$("[data-status-note]")), "profile of a compared candidate has no empty research sections or review box");
    // Directory, home entry point and Find My Ballot rows.
    await go(p, "#/contests", "[data-compare-dir]");
    ok((await p.$$eval("[data-compare-row]", (e) => e.length)) === Object.keys(Q.contests).length && /^Comparisons cover \d+ of \d+ contests in this guide\./.test(await p.textContent("[data-compare-count]")), "directory lists every compared race and the count line");
    ok((await H1(p)) === "Candidates and races" && (await p.textContent("#topnav a[href='#/contests']")).trim() === "Candidates and races", "the page and the menu say Candidates and races");
    await go(p, "#/", "[data-home-compare]"); ok((await p.getAttribute("[data-home-compare] a.btn", "href")) === "#/contests", "home page has the Compare candidates entry point");
    await go(p, "#/ballot/ca-sf", "h1"); await p.waitForTimeout(200);
    ok(await p.$$eval('a.row[href="#/contest/2026-11-03.ca.governor"]', (r) => r.length > 0 && r.every((x) => /Compare what the candidates say/.test(x.textContent))), "ballot pages mark contests that have a comparison");
    ok(!/\b(score|scored|rating|rated|rank|ranked|grade|best|winner)\b/i.test((await p.goto(B + "#/contest/" + encodeURIComponent(cid)), await p.waitForSelector("[data-compare]"), await p.textContent("[data-compare]")).replace(/No ratings or rankings\./, "")), "comparison text has no score, rank or winner wording");
  }
  // Disclaimer: unofficial, educational, by the developer; on About and in the footer of every page.
  { await go(p, "#/about", "[data-about]");
    const t = await p.$eval("[data-disclaimer]", (d) => d.textContent);
    ok(/independent civic technology project/.test(t) && /Supriya Rajeev/.test(t) && /educational and informational purposes/.test(t) && /not an official election resource/.test(t) && /without warranty/.test(t) && /Wikimedia Commons/.test(t), "About page carries the full disclaimer");
    const cr = await p.$eval("footer.site [data-credit]", (d) => ({ t: d.textContent, links: [...d.querySelectorAll("a")].map((a) => a.href) }));
    ok(/California Ballot Guide/.test(cr.t) && /Developed by Supriya Rajeev for educational purposes\./.test(cr.t.replace(/\s+/g, " ")) && /An independent civic-tech project/.test(cr.t) && /not an official government website or an endorsement of any candidate, party, or ballot position/.test(cr.t.replace(/\s+/g, " ")) && cr.links.includes("https://www.sos.ca.gov/elections"), "the footer carries the developer credit, beta disclosure and official election link");
    for (const h of ["#/", "#/contests", "#/browse"]) { await go(p, h); ok((await p.$$eval("[data-credit]", (e) => e.length)) === 1, "credit footer on " + h); } }
  // Oct 29, 2026: the footer's About link works while already on About, and How to vote's two buttons match in size.
  { await go(p, "#/about", "[data-about]"); await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(100);
    await p.click('footer.site [data-credit] a[href="#/about"]'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => window.scrollY < 50 && document.activeElement && document.activeElement.tagName === "H1"), "About, methodology and full disclaimer works while already on About (back to the top)");
    await go(p, "#/how-to-vote", "[data-voter-tools]");
    const bw = await p.$$eval(".cta.two .btn", (bs) => bs.map((b) => [Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)]));
    ok(bw.length === 2 && bw[0][0] === bw[1][0] && bw[0][1] === bw[1][1], "How to vote: Find My Ballot and Ballot Weighing Tool are the same size " + JSON.stringify(bw)); }
  { const all = D.candidates.filter((c) => c.photo); const fs = require("fs"), path = require("path");
    ok(all.length >= 1 && all.every((c) => fs.existsSync(path.join(__dirname, "..", "..", c.photo.src))), "every photo record points to a file in the site"); }
  await go(p, "#/contests");
  { const cl = await p.$$eval("main a", (as) => as.map((a) => a.href)); ok(cl.includes("https://voterguide.sos.ca.gov/candidates/") && cl.includes("https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf"), "contests page links to official candidate statements and the certified list"); }
  await go(p, "#/statewide");
  { const sl = await p.$$eval("main a", (as) => as.map((a) => a.href)); ok(sl.includes("https://voterguide.sos.ca.gov/propositions/") && sl.includes("https://voterguide.sos.ca.gov/en/alt-versions/"), "statewide page links to the official propositions and other formats"); }
  await go(p, "#/");
  // Coverage indicator: every number shown equals a count computed from data.
  const ind = p.locator("[data-coverage-indicator]").first();
  ok(await ind.count(), "coverage indicator present (data-coverage-indicator)");
  if (await ind.count()) {
    const items = await ind.locator("li").evaluateAll((ls) => ls.map((l) => l.textContent.replace(/\s+/g, " ").trim()));
    ok(items.length >= 2, "coverage indicator has items: " + items.join(" | "));
    for (const t of items) {
      const n = +((t.match(/\d+/) || [NaN])[0]);
      const want = /complete/i.test(t) ? COV.cityLists : /cities and towns/i.test(t) ? COV.cities : /contest/i.test(t) ? COV.contests : /measure/i.test(t) ? COV.measures : undefined;
      ok(want !== undefined && n === want, `coverage indicator "${t}" shows ${n}, data gives ${want}`);
      const of = t.match(/\bof (\d+)|\/ ?(\d+)/); if (of) ok(+(of[1] || of[2]) === COV.counties, `coverage indicator denominator is the ${COV.counties} Bay Area counties: "${t}"`);
    }
    ok(!(await ind.innerText()).includes(String(R && R.municipalityCount) + " cities and towns of"), "indicator does not reuse the regional fact as coverage");
  }
  await collectBadges();

  // ---------- Skip link and first-load focus (UX-01 to UX-03) ----------
  for (const h of ["#/", "#/about", "#/item/" + encodeURIComponent(localItem.id)]) {
    await p.goto("about:blank"); await go(p, h);
    const h1before = await H1(p), urlBefore = p.url();
    ok(await p.evaluate(() => document.activeElement === document.body || document.activeElement === document.documentElement), `${h}: on first load focus stays at the top of the document`);
    await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("skip")), `${h}: the first Tab reaches the skip link`);
    const box = await p.locator("a.skip").boundingBox();
    ok(box && box.width > 20 && box.height > 20, `${h}: the skip link is visible when focused`);
    await p.keyboard.press("Enter"); await p.waitForTimeout(100);
    ok((await H1(p)) === h1before && p.url() === urlBefore, `${h}: the skip link keeps the same page and address`);
    ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "H1"), `${h}: the skip link moves focus to the page heading`);
  }

  // ---------- Visual aids on the home page ----------
  await go(p, "#/");
  const MAP = D.readMap ? D.readMap() : readJSON("data/bay-map.json");
  const mapHrefs = await p.$$eval("svg.baymap-svg a.cty", (as) => as.map((a) => a.getAttribute("href")));
  ok(mapHrefs.length === 9 && D.bayIds.every((id) => mapHrefs.includes("#/ballot/" + id)), "map has one link for each of the nine region counties: " + mapHrefs.length);
  ok((await p.$$eval("svg.baymap-svg a.cty", (as) => as.filter((a) => /, see what this guide lists$/.test(a.getAttribute("aria-label") || "")).length)) === 9, "each county shape has an accessible name");
  ok(/U\.S\. Census Bureau/.test(await p.locator("figure.baymap figcaption").innerText()) && MAP.source && /census\.gov/.test(MAP.source.url), "map caption credits the Census Bureau outlines");
  await p.focus('svg.baymap-svg a.cty[href="#/ballot/ca-napa"]');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute("href") === "#/ballot/ca-napa"), "a county shape takes keyboard focus");
  await p.keyboard.press("Enter"); await p.waitForFunction(() => /Napa/.test((document.querySelector("h1") || {}).textContent || ""), null, { timeout: 5000 }).catch(() => {});
  ok(/Napa/.test(await H1(p)) && /#\/ballot\/ca-napa$/.test(p.url()), "pressing Enter on a county opens its ballot");
  await go(p, "#/");
  const KD = D.election.keyDates || [];
  const tl = await p.$$eval("[data-key-dates] .timeline li", (ls) => ls.map((l) => ({ t: l.querySelector("time").getAttribute("datetime"), b: l.querySelector("b").textContent })));
  { const srt = tl.slice().sort((a, b) => a.t.localeCompare(b.t)), today = new Date().toISOString().slice(0, 10), firstPast = tl.findIndex((x) => x.t < today);
    ok(srt.length === KD.length && srt.every((x, i) => x.t === KD[i].date && x.b === KD[i].label), "key dates timeline has every date in data/elections.json: " + tl.map((x) => x.t).join(", "));
    ok(JSON.stringify(tl.map((x) => x.t)) === JSON.stringify(KD.map((k) => k.date)), "every key date is shown in date order, none folded");
    const det = await p.$$eval("[data-key-dates] .timeline li", (ls) => ls.map((l) => [l.className, !!l.querySelector("p")]));
    ok(det.every(([c, hasP]) => (c === "past") === !hasP), "dates that have passed are one short line; dates ahead keep their details");
    ok(await p.evaluate(() => { const r = document.querySelector("[data-region-card]"), k = document.querySelector("[data-key-dates]"); return !!(r.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING); }), "the region at a glance comes before the key dates");
    const cta = await p.$$eval(".hero .cta .btn", (bs) => bs.map((b) => Math.round(b.getBoundingClientRect().width)));
    ok(cta.length === 2 && cta[0] === cta[1], "the two main buttons are the same width " + JSON.stringify(cta)); }
  ok((await p.$$eval("[data-key-dates] a", (as) => as.map((a) => a.href))).every((u) => /^https:\/\/www\.sos\.ca\.gov\//.test(u)), "key dates link only to the Secretary of State");
  { const today = new Date().toISOString().slice(0, 10), past = await p.$$eval("[data-key-dates] li.past time", (ts) => ts.map((t) => t.getAttribute("datetime")));
    ok(past.every((d) => d <= today), "only past dates are marked Passed"); }
  ok((await p.$$eval("[data-tool-steps] li", (ls) => ls.length)) === 3, "home shows the three tool steps");
  const bars = await p.$$eval("[data-coverage-bars] tbody tr", (rs) => rs.map((r) => ({ c: r.querySelector("th a").getAttribute("href"), t: r.querySelector(".barnum").textContent })));
  ok(bars.length === 9, "coverage bars have a row for each county");
  for (const r of bars) {
    const cid = r.c.replace("#/ballot/", ""), ms = localMeasuresIn(cid);
    ok(r.t.startsWith(ms.length + " listed") && (ms.length === 0 || r.t.includes(ms.filter((m) => m.ballotQuestion).length + " with ballot question")), `coverage bar for ${cid} matches data: "${r.t}"`);
  }
  // Evidence cues on an item page: counts from the record, and "Show sources" opens them without changing the address.
  { const m = D.measures.find((x) => x.id === "2026-11-03.ca-alameda-berkeley.measure-u");
    await go(p, "#/item/" + encodeURIComponent(m.id), ".detail");
    const off = m.sources.filter((x) => /^Official\b/.test(x.type || "")).length;
    ok((await p.locator(".evline").innerText()).includes(`${m.sources.length} sources, ${off} official`), "evidence line counts the record's sources");
    await p.evaluate(() => { document.getElementById("sources").open = false; });
    const before = p.url();
    await p.click("button[data-jump=sources]");
    ok(await p.evaluate(() => document.getElementById("sources").open && document.activeElement === document.querySelector("#sources summary")), "Show sources opens the sources and moves focus to them");
    ok(p.url() === before, "Show sources does not change the page address");
    ok((await p.$$eval("#sources .role.official", (r) => r.length)) === off, "official sources are marked as official"); }
  { const m = D.measures.find((x) => x.level !== "state" && !x.measureType);
    await go(p, "#/item/" + encodeURIComponent(m.id), ".detail");
    ok((await p.locator("p.official").innerText()).includes("Type not collected yet."), "a missing measure type is labeled as not collected"); }
  await go(p, "#/");

  // ---------- Beta notice and About page ----------
  // Oct 29, 2026: the beta banner and the "Local coverage is incomplete" warning are gone from every page. Status, scope,
  // sources and development are stated once on About this guide, reached from the header on every page.
  for (const h of ["#/", "#/find", "#/ballot/ca-napa", "#/contests", "#/about"]) {
    await go(p, h);
    ok((await p.$$eval("aside.beta, .beta-tag", (e) => e.length)) === 0 && !/Coverage and evidence are still being verified|Local coverage is incomplete/.test(await p.evaluate(() => document.body.innerText)), `no warning banner on ${h}`);
    ok(await p.locator('#topnav a[href="#/about"]').count() === 1, `About this guide is linked from the header on ${h}`);
  }
  await go(p, "#/");
  await p.click('[data-scope-note] a[href="#/about"]'); await p.waitForSelector("[data-about] h1");
  ok((await p.textContent("h1")).trim() === "About this guide", "the home scope note links to About this guide");
  { const core = (await p.locator("[data-about-core]").innerText()).replace(/\s+/g, " ");
    ok(["Coverage", "Sources and methodology", "Development status"].every((h) => core.includes(h)) && /independent, unofficial civic information resource/.test(core) && /not a complete list/.test(core) && /consult your county elections office/.test(core) && /not official government ratings or independent validations/.test(core) && /does not make this guide’s summaries or ratings official/.test(core), "About this guide states status, coverage, sources and methodology, and development, with every limit kept");
    ok(await p.isVisible("[data-about-core]"), "the About statement is visible without expanding anything"); }
  ok(await p.evaluate(() => document.activeElement && document.activeElement.tagName === "H1"), "focus moves to the About heading");
  const about = (await main(p));
  for (const t of ["are not official government ratings or independent validations", "Only an official review confirms a fact", "districts that include Bay Area counties", "Software tests", "Automated and AI-assisted reading", "Official review", "Completeness", "may apply", "It is not an official recommendation", "Proposition 44", "Propositions 37 and 38", "accountability went from 5 to 4", "stayed at 3", "Research pending", "Insufficient evidence", "Evidence ratings and your preferences"]) ok(about.includes(t), `About covers "${t}"`);
  ok(!/automated (tests|checks) (verify|confirm) (facts|accuracy)/i.test(about), "About does not say automated checks verify facts");
  await p.goBack(); await p.waitForSelector("[data-region-card]");
  ok(new URL(p.url()).hash === "#/" || new URL(p.url()).hash === "", "back from About returns home");
  await collectBadges();

  // ---------- Find: only the nine Bay Area counties ----------
  await go(p, "#/find", "#findform");
  const cc = await countyControl(p);
  ok(cc, 'county control labeled "Select a Bay Area county"');
  ok((await main(p)).includes("Choose one of the nine counties in the San Francisco Bay Area."), "county subtitle exact");
  const choices = (await countyChoices(p)) || [];
  ok(choices.length === 9 && D.bayIds.every((id) => choices.includes(id)), "exactly the 9 region.json counties: " + choices.join(", "));
  ok(!others.some((c) => choices.includes(c.id)), "none of the other 49 counties in the Bay Area selector");
  const otherOpts = await p.$$eval("#findform option", (os) => os.map((o) => o.value));
  ok(!others.some((c) => otherOpts.includes(c.id)), "no other-California-county dropdown in the find flow");
  ok(!!(await p.getByLabel("Select a city or town").count()), 'city control labeled "Select a city or town"');

  // Each county shows exactly its own cities; unincorporated and not-sure options follow the data.
  for (const c of bay) {
    await go(p, "#/find", "#findform");
    await chooseCounty(p, c.id);
    const opts = (await cityOptions(p)) || [];
    const dataCities = D.citiesOf(c.id).map((x) => x.id).sort();
    const shownCities = opts.filter((o) => D.J.has(o.value) && D.J.get(o.value).type === "city").map((o) => o.value).sort();
    const extra = opts.filter((o) => o.value && !(D.J.has(o.value) && D.J.get(o.value).type === "city"));
    const unin = extra.filter((o) => /^Unincorporated area of /.test(o.text));
    const notSure = extra.filter((o) => /not sure/i.test(o.text));
    const unknown = extra.filter((o) => !unin.includes(o) && !notSure.includes(o));
    ok(JSON.stringify(shownCities) === JSON.stringify(dataCities), `${c.id}: city options equal the ${dataCities.length} cities in data (shown ${shownCities.length}${shownCities.filter((x) => !dataCities.includes(x)).length ? ", wrong: " + shownCities.filter((x) => !dataCities.includes(x)).join(",") : ""})`);
    ok(!unknown.length, `${c.id}: no unexpected city options: ${unknown.map((o) => o.text).join(", ")}`);
    if (c.consolidatedCity) {
      ok(opts.some((o) => o.value === c.consolidatedCity && o.selected) || (await citySelect(p).inputValue()) === c.consolidatedCity, `${c.id}: consolidated city selected automatically`);
      ok(!unin.length, `${c.id}: no unincorporated option for a consolidated city and county`);
    } else {
      const listed = !!(c.unincorporated && c.unincorporated.listed);
      ok(unin.length === (listed ? 1 : 0), `${c.id}: unincorporated option ${listed ? "present" : "absent"} as data says`);
      if (listed) ok(unin[0].text === `Unincorporated area of ${c.name}`, `${c.id}: unincorporated wording "${unin[0] && unin[0].text}"`);
      ok(notSure.length === 1 && !/unincorporated/i.test(notSure[0].text), `${c.id}: "not sure" is a separate option`);
    }
    if ((c.cityInventory || {}).status !== "complete") ok(/not (been )?fully collected|not complete/i.test(await main(p)), `${c.id}: incomplete city list is disclosed`);
  }

  // Incomplete or missing city lists are disclosed (simulated by serving modified data to this page only).
  {
    const sp = await ctx.newPage();
    const jur = readJSON("data/jurisdictions.json");
    const marin = jur.jurisdictions.find((j) => j.id === "ca-marin"), napa = jur.jurisdictions.find((j) => j.id === "ca-napa");
    marin.cityInventory = { status: "not-collected" };
    jur.jurisdictions = jur.jurisdictions.filter((j) => !(j.type === "city" && j.parent === "ca-marin"));
    napa.cityInventory = { status: "partial", source: "https://census.bayareametro.gov/cities-counties", checked: "2026-10-23" };
    await blockExternal(sp, new Set(), (r) => (/\/data\/jurisdictions\.json/.test(r.request().url()) ? r.fulfill({ contentType: "application/json", body: JSON.stringify(jur) }) : r.continue()));
    await sp.goto(B + "#/find"); await sp.waitForSelector("#findform");
    await chooseCounty(sp, "ca-marin");
    const t1 = (await sp.textContent("main")) || "";
    ok(/City and town coverage for this county has not been fully collected yet/.test(t1), "no cities collected: exact disclosure");
    ok(await sp.locator(`a[href="${marin.electionsUrl}"]`).count(), "no cities collected: links the official county election website");
    await chooseCounty(sp, "ca-napa");
    ok(/not (been )?fully collected|not complete/i.test((await sp.textContent("main")) || ""), "partial city list: disclosed");
    await sp.close();
  }

  // Changing the county resets the city.
  await go(p, "#/find", "#findform");
  await chooseCounty(p, "ca-alameda"); await citySelect(p).selectOption("ca-alameda-oakland");
  await chooseCounty(p, "ca-marin");
  const afterSwitch = (await cityOptions(p)) || [];
  ok(!afterSwitch.some((o) => o.value === "ca-alameda-oakland"), "county change removes the other county's cities");
  ok(!(await citySelect(p).inputValue()) || !D.J.has(await citySelect(p).inputValue()), "county change resets the city");

  // San Francisco needs no city choice, and its measures show on #/ballot/ca-sf.
  await go(p, "#/find", "#findform");
  await chooseCounty(p, "ca-sf"); await submit(p);
  ok(/^#\/ballot\/ca-sf(\/ca-sf-city)?$/.test(await p.evaluate(() => location.hash)), "SF submits without a city choice: " + (await p.evaluate(() => location.hash)));
  await go(p, "#/ballot/ca-sf", ".group"); await openAll(p);
  const sfLinks = await p.$$eval('a[href^="#/item/"]', (as) => as.map((a) => decodeURIComponent(a.getAttribute("href").slice(7))));
  ok(sfMeasures.length > 0 && sfMeasures.every((m) => sfLinks.includes(m.id)), `#/ballot/ca-sf shows all ${sfMeasures.length} San Francisco measures (missing: ${sfMeasures.filter((m) => !sfLinks.includes(m.id)).map((m) => m.identifier).join(", ")})`);
  ok(!/Pick your city/i.test(await main(p)), "SF ballot does not ask for a city");
  await collectBadges();

  // A Bay Area ballot with a city
  await go(p, "#/find", "#findform");
  await chooseCounty(p, "ca-alameda"); await citySelect(p).selectOption("ca-alameda-oakland"); await submit(p);
  await p.waitForSelector(".group");
  ok((await H1(p)).includes("Oakland"), "Oakland ballot h1");
  const groups = await p.$$eval(".group", (g) => g.map((x) => x.dataset.group + ":" + x.querySelectorAll(".row").length));
  ok(groups.includes("state:" + statewide.length), `${statewide.length} statewide rows: ${groups.join(" ")}`);
  await openAll(p); await collectBadges();
  ok((await main(p)).includes("Incomplete (required info or evidence is missing)"), "exact Incomplete label");
  // Unincorporated area: no city measures.
  await go(p, "#/ballot/ca-alameda/unincorporated", "h1"); await openAll(p);
  const uLinks = await p.$$eval('a[href^="#/item/"]', (as) => as.map((a) => decodeURIComponent(a.getAttribute("href").slice(7))));
  ok(!(await isErrorPage(p)) && (await H1(p)).includes("Alameda"), "unincorporated Alameda is a valid place: " + (await H1(p)));
  ok(!uLinks.some((id) => { const m = D.measures.find((x) => x.id === id); return m && m.level === "city"; }), "unincorporated area shows no city measures");

  // ---------- Invalid places fail gracefully, with no false heading ----------
  const invalid = [
    ["#/ballot/ca-nowhere", (h) => !/^Ballot choices/i.test(h) && !/nowhere/i.test(h)],
    ["#/ballot/ca-alameda/ca-nowhere", (h) => !/nowhere/i.test(h)],
    ["#/ballot/ca-marin/ca-alameda-oakland", (h) => !/Oakland/i.test(h)],
    ["#/ballot/ca-alameda/ca-alameda-oakland-council-district-2", (h) => !/Council|District 2/i.test(h)],
    ["#/ballot/ca-sf/unincorporated", (h) => !/Unincorporated/i.test(h)],
    ["#/ballot/ca-alameda-oakland", (h) => !/^Ballot choices for Oakland/i.test(h)],
  ];
  for (const [h, noFalse] of invalid) {
    await go(p, h);
    const head = await H1(p), text = await main(p);
    ok(noFalse(head), `${h}: no false heading (got "${head}")`);
    ok(/not (listed|found|in|a county)|isn.t (listed|in)|no unincorporated|could not find|unknown/i.test(text), `${h}: clear message`);
    ok(await p.locator('main a[href^="#/find"], main a[href="#/"]').count(), `${h}: a way back`);
  }
  for (const [h, expCounty, badCity] of [["#/find?county=ca-fresno", "", null], ["#/find?county=ca-alameda-oakland", "", null], ["#/find?county=ca-alameda&city=ca-marin-novato", "ca-alameda", "ca-marin-novato"]]) {
    await go(p, h, "#findform");
    ok((await checkedCounty(p)) === expCounty, `${h}: county preselected only when valid (got "${await checkedCounty(p)}")`);
    if (badCity) ok((await citySelect(p).inputValue()) !== badCity, `${h}: city from another county is not preselected`);
  }

  // ---------- Back and forward restore valid state ----------
  await go(p, "#/find", "#findform");
  await chooseCounty(p, "ca-alameda"); await citySelect(p).selectOption("ca-alameda-oakland"); await submit(p);
  ok((await H1(p)).includes("Oakland"), "submit goes to the Oakland ballot");
  await go(p, "#/ballot/ca-marin/ca-marin-novato");
  await p.goBack(); await p.waitForTimeout(150); ok((await H1(p)).includes("Oakland"), "back restores the Oakland ballot");
  await p.goForward(); await p.waitForTimeout(150); ok((await H1(p)).includes("Novato"), "forward restores the Novato ballot");
  await p.goBack(); await p.waitForTimeout(150); await p.goBack(); await p.waitForSelector("#findform");
  ok((await checkedCounty(p)) === "ca-alameda" && (await citySelect(p).inputValue()) === "ca-alameda-oakland", "back to Find restores county and city");
  await go(p, "#/ballot/ca-alameda/ca-alameda-oakland");
  await p.click('main a.back:has-text("Change place"), main a:has-text("Change place")'); await p.waitForSelector("#findform");
  ok((await checkedCounty(p)) === "ca-alameda" && (await citySelect(p).inputValue()) === "ca-alameda-oakland", "Change place keeps county and city");

  // ---------- Outside the Bay Area ----------
  // Board of Equalization districts with an exact county list (round 2): Solano is wholly in District 1; San Bernardino is split between 1 and 4.
  const boeRows = async () => p.$$eval("main a.row", (rs) => rs.map((r) => r.textContent.replace(/\s+/g, " ")).filter((t) => /Board of Equalization/.test(t)));
  await go(p, "#/ballot/ca-solano", ".group"); await openAll(p);
  { const r = await boeRows(); ok(r.length === 1 && /District 1/.test(r[0]) && !/May apply/.test(r[0]), "Solano shows BOE District 1 as applying: " + r.join(" | ")); }
  await go(p, "#/ballot/ca-san-bernardino", ".group"); await openAll(p);
  { const r = await boeRows(); ok(r.length === 2 && r.every((t) => /county is split between districts/.test(t)), "San Bernardino shows BOE 1 and 4 as may apply, split county: " + r.join(" | ")); }
  await go(p, "#/ballot/ca-fresno", ".group");
  ok((await main(p)).includes(OUTSIDE_BAY_MSG), "outside-Bay message exact on #/ballot/ca-fresno");
  ok((await p.$$eval('.group[data-group="state"] .row', (r) => r.length)) === statewide.length, `outside-Bay ballot keeps the ${statewide.length} statewide items`);
  ok(await p.locator('main a[href^="propositions.html"]').count(), "outside-Bay page links to the statewide propositions");
  await go(p, "#/");
  const stLinks = await p.$$eval('main a[href^="#/"]', (as) => as.filter((a) => /statewide/i.test(a.textContent)).map((a) => a.getAttribute("href")));
  let found = false;
  for (const h of stLinks) { await go(p, h); if ((await main(p)).includes(OUTSIDE_BAY_MSG)) found = true; }
  ok(found, "a statewide section linked from home shows the outside-Bay message: " + stLinks.join(", "));

  // ---------- District limitations note ----------
  for (const h of ["#/find", "#/ballot/ca-alameda/ca-alameda-oakland", "#/ballot/ca-sf"]) {
    await go(p, h); await openAll(p);
    const t = (await main(p)).replace(/\s+/g, " ");
    ok(/school/i.test(t) && /community college/i.test(t) && /special/i.test(t) && /legislative/i.test(t) && /may not match/i.test(t), `${h}: district limitations note`);
    const note = p.locator('main [data-district-note], main [role="note"]:has-text("may not match")').first();
    const noteText = (await note.count()) ? await note.innerText() : "";
    ok(/sample ballot/i.test(noteText) && (await note.locator('a[href^="https://"]').count()) > 0, `${h}: district note links to where the official sample ballot is found`);
    ok(!/(shows|lists|identifies|includes) (every|all) (contest|item|measure)s? on your ballot/i.test(t), `${h}: never claims to identify every contest`);
  }

  // ---------- Status wording and incomplete items ----------
  const sampleIncomplete = [...new Map(incomplete.map((m) => [D.countyOf(D.J.get(m.jurisdiction))?.id, m])).values()].slice(0, 6);
  for (const m of sampleIncomplete) {
    await go(p, "#/item/" + encodeURIComponent(m.id), ".detail"); await openAll(p); await collectBadges();
    ok((await p.textContent(".badge")).trim() === "Incomplete (required info or evidence is missing)", `${m.id}: Incomplete badge`);
    ok(await p.isVisible('[data-status-note="incomplete"]'), `${m.id}: explanation of what is missing`);
    ok(!(await main(p)).includes("Not yet researched"), `${m.id}: empty fields never say "Not yet researched"`);
  }
  for (const h of ["#/contests", "#/contest/2026-11-03.ca.governor", "#/browse"]) { await go(p, h); await openAll(p); await collectBadges(); }
  ok([...badges].every((l) => STATUS_LABELS.includes(l)), "badge wording exact: " + [...badges].join(" | "));
  ok(![...badges].includes("Needs human review"), '"Needs human review" absent');
  ok([...badges].includes("Needs review"), '"Needs review" badge present');
  // Lists leave out "Needs review" (explained once in the beta notice and About page); Incomplete and "may apply" stay.
  for (const h of ["#/ballot/ca-alameda/ca-alameda-oakland", "#/contests", "#/statewide", "#/ballot/ca-sf"]) {
    await go(p, h); await openAll(p);
    const rowBadges = await p.$$eval("main a.row .badge, main a.cand .badge", (bs) => bs.map((b) => b.textContent.trim()));
    ok(!rowBadges.includes("Needs review"), `${h}: no "Needs review" badge in lists`);
  }
  await go(p, "#/ballot/ca-alameda/ca-alameda-oakland"); await openAll(p);
  { const rows = await p.$$eval("main a.row", (rs) => rs.map((r) => ({ href: decodeURIComponent(r.getAttribute("href")), badge: (r.querySelector(".badge") || {}).textContent || "", text: r.textContent.replace(/\s+/g, " ") })));
    const byId = new Map(D.measures.concat(D.contests).map((x) => [x.id, x]));
    const recs = rows.map((r) => ({ r, x: byId.get(r.href.replace(/^#\/(item|contest)\//, "")) || (/^propositions\.html.*#prop-(\d+)$/.test(r.href) ? statewide.find((m) => m.detailUrl === "propositions.html#prop-" + r.href.match(/#prop-(\d+)$/)[1]) : null) })).filter((o) => o.x);
    ok(recs.length > 20 && recs.every((o) => (o.x.status === "incomplete") === /^Incomplete/.test(o.r.badge)), "Oakland: every Incomplete item, and only those, keeps its badge in the list (" + recs.length + " rows)");
    ok(rows.some((o) => /May apply/.test(o.text)), "Oakland: district items still say May apply"); }
  // The status stays on each record's own page.
  await go(p, "#/contest/" + uncovered.id, ".detail");
  ok((await p.textContent(".meta .badge")).trim() === "Needs review" && await p.isVisible('[data-status-note="needs-review"]'), "a Needs review record shows its status and what still needs checking on its own page");
  // Item-level warnings where facts rest on OCR or an AI reading of a page image.
  for (const rec of D.measures.filter((x) => x.level !== "state").concat(D.contests).filter((x) => x.readingNote).slice(0, 40)) {
    await go(p, (rec.office ? "#/contest/" : "#/item/") + encodeURIComponent(rec.id), ".detail");
    ok((await p.locator("[data-reading-note]").innerText()).includes("This reading has not been officially reviewed"), `${rec.id}: reading note shown near its facts`);
  }
  { const c = D.contests.find((x) => x.readingNote && x.candidates && x.candidates.length);
    await go(p, "#/candidate/" + encodeURIComponent(c.candidates[0]), ".detail");
    ok(await p.isVisible("[data-reading-note]"), "candidate page repeats its contest's reading note"); }

  // ---------- Robustness ----------
  await go(p, "#/item/nope"); ok((await H1(p)) === "Not found", "unknown item");
  await go(p, "#/candidate/constructor"); ok((await H1(p)) === "Not found", "prototype names are not records");
  await go(p, "#/item/%E0%A4%A"); ok((await H1(p)).length > 0, "malformed percent-encoding still renders a page");
  await go(p, "#/zzz"); ok((await H1(p)) === "Not found", "unknown route");
  {
    const p2 = await ctx.newPage(); const e2 = []; watchErrors(p2, e2);
    await blockExternal(p2, new Set(), (r) => (/\/data\/jurisdictions\.json/.test(r.request().url()) ? r.fulfill({ status: 404, body: "x" }) : r.continue()));
    await p2.goto(B); await p2.waitForSelector("h1");
    ok(/Something went wrong/.test(await p2.textContent("h1")), "load error state");
    await p2.close();
  }
  // Security: route and search text must never be interpreted as HTML
  await go(p, "#/item/%3Cimg%20src%3Dx%20onerror%3D%22window.__xss%3D1%22%3E");
  await go(p, "#/ballot/ca-alameda/ca-alameda-oakland", "#q");
  await p.fill("#q", '<img src=x onerror="window.__xss=2">'); await p.waitForTimeout(200);
  await go(p, "#/find?county=%22%3E%3Cimg%20src%3Dx%20onerror%3D%22window.__xss%3D3%22%3E");
  ok(await p.evaluate(() => window.__xss === undefined), "no script injection through routes or search");
  // Privacy: the guide stores nothing and sets no cookies
  ok(await p.evaluate(() => { try { return localStorage.length === 0 && sessionStorage.length === 0; } catch (e) { return true; } }), "guide writes no browser storage");
  ok((await ctx.cookies()).length === 0, "no cookies set");

  // ---------- Internal links ----------
  const linkPages = ["#/", "#/find?county=ca-alameda", "#/ballot/ca-sf", "#/ballot/ca-alameda/ca-alameda-oakland", "#/ballot/ca-fresno", "#/contests", "#/browse"];
  const seen = new Set();
  for (const h of linkPages) {
    await go(p, h);
    const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute("href")))]);
    for (const l of links) {
      if (seen.has(l)) continue; seen.add(l);
      await go(p, l);
      if (await isErrorPage(p)) ok(false, `broken internal link ${l} on ${h}: "${await H1(p)}"`);
    }
    ok(true, `internal links checked on ${h} (${links.length})`);
  }
  ok(await p.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].every((a) => /noopener/.test(a.rel))), "new-tab links use rel=noopener");
  ok(errs.length === 0, "console errors: " + errs.slice(0, 5).join(" | "));
  await ctx.close();


  // ---------- Ballot cheat sheet, sharing and How to vote ----------
  { const cu = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await cu.newPage(); await blockExternal(p, new Set());
    await go(p, "#/ballot/ca-alameda/ca-alameda-fremont");
    ok((await p.getAttribute("[data-sheet-cta] a.btn.primary", "href")) === "#/sheet/ca-alameda/ca-alameda-fremont", "the ballot page links to its cheat sheet");
    ok(/#\/ballot\/ca-alameda\/ca-alameda-fremont$/.test(await p.getAttribute("[data-sheet-cta] [data-share]", "data-url")), "the ballot page shares its own link");
    const rows = await p.evaluate(() => document.querySelectorAll("main a.row").length);
    await go(p, "#/sheet/ca-alameda/ca-alameda-fremont", ".srow");
    const sheet = await p.evaluate(() => ({ m: document.querySelectorAll(".srow:not(.contest)").length, st: document.querySelectorAll(".sheet-sec .srow .lean").length, place: document.querySelector(".place").textContent }));
    ok(sheet.st === 14 && sheet.place === "Fremont, Alameda County", "sheet lists all 14 statewide propositions for Fremont: " + JSON.stringify(sheet));
    const contestsOnBallot = await p.evaluate(() => document.querySelectorAll(".srow.contest").length);
    ok(sheet.m + contestsOnBallot <= rows, "sheet items come from the same ballot list (" + (sheet.m + contestsOnBallot) + " of " + rows + " rows, contests without candidates left off)");
    ok((await p.$$eval(".srow.contest", (r) => r.every((x) => x.querySelectorAll(".cands input").length > 0))), "every contest on the sheet has candidates to tick");
    const y = p.locator(".srow:not(.contest)").first().locator('input[value="yes"]'), n = p.locator(".srow:not(.contest)").first().locator('input[value="no"]');
    await y.check(); await n.check();
    ok(!(await y.isChecked()) && (await n.isChecked()), "YES and NO cannot both be ticked");
    await p.reload(); await p.waitForSelector(".srow");
    ok(await p.locator(".srow:not(.contest)").first().locator('input[value="no"]').isChecked(), "marks survive a reload");
    await p.evaluate(() => { const d = document.querySelector("details.maybe"); if (d) d.open = true; });
    const seats1 = p.locator('.srow.contest .cands[data-seats="1"]').filter({ has: p.locator("li:nth-child(2)") }).first();
    await seats1.locator("li:nth-child(1) input").check(); await seats1.locator("li:nth-child(2) input").click();
    ok((await seats1.locator("input:checked").count()) === 1, "a vote-for-1 contest keeps one tick");
    const stored = await p.evaluate(() => localStorage.getItem("ballot-sheet-v1"));
    ok(stored && Object.keys(JSON.parse(stored)).length === 2, "marks are stored in this browser");
    ok(!/[?&](yes|no|m)=/.test(await p.getAttribute("[data-share]", "data-url")), "the shared link carries no marks");
    await p.click("#sheet-clear");
    ok((await p.locator(".srow input:checked").count()) === 0 && (await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem("ballot-sheet-v1") || "{}")).every((v) => v === ""))), "Clear my marks leaves every box blank");
    ok((await p.getAttribute('.srow .lean a', "href")).startsWith("propositions.html?from=%23%2Fsheet%2Fca-alameda%2Fca-alameda-fremont"), "proposition links open the tool with a way back to the sheet");
    await p.goto(B + "propositions.html"); await p.waitForSelector("#props article.prop");
    await p.evaluate(() => localStorage.setItem("ballot-weighing-v2", JSON.stringify({ w: {}, g: { 1: 2 } })));
    await p.reload(); await p.waitForSelector("#props article.prop");
    const tl = await p.textContent("#v-1");
    await go(p, "#/sheet/ca-alameda/ca-alameda-fremont", ".srow");
    ok((await p.textContent('.srow[data-id$="prop-1"] .lean b').catch(() => "")) === tl, "the sheet shows the lean the tool computed for Prop 1: " + tl);
    await p.emulateMedia({ media: "print" });
    ok(await p.evaluate(() => [".topbar", ".beta", ".share", "#sheet-print"].every((s) => { const e = document.querySelector(s); return !e || e.getClientRects().length === 0; }) && getComputedStyle(document.querySelector(".print-only")).display !== "none"), "print hides the menu, beta notice and buttons, and shows the page address");
    await p.emulateMedia({ media: "screen" });
    await go(p, "#/how-to-vote", "[data-voter-tools]");
    const htv = await p.evaluate(() => ({ dates: document.querySelectorAll("[data-key-dates] li").length, tools: [...document.querySelectorAll("[data-voter-tools] a")].map((a) => a.href), counties: document.querySelectorAll("[data-county-offices] li").length, cur: document.querySelector('.topnav a[aria-current="page"]')?.getAttribute("href") }));
    ok(htv.dates > 0 && htv.counties === 9 && htv.cur === "#/how-to-vote" && htv.tools.every((u) => u.startsWith("https://")), "How to vote shows key dates, official tools and all 9 county offices: " + JSON.stringify({ d: htv.dates, c: htv.counties }));
    await go(p, "#/sheet/ca-nowhere"); ok(/Not found/.test(await p.textContent("h1")), "an unknown county on the sheet shows Not found");
    await cu.close(); }


  // ---------- Weighing Tool answers carry over to the cheat sheet (Oct 26, 2026) ----------
  { const cu = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await cu.newPage(); await blockExternal(p, new Set());
    const FROM = "propositions.html?from=%23%2Fballot%2Fca-alameda%2Fca-alameda-fremont&place=Fremont%2C%20Alameda%20County";
    const SHEET = "#/sheet/ca-alameda/ca-alameda-fremont";
    const row = (n) => '.srow[data-id="2026-11-03.ca.prop-' + n + '"]';
    const ticks = (n) => p.$eval(row(n), (r) => [...r.querySelectorAll("input")].filter((i) => i.checked).map((i) => i.value).join("") || "blank");
    await p.goto(B + FROM); await p.waitForSelector("#props article.prop");
    ok((await p.getAttribute("#take-a", "href")) === "index.html" + SHEET, "from a Fremont ballot, the tool's cheat sheet button goes to Fremont's sheet");
    await p.click('label[for="g-1-3"]'); await p.click('label[for="g-2-1"]'); await p.click('label[for="g-3-2"]');
    ok(/11 propositions are still unanswered and will be blank on your sheet/.test(await p.textContent("#take-p")) && (await p.textContent("#next-top")).trim() === "See my ballot" && await p.isHidden("#done"), "partly answered: Step 3 says 11 will be blank, no completion message yet");
    await p.goto(B + "index.html" + SHEET); await p.waitForSelector(row(1));
    ok((await ticks(1)) === "yes" && (await ticks(2)) === "no" && (await ticks(3)) === "blank" && (await ticks(4)) === "blank", "Yes and No carry over; Not sure (Prop 3) and unanswered (Prop 4) stay blank");
    ok(/From your Weighing Tool answer, Yes/.test(await p.textContent(row(1) + " .lean")) && /Not sure in the Weighing Tool, so left blank/.test(await p.textContent(row(3) + " .lean")) && /Not answered in the Weighing Tool, so left blank/.test(await p.textContent(row(4) + " .lean")), "each statewide row says where its tick came from");
    ok(/1 Yes and 1 No ticked for you\. 1 Not sure left blank\. 11 not answered, left blank\./.test(await p.textContent("#from-sum")), "the summary counts what was carried over: " + (await p.textContent("#from-sum")).trim());
    // A change on the sheet wins and is kept; the tool answer can be restored.
    await p.click(row(1) + ' input[value="no"]');
    ok((await ticks(1)) === "no" && /Changed on this sheet\. Your Weighing Tool answer is Yes/.test(await p.textContent(row(1) + " .lean")) && (await p.evaluate(() => document.activeElement.value)) === "no", "changing Prop 1 to NO on the sheet is shown as your own change, and focus stays on NO");
    await p.click(row(2) + ' input[value="no"]');
    ok((await ticks(2)) === "blank", "unticking a carried-over box leaves it blank");
    await p.reload(); await p.waitForSelector(row(1));
    ok((await ticks(1)) === "no" && (await ticks(2)) === "blank", "sheet changes survive a refresh");
    // A later change in the tool carries over only where the voter has not changed the sheet.
    await p.goto(B + FROM); await p.waitForSelector("#props article.prop");
    await p.click('label[for="g-4-3"]'); await p.click('label[for="g-1-2"]');
    await p.goto(B + "index.html" + SHEET); await p.waitForSelector(row(1));
    ok((await ticks(4)) === "yes" && (await ticks(1)) === "no", "a new tool answer (Prop 4 Yes) carries over; the sheet's own change to Prop 1 is kept");
    await p.click(row(1) + " .use-tool");
    ok((await ticks(1)) === "blank" && /Not sure in the Weighing Tool/.test(await p.textContent(row(1) + " .lean")), "Use it brings back the tool answer, now Not sure, so Prop 1 is blank");
    await p.click("#sheet-clear");
    ok((await p.locator(".srow input:checked").count()) === 0, "Clear my marks blanks the carried-over ticks too");
    await p.click('#from-sum .use-tool');
    ok((await ticks(2)) === "no" && (await ticks(4)) === "yes" && (await ticks(1)) === "blank" && (await ticks(3)) === "blank", "Use all my Weighing Tool answers restores every carried-over tick");
    // Opened directly, the tool sends the voter through Find My Ballot to the sheet.
    const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await c2.newPage(); await blockExternal(q, new Set());
    await q.goto(B + "propositions.html"); await q.waitForSelector("#props article.prop");
    ok((await q.getAttribute("#take-a", "href")) === "index.html#/find?next=sheet" && /Choose your place/.test(await q.textContent("#take-a")), "opened directly, the tool's button asks for the voter's place first");
    for (const n of ["1", "2", "3", "4", "5", "37", "38", "39", "40", "41", "42", "43", "44"]) await q.click('label[for="g-' + n + '-3"]');
    ok(await q.isHidden("#done"), "no completion message at 13 of 14");
    await q.click('label[for="g-45-1"]');
    ok(await q.isVisible("#prop-45 #done") && /That's all 14/.test(await q.textContent("#done")) && (await q.textContent("#next-top")).trim() === "Next: my cheat sheet" && (await q.getAttribute("#next-top", "href")) === "index.html#/find?next=sheet", "the 14th answer shows That's all 14 under that card, and the sticky bar becomes Next: my cheat sheet");
    ok(/You've answered all 14/.test(await q.textContent("#take-h")), "Step 3 says all 14 are answered");
    await q.click("#clr-45");
    ok(await q.isHidden("#done") && (await q.textContent("#next-top")).trim() === "See my ballot", "clearing an answer hides the completion message again");
    await q.click('label[for="g-45-1"]');
    await q.click("#done a.btn-go"); await q.waitForSelector("#findform");
    ok(/next=sheet/.test(q.url()) && (await q.textContent("#go")).trim() === "Open my cheat sheet", "Find My Ballot opens ready to go on to the cheat sheet");
    await chooseCounty(q, "ca-alameda"); await citySelect(q).selectOption("ca-alameda-fremont");
    ok(/next=sheet/.test(q.url()), "choosing a place keeps the next step in the address");
    await q.click("#go"); await q.waitForSelector(".srow");
    ok(q.url().endsWith(SHEET) && (await q.$eval(row(45), (r) => r.querySelector('input[value="no"]').checked)) && (await q.$eval(row(1), (r) => r.querySelector('input[value="yes"]').checked)), "it opens Fremont's cheat sheet with all 14 answers ticked");
    await c2.close(); await cu.close(); }

  // ---------- Statewide propositions open in the Ballot Weighing Tool (one experience) ----------
  { const T = (h) => h.match(/#prop-(\d+)$/);
    const cu = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await cu.newPage(); await blockExternal(p, new Set());
    await go(p, "#/ballot/ca-alameda"); await openAll(p);
    const st = await p.$$eval('.group[data-group="state"] a.row', (as) => as.map((a) => [a.getAttribute("href"), a.querySelector(".rid").textContent.trim()]));
    ok(st.length === 14 && st.every(([h, id]) => /^propositions\.html\?from=%23%2Fballot%2Fca-alameda&place=Alameda%20County#prop-\d+$/.test(h) && "Prop " + T(h)[1] === id), "Alameda: all 14 statewide rows open their own card in the tool, with the way back: " + st.slice(0, 2).map((x) => x[0]).join(" "));
    ok(statewide.every((m) => st.some(([h]) => "propositions.html#prop-" + T(h)[1] === m.detailUrl)), "each statewide record maps to its tool card");
    const loc = await p.$$eval('main a.row', (as) => as.map((a) => a.getAttribute("href")).filter((h) => !/^propositions\.html/.test(h)));
    const locRecs = loc.filter((h) => h.startsWith("#/item/")).map((h) => D.measures.find((m) => m.id === decodeURIComponent(h.slice(7))));
    ok(locRecs.length > 0 && locRecs.every((m) => m && m.level !== "state"), "local measures keep their own pages (" + locRecs.length + ")");
    { const btn = p.locator('.group[data-group="state"] [data-tool-all]');
      ok((await btn.innerText()).trim() === "Go to Ballot Weighing Tool \u2014 All 14 Propositions" && (await btn.getAttribute("href")) === "propositions.html?from=%23%2Fballot%2Fca-alameda&place=Alameda%20County", "the full-tool button sits above the statewide list with the way back");
      const before = await p.evaluate(() => { const g = document.querySelector('.group[data-group="state"]'); return [g.querySelector("[data-tool-all]").getBoundingClientRect().top, g.querySelector("a.row").getBoundingClientRect().top]; });
      ok(before[0] < before[1], "the button comes before the first proposition row");
      ok((await p.$$eval('.group[data-group="state"] a.row .go', (g) => g.length)) === 14, "each proposition row says it opens in the tool");
      await p.focus('.group[data-group="state"] a.row[href$="#prop-2"]');
      ok(await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== "none" && getComputedStyle(document.activeElement).cursor === "pointer"), "rows show a focus outline and a pointer cursor");
      await btn.click(); await p.waitForSelector("#props article.prop");
      ok(/propositions\.html\?from=/.test(p.url()) && !/#prop-/.test(p.url()) && (await p.locator("article.prop").count()) === 14 && (await p.textContent("#ballot-return-a")) === "Back to your ballot: Alameda County", "the button opens the full tool with all 14 and the way back");
      await p.goBack(); await p.waitForSelector('.group[data-group="state"]'); await openAll(p); }
    await p.click('.group[data-group="state"] a.row[href$="#prop-1"]'); await p.waitForSelector("#prop-1.is-target", { timeout: 10000 });
    ok(/propositions\.html/.test(p.url()) && (await p.textContent("#ballot-return-a")) === "Back to your ballot: Alameda County" && (await p.getAttribute("#ballot-return-a", "href")) === "index.html#/ballot/ca-alameda", "Prop 1 opens in the tool with a link back to the Alameda ballot");
    ok((await p.$$eval("#fw-body li", (l) => l.length)) === 5 && await p.isVisible("#prop-1 .facts summary"), "the framework and the card's facts are on the same page");
    await p.evaluate(() => { location.hash = "#prop-44"; }); await p.waitForSelector("#prop-44.is-target");
    ok(await p.evaluate(() => !document.getElementById("prop-44").classList.contains("folded") && !document.getElementById("prop-1").classList.contains("folded") === false), "jumping to Prop 44 opens it and folds Prop 1");
    await p.reload(); await p.waitForSelector("#prop-44.is-target");
    ok((await p.textContent("#ballot-return-a")) === "Back to your ballot: Alameda County", "moving between propositions and refreshing keep the way back");
    await p.goto(B + "propositions.html"); await p.waitForSelector("#props article.prop");
    ok(await p.isHidden("#ballot-return") && await p.isHidden("#ret-mini"), "opening the tool fresh in the same tab shows no old ballot link");
    await p.goBack(); await p.waitForSelector("#props article.prop");
    ok((await p.textContent("#ballot-return-a")) === "Back to your ballot: Alameda County", "Back to the earlier visit still has its way back");
    await p.goBack(); await p.waitForSelector("#prop-1.is-target"); ok(true, "Back returns to the previous proposition");
    await p.goBack(); await p.waitForSelector("h1"); ok(/#\/ballot\/ca-alameda$/.test(p.url()), "Back again returns to the Alameda ballot");
    await go(p, "#/item/2026-11-03.ca.prop-38"); await p.waitForURL(/propositions\.html#prop-38$/, { timeout: 10000 }); await p.waitForSelector("#prop-38.is-target");
    ok(true, "an old #/item link to a statewide proposition opens that card in the tool");
    await go(p, "#/statewide"); await openAll(p);
    ok((await p.$$eval('main a.row[href^="propositions.html?from=%23%2Fstatewide"]', (a) => a.length)) === 14, "the statewide page links the 14 propositions into the tool");
    await cu.close(); }

  // ---------- Phone header, compact menu, hero and the nine requested widths (Oct 24 polish) ----------
  { const c3 = await b.newContext({ viewport: { width: 360, height: 800 } }); const m = await c3.newPage(); await blockExternal(m, new Set());
    await m.goto(B + "#/"); await m.waitForSelector("h1.hero-title");
    ok(await m.isVisible(".menu-btn") && !(await m.isVisible("#topnav")), "phone: Menu button shown and links collapsed");
    const bh = await m.$eval(".brand", (e) => e.getBoundingClientRect().height);
    ok(bh <= 46, "phone: the header title stays on one line (" + Math.round(bh) + "px)");
    await m.click(".menu-btn");
    ok((await m.getAttribute(".menu-btn", "aria-expanded")) === "true" && await m.isVisible("#topnav a[href='#/about']"), "phone: Menu opens the links");
    const tgt = await m.$$eval("#topnav a, .menu-btn", (as) => as.map((a) => a.getBoundingClientRect().height));
    ok(tgt.every((h) => h >= 44), "phone: menu targets are at least 44px tall: " + tgt.map(Math.round).join(","));
    await m.keyboard.press("Escape");
    ok((await m.getAttribute(".menu-btn", "aria-expanded")) === "false" && !(await m.isVisible("#topnav")), "phone: Escape closes the menu");
    await m.click(".menu-btn"); await m.click("#topnav a[href='#/about']"); await m.waitForSelector("[data-about]");
    ok((await m.getAttribute(".menu-btn", "aria-expanded")) === "false" && (await m.getAttribute("#topnav a[href='#/about']", "aria-current")) === "page", "phone: choosing a link navigates, closes the menu and marks the current page");
    await m.goBack(); await m.waitForSelector("h1.hero-title");
    ok((await m.textContent("h1")).replace(/\s+/g, " ").trim() === "California Bay Area Ballot Guide", "browser Back returns to the home page");
    await m.goForward(); await m.waitForSelector("[data-about]"); ok(true, "browser Forward returns to About");
    await m.goto(B + "#/"); await m.waitForSelector("h1.hero-title");
    const lines = await m.$$eval("h1.hero-title span", (sp) => sp.map((x) => x.getClientRects().length));
    ok(lines.every((n) => n === 1), "phone: 'California Bay Area' and 'Ballot Guide' each stay on one line");
    const ctaTop = await m.$eval(".cta .btn.primary", (e) => e.getBoundingClientRect().top);
    ok((await m.getAttribute(".hero .cta .btn.primary", "href")) === "propositions.html" && (await m.getAttribute(".hero .cta .btn.secondary", "href")) === "#/find", "home: the Ballot Weighing Tool leads, Find My Ballot second");
    ok((await m.$$eval("[data-attrs] li", (l) => l.map((x) => x.textContent.trim()).join("|"))) === "Source-linked information|User-controlled preferences|Transparent methodology", "home: the three key attributes");
    ok(/not an official government website/.test(await m.textContent("footer.site [data-credit]")) && /not a complete official ballot/.test(await m.textContent("[data-scope-note]")) && (await m.$$eval("[data-scope-note] a", (a) => a.map((x) => x.getAttribute("href")))).includes("https://voterguide.sos.ca.gov/"), "home: the footer says it is unofficial, and a small scope note links to the official voter guide");
    for (const h of ["#/", "#/about", "#/find", "#/how-to-vote"]) { await m.goto(B + h); await m.waitForSelector("h1"); ok((await m.$$eval('a[href*="github.com"]', (a) => a.length)) === 0, "no GitHub link on " + h); }
    await m.goto(B + "#/"); await m.waitForSelector("h1.hero-title");
    ok(/statewide propositions/.test(await m.textContent(".tagline")) && /not a complete official ballot/.test(await m.textContent("[data-scope-note]")), "home: statewide focus and local coverage limits are stated");
    ok(ctaTop < 560, "phone: the main call to action is visible without scrolling (top " + Math.round(ctaTop) + "px)");
    await c3.close();
    const c4 = await b.newContext({ viewport: { width: 1280, height: 900 } }); const d = await c4.newPage(); await blockExternal(d, new Set());
    await d.goto(B + "#/"); await d.waitForSelector("h1");
    ok(!(await d.isVisible(".menu-btn")) && await d.isVisible("#topnav a[href='#/browse']"), "desktop: links shown, no Menu button");
    await c4.close();
    const sweep = ["#/", "#/find?county=ca-contra-costa", "#/ballot/ca-santa-clara/ca-santa-clara-san-jose", "#/contests", "#/contest/2026-11-03.ca.governor", "#/candidate/2026-11-03.ca-sf.public-defender.manohar-raju", "#/browse", "#/about", "#/sheet/ca-alameda/ca-alameda-fremont", "#/how-to-vote", "#/contest/2026-11-03.ca.insurance-commissioner", "#/candidate/2026-11-03.ca.insurance-commissioner.jane-kim"];
    const over = [];
    for (const w of [320, 360, 375, 390, 414, 430, 768, 1024, 1280]) {
      const c5 = await b.newContext({ viewport: { width: w, height: 800 } }); const z = await c5.newPage(); await blockExternal(z, new Set());
      for (const h of sweep) { await z.goto(B + h); await z.waitForSelector("h1"); if (await z.$("[data-ws-all]")) await z.click("[data-ws-all]"); const sw = await z.evaluate(() => document.documentElement.scrollWidth); if (sw > w) over.push(h + "@" + w + "=" + sw); }
      await c5.close(); }
    ok(over.length === 0, "no horizontal overflow on 12 routes at 9 widths, comparison rows open from 320 to 1280: " + over.join(", "));
  }

  // ---------- Widths, themes, axe, overflow, console errors, rendered HTML ----------
  // Rendered DOM is checked with the project config, minus rules about attribute spelling that only reflect how the
  // browser serializes the DOM (open="", async="", crossorigin="") and the per-route document title length.
  const rcfg = readJSON(".htmlvalidate.json");
  const htmlv = new HtmlValidate({ ...rcfg, rules: { ...(rcfg.rules || {}), "attribute-boolean-style": "off", "attribute-empty-style": "off", "script-type": "off", "long-title": "off" } });
  const pages = ["#/", "#/find?county=ca-alameda&city=ca-alameda-oakland", "#/ballot/ca-alameda/ca-alameda-oakland", "#/ballot/ca-sf", "#/ballot/ca-fresno", "#/item/" + encodeURIComponent((incomplete[0] || localItem).id), "#/contest/2026-11-03.ca.governor", "#/contests", "#/browse", "#/about", "#/statewide", "#/item/2026-11-03.ca-alameda-sd-dublin-unified-school-district.measure-i", "#/sheet/ca-alameda/ca-alameda-fremont", "#/how-to-vote", "#/contest/2026-11-03.ca.insurance-commissioner", "#/candidate/2026-11-03.ca.insurance-commissioner.jane-kim"];
  for (const w of [360, 768, 1280]) for (const scheme of ["light", "dark"]) {
    const c2 = await b.newContext({ viewport: { width: w, height: 850 }, colorScheme: scheme });
    const q = await c2.newPage(); const e2 = [], h2 = new Set();
    watchErrors(q, e2); await blockExternal(q, h2);
    for (const h of pages) {
      await q.goto(B + h); await q.waitForSelector("h1"); await q.waitForTimeout(50);
      await q.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
      if (w === 1280 && scheme === "light") {
        const r = await htmlv.validateString(await q.content());
        const msgs = r.results.flatMap((x) => x.messages).map((m) => `${m.ruleId}: ${m.message}`);
        ok(r.valid, `rendered HTML valid ${h}: ${[...new Set(msgs)].slice(0, 4).join("; ")}`);
      }
      ok((await q.evaluate(() => document.documentElement.scrollWidth)) <= w, `no horizontal overflow ${h} @${w} ${scheme}`);
      await q.addScriptTag({ path: AXE });
      const v = await q.evaluate(async () => (await axe.run()).violations.map((v) => v.id + " x" + v.nodes.length));
      ok(v.length === 0, `axe ${h} @${w} ${scheme}: ${v.join(", ")}`);
    }
    ok(e2.length === 0, `console errors @${w} ${scheme}: ${e2.slice(0, 3).join(" | ")}`);
    ok([...h2].every((x) => ALLOWED_HOSTS.has(x)), `unexpected external hosts @${w} ${scheme}: ${[...h2].filter((x) => !ALLOWED_HOSTS.has(x)).join(", ")}`);
    if (w === 1280 && scheme === "light") console.log("external hosts requested (blocked in test):", [...h2].join(", ") || "none");
    await c2.close();
  }
  await b.close();
  process.exit(done() ? 1 : 0);
})().catch((e) => { console.log("FAIL guide suite crashed:", e.message, (e.stack || "").split("\n").filter((l) => /guide.test/.test(l)).join(" ")); process.exit(1); });
