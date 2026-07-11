/* Mega menu · sections/header.liquid + component-mega-menu.css
   Opens the Shop panel on hover/focus/click; closes on leave, Esc, outside
   click, or navigation. Progressive enhancement — with JS off the panel simply
   never opens and the nav links still work. */
(function () {
  var trigger = document.querySelector('[data-mega-toggle]');
  var panel = document.querySelector('[data-mega-panel]');
  if (!trigger || !panel) return;
  var shell = trigger.closest('.header-shell');
  if (!shell) return;

  var closeTimer;

  function open() {
    clearTimeout(closeTimer);
    shell.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    clearTimeout(closeTimer);
    shell.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  function isOpen() { return shell.classList.contains('is-open'); }
  // Delayed close so the pointer can cross the gap between card and panel
  // without the menu snapping shut; re-entering trigger or panel cancels it.
  function scheduleClose() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 140); }

  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('focus', open);
  panel.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseleave', scheduleClose);

  // Click toggles — the primary path for touch + keyboard.
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    isOpen() ? close() : open();
  });

  // Navigating away via a panel link closes the menu.
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  // Esc closes and returns focus to the trigger.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { close(); trigger.focus(); }
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
