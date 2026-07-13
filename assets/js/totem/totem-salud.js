document.addEventListener('DOMContentLoaded', function() {
// Configuración de la API Journey Builder (para flujos avanzados)
      const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.TOTEM_BANKING;
      var CONCLUSIONES_AGENTE_TEXTO = 'De acuerdo a lo analizado se detecta que de acuerdo a la cobertura del paciente, corresponde realizar el pago. De acuerdo a experiencias negativas anteriores y a que no se detectan pacientes en la sala de espera que requieren una atención urgente, el paciente recibirá atención prioritaria';
      var CONCLUSIONES_AGENTE_FRASE_NEGRITA = 'el paciente recibirá atención prioritaria';
      
      const DETALLE_EXTRA_FIELDS_TOTEM = 'De acuerdo a la cobertura del paciente, corresponde realizar el pago. De acuerdo a experiencias negativas anteriores y a que no se detectan pacientes en la sala de espera que requieren una atención urgente';
      var TIEMPO_ESPERA_CONFIRMACION_TEXTO = '3 min 0 seg';

      function buildExtraFieldsTotem() {
        return [{
          showable: [{ in: 'workstation', format: 'both' }],
          Detalle: DETALLE_EXTRA_FIELDS_TOTEM
        }];
      }

      function buildDatosEnqueueTotem(dni) {
        return {
          dni: dni,
          email: 'mail@mail.com',
          extraFields: buildExtraFieldsTotem()
        };
      }
      
      function resetBloquesTurnoYEsperaConfirmacion() {
        var nb = document.getElementById('numeroTurnoBlock');
        var te = document.getElementById('tiempoEspera');
        if (nb) nb.style.display = 'none';
        if (te) te.style.display = 'none';
      }
      
      function extraerTurnoYEsperaFilaVirtual(data) {
        if (!data || typeof data !== 'object') return { turn: null, waitSeconds: null };
        var jd = data.jsonDetails;
        var turn = data.turn != null ? data.turn : (jd && jd.turn != null ? jd.turn : null);
        var w = jd ? (jd.averageWaitingTime != null ? jd.averageWaitingTime : jd.serviceTime) : null;
        if (w == null) w = data.averageWaitingTime != null ? data.averageWaitingTime : data.serviceTime;
        var waitSeconds = w != null && isFinite(Number(w)) ? Number(w) : null;
        return {
          turn: turn != null && String(turn) !== '' ? String(turn) : null,
          waitSeconds: waitSeconds
        };
      }
      
      function aplicarTurnoYEsperaEnConfirmacion(data) {
        var ex = extraerTurnoYEsperaFilaVirtual(data);
        var elTurnBlock = document.getElementById('numeroTurnoBlock');
        var elTurnVal = document.getElementById('numeroTurnoValor');
        var te = document.getElementById('tiempoEspera');
        var teVal = document.getElementById('tiempoEsperaValor');
        if (elTurnBlock && elTurnVal) {
          if (ex.turn) {
            elTurnVal.textContent = ex.turn;
            elTurnBlock.style.display = 'block';
          } else {
            elTurnBlock.style.display = 'none';
          }
        }
        if (te && teVal) {
          teVal.textContent = TIEMPO_ESPERA_CONFIRMACION_TEXTO;
          te.style.display = 'block';
        }
      }
      
      async function enqueueTotemSaludFilaVirtual() {
        return FilaVirtualApi.enqueue('16221', '10750', buildDatosEnqueueTotem(dniIngresado));
      }
      
      // Variables de estado
      let dniIngresado = '';
      let tipoAtencion = null; // 'demanda' | 'cita'
      /** @type {'demanda'|'cita'|null} */
      let contextoPagoOrigen = null;
      /** @type {string|null} */
      let especialidadDemandaSeleccionada = null;
      let pagoQrTimerId = null;
      let analisisCompletado = false;
      let recomendacionVideollamada = false;
      let messageText = null;
      
      // Elementos del DOM
      const screenTipoAtencion = document.getElementById('screenTipoAtencion');
      const screenDni = document.getElementById('screenDni');
      const screenDemandaOpciones = document.getElementById('screenDemandaOpciones');
      const screenCitaCardiologia = document.getElementById('screenCitaCardiologia');
      const screenPago = document.getElementById('screenPago');
      const screenOpciones = document.getElementById('screenOpciones');
      const screenConfirmacion = document.getElementById('screenConfirmacion');
      const dniDisplay = document.getElementById('dniDisplay');
      const btnContinuar = document.getElementById('btnContinuar');
      const btnDelete = document.getElementById('btnDelete');
      const opcionesGrid = document.getElementById('opcionesGrid');
      const atencionSection = document.getElementById('atencionSection');
      const stepsContainer = document.getElementById('stepsContainer');
      const summarySection = document.getElementById('summarySection');
      const summaryContent = document.getElementById('summaryContent');
      const logContainer = document.querySelector('.log-container');
      /** @type {number[]} */
      let simulacionPasosAgenteTimeouts = [];
      let pagoOpcionesRevealTimeoutId = null;
      
      // Inicializar display
      actualizarDisplay();
      
      function cancelarSimulacionPasosAgente() {
        simulacionPasosAgenteTimeouts.forEach(function (id) { clearTimeout(id); });
        simulacionPasosAgenteTimeouts = [];
        if (pagoOpcionesRevealTimeoutId !== null) {
          clearTimeout(pagoOpcionesRevealTimeoutId);
          pagoOpcionesRevealTimeoutId = null;
        }
      }
      
      function revelarOpcionesPagoTrasAnalisis() {
        var row = document.getElementById('pagoOpcionesRow');
        var subEspera = document.getElementById('pagoSubtituloEspera');
        var subElegir = document.getElementById('pagoSubtituloElegir');
        if (subEspera) subEspera.style.display = 'none';
        if (subElegir) subElegir.style.display = 'block';
        if (row) row.style.display = 'grid';
        pagoOpcionesRevealTimeoutId = null;
      }
      
      function ocultarOpcionesPagoHastaAnalisis() {
        var row = document.getElementById('pagoOpcionesRow');
        var subEspera = document.getElementById('pagoSubtituloEspera');
        var subElegir = document.getElementById('pagoSubtituloElegir');
        if (row) row.style.display = 'none';
        if (subEspera) subEspera.style.display = 'block';
        if (subElegir) subElegir.style.display = 'none';
      }
      
      /** Simula el análisis del agente (panel derecho): un paso por segundo. */
      function iniciarSimulacionPasosAgente() {
        cancelarSimulacionPasosAgente();
        if (!stepsContainer) return;
        if (logContainer) logContainer.classList.add('visible');
        if (atencionSection) {
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');
        }
        if (summarySection) summarySection.style.display = 'none';
        stepsContainer.innerHTML = '';
        var titulos = [
          'Buscar datos del paciente',
          'Consultando información de prepaga',
          'buscando historia clínica',
          'Priorizando Cliente'
        ];
        titulos.forEach(function (titulo, i) {
          var tid = setTimeout(function () {
            var stepItem = document.createElement('div');
            stepItem.className = 'step-item processing';
            stepItem.innerHTML =
              '<div class="step-title">' + escapeHtml(titulo) + '</div>' +
              '<div class="step-output-content">' +
              '<em class="totem-status">Herramienta ejecutada correctamente</em>' +
              '</div>';
            stepsContainer.appendChild(stepItem);
            setTimeout(function () {
              stepItem.classList.remove('processing');
              stepItem.classList.add('completed');
            }, 400);
            var logContentEl = document.querySelector('.log-content');
            if (logContentEl) logContentEl.scrollTop = logContentEl.scrollHeight;
          }, i * 1000);
          simulacionPasosAgenteTimeouts.push(tid);
        });
        /* Último paso a los (n-1)s; +600 ms para la animación "completed" → recién ahí se muestran QR / caja */
        var delayReveladoMs = (titulos.length - 1) * 1000 + 600;
        pagoOpcionesRevealTimeoutId = setTimeout(function () {
          revelarOpcionesPagoTrasAnalisis();
          mostrarConclusionesFinalesAgente(null);
        }, delayReveladoMs);
      }
      
      function resetVistaPago() {
        const row = document.getElementById('pagoOpcionesRow');
        const qr = document.getElementById('pagoQrSimulacion');
        if (row) row.style.display = 'grid';
        var subEspera = document.getElementById('pagoSubtituloEspera');
        var subElegir = document.getElementById('pagoSubtituloElegir');
        if (subEspera) subEspera.style.display = 'none';
        if (subElegir) subElegir.style.display = 'block';
        if (qr) qr.style.display = 'none';
        const bq = document.getElementById('btnPagoQr');
        const bc = document.getElementById('btnPagoCaja');
        if (bq) { bq.classList.remove('disabled'); bq.style.pointerEvents = ''; }
        if (bc) { bc.classList.remove('disabled'); bc.style.pointerEvents = ''; }
      }
      
      function cerrarPagoYMostrarConfirmacionFinalQr(apiData) {
        if (pagoQrTimerId) {
          clearTimeout(pagoQrTimerId);
          pagoQrTimerId = null;
        }
        if (screenPago) screenPago.style.display = 'none';
        resetVistaPago();
        document.getElementById('videoLinkContainer').style.display = 'none';
        resetBloquesTurnoYEsperaConfirmacion();
        screenConfirmacion.classList.add('active');
        const confirmacionTitle = screenConfirmacion.querySelector('h2');
        const confirmacionMessage = screenConfirmacion.querySelector('.message');
        const nombresEsp = { nutricion: 'Nutrición', laboratorio: 'Laboratorio', clinico: 'Clínico' };
        if (contextoPagoOrigen === 'cita') {
          if (confirmacionTitle) confirmacionTitle.textContent = '¡Pago registrado!';
          if (confirmacionMessage) confirmacionMessage.innerHTML = 'Su pago fue simulado correctamente.<br>Su cita de Cardiología queda lista. Por favor, espere a ser llamado.';
        } else if (contextoPagoOrigen === 'demanda' && especialidadDemandaSeleccionada) {
          if (confirmacionTitle) confirmacionTitle.textContent = '¡Pago registrado!';
          if (confirmacionMessage) {
            confirmacionMessage.innerHTML = 'Pago simulado correctamente.<br>Se ha registrado su solicitud de <strong>' +
              nombresEsp[especialidadDemandaSeleccionada] + '</strong>. Espere a ser llamado.';
          }
        }
        aplicarTurnoYEsperaEnConfirmacion(apiData || {});
      }
      
      function abrirPantallaPago(origen, especialidadKey) {
        contextoPagoOrigen = origen;
        especialidadDemandaSeleccionada = especialidadKey || null;
        screenTipoAtencion.style.display = 'none';
        screenDni.style.display = 'none';
        screenDemandaOpciones.style.display = 'none';
        screenCitaCardiologia.style.display = 'none';
        screenOpciones.classList.remove('active');
        screenConfirmacion.classList.remove('active');
        resetBloquesTurnoYEsperaConfirmacion();
        resetVistaPago();
        if (screenPago) screenPago.style.display = 'block';
        ocultarOpcionesPagoHastaAnalisis();
        iniciarSimulacionPasosAgente();
      }
      
      // Pantalla inicial: Demanda espontánea o Citas
      document.querySelectorAll('#tipoAtencionGrid .opcion-card').forEach(card => {
        card.addEventListener('click', () => {
          tipoAtencion = card.getAttribute('data-tipo');
          screenTipoAtencion.style.display = 'none';
          screenDni.style.display = 'block';
        });
      });
      
      // Función para agregar un número al DNI
      function agregarNumero(numero) {
        if (dniIngresado.length < 15) {
          dniIngresado += numero;
          console.log('DNI ingresado:', dniIngresado);
          actualizarDisplay();
        }
      }
      
      // Función para eliminar último dígito
      function eliminarUltimo() {
        dniIngresado = dniIngresado.slice(0, -1);
        console.log('DNI después de borrar:', dniIngresado);
        actualizarDisplay();
      }
      
      // Capturar teclas del teclado físico
      document.addEventListener('keydown', (e) => {
        // Verificar si estamos en la pantalla de DNI (no oculta y otras pantallas no activas)
        const screenDniVisible = screenDni && (screenDni.style.display === '' || screenDni.style.display === 'block' || !screenDni.style.display);
        const screenOpcionesActive = screenOpciones.classList.contains('active');
        const screenConfirmacionActive = screenConfirmacion.classList.contains('active');
        
        // Solo procesar si estamos en la pantalla de DNI
        if (screenDniVisible && !screenOpcionesActive && !screenConfirmacionActive) {
          console.log('Tecla presionada en pantalla DNI:', e.key);
          
          // Si es un número (0-9)
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            e.stopPropagation();
            agregarNumero(e.key);
          }
          // Si es Backspace o Delete
          else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            e.stopPropagation();
            eliminarUltimo();
          }
          // Si es Enter y hay DNI ingresado
          else if (e.key === 'Enter' && dniIngresado.length > 0 && btnContinuar && !btnContinuar.disabled) {
            e.preventDefault();
            e.stopPropagation();
            btnContinuar.click();
          }
        }
      });
      
      // Teclado numérico virtual
      const keypadButtons = document.querySelectorAll('.keypad-btn[data-number]');
      keypadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const number = btn.getAttribute('data-number');
          console.log('Tecla virtual presionada:', number);
          agregarNumero(number);
        });
      });
      
      // Botón eliminar virtual
      if (btnDelete) {
        btnDelete.addEventListener('click', (e) => {
          e.preventDefault();
          eliminarUltimo();
        });
      }
      
      // Actualizar display del DNI
      function actualizarDisplay() {
        if (!dniDisplay) {
          console.error('dniDisplay no encontrado');
          return;
        }
        
        if (dniIngresado.length === 0) {
          dniDisplay.textContent = '';
          dniDisplay.classList.add('empty');
          if (btnContinuar) {
            btnContinuar.disabled = true;
            btnContinuar.classList.remove('active');
          }
        } else {
          // Mostrar el DNI con formato
          dniDisplay.textContent = dniIngresado;
          dniDisplay.classList.remove('empty');
          if (btnContinuar) {
            btnContinuar.disabled = false;
            btnContinuar.classList.add('active');
          }
        }
        console.log('Display actualizado. DNI:', dniIngresado, 'Texto en display:', dniDisplay.textContent);
      }
      
      // Botón continuar - según tipo de atención
      btnContinuar.addEventListener('click', () => {
        if (dniIngresado.length === 0) return;
        
        screenDni.style.display = 'none';
        
        if (tipoAtencion === 'cita') {
          // Flujo Citas: mostrar cita de Cardiología con Check-in
          document.getElementById('dniCitaDisplay').textContent = dniIngresado;
          screenCitaCardiologia.style.display = 'block';
        } else if (tipoAtencion === 'demanda') {
          // Flujo Demanda espontánea: mostrar Nutrición, Laboratorio, Clínico
          screenDemandaOpciones.style.display = 'block';
        }
      });
      
      // Botón Check-in (Cita Cardiología) → forma de pago
      document.getElementById('btnCheckin').addEventListener('click', () => {
        abrirPantallaPago('cita', null);
      });
      
      // Opciones Demanda espontánea (Nutrición, Laboratorio, Clínico) → forma de pago
      document.querySelectorAll('.opcion-demanda').forEach(card => {
        card.addEventListener('click', () => {
          const especialidad = card.getAttribute('data-especialidad');
          abrirPantallaPago('demanda', especialidad);
        });
      });
      
      // Pago con QR: simular QR y a los 5 s ir al paso final
      const btnPagoQr = document.getElementById('btnPagoQr');
      const btnPagoCaja = document.getElementById('btnPagoCaja');
      if (btnPagoQr) {
        btnPagoQr.addEventListener('click', () => {
          if (pagoQrTimerId) return;
          const row = document.getElementById('pagoOpcionesRow');
          const qr = document.getElementById('pagoQrSimulacion');
          if (row) row.style.display = 'none';
          if (qr) qr.style.display = 'block';
          btnPagoQr.classList.add('disabled');
          if (btnPagoCaja) btnPagoCaja.classList.add('disabled');
          pagoQrTimerId = setTimeout(async function () {
            pagoQrTimerId = null;
            try {
              var dataFv = await enqueueTotemSaludFilaVirtual();
              cerrarPagoYMostrarConfirmacionFinalQr(dataFv);
            } catch (err) {
              console.error('Error fila virtual (QR):', err);
              alert('Error: ' + err.message);
            }
          }, 5000);
        });
      }
      if (btnPagoCaja) {
        btnPagoCaja.addEventListener('click', async () => {
          if (pagoQrTimerId) return;
          await solicitarAtencionPresencialDirecta();
        });
      }
      
      // Mostrar pantalla de opciones (Educación: Matrícula, Certificados, Becas)
      function mostrarPantallaOpciones() {
        screenDni.style.display = 'none';
        screenOpciones.classList.add('active');
        
        opcionesGrid.innerHTML = '';
        
        // Cambiar el título y subtítulo
        const screenOpcionesTitle = screenOpciones.querySelector('h2');
        const screenOpcionesSubtitle = screenOpciones.querySelector('.subtitle');
        if (screenOpcionesTitle) {
          screenOpcionesTitle.textContent = '¿En qué tema de educación podemos ayudarlo?';
        }
        if (screenOpcionesSubtitle) {
          screenOpcionesSubtitle.textContent = 'Seleccione el tema que necesita';
        }
        
        // Opción Matrícula e inscripción
        const cardMatricula = document.createElement('div');
        cardMatricula.className = 'opcion-card totem-option-card--demand is-clickable';
        cardMatricula.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
            <i class="bi bi-journal-bookmark"></i>
          </div>
          <div class="opcion-title">Matrícula e inscripción</div>
        `;
        cardMatricula.addEventListener('click', async () => {
          await llamarAgenteConOpcionTotem('matricula');
        });
        opcionesGrid.appendChild(cardMatricula);
        
        // Opción Certificados y trámites
        const cardCertificados = document.createElement('div');
        cardCertificados.className = 'opcion-card totem-option-card--demand is-clickable';
        cardCertificados.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div class="opcion-title">Certificados y trámites</div>
        `;
        cardCertificados.addEventListener('click', async () => {
          await llamarAgenteConOpcionTotem('certificados');
        });
        opcionesGrid.appendChild(cardCertificados);
        
        // Opción Becas y financiamiento
        const cardBecas = document.createElement('div');
        cardBecas.className = 'opcion-card totem-option-card--demand is-clickable';
        cardBecas.innerHTML = `
          <div class="opcion-icon totem-icon--primary">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="opcion-title">Becas y financiamiento</div>
        `;
        cardBecas.addEventListener('click', async () => {
          await llamarAgenteConOpcionTotem('becas');
        });
        opcionesGrid.appendChild(cardBecas);
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
        
        // Mostrar opciones (Educación)
        opcionesPresencialContainer.innerHTML = `
          <div class="totem-panel">
            <h3 class="totem-panel-title">¿En qué tema de educación podemos ayudarlo?</h3>
            <div class="totem-panel-grid">
              <div class="opcion-card is-clickable" data-opcion="matricula">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-journal-bookmark"></i>
                </div>
                <div class="opcion-title">Matrícula e inscripción</div>
              </div>
              <div class="opcion-card is-clickable" data-opcion="certificados">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-file-earmark-text"></i>
                </div>
                <div class="opcion-title">Certificados y trámites</div>
              </div>
              <div class="opcion-card is-clickable" data-opcion="becas">
                <div class="opcion-icon totem-icon--primary">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <div class="opcion-title">Becas y financiamiento</div>
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
      
      async function llamarAgenteConOpcionTotem(opcion) {
        try {
          cancelarSimulacionPasosAgente();
          // Ocultar pantalla de opciones y mostrar loading
          screenOpciones.classList.remove('active');
          
          // Mostrar log
          if (logContainer) {
            logContainer.classList.add('visible');
          }
          
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');
          stepsContainer.innerHTML = '<div class="totem-status"><i class="bi bi-hourglass-split me-2"></i>Conectando con el asistente...</div>';
          
          // Llamar al agente con el DNI ingresado y la opción seleccionada
          const mensaje = `Necesito atención sobre ${opcion}. DNI: ${dniIngresado}`;
          
          const data = await NumiaJourneyApi.runJourney(JOURNEY_FLOW_ID, {
            input_value: mensaje,
            input_type: 'chat'
          });
          console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2));
          
          // Procesar respuesta (similar al código existente)
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
          if (contents.length > 0) {
            stepsContainer.innerHTML = '';
            contents.forEach((content, index) => {
              setTimeout(() => {
                agregarPaso(content, index);
              }, index * 800);
            });
            
            if (messageText) {
              setTimeout(() => {
                mostrarResumen(messageText);
                // Extraer Scoring y detectar si recomienda videollamada
                const scoring = extraerScoring(messageText);
                const textoLower = messageText.toLowerCase();
                
                // Primero verificar si explícitamente dice NO o Presencial
                const diceNoOPresencial = 
                  textoLower.includes('sugerir videollamada: no') ||
                  textoLower.includes('sugerir videollamada:no') ||
                  textoLower.includes('**sugerir videollamada:** no') ||
                  textoLower.includes('**sugerir videollamada:**no') ||
                  (textoLower.includes('tipo de atención sugerida:') && textoLower.includes('presencial')) ||
                  (textoLower.includes('tipo de atención sugerida') && textoLower.includes('presencial'));
                
                // Solo detectar videollamada si NO dice explícitamente NO o Presencial
                let tieneVideollamadaTexto = false;
                if (!diceNoOPresencial) {
                  // Detectar múltiples variaciones del texto de sugerencia de videollamada
                  tieneVideollamadaTexto = 
                    // Variaciones con guión y SÍ
                    textoLower.includes('- sugerir videollamada: si') ||
                    textoLower.includes('- sugerir videollamada: sí') ||
                    textoLower.includes('sugerir videollamada: si') ||
                    textoLower.includes('sugerir videollamada: sí') ||
                    // Variaciones con asteriscos (markdown) y SÍ
                    textoLower.includes('**sugerir videollamada:** si') ||
                    textoLower.includes('**sugerir videollamada:** sí') ||
                    textoLower.includes('**sugerir videollamada:**si') ||
                    textoLower.includes('**sugerir videollamada:**sí') ||
                    // Detectar "Tipo de atención sugerida: Videollamada" (debe estar juntos)
                    textoLower.includes('tipo de atención sugerida: videollamada') ||
                    textoLower.includes('tipo de atención sugerida:videollamada');
                }
                
                // Mostrar videollamada si el texto lo sugiere O si el Scoring > 640 (estricto, no >=)
                const tieneVideollamada = tieneVideollamadaTexto || (scoring !== null && scoring > 640);
                recomendacionVideollamada = tieneVideollamada;
                console.log('Scoring extraído:', scoring, 'Dice NO/Presencial:', diceNoOPresencial, 'Videollamada por texto:', tieneVideollamadaTexto, 'Videollamada recomendada:', tieneVideollamada);
                console.log('Texto completo para debugging:', messageText.substring(0, 500));
                // Mostrar opciones de videollamada/presencial después del análisis o confirmación directa
                setTimeout(() => {
                  if (tieneVideollamada) {
                    mostrarOpcionesAtencion();
                  } else {
                    // Si no hay recomendación de videollamada, solicitar atención presencial directamente
                    solicitarAtencionPresencialDirecta();
                  }
                }, 1000);
              }, contents.length * 800 + 500);
            } else {
              setTimeout(function () {
                mostrarConclusionesFinalesAgente(null);
                recomendacionVideollamada = false;
                setTimeout(function () {
                  solicitarAtencionPresencialDirecta();
                }, 1000);
              }, contents.length * 800 + 500);
            }
          } else {
            if (messageText) {
              mostrarResumen(messageText);
              // Extraer Scoring y detectar si recomienda videollamada
              const scoring = extraerScoring(messageText);
              const textoLower = messageText.toLowerCase();
              // Detectar múltiples variaciones del texto de sugerencia de videollamada
              const tieneVideollamadaTexto = 
                // Variaciones con guión
                textoLower.includes('- sugerir videollamada: si') ||
                textoLower.includes('- sugerir videollamada: sí') ||
                textoLower.includes('sugerir videollamada: si') ||
                textoLower.includes('sugerir videollamada: sí') ||
                // Variaciones con asteriscos (markdown)
                textoLower.includes('**sugerir videollamada:** si') ||
                textoLower.includes('**sugerir videollamada:** sí') ||
                textoLower.includes('**sugerir videollamada:**si') ||
                textoLower.includes('**sugerir videollamada:**sí') ||
                // Detectar "Tipo de atención sugerida: Videollamada"
                (textoLower.includes('tipo de atención sugerida') && textoLower.includes('videollamada')) ||
                (textoLower.includes('tipo de atención sugerida:') && textoLower.includes('videollamada'));
              // Mostrar videollamada si el texto lo sugiere O si el Scoring > 640
              const tieneVideollamada = tieneVideollamadaTexto || (scoring !== null && scoring > 640);
              recomendacionVideollamada = tieneVideollamada;
              console.log('Scoring extraído:', scoring, 'Videollamada recomendada:', tieneVideollamada);
              // Mostrar opciones de videollamada/presencial después del análisis o confirmación directa
              setTimeout(() => {
                if (tieneVideollamada) {
                  mostrarOpcionesAtencion();
                } else {
                  // Si no hay recomendación de videollamada, solicitar atención presencial directamente
                  solicitarAtencionPresencialDirecta();
                }
              }, 1000);
            }
          }
          
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
      
      // Solicitar atención presencial directamente (cuando no hay recomendación de videollamada o pago en caja)
      async function solicitarAtencionPresencialDirecta() {
        try {
          if (pagoQrTimerId) {
            clearTimeout(pagoQrTimerId);
            pagoQrTimerId = null;
          }
          if (screenPago) {
            screenPago.style.display = 'none';
            resetVistaPago();
          }
          const data = await enqueueTotemSaludFilaVirtual();
          console.log('Respuesta de la API presencial:', data);
          mostrarPantallaConfirmacionPresencial(data);
        } catch (err) {
          console.error('Error al solicitar atención presencial:', err);
          alert(`Error: ${err.message}`);
        }
      }
      
      // Solicitar atención
      async function solicitarAtencion(tipo) {
        try {
          const queueId = tipo === 'videollamada' ? '16223' : '16221';
          const data = await FilaVirtualApi.enqueue(queueId, '10750', buildDatosEnqueueTotem(dniIngresado));
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
        if (screenPago) {
          screenPago.style.display = 'none';
          resetVistaPago();
        }
        screenConfirmacion.classList.add('active');
        
        var nbFv = document.getElementById('numeroTurnoBlock');
        if (nbFv) nbFv.style.display = 'none';
        document.getElementById('videoLinkContainer').style.display = 'none';
        
        document.getElementById('tiempoEsperaValor').textContent = TIEMPO_ESPERA_CONFIRMACION_TEXTO;
        document.getElementById('tiempoEspera').style.display = 'block';
        
        // Mostrar enlace de videollamada si aplica
        if (tipo === 'videollamada' && data && data.videoCallUrl) {
          const videoUrl = data.videoCallUrl + (data.videoCallUrl.includes('?') ? '&' : '?') + 'videocallUser=mobile';
          document.getElementById('videoLinkContainer').style.display = 'block';
          document.getElementById('btnVideoLink').href = videoUrl;
        }
      }
      
      // Mostrar pantalla de confirmación presencial (cuando no hay videollamada recomendada)
      function mostrarPantallaConfirmacionPresencial(apiData) {
        screenOpciones.classList.remove('active');
        if (screenPago) {
          screenPago.style.display = 'none';
          resetVistaPago();
        }
        screenConfirmacion.classList.add('active');
        document.getElementById('videoLinkContainer').style.display = 'none';
        resetBloquesTurnoYEsperaConfirmacion();
        
        const confirmacionTitle = screenConfirmacion.querySelector('h2');
        const confirmacionMessage = screenConfirmacion.querySelector('.message');
        
        if (confirmacionTitle) {
          confirmacionTitle.textContent = 'Tu turno fue asignado';
        }
        
        if (confirmacionMessage) {
          confirmacionMessage.innerHTML = `
            Lo llamaremos por su DNI: <strong>${dniIngresado}</strong>
          `;
        }
        if (apiData) aplicarTurnoYEsperaEnConfirmacion(apiData);
      }
      
      // Función para extraer el Scoring del mensaje
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
      
      // Funciones auxiliares (copiadas de app-cliente.html)
      function agregarPaso(content, index) {
        try {
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
              <em class="totem-status">Herramienta ejecutada correctamente</em>
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
      
      function mostrarConclusionesFinalesAgente(resumenOpcional) {
        if (!summaryContent || !summarySection) return;
        var html = '';
        if (resumenOpcional != null && resumenOpcional !== '') {
          var t = typeof resumenOpcional === 'string' ? resumenOpcional : (resumenOpcional.message || JSON.stringify(resumenOpcional, null, 2));
          html += '<div class="summary-resumen-api">' + escapeHtml(t) + '</div>';
        }
        html += '<div class="agent-conclusions">';
        html += '<div class="agent-conclusions-title">Conclusiones del agente</div>';
        var textoConc = CONCLUSIONES_AGENTE_TEXTO;
        var posNegrita = textoConc.indexOf(CONCLUSIONES_AGENTE_FRASE_NEGRITA);
        var innerConclusiones = posNegrita < 0
          ? escapeHtml(textoConc)
          : escapeHtml(textoConc.substring(0, posNegrita)) + '<strong>' + escapeHtml(CONCLUSIONES_AGENTE_FRASE_NEGRITA) + '</strong>' + escapeHtml(textoConc.substring(posNegrita + CONCLUSIONES_AGENTE_FRASE_NEGRITA.length));
        html += '<p class="agent-conclusions-text">' + innerConclusiones + '</p>';
        html += '</div>';
        summaryContent.innerHTML = html;
        summarySection.style.display = 'block';
        var logContentEl = document.querySelector('.log-content');
        if (logContentEl) logContentEl.scrollTop = logContentEl.scrollHeight;
      }
      
      function mostrarResumen(message) {
        try {
          mostrarConclusionesFinalesAgente(
            typeof message === 'string' ? message : (message && (message.message || JSON.stringify(message, null, 2)))
          );
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
