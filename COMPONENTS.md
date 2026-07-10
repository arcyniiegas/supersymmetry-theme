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
| `section-appearance` | Per‑section text‑colour + type‑scale overrides via scoped `{% style %}` | `section` (req) | **Stable** — folds into `color_scheme` + tokens over time |
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
| `qa` | `main-duk` (FAQ) | `accordion_item` |
| `group` | `main-duk` | `heading` (group header) or accordion group |
| `story` | `main-apie-mus` | `rich_text` (+ `eyebrow`) |
| `stat` (`label`/`value`) | `main-apie-mus` | `stat` |
| `stat` (`k`/`v`/`tabular`) | `main-avalynes-prieziura` | `stat` — **same block, one schema** |
| `habit`, `tstep`, `fix`, `store_row` | `main-avalynes-prieziura` | `step` |
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
