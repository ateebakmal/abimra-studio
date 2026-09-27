# Task: replace the theme's mobile menu with the Abimra Studio animated menu

You're working in the Shopify theme repository for **Abimra Studio** (spelled exactly that way), a UK custom t-shirt and hoodie store. Most customers shop on their phones.

Your job in this session is **one thing only**: on mobile and tablet, replace the theme's existing menu button and menu drawer with the Abimra animated full-screen menu. **Desktop navigation stays exactly as it is.**

The menu is already built and tested. You are integrating it into this theme, not designing or rewriting it.

Everything you need is in the handoff folder next to this file:

| Path | What it is |
|---|---|
| `theme-files/snippets/abimra-menu.liquid` | The full-screen menu overlay: top bar (logo, bag, close), the links from a Shopify menu, the red "Design your own" button, and Returns and Contact us links. |
| `theme-files/snippets/abimra-menu-button.liquid` | The "Menu" pill that opens it. |
| `theme-files/assets/abimra-menu.css` / `abimra-menu.js` | Styles and behaviour. Every class is namespaced `am-`. Vanilla JS, no dependencies. |
| `theme-files/header-schema-settings.json` | Settings to add to the header section's schema, so the client can edit the menu in the theme editor. |
| `theme-files/snippets/abimra-fonts.liquid` + `theme-files/assets/*.woff2` | Self-hosted Archivo (with its width axis) and IBM Plex Mono. **Skip these if they're already installed**, for example from the brand story section. |
| `SPEC.md` | How it behaves and what it needs from the theme. **Read it before you change anything.** |
| `reference/menu-preview.html` | Both snippets rendered by a real Liquid engine with a sample menu. Open it in a browser at phone width: this is the target. |
| `reference/screens/` | Screenshots: closed, mid-wipe, open, a tapped link, current page, reduced motion, 360px, 768px. |
| `reference/approved-design-before-changes.png` | The earlier version, for context only. SPEC.md lists what changed since then. Build what's in `theme-files/`, not this picture. |

## Ground rules
1. **Don't redesign, re-time, rename or refactor** the menu. Keep class names, data attributes, the element ID (`abimra-menu`) and timings exactly as supplied.
2. **Desktop stays untouched.** Only the mobile and tablet menu changes.
3. **Don't delete the theme's own drawer code** (snippets, JS, CSS). Stop rendering it where our menu replaces it, and tell me which files it lives in. I'll decide later whether to remove them.
4. **No new libraries or build steps.** Keep the CSS and JS as separate files in `assets/`. The menu snippet loads them.
5. **Mobile first.** Test at 390×844, 360×740, 768×1024 and a phone in landscape (844×390).
6. **Plan first.** Inspect, send me a short plan, and wait for my go-ahead before editing.

## Step 1: inspect (read only) and report
- **Header:** which file renders it (for example `sections/header.liquid`), where the mobile menu button sits, and the breakpoint at which the theme swaps desktop links for that button.
- **The theme's current mobile drawer:** its markup, JS and CSS files, and whether its JS will throw errors if its toggle or drawer isn't on the page.
- **Header measurements on mobile:** height, horizontal padding, and its `z-index`. List the theme's other `z-index` values too (cart drawer, modals, announcement bar), so the menu can sit above the header without covering things that should stay on top.
- **The logo:** is it text, an SVG, or an uploaded image (`settings.logo`)? The menu is dark (`#191813`), so it needs a light version of the logo.
- **The cart:** does the bag icon open a cart drawer or go to `/cart`? How is the item count updated after "add to cart" (events, section rendering)?
- **Navigation:** what's in the main menu (Online Store > Navigation)? Are there child links under any item?
- **Fonts and colour tokens:** as in SPEC.md.
- **Scroll locking:** does the theme already lock scrolling for its drawers with a class on `html` or `body`? Could it clash with ours (`html.am-lock`)?

## Step 2: add the files
1. Copy the two menu snippets to `snippets/` and the two menu assets to `assets/`.
2. Fonts, only if they're missing: copy the `.woff2` files and `abimra-fonts.liquid`, and render `{% render 'abimra-fonts' %}` in `<head>` in `layout/theme.liquid`.
3. Merge the settings from `header-schema-settings.json` into the header section's `{% schema %}` `settings` array. Keep every existing setting.

## Step 3: wire it in
1. **Button:** in the header, render `{% render 'abimra-menu-button' %}` where the theme's mobile menu button is, and stop rendering the theme's own button there. Use the theme's existing responsive rules so the pill only shows below the desktop breakpoint.
2. **Overlay:** render the overlay **once**, at the end of the header section's markup:
   ```liquid
   {% render 'abimra-menu',
     menu: section.settings.abimra_menu,
     cta_label: section.settings.abimra_cta_label,
     cta_link: section.settings.abimra_cta_link,
     returns_link: section.settings.abimra_returns_link,
     contact_link: section.settings.abimra_contact_link,
     logo_mark: section.settings.abimra_logo_mark,
     breakpoint: 990
   %}
   ```
   Set `breakpoint` to the theme's real desktop breakpoint in pixels. The menu closes itself if the window grows past it.
3. **Match the header:** set `--am-hdr` (the height of the menu's own top bar) and `--am-pad` (its side padding) to the theme's mobile header values, and `--am-z` so the overlay sits above the header. Do this in a small scoped rule in `abimra-menu.css`, or with the theme's own variables if it has them. When the menu opens, its logo, bag and close button should line up with the header's logo, bag and Menu pill.
4. **Logo:** if the theme's logo is an image, replace the contents of `.am-logo` with the same logo, as a light version suitable for a dark background. If there's no light version, tell me rather than inverting it with a CSS filter.
5. **Bag:** keep `[data-am-count]` in sync with the theme's cart count, using the same mechanism the header uses. If the theme opens a cart drawer, tapping the bag should close the menu (`AbimraMenu.close()`) and then open the drawer. Otherwise leave it linking to `/cart`.
6. **Colour tokens:** map the theme's variables if they use different names. The CSS has hex fallbacks.

## Step 4: test and report each item
On a phone first, then tablet, then desktop:
- [ ] The Menu pill shows on mobile and tablet only. Desktop navigation is unchanged.
- [ ] Tapping Menu: a paper-and-red squeegee blade pulls the dark menu down the screen in about 0.6s. The five big outline links rise in one after another, the close button spins in, then the red "Design your own" block and the Returns / Contact us links fade up. Compare with `reference/screens/`.
- [ ] Links come from the Shopify menu. The current page's link shows in solid red. Tapping a link fills it in, closes the menu and navigates.
- [ ] The close button (an X in a circle, no text), the Escape key, and resizing to desktop width all close the menu. After closing, focus goes back to the Menu pill.
- [ ] While open, the page behind doesn't scroll (check on iOS Safari), and Tab stays inside the menu.
- [ ] Landscape phone: the menu content scrolls inside the menu and nothing is cut off.
- [ ] iPhone with a notch: the top bar clears the status bar, and the bottom links clear the home indicator.
- [ ] Reduce motion on: the menu fades in and out with no wipe.
- [ ] The bag count matches the header's, and the bag tap behaves as described in step 3.
- [ ] Theme editor: header setting changes show up, and re-rendering the header doesn't break the menu.
- [ ] VoiceOver or TalkBack announces a dialog called "Menu", and the pill reports expanded or collapsed.
- [ ] No console errors, including from the theme's old drawer JS.
- [ ] Lighthouse mobile: no drop in Performance or Accessibility.

## Report back with
The files changed (a diff summary), what you found in step 1, anything you had to override and why, the checklist results, screenshots of the open menu at 390px and 768px, and any decisions you need from me (the logo, the cart drawer, child links in the menu, the old drawer files).
