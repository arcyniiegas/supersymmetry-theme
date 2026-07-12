/* ════════════════════════════════════════════════════════════
   <theme-drawer> — one off-canvas / overlay panel behaviour:
   open / close, body scroll-lock, focus trap (WCAG 2.4.3), Esc to
   close, scrim/close-button click, and focus return to the trigger.
   Theme-Editor-aware: wires itself in connectedCallback, tears down
   in disconnectedCallback. Replaces the duplicated drawer logic that
   lived in chrome.js (menu, search) and collection.js (filter drawer).

   The styled panel IS the element:
     <theme-drawer id="filterDrawer" class="fdrawer"
                   data-body-class="fdrawer-open"
                   data-portal data-focus=".fdrawer__close"> … </theme-drawer>

   Openers (anywhere):  <button data-drawer-open="filterDrawer">
   Closers (inside):    any element with [data-drawer-close] (scrim, ✕, CTA)

   Attributes:
     data-body-class  class toggled on <body> while open (scroll-lock). Default "drawer-open".
     data-open-class  class toggled on the drawer while open. Default "is-open".
     data-portal      move the element to <body> so position:fixed resolves against the viewport.
     data-focus       selector for the element to focus on open (default: first [data-drawer-close], else first focusable).
   ════════════════════════════════════════════════════════════ */
(function () {
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  class ThemeDrawer extends HTMLElement {
    connectedCallback() {
      if (this._wired) return;
      this._wired = true;
      var self = this;

      this._bodyClass = this.getAttribute('data-body-class') || 'drawer-open';
      this._openClass = this.getAttribute('data-open-class') || 'is-open';

      /* portal to body so position:fixed resolves against the real viewport */
      if (this.hasAttribute('data-portal') && this.parentElement !== document.body) {
        document.body.appendChild(this);
      }

      this._trigger = null;

      this._onOpen = function (e) { if (e) e.preventDefault(); self.open(e && e.currentTarget); };
      this._openers = document.querySelectorAll('[data-drawer-open="' + this.id + '"]');
      Array.prototype.forEach.call(this._openers, function (o) {
        o.addEventListener('click', self._onOpen);
        o.setAttribute('aria-haspopup', 'dialog');
        o.setAttribute('aria-controls', self.id);
        o.setAttribute('aria-expanded', 'false');
      });

      this._onClose = function () { self.close(); };
      Array.prototype.forEach.call(this.querySelectorAll('[data-drawer-close]'), function (c) {
        c.addEventListener('click', self._onClose);
      });

      this._onKeydown = function (e) {
        if (!self.classList.contains(self._openClass)) return;
        if (e.key === 'Escape') { self.close(); return; }
        if (e.key === 'Tab') self._trap(e);
      };
      document.addEventListener('keydown', this._onKeydown);
    }

    disconnectedCallback() {
      if (this._onKeydown) document.removeEventListener('keydown', this._onKeydown);
      this._setBackgroundInert(false);
    }

    open(trigger) {
      this._trigger = trigger || document.activeElement;
      this.classList.add(this._openClass);
      document.body.classList.add(this._bodyClass);
      this._setBackgroundInert(true);
      Array.prototype.forEach.call(this._openers, function (o) { o.setAttribute('aria-expanded', 'true'); });
      var sel = this.getAttribute('data-focus');
      var target = (sel && this.querySelector(sel)) ||
        this.querySelector('[data-drawer-close]') || this.querySelector(FOCUSABLE);
      if (target) setTimeout(function () { target.focus(); }, 60);
    }

    close() {
      this.classList.remove(this._openClass);
      document.body.classList.remove(this._bodyClass);
      /* lift inert BEFORE returning focus — focus() is a no-op on an inert element */
      this._setBackgroundInert(false);
      Array.prototype.forEach.call(this._openers, function (o) { o.setAttribute('aria-expanded', 'false'); });
      if (this._trigger && typeof this._trigger.focus === 'function') this._trigger.focus();
    }

    /* Make everything outside the open panel inert — removed from the tab order
       AND the accessibility tree — so screen-reader / keyboard users can't reach
       the page behind the modal (aria-modal alone is unreliable; WAI-ARIA APG
       recommends inert). Walks the drawer's ancestor chain and inerts each
       sibling, which is correct whether the panel is portaled to <body> (cart,
       menu, filter) or nested where it was rendered (search). Only elements this
       instance sets inert are tracked and later cleared, so pre-existing inert
       state is never clobbered. */
    _setBackgroundInert(on) {
      if (on) {
        var inerted = [];
        var node = this;
        while (node && node !== document.body && node.parentElement) {
          var parent = node.parentElement;
          var current = node;
          Array.prototype.forEach.call(parent.children, function (sib) {
            if (sib !== current && !sib.hasAttribute('inert')) {
              sib.setAttribute('inert', '');
              inerted.push(sib);
            }
          });
          node = parent;
        }
        this._inerted = inerted;
      } else if (this._inerted) {
        this._inerted.forEach(function (el) { el.removeAttribute('inert'); });
        this._inerted = null;
      }
    }

    _trap(e) {
      var f = Array.prototype.filter.call(
        this.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  if (!customElements.get('theme-drawer')) customElements.define('theme-drawer', ThemeDrawer);
})();
