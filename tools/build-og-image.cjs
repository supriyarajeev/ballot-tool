// Renders tools/og-image.html to assets/og-image.png at 1200 x 630 (Oct 29, 2026).
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto("file://" + path.join(__dirname, "og-image.html"));
  await p.screenshot({ path: path.join(__dirname, "..", "assets", "og-image.png") });
  await b.close();
  console.log("wrote assets/og-image.png");
})();
