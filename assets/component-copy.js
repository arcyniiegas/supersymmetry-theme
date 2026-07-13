/* Copy-to-clipboard · [data-copy] buttons (returns recipient block).
   Copies the button's data-copy value, then confirms inline for ~1.8s.
   Progressive enhancement: without the Clipboard API the value stays visible
   and selectable, and the button is hidden so it never looks broken. */
(function () {
  var btns = document.querySelectorAll('[data-copy]');
  if (!btns.length) return;
  var can = !!(navigator.clipboard && navigator.clipboard.writeText);

  btns.forEach(function (btn) {
    if (!can) { btn.hidden = true; return; }
    var label = btn.querySelector('[data-copy-label]') || btn;
    var idle = btn.getAttribute('data-copy-idle') || label.textContent;
    var done = btn.getAttribute('data-copy-done') || 'Copied';
    var timer;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        btn.classList.add('is-copied');
        label.textContent = done;
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-copied');
          label.textContent = idle;
        }, 1800);
      }).catch(function () {});
    });
  });
})();
