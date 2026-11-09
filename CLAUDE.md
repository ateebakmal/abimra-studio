# CLAUDE.md

Operational facts for working on this theme. Narrative and history live in
`PROJECT_CONTEXT.md`. The traps live in `docs/theme-notes.md`, which is the
authoritative maintainer doc — **read it before changing the cart, the brand
story, the facets or the gallery colour filter.**

## What this is

A fork of Shopify's **Dawn 16.0.0** theme, customised for **Abimra**, a
custom-print garment store on `aarm13-i0.myshopify.com`.

**There is no build step.** No `package.json`, no bundler, no dependencies, no
`.env`. Liquid + vanilla JS + CSS, edited in place and pushed with the Shopify
CLI. Tooling present on this machine: Shopify CLI 4.8.5, Node v24.4.0.

```
assets/     flat — CSS, JS, SVG (Shopify requires flat)
sections/   page-level blocks the merchant can add/reorder   (73 files, 25 custom)
snippets/   reusable partials                                (50 files, 11 custom)
templates/  JSON saying which sections each page type uses
layout/     theme.liquid — the HTML shell for every page
config/     settings_schema.json (what's configurable) / settings_data.json (live values)
locales/    translations (2 custom keys: pt_select_option, pt_choose_option)

docs/            ← our docs.  NOT uploaded, ignored by theme-check
design-guides/   ← received design handoffs. Reference only. NOT uploaded
test-files/      ← scratch. NOT uploaded
```

## Themes on the store

| Theme | ID | Role |
|---|---|---|
| **Abimra live** | `206202339671` | what customers see |
| **Tees 3D staging** | `205932822871` | **push here** |
| Tees v1 backup | `205932790103` | frozen v1 snapshot — never push here |
| Tees staging | `204664865111` | v1 design system, known good |
| Tees dev | `204608307543` | old live theme, superseded |

```bash
shopify theme dev   --store aarm13-i0.myshopify.com
shopify theme check                                     # baseline: 13 warnings, 0 errors
shopify theme push  --store aarm13-i0.myshopify.com --theme 205932822871
shopify theme pull  --store aarm13-i0.myshopify.com --theme 205932822871
```

Deploying to live is a deliberate, separate act and the CLI refuses without the
flag. Pull live and diff it first; see `docs/theme-notes.md` ("Themes on the
store") for the full three-step procedure and the rollback ladder.

## Conventions

- **`ab-`** — design-system CSS classes. **`pt-`** — product-page behaviour.
- **`abmira-`** — built for this theme. **`abimra-`** — supplied handoff files,
  copied in byte-identical. The one transposed letter is meaningful.
- Capitalised **`Abimra`** is the brand. Lowercase **`abmira`** survives in
  setting ids, block types, filenames and CSS classes **on purpose** — see the
  hard rules below.
- Every edit to a Dawn file is marked `[abmira]` or `[custom]`. Grep for those
  before upgrading Dawn. Ten Dawn files are modified.
- **Mobile-first.** Base styles are phone styles; breakpoints add complexity at
  401 / 641 / 769 / 861 / 1025px.
- **Namespace everything.** Dawn already owns `.card` (306 rules), `.price`
  (69) and `.badge`.
- Restyle Dawn, don't replace it. Dawn still does cart AJAX, facets, variant
  resolution, search, recommendations and sliders.

## Hard rules

- **Never rename a setting id or a block type.** A renamed setting id orphans
  its saved value; a renamed block type breaks every template naming it.
- **Do not edit the supplied files**: `assets/abimra-story.*`,
  `assets/abimra-menu.*`, `snippets/abimra-menu*.liquid`,
  `sections/abimra-brand-story.liquid`. Extend from outside, the way
  `assets/abmira-story-extras.js` does.
- **Do not delete `sections/main-cart-footer.liquid`.** It looks like a dead
  stub. Dawn's `cart.js` swaps its `.js-contents` on every cart change, and
  without it the cart silently stops responding.
- **`shopify theme push` with no `--only` sends `config/settings_data.json`**,
  which holds the one app embed (`sb-product-designer`). Prefer `--only`; if
  you push everything, load a product page and check `pd-boot.js` is still
  there.
- **Push a section before the config that uses it.** Shopify parses a template
  before it knows about a new setting or block type; pushing both at once
  fails with "pushed with errors".
- **Assume Dawn's JS has no null checks.** Four separate bugs were the same
  shape: Dawn looks up an element this redesign removed and throws inside a
  `.then()`, surfacing as nothing at all. When something silently half-works,
  look here first.

## Two landmines

**1. A system font unloads the entire design system.** Every Abimra addition
in `layout/theme.liquid` — the Google Fonts link, `abmira.css`, `abmira.js`,
`abmira-story-extras.js` *and* the `:root` token block — sits inside
`{%- unless settings.type_header_font.system? and settings.type_body_font.system? -%}`.
Set both theme fonts to a system font and the site loses its whole appearance,
with nothing in any console to explain it.

**2. Three brand colours have no fallback.** `--paper`, `--ink` and `--red` are
emitted from `settings.abmira_*` with no `| default:` guard, and are absent
from `config/settings_data.json` — they run on schema defaults.
`--ab-media-bg` and `--ab-card-pad` are guarded; those three are not.

## Cascade order, which bites constantly

`abmira.css` loads **before** Dawn's `base.css`, and Dawn stylesheets loaded by
a *section* land after it too. Dawn's rules are often single-class, so a bare
`.cart-notification` or `.as__ctas` rule of ours loses on source order. Scope
to two classes. Dawn also sets `color` directly on `h1`-`h5` and `a`, so a
component that only sets a colour on its container gets overridden — this has
caused invisible footer headings, ink-on-red button labels and grey product
titles.

## Current state

`main`, no other branches, **no git remote**. Five files are modified in the
working tree: a real bug fix for collection filtering/sorting, which was
**not** applied to `sections/abmira-search.liquid` and needs to be. See
`PROJECT_CONTEXT.md` ("Current state") before starting anything.
