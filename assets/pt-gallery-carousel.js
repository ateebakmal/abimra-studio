/*
  pt-gallery-carousel.js  —  dot indicators for the product gallery carousel.

  Dawn's SliderComponent already gives us the scroll-snap track, the prev/next
  arrows and a `slideChanged` event, so this only adds the one piece it has no
  concept of: a dot per slide.

  The dots are built from the slides that are actually *visible*, which matters
  because pt-product-options.js hides media that doesn't belong to the selected
  colour. It re-announces that with a `pt:gallery-filtered` event, and we rebuild.
*/

// Kept in sync with pt-product-options.js and pt-gallery-carousel.css.
const PT_CAROUSEL_HIDDEN_MEDIA_CLASS = 'pt-media-hidden';

if (!customElements.get('pt-gallery-dots')) {
  customElements.define(
    'pt-gallery-dots',
    class PtGalleryDots extends HTMLElement {
      connectedCallback() {
        this.gallery = this.closest('media-gallery');
        this.sliderComponent = this.closest('slider-component');
        if (!this.sliderComponent) return;

        this.dotLabel = this.dataset.dotLabel || 'Go to image [index]';

        this.onSlideChanged = this.onSlideChanged.bind(this);
        this.onFiltered = this.onFiltered.bind(this);
        this.onDotClick = this.onDotClick.bind(this);

        this.sliderComponent.addEventListener('slideChanged', this.onSlideChanged);
        this.gallery?.addEventListener('pt:gallery-filtered', this.onFiltered);
        this.addEventListener('click', this.onDotClick);

        this.build();
      }

      disconnectedCallback() {
        this.sliderComponent?.removeEventListener('slideChanged', this.onSlideChanged);
        this.gallery?.removeEventListener('pt:gallery-filtered', this.onFiltered);
      }

      // Slides in track order, minus anything the colour filter has hidden.
      get visibleSlides() {
        return Array.from(this.sliderComponent.querySelectorAll('[id^="Slide-"]')).filter(
          (slide) => !slide.classList.contains(PT_CAROUSEL_HIDDEN_MEDIA_CLASS)
        );
      }

      build() {
        const slides = this.visibleSlides;

        // One image needs no controls; the CSS hides the arrows too.
        this.gallery?.classList.toggle('pt-carousel--single', slides.length < 2);

        this.innerHTML = slides
          .map(
            (slide, index) =>
              `<button type="button" class="slider-counter__link slider-counter__link--dots${
                index === 0 ? ' slider-counter__link--active' : ''
              }" aria-label="${this.dotLabel.replace('[index]', index + 1)}" aria-current="${
                index === 0
              }" data-pt-dot="${index}"><span class="dot"></span></button>`
          )
          .join('');
      }

      onFiltered() {
        this.build();
      }

      // SliderComponent counts pages over the slides it can see, so its
      // currentPage lines up with our dot indexes.
      onSlideChanged(event) {
        this.setActive(event.detail.currentPage - 1);
      }

      setActive(index) {
        Array.from(this.children).forEach((dot, dotIndex) => {
          const active = dotIndex === index;
          dot.classList.toggle('slider-counter__link--active', active);
          dot.setAttribute('aria-current', active);
        });
      }

      onDotClick(event) {
        const dot = event.target.closest('[data-pt-dot]');
        if (!dot) return;

        const slide = this.visibleSlides[Number(dot.dataset.ptDot)];
        if (!slide) return;

        this.sliderComponent.slider?.scrollTo({ left: slide.offsetLeft });
        this.setActive(Number(dot.dataset.ptDot));
      }
    }
  );
}
