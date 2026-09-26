# Task: add the Abimra Studio brand story section under the homepage hero

You're working in the Shopify theme repository for **Abimra Studio** (spelled exactly that way: A-B-I-M-R-A), a UK custom t-shirt and hoodie store. Visitors design their own garments with the Customify app, and we print them to order.

Your job in this session is **one thing only**: add a scroll-driven brand story section ("Blank to yours") to the homepage, directly under the hero. The section is already fully built and tested. You are integrating it into this theme, not designing or rewriting it.

Everything you need is in the handoff folder next to this file (`abimra-handoff/`, or wherever this file lives):

| Path | What it is |
|---|---|
| `theme-files/sections/abimra-brand-story.liquid` | The finished section: markup, Liquid settings and schema. |
| `theme-files/assets/abimra-story.css` | Section styles. Every class is namespaced under `.as` / `as__`. |
| `theme-files/assets/abimra-story.js` | Section behaviour. Vanilla JS, no dependencies, handles the Shopify theme editor events. |
| `theme-files/snippets/abimra-fonts.liquid` + `theme-files/assets/*.woff2` | Self-hosted Archivo (variable, with width axis) and IBM Plex Mono 500. Only needed if the theme doesn't already load them this way. |
| `SPEC.md` | What the section does, its timeline, and the technical requirements it has of the page. **Read this before you change anything.** |
| `reference/standalone-preview.html` | The section file rendered exactly as Liquid would, with defaults and a 64px sticky header. Open it in a browser: this is the target. |
| `reference/screens/` | 16 screenshots, 8 chapters on desktop (1440×900) and mobile (390×844). Compare your result against these. |
| `reference/full-homepage-demo.html` | The complete homepage design, for context on where the section sits. Only the story section is in scope now. |

## Ground rules

1. **Do not rewrite, refactor, "clean up" or re-time the animation.** Don't port it to GSAP, a framework, the theme's animation system or anything else. Keep every class name, data attribute, ID pattern and timing value exactly as supplied. The JS reads the markup by those names.
2. **Do not touch other sections, templates or features** beyond what's listed below. If something else in the theme has to change for this to work (for example an `overflow` rule on a wrapper), make the smallest possible change, scope it so it can't affect other pages, and tell me exactly what you changed and why.
3. **No new libraries or build steps.** Keep the CSS and JS as separate files in `assets/`, loaded by the section itself, so they only load on pages that use the section.
4. **Mobile first.** Most customers are on phones. Test at 390×844 and 360×740 before desktop.
5. **Ask before deleting anything.** In particular, if the homepage already has a "how it works" or steps section that repeats this story, don't remove it. Tell me it's there and ask.
6. **Plan first.** Before editing, inspect the theme and send me a short plan (the files you'll touch, what you found about the header, fonts and overflow, and anything that looks risky). Wait for my go-ahead.

## Step 1: inspect the theme (read only)

Look at, and report back on:

- **Theme type:** Online Store 2.0 (JSON templates)? Where is the homepage template (`templates/index.json`), and which section is the hero? Note its key in the `order` array.
- **Header:** Is it sticky? What's its height on desktop and on mobile? Does it hide while scrolling down and reappear on scroll up? Does the theme already expose its height as a CSS variable, and if so what's it called and where is it set? (See "Header offset" in SPEC.md for why this matters.)
- **Overflow on ancestors:** `position: sticky` stops working if any ancestor of the section has `overflow: hidden`, `auto` or `scroll`. That includes `html`, `body`, `main`, `#MainContent`, the `.shopify-section` wrapper and any page wrappers. List every ancestor rule that sets overflow. `body { overflow-x: hidden }` is the usual culprit.
- **Fonts:** Does the theme already load **Archivo with its width axis** (font-stretch 62%–125%) and **IBM Plex Mono 500**? Loading Archivo through Shopify's font picker, or as fixed weights only, is not enough: the section needs the condensed width (`font-stretch: 75%`).
- **Colour tokens:** Does the theme define `--paper`, `--ink`, `--red`, `--graphite`, or other names for the same colours? The palette is paper `#EEEAE0`, ink `#191813`, red `#D42E12`, graphite `#5F5B52`.
- **Global CSS that could collide:** rules on bare `section`, `p`, `h2`, `ol`, `svg`, `text`, `a`, `img, svg { max-width / height }`, `* { transition }`, and any scroll-reveal system (for example Dawn's `scroll-trigger` / `animate--*` classes, AOS or data-animate attributes) that might attach to this section.
- **How sections get their spacing:** Is there a wrapper that adds padding or a max-width container? This section must be **full-bleed**, edge to edge with no padding.

## Step 2: add the files

1. Copy `theme-files/sections/abimra-brand-story.liquid` to `sections/abimra-brand-story.liquid`.
2. Copy `theme-files/assets/abimra-story.css` and `theme-files/assets/abimra-story.js` to `assets/`.
3. **Fonts, only if step 1 showed they're missing or lack the width axis:** copy the four `.woff2` files to `assets/`, copy `theme-files/snippets/abimra-fonts.liquid` to `snippets/`, and render it once in `layout/theme.liquid` inside `<head>`, before the theme's main stylesheet: `{% render 'abimra-fonts' %}`. If the theme already defines an `Archivo` font face without the width axis, tell me before changing it, because two definitions of the same family can conflict.
4. **Colour tokens:** if the theme uses different variable names for the same colours, map them for this section only, for example in the section wrapper: `.section-abimra-story{--paper:var(--color-background)...}`. If there are no tokens, do nothing: the CSS has hex fallbacks.

## Step 3: wire it into the page

1. **Place it on the homepage:** in `templates/index.json`, add a section of type `abimra-brand-story` and put its key **immediately after the hero** in `order`. Use the schema defaults. Don't reorder anything else.
2. **Header offset:** the pinned stage must sit exactly under the sticky header (see SPEC.md).
   - If the header is always sticky and its height is available as a CSS variable, make `--as-offset` follow that variable (for example with a rule on `.section-abimra-story .as`). That's better than a fixed number because it stays right when the header height changes between breakpoints.
   - Otherwise set the section's **Sticky header height** setting in `index.json` to the measured height. If the header height differs between mobile and desktop, use a scoped CSS rule with a media query instead, and tell me.
   - If the header hides when scrolling down, the offset should be 0 while it's hidden. The simplest fix is 0 plus a note to me recommending the header stay visible. Don't build anything clever without asking.
3. **Overflow fix, only if step 1 found a blocking ancestor:** replace `overflow: hidden` with `overflow: clip` on that ancestor (same visual result, doesn't break sticky), or `overflow-x: clip` when only horizontal clipping was intended. Scope the change as narrowly as you can, and tell me what you changed.
4. **Full-bleed and no interference:** make sure the section's wrapper (`.section-abimra-story`, set by the schema) gets no theme padding, margin, max-width or scroll-reveal classes. Neutralise any global rule that collides with the section's elements, scoped to `.section-abimra-story` / `.as`.
5. **Links:** leave `cta_link` empty for now; it falls back to all products. Mention that I need to set it to the Customify designer product page.

## Step 4: test (report each item)

Run `shopify theme dev` and check the homepage.

**On a phone first (390×844 and 360×740), then desktop (1440×900 and 1280×800):**

- [ ] The section starts right after the hero. When its top reaches the header, the stage pins under the header with no gap and nothing hidden behind it.
- [ ] Scrolling plays the chapters in order, and scrolling back up plays them in reverse. Compare against `reference/screens/`:
  1. "START BLANK." in giant outline type, with a black tee rising in front of it.
  2. Rows of giant outline phrases sliding past, and "ABIMRA CLUB" turning red.
  3. Its letters flying one by one onto the tee's chest.
  4. Four photo snaps around the tee; one flies onto the chest above the words.
  5. A squeegee blade pulls down and turns the whole stage red, with "PULLED / IN INK." in beige and the print gaining a grainy texture.
  6. The tee shrinks into a wall of about 40 tees and hoodies with different designs.
  7. The wall dims and "MADE TO BE ADMIRED." appears with a "Design your own" button and a "Shop Studio Originals" link.
- [ ] The big type is **condensed** (narrow letters), matching the screenshots. If it looks wide, the width axis isn't loading.
- [ ] Captions appear bottom-left on desktop and bottom full-width on phones, and don't overlap the header.
- [ ] After the finale, the section releases and the next section scrolls up normally.
- [ ] No horizontal scrollbar or sideways wobble on phones at any point.
- [ ] Scrolling stays smooth on a mid-range phone, or at 4× CPU throttling in Chrome DevTools. There should be no long tasks while the section is off-screen: it pauses itself.
- [ ] With "reduce motion" on (macOS/iOS setting, or DevTools > Rendering > Emulate prefers-reduced-motion), the section shows one still final frame (red wall, tagline, buttons) with no pinning.
- [ ] **Theme editor:** the section appears as "Brand story". Editing text settings updates it. Moving, hiding and re-adding the section all work without errors or duplicated animation.
- [ ] Browser console shows no errors or warnings from the section.
- [ ] The rest of the homepage and other pages look exactly as before.
- [ ] Lighthouse mobile on the homepage: report the Performance score and CLS before and after.

## Report back with

- The files you created or changed (a diff summary).
- What you found in step 1: header, fonts, tokens and overflow.
- Any theme rule you had to override, and why.
- The test checklist with pass or fail against each item, and screenshots of chapters 1, 3, 5 and 7 on mobile.
- Anything you weren't sure about, or that I need to decide.
