(function () {
  function bindActions(actionMap, root) {
    (root || document).addEventListener('click', function (event) {
      var actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      if (root && root !== document && !root.contains(actionEl)) return;

      var actionName = actionEl.getAttribute('data-action');
      var handler = actionMap[actionName];
      if (typeof handler === 'function') {
        handler.call(actionEl, event, actionEl);
      }
    });
  }

  function requireAuthIfNeeded() {
    if (
      document.body &&
      document.body.dataset.requireAuth === 'true' &&
      window.AuthPortal &&
      typeof window.AuthPortal.require === 'function'
    ) {
      window.AuthPortal.require();
    }
  }

  window.AppMobileSaludShared = {
    bindActions: bindActions,
    requireAuthIfNeeded: requireAuthIfNeeded
  };

  requireAuthIfNeeded();
})();
