# Task: add the Abimra Studio "First pull" intro preloader

You're working in the Shopify theme repository for **Abimra Studio** (spelled exactly that way), a UK custom t-shirt and hoodie store. Most customers shop on their phones.

Your job in this session is **one thing only**: add the first-visit intro preloader. It's a short branded intro with a 3D t-shirt that plays once per visit while the store loads, then wipes away to reveal the page.

The preloader is already built and tested. You are integrating it into this theme, not designing or rewriting it.

Everything you need is in the handoff folder next to this file:

| Path | What it is |
|---|---|
| `theme-files/snippets/abimra-preloader.liquid` | The overlay markup, the visibility rules (theme editor, homepage-only, once per visit) and the asset loading. |
| `theme-files/assets/abimra-preloader.css` / `abimra-preloader.js` | Styles and behaviour. Every class is namespaced `apl`. Vanilla JS. |
| `theme-files/assets/three.min.js` | three.js r128 (MIT licence), used only for the 3D tee. The JS loads it **only when the intro actually plays**. Never add it to the theme's global scripts. |
| `theme-files/settings-schema-group.json` | A "Intro preloader" group for `config/settings_schema.json`. |
| `theme-files/snippets/abimra-fonts.liquid` + `theme-files/assets/*.woff2` | Self-hosted Archivo (with its width axis) and IBM Plex Mono. **Skip these if they're already installed**, for example from the brand story or the menu. |
| `SPEC.md` | How it behaves, its events, and what it needs from the theme. **Read it before you change anything.** |
| `reference/preloader-preview.html` | The snippet rendered by a real Liquid engine, with a stand-in hero that rises when the intro finishes. Open it in a browser from inside this folder (it loads three.js from `../theme-files/assets/`). It replays on every load. |
| `reference/screens/` | Screenshots on mobile (390×844) and desktop (1440×900): each loading stage, the exit wipe, the revealed hero, and reduce motion. |

## Ground rules
1. **Don't redesign, re-time, rename or refactor** the preloader. Keep class names, data attributes, the element ID (`abimra-preloader`), the sessionStorage key (`abimra:intro-seen`), the event names and the timings exactly as supplied.
2. **three.js stays lazy.** It's only requested by `abimra-preloader.js` when the intro plays. Don't preload it, bundle it, or load it anywhere else.
3. **Don't change the hero or any other section** in this task, except for the optional step 4, and only after I approve it.
4. **No new libraries or build steps.** Keep the CSS and JS as separate files in `assets/`.
5. **Mobile first.** Test on phone sizes first, and on a real phone if you can.
6. **Plan first.** Inspect, send me a short plan, and wait for my go-ahead before editing.

## Step 1: inspect (read only) and report
- `layout/theme.liquid`: where `<body>` opens, and what renders right after it (announcement bar, header group, skip links, cookie banner app blocks).
- **Any existing loader or page transition in the theme** (for example a "page loading animation" or "reveal on scroll" setting, or a spinner), and whether it would run at the same time.
- **The homepage hero:** does it have its own entrance animation, and how is it triggered (page load, scroll into view, a theme setting)? Anything that plays on page load will play *underneath* the intro and be missed. Just report this for now; see optional step 4.
- **Fonts and colour tokens:** as in SPEC.md.
- **z-index:** the highest values in the theme and any apps (cookie banners, chat widgets). The intro sits above everything at `2147483000` for a few seconds.
- **Scroll locking:** anything in the theme that sets `overflow` on `html` or `body` on page load, which could fight `html.apl-lock`.

## Step 2: add the files
1. Copy the snippet to `snippets/`, and the CSS, JS and `three.min.js` to `assets/`.
2. Add the object in `theme-files/settings-schema-group.json` as a **new group** in `config/settings_schema.json`, keeping everything else.
3. Fonts, only if they're missing: copy the `.woff2` files and `abimra-fonts.liquid`, and render `{% render 'abimra-fonts' %}` in `<head>`.
4. Colour tokens: map the theme's variables if they use different names. The CSS falls back to `#EEEAE0`, `#191813`, `#D42E12` and `#5F5B52`.

## Step 3: wire it in
1. In `layout/theme.liquid`, render `{% render 'abimra-preloader' %}` as the **very first thing inside `<body>`**, before skip links, the header group and any app embeds. It must be first so the overlay paints before the page underneath.
2. If step 1 found another page-load animation or loader that would run at the same time, tell me which one and how you plan to stop it running while the intro plays. Don't just delete it.

## Step 4 (optional, only after I approve it): hand the hero off to the intro
The intro announces when its exit wipe starts, and after that the hero's own entrance animation should begin, so the hero appears to rise out from under the squeegee.
- Listen for `abimra:intro:reveal` on `document`. If `document.documentElement` already has the class `intro-done` (the intro was skipped, already seen this visit, or not shown on this page), start straight away. SPEC.md has the exact snippet.
- Only hook into whatever entrance animation the hero already has. Don't invent a new one unless I ask.

## Step 5: test and report each item
Use `shopify theme dev`, and a **fresh private window** each time, since the intro plays once per visit.
- [ ] The homepage in a new private window shows the intro: the halftone dots, the corner registration marks drifting into line, and the 3D black tee with a squeegee making three passes. The counter goes 0 to 100 with its width stretching, and the status reads "Fetching your design", "Printing", "Shipping your order", then "Ready to wear", with the three-part bar filling. Then a squeegee wipe reveals the page. Compare with `reference/screens/`.
- [ ] Dragging spins the tee. Tapping the tee swaps it between black and white.
- [ ] "Skip intro" and the Escape key skip straight to the wipe.
- [ ] Reloading, or visiting another page in the same session, doesn't show the intro, and there's no flash of it.
- [ ] Setting "Where it can play" to Homepage only means no intro when landing directly on a product page. Setting it to Any page means it shows on the first page of the visit.
- [ ] Theme editor: never shows. Settings are visible under Theme settings > Intro preloader.
- [ ] Reduce motion on: a short, calm version with no 3D, which fades out.
- [ ] Data saver on (Chrome DevTools > Network conditions, or `navigator.connection.saveData`): no 3D and no `three.min.js` request.
- [ ] `three.min.js` is requested only when the intro plays: check the Network tab on the first and second page views.
- [ ] Page scrolling is locked during the intro and restored afterwards. The page underneath is fully usable after the wipe.
- [ ] No console errors. The hero and header look exactly as before.
- [ ] Lighthouse mobile on the homepage, before and after: report Performance, LCP, TBT and CLS. Lighthouse always gets a fresh session, so it always sees the intro.

## Report back with
The files changed (a diff summary), what you found in step 1, anything you had to override and why, the checklist results, screenshots of the intro at 390px, the Lighthouse numbers, and your recommendation for step 4.
