/* ════════════════════════════════════════════════════════════
   COLLECTION — UI behaviour only.
   Real filtering/sorting is handled by Shopify via URL params;
   the prototype's fake client-side catalog/filter math is removed.
   ════════════════════════════════════════════════════════════ */
(function(){
  var grid = document.querySelector('.grid');

  /* Filter drawer open/close, Esc, scrim, focus-trap, scroll-lock and focus
     return are now the shared <theme-drawer> Custom Element (component-drawer.js).
     The drawer wires itself from its data-* attributes; nothing to do here. */

  /* ── view toggle: grid / dense / list ── */
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll('.viewtog button'));
  var viewClasses = ['', 'grid--dense', 'grid--list'];
  viewBtns.forEach(function(b, i){
    b.addEventListener('click', function(){
      viewBtns.forEach(function(x){ x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      if (grid){
        grid.classList.remove('grid--dense', 'grid--list');
        if (viewClasses[i]) grid.classList.add(viewClasses[i]);
      }
    });
  });

  /* ── sort: navigate with ?sort_by= (keeps existing filter params) ── */
  var sortSel = document.getElementById('sortSel');
  if (sortSel){
    sortSel.addEventListener('change', function(){
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortSel.value);
      window.location.assign(url.toString());
    });
  }

  /* ── facets: swatch/size buttons carry their S&D toggle URL ── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-filter-url]'), function(btn){
    btn.addEventListener('click', function(){
      var to = btn.getAttribute('data-filter-url');
      if (to) window.location.assign(to);
    });
  });

  /* ── price range: navigate with filter.v.price params on change ── */
  function bindPrice(sel){
    var input = document.querySelector(sel);
    if (!input) return;
    input.addEventListener('change', function(){
      var url = new URL(window.location.href);
      var param = input.getAttribute('data-param');
      var val = (input.value || '').replace(/[^\d.]/g, '');
      if (!param) return;
      if (val) url.searchParams.set(param, val);
      else url.searchParams.delete(param);
      window.location.assign(url.toString());
    });
  }
  bindPrice('[data-price-min]');
  bindPrice('[data-price-max]');
})();
