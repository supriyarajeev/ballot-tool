/*
  California Ballot Guide. Plain JavaScript, no build step, no dependencies.
  Data lives in /data as JSON (see docs/DATA-MODEL.md). Routes use the URL hash so the site works on GitHub Pages:
    #/                       home
    #/find                   choose a Bay Area county and a city or town (?county=<id>&city=<id>|unincorporated|not-sure)
    #/statewide              statewide propositions, for voters outside the Bay Area
    #/ballot/<county>[/<city>|/unincorporated]  ballot overview for a place
    #/browse                 every county and its coverage
    #/item/<id>              one ballot measure
    #/contest/<id>           one candidate contest
    #/candidate/<id>         one candidate profile
  Nothing typed or chosen here is stored or sent anywhere. County and city live only in the page address after "#".
  The visitor counter is sent a fixed page path and title only (see countVisit), never the route or the page title.
*/
(function () {
  "use strict";

  var SITE = "California Bay Area Ballot Guide";
  var STATEWIDE_MSG = "Statewide California propositions are available here. Local city and district coverage outside the Bay Area is still being developed.";
  var NO_CITIES_MSG = "City and town coverage for this county has not been fully collected yet. Check the official county election website for your complete ballot.";
  var PARTIAL_CITIES_MSG = "City and town coverage for this county is not complete yet, so your city or town may be missing. Check the official county election website for your complete ballot.";
  var SOS_OFFICES = "https://www.sos.ca.gov/elections/voting-resources/county-elections-offices";

  var STATUS = {
    "verified": { label: "Verified", cls: "st-ok" },
    "needs-review": { label: "Needs review", cls: "st-warn" },
    "not-researched": { label: "Not yet researched", cls: "st-inc" },
    "not-applicable": { label: "Not applicable", cls: "st-inc" },
    "incomplete": { label: "Incomplete (required info or evidence is missing)", cls: "st-inc" },
    "source-unavailable": { label: "Source unavailable", cls: "st-inc" },
    "archived": { label: "Archived", cls: "st-arch" },
    "superseded": { label: "Superseded", cls: "st-arch" }
  };
  // Explains a status on detail pages, listing the record's specific gaps.
  var STATUS_HELP = {
    "needs-review": ["What still needs review", "Evidence exists, but something below still has to be checked or resolved."],
    "incomplete": ["What is missing", "Required information or evidence is missing. Do not treat the empty sections as “nothing to know.”"],
    "source-unavailable": ["Why this is blank", "The official source could not be obtained. The attempts are recorded in the research notes."],
    "not-researched": ["Not yet researched", "This item is known to exist, but it has not been researched yet."],
    "archived": ["Archived", "This record is kept for history and is no longer current."],
    "superseded": ["Superseded", "A newer record replaces this one. It is kept for history."]
  };
  var COVERAGE = {
    "pilot": "Pilot, measure list plus partial detail",
    "list-only": "Measure list only",
    "not-started": "County and city items not collected"
  };
  var GROUPS = [
    { key: "state", title: "Statewide propositions" },
    { key: "county", title: "County measures" },
    { key: "city", title: "City and town measures" },
    { key: "school", title: "School district measures" },
    { key: "college", title: "Community college district measures" },
    { key: "special", title: "Special and regional district measures" },
    { key: "candidates", title: "Candidate elections" }
  ];

  // Lookup tables have no prototype, and every read goes through own(), so ids such as "constructor" never resolve.
  var hasOwn = Object.prototype.hasOwnProperty;
  function own(o, k) { return k != null && hasOwn.call(o, k) ? o[k] : undefined; }
  var DB = { elections: [], election: null, jur: Object.create(null), jurList: [], measures: [], contests: [], candidates: [], byId: Object.create(null), region: null, failed: [] };
  var app = document.getElementById("app");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function badge(status) { var s = own(STATUS, status) || STATUS.incomplete; return '<span class="badge ' + s.cls + '">' + s.label + "</span>"; }
  // Lists omit "Needs review": every record is in review during the beta, which the beta notice and About page explain.
  // The status itself is unchanged in the data and still shows on each item's own page, with what still needs checking.
  function listBadge(status) { return status === "needs-review" ? "" : badge(status); }
  // A record whose key facts were read by OCR or by an AI assistant looking at a page image says so next to those facts.
  function readingNote(x) { return x && x.readingNote ? '<div class="note warn" data-reading-note="1"><b>How this was read</b><p>' + esc(x.readingNote) + "</p></div>" : ""; }
  function num(n) { return Number(n).toLocaleString("en-US"); }
  function fmtDate(iso) {
    if (!iso) return "not recorded";
    var d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function enc(id) { return encodeURIComponent(id); }
  function J(id) { return own(DB.jur, id); }
  function rec(id) { return own(DB.byId, id); }
  function countyOf(j) { var seen = 0; while (j && j.type !== "county" && j.parent) { if (j.type === "state" || ++seen > 20) return null; j = J(j.parent); } return j && j.type === "county" ? j : null; }
  function byName(a, b) { return a.name.localeCompare(b.name); }
  function shortName(c) { return c.name.replace(/ County$| \(City and County\)$/, ""); }
  function andList(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  // Opens in a new tab. Plain http links are labeled as not secure (FE-12).
  function ext(url, label) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + label + (/^http:/i.test(url) ? " (http, not a secure link)" : "") + '<span class="vh"> (opens in a new tab)</span></a>';
  }

  /* ---------- Visitor counter ---------- */
  // GoatCounter loads with no_onload, so it counts nothing by itself. One visit is counted per page load with a fixed
  // title and the server path of this page. The path never contains the hash, so no county, city, item or answer is sent.
  function countVisit() {
    var n = 0, t = setInterval(function () {
      var gc = window.goatcounter;
      if (++n > 300) { clearInterval(t); return; }
      if (!gc || typeof gc.count !== "function") return;
      clearInterval(t);
      try { gc.count({ path: location.pathname.replace(/[^A-Za-z0-9\/._-]/g, "") || "/", title: SITE }); } catch (e) { /* counting is optional */ }
    }, 100);
  }

  /* ---------- Data loading ---------- */
  function fetchJSON(p) {
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 20000) : 0;
    return fetch(p, ctl ? { cache: "no-cache", signal: ctl.signal } : { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(p + " returned " + r.status);
      return r.json();
    }).then(function (d) { clearTimeout(timer); return d; }, function (e) {
      clearTimeout(timer);
      throw e && e.name === "AbortError" ? new Error(p + " took too long to load") : e;
    });
  }
  function fileLabel(p) {
    if (/region\.json$/.test(p)) return "Bay Area regional facts";
    if (/statewide\.json$/.test(p)) return "statewide propositions";
    if (/contests\.json$/.test(p)) return "candidate contests";
    if (/candidates\.json$/.test(p)) return "candidate details";
    return "local measures";
  }
  // A file that may fail without taking the guide down. The failure is recorded and disclosed on every page.
  function soft(p) {
    return fetchJSON(p).catch(function (e) { DB.failed.push({ file: p, label: fileLabel(p), msg: e && e.message || "failed" }); return null; });
  }
  function loadData() {
    app.innerHTML = '<p class="loading" role="status">Loading ballot information...</p>';
    return Promise.all([fetchJSON("data/elections.json"), fetchJSON("data/jurisdictions.json"), soft("data/region.json")]).then(function (r) {
      DB.elections = r[0].elections || [];
      DB.jurList = r[1].jurisdictions || [];
      DB.jurList.forEach(function (j) { if (j && typeof j.id === "string") DB.jur[j.id] = j; });
      DB.region = r[2] && Array.isArray(r[2].counties) ? r[2] : null;
      DB.election = DB.elections.filter(function (e) { return e.status === "current"; })[0] || DB.elections[0];
      if (!DB.election || !DB.election.files) throw new Error("data/elections.json has no current election");
      var f = DB.election.files;
      return Promise.all([Promise.all((f.measures || []).map(soft)), soft(f.contests), soft(f.candidates)]);
    }).then(function (r) {
      r[0].forEach(function (d) { if (d && Array.isArray(d.items)) DB.measures = DB.measures.concat(d.items); });
      DB.contests = r[1] && Array.isArray(r[1].contests) ? r[1].contests : [];
      DB.candidates = r[2] && Array.isArray(r[2].candidates) ? r[2].candidates : [];
      DB.measures.concat(DB.contests, DB.candidates).forEach(function (x) { if (x && typeof x.id === "string") DB.byId[x.id] = x; });
      if (!DB.measures.length && !DB.contests.length) throw new Error("No ballot information could be loaded");
    });
  }
  function loadWarning() {
    var f = DB.failed.filter(function (x) { return x.label !== "Bay Area regional facts"; });
    if (!f.length) return "";
    return '<div class="note warn" data-load-warning="1"><b>Some information could not be loaded.</b><p>Missing right now: ' + esc(andList(f.map(function (x) { return x.label; }))) +
      ". Everything else below loaded normally, but lists may be shorter than they should be. Refresh the page to try again.</p></div>";
  }

  /* ---------- Region and places ---------- */
  var bayCache = null;
  // The nine Bay Area counties come from data/region.json; if that file failed, from the county records' region field.
  function counties() {
    if (bayCache) return bayCache;
    var list = DB.region ? DB.region.counties.map(J).filter(function (j) { return j && j.type === "county"; }) :
      DB.jurList.filter(function (j) { return j.type === "county" && j.region === "bay-area"; });
    bayCache = list.slice().sort(byName);
    return bayCache;
  }
  function isBay(c) { return counties().indexOf(c) >= 0; }
  function allCounties() { return DB.jurList.filter(function (j) { return j.type === "county"; }).sort(byName); }
  function citiesOf(cid) { return DB.jurList.filter(function (j) { return j.type === "city" && j.parent === cid; }).sort(byName); }
  function unincListed(county) { return !!(county.unincorporated && county.unincorporated.listed === true); }
  function consolidated(county) { var c = county.consolidatedCity ? J(county.consolidatedCity) : null; return c && c.type === "city" && c.parent === county.id ? c : null; }
  // A city list counts as complete only when the record says so AND the stated count matches the cities in the data.
  function cityListComplete(county) { var inv = county.cityInventory || {}; return inv.status === "complete" && inv.count === citiesOf(county.id).length; }
  // Resolves the city part of a place. Returns null when the id is not a city or town of this county.
  function resolvePlace(county, cityId) {
    var cc = consolidated(county);
    if (cityId == null || cityId === "" || cityId === "not-sure") return cc ? { city: cc, mode: "city" } : { city: null, mode: "county" };
    if (cityId === "unincorporated") return unincListed(county) ? { city: null, mode: "unincorporated" } : null;
    var c = J(cityId);
    return c && c.type === "city" && c.parent === county.id ? { city: c, mode: "city" } : null;
  }

  /* ---------- Applicability ---------- */
  // Returns null if the item does not apply to the chosen place, else {fit:"yes"|"maybe", note}
  function applies(jurId, countyId, cityId) {
    var j = J(jurId); if (!j) return null;
    if (j.type === "state") return { fit: "yes" };
    if (j.type === "region") return j.counties && j.counties.indexOf(countyId) >= 0 ? { fit: "yes" } : null;
    if (j.type === "state-district") {
      if (j.countiesKnown) {
        if ((j.counties || []).indexOf(countyId) < 0) return null;
        // A county split between districts (partialCounties) only may be in this one.
        return (j.partialCounties || []).indexOf(countyId) >= 0 ? { fit: "maybe", split: true, note: "This county is split between districts. It applies only if your address is inside this one." } : { fit: "yes" };
      }
      if (j.counties && j.counties.length && j.counties.indexOf(countyId) < 0) return null;
      return { fit: "maybe", note: "This district covers only part of the county. It applies only if your address is inside it." };
    }
    var c = countyOf(j);
    // Districts that cross county lines list every county they cover.
    if (!(c && c.id === countyId) && !(j.counties && j.counties.indexOf(countyId) >= 0)) return null;
    if (j.type === "county") return { fit: "yes" };
    if (j.type === "city") return cityId === j.id ? { fit: "yes" } : null;
    // Districts inside a city (council districts) need that city.
    var par = J(j.parent);
    if (par && par.type === "city") return cityId === par.id ? { fit: "maybe", note: "Applies only if your address is inside this district. Check your official sample ballot." } : null;
    // Districts (school, special, supervisorial and others) do not follow city lines.
    if (cityId && j.areas && j.areas.length && j.areas.indexOf(cityId) < 0) return null;
    return { fit: "maybe", note: "Applies only if your address is inside this district. Check your official sample ballot." };
  }
  function groupOf(jurId, isContest) {
    var t = (J(jurId) || {}).type;
    if (t === "state") return isContest ? "candidates" : "state";
    if (t === "county" || t === "supervisor-district") return isContest ? "candidates" : "county";
    if (t === "city") return isContest ? "candidates" : "city";
    if (t === "school-district") return isContest ? "candidates" : "school";
    if (t === "community-college-district") return isContest ? "candidates" : "college";
    return isContest ? "candidates" : "special";
  }

  /* ---------- Shared pieces ---------- */
  // One entry per missing field (FE-09). A bare field name ("Ballot question") is dropped when a fuller entry for the
  // same field is already listed. Entries that add a note of their own are kept.
  function dedupeGaps(gaps) {
    var kept = [];
    function norm(s) { return String(s).trim().replace(/\.$/, "").toLowerCase(); }
    function bare(s) { var n = norm(s); return /\((not stated[^)]*)\)$/.test(n) ? n.replace(/\s*\([^)]*\)$/, "") : n; }
    (gaps || []).filter(Boolean).forEach(function (g) {
      var b = bare(g);
      var dup = kept.some(function (k) { var nk = norm(k); return nk === norm(g) || nk.indexOf(b + " ") === 0 || nk.indexOf(b + "(") === 0 || bare(k) === b; });
      if (!dup) kept.push(String(g));
    });
    return kept;
  }
  function statusNote(x, after) {
    var h = own(STATUS_HELP, x.status); if (!h) return "";
    var gaps = dedupeGaps(Array.isArray(x.gaps) ? x.gaps : []);
    return '<div class="note warn" data-status-note="' + esc(x.status) + '"><b>' + esc(h[0]) + "</b><p>" + esc(h[1]) + "</p>" +
      (gaps.length ? '<ul class="srclist">' + gaps.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul>" : "") +
      (after ? "<p>" + after + "</p>" : "") + "</div>";
  }
  function sourceList(sources) {
    if (!sources || !sources.length) return '<p class="missing">No official source recorded yet.</p>';
    return '<ol class="srclist">' + sources.map(function (s) {
      return "<li>" + ext(s.url, esc(s.label)) + (s.type ? '<span class="role">' + esc(s.type) + "</span>" : "") + "</li>";
    }).join("") + "</ol>";
  }
  // Empty fields say "Not collected yet", never the wording of another status badge (FE-08).
  function field(v, missing) { return v ? "<p>" + esc(v) + "</p>" : '<p class="missing">' + esc(missing || "Not collected yet.") + "</p>"; }
  function sec(title, inner, open) { return '<details class="sec"' + (open ? " open" : "") + "><summary>" + esc(title) + '</summary><div class="body">' + inner + "</div></details>"; }
  function samplePlace(county) {
    if (!county) return "";
    return county.lookupUrl ? "Check " + esc(county.name) + "'s official " + ext(county.lookupUrl, esc(county.lookupLabel || "voter information lookup")) + (county.electionsUrl ? " or its " + ext(county.electionsUrl, "elections office") : "") + "." :
      (county.electionsUrl ? ext(county.electionsUrl, esc(county.name) + " elections office") + "." : "");
  }
  function lookupSentence(county) {
    var s = county ? samplePlace(county) : "";
    return s ? "Your county elections office has the official sample ballot for your address. " + s : "Your county elections office has the official sample ballot for your address: " + ext(SOS_OFFICES, "find your county elections office") + ".";
  }
  // District limitations, shown on Find and on every ballot page.
  function districtNote(county, id) {
    return '<div class="note" role="note" data-district-note="1"><b>Districts may not match city or county lines.</b><p>School, community college, special and legislative districts may not match city or county lines. A county and a city or town cannot identify every contest on your ballot, and neither can a ZIP code. This guide marks those items as “may apply”.</p><p' + (id ? ' id="' + id + '"' : "") + ">" + lookupSentence(county) + "</p></div>";
  }
  function statewideNote() {
    return '<div class="note" data-statewide-note="1"><b>Outside the Bay Area</b><p>' + esc(STATEWIDE_MSG) + '</p><p><a href="#/statewide">See all statewide propositions</a> · <a href="propositions.html">Ballot Weighing Tool</a></p></div>';
  }
  function focusTop() {
    window.scrollTo(0, 0);
    var h = app.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  // "Local contests" are county, city and district contests. Statewide and state-district (Congress, Legislature,
  // Board of Equalization) contests are not counted (FE-02).
  function isLocalJur(j) { return j && j.type !== "state" && j.type !== "state-district"; }
  function inCounty(j, countyId) { return (countyOf(j) || {}).id === countyId || (j.counties || []).indexOf(countyId) >= 0; }
  function countsFor(countyId) {
    var m = DB.measures.filter(function (x) {
      var j = J(x.jurisdiction); if (!j || j.type === "state") return false;
      if (j.type === "region") return (j.counties || []).indexOf(countyId) >= 0;
      return inCounty(j, countyId);
    });
    var c = DB.contests.filter(function (x) { var j = J(x.jurisdiction); return isLocalJur(j) && inCounty(j, countyId); });
    return { measures: m.length, contests: c.length };
  }
  function countText(n) {
    var m = n.measures ? n.measures + (n.measures === 1 ? " local measure" : " local measures") + " listed" : "no local measures listed yet";
    var c = n.contests ? n.contests + (n.contests === 1 ? " local contest" : " local contests") + " listed" : "local candidate contests not collected yet";
    return m + " · " + c;
  }
  // Date of the statewide audit, from the statewide records themselves (FE-07).
  function statewideDate() {
    var d = DB.measures.filter(function (m) { return m.level === "state"; }).concat(DB.contests.filter(function (c) { return (J(c.jurisdiction) || {}).type === "state"; }))
      .map(function (x) { return x.lastVerified; }).filter(Boolean).sort();
    return d.length ? d[d.length - 1] : null;
  }
  function rowLink(href, title, sub) { return '<a class="row" href="' + href + '"><span class="rt"><span class="rti">' + esc(title) + '</span><span class="rsub">' + esc(sub) + "</span></span></a>"; }

  /* ---------- Views ---------- */
  function regionCard() {
    var cs = counties(), R = DB.region;
    var facts = R && Array.isArray(R.facts) ? R.facts.filter(function (f) { return f && f.text && /^https:/.test(f.url || ""); }) : [];
    var pubs = [], seen = {};
    facts.forEach(function (f) { if (!seen[f.url]) { seen[f.url] = 1; pubs.push("the " + ext(f.url, esc(f.publisher || f.url))); } });
    var regionLine = R && R.countyCount && R.municipalityCount && pubs.length ?
      "<p>The " + esc(R.name || "San Francisco Bay Area") + " has " + esc(R.countyCount) + " counties and " + esc(R.municipalityCount) + " incorporated cities and towns. These counts come from " + andList(pubs) + "; their exact wording is below.</p>" :
      "<p>The Bay Area counties in this guide are listed below.</p>";
    var quotes = facts.length ? '<details class="sec"><summary>What the regional sources say</summary><div class="body"><ul class="srclist">' + facts.map(function (f) {
      return "<li>“" + esc(f.text) + "” " + ext(f.url, esc(f.publisher || "Source")) + (f.retrieved ? ' <span class="small">Read on ' + esc(fmtDate(f.retrieved)) + ".</span>" : "") + "</li>";
    }).join("") + "</ul></div></details>" : "";
    // Guide coverage, computed from the data. Kept apart from the regional facts above.
    var withMeasures = 0, withContests = 0, completeLists = 0, cities = 0;
    cs.forEach(function (c) {
      var n = countsFor(c.id);
      if (n.measures) withMeasures++;
      if (n.contests) withContests++;
      if (cityListComplete(c)) completeLists++;
      cities += citiesOf(c.id).length;
    });
    var of = " of " + cs.length + " Bay Area counties";
    var stats = [
      [withMeasures, "counties with local measures listed", withMeasures + of + " have local measures listed"],
      [completeLists, "counties with a complete city and town list, matched to the regional list", completeLists + of + " have a complete city and town list, matched to the regional list from MTC and ABAG"],
      [cities, "cities and towns listed in this guide", cities + " cities and towns are listed in this guide"],
      [withContests, "counties with local candidate contests listed", withContests + of + " have local candidate contests listed"]
    ];
    var G = R && R.glance, tiles = [], srcs = [];
    function sum(o) { var t = 0, ok = true; cs.forEach(function (c) { var v = o && o.byCounty ? o.byCounty[c.id] : undefined; if (typeof v === "number") t += v; else ok = false; }); return ok && cs.length ? t : null; }
    if (G && G.population) {
      var pop = sum(G.population);
      if (pop) { tiles.push(["About " + (Math.round(pop / 1e5) / 10) + " million", "Bay Area residents, " + fmtDate(G.population.asOf) + " estimate", "About " + (Math.round(pop / 1e5) / 10) + " million Bay Area residents (" + num(pop) + "), " + fmtDate(G.population.asOf) + " estimate"]);
        srcs.push("Residents. " + ext(G.population.url, esc(G.population.publisher)) + ", E-1 estimates for " + esc(fmtDate(G.population.asOf)) + (G.population.status ? " (" + esc(G.population.status) + ")" : "") + ", " + num(pop) + " in the nine counties."); }
    }
    if (G && G.registration) {
      var reg = sum(G.registration);
      if (reg) tiles.push([num(reg), "registered voters in the nine Bay Area counties, " + fmtDate(G.registration.asOf), num(reg) + " registered voters in the nine Bay Area counties as of " + fmtDate(G.registration.asOf)]);
      if (G.registration.state) tiles.push([num(G.registration.state), "registered voters in California, " + fmtDate(G.registration.asOf), num(G.registration.state) + " registered voters in California as of " + fmtDate(G.registration.asOf)]);
      srcs.push("Registered voters. " + ext(G.registration.url, esc(G.registration.publisher)) + ", Report of Registration as of " + esc(fmtDate(G.registration.asOf)) + ". The Bay Area figure adds the nine county rows.");
    }
    if (G && G.californiaCounties && G.californiaCounties.count === allCounties().length) {
      tiles.push([String(G.californiaCounties.count), "counties in California", G.californiaCounties.count + " counties in California"]);
      srcs.push("Counties. " + ext(G.californiaCounties.url, esc(G.californiaCounties.publisher)) + ", county elections offices.");
    }
    return '<section class="card" aria-labelledby="region-h" data-region-card="1"><h2 id="region-h">The region at a glance</h2>' +
      regionLine +
      (tiles.length ? '<ul class="stats" data-glance="1">' + tiles.map(function (t) { return '<li><b aria-hidden="true">' + esc(t[0]) + '</b><span aria-hidden="true">' + esc(t[1]) + '</span><span class="vh">' + esc(t[2]) + "</span></li>"; }).join("") + "</ul>" : "") +
      '<p class="small">Residents and registered voters are different counts. Many Bay Area residents live in unincorporated communities, which are governed by their county rather than a city. San Francisco is one city and county.</p>' +
      (srcs.length ? '<p class="small" data-glance-sources="1">' + srcs.join(" ") + "</p>" : "") +
      '<p data-county-names="1">The ' + (cs.length === 9 ? "nine" : esc(cs.length)) + " counties are " + esc(andList(cs.map(shortName))) + ". Elsewhere in California, this guide covers statewide items, plus the few local district items it found that cross county lines from the Bay Area. <a href=\"#/statewide\">Statewide propositions</a>.</p>" +
      quotes +
      (R && R.note ? '<p class="small">' + esc(R.note) + "</p>" : "") +
      (!R ? '<p class="small">The regional facts could not be loaded right now.</p>' : "") +
      "</section>" +
      // Guide coverage, computed from the data. Kept apart from the regional facts above.
      '<section class="card" aria-labelledby="covered-h" data-covered-card="1"><h2 id="covered-h">What’s covered</h2>' + coveredSummary() +
      '<h3 id="cov-ind-h">This guide’s local coverage is growing county by county</h3>' +
      '<ul class="stats" aria-labelledby="cov-ind-h" data-coverage-indicator="1">' + stats.map(function (s) {
        return '<li><b aria-hidden="true">' + esc(s[0]) + (s[1].indexOf("counties") === 0 ? '<span class="of"> / ' + cs.length + "</span>" : "") + '</b><span aria-hidden="true">' + esc(s[1]) + '</span><span class="vh">' + esc(s[2]) + "</span></li>";
      }).join("") + "</ul>" +
      '<p class="small">Counted from this guide’s data each time the page loads.</p>' +
      byCountyDetails() +
      "</section>";
  }
  function byCountyDetails() {
    var cov = counties().map(function (c) {
      var n = countsFor(c.id);
      return "<li><b>" + esc(c.name) + "</b> " + '<span class="tag">' + esc(own(COVERAGE, (c.coverage || {}).status) || "") + "</span>" +
        ' <span class="small">' + esc(countText(n)) + "</span></li>";
    }).join("");
    var d = statewideDate();
    return '<details class="sec"><summary>Coverage by Bay Area county</summary><div class="body">' +
      (d ? '<p class="small">The statewide facts were audited by automated research against official sources on ' + esc(fmtDate(d)) + "; a person has not yet reviewed the audit.</p>" : "") +
      '<ul class="srclist">' + cov + '</ul><p><a class="textlink" href="#/browse">Browse all available ballots</a></p></div></details>';
  }
  // Item counts for "What's covered", from the records. Recorded is not the same as checked by a person.
  function coverCounts() {
    var local = DB.measures.filter(function (m) { return m.level !== "state"; });
    return {
      state: DB.measures.filter(function (m) { return m.level === "state"; }).length,
      local: local.length,
      bq: local.filter(function (m) { return m.ballotQuestion; }).length,
      th: local.filter(function (m) { return m.threshold; }).length,
      contests: DB.contests.length,
      localContests: DB.contests.filter(function (c) { return isLocalJur(J(c.jurisdiction)); }).length,
      candidates: DB.candidates.length,
      verified: DB.measures.concat(DB.contests, DB.candidates).filter(function (x) { return x.status === "verified"; }).length
    };
  }
  function coveredSummary() {
    var n = coverCounts();
    return '<ul class="srclist" data-covered="1">' +
      "<li><b>" + n.state + " statewide propositions</b>, each with evidence ratings in the <a href=\"propositions.html\">Ballot Weighing Tool</a>.</li>" +
      "<li><b>" + num(n.local) + " local measures</b> listed in the Bay Area. " + num(n.bq) + " have their ballot question recorded and " + num(n.th) + " their vote threshold. For the rest these are not collected yet, which does not mean the measure has none.</li>" +
      "<li><b>" + num(n.contests) + " candidate contests</b> (" + num(n.contests - n.localContests) + " statewide, congressional, legislative or Board of Equalization, and " + num(n.localContests) + " local) with <b>" + num(n.candidates) + " candidates</b>, in the order of the official source.</li>" +
      "</ul>" +
      "<p class=\"small\">Recorded means copied from an official document by automated or AI-assisted reading. " + (n.verified ? num(n.verified) + " records have been checked by a person." : "No record has been checked by a person yet.") + ' <a href="#/about">How information is checked</a>.</p>' +
      '<div class="note warn"><b>Local coverage is incomplete.</b><p>No county’s list has been checked against every city and district, so your ballot may include contests and measures this guide does not show. A missing item does not mean it is not on your ballot.</p></div>';
  }
  // Official next steps. Links were checked on Oct 23, 2026.
  var OFFICIAL = {
    guide: ["https://voterguide.sos.ca.gov/", "Official California voter information guide"],
    offices: [SOS_OFFICES, "County elections offices"],
    hotlines: ["https://www.sos.ca.gov/elections/voting-resources/voting-california/voter-hotlines", "Voter hotlines in ten languages"],
    access: ["https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm", "Assistance for voters with disabilities"]
  };
  function nextSteps() {
    return '<section class="card" aria-labelledby="next-h" data-next-steps="1"><h2 id="next-h">Before you vote</h2>' +
      "<p>Check your official sample ballot. <a href=\"#/find\">Find My Ballot</a> links to your county’s own lookup, or use the Secretary of State’s list of " + ext(OFFICIAL.offices[0], OFFICIAL.offices[1].toLowerCase()) + ".</p>" +
      "<p>Choosing a county or city here does not confirm your districts or what is on your ballot. School, special and supervisor districts often cross city lines.</p>" +
      '<p class="small">' + [OFFICIAL.guide, OFFICIAL.hotlines, OFFICIAL.access].map(function (l) { return ext(l[0], l[1]); }).join(" · ") + "</p>" +
      "</section>";
  }

  function viewHome() {
    app.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">' + esc(DB.election.name) + "</p>" +
        "<h1>" + SITE + "</h1>" +
        '<p class="tagline">Your local and statewide ballot, explained with evidence.</p>' +
        '<p class="lede">Find the measures and candidates on your ballot, see what each choice would do, and check the official sources. This guide never tells you how to vote.</p>' +
        '<div class="cta"><a class="btn primary" href="#/find">Find My Ballot</a><a class="btn secondary" href="propositions.html">Ballot Weighing Tool</a></div>' +
        '<p class="quick"><a class="textlink" href="#/browse">Ballot measures by county</a><a class="textlink" href="#/contests">Candidates and contests</a><a class="textlink" href="#/statewide">Outside the Bay Area</a></p>' +
      "</section>" +
      regionCard() +
      '<section class="how" aria-label="How it works">' +
        '<div class="card"><span class="num">1</span><b>Find your ballot</b><p class="small">Pick your county and your city or town. No address or sign-up needed.</p></div>' +
        '<div class="card"><span class="num">2</span><b>Understand each choice</b><p class="small">Plain-English facts, what YES and NO mean, costs, trade-offs and official sources.</p></div>' +
        '<div class="card"><span class="num">3</span><b>Decide for yourself</b><p class="small">No recommendations, scores for people, or rankings. The choice is yours.</p></div>' +
      "</section>" +
      nextSteps();
  }

  function viewFind(params) {
    var cs = counties(), notice = "";
    var county = null, pc = own(params, "county"), pcity = own(params, "city");
    if (pc) {
      var pj = J(pc);
      if (pj && pj.type === "county" && isBay(pj)) county = pj;
      else if (pj && pj.type === "county") notice = esc(pj.name) + " is not one of the nine Bay Area counties. " + esc(STATEWIDE_MSG) + ' <a href="#/ballot/' + enc(pj.id) + '">See statewide items for ' + esc(pj.name) + "</a>.";
      else notice = "The county in this page address is not one of the nine Bay Area counties in this guide. Choose a county below.";
    }
    var startCity = "";
    if (county && pcity) {
      if (resolvePlace(county, pcity)) startCity = pcity;
      else if (pcity === "unincorporated") notice = consolidated(county) ? esc(county.name) + " is one consolidated city and county, so it has no unincorporated area." : esc(county.name) + " has no unincorporated area listed in this guide. Choose your city or town below.";
      else notice = "That city or town is not listed in " + esc(county.name) + " in this guide. Choose your city or town below.";
    } else if (!pc && pcity) notice = "This page address names a city or town but no county, so it was not used. Choose your county first.";
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<section class="ov-head"><h1>Find your ballot</h1><p class="muted">Three quick choices. Nothing you pick is stored or sent anywhere.</p></section>' +
      (notice ? '<div class="note warn" data-find-notice="1"><b>Please choose again.</b><p>' + notice + "</p></div>" : "") +
      '<form class="card steps-form" id="findform" novalidate>' +
        // Only the current election is loaded, so it is shown as a fixed label, not a selector.
        '<div class="stepq"><p class="q">Election</p><p class="fixed-choice">' + esc(DB.election.name) + '</p><p class="small">The only election in this guide right now.</p></div>' +
        '<fieldset class="stepq" aria-describedby="county-sub"><legend>Select a Bay Area county</legend><p class="small" id="county-sub">Choose one of the nine counties in the San Francisco Bay Area.</p><div class="county-grid">' +
          cs.map(function (c) {
            return '<label class="county"><input type="radio" name="county" value="' + esc(c.id) + '"' + (county && county.id === c.id ? " checked" : "") + "><span><b>" + esc(shortName(c)) + "</b><i>" + esc(own(COVERAGE, (c.coverage || {}).status) || "") + "</i></span></label>";
          }).join("") +
        '</div><p class="small">Somewhere else in California? <a href="#/statewide">See statewide California propositions</a>.</p></fieldset>' +
        '<div class="stepq"><label class="field">Select a city or town<select id="city" disabled aria-describedby="city-help"><option value="">Choose your county first</option></select></label>' +
          '<div class="small city-help" id="city-help"></div>' +
          '<p class="small">Why not a ZIP code? ZIP codes can cross county, city and district lines, so they cannot reliably tell which local items are on your ballot.</p></div>' +
        '<div class="cta"><button class="btn primary" type="submit" id="go" disabled>Show my ballot choices</button><a class="textlink" href="#/browse">Browse all available ballots</a></div>' +
      "</form>" +
      districtNote(null, "find-lookup");
    var form = document.getElementById("findform"), citySel = document.getElementById("city"), go = document.getElementById("go"), help = document.getElementById("city-help");
    function current() { var c = form.querySelector('input[name="county"]:checked'); return c ? J(c.value) : null; }
    // Keeps the address in step with the form, so Back returns to the same valid choices. Not stored anywhere else.
    function syncUrl() {
      var c = current(); if (!c || !history.replaceState) return;
      var v = citySel.value, cc = consolidated(c);
      history.replaceState(null, "", "#/find?county=" + enc(c.id) + (v && !(cc && v === cc.id) ? "&city=" + enc(v) : ""));
    }
    function fillCities(c, selected) {
      var cities = citiesOf(c.id), cc = consolidated(c), opts = "", msg = "";
      if (cc) {
        opts = '<option value="' + esc(cc.id) + '" selected>' + esc(cc.name) + "</option>";
        msg = esc(shortName(c)) + " is a consolidated city and county, so every voter there lives in the " + esc(cc.name) + ". It is selected for you.";
      } else {
        opts = '<option value="">Choose your city or town</option>' +
          cities.map(function (x) { return '<option value="' + esc(x.id) + '"' + (selected === x.id ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("") +
          (unincListed(c) ? '<option value="unincorporated"' + (selected === "unincorporated" ? " selected" : "") + ">Unincorporated area of " + esc(c.name) + "</option>" : "") +
          '<option value="not-sure"' + (selected === "not-sure" ? " selected" : "") + ">I’m not sure of my city or town</option>";
        var inv = c.cityInventory || {};
        if (!cities.length) msg = esc(NO_CITIES_MSG) + " " + (c.electionsUrl ? ext(c.electionsUrl, esc(c.name) + " elections website") + "." : "");
        else if (!cityListComplete(c)) msg = esc(PARTIAL_CITIES_MSG) + " " + (c.electionsUrl ? ext(c.electionsUrl, esc(c.name) + " elections website") + "." : "");
        else msg = "Lists all " + cities.length + " incorporated cities and towns in " + esc(c.name) + ", matching the " + ext(inv.source, "Bay Area regional list") + (inv.checked ? " (checked " + esc(fmtDate(inv.checked)) + ")" : "") + ".";
      }
      citySel.innerHTML = opts;
      help.innerHTML = msg;
      citySel.disabled = false; go.disabled = false;
      var lk = document.getElementById("find-lookup"); if (lk) lk.innerHTML = lookupSentence(c);
    }
    if (county) fillCities(county, startCity);
    // Changing the county always resets the city.
    Array.prototype.forEach.call(form.querySelectorAll('input[name="county"]'), function (r) { r.addEventListener("change", function () { var c = J(r.value); if (c) { fillCities(c, ""); syncUrl(); } }); });
    citySel.addEventListener("change", syncUrl);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = current(); if (!c) return;
      var v = citySel.value, cc = consolidated(c);
      var tail = !v || v === "not-sure" || (cc && v === cc.id) ? "" : "/" + enc(v);
      location.hash = "#/ballot/" + enc(c.id) + tail;
    });
  }

  function itemRow(x, ap, isContest) {
    var j = J(x.jurisdiction) || {};
    var href = isContest ? "#/contest/" + enc(x.id) : "#/item/" + enc(x.id);
    var title = isContest ? x.office + (x.district ? ", " + x.district : "") : x.shortTitle || x.officialTitle;
    var id = isContest ? "Office" : x.identifier;
    var sub = j.name + (ap && ap.fit === "maybe" ? (ap.split ? " · May apply, this county is split between districts. Check your sample ballot" : " · May apply, check your sample ballot") : "");
    return '<a class="row" href="' + href + '" data-search="' + esc((id + " " + title + " " + j.name + " " + (x.officialTitle || "")).toLowerCase()) + '"><span class="rt"><span class="rid">' + esc(id) + '</span><span class="rti">' + esc(title) + '</span><span class="rsub">' + esc(sub) + "</span></span>" + listBadge(x.status) + "</a>";
  }

  var INV = {
    "not-collected": "not collected yet",
    "partial": "partly collected; some official sources are still missing",
    "collected": "collected from an official county or city list, not yet cross-checked with other official records",
    "reconciled": "cross-checked against official county, city and district records",
    "none-found-confirmed": "none found, confirmed with official records"
  };
  function coverageBox(county) {
    var inv = county.inventory || {}, rc = inv.reconciliation, d = statewideDate(), ci = county.cityInventory || {};
    var rows = [["Local measures", inv.measures], ["Local candidate contests", inv.contests], ["Local candidate rosters", inv.candidates], ["School and special district boundaries", inv.districts]];
    var cityRow = cityListComplete(county) ? "complete, matches the " + ext(ci.source, "Bay Area regional list") + (ci.checked ? " (checked " + esc(fmtDate(ci.checked)) + ")" : "") : (citiesOf(county.id).length ? "not fully collected yet" : "not collected yet");
    var rcText = "";
    if (rc) {
      rcText = "<li><b>Cross-check.</b> " + esc(rc.pagesReached) + " of " + esc(rc.pagesChecked) + " city and district pages checked on " + esc(fmtDate(rc.date)) + " could be read. " +
        (rc.notReachable ? esc(rc.notReachable) + " could not be read, so this county’s list is not fully reconciled." : (inv.measures === "reconciled" ? "" : "Those pages are a sample, so this county’s list is not marked as fully reconciled.")) + "</li>";
    }
    return '<details class="sec"><summary>What has been checked for ' + esc(county.name) + '</summary><div class="body"><ul class="srclist">' +
      "<li><b>City and town list.</b> " + cityRow + ".</li>" +
      rows.map(function (r) { return "<li><b>" + r[0] + ".</b> " + esc(own(INV, r[1]) || "not recorded") + ".</li>"; }).join("") +
      rcText +
      "<li><b>Statewide propositions and statewide contests.</b> " + (d ? "Audited on " + esc(fmtDate(d)) + " by automated research against official sources. " : "") + "A person has not yet reviewed the audit.</li>" +
      '</ul><p class="small">Last checked ' + esc(fmtDate(inv.lastChecked)) + ". A missing item never means it is not on your ballot.</p></div></details>";
  }

  function candNote(county) {
    var inv = (county.inventory || {}).contests;
    if (inv === "collected") return "Local contests come from the official " + esc(county.name) + " candidate list. Contests in districts that cross county lines may be missing.";
    if (inv === "partial") return "Local contests are only partly collected for " + esc(county.name) + ". Many city, school and special district contests are still missing.";
    return "County, city, school and district contests for " + esc(county.name) + " have not been collected yet, so this is not a full list.";
  }

  function viewPlaceNotFound(county, cityId) {
    var bay = isBay(county);
    var why = cityId === "unincorporated" ? esc(county.name) + " has no unincorporated area listed in this guide." : "That city or town is not listed in " + esc(county.name) + " in this guide.";
    app.innerHTML = '<a class="back" href="' + (bay ? "#/find?county=" + enc(county.id) : "#/statewide") + '">' + (bay ? "Choose again" : "Statewide propositions") + "</a>" +
      "<h1>City or town not found</h1><p>" + why + " No ballot choices are shown for it, so nothing here is mislabeled.</p>" +
      '<p><a href="#/ballot/' + enc(county.id) + '">See ballot choices for ' + esc(county.name) + "</a>" + (bay ? ' or <a href="#/find?county=' + enc(county.id) + '">choose your city or town again</a>' : "") + ".</p>";
  }

  function viewBallot(countyId, cityId, extra) {
    var county = J(countyId);
    if (!county || county.type !== "county") return viewNotFound("That county is not in this guide.");
    if (extra) return viewPlaceNotFound(county, extra);
    var place = resolvePlace(county, cityId);
    if (!place) return viewPlaceNotFound(county, cityId);
    var city = place.city, mode = place.mode, applyCity = city ? city.id : null, bay = isBay(county), cc = consolidated(county);
    var buckets = {}; GROUPS.forEach(function (g) { buckets[g.key] = []; });
    DB.measures.forEach(function (m) { var a = applies(m.jurisdiction, countyId, applyCity); if (a) buckets[groupOf(m.jurisdiction, false)].push(itemRow(m, a, false)); });
    DB.contests.forEach(function (c) { var a = applies(c.jurisdiction, countyId, applyCity); if (a) buckets.candidates.push(itemRow(c, a, true)); });
    var cityMeasuresElsewhere = mode === "county" && DB.measures.some(function (m) { var j = J(m.jurisdiction); return j && j.type === "city" && j.parent === countyId; });
    var cov = county.coverage || {};
    var findHref = "#/find?county=" + enc(countyId);
    function emptyText(key) {
      if (key === "county" && cc) return esc(shortName(county)) + " is a consolidated city and county, so its local measures are listed under City and town measures.";
      if (key === "city" && mode === "unincorporated") return "City and town measures do not apply in unincorporated areas. County and district items may still apply. " + samplePlace(county);
      if (key === "city" && mode === "county") return bay ? "Choose your city or town to see " + (cityMeasuresElsewhere ? "its measures" : "any city or town measures") + '. <a href="' + findHref + '">Choose a city or town</a>.' : "Not collected yet for " + esc(county.name) + ". This does not mean nothing is on your ballot. " + samplePlace(county);
      if (cov.status === "not-started" && key !== "state") return "Not collected yet for " + esc(county.name) + ". This does not mean nothing is on your ballot. " + samplePlace(county);
      if (key === "candidates") return "Candidate contests for this area have not been collected yet. This does not mean there are none. " + samplePlace(county);
      return (cov.listComplete ? "No items of this type were found in the official measure list for this area." : "None collected yet. This does not mean nothing is on your ballot.") + " " + samplePlace(county);
    }
    function emptyCount(key) {
      if (key === "county" && cc) return "Listed under City and town measures";
      if (key === "city" && mode === "unincorporated") return "Do not apply in unincorporated areas";
      if (key === "city" && mode === "county" && bay) return "Choose a city or town";
      return cov.listComplete && key !== "candidates" && key !== "state" ? "None on the official list" : "Not yet collected";
    }
    function summarize(rows) {
      var v = rows.filter(function (r) { return r.indexOf("st-ok") > 0; }).length;
      return v === rows.length ? " · all verified" : v ? " · " + v + " verified" : " · not yet verified";
    }
    var groupsHtml = GROUPS.map(function (g) {
      var rows = buckets[g.key];
      var cnt = rows.length ? rows.length + (rows.length === 1 ? " item" : " items") + summarize(rows) : emptyCount(g.key);
      return '<details class="group" data-group="' + g.key + '"><summary><h2>' + esc(g.title) + '</h2><span class="counts">' + cnt + "</span></summary>" +
        (rows.length ? '<div class="rows">' + rows.join("") + "</div>" : '<div class="empty">' + emptyText(g.key) + "</div>") +
        (g.key === "candidates" ? '<div class="empty">' + candNote(county) + " " + samplePlace(county) + "</div>" : "") + "</details>";
    }).join("");
    // Only the consolidated City and County of San Francisco drops the county name; "Napa" alone would hide which county is meant (R3-03).
    var placeName = mode === "city" ? (cc && city.id === cc.id ? city.name : city.name + ", " + county.name) : mode === "unincorporated" ? "unincorporated " + county.name : county.name;
    // "Change place" keeps the city or town (FE-11). Counties outside the Bay Area go back to the statewide page.
    var back = bay ? '<a class="back" href="' + findHref + (cityId && !(cc && cityId === cc.id) ? "&city=" + enc(cityId) : "") + '">Change place</a>' : '<a class="back" href="#/statewide">Change place</a>';
    app.innerHTML =
      back +
      '<section class="ov-head"><p class="eyebrow">' + esc(DB.election.name) + "</p><h1>Ballot choices for " + esc(placeName) + "</h1>" +
        '<p class="muted">' + esc(cov.note || "") + " Open a section to see its items.</p></section>" +
      (bay ? "" : statewideNote()) +
      coverageBox(county) +
      '<div class="note"><b>This is a guide, not your official ballot.</b><p>Your exact ballot depends on your street address. ' + samplePlace(county) + "</p></div>" +
      districtNote(county) +
      '<label class="field">Search these choices<input type="search" id="q" placeholder="Try a measure letter, topic or office" autocomplete="off"></label>' +
      '<p class="vh" id="q-status" role="status" aria-live="polite"></p>' +
      groupsHtml;
    var q = document.getElementById("q");
    q.addEventListener("input", function () {
      var t = q.value.trim().toLowerCase(), shown = 0;
      Array.prototype.forEach.call(app.querySelectorAll(".row"), function (r) { var on = !t || r.getAttribute("data-search").indexOf(t) >= 0; r.hidden = !on; if (on) shown++; });
      Array.prototype.forEach.call(app.querySelectorAll(".group"), function (g) { if (t) g.open = !!g.querySelector(".row:not([hidden])"); });
      document.getElementById("q-status").textContent = t ? shown + " matching items" : "";
    });
  }

  function viewStatewide() {
    var state = DB.measures.filter(function (m) { return m.level === "state"; });
    var others = allCounties().filter(function (c) { return !isBay(c); });
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<section class="ov-head"><p class="eyebrow">' + esc(DB.election.name) + "</p><h1>Statewide California propositions</h1>" +
        '<p class="lede" data-statewide-msg="1">' + esc(STATEWIDE_MSG) + "</p></section>" +
      '<div class="cta"><a class="btn primary" href="propositions.html">Open the Ballot Weighing Tool</a><a class="textlink" href="#/contests">Statewide candidate contests</a></div>' +
      sec("How the Ballot Weighing Tool works", toolSteps()) +
      '<details class="group" data-group="state" open><summary><h2>All statewide propositions</h2><span class="counts">' + state.length + (state.length === 1 ? " item" : " items") + "</span></summary>" +
        (state.length ? '<div class="rows">' + state.map(function (m) { return itemRow(m, { fit: "yes" }, false); }).join("") + "</div>" : '<div class="empty">The statewide list could not be loaded right now. ' + ext("https://voterguide.sos.ca.gov/", "Official California voter guide") + ".</div>") +
      "</details>" +
      '<div class="note"><b>Live in a Bay Area county?</b><p>' + esc(andList(counties().map(shortName))) + ' have local items too. <a href="#/find">Find My Ballot</a>.</p></div>' +
      '<details class="sec"><summary>Statewide items and the elections office for your county</summary><div class="body"><ul class="srclist">' +
        others.map(function (c) { return '<li><a href="#/ballot/' + enc(c.id) + '">' + esc(c.name) + "</a></li>"; }).join("") +
      "</ul></div></details>" +
      districtNote(null);
  }

  function viewItem(id) {
    var m = rec(id); if (!m || !m.identifier) return viewNotFound("That ballot item is not in this guide.");
    var j = J(m.jurisdiction) || {}, county = countyOf(j);
    var h = own(STATUS_HELP, m.status);
    var miss = h ? "Not collected yet. See “" + h[0] + "” above." : "Not collected yet.";
    function f(v) { return field(v, miss); }
    var args = '<div class="claim"><p class="who">Argument in favor</p>' + f(m.argFor) + (m.supporters ? '<p class="small">Supporters include ' + esc(m.supporters.replace(/\.$/, "")) + ".</p>" : "") + "</div>" +
      '<div class="claim"><p class="who">Argument against</p>' + f(m.argAgainst) + (m.opponents ? '<p class="small">Opponents include ' + esc(m.opponents.replace(/\.$/, "")) + ".</p>" : "") + "</div>" +
      '<p class="small">Arguments are each side\'s own claims, summarized and attributed. They are not established facts.</p>';
    app.innerHTML =
      backLink() +
      '<article class="detail">' +
        '<p class="eyebrow">' + esc(j.name || "") + " · " + esc(DB.election.name) + "</p>" +
        "<h1>" + esc(m.identifier) + ". " + esc(m.shortTitle || m.officialTitle) + "</h1>" +
        ((m.officialTitle || m.measureType || m.threshold) ? '<p class="official">' + [m.officialTitle ? "Official title. " + esc(m.officialTitle.replace(/\.$/, "")) + "." : "", m.measureType ? "Type. " + esc(m.measureType.replace(/\.$/, "")) + "." : "", m.threshold ? "Passes with " + esc(m.threshold) + "." : ""].filter(Boolean).join(" ") + "</p>" : "") +
        '<p class="meta">' + badge(m.status) + "<span>Last checked " + esc(fmtDate(m.lastVerified)) + "</span></p>" +
        readingNote(m) +
        statusNote(m, "Use the official sources at the bottom. " + (county ? samplePlace(county) : "Check your official sample ballot.")) +
        (m.detailUrl && /^(propositions\.html#prop-\d+|https:)/.test(m.detailUrl) ? '<div class="note"><b>Full evidence ratings available.</b><p>This proposition has ratings on seven evidence factors, reasons and an optional weighing tool. <a href="' + esc(m.detailUrl) + '">Open ' + esc(m.identifier) + " in the full proposition tool</a>.</p></div>" : "") +
        '<section class="card"><h2>In plain English</h2>' + f(m.plainEnglish) + "</section>" +
        (m.ballotQuestion ? sec("Ballot question, as printed in the official source", '<blockquote class="bq">' + esc(m.ballotQuestion) + "</blockquote>", true) : "") +
        '<div class="yesno"><div class="yn"><b>A YES vote means</b>' + f(m.yes) + '</div><div class="yn"><b>A NO vote means</b>' + f(m.no) + "</div></div>" +
        sec("Why it is on the ballot", f(m.why)) +
        sec("Potential benefits", f(m.benefits)) +
        sec("Costs, risks and trade-offs", f(m.risks)) +
        sec("Who would be affected", f(m.affected)) +
        sec("Financial implications", f(m.fiscal)) +
        sec("What the evidence supports, and what is uncertain", f(m.evidence) + (m.uncertain ? "<p><b>Key uncertainty.</b> " + esc(m.uncertain) + "</p>" : "")) +
        sec("Arguments for and against", args) +
        sec("Official sources and further reading", sourceList(m.sources), true) +
        sec("Research notes", f(m.notes)) +
      "</article>";
  }

  function viewContest(id) {
    var c = rec(id); if (!c || !c.office) return viewNotFound("That contest is not in this guide.");
    var j = J(c.jurisdiction) || {};
    var cands = (c.candidates || []).map(rec).filter(Boolean);
    app.innerHTML =
      backLink() +
      '<article class="detail"><p class="eyebrow">' + esc(j.name || "") + " · " + esc(DB.election.name) + "</p>" +
        "<h1>" + esc(c.office) + (c.district ? ", " + esc(c.district) : "") + "</h1>" +
        '<p class="meta">' + badge(c.status) + "<span>Last checked " + esc(fmtDate(c.lastVerified)) + "</span></p>" +
        readingNote(c) +
        statusNote(c) +
        (c.seats ? '<p class="note">Vote for up to ' + esc(c.seats) + ".</p>" : "") +
        '<p class="small">Candidates appear in the order of the official source, not in any ranking. This guide does not score, rank or recommend candidates.</p>' +
        (cands.length ? '<div class="cands">' + cands.map(function (p) {
          return '<a class="cand" href="#/candidate/' + enc(p.id) + '"><b>' + esc(p.name) + "</b>" + listBadge(p.status) + '<span class="small">' + esc([p.party ? "Party preference " + p.party : null, p.designation ? "Ballot designation " + p.designation : null].filter(Boolean).join(" · ") || "Details not yet collected") + "</span></a>";
        }).join("") + "</div>" : '<p class="missing">Candidate names have not been collected for this contest yet. This does not mean the contest has no candidates.</p>') +
        (c.notes ? sec("Research notes", field(c.notes)) : "") +
        sec("Official sources", sourceList(c.sources), true) +
      "</article>";
  }

  function viewCandidate(id) {
    var p = rec(id); if (!p || !p.name || !p.contest) return viewNotFound("That candidate is not in this guide.");
    var c = rec(p.contest) || {};
    function block(label, val, kind) {
      return '<div class="claim"><p class="who">' + esc(kind) + "</p>" + (val ? (/^https?:/.test(val) ? "<p>" + ext(val, esc(label)) + "</p>" : "<p>" + esc(val) + "</p>") : '<p class="missing">Not yet collected for this candidate.</p>') + "</div>";
    }
    app.innerHTML =
      '<a class="back" href="#/contest/' + enc(p.contest) + '">' + esc(c.office || "Contest") + "</a>" +
      '<article class="detail"><p class="eyebrow">Candidate for ' + esc(c.office || "") + (c.district ? ", " + esc(c.district) : "") + "</p>" +
        "<h1>" + esc(p.name) + "</h1>" +
        '<p class="meta">' + badge(p.status) + "<span>Last checked " + esc(fmtDate(p.lastVerified)) + "</span></p>" +
        readingNote(c) +
        statusNote(p) +
        sec("From the official candidate list", (p.incumbent ? "<p>Marked as the incumbent in the official source.</p>" : "") + "<p>" + esc([p.party ? "Party preference. " + p.party + "." : "Party preference not listed or not collected.", p.designation ? "Ballot designation. " + p.designation + "." : "Ballot designation not collected."].join(" ")) + '</p><p class="small">Facts as printed in the official source listed at the bottom of this page.</p>' + (p.notes ? '<p class="small">' + esc(p.notes) + "</p>" : ""), true) +
        sec("In the candidate's own words", (p.statementNote && !p.statementUrl ? '<div class="claim"><p class="who">Candidate statement</p><p>' + esc(p.statementNote) + "</p></div>" : block("Read the official candidate statement", p.statementUrl, "Candidate statement, the candidate's own claims")) + '<p class="small">Statements are written by candidates and are not fact-checked by elections officials. Not every candidate submits one.</p>') +
        sec("Qualifications and experience", field(p.qualifications)) +
        sec("Stated policy positions", field(p.positions)) +
        sec("Documented public record", field(p.publicRecord)) +
        sec("Campaign finance", block("Search official campaign finance filings", p.financeUrl, "Official disclosure records") + '<p class="small">Totals change through Election Day. Check the filing dates on the official site.</p>') +
        sec("Sources", sourceList(p.sources), true) +
      "</article>";
  }

  // Places with local contests, built from the contest records (FE-07).
  function localContestPlaces() {
    var byCounty = {}, order = [];
    DB.contests.forEach(function (x) {
      var j = J(x.jurisdiction); if (!isLocalJur(j)) return;
      var county = countyOf(j) || (j.counties && j.counties.length ? J(j.counties[0]) : null); if (!county) return;
      var placeJ = j.type === "council-district" ? J(j.parent) || j : j.type === "supervisor-district" ? county : j;
      if (!byCounty[county.id]) { byCounty[county.id] = { county: county, names: [] }; order.push(county); }
      var cc = consolidated(county);
      var nm = j.type === "supervisor-district" ? "Board of Supervisors districts" : placeJ === cc ? "city offices" : placeJ.type === "county" ? (cc ? "city and county offices" : "county offices") : placeJ.name;
      if (byCounty[county.id].names.indexOf(nm) < 0) byCounty[county.id].names.push(nm);
    });
    return order.sort(byName).map(function (c) { return esc(consolidated(c) ? shortName(c) : c.name) + " (" + esc(andList(byCounty[c.id].names)) + ")"; });
  }

  function viewContests() {
    var sets = [["Statewide", function (j) { return j.type === "state"; }],
      ["Congress, State Senate and State Assembly", function (j) { return j.type === "state-district"; }]];
    counties().forEach(function (c) { sets.push([c.name, function (j) { return isLocalJur(j) && (countyOf(j) || {}).id === c.id; }]); });
    var html = sets.map(function (s) {
      var rows = DB.contests.filter(function (c) { var j = J(c.jurisdiction); return j && s[1](j); });
      return rows.length ? '<details class="group"' + (s[0] === "Statewide" ? " open" : "") + '><summary><h2>' + esc(s[0]) + '</h2><span class="counts">' + rows.length + (rows.length === 1 ? " contest" : " contests") + '</span></summary><div class="rows">' + rows.map(function (c) { var j = J(c.jurisdiction); return itemRow(c, j.type === "state" ? null : { fit: "maybe" }, true); }).join("") + "</div></details>" : "";
    }).join("");
    var places = localContestPlaces();
    app.innerHTML = backLink() +
      '<section class="ov-head"><h1>Candidates and contests</h1><p class="muted">' + esc(DB.election.name) + ". Statewide, congressional and legislative contests come from the Secretary of State's certified list. " +
        (places.length ? "Local contests are collected so far only for these places: " + places.join("; ") + ". " : "No local contests have been collected yet. ") +
        "This is not a full list of every race on your ballot. Use Find My Ballot to see what may apply where you live.</p></section>" +
      html +
      '<p class="small">Candidates are never scored, ranked or recommended here.</p>';
  }

  function viewBrowse() {
    var rows = counties().map(function (c) {
      return rowLink("#/ballot/" + enc(c.id), c.name, (own(COVERAGE, (c.coverage || {}).status) || "") + " · " + countText(countsFor(c.id)));
    }).join("");
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<section class="ov-head"><h1>Browse all available ballots</h1><p class="muted">' + esc(DB.election.name) + ". Pick a county to see everything collected for it.</p></section>" +
      '<div class="group" ><div class="rows"><a class="row" href="propositions.html"><span class="rt"><span class="rti">Statewide propositions</span><span class="rsub">All of California · full evidence tool</span></span></a>' + rows + "</div></div>" +
      '<details class="sec"><summary>Other California counties (statewide items only so far)</summary><div class="body"><ul class="srclist">' +
        allCounties().filter(function (c) { return !isBay(c); }).map(function (c) { return '<li><a href="#/ballot/' + enc(c.id) + '">' + esc(c.name) + "</a></li>"; }).join("") +
      "</ul></div></details>";
  }

  // Back goes to the previous page in this guide when there is one, otherwise to Find My Ballot.
  var navCount = 0;
  function backLink() { return '<a class="back" href="#/find" data-back="1">Back</a>'; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-back]") : null;
    if (a && navCount > 1) { e.preventDefault(); history.back(); }
  });

  // How the Ballot Weighing Tool works, in three steps. Matches propositions.html; the tool itself is unchanged.
  function toolSteps() {
    return '<ol class="srclist" data-tool-steps="1">' +
      "<li><b>Set your priorities.</b> The tool starts with standard weights for seven evidence factors, such as net benefit, evidence strength and fiscal clarity. You can keep them or set how much each one matters to you.</li>" +
      "<li><b>Review each proposition.</b> Read the plain-English facts, the ratings with their reasons, and the official sources, then say how you feel about the measure’s goal.</li>" +
      "<li><b>See how your priorities shape the result.</b> If you support a measure’s goal, the tool checks its evidence score under your weights and shows Leans toward YES or Mixed / uncertain. If you oppose the goal, it shows Leans toward NO, which reflects your view, not the evidence. Not sure is not counted either way.</li>" +
      "</ol>" +
      '<p class="small">A lean is the result of this tool’s method and the weights you chose. It is not an official recommendation, a prediction, or an instruction on how to vote.</p>';
  }

  function viewAbout() {
    var n = coverCounts(), R = DB.region || {};
    var nc = counties().length;
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<article class="detail" data-about="1"><p class="eyebrow">Beta release</p><h1>About this guide</h1>' +
      '<p class="lede">Scope, coverage and limitations of this beta.</p>' +
      '<div class="note warn"><b>Beta release. Coverage and evidence are still being verified.</b>' +
        "<p>This independent guide helps voters explore California ballot measures and candidates, review supporting evidence, and weigh issues according to their own priorities. Its summaries, evidence, ratings and local ballot listings have not yet been independently verified by a person. Local coverage may be incomplete, and district-specific contests may not apply to every voter.</p>" +
        "<p>Please confirm your ballot and important details with your county elections office’s official voter information.</p></div>" +
      sec("What this guide does", "<p>It lists statewide propositions, Bay Area local measures and candidate contests for the " + esc(DB.election.name) + ", explains each in plain English with its official sources, and shows what has not been collected yet. It never tells you how to vote, and it never scores, ranks or recommends candidates.</p>", true) +
      sec("What it covers", "<p>All of California for the " + n.state + " statewide propositions and the statewide contests, such as Governor. Congressional, State Senate and State Assembly contests only for the districts that include Bay Area counties. Local measures and contests only for the " + nc + " Bay Area counties" + (R.municipalityCount ? " and their " + num(R.municipalityCount) + " cities and towns" : "") + ", plus a few districts that cross into neighboring counties. Other counties show statewide items only.</p>" + coveredSummary(), true) +
      sec("How information is checked", "<p>Four different things happen. Only review by a person confirms a fact, and it has not happened yet.</p><ul class=\"srclist\">" +
        "<li><b>Software tests.</b> Automated checks test that the site works and that the data is consistent. For example, every published ballot question must match its quoted official source, links must use https (two county links that offer only http are labeled), and counts must add up. They cannot tell whether a source was read correctly.</li>" +
        "<li><b>Automated and AI-assisted reading.</b> Most facts were collected by automated research and an AI assistant reading official documents. Scanned forms were read by OCR. Where that matters most, the item says so next to the facts.</li>" +
        "<li><b>Review by a person.</b> " + (n.verified ? num(n.verified) + " records have been checked by a person against the official source." : "No record has yet been checked by a person against the official source.") + " That is why items carry a review status on their own pages, and why nothing is marked Verified.</li>" +
        "<li><b>Completeness.</b> No county’s local list has been reconciled against every city and district, so local coverage is incomplete.</li></ul>", true) +
      sec("Districts and eligibility", "<p>District lines for schools, special districts, supervisors, Congress and the Legislature are not mapped to addresses here. Those contests are marked “may apply.” Choosing a county or city in this guide does not confirm which districts you live in or what is on your ballot.</p>") +
      sec("How the Ballot Weighing Tool works", toolSteps() +
        "<p>The ratings are structured judgments made for this tool with AI research assistance, using one published rubric for every proposition. They are not official ratings. Three ratings are flagged for the owner’s review because their written reasons may not match the rubric. They are Proposition 44’s accountability and the evidence strength of Propositions 37 and 38. Their values are unchanged until that review is done. Each of those propositions lists the open question on its page in this guide, and the Ballot Weighing Tool notes it too.</p>" +
        '<p><a href="propositions.html">Open the Ballot Weighing Tool</a></p>') +
      sec("What the labels mean", '<ul class="srclist">' +
        "<li><b>Incomplete (required info or evidence is missing).</b> Something a voter needs, such as the ballot question or the official text, has not been collected. The item lists what is missing.</li>" +
        "<li><b>Needs review.</b> The facts have sources, but a person has not yet checked them. During the beta every item is at this stage or Incomplete, so lists leave this label out. Each item’s own page shows it, with what still needs checking.</li>" +
        "<li><b>May apply.</b> The contest or measure covers only part of your county or city. Check your sample ballot.</li>" +
        "<li><b>Verified.</b> A person has checked the item against the official source. No item has this label yet.</li></ul>") +
      sec("Confirm your ballot", "<p>Your county elections office has your official sample ballot. <a href=\"#/find\">Find My Ballot</a> links to your county’s lookup.</p><ul class=\"srclist\">" +
        [OFFICIAL.offices, OFFICIAL.guide, OFFICIAL.hotlines, OFFICIAL.access].map(function (l) { return "<li>" + ext(l[0], l[1]) + "</li>"; }).join("") + "</ul>", true) +
      '<p class="small">Coverage and checking are ongoing. Figures on this page are counted from the guide’s data each time it loads.</p>' +
      "</article>";
  }

  function viewNotFound(msg) {
    app.innerHTML = '<a class="back" href="#/">Home</a><h1>Not found</h1><p>' + esc(msg) + ' <a href="#/find">Find your ballot</a>.</p>';
  }

  /* ---------- Router ---------- */
  function dec(s) { try { return decodeURIComponent(s); } catch (e) { return null; } }
  function route() {
    navCount++;
    var h = location.hash.replace(/^#\/?/, "");
    var qs = Object.create(null), qi = h.indexOf("?"), bad = false;
    if (qi >= 0) {
      h.slice(qi + 1).split("&").forEach(function (kv) { if (!kv) return; var p = kv.split("="), k = dec(p[0]), v = dec(p[1] || ""); if (k === null || v === null) bad = true; else qs[k] = v; });
      h = h.slice(0, qi);
    }
    var parts = h.split("/").filter(Boolean).map(dec);
    if (parts.some(function (p) { return p === null; })) bad = true;
    var v = bad ? "\u0000" : parts[0] || "";
    if (bad) viewNotFound("That page address is not valid.");
    else if (v === "") viewHome();
    else if (v === "find" && parts.length === 1) viewFind(qs);
    else if (v === "statewide" && parts.length === 1) viewStatewide();
    else if (v === "about" && parts.length === 1) viewAbout();
    else if (v === "ballot") viewBallot(parts[1], parts[2], parts.slice(3).join("/"));
    else if (v === "item") viewItem(parts.slice(1).join("/"));
    else if (v === "contest") viewContest(parts.slice(1).join("/"));
    else if (v === "candidate") viewCandidate(parts.slice(1).join("/"));
    else if (v === "browse" && parts.length === 1) viewBrowse();
    else if (v === "contests" && parts.length === 1) viewContests();
    else viewNotFound("That page does not exist.");
    var warn = loadWarning();
    if (warn) app.insertAdjacentHTML("afterbegin", warn);
    // The title is for the browser tab and history only. The visitor counter never reads it (see countVisit).
    var h1 = app.querySelector("h1");
    document.title = (v && h1 ? h1.textContent + " · " : "") + SITE;
    // Route changes are announced by moving focus to the new h1, not by a live region over the whole page.
    focusTop();
  }

  countVisit();
  loadData().then(function () { window.addEventListener("hashchange", route); route(); })
    .catch(function (err) {
      app.innerHTML = '<h1>Something went wrong loading the guide</h1><p>' + esc(err && err.message || "Unknown error") + '. Please refresh the page. The <a href="propositions.html">statewide proposition tool</a> still works on its own, and the official ' + ext("https://voterguide.sos.ca.gov/", "California voter guide") + " has every statewide measure.</p>";
      focusTop();
    });
})();
