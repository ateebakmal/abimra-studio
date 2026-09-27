# SPEC: Abimra Studio animated mobile menu

## What it is
On mobile and tablet, a "Menu" pill in the header opens a dark, full-screen menu. A squeegee blade (paper-coloured with a red edge, the brand's print motif) pulls the menu down the screen. Huge outline link words rise in one by one, and each one fills in when tapped. A single red "Design your own" block sits under the links, with Returns and Contact us at the bottom.

## What changed from the earlier version (reference/approved-design-before-changes.png)
- The close control is an **X icon in a circle**, with no "Close" text.
- The **row of garment chips (T-shirts, Hoodies and so on) is removed.**
- The red block shows **only the words "Design your own", centred**: no tee picture, no description line, no price, no arrow.
- The bottom links are **only Returns and Contact us.**
- The **registration-mark decorations in the corners are removed.** The logo in the top bar keeps its mark (toggle: `abimra_logo_mark`).

## Structure
```
#abimra-menu.am-menu            fixed, full screen, role=dialog, aria-modal
  .am-blade                     the squeegee that animates on open
  .am-top                       logo, bag with count, close button (height --am-hdr)
  .am-body                      scrolls if the screen is short
    nav.am-links > a.am-link    one per top-level menu link: number, word, arrow
    a.am-card                   "Design your own"
    .am-foot                    Returns, Contact us
```

## Timing (from tapping Menu)
| Time | What happens |
|---|---|
| 0 – 0.6s | The menu is revealed top to bottom (clip-path), with the blade riding the edge. |
| 0.28s + 0.05s per link | Each link word rises from below its line (0.7s each). |
| 0.38s | The close button spins in (rotates from −90°, scales from 0.6, with a slight overshoot). |
| 0.5s | The red block fades up. The footer links follow at 0.58s. |
| 0.85s | A light shine sweeps once across the red block. |
| Closing | Reverse wipe in 0.45s. Focus returns to the Menu pill. |

## Behaviour
- **Opens** from any element with `data-am-open`. It uses one delegated listener, so buttons re-rendered by the theme editor keep working.
- **Closes** on the close button, Escape, tapping any link (navigation continues as normal), resizing past `data-breakpoint`, or the back/forward cache restoring the page.
- While open: page scroll is locked with `html.am-lock`, Tab and Shift+Tab stay inside the menu, the overlay is not `inert`, and the button's `aria-expanded` is `true`. While closed the overlay is `inert` and `aria-hidden`.
- **The current page:** links with `link.active` or `link.child_active` get `.is-here` and show in solid red.
- **Hover effects** only apply on devices that can hover (`@media (hover:hover)`), so a tap never leaves a stuck hover state on phones.
- **Reduce motion:** a short fade instead of the wipe, with no rising or spinning.
- **Events and API:** `abimra:menu:open` and `abimra:menu:close` on `document`; `window.AbimraMenu.open()` and `.close()`.

## Inputs (snippet parameters, all optional)
| Parameter | Default | Notes |
|---|---|---|
| `menu` | `'main-menu'` | A `link_list` setting or a menu handle. **Top-level links only.** |
| `cta_label` / `cta_link` | "Design your own" / all products | Point the link at the Customify designer page. |
| `returns_link` | the store's refund policy, then `/policies/refund-policy` | |
| `contact_link` | `/pages/contact` | |
| `returns_label` / `contact_label` | "Returns" / "Contact us" | |
| `logo_mark` | shown | Pass `false` to hide the logo mark in the menu. |
| `breakpoint` | `990` | The theme's desktop breakpoint in px. |

## CSS custom properties
- `--am-hdr`: top bar height (default 62px). Match the mobile header.
- `--am-pad`: side padding (default 20px).
- `--am-z`: stacking level (default 1000). Must be above the header.
- Tokens `--paper`, `--ink`, `--red`, `--graphite`, with fallbacks `#EEEAE0`, `#191813`, `#D42E12`, `#5F5B52`.

## Needs from the theme
- Archivo with the width axis (the links use `font-stretch: 75%`) and IBM Plex Mono 500 (the link numbers and the Menu label).
- No transform, filter or `contain` on an ancestor of `#abimra-menu`, because that breaks `position: fixed`. Rendering it at the end of the header section is normally fine. If the header uses transforms (for example a hide-on-scroll animation), render the snippet somewhere outside it instead, such as in `layout/theme.liquid` straight after the header group.

## Performance
About 8.5 KB of CSS and 4 KB of JS unminified, with no dependencies and no images. The animation only uses clip-path, transforms and opacity, and nothing runs while the menu is closed.
