/* ATM-Bench-Hard harness comparison chart — leaderboard.html, directly under
   the price-vs-performance chart. Paired with static/css/price_perf.css (it
   reuses that file's palette by sitting inside a .pp-wrap) and fed by
   static/js/harness_rows.js. No build step: drop the files in, add the markup
   below, and call HarnessPerf.init().

   Markup the page must provide:

     <h3 data-hx-i18n="title"></h3>
     <p  data-hx-i18n="intro"></p>
     <div class="pp-wrap hx-wrap">
       <div class="pp-legend" id="hx-legend"></div>
       <div class="pp-sub" id="hx-sub"></div>
       <div class="pp-plot">
         <svg id="hx-chart" viewBox="0 0 880 560" role="img"></svg>
         <div class="pp-tip" id="hx-tip"></div>
       </div>
     </div>

   Like price_perf.js it carries its own strings (HX_I18N) rather than leaning
   on the page's `translations` object, and follows the global `currentLang`;
   call HarnessPerf.render() from setLanguage() to re-render on the toggle.

   COST ON X, HARNESS IN THE MARKER SHAPE
   --------------------------------------
   This chart used a categorical harness axis first, on the assumption that
   within one model the agents cost too nearly the same for a cost axis to
   separate them. Measured, that assumption is wrong. On the log axis the two
   charts above already use, each model's harnesses span:

     DeepSeek 3.5x   MiniMax 2.8x   Kimi 2.3x   Doubao 1.7x   GLM 1.7x

   which is 13% to 30% of the axis width — about 95px to 210px at this size,
   not the near-vertical zigzag the categorical version was defending against.
   So cost goes back on x, where it matches the two charts above it and the
   reader compares all three on one ruler, and the harness moves to the marker
   SHAPE. Nothing is lost: shape was already the second channel, and marker size
   is freed up entirely (it encoded cost, which the axis now carries directly).

   The tightest pair is Kimi/Claude Code and GLM/Claude Code, 15px apart in x
   and 8px in y. They stay legible on colour plus the surface-coloured halo
   every marker carries, but that is the margin — check it before adding a
   model whose harnesses land in the $3 band. */

var HX_I18N = {
  en: {
    title: 'Does the harness matter?',
    intro: 'The same weights, driven by different coding agents. Every point on a line is one '
         + 'model on the same 31 questions with the same memory and judge — only the agent '
         + 'changes — so the vertical spread of a line is the harness effect and the horizontal '
         + 'spread is what that choice costs. This is the inverse of the chart above, where the '
         + 'model varies and each vendor uses its own agent.',
    aria: 'Scatter chart of ATM-Bench-Hard score against run cost, one dashed line per model, '
        + 'marker shape showing which coding agent produced the point.',
    axis_x: 'Run cost (USD, log scale)',
    axis_y: 'Score — higher is better',
    native: 'native',
    key_line: 'dashed line joins one model across agents',
    tip_score: 'Score',
    tip_rel: 'Cost vs cheapest agent',
    tip_cost: 'Run cost',
    tip_gap: 'Behind best agent',
    tip_tokens: 'Tokens / question',
    tip_best: '— best',
    tip_pts: 'pts',
    foot: 'MiniMax-M3 on Claude Code is a real result, not a broken run: every answer is '
        + 'present, but it spent 0.14M tokens per question against 0.50–1.05M for the other '
        + 'three and answered "Unknown" where they found the record. That is also why it is '
        + 'the cheapest point on its line.'
  },
  zh: {
    title: '智能体框架有多重要？',
    intro: '相同的模型权重，交由不同的编程智能体驱动。折线上的每个点都是同一模型在同样的 31 道题、'
         + '同样的记忆与评判下的结果——只有智能体不同——因此折线的纵向落差是框架带来的差异，'
         + '横向跨度则是这一选择的成本代价。这与上方的图表正好相反：那里变化的是模型，'
         + '且各家均使用自家的智能体。',
    aria: 'ATM-Bench-Hard 得分与运行成本的散点图，每个模型一条虚线，标记形状表示所用的编程智能体。',
    axis_x: '运行成本（美元，对数刻度）',
    axis_y: '得分 — 越高越好',
    native: '原厂',
    key_line: '虚线连接同一模型的不同智能体',
    tip_score: '得分',
    tip_rel: '相对最便宜智能体',
    tip_cost: '运行成本',
    tip_gap: '落后最佳框架',
    tip_tokens: 'Token / 每题',
    tip_best: '— 最佳',
    tip_pts: '分',
    foot: 'MiniMax-M3 在 Claude Code 上的结果是真实的，并非运行故障：答案均已产出，'
        + '但它每题仅消耗 0.14M token，而其余三者为 0.50–1.05M，并在其他框架能查到记录之处回答“Unknown”。'
        + '这也正是它成为该折线上最便宜一点的原因。'
  }
};

var HarnessPerf = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var W = 880, H = 560, M = { t: 30, r: 126, b: 62, l: 74 };
  var IW = W - M.l - M.r, IH = H - M.t - M.b;
  var R = 7.4;

  var hidden = {}, hits = [], emphasis = null, bound = false;

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    return e;
  }

  function cssv(name) {
    var host = document.querySelector('.hx-wrap') || document.querySelector('.pp-wrap');
    return host ? getComputedStyle(host).getPropertyValue(name).trim() : '';
  }

  function lang() {
    var l = (typeof currentLang === 'string') ? currentLang : 'en';
    return HX_I18N[l] ? l : 'en';
  }
  function t(key) { return HX_I18N[lang()][key] || HX_I18N.en[key] || key; }

  function color(i) { return cssv('--pp-c' + (i + 1)); }
  function shown() {
    return HARNESS_DATA.models.filter(function (m) { return !hidden[m.key]; });
  }
  function pct(v) { return v.toFixed(1) + '%'; }
  function usd(v) { return '$' + (v < 1 ? v.toFixed(3) : v.toFixed(2)); }

  /* Shapes are area-matched by eye, not by formula: a square drawn at the
     circle's radius reads heavier, a triangle lighter, so each has its own
     multiplier. */
  function shapePath(shape, cx, cy, r) {
    if (shape === 'square') {
      var a = r * 0.9;
      return 'M' + (cx - a) + ' ' + (cy - a) + ' H' + (cx + a) +
             ' V' + (cy + a) + ' H' + (cx - a) + ' Z';
    }
    if (shape === 'diamond') {
      var d = r * 1.2;
      return 'M' + cx + ' ' + (cy - d) + ' L' + (cx + d) + ' ' + cy +
             ' L' + cx + ' ' + (cy + d) + ' L' + (cx - d) + ' ' + cy + ' Z';
    }
    if (shape === 'triangle') {
      var s = r * 1.32, h = s * 0.866;
      return 'M' + cx.toFixed(2) + ' ' + (cy - s).toFixed(2) +
             ' L' + (cx + h).toFixed(2) + ' ' + (cy + s * 0.52).toFixed(2) +
             ' L' + (cx - h).toFixed(2) + ' ' + (cy + s * 0.52).toFixed(2) + ' Z';
    }
    if (shape === 'star') {
      var out = r * 1.42, inn = out * 0.46, pts = [];
      for (var i = 0; i < 10; i++) {
        var rr = (i % 2) ? inn : out, ang = -Math.PI / 2 + i * Math.PI / 5;
        pts.push((cx + rr * Math.cos(ang)).toFixed(2) + ' ' + (cy + rr * Math.sin(ang)).toFixed(2));
      }
      return 'M' + pts.join(' L') + ' Z';
    }
    return 'M' + (cx - r) + ' ' + cy + ' a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0' +
           ' a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0';
  }

  function linTicks(a, b, n) {
    var raw = (b - a) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; })
      .find(function (s) { return s >= raw; }) || mag * 10;
    var out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  /* 1-2-5 within each decade, matching the cost axis on the two charts above so
     all three read on the same ruler. Falls back to linear if the span is too
     narrow to yield three of them. */
  function decadeTicks(a, b) {
    var out = [];
    [0.01, 0.1, 1, 10].forEach(function (base) {
      [1, 2, 5].forEach(function (m) {
        var v = +(base * m).toFixed(6);
        if (v >= a && v <= b) out.push(v);
      });
    });
    return out.length >= 3 ? out : linTicks(a, b, 5);
  }

  function applyText() {
    document.querySelectorAll('[data-hx-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-hx-i18n'));
    });
  }

  function applyEmphasis() {
    document.querySelectorAll('#hx-chart [data-hx]').forEach(function (node) {
      node.classList.toggle('pp-faded', !!emphasis && node.getAttribute('data-hx') !== emphasis);
    });
  }

  function draw() {
    var svg = document.getElementById('hx-chart');
    if (!svg) return;
    svg.textContent = '';
    svg.setAttribute('aria-label', t('aria'));

    var all = [];
    shown().forEach(function (m) {
      m.points.forEach(function (p) { all.push(Object.assign({}, p, { m: m })); });
    });
    if (!all.length) { hits = []; return; }

    var costs = all.map(function (p) { return p.cost; });
    var scores = all.map(function (p) { return p.qs; });
    var c0 = Math.min.apply(null, costs) * 0.86, c1 = Math.max.apply(null, costs) * 1.16;
    var q0 = Math.min.apply(null, scores), q1 = Math.max.apply(null, scores);
    var qp = Math.max(1.6, (q1 - q0) * 0.07);
    q0 -= qp; q1 += qp;
    var lc0 = Math.log10(c0), lc1 = Math.log10(c1);
    var X = function (v) { return M.l + (Math.log10(v) - lc0) / (lc1 - lc0) * IW; };
    var Y = function (v) { return M.t + IH - (v - q0) / (q1 - q0) * IH; };

    var yv = linTicks(q0, q1, 6), xv = decadeTicks(c0, c1);
    var grid = el('g', { class: 'pp-grid' });
    yv.forEach(function (v) { grid.appendChild(el('line', { x1: M.l, x2: M.l + IW, y1: Y(v), y2: Y(v) })); });
    xv.forEach(function (v) { grid.appendChild(el('line', { y1: M.t, y2: M.t + IH, x1: X(v), x2: X(v) })); });
    svg.appendChild(grid);

    var ax = el('g', { class: 'pp-axis' });
    ax.appendChild(el('line', { x1: M.l, x2: M.l + IW, y1: M.t + IH, y2: M.t + IH }));
    ax.appendChild(el('line', { x1: M.l, x2: M.l, y1: M.t, y2: M.t + IH }));
    xv.forEach(function (v) {
      var e = el('text', { x: X(v), y: M.t + IH + 21, 'text-anchor': 'middle' });
      e.textContent = '$' + (v < 1 ? String(v) : v.toFixed(0));
      ax.appendChild(e);
    });
    yv.forEach(function (v) {
      var e = el('text', { x: M.l - 11, y: Y(v) + 4, 'text-anchor': 'end' });
      e.textContent = v.toFixed(0) + '%'; ax.appendChild(e);
    });
    var xt = el('text', { x: M.l + IW / 2, y: H - 12, 'text-anchor': 'middle', class: 'pp-axis-title' });
    xt.textContent = t('axis_x');
    var yt = el('text', {
      x: -(M.t + IH / 2), y: 20, 'text-anchor': 'middle',
      class: 'pp-axis-title', transform: 'rotate(-90)'
    });
    yt.textContent = t('axis_y');
    ax.appendChild(xt); ax.appendChild(yt); svg.appendChild(ax);

    /* Cost-ordered and dashed. Dashed because there is no continuum between two
       harnesses to interpolate along — the line groups one model's points, it
       does not claim intermediate values exist, which is exactly what the solid
       stroke on the effort ladders above DOES claim. */
    var lines = el('g');
    shown().forEach(function (m) {
      var i = HARNESS_DATA.models.indexOf(m);
      var ordered = m.points.slice().sort(function (a, b) { return a.cost - b.cost; });
      lines.appendChild(el('path', {
        class: 'pp-curve', stroke: color(i), 'data-hx': m.key,
        'stroke-dasharray': '7 5', 'stroke-opacity': 0.62,
        d: ordered.map(function (p, j) { return (j ? 'L' : 'M') + X(p.cost) + ' ' + Y(p.qs); }).join(' ')
      }));
    });
    svg.appendChild(lines);

    var marks = el('g');
    hits = [];
    all.forEach(function (p) {
      var cx = X(p.cost), cy = Y(p.qs);
      var col = color(HARNESS_DATA.models.indexOf(p.m));
      var g = el('g', { class: 'pp-mark', tabindex: '0', role: 'img', 'data-hx': p.m.key });
      g.setAttribute('aria-label',
        p.m.label + ' on ' + p.harness + ': ' + pct(p.qs) + ' for ' + usd(p.cost));
      g.appendChild(el('path', {
        d: shapePath(p.shape, cx, cy, R + 2.3), fill: 'none',
        stroke: cssv('--pp-surface'), 'stroke-width': 3
      }));
      g.appendChild(el('path', { d: shapePath(p.shape, cx, cy, R), fill: col }));
      marks.appendChild(g);
      hits.push({ p: p, cx: cx, cy: cy, rad: R, g: g });
    });
    svg.appendChild(marks);

    /* Labels: model name once per line, at its best-scoring point, because that
       is the identity the reader needs first. Then the harness on every marker
       that has room — greedy, and a caption with no free slot is dropped rather
       than overlaid, which is affordable here because the shape already carries
       it and the key below the legend names every shape. */
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
        return true;
      }
      return false;
    };
    shown().forEach(function (m) {
      var col = color(HARNESS_DATA.models.indexOf(m));
      var top = m.points.reduce(function (a, b) { return b.qs > a.qs ? b : a; });
      place(X(top.cost), Y(top.qs), R + 5, m.label, 'pp-name', col, 12.5, 'above');
    });
    all.forEach(function (p) {
      place(X(p.cost), Y(p.qs), R + 2, p.harness, 'pp-tier', cssv('--muted'), 10.5);
    });
    svg.appendChild(lg);
    applyEmphasis();
  }

  function tooltip(p) {
    var tip = document.getElementById('hx-tip');
    tip.textContent = '';
    var head = document.createElement('div');
    head.className = 'pp-tt';
    var key = document.createElement('i');
    key.style.background = color(HARNESS_DATA.models.indexOf(p.m));
    var name = document.createElement('span');
    name.textContent = p.m.label + ' · ' + p.harness + (p.effort ? ' · ' + p.effort : '');
    head.appendChild(key); head.appendChild(name);
    var sub = document.createElement('div');
    sub.className = 'pp-ts';
    sub.textContent = 'SGM · ' + p.answered + '/31';
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
    row(t('tip_gap'), p.gap === 0 ? t('tip_best') : p.gap.toFixed(1) + ' ' + t('tip_pts'));
    row(t('tip_rel'), p.rel.toFixed(2) + 'x');
    row(t('tip_tokens'), p.tokensPerQ.toFixed(2) + 'M');
  }

  function bindHover() {
    var svg = document.getElementById('hx-chart');
    if (!svg || bound) return;
    bound = true;
    var wrap = svg.parentElement, tip = document.getElementById('hx-tip');
    var locate = function (ev) {
      var box = svg.getBoundingClientRect();
      var px = (ev.clientX - box.left) * (W / box.width);
      var py = (ev.clientY - box.top) * (H / box.height);
      var best = null, bd = Infinity;
      hits.forEach(function (h) {
        var d = (h.cx - px) * (h.cx - px) + (h.cy - py) * (h.cy - py);
        if (d < bd) { bd = d; best = h; }
      });
      return bd <= 26 * 26 ? best : null;
    };
    var show = function (h, ev) {
      emphasis = h.p.m.key;
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
    /* Drop the inline position too — a hidden tooltip still counts toward the
       page's scrollable width, so a stale `left` would push the page sideways
       once the viewport narrowed. */
    var hide = function () {
      emphasis = null; applyEmphasis();
      tip.setAttribute('data-show', '0');
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
    var host = document.getElementById('hx-legend');
    if (!host) return;
    host.textContent = '';
    HARNESS_DATA.models.forEach(function (m, idx) {
      var i = document.createElement('span');
      i.className = 'pp-lgi';
      i.setAttribute('data-off', hidden[m.key] ? '1' : '0');
      i.setAttribute('role', 'checkbox');
      i.setAttribute('aria-checked', String(!hidden[m.key]));
      i.tabIndex = 0;
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('class', 'pp-key');
      sv.setAttribute('viewBox', '0 0 26 12');
      var c = color(idx);
      sv.appendChild(el('line', {
        x1: 0, y1: 6, x2: 26, y2: 6, stroke: c, 'stroke-width': 2.8,
        'stroke-dasharray': '5 3.5', 'stroke-opacity': 0.62
      }));
      sv.appendChild(el('circle', { cx: 13, cy: 6, r: 4.4, fill: c }));
      var text = document.createElement('span');
      text.textContent = m.label;
      i.appendChild(sv); i.appendChild(text);
      var toggle = function () { hidden[m.key] = !hidden[m.key]; drawLegend(); draw(); };
      i.addEventListener('click', toggle);
      i.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
      i.addEventListener('pointerenter', function () { emphasis = m.key; applyEmphasis(); });
      i.addEventListener('pointerleave', function () { emphasis = null; applyEmphasis(); });
      host.appendChild(i);
    });

    /* Shape is the harness channel and it is nominal, so it gets a plain key
       with no toggling: hiding "all the triangles" would mean hiding one point
       from every line, which is not a question anyone asks of this chart. Every
       shape is named here, because the on-chart captions are dropped wherever
       they do not fit and this is then the only place the mapping is stated. */
    var sub = document.getElementById('hx-sub');
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
    var swatch = function (shape) {
      return function (w) {
        var sv = document.createElementNS(NS, 'svg');
        sv.setAttribute('width', 15); sv.setAttribute('height', 15);
        sv.appendChild(el('path', { d: shapePath(shape, 7.5, 7.5, 6), fill: cssv('--muted') }));
        w.appendChild(sv);
      };
    };
    HARNESS_DATA.harnesses.forEach(function (h) {
      addItem(swatch(h.shape), h.label + (h.native ? ' (' + t('native') + ')' : ''));
    });
    addItem(function (w) {
      var sv = document.createElementNS(NS, 'svg');
      sv.setAttribute('width', 26); sv.setAttribute('height', 12);
      sv.setAttribute('viewBox', '0 0 26 12');
      sv.appendChild(el('line', {
        x1: 0, y1: 6, x2: 26, y2: 6, stroke: cssv('--muted'), 'stroke-width': 2.4,
        'stroke-dasharray': '5 3.5', 'stroke-opacity': 0.62
      }));
      w.appendChild(sv);
    }, t('key_line'));
  }

  function render() { applyText(); drawLegend(); draw(); }

  return {
    render: render,
    init: function () { render(); bindHover(); }
  };
})();
