/* ════════════════════════════════════════════════════════════
   <scroll-spy> — highlights the subnav chip for the section currently
   in view. Autonomous Custom Element: connectedCallback wires the
   IntersectionObserver, so it re-initialises automatically whenever the
   Theme Editor re-renders the section (fixing the "runs once" gap of the
   old IIFE). disconnectedCallback tears the observer down. Scoped to its
   own chips, so multiple instances on a page don't collide.

   Markup: <scroll-spy class="subnav" role="navigation" aria-label="…">
             <div class="subnav__wrap"><a class="subnav__chip" href="#anchor">…</a>…</div>
           </scroll-spy>
   ════════════════════════════════════════════════════════════ */
if (!customElements.get('scroll-spy')) {
  class ScrollSpy extends HTMLElement {
    connectedCallback() {
      const chips = Array.from(this.querySelectorAll('.subnav__chip'));
      if (!chips.length || !('IntersectionObserver' in window)) return;
      const map = {};
      chips.forEach((c) => { map[c.getAttribute('href').slice(1)] = c; });
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          chips.forEach((c) => c.setAttribute('aria-current', 'false'));
          if (map[e.target.id]) map[e.target.id].setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      chips.forEach((c) => {
        const target = document.getElementById(c.getAttribute('href').slice(1));
        if (target) this._observer.observe(target);
      });
    }

    disconnectedCallback() {
      if (this._observer) { this._observer.disconnect(); this._observer = null; }
    }
  }
  customElements.define('scroll-spy', ScrollSpy);
}
