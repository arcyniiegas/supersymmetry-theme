/* ════════════════════════════════════════════════════════════
   SUPERSYMMETRY — CHROME UX (trimmed)
   Markup now lives in Liquid; this only wires up interactions:
   mobile menu open/close, search overlay open/close, body scroll lock.
   ════════════════════════════════════════════════════════════ */
(function () {
  function on(els, ev, fn) {
    Array.prototype.forEach.call(els, function (el) { el.addEventListener(ev, fn); });
  }

  /* ── full-screen Meniu overlay ── */
  var menu = document.getElementById('ssMenu');
  if (menu) {
    var openMenu = function () { menu.classList.add('is-open'); document.body.classList.add('menu-open'); };
    var closeMenu = function () { menu.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
    on(document.querySelectorAll('[data-menu-open]'), 'click', openMenu);
    on(document.querySelectorAll('[data-menu-close]'), 'click', closeMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  /* ── in-page search overlay ── */
  var sOverlay = document.getElementById('ssSearch');
  if (sOverlay) {
    var sInput = document.getElementById('ssSearchInput');
    var sClear = document.getElementById('ssSearchClear');
    var lastTrigger = null;
    var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var openSearch = function (e) {
      if (e) e.preventDefault();
      lastTrigger = (e && e.currentTarget) || document.activeElement;
      sOverlay.classList.add('is-open');
      document.body.classList.add('ss-search-open');
      if (sInput) setTimeout(function () { sInput.focus(); }, 60);
    };
    var closeSearch = function () {
      sOverlay.classList.remove('is-open');
      document.body.classList.remove('ss-search-open');
      /* return focus to whatever opened the overlay (WCAG 2.4.3) */
      if (lastTrigger && typeof lastTrigger.focus === 'function') { lastTrigger.focus(); }
    };
    on(document.querySelectorAll('[data-search-open]'), 'click', openSearch);
    on(document.querySelectorAll('a[href$="/search"]'), 'click', openSearch);
    on(document.querySelectorAll('[data-search-close]'), 'click', closeSearch);
    if (sClear && sInput) {
      sClear.addEventListener('click', function () { sInput.value = ''; sInput.focus(); });
    }
    /* chip clicks are owned by predictive-search.js (it sets the value AND fires
       the search); no duplicate listener here. */
    document.addEventListener('keydown', function (e) {
      if (!sOverlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeSearch(); return; }
      /* focus trap: keep Tab within the modal dialog */
      if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(
          sOverlay.querySelectorAll(FOCUSABLE),
          function (el) { return el.offsetParent !== null; }
        );
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
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
