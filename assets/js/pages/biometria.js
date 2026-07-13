    let stream = null;
    let videoElement = null;
    let scanInterval = null;
    
    const screenBiometria = document.getElementById('screenBiometria');
    const screenCamara = document.getElementById('screenCamara');
    const screenOpciones = document.getElementById('screenOpciones');
    const screenConfirmacion = document.getElementById('screenConfirmacion');
    const opcionesGrid = document.getElementById('opcionesGrid');
    const btnIniciarAtencion = document.getElementById('btnIniciarAtencion');
    const logContainer = document.querySelector('.log-container');
    const atencionSection = document.getElementById('atencionSection');
    const stepsContainer = document.getElementById('stepsContainer');
    const summarySection = document.getElementById('summarySection');
    const summaryContent = document.getElementById('summaryContent');
    
    // Configuración de la API Journey Builder
    const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.TOTEM_BANKING;
    
    // Variables de estado
    let analisisCompletado = false;
    let recomendacionVideollamada = false;

    function mostrarPantallaCamara() {
      console.log('🚀 Mostrando pantalla de cámara...');
      screenBiometria.classList.add('hidden');
      screenCamara.classList.remove('hidden');
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
      
      // Ocultar controles de cámara
      if (cameraContainer) cameraContainer.style.display = 'none';
      if (cameraControls) cameraControls.style.display = 'none';
      
      // Continuar con el proceso después de 2 segundos
      setTimeout(() => {
        console.log('🔒 Ocultando pantalla de cámara...');
        
        // Ocultar pantalla de cámara y mostrar menú de opciones
        screenCamara.classList.add('hidden');
        mostrarPantallaOpciones();
      }, 2000);
    }

    function updateBiometricProgress(progress) {
      const biometricProgress = document.getElementById('biometricProgress');
      if (biometricProgress) {
        biometricProgress.style.width = progress + '%';
      }
    }
    
    // Mostrar pantalla de opciones (Préstamos, Tarjetas, Inversiones)
    function mostrarPantallaOpciones() {
      screenOpciones.classList.add('active');
      
      opcionesGrid.innerHTML = '';
      
      // Opción Préstamos
      const cardPrestamos = document.createElement('div');
      cardPrestamos.className = 'opcion-card opcion-card-primary';
      
      cardPrestamos.innerHTML = `
        <div class="opcion-icon opcion-icon-primary">
          <i class="bi bi-cash-coin"></i>
        </div>
        <div class="opcion-title">Préstamos</div>
      `;
      cardPrestamos.addEventListener('click', async () => {
        await llamarAgenteConOpcionTotem('prestamos');
      });
      opcionesGrid.appendChild(cardPrestamos);
      
      // Opción Tarjetas
      const cardTarjetas = document.createElement('div');
      cardTarjetas.className = 'opcion-card opcion-card-primary';
      
      cardTarjetas.innerHTML = `
        <div class="opcion-icon opcion-icon-primary">
          <i class="bi bi-credit-card"></i>
        </div>
        <div class="opcion-title">Tarjetas</div>
      `;
      cardTarjetas.addEventListener('click', async () => {
        await llamarAgenteConOpcionTotem('tarjetas');
      });
      opcionesGrid.appendChild(cardTarjetas);
      
      // Opción Inversiones
      const cardInversiones = document.createElement('div');
      cardInversiones.className = 'opcion-card opcion-card-primary';
      
      cardInversiones.innerHTML = `
        <div class="opcion-icon opcion-icon-primary">
          <i class="bi bi-graph-up-arrow"></i>
        </div>
        <div class="opcion-title">Inversiones</div>
      `;
      cardInversiones.addEventListener('click', async () => {
        await llamarAgenteConOpcionTotem('inversiones');
      });
      opcionesGrid.appendChild(cardInversiones);
    }
    
    async function llamarAgenteConOpcionTotem(opcion) {
      try {
        console.log(`📞 Llamando agente con opción: ${opcion}`);
        
        // Ocultar pantalla de opciones y mostrar loading
        screenOpciones.classList.remove('active');
        
        // Mostrar log
        if (logContainer) {
          logContainer.classList.add('visible');
        }
        
        if (atencionSection) {
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');
        }
        
        if (stepsContainer) {
          stepsContainer.innerHTML = '<div class="steps-status steps-status-loading"><i class="bi bi-hourglass-split me-2"></i>Conectando con el asistente...</div>';
        }
        
        // Llamar al agente con la opción seleccionada
        const mensaje = `Necesito atención sobre ${opcion}`;
        
        const data = await NumiaJourneyApi.runJourney(JOURNEY_FLOW_ID, {
            input_value: mensaje,
            input_type: 'chat'
          });
        console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2));
        
        // Procesar respuesta
        let contents = [];
        let messageText = null;
        
        if (data.outputs && data.outputs.length > 0) {
          const firstOutput = data.outputs[0];
          
          if (firstOutput.outputs && firstOutput.outputs.length > 0) {
            const innerOutput = firstOutput.outputs[0];
            
            if (innerOutput.results?.message?.content_blocks) {
              innerOutput.results.message.content_blocks.forEach((block) => {
                if (block.contents && Array.isArray(block.contents)) {
                  block.contents.forEach((content) => {
                    if (content.type === 'tool_use' && content.name) {
                      contents.push({
                        type: 'tool_use',
                        name: content.name,
                        tool_name: content.name,
                        tool_input: content.tool_input || content.input,
                        output: content.output,
                        duration: content.duration
                      });
                    }
                  });
                }
              });
            }
            
            if (innerOutput.artifacts?.message) {
              messageText = typeof innerOutput.artifacts.message === 'string' 
                ? innerOutput.artifacts.message 
                : innerOutput.artifacts.message.message || JSON.stringify(innerOutput.artifacts.message);
            } else if (innerOutput.outputs?.message?.message) {
              messageText = innerOutput.outputs.message.message;
            } else if (innerOutput.results?.message?.text) {
              messageText = innerOutput.results.message.text;
            }
          }
        }
        
        // Mostrar pasos
        if (contents.length > 0 && stepsContainer) {
          stepsContainer.innerHTML = '';
          contents.forEach((content, index) => {
            setTimeout(() => {
              agregarPaso(content, index);
            }, index * 800);
          });
          
          if (messageText) {
            setTimeout(() => {
              mostrarResumen(messageText);
              analisisCompletado = true;
              
              // Mostrar pantalla de confirmación después del análisis
              setTimeout(() => {
                screenConfirmacion.classList.add('active');
              }, contents.length * 800 + 500);
            }, contents.length * 800 + 500);
          }
        } else {
          if (messageText && summaryContent) {
            mostrarResumen(messageText);
            analisisCompletado = true;
            
            // Mostrar pantalla de confirmación
            setTimeout(() => {
              screenConfirmacion.classList.add('active');
            }, 1000);
          }
        }
        
      } catch (error) {
        console.error('❌ Error al llamar al agente:', error);
        if (stepsContainer) {
          stepsContainer.innerHTML = `<div class="steps-status steps-status-error">Error al procesar su solicitud: ${error.message}</div>`;
        }
      }
    }
    
    // Funciones auxiliares
    function agregarPaso(content, index) {
      try {
        if (!stepsContainer) return;
        
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item processing';
        
        const toolName = content.name || content.tool_name || 'Herramienta desconocida';
        const friendlyName = toolName
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase());
        
        stepItem.innerHTML = `
          <div class="step-title">${escapeHtml(friendlyName)}</div>
          <div class="step-output-content">
            <em class="tool-success">Herramienta ejecutada correctamente</em>
          </div>
        `;
        
        stepsContainer.appendChild(stepItem);
        
        setTimeout(() => {
          stepItem.classList.remove('processing');
          stepItem.classList.add('completed');
        }, 600);
        
      } catch (err) {
        console.error('Error al agregar paso:', err);
      }
    }
    
    function mostrarResumen(message) {
      try {
        if (!summaryContent || !summarySection) return;
        
        const messageText = typeof message === 'string' ? message : (message.message || JSON.stringify(message, null, 2));
        summaryContent.textContent = messageText;
        summarySection.style.display = 'block';
      } catch (err) {
        console.error('Error al mostrar resumen:', err);
      }
    }
    
    function extraerScoring(texto) {
      if (!texto) return null;
      
      // Buscar patrones como "Scoring: 640", "Scoring:640", "scoring: 640", etc.
      const patrones = [
        /Scoring:\s*(\d+)/i,
        /Scoring\s*:\s*(\d+)/i,
        /score\s*:\s*(\d+)/i
      ];
      
      for (const patron of patrones) {
        const match = texto.match(patron);
        if (match && match[1]) {
          const scoring = parseInt(match[1], 10);
          if (!isNaN(scoring)) {
            return scoring;
          }
        }
      }
      
      return null;
    }
    
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Detener la cámara cuando se cierre la página
    window.addEventListener('beforeunload', () => {
      stopCamera();
    });

function setupBiometriaBindings() {
  var btnIniciar = document.getElementById('btnIniciarAtencion');
  var btnActivarCamara = document.getElementById('btnActivarCamara');
  if (btnIniciar) { btnIniciar.addEventListener('click', mostrarPantallaCamara); }
  if (btnActivarCamara) { btnActivarCamara.addEventListener('click', startCamera); }
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupBiometriaBindings, { once: true }); } else { setupBiometriaBindings(); }
