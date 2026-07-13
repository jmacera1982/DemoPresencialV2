
    (function () {
      var views = ['view-onb', 'view-docs', 'view-act', 'view-perfil'];
      var fabQr = document.querySelector('.fab-qr');
      var fabNueva = document.querySelector('.fab-nueva');
      var appFrame = document.getElementById('app-frame');

      function show(id) {
        views.forEach(function (v) {
          var el = document.getElementById(v);
          if (el) el.classList.toggle('active', v === id);
        });
        document.querySelectorAll('.bottom-nav button[data-view]').forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-view') === id);
        });
        if (fabQr) fabQr.style.display = id === 'view-docs' ? 'flex' : 'none';
        if (fabNueva) fabNueva.style.display = id === 'view-act' ? 'flex' : 'none';
        if (appFrame) appFrame.classList.toggle('is-onb', id === 'view-onb');
      }

      document.querySelectorAll('.bottom-nav button[data-view]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          show(btn.getAttribute('data-view'));
        });
      });

      var skip = document.getElementById('onb-skip');
      if (skip) {
        skip.addEventListener('click', function (e) {
          e.preventDefault();
          show('view-docs');
        });
      }

      show('view-onb');
    })();
