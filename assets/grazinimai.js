
/* Subnav scroll-spy + smooth click */
const chips = document.querySelectorAll('.subnav__chip[href^="#"]');
chips.forEach(c => {
  c.addEventListener('click', () => {
    chips.forEach(x => x.removeAttribute('aria-current'));
    c.setAttribute('aria-current', 'true');
  });
});

const sections = ['#eiga','#kas-tinka','#keitimas','#duk']
  .map(s => document.querySelector(s)).filter(Boolean);
const linkFor = id => document.querySelector(`.subnav__chip[href="#${id}"]`);

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){
      chips.forEach(x => x.removeAttribute('aria-current'));
      const l = linkFor(e.target.id);
      if (l) l.setAttribute('aria-current','true');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
sections.forEach(s => io.observe(s));
