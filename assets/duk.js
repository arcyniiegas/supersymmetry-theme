
/* rail scroll-spy */
const railLinks = document.querySelectorAll('.rail a[href^="#"]');
const groups = [...document.querySelectorAll('.group')];
railLinks.forEach(l => l.addEventListener('click', () => {
  railLinks.forEach(x => x.removeAttribute('aria-current'));
  l.setAttribute('aria-current','true');
}));
const railFor = id => document.querySelector(`.rail a[href="#${id}"]`);
const spy = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting){
      railLinks.forEach(x => x.removeAttribute('aria-current'));
      const l = railFor(e.target.id);
      if (l) l.setAttribute('aria-current','true');
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });
groups.forEach(g => spy.observe(g));

/* live search filter */
const q = document.getElementById('faq-q') || { addEventListener: function(){}, value: '', focus: function(){} };
const stat = document.getElementById('faq-stat');
const noresults = document.getElementById('noresults');
const nrTerm = document.getElementById('nr-term');
const allQA = [...document.querySelectorAll('.qa')];
const totalQ = allQA.length;

q.addEventListener('input', () => {
  const term = q.value.trim().toLowerCase();
  if (!term){
    allQA.forEach(d => d.style.display = '');
    groups.forEach(g => g.style.display = '');
    noresults.classList.remove('show');
    stat.textContent = `${totalQ} klausimai · 6 kategorijos`;
    return;
  }
  let shown = 0;
  groups.forEach(g => {
    let groupHas = false;
    g.querySelectorAll('.qa').forEach(d => {
      const txt = d.textContent.toLowerCase();
      const match = txt.includes(term);
      d.style.display = match ? '' : 'none';
      if (match){ d.open = true; groupHas = true; shown++; }
    });
    g.style.display = groupHas ? '' : 'none';
  });
  if (shown === 0){
    noresults.classList.add('show');
    nrTerm.textContent = `„${q.value.trim()}“`;
    stat.textContent = `0 rezultatų pagal „${q.value.trim()}“`;
  } else {
    noresults.classList.remove('show');
    stat.textContent = `${shown} ${shown === 1 ? 'rezultatas' : 'rezultatai'} pagal „${q.value.trim()}“`;
  }
});

/* cmd-K focus */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
    e.preventDefault();
    q.focus();
  }
});
