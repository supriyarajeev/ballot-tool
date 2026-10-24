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

(async () => {
  const b = await chromium.launch();
  for (const [w, scheme] of [[1280, "light"], [768, "dark"], [360, "light"], [360, "dark"]]) {
    const tag = `@${w} ${scheme}`;
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
    const p = await ctx.newPage();
    const errs = [], hosts = new Set();
    watchErrors(p, errs);
    await blockExternal(p, hosts);
    await p.goto(URL_);
    await p.evaluate(() => { const d = document.getElementById("customize"); if (d) d.open = true; });
    const T = async (s) => (await p.textContent(s)).trim();
    ok((await p.locator("article.prop").count()) === 14, "14 cards " + tag);
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
    const exp = { 0: "Leans toward NO", 1: "Leans toward NO", 2: "Not sure" };
    for (const k of [0, 1, 2]) { await p.click(`label[for="g-1-${k}"]`); ok((await T("#v-1")) === exp[k], "pref state " + k + " " + tag); }
    await p.click('label[for="g-1-3"]'); ok(/^\d\.\d of 5/.test(await T("#q-1")), "q format " + tag);
    // The scoring math itself is checked against the original tool by tests/scoring-regression.mjs.
    // card vs summary agreement
    const agree = async () => { for (const n of NS) { const v = await T("#v-" + n); const chip = await p.textContent(`#ballot a[data-n="${n}"] .chip`); if (v !== chip.trim()) return n; } return true; };
    ok((await agree()) === true, "card/summary agree 1 " + tag);
    // weights change after answering
    await p.click('label[for="g-38-3"]'); const before = await T("#q-38"); await p.fill("#w-nb", "0"); const after = await T("#q-38"); ok(before !== after, "weight change updates " + tag);
    ok((await agree()) === true, "card/summary agree 2 " + tag);
    // all zero
    for (const k of ["nb", "ev", "lr", "ac", "if", "fc", "oc"]) await p.fill("#w-" + k, "0");
    ok(await p.isVisible("#zero"), "zero note " + tag);
    ok((await T("#q-38")) === "Evidence not weighted" && (await p.textContent('#ballot a[data-n="38"] .bsub')).includes("Evidence not weighted"), "zero not weighted " + tag);
    ok((await T("#v-38")) === "Leans toward YES", "zero pref only " + tag);
    ok(!/NaN|Infinity/.test(await p.evaluate(() => document.body.innerText)), "no NaN " + tag);
    ok((await agree()) === true, "card/summary agree zero " + tag);
    await p.click("#zero-reset"); ok((await p.inputValue("#w-nb")) === "5" && !(await p.isVisible("#zero")), "reset defaults " + tag);
    // slider handler: the value set on a slider is what is saved and restored (VAL-12)
    for (const v of ["0", "2", "5"]) {
      await p.fill("#w-ev", v);
      const saved = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem("ballot-weighing-v2")).w.ev; } catch (e) { return "unreadable"; } });
      ok(saved === +v, `slider sets weight ev=${v} (saved ${saved}) ${tag}`);
    }
    await p.reload(); await p.evaluate(() => { const d = document.getElementById("customize"); if (d) d.open = true; });
    ok((await p.inputValue("#w-ev")) === "5", "slider value survives reload " + tag);
    // saved-weight clamp: out-of-range stored values are ignored on load
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("ballot-weighing-v2")); s.w.nb = 7; s.w.ev = 2.6; localStorage.setItem("ballot-weighing-v2", JSON.stringify(s)); });
    await p.reload(); await p.evaluate(() => { const d = document.getElementById("customize"); if (d) d.open = true; });
    ok((await p.inputValue("#w-nb")) === "5", "out-of-range saved weight ignored " + tag);
    ok((await p.inputValue("#w-ev")) === "3", "fractional saved weight rounded " + tag);
    await p.click('.preset[data-id="def"]');
    // clear answers keeps weights
    await p.click('.preset[data-id="eq"]'); await p.click("#reset"); ok((await T("#tally")).includes("Not answered 14"), "clear answers " + tag); ok((await p.getAttribute('.preset[data-id="eq"]', "aria-pressed")) === "true", "clear keeps weights " + tag);
    // partial + persistence
    await p.click('label[for="g-40-4"]'); await p.click('label[for="g-41-3"]'); await p.click('label[for="g-5-2"]');
    ok(await p.isVisible("#conflict"), "conflict shown " + tag);
    await p.reload(); await p.evaluate(() => { const d = document.getElementById("customize"); if (d) d.open = true; });
    ok((await T("#pf-40")) === "Strongly support" && (await T("#pf-5")) === "Not sure" && (await T("#pf-1")) === "Not answered", "persist answers " + tag);
    ok((await p.getAttribute('.preset[data-id="eq"]', "aria-pressed")) === "true", "persist weights " + tag);
    // limited caution: Prop 4 with only fc weighted
    for (const k of ["nb", "ev", "lr", "ac", "if", "oc"]) await p.fill("#w-" + k, "0"); await p.fill("#w-fc", "3"); await p.click('label[for="g-4-3"]');
    ok(await p.isVisible("#c-4"), "caution shown " + tag); ok(!(await p.isVisible("#c-1")), "caution hidden when not limited " + tag);
    // keyboard: tab to a pill and select with space
    await p.focus("#g-2-3"); await p.keyboard.press("Space"); ok((await T("#pf-2")) === "Support", "keyboard select " + tag);
    await p.keyboard.press("ArrowRight"); ok((await T("#pf-2")) === "Strongly support", "arrow key " + tag);
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
  await b.close();
  process.exit(done() ? 1 : 0);
})().catch((e) => { console.log("FAIL weighing tool suite crashed:", e.message); process.exit(1); });
