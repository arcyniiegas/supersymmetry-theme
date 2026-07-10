# ARCHITECTURE.md — System design

How the Supersymmetry theme is structured, why, and how we move it from where it
is to where it needs to be. Read [CLAUDE.md](CLAUDE.md) first for the rules; this
document explains the system those rules protect.

---

## 1. Philosophy

The theme is a **framework, not a folder of pages**. A merchant page is an
*arrangement* of shared parts, never a bespoke artefact. Three sentences govern
everything:

- **Sections orchestrate layout.**
- **Blocks represent merchant‑editable content.**
- **Snippets and components render reusable UI and behaviour.**

Business logic and UI must never be duplicated. If a thing exists twice, one of
them is wrong.

## 2. The layer model

Every file belongs to exactly one layer and may only depend *downward*. This is
the spine of the whole theme.

```
┌ layout ─────────── the HTML shell, global assets
│  └ templates ───── compose sections, hold merchant content (JSON)
│     └ sections ─── orchestrate layout, accept blocks, initialise components
│        └ blocks ── one unit of merchant-editable content (shared vocabulary)
│           └ snippets ─── render one reusable piece of markup
│              └ components (CSS + JS) ─── the look & behaviour of one thing
│                 └ base ─── resets, element defaults, layout primitives
│                    └ tokens ─── design decisions as CSS variables
```

| Layer            | Lives in                        | Owns                                                            | Must **not** |
|------------------|---------------------------------|----------------------------------------------------------------|--------------|
| **Tokens**       | `assets/tokens.css`             | Design decisions as CSS vars: color schemes, type scale, spacing, radius, glass | Contain selectors or component rules |
| **Base**         | `assets/base.css`               | Resets, element defaults, base typography, layout primitives   | Component‑specific styling |
| **Components (CSS)** | `assets/component-*.css`    | The look of **one** reusable thing (button, card, accordion)   | Page or section layout |
| **Components (JS)**  | `assets/component-*.js`     | **One** reusable behaviour (Accordion, Carousel, Drawer)       | Page‑specific glue |
| **Snippets**     | `snippets/*.liquid`             | Render **one** reusable piece of markup (button, price, image) | Business orchestration |
| **Blocks**       | `blocks/*.liquid` (+ section‑local) | One unit of merchant‑editable content, from the shared vocabulary | Fixed layout, page logic |
| **Sections**     | `sections/*.liquid`             | Orchestrate layout, accept blocks, initialise components        | Re‑implement UI or behaviour |
| **Templates**    | `templates/*.json`              | Compose sections, hold content data                            | Markup or logic |
| **Layout**       | `layout/*.liquid`               | HTML shell, global asset loading                               | Page content |

**Reading the model:** a section may render a snippet, accept a block, and start
a JS component — but it may not contain a button's markup, an accordion's
behaviour, or a page's copy. Those live one layer down.

## 3. Directory structure

Current, with the target additions marked `←`:

```
assets/
  tokens.css              ← design tokens (new)
  base.css                  resets + primitives (slim down; today 42 KB)
  component-*.css        ← button, card, accordion, badge… (new; assets/ is flat)
  component-*.js         ← accordion, carousel, drawer… (new)
  section-*.css            layout-only section CSS (thin down; keep the prefix)
  chrome.js                shared core JS (header, dock, menu, overlay)
  predictive-search.js     shared search JS
  geist*.woff2             self-hosted fonts
blocks/                   ← shared @theme block vocabulary (new)
config/
  settings_schema.json      global settings (add color schemes + typography)
  settings_data.json
layout/
  theme.liquid              HTML shell; loads base.css + chrome.js + predictive-search.js
  password.liquid
locales/
  lt.default.json           Lithuanian (default) — every customer-facing string
  en.json                   English
sections/                   38 sections + header-group.json + footer-group.json
snippets/                   10 partials today; the primitive library grows here
templates/                  JSON templates (+ gift_card.liquid legacy)
```

## 4. Rendering pipeline

```
request → layout/theme.liquid
  ├─ <head>: preload fonts, base.css, content_for_header, meta-social snippet
  ├─ {% sections 'header-group' %}
  ├─ <main>{{ content_for_layout }}</main>   ← the page's JSON template renders here
  │     └ template JSON → ordered sections → each section renders blocks + snippets
  ├─ {% sections 'footer-group' %}
  ├─ global snippets: dock, mobile-menu, search-overlay, cookie-banner
  └─ deferred core JS: chrome.js, predictive-search.js
```

**Asset loading.** `base.css` and the two core scripts load globally in the
layout. Everything else must load **only where used**: a section pulls its
stylesheet with `{{ 'component.css' | asset_url | stylesheet_tag }}` (Shopify
de‑duplicates identical URLs) and its behaviour by initialising a shared JS
component. New work should prefer component assets over per‑section files.

## 5. Current state — an honest assessment

The theme is competently built at the surface (responsive images, section
groups, presets, i18n, real block‑driven content) but **fragmented** underneath.
The single root cause: *every page reinvents its own parts.*

- **A duplicated block vocabulary.** Content pages define one‑off block types —
  `qa`, `story`, `habit`, `tstep`, `fix`, `kit_item`, `store_row`, `chip` — each
  used on exactly one page. Several are the same underlying UI wearing different
  names. A `stat` block is defined **twice** with **incompatible** schemas:
  `label`/`value` in `page.apie-mus.json`, `k`/`v`/`tabular` in
  `page.avalynes-prieziura.json`.
- **Page‑scoped CSS and JS.** No design-token file, no component layer (Phase 0
  introduces `tokens.css`). Instead
  `base.css` (42 KB) plus `section-product.css` (39 KB), `section-home.css`
  (31 KB), `section-collection.css` (27 KB), and a bespoke stylesheet **and**
  script per content page (`duk`, `kontaktai`, `grazinimai`,
  `avalynes-prieziura`…). Shared behaviours — accordions, reveals — are
  re‑implemented per page.
- **Primitives get bypassed.** `snippets/price.liquid` exists, yet
  `product-card` re‑implements price inline. There is no `button`, `heading`,
  `image`, `icon`, `badge`, `container` or `section-header` snippet, so that
  markup is copy‑pasted across sections.
- **Unnormalised schema naming.** Single‑letter IDs in some sections, readable
  IDs in others; no shared convention.
- **No global design system.** `settings_schema.json` has no color schemes and
  no typography settings — design decisions live implicitly in `base.css`.

None of this is visible to a shopper, which is exactly why it is safe to fix.

## 6. Target state

- A single **`tokens.css`** holds every design decision; `base.css` shrinks to
  resets and primitives.
- An **`assets/component-*.css` / `component-*.js`** layer owns the look and
  behaviour of each reusable thing, once. (Shopify's `assets/` is flat — no
  subdirectories — so components are namespaced by filename prefix, Dawn‑style.)
- A **primitive snippet library** (`button`, `heading`, `image`, `icon`,
  `badge`, `container`, `section-header`, hardened `price`) renders shared markup.
- A **shared block vocabulary** in `/blocks` (`@theme` blocks) replaces the
  per‑page one‑offs, so one `accordion_item`, one `stat`, one `step` works
  everywhere.
- **Sections** become thin: layout, block loop, component init.
- **Templates** keep their content untouched, re‑pointed onto the shared parts.
- **`settings_schema.json`** gains proper **color‑scheme groups** and typography.

## 7. Migration strategy

The refactor is **behaviour‑preserving and incremental**. Two facts make it safe:

1. **The content already lives in the JSON templates as block data.** Migrating a
   page means introducing shared block types and re‑pointing the template's
   blocks onto them — the copy, order and structure are preserved verbatim.
2. **CSS is variable‑driven.** Because text colour, scales and glass already read
   from CSS custom properties, extracting tokens changes where a value is
   declared, not its computed result.

Per page, the loop is: build/extend the shared parts it needs → re‑point the
template → delete the bespoke section, stylesheet and script → **verify pixel
parity** → commit. One page per pass. The sequencing is in [TODO.md](TODO.md).

## 8. Architectural principles (decision record)

- **One responsibility per file.** A section over ~250–300 lines of Liquid is a
  smell — split it.
- **Blocks over settings** whenever a merchant might reorder or repeat something.
- **Theme blocks (`/blocks`, `@theme`) over section‑local blocks** whenever a
  content shape is used by more than one section — that is the platform's answer
  to the fragmentation problem and the key to reuse.
- **Dynamic sources** wherever a setting could bind to a metafield.
- **CSS custom properties over Liquid‑generated CSS.** Reserve scoped
  `{% style %}` for genuinely per‑section overrides (see `section-appearance`).
- **Progressive enhancement.** The page works without JS; components enrich it.
- **Accessibility and performance are designed in, not bolted on** — see
  [STYLE_GUIDE.md](STYLE_GUIDE.md).

When in doubt, return to the litmus test: *would Dawn or Prestige build it this
way?*
