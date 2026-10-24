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
const incomplete = D.measures.filter((m) => m.status === "incomplete");
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
  ok((await H1(p)) === "California Bay Area Ballot Guide", "home h1");
  ok((await p.title()).startsWith("California Bay Area Ballot Guide"), "document title");
  ok(await p.isVisible('a:has-text("Find My Ballot")'), "Find My Ballot entry point");
  ok(await p.isVisible('main a[href="propositions.html"]'), "Ballot Weighing Tool entry point");
  ok((await main(p)).includes("November 3, 2026"), "election date on home");
  // Regional facts block: 9 counties and 101 cities and towns, read from region.json, with a source link.
  const card = p.locator('[data-region-card], section:has-text("cities and towns")').first();
  ok(await card.count(), "regional facts block present");
  const cardText = (await card.count()) ? (await card.innerText()).replace(/\s+/g, " ") : "";
  ok(R && new RegExp(`${R.countyCount} counties and ${R.municipalityCount} (incorporated )?cities and towns`).test(cardText), `regional facts say "${R && R.countyCount} counties and ${R && R.municipalityCount} cities and towns": ${cardText.slice(0, 160)}`);
  const factUrls = R ? R.facts.map((f) => f.url) : [];
  const cardLinks = (await card.count()) ? await card.locator("a").evaluateAll((as) => as.map((a) => a.href)) : [];
  ok(cardLinks.some((u) => factUrls.includes(u)), "regional facts link to their source: " + factUrls.join(", "));
  ok(await card.locator(`a[href="${factUrls[0]}"]`).first().isVisible().catch(() => false), "source link is visible without expanding anything");
  ok(/growing county by county/i.test(cardText), "says local coverage is growing county by county");
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

  // ---------- Widths, themes, axe, overflow, console errors, rendered HTML ----------
  // Rendered DOM is checked with the project config, minus rules about attribute spelling that only reflect how the
  // browser serializes the DOM (open="", async="", crossorigin="") and the per-route document title length.
  const rcfg = readJSON(".htmlvalidate.json");
  const htmlv = new HtmlValidate({ ...rcfg, rules: { ...(rcfg.rules || {}), "attribute-boolean-style": "off", "attribute-empty-style": "off", "script-type": "off", "long-title": "off" } });
  const pages = ["#/", "#/find?county=ca-alameda&city=ca-alameda-oakland", "#/ballot/ca-alameda/ca-alameda-oakland", "#/ballot/ca-sf", "#/ballot/ca-fresno", "#/item/" + encodeURIComponent((incomplete[0] || statewide[0]).id), "#/item/" + encodeURIComponent(statewide[0].id), "#/contest/2026-11-03.ca.governor", "#/contests", "#/browse"];
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
})().catch((e) => { console.log("FAIL guide suite crashed:", e.message); process.exit(1); });
