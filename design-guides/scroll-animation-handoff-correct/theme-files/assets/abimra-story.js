/* Abimra Studio: "Blank to yours" brand story (section: abimra-brand-story).
   One pinned stage, scrubbed by scroll: a blank tee arrives, a phrase is caught out of the type and flies onto it,
   a photo drops in from a pile of snaps, a squeegee pulls the page red and inks the print,
   then the tee joins a wall of other people's pieces and the section ends on the CTA. */
(function () {
  'use strict';
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var lin = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var ramp = function (p, a, b) { return ease(lin(p, a, b)); };

  var SPEED = 2.2, P_CATCH = 0.22;
  var CAPS = [[0.012, 0.105], [0.15, 0.33], [0.4, 0.56], [0.78, 0.87]];
  var CARDS = {
    wide: [{ x: -0.31, y: -0.17, r: -7 }, { x: 0.3, y: -0.24, r: 8 }, { x: -0.36, y: 0.15, r: 6 }, { x: 0.32, y: 0.2, r: -5 }],
    tall: [{ x: -0.26, y: -0.31, r: -7 }, { x: 0.27, y: -0.33, r: 8 }, { x: -0.27, y: 0.3, r: 6 }, { x: 0.28, y: 0.32, r: -5 }]
  };

  function grainURL() {
    var c = document.createElement('canvas'); c.width = c.height = 220;
    var x = c.getContext('2d'), i;
    x.fillStyle = '#000'; x.fillRect(0, 0, 220, 220);
    x.globalCompositeOperation = 'destination-out';
    for (i = 0; i < 1500; i++) { x.globalAlpha = 0.35 + Math.random() * 0.65; x.beginPath(); x.arc(Math.random() * 220, Math.random() * 220, 0.4 + Math.random() * 1.1, 0, 6.2832); x.fill(); }
    x.lineWidth = 1.2; x.globalAlpha = 0.5;
    for (i = 0; i < 10; i++) { var y = Math.random() * 220, x0 = Math.random() * 220; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + 20 + Math.random() * 50, y + (Math.random() - 0.5) * 3); x.stroke(); }
    return c.toDataURL('image/png');
  }

  function init(sec) {
    if (!sec || sec.__as) return;
    sec.__as = true;
    var $ = function (s) { return sec.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var uid = sec.getAttribute('data-uid') || '';
    var stage = $('.as__stage'), rowsEl = $('.as__rows'), tee = $('.as__tee'), pr = $('.as__pr'), prPhoto = $('.as__prPhoto'), prText = $('.as__prText');
    var fly = $('.as__fly'), red = $('.as__red'), blade = $('.as__blade'), wall = $('.as__wall'), blank = $('.as__blank');
    var cards = $$('.as__card'), caps = $$('.as__capt'), hint = $('.as__hint'), end = $('.as__end'), inked = $$('.as__inked');
    var phrases = (sec.getAttribute('data-phrases') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    var CATCH = (sec.getAttribute('data-catch') || 'Saturday Club').trim();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sec.style.setProperty('--as-grain', 'url(' + grainURL() + ')');
    if (!phrases.length) phrases = ["Nan's 80th", 'Dog dad', 'Est. 1994', 'Hen do', 'The band', 'Little legend', 'Class of 26', 'Stag do', 'Five-a-side'];

    /* ---------- build the type rows, the caught phrase, its landing spot and the flying copies ---------- */
    var rows = [], srcL = [], tgtL = [], flyL = [], catchEl = null;
    for (var r = 0; r < 3; r++) {
      var row = document.createElement('div'); row.className = 'as__row';
      var own = phrases.filter(function (_, i) { return i % 3 === r; });
      if (!own.length) own = phrases.slice(0, 2);
      var seq = [];
      for (var k = 0; k < 2; k++) seq = seq.concat(own); // two passes is plenty and keeps each row under GPU texture limits
      if (r === 1) seq.splice(Math.floor(seq.length / 2), 0, null);
      seq.forEach(function (t, i) {
        if (i) { var d = document.createElement('i'); d.className = 'as__dot'; row.appendChild(d); }
        var s = document.createElement('span');
        if (t === null) {
          s.className = 'as__ph as__ph--catch'; catchEl = s;
          CATCH.split('').forEach(function (ch) { var l = document.createElement('span'); l.textContent = ch; s.appendChild(l); srcL.push(l); });
        } else { s.className = 'as__ph'; s.textContent = t; }
        row.appendChild(s);
      });
      rowsEl.appendChild(row);
      rows.push({ el: row, dir: r === 1 ? 1 : -1, base: 0 });
    }
    CATCH.split('').forEach(function (ch) {
      var t = document.createElement('span'); t.textContent = ch; prText.appendChild(t); tgtL.push(t);
      var f = document.createElement('span'); f.textContent = ch; fly.appendChild(f); flyL.push(f);
    });
    prText.style.fontSize = Math.min(14.5, 100 / (CATCH.length * 0.47)) + 'cqw';

    /* ---------- the wall: every kind of order we print ---------- */
    var PAPER = '#F1EDE3', INKC = '#191813', RED = '#D42E12';
    function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function T(y, size, fill, text, o) {
      o = o || {};
      var fit = Math.min(size, (o.max || 250) / (Math.max(1, text.length) * 0.5));
      return '<text x="' + (o.x || 300) + '" y="' + y + '" text-anchor="middle" font-family="Archivo, \'Arial Narrow\', sans-serif" font-weight="' + (o.w || 800) +
        '" style="font-stretch:75%"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + ' font-size="' + fit.toFixed(1) + '" fill="' + fill + '">' + esc(text) + '</text>';
    }
    function star(cx, cy, r, fill) {
      var d = '';
      for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); }
      return '<path d="' + d + 'Z" fill="' + fill + '"/>';
    }
    function use(id, x, y, w) { return '<use href="#' + id + uid + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '"/>'; }
    // [garment, colour, design]: birthdays, causes, bands, football, family, clubs, leavers, work, weddings, charity, kids' art, brands
    var WALL = [
      ['tee', 'black', function () { return star(300, 262, 72, RED) + T(400, 64, PAPER, 'WORKERS') + T(468, 80, RED, 'UNITE!'); }],
      ['tee', 'white', function () { return T(300, 70, RED, 'BIRTHDAY') + T(382, 98, INKC, 'GIRL') + T(436, 26, RED, '\u2605 \u2605 \u2605'); }],
      ['tee', 'black', function () { return T(258, 60, PAPER, 'LOUD') + T(318, 60, PAPER, 'NEIGHBOURS') + T(368, 22, RED, 'WORLD TOUR 2026', { ls: 3 }) + T(404, 14, PAPER, 'LONDON  LEEDS  GLASGOW', { w: 600 }) + T(426, 14, PAPER, 'CARDIFF  BRISTOL  BELFAST', { w: 600 }); }],
      ['tee', 'white', function () { return T(250, 46, INKC, 'THE GOAT', { ls: 2 }) + T(452, 220, RED, '7'); }],
      ['hood', 'black', function () { return T(290, 56, PAPER, 'CLASS OF') + T(402, 124, RED, '2026') + T(444, 18, PAPER, 'LEAVERS', { ls: 6 }); }],
      ['tee', 'black', function () { return T(300, 84, PAPER, 'BEST') + T(382, 84, RED, 'DAD') + T(430, 28, PAPER, '\u2605\u2605\u2605\u2605\u2605') + T(462, 15, PAPER, 'WOULD RECOMMEND', { ls: 3, w: 600 }); }],
      ['tee', 'white', function () { return T(218, 20, INKC, 'CAF\u00c9 LUNA', { x: 372, max: 90 }) + T(240, 12, RED, 'STAFF', { x: 372, ls: 3 }); }],
      ['tee', 'white', function () { return use('asPhoto1', 215, 200, 170) + T(428, 42, RED, 'DOG DAD'); }],
      ['tee', 'black', function () { return use('asPhoto4', 200, 200, 200); }],
      ['tee', 'white', function () { return T(300, 76, RED, 'BRIDE') + T(382, 76, INKC, 'SQUAD') + '<path d="M300 452c-18-14-34-26-34-42 0-10 8-18 17-18 7 0 13 4 17 10 4-6 10-10 17-10 9 0 17 8 17 18 0 16-16 28-34 42z" fill="' + RED + '"/>'; }],
      ['tee', 'black', function () { return T(262, 40, PAPER, 'ROVERS FC', { ls: 2 }) + T(436, 196, RED, '10'); }],
      ['hood', 'white', function () { return use('asPhoto2', 200, 190, 200) + T(436, 24, INKC, 'MADE BY MAYA, AGE 6', { w: 600 }); }],
      ['tee', 'white', function () { return T(282, 34, INKC, 'I RAN THE') + T(378, 118, RED, '10K') + T(424, 24, INKC, 'FOR CHARITY', { ls: 2 }); }],
      ['tee', 'black', function () { return T(300, 90, PAPER, 'STAG') + T(412, 124, RED, 'DO \u201926'); }],
      ['hood', 'black', function () { return '<circle cx="300" cy="280" r="62" fill="none" stroke="' + RED + '" stroke-width="12"/><path d="M300 190V370M210 280H390" stroke="' + RED + '" stroke-width="12"/>' + T(420, 34, PAPER, 'YOUR BRAND', { ls: 2 }); }],
      ['tee', 'white', function () { return T(300, 64, RED, 'NAN\u2019S') + T(410, 124, INKC, '80TH'); }],
      ['tee', 'black', function () { return use('asPhoto3', 205, 200, 190); }],
      ['hood', 'black', function () { return T(292, 40, PAPER, 'THE PARKERS', { ls: 2 }) + T(338, 22, RED, 'FAMILY REUNION', { ls: 3 }) + T(378, 22, PAPER, 'SUMMER 2026', { ls: 3 }); }],
      ['tee', 'black', function () { return T(300, 50, PAPER, 'LAUNCH') + T(352, 50, PAPER, 'PARTY') + T(398, 22, RED, '14.03.26', { ls: 4 }); }],
      ['tee', 'white', function () { return T(352, 90, RED, 'OUR KID'); }],
      ['tee', 'black', function () { return T(346, 90, RED, CATCH.toUpperCase()); }],
      ['tee', 'white', function () { return T(300, 104, INKC, 'MUM') + T(356, 30, RED, 'EST. 2001', { ls: 4 }); }]
    ];
    function tileSVG(n) {
      var w = WALL[n % WALL.length], fab = w[1] === 'black' ? '#1E1D1A' : '#F4F2EC', d = w[2]();
      if (w[0] === 'hood') d = '<g transform="translate(300 300) scale(.82) translate(-300 -318)">' + d + '</g>';
      return '<svg viewBox="0 0 600 640"><use href="#as' + (w[0] === 'hood' ? 'Hood' : 'Tee') + 'G' + uid + '" style="color:' + fab + '"/>' + d + '</svg>';
    }
    var tiles = [];
    function buildWall(cols, rowsN) {
      wall.innerHTML = ''; tiles = [];
      var n = 0, cc = (cols - 1) / 2, rc = (rowsN - 1) / 2, maxD = Math.hypot(cc, rc);
      for (var y = 0; y < rowsN; y++) for (var x = 0; x < cols; x++) {
        if (x === cc && y === rc) continue; // the hero tee's slot
        var el = document.createElement('div'); el.className = 'as__tile'; el.innerHTML = tileSVG(n++);
        wall.appendChild(el);
        tiles.push({ el: el, gx: x - cc, gy: y - rc, d: Math.hypot(x - cc, y - rc) / maxD });
      }
    }

    /* ---------- layout ---------- */
    var L = { w: 0, h: 0 }, wallShape = '';
    function layout() {
      var rc = stage.getBoundingClientRect();
      L.w = rc.width; L.h = rc.height; L.tall = L.w / L.h < 0.9;
      L.th = L.tall ? Math.min(L.h * 0.5, L.w * 0.8 * 640 / 600) : Math.min(L.h * 0.64, L.w * 0.5 * 640 / 600);
      L.tw = L.th * 600 / 640;
      tee.style.width = L.tw + 'px'; tee.style.height = L.th + 'px';
      tee.style.marginLeft = -L.tw / 2 + 'px'; tee.style.marginTop = -L.th / 2 + 'px';
      var ys = L.tall ? [0.12, 0.27, 0.42] : [0.2, 0.47, 0.74];
      rows.forEach(function (o, i) { o.el.style.top = ys[i] * 100 + '%'; });
      var target = L.tall ? L.w * 0.5 : L.w * 0.33;
      rows[1].base = target - (catchEl.offsetLeft + catchEl.offsetWidth / 2) - rows[1].dir * (P_CATCH - 0.12) * SPEED * L.w;
      rows[0].base = -L.w * 0.35; rows[2].base = -L.w * 0.7;
      [blank].concat(inked).forEach(function (n) { // keep the giant words inside the stage
        n.style.fontSize = '';
        var rg = document.createRange(); rg.selectNodeContents(n);
        var bw = rg.getBoundingClientRect().width, bf = parseFloat(getComputedStyle(n).fontSize);
        if (bw > L.w * 0.94) n.style.fontSize = (bf * L.w * 0.94 / bw).toFixed(1) + 'px';
      });
      L.fs = parseFloat(getComputedStyle(rows[1].el).fontSize);
      flyL.forEach(function (f) { f.style.fontSize = L.fs + 'px'; });
      L.cw = L.tall ? L.w * 0.3 : clamp(L.w * 0.14, 120, 230);
      L.cards = L.tall ? CARDS.tall : CARDS.wide;
      L.tile = L.tw * 0.3;
      var shape = L.tall ? '5x7' : '9x5';
      if (shape !== wallShape) { wallShape = shape; if (L.tall) buildWall(5, 7); else buildWall(9, 5); }
      tiles.forEach(function (t) { t.el.style.width = L.tile + 'px'; t.el.style.height = L.tile * 640 / 600 + 'px'; t.el.style.marginLeft = -L.tile / 2 + 'px'; t.el.style.marginTop = -L.tile * 320 / 600 + 'px'; });
      dirty = true;
    }

    function drift(p) { return lerp(L.h * 0.1, -L.h * 0.12, lin(p, 0.74, 1)); }
    function teePose(p, time) {
      var x = 0, y = 0, s = 1, r = 0;
      var e = ramp(p, 0, 0.085); y += lerp(L.h * 0.75, 0, e); r += lerp(-10, 0, e);
      var a = ramp(p, 0.12, 0.18) - ramp(p, 0.33, 0.4);
      if (L.tall) { y += a * L.h * 0.2; s *= lerp(1, 0.78, a); } else { x += a * L.w * 0.22; y += a * L.h * 0.03; s *= lerp(1, 0.86, a); r += a * 3; }
      var b = ramp(p, 0.58, 0.63) - ramp(p, 0.71, 0.76); s *= 1 - 0.18 * b;
      var w = ramp(p, 0.74, 0.83); s *= lerp(1, 0.3, w); y += drift(p) * w;
      y += Math.sin(time * 1.3) * 5 * (1 - w); r += Math.sin(time * 0.8) * 0.7 * (1 - w);
      return { x: x, y: y, s: s, r: r };
    }

    /* ---------- one frame ---------- */
    function draw(p, time) {
      var S = stage.getBoundingClientRect(), i;
      // writes that the reads below depend on
      var pose = teePose(p, time);
      tee.style.transform = 'translate(' + pose.x.toFixed(1) + 'px,' + pose.y.toFixed(1) + 'px) rotate(' + pose.r.toFixed(2) + 'deg) scale(' + pose.s.toFixed(4) + ')';
      var rowsO = ramp(p, 0.115, 0.16) * (1 - ramp(p, 0.31, 0.36));
      rows.forEach(function (o) {
        o.el.style.opacity = rowsO;
        o.el.style.transform = 'translateX(' + (o.base + o.dir * (p - 0.12) * SPEED * L.w).toFixed(1) + 'px)';
      });
      catchEl.classList.toggle('is-caught', p >= 0.195);

      // reads
      var needFly = p > 0.215 && p < 0.37, fr = [], tr = [];
      if (needFly) for (i = 0; i < srcL.length; i++) { fr.push(srcL[i].getBoundingClientRect()); tr.push(tgtL[i].getBoundingClientRect()); }
      var photoR = p > 0.46 && p < 0.56 ? prPhoto.getBoundingClientRect() : null;
      var prR = pr.getBoundingClientRect();

      // flying letters
      for (i = 0; i < srcL.length; i++) {
        var tt = lin(p, 0.22 + i * 0.005, 0.285 + i * 0.005), fl = flyL[i];
        if (tt <= 0 || !needFly && tt < 1) { srcL[i].style.opacity = ''; tgtL[i].style.opacity = 0; fl.style.display = 'none'; continue; }
        if (tt >= 1) { srcL[i].style.opacity = 0; tgtL[i].style.opacity = 1; fl.style.display = 'none'; continue; }
        var te = ease(tt), a = fr[i], b = tr[i];
        var x = lerp(a.left, b.left, te) - S.left, y = lerp(a.top, b.top, te) - S.top - Math.sin(Math.PI * te) * L.h * 0.12;
        var sc = lerp(1, b.height / Math.max(1, a.height), te), rot = Math.sin(Math.PI * te) * (i % 2 ? -16 : 16);
        srcL[i].style.opacity = 0; tgtL[i].style.opacity = 0;
        fl.style.display = 'block';
        fl.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg) scale(' + sc.toFixed(4) + ')';
      }

      // photo cards
      var landed = false;
      cards.forEach(function (c, i) {
        var d = L.cards[i], k = ramp(p, 0.37 + i * 0.012, 0.44 + i * 0.012), out = i === 0 ? 0 : ramp(p, 0.52 + i * 0.01, 0.58);
        var dr = -(p - 0.4) * L.h * 0.18 * (0.6 + i * 0.25);
        var bx = d.x * L.w, by = d.y * L.h + dr, spread = 1 + (1 - k) * 1.3 + out * 1.6;
        var ox = bx * spread, oy = by * spread, rot = d.r * (1 + (1 - k) * 3);
        var q = 0.07, bb = 0.14, art = L.cw * (1 - 2 * q), f = 0, op = k * (1 - out);
        if (i === 0) {
          f = ramp(p, 0.47, 0.545);
          if (f > 0 && photoR) {
            var tx = photoR.left + photoR.width / 2 - S.left - L.w / 2, ty = photoR.top + photoR.height / 2 - S.top - L.h / 2;
            ox = lerp(ox, tx, f); oy = lerp(oy, ty, f); rot = lerp(rot, pose.r, f); art = lerp(art, photoR.width, f);
            q *= 1 - f; bb *= 1 - f;
          }
          if (p >= 0.545) { op = 0; landed = true; }
          else if (p >= 0.47 && !photoR) op = 0;
        }
        var w = art / (1 - 2 * q), pad = q * w, oxT = w / 2, oyT = pad + art / 2;
        c.style.opacity = op;
        c.style.width = w.toFixed(1) + 'px';
        c.style.padding = pad.toFixed(1) + 'px ' + pad.toFixed(1) + 'px ' + ((q + bb) * w).toFixed(1) + 'px';
        c.style.transformOrigin = oxT.toFixed(1) + 'px ' + oyT.toFixed(1) + 'px';
        c.style.transform = 'translate(' + (L.w / 2 + ox - oxT).toFixed(1) + 'px,' + (L.h / 2 + oy - oyT).toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
        c.style.boxShadow = f > 0 ? '0 ' + (26 * (1 - f)).toFixed(0) + 'px 40px -24px rgba(25,24,19,' + (0.55 * (1 - f)).toFixed(2) + ')' : '';
        c.style.backgroundColor = f > 0 ? 'rgba(251,249,244,' + (1 - f).toFixed(3) + ')' : '';
        var cap = c.querySelector('.as__cap'); cap.style.opacity = 1 - f * 3; cap.style.bottom = (q * w * 0.9).toFixed(1) + 'px';
      });
      prPhoto.style.opacity = landed ? 1 : 0;

      // the press: squeegee pulls the page red
      var bp = ramp(p, 0.62, 0.7), by2 = lerp(-30, L.h + 10, bp);
      red.style.clipPath = 'inset(0 0 ' + Math.max(0, L.h - Math.max(0, by2)).toFixed(1) + 'px 0)';
      blade.style.display = bp > 0 && bp < 1 ? 'block' : 'none';
      blade.style.transform = 'translateY(' + by2.toFixed(1) + 'px)';
      pr.classList.toggle('is-inked', by2 > prR.top + prR.height / 2 - S.top);
      var io = 1 - ramp(p, 0.75, 0.79);
      inked.forEach(function (n, j) { n.style.opacity = io; n.style.transform = 'translateY(' + ((j ? 1 : -1) * ramp(p, 0.72, 0.79) * L.h * 0.06).toFixed(1) + 'px)'; });

      // wall
      var dim = ramp(p, 0.88, 0.94), dy = drift(p);
      var stepX = L.tile * 1.2, stepY = L.tile * 640 / 600 * 1.14;
      tiles.forEach(function (t) {
        var st = 0.765 + t.d * 0.07, kk = ramp(p, st, st + 0.05);
        if (kk <= 0) { t.el.style.opacity = 0; return; }
        t.el.style.opacity = (kk * (1 - 0.72 * dim)).toFixed(3);
        t.el.style.transform = 'translate(' + (t.gx * stepX).toFixed(1) + 'px,' + (t.gy * stepY + dy).toFixed(1) + 'px) scale(' + lerp(0.4, 1, kk).toFixed(3) + ')';
      });
      tee.style.opacity = 1 - 0.6 * dim;

      // words
      var bo = ramp(p, 0, 0.05) * (1 - ramp(p, 0.09, 0.14));
      blank.style.opacity = bo;
      blank.style.transform = 'translateY(' + (-ramp(p, 0.09, 0.14) * L.h * 0.12).toFixed(1) + 'px) scale(' + lerp(0.94, 1, ramp(p, 0, 0.08)).toFixed(3) + ')';
      caps.forEach(function (c, j) {
        var a = CAPS[j][0], b2 = CAPS[j][1], inn = ramp(p, a, a + 0.02), o = inn * (1 - ramp(p, b2 - 0.02, b2));
        c.style.opacity = o.toFixed(3);
        c.style.transform = 'translateY(' + ((1 - inn) * 14).toFixed(1) + 'px)';
      });
      hint.style.opacity = 1 - ramp(p, 0.004, 0.03);
      var ep = ramp(p, 0.89, 0.95);
      end.style.opacity = ep;
      end.style.transform = 'translateY(' + ((1 - ep) * 30).toFixed(1) + 'px)';
      end.classList.toggle('is-on', ep > 0.5);
    }

    /* ---------- scroll loop ---------- */
    var runway = $('.as__runway'), pt = 0, pd = 0, raf = 0, visible = false, lastT = 0, dirty = true;
    function measure() { var r = runway.getBoundingClientRect(), dist = r.height - window.innerHeight; pt = dist > 0 ? clamp(-r.top / dist, 0, 1) : 1; }
    function frame(now) {
      raf = visible ? requestAnimationFrame(frame) : 0;
      var dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
      measure();
      pd += (pt - pd) * Math.min(1, dt * 7);
      if (Math.abs(pt - pd) < 0.0002) pd = pt;
      draw(pd, now / 1000);
    }

    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); if (reduce) draw(1, 0); });
    window.addEventListener('resize', function () { layout(); if (reduce) draw(1, 0); }, { passive: true });

    if (reduce) { sec.classList.add('is-static'); draw(1, 0); return; }
    sec.classList.remove('is-static');
    measure(); pd = pt; layout(); draw(pd, 0);
    var io = new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !raf) { lastT = 0; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '120px 0px' });
    io.observe(sec);
    sec.__asDestroy = function () { io.disconnect(); cancelAnimationFrame(raf); visible = false; };
  }

  function boot(scope) { Array.prototype.forEach.call((scope || document).querySelectorAll('[data-as]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(); }); else boot();
  document.addEventListener('shopify:section:load', function (e) { boot(e.target); });
  document.addEventListener('shopify:section:unload', function (e) { var s = e.target.querySelector('[data-as]'); if (s && s.__asDestroy) s.__asDestroy(); });
})();
