# SPEC: "Blank to yours" brand story section

## What it is
A pinned, full-screen stage under the hero that plays a short brand story as the visitor scrolls. Scroll position drives everything: forwards plays it, backwards rewinds it, and it never autoplays (apart from a gentle idle float on the tee). It ends on the finale call to action, then releases, and the page carries on.

## How it works technically
- `.as__runway` is a tall block, `--as-len` screens tall on desktop (default 7) and `--as-len-m` on phones up to 760px wide (default 6).
- `.as__stage` inside it is `position: sticky` with `top: var(--as-offset)` and `height: calc(100svh - var(--as-offset))`. It stays pinned while the runway scrolls past.
- `abimra-story.js` measures how far the runway has scrolled (0 to 1), smooths it, and redraws the stage each animation frame, **only while the section is on screen** (an IntersectionObserver starts and stops the loop).
- The text rows, flying letters, the tee and the wall are built by the JS from `data-phrases` and `data-catch` on the section element, which come from the Liquid settings.
- SVG artwork (tee, hoodie, photo snaps, badge) is defined once in the section's hidden `<svg class="as__defs">`, with IDs suffixed by `section.id` so two copies of the section can't clash. The wall tiles reference those IDs through `data-uid`.
- The printed-ink texture is a grain mask generated on a canvas at startup (`--as-grain`).
- The theme editor is handled: it listens for `shopify:section:load` and `shopify:section:unload`.

## Requirements the page must meet
1. **No ancestor may have `overflow: hidden | auto | scroll`**, or sticky pinning silently stops working. Use `overflow: clip` if clipping is needed.
2. **Full-bleed:** no padding, margin or max-width around the section.
3. **Header offset:** `--as-offset` must equal the height of whatever is fixed or sticky at the top of the viewport. The section setting "Sticky header height" sets it inline. A scoped CSS rule tied to the theme's header height variable is better if one exists.
4. **Fonts:** Archivo with the width axis (`font-stretch` 62%–125%, weights 100–900, plus italic for the snap captions) and IBM Plex Mono 500 (for the "Scroll" hint).
5. **Colour tokens,** optional: `--paper`, `--ink`, `--red`, `--graphite`, falling back to `#EEEAE0`, `#191813`, `#D42E12` and `#5F5B52`.
6. **No global rule** may add transitions, transforms or scroll-reveal animation to the section's elements.

## Timeline (share of the runway scrolled, 0 to 1)
| From | To | What happens |
|---|---|---|
| 0.00 | 0.085 | The black tee rises from below and settles in the centre. |
| 0.00 | 0.14 | "START BLANK." in giant outline type; fades up and out from 0.09. Caption 1 shows from 0.012 to 0.105. |
| 0.115 | 0.36 | Three rows of giant outline phrases fade in and drift sideways (the middle row the other way). The tee slides right on desktop, or down on phones (0.12–0.18). Caption 2 shows from 0.15 to 0.33. |
| 0.195 | | The catch phrase (default "ABIMRA CLUB") turns solid red. |
| 0.22 | 0.35 | Its letters fly one by one in an arc onto the tee's chest. |
| 0.33 | 0.40 | The tee returns to the centre. |
| 0.37 | 0.48 | Four photo snaps fly in around the tee and drift. Caption 3 shows from 0.40 to 0.56. |
| 0.47 | 0.545 | The first snap flies onto the chest, loses its white frame and becomes the print. The other snaps leave (0.52–0.58). |
| 0.58 | 0.63 | The tee settles slightly smaller. |
| 0.62 | 0.70 | A squeegee blade pulls down the stage and turns it red. "PULLED / IN INK." is revealed in beige, and the print picks up the grain texture as the blade passes it. |
| 0.72 | 0.79 | The press words drift apart and fade. |
| 0.74 | 0.83 | The tee shrinks into the centre of a wall of tees (9×5 on desktop, 5×7 on phones). |
| 0.765 | 0.89 | Tiles pop in, spreading out from the centre. The wall drifts upward. Caption 4 shows from 0.78 to 0.87, on a red pill so it stays readable. |
| 0.88 | 0.95 | The wall dims, and "MADE TO BE ADMIRED." appears with the two calls to action. |

## Default copy (all editable in the theme editor)
- Opening: "Start blank." Caption: "Nothing on it yet. That's the exciting part."
- Catch phrase: "Abimra Club"
- Phrases: Birthdays, Events, Branding, Class of 2026, Your club, Personal, Team kits, Hen do, Stag do, Band merch, Staff uniforms, Weddings, Charity runs, Gifts, Launch party
- Caption 2: "Birthdays, leavers, launches, club nights. If it's worth saying, it's worth wearing."
- Snap captions: Holiday, 2019 / Her sketch / Club badge / The band. Caption 3: "Add your pictures too. Photos, sketches, logos, whatever you've got."
- Press: "Pulled" / "in ink." Caption 4: "Then we print it in our own studio and send it out in 2–4 days."
- Finale: "Made to be admired." Buttons: "Design your own" and "Shop Studio Originals".

## Performance notes
- The script is about 20 KB unminified, and the stylesheet about 7.5 KB. No libraries.
- Work only happens while the section is visible. Each frame changes transforms and opacity, plus a small, fixed number of layout reads.
- The wall tiles are plain SVG with no filters, which keeps phones fast.
- With "reduce motion" on, the section renders one static final frame and never pins.

## Accessibility
- The stage is decorative (`aria-hidden`), apart from the finale links.
- A visually hidden `h2` and ordered list give screen readers the same story in text.
