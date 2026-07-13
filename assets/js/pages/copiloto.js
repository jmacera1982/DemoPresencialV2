
    (function () {
      /* El panel interno necesita columna flex + min-height 0 para que el área de mensajes
         use el alto y el input no quede “flotando” con hueco arriba. Solo :host, sin tocar hijos con flex global. */
      var CSS_HOST =
        ':host { display: flex !important; flex-direction: column !important; width: 100% !important; height: 100% !important; min-height: 0 !important; box-sizing: border-box !important; }';

      function injectHost(el) {
        if (!el || !el.shadowRoot) return false;
        if (el.shadowRoot.querySelector('style[data-jb-responsive-host]')) return true;
        var s = document.createElement('style');
        s.setAttribute('data-jb-responsive-host', '');
        s.textContent = CSS_HOST;
        el.shadowRoot.appendChild(s);
        return true;
      }

      function tryPatch() {
        return injectHost(document.getElementById('jbChat'));
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryPatch);
      } else {
        tryPatch();
      }
      window.addEventListener('load', function () {
        tryPatch();
        setTimeout(tryPatch, 400);
        setTimeout(tryPatch, 2000);
      });
      var mo = new MutationObserver(tryPatch);
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () {
        mo.disconnect();
      }, 12000);
      window.addEventListener('resize', tryPatch);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', tryPatch);
      }
    })();
