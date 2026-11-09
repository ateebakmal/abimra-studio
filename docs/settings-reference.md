# Settings reference

Every setting and every block on all 25 custom sections, taken straight from
the `{% schema %}` blocks in the code.

**Generated file - do not hand-edit.** Regenerate it after changing a schema;
the command is at the bottom. Because it is read from the code it cannot drift,
which is the whole point of keeping it separate from the prose.

| Looking for | Read |
|---|---|
| How a system works, and recipes | `system-reference.md` |
| Traps that have cost time before | `theme-notes.md` |
| Running the shop day to day | `merchant-guide.md` |
| Why a change was made | `git log --grep=` |

Generated 2026-11-09.

## Contents

- [Brand story](#brand-story) - `sections/abimra-brand-story.liquid`
- [About: facts](#about-facts) - `sections/abmira-about-facts.liquid`
- [About: say hello](#about-say-hello) - `sections/abmira-about-hello.liquid`
- [About: hero](#about-hero) - `sections/abmira-about-hero.liquid`
- [About: how we print](#about-how-we-print) - `sections/abmira-about-process.liquid`
- [About: how it started](#about-how-it-started) - `sections/abmira-about-story.liquid`
- [Abimra categories](#abimra-categories) - `sections/abmira-categories.liquid`
- [Abimra closing band](#abimra-closing-band) - `sections/abmira-closer.liquid`
- [Abimra shop by theme](#abimra-shop-by-theme) - `sections/abmira-collection-grid.liquid`
- [Abimra collection](#abimra-collection) - `sections/abmira-collection.liquid`
- [Abimra comparison](#abimra-comparison) - `sections/abmira-compare.liquid`
- [Abimra contact](#abimra-contact) - `sections/abmira-contact.liquid`
- [Abimra designed and worn](#abimra-designed-and-worn) - `sections/abmira-designed-worn.liquid`
- [Abimra FAQ](#abimra-faq) - `sections/abmira-faq.liquid`
- [Abimra collections](#abimra-collections) - `sections/abmira-featured-collections.liquid`
- [Abimra footer](#abimra-footer) - `sections/abmira-footer.liquid`
- [Abimra header](#abimra-header) - `sections/abmira-header.liquid`
- [Abimra hero](#abimra-hero) - `sections/abmira-hero.liquid`
- [Abimra marquee](#abimra-marquee) - `sections/abmira-marquee.liquid`
- [Abimra numbered steps](#abimra-numbered-steps) - `sections/abmira-numbered-steps.liquid`
- [Abimra product rail](#abimra-product-rail) - `sections/abmira-originals.liquid`
- [Abimra page intro](#abimra-page-intro) - `sections/abmira-page-intro.liquid`
- [Abimra search](#abimra-search) - `sections/abmira-search.liquid`
- [Abimra steps](#abimra-steps) - `sections/abmira-steps.liquid`
- [Abimra testimonials](#abimra-testimonials) - `sections/abmira-testimonials.liquid`

---

## Brand story

`sections/abimra-brand-story.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `blank` | text | Opening words | `Start blank.` |  |
| `caption_1` | text | Caption | `Nothing on it yet. That’s the exciting part.` |  |
| `catch` | text | Phrase that flies onto the tee | `Abimra Club` | Keep it short, under 16 characters. |
| `phrases` | textarea | Phrases in the big scrolling type | `Birthdays Events Branding Class of 2026 Your...` | One per line. They also fill the wall of tees at the end. |
| `caption_2` | text | Caption | `Birthdays, leavers, launches, club nights. I...` |  |
| `card_1` | text | Snap 1 caption | `Holiday, 2019` |  |
| `card_2` | text | Snap 2 caption | `Her sketch` |  |
| `card_3` | text | Snap 3 caption | `Club badge` |  |
| `card_4` | text | Snap 4 caption | `The band` |  |
| `caption_3` | text | Caption | `Add your pictures too. Photos, sketches, log...` |  |
| `inked_a` | text | Big words, top | `Pulled` |  |
| `inked_b` | text | Big words, bottom | `in ink.` |  |
| `caption_4` | text | Caption | `Then we print it in our own studio and send ...` |  |
| `tagline` | text | Tagline | `Made to be admired.` |  |
| `cta_label` | text | Button label | `Design your own` |  |
| `cta_link` | url | Button link |  | The product page where the Customify designer lives. |
| `cta2_label` | text | Second link label | `Shop Studio Originals` |  |
| `cta2_link` | url | Second link |  |  |
| `scroll_length` | range<br><small>5-10</small> | Scroll length on desktop | `7` | How many screen heights the story takes to scroll through. |
| `scroll_length_mobile` | range<br><small>4-9</small> | Scroll length on phones | `6` |  |
| `header_offset` | range<br><small>0-140</small> | Sticky header height | `0` | Match the sticky header so it doesn't cover the story. |
| `sr_title` | text | Heading for screen readers | `What Abimra Studio prints` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Opening
- **header:** Words
- **header:** Pictures
- **header:** Press
- **header:** Finale
- **header:** Scrolling

</details>

---

## About: facts

`sections/abmira-about-facts.liquid`

- Only available on: **`page`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**
- Maximum blocks: **4**

*No settings.*

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** Keep the big words to one or two short words. Four reads best; fewer works, more crowds the row.

</details>

**Block: Fact  (`type: fact`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `value` | text | Big word | `In-house` |  |
| `text` | text | Line underneath | `Printed in our own UK studio` |  |

---

## About: say hello

`sections/abmira-about-hello.liquid`

- Only available on: **`page`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**
- Maximum blocks: **3**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Say hello` |  |
| `intro` | textarea | Intro | `Questions about a print, a bulk order or an ...` |  |
| `tight_top` | checkbox | Remove the space above | `on` |  |

**Block: Contact card  (`type: card`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `label` | text | Label | `Email` |  |
| `value` | text | Text | `[hello@yourdomain]` |  |
| `link` | url | Link |  | For email use mailto:you@yourdomain. Leave empty and the card is not clickable. |
| `plain` | checkbox | Keep it as typed | `on` | On for addresses and handles, which should not be shouted in capitals. |

---

## About: hero

`sections/abmira-about-hero.liquid`

- Only available on: **`page`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `eyebrow` | text | Label above the headline | `About Abimra Studio` |  |
| `line_1` | text | Line 1 | `We print` |  |
| `line_2` | text | Line 2 | `what you` |  |
| `line_3` | text | Line 3 | `make.` |  |
| `intro` | textarea | Intro | `Abimra Studio is a small print studio in the...` |  |
| `button_1_label` | text | First button | `Design your own` |  |
| `button_1_link` | url | First link |  |  |
| `button_2_label` | text | Second button | `Shop Studio Originals` |  |
| `button_2_link` | url | Second link |  |  |
| `show_cue` | checkbox | Show the scroll cue | `on` |  |
| `cue_label` | text | Cue text | `Scroll` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** The headline is three lines, each printed in two inks. Keep them short — they are sized to fill the screen.
- **header:** Buttons
- **header:** Scroll cue

</details>

---

## About: how we print

`sections/abmira-about-process.liquid`

- Only available on: **`page`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**
- Maximum blocks: **6**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading_1` | text | Heading, line 1 | `From your screen` |  |
| `heading_2` | text | Heading, line 2 | `to your` |  |
| `heading_accent` | text | Accent word | `shoulders.` |  |
| `intro` | text | Intro | `What happens between you pressing order and ...` |  |
| `step_word` | text | Word before the number | `Step` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** The heading is split so the last part can take the accent colour. Only one word on the page should be red.

</details>

**Block: Step  (`type: step`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `title` | text | Title | `You design it` |  |
| `text` | textarea | Text |  |  |
| `chip` | text | Tag |  | A short label under the step. Leave empty to hide. |

---

## About: how it started

`sections/abmira-about-story.liquid`

- Only available on: **`page`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `image` | image_picker | Photo |  | 5:4 landscape, about 2000 × 1600. |
| `image_note` | text | Note shown while there is no photo |  |  |
| `heading` | text | Heading | `How it started` |  |
| `text` | richtext | Story | `<p>Abimra Studio started in [year] in [town ...` |  |
| `sign_initials` | text | Initials | `AS` |  |
| `sign_name` | text | Name | `[Founder's name]` |  |
| `sign_role` | text | Role | `Founder, Abimra Studio` |  |
| `tight_top` | checkbox | Remove the space above | `on` | On when the facts strip sits directly above this. |

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** Anything you leave in [square brackets] shows in red with a dashed line under it, so it can't go live unnoticed.
- **header:** Signature
- **header:** Spacing

</details>

---

## Abimra categories

`sections/abmira-categories.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Customise apparel` |  |
| `body` | textarea | Body |  |  |
| `source` | select<br><small>`collection` / `manual`</small> | Source | `manual` | A collection keeps itself up to date as you add products. Adding cards lets you set the order, wording and colour of each one. |
| `collection` | collection | Collection |  |  |
| `products_to_show` | range<br><small>2-12</small> | Products to show | `6` | Collection mode only. Added cards all show. |
| `backdrop_mode` | select<br><small>`theme` / `cycle` / `single`</small> | Backdrop | `theme` |  |
| `backdrop_color` | color | Backdrop colour | `#E8E2D4` | Used when the backdrop is set to one colour. |
| `shadow_mode` | select<br><small>`theme` / `custom`</small> | Contact shadow | `theme` |  |
| `shadow` | range<br><small>0-100</small> | Shadow strength | `45` |  |
| `link_label` | text | Button text | `View all` | Leave empty to hide the button. |
| `link_url` | url | Button target |  | Defaults to the collection above. |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Which cards
- **header:** Backdrops and shadow
- **paragraph:** Theme default follows Theme settings > ABIMRA. Anything set here overrides it for this section only, and a card with its own backdrop switched on overrides both.
- **header:** View all button

</details>

**Block: Card  (`type: category`, limit 8)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `collection` | collection | Collection |  | Its title, image and link are used unless you override them below. |
| `product` | product | Product |  | Use this for a card that opens one garment in the designer. |
| `heading` | text | Heading override |  |  |
| `link` | url | Link override |  |  |
| `image` | image_picker | Image override |  | Defaults to the product photo, then the collection image. With none of them the card is a flat colour. |
| `caption` | text | Caption | `From £24.99` | Plain text - it is not read from the product, so update it if your prices change. Leave empty to hide the line. |
| `use_bg` | checkbox | Give this card its own backdrop | `off` | Off means it follows the section, then the theme. |
| `background` | color | Background | `#E8E2D4` | Use one of the photographic backdrops: sand #E8E2D4, sage #DFE7DC, blue #E3EAF6, straw #EDE3C9. |
| `invert` | checkbox | Invert this card | `off` | Dark card. Use it to pick one garment out of the row. |

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** Point the card at a collection or at a single product. If you set both, the product wins. Leave both empty and set a link below to send it anywhere.

</details>

---

## Abimra closing band

`sections/abmira-closer.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `align` | select<br><small>`center` / `left`</small> | Alignment | `center` |  |
| `show_mark` | checkbox | Show logomark | `on` |  |
| `heading` | textarea | Heading | `What will you make?` | Press Enter to break the line. |
| `body` | textarea | Body | `Your name. Your artwork. Your message. Black...` |  |
| `cta_label` | text | Button | `Design your own` |  |
| `cta_link` | url | Button link |  |  |

---

## Abimra shop by theme

`sections/abmira-collection-grid.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Shop by theme` |  |
| `intro` | textarea | Intro | `The same garments, grouped by what people ac...` |  |
| `source` | select<br><small>`auto` / `metafield` / `manual`</small> | Source | `auto` | Automatic and marked-in-the-admin both pick up new collections on their own. Only the last one needs a block adding here. |
| `metafield_namespace` | text | Metafield namespace | `custom` | For 'marked in the admin'. Shopify uses 'custom' unless you chose otherwise. |
| `metafield_key` | text | Metafield key | `show_in_grid` | Create it once at Settings > Custom data > Collections, as a true/false field. Each collection then gets a checkbox on its own admin page. |
| `limit` | range<br><small>4-24</small> | Maximum tiles | `12` | Automatic mode only. |
| `hide_empty` | checkbox | Hide collections with no products | `on` | Automatic mode only. Turn off to see collections you are still filling. |
| `use_product_image` | checkbox | Fall back to the first product's image | `on` | Used when a collection has no image of its own. With neither, the tile shows a garment silhouette. |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Which collections
- **paragraph:** Three ways to choose what appears: every collection automatically, only those ticked on their own admin page, or only blocks added below. The first two pick up new collections without anyone touching this page.

</details>

**Block: Hide a collection  (`type: exclude`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `collection` | collection | Collection to hide |  |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **paragraph:** This collection will not be shown in the grid. Only applies when Source is set to all collections.

</details>

**Block: Collection  (`type: collection`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `collection` | collection | Collection |  |  |
| `title_override` | text | Title override |  | Leave blank to use the collection title. Set this to lay out a tile before its collection exists. |
| `bg` | color | Background | `#E8E2D4` | Use a photographic backdrop: sand #E8E2D4, stone #DCD9CF, blue #E3EAF6, red #FBE7E1, sage #DFE7DC, straw #EDE3C9. |
| `garment` | select<br><small>`tee` / `hood`</small> | Silhouette | `tee` |  |
| `garment_color` | color | Silhouette colour | `#191813` |  |

---

## Abimra collection

`sections/abmira-collection.liquid`

- Only available on: **`collection`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `show_breadcrumb` | checkbox | Show breadcrumb | `on` |  |
| `show_description` | checkbox | Show collection description | `on` |  |
| `products_per_page` | range<br><small>8-48</small> | Products per page | `24` |  |
| `color_option_name` | text | Colour option name | `Color` | Products with more than one value for this option show colour swatches on their card. |
| `enable_filtering` | checkbox | Enable filtering | `on` |  |
| `filter_type` | select<br><small>`horizontal` / `vertical` / `drawer`</small> | Filter layout | `horizontal` |  |
| `enable_sorting` | checkbox | Enable sorting | `on` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Filtering and sorting
- **paragraph:** The filters themselves come from the free Shopify Search & Discovery app, not the theme.

</details>

---

## Abimra comparison

`sections/abmira-compare.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **3**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading |  | Leave empty to hide. |
| `note_heading` | text | Callout heading | `Faults are always covered, whatever you orde...` |  |
| `note_body` | textarea | Callout text | `Under the Consumer Rights Act 2015 you have ...` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Callout below the cards
- **paragraph:** For the rule that applies whichever card the customer falls under.

</details>

**Block: Card  (`type: card`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `badge` | text | Badge | `Studio Originals` |  |
| `badge_style` | select<br><small>`blue` / `red`</small> | Badge colour | `blue` |  |
| `heading` | text | Heading | `14 days to change your mind` |  |
| `body` | textarea | Text | `Our own designs are standard products. You g...` |  |
| `included` | textarea | What is covered | `14 days from delivery to cancel, no reason n...` | One per line. Each gets a tick. |
| `excluded` | textarea | What is not | `Return postage is yours unless the item is f...` | One per line. Each gets a cross and reads quieter. |
| `invert` | checkbox | Dark card | `off` |  |

---

## Abimra contact

`sections/abmira-contact.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **8**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `anchor` | text | Anchor id | `contact` | Link to this form from anywhere with #contact. |
| `label_name` | text | Name label | `Your name` |  |
| `ph_name` | text | Name placeholder | `Sarah Whitfield` |  |
| `label_email` | text | Email label | `Email` |  |
| `ph_email` | text | Email placeholder | `sarah@example.com` |  |
| `label_subject` | text | Subject label | `What's this about?` |  |
| `subjects` | textarea | Subject options | `An order I've placed A problem with a print ...` | One per line. Leave empty to hide the dropdown. |
| `show_order` | checkbox | Ask for an order number | `on` |  |
| `label_order` | text | Order number label | `Order number` |  |
| `ph_order` | text | Order number placeholder | `#1026` |  |
| `optional_word` | text | Optional marker | `— optional` |  |
| `label_message` | text | Message label | `Message` |  |
| `ph_message` | text | Message placeholder | `Tell us what happened. If it's a print probl...` |  |
| `attach_note` | richtext | About photos | `<p>Got a photo? Email it to hello@abimra.stu...` | Shopify's contact form cannot accept file uploads, so this line tells people where to send one. Leave empty to hide it. |
| `submit` | text | Button text | `Send message` |  |
| `small_print` | richtext | Small print | `<p>We'll only use your details to answer thi...` |  |
| `success` | text | Thank you message | `Thanks — that's with us. You'll hear back wi...` |  |
| `side_heading` | text | First card heading | `Reach us directly` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Form
- **paragraph:** Submissions go to the email set under Settings > Notifications in the admin. The customer's address becomes the reply-to, so you answer them by replying.
- **header:** Side column

</details>

**Block: Contact detail  (`type: detail`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `icon` | select<br><small>`mail` / `phone` / `clock` / `pin`</small> | Icon | `mail` |  |
| `title` | text | Title | `hello@abimra.studio` |  |
| `text` | text | Note underneath | `Best for order questions and artwork help.` |  |
| `link` | url | Link |  | For an email address use mailto:, for a number use tel:. |

**Block: Side card  (`type: note`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `The studio` |  |
| `body` | richtext | Text |  |  |

---

## Abimra designed and worn

`sections/abmira-designed-worn.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Designed and worn` |  |
| `body` | textarea | Body | `Real orders from real people. Tag us when yo...` |  |

**Block: Photo  (`type: photo`, limit 6)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `image` | image_picker | Photo |  | Choose model-image-1, -2 and so on from your Files. |
| `name` | text | Name | `Yusuf A.` |  |
| `garment` | text | Garment line | `Oversized tee, black` |  |
| `show_prefix` | checkbox | Show "Designed by" prefix | `on` | Turn off for a shot that isn't a customer design, e.g. a print detail. |

---

## Abimra FAQ

`sections/abmira-faq.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **16**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Common questions` |  |
| `intro` | textarea | Intro |  | Leave empty to hide. |

**Block: Question  (`type: question`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `question` | text | Question | `My design printed smaller than I expected` |  |
| `answer` | richtext | Answer |  |  |
| `open` | checkbox | Open by default | `off` | Use on the first one if it answers most of the emails you get. |

---

## Abimra collections

`sections/abmira-featured-collections.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **4**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `eyebrow` | text | Eyebrow | `Everything we make` |  |
| `heading` | text | Heading | `Collections` |  |
| `intro` | textarea | Intro | `Start from a blank and make it yours, or tak...` |  |
| `full_height` | checkbox | Full height opening | `on` | Fills the first screen, like the home page hero. Turn this off if the section sits part way down a page rather than at the top. |

**Block: Collection  (`type: collection`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `collection` | collection | Collection |  |  |
| `title_override` | text | Title override |  | Leave blank to use the collection title. |
| `blurb` | textarea | Description |  |  |
| `meta` | text | Meta line |  | e.g. 3 garments · 12 colours. Leave blank to show the product count. |
| `image` | image_picker | Image override |  | Defaults to the collection image set in admin, then the first product's image. |

---

## Abimra footer

`sections/abmira-footer.liquid`

- Only available on: **`footer`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `logo_text` | text | Logo text | `Abimra` | Leave empty to use the store name. |
| `blurb` | textarea | Blurb | `Wear it. Make it yours. Designed and printed...` |  |
| `show_colour_bar` | checkbox | Show colour bar | `on` | Print furniture. The guide allows two such devices per page. |
| `show_instagram` | checkbox | Instagram | `on` |  |
| `instagram_link` | url | Instagram address |  | e.g. https://instagram.com/yourstudio |
| `show_facebook` | checkbox | Facebook | `on` |  |
| `facebook_link` | url | Facebook address |  | e.g. https://facebook.com/yourstudio |
| `show_twitter` | checkbox | X (Twitter) | `on` |  |
| `twitter_link` | url | X (Twitter) address |  | e.g. https://x.com/yourstudio |
| `show_tiktok` | checkbox | TikTok | `on` |  |
| `tiktok_link` | url | TikTok address |  | e.g. https://tiktok.com/@yourstudio |
| `legal_details` | textarea | Company details |  | Company number, registered office, VAT number. Shown above the bottom rule. Leave empty to hide. |
| `copyright_suffix` | text | After the year | `Studio` |  |
| `legal_text_unused` | text | Legal line | `Privacy · Terms · Accessibility` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Social
- **paragraph:** Switch a platform off to remove its icon. A platform that is on but has no address shows here in the editor, dashed, and is left out of the live site — an icon that goes nowhere is worse than no icon.
- **header:** Bottom line

</details>

**Block: Legal link  (`type: legal`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `label` | text | Label | `Privacy` |  |
| `policy` | select<br><small>`none` / `privacy` / `terms` / `refund` / `shipping` / `contact` / `cookies`</small> | Shopify policy | `privacy` | Points at the policy written under Settings > Policies. The link disappears until that policy has something in it, so it can never be a dead link. Cookie preferences is different: it reopens the consent banner, and only shows once that banner is switched on under Settings > Customer privacy. |
| `link` | url | Link |  | Overrides the policy above. Use this for anything that is not a Shopify policy. |

**Block: Link column  (`type: column`, limit 3)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Shop` |  |
| `links` | textarea | Links |  | One per line, as Label \| /url. Ignored when a menu is chosen below. |
| `menu` | link_list | Menu |  | Create these in Online Store > Navigation. |

---

## Abimra header

`sections/abmira-header.liquid`

- Only available on: **`header`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `logo_text` | text | Logo text | `Abimra` | Set in condensed caps with wide letter-spacing. Leave empty to use the store name. |
| `logo_sub` | text | Wordmark, second word | `Studio` | Set in a lighter weight beside the first. Used in the header and in the mobile menu, so they cannot disagree. Leave empty for one word. |
| `menu` | link_list | Menu | `main-menu` |  |
| `cart_label` | text | Cart label | `Bag` |  |
| `show_search` | checkbox | Show the search icon | `on` | Opens a panel under the header. Live results need Search suggestions switched on under Theme settings > Search input. |
| `search_placeholder` | text | Placeholder | `Search tees, hoodies, colours` |  |
| `cta_label` | text | Button | `Design your own` | Hidden below 641px to keep the bar from crowding; still present in the drawer. |
| `cta_link` | url | Button link |  |  |
| `abimra_menu` | link_list | Menu links | `main-menu` | Top-level links only. Shown as the big outline words. |
| `abimra_cta_label` | text | Red button text | `Design your own` |  |
| `abimra_cta_link` | url | Red button link |  | The Customify designer product page. |
| `abimra_returns_link` | url | Returns link |  | Leave empty to use the store's refund policy. |
| `abimra_contact_link` | url | Contact us link |  | Leave empty to use /pages/contact. |
| `abimra_logo_mark` | checkbox | Show the logo mark in the menu | `on` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Search
- **header:** Call to action
- **header:** Mobile menu

</details>

---

## Abimra hero

`sections/abmira-hero.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `show_eyebrow` | checkbox | Show the line above the headline | `on` | The hero is one screen tall. Every row above the fold competes with the headline and the image for that space. |
| `eyebrow` | text | Eyebrow | `Printed to order. Delivered across the UK.` | Preceded by a pulsing red dot. Sentence case - never tracked-out caps. |
| `accent_word` | text | Accent word | `Design` | Shown in red at the start of line one. Only one coloured word per headline. |
| `headline_line_1` | text | Headline line 1 | `it,` |  |
| `headline_line_2` | text | Headline line 2 | `wear it.` | Keep each line short enough to stay on one line on desktop. |
| `subheading` | textarea | Subheading | `Upload your artwork, add text, design it how...` |  |
| `cta_primary_label` | text | Primary button | `Design your own` | One primary button per view. No arrow after the label - the verb does the work. |
| `cta_primary_link` | url | Primary button link |  |  |
| `cta_secondary_label` | text | Secondary button | `Shop Studio Originals` |  |
| `cta_secondary_link` | url | Secondary button link |  |  |
| `show_proof` | checkbox | Show avatars and rating | `on` |  |
| `avatar_initials` | text | Avatar initials | `HM, DO, PR, +` | Comma separated. Shown as overlapping circles. |
| `rating_text` | text | Rating text | `4.9 from 126 orders` |  |
| `collage_image` | image_picker | Collage image |  | Choose hero-image from your Files. |
| `collage_mat_color` | color | Mat colour | `#F3EFE5` | Sample this from the image's own background, or a rectangle appears around it. |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Headline
- **header:** Buttons
- **header:** Proof
- **header:** Collage

</details>

**Block: Feature  (`type: feature`, limit 3)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `icon` | select<br><small>`print` / `delivery` / `star`</small> | Icon | `print` |  |
| `label` | textarea | Label | `High quality printing` | Two short lines reads best. Press Enter between them. |

---

## Abimra marquee

`sections/abmira-marquee.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `speed` | range<br><small>20-90</small> | Loop duration | `52` | Higher is slower. Pauses on hover. |
| `aria_label` | text | Accessible label | `What we do` |  |

**Block: Item  (`type: item`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `text` | text | Text | `Printed in our own studio` | A capability, not a slogan. |

---

## Abimra numbered steps

`sections/abmira-numbered-steps.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **8**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `How to return something` |  |
| `intro` | textarea | Intro | `Four steps. Most are sorted within a day of ...` |  |

**Block: Step  (`type: step`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Email us with your order number` |  |
| `body` | richtext | Text |  | Links are allowed here, for an email address or a contact page. |

---

## Abimra product rail

`sections/abmira-originals.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**
- Maximum blocks: **12**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Studio Originals` |  |
| `source` | select<br><small>`collection` / `manual`</small> | Source | `collection` | A collection keeps itself up to date as you add products. Picking products lets you control which ones show and in what order. |
| `collection` | collection | Collection |  |  |
| `products_to_show` | range<br><small>2-12</small> | Products to show | `6` | Collection mode only. Picked products all show. |
| `link_label` | text | Button text | `View all` | Leave empty to hide the button. |
| `link_url` | url | Button target |  | Defaults to the collection above. |
| `backdrop_mode` | select<br><small>`theme` / `cycle` / `single`</small> | Backdrop | `theme` |  |
| `backdrop_color` | color | Backdrop colour | `#E8E2D4` | Used when the backdrop is set to one colour. |
| `shadow_mode` | select<br><small>`theme` / `custom`</small> | Contact shadow | `theme` |  |
| `shadow` | range<br><small>0-100</small> | Shadow strength | `45` |  |
| `pad_mode` | select<br><small>`theme` / `custom`</small> | Space around images | `theme` |  |
| `pad` | range<br><small>0-48</small> | Space around images | `18` | 0 lets the picture fill the tile. |
| `show_badge` | checkbox | Show badge on customisable products | `on` |  |
| `badge_label` | text | Badge text | `Design your own` |  |
| `badge_tag` | text | Tag to look for | `customizable` | The badge shows on products carrying this tag. Sold out always wins over it. |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Which products
- **header:** View all button
- **header:** Backdrops and shadow
- **paragraph:** Theme default follows Theme settings > ABIMRA. Anything set here overrides it for this section only, and a card with its own colour overrides both.
- **header:** Badge

</details>

**Block: Product  (`type: product`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `product` | product | Product |  |  |
| `use_bg` | checkbox | Give this card its own backdrop | `off` |  |
| `background` | color | Backdrop | `#E8E2D4` | Photographic backdrops: sand #E8E2D4, sage #DFE7DC, straw #EDE3C9, blue #E3EAF6, stone #DCD9CF, red #FBE7E1. |

---

## Abimra page intro

`sections/abmira-page-intro.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `eyebrow` | text | Eyebrow | `Returns and refunds` |  |
| `heading` | textarea | Heading | `If it's wrong, we'll fix it.` | Press Enter to break the line. |
| `intro` | textarea | Intro | `What you can return depends on whether you d...` |  |

---

## Abimra search

`sections/abmira-search.liquid`

- Only available on: **`search`**
- Preset in the "Add section" menu: **no - it can only be added where it already is**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `show_breadcrumb` | checkbox | Show breadcrumb | `on` |  |
| `heading` | text | Heading before the search term | `Results for` |  |
| `blank_heading` | text | Heading with no search term | `Search` |  |
| `placeholder` | text | Search box placeholder | `Search tees, hoodies, colours` |  |
| `idle_body` | text | Text before anything is searched | `Type what you are after — a garment, a colou...` |  |
| `results_per_page` | range<br><small>8-48</small> | Results per page | `24` |  |
| `color_option_name` | text | Colour option name | `Color` | Products with more than one value for this option show colour swatches on their card. |
| `pages_heading` | text | Heading above page results | `Also on the site` |  |
| `empty_heading` | text | Heading | `Nothing matched that.` |  |
| `empty_body` | textarea | Text | `Try a shorter word, or a garment rather than...` |  |
| `enable_filtering` | checkbox | Enable filtering | `on` |  |
| `filter_type` | select<br><small>`horizontal` / `vertical` / `drawer`</small> | Filter layout | `horizontal` |  |
| `enable_sorting` | checkbox | Enable sorting | `on` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Nothing found
- **header:** Filtering and sorting
- **paragraph:** Filters on search results come from the free Shopify Search & Discovery app. With none configured only the sort control appears.

</details>

**Block: Dead-end suggestion  (`type: suggestion`)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `label` | text | Label | `Shop everything` |  |
| `link` | url | Link |  |  |

---

## Abimra steps

`sections/abmira-steps.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Designed by you, printed by us` | Keep it on one line. Don't break it manually. |
| `body` | textarea | Body | `Upload your artwork, add your text, choose y...` |  |
| `cta_label` | text | Button | `Start designing` |  |
| `cta_link` | url | Button link |  |  |
| `cta_note` | text | Note beside button | `No account needed to try it.` |  |

<details><summary>Guidance text shown in the theme editor</summary>

- **header:** Call to action

</details>

**Block: Step  (`type: step`, limit 4)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `image` | image_picker | Illustration |  | Choose vector-art-step-1, -2 or -3 from your Files. |
| `heading` | text | Heading | `Upload your artwork` |  |
| `body` | textarea | Body | `Drop in a photo or a logo. We check the reso...` |  |
| `invert` | checkbox | Invert this card | `off` | Dark card. Use on one step only - usually the middle. |

---

## Abimra testimonials

`sections/abmira-testimonials.liquid`

- Available on any template
- Preset in the "Add section" menu: **yes**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `heading` | text | Heading | `Worn and reviewed` |  |
| `link_label` | text | Link beside heading | `Read all reviews` |  |
| `link` | url | Link |  |  |
| `hint` | text | Swipe hint | `Tap or swipe for the next` | Shown on phones only, fades after the first interaction. |

**Block: Review  (`type: quote`, limit 5)**

| Setting id | Type | Label | Default | Notes |
|---|---|---|---|---|
| `stars` | range<br><small>1-5</small> | Stars | `5` |  |
| `quote` | textarea | Quote | `I sent them a drawing my daughter made and i...` |  |
| `initials` | text | Initials | `HM` |  |
| `name` | text | Name | `Hannah M.` |  |
| `garment` | text | Garment | `Heavy hoodie, navy` |  |
| `invert` | checkbox | Invert this card | `off` | Dark card. Use on the middle review only. |

---

## Regenerating

```bash
python3 -I scripts/gen-settings-reference.py
```

Reads the `{% schema %}` block of every `sections/ab*.liquid` and overwrites
this file. `scripts/` is not a Shopify theme directory, so the CLI never
uploads it, and `.theme-check.yml` does not need to ignore it.
