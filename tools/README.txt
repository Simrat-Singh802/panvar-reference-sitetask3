VERIFICATION TOOLS
==================

Two PowerShell checks. They read the project files and report PASS/FAIL.
Nothing is installed, nothing is modified, and neither is required to build
or deploy the site — they exist so a change can be checked in seconds.

Run from anywhere:

    powershell -File tools\verify.ps1
    powershell -File tools\contrast.ps1


verify.ps1
----------
Checks the contracts between the HTML and the JavaScript — the wiring that a
browser would exercise but that no compiler will ever catch, because there is
no build step here.

  - site.config.js is well formed and the TODO flags are still set
  - every [data-contact] and [data-link] hook in the markup has JS behind it
  - every validation rule in forms.js maps to a real field with an error slot
  - the nav drawer's ARIA wiring is consistent (aria-controls -> id)
  - each accordion trigger points at a panel that exists
  - progressive enhancement is intact (no-js class, deferred scripts)
  - none of the file:// hazards have crept back in:
      no fetch() of partials, no ES modules, no external <use>, no @import

Run it after editing any HTML or JS. Expect: TOTAL FAILURES: 0


contrast.ps1
------------
Computes WCAG 2.1 contrast ratios for every colour pair the site actually
uses, across both brand themes.

  - body and muted text          >= 4.5:1
  - interactive borders          >= 3:1

Run it after changing ANY colour in 01-tokens.css, 06-brand-zonixa.css or
07-brand-msp.css. Expect: failures: 0

This is not decoration. --clr-line-strong was originally #b9bec7, which
measured 1.87:1 against white and failed the 3:1 requirement for input
borders. This script caught it; a visual review would not have.


make-og-image.ps1
-----------------
Regenerates assets\img\og\og-default.jpg, the 1200x630 social sharing card
used by the six non-product pages.

    powershell -File tools\make-og-image.ps1

Run it after changing the brand names, the company name, or the palette in
01-tokens.css. The 12 product pages don't use this file — each points its
og:image at the product photo it already displays.

Nothing on the card is invented: it uses the site's own colours, the
knit-stitch texture, and the verified company and brand names.


WHAT THESE DO NOT COVER
-----------------------
Neither script renders the page, so they cannot see layout, spacing or
overflow. Still do the manual pass before shipping:

  1. Open each page from disk and check the console is clean
  2. Resize to 320px and confirm nothing scrolls sideways
  3. Tab through with the keyboard only — focus must always be visible
  4. Disable JavaScript and confirm every page is still readable
