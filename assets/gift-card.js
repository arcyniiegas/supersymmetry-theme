(function(){
  // pseudo QR (squares only) — deterministic pattern
  var qr = document.getElementById('qr');
  var pattern = [
    1,1,1,0,1,0,1,
    1,0,1,0,0,1,1,
    1,1,0,1,1,0,1,
    0,0,1,1,0,1,0,
    1,1,0,1,1,1,0,
    0,1,1,0,0,0,1,
    1,0,1,1,0,1,1
  ];
  pattern.forEach(function(v){
    var i = document.createElement('i');
    if (v) i.className = 'on';
    qr.appendChild(i);
  });

  // copy code
  var btn = document.getElementById('copy');
  var code = document.getElementById('code').textContent;
  btn.addEventListener('click', function(){
    var done = function(){
      btn.textContent = 'Nukopijuota ✓';
      btn.classList.add('is-done');
      setTimeout(function(){ btn.textContent = 'Kopijuoti kodą'; btn.classList.remove('is-done'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(done).catch(done);
    } else { done(); }
  });
})();
