# Panwar Knitwear — Website

A static marketing site for Panwar Knitwear, a knitwear manufacturer in
Ludhiana, Punjab, operating the **ZONIXA** (topwear) and **MSP Sports**
(bottomwear) brands.

**No build step. No dependencies. No install.** Double-click `index.html` and
it runs.

---

## Editing the site

### Change a phone number, WhatsApp number, email or address

Edit **`assets/js/site.config.js`** only. Those values are stamped into every
page at runtime, so one edit updates all six pages. Do not hand-edit contact
details in the HTML.

### Add product photos

Drop correctly-named files into `assets/img/`. They appear immediately with no
HTML changes — see [`assets/img/README.txt`](assets/img/README.txt) for the
exact filenames and sizes.

### Change the header or footer

These are duplicated across all six pages (see *Why no framework* below).
Edit [`docs/partials-reference.html`](docs/partials-reference.html) first, then
propagate. Find every copy by searching for:

```
SITE HEADER — canonical source
SITE FOOTER — canonical source
```

You do **not** need to touch the header per page for the active nav link — it
is set automatically from the URL.

### Change colours, spacing or type

Everything lives in `assets/css/01-tokens.css`. No other file hardcodes a hex
value, font size or duration. Brand-specific overrides are in
`06-brand-zonixa.css` and `07-brand-msp.css`.

---

## Outstanding content

See [`docs/CONTENT-TODO.md`](docs/CONTENT-TODO.md). Unconfirmed items show as
amber markers on the page rather than being silently invented or left blank.

---

## Project structure

```
index.html  zonixa.html  msp-sports.html  about.html  contact.html  404.html

assets/css/   00-reset   01-tokens   02-base     03-layout      04-components
              05-sections 06-brand-zonixa 07-brand-msp 08-utilities 09-animations
assets/js/    site.config  nav  ui  reveal  forms  main
assets/svg/   logos, branded placeholders, icon sprite master, knit pattern
assets/img/   ← drop real photography here
docs/         partials-reference.html · component-library.html · CONTENT-TODO.md
```

Stylesheets load in numeric order and must stay that way. There is no
`@import` anywhere — it serialises requests and degrades under `file://`.

---

## How the two brands stay distinct

Both brands are themed by **overriding CSS custom properties on a subtree**:

```html
<body data-brand="zonixa">          <!-- themes a whole page -->
<section data-brand="msp">          <!-- themes one section -->
```

| | ZONIXA | MSP Sports |
|---|---|---|
| Accent | Deep plum `#3b1f38` | Sport blue `#0b5cad` |
| Corners | Sharp (2px) | Rounded (14px) |
| Type | Wide-tracked, uppercase | Tight, punchy |
| Cards | 3:4 portrait, editorial | 1:1 square, kinetic |
| Motion | Restrained | Faster, more lift |

Because the scoping is cascade-based rather than per-page, both brands render
**correctly side by side** in the homepage brand split. The same components
re-skin themselves — there is no duplicated component CSS.

---

## Why no framework

Node.js is not installed on the development machine, so React/Vite/Next could
not be built, previewed or verified. Static HTML also matches the project's
"avoid unnecessary dependencies" rule.

This has one consequence worth understanding, because it explains several
decisions that would otherwise look odd. Pages are opened directly from disk,
and browsers treat every `file://` document as an **opaque origin**, which
blocks:

| Blocked under `file://` | What was done instead |
|---|---|
| `fetch()` of HTML partials | Header/footer duplicated, JS-hydrated |
| `<script type="module">` | Classic `<script defer>`, `window.PK` namespace |
| `<use href="icons.svg#id">` | Icon sprite inlined into each page |
| Root-relative `/paths` | Always relative with explicit `.html` |

**Do not "fix" any of these by reintroducing the blocked pattern.** Each one
breaks the site the moment it is opened from disk.

The drift risk from duplicated chrome is contained by moving everything
volatile into JS: contact details come from `site.config.js`, the active nav
link from `location.pathname`, and the copyright year from `Date`. What remains
duplicated is inert structural markup.

---

## Accessibility

- Skip link, landmark elements, one `<h1>` per page, no heading-level skips
- Mobile drawer: `aria-expanded`, focus trap, `Esc` to close, focus restored
- Focus indicators never removed; all token pairs meet **WCAG AA**
- Real `<label>` on every input; errors via `role="alert"` + `aria-describedby`
- 44×44px minimum touch targets
- Motion gated twice — CSS `prefers-reduced-motion` and a JS bail in `reveal.js`
- **Works with JavaScript disabled**: nav falls back to an inline link list

## Performance

- Zero third-party requests — no CDN, no web fonts, no analytics
- 55 KB CSS + 25 KB JS uncompressed for the entire site, comments included
  (roughly 15 KB combined over the wire once a host gzips it)
- Explicit `width`/`height` on every image (CLS ≈ 0); below-fold images lazy
- Only `transform` and `opacity` are animated
- One shared `IntersectionObserver` that unobserves after first reveal
- Sticky-header state uses a sentinel element, not a scroll listener

---

## Deploying

Upload the whole folder to any static host — Netlify, Vercel, GitHub Pages,
Cloudflare Pages, or ordinary shared hosting via FTP. There is nothing to
build and no server-side runtime.

Two things to do at deploy time:

1. Point `404.html` at your host's not-found handler (Netlify and Cloudflare
   Pages pick it up automatically; Apache needs
   `ErrorDocument 404 /404.html`).
2. Update the URLs in `sitemap.xml` and each page's `<link rel="canonical">`
   if the domain differs from `panwarknitwear.com`.

---

## Local development

Opening the files directly works completely — that is the design.

If you later install Node and want a local server (which enables live reload
and lets you test as the deployed site behaves):

```
npx serve .
```

Nothing in this project requires it.

---

## Component reference

Open [`docs/component-library.html`](docs/component-library.html) in a browser
to see every component rendered under both brands. Build and check new
components there before wiring them into a page.
