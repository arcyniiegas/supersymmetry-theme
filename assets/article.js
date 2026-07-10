(function(){
  var bar = document.getElementById('progress');
  var article = document.querySelector('.article');
  function update(){
    var rect = article.getBoundingClientRect();
    var total = article.offsetHeight - window.innerHeight;
    var scrolled = Math.min(Math.max(-rect.top, 0), total);
    var pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
