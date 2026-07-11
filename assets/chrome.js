/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — CHROME UX (trimmed)
   Markup now lives in Liquid; this only wires up interactions:
   mobile menu open/close, search overlay open/close, body scroll lock.
   ════════════════════════════════════════════════════════════ */
(function () {
  function on(els, ev, fn) {
    Array.prototype.forEach.call(els, function (el) { el.addEventListener(ev, fn); });
  }

  /* The full-screen mobile menu (#ssMenu) is now the shared <theme-drawer>
     Custom Element (component-drawer.js) — it wires open/close/Esc/trap/
     scroll-lock/focus-return itself. The search overlay migrates next. */

  /* ── in-page search overlay ── */
  /* #ssSearch is a <theme-drawer>: it owns close / Esc / focus-trap /
     scroll-lock / focus-return. Two search-specific bits stay here — opening
     the overlay from search links (predictive UX instead of navigating) and
     clearing the input. Chip clicks are owned by predictive-search.js. */
  var sOverlay = document.getElementById('ssSearch');
  if (sOverlay) {
    var sInput = document.getElementById('ssSearchInput');
    var sClear = document.getElementById('ssSearchClear');
    on(document.querySelectorAll('[data-search-open], a[href$="/search"]'), 'click', function (e) {
      e.preventDefault();
      sOverlay.open(this);
    });
    if (sClear && sInput) {
      sClear.addEventListener('click', function () { sInput.value = ''; sInput.focus(); });
    }
  }

  /* ── full-bleed hero offset ──
     Measure the chrome (utility bar + sticky header) and publish it as
     --chrome-h so a full-bleed hero can slide up beneath the glass header
     (the glass then blurs real imagery instead of collapsing to white).
     Measured from the elements directly so the hero's own negative margin
     can never feed back into the value. */
  (function () {
    var root = document.documentElement;
    function setChromeH() {
      var util = document.querySelector('.utility');
      var header = document.querySelector('.header');
      var h = (util ? util.offsetHeight : 0) + (header ? header.offsetHeight : 0);
      if (h > 0) root.style.setProperty('--chrome-h', h + 'px');
    }
    setChromeH();
    window.addEventListener('load', setChromeH);
    window.addEventListener('resize', setChromeH);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setChromeH); }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(setChromeH);
      ['.utility', '.header'].forEach(function (s) {
        var el = document.querySelector(s);
        if (el) ro.observe(el);
      });
    }
  })();

  /* ── mobile utility-bar disclosure (if present) ── */
  on(document.querySelectorAll('[data-utility-toggle]'), 'click', function () {
    var t = this.getAttribute('data-utility-toggle');
    var panel = t ? document.getElementById(t) : null;
    if (panel) panel.classList.toggle('is-open');
  });
})();
