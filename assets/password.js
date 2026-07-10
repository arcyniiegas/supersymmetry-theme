(function(){
  // Countdown to the real launch date from the section's "Launch date & time"
  // setting (data-target, e.g. "2026-08-01T10:00"). The block is only rendered
  // when a date is set; an unparsable or past date hides it entirely — the
  // countdown never fakes urgency.
  var count = document.getElementById('count');
  if (!count) return;
  var target = Date.parse(count.getAttribute('data-target') || '');
  if (isNaN(target) || target <= Date.now()) { count.style.display = 'none'; return; }

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function tick(){
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff/1000);
    var d = Math.floor(s/86400); s -= d*86400;
    var h = Math.floor(s/3600);  s -= h*3600;
    var m = Math.floor(s/60);    s -= m*60;
    document.getElementById('cd').textContent = pad(d);
    document.getElementById('ch').textContent = pad(h);
    document.getElementById('cm').textContent = pad(m);
    document.getElementById('cs').textContent = pad(s);
    if (diff === 0) clearInterval(timer);
  }
  tick(); var timer = setInterval(tick, 1000);
})();
