(function (global) {
  'use strict';

  var API_BASE = '/api/demo';

  var BANKING_ALIASES = [
    'Jorge', 'Joaquin', 'Gustavo', 'Martin', 'Alberto',
    'Juanma S', 'Juanma L', 'Nico', 'Natalia', 'Aldo',
    'Eduardo', 'Manuel', 'Juanca', 'Romy', 'demo'
  ];

  var SALUD_ALIASES = [
    'Maria', 'Jorge', 'Joaquin', 'Gustavo', 'Martin',
    'Juanma S', 'Juanma L', 'Nico', 'Natalia', 'Aldo',
    'Eduardo', 'Manuel', 'Juanca', 'demo'
  ];

  function getSelectedAlias(selectorId) {
    var selector = document.getElementById(selectorId || 'nombreSelector');
    if (selector && selector.value) {
      return selector.value;
    }

    var userSelector = document.getElementById('userSelector');
    if (userSelector && userSelector.value) {
      return userSelector.value;
    }

    return 'Jorge';
  }

  async function fetchEnqueueBody(alias, extraFields) {
    var response = await NumiaApiClient.apiFetch(API_BASE + '/enqueue-body', {
      method: 'POST',
      body: JSON.stringify({
        alias: alias,
        extraFields: extraFields || []
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  async function fetchSaludContact(alias) {
    var response = await NumiaApiClient.apiFetch(API_BASE + '/salud-contact', {
      method: 'POST',
      body: JSON.stringify({ alias: alias })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  async function resolveDisplayName(alias, domain) {
    var response = await NumiaApiClient.apiFetch(API_BASE + '/resolve', {
      method: 'POST',
      body: JSON.stringify({
        alias: alias,
        domain: domain || 'banking'
      })
    });

    var data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      return alias;
    }

    return data.displayName || alias;
  }

  async function enqueueFilaVirtual(queueId, branchId, payload) {
    var response = await NumiaApiClient.apiFetch('/api/fila-virtual/enqueue', {
      method: 'POST',
      body: JSON.stringify({
        queueId: queueId,
        branchId: branchId,
        payload: payload
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  global.NumiaDemoUsers = {
    BANKING_ALIASES: BANKING_ALIASES,
    SALUD_ALIASES: SALUD_ALIASES,
    getSelectedAlias: getSelectedAlias,
    fetchEnqueueBody: fetchEnqueueBody,
    fetchSaludContact: fetchSaludContact,
    resolveDisplayName: resolveDisplayName,
    enqueueFilaVirtual: enqueueFilaVirtual
  };
})(typeof window !== 'undefined' ? window : globalThis);
