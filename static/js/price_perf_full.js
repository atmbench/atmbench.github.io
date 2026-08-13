/* Full price-performance scatter for the ATM-Bench-Hard board — every priced
   Agent row except the w/o-SGM ablations (see parse()). Leaderboard-only;
   index.html carries the focused chart
   (static/js/price_perf.js) instead. Shares static/css/price_perf.css.

   Markup the page must provide:

     <div class="pp-wrap ppf-wrap">
       <div class="pp-legend" id="ppf-legend"></div>
       <div class="pp-sub" id="ppf-sub"></div>
       <div class="pp-plot">
         <svg id="ppf-chart" viewBox="0 0 880 620" role="img"></svg>
         <div class="pp-tip" id="ppf-tip"></div>
       </div>
     </div>

   The heading and the intro paragraph are NOT in here — each page writes its
   own through the usual `data-i18n` mechanism, because what to say about the
   chart depends on what sits around it. Only the strings that are the same
   everywhere (axes, keys, tooltip rows, aria) live in PPF_I18N below.

   It takes NO dataset of its own: the page hands it ATM_HARD_ROWS (see
   static/js/atm_hard_rows.js). That is deliberate — the focused chart keeps a
   hand-maintained copy that has to be reconciled with the table by hand, and
   this one cannot drift from the table by construction. Add a row, it appears
   here, on both pages. The one filter it applies is the ablation exclusion in
   parse(), which is a property of the label, not a per-run judgement.

   Reasoning effort is read out of the model label: a trailing
   `(low|medium|high|xhigh|max)` is the effort tier. A trailing `(w/o SGM)`
   marks an ablation run, and those are excluded from this chart — see parse().

   The staircase is the Pareto frontier — the best score reachable at or below
   each price. It is recomputed over whatever the legend leaves visible, so
   switching a harness off answers "what could the rest do for this money". */

var PricePerfFull = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var W = 880, H = 620, M = { t: 22, r: 118, b: 58, l: 74 };
  var IW = W - M.l - M.r, IH = H - M.t - M.b;

  /* Cost axis: log10, same as price_perf.js. A power axis was tried and
     reverted — see the note there. This chart is where it showed worst: 0.36
     drove 17 of 21 marker collisions into the top-left corner, against 8 of 22
     spread across the plot under log. */

  /* Harness identity. Order is palette order: the sequence in --ppf-c1..c7 was
     validated against the card surface over ALL pairs, not just neighbours,
     because in a scatter any two points can end up side by side. Reordering or
     adding a harness means re-running the validator. */
  var HARNESS = ['Claude Code', 'Codex', 'Kimi Code', 'OpenCode', 'Pi', 'OpenClaw 🦞',
                 'Antigravity'];

  var TIERS = ['low', 'medium', 'high', 'xhigh', 'max'];
  var rowsIn = [], hidden = {}, hits = [], emphasis = null, bound = false;

  var PPF_I18N = {
    en: {
      aria: 'Scatter plot of ATM-Bench-Hard score against run cost for every priced agent run '
          + 'except the without-SGM ablations, with a Pareto frontier staircase.',
      axis_x: 'Cost (USD)',
      axis_y: 'Score — higher is better',
      key_front: 'staircase = best score at or below each price',
      /* Page-neutral on purpose — this chart appears on index.html too, where
         there is no table to point at. */
      key_hint: 'click a harness to hide it; hover a point for tokens and cost per score point',
      tip_score: 'Score',
      tip_cost: 'Run cost',
      tip_per_point: 'Cost per score point',
      tip_tokens: 'Total tokens',
      tip_front: 'on the Pareto frontier'
    },
    zh: {
      aria: 'ATM-Bench-Hard 全部计价智能体运行（不含未使用 SGM 的消融运行）的得分对成本散点图，并标出帕累托前沿阶梯线。',
      axis_x: '成本（USD）',
      axis_y: '得分 — 越高越好',
      key_front: '阶梯线 = 在该价位及以下可达的最高得分',
      key_hint: '点击 Harness 可隐藏；悬停任意点可查看 Token 数与每分成本',
      tip_score: '得分',
      tip_cost: '运行成本',
      tip_per_point: '每分成本',
      tip_tokens: '总 Token',
      tip_front: '位于帕累托前沿'
    }
  };

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    return e;
  }

  function cssv(name) {
    var host = document.querySelector('.ppf-wrap');
    return host ? getComputedStyle(host).getPropertyValue(name).trim() : '';
  }

  function lang() {
    var l = (typeof currentLang === 'string') ? currentLang : 'en';
    return PPF_I18N[l] ? l : 'en';
  }
  function t(key) { return PPF_I18N[lang()][key] || PPF_I18N.en[key] || key; }

  function color(h) {
    var i = HARNESS.indexOf(h);
    return i < 0 ? cssv('--pp-c0') : cssv('--ppf-c' + (i + 1));
  }
  function usd(v) { return '$' + v.toFixed(2); }
  function pct(v) { return v.toFixed(1) + '%'; }
  function money(v) { return v < 1 ? '$' + v.toFixed(2).replace(/0$/, '') : '$' + v; }

  /* One plot point per priced Agent row, with the label parsed apart.

     The w/o-SGM ablations are parsed and then dropped. They score 6.5-23.1%
     where every real configuration scores 28% or better, so carrying them
     stretched the score axis by 19 points to hold six runs that answer a
     different question — "does SGM matter", not "what does this configuration
     cost". The axis was spending 45% of its height on empty space: 9.1 pixels
     per score point with them, 13.2 without.

     They are not hidden — every one is in the leaderboard table directly above
     this chart, and in the README table. Only the scatter leaves them out. */
  function parse() {
    return rowsIn.filter(function (r) {
      return r.type === 'Agent' && r.cost_usd !== null && r.cost_usd !== undefined
          && !/\(\s*w\/o sgm\s*\)\s*$/i.test(r.model);
    }).map(function (r) {
      var name = r.model, tier = null;
      var m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(name);
      if (m && TIERS.indexOf(m[2].toLowerCase()) >= 0) { name = m[1]; tier = m[2].toLowerCase(); }
      return {
        harness: r.harness, model: r.model, name: name, tier: tier, sgm: true,
        qs: r.qs, cost: r.cost_usd, tokens: r.total_tokens
      };
    });
  }

  function shown() {
    return parse().filter(function (p) { return !hidden[p.harness]; });
  }

  /* Non-dominated points, cheapest first: each one is the first run to reach a
     score no cheaper run reached. Ties on cost resolve to the higher score. */
  function frontier(pts) {
    var sorted = pts.slice().sort(function (a, b) {
      return a.cost - b.cost || b.qs - a.qs;
    });
    var best = -Infinity, out = [];
    sorted.forEach(function (p) { if (p.qs > best) { best = p.qs; out.push(p); } });
    return out;
  }

  function linTicks(a, b, n) {
    var raw = (b - a) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; })
      .find(function (s) { return s >= raw; }) || mag * 10;
    var out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  function decadeTicks(a, b) {
    var out = [];
    [0.01, 0.1, 1, 10, 100].forEach(function (base) {
      [1, 2, 5].forEach(function (m) {
        var v = +(base * m).toFixed(6);
        if (v >= a && v <= b) out.push(v);
      });
    });
    return out.length >= 3 ? out : linTicks(a, b, 5);
  }

  function applyText() {
    document.querySelectorAll('[data-ppf-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-ppf-i18n'));
    });
  }

  function applyEmphasis() {
    document.querySelectorAll('#ppf-chart [data-ppf]').forEach(function (node) {
      node.classList.toggle('pp-faded', !!emphasis && node.getAttribute('data-ppf') !== emphasis);
    });
  }

  function draw() {
    var svg = document.getElementById('ppf-chart');
    if (!svg) return;
    svg.textContent = '';
    svg.setAttribute('aria-label', t('aria'));

    var pts = shown();
    hits = [];
    if (!pts.length) return;

    var costs = pts.map(function (p) { return p.cost; });
    var scores = pts.map(function (p) { return p.qs; });
    var c0 = Math.min.apply(null, costs) * 0.8, c1 = Math.max.apply(null, costs) * 1.3;
    var q0 = Math.min.apply(null, scores), q1 = Math.max.apply(null, scores);
    var qp = Math.max(2, (q1 - q0) * 0.06);
    q0 -= qp; q1 += qp;
    var lc0 = Math.log10(c0), lc1 = Math.log10(c1);
    var X = function (v) { return M.l + (Math.log10(v) - lc0) / (lc1 - lc0) * IW; };
    var Y = function (v) { return M.t + IH - (v - q0) / (q1 - q0) * IH; };

    var yv = linTicks(q0, q1, 6), xv = decadeTicks(c0, c1);
    /* Tick-label footprints, kept for the label placer below. Without these a
       frontier label near the left edge lands on top of a y-axis tick. */
    var axisBoxes = yv.map(function (v) {
      return { x0: M.l - 46, x1: M.l - 8, y0: Y(v) - 9, y1: Y(v) + 6 };
    });
    /* The rotated y-axis title is a full-height strip in the left gutter, and it
       was missing from this list. A long frontier label at the cheap end could
       therefore clear every tick and still land across the axis title — which is
       what "DeepSeek V4 Flash (0731) · Pi" did, since the leftmost frontier
       point carries one of the longest names. */
    axisBoxes.push({ x0: 0, x1: 30, y0: M.t, y1: M.t + IH });
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

    /* Staircase first, so the markers sit on top of it. */
    var front = frontier(pts);
    /* Membership is by IDENTITY, not by model name. Four DeepSeek V4 Flash runs
       sit on this chart and only three are on the frontier — keying by name
       enlarged the fourth and told its tooltip it was on the frontier too. */
    var isFrontPoint = function (p) { return front.indexOf(p) !== -1; };
    var d = '';
    front.forEach(function (p, i) {
      if (!i) { d = 'M' + X(p.cost) + ' ' + Y(p.qs); return; }
      d += ' L' + X(p.cost) + ' ' + Y(front[i - 1].qs) + ' L' + X(p.cost) + ' ' + Y(p.qs);
    });
    if (front.length) {
      d += ' L' + X(c1) + ' ' + Y(front[front.length - 1].qs);
      svg.appendChild(el('path', { class: 'ppf-front', d: d }));
    }

    var marks = el('g');
    pts.forEach(function (p) {
      var cx = X(p.cost), cy = Y(p.qs), col = color(p.harness);
      var onF = isFrontPoint(p);
      var rad = onF ? 7 : 5.5;
      var g = el('g', { class: 'pp-mark', tabindex: '0', role: 'img', 'data-ppf': p.harness });
      g.setAttribute('aria-label', p.harness + ' ' + p.model + ': ' + pct(p.qs) + ', ' + usd(p.cost));
      /* 2px surface ring so overlapping runs stay countable. */
      g.appendChild(el('circle', { cx: cx, cy: cy, r: rad + 2, fill: 'none', stroke: cssv('--pp-surface'), 'stroke-width': 3 }));
      g.appendChild(el('circle', { cx: cx, cy: cy, r: rad, fill: col }));
      marks.appendChild(g);
      hits.push({ p: p, cx: cx, cy: cy, rad: rad, g: g, front: onF });
    });
    svg.appendChild(marks);

    /* Only the frontier is labelled. Naming all 55 would be unreadable, and the
       frontier is the row a reader is actually shopping for; everything else is
       one hover away. Greedy placement — a label with no free slot is dropped
       rather than overlaid. */
    var lg = el('g');
    var boxes = hits.map(function (h) {
      return { x0: h.cx - h.rad - 2, x1: h.cx + h.rad + 2, y0: h.cy - h.rad - 2, y1: h.cy + h.rad + 2 };
    }).concat(axisBoxes);
    var collides = function (b) {
      return boxes.some(function (q) { return b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0; });
    };
    /* Frontier points climb the upper-left boundary, so the free space is
       reliably up and to the left; the ladder walks outward from there and
       only drops to below/right once everything above is taken. */
    var place = function (cx, cy, rad, text, fill, size) {
      var tw = text.length * size * 0.56;
      var cands = [];
      /* Rung 0 hugs the marker; each further rung steps another line up. Within
         a rung: centred, then shifted left, then right. */
      [8, 22, 36, 50].forEach(function (dy, r) {
        var y = cy - rad - dy;
        cands.push({ a: 'middle', x: cx, y: y });
        cands.push({ a: 'end', x: cx + rad, y: y });
        cands.push({ a: 'start', x: cx - rad, y: y });
        if (!r) {
          cands.push({ a: 'end', x: cx - rad - 9, y: cy + size * 0.36 });
          cands.push({ a: 'start', x: cx + rad + 9, y: cy + size * 0.36 });
        }
      });
      cands.push({ a: 'end', x: cx - rad - 9, y: cy - 16 });
      cands.push({ a: 'start', x: cx + rad + 9, y: cy - 16 });
      /* Rungs BELOW the marker, mirroring the ones above. The cheapest frontier
         points sit hard against the left axis and carry the longest names
         (model + harness), so there is often no width for them up there — the
         only fits were ones that spilled into the axis gutter. Dropping down is
         both legible and free: the space under the frontier's left end is the
         emptiest part of this chart. */
      [0, 14, 28, 42, 56, 70].forEach(function (dy) {
        var y = cy + rad + size + 5 + dy;
        cands.push({ a: 'middle', x: cx, y: y });
        cands.push({ a: 'start', x: cx - rad, y: y });
        cands.push({ a: 'end', x: cx + rad, y: y });
        /* Flush with the plot's left edge, and ONLY for a point so close to the
           axis that its own centred label would cross it. Offered unguarded,
           this slot is the emptiest on the chart, so the greedy loop hands it to
           whichever point asks first — Claude Opus 5 (high), at $7.70, landed
           against the axis. The guard keeps it to the case it exists for: the
           cheapest frontier points, whose labels are the longest (model +
           harness) and whose column has no room above. */
        if (cx - tw / 2 < M.l) cands.push({ a: 'start', x: M.l + 2, y: y });
      });
      cands.push({ a: 'end', x: cx - rad - 9, y: cy + 20 });
      cands.push({ a: 'start', x: cx + rad + 9, y: cy + 20 });
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        var x0 = c.a === 'start' ? c.x : c.a === 'end' ? c.x - tw : c.x - tw / 2;
        var b = { x0: x0 - 2, x1: x0 + tw + 2, y0: c.y - size + 1, y1: c.y + 4 };
        if (b.x0 < 3 || b.x1 > W - 3 || b.y0 < M.t - 12 || b.y1 > M.t + IH + 10) continue;
        if (collides(b)) continue;
        /* A label pushed several rungs clear of its marker stops reading as that
           marker's label. Past ~34px, draw a hairline from the dot down to the
           label's top edge — placed first so the text paints over it. The line
           is only ever vertical and only ever downward, so it cannot be mistaken
           for the staircase. */
        if (c.y - cy > 34 && c.x !== undefined) {
          var lx = Math.min(Math.max(cx, b.x0 + 6), b.x1 - 6);
          lg.appendChild(el('line', {
            x1: lx, x2: lx, y1: cy + rad + 2, y2: b.y0 - 2, class: 'ppf-leader'
          }));
        }
        var e = el('text', { x: c.x, y: c.y, 'text-anchor': c.a, class: 'pp-dot-name', fill: fill, 'font-size': size });
        e.textContent = text; lg.appendChild(e); boxes.push(b);
        return;
      }
    };
    /* A model can hold several rungs of the staircase — DeepSeek V4 Flash holds
       three, one per harness — and the bare model name then repeats down the
       chart with no way to tell the points apart. Qualify with the harness only
       where the name is ambiguous, so the common case stays short. */
    var frontNameCount = {};
    front.forEach(function (p) {
      frontNameCount[p.model] = (frontNameCount[p.model] || 0) + 1;
    });
    front.forEach(function (p) {
      var text = frontNameCount[p.model] > 1 ? p.model + ' · ' + p.harness : p.model;
      place(X(p.cost), Y(p.qs), 11, text, color(p.harness), 11);
    });
    svg.appendChild(lg);
    applyEmphasis();
  }

  function tooltip(p, isFront) {
    var tip = document.getElementById('ppf-tip');
    tip.textContent = '';
    var head = document.createElement('div');
    head.className = 'pp-tt';
    var key = document.createElement('i');
    key.style.background = color(p.harness);
    var name = document.createElement('span');
    name.textContent = p.model;
    head.appendChild(key); head.appendChild(name);
    var sub = document.createElement('div');
    sub.className = 'pp-ts';
    sub.textContent = p.harness + ' · SGM' + (isFront ? ' · ' + t('tip_front') : '');
    tip.appendChild(head); tip.appendChild(sub);
    var row = function (label, value, big) {
      var dv = document.createElement('div');
      dv.className = 'pp-row';
      var a = document.createElement('span'); a.textContent = label;
      var b = document.createElement('span'); b.textContent = value;
      if (big) b.className = 'pp-big';
      dv.appendChild(a); dv.appendChild(b); tip.appendChild(dv);
    };
    row(t('tip_score'), pct(p.qs), true);
    row(t('tip_cost'), usd(p.cost), true);
    row(t('tip_per_point'), '$' + (p.cost / p.qs).toFixed(3));
    if (p.tokens !== null && p.tokens !== undefined) row(t('tip_tokens'), p.tokens.toFixed(1) + 'M');
  }

  function bindHover() {
    var svg = document.getElementById('ppf-chart');
    if (!svg || bound) return;
    bound = true;
    var wrap = svg.parentElement, tip = document.getElementById('ppf-tip');
    var locate = function (ev) {
      var box = svg.getBoundingClientRect();
      var px = (ev.clientX - box.left) * (W / box.width);
      var py = (ev.clientY - box.top) * (H / box.height);
      var best = null, bd = Infinity;
      hits.forEach(function (h) {
        var dd = (h.cx - px) * (h.cx - px) + (h.cy - py) * (h.cy - py);
        if (dd < bd) { bd = dd; best = h; }
      });
      /* Tighter than the focused chart's 34px: the points are denser here, and
         a generous radius would keep snapping to a neighbour. */
      return bd <= 20 * 20 ? best : null;
    };
    var show = function (h, ev) {
      emphasis = h.p.harness;
      applyEmphasis();
      tooltip(h.p, h.front);
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
      /* Clear the inline position as well — a hidden tooltip still counts
         toward the page's scrollable width. */
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
    var host = document.getElementById('ppf-legend');
    if (!host) return;
    host.textContent = '';
    var counts = {};
    parse().forEach(function (p) { counts[p.harness] = (counts[p.harness] || 0) + 1; });

    HARNESS.forEach(function (h) {
      if (!counts[h]) return;
      var i = document.createElement('span');
      i.className = 'pp-lgi';
      i.setAttribute('data-off', hidden[h] ? '1' : '0');
      i.setAttribute('role', 'checkbox');
      i.setAttribute('aria-checked', String(!hidden[h]));
      i.tabIndex = 0;
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('class', 'pp-key');
      sv.setAttribute('viewBox', '0 0 14 12');
      sv.appendChild(el('circle', { cx: 7, cy: 6, r: 5, fill: color(h) }));
      var text = document.createElement('span');
      text.textContent = h + ' (' + counts[h] + ')';
      i.appendChild(sv); i.appendChild(text);
      var toggle = function () { hidden[h] = !hidden[h]; drawLegend(); draw(); };
      i.addEventListener('click', toggle);
      i.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
      i.addEventListener('pointerenter', function () { emphasis = h; applyEmphasis(); });
      i.addEventListener('pointerleave', function () { emphasis = null; applyEmphasis(); });
      host.appendChild(i);
    });

    var sub = document.getElementById('ppf-sub');
    if (!sub) return;
    sub.textContent = '';
    var addItem = function (build, text) {
      var w = document.createElement('span');
      w.className = 'pp-item';
      if (build) build(w);
      var label = document.createElement('span');
      label.textContent = text;
      w.appendChild(label);
      sub.appendChild(w);
    };
    addItem(function (w) {
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('width', 26); sv.setAttribute('height', 14);
      sv.appendChild(el('path', {
        d: 'M0 12 L9 12 L9 6 L18 6 L18 2 L26 2', fill: 'none',
        stroke: cssv('--muted'), 'stroke-width': 1.8, 'stroke-dasharray': '4 3'
      }));
      w.appendChild(sv);
    }, t('key_front'));
    addItem(null, t('key_hint'));
  }

  function render() { applyText(); drawLegend(); draw(); }

  return {
    render: render,
    /* rows: the Hard track's `rows` array, straight from TRACKS. */
    init: function (rows) { rowsIn = rows || []; render(); bindHover(); }
  };
})();
