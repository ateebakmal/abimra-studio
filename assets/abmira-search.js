/*
  The header search panel.

  Only the open/close is here. The searching itself is Dawn's
  <predictive-search>, which fetches /search/suggest and fills
  [data-predictive-search]. Nothing below touches results.

  The panel is `hidden` when closed rather than just collapsed, so a
  keyboard user tabbing along the header never lands inside a panel they
  cannot see.
*/

(function () {
  'use strict';

  var OPEN = 'is-open';

  function panel() {
    return document.querySelector('[data-ab-search-panel]');
  }

  function toggles() {
    return document.querySelectorAll('[data-ab-search-toggle]');
  }

  function isOpen() {
    var p = panel();
    return !!p && p.classList.contains(OPEN);
  }

  function open() {
    var p = panel();
    if (!p || isOpen()) return;

    p.hidden = false;
    // The class has to land on a frame after `hidden` is dropped, or the
    // element goes straight to its open state with no transition to run.
    requestAnimationFrame(function () {
      p.classList.add(OPEN);
    });

    Array.prototype.forEach.call(toggles(), function (b) {
      b.setAttribute('aria-expanded', 'true');
      b.classList.add(OPEN);
    });

    var input = p.querySelector('input[type="search"]');
    if (input) input.focus();
  }

  function close(refocus) {
    var p = panel();
    if (!p || !isOpen()) return;

    p.classList.remove(OPEN);

    Array.prototype.forEach.call(toggles(), function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.classList.remove(OPEN);
    });

    // Wait for the transition before hiding, but never trust
    // transitionend alone - it does not fire if the panel was never
    // painted, or under prefers-reduced-motion.
    window.setTimeout(function () {
      if (!isOpen()) p.hidden = true;
    }, 260);

    if (refocus) {
      var first = document.querySelector('[data-ab-search-toggle]');
      if (first) first.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ab-search-toggle]');
    if (t) {
      e.preventDefault();
      if (isOpen()) close(false);
      else open();
      return;
    }

    if (!isOpen()) return;

    var p = panel();
    // A click inside the panel, or on a toggle, is not a dismissal. Neither
    // is a click on the predictive results, which live inside the panel.
    if (p && !p.contains(e.target)) close(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    // Dawn's predictive search also answers Escape, to shut its results
    // list. Leave it the first press and only close the panel once the
    // results have gone, so one key does one thing at a time.
    var p = panel();
    var live = p && p.querySelector('predictive-search[open]');
    if (live) return;
    close(true);
  });
})();
