# Project context

Orientation for anyone — human or model — picking this project up cold.

Five docs, five jobs. **This file** is the story: what the project is, how it
got here, how to run it.

| Looking for | Read |
|---|---|
| **Traps that have already cost time** | `docs/theme-notes.md` — **authoritative** |
| How a system works, and recipes | `docs/system-reference.md` |
| Every setting on every section | `docs/settings-reference.md` (generated) |
| Running the shop day to day, no code | `docs/merchant-guide.md` |
| Rules before touching anything | `CLAUDE.md` |

Where this file and `theme-notes.md` overlap, `theme-notes.md` wins — it is not
restated here, because a second copy would drift.

Per-change reasoning is in the git log. The commit messages are long and
explain *why*; `git log --grep=` beats re-reading code.

---

## 1. What this is

A fork of Shopify's **Dawn 16.0.0** theme, customised into the storefront for
**Abimra**, a custom-print garment studio on `aarm13-i0.myshopify.com`.
Shoppers pick a garment, choose a colour, and personalise it through a
third-party designer app.

It is **not a web application**. There is no server to run, no database, no
build step, no `package.json`, no dependencies, no `.env`. You edit Liquid, CSS
and vanilla JS, and push the files to Shopify with their CLI. Shopify renders
the pages.

```
   THIS REPO                            SHOPIFY'S SERVERS
   +------------------+                 +----------------------+
   | theme-code/      |  shopify theme  |  Tees 3D staging     |
   |                  | ----- push ---> |  205932822871        | <- work here
   |  405 theme files |                 |                      |
   |  + docs/         | <---- pull ---- |  Abimra live         |
   |  + design-guides/|                 |  206202339671        | <- customers
   +------------------+                 +----------------------+
                                                  |
                                        renders Liquid -> HTML
```

**History:** Dawn base committed 2026-08-10; all custom work ran
**2026-09-03 to 2026-10-02**, 126 commits, one author. Written with Claude Code
across many sessions, which is why the commit messages read as prose.

---

## 2. How it got here — five phases

### Phase 1 - The variant machine (Sep 3-8, 19 commits)

Personalised garments need "pick a colour before Add to cart means anything",
and Dawn preselects the first variant instead. `229b937` built
`assets/pt-product-options.js` — a `<pt-product-options>` custom element.

The load-bearing design decision: Dawn 16 resolves variants **server-side**
(clicking an option re-fetches the section with `?option_values=`). So this
code only intercepts **incomplete** selections and hands control straight back
to Dawn the moment a full option set is chosen. Price, URL, SKU, stock and
`PUB_SUB_EVENTS.variantChange` therefore all behave exactly as stock.

Then a week against third-party apps. Two bugs worth re-reading: `0c69b65` (the
HTML spec flips a radio's `checked` *before* dispatching click, so every new
selection looked like a deselect) and `5ff5fc5` (Customify injects markup into
the variant picker, creating a phantom option group that can never be filled,
so "is the selection complete?" was permanently false).

`4dbc6b5`, reverted by `0a0a3a8`: standing down gallery filtering while the
designer was mounted. The reason matters — the colour filter wasn't *fighting*
the app, it was **driving** it. Hiding non-matching media is how the app
learned which mockup to draw.

### Phase 2 - The design system (Sep 20-25, ~41 commits)

`ef7b223` is the largest commit in the project: the whole **"Press Room"**
design system, built from `design-guides/abimra-ui-guide.md` —
`assets/abmira.css` (now 5,304 lines), `assets/abmira.js`, a symbol sprite,
eight homepage sections. Two decisions from it still govern everything:
**mobile-first** (inverting the mockup's desktop-first breakpoints) and
**namespace everything `ab-`** (Dawn owns `.card`, `.price`, `.badge`).

Then rolled across the site: header/footer `3d6d218`, `/collections`
`9b59167` to `c346208`, collection and catalogue `5da9bb9`, product page
`5eae8d7`, returns `305f047`, contact `4b09db1`.

The most instructive commit is `87ebff5` — "the product page looked nothing
like the reference". Cause: **Dawn's five colour schemes had never been changed
from their defaults.** The `ab-` sections paint their own grounds, which hid it
on the homepage and made it look page-specific. Repainting the schemes fixed
the product page, cart, search and everything else Dawn renders, in one place.

Brand-name churn: the guide said `ABIMRA`, corrected to `Abmira` (`3d6d218`),
corrected back to `Abimra` (`b8c3ba1`, 86 places). **Lowercase `abmira` was
deliberately left everywhere** — setting ids, block types, filenames, classes —
because renaming those breaks saved values and templates. Both spellings in the
codebase are intentional.

### Phase 3 - Supplied handoffs (Sep 27, 20 commits)

Four finished design packages arrived as code in `design-guides/`. The rule
differed per package, and the difference is the point:

| Handoff | Decision |
|---|---|
| Brand story scroll animation | **Copied in byte-identical.** Never edit `assets/abimra-story.*` |
| Animated mobile menu | Copied in byte-identical (one edit: wordmark from settings) |
| Intro preloader | Copied in, then **deleted entirely** (`75faf6e`), with a 603KB three.js |
| About page | **Rebuilt on our own system** (`247b969`) — two design systems in one theme is how a store starts looking like two stores |

Also: the cart rebuild (`07c557e`) and the creation of `docs/` (`cc880b4`).

### Phase 4 - Go live, then the iOS saga (Oct 1, 39 commits)

`3be10a4` **published the store** — repo, staging and live diffed file by file
first, 405 files byte-identical.

Then ~17 consecutive commits chasing a **one-frame visual flash on iPhone**
when the brand story collapses. This is the most expensive thing in the
history. It ends in `ba61e8a` reverting the entire campaign and **accepting the
flash**, then `7d90957` shipping an iOS-only no-collapse build, then `092e67b`
removing it again after the owner tried both on a real phone and chose the
flash over six screens of frozen runway.

**`docs/theme-notes.md` ("The brand story") lists all six failed approaches and
states the list is complete. Do not re-enter this.** Three things from the
campaign were kept on their own merits: measuring a real edge instead of doing
arithmetic on heights, the lazy-image box reservations (a genuine ~394px
mid-scroll layout shift), and the collapsed-stage geometry override.

Also this day: About rebuilt, search added (`3b2c79e`), social and legal links,
two dead app blocks removed that were printing
`<!-- Failed to render app block -->` into every page (`e215529`), and four
unused product templates deleted (`3350212`).

### Phase 5 - Lightbox, sort, cart receipt (Oct 1-2, 8 commits)

`4e7fb03` added a themed sort dropdown (a native `<select>`'s open list is
drawn by the OS and cannot be styled, so it is swapped at runtime) and a
gallery lightbox, tested behind a throwaway template. `aea52bd` deployed to
live and wrote the deploy procedure down. `f1a01f8` fixed the cart's stale
totals and moved gallery colour matching to filename-first.

Then three iterations on the add-to-cart notification: `f9c7867` built it as a
"printer head"; `1947142` found it had been **rendering perfectly and
invisibly** the whole time (Dawn's `position:absolute; z-index:-1` won the
cascade); `b7543bf` threw the printer away for a plain toast, the commit calling
it over-engineering; `de9e154` (HEAD) made the cart ticket print once and patch
itself after.

---

## 3. Architecture

```
+-------------------------------------------------------------+
|  THE ABIMRA LAYER                                           |
|  ~11,050 lines of custom CSS/JS                             |
|  25 custom sections | 11 custom snippets | 18 custom assets |
|  ab- design system  |  pt- product behaviour                |
+-------------------------------------------------------------+
                   restyles, rarely replaces
+-------------------------------------------------------------+
|  DAWN 16.0.0 - 360 files, NOTHING DELETED                   |
|  still does: cart AJAX | facets (filter/sort) | variant     |
|  resolution | search | recommendations | sliders | forms     |
+-------------------------------------------------------------+
```

**Nothing was deleted from Dawn.** `git diff dawn-base HEAD` has zero `D`
entries — 237 paths changed, all additions and modifications. Ten Dawn files
are *modified*, each marked `[abmira]` or `[custom]`: `product-info.js`,
`global.js`, `media-gallery.js`, `main-product.liquid`,
`product-media-gallery.liquid`, `buy-buttons.liquid`,
`product-variant-picker.liquid`, `product-variant-options.liquid`,
`related-products.liquid`, `theme.liquid`.

That "restyle, don't replace" choice bought 946 lines of tested facet logic and
Dawn's whole cart pipeline for free. It costs two recurring bug classes, and
between them they account for roughly a third of all commits:

1. **Dawn's CSS wins cascade fights it shouldn't** — it states colours directly
   on elements and its rules load after ours.
2. **Dawn's JS reaches for elements the redesign removed** and throws inside a
   `.then()`, surfacing as nothing at all.

### Custom code by size

```
assets/abmira.css                5,304   the whole design system
assets/abmira-cart.css           1,269   cart page
assets/abmira-cart.js              747   cart patching, undo, preview dialog
assets/abmira.js                   693   reveals, hero mask, review deck,
                                         size-chart dialog, carousel, sort
assets/abmira-about.css            628
assets/pt-product-options.js       438 * the variant machine
assets/abmira-story-extras.js      355 * story collapse + Watch again
assets/pt-gallery-carousel.css     351
assets/abimra-story.js             302 ! SUPPLIED - do not edit
assets/abmira-lightbox.js          150
assets/abmira-about.js             141
assets/abimra-menu.css             108 ! SUPPLIED
assets/abimra-story.css            103 ! SUPPLIED
assets/abmira-search.js            102
assets/pt-gallery-carousel.js       98
assets/abmira-cart-notification.js  98
assets/abmira-cookie-prefs.js       85
assets/abimra-menu.js               78 ! SUPPLIED
```

### Page map

| Route | Template | Sections |
|---|---|---|
| `/` | `index.json` | 9 sections, **all custom**, no Dawn |
| `/collections` | `list-collections.json` | `abmira-featured-collections`, `abmira-collection-grid`, `abmira-closer` |
| `/collections/*` | `collection.json` | `abmira-collection` |
| `/products/*` | `product.json` + 3 suffixes | `main-product` (Dawn, restyled) |
| `/cart` | `cart.json` | `main-cart-items` (960-line rewrite) + `main-cart-footer` (stub) |
| `/search` | `search.json` | `abmira-search` |
| `/pages/about` | `page.about.json` | 5 `abmira-about-*` + closer |
| `/pages/contact` | `page.contact.json` | intro, `abmira-contact`, closer |
| `/pages/return-and-exchange` | `page.returns.json` | intro, compare, steps, faq, closer |
| any other page | `page.json` | **Dawn's `main-page`** — Dawn-styled, not Abimra-styled |

Header and footer are section groups holding only `abmira-header` and
`abmira-footer`. Dawn's own `header.liquid`, `footer.liquid` and
`announcement-bar.liquid` are on disk but not in the groups.

**Four product templates**, differing only in settings:

| Template | Gallery | Colour filter | Extra |
|---|---|---|---|
| `product.json` (Default) | `stacked` | off | — |
| `product.studio.json` | `thumbnail_carousel` | off | — |
| `product.studio-variant-filtering.json` | `thumbnail_carousel` | **on** | — |
| `product.sb-product-designer.json` | `thumbnail_carousel` | off | `abmira_note` block |

All four have `pt_lightbox: true` with Dawn's `image_zoom: "none"` — **change
those two together** or two viewers answer the same click.

Note `product.studio-variant-filtering.json` is the old `sb-product-options`
template, renamed in `3350212` rather than created fresh.

---

## 4. The main flows

### Shopper picks a colour

```
click swatch (a Dawn radio)
   |
   v pt-product-options.js, capture phase
   |   (capture, because the browser flips input.checked BEFORE the click event)
   |
   +-- selection INCOMPLETE
   |     - cancel Dawn's section re-fetch
   |     - settle Shopify's ProductSelectEvent promise with variant:null
   |     - blank + disable the variant input, so the form posts no variant
   |     - button -> "Select a color", disabled
   |     - swap the price for a <template> price range (no extra request)
   |     - hide "Buy it now" (it posts the same form - same gate)
   |     - filter the gallery
   |
   +-- selection COMPLETE
         - hand back to Dawn -> ?option_values= section re-fetch
              -> price, SKU, stock, variantChange
              -> syncDesigner() clicks the app's own .swapProduct thumbnail
```

Gallery filtering is **filename first, alt text as fallback** —
`Black_tee-front.png` gives everything before the first underscore. A
delimiter, not a substring, so "Red" cannot match `faded-red-tee.png`. No
underscore means the file makes no claim. Alt text is matched hyphen-wrapped as
a word, so "black" misses "blackberry". The rule lives in `mediaIsColor()`; see
`docs/theme-notes.md` ("Gallery colour filtering") for why it must not move
back into Liquid.

### Add to cart

```
submit -> Dawn's product-form.js -> POST /cart/add.js
   |   with ?sections=cart-notification-product,cart-notification-button,cart-icon-bubble
   |
   v Shopify returns rendered HTML for those sections
   |   (the receipt HTML is built by Shopify, not by our JS)
   |
   v abmira-cart-notification.js wraps Dawn's renderContents()
   |   filters out regions whose element is missing - #cart-icon-bubble
   |   does not exist here, and Dawn has no null check, so it threw
   |   before reaching open() and nothing appeared at all
   |
   +- bag counter: GET /cart.js
   |   (the add response is the LINE ITEM - it carries no item_count)
   |
   v a plain toast fades in top right, 0.28s
      a transition, NOT an animation: Dawn's open() waits for transitionend
      before moving keyboard focus
```

### Cart quantity / removal

```
tap + / - / Remove
   |
   v abmira-cart.js, delegated from document in the CAPTURE phase
   |   capture + stopPropagation, to beat Dawn's <cart-items>
   |
   +- quantity: optimistic, debounced 300ms, serial promise queue
   |   so a fast double tap cannot settle on the wrong answer
   +- POST /cart/change.js
   |
   v the summary <aside> is NEVER re-rendered - built once by Liquid,
   |  then patched: money tweened from data-cents over 420ms, rows
   |  collapsed via Web Animations, counts rewritten, LED blinks red
   |
   +- Undo is the only thing that re-fetches markup (it needs a line that
   |  no longer exists) and lifts exactly one <li> from the section
   |  - not offered for personalised lines, because the designer app keys
   |    artwork by line properties
   +- removing the LAST line is the one case that reloads; the toast is
      handed across in sessionStorage so Undo survives it
```

Two receipts exist and are different code: this cart-page **order ticket**
(prints once on scroll into view, then patches) and the add-to-cart **toast**
above. Don't confuse them.

### Collection filter / sort

```
tick a filter / choose a sort
   |
   v Dawn's facets.js - kept wholesale, restyled in CSS
   |   needs, with NO null guards:
   |     #ProductGridContainer    innerHTML target           (facets.js:140)
   |     #product-grid[data-id]   which section to re-fetch   (facets.js:325)
   |     .collection inside it    gets .loading               (facets.js:42)
   |   and binds ONE form listener: 'input', not 'change'     (facets.js:11)
   |
   v fetch ?section_id=&filter... -> swap the grid -> pushState
```

### The brand story

`assets/abimra-story.js` is a **pure function of scroll position**:

```
pt  = clamp(-runway.top / (runway.height - innerHeight), 0, 1)   raw 0->1
pd += (pt - pd) * min(1, dt * 7)                                 damped copy
draw(pd)                                                          every element
                                                                  is ramp(p,a,b)
```

`pd` is an exponential smoother, frame-rate independent — that is what makes
the scrub feel weighted rather than glued to the wheel. The timeline reads as
windows: tee `0-0.085`, type rows `0.115-0.16`, phrase caught at `0.195`,
letters fly staggered `0.22+i*0.005`, photo cards `0.37-0.44`, squeegee
`0.62-0.7`, the 22-tile wall staggered from the centre at `0.765+`, end card
`0.89-0.95`.

`assets/abmira-story-extras.js` then collapses the runway to one screen once it
has been fully scrolled **and the page has provably stopped**, correcting the
scroll by measuring one real edge before and after and holding it for ten
frames against Safari's own late adjustment. Full detail, and the accepted iOS
defect, in `docs/theme-notes.md`.

---

## 5. How to run it

Everything needed is already installed: **Shopify CLI 4.8.5**, **Node v24.4.0**.
No `npm install`. The only credential is a Shopify login, which the CLI handles
interactively and stores outside the repo (`.shopify` is gitignored).

```bash
shopify theme dev   --store aarm13-i0.myshopify.com    # local preview, hot reload
shopify theme check                                     # 13 warnings, 0 errors
shopify theme push  --store aarm13-i0.myshopify.com --theme 205932822871
shopify theme pull  --store aarm13-i0.myshopify.com --theme 205932822871
shopify theme list  --store aarm13-i0.myshopify.com
```

Theme IDs, the live-deploy procedure, the rollback ladder and the three push
traps are all in `docs/theme-notes.md` ("Themes on the store", "Two push
traps"). Do not deploy from memory; read it.

Previewing: `?preview_theme_id=<id>` sets a session cookie, and a black bar
names the theme. `?view=<suffix>` renders an alternate template without
assigning it. **Don't judge scroll behaviour in the theme editor** — it
re-renders constantly and has its own scroll container.

### Tests

**There is no test suite.** Nothing to run, no coverage, no fixtures.

- **Lint:** `shopify theme check` catches Liquid mistakes, not behaviour.
- **What was done instead:** headless Chromium probes run ad hoc per session
  and never committed — four scroll-stop positions at 0px drift, document
  height change of 0px across a full scroll-through, card and swatch counts per
  collection, the lightbox opening at 1/4 on each template, five taps on `+`
  firing one request. Rigorous, recorded in the commit messages, **not
  reproducible with a command.**
- **Known untested:** the cart's line-item card, the preview dialog, the undo
  toast and the ticket. Only the empty-cart state has been seen rendered. They
  need a bag with a personalised item in it.
- **Not verifiable without hardware:** anything iOS-specific.
- **CI exists but has never run.** `.github/workflows/ci.yml` is stock Dawn's
  Lighthouse + theme-check actions, and **there is no git remote**, so they
  have never executed and the secrets they want don't exist.

---

## 6. Current state

### Works

The homepage with the scroll-driven brand story; `/collections` as a two-tier
curated grid driven by the `custom.show_in_grid` collection metafield; the
collection and catalogue pages; four product templates with the no-preselect
flow, carousel gallery, colour filtering and lightbox; the cart with
patch-in-place quantity and Undo; About, Contact and Returns; search with a
predictive header panel; the animated mobile menu; the add-to-cart toast. Repo,
staging and live were byte-identical as of `aea52bd`.

### Uncommitted in the working tree

Five modified files — one coherent bug-fixing session, mostly finished:

1. **Collection filtering and sorting were completely dead.**
   `sections/abmira-collection.liquid` never rendered the three unguarded hooks
   `facets.js` looks up, so `getSections()` threw on its first line — and
   because `onSubmitHandler()` had already called `preventDefault()`, the form
   couldn't even fall back to a normal submit. Fixed, correctly, on both the
   populated and empty branches.
2. The sort listbox dispatched `change`; Dawn binds `input`. Now fires both.
3. New `full_height` opener for `/collections` (`default: true`, so it changes
   the live page).
4. Dawn's red button ring also killed on `:hover` (Dawn redraws it at higher
   specificity).
5. One inset focus ring instead of a border plus an offset blue outline, in
   both note fields.
6. Cart design-preview modal: full-bleed, natural height, scrolls.

**The gap: fix 1 was not applied to `sections/abmira-search.liquid`**, which is
a deliberate copy of the collection section and has none of the three hooks. So
**filtering and sorting on the search results page are still broken.** That is
the first thing to finish.

### Broken, stale or waiting

- **Search page facets** — dead, as above.
- **Placeholder company registration is live on every page** —
  `sections/footer-group.json`: `company no. 00000000`, `1 Example Street,
  Manchester M1 1AA`, `VAT no. GB 000 0000 00`. A UK limited company must
  publish real ones. Unlike the About page's `[bracket]` placeholders, this has
  no red-mark safety net.
- **All four social links are empty** (`show_*: true`, URLs blank), so nothing
  renders on the storefront by design, but all four are still waiting.
- **The footer "Shop" column** points at the default `main-menu`, not a real
  shop menu.
- **`templates/index.json:246`** points a homepage category card at product
  handle **`sb-product-designer-example`**, which looks like an app demo
  product.
- **Brand-story CTAs use bare paths** (`/collections/design-your-own`) at
  `templates/index.json:78,80` while the rest of the theme uses
  `shopify://collections/...`. The bare form breaks if a handle is renamed.
- **The accepted iOS one-frame story flash.** Deliberate. See the notes.
- **Shopify pads empty searches** with substituted recommendations, so
  `results_count` is non-zero and the empty state never runs. `_ss=r` is not a
  discriminator — verified. Test with a numeric query like `7777777`.
- **SB Product Designer shows a designer on products it has no record of** —
  its own fallback rule, not ours.
- **No git remote.** This repo exists in exactly one place.

### Fragile areas, not written down anywhere else

- **A comment contradicts the code.** `layout/theme.liquid:36-40` still says
  `abmira-story-extras.js` loads in the head so it runs *before* the section's
  script, "for the once-per-visit behaviour to work". That behaviour was
  removed in `bad275d`, and the file now waits for `DOMContentLoaded`
  **specifically so it runs after**. Anyone trusting the comment will move the
  script and break the collapse.
- **`initDrawer()` (`assets/abmira.js:252-349`) is fully dead** — its markup is
  behind `{%- if false -%}` *and* its entry selector
  `[data-abmira-drawer-open]` exists nowhere in the repo. The markup, the
  `.ab-drawer*` CSS and the function are meant to be deleted together once the
  new menu is signed off (`sections/abmira-header.liquid:131-137`).
- **Two sources of truth for one duration:** `assets/abmira-cart.js:97`
  (1350ms) and `assets/abmira-cart.css:664` (`1.3s`). Change one and the
  printer's `is-printing` to `is-stamped` hand-off desyncs.
- **"Watch again" dispatches a document-wide `shopify:section:load`**
  (`abmira-story-extras.js:189`), re-running every section boot in the theme.
  Harmless only because all five listeners are idempotent today.
- **Cart money is `Intl.NumberFormat` with a hard-coded `'GBP'` fallback**
  (`assets/abmira-cart.js:45`), not the shop's money format — a custom format
  would disagree with Liquid's `| money` on the same page.
- **All cart and lightbox strings are English literals in JS**, outside
  `locales/`, including the `'item'`/`'items'` pluralisation. Everything
  rendered by Liquid *is* translatable, so this is an inconsistency.
- **Three `custom.*` metafields are an undocumented dependency** —
  `custom.card_image`, `custom.card_style`, `custom.show_in_grid`. The
  "Shop by theme" grid runs off `show_in_grid` and has **no empty-state
  fallback**: delete or rename that admin definition and the grid renders a
  heading and nothing. The hand-picked blocks in `list-collections.json` are
  deliberately retained but ignored in metafield mode, so switching `source`
  back to manual restores them (`f87f1e7`, which verified the metafield path
  against live data).
- **`#cst-loader`** (`sections/main-product.liquid:57`) is an undocumented
  dependency on Customify's internal DOM.
- **`snippets/abimra-menu.liquid` defaults `breakpoint: 990`** but this theme
  swaps at 861. `abmira-header.liquid:221` passes 861 explicitly; rendering the
  snippet without the argument would be wrong.
- **25 Dawn sections are orphaned but still offerable in the theme editor**
  (`featured-collection`, `rich-text`, `slideshow`, `multicolumn`, ...). Adding
  one gives completely un-Abimra'd styling. Same for `templates/page.json`,
  which still uses Dawn's `main-page`.
- **`design-guides/abimra-scroll-animation-handoff/` is a corrupted download** —
  `(1)`-suffixed filenames whose contents don't match their names (a licence
  file holding 90KB of font data, a 118KB "section"). Superseded by
  `scroll-animation-handoff-correct/`. Safe to delete.
- **`sections/abmira-footer.liquid`'s `legal_text_unused` setting** is
  declared, never read, and still holds a saved value.
- **`test-files/todo.txt`** is a stale request for a preloader that was built
  (`3df324f`) and deleted (`75faf6e`). `site.js` and `story.css` beside it are
  mockup-era code, superseded.

---

## 7. Before adding features

1. **Read `docs/theme-notes.md` first.** 602 lines, authoritative, hard-won.
2. **Never rename a setting id or block type.**
3. **Four files are supplied byte-identical.** Extend from outside.
4. **Assume Dawn's JS has no null checks**, and that Dawn's CSS loads after
   ours with single-class rules that still win.
5. **`assets/abmira.css` is 5,304 lines in one file** — well-commented, but the
   single place a careless rule reaches every page.
6. **Dawn upgrades will hurt.** Ten Dawn files are modified; the
   `[abmira]`/`[custom]` markers are the lifeline.
7. **Don't re-fight the iOS collapse flash**, and **don't rebuild the cart
   notification as a printer.** Both decisions were made twice, on-device, and
   are recorded.
8. **The strongest cut idea is in the UI guide's Appendix B**: a live
   mini-designer in the hero — type a word, see it on a shirt, toggle garment
   and colour, squeegee sweeping it in. Replaced by a static collage; its code
   is gone and would need rebuilding. The guide argues it *"demonstrated the
   product rather than describing it, which is the entire pitch."*
