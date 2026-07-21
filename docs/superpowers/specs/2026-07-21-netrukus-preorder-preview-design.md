# „Netrukus" — pre-order preview collection (design spec)

Approved 2026-07-21. Research-backed decisions (sources in session log):
paid pre-orders convert ~10× vs notify-me waitlists; luxury/artisan pages
convert on **specificity + process transparency**, never countdown urgency;
made-to-order shoe brands (Cobbler Union, Adelante) make production stages
visible. Fits the existing „partijos" batch narrative.

## Decisions (user-confirmed)

1. **Mechanic: paid pre-order, native Shopify.** Full price at checkout.
   Product keeps 0 stock + *Continue selling when out of stock*. No app.
2. **Status: date + stage per model.** Two pinned metafield definitions
   (revised 2026-07-21 after user feedback):
   - `preorder.stage` („Būsena") — single-line text, choice list:
     `Gamyboje · Pagaminti · kelyje`
   - `preorder.expected` („Numatoma gavimo data") — **date** type, picked
     per product; rendered Lithuanian-style via `snippets/date-lt.liquid`
     („rugpjūčio 28 d.", month names from `general.months_genitive`).
3. **Visibility: preview page + main-grid badge.** The `preview` template
   is assigned to the manual „Ruduo-žiema 2026" collection; pre-order
   models show a stage badge in every product grid.

## The preorder metafields are the single switch (revised 2026-07-21)

The `netrukus` tag was dropped as a redundant extra step. A product with
`preorder.stage` or `preorder.expected` set IS a pre-order: cards show a
„Gamyboje" / „Kelyje" badge (no status line — details live on the PDP),
the PDP swaps the CTA + note + batch-aware delivery gantt, the cart line
gets the eta pill. Clear both fields → everything reverts. The former
tag-based automated collection was deleted; a dedicated „Partijos eiga"
PDP track was also removed — the delivery gantt is the one timeline.

## Components
- **`sections/preview-banner.liquid`** + `assets/section-preview-banner.css` —
  editorial intro band for the preview collection: eyebrow-rule, light/bold
  title, batch paragraph, `stat` blocks (shared snippet). No timers.
- **`templates/collection.preview.json`** — preview-banner + main-collection.
- **`snippets/product-card.liquid`** — badge priority sale-% > „Netrukus" >
  „Naujiena"; status line under price (named cards).
- **`sections/main-product.liquid`** — tag-driven: ATC label →
  „Užsakyti iš anksto"; quiet note under CTA („Apmokama dabar — išsiųsime,
  kai partija bus paruošta · numatoma {expected}"); 4-stage mono progress
  track in the sizeblock area. Buybar (product.js) label passed via
  `data-atc-label` on `.product`.
- **`snippets/cart-line.liquid`** — mono tag „Išankstinis · {expected}".
- **Locales** — all strings in `lt.default.json` + `en.json`. Stage labels
  displayed verbatim from the metafield (LT-first store); the PDP track
  matches the value against the canonical 4-stage list to fill progress.

## Out of scope

Deposits/charge-later (app), checkout-page changes, shipped-notification
emails, per-variant pre-order states.

## Merchant workflow per model

Tag `netrukus` + set stage/expected + 0 stock with continue-selling →
advance stage as the batch progresses → on arrival: stock in, untag.
