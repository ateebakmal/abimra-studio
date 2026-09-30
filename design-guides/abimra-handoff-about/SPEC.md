# SPEC: Abimra Studio About page

## Page structure (templates/page.about.json)
| Order | Section file | What it shows | Editable |
|---|---|---|---|
| 1 | `abimra-about-hero` | Small label, a 3-line giant headline printed in two inks, intro, two buttons, a scroll cue. Fills the first screen under the header. | All text, both buttons and links, cue on/off |
| 2 | `abimra-about-process` | "From your screen / to your **shoulders.**" plus up to 6 steps, each with a title, text and a small tag. | Heading (3 parts), intro, step blocks |
| 3 | `abimra-about-facts` | A strip of up to 4 facts: a big word and a line underneath. | Fact blocks |
| 4 | `abimra-about-story` | "How it started": a 5:4 photo, story text (rich text), and a signature. | Photo, heading, rich text, initials, name, role, spacing |
| 5 | `abimra-about-hello` | "Say hello": up to 3 contact cards. | Heading, intro, card blocks (label, text, link, keep lowercase) |
| 6 | `abimra-about-closer` | Red panel: "What will / you make?" plus a button. | Heading (line breaks allowed), text, button |

## Motion (assets/abimra-about.js)
- **Hero:** each headline line has a red copy (`::before`, multiply) that starts offset by about 0.05em and slides almost into register over 1.4s after load, leaving a slight offset like a real two-colour print.
- **Reveal:** blocks with `.abt-rv` fade up 24px once, when they're 8% into the viewport.
- **Facts:** when the strip reveals, each word's red layer slides into register, staggered 0.12s apart.
- **Process:** `--p` (0–1) on `.abt-steps` drives the red line, measured from the top of the list to a point 55% down the screen. A step gets `.abt-on` (full opacity, red dot) when that point passes it. On desktop (900px and up) the heading is `position: sticky; top: calc(var(--abt-top) + 48px)`.
- The script only initialises once, however many sections include it, and re-runs after `shopify:section:load`.
- **Reduce motion:** everything is shown immediately.

## Layout breakpoints
- **Process:** a vertical list on every screen size. From 900px it's two columns, with the pinned heading on the left and each step getting at least 46vh of height.
- **Facts:** 2 × 2 grid up to 999px, then 4 in a row. The words are sized from the strip's width (container query units), so all four always match and never overflow.
- **Story:** stacked up to 899px, then two columns.
- **Say hello:** stacked up to 899px, then three columns.
- **Hero:** `min-height: calc(100svh - var(--abt-top))`. The headline is `clamp(52px, min(17.5vw, 19svh), 220px)`, so it fits both narrow and short screens.

## Needs from the theme
- `--abt-top` set to the sticky header height (default 0).
- Archivo with the width axis, and IBM Plex Mono 500.
- Optional colour tokens `--paper`, `--ink`, `--red`, `--graphite`, with fallbacks `#EEEAE0`, `#191813`, `#D42E12`, `#5F5B52`.
- No `overflow: hidden | auto | scroll` on ancestors of the process section. (The section itself uses `overflow: clip`, which doesn't break sticky.)

## Content notes
- **Placeholders:** any text in [square brackets] in the story, the signature name or the contact cards is wrapped in `<mark class="abt-fill">` and shows in red with a dashed underline, so unfinished copy can't slip through unnoticed.
- **Story photo:** 5:4 landscape, 2000 × 1600 px, JPG. Shopify serves the right size per device through `image_url` / `image_tag` widths.
- **Email card:** set its link to `mailto:you@yourdomain`.
