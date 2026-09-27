/* Abimra Studio: mobile and tablet menu ("am-").
   Opens from any [data-am-open] button, closes from [data-am-close], Escape, a link tap, or growing past the breakpoint.
   Keeps focus inside while open, returns it to the button afterwards, locks page scroll, and re-binds after theme editor reloads.
   Events on document: 'abimra:menu:open' and 'abimra:menu:close'. API: window.AbimraMenu.open() / .close() */
(function () {
  'use strict';
  var html = document.documentElement;
  var menu, closeBtn, lastFocus = null, bp = 990;

  function buttons() { return document.querySelectorAll('[data-am-open]'); }
  function isOpen() { return !!menu && menu.classList.contains('is-open'); }

  function open() {
    if (!menu || isOpen()) return;
    lastFocus = document.activeElement;
    menu.inert = false;
    menu.removeAttribute('aria-hidden');
    menu.classList.add('is-open');
    html.classList.add('am-lock');
    buttons().forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    setTimeout(function () { if (isOpen() && closeBtn) closeBtn.focus({ preventScroll: true }); }, 380);
    document.dispatchEvent(new CustomEvent('abimra:menu:open'));
  }
  function close(opts) {
    if (!menu || !isOpen()) return;
    menu.classList.remove('is-open');
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
    html.classList.remove('am-lock');
    buttons().forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!(opts && opts.noFocus) && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('abimra:menu:close'));
  }

  // Keep Tab and Shift+Tab inside the menu while it's open; Escape closes.
  function trap(e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = menu.querySelectorAll('a[href], button:not([disabled])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function init() {
    var m = document.getElementById('abimra-menu');
    if (!m) return;
    menu = m;
    if (m.__am) return;
    m.__am = true;
    closeBtn = m.querySelector('[data-am-close]');
    bp = +m.getAttribute('data-breakpoint') || 990;
    m.inert = true;
    m.setAttribute('aria-hidden', 'true');
    if (closeBtn) closeBtn.addEventListener('click', function () { close(); });
    // Tapping a link closes the menu; navigation carries on as normal.
    m.querySelectorAll('a[href]').forEach(function (a) { a.addEventListener('click', function () { close({ noFocus: true }); }); });
  }

  // One delegated listener, so buttons re-rendered by the theme editor keep working.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-am-open]');
    if (!b) return;
    e.preventDefault();
    init();
    if (isOpen()) close(); else open();
  });
  document.addEventListener('keydown', trap);
  window.addEventListener('resize', function () { if (isOpen() && window.innerWidth >= bp) close({ noFocus: true }); }, { passive: true });
  // Back/forward cache can restore the page with the menu still open.
  window.addEventListener('pageshow', function (e) { if (e.persisted && isOpen()) close({ noFocus: true }); });
  document.addEventListener('shopify:section:load', function () { html.classList.remove('am-lock'); init(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.AbimraMenu = { open: open, close: close };
})();
