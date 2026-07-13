(function () {
  function requireAuthPortal() {
    if (window.AuthPortal && typeof window.AuthPortal.require === 'function') {
      window.AuthPortal.require();
    }
  }

  function bindNoopLinks(root) {
    root.querySelectorAll('[data-app-cliente-noop]').forEach(function (link) {
      if (link.dataset.appClienteBound === '1') return;
      link.dataset.appClienteBound = '1';
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
    });
  }

  function initImageFallbacks(root) {
    root.querySelectorAll('[data-app-cliente-fallback]').forEach(function (img) {
      if (img.dataset.appClienteFallbackBound === '1') return;
      img.dataset.appClienteFallbackBound = '1';
      img.addEventListener('error', function () {
        img.classList.add('ac-hidden');
        var selector = img.getAttribute('data-app-cliente-fallback');
        var fallback = selector ? document.querySelector(selector) : img.nextElementSibling;
        if (!fallback) return;
        fallback.classList.remove('ac-hidden');
        fallback.classList.add('ac-flex');
      });
      if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }

  function init() {
    bindNoopLinks(document);
    initImageFallbacks(document);
    if (document.body && document.body.dataset.appClienteAuth === 'required') {
      requireAuthPortal();
    }
  }

  window.appClienteBase = {
    requireAuthPortal: requireAuthPortal,
    bindNoopLinks: bindNoopLinks,
    initImageFallbacks: initImageFallbacks,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
