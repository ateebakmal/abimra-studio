/*
  Abimra cart behaviour.

  WHAT CHANGED, AND WHY

  This used to lean on Dawn's <cart-items>, which answers every quantity
  change and removal by re-rendering regions of the page: it fetches the
  section and swaps the innerHTML of .js-contents, and a patch here added
  the ticket to that list so its totals would keep up.

  That is what made the printer replay. Replacing the summary's HTML
  destroys the element the IntersectionObserver fired on and builds a
  fresh ticket with no .is-in on it, so the paper fed out of the printer
  again on every change.

  So the summary is never replaced now. aside.ab-cart-side and everything
  inside it is built once by Liquid and patched from then on - numbers
  tweened, rows collapsed or inserted, text rewritten. Dawn's cart-items
  is taken out of the loop for removal and quantity, both of which are
  handled here against cart/change.js directly.

  The one exception is Undo, which needs the markup of a line that no
  longer exists. It asks the Section Rendering API for the section and
  takes the single matching <li> out of it. Nothing else is used.

  No libraries. Web Animations API and CSS transitions.
*/

(function () {
  'use strict';

  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  var printed = false;
  var ledTimer = 0;

  function page() {
    return document.querySelector('.ab-cart-page');
  }
  function side() {
    return document.querySelector('[data-ab-side]');
  }
  function money(cents) {
    var cur = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'GBP';
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en-GB', {
        style: 'currency',
        currency: cur,
      }).format(cents / 100);
    } catch (e) {
      return (cents / 100).toFixed(2);
    }
  }

  /* ------------------------------------------------------------------ *
   * The print, once per page load
   * ------------------------------------------------------------------ */

  function settle(el) {
    // Re-assert the finished state with transitions off, for the case
    // where something does replace part of the summary. The paper must
    // never feed out a second time.
    el.classList.add('is-settled', 'is-in', 'is-stamped');
    el.classList.remove('is-printing');
  }

  function printOnce() {
    var el = side();
    // The aside renders even when the bag is empty - only its contents
    // are conditional - so the ticket, not the aside, is the test.
    if (!el || !el.querySelector('.ab-cart-ticket')) return;
    if (el.dataset.abPrint === '1') return;
    el.dataset.abPrint = '1';

    if (printed) {
      settle(el);
      return;
    }

    if (REDUCE || typeof IntersectionObserver !== 'function') {
      printed = true;
      settle(el);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        printed = true;

        el.classList.add('is-in', 'is-printing');
        window.setTimeout(function () {
          el.classList.remove('is-printing');
          el.classList.add('is-stamped');
        }, 1350);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
  }

  /* A short red blink, as if the ticket is reprinting. Deliberately NOT
     .is-printing - that class feeds the paper out of the slot, and the
     paper must only move once per page load. This one drives the LED
     and nothing else. */
  function blink() {
    var el = side();
    if (!el || REDUCE) return;
    el.classList.add('is-blink');
    window.clearTimeout(ledTimer);
    ledTimer = window.setTimeout(function () {
      el.classList.remove('is-blink');
    }, 650);
  }

  /* ------------------------------------------------------------------ *
   * Numbers that count
   * ------------------------------------------------------------------ */

  function tween(el, to) {
    if (!el) return;
    var from = parseInt(el.dataset.cents, 10);
    if (isNaN(from)) from = to;
    el.dataset.cents = to;

    if (REDUCE || from === to) {
      el.textContent = money(to);
      return;
    }

    var start = 0;
    var span = to - from;

    function step(now) {
      if (!start) start = now;
      var t = Math.min(1, (now - start) / 420);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = money(Math.round(from + span * eased));
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function collapse(el, done) {
    if (REDUCE || typeof el.animate !== 'function') {
      el.remove();
      if (done) done();
      return;
    }
    var h = el.getBoundingClientRect().height;
    var cs = window.getComputedStyle(el);
    var anim = el.animate(
      [
        { height: h + 'px', opacity: 1, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginBottom: cs.marginBottom },
        { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px', marginBottom: '0px' },
      ],
      { duration: 250, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
    );
    anim.onfinish = function () {
      el.remove();
      if (done) done();
    };
  }

  /* ------------------------------------------------------------------ *
   * Patch the summary from a cart object. Never replace it.
   * ------------------------------------------------------------------ */

  function patch(cart) {
    if (!cart) return;
    blink();

    var list = document.querySelector('.ab-cart-tk-lines');
    if (list) {
      var seen = {};

      cart.items.forEach(function (item, i) {
        seen[item.key] = true;
        var row = list.querySelector('[data-key="' + CSS.escape(item.key) + '"]');

        if (!row) {
          row = document.createElement('li');
          row.dataset.key = item.key;
          row.innerHTML =
            '<span><span class="ab-cart-q"></span></span><span data-cents="' + item.original_line_price + '"></span>';
          list.appendChild(row);
          row.querySelector('.ab-cart-q').textContent = item.quantity + '×';
          row.lastElementChild.textContent = money(item.original_line_price);
          row.firstElementChild.append(item.product_title);
          grow(row);
        } else {
          var q = row.querySelector('.ab-cart-q');
          if (q) q.textContent = item.quantity + '×';
          tween(row.lastElementChild, item.original_line_price);
          flash(row);
        }
      });

      Array.prototype.forEach.call(list.children, function (row) {
        if (row.dataset.key && !seen[row.dataset.key]) collapse(row);
      });
    }

    tween(document.querySelector('[data-ab-subtotal]'), cart.items_subtotal_price);
    tween(document.querySelector('[data-ab-total]'), cart.total_price);
    tween(document.querySelector('[data-ab-bar-total]'), cart.total_price);

    var n = cart.item_count;
    var count = document.querySelector('[data-ab-count]');
    if (count) count.textContent = n + ' ' + (n === 1 ? 'item' : 'items');

    var sup = document.querySelector('.ab-cart-head sup, .ab-cart-page .ab-d1 sup');
    if (sup) sup.textContent = n;

    bag(n);
  }

  function flash(row) {
    if (REDUCE || typeof row.animate !== 'function') return;
    row.animate([{ background: 'rgba(212,46,18,.08)' }, { background: 'transparent' }], {
      duration: 600,
      easing: 'ease-out',
    });
  }

  function grow(row) {
    if (REDUCE || typeof row.animate !== 'function') return;
    var h = row.getBoundingClientRect().height;
    row.animate(
      [
        { height: '0px', opacity: 0, transform: 'translateY(-6px)' },
        { height: h + 'px', opacity: 1, transform: 'none' },
      ],
      { duration: 250, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  }

  /* The header counter. Dawn keeps its own fresh through
     #cart-icon-bubble, which this theme does not render. */
  function bag(n) {
    if (typeof n !== 'number') return;
    Array.prototype.forEach.call(document.querySelectorAll('.ab-bag b, [data-am-count]'), function (b) {
      b.textContent = n;
      var link = b.closest('[aria-label]');
      if (link) link.setAttribute('aria-label', link.getAttribute('aria-label').replace(/\d+/, n));
    });
  }

  /* ------------------------------------------------------------------ *
   * One request at a time
   *
   * A fast double tap on + would otherwise race, and the cart would
   * settle on whichever response came back last rather than the last
   * quantity asked for.
   * ------------------------------------------------------------------ */

  var chain = Promise.resolve();

  function change(key, quantity) {
    var run = function () {
      return fetch(ROOT + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity }),
      }).then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) throw body;
          return body;
        });
      });
    };
    var next = chain.then(run, run);
    chain = next.catch(function () {});
    return next;
  }

  /* ------------------------------------------------------------------ *
   * Remove
   * ------------------------------------------------------------------ */

  function wipe(card) {
    if (REDUCE) return Promise.resolve();
    card.style.setProperty('--w', card.getBoundingClientRect().width + 'px');
    card.classList.add('is-wiping');
    return new Promise(function (res) {
      window.setTimeout(res, 480);
    });
  }

  function remove(card) {
    if (card.classList.contains('is-busy')) return;
    card.classList.add('is-busy');

    var key = card.dataset.key;
    var req = change(key, 0);
    var anim = wipe(card).then(function () {
      return new Promise(function (res) {
        collapse(card, res);
      });
    });

    Promise.all([req, anim])
      .then(function (out) {
        if (out[0].item_count === 0) {
          // The page is about to reload into the empty layout, so the
          // toast cannot simply be shown - hand it across the reload.
          stash(card);
          empty();
          return;
        }
        patch(out[0]);
        toast(card.dataset.title || 'item', card);
      })
      .catch(function (err) {
        // Put it back: the line is still in the cart, so the page must
        // agree with the cart rather than with the animation.
        card.classList.remove('is-wiping', 'is-busy');
        card.style.removeProperty('--w');
        if (!card.isConnected) {
          var list = document.querySelector('.ab-cart-list');
          if (list) list.appendChild(card);
        }
        card.style.height = '';
        card.style.opacity = '';
        say((err && err.description) || "Couldn't remove that. Try again.");
      });
  }

  /* The last line is the one case that reloads.
     The empty bag is a different layout - its own artwork, headings and
     two buttons, all from section settings - and it is not in the page
     when the cart was rendered with items in it. Faking it in JS would
     mean duplicating that markup here, where the merchant's settings
     cannot reach it. A fade and a reload gives the real thing. */
  function empty() {
    var grid = document.querySelector('.ab-cart-grid');
    var bar = document.querySelector('[data-ab-bar]');
    if (bar) bar.classList.remove('is-up');

    var go = function () {
      window.location.reload();
    };
    if (grid && !REDUCE && typeof grid.animate === 'function') {
      grid.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = go;
    } else {
      go();
    }
  }

  /* ------------------------------------------------------------------ *
   * Quantity
   * ------------------------------------------------------------------ */

  var timers = {};

  function qty(card, next) {
    var key = card.dataset.key;
    var input = card.querySelector('.quantity__input');
    var unit = parseInt(card.dataset.unit, 10) || 0;

    next = Math.max(1, next);
    if (input) input.value = next;
    card.dataset.qty = next;

    // Optimistic: the line total follows the tap, not the network.
    tween(card.querySelector('[data-ab-line]'), unit * next);
    var each = card.querySelector('[data-ab-each]');
    if (each) each.textContent = next > 1 ? money(unit) + ' each' : '';

    var minus = card.querySelector('[name="minus"]');
    if (minus) minus.disabled = next <= 1;

    window.clearTimeout(timers[key]);
    timers[key] = window.setTimeout(function () {
      card.classList.add('is-busy');
      change(key, next)
        .then(function (cart) {
          card.classList.remove('is-busy');
          var line = null;
          cart.items.forEach(function (i) {
            if (i.key === key) line = i;
          });
          if (line) tween(card.querySelector('[data-ab-line]'), line.original_line_price);
          patch(cart);
        })
        .catch(function (err) {
          card.classList.remove('is-busy');
          // The server is the truth; put the page back to what it says.
          fetch(ROOT + 'cart.js', { headers: { Accept: 'application/json' } })
            .then(function (r) {
              return r.json();
            })
            .then(function (cart) {
              var line = null;
              cart.items.forEach(function (i) {
                if (i.key === key) line = i;
              });
              if (line) {
                if (input) input.value = line.quantity;
                card.dataset.qty = line.quantity;
                tween(card.querySelector('[data-ab-line]'), line.original_line_price);
              }
              patch(cart);
            })
            .catch(function () {});
          say((err && err.description) || 'That quantity is not available.');
        });
    }, 300);
  }

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */

  var toastTimer = 0;

  function say(text, undo) {
    var el = document.querySelector('[data-ab-toast]');
    if (!el) return;

    el.innerHTML = '';
    el.hidden = false;
    el.appendChild(document.createTextNode(text));

    if (undo) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Undo';
      b.addEventListener('click', function () {
        b.disabled = true;
        undo();
      });
      el.appendChild(b);
    }

    window.requestAnimationFrame(function () {
      el.classList.add('is-up');
    });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove('is-up');
      window.setTimeout(function () {
        el.hidden = true;
      }, 420);
    }, 5000);
  }

  /* Carried across the reload that the last removal causes, so Undo
     survives it. sessionStorage, not local: it belongs to this tab and
     this visit, and it is read exactly once. */
  var STASH = 'ab-cart-undo';

  function stash(card) {
    try {
      window.sessionStorage.setItem(
        STASH,
        JSON.stringify({
          title: card.dataset.title || 'item',
          variant: card.dataset.variant || '',
          qty: parseInt(card.dataset.qty, 10) || 1,
          props: card.dataset.props || '',
        })
      );
    } catch (e) {
      /* private mode, or the quota is full. The removal still worked;
         only Undo is lost. */
    }
  }

  function unstash() {
    var raw;
    try {
      raw = window.sessionStorage.getItem(STASH);
      window.sessionStorage.removeItem(STASH);
    } catch (e) {
      return;
    }
    if (!raw) return;

    var d;
    try {
      d = JSON.parse(raw);
    } catch (e) {
      return;
    }

    var props = null;
    try {
      props = d.props ? JSON.parse(d.props) : null;
    } catch (e) {
      props = null;
    }
    if (!d.variant || personalised(props)) {
      say('Removed ' + d.title + '.');
      return;
    }
    say('Removed ' + d.title + '.', function () {
      undo(d.variant, d.qty, props, true);
    });
  }

  /* Personalised lines are not offered an Undo.
     The designer app stores the artwork against its own record and keys
     it by the line's properties; re-adding with the same properties is
     not guaranteed to resolve to the same design, and silently
     restoring the wrong artwork is worse than making someone design it
     again. */
  function personalised(props) {
    return !!(props && (props.pd_personalization_id || props._personalization_id));
  }

  function toast(title, card) {
    var variant = card.dataset.variant;
    var quantity = parseInt(card.dataset.qty, 10) || 1;
    var props = null;
    try {
      props = card.dataset.props ? JSON.parse(card.dataset.props) : null;
    } catch (e) {
      props = null;
    }

    if (!variant || personalised(props)) {
      say('Removed ' + title + '.');
      return;
    }

    say('Removed ' + title + '.', function () {
      undo(variant, quantity, props, false);
    });
  }

  /* The only place line HTML is fetched, and only one <li> is taken.
     `reload` is the case where the bag went empty: the page is now the
     empty layout, with no list to put the card into. */
  function undo(variant, quantity, props, reload) {
    var item = { id: Number(variant), quantity: quantity };
    if (props) item.properties = props;

    fetch(ROOT + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [item] }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('add failed');
        return r.json();
      })
      .then(function (added) {
        if (reload) {
          window.location.reload();
          return;
        }
        var key = added.items ? added.items[0].key : added.key;
        var host = document.getElementById('main-cart-items');
        var id = host && host.dataset.id;
        return fetch(window.location.pathname + '?sections=' + encodeURIComponent(id))
          .then(function (r) {
            return r.json();
          })
          .then(function (sections) {
            var doc = new DOMParser().parseFromString(sections[id], 'text/html');
            var fresh = doc.querySelector('[data-key="' + CSS.escape(key) + '"].ab-cart-item');
            var list = document.querySelector('.ab-cart-list');
            if (!fresh || !list) {
              window.location.reload();
              return;
            }
            list.appendChild(fresh);
            if (!REDUCE && typeof fresh.animate === 'function') {
              fresh.animate(
                [
                  { opacity: 0, transform: 'translateY(12px)' },
                  { opacity: 1, transform: 'none' },
                ],
                { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }
              );
            }
            return fetch(ROOT + 'cart.js', { headers: { Accept: 'application/json' } })
              .then(function (r) {
                return r.json();
              })
              .then(patch);
          });
      })
      .catch(function () {
        say("Couldn't put that back. Try adding it again.");
      });
  }

  /* ------------------------------------------------------------------ *
   * Design preview
   * ------------------------------------------------------------------ */

  var dlg = null;

  function preview(url, caption) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'ab-cart-modal';
      dlg.innerHTML =
        '<div class="ab-cart-modal-in"><div class="ab-cart-modal-top"><h2>Your design</h2>' +
        '<button type="button" class="ab-cart-modal-x" data-x aria-label="Close">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button></div><div class="ab-cart-stage" data-stage></div><p class="ab-cart-cap" data-cap></p>' +
        '<div class="ab-cart-modal-acts"><a class="ab-btn ab-btn-s" data-full target="_blank" rel="noopener">Open full size</a>' +
        '<button type="button" class="ab-btn ab-btn-p" data-x>Looks right</button></div></div>';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) {
        if (e.target.closest('[data-x]') || e.target === dlg) dlg.close();
      });
    }

    var stage = dlg.querySelector('[data-stage]');
    dlg.querySelector('[data-cap]').textContent = caption || '';
    dlg.querySelector('[data-full]').href = url;
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

    if (typeof dlg.showModal === 'function') dlg.showModal();
    else window.open(url, '_blank');
  }

  /* ------------------------------------------------------------------ *
   * Phone checkout bar
   * ------------------------------------------------------------------ */

  var barIO = null;

  function bar() {
    var el = document.querySelector('[data-ab-bar]');
    var real = document.querySelector('[data-ab-checkout]');
    if (!el || !real || typeof IntersectionObserver !== 'function') return;
    if (barIO) barIO.disconnect();

    el.hidden = false;
    barIO = new IntersectionObserver(
      function (en) {
        el.classList.toggle('is-up', !en[0].isIntersecting);
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    barIO.observe(real);
  }

  /* Design images are served by the app, not Shopify, so they can 404
     long after the order was placed. */
  function images() {
    Array.prototype.forEach.call(document.querySelectorAll('img[data-ab-fallback]'), function (img) {
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
   * Events
   *
   * Delegated from document, and the quantity and remove handlers run
   * in the capture phase so they take the event before Dawn's
   * <cart-items> does. Dawn would answer by re-rendering, which is the
   * thing being avoided.
   * ------------------------------------------------------------------ */

  document.addEventListener(
    'click',
    function (e) {
      if (!page()) return;

      var rm = e.target.closest && e.target.closest('cart-remove-button, .ab-cart-remove');
      if (rm) {
        var card = rm.closest('.ab-cart-item');
        if (card && card.dataset.key) {
          e.preventDefault();
          e.stopPropagation();
          remove(card);
          return;
        }
      }

      var step = e.target.closest && e.target.closest('.ab-cart-qty button');
      if (step) {
        var c = step.closest('.ab-cart-item');
        if (c && c.dataset.key) {
          e.preventDefault();
          e.stopPropagation();
          if (c.classList.contains('is-busy')) return;
          var now = parseInt(c.dataset.qty, 10) || 1;
          qty(c, step.name === 'plus' ? now + 1 : now - 1);
        }
      }
    },
    true
  );

  document.addEventListener(
    'change',
    function (e) {
      if (!page()) return;
      var input = e.target.closest && e.target.closest('.ab-cart-qty .quantity__input');
      if (!input) return;
      var c = input.closest('.ab-cart-item');
      if (!c || !c.dataset.key) return;
      e.stopPropagation();
      qty(c, parseInt(input.value, 10) || 1);
    },
    true
  );

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ab-preview]');
    if (!b) return;
    e.preventDefault();
    preview(b.getAttribute('data-ab-preview'), b.getAttribute('data-ab-caption'));
  });

  function boot() {
    if (!page()) return;
    document.documentElement.classList.add('ac-js');
    printOnce();
    bar();
    images();
    unstash();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  document.addEventListener('shopify:section:load', function () {
    window.setTimeout(boot, 0);
  });
})();
