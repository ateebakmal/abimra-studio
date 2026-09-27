/* Abimra Studio: cart page behaviour (demo data; on Shopify this is driven by the cart object and /cart/change.js). */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var T = function (y, s, fill, text, ls) {
    return '<text x="150" y="' + y + '" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" style="font-stretch:75%" font-size="' + s + '" fill="' + fill + '"' + (ls ? ' letter-spacing="' + ls + '"' : '') + '>' + text + '</text>';
  };
  var ITEMS = [
    { id: 'a', title: 'Oversized tee', kind: 'Personalised', custom: true, g: 'tee', colour: 'Black', hex: '#191813', size: 'M', print: 'Front and back', price: 29.99, qty: 1, bg: 'var(--b-sand)',
      front: '<use href="#art-sun" x="112" y="76" width="76" height="76"/>' + T(178, 19, '#D42E12', 'ABIMRA CLUB'),
      back: T(96, 15, '#EEEAE0', 'ABIMRA CLUB', 3) + T(196, 96, '#D42E12', '07') },
    { id: 'b', title: 'Heavy hoodie', kind: 'Personalised', custom: true, g: 'hood', colour: 'Bone', hex: '#F1ECE0', size: 'L', print: 'Front', price: 49.99, qty: 1, bg: 'var(--b-sage)',
      front: T(132, 24, '#191813', 'CLASS OF') + T(182, 50, '#D42E12', '2026') },
    { id: 'c', title: 'Classic tee', kind: 'Studio Original', custom: false, g: 'tee', colour: 'White', hex: '#F7F5EF', size: 'S', print: 'Front', price: 24.99, qty: 1, bg: 'var(--b-butter)',
      front: T(146, 28, '#D42E12', 'OUR KID') }
  ];
  var UPS = [
    { id: 'u1', title: 'Canvas tote', kind: 'Studio Original', custom: false, g: 'tote', colour: 'Natural', hex: '#DCCFB4', size: 'One size', print: 'Front', price: 14.99, qty: 1, bg: 'var(--b-blue)',
      front: T(250, 20, '#191813', 'ABIMRA', 4) },
    { id: 'u2', title: 'Dad cap', kind: 'Studio Original', custom: false, g: 'cap', colour: 'Black', hex: '#191813', size: 'Adjustable', print: 'Front', price: 19.99, qty: 1, bg: 'var(--b-sand)',
      front: T(176, 17, '#EEEAE0', 'ABIMRA', 3) },
    { id: 'u3', title: 'Classic tee, blank', kind: 'Ready for your design', custom: false, g: 'tee', colour: 'White', hex: '#F7F5EF', size: 'M', print: 'None yet', price: 24.99, qty: 1, bg: 'var(--b-sage)',
      front: '<rect x="104" y="92" width="92" height="104" rx="8" fill="none" stroke="#BDB6A7" stroke-width="2.5" stroke-dasharray="8 6"/>' }
  ];

  // In the cart, a personalised item shows the plain product photo (the designer app doesn't put the design there).
  function art(it) {
    var d = it.custom ? '' : it.front;
    return '<svg viewBox="0 0 300 340" style="--g:' + it.hex + '" aria-hidden="true"><use href="#' + it.g + '"/>' + (d || '') + '</svg>';
  }
  // Stand-in for the designer's "Preview Personalization Image" URL: a flat mockup of the garment with the print on it.
  function previewURL(it) {
    var sym = document.getElementById(it.g), inner = sym ? sym.innerHTML.replace(/var\(--g,[^)]*\)/g, it.hex) : '';
    var defs = document.getElementById('art-sun') ? document.getElementById('art-sun').outerHTML.replace('<symbol', '<symbol xmlns="http://www.w3.org/2000/svg"') : '';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-40 -30 380 400"><rect x="-40" y="-30" width="380" height="400" fill="#F4F1EA"/><defs>' + defs + '</defs>' + inner + (it.front || '') + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  var ICON = {
    minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h10"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h10M8 3v10"/></svg>',
    bin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9"/></svg>',
    img: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="2"/><circle cx="10.5" cy="6" r="1.2"/><path d="M2.5 12 6 8.5l3 3 1.5-1.5 3 3" stroke-linecap="round"/></svg>'
  };

  var list = $('#items'), animId = 'ALL';
  function itemHTML(it, i) {
    var anim = animId === 'ALL' || animId === it.id;
    return '<li class="item" data-id="' + it.id + '" style="--i:' + i + (anim ? '' : ';animation:none') + '">' +
      '<a class="thumb" href="#" style="background:' + it.bg + '" aria-label="' + it.title + ', product page">' +
        art(it) + (it.custom ? '<span class="tag">PERSONALISED</span>' : '') + '</a>' +
      '<div class="info">' +
        '<div class="info-top"><div><h3>' + it.title + '</h3><span class="kind">' + it.kind + '</span></div>' +
          '<div class="price" data-line>' + money.format(it.price * it.qty) + (it.qty > 1 ? '<s style="text-decoration:none">' + money.format(it.price) + ' each</s>' : '') + '</div></div>' +
        '<div class="meta"><span><i style="background:' + it.hex + '"></i><b>' + it.colour + '</b></span><span>Size <b>' + it.size + '</b></span></div>' +
        (it.custom ? '<button type="button" class="design-link" data-act="preview">' + ICON.img + 'View your design</button>' : '') +
        '<div class="row">' +
          '<div class="qty" role="group" aria-label="Quantity for ' + it.title + '"><button type="button" data-act="dec" aria-label="One fewer"' + (it.qty <= 1 ? ' disabled' : '') + '>' + ICON.minus + '</button>' +
            '<output aria-live="polite">' + it.qty + '</output><button type="button" data-act="inc" aria-label="One more"' + (it.qty >= 20 ? ' disabled' : '') + '>' + ICON.plus + '</button></div>' +
          '<button type="button" class="link" data-act="remove" aria-label="Remove ' + it.title + '">' + ICON.bin + 'Remove</button>' +
        '</div>' +
      '</div></li>';
  }
  function render() { list.innerHTML = ITEMS.map(itemHTML).join(''); animId = null; update(); }

  /* ---------- totals, delivery, ticket ---------- */
  var shown = {}; // animated number outputs
  function tween(el, to) {
    var from = shown[el.id] == null ? to : shown[el.id]; shown[el.id] = to;
    if (reduce || from === to) { el.textContent = money.format(to); return; }
    var t0 = performance.now();
    (function step(t) { var k = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - k, 3); el.textContent = money.format(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function update() {
    var count = 0, sub = 0;
    ITEMS.forEach(function (it) { count += it.qty; sub += it.qty * it.price; });
    document.body.classList.toggle('is-empty', ITEMS.length === 0);
    $('#count').textContent = count;
    var badge = $('#bagN'); badge.textContent = count; badge.classList.add('bump'); setTimeout(function () { badge.classList.remove('bump'); }, 350);
    // ticket
    $('#tkLines').innerHTML = ITEMS.map(function (it) { return '<li><span><span class="q">' + it.qty + '×</span>' + it.title + '</span><span>' + money.format(it.qty * it.price) + '</span></li>'; }).join('');
    tween($('#sub'), sub); tween($('#total'), sub); tween($('#barTotal'), sub);
    $('#tkCount').textContent = count + (count === 1 ? ' item' : ' items');
    reprint();
    bar();
  }
  var side = $('.side'), printT = 0;
  function reprint() {
    if (!side.classList.contains('is-in')) return;
    side.classList.add('is-printing'); clearTimeout(printT);
    printT = setTimeout(function () { side.classList.remove('is-printing'); }, 650);
  }

  /* ---------- item actions ---------- */
  var undo = null, toastT = 0;
  list.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var li = b.closest('.item'), id = li.getAttribute('data-id'), idx = ITEMS.findIndex(function (x) { return x.id === id; }), it = ITEMS[idx];
    var act = b.getAttribute('data-act');
    if (act === 'inc' || act === 'dec') {
      it.qty = Math.max(1, Math.min(20, it.qty + (act === 'inc' ? 1 : -1)));
      li.querySelector('output').textContent = it.qty;
      li.querySelector('[data-act="dec"]').disabled = it.qty <= 1;
      li.querySelector('[data-act="inc"]').disabled = it.qty >= 20;
      li.querySelector('[data-line]').innerHTML = money.format(it.price * it.qty) + (it.qty > 1 ? '<s style="text-decoration:none">' + money.format(it.price) + ' each</s>' : '');
      update();
    } else if (act === 'remove') {
      li.style.setProperty('--w', li.offsetWidth + 'px');
      li.classList.add('is-wiping');
      var h = li.offsetHeight;
      wait(reduce ? 0 : 480).then(function () {
        var a = reduce ? null : li.animate([{ height: h + 'px', marginBottom: '0px' }, { height: '0px', marginBottom: '-12px', paddingTop: 0, paddingBottom: 0 }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
        return a ? a.finished : null;
      }).then(function () {
        li.remove();
        ITEMS.splice(idx, 1);
        undo = { it: it, idx: idx };
        toast('Removed ' + it.title + '.', true);
        update();
      });
    } else if (act === 'preview') openProof(it);
  });

  function toast(msg, canUndo) {
    var t = $('.toast'); t.querySelector('span').textContent = msg; t.querySelector('button').hidden = !canUndo; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); undo = null; }, 5000);
  }
  $('.toast button').addEventListener('click', function () {
    if (!undo) return;
    ITEMS.splice(undo.idx, 0, undo.it); animId = undo.it.id; undo = null;
    $('.toast').classList.remove('show'); render();
  });

  /* ---------- upsell ---------- */
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var u = UPS.find(function (x) { return x.id === btn.getAttribute('data-add'); });
      var go = function () {
        var have = ITEMS.find(function (x) { return x.id === u.id; });
        if (have) { have.qty = Math.min(20, have.qty + 1); animId = null; } else { ITEMS.push(Object.assign({}, u)); animId = u.id; }
        render();
      };
      if (window.AbimraLoader) AbimraLoader.busy(btn, wait(850).then(go), { loading: 'Adding', done: 'Added' });
      else wait(300).then(go);
    });
  });

  /* ---------- design preview: shows the designer app's preview image ---------- */
  var dlg = $('#proof');
  function openProof(it) {
    var url = it.previewUrl || previewURL(it), stage = $('#proofStage');
    $('#proofTitle').textContent = 'Your design';
    $('#proofMeta').textContent = it.title + ', ' + it.colour + ', size ' + it.size + '.';
    $('#proofOpen').href = url;
    stage.classList.add('is-loading');
    stage.innerHTML = '<span class="a-inline">' + (window.AbimraLoader ? AbimraLoader.mini : '') + 'Loading your design</span>';
    var img = new Image();
    img.alt = 'Preview of your design on the ' + it.title;
    img.decoding = 'async';
    img.onload = function () { stage.classList.remove('is-loading'); stage.innerHTML = ''; stage.appendChild(img); };
    img.onerror = function () { stage.classList.remove('is-loading'); stage.innerHTML = '<p class="proof-err">We couldn’t load the preview here. Use “Open full size”.</p>'; };
    img.src = url;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  dlg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); }); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- ticket prints when it scrolls into view ---------- */
  var d = new Date();
  try { $('#tkDate').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) {}
  function printTicket() {
    side.classList.add('is-in', 'is-printing');
    setTimeout(function () { side.classList.remove('is-printing'); side.classList.add('is-stamped'); }, reduce ? 0 : 1350);
  }
  if ('IntersectionObserver' in window && !reduce) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); printTicket(); } }, { threshold: 0.2 }).observe(side);
  else printTicket();

  /* ---------- mobile checkout bar: shows while the real checkout button is off screen ---------- */
  var ckVisible = false;
  function bar() { $('.bar').classList.toggle('show', !ckVisible && ITEMS.length > 0); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { ckVisible = es[0].isIntersecting; bar(); }).observe($('#checkout'));

  /* ---------- checkout (demo) ---------- */
  document.querySelectorAll('[data-checkout]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (!window.AbimraLoader) return;
      AbimraLoader.cover().then(function () { return wait(1600); }).then(function () { return AbimraLoader.uncover(); }).then(function () { toast('On the live store, Shopify checkout opens here.'); });
    });
  });
  $('.menu-pill').addEventListener('click', function () { toast('The menu lives in its own design.'); });

  render();
})();
