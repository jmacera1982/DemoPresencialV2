document.addEventListener('DOMContentLoaded', function() {
// Configuración de la API Journey Builder
      const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.APP_CLIENTE;
      const PASOS_ANALISIS_UI = [
        { titulo: 'Comportamiento digital', detalle: 'Evaluación de onboarding y señales digitales.' },
        { titulo: 'Scoring', detalle: 'Puntuación y mejor oferta disponible.' },
        { titulo: 'Sugerencia de canal', detalle: 'Priorización del canal de atención.' },
        { titulo: 'Calcular prioridad', detalle: 'Analisis del estado actual de la sucursal comparado con el cliente.' }
      ];
      
      // Variables de estado (datos del formulario)
      let formNombre = '';
      let formApellido = '';
      let formDni = '';
      let formEmail = '';
      let analisisCompletado = false;
      let recomendacionVideollamada = false;
      let messageText = null;
      
      // Elementos del DOM
      const screenForm = document.getElementById('screenForm');
      const screenOpciones = document.getElementById('screenOpciones');
      const screenConfirmacion = document.getElementById('screenConfirmacion');
      const formDatos = document.getElementById('formDatos');
      const btnContinuarForm = document.getElementById('btnContinuarForm');
      const opcionesGrid = document.getElementById('opcionesGrid');
      const atencionSection = document.getElementById('atencionSection');
      const stepsContainer = document.getElementById('stepsContainer');
      const summarySection = document.getElementById('summarySection');
      const summaryContent = document.getElementById('summaryContent');
      const logContainer = document.querySelector('.log-container');
      
      // Validar y enviar formulario - Continuar
      formDatos.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = (document.getElementById('inputNombre').value || '').trim();
        const apellido = (document.getElementById('inputApellido').value || '').trim();
        const dni = (document.getElementById('inputDni').value || '').trim();
        const email = (document.getElementById('inputEmail').value || '').trim();
        
        // Ocultar errores previos
        ['errorNombre', 'errorApellido', 'errorDni', 'errorEmail'].forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.display = 'none'; el.textContent = ''; }
        });
        
        let valid = true;
        if (!nombre) {
          const err = document.getElementById('errorNombre');
          if (err) { err.textContent = 'Ingrese su nombre'; err.style.display = 'block'; }
          valid = false;
        }
        if (!apellido) {
          const err = document.getElementById('errorApellido');
          if (err) { err.textContent = 'Ingrese su apellido'; err.style.display = 'block'; }
          valid = false;
        }
        if (!dni) {
          const err = document.getElementById('errorDni');
          if (err) { err.textContent = 'Ingrese su DNI'; err.style.display = 'block'; }
          valid = false;
        }
        if (!email) {
          const err = document.getElementById('errorEmail');
          if (err) { err.textContent = 'Ingrese su email'; err.style.display = 'block'; }
          valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          const err = document.getElementById('errorEmail');
          if (err) { err.textContent = 'Email no válido'; err.style.display = 'block'; }
          valid = false;
        }
        
        if (!valid) return;
        
        formNombre = nombre;
        formApellido = apellido;
        formDni = dni;
        formEmail = email;
        
        // Mostrar pantalla de opciones (Préstamos, Tarjetas, Inversiones)
        mostrarPantallaOpciones();
      });
      
      // Mostrar pantalla de opciones (Préstamos, Tarjetas, Inversiones)
      function mostrarPantallaOpciones() {
        if (screenForm) screenForm.style.display = 'none';
        screenOpciones.classList.add('active');
        
        opcionesGrid.innerHTML = '';
        
        // Cambiar el título y subtítulo
        const screenOpcionesTitle = screenOpciones.querySelector('h2');
        const screenOpcionesSubtitle = screenOpciones.querySelector('.subtitle');
        if (screenOpcionesTitle) {
          screenOpcionesTitle.textContent = '¿Cómo podemos ayudarlo?';
        }
        if (screenOpcionesSubtitle) {
          screenOpcionesSubtitle.textContent = 'Seleccione el servicio que necesita';
        }
        
        // Opción Préstamos
        const cardPrestamos = document.createElement('div');
        cardPrestamos.className = 'opcion-card qr-option-card--prestamos is-clickable';
        cardPrestamos.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
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
        cardTarjetas.className = 'opcion-card qr-option-card--tarjetas is-clickable';
        cardTarjetas.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
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
        cardInversiones.className = 'opcion-card qr-option-card--inversiones is-clickable';
        cardInversiones.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
            <i class="bi bi-graph-up-arrow"></i>
          </div>
          <div class="opcion-title">Inversiones</div>
        `;
        cardInversiones.addEventListener('click', async () => {
          await llamarAgenteConOpcionTotem('inversiones');
        });
        opcionesGrid.appendChild(cardInversiones);
      }
      
      // Mostrar opciones presenciales en el tótem
      function mostrarOpcionesPresencialTotem() {
        const opcionesPresencialContainer = document.getElementById('opcionesPresencialContainerTotem');
        if (!opcionesPresencialContainer) return;
        
        // Si ya está visible, ocultarlo
        if (opcionesPresencialContainer.style.display === 'block') {
          opcionesPresencialContainer.style.display = 'none';
          return;
        }
        
        // Mostrar opciones
        opcionesPresencialContainer.innerHTML = `
          <div class="totem-panel">
            <h3 class="totem-panel-title">¿Cómo podemos ayudarlo?</h3>
            <div class="totem-panel-grid">
              <div class="opcion-card is-clickable" data-opcion="prestamos">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-cash-coin"></i>
                </div>
                <div class="opcion-title">Préstamos</div>
              </div>
              <div class="opcion-card is-clickable" data-opcion="tarjetas">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-credit-card"></i>
                </div>
                <div class="opcion-title">Tarjetas</div>
              </div>
              <div class="opcion-card is-clickable" data-opcion="inversiones">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-graph-up-arrow"></i>
                </div>
                <div class="opcion-title">Inversiones</div>
              </div>
            </div>
          </div>
        `;
        opcionesPresencialContainer.style.display = 'block';
        
        // Agregar event listeners a las tarjetas
        const cardsOpcion = opcionesPresencialContainer.querySelectorAll('[data-opcion]');
        cardsOpcion.forEach(card => {
          card.addEventListener('click', async () => {
            const opcion = card.getAttribute('data-opcion');
            await llamarAgenteConOpcionTotem(opcion);
          });
        });
      }
      
      function aplicarResumenYFlujoQr(messageText) {
        const resumen = messageText || 'No se recibió el texto de análisis de la API.';
        mostrarResumen(resumen);
        if (!messageText) {
          setTimeout(() => solicitarAtencionPresencialDirecta(), 1000);
          return;
        }
        const scoring = extraerScoring(messageText);
        const textoLower = messageText.toLowerCase();
        const diceNoOPresencial =
          textoLower.includes('sugerir videollamada: no') ||
          textoLower.includes('sugerir videollamada:no') ||
          textoLower.includes('**sugerir videollamada:** no') ||
          textoLower.includes('**sugerir videollamada:**no') ||
          (textoLower.includes('tipo de atención sugerida:') && textoLower.includes('presencial')) ||
          (textoLower.includes('tipo de atención sugerida') && textoLower.includes('presencial'));
        let tieneVideollamadaTexto = false;
        if (!diceNoOPresencial) {
          tieneVideollamadaTexto =
            textoLower.includes('- sugerir videollamada: si') ||
            textoLower.includes('- sugerir videollamada: sí') ||
            textoLower.includes('sugerir videollamada: si') ||
            textoLower.includes('sugerir videollamada: sí') ||
            textoLower.includes('**sugerir videollamada:** si') ||
            textoLower.includes('**sugerir videollamada:** sí') ||
            textoLower.includes('**sugerir videollamada:**si') ||
            textoLower.includes('**sugerir videollamada:**sí') ||
            textoLower.includes('tipo de atención sugerida: videollamada') ||
            textoLower.includes('tipo de atención sugerida:videollamada') ||
            (textoLower.includes('tipo de atención sugerida') && textoLower.includes('videollamada')) ||
            (textoLower.includes('tipo de atención sugerida:') && textoLower.includes('videollamada'));
        }
        const tieneVideollamada = tieneVideollamadaTexto || (scoring !== null && scoring > 640);
        recomendacionVideollamada = tieneVideollamada;
        console.log('Scoring extraído:', scoring, 'Videollamada recomendada:', tieneVideollamada);
        setTimeout(() => {
          if (tieneVideollamada) {
            mostrarOpcionesAtencion();
          } else {
            solicitarAtencionPresencialDirecta();
          }
        }, 1000);
      }

      async function llamarAgenteConOpcionTotem(opcion) {
        try {
          // Ocultar pantalla de opciones y mostrar loading
          screenOpciones.classList.remove('active');
          
          // Mostrar log
          if (logContainer) {
            logContainer.classList.add('visible');
          }
          
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');

          summarySection.style.display = 'none';

          const pasosInicio = Date.now();
          const delayPaso = 800;
          const nPasos = PASOS_ANALISIS_UI.length;
          const pasosAnimacionMs = nPasos * delayPaso + 500;

          stepsContainer.innerHTML = '';

          PASOS_ANALISIS_UI.forEach((paso, index) => {
            setTimeout(() => {
              agregarPaso({ name: paso.titulo, output: paso.detalle }, index);
            }, index * delayPaso);
          });

          const mensaje = `Necesito atención sobre ${opcion}. Nombre: ${formNombre} ${formApellido}, DNI: ${formDni}, Email: ${formEmail}`;

          let messageText = null;
          try {
            const data = await NumiaJourneyApi.runJourney(JOURNEY_FLOW_ID, {
            input_value: mensaje,
            input_type: 'chat'
          });
            console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2));

            if (data.outputs?.[0]?.outputs?.[0]) {
              const innerOutput = data.outputs[0].outputs[0];
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
          } catch (apiErr) {
            const transcurrido = Date.now() - pasosInicio;
            await new Promise(function(resolve) { setTimeout(resolve, Math.max(0, pasosAnimacionMs - transcurrido)); });
            throw apiErr;
          }

          const transcurridoFin = Date.now() - pasosInicio;
          await new Promise(function(resolve) { setTimeout(resolve, Math.max(0, pasosAnimacionMs - transcurridoFin)); });

          aplicarResumenYFlujoQr(messageText);
          
        } catch (err) {
          console.error('Error al llamar al agente:', err);
          stepsContainer.innerHTML = `<div class="totem-status totem-status--error"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${err.message}</div>`;
        }
      }
      
      // Mostrar opciones de atención (videollamada/presencial) después del análisis
      function mostrarOpcionesAtencion() {
        screenOpciones.classList.add('active');
        
        // Cambiar el título y subtítulo
        const screenOpcionesTitle = screenOpciones.querySelector('h2');
        const screenOpcionesSubtitle = screenOpciones.querySelector('.subtitle');
        if (screenOpcionesTitle) {
          screenOpcionesTitle.textContent = 'Seleccione su preferencia';
        }
        if (screenOpcionesSubtitle) {
          screenOpcionesSubtitle.textContent = 'Elija cómo desea ser atendido';
        }
        
        opcionesGrid.innerHTML = '';
        
        // Opción Videollamada (solo se muestra si está recomendada - esta función solo se llama cuando lo está)
        if (recomendacionVideollamada) {
          const cardVideo = document.createElement('div');
          cardVideo.className = 'opcion-card videollamada';
          cardVideo.innerHTML = `
            <div class="opcion-icon">
              <i class="bi bi-camera-video"></i>
            </div>
            <div class="opcion-title">Videollamada</div>
            <div class="opcion-badge">Menos espera</div>
            <div class="opcion-desc">Atención inmediata desde donde estés</div>
          `;
          cardVideo.addEventListener('click', () => solicitarAtencion('videollamada'));
          opcionesGrid.appendChild(cardVideo);
        }
        
        // Opción Presencial (siempre disponible, menos recomendada si hay videollamada)
        const cardPresencial = document.createElement('div');
        cardPresencial.className = 'opcion-card presencial';
        if (recomendacionVideollamada) {
          cardPresencial.innerHTML = `
            <div class="opcion-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="opcion-title">Continuar presencial</div>
            <div class="opcion-badge less-recommended">Opción menos recomendada</div>
            <div class="opcion-desc">Atención en sucursal</div>
          `;
        } else {
          cardPresencial.innerHTML = `
            <div class="opcion-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="opcion-title">Continuar presencial</div>
            <div class="opcion-desc">Atención en sucursal</div>
          `;
        }
        cardPresencial.addEventListener('click', () => solicitarAtencion('presencial'));
        opcionesGrid.appendChild(cardPresencial);
      }
      
      // Solicitar atención presencial directamente (cuando no hay recomendación de videollamada)
      async function solicitarAtencionPresencialDirecta() {
        try {
          const data = await FilaVirtualApi.enqueue('16221', '10750', {
            firstName: formNombre,
            lastName: formApellido,
            dni: formDni,
            email: formEmail
          });
          console.log('Respuesta de la API presencial:', data);
          
          // Mostrar pantalla de confirmación con datos del formulario
          mostrarPantallaConfirmacionPresencial();
          
        } catch (err) {
          console.error('Error al solicitar atención presencial:', err);
          alert(`Error: ${err.message}`);
        }
      }
      
      // Solicitar atención
      async function solicitarAtencion(tipo) {
        try {
          const queueId = tipo === 'videollamada' ? '16223' : '16221';
          const data = await FilaVirtualApi.enqueue(queueId, '10750', {
            firstName: formNombre,
            lastName: formApellido,
            dni: formDni,
            email: formEmail
          });
          console.log('Respuesta de la API:', data);
          
          // Mostrar pantalla de confirmación
          mostrarPantallaConfirmacion(data, tipo);
          
        } catch (err) {
          console.error('Error al solicitar atención:', err);
          alert(`Error: ${err.message}`);
        }
      }
      
      // Mostrar pantalla de confirmación
      function mostrarPantallaConfirmacion(data, tipo) {
        screenOpciones.classList.remove('active');
        screenConfirmacion.classList.add('active');
        
        // Ocultar elementos que no aplican si no hay data
        document.getElementById('tiempoEspera').style.display = 'none';
        document.getElementById('videoLinkContainer').style.display = 'none';
        
        // Mostrar tiempo de espera solo si hay data
        if (data && data.averageWaitingTime !== undefined) {
          const minutos = Math.floor(data.averageWaitingTime / 60);
          const segundos = data.averageWaitingTime % 60;
          document.getElementById('tiempoEspera').style.display = 'block';
          document.getElementById('tiempoEsperaValor').textContent = `${minutos} min ${segundos} seg`;
        }
        
        // Mostrar enlace de videollamada si aplica
        if (tipo === 'videollamada' && data && data.videoCallUrl) {
          const videoUrl = data.videoCallUrl + (data.videoCallUrl.includes('?') ? '&' : '?') + 'videocallUser=mobile';
          document.getElementById('videoLinkContainer').style.display = 'block';
          document.getElementById('btnVideoLink').href = videoUrl;
        }
      }
      
      // Mostrar pantalla de confirmación presencial (cuando no hay videollamada recomendada)
      function mostrarPantallaConfirmacionPresencial() {
        screenOpciones.classList.remove('active');
        screenConfirmacion.classList.add('active');
        
        // Ocultar elementos que no aplican
        document.getElementById('tiempoEspera').style.display = 'none';
        document.getElementById('videoLinkContainer').style.display = 'none';
        
        // Actualizar el mensaje de confirmación
        const confirmacionTitle = screenConfirmacion.querySelector('h2');
        const confirmacionMessage = screenConfirmacion.querySelector('.message');
        
        if (confirmacionTitle) {
          confirmacionTitle.textContent = 'Tu turno fue asignado';
        }
        
        if (confirmacionMessage) {
          confirmacionMessage.innerHTML = `
            Lo llamaremos. <strong>${formNombre} ${formApellido}</strong>, DNI: <strong>${formDni}</strong>
          `;
        }
      }
      
      // Función para extraer el Scoring del mensaje
      function extraerScoring(texto) {
        if (!texto) return null;
        
        // Buscar patrones como "Scoring: 640", "Scoring:640", "scoring: 640", etc.
        const patrones = [
          /Score:\s*\*{0,2}(\d+)\*{0,2}/i,
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
      
      function formatearNombrePasoAmigable(toolName) {
        if (!toolName || typeof toolName !== 'string') return 'Herramienta desconocida';
        const t = toolName.trim();
        if (!t) return 'Herramienta desconocida';
        if (/\s/.test(t) && !/[a-z][A-Z]/.test(t)) {
          return t;
        }
        return t
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      // Funciones auxiliares (copiadas de app-cliente.html)
      function agregarPaso(content, index) {
        try {
          const stepItem = document.createElement('div');
          stepItem.className = 'step-item processing';
          
          const toolName = content.name || content.tool_name || 'Herramienta desconocida';
          const friendlyName = formatearNombrePasoAmigable(toolName);
          
          const detallePaso = (typeof content.output === 'string' && content.output.trim())
            ? content.output.trim()
            : 'Completado';
          stepItem.innerHTML = `
            <div class="step-title">${escapeHtml(friendlyName)}</div>
            <div class="step-output-content">
              <em class="totem-status">${escapeHtml(detallePaso)}</em>
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
          const messageText = typeof message === 'string' ? message : (message.message || JSON.stringify(message, null, 2));
          summaryContent.textContent = messageText;
          summarySection.style.display = 'block';
        } catch (err) {
          console.error('Error al mostrar resumen:', err);
        }
      }
      
      function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
});
