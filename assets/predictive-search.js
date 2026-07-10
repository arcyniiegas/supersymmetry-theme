/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — PREDICTIVE SEARCH (overlay behaviour)
   Binds to the overlay built in snippets/search-overlay.liquid.
   Open/close is owned by chrome.js — this file only handles the
   query → results behaviour via the Shopify Predictive Search JSON API.
   ════════════════════════════════════════════════════════════ */
(function () {
  var overlay = document.getElementById('ssSearch');
  if (!overlay) return;

  var input = document.getElementById('ssSearchInput');
  var grid  = document.getElementById('ssSearchGrid');
  var count = document.getElementById('ssSearchCount');
  var clear = document.getElementById('ssSearchClear');
  var emptyQ = document.getElementById('ssSearchEmptyQ');
  if (!input || !grid || !count) return;

  var MIN = 2;
  var DEBOUNCE = 200;
  var timer = null;
  var lastToken = 0;

  /* Lithuanian plural for the results count (mirrors the prototype) */
  function plural(n) {
    if (n === 1) return 'rezultatas';
    var d = n % 10, dd = n % 100;
    if (d >= 2 && d <= 9 && !(dd >= 12 && dd <= 19)) return 'rezultatai';
    return 'rezultatų';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* format a decimal price (major units, per suggest.json) as €NNN */
  function money(v) {
    var n = parseFloat(v);
    if (isNaN(n)) return '';
    if (n % 1 === 0) return '€' + n.toFixed(0);
    return '€' + n.toFixed(2).replace('.', ',');
  }

  function productCard(p) {
    var img = p.image
      ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" />'
      : '';
    var priceVal = money(p.price);
    var compare = money(p.compare_at_price_max);
    var priceHTML = '';
    if (priceVal) {
      priceHTML = '<div class="card__price"><span>' + priceVal + '</span>' +
        (compare && parseFloat(p.compare_at_price_max) > parseFloat(p.price)
          ? '<span class="strike">' + compare + '</span>' : '') +
        '</div>';
    }
    var sub = p.type
      ? '<span class="card__sub">' + esc(p.type) + '</span>'
      : '';
    return '<a class="card" href="' + esc(p.url) + '">' +
      '<div class="card__media">' + img + '</div>' +
      '<div class="card__body"><div>' +
      '<div class="card__name">' + esc(p.title) + '</div>' + sub +
      '</div>' + priceHTML + '</div></a>';
  }

  function simpleCard(item, label) {
    var img = item.image
      ? '<img src="' + esc(item.image) + '" alt="" loading="lazy" />'
      : '';
    return '<a class="card' + (img ? '' : ' card--light') + '" href="' + esc(item.url) + '">' +
      '<div class="card__media' + (img ? '' : ' card--light') + '">' + img +
      '<span class="card__chip">' + label + '</span></div>' +
      '<div class="card__body"><div>' +
      '<div class="card__name">' + esc(item.title) + '</div>' +
      '</div></div></a>';
  }

  function render(res, q) {
    var products    = (res && res.products)    || [];
    var collections = (res && res.collections) || [];
    var articles    = (res && res.articles)    || [];
    var total = products.length + collections.length + articles.length;

    if (total === 0) {
      grid.innerHTML = '';
      count.innerHTML = '';
      overlay.classList.add('is-empty');
      if (emptyQ) emptyQ.textContent = '„' + q + '“';
      return;
    }

    overlay.classList.remove('is-empty');
    var html = '';
    products.forEach(function (p) { html += productCard(p); });
    collections.forEach(function (c) { html += simpleCard(c, 'Kolekcija'); });
    articles.forEach(function (a) { html += simpleCard(a, 'Žurnalas'); });
    grid.innerHTML = html;
    count.innerHTML = 'Rasta <b>' + total + '</b> ' + plural(total) +
      ' · <em>„' + esc(q) + '“</em>' +
      ' <a class="ss-search__all" href="/search?q=' + encodeURIComponent(q) +
      '&options[prefix]=last">Visi rezultatai →</a>';
  }

  function reset() {
    grid.innerHTML = '';
    count.innerHTML = '';
    overlay.classList.remove('is-empty');
  }

  function fetchResults(q) {
    var token = ++lastToken;
    var url = '/search/suggest.json?q=' + encodeURIComponent(q) +
      '&resources[type]=product,collection,article&resources[limit]=8';
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (token !== lastToken) return; // stale response
        var res = data && data.resources && data.resources.results;
        render(res || {}, q);
      })
      .catch(function () {
        if (token !== lastToken) return;
        reset();
      });
  }

  function doSearch(raw) {
    var q = (raw == null ? input.value : raw).trim();
    if (q.length < MIN) { lastToken++; reset(); return; }
    fetchResults(q);
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { doSearch(); }, DEBOUNCE);
  }

  input.addEventListener('input', schedule);

  if (clear) {
    clear.addEventListener('click', function () { lastToken++; reset(); });
  }

  /* Chips: chrome.js sets input.value; ensure a search actually fires. */
  Array.prototype.forEach.call(overlay.querySelectorAll('.ss-search__chip'), function (chip) {
    chip.addEventListener('click', function () {
      var term = chip.getAttribute('data-term') || '';
      input.value = term;
      doSearch(term);
    });
  });

  /* If the overlay is opened with a value already present, run once. */
  if (input.value && input.value.trim().length >= MIN) doSearch();
})();
