/* Cookie consent — Shopify Customer Privacy API.
   The banner markup ships hidden; it is revealed only when the API reports
   that the visitor's region requires consent and none is stored yet.
   Accept grants all tracking purposes, decline grants none — Shopify
   persists the choice and gates its own analytics/pixels accordingly. */
(function () {
  'use strict';

  var banner = document.getElementById('consentBanner');
  if (!banner || !window.Shopify || typeof window.Shopify.loadFeatures !== 'function') return;

  window.Shopify.loadFeatures(
    [{ name: 'consent-tracking-api', version: '0.1' }],
    function (error) {
      if (error) return;
      var cp = window.Shopify.customerPrivacy;
      if (!cp) return;

      var required = typeof cp.shouldShowBanner === 'function'
        ? cp.shouldShowBanner()
        : (typeof cp.shouldShowGDPRBanner === 'function' && cp.shouldShowGDPRBanner());
      if (!required) return;

      banner.hidden = false;
      requestAnimationFrame(function () { banner.classList.add('is-open'); });

      function close() {
        banner.classList.remove('is-open');
        setTimeout(function () { banner.hidden = true; }, 300);
      }

      function respond(granted) {
        cp.setTrackingConsent(
          { analytics: granted, marketing: granted, preferences: granted, sale_of_data: granted },
          close
        );
      }

      banner.querySelector('[data-consent-accept]').addEventListener('click', function () { respond(true); });
      banner.querySelector('[data-consent-decline]').addEventListener('click', function () { respond(false); });
    }
  );
})();
