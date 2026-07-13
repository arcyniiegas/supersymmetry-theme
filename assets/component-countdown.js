/* Countdown — ticks a sale banner down to a target wall-clock time in a fixed
   timezone (Europe/Vilnius by default), so the deadline is the same absolute
   instant for every shopper and Shopify page caching can't stale it. Reads the
   target from [data-countdown][data-end="YYYY-MM-DD HH:MM"][data-tz]. Progressive
   enhancement: with no JS the markup still shows a static "00" grid. */
(function () {
  // Offset (ms) between UTC and `tz` at the instant `date`.
  function tzOffset(date, tz) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var p = {};
    dtf.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    var asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour === '24' ? 0 : p.hour, p.minute, p.second);
    return asUTC - date.getTime();
  }

  // Epoch (ms) for a wall-clock time expressed in `tz`. Two-pass to settle DST.
  function zonedToEpoch(y, mo, d, h, mi, tz) {
    var guess = Date.UTC(y, mo - 1, d, h, mi, 0);
    var off = tzOffset(new Date(guess), tz);
    var epoch = guess - off;
    off = tzOffset(new Date(epoch), tz);
    return guess - off;
  }

  function parseTarget(str, tz) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec((str || '').trim());
    if (!m) return NaN;
    return zonedToEpoch(+m[1], +m[2], +m[3], +m[4], +m[5], tz);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function initOne(root) {
    var tz = root.getAttribute('data-tz') || 'Europe/Vilnius';
    var target = parseTarget(root.getAttribute('data-end'), tz);
    if (isNaN(target)) return;

    var units = root.querySelector('[data-cd-units]');
    var ended = root.querySelector('[data-cd-ended]');
    var elDays = root.querySelector('[data-cd="days"]');
    var elHours = root.querySelector('[data-cd="hours"]');
    var elMins = root.querySelector('[data-cd="minutes"]');
    var elSecs = root.querySelector('[data-cd="seconds"]');
    var timer = null;

    function finish() {
      if (elDays) elDays.textContent = '00';
      if (elHours) elHours.textContent = '00';
      if (elMins) elMins.textContent = '00';
      if (elSecs) elSecs.textContent = '00';
      if (ended) {
        if (units) units.hidden = true;
        ended.hidden = false;
      }
      if (timer) { clearInterval(timer); timer = null; }
    }

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) { finish(); return; }
      var s = Math.floor(diff / 1000);
      var days = Math.floor(s / 86400);
      var hours = Math.floor((s % 86400) / 3600);
      var mins = Math.floor((s % 3600) / 60);
      var secs = s % 60;
      if (elDays) elDays.textContent = pad(days);
      if (elHours) elHours.textContent = pad(hours);
      if (elMins) elMins.textContent = pad(mins);
      if (elSecs) elSecs.textContent = pad(secs);
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  function init() {
    document.querySelectorAll('[data-countdown]').forEach(initOne);
  }

  // Exposed for verification.
  window.theme = window.theme || {};
  window.theme.countdownTarget = parseTarget;

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
