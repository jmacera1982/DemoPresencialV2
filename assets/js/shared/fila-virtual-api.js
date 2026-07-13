(function (global) {
  'use strict';

  var FV_BASE = '/api/fila-virtual';
  var CITAS_BASE = '/api/citas/raw';

  function buildProfileQuery(profile) {
    if (!profile || profile === 'default') {
      return '';
    }

    return '?profile=' + encodeURIComponent(profile);
  }

  async function enqueue(queueId, branchId, payload) {
    var response = await NumiaApiClient.apiFetch(FV_BASE + '/enqueue', {
      method: 'POST',
      body: JSON.stringify({
        queueId: String(queueId),
        branchId: String(branchId),
        payload: payload || {}
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  async function getTurnByCode(turnCode, options) {
    var profile = options && options.profile === 'turn' ? '?profile=turn' : '';
    var response = await NumiaApiClient.apiFetch(
      FV_BASE + '/turn/code/' + encodeURIComponent(turnCode) + profile
    );
    return NumiaApiClient.parseJsonResponse(response);
  }

  async function fvRequest(path, options) {
    var method = (options && options.method) || 'GET';
    var profile = options && options.profile === 'turn' ? '?profile=turn' : '';
    var cleanPath = NumiaApiClient.sanitizeProxyPath(path);
    var init = {
      method: method,
      headers: { 'Content-Type': (options && options.contentType) || 'application/json' }
    };

    if (options && options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    var response = await NumiaApiClient.apiFetch(FV_BASE + '/raw/' + cleanPath + profile, init);
    return NumiaApiClient.parseJsonResponse(response);
  }

  async function citasRequest(path, options) {
    var method = (options && options.method) || 'GET';
    var profile = (options && options.profile) || 'default';
    var cleanPath = NumiaApiClient.sanitizeProxyPath(path);
    var init = {
      method: method,
      headers: { 'Content-Type': (options && options.contentType) || 'application/json' }
    };

    if (options && options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    var response = await NumiaApiClient.apiFetch(CITAS_BASE + '/' + cleanPath + buildProfileQuery(profile), init);
    return NumiaApiClient.parseJsonResponse(response);
  }

  async function enqueueByAlias(alias, queueId, branchId, mode) {
    var response = await NumiaApiClient.apiFetch('/api/demo/fv-enqueue-alias', {
      method: 'POST',
      body: JSON.stringify({
        alias: alias || 'Jorge',
        queueId: String(queueId),
        branchId: String(branchId),
        mode: mode || 'full'
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  async function portalEnqueue(personaId, queueId, branchId) {
    var response = await NumiaApiClient.apiFetch('/api/demo/portal-enqueue', {
      method: 'POST',
      body: JSON.stringify({
        personaId: personaId,
        queueId: String(queueId),
        branchId: String(branchId)
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  async function fetchPortalPersonas() {
    var response = await NumiaApiClient.apiFetch('/api/demo/portal-personas');
    return NumiaApiClient.parseJsonResponse(response);
  }

  global.FilaVirtualApi = {
    enqueue: enqueue,
    getTurnByCode: getTurnByCode,
    fvRequest: fvRequest,
    citasRequest: citasRequest,
    enqueueByAlias: enqueueByAlias,
    portalEnqueue: portalEnqueue,
    fetchPortalPersonas: fetchPortalPersonas,
    buildQueuePath: function (queueId, branchId) {
      return 'queue/' + queueId + '/branch/' + branchId + '/enqueue';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
