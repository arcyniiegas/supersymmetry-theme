/* Delivery estimator — computes dispatch + delivery in Europe/Vilnius.
   Rule: dispatch = today if a working day before 18:00, else next working day;
   delivery = dispatch + 2 working days. Working day = not Sat/Sun and not an LT
   public holiday. Computed client-side so Shopify page caching can't stale it,
   and always in the atelier's timezone (not the shopper's).
   REFRESH LT_HOLIDAYS each year — Easter-linked dates move. */
(function () {
  var TZ = 'Europe/Vilnius';
  var CUTOFF_HOUR = 18;
  var LT_HOLIDAYS = [
    '2026-01-01','2026-02-16','2026-03-11','2026-04-05','2026-04-06',
    '2026-05-01','2026-06-24','2026-07-06','2026-08-15','2026-11-01',
    '2026-11-02','2026-12-24','2026-12-25','2026-12-26',
    '2027-01-01','2027-02-16','2027-03-11','2027-03-28','2027-03-29',
    '2027-05-01','2027-06-24','2027-07-06','2027-08-15','2027-11-01',
    '2027-11-02','2027-12-24','2027-12-25','2027-12-26'
  ];
  // LT abbreviated (genitive) months — Intl lt-LT renders month:'short' numerically.
  var LT_MONTHS = ['saus.','vas.','kov.','bal.','geg.','birž.','liep.','rugp.','rugs.','spal.','lapkr.','gruod.'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // Parts of "now" in the shop timezone, independent of the visitor's tz.
  function vilniusParts(d) {
    var f = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false
    });
    var p = {};
    f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p; // {year, month, day, hour}
  }
  function iso(dt) {
    return dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
  }
  // A plain UTC-midnight Date keyed to a Vilnius calendar day (date-only math).
  function dayFromParts(p) { return new Date(Date.UTC(+p.year, +p.month - 1, +p.day)); }
  function isWorkingDay(dt) {
    var dow = dt.getUTCDay();                 // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) return false;
    return LT_HOLIDAYS.indexOf(iso(dt)) === -1;
  }
  function addDays(dt, n) { var x = new Date(dt); x.setUTCDate(x.getUTCDate() + n); return x; }
  function nextWorkingDay(dt) { do { dt = addDays(dt, 1); } while (!isWorkingDay(dt)); return dt; }
  function addWorkingDays(dt, n) { for (var i = 0; i < n; i++) dt = nextWorkingDay(dt); return dt; }

  function compute(now) {
    var p = vilniusParts(now);
    var today = dayFromParts(p);
    var beforeCutoff = (+p.hour) < CUTOFF_HOUR;
    var dispatch = (isWorkingDay(today) && beforeCutoff) ? today : nextWorkingDay(today);
    return {
      placed: today,
      shipped: dispatch,
      transit: addWorkingDays(dispatch, 1),
      delivered: addWorkingDays(dispatch, 2)
    };
  }

  function fmt(dt) {
    var lang = (document.documentElement.lang || 'lt').toLowerCase();
    if (lang.indexOf('lt') === 0) {
      // "Št, 11 liep." — Intl lt-LT gives numeric months, so use the table.
      var wd = new Intl.DateTimeFormat('lt-LT', { timeZone: 'UTC', weekday: 'short' }).format(dt);
      wd = wd.charAt(0).toUpperCase() + wd.slice(1);
      return wd + ', ' + dt.getUTCDate() + ' ' + LT_MONTHS[dt.getUTCMonth()];
    }
    return new Intl.DateTimeFormat(lang, {
      timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short'
    }).format(dt);
  }

  function init() {
    var root = document.querySelector('.delivery .gantt');
    if (!root) return;
    var r = compute(new Date());
    var order = [r.placed, r.shipped, r.transit, r.delivered];
    root.querySelectorAll('.gantt__row .gantt__date').forEach(function (el, i) {
      if (order[i]) el.textContent = fmt(order[i]);
    });
  }

  // Exposed for verification.
  window.theme = window.theme || {};
  window.theme.deliveryEstimate = compute;

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
