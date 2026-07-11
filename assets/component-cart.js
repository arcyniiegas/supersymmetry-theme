/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — CART BEHAVIOUR (shared, global)
   The one DOM/interaction layer for the cart. Loaded globally with defer.

   Reads nothing about money — it asks theme.cart (cart-store.js) to mutate,
   then swaps the Liquid-rendered section HTML that comes back into the live
   drawer (#cart-drawer-inner) and, when present, the cart page (#cart-root).
   Because both surfaces render the same shared snippets, one delegated set of
   handlers drives them both — there is no second cart implementation.

   Responsibilities:
     • react to 'cart:updated' → swap section HTML, open the drawer on add
     • delegated quantity steppers, direct qty edits, remove, clear, promo
     • a single toast for success / error feedback
   ════════════════════════════════════════════════════════════ */
(function () {
  var busy = false;

  /* ── toast ── */
  function notify(msg) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg || !msg) { return; }
    toastMsg.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(notify._t);
    notify._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1900);
  }

  /* ── swap freshly-rendered section HTML into the live DOM ──
     Keeps the live <theme-drawer> element (already wired) and replaces only its
     inner, so an open drawer stays open and focus/scroll are preserved. */
  function applySections(sections) {
    if (!sections) { return; }
    Object.keys(sections).forEach(function (id) {
      var html = sections[id];
      if (html == null) { return; }
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var freshSel = (id === 'cart-drawer') ? '#cart-drawer-inner' : '#cart-root';
      var fresh = tmp.querySelector(freshSel);
      var current = document.querySelector(freshSel);
      if (fresh && current) { current.replaceWith(fresh); }
    });
  }

  document.addEventListener('cart:updated', function (e) {
    var d = e.detail || {};
    if (d.sections) { applySections(d.sections); }
    if (d.source === 'add') {
      var drawer = document.getElementById('cartDrawer');
      if (drawer && typeof drawer.open === 'function') { drawer.open(); }
    }
  });

  /* ── guarded mutation: one in-flight request at a time ── */
  function run(fn, okMsg) {
    if (busy) { return; }
    busy = true;
    fn()
      .then(function () { notify(okMsg); })
      .catch(function (err) { notify((err && err.userMessage) || theme.t('cart.update_error')); })
      .then(function () { busy = false; });
  }

  /* ── delegated clicks (survive #cart-drawer-inner / #cart-root swaps) ── */
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
      run(function () { return theme.cart.change(line.dataset.key, next); });
      return;
    }

    var rm = t.closest('.line__remove');
    if (rm) {
      var l = rm.closest('.line');
      if (l) { run(function () { return theme.cart.change(l.dataset.key, 0); }, theme.t('cart.removed')); }
      return;
    }

    if (t.closest('#clearBtn')) {
      run(function () { return theme.cart.clear(); });
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
    run(function () { return theme.cart.change(line.dataset.key, q); });
  });
})();
