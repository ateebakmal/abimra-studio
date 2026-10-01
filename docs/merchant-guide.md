# Running the Abimra store

Written for whoever looks after this shop day to day. No code required —
everything here is done in the Shopify admin or the theme editor.

---

## Adding a product

### 1. Pick a theme template

Each product uses a template, chosen on its own admin page under **Theme
template** (right-hand column, below Search engine listing).

| Template | Use it for |
|---|---|
| **Default product** | An ordinary product. Big photos stacked down the page. |
| **studio** | Ready-made designs — Studio Originals. One big photo with thumbnails and arrows. |
| **studio-variant-filtering** | Same as studio, plus: pick a colour and the gallery shows **only that colour's photos**. See *Naming photos by colour* below. Without it, behaves exactly like studio. The colour option on the product must be called "Color". |
| **sb-product-designer** | Personalised products. The studio look plus an order-note box; the designer itself is attached by the app. |

If the dropdown doesn't list the template you want, the theme hasn't been
published yet. See *Why a template is missing* below.

### 2. Fill in the fields that the design uses

Some parts of the design read product fields that are easy to leave empty:

- **Product type** — shown on the card as "Oversized tee · 4 colours". An
  empty type means the card just says "4 colours".
- **Price** — a product priced 0.00 shows as £0.00 on every card.
- **Tags** — `customizable` shows the "Design your own" badge on the
  homepage rail. `new` shows a "New" chip.
- **Image alt text** — on a product with colour variants, set each photo's
  alt text to the colour name ("Black", "White"). Some templates use it to
  show only the photos for the colour that's selected.

### 3. Photograph on a transparent background where you can

Cards put the garment on a coloured ground with a soft shadow beneath it.
That only works on a cut-out — a PNG with a transparent background. A
photo with its own background will show as a rectangle sitting on the
card's colour, and its shadow will trace the rectangle rather than the
garment.

If you can't cut it out, see **Card images** below.

---

## Card images

By default a card shows the product's first photo. Two optional fields
change that, set per product. Both need creating once (see *Setting up
custom fields*), then they appear on every product's admin page.

### `card_image` — a picture only used on cards

Upload an image here and cards will use it instead of the first photo.

It does **not** appear in the gallery on the product page. That's the
point: you can have a styled shot on the card and the plain photos on the
product itself.

If you change the product's photos later, remember this one doesn't
change with them.

### `card_style` — Inset or Fill

- **Inset** (the default) — the garment sits inside the card with space
  around it, on the card's colour. Right for cut-outs.
- **Fill** — the picture fills the whole card, edge to edge, and is
  cropped to fit. Right for a photo that already has its own background.

---

## Naming photos by colour

Only matters on the **studio-variant-filtering** template, where picking
a colour hides the other colours' photos.

**Name the file `Colour_anything.png`** — the colour, then an
underscore, then whatever you like:

```
Black_hoodie-front.png      → Black
Black_hoodie-back.png       → Black
White_hoodie-front.png      → White
Bone-White_tee.png          → Bone White   (hyphens inside a two-word colour)
```

Capitals don't matter. The underscore is what counts: a file *without*
one — `faded-red-tee.png` — is simply ignored, so your other photos are
never affected.

**If you can't rename the file** (a photographer's `DSC_4471.jpg`), put
the colour in the photo's **alt text** instead. It only has to *contain*
the colour, so write a proper description — *"Black hoodie, front
view"* — which is better for Google and for screen readers anyway. The
filename is checked first; alt text is the fallback.

**If a colour has no photos of its own, all the photos show.** Nothing
ever goes blank, so you can do this one product at a time.

One caveat: Shopify can't rename a file after upload. To apply this to
photos already uploaded you have to delete and re-add them, which also
clears their variant assignment and order.

---

## Setting up custom fields

Done once. **Settings → Custom data → Products → Add definition.**

**Card image**

| | |
|---|---|
| Name | Card image |
| Namespace and key | `custom.card_image` |
| Type | File → **Accept only images** |
| Description | Shown on collection and homepage cards instead of the first product photo. Does not appear on the product page. |

**Card style**

| | |
|---|---|
| Name | Card style |
| Namespace and key | `custom.card_style` |
| Type | Single line text |
| Validation | **Limit to preset choices**: `Inset`, `Fill` |
| Description | Inset for cut-out garments on a transparent background. Fill for photos that already have their own background. |

There is also one on collections, which you may already have:

**Show in grid** — `custom.show_in_grid`, type True/false. Ticked
collections appear in "Shop by theme" when that section is set to *Only
collections marked in the admin*.

---

## Changing how cards and product images look

**Clicking a product photo opens it full screen** — one image at a
time, on a dark background, with previous/next arrows and a counter.
That's on for every product template. It's the "Abimra lightbox"
checkbox on the Product information section, paired with Image zoom set
to "No zoom"; change both together or two viewers answer the same click.

**Theme editor → Theme settings → ABIMRA.** These apply across the whole
store, so everything stays consistent.

| Setting | What it does |
|---|---|
| Paper, Ink, Press red | The three brand colours. Everything else is fixed in the stylesheet. |
| Contact shadow | How firmly garments sit on their backdrop. 0 removes it. Only visible on cut-outs. |
| Card backdrops | *Cycle the palette* gives each card in a row a different ground. *One colour* uses the same everywhere. |
| Card backdrop | The colour, when set to one colour. |
| Product page backdrop | Behind the gallery image on a product page. |
| Space around card images | The gap between a garment and the edge of its card. |

Individual sections can override the backdrop and shadow — open the
section in the editor and look for **Backdrops and shadow**. A single
card in *Customise apparel* can override them again with **Give this card
its own backdrop**. Most specific wins.

---

## Homepage sections

Everything on the homepage is a section you can reorder, hide or remove
in the theme editor.

- **Abimra hero** — the opening screen. It is sized to fill exactly one
  screen, so anything you switch on competes for that space. The line
  above the headline and the ratings row are both optional for that
  reason.
- **Brand story** — the scroll animation. *Scroll length* controls how
  many screens it lasts; lower it if it feels long.
- **Abimra categories** ("Customise apparel") — either every product in a
  collection, or cards you add by hand.
- **Abimra product rail** ("Studio Originals") — same choice.
- **Abimra testimonials**, **closing band**, etc.

Where a section offers *Everything in a collection* versus *Only the ones
I pick*, the first keeps itself up to date as you add products and the
second gives you control of the order.

---

## The cart page

Open it in the theme editor with something in your bag — an empty cart
shows only the empty state and hides everything else.

All the wording is a setting, under **Cart items**. Two of them are
claims about the studio rather than decoration, so check them before
launch:

- **Small print** on the ticket says pieces are *dispatched in 2–4 days*.
- **Line under the note** says *We read every note before we print.*

Neither is enforced by anything. If they stop being true, change them.

### The customer's design on the line

**Card image for personalised items** decides what the little picture on
each line shows:

- **The customer's design** (the default) — what they made in the
  designer. Someone who has just personalised three tees is looking for
  three different designs, not three identical black ones.
- **The product photo** — the plain garment shot.

Either way it falls back to the product photo when there is no design, or
when the design fails to load. Those pictures are hosted by the
personalisation app rather than by Shopify, so they can vanish
independently of your product.

**View your design** opens the full picture. It only appears on lines
that were personalised.

### What's deliberately not there

- **Express checkout** (Shop Pay, Apple Pay, Google Pay) is switched off
  on the cart page, as agreed. It still appears at checkout itself.
- **Discount codes and delivery** are entered at checkout, not here.
  That is Shopify's behaviour, not a choice in this theme.

### Cart footer

There is a second section below called **Cart footer** with nothing to
set. Do not remove it — Shopify's cart script updates it on every
quantity change, and without it the cart quietly stops responding.

---

## Search

Three places, all wired to the same results page.

- **The icon in the header** opens a panel with live results as you type.
- **The bar in the mobile menu** submits to the results page. No live
  dropdown there on purpose — a dropdown inside a full-screen menu
  fights the menu's own scrolling.
- **The results page** repeats the search box, because a search that
  found nothing is exactly when someone wants to retype.

**Theme editor → Header → Search** turns the icon on or off and sets the
placeholder.

**Live results need one setting:** *Theme settings → Search input →
Search suggestions*. With it off, the panel still works but only submits.

### When nothing matches

The results page shows "Nothing matched that" and up to three buttons you
choose — edit them in the theme editor on the search page, under
**Dead-end suggestion** blocks. Point them wherever you'd rather people
went.

One thing that will look odd: **Shopify sometimes returns products even
for nonsense searches.** Typing `qqqqxyz` currently returns three. Those
are recommendations Shopify substitutes when a word search finds nothing,
and the theme has no way to tell them apart from real matches — so they
are counted and shown as results. That behaviour is Shopify's search, not
the theme. If you don't want it, it's turned off in Shopify's search
settings (the Search & Discovery app).

### Making search find the right things

Search reads the product **title, description, type, vendor and tags**.
Products with no description and no type — which is all of them right now
— can only be found by their exact name. Filling those in is what makes
search useful.

---

## The About page

Six sections on the `page.about` template: hero, how we print, facts,
how it started, say hello, and the closing band.

### Getting it onto the site

1. **Online Store → Pages → Add page**, call it About.
2. Set **Theme template** to `page.about`.
3. In the theme editor, fill in the placeholders and add the photo.

**The template won't be in the dropdown until this theme is published.**
The admin only lists templates from the live theme. Create the page now
on the default template if you like, then switch it after publishing.

### Placeholders — the red text

Anything left in [square brackets] shows **in red with a dashed line
under it**, on the live site as well as in the editor. That is on
purpose: a placeholder that looks like ordinary text is one nobody
notices for a year.

There are five, all in *How it started* and *Say hello*:

| Where | What to put |
|---|---|
| Story | the year, the town, the founder's name, one line on why |
| Signature | the founder's name again |
| Say hello | your email address and your Instagram handle |

Also set the **Email** card's link to `mailto:` and your real address —
the text and the link are separate fields.

### The photo

*How it started* wants a **5:4 landscape photo, about 2000 × 1600** — the
studio, the press, or the people. Until you add one it shows an empty
frame saying so, rather than a stock photo nobody chose.

### What each section lets you change

- **Hero** — the label, three headline lines, the intro, both buttons and
  the scroll cue. Keep the headline lines short: they are sized to fill
  the screen, so a long line shrinks all three.
- **How we print** — the heading (in three parts, the last one red), the
  intro, and up to six steps. Steps can be reordered, added and removed.
- **Facts** — up to four. Keep the big words to one or two short words.
- **Say hello** — up to three cards. *Keep it as typed* should stay on
  for addresses and handles, which shouldn't be shouted in capitals.
- **Closing band** — the same section the homepage uses.

---

## Pages

- `/pages/contact` and `/pages/returns` use their own templates and are
  edited in the theme editor, not in the page's text box. Open the page in
  the editor and edit the sections.
- To create the returns page: **Pages → Add page**, then set **Theme
  template** to `returns`.

---

## Things that catch people out

**Why a template is missing from the dropdown.** The admin only lists
templates that exist on the *published* theme. A template added to a draft
theme is invisible until that theme is published.

**Why a page looks different from the theme editor preview.** The editor
previews the theme you have open, which may not be the live one. Check
the theme name at the top.

**Why the storefront looks old.** You are probably still in preview mode
for another theme — there is a black bar at the bottom of the screen with
the theme's name. Click the ✕ on it, or open the store in a private
window.

**Why the social icons aren't on the live site.** Under **Footer →
Social** there is a switch and an address box for Instagram, Facebook, X
and TikTok. All four are switched on to begin with, but an icon needs
*both* — switched on and given an address. An icon with no link tells
people you're on Instagram and then goes nowhere, which is worse than no
icon, so those are left off the live site. In the theme editor they show
as dashed grey circles, so you can see which ones are still waiting.
Switch a platform off to drop it for good.

**Why a policy link is missing from the footer.** Terms, Refunds and so on
only appear once that policy has text in it, under **Settings →
Policies**. This is deliberate: it is better than a link to an empty page.

**Why "Buy it now" doesn't appear.** It is switched off on every product
template on purpose.
