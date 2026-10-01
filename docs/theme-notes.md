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
| **Abimra live** | `206202339671` | **live** |
| Tees 3D staging | `205932822871` | where work happens — push here |
| Tees v1 backup | `205932790103` | frozen snapshot of v1 — never push here |
| Tees staging | `204664865111` | the v1 design system, known good |
| Tees dev | `204608307543` | the old live theme, superseded |

**Push to `205932822871`.** Live is a separate id on purpose: every push
this project has made went to the staging one, and leaving that habit
pointed at production is how a half-finished file ends up on the shop.
Deploying is a deliberate push to `206202339671`.

Rollback ladder, cheapest first: `git checkout` one file → `git checkout
v1-pre-3d` → publish **Tees v1 backup** in the admin (one click, no code).

### Duplicating drops app blocks, and that is sometimes the point

`shopify theme duplicate` does not carry app blocks or embeds across —
they are registered per theme. When Abimra live was made from Tees 3D it
came back missing Customify and SB Product Options, which looked like
data loss and was not: both apps are uninstalled, and what the copy
dropped were dead references. Tees 3D had been printing
`<!-- Failed to render app block ... does not exist -->` into every page
because of them.

Two things follow. **After duplicating, check the app embeds** on the new
theme before publishing — a live app really would be lost this way. And
**a dead app block cannot be removed by pushing**: Shopify strips app
blocks it cannot resolve on the way in, so sending a file that still
contains one changes nothing. Stop sending it instead.

```bash
shopify theme push --store aarm13-i0.myshopify.com --theme <id> --only <path>
shopify theme list --store aarm13-i0.myshopify.com
```

---

## Two push traps

**A full push can strip the app embeds.** `shopify theme push` with no
`--only` sends `config/settings_data.json`, which holds the app embed
blocks — today only `sb-product-designer`. Prefer `--only`, and if you do
push everything, load a product page afterwards and check `pd-boot.js` is
still there.

**`--path` on a pull is unreliable.** `shopify theme pull --path <dir>`
stopped after `assets/` and reported success, twice. Running the pull
from inside the target directory fetched all 405 files. Don't trust a
pull you haven't counted.

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
| `assets/abmira-about.css` | The About page. Namespaced `ab-about-`. |
| `assets/abmira-about.js` | Two-ink slide and the process rail. Reveals are the theme's. |

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
from the page and browsers correct for that on their own, which fought
the correction in the script.

**The collapse: what it is, and the one defect that is accepted.**
When the runway has been fully scrolled and the page has provably
stopped (scrollend, or a 160ms timer plus a same-position-across-frames
check — iOS stops firing scroll events before a glide truly ends), the
section freezes, `is-static` lands, and the scroll is corrected by
measuring the same edge before and after — never by arithmetic on
heights — then held for ten frames against Safari's own late
adjustment, releasing the instant the visitor touches anything.

Positioning is exact: probed headless at four stop positions, 0px
drift at all of them.

**On iOS there is no collapse at all.** Every iOS browser is WebKit,
and WebKit presents one frame of the collapse before its compositor
catches up — a flash that survived six distinct fixes. So iOS freezes
the story at the finale and leaves the runway tall: no height change,
no scroll correction, no flash, and no way to be scroll-corrected to
the wrong place. The chosen cost is that scrolling back up crosses the
full frozen runway (soften it with the Brand story's *Scroll length on
phones* setting, 6 → 4, if it grates). The gate is the `IOS` constant
at the top of `abmira-story-extras.js`; it also catches iPads
reporting themselves as Macs.

On everything else the one compound operation was the flash risk, and
it was Removing ~4000px of document and correcting the scroll is
one compound operation, and iOS presents one frame of it before its
compositor catches up. Every targeted fix was tried and filmed failing:

- keeping the stage `position: sticky` through the collapse — flash
  unchanged (the sticky-height override in abmira.css stays, because it
  also stops the finale nudging up 76px on desktop);
- a GSAP-style "jump to the runway start, then collapse below the
  viewport" path — the jump collided with fresh flicks and threw
  visitors down the page; worse than the flash;
- collapsing in 600px steps — nine corrections, nine momentum
  collisions; much worse;
- deferring the half-past case — left the runway six screens tall;
- `position: fixed` on the header, `translateZ(0)` on the nav,
  dissolving the story's seven `will-change` layers a frame early —
  flash unchanged, all reverted.

A `?nocollapse=1` isolation build proved the collapse is the trigger
and the rest of the page is clean — which is what justified the iOS
gate. Do not retry the list above on iOS; it is complete.

**Step images reserve space with a width, not only a cap.** The base
breakpoint sets `width: 186px` on `.ab-step-img` so the lazy-image box
exists before the file arrives; the 401px+ layouts must set
`width: auto` back, because their image column is a fixed 124px/168px
grid track and a 186px box overflows it into the text. That overlap
shipped once.

**Lazy images must reserve their boxes.** A pending `loading="lazy"`
image measures 0×0 whatever its width/height attributes say. The step
illustrations and category garments reserved nothing and grew the page
by ~394px right below the story, mid-scroll — found because the probes
kept reporting it as "noise". The step image's container now carries
the image's real aspect-ratio inline plus a definite width, and
`.ab-cat-img` has `min-height` equal to its 148px image cap. A full
scroll-through now changes document height by 0px. Keep it that way.

**Never force a synchronous layout here.** A `void document.body.offsetHeight`
immediately after taking ~4800px out of the page made iOS blank and
re-rasterise for a frame.

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

Dawn's `component-predictive-search.css` is overridden in `abmira.css`,
the same arrangement the facets use. It owns the open/closed display
switch (`predictive-search[open] .predictive-search`), the loading states
and the keyboard-selected row; ours owns everything visible. It is loaded
by `layout/theme.liquid`, not by the header — under the same
`predictive_search_enabled` condition, and asynchronously. The header
loaded a second, render-blocking copy for a while; don't add it back.

**The story's finale buttons need `.as__end` in the selector.**
`assets/abimra-story.css` is loaded by its section, which is to say after
`abmira.css`. A bare `.as__ctas` rule ties on specificity and loses on
order. Verified from the served page: the story's stylesheet is the last
of nine.

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

## The About page

`sections/abmira-about-*.liquid` (five), `assets/abmira-about.css`,
`assets/abmira-about.js`, `templates/page.about.json`.

It arrived as a finished handoff in `design-guides/abimra-handoff-about/`
with its own `abt-` namespace, tokens, reveal system and breakpoints.
**It was rebuilt on the theme's system rather than installed**, on the
instruction that it should follow the site. The handoff is kept as the
design reference; none of its files are in the theme.

What that decision bought, concretely: the handoff's headings would have
inherited Dawn's `h1–h5 { font-family: var(--font-heading-family) }`,
which `theme.liquid` resets *after* `abmira.css` to Dawn's own font — one
with no width axis. `.abt-d` sets `font-variation-settings: 'wdth' 76`
but not `font-family`, so every giant headline on the page would have
rendered uncompressed. Using `.ab-d1`/`.ab-d2`/`.ab-d3` avoids it,
because those already state the family. See the typography note above.

### Where it differs from the reference

- **The process band is a rounded card inside `.ab-wrap`**, not a
  full-bleed strip. Every other dark band in the theme is.
- **There is no sixth section.** The design's red closing panel is
  `sections/abmira-closer.liquid`, whose default copy was already "What
  will you make?".
- **Labels are sentence case in graphite**, not tracked-out mono. Mono
  survives only on `STEP 01`, where it is carrying a number.
- Reveals are the theme's `.ab-rv`, not a second observer.

### Two things to leave alone

**The process heading is `position: sticky`.** Nothing above it may take
`overflow: hidden | auto | scroll`. The band itself uses `overflow: clip`,
which does not break sticky — don't "fix" it to `hidden`.

**The facts are sized in container query units.** `container-type:
inline-size` on `.ab-about-facts`, `font-size: clamp(26px, 11cqw, 54px)`
on the word. That is what keeps all four the same size and stops the
longest one overflowing its cell. Swapping `cqw` for `vw` reintroduces
the "1fr will not shrink below content" bug the design guide warns about.

### Known and accepted

Each of the five sections emits its own `<link>` to `abmira-about.css`,
so the page carries five identical tags. That is Shopify's own idiom —
a section has to be self-sufficient because a merchant can add one on
its own — and the browser fetches once. The JS is emitted three times
and guards on `window.__abAbout`, so the later copies only refresh.

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
