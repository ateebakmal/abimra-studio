/* Abimra Studio: About page motion (sections abimra-about-*).
   - .abt-rv blocks fade up once when they scroll into view (and get .abt-in, which also lines up the red overprint on the facts)
   - the hero headline's red layer slides into register on load
   - the process steps: a red line fills as you scroll, and each step lights up when the line reaches it
   Safe to load from several sections: it only initialises once, and re-initialises after theme editor reloads. */
(function () {
  'use strict';
  if (window.__abimraAbout) { window.__abimraAbout.refresh(); return; }
  var html = document.documentElement;
  html.classList.add('abt-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null, steps = [], ticking = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function refresh() {
    document.querySelectorAll('.abt-hero:not(.abt-in)').forEach(function (h) { requestAnimationFrame(function () { h.classList.add('abt-in'); }); });
    var rv = document.querySelectorAll('.abt-rv:not(.abt-in)');
    if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (el) { el.classList.add('abt-in'); }); }
    else {
      if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('abt-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
    }
    steps = [].slice.call(document.querySelectorAll('.abt-steps'));
    frame();
  }

  function frame() {
    ticking = false;
    if (reduce) return;
    var h = window.innerHeight, mark = h * 0.55;
    steps.forEach(function (list) {
      var s = list.getBoundingClientRect();
      if (s.bottom < -h || s.top > h * 2) return;
      var p = clamp((mark - s.top - 10) / Math.max(1, s.height - 20));
      list.style.setProperty('--p', p.toFixed(3));
      list.querySelectorAll('.abt-step').forEach(function (el) { el.classList.toggle('abt-on', el.getBoundingClientRect().top + 14 <= mark); });
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('shopify:section:load', refresh);

  window.__abimraAbout = { refresh: refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh); else refresh();
})();
