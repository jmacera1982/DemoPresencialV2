    let stream = null;
    let videoElement = null;
    let scanInterval = null;
    
    const screenVideo = document.getElementById('screenVideo');
    const screenBiometria = document.getElementById('screenBiometria');
    const screenCamara = document.getElementById('screenCamara');
    const btnIniciarAtencion = document.getElementById('btnIniciarAtencion');

    function ocultarVideoYMostrarBiometria() {
      console.log('🎬 Ocultando video y mostrando biometría...');
      // Detener el video si está reproduciéndose
      const iframe = document.getElementById('youtubeVideo');
      if (iframe) {
        try {
          iframe.src = '';
        } catch (e) {
          console.log('No se pudo detener el video:', e);
        }
      }
      if (screenVideo) {
        screenVideo.classList.add('hidden');
      }
      if (screenBiometria) {
        screenBiometria.classList.remove('hidden');
      }
    }
    
    function mostrarErrorVideo() {
      const errorDiv = document.getElementById('videoError');
      if (errorDiv) {
        errorDiv.style.display = 'block';
      }
    }
    
    // Asegurar que el video se reproduzca automáticamente al cargar
    window.addEventListener('load', function() {
      console.log('📹 Página cargada, asegurando reproducción automática del video...');
      const iframe = document.getElementById('youtubeVideo');
      if (iframe) {
        // Forzar que el iframe tenga los parámetros correctos para autoplay
        const currentSrc = iframe.src;
        if (!currentSrc.includes('autoplay=1') || !currentSrc.includes('mute=1')) {
          // Si falta algún parámetro, actualizar la URL
          let newSrc = 'https://www.youtube.com/embed/9345o50GWEQ?autoplay=1&mute=1&controls=1&rel=0&loop=1&playlist=9345o50GWEQ';
          iframe.src = newSrc;
          console.log('✅ URL del video actualizada para autoplay');
        }
        
        // Intentar reproducir después de un breve delay
        setTimeout(function() {
          try {
            // Los navegadores modernos requieren interacción del usuario para reproducir con sonido
            // Por eso mantenemos mute=1 para que el autoplay funcione
            console.log('✅ Video configurado para reproducirse automáticamente');
          } catch (e) {
            console.log('No se puede acceder al contenido del iframe (normal para YouTube)');
          }
        }, 500);
      }
    });
    
    // También intentar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
      console.log('📹 DOM cargado, preparando video...');
    });
    
    function iniciarAtencionDirecta() {
      console.log('🚀 Iniciando atención directamente...');
      // Ocultar pantalla de biometría y mostrar pantalla de cámara
      if (screenBiometria) {
        screenBiometria.classList.add('hidden');
      }
      if (screenCamara) {
        screenCamara.classList.remove('hidden');
      }
      // Activar cámara directamente
      startCamera();
    }

    async function startCamera() {
      console.log('📹 Función startCamera ejecutándose...');
      try {
        // Solicitar acceso a la cámara
        console.log('🔐 Solicitando acceso a la cámara...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 400 },
            height: { ideal: 300 },
            facingMode: 'user'
          } 
        });
        
        console.log('✅ Acceso a la cámara concedido');
        
        // Crear elemento de video
        videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        
        // Reemplazar el contenido del feed de la cámara
        const cameraFeed = document.getElementById('cameraFeed');
        const cameraOverlay = document.getElementById('cameraOverlay');
        if (cameraFeed) {
          cameraFeed.innerHTML = '';
          cameraFeed.appendChild(videoElement);
        }
        // Mantener el overlay visible
        if (cameraOverlay) {
          cameraOverlay.style.display = 'block';
        }
        
        // Actualizar estado
        const biometricIcon = document.getElementById('biometricIcon');
        if (biometricIcon) {
          biometricIcon.textContent = '👁️';
        }
        
        console.log('📱 Cámara activada, iniciando escaneo facial en 2 segundos...');
        
        // Simular proceso de escaneo facial
        setTimeout(() => {
          console.log('👁️ Iniciando escaneo facial automáticamente...');
          startFacialScan();
        }, 2000);
        
      } catch (error) {
        console.error('❌ Error al acceder a la cámara:', error);
        const biometricIcon = document.getElementById('biometricIcon');
        if (biometricIcon) {
          biometricIcon.textContent = '❌';
        }
      }
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      
      if (videoElement) {
        videoElement.remove();
        videoElement = null;
      }
      
      // Detener intervalo de escaneo si está activo
      if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
      }
      
      // Restaurar estado inicial
      const cameraFeed = document.getElementById('cameraFeed');
      if (cameraFeed) {
        cameraFeed.innerHTML = '<div>Iniciando cámara...</div><div class="camera-loading-spinner"></div>';
      }
      const biometricIcon = document.getElementById('biometricIcon');
      const biometricText = document.getElementById('biometricText');
      const biometricProgress = document.getElementById('biometricProgress');
      
      if (biometricIcon) biometricIcon.textContent = '🔒';
      if (biometricText) biometricText.textContent = 'Se requiere acceso a la cámara para validación facial';
      if (biometricProgress) biometricProgress.style.width = '0%';
    }

    function startFacialScan() {
      console.log('👁️ Iniciando escaneo facial...');
      const biometricIcon = document.getElementById('biometricIcon');
      const biometricText = document.getElementById('biometricText');
      
      if (biometricIcon) biometricIcon.textContent = '👁️';
      if (biometricText) biometricText.textContent = 'Escaneando rostro...';
      
      // Simular progreso del escaneo
      let progress = 0;
      scanInterval = setInterval(() => {
        progress += 10; // 10% cada vez
        updateBiometricProgress(progress);
        console.log(`📊 Progreso del escaneo: ${progress}%`);
        
        if (progress >= 100) {
          clearInterval(scanInterval);
          scanInterval = null;
          console.log('✅ Escaneo facial completado');
          completeBiometricValidation();
        }
      }, 200); // 200ms cada paso
    }

    function completeBiometricValidation() {
      console.log('🎉 Validación biométrica completada exitosamente');
      const biometricIcon = document.getElementById('biometricIcon');
      const biometricText = document.getElementById('biometricText');
      const cameraContainer = document.getElementById('cameraContainer');
      const cameraControls = document.getElementById('cameraControls');
      
      if (biometricIcon) biometricIcon.textContent = '✅';
      if (biometricText) biometricText.textContent = '¡Validación biométrica exitosa!';
      
      // Detener cámara
      stopCamera();
      
      // Ocultar contenedor de cámara
      if (cameraContainer) cameraContainer.style.display = 'none';
      
      // Redirigir al avatar después de 2 segundos
      setTimeout(() => {
        console.log('🔄 Redirigiendo al avatar...');
        window.location.href = 'https://filavirtual.preprod.debmedia.com/Numiabot/#/TDNFYImANgm606yYSWyH';
      }, 2000);
    }

    function updateBiometricProgress(progress) {
      const biometricProgress = document.getElementById('biometricProgress');
      if (biometricProgress) {
        biometricProgress.style.width = progress + '%';
      }
    }

    // Detener la cámara cuando se cierre la página
    window.addEventListener('beforeunload', () => {
      stopCamera();
    });

function setupTotemBnaBindings() {
  var screenVideo = document.getElementById('screenVideo');
  var videoFrame = document.getElementById('youtubeVideo');
  var videoError = document.getElementById('videoError');
  var videoErrorLink = document.getElementById('videoErrorLink');
  var btnIniciarAtencion = document.getElementById('btnIniciarAtencion');
  if (screenVideo) { screenVideo.addEventListener('click', ocultarVideoYMostrarBiometria); screenVideo.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ocultarVideoYMostrarBiometria(); } }); }
  if (videoError) { videoError.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ocultarVideoYMostrarBiometria(); } }); }
  if (videoFrame) { videoFrame.addEventListener('error', mostrarErrorVideo); }
  if (videoErrorLink) { videoErrorLink.addEventListener('click', function (event) { event.stopPropagation(); }); }
  if (btnIniciarAtencion) { btnIniciarAtencion.addEventListener('click', iniciarAtencionDirecta); }
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupTotemBnaBindings, { once: true }); } else { setupTotemBnaBindings(); }
