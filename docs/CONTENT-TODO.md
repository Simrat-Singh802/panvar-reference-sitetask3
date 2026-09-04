# Content to confirm

Everything on this site is drawn from panwarknitwear.com or the ZONIXA brand
site. Where a fact was not published, **nothing was invented** — the gap is
listed here and shows on the site as a visible amber marker.

Work top to bottom: the first three items are what stop this site going live.

---

## 1. Blocking — needed before launch

### Email address
- **Where:** `assets/js/site.config.js` → `email.value`
- **Now:** renders an amber "Email address to be confirmed" chip.
- **Why blocking:** the current reference site publishes the literal string
  `email@example.com`. Publishing that would send real enquiries nowhere, so
  it was deliberately not carried over.
- **Fix:** set `value` to the real address and change `todo: true` → `false`.
  An email fallback button then appears on the enquiry form automatically.

### Which number receives WhatsApp
- **Where:** `assets/js/site.config.js` → `whatsapp.dial`
- **Now:** defaults to **+91 98760 45457** (the first number listed publicly).
- **Why blocking:** every WhatsApp button and the whole enquiry form point
  here. If this is not a WhatsApp-enabled line, enquiries silently fail.
- **Fix:** confirm the number, then set `todo: false`.
- Format is country code + number, no `+` or spaces: `919876045457`.

### MSP Sports product names
- **Where:** [msp-sports.html](../msp-sports.html), the product grid
- **Now:** the six real product *categories* (track pants, lowers, shorts,
  nikkar, capri, sportswear), each with a placeholder image.
- **Why blocking:** the reference site lists these as "Product 1" to
  "Product 5" — no real names exist to carry across. ZONIXA has five properly
  named products, so MSP currently looks thinner by comparison.
- **Fix:** send product names, fabric and GSM for each, and the cards can be
  filled in to match ZONIXA.

---

## 2. Important — improves credibility

### Street address
- **Where:** `assets/js/site.config.js` → `company.street.value`
- **Now:** only "Ludhiana, Punjab, India" is shown; a marker sits where the
  street address belongs.
- **Note:** a full address also improves local SEO and lets the JSON-LD
  `PostalAddress` in each page's `<head>` be completed.

### Product photography
- **Where:** `assets/img/` — see [the drop-in contract](../assets/img/README.txt)
- **Done:** all 13 product cards use genuine Panwar photography. No stock or
  generic images were used anywhere on the site.
  - 5 ZONIXA products from panwarknitwear.com (982×1147 studio shots)
  - 2 ZONIXA (sweatshirt, winter hoodie) from the IndiaMART listing
### ⚠ BLOCKING — all five MSP placeholder images

The MSP grid is now five cards titled **Product 1–5** (the Sportswear card was
removed at the owner's request, along with the only genuine MSP photo on the
page). All five show the **Unsplash stock photos from panwarknitwear.com**,
reproduced at the owner's explicit request after being shown what they depict.

**They are not MSP products and none of them show bottomwear:**

| Card | File | Image actually shows |
|---|---|---|
| Product 1 | `msp-track-pants.jpg` | a white t-shirt worn by a model |
| Product 2 | `msp-lowers.jpg` | dress socks branded **"Baldello"** (another company) |
| Product 3 | `msp-shorts.jpg` | formal shirts branded **"nimble made"** (another company) |
| Product 4 | `msp-nikkar.jpg` | a rail of t-shirts |
| Product 5 | `msp-capri.jpg` | folded knitwear on a chair |

Note the filenames no longer describe their contents — they are historical.

**These same five images now also appear on the MSP product detail pages**
(`product-msp-*.html`), because the card and its detail page must show the
same photograph. So each MSP detail page pairs a placeholder photo with
*accurate* article numbers, materials and descriptions for the real product.
Every one of those pages carries a visible callout explaining the mismatch.

Replacing the five card images fixes the card and its detail page together —
the two are wired to the same file. The genuine MSP photography (real MSP
garments, product-only, normalised to 800×800) is in `msp-backup-v2` in the
session scratchpad.

`msp-sportswear.jpg` is still on disk but **no longer referenced by any page**.
It is the one genuine MSP product photo (grey cuffed joggers) and was kept so
the card can be restored without re-downloading.

Risks if published as-is: every card misrepresents its product; two display
a competitor's branding on Panwar's own site; and the Unsplash licence terms
for these images have not been reviewed for this use.

**Fix:** restore the genuine MSP photography from Panwar's IndiaMART listing
(seller 83235243) — those files are in `msp-backup-v2` in the session
scratchpad, or can be re-downloaded. The previous set was product-only and
normalised to 800×800 on pure white.

If restoring, re-run `tools/normalise-product-image.ps1` on any new photo so
it matches the set's framing (garment's longest side at 82% of an 800×800
white canvas, centred), otherwise it will visibly jump in scale.
- **When replacing MSP images, keep the product-only standard.** Panwar's own
  listings contain many model shots and promotional collages; those were
  deliberately rejected for this grid.
### Facility photographs — slots removed, not filled

Two image slots existed for the Ludhiana facility and have now been **removed
from the markup** because no genuine photograph was available and a visible
placeholder looked unfinished:

| Page | Section | Expected file |
|---|---|---|
| `index.html` | "Fabrics we work in" | `assets/img/facility/facility-01.jpg` |
| `about.html` | "Who we are" | `assets/img/facility/facility-02.jpg` |

Both sections are now single-column text (the `.split` wrapper was dropped so
the copy isn't stranded in a half-width column). Each has an HTML comment
marking where the image was.

The reference site's images for these spots are generic stock — a blue-tinted
office silhouette and a tailoring bench — not Panwar's premises, so they were
not used.

**To restore:** get real photographs of the Ludhiana facility (production
floor, knitting machines, finished stock), landscape 4:3 at ~1200×900, save
them under the filenames above, then re-wrap each section in
`<div class="split split--wide-start">` and re-add the `<figure
class="media-frame">` block. The comment in each file marks the spot.

### Social sharing images
- Once `assets/img/og/og-default.jpg` (1200×630) exists, add to each page head:
  `<meta property="og:image" content="assets/img/og/og-default.jpg">`
- Matters more than it sounds: B2B enquiries get forwarded as links on
  WhatsApp and LinkedIn, and a link with no preview image looks unfinished.

---

## 3. Unverified claims — deliberately left out

The ZONIXA brand site (zonixa.com) advertises:

- **"15+ Years Experience"**
- **"1000+ Happy Distributors"**

These do **not** appear on panwarknitwear.com, so they were treated as
unverified and omitted. If the company confirms them, they can be added as a
stat row on the homepage — the `.stat` component in
`assets/css/05-sections.css` is already built and styled for exactly this.

Also **not** stated anywhere and therefore never written: year founded,
production capacity, certifications, client names, awards, MOQ, and lead times.
MOQ and lead times in particular are what a wholesale buyer wants to know
before enquiring — worth publishing if the company is willing.

---

## 4. Technical note for the owner

**`mspsports.in` has an expired SSL certificate.** Visitors clicking that link
from the footer or the About page will hit a browser security warning, which
undermines trust at exactly the wrong moment. Worth renewing, or the link is
better removed until it is fixed.

---

## How the markers work

Anything unconfirmed renders as an amber chip (`.badge--todo`) or an amber
callout box (`.callout`). To find them all:

```
grep -rn "badge--todo\|callout__title\|todo: true" .
```

They are deliberately visible rather than silent, so nothing unfinished
reaches production unnoticed. Once a value is filled in and `todo` is set to
`false`, its marker disappears on its own.
