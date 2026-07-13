(function () {
  'use strict';

  if (!window.AuthPortal || typeof window.AuthPortal.require !== 'function') {
    return;
  }

  if (!window.AuthPortal.isAuthenticated()) {
    window.AuthPortal.require();
    return;
  }

  document.documentElement.classList.add('portal-authenticated');
})();
