/*
  Two patches to Dawn's <cart-notification>, both small.

  1. It rebuilds three regions after an add and, like cart.js, calls
     document.getElementById(id).innerHTML with no null check. One of
     them is #cart-icon-bubble - Dawn's own header counter, which this
     theme does not render - so renderContents() threw before it ever
     reached open(), and the receipt never appeared. Missing regions are
     filtered out, and the header bag is updated from the cart instead.

  2. The receipt is torn off when it closes. Dawn only removes .active,
     which snaps it away; the printing animation deserves an exit, and
     the class is removed after it has played.

  Reached through the custom element registry because cart-notification.js
  is a classic script, so the class is not on window.
*/

(function () {
  'use strict';

  function patch() {
    var El = window.customElements && customElements.get('cart-notification');
    if (!El || El.prototype.__abPatched) return true;
    El.prototype.__abPatched = true;

    /* ---- 1. survive the regions this theme does not render ---- */
    var render = El.prototype.renderContents;
    El.prototype.renderContents = function (parsedState) {
      var original = this.getSectionsToRender;
      var self = this;

      this.getSectionsToRender = function () {
        return original.call(self).filter(function (section) {
          return document.getElementById(section.id);
        });
      };

      try {
        render.call(this, parsedState);
      } finally {
        this.getSectionsToRender = original;
      }

      bagCount();
    };

    /* ---- 2. tear off on the way out ---- */
    var close = El.prototype.close;
    El.prototype.close = function () {
      var el = this.notification;
      close.call(this);
      if (!el || !el.classList.contains('animate')) return;

      el.classList.add('ab-tear');
      window.setTimeout(function () {
        el.classList.remove('ab-tear', 'animate');
      }, 320);
    };

    return true;
  }

  /* Dawn keeps its own counter fresh through #cart-icon-bubble, which
     this theme does not render and which is filtered out above. The add
     response is the LINE ITEM, not the cart, so it carries no
     item_count - the cart has to be asked. One small request, only on
     an add. */
  function bagCount() {
    if (!window.fetch) return;

    fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart.js' : '/cart.js', {
      headers: { Accept: 'application/json' },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (cart) {
        paint(cart.item_count);
      })
      .catch(function () {});
  }

  function paint(n) {
    if (typeof n !== 'number') return;

    var bags = document.querySelectorAll('.ab-bag b, [data-am-count]');
    Array.prototype.forEach.call(bags, function (b) {
      b.textContent = n;
      var link = b.closest('[aria-label]');
      if (link) link.setAttribute('aria-label', link.getAttribute('aria-label').replace(/\d+/, n));
    });
  }

  // cart-notification.js is deferred and defines the element on parse,
  // so it is normally ready by DOMContentLoaded. The retry covers the
  // case where it is not, rather than silently doing nothing.
  function boot() {
    if (patch()) return;
    var tries = 20;
    var t = window.setInterval(function () {
      if (patch() || --tries <= 0) window.clearInterval(t);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
