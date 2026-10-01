/*
  One patch to Dawn's <cart-notification>, and one addition.

  Dawn rebuilds three regions after an add and, like cart.js, calls
  document.getElementById(id).innerHTML with no null check. One of them
  is #cart-icon-bubble - its own header counter, which this theme does
  not render - so renderContents() threw before it ever reached open(),
  and nothing appeared at all. Missing regions are filtered out.

  The header bag counter is then ours to update, since the region that
  used to do it is the one being filtered.

  The appearing and disappearing is CSS. An earlier version added and
  removed classes here to drive a printer-head animation; it is gone,
  along with the timers that sequenced it. Dawn's own .active class and
  a transition do the whole job.

  Reached through the custom element registry because cart-notification.js
  is a classic script, so the class is not on window.
*/

(function () {
  'use strict';

  function patch() {
    var El = window.customElements && customElements.get('cart-notification');
    if (!El || El.prototype.__abPatched) return true;
    El.prototype.__abPatched = true;

    /* Survive the regions this theme does not render. */
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
