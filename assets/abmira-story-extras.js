/*
  Abmira: brand story extras.

  Three behaviours layered on top of abimra-story.js WITHOUT editing it, so
  the handoff files stay byte-identical and can be replaced wholesale if
  their author ships an update.

    1. Collapse on completion. Once the runway has been scrolled all the way
       past, the section stops animating and shrinks from seven screens to
       one, holding the finale. Scrolling back up then passes a single
       screen instead of rewinding the whole story.

    2. Once per visit. A collapsed section is remembered for the browsing
       session, so a reload does not replay it. sessionStorage rather than
       localStorage: a visitor coming back tomorrow should still get the
       brand moment once.

    3. Watch again. Puts the runway back and re-boots the animation.

  This file is loaded in the document head so it runs BEFORE the section's
  own deferred script. That ordering is load-bearing for (2).
*/

(function () {
  'use strict';

  var KEY = 'ab-story-seen';
  var SEL = '[data-as]';

  // Storage throws in private mode in some browsers. Failing to read means
  // "not seen", so the animation plays - showing it to someone twice is a
  // far smaller harm than wrongly hiding it.
  function seen() {
    try {
      return sessionStorage.getItem(KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function remember(v) {
    try {
      if (v) sessionStorage.setItem(KEY, '1');
      else sessionStorage.removeItem(KEY);
    } catch (e) {
      /* nothing to do: the session just will not be remembered */
    }
  }

  /* ------------------------------------------------------------------ *
   * 1. Booting straight into the finale, for a visitor who has seen it
   *
   * The section has exactly one state that means "one frame, no pinning":
   * the `is-static` class it uses for prefers-reduced-motion. There is no
   * way to ask for it from outside - every normal boot calls
   * classList.remove('is-static') - and the frame it holds has to be drawn
   * by the section's own code, or the stage is empty.
   *
   * So the reduced-motion branch is borrowed: matchMedia is answered `true`
   * for that one query while the section boots, and restored immediately
   * after. The section then runs its own tested path to a static finale.
   *
   * If a future version reads the preference differently this stops having
   * any effect and the animation simply plays, which is the right way for
   * it to fail.
   * ------------------------------------------------------------------ */
  function borrowReducedMotion() {
    var real = window.matchMedia;
    if (typeof real !== 'function') return;

    window.matchMedia = function (q) {
      if (String(q).indexOf('prefers-reduced-motion') !== -1) {
        return {
          matches: true,
          media: q,
          onchange: null,
          addListener: function () {},
          removeListener: function () {},
          addEventListener: function () {},
          removeEventListener: function () {},
          dispatchEvent: function () { return false; }
        };
      }
      return real.apply(window, arguments);
    };

    // Deferred scripts all run before DOMContentLoaded, so by here the
    // section has booted and captured its answer.
    document.addEventListener('DOMContentLoaded', function () {
      window.matchMedia = real;
    });
  }

  if (seen() && document.querySelector(SEL)) borrowReducedMotion();

  /* ------------------------------------------------------------------ *
   * 2. Collapse, and the control to undo it
   * ------------------------------------------------------------------ */

  function label(sec) {
    return sec.getAttribute('data-replay-label') || 'Watch again';
  }

  function addReplay(sec) {
    if (sec.querySelector('.ab-story-replay')) return;
    var host = sec.querySelector('.as__ctas') || sec.querySelector('.as__end');
    if (!host) return;

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ab-story-replay';
    b.textContent = label(sec);
    b.addEventListener('click', function () {
      replay(sec);
    });
    host.appendChild(b);
  }

  function collapse(sec) {
    if (sec.classList.contains('is-static')) return;
    var runway = sec.querySelector('.as__runway');
    if (!runway) return;

    var before = runway.getBoundingClientRect().height;
    if (typeof sec.__asDestroy === 'function') sec.__asDestroy();
    sec.classList.add('is-static');
    var after = runway.getBoundingClientRect().height;

    // Six screens have just been removed from the page ABOVE the viewport.
    // Taking the same distance off the scroll position in this same frame
    // is what stops everything below appearing to leap upwards.
    var shrank = before - after;
    if (shrank > 0) window.scrollBy(0, -shrank);

    remember(true);
    addReplay(sec);
  }

  function replay(sec) {
    remember(false);

    var b = sec.querySelector('.ab-story-replay');
    if (b && b.parentNode) b.parentNode.removeChild(b);

    sec.classList.remove('is-static');

    // The section refuses to init twice; this is the flag it guards with.
    // Reaching for an internal, and the one part of this that a future
    // version could rename. Replay would break; nothing else would.
    sec.__as = false;

    // Its own re-boot hook. The handler calls boot(e.target), and a plain
    // document dispatch makes that boot(document), which re-inits anything
    // whose guard is clear - this section and nothing else.
    document.dispatchEvent(new Event('shopify:section:load'));

    watch(sec);

    var top = sec.getBoundingClientRect().top + window.pageYOffset;
    try {
      window.scrollTo({ top: top, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, top);
    }
  }

  function watch(sec) {
    if (sec.__abWatching) return;
    sec.__abWatching = true;

    function onScroll() {
      if (sec.classList.contains('is-static')) {
        window.removeEventListener('scroll', onScroll);
        sec.__abWatching = false;
        return;
      }
      // Fully above the viewport means the runway has been scrolled past,
      // which can only happen after the last frame has been drawn.
      if (sec.getBoundingClientRect().bottom <= 0) {
        window.removeEventListener('scroll', onScroll);
        sec.__abWatching = false;
        collapse(sec);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll(SEL), function (sec) {
      if (sec.classList.contains('is-static')) addReplay(sec);
      else watch(sec);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // The theme editor swaps the section without reloading the page.
  document.addEventListener('shopify:section:load', function () {
    window.setTimeout(start, 0);
  });
})();
