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
| `product-card` | Collection/grid product card | `product` (req), `show_name` (bool) | **Needs work** — inlines price (`money_without_trailing_zeros`) instead of rendering `price`; LT strings now in locales; fragile tag matching remains |
| `price` | Price block (current + compare + % chip) | `product:` **or** `price:` + `compare_at:` | **Stable** — renders nothing without a price; currency via `money_without_trailing_zeros` (localized symbol, multi‑currency‑safe) |
| `section-appearance` | Per‑section **colour scheme** + text‑colour + type‑scale overrides via scoped `{% style %}` | `section` (req) | **Stable** — applies `color_scheme` (full palette remap + bg/text paint) then `text_color`/scales. Adopted in 19 content sections; `scheme-1` default = pixel parity |
| `meta-social` | Open Graph / Twitter meta tags | reads globals | **Stable** |
| `structured-data-product` | Product JSON‑LD | `product` | **Stable** |
| `mobile-menu` | Full‑screen mobile menu (glass) — nav + `<details>` accordions + featured tiles + social row + colophon | reads settings/menus | **Stable** — is a `<theme-drawer>`, opened by the header hamburger. (The bottom `dock` was retired — navigation moved into the header.) |
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
| `cart-empty` | Cart empty-state | `section` | Stable (split from `main-cart`; `cart-upsell` removed — no upsell by design) |
| `cart-line` | One cart line row (media, title, variant, qty stepper, remove, price) | `item` (req), `compact` (bool — drawer variant) | **Stable** — shared by the cart drawer + cart page |
| `free-shipping-bar` | Free-shipping progress meter (Liquid-computed, server-authoritative) | reads `cart` + `free_shipping_threshold` | **Stable** — `--free-ship-pct` var drives a `scaleX` fill |
| `featured-tile` | Image tile with gradient caption overlay → the shared `.tile` primitive (`component-tile.css`) | `image`, `heading`, `link`, `sizes`, `class`, `attributes` | **Stable** — single-sources the tiles in the header mega panel + mobile menu |
| `icon` | Inline SVG glyph keyed by `name` (`case`/`when`, each emits its own `<svg>`; whitespace-trimmed → byte-identical output) | `name` (`arrow`/`arrow-nav`/`search`/`zoom`) | **Stable** — adopted at 11 byte-identical sites (home-collections/arrivals/journal, main-search, search-overlay, product-gallery). Deliberately NOT adopted where markup differs (main-collection arrow has inline stroke attrs; product-related arrow is stroke 1.5) — extend per-case as needed |
| `map-illustration` | Decorative stylised street-map SVG (ornamental, `aria-hidden`, own baked palette) | — | **Stable** — single-sources the identical map shared by `home-visit` + `main-kontaktai`; each section keeps its own wrapper + pin |
| `breadcrumbs` | Breadcrumb trail — Home + optional parent link + bold current | `current` (req), `parent_label`, `parent_url` | **Stable** — single-sources the `<nav class="crumbs">` scaffold across 9 sections (list-collections, cart, blog, apie-mus, article, grazinimai, avalynes, dydziu, duk). `.crumbs` is flex+gap so element sequence drives layout → pixel-identical (verified in harness). `main-collection` keeps its inline nav (extra trailing meta crumb) |
| `collection-filter-drawer` | Off-canvas filters (swatch case) | `section`, `collection`, `paginate` | Stable — clean compile |
| `collection-notes` | Collection notes (`note_row`) | `section` | Stable (split from `main-collection`) |
| `stat` | Shared page-head stat — **unifies 5 sections** | `k`, `v`, `tabular`, `accent`, `attrs` | ✅ verified live |

### Planned primitives (the missing library)

| Snippet | Purpose | Proposed API |
|---------|---------|--------------|
| ✅ `button` **(shipped M2)** | The one button, everywhere — **anchor CTAs** | `label`, `href`, `style`, `size`, `arrow`, `aria_label`, `target`, `id`, `class`. **`component-button.css` is now the single source of truth** — the gratuitous page-wide `.btn` redefinitions in `section-collection`/`section-product` were removed (both render the glass component); only justified context overrides remain (hero photo-contrast, buy-bar/consent sizing, contactstrip contrast). Behavioral `<button>` (submit/ATC/drawer) not yet covered. |
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

**Section‑local blocks (header mega menu):** the `header` section composes its Shop
mega panel from three section‑scoped blocks — `menu_column` (heading + a linked
`menu`), `featured_tile` (image + `heading` + `link` → renders the `featured-tile`
snippet) and `collection_strip` (a `collection_list` → the CSS scroll‑snap carousel).
Header‑local by design (global chrome, not `@theme`); merchants compose the panel in
the header group.

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
| ✅ `Drawer` **(shipped — `<theme-drawer>`)** | Off‑canvas/overlay: open · close · Esc · focus‑trap (WCAG 2.4.3) · scroll‑lock · scrim · focus‑return; `data-*` config + optional portal; Theme‑Editor‑aware | Unifies the **filter drawer** (was `collection.js`) + **mobile menu** + **search overlay** (were `chrome.js`) + the **cart drawer** into one Custom Element; `chrome.js` 119→66 |
| `Modal` | Focus‑trapped dialogs (size chart, quick view) | one‑off modal code |
| `Sticky` | Sticky‑on‑scroll elements | scattered scroll handlers |
| `Reveal` | On‑scroll enter animations | per‑page reveal scripts |
| `Video` | Lazy/lightbox video control | `article.js`, product media JS |
| `Tabs` | Tabbed panels | bespoke tab code |
| ✅ `scroll-spy` **(shipped — first Custom Element)** | Scroll-spy for any anchor nav; Theme-Editor-aware (`connectedCallback`), configurable link selector (`data-spy-links`, default `.subnav__chip`) + `data-spy-margin`, click-to-highlight | replaced `avalynes-prieziura.js` + `grazinimai.js` subnavs **and** the `duk.js` category-rail spy (3 sections, 1 component) |
| `ScrollObserver` | Shared IntersectionObserver utility | duplicated observers |

**Retained shared modules:** `chrome.js` (global header/dock/menu/overlay glue),
`predictive-search.js`, and ✅ `cart-store.js` — refactor toward the component
pattern but keep them as the shared core, not page scripts.

**✅ `cart-store.js` (shipped — shared cart state).** `window.theme.cart` is the
one client-side mirror of the cart: `setCount(cart)` paints every `[data-bag-count]`
badge (header + cart drawer) and broadcasts a `cart:updated` `CustomEvent` (`detail.cart`);
`refresh()` fetches the authoritative `/cart.js` and repaints; `add(items)` POSTs
`/cart/add.js`, refreshes, resolves with the add response, and on a non-2xx rejects
with an `Error` whose `.userMessage` carries Shopify's `description` so each page can
surface it. Loaded globally (`theme.liquid`, `defer`). Replaced three hand-rolled
badge updaters (`product.js` + `accessories.js` `refreshBag`, `cart.js` `updateBag`)
and the duplicated add POST (`product.js` + `accessories.js`) — each page keeps its
own success/error UI around `theme.cart.add()`. Shopify stays authoritative for all
money — this only reflects the count. The `cart:updated` event is the pub-sub seam
any future surface (mini-cart, add animation, analytics) subscribes to instead of
re-fetching.

**✅ JS string registry — `window.theme.strings` + `theme.t(key, vars)`.** Customer
-facing copy rendered *by scripts* (add-to-cart status, cart toasts, stock notes)
must not be hardcoded in JS. `theme.liquid` injects the needed strings from
`locales/*` (`{{ 'key' | t | json }}`) into `window.theme.strings`, and
`theme.t(key, vars)` looks one up and fills `{token}` placeholders (single-brace so
Shopify's `| t` leaves them for JS). Adopted in `product.js` + `cart.js`; extend the
registry when a new script needs a string. Keys live under the same namespaces as the
Liquid copy (`product.*`, `cart.*`), so translators edit one place.

**✅ Feature-layer behaviour modules (shipped).** Three small, feature-scoped
modules loaded `defer` from `theme.liquid`: `component-cart.js` (cart drawer + page
— subscribes to `cart:updated`, swaps the Section-Rendering HTML into the drawer +
cart root, opens the drawer on add, delegates qty/remove/clear/promo);
`component-mega-menu.js` (header Shop panel — hover/click/focus/Esc/outside-click
open‑close with a close-delay bridge across the card→panel gap); `component-delivery.js`
(PDP shipping-cutoff estimator, computed in the atelier timezone). Not generic Custom
Elements — each owns one feature — but they keep the "behaviour → JS component,
sections initialise" contract.

**Page scripts to retire** as their behaviour moves into components:
`kontaktai.js`, `duk.js`, `customers.js`, `collection.js`,
`product.js`, `gift-card.js`, `password.js`.
(`grazinimai.js` + `avalynes-prieziura.js` retired into `<scroll-spy>`;
`accessories.js` deleted with the orphaned `main-accessories` section;
`cart.js` retired — cart behaviour folded into `cart-store.js` + `component-cart.js`;
`product-tryon.js` deleted — orphaned demo mock, no loader/markup since
the baseline import.)

## 4. When to create a new part

1. **Second occurrence rule** — the moment identical markup/behaviour/content
   shape appears a second time, extract it here.
2. **Right layer** — markup → snippet; behaviour → JS component; merchant content
   → block. Never solve one with another.
3. **Register it** — add the row to this file with its API and status in the same
   change. An unregistered component doesn't exist.
4. **Name by concept, not page** — `stat`, not `about-stat`.
