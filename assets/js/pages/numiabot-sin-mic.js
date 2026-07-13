
    const NUMIABOT_URL = 'https://filavirtual.preprod.debmedia.com/Numiabot/#/aAsDTThHwOIrsB3C2uVh';
    let micStream = null;
    let micHabilitado = false; // true = el bot puede usar el micrófono
    
    const placeholder = document.getElementById('placeholder');
    const iframeWrapper = document.getElementById('iframeWrapper');
    const numiabotFrame = document.getElementById('numiabotFrame');
    const btnCargarConMic = document.getElementById('btnCargarConMic');
    const btnCargarSinMic = document.getElementById('btnCargarSinMic');
    const btnToggleMic = document.getElementById('btnToggleMic');
    
    function actualizarBotonToggle() {
      if (!btnToggleMic) return;
      if (micHabilitado) {
        btnToggleMic.className = 'btn-mic btn-toggle-mic habilitado';
        btnToggleMic.innerHTML = '<i class="bi bi-mic-fill"></i> <span>Deshabilitar micrófono</span>';
        btnToggleMic.title = 'Clic cuando termines de hablar';
      } else {
        btnToggleMic.className = 'btn-mic btn-toggle-mic activo';
        btnToggleMic.innerHTML = '<i class="bi bi-mic-mute-fill"></i> <span>Habilitar micrófono para hablar</span>';
        btnToggleMic.title = 'Clic antes de hablar';
      }
    }
    
    function liberarMic() {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
      }
      micHabilitado = true;
      actualizarBotonToggle();
    }
    
    async function reservarMic() {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioTrack = micStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = false;
        micHabilitado = false;
        actualizarBotonToggle();
        return true;
      } catch (err) {
        console.error('Error al reservar micrófono:', err);
        alert('No se pudo reservar el micrófono.');
        return false;
      }
    }
    
    async function toggleMic() {
      if (micHabilitado) {
        liberarMic();
        numiabotFrame.src = numiabotFrame.src;
      } else {
        btnToggleMic.disabled = true;
        btnToggleMic.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Deshabilitando...</span>';
        const ok = await reservarMic();
        btnToggleMic.disabled = false;
        if (!ok) actualizarBotonToggle();
      }
    }
    
    function cargarConMicHabilitado() {
      micHabilitado = true;
      placeholder.classList.add('hidden');
      iframeWrapper.style.display = 'flex';
      numiabotFrame.src = NUMIABOT_URL;
      actualizarBotonToggle();
    }
    
    async function cargarConMicSilenciado() {
      btnCargarSinMic.disabled = true;
      btnCargarSinMic.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Reservando...</span>';
      const ok = await reservarMic();
      if (!ok) {
        btnCargarSinMic.disabled = false;
        btnCargarSinMic.innerHTML = '<i class="bi bi-mic-mute-fill"></i> <span>Cargar con micrófono silenciado</span>';
        return;
      }
      placeholder.classList.add('hidden');
      iframeWrapper.style.display = 'flex';
      numiabotFrame.src = NUMIABOT_URL;
      btnCargarSinMic.disabled = false;
    }
    
    btnCargarConMic.addEventListener('click', cargarConMicHabilitado);
    btnCargarSinMic.addEventListener('click', cargarConMicSilenciado);
    btnToggleMic.addEventListener('click', toggleMic);
    
    window.addEventListener('beforeunload', () => {
      if (micStream) micStream.getTracks().forEach(track => track.stop());
    });
