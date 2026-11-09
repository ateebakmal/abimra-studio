/*
  ABIMRA Studio — homepage behaviour.
  Ported from design-guides/abmira-mockup.html, with the class names
  namespaced to `ab-` (see assets/abmira.css for why).

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
   * 4. Mobile drawer
   *
   * Only reachable below 861px, where the CSS displays it. Focus is
   * trapped while open and returned to the trigger on close, and the page
   * behind is locked so a scroll gesture inside the panel cannot chain
   * out to the document.
   * ------------------------------------------------------------------ */

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function initDrawer(root) {
    var drawer = (root || document).querySelector('[data-abmira-drawer]');
    if (!drawer || drawer.dataset.abmiraReady === 'true') return;
    drawer.dataset.abmiraReady = 'true';

    var opener = document.querySelector('[data-abmira-drawer-open]');
    var panel = drawer.querySelector('.ab-drawer-panel');
    if (!opener || !panel) return;

    function isOpen() {
      return drawer.classList.contains('ab-open');
    }

    function open() {
      drawer.classList.add('ab-open');
      document.body.classList.add('ab-drawer-open');
      opener.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector(FOCUSABLE);
      if (first) first.focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      drawer.classList.remove('ab-open');
      document.body.classList.remove('ab-drawer-open');
      opener.setAttribute('aria-expanded', 'false');
      if (returnFocus !== false) opener.focus();
    }

    opener.addEventListener('click', open);

    Array.prototype.slice.call(drawer.querySelectorAll('[data-abmira-drawer-close]')).forEach(
      function (el) {
        el.addEventListener('click', function () {
          close();
        });
      }
    );

    // A link inside the drawer navigates; drop the scroll lock so a
    // same-page anchor does not leave the body frozen.
    Array.prototype.slice.call(drawer.querySelectorAll('a[href]')).forEach(function (a) {
      a.addEventListener('click', function () {
        close(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        close();
        return;
      }

      if (e.key !== 'Tab') return;

      var items = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE)).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!items.length) return;

      var first = items[0];
      var lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        first.focus();
      }
    });

    // Above 861px the drawer is display:none. If the window is widened
    // while it is open, close it so the body lock cannot be stranded.
    var wide = window.matchMedia('(min-width: 861px)');
    var onWide = function (e) {
      if (e.matches) close(false);
    };
    if (wide.addEventListener) {
      wide.addEventListener('change', onWide);
    } else if (wide.addListener) {
      wide.addListener(onWide);
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. Size chart overlay
   *
   * <dialog> does nearly all of this. showModal() puts the panel in the
   * top layer, which is what gives the centring, the tinted ::backdrop,
   * Escape to close, the focus trap and the inert page behind - none of
   * which we have to write or maintain.
   *
   * Two things are left over: wiring the buttons, and closing on a click
   * outside the panel, which <dialog> deliberately does not do.
   *
   * Delegated from document and bound once, because boot() runs again for
   * every section the theme editor re-renders.
   * ------------------------------------------------------------------ */

  var sizeChartBound = false;

  function initSizeChart() {
    if (sizeChartBound || !document.body) return;
    sizeChartBound = true;

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var opener = target.closest('[data-ab-sg-open]');
      if (opener) {
        var chart = document.getElementById(opener.getAttribute('aria-controls'));
        // Without showModal there is no backdrop and no focus trap, so
        // leave the contained chart as the answer rather than opening
        // something worse than it.
        if (chart && typeof chart.showModal === 'function') {
          event.preventDefault();
          chart.showModal();
        }
        return;
      }

      var closer = target.closest('[data-ab-sg-close]');
      if (closer) {
        var owner = closer.closest('dialog');
        if (owner) owner.close();
        return;
      }

      // A click on the tinted area is reported against the dialog itself,
      // because the panel covers everything inside it.
      if (target.tagName === 'DIALOG' && target.classList.contains('ab-sg-modal')) {
        target.close();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. Carousel swipe vs. tap
   *
   * Dawn covers every product slide with .product__media-toggle::after to
   * open the image modal. In a stacked gallery those pixels only ever get
   * tapped. In a carousel they are also the pixels you drag to change
   * image - and a drag ends in a click, so a swipe opens the lightbox
   * instead of moving the gallery.
   *
   * A pointer that travelled more than a few pixels was a swipe, so its
   * click is swallowed. A real tap never moves, and still zooms.
   * ------------------------------------------------------------------ */

  var swipeBound = false;

  function initCarouselSwipe() {
    if (swipeBound || !document.body) return;
    swipeBound = true;

    var startX = 0;
    var startY = 0;
    var tracking = false;
    var moved = false;

    document.addEventListener(
      'pointerdown',
      function (event) {
        if (!event.target.closest || !event.target.closest('.pt-carousel')) return;
        startX = event.clientX;
        startY = event.clientY;
        tracking = true;
        moved = false;
      },
      true
    );

    document.addEventListener(
      'pointermove',
      function (event) {
        if (!tracking || moved) return;
        if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) moved = true;
      },
      true
    );

    document.addEventListener(
      'pointerup',
      function () {
        tracking = false;
      },
      true
    );

    // Capture phase, so this runs before Dawn's own opener handler.
    document.addEventListener(
      'click',
      function (event) {
        if (!moved) return;
        moved = false;
        if (!event.target.closest || !event.target.closest('.pt-carousel .product__media-toggle')) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );
  }

  /* ------------------------------------------------------------------ *
   * 6. Carousel position readout
   *
   * Counted from the slides rather than left to SliderComponent, which
   * reports pages: slides - slidesPerPage + 1. That is the number of
   * scroll positions, not the number of images, and the two agree only
   * while slidesPerPage is exactly 1. Let the slide come out a pixel
   * wider than its track and the floor() drops it to 0, at which point
   * four images are reported as five.
   * ------------------------------------------------------------------ */

  function initCarouselCount(root) {
    var galleries = (root || document).querySelectorAll('.pt-carousel');

    Array.prototype.forEach.call(galleries, function (gallery) {
      var track = gallery.querySelector('[id^="Slider-Gallery"]');
      var current = gallery.querySelector('[data-pt-count-current]');
      var total = gallery.querySelector('[data-pt-count-total]');
      if (!track || !current || !total) return;

      function update() {
        var slides = track.querySelectorAll('[id^="Slide-"]');
        if (!slides.length) return;
        total.textContent = slides.length;

        var step = slides[0].offsetWidth;
        if (!step) return;
        var index = Math.round(track.scrollLeft / step) + 1;
        current.textContent = Math.min(Math.max(index, 1), slides.length);
      }

      track.addEventListener('scroll', update, { passive: true });
      // Dawn re-renders the gallery on a variant change, so the count is
      // read again rather than trusted from load.
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot(root) {
    initReveals(root);
    initHeadline(root);
    initDecks(root);
    initDrawer(document);
    initSizeChart();
    initCarouselSwipe();
    initCarouselCount(root);
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

/* ============================================================
   Sort dropdown, replaced.

   The open list of a native <select> is drawn by the operating system
   and cannot be themed, so the control is swapped at runtime for a
   button and a listbox styled like the filter popups. The select stays
   in the DOM, hidden, holding the value: choosing an option sets it and
   fires input + change on it, and Dawn's FacetFiltersForm takes it from
   there exactly as if the native control had been used. No JS means the
   native select simply remains - a plainer control, not a broken one.
   ============================================================ */
(function () {
  'use strict';

  function enhance(scope) {
    var selects = (scope || document).querySelectorAll(
      '.ab-facets select.facet-filters__sort:not([data-ab-sorted])'
    );

    Array.prototype.forEach.call(selects, function (sel) {
      sel.dataset.abSorted = '1';

      var wrap = document.createElement('div');
      wrap.className = 'ab-sort';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ab-sort-btn';
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');
      if (sel.id) btn.setAttribute('aria-labelledby', sel.id + '-label ' + sel.id);

      var list = document.createElement('ul');
      list.className = 'ab-sort-menu';
      list.setAttribute('role', 'listbox');
      list.hidden = true;

      function paintButton() {
        var current = sel.options[sel.selectedIndex];
        btn.textContent = current ? current.text : '';
        var caret = document.createElement('span');
        caret.className = 'ab-sort-caret';
        caret.setAttribute('aria-hidden', 'true');
        btn.appendChild(caret);
      }

      function paintSelected() {
        Array.prototype.forEach.call(list.children, function (li, i) {
          li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false');
        });
      }

      Array.prototype.forEach.call(sel.options, function (opt, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.tabIndex = -1;
        li.textContent = opt.text;
        li.addEventListener('click', function () {
          choose(i);
        });
        list.appendChild(li);
      });

      function openList() {
        list.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        var sel0 = list.querySelector('[aria-selected="true"]') || list.firstElementChild;
        if (sel0) sel0.focus();
      }

      function closeList(refocus) {
        list.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        if (refocus) btn.focus();
      }

      function choose(i) {
        if (sel.selectedIndex !== i) {
          sel.selectedIndex = i;
          // Dawn binds ONE listener for this, and it is 'input', not 'change'
          // (facets.js: facetForm.addEventListener('input', ...)). Dispatching
          // change alone bubbled to the form and landed on nothing, so sorting
          // did nothing at all while the filter checkboxes - which fire input
          // natively - kept working. Fire both, in the order a real <select>
          // does, so anything else listening for change still hears it.
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        paintButton();
        paintSelected();
        closeList(true);
      }

      btn.addEventListener('click', function () {
        if (list.hidden) openList();
        else closeList(false);
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openList();
        }
      });

      list.addEventListener('keydown', function (e) {
        var focus = document.activeElement;
        if (e.key === 'ArrowDown' && focus.nextElementSibling) {
          e.preventDefault();
          focus.nextElementSibling.focus();
        } else if (e.key === 'ArrowUp' && focus.previousElementSibling) {
          e.preventDefault();
          focus.previousElementSibling.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose(Array.prototype.indexOf.call(list.children, focus));
        } else if (e.key === 'Escape') {
          closeList(true);
        } else if (e.key === 'Tab') {
          closeList(false);
        }
      });

      document.addEventListener('click', function (e) {
        if (!list.hidden && !wrap.contains(e.target)) closeList(false);
      });

      sel.style.display = 'none';
      // Dawn renders its own caret svg beside the select; it points at
      // nothing once the select is hidden.
      var dawnCaret = sel.parentElement && sel.parentElement.querySelector('svg');
      if (dawnCaret) dawnCaret.style.display = 'none';

      sel.parentElement.insertBefore(wrap, sel);
      wrap.appendChild(btn);
      wrap.appendChild(list);
      paintButton();
      paintSelected();
    });
  }

  function boot() {
    enhance(document);
    // Facet changes re-render parts of this area; catch anything new.
    var host = document.querySelector('.ab-facets');
    if (!host || host.dataset.abSortWatch === '1' || typeof MutationObserver !== 'function') return;
    host.dataset.abSortWatch = '1';
    new MutationObserver(function () {
      enhance(host);
    }).observe(host, { childList: true, subtree: true });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
