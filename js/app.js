const { useState, useEffect, useMemo, useRef } = React;
if (typeof window.structuredClone !== "function") {
  window.structuredClone = (o) => JSON.parse(JSON.stringify(o));
}
if (typeof DATA_OK === "undefined" || typeof HANZI === "undefined") {
  document.getElementById("root").innerHTML = '<div style="font-family:sans-serif;max-width:560px;margin:60px auto;padding:24px;background:#FFF3F1;border:3px solid #C8432F;border-radius:16px;line-height:1.8"><h2 style="margin:0 0 10px">\u26A0\uFE0F \u8CC7\u6599\u6A94 data.js \u4E0D\u5B8C\u6574</h2><p><b>\u539F\u56E0:</b>\u4E0A\u50B3\u5230 GitHub \u6642\u6A94\u6848\u88AB\u622A\u65B7\u4E86(\u5E38\u898B\u65BC\u7528\u300C\u8907\u88FD\u8CBC\u4E0A\u300D\u65B9\u5F0F\u7DE8\u8F2F,\u5C24\u5176\u5728\u624B\u6A5F\u4E0A)\u3002</p><p><b>\u89E3\u6CD5:</b>\u5230 GitHub repo \u2192 <b>Add file \u2192 Upload files</b> \u2192 \u9078\u53D6\u5B8C\u6574\u7684 <code>js/data.js</code> \u6A94\u6848\u4E0A\u50B3\u8986\u84CB(\u4E0D\u8981\u8CBC\u5167\u5BB9),\u518D Commit\u3002</p><p><b>\u6838\u5C0D:</b>\u4E0A\u50B3\u5F8C\u9EDE\u958B GitHub \u4E0A\u7684 data.js,\u9801\u9762\u9802\u7AEF\u6703\u986F\u793A\u884C\u6578\u2014\u2014\u5B8C\u6574\u7248\u672C\u61C9\u63A5\u8FD1\u5169\u5343\u884C;\u82E5\u53EA\u6709\u5E7E\u767E\u884C\u5C31\u662F\u53C8\u88AB\u622A\u65B7\u4E86\u3002</p></div>';
  throw new Error("data.js incomplete \u2014 re-upload the full file");
}
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (a) => a[ri(0, a.length - 1)];
const shuffle = (a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};
const HAN = (s) => (String(s).match(/[\u4e00-\u9fff]/g) || []).length;
function enrichWhy(why, extra, coda) {
  const base = Array.isArray(why) ? why : [String(why)];
  const isEN = (l) => String(l).trim().startsWith("EN:");
  let out = [
    ...base.filter((l) => !isEN(l)),
    ...(extra || []).filter((l) => !isEN(l)),
    ...base.filter(isEN),
    ...(extra || []).filter(isEN)
  ];
  if (coda && out.reduce((t, l) => t + HAN(l), 0) < 200) {
    out.push(coda);
  }
  return out;
}
function mc(q, en, answer, distractors, why) {
  const seen = /* @__PURE__ */ new Set([String(answer)]);
  const ds = [];
  for (const d of distractors) {
    if (!seen.has(String(d))) {
      seen.add(String(d));
      ds.push(d);
    }
  }
  let bump = 1;
  while (ds.length < 3 && typeof answer === "number" && bump < 60) {
    for (const cand of [answer + bump, answer - bump]) {
      if (ds.length < 3 && cand >= 0 && !seen.has(String(cand))) {
        seen.add(String(cand));
        ds.push(cand);
      }
    }
    bump++;
  }
  const opts = shuffle([answer, ...ds.slice(0, 3)]);
  return { q, en, options: opts.map(String), ans: opts.indexOf(answer), why };
}
function fi(q, en, answer, distractors, why, fig) {
  const o = mc(q, en, answer, distractors, why);
  const s = String(answer);
  if (/^-?\d+(\.\d+)?$/.test(s) || /^\d+\/\d+$/.test(s)) {
    o.mode = "input";
    o.answer = s;
  }
  if (fig) o.fig = fig;
  return o;
}
const SVG = (inner, vb = "0 0 120 100") => `<svg viewBox="${vb}" class="geosvg" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const gLabel = (x, y, t) => `<text x="${x}" y="${y}" class="glab">${t}</text>`;
const GEO = {
  trapezoid: (top, bot, h) => SVG(`<polygon points="34,26 86,26 104,76 16,76" class="gshape"/>` + gLabel(60, 20, top) + gLabel(60, 90, bot) + `<line x1="12" y1="26" x2="12" y2="76" class="gdash"/>` + gLabel(6, 54, h)),
  anglecmp: (deg) => {
    const ex = (24 + 72 * Math.cos(-deg * Math.PI / 180)).toFixed(1), ey = (76 - 72 * Math.sin(deg * Math.PI / 180)).toFixed(1);
    const ax = (24 + 20 * Math.cos(-deg * Math.PI / 180)).toFixed(1), ay = (76 - 20 * Math.sin(deg * Math.PI / 180)).toFixed(1);
    return SVG(`<line x1="24" y1="76" x2="100" y2="76" class="gline"/><line x1="24" y1="76" x2="${ex}" y2="${ey}" class="gline"/><path d="M44,76 A20,20 0 0,0 ${ax},${ay}" class="gang"/>` + gLabel(52, 68, deg + "\xB0"));
  },
  sector: (deg, r, label) => {
    const rad = deg * Math.PI / 180;
    const ex = 60 + 38 * Math.cos(-rad), ey = 50 - 38 * Math.sin(rad);
    const large = deg > 180 ? 1 : 0;
    return SVG(`<path d="M60,50 L98,50 A38,38 0 ${large},0 ${ex.toFixed(1)},${ey.toFixed(1)} Z" class="gshape"/>` + gLabel(66, 44, deg + "\xB0") + gLabel(82, 64, label));
  },
  symmetry: (shape) => SVG(shape + `<line x1="60" y1="10" x2="60" y2="90" class="gdash"/>` + gLabel(60, 7, "?")),
  coord: (x, y) => SVG(`<line x1="14" y1="86" x2="112" y2="86" class="gline"/><line x1="20" y1="92" x2="20" y2="14" class="gline"/><circle cx="${20 + x * 11}" cy="${86 - y * 11}" r="3.5" class="gdot"/>` + gLabel(20 + x * 11, 86 - y * 11 - 6, `(?,?)`) + gLabel(108, 94, "x") + gLabel(14, 18, "y"), "0 0 120 100"),
  rect: (w, h, uw, uh) => SVG(`<rect x="18" y="24" width="84" height="52" class="gshape"/>` + gLabel(60, 20, uw) + gLabel(110, 52, uh)),
  square: (u) => SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>` + gLabel(60, 14, u)),
  triangle: (a, b, showThird) => SVG(`<polygon points="20,78 100,78 55,22" class="gshape"/><path d="M32,78 A14,14 0 0,1 40,68" class="gang"/>` + gLabel(30, 73, a + "\xB0") + `<path d="M88,78 A14,14 0 0,0 80,68" class="gang"/>` + gLabel(84, 73, b + "\xB0") + gLabel(54, 44, showThird ? "?" : "")),
  rtri: (base, height) => SVG(`<polygon points="20,80 20,20 92,80" class="gshape"/><rect x="20" y="70" width="10" height="10" class="gright"/>` + gLabel(12, 52, height) + gLabel(56, 92, base)),
  circle: (r, label) => SVG(`<circle cx="60" cy="50" r="34" class="gshape"/><line x1="60" y1="50" x2="94" y2="50" class="gline"/><circle cx="60" cy="50" r="2.5" class="gdot"/>` + gLabel(74, 46, label)),
  Lshape: (inner) => SVG(`<polygon points="20,20 70,20 70,50 100,50 100,80 20,80" class="gshape"/>` + inner),
  compound: (a, b, c, d) => SVG(`<polygon points="20,20 ${20 + a},20 ${20 + a},${20 + d} ${20 + a + c},${20 + d} ${20 + a + c},80 20,80" class="gshape"/>` + gLabel(20 + a / 2, 15, ""))
};
function nearNums(ans, spread) {
  const s = /* @__PURE__ */ new Set();
  while (s.size < 3) {
    const d = ans + pick([-1, 1]) * ri(1, spread);
    if (d !== ans && d >= 0) s.add(d);
  }
  return [...s];
}
const MATH_TOPICS = {
  /* v21 起與 MATH_GEN 逐索引對齊:MATH_TOPICS[lv][i] = MATH_GEN[lv][i] 的題型名(復仇戰依索引重生成) */
  1: ["20 \u4EE5\u5167\u52A0\u6CD5 Add within 20", "20 \u4EE5\u5167\u6E1B\u6CD5 Subtract within 20", "\u6BD4\u5927\u5C0F Compare numbers", "\u6578\u5217\u5075\u63A2 Sequence detective", "\u9006\u5411\u5DE5\u7A0B Find the missing number", "\u751F\u6D3B\u61C9\u7528\u984C Word problems", "\u{1F3C6} \u5967\u6578:\u6392\u968A\u9677\u9631 Line-up trap", "\u{1F3C6} \u5967\u6578:\u5716\u5F62\u9031\u671F Shape cycles", "\u9322\u5E63\u8A08\u7B97 Coin counting", "\u5169\u6B65\u9A5F\u63A8\u7406 Two-step stories", "\u{1F4D0} \u5E7E\u4F55:\u6578\u65B9\u683C Count squares", "\u{1F4D0} \u5E7E\u4F55:\u6B63\u65B9\u5F62\u5468\u9577 Square perimeter", "\u{1F4D0} \u5E7E\u4F55:\u6578\u908A\u5F62 Count sides", "\u{1F4D0} \u5E7E\u4F55:\u65B9\u683C\u9663\u5217 Square grids", "\u{1F4D0} \u5E7E\u4F55:\u591A\u908A\u5F62\u5075\u63A2 Polygon detective", "\u{1F4D0} \u5E7E\u4F55:\u9577\u5EA6\u6BD4\u8F03 Compare lengths"],
  2: ["\u4E8C\u4F4D\u6578\u52A0\u6CD5 Two-digit addition", "\u4E8C\u4F4D\u6578\u6E1B\u6CD5 Two-digit subtraction", "\u4E5D\u4E5D\u4E58\u6CD5 Times tables", "\u500D\u589E\u6578\u5217 Doubling sequences", "\u8CB7\u6771\u897F Money problems", "\u4E58\u6CD5\u9006\u5411 Reverse multiplication", "\u{1F3C6} \u5967\u6578:\u690D\u6A39\u554F\u984C Fencepost problem", "\u{1F3C6} \u5967\u6578:\u6578\u5B57\u5075\u63A2 Digit detective", "\u5E73\u5206\u554F\u984C Equal sharing", "\u55AE\u4F4D\u63DB\u7B97 Unit conversion", "\u{1F4D0} \u5E7E\u4F55:\u9577\u65B9\u5F62\u9762\u7A4D Rectangle area", "\u{1F4D0} \u5E7E\u4F55:\u9577\u65B9\u5F62\u5468\u9577 Rectangle perimeter", "\u{1F4D0} \u5E7E\u4F55:\u5E73\u89D2\u62C6\u89E3 Angles on a line", "\u{1F4D0} \u5E7E\u4F55:\u9762\u7A4D\u6210\u9577 Growing area", "\u{1F4D0} \u5E7E\u4F55:\u62FC\u5716\u7D44\u5408 Shape combining", "\u{1F4D0} \u5E7E\u4F55:\u5468\u9577\u9006\u63A8 Reverse perimeter"],
  3: ["\u4E58\u6CD5\u904B\u7B97 Multiplication", "\u9664\u6CD5\u904B\u7B97 Division", "\u5206\u6578\u5165\u9580 Fraction basics", "\u9918\u6578\u5075\u63A2 Remainder detective", "\u6642\u9593\u8A08\u7B97 Time math", "\u5468\u9577 Perimeter", "\u{1F3C6} \u5967\u6578:\u96DE\u5154\u540C\u7C60 Chickens and rabbits", "\u{1F3C6} \u5967\u6578:\u661F\u671F\u9031\u671F Weekday cycles", "\u4E09\u4F4D\u6578\u8A08\u7B97 Three-digit math", "\u55AE\u4F4D\u63DB\u7B97 Unit conversion", "\u{1F4D0} \u5E7E\u4F55:\u4E09\u89D2\u5F62\u5167\u89D2 Triangle angles", "\u{1F4D0} \u5E7E\u4F55:\u4E09\u89D2\u5F62\u9762\u7A4D Triangle area", "\u{1F4D0} \u5E7E\u4F55:\u68AF\u5F62\u9762\u7A4D Trapezoid area", "\u{1F4D0} \u5E7E\u4F55:\u6B63\u4E09\u89D2\u5F62\u5468\u9577 Equilateral perimeter", "\u{1F4D0} \u5E7E\u4F55:\u9762\u7A4D\u9006\u63A8 Reverse area", "\u{1F4D0} \u5E7E\u4F55:\u7B49\u8170\u4E09\u89D2\u5F62 Isosceles angles"],
  4: ["\u591A\u4F4D\u6578\u4E58\u6CD5 Multi-digit multiplication", "\u540C\u5206\u6BCD\u5206\u6578 Same-denominator fractions", "\u9762\u7A4D Area", "\u4E09\u89D2\u5F62\u5167\u89D2 Triangle angles", "\u5C0F\u6578\u52A0\u6CD5 Decimal addition", "\u905E\u589E\u6578\u5217 Accelerating sequences", "\u{1F3C6} \u5967\u6578:\u9AD8\u65AF\u6C42\u548C Gauss summation", "\u{1F3C6} \u5967\u6578:\u548C\u5DEE\u554F\u984C Sum and difference", "\u500D\u6578\u95DC\u4FC2 Times-as-many", "\u5C0F\u6578\u6E1B\u6CD5 Decimal subtraction", "\u{1F4D0} \u5E7E\u4F55:\u8907\u5408\u9762\u7A4D Compound area", "\u{1F4D0} \u5E7E\u4F55:\u88DC\u89D2 Supplementary angles", "\u{1F4D0} \u5E7E\u4F55:\u5C0D\u7A31\u93E1\u5C04 Mirror symmetry", "\u{1F4D0} \u5E7E\u4F55:\u534A\u5F91\u8207\u76F4\u5F91 Radius and diameter", "\u{1F4D0} \u5E7E\u4F55:\u6B63\u591A\u908A\u5F62 Regular polygons", "\u{1F4D0} \u5E7E\u4F55:\u76F8\u6846\u6316\u6D1E Frame area"],
  5: ["\u7570\u5206\u6BCD\u5206\u6578 Unlike fractions", "\u5C0F\u6578\u904B\u7B97 Decimals", "\u9AD4\u7A4D Volume", "\u56E0\u6578\u5075\u63A2 Factor detective", "\u6700\u5C0F\u516C\u500D\u6578 LCM", "\u5206\u6578\u4E58\u6CD5 Fraction times whole", "\u{1F3C6} \u5967\u6578:\u9D3F\u7C60\u539F\u7406 Pigeonhole principle", "\u{1F3C6} \u5967\u6578:\u5E73\u5747\u9006\u63A8 Reverse averages", "\u6700\u5927\u516C\u56E0\u6578 GCF", "\u5C0F\u6578\u9664\u6CD5 Decimal division", "\u{1F4D0} \u5E7E\u4F55:\u9577\u65B9\u9AD4\u9AD4\u7A4D Box volume", "\u{1F4D0} \u5E7E\u4F55:\u5713\u5468\u9577 Circumference", "\u{1F4D0} \u5E7E\u4F55:\u6247\u5F62\u5206\u6578 Sector fractions", "\u{1F4D0} \u5E7E\u4F55:\u8868\u9762\u7A4D Surface area", "\u{1F4D0} \u5E7E\u4F55:\u8868\u9762\u7A4D II Surface area II", "\u{1F4D0} \u5E7E\u4F55:\u9AD8\u7684\u9006\u63A8 Solve for height"],
  6: ["\u6BD4\u8207\u6BD4\u503C Ratios", "\u901F\u7387 Speed", "\u5206\u6578\u5C0F\u6578\u4E92\u63DB Fractions to decimals", "\u767E\u5206\u7387 Percentages", "\u5713\u5468\u9577 Circumference", "\u672A\u77E5\u6578\u65B9\u7A0B Solve for x", "\u{1F3C6} \u5967\u6578:\u5DE5\u7A0B\u554F\u984C Work-rate problems", "\u{1F3C6} \u5967\u6578:\u8CBB\u6CE2\u90A3\u5951 Fibonacci detective", "\u5713\u9762\u7A4D Circle area", "\u901F\u7387\u53CD\u63A8 Solve for time", "\u{1F4D0} \u5E7E\u4F55:\u770B\u5716\u5713\u9762\u7A4D Circle area drills", "\u{1F4D0} \u5E7E\u4F55:\u5E73\u884C\u56DB\u908A\u5F62 Parallelogram", "\u{1F4D0} \u5E7E\u4F55:\u5EA7\u6A19\u5C0B\u5BF6 Coordinate hunt", "\u{1F4D0} \u5E7E\u4F55:\u9762\u7A4D\u6BD4\u8F03 Area ratios", "\u{1F4D0} \u5E7E\u4F55:\u5713\u74B0\u9762\u7A4D Annulus", "\u{1F4D0} \u5E7E\u4F55:\u9580\u5F62\u7D44\u5408 Door shapes"]
};
const MATH_LORE = {
  1: [
    ["\u{1F9E0} \u539F\u7406:\u70BA\u4EC0\u9EBC\u8981\u5148\u6E4A\u5341?\u56E0\u70BA\u6211\u5011\u7684\u6578\u5B57\u7CFB\u7D71\u662F\u5341\u9032\u4F4D\u2014\u2014\u6BCF\u6EFF\u5341\u500B\u5C31\u6253\u5305\u6210\u4E00\u6346,\u5F80\u5DE6\u908A\u9032\u4E00\u4F4D\u3002\u52A0\u6CD5\u6642\u5148\u628A\u5176\u4E2D\u4E00\u500B\u6578\u88DC\u6EFF\u5341,\u5269\u4E0B\u7684\u96F6\u982D\u76F4\u63A5\u639B\u5728\u5F8C\u9762,\u5927\u8166\u5C31\u4E0D\u5FC5\u786C\u8A18\u4E2D\u9593\u904E\u7A0B\u3002\u9019\u4E0D\u662F\u5C0F\u6280\u5DE7,\u800C\u662F\u4F4D\u503C\u7CFB\u7D71\u9001\u7D66\u6211\u5011\u7684\u6377\u5F91\u3002", "\u26A0 \u9677\u9631:\u6700\u5E38\u898B\u7684\u932F\u8AA4\u662F\u62C6\u932F\u96F6\u982D\u2014\u2014\u628A\u6578\u62C6\u958B\u4E4B\u5F8C\u5FD8\u8A18\u81EA\u5DF1\u62C6\u4E86\u591A\u5C11,\u5169\u908A\u52A0\u8D77\u4F86\u4E0D\u7B49\u65BC\u539F\u4F86\u7684\u6578\u3002\u62C6\u6578\u4E4B\u524D\u5148\u9ED8\u5538\u4E00\u6B21:\u62C6\u51FA\u4F86\u7684\u5169\u584A\u5408\u8D77\u4F86\u5FC5\u9808\u9084\u539F\u6210\u539F\u6578\u3002", "\u{1F4A1} \u9077\u79FB:\u6E4A\u5341\u6CD5\u9577\u5927\u5F8C\u6703\u8B8A\u6210\u6E4A\u767E\u3001\u6E4A\u5343:\u4F8B\u5982\u7B97\u4E5D\u5341\u516B\u52A0\u4E09\u5341\u4E03,\u5148\u628A\u4E5D\u5341\u516B\u88DC\u6210\u4E00\u767E,\u518D\u52A0\u5269\u4E0B\u7684\u4E09\u5341\u4E94\u3002\u6240\u6709\u9032\u4F4D\u52A0\u6CD5\u90FD\u662F\u540C\u4E00\u689D\u898F\u5247\u5728\u4E0D\u540C\u5C3A\u5BF8\u4E0A\u91CD\u8907\u3002", "EN: We bundle numbers into tens because our number system is base ten. Filling up a ten first makes any addition lighter, and the same move later becomes filling up hundreds and thousands."],
    ["\u{1F9E0} \u539F\u7406:\u6E1B\u6CD5\u6709\u5169\u5F35\u81C9:\u4E00\u5F35\u662F\u300C\u62FF\u8D70\u300D,\u53E6\u4E00\u5F35\u662F\u300C\u8DDD\u96E2\u300D\u3002\u628A\u6E1B\u6CD5\u770B\u6210\u5169\u500B\u6578\u5728\u6578\u7DDA\u4E0A\u76F8\u9694\u591A\u9060,\u5F88\u591A\u984C\u76EE\u6703\u7A81\u7136\u8B8A\u7C21\u55AE\u2014\u2014\u56E0\u70BA\u91CF\u8DDD\u96E2\u53EF\u4EE5\u5F9E\u5C0F\u6578\u5F80\u4E0A\u8DF3,\u4E0D\u5FC5\u5F9E\u5927\u6578\u5F80\u4E0B\u6263,\u5F80\u4E0A\u6578\u5C0D\u5927\u8166\u4F86\u8AAA\u8F15\u9B06\u5F97\u591A\u3002", "\u26A0 \u9677\u9631:\u5F80\u4E0A\u6578\u7684\u6642\u5019,\u8D77\u9EDE\u672C\u8EAB\u4E0D\u7B97\u4E00\u6B65!\u5F9E\u4E94\u6578\u5230\u516B\u662F\u4E09\u6B65(\u516D\u3001\u4E03\u3001\u516B),\u4E0D\u662F\u56DB\u6B65\u3002\u982D\u5C3E\u600E\u9EBC\u7B97,\u662F\u4E00\u5E74\u7D1A\u5230\u5967\u6578\u90FD\u5728\u8003\u7684\u8001\u554F\u984C\u3002", "\u{1F4A1} \u9077\u79FB:\u627E\u96F6\u9322\u5C31\u662F\u8DDD\u96E2\u6E1B\u6CD5:\u4ED8\u4E00\u767E\u5143\u8CB7\u516D\u5341\u4E09\u5143\u7684\u6771\u897F,\u5E97\u54E1\u5FC3\u88E1\u662F\u5F9E\u516D\u5341\u4E09\u5F80\u4E0A\u6E4A\u5230\u4E00\u767E,\u800C\u4E0D\u662F\u505A\u76F4\u5F0F\u6E1B\u6CD5\u3002\u6642\u9593\u5DEE\u3001\u6EAB\u5EA6\u5DEE\u3001\u5E74\u9F61\u5DEE,\u5168\u90E8\u90FD\u662F\u6578\u7DDA\u4E0A\u7684\u8DDD\u96E2\u3002", "EN: Subtraction is also the distance between two numbers on the number line. Counting up from the smaller number is how shopkeepers make change and how we find gaps in time or temperature."],
    ["\u{1F9E0} \u539F\u7406:\u6578\u7DDA\u662F\u6578\u5B78\u5BB6\u6700\u91CD\u8981\u7684\u767C\u660E\u4E4B\u4E00:\u5B83\u628A\u300C\u5927\u5C0F\u300D\u9019\u500B\u62BD\u8C61\u6982\u5FF5\u8B8A\u6210\u300C\u4F4D\u7F6E\u300D\u9019\u500B\u770B\u5F97\u898B\u7684\u6771\u897F\u3002\u53EA\u8981\u898F\u5B9A\u8D8A\u53F3\u908A\u8D8A\u5927,\u6BD4\u8F03\u4EFB\u4F55\u5169\u500B\u6578\u90FD\u8B8A\u6210\u770B\u8AB0\u7AD9\u5F97\u6BD4\u8F03\u53F3\u908A\u2014\u2014\u4E4B\u5F8C\u5B78\u8CA0\u6578\u3001\u5206\u6578\u3001\u5C0F\u6578,\u5168\u90FD\u4F4F\u5728\u540C\u4E00\u689D\u7DDA\u4E0A\u3002", "\u26A0 \u9677\u9631:\u4F4D\u6578\u591A\u4E0D\u4E00\u5B9A\u6BD4\u8F03\u5927\u8981\u5C0F\u5FC3\u524D\u63D0:\u5148\u6BD4\u4F4D\u6578\u3001\u4F4D\u6578\u76F8\u540C\u518D\u5F9E\u6700\u9AD8\u4F4D\u6BD4\u8D77\u3002\u4E4B\u5F8C\u9047\u5230\u5C0F\u6578\u6703\u767C\u73FE\u300C\u6BD4\u8F03\u9577\u300D\u53CD\u800C\u5E38\u5E38\u6BD4\u8F03\u5C0F,\u898F\u5247\u7684\u524D\u63D0\u6C38\u9060\u8981\u8A18\u6E05\u695A\u3002", "\u{1F4A1} \u9077\u79FB:\u6EAB\u5EA6\u8A08\u5C31\u662F\u4E00\u689D\u7AD9\u8D77\u4F86\u7684\u6578\u7DDA;\u6A13\u5C64\u3001\u6D77\u62D4\u3001\u5E74\u4EFD\u4E5F\u90FD\u662F\u6578\u7DDA\u3002\u5B78\u6703\u5728\u7DDA\u4E0A\u627E\u4F4D\u7F6E,\u5C31\u5B78\u6703\u4E86\u6BD4\u8F03\u4E16\u754C\u4E0A\u5927\u591A\u6578\u7684\u91CF\u3002", "EN: The number line turns size into position: bigger simply means further right. Thermometers, floors and timelines are all number lines in disguise."],
    ["\u{1F9E0} \u539F\u7406:\u6578\u5217\u5075\u63A2\u7684\u6838\u5FC3\u52D5\u4F5C\u662F\u627E\u5DEE:\u628A\u76F8\u9130\u5169\u500B\u6578\u76F8\u6E1B,\u770B\u770B\u6BCF\u4E00\u6B65\u8DF3\u591A\u9060\u3002\u5982\u679C\u6BCF\u4E00\u6B65\u90FD\u8DF3\u4E00\u6A23\u9060,\u9019\u53EB\u7B49\u5DEE\u6578\u5217\u2014\u2014\u77E5\u9053\u6B65\u4F10\u5927\u5C0F,\u5C31\u80FD\u5F80\u524D\u6216\u5F80\u5F8C\u8D70\u5230\u4EFB\u4F55\u4E00\u683C,\u751A\u81F3\u76F4\u63A5\u8DF3\u5230\u7B2C\u4E00\u767E\u683C\u3002", "\u26A0 \u9677\u9631:\u53EA\u6AA2\u67E5\u4E00\u7D44\u76F8\u9130\u6578\u5C31\u4E0B\u7D50\u8AD6\u5F88\u5371\u96AA!\u81F3\u5C11\u6AA2\u67E5\u5169\u7D44\u5DEE,\u78BA\u8A8D\u6B65\u4F10\u771F\u7684\u56FA\u5B9A,\u518D\u586B\u7A7A\u3002\u5075\u63A2\u4E0D\u80FD\u53EA\u770B\u4E00\u689D\u7DDA\u7D22\u5C31\u6293\u4EBA\u3002", "\u{1F4A1} \u9077\u79FB:\u6A13\u68AF\u3001\u65E5\u66C6\u7684\u540C\u4E00\u76F4\u884C\u3001\u6BCF\u9031\u56FA\u5B9A\u5B58\u9322\u7684\u5B58\u647A\u9918\u984D,\u90FD\u662F\u7B49\u5DEE\u6578\u5217\u3002\u627E\u5DEE\u9019\u4E00\u62DB,\u4EE5\u5F8C\u5728\u7B49\u6BD4\u6578\u5217(\u627E\u500D\u6578)\u548C\u66F4\u8907\u96DC\u7684\u6578\u5217\u88E1\u9084\u6703\u4E0D\u65B7\u5347\u7D1A\u3002", "EN: Find the gap between neighbours. If every gap is equal you have an arithmetic sequence, and knowing one step lets you predict any term. Stairs, calendars and weekly savings all follow this pattern."],
    ["\u{1F9E0} \u539F\u7406:\u9019\u7A2E\u984C\u5728\u89E3\u7684\u662F\u65B9\u7A0B\u7684\u524D\u8EAB:\u67D0\u500B\u6578\u52A0\u4E0A\u672A\u77E5\u7684\u6771\u897F\u7B49\u65BC\u7E3D\u6578\u3002\u8981\u627E\u56DE\u672A\u77E5,\u5C31\u7528\u9006\u904B\u7B97\u2014\u2014\u52A0\u6CD5\u7684\u53CD\u5411\u662F\u6E1B\u6CD5\u3002\u300C\u9806\u8457\u505A\u300D\u548C\u300C\u5012\u8457\u62C6\u300D\u662F\u540C\u4E00\u689D\u8DEF\u7684\u5169\u500B\u65B9\u5411,\u6578\u5B78\u88E1\u5E7E\u4E4E\u6BCF\u500B\u904B\u7B97\u90FD\u6709\u5B83\u7684\u53CD\u5411\u9375\u3002", "\u26A0 \u9677\u9631:\u4E0D\u8981\u6025\u8457\u628A\u984C\u76EE\u88E1\u7684\u5169\u500B\u6578\u76F4\u63A5\u76F8\u52A0!\u5148\u554F\u81EA\u5DF1:\u54EA\u500B\u662F\u7E3D\u6578\u3001\u54EA\u500B\u662F\u96F6\u4EF6?\u7E3D\u6578\u6E1B\u96F6\u4EF6\u624D\u662F\u7F3A\u7684\u90A3\u584A,\u52A0\u932F\u65B9\u5411\u7B54\u6848\u6703\u5927\u5F97\u96E2\u8B5C\u3002", "\u{1F4A1} \u9077\u79FB:\u9019\u5C31\u662F\u4EE3\u6578\u7684\u8D77\u9EDE:\u5E7E\u5E74\u5F8C\u5BEB\u6210 x \u7684\u65B9\u7A0B\u5F0F,\u89E3\u6CD5\u5B8C\u5168\u76F8\u540C\u2014\u2014\u628A\u5DF2\u77E5\u7684\u642C\u5230\u4E00\u908A,\u672A\u77E5\u7684\u81EA\u7136\u73FE\u8EAB\u3002\u5B58\u9322\u9084\u5DEE\u591A\u5C11\u3001\u62FC\u5716\u9084\u7F3A\u5E7E\u7247,\u90FD\u662F\u540C\u4E00\u984C\u3002", "EN: Finding the missing part is early algebra: undo the addition with subtraction. Ask which number is the whole and which is a part, then whole minus part reveals the unknown."],
    ["\u{1F9E0} \u539F\u7406:\u61C9\u7528\u984C\u7684\u672C\u4E8B\u4E0D\u5728\u8A08\u7B97,\u5728\u7FFB\u8B6F:\u628A\u6545\u4E8B\u88E1\u7684\u52D5\u4F5C\u7FFB\u6210\u904B\u7B97\u7B26\u865F\u3002\u300C\u53C8\u653E\u9032\u3001\u53C8\u4F86\u4E86\u300D\u7FFB\u6210\u52A0,\u300C\u62FF\u8D70\u3001\u7528\u6389\u300D\u7FFB\u6210\u6E1B\u3002\u5148\u5708\u51FA\u6578\u5B57\u3001\u518D\u5708\u51FA\u52D5\u4F5C\u8A5E,\u6700\u5F8C\u624D\u52D5\u7B46\u7B97\u2014\u2014\u6703\u7FFB\u8B6F\u7684\u4EBA,\u518D\u9577\u7684\u6545\u4E8B\u984C\u90FD\u53EA\u662F\u77ED\u77ED\u4E00\u884C\u7B97\u5F0F\u3002", "\u26A0 \u9677\u9631:\u5225\u770B\u5230\u6578\u5B57\u5C31\u6293\u4F86\u52A0!\u6709\u4E9B\u984C\u76EE\u6545\u610F\u653E\u9032\u7528\u4E0D\u5230\u7684\u6578\u5B57,\u5148\u78BA\u8A8D\u6BCF\u500B\u6578\u5B57\u5728\u6545\u4E8B\u88E1\u626E\u6F14\u4EC0\u9EBC\u89D2\u8272,\u518D\u6C7A\u5B9A\u5B83\u8A72\u4E0D\u8A72\u9032\u7B97\u5F0F\u3002", "\u{1F4A1} \u9077\u79FB:\u9019\u500B\u7FFB\u8B6F\u80FD\u529B\u5C31\u662F\u4EE5\u5F8C\u5217\u65B9\u7A0B\u5F0F\u7684\u80FD\u529B:\u570B\u4E2D\u7684\u61C9\u7528\u984C\u53EA\u662F\u6545\u4E8B\u66F4\u9577\u3001\u7B26\u865F\u66F4\u591A,\u6838\u5FC3\u52D5\u4F5C\u5B8C\u5168\u4E00\u6A23\u2014\u2014\u628A\u4EBA\u8A71\u7FFB\u6210\u6578\u5B78\u8A71\u3002", "EN: Word problems are translation work: turn story verbs into math symbols. Added and received mean plus, spent and removed mean minus. Circle the numbers, name their roles, then write one clean equation."],
    ["\u{1F9E0} \u539F\u7406:\u6392\u968A\u554F\u984C\u7684\u95DC\u9375\u662F:\u6578\u4EBA\u7684\u6642\u5019,\u81EA\u5DF1\u4E5F\u662F\u4E00\u500B\u4EBA!\u524D\u9762\u7684\u4EBA\u6578\u52A0\u5F8C\u9762\u7684\u4EBA\u6578,\u518D\u52A0\u4E0A\u81EA\u5DF1\u90A3\u4E00\u500B,\u624D\u662F\u6574\u6392\u3002\u9019\u985E\u300C\u5225\u5FD8\u4E86\u7B97\u4E0A\u57FA\u6E96\u9EDE\u300D\u7684\u63A8\u7406,\u662F\u5967\u6578\u690D\u6A39\u554F\u984C\u3001\u570D\u7C6C\u554F\u984C\u7684\u5165\u9580\u7248\u3002", "\u26A0 \u9677\u9631:\u5341\u500B\u88E1\u6709\u4E5D\u500B\u932F\u5728\u5FD8\u8A18\u52A0\u81EA\u5DF1\u3002\u756B\u5716\u6700\u4FDD\u96AA:\u7528\u4E00\u500B\u5708\u4EE3\u8868\u81EA\u5DF1,\u524D\u5F8C\u5404\u756B\u5E7E\u500B\u9EDE,\u4E00\u773C\u5C31\u770B\u51FA\u7E3D\u6578\u662F\u524D\u52A0\u5F8C\u52A0\u4E00\u3002", "\u{1F4A1} \u9077\u79FB:\u5F9E\u4F60\u5BB6\u5230\u5B78\u6821\u8981\u7D93\u904E\u4E94\u6839\u96FB\u7DDA\u687F,\u542B\u982D\u5C3E\u5176\u5BE6\u6709\u516D\u6839\u9593\u9694\u9EDE;\u4E00\u9031\u5F9E\u661F\u671F\u4E00\u5230\u661F\u671F\u4E94\u542B\u982D\u5C3E\u662F\u4E94\u5929\u3002\u982D\u5C3E\u8981\u4E0D\u8981\u7B97,\u6C38\u9060\u5148\u756B\u5716\u78BA\u8A8D\u3002", "EN: When counting a line of people, remember that you are in the line too: front plus back plus one. Drawing a quick dot picture prevents the classic off-by-one mistake."],
    ["\u{1F9E0} \u539F\u7406:\u9031\u671F\u554F\u984C\u7684\u7834\u89E3\u9470\u5319\u662F\u9664\u6CD5\u6C42\u9918:\u5716\u5F62\u6BCF\u5E7E\u500B\u4E00\u7D44\u5FAA\u74B0,\u7B2C N \u500B\u662F\u4EC0\u9EBC,\u53EA\u8981\u7528 N \u9664\u4EE5\u9031\u671F\u9577\u5EA6,\u770B\u9918\u6578\u843D\u5728\u4E00\u7D44\u88E1\u7684\u7B2C\u5E7E\u500B\u4F4D\u7F6E\u3002\u9918\u6578\u628A\u300C\u5F88\u9060\u7684\u7B2C N \u500B\u300D\u62C9\u56DE\u5230\u773C\u524D\u9019\u4E00\u5C0F\u7D44\u88E1\u3002", "\u26A0 \u9677\u9631:\u9918\u6578\u662F\u96F6\u7684\u6642\u5019\u6700\u5BB9\u6613\u932F\u2014\u2014\u9918\u96F6\u4EE3\u8868\u525B\u597D\u843D\u5728\u4E00\u7D44\u7684\u6700\u5F8C\u4E00\u500B,\u4E0D\u662F\u7B2C\u4E00\u500B!\u5148\u628A\u300C\u9918\u4E00\u662F\u7B2C\u4E00\u500B\u3001\u9918\u96F6\u662F\u6700\u5F8C\u4E00\u500B\u300D\u5BEB\u4E0B\u4F86\u518D\u5C0D\u7B54\u6848\u3002", "\u{1F4A1} \u9077\u79FB:\u661F\u671F\u5E7E\u7684\u8A08\u7B97\u3001\u5341\u4E8C\u751F\u8096\u3001\u7D05\u7DA0\u71C8\u3001\u97F3\u6A02\u7684\u7BC0\u62CD,\u5168\u662F\u9031\u671F\u554F\u984C\u3002\u4E09\u5E74\u7D1A\u7684\u661F\u671F\u9031\u671F\u984C\u3001\u516D\u5E74\u7D1A\u7684\u9918\u6578\u5075\u63A2,\u7528\u7684\u90FD\u662F\u4ECA\u5929\u9019\u628A\u9470\u5319\u3002", "EN: Repeating patterns obey division with remainder: divide the position by the cycle length and the remainder tells you where you land. A remainder of zero means the last item of a cycle, not the first."],
    ["\u{1F9E0} \u539F\u7406:\u9322\u5E63\u8A08\u7B97\u662F\u4E58\u6CD5\u548C\u52A0\u6CD5\u7684\u5408\u9AD4:\u76F8\u540C\u9762\u984D\u7684\u786C\u5E63\u7528\u4E58\u6CD5\u6253\u5305(\u4E94\u5143\u4E58\u5E7E\u500B),\u4E0D\u540C\u9762\u984D\u4E4B\u9593\u518D\u7528\u52A0\u6CD5\u5408\u4F75\u3002\u5148\u5206\u985E\u3001\u518D\u6253\u5305\u3001\u6700\u5F8C\u5408\u4F75\u2014\u2014\u9019\u500B\u300C\u5148\u4E58\u5F8C\u52A0\u300D\u7684\u9806\u5E8F,\u5C31\u662F\u56DB\u5247\u904B\u7B97\u512A\u5148\u9806\u5E8F\u7684\u751F\u6D3B\u7248\u3002", "\u26A0 \u9677\u9631:\u5225\u628A\u786C\u5E63\u7684\u300C\u500B\u6578\u300D\u548C\u300C\u91D1\u984D\u300D\u641E\u6DF7:\u4E09\u500B\u4E94\u5143\u662F\u5341\u4E94\u5143,\u4E0D\u662F\u4E09\u5143\u4E5F\u4E0D\u662F\u516B\u5143\u3002\u6BCF\u4E00\u6B65\u90FD\u554F\u81EA\u5DF1:\u6211\u73FE\u5728\u7B97\u7684\u662F\u5E7E\u500B,\u9084\u662F\u5E7E\u5143?", "\u{1F4A1} \u9077\u79FB:\u9EDE\u9910\u7B97\u7E3D\u50F9\u3001\u7B97\u4E00\u76D2\u96DE\u86CB\u5171\u5E7E\u9846\u3001\u7B97\u5168\u73ED\u5171\u5E7E\u679D\u925B\u7B46,\u90FD\u662F\u540C\u4E00\u62DB:\u540C\u985E\u5148\u4E58\u3001\u7570\u985E\u518D\u52A0\u3002\u9019\u4E5F\u662F\u4EE5\u5F8C\u591A\u9805\u5F0F\u5408\u4F75\u540C\u985E\u9805\u7684\u7B2C\u4E00\u8AB2\u3002", "EN: Coins teach the order of operations in real life: multiply within each coin type first, then add across types. Always ask whether you are counting coins or counting value."],
    ["\u{1F9E0} \u539F\u7406:\u5169\u6B65\u9A5F\u554F\u984C\u8003\u7684\u662F\u72C0\u614B\u8FFD\u8E64:\u8ECA\u4E0A\u7684\u4EBA\u6578\u662F\u4E00\u500B\u6703\u8B8A\u52D5\u7684\u72C0\u614B,\u6BCF\u767C\u751F\u4E00\u4EF6\u4E8B\u5C31\u66F4\u65B0\u4E00\u6B21\u3002\u7955\u8A23\u662F\u4E00\u6B21\u53EA\u8655\u7406\u4E00\u6B65,\u7B97\u51FA\u4E2D\u9593\u7D50\u679C\u518D\u9032\u4E0B\u4E00\u6B65\u2014\u2014\u5927\u8166\u4E0D\u64C5\u9577\u540C\u6642\u8FFD\u5169\u4EF6\u4E8B,\u4F46\u5F88\u64C5\u9577\u6392\u968A\u8655\u7406\u3002", "\u26A0 \u9677\u9631:\u6700\u5371\u96AA\u7684\u662F\u60F3\u4E00\u53E3\u6C23\u5FC3\u7B97\u5230\u5E95,\u7D50\u679C\u4E0A\u8ECA\u4E0B\u8ECA\u7684\u65B9\u5411\u5F04\u53CD\u3002\u628A\u4E2D\u9593\u72C0\u614B\u5BEB\u4E0B\u4F86,\u54EA\u6015\u53EA\u662F\u5C0F\u5C0F\u4E00\u500B\u6578\u5B57,\u932F\u8AA4\u7387\u7ACB\u523B\u6E1B\u534A\u3002", "\u{1F4A1} \u9077\u79FB:\u73A9\u904A\u6232\u6642\u7684\u8840\u91CF\u8A08\u7B97\u3001\u5B58\u9322\u53C8\u82B1\u9322\u5F8C\u7684\u9918\u984D\u3001\u96FB\u68AF\u4E0A\u4E0A\u4E0B\u4E0B\u505C\u5728\u5E7E\u6A13,\u5168\u662F\u72C0\u614B\u8FFD\u8E64\u3002\u4EE5\u5F8C\u5BEB\u7A0B\u5F0F\u7684\u8B8A\u6578\u6982\u5FF5,\u4ECA\u5929\u5DF2\u7D93\u958B\u59CB\u7DF4\u4E86\u3002", "EN: Multi-step stories are about tracking a changing state: update the number after each event, one step at a time. Writing the middle result down halves your error rate."],
    ["\u{1F9E0} \u539F\u7406:\u6578\u65B9\u683C\u5176\u5BE6\u662F\u5728\u767C\u660E\u4E58\u6CD5:\u4E00\u6392\u6709\u5E7E\u683C\u3001\u5171\u6709\u5E7E\u6392,\u6392\u6578\u4E58\u6BCF\u6392\u683C\u6578\u5C31\u662F\u7E3D\u6578\u3002\u9762\u7A4D\u516C\u5F0F\u300C\u9577\u4E58\u5BEC\u300D\u4E0D\u662F\u80CC\u4F86\u7684\u5492\u8A9E,\u800C\u662F\u6578\u65B9\u683C\u6578\u5230\u4E0D\u8010\u7169\u4E4B\u5F8C,\u4EBA\u985E\u627E\u5230\u7684\u6253\u5305\u6377\u5F91\u3002", "\u26A0 \u9677\u9631:\u6578\u683C\u5B50\u6642\u6700\u6015\u91CD\u8907\u6578\u548C\u6F0F\u6578\u3002\u6709\u7CFB\u7D71\u5730\u4E00\u6392\u4E00\u6392\u6578,\u6216\u76F4\u63A5\u7528\u4E58\u6CD5,\u4E0D\u8981\u5728\u5716\u4E0A\u4E82\u8DF3\u8457\u6578\u2014\u2014\u4E82\u6578\u5FC5\u932F\u3002", "\u{1F4A1} \u9077\u79FB:\u5DE7\u514B\u529B\u7247\u3001\u6559\u5BA4\u5EA7\u4F4D\u3001\u74F7\u78DA\u5730\u677F\u3001\u87A2\u5E55\u7684\u50CF\u7D20,\u5168\u662F\u65B9\u683C\u9663\u5217\u3002\u4E8C\u5E74\u7D1A\u7684\u9577\u65B9\u5F62\u9762\u7A4D\u3001\u56DB\u5E74\u7D1A\u7684\u8907\u5408\u9762\u7A4D,\u6839\u90FD\u5728\u4ECA\u5929\u9019\u4E00\u683C\u4E00\u683C\u88E1\u3002", "EN: Counting squares row by row is how multiplication was born: rows times columns. The area formula for rectangles is just this counting shortcut written down."],
    ["\u{1F9E0} \u539F\u7406:\u5468\u9577\u662F\u300C\u6CBF\u8457\u908A\u8D70\u4E00\u5708\u7684\u7E3D\u8DEF\u7A0B\u300D\u3002\u6B63\u65B9\u5F62\u56DB\u689D\u908A\u4E00\u6A23\u9577,\u6240\u4EE5\u4E0D\u5FC5\u56DB\u500B\u6578\u5B57\u6162\u6162\u52A0,\u4E00\u689D\u908A\u4E58\u56DB\u5C31\u5230\u4F4D\u2014\u2014\u767C\u73FE\u91CD\u8907\u3001\u7528\u4E58\u6CD5\u6253\u5305\u91CD\u8907,\u662F\u6578\u5B78\u88E1\u6700\u5E38\u7528\u7684\u5077\u61F6\u667A\u6167\u3002", "\u26A0 \u9677\u9631:\u5468\u9577\u548C\u9762\u7A4D\u662F\u5169\u500B\u5B8C\u5168\u4E0D\u540C\u7684\u554F\u984C:\u4E00\u500B\u5728\u91CF\u908A\u754C\u7684\u9577\u5EA6,\u4E00\u500B\u5728\u91CF\u88E1\u9762\u7684\u5927\u5C0F\u3002\u770B\u5230\u6B63\u65B9\u5F62\u5148\u505C\u4E00\u79D2,\u78BA\u8A8D\u984C\u76EE\u554F\u7684\u662F\u4E00\u5708\u591A\u9577,\u9084\u662F\u88E1\u9762\u591A\u5927\u3002", "\u{1F4A1} \u9077\u79FB:\u5E6B\u82B1\u5703\u570D\u7C6C\u7B06\u3001\u5E6B\u76F8\u6846\u8CB7\u6728\u689D\u3001\u64CD\u5834\u8DD1\u4E00\u5708,\u90FD\u662F\u5468\u9577\u554F\u984C\u3002\u4EE5\u5F8C\u9577\u65B9\u5F62\u662F\u4E8C\u4E58\u9577\u52A0\u5BEC,\u6B63\u591A\u908A\u5F62\u662F\u908A\u9577\u4E58\u908A\u6578\u2014\u2014\u540C\u4E00\u500B\u6253\u5305\u601D\u60F3\u3002", "EN: Perimeter is the walk around the edge. A square has four equal sides, so multiply one side by four. Fences, frames and running tracks are all perimeter in real life."],
    ["\u{1F9E0} \u539F\u7406:\u591A\u908A\u5F62\u7684\u540D\u5B57\u5C31\u85CF\u8457\u5B83\u7684\u8EAB\u5206\u8B49:\u4E09\u89D2\u5F62\u4E09\u689D\u908A\u3001\u4E94\u908A\u5F62\u4E94\u689D\u908A\u2014\u2014\u300C\u5E7E\u908A\u5F62\u300D\u7684\u300C\u5E7E\u300D\u540C\u6642\u4E5F\u662F\u9802\u9EDE\u7684\u6578\u91CF,\u908A\u6578\u8207\u89D2\u6578\u6C38\u9060\u76F8\u7B49\u3002\u8A8D\u5716\u5F62\u4E0D\u662F\u80CC\u5F62\u72C0,\u800C\u662F\u6578\u7D50\u69CB\u3002", "\u26A0 \u9677\u9631:\u5716\u5F62\u8F49\u4E86\u89D2\u5EA6\u3001\u8B8A\u7626\u8B8A\u80D6,\u908A\u6578\u4E0D\u6703\u8B8A!\u5225\u88AB\u5916\u8868\u9A19\u4E86,\u8A8D\u5716\u5F62\u53EA\u8A8D\u4E00\u4EF6\u4E8B:\u6578\u6E05\u695A\u6709\u5E7E\u689D\u908A,\u5176\u4ED6\u90FD\u662F\u507D\u88DD\u3002", "\u{1F4A1} \u9077\u79FB:\u8702\u5DE2\u662F\u516D\u908A\u5F62\u3001\u8DB3\u7403\u4E0A\u6709\u4E94\u908A\u5F62\u548C\u516D\u908A\u5F62\u3001\u505C\u6B62\u6A19\u8A8C\u662F\u516B\u908A\u5F62\u3002\u4E4B\u5F8C\u5B78\u5167\u89D2\u548C(\u908A\u6578\u6E1B\u4E8C\u4E58\u4E00\u767E\u516B\u5341\u5EA6),\u5165\u5834\u5238\u5C31\u662F\u4ECA\u5929\u6578\u908A\u7684\u529F\u592B\u3002", "EN: A polygon carries its identity in its edge count, and corners always match edges. Rotating or stretching never changes the count. Honeycombs and stop signs are polygons hiding in daily life."],
    ["\u{1F9E0} \u539F\u7406:\u6B63\u65B9\u5F62\u5207\u6210\u6BCF\u908A n \u683C,\u7E3D\u683C\u6578\u662F n \u4E58 n\u2014\u2014\u9019\u5C31\u662F\u300C\u5E73\u65B9\u300D\u9019\u500B\u8A5E\u7684\u51FA\u751F\u5730:\u5E73\u65B9\u5C31\u662F\u6B63\u65B9\u5F62\u7684\u65B9\u3002\u4E00\u500B\u6578\u81EA\u5DF1\u4E58\u81EA\u5DF1,\u756B\u51FA\u4F86\u525B\u597D\u662F\u4E00\u500B\u6B63\u65B9\u5F62\u9EDE\u9663,\u6578\u8207\u5F62\u5728\u9019\u88E1\u7B2C\u4E00\u6B21\u63E1\u624B\u3002", "\u26A0 \u9677\u9631:\u6BCF\u908A n \u683C\u4E0D\u662F\u7E3D\u5171 n \u683C,\u4E5F\u4E0D\u662F n \u52A0 n \u683C!\u4E09\u4E58\u4E09\u662F\u4E5D\u683C,\u4E0D\u662F\u516D\u683C\u3002\u4E58\u6CD5\u548C\u52A0\u6CD5\u5728\u5716\u4E0A\u9577\u5F97\u5B8C\u5168\u4E0D\u540C,\u756B\u5169\u6392\u9EDE\u5C31\u5206\u5F97\u6E05\u3002", "\u{1F4A1} \u9077\u79FB:\u5E73\u65B9\u6578(\u4E00\u3001\u56DB\u3001\u4E5D\u3001\u5341\u516D\u2026\u2026)\u4EE5\u5F8C\u6703\u5728\u9762\u7A4D\u3001\u5E73\u65B9\u6839\u3001\u7562\u6C0F\u5B9A\u7406\u88E1\u4E0D\u65B7\u767B\u5834\u3002\u73FE\u5728\u5728\u683C\u5B50\u4E0A\u770B\u898B\u5B83\u5011\u7684\u5F62\u72C0,\u4EE5\u5F8C\u5C31\u4E0D\u6703\u6015\u5B83\u5011\u7684\u7B26\u865F\u3002", "EN: A square cut into n by n cells holds n times n cells. This is literally why multiplying a number by itself is called squaring: the picture is a square of dots."],
    ["\u{1F9E0} \u539F\u7406:\u518D\u6578\u4E00\u6B21\u908A,\u4F46\u9019\u6B21\u5716\u5F62\u6703\u507D\u88DD:\u6709\u7684\u53C8\u6241\u53C8\u659C\u3001\u6709\u7684\u8F49\u4E86\u65B9\u5411\u3002\u7D50\u69CB\u4E0D\u8B8A\u6027\u662F\u5E7E\u4F55\u7684\u6838\u5FC3\u4FE1\u5FF5\u2014\u2014\u53EA\u8981\u6C92\u6709\u589E\u6E1B\u908A,\u600E\u9EBC\u65CB\u8F49\u3001\u7E2E\u653E\u3001\u6B6A\u659C,\u5B83\u90FD\u662F\u540C\u4E00\u7A2E\u5716\u5F62\u3002\u773C\u775B\u770B\u5916\u8868,\u5075\u63A2\u770B\u7D50\u69CB\u3002", "\u26A0 \u9677\u9631:\u659C\u653E\u7684\u6B63\u65B9\u5F62\u5E38\u88AB\u8AA4\u8A8D\u6210\u300C\u83F1\u5F62\u6240\u4EE5\u4E0D\u662F\u56DB\u908A\u5F62\u300D\u2014\u2014\u5B83\u6C38\u9060\u662F\u56DB\u908A\u5F62!\u5206\u985E\u770B\u908A\u6578,\u66F4\u7D30\u7684\u5206\u985E(\u6B63\u65B9\u5F62\u3001\u83F1\u5F62)\u624D\u770B\u908A\u9577\u8207\u89D2\u5EA6\u3002", "\u{1F4A1} \u9077\u79FB:\u8FA8\u8A8D\u7D50\u69CB\u800C\u975E\u5916\u8868,\u662F\u6240\u6709\u79D1\u5B78\u7684\u57FA\u672C\u529F:\u751F\u7269\u5B78\u5BB6\u8A8D\u9AA8\u67B6\u4E0D\u8A8D\u6BDB\u8272,\u5316\u5B78\u5BB6\u8A8D\u7D50\u69CB\u5F0F\u4E0D\u8A8D\u984F\u8272\u3002\u5E7E\u4F55\u662F\u9019\u7A2E\u773C\u5149\u7684\u7B2C\u4E00\u5802\u8AB2\u3002", "EN: Shapes may tilt, stretch or rotate, yet the edge count never lies. Judging by structure instead of appearance is the first lesson of every science, from geometry to biology."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u5EA6\u6BD4\u8F03\u7528\u7684\u662F\u6E1B\u6CD5\u7684\u8DDD\u96E2\u81C9:\u5169\u6839\u68D2\u5B50\u5DEE\u591A\u5C11,\u5C31\u662F\u5169\u500B\u6578\u5728\u6578\u7DDA\u4E0A\u76F8\u9694\u591A\u9060\u3002\u628A\u5BE6\u7269\u554F\u984C\u7FFB\u6210\u6578\u7DDA\u554F\u984C,\u662F\u300C\u91CF\u300D\u8207\u300C\u6578\u300D\u4E4B\u9593\u6700\u91CD\u8981\u7684\u4E00\u5EA7\u6A4B\u3002", "\u26A0 \u9677\u9631:\u6BD4\u8F03\u9577\u5EA6\u5FC5\u9808\u540C\u55AE\u4F4D!\u516B\u516C\u5206\u548C\u516B\u516C\u5C3A\u5DEE\u4E86\u4E00\u767E\u500D\u3002\u52D5\u624B\u76F8\u6E1B\u4E4B\u524D,\u5148\u6AA2\u67E5\u5169\u500B\u6578\u5B57\u7A7F\u7684\u662F\u4E0D\u662F\u540C\u4E00\u4EF6\u55AE\u4F4D\u5916\u5957\u3002", "\u{1F4A1} \u9077\u79FB:\u8EAB\u9AD8\u5DEE\u3001\u7E69\u5B50\u5269\u591A\u5C11\u3001\u8AB0\u8DF3\u5F97\u6BD4\u8F03\u9060,\u5168\u662F\u540C\u4E00\u62DB\u3002\u4EE5\u5F8C\u7684\u55AE\u4F4D\u63DB\u7B97\u984C,\u5C31\u662F\u5148\u628A\u5916\u5957\u63DB\u6210\u540C\u4E00\u4EF6,\u518D\u505A\u4ECA\u5929\u9019\u500B\u6E1B\u6CD5\u3002", "EN: Comparing lengths is subtraction wearing its distance face. Check that both numbers share the same unit before subtracting, because eight metres and eight centimetres differ a hundredfold."]
  ],
  2: [
    ["\u{1F9E0} \u539F\u7406:\u4E8C\u4F4D\u6578\u52A0\u6CD5\u662F\u4F4D\u503C\u7CFB\u7D71\u7684\u7B2C\u4E00\u6B21\u5BE6\u6230:\u500B\u4F4D\u548C\u500B\u4F4D\u76F8\u52A0\u3001\u5341\u4F4D\u548C\u5341\u4F4D\u76F8\u52A0,\u6EFF\u5341\u5C31\u5F80\u5DE6\u9032\u4F4D\u3002\u300C\u9032\u4F4D\u300D\u4E0D\u662F\u898F\u5B9A,\u800C\u662F\u5341\u9032\u4F4D\u7684\u5FC5\u7136\u2014\u2014\u5341\u500B\u4E00\u5143\u786C\u5E63\u672C\u4F86\u5C31\u8A72\u63DB\u6210\u4E00\u5F35\u5341\u5143\u3002", "\u26A0 \u9677\u9631:\u9032\u4F4D\u6700\u5BB9\u6613\u5FD8\u5728\u5FC3\u88E1:\u500B\u4F4D\u6EFF\u5341\u4E4B\u5F8C,\u90A3\u500B\u5C0F\u5C0F\u7684\u4E00\u8981\u78BA\u5BE6\u52A0\u9032\u5341\u4F4D\u3002\u76F4\u5F0F\u8A08\u7B97\u6642\u628A\u9032\u4F4D\u6578\u5B57\u5BEB\u5728\u5341\u4F4D\u4E0A\u65B9,\u4E0D\u8981\u9760\u8166\u5167\u4FBF\u5229\u8CBC\u3002", "\u{1F4A1} \u9077\u79FB:\u4E09\u4F4D\u6578\u3001\u56DB\u4F4D\u6578\u3001\u5C0F\u6578\u52A0\u6CD5,\u5168\u662F\u540C\u4E00\u5957\u9032\u4F4D\u898F\u5247\u5F80\u5DE6\u53F3\u5EF6\u4F38\u3002\u628A\u5169\u4F4D\u6578\u7DF4\u5230\u4E0D\u5FC5\u60F3,\u4EE5\u5F8C\u7684\u5927\u6578\u8A08\u7B97\u53EA\u662F\u540C\u4E00\u652F\u821E\u8DF3\u66F4\u591A\u62CD\u3002", "EN: Two digit addition is place value in action: add ones with ones, tens with tens, and carry when a column fills past ten. Every bigger addition is this same dance with more steps."],
    ["\u{1F9E0} \u539F\u7406:\u4E8C\u4F4D\u6578\u6E1B\u6CD5\u7684\u95DC\u5361\u662F\u501F\u4F4D:\u500B\u4F4D\u4E0D\u5920\u6E1B,\u5C31\u5411\u5341\u4F4D\u501F\u4E00\u7576\u5341\u3002\u9019\u548C\u8CB7\u6771\u897F\u627E\u96F6\u4E00\u6A21\u4E00\u6A23\u2014\u2014\u624B\u4E0A\u96F6\u9322\u4E0D\u5920,\u5C31\u628A\u4E00\u5F35\u5341\u5143\u9214\u7968\u63DB\u958B\u3002\u501F\u4F4D\u662F\u63DB\u9322,\u4E0D\u662F\u9B54\u6CD5\u3002", "\u26A0 \u9677\u9631:\u501F\u4E86\u8981\u8A18\u5F97\u9084:\u5341\u4F4D\u88AB\u501F\u8D70\u4E00\u4E4B\u5F8C\u5C31\u8B8A\u5C0F\u4E86,\u6700\u5E38\u898B\u7684\u932F\u662F\u5341\u4F4D\u7167\u539F\u6578\u53BB\u6E1B\u3002\u501F\u4F4D\u7576\u4E0B\u7ACB\u523B\u628A\u5341\u4F4D\u6539\u5BEB,\u4E0D\u8981\u7559\u5230\u6700\u5F8C\u6191\u8A18\u61B6\u3002", "\u{1F4A1} \u9077\u79FB:\u6642\u9593\u8A08\u7B97(\u4E0D\u5920\u6E1B\u5C31\u501F\u4E00\u5C0F\u6642\u7576\u516D\u5341\u5206)\u3001\u516C\u65A4\u8207\u516C\u514B,\u5168\u662F\u501F\u4F4D\u7684\u8B8A\u5F62\u3002\u55AE\u4F4D\u9032\u7387\u4E0D\u540C,\u63DB\u9322\u7684\u908F\u8F2F\u76F8\u540C\u3002", "EN: Borrowing in subtraction is just breaking a ten into ones, exactly like breaking a ten dollar note into coins. Update the tens digit the moment you borrow."],
    ["\u{1F9E0} \u539F\u7406:\u4E5D\u4E5D\u4E58\u6CD5\u8868\u4E0D\u662F\u516B\u5341\u4E00\u53E5\u5492\u8A9E,\u800C\u662F\u4E00\u5F35\u52A0\u6CD5\u58D3\u7E2E\u8868:\u516D\u4E58\u4E5D\u5C31\u662F\u4E5D\u500B\u516D\u9023\u52A0\u7684\u7E3D\u7D50\u3002\u7406\u89E3\u4E86\u4E58\u6CD5\u662F\u91CD\u8907\u52A0\u6CD5\u7684\u6253\u5305,\u5FD8\u8A18\u67D0\u4E00\u683C\u6642\u6C38\u9060\u53EF\u4EE5\u5F9E\u65C1\u908A\u90A3\u683C\u63A8\u56DE\u4F86\u2014\u2014\u516D\u4E58\u4E5D\u5FD8\u4E86,\u5C31\u7528\u516D\u4E58\u5341\u518D\u6E1B\u516D\u3002", "\u26A0 \u9677\u9631:\u4E03\u8207\u516B\u7684\u6BB5\u843D\u4EBA\u4EBA\u90FD\u5BB9\u6613\u6ED1\u5012\u3002\u8207\u5176\u786C\u80CC,\u4E0D\u5982\u8A18\u5E7E\u500B\u9328\u9EDE(\u4E03\u4E03\u56DB\u5341\u4E5D\u3001\u516B\u516B\u516D\u5341\u56DB),\u5FD8\u8A18\u6642\u5F9E\u9328\u9EDE\u52A0\u6E1B\u4E00\u6B65\u5C31\u5230\u3002", "\u{1F4A1} \u9077\u79FB:\u4E58\u6CD5\u8868\u662F\u9664\u6CD5\u3001\u5206\u6578\u3001\u6BD4\u4F8B\u7684\u5730\u57FA\u3002\u4E4B\u5F8C\u7684\u591A\u4F4D\u6578\u4E58\u6CD5,\u53EA\u662F\u628A\u8868\u4E0A\u7684\u5C0F\u78DA\u584A\u6309\u4F4D\u503C\u758A\u6210\u5927\u6A13\u3002", "EN: The times table is compressed repeated addition. If one fact slips away, rebuild it from a neighbour: six times nine equals six times ten minus six. Anchors beat rote memory."],
    ["\u{1F9E0} \u539F\u7406:\u500D\u589E\u6578\u5217\u6BCF\u4E00\u6B65\u90FD\u4E58\u4E8C,\u9019\u53EB\u7B49\u6BD4\u6578\u5217,\u9577\u76F8\u548C\u7B49\u5DEE\u5B8C\u5168\u4E0D\u540C:\u524D\u9762\u6162\u541E\u541E,\u5F8C\u9762\u7206\u70B8\u5FEB\u3002\u5224\u65B7\u6578\u5217\u5148\u554F\u4E00\u53E5:\u76F8\u9130\u5169\u6578\u662F\u300C\u5DEE\u56FA\u5B9A\u300D\u9084\u662F\u300C\u500D\u6578\u56FA\u5B9A\u300D?\u9019\u4E00\u554F\u5C31\u5206\u51FA\u5169\u5927\u5BB6\u65CF\u3002", "\u26A0 \u9677\u9631:\u770B\u5230\u6578\u5217\u5C31\u627E\u5DEE\u662F\u7B49\u5DEE\u8166\u7684\u6163\u6027!\u56DB\u3001\u516B\u3001\u5341\u516D\u7684\u5DEE\u662F\u56DB\u548C\u516B,\u4E0D\u56FA\u5B9A\u2014\u2014\u9019\u6642\u8981\u6539\u8A66\u9664\u6CD5,\u767C\u73FE\u500D\u6578\u56FA\u5B9A\u662F\u4E8C,\u624D\u662F\u771F\u898F\u5247\u3002", "\u{1F4A1} \u9077\u79FB:\u7D30\u80DE\u5206\u88C2\u3001\u5C0D\u647A\u7D19\u5F35\u3001\u75C5\u6BD2\u50B3\u64AD\u3001\u9280\u884C\u8907\u5229,\u5168\u662F\u500D\u589E\u3002\u4E00\u5F35\u7D19\u5C0D\u647A\u56DB\u5341\u4E8C\u6B21\u539A\u5EA6\u53EF\u9054\u6708\u7403\u2014\u2014\u6307\u6578\u6210\u9577\u7684\u76F4\u89BA,\u5F9E\u4ECA\u5929\u9019\u689D\u6578\u5217\u958B\u59CB\u990A\u3002", "EN: Doubling sequences multiply instead of add. When gaps between terms keep changing, test ratios instead. Cell division, folded paper and compound interest all grow this explosive way."],
    ["\u{1F9E0} \u539F\u7406:\u8CB7\u6771\u897F\u554F\u984C\u662F\u4E58\u6CD5\u7684\u539F\u751F\u68F2\u606F\u5730:\u55AE\u50F9\u4E58\u6578\u91CF\u7B49\u65BC\u7E3D\u50F9\u3002\u9019\u4E09\u500B\u91CF\u662F\u4E00\u7D44\u9435\u4E09\u89D2,\u77E5\u9053\u4EFB\u4F55\u5169\u500B\u90FD\u80FD\u6C42\u7B2C\u4E09\u500B\u2014\u2014\u6B63\u8457\u7528\u662F\u4E58\u6CD5,\u5012\u8457\u7528\u5C31\u662F\u9664\u6CD5\u3002", "\u26A0 \u9677\u9631:\u5148\u8A8D\u6E05\u8AB0\u662F\u55AE\u50F9\u3001\u8AB0\u662F\u6578\u91CF:\u4E00\u679D\u4E94\u5143\u8CB7\u4E8C\u679D,\u548C\u4E00\u679D\u4E8C\u5143\u8CB7\u4E94\u679D,\u7E3D\u50F9\u76F8\u540C\u4F46\u6545\u4E8B\u4E0D\u540C\u3002\u89D2\u8272\u8A8D\u932F,\u63DB\u500B\u6578\u5B57\u5C31\u6703\u7FFB\u8ECA\u3002", "\u{1F4A1} \u9077\u79FB:\u901F\u7387\u4E58\u6642\u9593\u7B49\u65BC\u8DDD\u96E2\u3001\u6BCF\u76D2\u5E7E\u9846\u4E58\u5E7E\u76D2\u7B49\u65BC\u7E3D\u9846\u6578\u2014\u2014\u4E16\u754C\u4E0A\u5230\u8655\u662F\u9019\u500B\u9435\u4E09\u89D2\u3002\u516D\u5E74\u7D1A\u7684\u901F\u7387\u984C,\u5C31\u662F\u4ECA\u5929\u7684\u8CB7\u6771\u897F\u984C\u63DB\u4E86\u6232\u670D\u3002", "EN: Price times quantity equals total: a triangle where any two values reveal the third. Speed, time and distance form the exact same triangle later on."],
    ["\u{1F9E0} \u539F\u7406:\u4E58\u6CD5\u9006\u5411\u662F\u9664\u6CD5\u7684\u771F\u9762\u76EE:\u554F\u865F\u4E58\u56DB\u7B49\u65BC\u4E8C\u5341\u56DB,\u5C31\u662F\u5728\u554F\u4E8C\u5341\u56DB\u88E1\u88DD\u4E86\u5E7E\u500B\u56DB\u3002\u4E58\u6CD5\u8207\u9664\u6CD5\u4E92\u70BA\u53CD\u5411\u9375,\u548C\u52A0\u6E1B\u7684\u95DC\u4FC2\u4E00\u6A21\u4E00\u6A23\u2014\u2014\u6578\u5B78\u88E1\u6BCF\u6247\u9580\u90FD\u914D\u4E86\u4E00\u628A\u56DE\u982D\u7684\u9470\u5319\u3002", "\u26A0 \u9677\u9631:\u5217\u9664\u6CD5\u6642\u9806\u5E8F\u5225\u53CD:\u662F\u7E3D\u6578\u9664\u4EE5\u5DF2\u77E5\u56E0\u6578,\u4E0D\u662F\u56E0\u6578\u9664\u4EE5\u7E3D\u6578\u3002\u5148\u6307\u51FA\u8AB0\u662F\u7E3D\u6578,\u518D\u4E0B\u7B46\u3002", "\u{1F4A1} \u9077\u79FB:\u89E3\u65B9\u7A0B\u5F0F\u7684\u96DB\u5F62\u5C31\u5728\u9019\u88E1:\u4EE5\u5F8C\u7684\u56DBx\u7B49\u65BC\u4E8C\u5341\u56DB,\u89E3\u6CD5\u8207\u4ECA\u5929\u5B8C\u5168\u76F8\u540C\u3002\u5E73\u5206\u3001\u627E\u55AE\u50F9\u3001\u7B97\u500D\u6578,\u5168\u9760\u9019\u628A\u56DE\u982D\u9470\u5319\u3002", "EN: Reverse multiplication is division in disguise: asking what times four makes twenty four means asking how many fours live inside twenty four. Every operation has an undo key."],
    ["\u{1F9E0} \u539F\u7406:\u690D\u6A39\u554F\u984C\u7684\u9748\u9B42\u662F\u5340\u5206\u300C\u9593\u9694\u300D\u8207\u300C\u7269\u4EF6\u300D:\u5341\u516D\u516C\u5C3A\u6BCF\u4E8C\u516C\u5C3A\u4E00\u68F5,\u6709\u516B\u500B\u9593\u9694,\u4F46\u982D\u5C3E\u90FD\u7A2E\u5C31\u662F\u4E5D\u68F5\u6A39\u2014\u2014\u6A39\u6BD4\u9593\u9694\u591A\u4E00\u3002\u756B\u4E00\u689D\u7DDA\u6BB5\u6A19\u4E0A\u9EDE,\u7ACB\u523B\u770B\u7A7F\u3002", "\u26A0 \u9677\u9631:\u4E09\u7A2E\u60C5\u5883\u4E09\u7A2E\u7B54\u6848:\u982D\u5C3E\u90FD\u7A2E\u662F\u9593\u9694\u52A0\u4E00;\u53EA\u7A2E\u4E00\u982D\u662F\u525B\u597D\u7B49\u65BC\u9593\u9694;\u570D\u6210\u5713\u5708\u662F\u9593\u9694\u6578\u7B49\u65BC\u6A39\u6578\u3002\u5148\u5224\u65B7\u60C5\u5883,\u518D\u5957\u95DC\u4FC2\u3002", "\u{1F4A1} \u9077\u79FB:\u6A13\u68AF\u7684\u968E\u6578\u8207\u6A13\u5C64\u3001\u92F8\u6728\u982D\u7684\u5200\u6578\u8207\u6BB5\u6578\u3001\u639B\u71C8\u7C60\u7684\u7E69\u7D50,\u5168\u662F\u690D\u6A39\u554F\u984C\u3002\u5967\u6578\u88E1\u5B83\u5343\u8B8A\u842C\u5316,\u6838\u5FC3\u6C38\u9060\u662F:\u9EDE\u8207\u6BB5,\u5DEE\u4E00\u500B\u3002", "EN: Fencepost problems hinge on posts versus gaps: with both ends planted, trees outnumber gaps by one. Stairs, log cutting and hanging lanterns all replay this off-by-one drama."],
    ["\u{1F9E0} \u539F\u7406:\u6578\u5B57\u5075\u63A2\u662F\u7528\u689D\u4EF6\u7E2E\u5C0F\u5305\u570D\u5708\u7684\u63A8\u7406\u904A\u6232:\u5169\u4F4D\u6578\u3001\u6578\u5B57\u548C\u662F\u5341\u4E8C\u3001\u5341\u4F4D\u6BD4\u500B\u4F4D\u5927\u56DB\u2014\u2014\u6BCF\u4E00\u689D\u7DDA\u7D22\u90FD\u522A\u6389\u4E00\u6279\u5ACC\u7591\u72AF,\u4EA4\u96C6\u8655\u53EA\u5269\u4E00\u500B\u7B54\u6848\u3002\u9019\u662F\u806F\u7ACB\u65B9\u7A0B\u7684\u5E7C\u5E74\u5F62\u614B\u3002", "\u26A0 \u9677\u9631:\u5225\u6025\u8457\u731C!\u628A\u689D\u4EF6\u4E00\u689D\u4E00\u689D\u7528\u6389,\u5217\u51FA\u6240\u6709\u7B26\u5408\u7B2C\u4E00\u689D\u7684\u5019\u9078\u4EBA,\u518D\u7528\u7B2C\u4E8C\u689D\u7BE9\u3002\u8DF3\u6B65\u9A5F\u7684\u5075\u63A2\u5E38\u6293\u932F\u4EBA\u3002", "\u{1F4A1} \u9077\u79FB:\u548C\u5DEE\u554F\u984C\u3001\u96DE\u5154\u540C\u7C60\u3001\u908F\u8F2F\u8B0E\u984C\u3001\u6578\u7368,\u5168\u662F\u689D\u4EF6\u4EA4\u96C6\u6CD5\u3002\u4EE5\u5F8C\u4EE3\u6578\u628A\u9019\u500B\u904E\u7A0B\u5BEB\u6210\u5169\u689D\u65B9\u7A0B\u5F0F,\u89E3\u6CD5\u601D\u60F3\u4ECA\u5929\u5DF2\u7D93\u5B8C\u5099\u3002", "EN: Digit detective work means shrinking the suspect list clue by clue until one number remains. This is simultaneous equations in embryo, the same logic behind sudoku."],
    ["\u{1F9E0} \u539F\u7406:\u5E73\u5206\u662F\u9664\u6CD5\u7684\u7B2C\u4E8C\u5F35\u81C9:\u7B2C\u4E00\u5F35\u81C9\u554F\u300C\u4E8C\u5341\u56DB\u88E1\u6709\u5E7E\u500B\u56DB\u300D(\u5305\u542B\u9664),\u9019\u5F35\u81C9\u554F\u300C\u4E8C\u5341\u56DB\u5E73\u5206\u6210\u4E09\u4EFD,\u6BCF\u4EFD\u591A\u5C11\u300D(\u7B49\u5206\u9664)\u3002\u7B97\u5F0F\u76F8\u540C\u3001\u554F\u984C\u4E0D\u540C\u2014\u2014\u8A8D\u5F97\u5169\u5F35\u81C9,\u61C9\u7528\u984C\u5C31\u4E0D\u6703\u8FF7\u8DEF\u3002", "\u26A0 \u9677\u9631:\u5E73\u5206\u7684\u524D\u63D0\u662F\u6BCF\u4EFD\u4E00\u6A23\u591A!\u984C\u76EE\u82E5\u8AAA\u6709\u4EBA\u591A\u62FF\u6709\u4EBA\u5C11\u62FF,\u5C31\u4E0D\u80FD\u76F4\u63A5\u9664,\u8981\u5148\u8655\u7406\u591A\u8207\u5C11\u7684\u90E8\u5206\u3002", "\u{1F4A1} \u9077\u79FB:\u5206\u62AB\u85A9\u3001\u5206\u968A\u4F0D\u3001\u5E73\u5747\u5206\u6524\u8ECA\u9322,\u662F\u7B49\u5206\u9664;\u88DD\u888B\u3001\u63DB\u96F6\u9322,\u662F\u5305\u542B\u9664\u3002\u4E94\u5E74\u7D1A\u7684\u5E73\u5747\u6578,\u5C31\u662F\u7B49\u5206\u9664\u7A7F\u4E0A\u7D71\u8A08\u7684\u5916\u8863\u3002", "EN: Division has two faces: how many groups fit inside, and how much each equal share gets. Same calculation, different questions. Averages are equal sharing dressed in statistics."],
    ["\u{1F9E0} \u539F\u7406:\u55AE\u4F4D\u63DB\u7B97\u7684\u672C\u8CEA\u662F\u63DB\u7B97\u7387\u4E58\u6CD5:\u4E00\u516C\u5C3A\u662F\u4E00\u767E\u516C\u5206,\u516B\u516C\u5C3A\u5C31\u662F\u516B\u500B\u4E00\u767E\u516C\u5206\u3002\u55AE\u4F4D\u50CF\u8CA8\u5E63,\u63DB\u7B97\u7387\u5C31\u662F\u532F\u7387\u2014\u2014\u5927\u55AE\u4F4D\u63DB\u5C0F\u55AE\u4F4D\u7528\u4E58\u6CD5,\u56E0\u70BA\u540C\u6A23\u7684\u91CF\u8981\u7528\u66F4\u5C0F\u7684\u5C3A\u53BB\u91CF,\u6578\u5B57\u81EA\u7136\u8B8A\u591A\u3002", "\u26A0 \u9677\u9631:\u65B9\u5411\u6700\u6613\u932F:\u5927\u63DB\u5C0F\u8981\u4E58\u3001\u5C0F\u63DB\u5927\u8981\u9664\u3002\u5148\u554F\u81EA\u5DF1:\u63DB\u5B8C\u4E4B\u5F8C\u6578\u5B57\u61C9\u8A72\u8B8A\u5927\u9084\u662F\u8B8A\u5C0F?\u516C\u5C3A\u63DB\u516C\u5206,\u5C3A\u8B8A\u5C0F\u4E86,\u6578\u5B57\u5FC5\u9808\u8B8A\u5927\u3002", "\u{1F4A1} \u9077\u79FB:\u516C\u65A4\u63DB\u516C\u514B\u3001\u5C0F\u6642\u63DB\u5206\u9418\u3001\u516C\u5347\u63DB\u6BEB\u5347,\u5168\u662F\u540C\u4E00\u5957\u532F\u7387\u601D\u7DAD\u3002\u4EE5\u5F8C\u7406\u5316\u8AB2\u7684\u55AE\u4F4D\u63DB\u7B97\u93C8,\u5C31\u662F\u4ECA\u5929\u9019\u4E00\u6B65\u7684\u9023\u7E8C\u6280\u3002", "EN: Unit conversion is multiplying by an exchange rate. Going from big units to small units multiplies the number, because a smaller ruler needs more ticks to cover the same length."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u65B9\u5F62\u9762\u7A4D\u7B49\u65BC\u9577\u4E58\u5BEC,\u539F\u56E0\u85CF\u5728\u65B9\u683C\u88E1:\u9577\u662F\u4E00\u6392\u6709\u5E7E\u683C,\u5BEC\u662F\u6709\u5E7E\u6392,\u76F8\u4E58\u5C31\u662F\u7E3D\u683C\u6578\u3002\u516C\u5F0F\u662F\u6578\u683C\u5B50\u7684\u58D3\u7E2E\u6A94\u2014\u2014\u6703\u89E3\u58D3\u7E2E\u7684\u4EBA,\u5FD8\u4E86\u516C\u5F0F\u4E5F\u80FD\u81EA\u5DF1\u91CD\u65B0\u767C\u660E\u5B83\u3002", "\u26A0 \u9677\u9631:\u9762\u7A4D\u7684\u55AE\u4F4D\u662F\u5E73\u65B9\u516C\u5206,\u4E0D\u662F\u516C\u5206!\u7B97\u5B8C\u8A18\u5F97\u5E6B\u7B54\u6848\u7A7F\u5C0D\u5916\u5957\u3002\u9577\u5EA6\u55AE\u4F4D\u548C\u9762\u7A4D\u55AE\u4F4D\u6DF7\u7A7F,\u662F\u8003\u5377\u4E0A\u7684\u7D93\u5178\u5931\u5206\u9EDE\u3002", "\u{1F4A1} \u9077\u79FB:\u4E09\u89D2\u5F62\u9762\u7A4D(\u9577\u65B9\u5F62\u7684\u4E00\u534A)\u3001\u5E73\u884C\u56DB\u908A\u5F62(\u63A8\u6B6A\u7684\u9577\u65B9\u5F62)\u3001\u68AF\u5F62,\u5168\u90FD\u5F9E\u9577\u65B9\u5F62\u8B8A\u5F62\u800C\u4F86\u3002\u638C\u63E1\u9019\u4E00\u683C,\u5F8C\u9762\u6574\u500B\u9762\u7A4D\u5BB6\u65CF\u90FD\u662F\u89AA\u621A\u3002", "EN: Length times width works because length counts cells per row and width counts rows. Every later area formula, from triangles to trapezoids, is this rectangle reshaped."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u65B9\u5F62\u5468\u9577\u662F\u4E8C\u4E58\u9577\u52A0\u5BEC:\u8D70\u4E00\u5708\u6703\u7D93\u904E\u5169\u689D\u9577\u908A\u548C\u5169\u689D\u5BEC\u908A,\u5148\u628A\u4E00\u9577\u4E00\u5BEC\u914D\u6210\u4E00\u5C0D,\u518D\u4E58\u4E8C\u3002\u628A\u56DB\u500B\u6578\u7684\u52A0\u6CD5\u6574\u7406\u6210\u4E00\u6B21\u4E58\u6CD5,\u53C8\u662F\u300C\u767C\u73FE\u91CD\u8907\u3001\u6253\u5305\u91CD\u8907\u300D\u7684\u8001\u667A\u6167\u3002", "\u26A0 \u9677\u9631:\u5225\u548C\u9762\u7A4D\u641E\u6DF7:\u5468\u9577\u554F\u908A\u754C\u4E00\u5708\u591A\u9577,\u55AE\u4F4D\u662F\u516C\u5206;\u9762\u7A4D\u554F\u88E1\u9762\u591A\u5927,\u55AE\u4F4D\u662F\u5E73\u65B9\u516C\u5206\u3002\u984C\u76EE\u8B80\u5B8C\u5148\u6A19\u8A18\u5B83\u554F\u7684\u662F\u5708\u9084\u662F\u9762\u3002", "\u{1F4A1} \u9077\u79FB:\u570D\u7C6C\u7B06\u3001\u9472\u76F8\u6846\u3001\u7E2B\u684C\u5E03\u908A,\u5168\u662F\u5468\u9577\u3002\u4E4B\u5F8C\u7684\u5468\u9577\u9006\u63A8(\u77E5\u9053\u5468\u9577\u6C42\u908A\u9577),\u5C31\u662F\u628A\u4ECA\u5929\u7684\u516C\u5F0F\u5012\u8457\u958B\u3002", "EN: A rectangle walk covers two lengths and two widths, so pair one of each and double it. Fences and picture frames are perimeter; carpets and paint are area. Never mix the two."],
    ["\u{1F9E0} \u539F\u7406:\u4E00\u76F4\u7DDA\u6524\u958B\u4F86\u5C31\u662F\u4E00\u767E\u516B\u5341\u5EA6\u2014\u2014\u9019\u53EB\u5E73\u89D2\u3002\u4E00\u689D\u76F4\u7DDA\u88AB\u5206\u6210\u5169\u500B\u89D2,\u5B83\u5011\u5408\u8D77\u4F86\u5FC5\u662F\u4E00\u767E\u516B\u5341\u5EA6,\u77E5\u9053\u5176\u4E2D\u4E00\u500B,\u53E6\u4E00\u500B\u7528\u6E1B\u6CD5\u7ACB\u73FE\u3002\u89D2\u5EA6\u4E16\u754C\u7684\u5B88\u6046\u5F8B,\u5F9E\u9019\u689D\u76F4\u7DDA\u958B\u59CB\u3002", "\u26A0 \u9677\u9631:\u5148\u78BA\u8A8D\u5169\u500B\u89D2\u771F\u7684\u5171\u7528\u540C\u4E00\u689D\u76F4\u7DDA!\u53EA\u662F\u770B\u8D77\u4F86\u9760\u5728\u4E00\u8D77\u7684\u5169\u500B\u89D2\u6C92\u6709\u9019\u500B\u95DC\u4FC2\u3002\u5E7E\u4F55\u88E1\u300C\u770B\u8D77\u4F86\u300D\u4E0D\u7B97\u6578,\u300C\u5171\u7DDA\u300D\u624D\u7B97\u6578\u3002", "\u{1F4A1} \u9077\u79FB:\u56DB\u5E74\u7D1A\u7684\u88DC\u89D2\u3001\u4E09\u89D2\u5F62\u5167\u89D2\u548C(\u6495\u4E0B\u4E09\u500B\u89D2\u62FC\u6210\u4E00\u76F4\u7DDA)\u3001\u5C0D\u9802\u89D2\u76F8\u7B49,\u5168\u90FD\u5EFA\u7ACB\u5728\u5E73\u89D2\u4E00\u767E\u516B\u5341\u5EA6\u4E4B\u4E0A\u3002\u9019\u662F\u89D2\u5EA6\u63A8\u7406\u7684\u7B2C\u4E00\u584A\u5730\u57FA\u3002", "EN: A straight line opens into one hundred eighty degrees. Two angles sharing that line must sum to it, so one subtraction reveals the missing angle. All angle chasing starts here."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u548C\u5BEC\u5404\u52A0\u4E00,\u65B0\u9762\u7A4D\u4E0D\u662F\u820A\u9762\u7A4D\u52A0\u4E00!\u9762\u7A4D\u662F\u76F8\u4E58\u7684\u95DC\u4FC2,\u908A\u9577\u7684\u5C0F\u6539\u8B8A\u6703\u88AB\u53E6\u4E00\u908A\u653E\u5927\u3002\u6700\u7A69\u7684\u505A\u6CD5:\u5148\u7B97\u51FA\u65B0\u7684\u9577\u8207\u5BEC,\u518D\u91CD\u65B0\u76F8\u4E58\u2014\u2014\u8B8A\u5316\u984C\u6C38\u9060\u5148\u66F4\u65B0\u72C0\u614B\u3001\u518D\u5957\u516C\u5F0F\u3002", "\u26A0 \u9677\u9631:\u76F4\u89BA\u6703\u8AAA\u300C\u5404\u52A0\u4E00\u6240\u4EE5\u9762\u7A4D\u52A0\u4E8C\u300D,\u9019\u662F\u628A\u4E58\u6CD5\u7576\u52A0\u6CD5\u7684\u7ECF\u5178\u5E7B\u89BA\u3002\u756B\u5716\u770B\u770B:\u591A\u51FA\u4F86\u7684\u662F\u4E00\u689D\u6A6B\u689D\u3001\u4E00\u689D\u76F4\u689D\u3001\u9084\u6709\u89D2\u843D\u4E00\u5C0F\u584A\u3002", "\u{1F4A1} \u9077\u79FB:\u9019\u984C\u5077\u5077\u57CB\u4E86\u5206\u914D\u5F8B:\u65B0\u9762\u7A4D\u5C55\u958B\u6B63\u662F\u539F\u9762\u7A4D\u52A0\u9577\u52A0\u5BEC\u52A0\u4E00\u3002\u570B\u4E2D\u7684\u4E58\u6CD5\u516C\u5F0F(\u5169\u6578\u548C\u7684\u5E73\u65B9),\u5716\u50CF\u7248\u4ECA\u5929\u5DF2\u7D93\u898B\u904E\u3002", "EN: Growing both sides by one grows the area by a strip, another strip and a corner, never by just two. Update the new length and width first, then multiply again."],
    ["\u{1F9E0} \u539F\u7406:\u5169\u500B\u6B63\u65B9\u5F62\u62FC\u6210\u9577\u65B9\u5F62,\u65B0\u5716\u5F62\u7684\u908A\u9577\u8981\u91CD\u65B0\u76E4\u9EDE:\u9577\u908A\u662F\u5169\u500B\u908A\u9577\u63A5\u529B,\u5BEC\u908A\u7DAD\u6301\u539F\u6A23\u3002\u62FC\u7D44\u5408\u5716\u5F62\u7684\u9435\u5F8B\u662F\u2014\u2014\u5225\u6025\u8457\u5957\u516C\u5F0F,\u5148\u5F04\u6E05\u695A\u6BCF\u4E00\u689D\u65B0\u908A\u662F\u8AB0\u63A5\u8AB0\u3002", "\u26A0 \u9677\u9631:\u62FC\u63A5\u8655\u7684\u908A\u6D88\u5931\u4E86!\u5169\u500B\u6B63\u65B9\u5F62\u5167\u90E8\u76F8\u8CBC\u7684\u90A3\u5169\u689D\u908A\u4E0D\u518D\u662F\u5916\u570D,\u7B97\u5468\u9577\u6642\u6700\u5BB9\u6613\u591A\u7B97\u5B83\u5011\u3002\u63CF\u4E00\u6B21\u5916\u6846,\u53EA\u7B97\u63CF\u5230\u7684\u908A\u3002", "\u{1F4A1} \u9077\u79FB:\u56DB\u5E74\u7D1A\u7684\u8907\u5408\u9762\u7A4D\u3001L \u5F62\u5716\u5F62\u3001\u76F8\u6846\u6316\u6D1E,\u5168\u662F\u62FC\u8207\u62C6\u7684\u904A\u6232\u3002\u8907\u96DC\u5716\u5F62\u7B49\u65BC\u7C21\u55AE\u5716\u5F62\u7684\u52A0\u6E1B\u6CD5\u2014\u2014\u9019\u500B\u773C\u5149\u6BD4\u4EFB\u4F55\u516C\u5F0F\u90FD\u503C\u9322\u3002", "EN: When shapes join, inner edges vanish from the outline. Trace the new outer boundary before computing anything. Complex figures are simple shapes added or subtracted."],
    ["\u{1F9E0} \u539F\u7406:\u5468\u9577\u9006\u63A8\u662F\u516C\u5F0F\u5012\u8457\u958B:\u6B63\u65B9\u5F62\u5468\u9577\u662F\u908A\u9577\u4E58\u56DB,\u90A3\u9EBC\u908A\u9577\u5C31\u662F\u5468\u9577\u9664\u4EE5\u56DB\u3002\u6BCF\u500B\u516C\u5F0F\u90FD\u662F\u96D9\u5411\u9053\u2014\u2014\u6B63\u8457\u8D70\u662F\u8A08\u7B97,\u5012\u8457\u8D70\u662F\u89E3\u8B0E\u3002\u6703\u5012\u958B\u516C\u5F0F\u7684\u4EBA,\u7B49\u65BC\u591A\u4E86\u4E00\u500D\u7684\u5DE5\u5177\u3002", "\u26A0 \u9677\u9631:\u5012\u63A8\u524D\u5148\u78BA\u8A8D\u5716\u5F62!\u6B63\u65B9\u5F62\u9664\u4EE5\u56DB\u3001\u6B63\u4E09\u89D2\u5F62\u9664\u4EE5\u4E09\u3001\u9577\u65B9\u5F62\u8981\u5148\u6E1B\u518D\u9664\u3002\u516C\u5F0F\u7D81\u5B9A\u5716\u5F62,\u62FF\u932F\u516C\u5F0F\u5012\u8457\u958B\u6703\u5168\u932F\u3002", "\u{1F4A1} \u9077\u79FB:\u9762\u7A4D\u9006\u63A8(\u77E5\u9762\u7A4D\u6C42\u908A)\u3001\u9AD4\u7A4D\u9006\u63A8\u3001\u901F\u7387\u53CD\u63A8\u6642\u9593,\u5168\u662F\u9006\u5411\u5DE5\u7A0B\u3002\u5DE5\u7A0B\u5E2B\u62C6\u89E3\u7522\u54C1\u3001\u5075\u63A2\u9084\u539F\u73FE\u5834,\u7528\u7684\u90FD\u662F\u9019\u7A2E\u5012\u8457\u8D70\u7684\u8166\u3002", "EN: Reverse perimeter means driving the formula backwards: divide by four for a square. Every formula is a two way street, and reverse engineering doubles your toolkit."]
  ],
  3: [
    ["\u{1F9E0} \u539F\u7406:\u4E58\u6574\u5341\u6578\u6709\u500B\u6F02\u4EAE\u6377\u5F91:\u516D\u4E58\u4E8C\u5341\u7B49\u65BC\u516D\u4E58\u4E8C\u518D\u88DC\u4E00\u500B\u96F6\u3002\u56E0\u70BA\u4E8C\u5341\u5C31\u662F\u4E8C\u500B\u5341,\u5148\u7B97\u300C\u5E7E\u500B\u300D\u518D\u8655\u7406\u300C\u5341\u300D\u2014\u2014\u628A\u4F4D\u503C\u62C6\u51FA\u4F86\u55AE\u7368\u8655\u7406,\u662F\u6240\u6709\u5927\u6578\u4E58\u6CD5\u7684\u6838\u5FC3\u5F15\u64CE\u3002", "\u26A0 \u9677\u9631:\u88DC\u96F6\u8981\u6578\u6E05\u695A:\u4E58\u4E8C\u5341\u88DC\u4E00\u500B\u96F6\u3001\u4E58\u4E8C\u767E\u88DC\u5169\u500B\u96F6\u3002\u96F6\u662F\u4F4D\u503C\u7684\u4F54\u4F4D\u7B26,\u591A\u4E00\u500B\u5C11\u4E00\u500B,\u7B54\u6848\u5DEE\u5341\u500D\u3002", "\u{1F4A1} \u9077\u79FB:\u56DB\u5E74\u7D1A\u7684\u591A\u4F4D\u6578\u4E58\u6CD5\u5C31\u662F\u9019\u62DB\u7684\u5168\u9762\u5C55\u958B:\u6BCF\u4E00\u4F4D\u5206\u958B\u4E58\u3001\u6309\u4F4D\u503C\u88DC\u96F6\u3001\u6700\u5F8C\u76F8\u52A0\u3002\u4ECA\u5929\u7DF4\u7684\u662F\u5F15\u64CE\u7684\u55AE\u7F38\u7248\u672C\u3002", "EN: Multiplying by twenty means multiplying by two then appending a zero, because twenty is two tens. Splitting off the place value powers every big multiplication later."],
    ["\u{1F9E0} \u539F\u7406:\u9664\u6CD5\u554F\u7684\u662F\u300C\u88E1\u9762\u88DD\u4E86\u5E7E\u500B\u300D:\u4E8C\u5341\u4E94\u9664\u4EE5\u4E94,\u554F\u4E8C\u5341\u4E94\u88E1\u6709\u5E7E\u7D44\u4E94\u3002\u5B83\u548C\u4E58\u6CD5\u5171\u7528\u540C\u4E00\u5F35\u8868\u2014\u2014\u60F3\u9664\u6CD5\u6642,\u8166\u4E2D\u8DD1\u7684\u5176\u5BE6\u662F\u300C\u4E94\u4E58\u5E7E\u7B49\u65BC\u4E8C\u5341\u4E94\u300D\u3002\u9664\u6CD5\u4E0D\u662F\u65B0\u6280\u80FD,\u662F\u4E58\u6CD5\u8868\u7684\u53CD\u67E5\u3002", "\u26A0 \u9677\u9631:\u88AB\u9664\u6578\u8207\u9664\u6578\u7684\u4F4D\u7F6E\u4E0D\u53EF\u4EA4\u63DB!\u4E8C\u5341\u4E94\u9664\u4EE5\u4E94\u548C\u4E94\u9664\u4EE5\u4E8C\u5341\u4E94\u662F\u5B8C\u5168\u4E0D\u540C\u7684\u554F\u984C\u3002\u5148\u8A8D\u6E05\u8AB0\u662F\u7E3D\u91CF\u3001\u8AB0\u662F\u6BCF\u7D44\u7684\u5927\u5C0F\u3002", "\u{1F4A1} \u9077\u79FB:\u5206\u88DD\u3001\u627E\u55AE\u50F9\u3001\u6C42\u500D\u6578\u3001\u5316\u7C21\u5206\u6578,\u5168\u90FD\u53CD\u67E5\u4E58\u6CD5\u8868\u3002\u4E58\u6CD5\u8868\u8D8A\u719F,\u9664\u6CD5\u8D8A\u50CF\u76F4\u89BA\u3002", "EN: Division asks how many groups fit inside a total, and the answer hides in the times table you already own: twenty five divided by five is just five times what makes twenty five."],
    ["\u{1F9E0} \u539F\u7406:\u6C42\u4E00\u500B\u6578\u7684\u5E7E\u5206\u4E4B\u4E00,\u5C31\u662F\u628A\u5B83\u5E73\u5206:\u5341\u7684\u4E8C\u5206\u4E4B\u4E00,\u662F\u628A\u5341\u5207\u6210\u5169\u7B49\u4EFD\u53D6\u4E00\u4EFD,\u4E5F\u5C31\u662F\u5341\u9664\u4EE5\u4E8C\u3002\u5206\u6578\u4E0D\u662F\u65B0\u7684\u6578,\u5B83\u662F\u300C\u9664\u6CD5\u9084\u6C92\u505A\u5B8C\u300D\u7684\u6A23\u5B50\u2014\u2014\u4E0A\u9762\u662F\u88AB\u9664\u6578,\u4E0B\u9762\u662F\u9664\u6578\u3002", "\u26A0 \u9677\u9631:\u5206\u6BCD\u662F\u5207\u6210\u5E7E\u4EFD,\u5206\u5B50\u662F\u53D6\u5E7E\u4EFD,\u9806\u5E8F\u4E0D\u53EF\u985B\u5012\u3002\u4E8C\u5206\u4E4B\u4E00\u662F\u5207\u4E8C\u53D6\u4E00,\u4E0D\u662F\u5207\u4E00\u53D6\u4E8C\u3002\u5148\u5207\u5F8C\u53D6,\u6C38\u9060\u7167\u9019\u500B\u9806\u5E8F\u60F3\u3002", "\u{1F4A1} \u9077\u79FB:\u4E94\u5E74\u7D1A\u7684\u5206\u6578\u4E58\u6CD5(\u53D6\u5E7E\u4EFD\u5C31\u4E58\u5E7E)\u3001\u5206\u6578\u5316\u5C0F\u6578(\u628A\u9664\u6CD5\u771F\u7684\u505A\u5B8C),\u5168\u5F9E\u4ECA\u5929\u9019\u4E00\u5200\u958B\u59CB\u3002\u62AB\u85A9\u3001\u86CB\u7CD5\u3001\u6642\u9418,\u90FD\u662F\u5206\u6578\u7684\u6559\u5177\u3002", "EN: One half of ten means cutting ten into two equal parts and taking one, which is simply ten divided by two. A fraction is a division waiting to be finished."],
    ["\u{1F9E0} \u539F\u7406:\u9918\u6578\u662F\u9664\u6CD5\u8AA0\u5BE6\u7684\u4E00\u9762:\u4E8C\u5341\u4E94\u9664\u4EE5\u4E09,\u88DD\u6EFF\u516B\u7D44\u5F8C\u5269\u4E00\u500B,\u5546\u516B\u9918\u4E00\u3002\u9918\u6578\u5FC5\u5B9A\u5C0F\u65BC\u9664\u6578\u2014\u2014\u5982\u679C\u9918\u6578\u9084\u5920\u88DD\u4E00\u7D44,\u8868\u793A\u5546\u6578\u5C11\u7B97\u4E86\u3002\u9019\u689D\u300C\u9918\u6578\u5C0F\u65BC\u9664\u6578\u300D\u662F\u6AA2\u67E5\u9664\u6CD5\u7684\u514D\u8CBB\u8B66\u5831\u5668\u3002", "\u26A0 \u9677\u9631:\u9918\u6578\u4E0D\u80FD\u4E1F!\u61C9\u7528\u984C\u88E1\u5269\u4E0B\u7684\u90A3\u4E00\u500B\u5E38\u5E38\u624D\u662F\u4E3B\u89D2:\u4E8C\u5341\u4E94\u4EBA\u642D\u4E09\u4EBA\u5EA7\u7684\u8ECA,\u516B\u53F0\u8ECA\u5750\u4E0D\u5B8C,\u5269\u4E0B\u7684\u4E00\u4EBA\u4E5F\u9700\u8981\u4E00\u53F0\u2014\u2014\u7B54\u6848\u662F\u4E5D\u53F0\u3002", "\u{1F4A1} \u9077\u79FB:\u661F\u671F\u8A08\u7B97\u3001\u9031\u671F\u554F\u984C\u3001\u6642\u9418\u3001\u5BC6\u78BC\u5B78\u88E1\u7684\u6A21\u904B\u7B97,\u9918\u6578\u7121\u6240\u4E0D\u5728\u3002\u5967\u6578\u7684\u661F\u671F\u9031\u671F\u984C,\u5C31\u662F\u9918\u6578\u5075\u63A2\u7684\u5BE6\u6230\u4EFB\u52D9\u3002", "EN: The remainder is what refuses to fit, and it must stay smaller than the divisor. In word problems the leftover often matters most: one stranded person still needs a whole car."],
    ["\u{1F9E0} \u539F\u7406:\u6642\u9593\u8A08\u7B97\u662F\u516D\u5341\u9032\u4F4D\u7684\u4E16\u754C:\u516D\u5341\u5206\u624D\u9032\u4E00\u5C0F\u6642,\u548C\u6EFF\u5341\u9032\u4F4D\u7684\u898F\u5247\u4E0D\u540C\u3002\u8A08\u7B97\u8DE8\u5C0F\u6642\u7684\u6642\u9593,\u5148\u628A\u300C\u5E7E\u9EDE\u958B\u59CB\u3001\u7D93\u904E\u591A\u4E45\u300D\u62C6\u6210\u5C0F\u6642\u548C\u5206\u9418\u5169\u689D\u8ECC\u9053\u5206\u958B\u8655\u7406,\u518D\u5408\u4F75\u3002", "\u26A0 \u9677\u9631:\u5206\u9418\u76F8\u52A0\u8D85\u904E\u516D\u5341\u8981\u9032\u4F4D\u6210\u4E00\u5C0F\u6642,\u6700\u5BB9\u6613\u5FD8\u3002\u53E6\u4E00\u500B\u9677\u9631\u662F\u5341\u4E8C\u5C0F\u6642\u5236\u7684\u4E2D\u5348\u8207\u5348\u591C\u2014\u2014\u4E03\u9EDE\u662F\u65E9\u662F\u665A,\u5148\u770B\u6E05\u695A\u3002", "\u{1F4A1} \u9077\u79FB:\u96FB\u5F71\u6563\u5834\u3001\u70E4\u7BB1\u8A08\u6642\u3001\u706B\u8ECA\u6642\u523B\u8868\u3001\u6642\u5340\u63DB\u7B97,\u5168\u662F\u516D\u5341\u9032\u4F4D\u7684\u5BE6\u6230\u3002\u4EE5\u5F8C\u89D2\u5EA6\u7684\u5EA6\u5206\u79D2,\u7528\u7684\u4E5F\u662F\u540C\u4E00\u5957\u516D\u5341\u9032\u4F4D\u3002", "EN: Clocks run on base sixty: minutes carry into hours at sixty, not ten. Split any duration into an hour track and a minute track, then merge. Angles later use the same base."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u65B9\u5F62\u5468\u9577\u4E8C\u4E58\u9577\u52A0\u5BEC\u2014\u2014\u4E00\u5708\u8DEF\u7A0B\u88E1\u9577\u8207\u5BEC\u5404\u51FA\u73FE\u5169\u6B21,\u5148\u914D\u5C0D\u518D\u7FFB\u500D\u3002\u6B63\u65B9\u5F62\u662F\u9577\u65B9\u5F62\u7684\u7279\u4F8B(\u9577\u7B49\u65BC\u5BEC),\u6240\u4EE5\u516C\u5F0F\u9000\u5316\u6210\u908A\u9577\u4E58\u56DB\u3002\u7279\u4F8B\u8207\u901A\u4F8B\u7684\u95DC\u4FC2,\u662F\u6578\u5B78\u88E1\u53CD\u8986\u51FA\u73FE\u7684\u98A8\u666F\u3002", "\u26A0 \u9677\u9631:\u984C\u76EE\u7D66\u7684\u5169\u500B\u6578\u5B57\u672A\u5FC5\u90FD\u662F\u8981\u7528\u7684\u908A:\u6709\u6642\u7D66\u7684\u662F\u5468\u9577\u8981\u53CD\u6C42\u908A\u3002\u5148\u756B\u5716\u6A19\u6578\u5B57,\u78BA\u8A8D\u6BCF\u500B\u6578\u5B57\u5728\u5716\u4E0A\u7684\u4F4D\u7F6E\u518D\u5217\u5F0F\u3002", "\u{1F4A1} \u9077\u79FB:\u64CD\u5834\u8DD1\u9053\u3001\u756B\u6846\u3001\u82B1\u5703\u570D\u6B04\u3002\u4E4B\u5F8C\u7684\u5468\u9577\u9006\u63A8\u8207\u8907\u5408\u5716\u5F62\u5468\u9577,\u90FD\u5EFA\u7ACB\u5728\u4ECA\u5929\u9019\u689D\u300C\u4E00\u5708\u7B49\u65BC\u5169\u9577\u5169\u5BEC\u300D\u4E0A\u3002", "EN: One lap of a rectangle covers each side twice, so pair a length with a width and double the pair. A square is just the special case where the pair happens to match."],
    ["\u{1F9E0} \u539F\u7406:\u96DE\u5154\u540C\u7C60\u7684\u6BBA\u624B\u9427\u662F\u5047\u8A2D\u6CD5:\u5047\u8A2D\u56DB\u96BB\u5168\u662F\u96DE,\u8173\u53EA\u6709\u516B\u96BB,\u6BD4\u5BE6\u969B\u5C11\u4E86\u56DB\u96BB\u2014\u2014\u6BCF\u628A\u4E00\u96BB\u96DE\u63DB\u6210\u5154\u591A\u5169\u96BB\u8173,\u6240\u4EE5\u8981\u63DB\u5169\u6B21:\u5154\u5B50\u4E8C\u96BB\u3002\u7528\u300C\u5168\u90E8\u5047\u8A2D\u6210\u4E00\u7A2E\u300D\u91CF\u51FA\u843D\u5DEE,\u518D\u7528\u843D\u5DEE\u53CD\u63A8,\u662F\u5967\u6578\u6700\u83EF\u9E97\u7684\u4E00\u62DB\u3002", "\u26A0 \u9677\u9631:\u7B97\u51FA\u300C\u63DB\u5E7E\u6B21\u300D\u4E4B\u5F8C,\u5225\u5FD8\u4E86\u78BA\u8A8D\u63DB\u51FA\u4F86\u7684\u662F\u5154\u9084\u662F\u96DE!\u5047\u8A2D\u5168\u662F\u96DE,\u88DC\u8173\u88DC\u51FA\u4F86\u7684\u662F\u5154\u5B50\u3002\u6700\u5F8C\u7528\u982D\u6578\u548C\u8173\u6578\u5404\u9A57\u7B97\u4E00\u6B21\u3002", "\u{1F4A1} \u9077\u79FB:\u5047\u8A2D\u6CD5\u901A\u5403\u4E00\u5927\u7247:\u5927\u5C0F\u8239\u8F09\u4EBA\u3001\u5C0D\u932F\u984C\u8A08\u5206\u3001\u548C\u5DEE\u554F\u984C,\u5168\u80FD\u7528\u3002\u5B83\u7684\u9032\u968E\u5F62\u614B\u5C31\u662F\u570B\u4E2D\u7684\u4E8C\u5143\u4E00\u6B21\u65B9\u7A0B\u7D44\u2014\u2014\u5047\u8A2D\u6CD5\u662F\u4E0D\u7528 x \u7684\u65B9\u7A0B\u5F0F\u3002", "EN: Assume every animal is a chicken, count the missing feet, and each swap to a rabbit adds two. The gap tells you the rabbit count. This assumption trick is algebra without letters."],
    ["\u{1F9E0} \u539F\u7406:\u661F\u671F\u662F\u9031\u671F\u4E03\u7684\u5FAA\u74B0,\u7834\u89E3\u6CD5\u662F\u9664\u4EE5\u4E03\u770B\u9918\u6578:\u904E\u5341\u516D\u5929,\u5341\u516D\u9664\u4EE5\u4E03\u9918\u4E8C,\u5C31\u5F9E\u4ECA\u5929\u5F80\u5F8C\u64A5\u5169\u5929\u3002\u5E7E\u767E\u5E7E\u5343\u5929\u4EE5\u5F8C\u662F\u661F\u671F\u5E7E,\u90FD\u88AB\u9918\u6578\u4E00\u6B65\u62C9\u56DE\u4E00\u9031\u4E4B\u5167\u2014\u2014\u9019\u662F\u9918\u6578\u5075\u63A2\u7684\u6700\u5F37\u61C9\u7528\u3002", "\u26A0 \u9677\u9631:\u300C\u518D\u904E\u300D\u8207\u300C\u5F8C\u7684\u7B2C\u300D\u5DEE\u4E00\u5929:\u518D\u904E\u5341\u516D\u5929\u662F\u5F80\u5F8C\u64A5\u5341\u516D\u683C;\u7B2C\u5341\u516D\u5929\u53EF\u80FD\u542B\u4ECA\u5929\u3002\u5148\u78BA\u8A8D\u8D77\u9EDE\u7B97\u4E0D\u7B97\u5728\u5167,\u518D\u52D5\u624B\u3002", "\u{1F4A1} \u9077\u79FB:\u5341\u4E8C\u751F\u8096(\u9031\u671F\u5341\u4E8C)\u3001\u6708\u76F8(\u7D04\u4E8C\u5341\u4E5D\u9EDE\u4E94\u5929)\u3001\u7A0B\u5F0F\u88E1\u7684\u53D6\u9918\u904B\u7B97,\u5168\u662F\u540C\u4E00\u628A\u9470\u5319\u3002\u9918\u6578\u628A\u7121\u9650\u9577\u7684\u6642\u9593\u8EF8\u6372\u6210\u4E00\u500B\u5C0F\u5713\u5708\u3002", "EN: Weekdays cycle in sevens, so divide the days by seven and step forward by the remainder. The remainder folds an endless timeline into one small circle."],
    ["\u{1F9E0} \u539F\u7406:\u4E09\u4F4D\u6578\u52A0\u6E1B\u662F\u4F4D\u503C\u7CFB\u7D71\u7684\u5B8C\u6574\u7248:\u500B\u4F4D\u3001\u5341\u4F4D\u3001\u767E\u4F4D\u5404\u81EA\u5C0D\u9F4A\u3001\u5404\u81EA\u904B\u7B97,\u6EFF\u5341\u9032\u4F4D\u3001\u4E0D\u5920\u501F\u4F4D\u3002\u4F4D\u6578\u8B8A\u591A,\u898F\u5247\u4E00\u689D\u90FD\u6C92\u8B8A\u2014\u2014\u7406\u89E3\u4E86\u7CFB\u7D71,\u5927\u6578\u5B57\u53EA\u662F\u300C\u66F4\u591A\u5C64\u7684\u540C\u4E00\u4EF6\u4E8B\u300D\u3002", "\u26A0 \u9677\u9631:\u9023\u7E8C\u9032\u4F4D\u8207\u9023\u7E8C\u501F\u4F4D\u662F\u4E3B\u8981\u5931\u5206\u9EDE:\u500B\u4F4D\u9032\u5230\u5341\u4F4D\u3001\u5341\u4F4D\u53C8\u525B\u597D\u6EFF\u5341\u518D\u9032\u767E\u4F4D\u3002\u4E00\u6B65\u4E00\u6B65\u5BEB\u6E05\u695A,\u4E0D\u8981\u5728\u8166\u4E2D\u758A\u4E09\u5C64\u3002", "\u{1F4A1} \u9077\u79FB:\u56DB\u4F4D\u6578\u3001\u66F4\u5927\u6578\u3001\u5C0F\u6578\u52A0\u6E1B,\u5168\u662F\u540C\u4E00\u5957\u3002\u9280\u884C\u5C0D\u5E33\u3001\u4EBA\u53E3\u7D71\u8A08,\u4F4D\u503C\u7CFB\u7D71\u6490\u8D77\u4E86\u6240\u6709\u5927\u6578\u904B\u7B97\u3002", "EN: Three digit arithmetic is the full place value system: align each column, carry and borrow as needed. Bigger numbers add layers, never new rules."],
    ["\u{1F9E0} \u539F\u7406:\u516C\u65A4\u8207\u516C\u514B\u7684\u532F\u7387\u662F\u4E00\u5343:\u4E00\u516C\u65A4\u7B49\u65BC\u4E00\u5343\u516C\u514B,\u4E94\u516C\u65A4\u5C31\u662F\u4E94\u500B\u4E00\u5343\u3002\u63DB\u7B97\u7387\u70BA\u4EC0\u9EBC\u662F\u4E00\u5343?\u56E0\u70BA\u300C\u516C\u300D\u5236\u55AE\u4F4D\u6BCF\u4E00\u7D1A\u4E4B\u9593\u90FD\u7528\u5341\u3001\u767E\u3001\u5343\u7684\u968E\u68AF\u8A2D\u8A08\u2014\u2014\u9019\u662F\u5168\u4E16\u754C\u901A\u7528\u7684\u5EA6\u91CF\u8861\u8A9E\u8A00\u3002", "\u26A0 \u9677\u9631:\u5927\u63DB\u5C0F\u4E58\u4E00\u5343\u3001\u5C0F\u63DB\u5927\u9664\u4EE5\u4E00\u5343,\u65B9\u5411\u60F3\u6E05\u695A\u518D\u52D5\u7B46\u3002\u6AA2\u67E5\u6CD5:\u63DB\u5B8C\u4E4B\u5F8C,\u55AE\u4F4D\u8B8A\u5C0F\u6578\u5B57\u5FC5\u9808\u8B8A\u5927,\u5426\u5247\u4E00\u5B9A\u5F04\u53CD\u4E86\u3002", "\u{1F4A1} \u9077\u79FB:\u516C\u91CC\u8207\u516C\u5C3A\u3001\u516C\u5347\u8207\u6BEB\u5347,\u532F\u7387\u540C\u6A23\u662F\u4E00\u5343\u3002\u638C\u63E1\u9019\u5EA7\u968E\u68AF,\u7406\u5316\u8AB2\u7684\u55AE\u4F4D\u63DB\u7B97\u93C8\u53EA\u662F\u591A\u8D70\u5E7E\u968E\u3002", "EN: Kilograms exchange into grams at a rate of one thousand. Metric units climb a staircase of tens, hundreds and thousands, the same ladder for length, mass and volume."],
    ["\u{1F9E0} \u539F\u7406:\u4E09\u89D2\u5F62\u5167\u89D2\u548C\u6046\u70BA\u4E00\u767E\u516B\u5341\u5EA6\u2014\u2014\u628A\u4E09\u500B\u89D2\u6495\u4E0B\u4F86\u62FC\u5728\u4E00\u8D77,\u525B\u597D\u6392\u6210\u4E00\u689D\u76F4\u7DDA\u3002\u6240\u4EE5\u77E5\u9053\u5169\u500B\u89D2,\u7B2C\u4E09\u500B\u89D2\u5C31\u662F\u4E00\u767E\u516B\u5341\u5EA6\u6E1B\u6389\u5B83\u5011\u3002\u9019\u662F\u5E7E\u4F55\u88E1\u7B2C\u4E00\u689D\u771F\u6B63\u7684\u300C\u5B9A\u7406\u300D:\u4E0D\u8AD6\u4E09\u89D2\u5F62\u9577\u4EC0\u9EBC\u6A23,\u6C38\u9060\u6210\u7ACB\u3002", "\u26A0 \u9677\u9631:\u6E1B\u6CD5\u8981\u4E00\u6B21\u6E1B\u6389\u5169\u500B\u89D2\u7684\u548C,\u5225\u53EA\u6E1B\u4E00\u500B\u3002\u4E5F\u5225\u88AB\u5716\u5F62\u7684\u5916\u8868\u9A19:\u7626\u9577\u7684\u4E09\u89D2\u5F62\u5167\u89D2\u548C\u4ECD\u7136\u662F\u4E00\u767E\u516B\u5341\u5EA6,\u4E00\u5EA6\u4E0D\u591A\u4E00\u5EA6\u4E0D\u5C11\u3002", "\u{1F4A1} \u9077\u79FB:\u7B49\u8170\u4E09\u89D2\u5F62\u6C42\u5E95\u89D2\u3001\u56DB\u908A\u5F62\u5167\u89D2\u548C(\u5207\u6210\u5169\u500B\u4E09\u89D2\u5F62\u5F97\u4E09\u767E\u516D\u5341\u5EA6)\u3001\u591A\u908A\u5F62\u5167\u89D2\u548C\u516C\u5F0F,\u5168\u90FD\u5F9E\u9019\u689D\u76F4\u7DDA\u51FA\u767C\u3002", "EN: Tear off the three corners of any triangle and they line up into a straight edge: always one hundred eighty degrees. Every polygon angle rule grows from this single fact."],
    ["\u{1F9E0} \u539F\u7406:\u76F4\u89D2\u4E09\u89D2\u5F62\u9762\u7A4D\u662F\u5E95\u4E58\u9AD8\u9664\u4EE5\u4E8C\u2014\u2014\u56E0\u70BA\u5B83\u525B\u597D\u662F\u540C\u5E95\u540C\u9AD8\u9577\u65B9\u5F62\u7684\u4E00\u534A,\u6CBF\u5C0D\u89D2\u7DDA\u4E00\u5200\u5169\u534A\u3002\u9664\u4EE5\u4E8C\u4E0D\u662F\u898F\u5B9A,\u662F\u770B\u5F97\u898B\u7684\u5E7E\u4F55\u4E8B\u5BE6:\u5169\u500B\u4E00\u6A23\u7684\u76F4\u89D2\u4E09\u89D2\u5F62\u80FD\u62FC\u56DE\u4E00\u500B\u9577\u65B9\u5F62\u3002", "\u26A0 \u9677\u9631:\u5FD8\u8A18\u9664\u4EE5\u4E8C\u662F\u5168\u570B\u6027\u7684\u7D93\u5178\u932F\u8AA4!\u7B97\u5B8C\u5148\u81EA\u554F:\u6211\u780D\u534A\u4E86\u55CE?\u53E6\u5916,\u5E95\u8207\u9AD8\u5FC5\u9808\u4E92\u76F8\u5782\u76F4,\u659C\u908A\u4E0D\u80FD\u62FF\u4F86\u7576\u9AD8\u3002", "\u{1F4A1} \u9077\u79FB:\u4EFB\u4F55\u4E09\u89D2\u5F62\u90FD\u662F\u5E95\u4E58\u9AD8\u9664\u4EE5\u4E8C(\u88DC\u6210\u5E73\u884C\u56DB\u908A\u5F62\u518D\u780D\u534A)\u3001\u68AF\u5F62\u9762\u7A4D\u4E5F\u9760\u9019\u62DB\u63A8\u5C0E\u3002\u4E00\u5200\u780D\u534A\u7684\u601D\u60F3,\u9762\u7A4D\u4E16\u754C\u8655\u8655\u901A\u7528\u3002", "EN: A right triangle is half of a rectangle cut along the diagonal, hence base times height divided by two. Ask yourself after computing: did I take the half?"],
    ["\u{1F9E0} \u539F\u7406:\u68AF\u5F62\u9762\u7A4D\u662F\u4E0A\u5E95\u52A0\u4E0B\u5E95\u3001\u4E58\u9AD8\u3001\u9664\u4EE5\u4E8C\u3002\u70BA\u4EC0\u9EBC?\u628A\u540C\u4E00\u500B\u68AF\u5F62\u5012\u904E\u4F86\u62FC\u5728\u65C1\u908A,\u6703\u62FC\u6210\u4E00\u500B\u5E73\u884C\u56DB\u908A\u5F62,\u5E95\u662F\u4E0A\u5E95\u52A0\u4E0B\u5E95\u3001\u9AD8\u4E0D\u8B8A\u2014\u2014\u6240\u4EE5\u68AF\u5F62\u662F\u90A3\u500B\u5E73\u884C\u56DB\u908A\u5F62\u7684\u4E00\u534A\u3002\u516C\u5F0F\u662F\u62FC\u5716\u7684\u7D00\u9304\u3002", "\u26A0 \u9677\u9631:\u4E09\u500B\u6578\u5B57\u4E09\u500B\u89D2\u8272:\u4E0A\u5E95\u3001\u4E0B\u5E95\u3001\u9AD8,\u5225\u4EE3\u932F\u4F4D\u7F6E\u3002\u5148\u52A0\u62EC\u865F\u628A\u4E0A\u5E95\u52A0\u4E0B\u5E95\u7B97\u5B8C,\u518D\u4E58\u9AD8\u3001\u518D\u9664\u4E8C,\u9806\u5E8F\u4E82\u4E86\u7B54\u6848\u5C31\u4E82\u3002", "\u{1F4A1} \u9077\u79FB:\u7B49\u5DEE\u6578\u5217\u6C42\u548C(\u9AD8\u65AF\u6C42\u548C)\u7684\u516C\u5F0F\u548C\u68AF\u5F62\u9762\u7A4D\u9577\u5F97\u4E00\u6A21\u4E00\u6A23\u2014\u2014\u9996\u9805\u52A0\u672B\u9805\u4E58\u9805\u6578\u9664\u4EE5\u4E8C\u3002\u9019\u4E0D\u662F\u5DE7\u5408:\u628A\u6578\u5217\u756B\u6210\u968E\u68AF,\u5C31\u662F\u4E00\u5EA7\u68AF\u5F62\u3002", "EN: Two copies of a trapezoid, one flipped, form a parallelogram, so its area is the sum of both bases times height, halved. The Gauss summation formula is this same trapezoid in disguise."],
    ["\u{1F9E0} \u539F\u7406:\u6B63\u4E09\u89D2\u5F62\u4E09\u908A\u7B49\u9577,\u5468\u9577\u5C31\u662F\u908A\u9577\u4E58\u4E09\u3002\u300C\u6B63\u300D\u5B57\u662F\u5E7E\u4F55\u7684\u627F\u8AFE:\u6240\u6709\u908A\u76F8\u7B49\u3001\u6240\u6709\u89D2\u76F8\u7B49(\u6BCF\u500B\u90FD\u662F\u516D\u5341\u5EA6)\u3002\u6709\u4E86\u9019\u500B\u627F\u8AFE,\u4E00\u500B\u6578\u5B57\u5C31\u80FD\u9396\u5B9A\u6574\u500B\u5716\u5F62\u2014\u2014\u5C0D\u7A31\u6027\u8B93\u8CC7\u8A0A\u8B8A\u4FBF\u5B9C\u3002", "\u26A0 \u9677\u9631:\u300C\u6B63\u300D\u7684\u627F\u8AFE\u53EA\u5C6C\u65BC\u6B63\u591A\u908A\u5F62!\u4E00\u822C\u4E09\u89D2\u5F62\u4E09\u908A\u53EF\u4EE5\u5404\u4E0D\u76F8\u540C,\u4E0D\u80FD\u770B\u5230\u4E09\u89D2\u5F62\u5C31\u4E58\u4E09\u3002\u5148\u78BA\u8A8D\u984C\u76EE\u8AAA\u7684\u662F\u4E0D\u662F\u300C\u6B63\u300D\u3002", "\u{1F4A1} \u9077\u79FB:\u6B63\u65B9\u5F62\u4E58\u56DB\u3001\u6B63\u4E94\u908A\u5F62\u4E58\u4E94\u3001\u6B63 n \u908A\u5F62\u4E58 n\u3002\u5C0D\u7A31\u6027\u7701\u8CC7\u8A0A\u7684\u601D\u60F3,\u4EE5\u5F8C\u5728\u6B63\u591A\u9762\u9AD4\u3001\u6676\u9AD4\u7D50\u69CB\u88E1\u6703\u4E00\u8DEF\u5347\u7D1A\u3002", "EN: The word regular is a promise: all sides equal, all angles equal. One number then pins down the whole shape, so perimeter is simply side length times the number of sides."],
    ["\u{1F9E0} \u539F\u7406:\u9762\u7A4D\u9006\u63A8:\u9577\u65B9\u5F62\u9762\u7A4D\u7B49\u65BC\u9577\u4E58\u5BEC,\u5DF2\u77E5\u9762\u7A4D\u8207\u9577,\u5BEC\u5C31\u662F\u9762\u7A4D\u9664\u4EE5\u9577\u3002\u9019\u662F\u628A\u516C\u5F0F\u7576\u6210\u65B9\u7A0B\u5F0F\u4F86\u89E3\u2014\u2014\u516C\u5F0F\u88E1\u4E09\u500B\u91CF,\u906E\u4F4F\u54EA\u500B,\u90FD\u80FD\u7528\u53E6\u5916\u5169\u500B\u628A\u5B83\u627E\u56DE\u4F86\u3002", "\u26A0 \u9677\u9631:\u9664\u7684\u65B9\u5411\u5225\u53CD:\u662F\u9762\u7A4D\u9664\u4EE5\u5DF2\u77E5\u908A,\u4E0D\u662F\u5DF2\u77E5\u908A\u9664\u4EE5\u9762\u7A4D\u3002\u6AA2\u67E5\u6CD5:\u628A\u6C42\u51FA\u7684\u5BEC\u4E58\u56DE\u9577,\u5FC5\u9808\u9084\u539F\u51FA\u9762\u7A4D\u3002", "\u{1F4A1} \u9077\u79FB:\u9AD4\u7A4D\u9006\u63A8(\u4E94\u5E74\u7D1A)\u3001\u901F\u7387\u53CD\u63A8\u3001\u5BC6\u5EA6\u516C\u5F0F,\u5168\u4E16\u754C\u7684\u4E09\u91CF\u516C\u5F0F\u90FD\u80FD\u9019\u6A23\u906E\u4F4F\u4E00\u500B\u6C42\u4E00\u500B\u3002\u516C\u5F0F\u662F\u4E09\u8173\u67B6,\u5C11\u4E00\u8173\u90FD\u80FD\u7B97\u51FA\u4F86\u3002", "EN: Cover any one quantity in area equals length times width and the other two reveal it. Every three part formula in science works as this same tripod."],
    ["\u{1F9E0} \u539F\u7406:\u7B49\u8170\u4E09\u89D2\u5F62\u7684\u5169\u5E95\u89D2\u76F8\u7B49\u2014\u2014\u56E0\u70BA\u5169\u8170\u76F8\u7B49,\u5716\u5F62\u5DE6\u53F3\u5C0D\u7A31,\u5C0D\u7A31\u628A\u76F8\u7B49\u5F9E\u908A\u50B3\u905E\u5230\u89D2\u3002\u9802\u89D2\u4E00\u767E\u5EA6,\u5269\u4E0B\u516B\u5341\u5EA6\u7531\u5169\u500B\u5E95\u89D2\u5E73\u5206,\u6BCF\u500B\u56DB\u5341\u5EA6\u3002\u5C0D\u7A31\u6027\u518D\u6B21\u8B93\u4E00\u500B\u689D\u4EF6\u751F\u51FA\u5169\u500B\u7D50\u8AD6\u3002", "\u26A0 \u9677\u9631:\u5148\u6E1B\u5F8C\u9664\u7684\u9806\u5E8F\u4E0D\u80FD\u4E82:\u4E00\u767E\u516B\u5341\u5148\u6E1B\u9802\u89D2,\u5269\u4E0B\u7684\u624D\u9664\u4EE5\u4E8C\u3002\u53E6\u5916\u8981\u8A8D\u6E05\u54EA\u500B\u662F\u9802\u89D2:\u5169\u8170\u593E\u7684\u624D\u662F\u9802\u89D2,\u5225\u770B\u5716\u5F62\u64FA\u653E\u65B9\u5411\u4E82\u8A8D\u3002", "\u{1F4A1} \u9077\u79FB:\u6B63\u4E09\u89D2\u5F62\u662F\u7B49\u8170\u7684\u6975\u81F4(\u4E09\u908A\u5168\u7B49\u3001\u4E09\u89D2\u5168\u516D\u5341\u5EA6);\u4EE5\u5F8C\u7684\u7B49\u8170\u68AF\u5F62\u3001\u5713\u88E1\u7684\u7B49\u8170\u4E09\u89D2\u5F62(\u5169\u689D\u534A\u5F91\u5FC5\u7B49\u9577),\u90FD\u9760\u4ECA\u5929\u9019\u689D\u5C0D\u7A31\u5F8B\u3002", "EN: Equal legs force equal base angles through symmetry. Subtract the apex from one hundred eighty, then split the rest evenly. Circles are full of isosceles triangles because all radii match."]
  ],
  4: [
    ["\u{1F9E0} \u539F\u7406:\u591A\u4F4D\u6578\u4E58\u6CD5\u662F\u4F4D\u503C\u7684\u5206\u5DE5\u5408\u4F5C:\u5341\u4E03\u4E58\u5341\u4E09\u62C6\u6210\u5341\u4E03\u4E58\u5341\u52A0\u5341\u4E03\u4E58\u4E09,\u5206\u958B\u7B97\u518D\u76F8\u52A0\u3002\u9019\u5C31\u662F\u5206\u914D\u5F8B\u7684\u5BE6\u6230\u2014\u2014\u5927\u4EFB\u52D9\u62C6\u6210\u4F4D\u503C\u5C0F\u4EFB\u52D9,\u6BCF\u500B\u5C0F\u4EFB\u52D9\u90FD\u56DE\u5230\u4E5D\u4E5D\u8868\u7684\u5C04\u7A0B\u4E4B\u5167\u3002", "\u26A0 \u9677\u9631:\u76F4\u5F0F\u7B2C\u4E8C\u5217\u8981\u5F80\u5DE6\u932F\u4E00\u4F4D(\u56E0\u70BA\u4E58\u7684\u662F\u5341\u4F4D),\u5FD8\u4E86\u932F\u4F4D\u7B54\u6848\u6703\u5C0F\u5341\u500D\u3002\u6BCF\u4E00\u5217\u958B\u5DE5\u524D\u5148\u554F:\u6211\u6B63\u5728\u4E58\u7684\u662F\u5E7E?\u5B83\u503C\u591A\u5C11?", "\u{1F4A1} \u9077\u79FB:\u570B\u4E2D\u7684\u591A\u9805\u5F0F\u4E58\u6CD5(x \u52A0\u4E03\u4E58 x \u52A0\u4E09)\u7D50\u69CB\u8207\u6B64\u5B8C\u5168\u76F8\u540C,\u53EA\u662F\u5341\u63DB\u6210\u4E86 x\u3002\u4ECA\u5929\u7684\u76F4\u5F0F,\u662F\u672A\u4F86\u4EE3\u6578\u7684\u6392\u7DF4\u3002", "EN: Big multiplication is the distributive law at work: split by place value, conquer with the times table, then add. Polynomial multiplication later is this same routine with x replacing ten."],
    ["\u{1F9E0} \u539F\u7406:\u540C\u5206\u6BCD\u5206\u6578\u76F8\u52A0,\u5206\u6BCD\u4E0D\u52D5\u3001\u5206\u5B50\u76F8\u52A0:\u4E94\u5206\u4E4B\u4E8C\u52A0\u4E94\u5206\u4E4B\u4E00\u662F\u4E94\u5206\u4E4B\u4E09\u3002\u5206\u6BCD\u662F\u300C\u5207\u6210\u5E7E\u4EFD\u300D\u7684\u5C3A\u5BF8\u6A19\u7C64,\u5C3A\u5BF8\u76F8\u540C\u7684\u6771\u897F\u624D\u80FD\u76F4\u63A5\u5408\u4F75\u2014\u2014\u4E09\u500B\u860B\u679C\u52A0\u4E8C\u500B\u860B\u679C\u662F\u4E94\u500B\u860B\u679C,\u55AE\u4F4D\u4E0D\u8B8A\u3002", "\u26A0 \u9677\u9631:\u5206\u6BCD\u5343\u842C\u4E0D\u8981\u76F8\u52A0!\u4E94\u5206\u4E4B\u4E8C\u52A0\u4E94\u5206\u4E4B\u4E00\u4E0D\u662F\u5341\u5206\u4E4B\u4E09\u3002\u5206\u6BCD\u52A0\u4E86\u7B49\u65BC\u628A\u62AB\u85A9\u5207\u5F97\u66F4\u788E,\u91CF\u5C31\u4E0D\u5C0D\u4E86\u3002", "\u{1F4A1} \u9077\u79FB:\u4E94\u5E74\u7D1A\u7684\u7570\u5206\u6BCD\u5206\u6578,\u7B2C\u4E00\u6B65\u5C31\u662F\u5148\u628A\u5206\u6BCD\u8B8A\u76F8\u540C(\u901A\u5206),\u7136\u5F8C\u56DE\u5230\u4ECA\u5929\u9019\u62DB\u3002\u540C\u55AE\u4F4D\u624D\u80FD\u76F8\u52A0,\u662F\u8CAB\u7A7F\u6578\u5B78\u8207\u7406\u5316\u7684\u9435\u5F8B\u3002", "EN: With equal denominators, add only the numerators: the denominator is a unit label, and identical units merge directly. Never add the labels themselves."],
    ["\u{1F9E0} \u539F\u7406:\u9762\u7A4D\u554F\u7684\u662F\u4E00\u500B\u5E73\u9762\u88AB\u4F54\u64DA\u4E86\u591A\u5C11,\u4EE5\u300C\u55AE\u4F4D\u6B63\u65B9\u5F62\u300D\u70BA\u78DA:\u9577\u4E58\u5BEC\u6578\u7684\u662F\u78DA\u7684\u7E3D\u6578\u3002\u9762\u7A4D\u628A\u300C\u5927\u5C0F\u300D\u9019\u7A2E\u6A21\u7CCA\u611F\u89BA\u8B8A\u6210\u53EF\u4EE5\u8A08\u7B97\u3001\u6BD4\u8F03\u3001\u4EA4\u6613\u7684\u7CBE\u78BA\u6578\u5B57\u2014\u2014\u571F\u5730\u3001\u5C4F\u5E55\u3001\u570B\u571F\u90FD\u4EE5\u5B83\u8A08\u50F9\u3002", "\u26A0 \u9677\u9631:\u55AE\u4F4D\u662F\u5E73\u65B9\u516C\u5206\u3001\u5E73\u65B9\u516C\u5C3A,\u5BEB\u932F\u55AE\u4F4D\u7B49\u65BC\u7B54\u932F\u3002\u800C\u4E14\u908A\u9577\u55AE\u4F4D\u8981\u5148\u7D71\u4E00:\u516C\u5C3A\u4E58\u516C\u5206\u662F\u7121\u6548\u904B\u7B97\u3002", "\u{1F4A1} \u9077\u79FB:\u8907\u5408\u5716\u5F62\u62C6\u89E3\u3001\u4E09\u89D2\u5F62\u8207\u68AF\u5F62\u7684\u534A\u500B\u4E16\u754C\u3001\u4EE5\u5F8C\u7684\u8868\u9762\u7A4D\u8207\u5713\u9762\u7A4D,\u5168\u90E8\u7AD9\u5728\u9019\u584A\u78DA\u4E0A\u3002", "EN: Area counts unit squares like bricks tiling a floor. It turns a vague sense of size into a number you can compute, compare and trade. Match the units before multiplying."],
    ["\u{1F9E0} \u539F\u7406:\u4E09\u89D2\u5F62\u5167\u89D2\u548C\u4E00\u767E\u516B\u5341\u5EA6\u5728\u6B64\u6B63\u5F0F\u670D\u5F79:\u77E5\u9053\u5169\u89D2,\u7B2C\u4E09\u89D2\u7B49\u65BC\u4E00\u767E\u516B\u5341\u6E1B\u5169\u89D2\u4E4B\u548C\u3002\u5E7E\u4F55\u89E3\u984C\u7684\u7BC0\u594F\u662F\u2014\u2014\u627E\u5230\u4E0D\u8B8A\u91CF(\u5167\u89D2\u548C),\u7528\u5DF2\u77E5\u586B\u7A7A,\u672A\u77E5\u5C31\u7121\u8655\u53EF\u85CF\u3002", "\u26A0 \u9677\u9631:\u5169\u500B\u5DF2\u77E5\u89D2\u5148\u76F8\u52A0\u518D\u6E1B,\u5225\u5206\u5169\u6B21\u6E1B\u5230\u6688\u3002\u756B\u500B\u5C0F\u4E09\u89D2\u5F62\u628A\u6578\u5B57\u586B\u9032\u53BB,\u8996\u89BA\u6703\u5E6B\u4F60\u6293\u51FA\u4E0D\u5408\u7406\u7684\u7B54\u6848(\u4F8B\u5982\u89D2\u5EA6\u70BA\u8CA0)\u3002", "\u{1F4A1} \u9077\u79FB:\u5916\u89D2\u5B9A\u7406\u3001\u591A\u908A\u5F62\u5167\u89D2\u548C\u3001\u5E73\u884C\u7DDA\u622A\u89D2,\u5168\u662F\u9019\u689D\u5B9A\u7406\u7684\u5EF6\u4F38\u6230\u5834\u3002\u4E0D\u8B8A\u91CF\u601D\u7DAD\u4E5F\u662F\u7269\u7406\u5B88\u6046\u5F8B\u7684\u524D\u594F\u3002", "EN: With the angle sum fixed at one hundred eighty, two known angles corner the third. Hunting for invariants and letting them expose the unknown is the rhythm of all geometry."],
    ["\u{1F9E0} \u539F\u7406:\u5C0F\u6578\u52A0\u6CD5\u7684\u9435\u5F8B\u662F\u5C0F\u6578\u9EDE\u5C0D\u9F4A:\u5C0D\u9F4A\u5C0F\u6578\u9EDE\u5C31\u662F\u5C0D\u9F4A\u4F4D\u503C\u2014\u2014\u5341\u5206\u4F4D\u5C0D\u5341\u5206\u4F4D\u3001\u500B\u4F4D\u5C0D\u500B\u4F4D\u3002\u5C0F\u6578\u4E0D\u662F\u65B0\u6578\u5B57,\u662F\u4F4D\u503C\u968E\u68AF\u5F80\u53F3\u5EF6\u4F38\u7684\u81EA\u7136\u7D50\u679C:\u53F3\u908A\u4E00\u683C,\u50F9\u503C\u5C31\u7E2E\u5C0F\u5341\u500D\u3002", "\u26A0 \u9677\u9631:\u4F4D\u6578\u4E0D\u9F4A\u6642\u88DC\u96F6\u518D\u52A0:\u4E8C\u9EDE\u4E03\u52A0\u4E5D\u9EDE\u4E09\u5C0D\u9F4A\u6C92\u554F\u984C,\u4F46\u4E09\u9EDE\u4E94\u52A0\u4E00\u9EDE\u4E8C\u4E94\u5C31\u8981\u628A\u4E09\u9EDE\u4E94\u770B\u6210\u4E09\u9EDE\u4E94\u96F6\u3002\u88DC\u96F6\u4E0D\u6539\u8B8A\u503C,\u53EA\u662F\u628A\u5916\u5957\u7A7F\u6574\u9F4A\u3002", "\u{1F4A1} \u9077\u79FB:\u91D1\u9322(\u5143\u8207\u89D2\u5206)\u3001\u8EAB\u9AD8\u9AD4\u91CD\u3001\u6E2C\u91CF\u6578\u64DA,\u5C0F\u6578\u7121\u8655\u4E0D\u5728\u3002\u5C0F\u6578\u4E58\u9664\u6CD5\u7684\u4F4D\u503C\u79FB\u52D5,\u4E5F\u5F9E\u4ECA\u5929\u7684\u5C0D\u9F4A\u958B\u59CB\u3002", "EN: Line up the decimal points and you line up the place values. Padding with zeros changes nothing but keeps every digit in its lane. Money and measurements live here."],
    ["\u{1F9E0} \u539F\u7406:\u905E\u589E\u6578\u5217\u7684\u5DEE\u672C\u8EAB\u4E5F\u5728\u9577\u5927:\u4E94\u3001\u4E03\u3001\u5341\u4E00\u3001\u5341\u4E03\u7684\u5DEE\u662F\u4E8C\u3001\u56DB\u3001\u516D\u2014\u2014\u5DEE\u69CB\u6210\u4E86\u53E6\u4E00\u689D\u7B49\u5DEE\u6578\u5217!\u5075\u63A2\u8FA6\u6848\u8981\u8FA6\u5169\u5C64:\u7B2C\u4E00\u5C64\u5DEE\u4E0D\u56FA\u5B9A,\u5C31\u67E5\u7B2C\u4E8C\u5C64\u300C\u5DEE\u7684\u5DEE\u300D\u3002\u898F\u5F8B\u53EF\u80FD\u85CF\u5728\u66F4\u6DF1\u7684\u6A13\u5C64\u3002", "\u26A0 \u9677\u9631:\u5225\u5728\u7B2C\u4E00\u5C64\u5C31\u653E\u68C4\u6216\u4E82\u731C\u3002\u6709\u8010\u5FC3\u5730\u5217\u51FA\u6BCF\u4E00\u5C64\u7684\u5DEE,\u76F4\u5230\u51FA\u73FE\u56FA\u5B9A\u6A21\u5F0F\u70BA\u6B62\u2014\u2014\u591A\u6578\u6578\u5217\u8B0E\u984C\u5728\u7B2C\u4E8C\u5C64\u5C31\u6703\u62DB\u4F9B\u3002", "\u{1F4A1} \u9077\u79FB:\u5E73\u65B9\u6578\u5217\u7684\u5DEE\u662F\u5947\u6578\u5217\u3001\u4E09\u89D2\u5F62\u6578\u7684\u5DEE\u662F\u81EA\u7136\u6578\u5217\u3002\u4EE5\u5F8C\u5FAE\u7A4D\u5206\u8B1B\u7684\u300C\u8B8A\u5316\u7387\u7684\u8B8A\u5316\u7387\u300D(\u52A0\u901F\u5EA6),\u5C31\u662F\u4ECA\u5929\u6316\u7684\u7B2C\u4E8C\u5C64\u3002", "EN: When first differences keep growing, difference the differences: many sequences confess at the second layer. Acceleration in physics is exactly this second layer of change."],
    ["\u{1F9E0} \u539F\u7406:\u9AD8\u65AF\u6C42\u548C:\u4E00\u52A0\u5230\u5341,\u982D\u5C3E\u914D\u5C0D(\u4E00\u52A0\u5341\u3001\u4E8C\u52A0\u4E5D\u2026\u2026)\u6BCF\u5C0D\u90FD\u662F\u5341\u4E00,\u5171\u4E94\u5C0D,\u5F97\u4E94\u5341\u4E94\u3002\u628A\u52A0\u6CD5\u554F\u984C\u8B8A\u6210\u914D\u5C0D\u554F\u984C,\u8A08\u7B97\u91CF\u5F9E\u5341\u6B65\u7E2E\u6210\u4E00\u6B65\u2014\u2014\u597D\u7684\u8868\u793A\u6CD5\u80FD\u8B93\u96E3\u984C\u81EA\u52D5\u8B8A\u7C21\u55AE\u3002", "\u26A0 \u9677\u9631:\u5C0D\u6578\u662F\u9805\u6578\u9664\u4EE5\u4E8C,\u5947\u6578\u9805\u6703\u5269\u4E2D\u9593\u4E00\u500B\u843D\u55AE,\u8981\u55AE\u7368\u52A0\u56DE\u53BB\u3002\u5148\u6578\u6E05\u695A\u5171\u6709\u5E7E\u9805,\u518D\u6C7A\u5B9A\u914D\u5E7E\u5C0D\u3002", "\u{1F4A1} \u9077\u79FB:\u516C\u5F0F\u300C\u9996\u52A0\u672B\u4E58\u9805\u6578\u9664\u4E8C\u300D\u8207\u68AF\u5F62\u9762\u7A4D\u540C\u69CB\u3002\u7B49\u5DEE\u6C42\u548C\u4EE5\u5F8C\u5728\u6578\u5217\u3001\u7D71\u8A08\u3001\u7A0B\u5F0F\u8FF4\u5708\u512A\u5316\u88E1\u53CD\u8986\u73FE\u8EAB\u2014\u2014\u4E5D\u6B72\u7684\u9AD8\u65AF\u7528\u5B83,\u4ECA\u5929\u7684\u5DE5\u7A0B\u5E2B\u4E5F\u7528\u5B83\u3002", "EN: Pair the first with the last and every pair matches: one to ten gives five pairs of eleven. Choosing a clever representation collapses ten additions into one multiplication."],
    ["\u{1F9E0} \u539F\u7406:\u548C\u5DEE\u554F\u984C\u6709\u500B\u512A\u96C5\u89E3:\u5927\u6578\u7B49\u65BC\u548C\u52A0\u5DEE\u9664\u4EE5\u4E8C,\u5C0F\u6578\u7B49\u65BC\u548C\u6E1B\u5DEE\u9664\u4EE5\u4E8C\u3002\u60F3\u50CF\u5169\u4EBA\u5206\u7CD6\u679C,\u5148\u628A\u591A\u51FA\u4F86\u7684\u5DEE\u88DC\u7D66\u5C11\u7684\u4EBA(\u548C\u52A0\u5DEE),\u5169\u4EBA\u5C31\u4E00\u6A23\u591A,\u5E73\u5206\u5373\u5F97\u5927\u6578\u3002\u5047\u8A2D\u6CD5\u7684\u5144\u5F1F\u7248\u3002", "\u26A0 \u9677\u9631:\u52A0\u5DEE\u5F97\u5927\u6578\u3001\u6E1B\u5DEE\u5F97\u5C0F\u6578,\u65B9\u5411\u5225\u53CD\u3002\u9A57\u7B97\u8D85\u5FEB:\u5169\u7B54\u6848\u76F8\u52A0\u8981\u7B49\u65BC\u548C\u3001\u76F8\u6E1B\u8981\u7B49\u65BC\u5DEE,\u4E09\u79D2\u9418\u67E5\u5B8C\u3002", "\u{1F4A1} \u9077\u79FB:\u5E74\u9F61\u554F\u984C\u3001\u96DE\u5154\u540C\u7C60\u90FD\u80FD\u8F49\u6210\u548C\u5DEE\u5F62\u5F0F\u3002\u570B\u4E2D\u8A2D x \u5217\u5F0F\u5F8C,\u89E3\u51FA\u4F86\u7684\u6B63\u662F\u9019\u5169\u689D\u516C\u5F0F\u2014\u2014\u4ECA\u5929\u5148\u7528\u76F4\u89BA\u64C1\u6709\u5B83\u5011\u3002", "EN: Sum plus difference, halved, yields the larger number. Give the surplus to the smaller share first and the split becomes even. Verify in seconds: answers must rebuild both sum and difference."],
    ["\u{1F9E0} \u539F\u7406:\u500D\u6578\u95DC\u4FC2\u662F\u9664\u6CD5\u7684\u7B2C\u4E09\u5F35\u81C9:\u4E8C\u5341\u4E00\u662F\u4E09\u7684\u5E7E\u500D,\u554F\u4E09\u8981\u653E\u5927\u5E7E\u6B21\u624D\u5230\u4E8C\u5341\u4E00\u2014\u2014\u9019\u662F\u300C\u6BD4\u8F03\u9664\u300D\u3002\u500D\u5C31\u662F\u4E58\u6CD5\u7684\u6B21\u6578,\u6C42\u500D\u7528\u9664\u6CD5,\u53C8\u4E00\u6B21\u770B\u5230\u6BCF\u500B\u904B\u7B97\u90FD\u81EA\u5E36\u53CD\u5411\u9375\u3002", "\u26A0 \u9677\u9631:\u8AB0\u9664\u4EE5\u8AB0?\u6C38\u9060\u662F\u5927\u7684\u91CF\u9664\u4EE5\u7576\u4F5C\u57FA\u6E96\u7684\u91CF\u3002\u641E\u4E0D\u6E05\u5C31\u9020\u53E5:\u4E8C\u5341\u4E00\u300C\u662F\u300D\u4E09\u300C\u7684\u300D\u5E7E\u500D\u2014\u2014\u300C\u662F\u300D\u524D\u9762\u7684\u9664\u4EE5\u300C\u7684\u300D\u524D\u9762\u7684\u3002", "\u{1F4A1} \u9077\u79FB:\u6BD4\u8207\u6BD4\u503C(\u516D\u5E74\u7D1A)\u3001\u6BD4\u4F8B\u5C3A\u3001\u767E\u5206\u7387,\u5168\u662F\u500D\u6578\u95DC\u4FC2\u7684\u6B63\u5F0F\u5316\u3002\u500D\u7684\u611F\u89BA\u990A\u597D\u4E86,\u6BD4\u4F8B\u4E16\u754C\u4E00\u8DEF\u901A\u884C\u3002", "EN: Times as many is comparison division: how many times must three grow to reach twenty one. Ratios, scale maps and percentages are this idea wearing formal clothes."],
    ["\u{1F9E0} \u539F\u7406:\u5C0F\u6578\u6E1B\u6CD5\u540C\u6A23\u8A8D\u5C0F\u6578\u9EDE:\u5C0D\u9F4A\u3001\u501F\u4F4D\u898F\u5247\u8207\u6574\u6578\u5B8C\u5168\u76F8\u540C,\u56E0\u70BA\u5C0F\u6578\u53EA\u662F\u4F4D\u503C\u968E\u68AF\u7684\u53F3\u534A\u6BB5\u3002\u516D\u9EDE\u4E8C\u6E1B\u4E09\u9EDE\u4E03,\u5341\u5206\u4F4D\u4E0D\u5920\u6E1B,\u5411\u500B\u4F4D\u501F\u4E00\u7576\u5341\u2014\u2014\u63DB\u9322\u908F\u8F2F\u539F\u5C01\u4E0D\u52D5\u3002", "\u26A0 \u9677\u9631:\u5C0D\u9F4A\u7684\u662F\u5C0F\u6578\u9EDE,\u4E0D\u662F\u6578\u5B57\u7684\u53F3\u7AEF!\u516D\u9EDE\u4E8C\u6E1B\u4E09\u9EDE\u4E03\u4E94,\u8981\u628A\u516D\u9EDE\u4E8C\u770B\u6210\u516D\u9EDE\u4E8C\u96F6\u518D\u958B\u5DE5\u3002", "\u{1F4A1} \u9077\u79FB:\u627E\u9322\u3001\u91CF\u5DEE\u3001\u6210\u7E3E\u9032\u6B65\u5E45\u5EA6\u3002\u6574\u6578\u7684\u6BCF\u4E00\u689D\u898F\u5247\u90FD\u5728\u5C0F\u6578\u4E16\u754C\u539F\u6A23\u901A\u7528\u2014\u2014\u9019\u6B63\u662F\u4F4D\u503C\u7CFB\u7D71\u8A2D\u8A08\u7684\u6F02\u4EAE\u4E4B\u8655\u3002", "EN: Decimal subtraction reuses every integer rule because decimals extend the same place value ladder. Align the points, borrow as usual, pad with zeros when lengths differ."],
    ["\u{1F9E0} \u539F\u7406:\u8907\u5408\u9762\u7A4D\u7684\u7B56\u7565\u662F\u62C6\u89E3:L \u5F62\u62C6\u6210\u5169\u500B\u9577\u65B9\u5F62,\u5206\u958B\u7B97\u518D\u76F8\u52A0\u3002\u6216\u8005\u53CD\u5411\u64CD\u4F5C\u2014\u2014\u88DC\u6210\u5927\u9577\u65B9\u5F62\u518D\u6316\u6389\u7F3A\u89D2(\u52A0\u88DC\u6CD5\u8207\u6316\u9664\u6CD5)\u3002\u8907\u96DC\u5716\u5F62\u6C92\u6709\u81EA\u5DF1\u7684\u516C\u5F0F,\u5B83\u5011\u662F\u7C21\u55AE\u5716\u5F62\u7684\u52A0\u6E1B\u5F0F\u3002", "\u26A0 \u9677\u9631:\u62C6\u5B8C\u4E4B\u5F8C,\u6BCF\u4E00\u584A\u7684\u908A\u9577\u8981\u91CD\u65B0\u63A8\u7B97,\u5E38\u6709\u4E00\u689D\u908A\u8981\u7528\u5927\u908A\u6E1B\u5C0F\u908A\u624D\u5F97\u5230\u3002\u5728\u5716\u4E0A\u628A\u6BCF\u584A\u7684\u9577\u5BEC\u90FD\u6A19\u51FA\u4F86,\u4E0D\u6A19\u5C31\u7B97,\u5FC5\u932F\u3002", "\u{1F4A1} \u9077\u79FB:\u76F8\u6846\u6316\u6D1E(\u6316\u9664\u6CD5)\u3001\u623F\u5C4B\u5E73\u9762\u5716\u3001\u570B\u571F\u9762\u7A4D,\u5168\u662F\u62C6\u8207\u88DC\u3002\u628A\u8907\u96DC\u554F\u984C\u5316\u70BA\u7C21\u55AE\u554F\u984C\u7684\u7D44\u5408,\u662F\u6578\u5B78\u4E5F\u662F\u4EBA\u751F\u7684\u901A\u7528\u6F14\u7B97\u6CD5\u3002", "EN: Composite shapes have no formula of their own: split them into rectangles or complete and subtract. Label every new edge before computing, since some lengths must be derived."],
    ["\u{1F9E0} \u539F\u7406:\u88DC\u89D2:\u5169\u89D2\u5171\u7DDA\u5247\u548C\u70BA\u4E00\u767E\u516B\u5341\u5EA6\u3002\u89D2\u5EA6\u4E16\u754C\u7684\u5B88\u6046\u5F8B\u4E4B\u4E8C(\u4E4B\u4E00\u662F\u4E09\u89D2\u5F62\u5167\u89D2\u548C)\u3002\u770B\u5230\u4E00\u76F4\u7DDA\u4E0A\u5206\u51FA\u7684\u89D2,\u76F4\u63A5\u555F\u52D5\u6E1B\u6CD5\u2014\u2014\u5E7E\u4F55\u7684\u9AD8\u624B\u4E0D\u7B97\u89D2,\u4ED6\u5011\u8B93\u5B88\u6046\u5F8B\u66FF\u81EA\u5DF1\u7B97\u3002", "\u26A0 \u9677\u9631:\u88DC\u89D2(\u548C\u4E00\u767E\u516B\u5341)\u8207\u9918\u89D2(\u548C\u4E5D\u5341)\u662F\u5169\u5144\u5F1F,\u5225\u8A8D\u932F\u3002\u95DC\u9375\u770B\u57FA\u6E96:\u4E00\u689D\u76F4\u7DDA\u662F\u4E00\u767E\u516B\u5341,\u4E00\u500B\u76F4\u89D2\u662F\u4E5D\u5341\u3002", "\u{1F4A1} \u9077\u79FB:\u5E73\u884C\u7DDA\u7684\u540C\u5074\u5167\u89D2\u3001\u5C0D\u9802\u89D2\u63A8\u7406\u3001\u9418\u9762\u89D2\u5EA6,\u5168\u9760\u9019\u5169\u5144\u5F1F\u3002\u5B88\u6046\u5F8B\u601D\u7DAD\u76F4\u901A\u7269\u7406\u7684\u80FD\u91CF\u5B88\u6046\u3002", "EN: Angles on a straight line conserve one hundred eighty degrees. Experts rarely measure angles; they let conservation laws do the computing. Watch for the ninety degree sibling."],
    ["\u{1F9E0} \u539F\u7406:\u5C0D\u7A31\u662F\u4E00\u9762\u93E1\u5B50:\u5C0D\u7A31\u8EF8\u5DE6\u908A\u8DDD\u8EF8\u4E03\u683C\u7684\u9EDE,\u53F3\u908A\u7684\u93E1\u50CF\u4E5F\u8DDD\u8EF8\u4E03\u683C\u3002\u93E1\u50CF\u6539\u8B8A\u5DE6\u53F3,\u4F46\u8DDD\u96E2\u5B88\u6046\u2014\u2014\u5C0D\u7A31\u5C31\u662F\u300C\u7FFB\u904E\u53BB\u4E4B\u5F8C,\u5230\u8EF8\u7684\u8DDD\u96E2\u4E0D\u8B8A\u300D\u7684\u8B8A\u63DB\u3002", "\u26A0 \u9677\u9631:\u93E1\u50CF\u9EDE\u8207\u539F\u9EDE\u5230\u8EF8\u7684\u8DDD\u96E2\u76F8\u7B49,\u4E0D\u662F\u5169\u9EDE\u76F8\u8DDD\u4E03\u683C(\u90A3\u662F\u5169\u500D)\u3002\u554F\u7684\u662F\u300C\u8DDD\u8EF8\u5E7E\u683C\u300D\u9084\u662F\u300C\u5169\u9EDE\u76F8\u8DDD\u5E7E\u683C\u300D,\u8B80\u984C\u6642\u5708\u51FA\u4F86\u3002", "\u{1F4A1} \u9077\u79FB:\u8774\u8776\u3001\u4EBA\u81C9\u3001\u526A\u7D19\u3001\u5B57\u6BCD A \u8207 M,\u90FD\u6709\u5C0D\u7A31\u8EF8;\u5EA7\u6A19\u5E73\u9762\u4E0A\u7684\u5C0D\u7A31\u9EDE(x \u8B8A\u865F)\u662F\u5B83\u7684\u4EE3\u6578\u7248\u3002\u5C0D\u7A31\u6027\u5728\u7269\u7406\u8207\u5316\u5B78\u88E1\u662F\u6700\u6DF1\u7684\u7D44\u7E54\u539F\u5247\u4E4B\u4E00\u3002", "EN: Reflection flips sides but preserves distance to the mirror line. Butterflies, paper cutouts and coordinate flips all obey the same rule: equal distance, opposite side."],
    ["\u{1F9E0} \u539F\u7406:\u76F4\u5F91\u662F\u534A\u5F91\u7684\u5169\u500D\u2014\u2014\u56E0\u70BA\u76F4\u5F91\u7A7F\u904E\u5713\u5FC3,\u6070\u597D\u662F\u5169\u689D\u534A\u5F91\u63A5\u529B\u3002\u5713\u7684\u6240\u6709\u5C3A\u5BF8(\u5468\u9577\u3001\u9762\u7A4D)\u90FD\u4EE5\u534A\u5F91\u70BA\u6BCD\u5C3A\u5BF8,\u534A\u5F91\u8207\u76F4\u5F91\u7684\u63DB\u7B97\u662F\u9032\u5165\u5713\u4E16\u754C\u7684\u7B2C\u4E00\u9053\u9580\u3002", "\u26A0 \u9677\u9631:\u516C\u5F0F\u5403\u7684\u662F\u8AB0\u8981\u770B\u6E05:\u5713\u5468\u9577\u516C\u5F0F\u5403\u76F4\u5F91(\u6216\u4E8C\u500D\u534A\u5F91),\u5713\u9762\u7A4D\u516C\u5F0F\u5403\u534A\u5F91\u3002\u984C\u76EE\u7D66\u7684\u662F\u54EA\u500B\u3001\u516C\u5F0F\u8981\u7684\u662F\u54EA\u500B,\u5148\u63DB\u7B97\u518D\u4EE3\u5165\u3002", "\u{1F4A1} \u9077\u79FB:\u4E94\u5E74\u7D1A\u5713\u5468\u9577\u3001\u516D\u5E74\u7D1A\u5713\u9762\u7A4D\u3001\u5713\u74B0\u8207\u6247\u5F62,\u5168\u90E8\u5F9E\u534A\u5F91\u51FA\u767C\u3002\u91CF\u6C34\u7BA1\u53E3\u5F91\u3001\u9078\u62AB\u85A9\u5C3A\u5BF8,\u8B1B\u7684\u90FD\u662F\u76F4\u5F91\u3002", "EN: A diameter is two radii joined through the centre. Every circle formula feeds on the radius, so convert first: given a diameter, halve it before entering the area formula."],
    ["\u{1F9E0} \u539F\u7406:\u6B63\u591A\u908A\u5F62\u5468\u9577\u7B49\u65BC\u908A\u9577\u4E58\u908A\u6578\u2014\u2014\u300C\u6B63\u300D\u7684\u627F\u8AFE\u518D\u6B21\u514C\u73FE:\u6240\u6709\u908A\u76F8\u7B49,\u6240\u4EE5\u4E00\u500B\u908A\u9577\u4EE3\u8868\u5168\u90E8\u3002\u6B63\u516B\u908A\u5F62\u4E58\u516B\u3001\u6B63\u4E94\u908A\u5F62\u4E58\u4E94,\u5C0D\u7A31\u6027\u8B93\u8A08\u7B97\u8CBB\u7528\u964D\u5230\u6700\u4F4E\u3002", "\u26A0 \u9677\u9631:\u5148\u6578\u6E05\u695A\u662F\u6B63\u5E7E\u908A\u5F62!\u4E94\u548C\u516B\u4E00\u5B57\u4E4B\u5DEE,\u7B54\u6848\u5DEE\u4E00\u5927\u622A\u3002\u53E6\u5916\u9019\u500B\u6377\u5F91\u53EA\u5C6C\u65BC\u300C\u6B63\u300D\u591A\u908A\u5F62,\u4E00\u822C\u591A\u908A\u5F62\u4ECD\u8981\u9010\u908A\u76F8\u52A0\u3002", "\u{1F4A1} \u9077\u79FB:\u6B63\u591A\u908A\u5F62\u662F\u5713\u7684\u8FD1\u89AA:\u908A\u6578\u8D8A\u591A\u8D8A\u63A5\u8FD1\u5713\u2014\u2014\u53E4\u4EBA\u6B63\u662F\u7528\u6B63\u4E5D\u5341\u516D\u908A\u5F62\u7B97\u51FA\u5713\u5468\u7387\u7684\u8FD1\u4F3C\u503C\u3002\u4ECA\u5929\u7684\u4E58\u6CD5,\u662F\u90A3\u5834\u5049\u5927\u8A08\u7B97\u7684\u7B2C\u4E00\u6B65\u3002", "EN: Regular polygons redeem their promise again: one side length times the side count. Multiply enough sides and the polygon melts into a circle, exactly how ancient mathematicians hunted pi."],
    ["\u{1F9E0} \u539F\u7406:\u76F8\u6846\u9762\u7A4D\u7528\u6316\u9664\u6CD5:\u5916\u6846\u6574\u584A\u9762\u7A4D\u6E1B\u53BB\u4E2D\u9593\u6D1E\u7684\u9762\u7A4D,\u5269\u4E0B\u7684\u5C31\u662F\u6846\u3002\u8207\u5176\u76F4\u63A5\u8A08\u7B97\u5F4E\u5F4E\u66F2\u66F2\u7684\u6846,\u4E0D\u5982\u300C\u5148\u7B97\u5927\u7684\u3001\u518D\u6316\u6389\u4E0D\u8981\u7684\u300D\u2014\u2014\u8CA0\u7A7A\u9593\u601D\u7DAD,\u8A2D\u8A08\u5E2B\u8207\u6578\u5B78\u5BB6\u5171\u7528\u3002", "\u26A0 \u9677\u9631:\u5169\u584A\u9762\u7A4D\u8981\u5206\u5225\u7B97\u5B8C\u518D\u76F8\u6E1B,\u5225\u628A\u908A\u9577\u5148\u76F8\u6E1B(\u5916\u6846\u5341\u4E00\u6E1B\u6D1E\u56DB\u4E0D\u662F\u6846\u7684\u4EC0\u9EBC)\u3002\u9762\u7A4D\u76F8\u6E1B\u8207\u9577\u5EA6\u76F8\u6E1B\u662F\u5169\u56DE\u4E8B\u3002", "\u{1F4A1} \u9077\u79FB:\u5713\u74B0\u9762\u7A4D(\u516D\u5E74\u7D1A)\u3001\u6E38\u6CF3\u6C60\u8D70\u9053\u3001\u751C\u751C\u5708,\u5168\u662F\u6316\u9664\u6CD5\u3002\u52A0\u88DC\u6CD5\u8207\u6316\u9664\u6CD5\u4E00\u6B63\u4E00\u53CD,\u8907\u5408\u5716\u5F62\u898B\u62DB\u62C6\u62DB\u3002", "EN: Frame area is negative space arithmetic: whole outer area minus the hole. Subtract areas, never side lengths. Donuts and pool decks fall to the same subtraction."]
  ],
  5: [
    ["\u{1F9E0} \u539F\u7406:\u7570\u5206\u6BCD\u5206\u6578\u4E0D\u80FD\u76F4\u63A5\u76F8\u52A0,\u56E0\u70BA\u5206\u6BCD\u662F\u5207\u5272\u5C3A\u5BF8,\u5C3A\u5BF8\u4E0D\u540C\u7684\u4EFD\u7121\u6CD5\u5408\u4F75\u2014\u2014\u4E09\u5206\u4E4B\u4E00\u548C\u56DB\u5206\u4E4B\u4E00\u662F\u4E0D\u540C\u5927\u5C0F\u7684\u584A\u3002\u89E3\u6CD5\u662F\u901A\u5206:\u627E\u51FA\u5169\u500B\u5206\u6BCD\u7684\u516C\u500D\u6578\u7576\u65B0\u5206\u6BCD,\u628A\u5169\u500B\u5206\u6578\u90FD\u63DB\u6210\u540C\u5C3A\u5BF8,\u518D\u56DE\u5230\u540C\u5206\u6BCD\u7684\u52A0\u6CD5\u3002", "\u26A0 \u9677\u9631:\u901A\u5206\u6642\u5206\u5B50\u8981\u8DDF\u8457\u653E\u5927\u540C\u6A23\u7684\u500D\u6578!\u5206\u6BCD\u4E58\u56DB\u3001\u5206\u5B50\u4E5F\u8981\u4E58\u56DB,\u5426\u5247\u5206\u6578\u7684\u503C\u5C31\u8B8A\u4E86\u3002\u901A\u5206\u6539\u8B8A\u5916\u8868\u3001\u4E0D\u6539\u8B8A\u5927\u5C0F,\u9019\u662F\u5E95\u7DDA\u3002", "\u{1F4A1} \u9077\u79FB:\u627E\u516C\u5206\u6BCD\u5176\u5BE6\u5C31\u662F\u627E\u6700\u5C0F\u516C\u500D\u6578\u7684\u5BE6\u6230\u61C9\u7528;\u4EE5\u5F8C\u7684\u5206\u6578\u65B9\u7A0B\u3001\u6BD4\u4F8B\u5408\u4F75\u3001\u5316\u5B78\u914D\u5E73,\u90FD\u8981\u5148\u300C\u5316\u6210\u540C\u55AE\u4F4D\u300D\u518D\u904B\u7B97\u3002", "EN: Unequal denominators mean unequal slice sizes, so convert both fractions to a common denominator first. Scale the numerator by the same factor, or the value silently changes."],
    ["\u{1F9E0} \u539F\u7406:\u5C0F\u6578\u4E58\u6574\u6578\u53EF\u4EE5\u5148\u7121\u8996\u5C0F\u6578\u9EDE:\u4E09\u4E58\u4E00\u9EDE\u4E8C,\u5148\u7B97\u4E09\u4E58\u5341\u4E8C\u5F97\u4E09\u5341\u516D,\u518D\u628A\u5C0F\u6578\u9EDE\u653E\u56DE\u53BB(\u4E00\u4F4D\u5C0F\u6578)\u5F97\u4E09\u9EDE\u516D\u3002\u539F\u7406\u662F\u4E00\u9EDE\u4E8C\u7B49\u65BC\u5341\u4E8C\u9664\u4EE5\u5341\u2014\u2014\u5148\u653E\u5927\u5341\u500D\u8A08\u7B97,\u6700\u5F8C\u518D\u7E2E\u5C0F\u5341\u500D\u9084\u539F\u3002", "\u26A0 \u9677\u9631:\u5C0F\u6578\u9EDE\u7684\u4F4D\u7F6E\u7531\u300C\u56E0\u6578\u5171\u6709\u5E7E\u4F4D\u5C0F\u6578\u300D\u6C7A\u5B9A,\u4E0D\u662F\u6191\u611F\u89BA\u9EDE\u3002\u7B97\u5B8C\u7528\u4F30\u7B97\u6AA2\u67E5:\u4E09\u4E58\u4E00\u9EDE\u4E8C\u61C9\u8A72\u6BD4\u4E09\u5927\u3001\u6BD4\u516D\u5C0F,\u4E09\u5341\u516D\u986F\u7136\u653E\u932F\u4F4D\u3002", "\u{1F4A1} \u9077\u79FB:\u5C0F\u6578\u4E58\u5C0F\u6578(\u4F4D\u6578\u76F8\u52A0)\u3001\u79D1\u5B78\u8A18\u865F\u3001\u55AE\u4F4D\u63DB\u7B97,\u5168\u7528\u300C\u5148\u653E\u5927\u3001\u5F8C\u9084\u539F\u300D\u9019\u62DB\u3002\u4F30\u7B97\u6AA2\u67E5\u7684\u7FD2\u6163,\u4E00\u751F\u53D7\u7528\u3002", "EN: Multiply as if the decimal point were absent, then restore it by counting decimal places. Always sanity check with estimation: three times one point two must land between three and six."],
    ["\u{1F9E0} \u539F\u7406:\u9AD4\u7A4D\u662F\u4E09\u7DAD\u7684\u9762\u7A4D:\u9577\u4E58\u5BEC\u5148\u92EA\u51FA\u4E00\u5C64\u5730\u677F\u6709\u5E7E\u500B\u55AE\u4F4D\u7ACB\u65B9\u9AD4,\u518D\u4E58\u9AD8\u770B\u758A\u4E86\u5E7E\u5C64\u3002\u5F9E\u9577\u5EA6(\u4E00\u7DAD)\u5230\u9762\u7A4D(\u4E8C\u7DAD)\u5230\u9AD4\u7A4D(\u4E09\u7DAD),\u6BCF\u5347\u4E00\u7DAD\u5C31\u591A\u4E58\u4E00\u500B\u65B9\u5411\u2014\u2014\u516C\u5F0F\u7684\u5F62\u72C0\u8DDF\u8457\u7A7A\u9593\u7684\u5F62\u72C0\u8D70\u3002", "\u26A0 \u9677\u9631:\u55AE\u4F4D\u662F\u7ACB\u65B9\u516C\u5206!\u9577\u5EA6\u3001\u9762\u7A4D\u3001\u9AD4\u7A4D\u4E09\u7A2E\u55AE\u4F4D\u5C0D\u61C9\u4E09\u7A2E\u7DAD\u5EA6,\u5BEB\u932F\u55AE\u4F4D\u8868\u793A\u9084\u6C92\u5206\u6E05\u81EA\u5DF1\u5728\u5E7E\u7DAD\u7A7A\u9593\u88E1\u3002\u4E09\u908A\u55AE\u4F4D\u4E5F\u8981\u5148\u7D71\u4E00\u3002", "\u{1F4A1} \u9077\u79FB:\u6E38\u6CF3\u6C60\u7684\u6C34\u91CF\u3001\u5305\u88F9\u7684\u5BB9\u7A4D\u3001\u8CA8\u6AC3\u88DD\u7BB1,\u5168\u662F\u9AD4\u7A4D\u3002\u4E4B\u5F8C\u7684\u9577\u65B9\u9AD4\u8868\u9762\u7A4D(\u7B97\u5916\u76AE)\u8207\u9AD4\u7A4D(\u7B97\u5167\u5BB9)\u5C0D\u7167\u8457\u5B78,\u4E00\u76AE\u4E00\u9921\u5206\u5F97\u6E05\u3002", "EN: Volume stacks area: length times width tiles one floor of unit cubes, height counts the floors. Each new dimension adds one more factor, and the unit becomes cubic."],
    ["\u{1F9E0} \u539F\u7406:\u56E0\u6578\u662F\u80FD\u628A\u4E00\u500B\u6578\u6574\u9664\u7684\u6578:\u5341\u4E8C\u7684\u56E0\u6578\u662F\u4E00\u3001\u4E8C\u3001\u4E09\u3001\u56DB\u3001\u516D\u3001\u5341\u4E8C\u3002\u627E\u56E0\u6578\u8981\u6210\u5C0D\u5730\u627E:\u4E00\u914D\u5341\u4E8C\u3001\u4E8C\u914D\u516D\u3001\u4E09\u914D\u56DB\u2014\u2014\u56E0\u6578\u5929\u751F\u6210\u96D9,\u5F9E\u5169\u7AEF\u5F80\u4E2D\u9593\u593E,\u4E0D\u91CD\u4E0D\u6F0F\u3002", "\u26A0 \u9677\u9631:\u6F0F\u6389\u4E00\u548C\u5B83\u81EA\u5DF1\u662F\u6700\u5E38\u898B\u7684\u932F;\u5B8C\u5168\u5E73\u65B9\u6578(\u5982\u5341\u516D)\u4E2D\u9593\u6703\u6709\u4E00\u500B\u81EA\u914D\u5C0D\u7684\u56E0\u6578(\u56DB),\u53EA\u7B97\u4E00\u6B21\u3002", "\u{1F4A1} \u9077\u79FB:\u56E0\u6578\u662F\u8CEA\u6578\u3001\u516C\u56E0\u6578\u3001\u5316\u7C21\u5206\u6578\u7684\u5730\u57FA;\u8CEA\u56E0\u6578\u5206\u89E3\u4EE5\u5F8C\u5728\u5BC6\u78BC\u5B78\u88E1\u5B88\u8B77\u4F60\u7684\u7DB2\u8DEF\u5BC6\u78BC\u2014\u2014\u5927\u6578\u96E3\u4EE5\u5206\u89E3,\u6B63\u662F\u52A0\u5BC6\u7684\u9396\u82AF\u3002", "EN: Factors come in pairs that multiply back to the number, so hunt from both ends toward the middle. Prime factorisation later becomes the lock inside modern cryptography."],
    ["\u{1F9E0} \u539F\u7406:\u6700\u5C0F\u516C\u500D\u6578\u662F\u5169\u500B\u6578\u7684\u7BC0\u62CD\u7B2C\u4E00\u6B21\u5C0D\u9F4A\u7684\u5730\u65B9:\u56DB\u7684\u500D\u6578\u8207\u516D\u7684\u500D\u6578,\u5728\u5341\u4E8C\u7B2C\u4E00\u6B21\u76F8\u9047\u3002\u60F3\u50CF\u5169\u500B\u9F52\u8F2A\u4E00\u8D77\u8F49,\u6700\u5C0F\u516C\u500D\u6578\u5C31\u662F\u5B83\u5011\u56DE\u5230\u8D77\u59CB\u4F4D\u7F6E\u7684\u6700\u77ED\u9031\u671F\u3002", "\u26A0 \u9677\u9631:\u5169\u6578\u76F8\u4E58\u5FC5\u662F\u516C\u500D\u6578,\u4F46\u5E38\u5E38\u4E0D\u662F\u300C\u6700\u5C0F\u300D:\u56DB\u4E58\u516D\u662F\u4E8C\u5341\u56DB,\u4F46\u5341\u4E8C\u5DF2\u7D93\u5920\u4E86\u3002\u5217\u500D\u6578\u8868\u627E\u7B2C\u4E00\u500B\u5171\u540C\u9805,\u6216\u7528\u77ED\u9664\u6CD5\u3002", "\u{1F4A1} \u9077\u79FB:\u516C\u8ECA\u73ED\u6B21\u4F55\u6642\u540C\u6642\u9032\u7AD9\u3001\u901A\u5206\u627E\u516C\u5206\u6BCD\u3001\u884C\u661F\u6703\u5408\u9031\u671F,\u5168\u662F\u7BC0\u62CD\u5C0D\u9F4A\u554F\u984C\u3002LCM \u8207 GCF \u662F\u4E00\u5C0D,\u4EE5\u5F8C\u7528\u77ED\u9664\u6CD5\u4E00\u6B21\u6C42\u51FA\u5169\u500B\u3002", "EN: The least common multiple is where two rhythms first align, like gears returning to their starting pose. The product of the numbers works but is often not the smallest answer."],
    ["\u{1F9E0} \u539F\u7406:\u5206\u6578\u4E58\u6574\u6578:\u53D6\u5E7E\u4EFD\u5C31\u4E58\u5E7E\u3002\u56DB\u5206\u4E4B\u4E09\u4E58\u516B,\u662F\u300C\u516B\u7684\u56DB\u5206\u4E4B\u4E09\u300D\u2014\u2014\u5148\u628A\u516B\u5207\u6210\u56DB\u4EFD(\u6BCF\u4EFD\u4E8C),\u53D6\u4E09\u4EFD\u5F97\u516D\u3002\u4E58\u4E00\u500B\u771F\u5206\u6578\u6703\u8B93\u7D50\u679C\u8B8A\u5C0F,\u56E0\u70BA\u4F60\u53D6\u7684\u662F\u4E0D\u8DB3\u4E00\u7684\u6BD4\u4F8B\u3002", "\u26A0 \u9677\u9631:\u300C\u4E58\u6CD5\u4E00\u5B9A\u8B8A\u5927\u300D\u7684\u76F4\u89BA\u5728\u5206\u6578\u4E16\u754C\u5931\u6548!\u4E58\u4E8C\u5206\u4E4B\u4E00\u7B49\u65BC\u9664\u4EE5\u4E8C\u3002\u5148\u9810\u5224\u7D50\u679C\u8A72\u8B8A\u5927\u9084\u662F\u8B8A\u5C0F,\u518D\u6AA2\u67E5\u7B54\u6848\u65B9\u5411\u3002", "\u{1F4A1} \u9077\u79FB:\u6253\u6298(\u4E58\u96F6\u9EDE\u516B)\u3001\u7E2E\u5716\u6BD4\u4F8B\u3001\u6A5F\u7387\u76F8\u4E58,\u5168\u662F\u5206\u6578\u4E58\u6CD5\u3002\u516D\u5E74\u7D1A\u7684\u767E\u5206\u7387\u5C31\u662F\u5206\u6BCD\u56FA\u5B9A\u70BA\u4E00\u767E\u7684\u5206\u6578\u4E58\u6CD5\u3002", "EN: Multiplying by a proper fraction shrinks the result, because you keep only part of each whole. Discounts, scale models and probabilities all multiply this way."],
    ["\u{1F9E0} \u539F\u7406:\u9D3F\u7C60\u539F\u7406:\u5341\u4E00\u96BB\u9D3F\u5B50\u98DB\u9032\u5341\u500B\u7C60\u5B50,\u81F3\u5C11\u6709\u4E00\u500B\u7C60\u5B50\u4F4F\u5169\u96BB\u2014\u2014\u56E0\u70BA\u5C31\u7B97\u524D\u5341\u96BB\u5404\u4F54\u4E00\u7C60,\u7B2C\u5341\u4E00\u96BB\u7121\u7C60\u53EF\u53BB\u3002\u5B83\u4E0D\u544A\u8A34\u4F60\u662F\u54EA\u500B\u7C60\u5B50,\u53EA\u4FDD\u8B49\u300C\u5FC5\u7136\u5B58\u5728\u300D,\u9019\u7A2E\u5B58\u5728\u6027\u8B49\u660E\u662F\u9AD8\u7B49\u6578\u5B78\u7684\u91CD\u8981\u6B66\u5668\u3002", "\u26A0 \u9677\u9631:\u984C\u76EE\u5E38\u53CD\u8457\u554F:\u8981\u300C\u4FDD\u8B49\u300D\u62BD\u5230\u5169\u500B\u540C\u8272,\u6700\u58DE\u60C5\u6CC1\u8981\u62BD\u5E7E\u500B?\u601D\u8DEF\u662F\u5148\u628A\u6BCF\u7A2E\u984F\u8272\u5404\u62FF\u4E00\u500B(\u6700\u58DE),\u518D\u591A\u62FF\u4E00\u500B\u5C31\u5FC5\u7136\u91CD\u8907\u3002", "\u{1F4A1} \u9077\u79FB:\u5341\u4E09\u4EBA\u4E2D\u5FC5\u6709\u5169\u4EBA\u540C\u6708\u751F\u65E5\u3001\u982D\u9AEE\u6839\u6578\u76F8\u540C\u7684\u53F0\u5317\u5E02\u6C11\u5FC5\u7136\u5B58\u5728\u3002\u5F9E\u300C\u6578\u91CF\u5C0D\u6BD4\u300D\u76F4\u63A5\u63A8\u51FA\u300C\u5FC5\u7136\u7D50\u8AD6\u300D,\u4E0D\u5FC5\u6AA2\u67E5\u6BCF\u500B\u500B\u6848\u2014\u2014\u9019\u662F\u62BD\u8C61\u63A8\u7406\u7684\u529B\u91CF\u3002", "EN: Eleven pigeons in ten holes force a shared hole. The pigeonhole principle proves existence without pointing at the case, a favourite weapon of higher mathematics."],
    ["\u{1F9E0} \u539F\u7406:\u5E73\u5747\u9006\u63A8:\u5E73\u5747\u6578\u4E58\u4EBA\u6578\u9084\u539F\u51FA\u7E3D\u548C,\u9019\u662F\u5E73\u5747\u6578\u7684\u5B9A\u7FA9\u5012\u8457\u8D70\u3002\u4E09\u4EBA\u5E73\u5747\u516B\u5341,\u7E3D\u5206\u5FC5\u662F\u4E8C\u767E\u56DB\u5341;\u77E5\u9053\u5176\u4E2D\u5169\u4EBA,\u7E3D\u548C\u6E1B\u53BB\u4ED6\u5011\u5C31\u662F\u7B2C\u4E09\u4EBA\u3002\u5E73\u5747\u662F\u7E3D\u548C\u7684\u5316\u540D,\u9047\u5230\u5E73\u5747\u5148\u9084\u539F\u7E3D\u548C\u3002", "\u26A0 \u9677\u9631:\u5E73\u5747\u6578\u4E0D\u80FD\u76F4\u63A5\u76F8\u52A0\u6216\u5E73\u5747!\u5169\u73ED\u5E73\u5747\u4E0D\u80FD\u52A0\u8D77\u4F86\u9664\u4EE5\u4E8C,\u9664\u975E\u5169\u73ED\u4EBA\u6578\u76F8\u540C\u3002\u4E00\u5207\u5148\u56DE\u5230\u7E3D\u548C\u5C64\u9762\u904B\u7B97,\u6700\u5F8C\u624D\u91CD\u65B0\u5E73\u5747\u3002", "\u{1F4A1} \u9077\u79FB:\u8003\u8A66\u8981\u62C9\u9AD8\u5E73\u5747\u9700\u518D\u8003\u5E7E\u5206\u3001\u7403\u968A\u5F97\u5206\u5206\u6790\u3001\u570B\u5BB6\u4EBA\u5747\u6578\u64DA,\u5168\u9760\u7E3D\u548C\u9084\u539F\u8853\u3002\u7D71\u8A08\u5B78\u7684\u7B2C\u4E00\u8AB2:\u5E73\u5747\u85CF\u8D77\u4E86\u7E3D\u548C\u8207\u5206\u5E03,\u89E3\u984C\u5148\u628A\u5B83\u8ACB\u56DE\u4F86\u3002", "EN: An average is a total in disguise: multiply back by the count to recover the sum, then subtract the known parts. Never add averages directly unless group sizes match."],
    ["\u{1F9E0} \u539F\u7406:\u6700\u5927\u516C\u56E0\u6578\u662F\u5169\u500B\u6578\u5171\u6709\u7684\u56E0\u6578\u4E2D\u6700\u5927\u7684:\u5341\u4E8C\u8207\u5341\u516B\u5171\u6709\u4E00\u3001\u4E8C\u3001\u4E09\u3001\u516D,\u6700\u5927\u662F\u516D\u3002\u5B83\u662F\u300C\u80FD\u540C\u6642\u6574\u9664\u5169\u6578\u7684\u6700\u5927\u5C3A\u5BF8\u300D\u2014\u2014\u628A\u5169\u689D\u4E0D\u540C\u9577\u5EA6\u7684\u7DDE\u5E36\u526A\u6210\u7B49\u9577\u5C0F\u6BB5\u4E14\u4E0D\u6D6A\u8CBB,\u6700\u9577\u80FD\u526A\u591A\u9577,\u5C31\u662F GCF\u3002", "\u26A0 \u9677\u9631:GCF \u627E\u5171\u540C\u7684\u300C\u56E0\u6578\u300D(\u5F80\u5C0F\u627E),LCM \u627E\u5171\u540C\u7684\u300C\u500D\u6578\u300D(\u5F80\u5927\u627E),\u65B9\u5411\u76F8\u53CD,\u6700\u5BB9\u6613\u5F35\u51A0\u674E\u6234\u3002\u526A\u7DDE\u5E36\u7528 GCF\u3001\u7B49\u7BC0\u62CD\u7528 LCM\u3002", "\u{1F4A1} \u9077\u79FB:\u5316\u7C21\u5206\u6578\u5C31\u662F\u5206\u5B50\u5206\u6BCD\u540C\u9664\u4EE5 GCF;\u5730\u78DA\u92EA\u6EFF\u623F\u9593\u4E0D\u5207\u5272\u3001\u968A\u4F0D\u5E73\u5747\u5206\u7D44,\u90FD\u662F GCF \u7684\u821E\u53F0\u3002", "EN: The greatest common factor is the largest size that divides both numbers cleanly, like the longest equal ribbon pieces with no waste. Simplifying fractions is GCF at work."],
    ["\u{1F9E0} \u539F\u7406:\u5C0F\u6578\u9664\u4EE5\u6574\u6578,\u5C0F\u6578\u9EDE\u8DDF\u8457\u4F4D\u7F6E\u8D70:\u516D\u9EDE\u56DB\u9664\u4EE5\u56DB,\u5148\u7B97\u516D\u5341\u56DB\u9664\u4EE5\u56DB\u5F97\u5341\u516D,\u5C0F\u6578\u9EDE\u56DE\u5230\u539F\u4F4D\u5F97\u4E00\u9EDE\u516D\u3002\u6216\u8005\u7406\u89E3\u6210\u516D\u9EDE\u56DB\u5143\u5206\u7D66\u56DB\u4EBA,\u6BCF\u4EBA\u4E00\u9EDE\u516D\u5143\u2014\u2014\u4F4D\u503C\u7CFB\u7D71\u4FDD\u8B49\u6574\u6578\u7684\u9664\u6CD5\u898F\u5247\u539F\u6A23\u53EF\u7528\u3002", "\u26A0 \u9677\u9631:\u5546\u7684\u5C0F\u6578\u9EDE\u8981\u5C0D\u9F4A\u88AB\u9664\u6578\u7684\u5C0F\u6578\u9EDE,\u76F4\u5F0F\u88E1\u9EDE\u5C0D\u9EDE\u3002\u9664\u4E0D\u76E1\u6642\u88DC\u96F6\u7E7C\u7E8C\u9664,\u5C0F\u6578\u7684\u4E16\u754C\u88E1\u9664\u6CD5\u53EF\u4EE5\u4E00\u76F4\u8D70\u4E0B\u53BB\u3002", "\u{1F4A1} \u9077\u79FB:\u55AE\u50F9\u8A08\u7B97(\u7E3D\u50F9\u9664\u4EE5\u6578\u91CF)\u3001\u5E73\u5747\u5206\u5E33\u3001\u6E2C\u91CF\u5E73\u5747\u503C,\u5929\u5929\u7528\u3002\u4EE5\u5F8C\u9664\u4EE5\u5C0F\u6578,\u518D\u52A0\u4E00\u6B65\u300C\u540C\u4E58\u5341\u500D\u628A\u9664\u6578\u8B8A\u6574\u6578\u300D\u5373\u53EF\u3002", "EN: Dividing a decimal by a whole number keeps the point aligned above itself. Sharing six point four dollars among four people simply extends integer division into smaller places."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u65B9\u9AD4\u9AD4\u7A4D\u7B49\u65BC\u9577\u4E58\u5BEC\u4E58\u9AD8,\u770B\u5716\u984C\u7684\u91CD\u9EDE\u662F\u5F9E\u7ACB\u9AD4\u5716\u4E0A\u6B63\u78BA\u8B80\u51FA\u4E09\u500B\u5C3A\u5BF8\u3002\u7ACB\u9AD4\u5716\u662F\u4E09\u7DAD\u7269\u9AD4\u7684\u4E8C\u7DAD\u6295\u5F71,\u6709\u4E9B\u908A\u88AB\u756B\u77ED\u4E86(\u900F\u8996),\u8B80\u6578\u5B57\u770B\u6A19\u8A3B\u3001\u4E0D\u770B\u76EE\u6E2C\u9577\u77ED\u3002", "\u26A0 \u9677\u9631:\u4E09\u500B\u6578\u5B57\u5225\u6F0F\u4E58\u4E5F\u5225\u91CD\u8907\u4E58;\u55AE\u4F4D\u82E5\u4E0D\u4E00\u81F4(\u516C\u5206\u8207\u516C\u5C3A\u6DF7\u7528)\u5148\u63DB\u7B97\u3002\u7B54\u6848\u55AE\u4F4D\u662F\u7ACB\u65B9\u55AE\u4F4D,\u5FD8\u8A18\u7ACB\u65B9\u7B49\u65BC\u7DAD\u5EA6\u932F\u4E82\u3002", "\u{1F4A1} \u9077\u79FB:\u88DD\u6C34\u3001\u88DD\u6C99\u3001\u88DD\u8CA8\u6AC3;\u62C6\u89E3\u4E0D\u898F\u5247\u7ACB\u9AD4\u6210\u591A\u500B\u9577\u65B9\u9AD4(\u8907\u5408\u9AD4\u7A4D),\u8207\u5E73\u9762\u7684\u8907\u5408\u9762\u7A4D\u4E00\u8108\u76F8\u627F\u3002", "EN: Read the three labelled dimensions from the drawing rather than trusting the perspective, then multiply length, width and height. Composite solids split into boxes, just like composite areas."],
    ["\u{1F9E0} \u539F\u7406:\u5713\u5468\u9577\u7B49\u65BC\u5713\u5468\u7387\u4E58\u76F4\u5F91\u3002\u5713\u5468\u7387\u662F\u5713\u7684\u8EAB\u5206\u5E38\u6578:\u4EFB\u4F55\u5713,\u5468\u9577\u9664\u4EE5\u76F4\u5F91\u6C38\u9060\u5F97\u5230\u540C\u4E00\u500B\u6578,\u7D04\u4E09\u9EDE\u4E00\u56DB\u2014\u2014\u5927\u5713\u5C0F\u5713,\u6BD4\u503C\u4E0D\u8B8A\u3002\u9019\u662F\u4EBA\u985E\u6700\u65E9\u767C\u73FE\u7684\u666E\u904D\u5E38\u6578\u4E4B\u4E00,\u85CF\u5728\u6BCF\u4E00\u500B\u8F2A\u5B50\u88E1\u3002", "\u26A0 \u9677\u9631:\u516C\u5F0F\u5403\u76F4\u5F91;\u984C\u76EE\u82E5\u7D66\u534A\u5F91,\u5148\u4E58\u4E8C\u3002\u4E09\u9EDE\u4E00\u56DB\u662F\u8FD1\u4F3C\u503C,\u984C\u76EE\u6307\u5B9A\u7528\u5B83\u5C31\u7528\u5B83,\u5225\u81EA\u884C\u56DB\u6368\u4E94\u5165\u5230\u4E09\u3002", "\u{1F4A1} \u9077\u79FB:\u8F2A\u5B50\u6EFE\u4E00\u5708\u8D70\u591A\u9060\u3001\u64CD\u5834\u5F4E\u9053\u9577\u5EA6\u3001\u5713\u5F62\u82B1\u5703\u570D\u6B04\u2014\u2014\u7686\u662F\u5713\u5468\u9577\u3002\u516D\u5E74\u7D1A\u7684\u5713\u9762\u7A4D,\u5C07\u518D\u6B21\u7531\u5713\u5468\u7387\u9818\u929C\u4E3B\u6F14\u3002", "EN: Circumference equals pi times diameter, and pi is the same constant for every circle ever drawn. Feed the formula a diameter, so double any radius first."],
    ["\u{1F9E0} \u539F\u7406:\u6247\u5F62\u662F\u5713\u7684\u4E00\u4EFD:\u628A\u5713\u5207\u6210\u516D\u7B49\u4EFD,\u6BCF\u4EFD\u662F\u516D\u5206\u4E4B\u4E00\u500B\u5713,\u89D2\u5EA6\u662F\u4E09\u767E\u516D\u5341\u5EA6\u9664\u4EE5\u516D\u5F97\u516D\u5341\u5EA6\u3002\u6247\u5F62\u628A\u300C\u5206\u6578\u300D\u8207\u300C\u89D2\u5EA6\u300D\u63A5\u5728\u4E00\u8D77\u2014\u2014\u5206\u6BCD\u662F\u5207\u5E7E\u4EFD,\u89D2\u5EA6\u5C31\u662F\u4E09\u767E\u516D\u5341\u5EA6\u7684\u540C\u4E00\u500B\u5206\u6578\u3002", "\u26A0 \u9677\u9631:\u7B49\u4EFD\u7684\u524D\u63D0\u662F\u5F9E\u5713\u5FC3\u5207\u4E14\u6BCF\u4EFD\u89D2\u5EA6\u76F8\u540C;\u7B97\u5E7E\u5206\u4E4B\u5E7E\u6642,\u5206\u6BCD\u662F\u7E3D\u4EFD\u6578\u3001\u5206\u5B50\u662F\u53D6\u7684\u4EFD\u6578,\u548C\u5206\u6578\u898F\u5247\u5B8C\u5168\u4E00\u81F4\u3002", "\u{1F4A1} \u9077\u79FB:\u5713\u5F62\u62AB\u85A9\u3001\u6642\u9418(\u6BCF\u5C0F\u6642\u4E09\u5341\u5EA6)\u3001\u5713\u9905\u7D71\u8A08\u5716,\u5168\u662F\u6247\u5F62\u3002\u4EE5\u5F8C\u7684\u6247\u5F62\u9762\u7A4D\u8207\u5F27\u9577,\u5C31\u662F\u628A\u4ECA\u5929\u7684\u5206\u6578\u4E58\u4E0A\u6574\u5713\u7684\u9762\u7A4D\u8207\u5468\u9577\u3002", "EN: A sector is a fraction of the circle: cut into six equal parts, each holds sixty of the three hundred sixty degrees. Pie charts and pizza slices speak this fraction language."],
    ["\u{1F9E0} \u539F\u7406:\u9577\u65B9\u9AD4\u8868\u9762\u7A4D\u662F\u516D\u500B\u9762\u7684\u7E3D\u548C,\u800C\u516D\u500B\u9762\u6210\u4E09\u5C0D\u96D9\u80DE\u80CE:\u4E0A\u4E0B\u3001\u524D\u5F8C\u3001\u5DE6\u53F3\u5404\u4E00\u5C0D\u3002\u6240\u4EE5\u7B97\u4E09\u7A2E\u9762\u5404\u4E00\u6B21\u3001\u5404\u4E58\u4E8C\u3001\u518D\u76F8\u52A0\u2014\u2014\u5C0D\u7A31\u6027\u518D\u5EA6\u628A\u516D\u4EF6\u5DE5\u4F5C\u6E1B\u6210\u4E09\u4EF6\u3002", "\u26A0 \u9677\u9631:\u4E09\u7A2E\u9762\u7684\u9577\u5BEC\u7D44\u5408\u5206\u5225\u662F\u9577\u4E58\u5BEC\u3001\u9577\u4E58\u9AD8\u3001\u5BEC\u4E58\u9AD8,\u914D\u5C0D\u932F\u4E86\u6574\u984C\u7FFB\u8ECA\u3002\u756B\u5C55\u958B\u5716(\u628A\u76D2\u5B50\u6524\u5E73)\u6700\u80FD\u770B\u6E05\u516D\u500B\u9762\u7684\u771F\u9762\u76EE\u3002", "\u{1F4A1} \u9077\u79FB:\u5305\u88DD\u7D19\u7528\u91CF\u3001\u7C89\u5237\u7246\u58C1\u3001\u6C34\u65CF\u7BB1\u73BB\u7483,\u5168\u662F\u8868\u9762\u7A4D\u3002\u8868\u9762\u7A4D(\u5916\u76AE)\u8207\u9AD4\u7A4D(\u5167\u9921)\u7684\u5C0D\u6BD4,\u4EE5\u5F8C\u5728\u751F\u7269\u8AB2\u89E3\u91CB\u70BA\u4EC0\u9EBC\u7D30\u80DE\u90FD\u5F88\u5C0F\u3002", "EN: A box owns six faces in three twin pairs, so compute three products, double each, and add. Unfolding the box into a net makes every face visible at once."],
    ["\u{1F9E0} \u539F\u7406:\u8868\u9762\u7A4D\u518D\u6230\u4E00\u5C40:\u540C\u4E00\u500B\u516C\u5F0F,\u4F46\u9019\u6B21\u81EA\u5DF1\u5F9E\u5716\u4E0A\u8B80\u5C3A\u5BF8\u3001\u81EA\u5DF1\u914D\u5C0D\u3002\u719F\u7DF4\u7684\u6A19\u6E96\u4E0D\u662F\u80CC\u5F97\u51FA\u516C\u5F0F,\u800C\u662F\u80FD\u5728\u8166\u4E2D\u628A\u76D2\u5B50\u6524\u958B\u6210\u5C55\u958B\u5716,\u516D\u500B\u9762\u5404\u5C31\u5404\u4F4D\u2014\u2014\u7A7A\u9593\u60F3\u50CF\u529B\u662F\u5E7E\u4F55\u7684\u771F\u6B63\u808C\u8089\u3002", "\u26A0 \u9677\u9631:\u6700\u5BB9\u6613\u6F0F\u7B97\u88AB\u64CB\u4F4F\u7684\u9762(\u5E95\u9762\u3001\u80CC\u9762):\u7ACB\u9AD4\u5716\u53EA\u756B\u5F97\u51FA\u4E09\u500B\u9762,\u53E6\u5916\u4E09\u500B\u8981\u9760\u8166\u88DC\u3002\u9010\u5C0D\u6253\u52FE:\u4E0A\u4E0B\u2713\u524D\u5F8C\u2713\u5DE6\u53F3\u2713,\u516D\u9762\u5230\u9F4A\u624D\u52D5\u7B46\u3002", "\u{1F4A1} \u9077\u79FB:\u7121\u84CB\u76D2\u5B50(\u6E1B\u4E00\u9762)\u3001\u8CBC\u78DA\u4E0D\u8CBC\u5929\u82B1\u677F(\u6E1B\u4E00\u9762)\u2014\u2014\u771F\u5BE6\u4E16\u754C\u5E38\u6709\u300C\u4E0D\u7B97\u67D0\u4E9B\u9762\u300D\u7684\u8B8A\u5316\u984C,\u6838\u5FC3\u4ECD\u662F\u5148\u76E4\u9EDE\u9762\u3001\u518D\u9010\u9762\u8A08\u7B97\u3002", "EN: The drawing shows only three faces; the hidden three must live in your mind. Check off the pairs before computing, and watch for open boxes that skip a face."],
    ["\u{1F9E0} \u539F\u7406:\u9AD8\u7684\u9006\u63A8:\u4E09\u89D2\u5F62\u9762\u7A4D\u7B49\u65BC\u5E95\u4E58\u9AD8\u9664\u4EE5\u4E8C,\u5012\u8457\u958B\u5C31\u662F\u9AD8\u7B49\u65BC\u9762\u7A4D\u4E58\u4E8C\u518D\u9664\u4EE5\u5E95\u3002\u9006\u5411\u6642\u5148\u628A\u300C\u9664\u4EE5\u4E8C\u300D\u9084\u539F(\u4E58\u4E8C),\u518D\u628A\u300C\u4E58\u5E95\u300D\u9084\u539F(\u9664\u4EE5\u5E95)\u2014\u2014\u89E3\u65B9\u7A0B\u7684\u672C\u8CEA\u5C31\u662F\u6309\u76F8\u53CD\u9806\u5E8F\u9010\u6B65\u812B\u8863\u3002", "\u26A0 \u9677\u9631:\u5169\u6B65\u7684\u9806\u5E8F:\u5148\u4E58\u4E8C\u3001\u518D\u9664\u4EE5\u5E95(\u6216\u5148\u9664\u5F8C\u4E58\u7686\u53EF,\u4F46\u6BCF\u6B65\u53EA\u8655\u7406\u4E00\u4EF6\u4E8B)\u3002\u9A57\u7B97:\u628A\u6C42\u5F97\u7684\u9AD8\u4EE3\u56DE\u516C\u5F0F,\u5FC5\u9808\u7B97\u56DE\u539F\u9762\u7A4D\u3002", "\u{1F4A1} \u9077\u79FB:\u6240\u6709\u516C\u5F0F\u90FD\u80FD\u9019\u6A23\u5012\u8457\u958B:\u9AD4\u7A4D\u6C42\u9AD8\u3001\u5468\u9577\u6C42\u908A\u3001\u901F\u7387\u6C42\u6642\u9593\u3002\u9006\u5411\u5DE5\u7A0B\u52A0\u9A57\u7B97\u56DE\u4EE3,\u662F\u89E3\u65B9\u7A0B\u524D\u6700\u597D\u7684\u6696\u8EAB\u3002", "EN: Undo the formula in reverse order: double the area first, then divide by the base. Substitute the answer back to confirm it rebuilds the original area."]
  ],
  6: [
    ["\u{1F9E0} \u539F\u7406:\u6BD4\u662F\u5169\u500B\u91CF\u7684\u5C0D\u7167:\u4E09\u6BD4\u56DB\u4E0D\u662F\u4E09\u548C\u56DB,\u800C\u662F\u300C\u6BCF\u4E09\u4EFD\u914D\u56DB\u4EFD\u300D\u7684\u95DC\u4FC2\u3002\u6BD4\u503C\u662F\u6BD4\u7684\u9664\u6CD5\u5F62\u614B(\u4E09\u9664\u4EE5\u56DB\u5F97\u96F6\u9EDE\u4E03\u4E94)\u3002\u6BD4\u6700\u5F37\u7684\u6027\u8CEA\u662F\u53EF\u653E\u5927\u7E2E\u5C0F:\u524D\u5F8C\u9805\u540C\u4E58\u540C\u9664,\u95DC\u4FC2\u4E0D\u8B8A\u2014\u2014\u9019\u53EB\u7B49\u6BD4\u6027\u8CEA\u3002", "\u26A0 \u9677\u9631:\u6BD4\u6709\u9806\u5E8F!\u7CD6\u8207\u6C34\u4E09\u6BD4\u56DB,\u548C\u6C34\u8207\u7CD6\u4E09\u6BD4\u56DB\u662F\u5169\u676F\u5B8C\u5168\u4E0D\u540C\u7684\u98F2\u6599\u3002\u5148\u78BA\u8A8D\u8AB0\u5728\u524D\u3001\u8AB0\u5728\u5F8C,\u518D\u5316\u7C21\u3002", "\u{1F4A1} \u9077\u79FB:\u5730\u5716\u6BD4\u4F8B\u5C3A\u3001\u98DF\u8B5C\u52A0\u500D\u3001\u6A21\u578B\u6BD4\u4F8B\u3001\u532F\u7387,\u5168\u662F\u6BD4\u3002\u570B\u4E2D\u7684\u76F8\u4F3C\u5F62\u8207\u4E09\u89D2\u51FD\u6578,\u9AA8\u5B50\u88E1\u90FD\u662F\u4ECA\u5929\u7684\u6BD4\u3002", "EN: A ratio compares quantities in order: three to four means every three parts pair with four. Scale both sides equally and the relationship survives, which powers maps, recipes and models."],
    ["\u{1F9E0} \u539F\u7406:\u901F\u7387\u662F\u55AE\u4F4D\u6642\u9593\u8D70\u7684\u8DDD\u96E2:\u4E00\u767E\u4E8C\u5341\u516C\u91CC\u9664\u4EE5\u4E8C\u5C0F\u6642,\u5F97\u6BCF\u5C0F\u6642\u516D\u5341\u516C\u91CC\u3002\u901F\u7387\u3001\u6642\u9593\u3001\u8DDD\u96E2\u7D44\u6210\u9435\u4E09\u89D2:\u8DDD\u96E2\u7B49\u65BC\u901F\u7387\u4E58\u6642\u9593,\u906E\u4F4F\u54EA\u500B\u90FD\u80FD\u7531\u53E6\u5169\u500B\u6C42\u51FA\u3002\u901F\u7387\u628A\u300C\u5FEB\u6162\u300D\u9019\u7A2E\u611F\u89BA\u8B8A\u6210\u53EF\u6BD4\u8F03\u7684\u6578\u3002", "\u26A0 \u9677\u9631:\u55AE\u4F4D\u8981\u6210\u5957:\u516C\u91CC\u914D\u5C0F\u6642\u3001\u516C\u5C3A\u914D\u79D2,\u6DF7\u642D\u524D\u5148\u63DB\u7B97\u3002\u300C\u6BCF\u5C0F\u6642\u516D\u5341\u516C\u91CC\u300D\u7684\u300C\u6BCF\u300D\u5B57\u662F\u95DC\u9375\u2014\u2014\u901F\u7387\u6C38\u9060\u662F\u300C\u6BCF\u4E00\u55AE\u4F4D\u6642\u9593\u300D\u7684\u91CF\u3002", "\u{1F4A1} \u9077\u79FB:\u7DB2\u901F\u3001\u5FC3\u8DF3\u901F\u7387\u3001\u5370\u8868\u6A5F\u9801\u901F,\u51E1\u662F\u300C\u6BCF\u55AE\u4F4D\u6642\u9593\u591A\u5C11\u300D\u90FD\u662F\u901F\u7387\u5BB6\u65CF\u3002\u8FFD\u53CA\u8207\u76F8\u9047\u554F\u984C,\u662F\u9019\u500B\u9435\u4E09\u89D2\u7684\u9032\u968E\u5287\u5834\u3002", "EN: Speed is distance per one unit of time, forming a triangle with distance and time where any two reveal the third. Keep the units paired: kilometres with hours, metres with seconds."],
    ["\u{1F9E0} \u539F\u7406:\u5206\u6578\u5316\u5C0F\u6578,\u5C31\u662F\u628A\u9664\u6CD5\u505A\u5B8C:\u56DB\u5206\u4E4B\u4E09\u7B49\u65BC\u4E09\u9664\u4EE5\u56DB\u7B49\u65BC\u96F6\u9EDE\u4E03\u4E94\u3002\u5206\u6578\u8207\u5C0F\u6578\u662F\u540C\u4E00\u500B\u6578\u7684\u5169\u7A2E\u5BEB\u6CD5\u2014\u2014\u5206\u6578\u4FDD\u7559\u300C\u600E\u9EBC\u4F86\u7684\u300D(\u4E09\u4EFD\u9664\u4EE5\u56DB),\u5C0F\u6578\u65B9\u4FBF\u300C\u6BD4\u5927\u5C0F\u548C\u8A08\u7B97\u300D\u3002\u4E92\u63DB\u80FD\u529B\u7B49\u65BC\u96D9\u8A9E\u80FD\u529B\u3002", "\u26A0 \u9677\u9631:\u6709\u4E9B\u5206\u6578\u5316\u4E0D\u6210\u6709\u9650\u5C0F\u6578(\u4E09\u5206\u4E4B\u4E00\u662F\u96F6\u9EDE\u4E09\u4E09\u5FAA\u74B0),\u5206\u6BCD\u7684\u8CEA\u56E0\u6578\u53EA\u6709\u4E8C\u548C\u4E94\u624D\u6703\u9664\u5F97\u76E1\u2014\u2014\u9019\u500B\u5224\u65B7\u4EE5\u5F8C\u6703\u5B78,\u73FE\u5728\u5148\u77E5\u9053\u9664\u4E0D\u76E1\u662F\u6B63\u5E38\u7684\u3002", "\u{1F4A1} \u9077\u79FB:\u6253\u6298\u6A19\u50F9(\u4E03\u4E94\u6298\u5C31\u662F\u96F6\u9EDE\u4E03\u4E94)\u3001\u6253\u64CA\u7387\u3001\u96FB\u6C60\u767E\u5206\u6BD4,\u751F\u6D3B\u7528\u5C0F\u6578;\u7CBE\u78BA\u904B\u7B97\u7528\u5206\u6578\u3002\u5169\u908A\u81EA\u7531\u5207\u63DB,\u624D\u7B97\u771F\u6B63\u64C1\u6709\u9019\u500B\u6578\u3002", "EN: Converting a fraction means finishing its division: three quarters is three divided by four, zero point seven five. Fractions and decimals are two spellings of one number."],
    ["\u{1F9E0} \u539F\u7406:\u767E\u5206\u7387\u662F\u5206\u6BCD\u56FA\u5B9A\u70BA\u4E00\u767E\u7684\u5206\u6578:\u767E\u5206\u4E4B\u516D\u5341\u7B49\u65BC\u4E00\u767E\u5206\u4E4B\u516D\u5341\u7B49\u65BC\u96F6\u9EDE\u516D\u3002\u56FA\u5B9A\u5206\u6BCD\u7684\u597D\u8655\u662F\u4EFB\u4F55\u6BD4\u4F8B\u90FD\u80FD\u76F4\u63A5\u6BD4\u8F03\u2014\u2014\u8003\u8A66\u5F97\u5206\u7387\u3001\u96FB\u91CF\u3001\u6FD5\u5EA6,\u5168\u653E\u5728\u540C\u4E00\u628A\u767E\u683C\u5C3A\u4E0A\u8B80\u3002", "\u26A0 \u9677\u9631:\u6C42\u300C\u7532\u662F\u4E59\u7684\u767E\u5206\u4E4B\u5E7E\u300D,\u662F\u7532\u9664\u4EE5\u4E59\u518D\u4E58\u4E00\u767E,\u5206\u6BCD\u662F\u300C\u7684\u300D\u5F8C\u9762\u90A3\u500B\u57FA\u6E96\u91CF\u3002\u57FA\u6E96\u8A8D\u932F,\u6F32\u50F9\u8207\u964D\u50F9\u6703\u7B97\u6210\u5B8C\u5168\u76F8\u53CD\u3002", "\u{1F4A1} \u9077\u79FB:\u6298\u6263\u3001\u5229\u7387\u3001\u6210\u9577\u7387\u3001\u7D71\u8A08\u5716\u8868\u2014\u2014\u767E\u5206\u7387\u662F\u516C\u6C11\u8B58\u8B80\u7684\u57FA\u672C\u529F\u3002\u4E4B\u5F8C\u7684\u300C\u767E\u5206\u7387\u589E\u6E1B\u300D(\u5148\u52A0\u5F8C\u6E1B\u4E0D\u6703\u56DE\u5230\u539F\u50F9)\u662F\u5B83\u6700\u72E1\u733E\u7684\u9032\u968E\u984C\u3002", "EN: Percent fixes the denominator at one hundred so every proportion shares one ruler. The base always follows the word of: sixty percent of eighty means sixty hundredths times eighty."],
    ["\u{1F9E0} \u539F\u7406:\u5713\u5468\u9577\u7B49\u65BC\u5713\u5468\u7387\u4E58\u76F4\u5F91,\u516D\u5E74\u7D1A\u7684\u91CD\u9022:\u9019\u6B21\u5B83\u5C07\u8207\u5713\u9762\u7A4D\u4E26\u80A9\u4F5C\u6230\u3002\u8A18\u4F4F\u5169\u8005\u7684\u5206\u5DE5\u2014\u2014\u5468\u9577\u91CF\u5916\u5708\u4E00\u5708\u7684\u9577\u5EA6(\u4E00\u7DAD),\u9762\u7A4D\u91CF\u5713\u76E4\u84CB\u4F4F\u7684\u5927\u5C0F(\u4E8C\u7DAD),\u516C\u5F0F\u88E1\u534A\u5F91\u7684\u6B21\u65B9\u6578\u6D29\u9732\u4E86\u7DAD\u5EA6\u3002", "\u26A0 \u9677\u9631:\u5468\u9577\u516C\u5F0F\u534A\u5F91\u53EA\u4E58\u4E00\u6B21(\u4E8C\u4E58\u5713\u5468\u7387\u4E58\u534A\u5F91),\u9762\u7A4D\u516C\u5F0F\u534A\u5F91\u4E58\u5169\u6B21(\u5713\u5468\u7387\u4E58\u534A\u5F91\u5E73\u65B9)\u3002\u6DF7\u7528\u662F\u516D\u5E74\u7D1A\u6700\u6D41\u884C\u7684\u932F\u8AA4,\u7528\u7DAD\u5EA6\u6AA2\u67E5\u4E00\u79D2\u8B58\u7834\u3002", "\u{1F4A1} \u9077\u79FB:\u8F2A\u80CE\u8F49\u6578\u8207\u91CC\u7A0B\u3001\u6372\u5C3A\u91CF\u6A39\u570D\u53CD\u63A8\u76F4\u5F91;\u5DE5\u7A0B\u5E2B\u7528\u5468\u9577\u7B97\u76AE\u5E36\u9577\u5EA6,\u5929\u6587\u5B78\u5BB6\u7528\u5B83\u7B97\u884C\u661F\u8ECC\u9053\u2014\u2014\u4E00\u689D\u516C\u5F0F,\u5F9E\u8173\u8E0F\u8ECA\u901A\u5230\u592A\u967D\u7CFB\u3002", "EN: Circumference is one dimensional so the radius appears once; area is two dimensional so the radius squares. Let the exponent reveal the dimension and the two formulas never blur."],
    ["\u{1F9E0} \u539F\u7406:\u89E3\u65B9\u7A0B\u7684\u6838\u5FC3\u662F\u5929\u5E73\u6CD5\u5247:\u7B49\u865F\u662F\u5929\u5E73,\u5169\u908A\u540C\u52A0\u3001\u540C\u6E1B\u3001\u540C\u4E58\u3001\u540C\u9664,\u5929\u5E73\u4ECD\u5E73\u3002\u56DBx\u52A0\u4E09\u7B49\u65BC\u4E8C\u5341\u4E03:\u5169\u908A\u540C\u6E1B\u4E09(\u5929\u5E73\u4ECD\u5E73),\u518D\u540C\u9664\u4EE5\u56DB,x \u73FE\u8EAB\u3002\u79FB\u9805\u53EA\u662F\u5929\u5E73\u64CD\u4F5C\u7684\u901F\u8A18\u3002", "\u26A0 \u9677\u9631:\u6BCF\u4E00\u6B65\u5FC5\u9808\u300C\u5169\u908A\u540C\u6642\u300D\u64CD\u4F5C,\u53EA\u52D5\u4E00\u908A\u5929\u5E73\u7ACB\u523B\u6B6A\u6389\u3002\u89E3\u5B8C\u628A x \u4EE3\u56DE\u539F\u5F0F\u9A57\u7B97,\u5DE6\u53F3\u76F8\u7B49\u624D\u7B97\u7834\u6848\u3002", "\u{1F4A1} \u9077\u79FB:\u65B9\u7A0B\u662F\u6578\u5B78\u7684\u842C\u80FD\u7FFB\u8B6F\u6A5F:\u61C9\u7528\u984C\u3001\u5E7E\u4F55\u3001\u7269\u7406\u516C\u5F0F,\u6700\u5F8C\u90FD\u5316\u6210\u5929\u5E73\u4E0A\u7684\u653B\u9632\u3002\u4ECA\u5929\u5B78\u7684\u6BCF\u4E00\u6B65,\u570B\u4E2D\u4E09\u5E74\u5929\u5929\u7528\u3002", "EN: An equation is a balance scale: whatever you do to one side, do to the other. Undo the additions first, then the multiplications, and substitute back to verify."],
    ["\u{1F9E0} \u539F\u7406:\u5DE5\u7A0B\u554F\u984C\u7684\u9470\u5319\u662F\u628A\u5DE5\u4F5C\u91CF\u8A2D\u70BA\u4E00:\u7532\u516D\u5929\u5B8C\u6210,\u6BCF\u5929\u505A\u516D\u5206\u4E4B\u4E00;\u4E59\u4E09\u5929\u5B8C\u6210,\u6BCF\u5929\u505A\u4E09\u5206\u4E4B\u4E00\u3002\u5408\u4F5C\u6642\u6548\u7387\u76F8\u52A0(\u516D\u5206\u4E4B\u4E00\u52A0\u4E09\u5206\u4E4B\u4E00\u5F97\u4E8C\u5206\u4E4B\u4E00),\u4E00\u9664\u4EE5\u5408\u4F75\u6548\u7387\u5F97\u5408\u4F5C\u5929\u6578\u4E8C\u5929\u3002\u5316\u6574\u70BA\u7387,\u5408\u4F5C\u5373\u52A0\u6CD5\u3002", "\u26A0 \u9677\u9631:\u5929\u6578\u4E0D\u80FD\u76F4\u63A5\u5E73\u5747!\u516D\u5929\u8207\u4E09\u5929\u5408\u4F5C\u4E0D\u662F\u56DB\u9EDE\u4E94\u5929\u2014\u2014\u5408\u4F5C\u6C38\u9060\u6BD4\u6700\u5FEB\u7684\u55AE\u7368\u8005\u66F4\u5FEB\u3002\u76F8\u52A0\u7684\u662F\u300C\u6BCF\u5929\u505A\u591A\u5C11\u300D,\u4E0D\u662F\u300C\u505A\u5E7E\u5929\u300D\u3002", "\u{1F4A1} \u9077\u79FB:\u6C34\u7BA1\u6CE8\u6C34\u3001\u591A\u53F0\u5370\u8868\u6A5F\u5217\u5370\u3001\u591A\u4EBA\u642C\u5BB6,\u5168\u662F\u6548\u7387\u76F8\u52A0\u3002\u7269\u7406\u7684\u4E26\u806F\u96FB\u963B\u516C\u5F0F,\u9AA8\u5B50\u88E1\u5C31\u662F\u5DE5\u7A0B\u554F\u984C\u3002", "EN: Set the whole job as one, so each worker contributes a daily fraction. Rates add when people cooperate, and one divided by the combined rate gives the joint time. Never average the days."],
    ["\u{1F9E0} \u539F\u7406:\u8CBB\u6CE2\u90A3\u5951\u6578\u5217:\u6BCF\u4E00\u9805\u7B49\u65BC\u524D\u5169\u9805\u4E4B\u548C(\u4E00\u3001\u4E00\u3001\u4E8C\u3001\u4E09\u3001\u4E94\u3001\u516B\u3001\u5341\u4E09\u2026\u2026)\u3002\u5B83\u7684\u898F\u5247\u4E0D\u770B\u300C\u5DEE\u300D\u4E5F\u4E0D\u770B\u300C\u500D\u300D,\u800C\u662F\u56DE\u982D\u770B\u81EA\u5DF1\u7684\u6B77\u53F2\u2014\u2014\u905E\u8FF4\u601D\u7DAD\u7684\u7B2C\u4E00\u6B21\u767B\u5834:\u7528\u524D\u9762\u7684\u7D50\u679C\u751F\u51FA\u5F8C\u9762\u7684\u7D50\u679C\u3002", "\u26A0 \u9677\u9631:\u6AA2\u67E5\u898F\u5F8B\u6642\u81F3\u5C11\u9A57\u8B49\u4E09\u7D44\u76F8\u9130\u95DC\u4FC2;\u5225\u6025\u8457\u5957\u7B49\u5DEE\u6216\u7B49\u6BD4\u2014\u2014\u8CBB\u6CE2\u90A3\u5951\u7684\u5DEE(\u4E00\u3001\u4E00\u3001\u4E8C\u3001\u4E09\u3001\u4E94)\u7ADF\u7136\u662F\u5B83\u81EA\u5DF1,\u9019\u6B63\u662F\u5B83\u7684\u7C3D\u540D\u3002", "\u{1F4A1} \u9077\u79FB:\u5411\u65E5\u8475\u7A2E\u5B50\u7684\u87BA\u65CB\u6578\u3001\u9CF3\u68A8\u8868\u76AE\u3001\u82B1\u74E3\u6578\u5E38\u662F\u8CBB\u6CE2\u90A3\u5951\u6578;\u5B83\u8207\u9EC3\u91D1\u6BD4\u4F8B\u7DCA\u5BC6\u76F8\u9023\u3002\u7A0B\u5F0F\u8A2D\u8A08\u7684\u905E\u8FF4\u51FD\u6578,\u7B2C\u4E00\u500B\u7BC4\u4F8B\u5E7E\u4E4E\u7E3D\u662F\u5B83\u3002", "EN: Each Fibonacci term is the sum of the previous two, a rule that consults its own history. Sunflower spirals and pineapple skins carry these numbers, and recursion in programming begins here."],
    ["\u{1F9E0} \u539F\u7406:\u5713\u9762\u7A4D\u7B49\u65BC\u5713\u5468\u7387\u4E58\u534A\u5F91\u5E73\u65B9\u3002\u63A8\u5C0E\u5F88\u7F8E:\u628A\u5713\u5207\u6210\u7121\u6578\u7D30\u6247\u5F62,\u4EA4\u932F\u62FC\u958B,\u6703\u6392\u6210\u4E00\u500B\u8FD1\u4F3C\u9577\u65B9\u5F62\u2014\u2014\u9577\u662F\u534A\u5713\u5468(\u5713\u5468\u7387\u4E58\u534A\u5F91),\u5BEC\u662F\u534A\u5F91,\u76F8\u4E58\u5373\u5F97\u3002\u5207\u788E\u91CD\u6392\u7684\u601D\u60F3,\u662F\u5FAE\u7A4D\u5206\u7684\u9059\u9060\u5E8F\u66F2\u3002", "\u26A0 \u9677\u9631:\u662F\u534A\u5F91\u7684\u5E73\u65B9,\u4E0D\u662F\u534A\u5F91\u4E58\u4E8C!\u534A\u5F91\u4E94\u7684\u5713\u9762\u7A4D\u662F\u5713\u5468\u7387\u4E58\u4E8C\u5341\u4E94,\u4E0D\u662F\u4E58\u5341\u3002\u5E73\u65B9\u5BEB\u6210\u4E58\u4E8C,\u7B54\u6848\u6703\u5C0F\u5F88\u591A\u500D\u3002", "\u{1F4A1} \u9077\u79FB:\u62AB\u85A9\u5C3A\u5BF8\u7684\u771F\u76F8(\u5341\u4E8C\u540B\u4E0D\u662F\u516D\u540B\u7684\u5169\u500D,\u662F\u56DB\u500D\u9762\u7A4D)\u3001\u6C34\u7BA1\u6D41\u91CF\u3001\u5713\u684C\u684C\u5E03\u3002\u5207\u788E\u91CD\u6392\u7684\u63A8\u5C0E,\u5927\u5B78\u5FAE\u7A4D\u5206\u8AB2\u6703\u6B63\u5F0F\u91CD\u9022\u3002", "EN: Slice a circle into thin sectors and rearrange them into a near rectangle: half the circumference times the radius, giving pi r squared. Squaring, not doubling, is the heart of the formula."],
    ["\u{1F9E0} \u539F\u7406:\u901F\u7387\u53CD\u63A8:\u8DDD\u96E2\u9664\u4EE5\u901F\u7387\u7B49\u65BC\u6642\u9593\u2014\u2014\u9435\u4E09\u89D2\u7684\u7B2C\u4E09\u7A2E\u7528\u6CD5\u3002\u4E00\u767E\u516B\u5341\u516C\u91CC\u4EE5\u6BCF\u5C0F\u6642\u516D\u5341\u516C\u91CC\u524D\u9032,\u9700\u8981\u4E09\u5C0F\u6642\u3002\u4E09\u500B\u91CF\u7684\u4EFB\u5169\u500B\u90FD\u80FD\u6C42\u7B2C\u4E09\u500B,\u516C\u5F0F\u4E09\u89D2\u5F62(\u8DDD\u96E2\u5728\u4E0A\u3001\u901F\u7387\u6642\u9593\u5728\u4E0B)\u5E6B\u4F60\u8A18\u7262\u65B9\u5411\u3002", "\u26A0 \u9677\u9631:\u9664\u7684\u65B9\u5411:\u662F\u8DDD\u96E2\u9664\u4EE5\u901F\u7387,\u4E0D\u662F\u901F\u7387\u9664\u4EE5\u8DDD\u96E2\u3002\u7528\u55AE\u4F4D\u6AA2\u67E5:\u516C\u91CC\u9664\u4EE5\u6BCF\u5C0F\u6642\u516C\u91CC,\u5269\u4E0B\u5C0F\u6642\u2014\u2014\u55AE\u4F4D\u5C0D\u4E86,\u5F0F\u5B50\u5C31\u5C0D\u4E86\u3002", "\u{1F4A1} \u9077\u79FB:\u65C5\u884C\u6642\u9593\u4F30\u7B97\u3001\u4E0B\u8F09\u5269\u9918\u6642\u9593\u3001\u99AC\u62C9\u677E\u914D\u901F,\u5168\u662F\u6642\u9593\u53CD\u63A8\u3002\u55AE\u4F4D\u5206\u6790(\u8B93\u55AE\u4F4D\u4E92\u76F8\u7D04\u5206)\u662F\u7406\u5316\u8AB2\u6700\u53EF\u9760\u7684\u8B77\u6B04,\u4ECA\u5929\u5148\u4E0A\u624B\u3002", "EN: Time equals distance divided by speed, the third face of the triangle. Let the units guide you: kilometres divided by kilometres per hour leaves pure hours."],
    ["\u{1F9E0} \u539F\u7406:\u770B\u5716\u6C42\u5713\u9762\u7A4D:\u5F9E\u5716\u4E0A\u8B80\u51FA\u534A\u5F91(\u6216\u76F4\u5F91),\u4EE3\u5165\u5713\u5468\u7387\u4E58\u534A\u5F91\u5E73\u65B9\u3002\u8B80\u5716\u662F\u95DC\u9375\u2014\u2014\u6A19\u8A3B\u7DDA\u82E5\u5F9E\u5713\u5FC3\u5230\u5713\u5468\u662F\u534A\u5F91,\u6A6B\u8CAB\u6574\u5713\u662F\u76F4\u5F91,\u5169\u8005\u5DEE\u4E00\u500D,\u516C\u5F0F\u5403\u7684\u662F\u534A\u5F91\u3002", "\u26A0 \u9677\u9631:\u7D66\u76F4\u5F91\u5148\u9664\u4EE5\u4E8C!\u76F4\u5F91\u5341\u7684\u5713,\u9762\u7A4D\u662F\u5713\u5468\u7387\u4E58\u4E8C\u5341\u4E94,\u4E0D\u662F\u4E58\u4E00\u767E\u3002\u843D\u7B46\u524D\u6307\u8457\u6A19\u8A3B\u7DDA\u81EA\u554F:\u9019\u662F\u534A\u5F91\u9084\u662F\u76F4\u5F91?", "\u{1F4A1} \u9077\u79FB:\u5713\u684C\u3001\u4E95\u84CB\u3001\u5674\u6C34\u6C60\u3001\u96F7\u9054\u7BC4\u570D\u2014\u2014\u5DE5\u7A0B\u5716\u7D19\u4E0A\u6EFF\u662F\u5713\u3002\u8B80\u5716\u8FA8\u8B58\u5C3A\u5BF8\u7684\u529F\u592B,\u548C\u516C\u5F0F\u672C\u8EAB\u540C\u7B49\u91CD\u8981\u3002", "EN: Identify whether the labelled segment is a radius or a diameter before touching the formula, since area feeds on the radius alone. Halve any diameter first."],
    ["\u{1F9E0} \u539F\u7406:\u5E73\u884C\u56DB\u908A\u5F62\u9762\u7A4D\u7B49\u65BC\u5E95\u4E58\u9AD8:\u628A\u5DE6\u908A\u7A81\u51FA\u7684\u4E09\u89D2\u5F62\u5207\u4E0B\u3001\u5E73\u79FB\u88DC\u5230\u53F3\u908A,\u5E73\u884C\u56DB\u908A\u5F62\u5C31\u8B8A\u8EAB\u6210\u9577\u65B9\u5F62\u2014\u2014\u9762\u7A4D\u4E0D\u8B8A\u3001\u516C\u5F0F\u5171\u7528\u3002\u300C\u5207\u5272\u5E73\u79FB\u300D\u8B49\u660E\u4E86\u6B6A\u7684\u5716\u5F62\u8207\u6B63\u7684\u5716\u5F62\u672C\u662F\u540C\u91CF\u3002", "\u26A0 \u9677\u9631:\u9AD8\u662F\u5782\u76F4\u8DDD\u96E2,\u4E0D\u662F\u659C\u908A!\u659C\u908A\u5F80\u5F80\u6BD4\u9AD8\u9577,\u8AA4\u7528\u659C\u908A\u9762\u7A4D\u5FC5\u504F\u5927\u3002\u627E\u9AD8:\u5F9E\u9802\u908A\u5411\u5E95\u908A\u4F5C\u5782\u7DDA,\u90A3\u6BB5\u624D\u662F\u9AD8\u3002", "\u{1F4A1} \u9077\u79FB:\u4E09\u89D2\u5F62\u662F\u5E73\u884C\u56DB\u908A\u5F62\u7684\u4E00\u534A\u3001\u68AF\u5F62\u9760\u62FC\u63A5\u6B78\u968A\u2014\u2014\u6574\u500B\u9762\u7A4D\u5BB6\u65CF\u9760\u5207\u5272\u5E73\u79FB\u4E92\u76F8\u9023\u901A\u3002\u9019\u7A2E\u300C\u7B49\u7A4D\u8B8A\u5F62\u300D\u601D\u60F3,\u5E7E\u4F55\u8B49\u660E\u88E1\u662F\u5E38\u5BA2\u3002", "EN: Slide the overhanging triangle to the other side and the parallelogram becomes a rectangle, so area is base times perpendicular height, never the slanted side."],
    ["\u{1F9E0} \u539F\u7406:\u5EA7\u6A19\u662F\u4F4D\u7F6E\u7684\u5730\u5740\u7CFB\u7D71:\u5148\u6A6B\u5F8C\u7E31,(\u4E09,\u4E94)\u8868\u793A\u6A6B\u8D70\u4E09\u3001\u7E31\u8D70\u4E94\u3002\u5169\u500B\u6578\u5B57\u7684\u9806\u5E8F\u5C31\u662F\u898F\u5247\u672C\u8EAB\u2014\u2014\u7B1B\u5361\u5152\u628A\u5E7E\u4F55\u8207\u4EE3\u6578\u63A5\u4E0A\u7DDA,\u5F9E\u6B64\u5716\u5F62\u53EF\u4EE5\u8A08\u7B97\u3001\u65B9\u7A0B\u53EF\u4EE5\u4F5C\u5716,\u6578\u5B78\u7684\u5169\u5927\u6D32\u901A\u4E86\u6A4B\u3002", "\u26A0 \u9677\u9631:\u5148\u6A6B\u5F8C\u7E31\u7684\u9806\u5E8F\u4E0D\u53EF\u53CD:(\u4E09,\u4E94)\u8207(\u4E94,\u4E09)\u662F\u4E0D\u540C\u7684\u9EDE\u3002x \u5728\u524D y \u5728\u5F8C,\u50CF\u9580\u724C\u5148\u5BEB\u8857\u518D\u5BEB\u865F\u3002", "\u{1F4A1} \u9077\u79FB:\u5730\u5716\u7D93\u7DEF\u5EA6\u3001\u68CB\u76E4\u8A18\u8B5C\u3001\u87A2\u5E55\u50CF\u7D20\u3001\u96FB\u5B50\u904A\u6232\u89D2\u8272\u7684\u4F4D\u7F6E,\u5168\u662F\u5EA7\u6A19\u3002\u570B\u4E2D\u7684\u51FD\u6578\u5716\u5F62,\u5C31\u756B\u5728\u4ECA\u5929\u9019\u5F35\u683C\u5B50\u7D19\u4E0A\u3002", "EN: Coordinates are addresses: across first, then up. Descartes wired geometry to algebra with this pair of numbers, and every map, screen and game character lives on the grid."],
    ["\u{1F9E0} \u539F\u7406:\u9762\u7A4D\u6BD4\u8F03\u984C\u628A\u5169\u500B\u516C\u5F0F\u653E\u4E0A\u64C2\u53F0:\u4E09\u89D2\u5F62(\u5E95\u4E58\u9AD8\u9664\u4E8C)\u5C0D\u9577\u65B9\u5F62(\u9577\u4E58\u5BEC),\u5148\u5404\u81EA\u7B97\u6E05\u3001\u518D\u6BD4\u5927\u5C0F\u6216\u6C42\u6BD4\u503C\u3002\u6BD4\u8F03\u7684\u524D\u63D0\u662F\u540C\u55AE\u4F4D\u2014\u2014\u540C\u4E00\u628A\u5C3A\u91CF\u51FA\u7684\u6578\u5B57\u624D\u6709\u8CC7\u683C\u4E92\u6BD4\u3002", "\u26A0 \u9677\u9631:\u5225\u7528\u5916\u8868\u5224\u52DD\u8CA0:\u7626\u9AD8\u7684\u4E09\u89D2\u5F62\u53EF\u80FD\u5927\u904E\u77EE\u80D6\u7684\u9577\u65B9\u5F62\u3002\u51E1\u6BD4\u8F03,\u5FC5\u8A08\u7B97;\u5E7E\u4F55\u7684\u773C\u775B\u6703\u9A19\u4EBA,\u6578\u5B57\u4E0D\u6703\u3002", "\u{1F4A1} \u9077\u79FB:\u8CB7\u5730\u3001\u9078\u62AB\u85A9\u3001\u6BD4\u87A2\u5E55\u5927\u5C0F,\u4EBA\u751F\u5145\u6EFF\u9762\u7A4D\u6BD4\u8F03\u3002\u4EE5\u5F8C\u7684\u76F8\u4F3C\u5F62\u9762\u7A4D\u6BD4(\u908A\u9577\u6BD4\u7684\u5E73\u65B9),\u662F\u9019\u500B\u64C2\u53F0\u7684\u9AD8\u968E\u8CFD\u4E8B\u3002", "EN: Compute each area with its own formula before comparing, because visual judgement lies. Same units are the entry ticket to any fair comparison."],
    ["\u{1F9E0} \u539F\u7406:\u5713\u74B0\u9762\u7A4D\u7B49\u65BC\u5927\u5713\u6E1B\u5C0F\u5713:\u5713\u5468\u7387\u4E58\u5927\u534A\u5F91\u5E73\u65B9\u3001\u6E1B\u5713\u5468\u7387\u4E58\u5C0F\u534A\u5F91\u5E73\u65B9\u3002\u6316\u9664\u6CD5\u7684\u5713\u5F62\u7248\u2014\u2014\u751C\u751C\u5708\u7684\u9762\u7A4D,\u662F\u6574\u584A\u9905\u6E1B\u6389\u4E2D\u9593\u7684\u6D1E\u3002\u4E5F\u53EF\u63D0\u51FA\u516C\u56E0\u6578:\u5713\u5468\u7387\u4E58(\u5927\u534A\u5F91\u5E73\u65B9\u6E1B\u5C0F\u534A\u5F91\u5E73\u65B9),\u5C11\u6309\u5E7E\u6B21\u8A08\u7B97\u6A5F\u3002", "\u26A0 \u9677\u9631:\u5148\u5E73\u65B9\u3001\u518D\u76F8\u6E1B!\u5927\u534A\u5F91\u5E73\u65B9\u6E1B\u5C0F\u534A\u5F91\u5E73\u65B9,\u4E0D\u7B49\u65BC(\u5927\u6E1B\u5C0F)\u7684\u5E73\u65B9\u2014\u2014\u5341\u7684\u5E73\u65B9\u6E1B\u516D\u7684\u5E73\u65B9\u662F\u516D\u5341\u56DB,\u4E0D\u662F\u5341\u516D\u3002\u5E73\u65B9\u8207\u6E1B\u6CD5\u7684\u9806\u5E8F\u662F\u672C\u984C\u7684\u9748\u9B42\u3002", "\u{1F4A1} \u9077\u79FB:\u64CD\u5834\u8DD1\u9053\u3001\u588A\u5708\u3001\u5149\u789F\u7247,\u90FD\u662F\u5713\u74B0\u3002\u63D0\u516C\u56E0\u6578\u7684\u5316\u7C21\u624B\u6CD5,\u6B63\u662F\u570B\u4E2D\u56E0\u5F0F\u5206\u89E3\u7684\u7B2C\u4E00\u500B\u771F\u5BE6\u61C9\u7528\u3002", "EN: An annulus is the big circle minus the small one: square each radius before subtracting, since the difference of squares is not the square of the difference."],
    ["\u{1F9E0} \u539F\u7406:\u9580\u5F62(\u9577\u65B9\u5F62\u52A0\u534A\u5713)\u662F\u8907\u5408\u5716\u5F62\u7684\u7562\u696D\u8003:\u4E0A\u534A\u662F\u534A\u5713(\u5713\u9762\u7A4D\u9664\u4E8C),\u4E0B\u534A\u662F\u9577\u65B9\u5F62,\u76F8\u52A0\u5373\u5F97\u3002\u95DC\u9375\u6A4B\u6A11\u662F\u5C3A\u5BF8\u63DB\u7B97\u2014\u2014\u9580\u7684\u5BEC\u5EA6\u5C31\u662F\u534A\u5713\u7684\u76F4\u5F91,\u534A\u5F91\u662F\u5BEC\u5EA6\u7684\u4E00\u534A\u3002\u4E00\u500B\u6578\u5B57\u5728\u5169\u500B\u5716\u5F62\u88E1\u626E\u6F14\u5169\u7A2E\u89D2\u8272\u3002", "\u26A0 \u9677\u9631:\u534A\u5713\u9762\u7A4D\u8A18\u5F97\u9664\u4EE5\u4E8C;\u534A\u5F91\u7531\u5BEC\u5EA6\u63DB\u7B97\u800C\u4F86,\u5225\u76F4\u63A5\u62FF\u5BEC\u5EA6\u53BB\u5E73\u65B9\u3002\u5148\u756B\u8F14\u52A9\u7DDA\u628A\u9580\u62C6\u6210\u5169\u584A,\u5404\u81EA\u6A19\u597D\u5C3A\u5BF8\u518D\u52D5\u5DE5\u3002", "\u{1F4A1} \u9077\u79FB:\u96A7\u9053\u622A\u9762\u3001\u6559\u5802\u7A97\u3001\u9AD4\u80B2\u5834(\u9577\u65B9\u5F62\u52A0\u5169\u500B\u534A\u5713),\u5EFA\u7BC9\u4E16\u754C\u5145\u6EFF\u9580\u5F62\u3002\u62C6\u89E3\u3001\u63DB\u7B97\u3001\u5408\u4F75\u2014\u2014\u8907\u5408\u5716\u5F62\u7684\u4E09\u6B65\u821E,\u4ECA\u5929\u8DF3\u5B8C\u6574\u5957\u3002", "EN: An arched door splits into a rectangle plus a half circle whose diameter is the door width. Convert the shared dimension carefully, halve the circle area, then add the parts."]
  ]
};
const MATH_GEN = {
  1: [
    () => {
      const a = ri(2, 9), b = ri(2, 10);
      const k = 10 - a;
      const steps = b >= k ? [`\u2460 \u628A ${b} \u62C6\u6210 ${k} \u548C ${b - k}\u3002`, `\u2461 ${a} + ${k} = 10(\u5148\u88DC\u6EFF 10)\u3002`, `\u2462 10 + ${b - k} = ${a + b}\u3002`] : [`\u2460 \u5F9E ${a} \u958B\u59CB\u5F80\u4E0A\u6578 ${b} \u683C,\u5230 ${a + b}\u3002`];
      return fi(
        `${a} + ${b} = ?`,
        `What is ${a} plus ${b}?`,
        a + b,
        nearNums(a + b, 3),
        [`\u{1F511} ${b >= k ? "\u6E4A\u5341\u6CD5:\u5148\u88DC\u6EFF 10,\u518D\u52A0\u5269\u4E0B\u7684\u3002" : "\u5F80\u4E0A\u6578:\u9019\u984C\u52A0\u5B8C\u9084\u4E0D\u5230 10,\u5F9E\u7B2C\u4E00\u500B\u6578\u5F80\u524D\u8D70\u3002"} `, ...steps, `\u2714 \u9A57\u7B97:${a + b} \u2212 ${b} = ${a},\u56DE\u5F97\u53BB,\u6B63\u78BA!`, `EN: Method. Addition combines two amounts. Making a ten groups some of the second amount with the first; counting forward also works.`, `EN: Worked example. ${b >= k ? `Split ${b} into ${k} and ${b - k}. First ${a} + ${k} = 10, then 10 + ${b - k} = ${a + b}.` : `Count ${b} steps forward from ${a}: ${a} + ${b} = ${a + b}. No need to reach ten.`} Check: ${a + b} \u2212 ${b} = ${a}.`, `EN: Check and avoid mistakes. Splitting a number must keep its total unchanged. Subtract the second addend from your answer to recover the first.`]
      );
    },
    () => {
      const a = ri(8, 20), b = ri(1, a - 1);
      return fi(
        `${a} \u2212 ${b} = ?`,
        `What is ${a} minus ${b}?`,
        a - b,
        nearNums(a - b, 3),
        [`\u{1F511} \u6E1B\u6CD5\u5728\u91CF\u300C\u8DDD\u96E2\u300D:\u5F9E ${b} \u5230 ${a} \u6709\u591A\u9060\u3002`, `\u2460 \u5F9E ${b} \u5F80\u4E0A\u6578\u5230 ${a},\u5171\u8D70 ${a - b} \u6B65\u3002`, `\u2714 \u9A57\u7B97:${b} + ${a - b} = ${a},\u62FC\u5F97\u56DE\u53BB \u2713`, `EN: Method. Subtraction finds how much remains or how far apart two numbers are. Counting upward measures the same gap as taking away.`, `EN: Worked example. Count from ${b} to ${a}: the gap is ${a} \u2212 ${b} = ${a - b}. Check: ${b} + ${a - b} = ${a}.`, `EN: Check and avoid mistakes. Count the jumps, not the starting point. Adding the gap to the smaller number must reach the larger number.`]
      );
    },
    () => {
      let a = ri(1, 20), b = ri(1, 20);
      if (a === b) b += 1;
      const big = Math.max(a, b);
      return fi(
        `${a} \u548C ${b},\u54EA\u500B\u6BD4\u8F03\u5927?`,
        `Which is bigger, ${a} or ${b}?`,
        big,
        [Math.min(a, b), big + ri(1, 5), Math.max(0, Math.min(a, b) - ri(1, 3))],
        [`\u{1F511} \u6578\u7DDA\u898F\u5247:\u8D8A\u53F3\u908A\u7684\u6578\u8D8A\u5927\u3002`, `\u2460 \u60F3\u50CF\u6578\u7DDA,\u627E\u5230 ${Math.min(a, b)} \u548C ${big} \u7684\u4F4D\u7F6E\u3002`, `\u2461 ${big} \u5728\u53F3\u908A \u2192 \u6BD4\u8F03\u5927\u3002`, `EN: Method. Compare only the two numbers named in the question. A number farther right on the number line represents a greater amount.`, `EN: Worked example. ${big} is to the right of ${Math.min(a, b)} on the number line, so ${big} > ${Math.min(a, b)}. Of the two given numbers, ${big} is larger.`, `EN: Check and avoid mistakes. An extra answer choice may be larger than both given numbers, but it is not one of the two you were asked to compare.`]
      );
    },
    () => {
      const s = ri(1, 6), d = ri(1, 3);
      const seq = [s, s + d, s + 2 * d, s + 3 * d, s + 4 * d];
      return fi(
        `\u6578\u5217\u5075\u63A2:${seq[0]}, ${seq[1]}, ${seq[2]}, ?, ${seq[4]}\u3002? \u662F\u591A\u5C11?`,
        `Sequence detective: ${seq[0]}, ${seq[1]}, ${seq[2]}, ?, ${seq[4]}. What is missing?`,
        seq[3],
        nearNums(seq[3], 3),
        [`\u{1F511} \u6578\u5217\u4E09\u6B65\u9A5F:\u627E\u5DEE \u2192 \u9A57\u8B49 \u2192 \u9810\u6E2C\u3002`, `\u2460 \u76F8\u9130\u7684\u5DEE:${seq[1]}\u2212${seq[0]}=${d}\u3001${seq[2]}\u2212${seq[1]}=${d},\u56FA\u5B9A +${d}\u3002`, `\u2461 \u7F3A\u683C = ${seq[2]} + ${d} = ${seq[3]}\u3002`, `\u2714 \u9A57\u7B97:${seq[3]} + ${d} = ${seq[4]},\u63A5\u5F97\u4E0A\u6700\u5F8C\u4E00\u9805 \u2713`, `EN: Method. Compare consecutive terms to find a repeated increase. Use the same increase to predict the missing term.`, `EN: Worked example. The gaps are ${seq[1]} \u2212 ${seq[0]} = ${d} and ${seq[2]} \u2212 ${seq[1]} = ${d}. Add ${d}: ${seq[2]} + ${d} = ${seq[3]}. Check: ${seq[3]} + ${d} = ${seq[4]}.`, `EN: Check and avoid mistakes. Check both sides of the missing position. Your answer must fit the term before it and the term after it.`]
      );
    },
    () => {
      const a = ri(1, 10), b = ri(1, 10);
      return fi(
        `${a} + ? = ${a + b},? \u662F\u591A\u5C11?`,
        `${a} plus what equals ${a + b}?`,
        b,
        nearNums(b, 3),
        [`\u{1F511} \u52A0\u6CD5\u7684\u53CD\u9762\u662F\u6E1B\u6CD5:\u672A\u77E5\u7684\u90E8\u5206 = \u5168\u90E8 \u2212 \u5DF2\u77E5\u3002`, `\u2460 ${a + b} \u2212 ${a} = ${b}\u3002`, `\u2714 \u9A57\u7B97:${a} + ${b} = ${a + b} \u2713`, `EN: Method. The sum is the whole, and the known addend is one part. Subtracting that part reveals the missing part.`, `EN: Worked example. Subtract the known part from the whole: ${a + b} \u2212 ${a} = ${b}. Check: ${a} + ${b} = ${a + b}.`, `EN: Check and avoid mistakes. Replace the question mark with your result. The completed addition must equal the given total.`]
      );
    },
    () => {
      const a = ri(5, 15), b = ri(1, a - 1);
      const t = pick([
        {
          q: `\u5C0F\u8C93\u6709 ${a} \u9846\u5F48\u73E0,\u9001\u51FA ${b} \u9846,\u9084\u5269\u5E7E\u9846?`,
          en: `A cat has ${a} marbles and gives away ${b}. How many are left?`,
          ans: a - b,
          why: [`\u{1F511} \u5269\u4E0B = \u539F\u6709 \u2212 \u9001\u51FA(\u627E\u95DC\u9375\u5B57:\u300C\u9001\u51FA\u300D=\u6E1B)\u3002`, `\u2460 ${a} \u2212 ${b} = ${a - b}\u3002`, `\u2714 \u9A57\u7B97:\u5269\u7684 ${a - b} + \u9001\u7684 ${b} = ${a} \u2713`, `EN: Method. Giving something away reduces the starting amount, so use subtraction. The amount left and the amount given away together make the original amount.`, `EN: Worked example. Giving away means subtract: ${a} \u2212 ${b} = ${a - b} marbles left. Check: ${a - b} + ${b} = ${a}.`, `EN: Check and avoid mistakes. Do not add the two amounts. Check by adding what remains to what was given away.`]
        },
        {
          q: `\u76D2\u5B50\u88E1\u6709 ${a} \u9846\u7CD6,\u53C8\u653E\u9032 ${b} \u9846,\u7E3D\u5171\u5E7E\u9846?`,
          en: `A box has ${a} candies; ${b} more go in. Total?`,
          ans: a + b,
          why: [`\u{1F511} \u7E3D\u5171 = \u539F\u6709 + \u65B0\u52A0(\u95DC\u9375\u5B57:\u300C\u53C8\u653E\u9032\u300D=\u52A0)\u3002`, `\u2460 ${a} + ${b} = ${a + b}\u3002`, `\u2714 \u9A57\u7B97:${a + b} \u2212 ${b} = ${a} \u2713`, `EN: Method. Putting more items in increases the amount, so use addition. The two groups become one combined total.`, `EN: Worked example. Adding candies means addition: ${a} + ${b} = ${a + b} candies. Check: ${a + b} \u2212 ${b} = ${a}.`, `EN: Check and avoid mistakes. The total must be larger than either positive group. Removing the new group should restore the original amount.`]
        }
      ]);
      return fi(t.q, t.en, t.ans, nearNums(t.ans, 3), t.why);
    },
    () => {
      const a = ri(2, 8), b = ri(2, 8);
      return fi(
        `\u{1F3C6} \u5C0F\u5947\u6392\u968A,\u524D\u9762\u6709 ${a} \u500B\u4EBA\u3001\u5F8C\u9762\u6709 ${b} \u500B\u4EBA\u3002\u9019\u4E00\u6392\u7E3D\u5171\u5E7E\u500B\u4EBA?`,
        `Chi stands in line with ${a} people ahead and ${b} behind. How many people in total?`,
        a + b + 1,
        [a + b, a + b + 2, Math.max(1, a + b - 1)],
        [`\u{1F511} \u5967\u6578\u9677\u9631:\u7E3D\u6578 = \u524D\u9762 + \u5F8C\u9762 + \u81EA\u5DF1!`, `\u2460 \u524D\u5F8C\u5408\u8A08:${a} + ${b} = ${a + b}(\u5C0F\u5947\u9084\u6C92\u88AB\u7B97\u9032\u53BB)\u3002`, `\u2461 \u52A0\u4E0A\u5C0F\u5947:${a + b} + 1 = ${a + b + 1}\u3002`, `\u{1F4A1} \u5FC3\u6CD5:\u984C\u76EE\u88E1\u300C\u96B1\u5F62\u7684\u4EBA\u4E8B\u7269\u300D\u6700\u611B\u8EB2\u9032\u7B54\u6848\u3002`, `EN: Method. The people ahead and behind form two groups, but neither group includes the person in the middle.`, `EN: Worked example. Count the people ahead and behind: ${a} + ${b} = ${a + b}. Include Chi: ${a + b} + 1 = ${a + b + 1} people.`, `EN: Check and avoid mistakes. After adding those groups, include the middle person exactly once. Drawing one mark per person helps prevent a missing or double count.`]
      );
    },
    () => {
      const cyc = pick([["\u25CB", "\u25B3"], ["\u25CB", "\u25CB", "\u25B3"], ["\u25B3", "\u25A1", "\u25CB"]]);
      const n = ri(5, 12);
      const L = cyc.length;
      const posi = (n - 1) % L + 1;
      const ans = cyc[(n - 1) % L];
      const others = shuffle(["\u25CB", "\u25B3", "\u25A1", "\u2606"].filter((x) => x !== ans)).slice(0, 3);
      return fi(
        `\u{1F3C6} \u5716\u5F62\u6392\u968A:${Array.from({ length: 6 }, (_, i) => cyc[i % L]).join(" ")} \u2026\u4E00\u76F4\u91CD\u8907\u3002\u7B2C ${n} \u500B\u662F\u4EC0\u9EBC?`,
        `The pattern repeats forever. What is shape number ${n}?`,
        ans,
        others,
        [`\u{1F511} \u9031\u671F\u554F\u984C:\u627E\u51FA\u91CD\u8907\u7684\u300C\u4E00\u7D44\u300D,\u7528\u9918\u6578\u5B9A\u4F4D\u3002`, `\u2460 \u4E00\u7D44\u662F\u300C${cyc.join("")}\u300D,\u9577\u5EA6 ${L}\u3002`, `\u2461 \u7B2C ${n} \u500B\u5C0D\u61C9\u7D44\u5167\u7B2C ${posi} \u500B \u2192 ${ans}\u3002`, `\u{1F4A1} \u627E\u5230\u9031\u671F\u5F8C,\u7B2C 1000 \u500B\u4E5F\u4E0D\u7528\u4E00\u500B\u4E00\u500B\u6578\u3002`, `EN: Method. Find the smallest block that repeats in the displayed pattern. Each complete block returns you to the same relative position.`, `EN: Worked example. The block ${cyc.join(" ")} has ${L} shapes. Position ${n} maps to (${n} \u2212 1) mod ${L} + 1 = ${posi} in the block, which is ${ans}. Subtracting 1 handles positions at the end of a block.`, `EN: Check and avoid mistakes. Positions start at one. A position divisible by the block length refers to the last shape in that block, not the first.`]
      );
    },
    () => {
      const f = ri(1, 3), o = ri(1, 4);
      return fi(
        `\u5C0F\u5947\u6709 ${f} \u500B 5 \u5143\u786C\u5E63\u548C ${o} \u500B 1 \u5143\u786C\u5E63,\u7E3D\u5171\u591A\u5C11\u5143?`,
        `Chi has ${f} five-dollar coins and ${o} one-dollar coins. Total?`,
        f * 5 + o,
        nearNums(f * 5 + o, 3),
        [`\u{1F511} \u9322\u5E63\u8A08\u7B97:\u5148\u7B97\u540C\u7A2E\u786C\u5E63\u7684\u5C0F\u8A08,\u518D\u76F8\u52A0\u3002`, `\u2460 5 \u5143\u786C\u5E63:${f} \xD7 5 = ${f * 5} \u5143\u3002`, `\u2461 1 \u5143\u786C\u5E63:${o} \xD7 1 = ${o} \u5143\u3002`, `\u2462 \u5408\u8A08:${f * 5} + ${o} = ${f * 5 + o} \u5143\u3002`, `\u2714 \u9A57\u7B97:${f * 5 + o} \u2212 ${o} = ${f * 5},\u662F 5 \u7684\u500D\u6578 \u2713`, `EN: Method. Coins have both a count and a value. Find the value of each coin group before combining the groups.`, `EN: Worked example. Five-dollar coins: ${f} \xD7 5 = ${f * 5}. One-dollar coins: ${o} \xD7 1 = ${o}. Add: ${f * 5} + ${o} = ${f * 5 + o} dollars.`, `EN: Check and avoid mistakes. Do not add coin counts as though every coin were worth one dollar. Keep the answer in dollars.`]
      );
    },
    () => {
      const a = ri(6, 12), b = ri(2, 6), c = ri(1, 5);
      return fi(
        `\u516C\u8ECA\u4E0A\u6709 ${a} \u4EBA,\u5230\u7AD9\u5F8C\u4E0A\u4F86 ${b} \u4EBA\u3001\u4E0B\u53BB ${c} \u4EBA\u3002\u73FE\u5728\u8ECA\u4E0A\u5E7E\u4EBA?`,
        `A bus has ${a} riders; ${b} board and ${c} leave. How many now?`,
        a + b - c,
        nearNums(a + b - c, 3),
        [`\u{1F511} \u5169\u6B65\u9A5F\u554F\u984C:\u4E00\u6B65\u4E00\u6B65\u4F86,\u5225\u6025\u8457\u4E00\u6B21\u7B97\u5B8C\u3002`, `\u2460 \u4E0A\u8ECA\u5F8C:${a} + ${b} = ${a + b} \u4EBA\u3002`, `\u2461 \u4E0B\u8ECA\u5F8C:${a + b} \u2212 ${c} = ${a + b - c} \u4EBA\u3002`, `\u2714 \u9A57\u7B97:${a + b - c} + ${c} \u2212 ${b} = ${a},\u5012\u63A8\u56DE\u8D77\u9EDE \u2713`, `EN: Method. Track the number of passengers after each event. Boarding increases the count; leaving decreases it.`, `EN: Worked example. After boarding: ${a} + ${b} = ${a + b}. After leaving: ${a + b} \u2212 ${c} = ${a + b - c} riders. Check: ${a + b - c} + ${c} \u2212 ${b} = ${a}.`, `EN: Check and avoid mistakes. Reverse the events to check: put the departing passengers back, then remove those who boarded.`]
      );
    },
    () => {
      const w = ri(3, 8), h = ri(2, 6);
      return fi(
        `\u770B\u5716:\u4E00\u500B\u9577\u65B9\u5F62\u9577 ${w}\u3001\u5BEC ${h} \u683C\u3002\u6578\u6578\u770B\u7E3D\u5171\u6709\u5E7E\u500B\u5C0F\u65B9\u683C?`,
        `Count the unit squares in this ${w}\xD7${h} rectangle.`,
        w * h,
        nearNums(w * h, 4),
        [`\u{1F511} \u9762\u7A4D\u7684\u8D77\u9EDE:\u6578\u65B9\u683C = \u6BCF\u6392\u6578\u91CF \xD7 \u6392\u6578\u3002`, `\u2460 \u6BCF\u6392 ${w} \u683C\u3002`, `\u2461 \u5171 ${h} \u6392:${w} \xD7 ${h} = ${w * h} \u683C\u3002`, `\u2714 \u63DB\u65B9\u5411\u6578:${h} \xD7 ${w} = ${w * h} \u2713`, `EN: Method. Equal rows let multiplication replace repeated counting. Multiply the number in one row by the number of rows.`, `EN: Worked example. There are ${w} unit squares in each of ${h} rows: ${w} \xD7 ${h} = ${w * h} squares. Counting the other way gives ${h} \xD7 ${w} = ${w * h}.`, `EN: Check and avoid mistakes. Count unit squares inside the boundary, not edges around it. Turning the grid does not change the total.`],
        GEO.rect(w, h, `${w} \u683C`, `${h} \u683C`)
      );
    },
    () => {
      const s = ri(2, 7);
      return fi(
        `\u770B\u5716:\u9019\u500B\u6B63\u65B9\u5F62\u6BCF\u908A ${s} \u516C\u5206\u3002\u56DB\u908A\u52A0\u8D77\u4F86(\u5468\u9577)\u662F\u591A\u5C11\u516C\u5206?`,
        `Each side of this square is ${s} cm. What is the perimeter?`,
        s * 4,
        nearNums(s * 4, 4),
        [`\u{1F511} \u6B63\u65B9\u5F62\u56DB\u908A\u4E00\u6A23\u9577,\u5468\u9577 = \u908A\u9577 \xD7 4\u3002`, `\u2460 ${s} \xD7 4 = ${s * 4} \u516C\u5206\u3002`, `\u2714 \u9010\u908A\u52A0:${s}+${s}+${s}+${s} = ${s * 4} \u2713`, `EN: Method. A perimeter measures one full trip around the boundary. A square has four sides of the same length.`, `EN: Worked example. Four equal sides give ${s} \xD7 4 = ${s * 4} cm. Check by adding: ${s} + ${s} + ${s} + ${s} = ${s * 4}.`, `EN: Check and avoid mistakes. Add all four side lengths to check. Multiplying just two sides gives area, which answers a different question.`],
        GEO.square(`${s} cm`)
      );
    },
    () => {
      const n = ri(3, 6);
      const shapes = [["\u4E09\u89D2\u5F62", 3], ["\u6B63\u65B9\u5F62", 4], ["\u4E94\u908A\u5F62", 5], ["\u516D\u908A\u5F62", 6]];
      const s = shapes[n - 3];
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        pts.push(`${(60 + 30 * Math.cos(a)).toFixed(0)},${(50 + 30 * Math.sin(a)).toFixed(0)}`);
      }
      return fi(
        `\u770B\u5716:\u9019\u500B\u5F62\u72C0\u6709\u5E7E\u500B\u908A?`,
        `How many sides does this shape have?`,
        n,
        nearNums(n, 2),
        [`\u{1F511} \u6578\u908A:\u7E5E\u4E00\u5708,\u6BCF\u4E00\u689D\u76F4\u7DDA\u7B97\u4E00\u908A\u3002`, `\u2460 \u9019\u662F${s[0]},\u6709 ${n} \u689D\u908A\u3002`, `\u2714 \u908A\u6578 = \u89D2\u6578:${n} \u500B\u908A\u914D ${n} \u500B\u89D2\u3002`, `EN: Method. A side is a straight segment between two neighboring corners. Follow the boundary in order rather than counting scattered lines.`, `EN: Worked example. Trace each straight edge once around the shape: there are ${n} sides. It also has ${n} corners, which checks the count.`, `EN: Check and avoid mistakes. Stop when you return to the starting corner. Each edge and corner should be counted once.`],
        SVG(`<polygon points="${pts.join(" ")}" class="gshape"/>`)
      );
    },
    () => {
      const w = ri(3, 7);
      return fi(
        `\u770B\u5716:\u4E00\u500B\u6B63\u65B9\u5F62\u88AB\u5206\u6210 ${w}\xD7${w} \u7684\u5C0F\u683C\u3002\u7E3D\u5171\u6709\u5E7E\u500B\u5C0F\u683C?`,
        `This square is split into a ${w}\xD7${w} grid. How many small squares?`,
        w * w,
        nearNums(w * w, 5),
        [`\u{1F511} \u65B9\u9663\u7E3D\u6578 = \u908A\u6578 \xD7 \u908A\u6578\u3002`, `\u2460 ${w} \xD7 ${w} = ${w * w} \u683C\u3002`, `\u2714 \u6B63\u65B9\u5F62\u7684\u9577\u5BEC\u76F8\u7B49,\u6240\u4EE5\u662F\u300C\u908A\u9577\u7684\u5E73\u65B9\u300D\u3002`, `EN: Method. The row count and column count are equal in a square grid. Their product counts every small cell exactly once.`, `EN: Worked example. Count ${w} squares in each of ${w} rows: ${w} \xD7 ${w} = ${w * w} small squares. Count only the smallest squares, not larger combinations.`, `EN: Check and avoid mistakes. The question asks for small cells only. Do not include squares formed by combining several cells.`],
        SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>` + Array.from({ length: w - 1 }, (_, i) => `<line x1="${30 + 60 * (i + 1) / w}" y1="18" x2="${30 + 60 * (i + 1) / w}" y2="78" class="gline"/><line x1="30" y1="${18 + 60 * (i + 1) / w}" x2="90" y2="${18 + 60 * (i + 1) / w}" class="gline"/>`).join(""))
      );
    },
    () => {
      const n = pick([[3, "\u4E09\u89D2\u5F62"], [4, "\u56DB\u908A\u5F62"], [5, "\u4E94\u908A\u5F62"], [6, "\u516D\u908A\u5F62"]]);
      const pts = Array.from({ length: n[0] }, (_, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n[0];
        return `${(60 + 34 * Math.cos(a)).toFixed(1)},${(50 + 34 * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      return fi(
        `\u770B\u5716:\u9019\u500B\u5716\u5F62\u6709\u5E7E\u689D\u908A?`,
        `How many sides does this shape have?`,
        n[0],
        [n[0] + 1, Math.max(3, n[0] - 1), n[0] + 2],
        [`\u{1F511} \u591A\u908A\u5F62\u7684\u540D\u5B57\u85CF\u8457\u7B54\u6848:\u5E7E\u908A\u5F62\u5C31\u6709\u5E7E\u689D\u908A\u3001\u5E7E\u500B\u89D2\u3002`, `\u2460 \u6CBF\u8457\u5716\u5F62\u63CF\u4E00\u5708,\u6578\u8F49\u6298\u4E4B\u9593\u7684\u76F4\u7DDA\u6BB5\u3002`, `\u2461 \u5171 ${n[0]} \u689D\u908A\u2014\u2014\u9019\u662F${n[1]}\u3002`, `\u2714 \u908A\u6578 = \u89D2\u6578:\u6578\u89D2\u4E5F\u662F ${n[0]} \u500B \u2713`, `EN: Method. Identify the polygon by its boundary segments, not its orientation or apparent size. Each corner joins two neighboring sides.`, `EN: Worked example. Trace the boundary once: there are ${n[0]} straight sides and ${n[0]} corners. Therefore this is a ${n[0]}-gon.`, `EN: Check and avoid mistakes. Trace one complete circuit and stop at the start. Counting the corners gives an independent check of the side count.`],
        SVG(`<polygon points="${pts}" class="gshape"/>`)
      );
    },
    () => {
      const a = ri(6, 12), b = ri(2, a - 2);
      return fi(
        `\u770B\u5716:\u4E0A\u9762\u7684\u68D2\u5B50\u9577 ${a} \u516C\u5206,\u4E0B\u9762\u7684\u9577 ${b} \u516C\u5206\u3002\u4E0A\u9762\u6BD4\u4E0B\u9762\u9577\u591A\u5C11\u516C\u5206?`,
        `The top bar is ${a} cm, the bottom ${b} cm. How much longer is the top?`,
        a - b,
        nearNums(a - b, 3),
        [`\u{1F511} \u300C\u6BD4\u2026\u9577\u591A\u5C11\u300D= \u5169\u9577\u5EA6\u76F8\u6E1B\u3002`, `\u2460 ${a} \u2212 ${b} = ${a - b} \u516C\u5206\u3002`, `\u2714 \u9A57\u7B97:${b} + ${a - b} = ${a} \u2713`, `EN: Method. How much longer asks for a difference, not a total. Align the starting ends and compare the extra length.`, `EN: Worked example. Subtract the shorter length: ${a} \u2212 ${b} = ${a - b} cm. Check: ${b} + ${a - b} = ${a}.`, `EN: Check and avoid mistakes. Add the difference to the shorter bar. It should then have the same length as the longer bar.`],
        SVG(`<rect x="10" y="26" width="${a * 8}" height="12" class="gshape"/><rect x="10" y="58" width="${b * 8}" height="12" class="gside"/>` + gLabel(10 + a * 4, 20, a + " cm") + gLabel(10 + b * 4, 84, b + " cm"))
      );
    }
  ],
  2: [
    () => {
      const a = ri(11, 88), b = ri(11, 99 - a);
      const at = Math.floor(a / 10) * 10, bt = Math.floor(b / 10) * 10;
      return fi(
        `${a} + ${b} = ?`,
        `${a} plus ${b}?`,
        a + b,
        nearNums(a + b, 10),
        [`\u{1F511} \u5206\u4F4D\u76F8\u52A0:\u5341\u4F4D\u8DDF\u5341\u4F4D\u3001\u500B\u4F4D\u8DDF\u500B\u4F4D\u3002`, `\u2460 \u5341\u4F4D:${at} + ${bt} = ${at + bt}\u3002`, `\u2461 \u500B\u4F4D:${a % 10} + ${b % 10} = ${a % 10 + b % 10}\u3002`, `\u2462 \u5408\u4F75:${at + bt} + ${a % 10 + b % 10} = ${a + b}\u3002`, `\u2714 \u9A57\u7B97:${a + b} \u2212 ${b} = ${a} \u2713`, `EN: Method. Place value lets you split each addend into tens and ones without changing its value. Add matching parts and combine their totals.`, `EN: Worked example. Add tens: ${at} + ${bt} = ${at + bt}. Add ones: ${a % 10} + ${b % 10} = ${a % 10 + b % 10}. Combine: ${at + bt} + ${a % 10 + b % 10} = ${a + b}. Check: ${a + b} \u2212 ${b} = ${a}.`, `EN: Check and avoid mistakes. If the ones total reaches ten, that extra ten is already included when you combine. Do not add it a second time.`]
      );
    },
    () => {
      const a = ri(30, 99), b = ri(11, a - 10);
      const bt = Math.floor(b / 10) * 10;
      return fi(
        `${a} \u2212 ${b} = ?`,
        `${a} minus ${b}?`,
        a - b,
        nearNums(a - b, 10),
        [`\u{1F511} \u62C6\u8457\u6E1B:\u5148\u6E1B\u6574\u5341,\u518D\u6E1B\u500B\u4F4D\u3002`, `\u2460 ${a} \u2212 ${bt} = ${a - bt}\u3002`, `\u2461 ${a - bt} \u2212 ${b % 10} = ${a - b}\u3002`, `\u2714 \u9A57\u7B97:${a - b} + ${b} = ${a} \u2713`, `EN: Method. Break the amount being subtracted into tens and ones. Removing those parts in order removes the whole amount.`, `EN: Worked example. Split ${b} into ${bt} and ${b % 10}. Subtract tens: ${a} \u2212 ${bt} = ${a - bt}. Then ones: ${a - bt} \u2212 ${b % 10} = ${a - b}. Check: ${a - b} + ${b} = ${a}.`, `EN: Check and avoid mistakes. Subtract both parts, including a zero ones part when present. Add the original subtrahend back to check.`]
      );
    },
    () => {
      const a = ri(2, 9), b = ri(2, 9);
      return fi(
        `${a} \xD7 ${b} = ?`,
        `${a} times ${b}?`,
        a * b,
        nearNums(a * b, a),
        [`\u{1F511} \u4E58\u6CD5 = \u52A0\u6CD5\u7684\u5FEB\u6377\u9375:${a}\xD7${b} \u5C31\u662F ${b} \u500B ${a}\u3002`, `\u2460 \u4E5D\u4E5D\u4E58\u6CD5\u8868:${a}\xD7${b} = ${a * b}\u3002`, `\u2461 \u5FD8\u4E86\u7684\u8A71\u7528\u9130\u5C45\u63A8:${a}\xD7${b - 1} = ${a * (b - 1)},\u518D\u52A0\u4E00\u500B ${a} \u2192 ${a * b}\u3002`, `EN: Method. Multiplication counts equal groups. A neighboring multiplication fact is useful because one extra group changes the total by exactly one group size.`, `EN: Worked example. ${b} groups of ${a} give ${a} \xD7 ${b} = ${a * b}. Build from a nearby fact: ${a} \xD7 ${b - 1} = ${a * (b - 1)}, then add ${a} to get ${a * b}.`, `EN: Check and avoid mistakes. Keep the group size fixed when moving to a neighboring fact. Divide the product by one factor to check the other.`]
      );
    },
    () => {
      const s = ri(2, 5);
      return fi(
        `\u6578\u5217\u5075\u63A2:${s}, ${s * 2}, ${s * 4}, ?\u3002\u4E0B\u4E00\u500B\u662F\u591A\u5C11?`,
        `Sequence detective: ${s}, ${s * 2}, ${s * 4}, ?. What comes next?`,
        s * 8,
        [s * 6, s * 5, s * 8 + s],
        [`\u{1F511} \u5DEE\u4E0D\u56FA\u5B9A\u6642,\u6539\u67E5\u300C\u500D\u7387\u300D\u3002`, `\u2460 ${s * 2}\xF7${s}=2\u3001${s * 4}\xF7${s * 2}=2 \u2192 \u6BCF\u6B21 \xD72\u3002`, `\u2461 \u4E0B\u4E00\u500B:${s * 4} \xD7 2 = ${s * 8}\u3002`, `\u2714 \u500D\u589E\u6578\u5217\u9577\u8D85\u5FEB\u2014\u2014\u9019\u5C31\u662F\u300C\u6307\u6578\u6210\u9577\u300D\u7684\u96DB\u5F62!`, `EN: Method. An equal multiplier can explain a sequence even when equal differences cannot. Compare consecutive terms by division.`, `EN: Worked example. The ratios are ${s * 2} \xF7 ${s} = 2 and ${s * 4} \xF7 ${s * 2} = 2. Double again: ${s * 4} \xD7 2 = ${s * 8}.`, `EN: Check and avoid mistakes. Doubling means multiplying by two, not adding two. Verify the same multiplier at every displayed step.`]
      );
    },
    () => {
      const p = ri(5, 20), n = ri(2, 5);
      return fi(
        `\u4E00\u679D\u7B46 ${p} \u5143,\u8CB7 ${n} \u679D\u8981\u591A\u5C11\u5143?`,
        `One pen costs ${p} dollars. How much for ${n} pens?`,
        p * n,
        nearNums(p * n, p),
        [`\u{1F511} \u7E3D\u50F9 = \u55AE\u50F9 \xD7 \u6578\u91CF\u3002`, `\u2460 ${p} \xD7 ${n} = ${p * n} \u5143\u3002`, `\u2461 \u4E5F\u53EF\u4EE5\u9023\u52A0\u9A57\u8B49:${Array.from({ length: n }, () => p).join("+")} = ${p * n}\u3002`, `EN: Method. Each pen has the same price, so buying several pens forms equal groups of that price.`, `EN: Worked example. Multiply price by quantity: ${p} \xD7 ${n} = ${p * n} dollars. Check by repeated addition: ${Array.from({ length: n }, () => p).join(" + ")} = ${p * n}.`, `EN: Check and avoid mistakes. The result is a cost, not a count of pens. Divide the total cost by the quantity to recover the unit price.`]
      );
    },
    () => {
      const b = ri(2, 9), q = ri(2, 9);
      return fi(
        `? \xD7 ${b} = ${b * q},? \u662F\u591A\u5C11?`,
        `What times ${b} equals ${b * q}?`,
        q,
        nearNums(q, 3),
        [`\u{1F511} \u9664\u6CD5\u662F\u4E58\u6CD5\u7684\u9006\u5411\u5075\u63A2\u3002`, `\u2460 ? = ${b * q} \xF7 ${b} = ${q}\u3002`, `\u2714 \u9A57\u7B97:${q} \xD7 ${b} = ${b * q} \u2713`, `EN: Method. The unknown is a factor. Division reverses multiplication and tells how many equal groups make the product.`, `EN: Worked example. Undo multiplication with division: ${b * q} \xF7 ${b} = ${q}. Check: ${q} \xD7 ${b} = ${b * q}.`, `EN: Check and avoid mistakes. Substitute the result into the original multiplication. Adding the given numbers will not undo multiplication.`]
      );
    },
    () => {
      const d = pick([2, 3, 5]), k = ri(4, 9);
      const L = d * k;
      return fi(
        `\u{1F3C6} \u4E00\u689D ${L} \u516C\u5C3A\u7684\u76F4\u8DEF,\u6BCF ${d} \u516C\u5C3A\u7A2E\u4E00\u68F5\u6A39(\u982D\u5C3E\u90FD\u7A2E),\u5171\u7A2E\u5E7E\u68F5?`,
        `A ${L} m road gets a tree every ${d} m, both ends included. How many trees?`,
        k + 1,
        [k, k + 2, Math.max(1, k - 1)],
        [`\u{1F511} \u67F5\u6B04\u9677\u9631:\u982D\u5C3E\u90FD\u7A2E\u6642,\u6A39\u6C38\u9060\u6BD4\u300C\u6BB5\u300D\u591A 1\u3002`, `\u2460 \u6BB5\u6578:${L} \xF7 ${d} = ${k} \u6BB5\u3002`, `\u2461 \u6A39:${k} + 1 = ${k + 1} \u68F5\u3002`, `\u2714 \u756B\u5C0F\u5716\u9A57\u8B49:3 \u6BB5\u7684\u8DEF |\u2014|\u2014|\u2014| \u6709 4 \u68F5 \u2713 \u898F\u5247\u6210\u7ACB\u3002`, `EN: Method. Dividing road length by spacing counts intervals between trees. Trees mark interval endpoints, so the first endpoint needs its own tree.`, `EN: Worked example. The road has ${L} \xF7 ${d} = ${k} intervals. Including both endpoints requires one more tree: ${k} + 1 = ${k + 1}.`, `EN: Check and avoid mistakes. This rule assumes a straight road with both ends planted. Do not confuse the number of gaps with the number of trees.`]
      );
    },
    () => {
      const u = ri(0, 7), t = ri(u + 1, 9);
      const num = t * 10 + u;
      return fi(
        `\u{1F3C6} \u6578\u5B57\u5075\u63A2:\u6211\u662F\u5169\u4F4D\u6578,\u5169\u500B\u6578\u5B57\u52A0\u8D77\u4F86\u662F ${t + u},\u5341\u4F4D\u6BD4\u500B\u4F4D\u5927 ${t - u}\u3002\u6211\u662F\u8AB0?`,
        `A two-digit number: digits sum to ${t + u}, tens digit exceeds ones by ${t - u}. Which number am I?`,
        num,
        nearNums(num, 10),
        [`\u{1F511} \u548C\u5DEE\u554F\u984C:\u5927\u7684 = (\u548C+\u5DEE)\xF72\u3002`, `\u2460 \u5341\u4F4D = (${t + u} + ${t - u}) \xF7 2 = ${t}\u3002`, `\u2461 \u500B\u4F4D = ${t + u} \u2212 ${t} = ${u} \u2192 \u7B54\u6848 ${num}\u3002`, `\u2714 \u6AA2\u67E5:${t}+${u}=${t + u} \u2713\u3001${t}\u2212${u}=${t - u} \u2713`, `EN: Method. Adding the digit sum and digit difference gives twice the larger digit. Halve that amount, then find the other digit from the sum.`, `EN: Worked example. The tens digit is (sum + difference) \xF7 2 = (${t + u} + ${t - u}) \xF7 2 = ${t}. The ones digit is ${t + u} \u2212 ${t} = ${u}. The number is 10 \xD7 ${t} + ${u} = ${num}. Check: ${t} \u2212 ${u} = ${t - u}.`, `EN: Check and avoid mistakes. A tens digit contributes ten times its value to the number. Verify both the digit sum and the digit difference.`]
      );
    },
    () => {
      const b = ri(2, 9), k = ri(2, 9);
      return fi(
        `${b * k} \u9846\u7CD6\u5E73\u5206\u7D66 ${b} \u500B\u4EBA,\u6BCF\u4EBA\u5206\u5230\u5E7E\u9846?`,
        `${b * k} candies shared equally among ${b} people. Each gets?`,
        k,
        nearNums(k, 3),
        [`\u{1F511} \u5E73\u5206=\u9664\u6CD5:\u7E3D\u6578 \xF7 \u4EBA\u6578 = \u6BCF\u4EBA\u4EFD\u3002`, `\u2460 ${b * k} \xF7 ${b} = ${k}\u3002`, `\u2714 \u9A57\u7B97:${k} \xD7 ${b} = ${b * k},\u525B\u597D\u5206\u5B8C \u2713`, `EN: Method. Equal sharing divides the whole into groups of identical size. The answer is the size of one group.`, `EN: Worked example. Divide the total equally: ${b * k} \xF7 ${b} = ${k} candies per person. Check: ${k} \xD7 ${b} = ${b * k}.`, `EN: Check and avoid mistakes. Multiply one share by the number of people. It must use all the candies with none left over.`]
      );
    },
    () => {
      const a = ri(2, 9);
      return fi(
        `${a} \u516C\u5C3A\u662F\u5E7E\u516C\u5206?`,
        `How many centimeters is ${a} meters?`,
        a * 100,
        [a * 10, a * 1e3, a * 100 + 10],
        [`\u{1F511} \u55AE\u4F4D\u63DB\u7B97:1 \u516C\u5C3A = 100 \u516C\u5206\u3002`, `\u2460 ${a} \xD7 100 = ${a * 100} \u516C\u5206\u3002`, `\u2714 \u53CD\u5411:${a * 100} \u516C\u5206 \xF7 100 = ${a} \u516C\u5C3A \u2713`, `EN: Method. A meter contains one hundred centimeters. Converting to smaller units increases the numerical count without changing the length.`, `EN: Worked example. Each meter is 100 centimeters, so ${a} \xD7 100 = ${a * 100} cm. Reverse check: ${a * 100} \xF7 100 = ${a} m.`, `EN: Check and avoid mistakes. Use the conversion for these specific units. Dividing the centimeter answer by one hundred must recover the meter value.`]
      );
    },
    () => {
      const w = ri(4, 12), h = ri(3, 9);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u5F62:\u9577 ${w} \u516C\u5206\u3001\u5BEC ${h} \u516C\u5206,\u9762\u7A4D\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?`,
        `This rectangle is ${w} by ${h} cm. Find its area.`,
        w * h,
        nearNums(w * h, 12),
        [`\u{1F511} \u9577\u65B9\u5F62\u9762\u7A4D = \u9577 \xD7 \u5BEC\u3002`, `\u2460 ${w} \xD7 ${h} = ${w * h} \u5E73\u65B9\u516C\u5206\u3002`, `\u2714 \u9762\u7A4D\u5728\u6578\u300C\u88E1\u9762\u585E\u5F97\u4E0B\u5E7E\u500B 1\xD71 \u65B9\u683C\u300D\u3002`, `EN: Method. Area measures the inside of a rectangle. Equal rows of unit squares explain why length is multiplied by width.`, `EN: Worked example. Area counts unit squares: ${w} \xD7 ${h} = ${w * h} square centimeters. Use square units because two lengths are multiplied.`, `EN: Check and avoid mistakes. Use square centimeters, not centimeters. Adding side lengths measures part of the boundary rather than the inside.`],
        GEO.rect(w, h, `${w} cm`, `${h} cm`)
      );
    },
    () => {
      const w = ri(4, 12), h = ri(3, 9);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u5F62:\u9577 ${w}\u3001\u5BEC ${h} \u516C\u5206\u3002\u8D70\u4E00\u5708\u7684\u5468\u9577\u662F\u591A\u5C11\u516C\u5206?`,
        `Perimeter of this ${w} by ${h} rectangle?`,
        2 * (w + h),
        nearNums(2 * (w + h), 8),
        [`\u{1F511} \u5468\u9577 = \u7E5E\u4E00\u5708 = (\u9577 + \u5BEC) \xD7 2\u3002`, `\u2460 ${w} + ${h} = ${w + h}(\u534A\u5708)\u3002`, `\u2461 \xD7 2 = ${2 * (w + h)} \u516C\u5206\u3002`, `\u2714 \u5225\u548C\u9762\u7A4D\u641E\u6DF7:\u5468\u9577\u662F\u300C\u908A\u7DDA\u7E3D\u9577\u300D\u3002`, `EN: Method. Opposite rectangle sides have equal lengths. Adding one length and one width measures half the boundary.`, `EN: Worked example. Add length and width: ${w} + ${h} = ${w + h}. Double for all four sides: ${w + h} \xD7 2 = ${2 * (w + h)} cm.`, `EN: Check and avoid mistakes. Double that sum to include all four sides. Do not multiply length by width, which gives area.`],
        GEO.rect(w, h, `${w} cm`, `${h} cm`)
      );
    },
    () => {
      const deg = pick([30, 45, 60, 120, 135, 150]);
      const kind = deg < 90 ? "\u92B3\u89D2(\u5C0F\u65BC90\xB0)" : "\u920D\u89D2(\u5927\u65BC90\xB0)";
      return fi(
        `\u770B\u5716\u7684\u89D2\u662F ${deg}\xB0\u3002180 \u6E1B\u6389\u5B83\u7B49\u65BC\u591A\u5C11?`,
        `This angle is ${deg}\xB0. What is 180 minus it?`,
        180 - deg,
        nearNums(180 - deg, 15),
        [`\u{1F511} ${deg}\xB0 \u662F${kind}\u3002\u4E00\u76F4\u7DDA\u662F 180\xB0\u3002`, `\u2460 180 \u2212 ${deg} = ${180 - deg}\xB0\u3002`, `\u2714 \u9019 ${180 - deg}\xB0 \u548C\u539F\u672C\u7684\u89D2\u80FD\u62FC\u6210\u4E00\u76F4\u7DDA\u3002`, `EN: Method. A straight angle is a half turn. The missing angle is the part left after taking away the given angle.`, `EN: Worked example. A straight angle is 180\xB0. Subtract: 180 \u2212 ${deg} = ${180 - deg}\xB0. Check: ${deg} + ${180 - deg} = 180\xB0.`, `EN: Check and avoid mistakes. Add your result to the given angle. Together they must make the straight angle, with no gap or overlap.`],
        GEO.anglecmp(deg)
      );
    },
    () => {
      const w = ri(5, 10), h = ri(3, 7);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u5F62\u9577 ${w}\u3001\u5BEC ${h}\u3002\u5982\u679C\u9577\u548C\u5BEC\u90FD\u52A0 1,\u65B0\u9762\u7A4D\u662F\u591A\u5C11?`,
        `This rectangle is ${w}\xD7${h}. If both grow by 1, what is the new area?`,
        (w + 1) * (h + 1),
        nearNums((w + 1) * (h + 1), 12),
        [`\u{1F511} \u5148\u8B8A\u65B0\u5C3A\u5BF8,\u518D\u7B97\u9762\u7A4D(\u5225\u6025\u8457\u7528\u820A\u6578\u5B57)\u3002`, `\u2460 \u65B0\u9577 ${w + 1}\u3001\u65B0\u5BEC ${h + 1}\u3002`, `\u2461 ${w + 1} \xD7 ${h + 1} = ${(w + 1) * (h + 1)}\u3002`, `\u{1F4A1} \u6CE8\u610F:\u9762\u7A4D\u589E\u52A0\u7684\u4E0D\u53EA 1,\u56E0\u70BA\u9577\u5BEC\u300C\u540C\u6642\u300D\u8B8A\u5927\u3002`, `EN: Method. Changing both dimensions changes the number of rows and the number of squares per row. Calculate the new dimensions before multiplying.`, `EN: Worked example. The new length is ${w} + 1 = ${w + 1} and the new width is ${h} + 1 = ${h + 1}. Multiply the new dimensions: ${w + 1} \xD7 ${h + 1} = ${(w + 1) * (h + 1)} square units.`, `EN: Check and avoid mistakes. Adding one to the old area misses the added strips and corner square. Use both new dimensions in the product.`],
        GEO.rect(w, h, `${w}\u2192${w + 1}`, `${h}\u2192${h + 1}`)
      );
    },
    () => {
      const s = ri(2, 7);
      return fi(
        `\u770B\u5716:\u5169\u500B\u908A\u9577 ${s} \u516C\u5206\u7684\u6B63\u65B9\u5F62\u62FC\u6210\u4E00\u500B\u9577\u65B9\u5F62\u3002\u9577\u65B9\u5F62\u7684\u300C\u9577\u300D\u662F\u591A\u5C11\u516C\u5206?`,
        `Two squares of side ${s} cm form a rectangle. How long is the rectangle?`,
        s * 2,
        [s, s * 3, s * 2 + 1],
        [`\u{1F511} \u62FC\u5716\u601D\u7DAD:\u5169\u500B\u6B63\u65B9\u5F62\u4E26\u6392,\u9577 = \u908A\u9577 \xD7 2,\u5BEC\u4E0D\u8B8A\u3002`, `\u2460 ${s} \xD7 2 = ${s * 2} \u516C\u5206\u3002`, `\u2714 \u5BEC\u4ECD\u662F ${s} \u516C\u5206,\u6240\u4EE5\u662F ${s * 2}\xD7${s} \u7684\u9577\u65B9\u5F62 \u2713`, `EN: Method. Joining two squares along a whole side makes a rectangle. The long direction contains two square sides in a row.`, `EN: Worked example. Two side lengths join end to end: ${s} + ${s} = ${s * 2} cm. The width remains ${s} cm, giving a ${s * 2} by ${s} rectangle.`, `EN: Check and avoid mistakes. The shared internal edge is not added to the length. The width stays equal to one square side.`],
        SVG(`<rect x="14" y="30" width="44" height="44" class="gshape"/><rect x="58" y="30" width="44" height="44" class="gshape"/>` + gLabel(36, 24, s + " cm") + gLabel(80, 24, s + " cm"))
      );
    },
    () => {
      const s = ri(3, 9);
      return fi(
        `\u770B\u5716:\u6B63\u65B9\u5F62\u7684\u5468\u9577\u662F ${s * 4} \u516C\u5206\u3002\u4E00\u689D\u908A\u662F\u591A\u5C11\u516C\u5206?`,
        `This square has perimeter ${s * 4} cm. How long is one side?`,
        s,
        nearNums(s, 3),
        [`\u{1F511} \u9006\u5411\u601D\u8003:\u5468\u9577 = \u908A \xD7 4,\u6240\u4EE5 \u908A = \u5468\u9577 \xF7 4\u3002`, `\u2460 ${s * 4} \xF7 4 = ${s} \u516C\u5206\u3002`, `\u2714 \u6B63\u5411\u9A57\u7B97:${s} \xD7 4 = ${s * 4} \u2713`, `\u{1F4A1} \u6703\u6B63\u8457\u7B97,\u4E5F\u8981\u6703\u5012\u8457\u63A8\u2014\u2014\u9019\u53EB\u9006\u904B\u7B97\u3002`, `EN: Method. A square divides its perimeter equally among four sides. Division recovers one side from the full boundary.`, `EN: Worked example. Divide the perimeter among four equal sides: ${s * 4} \xF7 4 = ${s} cm. Check: ${s} \xD7 4 = ${s * 4}.`, `EN: Check and avoid mistakes. Multiply the recovered side by four. It must match the given perimeter, using the same length unit.`],
        SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>` + gLabel(60, 94, `\u5468\u9577 ${s * 4} cm`) + gLabel(60, 50, "\u908A = ?"))
      );
    }
  ],
  3: [
    () => {
      const a = ri(3, 9), b = ri(12, 25);
      const bt = Math.floor(b / 10) * 10;
      return fi(
        `${a} \xD7 ${b} = ?`,
        `${a} times ${b}?`,
        a * b,
        nearNums(a * b, a * 2),
        [`\u{1F511} \u62C6\u958B\u7B97(\u5206\u914D\u5F8B):\u628A ${b} \u62C6\u6210 ${bt} \u548C ${b % 10}\u3002`, `\u2460 ${a} \xD7 ${bt} = ${a * bt}\u3002`, `\u2461 ${a} \xD7 ${b % 10} = ${a * (b % 10)}\u3002`, `\u2462 \u76F8\u52A0:${a * bt} + ${a * (b % 10)} = ${a * b}\u3002`, `EN: Method. Multiplication distributes over addition: splitting one factor into tens and ones creates two smaller products.`, `EN: Worked example. Split ${b} into ${bt} and ${b % 10}. Products: ${a} \xD7 ${bt} = ${a * bt} and ${a} \xD7 ${b % 10} = ${a * (b % 10)}. Add: ${a * bt} + ${a * (b % 10)} = ${a * b}.`, `EN: Check and avoid mistakes. Both parts must be multiplied by the other factor. Adding those products restores the original multiplication.`]
      );
    },
    () => {
      const b = ri(3, 9), q = ri(3, 12);
      return fi(
        `${b * q} \xF7 ${b} = ?`,
        `${b * q} divided by ${b}?`,
        q,
        nearNums(q, 3),
        [`\u{1F511} \u9664\u6CD5\u53CD\u554F\u4E58\u6CD5:\u300C${b} \u4E58\u591A\u5C11\u7B49\u65BC ${b * q}?\u300D`, `\u2460 \u60F3\u4E58\u6CD5\u8868:${b} \xD7 ${q} = ${b * q}\u3002`, `\u2461 \u6240\u4EE5\u7B54\u6848\u662F ${q}\u3002`, `\u2714 \u9A57\u7B97:${q} \xD7 ${b} = ${b * q} \u2713`, `EN: Method. Division asks which factor would recreate the dividend. A known multiplication fact can answer that question directly.`, `EN: Worked example. Use the multiplication fact ${b} \xD7 ${q} = ${b * q}. Therefore ${b * q} \xF7 ${b} = ${q}. Multiplying back verifies the answer.`, `EN: Check and avoid mistakes. Multiply the quotient by the divisor. An exact division must recover the dividend without a remainder.`]
      );
    },
    () => {
      const d = pick([2, 3, 4, 6, 8]), n = ri(1, d - 1);
      const whole = d * ri(2, 6);
      const ans = whole / d * n;
      return fi(
        `${whole} \u7684 ${n}/${d} \u662F\u591A\u5C11?`,
        `What is ${n}/${d} of ${whole}?`,
        ans,
        nearNums(ans, 4),
        [`\u{1F511} \u5206\u6578 = \u5148\u5207\u518D\u62FF\u3002`, `\u2460 \u5207:${whole} \xF7 ${d} = ${whole / d}(\u6BCF\u4E00\u4EFD\u7684\u5927\u5C0F)\u3002`, `\u2461 \u62FF:${whole / d} \xD7 ${n} = ${ans}(\u62FF ${n} \u4EFD)\u3002`, `\u2714 \u9A57\u7B97:\u62FF\u6EFF ${d} \u4EFD = ${whole / d}\xD7${d} = ${whole},\u56DE\u5230\u5168\u90E8 \u2713`, `EN: Method. The denominator sets the number of equal shares. The numerator tells how many of those shares to take.`, `EN: Worked example. Divide ${whole} into ${d} equal parts: ${whole} \xF7 ${d} = ${whole / d}. Take ${n} parts: ${whole / d} \xD7 ${n} = ${ans}.`, `EN: Check and avoid mistakes. Divide by the denominator before multiplying by the numerator. Taking all shares would restore the whole.`]
      );
    },
    () => {
      const b = ri(3, 9), q = ri(3, 9), r = ri(1, b - 1);
      const a = b * q + r;
      return fi(
        `${a} \xF7 ${b} = \u5546\u591A\u5C11\u3001\u9918\u591A\u5C11?`,
        `${a} divided by ${b}: quotient and remainder?`,
        `\u5546 ${q} \u9918 ${r}`,
        [`\u5546 ${q + 1} \u9918 ${r}`, `\u5546 ${q} \u9918 ${r === 1 ? 2 : r - 1}`, `\u5546 ${q - 1} \u9918 ${r}`],
        [`\u{1F511} \u5546 = \u88DD\u6EFF\u5E7E\u7D44;\u9918 = \u88DD\u4E0D\u4E0B\u7684\u96F6\u982D(\u5FC5\u9808\u5C0F\u65BC ${b})\u3002`, `\u2460 ${b} \xD7 ${q} = ${b * q}(\u6700\u63A5\u8FD1\u53C8\u4E0D\u8D85\u904E ${a})\u3002`, `\u2461 ${a} \u2212 ${b * q} = ${r}\u3002`, `\u2714 \u9A57\u7B97:${b}\xD7${q}+${r} = ${a} \u2713`, `EN: Method. The quotient counts complete groups. The remainder is the leftover that cannot fill another whole group.`, `EN: Worked example. ${b} \xD7 ${q} = ${b * q} fits in ${a}. The leftover is ${a} \u2212 ${b * q} = ${r}, less than ${b}. Quotient ${q}, remainder ${r}. Check: ${b} \xD7 ${q} + ${r} = ${a}.`, `EN: Check and avoid mistakes. The remainder must be nonnegative and smaller than the divisor. Divisor times quotient plus remainder must recover the dividend.`]
      );
    },
    () => {
      const st = ri(1, 8), len = ri(1, 3);
      return fi(
        `\u96FB\u5F71 ${st} \u9EDE\u958B\u59CB,\u6F14 ${len} \u5C0F\u6642,\u5E7E\u9EDE\u7D50\u675F?`,
        `A movie starts at ${st} and runs ${len} hours. When does it end?`,
        st + len,
        nearNums(st + len, 2),
        [`\u{1F511} \u7D50\u675F = \u958B\u59CB + \u7D93\u904E\u3002`, `\u2460 ${st} + ${len} = ${st + len} \u9EDE\u3002`, `\u2714 \u5012\u63A8\u9A57\u7B97:${st + len} \u2212 ${len} = ${st},\u56DE\u5230\u958B\u5834 \u2713`, `EN: Method. Elapsed time moves the clock forward from the starting time. Here the duration is given in whole hours.`, `EN: Worked example. End time = start + duration: ${st} + ${len} = ${st + len}. The movie ends at ${st + len} oclock. Check: ${st + len} \u2212 ${len} = ${st}.`, `EN: Check and avoid mistakes. Subtract the duration from the ending time to check the start. Use the same time unit throughout.`]
      );
    },
    () => {
      const l = ri(4, 15), w = ri(3, l);
      return fi(
        `\u9577 ${l} \u516C\u5206\u3001\u5BEC ${w} \u516C\u5206\u7684\u9577\u65B9\u5F62,\u5468\u9577\u662F\u591A\u5C11\u516C\u5206?`,
        `Perimeter of a ${l} by ${w} rectangle?`,
        2 * (l + w),
        [l * w, l + w, 2 * l + w],
        [`\u{1F511} \u5468\u9577 = \u7E5E\u4E00\u5708:\u5169\u689D\u9577 + \u5169\u689D\u5BEC\u3002`, `\u2460 \u534A\u5708:${l} + ${w} = ${l + w}\u3002`, `\u2461 \u4E00\u5708:${l + w} \xD7 2 = ${2 * (l + w)}\u3002`, `\u2714 \u9010\u908A\u52A0\u9A57\u7B97:${l}+${w}+${l}+${w} = ${2 * (l + w)} \u2713`, `EN: Method. A rectangle boundary contains two lengths and two widths. Pairing one of each makes half the perimeter.`, `EN: Worked example. Half the boundary is ${l} + ${w} = ${l + w}. Double it: ${l + w} \xD7 2 = ${2 * (l + w)} cm. Check all sides: ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)}.`, `EN: Check and avoid mistakes. Add the four individual sides as a check. The answer measures length, not square units.`]
      );
    },
    () => {
      const c = ri(2, 6), r = ri(2, 6);
      const h = c + r, l = 2 * c + 4 * r;
      return fi(
        `\u{1F3C6} \u96DE\u5154\u540C\u7C60:\u7C60\u88E1\u5171 ${h} \u500B\u982D\u3001${l} \u96BB\u8173\u3002\u5154\u5B50\u6709\u5E7E\u96BB?`,
        `Chickens and rabbits share a cage: ${h} heads, ${l} legs. How many rabbits?`,
        r,
        nearNums(r, 2),
        [`\u{1F511} \u5047\u8A2D\u6CD5:\u5148\u5047\u8A2D\u5168\u90E8\u662F\u96DE,\u770B\u8173\u591A\u51FA\u591A\u5C11\u3002`, `\u2460 \u5168\u96DE\u7684\u8A71:${h} \xD7 2 = ${2 * h} \u96BB\u8173\u3002`, `\u2461 \u5BE6\u969B\u591A\u51FA:${l} \u2212 ${2 * h} = ${l - 2 * h} \u96BB\u8173\u3002`, `\u2462 \u6BCF\u628A\u4E00\u96BB\u96DE\u63DB\u6210\u5154,\u8173\u591A 2 \u2192 \u5154 = ${l - 2 * h} \xF7 2 = ${r} \u96BB\u3002`, `\u2714 \u9A57\u7B97:\u5154 ${r}\xD74 + \u96DE ${c}\xD72 = ${l} \u96BB\u8173 \u2713`, `EN: Method. Start with the simpler assumption that every animal has two legs. Each replacement by a four-legged animal adds exactly two legs.`, `EN: Worked example. If all ${h} animals were chickens, there would be ${h} \xD7 2 = ${2 * h} legs. Extra legs: ${l} \u2212 ${2 * h} = ${l - 2 * h}. Each rabbit adds 2 extra legs, so ${l - 2 * h} \xF7 2 = ${r} rabbits. Check: ${r} \xD7 4 + ${c} \xD7 2 = ${l}.`, `EN: Check and avoid mistakes. Use the head count to find the remaining chickens, then verify the total legs. Both given totals must agree.`]
      );
    },
    () => {
      const days = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
      const s = ri(0, 6), n = ri(8, 30);
      const e = (s + n) % 7;
      return fi(
        `\u{1F3C6} \u4ECA\u5929\u661F\u671F${days[s]},\u518D\u904E ${n} \u5929\u662F\u661F\u671F\u5E7E?`,
        `Today is ${"Sun Mon Tue Wed Thu Fri Sat".split(" ")[s]}. What day is it ${n} days later?`,
        `\u661F\u671F${days[e]}`,
        shuffle(days.filter((_, i) => i !== e)).slice(0, 3).map((x) => `\u661F\u671F${x}`),
        [`\u{1F511} \u661F\u671F\u662F\u300C\u5FAA\u74B0 7\u300D\u7684\u4E16\u754C,\u53EA\u6709\u9918\u6578\u91CD\u8981\u3002`, `\u2460 ${n} \xF7 7 = ${Math.floor(n / 7)} \u9031\u2026\u9918 ${n % 7} \u5929(\u6574\u9031\u53EF\u4EE5\u76F4\u63A5\u4E1F\u6389)\u3002`, `\u2461 \u661F\u671F${days[s]} \u5F80\u5F8C ${n % 7} \u5929 \u2192 \u661F\u671F${days[e]}\u3002`, `\u{1F4A1} \u4E00\u842C\u5929\u5F8C\u662F\u661F\u671F\u5E7E,\u4E5F\u662F\u540C\u4E00\u62DB\u3002`, `EN: Method. Weekdays repeat after seven days. Whole weeks leave the weekday unchanged, so only the leftover days shift it.`, `EN: Worked example. ${n} days = ${Math.floor(n / 7)} whole weeks and ${n % 7} days. Move ${n % 7} days forward from ${"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[s]} to ${"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[e]}. Whole weeks return to the same weekday.`, `EN: Check and avoid mistakes. Today is the starting position, not the first elapsed day. Advance by the remainder without counting today again.`]
      );
    },
    () => {
      const a = ri(120, 480), b = ri(120, 499);
      return fi(
        `${a} + ${b} = ?`,
        `${a} plus ${b}?`,
        a + b,
        nearNums(a + b, 40),
        [`\u{1F511} \u4E09\u4F4D\u6578\u52A0\u6CD5:\u767E\u4F4D\u3001\u5341\u4F4D\u3001\u500B\u4F4D\u5404\u81EA\u5C0D\u9F4A\u76F8\u52A0\u3002`, `\u2460 \u767E\u4F4D:${Math.floor(a / 100) * 100} + ${Math.floor(b / 100) * 100} = ${Math.floor(a / 100) * 100 + Math.floor(b / 100) * 100}\u3002`, `\u2461 \u5269\u4E0B\u7684:${a % 100} + ${b % 100} = ${a % 100 + b % 100}\u3002`, `\u2462 \u5408\u4F75:${a + b}\u3002`, `\u2714 \u4F30\u7B97:\u7D04 ${Math.round(a / 100) * 100}+${Math.round(b / 100) * 100}=${Math.round(a / 100) * 100 + Math.round(b / 100) * 100},\u63A5\u8FD1 \u2713`, `EN: Method. Separate hundreds from the remaining tens and ones. Adding these parts independently preserves each number\u2019s value.`, `EN: Worked example. Add hundreds: ${Math.floor(a / 100) * 100} + ${Math.floor(b / 100) * 100} = ${Math.floor(a / 100) * 100 + Math.floor(b / 100) * 100}. Add the remaining parts: ${a % 100} + ${b % 100} = ${a % 100 + b % 100}. Combine to get ${a + b}. Check: ${a + b} \u2212 ${b} = ${a}.`, `EN: Check and avoid mistakes. Combine the entire remainder, including any new hundred it forms. Subtract an original addend to check.`]
      );
    },
    () => {
      const t = pick([{ q: "\u516C\u65A4\u662F\u5E7E\u516C\u514B", u: 1e3, ue: "kilograms in grams" }, { q: "\u5C0F\u6642\u662F\u5E7E\u5206\u9418", u: 60, ue: "hours in minutes" }]);
      const a = ri(2, 9);
      return fi(
        `${a} ${t.q}?`,
        `${a} ${t.ue}?`,
        a * t.u,
        [a * t.u / 10, a * t.u * 10, a * t.u + t.u / 10],
        [`\u{1F511} \u55AE\u4F4D\u63DB\u7B97:\u5148\u8A18\u4F4F\u300C1 \u5927\u55AE\u4F4D=\u591A\u5C11\u5C0F\u55AE\u4F4D\u300D\u9019\u628A\u9470\u5319(\u9019\u984C\u662F ${t.u})\u3002`, `\u2460 ${a} \xD7 ${t.u} = ${a * t.u}\u3002`, `\u2714 \u53CD\u5411\u9664\u56DE\u53BB:${a * t.u} \xF7 ${t.u} = ${a} \u2713`, `EN: Method. Choose the conversion factor for the units named in this question. Each large unit contributes the same number of small units.`, `EN: Worked example. For ${t.ue}, multiply by ${t.u}: ${a} \xD7 ${t.u} = ${a * t.u}. Check by reversing: ${a * t.u} \xF7 ${t.u} = ${a}.`, `EN: Check and avoid mistakes. Time and mass use different conversion factors. Divide the answer by the selected factor to recover the original amount.`]
      );
    },
    () => {
      const a = ri(30, 80), b = ri(30, 150 - a);
      return fi(
        `\u770B\u5716\u7684\u4E09\u89D2\u5F62,\u5DF2\u77E5\u5169\u500B\u89D2\u662F ${a}\xB0 \u548C ${b}\xB0\u3002\u7B2C\u4E09\u500B\u89D2(?)\u662F\u5E7E\u5EA6?`,
        `Two angles of this triangle are ${a}\xB0 and ${b}\xB0. Find the third (?).`,
        180 - a - b,
        nearNums(180 - a - b, 15),
        [`\u{1F511} \u4E09\u89D2\u5F62\u5167\u89D2\u548C\u6C38\u9060 = 180\xB0\u3002`, `\u2460 \u5DF2\u77E5\u5169\u89D2\u76F8\u52A0:${a} + ${b} = ${a + b}\u3002`, `\u2461 \u7B2C\u4E09\u89D2:180 \u2212 ${a + b} = ${180 - a - b}\u3002`, `\u2714 \u4E09\u89D2\u76F8\u52A0:${a}+${b}+${180 - a - b} = 180 \u2713`, `EN: Method. The interior angles of a triangle sum to a straight angle. Subtract the total of both known angles to find the third.`, `EN: Worked example. Known angles: ${a} + ${b} = ${a + b}\xB0. Subtract from 180\xB0: 180 \u2212 ${a + b} = ${180 - a - b}\xB0. Check: ${a} + ${b} + ${180 - a - b} = 180\xB0.`, `EN: Check and avoid mistakes. Subtract both known angles, not only one. All three positive angles should add to the required total.`],
        GEO.triangle(a, b, true)
      );
    },
    () => {
      const base = ri(4, 12), h = ri(3, 10);
      const area = base * h / 2;
      return fi(
        `\u770B\u5716\u7684\u76F4\u89D2\u4E09\u89D2\u5F62,\u5E95 ${base} \u516C\u5206\u3001\u9AD8 ${h} \u516C\u5206\u3002\u9762\u7A4D\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?`,
        `This right triangle has base ${base} and height ${h} cm. Find the area.`,
        area,
        nearNums(area, 6),
        [`\u{1F511} \u4E09\u89D2\u5F62\u9762\u7A4D = \u5E95 \xD7 \u9AD8 \xF7 2(\u5B83\u662F\u9577\u65B9\u5F62\u7684\u4E00\u534A!)\u3002`, `\u2460 ${base} \xD7 ${h} = ${base * h}(\u6574\u500B\u9577\u65B9\u5F62)\u3002`, `\u2461 \xF7 2 = ${area} \u5E73\u65B9\u516C\u5206\u3002`, `\u2714 \u60F3\u50CF\u5169\u500B\u4E00\u6A23\u7684\u4E09\u89D2\u5F62\u62FC\u6210\u9577\u65B9\u5F62,\u9762\u7A4D\u525B\u597D\u4E00\u534A\u3002`, `EN: Method. Two matching right triangles can form a rectangle with the same base and height. One triangle therefore has half its area.`, `EN: Worked example. A rectangle with the same base and height has area ${base} \xD7 ${h} = ${base * h}. The triangle is half: ${base * h} \xF7 2 = ${area} square centimeters.`, `EN: Check and avoid mistakes. Use perpendicular base and height, then divide by two exactly once. Report square units.`],
        GEO.rtri(`${base} cm`, `${h} cm`)
      );
    },
    () => {
      const top = ri(3, 6), bot = ri(7, 11), h = ri(3, 6);
      const area = (top + bot) * h / 2;
      return fi(
        `\u770B\u5716\u7684\u68AF\u5F62:\u4E0A\u5E95 ${top}\u3001\u4E0B\u5E95 ${bot}\u3001\u9AD8 ${h} \u516C\u5206\u3002\u9762\u7A4D\u662F\u591A\u5C11?`,
        `This trapezoid has parallel sides ${top} and ${bot}, height ${h}. Find the area.`,
        area,
        nearNums(area, 8),
        [`\u{1F511} \u68AF\u5F62\u9762\u7A4D =(\u4E0A\u5E95 + \u4E0B\u5E95)\xD7 \u9AD8 \xF7 2\u3002`, `\u2460 \u4E0A\u5E95+\u4E0B\u5E95:${top} + ${bot} = ${top + bot}\u3002`, `\u2461 \xD7\u9AD8\xF72:${top + bot} \xD7 ${h} \xF7 2 = ${area}\u3002`, `\u{1F4A1} \u60F3\u50CF\u4E0A\u4E0B\u5169\u5E95\u7684\u300C\u5E73\u5747\u9577\u5EA6\u300D\u4E58\u4EE5\u9AD8,\u5C31\u662F\u9762\u7A4D\u3002`, `EN: Method. Two matching trapezoids can form a parallelogram whose base is the sum of the parallel sides. One trapezoid has half that area.`, `EN: Worked example. Add the parallel sides: ${top} + ${bot} = ${top + bot}. Multiply by height and halve: ${top + bot} \xD7 ${h} \xF7 2 = ${area} square centimeters.`, `EN: Check and avoid mistakes. Add the parallel sides before multiplying by the perpendicular height. Remember the final division by two.`],
        GEO.trapezoid(`${top}`, `${bot}`, `${h}`)
      );
    },
    () => {
      const s = ri(3, 8);
      const per = s * 3;
      return fi(
        `\u770B\u5716\u7684\u6B63\u4E09\u89D2\u5F62,\u6BCF\u908A ${s} \u516C\u5206\u3002\u5468\u9577\u662F\u591A\u5C11?`,
        `This equilateral triangle has sides of ${s} cm. Find the perimeter.`,
        per,
        nearNums(per, 4),
        [`\u{1F511} \u6B63\u4E09\u89D2\u5F62\u4E09\u908A\u7B49\u9577,\u5468\u9577 = \u908A\u9577 \xD7 3\u3002`, `\u2460 ${s} \xD7 3 = ${per} \u516C\u5206\u3002`, `\u2714 \u4E09\u908A\u90FD\u662F ${s}:${s}+${s}+${s} = ${per} \u2713`, `EN: Method. Equilateral means all three sides have equal length. The perimeter adds one copy of the side length for each side.`, `EN: Worked example. Three equal sides give ${s} \xD7 3 = ${per} cm. Check: ${s} + ${s} + ${s} = ${per}.`, `EN: Check and avoid mistakes. Add three copies directly to check. A side length is not an angle measure.`],
        SVG(`<polygon points="60,20 92,74 28,74" class="gshape"/>` + gLabel(60, 16, `${s}`) + gLabel(88, 80, `${s}`) + gLabel(32, 80, `${s}`))
      );
    },
    () => {
      const w = ri(3, 9), h = ri(3, 9);
      return fi(
        `\u770B\u5716:\u9577\u65B9\u5F62\u7684\u9762\u7A4D\u662F ${w * h} \u5E73\u65B9\u516C\u5206,\u9577\u662F ${w} \u516C\u5206\u3002\u5BEC\u662F\u591A\u5C11\u516C\u5206?`,
        `Area is ${w * h} sq cm and length is ${w} cm. Find the width.`,
        h,
        nearNums(h, 3),
        [`\u{1F511} \u9762\u7A4D = \u9577 \xD7 \u5BEC \u2192 \u5BEC = \u9762\u7A4D \xF7 \u9577(\u9006\u904B\u7B97)\u3002`, `\u2460 ${w * h} \xF7 ${w} = ${h} \u516C\u5206\u3002`, `\u2714 \u9A57\u7B97:${w} \xD7 ${h} = ${w * h} \u2713`, `EN: Method. Area is the product of length and width. Dividing by the known length reverses that multiplication.`, `EN: Worked example. Undo area = length \xD7 width: ${w * h} \xF7 ${w} = ${h} cm. Check: ${w} \xD7 ${h} = ${w * h} square centimeters.`, `EN: Check and avoid mistakes. Multiply the recovered width by the length to check the given area. The width uses length units.`],
        GEO.rect(w, h, `${w} cm`, `?`).replace("</svg>", gLabel(60, 52, `\u9762\u7A4D ${w * h}`) + "</svg>")
      );
    },
    () => {
      const a = pick([40, 50, 60, 70, 80, 100, 120]);
      const b = (180 - a) / 2;
      return fi(
        `\u770B\u5716\u7684\u7B49\u8170\u4E09\u89D2\u5F62(\u5169\u8170\u76F8\u7B49,\u8A18\u865F\u76F8\u540C),\u9802\u89D2\u662F ${a}\xB0\u3002\u4E00\u500B\u5E95\u89D2\u662F\u5E7E\u5EA6?`,
        `This isosceles triangle has apex ${a}\xB0. Find one base angle.`,
        b,
        nearNums(b, 12),
        [`\u{1F511} \u7B49\u8170\u4E09\u89D2\u5F62:\u5169\u5E95\u89D2\u76F8\u7B49;\u4E09\u89D2\u548C = 180\xB0\u3002`, `\u2460 \u5169\u5E95\u89D2\u5408\u8A08:180 \u2212 ${a} = ${180 - a}\xB0\u3002`, `\u2461 \u5E73\u5206\u7D66\u5169\u500B\u89D2:${180 - a} \xF7 2 = ${b}\xB0\u3002`, `\u2714 \u9A57\u7B97:${a} + ${b} + ${b} = 180 \u2713`, `EN: Method. Equal sides imply equal base angles. Remove the apex angle from the triangle total, then share what remains equally.`, `EN: Worked example. The two equal base angles total 180 \u2212 ${a} = ${180 - a}\xB0. Divide equally: ${180 - a} \xF7 2 = ${b}\xB0. Check: ${a} + ${b} + ${b} = 180\xB0.`, `EN: Check and avoid mistakes. The remaining angle total belongs to two base angles. Halve it, then check all three angles together.`],
        SVG(`<polygon points="60,18 24,80 96,80" class="gshape"/><line x1="40" y1="46" x2="46" y2="52" class="gang"/><line x1="80" y1="46" x2="74" y2="52" class="gang"/>` + gLabel(60, 34, a + "\xB0") + gLabel(34, 74, "?"))
      );
    }
  ],
  4: [
    () => {
      const a = ri(12, 40), b = ri(12, 40);
      const bt = Math.floor(b / 10) * 10;
      return fi(
        `${a} \xD7 ${b} = ?`,
        `${a} times ${b}?`,
        a * b,
        nearNums(a * b, 30),
        [`\u{1F511} \u5927\u6578\u4E58\u6CD5\u4E00\u6A23\u7528\u300C\u62C6\u958B\u7B97\u300D:\u628A ${b} \u62C6\u6210 ${bt} \u548C ${b % 10}\u3002`, `\u2460 ${a} \xD7 ${bt} = ${a * bt}\u3002`, `\u2461 ${a} \xD7 ${b % 10} = ${a * (b % 10)}\u3002`, `\u2462 \u76F8\u52A0:${a * bt} + ${a * (b % 10)} = ${a * b}\u3002`, `\u2714 \u4F30\u7B97\u6AA2\u67E5:\u7D04 ${Math.round(a / 10) * 10}\xD7${bt} = ${Math.round(a / 10) * 10 * bt},\u6578\u91CF\u7D1A\u63A5\u8FD1 \u2713`, `EN: Method. Split one factor using place value and apply multiplication to both parts. This is the distributive property.`, `EN: Worked example. Split ${b} into ${bt} and ${b % 10}. Multiply: ${a} \xD7 ${bt} = ${a * bt} and ${a} \xD7 ${b % 10} = ${a * (b % 10)}. Add the products: ${a * bt} + ${a * (b % 10)} = ${a * b}.`, `EN: Check and avoid mistakes. Do not forget the place value of the tens part. Add the partial products rather than multiplying them together.`]
      );
    },
    () => {
      const d = pick([5, 7, 8, 9, 11]);
      const n1 = ri(1, d - 2), n2 = ri(1, d - n1 - 1);
      const fans = `${n1 + n2}/${d}`;
      const fds = [.../* @__PURE__ */ new Set([`${n1 + n2}/${d * 2}`, `${n1 + n2 + 1}/${d}`, `${n1 * n2}/${d}`, `${Math.max(1, n1 + n2 - 1)}/${d}`, `${n1 + n2}/${d + 1}`])].filter((x) => x !== fans).slice(0, 3);
      return fi(
        `${n1}/${d} + ${n2}/${d} = ?`,
        `${n1}/${d} plus ${n2}/${d}?`,
        fans,
        fds,
        [`\u{1F511} \u5206\u6BCD = \u5207\u6CD5\u3002\u5207\u6CD5\u76F8\u540C,\u53EA\u52A0\u300C\u62FF\u7684\u4EFD\u6578\u300D\u3002`, `\u2460 \u4EFD\u6578\u76F8\u52A0:${n1} + ${n2} = ${n1 + n2}\u3002`, `\u2461 \u5207\u6CD5\u4E0D\u8B8A:\u5206\u6BCD\u4ECD\u662F ${d} \u2192 ${n1 + n2}/${d}\u3002`, `\u26A0 \u6700\u5E38\u898B\u7684\u932F:\u628A\u5206\u6BCD\u4E5F\u52A0\u8D77\u4F86(${d}+${d}=${d * 2})\u2014\u2014\u90A3\u7B49\u65BC\u6539\u8B8A\u4E86\u5207\u6CD5!`, `EN: Method. Fractions with the same denominator already describe equal-sized pieces. Addition changes how many pieces you have, not their size.`, `EN: Worked example. Both fractions use pieces of size 1/${d}. Add the numerators: ${n1} + ${n2} = ${n1 + n2}. Keep the denominator ${d}: ${n1}/${d} + ${n2}/${d} = ${fans}.`, `EN: Check and avoid mistakes. Keep the denominator unchanged. An equivalent simplified fraction represents the same result.`]
      );
    },
    () => {
      const w = ri(3, 12), h = ri(3, 12);
      return fi(
        `\u9577 ${w}\u3001\u5BEC ${h} \u516C\u5206\u7684\u9577\u65B9\u5F62,\u9762\u7A4D\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?`,
        `Area of a ${w} by ${h} rectangle?`,
        w * h,
        nearNums(w * h, 10),
        [`\u{1F511} \u9762\u7A4D = \u6578 1\xD71 \u5C0F\u65B9\u584A:\u6BCF\u6392 ${w} \u584A\u3001\u5171 ${h} \u6392\u3002`, `\u2460 ${w} \xD7 ${h} = ${w * h} \u5E73\u65B9\u516C\u5206\u3002`, `\u2714 \u63DB\u65B9\u5411\u6578:${h} \xD7 ${w} = ${w * h},\u4E00\u6A23 \u2713(\u4E58\u6CD5\u4EA4\u63DB\u5F8B!)`, `EN: Method. A rectangle is tiled by equal rows of unit squares. Multiplication counts every row without listing each square.`, `EN: Worked example. Each of ${h} rows contains ${w} unit squares: ${w} \xD7 ${h} = ${w * h} square centimeters. Reversing the rows and columns gives ${h} \xD7 ${w} = ${w * h}.`, `EN: Check and avoid mistakes. Use square units. Swapping length and width should leave the area unchanged.`]
      );
    },
    () => {
      const a = ri(30, 80), b = ri(30, 140 - a);
      return fi(
        `\u4E09\u89D2\u5F62\u5169\u500B\u89D2\u662F ${a}\xB0 \u548C ${b}\xB0,\u7B2C\u4E09\u500B\u89D2\u662F\u5E7E\u5EA6?`,
        `A triangle has angles ${a}\xB0 and ${b}\xB0. The third angle?`,
        180 - a - b,
        nearNums(180 - a - b, 15),
        [`\u{1F511} \u9435\u5F8B:\u4EFB\u4F55\u4E09\u89D2\u5F62\u7684\u5167\u89D2\u548C\u90FD\u662F 180\xB0\u2014\u2014\u6495\u4E0B\u4E09\u500B\u89D2\u62FC\u8D77\u4F86\u525B\u597D\u4E00\u689D\u76F4\u7DDA!`, `\u2460 \u5DF2\u77E5\u5169\u89D2:${a} + ${b} = ${a + b}\u3002`, `\u2461 \u7B2C\u4E09\u89D2:180 \u2212 ${a + b} = ${180 - a - b}\u3002`, `\u2714 \u9A57\u7B97:${a} + ${b} + ${180 - a - b} = 180 \u2713`, `EN: Method. The unknown angle completes the triangle\u2019s fixed interior-angle total. First combine the two known contributions.`, `EN: Worked example. The known angles total ${a} + ${b} = ${a + b}\xB0. The third is 180 \u2212 ${a + b} = ${180 - a - b}\xB0. Check: ${a} + ${b} + ${180 - a - b} = 180\xB0.`, `EN: Check and avoid mistakes. Check by adding all three angles. Estimating from a sketch is less reliable than using the labeled values.`]
      );
    },
    () => {
      const a = ri(10, 99) / 10, b = ri(10, 99) / 10;
      const s = Math.round((a + b) * 10) / 10;
      return fi(
        `${a} + ${b} = ?`,
        `${a} plus ${b}?`,
        s,
        [Math.round((s + 0.3) * 10) / 10, Math.round((s - 0.2) * 10) / 10, Math.round((s + 1) * 10) / 10],
        [`\u{1F511} \u5C0F\u6578\u9EDE = \u300C\u500B\u4F4D\u5728\u54EA\u88E1\u300D\u7684\u5EA7\u6A19,\u5148\u5C0D\u9F4A\u518D\u52A0\u3002`, `\u2460 \u5C0F\u6578\u9EDE\u5C0D\u9F4A,\u50CF\u76F4\u5F0F\u52A0\u6CD5\u4E00\u6A23\u7B97\u3002`, `\u2461 ${a} + ${b} = ${s}\u3002`, `\u2714 \u4F30\u7B97\u6AA2\u67E5:\u7D04 ${Math.round(a)} + ${Math.round(b)} = ${Math.round(a) + Math.round(b)},\u548C ${s} \u63A5\u8FD1 \u2713`, `EN: Method. Align place values so tenths are added to tenths and whole units to whole units. Scaling both addends by ten permits integer arithmetic.`, `EN: Worked example. Align the decimal points. Add tenths: ${Math.round(a * 10)} + ${Math.round(b * 10)} = ${Math.round(s * 10)} tenths. Divide by 10: ${a} + ${b} = ${s}.`, `EN: Check and avoid mistakes. Scale the sum back by ten exactly once. Do not align numbers by their final digit instead of their decimal point.`]
      );
    },
    () => {
      const s = ri(1, 8), d = ri(2, 4);
      const t = [s, s + d, s + 2 * d + 2, s + 3 * d + 6];
      const next = s + 4 * d + 12;
      return fi(
        `\u6578\u5217\u5075\u63A2:${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ?\u3002\u4E0B\u4E00\u500B?`,
        `Sequence detective: ${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ?. Next?`,
        next,
        nearNums(next, 4),
        [`\u{1F511} \u4E00\u968E\u5DEE\u4E0D\u56FA\u5B9A?\u5F80\u4E0B\u6316\u4E00\u5C64,\u770B\u300C\u5DEE\u7684\u5DEE\u300D\u3002`, `\u2460 \u5DEE:+${d}, +${d + 2}, +${d + 4} \u2192 \u5DEE\u672C\u8EAB\u6BCF\u6B21\u591A 2\u3002`, `\u2461 \u4E0B\u4E00\u500B\u5DEE = +${d + 6}\u3002`, `\u2462 ${t[3]} + ${d + 6} = ${next}\u3002`, `\u{1F4A1} \u9019\u53EB\u300C\u4E8C\u968E\u898F\u5F8B\u300D\u2014\u2014\u4F60\u525B\u7528\u4E86\u5FAE\u7A4D\u5206\u7684\u601D\u8003\u96DB\u5F62\u3002`, `EN: Method. When consecutive gaps differ, inspect how the gaps themselves change. Continue that second-level pattern to find the next gap.`, `EN: Worked example. Successive gaps are ${d}, ${d + 2}, ${d + 4}; each gap increases by 2. The next gap is ${d + 6}, so ${t[3]} + ${d + 6} = ${next}.`, `EN: Check and avoid mistakes. Add the next gap to the final term. Do not mistake the gap itself for the requested next term.`]
      );
    },
    () => {
      const n = pick([10, 20, 30, 40, 50, 100]);
      return fi(
        `\u{1F3C6} 1+2+3+\u2026+${n} = ?(\u60F3\u60F3\u9AD8\u65AF 9 \u6B72\u6642\u600E\u9EBC\u7B97)`,
        `What is 1+2+...+${n}? (Gauss cracked this at age nine)`,
        n * (n + 1) / 2,
        nearNums(n * (n + 1) / 2, n),
        [`\u{1F511} \u982D\u5C3E\u914D\u5C0D:1+${n}\u30012+${n - 1}\u30013+${n - 2}\u2026\u6BCF\u4E00\u5C0D\u90FD\u662F ${n + 1}!`, `\u2460 \u7E3D\u5171\u53EF\u4EE5\u914D ${n} \xF7 2 = ${n / 2} \u5C0D\u3002`, `\u2461 ${n + 1} \xD7 ${n / 2} = ${n * (n + 1) / 2}\u3002`, `\u{1F4A1} \u9AD8\u65AF\u4E5D\u6B72\u60F3\u51FA\u9019\u62DB\u2014\u2014\u6B63\u662F\u4F60\u7684\u5E74\u7D00\u3002\u9019\u662F\u300C\u842C\u7528\u5DE5\u5177\u300D:\u4EFB\u4F55\u7B49\u5DEE\u6578\u5217\u90FD\u9069\u7528\u3002`, `EN: Method. Pairing the first and last terms gives equal pair totals. The chosen endpoint is even, so every term fits into one pair.`, `EN: Worked example. Pair first and last: 1 + ${n} = ${n + 1}. There are ${n} \xF7 2 = ${n / 2} pairs, giving ${n + 1} \xD7 ${n / 2} = ${n * (n + 1) / 2}.`, `EN: Check and avoid mistakes. Count pairs, not terms, before multiplying. Each original term must appear once in the pairing.`]
      );
    },
    () => {
      const small = ri(5, 20), big = small + ri(3, 15);
      const s = big + small, d = big - small;
      return fi(
        `\u{1F3C6} \u5169\u500B\u6578\u7684\u548C\u662F ${s}\u3001\u5DEE\u662F ${d}\u3002\u6BD4\u8F03\u5927\u7684\u6578\u662F\u591A\u5C11?`,
        `Two numbers: sum ${s}, difference ${d}. The larger one is?`,
        big,
        nearNums(big, 4),
        [`\u{1F511} \u548C\u5DEE\u516C\u5F0F:\u5927 = (\u548C+\u5DEE)\xF72\u3002\u60F3\u50CF\u628A\u300C\u5DEE\u300D\u88DC\u7D66\u5C0F\u7684,\u5169\u4EBA\u5C31\u4E00\u6A23\u5927\u3002`, `\u2460 (${s} + ${d}) \xF7 2 = ${big}\u3002`, `\u2461 \u5C0F\u7684 = ${s} \u2212 ${big} = ${small}\u3002`, `\u2714 \u9A57\u7B97:${big}+${small}=${s} \u2713\u3001${big}\u2212${small}=${d} \u2713`, `EN: Method. Adding the sum and difference cancels the smaller number and leaves twice the larger number. Halving isolates the larger number.`, `EN: Worked example. Add sum and difference, then halve: (${s} + ${d}) \xF7 2 = ${big}. The smaller number is ${s} \u2212 ${big} = ${small}. Check: ${big} + ${small} = ${s} and ${big} \u2212 ${small} = ${d}.`, `EN: Check and avoid mistakes. Recover the smaller number from the sum. Check both relationships, since matching just one is insufficient.`]
      );
    },
    () => {
      const b = ri(3, 9), k = ri(3, 9);
      return fi(
        `${b * k} \u662F ${b} \u7684\u5E7E\u500D?`,
        `${b * k} is how many times ${b}?`,
        k,
        nearNums(k, 3),
        [`\u{1F511} \u300C\u5E7E\u500D\u300D\u5C31\u662F\u9664\u6CD5:\u5927 \xF7 \u5C0F = \u500D\u6578\u3002`, `\u2460 ${b * k} \xF7 ${b} = ${k}\u3002`, `\u2714 \u9A57\u7B97:${b} \xD7 ${k} = ${b * k} \u2713`, `EN: Method. How many times compares an amount with a reference group size. Division counts how many reference groups fit.`, `EN: Worked example. Divide by the reference amount: ${b * k} \xF7 ${b} = ${k} times. Check: ${b} \xD7 ${k} = ${b * k}.`, `EN: Check and avoid mistakes. This result is a multiplier, not the difference between the amounts. Multiply by the reference to check.`]
      );
    },
    () => {
      const a = ri(50, 99) / 10, b = ri(10, Math.round(a * 10) - 5) / 10;
      const d = Math.round((a - b) * 10) / 10;
      return fi(
        `${a} \u2212 ${b} = ?`,
        `${a} minus ${b}?`,
        d,
        [Math.round((d + 0.3) * 10) / 10, Math.round((d - 0.2) * 10) / 10, Math.round((d + 1) * 10) / 10],
        [`\u{1F511} \u5C0F\u6578\u6E1B\u6CD5:\u5C0F\u6578\u9EDE\u5C0D\u9F4A,\u50CF\u6574\u6578\u4E00\u6A23\u501F\u4F4D\u3002`, `\u2460 \u5C0D\u9F4A\u5C0F\u6578\u9EDE,${a} \u2212 ${b}\u3002`, `\u2461 \u5F97 ${d}\u3002`, `\u2714 \u9A57\u7B97:${d} + ${b} = ${a} \u2713`, `EN: Method. Subtract matching decimal places. Thinking in tenths turns this into whole-number subtraction with the same relative values.`, `EN: Worked example. Align decimals and subtract tenths: ${Math.round(a * 10)} \u2212 ${Math.round(b * 10)} = ${Math.round(d * 10)} tenths. Therefore ${a} \u2212 ${b} = ${d}. Check: ${d} + ${b} = ${a}.`, `EN: Check and avoid mistakes. Return from tenths to the original units. Add the subtracted amount back to verify the result.`]
      );
    },
    () => {
      const a = ri(4, 9), b = ri(3, 7), c = ri(3, 6), d = ri(3, 6);
      const area = a * b + c * d;
      return fi(
        `\u770B\u5716\u7684 L \u5F62,\u53EF\u62C6\u6210\u5169\u500B\u9577\u65B9\u5F62:${a}\xD7${b} \u548C ${c}\xD7${d}\u3002\u7E3D\u9762\u7A4D\u662F\u591A\u5C11?`,
        `This L-shape splits into a ${a}\xD7${b} and a ${c}\xD7${d} rectangle. Total area?`,
        area,
        nearNums(area, 12),
        [`\u{1F511} \u8907\u5408\u5716\u5F62:\u5207\u6210\u5E7E\u500B\u9577\u65B9\u5F62,\u5206\u5225\u7B97\u518D\u76F8\u52A0\u3002`, `\u2460 \u7B2C\u4E00\u584A:${a} \xD7 ${b} = ${a * b}\u3002`, `\u2461 \u7B2C\u4E8C\u584A:${c} \xD7 ${d} = ${c * d}\u3002`, `\u2462 \u5408\u8A08:${a * b} + ${c * d} = ${area}\u3002`, `\u{1F4A1} \u62C6\u89E3\u6CD5:\u518D\u8907\u96DC\u7684\u5716\u5F62\u90FD\u80FD\u62C6\u6210\u6703\u7B97\u7684\u5C0F\u584A\u3002`, `EN: Method. Area adds across non-overlapping parts. Splitting an irregular boundary into rectangles makes familiar formulas available.`, `EN: Worked example. Split into non-overlapping rectangles. Their areas are ${a} \xD7 ${b} = ${a * b} and ${c} \xD7 ${d} = ${c * d}. Add: ${a * b} + ${c * d} = ${area} square units.`, `EN: Check and avoid mistakes. Count every part once. Overlapping pieces would need correction before their areas could simply be added.`],
        GEO.Lshape("")
      );
    },
    () => {
      const a = ri(40, 90);
      return fi(
        `\u770B\u5716,\u4E00\u76F4\u7DDA\u4E0A\u7684\u4E00\u500B\u89D2\u662F ${a}\xB0,\u5B83\u65C1\u908A\u7684\u89D2(\u88DC\u89D2)\u662F\u5E7E\u5EA6?`,
        `On a straight line, one angle is ${a}\xB0. Find its supplement.`,
        180 - a,
        nearNums(180 - a, 15),
        [`\u{1F511} \u4E00\u76F4\u7DDA\u662F 180\xB0:\u76F4\u7DDA\u4E0A\u5169\u89D2\u4E92\u70BA\u300C\u88DC\u89D2\u300D,\u76F8\u52A0 = 180\xB0\u3002`, `\u2460 180 \u2212 ${a} = ${180 - a}\xB0\u3002`, `\u2714 \u9A57\u7B97:${a} + ${180 - a} = 180 \u2713`, `\u{1F4A1} \u5169\u500B\u76F4\u89D2(90\xB0+90\xB0)\u4E5F\u525B\u597D\u62C9\u6210\u4E00\u76F4\u7DDA\u3002`, `EN: Method. Adjacent angles that fill one straight line are supplementary. Removing the known angle leaves its supplement.`, `EN: Worked example. Adjacent angles on a straight line total 180\xB0. The missing angle is 180 \u2212 ${a} = ${180 - a}\xB0. Check: ${a} + ${180 - a} = 180\xB0.`, `EN: Check and avoid mistakes. The supplement and original angle must total a half turn. Do not use a right-angle total instead.`],
        SVG(`<line x1="10" y1="60" x2="110" y2="60" class="gline"/><line x1="60" y1="60" x2="88" y2="26" class="gline"/><path d="M78,60 A18,18 0 0,0 74,44" class="gang"/>` + gLabel(84, 50, a + "\xB0") + gLabel(40, 54, "?"))
      );
    },
    () => {
      const half = ri(3, 7);
      return fi(
        `\u770B\u5716:\u865B\u7DDA\u662F\u5C0D\u7A31\u8EF8\u3002\u5DE6\u908A\u6709\u4E00\u500B\u9EDE\u5728\u8DDD\u8EF8 ${half} \u683C\u7684\u5730\u65B9,\u53F3\u908A\u5C0D\u7A31\u7684\u9EDE\u8DDD\u8EF8\u5E7E\u683C?`,
        `The dashed line is the axis of symmetry. A point sits ${half} units left of it. How far right is its mirror?`,
        half,
        nearNums(half, 2),
        [`\u{1F511} \u5C0D\u7A31=\u93E1\u5B50:\u5169\u908A\u5230\u5C0D\u7A31\u8EF8\u7684\u8DDD\u96E2\u4E00\u5B9A\u76F8\u7B49\u3002`, `\u2460 \u5DE6\u908A ${half} \u683C \u2192 \u53F3\u908A\u4E5F\u662F ${half} \u683C\u3002`, `\u2714 \u5C0D\u7A31\u8EF8\u5C31\u50CF\u93E1\u9762,\u5DE6\u53F3\u662F\u5F7C\u6B64\u7684\u93E1\u50CF\u3002`, `EN: Method. A mirror reflection preserves perpendicular distance to the mirror line while changing the side of the line.`, `EN: Worked example. A reflection keeps the perpendicular distance to the axis. The left point is ${half} units away, so its mirror is ${half} units to the right.`, `EN: Check and avoid mistakes. Measure from the axis, not from the other point. The distance between the two points is twice either distance to the axis.`],
        SVG(`<line x1="60" y1="12" x2="60" y2="88" class="gdash"/><circle cx="${60 - half * 6}" cy="50" r="3.5" class="gdot"/><circle cx="${60 + half * 6}" cy="50" r="3" class="gline" fill="none"/>` + gLabel(60 - half * 6, 42, `${half}`) + gLabel(60 + half * 6, 42, "?"))
      );
    },
    () => {
      const r = ri(2, 6);
      const d = r * 2;
      return fi(
        `\u770B\u5716\u7684\u5713,\u534A\u5F91\u662F ${r} \u516C\u5206\u3002\u76F4\u5F91\u662F\u591A\u5C11\u516C\u5206?`,
        `This circle has radius ${r} cm. What is the diameter?`,
        d,
        nearNums(d, 3),
        [`\u{1F511} \u76F4\u5F91 = \u534A\u5F91 \xD7 2(\u76F4\u5F91\u7A7F\u904E\u5713\u5FC3,\u662F\u534A\u5F91\u7684\u5169\u500D)\u3002`, `\u2460 ${r} \xD7 2 = ${d} \u516C\u5206\u3002`, `\u2714 \u53CD\u904E\u4F86:\u534A\u5F91 = \u76F4\u5F91 \xF7 2 = ${r} \u2713`, `EN: Method. A diameter passes through the center from one side of a circle to the other. It contains two radii end to end.`, `EN: Worked example. A diameter consists of two radii: ${r} \xD7 2 = ${d} cm. Check: ${d} \xF7 2 = ${r} cm.`, `EN: Check and avoid mistakes. Doubling is appropriate because the given value is a radius. Halving the result should restore it.`],
        GEO.circle(r, `r=${r}`)
      );
    },
    () => {
      const t = pick([[5, "\u4E94"], [6, "\u516D"], [8, "\u516B"]]);
      const s = ri(3, 9);
      const pts = Array.from({ length: t[0] }, (_, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / t[0];
        return `${(60 + 32 * Math.cos(a)).toFixed(1)},${(50 + 32 * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      return fi(
        `\u770B\u5716:\u6B63${t[1]}\u908A\u5F62\u6BCF\u908A ${s} \u516C\u5206\u3002\u5468\u9577\u662F\u591A\u5C11\u516C\u5206?`,
        `A regular ${t[0]}-gon with side ${s} cm. Find the perimeter.`,
        t[0] * s,
        nearNums(t[0] * s, 6),
        [`\u{1F511} \u300C\u6B63\u300D\u591A\u908A\u5F62=\u6BCF\u908A\u7B49\u9577:\u5468\u9577 = \u908A\u9577 \xD7 \u908A\u6578\u3002`, `\u2460 ${s} \xD7 ${t[0]} = ${t[0] * s} \u516C\u5206\u3002`, `\u2714 \u548C\u6B63\u65B9\u5F62\u540C\u4E00\u689D\u898F\u5247,\u53EA\u662F\u908A\u6578\u4E0D\u540C\u2014\u2014\u898F\u5247\u6703\u9077\u79FB!`, `EN: Method. Every side of a regular polygon has the same length. Multiplication replaces adding that length once for every side.`, `EN: Worked example. This regular polygon has ${t[0]} equal sides of ${s} cm. Perimeter = ${s} \xD7 ${t[0]} = ${t[0] * s} cm.`, `EN: Check and avoid mistakes. Use the number of sides shown, not the square\u2019s familiar count of four. The result is a perimeter.`],
        SVG(`<polygon points="${pts}" class="gshape"/>` + gLabel(60, 14, s + " cm"))
      );
    },
    () => {
      const W = ri(8, 12), H = ri(6, 10), w = ri(3, W - 3), h = ri(2, H - 3);
      return fi(
        `\u770B\u5716\u7684\u76F8\u6846:\u5916\u6846 ${W}\xD7${H},\u4E2D\u9593\u6316\u6389 ${w}\xD7${h} \u7684\u6D1E\u3002\u6846\u7684\u9762\u7A4D(\u7070\u8272\u90E8\u5206)\u662F\u591A\u5C11?`,
        `A frame: outer ${W}\xD7${H} minus an inner ${w}\xD7${h} hole. Find the frame area.`,
        W * H - w * h,
        nearNums(W * H - w * h, 10),
        [`\u{1F511} \u6316\u6D1E\u554F\u984C:\u5927\u9762\u7A4D \u2212 \u5C0F\u9762\u7A4D = \u5269\u4E0B\u7684\u3002`, `\u2460 \u5916\u6846:${W} \xD7 ${H} = ${W * H}\u3002`, `\u2461 \u6D1E:${w} \xD7 ${h} = ${w * h}\u3002`, `\u2462 \u76F8\u6E1B:${W * H} \u2212 ${w * h} = ${W * H - w * h}\u3002`, `\u{1F4A1} \u300C\u88DC\u300D\u8207\u300C\u6316\u300D\u662F\u8907\u5408\u5716\u5F62\u7684\u5169\u628A\u5200:\u52A0\u6CD5\u62FC\u3001\u6E1B\u6CD5\u6316\u3002`, `EN: Method. The frame occupies the outer rectangle except for the hole. Find the two areas independently before subtracting.`, `EN: Worked example. Outer area: ${W} \xD7 ${H} = ${W * H}. Hole area: ${w} \xD7 ${h} = ${w * h}. Subtract: ${W * H} \u2212 ${w * h} = ${W * H - w * h} square units.`, `EN: Check and avoid mistakes. Subtract areas, not side lengths. Adding the hole area back should restore the outer rectangle.`],
        SVG(`<rect x="14" y="20" width="96" height="64" class="gshape"/><rect x="38" y="38" width="46" height="30" style="fill:var(--paper);stroke:var(--cobalt);stroke-width:2"/>` + gLabel(62, 16, `${W}\xD7${H}`) + gLabel(62, 55, `${w}\xD7${h}`))
      );
    }
  ],
  5: [
    () => {
      const pairs = [[2, 4], [3, 6], [2, 6], [4, 8], [3, 9], [2, 8]];
      const [d1, d2] = pick(pairs);
      const n2 = ri(1, d2 - 1);
      const L = d2;
      const s = `${L / d1 + n2}/${L}`;
      return fi(
        `1/${d1} + ${n2}/${d2} = ?`,
        `1/${d1} plus ${n2}/${d2}?`,
        s,
        [`${1 + n2}/${d1 + d2}`, `${n2}/${L}`, `${L / d1 + n2 + 1}/${L}`],
        [`\u{1F511} \u5207\u6CD5\u4E0D\u540C\u4E0D\u80FD\u76F4\u63A5\u52A0 \u2192 \u5148\u300C\u901A\u5206\u300D\u7D71\u4E00\u5207\u6CD5\u3002`, `\u2460 1/${d1} \u6BCF\u4EFD\u5207\u6210 ${L / d1} \u5C0F\u4EFD:1/${d1} = ${L / d1}/${L}(\u5927\u5C0F\u6C92\u8B8A,\u53EA\u662F\u5207\u66F4\u7D30)\u3002`, `\u2461 \u73FE\u5728\u5207\u6CD5\u76F8\u540C\u4E86:${L / d1}/${L} + ${n2}/${L} = ${s}\u3002`, `\u26A0 \u9677\u9631:\u5206\u6BCD\u76F4\u63A5\u76F8\u52A0(${d1}+${d2})\u662F\u6700\u5E38\u898B\u7684\u932F!`, `EN: Method. Unlike denominators describe differently sized pieces. Rewrite the first fraction using the second denominator before combining counts.`, `EN: Worked example. Use denominator ${L}: 1/${d1} = ${L / d1}/${L}. Add equal-sized parts: ${L / d1}/${L} + ${n2}/${L} = ${s}. Do not add the denominators.`, `EN: Check and avoid mistakes. An equivalent fraction multiplies numerator and denominator by the same factor. Never add unlike denominators directly.`]
      );
    },
    () => {
      const a = ri(2, 9), b = ri(11, 99) / 10;
      const p = Math.round(a * b * 10) / 10;
      return fi(
        `${a} \xD7 ${b} = ?`,
        `${a} times ${b}?`,
        p,
        [Math.round((p + a) * 10) / 10, Math.round((p - a / 2) * 10) / 10, Math.round(p * 10 + 1) / 10],
        [`\u{1F511} \u5148\u5FFD\u7565\u5C0F\u6578\u9EDE\u7576\u6574\u6578\u4E58,\u6700\u5F8C\u518D\u628A\u9EDE\u653E\u56DE\u53BB\u3002`, `\u2460 \u7576\u6574\u6578:${a} \xD7 ${Math.round(b * 10)} = ${Math.round(a * b * 10)}\u3002`, `\u2461 ${b} \u6709\u4E00\u4F4D\u5C0F\u6578 \u2192 \u7B54\u6848\u9EDE\u56DE\u4E00\u4F4D:${p}\u3002`, `\u2714 \u4F30\u7B97:${a} \xD7 ${Math.round(b)} = ${a * Math.round(b)},\u548C ${p} \u63A5\u8FD1 \u2713`, `EN: Method. Express the decimal factor as a whole number of tenths. Multiply that count, then convert tenths back to the original units.`, `EN: Worked example. Convert ${b} to ${Math.round(b * 10)} tenths. Multiply: ${a} \xD7 ${Math.round(b * 10)} = ${Math.round(a * b * 10)} tenths. Divide by 10 to get ${p}.`, `EN: Check and avoid mistakes. Ignoring the decimal point temporarily makes the value ten times larger. Undo that scaling after multiplication.`]
      );
    },
    () => {
      const l = ri(2, 8), w = ri(2, 8), h = ri(2, 8);
      return fi(
        `\u9577 ${l}\u3001\u5BEC ${w}\u3001\u9AD8 ${h} \u516C\u5206\u7684\u9577\u65B9\u9AD4,\u9AD4\u7A4D\u662F\u591A\u5C11\u7ACB\u65B9\u516C\u5206?`,
        `Volume of a ${l} by ${w} by ${h} box?`,
        l * w * h,
        nearNums(l * w * h, 20),
        [`\u{1F511} \u9AD4\u7A4D = \u4E00\u5C64\u7684\u65B9\u584A\u6578 \xD7 \u758A\u5E7E\u5C64\u3002`, `\u2460 \u5E95\u5C64:${l} \xD7 ${w} = ${l * w} \u584A\u3002`, `\u2461 \u758A ${h} \u5C64:${l * w} \xD7 ${h} = ${l * w * h} \u7ACB\u65B9\u516C\u5206\u3002`, `\u2714 \u63DB\u500B\u65B9\u5411\u758A(${w}\xD7${h} \u70BA\u5E95)\u7B54\u6848\u4E00\u6A23 \u2713`, `EN: Method. Volume counts unit cubes filling a solid. Base area counts cubes in one layer, and height counts the layers.`, `EN: Worked example. Each layer has ${l} \xD7 ${w} = ${l * w} cubes. Stack ${h} layers: ${l * w} \xD7 ${h} = ${l * w * h} cubic centimeters.`, `EN: Check and avoid mistakes. Three lengths are multiplied, so the unit is cubic. Surface area instead counts the outside faces.`]
      );
    },
    () => {
      const N = pick([12, 18, 24, 30, 36]);
      const fs = [];
      for (let i = 2; i < N; i++) if (N % i === 0) fs.push(i);
      const ans = pick(fs);
      const non = [];
      let x = 2;
      while (non.length < 3) {
        if (N % x !== 0 && x !== ans) non.push(x);
        x++;
      }
      return mc(
        `\u54EA\u4E00\u500B\u662F ${N} \u7684\u56E0\u6578?`,
        `Which one is a factor of ${N}?`,
        ans,
        non,
        [`\u{1F511} \u56E0\u6578 = \u80FD\u6574\u9664\u3001\u96F6\u9918\u6578\u7684\u6578\u3002`, `\u2460 \u6E2C\u8A66:${N} \xF7 ${ans} = ${N / ans},\u6574\u9664 \u2713`, `\u2461 \u5176\u4ED6\u9078\u9805\u9664 ${N} \u90FD\u6703\u7559\u4E0B\u9918\u6578\u3002`, `\u{1F4A1} \u5C0F\u6280\u5DE7:\u56E0\u6578\u6210\u96D9\u51FA\u73FE\u2014\u2014${ans} \xD7 ${N / ans} = ${N},\u627E\u5230\u4E00\u500B\u5C31\u9001\u4E00\u500B\u3002`, `EN: Method. A factor divides a number into whole groups with nothing left over. Test the listed candidates using division.`, `EN: Worked example. ${N} \xF7 ${ans} = ${N / ans} with no remainder, so ${ans} is a factor. Check: ${ans} \xD7 ${N / ans} = ${N}. The other listed choices leave remainders.`, `EN: Check and avoid mistakes. Other factors may exist, but this question asks which listed option works. Multiplying the factor by its quotient verifies it.`]
      );
    },
    () => {
      const t = pick([[4, 6, 12], [6, 8, 24], [3, 5, 15], [4, 10, 20], [6, 9, 18]]);
      return fi(
        `${t[0]} \u548C ${t[1]} \u7684\u6700\u5C0F\u516C\u500D\u6578\u662F?`,
        `Least common multiple of ${t[0]} and ${t[1]}?`,
        t[2],
        [t[0] * t[1], t[2] * 2, t[2] + t[0]],
        [`\u{1F511} \u6700\u5C0F\u516C\u500D\u6578 = \u5169\u6392\u500D\u6578\u7B2C\u4E00\u6B21\u300C\u76F8\u9047\u300D\u7684\u5730\u65B9\u3002`, `\u2460 ${t[0]} \u7684\u500D\u6578:${t[0]}, ${t[0] * 2}, ${t[0] * 3}, \u2026`, `\u2461 ${t[1]} \u7684\u500D\u6578:${t[1]}, ${t[1] * 2}, \u2026`, `\u2462 \u7B2C\u4E00\u500B\u5171\u540C\u51FA\u73FE\u7684:${t[2]}\u3002`, `\u26A0 \u9677\u9631:\u4E0D\u4E00\u5B9A\u662F\u76F8\u4E58!${t[0]}\xD7${t[1]}=${t[0] * t[1]},${t[0] * t[1] === t[2] ? "\u9019\u7D44\u525B\u597D\u7B49\u65BC\u6700\u5C0F\u516C\u500D\u6578" : "\u9019\u7D44\u6BD4\u6700\u5C0F\u516C\u500D\u6578 " + t[2] + " \u5927"}\u3002`, `EN: Method. Common multiples belong to both multiplication lists. The least common multiple is their earliest positive match.`, `EN: Worked example. Multiples of ${t[0]} up to ${t[2]}: ${Array.from({ length: t[2] / t[0] }, (_, i) => (i + 1) * t[0]).join(", ")}. Multiples of ${t[1]}: ${Array.from({ length: t[2] / t[1] }, (_, i) => (i + 1) * t[1]).join(", ")}. Their first common value is ${t[2]}.`, `EN: Check and avoid mistakes. The product is a common multiple but may not be the least. Compare the earlier entries in both lists.`]
      );
    },
    () => {
      const d = pick([3, 4, 5, 6, 8]);
      const n = ri(1, d - 1);
      const k = d * ri(1, 3);
      return fi(
        `${n}/${d} \xD7 ${k} = ?`,
        `${n}/${d} times ${k}?`,
        n * k / d,
        nearNums(n * k / d, 4),
        [`\u{1F511} \u5206\u6578\u4E58\u6574\u6578 = ${k} \u500B ${n}/${d} \u758A\u8D77\u4F86\u3002`, `\u2460 \u5206\u5B50\u5148\u4E58:${n} \xD7 ${k} = ${n * k}\u3002`, `\u2461 ${n * k} \xF7 ${d} = ${n * k / d}(\u525B\u597D\u6574\u9664)\u3002`, `\u2714 \u53CD\u63A8:${n * k / d} \xD7 ${d} \xF7 ${k} = ${n} \u2713`, `EN: Method. Multiplying a fraction by a whole number repeats that fraction. The numerator count grows while the piece size stays fixed.`, `EN: Worked example. Multiply the numerator: ${n} \xD7 ${k} = ${n * k}. Divide by the denominator: ${n * k} \xF7 ${d} = ${n * k / d}. Check: ${n * k / d} \xD7 ${d} = ${n * k}.`, `EN: Check and avoid mistakes. Divide the multiplied numerator by the original denominator. Reducing first can make the same calculation easier.`]
      );
    },
    () => {
      const c = ri(2, 5);
      return fi(
        `\u{1F3C6} \u62BD\u5C5C\u88E1\u6DF7\u8457 ${c} \u7A2E\u984F\u8272\u7684\u896A\u5B50\u3002\u9589\u8457\u773C\u6700\u5C11\u62FF\u5E7E\u96BB,\u624D\u300C\u4FDD\u8B49\u300D\u6E4A\u51FA\u4E00\u96D9\u540C\u8272?`,
        `A drawer holds socks in ${c} colors. Fewest picks to GUARANTEE a matching pair?`,
        c + 1,
        [c, c * 2 + 1, c + 3],
        [`\u{1F511} \u9D3F\u7C60\u539F\u7406:\u300C\u4FDD\u8B49\u300D\u578B\u984C\u76EE\u8981\u60F3\u300C\u6700\u58DE\u60C5\u6CC1\u300D\u3002`, `\u2460 \u6700\u5012\u6963\u7684\u60C5\u6CC1:\u524D ${c} \u96BB\u525B\u597D\u6BCF\u8272\u5404\u4E00\u96BB,\u9084\u6E4A\u4E0D\u6210\u96D9\u3002`, `\u2461 \u7B2C ${c + 1} \u96BB\u7121\u8AD6\u4EC0\u9EBC\u984F\u8272,\u4E00\u5B9A\u548C\u624B\u4E0A\u67D0\u96BB\u540C\u8272!`, `\u{1F4A1} \u5FC3\u6CD5:\u4FDD\u8B49 = \u6700\u58DE\u60C5\u6CC1 + 1\u3002\u9019\u662F\u6B63\u5F0F\u7684\u7D44\u5408\u6578\u5B78\u3002`, `EN: Method. A guarantee must survive the least favorable arrangement. First imagine drawing one sock of each available color.`, `EN: Worked example. In the worst case the first ${c} socks all have different colors. Sock number ${c + 1} must match an existing color. Therefore ${c} + 1 = ${c + 1} picks guarantee a pair.`, `EN: Check and avoid mistakes. That many draws can still have no pair. One further draw must repeat a color because no new color is available.`]
      );
    },
    () => {
      const b = ri(70, 85), a = b + ri(-5, 5);
      const third = 3 * a - 2 * b;
      return fi(
        `\u{1F3C6} \u5C0F\u5947\u4E09\u6B21\u6E2C\u9A57\u5E73\u5747 ${a} \u5206,\u524D\u5169\u6B21\u5E73\u5747 ${b} \u5206\u3002\u7B2C\u4E09\u6B21\u8003\u4E86\u5E7E\u5206?`,
        `Three tests average ${a}; the first two average ${b}. The third score?`,
        third,
        nearNums(third, 5),
        [`\u{1F511} \u5E73\u5747\u662F\u7E3D\u548C\u7684\u507D\u88DD\u2014\u2014\u5148\u628A\u5B83\u8B8A\u56DE\u7E3D\u548C\u3002`, `\u2460 \u4E09\u6B21\u7E3D\u5206:${a} \xD7 3 = ${3 * a}\u3002`, `\u2461 \u524D\u5169\u6B21\u7E3D\u5206:${b} \xD7 2 = ${2 * b}\u3002`, `\u2462 \u7B2C\u4E09\u6B21:${3 * a} \u2212 ${2 * b} = ${third}\u3002`, `\u2714 \u9A57\u7B97:(${2 * b} + ${third}) \xF7 3 = ${a} \u2713`, `EN: Method. An average hides a total: multiply it by the number of tests to recover the total score.`, `EN: Worked example. Total for three tests: ${a} \xD7 3 = ${3 * a}. Total for the first two: ${b} \xD7 2 = ${2 * b}. Third score: ${3 * a} \u2212 ${2 * b} = ${third}. Check: (${2 * b} + ${third}) \xF7 3 = ${a}.`, `EN: Check and avoid mistakes. Use three tests for the overall average and two for the earlier average. Subtract totals, not averages.`]
      );
    },
    () => {
      const t = pick([[12, 18, 6], [8, 12, 4], [15, 20, 5], [18, 24, 6], [16, 24, 8], [9, 12, 3]]);
      return fi(
        `${t[0]} \u548C ${t[1]} \u7684\u6700\u5927\u516C\u56E0\u6578\u662F?`,
        `Greatest common factor of ${t[0]} and ${t[1]}?`,
        t[2],
        [t[2] * 2, Math.max(1, t[2] - 1), t[2] + 2],
        [`\u{1F511} \u6700\u5927\u516C\u56E0\u6578=\u5169\u500B\u6578\u300C\u90FD\u80FD\u88AB\u6574\u9664\u300D\u7684\u6700\u5927\u6578\u3002`, `\u2460 ${t[0]} \u7684\u56E0\u6578\u88E1\u627E\u3001${t[1]} \u7684\u56E0\u6578\u88E1\u627E,\u5171\u540C\u7684\u53D6\u6700\u5927\u3002`, `\u2461 ${t[0]}\xF7${t[2]}=${t[0] / t[2]}\u3001${t[1]}\xF7${t[2]}=${t[1] / t[2]},\u90FD\u6574\u9664 \u2713`, `\u{1F4A1} \u5B83\u662F\u7D04\u5206\u7684\u9470\u5319:${t[0]}/${t[1]} \u7528 ${t[2]} \u7D04\u5206 = ${t[0] / t[2]}/${t[1] / t[2]}\u3002`, `EN: Method. A common factor divides both numbers exactly. The greatest one is the largest member of their shared factor list.`, `EN: Worked example. Common factors are ${Array.from({ length: Math.min(t[0], t[1]) }, (_, i) => i + 1).filter((v) => t[0] % v === 0 && t[1] % v === 0).join(", ")}. The greatest is ${t[2]}. Check: ${t[0]} \xF7 ${t[2]} = ${t[0] / t[2]} and ${t[1]} \xF7 ${t[2]} = ${t[1] / t[2]}, both whole numbers.`, `EN: Check and avoid mistakes. Being a factor of only one number is insufficient. Confirm exact division for both and that no larger shared factor remains.`]
      );
    },
    () => {
      const c = ri(2, 5);
      const ans = ri(11, 49) / 10;
      const a = Math.round(ans * c * 10) / 10;
      return fi(
        `${a} \xF7 ${c} = ?`,
        `${a} divided by ${c}?`,
        ans,
        [Math.round((ans + 0.5) * 10) / 10, Math.round((ans - 0.3) * 10) / 10, Math.round(ans * c * 10) / 10],
        [`\u{1F511} \u5C0F\u6578\u9664\u4EE5\u6574\u6578:\u7167\u6574\u6578\u9664,\u5C0F\u6578\u9EDE\u76F4\u76F4\u843D\u4E0B\u4F86\u3002`, `\u2460 ${Math.round(a * 10)} \xF7 ${c} = ${Math.round(ans * 10)}(\u5148\u7576\u6574\u6578)\u3002`, `\u2461 \u5C0F\u6578\u9EDE\u653E\u56DE:${ans}\u3002`, `\u2714 \u9A57\u7B97:${ans} \xD7 ${c} = ${a} \u2713`, `EN: Method. Convert the dividend to a whole number of tenths, divide that count, then express the answer in original units.`, `EN: Worked example. Convert ${a} to ${Math.round(a * 10)} tenths. Divide: ${Math.round(a * 10)} \xF7 ${c} = ${Math.round(ans * 10)} tenths, or ${ans}. Check: ${ans} \xD7 ${c} = ${a}.`, `EN: Check and avoid mistakes. The divisor is a whole number here. Multiplying the decimal quotient by it must recover the dividend.`]
      );
    },
    () => {
      const l = ri(3, 7), w = ri(3, 7), h = ri(3, 7);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u9AD4,\u9577 ${l}\u3001\u5BEC ${w}\u3001\u9AD8 ${h}\u3002\u9AD4\u7A4D\u662F\u591A\u5C11\u7ACB\u65B9\u516C\u5206?`,
        `This box is ${l}\xD7${w}\xD7${h}. Find the volume.`,
        l * w * h,
        nearNums(l * w * h, 25),
        [`\u{1F511} \u9AD4\u7A4D = \u9577 \xD7 \u5BEC \xD7 \u9AD8(\u5148\u7B97\u4E00\u5C64,\u518D\u758A\u9AD8)\u3002`, `\u2460 \u5E95\u9762:${l} \xD7 ${w} = ${l * w}\u3002`, `\u2461 \u758A ${h} \u5C64:${l * w} \xD7 ${h} = ${l * w * h} \u7ACB\u65B9\u516C\u5206\u3002`, `\u2714 \u7ACB\u65B9=\u4E09\u500B\u9577\u5EA6\u76F8\u4E58,\u55AE\u4F4D\u662F\u300C\u7ACB\u65B9\u516C\u5206\u300D\u3002`, `EN: Method. The box contains equal layers. Multiply the two base dimensions for one layer, then multiply by the number of layers.`, `EN: Worked example. Base area: ${l} \xD7 ${w} = ${l * w}. Multiply by height: ${l * w} \xD7 ${h} = ${l * w * h} cubic centimeters.`, `EN: Check and avoid mistakes. Use all three dimensions once. Counting the six faces would measure surface area instead of volume.`],
        SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>` + gLabel(40, 92, `${l}`) + gLabel(74, 74, `${w}`) + gLabel(14, 64, `${h}`), "0 0 100 100")
      );
    },
    () => {
      const d = ri(4, 14);
      const c = Math.round(314 * d) / 100;
      return fi(
        `\u770B\u5716\u7684\u5713,\u76F4\u5F91 ${d} \u516C\u5206\u3002\u5713\u5468\u9577\u662F\u591A\u5C11?(\u5713\u5468\u7387 3.14)`,
        `This circle has diameter ${d} cm. Find the circumference. (\u03C0=3.14)`,
        c,
        [Math.round(314 * d / 2) / 100, Math.round(314 * (d + 2)) / 100, Math.round(157 * d) / 100],
        [`\u{1F511} \u5713\u5468\u9577 = \u5713\u5468\u7387 \xD7 \u76F4\u5F91(\u7E5E\u4E00\u5708\u662F\u76F4\u5F91\u7684 3.14 \u500D)\u3002`, `\u2460 3.14 \xD7 ${d} = ${c} \u516C\u5206\u3002`, `\u2714 \u7C97\u4F30:\u6BD4\u76F4\u5F91\u7684 3 \u500D(${3 * d})\u591A\u4E00\u4E9B \u2713`, `EN: Method. Pi is the ratio of circumference to diameter. Multiplying the labeled diameter by the specified pi approximation gives the boundary length.`, `EN: Worked example. Multiply pi by the diameter: 3.14 \xD7 ${d} = ${c} cm. This is slightly more than 3 \xD7 ${d} = ${3 * d} cm.`, `EN: Check and avoid mistakes. Do not double a diameter again as if it were a radius. The result uses length units.`],
        GEO.circle(d, `d=${d}`)
      );
    },
    () => {
      const deg = pick([90, 120, 180, 270]);
      const frac = { 90: "1/4", 120: "1/3", 180: "1/2", 270: "3/4" }[deg];
      return fi(
        `\u770B\u5716\u7684\u6247\u5F62\u662F\u5713\u7684 ${deg}\xB0\u3002\u5B83\u4F54\u6574\u500B\u5713\u7684\u5E7E\u5206\u4E4B\u5E7E?(\u7528\u5206\u6578,\u5982 1/4)`,
        `This sector is ${deg}\xB0 of a circle. What fraction of the whole circle is it?`,
        frac,
        ["1/2", "1/3", "1/4", "3/4"].filter((f) => f !== frac).slice(0, 3),
        [`\u{1F511} \u6574\u500B\u5713\u662F 360\xB0\u3002\u6247\u5F62\u4F54\u6BD4 = \u6247\u5F62\u89D2\u5EA6 \xF7 360\u3002`, `\u2460 ${deg} \xF7 360 = ${frac}\u3002`, `\u2714 \u9A57\u7B97:${frac} \xD7 360 = ${deg}\xB0 \u2713`, `\u{1F4A1} \u9019\u662F\u300C\u62AB\u85A9\u5207\u5E7E\u7247\u300D\u7684\u6578\u5B78\u3002`, `EN: Method. A sector\u2019s share of the circle equals its share of a complete turn. Divide its angle by the full-circle angle.`, `EN: Worked example. The sector covers ${deg} of the full 360 degrees: ${deg}/360 = ${frac}. Check: ${frac} \xD7 360 = ${deg}\xB0.`, `EN: Check and avoid mistakes. Simplifying changes the notation, not the fraction\u2019s value. Multiplying the fraction by a full turn must restore the sector angle.`],
        GEO.sector(deg, 34, `${deg}\xB0`)
      );
    },
    () => {
      const l = ri(2, 5), w = ri(2, 5), h = ri(2, 5);
      const faces = 2 * (l * w + l * h + w * h);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u9AD4,\u9577 ${l}\u3001\u5BEC ${w}\u3001\u9AD8 ${h}\u3002\u8868\u9762\u7A4D(\u516D\u500B\u9762\u52A0\u8D77\u4F86)\u662F\u591A\u5C11?`,
        `This box is ${l}\xD7${w}\xD7${h}. Find the total surface area of all 6 faces.`,
        faces,
        nearNums(faces, 15),
        [`\u{1F511} \u8868\u9762\u7A4D=\u516D\u500B\u9762,\u4F46\u53EA\u8981\u7B97\u4E09\u7A2E\u9762\u5404\u4E00\u500B,\u518D\xD72\u3002`, `\u2460 \u4E09\u7A2E\u9762:${l}\xD7${w}=${l * w}\u3001${l}\xD7${h}=${l * h}\u3001${w}\xD7${h}=${w * h}\u3002`, `\u2461 \u76F8\u52A0\u518D\xD72:(${l * w}+${l * h}+${w * h})\xD72 = ${faces}\u3002`, `\u{1F4A1} \u6BCF\u7A2E\u9762\u90FD\u6709\u300C\u524D\u5F8C/\u5DE6\u53F3/\u4E0A\u4E0B\u300D\u5169\u500B\u4E00\u6A23\u7684,\u6240\u4EE5\xD72\u3002`, `EN: Method. The six faces form three equal opposite pairs. Find one area from each pair, then double their sum.`, `EN: Worked example. The three face areas are ${l} \xD7 ${w} = ${l * w}, ${l} \xD7 ${h} = ${l * h}, and ${w} \xD7 ${h} = ${w * h}. Each has a matching opposite face: 2 \xD7 (${l * w} + ${l * h} + ${w * h}) = ${faces} square centimeters.`, `EN: Check and avoid mistakes. Include all three different dimension products. Multiplying all dimensions together gives volume, not surface area.`],
        SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>` + gLabel(40, 92, `${l}`) + gLabel(74, 74, `${w}`) + gLabel(14, 64, `${h}`), "0 0 100 100")
      );
    },
    () => {
      const l = ri(2, 6), w = ri(2, 6), h = ri(2, 6);
      const sa = 2 * (l * w + l * h + w * h);
      return fi(
        `\u770B\u5716\u7684\u9577\u65B9\u9AD4:\u9577 ${l}\u3001\u5BEC ${w}\u3001\u9AD8 ${h} \u516C\u5206\u3002\u516D\u500B\u9762\u7684\u8868\u9762\u7A4D\u7E3D\u5171\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?`,
        `Box ${l}\xD7${w}\xD7${h}: find the total surface area of all six faces.`,
        sa,
        nearNums(sa, 15),
        [`\u{1F511} \u8868\u9762\u7A4D:\u4E09\u7A2E\u9762\u5404\u6709\u4E00\u5C0D \u2192 2\xD7(\u9577\xD7\u5BEC + \u9577\xD7\u9AD8 + \u5BEC\xD7\u9AD8)\u3002`, `\u2460 \u4E0A\u4E0B:${l}\xD7${w}=${l * w};\u524D\u5F8C:${l}\xD7${h}=${l * h};\u5DE6\u53F3:${w}\xD7${h}=${w * h}\u3002`, `\u2461 \u76F8\u52A0:${l * w}+${l * h}+${w * h}=${l * w + l * h + w * h}\u3002`, `\u2462 \u6210\u5C0D \xD72:${sa} \u5E73\u65B9\u516C\u5206\u3002`, `\u26A0 \u5225\u548C\u9AD4\u7A4D(${l * w * h})\u641E\u6DF7:\u8868\u9762\u7A4D\u662F\u300C\u5305\u8D77\u4F86\u8981\u591A\u5C11\u7D19\u300D\u3002`, `EN: Method. Opposite faces match, so compute top, front, and side areas first. Doubling their combined area includes all six faces.`, `EN: Worked example. Top/bottom each have area ${l * w}, front/back ${l * h}, and left/right ${w * h}. Sum one of each: ${l * w} + ${l * h} + ${w * h} = ${l * w + l * h + w * h}. Double: 2 \xD7 ${l * w + l * h + w * h} = ${sa} square centimeters.`, `EN: Check and avoid mistakes. Track each face pair once. Surface area measures covering material and must use square units.`],
        SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>` + gLabel(44, 92, l) + gLabel(76, 74, w) + gLabel(14, 64, h), "0 0 100 100")
      );
    },
    () => {
      const b = ri(4, 12), h = ri(2, 8) * 2;
      const A = b * h / 2;
      return fi(
        `\u770B\u5716\u7684\u4E09\u89D2\u5F62:\u9762\u7A4D ${A} \u5E73\u65B9\u516C\u5206,\u5E95 ${b} \u516C\u5206\u3002\u9AD8\u662F\u591A\u5C11\u516C\u5206?`,
        `Triangle area ${A} sq cm with base ${b} cm. Find the height.`,
        h,
        nearNums(h, 4),
        [`\u{1F511} \u9762\u7A4D = \u5E95 \xD7 \u9AD8 \xF7 2 \u2192 \u9AD8 = \u9762\u7A4D \xD7 2 \xF7 \u5E95(\u9006\u904B\u7B97\u5169\u6B65)\u3002`, `\u2460 ${A} \xD7 2 = ${A * 2}\u3002`, `\u2461 ${A * 2} \xF7 ${b} = ${h} \u516C\u5206\u3002`, `\u2714 \u9A57\u7B97:${b} \xD7 ${h} \xF7 2 = ${A} \u2713`, `EN: Method. The triangle formula multiplies base by height and then halves it. Reverse those actions in the opposite order.`, `EN: Worked example. Undo the triangle area formula. Double the area: ${A} \xD7 2 = ${A * 2}. Divide by base: ${A * 2} \xF7 ${b} = ${h} cm. Check: ${b} \xD7 ${h} \xF7 2 = ${A}.`, `EN: Check and avoid mistakes. Double the area before dividing by base. Substitute the height back into the original area formula.`],
        GEO.rtri(`${b} cm`, `?`).replace("</svg>", gLabel(62, 40, `\u9762\u7A4D ${A}`) + "</svg>")
      );
    }
  ],
  6: [
    () => {
      const k = ri(2, 6), a = ri(2, 9), b = ri(2, 9);
      return fi(
        `${a}:${b} = ${a * k}:?`,
        `${a}:${b} equals ${a * k}:what?`,
        b * k,
        nearNums(b * k, 6),
        [`\u{1F511} \u6BD4 = \u500D\u7387\u95DC\u4FC2,\u5169\u908A\u5FC5\u9808\u4E00\u8D77\u7E2E\u653E\u3002`, `\u2460 \u5DE6\u908A:${a} \u2192 ${a * k},\u653E\u5927\u4E86 ${k} \u500D\u3002`, `\u2461 \u53F3\u908A\u540C\u6A23 \xD7${k}:${b} \xD7 ${k} = ${b * k}\u3002`, `\u2714 \u9A57\u7B97:${a * k}:${b * k} \u540C\u9664 ${k} \u56DE\u5230 ${a}:${b} \u2713`, `EN: Method. Equivalent ratios preserve the relationship between their terms. The multiplier on the first term must also apply to the second.`, `EN: Worked example. The first term scales by ${a * k} \xF7 ${a} = ${k}. Scale the second by the same factor: ${b} \xD7 ${k} = ${b * k}. Dividing both ${a * k} and ${b * k} by ${k} restores ${a}:${b}.`, `EN: Check and avoid mistakes. Adding the same amount to both terms does not generally preserve a ratio. Divide both new terms by the scale factor to check.`]
      );
    },
    () => {
      const v = ri(4, 20) * 5, t = ri(2, 6);
      return fi(
        `\u4E00\u53F0\u8ECA\u6BCF\u5C0F\u6642\u8D70 ${v} \u516C\u91CC,${t} \u5C0F\u6642\u8D70\u591A\u9060?`,
        `A car travels ${v} km per hour for ${t} hours. How far?`,
        v * t,
        nearNums(v * t, 25),
        [`\u{1F511} \u901F\u7387 = \u300C\u6BCF 1 \u5C0F\u6642\u300D\u7684\u8DDD\u96E2,\u662F\u4E00\u7A2E\u55AE\u4F4D\u5316\u601D\u8003\u3002`, `\u2460 \u6BCF\u5C0F\u6642 ${v} \u516C\u91CC \xD7 ${t} \u5C0F\u6642 = ${v * t} \u516C\u91CC\u3002`, `\u2714 \u53CD\u63A8:${v * t} \xF7 ${t} = ${v} \u516C\u91CC/\u5C0F\u6642,\u56DE\u5230\u901F\u7387 \u2713`, `EN: Method. Speed gives distance for one hour. Repeating that distance for the given number of hours produces the full journey.`, `EN: Worked example. Distance = speed \xD7 time: ${v} \xD7 ${t} = ${v * t} km. Check: ${v * t} \xF7 ${t} = ${v} km/h.`, `EN: Check and avoid mistakes. The hour units cancel when speed is multiplied by hours. Dividing distance by time should restore the speed.`]
      );
    },
    () => {
      const d = pick([2, 4, 5, 10]);
      const n = ri(1, d - 1);
      const dec = n / d;
      return fi(
        `${n}/${d} \u7B49\u65BC\u54EA\u500B\u5C0F\u6578?`,
        `${n}/${d} as a decimal?`,
        dec,
        [Math.round((dec + 0.1) * 100) / 100, Math.round(dec / 2 * 100) / 100, Math.round((dec + 0.25) * 100) / 100],
        [`\u{1F511} \u5206\u6578\u7DDA\u5176\u5BE6\u5C31\u662F\u300C\xF7\u300D:${n}/${d} = ${n} \xF7 ${d}\u3002`, `\u2460 ${n} \xF7 ${d} = ${dec}\u3002`, `\u{1F4A1} \u5E38\u7528\u8F49\u63DB\u503C\u5F97\u8A18\u4F4F:1/2=0.5\u30011/4=0.25\u30011/5=0.2\u30011/10=0.1\u2014\u2014\u5B83\u5011\u662F\u540C\u4E00\u500B\u6578\u7684\u5169\u5957\u8863\u670D\u3002`, `EN: Method. A fraction represents numerator divided by denominator. The decimal is another way of naming the same amount.`, `EN: Worked example. The fraction bar means division: ${n} \xF7 ${d} = ${dec}. Check: ${dec} \xD7 ${d} = ${n}.`, `EN: Check and avoid mistakes. Multiply the decimal by the denominator to recover the numerator. Do not read the numerator and denominator as decimal digits.`]
      );
    },
    () => {
      const p = pick([10, 20, 25, 50]);
      const b = pick([40, 60, 80, 120, 200]);
      return fi(
        `${b} \u7684 ${p}% \u662F\u591A\u5C11?`,
        `What is ${p}% of ${b}?`,
        p * b / 100,
        nearNums(p * b / 100, 8),
        [`\u{1F511} % = \u300C\u6BCF 100 \u4EFD\u4E2D\u7684\u4EFD\u6578\u300D:${p}% = ${p}/100\u3002`, `\u2460 ${b} \xD7 ${p}/100 = ${p * b / 100}\u3002`, `\u{1F4A1} \u5FC3\u7B97\u6377\u5F91:\u5148\u7B97 10% = ${b / 10},\u518D\u7D44\u5408(${p}% = ${p / 10} \u500B 10%)\u3002`, `\u2714 \u6AA2\u67E5:${p * b / 100} \xF7 ${b} = ${p / 100},\u56DE\u5230 ${p}% \u2713`, `EN: Method. Percent means parts out of one hundred. Convert the percentage to a fraction of the given base amount before multiplying.`, `EN: Worked example. ${p}% means ${p}/100. Multiply: ${b} \xD7 ${p}/100 = ${p * b / 100}. Check: ${p * b / 100} \xF7 ${b} = ${p / 100}, or ${p}%.`, `EN: Check and avoid mistakes. The base is the amount after the word of. Check the answer as a fraction of that same base.`]
      );
    },
    () => {
      const d = ri(2, 10);
      const c = Math.round(314 * d) / 100;
      return fi(
        `\u76F4\u5F91 ${d} \u516C\u5206\u7684\u5713,\u5713\u5468\u9577\u662F\u591A\u5C11\u516C\u5206?(\u5713\u5468\u7387\u7528 3.14)`,
        `Circumference of a circle with diameter ${d} cm? (use 3.14)`,
        c,
        [Math.round(3.14 * (d + 1) * 100) / 100, Math.round(3.14 * d / 2 * 100) / 100, Math.round((3.14 * d + 3) * 100) / 100],
        [`\u{1F511} \u5713\u5468\u7387\u7684\u610F\u7FA9:\u7E5E\u4E00\u5708\u662F\u76F4\u5F91\u7684\u5E7E\u500D?\u7B54\u6848\u6C38\u9060\u7D04 3.14,\u4EFB\u4F55\u5713\u90FD\u4E00\u6A23!`, `\u2460 \u5713\u5468\u9577 = 3.14 \xD7 ${d} = ${c} \u516C\u5206\u3002`, `\u2714 \u7C97\u4F30:\u76F4\u5F91\u7684 3 \u500D\u591A\u4E00\u9EDE \u2192 \u6BD4 ${3 * d} \u5927\u4E00\u4E9B \u2713`, `\u{1F4A1} \u9019\u500B\u300C\u4EFB\u4F55\u5713\u90FD\u4E00\u6A23\u300D\u7684\u5E38\u6578,\u4EBA\u985E\u7814\u7A76\u4E86\u56DB\u5343\u5E74\u3002`, `EN: Method. Every circumference is pi times its diameter. Use the approximation specified in the question for a consistent numerical result.`, `EN: Worked example. Circumference = pi \xD7 diameter: 3.14 \xD7 ${d} = ${c} cm. Estimate: slightly more than 3 \xD7 ${d} = ${3 * d} cm.`, `EN: Check and avoid mistakes. Radius and diameter are different inputs. Since diameter is given, there is no extra factor of two.`]
      );
    },
    () => {
      const a = ri(2, 9), x = ri(2, 9), b = ri(1, 15);
      const c = a * x + b;
      return fi(
        `\u5982\u679C ${a} \xD7 x + ${b} = ${c},\u90A3 x = ?`,
        `If ${a}x + ${b} = ${c}, what is x?`,
        x,
        nearNums(x, 3),
        [`\u{1F511} \u89E3\u65B9\u7A0B = \u9006\u5411\u62C6\u5305\u88F9:\u6700\u5F8C\u5305\u4E0A\u53BB\u7684,\u6700\u5148\u62C6\u6389\u3002`, `\u2460 x \u5148\u88AB \xD7${a}\u3001\u518D\u88AB +${b} \u2192 \u62C6\u7684\u9806\u5E8F\u76F8\u53CD\u3002`, `\u2461 \u5169\u908A\u540C\u6E1B ${b}:${a}x = ${c} \u2212 ${b} = ${a * x}\u3002`, `\u2462 \u5169\u908A\u540C\u9664 ${a}:x = ${a * x} \xF7 ${a} = ${x}\u3002`, `\u2714 \u4EE3\u56DE\u6AA2\u67E5:${a}\xD7${x}+${b} = ${c} \u2713`, `EN: Method. The unknown is multiplied first and then increased. Undo addition before multiplication, doing the same operation to both sides.`, `EN: Worked example. Undo addition first: ${c} \u2212 ${b} = ${a * x}, so ${a}x = ${a * x}. Divide by ${a}: x = ${a * x} \xF7 ${a} = ${x}. Check: ${a} \xD7 ${x} + ${b} = ${c}.`, `EN: Check and avoid mistakes. Substitution checks the original equation directly. Reversing the operations in the wrong order changes the problem.`]
      );
    },
    () => {
      const t = pick([[6, 3, 2], [4, 4, 2], [6, 6, 3], [10, 10, 5], [12, 6, 4], [12, 4, 3], [15, 10, 6], [8, 8, 4], [20, 5, 4]]);
      return fi(
        `\u{1F3C6} \u4E00\u4EF6\u5DE5\u4F5C,A \u55AE\u7368\u505A\u8981 ${t[0]} \u5929\u3001B \u55AE\u7368\u505A\u8981 ${t[1]} \u5929\u3002\u5169\u4EBA\u5408\u4F5C\u8981\u5E7E\u5929?`,
        `A job takes A ${t[0]} days alone, B ${t[1]} days alone. Together?`,
        t[2],
        nearNums(t[2], 3),
        [`\u{1F511} \u5DE5\u7A0B\u554F\u984C\u5FC3\u6CD5:\u628A\u6574\u4EF6\u5DE5\u4F5C\u7576\u6210\u300C1\u300D,\u6BD4\u8F03\u6BCF\u5929\u7684\u901F\u5EA6\u3002`, `\u2460 A \u6BCF\u5929\u505A 1/${t[0]}\u3001B \u6BCF\u5929\u505A 1/${t[1]}\u3002`, `\u2461 \u5408\u4F5C\u6BCF\u5929:1/${t[0]} + 1/${t[1]} = 1/${t[2]}\u3002`, `\u2462 \u505A\u5B8C\u300C1\u300D\u9700\u8981 ${t[2]} \u5929\u3002`, `\u2714 \u9A57\u7B97:${t[2]}/${t[0]} + ${t[2]}/${t[1]} = 1(\u6574\u4EF6\u5DE5\u4F5C)\u2713`, `EN: Method. Each worker contributes a fraction of one job per day. Add those rates, then divide one whole job by the combined daily rate.`, `EN: Worked example. A completes 1/${t[0]} of the job per day and B completes 1/${t[1]}. Together: 1/${t[0]} + 1/${t[1]} = 1/${t[2]} per day. Time = 1 \xF7 (1/${t[2]}) = ${t[2]} days. Check: ${t[2]}/${t[0]} + ${t[2]}/${t[1]} = 1.`, `EN: Check and avoid mistakes. Add rates, not completion times. The cooperative time should be shorter than either worker\u2019s solo time.`]
      );
    },
    () => {
      const s1 = ri(1, 3), s2 = ri(1, 4);
      const t = [s1, s2];
      for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      return fi(
        `\u{1F3C6} \u6578\u5217\u5075\u63A2\u7D42\u6975\u7248:${t.slice(0, 5).join(", ")}, ?\u3002\u4E0B\u4E00\u500B\u662F?`,
        `Ultimate sequence detective: ${t.slice(0, 5).join(", ")}, ?. Next?`,
        t[5],
        nearNums(t[5], 4),
        [`\u{1F511} \u5DEE\u4E0D\u56FA\u5B9A\u3001\u500D\u7387\u4E5F\u4E0D\u56FA\u5B9A?\u7B2C\u4E09\u62DB:\u6BCF\u9805 = \u524D\u5169\u9805\u76F8\u52A0!`, `\u2460 \u9A57\u8B49:${t[0]}+${t[1]}=${t[2]} \u2713\u3001${t[1]}+${t[2]}=${t[3]} \u2713\u3001${t[2]}+${t[3]}=${t[4]} \u2713`, `\u2461 \u4E0B\u4E00\u9805:${t[3]} + ${t[4]} = ${t[5]}\u3002`, `\u{1F4A1} \u9019\u662F\u8CBB\u6CE2\u90A3\u5951\u6578\u5217\u2014\u2014\u5411\u65E5\u8475\u7A2E\u5B50\u7684\u87BA\u65CB\u3001\u9CF3\u68A8\u8868\u76AE\u3001\u9E1A\u9D61\u87BA\u6BBC\u88E1\u90FD\u85CF\u8457\u5B83\u3002`, `EN: Method. The rule combines the two immediately preceding terms. Test it across the shown terms before extending it.`, `EN: Worked example. Add the previous two terms: ${t[0]} + ${t[1]} = ${t[2]}, ${t[1]} + ${t[2]} = ${t[3]}, ${t[2]} + ${t[3]} = ${t[4]}. Therefore the next is ${t[3]} + ${t[4]} = ${t[5]}.`, `EN: Check and avoid mistakes. Use the last two displayed values for the next term. Adding a fixed gap would follow a different rule.`]
      );
    },
    () => {
      const r = ri(2, 6);
      const area = Math.round(314 * r * r) / 100;
      return fi(
        `\u534A\u5F91 ${r} \u516C\u5206\u7684\u5713,\u9762\u7A4D\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?(\u5713\u5468\u7387\u7528 3.14)`,
        `Area of a circle with radius ${r} cm? (use 3.14)`,
        area,
        [Math.round(314 * 2 * r) / 100, Math.round(314 * (r + 1) * (r + 1)) / 100, Math.round(314 * r) / 100],
        [`\u{1F511} \u5713\u9762\u7A4D = \u5713\u5468\u7387 \xD7 \u534A\u5F91 \xD7 \u534A\u5F91(\u534A\u5F91\u8981\u4E58\u300C\u5169\u6B21\u300D!)\u3002`, `\u2460 ${r} \xD7 ${r} = ${r * r}\u3002`, `\u2461 3.14 \xD7 ${r * r} = ${area}\u3002`, `\u26A0 \u9677\u9631:3.14 \xD7 ${r} \xD7 2 = ${Math.round(314 * 2 * r) / 100} \u662F\u300C\u5713\u5468\u9577\u300D,\u4E0D\u662F\u9762\u7A4D!`, `EN: Method. Circle area is pi times radius squared. Squaring creates an area scale from the length of the radius.`, `EN: Worked example. Square the radius: ${r} \xD7 ${r} = ${r * r}. Multiply by pi: 3.14 \xD7 ${r * r} = ${area} square centimeters. Do not use 2 \xD7 3.14 \xD7 ${r}, which gives circumference.`, `EN: Check and avoid mistakes. Multiply the radius by itself, not by two. Doubling a radius belongs to diameter or circumference calculations.`]
      );
    },
    () => {
      const v = ri(4, 12) * 10, t = ri(2, 6);
      return fi(
        `\u4E00\u53F0\u8ECA\u6BCF\u5C0F\u6642\u8D70 ${v} \u516C\u91CC,\u8D70 ${v * t} \u516C\u91CC\u8981\u5E7E\u5C0F\u6642?`,
        `At ${v} km per hour, how many hours to cover ${v * t} km?`,
        t,
        nearNums(t, 2),
        [`\u{1F511} \u901F\u7387\u4E09\u5144\u5F1F:\u8DDD\u96E2 = \u901F\u7387 \xD7 \u6642\u9593 \u2192 \u6642\u9593 = \u8DDD\u96E2 \xF7 \u901F\u7387\u3002`, `\u2460 ${v * t} \xF7 ${v} = ${t} \u5C0F\u6642\u3002`, `\u2714 \u9A57\u7B97:${v} \xD7 ${t} = ${v * t} \u516C\u91CC \u2713`, `\u{1F4A1} \u540C\u4E00\u689D\u516C\u5F0F\u8F49\u4E09\u500B\u65B9\u5411,\u8A18\u4E00\u500B\u5C31\u6709\u4E09\u500B\u3002`, `EN: Method. Speed tells how much distance is covered each hour. Dividing the total distance by that hourly amount counts the required hours.`, `EN: Worked example. Time = distance \xF7 speed: ${v * t} \xF7 ${v} = ${t} hours. Check: ${v} \xD7 ${t} = ${v * t} km.`, `EN: Check and avoid mistakes. Multiplying distance by speed does not give time. Multiply your time by speed to recover the journey distance.`]
      );
    },
    () => {
      const r = ri(2, 7);
      const area = Math.round(314 * r * r) / 100;
      return fi(
        `\u770B\u5716\u7684\u5713,\u534A\u5F91 ${r} \u516C\u5206\u3002\u9762\u7A4D\u662F\u591A\u5C11\u5E73\u65B9\u516C\u5206?(\u5713\u5468\u7387 3.14)`,
        `This circle has radius ${r} cm. Find the area. (\u03C0=3.14)`,
        area,
        [Math.round(314 * 2 * r) / 100, Math.round(314 * (r + 1) * (r + 1)) / 100, Math.round(628 * r) / 100],
        [`\u{1F511} \u5713\u9762\u7A4D = \u5713\u5468\u7387 \xD7 \u534A\u5F91 \xD7 \u534A\u5F91(\u534A\u5F91\u4E58\u5169\u6B21!)\u3002`, `\u2460 ${r} \xD7 ${r} = ${r * r}\u3002`, `\u2461 3.14 \xD7 ${r * r} = ${area}\u3002`, `\u26A0 \u9677\u9631:3.14\xD7${r}\xD72=${Math.round(628 * r) / 100} \u662F\u5468\u9577,\u4E0D\u662F\u9762\u7A4D\u3002`, `EN: Method. Read whether the diagram labels a radius or diameter before choosing a formula. This diagram gives the radius needed for area.`, `EN: Worked example. The labeled radius is ${r} cm. Square it: ${r} \xD7 ${r} = ${r * r}. Area = 3.14 \xD7 ${r * r} = ${area} square centimeters.`, `EN: Check and avoid mistakes. Square the radius before multiplying by pi. The answer uses square units rather than boundary-length units.`],
        GEO.circle(r, `r=${r}`)
      );
    },
    () => {
      const base = ri(4, 12), h = ri(3, 10);
      const area = base * h;
      return fi(
        `\u770B\u5716\u7684\u5E73\u884C\u56DB\u908A\u5F62,\u5E95 ${base}\u3001\u9AD8 ${h} \u516C\u5206\u3002\u9762\u7A4D\u662F\u591A\u5C11?`,
        `This parallelogram has base ${base} and height ${h} cm. Find the area.`,
        area,
        nearNums(area, 12),
        [`\u{1F511} \u5E73\u884C\u56DB\u908A\u5F62\u9762\u7A4D = \u5E95 \xD7 \u9AD8(\u628A\u659C\u908A\u5207\u4E0B\u4F86\u88DC\u904E\u53BB,\u5C31\u8B8A\u6210\u9577\u65B9\u5F62!)\u3002`, `\u2460 ${base} \xD7 ${h} = ${area} \u5E73\u65B9\u516C\u5206\u3002`, `\u26A0 \u7528\u300C\u9AD8\u300D\u4E0D\u662F\u659C\u908A\u9577:\u9AD8\u662F\u5782\u76F4\u8DDD\u96E2\u3002`, `EN: Method. Sliding a triangular piece from one end to the other makes a rectangle without changing area. Its width is the perpendicular height.`, `EN: Worked example. Use the perpendicular height, not the slanted side. Area = base \xD7 height = ${base} \xD7 ${h} = ${area} square centimeters.`, `EN: Check and avoid mistakes. The slanted side is not the height. Use the perpendicular distance between the parallel bases.`],
        SVG(`<polygon points="30,78 100,78 84,26 14,26" class="gshape"/><line x1="30" y1="78" x2="30" y2="26" class="gdash"/><rect x="30" y="68" width="10" height="10" class="gright"/>` + gLabel(52, 92, `${base}`) + gLabel(20, 54, `${h}`))
      );
    },
    () => {
      const x = ri(2, 7), y = ri(2, 7);
      return fi(
        `\u770B\u5716\u7684\u5EA7\u6A19\u5E73\u9762\u4E0A\u6709\u4E00\u500B\u9EDE,\u5F9E\u539F\u9EDE\u5F80\u53F3 ${x} \u683C\u3001\u5F80\u4E0A ${y} \u683C\u3002\u5B83\u7684\u5EA7\u6A19\u5BEB\u6210 (${x}, ?),? \u662F\u591A\u5C11?`,
        `A point sits ${x} right and ${y} up from the origin. Its coordinates are (${x}, ?). Find ?.`,
        y,
        nearNums(y, 3),
        [`\u{1F511} \u5EA7\u6A19 (x, y):x \u662F\u5F80\u53F3\u5E7E\u683C\u3001y \u662F\u5F80\u4E0A\u5E7E\u683C\u3002`, `\u2460 \u5F80\u4E0A ${y} \u683C \u2192 y = ${y}\u3002`, `\u2461 \u5B8C\u6574\u5EA7\u6A19:(${x}, ${y})\u3002`, `\u{1F4A1} \u5EA7\u6A19\u662F\u300C\u5730\u5716\u4E0A\u7684\u5730\u5740\u300D,\u5169\u500B\u6578\u5B57\u7CBE\u6E96\u5B9A\u4F4D\u4E00\u500B\u9EDE\u3002`, `EN: Method. An ordered pair records horizontal position first, then vertical position. The two values describe different directions.`, `EN: Worked example. Coordinates list horizontal distance first and vertical distance second. Moving ${x} right and ${y} up gives (${x}, ${y}), so the missing coordinate is ${y}.`, `EN: Check and avoid mistakes. Do not swap the coordinates. Retrace the horizontal and vertical moves from the origin to check the location.`],
        GEO.coord(x, y)
      );
    },
    () => {
      const base = ri(4, 10), h = ri(3, 8);
      const tri = base * h / 2;
      return fi(
        `\u770B\u5716:\u4E00\u500B\u5E95 ${base}\u3001\u9AD8 ${h} \u7684\u4E09\u89D2\u5F62,\u548C\u4E00\u500B\u9577 ${base}\u3001\u5BEC ${h} \u7684\u9577\u65B9\u5F62\u3002\u4E09\u89D2\u5F62\u9762\u7A4D\u662F\u9577\u65B9\u5F62\u7684\u5E7E\u5206\u4E4B\u5E7E?(\u7528\u5206\u6578)`,
        `A triangle (base ${base}, height ${h}) sits beside a rectangle (${base}\xD7${h}). The triangle's area is what fraction of the rectangle?`,
        "1/2",
        ["1/3", "1/4", "2/3"],
        [`\u{1F511} \u540C\u5E95\u540C\u9AD8\u6642,\u4E09\u89D2\u5F62\u9762\u7A4D\u6C38\u9060\u662F\u9577\u65B9\u5F62\u7684\u4E00\u534A\u3002`, `\u2460 \u9577\u65B9\u5F62:${base}\xD7${h} = ${base * h}\u3002`, `\u2461 \u4E09\u89D2\u5F62:${base}\xD7${h}\xF72 = ${tri},\u525B\u597D\u4E00\u534A\u3002`, `\u2714 \u9019\u5C31\u662F\u4E09\u89D2\u5F62\u9762\u7A4D\u516C\u5F0F\u300C\xF72\u300D\u7684\u4F86\u6E90\u3002`, `EN: Method. With equal base and height, a triangle occupies half the corresponding rectangle. Compare their calculated areas to obtain the fraction.`, `EN: Worked example. Rectangle area = ${base} \xD7 ${h} = ${base * h}. Triangle area = ${base} \xD7 ${h} \xF7 2 = ${tri}. Their ratio is ${tri}/${base * h} = 1/2.`, `EN: Check and avoid mistakes. The ratio is triangle area divided by rectangle area, not the reverse. The dimensions may change while this fraction stays constant.`],
        SVG(`<rect x="12" y="30" width="44" height="46" class="gshape"/><polygon points="64,76 108,76 64,30" class="gshape"/>` + gLabel(34, 90, `${base}`) + gLabel(86, 90, `${base}`))
      );
    },
    () => {
      const r = ri(2, 5), R = r + ri(2, 4);
      const A = Math.round(314 * (R * R - r * r)) / 100;
      return fi(
        `\u770B\u5716\u7684\u5713\u74B0(\u751C\u751C\u5708):\u5916\u5713\u534A\u5F91 ${R}\u3001\u5167\u5713\u534A\u5F91 ${r} \u516C\u5206\u3002\u5713\u74B0\u9762\u7A4D\u662F\u591A\u5C11?(\u5713\u5468\u7387 3.14)`,
        `An annulus with outer radius ${R} and inner radius ${r}. Find its area. (\u03C0=3.14)`,
        A,
        [Math.round(314 * (R - r) * (R - r)) / 100, Math.round(314 * R * R) / 100, Math.round(314 * (R * R + r * r)) / 100],
        [`\u{1F511} \u5713\u74B0 = \u5927\u5713 \u2212 \u5C0F\u5713(\u6316\u6D1E\u6CD5\u7528\u5728\u5713\u4E0A)\u3002`, `\u2460 \u5927\u5713:3.14 \xD7 ${R}\xB2 = ${Math.round(314 * R * R) / 100}\u3002`, `\u2461 \u5C0F\u5713:3.14 \xD7 ${r}\xB2 = ${Math.round(314 * r * r) / 100}\u3002`, `\u2462 \u76F8\u6E1B:${A} \u5E73\u65B9\u516C\u5206\u3002`, `\u26A0 \u9677\u9631:\u4E0D\u80FD\u5148\u7B97 (${R}\u2212${r})\xB2 \u2014\u2014\u300C\u5DEE\u7684\u5E73\u65B9\u300D\u4E0D\u7B49\u65BC\u300C\u5E73\u65B9\u7684\u5DEE\u300D!`, `EN: Method. An annulus is the outer disk with the inner disk removed. The empty center must not contribute to the area.`, `EN: Worked example. Outer circle area = 3.14 \xD7 ${R}\xB2 = ${Math.round(314 * R * R) / 100}. Inner area = 3.14 \xD7 ${r}\xB2 = ${Math.round(314 * r * r) / 100}. Subtract to get ${A} square centimeters. Subtract areas, not radii.`, `EN: Check and avoid mistakes. Square each radius separately before subtracting. Squaring the difference of the radii gives a different quantity.`],
        SVG(`<circle cx="60" cy="50" r="38" class="gshape"/><circle cx="60" cy="50" r="${Math.round(38 * r / R)}" style="fill:var(--paper);stroke:var(--cobalt);stroke-width:2"/>` + gLabel(60, 10, `R=${R}`) + gLabel(60, 54, `r=${r}`))
      );
    },
    () => {
      const r = ri(2, 5), h = ri(4, 9);
      const w = 2 * r;
      const A = Math.round(w * h * 100 + 314 * r * r / 2) / 100;
      return fi(
        `\u770B\u5716\u7684\u300C\u9580\u5F62\u300D:\u4E0B\u9762\u662F ${w}\xD7${h} \u7684\u9577\u65B9\u5F62,\u4E0A\u9762\u52A0\u4E00\u500B\u534A\u5F91 ${r} \u7684\u534A\u5713\u3002\u7E3D\u9762\u7A4D\u662F\u591A\u5C11?(\u5713\u5468\u7387 3.14)`,
        `A door shape: a ${w}\xD7${h} rectangle topped by a semicircle of radius ${r}. Total area? (\u03C0=3.14)`,
        A,
        [Math.round(w * h * 100 + 314 * r * r) / 100, Math.round(w * h * 100) / 100, Math.round(w * h * 100 + 157 * r) / 100],
        [`\u{1F511} \u7D44\u5408\u5716\u5F62:\u9577\u65B9\u5F62 + \u534A\u5713,\u5206\u958B\u7B97\u518D\u76F8\u52A0\u3002`, `\u2460 \u9577\u65B9\u5F62:${w} \xD7 ${h} = ${w * h}\u3002`, `\u2461 \u534A\u5713:3.14 \xD7 ${r}\xB2 \xF7 2 = ${Math.round(314 * r * r / 2) / 100}\u3002`, `\u2462 \u76F8\u52A0:${A} \u5E73\u65B9\u516C\u5206\u3002`, `\u2714 \u6AA2\u67E5:\u534A\u5713\u76F4\u5F91 ${2 * r} \u525B\u597D\u7B49\u65BC\u9577\u65B9\u5F62\u7684\u5BEC ${w},\u62FC\u5F97\u8D77\u4F86 \u2713`, `EN: Method. Separate the door into a rectangle and a semicircle that meet without overlapping. Compute both areas, then add them.`, `EN: Worked example. Rectangle area = ${w} \xD7 ${h} = ${w * h}. Semicircle area = 3.14 \xD7 ${r}\xB2 \xF7 2 = ${Math.round(314 * r * r / 2) / 100}. Add: ${w * h} + ${Math.round(314 * r * r / 2) / 100} = ${A} square centimeters. Its diameter ${2 * r} matches the rectangle width ${w}.`, `EN: Check and avoid mistakes. Halve only the circle area, not the rectangle. The semicircle diameter must equal the rectangle width.`],
        SVG(`<rect x="32" y="42" width="56" height="44" class="gshape"/><path d="M32,42 A28,28 0 0,1 88,42" class="gshape"/>` + gLabel(60, 96, `${w}`) + gLabel(98, 66, `${h}`) + gLabel(60, 30, `r=${r}`))
      );
    }
  ]
};
function genMath(level, n) {
  const gens = MATH_GEN[level] || [];
  return Array.from({ length: n }, () => {
    const i = Math.floor(Math.random() * gens.length);
    const q = gens[i]();
    q.fp = `m:${level}:${i}`;
    q.topic = (MATH_TOPICS[level] || [])[i] || "";
    q.why = enrichWhy(q.why, (MATH_LORE[level] || [])[i]);
    return q;
  });
}
function genMathRevenge(fps, n = 5) {
  const parsed = [...new Set((fps || []).map((fp) => String(fp)).filter((fp) => fp.startsWith("m:")))];
  const qs = [];
  for (const fp of shuffle(parsed)) {
    const [, lvS, iS] = fp.split(":");
    const lv = Number(lvS), i = Number(iS);
    const gen = MATH_GEN[lv] && MATH_GEN[lv][i];
    if (!gen) continue;
    const q = gen();
    q.fp = fp;
    q.topic = (MATH_TOPICS[lv] || [])[i] || `L${lv} \u984C\u578B ${i + 1}`;
    q.revenge = true;
    q.why = enrichWhy(q.why, (MATH_LORE[lv] || [])[i]);
    qs.push(q);
    if (qs.length >= n) break;
  }
  return qs;
}
function genHanzi(level, n, packName = null, reviewTargets = null) {
  const groups = HANZI[level] || [];
  const pool = groups.flatMap((g) => g.chars);
  const targets = packName ? (groups.find((g) => g.f === packName) || { chars: [] }).chars : pool;
  if (!targets.length) return [];
  const chars = shuffle(targets);
  const types = shuffle(["reading", "cloze", "radical", "word"]);
  return Array.from({ length: n }, (_, i) => {
    const target = reviewTargets && reviewTargets[i % reviewTargets.length];
    const h = target ? pool.find((x) => x.c === target.character) : chars[i % chars.length], type = target ? target.skill : types[i % types.length];
    const why = [
      `\u4F8B\u8A5E\uFF1A${h.w}\uFF08${h.wzy}\uFF09\u3002\u672C\u984C\u7684\u300C${h.c}\u300D\u8B80\u4F5C ${h.zy}\u3002`,
      `\u8A5E\u7FA9\uFF1A${h.zh}`,
      `\u5B57\u5F62\uFF1A\u5B57\u5178\u90E8\u9996\u662F\u300C${h.radical}\u300D\uFF0C\u5171 ${h.strokes} \u756B\u3002\u90E8\u9996\u7528\u4F86\u67E5\u5B57\uFF0C\u4E0D\u4EE3\u8868\u6574\u500B\u5B57\u7684\u610F\u601D\u3002`,
      `EN: ${h.w} \u2014 ${h.we}. This question uses the reading in this example word.`
    ];
    let q, answer, options;
    if (type === "reading") {
      q = `\u300C${h.w}\u300D\u4E2D\u7B2C ${h.targetIndex + 1} \u500B\u5B57\u300C${h.c}\u300D\u600E\u9EBC\u8B80\uFF1F`;
      answer = h.zy;
      options = [answer, ...shuffle([...new Set(pool.map((x) => x.zy))].filter((x) => x !== answer)).slice(0, 3)];
    } else if (type === "cloze") {
      const masked = Array.from(h.w).map((c, j) => j === h.targetIndex ? "\u25A1" : c).join("");
      q = `\u8B80\u97F3\u662F\u300C${h.wzy}\u300D\uFF0C\u8ACB\u9078\u5B57\u586B\u5165\u300C${masked}\u300D\u3002`;
      answer = h.c;
      options = [answer, ...shuffle(pool.filter((x) => x.c !== h.c && !x.readings.includes(h.zy))).slice(0, 3).map((x) => x.c)];
    } else if (type === "radical") {
      q = `\u300C${h.c}\u300D\uFF08\u4F8B\u8A5E\uFF1A${h.w}\uFF09\u5728\u5B57\u5178\u4E2D\u5C6C\u65BC\u54EA\u500B\u90E8\u9996\uFF1F`;
      answer = h.radical;
      options = [answer, ...shuffle([...new Set(pool.map((x) => x.radical))].filter((x) => x !== answer)).slice(0, 3)];
    } else {
      q = `\u54EA\u500B\u8A5E\u8A9E\u7684\u8B80\u97F3\u662F\u300C${h.wzy}\u300D\uFF1F`;
      answer = h.w;
      const seen = /* @__PURE__ */ new Set([answer]);
      const others = shuffle(pool).filter((x) => {
        if (seen.has(x.w) || x.wordReadings.includes(h.wzy)) return false;
        seen.add(x.w);
        return true;
      });
      options = [answer, ...others.slice(0, 3).map((x) => x.w)];
    }
    options = shuffle(options);
    return {
      fp: `h:${h.c}`,
      character: h.c,
      skill: type,
      q,
      en: { reading: "Choose the reading used in this example word.", cloze: "Use the pronunciation to fill in the missing character.", radical: "Choose the dictionary radical.", word: "Match the pronunciation to the word." }[type],
      options,
      ansV: answer,
      ans: options.indexOf(answer),
      big: type !== "reading",
      why
    };
  });
}
const HANZI_SKILLS = { reading: "\u5B57\u97F3", cloze: "\u9078\u5B57", radical: "\u90E8\u9996", word: "\u8A5E\u8A9E\u8A8D\u8B80" };
function hanziReview(state, level, skill) {
  const chars = new Set((HANZI[level] || []).flatMap((g) => g.chars.map((c) => c.c)));
  return Object.entries((state.ledger || {}).skills || {}).filter(
    ([key, it]) => chars.has(it.character) && it.skill === skill && it.lastOk === false
  ).map(([key, it]) => ({ character: it.character, skill: it.skill }));
}
const SCI_LORE = {
  1: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u300C\u69CB\u9020\u6C7A\u5B9A\u529F\u80FD\u300D\u662F\u6574\u500B\u751F\u7269\u5B78\u7684\u7B2C\u4E00\u628A\u9470\u5319\u3002\u770B\u898B\u4E00\u500B\u8EAB\u9AD4\u90E8\u4F4D,\u5148\u554F\u5B83\u9577\u4EC0\u9EBC\u5F62\u72C0,\u518D\u731C\u5B83\u80FD\u505A\u4EC0\u9EBC\u2014\u2014\u7FC5\u8180\u7684\u5F62\u72C0\u6D29\u6F0F\u4E86\u98DB\u884C,\u9C2D\u7684\u5F62\u72C0\u6D29\u6F0F\u4E86\u6E38\u6CF3\u3002\u9019\u689D\u898F\u5247\u8B93\u6211\u5011\u5149\u770B\u5316\u77F3\u5C31\u80FD\u63A8\u6E2C\u7260\u600E\u9EBC\u751F\u6D3B\u3002 EN: Structure decides function is biology first key: a body part shape hints at its job, so a fin means swimming and a wing means flying, even in fossils.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u690D\u7269\u4E0D\u80FD\u8DD1\u3001\u4E0D\u80FD\u8EB2,\u537B\u6D3B\u5F97\u6BD4\u8AB0\u90FD\u4E45\u2014\u2014\u56E0\u70BA\u7260\u5011\u628A\u300C\u6C42\u751F\u300D\u5BEB\u9032\u4E86\u69CB\u9020\u88E1:\u6839\u5F80\u4E0B\u6293\u6C34\u3001\u8449\u5F80\u4E0A\u8FFD\u5149\u3001\u523A\u8207\u6BD2\u8D95\u8D70\u6575\u4EBA\u3002\u4E0D\u52D5\u8072\u8272\u7684\u751F\u5B58\u7B56\u7565,\u662F\u6F14\u5316\u6700\u5B89\u975C\u4E5F\u6700\u53B2\u5BB3\u7684\u5091\u4F5C\u3002 EN: Plants cannot run or hide yet outlive almost everything, because survival is built into their form: roots chase water, leaves chase light, thorns and toxins repel enemies.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u4E94\u5B98\u662F\u8EAB\u9AD4\u7684\u5075\u6E2C\u5668,\u5404\u81EA\u8CA0\u8CAC\u4E00\u7A2E\u8A0A\u865F\u2014\u2014\u773C\u775B\u6536\u5149\u3001\u8033\u6735\u6536\u9707\u52D5\u3001\u9F3B\u5B50\u6536\u6C23\u5473\u5206\u5B50\u3002\u5927\u8166\u628A\u9019\u4E9B\u8A0A\u865F\u62FC\u6210\u4E00\u5E45\u4E16\u754C\u7684\u5730\u5716\u3002\u5C11\u4E86\u4EFB\u4F55\u4E00\u7A2E\u5075\u6E2C\u5668,\u4E16\u754C\u5C31\u7F3A\u4E86\u4E00\u500B\u7DAD\u5EA6\u3002 EN: The senses are detectors, each tuned to one signal \u2014 eyes read light, ears read vibration, the nose reads molecules \u2014 and the brain stitches them into one map of the world.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u767D\u5929\u8207\u9ED1\u591C\u4E0D\u662F\u592A\u967D\u5728\u52D5,\u662F\u5730\u7403\u81EA\u5DF1\u5728\u8F49\u3002\u9019\u662F\u4EBA\u985E\u6700\u96E3\u653E\u4E0B\u7684\u932F\u89BA\u4E4B\u4E00:\u660E\u660E\u770B\u898B\u592A\u967D\u5347\u843D,\u771F\u76F8\u537B\u662F\u6211\u5011\u7AD9\u5728\u4E00\u9846\u65CB\u8F49\u7684\u7403\u4E0A\u3002\u79D1\u5B78\u5E38\u5E38\u8981\u6211\u5011\u76F8\u4FE1\u63A8\u7406,\u800C\u4E0D\u662F\u773C\u775B\u3002 EN: Day and night come from Earth spinning, not the Sun moving. Science often asks us to trust reasoning over what our eyes seem to show."
  ],
  2: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u5F71\u5B50\u662F\u5149\u8D70\u76F4\u7DDA\u7684\u8B49\u64DA\u3002\u5149\u4E0D\u6703\u8F49\u5F4E\u7E5E\u904E\u969C\u7919\u7269,\u6240\u4EE5\u64CB\u4F4F\u5149\u7684\u5730\u65B9\u5C31\u7559\u4E0B\u4E00\u584A\u9ED1\u2014\u2014\u5F71\u5B50\u7684\u5F62\u72C0\u3001\u9577\u77ED\u3001\u65B9\u5411,\u5168\u90FD\u88AB\u5149\u6E90\u7684\u4F4D\u7F6E\u6C7A\u5B9A\u3002\u8B80\u61C2\u5F71\u5B50,\u5C31\u8B80\u61C2\u4E86\u5149\u7684\u813E\u6C23\u3002 EN: Shadows prove that light travels in straight lines: light cannot bend around an obstacle, so blocked light leaves a dark shape ruled entirely by the source position.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u6C34\u7684\u4E09\u614B\u544A\u8A34\u6211\u5011\u4E00\u4EF6\u9A5A\u4EBA\u7684\u4E8B\u2014\u2014\u51B0\u3001\u6C34\u3001\u6C34\u84B8\u6C23\u5176\u5BE6\u662F\u540C\u4E00\u7A2E\u6771\u897F,\u53EA\u662F\u5206\u5B50\u8DD1\u5F97\u5FEB\u6162\u4E0D\u540C\u3002\u52A0\u71B1\u8B93\u5206\u5B50\u8E81\u52D5\u3001\u51B7\u537B\u8B93\u5206\u5B50\u5B89\u975C\u3002\u7269\u8CEA\u6C92\u6709\u6D88\u5931,\u53EA\u662F\u63DB\u4E86\u500B\u6A23\u5B50,\u9019\u53EB\u72C0\u614B\u8B8A\u5316\u3002 EN: Ice, water and vapour are the same substance with molecules moving at different speeds. Heating excites them, cooling calms them; matter changes state without disappearing.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u529B\u770B\u4E0D\u898B,\u4F46\u5B83\u7684\u6548\u679C\u770B\u5F97\u898B\u2014\u2014\u63A8\u3001\u62C9\u6703\u6539\u8B8A\u7269\u9AD4\u7684\u901F\u5EA6\u6216\u65B9\u5411\u3002\u6C92\u6709\u529B,\u904B\u52D5\u7684\u6771\u897F\u6703\u4E00\u76F4\u52D5\u4E0B\u53BB\u3002\u5B78\u6703\u8FA8\u8A8D\u6BCF\u4E00\u500B\u529B\u662F\u8AB0\u65BD\u52A0\u7684\u3001\u5F80\u54EA\u500B\u65B9\u5411,\u662F\u7406\u89E3\u6574\u500B\u7269\u7406\u4E16\u754C\u7684\u8D77\u9EDE\u3002 EN: Forces are invisible but their effects are not: pushes and pulls change speed or direction. Naming who applies each force and where is the start of understanding physics.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u8072\u97F3\u662F\u9707\u52D5\u5728\u7A7A\u6C23\u88E1\u50B3\u958B\u7684\u6CE2\u3002\u7269\u9AD4\u6296\u52D5,\u63A8\u52D5\u65C1\u908A\u7684\u7A7A\u6C23\u4E00\u5C64\u5C64\u50B3\u51FA\u53BB,\u50B3\u5230\u8033\u6735\u5C31\u807D\u898B\u4E86\u3002\u6C92\u6709\u4ECB\u8CEA(\u5982\u771F\u7A7A)\u8072\u97F3\u5C31\u50B3\u4E0D\u904E\u53BB\u2014\u2014\u9019\u89E3\u91CB\u4E86\u70BA\u4EC0\u9EBC\u592A\u7A7A\u4E00\u7247\u5BC2\u975C\u3002 EN: Sound is vibration spreading as waves through air: a shaking object nudges the air outward layer by layer. Without a medium, like in a vacuum, sound cannot travel \u2014 space is silent."
  ],
  3: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u78C1\u9435\u6709\u770B\u4E0D\u898B\u7684\u78C1\u5834,\u540C\u6975\u76F8\u65A5\u3001\u7570\u6975\u76F8\u5438\u3002\u9019\u80A1\u300C\u9694\u7A7A\u4F5C\u7528\u300D\u7684\u529B\u548C\u91CD\u529B\u3001\u96FB\u529B\u540C\u5C6C\u81EA\u7136\u754C\u7684\u57FA\u672C\u529B\u3002\u6307\u5357\u91DD\u4E4B\u6240\u4EE5\u6307\u5317,\u662F\u56E0\u70BA\u6574\u9846\u5730\u7403\u672C\u8EAB\u5C31\u662F\u4E00\u584A\u5DE8\u5927\u7684\u78C1\u9435\u3002 EN: Magnets carry an invisible field: like poles repel, opposite poles attract. This action at a distance is a fundamental force, and a compass points north because Earth itself is a giant magnet.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u690D\u7269\u662F\u5730\u7403\u7684\u592A\u967D\u80FD\u5DE5\u5EE0\u3002\u8449\u5B50\u7528\u5149\u3001\u6C34\u3001\u4E8C\u6C27\u5316\u78B3\u88FD\u9020\u990A\u5206,\u9806\u4FBF\u653E\u51FA\u6211\u5011\u547C\u5438\u7684\u6C27\u6C23\u3002\u5730\u7403\u4E0A\u5E7E\u4E4E\u6240\u6709\u80FD\u91CF,\u6700\u521D\u90FD\u662F\u690D\u7269\u5F9E\u967D\u5149\u6293\u4E0B\u4F86\u7684\u2014\u2014\u98DF\u7269\u93C8\u7684\u7B2C\u4E00\u7B46\u9322\u7531\u5B83\u5011\u5370\u3002 EN: Plants are Earth solar factories: leaves turn light, water and carbon dioxide into food while releasing oxygen. Almost all energy in life traces back to sunlight captured by plants.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u98DF\u7269\u93C8\u662F\u4E00\u689D\u80FD\u91CF\u7684\u50B3\u905E\u7DDA,\u5F9E\u592A\u967D\u5230\u690D\u7269\u3001\u5230\u5403\u690D\u7269\u7684\u52D5\u7269\u3001\u518D\u5230\u5403\u52D5\u7269\u7684\u52D5\u7269\u3002\u6BCF\u50B3\u4E00\u5C64,\u80FD\u91CF\u90FD\u6703\u6D41\u5931\u5927\u534A\u2014\u2014\u9019\u89E3\u91CB\u4E86\u70BA\u4EC0\u9EBC\u7345\u5B50\u7E3D\u662F\u6BD4\u7F9A\u7F8A\u5C11,\u9802\u7AEF\u7684\u63A0\u98DF\u8005\u6C38\u9060\u7A00\u6709\u3002 EN: A food chain passes energy from sun to plant to herbivore to predator, losing most of it at each step. That is why top predators are always rare compared with their prey.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u7A7A\u6C23\u96D6\u7136\u770B\u4E0D\u898B,\u537B\u771F\u5BE6\u4F54\u64DA\u7A7A\u9593\u3001\u4E5F\u6709\u91CD\u91CF\u3002\u628A\u676F\u5B50\u5012\u6263\u58D3\u9032\u6C34\u88E1,\u6C34\u9032\u4E0D\u53BB\u2014\u2014\u56E0\u70BA\u88E1\u9762\u65E9\u88AB\u7A7A\u6C23\u4F54\u6EFF\u4E86\u3002\u770B\u4E0D\u898B\u4E0D\u7B49\u65BC\u4E0D\u5B58\u5728,\u662F\u79D1\u5B78\u601D\u8003\u6700\u91CD\u8981\u7684\u63D0\u9192\u4E4B\u4E00\u3002 EN: Air is invisible yet truly takes up space and has weight: push an upside-down cup into water and water cannot enter, because air already fills it. Invisible never means nonexistent."
  ],
  4: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u6708\u4EAE\u81EA\u5DF1\u4E0D\u767C\u5149,\u6211\u5011\u770B\u5230\u7684\u662F\u5B83\u53CD\u5C04\u7684\u967D\u5149\u3002\u6708\u76F8\u7684\u5713\u7F3A,\u662F\u5730\u7403\u3001\u6708\u4EAE\u3001\u592A\u967D\u4E09\u8005\u76F8\u5C0D\u4F4D\u7F6E\u7684\u5E7E\u4F55\u904A\u6232\u2014\u2014\u540C\u4E00\u9846\u88AB\u7167\u4EAE\u7684\u7403,\u5F9E\u4E0D\u540C\u89D2\u5EA6\u770B,\u4EAE\u9762\u5927\u5C0F\u5C31\u4E0D\u540C\u3002\u62AC\u982D\u770B\u6708,\u5176\u5BE6\u5728\u770B\u4E00\u9053\u7ACB\u9AD4\u5E7E\u4F55\u984C\u3002 EN: The Moon shines by reflecting sunlight, and its phases are pure geometry: the same lit sphere seen from changing angles shows different bright fractions.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u96FB\u8DEF\u662F\u96FB\u6D41\u7E5E\u7684\u4E00\u5708\u8DEF,\u5FC5\u9808\u9996\u5C3E\u76F8\u9023\u3001\u6C92\u6709\u65B7\u9EDE,\u96FB\u624D\u6703\u6D41\u52D5\u3001\u71C8\u624D\u6703\u4EAE\u3002\u4EFB\u4F55\u4E00\u8655\u65B7\u958B,\u6574\u689D\u8DEF\u5C31\u5931\u6548\u3002\u628A\u62BD\u8C61\u7684\u96FB\u60F3\u6210\u4E00\u689D\u5FC5\u9808\u9589\u5408\u7684\u74B0,\u5927\u90E8\u5206\u96FB\u8DEF\u554F\u984C\u5C31\u8FCE\u5203\u800C\u89E3\u3002 EN: A circuit is a complete loop the current travels: any break stops the flow and the bulb goes dark. Picture electricity as a ring that must stay closed.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u71B1\u7E3D\u662F\u5F9E\u6EAB\u5EA6\u9AD8\u7684\u5730\u65B9\u6D41\u5411\u4F4E\u7684\u5730\u65B9,\u76F4\u5230\u5169\u908A\u4E00\u6A23\u70BA\u6B62\u2014\u2014\u9019\u53EB\u71B1\u5E73\u8861\u3002\u71B1\u7684\u65C5\u884C\u6709\u4E09\u7A2E\u65B9\u5F0F:\u50B3\u5C0E\u3001\u5C0D\u6D41\u3001\u8F3B\u5C04\u3002\u7406\u89E3\u71B1\u5F80\u54EA\u8D70\u3001\u8D70\u591A\u5FEB,\u5C31\u80FD\u89E3\u91CB\u4FDD\u6EAB\u676F\u3001\u6696\u6C23\u3001\u751A\u81F3\u5730\u7403\u6C23\u5019\u3002 EN: Heat always flows from hot to cold until both match, called thermal equilibrium, travelling by conduction, convection and radiation.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u6D6E\u6216\u6C89,\u6BD4\u7684\u4E0D\u662F\u8F15\u91CD,\u800C\u662F\u5BC6\u5EA6\u2014\u2014\u540C\u9AD4\u7A4D\u4E0B\u8AB0\u6BD4\u6C34\u91CD\u3002\u9435\u584A\u6C89\u3001\u9435\u9020\u7684\u8239\u537B\u6D6E,\u95DC\u9375\u5728\u8239\u628A\u7A7A\u6C23\u5305\u9032\u9AD4\u7A4D\u88E1,\u5E73\u5747\u5BC6\u5EA6\u8B8A\u5C0F\u4E86\u3002\u770B\u7A7F\u300C\u91CD\u91CF\u300D\u80CC\u5F8C\u7684\u5BC6\u5EA6,\u662F\u6D41\u9AD4\u4E16\u754C\u7684\u901A\u95DC\u5BC6\u8A9E\u3002 EN: Floating depends on density, not weight: a steel ship floats because trapping air lowers its average density below water. Look past weight to density."
  ],
  5: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u6EB6\u89E3\u662F\u5206\u5B50\u7D1A\u7684\u8EB2\u8C93\u8C93\u2014\u2014\u7CD6\u4E0D\u898B\u4E86,\u4E0D\u662F\u6D88\u5931,\u800C\u662F\u62C6\u6210\u770B\u4E0D\u898B\u7684\u5C0F\u5206\u5B50\u8EB2\u9032\u6C34\u5206\u5B50\u4E4B\u9593\u3002\u6EAB\u5EA6\u3001\u652A\u62CC\u6703\u52A0\u5FEB\u9019\u500B\u904E\u7A0B\u3002\u7269\u8CEA\u5B88\u6046\u7684\u4FE1\u5FF5\u544A\u8A34\u6211\u5011:\u770B\u4E0D\u898B,\u4E0D\u4EE3\u8868\u4E0D\u5728\u3002 EN: Dissolving is molecular hide and seek: sugar scatters into invisible particles among water molecules rather than vanishing. Conservation says the unseen still exists.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u9178\u8207\u9E7C\u662F\u4E00\u5C0D\u5316\u5B78\u4E0A\u7684\u76F8\u53CD\u529B\u91CF,\u76F8\u9047\u6703\u4E92\u76F8\u4E2D\u548C\u3002\u7528\u77F3\u854A\u8A66\u7D19\u7684\u984F\u8272\u5C31\u80FD\u5206\u8FA8\u2014\u2014\u9019\u662F\u628A\u770B\u4E0D\u898B\u7684\u5316\u5B78\u6027\u8CEA\u8B8A\u6210\u770B\u5F97\u898B\u7684\u8A0A\u865F\u3002\u5206\u985E\u8207\u6AA2\u6E2C,\u662F\u5316\u5B78\u5BB6\u8A8D\u8B58\u7269\u8CEA\u7684\u5169\u5927\u57FA\u672C\u529F\u3002 EN: Acids and bases are chemical opposites that neutralize each other, revealed by indicator colours that turn invisible chemistry into a visible signal.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u5FAE\u751F\u7269\u770B\u4E0D\u898B,\u537B\u4E3B\u5BB0\u8457\u767C\u9175\u3001\u8150\u6557\u8207\u75BE\u75C5\u3002\u5B83\u5011\u8B49\u660E\u4E86\u4E00\u4EF6\u4E8B:\u4E16\u754C\u7684\u904B\u4F5C\u5E38\u5E38\u767C\u751F\u5728\u8089\u773C\u770B\u4E0D\u5230\u7684\u5C3A\u5EA6\u3002\u986F\u5FAE\u93E1\u64F4\u5927\u4E86\u4EBA\u985E\u7684\u773C\u754C,\u4E5F\u64F4\u5927\u4E86\u6211\u5011\u5C0D\u300C\u4EC0\u9EBC\u662F\u6D3B\u8457\u300D\u7684\u7406\u89E3\u3002 EN: Microbes are invisible yet drive fermentation, decay and disease, proving that much of the world works at scales the naked eye cannot reach.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u5CA9\u77F3\u662F\u5730\u7403\u7684\u65E5\u8A18\u672C\u3002\u6C89\u7A4D\u5CA9\u4E00\u5C64\u5C64\u5806\u758A,\u8D8A\u4E0B\u9762\u8D8A\u53E4\u8001;\u5316\u77F3\u5C01\u5B58\u5728\u5176\u4E2D,\u8A18\u9304\u8457\u5343\u842C\u5E74\u524D\u7684\u751F\u547D\u3002\u8B80\u61C2\u5CA9\u5C64\u7684\u9806\u5E8F,\u5C31\u80FD\u5012\u5E36\u64AD\u653E\u5730\u7403\u7684\u6B77\u53F2\u2014\u2014\u9019\u662F\u6642\u9593\u7684\u7269\u8B49\u3002 EN: Rocks are Earth diary: sedimentary layers stack oldest at the bottom, and fossils inside record ancient life, letting us rewind the planet history."
  ],
  6: [
    "\u{1F52D} \u5927\u6982\u5FF5:\u69D3\u687F\u8B93\u6211\u5011\u4EE5\u5C0F\u535A\u5927\u2014\u2014\u7528\u8F03\u5C0F\u7684\u529B\u64AC\u52D5\u8F03\u5927\u7684\u91CD\u7269,\u4EE3\u50F9\u662F\u8981\u79FB\u52D5\u66F4\u9577\u7684\u8DDD\u96E2\u3002\u7701\u4E86\u529B\u5C31\u8CBB\u4E86\u8DDD\u96E2,\u5929\u4E0B\u6C92\u6709\u767D\u5403\u7684\u5348\u9910\u3002\u9019\u500B\u300C\u529F\u5B88\u6046\u300D\u7684\u9053\u7406,\u662F\u6240\u6709\u6A5F\u68B0\u7684\u5171\u540C\u5E95\u7DDA\u3002 EN: A lever trades force for distance: less effort but a longer push. You never get something for nothing \u2014 this conservation of work underlies all machines.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u80FD\u91CF\u4E0D\u6703\u6191\u7A7A\u7522\u751F\u6216\u6D88\u5931,\u53EA\u6703\u5F9E\u4E00\u7A2E\u5F62\u5F0F\u8B8A\u6210\u53E6\u4E00\u7A2E\u2014\u2014\u52D5\u80FD\u8B8A\u71B1\u3001\u96FB\u80FD\u8B8A\u5149\u3001\u5316\u5B78\u80FD\u8B8A\u904B\u52D5\u3002\u5B87\u5B99\u50CF\u4E00\u672C\u6C38\u9060\u6536\u652F\u5E73\u8861\u7684\u5E33\u672C\u3002\u8FFD\u8E64\u80FD\u91CF\u7684\u6D41\u5411\u8207\u8F49\u63DB,\u662F\u7269\u7406\u5B78\u6700\u5F37\u5927\u7684\u89E3\u984C\u5DE5\u5177\u3002 EN: Energy is never created or destroyed, only transformed \u2014 motion to heat, electricity to light. The universe is a perfectly balanced ledger of energy.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u91CD\u529B\u3001\u78C1\u529B\u3001\u96FB\u529B\u90FD\u662F\u300C\u9694\u7A7A\u4F5C\u7528\u300D\u7684\u529B\u5834\u2014\u2014\u4E0D\u5FC5\u63A5\u89F8\u5C31\u80FD\u65BD\u529B\u3002\u5834\u7684\u6982\u5FF5\u662F\u7269\u7406\u5B78\u7684\u4E00\u6B21\u601D\u60F3\u98DB\u8E8D:\u7A7A\u9593\u672C\u8EAB\u5E36\u8457\u770B\u4E0D\u898B\u7684\u6027\u8CEA,\u7269\u9AD4\u53EA\u662F\u56DE\u61C9\u5B83\u3002\u770B\u4E0D\u898B\u7684\u5834,\u6490\u8D77\u4E86\u770B\u5F97\u898B\u7684\u4E16\u754C\u3002 EN: Gravity, magnetism and electricity act at a distance through fields: space itself carries invisible properties that objects respond to.",
    "\u{1F52D} \u5927\u6982\u5FF5:\u751F\u614B\u7CFB\u662F\u4E00\u5F35\u727D\u4E00\u9AEE\u52D5\u5168\u8EAB\u7684\u7DB2\u3002\u6BCF\u500B\u7269\u7A2E\u90FD\u9023\u8457\u5176\u4ED6\u7269\u7A2E,\u4E00\u500B\u6D88\u5931\u53EF\u80FD\u5F15\u767C\u9023\u9396\u5D29\u584C\u3002\u5E73\u8861\u4E0D\u662F\u975C\u6B62,\u800C\u662F\u52D5\u614B\u7684\u76F8\u4E92\u5236\u8861\u3002\u7406\u89E3\u9019\u5F35\u7DB2,\u5C31\u7406\u89E3\u4E86\u70BA\u4EC0\u9EBC\u4FDD\u8B77\u4E00\u500B\u7269\u7A2E\u7B49\u65BC\u4FDD\u8B77\u6574\u7247\u7CFB\u7D71\u3002 EN: An ecosystem is a web where removing one species can trigger cascading collapse. Balance is dynamic, not static \u2014 protecting one species protects the whole."
  ]
};
const SCI_CODA = "\u{1F9EA} \u79D1\u5B78\u5BB6\u601D\u7DAD:\u79D1\u5B78\u4E0D\u662F\u80CC\u7B54\u6848,\u800C\u662F\u4E00\u5957\u8FFD\u554F\u7684\u65B9\u6CD5\u2014\u2014\u5148\u4ED4\u7D30\u89C0\u5BDF\u73FE\u8C61,\u63D0\u51FA\u731C\u6E2C,\u518D\u60F3\u8FA6\u6CD5\u52D5\u624B\u9A57\u8B49\u3002\u9047\u5230\u300C\u70BA\u4EC0\u9EBC\u300D,\u5225\u6025\u8457\u67E5\u7B54\u6848,\u5148\u81EA\u5DF1\u63A8\u7406\u4E00\u904D:\u6211\u770B\u5230\u7684\u8B49\u64DA\u662F\u4EC0\u9EBC?\u9019\u500B\u63A8\u8AD6\u5408\u4E0D\u5408\u7406?\u6709\u6C92\u6709\u53CD\u4F8B\u53EF\u4EE5\u63A8\u7FFB\u5B83?\u80FD\u990A\u6210\u9019\u6A23\u601D\u8003\u7FD2\u6163\u7684\u4EBA,\u4E0D\u7BA1\u8D70\u5230\u54EA\u88E1\u3001\u9762\u5C0D\u4EC0\u9EBC\u65B0\u554F\u984C,\u90FD\u80FD\u4E00\u5C64\u5C64\u525D\u958B\u8868\u8C61\u3001\u770B\u7A7F\u4E8B\u7269\u80CC\u5F8C\u771F\u6B63\u7684\u9053\u7406\u3002 EN: Science is not memorizing answers but a method of questioning: observe carefully, guess, then test by doing. Before looking up why, reason it out yourself \u2014 what is the evidence, is the inference sound, are there counterexamples? This habit lets you see through appearances anywhere.";
function genSci(level, n) {
  const units = SCI[level] || [];
  const bank = units.flatMap((u, ui) => u.qs.map((q, qi) => ({
    ...q,
    fp: `s:${level}:${ui}:${qi}`,
    why: enrichWhy(q.why, [(SCI_LORE[level] || [])[ui]].filter(Boolean), SCI_CODA)
  })));
  return shuffle(bank).slice(0, Math.min(n, bank.length));
}
const KEY = "logic-lab-v1";
const DEFAULT = {
  xp: 0,
  totalXp: 0,
  seals: [],
  streak: 0,
  lastDay: "",
  pets: [],
  activePet: null,
  petData: {},
  best: { match: null, storm: 0, defense: 0 },
  farm: { coins: 0, seeds: 0, plots: [], harvested: 0 },
  subjects: { hanzi: { level: 1 }, math: { level: 1 }, science: { level: 3 } },
  engHints: true,
  lastBackup: "",
  ledger: { v: 1, items: {}, days: {}, recent: {} }
};
function migrateSave(raw) {
  const s = { ...DEFAULT, ...raw || {} };
  s.best = { ...DEFAULT.best, ...(raw || {}).best || {} };
  s.farm = { ...DEFAULT.farm, ...(raw || {}).farm || {} };
  s.subjects = {
    hanzi: { ...DEFAULT.subjects.hanzi, ...((raw || {}).subjects || {}).hanzi || {} },
    math: { ...DEFAULT.subjects.math, ...((raw || {}).subjects || {}).math || {} },
    science: { ...DEFAULT.subjects.science, ...((raw || {}).subjects || {}).science || {} }
  };
  s.ledger = { ...DEFAULT.ledger, ...(raw || {}).ledger || {} };
  s.ledger.items = s.ledger.items || {};
  s.ledger.days = s.ledger.days || {};
  s.ledger.recent = s.ledger.recent || {};
  return s;
}
function load() {
  try {
    return migrateSave(JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {
    return migrateSave({});
  }
}
function save(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
function localDay(date = /* @__PURE__ */ new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const today = () => localDay();
function dayBefore(offset = 1) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - offset);
  return localDay(date);
}
function needsReview(item) {
  return typeof item.lastOk === "boolean" ? !item.lastOk : !!(item.lw && (!item.lc || item.lw > item.lc));
}
function recordLedger(s, subject, results) {
  if (!s.ledger || typeof s.ledger !== "object") s.ledger = { v: 1, items: {}, days: {}, recent: {} };
  const L = s.ledger;
  L.items = L.items || {};
  L.days = L.days || {};
  L.recent = L.recent || {};
  const t = today();
  const d = L.days[t] || (L.days[t] = {});
  const cell = d[subject] || (d[subject] = [0, 0]);
  const r = L.recent[subject] || (L.recent[subject] = []);
  for (const x of results || []) {
    if (!x || !x.fp) continue;
    const it = L.items[x.fp] || (L.items[x.fp] = { s: subject, ok: 0, no: 0, lw: "", lc: "" });
    if (x.ok) {
      it.ok += 1;
      it.lc = t;
    } else {
      it.no += 1;
      it.lw = t;
    }
    it.lastOk = !!x.ok;
    if (subject === "hanzi" && x.character && Object.hasOwn(HANZI_SKILLS, x.skill)) {
      L.skills = L.skills || {};
      const key = `${x.character}:${x.skill}`;
      const detail = L.skills[key] || (L.skills[key] = { character: x.character, skill: x.skill, ok: 0, no: 0 });
      detail[x.ok ? "ok" : "no"] += 1;
      detail.lastOk = !!x.ok;
      detail.day = t;
    }
    cell[0] += 1;
    cell[1] += x.ok ? 1 : 0;
    r.push(x.ok ? 1 : 0);
    if (r.length > 10) r.shift();
  }
}
function ledgerStats(state) {
  const L = state.ledger || {};
  let q = 0, ok = 0, rivals = 0;
  const lit = /* @__PURE__ */ new Set();
  for (const fp in L.items || {}) {
    const it = L.items[fp];
    q += it.ok + it.no;
    ok += it.ok;
    if (fp.startsWith("h:") && it.ok > 0 && ALL_CHARS.some((ch) => ch.c === fp.slice(2))) lit.add(fp.slice(2));
    if (needsReview(it)) rivals += 1;
  }
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const ds = dayBefore(i);
    const rec = (L.days || {})[ds] || {};
    let a = 0, c = 0;
    for (const k in rec) {
      a += rec[k][0] || 0;
      c += rec[k][1] || 0;
    }
    days.push({ d: ds, a, c });
  }
  return { q, ok, lit: lit.size, rivals, days };
}
function mathProgress(state) {
  const L = state.ledger && state.ledger.items || {};
  const recent = (((state.ledger || {}).recent || {}).math || []).slice(-10);
  const rows = [];
  let q = 0, ok = 0, mastered = 0, practice = 0, rivals = 0, oldRivals = 0;
  const t = today();
  for (const fp in L) {
    if (!fp.startsWith("m:")) continue;
    const it = L[fp] || {};
    const total = (it.ok || 0) + (it.no || 0);
    if (!total) continue;
    const parts = fp.split(":");
    const lv = Number(parts[1]), idx = Number(parts[2]);
    const topic = (MATH_TOPICS[lv] || [])[idx] || `L${lv} \u984C\u578B ${idx + 1}`;
    const acc = Math.round((it.ok || 0) / total * 100);
    const rival = needsReview(it);
    const age = it.lw ? Math.floor((new Date(t) - new Date(it.lw)) / 864e5) : 0;
    q += total;
    ok += it.ok || 0;
    if ((it.ok || 0) >= 3 && acc >= 80 && !rival) mastered += 1;
    if (total > 0 && ((it.ok || 0) < 3 || acc < 80)) practice += 1;
    if (rival) {
      rivals += 1;
      if (age >= 3) oldRivals += 1;
    }
    rows.push({ fp, lv, idx, topic, total, ok: it.ok || 0, no: it.no || 0, acc, rival, age, lw: it.lw || "", lc: it.lc || "" });
  }
  rows.sort((a, b) => {
    if (a.rival !== b.rival) return a.rival ? -1 : 1;
    if (a.lv !== b.lv) return b.lv - a.lv;
    return a.acc - b.acc;
  });
  const recentAcc = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length * 100) : null;
  return { q, ok, acc: q ? Math.round(ok / q * 100) : 0, mastered, practice, rivals, oldRivals, recent, recentAcc, rows };
}
function recommendedMathLevel(state) {
  const lv = state.subjects && state.subjects.math ? state.subjects.math.level : 1;
  const mp = mathProgress(state);
  if (mp.recent.length < 8) return { level: lv, reason: "\u518D\u5B8C\u6210\u4E00\u4E9B\u984C\u76EE\u5F8C,\u7CFB\u7D71\u6703\u4F9D\u6700\u8FD1 10 \u984C\u5EFA\u8B70\u7B49\u7D1A\u3002" };
  if (mp.recentAcc >= 90 && lv < 6) return { level: lv + 1, reason: "\u6700\u8FD1 10 \u984C\u5E7E\u4E4E\u5168\u5C0D,\u53EF\u4EE5\u4E0A\u63A2\u4E00\u7D1A\u3002" };
  if (mp.recentAcc <= 40 && lv > 1) return { level: lv - 1, reason: "\u6700\u8FD1\u984C\u76EE\u6709\u9EDE\u5403\u529B,\u5148\u964D\u4E00\u7D1A\u88DC\u7A69\u5730\u57FA\u3002" };
  return { level: lv, reason: "\u76EE\u524D\u96E3\u5EA6\u525B\u597D,\u7E7C\u7E8C\u5728\u9019\u4E00\u7D1A\u7D2F\u7A4D\u638C\u63E1\u5EA6\u3002" };
}
function adaptMathLevel(s) {
  const r = recommendedMathLevel(s);
  if (!s.subjects.math) s.subjects.math = { level: 1 };
  if (r.level !== s.subjects.math.level) s.subjects.math.level = r.level;
}
const SUBJECTS = {
  hanzi: {
    name: "\u6F22\u5B57\u89E3\u78BC",
    glyph: "\u5B57",
    color: "var(--cinnabar)",
    bg: "var(--cinnabar-bg)",
    desc: "\u5F9E\u53F0\u7063\u5C0F\u5B78\u5E38\u898B\u7684\u4E00\u5343\u5B57\u51FA\u767C\uFF0C\u7528\u751F\u6D3B\u4F8B\u8A5E\u7DF4\u7FD2\u8B80\u97F3\u3001\u8A8D\u5B57\u8207\u90E8\u9996\u3002"
  },
  math: {
    name: "\u6578\u5B78\u5F15\u64CE",
    glyph: "\u6578",
    color: "var(--cobalt)",
    bg: "var(--cobalt-bg)",
    desc: "\u984C\u76EE\u7531\u7A0B\u5F0F\u5373\u6642\u751F\u6210,\u6C38\u9060\u4E0D\u91CD\u8907\u3002\u6BCF\u984C\u90FD\u9644\u300C\u70BA\u4EC0\u9EBC\u300D,\u62C6\u7D66\u4F60\u770B\u80CC\u5F8C\u7684\u898F\u5247\u3002"
  },
  science: {
    name: "\u81EA\u7136\u5075\u63A2",
    glyph: "\u7406",
    color: "var(--moss)",
    bg: "var(--moss-bg)",
    desc: "\u4E0D\u80CC\u6A19\u6E96\u7B54\u6848,\u800C\u662F\u50CF\u5075\u63A2\u4E00\u6A23:\u5F9E\u8B49\u64DA\u63A8\u7406\u51FA\u4E16\u754C\u904B\u4F5C\u7684\u898F\u5247\u3002"
  }
};
const ALL_CHARS = Object.values(HANZI).flat().flatMap((g) => g.chars.map((ch) => ({ ...ch, f: g.f, fe: g.fe, rule: g.rule, re: g.re })));
const BUILD_INFO = (typeof CONTENT_VERSION !== "undefined" ? CONTENT_VERSION : "\u26A0 \u820A\u7248 data.js(\u8ACB\u66F4\u65B0\u5F8C\u5F37\u5236\u91CD\u65B0\u6574\u7406)") + ` | \u5404\u7D1A\u5B57\u6578 ${[1, 2, 3, 4, 5, 6].map((n) => "L" + n + ":" + (HANZI[n] || []).reduce((s, g) => s + g.chars.length, 0)).join(" ")}`;
console.log("[Logic Lab]", BUILD_INFO);
function App() {
  const [state, setState] = useState(load);
  const [hanziPosition, setHanziPosition] = useState({});
  const [view, setView] = useState({ page: "home" });
  useEffect(() => save(state), [state]);
  const up = (fn) => setState((s) => {
    const n = structuredClone(s);
    fn(n);
    return n;
  });
  const finishSprint = (subject, score, total, results, sealCh) => {
    up((s) => {
      recordLedger(s, subject, results);
      if (subject === "math") adaptMathLevel(s);
      s.xp += score * 10;
      s.totalXp = (s.totalXp || 0) + score * 10;
      const t = today();
      if (s.lastDay !== t) {
        const y = dayBefore();
        s.streak = s.lastDay === y ? s.streak + 1 : 1;
        s.lastDay = t;
      }
      if (score === total) {
        s.seals.push({ ch: sealCh, subject, date: t });
      }
      if (s.activePet) {
        s.petData = s.petData || {};
        const pd = s.petData[s.activePet] || (s.petData[s.activePet] = { lv: 1, bond: 0, sprints: 0 });
        pd.bond += score * 2;
        pd.sprints += 1;
        while (pd.lv < 5 && pd.bond >= pd.lv * 25) {
          pd.bond -= pd.lv * 25;
          pd.lv += 1;
        }
      }
    });
  };
  const actions = {
    spend: (c) => {
      if (state.xp < c) return false;
      up((s) => {
        s.xp -= c;
      });
      return true;
    },
    unlockPet: (p) => {
      if (state.xp < p.cost || state.pets.includes(p.id)) return;
      up((s) => {
        s.xp -= p.cost;
        s.pets.push(p.id);
        s.activePet = p.id;
      });
    },
    setPet: (id) => up((s) => {
      s.activePet = id;
    }),
    bestMatch: (m) => up((s) => {
      if (!s.best.match || m < s.best.match) s.best.match = m;
    }),
    bestStorm: (v) => up((s) => {
      if (v > (s.best.storm || 0)) s.best.storm = v;
    }),
    bestDefense: (v) => up((s) => {
      if (v > (s.best.defense || 0)) s.best.defense = v;
    }),
    farmUpdate: (fn) => up((s) => {
      fn(s.farm);
    })
  };
  const activePet = PETS.find((p) => p.id === state.activePet) || null;
  const now = /* @__PURE__ */ new Date();
  const dayIndex = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const dayChar = ALL_CHARS[dayIndex % ALL_CHARS.length];
  const needBackup = (state.totalXp || 0) >= 100 && (!state.lastBackup || Date.now() - new Date(state.lastBackup).getTime() > 14 * 864e5);
  return /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement("div", { className: "logo", onClick: () => setView({ page: "home" }) }, /* @__PURE__ */ React.createElement("div", { className: "logo-seal kai" }, "\u908F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Logic Lab"), /* @__PURE__ */ React.createElement("small", null, "\u908F\u8F2F\u4EFB\u52D9\u57FA\u5730"))), /* @__PURE__ */ React.createElement("div", { className: "hud" }, /* @__PURE__ */ React.createElement("div", { className: "chip" }, "\u{1F525} \u9023\u7E8C ", /* @__PURE__ */ React.createElement("b", { className: "num" }, state.streak), " \u5929"), /* @__PURE__ */ React.createElement("div", { className: "chip" }, "\u26A1 ", /* @__PURE__ */ React.createElement("b", { className: "num" }, state.xp), " XP"), /* @__PURE__ */ React.createElement("div", { className: "chip", style: { cursor: "pointer" }, onClick: () => setView({ page: "play" }) }, activePet ? activePet.emoji : "\u{1F3AE}", " \u904A\u6A02\u5712"), /* @__PURE__ */ React.createElement("div", { className: "chip", style: { cursor: "pointer" }, onClick: () => setView({ page: "progress" }) }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--cinnabar)" } }, "\u5370"), " ", /* @__PURE__ */ React.createElement("b", { className: "num" }, state.seals.length)), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `chip toggle ${state.engHints ? "on" : ""}`,
      onClick: () => up((s) => {
        s.engHints = !s.engHints;
      })
    },
    "EN ",
    state.engHints ? "ON" : "OFF"
  ))), view.page === "home" && /* @__PURE__ */ React.createElement(
    Home,
    {
      state,
      dayChar,
      activePet,
      openSubject: (k) => setView({ page: "subject", key: k }),
      openPlay: () => setView({ page: "play" })
    }
  ), view.page === "subject" && /* @__PURE__ */ React.createElement(
    SubjectPage,
    {
      k: view.key,
      state,
      hanziPosition,
      setHanziPosition,
      setLevel: (k, lv) => up((s) => {
        s.subjects[k].level = lv;
      }),
      startSprint: (qs) => setView({ page: "sprint", key: view.key, qs }),
      goHome: () => setView({ page: "home" })
    }
  ), view.page === "sprint" && /* @__PURE__ */ React.createElement(
    Sprint,
    {
      k: view.key,
      qs: view.qs,
      eng: state.engHints,
      pet: activePet,
      onDone: (score, results, sealCh) => finishSprint(view.key, score, view.qs.length, results, sealCh),
      exit: () => setView({ page: "subject", key: view.key })
    }
  ), view.page === "play" && /* @__PURE__ */ React.createElement(PlayPage, { state, actions, goHome: () => setView({ page: "home" }) }), view.page === "progress" && /* @__PURE__ */ React.createElement(
    ProgressPage,
    {
      state,
      goHome: () => setView({ page: "home" }),
      importSave: (s) => setState(migrateSave(s)),
      markBackup: () => up((s) => {
        s.lastBackup = (/* @__PURE__ */ new Date()).toISOString();
      })
    }
  ), needBackup && view.page !== "progress" && /* @__PURE__ */ React.createElement("div", { className: "backup-hint", onClick: () => setView({ page: "progress" }) }, "\u{1F4BE} ", state.lastBackup ? "\u8DDD\u96E2\u4E0A\u6B21\u5099\u4EFD\u8D85\u904E\u5169\u9031" : "\u4F60\u7684\u9032\u5EA6\u9084\u6C92\u5099\u4EFD\u904E", "\u2500\u2500\u9EDE\u6211\u6253\u958B\u300C\u8CC7\u6599\u4FDD\u96AA\u7BB1\u300D\u4FDD\u5B58\u9032\u5EA6 / Tap to back up your progress"), /* @__PURE__ */ React.createElement("footer", { className: "foot" }, BUILD_INFO));
}
function Home({ state, dayChar, activePet, openSubject, openPlay }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "hero" }, /* @__PURE__ */ React.createElement("div", { className: "hero-char kai" }, dayChar.c), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, "\u4ECA\u65E5\u4E4B\u5B57 \xB7 CHARACTER OF THE DAY"), /* @__PURE__ */ React.createElement("div", { className: "hero-logic" }, /* @__PURE__ */ React.createElement("span", { className: "kai" }, dayChar.c), " \u2500\u2500 \u4F8B\u8A5E\uFF1A", dayChar.w, "\uFF08", dayChar.wzy, "\uFF09"), /* @__PURE__ */ React.createElement("div", { className: "hero-en" }, dayChar.zh), state.engHints && /* @__PURE__ */ React.createElement("div", { className: "hero-en" }, dayChar.we))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, Object.entries(SUBJECTS).map(([k, s]) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: k,
      className: "subj",
      style: { "--sc": s.color, "--sc-bg": s.bg },
      onClick: () => openSubject(k)
    },
    /* @__PURE__ */ React.createElement("div", { className: "glyph kai" }, s.glyph),
    /* @__PURE__ */ React.createElement("h2", null, s.name),
    /* @__PURE__ */ React.createElement("p", { className: "desc" }, s.desc),
    /* @__PURE__ */ React.createElement("span", { className: "lvl" }, "\u6311\u6230\u7B49\u7D1A L", state.subjects[k].level)
  ))), /* @__PURE__ */ React.createElement("div", { className: "playbar", onClick: openPlay }, /* @__PURE__ */ React.createElement("span", { className: "pbe" }, activePet ? activePet.emoji : "\u{1F95A}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u795E\u7378\u904A\u6A02\u5712 Beast Arcade"), /* @__PURE__ */ React.createElement("small", null, "\u7528 XP \u89E3\u9396\u795E\u7378\u5925\u4F34\u3001\u6311\u6230\u5C0F\u904A\u6232 / Spend XP to unlock beast companions and play mini games \u2192"))), /* @__PURE__ */ React.createElement("p", { className: "note", style: { marginTop: 18 } }, "\u4E09\u500B\u79D1\u76EE\u7684\u7B49\u7D1A\u5404\u81EA\u7368\u7ACB\u2500\u2500\u64C5\u9577\u7684\u79D1\u76EE\u76F4\u63A5\u5F80\u4E0A\u8DF3\u7D1A,\u4E0D\u5FC5\u7B49\u5176\u4ED6\u79D1\u76EE\u3002 / Each subject levels up independently \u2014 race ahead where you are strong."));
}
function SubjectPage({ k, state, setLevel, startSprint, goHome, hanziPosition, setHanziPosition }) {
  const s = SUBJECTS[k];
  const lv = state.subjects[k].level;
  const gen = { hanzi: genHanzi, math: genMath, science: genSci }[k];
  const hasContent = k === "math" || (k === "hanzi" ? (HANZI[lv] || []).length > 0 : (SCI[lv] || []).length > 0);
  return /* @__PURE__ */ React.createElement("div", { style: { "--ac": s.color, "--ac-bg": s.bg } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: goHome }, "\u2190 \u56DE\u57FA\u5730"), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, s.name), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-soft)", fontSize: 14 } }, k === "math" ? "\u984C\u76EE\u5373\u6642\u751F\u6210" : "\u5167\u5BB9\u53EF\u6301\u7E8C\u64F4\u5145")), /* @__PURE__ */ React.createElement("div", { className: "lvl-row" }, [1, 2, 3, 4, 5, 6].map((n) => {
    const cnt = k === "hanzi" ? (HANZI[n] || []).reduce((s2, g) => s2 + g.chars.length, 0) : k === "science" ? (SCI[n] || []).length : null;
    const empty = cnt === 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: n,
        className: `lvl-pill ${lv === n ? "on" : ""} ${empty ? "off" : ""}`,
        onClick: () => setLevel(k, n)
      },
      "L",
      n,
      cnt !== null && /* @__PURE__ */ React.createElement("span", { className: "cnt" }, empty ? "\u5099\u7F6E\u4E2D" : cnt + (k === "hanzi" ? " \u5B57" : " \u55AE\u5143"))
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "mode-row" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn solid",
      disabled: !hasContent,
      onClick: () => {
        const qs = gen(lv, 5);
        if (qs.length) startSprint(qs);
      }
    },
    "\u26A1 \u958B\u59CB\u885D\u523A(5 \u984C)"
  )), k === "hanzi" && /* @__PURE__ */ React.createElement("section", { className: "fam" }, /* @__PURE__ */ React.createElement("h3", null, "\u6309\u80FD\u529B\u8907\u7FD2\u672C\u7D1A\u932F\u984C"), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u65B0\u5B8C\u6210\u7684\u7DF4\u7FD2\u6703\u5206\u5225\u8A18\u9304\u56DB\u7A2E\u80FD\u529B\u3002\u820A\u7D00\u9304\u6C92\u6709\u984C\u578B\u8CC7\u8A0A\uFF0C\u4E0D\u6703\u63A8\u6E2C\u5206\u985E\uFF1B\u540C\u4E00\u80FD\u529B\u518D\u6B21\u7B54\u5C0D\u5F8C\u79FB\u51FA\u5F85\u8907\u7FD2\u3002"), /* @__PURE__ */ React.createElement("div", { className: "mode-row" }, Object.entries(HANZI_SKILLS).map(([skill, label]) => {
    const targets = hanziReview(state, lv, skill);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: skill,
        className: "btn ghost",
        disabled: !targets.length,
        onClick: () => {
          const batch = shuffle(targets).slice(0, 5);
          startSprint(genHanzi(lv, batch.length, null, batch));
        }
      },
      label,
      " \xB7 ",
      targets.length,
      " \u5B57\u5F85\u8907\u7FD2"
    );
  }))), k === "hanzi" && /* @__PURE__ */ React.createElement(
    HanziLearn,
    {
      key: lv,
      position: hanziPosition[lv] || { pack: 0, query: "" },
      setPosition: (fn) => setHanziPosition((prev) => ({ ...prev, [lv]: fn(prev[lv] || { pack: 0, query: "" }) })),
      groups: HANZI[lv] || [],
      eng: state.engHints,
      practice: (name) => startSprint(genHanzi(lv, 5, name))
    }
  ), k === "science" && /* @__PURE__ */ React.createElement(SciLearn, { units: SCI[lv] || [] }), k === "math" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(MathLearn, { state, level: lv, startSprint })), !hasContent && k === "science" && /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u9019\u4E00\u7D1A\u7684\u5167\u5BB9\u9084\u6C92\u653E\u9032\u8CC7\u6599\u5EAB\u3002\u6253\u958B\u6A94\u6848\u88E1\u7684 HANZI / SCI \u8CC7\u6599\u5340,\u7167\u540C\u6A23\u683C\u5F0F\u52A0\u5165\u5373\u53EF\u3002"));
}
function MathLearn({ state, level, startSprint }) {
  const mp = mathProgress(state);
  const rec = recommendedMathLevel(state);
  const rivalRows = mp.rows.filter((r) => r.rival);
  const old = rivalRows.filter((r) => r.age >= 3);
  const revengeRows = old.length ? old : rivalRows;
  const startRevenge = () => {
    const qs = genMathRevenge(revengeRows.map((r) => r.fp), 5);
    if (qs.length) startSprint(qs);
  };
  const levelTopics = (MATH_TOPICS[level] || []).map((topic, i) => {
    const fp = `m:${level}:${i}`;
    const row = mp.rows.find((r) => r.fp === fp);
    return { topic, fp, row };
  });
  const bands = [
    { k: "core", name: "\u8AB2\u7DB1\u6838\u5FC3 Core", items: levelTopics.filter((x) => !x.topic.includes("\u{1F3C6}") && !x.topic.includes("\u{1F4D0}")) },
    { k: "olympiad", name: "\u5967\u6578\u63A8\u7406 Olympiad", items: levelTopics.filter((x) => x.topic.includes("\u{1F3C6}")) },
    { k: "geo", name: "\u5E7E\u4F55\u5716\u5F62 Geometry", items: levelTopics.filter((x) => x.topic.includes("\u{1F4D0}")) }
  ];
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mathdash" }, /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.q), /* @__PURE__ */ React.createElement("span", null, "\u6578\u5B78\u7B54\u984C \xB7 Math answered")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.q ? mp.acc + "%" : "\u2014"), /* @__PURE__ */ React.createElement("span", null, "\u7E3D\u6B63\u78BA\u7387 \xB7 Accuracy")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.recentAcc === null ? "\u2014" : mp.recentAcc + "%"), /* @__PURE__ */ React.createElement("span", null, "\u6700\u8FD1 10 \u984C \xB7 Recent 10")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.mastered), /* @__PURE__ */ React.createElement("span", null, "\u638C\u63E1\u984C\u578B \xB7 Mastered"))), /* @__PURE__ */ React.createElement("div", { className: "mathcoach" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u96E3\u5EA6\u5C0E\u822A \xB7 Difficulty Pilot"), /* @__PURE__ */ React.createElement("p", null, "\u76EE\u524D L", level, ";\u5EFA\u8B70 L", rec.level, "\u3002", rec.reason, " / Current L", level, "; suggested L", rec.level, "."), /* @__PURE__ */ React.createElement("div", { className: "recentdots" }, (mp.recent.length ? mp.recent : Array(10).fill(null)).map((x, i) => /* @__PURE__ */ React.createElement("i", { key: i, className: x === null ? "empty" : x ? "ok" : "bad", title: x === null ? "\u5C1A\u7121\u7D00\u9304" : x ? "\u7B54\u5C0D" : "\u7B54\u932F" })))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn ghost",
      disabled: rec.level === level,
      onClick: () => startSprint(genMath(rec.level, 5))
    },
    "\u8A66\u8A66\u5EFA\u8B70\u7B49\u7D1A L",
    rec.level
  )), /* @__PURE__ */ React.createElement("div", { className: "mathcoach revenge" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u932F\u984C\u5FA9\u4EC7\u6230 \xB7 Rival Rematch"), /* @__PURE__ */ React.createElement("p", null, mp.rivals ? `${mp.rivals} \u7A2E\u984C\u578B\u9084\u6C92\u96EA\u6065;${mp.oldRivals} \u7A2E\u5DF2\u8D85\u904E 3 \u5929,\u512A\u5148\u56DE\u4F86\u6311\u6230\u3002` : "\u76EE\u524D\u6C92\u6709\u5BBF\u6575\u3002\u4E0B\u4E00\u6B21\u7B54\u932F\u6642,\u9019\u88E1\u6703\u81EA\u52D5\u7559\u4E0B\u540C\u984C\u578B\u5FA9\u4EC7\u5165\u53E3\u3002", " / Missed math types return here until you beat them.")), /* @__PURE__ */ React.createElement("button", { className: "btn solid", disabled: !revengeRows.length, onClick: startRevenge }, "\u958B\u59CB\u5FA9\u4EC7\u6230")), rivalRows.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "rivalgrid" }, rivalRows.slice(0, 8).map((r) => /* @__PURE__ */ React.createElement("div", { key: r.fp, className: "rivalchip" }, /* @__PURE__ */ React.createElement("b", null, "L", r.lv), /* @__PURE__ */ React.createElement("span", null, r.topic), /* @__PURE__ */ React.createElement("small", null, r.age, " \u5929\u524D\u5931\u624B \xB7 ", r.acc, "%")))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u672C\u7D1A ", (MATH_TOPICS[level] || []).length, " \u7A2E\u984C\u578B,\u984C\u76EE\u5373\u6642\u751F\u6210\u3001\u6C38\u4E0D\u91CD\u8907;\u6BCF\u984C\u7B54\u5B8C\u90FD\u6709\u96D9\u8A9E\u300C\u898F\u5247\u2192\u6B65\u9A5F\u2192\u9A57\u7B97\u2192EN\u300D\u3002 / Fresh generated questions with bilingual reasoning after every answer."), bands.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.k, className: "topicband" }, /* @__PURE__ */ React.createElement("h3", null, b.name), /* @__PURE__ */ React.createElement("div", { className: "topicgrid" }, b.items.map((x) => {
    const r = x.row;
    const cls = r && r.rival ? "rival" : r && r.ok >= 3 && r.acc >= 80 ? "mastered" : r ? "seen" : "";
    return /* @__PURE__ */ React.createElement("div", { key: x.fp, className: `topicchip ${cls}` }, x.topic, r && /* @__PURE__ */ React.createElement("small", null, r.ok, "/", r.total, " \xB7 ", r.acc, "%"));
  })))));
}
function HanziLearn({ groups, eng, practice, position, setPosition }) {
  const { pack, query } = position;
  const setPack = (pack2) => setPosition((p) => ({ ...p, pack: pack2 }));
  const setQuery = (query2) => setPosition((p) => ({ ...p, query: query2 }));
  if (!groups.length) return /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u9019\u4E00\u7D1A\u76EE\u524D\u6C92\u6709\u5B57\u5361\u3002");
  const total = groups.reduce((s, g) => s + g.chars.length, 0);
  const term = query.trim();
  const visible = term ? groups.map((g) => ({ ...g, chars: g.chars.filter((ch) => ch.c.includes(term) || ch.w.includes(term) || ch.radical === term) })).filter((g) => g.chars.length) : [groups[pack]];
  const count = visible.reduce((n, g) => n + g.chars.length, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "hanzi-learn" }, /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u53F0\u7063\u5C0F\u5B78\u5E38\u7528\u4E00\u5343\u5B57 \xB7 \u672C\u7D1A ", total, " \u5B57\u3002", HANZI_META.levelNote), /* @__PURE__ */ React.createElement("div", { className: "hanzi-controls" }, /* @__PURE__ */ React.createElement("label", null, "\u9078\u64C7\u7DF4\u7FD2\u5305", /* @__PURE__ */ React.createElement("select", { value: pack, onChange: (e) => {
    setPack(Number(e.target.value));
    setQuery("");
  } }, groups.map((g, i) => /* @__PURE__ */ React.createElement("option", { key: g.f, value: i }, g.f, "\uFF08", g.chars.length, " \u5B57\uFF09")))), /* @__PURE__ */ React.createElement("label", null, "\u627E\u5B57\u3001\u4F8B\u8A5E\u6216\u90E8\u9996", /* @__PURE__ */ React.createElement("input", { type: "search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u641C\u5C0B\u672C\u7D1A\uFF0C\u4F8B\u5982\uFF1A\u6C34\u3001\u5B78\u6821" }))), term && /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u672C\u7D1A\u627E\u5230 ", count, " \u5B57\u3002\u5176\u4ED6\u7B49\u7D1A\u8ACB\u5207\u63DB\u4E0A\u65B9 L1\u2013L6\u3002"), visible.map((g) => /* @__PURE__ */ React.createElement("section", { key: g.f, className: "fam" }, /* @__PURE__ */ React.createElement("div", { className: "hanzi-pack-head" }, /* @__PURE__ */ React.createElement("h3", null, g.f, /* @__PURE__ */ React.createElement("span", { className: "fam-count num" }, term ? `\u7B26\u5408 ${g.chars.length} \u5B57` : `${g.chars.length} \u5B57`)), /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: () => practice(g.f) }, term ? "\u7DF4\u7FD2\u539F\u6574\u5305\uFF085 \u984C\uFF09" : "\u7DF4\u7FD2\u9019\u4E00\u5305\uFF085 \u984C\uFF09")), /* @__PURE__ */ React.createElement("p", { className: "fam-rule" }, g.rule, eng && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "fam-rule-en" }, g.re))), /* @__PURE__ */ React.createElement("div", { className: "chipgrid" }, g.chars.map((ch) => /* @__PURE__ */ React.createElement("div", { key: ch.c, className: "cchip" }, /* @__PURE__ */ React.createElement("div", { className: "cc kai" }, ch.c), /* @__PURE__ */ React.createElement("div", { className: "cw" }, "\u90E8\u9996\uFF1A", ch.radical, " \xB7 ", ch.strokes, " \u756B"), /* @__PURE__ */ React.createElement("div", { className: "hanzi-word kai" }, ch.w), /* @__PURE__ */ React.createElement("div", { className: "cz" }, ch.wzy), /* @__PURE__ */ React.createElement("div", { className: "hanzi-meaning" }, ch.zh), eng && /* @__PURE__ */ React.createElement("div", { className: "ce" }, ch.we)))))), /* @__PURE__ */ React.createElement("p", { className: "note hanzi-source" }, "\u9078\u5B57\u4F9D\u64DA\uFF1A", /* @__PURE__ */ React.createElement("a", { href: HANZI_META.sourceUrl, target: "_blank", rel: "noreferrer" }, "\u6559\u80B2\u90E8\u570B\u5C0F\u5B78\u7AE5\u5B57\u983B\u8868"), "\u3002 \u8A5E\u7FA9\u6458\u9304\u8207\u6CE8\u97F3\u53C3\u8003\u6559\u80B2\u90E8\u300A\u570B\u8A9E\u8FAD\u5178\u7C21\u7DE8\u672C\u300B\uFF0C\u90E8\u5206\u4F8B\u8A5E\u8AAA\u660E\u7531\u672C\u5C08\u6848\u7DE8\u5BEB\u3002", /* @__PURE__ */ React.createElement("a", { href: "docs/HANZI_SOURCES.md", target: "_blank", rel: "noreferrer" }, "\u5B8C\u6574\u4F86\u6E90\u8207\u6388\u6B0A"), "\u3002"));
}
function SciLearn({ units }) {
  return /* @__PURE__ */ React.createElement("div", { className: "cards" }, units.map((u) => /* @__PURE__ */ React.createElement("div", { key: u.title, className: "lcard" }, /* @__PURE__ */ React.createElement("h3", null, u.title), /* @__PURE__ */ React.createElement("p", { className: "concept" }, u.concept), /* @__PURE__ */ React.createElement("div", { className: "meta", style: { marginTop: 10, fontStyle: "italic" } }, u.en))));
}
function Sprint({ k, qs, eng, pet, onDone, exit }) {
  const s = SUBJECTS[k];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [val, setVal] = useState("");
  const [inputOk, setInputOk] = useState(null);
  const [sealCh] = useState(() => pick(SEAL_CHARS));
  const completedRef = useRef(false);
  const resultsRef = useRef([]);
  const q = qs[idx];
  const numVal = (t) => {
    t = String(t).trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/／/g, "/").replace(/,/g, ".").replace(/\s/g, "");
    if (/^\d+\/\d+$/.test(t)) {
      const [a, b] = t.split("/").map(Number);
      return b ? a / b : NaN;
    }
    return parseFloat(t);
  };
  const submit = () => {
    if (inputOk !== null || val.trim() === "") return;
    const ok = Math.abs(numVal(val) - numVal(q.answer)) < 1e-6;
    resultsRef.current.push({ fp: q.fp, ok: ok ? 1 : 0 });
    setInputOk(ok);
    setPicked(-1);
    if (ok) setScore((v) => v + 1);
  };
  const choose = (i) => {
    if (picked !== null) return;
    resultsRef.current.push({ fp: q.fp, character: q.character, skill: q.skill, ok: i === q.ans ? 1 : 0 });
    setPicked(i);
    if (i === q.ans) setScore((v) => v + 1);
  };
  useEffect(() => {
    if (picked !== null && idx === qs.length - 1 && !completedRef.current) {
      completedRef.current = true;
      onDone(score, resultsRef.current, sealCh);
    }
  }, [picked, idx, score, qs.length, onDone, sealCh]);
  const next = () => {
    if (picked === null) return;
    if (idx + 1 < qs.length) {
      setIdx(idx + 1);
      setPicked(null);
      setVal("");
      setInputOk(null);
    } else {
      setDone(true);
    }
  };
  if (done) return /* @__PURE__ */ React.createElement(ResultView, { k, score, total: qs.length, pet, exit, sealCh });
  return /* @__PURE__ */ React.createElement("div", { className: "sprint", style: { "--ac": s.color } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: exit }, completedRef.current ? "\u2190 \u8FD4\u56DE\u7DF4\u7FD2\uFF08\u5DF2\u8A18\u9304\uFF09" : "\u2190 \u653E\u68C4\u9019\u56DE\u5408"), /* @__PURE__ */ React.createElement("div", { className: "prog" }, qs.map((_, i) => /* @__PURE__ */ React.createElement("i", { key: i, className: i < idx || i === idx && picked !== null ? "done" : "" }))), /* @__PURE__ */ React.createElement("div", { className: "qcard" }, q.fig && /* @__PURE__ */ React.createElement("div", { className: "geobox", dangerouslySetInnerHTML: { __html: q.fig } }), /* @__PURE__ */ React.createElement("div", { className: "qtext", dangerouslySetInnerHTML: { __html: q.q.replace(/「(.)」/g, '\u300C<span class="kai">$1</span>\u300D') } }), eng && q.en && /* @__PURE__ */ React.createElement("div", { className: "qen" }, q.en), q.mode === "input" ? /* @__PURE__ */ React.createElement("div", { className: "fillin" }, /* @__PURE__ */ React.createElement("div", { className: "fillrow" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "fillbox",
      inputMode: q.answer.includes("/") ? "text" : "decimal",
      placeholder: q.answer.includes("/") ? "\u4F8B:3/4(\u4E5F\u53EF\u8F38\u5165\u5C0F\u6578)" : "\u8F38\u5165\u7B54\u6848",
      value: val,
      disabled: inputOk !== null,
      onChange: (e) => setVal(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") submit();
      }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn solid", disabled: inputOk !== null || !val.trim(), onClick: submit }, "\u78BA\u8A8D Go")), inputOk !== null && /* @__PURE__ */ React.createElement("div", { className: `fillresult ${inputOk ? "ok" : "bad"}` }, inputOk ? "\u2714 \u7B54\u5C0D\u4E86!" : /* @__PURE__ */ React.createElement("span", null, "\u2717 \u6B63\u78BA\u7B54\u6848:", /* @__PURE__ */ React.createElement("b", { className: "num" }, q.answer)))) : /* @__PURE__ */ React.createElement("div", { className: "opts" }, q.options.map((o, i) => {
    const isObj = typeof o === "object";
    const label = isObj ? o.t : o;
    const sub = isObj && o.sub && (o.now || picked !== null) ? o.sub : null;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        disabled: picked !== null,
        className: `opt ${picked === null ? "" : i === q.ans ? "ok" : i === picked ? "bad" : ""}`,
        onClick: () => choose(i)
      },
      /* @__PURE__ */ React.createElement("span", { className: q.big ? "kai" : "", style: q.big ? { fontSize: 30 } : null }, label),
      sub && /* @__PURE__ */ React.createElement("span", { className: "osub" }, sub)
    );
  })), picked !== null && /* @__PURE__ */ React.createElement("div", { className: "why" }, Array.isArray(q.why) ? q.why.filter((line) => k !== "hanzi" || eng || !line.startsWith("EN:")).map((line, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: `why-line ${i === 0 ? "why-rule" : ""} ${line.startsWith("EN:") ? "why-en" : ""}` }, line)) : /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "\u70BA\u4EC0\u9EBC:"), q.why)), picked !== null && /* @__PURE__ */ React.createElement("button", { className: "btn solid next", onClick: next }, idx + 1 < qs.length ? "\u4E0B\u4E00\u984C \u2192" : "\u770B\u7D50\u679C")));
}
function ResultView({ k, score, total, pet, exit, sealCh }) {
  const s = SUBJECTS[k];
  const perfect = score === total;
  return /* @__PURE__ */ React.createElement("div", { className: "sprint", style: { "--ac": s.color } }, /* @__PURE__ */ React.createElement("div", { className: "qcard result" }, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, "\u885D\u523A\u5B8C\u6210 \xB7 ", s.name), /* @__PURE__ */ React.createElement("div", { className: "score num" }, score, " / ", total), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--ink-soft)" } }, "+", score * 10, " XP"), perfect && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "seal kai" }, sealCh), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 900, color: "var(--cinnabar)" } }, "\u6EFF\u5206!\u84CB\u4E00\u679A\u5370\u7AE0 \u{1F389}")), !perfect && /* @__PURE__ */ React.createElement("p", { className: "note", style: { marginTop: 14 } }, '\u932F\u7684\u984C\u76EE\u90FD\u9644\u4E86\u300C\u70BA\u4EC0\u9EBC\u300D\u2500\u2500\u908F\u8F2F\u6293\u5230\u4E86,\u4E0B\u4E00\u56DE\u5408\u5C31\u662F\u4F60\u7684\u3002 / Every miss came with a "why" \u2014 catch the logic and the next round is yours.'), pet && /* @__PURE__ */ React.createElement("div", { className: "cheer" }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 38 } }, pet.emoji), " ", pet.name, ":", perfect ? '\u300C\u592A\u795E\u4E86!\u300D / "Legendary!"' : '\u300C\u6253\u5F97\u6F02\u4EAE,\u518D\u4F86\u4E00\u5834!\u300D / "Good fight \u2014 one more!"', /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--ink-soft)", marginTop: 4 } }, "\u2764\uFE0F \u53CB\u60C5 Bond +", score * 2)), /* @__PURE__ */ React.createElement("div", { className: "mode-row", style: { justifyContent: "center", marginTop: 24 } }, /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: exit }, "\u8FD4\u56DE\u9078\u64C7\u7DF4\u7FD2"))));
}
function PlayPage({ state, actions, goHome }) {
  const [mode, setMode] = useState("hub");
  const [poke, setPoke] = useState(false);
  const [bubble, setBubble] = useState("");
  const [hatch, setHatch] = useState(null);
  if (mode === "storm") return /* @__PURE__ */ React.createElement(
    StormGame,
    {
      level: state.subjects.math.level,
      best: state.best.storm,
      onBest: actions.bestStorm,
      exit: () => setMode("hub")
    }
  );
  if (mode === "defense") return /* @__PURE__ */ React.createElement(
    DefenseGame,
    {
      level: state.subjects.math.level,
      best: state.best.defense,
      onBest: actions.bestDefense,
      exit: () => setMode("hub")
    }
  );
  if (mode === "farm") return /* @__PURE__ */ React.createElement(
    FarmGame,
    {
      farm: state.farm,
      hanziLv: state.subjects.hanzi.level,
      mathLv: state.subjects.math.level,
      update: actions.farmUpdate,
      exit: () => setMode("hub")
    }
  );
  const tryPlay = (m) => {
    if (actions.spend(PLAY_COST)) setMode(m);
  };
  return /* @__PURE__ */ React.createElement("div", { style: { "--ac": "var(--cobalt)" } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: goHome }, "\u2190 \u56DE\u57FA\u5730 Back to base"), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u795E\u7378\u904A\u6A02\u5712 ", /* @__PURE__ */ React.createElement("span", { className: "fam-en" }, "Beast Arcade"))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u7528\u885D\u523A\u8CFA\u4F86\u7684 XP \u89E3\u9396\u795E\u7378\u3001\u6311\u6230\u5C0F\u904A\u6232\u3002\u76EE\u524D\u53EF\u7528 \u26A1 ", state.xp, " XP\u3002 / Spend the XP you earned in sprints to unlock beasts and play games."), /* @__PURE__ */ React.createElement("h3", { className: "sec-title" }, "\u{1F3AE} \u5C0F\u904A\u6232 Mini Games(\u6BCF\u5834\u5165\u5834\u8CBB ", PLAY_COST, " XP / ", PLAY_COST, " XP per game)"), /* @__PURE__ */ React.createElement("div", { className: "gamegrid" }, /* @__PURE__ */ React.createElement("div", { className: "gamecard" }, /* @__PURE__ */ React.createElement("div", { className: "ge" }, "\u{1F3F0}"), /* @__PURE__ */ React.createElement("b", null, "\u77E5\u8B58\u5854\u9632 Knowledge Defense"), /* @__PURE__ */ React.createElement("p", null, "\u6575\u4EBA\u4E00\u6CE2\u6CE2\u9032\u653B!\u6BCF\u7B54\u5C0D\u4E00\u984C\u5C31\u767C\u5C04\u7832\u706B,\u5B88\u4F4F\u57FA\u5730\u3002\u7B54\u932F\u6575\u4EBA\u524D\u9032\u3002 / Answer correctly to fire on the invaders; a wrong answer lets them advance."), /* @__PURE__ */ React.createElement("div", { className: "gbest" }, "\u6700\u4F73\u7D00\u9304 Best:\u7B2C ", state.best.defense || 0, " \u6CE2 wave"), /* @__PURE__ */ React.createElement("button", { className: "btn solid", disabled: state.xp < PLAY_COST, onClick: () => tryPlay("defense") }, "\u958B\u59CB Play(\u2212", PLAY_COST, " XP)")), /* @__PURE__ */ React.createElement("div", { className: "gamecard" }, /* @__PURE__ */ React.createElement("div", { className: "ge" }, "\u{1F331}"), /* @__PURE__ */ React.createElement("b", null, "\u908F\u8F2F\u8FB2\u5834 Logic Farm"), /* @__PURE__ */ React.createElement("p", null, "\u7D93\u71DF\u4F60\u7684\u7530\u5730:\u8CB7\u7A2E\u5B50\u2192\u64AD\u7A2E\u2192\u6F86\u6C34\u2192\u7761\u89BA\u904E\u591C\u4F5C\u7269\u624D\u9577\u5927\u2192\u6536\u6210\u518D\u6295\u8CC7\u3002\u7B54\u984C\u5145\u9AD4\u529B,\u9032\u5EA6\u6C38\u4E45\u5B58\u6A94! / Run a real farm: plant, water, sleep to grow, harvest and reinvest. Answers recharge your energy. Auto-saved!"), /* @__PURE__ */ React.createElement("div", { className: "gbest" }, "\u8FB2\u5834\u91D1\u5E63 Coins:", state.farm.coins, " \xB7 \u5DF2\u6536\u6210 ", state.farm.harvested), /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: () => setMode("farm") }, "\u9032\u5165\u8FB2\u5834 Enter(\u514D\u8CBB free)")), /* @__PURE__ */ React.createElement("div", { className: "gamecard" }, /* @__PURE__ */ React.createElement("div", { className: "ge" }, "\u26A1"), /* @__PURE__ */ React.createElement("b", null, "\u901F\u7B97\u98A8\u66B4 Math Storm"), /* @__PURE__ */ React.createElement("p", null, "45 \u79D2\u9023\u7E8C\u7B54\u984C,\u8166\u901F\u6975\u9650\u6E2C\u8A66,\u984C\u76EE\u8DDF\u8457\u4F60\u7684\u6578\u5B78\u7B49\u7D1A\u8B8A\u96E3\u3002 / 45 seconds of rapid-fire math at your current level."), /* @__PURE__ */ React.createElement("div", { className: "gbest" }, "\u6700\u4F73\u7D00\u9304 Best:", state.best.storm || 0, " \u984C solved"), /* @__PURE__ */ React.createElement("button", { className: "btn solid", disabled: state.xp < PLAY_COST, onClick: () => tryPlay("storm") }, "\u958B\u59CB Play(\u2212", PLAY_COST, " XP)"))), /* @__PURE__ */ React.createElement("h3", { className: "sec-title" }, "\u{1F43E} \u795E\u7378\u8056\u6BBF Beast Shrine(", state.pets.length, "/", PETS.length, ")"), (() => {
    const ap = PETS.find((p) => p.id === state.activePet);
    if (!ap) return /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u8056\u6BBF\u7A7A\u8457\u2014\u2014\u5230\u4E0B\u65B9\u5716\u9451\u5B75\u5316\u4F60\u7684\u7B2C\u4E00\u9846\u795E\u7378\u86CB! / The shrine is empty. Hatch your first beast egg below!");
    const pd = state.petData && state.petData[ap.id] || { lv: 1, bond: 0, sprints: 0 };
    const need = pd.lv * 25;
    const TITLES = { 1: "\u5E7C\u7378 Cub", 2: "\u6210\u9577 Youth", 3: "\u89BA\u9192 Awakened", 4: "\u795E\u5A01 Mighty", 5: "\u50B3\u8AAA Legend" };
    return /* @__PURE__ */ React.createElement("div", { className: "shrine" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `shrinePet lv${pd.lv} ${poke ? "poked" : ""}`,
        onClick: () => {
          setPoke(true);
          setTimeout(() => setPoke(false), 450);
          const lines = ["{n}:\u300C\u4ECA\u5929\u60F3\u6311\u6230\u54EA\u4E00\u79D1?\u300D / Which subject shall we conquer?", "{n}:\u300C\u6211\u770B\u597D\u4F60!\u300D / I believe in you!", "{n}:\u300C\u518D\u4E00\u5834\u885D\u523A,\u6211\u7684\u529B\u91CF\u5C31\u66F4\u5F37\u4E86!\u300D / One more sprint and I grow stronger!", "{n}:\u300C\u908F\u8F2F\u5C31\u662F\u6211\u5011\u7684\u6B66\u5668\u3002\u300D / Logic is our weapon.", "{n}:\u300C\u547C\u5695\u5695\u2026\u300D / Purrrr\u2026"];
          setBubble(pick(lines).replace("{n}", ap.name));
          setTimeout(() => setBubble(""), 2e3);
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "shrineEmoji" }, ap.emoji),
      bubble && /* @__PURE__ */ React.createElement("div", { className: "bubble" }, bubble)
    ), /* @__PURE__ */ React.createElement("div", { className: "shrineInfo" }, /* @__PURE__ */ React.createElement("b", null, ap.name, " ", /* @__PURE__ */ React.createElement("span", { className: "fam-en" }, ap.ne), " ", /* @__PURE__ */ React.createElement("span", { className: "lvtag" }, "Lv", pd.lv, " \xB7 ", TITLES[pd.lv])), pd.lv < 5 ? /* @__PURE__ */ React.createElement("div", { className: "bondbar" }, /* @__PURE__ */ React.createElement("i", { style: { width: Math.min(100, pd.bond / need * 100) + "%" } })) : /* @__PURE__ */ React.createElement("div", { className: "bondbar max" }, /* @__PURE__ */ React.createElement("i", { style: { width: "100%" } })), /* @__PURE__ */ React.createElement("small", null, "\u2764\uFE0F \u53CB\u60C5 ", pd.lv < 5 ? `${pd.bond}/${need}` : "MAX", "(\u5E36\u8457\u7260\u5B8C\u6210\u885D\u523A\u5C31\u6703\u6210\u9577)\xB7 \u4E00\u8D77\u885D\u523A ", pd.sprints, " \u56DE"), /* @__PURE__ */ React.createElement("small", { className: "plore", style: { minHeight: 0 } }, ap.lore), /* @__PURE__ */ React.createElement("small", { style: { color: "var(--ink-soft)" } }, "\u{1F446} \u9EDE\u7260\u4E00\u4E0B\u8A66\u8A66 / Tap the beast!")));
  })(), /* @__PURE__ */ React.createElement("div", { className: "petgrid" }, PETS.map((p) => {
    const owned = state.pets.includes(p.id);
    const active = state.activePet === p.id;
    const pd = state.petData && state.petData[p.id] || { lv: 1 };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: p.id,
        className: `petcard ${owned ? "" : "locked"} ${active ? "active" : ""}`,
        onClick: () => {
          if (owned) actions.setPet(p.id);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: `pe ${owned ? "" : "shadow"}` }, owned ? p.emoji : "\u2753"),
      /* @__PURE__ */ React.createElement("b", null, owned ? p.name : "???", " ", /* @__PURE__ */ React.createElement("span", { className: "fam-en" }, owned ? p.ne : "")),
      owned && /* @__PURE__ */ React.createElement("div", { className: "lvstars" }, "\u2B50".repeat(pd.lv)),
      /* @__PURE__ */ React.createElement("p", { className: "plore" }, owned ? p.lore : "\u5C1A\u672A\u5B75\u5316\u7684\u795E\u7378\u86CB\u2026\u5B8C\u6210\u885D\u523A\u8CFA XP \u4F86\u5B75\u5316\u7260\u3002 / An unhatched egg\u2026 earn XP in sprints to hatch it."),
      owned ? /* @__PURE__ */ React.createElement("span", { className: "ptag" }, active ? "\u5925\u4F34 Companion \u2713" : "\u9EDE\u64CA\u53EC\u559A Summon") : /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn ghost pbtn",
          disabled: state.xp < p.cost,
          onClick: (e) => {
            e.stopPropagation();
            if (state.xp < p.cost) return;
            actions.unlockPet(p);
            setHatch({ pet: p, stage: 0 });
            setTimeout(() => setHatch((h) => h && { ...h, stage: 1 }), 700);
            setTimeout(() => setHatch((h) => h && { ...h, stage: 2 }), 1500);
            setTimeout(() => setHatch((h) => h && { ...h, stage: 3 }), 2e3);
            setTimeout(() => setHatch(null), 3600);
          }
        },
        "\u{1F95A} \u5B75\u5316 Hatch(\u2212",
        p.cost,
        " XP)"
      )
    );
  })), hatch && /* @__PURE__ */ React.createElement("div", { className: "hatchOverlay" }, /* @__PURE__ */ React.createElement("div", { className: `hatchEgg s${hatch.stage}` }, hatch.stage < 2 ? "\u{1F95A}" : hatch.stage === 2 ? "\u{1F4A5}" : hatch.pet.emoji), hatch.stage === 1 && /* @__PURE__ */ React.createElement("div", { className: "hatchHint" }, "\u5494\u2026\u5494\u5494\u2026 / crack\u2026 crack\u2026"), hatch.stage >= 3 && /* @__PURE__ */ React.createElement("div", { className: "hatchName" }, "\u2728 ", hatch.pet.name, " ", hatch.pet.ne, " \u8A95\u751F!\u5DF2\u6210\u70BA\u4F60\u7684\u5925\u4F34")));
}
function StormGame({ level, best, onBest, exit }) {
  const [t, setT] = useState(45);
  const [q, setQ] = useState(() => pick(MATH_GEN[level])());
  const [score, setScore] = useState(0);
  const over = t <= 0;
  useEffect(() => {
    if (over) {
      onBest(score);
      return;
    }
    const id = setTimeout(() => setT(t - 1), 1e3);
    return () => clearTimeout(id);
  }, [t]);
  const answer = (i) => {
    if (over) return;
    if (i === q.ans) setScore((s) => s + 1);
    setQ(pick(MATH_GEN[level])());
  };
  return /* @__PURE__ */ React.createElement("div", { className: "sprint", style: { "--ac": "var(--cobalt)" } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: exit }, "\u2190 \u56DE\u904A\u6A02\u5712 Back to arcade"), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u901F\u7B97\u98A8\u66B4 Math Storm")), /* @__PURE__ */ React.createElement("div", { className: "stormbar" }, /* @__PURE__ */ React.createElement("span", { className: `stormt num ${t <= 10 ? "low" : ""}` }, "\u23F1 ", t, "s"), /* @__PURE__ */ React.createElement("span", { className: "num", style: { fontWeight: 700 } }, "\u7B54\u5C0D Solved:", score)), !over ? /* @__PURE__ */ React.createElement("div", { className: "qcard" }, /* @__PURE__ */ React.createElement("div", { className: "qtext" }, q.q), /* @__PURE__ */ React.createElement("div", { className: "opts" }, q.options.map((o, i) => /* @__PURE__ */ React.createElement("button", { key: i, className: "opt", onClick: () => answer(i) }, o)))) : /* @__PURE__ */ React.createElement("div", { className: "qcard result" }, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, "\u6642\u9593\u5230 TIME UP"), /* @__PURE__ */ React.createElement("div", { className: "score num" }, score, " \u984C"), /* @__PURE__ */ React.createElement("p", null, score > (best || 0) ? "\u65B0\u7D00\u9304 New record! \u{1F389}" : `\u6700\u4F73\u7D00\u9304 Best:${Math.max(best || 0, score)} \u984C`), /* @__PURE__ */ React.createElement("button", { className: "btn solid", style: { marginTop: 14 }, onClick: exit }, "\u56DE\u904A\u6A02\u5712 Back")));
}
const TD_WAY = [[-3, 22], [38, 22], [38, 52], [12, 52], [12, 80], [60, 80], [60, 40], [85, 40], [85, 106]];
const TD_SEGS = (() => {
  const s = [];
  let acc = 0;
  for (let i = 0; i < TD_WAY.length - 1; i++) {
    const [x1, y1] = TD_WAY[i], [x2, y2] = TD_WAY[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    s.push({ x1, y1, x2, y2, len, acc });
    acc += len;
  }
  return { segs: s, total: acc };
})();
function tdPoint(d) {
  const { segs, total } = TD_SEGS;
  if (d >= total) {
    const l = segs[segs.length - 1];
    return { x: l.x2, y: l.y2 };
  }
  for (const s of segs) {
    if (d <= s.acc + s.len) {
      const t = (d - s.acc) / s.len;
      return { x: s.x1 + (s.x2 - s.x1) * t, y: s.y1 + (s.y2 - s.y1) * t };
    }
  }
  return { x: segs[0].x1, y: segs[0].y1 };
}
const TD_SPOTS = [[22, 34], [52, 30], [24, 64], [46, 66], [70, 58], [72, 26]];
const TD_TOWERS = {
  archer: { emoji: "\u{1F3F9}", name: "\u5F13\u7BAD\u5854", ne: "Archer", cost: 60, range: 20, dmg: 7, rate: 550 },
  ice: { emoji: "\u2744\uFE0F", name: "\u5BD2\u51B0\u5854", ne: "Frost", cost: 80, range: 18, dmg: 3, rate: 700, slow: true },
  mage: { emoji: "\u{1F52E}", name: "\u6CD5\u5E2B\u5854", ne: "Mage", cost: 110, range: 24, dmg: 18, rate: 1200 }
};
const TD_FOES = [
  { emoji: "\u{1F47E}", hp: 16, spd: 21, gold: 4 },
  { emoji: "\u{1F417}", hp: 34, spd: 15, gold: 6 },
  { emoji: "\u{1F6E1}\uFE0F", hp: 70, spd: 10.5, gold: 10 }
];
function tdQueue(w) {
  const n = Math.min(4 + w * 2, 16);
  const q = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random(), t = w < 3 || r < 0.5 ? TD_FOES[0] : r < 0.85 || w < 5 ? TD_FOES[1] : TD_FOES[2];
    q.push({ ...t, hp: Math.round(t.hp * (1 + (w - 1) * 0.35)) });
  }
  if (w % 5 === 0) q.push({ emoji: "\u{1F432}", hp: 100 + 70 * w, spd: 8, gold: 40, big: true });
  return q.map((t) => ({ ...t, max: t.hp }));
}
const TD_SCENES = [
  { name: "\u7FE0\u98A8\u8349\u539F Emerald Plains", cls: "sc0" },
  { name: "\u9EC3\u6C99\u6208\u58C1 Golden Desert", cls: "sc1" },
  { name: "\u971C\u96EA\u51CD\u539F Frost Tundra", cls: "sc2" },
  { name: "\u7194\u5CA9\u706B\u5C71 Magma Peak", cls: "sc3" },
  { name: "\u6C38\u591C\u6697\u57DF Eternal Night", cls: "sc4" }
];
const TD_STORY = {
  1: "\u6DF7\u6C8C\u8ECD\u5718\u5165\u4FB5\u908F\u8F2F\u738B\u570B!\u6307\u63EE\u5B98,\u9019\u88E1\u662F\u6700\u5F8C\u7684\u5821\u58D8\u2014\u2014\u7528\u4F60\u7684\u982D\u8166\u5B88\u4F4F\u5B83\u3002 / The Chaos Legion invades the Logic Kingdom! Commander, this fortress is our last stand.",
  5: "\u5075\u5BDF\u56DE\u5831:\u6575\u8ECD\u7A7F\u8D8A\u9EC3\u6C99\u6208\u58C1\u800C\u4F86,\u9996\u9818\u662F\u4E00\u982D\u539A\u7532\u5DE8\u9F8D\u3002\u6E96\u5099\u8FCE\u63A5\u7B2C\u4E00\u5834\u786C\u4ED7! / Scouts report a desert legion led by an armored dragon. Brace for your first true battle!",
  10: "\u6211\u5011\u88AB\u903C\u9032\u971C\u96EA\u51CD\u539F\u3002\u5BD2\u51B0\u5854\u5728\u9019\u88E1\u5982\u9B5A\u5F97\u6C34\u2014\u2014\u5730\u5229,\u4E5F\u662F\u5175\u6CD5\u7684\u4E00\u90E8\u5206\u3002 / We fall back to the Frost Tundra. Frost towers thrive here \u2014 terrain is strategy too.",
  15: "\u524D\u65B9\u5C31\u662F\u7194\u5CA9\u706B\u5C71,\u6DF7\u6C8C\u8ECD\u5718\u7684\u8001\u5DE2\u3002\u7260\u5011\u6703\u50BE\u5DE2\u800C\u51FA,\u6C7A\u6230\u5C07\u81F3! / Ahead lies Magma Peak, the Legion lair. They will come with everything. The final battle nears!",
  20: "\u6C38\u591C\u6697\u57DF\u2026\u2026\u50B3\u8AAA\u4E2D\u6C92\u6709\u6307\u63EE\u5B98\u6490\u904E\u9019\u88E1\u3002\u4ECA\u665A,\u6211\u5011\u6539\u5BEB\u50B3\u8AAA\u3002 / The Eternal Night\u2026 no commander in legend survived this far. Tonight, we rewrite the legend."
};
function DefenseGame({ level, best, onBest, exit }) {
  const g = useRef(null);
  if (!g.current) g.current = {
    gold: 150,
    lives: 10,
    wave: 1,
    phase: "break",
    breakT: 2600,
    queue: tdQueue(1),
    spawnT: 0,
    foes: [],
    towers: {},
    shots: [],
    pops: [],
    shake: 0,
    over: false,
    reported: false,
    uid: 1,
    paused: false,
    speed: 1,
    story: TD_STORY[1] || null
  };
  const [, setTick] = useState(0);
  const [sel, setSel] = useState(null);
  const genFor = (w) => pick(MATH_GEN[Math.max(1, Math.min(6, level + Math.floor((w - 1) / 4)))])();
  const [q, setQ] = useState(() => genFor(1));
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    const id = setInterval(() => {
      const s2 = g.current;
      if (s2.over || s2.paused || s2.story) return;
      const dt = 80 * s2.speed;
      if (s2.phase === "break") {
        s2.breakT -= dt;
        if (s2.breakT <= 0) s2.phase = "wave";
      } else {
        s2.spawnT -= dt;
        if (s2.queue.length && s2.spawnT <= 0) {
          s2.foes.push({ ...s2.queue.shift(), id: s2.uid++, dist: 0, slow: 0 });
          s2.spawnT = 650;
        }
      }
      for (const f of s2.foes) {
        f.slow = Math.max(0, f.slow - dt);
        f.dist += f.spd * (f.slow > 0 ? 0.5 : 1) * dt / 1e3;
      }
      const leaked = s2.foes.filter((f) => f.dist >= TD_SEGS.total);
      if (leaked.length) {
        s2.lives -= leaked.length;
        s2.shake = 280;
        for (const f of leaked) {
          const p = tdPoint(TD_SEGS.total - 2);
          s2.pops.push({ x: p.x, y: p.y, txt: "\u{1F494}", cls: "hurt", ttl: 900 });
        }
        s2.foes = s2.foes.filter((f) => f.dist < TD_SEGS.total);
        if (s2.lives <= 0) s2.over = true;
      }
      for (const [idx, t] of Object.entries(s2.towers)) {
        t.cd -= dt;
        if (t.cd > 0) continue;
        const spec = TD_TOWERS[t.type];
        const [sx, sy] = TD_SPOTS[idx];
        const range = spec.range + 2 * (t.lvl - 1);
        let tgt = null, td = -1;
        for (const f of s2.foes) {
          const p2 = tdPoint(f.dist);
          if (Math.hypot(p2.x - sx, p2.y - sy) <= range && f.dist > td) {
            tgt = f;
            td = f.dist;
          }
        }
        if (!tgt) continue;
        const p = tdPoint(tgt.dist);
        const dmg = Math.round(spec.dmg * Math.pow(1.65, t.lvl - 1));
        tgt.hp -= dmg;
        if (spec.slow) tgt.slow = 1e3;
        s2.shots.push({ x1: sx, y1: sy, x2: p.x, y2: p.y, ttl: 150, c: t.type });
        s2.pops.push({ x: p.x, y: p.y - 3, txt: "-" + dmg, cls: "dmg", ttl: 600 });
        t.cd = spec.rate;
        if (tgt.hp <= 0) {
          s2.gold += tgt.gold;
          s2.pops.push({ x: p.x, y: p.y, txt: "\u{1F4A5}", cls: "boom", ttl: 500 });
          s2.pops.push({ x: p.x, y: p.y - 6, txt: "+" + tgt.gold + "\u{1FA99}", cls: "gold", ttl: 800 });
          s2.foes = s2.foes.filter((f) => f !== tgt);
        }
      }
      if (s2.phase === "wave" && !s2.queue.length && !s2.foes.length) {
        s2.wave += 1;
        s2.gold += 25;
        s2.phase = "break";
        s2.breakT = 3200;
        s2.queue = tdQueue(s2.wave);
        s2.pops.push({ x: 50, y: 50, txt: "\u6CE2\u6B21\u734E\u52F5 +25\u{1FA99}", cls: "gold", ttl: 1100 });
        if (TD_STORY[s2.wave]) s2.story = TD_STORY[s2.wave];
      }
      s2.shake = Math.max(0, s2.shake - dt);
      s2.shots = s2.shots.filter((e) => (e.ttl -= dt) > 0);
      s2.pops = s2.pops.filter((e) => (e.ttl -= dt) > 0);
      setTick((t) => t + 1);
    }, 80);
    return () => clearInterval(id);
  }, []);
  const s = g.current;
  useEffect(() => {
    if (s.over && !s.reported) {
      s.reported = true;
      onBest(s.wave);
    }
  });
  const answer = (i) => {
    if (picked !== null || s.over) return;
    setPicked(i);
    if (i === q.ans) {
      s.gold += 20;
      s.pops.push({ x: 50, y: 14, txt: "\u9326\u56CA\u8ECD\u8CBB +20\u{1FA99}", cls: "gold", ttl: 900 });
    }
    setTimeout(() => {
      setPicked(null);
      setQ(genFor(s.wave));
    }, i === q.ans ? 350 : 900);
  };
  const build = (type) => {
    const spec = TD_TOWERS[type];
    if (s.gold < spec.cost) return;
    s.gold -= spec.cost;
    s.towers[sel] = { type, lvl: 1, cd: 0 };
    setSel(null);
  };
  const upgrade = () => {
    const t = s.towers[sel];
    const cost = 70 + 50 * t.lvl;
    if (!t || t.lvl >= 3 || s.gold < cost) return;
    s.gold -= cost;
    t.lvl += 1;
    setSel(null);
  };
  return /* @__PURE__ */ React.createElement("div", { style: { "--ac": "var(--cobalt)" } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: exit }, "\u2190 \u56DE\u904A\u6A02\u5712 Back to arcade"), /* @__PURE__ */ React.createElement("div", { className: "tdbar" }, /* @__PURE__ */ React.createElement("span", null, "\u{1FA99} ", /* @__PURE__ */ React.createElement("b", { className: "num" }, s.gold)), /* @__PURE__ */ React.createElement("span", null, "\u2764\uFE0F ", /* @__PURE__ */ React.createElement("b", { className: "num" }, s.lives)), /* @__PURE__ */ React.createElement("span", null, "\u{1F30A} \u7B2C ", /* @__PURE__ */ React.createElement("b", { className: "num" }, s.wave), " \u6CE2"), /* @__PURE__ */ React.createElement("span", { className: "tdscene" }, TD_SCENES[Math.floor((s.wave - 1) / 5) % TD_SCENES.length].name), /* @__PURE__ */ React.createElement("span", { className: "tdctrl" }, /* @__PURE__ */ React.createElement("button", { className: `tdcbtn ${s.paused ? "on" : ""}`, onClick: () => {
    s.paused = !s.paused;
  } }, s.paused ? "\u25B6" : "\u23F8"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `tdcbtn ${s.speed !== 1 ? "on" : ""}`,
      onClick: () => {
        const gears = [0.5, 1, 1.5, 2];
        s.speed = gears[(gears.indexOf(s.speed) + 1) % gears.length];
      }
    },
    s.speed === 0.5 ? "\u{1F422}\xD70.5" : s.speed === 1 ? "\u25B6\xD71" : s.speed === 1.5 ? "\u23E9\xD71.5" : "\u26A1\xD72"
  )), /* @__PURE__ */ React.createElement("span", { className: "tdbest" }, "\u6700\u4F73 Best:", Math.max(best || 0, s.over ? s.wave : 0) || "\u2014")), /* @__PURE__ */ React.createElement("div", { className: `tdboard ${TD_SCENES[Math.floor((s.wave - 1) / 5) % TD_SCENES.length].cls} ${s.shake > 0 ? "shake" : ""}`, onClick: () => setSel(null) }, /* @__PURE__ */ React.createElement("svg", { className: "tdsvg", viewBox: "0 0 100 100", preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("polyline", { points: TD_WAY.map((p) => p.join(",")).join(" "), className: "tdroad" }), /* @__PURE__ */ React.createElement("polyline", { points: TD_WAY.map((p) => p.join(",")).join(" "), className: "tdroadline" }), sel !== null && s.towers[sel] && (() => {
    const t = s.towers[sel];
    const spec = TD_TOWERS[t.type];
    const [x, y] = TD_SPOTS[sel];
    return /* @__PURE__ */ React.createElement("circle", { cx: x, cy: y, r: spec.range + 2 * (t.lvl - 1), className: "tdrange" });
  })(), s.shots.map((e, i) => /* @__PURE__ */ React.createElement(
    "line",
    {
      key: i,
      x1: e.x1,
      y1: e.y1,
      x2: e.x2,
      y2: e.y2,
      className: `tdshot ${e.c}`,
      style: { opacity: e.ttl / 150 }
    }
  ))), /* @__PURE__ */ React.createElement("span", { className: "tdcastle", style: { left: "85%", top: "92%" } }, "\u{1F3F0}"), TD_SPOTS.map(([x, y], i) => {
    const t = s.towers[i];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `tdspot ${t ? "built" : ""} ${sel === i ? "sel" : ""}`,
        style: { left: x + "%", top: y + "%" },
        onClick: (e) => {
          e.stopPropagation();
          setSel(sel === i ? null : i);
        }
      },
      t ? TD_TOWERS[t.type].emoji : "\u26CF\uFE0F",
      t && t.lvl > 1 && /* @__PURE__ */ React.createElement("i", { className: "tdstar" }, "\u2B50".repeat(t.lvl - 1))
    );
  }), s.foes.map((f) => {
    const p = tdPoint(f.dist);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: f.id,
        className: `tdfoe ${f.big ? "big" : ""} ${f.slow > 0 ? "chilled" : ""}`,
        style: { left: p.x + "%", top: p.y + "%" }
      },
      /* @__PURE__ */ React.createElement("div", { className: "tdhp" }, /* @__PURE__ */ React.createElement("i", { style: { width: Math.max(0, f.hp / f.max * 100) + "%" } })),
      f.emoji
    );
  }), s.pops.map((e, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: `tdpop ${e.cls}`, style: { left: e.x + "%", top: e.y + "%" } }, e.txt)), s.story && !s.over && /* @__PURE__ */ React.createElement("div", { className: "tdstoryOverlay", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "tdstoryBox" }, /* @__PURE__ */ React.createElement("div", { className: "tdnpc" }, "\u{1F989}"), /* @__PURE__ */ React.createElement("div", { className: "tdstoryTxt" }, /* @__PURE__ */ React.createElement("b", null, "\u8ECD\u5E2B\u58A8\u8001 Sage Mo"), /* @__PURE__ */ React.createElement("p", null, s.story), /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: () => {
    s.story = null;
  } }, "\u6574\u8ECD\u51FA\u64CA To battle!")))), s.paused && !s.over && !s.story && /* @__PURE__ */ React.createElement("div", { className: "tdpauseMask" }, "\u23F8 \u66AB\u505C\u4E2D PAUSED", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("small", null, "\u770B\u6E05\u5C40\u52E2,\u60F3\u597D\u518D\u6253\u2014\u2014\u66AB\u505C\u662F\u6307\u63EE\u5B98\u7684\u6B0A\u5229\u3002")), s.phase === "break" && !s.over && !s.story && /* @__PURE__ */ React.createElement("div", { className: "tdbanner" }, "\u2694\uFE0F \u7B2C ", s.wave, " \u6CE2\u4F86\u8972 Wave ", s.wave, " incoming\u2026"), s.over && /* @__PURE__ */ React.createElement("div", { className: "tdover" }, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, "\u57FA\u5730\u9677\u843D BASE FALLEN"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14 } }, "\u{1F989} \u58A8\u8001:\u300C\u52DD\u6557\u4E43\u5175\u5BB6\u5E38\u4E8B\u3002\u770B\u6E05\u9019\u6B21\u662F\u54EA\u4E00\u6CE2\u5B88\u4E0D\u4F4F\u7684\u2014\u2014\u6574\u8ECD,\u518D\u4F86\u3002\u300D / Defeat teaches what victory cannot. Regroup and return."), /* @__PURE__ */ React.createElement("div", { className: "score num" }, "\u5805\u5B88\u5230\u7B2C ", s.wave, " \u6CE2"), /* @__PURE__ */ React.createElement("p", null, s.wave > (best || 0) ? "\u65B0\u7D00\u9304 New record! \u{1F389}" : `\u6700\u4F73\u7D00\u9304 Best:\u7B2C ${Math.max(best || 0, s.wave)} \u6CE2`), /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: exit }, "\u56DE\u904A\u6A02\u5712 Back")), sel !== null && !s.over && /* @__PURE__ */ React.createElement("div", { className: "tdmenu", onClick: (e) => e.stopPropagation() }, !s.towers[sel] ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u5EFA\u9020 Build"), Object.entries(TD_TOWERS).map(([k, t]) => /* @__PURE__ */ React.createElement("button", { key: k, className: "tdbuy", disabled: s.gold < t.cost, onClick: () => build(k) }, t.emoji, " ", t.name, " ", t.ne, " ", /* @__PURE__ */ React.createElement("span", { className: "num" }, t.cost, "\u{1FA99}")))) : (() => {
    const t = s.towers[sel];
    const spec = TD_TOWERS[t.type];
    const cost = 70 + 50 * t.lvl;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, spec.emoji, " ", spec.name, " Lv", t.lvl), /* @__PURE__ */ React.createElement("p", { className: "tdinfo" }, "\u653B\u64CA ", Math.round(spec.dmg * Math.pow(1.65, t.lvl - 1)), " \xB7 \u5C04\u7A0B ", spec.range + 2 * (t.lvl - 1), spec.slow ? " \xB7 \u7DE9\u901F" : ""), t.lvl < 3 ? /* @__PURE__ */ React.createElement("button", { className: "tdbuy", disabled: s.gold < cost, onClick: upgrade }, "\u2B06 \u5347\u7D1A Upgrade ", /* @__PURE__ */ React.createElement("span", { className: "num" }, cost, "\u{1FA99}")) : /* @__PURE__ */ React.createElement("p", { className: "tdinfo" }, "\u5DF2\u9054\u9802\u7D1A MAX \u2B50\u2B50"));
  })())), /* @__PURE__ */ React.createElement("div", { className: "tdq" }, /* @__PURE__ */ React.createElement("div", { className: "tdqhead" }, "\u{1F9E0} \u8ECD\u5E2B\u9326\u56CA:\u7B54\u5C0D\u4E00\u984C,\u58A8\u8001\u7ACB\u523B\u64A5\u767C +20\u{1FA99}(\u60F3\u5FEB\u901F\u84CB\u5854\u5C31\u9760\u9019\u500B)"), /* @__PURE__ */ React.createElement("div", { className: "qtext", style: { fontSize: 17 } }, q.q), /* @__PURE__ */ React.createElement("div", { className: "tdopts" }, q.options.map((o, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      disabled: picked !== null,
      className: `opt ${picked === null ? "" : i === q.ans ? "ok" : i === picked ? "bad" : ""}`,
      onClick: () => answer(i)
    },
    o
  )))));
}
const FARM_CROPS = [
  { id: "radish", name: "\u863F\u8514", ne: "Radish", seed: 5, sell: 12, stages: ["\u{1F331}", "\u{1F33F}", "\u{1F955}"] },
  { id: "tomato", name: "\u756A\u8304", ne: "Tomato", seed: 10, sell: 28, stages: ["\u{1F331}", "\u{1F33F}", "\u{1FAB4}", "\u{1F345}"] },
  { id: "pumpkin", name: "\u5357\u74DC", ne: "Pumpkin", seed: 20, sell: 60, stages: ["\u{1F331}", "\u{1F33F}", "\u{1F343}", "\u{1F33C}", "\u{1F383}"] },
  { id: "melon", name: "\u897F\u74DC", ne: "Watermelon", seed: 35, sell: 110, stages: ["\u{1F331}", "\u{1F33F}", "\u2618\uFE0F", "\u{1F343}", "\u{1F33C}", "\u{1F349}"] }
];
const FARM_SEASONS = ["\u{1F338} \u6625 Spring", "\u2600\uFE0F \u590F Summer", "\u{1F342} \u79CB Autumn", "\u2744\uFE0F \u51AC Winter"];
const FARM_TILES = 24, FARM_EMAX = 40;
const FARM_TIPS = [
  "\u79BE\u5BF6:\u300C\u6F86\u904E\u6C34\u7684\u4F5C\u7269,\u7761\u4E00\u89BA\u624D\u6703\u9577\u5927\u2014\u2014\u7761\u524D\u5DE1\u4E00\u6B21\u7530,\u662F\u8FB2\u592B\u7684\u5100\u5F0F\u3002\u300D / Water first, then sleep \u2014 crops grow overnight.",
  "\u79BE\u5BF6:\u300C\u897F\u74DC\u8981\u7B49\u4E94\u5929,\u4F46\u6BCF\u5929\u8CFA\u5F97\u6700\u591A\u3002\u6709\u8010\u5FC3\u7684\u4EBA\u8CFA\u5927\u9322!\u300D / Melons take five days but earn the most per day.",
  "\u79BE\u5BF6:\u300C\u9AD4\u529B\u4E0D\u5920?\u7B54\u5E7E\u984C\u5C31\u56DE\u4F86\u4E86\u3002\u8166\u529B\u5C31\u662F\u8FB2\u5834\u7684\u592A\u967D\u80FD\u3002\u300D / Out of energy? Answers are this farm\u2019s solar power.",
  "\u79BE\u5BF6:\u300C\u5E02\u96C6\u65E5\u6BCF\u4E94\u5929\u4E00\u6B21,\u8A18\u5F97\u7559\u4F5C\u7269\u7B49\u597D\u50F9\u9322!\u300D / Market day comes every fifth day \u2014 save crops for the premium!",
  "\u79BE\u5BF6:\u300C\u4E0B\u96E8\u5929\u662F\u8001\u5929\u723A\u5E6B\u4F60\u6F86\u6C34,\u7701\u4E0B\u7684\u9AD4\u529B\u62FF\u53BB\u958B\u65B0\u7530\u5427\u3002\u300D / Rain waters everything \u2014 spend the saved energy planting more."
];
const FARM_WEATHER = { sun: { e: "\u2600\uFE0F", n: "\u6674\u5929 Sunny" }, rain: { e: "\u{1F327}\uFE0F", n: "\u96E8\u5929 Rainy(\u5168\u7530\u81EA\u52D5\u6F86\u6C34!)" } };
function FarmGame({ farm, hanziLv, mathLv, update, exit }) {
  const [tool, setTool] = useState("plant");
  const [cropSel, setCropSel] = useState("radish");
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const [pops, setPops] = useState([]);
  const [sleeping, setSleeping] = useState(false);
  const popId = useRef(1);
  useEffect(() => {
    if (!farm.tiles) {
      update((f) => {
        f.v = 2;
        f.day = f.day || 1;
        f.energy = 20;
        f.coins = (f.coins || 0) + (f.seeds || 0) * 2 + 20;
        f.harvested = f.harvested || 0;
        f.tiles = Array(FARM_TILES).fill(null);
        delete f.seeds;
        delete f.plots;
      });
    }
  }, []);
  if (!farm.tiles) return /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u6574\u5730\u4E2D\u2026 Preparing the field\u2026");
  const pop = (x, y, txt, cls) => {
    const id = popId.current++;
    setPops((p) => [...p, { x, y, txt, cls, id }]);
    setTimeout(() => setPops((p) => p.filter((e) => e.id !== id)), 850);
  };
  const tilePos = (i) => ({ x: i % 8 * 12.5 + 6.25, y: Math.floor(i / 8) * 33 + 17 });
  const newQ = () => {
    const useHanzi = Math.random() < 0.5;
    setQ(useHanzi ? genHanzi(hanziLv, 1)[0] : pick(MATH_GEN[mathLv])());
    setPicked(null);
  };
  const answer = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.ans) {
      update((f) => {
        f.energy = Math.min(FARM_EMAX, (f.energy || 0) + 6);
      });
      pop(50, -8, "+6\u26A1", "gold");
    }
  };
  const clickTile = (i) => {
    const t = farm.tiles[i];
    const p = tilePos(i);
    if (tool === "plant") {
      if (t) return;
      const c = FARM_CROPS.find((c2) => c2.id === cropSel);
      if (farm.coins < c.seed) {
        pop(p.x, p.y, "\u91D1\u5E63\u4E0D\u8DB3!", "hurt");
        return;
      }
      if (farm.energy < 2) {
        pop(p.x, p.y, "\u9AD4\u529B\u4E0D\u8DB3,\u5148\u7B54\u984C!", "hurt");
        return;
      }
      update((f) => {
        f.coins -= c.seed;
        f.energy -= 2;
        f.tiles[i] = { crop: c.id, stage: 0, watered: false };
      });
      pop(p.x, p.y, "\u{1F331}", "boom");
    } else if (tool === "water") {
      if (!t || t.watered) return;
      const c = FARM_CROPS.find((c2) => c2.id === t.crop);
      if (t.stage >= c.stages.length - 1) return;
      if (farm.energy < 1) {
        pop(p.x, p.y, "\u9AD4\u529B\u4E0D\u8DB3!", "hurt");
        return;
      }
      update((f) => {
        f.energy -= 1;
        f.tiles[i].watered = true;
      });
      pop(p.x, p.y, "\u{1F4A6}", "boom");
    } else if (tool === "harvest") {
      if (!t) return;
      const c = FARM_CROPS.find((c2) => c2.id === t.crop);
      if (t.stage < c.stages.length - 1) return;
      const market = (farm.day || 1) % 5 === 0;
      const price = market ? Math.round(c.sell * 1.5) : c.sell;
      update((f) => {
        f.coins += price;
        f.harvested += 1;
        f.tiles[i] = null;
      });
      pop(p.x, p.y, `+${price}\u{1FA99}${market ? " \u5E02\u96C6\u50F9!" : ""}`, "gold");
    } else if (tool === "clear") {
      if (!t) return;
      if (farm.energy < 1) {
        pop(p.x, p.y, "\u9AD4\u529B\u4E0D\u8DB3!", "hurt");
        return;
      }
      update((f) => {
        f.energy -= 1;
        f.tiles[i] = null;
      });
      pop(p.x, p.y, "\u{1FA93}", "boom");
    }
  };
  const sleep = () => {
    setSleeping(true);
    setTimeout(() => {
      update((f) => {
        f.day += 1;
        f.energy = Math.min(FARM_EMAX, (f.energy || 0) + 4);
        const rain = Math.random() < 0.25;
        f.weather = rain ? "rain" : "sun";
        f.tiles = f.tiles.map((t) => {
          if (!t) return t;
          const c = FARM_CROPS.find((c2) => c2.id === t.crop);
          const grown = t.watered && t.stage < c.stages.length - 1;
          const nt = { ...t, stage: t.stage + (grown ? 1 : 0), watered: false };
          if (rain && nt.stage < c.stages.length - 1) nt.watered = true;
          return nt;
        });
      });
      setSleeping(false);
    }, 1100);
  };
  const season = FARM_SEASONS[Math.floor(((farm.day || 1) - 1) / 7) % 4];
  const crop = FARM_CROPS.find((c) => c.id === cropSel);
  const ePct = Math.round((farm.energy || 0) / FARM_EMAX * 100);
  return /* @__PURE__ */ React.createElement("div", { style: { "--ac": "var(--moss)" } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: exit }, "\u2190 \u56DE\u904A\u6A02\u5712 Back to arcade"), /* @__PURE__ */ React.createElement("div", { className: "fhud" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4C5} \u7B2C ", /* @__PURE__ */ React.createElement("b", { className: "num" }, farm.day || 1), " \u5929 \xB7 ", season), /* @__PURE__ */ React.createElement("span", null, FARM_WEATHER[farm.weather || "sun"].e, " ", FARM_WEATHER[farm.weather || "sun"].n), (farm.day || 1) % 5 === 0 && /* @__PURE__ */ React.createElement("span", { className: "fmarket" }, "\u{1F99D} \u5E02\u96C6\u65E5!\u6536\u8CFC\u50F9 \xD71.5"), /* @__PURE__ */ React.createElement("span", null, "\u{1FA99} ", /* @__PURE__ */ React.createElement("b", { className: "num" }, farm.coins)), /* @__PURE__ */ React.createElement("span", { className: "fenergy" }, "\u26A1 ", /* @__PURE__ */ React.createElement("i", { className: "fbar" }, /* @__PURE__ */ React.createElement("b", { style: { width: ePct + "%" } })), " ", /* @__PURE__ */ React.createElement("span", { className: "num" }, farm.energy || 0, "/", FARM_EMAX)), /* @__PURE__ */ React.createElement("span", null, "\u{1F9FA} ", /* @__PURE__ */ React.createElement("b", { className: "num" }, farm.harvested))), /* @__PURE__ */ React.createElement("div", { className: `farmboard season${Math.floor(((farm.day || 1) - 1) / 7) % 4} ${farm.weather === "rain" ? "raining" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "fgrid" }, farm.tiles.map((t, i) => {
    const c = t && FARM_CROPS.find((c2) => c2.id === t.crop);
    const mature = t && t.stage >= c.stages.length - 1;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `ftile ${t && t.watered ? "wet" : ""} ${mature ? "ripe" : ""}`,
        onClick: () => clickTile(i)
      },
      t && /* @__PURE__ */ React.createElement("span", { className: "fcrop" }, c.stages[t.stage]),
      mature && /* @__PURE__ */ React.createElement("span", { className: "fsparkle" }, "\u2728"),
      t && !mature && /* @__PURE__ */ React.createElement("span", { className: "fdots" }, c.stages.slice(1).map((_, d) => /* @__PURE__ */ React.createElement("i", { key: d, className: d < t.stage ? "on" : "" })))
    );
  })), pops.map((e) => /* @__PURE__ */ React.createElement("span", { key: e.id, className: `tdpop ${e.cls}`, style: { left: e.x + "%", top: e.y + "%" } }, e.txt)), sleeping && /* @__PURE__ */ React.createElement("div", { className: "fnight" }, "\u{1F319} \u7B2C ", farm.day, " \u591C\u2026\u6F86\u904E\u6C34\u7684\u4F5C\u7269\u6084\u6084\u9577\u5927\u4E86", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("small", null, "\u660E\u5929\u7684\u5929\u6C23\u662F\u2026\u2026?"))), /* @__PURE__ */ React.createElement("div", { className: "fhotbar" }, [["plant", "\u{1F330}", "\u7A2E\u690D Plant"], ["water", "\u{1F4A7}", "\u6F86\u6C34 Water"], ["harvest", "\u{1F9FA}", "\u6536\u6210 Harvest"], ["clear", "\u{1FA93}", "\u5277\u9664 Clear"]].map(([k, e, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: `fslot ${tool === k ? "on" : ""}`, onClick: () => setTool(k), title: l }, /* @__PURE__ */ React.createElement("span", null, e), /* @__PURE__ */ React.createElement("small", null, l.split(" ")[0]))), /* @__PURE__ */ React.createElement("div", { className: "fsep" }), /* @__PURE__ */ React.createElement("button", { className: "fslot sleepbtn", onClick: sleep, disabled: sleeping }, /* @__PURE__ */ React.createElement("span", null, "\u{1F634}"), /* @__PURE__ */ React.createElement("small", null, "\u7761\u89BA"))), tool === "plant" && /* @__PURE__ */ React.createElement("div", { className: "croprow" }, FARM_CROPS.map((c) => {
    const days = c.stages.length - 1;
    return /* @__PURE__ */ React.createElement("button", { key: c.id, className: `cropchip ${cropSel === c.id ? "on" : ""}`, onClick: () => setCropSel(c.id) }, /* @__PURE__ */ React.createElement("span", { className: "cropemoji" }, c.stages[c.stages.length - 1]), /* @__PURE__ */ React.createElement("b", null, c.name, " ", c.ne), /* @__PURE__ */ React.createElement("small", null, "\u7A2E\u5B50 ", c.seed, "\u{1FA99} \xB7 ", days, " \u5929\u719F \xB7 \u8CE3 ", c.sell, "\u{1FA99}"));
  })), /* @__PURE__ */ React.createElement("div", { className: "tdq" }, /* @__PURE__ */ React.createElement("div", { className: "tdqhead" }, "\u2600\uFE0F \u7B54\u984C\u5145\u9AD4\u529B Answer to recharge(+6\u26A1,\u9AD4\u529B\u7528\u4F86\u7A2E\u690D\u8207\u6F86\u6C34)"), !q ? /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: newQ }, "\u62BD\u4E00\u984C Draw a question") : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "qtext", style: { fontSize: 17 } }, q.q), /* @__PURE__ */ React.createElement("div", { className: "tdopts" }, q.options.map((o, i) => {
    const label = typeof o === "object" ? o.t : o;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        disabled: picked !== null,
        className: `opt ${picked === null ? "" : i === q.ans ? "ok" : i === picked ? "bad" : ""}`,
        onClick: () => answer(i)
      },
      label
    );
  })), picked !== null && /* @__PURE__ */ React.createElement("div", { className: "why" }, (Array.isArray(q.why) ? q.why : [q.why]).filter(Boolean).map((line, i) => /* @__PURE__ */ React.createElement("p", { key: i }, line)), /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: newQ }, "\u4E0B\u4E00\u984C \u2192")))), /* @__PURE__ */ React.createElement("div", { className: "fnpc" }, /* @__PURE__ */ React.createElement("span", { className: "fnpcface" }, "\u{1F439}"), /* @__PURE__ */ React.createElement("p", null, FARM_TIPS[((farm.day || 1) - 1) % FARM_TIPS.length])));
}
function buildBackup(state) {
  return JSON.stringify({
    app: "logic-lab",
    format: 1,
    version: typeof CONTENT_VERSION !== "undefined" ? CONTENT_VERSION : "",
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    save: state
  }, null, 2);
}
function parseBackup(text) {
  const obj = JSON.parse(text);
  const s = obj && obj.app === "logic-lab" && obj.save ? obj.save : obj;
  const hasXp = s && (typeof s.totalXp === "number" || typeof s.xp === "number");
  if (!s || typeof s !== "object" || !hasXp || !s.subjects) throw new Error("invalid backup");
  return { save: migrateSave(s), exportedAt: obj && obj.exportedAt || "" };
}
function BackupVault({ state, importSave, markBackup }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const doExport = () => {
    const blob = new Blob([buildBackup(state)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `logic-lab-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 800);
    markBackup();
    setMsg("\u2705 \u5099\u4EFD\u6A94\u5DF2\u4E0B\u8F09!\u8ACB\u5B58\u5230\u96F2\u7AEF\u786C\u789F\u6216\u50B3\u7D66\u81EA\u5DF1\u4E00\u4EFD\u3002 / Backup downloaded \u2014 keep a copy somewhere safe.");
  };
  const doCopy = () => {
    const text = buildBackup(state);
    const done = () => {
      markBackup();
      setMsg("\u2705 \u5DF2\u8907\u88FD\u5099\u4EFD\u6587\u5B57!\u8CBC\u5230\u8A18\u4E8B\u672C\u6216\u8A0A\u606F\u88E1\u4FDD\u5B58\u3002 / Copied \u2014 paste it into a note to keep it.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  };
  const fallbackCopy = (text, done) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      setMsg("\u274C \u8907\u88FD\u5931\u6557,\u8ACB\u6539\u7528\u300C\u532F\u51FA\u5099\u4EFD\u6A94\u300D\u3002 / Copy failed \u2014 please use Export instead.");
    }
    ta.remove();
  };
  const applyText = (text) => {
    try {
      const { save: s, exportedAt } = parseBackup(text);
      const ok = window.confirm(
        `\u5373\u5C07\u7528\u5099\u4EFD\u8986\u84CB\u76EE\u524D\u9032\u5EA6:
\u76EE\u524D\u7D2F\u7A4D XP:${state.totalXp || 0} \u2192 \u5099\u4EFD\u7D2F\u7A4D XP:${s.totalXp || 0}
\u76EE\u524D\u5370\u7AE0:${(state.seals || []).length} \u2192 \u5099\u4EFD\u5370\u7AE0:${(s.seals || []).length}
` + (exportedAt ? `\u5099\u4EFD\u6642\u9593:${String(exportedAt).slice(0, 10)}
` : "") + `
\u78BA\u5B9A\u8981\u9084\u539F\u55CE?\u76EE\u524D\u7684\u9032\u5EA6\u6703\u88AB\u53D6\u4EE3\u3002`
      );
      if (!ok) {
        setMsg("\u5DF2\u53D6\u6D88\u9084\u539F,\u76EE\u524D\u9032\u5EA6\u4FDD\u6301\u4E0D\u8B8A\u3002 / Restore cancelled.");
        return;
      }
      importSave(s);
      setPasteOpen(false);
      setPasteText("");
      setMsg("\u2705 \u9084\u539F\u5B8C\u6210!\u9032\u5EA6\u5DF2\u8F09\u56DE\u3002 / Restored \u2014 your progress is back.");
    } catch (e) {
      setMsg("\u274C \u9019\u4E0D\u662F\u6709\u6548\u7684\u5099\u4EFD\u5167\u5BB9,\u8ACB\u78BA\u8A8D\u6A94\u6848\u6216\u6587\u5B57\u662F\u5426\u5B8C\u6574\u3002 / Not a valid backup \u2014 please check the file or text.");
    }
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => applyText(String(r.result));
    r.readAsText(f);
    e.target.value = "";
  };
  const days = state.lastBackup ? Math.floor((Date.now() - new Date(state.lastBackup).getTime()) / 864e5) : null;
  return /* @__PURE__ */ React.createElement("div", { className: "vault" }, /* @__PURE__ */ React.createElement("div", { className: "vault-head" }, /* @__PURE__ */ React.createElement("span", { className: "vault-icon" }, "\u{1F4BE}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "\u8CC7\u6599\u4FDD\u96AA\u7BB1 \xB7 Data Vault"), /* @__PURE__ */ React.createElement("p", null, "\u9032\u5EA6\u5B58\u5728\u300C\u9019\u53F0\u88DD\u7F6E\u7684\u9019\u500B\u700F\u89BD\u5668\u300D\u88E1;\u63DB\u88DD\u7F6E\u6216\u6E05\u9664\u5FEB\u53D6\u5C31\u6703\u6B78\u96F6\u3002 \u5B9A\u671F\u532F\u51FA\u5099\u4EFD=\u5E6B\u795E\u7378\u548C\u5370\u7AE0\u8CB7\u4FDD\u96AA\u3002 / Progress lives in this browser only \u2014 export a backup so nothing is ever lost."))), /* @__PURE__ */ React.createElement("div", { className: "vault-row" }, /* @__PURE__ */ React.createElement("button", { className: "btn solid", onClick: doExport }, "\u2B07 \u532F\u51FA\u5099\u4EFD\u6A94 Export"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: doCopy }, "\u{1F4CB} \u8907\u88FD\u5099\u4EFD\u6587\u5B57 Copy"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => fileRef.current && fileRef.current.click() }, "\u2B06 \u532F\u5165\u6A94\u6848\u9084\u539F Import"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    setPasteOpen((o) => !o);
    setMsg("");
  } }, "\u{1F4DD} \u8CBC\u4E0A\u6587\u5B57\u9084\u539F Paste"), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: fileRef,
      type: "file",
      accept: ".json,.txt,application/json,text/plain",
      style: { display: "none" },
      onChange: onFile
    }
  )), pasteOpen && /* @__PURE__ */ React.createElement("div", { className: "vault-paste" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "vault-ta",
      rows: 5,
      value: pasteText,
      placeholder: "\u628A\u4E4B\u524D\u8907\u88FD\u7684\u5099\u4EFD\u6587\u5B57\u6574\u6BB5\u8CBC\u5728\u9019\u88E1\u2026 / Paste your backup text here\u2026",
      onChange: (e) => setPasteText(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn solid",
      disabled: !pasteText.trim(),
      onClick: () => applyText(pasteText)
    },
    "\u9084\u539F\u9019\u4EFD\u5099\u4EFD Restore"
  )), msg && /* @__PURE__ */ React.createElement("p", { className: "vault-msg" }, msg), /* @__PURE__ */ React.createElement("p", { className: "vault-meta" }, state.lastBackup ? `\u4E0A\u6B21\u5099\u4EFD:${state.lastBackup.slice(0, 10)}(${days} \u5929\u524D) / Last backup ${days} day(s) ago` : "\u9084\u6C92\u6709\u5099\u4EFD\u904E\u3002 / No backup yet."));
}
function LedgerPanel({ state }) {
  const st = ledgerStats(state);
  const max = Math.max(1, ...st.days.map((d) => d.a));
  const acc = st.q ? Math.round(st.ok / st.q * 100) : 0;
  return /* @__PURE__ */ React.createElement("div", { className: "ledger" }, /* @__PURE__ */ React.createElement("h3", null, "\u6210\u9577\u5E74\u8F2A \xB7 Growth Rings"), st.q === 0 ? /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u5E33\u672C\u9084\u662F\u7A7A\u7684\u2500\u2500\u5B8C\u6210\u7B2C\u4E00\u56DE\u5408\u885D\u523A,\u5E74\u8F2A\u5C31\u958B\u59CB\u751F\u9577\u3002 / Finish a sprint and the rings start growing.") : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "stat-row" }, /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, st.q), /* @__PURE__ */ React.createElement("span", null, "\u7D2F\u8A08\u7B54\u984C \xB7 Answered")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, acc, "%"), /* @__PURE__ */ React.createElement("span", null, "\u6B63\u78BA\u7387 \xB7 Accuracy")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, st.lit, "/", ALL_CHARS.length), /* @__PURE__ */ React.createElement("span", null, "\u9EDE\u4EAE\u6F22\u5B57 \xB7 Lit chars")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, st.rivals), /* @__PURE__ */ React.createElement("span", null, "\u5BBF\u6575 \xB7 Rivals"))), /* @__PURE__ */ React.createElement("div", { className: "ldg-bars", "aria-label": "\u6700\u8FD1\u4E03\u5929\u7B54\u984C\u91CF" }, st.days.map((d) => /* @__PURE__ */ React.createElement("div", { key: d.d, className: "ldg-col", title: `${d.d}:\u7B54 ${d.a} \u984C,\u5C0D ${d.c} \u984C` }, /* @__PURE__ */ React.createElement("div", { className: "ldg-bar" }, /* @__PURE__ */ React.createElement("i", { style: { height: `${Math.round(d.a / max * 100)}%` } }, /* @__PURE__ */ React.createElement("b", { style: { height: d.a ? `${Math.round(d.c / d.a * 100)}%` : "0%" } }))), /* @__PURE__ */ React.createElement("span", null, d.d.slice(5).replace("-", "/"))))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u5B8C\u6210\u885D\u523A\u5F8C\u8A18\u9304\u7B54\u984C\u3002\u9EDE\u4EAE\u6578\u53EA\u8A08\u7B97\u76EE\u524D\u4E00\u5343\u5B57\u5B57\u5EAB\u4E2D\u66FE\u7B54\u5C0D\u7684\u5B57\uFF1B\u4FDD\u7559\u4ECD\u5728\u5B57\u5EAB\u4E2D\u7684\u820A\u7D00\u9304\u3002\u9EDE\u4EAE\u4E0D\u7B49\u65BC\u5DF2\u638C\u63E1\uFF0C\u8FB2\u5834\u7B54\u984C\u4E0D\u5217\u5165\u3002 / Completed sprints are recorded. Lit characters are those answered correctly in the current bank; this is not a mastery score. Farm answers are separate.")));
}
function MathProgressPanel({ state }) {
  const mp = mathProgress(state);
  const rec = recommendedMathLevel(state);
  const top = mp.rows.slice(0, 10);
  return /* @__PURE__ */ React.createElement("div", { className: "ledger mathledger" }, /* @__PURE__ */ React.createElement("h3", null, "\u6578\u5B78\u638C\u63E1\u5716 \xB7 Math Mastery"), mp.q === 0 ? /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u6578\u5B78\u5E33\u672C\u9084\u662F\u7A7A\u7684\u2500\u2500\u5B8C\u6210\u4E00\u56DE\u5408\u6578\u5B78\u885D\u523A,\u9019\u88E1\u6703\u986F\u793A\u984C\u578B\u638C\u63E1\u5EA6\u8207\u5BBF\u6575\u3002 / Finish a math sprint to see mastery by type.") : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "stat-row" }, /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.q), /* @__PURE__ */ React.createElement("span", null, "\u6578\u5B78\u7B54\u984C \xB7 Answered")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.acc, "%"), /* @__PURE__ */ React.createElement("span", null, "\u6578\u5B78\u6B63\u78BA\u7387 \xB7 Accuracy")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, "L", rec.level), /* @__PURE__ */ React.createElement("span", null, "\u5EFA\u8B70\u7B49\u7D1A \xB7 Suggested")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, mp.rivals), /* @__PURE__ */ React.createElement("span", null, "\u6578\u5B78\u5BBF\u6575 \xB7 Rivals"))), /* @__PURE__ */ React.createElement("div", { className: "masterylist" }, top.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.fp, className: `masteryrow ${r.rival ? "rival" : ""}` }, /* @__PURE__ */ React.createElement("span", null, "L", r.lv), /* @__PURE__ */ React.createElement("b", null, r.topic), /* @__PURE__ */ React.createElement("i", null, /* @__PURE__ */ React.createElement("em", { style: { width: `${r.acc}%` } })), /* @__PURE__ */ React.createElement("small", null, r.ok, "/", r.total, " \xB7 ", r.acc, "%")))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u5217\u8868\u512A\u5148\u986F\u793A\u9700\u8981\u5FA9\u4EC7\u6216\u9700\u8981\u7DF4\u7A69\u7684\u984C\u578B;\u6EFF 3 \u6B21\u4E14\u6B63\u78BA\u7387 80% \u4EE5\u4E0A\u6703\u8996\u70BA\u638C\u63E1\u3002 / The list prioritizes rivals and weaker types; 3 correct answers and 80%+ counts as mastered.")));
}
function ProgressPage({ state, goHome, importSave, markBackup }) {
  return /* @__PURE__ */ React.createElement("div", { style: { "--ac": "var(--cinnabar)" } }, /* @__PURE__ */ React.createElement("button", { className: "back", onClick: goHome }, "\u2190 \u56DE\u57FA\u5730"), /* @__PURE__ */ React.createElement("div", { className: "page-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u5370\u7AE0\u7246")), /* @__PURE__ */ React.createElement("div", { className: "stat-row" }, /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, state.totalXp || 0), /* @__PURE__ */ React.createElement("span", null, "\u7D2F\u7A4D XP \xB7 Lifetime")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, state.xp), /* @__PURE__ */ React.createElement("span", null, "\u53EF\u7528 XP \xB7 Spendable")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, state.streak), /* @__PURE__ */ React.createElement("span", null, "\u9023\u7E8C\u5929\u6578 \xB7 Streak")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, state.seals.length), /* @__PURE__ */ React.createElement("span", null, "\u5370\u7AE0 \xB7 Seals")), /* @__PURE__ */ React.createElement("div", { className: "stat" }, /* @__PURE__ */ React.createElement("b", { className: "num" }, state.pets.length, "/", PETS.length), /* @__PURE__ */ React.createElement("span", null, "\u795E\u7378 \xB7 Beasts"))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "\u6EFF\u5206\u5B8C\u6210\u4E00\u56DE\u5408\u885D\u523A,\u5C31\u80FD\u84CB\u4E00\u679A\u7843\u7802\u5370\u3002"), state.seals.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "empty" }, "\u9084\u6C92\u6709\u5370\u7AE0\u2500\u2500\u53BB\u5B8C\u6210\u4E00\u56DE\u5408\u6EFF\u5206\u885D\u523A\u5427!") : /* @__PURE__ */ React.createElement("div", { className: "seal-wall" }, state.seals.map((x, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "seal-mini kai", title: `${SUBJECTS[x.subject].name} \xB7 ${x.date}` }, x.ch))), /* @__PURE__ */ React.createElement(LedgerPanel, { state }), /* @__PURE__ */ React.createElement(MathProgressPanel, { state }), /* @__PURE__ */ React.createElement(BackupVault, { state, importSave, markBackup }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
