SELF-HOSTED FONTS
=================

The site currently uses a system font stack. That is deliberate: it costs zero
network requests, renders instantly with no layout shift, and looks clean at
the tracking and scale used here.

If you licence a display typeface and want to use it:

1. Put the .woff2 files in this folder.

2. Add @font-face rules at the TOP of assets/css/01-tokens.css:

   @font-face {
     font-family: "Panwar Display";
     src: url("../fonts/your-display-font.woff2") format("woff2");
     font-weight: 400 700;          /* a range if variable, else one value */
     font-display: swap;            /* text stays visible while loading */
     font-style: normal;
   }

3. That is all. The token --font-display already lists "Panwar Display" first,
   so it will be picked up automatically. Same for "Panwar Text" and
   --font-body.

4. Optionally preload the one or two faces used above the fold, in each page's
   <head>, BEFORE the stylesheets:

   <link rel="preload" as="font" type="font/woff2"
         href="assets/fonts/your-display-font.woff2" crossorigin>

   Only preload fonts actually used in the hero. Preloading everything is
   slower than preloading nothing.


DO NOT use Google Fonts via <link>. It adds a third-party request on every
page load, blocks rendering, and is a data-protection consideration in some
jurisdictions. Download the .woff2 and self-host it here instead.

WHY WOFF2 ONLY: every browser that matters supports it, and it compresses
far better than .ttf or .otf. Shipping .ttf files would roughly double the
download for no benefit.
