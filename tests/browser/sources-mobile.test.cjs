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
      await p.close();
    }
  } catch (e) { ok(false, "sources on mobile suite crashed: " + e.message); }
  await b.close(); done();
})();
