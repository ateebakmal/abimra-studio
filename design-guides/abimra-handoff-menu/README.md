# Abimra Studio: mobile menu handoff for Claude Code

This package lets Claude Code swap your theme's mobile menu for the animated Abimra menu. Desktop navigation stays as it is.

## What to do
1. **Unzip** into your theme repository root as `abimra-handoff-menu/`, and add `abimra-handoff-menu/**` to `.shopifyignore`.
2. **Commit your theme first:** `git add -A && git commit -m "Before mobile menu"`.
3. **Open Claude Code** in the theme repository and send:
   ```
   Read abimra-handoff-menu/CLAUDE_CODE_PROMPT.md and abimra-handoff-menu/SPEC.md, and look at the screenshots in abimra-handoff-menu/reference/screens.
   Then do step 1 (inspect the theme) and send me your plan. Don't edit anything until I approve it.
   ```
4. **Review its plan,** especially the logo, the cart drawer and the old drawer files, then approve.
5. **Test** with `shopify theme dev` on your phone, against `reference/screens/`.
6. **In the theme editor,** under Header > Mobile menu: choose the menu, and set the red button link to your Customify designer page.

## Decide before or during the build
- **"Contact" appears twice:** once in the main links and again as "Contact us" at the bottom. To avoid that, remove Contact from the main menu in Online Store > Navigation, or keep both.
- **Child links:** the menu shows top-level links only. If your main menu has dropdowns (for example Shop > T-shirts), Claude Code will flag it, and you can decide whether you want an expanding list.
