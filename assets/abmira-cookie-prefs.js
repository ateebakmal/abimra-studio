/*
  "Cookie preferences" in the footer.

  The banner itself is Shopify's, switched on under Settings > Customer
  privacy. This only reopens it after someone has already answered, which
  the banner gives no way back to on its own.

  The button is rendered hidden and is revealed here, once a consent API
  has actually been found. A store with no banner configured therefore
  shows no control at all, rather than one that looks live and does
  nothing when clicked.

  Two APIs exist and which one is present depends on how the banner was
  enabled, so both are tried:
    window.privacyBanner.showPreferences()          - the current one
    window.Shopify.customerPrivacy.showPreferences() - the older one

  Both arrive asynchronously, after this script has run, so we poll
  briefly rather than checking once and giving up.
*/

(function () {
  'use strict';

  var TRIES = 40; // ~6s at 150ms, then we conclude there is no banner.
  var WAIT = 150;

  function api() {
    var w = window;
    if (w.privacyBanner && typeof w.privacyBanner.showPreferences === 'function') {
      return function () {
        w.privacyBanner.showPreferences();
      };
    }
    var cp = w.Shopify && w.Shopify.customerPrivacy;
    if (cp && typeof cp.showPreferences === 'function') {
      return function () {
        cp.showPreferences();
      };
    }
    return null;
  }

  function wire(buttons, show) {
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.dataset.abBound === '1') continue;
      b.dataset.abBound = '1';
      b.hidden = false;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        show();
      });
    }
  }

  function start() {
    var buttons = document.querySelectorAll('[data-ab-cookie-prefs]');
    if (!buttons.length) return;

    function attempt() {
      var show = api();
      if (!show) return false;
      wire(buttons, show);
      return true;
    }

    // Shopify fires this once someone answers the banner. By then the API
    // is certainly there, so it catches the case where the banner loaded
    // later than the polling window below.
    document.addEventListener('visitorConsentCollected', attempt);

    var left = TRIES;
    (function look() {
      if (attempt()) return;
      if (--left > 0) window.setTimeout(look, WAIT);
      // Otherwise the button stays hidden. That is the correct outcome
      // when no banner is configured, and when the shopper is outside the
      // regions the banner is switched on for.
    })();
  }

  if (document.readyState === 'complete') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
