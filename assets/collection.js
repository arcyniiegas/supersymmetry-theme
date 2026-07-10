/* ════════════════════════════════════════════════════════════
   COLLECTION — UI behaviour only.
   Real filtering/sorting is handled by Shopify via URL params;
   the prototype's fake client-side catalog/filter math is removed.
   ════════════════════════════════════════════════════════════ */
(function(){
  var grid = document.querySelector('.grid');

  /* ── filter drawer: open/close, Esc, scrim click, focus trap, scroll lock ── */
  var drawer = document.getElementById('filterDrawer');
  var filterOpen = document.getElementById('filterOpen');
  if (drawer && filterOpen){
    /* portal: mount at body level so position:fixed resolves against the real
       viewport, exactly like the dock / mobile menu / search overlay */
    document.body.appendChild(drawer);
    var openDrawer = function(){
      drawer.classList.add('is-open');
      document.body.classList.add('fdrawer-open');
      filterOpen.setAttribute('aria-expanded', 'true');
      var c = drawer.querySelector('.fdrawer__close');
      if (c) c.focus();
    };
    var closeDrawer = function(){
      drawer.classList.remove('is-open');
      document.body.classList.remove('fdrawer-open');
      filterOpen.setAttribute('aria-expanded', 'false');
      filterOpen.focus(); /* return focus to the trigger (WCAG 2.4.3) */
    };
    filterOpen.addEventListener('click', openDrawer);
    Array.prototype.forEach.call(drawer.querySelectorAll('[data-drawer-close]'), function(el){
      el.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function(e){
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape'){ closeDrawer(); return; }
      /* focus trap: keep Tab within the dialog */
      if (e.key === 'Tab'){
        var f = Array.prototype.filter.call(
          drawer.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'),
          function(el){ return el.offsetParent !== null; }
        );
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }

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
