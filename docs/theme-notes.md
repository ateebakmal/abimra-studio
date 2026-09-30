# Theme notes

For whoever maintains this code. Things that are not obvious from reading
it, and traps that have cost time more than once.

Git history carries the reasoning behind individual changes — the commit
messages are written to be read. This file is only for what git can't
tell you.

---

## Themes on the store

Store: `aarm13-i0.myshopify.com`

| Theme | ID | Role |
|---|---|---|
| Tees dev | `204608307543` | **live** |
| Tees staging | `204664865111` | the v1 design system, known good |
| Tees v1 backup | `205932790103` | frozen snapshot of v1 — never push here |
| Tees 3D | `205932822871` | current working theme |

All four were deployed from the commit tagged `v1-pre-3d`.

Rollback ladder, cheapest first: `git checkout` one file → `git checkout
v1-pre-3d` → publish **Tees v1 backup** in the admin (one click, no code).

```bash
shopify theme push --store aarm13-i0.myshopify.com --theme <id> --only <path>
shopify theme list --store aarm13-i0.myshopify.com
```

---

## Two push traps

**A full push can strip the app embeds.** `shopify theme push` with no
`--only` sends `config/settings_data.json`, which holds the app embed
blocks (customify, sb-product-designer, sb-product-options). Prefer
`--only`, and if you do push everything, load a product page afterwards
and check the app scripts are still there.

**Push a section before the config that uses it.** Shopify parses a
template or section group *before* it knows about a new setting or block
type, so pushing both in one command fails — with a message as unhelpful
as "pushed with errors". Push the section first, then the config. This
bit us on the closing band's alignment setting and again on the footer's
legal blocks.

---

## Previewing

`?preview_theme_id=<id>` sets a cookie that persists for the browsing
session — you only need it on the first URL. The black bar at the bottom
of the screen names the theme you are previewing; no bar means live.

`?view=<suffix>` renders an alternate template without assigning it to
anything: `/products/x?view=studio`. Useful for testing a template before
any product uses it.

Do not judge scroll behaviour in the theme editor. It re-renders sections
constantly and has its own scroll container.

---

## Custom code, and why it exists

| File | Does |
|---|---|
| `assets/abmira.css` | The whole design system. Namespaced `ab-`. |
| `assets/abmira.js` | Reveal-on-scroll, hero headline mask, review deck, mobile drawer, size-chart dialog, carousel swipe/count. |
| `assets/pt-product-options.js` | No-preselect variant flow, deselect, colour-filtered gallery, Customify bridge. |
| `assets/pt-gallery-carousel.js` | Dot indicators for the dots carousel only. |
| `assets/abimra-story.*` | The brand story. **Supplied, byte-identical, do not edit.** |
| `assets/abmira-story-extras.js` | Collapse-on-completion and Watch again, layered on the story without touching it. |
| `assets/abmira-cart.css` | The cart page. Namespaced `ab-cart-`. |
| `assets/abmira-cart.js` | Cart preview dialog, undo toast, phone checkout bar, ticket. |
| `assets/abmira-search.js` | Opens and closes the header search panel. Nothing else. |

### Dawn files that were modified

`product-info.js`, `global.js`, `media-gallery.js`, `main-product.liquid`,
`product-media-gallery.liquid`, `buy-buttons.liquid`,
`product-variant-picker.liquid`, `product-variant-options.liquid`,
`related-products.liquid`, `theme.liquid`. Each change is marked with an
`[abmira]` or `[custom]` comment. Search for those before upgrading Dawn.

---

## Patterns worth knowing before you change anything

**Dawn states colours directly; inheriting from a parent loses.** Dawn
sets `color` on `h1`–`h5` and on `a`, so a component that only sets a
colour on its container gets overridden. This has caused invisible
footer headings, ink-on-red button labels and grey product titles. If
text is the wrong colour, look for a Dawn rule naming the element.

**`--font-heading-family` is reset after `abmira.css` loads.** The
`:root` block in `theme.liquid` has to come last for the colour scheme
overrides, which means any heading that doesn't state
`font-family: var(--ab-f)` falls back to Dawn's font — and Dawn's font
has no variable axes, so `font-variation-settings` silently does nothing.

**Sticky needs the right parent.** A sticky element can only travel
inside its own parent's box. The header sticks from
`.shopify-section-group-header-group`, not from `.ab-nav`, for exactly
this reason.

**`--ab-nav-h` is 76px, not 75.** The brand story's offset setting moves
in steps of two and the header is 75px of content plus a 1px rule. The
header gives up a pixel so the two line up; a mismatch shows a sliver of
the wrong colour under the header on the story's red chapters.

**Deferred scripts run while `readyState` is `"interactive"`.** The usual
`if (readyState === 'loading')` guard therefore falls through to running
immediately, which is *before* other deferred scripts. If order matters,
wait for `DOMContentLoaded`.

**The print texture is painted by the band, not by a child.** The closing
bands carry their dots on `.ab-band.ab-closer`, deliberately two classes:
`.ab-band` sets `background` as a *shorthand*, which resets
`background-image` to `none`, and a single-class rule cannot reliably beat
it. `background-color` and `background-image` are also set separately for
the same reason. An earlier version put the texture on a
`.ab-closer-dots` child and it never appeared, with nothing in the
cascade explaining why — that div is still in the markup, now empty. One
token, `--ab-dots`, drives both the bands and the mobile menu; the menu's
own hardcoded copy is pointed at it from `abmira.css` rather than edited
in the supplied file.

**`drop-shadow`, not `box-shadow`.** The contact shadow follows the
image's alpha channel, which is the whole point on a cut-out. It is built
in `snippets/abmira-shadow.liquid` and emitted as `--ab-shadow`, so zero
produces the literal keyword `none` and the browser skips compositing.

---

## The cascade

Backdrop and shadow resolve most-specific-first:

```
card block  →  section setting  →  theme setting  →  cycling palette
```

Each level defaults to "use the level above". Section overrides work by
redeclaring the custom property on `#shopify-section-<id>`, which beats
`:root` by specificity — no extra classes, no JavaScript.

A per-card colour needs its **checkbox** switched on to count. A colour
picker has no empty state, so without the toggle an untouched default
would silently beat a section-wide colour.

Collection pages and the catalogue have no blocks, so they can only use
the theme setting.

---

## The brand story

Supplied as a finished package in
`design-guides/scroll-animation-handoff-correct/`. The section, its CSS
and its JS are copied in unchanged and should stay that way.

`abmira-story-extras.js` adds the collapse and replay from outside. It
reaches into two internals, and both would fail safely:

- `sec.__asDestroy()` — documented by the section's own unload handler.
- `sec.__as` — the double-init guard, cleared to allow a replay. If it is
  renamed upstream, Watch again breaks and nothing else does.

It reuses `is-static`, the section's own reduced-motion state, rather
than inventing a collapsed layout.

An earlier version also skipped the animation for the rest of the
browsing session, by answering `matchMedia` `true` for the
reduced-motion query while the section booted. It froze whatever frame
was current instead of the finale and the story never played. It was
removed; don't reach for it again.

`overflow-anchor` is off on the section. Collapsing removes six screens
from above the viewport and browsers correct for that on their own, which
fought the correction in the script.

---

## The cart

Everything a shopper sees is rendered by `sections/main-cart-items.liquid`.
`main-cart-footer.liquid` is a near-empty stub. The design is a two-column
grid with a sticky ticket, and two sibling Shopify sections cannot be made
into one grid without wrapping them from the layout.

**Both sections have to exist.** Dawn's `assets/cart.js` lists
`main-cart-items` and `main-cart-footer` in `getSectionsToRender` and
swaps each one's `.js-contents` on every quantity change. Delete the
footer and the update throws part way through — the cart stops responding
with nothing in the console that points at the cause.

The hooks Dawn's script reaches for, all reproduced in the rewrite:
`#main-cart-items`, `#main-cart-footer`, `.js-contents`, `<cart-items>`,
`.cart-item`, `.cart-item__name`, `.cart-item__error-text`,
`#cart-live-region-text`, `#shopping-cart-line-item-status`, `#cart-errors`,
`<quantity-input>`, `<cart-remove-button>`, `CartNote`. Restyled, not
replaced — Dawn still does all the talking to the Cart AJAX API.

### The designer app's line item properties

SB Product Designer appends `?ffuyg/uploads/Click here` to the preview
URL before writing it as a property. Dawn's property renderer treats a
value containing `/uploads/` as an uploaded file and prints a link, which
is where `Preview Personalization Image: Click here` came from. `Jp(e,t)`
in `pd-designer.js` builds it.

The real URL is everything before that marker. We match on the property
**value**, not its name, because the label is configurable inside the app
and keying off it breaks the day someone renames it.

`pd_personalization_id`, `product_id` and `_personalization_id` are
suppressed from the printed list.

Design images are hosted by the app, not Shopify. They can 404, so every
one carries a `data-ab-fallback` to the product photo.

### abmira-cart.js

Delegated from `document`, because Dawn replaces the whole `.js-contents`
subtree and any listener bound inside it is lost. A `MutationObserver` on
that subtree re-runs the per-render setup.

Namespaced `ab-cart-*`. The supplied reference used bare `.item`, `.price`
and `.cart` — all three already mean something in Dawn.

### Untested

Written and pushed, but only the empty state has been seen rendered. The
line item card, the preview dialog, the undo toast and the ticket need a
bag with a personalised item in it.

---

## Search

`sections/abmira-search.liquid` is the results page and is deliberately a
copy of `abmira-collection.liquid`: same grid, same facets, same card.
Someone who searches and someone who browses a collection are doing the
same thing. Dawn's `main-search.liquid` is still in the theme, unused.

`snippets/abmira-search-form.liquid` is the form, rendered three times.

**Only one form may be predictive.** Dawn's `sections/predictive-search.liquid`
hardcodes `id="predictive-search-results"`, and the input points at it
with `aria-owns`. A second live instance puts a duplicate id in the
document and the two inputs fight over it. The header panel is the
predictive one; the menu and the results page use plain `<search-form>`.

**`search-form.js` must load before `predictive-search.js`.** The latter
opens with `class PredictiveSearch extends SearchForm`, which throws on
parse if the base class is not defined. Both are deferred, which
preserves document order.

**`options[prefix]=last` is not optional.** Without that hidden input
Shopify matches whole words only, so "hood" finds nothing and the live
panel looks broken.

Dawn's `component-predictive-search.css` is loaded and then overridden in
`abmira.css`, the same arrangement the facets use. It owns the
open/closed display switch (`predictive-search[open] .predictive-search`),
the loading states and the keyboard-selected row; ours owns everything
visible.

### Shopify pads empty searches

A word search that matches nothing can still come back with products —
recommendations Shopify substitutes — so `search.results_count` is
non-zero and the theme's empty state never runs. There is no way to tell
them apart from Liquid. The `_ss=r` marker on the product URLs looks like
a discriminator and is not: real matches carry it too. Verified, so don't
build on it. A numeric query (`7777777`) does return nothing, which is
how to test the empty state.

### Known, pre-existing

`snippets/abmira-symbols.liquid` renders its `<symbol>` definitions once
per section that asks for it, so `#ab-tee`, `#ab-hood`, `#ab-regmark`,
`#ab-mark` and `#ab-tick` appear four times in the homepage document.
`<use>` resolves to the first, so nothing is broken, but the ids are
duplicated.

---

## Linting

`.theme-check.yml` ignores `design-guides/**`, `test-files/**` and
`docs/**`. Shopify never uploads those — the CLI only sends recognised
theme directories — but theme-check walks every `.liquid` it finds, and
the handoff packages contain sections referencing assets that are
deliberately not in `assets/`.

Baseline is **13 warnings, 0 errors**. If a run reports more, check
whether the new offences are in an ignored folder before chasing them.

---

## Still outstanding

- Search results still render Dawn's product card, not `abmira-product-card`.
- Three app embeds are installed and all load on every page. Only
  Customify is used; SB Product Designer shows a designer on four
  products it has no record of, because its script falls back to "is
  there design data on this product?" when its own rule list does not
  match.
- Live is behind the working theme. Check before assuming a fix is out.
