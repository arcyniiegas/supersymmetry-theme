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
3. **Visibility: preview page + main-grid badge.** Automated collection
   (rule: tag = `netrukus`, template suffix `preview`); tagged models also
   show a „Netrukus" badge + status line in every product grid. The
   `preview` template is additionally assigned to the manual
   „Ruduo-žiema 2026" collection.

## The `netrukus` tag is the single switch

Drives: automated collection membership, card badge + status line, PDP
pre-order mode, cart-line note. Remove the tag → everything reverts.

## Components

- **`snippets/preorder-status.liquid`** — the one status primitive:
  mono line `{stage} · numatoma {expected}` from the two metafields.
  Renders nothing when untagged/empty. Used by cards, PDP, cart line.
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
