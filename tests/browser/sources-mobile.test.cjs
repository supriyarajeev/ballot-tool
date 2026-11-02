// Cheat sheet to a proposition's sources on a phone (Nov 1, 2026). From the guide's cheat sheet, the "Sources" link
// on each proposition row opens the Ballot Weighing Tool at that proposition with More facts open and the source list
// in view. Checked for all 14 propositions at 360, 390 and 430 px, with no sideways scrolling.
//   node tests/browser/sources-mobile.test.cjs   (needs BASE; tests/browser/run.mjs sets it)
const { chromium } = require("playwright");
const { BASE, counter } = require("./lib.cjs");
const { ok, done } = counter("sources on mobile tests");
const SHEET = "index.html#/sheet/ca-santa-clara/ca-santa-clara-mountain-view";
(async () => {
  const b = await chromium.launch();
  try {
    for (const w of [360, 390, 430]) {
      const p = await b.newPage({ viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true });
      await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
      // Home page: My cheat sheet (Nov 1, 2026). A new visitor goes to the place picker set to open the sheet; after a
      // sheet has been opened, the button reopens it in one tap, with the marks still there.
      await p.goto(BASE + "index.html#/"); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector("a[data-home-sheet]");
      ok((await p.getAttribute("a[data-home-sheet]", "href")) === "#/find?next=sheet" && (await p.textContent("a[data-home-sheet]")).trim() === "My ballot cheat sheet", "home: My ballot cheat sheet starts at the place picker for a new visitor @" + w);
      await p.click("a[data-home-sheet]"); await p.waitForSelector("#go");
      ok(/Open my cheat sheet/.test(await p.textContent("#go")), "home: the picker opens a cheat sheet @" + w);
      await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      const firstBox = "li.contest .cands input[type=checkbox]";
      await p.check(firstBox);
      await p.goto(BASE + "index.html#/"); await p.waitForSelector("a[data-home-sheet]");
      ok((await p.getAttribute("a[data-home-sheet]", "href")) === "#/sheet/ca-santa-clara/ca-santa-clara-mountain-view" && (await p.getAttribute(".topnav a[data-my-ballot]", "href")) === "#/sheet/ca-santa-clara/ca-santa-clara-mountain-view", "home: My ballot remembers the last sheet, in the menu too @" + w);
      const hb = await p.$eval("a[data-home-sheet]", (a) => a.getBoundingClientRect().height);
      ok(hb >= 44 && (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, "home: the button is a full-size tap target with no sideways scroll @" + w);
      await p.click("a[data-home-sheet]"); await p.waitForSelector("li.contest");
      ok(await p.isChecked(firstBox), "home: one tap reopens the sheet with its marks @" + w);
      await p.uncheck(firstBox);
      await p.evaluate(() => localStorage.setItem("ballot-last-sheet-v1", "not-a-county/x")); await p.goto(BASE + "index.html#/"); await p.reload(); await p.waitForSelector("a[data-home-sheet]");
      ok((await p.getAttribute("a[data-home-sheet]", "href")) === "#/find?next=sheet", "home: an unknown saved place is ignored @" + w);
      await p.goto(BASE + SHEET); await p.waitForSelector("a.src-link");
      const links = await p.$$eval("a.src-link", (a) => a.map((x) => [x.getAttribute("href"), x.getBoundingClientRect().height]));
      ok(links.length === 14, "cheat sheet shows a Sources link for each of the 14 propositions @" + w + " (" + links.length + ")");
      ok(links.every((l) => l[1] >= 24), "Sources links are at least 24 px tall @" + w);
      for (const [href] of links) {
        const n = /#prop-(\d+)-sources$/.exec(href); ok(!!n, "Sources link points at #prop-N-sources: " + href);
        if (!n) continue;
        await p.goto(BASE + SHEET); await p.waitForSelector("a.src-link");
        await p.click(`a.src-link[href="${href}"]`);
        await p.waitForSelector("#src-" + n[1]); await p.waitForTimeout(900);
        const r = await p.evaluate((k) => {
          const s = document.getElementById("src-" + k), a = s.querySelector("a"), ab = a.getBoundingClientRect();
          return { top: Math.round(ab.top), sy: Math.round(scrollY), open: document.getElementById("facts-" + k).open, seen: ab.top >= 0 && ab.bottom <= innerHeight, n: s.querySelectorAll("li").length, over: document.documentElement.scrollWidth - innerWidth };
        }, n[1]);
        ok(r.open && r.seen && r.n > 0 && r.over <= 0, "one tap from the cheat sheet shows Prop " + n[1] + "'s sources @" + w + " " + JSON.stringify(r));
      }
      if (w === 390) {
        const t = await p.evaluate(() => document.getElementById("src-45").innerText);
        ok(/Published Oct 6, 2026 · Updated Oct 30, 2026/.test(t) && /Publication date not stated/.test(t) && /Links last opened Nov 1, 2026/.test(t), "Prop 45 sources show stated dates, 'Publication date not stated' and the separate link-check date");
        const all = await p.evaluate(() => [...document.querySelectorAll(".srcs li[data-src]")].map((li) => !!li.querySelector(".smeta")));
        ok(all.length === 68 && all.every(Boolean), "all " + all.length + " proposition sources show publisher, type and date details");
      }
      // Local measures: Details and sources (Nov 1, 2026).
      await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      const loc = await p.$$eval("li.srow:not(.contest):not([data-tool])", (li) => li.map((x) => [(x.querySelector("a.sheet-link") || {}).textContent, (x.querySelector("a.sheet-link") || { getAttribute: () => "" }).getAttribute("href")]));
      ok(loc.length > 0 && loc.every((x) => x[0] === "Details and sources" && /^#\/item\//.test(x[1])), "every local measure on the sheet links to its details @" + w + " (" + loc.length + ")");
      if (loc.length) await p.click(`a.sheet-link[href="${loc[0][1]}"]`); await p.waitForTimeout(500);
      ok((await p.evaluate(() => location.hash)) === loc[0][1] && (await p.$("h1")) !== null, "Details and sources opens the measure page @" + w);
      await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      // Candidate contests: Compare candidates (or See candidates) and View profile, one tap each (Nov 1, 2026).
      await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      const cs = await p.$$eval("li.contest", (li) => li.map((x) => ({ id: x.dataset.id, link: (x.querySelector(".stx a.sheet-link") || {}).textContent || "", href: (x.querySelector(".stx a.sheet-link") || { getAttribute: () => "" }).getAttribute("href"), cands: x.querySelectorAll(".cands li").length, profiles: [...x.querySelectorAll(".cands a.sheet-link")].map((a) => [a.textContent, a.getAttribute("href"), a.getBoundingClientRect().height]) })));
      ok(cs.length > 0 && cs.every((c) => /^(Compare candidates|See candidates)$/.test(c.link) && c.href === "#/contest/" + encodeURIComponent(c.id)), "every contest on the sheet links to its contest page @" + w + " (" + cs.length + " contests)");
      ok(cs.every((c) => c.profiles.length === c.cands && c.profiles.every((x) => x[0] === "View profile" && /^#\/candidate\//.test(x[1]) && x[2] >= 24)), "every candidate has a View profile link at least 24 px tall @" + w);
      const cmp = cs.find((c) => c.link === "Compare candidates");
      ok(!!cmp, "at least one contest on the Mountain View sheet has Compare candidates @" + w);
      if (cmp) {
        await p.click(`li.contest[data-id="${cmp.id}"] .stx a.sheet-link`); await p.waitForSelector("#ws-h"); await p.waitForTimeout(300);
        const top = await p.evaluate(() => document.getElementById("ws-h").getBoundingClientRect().top);
        ok(top >= -2 && top < 400, "Compare candidates opens the contest at Where they stand @" + w + " (top " + Math.round(top) + ")");
        await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      }
      const prof = cs[0].profiles[0];
      await p.click(`a.sheet-link[href="${prof[1]}"]`); await p.waitForTimeout(500);
      ok((await p.evaluate(() => location.hash)) === prof[1] && (await p.$("h1")) !== null, "View profile opens the candidate page @" + w);
      await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
      const box = await p.$("li.contest .cands label.box");
      const before = await box.$eval("input", (i) => i.checked); await box.click({ position: { x: 40, y: 8 } });
      ok((await box.$eval("input", (i) => i.checked)) !== before && (await p.evaluate(() => location.hash)).startsWith("#/sheet/"), "tapping a candidate's name still ticks the box and stays on the sheet @" + w);
      await box.click({ position: { x: 40, y: 8 } });
      // Back to the same cheat sheet (Nov 1, 2026): from each kind of sheet link, by the page's own back link and by the
      // browser's Back, the sheet returns at the same scroll position with its marks.
      for (const [name, sel] of [["View profile", "li.contest .cands a.sheet-link"], ["Compare candidates", "li.contest .stx a.sheet-link"], ["Details and sources", 'li.srow:not(.contest) a.sheet-link[href^="#/item/"]'], ["Sources", "a.src-link"]]) {
        for (const how of ["page link", "browser Back"]) {
          await p.goto(BASE + SHEET); await p.waitForSelector("li.contest");
          if (!(await p.isChecked("li.contest .cands input"))) await p.check("li.contest .cands input");
          const el = await p.$(sel); await el.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -100));
          const y0 = await p.evaluate(() => Math.round(window.scrollY));
          await el.click(); await p.waitForTimeout(700);
          let label = "";
          if (how === "browser Back") await p.goBack();
          else { const bl = await p.$("#ballot-return-a:visible, a.back"); label = bl ? (await bl.textContent()).trim() : ""; if (bl) await bl.click(); }
          await p.waitForTimeout(700);
          const r = await p.evaluate(() => ({ h: location.hash, y: Math.round(window.scrollY) }));
          ok(r.h === "#/sheet/ca-santa-clara/ca-santa-clara-mountain-view" && Math.abs(r.y - y0) <= 40 && await p.isChecked("li.contest .cands input") && (how !== "page link" || /^Back to my cheat sheet/.test(label)), name + ", " + how + ": back on the same sheet within 40 px of the same place, marks kept @" + w + " " + JSON.stringify({ label, y0, ...r }));
        }
      }
      await p.uncheck("li.contest .cands input");
      await p.emulateMedia({ media: "print" });
      ok(await p.$$eval("a.sheet-link, a.src-link", (a) => a.every((x) => getComputedStyle(x).display === "none" || x.closest(".no-print") && getComputedStyle(x.closest(".no-print")).display === "none")), "sheet links are hidden when printing @" + w);
      await p.emulateMedia({ media: "screen" });
      await p.close();
    }
  } catch (e) { ok(false, "sources on mobile suite crashed: " + e.message); }
  await b.close(); done();
})();
