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

  function isValidFlowKey(flowKey) {
    return typeof flowKey === 'string' && FLOW_KEY_RE.test(flowKey) && Boolean(flows[flowKey]);
  }

  function resolveFlowId(flowKey) {
    if (!isValidFlowKey(flowKey)) {
      return null;
    }

    return flows[flowKey];
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
