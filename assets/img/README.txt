IMAGE DROP-IN CONTRACT
======================

Every image slot on the site already points at a filename in this folder.
Until that file exists, an onerror handler swaps in a branded SVG placeholder.

  >>> Drop a correctly-named file in, and it appears immediately.
  >>> No HTML editing is required. Ever.

If a photo does not show up, the filename is wrong. Check it character by
character against the list below (names are case-sensitive on most hosts).


FILENAMES EXPECTED
------------------

assets/img/zonixa/            (portrait, 3:4 — e.g. 900 x 1200)
  [PRESENT] zonixa-hoodie-logo.jpg        Heavy 320 GSM Round Neck Hoodies With Logo
  [PRESENT] zonixa-hoodie-filice.jpg      Two Thread Filice Round Neck Hoodies
  [PRESENT] zonixa-hoodie-chestprint.jpg  320 GSM Heavy Round Neck Hoodies with Chest Print
  [PRESENT] zonixa-tshirt-dryfit.jpg      Dry Fit Ben Collar Half Sleeve T Shirts
  [PRESENT] zonixa-hoodie-zip.jpg         320 GSM Heavy Zip Hoodies
  [PRESENT] zonixa-sweatshirt.jpg         Matty Filice R/N Chest Print Sweatshirt
  [PRESENT] zonixa-winter.jpg             Winter Hoodies, Filice R/N Chest Print

  The first five are the company's own studio photographs from
  panwarknitwear.com (982 x 1147), showing ZONIXA labels, hangtags and
  Panwar Knitwear packaging. The last two come from Panwar's own IndiaMART
  listing (500px catalogue sheets) — genuine, but lower resolution.

assets/img/msp/               (square, 1:1 - e.g. 1000 x 1000)
  !! PLACEHOLDERS - NOT MSP PRODUCTS !!

  msp-track-pants.jpg   white t-shirt on a model
  msp-lowers.jpg        dress socks branded "Baldello" (another company)
  msp-nikkar.jpg        rail of t-shirts
  msp-capri.jpg         folded knitwear on a chair
  msp-shorts.jpg        formal shirts branded "nimble made" (another company)
  msp-sportswear.jpg    genuine MSP joggers - the only real product here

  The first five are the Unsplash stock photos used on panwarknitwear.com,
  installed at the owner's explicit request. None of them show bottomwear,
  and two carry other companies' branding. They MUST be replaced before
  launch - see docs/CONTENT-TODO.md for the restore path.

  Genuine MSP product photography exists on Panwar's IndiaMART listing
  (seller 83235243). The previous product-only set is backed up in the
  session scratchpad as msp-backup-v2.

assets/img/facility/          (landscape, 4:3 — e.g. 1200 x 900)
  [NEEDED] facility-01.jpg      Homepage craftsmanship section
  [NEEDED] facility-02.jpg      About page

  Same reason: the "who we are" and "our craftsmanship" images on
  panwarknitwear.com are generic stock (an office silhouette and a tailoring
  bench), not the Ludhiana facility. Real facility photographs needed.

assets/img/og/                (1200 x 630 — social sharing previews)
  og-default.jpg
  og-zonixa.jpg
  og-msp.jpg
  (These are referenced in the og:image meta tags once added — see
   CONTENT-TODO.md.)


ASPECT RATIOS MATTER
--------------------
Cards crop with object-fit: cover, so an image at the wrong ratio will be
cropped, not letterboxed. ZONIXA cards are 3:4 (taller — editorial) and MSP
cards are 1:1 (squarer — bottomwear photographs wider). Shoot or crop to the
ratio above and nothing important gets cut off.


BEFORE YOU EXPORT
-----------------
1. Resize first. Do not upload a 6000px camera file — 1200px on the long edge
   is plenty for these layouts on a high-DPI screen.
2. Export as JPEG at quality 75-82. Aim for under 200 KB per product photo.
3. Prefer .webp if your tooling supports it (typically 25-35% smaller). If you
   switch format, update the extension in the HTML too — that IS an HTML edit,
   so .jpg is the simpler path.
4. Keep backgrounds consistent across a range. A plain white or light grey
   sweep makes the grid look considered rather than assembled.


ALT TEXT
--------
Already written in the HTML, describing the intended garment rather than
saying "placeholder" — so it stays correct once real photos land and needs no
editing.
