/* ════════════════════════════════════════════════════════════
   COLLECTION — UI behaviour.
   · View toggle (grid / dense / list) — client-side only.
   · Faceted filtering, sort, price and pagination applied IN PLACE
     (fetch + swap) so the filter drawer stays open and several
     sizes/colours can be chosen in one pass. Real filtering is still
     Shopify's — we only fetch the same filter URLs and graft the
     updated grid + facets back in, then push the URL to history.
   ════════════════════════════════════════════════════════════ */
(function () {
  /* ── view toggle: grid / dense / list ── */
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll('.viewtog button'));
  var viewClasses = ['', 'grid--dense', 'grid--list'];
  viewBtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      viewBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var grid = document.querySelector('.grid');
      if (grid) {
        grid.classList.remove('grid--dense', 'grid--list');
        if (viewClasses[i]) grid.classList.add(viewClasses[i]);
      }
    });
  });

  /* ── in-place filtering ── */
  var grid = document.querySelector('.grid');
  if (!grid) return; // nothing to filter (e.g. empty prototype shell)

  function liveDrawer(sel) { return document.querySelector('#filterDrawer ' + sel) || document.querySelector(sel); }
  function replaceInner(sel, doc) {
    var live = document.querySelector(sel), next = doc.querySelector(sel);
    if (live && next) live.innerHTML = next.innerHTML;
  }

  function swap(doc) {
    // Results grid (cards + load-more/pagination)
    replaceInner('.grid', doc);
    // Active-filter chips row
    var a = document.querySelector('#activeRow'), na = doc.querySelector('#activeRow');
    if (a && na) { a.innerHTML = na.innerHTML; a.hidden = na.hasAttribute('hidden'); }
    // Drawer facets (counts + pressed + disabled states refresh here)
    var body = liveDrawer('.fdrawer__body'), nbody = doc.querySelector('.fdrawer__body');
    if (body && nbody) body.innerHTML = nbody.innerHTML;
    // Drawer title count
    var title = liveDrawer('.fdrawer__title'), ntitle = doc.querySelector('.fdrawer__title');
    if (title && ntitle) title.innerHTML = ntitle.innerHTML;
    // "Show N" button label (keep the element so its close handler survives)
    var show = liveDrawer('.fdrawer__foot .btn'), nshow = doc.querySelector('.fdrawer__foot .btn');
    if (show && nshow) show.textContent = nshow.textContent;
    // Filter-count badges on every drawer trigger (toolbar #filterOpen + the
    // crumbs .crumbs__filters). The triggers themselves are kept so their
    // drawer-open handlers survive; only the badge text syncs.
    var nextBadge = doc.querySelector('#filterOpen .filterbtn__n') || doc.querySelector('.crumbs__filters .filterbtn__n');
    Array.prototype.forEach.call(document.querySelectorAll('[data-drawer-open="filterDrawer"]'), function (openBtn) {
      var liveBadge = openBtn.querySelector('.filterbtn__n');
      if (nextBadge) {
        if (liveBadge) liveBadge.textContent = nextBadge.textContent;
        else { var s = document.createElement('span'); s.className = 'filterbtn__n'; s.textContent = nextBadge.textContent; openBtn.appendChild(s); }
      } else if (liveBadge) { liveBadge.remove(); }
    });
    // Keep the sort control in sync with the applied URL
    var ls = document.querySelector('#sortSel'), ns = doc.querySelector('#sortSel');
    if (ls && ns) ls.value = ns.value;
  }

  function applyUrl(url, opts) {
    opts = opts || {};
    grid.classList.add('is-loading');
    fetch(url, { headers: { 'X-Requested-With': 'fetch' } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        swap(new DOMParser().parseFromString(html, 'text/html'));
        if (!opts.noPush) history.pushState({ ajax: true }, '', url);
        grid.classList.remove('is-loading');
        if (opts.scroll) {
          var sb = document.querySelector('.subbar');
          if (sb) sb.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(function () { window.location.assign(url); }); // network fail → hard nav
  }

  /* Facet buttons, active chips, clear-all, pagination — all carry a target URL. */
  document.addEventListener('click', function (e) {
    var facet = e.target.closest('[data-filter-url]');
    if (facet) {
      var to = facet.getAttribute('data-filter-url');
      if (to) { e.preventDefault(); applyUrl(to); }
      return;
    }
    /* Drawer sort options — sort_by onto the CURRENT url keeps active filters. */
    var sortBtn = e.target.closest('[data-sort]');
    if (sortBtn) {
      var su = new URL(window.location.href);
      su.searchParams.set('sort_by', sortBtn.getAttribute('data-sort'));
      applyUrl(su.toString());
      return;
    }
    var link = e.target.closest('.active__chip, .active__clear, .fdrawer__reset');
    if (link && link.getAttribute('href')) { e.preventDefault(); applyUrl(link.getAttribute('href')); return; }
    var page = e.target.closest('.loadmore__pagination a');
    if (page && page.getAttribute('href')) { e.preventDefault(); applyUrl(page.getAttribute('href'), { scroll: true }); return; }
  });

  /* Sort select + price fields. */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'sortSel') {
      var u = new URL(window.location.href);
      u.searchParams.set('sort_by', t.value);
      applyUrl(u.toString(), { scroll: true });
      return;
    }
    if (t.matches && t.matches('[data-price-min], [data-price-max]')) {
      var param = t.getAttribute('data-param');
      if (!param) return;
      var pu = new URL(window.location.href);
      var val = (t.value || '').replace(/[^\d.]/g, '');
      if (val) pu.searchParams.set(param, val); else pu.searchParams.delete(param);
      applyUrl(pu.toString());
    }
  });

  /* Enter inside a price field would submit the wrapping GET form — keep it AJAX. */
  var sortForm = document.querySelector('#sortSel') && document.querySelector('#sortSel').form;
  if (sortForm) sortForm.addEventListener('submit', function (e) { e.preventDefault(); applyUrl(window.location.href); });

  /* Back/forward through filter history. */
  window.addEventListener('popstate', function () { applyUrl(window.location.href, { noPush: true }); });
})();
