/* Reveal init — offline, animation-first. KaTeX rendered manually (no CDN). */
(function () {
  const deck = new Reveal({
    width: 1280,
    height: 720,
    margin: 0.05,
    minScale: 0.2,
    maxScale: 1.6,
    hash: true,
    slideNumber: 'c/t',
    transition: 'slide',          // global; per-slide overridable via data-transition
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    controls: true,
    progress: true,
    center: false,                // top-aligned content (academic density)
    plugins: [ RevealNotes ]
  });

  // Holm step-down (slide 36): the "Apply" fragment reveals the correction
  // columns (×mult, p_Holm) AND flips the vegetation rows to ns — so the motion
  // itself carries the argument that Grass/Tree drop out under correction.
  function applyHolm(on) {
    const t = document.getElementById('holm-table');
    if (!t) return;
    t.classList.toggle('show-holm', on);
    t.querySelectorAll('tr[data-role="flip"]').forEach(function (r) { r.classList.toggle('flip', on); });
    t.querySelectorAll('tr[data-role="keep"]').forEach(function (r) { r.classList.toggle('keep', on); });
  }
  deck.on('fragmentshown', function (e) {
    if (e.fragment && e.fragment.classList.contains('holm-trigger')) applyHolm(true);
  });
  deck.on('fragmenthidden', function (e) {
    if (e.fragment && e.fragment.classList.contains('holm-trigger')) applyHolm(false);
  });

  // Paired-bootstrap animation (slide 37): a reservoir of 2,100 paired triples
  // (GT/7-Band/RGB) is resampled with replacement 10,000×; the ΔOA distribution
  // fills, then the 95% CI is drawn — entirely above 0 → reject H0.
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) { var n = document.createElementNS(NS, name); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function fillReservoir() {
    var r = document.getElementById('boot-reservoir');
    if (!r || r.childElementCount) return;
    for (var i = 0; i < 210; i++) { var d = document.createElement('i'); d.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's'; r.appendChild(d); }
  }
  function runBootstrap() {
    var svg = document.getElementById('boot-hist'); if (!svg) return;
    fillReservoir();
    var rsv = document.querySelector('.reservoir'); if (rsv) rsv.classList.add('sampling');
    var mean = 10.61, lo = 9.00, hi = 12.24, sd = (hi - lo) / 2 / 1.96;
    var xmin = -3, xmax = 14, x0 = 40, x1 = 452, y0 = 150, y1 = 20;
    function X(v) { return x0 + (v - xmin) / (xmax - xmin) * (x1 - x0); }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: '#1A1D21', 'stroke-width': 1.5 }));
    var bins = 48, bars = [], targets = [], maxT = 0, bw = (x1 - x0) / bins;
    for (var i = 0; i < bins; i++) { var c = xmin + (i + 0.5) / bins * (xmax - xmin); var g = Math.exp(-0.5 * Math.pow((c - mean) / sd, 2)); targets.push(g); if (g > maxT) maxT = g; }
    for (i = 0; i < bins; i++) { var c2 = xmin + (i + 0.5) / bins * (xmax - xmin); var inci = c2 >= lo && c2 <= hi; var r = el('rect', { x: x0 + i * bw + 0.5, width: bw - 1, y: y0, height: 0, fill: inci ? 'rgba(46,134,171,0.78)' : 'rgba(46,134,171,0.32)' }); svg.appendChild(r); bars.push(r); }
    var counter = document.getElementById('boot-k'), t0 = null, DUR = 3200;
    function txt(x, y, s, fill, size, anchor, weight) { var t = el('text', { x: x, y: y, fill: fill, 'font-size': size || 11, 'text-anchor': anchor || 'middle' }); if (weight) t.setAttribute('font-weight', weight); t.textContent = s; svg.appendChild(t); }
    function finish() {
      if (rsv) rsv.classList.remove('sampling');
      svg.appendChild(el('rect', { x: X(lo), width: X(hi) - X(lo), y: y1, height: y0 - y1, fill: 'rgba(46,134,171,0.10)', stroke: '#2E86AB', 'stroke-dasharray': '3 2' }));
      svg.appendChild(el('line', { x1: X(mean), y1: y1, x2: X(mean), y2: y0, stroke: '#2E86AB', 'stroke-width': 2 }));
      svg.appendChild(el('line', { x1: X(0), y1: y1 - 2, x2: X(0), y2: y0, stroke: '#E63946', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
      txt(X(0), y1 - 6, '0', '#E63946', 13, 'middle', '700');
      txt((X(lo) + X(hi)) / 2, y1 - 6, '95% CI · +' + mean.toFixed(2) + ' pp', '#2E86AB', 12, 'middle', '700');
      txt(X(lo), y0 + 15, lo.toFixed(2), '#4A5158', 12.5); txt(X(hi), y0 + 15, hi.toFixed(2), '#4A5158', 12.5);
    }
    function frame(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / DUR), e = 1 - Math.pow(1 - p, 2);
      for (var i = 0; i < bins; i++) { var h = (targets[i] / maxT) * (y0 - y1) * e; bars[i].setAttribute('y', y0 - h); bars[i].setAttribute('height', h); }
      if (counter) counter.textContent = Math.round(10000 * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame); else finish();
    }
    requestAnimationFrame(frame);
  }
  deck.on('fragmentshown', function (e) {
    if (e.fragment && e.fragment.classList.contains('boot-trigger')) runBootstrap();
  });
  // re-arm on slide re-entry: if a presenter steps back to the bootstrap slide
  // with its trigger already revealed, repaint the finished distribution.
  deck.on('slidechanged', function () {
    if (document.querySelector('section.present .boot-trigger.visible')) runBootstrap();
  });

  // Roadmap (slide 2): a single click reveals all chips one-by-one, 1.5 s apart.
  function revealRoadmap(sec) {
    if (!sec) return;
    var chips = sec.querySelectorAll('.rm-chip');
    chips.forEach(function (c) { c.classList.remove('shown'); });
    chips.forEach(function (c, i) {
      setTimeout(function () {
        if (document.querySelector('section.present') === sec) c.classList.add('shown');
      }, i * 1500);
    });
  }
  deck.on('fragmentshown', function (e) {
    if (e.fragment && e.fragment.classList.contains('roadmap-trigger')) {
      revealRoadmap(e.fragment.closest('section'));
    }
  });
  deck.on('slidechanged', function () {
    var sec = document.querySelector('section.present');
    var trig = sec && sec.querySelector('.roadmap-trigger');
    if (!trig) return;
    if (trig.classList.contains('visible')) revealRoadmap(sec);
    else sec.querySelectorAll('.rm-chip').forEach(function (c) { c.classList.remove('shown'); });
  });

  deck.initialize().then(function () {
    renderMath();
    fillReservoir();
    setupNav();
    setupLangToggle();
    setupConfusionToggle();
    paintHeatmap();
    setupNdsm();
    setupPipeline();
  });

  /* ===================== Pipeline spotlight (slide "One shared pipeline") =====================
     Inlined SVG diagram; each of the 7 phase bullets is synced to the matching phase band of the
     flowchart. As a bullet is revealed, two white overlay rects dim everything except that phase's
     horizontal band (colours preserved). The final callout lifts the dimming to show the whole pipeline. */
  function setupPipeline() {
    var svg = document.getElementById('pp-svg');
    if (!svg) return;
    var dimTop = document.getElementById('pp-dim-top'), dimBot = document.getElementById('pp-dim-bot');
    var BANDS = { 1: [118, 178], 2: [200, 268], 3: [272, 326], 4: [338, 400], 5: [410, 482], 6: [486, 540], 7: [548, 672] };
    function spotlight(ph) {
      var b = BANDS[ph];
      if (!b) { dimTop.setAttribute('opacity', '0'); dimBot.setAttribute('opacity', '0'); dimTop.setAttribute('height', '0'); dimBot.setAttribute('height', '0'); return; }
      dimTop.setAttribute('y', '0'); dimTop.setAttribute('height', b[0]); dimTop.setAttribute('opacity', '0.62');
      dimBot.setAttribute('y', b[1]); dimBot.setAttribute('height', 720 - b[1]); dimBot.setAttribute('opacity', '0.62');
    }
    function activePhase() {
      var sec = document.querySelector('section.pipeline-slide');
      if (!sec) return 0;
      var callout = sec.querySelector('.callout');
      if (callout && callout.classList.contains('visible')) return 0; // final: reveal the whole pipeline
      var max = 0;
      sec.querySelectorAll('.pp-li.visible').forEach(function (li) { var p = +li.getAttribute('data-ph'); if (p > max) max = p; });
      return max;
    }
    function inSlide(e) { return e.fragment && e.fragment.closest && e.fragment.closest('.pipeline-slide'); }
    deck.on('fragmentshown', function (e) { if (inSlide(e)) spotlight(activePhase()); });
    deck.on('fragmenthidden', function (e) { if (inSlide(e)) spotlight(activePhase()); });
    deck.on('slidechanged', function () { var s = document.querySelector('section.present'); if (s && s.classList.contains('pipeline-slide')) spotlight(activePhase()); });
    spotlight(0);
  }

  /* ===================== nDSM = DSM − DTM explainer animation =====================
     A 2-D side-profile cross-section: terrain rises to a hill; objects sit on it with
     DSM heights (terrain + own height). Across reveal fragments the terrain flattens to
     0 m and every object drops to its TRUE height above ground (nDSM). Math/icons ported
     from the vetted design candidate; driven by .ndsm-step fragments via deck events. */
  function setupNdsm() {
    var scene = document.getElementById('nd-scene');
    if (!scene) return;
    var SVG = 'http://www.w3.org/2000/svg';
    var PLOT = { x0: 120, x1: 1224, yTop: 170, yBot: 544 };
    var plotW = PLOT.x1 - PLOT.x0, plotH = PLOT.yBot - PLOT.yTop;
    var M_MAX = 58, M_TICK_MAX = 50;
    function mToY(m) { return PLOT.yBot - (m / M_MAX) * plotH; }
    function px(frac) { return PLOT.x0 + frac * plotW; }

    var CTRL = [
      { t: 0.00, m: 0 }, { t: 0.075, m: 0 }, { t: 0.22, m: 5 }, { t: 0.43, m: 20 },
      { t: 0.585, m: 31 }, { t: 0.71, m: 40 }, { t: 0.83, m: 43 }, { t: 0.945, m: 40 }, { t: 1.00, m: 39 }
    ];
    function terrainM(t) {
      t = Math.max(0, Math.min(1, t));
      for (var i = 0; i < CTRL.length - 1; i++) {
        var a = CTRL[i], b = CTRL[i + 1];
        if (t >= a.t && t <= b.t) { var u = (t - a.t) / (b.t - a.t || 1), e = u * u * (3 - 2 * u); return a.m + (b.m - a.m) * e; }
      }
      return CTRL[CTRL.length - 1].m;
    }
    var OBJ = [
      { id: 'car1', type: 'car', t: 0.075, own: 1.5, label: 'Car' },
      { id: 'tree2', type: 'tree', t: 0.22, own: 5, label: 'Tree' },
      { id: 'tree1', type: 'tree', t: 0.43, own: 5, label: 'Tree' },
      { id: 'bldg2', type: 'building', t: 0.585, own: 8, label: 'Building' },
      { id: 'bldg1', type: 'building', t: 0.71, own: 8, label: 'Building' },
      { id: 'car2', type: 'car', t: 0.945, own: 1.5, label: 'Car', hero: true }
    ];
    OBJ.forEach(function (o) { o.terr = terrainM(o.t); o.dsm = o.terr + o.own; });

    (function () {
      var g = document.getElementById('nd-grid');
      for (var m = 0; m <= M_TICK_MAX; m += 10) {
        var y = mToY(m);
        var ln = document.createElementNS(SVG, 'line');
        ln.setAttribute('x1', PLOT.x0); ln.setAttribute('x2', PLOT.x1); ln.setAttribute('y1', y); ln.setAttribute('y2', y);
        ln.setAttribute('stroke', 'var(--line)'); ln.setAttribute('stroke-width', m === 0 ? 0 : 1);
        if (m !== 0) ln.setAttribute('stroke-dasharray', '3 6');
        g.appendChild(ln);
        var tk = document.createElementNS(SVG, 'text');
        tk.setAttribute('x', PLOT.x0 - 11); tk.setAttribute('y', y + 4); tk.setAttribute('text-anchor', 'end');
        tk.setAttribute('font-size', '12.5'); tk.setAttribute('fill', 'var(--ink-faint)'); tk.setAttribute('font-weight', '600');
        tk.textContent = m; g.appendChild(tk);
      }
    })();

    function makeCar(s) {
      var g = document.createElementNS(SVG, 'g'); var w = 36 * s, h = 13 * s, r = 4 * s;
      g.innerHTML =
        '<ellipse cx="0" cy="2" rx="' + (w * 0.55) + '" ry="3.2" fill="var(--c-shadow)" opacity="0.20"/>' +
        '<rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="var(--c-vehicle)" stroke="#B8951F" stroke-width="1.2"/>' +
        '<path d="M' + (-w * 0.30) + ',' + (-h) + ' q ' + (w * 0.06) + ' ' + (-h * 0.85) + ' ' + (w * 0.30) + ' ' + (-h * 0.85) + ' l ' + (w * 0.18) + ' 0 q ' + (w * 0.20) + ' 0 ' + (w * 0.24) + ' ' + (h * 0.85) + ' z" fill="#F6E08F" stroke="#B8951F" stroke-width="0.9"/>' +
        '<circle cx="' + (-w * 0.27) + '" cy="0" r="' + (4.8 * s) + '" fill="var(--c-road)"/>' +
        '<circle cx="' + (w * 0.27) + '" cy="0" r="' + (4.8 * s) + '" fill="var(--c-road)"/>' +
        '<circle cx="' + (-w * 0.27) + '" cy="0" r="' + (1.9 * s) + '" fill="#9aa0a6"/>' +
        '<circle cx="' + (w * 0.27) + '" cy="0" r="' + (1.9 * s) + '" fill="#9aa0a6"/>';
      return g;
    }
    function makeTree(s) {
      var g = document.createElementNS(SVG, 'g');
      g.innerHTML =
        '<ellipse cx="0" cy="2" rx="14" ry="3.4" fill="var(--c-shadow)" opacity="0.20"/>' +
        '<rect x="' + (-2.6 * s) + '" y="' + (-13 * s) + '" width="' + (5.2 * s) + '" height="' + (14 * s) + '" rx="1.6" fill="#7A5230"/>' +
        '<circle cx="0" cy="' + (-23 * s) + '" r="' + (13.5 * s) + '" fill="var(--c-tree)"/>' +
        '<circle cx="' + (-8.5 * s) + '" cy="' + (-16 * s) + '" r="' + (9 * s) + '" fill="#469A4A"/>' +
        '<circle cx="' + (8.5 * s) + '" cy="' + (-16 * s) + '" r="' + (9 * s) + '" fill="#327B36"/>' +
        '<circle cx="0" cy="' + (-30 * s) + '" r="' + (8 * s) + '" fill="#46A04A"/>';
      return g;
    }
    function makeBuilding(s) {
      var g = document.createElementNS(SVG, 'g'); var w = 46 * s, h = 44 * s, win = '';
      for (var rr = 0; rr < 3; rr++) for (var c = 0; c < 3; c++) {
        var wx = -w / 2 + 8 * s + c * (12 * s), wy = -h + 11 * s + rr * (12 * s);
        win += '<rect x="' + wx + '" y="' + wy + '" width="' + (6.5 * s) + '" height="' + (7 * s) + '" rx="1" fill="#F7C2C2"/>';
      }
      g.innerHTML =
        '<ellipse cx="0" cy="2" rx="' + (w * 0.62) + '" ry="3.6" fill="var(--c-shadow)" opacity="0.20"/>' +
        '<rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="2" fill="var(--c-building)" stroke="#A81616" stroke-width="1.2"/>' +
        '<path d="M' + (-w / 2 - 4 * s) + ',' + (-h) + ' L0,' + (-h - 14 * s) + ' L' + (w / 2 + 4 * s) + ',' + (-h) + ' Z" fill="#A81616"/>' +
        win + '<rect x="' + (-7 * s) + '" y="' + (-13 * s) + '" width="' + (14 * s) + '" height="' + (13 * s) + '" rx="1" fill="#8A1212"/>';
      return g;
    }

    var objLayer = document.getElementById('nd-objects');
    OBJ.forEach(function (o) {
      var grp = document.createElementNS(SVG, 'g');
      o.scale = o.type === 'building' ? 1.0 : (o.type === 'tree' ? 1.0 : 1.1);
      var icon = (o.type === 'car' ? makeCar : o.type === 'tree' ? makeTree : makeBuilding)(o.scale);
      grp.appendChild(icon);
      var brk = document.createElementNS(SVG, 'g'); brk.setAttribute('opacity', '0');
      var brLine = document.createElementNS(SVG, 'line');
      brLine.setAttribute('stroke', 'var(--ink-faint)'); brLine.setAttribute('stroke-width', '1.1'); brLine.setAttribute('stroke-dasharray', '2 3');
      brk.appendChild(brLine); grp.appendChild(brk);
      o.dom = { grp: grp, icon: icon, brk: brk, brLine: brLine };
      var chip = document.createElementNS(SVG, 'g');
      var chipBg = document.createElementNS(SVG, 'rect');
      chipBg.setAttribute('rx', '6'); chipBg.setAttribute('height', '27');
      chipBg.setAttribute('fill', o.hero ? 'var(--c-7band)' : '#FFFFFF');
      chipBg.setAttribute('stroke', o.hero ? 'var(--c-7band)' : 'var(--line)'); chipBg.setAttribute('stroke-width', '1.4');
      var chipTx = document.createElementNS(SVG, 'text');
      chipTx.setAttribute('font-size', '15'); chipTx.setAttribute('font-weight', '700'); chipTx.setAttribute('text-anchor', 'middle');
      chipTx.setAttribute('fill', o.hero ? '#fff' : 'var(--ink)');
      chip.appendChild(chipBg); chip.appendChild(chipTx); grp.appendChild(chip);
      o.dom.chip = chip; o.dom.chipBg = chipBg; o.dom.chipTx = chipTx;
      var nm = document.createElementNS(SVG, 'text');
      nm.setAttribute('font-size', '11.5'); nm.setAttribute('font-weight', '700'); nm.setAttribute('text-anchor', 'middle');
      nm.setAttribute('fill', o.hero ? 'var(--c-7band)' : 'var(--ink-faint)'); nm.setAttribute('letter-spacing', '.04em');
      nm.textContent = o.hero ? (o.label + ' ★') : o.label;
      grp.appendChild(nm); o.dom.nm = nm;
      objLayer.appendChild(grp);
    });

    function groundM(o, lift) { return o.terr * (1 - lift); }
    function iconPixHeight(o) { if (o.type === 'car') return 13 * o.scale + 6; if (o.type === 'tree') return 38 * o.scale; return 58 * o.scale; }
    function iconWidth(o) { if (o.type === 'car') return 36 * o.scale; if (o.type === 'tree') return 27 * o.scale; return 46 * o.scale; }
    function fmtVal(m) { var r = Math.round(m * 10) / 10; return ((r % 1 === 0) ? r.toFixed(0) : r.toFixed(1)) + ' m'; }
    function placeObject(o, lift, label) {
      var gx = px(o.t), groundY = mToY(groundM(o, lift));
      o.dom.icon.setAttribute('transform', 'translate(' + gx + ',' + groundY + ')');
      var iconTopY = groundY - iconPixHeight(o), chipY = iconTopY - 33;
      if (chipY < PLOT.yTop + 3) chipY = PLOT.yTop + 3;
      o.dom.chipTx.textContent = label;
      var w = Math.max(56, label.length * 9.0 + 18);
      o.dom.chipBg.setAttribute('x', gx - w / 2); o.dom.chipBg.setAttribute('y', chipY); o.dom.chipBg.setAttribute('width', w);
      o.dom.chipTx.setAttribute('x', gx); o.dom.chipTx.setAttribute('y', chipY + 18.5);
      o.dom.nm.setAttribute('x', gx); o.dom.nm.setAttribute('y', chipY - 6);
      o.dom.brLine.setAttribute('x1', gx - iconWidth(o) / 2 - 7); o.dom.brLine.setAttribute('x2', gx - iconWidth(o) / 2 - 7);
      o.dom.brLine.setAttribute('y1', groundY); o.dom.brLine.setAttribute('y2', iconTopY);
    }

    var terrainFill = document.getElementById('nd-terrainFill'), terrainLine = document.getElementById('nd-terrainLine'),
        grassLine = document.getElementById('nd-grassLine'), dtmTag = document.getElementById('nd-dtmTag'),
        zeroTag = document.getElementById('nd-zeroTag'), zeroBase = document.getElementById('nd-zeroBase'),
        pillEl = document.getElementById('nd-pill'), subEl = document.getElementById('nd-sub'), capEl = document.getElementById('nd-cap');
    function drawTerrain(flatAmt) {
      var pts = [], N = 120;
      for (var i = 0; i <= N; i++) { var t = i / N, m = terrainM(t) * (1 - flatAmt); pts.push([px(t), mToY(m)]); }
      var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
      for (var k = 1; k < pts.length; k++) d += ' L' + pts[k][0].toFixed(1) + ',' + pts[k][1].toFixed(1);
      terrainFill.setAttribute('d', d + ' L' + PLOT.x1 + ',' + PLOT.yBot + ' L' + PLOT.x0 + ',' + PLOT.yBot + ' Z');
      terrainLine.setAttribute('d', d); grassLine.setAttribute('d', d);
    }
    var STAGES = [
      { pill: 'Stage 1 · DSM', sub: '<b>DSM</b> = terrain elevation + object height. The same car reads <b>41.5 m</b> on the hilltop but <b>1.5 m</b> in the valley — terrain relief dominates the signal.', flat: 0, lift: 0, dtm: false, zero: false, brk: false, chip: function (o) { return fmtVal(o.dsm); } },
      { pill: 'Stage 2 · DTM', sub: 'The <b>DTM</b> is the bare-earth surface beneath every object — the terrain baseline that will be subtracted.', flat: 0, lift: 0, dtm: true, zero: false, brk: false, chip: function (o) { return fmtVal(o.dsm); } },
      { pill: 'Stage 3 · nDSM = DSM − DTM', sub: 'Subtract the terrain: the ground <b>flattens to 0 m</b> and every object drops to its <b>true height above ground</b>. The hilltop car: <b>41.5 m → 1.5 m</b>.', flat: 1, lift: 1, dtm: false, zero: true, brk: true, chip: function (o) { return fmtVal(o.own); } },
      { pill: 'Why it matters', sub: 'Normalised, terrain-independent geometry: <b>a car is 1.5 m everywhere</b>, trees 5 m, buildings 8 m — regardless of where they sit on the slope.', flat: 1, lift: 1, dtm: false, zero: true, brk: true, chip: function (o) { return fmtVal(o.own); } }
    ];
    function applyText(S, i) {
      if (capEl) capEl.classList.toggle('flat', i >= 2);
      if (pillEl) pillEl.textContent = S.pill;
      if (subEl) subEl.innerHTML = S.sub;
    }
    function settle(i) {
      var S = STAGES[i];
      drawTerrain(S.flat); terrainFill.setAttribute('fill-opacity', S.flat > 0.5 ? 0.30 : 0.55);
      OBJ.forEach(function (o) { placeObject(o, S.lift, S.chip(o)); o.dom.brk.setAttribute('opacity', S.brk ? '1' : '0'); });
      dtmTag.setAttribute('opacity', S.dtm ? '1' : '0');
      if (S.dtm) { var ty = mToY(terrainM(0.50)); dtmTag.setAttribute('transform', 'translate(' + (px(0.50) - 75) + ',' + (ty + 62) + ')'); }
      zeroBase.setAttribute('opacity', S.zero ? '1' : '0'); zeroTag.setAttribute('opacity', S.zero ? '1' : '0');
      if (S.zero) { var zy = mToY(0); zeroBase.setAttribute('y1', zy); zeroBase.setAttribute('y2', zy); zeroTag.setAttribute('transform', 'translate(' + (PLOT.x0 + 14) + ',' + (zy - 30) + ')'); }
      applyText(S, i);
    }
    var anim = null, cur = 0;
    function animateTo(to) {
      to = Math.max(0, Math.min(STAGES.length - 1, to));
      if (to === cur && !anim) { settle(to); return; }
      if (anim) { cancelAnimationFrame(anim.raf); anim = null; }
      var from = cur, Sf = STAGES[from], St = STAGES[to];
      applyText(St, to);
      dtmTag.setAttribute('opacity', St.dtm ? '1' : '0');
      if (St.dtm) { var ty = mToY(terrainM(0.50)); dtmTag.setAttribute('transform', 'translate(' + (px(0.50) - 75) + ',' + (ty + 62) + ')'); }
      var zy = mToY(0);
      zeroBase.setAttribute('opacity', St.zero ? '1' : '0'); zeroBase.setAttribute('y1', zy); zeroBase.setAttribute('y2', zy);
      zeroTag.setAttribute('opacity', St.zero ? '1' : '0'); zeroTag.setAttribute('transform', 'translate(' + (PLOT.x0 + 14) + ',' + (zy - 30) + ')');
      OBJ.forEach(function (o) { o.dom.brk.setAttribute('opacity', St.brk ? '1' : '0'); });
      // the DSM−DTM subtraction (DTM stage 1 ↔ nDSM stage 2) plays slower for emphasis
      var slow = (Math.min(from, to) === 1 && Math.max(from, to) === 2);
      var t0 = performance.now(), dur = slow ? 1900 : 850, f0 = Sf.flat, f1 = St.flat, l0 = Sf.lift, l1 = St.lift;
      function frame(now) {
        var p = Math.min(1, (now - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var flat = f0 + (f1 - f0) * e, lift = l0 + (l1 - l0) * e;
        drawTerrain(flat); terrainFill.setAttribute('fill-opacity', 0.55 + (0.30 - 0.55) * flat);
        OBJ.forEach(function (o) {
          var vf = Sf.chip(o), vt = St.chip(o), label;
          if (vf !== vt) { var nf = parseFloat(vf), nt = parseFloat(vt); label = fmtVal(nf + (nt - nf) * e); } else label = vt;
          placeObject(o, lift, label);
        });
        if (p < 1) { anim = { raf: requestAnimationFrame(frame) }; } else { anim = null; cur = to; settle(to); }
      }
      cur = to; anim = { raf: requestAnimationFrame(frame) };
    }

    function stageFromFragments() {
      var sec = document.querySelector('section.ndsm-slide');
      return sec ? sec.querySelectorAll('.ndsm-step.visible').length : 0;
    }
    function isPresent() { var sec = document.querySelector('section.present'); return sec && sec.classList.contains('ndsm-slide'); }
    deck.on('fragmentshown', function (e) { if (e.fragment && e.fragment.closest && e.fragment.closest('.ndsm-slide')) animateTo(stageFromFragments()); });
    deck.on('fragmenthidden', function (e) { if (e.fragment && e.fragment.closest && e.fragment.closest('.ndsm-slide')) animateTo(stageFromFragments()); });
    deck.on('slidechanged', function () { if (isPresent()) { if (anim) { cancelAnimationFrame(anim.raf); anim = null; } cur = stageFromFragments(); settle(cur); } });

    settle(0);
  }

  /* ===================== EN / EL language toggle =====================
     A pill button (top-right, left of ☰; or press "l") that flips the deck
     between English and Greek in place, on any slide. The actual swap is pure
     CSS: toggling body.lang-el shows every .lang-el block and hides its .lang-en
     sibling (see theme.css). Numbers, KaTeX and figures stay as they are. */
  function setupLangToggle() {
    var btn = document.createElement('button');
    btn.id = 'langToggle'; btn.type = 'button';
    btn.title = 'Switch language · English / Ελληνικά (l)';
    btn.setAttribute('aria-label', 'Switch language');
    function render() {
      var el = document.body.classList.contains('lang-el');
      btn.innerHTML =
        '<span class="' + (el ? 'lt-off' : 'lt-on') + '">EN</span>' +
        '<span class="lt-sep">/</span>' +
        '<span class="' + (el ? 'lt-on' : 'lt-off') + '">ΕΛ</span>';
    }
    // Keep the document language in sync so CSS text-transform:uppercase applies
    // Greek case rules — i.e. capitals drop their tonos (correct Greek typography).
    function apply() {
      var el = document.body.classList.contains('lang-el');
      document.documentElement.lang = el ? 'el' : 'en';
      render();
    }
    function toggle() { document.body.classList.toggle('lang-el'); apply(); }
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    apply();
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'l' || e.key === 'L') { e.preventDefault(); toggle(); }
    }, true);
    window.__lang = { toggle: toggle, set: function (el) { document.body.classList.toggle('lang-el', !!el); apply(); } };
  }

  // Paint the confusion matrices as heat-maps (Eik30/Eik31 style): graded cell
  // fills from the cell value, blue for 7-Band, red for RGB, diverging for the
  // Difference tab. Diagonal cells get a strong fill + white bold text. Runs on
  // all .cm-tbl (hidden ones included) once on ready; toggling only shows/hides.
  function paintHeatmap() {
    document.querySelectorAll('table.cm-tbl').forEach(function (tbl) {
      var mode = tbl.getAttribute('data-cm');           // '7band' | 'rgb' | 'diff'
      var rgb  = mode === 'rgb' ? '230,57,70' : '46,134,171';
      tbl.querySelectorAll('tbody tr').forEach(function (tr, ri) {
        var cells = tr.querySelectorAll('td');
        for (var ci = 1; ci < cells.length; ci++) {     // cells[0] = row header
          var td = cells[ci];
          var v = parseFloat(td.textContent.trim().replace('−', '-'));
          if (isNaN(v)) { td.style.background = 'transparent'; continue; }
          var diag = (ci - 1) === ri;
          if (mode === 'diff') {
            var ad = Math.min(Math.abs(v) / 35, 1);
            if (v > 0)      { td.style.background = 'rgba(46,139,87,' + (ad * 0.80).toFixed(3) + ')'; td.style.fontWeight = '700'; }
            else if (v < 0) { td.style.background = 'rgba(230,57,70,' + (ad * 0.70).toFixed(3) + ')'; }
            else            { td.style.background = 'transparent'; }
            if (ad * 0.80 > 0.5) td.style.color = '#fff';
          } else {
            var a = Math.min(v / 100, 1);
            if (diag) {
              td.style.background = 'rgba(' + rgb + ',' + Math.max(a * 0.90, 0.55).toFixed(3) + ')';
              td.style.color = '#fff'; td.style.fontWeight = '700';
            } else if (v > 0) {
              td.style.background = 'rgba(' + rgb + ',' + (a * 0.78).toFixed(3) + ')';
            } else {
              td.style.background = 'transparent';
            }
          }
        }
      });
    });
  }

  // 7-Band / RGB confusion-matrix switch (slide "Results · confusion matrices")
  function setupConfusionToggle() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.cm-btn') : null;
      if (!b) return;
      var sec = b.closest('section'); if (!sec) return;
      var cm = b.getAttribute('data-cm');
      sec.querySelectorAll('.cm-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      sec.querySelectorAll('.cm-img, .cm-tbl').forEach(function (el) { el.hidden = el.getAttribute('data-cm') !== cm; });
    });
  }

  // re-render math on fragment/slide changes is unnecessary (all in DOM),
  // but harmless to re-run once after ready.
  function renderMath() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  /* ===================== TOC / on-demand navigation overlay =====================
     A menu (button top-right, or press "m") that lists every slide by a short
     descriptive label grouped by section. Click a label to jump; tick/untick a
     slide to include/drop it from the linear run-through. All slides start
     included. Dropping is done with a custom skip handler because this reveal
     build does NOT honour data-visibility toggled at runtime (verified). The
     whole UI is injected here so index.html keeps its structure untouched. */
  var TOC = [
    { s:'',                        t:'Title slide' },
    { s:'A · Introduction',        t:'The question & the roadmap' },
    { s:'B · Vision background',   t:'How vision learned to see' },
    { s:'B · Vision background',   t:'The 4 + 1 vision tasks' },
    { s:'B · Vision background',   t:'Why UAV mapping is harder' },
    { s:'B · Vision background',   t:'Why semantic segmentation' },
    { s:'C · Architecture',        t:'ResNet & residual learning' },
    { s:'C · Architecture',        t:'DeepLab: atrous & ASPP' },
    { s:'C · Architecture',        t:'Our stack: + PointRend' },
    { s:'C · Architecture',        t:'A shared vocabulary' },
    { s:'D · Data & sensor',       t:'The Altum-PT sensor' },
    { s:'D · Data & sensor',       t:'Study area: Pamfila, Lesvos' },
    { s:'D · Data & sensor',       t:'Three Drone2Map projects' },
    { s:'D · Data & sensor',       t:'Five metadata namespaces' },
    { s:'D · Data & sensor',       t:'Photogrammetric processing' },
    { s:'D · Data & sensor',       t:'7-band composite production' },
    { s:'D · Data & sensor',       t:'The 7-band composite' },
    { s:'D · Data & sensor',       t:'nDSM: DSM − DTM (animation)' },
    { s:'E · Dataset & classes',   t:'Seven land-cover classes' },
    { s:'E · Dataset & classes',   t:'Image chips & label masks' },
    { s:'E · Dataset & classes',   t:'Building the training chips' },
    { s:'E · Dataset & classes',   t:'Severe class imbalance' },
    { s:'F · Class separability',  t:'Spectrum separates vegetation' },
    { s:'F · Class separability',  t:'Geometry isolates the built-up' },
    { s:'F · Class separability',  t:'Heat splits look-alike spectra' },
    { s:'F · Class separability',  t:'Each dimension fixes a confusion' },
    { s:'G · Training',            t:'Same protocol, twice' },
    { s:'G · Training',            t:'Convergence & loss curves' },
    { s:'H · Evaluation design',   t:'How we measure a map' },
    { s:'H · Evaluation design',   t:'Internal validation leads' },
    { s:'H · Evaluation design',   t:'Four independent methods' },
    { s:'H · Evaluation design',   t:'M4: the same 2,100 points' },
    { s:'I · Statistical proof',   t:'McNemar: where models disagree' },
    { s:'I · Statistical proof',   t:'Holm correction (animated)' },
    { s:'I · Statistical proof',   t:'Paired bootstrap (animated)' },
    { s:'J · Results & anatomy',   t:'7-Band wins every metric' },
    { s:'J · Results & anatomy',   t:'Confusion matrices' },
    { s:'J · Results & anatomy',   t:'Per-class ΔF1 gains' },
    { s:'J · Results & anatomy',   t:'Anatomy: geometry & heat (H3)' },
    { s:'J · Results & anatomy',   t:'The Tree paradox' },
    { s:'K · Map & tool',          t:'One map, three readings' },
    { s:'K · Map & tool',          t:'Raster to vectors: the Toolbox' },
    { s:'K · Map & tool',          t:'One shared pipeline' },
    { s:'K · Map & tool',          t:'Live demo: ArcGIS Pro' },
    { s:'K · Map & tool',          t:'Vehicle Analysis layout' },
    { s:'K · Map & tool',          t:'Building Analysis layout' },
    { s:'K · Map & tool',          t:'Tree Analysis layout' },
    { s:'K · Map & tool',          t:'Road Analysis layout' },
    { s:'L · Conclusions',         t:'What you can use today' },
    { s:'L · Conclusions',         t:'Four questions, four answers' },
    { s:'L · Conclusions',         t:'What bounds these conclusions' },
    { s:'L · Conclusions',         t:'Two horizons (future work)' },
    { s:'L · Conclusions',         t:'Thank you' }
  ];
  var excluded = new Set();
  var prevH = 0, explicitJump = -1;
  function firstIncluded(from, dir, total) {
    for (var i = from; i >= 0 && i < total; i += dir) { if (!excluded.has(i)) return i; }
    return -1;
  }
  function shownCount() { return TOC.length - excluded.size; }

  function setupNav() {
    var btn = document.createElement('button');
    btn.id = 'navToggle'; btn.type = 'button';
    btn.title = 'Go to slide (m)'; btn.setAttribute('aria-label', 'Go to slide');
    btn.innerHTML = '&#9776;';
    document.body.appendChild(btn);

    var ov = document.createElement('div'); ov.id = 'navOverlay'; ov.hidden = true;
    ov.innerHTML =
      '<div class="nav-panel" role="dialog" aria-label="Go to slide">' +
        '<div class="nav-head">' +
          '<div class="nav-title">Go to slide <span id="navCount"></span></div>' +
          '<div class="nav-actions">' +
            '<button id="navAll" type="button">All</button>' +
            '<button id="navNone" type="button">None</button>' +
            '<button id="navClose" type="button" aria-label="Close">&#10005;</button>' +
          '</div>' +
        '</div>' +
        '<div class="nav-hint">Click a title to jump &nbsp;·&nbsp; untick to drop a slide from the run-through</div>' +
        '<div class="nav-list" id="navList"></div>' +
      '</div>';
    document.body.appendChild(ov);

    var list = ov.querySelector('#navList');
    var countEl = ov.querySelector('#navCount');
    var lastSect = null;
    TOC.forEach(function (item, h) {
      if (item.s && item.s !== lastSect) {
        var sh = document.createElement('div'); sh.className = 'nav-sect';
        sh.textContent = item.s; list.appendChild(sh); lastSect = item.s;
      }
      var row = document.createElement('div'); row.className = 'nav-row'; row.setAttribute('data-h', h);
      var chk = document.createElement('input'); chk.type = 'checkbox'; chk.className = 'nav-chk';
      chk.checked = true; chk.setAttribute('aria-label', 'Include in run-through');
      var jmp = document.createElement('button'); jmp.type = 'button'; jmp.className = 'nav-jump';
      jmp.textContent = item.t;
      row.appendChild(chk); row.appendChild(jmp); list.appendChild(row);
      jmp.addEventListener('click', function () { explicitJump = h; deck.slide(h, 0, 0); closeNav(); });
      chk.addEventListener('change', function () {
        if (chk.checked) excluded.delete(h); else excluded.add(h);
        row.classList.toggle('excluded', !chk.checked);
        updateCount();
      });
    });
    function updateCount() { countEl.textContent = '· ' + shownCount() + ' of ' + TOC.length + ' shown'; }
    updateCount();

    ov.querySelector('#navAll').addEventListener('click', function () {
      excluded.clear();
      list.querySelectorAll('.nav-chk').forEach(function (c) { c.checked = true; });
      list.querySelectorAll('.nav-row').forEach(function (r) { r.classList.remove('excluded'); });
      updateCount();
    });
    ov.querySelector('#navNone').addEventListener('click', function () {
      excluded.clear(); TOC.forEach(function (_, h) { excluded.add(h); });
      list.querySelectorAll('.nav-chk').forEach(function (c) { c.checked = false; });
      list.querySelectorAll('.nav-row').forEach(function (r) { r.classList.add('excluded'); });
      updateCount();
    });
    ov.querySelector('#navClose').addEventListener('click', closeNav);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeNav(); });
    btn.addEventListener('click', function () { ov.hidden ? openNav() : closeNav(); });

    function markCurrent() {
      var cur = deck.getIndices().h;
      list.querySelectorAll('.nav-row').forEach(function (r) {
        r.classList.toggle('cur', (+r.getAttribute('data-h')) === cur);
      });
    }
    function openNav() {
      ov.hidden = false; markCurrent();
      var c = list.querySelector('.nav-row.cur'); if (c) c.scrollIntoView({ block: 'center' });
    }
    function closeNav() { ov.hidden = true; }

    // custom skip: if navigation lands on a dropped slide, hop to the nearest
    // included slide in the direction of travel (bounce back at the edges).
    deck.on('slidechanged', function (e) {
      var h = e.indexh;
      if (h === explicitJump) { explicitJump = -1; prevH = h; markCurrent(); return; }
      if (excluded.has(h)) {
        var dir = (h >= prevH) ? 1 : -1, total = deck.getTotalSlides();
        var t = firstIncluded(h + dir, dir, total);
        if (t < 0) t = firstIncluded(h - dir, -dir, total);
        if (t >= 0 && t !== h) { prevH = h; deck.slide(t, 0, 0); return; }
      }
      prevH = h; markCurrent();
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'm' || e.key === 'M') { e.preventDefault(); ov.hidden ? openNav() : closeNav(); }
      else if (e.key === 'Escape' && !ov.hidden) { e.preventDefault(); e.stopPropagation(); closeNav(); }
    }, true);

    window.__nav = { open: openNav, close: closeNav, mark: markCurrent };
  }

  window.__deck = deck;
})();
