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

    /* Anchor on something real, and measure it twice.

       This used to do arithmetic on heights: take the runway's height
       before and after, subtract the difference from the scroll
       position, and clamp the result to the section's new bottom so a
       visitor could not land back inside a story they had just
       finished. Both halves were wrong.

       The clamp was wrong because at the finale the correct answer IS
       inside the section - the stage is what fills the screen, so that
       is where the visitor should stay. The section's bottom is a whole
       screen further down, so the clamp won every time and shunted them
       past the story into the marquee.

       The arithmetic was wrong on iOS for a quieter reason: it assumed
       the collapsed stage was exactly one window.innerHeight tall, and
       the stage is sized in svh. With the address bar hidden those are
       not the same number, so the sum was out by the difference.

       Measuring the same edge before and after assumes neither. Whatever
       the visitor is looking at - the finale, or a section below it -
       keeps the screen position it already had. */
    var ref = sec.getBoundingClientRect().bottom;

    if (typeof sec.__asDestroy === 'function') sec.__asDestroy();
    sec.classList.add('is-static');

    var moved = sec.getBoundingClientRect().bottom - ref;
    if (!moved) return;

    /* Absolute, not scrollBy. scrollBy adds to wherever the page happens
       to be at the instant it runs, and on a phone that can still be a
       moving target even after the wait. pageYOffset is read here, after
       the reflow, so it is the position the measurement above belongs
       to. Scroll anchoring is off for this section in abmira.css, or the
       browser would correct for the same change a second time. */
    var target = window.pageYOffset + moved;
    window.scrollTo(0, target < 0 ? 0 : target);

    /* Re-assert the same position on the next frame.

       iOS keeps sticky elements pinned on the compositor thread, against
       a constraint rect it updates from the main thread. A single jump
       of ~4000px can outrun that by a frame: the header is composited
       against the old rect, which puts it off the top of the screen, and
       it snaps back once the constraint catches up. That is the header
       blinking, and it is why content is drawn under the status bar in
       the frame where it is missing - the bar is not unpainted, it is
       painted somewhere else.

       Setting the scroll to the value it already has is free when
       nothing is wrong, and forces the constraint to be recomputed when
       it is stale. */
    window.requestAnimationFrame(function () {
      var now = window.pageYOffset;
      window.scrollTo(0, now);
    });
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

  /* ------------------------------------------------------------------ *
   * Watch for the runway being passed
   *
   * The collapse must not run while the page is still moving. It used to
   * be called straight out of the scroll handler, and on iOS that means
   * calling window.scrollTo in the middle of a live fling: Safari does
   * not replace the momentum, it carries on from wherever the jump put
   * you. A flick past the story therefore landed somewhere further down
   * the page - the reviews - with the layout rearranging on the way.
   *
   * A wheel or a trackpad has far less momentum left by the time the
   * runway is passed, which is why none of this showed on a laptop.
   *
   * So the trigger only arms here, and the collapse waits for the scroll
   * to stop. scrollend is exact where it exists; the timer covers Safari,
   * which has not shipped it, and anything else that has not either.
   * Waiting costs nothing visually, because the correction keeps whatever
   * is on screen on screen however far past the visitor has travelled.
   * ------------------------------------------------------------------ */
  function watch(sec) {
    if (sec.__abWatching) return;
    sec.__abWatching = true;

    var timer = 0;
    var hasScrollEnd = 'onscrollend' in window;

    function stop() {
      window.removeEventListener('scroll', onScroll);
      if (hasScrollEnd) window.removeEventListener('scrollend', fire);
      window.clearTimeout(timer);
      sec.__abWatching = false;
    }

    /* Done means the runway has been scrolled to its end, so the stage
       has stopped travelling and is holding the finale.

       This used to wait for the whole section to clear the top of the
       screen. Collapsing at the finale instead means the reflow happens
       while the stage still covers the viewport, so the six screens
       being taken out of the page are all behind a full-screen panel
       and there is nothing on show to flicker. It is also what the
       section was asked for in the first place: collapse to the finale
       frame on completion. */
    function done() {
      var runway = sec.querySelector('.as__runway');
      if (!runway) return false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      return runway.getBoundingClientRect().bottom <= h + 1;
    }

    /* Confirm the page has actually come to rest before touching it.

       The timer is not proof. iOS stops firing scroll events slightly
       before a glide ends, so the timer can expire while the page is
       still creeping - and a scrollTo then does not replace the
       remaining momentum, it adds to it, carrying the visitor on down
       the page. That is the "it moved me to a lower section" case; the
       arithmetic itself is exact, measured in a headless Chromium at
       390x844, where the view holds to the pixel.

       So: watch pageYOffset across frames, and only collapse once it
       has been identical for two in a row. The cap stops this spinning
       forever on a page that never settles - a marquee animating the
       scroll position, say - in which case collapsing anyway is better
       than never collapsing. */
    function whenStill(tries, last, run) {
      window.requestAnimationFrame(function () {
        var y = window.pageYOffset;
        if (y === last || tries <= 0) {
          run();
          return;
        }
        whenStill(tries - 1, y, run);
      });
    }

    function fire() {
      if (sec.classList.contains('is-static')) {
        stop();
        return;
      }
      // Re-checked rather than trusted: the visitor may have scrolled
      // back up into the story while the timer was running.
      if (!done()) return;

      whenStill(30, null, function () {
        // Re-check once more. Thirty frames is half a second, and the
        // visitor may have set off again inside it.
        if (sec.classList.contains('is-static') || !done()) return;
        stop();
        collapse(sec);
      });
    }

    function onScroll() {
      if (sec.classList.contains('is-static')) {
        stop();
        return;
      }

      window.clearTimeout(timer);
      if (!done()) return;

      // At the finale. Arm, and let the page come to rest first.
      timer = window.setTimeout(fire, 160);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (hasScrollEnd) window.addEventListener('scrollend', fire);
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
