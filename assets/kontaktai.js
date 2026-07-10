document.querySelectorAll('.topic').forEach(function(t){
  t.addEventListener('click', function(){
    document.querySelectorAll('.topic').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
    t.setAttribute('aria-pressed','true');
    var tp = document.getElementById('c-topic');
    if (tp) { tp.value = t.textContent; }
  });
});
var msg = document.getElementById('c-msg');
var cc = document.getElementById('cc');
msg.addEventListener('input', function(){ cc.textContent = msg.value.length; });
