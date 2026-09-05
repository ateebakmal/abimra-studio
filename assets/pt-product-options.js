/*
  pt-product-options.js  —  custom behaviour for the personalised-tee product page.

  WHY A CUSTOM ELEMENT: Dawn re-renders <variant-selects> from the server on every
  option change, so any listener bound directly to a swatch would be thrown away.
  <pt-product-options> is rendered once inside <product-info> (which survives those
  updates), listens via event delegation, and therefore keeps working afterwards.

  It adds three things on top of stock Dawn, each toggleable from the theme editor
  (see the section schema in sections/main-product.liquid):

    1. "Don't preselect a variant" — the page can load with nothing chosen.
    2. Clicking an already-selected option value deselects it.
    3. The gallery is filtered to the media whose alt text matches the chosen colour.

  Nothing here replaces Dawn's variant mechanics. As soon as a *complete* option set
  is chosen we hand control straight back to Dawn, which does its normal section
  re-fetch and updates the hidden `id` input, the URL, price, SKU and availability,
  and publishes PUB_SUB_EVENTS.variantChange. Apps that listen for variant changes
  (e.g. SB Product Designer) keep seeing exactly what they expect.
*/

// Our own class: display:none so Dawn's slider stops measuring the slide.
const PT_HIDDEN_MEDIA_CLASS = 'pt-media-hidden';

// Dawn's own "hide this bit of product info" class, reused so we match setUnavailable().
const PT_DAWN_HIDDEN_CLASS = 'hidden';

// The option groups Dawn itself looks for in VariantSelects.getAllSelectedOptions().
const PT_OPTION_GROUP_SELECTOR = 'fieldset, .product-form__input--dropdown';

// Dawn's scroll-reveal classes, from assets/animations.js.
const PT_SCROLL_TRIGGER_CLASS = 'scroll-trigger';
const PT_SCROLL_OFFSCREEN_CLASS = 'scroll-trigger--offscreen';
const PT_SCROLL_CANCEL_CLASS = 'scroll-trigger--cancel';

if (!customElements.get('pt-product-options')) {
  customElements.define(
    'pt-product-options',
    class PtProductOptions extends HTMLElement {
      connectedCallback() {
        this.productInfo = this.closest('product-info');
        if (!this.productInfo) return;

        this.sectionId = this.dataset.sectionId;
        this.noPreselect = this.dataset.noPreselect === 'true';
        this.filterGallery = this.dataset.filterGallery === 'true';
        this.colorOptionName = (this.dataset.colorOption || 'Color').trim().toLowerCase();
        // e.g. "Select a [option]" -> "Select a color"
        this.selectLabelTemplate = this.dataset.selectLabel || 'Select a [option]';

        // Capture phase: we need to see the click on an already-checked radio
        // *before* the browser decides there is nothing to change.
        this.onClick = this.onClick.bind(this);
        this.productInfo.addEventListener('click', this.onClick, true);

        // Dawn moves/prepends gallery items when a variant is applied, so re-apply
        // our colour filter once its DOM update has landed.
        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
          if (data?.sectionId !== this.sectionId) return;
          // data.variant is set only when a real variant was resolved.
          this.toggleDynamicCheckout(Boolean(data.variant));
          this.snapshot = this.selectionValues();
          this.syncDesigner(data.variant);
          this.syncGallery();
        });

        this.snapshot = this.selectionValues();
        this.syncGallery();
      }

      disconnectedCallback() {
        this.productInfo?.removeEventListener('click', this.onClick, true);
        this.variantChangeUnsubscriber?.();
      }

      /* ------------------------------------------------------------------ *
       * Reading the current state out of the DOM
       * ------------------------------------------------------------------ */

      get variantSelects() {
        return this.productInfo.querySelector('variant-selects');
      }

      get productForm() {
        return this.productInfo.querySelector('product-form');
      }

      get mediaGallery() {
        return this.productInfo.querySelector('media-gallery');
      }

      get optionGroups() {
        return (
          Array.from(this.variantSelects?.querySelectorAll(PT_OPTION_GROUP_SELECTOR) || [])
            // Apps inject their own markup into the picker - Customify adds a Note
            // row - and a stray fieldset here is fatal: it is a group that can never
            // be filled, so the selection never looks complete and every swatch click
            // gets treated as a partial selection and blocked. Count only the groups
            // that actually hold product option values.
            .filter((group) => group.querySelector('[data-option-value-id]'))
        );
      }

      // One entry per product option, in option order; null where nothing is chosen.
      readSelection() {
        return this.optionGroups.map((group) => {
          const radio = group.querySelector('input[type="radio"]:checked');
          if (radio) return { name: radio.dataset.optionName || '', value: radio.value };

          const option = group.querySelector('select')?.selectedOptions?.[0];
          // Our placeholder option carries no option-value id, so it reads as "nothing chosen".
          if (option?.dataset.optionValueId) {
            return { name: option.dataset.optionName || '', value: option.value };
          }

          return null;
        });
      }

      // Option name for a group, taken from the data attribute Dawn already puts on
      // every option value, so it works for swatches, pills and dropdowns alike.
      optionNameAt(index) {
        return this.optionGroups[index]?.querySelector('[data-option-name]')?.dataset.optionName || '';
      }

      // Just the chosen values, positionally - what we diff a click against.
      selectionValues() {
        return this.readSelection().map((item) => (item ? item.value : null));
      }

      isComplete(selection) {
        return selection.length > 0 && selection.every(Boolean);
      }

      selectedColor(selection) {
        const entry = selection.find((item) => item && item.name.trim().toLowerCase() === this.colorOptionName);
        return entry ? entry.value : null;
      }

      /* ------------------------------------------------------------------ *
       * Hook called by product-info.js before Dawn's section re-fetch.
       * Returns true when we have handled the change ourselves.
       * ------------------------------------------------------------------ */

      interceptOptionValueChange() {
        // A product with no option groups (single default variant) has nothing to
        // wait for, so never claim the change.
        if (!this.productInfo) return false;

        const selection = this.readSelection();
        if (!selection.length) return false;

        this.snapshot = selection.map((item) => (item ? item.value : null));

        // Colour filtering is independent of the preselect behaviour, so do it either way.
        this.syncGallery(selection);

        if (!this.noPreselect || this.isComplete(selection)) return false;

        // Only some options are chosen, so there is no variant to render: skip the
        // round-trip and paint the "nothing selected" state locally instead.
        //
        // Dawn has already dispatched Shopify's ProductSelectEvent with a promise
        // that the theme is expected to settle. Because we are about to skip the
        // code that normally settles it, resolve it here with variant: null - the
        // same thing Dawn reports when no variant matches. Without this, any app
        // awaiting that promise (SB Product Designer included, if it uses the
        // StandardEvents API) would hang on every partial selection.
        this.variantSelects?.resolvePendingSelectPromise?.(null);

        this.applyIncompleteState(selection);
        return true;
      }

      /* ------------------------------------------------------------------ *
       * The "no variant selected" state
       * ------------------------------------------------------------------ */

      applyIncompleteState(selection = this.readSelection()) {
        this.clearVariantInputs();
        this.productForm?.handleErrorMessage();
        this.productForm?.toggleSubmitButton(true, this.promptLabel(selection));
        this.showPriceRange();
        this.toggleVariantDetails(false);
        this.toggleDynamicCheckout(false);
        this.clearVariantParam();
      }

      // Empty + disabled means the form posts no variant at all, which is exactly
      // what Dawn's Liquid renders when a product has no selected variant.
      clearVariantInputs() {
        this.productInfo
          .querySelectorAll(
            `#product-form-${this.sectionId} input[name="id"], #product-form-installment-${this.sectionId} input[name="id"]`
          )
          .forEach((input) => {
            input.value = '';
            input.setAttribute('disabled', 'disabled');
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
      }

      // "Select a color" while no colour is chosen, then "Select a size", etc.
      promptLabel(selection) {
        let missingIndex = selection.findIndex(
          (item, index) => !item && this.optionNameAt(index).trim().toLowerCase() === this.colorOptionName
        );
        if (missingIndex === -1) missingIndex = selection.findIndex((item) => !item);

        const name = missingIndex === -1 ? '' : this.optionNameAt(missingIndex);
        return this.selectLabelTemplate.replace('[option]', name.toLowerCase());
      }

      // Swap the variant price back to the product's price range. main-product.liquid
      // renders that markup once into a <template>, so no extra request is needed.
      showPriceRange() {
        const template = document.getElementById(`PtPriceRange-${this.sectionId}`);
        const target = this.productInfo.querySelector(`#price-${this.sectionId}`);
        if (!template || !target) return;
        target.innerHTML = template.innerHTML;
        target.classList.remove(PT_DAWN_HIDDEN_CLASS);
      }

      // Same set of ids Dawn hides in its own setUnavailable().
      toggleVariantDetails(show) {
        ['Sku', 'Inventory', 'Price-Per-Item', 'Volume', 'Volume-Note', 'Quantity-Rules'].forEach((id) => {
          this.productInfo.querySelector(`#${id}-${this.sectionId}`)?.classList.toggle(PT_DAWN_HIDDEN_CLASS, !show);
        });
      }

      // "Buy it now" posts the same form as Add to cart, so it must follow the
      // same gate. Dawn never re-renders the buy-buttons block, so JS owns this.
      toggleDynamicCheckout(show) {
        this.productInfo
          .querySelector('.pt-dynamic-checkout')
          ?.classList.toggle('pt-awaiting-variant', !show);
      }

      clearVariantParam() {
        const url = new URL(window.location.href);
        url.searchParams.delete('variant');

        this.productInfo.querySelector('share-button')?.updateUrl(url.toString());
        if (this.productInfo.dataset.updateUrl === 'false') return;
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      }

      /* ------------------------------------------------------------------ *
       * Deselecting an already-chosen option value
       * ------------------------------------------------------------------ */

      onClick(event) {
        if (!this.noPreselect) return;

        const input = event.target.closest?.('input[type="radio"]');
        if (!input || !this.variantSelects?.contains(input)) return;

        // IMPORTANT: the browser runs a radio's "pre-click activation steps" before
        // dispatching this event, so input.checked is already true even on a brand
        // new selection. Reading it here would make every first click look like a
        // deselect. Compare against the snapshot taken before this click instead.
        const index = this.optionGroups.indexOf(input.closest(PT_OPTION_GROUP_SELECTOR));
        if (index === -1 || this.snapshot?.[index] !== input.value) return;

        // Same value clicked twice: deselect. A checked radio cannot be unchecked by
        // the browser and fires no `change`, which is why this is a click handler.
        event.preventDefault();
        input.checked = false;

        // Dawn mirrors the chosen value into the swatch legend; clear that too.
        const label = input.closest('.product-form__input')?.querySelector('[data-selected-value]');
        if (label) label.innerHTML = '';

        const selection = this.readSelection();
        this.snapshot = selection.map((item) => (item ? item.value : null));
        this.applyIncompleteState(selection);
        this.syncGallery(selection);
      }

      /* ------------------------------------------------------------------ *
       * Product designer bridge (Customify)
       * ------------------------------------------------------------------ */

      // Customify only re-draws its canvas when it sees a change on
      // `.single-option-selector` or `#productSelect` - class names from the old
      // Shopify themes it was written against. Dawn 16 has neither, so clicking a
      // swatch never reaches the app and the mockup keeps showing the old colour;
      // it only ever looked right because a fresh page load carried ?variant= .
      //
      // Rather than fake a .single-option-selector (its handler reads
      // select[name=id], which Dawn does not render, and would wrongly flip the
      // button to SOLD OUT), drive the switcher the app ships for itself: the
      // .swapProduct thumbnails inside the designer. Clicking one is the app's own
      // supported path - it sets the variant, updates the URL and redraws, with no
      // page reload. This is exactly what the app's internal fallback does.
      //
      // No-op when the designer is not on the page.
      syncDesigner(variant) {
        if (!variant?.title) return;

        const swaps = Array.from(document.querySelectorAll('.swapProduct'));
        if (!swaps.length) return;

        const wanted = String(variant.title).trim();
        const match = swaps.find((el) => (el.dataset.title || '').trim() === wanted);
        if (!match || match.classList.contains('active')) return;

        match.click();
      }

      /* ------------------------------------------------------------------ *
       * Gallery filtering by media alt text
       * ------------------------------------------------------------------ */

      syncGallery(selection = this.readSelection()) {
        if (!this.filterGallery) return;

        const gallery = this.mediaGallery;
        if (!gallery) return;

        // data-pt-alt is added by snippets/product-media-gallery.liquid to both the
        // main slides and the thumbnails, so no extra API call is needed here.
        const slides = Array.from(gallery.querySelectorAll('[data-pt-alt]'));
        if (!slides.length) return;

        const color = this.selectedColor(selection);
        const wanted = color ? color.trim().toLowerCase() : null;

        // Fall back to the full gallery when this colour has no images of its own,
        // so a product with only generic photos still shows them.
        const hasColorMedia = wanted !== null && slides.some((slide) => slide.dataset.ptAlt === wanted);

        slides.forEach((slide) => {
          const hide = hasColorMedia && slide.dataset.ptAlt !== wanted;
          slide.classList.toggle(PT_HIDDEN_MEDIA_CLASS, hide);
          if (!hide) this.cancelRevealAnimation(slide);
        });

        this.resetSliders(gallery);
        this.activateFirstVisible(gallery);

        // Tell the carousel dots to rebuild for whatever is still visible.
        gallery.dispatchEvent(new CustomEvent('pt:gallery-filtered', { bubbles: true }));
      }

      // Stop Dawn's scroll-reveal animation replaying on a slide we just un-hid.
      //
      // A display:none slide reads as "off screen" to Dawn's IntersectionObserver, so
      // animations.js adds scroll-trigger--offscreen (opacity 0) AND strips
      // scroll-trigger--cancel. Showing the slide again therefore replays
      // animate--fade-in, which is the pale flash before the new colour appears.
      // product-info.js does exactly this when it swaps in fetched variant HTML; our
      // filter reveals slides by a different route, so it has to do it too.
      cancelRevealAnimation(slide) {
        if (!slide.classList.contains(PT_SCROLL_TRIGGER_CLASS)) return;
        slide.classList.remove(PT_SCROLL_OFFSCREEN_CLASS);
        slide.classList.add(PT_SCROLL_CANCEL_CLASS);
      }

      // Dawn's slider measures its slides, so it must re-measure after we hide some.
      resetSliders(gallery) {
        gallery.querySelectorAll('slider-component').forEach((slider) => {
          if (typeof slider.resetPages !== 'function') return;

          slider.slider?.scrollTo({ left: 0 });
          slider.resetPages();

          // initPages() bails out below two visible slides, leaving a stale counter.
          const visible = Array.from(slider.querySelectorAll('[id^="Slide-"]')).filter(
            (slide) => !slide.classList.contains(PT_HIDDEN_MEDIA_CLASS)
          );
          if (visible.length >= 2 || !slider.pageTotalElement) return;
          slider.pageTotalElement.textContent = visible.length || 1;
          if (slider.currentPageElement) slider.currentPageElement.textContent = 1;
        });
      }

      activateFirstVisible(gallery) {
        const first = gallery.querySelector(
          `[id^="Slider-Gallery"] > li[data-media-id]:not(.${PT_HIDDEN_MEDIA_CLASS})`
        );
        if (!first) return;
        // Reuse Dawn's own method so thumbnail aria-current and the live region stay correct.
        gallery.setActiveMedia?.(first.dataset.mediaId, false);
      }
    }
  );
}
