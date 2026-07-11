# COMPONENTS.md — The reusable‑parts registry

The single source of truth for what reusable parts exist, what they take, and
what still needs building. Before writing UI, **check this registry** — if a part
exists, use it; if it half‑exists, extend it; only then create.

Status legend: **Stable** (use as‑is) · **Needs work** (exists, off‑standard) ·
**Planned** (build when a phase reaches it).

---

## 1. Snippets — reusable markup

Render with named args and a documented `{% comment %}` header:

```liquid
{% render 'button', label: 'Shop', href: product.url, style: 'primary' %}
```

### Existing

| Snippet | Purpose | API | Status |
|---------|---------|-----|--------|
| `product-card` | Collection/grid product card | `product` (req), `show_name` (bool) | **Needs work** — inlines price instead of using `price`; hardcoded LT strings (`Išparduota`, `Naujiena`); fragile tag matching |
| `price` | Price block (current + compare + % chip) | `product:` **or** `price:` + `compare_at:` | **Needs work** — hardcoded `€289/€340/–15%` fallback literals; `money \| remove:'€'` breaks multi‑currency |
| `section-appearance` | Per‑section **colour scheme** + text‑colour + type‑scale overrides via scoped `{% style %}` | `section` (req) | **Stable** — applies `color_scheme` (full palette remap + bg/text paint) then `text_color`/scales. Adopted in 19 content sections; `scheme-1` default = pixel parity |
| `meta-social` | Open Graph / Twitter meta tags | reads globals | **Stable** |
| `structured-data-product` | Product JSON‑LD | `product` | **Stable** |
| `dock` | Mobile bottom navigation | reads settings | **Stable** |
| `mobile-menu` | Off‑canvas mobile menu | reads settings/menus | **Needs work** — behaviour should move to `Drawer` component |
| `search-overlay` | Full‑screen search overlay | reads settings | **Needs work** — pair with `predictive-search.js` cleanly |
| `cookie-banner` | GDPR consent banner | reads settings | **Stable** |
| `customer-address-fields` | Address form fields | `address` (confirm on touch) | **Stable** |
| `product-gallery` | PDP media gallery + dots (split from `main-product`) | `product` | ✅ verified live |
| `product-glance` | PDP at-a-glance bento | `block`, `product` | ✅ verified live |
| `product-reviews` | PDP reviews + `review` sub-blocks | `section`, `block`, `product` | Stable |
| `product-related` | PDP related-products grid | `block`, `product` | ✅ verified live |
| `product-docs` | PDP doc sections (spec/story/care) | `section`, `product` | ✅ verified live |
| `faq-fallback` | DUK/FAQ hardcoded empty-state (rail + 6 groups) | — | Stable (split from `main-duk`) |
| `care-*` (daily/leather/suede/storage/fixes/kit) | Shoe-care page thematic sections | `section` | Stable (split from `main-avalynes-prieziura`) |
| `care-steps` | Numbered tutorial-step list for one care `group` | `section`, `group` | Stable — de-duplicates the identical `tstep` markup shared by `care-leather` + `care-suede` |
| `accordion-item` | One `<details>` FAQ/disclosure row (+ optional index) | `question`, `answer`, `index`, `open`, `attrs` | Stable — unifies `main-duk`'s `qa` + `main-grazinimai`'s `faq` markup onto canonical `.accordion` classes; each section keeps its look. Verified live |
| `step` | One numbered step (number + title + body) | `num`, `title`, `body`, `attrs` | Stable — shared by `main-dydziu-lentele` + `main-avalynes-prieziura` (storage); canonical `.step*` classes, per-section styling. Verified pixel-identical |
| `cart-empty` / `cart-upsell` | Cart empty-state + upsell | `section` | Stable (split from `main-cart`) |
| `collection-filter-drawer` | Off-canvas filters (swatch case) | `section`, `collection`, `paginate` | Stable — clean compile |
| `collection-notes` | Collection notes (`note_row`) | `section` | Stable (split from `main-collection`) |
| `stat` | Shared page-head stat — **unifies 5 sections** | `k`, `v`, `tabular`, `accent`, `attrs` | ✅ verified live |

### Planned primitives (the missing library)

| Snippet | Purpose | Proposed API |
|---------|---------|--------------|
| ✅ `button` **(shipped M2)** | The one button, everywhere — **anchor CTAs** | `label`, `href`, `style`, `size`, `arrow`, `aria_label`, `target`, `id`, `class`. Adopted in `home-hero`/`home-fit`/`home-visit`; rollout continues. Behavioral `<button>` (submit/ATC/drawer) not yet covered. |
| `heading` | Consistent headings + level control | `text`, `level` (1–6), `size`, `eyebrow` |
| `image` | Responsive image with sizes/loading | `image`, `sizes`, `widths`, `loading`, `fetchpriority`, `alt` |
| `video` | Native/host video with poster | `video`, `poster`, `autoplay`, `loop`, `muted` |
| `icon` | Inline SVG sprite icon | `name`, `size`, `aria_label` |
| `badge` | Sale / new / status pill | `label`, `variant` (`orange`/`white`/…) |
| `container` | Max‑width + gutter wrapper | `width` (`default`/`wide`/`full`), `tag` |
| `section-header` | Eyebrow + heading + intro cluster | `eyebrow`, `heading`, `text`, `align` |

`button`, `heading`, `image`, `badge` and the hardened `price` are the highest
‑leverage first extractions — they appear on nearly every page.

## 2. Blocks — merchant‑editable content

Target: a small **shared** vocabulary (theme blocks in `/blocks`, opted into with
`"blocks": [{ "type": "@theme" }]`), replacing today's per‑page one‑offs.

### Shipped `@theme` blocks

| Block | Purpose | Settings | Used by | Status |
|-------|---------|----------|---------|--------|
| `hours` | One opening‑hours row (day + time, closed/today) | `day`, `time`, `closed`, `highlight` | `home-visit`, `main-kontaktai` | ✅ **First `@theme` block** — verified live |

**The pattern (proven with `hours`):** move the row markup into
`/blocks/<type>.liquid` with a stable BEM class; the section declares
`"blocks": [{ "type": "<type>" }]` and renders `{% content_for "blocks" %}`; **keep
the block type name** so existing template data is untouched; move each section's
styling onto the shared class, scoped under the section's own wrapper — so sections
that intentionally differ (e.g. `hours` is 14px on the homepage, 15px on contact)
stay pixel‑identical. Fits **single‑block‑type** sections; region‑grouped sections
(`main-product`, `main-avalynes-prieziura`, `main-grazinimai`, `main-akciju-salygos`,
`main-dydziu-lentele`) place heterogeneous blocks in different regions and need
per‑block `{% content_for "block", type, id %}` or stay section‑local for now.

### Target vocabulary

| Block | Content shape |
|-------|---------------|
| `heading` | A heading (+ optional eyebrow) |
| `rich_text` | A block of formatted copy |
| `button` | A single CTA |
| `image` | An image (+ caption) |
| `video` | An embedded/native video |
| `product` | A product reference |
| `collection` | A collection reference |
| `article` | A blog article reference |
| `accordion_item` | A question/answer or disclosure row |
| `stat` | A label + value (+ optional tabular figure) |
| `step` | A numbered/titled step with body (+ optional tip) |
| `badge` | A small pill |
| `icon` | A single icon |
| `divider` | A visual rule |
| `spacer` | Vertical whitespace |

### Migration map (current → shared)

| Current one‑off block | Section(s) | Becomes |
|-----------------------|-----------|---------|
| ✅ `qa` + `faq` | `main-duk` + `main-grazinimai` | **`accordion_item`** (done — type renamed, settings canonicalised, shared `accordion-item` snippet, count-verified) |
| `group` | `main-duk` | `heading` (group header) or accordion group |
| `story` | `main-apie-mus` | `rich_text` (+ `eyebrow`) |
| `stat` (`label`/`value`) | `main-apie-mus` | `stat` |
| `stat` (`k`/`v`/`tabular`) | `main-avalynes-prieziura` | `stat` — **same block, one schema** |
| `habit`, `tstep`, `fix`, ✅ `store_row`, `mstep` | `main-avalynes-prieziura`, `main-dydziu-lentele` | `step` — **`store_row`+`mstep` done** (renamed to `step`, shared `step` snippet, pixel-verified); `habit`/`tstep`/`fix` are distinct designs, left section-local |
| `kit_item` | `main-avalynes-prieziura` | `stat` / `rich_text` (list row) |
| `chip` | `main-avalynes-prieziura` | anchor‑nav (section feature, not content) |

The block **data** in the JSON templates is preserved verbatim during migration —
only the block `type` and its setting IDs are normalised (see
[SCHEMA_GUIDE.md](SCHEMA_GUIDE.md) §1).

## 3. JavaScript components — reusable behaviour

Target: `assets/component-*.js` (Shopify's `assets/` is flat), ideally as Custom Elements so the Theme Editor
re‑initialises them on section load. Sections initialise; nothing page‑specific.

| Component | Behaviour | Replaces (today) |
|-----------|-----------|------------------|
| `Accordion` | Expand/collapse disclosure groups | `duk.js`, ad‑hoc toggles |
| `Carousel` | Horizontal slider / scroll‑snap track | per‑section sliders |
| `Drawer` | Off‑canvas panels (menu, cart, filters) | mobile‑menu JS in `chrome.js` |
| `Modal` | Focus‑trapped dialogs (size chart, quick view) | one‑off modal code |
| `Sticky` | Sticky‑on‑scroll elements | scattered scroll handlers |
| `Reveal` | On‑scroll enter animations | per‑page reveal scripts |
| `Video` | Lazy/lightbox video control | `article.js`, product media JS |
| `Tabs` | Tabbed panels | bespoke tab code |
| ✅ `scroll-spy` **(shipped — first Custom Element)** | Subnav scroll-spy; Theme-Editor-aware (`connectedCallback`), `data-spy-margin` config, click-to-highlight | replaced `avalynes-prieziura.js` + `grazinimai.js` (2 sections, 1 component) |
| `ScrollObserver` | Shared IntersectionObserver utility | duplicated observers |

**Retained shared modules:** `chrome.js` (global header/dock/menu/overlay glue)
and `predictive-search.js` — refactor toward the component pattern but keep them
as the shared core, not page scripts.

**Page scripts to retire** as their behaviour moves into components:
`kontaktai.js`, `grazinimai.js`, `avalynes-prieziura.js`, `accessories.js`,
`duk.js`, `customers.js`, `collection.js`, `cart.js`, `product.js`,
`product-tryon.js`, `gift-card.js`, `password.js`.

## 4. When to create a new part

1. **Second occurrence rule** — the moment identical markup/behaviour/content
   shape appears a second time, extract it here.
2. **Right layer** — markup → snippet; behaviour → JS component; merchant content
   → block. Never solve one with another.
3. **Register it** — add the row to this file with its API and status in the same
   change. An unregistered component doesn't exist.
4. **Name by concept, not page** — `stat`, not `about-stat`.
