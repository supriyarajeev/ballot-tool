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
  // Lists use a short label so long titles keep their width; the item page shows the full label.
  function listBadge(status) { return status === "needs-review" ? "" : status === "incomplete" ? '<span class="badge st-inc">Incomplete<span class="vh"> (required info or evidence is missing)</span></span>' : badge(status); }
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
    if (/bay-map\.json$/.test(p)) return "county map";
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
    return Promise.all([fetchJSON("data/elections.json"), fetchJSON("data/jurisdictions.json"), soft("data/region.json"), soft("data/bay-map.json"), soft("data/candidate-rubric.json")]).then(function (r) {
      DB.elections = r[0].elections || [];
      DB.jurList = r[1].jurisdictions || [];
      DB.jurList.forEach(function (j) { if (j && typeof j.id === "string") DB.jur[j.id] = j; });
      DB.region = r[2] && Array.isArray(r[2].counties) ? r[2] : null;
      DB.map = r[3] && Array.isArray(r[3].counties) ? r[3] : null;
      DB.rubric = r[4] && Array.isArray(r[4].offices) ? r[4] : null;
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
    // The regional facts and the map are optional extras; each has its own fallback where it is shown.
    var f = DB.failed.filter(function (x) { return x.label !== "Bay Area regional facts" && x.label !== "county map" && !/candidate-rubric/.test(x.file); });
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
  // A short line near the top of a record: how many sources, how many official, and a button that opens them.
  // Measure types come from different counties' documents in different capitalization ("Parcel Tax Measure", "Parcel tax").
  // Display them in sentence case only; the data keeps the source's own wording.
  function typeLabel(t) { t = String(t).replace(/\.$/, ""); return /^([A-Z][a-z]+)( (and|or|of|[A-Z][a-z]+))+$/.test(t) ? t.charAt(0) + t.slice(1).toLowerCase() : t; }
  // Candidate pictures. A photo is shown only when its record has a local file, a credit, a license and a recorded
  // reuse basis (see the validator). That basis is a license tag on the source file, not permission from the candidate.
  // Every candidate in a contest gets the same frame, so a missing photo never changes how a candidate is presented.
  function hasPhoto(p) { var ph = p && p.photo; return !!(ph && typeof ph.src === "string" && /^assets\/candidates\/[a-z0-9-]+\.(jpg|png|webp)$/.test(ph.src) && ph.permission && ph.credit); }
  // A photo appears for each candidate who has one with a recorded source, credit and license (owner decision,
  // Oct 24, 2026). A grey placeholder means no reusable photo was found; it says nothing about the candidate.
  var PHOTO_NOTE = "A grey placeholder means this beta guide did not find a photo it could reuse. It says nothing about the candidate.";
  function photoCredits(cands) {
    return '<p class="small credits">Photos: ' + cands.map(function (p) { return esc(p.name) + ", " + esc(p.photo.credit.replace(/\.$/, "")) + " (" + ext(p.photo.sourcePage, "source") + (p.photo.licenseUrl ? ", " + ext(p.photo.licenseUrl, "license") : "") + ")"; }).join("; ") + ". Each was cropped and resized for this guide.</p>";
  }
  function initials(name) {
    var w = String(name || "").replace(/["“”(][^"“”)]*["“”)]/g, " ").replace(/,.*$/, "").split(/\s+/).filter(function (x) { return /^[A-Za-zÀ-ÿ]/.test(x) && !/^(Jr|Sr|II|III|IV)\.?$/i.test(x); });
    if (!w.length) return "";
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }
  function candPhoto(p, size, show) {
    var ph = p && p.photo, ok = show && hasPhoto(p);
    if (ok) return '<img class="cphoto" src="' + esc(ph.src) + '" width="' + size + '" height="' + size + '" alt="Photo of ' + esc(p.name) + '" loading="lazy" decoding="async">';
    // Neutral placeholder with the candidate's initials (from the official name; nicknames in quotes or brackets skipped).
    return '<span class="cphoto ph" aria-hidden="true"><span class="ini">' + esc(initials(p && p.name)) + "</span></span>";
  }
  function evidenceLine(x) {
    var ss = x.sources || [], off = ss.filter(function (s) { return /^Official\b/.test(s.type || ""); }).length;
    if (!ss.length) return '<p class="evline">' + icon("doc") + "<span>No official source recorded yet.</span></p>";
    return '<p class="evline">' + icon("doc") + "<span>" + ss.length + (ss.length === 1 ? " source" : " sources") + ", " + off + " official.</span> " +
      '<button type="button" class="linkbtn" data-jump="sources">Show sources</button></p>';
  }
  function sourceList(sources) {
    if (!sources || !sources.length) return '<p class="missing">No official source recorded yet.</p>';
    return '<ol class="srclist">' + sources.map(function (s) {
      var off = /^Official\b/.test(s.type || "");
      return "<li>" + ext(s.url, esc(s.label)) + (s.type ? '<span class="role' + (off ? " official" : "") + '">' + (off ? icon("check") : "") + esc(s.type) + "</span>" : "") + "</li>";
    }).join("") + "</ol>";
  }
  // Empty fields say "Not collected yet", never the wording of another status badge (FE-08).
  function field(v, missing) { return v ? "<p>" + esc(v) + "</p>" : '<p class="missing">' + esc(missing || "Not collected yet.") + "</p>"; }
  function sec(title, inner, open, id) { return '<details class="sec"' + (id ? ' id="' + esc(id) + '"' : "") + (open ? " open" : "") + "><summary>" + esc(title) + '</summary><div class="body">' + inner + "</div></details>"; }
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
  function districtNote(county, id, notBallot) {
    return '<div class="note" role="note" data-district-note="1"><b>Districts may not match city or county lines.</b><p>School, community college, special and legislative districts may not match city or county lines. A county and a city or town cannot identify every contest on your ballot, and neither can a ZIP code. This guide marks those items as “may apply”.</p><p' + (id ? ' id="' + id + '"' : "") + ">" + (notBallot ? "This guide is not your official ballot, which depends on your street address. " : "") + lookupSentence(county) + "</p></div>";
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

  /* ---------- Small visuals: icons, county map, key dates, tool steps, coverage bars ---------- */
  // Line icons drawn for this guide (24px grid, stroke only). Always decorative: the text next to them carries the meaning.
  var ICONS = {
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    scale: '<path d="M12 4v16M6 20h12M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    check: '<path d="M5 12.5l4 4L19 6.5"/>',
    share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>',
    print: '<path d="M7 9V3.5h10V9M7 17H4.5v-7a1 1 0 011-1h13a1 1 0 011 1v7H17"/><rect x="7" y="14" width="10" height="6.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    ballot: '<path d="M4 11h16v9H4zM8 11V4h8v7M10.5 7.5h3"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'
  };
  function icon(name, cls) { return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>"; }

  // Nine-county map from data/bay-map.json (U.S. Census Bureau outlines). Each county is a link to its ballot.
  function mapFigure() {
    var cs = counties(), M = DB.map;
    var ids = cs.map(function (c) { return c.id; });
    var shapes = M ? M.counties.filter(function (m) { return ids.indexOf(m.id) >= 0 && typeof m.d === "string" && /^[MLZz0-9.,\- ]+$/.test(m.d); }) : [];
    if (!M || shapes.length !== cs.length) {
      return '<nav class="maplist" aria-label="Bay Area counties"><p class="small">Choose a county to see what this guide lists for it.</p><ul>' +
        cs.map(function (c) { return '<li><a href="#/ballot/' + enc(c.id) + '">' + esc(shortName(c)) + "</a></li>"; }).join("") + "</ul></nav>";
    }
    // Each county is one link holding its shape and its label, so the label (and San Francisco's leader line) is part of the target.
    var svg = '<svg class="baymap-svg" viewBox="' + esc(M.viewBox) + '" role="group" aria-labelledby="map-cap">' +
      (M.context || []).filter(function (d) { return /^[MLZz0-9.,\- ]+$/.test(d); }).map(function (d) { return '<path class="ctx" d="' + d + '"/>'; }).join("") +
      shapes.map(function (m) {
        var c = J(m.id), lab = Array.isArray(m.label) ? m.label : [0, 0];
        return '<a class="cty" href="#/ballot/' + enc(m.id) + '" aria-label="' + esc(c.name) + ', see what this guide lists"><path d="' + m.d + '"/>' +
          (m.leader ? '<path class="leader" d="M' + (+m.leader[0][0]) + " " + (+m.leader[0][1]) + "L" + (+m.leader[1][0]) + " " + (+m.leader[1][1]) + '"/>' : "") +
          '<text class="clab" x="' + (+lab[0]) + '" y="' + (+lab[1]) + '" text-anchor="' + (m.labelAnchor === "end" ? "end" : "middle") + '">' + esc(shortName(c)) + "</text></a>";
      }).join("") + "</svg>";
    var src = M.source || {};
    return '<figure class="baymap">' + svg + '<figcaption id="map-cap"><b>The nine Bay Area counties.</b> Choose one to see what this guide lists for it.' +
      '<span class="small"> Outlines from the ' + ext(src.url || "https://www.census.gov/", esc(src.publisher || "U.S. Census Bureau")) + " (2017, simplified). Not for finding your district.</span></figcaption></figure>";
  }

  // Official key dates for this election, from data/elections.json. Past dates are marked using this device's date.
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function shortDate(iso) { var d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  function keyDatesCard() {
    var kd = (DB.election.keyDates || []).filter(function (k) { return k && /^\d{4}-\d{2}-\d{2}$/.test(k.date) && k.label; });
    if (!kd.length) return "";
    var today = todayISO(), nextSet = false;
    var urls = [], seen = {};
    kd.forEach(function (k) { if (/^https:/.test(k.url || "") && !seen[k.url]) { seen[k.url] = 1; urls.push(k.url); } });
    return '<section class="card" aria-labelledby="dates-h" data-key-dates="1"><h2 id="dates-h">' + icon("calendar") + "Key dates for this election</h2>" +
      '<ol class="timeline">' + kd.map(function (k) {
        var st = k.date < today ? "past" : k.date === today ? "today" : (!nextSet ? (nextSet = true, "next") : "");
        var tag = st === "past" ? "Passed" : st === "today" ? "Today" : st === "next" ? "Next" : "";
        return '<li class="' + st + '"><time datetime="' + esc(k.date) + '">' + esc(shortDate(k.date)) + "</time>" +
          '<div><b>' + esc(k.label) + "</b>" + (tag ? ' <span class="when">' + tag + "</span>" : "") + '<p class="small">' + esc(k.text) + "</p></div></li>";
      }).join("") + "</ol>" +
      '<p class="small">From the California Secretary of State: ' + urls.map(function (u, i) { return ext(u, i === 0 ? "general election page" : "election dates and resources"); }).join(" and ") +
      (DB.election.keyDatesRetrieved ? ", read " + esc(fmtDate(DB.election.keyDatesRetrieved)) : "") + ". Your county may add its own dates and locations.</p></section>";
  }

  // Local coverage as bars, one row per county, computed from the records. The grey part is listed, ballot question not collected yet.
  function coverageBars() {
    var rows = counties().map(function (c) {
      var ms = DB.measures.filter(function (x) { var j = J(x.jurisdiction); if (!j || j.type === "state") return false; if (j.type === "region") return (j.counties || []).indexOf(c.id) >= 0; return inCounty(j, c.id); });
      var ks = DB.contests.filter(function (x) { var j = J(x.jurisdiction); return isLocalJur(j) && inCounty(j, c.id); });
      var own = ks.filter(function (x) { return (countyOf(J(x.jurisdiction)) || {}).id === c.id; }).length;
      return { c: c, n: ms.length, q: ms.filter(function (m) { return m.ballotQuestion; }).length, k: ks.length, own: own };
    });
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; }).concat([1]));
    return '<table class="covbars" data-coverage-bars="1"><caption>Local items listed in this guide, by county</caption>' +
      '<thead><tr><th scope="col">County</th><th scope="col">Local measures listed</th><th scope="col">Local contests listed</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var w = Math.round(100 * r.n / max), wq = r.n ? Math.round(100 * r.q / r.n) : 0;
        return '<tr><th scope="row"><a href="#/ballot/' + enc(r.c.id) + '">' + esc(shortName(r.c)) + "</a></th>" +
          '<td><svg class="bar" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect class="nq" x="0" y="0" width="' + Math.max(w, 1) + '" height="10" rx="0"/><rect class="q" x="0" y="0" width="' + Math.round(w * wq / 100) + '" height="10"/></svg><span class="barnum">' + r.n + " listed" + (r.n ? ", " + r.q + " with ballot question" : "") + "</span></td>" +
          "<td>" + (r.own ? r.own + (r.k > r.own ? ', plus ' + (r.k - r.own) + " from districts based in a neighboring county" : "") : r.k ? '<span class="muted">' + r.k + (r.k === 1 ? " district contest" : " district contests") + " based in a neighboring county; the county’s own contests are not collected yet</span>" : '<span class="muted">not collected yet</span>') + "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<p class="small legend"><span class="sw q" aria-hidden="true"></span> ballot question recorded <span class="sw nq" aria-hidden="true"></span> listed, ballot question not collected yet. Bars show what this guide lists, not everything on the ballot. A measure that covers several counties, such as the regional transit measure, is counted in each.</p>';
  }

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
    // "The region at a glance": two parallel sections, Bay Area and California, with the same four cards in the same
    // order (counties, incorporated cities, residents, registered voters), the same layout and the same source-note style.
    // A card is shown only when its figure is in data/region.json with a source; otherwise it says Not available.
    var G = R && R.glance;
    function sum(o) { var t = 0, ok = true; cs.forEach(function (c) { var v = o && o.byCounty ? o.byCounty[c.id] : undefined; if (typeof v === "number") t += v; else ok = false; }); return ok && cs.length ? t : null; }
    function mil(n) { return (Math.round(n / 1e5) / 10) + " million"; }
    function milN(n) { return String(Math.round(n / 1e5) / 10); }
    function shortD(iso) { var d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    function tile(big, unit, label, l1, l2, sr) { return { big: big, unit: unit, label: label, l1: l1, l2: l2, sr: sr }; }
    function none(label) { return tile("—", "", label, "Not available", "", label + " not available"); }
    var pop = G && G.population ? sum(G.population) : null, reg = G && G.registration ? sum(G.registration) : null;
    var regionSrc = [], seenF = {};
    facts.forEach(function (f) { if (!seenF[f.url]) { seenF[f.url] = 1; regionSrc.push(ext(f.url, esc(f.publisher === "Metropolitan Transportation Commission" ? "MTC" : f.publisher === "Association of Bay Area Governments" ? "ABAG" : f.publisher))); } });
    var bay = [
      R && R.countyCount ? tile(String(R.countyCount), "", "counties", "MTC and ABAG definition", "", R.countyCount + " counties in the Bay Area") : none("Counties"),
      R && R.municipalityCount ? tile(String(R.municipalityCount), "", "incorporated cities", "MTC and ABAG list", "", R.municipalityCount + " incorporated cities and towns in the Bay Area") : none("Incorporated cities"),
      pop ? tile(milN(pop), "million", "residents", num(pop), "estimate, " + shortD(G.population.asOf), "About " + mil(pop) + " Bay Area residents, " + num(pop) + ", estimate for " + fmtDate(G.population.asOf)) : none("Residents"),
      reg ? tile(milN(reg), "million", "registered voters", num(reg), "as of " + shortD(G.registration.asOf), "About " + mil(reg) + " registered voters in the nine Bay Area counties, " + num(reg) + ", as of " + fmtDate(G.registration.asOf)) : none("Registered voters")
    ];
    var cc = G && G.californiaCounties, ci = G && G.californiaCities;
    var ca = [
      cc && cc.count === allCounties().length ? tile(String(cc.count), "", "counties", "Secretary of State list", "", cc.count + " counties in California") : none("Counties"),
      ci && ci.count ? tile(String(ci.count), "", "incorporated cities", "Department of Finance", "as of " + shortD(ci.asOf), ci.count + " incorporated cities in California, as of " + fmtDate(ci.asOf)) : none("Incorporated cities"),
      G && G.population && G.population.state ? tile(milN(G.population.state), "million", "residents", num(G.population.state), "estimate, " + shortD(G.population.asOf), "About " + mil(G.population.state) + " California residents, " + num(G.population.state) + ", estimate for " + fmtDate(G.population.asOf)) : none("Residents"),
      G && G.registration && G.registration.state ? tile(milN(G.registration.state), "million", "registered voters", num(G.registration.state), "as of " + shortD(G.registration.asOf), "About " + mil(G.registration.state) + " registered voters in California, " + num(G.registration.state) + ", as of " + fmtDate(G.registration.asOf)) : none("Registered voters")
    ];
    var P = G && G.population, RG = G && G.registration;
    var baySrc = [
      regionSrc.length ? regionSrc.join(" and ") + " (counties, cities)" : "",
      P ? ext(P.url, "Department of Finance E-1") + " (residents, " + esc(P.status || "estimate") + ", " + esc(fmtDate(P.asOf)) + ", nine county rows added)" : "",
      RG ? ext(RG.url, "Secretary of State, Report of Registration") + " (voters, " + esc(fmtDate(RG.asOf)) + ", nine county rows added)" : ""
    ].filter(Boolean);
    var caSrc = [
      cc ? ext(cc.url, "Secretary of State") + " (counties)" : "",
      ci ? ext(ci.url, "Department of Finance E-1") + " (cities, " + esc(fmtDate(ci.asOf)) + ")" : "",
      P ? ext(P.url, "Department of Finance E-1") + " (residents, " + esc(P.status || "estimate") + ", " + esc(fmtDate(P.asOf)) + ")" : "",
      RG ? ext(RG.url, "Secretary of State, Report of Registration") + " (voters, " + esc(fmtDate(RG.asOf)) + ", state total)" : ""
    ].filter(Boolean);
    function group(name, tiles, id, src) {
      return '<section class="gl-group" aria-labelledby="' + id + '"><h3 class="gl-h" id="' + id + '">' + esc(name) + '</h3><ul class="gl">' + tiles.map(function (t) {
        return '<li' + (t.big === "—" ? ' class="gl-na"' : "") + '><b aria-hidden="true">' + esc(t.big) + (t.unit ? "<small> " + esc(t.unit) + "</small>" : "") + '</b><span class="gl-l" aria-hidden="true">' + esc(t.label) + "</span>" +
          '<span class="gl-m" aria-hidden="true">' + esc(t.l1) + "</span>" + '<span class="gl-m" aria-hidden="true">' + (t.l2 ? esc(t.l2) : "&nbsp;") + "</span>" + '<span class="vh">' + esc(t.sr) + "</span></li>";
      }).join("") + '</ul><p class="small gl-src" data-glance-sources="1"><b>Sources</b> ' + src.join(" · ") + "</p></section>";
    }
    return '<section class="card" aria-labelledby="region-h" data-region-card="1"><h2 id="region-h">' + icon("pin") + 'The region at a glance</h2>' +
      (R ? '<div class="glance" data-glance="1">' + group(R.name || "San Francisco Bay Area", bay, "gl-bay", baySrc) + group("California statewide", ca, "gl-ca", caSrc) + "</div>" : regionLine) +
      '<p class="small" data-glance-method="1"><b>How these figures were put together.</b> The Bay Area is the nine counties named below, as MTC and ABAG define it. Its residents and registered voters are the nine county rows of the same state tables added together, so both sections use the same sources and dates. Residents are a January 1, 2026 provisional estimate; registered voters are from the September 4, 2026 report for this election (the 15-day report was not yet published when checked on October 24, 2026), so the two dates differ. Residents and registered voters are different counts. Incorporated cities include places named towns, such as Los Gatos. Many residents live in unincorporated communities governed by their county. San Francisco is one city and county.</p>' +
      '<p data-county-names="1">The ' + (cs.length === 9 ? "nine" : esc(cs.length)) + " counties are " + esc(andList(cs.map(shortName))) + ". Elsewhere in California, this guide covers statewide items, plus the few local district items it found that cross county lines from the Bay Area. <a href=\"#/statewide\">Statewide propositions</a>.</p>" +
      quotes +
      (R && R.note ? '<p class="small">' + esc(R.note) + "</p>" : "") +
      (!R ? '<p class="small">The regional facts could not be loaded right now.</p>' : "") +
      "</section>" +
      // Guide coverage, computed from the data. Kept apart from the regional facts above.
      '<section class="card" aria-labelledby="covered-h" data-covered-card="1"><h2 id="covered-h">' + icon("list") + 'What’s covered</h2>' + coveredSummary() +
      '<h3 id="cov-ind-h">This guide’s local coverage is growing county by county</h3>' +
      '<ul class="stats" aria-labelledby="cov-ind-h" data-coverage-indicator="1">' + stats.map(function (s) {
        return '<li><b aria-hidden="true">' + esc(s[0]) + (s[1].indexOf("counties") === 0 ? '<span class="of"> / ' + cs.length + "</span>" : "") + '</b><span aria-hidden="true">' + esc(s[1]) + '</span><span class="vh">' + esc(s[2]) + "</span></li>";
      }).join("") + "</ul>" +
      '<p class="small">Counted from this guide’s data each time the page loads.</p>' +
      coverageBars() +
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
    access: ["https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm", "Assistance for voters with disabilities"],
    // Added Oct 24, 2026 (audit/2026-10-24/stage1/official-links.md). The pages marked * could not be opened by the
    // audit's tools (a bot check or a redirect loop); each is linked by name from a checked Secretary of State page.
    sameday: ["https://www.sos.ca.gov/elections/voter-registration/same-day-reg", "Same-day (conditional) voter registration"],
    status: ["https://voterstatus.sos.ca.gov/", "Check your voter registration status"], // *
    early: ["https://caearlyvoting.sos.ca.gov/", "Early voting and ballot drop-off locations"], // *
    polling: ["https://www.sos.ca.gov/elections/polling-place", "Polling place lookup by county"],
    track: ["https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot", "Track your ballot (Where’s My Ballot?)"],
    formats: ["https://voterguide.sos.ca.gov/en/alt-versions/", "Voter guide in audio, large print and other languages"],
    props: ["https://voterguide.sos.ca.gov/propositions/", "All propositions in the official voter guide"],
    statements: ["https://voterguide.sos.ca.gov/candidates/", "Official candidate statements"],
    certlist: ["https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf", "Certified list of candidates (PDF)"]
  };
  function links(keys) { return keys.map(function (k) { return ext(OFFICIAL[k][0], OFFICIAL[k][1]); }).join(" · "); }
  function nextSteps() {
    return '<section class="card" aria-labelledby="next-h" data-next-steps="1"><h2 id="next-h">' + icon("ballot") + 'Before you vote</h2>' +
      "<p>Check your official sample ballot. <a href=\"#/find\">Find My Ballot</a> links to your county’s own lookup, or use the Secretary of State’s list of " + ext(OFFICIAL.offices[0], OFFICIAL.offices[1].toLowerCase()) + ".</p>" +
      "<p>Choosing a county or city here does not confirm your districts or what is on your ballot. School, special and supervisor districts often cross city lines.</p>" +
      "<p>Missed the registration deadline? Through Election Day you can still register and vote at your county elections office, a vote center or a polling place. Your ballot is counted once the county completes its checks. " + ext(OFFICIAL.sameday[0], "How same-day registration works") + ".</p>" +
      '<p class="small">' + links(["status", "early", "track", "guide", "formats", "hotlines", "access"]) + "</p>" +
      "</section>";
  }

  function viewHome() {
    app.innerHTML =
      '<div class="hero-grid">' +
      '<section class="hero">' +
        '<p class="eyebrow">' + esc(DB.election.name) + "</p>" +
        '<h1 class="hero-title"><span>California Bay Area</span> <span>Ballot Guide</span></h1>' +
        '<p class="tagline">Your local and statewide ballot, explained with evidence.</p>' +
        '<div class="cta"><a class="btn primary" href="#/find">' + icon("pin") + 'Find My Ballot</a><a class="btn secondary" href="propositions.html">' + icon("scale") + "Ballot Weighing Tool</a></div>" +
        '<p class="lede">Find the measures and candidates that may be on your ballot, see what each choice would do, and check the official sources. Every statewide proposition is rated on seven evidence factors with sources, and you decide how much each factor matters. This guide never tells you how to vote.</p>' +
        '<p class="small hero-note">' + icon("info") + "<span>This guide is for information only. Choosing a county or city here does not confirm your exact districts. Your official sample ballot does.</span></p>" +
        '<p class="quick"><a class="textlink" href="#/browse">Ballot measures by county</a><a class="textlink" href="#/contests">Candidates and contests</a><a class="textlink" href="#/statewide">Outside the Bay Area</a></p>' +
      "</section>" +
      mapFigure() +
      "</div>" +
      // Order for voters: what to do and when first, then the tool, then background figures.
      keyDatesCard() +
      nextSteps() +
      '<section class="card" aria-labelledby="tool-h"><h2 id="tool-h">' + icon("scale") + 'How the Ballot Weighing Tool works</h2>' + toolSteps() +
        '<p><a class="btn secondary" href="propositions.html">Open the Ballot Weighing Tool</a></p></section>' +
      regionCard();
  }

  function viewFind(params) {
    var cs = counties(), notice = "";
    var county = null, pc = own(params, "county"), pcity = own(params, "city"), toSheet = own(params, "next") === "sheet";
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
      '<section class="ov-head"><h1>Find your ballot</h1><p class="muted">' + (toSheet ? "Choose where you vote, and your cheat sheet opens with your Weighing Tool answers ticked. " : "Three quick choices. ") + "Nothing you pick is stored or sent anywhere.</p></section>" +
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
        '<div class="cta"><button class="btn primary" type="submit" id="go" disabled>' + (toSheet ? "Open my cheat sheet" : "Show my ballot choices") + '</button><a class="textlink" href="#/browse">Browse all available ballots</a></div>' +
      "</form>" +
      districtNote(null, "find-lookup");
    var form = document.getElementById("findform"), citySel = document.getElementById("city"), go = document.getElementById("go"), help = document.getElementById("city-help");
    function current() { var c = form.querySelector('input[name="county"]:checked'); return c ? J(c.value) : null; }
    // Keeps the address in step with the form, so Back returns to the same valid choices. Not stored anywhere else.
    function syncUrl() {
      var c = current(); if (!c || !history.replaceState) return;
      var v = citySel.value, cc = consolidated(c);
      history.replaceState(null, "", "#/find?county=" + enc(c.id) + (v && !(cc && v === cc.id) ? "&city=" + enc(v) : "") + (toSheet ? "&next=sheet" : ""));
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
      location.hash = (toSheet ? "#/sheet/" : "#/ballot/") + enc(c.id) + tail;
    });
  }

  /* Statewide propositions open inside the Ballot Weighing Tool (propositions.html#prop-N), the single place where each
     one is explained, rated and weighed. The tool's own data is the source of statewide.json (tools/extract-statewide.mjs).
     Only items whose jurisdiction is the state and whose detailUrl names a tool card are routed there; local measures
     keep their #/item pages. "from" and "place" let the tool offer a link back to the ballot the voter came from. */
  var CTX = { from: "", place: "" };
  function toolAnchor(m) {
    var j = m && J(m.jurisdiction);
    var k = m && m.level === "state" && j && j.type === "state" && /^propositions\.html#prop-(\d+)$/.exec(m.detailUrl || "");
    return k ? "prop-" + k[1] : null;
  }
  function toolHref(m) {
    var a = toolAnchor(m); if (!a) return null;
    var q = CTX.from ? "?from=" + encodeURIComponent(CTX.from) + (CTX.place ? "&place=" + encodeURIComponent(CTX.place) : "") : "";
    return "propositions.html" + q + "#" + a;
  }
  function toolAllHref() {
    return "propositions.html" + (CTX.from ? "?from=" + encodeURIComponent(CTX.from) + (CTX.place ? "&place=" + encodeURIComponent(CTX.place) : "") : "");
  }
  // The button above the statewide list: the whole tool, all propositions, with the same way back.
  function toolAllButton(n) {
    return '<div class="group-cta"><a class="btn secondary" data-tool-all="1" href="' + esc(toolAllHref()) + '">' + icon("scale") + "Go to Ballot Weighing Tool \u2014 All " + n + ' Propositions</a>' +
      '<p class="small">Or choose a proposition below to open it in the tool, with its ratings, your weights and your lean.</p></div>';
  }
  function itemRow(x, ap, isContest) {
    var j = J(x.jurisdiction) || {};
    var th = isContest ? null : toolHref(x);
    var href = isContest ? "#/contest/" + enc(x.id) : (th || "#/item/" + enc(x.id));
    var title = isContest ? x.office + (x.district ? ", " + x.district : "") : x.shortTitle || x.officialTitle;
    var id = isContest ? "Office" : x.identifier;
    var sub = j.name + (ap && ap.fit === "maybe" ? (ap.split ? " · May apply, this county is split between districts. Check your sample ballot" : " · May apply, check your sample ballot") : "") +
      (isContest && x.listStatus === "pending" ? " · Not yet on a final official list" : "") + (isContest && x.noQualifiedCandidates ? " · No qualified candidates listed" : "");
    if (th) return '<a class="row to-tool" href="' + esc(href) + '" data-search="' + esc((id + " " + title + " " + j.name + " " + (x.officialTitle || "")).toLowerCase()) + '"><span class="rt"><span class="rid">' + esc(id) + '</span><span class="rti">' + esc(title) + '</span><span class="rsub">' + esc(sub) + "</span></span>" + listBadge(x.status) + '<span class="go">Open in the Ballot Weighing Tool<span aria-hidden="true"> \u203A</span></span></a>';
    return '<a class="row" href="' + href + '" data-search="' + esc((id + " " + title + " " + j.name + " " + (x.officialTitle || "")).toLowerCase()) + '"><span class="rt"><span class="rid">' + esc(id) + '</span><span class="rti">' + esc(title) + '</span><span class="rsub">' + esc(sub) + "</span></span>" + listBadge(x.status) + "</a>";
  }

  var INV = {
    "not-collected": "not collected yet",
    "partial": "partly collected; some official sources are still missing",
    "collected": "collected from an official county or city list, not yet cross-checked with other official records",
    "reconciled": "cross-checked against official county, city and district records",
    "none-found-confirmed": "none found, confirmed with official records"
  };
  function capFirst(x) { x = String(x); return x.charAt(0).toUpperCase() + x.slice(1); }
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
      "<li><b>City and town list.</b> " + capFirst(cityRow) + ".</li>" +
      rows.map(function (r) { return "<li><b>" + r[0] + ".</b> " + capFirst(esc(own(INV, r[1]) || "not recorded")) + ".</li>"; }).join("") +
      rcText +
      notOnBallot(county) +
      "<li><b>Statewide propositions and statewide contests.</b> " + (d ? "Audited on " + esc(fmtDate(d)) + " by automated research against official sources. " : "") + "A person has not yet reviewed the audit.</li>" +
      '</ul><p class="small">Last checked ' + esc(fmtDate(inv.lastChecked)) + ". A missing item never means it is not on your ballot.</p></div></details>";
  }

  // Seats filled without an election (appointed in lieu, or decided in June) are listed so a voter knows why they are absent.
  function notOnBallot(county) {
    var x = county.notOnBallot || [];
    if (!x.length) return "";
    var srcs = []; x.forEach(function (r) { if (r.source && /^https:/.test(r.source) && srcs.indexOf(r.source) < 0) srcs.push(r.source); });
    return '<li data-not-on-ballot="' + x.length + '"><b>Not on the ballot.</b> ' + x.length + (x.length === 1 ? " seat or contest that" : " seats or contests that") + " had an election scheduled are not on the November ballot, usually because no more candidates filed than there are seats, so the seats are filled by appointment instead." +
      '<details class="nob"><summary>Show the list</summary><ul>' + x.map(function (r) { return "<li>" + esc(r.jurisdiction || "") + (r.office ? ". " + esc(r.office) : "") + (r.reason ? ' <span class="small muted">' + esc(r.reason) + "</span>" : "") + "</li>"; }).join("") + "</ul>" +
      (srcs.length ? '<p class="small">Sources: ' + srcs.slice(0, 6).map(function (u, i) { return '<a href="' + esc(u) + '" rel="noopener">source ' + (i + 1) + "</a>"; }).join(", ") + "</p>" : "") + "</details></li>";
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
        (g.key === "state" && rows.length ? toolAllButton(rows.length) : "") +
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
      sheetCta(countyId, cityId, placeName) +
      coverageBox(county) +
      districtNote(county, null, true) +
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
    bindShare();
  }

  function viewStatewide() {
    var state = DB.measures.filter(function (m) { return m.level === "state"; });
    var others = allCounties().filter(function (c) { return !isBay(c); });
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<section class="ov-head"><p class="eyebrow">' + esc(DB.election.name) + "</p><h1>Statewide California propositions</h1>" +
        '<p class="lede" data-statewide-msg="1">' + esc(STATEWIDE_MSG) + "</p></section>" +
      '<div class="cta"><a class="btn primary" href="propositions.html">Open the Ballot Weighing Tool</a><a class="textlink" href="#/contests">Statewide candidate contests</a></div>' +
      '<p class="small">From the Secretary of State: ' + links(["props", "guide", "formats"]) + ".</p>" +
      sec("How the Ballot Weighing Tool works", toolSteps()) +
      '<details class="group" data-group="state" open><summary><h2>All statewide propositions</h2><span class="counts">' + state.length + (state.length === 1 ? " item" : " items") + "</span></summary>" +
        (state.length ? toolAllButton(state.length) : "") +
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
    var th = toolHref(m);
    if (th) {
      // Old links to #/item/<statewide prop> open the same proposition in the tool. replace() keeps Back working.
      app.innerHTML = '<h1>' + esc(m.identifier) + '</h1><p>Opening ' + esc(m.identifier) + ' in the <a href="' + esc(th) + '">Ballot Weighing Tool</a>…</p>';
      location.replace(th);
      return;
    }
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
        '<p class="official">' + [m.officialTitle ? "Official title. " + esc(m.officialTitle.replace(/\.$/, "")) + "." : "", m.measureType ? "Type. " + esc(typeLabel(m.measureType)) + "." : "Type not collected yet.", m.threshold ? "Passes with " + esc(m.threshold) + "." : (m.level === "state" ? "" : "Vote threshold not collected yet.")].filter(Boolean).join(" ") + "</p>" +
        '<p class="meta">' + badge(m.status) + "<span>Last checked " + esc(fmtDate(m.lastVerified)) + "</span></p>" +
        evidenceLine(m) +
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
        sec("Official sources and further reading", sourceList(m.sources), true, "sources") +
        sec("Research notes", f(m.notes)) +
      "</article>";
  }

  function viewContest(id) {
    var c = rec(id); if (!c || !c.office) return viewNotFound("That contest is not in this guide.");
    var j = J(c.jurisdiction) || {};
    var cands = (c.candidates || []).map(rec).filter(Boolean), withPhoto = cands.filter(hasPhoto);
    app.innerHTML =
      backLink() +
      '<article class="detail"><p class="eyebrow">' + esc(j.name || "") + " · " + esc(DB.election.name) + "</p>" +
        "<h1>" + esc(c.office) + (c.district ? ", " + esc(c.district) : "") + "</h1>" +
        '<p class="meta">' + badge(c.status) + "<span>Last checked " + esc(fmtDate(c.lastVerified)) + "</span></p>" +
        evidenceLine(c) +
        readingNote(c) +
        statusNote(c) +
        (c.listStatus === "pending" ? '<div class="note warn" data-list-status="pending"><b>Not yet confirmed on a final official list</b><p>This contest and its candidates come from a filing list or a secondary source. The final list or your sample ballot may differ.</p></div>' : "") +
        (c.listStatus === "confirmed" ? '<p class="small" data-list-status="confirmed">This contest appears on the county’s official list of contests on the ballot.</p>' : "") +
        (c.seats ? '<p class="note">Vote for up to ' + esc(c.seats) + ".</p>" : "") +
        '<p class="small">Candidates appear in the order of the official source, not in any ranking. This guide does not score, rank or recommend candidates.</p>' +
        (cands.length ? '<div class="cands">' + cands.map(function (p) {
          return '<a class="cand" href="#/candidate/' + enc(p.id) + '">' + candPhoto(p, 48, true) + '<span class="cand-t"><b>' + esc(p.name) + "</b>" + listBadge(p.status) + '<span class="small">' + esc([p.party ? "Party preference " + p.party : null, p.designation ? "Ballot designation " + p.designation : null].filter(Boolean).join(" · ") || "Details not yet collected") + "</span></span></a>";
        }).join("") + "</div>" : c.noQualifiedCandidates ? '<p class="missing" data-no-candidates="1">The official list shows no qualified candidates for this contest. Write-in candidates may still qualify; check your sample ballot.</p>' : '<p class="missing">Candidate names have not been collected for this contest yet. This does not mean the contest has no candidates.</p>') +
        (cands.length ? (withPhoto.length ? photoCredits(withPhoto) : "") + '<p class="small">' + (withPhoto.length < cands.length ? PHOTO_NOTE + " " : "") + ext(OFFICIAL.statements[0], "Official candidate statements") + " may include photos the candidates submitted.</p>" : "") +
        (cands.length ? candidateEval(c, cands) : "") +
        (c.notes ? sec("Research notes", field(c.notes)) : "") +
        sec("Official sources", sourceList(c.sources), true, "sources") +
      "</article>";
  }

  /* ---------- Candidate evaluation mode (Oct 24, 2026) ----------
     The seven factors and the voter's weights from the Ballot Weighing Tool, with rating guidance for the office
     (data/candidate-rubric.json). A candidate rating exists only in candidates.json under evaluation.ratings, each with
     its basis and source; none has been recorded yet. Missing ratings show Insufficient evidence and are never counted.
     A weighted summary is shown only when every factor the voter weights is rated. Candidates keep the official order;
     nothing here ranks or recommends them. */
  var FACTOR_NAMES = { nb: "Net benefit", ev: "Evidence strength", lr: "Safety", ac: "Accountability", if: "Feasibility", fc: "Fiscal clarity", oc: "Outcome clarity" };
  function rubricFor(c) {
    var offs = (DB.rubric && DB.rubric.offices) || [];
    for (var i = 0; i < offs.length; i++) { try { if (new RegExp(offs[i].match).test(c.office || "")) return offs[i]; } catch (e) {} }
    return null;
  }
  function candRatings(p) {
    var ev = p && p.evaluation, out = {};
    if (!ev || !ev.ratings) return out;
    window.BallotWeights.KEYS.forEach(function (k) { var r = ev.ratings[k]; if (r && window.BallotWeights.validRating(r.rating) && r.basis && r.source && /^https:/.test(r.source.url || "")) out[k] = r; });
    return out;
  }
  /* Release gate (Oct 24, 2026). Candidate scores stay hidden from the public until data/candidate-rubric.json sets
     release.public to true AND every candidate in the contest has all seven factors rated, sourced and reviewed by a
     person (evaluation.reviewedBy). Until then a research-pending notice is shown, with no scores, tables or weights.
     To re-enable: complete the research, record reviewedBy, run tools/validate.mjs, then set release.public to true. */
  function evalPublic(cands) {
    var rel = (DB.rubric && DB.rubric.release) || {};
    if (rel.public !== true || !cands.length) return false;
    return cands.every(function (p) { return p.evaluation && p.evaluation.reviewedBy && Object.keys(candRatings(p)).length === 7; });
  }
  function evalPending() {
    var rel = (DB.rubric && DB.rubric.release) || {};
    var src = (rel.futureSources || ["Official public records", "Published policy proposals", "Statements attributable to the candidate", "Reliable independent reporting"]).map(function (x) { return x.toLowerCase(); });
    return '<section class="ce-pending" data-candidate-eval="pending" aria-labelledby="ce-pend-h">' +
      '<div class="ce-pend-head"><h2 id="ce-pend-h">Candidate evaluation</h2><span class="pill-status">Research pending</span></div>' +
      "<p>Candidate-specific evidence profiles are not complete yet, and none has been reviewed by a person. <b>No candidate has been given a score or rating in this release.</b></p>" +
      "<p>Missing information is not a low score. It says nothing about a candidate’s qualifications, positions or record.</p>" +
      '<p class="small">A future evaluation would use the same seven factors as the <a href="propositions.html">Ballot Weighing Tool</a>, apply one rubric to every candidate in a contest, and rest on ' + esc(andList(src)) + ', each rating with its source and reason. Until then, read each candidate’s official statement and your county’s voter guide. <a href="#/about">How this guide works</a>.</p>' +
      "</section>";
  }
  function candidateEval(c, cands) {
    var BW = window.BallotWeights, R = rubricFor(c);
    if (!BW || !R) return "";
    if (!evalPublic(cands)) return evalPending();
    var sw = BW.savedWeights(), w = sw.w, sh = BW.shares(w);
    var basisLabel = {}; (DB.rubric.bases || []).forEach(function (b) { basisLabel[b.id] = b.label; });
    var weights = '<ul class="ce-w">' + BW.KEYS.map(function (k) {
      return "<li><span>" + esc(FACTOR_NAMES[k]) + '</span><span class="ce-pct">' + (sh.total === 0 ? "No weight" : w[k] === 0 ? "Ignored" : BW.fmt(sh.pct[k], 1) + "%") + '</span><span class="small">' + esc(R.guide[k] || "") + "</span></li>";
    }).join("") + "</ul>";
    var rated = 0;
    var cards = cands.map(function (p) {
      var rs = candRatings(p), n = Object.keys(rs).length; rated += n;
      var needed = BW.KEYS.filter(function (k) { return w[k] > 0; }), complete = needed.length > 0 && needed.every(function (k) { return rs[k]; });
      var nums = {}; Object.keys(rs).forEach(function (k) { nums[k] = rs[k].rating; });
      var wr = complete ? BW.weighted(nums, w) : null;
      var rows = BW.KEYS.map(function (k) {
        var r = rs[k];
        return "<tr><th scope=\"row\">" + esc(FACTOR_NAMES[k]) + "</th><td>" + (r ? r.rating + "/5" : '<span class="muted">Insufficient evidence</span>') + "</td><td>" +
          (r ? esc(basisLabel[r.basis] || r.basis) + ". " + esc(r.note || "") + " " + ext(r.source.url, esc(r.source.title || "Source")) : "") + "</td></tr>";
      }).join("");
      return '<div class="ce-cand" data-ce-cand="' + esc(p.id) + '"><h3>' + esc(p.name) + "</h3>" +
        '<p class="ce-sum">' + (wr && !wr.off ? "<b>Weighted rating: " + wr.percent + "% (" + wr.average.toFixed(1) + "/5)</b> under your weights." : "<b>Weighted rating not calculated.</b> " + n + " of 7 factors have a documented rating" + (n === 0 ? " yet" : "") + ".") + "</p>" +
        (n ? '<div class="tablewrap"><table class="ce-t"><thead><tr><th scope="col">Factor</th><th scope="col">Rating</th><th scope="col">Evidence</th></tr></thead><tbody>' + rows + "</tbody></table></div>" :
          '<p class="small muted">All seven factors: Insufficient evidence.</p>') + "</div>";
    }).join("");
    return '<details class="sec ce" data-candidate-eval="1"><summary>Evaluate candidates with your priorities (beta)</summary><div class="body">' +
      '<div class="note" role="note"><b>No candidate has been rated yet.</b><p>This mode applies the seven factors of the ' + '<a href="propositions.html">Ballot Weighing Tool</a>' + " to candidates, with guidance written for the office of " + esc(c.office) + " (" + esc(R.label) + "). A rating is added only with attributable evidence, so every factor shows Insufficient evidence for now. It does not rank candidates, predict results or recommend a vote.</p></div>" +
      "<h2 class=\"ce-h\">What matters most to you</h2><p class=\"small\">" + (sw.saved ? "Your weights from the Ballot Weighing Tool, saved in this browser." : "The standard weights. Change them in the Ballot Weighing Tool and they are used here too.") + " The same percentages apply to every candidate in this contest.</p>" + weights +
      "<h2 class=\"ce-h\">How candidates are rated</h2><p class=\"small\">" + esc(DB.rubric.scale) + " Each rating names its basis.</p><ul class=\"srclist small\">" + (DB.rubric.bases || []).map(function (b) { return "<li><b>" + esc(b.label) + ".</b> " + esc(b.d) + "</li>"; }).join("") + "</ul>" +
      '<p class="small">' + esc(DB.rubric.missingPolicy) + "</p>" +
      "<h2 class=\"ce-h\">Candidates, in the official order</h2>" + cards + "</div></details>";
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
        '<div class="cand-head">' + candPhoto(p, 96, true) + "<h1>" + esc(p.name) + "</h1></div>" +
        (hasPhoto(p) ? '<p class="small">Photo: ' + esc(p.photo.credit) + " " + ext(p.photo.sourcePage, "Source") + (p.photo.licenseUrl ? " · " + ext(p.photo.licenseUrl, "License") : "") + ". " + esc(p.photo.modified || "") + "</p>" :
          '<p class="small">' + PHOTO_NOTE + " " + (p.statementUrl && /^https:/.test(p.statementUrl) ? ext(p.statementUrl, "See the official candidate statement page") + ", which shows a photo when the candidate submitted one." : "Your official voter guide shows candidate statements, and photos where candidates submitted them.") + "</p>") +
        '<p class="meta">' + badge(p.status) + "<span>Last checked " + esc(fmtDate(p.lastVerified)) + "</span></p>" +
        evidenceLine(p) +
        readingNote(c) +
        statusNote(p) +
        sec("From the official candidate list", (p.incumbent ? "<p>Marked as the incumbent in the official source.</p>" : "") + "<p>" + esc([p.party ? "Party preference. " + p.party + "." : "Party preference not listed or not collected.", p.designation ? "Ballot designation. " + p.designation + "." : "Ballot designation not collected."].join(" ")) + '</p><p class="small">Facts as printed in the official source listed at the bottom of this page.</p>' + (p.notes ? '<p class="small">' + esc(p.notes) + "</p>" : ""), true) +
        sec("In the candidate's own words", (p.statementNote && !p.statementUrl ? '<div class="claim"><p class="who">Candidate statement</p><p>' + esc(p.statementNote) + "</p></div>" : block("Read the official candidate statement", p.statementUrl, "Candidate statement, the candidate's own claims")) + '<p class="small">Statements are written by candidates and are not fact-checked by elections officials. Not every candidate submits one.</p>') +
        sec("Qualifications and experience", field(p.qualifications)) +
        sec("Stated policy positions", field(p.positions)) +
        sec("Documented public record", field(p.publicRecord)) +
        sec("Campaign finance", block("Search official campaign finance filings", p.financeUrl, "Official disclosure records") + '<p class="small">Totals change through Election Day. Check the filing dates on the official site.</p>') +
        sec("Sources", sourceList(p.sources), true, "sources") +
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
        (places.length >= counties().length ? "Local contests are listed for all " + counties().length + " Bay Area counties, from each county’s official candidate list. " : places.length ? "Local contests are collected so far only for these places: " + places.join("; ") + ". " : "No local contests have been collected yet. ") +
        "This is not a full list of every race on your ballot. Use Find My Ballot to see what may apply where you live.</p>" +
        '<p class="small">From the Secretary of State: ' + links(["statements", "certlist"]) + ".</p></section>" +
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
  // The skip link moves focus to the page heading. It never changes the address, which the router owns (UX-01).
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a.skip") : null;
    if (!a) return;
    e.preventDefault();
    var h = app.querySelector("h1") || app; h.setAttribute("tabindex", "-1"); h.focus();
  });
  // "Show sources" opens the sources section and moves focus there, without touching the page address (the router owns the #).
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button[data-jump]") : null;
    if (!b) return;
    var t = document.getElementById(b.getAttribute("data-jump")); if (!t) return;
    t.open = true; var sm = t.querySelector("summary");
    t.scrollIntoView({ block: "start" }); if (sm) sm.focus({ preventScroll: true });
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-back]") : null;
    if (a && navCount > 1) { e.preventDefault(); history.back(); }
  });

  // How the Ballot Weighing Tool works, in three steps. Matches propositions.html; the tool itself is unchanged.
  function toolSteps() {
    var steps = [
      ["sliders", "Set your priorities", "The tool starts with standard weights for seven evidence factors, such as net benefit, evidence strength and fiscal clarity. You can keep them or set how much each one matters to you."],
      ["doc", "Review each proposition", "Read the plain-English facts, the ratings with their reasons, and the official sources, then answer how you would vote: Yes, Not sure or No."],
      ["scale", "See how your priorities shape the result", "Your answer is shown exactly as you chose it. Beside it, the tool shows the evidence score under your weights, with a marker at the 3.0 midpoint, and links to the argument on the other side."]
    ];
    return '<ol class="steps3" data-tool-steps="1">' + steps.map(function (s) {
      return "<li>" + icon(s[0], "big") + "<div><b>" + esc(s[1]) + ".</b> " + esc(s[2]) + "</div></li>";
    }).join("") + "</ol>" +
      '<p class="small">A lean is the result of this tool’s method and the weights you chose. It is not an official recommendation, a prediction, or an instruction on how to vote.</p>';
  }

  function viewAbout() {
    var n = coverCounts(), R = DB.region || {};
    var nc = counties().length;
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<article class="detail" data-about="1"><p class="eyebrow">Beta release</p><h1>About this guide</h1>' +
      '<p class="lede">Scope, coverage and limitations of this beta.</p>' +
      '<ul class="about-glance" data-about-glance="1">' +
        '<li><b>Covers</b><span>' + n.state + " statewide propositions, statewide and Bay Area district contests, and local measures and contests in the " + nc + " Bay Area counties.</span></li>" +
        "<li><b>Checked by software</b><span>Data consistency, sources, links and the scoring arithmetic, on every release.</span></li>" +
        "<li><b>Reviewed by a person</b><span>" + (n.verified ? num(n.verified) + " records so far." : "Not yet. Nothing is marked Verified.") + "</span></li>" +
        "<li><b>Candidate scores</b><span>None assigned. Candidate research is pending.</span></li></ul>" +
      '<div class="note warn"><b>Beta release. Coverage and evidence are still being verified.</b>' +
        "<p>This independent guide helps voters explore California ballot measures and candidates, review supporting evidence, and weigh issues according to their own priorities. Its summaries, evidence, ratings and local ballot listings have not yet been independently verified by a person. Local coverage may be incomplete, and district-specific contests may not apply to every voter.</p>" +
        "<p>Please confirm your ballot and important details with your county elections office’s official voter information.</p></div>" +
      sec("Disclaimer and who made this", '<div data-disclaimer="1">' +
        "<p>This is an independent civic technology project, built by Supriya Rajeev for educational and informational purposes. It gathers public election information in one place so voters can find it more easily.</p>" +
        "<p>It is not an official election resource. It is not affiliated with, endorsed by or sponsored by the California Secretary of State, any county elections office, or any candidate, campaign, party or committee, and it does not endorse any candidate or position.</p>" +
        "<p>The information is provided as is, without warranty of any kind. It may contain errors or be out of date. Do not rely on it as your only source, and always confirm with your county elections office and the official voter guide.</p>" +
        "<p>Candidate photos come from Wikimedia Commons, where each is tagged as public domain or under a Creative Commons license. Some public-domain tags rest on Wikimedia Commons’ reading of California public records law, which is not a court ruling on each photo. Every photo is credited on its contest and candidate pages with a link to its source and license. Photos are shown only to help voters recognize candidates and do not imply endorsement by the candidate or the photographer. A grey placeholder means no reusable photo was found. Candidates or rights holders who want a photo corrected or removed can contact the developer through the " + ext("https://github.com/supriyarajeev/ballot-tool", "project’s GitHub repository") + ". Requests will be reviewed, and photos removed where appropriate.</p></div>", true) +
      sec("What this guide does", "<p>It lists statewide propositions, Bay Area local measures and candidate contests for the " + esc(DB.election.name) + ", explains each in plain English with its official sources, and shows what has not been collected yet. It never tells you how to vote, and it never scores, ranks or recommends candidates.</p>", true) +
      sec("What it covers", "<p>All of California for the " + n.state + " statewide propositions and the statewide contests, such as Governor. Congressional, State Senate and State Assembly contests only for the districts that include Bay Area counties. Local measures and contests only for the " + nc + " Bay Area counties" + (R.municipalityCount ? " and their " + num(R.municipalityCount) + " cities and towns" : "") + ", plus a few districts that cross into neighboring counties. Other counties show statewide items only.</p>" + coveredSummary(), true) +
      sec("How information is checked", "<p>Four different things happen. Only review by a person confirms a fact, and it has not happened yet.</p><ul class=\"srclist\">" +
        "<li><b>Software tests.</b> Automated checks test that the site works and that the data is consistent. For example, every published ballot question must match its quoted official source, links must use https (two county links that offer only http are labeled), and counts must add up. They cannot tell whether a source was read correctly.</li>" +
        "<li><b>Automated and AI-assisted reading.</b> Most facts were collected by automated research and an AI assistant reading official documents. Scanned forms were read by OCR. Where that matters most, the item says so next to the facts.</li>" +
        "<li><b>Review by a person.</b> " + (n.verified ? num(n.verified) + " records have been checked by a person against the official source." : "No record has yet been checked by a person against the official source.") + " That is why items carry a review status on their own pages, and why nothing is marked Verified.</li>" +
        "<li><b>Completeness.</b> No county’s local list has been reconciled against every city and district, so local coverage is incomplete.</li></ul>", true) +
      sec("Districts and eligibility", "<p>District lines for schools, special districts, supervisors, Congress and the Legislature are not mapped to addresses here. Those contests are marked “may apply.” Choosing a county or city in this guide does not confirm which districts you live in or what is on your ballot.</p>") +
      sec("How the Ballot Weighing Tool works", toolSteps() +
        "<p>The ratings are structured judgments made for this tool with AI research assistance, using one published rubric for every proposition. They are not official ratings. On October 24, 2026 the owner approved resolving four ratings that had been flagged because their written reasons might not match the rubric. After reading the legal text and the LAO analysis, Proposition 44’s accountability went from 5 to 4, because audits are allowed but not required. The evidence strength of Propositions 37 and 38 and Proposition 37’s accountability stayed at 3, with clearer reasons. No person outside the project has reviewed the ratings.</p>" +
        "<p>The tool shows each factor's share of your weighting as a percentage, and each proposition's weighted evidence rating as a percentage of the top rating, with the points each factor adds. These are a clearer view of the same weighted average; no score or lean changed.</p>" +
        "<p>Your preference and the evidence rating are separate. Your answer says how you would vote, Yes, Not sure or No; the rating says how well the measure is built on the factors you weigh. The tool shows how the two line up and never decides for you.</p>" +
        '<p><a href="propositions.html">Open the Ballot Weighing Tool</a></p>') +
      sec("Evidence ratings and your preferences", "<p><b>Evidence ratings</b> are this guide’s structured judgments of how well a proposition is built, on seven factors from 1 (weak) to 5 (strong), each with a written reason and sources. They are the same for every visitor.</p>" +
        "<p><b>Your weights</b> say how much each factor matters to you. The weighted rating is the weighted average of the ratings under your weights, shown out of 5 and as a percentage of the top rating.</p>" +
        "<p><b>Your answer</b> is how you would vote on a measure: Yes, Not sure or No. It is kept separate from the evidence rating. A score is never a chance of passing, a share of voters, a guarantee of benefit or a recommendation.</p>") +
      sec("What “Insufficient evidence” means", "<p>A factor shows Insufficient evidence when no documented, sourced rating exists for it. It is left out of the calculation; it is never counted as 0, 1 or 5, and it is not a judgment against the measure or candidate. If no weighted factor is rated, no score is shown.</p>") +
      sec("Candidate evaluation", "<p><b>Research pending.</b> Candidate-specific evidence profiles are not complete and have not been reviewed by a person, so no candidate has a score or rating in this release, and contest pages show a status notice instead.</p>" +
        "<p>A future evaluation would apply the same seven factors and one rubric to every candidate in a contest. Each rating would name its source (official records, published proposals, attributable statements or reliable independent reporting), its date and its reason, and would keep a candidate’s own claims apart from independently established facts. Missing information would show as Insufficient evidence, never as a low score, and no overall score would be shown until every factor is documented and a person has reviewed it.</p>" +
        "<p>Candidates always appear in the official ballot order. This guide never ranks candidates, predicts results or recommends a vote.</p>") +
      sec("How sources are chosen", "<p>Official sources come first: the Secretary of State, the Legislative Analyst’s Office, county elections offices and official measure documents. News reports are used only where official sources are silent, and are labeled as reported. Each item lists its sources and the date it was last checked.</p>") +
      sec("What the labels mean", '<ul class="srclist">' +
        "<li><b>Incomplete (required info or evidence is missing).</b> Something a voter needs, such as the ballot question or the official text, has not been collected. The item lists what is missing.</li>" +
        "<li><b>Needs review.</b> The facts have sources, but a person has not yet checked them. During the beta every item is at this stage or Incomplete, so lists leave this label out. Each item’s own page shows it, with what still needs checking.</li>" +
        "<li><b>May apply.</b> The contest or measure covers only part of your county or city. Check your sample ballot.</li>" +
        "<li><b>Verified.</b> A person has checked the item against the official source. No item has this label yet.</li></ul>") +
      sec("Confirm your ballot", "<p>Your county elections office has your official sample ballot. <a href=\"#/find\">Find My Ballot</a> links to your county’s lookup.</p><ul class=\"srclist\">" +
        ["offices", "sameday", "status", "early", "polling", "track", "guide", "props", "statements", "certlist", "formats", "hotlines", "access"].map(function (k) { return "<li>" + ext(OFFICIAL[k][0], OFFICIAL[k][1]) + "</li>"; }).join("") + "</ul>", true) +
      '<p class="small">Coverage and checking are ongoing. Figures on this page are counted from the guide’s data each time it loads.</p>' +
      "</article>";
  }

  // ---- Ballot cheat sheet and sharing ----
  // The voter marks their own choices. Marks are kept only in this browser (localStorage) and are never sent anywhere.
  // Sharing sends the page link only, never the marks.
  var SHEET_KEY = "ballot-sheet-v1", LEANS_KEY = "ballot-answers-v1";
  function readJSON(k) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function siteBase() { return location.href.split("#")[0].split("?")[0]; }
  function placeLabel(county, place) {
    var cc = consolidated(county), city = place.city, mode = place.mode;
    return mode === "city" ? (cc && city.id === cc.id ? city.name : city.name + ", " + county.name) : mode === "unincorporated" ? "unincorporated " + county.name : county.name;
  }
  function ballotPath(countyId, cityId) { return enc(countyId) + (cityId ? "/" + enc(cityId) : ""); }
  function shareBox(url, text) {
    return '<div class="share no-print" data-share="1" data-url="' + esc(url) + '" data-text="' + esc(text) + '">' +
      '<button type="button" class="btn secondary" data-act="share">' + icon("share") + "Share</button>" +
      '<a class="btn secondary" data-act="wa" href="https://wa.me/?text=' + esc(encodeURIComponent(text + " " + url)) + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
      '<button type="button" class="btn secondary" data-act="copy">Copy link</button>' +
      '<p class="small share-msg" role="status" aria-live="polite">Sharing sends the link only. Your marks stay on this device.</p></div>';
  }
  function bindShare() {
    Array.prototype.forEach.call(app.querySelectorAll("[data-share]"), function (box) {
      var url = box.getAttribute("data-url"), text = box.getAttribute("data-text"), msg = box.querySelector(".share-msg");
      var sb = box.querySelector('[data-act="share"]');
      if (!navigator.share) sb.hidden = true;
      sb.addEventListener("click", function () { navigator.share({ title: text, text: text, url: url }).catch(function () {}); });
      box.querySelector('[data-act="copy"]').addEventListener("click", function () {
        var done = function () { msg.textContent = "Link copied. Sharing sends the link only. Your marks stay on this device."; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { msg.textContent = url; });
        else msg.textContent = url;
      });
    });
  }
  function sheetCta(countyId, cityId, name) {
    var url = siteBase() + "#/ballot/" + ballotPath(countyId, cityId);
    return '<section class="card sheet-cta" data-sheet-cta="1"><h2>' + icon("print") + "Take it with you</h2>" +
      '<p class="small">Mark your own choices on a one-page cheat sheet, then print it or keep it on your phone. Bring it when you fill in your ballot.</p>' +
      '<div class="cta"><a class="btn primary" href="#/sheet/' + ballotPath(countyId, cityId) + '">Open my ballot cheat sheet</a><a class="textlink" href="#/how-to-vote">How and when to vote</a></div>' +
      shareBox(url, "Ballot choices for " + name + ", " + DB.election.name) + "</section>";
  }

  function viewSheet(countyId, cityId, extra) {
    var county = J(countyId);
    if (!county || county.type !== "county") return viewNotFound("That county is not in this guide.");
    if (extra) return viewPlaceNotFound(county, extra);
    var place = resolvePlace(county, cityId);
    if (!place) return viewPlaceNotFound(county, cityId);
    var applyCity = place.city ? place.city.id : null, name = placeLabel(county, place);
    var marks = readJSON(SHEET_KEY), leans = readJSON(LEANS_KEY);
    var buckets = {}; GROUPS.forEach(function (g) { buckets[g.key] = []; });
    DB.measures.forEach(function (m) { var a = applies(m.jurisdiction, countyId, applyCity); if (a) buckets[groupOf(m.jurisdiction, false)].push({ x: m, a: a }); });
    var sure = [], maybe = [];
    DB.contests.forEach(function (c) { var a = applies(c.jurisdiction, countyId, applyCity); if (a && (c.candidates || []).length) (a.fit === "yes" ? sure : maybe).push({ x: c, a: a }); });
    var tag = '<span class="dep">Depends on your address</span>';
    // Statewide rows carry the Weighing Tool answers saved on this device: Yes and No are ticked, Not sure and
    // unanswered stay blank. A mark made on the sheet (including unticking) is kept as the voter's own and wins.
    // A sheet mark that matches the tool answer is not stored, so later changes in the tool still carry over.
    var TA = { yes: 0, no: 0, unsure: 0, none: 0 }, overridden = 0;
    function toolOf(m) {
      var anchor = toolAnchor(m); if (!anchor) return null;
      var l = own(leans, anchor.slice(5)), a = l && (l.a === "yes" || l.a === "no" || l.a === "unsure") ? l.a : "none";
      return { a: a, tick: a === "yes" || a === "no" ? a : "", label: l && l.label, ev: l && l.ev, href: toolHref(m) };
    }
    function measureRow(it) {
      var m = it.x, id = m.id, t = toolOf(m), mine = hasOwn.call(marks, id), v = mine ? marks[id] : t ? t.tick : "", ln = "";
      if (t) {
        TA[t.a]++; if (mine && marks[id] !== t.tick) overridden++;
        var ev = t.ev ? '<span class="ev"> · evidence ' + esc(t.ev) + "</span>" : "";
        var open = ' <a class="no-print" href="' + esc(t.href) + '">' + (t.a === "none" ? "Answer in the tool" : "Open in the tool") + "</a>";
        if (mine && marks[id] !== t.tick) ln = '<p class="lean small own">Changed on this sheet. Your Weighing Tool answer is <b>' + esc(t.a === "none" ? "Not answered" : t.label) + '</b>. <button type="button" class="use-tool no-print" data-id="' + esc(id) + '">Use it</button></p>';
        else if (t.tick) ln = '<p class="lean small from"><span class="ok" aria-hidden="true"></span>From your Weighing Tool answer, <b>' + esc(t.label) + "</b>" + ev + open + "</p>";
        else ln = '<p class="lean small blank">' + (t.a === "unsure" ? "Not sure in the Weighing Tool, so left blank" : "Not answered in the Weighing Tool, so left blank") + ev + open + "</p>";
      }
      return '<li class="srow' + (t && !mine && t.tick ? " from-tool" : "") + '" data-id="' + esc(id) + '"' + (t ? ' data-tool="' + t.tick + '"' : "") + '><div class="stx"><span class="rid">' + esc(m.identifier) + "</span> " + esc(m.shortTitle || m.officialTitle) +
        (it.a.fit === "maybe" ? " " + tag : "") + ln + "</div>" +
        '<div class="yn" role="group" aria-label="' + esc(m.identifier + " " + (m.shortTitle || "")) + '">' +
        ["yes", "no"].map(function (o) { return '<label class="box"><input type="checkbox" value="' + o + '"' + (v === o ? " checked" : "") + "><span>" + o.toUpperCase() + "</span></label>"; }).join("") +
        "</div></li>";
    }
    function contestRow(it) {
      var c = it.x, v = own(marks, c.id); v = Array.isArray(v) ? v : [];
      var cands = (c.candidates || []).map(rec).filter(Boolean);
      return '<li class="srow contest" data-id="' + esc(c.id) + '"><div class="stx"><b>' + esc(c.office) + (c.district ? ", " + esc(c.district) : "") + "</b>" +
        '<span class="small muted"> · ' + esc((J(c.jurisdiction) || {}).name || "") + (c.seats ? " · Vote for up to " + esc(c.seats) : "") + "</span>" +
        (c.listStatus === "pending" ? ' <span class="dep">Not yet on a final list</span>' : "") + "</div>" +
        '<ul class="cands" data-seats="' + esc(c.seats || "") + '">' + cands.map(function (k) {
          return '<li><label class="box"><input type="checkbox" value="' + esc(k.id) + '"' + (v.indexOf(k.id) >= 0 ? " checked" : "") + "><span>" + esc(k.name) + "</span></label>" +
            (k.designation || k.party ? '<span class="small muted">' + esc([k.party, k.designation].filter(Boolean).join(" · ")) + "</span>" : "") + "</li>";
        }).join("") + '</ul><p class="small seat-msg" role="status" aria-live="polite"></p></li>';
    }
    var sections = GROUPS.filter(function (g) { return g.key !== "candidates" && buckets[g.key].length; }).map(function (g) {
      var rows = buckets[g.key].map(measureRow).join("");
      return '<section class="sheet-sec"><h2>' + esc(g.title) + ' <span class="counts">' + buckets[g.key].length + "</span></h2>" + (g.key === "state" ? toolSummary() : "") + '<ul class="slist">' + rows + "</ul></section>";
    }).join("");
    function toolSummary() {
      // Counted after the statewide rows are built, so it is filled in below.
      return '<div class="from-sum no-print" id="from-sum" tabindex="-1"></div>';
    }
    var csec = (sure.length ? '<section class="sheet-sec"><h2>Candidate contests <span class="counts">' + sure.length + '</span></h2><ul class="slist">' + sure.map(contestRow).join("") + "</ul></section>" : "") +
      (maybe.length ? '<details class="sheet-sec maybe" data-maybe="1"><summary><h2>Contests that depend on your address <span class="counts">' + maybe.length + '</span></h2></summary>' +
        '<p class="small">Only some of these are on your ballot. Your official sample ballot shows which. Leave the others blank.</p><ul class="slist">' + maybe.map(contestRow).join("") + "</ul></details>" : "");
    var url = siteBase() + "#/sheet/" + ballotPath(countyId, cityId);
    var nTool = TA.yes + TA.no + TA.unsure;
    var sumHtml = nTool ? '<p><b>Carried over from the Ballot Weighing Tool.</b> ' + TA.yes + " Yes and " + TA.no + " No ticked for you" +
        (TA.unsure ? ". " + TA.unsure + " Not sure left blank" : "") + (TA.none ? ". " + TA.none + " not answered, left blank" : "") + ". Tick or untick any box to change it here." +
        (overridden ? ' <button type="button" class="use-tool" data-id="*">Use all my Weighing Tool answers</button>' : "") + "</p>"
      : '<p><b>Not answered in the Ballot Weighing Tool yet.</b> Answer there and your Yes and No choices are ticked here for you, or tick them yourself below. <a href="' + esc(toolAllHref()) + '">Open the Ballot Weighing Tool</a></p>';
    app.innerHTML =
      '<a class="back no-print" href="#/ballot/' + ballotPath(countyId, cityId) + '">Back to ballot choices</a>' +
      '<section class="ov-head sheet-head"><p class="eyebrow">' + esc(DB.election.name) + "</p><h1>My ballot cheat sheet</h1>" +
      '<p class="place">' + esc(name) + "</p>" +
      '<p class="muted">Your Ballot Weighing Tool answers are ticked for you. Tick your local choices, then print this page or keep it on your phone. Your marks are saved only in this browser and are never sent anywhere. This is not an official ballot. Check your county’s sample ballot for the exact list.</p></section>' +
      '<div class="cta no-print sheet-tools"><button type="button" class="btn primary" id="sheet-print">' + icon("print") + 'Print or save as PDF</button><button type="button" class="btn secondary" id="sheet-clear">Clear my marks</button></div>' +
      shareBox(url, "Ballot cheat sheet for " + name + ", " + DB.election.name) +
      sections + csec +
      '<section class="sheet-sec sheet-foot"><h2>Before you vote</h2><p class="small">Election Day is ' + esc(fmtDate(DB.election.date)) + ". " + samplePlace(county) +
      ' <a class="no-print" href="#/how-to-vote">Key dates, drop boxes and ballot tracking</a>.</p><p class="small print-only">Printed from ' + esc(url) + "</p></section>";
    var fs = document.getElementById("from-sum"); if (fs) fs.innerHTML = sumHtml;
    // Marks
    function store() { writeJSON(SHEET_KEY, marks); }
    // Redraws the sheet so each statewide line says where its tick came from, keeping the scroll position and the focus.
    function redraw(focusSel) {
      var y = window.scrollY; viewSheet(countyId, cityId); bindSheetScroll(y);
      var f = focusSel && app.querySelector(focusSel); if (f) f.focus({ preventScroll: true });
    }
    Array.prototype.forEach.call(app.querySelectorAll(".srow:not(.contest)"), function (row) {
      var id = row.getAttribute("data-id"), boxes = row.querySelectorAll("input"), tool = row.getAttribute("data-tool");
      Array.prototype.forEach.call(boxes, function (b) {
        b.addEventListener("change", function () {
          if (b.checked) Array.prototype.forEach.call(boxes, function (o) { if (o !== b) o.checked = false; });
          var val = b.checked ? b.value : "";
          if (tool !== null && val === tool) delete marks[id];      // same as the tool answer: keep following the tool
          else if (tool !== null) marks[id] = val;                   // differs from the tool, including a blank: the voter's own
          else if (val) marks[id] = val; else delete marks[id];
          store();
          if (tool !== null) redraw('.srow[data-id="' + id + '"] input[value="' + b.value + '"]');
        });
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll(".use-tool"), function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        Array.prototype.forEach.call(app.querySelectorAll(".srow[data-tool]"), function (r) { var k = r.getAttribute("data-id"); if (id === "*" || id === k) delete marks[k]; });
        store(); redraw(id === "*" ? "#from-sum" : '.srow[data-id="' + id + '"] input');
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll(".srow.contest"), function (row) {
      var id = row.getAttribute("data-id"), ul = row.querySelector(".cands"), seats = parseInt(ul.getAttribute("data-seats"), 10) || 0, msg = row.querySelector(".seat-msg");
      ul.addEventListener("change", function (e) {
        var on = Array.prototype.filter.call(ul.querySelectorAll("input"), function (i) { return i.checked; });
        if (seats && on.length > seats) { e.target.checked = false; msg.textContent = "Vote for up to " + seats + ". Untick one first."; return; }
        msg.textContent = "";
        var ids = Array.prototype.filter.call(ul.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; });
        if (ids.length) marks[id] = ids; else delete marks[id];
        store();
      });
    });
    document.getElementById("sheet-print").addEventListener("click", function () {
      var d = app.querySelector("details.maybe"); if (d) d.open = true;
      window.print();
    });
    // Clear makes every box blank, including the ones ticked from the Weighing Tool. "Use all my Weighing Tool answers" brings those back.
    document.getElementById("sheet-clear").addEventListener("click", function () {
      Array.prototype.forEach.call(app.querySelectorAll(".srow"), function (r) {
        var k = r.getAttribute("data-id"), t = r.getAttribute("data-tool");
        if (t) marks[k] = ""; else delete marks[k];
      });
      store(); redraw();
    });
    bindShare();
  }

  function bindSheetScroll(y) { window.scrollTo(0, y); }

  // Official California tools, named in the Secretary of State's 2026 news release (read October 25, 2026):
  // https://www.sos.ca.gov/administration/news-releases-and-advisories/2026-news-releases-and-advisories/california-secretary-state-shirley-n-weber-phd-announces-more-54-million-california-voters-signed-track-their-ballot
  var VOTER_TOOLS = [
    { label: "Check your registration", url: "https://voterstatus.sos.ca.gov/", text: "See whether you are registered and where." },
    { label: "Track your ballot", url: "https://wheresmyballot.sos.ca.gov/", text: "Where's My Ballot? sends updates when your ballot is mailed, received and counted." },
    { label: "Find a drop box", url: "https://caearlyvoting.sos.ca.gov/", text: "Secure ballot drop-off locations near you." },
    { label: "Official voter guide", url: "https://voterguide.sos.ca.gov/", text: "Every statewide proposition and statewide candidate, with official arguments." }
  ];
  function viewHowToVote() {
    var cs = counties().filter(isBay);
    app.innerHTML =
      '<a class="back" href="#/">Home</a>' +
      '<section class="ov-head"><p class="eyebrow">' + esc(DB.election.name) + "</p><h1>How and when to vote</h1>" +
      '<p class="muted">Dates and tools from the California Secretary of State, and your county elections office for vote centers, polling places and your sample ballot. Rules can change, so the official pages have the final word.</p></section>' +
      keyDatesCard() +
      '<section class="card" data-voter-tools="1"><h2>' + icon("check") + "Official tools</h2><ul class=\"tools\">" +
        VOTER_TOOLS.map(function (t) { return "<li>" + ext(t.url, "<b>" + esc(t.label) + "</b>") + '<span class="small">' + esc(t.text) + "</span></li>"; }).join("") +
        '</ul><p class="small">From the California Secretary of State. Tool addresses as listed in its ' + ext("https://www.sos.ca.gov/administration/news-releases-and-advisories/2026-news-releases-and-advisories/california-secretary-state-shirley-n-weber-phd-announces-more-54-million-california-voters-signed-track-their-ballot", "2026 news release") + ", read October 25, 2026.</p></section>" +
      '<section class="card" data-county-offices="1"><h2>' + icon("pin") + "Your county elections office</h2>" +
        '<p class="small">Vote center and polling place locations, hours and your sample ballot come from your county.</p><ul class="tools">' +
        cs.map(function (c) {
          return "<li><b>" + esc(c.name) + "</b><span class=\"small\">" + [c.electionsUrl ? ext(c.electionsUrl, "Elections office") : "", c.lookupUrl ? ext(c.lookupUrl, esc(capFirst(c.lookupLabel || "voter lookup"))) : ""].filter(Boolean).join(" · ") + "</span></li>";
        }).join("") +
        '</ul><p class="small">Elsewhere in California, see the ' + ext("https://www.sos.ca.gov/elections/voting-resources/county-elections-offices", "list of county elections offices") + ".</p></section>" +
      '<div class="cta"><a class="btn primary" href="#/find">' + icon("pin") + "Find My Ballot</a><a class=\"btn secondary\" href=\"propositions.html\">" + icon("scale") + "Ballot Weighing Tool</a></div>";
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
    CTX = { from: "", place: "" };
    if (!bad && (v === "ballot" || v === "sheet" || v === "browse" || v === "statewide" || v === "contests")) {
      CTX.from = "#/" + parts.map(enc).join("/");
      var cj = v === "ballot" || v === "sheet" ? J(parts[1]) : null, cy = cj && parts[2] && parts[2] !== "unincorporated" ? J(parts[2]) : null;
      CTX.place = v === "ballot" || v === "sheet" ? (cy ? cy.name + ", " : "") + (cj ? cj.name : "") : v === "browse" ? "Browse" : v === "statewide" ? "Statewide propositions" : "Candidates and contests";
    }
    if (bad) viewNotFound("That page address is not valid.");
    else if (v === "") viewHome();
    else if (v === "find" && parts.length === 1) viewFind(qs);
    else if (v === "statewide" && parts.length === 1) viewStatewide();
    else if (v === "about" && parts.length === 1) viewAbout();
    else if (v === "ballot") viewBallot(parts[1], parts[2], parts.slice(3).join("/"));
    else if (v === "sheet") viewSheet(parts[1], parts[2], parts.slice(3).join("/"));
    else if (v === "how-to-vote" && parts.length === 1) viewHowToVote();
    else if (v === "item") viewItem(parts.slice(1).join("/"));
    else if (v === "contest") viewContest(parts.slice(1).join("/"));
    else if (v === "candidate") viewCandidate(parts.slice(1).join("/"));
    else if (v === "browse" && parts.length === 1) viewBrowse();
    else if (v === "contests" && parts.length === 1) viewContests();
    else viewNotFound("That page does not exist.");
    setNav(v);
    var warn = loadWarning();
    if (warn) app.insertAdjacentHTML("afterbegin", warn);
    // The title is for the browser tab and history only. The visitor counter never reads it (see countVisit).
    var h1 = app.querySelector("h1");
    document.title = (v && h1 ? h1.textContent + " · " : "") + SITE;
    // Route changes are announced by moving focus to the new h1, not by a live region over the whole page.
    // On the first load focus stays at the top of the document, so the skip link, menu and beta notice come first (UX-03).
    if (navCount > 1) focusTop(); else window.scrollTo(0, 0);
  }

  // Compact menu on phones (CSS shows the button below 640px). Without JavaScript the links stay visible.
  var topbar = document.querySelector(".topbar"), menuBtn = document.querySelector(".menu-btn");
  function setMenu(open) { if (!topbar || !menuBtn) return; topbar.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); } });
  }
  // Marks the current section in the menu and closes the phone menu after navigating.
  function setNav(v) {
    setMenu(false);
    var map = { find: "#/find", ballot: "#/find", sheet: "#/find", "how-to-vote": "#/how-to-vote", contests: "#/contests", contest: "#/contests", candidate: "#/contests", browse: "#/browse", item: "#/browse", statewide: "#/browse", about: "#/about" };
    document.querySelectorAll(".topnav a").forEach(function (a) { if (map[v] && a.getAttribute("href") === map[v]) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }

  countVisit();
  loadData().then(function () { window.addEventListener("hashchange", route); route(); })
    .catch(function (err) {
      app.innerHTML = '<h1>Something went wrong loading the guide</h1><p>' + esc(err && err.message || "Unknown error") + '. Please refresh the page. The <a href="propositions.html">statewide proposition tool</a> still works on its own, and the official ' + ext("https://voterguide.sos.ca.gov/", "California voter guide") + " has every statewide measure.</p>";
      focusTop();
    });
})();
