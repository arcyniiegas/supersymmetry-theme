# PDP Metaobjects + Size Guide + Shipping Estimator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive the product page's size guide, shipping estimator, and Trumpai/Konstrukcija/Apie gamintoją bento from real data — three new metaobjects + a Vilnius-timezone shipping calculation — replacing the hardcoded demo defaults currently shown on live products.

**Architecture:** Metaobject definitions + product metafield references created via the Shopify Admin API (dev store first, then production with data migration). Theme Liquid reads the references and renders bento/graph; a small client-side JS component computes shipping dates in `Europe/Vilnius`. Feature icons are theme-held SVGs keyed by a `icon` field.

**Tech Stack:** Shopify Online Store 2.0 (Liquid, JSON templates, metaobjects/metafields), vanilla JS (`Intl.DateTimeFormat` timezone), CSS. Verification: `shopify theme check`, Admin GraphQL read-back, live `theme dev` preview DOM/computed-style checks.

## Global Constraints

- **Verification, not unit tests:** this theme has no JS test runner. Each task ends with a concrete check: `shopify theme check` (Liquid/schema), a GraphQL read-back (store data), or a preview DOM/computed-style probe (rendering). Treat those as the "test".
- **Dev store first, production last.** The theme-dev preview (localhost:9292) runs against a **dev** store; the real data lives on **production** (supersymmetry.lt). Build + verify on dev, then replicate defs + migrate data on production.
- **No hardcoded customer-facing strings** — LT copy in `locales/lt.default.json` (+ `en.json`); merchant content in metaobjects/settings. (CLAUDE.md non-negotiable.)
- **Metaobject `type` + field `key` are permanent** — renaming orphans data. Lock names in Task 1.1.
- **Fit dot colour:** Apple system green `#34C759`. **Shipping timezone:** `Europe/Vilnius`. **Feature icons:** theme-held, keyed.
- Commit after each task. Branch: `feat/pdp-metaobjects` off the current branch.

---

## Phase 0 — Shipping estimator (independent; no store changes)

### Task 0.1: `component-delivery.js` — Vilnius date logic

**Files:**
- Create: `assets/component-delivery.js`
- Modify: `sections/main-product.liquid` (the `delivery` block, ~lines 141–178)
- Modify: `layout/theme.liquid` (load the script) — or load per-section

**Interfaces:**
- Produces: a self-init IIFE that fills `.delivery .gantt` rows with dates. Reads `data-*` on `.delivery` for labels; computes `placed`, `shipped`, `transit`, `delivered`.

- [ ] **Step 1: Write `assets/component-delivery.js`**

```js
/* Delivery estimator — computes dispatch + delivery in Europe/Vilnius.
   Rule: dispatch = today if a working day before 18:00, else next working day;
   delivery = dispatch + 2 working days. Working day = not Sat/Sun and not an LT
   public holiday. Refresh LT_HOLIDAYS each year (YYYY-MM-DD, includes Easter). */
(function () {
  var TZ = 'Europe/Vilnius';
  var CUTOFF_HOUR = 18;
  // Lithuanian public holidays — REFRESH ANNUALLY. Easter-linked dates move.
  var LT_HOLIDAYS = [
    '2026-01-01','2026-02-16','2026-03-11','2026-04-05','2026-04-06',
    '2026-05-01','2026-06-24','2026-07-06','2026-08-15','2026-11-01',
    '2026-11-02','2026-12-24','2026-12-25','2026-12-26',
    '2027-01-01','2027-02-16','2027-03-11','2027-03-28','2027-03-29',
    '2027-05-01','2027-06-24','2027-07-06','2027-08-15','2027-11-01',
    '2027-11-02','2027-12-24','2027-12-25','2027-12-26'
  ];

  // Parts of "now" in the shop timezone, independent of the visitor's tz.
  function vilniusParts(d) {
    var f = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false, weekday: 'short'
    });
    var p = {};
    f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p; // {year, month, day, hour, weekday}
  }
  function iso(y, m, d) {
    return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }
  // Work with a plain UTC-midnight Date keyed to the Vilnius calendar day.
  function dayFromParts(p) { return new Date(Date.UTC(+p.year, +p.month - 1, +p.day)); }
  function isWorkingDay(dt) {
    var dow = dt.getUTCDay();                 // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) return false;
    var key = iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    return LT_HOLIDAYS.indexOf(key) === -1;
  }
  function addDays(dt, n) { var x = new Date(dt); x.setUTCDate(x.getUTCDate() + n); return x; }
  function nextWorkingDay(dt) { do { dt = addDays(dt, 1); } while (!isWorkingDay(dt)); return dt; }
  function addWorkingDays(dt, n) { for (var i = 0; i < n; i++) dt = nextWorkingDay(dt); return dt; }

  function compute(now) {
    var p = vilniusParts(now);
    var today = dayFromParts(p);
    var beforeCutoff = (+p.hour) < CUTOFF_HOUR;
    var dispatch = (isWorkingDay(today) && beforeCutoff) ? today : nextWorkingDay(today);
    var delivered = addWorkingDays(dispatch, 2);
    var transit = addWorkingDays(dispatch, 1);
    return { placed: today, shipped: dispatch, transit: transit, delivered: delivered };
  }

  function fmt(dt) {
    // "Pr, 15 liep." — LT abbreviated weekday + day + month
    return new Intl.DateTimeFormat('lt-LT', {
      timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short'
    }).format(dt);
  }

  function init() {
    var root = document.querySelector('.delivery .gantt');
    if (!root) return;
    var r = compute(new Date());
    var rows = root.querySelectorAll('.gantt__row .gantt__date');
    var dates = [r.placed, r.shipped, r.transit, r.delivered];
    rows.forEach(function (el, i) { if (dates[i]) el.textContent = fmt(dates[i]); });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 2: Rewrite the `delivery` block markup** in `sections/main-product.liquid` so the 4 rows are always present with localized legs and empty dates for JS to fill (drop the metafield gantt + hardcoded fallback):

```liquid
      {%- when 'delivery' -%}
    <div class="delivery" {{ block.shopify_attributes }}>
      <div class="delivery__head"><span class="delivery__title">{{ block.settings.title }}</span></div>
      <div class="gantt">
        <div class="gantt__row done"><span class="gantt__node"></span><span class="gantt__leg">{{ 'product.delivery.placed' | t }}</span><span class="gantt__date"></span></div>
        <div class="gantt__row now"><span class="gantt__node"></span><span class="gantt__leg">{{ 'product.delivery.shipped' | t }}</span><span class="gantt__date"></span></div>
        <div class="gantt__row"><span class="gantt__node"></span><span class="gantt__leg">{{ 'product.delivery.transit' | t }}</span><span class="gantt__date"></span></div>
        <div class="gantt__row"><span class="gantt__node"></span><span class="gantt__leg">{{ 'product.delivery.delivered' | t }}</span><span class="gantt__date"></span></div>
      </div>
      <script src="{{ 'component-delivery.js' | asset_url }}" defer></script>
    </div>
```

- [ ] **Step 3: Add locale keys** to `locales/lt.default.json` under `product`: `delivery: { placed:"Užsakymas pateiktas", shipped:"Užsakymas išsiunčiamas", transit:"Užsakymas kelyje", delivered:"Pristatymas iki" }` and the EN equivalents in `en.json`.

- [ ] **Step 4: Verify** — `shopify theme check` (0 new offenses). Then on a dev product page probe the rendered dates:

```js
// javascript_tool on /products/<handle>
[...document.querySelectorAll('.gantt__date')].map(e => e.textContent)
// Expected: 4 non-empty LT dates; shipped ≥ placed; delivered = shipped + 2 working days
```

Also spot-check the algorithm by evaluating `compute()` with faked "now" values (Mon 14:00 → Wed; Fri 20:00 → Wed; Sat → Wed).

- [ ] **Step 5: Commit** `git add assets/component-delivery.js sections/main-product.liquid locales/*.json && git commit -m "feat(pdp): live Vilnius-timezone shipping estimator"`

---

## Phase 1 — Metaobject foundation (DEV store, via Admin API)

> Use `graphql_schema` to confirm `metaobjectDefinitionCreate` / `metafieldDefinitionCreate` input shapes before each mutation, then `validate_graphql_codeblocks`, then `graphql_mutation`. **Confirm the connected store is the DEV store before mutating** (`get-shop-info`).

### Task 1.1: Create the 4 metaobject definitions

- [ ] **Step 1:** Create `manufacturer` (fields: `name` single_line, `description` multi_line, `country_of_origin` single_line).
- [ ] **Step 2:** Create `feature` (fields: `label` single_line, `label_en` single_line optional, `icon` single_line with `choices` validation = the 15 keys: `lightweight,flex-sole,soft-insole,breathes,natural-leather,soft-leather,perforated,non-slip,anatomical,warm-lining,elastic-strap,natural-fur,zipper,slip-on,heel`).
- [ ] **Step 3:** Create `model_info` (fields: `material`, `sole`, `weight` — all single_line).
- [ ] **Step 4:** Create `size_guide` (fields: `fit` single_line `choices`=[gerokai_mazesni,kiek_mazesni,standartiniai,kiek_didesni,gerokai_didesni]; `width` single_line `choices`=[labai_siauri,siauri,standartinis,platus,labai_platus]; `caption_override` single_line optional; `pct_normal` number_integer optional; `sample_count` number_integer optional). Set `displayNameKey` to `fit` where sensible.

Example mutation (repeat per type):
```graphql
mutation($def: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $def) {
    metaobjectDefinition { type id }
    userErrors { field message code }
  }
}
```
- [ ] **Step 5: Verify** — re-query `metaobjectDefinitions` and confirm all 4 types + fields exist, `userErrors` empty.

### Task 1.2: Create product metafield reference definitions

- [ ] **Step 1:** `custom.manufacturer` (metaobject_reference → manufacturer), `custom.features` (list.metaobject_reference → feature), `custom.model_info` (metaobject_reference → model_info), `custom.size_guide` (metaobject_reference → size_guide). Use `metafieldDefinitionCreate` with `ownerType: PRODUCT` and the metaobject-definition `validations` linking each to its type.
- [ ] **Step 2: Verify** — re-query product `metafieldDefinitions`; confirm the 4 keys with correct reference types.

### Task 1.3: Seed the 15 `feature` entries

- [ ] **Step 1:** `metaobjectCreate` one entry per feature (label + icon key) for all 15 (Lengvi/lightweight … Patogus kulniukas/heel).
- [ ] **Step 2: Verify** — `metaobjects(type:"feature")` returns 15 with correct icon keys.

### Task 1.4: Seed sample data on one dev product

- [ ] **Step 1:** Pick one active dev product; create + link a `manufacturer`, a `model_info`, a `size_guide`, and select 6–8 `feature` refs via `metafieldsSet`.
- [ ] **Step 2: Verify** — query that product's metafields with references resolved; all populated.

---

## Phase 2 — Theme wiring

### Task 2.1: `icon-feature` snippet (SVG library)

**Files:** Create `snippets/icon-feature.liquid`

- [ ] **Step 1:** Write a `{% case icon %}` mapping each of the 15 keys to its SVG (viewBox `0 0 30 30`, `stroke="currentColor" fill="none" stroke-width="1.4"`). Reuse the 6 existing crafted paths from `product-docs.liquid` for lightweight/flex-sole/soft-insole/breathes/natural-leather/soft-leather; add the 9 new paths (perforated, non-slip, anatomical, warm-lining, elastic-strap, natural-fur, zipper, slip-on, heel — heel uses the approved stiletto path `M26 21 C20 15 11 11 6.5 6.5 C5.5 10 6 18 6.5 23 L8.5 23 C8.7 19 9 18 9.5 17 C12 21 16 22.5 20 22.5 C23 22.5 25 22 26 21 Z`). Param: `{% render 'icon-feature', icon: f.icon %}`.
- [ ] **Step 2: Verify** — `shopify theme check`; render a test product's features and confirm each tile shows an SVG (no empty icons).

### Task 2.2: Konstrukcija feature tiles + manufacturer description

**Files:** Modify `snippets/product-docs.liquid` (the `spec` → Konstrukcija case)

- [ ] **Step 1:** Replace the `product.metafields.spec.quals` loop with a loop over `product.metafields.custom.features.value` rendering `.qual` tiles (`{% render 'icon-feature', icon: f.icon %}` + `<span class="k">{{ f.label }}</span>`). Keep the `.quals` grid markup/CSS.
- [ ] **Step 2:** After the Konstrukcija/`.quals` block, render the manufacturer: if `product.metafields.custom.manufacturer` present, show `.notes-prose` with `manufacturer.description` (+ a small `name · country_of_origin` line). Replace the old `custom.story` story block.
- [ ] **Step 3: Verify** — on the seeded product: 6–8 feature tiles render with icons+labels; manufacturer description shows below. Empty product → section hidden gracefully.
- [ ] **Step 4: Commit.**

### Task 2.3: Trumpai bento wiring

**Files:** Modify `snippets/product-glance.liquid`

- [ ] **Step 1:** Repoint the 6 cells: Medžiaga ← `model_info.material`, Padas ← `model_info.sole`, Kaina ← product.price (unchanged), Gamintojas ← `manufacturer.name`, Svoris ← `model_info.weight`, Kilmė ← `manufacturer.country_of_origin`. Each cell: show value if present, else hide the cell (no fabricated defaults).
- [ ] **Step 2: Verify** — seeded product shows real values; unset fields hide their cell. `theme-check` clean.
- [ ] **Step 3: Commit.**

### Task 2.4: Size guide fit graph

**Files:** Modify `sections/main-product.liquid` (`fit` block) + `assets/section-product.css`

- [ ] **Step 1:** In the `fit` block, map `size_guide.fit`/`width` → dot position via a Liquid `case` (fit: gerokai_mazesni=10 … gerokai_didesni=90; width→Y: labai_siauri=10 … labai_platus=90, then invert with `100 | minus: y` so wide=top). Render `.fit__dot` at `left:{{x}}%; top:{{yTop}}%`. Auto-build the caption from the two choice labels; use `caption_override` if set. Show `pct_normal`/`sample_count` only if present. Whole `fit` block renders only if `custom.size_guide` present.
- [ ] **Step 2:** Update `section-product.css` `.fit__*`: dot `#34C759`, 9px, white ring; add the faint centred grid (`background-size: 8.3333% 8.3333%`); centre the crosshair lines with transforms.
- [ ] **Step 3: Verify** — seeded product: dot lands at the expected grid cell for its fit/width; computed dot color = `rgb(52,199,89)`, size 9px; caption matches. Probe via javascript_tool computed styles.
- [ ] **Step 4: Commit.**

### Task 2.5: Locales

**Files:** Modify `locales/lt.default.json`, `locales/en.json`

- [ ] **Step 1:** Add `product.fit` choice display labels (5 fit + 5 width, LT+EN) used to build the caption, and any Konstrukcija/manufacturer UI strings. Keep merchant content in metaobjects.
- [ ] **Step 2: Verify** — `theme-check` (no `TranslationKeyExists`); caption renders correct LT text.
- [ ] **Step 3: Commit.**

---

## Phase 3 — Dev verification pass

- [ ] Reload the seeded product in the preview; confirm all four surfaces render real data: bento (Trumpai), Konstrukcija tiles, manufacturer description, fit graph (green dot/grid), shipping timeline (live dates). Screenshot.
- [ ] Confirm an **unseeded** product degrades gracefully (cells/sections hidden, no demo defaults, no JS errors — `read_console_messages`).
- [ ] `shopify theme check` — 0 new offenses.

---

## Phase 4 — Production rollout (Admin API)

> `get-shop-info` MUST return supersymmetry.lt before mutating. Show each definition to the user before creating on production.

### Task 4.1: Replicate definitions on production
- [ ] Create the 4 metaobject defs + 4 product metafield defs on production (same names/keys as Task 1.1–1.2). Verify via read-back.

### Task 4.2: Migrate existing data
- [ ] For every active product with `custom.designer`: create a `manufacturer` metaobject from the designer's name/description/country and set `custom.manufacturer` (or, if reusing one manufacturer entry across products, create-once + reference). Verify count.
- [ ] Seed `model_info.material` ← `sudetis.medziagos` where present; carry `sudetis.prieziura` → care. Leave `sole`/`weight`, `features`, `size_guide` as **new merchant entry** (seed 1–2 pilot products only).
- [ ] Verify a migrated product resolves manufacturer + material.

---

## Phase 5 — Publish & verify production

- [ ] Push the theme branch; preview as an **unpublished** theme on production first.
- [ ] Verify a real migrated product (e.g. Saint-Raphaël) renders manufacturer (Mario Muzi) + material live; shipping dates correct in Vilnius time.
- [ ] Merge/publish once confirmed. Leave old `fit.*`/`glance.*`/`spec.*`/`custom.story` defs in place; schedule cleanup after the merchant confirms.

---

## Self-review notes

- **Spec coverage:** manufacturer/feature/model_info/size_guide (Tasks 1.1, 2.x) ✓; migration (Phase 4) ✓; shipping logic incl. weekends+holidays (0.1) ✓; theme-held icons (2.1) ✓; dev-then-prod rollout (Phases 1/3/4/5) ✓; Apple green + grid (2.4) ✓.
- **Placeholders:** delivery.js is complete; the stiletto path is included; icon keys enumerated. Remaining SVG paths (8 new features) are drawn during Task 2.1 in the existing hand — paths for those are captured in the visual-companion mockups (`.superpowers/brainstorm/…/pdp-features-v2.html` / `pdp-final3.html`) and reproduced there.
- **Type consistency:** metaobject `type`s and product metafield `custom.*` keys are identical across Phases 1, 2, and 4.
