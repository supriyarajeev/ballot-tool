// Tests the Ballot Weighing Tool page.
//   node tests/browser/weighing-tool.test.cjs [path/to/propositions.html]
// With a path, the file is opened directly (file://). Without one, BASE (set by tests/browser/run.mjs) is used.
// LINKS_OUT=<file> writes the list of source links seen at 1280px (nothing is written by default).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { AXE, ALLOWED_HOSTS, blockExternal, watchErrors, counter } = require("./lib.cjs");

const URL_ = process.argv[2] ? "file://" + path.resolve(process.argv[2]) : process.env.BASE ? process.env.BASE + "propositions.html" : "file://" + path.join(__dirname, "../../propositions.html");
const NS = ["1", "2", "3", "4", "5", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const { ok, done } = counter("weighing tool browser tests");
const BWfmt = (x) => (Math.round(x * 10) / 10).toFixed(1);
// Opens Customize and every card, so the older checks can see each card's details (the page starts folded since Oct 29, 2026).
async function prep(p) { await p.waitForSelector("article.prop"); await p.evaluate(() => { document.querySelectorAll("button.sec-fold").forEach((b) => { if (b.getAttribute("aria-expanded") !== "true") b.click(); }); const d = document.getElementById("customize"); if (d) d.open = true; const b = document.getElementById("fold-all"); if (b && b.getAttribute("aria-pressed") !== "true") b.click(); }); }

(async () => {
  const b = await chromium.launch();
  for (const [w, scheme] of [[1280, "light"], [768, "dark"], [360, "light"], [360, "dark"]]) {
    const tag = `@${w} ${scheme}`;
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
    const p = await ctx.newPage();
    const errs = [], hosts = new Set();
    watchErrors(p, errs);
    await blockExternal(p, hosts);
    await p.goto(URL_); await p.waitForSelector("article.prop");
    const T = async (s) => (await p.textContent(s)).trim();
    ok((await p.locator("article.prop").count()) === 14, "14 cards " + tag);
    // Folded list (Oct 29, 2026): every card starts as one row with its answer buttons; opening one folds the other.
    {       const f = await p.evaluate(() => [...document.querySelectorAll("article.prop")].map((c) => ({ folded: c.classList.contains("folded"), exp: c.querySelector("button.fold").getAttribute("aria-expanded"), pills: [...c.querySelectorAll(".pill span")].every((x) => x.getBoundingClientRect().height >= 44), body: c.querySelector(".fold-body").getBoundingClientRect().height, res: c.querySelector(".result").getBoundingClientRect().height, ask: c.querySelector(".ask-q").textContent.length > 20 })));
      ok(f.every((x) => x.folded && x.exp === "false" && x.pills && x.body === 0 && x.res === 0 && x.ask), "all 14 start folded to one row with the question and visible 44px answer buttons " + tag);
      const s2 = await p.evaluate(() => document.getElementById("s2").offsetHeight);
      ok(s2 < (w < 600 ? 4800 : 3300), "Step 2 is short when folded (" + s2 + "px) " + tag);
      ok(await p.evaluate(() => document.getElementById("s1-body").hidden && document.getElementById("s1-fold").getAttribute("aria-expanded") === "false" && /standard weights/.test(document.getElementById("fw-status").textContent)), "Step 1 starts with its details folded and the weights status visible " + tag);
      await p.click("#s1-fold"); ok(await p.isVisible("#fw-body") && await p.isVisible("#behave") && (await p.textContent("#s1-fold .fold-hint")) === "Hide details", "Details opens the factors, weights and scoring " + tag);
      await p.click("#s1-fold"); ok(await p.isHidden("#fw-body"), "and folds them again " + tag);
      await p.click('a.step[href="#s1"]'); ok(await p.isVisible("#fw-body"), "the Step 1 link at the top opens the details " + tag);
      await p.click("#s1-fold");
      ok(await p.evaluate(() => document.getElementById("s3-body").hidden && document.getElementById("m-body").hidden) && await p.isVisible("#take-a") && await p.isVisible("#tally"), "Step 3 and the method notes start folded; the cheat sheet button and the answer counts stay visible " + tag);
      await p.click("#s3-fold"); ok(await p.isVisible('#ballot .b-row[data-n="1"]') && await p.isVisible("#reset"), "Show details in Step 3 shows the 14-row list and Clear my answers " + tag);
      await p.click("#s3-fold"); await p.click('.sticky a[href="#s3"]'); ok(await p.isVisible('#ballot .b-row[data-n="1"]'), "See my ballot opens the Step 3 list " + tag);
      await p.click("#s3-fold"); await p.click("#m-fold"); ok(await p.isVisible("#privacy") && await p.isVisible("[data-checks]"), "the method notes open, including privacy and check dates " + tag);
      await p.click("#m-fold");
      const pill = await p.$eval("#s1-fold .fold-hint", (e) => { const c = getComputedStyle(e); return [parseFloat(c.borderTopWidth), c.borderTopStyle, Math.round(e.getBoundingClientRect().height)]; });
      ok(pill[0] >= 1 && pill[1] === "solid" && pill[2] >= 28, "Show details is drawn as a bordered button, not plain text " + tag + " " + JSON.stringify(pill));
      await p.click("#fd-40"); await p.waitForTimeout(700);
      ok(await p.evaluate(() => { const c = document.getElementById("prop-40"); return !c.classList.contains("folded") && c.querySelector("button.fold").getAttribute("aria-expanded") === "true" && c.querySelector(".fold-body").getBoundingClientRect().height > 100 && c.querySelector(".result").getBoundingClientRect().height > 100; }), "the name opens Prop 40 in place " + tag);
      { const wd = await p.evaluate(() => { const c = document.getElementById("prop-40"), cs = getComputedStyle(c); return [Math.round(document.getElementById("facts-40").getBoundingClientRect().width), Math.round(c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)), Math.round(document.getElementById("cd-40").getBoundingClientRect().width)]; });
        ok(Math.abs(wd[0] - wd[1]) <= 2 && Math.abs(wd[2] - wd[1]) <= 2, "More facts and the calculation span the whole card, with no empty column beside them " + tag + " " + JSON.stringify(wd)); }
      await p.click("#fd-41"); await p.waitForTimeout(900);
      const g = await p.evaluate(() => ({ open: [...document.querySelectorAll("article.prop:not(.folded)")].map((a) => a.id).join(), top: document.getElementById("prop-41").getBoundingClientRect().top, bar: document.querySelector(".sticky").getBoundingClientRect().bottom }));
      ok(g.open === "prop-41" && g.top >= g.bar - 1 && g.top < 400, "opening Prop 41 folds Prop 40 and keeps Prop 41 in view below the progress bar " + tag + " " + JSON.stringify(g));
      await p.click("#fd-41"); ok(await p.evaluate(() => document.querySelectorAll("article.prop:not(.folded)").length === 0), "tapping the name again folds it " + tag);
      ok(!(await p.evaluate(() => /Not sure counts as a choice|PDF links open in your browser/.test(document.getElementById("props").textContent))) && (await p.$$eval(".pdf-note", (e) => e.length)) === 1, "instructions and the PDF tip appear once, not on every card " + tag);
      await p.click("#fold-all"); ok(await p.evaluate(() => document.querySelectorAll("article.prop.folded").length === 0) && (await T("#fold-all")) === "Fold all 14", "Open all 14 opens every card " + tag);
      await p.click("#fold-all"); ok(await p.evaluate(() => document.querySelectorAll("article.prop.folded").length === 14), "Fold all 14 folds them again " + tag);
      await p.evaluate(() => window.scrollTo(0, 0)); }
    await prep(p);
    if (w === 1280) {
      // Source links (Oct 24 audit): https only, safe new-tab attributes, official HTML first with the PDF beside it.
      const L = await p.$$eval("article.prop .facts a[target=_blank]", (as) => as.map((x) => [x.getAttribute("href"), x.rel, x.closest("article").id, x.className, x.textContent]));
      ok(L.length > 80 && L.every(([h, r]) => /^https:\/\//.test(h) && /noopener/.test(r) && /noreferrer/.test(r)), "every source link is https and opens safely in a new tab (" + L.length + ")");
      for (const n of NS) {
        const mine = L.filter((x) => x[2] === "prop-" + n);
        ok(mine.some(([h, , , c]) => !c && h === "https://voterguide.sos.ca.gov/propositions/" + n + "/analysis.htm") && mine.some(([h, , , c]) => c === "alt" && h === "https://lao.ca.gov/ballot/2026/prop" + n + "-110326.pdf"), `Prop ${n}: LAO analysis links the official HTML page with the LAO PDF beside it`);
        ok(!mine.some(([h, , , c, t]) => !c && /Official arguments/.test(t) && /\.pdf$/.test(h)), `Prop ${n}: official arguments link the HTML page, not a PDF`);
      }
      ok(!L.some(([h]) => /hoover\.org\/research\/|lwvc\.org\/ballot-recs$/.test(h)), "no source link uses an address that is known to redirect");
    }
    ok(await p.isHidden("#ballot-return") && await p.isHidden("#ret-mini"), "no ballot link when not arriving from a ballot " + tag);
    if (process.env.BASE && w === 360) {
      const c2 = await b.newContext({ viewport: { width: 360, height: 800 } }); const q = await c2.newPage(); await blockExternal(q, new Set());
      await q.goto(process.env.BASE + "propositions.html?from=" + encodeURIComponent("javascript:alert(1)") + "&place=x#prop-5"); await q.waitForSelector("#prop-5.is-target");
      ok(await q.isHidden("#ballot-return"), "an unsafe return address is ignored");
      await q.goto(process.env.BASE + "propositions.html?from=" + encodeURIComponent("#/ballot/ca-napa") + "&place=" + encodeURIComponent("Napa County") + "#prop-40"); await q.waitForSelector("#prop-40.is-target");
      const g = await q.evaluate(() => [document.querySelector(".sticky").getBoundingClientRect().bottom, document.getElementById("prop-40").getBoundingClientRect().top, document.documentElement.scrollWidth]);
      ok(g[1] >= g[0] - 1 && g[2] <= 360, "phone: the chosen card sits below the progress bar, no overflow " + JSON.stringify(g.map(Math.round)));
      ok(await q.isVisible("#ret-mini") && (await q.getAttribute("#ret-mini", "href")) === "index.html#/ballot/ca-napa", "phone: the progress bar has a Ballot link back");
      await q.click('label[for="g-40-3"]'); ok((await q.textContent("#v-40")).trim() !== "Not answered", "answering still works after arriving from a ballot");
      await c2.close(); }
    if (w === 360) {
      const sh = await p.$eval(".sticky", (e) => e.getBoundingClientRect().height);
      ok(sh <= 70 && !(await p.isVisible(".sticky .tally")), "phone: the progress bar is one compact row (" + Math.round(sh) + "px) " + tag);
      const bt = await p.$eval('.sticky a.linkbtn[href="#s3"]', (e) => e.getBoundingClientRect().height); ok(bt >= 44, "phone: See my ballot is a 44px target " + tag);
      await p.click('a.step[href="#s2"]'); await p.waitForTimeout(900);
      const g = await p.evaluate(() => [document.querySelector(".sticky").getBoundingClientRect().bottom, document.querySelector("#s2 h2").getBoundingClientRect().top]);
      ok(g[1] >= g[0] - 1, "phone: jumping to Step 2 leaves its heading below the progress bar " + JSON.stringify(g.map(Math.round)) + " " + tag);
      await p.evaluate(() => window.scrollTo(0, 0)); }
    // defaults
    ok((await p.getAttribute('.preset[data-id="def"]', "aria-pressed")) === "true", "default preset active " + tag);
    ok((await T("#tally")).includes("Not answered 14"), "all unanswered " + tag);
    for (const n of NS) ok((await T("#v-" + n)) === "Not answered", "unanswered label " + n + " " + tag);
    // presets
    for (const id of ["res", "cost", "eq", "def"]) { await p.click(`.preset[data-id="${id}"]`); ok((await p.getAttribute(`.preset[data-id="${id}"]`, "aria-pressed")) === "true", "preset " + id + " " + tag); }
    // all Not sure
    for (const n of NS) await p.click(`label[for="g-${n}-2"]`);
    ok((await T("#tally")).includes("Not sure 14"), "all not sure " + tag); ok((await T("#ans-n")) === "14", "answered 14 " + tag);
    // every preference state on prop 1
    const exp = { 1: "No", 2: "Not sure", 3: "Yes" };
    for (const k of [1, 2, 3]) { await p.click(`label[for="g-1-${k}"]`); ok((await T("#v-1")) === exp[k], "pref state " + k + " " + tag); }
    await p.click('label[for="g-1-3"]'); ok(/^\d+% \d\.\d of 5 · \w+$/.test(await T("#q-1")) && (await T("#q-1")).startsWith(Math.round(parseFloat((await T("#q-1")).split(" ")[1]) * 20) + "%"), "score shows a percentage that equals the score out of 5 times 20 " + tag + " " + (await T("#q-1")));
    // The scoring math itself is checked against the original tool by tests/scoring-regression.mjs.
    // card vs summary agreement
    const agree = async () => { for (const n of NS) { const v = await T("#v-" + n); const chip = await p.textContent(`#ballot a[data-n="${n}"] .chip`); if (v !== chip.trim()) return n; } return true; };
    ok((await agree()) === true, "card/summary agree 1 " + tag);
    // weights change after answering
    await p.click('label[for="g-38-3"]'); const before = await T("#q-38"); await p.fill("#w-ev", "0"); const after = await T("#q-38"); ok(before !== after, "weight change updates " + tag);
    ok((await agree()) === true, "card/summary agree 2 " + tag);
    // all zero
    for (const k of ["ev", "lr", "ac", "if", "fc"]) await p.fill("#w-" + k, "0");
    ok(await p.isVisible("#zero"), "zero note " + tag);
    ok((await T("#q-38")) === "Evidence not weighted" && (await p.textContent('#ballot a[data-n="38"] .bsub')).includes("Evidence not weighted"), "zero not weighted " + tag);
    ok((await T("#v-38")) === "Yes" && /no evidence score/.test(await T("#y-38")), "all weights off: the answer is shown and the evidence says there is no score " + tag);
    ok(!/NaN|Infinity/.test(await p.evaluate(() => document.body.innerText)), "no NaN " + tag);
    ok((await agree()) === true, "card/summary agree zero " + tag);
    await p.click("#zero-reset"); ok((await p.inputValue("#w-ev")) === "5" && !(await p.isVisible("#zero")), "reset defaults " + tag);
    // slider handler: the value set on a slider is what is saved and restored (VAL-12)
    for (const v of ["0", "2", "5"]) {
      await p.fill("#w-ev", v);
      const saved = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem("ballot-weighing-v2")).w.ev; } catch (e) { return "unreadable"; } });
      ok(saved === +v, `slider sets weight ev=${v} (saved ${saved}) ${tag}`);
    }
    await p.reload(); await prep(p);
    ok((await p.inputValue("#w-ev")) === "5", "slider value survives reload " + tag);
    // saved-weight clamp: out-of-range stored values are ignored on load
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ballot-weighing-v2")); s.w.lr = 7; s.w.ev = 2.6; localStorage.setItem("ballot-weighing-v2", JSON.stringify(s)); });
    await p.reload(); await prep(p);
    ok((await p.inputValue("#w-lr")) === "4", "out-of-range saved weight ignored " + tag);
    ok((await p.inputValue("#w-ev")) === "3", "fractional saved weight rounded " + tag);
    await p.click('.preset[data-id="def"]');
    // clear answers keeps weights
    await p.click('.preset[data-id="eq"]'); await p.click("#reset"); ok((await T("#tally")).includes("Not answered 14"), "clear answers " + tag); ok((await p.getAttribute('.preset[data-id="eq"]', "aria-pressed")) === "true", "clear keeps weights " + tag);
    // partial + persistence
    await p.click('label[for="g-40-3"]'); await p.click('label[for="g-41-3"]'); await p.click('label[for="g-5-2"]');
    ok(await p.isVisible("#conflict"), "conflict shown " + tag);
    await p.reload(); await prep(p);
    ok((await T("#v-40")) === "Yes" && (await T("#v-5")) === "Not sure" && (await T("#v-1")) === "Not answered", "persist answers " + tag);
    ok((await p.getAttribute('.preset[data-id="eq"]', "aria-pressed")) === "true", "persist weights " + tag);
    // limited caution: Prop 4 with only fc weighted
    for (const k of ["ev", "lr", "ac", "if"]) await p.fill("#w-" + k, "0"); await p.fill("#w-fc", "3"); await p.click('label[for="g-4-3"]');
    ok(await p.isVisible("#c-4"), "caution shown " + tag); ok(!(await p.isVisible("#c-1")), "caution hidden when not limited " + tag);
    // keyboard: tab to a pill and select with space
    await p.focus("#g-2-3"); await p.keyboard.press("Space"); ok((await T("#v-2")) === "Yes", "keyboard select " + tag);
    await p.keyboard.press("ArrowRight"); ok((await T("#v-2")) === "Not sure", "arrow key moves to the next choice " + tag);
    // Three choices (Oct 26, 2026): Yes | Not sure | No, run in the real page at each width and color scheme.
    { await p.click('.preset[data-id="def"]'); await p.click("#reset");
      const leg = await p.$$eval("fieldset.ask legend", (l) => l.map((x) => x.firstChild.textContent));
      ok(leg.length === 14 && leg.every((x) => x === "How would you vote on this proposition?"), "every card asks How would you vote on this proposition? " + tag);
      ok(JSON.stringify(await p.$$eval("#prop-1 .pill", (l) => l.map((x) => x.textContent.trim()))) === JSON.stringify(["Yes", "Not sure", "No"]), "three choices in order Yes, Not sure, No " + tag);
      ok((await p.$$eval("article.prop", (a) => a.every((x) => x.querySelectorAll('input[type="radio"]').length === 3))), "each of the 14 cards has exactly three radio buttons " + tag);
      const geo = await p.$$eval("#prop-1 .pill span", (s) => s.map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), Math.round(r.width), x.scrollWidth <= x.clientWidth]; }));
      ok(geo.every((g) => Math.abs(g[0] - geo[0][0]) <= 1 && g[1] >= 44 && g[2] >= 64 && g[3]), "one row, each at least 44px tall and 64px wide, no clipped text " + tag + " " + JSON.stringify(geo));
      const look = await p.$eval('label[for="g-1-3"]', (l) => { const c = getComputedStyle(l.querySelector("span")); return [parseFloat(c.borderTopWidth), c.borderTopStyle, getComputedStyle(l).cursor]; });
      ok(look[0] >= 2 && look[1] === "solid" && look[2] === "pointer", "unselected buttons have a 2px border and a pointer cursor " + tag);
      const pick = async (id) => { await p.waitForTimeout(200); return p.evaluate((id) => {
        const sp = document.querySelector('label[for="' + id + '"] span'), name = document.getElementById(id).name;
        return { sel: [...document.getElementsByName(name)].filter((r) => r.checked).map((r) => r.id), bg: getComputedStyle(sp).backgroundColor, tick: getComputedStyle(sp.querySelector(".tick")).display,
          others: [...document.getElementsByName(name)].filter((r) => r.id !== id).map((r) => { const o = r.nextElementSibling; return [getComputedStyle(o.querySelector(".tick")).display, getComputedStyle(o).backgroundColor]; }),
          saved: JSON.parse(localStorage.getItem("ballot-weighing-v2")).g };
      }, id); };
      // Prop 4 under Standard weights scores 3.0 (51/17). Each answer is shown exactly as chosen, with the same evidence line.
      for (const [id, said, res, v] of [["g-4-3", "Yes", "Yes", 1], ["g-4-2", "Not sure", "Not sure", 0], ["g-4-1", "No", "No", -1]]) {
        await p.click('label[for="' + id + '"]'); const x = await pick(id);
        ok(x.sel.length === 1 && x.sel[0] === id, said + " is the only selected choice on Prop 4 " + tag);
        ok(x.tick !== "none" && x.others.every((o) => o[0] === "none" && o[1] !== x.bg), said + " is filled and shows a check mark, the others do not " + tag);
        ok(x.saved["4"] === v, said + " is stored as " + v + " " + tag);
        ok((await T("#v-4")) === res && (await p.getAttribute("#v-4", "class")).includes("v-" + { 1: "yes", 0: "unsure", "-1": "no" }[v]), "Prop 4 card shows your answer, " + said + ", exactly as chosen " + tag);
        ok((await T("#q-4")) === "60% 3.0 of 5 · Fair" && (await T("#y-4")) === "At or above the 3.0 midpoint (60%), on the factors you weigh.", "the evidence line is the same whatever you answer (" + said + ") " + tag);
        const nx = await p.$eval("#nx-4", (a) => [a.hidden, a.textContent, a.getAttribute("href")]);
        ok(!nx[0] && nx[2] === (v === 1 ? "#aa-4" : "#af-4") && (v === 1 ? /^Before you vote Yes, read the argument against/ : v === -1 ? /^Before you vote No, read the argument for/ : /^Still deciding\? Compare/).test(nx[1]), "the next-step link points to the other side of " + said + " " + tag);
        ok((await T('#ballot .b-row[data-n="4"] .chip')) === res && (await T('#ballot .b-row[data-n="4"] .bsub')) === "Evidence Fair, 3.0 of 5 (60%)", "Step 3 row shows " + said + " and the evidence " + tag);
      }
      await p.click("#nx-4");
      ok(await p.evaluate(() => document.getElementById("facts-4").open && document.activeElement.id === "af-4"), "the next-step link opens More facts at the argument for (answer No) " + tag);
      await p.evaluate(() => { document.getElementById("facts-4").open = false; });
      await p.click('label[for="g-1-3"]'); await p.click('label[for="g-1-1"]');
      ok((await pick("g-1-1")).sel.join() === "g-1-1" && (await T("#v-1")) === "No", "Yes then No leaves only No selected " + tag);
      await p.click('label[for="g-2-2"]');
      ok((await p.$$eval("#tally .chip", (c) => c.map((x) => x.textContent).join("|"))) === "Yes 0|No 2|Not sure 1|Not answered 11" && (await T("#ans-n")) === "3", "Not sure is counted as answered and as Not sure, not as YES or NO " + tag);
      ok(await p.isVisible("#clr-4") && !(await p.isVisible("#clr-5")), "Clear answer shows only on answered cards " + tag);
      await p.click("#clr-4");
      ok((await pick("g-4-1")).sel.length === 0 && (await T("#v-4")) === "Not answered" && (await T("#ans-n")) === "2" && !(await p.isVisible("#clr-4")) && (await pick("g-4-1")).saved["4"] === null, "Clear answer returns Prop 4 to Not answered, distinct from Not sure " + tag);
      ok(await p.evaluate(() => document.activeElement && document.activeElement.id === "g-4-3"), "focus moves to Yes after clearing " + tag);
      await p.click('label[for="g-3-3"]');
      await p.reload(); await p.waitForSelector("article.prop"); await prep(p);
      ok((await pick("g-1-1")).sel.join() === "g-1-1" && (await pick("g-2-2")).sel.join() === "g-2-2" && (await pick("g-3-3")).sel.join() === "g-3-3" && (await pick("g-4-3")).sel.length === 0, "after a refresh Prop 1 No, Prop 2 Not sure, Prop 3 Yes stay selected and Prop 4 stays empty " + tag);
      ok((await T("#ans-n")) === "3" && (await p.$$eval("#tally .chip", (c) => c.map((x) => x.textContent).join("|"))) === "Yes 1|No 1|Not sure 1|Not answered 11", "progress and totals after refresh " + tag);
      // Keyboard: arrow keys move and select, and the focused button shows an outline.
      await p.focus("#g-3-3"); await p.keyboard.press("ArrowRight");
      ok(await p.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a.nextElementSibling); return a.id === "g-3-2" && a.checked && c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2; }), "arrow key selects Not sure with a visible focus outline " + tag);
      ok((await p.evaluate(() => document.getElementById("g-3-2").matches('input[type="radio"]') && document.querySelector("#prop-3 fieldset.ask legend").textContent.includes("Prop 3"))), "radio buttons in a fieldset whose legend names the proposition for screen readers " + tag);
      // Not hidden under the sticky bar: the middle of each button is the button itself.
      await p.evaluate(() => document.querySelector("#prop-5 .pills").scrollIntoView({ block: "center", behavior: "instant" })); await p.waitForTimeout(300);
      const hit = await p.evaluate(() => [...document.querySelectorAll("#prop-5 .pill span")].map((s) => { const r = s.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && s.parentElement.contains(e) ? "ok" : (e ? e.tagName + "." + e.className : "none") + "@" + Math.round(r.top); }));
      ok(hit.every((h) => h === "ok"), "Prop 5 buttons are not covered (" + hit.join(", ") + ") " + tag);
      // Release-readiness content rules (Oct 26, 2026).
      const rr = await p.evaluate(() => ({
        ix: [...document.querySelectorAll("article.prop")].filter((c) => c.querySelector("[data-ix]")).map((c) => c.id),
        risk: [...document.querySelectorAll(".facts dt")].filter((d) => /risk/i.test(d.textContent)).map((d) => d.textContent),
        rh: document.querySelector(".ratings-h").textContent,
        beta: document.querySelector("[data-checks]").textContent, banner: document.querySelectorAll("[data-beta], .beta-tag").length, about: document.querySelector('header a.about-link[href="index.html#/about"]') ? 1 : 0,
        party: /Republican|Democratic Party|Democratic and Republican/.test(document.getElementById("props").textContent),
        roles: [...document.querySelectorAll(".srcs li")].filter((li) => /nachc|hklaw|lwvc/.test(li.innerHTML)).map((li) => li.querySelector(".role").textContent),
        inshort: !!document.querySelector("[data-inshort]"),
        howWeights: (document.body.textContent.match(/not a scientifically proven or universally agreed-upon set of ideal weights/g) || []).length,
        cannot: (document.body.textContent.match(/What the framework cannot establish/g) || []).length,
        s3note: !!document.querySelector("#s3 .note") }));
      ok(rr.ix.join() === "prop-40,prop-41,prop-42", "the neutral 40/41/42 interaction note appears on exactly those three cards " + tag);
      ok(rr.risk.length === 14 && rr.risk.every((t) => t === "Biggest risk if it passes"), "risk is labeled Biggest risk if it passes on all 14 " + tag);
      ok(/own ratings/.test(rr.rh) && /this tool's own.*not LAO or state ratings/.test(await T("#s2 .sec-head")), "ratings are labeled as this tool's own on each card, and as not LAO or state ratings once in Step 2 " + tag);
      ok(rr.banner === 0 && rr.about === 1 && /October 22 and 23, 2026/.test(rr.beta) && /not reviewed by any outside organization/.test(rr.beta) && !/officially reviewed/.test(rr.beta) && (await p.$$eval('a[href*="github.com"]', (a) => a.length)) === 0, "the tool has no warning banner, links About this guide from its header, gives the check dates in its methods section, and has no GitHub link " + tag);
      ok(!rr.party, "no party positions are listed on any card " + tag);
      ok(rr.roles.length === 3 && rr.roles.every((r) => r !== "Independent"), "interested-party sources are not labeled Independent: " + rr.roles.join(" | ") + " " + tag);
      ok(!rr.inshort && rr.howWeights === 1 && rr.cannot === 1 && !rr.s3note, "methodology and limits appear once, in the methods section, not repeated in Step 1 or Step 3 " + tag);
      // Framework v3 (Oct 29, 2026): five factors, described angles on every card, profile first, Step 3 scores on request.
      const v3 = await p.evaluate(() => [...document.querySelectorAll("article.prop")].map((c) => ({
        n: c.id, ang: [...c.querySelectorAll("[data-angles] dt")].map((d) => d.textContent), angTxt: [...c.querySelectorAll("[data-angles] dd")].every((d) => d.textContent.trim().length > 20),
        fund: [...c.querySelectorAll(".facts a")].filter((a) => /^https:\/\/www\.sos\.ca\.gov\/campaign-lobbying\/helpful-resources\/measure-contributions\/2026-ballot-measure-contribution-totals\/proposition-/.test(a.href) && a.target === "_blank" && /noopener/.test(a.rel)).length,
        rel: [...c.querySelectorAll(".facts dt")].some((d) => d.textContent === "Other measures on this ballot"),
        rows: c.querySelectorAll(".rgrid .rt").length, half: c.querySelectorAll(".rgrid .dots i.half").length })));
      ok(v3.every((x) => x.ang.join("|") === "Who could gain|Who pays or gives something up|How hard to change later" && x.angTxt), "all 14 cards show who could gain, who pays and how hard it is to change later " + tag);
      ok(v3.every((x) => x.fund === 1 && x.rel && x.rows === 5), "all 14 cards have five ratings, a campaign money link to the Secretary of State and an other-measures line " + tag);
      ok(v3.filter((x) => x.half).map((x) => x.n).join() === "prop-2,prop-3,prop-38,prop-42,prop-45", "half-point dots appear exactly where Accountability and results is a half point " + tag + " " + v3.filter((x) => x.half).map((x) => x.n).join());
      ok(!/Net benefit|Outcome clarity|Fiscal clarity|Feasibility\b/.test(await p.evaluate(() => document.querySelector("#s1").textContent + document.getElementById("props").textContent)), "retired factor names are gone from Step 1 and the cards " + tag);
      ok(await p.evaluate(() => !document.getElementById("howscore").open), "How scoring works starts closed " + tag);
      ok(/the 14 range from 2\.3 to 3\.9\./.test(await T("#bh-range")), "How these ratings behave states the real range under standard weights " + tag);
      ok((await T("#q-40")) === "46% 2.3 of 5 · Mixed" && (await T("#y-40")) === "Below the 3.0 midpoint (60%), on the factors you weigh.", "Prop 40 shows 46% beside 2.3 of 5, hand check 2.3 x 20 = 46 " + tag);
      ok(await p.isHidden('#ballot .b-row[data-n="1"] .bsub') && !(await p.isChecked("#show-ev")), "Step 3 shows answers only until the voter asks for scores " + tag);
      await p.check("#show-ev"); ok(await p.isVisible('#ballot .b-row[data-n="1"] .bsub'), "the switch shows the evidence scores in Step 3 " + tag);
      await p.reload(); await prep(p); ok(await p.isChecked("#show-ev") && await p.isVisible('#ballot .b-row[data-n="1"] .bsub'), "the switch is remembered on this device " + tag);
      await p.uncheck("#show-ev"); await prep(p);
      // Striped (limited-information) ratings have a key and a visible "limited" tag (Oct 26, 2026).
      const lk = await p.evaluate(() => [...document.querySelectorAll("article.prop")].map((c) => { const lim = c.querySelectorAll(".rgrid .dots.limited"); return { n: c.id, lim: lim.length, tags: c.querySelectorAll(".rgrid .ltag").length, key: !!c.querySelector(".rkey"), aria: [...lim].every((d) => /limited information$/.test(d.getAttribute("aria-label"))) }; }));
      ok(lk.some((x) => x.lim > 0) && lk.every((x) => x.tags === 0 && x.key === (x.lim > 0) && x.aria), "cards with striped ratings show the key once, with no extra tags, and screen readers still hear limited information " + tag);
      const al = await p.evaluate(() => { const c = document.querySelector("#prop-5 .rgrid"); const cols = {}; c.querySelectorAll(".rt").forEach((r) => { const d = r.querySelector(".dots"), x = Math.round(r.getBoundingClientRect().left); (cols[x] = cols[x] || []).push(Math.round(d.getBoundingClientRect().right)); }); return Object.values(cols).map((v) => Math.max(...v) - Math.min(...v)); });
      ok(al.every((d) => d <= 1), "rating dots line up on the right in each column " + tag + " " + JSON.stringify(al));
      const cw = await p.evaluate(() => [...document.querySelectorAll("details.calc")].map((d) => { d.open = true; const sc = d.querySelector(".calc-scroll"); const r = sc ? [sc.scrollWidth, sc.clientWidth] : [0, 0]; d.open = false; return r; }));
      ok(cw.every((r) => r[0] <= r[1] + 1), "every calculation table fits its column without sideways scrolling " + tag + " " + JSON.stringify(cw.filter((r) => r[0] > r[1] + 1)));
      // The card being worked on is highlighted, one at a time, and named in the sticky bar (Oct 26, 2026).
      const act = () => p.evaluate(() => ({ ids: [...document.querySelectorAll("article.prop.is-active")].map((a) => a.id), now: document.getElementById("now").hidden ? "" : document.getElementById("now").textContent, ring: getComputedStyle(document.querySelector("article.prop.is-active") || document.body).boxShadow, nav: [...document.querySelectorAll('#propnav a[aria-current="true"]')].map((a) => a.getAttribute("href")) }));
      await p.click('label[for="g-5-3"]'); let A = await act();
      ok(A.ids.join() === "prop-5" && A.now === "Prop 5" && A.ring !== "none", "answering Prop 5 highlights its whole card and names it in the sticky bar " + tag + " " + JSON.stringify(A.ids));
      await p.focus("#g-37-3"); await p.waitForTimeout(500); A = await act();
      ok(A.ids.join() === "prop-37" && A.now === "Prop 37", "keyboard focus moves the highlight to Prop 37 " + tag);
      await p.evaluate(() => { document.activeElement.blur(); const r = document.getElementById("prop-38").getBoundingClientRect(); window.scrollBy({ top: r.top - window.innerHeight * 0.2, behavior: "instant" }); }); await p.waitForTimeout(250); A = await act();
      ok(A.ids.join() === "prop-38" && A.now === "Prop 38", "scrolling to read Prop 38 moves the highlight there " + tag + " " + JSON.stringify(A.ids));
      await p.click('label[for="g-39-2"]'); await p.evaluate(() => { const r = document.getElementById("prop-41").getBoundingClientRect(); window.scrollBy({ top: r.top - window.innerHeight * 0.2, behavior: "instant" }); }); await p.waitForTimeout(250);
      A = await act(); ok(A.ids.join() === "prop-41" && A.now === "Prop 41", "after answering Prop 39 and scrolling on to Prop 41, the highlight follows " + tag + " " + JSON.stringify(A.ids));
      ok((await p.textContent("#prop-38 .result-h")).trim() === "Your answer · Prop 38", "the result heading names the proposition " + tag);
      await p.evaluate(() => { document.activeElement.blur(); window.scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(250);
      ok(await p.isHidden("#now"), "the sticky Prop label hides when no card is on screen " + tag);
      await p.click("#reset"); }
    // Percentages (Oct 24, 2026): shares from the actual weights, live updates, single factor, all zero, results and calculation.
    { await p.click('.preset[data-id="def"]');
      const fw = await p.$$eval(".fw-p", (e) => e.map((x) => x.textContent));
      ok(JSON.stringify(fw) === JSON.stringify(["29.41% of the total", "23.53% of the total", "17.65% of the total", "17.65% of the total", "11.76% of the total"]), "framework list shows default shares " + tag + ": " + fw.join(", "));
      ok((await T("#pct-ev")) === "29.4% of your weighting", "slider share " + tag);
      await p.fill("#w-ev", "0"); ok((await T("#pct-lr")) === "33.3% of your weighting" && /Not counted/.test(await T("#pct-ev")), "shares update immediately when a weight changes " + tag);
      for (const k of ["ev", "lr", "ac", "fc"]) await p.fill("#w-" + k, "0");
      ok((await T("#pct-if")) === "100.0% of your weighting", "single factor gets 100% " + tag);
      await p.fill("#w-if", "0");
      ok(/every factor is set to Ignore/.test(await T("#pct-ev")) && (await T("#pf-1")) === "" && /Evidence not weighted/.test(await T("#calc-1")), "all zero shows no shares, no profile and no score " + tag);
      await p.click('.preset[data-id="def"]');
      // Hand check, Standard weights. Prop 1: if 4 and fc 4 are strong, nothing is 2 or lower. Prop 40: ev, lr and if are 2.
      const pf = async (n) => p.$$eval("#pf-" + n + " .pf", (d) => d.map((x) => x.querySelector("b").textContent + ": " + x.querySelector("span").textContent));
      ok(JSON.stringify(await pf(1)) === JSON.stringify(["Strong on: Implementation readiness (4), Cost clarity (4)", "Weak on: No factor you weigh rates 2 or lower", "In the middle: Evidence strength (3), Low risk of side effects (3), Accountability and results (3)"]), "Prop 1 profile " + tag + " " + JSON.stringify(await pf(1)));
      ok(JSON.stringify(await pf(40)) === JSON.stringify(["Strong on: No factor you weigh rates 4 or higher", "Weak on: Evidence strength (2), Low risk of side effects (2), Implementation readiness (2)", "In the middle: Accountability and results (3), Cost clarity (3)"]), "Prop 40 profile " + tag);
      ok(JSON.stringify(await pf(2)).includes("Accountability and results (2.5)"), "a half-point rating is shown as 2.5 " + tag);
      ok(await p.evaluate(() => { const r = document.querySelector("#prop-1 .result"); const a = r.querySelector(".profile"), b = r.querySelector(".meter"); return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING; }), "the profile comes before the overall score " + tag);
      const rows = await p.$$eval("#all-pct tr", (r) => r.length); ok(rows === 14, "all 14 propositions in the calculation table " + tag);
      const pts = await p.$$eval("#calc-1 tbody td:last-child", (t) => t.map((x) => parseFloat(x.textContent)));
      ok(pts.length === 5 && Math.abs(pts.reduce((a, b) => a + b, 0) - 65.88) < 0.02 && (await T("#calc-1 tfoot td:last-child")) === "65.88", "contributions add up to the exact percentage (56/17/5 = 65.88%) " + tag);
      ok(/Your answer\. (Not answered yet|.*never changes it)/.test(await T("#calc-1")), "answer kept separate in the calculation " + tag);
      ok(/Importance 29\.41% × rating 3\/5 = 17\.65 points/.test(await T("#hs-ex")), "worked example " + tag);
      await p.fill("#w-fc", "5"); await p.reload(); await prep(p);
      ok((await T("#pct-fc")) === BWfmt(500 / 20) + "% of your weighting", "saved weights restore with their shares " + tag);
      await p.click('.preset[data-id="def"]'); }
    { const t = (await p.textContent("[data-credit]")).replace(/\s+/g, " ");
      ok(/Developed by Supriya Rajeev for educational purposes\./.test(t) && /An independent civic-tech project/.test(t) && (await p.$$eval("[data-credit] a", (as) => as.map((a) => a.href))).includes("https://www.sos.ca.gov/elections"), "tool footer credit and official link " + tag); }
    // overflow, with every disclosure open
    await p.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, "no horizontal overflow " + tag);
    // links
    const links = await p.$$eval(".srcs a, a.ref, .method a", (as) => as.map((a) => [a.href, a.target, a.rel]));
    ok(links.length > 0 && links.every((l) => l[0].startsWith("https://") && l[1] === "_blank" && l[2].includes("noopener")), "links https new tab " + tag);
    if (w === 1280 && process.env.LINKS_OUT) fs.writeFileSync(process.env.LINKS_OUT, [...new Set(links.map((l) => l[0]))].join("\n") + "\n");
    // axe
    await p.addScriptTag({ path: AXE });
    const ax = await p.evaluate(async () => { const r = await axe.run(document, { resultTypes: ["violations"] }); return r.violations.map((v) => v.id + " (" + v.impact + ") x" + v.nodes.length + " " + v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")); });
    ok(ax.length === 0, "axe violations " + tag + ": " + ax.join("; "));
    // console errors and external hosts fail the suite (VAL-13)
    ok(errs.length === 0, "console errors " + tag + ": " + errs.join(" | "));
    ok([...hosts].every((h) => ALLOWED_HOSTS.has(h)), "unexpected external hosts " + tag + ": " + [...hosts].filter((h) => !ALLOWED_HOSTS.has(h)).join(", "));
    console.log(tag, "external hosts requested (blocked in test):", [...hosts].join(", ") || "none");
    await ctx.close();
  }
  // Touch phones (Oct 26, 2026): tap each choice at 320 and 390 px with touch events, and check the layout.
  for (const w of [320, 390]) {
    const tag = `@${w} touch`;
    const ctx = await b.newContext({ viewport: { width: w, height: 760 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); const errs = []; watchErrors(p, errs); await blockExternal(p, new Set());
    await p.goto(URL_); await p.waitForSelector("article.prop");
    const T = async (s) => (await p.textContent(s)).trim();
    const geo = await p.$$eval("#prop-38 .pill span", (s) => s.map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), Math.round(r.left), Math.round(r.right), x.scrollWidth <= x.clientWidth]; }));
    ok(geo.every((g) => g[0] === geo[0][0] && g[1] >= 44 && g[2] >= 0 && g[3] <= w && g[4]), "three buttons in one row inside the screen, 44px or taller, no clipped text " + tag + " " + JSON.stringify(geo));
    ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, "no sideways scrolling " + tag);
    for (const [id, said, res] of [["g-38-3", "Yes", "Yes"], ["g-38-2", "Not sure", "Not sure"], ["g-38-1", "No", "No"], ["g-38-3", "Yes", "Yes"]]) {
      await p.locator('label[for="' + id + '"]').scrollIntoViewIfNeeded(); await p.tap('label[for="' + id + '"]');
      const sel = await p.$$eval('input[name="g-38"]', (r) => r.filter((x) => x.checked).map((x) => x.id));
      const tick = await p.$eval('label[for="' + id + '"] .tick', (t) => getComputedStyle(t).display);
      ok(sel.join() === id && tick !== "none", "tap " + said + " selects it alone and shows the check mark " + tag);
      ok((await T("#v-38")) === res && (await T('#ballot .b-row[data-n="38"] .chip')) === res, "tap " + said + " shows " + res + " on the card and in Step 3 " + tag);
    }
    await p.tap('label[for="g-39-2"]');
    ok((await T("#ans-n")) === "2" && (await T("#tally")).includes("Not sure 1"), "tapped Not sure counts as answered and as Not sure " + tag);
    await p.reload(); await p.waitForSelector("article.prop");
    ok((await p.isChecked("#g-38-3")) && (await p.isChecked("#g-39-2")) && (await T("#ans-n")) === "2", "taps survive a refresh " + tag);
    await p.locator("#clr-38").scrollIntoViewIfNeeded(); await p.tap("#clr-38");
    ok(!(await p.isChecked("#g-38-3")) && (await T("#v-38")) === "Not answered" && (await T("#ans-n")) === "1", "tap Clear answer " + tag);
    await p.locator("#prop-41 .pills").scrollIntoViewIfNeeded(); await p.tap('label[for="g-41-3"]');
    ok((await p.evaluate(() => document.querySelector("#prop-41").classList.contains("is-active") && document.getElementById("now").textContent === "Prop 41")) && (await p.evaluate(() => document.documentElement.scrollWidth)) <= w, "tapping Prop 41 highlights it and the sticky bar still fits " + tag);
    const sticky = await p.evaluate(() => document.querySelector(".sticky").getBoundingClientRect().height);
    ok(sticky <= 70, "sticky bar stays compact (" + Math.round(sticky) + "px) " + tag);
    ok(errs.length === 0, "console errors " + tag + ": " + errs.join(" | "));
    await ctx.close();
  }
  await b.close();
  process.exit(done() ? 1 : 0);
})().catch((e) => { console.log("FAIL weighing tool suite crashed:", e.message); process.exit(1); });
