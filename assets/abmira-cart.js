/*
  Abimra cart behaviour.

  Layered on top of Dawn's cart, which keeps doing the actual work:
  <cart-items> handles quantity and removal through the Cart AJAX API and
  re-renders the section. Nothing here talks to the cart API.

  Because Dawn swaps the whole .js-contents subtree on every change,
  anything bound to an element inside it would be lost. So everything is
  delegated from document, and the bits that need per-render setup run
  again from a MutationObserver on that subtree.

  What it adds:
    1. The design preview dialog.
    2. The "Removed X" toast with Undo.
    3. The phone checkout bar, shown only while the real button is off screen.
    4. The ticket printing itself out, and reprinting when the bag changes.
    5. A fallback when a design image fails to load.
*/

(function () {
  'use strict';

  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function page() {
    return document.querySelector('.ab-cart-page');
  }

  /* ------------------------------------------------------------------ *
   * 1. Design preview
   * ------------------------------------------------------------------ */

  var dlg = null;

  function buildDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'ab-cart-modal';
    dlg.innerHTML =
      '<div class="ab-cart-modal-in">' +
      '<div class="ab-cart-modal-top"><h2>Your design</h2>' +
      '<button type="button" class="ab-cart-modal-x" data-x aria-label="Close">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button></div>' +
      '<div class="ab-cart-stage" data-stage></div>' +
      '<p class="ab-cart-cap" data-cap></p>' +
      '<div class="ab-cart-modal-acts">' +
      '<a class="ab-btn ab-btn-s" data-full target="_blank" rel="noopener">Open full size</a>' +
      '<button type="button" class="ab-btn ab-btn-p" data-x>Looks right</button>' +
      '</div></div>';
    document.body.appendChild(dlg);

    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) dlg.close();
      // A click that lands on the dialog itself is the backdrop: the panel
      // covers everything inside it.
      else if (e.target === dlg) dlg.close();
    });
    return dlg;
  }

  function openPreview(url, caption) {
    var d = buildDialog();
    var stage = d.querySelector('[data-stage]');
    d.querySelector('[data-cap]').textContent = caption || '';
    d.querySelector('[data-full]').href = url;

    stage.innerHTML = '<p>Loading your design</p>';
    var img = new Image();
    img.alt = 'Preview of your design' + (caption ? ' on the ' + caption : '');
    img.onload = function () {
      stage.innerHTML = '';
      stage.appendChild(img);
    };
    img.onerror = function () {
      stage.innerHTML = '<p>We couldn’t load the preview here. Use “Open full size”.</p>';
    };
    img.src = url;

    if (typeof d.showModal === 'function') d.showModal();
    else window.open(url, '_blank');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ab-preview]');
    if (!b) return;
    e.preventDefault();
    openPreview(b.getAttribute('data-ab-preview'), b.getAttribute('data-ab-caption'));
  });

  /* ------------------------------------------------------------------ *
   * 2. Remove: the wipe, and the toast
   *
   * Dawn's cart-remove-button navigates to item.url_to_remove when its
   * JS has not taken over, and otherwise updates the line to quantity 0.
   * Either way the row disappears on the next render, so the wipe is
   * played first and the click is let through afterwards.
   * ------------------------------------------------------------------ */

  var toastT = 0;

  function toast(title, undoHref) {
    var el = document.querySelector('[data-ab-toast]');
    if (!el) return;
    el.innerHTML = '';
    el.hidden = false;
    el.appendChild(document.createTextNode('Removed ' + title + '.'));
    if (undoHref) {
      var a = document.createElement('button');
      a.type = 'button';
      a.textContent = 'Undo';
      a.addEventListener('click', function () {
        window.location.href = undoHref;
      });
      el.appendChild(a);
    }
    requestAnimationFrame(function () {
      el.classList.add('is-up');
    });
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      el.classList.remove('is-up');
      setTimeout(function () {
        el.hidden = true;
      }, 420);
    }, 5000);
  }

  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target.closest && e.target.closest('cart-remove-button');
      if (!btn) return;
      var row = btn.closest('.ab-cart-item');
      if (row && !REDUCE) row.classList.add('is-going');

      var title = btn.getAttribute('data-ab-title') || 'item';
      // Undo has to be built before the line goes, because afterwards
      // there is nothing left to read the variant and quantity from.
      var qtyEl = row && row.querySelector('.quantity__input');
      var id = qtyEl && qtyEl.getAttribute('data-quantity-variant-id');
      var qty = qtyEl ? qtyEl.value : '1';
      var undo = id ? '/cart/add?id=' + encodeURIComponent(id) + '&quantity=' + encodeURIComponent(qty) : '';

      setTimeout(function () {
        toast(title, undo);
      }, REDUCE ? 0 : 420);
    },
    true
  );

  /* ------------------------------------------------------------------ *
   * Make Dawn re-render the order ticket
   *
   * assets/cart.js rebuilds a fixed list of regions after every change,
   * and the only one it knows about in this section is .js-contents -
   * the line items. The ticket is a sibling column of that, outside it,
   * because the two form one grid. So the lines updated and the ticket
   * kept showing the old totals until the page was reloaded.
   *
   * Rather than duplicate the cart's fetch, its own list is extended:
   * same section id, so the HTML it already requested is reused and no
   * second request is made. Dawn then swaps our .js-ticket exactly as it
   * swaps .js-contents.
   *
   * Reached through the custom element registry rather than the CartItems
   * binding: cart.js is a classic script, so the class is not on window.
   * ------------------------------------------------------------------ */

  function teachCart() {
    var El = window.customElements && customElements.get('cart-items');
    if (!El || !El.prototype.getSectionsToRender || El.prototype.__abTicket) return;
    El.prototype.__abTicket = true;

    var original = El.prototype.getSectionsToRender;
    El.prototype.getSectionsToRender = function () {
      var list = original.call(this);

      /* Drop regions this theme does not render.
       *
       * Dawn's list is fixed and includes #cart-icon-bubble, its own
       * header cart counter. This theme's header is its own, so that
       * element does not exist - and Dawn does
       * document.getElementById(id).querySelector(...) with no null
       * check, so the whole update threw there. Inside a .then(), so it
       * surfaced as nothing at all: the line items updated because they
       * are first in the list, and every region after them silently did
       * not. That is why the ticket looked stale.
       */
      list = list.filter(function (entry) {
        return document.getElementById(entry.id);
      });

      var host = document.getElementById('main-cart-items');
      if (host && document.getElementById('ab-cart-side')) {
        // Same section id as the line items, so Dawn reuses the HTML it
        // already requested rather than making a second trip.
        list.push({
          id: 'ab-cart-side',
          section: host.dataset.id,
          selector: '.js-ticket',
        });
      }
      return list;
    };
  }

  /* The header's bag counter.
   *
   * Dawn keeps its own counter fresh through the #cart-icon-bubble
   * region that was just filtered out - this theme's header is its own,
   * so nothing was updating it and it sat at the count the page loaded
   * with. The ticket's printer line carries the new count and has just
   * been re-rendered from the server, so it is read from there rather
   * than fetched again. */
  function bagCount() {
    var src = document.querySelector('.ab-cart-printer-r');
    var bags = document.querySelectorAll('.ab-bag b, [data-am-count]');
    if (!bags.length) return;

    var n = src ? parseInt(src.textContent, 10) : 0;
    if (isNaN(n)) return;

    Array.prototype.forEach.call(bags, function (b) {
      b.textContent = n;
      var link = b.closest('[aria-label]');
      if (link) link.setAttribute('aria-label', link.getAttribute('aria-label').replace(/\d+/, n));
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Phone checkout bar
   * ------------------------------------------------------------------ */

  var barIO = null;

  function bar() {
    var el = document.querySelector('[data-ab-bar]');
    var real = document.querySelector('[data-ab-checkout]');
    if (!el || !real || typeof IntersectionObserver !== 'function') return;

    // The checkout button lives inside the ticket, which is now replaced
    // on every cart change - so the old observer would be watching a
    // node that is no longer in the document.
    if (barIO) barIO.disconnect();

    el.hidden = false;
    barIO = new IntersectionObserver(
      function (en) {
        // Up only while the real button is off screen. Two checkout
        // buttons at once is a choice nobody wants to make.
        el.classList.toggle('is-up', !en[0].isIntersecting);
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    barIO.observe(real);
  }

  /* ------------------------------------------------------------------ *
   * 4. The ticket printing, and reprinting
   * ------------------------------------------------------------------ */

  var printT = 0;

  function ticket() {
    var side = document.querySelector('[data-ab-side]');
    if (!side || side.dataset.abReady === '1') return;
    side.dataset.abReady = '1';

    if (REDUCE || typeof IntersectionObserver !== 'function') {
      side.classList.add('is-in', 'is-stamped');
      return;
    }

    var io = new IntersectionObserver(
      function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        side.classList.add('is-in');
        // The stamp lands once the receipt has finished printing.
        setTimeout(function () {
          side.classList.add('is-stamped');
        }, 1250);
      },
      { rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(side);
  }

  function reprint() {
    var side = document.querySelector('[data-ab-side]');
    if (!side || !side.classList.contains('is-in') || REDUCE) return;
    side.classList.add('is-printing');
    clearTimeout(printT);
    printT = setTimeout(function () {
      side.classList.remove('is-printing');
    }, 650);
  }

  /* ------------------------------------------------------------------ *
   * 5. Design images that do not load
   *
   * These are served by the personalisation app, not Shopify, so they can
   * 404 long after the order was placed. Falling back to the product
   * photo is better than an empty tile.
   * ------------------------------------------------------------------ */

  function images(scope) {
    var imgs = (scope || document).querySelectorAll('img[data-ab-fallback]');
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.dataset.abBound === '1') return;
      img.dataset.abBound = '1';
      img.addEventListener('error', function () {
        var fb = img.getAttribute('data-ab-fallback');
        if (fb && img.src !== fb) img.src = fb;
        else img.remove();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot, and re-run after Dawn re-renders
   * ------------------------------------------------------------------ */

  function boot() {
    if (!page()) return;
    teachCart();
    bar();
    ticket();
    images(document);

    var contents = document.querySelector('#main-cart-items .js-contents');
    if (!contents || contents.dataset.abWatch === '1' || typeof MutationObserver !== 'function') return;
    contents.dataset.abWatch = '1';
    new MutationObserver(function () {
      images(document);
      reprint();
      // The ticket was re-rendered alongside the lines, so the phone
      // bar's target is a fresh element.
      bar();
      bagCount();
    }).observe(contents, { childList: true, subtree: true });
  }

  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  // The theme editor re-renders the section rather than the page.
  document.addEventListener('shopify:section:load', function () {
    window.setTimeout(boot, 0);
  });
})();
