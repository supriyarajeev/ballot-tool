// One-time generator for data/bay-map.json (not part of npm run build; needs its own install):
//   npm i --no-save us-atlas@3.0.1 topojson-client@3.1.0 d3-geo@3.1.1 && node tools/build-map.mjs
// It writes bay-map.json in the current folder. The San Francisco label was then moved off the county by hand (labelAnchor, leader), and the San Mateo label was right-aligned so Santa Clara does not cover it.
import fs from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
const topo = JSON.parse(fs.readFileSync(new URL("../node_modules/us-atlas/counties-10m.json", import.meta.url), "utf8"));
const all = feature(topo, topo.objects.counties).features;
const FIPS = { "06001": "ca-alameda", "06013": "ca-contra-costa", "06041": "ca-marin", "06055": "ca-napa", "06075": "ca-sf", "06081": "ca-san-mateo", "06085": "ca-santa-clara", "06095": "ca-solano", "06097": "ca-sonoma" };
const bay = all.filter((f) => FIPS[f.id]);
const ctx = all.filter((f) => String(f.id).startsWith("06") && !FIPS[f.id]);
const W = 400, H = 440;
const fc = { type: "FeatureCollection", features: bay };
const proj = geoMercator().fitExtent([[8, 8], [W - 8, H - 8]], fc);
const path = geoPath(proj).digits(1);
const out = { schemaVersion: 1, viewBox: `0 0 ${W} ${H}`,
  source: { publisher: "U.S. Census Bureau", title: "Cartographic boundary files, counties, 2017 edition, 1:10,000,000 scale (redistributed as TopoJSON in the us-atlas package, version 3.0.1)", url: "https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html", note: "Generalized outlines for orientation only. Not for locating an address or a district line. Projected with d3-geo 3.1.1 (Mercator, fitted to the nine counties)." },
  counties: bay.map((f) => { const [x, y] = proj(geoCentroid(f)); return { id: FIPS[f.id], fips: f.id, name: f.properties.name, d: path(f), label: [Math.round(x), Math.round(y)] }; }).sort((a, b) => a.id.localeCompare(b.id)),
  context: ctx.map((f) => path(f)).filter((d) => d && !/NaN/.test(d)) };
// keep only context shapes that intersect the frame
out.context = out.context.filter((d) => { const n = d.match(/-?\d+(\.\d+)?/g).map(Number); for (let i = 0; i < n.length; i += 2) if (n[i] > -20 && n[i] < W + 20 && n[i + 1] > -20 && n[i + 1] < H + 20) return true; return false; });
fs.writeFileSync("bay-map.json", JSON.stringify(out));
console.log(out.counties.map((c) => c.name + " " + c.label + " " + c.d.length).join("\n"), "\ncontext", out.context.length, "bytes", fs.statSync("bay-map.json").size);
