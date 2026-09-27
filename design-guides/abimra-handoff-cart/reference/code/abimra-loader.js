/* Abimra Studio: quick loader kit ("Print run").
   - Page changes: a squeegee pulls a cover down when you leave, and pulls it off when the next page is ready.
     While it's up, a tee rolls in, gets printed and rolls off, with a tip or a joke underneath.
   - Anything async (filters, load more, cart): AbimraLoader.run(task) only shows the cover if it's actually slow.
   - Buttons: AbimraLoader.busy(button, task, { loading: 'Adding', done: 'Added' }).
   - Internal links are prefetched on hover or touch, so most page changes feel instant anyway. */
(function () {
  'use strict';
  var html = document.documentElement;
  var KEY = 'abimra:transit';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.7,0,.25,1)';
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var el = document.querySelector('.a-cover');
  var blade = el && el.querySelector('.a-cover__blade');
  var tipEl = el && el.querySelector('.a-cover__tip'), kickEl = el && el.querySelector('.a-cover__kicker');
  var TIPS = []; try { TIPS = JSON.parse(tipEl.getAttribute('data-tips')) || []; } catch (e) {}
  var TKEY = 'abimra:tip', tipI = 0, talkT = 0, rotT = 0;
  try { tipI = +(sessionStorage.getItem(TKEY) || 0); } catch (e) {}
  var state = html.classList.contains('a-arriving') ? 'covered' : 'hidden';
  var busyP = null, shownAt = state === 'covered' ? performance.now() : 0;

  function finish(anims) { return Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })); }
  function settle(visible) {
    el.getAnimations().forEach(function (a) { a.cancel(); });
    if (blade) blade.getAnimations().forEach(function (a) { a.cancel(); });
    el.style.visibility = visible ? 'visible' : 'hidden';
    el.style.pointerEvents = visible ? 'auto' : 'none';
    el.style.clipPath = visible ? 'none' : '';
    el.style.opacity = '';
  }
  // The blade rides the edge of the wipe, always on the visible side of it (the cover clips its own children).
  function pullBlade(covering, ms) {
    if (!blade || reduce) return null;
    var h = window.innerHeight, bh = blade.offsetHeight || 16, from = covering ? -bh : 0, to = covering ? h - bh : h;
    return blade.animate([{ transform: 'translateY(' + from + 'px)', opacity: 1 }, { transform: 'translateY(' + to + 'px)', opacity: 1, offset: 0.96 }, { transform: 'translateY(' + to + 'px)', opacity: 0 }],
      { duration: ms, easing: EASE });
  }
  function setTip(i) {
    if (!TIPS.length || !tipEl) return;
    var t = TIPS[((i % TIPS.length) + TIPS.length) % TIPS.length];
    kickEl.textContent = t[0]; tipEl.textContent = t[1];
  }
  // Show a tip shortly after the cover lands; if the wait drags on, move to the next one every few seconds.
  function talk() {
    clearTimeout(talkT); clearInterval(rotT);
    el.classList.remove('is-swapping');
    talkT = setTimeout(function () { el.classList.add('is-talking'); }, 180);
    rotT = setInterval(function () {
      el.classList.add('is-swapping');
      setTimeout(function () { tipI++; try { sessionStorage.setItem(TKEY, tipI); } catch (e) {} setTip(tipI); el.classList.remove('is-swapping'); }, 320);
    }, 4200);
  }
  function hush() { clearTimeout(talkT); clearInterval(rotT); }
  // Start the print run from the top each time, so the first thing you see is a squeegee pull, not a tee halfway off stage.
  function restartRun() {
    var run = el.querySelector('.a-run');
    if (run) { var fresh = run.cloneNode(true); run.parentNode.replaceChild(fresh, run); }
  }

  function cover() {
    if (!el) return Promise.resolve();
    if (state === 'covered') return Promise.resolve();
    if (state === 'covering') return busyP;
    state = 'covering'; shownAt = performance.now();
    el.style.visibility = 'visible'; el.style.pointerEvents = 'auto';
    var anims = reduce
      ? [el.animate([{ opacity: 0, clipPath: 'none' }, { opacity: 1, clipPath: 'none' }], { duration: 140, fill: 'forwards' })]
      : [el.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 380, easing: EASE, fill: 'forwards' })];
    var b = pullBlade(true, 380); if (b) anims.push(b);
    tipI++; try { sessionStorage.setItem(TKEY, tipI); } catch (e) {}
    setTip(tipI); restartRun(); talk();
    busyP = finish(anims).then(function () { if (state === 'covering') { state = 'covered'; settle(true); } });
    return busyP;
  }

  function uncover() {
    if (!el || state === 'hidden') return Promise.resolve();
    var go = function () {
      state = 'uncovering';
      hush();
      settle(true);
      var anims = reduce
        ? [el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' })]
        : [el.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }], { duration: 420, easing: EASE, fill: 'forwards' })];
      var b = pullBlade(false, 420); if (b) anims.push(b);
      return finish(anims).then(function () {
        if (state !== 'uncovering') return;
        state = 'hidden';
        el.classList.remove('is-talking', 'is-swapping');
        html.classList.remove('a-arriving');
        settle(false);
      });
    };
    return (state === 'covering' ? busyP : Promise.resolve()).then(go);
  }

  /* Cover only if the task is slower than `delay`, and once shown keep it up long enough to read as intentional. */
  function run(task, opts) {
    opts = opts || {};
    var delay = opts.delay == null ? 250 : opts.delay, min = opts.min == null ? 520 : opts.min, shown = false;
    var t = setTimeout(function () { shown = true; cover(); }, delay);
    var p = Promise.resolve(typeof task === 'function' ? task() : task);
    var done = function () {
      clearTimeout(t);
      if (!shown) return;
      return cover().then(function () {
        var left = min - (performance.now() - shownAt);
        return left > 0 ? wait(left) : null;
      }).then(uncover);
    };
    return p.then(function (v) { return Promise.resolve(done()).then(function () { return v; }); },
      function (e) { return Promise.resolve(done()).then(function () { throw e; }); });
  }

  /* Busy state for any button or link. */
  var TICK = '<svg class="a-btn__tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.4 12 13 4.5"/></svg>';
  var MINI = '<span class="a-mini" aria-hidden="true"></span>';
  function busy(btn, task, opts) {
    opts = opts || {};
    if (!btn.classList.contains('a-btn')) {
      btn.classList.add('a-btn');
      var label = btn.textContent.trim();
      btn.innerHTML = '<span class="a-btn__ink" aria-hidden="true"></span><span class="a-btn__txt">' + MINI + TICK + '<span class="a-btn__lbl"></span></span>';
      btn.querySelector('.a-btn__lbl').textContent = label;
      btn.setAttribute('data-label', label);
    }
    if (btn.getAttribute('aria-busy') === 'true') return Promise.resolve();
    var lbl = btn.querySelector('.a-btn__lbl'), label0 = btn.getAttribute('data-label');
    var w = btn.offsetWidth;
    btn.style.minWidth = w + 'px';
    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.remove('is-done');
    lbl.textContent = opts.loading || 'Loading';
    var end = function (ok) {
      btn.removeAttribute('aria-busy');
      if (ok && opts.done) {
        lbl.textContent = opts.done; btn.classList.add('is-done');
        return wait(opts.hold || 1400).then(function () { btn.classList.remove('is-done'); lbl.textContent = label0; btn.removeAttribute('aria-disabled'); btn.style.minWidth = ''; });
      }
      lbl.textContent = label0; btn.removeAttribute('aria-disabled'); btn.style.minWidth = '';
    };
    return Promise.resolve(typeof task === 'function' ? task() : task).then(
      function (v) { return Promise.resolve(end(true)).then(function () { return v; }); },
      function (e) { end(false); throw e; });
  }

  /* ---------- page changes ---------- */
  function internal(a, e) {
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-loader') || a.closest('[data-no-loader]')) return false;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|sms|javascript):/i.test(href)) return false;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return false; }
    if (u.origin !== location.origin) return false;
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return false; // same page anchor
    return u;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    var u = internal(a, e);
    if (!u || !el) return;
    e.preventDefault();
    try { sessionStorage.setItem(KEY, String(Date.now())); } catch (err) {}
    var go = function () { location.href = u.href; };
    cover().then(go);
    setTimeout(function () { if (document.visibilityState === 'visible') uncover(); }, 6000); // the link turned out not to navigate
  });

  // Arriving from another page: pull the cover off as soon as there is something to show.
  if (state === 'covered') {
    var reveal = function () { requestAnimationFrame(function () { setTimeout(uncover, Math.max(0, 160 - (performance.now() - shownAt))); }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reveal); else reveal();
  }
  // Back/forward cache restores the old page exactly as we left it, cover and all, so reset it.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && el) { state = 'hidden'; hush(); html.classList.remove('a-arriving'); el.classList.remove('is-talking', 'is-swapping'); settle(false); }
  });

  /* ---------- prefetch on intent ---------- */
  var seen = {}, conn = navigator.connection || {};
  function prefetch(e) {
    if (conn.saveData) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-no-loader')) return;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || u.hash && u.pathname === location.pathname || seen[u.href]) return;
    seen[u.href] = 1;
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.href; document.head.appendChild(l);
  }
  document.addEventListener('mouseover', prefetch, { passive: true });
  document.addEventListener('touchstart', prefetch, { passive: true });

  window.AbimraLoader = { cover: cover, uncover: uncover, run: run, busy: busy, mini: MINI };
})();
