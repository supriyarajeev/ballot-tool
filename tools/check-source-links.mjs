#!/usr/bin/env node
// Checks every source link in the Ballot Weighing Tool (propositions.html), including the alternate PDF links.
//   node tools/check-source-links.mjs            # prints a table, exits 1 if any link fails
//   node tools/check-source-links.mjs --json out.json
// Needs internet access. A link passes only when the destination actually has content:
//   PDF   → HTTP 200, starts with %PDF-, more than 10 KB
//   HTML  → HTTP 200, more than 1,500 characters of text, and for official Secretary of State pages
//           the page text names the right proposition ("Proposition N")
// A redirect is reported (the tool should link the final address). Paywalls and cookie walls cannot be detected
// reliably by a script, so independent sources should still be opened by a person before a release.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "propositions.html"), "utf8");
const pre = html.slice(html.indexOf("  var LAO = "), html.indexOf("  var PROPS = ["));
let i = html.indexOf("[", html.indexOf("  var PROPS = [")), depth = 0, j = i;
for (; j < html.length; j++) { if (html[j] === "[") depth++; else if (html[j] === "]" && --depth === 0) break; }
const PROPS = new Function(pre + "\nreturn " + html.slice(i, j + 1) + ";")();

const links = [];
for (const p of PROPS) p.src.forEach((s, k) => {
  links.push({ n: p.n, title: p.name, k: k + 1, label: s[0], role: s[2], url: s[1] });
  if (s[3]) links.push({ n: p.n, title: p.name, k: k + 1, label: s[0] + " (" + (s[4] || "PDF") + ")", role: s[2], url: s[3] });
});

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
async function check(l) {
  try {
    const r = await fetch(l.url, { redirect: "follow", headers: { "user-agent": UA, accept: "text/html,application/pdf,*/*" } });
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get("content-type") || "";
    const redirected = r.url.replace(/\/$/, "") !== l.url.replace(/\/$/, "") ? r.url : "";
    if (r.status !== 200) return { ...l, result: "Broken", detail: `HTTP ${r.status}`, redirected };
    if (/pdf/i.test(ct) || /\.pdf$/i.test(l.url)) {
      const ok = buf.slice(0, 5).toString() === "%PDF-" && buf.length > 10240;
      return { ...l, result: ok ? "Working" : "Blank or rendering failure", detail: `${ct}, ${buf.length} bytes${ok ? "" : ", not a usable PDF"}`, redirected };
    }
    const text = buf.toString("utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const official = /sos\.ca\.gov/.test(l.url);
    const names = new RegExp("Proposition " + l.n + "\\b").test(text);
    const ok = text.length > 1500 && (!official || names);
    return { ...l, result: ok ? "Working" : "Blank or rendering failure", detail: `${ct.split(";")[0]}, ${text.length} chars of text${official ? (names ? ", names Proposition " + l.n : ", does not name Proposition " + l.n) : ""}`, redirected };
  } catch (e) { return { ...l, result: "Unverified", detail: "request failed: " + e.message, redirected: "" }; }
}

const out = [];
for (const l of links) out.push(await check(l));
const bad = out.filter((x) => x.result !== "Working");
for (const x of out) console.log([`Prop ${x.n}`, `[${x.k}] ${x.label}`, x.result, x.detail, x.redirected ? "redirects to " + x.redirected : "", x.url].filter(Boolean).join(" | "));
console.log(`\n${out.length} links checked: ${out.length - bad.length} working, ${bad.length} not working or unverified, ${out.filter((x) => x.redirected).length} redirecting.`);
const ji = process.argv.indexOf("--json");
if (ji > 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify(out, null, 1));
process.exit(bad.length ? 1 : 0);
