/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — CART STORE (shared)
   The one client-side mirror of the cart's item count. Every page that
   mutates the cart calls theme.cart.setCount()/refresh() instead of
   hand-rolling the [data-bag-count] update, and anything on the page can
   subscribe to the 'cart:updated' event to react to a change.

   Shopify stays authoritative for all money — this only reflects
   item_count into the header + dock bag badges. Loaded globally (defer);
   callers only reach for it inside event handlers, so load order is moot.
   ════════════════════════════════════════════════════════════ */
window.theme = window.theme || {};
window.theme.cart = (function () {
  /* paint every header/dock bag badge from a cart object, then broadcast */
  function setCount(cart) {
    if (!cart) { return cart; }
    document.querySelectorAll('[data-bag-count]').forEach(function (el) {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count > 0 ? '' : 'none';
    });
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart } }));
    return cart;
  }

  /* fetch the authoritative cart and repaint the badges */
  function refresh() {
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(setCount)
      .catch(function () {});
  }

  /* add line items, then refresh the badges; resolves with the add response.
     On a non-2xx (e.g. sold out) rejects with an Error whose .userMessage
     carries Shopify's description when present, so callers can surface it.
     Each page keeps its own success/error UI around this. */
  function add(items) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (r) {
        if (!r.ok) {
          return r.json().catch(function () { return {}; }).then(function (err) {
            var e = new Error('cart-add-failed');
            e.userMessage = (err && err.description) || null;
            throw e;
          });
        }
        return r.json();
      })
      .then(function (added) { return refresh().then(function () { return added; }); });
  }

  return { setCount: setCount, refresh: refresh, add: add };
})();
