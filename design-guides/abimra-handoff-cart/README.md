# Abimra Studio: cart page design handoff for Claude Code

A design guide for the cart page: layout, tokens, components, states, motion and copy. Shopify cart logic and the product designer app are wired up as usual; this package only covers how the page looks and behaves.

## Kickoff message for Claude Code
Unzip this folder into your theme repository as `abimra-handoff-cart/`, add `abimra-handoff-cart/**` to `.shopifyignore`, commit, then send:

```
Read abimra-handoff-cart/CART_DESIGN_GUIDE.md. That's the design for our cart page.
Open abimra-handoff-cart/reference/abimra-cart.html to see it working, and match the screenshots in abimra-handoff-cart/reference/screens/ (phone first).
Reuse the CSS in abimra-handoff-cart/reference/code/ where it helps. cart.js runs on demo data, so use it only as a behaviour reference.
Look at our current cart template first and send me a plan. Don't edit anything until I approve it.
```

## What's inside
- `CART_DESIGN_GUIDE.md`: the design guide.
- `reference/abimra-cart.html`: the working design, with sample data.
- `reference/screens/`: 13 screenshots, desktop and phone, covering every state.
- `reference/code/`: the reference CSS and JS, and the quick-loader kit it uses.
