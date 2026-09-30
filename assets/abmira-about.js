/*
  About page motion.

  Only two things live here, because the theme already owns the rest:
  reveal-on-scroll is .ab-rv in assets/abmira.js, and every transition
  is CSS. Nothing below writes a style; it sets --p and toggles classes.

    1. The two-ink slide. The hero and the facts strip each carry a red
       copy of their words, offset like a press out of register. Adding
       .ab-in slides them almost home - the CSS does the moving.

    2. The process rail. --p (0 to 1) on .ab-about-steps drives the red
       line, measured from the top of the list to a point 55% down the
       screen. A step gets .ab-on once that point has passed it.

  Safe to load from several sections at once: the second call finds the
  guard and just refreshes.
*/

(function () {
  'use strict';

  if (window.__abAbout) {
    window.__abAbout.refresh();
    return;
  }

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lists = [];
  var io = null;
  var ticking = false;

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  /* ------------------------------------------------------------------ *
   * The two-ink slide
   *
   * The hero fires on load rather than on scroll: it is already on
   * screen, and an IntersectionObserver would have nothing to wait for.
   * The facts strip waits until it is in view.
   * ------------------------------------------------------------------ */

  function ink() {
    var heroes = document.querySelectorAll('.ab-about-hero:not(.ab-in)');
    Array.prototype.forEach.call(heroes, function (el) {
      // A frame late, so the browser has a starting position to move
      // from. Setting it in the same frame as paint skips the slide.
      requestAnimationFrame(function () {
        el.classList.add('ab-in');
      });
    });

    var strips = document.querySelectorAll('.ab-about-facts:not(.ab-in)');
    if (!strips.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(strips, function (el) {
        el.classList.add('ab-in');
      });
      return;
    }

    if (!io) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add('ab-in');
            io.unobserve(e.target);
          });
        },
        { threshold: 0.18 }
      );
    }
    Array.prototype.forEach.call(strips, function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------ *
   * The process rail
   * ------------------------------------------------------------------ */

  function frame() {
    ticking = false;
    var mark = window.innerHeight * 0.55;

    lists.forEach(function (list) {
      var r = list.getBoundingClientRect();
      if (!r.height) return;

      list.style.setProperty('--p', clamp01((mark - r.top) / r.height).toFixed(4));

      var steps = list.querySelectorAll('.ab-about-step');
      Array.prototype.forEach.call(steps, function (el) {
        // +14 lines the switch up with the dot rather than the box top.
        el.classList.toggle('ab-on', el.getBoundingClientRect().top + 14 <= mark);
      });
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  function refresh() {
    ink();
    lists = Array.prototype.slice.call(document.querySelectorAll('.ab-about-steps'));

    if (REDUCED) {
      // Show the whole rail and every step, and never listen for scroll.
      lists.forEach(function (list) {
        list.style.setProperty('--p', '1');
        Array.prototype.forEach.call(list.querySelectorAll('.ab-about-step'), function (el) {
          el.classList.add('ab-on');
        });
      });
      return;
    }

    if (lists.length) frame();
  }

  if (!REDUCED) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // The theme editor re-renders one section rather than the page.
  document.addEventListener('shopify:section:load', refresh);

  window.__abAbout = { refresh: refresh };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh);
  else refresh();
})();
