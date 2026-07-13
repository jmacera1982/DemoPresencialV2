(function () {
  'use strict';

  function applyChatConfig(chat, config) {
    if (!chat || !config) {
      return;
    }

    if (config.host_url) {
      chat.setAttribute('host_url', config.host_url);
    }
    if (config.flow_id) {
      chat.setAttribute('flow_id', config.flow_id);
    }
    if (config.api_key) {
      chat.setAttribute('api_key', config.api_key);
    }
  }

  async function bootstrapChatWidgets() {
    var widgets = document.querySelectorAll('journey-builder-chat[data-journey-proxy="true"]');
    if (!widgets.length) {
      return;
    }

    var tasks = Array.prototype.map.call(widgets, async function (chat) {
      var flowKey = chat.getAttribute('data-flow-key');
      if (!flowKey) {
        return;
      }

      try {
        var response = await NumiaApiClient.apiFetch(
          '/api/journey/chat-config?flowKey=' + encodeURIComponent(flowKey)
        );
        if (!response.ok) {
          console.error('[journey-chat] No se pudo cargar configuración para flow', flowKey);
          return;
        }

        var config = await response.json();
        applyChatConfig(chat, config);
      } catch (error) {
        console.error('[journey-chat]', error);
      }
    });

    await Promise.all(tasks);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapChatWidgets, { once: true });
  } else {
    bootstrapChatWidgets();
  }
})();
