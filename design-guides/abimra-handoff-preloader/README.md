# Abimra Studio: intro preloader handoff for Claude Code

This package lets Claude Code add the first-visit "First pull" intro (the 3D tee) to your theme.

## What to do
1. **Unzip** into your theme repository root as `abimra-handoff-preloader/`, and add `abimra-handoff-preloader/**` to `.shopifyignore`.
2. **Commit your theme first:** `git add -A && git commit -m "Before preloader"`.
3. **Open Claude Code** in the theme repository and send:
   ```
   Read abimra-handoff-preloader/CLAUDE_CODE_PROMPT.md first, then abimra-handoff-preloader/SPEC.md.
   Look at the screenshots in abimra-handoff-preloader/reference/screens/ and open abimra-handoff-preloader/reference/preloader-preview.html to see the target.
   The files to install are in abimra-handoff-preloader/theme-files/.
   Start with step 1 (inspect the theme) and send me your plan. Don't edit anything until I approve it.
   ```
4. **Review its plan,** especially any existing loader in the theme and what it says about the hero's entrance animation. Approve step 4 (the hero hand-off) if you want the hero to rise out from under the wipe.
5. **Test** with `shopify theme dev` in a **private window** (the intro plays once per visit).
6. **In the theme editor,** go to Theme settings > Intro preloader to change where it plays, its length and its wording.

## Worth knowing
- It plays on the **homepage only** by default, so people who click an ad for a product see the product straight away. You can switch it to any page.
- Lighthouse always sees the intro, because every Lighthouse run is a first visit, so expect a slightly lower mobile score on the homepage. Real returning shoppers don't see it again during a visit.
- Fonts: if you've already installed the brand story or the menu, the fonts are already there and Claude Code will skip them.
