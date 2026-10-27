// GoatCounter stand-in test (VAL-13, PRD-01). Serves a fake count.js that behaves like the real script's public API
// and records what the real one would send, then checks that no county, city, town or measure is ever sent.
//   node tests/browser/goatcounter.test.cjs   (needs BASE; tests/browser/run.mjs sets it)
//
// The stand-in follows GoatCounter's documented behavior:
//   - settings come from data-goatcounter-settings on the script tag, merged with any window.goatcounter object;
//   - unless no_onload is set, it counts one pageview as soon as it loads;
//   - count(vars) sends path, title and referrer, defaulting to location.pathname + location.search, document.title
//     and document.referrer when vars leave them out. The hash is never part of the default path.
// The pages pin count.js with a Subresource Integrity hash. The stand-in cannot match it, so this test strips the
// integrity attribute from the HTML it serves. That is the only change made to the pages.
const { chromium } = require("playwright");
const { BASE, loadData, counter } = require("./lib.cjs");
const { ok, done } = counter("goatcounter stand-in tests");

const STUB = `(function () {
  var rec = window.__gc = window.__gc || [];
  var tag = document.querySelector("script[data-goatcounter]");
  var settings = {};
  try { settings = JSON.parse((tag && tag.getAttribute("data-goatcounter-settings")) || "{}"); } catch (e) { rec.push({ kind: "error", message: "invalid data-goatcounter-settings" }); }
  var gc = window.goatcounter && typeof window.goatcounter === "object" ? window.goatcounter : {};
  for (var k in settings) gc[k] = settings[k];
  window.goatcounter = gc;
  function val(v, dflt) { return typeof v === "function" ? v(dflt) : v; }
  gc.get_data = function (vars) {
    vars = vars || {};
    var p = location.pathname + location.search, t = document.title, r = document.referrer;
    return {
      p: vars.path !== undefined ? val(vars.path, p) : gc.path !== undefined ? val(gc.path, p) : p,
      t: vars.title !== undefined ? val(vars.title, t) : gc.title !== undefined ? val(gc.title, t) : t,
      r: vars.referrer !== undefined ? val(vars.referrer, r) : gc.referrer !== undefined ? val(gc.referrer, r) : r,
      e: !!(vars.event !== undefined ? vars.event : gc.event),
      q: location.search
    };
  };
  gc.count = function (vars) { rec.push({ kind: "count", vars: JSON.parse(JSON.stringify(vars || {})), data: gc.get_data(vars), at: location.href }); };
  gc.url = function (vars) { return "stub"; };
  gc.filter = function () { return false; };
  gc.bind_events = function () {};
  if (!gc.no_onload) rec.push({ kind: "auto", data: gc.get_data({}), at: location.href });
})();`;

const D = loadData();
// Everything that would identify a place or a ballot item if it reached GoatCounter.
const shortName = (c) => c.name.replace(/ County$/, "").replace(/ \(City and County\)$/, "");
const names = new Set();
D.counties.forEach((c) => { names.add(c.name); names.add(shortName(c)); });
D.jur.filter((j) => j.type === "city").forEach((c) => names.add(c.name));
D.measures.forEach((m) => { if (m.shortTitle) names.add(m.shortTitle); if (m.officialTitle && m.officialTitle.length < 120) names.add(m.officialTitle); if (m.level !== "state" && m.identifier) names.add(m.identifier); });
D.contests.forEach((c) => names.add(c.office));
const ids = new Set([...D.jur.filter((j) => j.type !== "state").map((j) => j.id), ...D.measures.map((m) => m.id), ...D.contests.map((c) => c.id)]);
const wordRe = (s) => new RegExp("(^|[^A-Za-z0-9])" + s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^A-Za-z0-9])", "i");
const nameRes = [...names].filter((n) => n && n.length >= 3).map((n) => [n, wordRe(n)]);
function leaks(rec) {
  const fields = rec.data ? [rec.data.p, rec.data.t, rec.data.r, rec.data.q] : [];
  const vals = fields.concat(Object.values(rec.vars || {}).map(String)).filter((v) => typeof v === "string" && v);
  const found = [];
  for (const v of vals) {
    if (/#/.test(v)) found.push(`hash in "${v}"`);
    for (const id of ids) if (v.includes(id)) found.push(`id ${id} in "${v}"`);
    for (const [n, re] of nameRes) if (re.test(v)) found.push(`name "${n}" in "${v}"`);
  }
  return found;
}

async function open(b, url, delayMs) {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.route("**/*", async (r) => {
    const u = r.request().url();
    if (u.startsWith(BASE)) {
      let res;
      for (let i = 0; ; i++) { try { res = await r.fetch(); break; } catch (e) { if (i >= 2) throw e; await new Promise((ok) => setTimeout(ok, 200)); } }
      const type = res.headers()["content-type"] || "";
      if (!/text\/html/.test(type)) return r.fulfill({ response: res });
      const body = (await res.text()).replace(/\s+integrity="[^"]*"/g, "");
      return r.fulfill({ response: res, body });
    }
    if (/^https:\/\/gc\.zgo\.at\/count(\.v\d+)?\.js/.test(u)) {
      if (delayMs) await new Promise((res) => setTimeout(res, delayMs));
      return r.fulfill({ contentType: "text/javascript", body: STUB });
    }
    if (/goatcounter\.com/.test(u)) return r.fulfill({ status: 204, body: "" }); // the stand-in never calls home
    return r.fulfill({ body: "" });
  });
  await p.goto(url);
  return { ctx, p };
}
const records = (p) => p.evaluate(() => window.__gc || []);
async function settle(p, ms) { await p.waitForTimeout(ms); }

(async () => {
  const b = await chromium.launch();
  const sample = D.measures.find((m) => m.jurisdiction === "ca-alameda-oakland") || D.measures.find((m) => m.level !== "state");
  const local = D.contests.find((c) => c.jurisdiction !== "ca" && D.J.get(c.jurisdiction) && D.J.get(c.jurisdiction).type !== "state-district");
  const cand = D.candidates.find((x) => local && x.contest === local.id) || D.candidates[0];
  const guideLinks = ["#/", "#/find?county=ca-marin", "#/ballot/ca-alameda/ca-alameda-oakland", "#/ballot/ca-sf", "#/ballot/ca-fresno", "#/item/" + encodeURIComponent(sample.id), local ? "#/contest/" + encodeURIComponent(local.id) : "#/contests", "#/candidate/" + encodeURIComponent(cand.id)];

  // Guide: each deep link, with count.js arriving immediately and after the page has rendered (2 s).
  const guideViews = [];
  for (const delay of [0, 2000]) for (const h of guideLinks) {
    const { ctx, p } = await open(b, BASE + h, delay);
    await p.waitForSelector("h1");
    await settle(p, delay + 1200);
    // Move within the app after loading, as a visitor would.
    await p.evaluate(() => { location.hash = "#/ballot/ca-santa-clara/ca-santa-clara-palo-alto"; });
    await settle(p, 700);
    const rec = await records(p);
    const tag = `${h} (count.js after ${delay} ms)`;
    ok(rec.length > 0, "guide counted a visit " + tag);
    ok(!rec.some((r) => r.kind === "auto"), "guide uses no_onload, so no automatic pageview with the page title " + tag);
    ok(!rec.some((r) => r.kind === "error"), "valid data-goatcounter-settings " + tag);
    ok(rec.filter((r) => r.kind === "count" && !r.data.e).length === 1, `exactly one pageview per page load ${tag} (got ${rec.filter((r) => r.kind === "count" && !r.data.e).length})`);
    ok(!rec.some((r) => r.data && r.data.e), "guide sends no events " + tag);
    for (const r of rec) { const l = leaks(r); ok(!l.length, `nothing identifying sent ${tag}: ${l.slice(0, 3).join("; ")}`); }
    rec.filter((r) => r.kind === "count").forEach((r) => guideViews.push(r.data));
    await ctx.close();
  }
  const titles = [...new Set(guideViews.map((v) => v.t))], paths = [...new Set(guideViews.map((v) => v.p))];
  ok(titles.length === 1, "guide pageview title is fixed across all deep links: " + titles.join(" | "));
  ok(paths.length === 1, "guide pageview path is fixed across all deep links: " + paths.join(" | "));

  // Weighing tool: pageview plus exactly the two documented events, with fixed titles, each sent once.
  const EXPECTED = { "used-tool": "Answered at least one question", "finished-all-14": "Answered all 14 questions" };
  for (const [delay, hash] of [[0, ""], [2000, "#prop-1"]]) {
    const { ctx, p } = await open(b, BASE + "propositions.html" + hash, delay);
    await p.waitForSelector("article.prop");
    await settle(p, delay + 800);
    await p.click('label[for="g-1-3"]');
    for (const n of ["2", "3", "4", "5", "37", "38", "39", "40", "41", "42", "43", "44", "45"]) await p.click(`label[for="g-${n}-2"]`);
    await p.click('label[for="g-1-1"]'); // changing an answer must not send anything new
    await settle(p, 600);
    const rec = await records(p);
    const tag = `(propositions.html${hash}, count.js after ${delay} ms)`;
    const views = rec.filter((r) => r.kind === "count" && !r.data.e), events = rec.filter((r) => r.kind === "count" && r.data.e);
    ok(!rec.some((r) => r.kind === "auto"), "tool uses no_onload " + tag);
    ok(views.length === 1, `tool counts exactly one pageview ${tag} (got ${views.length})`);
    ok(views.every((v) => v.data.t === views[0].data.t && !/Prop\b|\d/.test(v.data.t)), "tool pageview has a fixed title " + tag + ": " + views.map((v) => v.data.t).join(" | "));
    ok(events.length === 2, `exactly two events ${tag} (got ${events.length}: ${events.map((e) => e.data.p).join(", ")})`);
    for (const e of events) {
      ok(EXPECTED[e.data.p] === e.data.t, `documented event with its fixed title ${tag}: ${e.data.p} / ${e.data.t}`);
      ok(Object.keys(e.vars).every((k) => ["path", "title", "event"].includes(k)), `event sends only path, title and event ${tag}: ${Object.keys(e.vars).join(",")}`);
    }
    ok(new Set(events.map((e) => e.data.p)).size === events.length, "each event sent once " + tag);
    for (const r of rec) { const l = leaks(r); ok(!l.length, `nothing identifying sent ${tag}: ${l.slice(0, 3).join("; ")}`); }
    // Reloading after finishing must not resend the events.
    await p.reload(); await p.waitForSelector("article.prop"); await settle(p, delay + 800);
    await p.click('label[for="g-2-3"]'); await settle(p, 400);
    const rec2 = await records(p);
    ok(!rec2.some((r) => r.kind === "count" && r.data.e), "events are not resent after reload " + tag);
    await ctx.close();
  }
  await b.close();
  process.exit(done() ? 1 : 0);
})().catch((e) => { console.log("FAIL goatcounter suite crashed:", e.message); process.exit(1); });
