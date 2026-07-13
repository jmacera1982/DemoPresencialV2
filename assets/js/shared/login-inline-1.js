(function () {
  var params = new URLSearchParams(window.location.search);
  var nextRaw = params.get('next');
  var nextUrl = AuthPortal.safeNextUrl(nextRaw || 'index.html');

  document.getElementById('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var pwd = (document.getElementById('pwd').value || '').trim();
    var err = document.getElementById('err');
    var btn = document.getElementById('btnSubmit');
    err.classList.add('d-none');
    btn.disabled = true;

    AuthPortal.login(pwd).then(function (ok) {
      if (ok) {
        // nextUrl ya filtrado por AuthPortal.safeNextUrl (solo same-origin).
        // nosemgrep: javascript.browser.security.open-redirect.js-open-redirect
        window.location.replace(nextUrl);
        return;
      }

      err.textContent = 'Contraseña incorrecta o proxy no disponible.';
      err.classList.remove('d-none');
      btn.disabled = false;
    });
  });
})();
