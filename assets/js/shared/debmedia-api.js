(function (global) {
  'use strict';

  var CITAS_BASE = '/api/citas/raw';
  var NOCO_BASE = '/api/nocodb/raw';
  var DEBSIGN_BASE = '/api/debsign/raw';
  var MONITOR_BASE = '/api/monitor/raw';

  function buildProfileQuery(profile) {
    if (!profile || profile === 'default') {
      return '';
    }

    return '?profile=' + encodeURIComponent(profile);
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

  async function nocoRequest(path, options) {
    var method = (options && options.method) || 'GET';
    var cleanPath = NumiaApiClient.sanitizeProxyPath(path);
    var init = {
      method: method,
      headers: { 'Content-Type': (options && options.contentType) || 'application/json' }
    };

    if (options && options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    var response = await NumiaApiClient.apiFetch(NOCO_BASE + '/' + cleanPath, init);
    return NumiaApiClient.parseJsonResponse(response);
  }

  async function debsignRequest(path, options) {
    var method = (options && options.method) || 'GET';
    var cleanPath = NumiaApiClient.sanitizeProxyPath(path);
    var init = {
      method: method,
      headers: { 'Content-Type': (options && options.contentType) || 'application/json' }
    };

    if (options && options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    var response = await NumiaApiClient.apiFetch(DEBSIGN_BASE + '/' + cleanPath, init);
    return NumiaApiClient.parseJsonResponse(response);
  }

  async function monitorRequest(path, options) {
    var method = (options && options.method) || 'GET';
    var cleanPath = NumiaApiClient.sanitizeProxyPath(path);
    var init = {
      method: method,
      headers: { 'Content-Type': (options && options.contentType) || 'application/json' }
    };

    if (options && options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    var response = await NumiaApiClient.apiFetch(MONITOR_BASE + '/' + cleanPath, init);
    return NumiaApiClient.parseJsonResponse(response);
  }

  global.DebmediaApi = {
    citasRequest: citasRequest,
    nocoRequest: nocoRequest,
    debsignRequest: debsignRequest,
    monitorRequest: monitorRequest,
    debsignConfigPath: '/api/debsign/config'
  };

  if (global.FilaVirtualApi) {
    global.FilaVirtualApi.citasRequest = citasRequest;
  }
})(typeof window !== 'undefined' ? window : globalThis);
