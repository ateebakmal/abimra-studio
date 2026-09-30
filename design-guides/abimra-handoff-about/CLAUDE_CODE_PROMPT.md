# Task: build the Abimra Studio About page

You're working in the Shopify theme repository for **Abimra Studio** (spelled exactly that way), a UK custom t-shirt and hoodie print studio. Most customers shop on their phones.

Your job in this session is **one thing only**: add the About page. It's made of six new sections and a page template. The design is finished and tested; you are integrating it into this theme, not redesigning it.

Everything you need is in the handoff folder next to this file:

| Path | What it is |
|---|---|
| `theme-files/sections/abimra-about-*.liquid` | Six sections: hero, process ("From your screen to your shoulders"), facts, story ("How it started"), say hello, closer. All copy is editable in the theme editor. |
| `theme-files/templates/page.about.json` | A page template that places the six sections in order with all the default content. |
| `theme-files/assets/abimra-about.css` / `abimra-about.js` | Shared styles and motion. Every class is prefixed `abt-` and scoped under `.abt`. Vanilla JS, no dependencies, safe to load from several sections at once. |
| `theme-files/snippets/abimra-fonts.liquid` + `theme-files/assets/*.woff2` | Self-hosted Archivo (with its width axis) and IBM Plex Mono. **Skip these if they're already installed** from an earlier handoff. |
| `SPEC.md` | How each section behaves and what it needs from the theme. **Read it before you change anything.** |
| `reference/about-design.html` | The approved design as a single page. Open it at phone width and at desktop width: this is the target. Its header and footer are stand-ins; use the theme's own. |
| `reference/about-sections-preview.html` | The six section files rendered by a real Liquid engine with the template's content, between a stand-in header and footer. It should match the design. |
| `reference/screens/` | Screenshots of each section on mobile (390×844) and desktop (1440×900). |

## Ground rules
1. **Don't redesign, re-time, rename or refactor** the sections, classes, settings or motion. Keep the `abt-` class names exactly, because the CSS and JS depend on them.
2. **Use the theme's own header and footer.** Don't copy the stand-ins from the reference files.
3. **Don't touch other templates or sections.** If a theme rule has to change for this page to work, make the smallest scoped change and tell me what and why.
4. **No new libraries or build steps.** Keep the CSS and JS as separate files in `assets/`.
5. **Mobile first.** Test at 360×740, 390×844, 768×1024, 1024×768 and 1440×900, plus a phone in landscape.
6. **Plan first.** Inspect, send me a short plan, and wait for my go-ahead before editing.

## Step 1: inspect (read only) and report
- **Theme type:** Online Store 2.0 with JSON templates? Is there already a `templates/page.about.json` or another template assigned to the About page?
- **Header:** is it sticky, and what's its height on mobile and desktop? Is there a CSS variable for it? (The hero fills the screen under the header, and the process heading pins just under it.)
- **Section wrappers:** does the theme add padding, a max-width container or scroll-reveal classes to sections? These sections are full-bleed and bring their own spacing.
- **Ancestors with `overflow: hidden | auto | scroll`**, which would stop the pinned heading in the process section from sticking.
- **Fonts and colour tokens:** as in SPEC.md.
- **Global CSS that could collide** with elements inside `.abt`: rules on bare `section`, `h1`–`h3`, `p`, `ol`, `ul`, `li`, `a`, `b`, `em`, `mark`, `img`, `svg`.

## Step 2: add the files
1. Copy the six sections to `sections/`, the template to `templates/`, and `abimra-about.css` / `abimra-about.js` to `assets/`.
2. Fonts, only if they're missing: copy the `.woff2` files and `abimra-fonts.liquid`, and render `{% render 'abimra-fonts' %}` in `<head>` in `layout/theme.liquid`.
3. **Header height:** make `--abt-top` equal the theme's sticky header height at every breakpoint, preferably by pointing it at the theme's existing variable, for example `.abt{--abt-top:var(--header-height)}`. If there's no variable, use a small scoped rule with media queries, and tell me the values.
4. **Colour tokens:** map the theme's variables if they use different names. The CSS has hex fallbacks.
5. Neutralise any global rule from step 1 that collides with `.abt` elements, scoped to `.abt`.

## Step 3: test and report each item
Use `shopify theme dev` and open a page that uses the `page.about` template. (I'll assign the template to the real About page in the admin: Online Store > Pages > About > Theme template.)

- [ ] **Hero:** fills the first screen under the header on phones and desktop. The red layer of "WE PRINT / WHAT YOU / MAKE." slides into register on load. Intro, buttons and the "Scroll" cue sit below. Compare with `reference/screens/*-01-hero.png`.
- [ ] **Process:** on desktop the heading stays pinned on the left while the four steps scroll past on the right. On phones the steps run down the page. On both, the red line fills as you scroll, and each step lights up when the line reaches it. Unreached steps are dimmed.
- [ ] **Facts:** a 2 × 2 grid on phones and tablets, and one row of four from 1000px. All four big words are the same size, and each one's red layer slides into place when the strip scrolls into view.
- [ ] **Story:** the photo and copy sit side by side from 900px and stack on phones. With no photo chosen it shows a placeholder and a size note. Anything still in [square brackets] shows in red with a dashed underline.
- [ ] **Say hello:** three cards, stacked on phones and in a row on desktop. Email and handle text stay lowercase.
- [ ] **Closer:** a red panel, with a beige button and dark text on it.
- [ ] Buttons keep their colours: red with white text, outline with dark text, beige with dark text.
- [ ] No horizontal scrolling at any size. The big words never overflow their space.
- [ ] Reduce motion on: everything shows immediately, with no sliding or fading.
- [ ] **Theme editor:** each section appears under its "About: …" name. Editing text, reordering steps, facts and cards, and adding or removing sections all work without errors, and the motion still works afterwards.
- [ ] No console errors. Other pages are unchanged.
- [ ] Lighthouse mobile on the About page: report Performance, Accessibility and CLS.

## Report back with
The files you created or changed (a diff summary), what you found in step 1, anything you overrode and why, the checklist results, and screenshots of each section at 390px and 1440px.
