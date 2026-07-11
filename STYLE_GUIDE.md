# STYLE_GUIDE.md — CSS, JavaScript, performance, accessibility

The implementation standard for everything under `assets/`. Architecture in
[ARCHITECTURE.md](ARCHITECTURE.md); this is how the code is actually written.

---

## 1. CSS architecture

CSS is **component‑based**, not page‑based. Files map to the layer model:

```
assets/                 (flat — Shopify forbids subdirectories; namespace by prefix)
  tokens.css            design decisions only — CSS custom properties
  base.css              resets, element defaults, base typography, layout primitives
  component-button.css  .btn and its modifiers
  component-card.css    .card
  component-accordion.css   .accordion
  component-badge.css   .badge / .tag / .chip
  component-drawer.css  off-canvas panels
  component-modal.css
  component-container.css   layout width + gutters
  component-price.css   .price
  section-hero.css      layout-only rules unique to a section
  section-collection.css
  …
```

**Rules**

- **`tokens.css` contains no selectors** beyond `:root` (and scheme scopes). Only
  variables live there.
- **A component file owns one component's complete look.** `.btn` is styled in
  `button.css` and nowhere else.
- **Section CSS is layout‑only** — grid, spacing, positioning of *that*
  section's regions. It must not restyle a button, card or price; it composes
  components.
- **No section‑specific utility classes.** Utilities, if any, are global and
  token‑driven.
- **Selector depth ≤ 3.** No `.a .b .c .d`. Prefer a class on the element.
- **No duplicated declarations.** If two components share a value, it is a token.
- **Never `!important`** except to override third‑party/injected styles, with a
  comment saying why.

**Loading.** `tokens.css` then `base.css` load once, first, in `layout/theme.liquid`
(`<head>`). Component and section CSS load only where used, via
`{{ 'file.css' | asset_url | stylesheet_tag }}` (Shopify de‑duplicates by URL).
Prefer merging shared rules into components over shipping another page stylesheet.

> **A section file must never re-declare `:root` tokens or the base reset.** Every
> `section-*.css` used to open with a stale copy of `tokens.css` + `base.css`
> (a pre-extraction leftover); those are removed. A section may keep a **minimal
> `:root`** *only* for tokens genuinely unique to it (e.g. `section-product`'s
> `--t-name`/`--t-num`, `section-home`'s larger `--t-hero`, `section-cart`'s
> `--c-*` chip colours) — never a copy of a global token. **Duplicating a global
> token is a bug:** the stale copies froze the heading ramp without the
> `* var(--type-scale)` multiplier, silently breaking the Typography setting on
> those pages. The type ramp composes as `--t-x: calc(clamp(…) * var(--type-scale))`
> — any new display token must follow that form so the setting reaches it.

## 2. Design tokens

Every design decision is a CSS custom property in `tokens.css`. Existing tokens
already in use across the theme (keep these names):

| Token | Purpose |
|-------|---------|
| `--bg` | page background |
| `--ink` | primary decorative ink (fills, borders, dark cards) |
| `--text`, `--text-muted` | body / secondary text colour |
| `--glass-blur` | liquid‑glass blur radius (bound to `settings.glass_blur`) |
| `--title-scale`, `--hero-scale`, `--hero-intro-scale` | per‑section type‑scale overrides |

Target token groups to formalise in `tokens.css`:

- **Color** — `--bg`, `--ink`, `--text`, `--text-muted`, surface/line/accent
  roles, expressed as **color‑scheme groups** (see [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md)).
- **Typography** — font families (`--font-body`, `--font-mono`), a modular
  **type scale** (`--text-xs … --text-6xl`), weights, line‑heights, tracking.
- **Spacing** — one scale (`--space-1 … --space-12`); section padding derives
  from it.
- **Radius / border / shadow** — `--radius-*`, `--line`, `--shadow-*`.
- **Glass** — `--glass-blur`, `--glass-bg`, `--glass-border`.
- **Motion** — `--ease`, `--duration-*`.

Rule: **a raw hex, px font‑size, or magic number in a component is a missing
token.** Add the token, don't inline the value.

## 3. Naming (BEM‑ish, already the house style)

Follow the convention the theme already uses:

```
.block            /* component root:  .card  .hero  .btn  .price */
.block__element   /* part of it:      .card__media  .hero__overlay  .price__chip */
.block--modifier  /* a variant:       .btn--primary  .card__tag--orange */
```

- Class‑based styling only; no ID selectors, no tag‑qualified component selectors.
- State via data attributes or a single state class: `[aria-expanded="true"]`,
  `.is-open`, `[data-glass="off"]`.
- Names describe the **thing**, not the page: `.stat`, never `.about-stat`.

## 4. JavaScript

JS is **component‑based**. One reusable behaviour per file, initialised by the
sections that need it — never a per‑page script re‑implementing the same thing.

**Target component library** (`assets/component-*.js`):

`Accordion`, `Carousel`, `Drawer`, `Modal`, `Sticky`, `Reveal`, `Video`,
`Tabs`, `ScrollObserver`. These replace today's page scripts (`duk.js`,
`kontaktai.js`, `product.js`, `collection.js`, …).

**Pattern** — prefer Custom Elements so behaviour binds itself and the Theme
Editor can re‑init on `shopify:section:load`:

```js
// assets/component-accordion.js
class ThemeAccordion extends HTMLElement {
  connectedCallback() {
    this.summary = this.querySelector('[data-accordion-trigger]');
    this.summary?.addEventListener('click', this.toggle);
  }
  disconnectedCallback() { this.summary?.removeEventListener('click', this.toggle); }
  toggle = () => this.toggleAttribute('open');
}
customElements.define('theme-accordion', ThemeAccordion);
```

```liquid
{# section markup #}
<theme-accordion>…</theme-accordion>
{{ 'component-accordion.js' | asset_url | script_tag }}  {# or load once globally #}
```

**Rules**

- **Progressive enhancement.** The markup is usable without JS; the component
  enriches it. Details/summary, real links and native form submits first.
- **Theme Editor aware.** Handle `shopify:section:load` /
  `shopify:section:unload` (Custom Elements get this for free via
  connected/disconnected callbacks).
- **No business logic duplication.** Cart, price and search logic live once in a
  shared module.
- **Scope queries** to the component root (`this.querySelector`), never
  `document`‑wide from inside a component.
- **`defer`** all scripts; never block render. Load a component's script only on
  pages that use it.
- **No frameworks, no jQuery.** Vanilla, small, dependency‑free.

## 5. Performance

- **Images:** always `width`/`height` (no CLS), responsive `srcset` + `sizes`,
  `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image only.
  Use `image_url` with explicit widths.
- **Fonts:** self‑hosted `woff2`, `preload` the two above‑the‑fold faces (already
  done), `font-display: swap`.
- **CSS/JS:** ship only what a page uses; prefer CSS to JS for anything that can
  be done in CSS (transitions, sticky, scroll‑snap).
- **Liquid:** minimise loops and nested lookups; avoid `all_products[…]` in
  loops; paginate; use `limit`. Never N+1 metafield/variant access inside a loop.
- **DOM:** the fewest nodes that express the design. No wrapper‑for‑a‑wrapper.
- **Third parties:** none added without a measured reason.

## 6. Accessibility (WCAG 2.1 AA as the floor)

- **Keyboard:** every interactive element is reachable and operable by keyboard;
  logical tab order; no keyboard traps. Custom widgets implement the expected key
  interactions (Esc closes overlays, arrows move carousels/tabs).
- **Focus:** visible focus styles on every focusable element — never
  `outline: none` without a stronger replacement.
- **Semantics:** correct elements (`<button>` for actions, `<a>` for
  navigation), one `<h1>` per page, no skipped heading levels.
- **ARIA:** only where semantics fall short — `aria-expanded`, `aria-controls`,
  `aria-current`, `aria-live` for async (cart, predictive search), `aria-hidden`
  on purely decorative nodes. Don't ARIA what native HTML already conveys.
- **Images:** meaningful `alt`; empty `alt=""` for decorative images.
- **Forms:** every field has a `<label>`; errors are announced and associated;
  inputs have appropriate `type`, `autocomplete`, `inputmode`.
- **Motion:** honour `prefers-reduced-motion`; reveals and carousels degrade to
  no‑animation.
- **Contrast:** text meets AA against its background in every color scheme.

## 7. The liquid‑glass system

Glassmorphism is a first‑class, **toggleable** surface treatment, not ad‑hoc
blur. It is driven by settings and tokens:

- `settings.glass_enabled` → `<html data-glass="off">` when disabled; components
  provide solid fallbacks under `[data-glass="off"]`.
- `settings.glass_blur` → `--glass-blur` (inline on `<html>`).
- Glass surfaces read `--glass-bg`, `--glass-border`, `--glass-blur` — never
  hardcoded `backdrop-filter` values.
- Always ship a **solid fallback**: `backdrop-filter` is unsupported or disabled
  for many users, and the design must hold without it.
