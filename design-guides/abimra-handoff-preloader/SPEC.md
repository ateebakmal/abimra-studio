# SPEC: "First pull" intro preloader

## What it is
The first time someone opens the store in a visit, a full-screen intro plays while the page loads. A 3D black tee floats on a halftone "press bed" with four registration marks at its corners. A squeegee makes three passes across its chest, printing three layers: a red sunset, a halftone, and "MADE TO BE ADMIRED." The layers start out of line and slide into register as loading completes. A big counter runs 0 to 100% and gets wider as it goes, with the status "Fetching your design", "Printing", "Shipping your order", then "Ready to wear". Then a squeegee blade wipes the intro away from top to bottom, revealing the page.

## Timing
- **Length:** it waits for `window.load` and fonts, but never finishes faster than the "Minimum length" setting (default 2400ms), and never waits longer than 8 seconds. The tee's entry adds about 0.65s at the start, and the "Ready to wear" beat plus the exit wipe add about 1.65s at the end. Typical total: about 4.5s.
- **Passes:** each squeegee pass covers a third of the progress. Each layer is revealed exactly along the blade.
- **Exit:** "Ready to wear" and the marks snap into register (0.8s beat), then the blade wipes down the screen (0.85s), clipping the overlay away above it.

## Visibility rules (in the snippet)
- **Never shows** in the theme editor (`request.design_mode`), or when the setting is off.
- **Scope:** "Homepage only" (default, recommended: shoppers arriving on a product page from an ad aren't made to wait) or "Any page a visitor lands on first".
- **Once per visit:** a sessionStorage key, `abimra:intro-seen`. For returning views, a tiny inline script adds `html.apl-seen` before the overlay paints, so it never flashes.
- **When it won't show** for any of these reasons, the snippet still adds `html.intro-done`, so anything waiting for the intro starts immediately.

## Interaction
- Drag the tee to spin it; it springs back to face the front. Tap the tee to swap between a black and a white garment.
- "Skip intro" and the Escape key jump to the exit.
- Page scroll is locked with `html.apl-lock` until the wipe finishes.

## Fallbacks and safety
- **No WebGL, data saver on, or reduce motion on:** no 3D and no three.js download. It shows the counter, stages and marks. With reduce motion it's also a short 0.9s calm version with a fade.
- **three.js** loads on demand from `assets/three.min.js` (about 150 KB gzipped). It's added only when the intro plays, and it's released after the wipe (the renderer is disposed to free the GPU).
- **If the JavaScript never runs,** a CSS failsafe hides the overlay after 9 seconds, so shoppers can never get stuck behind it.

## Events for the rest of the theme
- `document` gets `abimra:intro:reveal` when the exit wipe starts, and `abimra:intro:done` when the overlay is gone.
- `html.intro-done` is added at reveal, or immediately if the intro isn't shown.
- `window.AbimraPreloader.play()` / `.skip()`

Hero hand-off, for step 4 once approved:
```js
(function () {
  var start = function () { /* start the hero's existing entrance animation here */ };
  if (document.documentElement.classList.contains('intro-done')) start();
  else document.addEventListener('abimra:intro:reveal', function () { setTimeout(start, 180); }, { once: true });
})();
```

## Needs from the theme
- Rendered as the **first element inside `<body>`**.
- Archivo with the width axis (the counter's width grows from 62 to 125) and IBM Plex Mono 500 (status, skip button, hint).
- Colour tokens are optional: `--paper`, `--ink`, `--red`, `--graphite`.
- Nothing may set `overflow` on `html` or `body` in a way that fights `html.apl-lock` during the intro.

## Performance notes
- Returning page views cost almost nothing: a tiny inline script and a hidden element. The CSS still loads, but the JS exits immediately.
- First views: `abimra-preloader.js` is about 26 KB unminified. three.js downloads in parallel while the counter runs.
- Lighthouse always runs in a fresh session, so it always sees the intro. Expect some extra Total Blocking Time from three.js on mobile. Report the numbers; don't try to hide the intro from Lighthouse.
