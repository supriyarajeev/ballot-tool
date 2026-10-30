/* Shared percentage arithmetic for the evidence framework (Oct 24, 2026; five factors since Oct 29, 2026).
   Used for display only: by the Ballot Weighing Tool (propositions.html) to explain its existing scores, and by the
   guide's candidate evaluation mode. It never decides a lean. The tool's own scoring functions (quality, lean) are
   unchanged and remain the source of every score and lean.

   The tool's existing evidence score is a weighted average of 1-to-5 ratings:
     average = sum(weight x rating) / sum(weight), over factors with weight above 0 AND a valid rating,
     then rounded to one decimal and kept between 1 and 5.
   As a percentage of the top rating (5), that is average / 5 x 100. Each factor contributes
     weight / (sum of weights of the rated, weighted factors) x rating / 5 x 100 percentage points,
   and the contributions add up to the unrounded percentage. */
(function (root) {
  "use strict";
  var KEYS = ["ev", "lr", "ac", "if", "fc"];
  var DEFAULT = { ev: 5, lr: 4, ac: 3, if: 3, fc: 2 };
  var STORE = "ballot-weighing-v2"; // the tool's saved state; read only here

  function validRating(r) { return typeof r === "number" && r >= 1 && r <= 5; }
  function total(w) { var t = 0; KEYS.forEach(function (k) { t += +w[k] || 0; }); return t; }

  // Share of the voter's total weighting for each factor, in percent. Returns null shares when every weight is 0.
  function shares(w) {
    var t = total(w), out = {};
    KEYS.forEach(function (k) { out[k] = t > 0 ? (100 * (+w[k] || 0)) / t : null; });
    return { total: t, pct: out };
  }

  // Weighted result for one set of ratings ({k: 1..5 or missing}). Missing or invalid ratings are left out and the
  // remaining weights are rescaled, which is what the tool already does. Nothing is ever counted as 0 or 5.
  function weighted(ratings, w) {
    var used = 0, sum = 0, rows = [];
    KEYS.forEach(function (k) {
      var wk = +w[k] || 0, r = ratings ? ratings[k] : undefined;
      rows.push({ k: k, weight: wk, rating: validRating(r) ? r : null, counted: wk > 0 && validRating(r) });
      if (wk > 0 && validRating(r)) { used += wk; sum += wk * r; }
    });
    if (used === 0) return { off: true, rows: rows, weightTotal: total(w), weightUsed: 0 };
    rows.forEach(function (row) {
      row.share = row.counted ? (100 * row.weight) / used : 0;
      row.points = row.counted ? (100 * row.weight * row.rating) / (used * 5) : 0;
    });
    var exact = sum / used;
    var avg = Math.min(5, Math.max(1, Math.round(exact * 10) / 10)); // the tool's own rounding
    return { off: false, rows: rows, exactAverage: exact, exactPercent: (exact / 5) * 100, average: avg, percent: Math.round(avg * 20), weightTotal: total(w), weightUsed: used };
  }

  // The voter's saved weights from the tool, if any and valid; otherwise the standard weights.
  function savedWeights() {
    var w = {};
    KEYS.forEach(function (k) { w[k] = DEFAULT[k]; });
    try {
      var s = JSON.parse(root.localStorage.getItem(STORE) || "null");
      if (s && s.w) KEYS.forEach(function (k) { var v = s.w[k]; if (typeof v === "number" && v >= 0 && v <= 5) w[k] = Math.round(v); });
      return { w: w, saved: !!(s && s.w) };
    } catch (e) { return { w: w, saved: false }; }
  }

  function fmt(x, d) { return x === null || x === undefined ? "" : (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }

  root.BallotWeights = { KEYS: KEYS, DEFAULT: DEFAULT, total: total, shares: shares, weighted: weighted, savedWeights: savedWeights, validRating: validRating, fmt: fmt };
})(typeof window !== "undefined" ? window : globalThis);
