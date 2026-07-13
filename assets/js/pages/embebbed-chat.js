(function () {
  'use strict';

  var frame = document.getElementById('jbChatFrame');
  if (!frame) {
    return;
  }

  function applyFrameSize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    frame.setAttribute('width', String(w));
    frame.setAttribute('height', String(h));
    frame.style.width = w + 'px';
    frame.style.height = h + 'px';
    frame.style.position = 'fixed';
    frame.style.top = '0';
    frame.style.left = '0';
  }

  async function loadEmbedUrl() {
    try {
      var response = await NumiaApiClient.apiFetch('/api/journey/embed-url?chatKey=DEFAULT');
      if (!response.ok) {
        console.error('[embebbed-chat] No se pudo obtener URL del chat');
        return;
      }

      var payload = await response.json();
      if (payload && payload.url) {
        frame.src = payload.url;
      }
    } catch (error) {
      console.error('[embebbed-chat]', error);
    }
  }

  applyFrameSize();
  loadEmbedUrl();

  window.addEventListener('resize', applyFrameSize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applyFrameSize);
  }
})();
