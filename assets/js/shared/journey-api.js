(function (global) {
  'use strict';

  var API_BASE = '/api';

  async function runJourney(flowKey, payload, options) {
    var response = await NumiaApiClient.apiFetch(API_BASE + '/journey/run', {
      method: 'POST',
      body: JSON.stringify({
        flowKey: flowKey,
        stream: Boolean(options && options.stream),
        payload: payload || {}
      })
    });

    return NumiaApiClient.parseJsonResponse(response);
  }

  function extractMessageText(data) {
    if (!data || !data.outputs || !data.outputs[0] || !data.outputs[0].outputs || !data.outputs[0].outputs[0]) {
      return null;
    }

    var innerOutput = data.outputs[0].outputs[0];

    if (innerOutput.artifacts && innerOutput.artifacts.message) {
      if (typeof innerOutput.artifacts.message === 'string') {
        return innerOutput.artifacts.message;
      }
      return innerOutput.artifacts.message.message || JSON.stringify(innerOutput.artifacts.message);
    }

    if (innerOutput.outputs && innerOutput.outputs.message && innerOutput.outputs.message.message) {
      return innerOutput.outputs.message.message;
    }

    if (innerOutput.results && innerOutput.results.message && innerOutput.results.message.text) {
      return innerOutput.results.message.text;
    }

    return null;
  }

  global.NumiaJourneyApi = {
    runJourney: runJourney,
    extractMessageText: extractMessageText,
    FLOWS: {
      APP_CLIENTE: 'APP_CLIENTE',
      TOTEM_BANKING: 'TOTEM_BANKING',
      SALUD: 'SALUD',
      BBVA: 'BBVA',
      COLSANITAS: 'COLSANITAS'
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
