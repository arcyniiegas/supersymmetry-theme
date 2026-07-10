/* ── virtual try-on ── */
(function () {
  var overlay = document.getElementById('tryon');
  var openBtn = document.getElementById('tryonOpen');
  var closeBtn = document.getElementById('tryonClose');
  var drop = document.getElementById('tryonDrop');
  var file = document.getElementById('tryonFile');
  var result = document.getElementById('tryonResult');
  var empty = document.getElementById('tryonEmpty');
  var goBtn = document.getElementById('tryonGo');
  var resetBtn = document.getElementById('tryonReset');
  var userImg = null;

  function open() { overlay.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function close() { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  function setPhoto(f) {
    if (!f || !f.type || f.type.indexOf('image/') !== 0) return;
    var url = URL.createObjectURL(f);
    var img = new Image();
    img.onload = function () {
      userImg = img;
      var prev = drop.querySelector('img.preview');
      if (prev) prev.remove();
      var el = document.createElement('img');
      el.src = url; el.className = 'preview'; el.alt = '';
      drop.appendChild(el);
      drop.classList.add('has-img');
      goBtn.disabled = false;
      resetBtn.disabled = false;
    };
    img.src = url;
  }
  file.addEventListener('change', function () { setPhoto(file.files[0]); });
  ['dragover', 'dragenter'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-drag'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setPhoto(e.dataTransfer.files[0]);
  });

  resetBtn.addEventListener('click', function () {
    userImg = null;
    var prev = drop.querySelector('img.preview');
    if (prev) prev.remove();
    drop.classList.remove('has-img');
    file.value = '';
    goBtn.disabled = true;
    resetBtn.disabled = true;
    var c = result.querySelector('canvas');
    if (c) c.remove();
    result.classList.remove('has-result');
    empty.style.display = '';
  });

  goBtn.addEventListener('click', function () {
    if (!userImg || result.classList.contains('is-busy')) return;
    result.classList.add('is-busy');
    empty.textContent = 'Generuojama…';
    goBtn.disabled = true;

    var shoe = new Image();
    shoe.crossOrigin = 'anonymous';
    shoe.onload = function () {
      /* demo composite: user photo + product blended at the lower third */
      setTimeout(function () {
        var W = 900, H = 1125;
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        /* cover-fit user photo */
        var s = Math.max(W / userImg.width, H / userImg.height);
        var dw = userImg.width * s, dh = userImg.height * s;
        ctx.drawImage(userImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
        /* product, multiply-blended near the bottom */
        var sw = W * 0.52;
        var sh = sw * (shoe.height / shoe.width);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(shoe, (W - sw) / 2, H - sh - H * 0.06, sw, sh);
        ctx.globalCompositeOperation = 'source-over';
        var old = result.querySelector('canvas');
        if (old) old.remove();
        result.appendChild(c);
        result.classList.remove('is-busy');
        result.classList.add('has-result');
        empty.style.display = 'none';
        goBtn.disabled = false;
      }, 2200);
    };
    /* source image = the product's featured image, injected on the open button */
    shoe.src = (openBtn && openBtn.getAttribute('data-tryon-src')) || '';
  });
})();
