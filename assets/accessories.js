(function () {
  /* category filter — pure UI show/hide of rendered cards (data-cat is real product-tag data) */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.cat'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#accGrid .card'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (chip.disabled || chip.dataset.disabled) { return; } /* zero-count category: no-op */
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var cat = chip.dataset.cat;
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat);
      });
    });
  });

  /* success UI on the main quick-add button (mirrors the prototype exactly) */
  function added(btn) {
    var orig = btn.textContent;
    btn.classList.add('is-added');
    btn.textContent = 'Pridėta ✓';
    setTimeout(function () {
      btn.classList.remove('is-added');
      btn.textContent = orig;
      btn.closest('.qadd').classList.remove('is-open');
    }, 1400);
  }

  /* real Shopify Cart AJAX add (POST + badge refresh live in the shared store) */
  function addToCart(variantId, btn) {
    if (!variantId) return;
    theme.cart.add([{ id: variantId, quantity: 1 }])
      .then(function () { added(btn); })
      .catch(function () {});
  }

  /* quick add */
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    var qadd = btn.closest('.qadd');
    var sizes = qadd.querySelector('.qadd__sizes');
    if (sizes) {
      /* multi-size: main button reveals the size row, the chosen size's variant drives the add */
      Array.prototype.slice.call(sizes.querySelectorAll('.qadd__size')).forEach(function (sb) {
        sb.addEventListener('click', function () {
          if (sb.disabled) { return; }
          addToCart(sb.getAttribute('data-variant-id'), btn);
        });
      });
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-added')) { return; }
        qadd.classList.toggle('is-open');
      });
    } else {
      /* single-variant: add directly */
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-added')) { return; }
        addToCart(btn.getAttribute('data-variant-id'), btn);
      });
    }
  });
})();
