'use strict';

const FLOW_KEY_RE = /^[A-Z][A-Z0-9_]{0,63}$/;
const CHAT_KEY_RE = /^[A-Z][A-Z0-9_]{0,63}$/;

function createJourneyFlows(config) {
  const flows = {
    APP_CLIENTE: config.flowAppCliente || '',
    TOTEM_BANKING: config.flowTotemBanking || '',
    SALUD: config.flowSalud || '',
    BBVA: config.flowBbva || '',
    COLSANITAS: config.flowColsanitas || ''
  };

  const embedChats = {
    DEFAULT: config.embedChatId || ''
  };

  function isKnownFlowKey(flowKey) {
    return typeof flowKey === 'string' && FLOW_KEY_RE.test(flowKey) && Object.prototype.hasOwnProperty.call(flows, flowKey);
  }

  function isValidFlowKey(flowKey) {
    return isKnownFlowKey(flowKey) && Boolean(flows[flowKey]);
  }

  function resolveFlowId(flowKey) {
    if (!isKnownFlowKey(flowKey)) {
      return null;
    }

    return flows[flowKey] || null;
  }

  function listFlowKeys() {
    return Object.keys(flows).filter(function (key) {
      return Boolean(flows[key]);
    });
  }

  function resolveEmbedChatId(chatKey) {
    const key = chatKey || 'DEFAULT';
    if (!CHAT_KEY_RE.test(key)) {
      return null;
    }

    return embedChats[key] || null;
  }

  return {
    FLOW_KEY_RE: FLOW_KEY_RE,
    isKnownFlowKey: isKnownFlowKey,
    isValidFlowKey: isValidFlowKey,
    resolveFlowId: resolveFlowId,
    listFlowKeys: listFlowKeys,
    resolveEmbedChatId: resolveEmbedChatId
  };
}

module.exports = {
  createJourneyFlows: createJourneyFlows,
  FLOW_KEY_RE: FLOW_KEY_RE
};
