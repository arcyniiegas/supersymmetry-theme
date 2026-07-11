/* Rail scroll-spy is the shared <scroll-spy> Custom Element
   (component-scroll-spy.js); this file only owns the live search filter. */

/* live search filter */
const groups = [...document.querySelectorAll('.group')];
const q = document.getElementById('faq-q') || { addEventListener: function(){}, value: '', focus: function(){} };
const stat = document.getElementById('faq-stat');
const noresults = document.getElementById('noresults');
const nrTerm = document.getElementById('nr-term');
const allQA = [...document.querySelectorAll('.accordion, .qa')];
const totalQ = allQA.length;

q.addEventListener('input', () => {
  const term = q.value.trim().toLowerCase();
  if (!term){
    allQA.forEach(d => d.style.display = '');
    groups.forEach(g => g.style.display = '');
    noresults.classList.remove('show');
    stat.textContent = theme.t('faq.summary', { count: totalQ, groups: groups.length });
    return;
  }
  let shown = 0;
  groups.forEach(g => {
    let groupHas = false;
    g.querySelectorAll('.accordion, .qa').forEach(d => {
      const txt = d.textContent.toLowerCase();
      const match = txt.includes(term);
      d.style.display = match ? '' : 'none';
      if (match){ d.open = true; groupHas = true; shown++; }
    });
    g.style.display = groupHas ? '' : 'none';
  });
  if (shown === 0){
    noresults.classList.add('show');
    nrTerm.textContent = theme.t('faq.quoted_term', { term: q.value.trim() });
    stat.textContent = theme.t('faq.no_results', { term: q.value.trim() });
  } else {
    noresults.classList.remove('show');
    const word = theme.t(shown === 1 ? 'faq.result_one' : 'faq.result_other');
    stat.textContent = theme.t('faq.results', { count: shown, word: word, term: q.value.trim() });
  }
});

/* cmd-K focus */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
    e.preventDefault();
    q.focus();
  }
});
