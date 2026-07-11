(function () {
  /* ────────────────────────────────────────────────────────────
     Cart AJAX — Shopify is authoritative for all money.
     Every mutation POSTs to /cart/*.js, then the whole #cart-root
     is re-rendered via the Section Rendering API so Liquid-computed
     totals / free-shipping / discount lines stay truthful. JS never
     computes subtotal / discount / tax / total.
     ──────────────────────────────────────────────────────────── */

  var root = document.getElementById('cart-root');
  var sectionId = (root && root.dataset.sectionId) || 'main';
  var busy = false;

  /* Header bag badge(s) are owned by the shared cart store (cart-store.js);
     this page feeds it the authoritative cart from each mutation response. */

  /* ── toast ── */
  function showToast(msg) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) { return; }
    toastMsg.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1900);
  }

  /* ── re-render the cart section from Shopify (authoritative HTML) ── */
  function reRender() {
    return fetch(window.location.pathname + '?sections=' + encodeURIComponent(sectionId), {
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var html = data[sectionId];
        if (html == null) { return; }
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var fresh = tmp.querySelector('#cart-root');
        var current = document.getElementById('cart-root');
        if (fresh && current) { current.replaceWith(fresh); }
      })
      .catch(function () {});
  }

  /* ── change a line's quantity by its line key (0 = remove) ── */
  function changeQty(key, qty, toastMsg) {
    if (busy || !key) { return; }
    busy = true;
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    })
      .then(function (r) {
        /* Guard: a non-2xx response (stock cap, bad key, etc.) returns an error
           object with no item_count — never feed that to theme.cart.setCount or the badge
           renders blank. Surface it to the user instead of failing silently. */
        if (!r.ok) {
          return r.json().catch(function () { return {}; }).then(function (err) {
            var e = new Error('cart-change-failed');
            e.userMessage = (err && err.description) || null;
            throw e;
          });
        }
        return r.json();
      })
      .then(function (cart) { theme.cart.setCount(cart); return reRender(); })
      .then(function () { if (toastMsg) { showToast(toastMsg); } })
      .catch(function (err) {
        showToast((err && err.userMessage) || 'Nepavyko atnaujinti — bandykite dar kartą.');
      })
      .then(function () { busy = false; });
  }

  /* ── empty the whole cart ── */
  function clearCart() {
    if (busy) { return; }
    busy = true;
    fetch('/cart/clear.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) { theme.cart.setCount(cart); return reRender(); })
      .catch(function () {})
      .then(function () { busy = false; });
  }

  /* ── delegated clicks (survives #cart-root innerHTML swaps) ── */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) { return; }

    var step = t.closest('[data-step]');
    if (step && step.closest('.qty')) {
      var line = step.closest('.line');
      if (!line) { return; }
      var input = line.querySelector('.qty input');
      var cur = parseInt(input ? input.value : '1', 10);
      if (isNaN(cur)) { cur = 1; }
      var next = cur + parseInt(step.dataset.step, 10);
      if (next < 1) { next = 1; }
      if (next === cur) { return; } /* minus at 1: no change, don't round-trip */
      changeQty(line.dataset.key, next);
      return;
    }

    var rm = t.closest('.line__remove');
    if (rm) {
      var l = rm.closest('.line');
      if (l) { changeQty(l.dataset.key, 0, 'Pašalinta iš krepšelio'); }
      return;
    }

    if (t.closest('#clearBtn')) {
      clearCart();
      return;
    }

    if (t.closest('#promoBtn')) {
      /* Discount codes apply at CHECKOUT — hand off to Shopify's /discount route,
         which sets the code and returns to the cart. No client-side money faking. */
      var pi = document.getElementById('promoInput');
      var code = pi ? pi.value.trim() : '';
      if (code) {
        window.location.href = '/discount/' + encodeURIComponent(code) +
          '?redirect=' + encodeURIComponent(window.location.pathname);
      }
      return;
    }
  });

  /* ── direct quantity edits ── */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches('.qty input')) { return; }
    var line = t.closest('.line');
    if (!line) { return; }
    var q = parseInt(String(t.value).replace(/\D/g, ''), 10);
    if (isNaN(q) || q < 1) { q = 1; }
    changeQty(line.dataset.key, q);
  });
})();
