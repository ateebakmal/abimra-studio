/*
  Abimra: brand story extras.

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

    // Read the scroll position BEFORE anything moves, and correct to an
    // absolute target rather than a relative one.
    //
    // scrollBy adds to wherever the page happens to be at the instant it
    // runs, and during a fast flick - trackpad momentum, or a phone still
    // gliding - that is a moving target. The correction then lands
    // somewhere unrelated to the measurement it was based on, which is
    // how scrolling quickly past the story threw the visitor to the top.
    var y = window.pageYOffset;
    var before = runway.getBoundingClientRect().height;
    if (typeof sec.__asDestroy === 'function') sec.__asDestroy();
    sec.classList.add('is-static');
    var after = runway.getBoundingClientRect().height;

    // Six screens have just been removed from the page ABOVE the viewport,
    // so the same distance comes off the scroll position and nothing
    // appears to move. The browser's own scroll anchoring is switched off
    // for this section in abmira.css, or the change would be corrected
    // twice.
    var shrank = before - after;
    if (shrank > 0) {
      // A floor, not just a clamp at zero: where the section now ends.
      // Landing above this would drop the visitor back inside a story
      // they have just finished watching, which is the worse failure of
      // the two and the one actually reported.
      var floor = sec.getBoundingClientRect().bottom + window.pageYOffset;
      window.scrollTo(0, Math.max(floor, y - shrank));
    }
  }

  function replay(sec) {
    // The button is NOT removed here, and is not re-added on collapse.
    // It is in the DOM from boot and stays there, because taking it out
    // and putting it back is a layout change either way. See addReplay.
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
      // Added now, not when the story collapses. It used to be appended
      // at the end of collapse(), which is after the scroll correction
      // has already been worked out and applied - so the page gained the
      // button's height a frame later and everything below it jumped.
      //
      // Costs nothing to do it early: it lives in .as__end, which is
      // `visibility: hidden` until the finale rather than display:none,
      // so its box is already laid out and reserved. Adding the button
      // there changes the layout once, before anything is measured, and
      // never again.
      addReplay(sec);

      if (!sec.classList.contains('is-static')) watch(sec);
    });
  }

  // Wait for DOMContentLoaded, and do NOT take an early exit on
  // readyState.
  //
  // The section is rendered by Liquid as `class="as is-static"`, and its
  // own script clears that when it boots. Both scripts are deferred, and
  // deferred scripts run while readyState is already "interactive" - so a
  // plain `readyState === 'loading'` test falls through to running
  // immediately, which is BEFORE the section has booted. start() then sees
  // is-static on a section that is about to animate, treats it as already
  // collapsed, and never attaches the scroll watcher. The collapse can
  // then never happen.
  //
  // Every deferred script has finished by DOMContentLoaded, so that is the
  // earliest moment the class means what it says.
  if (document.readyState === 'complete') {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }

  // The theme editor replaces the section rather than re-running it, so the
  // replacement is a fresh element that needs watching again.
  document.addEventListener('shopify:section:load', function () {
    window.setTimeout(start, 0);
  });
})();
