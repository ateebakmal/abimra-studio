# Abimra Studio: cart page design guide

This is the design to build for the cart page (`/cart`). It covers **how the page looks, reads and moves**. Shopify cart logic, line item properties and the product designer app are wired up as usual; this guide only says how each piece of data should be *presented*.

- **Live reference:** `reference/abimra-cart.html`. Open it in a browser: every state below works there with sample data.
- **Screenshots:** `reference/screens/`. Match these at 390px (phone first) and 1440px.
- **Reference code:** `reference/code/cart.css` and `cart.js` (the page), plus `abimra-loader.css/js` (the shared quick-loader kit: mini tee, busy buttons, print-run animation, page cover). Reuse the CSS and the class names where it makes sense. The JS in `cart.js` works on demo data, so treat it as a behaviour reference, not production cart code.

---

## 1. Brand tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#EEEAE0` | Page background |
| `--paper-raised` | `#F7F5EF` | Quantity stepper, note box |
| `--card` | `#FBF9F4` | Line item cards, extras cards, preview window |
| Ticket paper | `#FFFDF8` | Order ticket only |
| `--ink` | `#191813` | Text, dark buttons, printer, checkout bar |
| `--red` | `#D42E12` | Primary actions, "Personalised" tag, stamp, cart count badge |
| `--red-deep` | `#B8240E` | Red button hover |
| `--graphite` | `#5F5B52` | Secondary text |
| `--rule` | `rgba(25,24,19,.14)` | Borders and dividers |
| Product tile backgrounds | `#E8E2D4` sand, `#DFE7DC` sage, `#E3EAF6` blue, `#EDE3C9` butter | Behind product images, rotating |

**Type**
- **Archivo**, variable, with its width axis. Headings are uppercase, weight 800, `font-stretch: 78%`, letter-spacing −0.02em, line-height 0.9. Body is 16px, line-height 1.5.
- **IBM Plex Mono 500** for small labels: the count next to the title, the ticket metadata, the printer label, the "Personalised" tag, the barcode caption.
- Prices use `font-variant-numeric: tabular-nums` everywhere, so digits don't jump when totals change.

**Shape and depth**
- Cards have a 20px radius with a 1px `--rule` border. Product image tiles 14px. Pills 999px. Buttons are pills, 52px tall (40–46px for small ones).
- Shadows are used sparingly: only the printer, the ticket, the checkout bar, the toast and the preview window.

**Motion**
- Easing is `cubic-bezier(.2,.8,.2,1)` for entrances and `cubic-bezier(.7,0,.2,1)` for wipes.
- With reduce motion on, everything is instant or a simple fade. No wipes, no rise, no shine.

## 2. Layout

- **Phone (below 980px):** one column. Page title, then line items, then the warning note, then "Add a note for the studio", then the order ticket, then trust lines, then "Add a little extra". A floating checkout bar sits at the bottom.
- **Desktop (980px and up):** two columns, `1fr` and `400px`, with a 48px gap. The left column holds items, warning, note, then "Add a little extra". The right column holds the order ticket, which is **sticky** (top = header height + 20px).
- **Page padding:** `clamp(16px, 4vw, 48px)`. Max width 1240px.
- **Header:** the same as the rest of the site. The bag icon shows as the current page (ink circle) with the red count badge.

## 3. Page head
- "YOUR BAG" as a display heading, `clamp(46px, 11vw, 96px)`, with the **item count as a small red mono superscript** (for example "YOUR BAG³").
- "← Keep shopping" on the right, in graphite. The arrow nudges left on hover. Hidden when the bag is empty.

## 4. Line item card
Anatomy, left to right:
1. **Product image tile:** 104px wide on phones, 132px from 640px, with a 300:340 aspect ratio and one of the product tile colours as its background. It shows the **product's own image**, not the customer's design. It links to the product. On hover the image scales up slightly (1.05) and tilts (−2°).
   - **Personalised items** get a small red pill tag in the top-left corner: `PERSONALISED` (mono, 9.5px).
2. **Title** (17px, 19px from 640px, weight 700) and, under it, a small graphite line: "Personalised" or "Studio Original".
3. **Price** top-right, bold and tabular. When quantity is more than 1, the line total shows with "£29.99 each" underneath in small graphite.
4. **Variant chips:** small paper pills, for example `● Black` (with a colour swatch dot) and `Size M`. Show real variant options only.
5. **"View your design" button,** personalised items only: a small ink pill (36px) with an image icon, which turns red on hover. It opens the design preview window (section 5). It replaces the designer app's raw "Preview Personalization Image: Click here" link.
6. **Bottom row:** the quantity stepper on the left and "Remove" (bin icon, graphite) on the right.

**Never show to customers:** technical properties such as `pd_personalization_id` and `product_id`, or any raw property list.

**Quantity stepper:** a 40px pill on `--paper-raised` with − and + buttons (40px round). "−" is disabled at 1. Changing the quantity updates the line price, the ticket and the totals, and the totals roll to their new values (about 0.42s).

**Entrance:** on page load the cards rise in with a 12px lift and fade, staggered 70ms apart.

**Removing an item:**
1. A squeegee blade (a 14px ink bar with a red edge) sweeps across the card left to right while the card clips away behind it (0.5s).
2. The empty space folds closed (0.26s).
3. A toast appears at the bottom: "Removed {title}." with a paper-coloured **Undo** pill button. It stays for 5 seconds. Undo puts the item back where it was, with its entrance animation.

## 5. "View your design" preview window
- A centred modal, `min(560px, 100vw − 24px)` wide, 24px radius, on a dimmed and slightly blurred backdrop. It opens with a 20px rise.
- Title: "YOUR DESIGN" (display, 26px). Close button: an X in a 44px circle, top right.
- **Image stage:** square, max 56% of the screen height, background `#F4F1EA`, 18px radius. It shows the **preview image from the designer app**, fitted with `object-fit: contain`. While loading, it shows the inline mini-tee loader with "Loading your design". If the image fails to load: "We couldn't load the preview here. Use "Open full size"."
- **Caption** under the image: "{Product}, {Colour}, size {Size}." in graphite.
- **Buttons, side by side:** "Open full size" (outlined; opens the image URL in a new tab) and "Looks right" (red; closes the window).
- Escape, clicking the backdrop and the X all close it.

## 6. Warning note
Sits under the items. It has a dashed border (`rgba(25,24,19,.28)`), a 16px radius, and a small red warning-triangle icon.
> Personalised pieces are printed just for you, so check the spelling and sizes one last time with "View your design". **Returns policy** (link)

## 7. "Add a note for the studio"
A collapsible block (on `--paper-raised`, 18px radius). The header row is 56px with a "+" that turns into "×" when open. Inside: a textarea (min 96px tall), with placeholder "Anything we should know? A gift, a deadline, a question about your print." and a mono line under it: "We read every note before we print." It uses Shopify's standard cart note.

## 8. Order ticket (the summary)
The brand's print-shop look: a receipt printing out of a small studio printer.
- **Printer:** an ink bar, 52px tall with a 16px radius and a dark slot. Its left label is `● ORDER PRINTER` (the dot is a green LED). The right label is the item count, for example "3 items" (mono, 11px, paper at 55% opacity).
- **Ticket:** a `#FFFDF8` receipt that **slides out of the printer** (1.3s) the first time it scrolls into view. The LED blinks red while it prints. It has a **zig-zag torn bottom edge**. Whenever the bag changes, the LED blinks red again briefly (0.65s), as if it's reprinting.
- **Ticket contents, top to bottom:**
  1. Header: "ABIMRA STUDIO" (small, letterspaced) with "ORDER TICKET" below it (display, 30px). Top right, in mono: "Your bag" and today's date. **No logo mark on the ticket.**
  2. One row per line: `1× Oversized tee ........ £29.99`, with dashed separators and the quantity in mono.
  3. Subtotal, Delivery "At checkout", Discount code "At checkout".
  4. **Total:** a 2px ink rule above it, and the amount as a big display figure (34px) that rolls when it changes.
  5. Small print: "Delivery options and discount codes are added at checkout. Printed in our own studio and dispatched in 2–4 days."
  6. **"Checkout securely"** button: red, full width, 58px tall, with a lock icon. A soft light sweeps across it every few seconds.
  7. A tear-off line (dashed, with a ✂ at the left), a barcode with the caption `ABIMRA 2609`, and a red **rectangular** rubber stamp, rotated −10°: "CHECKED / READY TO PRINT / ABIMRA STUDIO". It thumps on once the ticket has printed.
- **No express checkout buttons** (Shop Pay, Apple Pay, Google Pay) on the ticket, and **no registration-mark or bullseye shapes** anywhere on it.
- **Trust lines** under the ticket, each with an icon: "Printed in our own UK studio", "Dispatched in 2–4 days, delivered across the UK", "Secure checkout, powered by Shopify".

## 9. "Add a little extra"
- Heading "ADD A LITTLE EXTRA" (display, 28–40px).
- **Cards:** a square product tile, then the title and price, then an outlined "Add to bag" button. On phones they're a horizontal swipe row with snap scrolling. From 980px they're a 3-column grid.
- **The "Add to bag" busy state** (from the quick-loader kit): ink sweeps through the button, a mini tee fills with ink, and the label changes to "Adding". Then the button turns ink-coloured with a tick and "Added". The item appears in the list with its entrance animation, and the header badge bumps.

## 10. Phone checkout bar
Below 980px only. A floating ink pill at the bottom (inset 10px, above the safe area): "Total" in small text, with the amount under it (19px, bold), and a red "Checkout" button on the right. It shows **only while the ticket's checkout button is off screen**, and hides when the bag is empty. It slides up in 0.45s.

## 11. Empty bag
Replaces the whole layout when the bag has no items:
- The **print-run animation** from the quick-loader kit (a tee rolling in, being printed and rolling off), `min(260px, 70vw)` wide.
- "YOUR BAG'S BLANK." (display, `clamp(36px, 9vw, 64px)`).
- "Every good tee starts that way. Put something on one, or pick a Studio Original."
- Buttons: "Design your own" (red) and "Shop Studio Originals" (outlined).

## 12. Header badge and page transitions
- The header bag count bumps (scales to 1.35 and back) whenever the count changes.
- Checkout and any other page change use the quick-loader page cover (squeegee wipe and tee print run), if it's installed on the theme.

## 13. Copy deck
| Where | Text |
|---|---|
| Title | YOUR BAG |
| Back link | Keep shopping |
| Item subtitle | Personalised / Studio Original |
| Tag | PERSONALISED |
| Design button | View your design |
| Preview window | YOUR DESIGN · Loading your design · Open full size · Looks right |
| Remove | Remove · Toast: "Removed {title}." · Undo |
| Warning | Personalised pieces are printed just for you, so check the spelling and sizes one last time with "View your design". Returns policy |
| Note | Add a note for the studio · Anything we should know? A gift, a deadline, a question about your print. · We read every note before we print. |
| Ticket | ORDER PRINTER · ORDER TICKET · Your bag · Subtotal · Delivery: At checkout · Discount code: At checkout · Total |
| Small print | Delivery options and discount codes are added at checkout. Printed in our own studio and dispatched in 2–4 days. |
| Checkout | Checkout securely (ticket) · Checkout (phone bar) |
| Stamp | CHECKED · READY TO PRINT · ABIMRA STUDIO |
| Trust | Printed in our own UK studio · Dispatched in 2–4 days, delivered across the UK · Secure checkout, powered by Shopify |
| Extras | ADD A LITTLE EXTRA · Add to bag · Adding · Added |
| Empty | YOUR BAG'S BLANK. · Every good tee starts that way. Put something on one, or pick a Studio Original. · Design your own · Shop Studio Originals |

The client needs to confirm the "2–4 days" dispatch time and "We read every note before we print" before launch.

## 14. Not in this design (don't add)
- A free-delivery progress bar.
- An "Edit design" option.
- The customer's design printed on the cart thumbnail (use the product image).
- Express checkout buttons on the ticket.
- Registration marks or bullseye shapes in the cart (the header logo is the only exception).

## 15. Accessibility
- Every control is at least 40px (44px for icon buttons). Focus rings are 2px red with a 3px offset.
- The quantity stepper is a labelled group ("Quantity for {title}"), and its buttons are labelled "One fewer" and "One more".
- The count and totals update politely for screen readers. The toast is a status message.
- The preview window is a real modal: focus goes into it, Escape closes it, and the image has alt text "Preview of your design on the {title}".
- With reduce motion on, there are no wipes, no rising, no shine and no ticket slide.
