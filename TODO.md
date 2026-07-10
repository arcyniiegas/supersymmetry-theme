# TODO.md — Refactor roadmap

The live plan for turning this theme into the framework described in
[ARCHITECTURE.md](ARCHITECTURE.md). Work top to bottom; each phase is
behaviour‑preserving and verified before the next begins.

**Status:** Phase 0 in progress — git baseline + `tokens.css` extracted; Theme
Check green (4 benign warnings). Color scheme + section wrapper next.

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
- [ ] Add a **color‑scheme group** + typography settings to
      `config/settings_schema.json`; wire schemes to tokens.
- [ ] Slim `base.css` to resets + primitives; adopt the `component-*.css/js`
      asset naming (assets/ is flat); create `blocks/` with a README.
- [ ] Establish the section wrapper convention (`padding_top`/`padding_bottom`,
      `color_scheme`) and a shared section CSS baseline.

## Phase 1 — Primitive snippet library

Build and adopt the missing primitives (see [COMPONENTS.md](COMPONENTS.md) §1).

- [ ] `button.liquid` + `component-button.css`; replace hand‑rolled
      `<a class="btn">` in `home-hero` and every other section.
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

- [ ] Split `main-product.liquid` (578 lines) into blocks: gallery, info,
      buy‑buttons, description, accordion, recommendations.
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
- `section-appearance` per‑section `text_color` → migrate to `color_scheme`.
- Confirm `gift_card.liquid` is the only legacy `.liquid` template; leave unless
  it blocks something.
- Locale coverage: audit for strings still hardcoded in Liquid.

## How to keep this file

- Check a box only when its definition of done is met and it's committed.
- When a phase completes, update the **Status** line at the top.
- New work gets a task here before code is written — this file leads the repo.
