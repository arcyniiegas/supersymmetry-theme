
/* subnav scroll-spy */
(function () {
  var chips = Array.prototype.slice.call(document.querySelectorAll('.subnav__chip'));
  var map = {};
  chips.forEach(function (c) { map[c.getAttribute('href').slice(1)] = c; });
  var sections = chips.map(function (c) { return document.getElementById(c.getAttribute('href').slice(1)); });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        chips.forEach(function (c) { c.setAttribute('aria-current', 'false'); });
        if (map[e.target.id]) map[e.target.id].setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(function (s) { if (s) obs.observe(s); });
}());
