/* Abimra Studio: site behaviour. Small, dependency-free, safe to load deferred. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header: shadow once scrolled ---- */
  var nav = document.querySelector('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- desktop: an ink pill that slides to whichever link you're on ---- */
  var links = document.querySelector('.nav-links'), ink = links && links.querySelector('.nav-ink'), hot = null;
  function moveInk(a) {
    if (!ink) return;
    if (hot) hot.classList.remove('is-hot');
    hot = a;
    if (!a) { ink.classList.remove('on'); return; }
    a.classList.add('is-hot');
    ink.style.left = a.offsetLeft + 'px'; ink.style.width = a.offsetWidth + 'px';
    ink.classList.add('on');
  }
  if (links) {
    links.querySelectorAll('a,button').forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveInk(a); });
      a.addEventListener('focus', function () { moveInk(a); });
    });
    links.addEventListener('mouseleave', function () { if (!megaOpen) moveInk(null); });
    links.addEventListener('focusout', function (e) { if (!links.contains(e.relatedTarget) && !megaOpen) moveInk(null); });
  }

  /* ---- desktop: the Shop drawer ---- */
  var shopBtn = document.querySelector('[data-mega]'), mega = document.getElementById('mega'), megaOpen = false, megaT = 0;
  function setMega(open) {
    if (!mega || !shopBtn) return;
    clearTimeout(megaT);
    megaOpen = open;
    mega.classList.toggle('open', open);
    mega.inert = !open;
    shopBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) moveInk(shopBtn);
  }
  if (mega && shopBtn) {
    mega.inert = true;
    var later = function () { clearTimeout(megaT); megaT = setTimeout(function () { setMega(false); moveInk(null); }, 180); };
    shopBtn.addEventListener('click', function () { setMega(!megaOpen); });
    shopBtn.addEventListener('mouseenter', function () { clearTimeout(megaT); megaT = setTimeout(function () { setMega(true); }, 90); });
    shopBtn.addEventListener('mouseleave', later);
    mega.addEventListener('mouseenter', function () { clearTimeout(megaT); });
    mega.addEventListener('mouseleave', later);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && megaOpen) { setMega(false); shopBtn.focus(); } });
    document.addEventListener('click', function (e) { if (megaOpen && !mega.contains(e.target) && e.target !== shopBtn && !shopBtn.contains(e.target)) setMega(false); });
  }

  /* ---- phones and tablets: the full-screen menu, pulled down like a print ---- */
  var menuBtn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    menu.inert = !open;
    html.classList.toggle('menu-open', open);
    if (open) setTimeout(function () { var f = menu.querySelector('.m-link'); if (f) f.focus({ preventScroll: true }); }, 450);
  }
  if (menuBtn && menu) {
    menu.inert = true;
    menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); }, { passive: true });
  }

  /* ---- hero: rises as the preloader's squeegee passes, or straight away if there's no intro ---- */
  var hero = document.querySelector('.hero');
  function revealHero() { if (hero && !hero.classList.contains('is-in')) requestAnimationFrame(function () { hero.classList.add('is-in'); }); }
  var pre = document.getElementById('abimra-preloader');
  if (!pre || html.classList.contains('intro-done') || html.classList.contains('apl-seen') || reduce) revealHero();
  document.addEventListener('abimra:intro:reveal', function () { setTimeout(revealHero, 180); });
  setTimeout(revealHero, 10000); // belt and braces

  /* ---- reveal sections on first scroll into view ---- */
  if ('IntersectionObserver' in window) {
    var els = document.querySelectorAll('.sec-head, .worn-row, .cat, .grid4, .proof-copy, .closer-in');
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    els.forEach(function (e) { e.classList.add('rv'); io.observe(e); });
  }

  /* ---- the job ticket prints out when it scrolls into view ---- */
  var rig = document.querySelector('.rig');
  if (rig) {
    var d = rig.querySelector('[data-today]');
    if (d) try { d.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) {}
    var rows = rig.querySelectorAll('.tk-rows li');
    var run = function () {
      rig.classList.add('is-printing');
      rows.forEach(function (li, i) { setTimeout(function () { li.classList.add('ok'); }, 900 + i * 230); });
      setTimeout(function () { rig.classList.add('is-done'); }, 900 + rows.length * 230 + 250);
    };
    if (reduce || !('IntersectionObserver' in window)) { rows.forEach(function (li) { li.classList.add('ok'); }); rig.classList.add('is-printing', 'is-done'); }
    else new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); run(); } }, { threshold: 0.35 }).observe(rig);
  }

  /* ---- sticky mobile CTA: after the hero, out of the way of the story, the closer and the footer ---- */
  var bar = document.querySelector('.mcta');
  if (bar && 'IntersectionObserver' in window) {
    var state = { hero: true, block: 0 }, blockers = new Set();
    var upd = function () { bar.classList.toggle('show', !state.hero && blockers.size === 0); };
    new IntersectionObserver(function (es) { state.hero = es[0].isIntersecting; upd(); }, { threshold: 0 }).observe(hero);
    var bo = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) blockers.add(en.target); else blockers.delete(en.target); });
      upd();
    }, { threshold: 0 });
    document.querySelectorAll('[data-hide-cta]').forEach(function (n) { bo.observe(n); });
  }

  /* ---- demo only: replay the intro ---- */
  document.querySelectorAll('[data-replay]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!window.AbimraPreloader) return;
      window.scrollTo(0, 0);
      hero.classList.remove('is-in');
      window.AbimraPreloader.play();
    });
  });
})();
