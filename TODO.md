# TODO.md — Refactor roadmap

The live plan for turning this theme into the framework described in
[ARCHITECTURE.md](ARCHITECTURE.md). Work top to bottom; each phase is
behaviour‑preserving and verified before the next begins.

**Status:** branch `refactor/framework-foundations` — this session: collection fix ·
colour-scheme + type-scale (both **complete**) · shared block vocabulary + canonical
renames · **i18n** (commerce/search/404/contact/customer-auth chrome, `collection`/
`product`/`cart`/`contact`/`customer` namespaces) · foundations confirmed done · docs
synced. Theme-Check green (0 errors), live-verified on `shopify theme dev`.
`base.css` 42.7 → **10.6 KB (−75%)**, 8 `component-*.css` files; `button` primitive
(13 CTAs); chrome i18n (22 `t`); **colour-scheme system live** (caught + fixed a
theme-breaking role bug via the preview). **All 5 mega-sections split under 300:**
`main-product` 578→297, `main-duk` 446→161, `main-avalynes` 404→223, `main-cart`
361→268, `main-collection` 358→192 (`main-grazinimai` 298 already under). 28
snippets (was 10). **Per-section `color_scheme` complete** via `section-appearance`
(full palette remap + bg/text paint; adopted in **all 31** section-appearance
sections — content + commerce + account; scheme-1 default = pixel parity, verified
live incl. a dark-scheme proof). **Global heading
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
- [x] Slim `base.css` (42.7→10.6 KB — resets + shared primitives); `component-*.css`
      naming adopted (8 files); `blocks/` created. (No `blocks/README.md` — theme-check
      rejects non-Liquid files there; the block vocabulary lives in COMPONENTS.md.)
- [~] Section wrapper convention: **`color_scheme` done** — picker on all 31
      section-appearance sections (scheme-1 = parity). Pending: `padding_top`/
      `padding_bottom` settings + a shared section CSS baseline (feature-scale).

## Phase 1 — Primitive snippet library

Build and adopt the missing primitives (see [COMPONENTS.md](COMPONENTS.md) §1).

- [~] `button.liquid` shipped + 13 anchor CTAs adopted (M2–M3). Pending:
      `component-button.css` (CSS still declared in 7 files) + 3 inline-`style=` anchors.
- [ ] Harden `price.liquid`: remove `€289/€340` fallback literals, fix
      multi‑currency (`money_without_trailing_zeros`, no `remove:'€'`).
- [ ] Adopt `price` inside `product-card`; move card price logic out of the card.
- [ ] `heading.liquid`, `section-header.liquid`, `container.liquid`.
- [ ] `image.liquid` (responsive), `badge.liquid`, `icon.liquid` (SVG sprite).
- [x] Move `product-card` strings (`Išparduota`, `Naujiena`) to `locales/*` (`product` ns).

## Phase 2 — Shared block vocabulary

Replace per‑page one‑offs with `@theme` blocks (see COMPONENTS.md §2, migration map).

> **Note (docs-confirmed):** dynamic `@theme` blocks (`content_for "blocks"`) suit
> single-block-type sections only; region-grouped sections keep section-local blocks +
> a shared **snippet**. So the collapses below are snippet + canonical-rename, except
> `hours` which is a true `@theme` block.

- [x] `blocks/hours.liquid` — first `@theme` block (home-visit + kontaktai).
- [x] `qa` + `faq` → **`accordion_item`** (shared `accordion-item` snippet + rename,
      template data migrated, count-verified).
- [x] `stat` unified via the shared `stat` snippet (5 sections).
- [x] `store_row` + `mstep` → **`step`** (shared `step` snippet + rename). `habit` /
      `tstep` / `fix` left section-local (distinct designs; `tstep` deduped via `care-steps`).
- [ ] Remaining primitives (`rich_text`, `heading`, `image`, `divider`, `spacer`);
      the genuinely distinct-design blocks stay section-local by design.

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
- [x] `Drawer` (`<theme-drawer>`) — filter drawer + mobile menu + search overlay
      unified into one Custom Element; drawer JS pulled out of `chrome.js` (119→66)
      and `collection.js`. Verified live.
- [x] `scroll-spy` generalised (`data-spy-links` selector) + adopted on the DUK
      category rail — the hand-rolled rail spy is gone from `duk.js` (which now owns
      only the live search filter). 3 sections, 1 component. Verified live.
- [x] `cart-store.js` (`window.theme.cart`) — shared cart store: `setCount`/`refresh`
      (bag badge + `cart:updated` pub-sub) **and** `add(items)` (the `/cart/add.js`
      POST + 422 error surfacing). Folded the triplicated badge updater and the
      duplicated add POST out of `product.js` / `accessories.js` / `cart.js`; each page
      keeps its own success/error UI. Verified live (real PDP ATC through
      `theme.cart.add()`: badge 0→1, success message intact, real `/cart.js`).
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
