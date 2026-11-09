# System reference

How this theme actually works, system by system. Written for whoever is
changing it next — human or model.

| Looking for | Read |
|---|---|
| **How a system works, and recipes** | this file |
| Every setting on every section | `settings-reference.md` (generated) |
| Traps that have already cost time | `theme-notes.md` — **authoritative** |
| Running the shop day to day, no code | `merchant-guide.md` |
| Orientation, history, current state | `../PROJECT_CONTEXT.md` |
| Rules before touching anything | `../CLAUDE.md` |
| Why a specific change was made | `git log --grep=` |

This file explains *mechanism*. Where `theme-notes.md` covers the same ground it
wins — it holds the things that were learned the hard way, and a second copy
would drift.

---

## Contents

1. [How a Shopify theme is put together](#1-how-a-shopify-theme-is-put-together)
2. [Templates and routes](#2-templates-and-routes)
3. [The homepage](#3-the-homepage)
4. [Collections — the three surfaces](#4-collections--the-three-surfaces)
5. [Cards, images and backdrops](#5-cards-images-and-backdrops)
6. [The product page](#6-the-product-page)
7. [The cart](#7-the-cart)
8. [Header, footer and the mobile menu](#8-header-footer-and-the-mobile-menu)
9. [Search](#9-search)
10. [The content pages — About, Returns, Contact](#10-the-content-pages--about-returns-contact)
11. [The design system and its tokens](#11-the-design-system-and-its-tokens)
12. [Metafields the theme depends on](#12-metafields-the-theme-depends-on)
13. [Section structure conventions](#13-section-structure-conventions)
14. [Settings that exist but do nothing](#14-settings-that-exist-but-do-nothing)
15. [Recipes](#15-recipes)

---

## 1. How a Shopify theme is put together

If you only remember one diagram, this is it:

```
templates/collection.json          a JSON file naming which sections a page uses
        │
        ├── sections/abmira-collection.liquid     a big page-level component
        │        │                                 - has a {% schema %}: its settings
        │        │                                 - merchant adds/reorders these
        │        │                                   in the theme editor
        │        └── snippets/abmira-product-card.liquid
        │                 a reusable partial. NO schema, NO settings.
        │                 Takes arguments from whoever renders it.
        │
        └── layout/theme.liquid    the HTML shell wrapped round every page
```

Four things worth internalising:

- **Sections own settings. Snippets own markup.** A snippet can't be configured
  by a merchant; it takes arguments. That's why the shared cards are snippets
  and everything configurable is a section.
- **Blocks are repeatable settings inside a section.** "Add a card", "add a
  question". Shopify cannot generate blocks, so a section either lists things
  automatically (nothing in the editor sidebar) or uses blocks (everything in
  the sidebar). There is no arrangement that is both — that trade-off is the
  reason several sections here have a **Source** dropdown.
- **`templates/*.json` and `sections/*-group.json` are merchant data, not code.**
  The theme editor writes them. Git and the editor are two writers to one
  document — see `theme-notes.md` on pulling before you push.
- **Settings live in two places.** Theme-wide ones in `config/settings_schema.json`
  (values in `settings_data.json`); per-section ones in that section's `{% schema %}`.

### What is ours vs what is Dawn's

```
templates/        mostly ours
sections/         73 files, 25 ours, the rest Dawn's (most unused)
snippets/         50 files, 11 ours
assets/           ~208 files, 18 ours
```

**Nothing was deleted from Dawn.** 47 Dawn sections still ship and are still
offerable in the theme editor's "Add section" menu. Adding one gives
un-Abimra'd styling — a real hazard worth knowing.

Ten Dawn files are *modified*, each marked `[abmira]` or `[custom]`:
`product-info.js`, `global.js`, `media-gallery.js`, `main-product.liquid`,
`product-media-gallery.liquid`, `buy-buttons.liquid`,
`product-variant-picker.liquid`, `product-variant-options.liquid`,
`related-products.liquid`, `theme.liquid`.

---

## 2. Templates and routes

| Route | Template | Sections |
|---|---|---|
| `/` | `index.json` | 9 sections, **all custom** |
| `/collections` | `list-collections.json` | `abmira-featured-collections`, `abmira-collection-grid`, `abmira-closer` |
| `/collections/<handle>`, `/collections/all` | `collection.json` | `abmira-collection` |
| `/products/<handle>` | `product.json` + 3 suffixes | `main-product` (Dawn, restyled) |
| `/cart` | `cart.json` | `main-cart-items` + `main-cart-footer` |
| `/search` | `search.json` | `abmira-search` |
| `/pages/about` | `page.about.json` | 5 × `abmira-about-*` + closer |
| `/pages/contact` | `page.contact.json` | intro, `abmira-contact`, closer |
| `/pages/return-and-exchange` | `page.returns.json` | intro, compare, numbered steps, FAQ, closer |
| **any other page** | `page.json` | **Dawn's `main-page`** — Dawn-styled, not Abimra-styled |
| header / footer | `header-group.json` / `footer-group.json` | `abmira-header` / `abmira-footer` |

**Alternate templates.** A file named `product.studio.json` shows up in the
admin as the template `studio`, assignable per product. Two things follow, and
both have bitten before:

1. **A template only appears in the admin dropdown once it is on the *live*
   theme.** Pushing it to staging is not enough.
2. **Template assignment (`template_suffix`) is store-level, not per-theme.**
   Delete a template and any product still on it silently falls back to Default
   — no error anywhere. That is how the one product still on the deleted
   `customify` template was found: its gallery went stacked the moment the file
   was gone.

A template can be previewed without assigning it: `/products/x?view=studio`.

---

## 3. The homepage

`templates/index.json`, in order. All nine are custom; there is no Dawn markup
on the home page.

| # | Section | File | What it is |
|---|---|---|---|
| 1 | Abimra hero | `abmira-hero.liquid` | One screen tall. Masked two-line headline with one red accent word, subheading, two buttons, optional proof row, image collage on a coloured mat. |
| 2 | Brand story | `abimra-brand-story.liquid` | The scroll-driven runway. **Supplied file, byte-identical, do not edit.** |
| 3 | Abimra marquee | `abmira-marquee.liquid` | Infinite ticker. Items render twice; the second copy is `aria-hidden`. |
| 4 | Abimra steps | `abmira-steps.liquid` | Three illustrated "how it works" cards, middle one inverted. |
| 5 | Abimra designed and worn | `abmira-designed-worn.liquid` | Customer photos with a "Designed by X — garment" credit. |
| 6 | Abimra categories | `abmira-categories.liquid` | "Customise apparel" rail. |
| 7 | Abimra product rail | `abmira-originals.liquid` | "Studio Originals" rail of real products. |
| 8 | Abimra testimonials | `abmira-testimonials.liquid` | Scattered quote cards on desktop; swipeable deck under 769px. |
| 9 | Abimra closing band | `abmira-closer.liquid` | Dark band, red logomark, CTA. **Shared by five templates.** |

### The hero is exactly one screen

Deliberately. It fills the viewport minus the header and centres in it, and its
type is sized against the viewport in **both** directions — `min()` of a `vw`
and an `svh` measure, so a wide short window can't scale the headline until it
pushes the image off the bottom.

The consequence for a merchant: **every row you switch on competes for that one
screen.** The eyebrow and the rating row are settings precisely because they are
the two rows that earn their space least. Both are currently off.

### The rails scroll at every width

Not just mobile. Above ~1280px the cards fit; below that they scroll and the
next card peeks at the edge. **That peek is the affordance** — no arrows, no
dots. The negative inline margin bleeds the rail to the screen edge while the
first card stays on the grid; `scroll-padding` keeps every *subsequent* snapped
card on the grid too. Don't remove either.

---

## 4. Collections — the three surfaces

The word "collection" means three different things here, with three different
pieces of code. Most confusion starts by mixing them up.

```
/collections                 the landing page. TWO sections:
   ├── abmira-featured-collections   up to 4 big cards      (blocks only)
   └── abmira-collection-grid        "Shop by theme" tiles  (3 sources)

/collections/<handle>        one collection's products
   └── abmira-collection             grid of product cards + Dawn's facets

homepage rails               not really collections, but they read from one
   ├── abmira-categories             "Customise apparel"
   └── abmira-originals              "Studio Originals"
```

### 4a. `/collections` — the landing page

**Featured cards** (`abmira-featured-collections`) are **blocks only**, max 4.
Each block picks a collection; title, meta and image all fall back:

```
image:  block override  ->  collection image  ->  first product's image  ->  sand ground
title:  title_override  ->  collection title
meta:   meta setting    ->  "<N> designs"
```

A card with nothing resolvable still renders on its sand ground rather than
collapsing. `full_height` (default on) makes the section fill the first screen
like the home hero — turn it off if the section is ever dropped part-way down a
page.

**Shop by theme** (`abmira-collection-grid`) has **three sources**, and this is
the one setting that decides whether new collections appear on their own:

| Source | Behaviour | Needs a theme-editor step per collection? |
|---|---|---|
| `auto` — All collections, automatically | Lists every collection | No |
| `metafield` — Only collections marked in the admin | Lists collections whose `custom.show_in_grid` is ticked | No (tick a box on the collection) |
| `manual` — Only the ones I pick below | Lists the `collection` blocks | Yes |

**Currently set to `metafield`.** So: create a collection → tick **Show in grid**
on its own admin page → it appears. Nobody opens the theme editor.

Automatic and metafield modes also apply three filters:

- Shopify's internal `frontpage` collection is always skipped
- `hide_empty` (default on) skips collections with no products
- any collection named by a **"Hide a collection"** block is skipped

> ⚠️ **There is no empty state.** If the `custom.show_in_grid` definition is
> deleted or renamed, this grid renders a heading, an intro, and nothing at
> all. The four `collection` blocks saved in `list-collections.json` are kept
> deliberately but are **ignored** in metafield mode — switching Source back to
> `manual` restores that hand-picked grid instantly.

Exclusions are blocks because Shopify has **no setting type that picks several
collections**. Each "Hide a collection" block holds a native collection picker,
so nobody has to type a handle.

### 4b. `/collections/<handle>` — the collection page

One section, `abmira-collection`, drives **both** `/collections/<handle>` and
`/collections/all`, so every collection and the catalogue are one design.

**Filtering and sorting are Dawn's**, not ours. `snippets/facets.liquid` is 946
lines of form handling, URL state and drawer behaviour, rendered with the same
arguments Dawn's own grid used, and restyled in CSS. Dawn's
`component-facets.css` is still loaded; ours sits on top.

That borrowing comes with a contract. `assets/facets.js` looks up three hooks
**with no null guards**, and the page must provide all three:

| Hook | Used for | facets.js |
|---|---|---|
| `#ProductGridContainer` | the element whose `innerHTML` is swapped | line 140 |
| `#product-grid[data-id]` | which section to re-fetch | line 325 |
| `.collection` inside it | gets `.loading` during the fetch | line 42 |

`#product-grid` must be on **both** the populated and the empty branch — filter
down to zero results and the empty branch is the only thing left to re-filter
from. Dawn also binds exactly **one** form listener and it is `input`, not
`change`, which matters for any control swapped in at runtime.

> This contract was missing for months and **every filter and sort silently did
> nothing**: `getSections()` threw on its first line, after `preventDefault()`
> had already fired, so the form couldn't even fall back to a normal submit.
> `sections/abmira-search.liquid` is a copy of this section — if you change the
> contract here, change it there too.

Filters themselves come from the free **Shopify Search & Discovery** app, not
the theme. No app, no filters.

### 4c. The homepage rails

Both have the same **Source** toggle — a collection (keeps itself current) or
hand-picked blocks (order, wording, colour under your control) — and both
render through a shared snippet so the two paths can't drift.

| | `abmira-categories` | `abmira-originals` |
|---|---|---|
| Renders | `abmira-category-card` | `abmira-product-card` |
| Block points at | a collection **or** a product | a product |
| Default source | `manual` | `collection` |
| Block limit | 8 | 12 |
| Extra | per-card invert | badge on tagged products, image padding |

A **category card**'s target resolves most-specific-first: explicit link →
product → collection. A card with none of the three still renders, so a row can
be laid out before its collections exist.

---

## 5. Cards, images and backdrops

This is the system that decides what a product looks like everywhere it appears.

### 5a. The three cards

| Snippet | Used by | Shape |
|---|---|---|
| `abmira-product-card.liquid` | collection page, catalogue, search, product rail, recommendations | image on a backdrop, title/price row, meta line |
| `abmira-category-card.liquid` | categories rail (both sources) | heading, garment, caption |
| `abmira-collection-tile.liquid` | shop-by-theme grid (both sources) | image + scrim, **or** flat colour + garment silhouette |

Because the product card is shared, **a product looks the same everywhere** —
that is the point, and it's why fixing it in one place fixes it on five
surfaces.

### 5b. The backdrop palette

Six photographic backdrops, cycled by card position so a row never reads as one
flat block:

```
#E8E2D4  sand      #DFE7DC  sage      #EDE3C9  straw
#E3EAF6  blue      #DCD9CF  stone     #FBE7E1  red wash
```

These sit **behind garments only, never on UI**. The cycle is
`index modulo 6`.

### 5c. The backdrop cascade — four levels

Most specific wins. Each level defaults to "use the level above":

```
individual card's own colour      (block: "Give this card its own backdrop")
        ↑
section setting                   (section: Backdrop = Theme default / Cycle / One colour)
        ↑
theme setting                     (Theme settings > ABIMRA > Card backdrops)
        ↑
the cycling palette               (the built-in default)
```

The mechanism is a CSS custom property **redeclared on the section's own
wrapper**, `#shopify-section-<id>`, which beats `:root` on specificity. No extra
classes, no inline style per card, no JavaScript.

Two rules that are easy to get wrong:

- **A per-card colour needs its checkbox switched on to count.** A colour picker
  has no empty state — it answers `#E8E2D4` whether or not anyone chose it — so
  without the toggle an untouched default would silently beat a section-wide
  colour.
- **"Theme default" must resolve to the theme**, not to whatever colour the card
  happens to be holding. An earlier version fell back to the block's own colour
  and made Theme default unreachable.

Collection pages and the catalogue have **no blocks**, so they can only use the
theme setting.

### 5d. Inset vs Fill — "PNG on a colour" vs "photo filling the tile"

This is the control for *how a product's picture sits on its card*, and it's a
**product metafield**, so it follows the product to every surface.

| `custom.card_style` | Effect | Use for |
|---|---|---|
| `Inset` *(default)* | padding around the image, `object-fit: contain` | **cut-out PNG** with a transparent background — the garment sits *on* the colour |
| `Fill` | padding `0`, `object-fit: cover` | a photograph that **brought its own background** |

Both halves move together on purpose: padding with `cover` just crops harder,
and `cover` without padding is what fills the tile. Either alone does nothing
useful.

**Why it has to be told rather than detected:** Shopify exposes no alpha flag,
Liquid cannot read pixels, and a `.png` extension says nothing — a PNG can be
opaque. A two-option choice also explains what it is for in a way an unexplained
checkbox would not.

The amount of inset padding is a **theme setting** (*Space around card images*,
default 18px, currently 30px) so every surface agrees, with a per-section
override on the product rail.

### 5e. `custom.card_image` — a picture that is only ever a card

Optional product metafield. When set, it is used on cards **instead of** the
featured image.

It is deliberately a metafield and **not product media**: media would also show
in the gallery on the product page, and the whole point is a picture that never
appears there.

Both shapes a Shopify definition can produce are handled:

- a **file reference** answers as a `MediaImage`, which carries a `preview_image`
- an **image reference** answers as the image itself

### 5f. The contact shadow

`snippets/abmira-shadow.liquid` turns a 0–100 strength into a filter value.

- **`drop-shadow`, not `box-shadow`.** `drop-shadow` follows the image's alpha
  channel, so on a cut-out PNG it traces the garment itself. `box-shadow` would
  draw a rectangle round the picture.
- On a photo that still has its own background it *will* draw a rectangle — and
  that is a useful signal rather than a bug: **the photo needs cutting out**, or
  setting to `Fill`.
- **Two layers**, not one: a tight core where the garment meets the surface
  (`strength / 545`) and a wide soft falloff (`strength / 300`). A single layer
  reads as either a sticker or a haze.
- **Zero emits the literal keyword `none`**, so the browser skips compositing
  entirely rather than blending a fully transparent shadow on every image.

Currently set to **100** (theme default is 45).

### 5g. What the product card shows

```
┌──────────────────────────────┐
│                              │  backdrop (cycled or set)
│         [garment]            │  card_image metafield -> featured image
│                              │  Inset (padding+contain) or Fill (cover)
│   [chip]                     │  sold out > badge > new   (first match wins)
├──────────────────────────────┤
│ Title                 £24.99 │  title/price row
│ Oversized tee · 4 colours    │  meta: product.type · colour count
└──────────────────────────────┘
```

- **Chip precedence:** sold out (ink) beats the configurable badge (red) beats
  the `new` tag (red). Sold out always wins.
- **The colour count is text, not swatch dots.** Dots answer "which colours",
  which is unreadable at card size; the question a shopper is actually asking in
  a grid is whether there is more than one. It only appears when the colour
  option has **more than one** value.
- **Both halves of the meta line are optional.** A product with no *Product
  type* set reads "4 colours" rather than "· 4 colours". Setting Product type in
  the admin fills the other half — that is admin data, not code.

> The `color_option_name` setting's help text on the collection and search
> sections still says products "show colour swatches on their card". That is
> **stale** — swatches were removed in favour of the count. The setting itself
> works; only the label is wrong.

---

## 6. The product page

`sections/main-product.liquid` is Dawn's file (2,678 lines) with our additions
marked `[abmira]` / `[custom]`. **The structure is deliberately Dawn's**, not a
rewrite: the variant picker's fieldsets, radio inputs and
`data-option-value-id` attributes are load-bearing for `pt-product-options.js`,
and both designer apps hook `<media-gallery>`. Rewriting the markup would break
four things at once, so everything visual is CSS over the existing DOM.

### 6a. The four templates

All four use the same four sections in the same order — an `apps` section, then
`main-product`, `disclosures`, `related-products` — and the same nine blocks.
Only four things differ:

| | Default | `studio` | `studio-variant-filtering` | `sb-product-designer` |
|---|---|---|---|---|
| `gallery_layout` | `stacked` | `thumbnail_carousel` | `thumbnail_carousel` | `thumbnail_carousel` |
| `hide_variants` | `true` | `false` | `false` | `false` |
| `pt_filter_gallery_by_color` | `false` | `false` | **`true`** | `false` |
| extra block | — | — | — | **`abmira_note`** |

**Nothing else differs.** All four set `pt_no_preselect: false`,
`pt_lightbox: true` and `image_zoom: "none"`.

Two of those are worth noting because they invert the schema default:
`pt_no_preselect` defaults to `true` in the schema but every live template
turns it **off**; `pt_lightbox` defaults to `false` but every template turns it
**on**.

What each is for:

- **Default** — the plain catalogue product. Stacked column of photos;
  `hide_variants: true` drops other variants' photos once one is picked.
- **studio** — products photographed as a set of angles. One image at a time,
  arrows, thumbnail strip, whole set reachable.
- **studio-variant-filtering** — the only template with colour filtering on.
  Assign it to products with per-colour photography.
- **sb-product-designer** — the carousel page plus the order-note box, for
  products customers personalise.

### 6b. The no-preselect flow

Turned on, the page loads with **nothing selected**: price shows a range, Add
to cart is disabled and reads "Select a colour", SKU and inventory are hidden,
and the dynamic checkout button is suppressed (it posts the same form, so it
would otherwise be a way round the gate).

The guard is deliberately narrow (`main-product.liquid:28-43`):

```liquid
if section.settings.pt_no_preselect
   and product.selected_variant == nil
   and product.has_only_default_variant == false
```

So a single-variant product and a `?variant=` landing both behave normally.
`product.selected_variant` — not `selected_or_first_available_variant` — is the
signal, because only the former means "the shopper actually asked".

The price range is not re-fetched: the same markup is rendered once into a
`<template id="PtPriceRange-…">` so the JS can restore it instantly.

**Currently off on every template.** It exists for a personalisation flow that
isn't in use right now.

### 6c. Gallery layouts

Six options. Four are Dawn's; two are ours, and both are the same mechanism
differing only in how position is indicated:

| Value | Shows | Position indicator |
|---|---|---|
| `carousel` | one image, arrows | **dots** (`pt-gallery-carousel.js`) |
| `thumbnail_carousel` | one image, arrows | **Dawn's thumbnail strip** |

Both set `pt-carousel` on `<media-gallery>` and add Dawn's own
`slider--everywhere` class to the track — that single class is what turns a
desktop stack into a desktop slider, so swipe and keyboard come free.

> ⚠️ Dawn's stock `thumbnail_slider` option is labelled **"Thumbnail
> carousel"** in the dropdown, which is one word away from ours. Ours read
> "Carousel (one image, arrows and dots)" and "Carousel (one image, arrows and
> thumbnails)".

In a carousel the **hoist is disabled**: Dawn normally moves the selected
variant's image to the front of the list, which is right for a stacked column
and destructive in a running order — "next" would walk a sequence matching
neither the thumbnails nor the admin. `media-gallery.js:42-57` carries the
matching guard.

### 6d. Colour filtering — the exact rule

Only on `studio-variant-filtering`. Liquid emits two attributes on every slide
*and* every thumbnail:

```liquid
data-pt-alt="{{ media.alt | downcase | strip }}"
data-pt-file="{{ ...src | split: '/' | last | split: '?' | first | downcase }}"
```

`mediaIsColor()` in `pt-product-options.js` then decides:

1. **Filename first.** Everything before the **first underscore** is the
   colour. `Black_tee-front.png` → `black`. A delimiter, not a substring search
   — otherwise "Red" would match `faded-red-tee.png`.
2. **No underscore means the file makes no claim**, and alt text gets its turn.
3. **Alt text is matched as a word**, hyphen-wrapped, so `black` hits
   "Black hoodie, front view" but not "blackberry".
4. **If the chosen colour has no media of its own, the whole gallery shows.**
   So this can be adopted one product at a time.

Filename beats alt text on purpose: alt text belongs to screen readers and
search engines, and an exact-match rule would mean writing `alt="Black"`, which
is the hijacking this exists to avoid.

After filtering it cancels Dawn's reveal animation on newly-shown slides (a
`display:none` slide reads as off-screen to Dawn's observer, so un-hiding would
replay a fade), resets the sliders, and dispatches `pt:gallery-filtered` so the
dots rebuild.

### 6e. The lightbox

`pt_lightbox` gives a flip-through viewer — one image, dark scrim, prev/next,
counter, arrow keys, Escape — built on native `<dialog>`, so the top layer,
focus trap and inert page are browser behaviour.

It collects `.product__media-item:not(.pt-media-hidden)`, so **it flips through
exactly the set the colour filter is showing.**

> **Always pair it with Image zoom = "No zoom"** on the same template. Dawn's
> own `product-media-modal` is still rendered, and two viewers would answer the
> same click. All four templates have this pairing set correctly.

### 6f. The three custom blocks

| Block | Renders | Key detail |
|---|---|---|
| **Abimra trust list** | tick list under the buy buttons | ticks are `<use href="#ab-tick">` into the sprite — if `abmira-symbols` stops rendering, every tick silently vanishes |
| **Abimra size guide** | `<details>` accordion + contained chart that opens a full-screen `<dialog>` | the dialog sits **outside** the `<details>`, because a closed accordion is `display:none` and a dialog can't be shown from inside one |
| **Abimra order note** | textarea above the buy buttons | writes a **line-item property** |

The order note's field is `properties[Special requirements]` by default. Two
deliberate choices: the name is **not** underscore-prefixed, so the customer
can still see it in the cart (an `_` prefix hides it while keeping it on the
order); and because the textarea lives outside `<product-form>` in the DOM it
carries `form="product-form-<section id>"` — **without that attribute it is
simply not submitted.** Shopify drops blank properties, so an untouched box
adds nothing.

---

## 7. The cart

Everything a shopper sees is rendered by `sections/main-cart-items.liquid`
(557 lines). `main-cart-footer.liquid` is a 39-line stub with **no settings at
all** — and it **must not be deleted**: Dawn's `cart.js` lists it in
`getSectionsToRender` and swaps its `.js-contents` with no null check, so
removing it makes the cart stop responding with nothing in the console.

The design is a two-column grid with a sticky summary, which is why everything
is in one section: two sibling Shopify sections cannot be made into one grid
without wrapping them from the layout.

### 7a. The order ticket, and "print once then patch"

The right column is styled as a thermal printer: a dark bar with an LED, and a
paper receipt that **feeds out once**, on first scroll into view
(IntersectionObserver at `threshold: 0.2`, then a 1350ms timer swaps
`is-printing` for `is-stamped`).

Every change after that **patches** the existing DOM rather than re-rendering
it — money tweened from `data-cents` over 420ms, rows collapsed via Web
Animations, counts rewritten, and a separate 650ms LED blink as the "something
changed" signal.

Why: re-rendering the summary destroys the element the observer fired on and
builds a fresh ticket with no `is-in`, so the printer replayed on **every**
quantity tap.

To make that work, Dawn is taken out of the loop. The click and change handlers
are registered in the **capture phase** with `stopPropagation()` so they beat
`<cart-items>`, and the code talks to `/cart/change.js` directly — serialised
through one promise chain so a fast double-tap can't land out of order, with
quantity applied optimistically and debounced 300ms.

> **Two structural rules.** `#ab-cart-side` and `.js-ticket` must render **even
> when the cart is empty**, with only their *contents* conditional — Dawn calls
> `querySelector('.js-ticket').innerHTML` on the fetched section and throws on
> null. And **the header bag counter is ours to update**, because the region
> Dawn used for it (`#cart-icon-bubble`) isn't rendered by this theme.
>
> There are **two** bag counters: `.ab-bag b` in the header and
> `[data-am-count]` in the mobile menu. Both are updated by both cart scripts.

### 7b. The designer app's line-item properties

SB Product Designer appends the literal marker `?ffuyg/uploads/Click here` to
its preview URL, which makes Dawn's generic property renderer treat it as an
uploaded file and print a link — that is where
"Preview Personalization Image: Click here" came from.

The real URL is everything before the marker. **We match on the property
*value*, not its name**, because the label is configurable inside the app and
keying off it would break the day someone renames it.

Three property names are suppressed outright: `pd_personalization_id`,
`product_id`, `_personalization_id`. Design images are hosted by the app, not
Shopify, so each carries a `data-ab-fallback` to the product photo — they can
404 long after the order was placed.

> ⚠️ **The add-to-cart toast is not filtered this way.** It renders through
> Dawn's stock `cart-notification-product.liquid`, which hides only blank and
> underscore-prefixed properties — so a personalised item still shows a
> "Click here" upload link in the toast. The cart page is clean; the toast is
> not. Known inconsistency.

### 7c. Undo

Removing a line shows a toast with **Undo**, which re-adds via `/cart/add.js`
and then does the file's **only** Section Rendering call, lifting exactly one
`<li>` out of the re-fetched section.

Two cases are handled specially:

- **Personalised lines get no Undo button.** The designer app keys artwork by
  the line's properties and re-adding is not guaranteed to resolve to the same
  design — silently restoring the wrong artwork is worse than making someone
  design it again.
- **Removing the last line reloads the page**, because the empty-bag layout is
  built from merchant settings the JS can't reproduce. The toast is handed
  across in `sessionStorage` so Undo survives the reload.

The data Undo needs (`data-key`, `data-variant`, `data-qty`, `data-title`,
`data-props`) is captured on the `<li>` at render time — once the card is gone
there is nowhere left to read it from.

### 7d. The add-to-cart toast

Enabled by **Theme settings → Cart → Cart type = `notification`**. Rendered
from `abmira-header.liquid`, *not* from the layout or the cart — Dawn renders
`<cart-notification>` from its own `header.liquid`, which this theme doesn't
use, so the element was never on the page and `product-form.js` fell back to a
full navigation. **The Cart type setting did nothing at all until that line
existed.**

`abmira-cart-notification.js` wraps Dawn's `renderContents` to filter out
regions whose element is missing (the `#cart-icon-bubble` trap again), then
asks `/cart.js` for the count — the add response is the *line item* and carries
no `item_count`.

It is a **plain toast and should stay one**; an earlier "printer head" version
read as a glitch on screen. Visibility is left to Dawn, and it must use a
`transition`, not an `animation`, because Dawn's `open()` waits for
`transitionend` before moving focus.

---

## 8. Header, footer and the mobile menu

### 8a. Header

Sticky from `.shopify-section-group-header-group` — **not** from `.ab-nav`,
which is only `position: relative` so the search panel can hang off it. Height
is `--ab-nav-h: 76px`.

> **Do not load `search-form.js`, `predictive-search.js` or
> `component-predictive-search.css` from the header.** `layout/theme.liquid`
> already does, and both scripts end in `customElements.define()`, which throws
> `NotSupportedError` on a second registration — every page carrying the header
> threw on load for a while because of this.

The search panel lives **inside `<nav>`** so it moves with the sticky header.
`abmira-search.js` does open/close only — it adds `is-open` a frame after
dropping `hidden` (or there is no transition to run), re-hides on a 260ms timer
rather than `transitionend` (which never fires if the panel was never painted),
and **yields the first Escape to Dawn** while predictive results are open.

The magnifier is desktop-only (861px+): below that the mobile menu carries its
own search bar, and two ways into the same search in a 44px row is one too many.

### 8b. The mobile menu

Supplied files, byte-identical, extended from outside. The **861px breakpoint
is decided in exactly two places** and they must agree: `breakpoint: 861` passed
to the snippet (which writes `data-breakpoint`), and a CSS rule hiding the
button at `min-width: 861px`. The snippet's own default is 990 — a trap if it
is ever rendered without the argument.

The wordmark is passed down from the **header's** settings so the two can't
disagree. Links are top-level only; children are never shown.

Note the cart uses a **different** breakpoint for its two-column grid: 980px.

### 8c. Footer

Four fixed social platforms — **not blocks**, because the set doesn't change
and a merchant shouldn't need to know what a "block" is to add an icon.

**The rule: an icon needs both a switch *and* an address.** On but blank shows
nothing on the storefront, and a dashed, unclickable placeholder **in the theme
editor only**, so whoever is meant to fill it in can see the slot exists.

Legal links resolve: **explicit link wins**, otherwise the named Shopify
policy. A policy with no text written yet resolves to nil, so **a legal link
can never be a dead link** — it simply doesn't render until the policy exists.

**Cookie preferences is different.** It isn't a page; it reopens Shopify's
consent banner, so it renders as a `<button>`, ships `hidden`, and
`abmira-cookie-prefs.js` reveals it only after polling up to ~6s and finding a
consent API. A store with no banner configured shows no control, rather than
one that looks live and does nothing.

Link columns (max 3) take **either** a Shopify menu **or** typed
`Label | /url` lines, one per row. A chosen menu wins outright. The typed form
exists because a column shouldn't have to wait on someone building a menu in
the admin for two links.

---

## 9. Search

`sections/abmira-search.liquid` is **deliberately a copy of the collection
page** — same grid, same facets, same card. A shopper who searches and one who
browses a collection are doing the same thing and shouldn't be shown two
different shops. It shares `.ab-coll-page` and adds only `.ab-search-page`.

Dawn's `main-search.liquid` is still in the tree, unused.

**One form snippet, rendered three times. Only one may be predictive:**

| Where | Predictive? |
|---|---|
| header panel | **yes** — the only live one |
| mobile menu | no, plain submit |
| results page | no, plain submit |

Dawn's results section hardcodes `id="predictive-search-results"`, so a second
live instance would duplicate that id and the two inputs would fight over it.

Three things that are easy to break:

- **`options[prefix]=last`** is a hidden input in all three forms. Without it
  Shopify matches whole words only, so "hood" finds nothing and the panel looks
  dead.
- **`search-form.js` must load before `predictive-search.js`** — the latter
  opens `class PredictiveSearch extends SearchForm` and throws on parse
  otherwise. Both are deferred, which preserves document order.
- Even the header panel degrades to a plain form if **Theme settings → Search
  input → search suggestions** is switched off.

**Shopify pads empty searches.** A word search matching nothing can still come
back with products — recommendations Shopify substitutes — so `results_count`
is non-zero and the empty state never runs. The `_ss=r` marker on those URLs
looks like a discriminator and is not. A numeric query like `7777777` is how to
test the empty state.

Pages and articles are listed *below* the grid rather than forced into it: a
card with no picture beside cards with pictures reads as broken.

---

## 10. The content pages — About, Returns, Contact

All three are **page templates**, which means a page must exist in the admin
with the right handle, and that page's **Theme template** must be set.

| Page | Handle it must have | Theme template to pick | Template file |
|---|---|---|---|
| About | `about` → `/pages/about` | `page.about` | `templates/page.about.json` |
| Returns | **`return-and-exchange`** | `returns` | `templates/page.returns.json` |
| Contact | `contact` → `/pages/contact` | `contact` | `templates/page.contact.json` |

> The returns handle is **`return-and-exchange`**, not `returns`. The header
> link, the mobile menu and the footer's Help column all point there. (The
> template *suffix* is `returns`; the page *handle* is `return-and-exchange`.
> `merchant-guide.md` says `/pages/returns` in one line, which is wrong.)

Remember a template only appears in the admin's Theme template dropdown once
it is on the **live** theme.

### 10a. The `[square bracket]` placeholder mechanism

Unfinished copy is made impossible to miss. A Liquid double `replace` wraps any
bracketed run in `<mark class="ab-fill">`, which renders **red with a dashed
underline — on the live site as well as in the editor**:

```liquid
assign story = section.settings.text
  | replace: '[', '<mark class="ab-fill">['
  | replace: ']', ']</mark>'
```

Used by **About: how it started** and **About: say hello**. The reasoning in
the file: *"a placeholder that looks like ordinary text is one nobody notices
for a year."* Note it is only ever applied to large text — red on paper is only
accessible at 16px and up.

**Currently still bracketed:** the founder's name and the "one line on why" in
the About story. (`[year]` and `[town or city]` were filled in as 2026 and
London.)

### 10b. The contact form

Shopify's own `{% form 'contact' %}`, so messages arrive by email with no app
and no endpoint of ours to keep alive. Submissions go to the address under
**Settings → Notifications**.

The field naming rule: **any field named `contact[Something]` appears in the
email under that name**, which is why they read as plain English — a person
reads them, not a parser.

| Field | Becomes |
|---|---|
| `contact[Name]` | a line labelled "Name" |
| `contact[email]` | **special** — Shopify validates it and makes it the **reply-to**, so answering the email answers the customer |
| `contact[Subject]` | a line labelled "Subject" (hidden entirely if the subject list is emptied) |
| `contact[Order number]` | a line labelled "Order number" |
| `contact[body]` | **the message body itself**, not another labelled line |

**There is no file upload, deliberately.** Shopify's contact form has no
multipart handling behind it, so a file input would look like it worked and
quietly drop the photo. In its place is a line of text saying where to email
one. Real uploads need an app.

### 10c. Returns page sections

Named for their shape rather than for returns, because shipping and terms will
want the same shapes: **page intro**, **comparison** (two policy cards with
tick/cross lists plus a callout), **numbered steps**, **FAQ**, **closing band**.

Two decisions worth keeping: the comparison cards take ticks and crosses as two
separate fields rather than one list with markup in it, so adding a line needs
no syntax; and an excluded line is **dimmed rather than struck through**,
because it is usually the line a customer most needs to read and nobody reads
struck text.

The FAQ reuses `.ab-guide` from the product page's size guide — native
`<details>`/`<summary>`, so it opens with no JavaScript, is keyboard operable
for free, and its closed answers are still found by find-in-page and by search
engines.

---

## 11. The design system and its tokens

`assets/abmira.css`, 5,304 lines, ported from `design-guides/abmira-tokens.css`
and the mockup. Two deliberate departures from the source, both recorded in its
header: **mobile-first** (the mockup was desktop-first) and
**everything namespaced `ab-`**.

### 11a. Tokens

Colour tokens keep their documented names (they're collision-free); layout
tokens are prefixed.

```
--paper         #eeeae0   page ground — newsprint, not cream   [theme setting]
--paper-raised  #f7f5ef   raised surfaces
--ink           #191813   text, inverted bands — never pure #000  [theme setting]
--graphite      #5f5b52   secondary text, captions, meta
--rule          #d6d1c4   hairlines on paper
--rule-inv      rgba(255,255,255,.14)   hairlines on ink

--red           #d42e12   ink one — "click this", NEVER an error  [theme setting]
--red-deep      #a32209   hover / pressed
--red-wash      #fbe7e1
--blue          #1b4fa0   ink two — links and every focus ring
--blue-wash     #e3eaf6
--ok #2f6f4e    --warn #a9761a (unused)   --stop #7e1b08 (unused)

photographic backdrops, behind garments only:
--b-sand #e8e2d4  --b-stone #dcd9cf  --b-blue #e3eaf6
--b-red  #fbe7e1  --b-sage  #dfe7dc  --b-straw #ede3c9

--ab-f       'Archivo', system-ui, …      --ab-f-mono  'IBM Plex Mono', …
--ab-nav-h   76px        --ab-dots / --ab-dots-size   the print texture
--r-card 20px  --r-band 28px  --r-input 8px  --r-pill 999px
--ab-sec  64px  → 92 @641 → 124 @1025      vertical section padding
--ab-pm   20px  → 32 @641 → 40  @1025      page gutter
--ab-mw   1200px                           content max width
--ab-e    cubic-bezier(.22,.61,.36,1)      the one easing
```

The file also hands Archivo to **Dawn's own** `--font-body-family` and
`--font-heading-family`, which is how the product page, cart and search pick up
the typeface without touching Dawn's CSS.

**Three tokens are not declared here.** `--ab-card-pad`, `--ab-media-bg` and
`--ab-shadow` are written by `layout/theme.liquid` from theme settings, and
consumed with fallbacks so the stylesheet still works standalone.

**`--ab-nav-h` is 76px, not 75**, and that is deliberate: the brand story's
offset setting steps by 2, so an odd number can't be entered, and a pinned
stage off by a pixel shows a sliver of the wrong colour. The header gives up
the pixel.

### 11b. Breakpoints

Mobile-first. Base styles are the phone styles.

| Breakpoint | What changes |
|---|---|
| **401px** | step cards go horizontal, image on the left |
| **641px** | spacing steps up (`--ab-sec`, `--ab-pm`), rails take fixed 288px cards, bands get their radius, buttons grow |
| **769px** | testimonials become the desktop scatter (rotated cards) |
| **861px** | step cards return to three vertical cards; **mobile menu ↔ desktop links**; search icon appears |
| **1025px** | full desktop spacing; hero grid goes two-column |

The cart is the exception — its two-column grid uses **980px**.

### 11c. Type scale and buttons

| Class | Size | Axes |
|---|---|---|
| `.ab-d1` | `clamp(38px, 11.5vw, 54px)` | `wdth 82, wght 800`, uppercase |
| `.ab-d2` | `clamp(34px, 4.6vw, 54px)` | `wdth 82, wght 800`, uppercase |
| `.ab-d3` | `clamp(24px, 2.6vw, 32px)` | `wdth 85, wght 800`, uppercase |
| `.ab-ttl` | `22px` | `wdth 100, wght 600` — strong but not display |
| `.ab-meta` | `14px` | graphite |
| `.ab-num` | `13px` | mono, tabular — **functional only, never decorative** |

| Button | Use |
|---|---|
| `.ab-btn-p` | primary — **one per view**, red fill |
| `.ab-btn-s` | secondary on paper, ink outline |
| `.ab-btn-i` | inverted, for dark bands |
| `.ab-btn-sm` | compact modifier |

Hover **darkens the fill**. No lift, no scale, no shadow. Focus is an
`outline`, never a box-shadow.

> `.ab-section a:not(.ab-btn)` gets `color: inherit` — the `:not()` is
> load-bearing. Without it, every button inherited the colour of the surface
> behind it: the white label on the red hero pill went ink, and the paper pill
> on the closing band went paper-on-paper and vanished.

### 11d. Finding things in 5,304 lines

The file is banner-commented. Rough map:

```
1     header / the tokens contract        1720  header, drawer, footer
27    :root tokens                        2170  collections page
103   type scale                          2406  collection / catalogue
155   shell (.ab-section/.ab-sec/.ab-wrap) 2886  product page
240   buttons                             (then cart, about, search,
313   surfaces                             story overrides, notification)
363   reveal on scroll
391   hero          568  marquee          1389  401px and up
622   steps         739  photo card       1435  641px and up
808   carousels     1129 testimonials     1574  769px / 1621 861px / 1664 1025px
1322  closing band                        1691  reduced motion — ALL of it
```

**Reduced motion is deliberately one block.** Its banner says why: *"A missing
brace here once silently swallowed every rule after it."*

---

## 12. Metafields the theme depends on

Create these at **Settings → Custom data** before expecting the features to
work. Nothing breaks without them, but the features are simply inert — with one
exception, noted below.

| Namespace.key | On | Type | Used by | Missing means |
|---|---|---|---|---|
| `custom.show_in_grid` | Collections | true/false | shop-by-theme grid | ⚠️ **the grid renders empty** when Source is `metafield` |
| `custom.card_image` | Products | File (image) *or* Image | product card | falls back to the featured image |
| `custom.card_style` | Products | Single line text, limited to `Inset` / `Fill` | product card | treated as `Inset` |

Dawn additionally reads `shopify.disclosure` and `reviews.rating` /
`reviews.rating_count`. Those are standard definitions, not ours.

The grid's namespace and key are **settings**, not hard-coded, so they work with
whatever the definition ends up being called.

---

## 13. Section structure conventions

Every custom section follows the same shape. Copy it when adding one.

```liquid
<div class="ab-section">      <!-- paper ground, ink text, Archivo, image resets -->
  <section class="ab-sec">    <!-- vertical rhythm: --ab-sec padding -->
    <div class="ab-wrap">     <!-- max-width 1200, page gutter --ab-pm -->
      ...
    </div>
  </section>
</div>
```

18 of the 25 custom sections use this. The exceptions are the ones that paint
their own ground (bands, the story, header/footer).

- **Namespace everything `ab-`.** Dawn already defines `.card` (306 rules),
  `.price` (69) and `.badge`. Reusing those names silently restyles the product
  and collection pages.
- **Reveal classes are `.ab-rv` plus `.ab-rv-1` / `-2` / `-3`** for stagger, and
  `.ab-in` is added by the observer. **Never name them `.d1/.d2/.d3`** — those
  are the display type scale, and a subline would inherit an 84px uppercase
  headline. This has happened once.
- **Every grid track is `minmax(0, 1fr)`, never `1fr`.** A bare `1fr` will not
  shrink below its content, and a long condensed word overflows the viewport.
- **A page intro tightens against the next section via `:has()`.**
  `.shopify-section:has(.ab-page-intro) + .shopify-section .ab-sec` — that is
  the only way to reach across Shopify's own per-section wrappers. Unsupported
  browsers keep the wider gap, which is untidy rather than broken.

---

## 14. Settings that exist but do nothing

Each of these appears in the theme editor and has no effect. Knowing the list
saves an afternoon of changing a value and reloading.

| Setting | Where | Why it's inert |
|---|---|---|
| **Legal line** (`legal_text_unused`) | Abimra footer → Bottom line | Left over from when the legal row was one text field. The real links are the **Legal link** blocks. Renders nowhere. |
| **Heading size** | Related products | The heading was swapped for `.ab-d2`, the Abimra display face. |
| **Columns desktop / mobile** | Related products | The grid was swapped for `.ab-prod-grid`, which is `auto-fill` and sizes itself. |
| **Image ratio, Show secondary image, Show vendor, Show rating** | Related products | The card was swapped for `abmira-product-card`, which takes none of them. |
| **Image shape** | Related products | Survives only as a stylesheet include; it no longer shapes the card. |
| `backdrop_color` when **Backdrop = Theme default** | Categories, product rail | A colour picker always answers with something, so the mode is what decides. Same for `shadow` under *Theme default*. |
| `background` on a card block with its **checkbox off** | Categories, product rail | Deliberate — see §5c. |

Two more that are easy to misread rather than inert:

- **Company details** (`legal_details`) is grouped under the editor's **Social**
  heading, because of where it sits in the schema. It is company registration
  text, not a social setting.
- The **X (Twitter)** setting id and editor label both say "Twitter", but the
  storefront `aria-label` is "X".

---

## 15. Recipes

### Create a collection and get it onto `/collections`

1. **Products → Collections → Create collection** in the admin. Set a title, and
   give it an **image** — without one the tile falls back to the first product's
   image, then to a garment silhouette.
2. Tick **Show in grid** on that collection's page (the `custom.show_in_grid`
   metafield). It now appears automatically.
3. To feature it as one of the big cards instead, add a **Collection** block to
   *Abimra collections* in the theme editor on `/collections`.
4. To hide one, add a **Hide a collection** block to *Abimra shop by theme*.

### Put a product on a coloured background with a cut-out PNG

1. Photograph or cut the garment out on a **transparent background**, save as
   PNG.
2. Upload as the product's featured image, or as `custom.card_image` if it
   should only ever be a card.
3. Leave `custom.card_style` unset, or set it to **Inset**.
4. The backdrop comes from the cascade in §5c — by default the cycling palette.
   To pin one colour everywhere: *Theme settings → ABIMRA → Card backdrops →
   One colour*.

### Use a photo that already has its own background

Set `custom.card_style` to **Fill** on that product. Padding goes to zero and
the picture fills the tile. If a rectangular shadow appears round it, that is
the `drop-shadow` telling you the image is not a cut-out — Fill is the right
answer.

### Change one section's backdrop without touching the rest

In that section's **Backdrops and shadow** group, set **Backdrop** to *Cycle the
palette* or *One colour*. Leave it on *Theme default* to follow the store.

### Give one card in a rail its own colour

On that block, switch **Give this card its own backdrop** on, then pick the
colour. The checkbox is what makes it count.

### Add a new page that looks like the rest of the site

Don't use the plain `page` template — that is Dawn's `main-page` and is
Dawn-styled. Either create a new `templates/page.<name>.json` composed of
`abmira-page-intro` plus the content sections you want and `abmira-closer`, or
reuse `page.returns.json` as the model. Then set the page's **Theme template**
in the admin. Remember the template only shows in that dropdown once it is on
the live theme.

### Work out which theme you are looking at

The black bar at the bottom of the screen names the previewed theme. **No bar
means live.** `?preview_theme_id=<id>` sets it for the session.
