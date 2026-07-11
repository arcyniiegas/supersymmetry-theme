# PDP: metaobject-driven bento + size guide + shipping estimator — design

**Date:** 2026-07-11
**Store:** supersymmetry.lt (production), timezone `Europe/Vilnius` (EEST), EUR
**Status:** approved (brainstorming), pending implementation plan

## 1. Context & problem

The catalogue is a **multi-brand shoe retailer** (Mario Muzi, Stephan Paris, Aquamarin…), not the single "Vilnius atelier" the theme copy implies. Real products already reference **populated** metaobjects:

- `designer` ("Gamintojas") — `name`, `description`, `country_of_origin` — via `custom.designer`.
- `sudetis` ("Sudėtis") — `medziagos`, `aprasymas`, `prieziura` — via `custom.sudetis`.

But the PDP reads **empty demo metafields** (`fit.*`, `glance.*`, `spec.quals`, `custom.story`), so its fit graph, bento and "maker story" render hardcoded **defaults on live products** — fake content, the same class of problem as the demo-fallback cleanup.

**Decision:** build **fresh, purpose-built metaobjects** (not reuse `designer`/`sudetis`), and **migrate existing data into them via the Admin API** so nothing is re-entered by hand.

## 2. Scope

Three independent PDP features:

1. **Size guide** — metaobject-driven fit graph.
2. **Shipping-time estimator** — hardcoded date logic (no metaobject).
3. **Bento** — Trumpai, Konstrukcija, Apie gamintoją as metaobjects.

## 3. Data model — new metaobjects

| Metaobject `type` | Fields | Notes |
|---|---|---|
| `manufacturer` | `name` (text), `description` (multi-line), `country_of_origin` (text) | Apie gamintoją. Migrated 1:1 from `designer`. |
| `feature` | `label` (text, LT), `label_en` (text, opt), `icon` (text w/ `choices`) | Library of **15**; `icon` is a key mapped to a theme SVG. |
| `model_info` | `material` (text), `sole` (text), `weight` (text) | Trumpai's own facts. |
| `size_guide` | `fit` (text, 5 `choices`), `width` (text, 5 `choices`), `caption_override` (text, opt), `pct_normal` (int, opt), `sample_count` (int, opt) | Reusable fit profile. |

**Product metafield references (namespace `custom`):**

| key | type | purpose |
|---|---|---|
| `manufacturer` | `metaobject_reference` → manufacturer | select one |
| `features` | `list.metaobject_reference` → feature | select **6–8** |
| `model_info` | `metaobject_reference` → model_info | one |
| `size_guide` | `metaobject_reference` → size_guide | one |

### Feature library (15) — label → icon key

`Lengvi`→lightweight · `Lankstus padas`→flex-sole · `Minkštas vidpadis`→soft-insole · `Kvėpuoja`→breathes · `Natūrali oda`→natural-leather · `Minkšta oda`→soft-leather · `Perforuota oda`→perforated · `Neslystantis padas`→non-slip · `Anatominis padas`→anatomical · `Šiltas pamušalas`→warm-lining · `Dirželis su gumele`→elastic-strap · `Natūralus kailis`→natural-fur · `Užtrauktukas`→zipper · `Įspiriami`→slip-on · `Patogus kulniukas`→heel

The first 6 icons already exist in the theme (`product-docs.liquid` spec-qual defaults); the other 9 are drawn in the same hand (approved in the visual companion, incl. the right-facing stiletto for `heel`).

## 4. Feature 1 — Size guide

- `fit` 5-choice → dot **X** = 10 / 30 / 50 / 70 / 90 %.
- `width` 5-choice → dot **Y** (wide = top) = 90 / 70 / 50 / 30 / 10 %.
- Dot: **Apple system green `#34C759`**, 9 px, thin white ring (crisp over photos), pulsating.
- Plot: faint 1/12 grid (centred — a line sits on 50 % both axes), darker centre crosshair marks "standartinis".
- Caption auto-writes from `fit`+`width` (e.g. "Kiek didesni · standartinis plotis"); `caption_override` supplies a custom recommendation line.
- `pct_normal` / `sample_count` render only when present (never fabricated).
- Axis labels stay: Platūs / Siauri (Y), Mažesni / Didesni (X).

## 5. Feature 2 — Shipping estimator

`assets/component-delivery.js`, computed **client-side in `Europe/Vilnius`** (DST-safe) to avoid Shopify page-cache staleness and to use the atelier's dispatch timezone, not the shopper's.

Algorithm:
- **Dispatch day** = today if it's a working day before **18:00**, otherwise the next working day.
- **Delivery** = dispatch **+ 2 working days**.
- **Working day** = not Sat/Sun **and** not a Lithuanian public holiday (hardcoded, dated array incl. moving Easter; refreshed yearly, clearly commented).

Worked examples: Mon 14:00 → Wed · Mon 20:00 → Thu · Fri 14:00 → Tue · Fri 20:00 → Wed · weekend → Wed.

Fills the existing 4-row timeline (placed → shipped → in transit → delivered by) with real Vilnius dates. Liquid keeps localized labels.

## 6. Feature 3 — Bento wiring

- **Trumpai** (6 cells): material ← `model_info.material`, sole ← `model_info.sole`, weight ← `model_info.weight`, manufacturer ← `manufacturer.name`, origin ← `manufacturer.country_of_origin`, price ← product (auto).
- **Konstrukcija**: renders the 6–8 selected `custom.features` as icon+label tiles (icon via new `icon-feature` snippet, keyed by the feature's `icon`).
- **Apie gamintoją** (below Konstrukcija): `manufacturer.description` (+ name, country).

## 7. Theme changes

- `sections/main-product.liquid` — `fit` block (metaobject-driven graph), `delivery` block (JS-filled).
- `snippets/product-glance.liquid` — Trumpai wiring.
- `snippets/product-docs.liquid` — Konstrukcija feature tiles + manufacturer description.
- **new** `snippets/icon-feature.liquid` — SVG library keyed by `icon`.
- **new** `assets/component-delivery.js`.
- CSS: fit graph (green dot, grid), feature tiles, manufacturer block.
- `locales/*.json` — 5-choice display labels, caption templates, any new UI strings.

## 8. Migration (Admin API, production)

1. Create the 4 metaobject definitions + 4 product metafield definitions.
2. Migrate per product: `designer` → `manufacturer` (name/description/country 1:1); seed `model_info.material` ← `sudetis.medziagos`; `sudetis.prieziura` → care.
3. **New merchant data** (not derivable): `features` selection, `model_info.sole`/`weight`, `size_guide` values. Seed a couple of pilot products; the rest is ongoing merchant entry.
4. Old `fit.*`/`glance.*`/`spec.*`/`custom.story` metafields left in place (harmless) until confirmed, then optionally removed.

## 9. Rollout (safe order)

1. **Dev store first:** create defs, wire theme, add sample metaobject data to one product, verify in the theme-dev preview.
2. **Production:** create the same defs, run the data migration via API.
3. Publish the theme change (or preview as an unpublished theme on production first).
4. Verify a real product renders real data; graceful empty states where unset.

## 10. Parity note

This intentionally **changes what the PDP renders** (real metaobject data / graceful empty states instead of hardcoded demo defaults) — a correctness fix, like the demo-fallback cleanup, not a strict pixel-parity refactor. With data populated, the layout is unchanged; the content becomes real.

## 11. Open / deferred

- Editorial copy mismatch (single-atelier voice vs multi-brand catalogue) — separate content task, not blocking.
- Whether `size_guide`/`model_info` are shared across product families or per-product — modelled as references either way; merchant decides reuse.
