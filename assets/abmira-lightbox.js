/*
  The gallery lightbox: one image at a time, dark scrim, previous and
  next, a counter. Dawn's own "lightbox" shows every image in one
  scrollable modal, which on a phone reads as falling into the picture;
  this is the flip-through viewer that was asked for instead.

  Enabled per template by the "Abimra lightbox" checkbox on the Product
  information section, which lands on the page as
  pt-product-options[data-lightbox="true"]. Image zoom should be "No
  zoom" on the same template, or Dawn's modal answers the same click.

  Built on <dialog>, so Escape, the top layer and focus containment come
  from the platform. Slides hidden by the colour filter
  (.pt-media-hidden) are left out, so the viewer flips through the same
  set the gallery is showing.
*/

(function () {
  'use strict';

  if (window.__abLightbox) return;
  window.__abLightbox = true;

  var dlg = null;
  var img = null;
  var counter = null;
  var prevBtn = null;
  var nextBtn = null;
  var items = [];
  var idx = 0;
  var lastFocus = null;

  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'ab-lb';
    dlg.setAttribute('aria-label', 'Image viewer');
    dlg.innerHTML =
      '<button type="button" class="ab-lb-x" data-lb-close aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<button type="button" class="ab-lb-nav ab-lb-prev" data-lb-prev aria-label="Previous image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
      '<div class="ab-lb-stage"><img alt=""></div>' +
      '<button type="button" class="ab-lb-nav ab-lb-next" data-lb-next aria-label="Next image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' +
      '</button>' +
      '<span class="ab-lb-count" aria-live="polite"></span>';
    document.body.appendChild(dlg);

    img = dlg.querySelector('.ab-lb-stage img');
    counter = dlg.querySelector('.ab-lb-count');
    prevBtn = dlg.querySelector('[data-lb-prev]');
    nextBtn = dlg.querySelector('[data-lb-next]');

    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]')) close();
      else if (e.target.closest('[data-lb-prev]')) show(idx - 1);
      else if (e.target.closest('[data-lb-next]')) show(idx + 1);
      // The stage fills the dialog, so a click landing on the dialog
      // itself is the scrim.
      else if (e.target === dlg) close();
    });

    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });

    // Escape fires 'close' natively; put focus back where it came from.
    dlg.addEventListener('close', function () {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
  }

  function collect(sectionRoot) {
    var nodes = sectionRoot.querySelectorAll(
      '.product__media-item:not(.pt-media-hidden) .product__media img'
    );
    if (!nodes.length) {
      nodes = sectionRoot.querySelectorAll('.product__media-item:not(.pt-media-hidden) img');
    }
    return Array.prototype.map.call(nodes, function (el) {
      return {
        el: el,
        src: el.currentSrc || el.src,
        srcset: el.getAttribute('srcset') || '',
        alt: el.getAttribute('alt') || '',
      };
    });
  }

  function show(i) {
    idx = ((i % items.length) + items.length) % items.length;
    var m = items[idx];
    // srcset first, so clearing never races the new source.
    if (m.srcset) img.setAttribute('srcset', m.srcset);
    else img.removeAttribute('srcset');
    img.sizes = '92vw';
    img.src = m.src;
    img.alt = m.alt;
    counter.textContent = idx + 1 + ' / ' + items.length;

    var one = items.length < 2;
    prevBtn.hidden = one;
    nextBtn.hidden = one;
    counter.hidden = one;
  }

  function open(sectionRoot, startEl) {
    items = collect(sectionRoot);
    if (!items.length) return;

    build();

    var start = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].el === startEl) {
        start = i;
        break;
      }
    }

    lastFocus = document.activeElement;
    show(start);

    if (typeof dlg.showModal === 'function') dlg.showModal();
    else window.open(items[start].src, '_blank');
  }

  function close() {
    if (dlg && dlg.open) dlg.close();
  }

  document.addEventListener('click', function (e) {
    var media = e.target.closest && e.target.closest('.product__media-item');
    if (!media) return;

    var sectionRoot = media.closest('.shopify-section');
    if (!sectionRoot) return;
    if (!sectionRoot.querySelector('pt-product-options[data-lightbox="true"]')) return;

    var imgEl = media.querySelector('img');
    if (!imgEl) return;

    e.preventDefault();
    open(sectionRoot, imgEl);
  });
})();
