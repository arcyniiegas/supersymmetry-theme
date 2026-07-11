(function () {
  /* Re-runnable so the product section re-initialises when the Theme Editor
     re-renders it (shopify:section:load). On the storefront this runs exactly
     once — identical to before. The one portaled element (the body-level buy
     bar) is cleared first so a re-render can't leave a duplicate behind. */
  function initProduct() {
    var staleBuybar = document.querySelector('.buybar');
    if (staleBuybar) staleBuybar.remove();
    var main = document.querySelector('.product');
  var title = (main && main.getAttribute('data-product-title')) || '';
  var price = (main && main.getAttribute('data-price')) || '';
  var compare = (main && main.getAttribute('data-compare')) || '';
  var curSize = (main && main.getAttribute('data-current-size')) || '';

  /* ── sticky buy bar (JS-generated), fed with real product title + price ── */
  var buybar = document.createElement('div');
  buybar.className = 'buybar';
  var priceHtml = price + (compare ? ' <s style="opacity:.55">' + compare + '</s>' : '');
  buybar.innerHTML =
    '<div class="buybar__meta">' +
      '<span class="buybar__name"></span>' +
      '<span class="buybar__price"></span>' +
    '</div>' +
    '<span class="buybar__size" data-buybar-size></span>' +
    '<button class="btn btn--primary" type="button" data-buybar-add style="white-space:nowrap;"><span>Į krepšelį</span></button>';
  document.body.appendChild(buybar);
  buybar.querySelector('.buybar__name').textContent = title;
  buybar.querySelector('.buybar__price').innerHTML = priceHtml;
  var buybarSize = buybar.querySelector('[data-buybar-size]');
  if (buybarSize) buybarSize.textContent = curSize ? 'EU ' + curSize : '';

  var ctas = document.querySelector('.ctas');
  if (ctas && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      // show only after the CTA block has scrolled ABOVE the viewport
      buybar.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(ctas);
  }

  /* ── commerce wiring ── */
  var form = document.querySelector('.product form[action*="/cart/add"]') || document.querySelector('.product form');
  var idInput = document.querySelector('[data-product-id]') || (form && form.querySelector('[name="id"]'));
  var atc = document.querySelector('[data-atc]');
  var priceCurrent = document.querySelector('.price__current');
  var priceStrike = document.querySelector('.price__strike');

  /* size selection */
  document.querySelectorAll('.size').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.hasAttribute('disabled')) return;
      document.querySelectorAll('.size').forEach(function (b) {
        b.classList.remove('is-selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-checked', 'true');

      var eu = btn.querySelector('.size__eu');
      var label = eu ? eu.textContent.trim() : btn.textContent.trim();
      if (buybarSize) buybarSize.textContent = 'EU ' + label;

      var note = document.querySelector('[data-sizes-note]');
      if (note) {
        var qty = parseInt(btn.getAttribute('data-variant-qty'), 10);
        if (qty > 0 && qty <= 5) { note.textContent = 'Liko ' + qty + ' vnt.'; note.hidden = false; }
        else { note.hidden = true; }
      }

      var vid = btn.getAttribute('data-variant-id');
      if (vid && idInput) idInput.value = vid;

      var vp = btn.getAttribute('data-variant-price');
      var vc = btn.getAttribute('data-variant-compare');
      if (vp && priceCurrent) priceCurrent.textContent = vp;
      if (priceStrike) {
        if (vc) { priceStrike.textContent = vc; priceStrike.style.display = ''; }
        else { priceStrike.style.display = 'none'; }
      }
      var bp = buybar.querySelector('.buybar__price');
      if (bp) bp.innerHTML = (vp || price) + (vc ? ' <s style="opacity:.55">' + vc + '</s>' : '');
    });
  });

  /* success UI on an add button */
  function added(btn) {
    if (!btn) return;
    var span = btn.querySelector('span');
    var arrow = btn.querySelector('.btn__arrow');
    if (!span) return;
    var orig = span.textContent;
    span.textContent = 'Pridėta ✓';
    if (arrow) arrow.style.display = 'none';
    setTimeout(function () {
      span.textContent = orig;
      if (arrow) arrow.style.display = '';
    }, 1400);
  }

  /* aria-live status region: announces success, shows errors visibly.
     Visually hidden by default; .is-error makes it a visible inline message. */
  var atcStatus = document.createElement('div');
  atcStatus.className = 'atc-status';
  atcStatus.setAttribute('role', 'status');
  atcStatus.setAttribute('aria-live', 'assertive');
  (function () {
    var host = document.querySelector('.ctas');
    if (host && host.parentNode) { host.parentNode.insertBefore(atcStatus, host.nextSibling); }
    else { document.body.appendChild(atcStatus); }
  })();

  /* real Shopify Cart AJAX add — guarded against double-clicks, surfaces errors */
  var adding = false;
  function addToCart(btn) {
    var id = idInput && idInput.value;
    if (!id || adding) return;
    adding = true;
    if (btn) btn.disabled = true;
    atcStatus.textContent = '';
    atcStatus.classList.remove('is-error');
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: id, quantity: 1 }] })
    })
      .then(function (r) {
        if (!r.ok) {
          /* Shopify returns a JSON description on 422 (e.g. sold out) — surface it */
          return r.json().catch(function () { return {}; }).then(function (err) {
            var e = new Error('add-failed');
            e.userMessage = (err && err.description) || null;
            throw e;
          });
        }
        return r.json();
      })
      .then(function () { return theme.cart.refresh(); })
      .then(function () {
        added(btn);
        atcStatus.textContent = 'Pridėta į krepšelį.';
      })
      .catch(function (err) {
        atcStatus.textContent = (err && err.userMessage) ||
          'Nepavyko pridėti į krepšelį — bandykite dar kartą.';
        atcStatus.classList.add('is-error');
      })
      .then(function () {
        adding = false;
        if (btn) btn.disabled = false;
      });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      addToCart(atc || form.querySelector('[type="submit"]'));
    });
  } else if (atc) {
    atc.addEventListener('click', function () { addToCart(atc); });
  }
  var buybarAdd = buybar.querySelector('[data-buybar-add]');
  if (buybarAdd) buybarAdd.addEventListener('click', function () { addToCart(buybarAdd); });

  /* size radiogroup: roving tabindex + arrow-key navigation (WAI-ARIA APG) */
  (function () {
    var group = document.querySelector('.sizes[role="radiogroup"]');
    if (!group) return;
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    var enabled = radios.filter(function (r) { return !r.disabled; });
    if (!enabled.length) return;
    function setTabStops() {
      var stop = enabled.filter(function (r) {
        return r.getAttribute('aria-checked') === 'true';
      })[0] || enabled[0];
      radios.forEach(function (r) { r.tabIndex = (r === stop) ? 0 : -1; });
    }
    setTabStops();
    group.addEventListener('keydown', function (e) {
      var cur = document.activeElement;
      var i = enabled.indexOf(cur);
      if (i === -1) return;
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = enabled[(i + 1) % enabled.length]; }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = enabled[(i - 1 + enabled.length) % enabled.length]; }
      else if (e.key === 'Home') { next = enabled[0]; }
      else if (e.key === 'End') { next = enabled[enabled.length - 1]; }
      else { return; }
      e.preventDefault();
      next.click();
      setTabStops();
      next.focus();
    });
    group.addEventListener('click', setTabStops);
  })();

  /* mobile gallery carousel — sync pagination dots */
  (function () {
    var gallery = document.querySelector('.gallery');
    var dots = Array.prototype.slice.call(document.querySelectorAll('.gallery-dots button'));
    if (!gallery || !dots.length) return;
    var shots = gallery.querySelectorAll('.shot');
    var raf;
    function sync() {
      var i = Math.round(gallery.scrollLeft / gallery.clientWidth);
      i = Math.max(0, Math.min(dots.length - 1, i));
      dots.forEach(function (d, n) { d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    }
    gallery.addEventListener('scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () {
        if (shots[n]) gallery.scrollTo({ left: n * gallery.clientWidth, behavior: 'smooth' });
      });
    });
  })();

  /* reviews expand / collapse */
  (function () {
    var t = document.getElementById('revToggle');
    var list = document.getElementById('revList');
    if (!t || !list) return;
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!open));
      list.hidden = open;
      t.firstChild.textContent = open ? 'Skaityti atsiliepimus\n      ' : 'Suskleisti\n      ';
    });
  })();
  }

  initProduct();
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector('.product')) initProduct();
  });
})();
