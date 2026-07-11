# TODO.md — Refactor roadmap

The live plan for turning this theme into the framework described in
[ARCHITECTURE.md](ARCHITECTURE.md). Work top to bottom; each phase is
behaviour‑preserving and verified before the next begins.

**Status:** 21 commits, Theme-Check green, live-verified on `shopify theme dev`.
`base.css` 42.7 → **10.6 KB (−75%)**, 8 `component-*.css` files; `button` primitive
(13 CTAs); chrome i18n (22 `t`); **colour-scheme system live** (caught + fixed a
theme-breaking role bug via the preview). **All 5 mega-sections split under 300:**
`main-product` 578→297, `main-duk` 446→161, `main-avalynes` 404→223, `main-cart`
361→268, `main-collection` 358→192 (`main-grazinimai` 298 already under). 28
snippets (was 10). **Per-section `color_scheme` shipped** via `section-appearance`
(full palette remap + bg/text paint; adopted in 19 content sections; scheme-1
default = pixel parity, verified live incl. a dark-scheme proof). **Global heading
type-scale shipped** (Typography setting → `--type-scale` multiplies the heading
ramp; default 100% = parity; Geist stays locked by design). **`/blocks` introduced
— `hours` shipped as the first `@theme` block** (unifies `home-visit` + `main-kontaktai`;
`content_for "blocks"` confirmed supported; each section keeps its own look via
scoped CSS on shared `.hours__row` markup; verified live). **Block-markup
de-duplication continued:** `care-steps` (shared `tstep` list) and `accordion-item`
(FAQ markup for duk + grąžinimai). **Canonical block-type renames (count-verified
template migrations):** `qa`+`faq` → **`accordion_item`** (26+6 blocks), and
`store_row`+`mstep` → **`step`** (4+3 blocks) via a shared `step` snippet — all
verified pixel-identical live, merchant content preserved (before/after block-count
assertions). Distinct vocab types now ~33 (was 36).

> **Architecture note (docs-confirmed):** dynamic theme blocks render only via
> `{% content_for "blocks" %}` (all blocks, one reorderable container), so
> **region-grouped** sections (product, avalynės, grąžinimai, akcijų-sąlygos,
> dydžių-lentelė) must keep section-local blocks + the `{% for %}` loop. For them,
> the win is a **shared snippet** (markup once) + canonical classes, not a
> `/blocks` block. Most remaining "one-offs" are genuinely distinct *designs*
> (e.g. home `card` vs list `collection`); merging those trades duplication for
> per-section CSS overrides — worth it only where markup is truly shared.

Remaining: shared snippets for the other genuine markup dups (`step` num/title/body
family; `stat` fold of `fact`/`cell`); optional type-renames to shrink the vocab
count (needs template-data migration); scheme adoption for commerce/account
sections; section-level i18n; `section-*.css` cleanup.

**Every task's definition of done:** storefront pixel‑identical to the committed
baseline · Theme Editor add/reorder/remove still works · `theme-check` clean ·
committed as a small, self‑describing change.

---

## Phase 0 — Foundations & safety

- [x] `git init`; commit the current theme verbatim as the **baseline**.
- [x] Add `.theme-check.yml`; baseline = 82 files, 4 benign `UndefinedObject`
      warnings (customer templates), 0 errors.
- [x] Create `assets/tokens.css`; relocate colour/type/space/radius/glass tokens
      out of `base.css` (values unchanged — 43 tokens moved, loaded first).
- [x] Add a **color‑scheme group** (3 schemes; scheme-1 = current palette) to
      `config/settings_schema.json`, rendered by `color-schemes.liquid` → tokens,
      default applied on `<body>`.
- [x] Add a **Typography** group → global `type_scale` (`--type-scale`) scaling the
      heading ramp in `tokens.css`; default 100% = parity. Font family stays Geist.
- [ ] Slim `base.css` to resets + primitives; adopt the `component-*.css/js`
      asset naming (assets/ is flat); create `blocks/` with a README.
- [ ] Establish the section wrapper convention (`padding_top`/`padding_bottom`,
      `color_scheme`) and a shared section CSS baseline.

## Phase 1 — Primitive snippet library

Build and adopt the missing primitives (see [COMPONENTS.md](COMPONENTS.md) §1).

- [~] `button.liquid` shipped + 13 anchor CTAs adopted (M2–M3). Pending:
      `component-button.css` (CSS still declared in 7 files) + 3 inline-`style=` anchors.
- [ ] Harden `price.liquid`: remove `€289/€340` fallback literals, fix
      multi‑currency (`money_without_trailing_zeros`, no `remove:'€'`).
- [ ] Adopt `price` inside `product-card`; move card price logic out of the card.
- [ ] `heading.liquid`, `section-header.liquid`, `container.liquid`.
- [ ] `image.liquid` (responsive), `badge.liquid`, `icon.liquid` (SVG sprite).
- [ ] Move `product-card` strings (`Išparduota`, `Naujiena`) to `locales/*`.

## Phase 2 — Shared block vocabulary

Replace per‑page one‑offs with `@theme` blocks (see COMPONENTS.md §2, migration map).

- [ ] `blocks/accordion-item.liquid` ← `qa`.
- [ ] `blocks/stat.liquid` ← the two incompatible `stat` blocks (one schema).
- [ ] `blocks/step.liquid` ← `habit` / `tstep` / `fix` / `store_row`.
- [ ] `blocks/rich-text.liquid`, `blocks/heading.liquid`, `blocks/button.liquid`,
      `blocks/image.liquid`.
- [ ] `blocks/divider.liquid`, `blocks/spacer.liquid`.

## Phase 3 — Reusable content sections + template remap

Replace bespoke `main-*` content sections with a few flexible sections; re‑point
templates; **preserve content verbatim**; delete the old section + CSS + JS.

- [ ] `content-accordion` → remap `page.faq.json` (was `main-duk`); delete
      `main-duk.liquid`, `section-duk.css`, `duk.js`.
- [ ] `content-steps` / `content-rich` → remap `page.avalynes-prieziura.json`;
      delete `main-avalynes-prieziura.liquid`, `section-avalynes-prieziura.css`,
      `avalynes-prieziura.js`.
- [ ] Remap `page.apie-mus.json` (`main-apie-mus`) onto shared sections/blocks.
- [ ] Remap `page.grazinimai.json`, `page.akciju-salygos.json`,
      `page.dydziu-lentele.json`, `page.kontaktai.json`.
- [ ] Collapse near‑duplicate home sections (`home-manifesto`, `home-letter`,
      `home-visit`, …) onto the shared content sections where equivalent.

## Phase 4 — JavaScript components

Extract shared behaviour into `assets/component-*.js`; retire page scripts.

- [ ] `Accordion` (Custom Element) — powers `content-accordion`; retire `duk.js`.
- [ ] `Drawer` — mobile menu + any off‑canvas; pull menu JS out of `chrome.js`.
- [ ] `Modal` — size chart / dialogs.
- [ ] `Carousel`, `Reveal`, `Tabs`, `Sticky`, `Video`, `ScrollObserver`.
- [ ] Retire remaining page scripts as their behaviour lands in components.

## Phase 5 — Flagship sections

The high‑value, high‑complexity surfaces, onto the shared kit last.

- [x] Split `main-product.liquid`: **578 → 297 lines** (under the 300 target) —
      gallery / glance / reviews / related / docs extracted to `product-*`
      snippets, **verified pixel-identical live**. (The info aside size picker +
      form could still be extracted, but the section now meets the size target.)
- [ ] Rebuild `section-product.css` (39 KB) as component CSS; delete the monolith.
- [ ] `main-collection` + `main-cart` onto shared components/blocks.
- [ ] Audit `home-*` sections against the shared kit; remove leftovers.

## Phase 6 — Consolidation

- [ ] Fold every remaining page stylesheet into `component-*.css` + thin `section-*.css`;
      delete `section-*.css` monoliths.
- [ ] Prune unused CSS/JS/assets; dedupe images (`Nr1.webp` vs
      `Nr1-0c6678ce.webp`, etc.).
- [ ] Normalise all schema IDs to the [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md) standard.
- [ ] Full `theme-check` pass; accessibility + Lighthouse sweep.

---

## Backlog / watch‑list

- Two‑part hero headline (`headline_light` + `headline_bold`) → converge on
  `heading` + styling.
- ~~`section-appearance` per‑section `text_color` → migrate to `color_scheme`.~~
  **Done** — `section-appearance` now applies `color_scheme` (full palette remap +
  bg/text paint); `text_color` kept as an on-top fine-tune. Adopted in 19 content
  sections; commerce/account sections still to opt in (per-layout verification).
- Confirm `gift_card.liquid` is the only legacy `.liquid` template; leave unless
  it blocks something.
- Locale coverage: audit for strings still hardcoded in Liquid.

## How to keep this file

- Check a box only when its definition of done is met and it's committed.
- When a phase completes, update the **Status** line at the top.
- New work gets a task here before code is written — this file leads the repo.
