/* ATM-Bench-Hard price-performance chart — shared by index.html and
   leaderboard.html. Paired with static/css/price_perf.css. No build step: drop
   the two files in, add the markup below, and call PricePerf.init().

   Markup the page must provide:

     <h2 data-pp-i18n="title"></h2>
     <p  data-pp-i18n="intro"></p>
     <div class="pp-wrap">
       <div class="pp-legend" id="pp-legend"></div>
       <div class="pp-sub" id="pp-sub"></div>
       <div class="pp-plot">
         <svg id="pp-chart" viewBox="0 0 880 660" role="img"></svg>
         <div class="pp-tip" id="pp-tip"></div>
       </div>
     </div>

   The chart carries its own strings (PP_I18N) rather than leaning on either
   page's `translations` object, so the copy exists once. It follows the global
   `currentLang` that both pages already define; call PricePerf.render() from
   each page's setLanguage() to re-render on the toggle.

   Numbers come from PersonalMemoryQA/result_numbers/price_performance_plot/
   claude/ — same runs as the leaderboard's Agent rows: 31 questions, SGM,
   gpt-5-mini judge, cost for the whole run at Tokdash standard short-context
   rates (snapshot 2026-07-31). `tokens` is millions, matching the board's
   Total Tokens column.

   A `series` is drawn as a line and needs two or more effort tiers ordered by
   cost (which is also effort order in every one). A `points` entry is a single
   configuration, drawn as a neutral diamond. `excluded` is not rendered: it is
   the record of runs measured but kept off the chart, so removals stay visible
   to whoever edits this next. */

var PRICE_PERF = {
  series: [
    { key: 'sol', label: 'GPT-5.6 Sol', plot: 'GPT-5.6 Sol', harness: 'Codex', tiers: false,
      points: [
        { tier: 'low', qs: 41.68, cost: 9.53, tokens: 5.06 },
        { tier: 'medium', qs: 58.76, cost: 12.52, tokens: 7.52 },
        { tier: 'high', qs: 51.54, cost: 14.79, tokens: 10.19 },
        { tier: 'xhigh', qs: 43.98, cost: 17.79, tokens: 11.49 }
      ] },
    { key: 'opus5', label: 'Claude Opus 5', plot: 'Claude Opus 5', harness: 'Claude Code', tiers: false,
      points: [
        { tier: 'medium', qs: 51.37, cost: 5.84, tokens: 3.18 },
        { tier: 'high', qs: 53.36, cost: 7.29, tokens: 3.54 },
        /* 30 answers on disk: one question was repeatedly blocked by the
           provider, not left unfinished. Treated as a final run — the count is
           kept for the tooltip but no longer changes how the marker is drawn. */
        { tier: 'xhigh', qs: 58.37, cost: 12.33, tokens: 6.09, answered: 30 },
        { tier: 'max', qs: 55.96, cost: 17.22, tokens: 8.87 }
      ] },
    { key: 'fable5', label: 'Claude Fable 5', plot: 'Claude Fable 5', harness: 'Claude Code', tiers: false, pin: 'right',
      points: [
        { tier: 'low', qs: 46.77, cost: 7.93, tokens: 1.95 },
        { tier: 'medium', qs: 51.69, cost: 10.13, tokens: 2.24 },
        { tier: 'high', qs: 52.55, cost: 11.95, tokens: 2.55 },
        { tier: 'xhigh', qs: 56.42, cost: 15.06, tokens: 2.90 }
      ] },
    { key: 'k3', label: 'Kimi K3-256k', plot: 'Kimi K3', harness: 'Kimi Code', tiers: false,
      points: [
        { tier: 'low', qs: 48.48, cost: 3.68, tokens: 5.39 },
        { tier: 'high', qs: 52.53, cost: 5.54, tokens: 7.94 }
      ] },
    { key: 'terra', label: 'GPT-5.6 Terra', plot: 'GPT-5.6 Terra', harness: 'Codex', tiers: false,
      points: [
        { tier: 'medium', qs: 28.22, cost: 4.32, tokens: 6.71 },
        { tier: 'high', qs: 38.61, cost: 5.01, tokens: 7.83 },
        { tier: 'xhigh', qs: 40.95, cost: 5.96, tokens: 9.36 },
        { tier: 'max', qs: 44.47, cost: 9.92, tokens: 17.21 }
      ] },
    { key: 'luna', label: 'GPT-5.6 Luna', plot: 'GPT-5.6 Luna', harness: 'Codex', tiers: true,
      points: [
        { tier: 'low', qs: 31.57, cost: 0.45, tokens: 7.02 },
        { tier: 'medium', qs: 34.92, cost: 0.53, tokens: 8.34 },
        { tier: 'high', qs: 41.70, cost: 0.78, tokens: 13.96 },
        { tier: 'xhigh', qs: 42.39, cost: 1.01, tokens: 18.82 }
      ] }
  ],
  points: [
    { key: 'k27', label: 'Kimi K2.7', harness: 'Kimi Code', qs: 49.10, cost: 3.53, tokens: 14.12 },
    { key: 'gpt55', label: 'GPT-5.5 (xhigh)', harness: 'Codex', qs: 48.08, cost: 39.74, tokens: 22.89, pin: 'left' },
    { key: 'opus48', label: 'Claude Opus 4.8', harness: 'Claude Code', qs: 41.63, cost: 7.49, tokens: 4.42, pin: 'below' },
    { key: 'm3', label: 'MiniMax-M3', harness: 'OpenCode', qs: 47.31, cost: 2.83, tokens: 16.30 },
    { key: 'dsv4', label: 'DeepSeek V4 Flash 0731', harness: 'OpenCode', qs: 38.28, cost: 0.26, tokens: 12.54 }
  ],
  /* Not rendered — the record of what is measured but not drawn. */
  excluded: [
    { series: 'GPT-5.5', tier: 'medium', qs: 41.41, cost: 27.17, why: 'answered 24 of 31; leaves GPT-5.5 xhigh as a single point' },
    { series: 'GPT-5.6 Sol', tier: 'max', qs: 48.30, cost: 23.90, why: 'ends the Sol ladder at xhigh' },
    { series: 'Kimi K3', tier: 'max', qs: 51.35, cost: 4.90, why: 'plain K3 between two K3-256k rungs' },
    { series: 'Kimi K3-256k', tier: 'max', qs: 48.47, cost: 5.83, why: 'dearer than high and 4.1 points worse' },
    { series: 'GPT-5.6 Terra', tier: 'low', qs: 43.46, cost: 4.08, why: 'outscores medium, high and xhigh' },
    { series: 'GPT-5.6 Luna', tier: 'max', qs: 28.25, cost: 1.44, why: '1.4x the cost of xhigh, 14.1 points lower' }
  ]
};

var PP_I18N = {
  en: {
    title: 'Price vs. Performance',
    intro: "ATM-Bench-Hard agent runs: what each one scored against what it cost, at API list-price "
         + "equivalent. A line joins one model's reasoning-effort tiers; a diamond is a single configuration.",
    aria: "Scatter plot of ATM-Bench-Hard score against run cost, with one line per model's reasoning-effort tiers.",
    axis_x: 'Cost (USD)',
    axis_y: 'Score — higher is better',
    key_diamond: 'diamond = single-configuration run',
    key_size: 'marker size = effort: low → medium → high → xhigh → max',
    tip_score: 'Score',
    tip_cost: 'Run cost',
    tip_per_point: 'Cost per score point',
    tip_tokens: 'Total tokens',
    more: 'See every result on the ATM-Bench-Hard leaderboard →'
  },
  zh: {
    title: '成本 – 得分',
    intro: 'ATM-Bench-Hard 上的智能体运行：各自的得分与花费（按 API 标价等价折算）。折线连接同一模型的各推理强度档位；菱形表示单一配置。',
    aria: 'ATM-Bench-Hard 得分对运行成本的散点图，每个模型的推理强度档位连成一条折线。',
    axis_x: '成本（USD）',
    axis_y: '得分 — 越高越好',
    key_diamond: '菱形 = 单一配置运行',
    key_size: '标记大小 = 推理强度：low → medium → high → xhigh → max',
    tip_score: '得分',
    tip_cost: '运行成本',
    tip_per_point: '每分成本',
    tip_tokens: '总 Token',
    more: '在 ATM-Bench-Hard 排行榜查看全部结果 →'
  }
};

var PricePerf = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var W = 880, H = 660, M = { t: 24, r: 122, b: 60, l: 74 };
  var IW = W - M.l - M.r, IH = H - M.t - M.b;
  var R = { low: 5.5, medium: 6.5, high: 7.5, xhigh: 8.5, max: 9.5 };
  var hidden = {}, hits = [], emphasis = null, bound = false;

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    return e;
  }

  function cssv(name) {
    var host = document.querySelector('.pp-wrap');
    return host ? getComputedStyle(host).getPropertyValue(name).trim() : '';
  }

  function lang() {
    var l = (typeof currentLang === 'string') ? currentLang : 'en';
    return PP_I18N[l] ? l : 'en';
  }
  function t(key) { return PP_I18N[lang()][key] || PP_I18N.en[key] || key; }

  function color(i) { return cssv('--pp-c' + (i + 1)); }
  function radiusOf(p) { return (p.tier && R[p.tier]) ? R[p.tier] : 7; }
  function shown() { return PRICE_PERF.series.filter(function (s) { return !hidden[s.key]; }); }
  function showDots() { return !hidden.__dots__; }
  function usd(v) { return '$' + v.toFixed(2); }
  function pct(v) { return v.toFixed(1) + '%'; }

  function linTicks(a, b, n) {
    var raw = (b - a) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; })
      .find(function (s) { return s >= raw; }) || mag * 10;
    var out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  function logTicks(a, b) {
    var out = [];
    [0.01, 0.1, 1, 10, 100].forEach(function (base) {
      [1, 2, 5].forEach(function (m) {
        var v = +(base * m).toFixed(6);
        if (v >= a && v <= b) out.push(v);
      });
    });
    return out.length >= 3 ? out : linTicks(a, b, 5);
  }

  function money(v) { return v < 1 ? '$' + v.toFixed(2).replace(/0$/, '') : '$' + v; }

  function applyText() {
    document.querySelectorAll('[data-pp-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-pp-i18n'));
    });
  }

  function applyEmphasis() {
    document.querySelectorAll('#pp-chart [data-pp]').forEach(function (node) {
      node.classList.toggle('pp-faded', !!emphasis && node.getAttribute('data-pp') !== emphasis);
    });
  }

  function draw() {
    var svg = document.getElementById('pp-chart');
    if (!svg) return;
    svg.textContent = '';
    svg.setAttribute('aria-label', t('aria'));

    var linePts = [];
    shown().forEach(function (s) {
      s.points.forEach(function (p) {
        linePts.push(Object.assign({}, p, { s: s }));
      });
    });
    var dots = showDots() ? PRICE_PERF.points.map(function (p) {
      return Object.assign({}, p, { s: null });
    }) : [];
    var all = linePts.concat(dots);
    if (!all.length) { hits = []; return; }

    var costs = all.map(function (p) { return p.cost; });
    var scores = all.map(function (p) { return p.qs; });
    var c0 = Math.min.apply(null, costs) * 0.88, c1 = Math.max.apply(null, costs) * 1.14;
    var q0 = Math.min.apply(null, scores), q1 = Math.max.apply(null, scores);
    var qp = Math.max(1.6, (q1 - q0) * 0.07);
    q0 -= qp; q1 += qp;
    var lc0 = Math.log10(c0), lc1 = Math.log10(c1);
    var X = function (v) { return M.l + (Math.log10(v) - lc0) / (lc1 - lc0) * IW; };
    var Y = function (v) { return M.t + IH - (v - q0) / (q1 - q0) * IH; };

    var yv = linTicks(q0, q1, 6), xv = logTicks(c0, c1);
    var grid = el('g', { class: 'pp-grid' });
    yv.forEach(function (v) { grid.appendChild(el('line', { x1: M.l, x2: M.l + IW, y1: Y(v), y2: Y(v) })); });
    xv.forEach(function (v) { grid.appendChild(el('line', { y1: M.t, y2: M.t + IH, x1: X(v), x2: X(v) })); });
    svg.appendChild(grid);

    var ax = el('g', { class: 'pp-axis' });
    ax.appendChild(el('line', { x1: M.l, x2: M.l + IW, y1: M.t + IH, y2: M.t + IH }));
    ax.appendChild(el('line', { x1: M.l, x2: M.l, y1: M.t, y2: M.t + IH }));
    xv.forEach(function (v) {
      var e = el('text', { x: X(v), y: M.t + IH + 21, 'text-anchor': 'middle' });
      e.textContent = money(v); ax.appendChild(e);
    });
    yv.forEach(function (v) {
      var e = el('text', { x: M.l - 11, y: Y(v) + 4, 'text-anchor': 'end' });
      e.textContent = v.toFixed(0) + '%'; ax.appendChild(e);
    });
    var xt = el('text', { x: M.l + IW / 2, y: H - 12, 'text-anchor': 'middle', class: 'pp-axis-title' });
    xt.textContent = t('axis_x');
    var yt = el('text', { x: -(M.t + IH / 2), y: 20, 'text-anchor': 'middle', class: 'pp-axis-title', transform: 'rotate(-90)' });
    yt.textContent = t('axis_y');
    ax.appendChild(xt); ax.appendChild(yt); svg.appendChild(ax);

    var lines = el('g');
    shown().forEach(function (s) {
      var i = PRICE_PERF.series.indexOf(s);
      lines.appendChild(el('path', {
        class: 'pp-curve', stroke: color(i), 'data-pp': s.key,
        d: s.points.map(function (p, j) { return (j ? 'L' : 'M') + X(p.cost) + ' ' + Y(p.qs); }).join(' ')
      }));
    });
    svg.appendChild(lines);

    var marks = el('g');
    hits = [];
    linePts.forEach(function (p) {
      var cx = X(p.cost), cy = Y(p.qs), rad = radiusOf(p);
      var col = color(PRICE_PERF.series.indexOf(p.s));
      var g = el('g', { class: 'pp-mark', tabindex: '0', role: 'img', 'data-pp': p.s.key });
      g.setAttribute('aria-label', p.s.label + ' ' + p.tier + ': ' + pct(p.qs) + ', ' + usd(p.cost));
      g.appendChild(el('circle', { cx: cx, cy: cy, r: rad + 1.8, fill: 'none', stroke: cssv('--pp-surface'), 'stroke-width': 3 }));
      /* Every mark is drawn solid. There was a dashed variant for runs with
         fewer than 31 answers; with no key for it on the page it read as an
         unexplained glyph, and the one such run is final (see `answered`
         above). The count still shows in the tooltip. */
      g.appendChild(el('circle', { cx: cx, cy: cy, r: rad, fill: col }));
      marks.appendChild(g);
      hits.push({ p: p, cx: cx, cy: cy, rad: rad, g: g });
    });
    dots.forEach(function (p) {
      var cx = X(p.cost), cy = Y(p.qs), r = 7.5, col = cssv('--pp-c0');
      var g = el('g', { class: 'pp-mark', tabindex: '0', role: 'img', 'data-pp': '__dots__' });
      g.setAttribute('aria-label', p.label + ': ' + pct(p.qs) + ', ' + usd(p.cost));
      var d = function (k) {
        return 'M' + cx + ' ' + (cy - k) + ' L' + (cx + k) + ' ' + cy +
               ' L' + cx + ' ' + (cy + k) + ' L' + (cx - k) + ' ' + cy + ' Z';
      };
      g.appendChild(el('path', { d: d(r + 2.4), fill: 'none', stroke: cssv('--pp-surface'), 'stroke-width': 3 }));
      g.appendChild(el('path', { d: d(r), fill: col }));
      marks.appendChild(g);
      hits.push({ p: p, cx: cx, cy: cy, rad: r, g: g });
    });
    svg.appendChild(marks);

    /* Labels: model name at each line's dearest rung, model name on every
       diamond, then effort captions where the series asks for them. Greedy
       placement against the marks already drawn — a label with no free slot is
       dropped rather than overlaid. */
    var lg = el('g');
    var boxes = hits.map(function (h) {
      return { x0: h.cx - h.rad - 2, x1: h.cx + h.rad + 2, y0: h.cy - h.rad - 2, y1: h.cy + h.rad + 2 };
    });
    var collides = function (b) {
      return boxes.some(function (q) { return b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0; });
    };
    var place = function (cx, cy, rad, text, cls, fill, size, prefer) {
      var tw = text.length * size * 0.56;
      var cands = [
        { k: 'right', a: 'start', x: cx + rad + 9, y: cy + size * 0.36 },
        { k: 'above', a: 'middle', x: cx, y: cy - rad - 8 },
        { k: 'left', a: 'end', x: cx - rad - 9, y: cy + size * 0.36 },
        { k: 'below', a: 'middle', x: cx, y: cy + rad + size + 4 },
        { k: 'below-right', a: 'start', x: cx - rad, y: cy + rad + size + 4 },
        { k: 'below-left', a: 'end', x: cx + rad, y: cy + rad + size + 4 },
        { k: 'right-up', a: 'start', x: cx + rad + 9, y: cy - 11 },
        { k: 'right-down', a: 'start', x: cx + rad + 9, y: cy + 20 },
        { k: 'left-up', a: 'end', x: cx - rad - 9, y: cy - 11 },
        { k: 'left-down', a: 'end', x: cx - rad - 9, y: cy + 20 }
      ];
      if (prefer) {
        var pick = function (c) { return c.k === prefer || c.k.indexOf(prefer + '-') === 0; };
        cands = cands.filter(pick).concat(cands.filter(function (c) { return !pick(c); }));
      }
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        var x0 = c.a === 'start' ? c.x : c.a === 'end' ? c.x - tw : c.x - tw / 2;
        var b = { x0: x0 - 2, x1: x0 + tw + 2, y0: c.y - size + 1, y1: c.y + 4 };
        if (b.x0 < 3 || b.x1 > W - 3 || b.y0 < M.t - 14 || b.y1 > M.t + IH + 10) continue;
        if (collides(b)) continue;
        var e = el('text', { x: c.x, y: c.y, 'text-anchor': c.a, class: cls, fill: fill, 'font-size': size });
        e.textContent = text; lg.appendChild(e); boxes.push(b);
        return;
      }
    };
    shown().forEach(function (s) {
      var end = s.points[s.points.length - 1];
      place(X(end.cost), Y(end.qs), radiusOf(end) + 4, s.plot, 'pp-name',
            color(PRICE_PERF.series.indexOf(s)), 12.5, s.pin);
    });
    dots.forEach(function (p) {
      place(X(p.cost), Y(p.qs), 11, p.label, 'pp-dot-name', cssv('--ink'), 11.5, p.pin);
    });
    linePts.forEach(function (p) {
      if (!p.s.tiers) return;
      place(X(p.cost), Y(p.qs), radiusOf(p), p.tier, 'pp-tier', cssv('--muted'), 10.5);
    });
    svg.appendChild(lg);
    applyEmphasis();
  }

  function tooltip(p) {
    var tip = document.getElementById('pp-tip');
    tip.textContent = '';
    var head = document.createElement('div');
    head.className = 'pp-tt';
    var key = document.createElement('i');
    key.style.background = p.s ? color(PRICE_PERF.series.indexOf(p.s)) : cssv('--pp-c0');
    var name = document.createElement('span');
    name.textContent = (p.s ? p.s.label : p.label) + (p.tier ? ' · ' + p.tier : '');
    head.appendChild(key); head.appendChild(name);
    var sub = document.createElement('div');
    sub.className = 'pp-ts';
    sub.textContent = (p.s ? p.s.harness : p.harness) + ' · SGM · '
      + (p.answered ? p.answered : 31) + '/31';
    tip.appendChild(head); tip.appendChild(sub);
    var row = function (label, value, big) {
      var d = document.createElement('div');
      d.className = 'pp-row';
      var a = document.createElement('span'); a.textContent = label;
      var b = document.createElement('span'); b.textContent = value;
      if (big) b.className = 'pp-big';
      d.appendChild(a); d.appendChild(b); tip.appendChild(d);
    };
    row(t('tip_score'), pct(p.qs), true);
    row(t('tip_cost'), usd(p.cost), true);
    row(t('tip_per_point'), '$' + (p.cost / p.qs).toFixed(3));
    row(t('tip_tokens'), p.tokens.toFixed(1) + 'M');
  }

  function bindHover() {
    var svg = document.getElementById('pp-chart');
    if (!svg || bound) return;
    bound = true;
    var wrap = svg.parentElement, tip = document.getElementById('pp-tip');
    var locate = function (ev) {
      var box = svg.getBoundingClientRect();
      var px = (ev.clientX - box.left) * (W / box.width);
      var py = (ev.clientY - box.top) * (H / box.height);
      var best = null, bd = Infinity;
      hits.forEach(function (h) {
        var d = (h.cx - px) * (h.cx - px) + (h.cy - py) * (h.cy - py);
        if (d < bd) { bd = d; best = h; }
      });
      return bd <= 34 * 34 ? best : null;
    };
    var show = function (h, ev) {
      emphasis = h.p.s ? h.p.s.key : '__dots__';
      applyEmphasis();
      tooltip(h.p);
      tip.setAttribute('data-show', '1');
      var box = wrap.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = (ev ? ev.clientX - box.left : h.cx / W * box.width) + 20;
      var top = (ev ? ev.clientY - box.top : h.cy / H * box.height) - th / 2;
      if (left + tw > box.width) left -= tw + 40;
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = Math.max(0, Math.min(top, box.height - th)) + 'px';
    };
    var hide = function () {
      emphasis = null; applyEmphasis();
      tip.setAttribute('data-show', '0');
      /* Drop the inline position too. A hidden tooltip still counts toward the
         page's scrollable width, so a stale `left` from a hover at 1280px would
         push the page sideways once the viewport narrowed. */
      tip.style.left = '';
      tip.style.top = '';
    };
    svg.addEventListener('pointermove', function (ev) { var h = locate(ev); h ? show(h, ev) : hide(); });
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('focusin', function (ev) {
      var h = hits.filter(function (x) { return x.g === ev.target; })[0];
      if (h) show(h, null);
    });
    svg.addEventListener('focusout', hide);
  }

  function drawLegend() {
    var host = document.getElementById('pp-legend');
    if (!host) return;
    host.textContent = '';
    var item = function (key, label, drawKey) {
      var i = document.createElement('span');
      i.className = 'pp-lgi';
      i.setAttribute('data-off', hidden[key] ? '1' : '0');
      i.setAttribute('role', 'checkbox');
      i.setAttribute('aria-checked', String(!hidden[key]));
      i.tabIndex = 0;
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('class', 'pp-key');
      sv.setAttribute('viewBox', '0 0 26 12');
      drawKey(sv);
      var text = document.createElement('span');
      text.textContent = label;
      i.appendChild(sv); i.appendChild(text);
      var toggle = function () {
        hidden[key] = !hidden[key];
        drawLegend(); draw();
      };
      i.addEventListener('click', toggle);
      i.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
      i.addEventListener('pointerenter', function () { emphasis = key; applyEmphasis(); });
      i.addEventListener('pointerleave', function () { emphasis = null; applyEmphasis(); });
      host.appendChild(i);
    };
    PRICE_PERF.series.forEach(function (s, idx) {
      item(s.key, s.label, function (sv) {
        var c = color(idx);
        sv.appendChild(el('line', { x1: 0, y1: 6, x2: 26, y2: 6, stroke: c, 'stroke-width': 2.8 }));
        sv.appendChild(el('circle', { cx: 13, cy: 6, r: 4.4, fill: c }));
      });
    });

    var sub = document.getElementById('pp-sub');
    if (!sub) return;
    sub.textContent = '';
    var addItem = function (build, text) {
      var wrap = document.createElement('span');
      wrap.className = 'pp-item';
      build(wrap);
      var label = document.createElement('span');
      label.textContent = text;
      wrap.appendChild(label);
      sub.appendChild(wrap);
    };
    addItem(function (w) {
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('width', 15); sv.setAttribute('height', 15);
      sv.appendChild(el('path', { d: 'M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z', fill: cssv('--pp-c0') }));
      w.appendChild(sv);
    }, t('key_diamond'));
    addItem(function (w) {
      var sizes = document.createElement('span');
      sizes.className = 'pp-sizes';
      ['low', 'medium', 'high', 'xhigh', 'max'].forEach(function (e) {
        var d = R[e] * 2, sv = document.createElementNS(NS, 'svg');
        sv.setAttribute('width', d); sv.setAttribute('height', d);
        sv.appendChild(el('circle', { cx: d / 2, cy: d / 2, r: d / 2, fill: cssv('--muted') }));
        sizes.appendChild(sv);
      });
      w.appendChild(sizes);
    }, t('key_size'));
  }

  function render() { applyText(); drawLegend(); draw(); }

  return {
    render: render,
    init: function () { render(); bindHover(); }
  };
})();
