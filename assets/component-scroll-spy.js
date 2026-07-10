/* ════════════════════════════════════════════════════════════
   <scroll-spy> — highlights the subnav chip for the section currently
   in view. Autonomous Custom Element: connectedCallback wires the
   IntersectionObserver, so it re-initialises automatically whenever the
   Theme Editor re-renders the section (fixing the "runs once" gap of the
   old IIFEs). disconnectedCallback tears everything down. Scoped to its
   own chips, so multiple instances on a page don't collide.

   Markup: <scroll-spy class="subnav" role="navigation" aria-label="…"
             [data-spy-margin="-45% 0px -50% 0px"]>
             <div class="subnav__wrap"><a class="subnav__chip" href="#anchor">…</a>…</div>
           </scroll-spy>
   ════════════════════════════════════════════════════════════ */
if (!customElements.get('scroll-spy')) {
  class ScrollSpy extends HTMLElement {
    connectedCallback() {
      const chips = Array.from(this.querySelectorAll('.subnav__chip'));
      if (!chips.length) return;
      const setActive = (chip) => {
        chips.forEach((c) => c.setAttribute('aria-current', 'false'));
        if (chip) chip.setAttribute('aria-current', 'true');
      };

      /* instant feedback on click, before the smooth-scroll settles */
      this._onClick = (e) => {
        const chip = e.target.closest('.subnav__chip');
        if (chip && this.contains(chip)) setActive(chip);
      };
      this.addEventListener('click', this._onClick);

      if (!('IntersectionObserver' in window)) return;
      const map = {};
      chips.forEach((c) => { map[c.getAttribute('href').slice(1)] = c; });
      const rootMargin = this.dataset.spyMargin || '-45% 0px -50% 0px';
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(map[e.target.id]); });
      }, { rootMargin, threshold: 0 });
      chips.forEach((c) => {
        const target = document.getElementById(c.getAttribute('href').slice(1));
        if (target) this._observer.observe(target);
      });
    }

    disconnectedCallback() {
      if (this._observer) { this._observer.disconnect(); this._observer = null; }
      if (this._onClick) { this.removeEventListener('click', this._onClick); this._onClick = null; }
    }
  }
  customElements.define('scroll-spy', ScrollSpy);
}
