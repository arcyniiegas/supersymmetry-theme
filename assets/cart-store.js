/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — CART DATA API (shared, global)
   The single client-side entry point for cart mutations. Every surface
   (product form, cart drawer, cart page) calls theme.cart.add / change /
   clear instead of hand-rolling fetches, then reacts to the 'cart:updated'
   event. Loaded globally with defer.

   Shopify stays authoritative for ALL money: each mutation asks Shopify to
   re-render the affected sections (Bundled Section Rendering) and returns that
   Liquid HTML in event.detail.sections — this module never computes subtotals,
   discounts, tax, or shipping state. It only mirrors item_count into the
   header / drawer bag badges.

   Event: 'cart:updated' → detail { cart, sections, source }
     cart     the authoritative cart object (or null for a bare badge repaint)
     sections { id: html } freshly rendered section HTML, or null
     source   'add' | 'change' | 'clear' | 'set'  (component-cart opens the
              drawer only on 'add')
   ════════════════════════════════════════════════════════════ */
window.theme = window.theme || {};
window.theme.cart = (function () {
  var JSON_HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

  /* Which sections Shopify should re-render for us: always the global drawer,
     plus the cart-page section when we're on it (so the page stays in sync). */
  function sectionsToRender() {
    var ids = ['cart-drawer'];
    var root = document.getElementById('cart-root');
    if (root && root.dataset.sectionId) { ids.push(root.dataset.sectionId); }
    return ids;
  }

  /* Paint every bag badge (header, drawer) and broadcast the change. */
  function badges(cart) {
    if (!cart) { return cart; }
    var show = cart.item_count > 0;
    document.querySelectorAll('[data-bag-count]').forEach(function (el) {
      el.textContent = cart.item_count;
      el.hidden = !show;
      el.style.display = show ? '' : 'none';
    });
    return cart;
  }

  function emit(detail) {
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: detail }));
  }

  /* POST a cart mutation; reject with an Error whose .userMessage carries
     Shopify's description (sold out, stock cap, bad key…) so callers can
     surface it verbatim. */
  function post(url, body) {
    return fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok) {
          return r.json().catch(function () { return {}; }).then(function (err) {
            var e = new Error('cart-request-failed');
            e.userMessage = (err && err.description) || null;
            throw e;
          });
        }
        return r.json();
      });
  }

  /* Fetch the authoritative cart and repaint badges (used after /cart/add.js,
     whose response carries the line item, not item_count). */
  function refresh() {
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(badges)
      .catch(function () {});
  }

  function add(items) {
    return post('/cart/add.js', {
      items: items,
      sections: sectionsToRender(),
      sections_url: window.location.pathname
    }).then(function (added) {
      return refresh().then(function (cart) {
        emit({ cart: cart, sections: added.sections || null, source: 'add' });
        return added;
      });
    });
  }

  function change(id, quantity) {
    return post('/cart/change.js', {
      id: id,
      quantity: quantity,
      sections: sectionsToRender(),
      sections_url: window.location.pathname
    }).then(function (cart) {
      badges(cart);
      emit({ cart: cart, sections: cart.sections || null, source: 'change' });
      return cart;
    });
  }

  function clear() {
    return post('/cart/clear.js', {
      sections: sectionsToRender(),
      sections_url: window.location.pathname
    }).then(function (cart) {
      badges(cart);
      emit({ cart: cart, sections: cart.sections || null, source: 'clear' });
      return cart;
    });
  }

  /* Repaint badges from an already-fetched cart without a mutation. */
  function setCount(cart) {
    badges(cart);
    emit({ cart: cart, sections: null, source: 'set' });
    return cart;
  }

  return { add: add, change: change, clear: clear, refresh: refresh, setCount: setCount };
})();
