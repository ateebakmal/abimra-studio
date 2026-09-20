/*
  ABIMRA Studio — homepage behaviour.
  Ported from design-guides/abimra-mockup.html, with the class names
  namespaced to `ab-` (see assets/abimra.css for why).

  Three things live here:
    1. Reveal-on-scroll for everything below the hero.
    2. The hero headline mask, restored to overflow:visible afterwards.
    3. The review deck — a swipeable stack below 769px, a static
       scatter above it.

  Everything is guarded so a section can be absent, reordered, or
  removed in the theme editor without breaking the others.
*/

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * 1. Reveal on scroll
   * ------------------------------------------------------------------ */

  function initReveals(root) {
    var els = Array.prototype.slice.call((root || document).querySelectorAll('.ab-rv'));
    if (!els.length) return;

    // No observer support: leave everything visible rather than hidden.
    if (!('IntersectionObserver' in window) || REDUCED) {
      els.forEach(function (el) {
        el.classList.add('ab-in');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('ab-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Hero headline
   *
   * The lines rise out of a mask. Once they have arrived we restore
   * overflow:visible, otherwise descenders stay clipped forever.
   * ------------------------------------------------------------------ */

  function initHeadline(root) {
    var hl = (root || document).querySelector('[data-ab-headline]');
    if (!hl) return;

    if (REDUCED) {
      hl.classList.add('ab-done');
      return;
    }

    window.setTimeout(function () {
      hl.classList.add('ab-done');
    }, 1400);
  }

  /* ------------------------------------------------------------------ *
   * 3. Review deck
   *
   * Below 769px the three cards share one grid cell and stack. Swipe the
   * front card either way and it flies off to the back; tap it and the
   * deck advances; the dots jump to any card.
   *
   * A card behind is physically unreachable by a real finger, so tapping
   * the FRONT card is what advances the deck. Don't wire tap-to-front on
   * buried cards - it tests fine with synthetic clicks and is impossible
   * in the hand.
   * ------------------------------------------------------------------ */

  function initDeck(deck) {
    var cards = Array.prototype.slice.call(deck.querySelectorAll('.ab-quote'));
    if (cards.length < 2) return;

    var dots = deck.parentElement.querySelector('.ab-q-dots');
    var pos = cards.map(function (_, i) {
      return i;
    });
    var last = cards.length - 1;

    // Deck mode is decided by CSS, not by a width test here, so the two
    // can never disagree.
    function deckMode() {
      return window.getComputedStyle(deck).display === 'grid';
    }

    function render() {
      cards.forEach(function (c, i) {
        c.dataset.pos = pos[i];
        // only the front card is reachable
        c.setAttribute('tabindex', pos[i] === 0 ? '0' : '-1');
        c.setAttribute('aria-hidden', pos[i] === 0 ? 'false' : 'true');
      });
      if (!dots) return;
      Array.prototype.slice.call(dots.children).forEach(function (d, i) {
        d.classList.toggle('ab-on', pos[i] === 0);
        d.setAttribute('aria-current', pos[i] === 0 ? 'true' : 'false');
      });
    }

    function touched() {
      deck.classList.add('ab-touched');
    }

    function bringToFront(i) {
      var p = pos[i];
      if (p === 0) return;
      pos.forEach(function (v, j) {
        if (v < p) pos[j] = v + 1;
      });
      pos[i] = 0;
      touched();
      render();
    }

    function sendToBack(i) {
      pos.forEach(function (v, j) {
        if (v > 0) pos[j] = v - 1;
      });
      pos[i] = last;
      touched();
      render();
    }

    cards.forEach(function (card, i) {
      var x0 = 0;
      var y0 = 0;
      var dx = 0;
      var dy = 0;
      var dragging = false;
      var axis = null;

      card.addEventListener('pointerdown', function (e) {
        // Reset first, so a tap after a swipe still reads as a tap.
        dx = 0;
        dy = 0;
        axis = null;
        if (!deckMode() || pos[i] !== 0 || e.button) return;
        x0 = e.clientX;
        y0 = e.clientY;
        dragging = true;
        try {
          card.setPointerCapture(e.pointerId);
        } catch (_) {
          /* not fatal */
        }
      });

      card.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        dx = e.clientX - x0;
        dy = e.clientY - y0;

        if (!axis) {
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
          } else {
            return;
          }
        }

        // Vertical intent - hand the gesture back to the page.
        if (axis === 'y') {
          dragging = false;
          card.classList.remove('ab-dragging');
          card.style.transform = '';
          return;
        }

        card.classList.add('ab-dragging');
        card.style.transform = 'translateX(' + dx + 'px) rotate(' + dx * 0.045 + 'deg)';
      });

      function release() {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('ab-dragging');

        var w = card.offsetWidth;
        var past = axis === 'x' && Math.abs(dx) > Math.max(70, w * 0.28);

        if (!past) {
          card.style.transform = ''; // spring back
          return;
        }

        var dir = dx > 0 ? 1 : -1;
        card.classList.add('ab-flying');
        card.style.transform = 'translateX(' + dir * (w + 140) + 'px) rotate(' + dir * 20 + 'deg)';

        window.setTimeout(function () {
          // Land at the back with no fly-in.
          card.classList.replace('ab-flying', 'ab-noanim');
          card.style.transform = '';
          sendToBack(i);
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              card.classList.remove('ab-noanim');
            });
          });
        }, 220);
      }

      card.addEventListener('pointerup', release);
      card.addEventListener('pointercancel', release);

      card.addEventListener('click', function () {
        if (!deckMode() || pos[i] !== 0 || Math.abs(dx) > 6) return;
        sendToBack(i);
      });

      card.addEventListener('keydown', function (e) {
        if (!deckMode() || pos[i] !== 0) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sendToBack(i);
        }
      });
    });

    if (dots) {
      Array.prototype.slice.call(dots.children).forEach(function (d, i) {
        d.addEventListener('click', function () {
          bringToFront(i);
        });
      });
    }

    render();
  }

  function initDecks(root) {
    Array.prototype.slice.call((root || document).querySelectorAll('.ab-quotes')).forEach(initDeck);
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot(root) {
    initReveals(root);
    initHeadline(root);
    initDecks(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot(document);
    });
  } else {
    boot(document);
  }

  // The theme editor re-renders a single section without reloading the
  // page, so re-run inside whatever was just swapped in.
  document.addEventListener('shopify:section:load', function (event) {
    boot(event.target);
  });
})();
