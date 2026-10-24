// Starts a small local static server for the site, runs the browser suites, then stops the server.
//   node tests/browser/run.mjs                       all suites
//   node tests/browser/run.mjs weighing goatcounter  only the named suites (guide, weighing, goatcounter)
// Environment: PORT (default 8765). Needs a Chromium for Playwright; see README "Testing".
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PORT = +(process.env.PORT || 8765);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".cjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".txt": "text/plain", ".md": "text/plain" };
const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch (e) { res.writeHead(400); return res.end("bad request"); }
  const file = path.join(root, p.endsWith("/") ? p + "index.html" : p);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r, j) => { server.once("error", j); server.listen(PORT, "127.0.0.1", r); });
const SUITES = { guide: "guide.test.cjs", weighing: "weighing-tool.test.cjs", goatcounter: "goatcounter.test.cjs" };
const pick = process.argv.slice(2).filter((a) => SUITES[a]);
let code = 0;
for (const name of pick.length ? pick : Object.keys(SUITES)) {
  // Async spawn, so this process keeps serving pages while the test runs.
  const status = await new Promise((res) => spawn(process.execPath, [path.join(root, "tests/browser", SUITES[name])], { stdio: "inherit", env: { ...process.env, BASE: `http://127.0.0.1:${PORT}/` } }).on("exit", res));
  if (status !== 0) { code = 1; console.log(`browser suite "${name}" failed (exit ${status})`); }
}
server.close();
process.exit(code);
