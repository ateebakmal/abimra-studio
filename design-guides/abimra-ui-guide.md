# ABIMRA Studio — UI design guide

**For:** building the Shopify theme.
**Ship with this:** `abimra-tokens.css` (import first) and `abimra-mockup.html` (the reference build).
**Where this document and the mockup disagree, the mockup wins.** Its values are the ones that survived testing at fourteen viewport widths.

---

## 1. The idea

ABIMRA is a working print shop, not a boutique. The visual language comes from that world — ink on paper stock, registration marks, halftone, garment tags. The palette is built as **two inks on paper**, a red and a blue, because screen printing runs one colour per pass. Type is a heavy condensed grotesque: the skate and streetwear vernacular, never a serif.

One thing on each page is loud, and it's the headline. Everything else stays quiet, because the customer's own design should be the brightest thing on screen.

**Three deliberate moves away from the default.** Cream ground plus high-contrast serif display plus terracotta accent is the most common look in AI-generated design right now. We are off all three: newsprint `#EEEAE0` not cream, saturated press red not clay, condensed Archivo not a serif. Don't drift back.

---

## 2. Colour

```
--paper          #EEEAE0   page ground (newsprint)
--paper-raised   #F7F5EF   cards, panels, anything on paper
--white          #FFFFFF   product cutouts only, never a page ground
--ink            #191813   text, inverted bands — warm near-black, never #000
--graphite       #5F5B52   secondary text, captions, meta
--rule           #D6D1C4   hairlines, borders
--rule-inv       rgba(255,255,255,.14)   hairlines on dark

--red            #D42E12   ink one — primary CTA, active state, accent
--red-deep       #A32209   hover / pressed
--red-wash       #FBE7E1   tinted background, selected row
--blue           #1B4FA0   ink two — links, focus rings
--blue-wash      #E3EAF6

--ok             #2F6F4E   success, high resolution, in stock
--warn           #A9761A   caution, borderline resolution
--stop           #7E1B08   blocked, error, failed
```

**Photographic backdrops** — behind garments only, never on UI:
`--b-sand #E8E2D4` · `--b-stone #DCD9CF` · `--b-blue #E3EAF6` · `--b-red #FBE7E1` · `--b-sage #DFE7DC` · `--b-straw #EDE3C9`

**Editor canvas:** `--canvas-bg #E5E2DA`. Flat neutral, **never tinted** — the garment colour changes on top of it and a tint makes white shirts look dirty.

### Three rules that govern colour

1. **Red is a brand colour, never a state colour.** It means "click this." It never means "something is wrong." That's why `--stop` is a deep maroon — it has to read duller and darker than a CTA beside it.
2. **Blue appears at most twice per page.** It's the second screen pass, not a co-equal accent. Let it spread and the two-ink idea collapses into a generic palette.
3. **Every state pairs colour with an icon and a word.** Colour alone never carries meaning.

### Contrast against `--paper`

| Pair | Ratio | Use |
|---|---|---|
| ink | 15.1:1 | any size |
| graphite | 6.2:1 | any size |
| red | 4.7:1 | **16px and up only** |
| blue | 7.4:1 | any size |
| paper on ink | 15.1:1 | inverted bands |

Red fails at small sizes. Use it as a fill with white on top, or for display type — never a 14px link.

---

## 3. Typography

**One family, two settings.** Archivo is variable with a real width axis. Compressed and heavy it's a skate poster; at normal width and regular weight it's a clean interface face. One family for both loads faster and reads as more considered than a display/body pair.

```
Display    Archivo   wdth 82   wght 800   uppercase   letter-spacing -.02em
Interface  Archivo   wdth 100  wght 400 / 500 / 600
Numeric    IBM Plex Mono  wght 400 / 500
```

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Load the variable font once, set the axis per role with `font-variation-settings`. Don't load static weights — it defeats the point.

### Scale

| Class | Size | Line-height | Setting |
|---|---|---|---|
| `.d1` | 76px — hero overrides to `clamp(52px,6.6vw,88px)` | .86 | wdth 82, wght 800, upper |
| `.d2` | `clamp(34px,4.6vw,54px)` | .94 | wdth 82, wght 800, upper |
| `.d3` | 34px → 24px on phone | .95 | wdth 85, wght 800, upper |
| `.ttl` | 22px | 1.25 | wdth 100, wght 600 |
| body | 16px | 1.55 | wdth 100, wght 400 |
| `.hero-sub` | 17px, max 36ch | 1.55 | graphite |
| `.meta` | 14px | — | graphite |
| `.num` | 13px | 1.4 | Plex Mono, `tabular-nums` |

### Rules

- **Display type is uppercase. Labels, eyebrows and buttons are sentence case.** Tracked-out all-caps labels above every heading is the clearest template tell.
- Body copy under 72 characters per line; `.sec-head p` caps at 44ch.
- Mono is **functional only** — dimensions and DPI in the editor, order numbers, file names. Places where digits must stay aligned as a value changes. Never decorative.
- Section headings sit on one line. Don't `<br>` them.
- **One coloured word in a headline, total** — `.d1 .accent` on the hero's "Design". Adding a second breaks the rule.
- No arrow glyph after button labels. The verb does the work.

---

## 4. Space, shape, edges

```
--sec   124px / 92px ≤1024 / 64px ≤640    vertical section padding
--pm     40px / 32px ≤1024 / 20px ≤640    page margin
--mw   1200px                              content max width
```

4px space scale: `4 8 12 16 24 32 48 64 96 128`.

**Radius by role.** One radius on everything is the SaaS-kit look.

```
--r-card    20px   cards, panels, image blocks
--r-band    28px   inverted sections, the hero art panel
--r-input    8px   inputs, small controls
--r-pill   999px   buttons, tags, chips
```

Step cards use 24px, deliberately between card and band.

**Borders** are 1px `--rule`, 1.5px where an edge needs to hold its own (chips, text inputs, the step number ring).

**No shadows.** Separation comes from the paper/raised value difference and hairlines. A soft grey shadow under every rounded card is the most templated pattern on the web. The only exception in the system is a dragged layer in the editor, which is genuinely lifted.

---

## 5. Components

### Navigation

```css
.nav { position:sticky; top:0; z-index:50; background:var(--paper);
       border-bottom:1px solid var(--rule) }
.nav .wrap { height:74px; display:flex; align-items:center;
             justify-content:space-between; gap:24px }
.logo { font-size:20px; letter-spacing:.16em; text-transform:uppercase;
        font-variation-settings:'wdth' 92,'wght' 800 }
.nav-links { display:flex; gap:28px; font-size:15px;
             font-variation-settings:'wdth' 100,'wght' 500 }  /* hidden ≤860 */
```

> In the mockup this is `top:44px` to clear the page-switcher bar. **Use `top:0` in the theme.**

### Hero

Two columns, near-even split. Copy left, collage right.

```css
.hero      { padding:60px 0 54px }
.hero-grid { display:grid; grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);
             gap:48px; align-items:center }
```

The near-even split is load-bearing: at 0.9/1.1 the headline wrapped to three lines instead of two. Verify "DESIGN IT," still fits on one line after any change.

**Eyebrow** — a pulsing red dot plus one line of copy. `.eyebrow i` is 8px, `@keyframes pulse` 2.4s.

**Headline** — two `.ln` spans, each wrapping an inner span. The mask exists for the rise animation; `.d1.done .ln` restores `overflow:visible` afterwards so descenders aren't clipped.

**Proof row** — overlapping initial avatars (`.avs span`, 27px, `margin-left:-9px`, 2px paper border), then stars and order count.

**Feature row** — three items, outline icon plus a two-line label. One row down to tablet, wraps to two on phones.

```css
.hero-feats { display:flex; gap:30px; flex-wrap:wrap; margin-top:34px }
.hero-feat  { display:flex; align-items:flex-start; gap:10px; max-width:168px;
              font-size:14px; line-height:1.35; color:var(--graphite) }
```

**Collage panel** — the image sits on a dotted mat whose colour is sampled from the image's own background, so the two read as one surface.

```css
.hero-art { position:relative; border-radius:var(--r-band); overflow:hidden;
            padding:16px; background-color:#F3EFE5;
            background-image:radial-gradient(rgba(25,24,19,.10) 1.1px,transparent 1.1px);
            background-size:12px 12px }
.hero-art img { width:100%; height:auto; display:block; border-radius:18px }
```

If the collage is ever re-exported, **resample its background colour and update `background-color`**, or a visible rectangle appears around it.

### Buttons

```css
.btn    { min-height:46px; padding:0 24px; border-radius:var(--r-pill);
          font-size:16px; font-variation-settings:'wdth' 100,'wght' 500 }
.btn-p  { background:var(--red); color:#fff }            /* one per view */
.btn-p:hover { background:var(--red-deep) }
.btn-s  { border:1px solid var(--ink); color:var(--ink) }
.btn-s:hover { background:var(--ink); color:var(--paper) }
.btn-i  { background:var(--paper); color:var(--ink) }    /* on dark bands */
.btn-sm { min-height:38px; padding:0 16px; font-size:14px }
.btn:focus-visible { outline:2px solid var(--blue); outline-offset:2px }
```

Hover darkens the fill. No lift, no scale, no shadow.

### Section header

```css
.sec      { padding:var(--sec) 0 }
.sec-head { display:flex; flex-direction:column; align-items:flex-start;
            gap:16px; margin-bottom:54px }
.sec-head p { max-width:44ch; font-size:16px; line-height:1.6 }
```

That 54px matters. Heavy condensed caps need more room beneath them than a serif does — at 38px the page read as cluttered.

### Marquee

Sits on the page ground with hairlines above and below, **not** a raised strip. Masked at both edges so items fade rather than getting cut. Separator is a registration mark in press red, inline SVG data URI. 17px type, 52s loop, pauses on hover.

Content is capabilities, not slogans — what the tool does, dispatch speed, that group orders exist.

### Steps

Three cards; the middle one is inverted. Number sits in an outlined circle overlapping the illustration.

```css
.steps     { display:grid; grid-template-columns:repeat(3,1fr); gap:18px }
.step      { background:var(--paper-raised); border:1px solid var(--rule);
             border-radius:24px; padding:22px }
.step.dark { background:var(--ink); color:var(--paper); border-color:var(--ink) }
.step-n    { position:absolute; top:26px; left:26px; width:46px; height:46px;
             border-radius:50%; border:1.5px solid var(--ink) }
```

| Width | Layout | Illustration |
|---|---|---|
| >860 | 3 columns, vertical card | 221px |
| 401–860 | 1 column, image left / text right | 168px → 124px at ≤640 |
| ≤400 | 1 column, image centred above text | 186px |

That bottom row exists because at 320px the horizontal layout squeezed the text column to 107px.

### Photo card with credit badge

```css
.worn-row { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px }
.ph       { position:relative; border-radius:20px; overflow:hidden; aspect-ratio:3/4 }
.ph img   { width:100%; height:100%; object-fit:cover }
.ph-cap   { position:absolute; left:11px; right:11px; bottom:11px;
            background:rgba(247,245,239,.94); border-radius:13px; padding:9px 10px;
            display:flex; align-items:center; gap:10px }
.ph-tick  { margin-left:auto; width:23px; height:23px; border-radius:50%;
            background:var(--ink); color:var(--paper) }
```

The credit badge is the most valuable component on the site. "Designed by Mei L. — Heavy hoodie, bone" proves these are customer designs rather than stock, and teaches the business model before anyone reads a word. Below 640px the "Designed by " prefix hides (`.ph-by{display:none}`) so the name stays on one line.

### Product and category carousels

```css
.grid4, .cat {
  display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory;
  scrollbar-width:none;
  margin-inline:calc(var(--pm) * -1);   /* bleed to the screen edge */
  padding-inline:var(--pm);             /* first card stays on the grid */
  padding-bottom:6px;
}
.grid4 > *, .cat > * { flex:0 0 288px; scroll-snap-align:start }
```

**These scroll at every width, not just mobile.** At 1280+ four cards fit without scrolling; below that they scroll and the next card peeks at the edge. That peek is the affordance — no arrows, no dots. On phones cards drop to 63% / 57% and the gap to 12px.

The negative-inline-margin trick is what makes it feel native rather than boxed. Don't remove it.

`.cat a` is `min-height:232px` — at 190 it read squat beside the product cards.

### Testimonials

Desktop is a scatter: three cards, slight rotation, middle one inverted and pulled down, overlapping via negative margin. Hover straightens a card.

```css
.quote:nth-child(1){ transform:rotate(-2deg);  z-index:1 }
.quote:nth-child(2){ transform:rotate(1.5deg); margin:36px -18px 0; z-index:3 }
.quote:nth-child(3){ transform:rotate(-1deg);  z-index:2 }
```

**Below 768px it becomes a swipeable deck.** All three cards occupy one grid cell (`grid-area:1/1`), stacked with rotation and scale. Swipe the front card either way and it flies off to the back; tap it and the deck advances; the dots jump to any card and carry the keyboard route.

Two things that make it work, both learned the hard way:
- Cards are **equal height** (`align-self:stretch`, attribution pinned with `margin-top:auto`). Otherwise how far each card peeks below is set by quote length rather than by the offsets, and the stack looks random.
- **No opacity on the stack.** See §7.

A card behind is physically unreachable by tap, so the front card advances the deck and the dots handle direct access. Don't wire tap-to-front on buried cards — it tests fine with synthetic clicks and is impossible for a real finger.

### Closing band

Dark band, centred, red logomark above a `.d1` headline, sub at 46ch, inverted pill button, 14px dot texture at 14% white.

```css
.closer      { position:relative; overflow:hidden; padding:104px 40px; text-align:center }
.closer-in   { max-width:760px; margin:0 auto }
.closer-mark { width:62px; fill:var(--red); margin:0 auto 26px; display:block }
```

---

## 6. Motion

**One orchestrated moment per page.** The hero headline rises out of its mask (`translateY(108%)` → none, 950ms, second line delayed 120ms), then reveals fire on everything below.

```css
.rv    { opacity:0; transform:translateY(22px);
         transition:opacity .75s var(--e), transform .75s var(--e) }
.rv.in { opacity:1; transform:none }
.rv-1 { transition-delay:.08s }   .rv-2 { .16s }   .rv-3 { .24s }
```

IntersectionObserver at `threshold:.18`, unobserved after firing.

Everything else responds to action: 120ms hover colour, 200ms panel open, 320ms deck shuffle. Easing is `cubic-bezier(.22,.61,.36,1)` throughout. All wrapped in `@media (prefers-reduced-motion: reduce)`.

> ⚠️ Reveal-delay classes are `.rv-1/.rv-2/.rv-3`. **Never name them `.d1/.d2/.d3`** — those are the display type scale, and the hero subline will inherit an 84px uppercase headline style. This happened once.

---

## 7. Responsive strategy

Breakpoints: **1024 / 860 / 768 / 640 / 400**

| Width | What changes |
|---|---|
| 1024 | hero stacks, spacing steps down, nav links shrink, editor page narrows |
| 860 | nav links hide, steps go single-column horizontal, editor page stacks |
| 768 | testimonials switch from scatter to swipeable deck |
| 640 | phone spacing, carousel cards narrow, photo captions compress |
| 400 | step cards return to vertical |

The mockup is **desktop-first** (`max-width`) because it grew that way. **Write the theme mobile-first (`min-width`)** — base styles become the mobile styles and complexity adds upward. Cheaper now than retrofitted later.

### Three bugs that will recur

**1. `1fr` will not shrink below content.** `grid-template-columns:1fr 1fr` means `minmax(auto,1fr)`, and `auto` floors at min-content. "SWEATSHIRTS" in 26px condensed is wider than half a phone screen, so the grid overflowed the viewport by 58px. **Always write `minmax(0,1fr)`.**

**2. Never animate opacity on overlapping opaque panels.** The review deck had back cards at `opacity:.84`, which made them see-through — you could read the card behind through the one in front mid-animation. If a back layer needs dimming, put a scrim inside it; don't fade the element.

**3. Count your braces.** A `@media(prefers-reduced-motion)` block lost its closing brace and silently swallowed every rule after it, including the mobile nav hiding. Nothing errors — the rules just stop applying. Worth a build-time check.

### Test method

Headless browser, every page at each width, flagging any element whose right edge exceeds `documentElement.clientWidth`, skipping anything inside an `overflow-x` container. Catches what eyeballing misses.

Current build passes clean at **1440 / 1280 / 1180 / 1024 / 900 / 834 / 768 / 700 / 640 / 480 / 412 / 390 / 360 / 320**.

---

## 8. Page structure and Shopify mapping

Homepage order: nav → hero → marquee → steps → designed and worn → customise apparel → studio originals → worn and reviewed → closing band → footer.

| Section | Schema settings |
|---|---|
| Hero | eyebrow, headline lines, accent word, sub, two CTAs, rating text, 3 feature blocks (icon/label), collage image + its background colour |
| Marquee | repeater of text items, speed |
| Steps | 3 blocks: number, image, heading, body; which block inverts |
| Designed and worn | 3 image blocks: image, name, garment line |
| Customise apparel | collection, per-block background colour |
| Studio Originals | collection, card count |
| Worn and reviewed | 3 blocks: stars, quote, initials, name, garment |
| Closing band | headline, sub, CTA |

**Theme settings:** expose `--paper`, `--ink` and `--red` only. Everything else stays fixed or the system drifts.

Garment SVGs (`#tee`, `#hood`) live in a snippet as `<symbol>` definitions, used with `<use href="#tee">` and coloured through a `--g` custom property. Swap for real flat mockups when they exist — same aspect ratio, same slots.

---

## 9. Do / don't

**Do**
- Let the headline be the loudest thing on the page
- Separate with value and hairlines, not shadow
- Keep blue to two appearances per page
- Sentence case everywhere except display headings
- Write `minmax(0,1fr)` on every grid track
- Pair every state colour with an icon and a word

**Don't**
- Use `--red` for error states
- Put drop shadows on cards
- Set tracked-out all-caps eyebrow labels
- Append arrows to button text
- Use mono as a decorative label face
- Apply one radius to everything
- Tint the editor canvas background
- Use more than two print-furniture devices on a page
- Fade overlapping opaque panels

---

## Appendix A — print furniture

Decorative vocabulary, all CSS or inline SVG, no assets:

- **Registration mark** — crosshair in a circle, red. The marquee separator; also section corners.
- **Colour bar** — `.bar span { width:40px; height:8px }`, a strip of swatches as a divider.
- **Halftone** — `radial-gradient(var(--ink) 1px, transparent 1px)` at `8px`, 7% opacity, behind a headline.
- **Print grid** — same gradient at 12px, 10% opacity — this is the hero collage mat.
- **Screen mesh** — `repeating-linear-gradient(45deg, var(--ink) 0 1px, transparent 1px 5px)` at 3.5%.

Two per page. All five at once is a costume, not a system.

---

## Appendix B — what the hero used to hold

The hero previously held a **live mini-designer**: type a word and see it on a shirt, toggle tee/hoodie and garment colour, with a red squeegee sweeping across as the design wiped in. It was replaced by the collage image.

Recorded because it's the strongest unused idea in the project — it demonstrated the product rather than describing it, which is the entire pitch. If it returns, the natural home is the "Designed by you, printed by us" section, turning three explanatory cards into something a visitor can actually use. Its code is no longer in the mockup and would need rebuilding.
