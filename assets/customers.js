/* Customer account pages — address form toggling + country/province wiring. */
(function () {
  'use strict';

  /* ── form visibility ─────────────────────────────────────── */
  var newForm = document.getElementById('addrFormNew');

  function hideAllForms() {
    document.querySelectorAll('.addr-form').forEach(function (f) { f.hidden = true; });
  }

  document.querySelectorAll('[data-addr-new]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasHidden = newForm.hidden;
      hideAllForms();
      newForm.hidden = !wasHidden;
      if (!newForm.hidden) newForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  document.querySelectorAll('[data-addr-edit]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = document.getElementById('addrFormEdit-' + btn.getAttribute('data-addr-edit'));
      if (!form) return;
      var wasHidden = form.hidden;
      hideAllForms();
      form.hidden = !wasHidden;
      if (!form.hidden) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  document.querySelectorAll('[data-addr-cancel]').forEach(function (btn) {
    btn.addEventListener('click', hideAllForms);
  });

  /* ── country → province ──────────────────────────────────── */
  document.querySelectorAll('select[data-address-country]').forEach(function (countrySel) {
    var scope = countrySel.closest('form');
    var provinceSel = scope && scope.querySelector('select[data-address-province]');
    var provinceWrap = scope && scope.querySelector('[data-province-wrap]');
    if (!provinceSel) return;

    function syncProvinces() {
      var opt = countrySel.options[countrySel.selectedIndex];
      var provinces = [];
      try { provinces = JSON.parse(opt.getAttribute('data-provinces') || '[]'); } catch (e) { /* leave empty */ }
      provinceSel.innerHTML = '';
      provinces.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p[0];
        o.textContent = p[1];
        provinceSel.appendChild(o);
      });
      if (provinceWrap) provinceWrap.hidden = provinces.length === 0;
      var saved = provinceSel.getAttribute('data-default');
      if (saved) provinceSel.value = saved;
    }

    var savedCountry = countrySel.getAttribute('data-default');
    if (savedCountry) countrySel.value = savedCountry;
    countrySel.addEventListener('change', syncProvinces);
    syncProvinces();
  });
})();
