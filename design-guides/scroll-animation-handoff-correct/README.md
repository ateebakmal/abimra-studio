# Abimra Studio: brand story handoff for Claude Code

This package lets Claude Code add the scroll story section under your homepage hero, in your existing theme.

## What to do
1. **Unzip** this folder into the root of your theme repository as `abimra-handoff/`.
2. **Stop Shopify uploading it:** add this line to `.shopifyignore` in the theme root (create the file if it doesn't exist):
   ```
   abimra-handoff/**
   ```
3. **Commit your theme first,** so every change Claude Code makes is easy to review or undo (`git add -A && git commit -m "Before brand story"`).
4. **Open Claude Code** in the theme repository and send it this message:
   ```
   Read abimra-handoff/CLAUDE_CODE_PROMPT.md and abimra-handoff/SPEC.md, and look at the screenshots in abimra-handoff/reference/screens.
   Then do step 1 (inspect the theme) and send me your plan. Don't edit anything until I approve it.
   ```
5. **Review its plan,** especially what it says about the header, fonts and overflow, then tell it to go ahead.
6. **Check the result** with `shopify theme dev` on your phone and your laptop, against the screenshots in `reference/screens/`.
7. **Set the button link** in the theme editor: Brand story > Button link > your Customify designer product page.

## What's inside
- `CLAUDE_CODE_PROMPT.md`: the full brief for Claude Code.
- `SPEC.md`: how the section works, its timeline and what it needs from the page.
- `theme-files/`: the finished section, its CSS and JS, and optional self-hosted fonts.
- `reference/`: a standalone preview of the section, the full homepage design and 16 reference screenshots.
- `licences/`: the fonts' open-font licences (free for commercial use; keep these with the files).

Ignore older files named "abmira-…" from earlier in our chat. These files replace them.
