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
  });

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
