# TODO.md — Refactor roadmap

The live plan for turning this theme into the framework described in
[ARCHITECTURE.md](ARCHITECTURE.md). Work top to bottom; each phase is
behaviour‑preserving and verified before the next begins.

**Status:** on `main` (the repo consolidated to a single branch; the old
`refactor/framework-foundations` / feature branches were merged and deleted) —
foundations session: collection fix ·
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

**Later this session:** JS layer unified — `<theme-drawer>` + `scroll-spy` Custom
Elements and a shared `window.theme.cart` store (bag badge + `add()` + `cart:updated`
pub-sub) folded duplicated behaviour out of `chrome.js`/`collection.js`/`product.js`/
`accessories.js`/`cart.js`. **JS-string i18n** primitive (`window.theme.strings` +
`theme.t`) moved hardcoded LT copy (commerce + FAQ search) into locales. **Buttons +
cards single-sourced** onto `component-button.css` / `component-card.css` (gratuitous
per-page overrides removed; justified context kept). **tokens/base dedup:** every
`section-*.css`'s stale copy of `tokens.css` (`:root`) + the `base.css` reset removed
— **fixing the Typography type-scale setting** the stale `:root`s had silently broken
on product/collection/home (pixel-identical at 100%). Also fixed a **FAQ-search
regression** (`duk.js` matched the pre-rename `.qa` class → 0 results) and removed the
**orphaned `main-accessories`** section + assets. All verified live; theme-check green.

**Feature layer + reconcile (later sessions, on `main`):** a run of EME-inspired
storefront work landed on top of the foundation — the bottom **dock retired** and
**all navigation moved into a floating glass header** (announcement marquee + Shop
**mega menu** built from Theme-Editor blocks + collections carousel; mobile =
hamburger · logo · search + bag opening the full-screen menu), the **cart drawer**
flow, and the **mobile menu** enriched (native `<details>` accordions, featured
tiles, social row) and reskinned to **liquid glass**. Then a **reconcile pass**:
extracted a shared **`.tile` primitive** (`featured-tile` snippet +
`component-tile.css`) single-sourcing the tile markup/CSS the mega panel and mobile
menu had duplicated (caption id unified to `heading`); removed the **orphaned "Dock"
settings group** (dock deleted, zero consumers); relabelled the stale
`utility_right_message` ("Utility bar" → "Locale note", now only the mobile-menu
colophon). **`shopify theme check` clean** — 107 files, 0 errors (the 4 warnings are
the baseline customer-template `UndefinedObject`s). **Currency debt — RESOLVED
(design change, signed off):** the `money | remove:'€' | remove:',00'` bare-number
pattern (27 usages across 11 files — PDP, cards, cart, account orders, arrivals)
migrated to **`money_without_trailing_zeros`**, so prices now render the store's
localized money **with the currency symbol** (multi-currency-correct). This is a
deliberate departure from the prior bare-number design; needs a live Theme-Editor
preview to confirm symbol placement in tight layouts. **Registry refreshed:**
`COMPONENTS.md` now lists the feature layer — the `featured-tile` / `cart-line` /
`free-shipping-bar` snippets + the `.tile` primitive, the header mega blocks
(`menu_column` / `featured_tile` / `collection_strip`), the cart drawer on the
`Drawer` component, and the `component-cart` / `-mega-menu` / `-delivery` behaviour
modules; stale entries corrected (`dock` removed, `price` marked stable, `cart.js`
retired).

**Latest feature session (on `main`):** more EME-inspired storefront polish —
the **cart drawer** reworked into a floating glass panel (free-shipping meter
dropped + `free-shipping-bar` snippet deleted, view-cart promoted to a ghost
button), the **cart page** top restructured (promise squares, real payment
logos, fixed shipping/pickup rows), the **mobile menu** rebuilt as a left-side
glass drawer and **harmonized to the house type scale**, and the **PDP** bento
work: mobile mosaic + harmonized value type, construction/care tiles given
locale-keyed LT descriptions (`product.feat.*` / `product.care.*`), the top
breadcrumb crossbar removed. **PDP data model (production, Admin API):** the
Trumpai tiles became per-product inputs — Medžiaga/Padas are **choice metafield
dropdowns**, Svoris a text metafield, Gamintojas the shared **manufacturer
metaobject selector** (carries the Apie-gamintoją description), Kilmė a constant
block setting; the `size_guide` metaobject got a `label` display field and **all
25 length×width fit combinations** pre-created. **Reconcile pass (this review):**
inline styles moved to CSS (`.bento__sub` margin → `--sp-2`; `.fit__verdict`
`text-align`), registry synced (dead `free-shipping-bar` row removed, mobile-menu
+ search + cart-line entries refreshed). **Open debt:** the Trumpai data model is
transitional (direct metafields *plus* a legacy `model_info` fallback — decide
whether to migrate the one remaining product and retire `model_info`).
**Resolved since:** the `section-product.css` monolith is retired — the PDP
now composes from eight `component-*.css` files, section CSS is layout-only.

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

- [x] `button.liquid` + `component-button.css` are the single source of truth.
      Removed the **gratuitous** page-wide `.btn`/`.btn--*` redefinitions from
      `section-collection.css` + `section-product.css` (they overrode the glass
      component via load order → inconsistent buttons); both pages now render the
      one glass component (verified live). Remaining `.btn` overrides are **justified
      context** and kept by design: hero white (photo contrast — glass `--secondary`
      is illegible white-on-transparent over the image), buy-bar + consent compact
      sizing, contactstrip contrast, kform layout. Pending: 3 inline-`style=` anchors.
- [x] Harden currency handling: `€289/€340` fallback literals already gone;
      migrated the site-wide `money | remove:'€' | remove:',00'` bare-number
      pattern (27 usages / 11 files) to **`money_without_trailing_zeros`** — prices
      now render the store's localized money **with** the currency symbol
      (multi-currency-correct). Deliberate design change (bare-number → symbol),
      signed off; `theme check` clean; live preview pending for symbol placement.
- [ ] Adopt `price` inside `product-card`; move card price logic out of the card.
- [ ] `heading.liquid`, `section-header.liquid`, `container.liquid`.
- [ ] `image.liquid` (responsive), `badge.liquid`.
- [x] `icon.liquid` — name-keyed inline-SVG primitive (not a sprite; each case
      emits its own `<svg>`, whitespace-trimmed → byte-identical). Adopted at 11
      provably-identical sites (arrow/arrow-nav/search/zoom). Near-misses left for
      a live-verified pass: `main-collection` arrow (inline stroke attrs) +
      `product-related` arrow (stroke 1.5 vs 1.6). Broader adoption of the mixed
      instances needs a rendered page to confirm parity.
- [x] Move `product-card` strings (`Išparduota`, `Naujiena`) to `locales/*` (`product` ns).
- [x] `map-illustration.liquid` — extracted the identical 22-line decorative map
      SVG duplicated in `home-visit` + `main-kontaktai` (byte-identical → pixel-safe).
- [x] `breadcrumbs.liquid` — single-sources the `<nav class="crumbs">` scaffold
      across 9 sections (Home + optional parent link + bold current). `.crumbs` is
      flex+gap so whitespace is inert → pixel-identical, verified in harness.
      `main-collection` kept inline (extra trailing meta crumb). `badge` was
      evaluated and **skipped** — every section's badge markup/classes differ, so
      there's no byte-identical duplication to consolidate safely.

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
- [x] Rebuild `section-product.css` as component CSS; delete the monolith.
      **DONE.** The dead-CSS prune (28 provably-dead rules; 1038 → 946 lines)
      landed first; then the feature layer was extracted into `component-glance`
      / `-docs` / `-fit`, and finally the remaining monolith was split verbatim
      into `component-gallery` / `-buy` / `-delivery` / `-reviews` / `-related`.
      `section-product.css` is now **38 lines — layout only** (the `.product`
      grid). Every selector has exactly one owning file (verified: no duplication,
      nothing dropped); `theme check` clean; pixel-identical by construction for
      the default render. Two cleanups rode along: dropped the dead `:root` PDP
      tokens (`--t-num`/`-t-name`/`--sp-32`, no `var()` ref), and **repaired the
      reduced-motion overrides** (the pre-split `@media` block sat before its
      target base rules → `animation:none` on stock/gantt/fit dots silently never
      applied; each now sits after its base in the owning file).
- [ ] `main-collection` + `main-cart` onto shared components/blocks.
- [ ] Audit `home-*` sections against the shared kit; remove leftovers.

## Phase 6 — Consolidation

- [x] **Kill the tokens/base duplication.** Every `section-*.css` opened with a
      pre-extraction copy of `tokens.css` (`:root`) + the `base.css` reset +
      utilities. Removed them all — sections now resolve tokens/reset/utilities
      from the global `tokens.css` + `base.css`. The only remaining `:root`s are
      **minimal + section-specific**: `section-product` (3 PDP display tokens),
      `section-home` (4, incl. the larger home `--t-hero`), `section-cart` (10
      `--c-*` chip colours). Everything else left in section files is legitimate
      context/page override, not duplication. Verified live per page.
      → **Fixed a latent bug:** the stale `:root`s froze the type ramp
      (`clamp()` with no `* var(--type-scale)`), so the **Typography type-scale
      setting silently never scaled section pages**. It now works on product /
      collection / home — pixel-identical at the default 100%.
- [x] **Button + card CSS single-sourced.** `component-button.css` owns the one
      glass button (gratuitous per-page redefinitions removed; justified context
      kept — see COMPONENTS.md); `component-card.css` owns the product card (PDP
      related-card duplication + dead rules removed, `.card__price-chip` folded in).
- [x] **Eyebrow-with-rule primitive consolidated.** The label was re-declared
      ~10× under bespoke BEM names. Now: `.eyebrow-rule` (base) absorbs phead/
      redeem/lock (Cluster A); new `.eyebrow--rule` modifier absorbs manifesto/
      letter/notes/glance (Cluster B, `class="eyebrow eyebrow--rule"`); homefit/
      homevisit and khero/visit deduped in-file (C/D). Sections keep only spacing/
      dark-surface hooks. Genuine one-offs (`.hero__` currentColor, `.note__`
      white) left. Verified pixel-identical live.
- [x] **`.field` form primitive → `component-form.css`.** The label+input/select/
      textarea group (identical in `section-customers.css` `.acct .field` and
      `section-kontaktai.css` `.field`) now lives once, loaded globally in
      `theme.liquid`. Sections keep only layout / char-counter / consent context.
- [ ] Fold the remaining bespoke `section-*.css` design into `component-*.css` +
      thin `section-*.css`. NB: the cross-section *duplication* is now gone
      (eyebrow, form, button, card, tokens/base all single-sourced; `chip`/`badge`/
      `tag`/`prose` verified to be genuinely per-section designs, not dupes). What
      remains is per-section design, so further merging trades against pixel-parity.
- [x] **Prune unused CSS/JS/assets; dedupe images.** Dead feature blocks removed
      from home (`.spot*`), product (`.spec-table`/`.ship-*`), grazinimai (tariff/
      return-form/endcta, −42%). Deduped byte-identical `Nr{1,2,3}.webp` vs their
      `-<hash>.webp` copies (−355 KB). Deleted `product-tryon.js` — orphaned
      demo-mock virtual try-on (no loader, no `#tryon` markup, present since the
      baseline import; would throw immediately if loaded). Recoverable from git.
- [~] Normalise all schema IDs to the [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md) standard.
      **Single-letter setting-id sweep (banned by §1) — DONE.** All 4 sections
      migrated block-type-aware (schema + reads + count-verified template data),
      each verified: `main-dydziu-lentele` (`stat`), `main-akciju-salygos`
      (`stat`/`clause`/`receipt_row`), `main-avalynes-prieziura` (`stat`/`chip`/
      `habit`/`tstep`/`fix`, incl. the `care-*` snippet reads), `main-grazinimai`
      (`stat`/`step`/`elig`/`swap_card`). Canonical map applied: `k`/`l`→`label`,
      `v`→`value`, `k`(Kicker)→`eyebrow`, `t`→`title`, `b`→`body`, `n`→`num`,
      `q`→`question`, `f`→`answer`, `d`(Detail)→`text`. **No single-letter setting
      id remains anywhere.** (Dev-facing — merchants already saw the human labels.)
      **Presets audit — DONE:** all 17 reusable content sections have presets; the
      18 without (all `main-*` template sections + `header`/`utility-bar`) are
      template-/group-bound and correctly preset-less (matches Dawn). **Grouping
      `header` audit — DONE for live content sections:** `footer` (Newsletter/
      Legal), `main-kontaktai` (Intro/Facts/Form/Visit/Appearance, reordered
      content-first), `main-apie-mus` (Intro/Story image/Note) grouped; display-
      only, IDs unchanged. Remaining: banned word-ids (`headline_light/_bold` stays
      until home-hero refactor, §1). **Customer-account sections grouped too**
      (account/addresses/login/register/activate/reset/order). Also relabeled the
      misleading `"Text"` divider → `"Appearance"` across all 13 sections that used
      it (it grouped colour/size controls, not text). Only the parity-gated
      word-ids (`headline_light/_bold`) remain.
- [ ] Full `theme-check` pass; accessibility + Lighthouse sweep.
      **In progress (static a11y sweep):** aria-label i18n done (see i18n note);
      **skip-to-content link added** (`accessibility.skip_to_content`, targets
      `#MainContent[tabindex=-1]`, off-screen until focus, verified in harness).
      Confirmed OK: global `:focus-visible` ring covers all links/buttons; every
      icon-only control has an aria-label; images have alt; customer forms use
      `<label for>`; `<html lang>` is dynamic (`request.locale.iso_code`); the
      header marquee already honours `prefers-reduced-motion` (animation:none).
      **Keyboard focus rings — DONE:** 5 inputs with bare `input:focus{outline:
      none}` (search overlay, 404, blog + password newsletter, search page) beat
      the global `:focus-visible` on specificity → no keyboard focus. Scoped to
      `:focus:not(:focus-visible)` (pointer look unchanged, keyboard ring back);
      verified in harness against real CSS. Left `.field`/`.promo` — they change
      border-color on focus (valid indicator).
      **Heading hierarchy — DONE (live):** audited home/collection/PDP on the dev
      store — each is clean (single h1, sequential h2s). Only defect was the
      global footer (`<h6>` columns → h2→h6 skip); promoted to `<h2>` + retargeted
      `.foot__col h6`→`h2` (computed style identical). Static a11y sweep complete.
      **Interactive a11y deep-dive — 2 fixes + 2 verified-clean:**
      (1) **Modal focus containment** — `<theme-drawer>` (cart/menu/search/filter)
      set `role=dialog`+`aria-modal` but never inerted the background, so screen
      readers reading by heading/landmark and the JS Tab-trap's blind spots let
      users reach the page behind. Now sets `inert` on everything outside the open
      panel (both tab order + a11y tree), lifted before focus-return; correct for
      portaled + nested panels; 17/17 headless assertions.
      (2) **Reduced-motion overrides repaired** (see the section-product split) —
      `animation:none` on the stock/gantt/fit dots was ordered before its base so
      it never applied.
      (3) **Contrast audit — PASS.** Computed WCAG ratios for the greyscale text
      tokens: `--text-muted`/`--mid` 4.89–5.33:1 (AA everywhere), `--soft` 4.54:1
      on white (its floor); the sub-4.5 `--soft`-on-surface cases are all
      decorative/disabled/exempt (separators, disabled qty buttons, struck prices,
      placeholders); `--hairline`-as-colour is all borders/empty-stars/decorative
      SVG. No change needed.
      (4) **Mega-menu — verified** (`aria-expanded`, Esc + focus-return, outside/
      focusout close, PE). Remaining needs a live SR/Lighthouse run (final gate).
- [x] **Live-caught bug:** cart drawer empty state rendered the raw key
      `cart.empty_cta` — `label: '…' | t` filter isn't evaluated inside a `render`
      arg. Pre-assigned the translated value. Verified on dev store.

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
- Locale coverage: audit for strings still hardcoded in Liquid. **Done for
  always-rendered chrome** — header nav aria-labels + no-menu fallback nav, and
  the recurring breadcrumb "Pradžia"/duk crumbs, moved to locale keys (exact
  match, verified live). **Demo fallbacks — DONE (launch fix):** the elaborate
  hardcoded seed content in empty-state branches (which was showing fake blog
  posts live) is replaced with localized empty states — `main-blog`
  (`blog.empty_*`), `main-article` (`article.empty_text` + real excerpt + no
  fabricated tags + related hidden unless real), `main-list-collections`
  (`collection.list_empty`), `faq-fallback` (`faq.empty_*`, 78 lines → empty
  state). Populated pages byte-identical; verified live (blog empty, DUK/
  collections still render real content). `templates/gift_card.liquid` (legacy,
  14 strings) localizes when it's converted off the legacy `.liquid` template.
  **Assistive-text layer — DONE:** the visible-copy passes above missed
  `aria-label`s. Static a11y sweep found ~25 unique hardcoded aria strings
  across 20 files (Breadcrumb ×10) — all routed through 22 new `accessibility.*`
  keys (LT+EN), reusing `collection.sort` for the search sort control;
  "Breadcrumb" landmark localized to "Naršymo kelias". Pixel-neutral (aria not
  rendered), theme-check clean. Remaining i18n debt is now only the setting-
  backed `| default: 'LT'` fallbacks (translator-reachable via Theme Editor) —
  acceptable, not a violation.
- JS strings → locales via `window.theme.strings` + `theme.t()` (injected in
  `theme.liquid`). **Done:** `product.js`, `cart.js`, `duk.js` (FAQ search — 2-form
  plural), `predictive-search.js` (search overlay — full **3-form** LT plural
  `rezultatas`/`rezultatai`/`rezultatų`, `Rasta`/`Visi rezultatai →`, Kolekcija/
  Žurnalas labels, `search` namespace). `customers.js` + `collection.js` audited —
  **no hardcoded strings** (pure behaviour). **JS-string i18n complete.**

## How to keep this file

- Check a box only when its definition of done is met and it's committed.
- When a phase completes, update the **Status** line at the top.
- New work gets a task here before code is written — this file leads the repo.
