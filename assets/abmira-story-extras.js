/*
  Abmira: brand story extras.

  Two behaviours layered on top of abimra-story.js WITHOUT editing it, so
  the handoff files stay byte-identical and can be replaced wholesale if
  their author ships an update.

    1. Collapse on completion. Once the runway has been scrolled all the
       way past, the section stops animating and shrinks from seven screens
       to one, holding the finale. Scrolling back up then passes a single
       screen instead of rewinding the whole story.

    2. Watch again. Puts the runway back and re-boots the animation.

  WHAT IS DELIBERATELY NOT HERE

  An earlier version also remembered, for the browsing session, that the
  story had been seen, and booted a returning visitor straight into the
  static finale. The section gives no way to ask for that: every boot
  clears the `is-static` class, and the finale frame can only be drawn by
  the section's own code. The way in was to answer matchMedia `true` for
  the reduced-motion query while it booted - and that turned out to freeze
  whatever frame happened to be current rather than the finale, so the
  animation never played at all.

  It was too clever for what it bought. The animation now plays on every
  page load, which is also the only behaviour that cannot surprise anyone.
*/

(function () {
  'use strict';

  var SEL = '[data-as]';

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

  /* ------------------------------------------------------------------ *
   * Collapse
   *
   * `is-static` is the section's own state for one frame and no pinning -
   * what it uses for prefers-reduced-motion. Reusing it means the
   * collapsed layout is a path the section already supports and tests,
   * rather than something invented here.
   *
   * This only ever runs once the runway has been scrolled fully past, so
   * the frame it freezes is always the finale.
   * ------------------------------------------------------------------ */
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
    // is what stops everything below appearing to leap upwards. The
    // browser's own scroll anchoring is switched off for this section in
    // abmira.css, or the change would be corrected twice.
    var shrank = before - after;
    if (shrank > 0) window.scrollBy(0, -shrank);

    addReplay(sec);
  }

  function replay(sec) {
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

  // The theme editor replaces the section rather than re-running it, so the
  // replacement is a fresh element that needs watching again.
  document.addEventListener('shopify:section:load', function () {
    window.setTimeout(start, 0);
  });
})();
