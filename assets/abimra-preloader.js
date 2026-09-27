/* Abimra Studio: "First pull" preloader.
   Every first visit is a print run: a 3D tee takes three squeegee passes while the store loads
   (fetching the design, printing, shipping), the ink layers slide into register, and a final pull wipes the intro away.
   Events on document: 'abimra:intro:reveal' (wipe starts) and 'abimra:intro:done' (overlay gone); html gets .intro-done.
   API: window.AbimraPreloader.play() / .skip() */
(function () {
  'use strict';
  var root = document.getElementById('abimra-preloader');
  if (!root || root.__apl) return;
  root.__apl = true;

  /* [abmira] localStorage, not localStorage. The intro is meant to play
     on a visitor's first visit and never again, rather than once per
     browsing session. Key unchanged. */
  var KEY = 'abimra:intro-seen';
  var TAU = Math.PI * 2;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var q = function (s) { return root.querySelector(s); };
  var el = {
    num: q('[data-apl-num]'), status: q('[data-apl-status]'), swatch: q('[data-apl-swatch]'),
    skip: q('[data-apl-skip]'), gl: q('.apl__gl'), bg: q('.apl__bg'), blade: q('.apl__blade'), sr: q('[data-apl-sr]'),
    segs: Array.prototype.slice.call(root.querySelectorAll('.apl__seg i'))
  };
  var MIN = +root.getAttribute('data-min') || 2400;
  var STAGES = (root.getAttribute('data-stages') || 'Fetching your design|Printing|Shipping your order').split('|');
  var DONE = root.getAttribute('data-done') || 'Ready to wear';
  var MAX_WAIT = 8000;
  var THREE_SRC = root.getAttribute('data-three') || 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  var loaded = document.readyState === 'complete';
  window.addEventListener('load', function () { loaded = true; });
  var fontsReady = !document.fonts;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontsReady = true; if (gl) gl.fontsDirty = true; });

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  var norm = document.createElement('canvas').getContext('2d');
  function toHex(v, fb) { norm.fillStyle = fb; if (v) norm.fillStyle = v; return norm.fillStyle; }
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255; }
  function cssv(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  function unq(s, fb) { s = (s || '').replace(/^["']|["']$/g, ''); return s || fb; }

  var C = {};
  function readColors() {
    C.paper = toHex(cssv('--apl-paper'), '#EEEAE0');
    C.ink = toHex(cssv('--apl-ink'), '#191813');
    C.red = toHex(cssv('--apl-red'), '#D42E12');
    C.dark = lum(C.paper) < 0.4;
  }
  var TEE = { black: '#1E1D1A', white: '#F2F0E9' };
  // one brand palette: red, then paper-white on a black tee or ink on a white one
  function inkColors() { var top = S.garment === 'black' ? '#F1EDE3' : C.ink; return [C.red, top, top]; }

  var S = { phase: 'idle', t0: 0, last: 0, shown: 0, garment: 'black', raf: 0, lockAt: 0, exitAt: 0,
            statusIdx: -1, pct: -1, reduce: false, wantGL: false, minDur: MIN, lead: 650 };
  var gl = null;

  /* ---------- halftone field ---------- */
  var bg = { ctx: el.bg.getContext('2d'), w: 0, h: 0, mx: -1, my: -1, tx: -1, ty: -1, mouse: false, ripples: [] };
  function bgResize() {
    bg.w = window.innerWidth; bg.h = window.innerHeight;
    el.bg.width = Math.round(bg.w * DPR); el.bg.height = Math.round(bg.h * DPR);
    bg.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (bg.mx < 0) { bg.mx = bg.tx = bg.w / 2; bg.my = bg.ty = bg.h * 0.48; }
  }
  function bgDraw(now, dtms) {
    var c = bg.ctx, w = bg.w, h = bg.h, rip = bg.ripples, i;
    if (!bg.mouse) { bg.tx = w / 2 + Math.cos(now * 0.00045) * w * 0.3; bg.ty = h * 0.48 + Math.sin(now * 0.0007) * h * 0.22; }
    var k = 1 - Math.exp(-dtms * 0.009);
    bg.mx += (bg.tx - bg.mx) * k; bg.my += (bg.ty - bg.my) * k;
    c.clearRect(0, 0, w, h);
    c.fillStyle = C.ink; c.globalAlpha = C.dark ? 0.2 : 0.14;
    var sp = w < 720 ? 18 : 22, R = Math.max(w, h) * 0.14, inv = 1 / (2 * R * R), row = 0;
    c.beginPath();
    for (var y = sp / 2; y < h + sp; y += sp * 0.866, row++) {
      for (var x = (row & 1) ? sp / 2 : 0; x < w + sp; x += sp) {
        var dx = x - bg.mx, dy = y - bg.my;
        var r = 0.7 + 4.6 * Math.exp(-(dx * dx + dy * dy) * inv);
        for (i = 0; i < rip.length; i++) {
          var p = rip[i], ex = x - p.x, ey = y - p.y, f = Math.sqrt(ex * ex + ey * ey) - p.a * 700;
          r += 3.4 * (1 - p.a) * Math.exp(-f * f / 1800);
        }
        if (r < 0.5) continue;
        c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
      }
    }
    c.fill(); c.globalAlpha = 1;
    for (i = rip.length - 1; i >= 0; i--) { rip[i].a += dtms / 1400; if (rip[i].a >= 1) rip.splice(i, 1); }
  }

  /* ---------- the print (drawn onto a canvas texture, one layer per squeegee pass) ---------- */
  function setFont(c, weight, size, family, stretch) {
    c.font = weight + ' ' + size + 'px ' + family;
    if ('fontStretch' in c) c.fontStretch = stretch || 'normal';
  }
  function fitText(c, text, weight, size, maxW, stretch) {
    var fam = 'Archivo, "Arial Narrow", sans-serif';
    setFont(c, weight, size, fam, stretch);
    var w = c.measureText(text).width;
    if (w > maxW) setFont(c, weight, Math.floor(size * maxW / w), fam, stretch);
  }
  var LAYERS = [
    function (c) { // pass 1: sun with sunset cuts
      c.beginPath(); c.arc(512, 378, 250, 0, TAU); c.fill();
      c.globalCompositeOperation = 'destination-out';
      for (var k = 0; k < 4; k++) c.fillRect(200, 468 + k * 40, 624, 8 + k * 5);
    },
    function (c) { // pass 2: halftone overprint
      c.beginPath();
      for (var y = 190, row = 0; y < 720; y += 24, row++) {
        for (var x = 150 + (row & 1 ? 12 : 0); x < 900; x += 24) {
          var dx = x - 620, dy = y - 440;
          if (dx * dx + dy * dy > 270 * 270) continue;
          var t = clamp((x - 350) / 550 * 0.55 + (y - 190) / 530 * 0.65, 0, 1), r = 1.5 + 10.5 * t;
          c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
        }
      }
      c.fill();
    },
    function (c) { // pass 3: type
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      fitText(c, 'MADE TO BE', 800, 150, 780, 'condensed'); c.fillText('MADE TO BE', 512, 770);
      fitText(c, 'ADMIRED.', 900, 236, 880, 'condensed'); c.fillText('ADMIRED.', 512, 962);
      setFont(c, 500, 30, '"IBM Plex Mono", ui-monospace, monospace');
      if ('letterSpacing' in c) c.letterSpacing = '6px';
      c.fillText('ABIMRA STUDIO', 512, 92);
      if ('letterSpacing' in c) c.letterSpacing = '0px';
    }
  ];
  var OFF = [[-38, -24, -0.06], [34, 28, 0.05], [16, -34, -0.035]];
  function drawPrint(g, reveal, mis) {
    var c = g.pctx, cols = inkColors(), i;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.clearRect(0, 0, 1024, 1024);
    for (i = 0; i < 3; i++) {
      if (reveal[i] <= 0.001) continue;
      c.save();
      c.beginPath(); c.rect(0, 0, 1024, 1024 * reveal[i]); c.clip(); // the squeegee edge stays level
      c.translate(512 + OFF[i][0] * mis, 512 + OFF[i][1] * mis); c.rotate(OFF[i][2] * mis); c.translate(-512, -512);
      c.globalCompositeOperation = (i === 1 && S.garment === 'white') ? 'multiply' : 'source-over';
      c.fillStyle = cols[i];
      LAYERS[i](c);
      c.restore();
    }
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 0.9; c.drawImage(g.grain, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    g.printTex.needsUpdate = true;
  }
  function reveals(p) {
    if (p >= 1) return [1, 1, 1];
    var i = Math.floor(p * 3), r = p * 3 - i, out = [0, 0, 0];
    for (var j = 0; j < 3; j++) out[j] = j < i ? 1 : j === i ? easeIO(clamp(r / 0.85, 0, 1)) : 0;
    return out;
  }

  /* ---------- 3D scene ---------- */
  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); }
    catch (e) { return false; }
  }
  function loadThree() {
    if (window.THREE || document.querySelector('script[data-apl-three]')) return;
    var s = document.createElement('script');
    s.src = THREE_SRC; s.async = true; s.setAttribute('data-apl-three', '');
    document.head.appendChild(s);
  }
  function teeShape(T) {
    var s = new T.Shape();
    s.moveTo(-0.62, 1.78);
    s.quadraticCurveTo(0, 1.10, 0.62, 1.78);      // neck scoop
    s.quadraticCurveTo(0.95, 1.72, 1.30, 1.60);
    s.quadraticCurveTo(1.80, 1.40, 2.18, 0.98);   // shoulder into sleeve
    s.lineTo(1.74, 0.42);                         // cuff
    s.quadraticCurveTo(1.45, 0.62, 1.22, 0.74);   // underarm
    s.quadraticCurveTo(1.18, -0.4, 1.24, -1.70);  // side seam
    s.quadraticCurveTo(1.24, -1.80, 1.12, -1.80);
    s.lineTo(-1.12, -1.80);
    s.quadraticCurveTo(-1.24, -1.80, -1.24, -1.70);
    s.quadraticCurveTo(-1.18, -0.4, -1.22, 0.74);
    s.quadraticCurveTo(-1.45, 0.62, -1.74, 0.42);
    s.lineTo(-2.18, 0.98);
    s.quadraticCurveTo(-1.80, 1.40, -1.30, 1.60);
    s.quadraticCurveTo(-0.95, 1.72, -0.62, 1.78);
    return s;
  }
  function roundedRect(T, w, h, r) {
    var s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function knitTexture(T) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,.2)'; for (var i = 0; i < 128; i += 4) x.fillRect(i, 0, 2, 128);
    var d = x.getImageData(0, 0, 128, 128);
    for (var j = 0; j < d.data.length; j += 4) { var n = (Math.random() - 0.5) * 44; d.data[j] += n; d.data[j + 1] += n; d.data[j + 2] += n; }
    x.putImageData(d, 0, 0);
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(5, 5);
    return t;
  }
  function grainCanvas() {
    var c = document.createElement('canvas'); c.width = c.height = 1024;
    var x = c.getContext('2d'), i;
    for (i = 0; i < 14000; i++) {
      x.globalAlpha = 0.25 + Math.random() * 0.6;
      x.beginPath(); x.arc(Math.random() * 1024, Math.random() * 1024, 0.4 + Math.random() * 1.6, 0, TAU); x.fill();
    }
    x.globalAlpha = 0.2; x.lineWidth = 2;
    for (i = 0; i < 40; i++) {
      var y = Math.random() * 1024, x0 = Math.random() * 1024;
      x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + 60 + Math.random() * 160, y + (Math.random() - 0.5) * 8); x.stroke();
    }
    return c;
  }

  function buildGL() {
    var T = window.THREE;
    var renderer = new T.WebGLRenderer({ canvas: el.gl, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x8f897c, 0.55));
    var key = new T.DirectionalLight(0xffffff, 0.85); key.position.set(3.5, 5, 7); scene.add(key);
    var rim = new T.DirectionalLight(0xffffff, 0.5); rim.position.set(-6, 3, -3); scene.add(rim);
    var fill = new T.DirectionalLight(0xffffff, 0.2); fill.position.set(-4, -3, 5); scene.add(fill);

    var rig = new T.Group(), spinG = new T.Group();
    scene.add(rig); rig.add(spinG);

    var shape = teeShape(T), depth = 0.30, bt = 0.22, zf = depth / 2 + bt;
    var geo = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: bt, bevelSize: 0.12, bevelSegments: 10, curveSegments: 36 });
    geo.translate(0, 0, -depth / 2);
    var teeMat = new T.MeshStandardMaterial({ color: TEE.black, roughness: 0.95, metalness: 0, bumpMap: knitTexture(T), bumpScale: 0.012 });
    var tee = new T.Mesh(geo, teeMat); spinG.add(tee);
    var neck = new T.QuadraticBezierCurve3(new T.Vector3(-0.6, 1.72, zf - 0.015), new T.Vector3(0, 1.03, zf + 0.02), new T.Vector3(0.6, 1.72, zf - 0.015));
    spinG.add(new T.Mesh(new T.TubeGeometry(neck, 48, 0.055, 12, false), teeMat));

    var pc = document.createElement('canvas'); pc.width = pc.height = 1024;
    var printTex = new T.CanvasTexture(pc);
    printTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var decal = new T.Mesh(new T.PlaneGeometry(1.95, 1.95), new T.MeshStandardMaterial({
      map: printTex, transparent: true, roughness: 0.75, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    decal.position.set(0, 0.02, zf + 0.004); spinG.add(decal);

    // squeegee: aluminium handle, rubber blade, a bead of ink in front of the blade
    var sq = new T.Group();
    var hGeo = new T.ExtrudeGeometry(roundedRect(T, 2.5, 0.36, 0.16), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 10 });
    hGeo.translate(0, 0.16, -0.06);
    sq.add(new T.Mesh(hGeo, new T.MeshStandardMaterial({ color: '#C9C5BB', roughness: 0.32, metalness: 0.55 })));
    var rubber = new T.Mesh(new T.BoxGeometry(2.36, 0.26, 0.075), new T.MeshStandardMaterial({ color: '#2A2926', roughness: 0.75 }));
    rubber.position.y = -0.2; sq.add(rubber);
    var beadMat = new T.MeshStandardMaterial({ color: C.red, roughness: 0.2, metalness: 0.05 });
    var bead = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 2.2, 20, 1), beadMat);
    bead.rotation.z = Math.PI / 2; bead.position.set(0, -0.3, 0.08); sq.add(bead);
    var SQS = 0.88; sq.scale.setScalar(SQS); sq.rotation.x = 0.75; sq.visible = false;
    spinG.add(sq);

    // soft shadow on the press bed behind the tee
    var shc = document.createElement('canvas'); shc.width = shc.height = 256;
    var sx = shc.getContext('2d'), pts = shape.getPoints(30);
    sx.shadowColor = '#000'; sx.shadowBlur = 18; sx.shadowOffsetX = 1000; sx.fillStyle = '#000';
    sx.beginPath();
    pts.forEach(function (pt, i) { var X = (pt.x + 3) / 6 * 256 - 1000, Y = (3 - pt.y) / 6 * 256; if (i) sx.lineTo(X, Y); else sx.moveTo(X, Y); });
    sx.closePath(); sx.fill();
    var shadowMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(shc), transparent: true, opacity: 0.2, depthWrite: false });
    var shadow = new T.Mesh(new T.PlaneGeometry(6, 6), shadowMat);
    shadow.position.z = -1.6; scene.add(shadow);

    return {
      T: T, renderer: renderer, scene: scene, camera: camera, rig: rig, spinG: spinG, tee: tee, teeMat: teeMat,
      printTex: printTex, pctx: pc.getContext('2d'), grain: grainCanvas(), sq: sq, bead: bead, beadMat: beadMat,
      shadow: shadow, shadowMat: shadowMat, ray: new T.Raycaster(), ndc: new T.Vector2(),
      decalTop: 0.02 + 0.975, decalBot: 0.02 - 0.975, tipDY: 0.33 * Math.cos(0.75) * SQS, baseZ: zf + 0.33 * Math.sin(0.75) * SQS + 0.006,
      spin: -4.6, vel: 0, goal: 0, drag: null, tiltX: 0, tiltY: 0, tx: 0, ty: 0,
      colFrom: new T.Color(), colTo: new T.Color(), colT: 1, pulse: 0, born: performance.now(), fontsDirty: true
    };
  }
  function fitGL() {
    if (!gl) return;
    var w = window.innerWidth, h = window.innerHeight, small = w < 720;
    gl.renderer.setSize(w, h, false);
    gl.camera.aspect = w / h;
    var tanH = Math.tan(14 * Math.PI / 180);
    var d = Math.max(4.3 / (2 * tanH * 0.6), 5.2 / (2 * tanH * gl.camera.aspect * 0.9));
    var y = small ? -0.6 : -0.1;
    gl.camera.position.set(0, y, d); gl.camera.lookAt(0, y, 0); gl.camera.updateProjectionMatrix();
  }
  function disposeGL() {
    if (!gl) return;
    gl.scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); if (o.material.bumpMap) o.material.bumpMap.dispose(); o.material.dispose(); }
    });
    gl.renderer.dispose();
    try { gl.renderer.forceContextLoss(); } catch (e) {}
    gl = null;
  }
  function updateSqueegee(g, p, now) {
    var sq = g.sq;
    if (p <= 0.002 && S.phase === 'load') { sq.visible = false; return; }
    sq.visible = true;
    var top = g.decalTop, bot = g.decalBot;
    var i = p >= 1 ? 2 : Math.floor(p * 3), r = p >= 1 ? 1 : p * 3 - i;
    var pull = easeIO(clamp(r / 0.85, 0, 1)), ret = clamp((r - 0.85) / 0.15, 0, 1);
    var y = lerp(top, bot, pull), z = 0, tilt = 0;
    if (i === 0) z += (1 - easeOut(clamp(r / 0.1, 0, 1))) * 1.6; // lands on the first pass
    if (ret > 0) {
      if (i < 2) { y = lerp(bot, top, easeIO(ret)); z = Math.sin(ret * Math.PI) * 1.1; tilt = Math.sin(ret * Math.PI) * 0.5; }
      else { y = bot + easeIO(ret) * 0.6; z = easeIO(ret) * 3.5; }
    }
    if (S.phase !== 'load') { var k = easeIO(clamp((now - S.lockAt) / 700, 0, 1)); y = bot + 0.6 + k * 5; z = 3.5 + k * 4; }
    sq.position.set(0, y + g.tipDY, g.baseZ + z);
    sq.rotation.x = 0.75 + tilt;
    var bs = ret > 0 ? 0.55 + 0.45 * ret : 1 - 0.45 * pull; // the ink bead gets used up
    g.bead.scale.set(bs, 1, bs);
    g.beadMat.color.set(inkColors()[i]);
  }
  function glUpdate(g, now, dt, p) {
    var e = clamp((now - g.born) / 1300, 0, 1), tt = now / 1000;
    if (!g.drag) { var k = 26, d = 2 * Math.sqrt(k) * 0.42; g.vel += ((g.goal - g.spin) * k - g.vel * d) * dt; g.spin += g.vel * dt; }
    g.spinG.rotation.y = g.spin;
    var s = Math.min(1, dt * 4);
    g.tiltX += (g.tx - g.tiltX) * s; g.tiltY += (g.ty - g.tiltY) * s;
    var floatY = Math.sin(tt * 1.4) * 0.07;
    g.rig.rotation.set(g.tiltX + Math.sin(tt * 0.8) * 0.03, g.tiltY, Math.sin(tt * 0.9) * 0.025);
    g.rig.position.y = lerp(-6, 0, easeOutBack(e)) + floatY;
    g.pulse = Math.max(0, g.pulse - dt * 2.4);
    g.rig.scale.setScalar(1 + Math.sin((1 - g.pulse) * Math.PI) * (g.pulse > 0 ? 0.06 : 0));
    if (g.colT < 1) { g.colT = Math.min(1, g.colT + dt / 0.55); g.teeMat.color.copy(g.colFrom).lerp(g.colTo, easeIO(g.colT)); }
    updateSqueegee(g, p, now);
    g.shadow.position.x = 0.34 + g.tiltY * 0.8;
    g.shadow.position.y = -0.3 + g.rig.position.y - floatY * 1.4;
    g.shadow.scale.x = 0.22 + 0.78 * Math.abs(Math.cos(g.spin));
    g.shadowMat.opacity = (C.dark ? 0.5 : 0.22) * e * (1 - floatY * 1.5);
    g.renderer.render(g.scene, g.camera);
  }

  /* ---------- interaction ---------- */
  function hitTee(ev) {
    if (!gl) return false;
    gl.ndc.set(ev.clientX / window.innerWidth * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);
    gl.ray.setFromCamera(gl.ndc, gl.camera);
    return gl.ray.intersectObject(gl.tee, false).length > 0;
  }
  function swapGarment() {
    S.garment = S.garment === 'black' ? 'white' : 'black';
    if (gl) {
      gl.colFrom.copy(gl.teeMat.color); gl.colTo.set(TEE[S.garment]); gl.colT = 0;
      gl.goal = Math.round(gl.spin / TAU) * TAU + TAU; gl.pulse = 1; gl.printDirty = true;
    }
    updateStatus(true);
  }
  function onDown(ev) {
    if (!gl || S.phase === 'exit' || S.phase === 'idle') return;
    gl.drag = { x: ev.clientX, y: ev.clientY, t: performance.now(), moved: 0 };
    gl.vel = 0;
    try { el.gl.setPointerCapture(ev.pointerId); } catch (e) {}
    el.gl.classList.add('is-drag');
  }
  function onMove(ev) {
    if (S.phase === 'idle') return;
    if (ev.pointerType === 'mouse') bg.mouse = true;
    if (ev.pointerType === 'mouse' || (gl && gl.drag)) { bg.tx = ev.clientX; bg.ty = ev.clientY; }
    if (!gl) return;
    gl.ty = (ev.clientX / window.innerWidth * 2 - 1) * 0.35;
    gl.tx = (ev.clientY / window.innerHeight * 2 - 1) * 0.22;
    var d = gl.drag;
    if (d) {
      var now = performance.now(), dx = ev.clientX - d.x, dts = Math.max(8, now - d.t) / 1000;
      d.moved += Math.abs(dx) + Math.abs(ev.clientY - d.y);
      gl.spin += dx * 0.012;
      gl.vel = gl.vel * 0.5 + (dx * 0.012 / dts) * 0.5;
      d.x = ev.clientX; d.y = ev.clientY; d.t = now;
    }
  }
  function onUp(ev) {
    if (!gl || !gl.drag) return;
    var d = gl.drag; gl.drag = null; el.gl.classList.remove('is-drag');
    if (d.moved < 8) {
      bg.ripples.push({ x: ev.clientX, y: ev.clientY, a: 0 });
      if (hitTee(ev)) swapGarment();
    } else {
      gl.goal = Math.round((gl.spin + gl.vel * 0.35) / TAU) * TAU;
    }
  }
  el.gl.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  el.skip.addEventListener('click', skip);
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.phase === 'load') skip(); });
  window.addEventListener('resize', function () { if (S.phase === 'idle') return; bgResize(); fitGL(); });

  /* ---------- sequence ---------- */
  function updateStatus(force) {
    var idx = S.phase === 'load' ? (S.shown >= 1 ? 3 : Math.min(2, Math.floor(S.shown * 3))) : 3;
    if (!force && idx === S.statusIdx) return;
    S.statusIdx = idx;
    if (idx < 3) {
      el.status.textContent = STAGES[idx] || '';
      el.swatch.classList.remove('is-ok');
    } else {
      el.status.textContent = DONE;
      el.swatch.classList.add('is-ok');
    }
  }
  function lock(now) {
    S.phase = 'lock'; S.lockAt = now; S.shown = 1;
    root.classList.add('is-locked');
    if (gl) gl.goal = Math.round(gl.spin / TAU) * TAU;
    updateStatus(true);
    el.sr.textContent = 'Loaded';
  }
  function skip() {
    if (S.phase !== 'load' && S.phase !== 'lock') return;
    var now = performance.now();
    if (S.phase === 'load') lock(now);
    S.lockAt = now - 800;
  }
  function startExit(now) {
    S.phase = 'exit'; S.exitAt = now;
    root.classList.add('is-exit');
    document.documentElement.classList.add('intro-done');
    document.dispatchEvent(new CustomEvent('abimra:intro:reveal'));
  }
  function exitStep(now) {
    if (S.reduce) {
      var f = clamp((now - S.exitAt) / 350, 0, 1);
      root.style.opacity = String(1 - f);
      if (f >= 1) finish();
      return;
    }
    var k = clamp((now - S.exitAt) / 850, 0, 1), h = window.innerHeight;
    var y = lerp(-30, h + 40, easeIO(k));
    root.style.clipPath = 'inset(' + Math.max(0, y).toFixed(1) + 'px 0 0 0)';
    el.blade.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
    if (k >= 1) finish();
  }
  function finish() {
    cancelAnimationFrame(S.raf);
    S.phase = 'idle';
    root.hidden = true;
    root.style.clipPath = ''; root.style.opacity = '';
    root.classList.remove('is-exit', 'is-locked');
    document.documentElement.classList.remove('apl-lock');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (!root.hasAttribute('data-replayable')) disposeGL();
    document.dispatchEvent(new CustomEvent('abimra:intro:done'));
  }

  function frame(now) {
    S.raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;

    if (S.wantGL && !gl && window.THREE) {
      try { gl = buildGL(); gl.teeMat.color.set(TEE[S.garment]); fitGL(); root.classList.add('has-gl'); }
      catch (e) { S.wantGL = false; gl = null; }
    }
    if (S.phase === 'load') {
      var tp = clamp((now - S.t0 - S.lead) / S.minDur, 0, 1);
      var ready = (loaded && fontsReady) || now - S.t0 > MAX_WAIT;
      if (!ready) tp = Math.min(tp, 0.9);
      S.shown += (tp - S.shown) * Math.min(1, dt * 6);
      if (tp >= 1 && S.shown > 0.996) lock(now);
      updateStatus(false);
    }
    var p = S.shown, mis = Math.pow(1 - p, 1.3);
    root.style.setProperty('--mis', mis.toFixed(3));
    var pct = Math.round(p * 100);
    if (pct !== S.pct) {
      S.pct = pct;
      el.num.textContent = pct;
      for (var sg = 0; sg < el.segs.length; sg++) el.segs[sg].style.transform = 'scaleX(' + clamp(p * 3 - sg, 0, 1).toFixed(3) + ')';
      el.num.parentNode.style.fontVariationSettings = "'wdth' " + (62 + 63 * easeIO(p)).toFixed(1) + ", 'wght' 800";
    }
    if (!S.reduce) bgDraw(now, dt * 1000);
    if (gl) {
      if (S.phase === 'load' || gl.printDirty || gl.fontsDirty) { drawPrint(gl, reveals(p), mis); gl.printDirty = gl.fontsDirty = false; }
      glUpdate(gl, now, dt, p);
    }
    if (S.phase === 'lock' && now - S.lockAt > 800) startExit(now);
    if (S.phase === 'exit') exitStep(now);
  }

  function start(force) {
    var seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (!force && root.getAttribute('data-once') !== 'false' && seen) { root.hidden = true; document.documentElement.classList.add('intro-done'); return; }
    cancelAnimationFrame(S.raf);
    root.style.animation = 'none'; // cancel the no-JS failsafe
    S.reduce = !!reduceMQ.matches;
    readColors();
    S.garment = C.dark ? 'white' : 'black';
    S.minDur = S.reduce ? 900 : MIN; S.lead = S.reduce ? 0 : 650;
    root.hidden = false; root.style.clipPath = ''; root.style.opacity = '';
    root.classList.remove('is-locked', 'is-exit');
    el.blade.style.transform = '';
    document.documentElement.classList.add('apl-lock');
    document.documentElement.classList.remove('apl-seen');
    var conn = navigator.connection || {};
    S.wantGL = !S.reduce && !conn.saveData && webglOK();
    if (S.wantGL) loadThree();
    root.classList.toggle('has-gl', !!gl && S.wantGL);
    if (gl) {
      gl.teeMat.color.set(TEE[S.garment]); gl.colT = 1; gl.spin = -4.6; gl.vel = 0; gl.goal = 0; gl.drag = null;
      gl.sq.visible = false; gl.born = performance.now(); gl.printDirty = true;
    }
    S.phase = 'load'; S.shown = 0; S.statusIdx = -1; S.pct = -1;
    S.t0 = S.last = performance.now();
    el.sr.textContent = 'Loading';
    bgResize(); fitGL();
    if (S.reduce) { bg.mouse = true; bgDraw(0, 0); }
    S.raf = requestAnimationFrame(frame);
  }

  window.AbimraPreloader = { play: function () { start(true); }, skip: skip };
  start(false);
})();
