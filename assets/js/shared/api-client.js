(function (global) {
  'use strict';

  var SAFE_PROXY_PATH_RE = /^[A-Za-z0-9_\-./?=&%]+$/;

  function sanitizeProxyPath(path) {
    var clean = String(path || '').replace(/\\/g, '/').replace(/^\/+/, '');

    if (!clean || clean.indexOf('..') !== -1 || clean.indexOf('\0') !== -1) {
      throw new Error('Ruta de API inválida');
    }

    if (!SAFE_PROXY_PATH_RE.test(clean)) {
      throw new Error('Ruta de API inválida');
    }

    return clean;
  }

  function getApiHeaders(extra) {
    return Object.assign({ 'Content-Type': 'application/json' }, extra || {});
  }

  async function apiFetch(url, options) {
    var init = Object.assign(
      {
        credentials: 'same-origin'
      },
      options || {}
    );

    init.headers = getApiHeaders(init.headers);
    var response = await fetch(url, init);

    if (response.status === 401 && global.AuthPortal && typeof global.AuthPortal.logout === 'function') {
      global.AuthPortal.logout();
      if (typeof global.AuthPortal.require === 'function') {
        global.AuthPortal.require();
      }
    }

    return response;
  }

  async function parseJsonResponse(response) {
    var data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      var message = (data && (data.error || data.message)) || ('Error en servidor (' + response.status + ')');
      throw new Error(message);
    }

    return data;
  }

  global.NumiaApiClient = {
    sanitizeProxyPath: sanitizeProxyPath,
    getApiHeaders: getApiHeaders,
    apiFetch: apiFetch,
    parseJsonResponse: parseJsonResponse
  };
})(typeof window !== 'undefined' ? window : globalThis);
