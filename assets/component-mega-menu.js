/* Mega menu · sections/header.liquid + component-mega-menu.css
   Menu-driven: every top-level menu item with children is a nav trigger
   (data-mega-toggle="N"); the shared panel holds one group per parent
   (data-mega-group="N"). Hover/focus a trigger to open the panel and reveal
   its group; leave/Esc/outside-click/navigation closes. Progressive
   enhancement — with JS off the panel stays hidden and the triggers are inert. */
(function () {
  var panel = document.querySelector('[data-mega-panel]');
  var triggers = [].slice.call(document.querySelectorAll('[data-mega-toggle]'));
  if (!panel || !triggers.length) return;
  var shell = panel.closest('.header-shell');
  if (!shell) return;

  var groups = {};
  [].slice.call(panel.querySelectorAll('[data-mega-group]')).forEach(function (g) {
    groups[g.getAttribute('data-mega-group')] = g;
  });

  var closeTimer, current = null;

  function reveal(id) {
    for (var key in groups) groups[key].classList.toggle('is-active', key === id);
  }
  function open(trigger) {
    clearTimeout(closeTimer);
    reveal(trigger.getAttribute('data-mega-toggle'));
    shell.classList.add('is-open');
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', t === trigger ? 'true' : 'false'); });
    current = trigger;
  }
  function close() {
    clearTimeout(closeTimer);
    shell.classList.remove('is-open');
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    current = null;
  }
  function isOpen() { return shell.classList.contains('is-open'); }
  // Delayed close so the pointer can cross the gap between card and panel
  // without the menu snapping shut; re-entering a trigger or the panel cancels it.
  function scheduleClose() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 140); }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('mouseenter', function () { open(trigger); });
    trigger.addEventListener('focus', function () { open(trigger); });
    trigger.addEventListener('mouseleave', scheduleClose);
    // Click toggles — the primary path for touch + keyboard.
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      (isOpen() && current === trigger) ? close() : open(trigger);
    });
  });

  panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
  panel.addEventListener('mouseleave', scheduleClose);
  // Navigating away via a panel link closes the menu.
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });

  // Esc closes and returns focus to the active trigger.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { var t = current; close(); if (t) t.focus(); }
  });
  // Click outside closes.
  document.addEventListener('click', function (e) {
    if (isOpen() && !shell.contains(e.target)) close();
  });
  // Keyboard: tabbing out of the header shell closes.
  shell.addEventListener('focusout', function (e) {
    if (!shell.contains(e.relatedTarget)) scheduleClose();
  });
})();
