/*
  Abimra: brand story extras.

  Two behaviours layered on top of abimra-story.js WITHOUT editing it, so
  the handoff files stay byte-identical and can be replaced wholesale if
  their author ships an update.

    1. Collapse on completion. Once the story has played, the section
       shrinks from seven screens to one, holding the finale, so that
       scrolling back up passes a single screen instead of rewinding.

    2. Watch again. Puts the runway back and re-boots the animation.

  HOW THE COLLAPSE AVOIDS THE iOS FLASH

  Shrinking the runway means removing ~4000px from the page, and iOS
  cannot be asked to change layout and scroll position in the same frame:
  its compositor keeps sticky elements and will-change layers on its own
  thread, and a combined layout-change-plus-jump arrives before the
  rects it depends on do. One frame gets presented with the composited
  content missing - the header, and everything inside the stage. That is
  the flash that was filmed, twice, from two different fixes.

  The answer (borrowed from how GSAP ScrollTrigger kills a pinned
  section: scroll to the trigger's start, THEN unpin) is to never combine
  the two operations:

    a. Freeze the animation the moment it completes, so the scroll
       position no longer drives it.
    b. Jump the scroll to the runway's START. While the stage is pinned
       the screen looks identical from either end of the runway, so this
       is a pure scroll move between two identical frames - layout
       untouched, constraint rects untouched, nothing for the compositor
       to recompute.
    c. Next frame, collapse the runway. The removed height is now
       entirely BELOW the viewport, so the layout change needs no scroll
       correction at all - from us or from Safari.

  Each step is something iOS does safely on its own. Only the
  combination was poison.

  Step b's identical-frames guarantee only holds while the stage is
  actually pinned, so this path runs when the visitor stops at the
  finale. Stopped long past it, the story is off screen and the old
  anchored correction runs instead - at worst it can blink things that
  are on screen then, which is far from the story. Stopped half-past,
  with the finale partly visible, neither path can hide the change, so
  nothing happens yet: the watcher stays armed and collapses at the next
  opportunity. A deferred collapse costs nothing - the animation is
  already frozen, so there is nothing left to rewind.

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
   * Freeze
   *
   * Runs the moment the runway has been fully scrolled, separately from
   * the collapse, which may happen much later. Two reasons it cannot
   * wait: it is what stops scrolling back up from rewinding the story,
   * and the pinned-path jump below moves the scroll to the runway's
   * start - with a live, scroll-driven animation that would mean
   * snapping back to frame zero.
   * ------------------------------------------------------------------ */
  function freeze(sec) {
    if (sec.__abFroze) return;
    sec.__abFroze = true;
    if (typeof sec.__asDestroy === 'function') sec.__asDestroy();
  }

  /* ------------------------------------------------------------------ *
   * Collapse, pinned path
   *
   * The visitor stopped at the finale, stage pinned and filling the
   * screen. Jump to the runway's start - identical pixels, because the
   * pinned stage looks the same from either end - then shrink the
   * runway with the scroll already at its final value. The rAF recheck
   * is belt and braces; `moved` is expected to be zero.
   * ------------------------------------------------------------------ */
  function collapsePinned(sec, runway, stage) {
    freeze(sec);

    var pin = stage.getBoundingClientRect().top;
    var doc = document.documentElement;
    var max = Math.max(0, doc.scrollHeight - (window.innerHeight || doc.clientHeight));
    var target = Math.round(runway.getBoundingClientRect().top + window.pageYOffset - pin);
    if (target < 0) target = 0;
    if (target > max) target = max;

    window.scrollTo(0, target);

    window.requestAnimationFrame(function () {
      var before = stage.getBoundingClientRect().top;
      sec.classList.add('is-static');
      var moved = stage.getBoundingClientRect().top - before;
      if (moved) window.scrollTo(0, window.pageYOffset + moved);
    });
  }

  /* ------------------------------------------------------------------ *
   * Collapse, off-screen path
   *
   * The visitor stopped with the story entirely above the viewport. The
   * removed height is all above, so the correction is measured - the
   * same edge before and after, no arithmetic on heights - and then held
   * for a few frames, because Safari applies its own adjustment for a
   * removed tall element a frame or two after ours. The hold releases
   * the instant the visitor touches anything.
   * ------------------------------------------------------------------ */
  function collapseAnchored(sec) {
    freeze(sec);

    var ref = sec.getBoundingClientRect().bottom;
    sec.classList.add('is-static');
    var moved = sec.getBoundingClientRect().bottom - ref;
    if (!moved) return;

    var doc = document.documentElement;
    var max = Math.max(0, doc.scrollHeight - (window.innerHeight || doc.clientHeight));
    var target = window.pageYOffset + moved;
    if (target < 0) target = 0;
    if (target > max) target = max;

    window.scrollTo(0, target);

    var held = 0;
    var live = true;

    function release() {
      live = false;
      window.removeEventListener('touchstart', release);
      window.removeEventListener('wheel', release);
      window.removeEventListener('keydown', release);
    }

    window.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('keydown', release);

    (function reassert() {
      if (!live || held++ > 10) {
        release();
        return;
      }
      if (Math.abs(window.pageYOffset - target) > 1) window.scrollTo(0, target);
      window.requestAnimationFrame(reassert);
    })();
  }

  /* ------------------------------------------------------------------ *
   * The section builds these up with appendChild and never empties them,
   * so a second init writes on top of the first: the typed line on the
   * shirt comes out doubled. .as__wall is left alone - it clears itself
   * with innerHTML = '' before it rebuilds.
   * ------------------------------------------------------------------ */
  var REBUILT = ['.as__prText', '.as__rows', '.as__fly'];

  function clearRebuilt(sec) {
    REBUILT.forEach(function (sel) {
      var el = sec.querySelector(sel);
      if (el) el.textContent = '';
    });
  }

  function replay(sec) {
    // The button is NOT removed here, and is not re-added on collapse.
    // It is in the DOM from boot and stays there, because taking it out
    // and putting it back is a layout change either way. See addReplay.
    clearRebuilt(sec);
    sec.classList.remove('is-static');
    sec.__abFroze = false;

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

  /* Confirm the page has actually come to rest. The debounce timer is
     not proof: iOS stops firing scroll events slightly before a glide
     ends, so the timer can expire while the page is still creeping. */
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

  /* ------------------------------------------------------------------ *
   * Watch for the runway being passed
   * ------------------------------------------------------------------ */
  function watch(sec) {
    if (sec.__abWatching) return;
    sec.__abWatching = true;

    var timer = 0;
    var hasScrollEnd = 'onscrollend' in window;

    function stop() {
      window.removeEventListener('scroll', onScroll);
      if (hasScrollEnd) window.removeEventListener('scrollend', arm);
      window.clearTimeout(timer);
      sec.__abWatching = false;
    }

    // The runway has been scrolled to its end: the stage has stopped
    // travelling and is holding the finale.
    function done() {
      var runway = sec.querySelector('.as__runway');
      if (!runway) return false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      return runway.getBoundingClientRect().bottom <= h + 1;
    }

    function fire() {
      if (sec.classList.contains('is-static')) {
        stop();
        return;
      }
      if (!done()) return;

      var runway = sec.querySelector('.as__runway');
      var stage = sec.querySelector('.as__stage');
      if (!runway || !stage) return;

      // Pinned means the stage sits exactly at its sticky offset - the
      // identical-frames guarantee the pinned path relies on.
      var pin = parseFloat(window.getComputedStyle(stage).top) || 0;
      var at = stage.getBoundingClientRect().top;

      if (Math.abs(at - pin) <= 2) {
        stop();
        collapsePinned(sec, runway, stage);
        return;
      }

      if (sec.getBoundingClientRect().bottom <= 0) {
        stop();
        collapseAnchored(sec);
        return;
      }

      // Half-past: the finale is partly on screen, and neither path can
      // hide the change from here. Stay armed and wait for a position
      // where it can. The story is already frozen, so deferring costs
      // nothing.
    }

    function arm() {
      if (sec.classList.contains('is-static')) {
        stop();
        return;
      }
      if (!done()) return;
      whenStill(30, null, fire);
    }

    function onScroll() {
      if (sec.classList.contains('is-static')) {
        stop();
        return;
      }

      window.clearTimeout(timer);
      if (!done()) return;

      // The first moment the finale is complete, stop the scrub - even
      // though the collapse itself may wait for a better position.
      freeze(sec);

      timer = window.setTimeout(arm, 160);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (hasScrollEnd) window.addEventListener('scrollend', arm);
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
