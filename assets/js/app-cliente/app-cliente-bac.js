// Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
      // Configuración de la API Journey Builder
      const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.APP_CLIENTE;
      const PASOS_ANALISIS_UI = [
        { titulo: 'Comportamiento digital', detalle: 'Evaluación de onboarding y señales digitales.' },
        { titulo: 'Scoring', detalle: 'Puntuación y mejor oferta disponible.' },
        { titulo: 'Sugerencia de canal', detalle: 'Priorización del canal de atención.' },
        { titulo: 'Calcular prioridad', detalle: 'Analisis del estado actual de la sucursal comparado con el cliente.' }
      ];
// Función para obtener el nombre actual
      function getNombreActual() {
        const selector = document.getElementById('nombreSelector');
        return selector ? selector.value : 'Jorge';
      }
      
      // Manejar cambio de nombre en el selector
      const nombreSelector = document.getElementById('nombreSelector');
      const saludoNombre = document.getElementById('saludoNombre');
      
      if (nombreSelector && saludoNombre) {
        nombreSelector.addEventListener('change', function() {
          const nombreSeleccionado = this.value;
          saludoNombre.textContent = `¡Hola, ${nombreSeleccionado}!`;
          var saludoVisible = document.getElementById('saludoNombreVisible');
          if (saludoVisible) saludoVisible.textContent = nombreSeleccionado;
        });
        
        saludoNombre.textContent = `¡Hola, ${nombreSelector.value}!`;
        var saludoVisibleInit = document.getElementById('saludoNombreVisible');
        if (saludoVisibleInit) saludoVisibleInit.textContent = nombreSelector.value;
      }

      var btnSolicitarAtencionVisible = document.getElementById('btnSolicitarAtencionVisible');
      if (btnSolicitarAtencionVisible) {
        btnSolicitarAtencionVisible.addEventListener('click', function() {
          var btn = document.getElementById('btnSolicitarAtencion');
          if (btn) btn.click();
        });
      }

      var btnToggleBalance = document.getElementById('btnToggleBalance');
      var balanceDisplay = document.getElementById('balanceDisplay');
      if (btnToggleBalance && balanceDisplay) {
        var balanceVisible = true;
        var balanceReal = balanceDisplay.textContent;
        btnToggleBalance.addEventListener('click', function() {
          balanceVisible = !balanceVisible;
          balanceDisplay.textContent = balanceVisible ? balanceReal : '$ ••••••';
          btnToggleBalance.innerHTML = balanceVisible
            ? '<i class="bi bi-eye"></i>'
            : '<i class="bi bi-eye-slash"></i>';
        });
      }

      // Elementos del DOM
      const btnSolicitarAtencion = document.getElementById('btnSolicitarAtencion');
      const atencionSection = document.getElementById('atencionSection');
      const stepsContainer = document.getElementById('stepsContainer');
      const summarySection = document.getElementById('summarySection');
      const summaryContent = document.getElementById('summaryContent');
      const opcionesAtencionSection = document.getElementById('opcionesAtencionSection');
      const opcionesAtencionContainer = document.getElementById('opcionesAtencionContainer');
      const resultadoAtencionApp = document.getElementById('resultadoAtencionApp');

      // Verificar que todos los elementos existan
      if (!btnSolicitarAtencion || !atencionSection || !stepsContainer || !summarySection || !summaryContent || !opcionesAtencionSection || !opcionesAtencionContainer || !resultadoAtencionApp) {
        console.error('Error: No se encontraron todos los elementos del DOM');
        return;
      }

      // DNI fijo a usar
      const DNI_FIJO = '12345678';

      const DETALLE_EXTRA_FIELDS_DEFAULT = 'El cliente registra un Score crediticio >700. Adicionalmente registro el abandono de un proceso de oboarding digital. Se recomienda ofrecer Prestamo personal';
      let ultimoDetalleExtraFields = DETALLE_EXTRA_FIELDS_DEFAULT;

      function buildExtraFields(detalle) {
        return [{
          showable: [{ in: 'workstation', format: 'both' }],
          Detalle: detalle
        }];
      }

      async function buildDatosEnqueue(nombreActual) {
        return NumiaDemoUsers.fetchEnqueueBody(
          nombreActual,
          buildExtraFields(ultimoDetalleExtraFields || DETALLE_EXTRA_FIELDS_DEFAULT)
        );
      }

      // Event listener para el botón "Estoy en la sucursal"
      btnSolicitarAtencion.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Mostrar el menú de opciones (el botón ya está en el header)
        menuOpcionesPresencial.style.display = 'block';
        
        // Scroll al menú
        setTimeout(() => {
          menuOpcionesPresencial.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      });
      
      // Event listeners para las opciones del menú
      btnOpcionPrestamos.addEventListener('click', async () => {
        await llamarAgenteConOpcionDesdeMenu('prestamos', btnOpcionPrestamos);
      });
      
      btnOpcionTarjetas.addEventListener('click', async () => {
        await llamarAgenteConOpcionDesdeMenu('tarjetas', btnOpcionTarjetas);
      });
      
      btnOpcionInversiones.addEventListener('click', async () => {
        await llamarAgenteConOpcionDesdeMenu('inversiones', btnOpcionInversiones);
      });
      
      // Función para llamar al agente desde el menú inicial
      async function llamarAgenteConOpcionDesdeMenu(opcion, btn) {
        try {
          btn.disabled = true;
          if (opcion === 'inversiones') {
            try {
              window.open('app-inversion-bdb.html#cdt', '_blank');
            } catch (eOpen) {}
          }
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Conectando...';
          
          // Ocultar el menú
          menuOpcionesPresencial.style.display = 'none';
          
          const dni = DNI_FIJO;
          
          // Construir mensaje con la opción seleccionada
          const opcionesTexto = {
            prestamos: 'Préstamos',
            tarjetas: 'Tarjetas de crédito',
            inversiones: 'Inversiones'
          };
          const mensaje = `Necesito atención sobre ${opcionesTexto[opcion]}. DNI: ${dni}`;
          
          // Mostrar el contenedor de logs
          const logContainer = document.querySelector('.log-container');
          if (logContainer) {
            logContainer.classList.add('visible');
          }
          
          // Mostrar la sección explícitamente
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');

          summarySection.style.display = 'none';
          summaryContent.innerHTML = '';

          const pasosInicio = Date.now();
          const delayPaso = 800;
          const nPasos = PASOS_ANALISIS_UI.length;
          const pasosAnimacionMs = nPasos * delayPaso + 500;

          stepsContainer.innerHTML = '';
          stepsContainer.style.display = 'block';
          stepsContainer.style.visibility = 'visible';
          stepsContainer.style.opacity = '1';

          PASOS_ANALISIS_UI.forEach((paso, index) => {
            setTimeout(() => {
              agregarPaso({ name: paso.titulo, output: paso.detalle }, index);
            }, index * delayPaso);
          });

          setTimeout(() => {
            const logContent = document.querySelector('.log-content');
            if (logContent) {
              logContent.scrollTop = logContent.scrollHeight;
            }
          }, 100);

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
            console.log('Message text (análisis API):', messageText);
          } catch (apiErr) {
            const transcurrido = Date.now() - pasosInicio;
            await new Promise(function(resolve) { setTimeout(resolve, Math.max(0, pasosAnimacionMs - transcurrido)); });
            throw apiErr;
          }

          const transcurridoFin = Date.now() - pasosInicio;
          await new Promise(function(resolve) { setTimeout(resolve, Math.max(0, pasosAnimacionMs - transcurridoFin)); });

          mostrarResumen(messageText || 'No se recibió el texto de análisis de la API.');
        
      } catch (err) {
        console.error('Error completo:', err);
        // Asegurar que el contenedor de logs esté visible incluso en caso de error
        const logContainer = document.querySelector('.log-container');
        if (logContainer) {
          logContainer.classList.add('visible');
        }
        // Asegurar que la sección esté visible incluso en caso de error
        atencionSection.style.display = 'block';
        atencionSection.classList.add('active');
        stepsContainer.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error al procesar la solicitud: ${err.message}
            <br><small>Revisa la consola para más detalles.</small>
          </div>
        `;
        } finally {
          btn.disabled = false;
          // Restaurar texto del botón según la opción
          const textosBotones = {
            prestamos: '<i class="bi bi-cash-coin me-2"></i>Préstamos',
            tarjetas: '<i class="bi bi-credit-card me-2"></i>Tarjetas de crédito',
            inversiones: '<i class="bi bi-graph-up-arrow me-2"></i>Inversiones'
          };
          btn.innerHTML = textosBotones[opcion];
        }
      }
      
      function extraerInfoDeObjeto(obj, nivel = 0) {
        if (nivel > 2) return ''; // Limitar profundidad
        
        const lineas = [];
        
        // Extraer información útil del objeto
        if (obj.id) lineas.push(`ID: ${obj.id}`);
        if (obj.firstName || obj.first_name) lineas.push(`Nombre: ${obj.firstName || obj.first_name}`);
        if (obj.lastName || obj.last_name) lineas.push(`Apellido: ${obj.lastName || obj.last_name}`);
        if (obj.dni) lineas.push(`DNI: ${obj.dni}`);
        if (obj.email) lineas.push(`Email: ${obj.email}`);
        if (obj.phone || obj.telefono) lineas.push(`Teléfono: ${obj.phone || obj.telefono}`);
        if (obj.score) lineas.push(`Score: ${obj.score}`);
        if (obj.status) lineas.push(`Estado: ${obj.status}`);
        if (obj.ok !== undefined) lineas.push(`Estado: ${obj.ok ? 'OK' : 'Error'}`);
        if (obj.exists !== undefined) lineas.push(`Existe: ${obj.exists ? 'Sí' : 'No'}`);
        
        // Manejar objetos anidados importantes
        if (obj.customerType && typeof obj.customerType === 'object') {
          if (obj.customerType.name) lineas.push(`Tipo de cliente: ${obj.customerType.name}`);
          if (obj.customerType.priority) lineas.push(`Prioridad: ${obj.customerType.priority}`);
        }
        
        if (obj.value && typeof obj.value === 'object') {
          if (obj.value.segment) lineas.push(`Segmento: ${obj.value.segment}`);
          if (obj.value.products && Array.isArray(obj.value.products)) {
            obj.value.products.forEach((product, idx) => {
              if (product.name) lineas.push(`Producto ${idx + 1}: ${product.name}`);
              if (product.max_amount) lineas.push(`  - Monto máximo: $${product.max_amount.toLocaleString()}`);
              if (product.rate_apr) lineas.push(`  - Tasa APR: ${product.rate_apr}%`);
            });
          }
        }
        
        return lineas.join('\n');
      }
      
      function formatearOutputConversacional(output) {
        if (!output) return '';
        
        let texto = '';
        
        // Si es un string, verificar si contiene JSON
        if (typeof output === 'string') {
          // Si parece ser JSON (contiene { o [), intentar parsearlo
          if ((output.includes('{') && output.includes('}')) || (output.includes('[') && output.includes(']'))) {
            try {
              // Intentar parsear como JSON
              const parsed = JSON.parse(output);
              texto = extraerInfoDeObjeto(parsed);
              
              // Si no se extrajo nada útil, buscar campos comunes
              if (!texto) {
                texto = parsed.text || parsed.message || parsed.response?.raw || '';
              }
            } catch (e) {
              // Si no es JSON válido pero tiene estructura tipo diccionario Python
              // Intentar extraer información útil sin parsear
              const match = output.match(/'(\w+)':\s*([^,}]+)/g);
              if (match) {
                const info = [];
                match.forEach(m => {
                  const keyMatch = m.match(/'(\w+)':/);
                  const valueMatch = m.match(/:\s*(.+)/);
                  if (keyMatch && valueMatch) {
                    const key = keyMatch[1];
                    let value = valueMatch[1].trim().replace(/^'|'$/g, '');
                    
                    // Solo mostrar campos útiles
                    if (['id', 'firstName', 'lastName', 'dni', 'email', 'phone', 'name', 'score', 'status'].includes(key)) {
                      info.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
                    }
                  }
                });
                texto = info.join('\n');
              } else {
                // Si tiene ✅ o mensajes útiles, mantenerlos
                if (output.includes('✅') || output.includes('Cliente') || output.includes('actualizado')) {
                  // Extraer solo las líneas útiles, sin el JSON
                  const lineas = output.split('\n').filter(l => 
                    l.includes('✅') || 
                    l.includes('Cliente') || 
                    l.includes('DNI:') || 
                    l.includes('Nombre') ||
                    l.includes('Score') ||
                    l.includes('actualizado') ||
                    (!l.includes('{') && !l.includes('}') && !l.includes("'id'") && !l.includes("'firstName'"))
                  );
                  texto = lineas.join('\n');
                } else {
                  // Si no hay nada útil, no mostrar nada
                  texto = '';
                }
              }
            }
          } else {
            // Si no parece JSON, usar el texto directamente
            texto = output;
          }
        } 
        // Si es un objeto, extraer información útil
        else if (typeof output === 'object') {
          texto = extraerInfoDeObjeto(output);
          
          // Si no se extrajo nada, buscar campos comunes
          if (!texto) {
            texto = output.text || output.message || output.response?.raw || '';
          }
        } else {
          texto = String(output);
        }
        
        // Si después de todo el procesamiento no hay texto útil, no mostrar nada
        if (!texto || texto.trim() === '') {
          return '<div class="conversation-output"><div class="conversation-line"><em class="ac-muted">Información procesada correctamente</em></div></div>';
        }
        
        // Formatear como conversación - dividir por líneas y formatear
        const lineas = texto.split('\n');
        let html = '<div class="conversation-output">';
        
        lineas.forEach(linea => {
          linea = linea.trim();
          if (!linea) {
            html += '<div class="ac-spacer-sm"></div>'; // Espacio entre párrafos
            return;
          }
          
          // Detectar diferentes tipos de información
          if (linea.startsWith('✅') || linea.startsWith('✓')) {
            html += `<div class="conversation-line success"><i class="bi bi-check-circle-fill me-2"></i>${escapeHtml(linea.replace(/^[✅✓]\s*/, ''))}</div>`;
          } else if (linea.startsWith('❌') || linea.startsWith('✗')) {
            html += `<div class="conversation-line error"><i class="bi bi-x-circle-fill me-2"></i>${escapeHtml(linea.replace(/^[❌✗]\s*/, ''))}</div>`;
          } else if (linea.match(/^\*\*.*\*\*:/)) {
            // Títulos con markdown **texto:**
            const titulo = linea.replace(/\*\*/g, '').replace(':', '');
            html += `<div class="conversation-line title"><strong>${escapeHtml(titulo)}</strong></div>`;
          } else if (linea.includes(':') && !linea.includes('{') && !linea.includes('}') && !linea.includes("'")) {
            const [key, ...valueParts] = linea.split(':');
            const value = valueParts.join(':').trim();
            html += `<div class="conversation-line info"><strong>${escapeHtml(key.trim())}:</strong> <span>${escapeHtml(value)}</span></div>`;
          } else if (linea.match(/^[A-Z][^:{}]*$/) && linea.length < 100 && !linea.includes("'")) {
            html += `<div class="conversation-line title">${escapeHtml(linea)}</div>`;
          } else if (!linea.includes('{') && !linea.includes('}') && !linea.includes("'id'") && !linea.includes("'firstName'")) {
            html += `<div class="conversation-line">${escapeHtml(linea)}</div>`;
          }
        });
        
        html += '</div>';
        return html;
      }
      
      function formatearNombrePasoAmigable(toolName) {
        if (!toolName || typeof toolName !== 'string') return 'Herramienta desconocida';
        const t = toolName.trim();
        if (!t) return 'Herramienta desconocida';
        // Frases con espacios ya legibles: no usar /\b\w/g (en JS \w no incluye acentos y rompe palabras como "atención")
        if (/\s/.test(t) && !/[a-z][A-Z]/.test(t)) {
          return t;
        }
        return t
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      function agregarPaso(content, index) {
        try {
          console.log(`Agregando paso ${index}:`, content);
          
          const stepItem = document.createElement('div');
          stepItem.className = 'step-item processing';
          stepItem.style.display = 'block';
          stepItem.style.visibility = 'visible';
          stepItem.style.opacity = '0';
          stepItem.style.transition = 'opacity 0.5s ease-in';
          stepItem.style.minHeight = '50px';
          
          // Obtener solo el nombre de la herramienta
          const toolName = content.name || 
                          content.tool_name || 
                          content.tool_use?.name || 
                          'Herramienta desconocida';
          
          const friendlyName = formatearNombrePasoAmigable(toolName);
          
          // Obtener el output - buscar en diferentes ubicaciones
          let toolOutput = content.output || 
                          content.tool_use?.output || 
                          '';
          
          // Si el output es un objeto, intentar extraer el texto conversacional
          if (toolOutput && typeof toolOutput === 'object') {
            // Priorizar campos que contengan texto conversacional
            toolOutput = toolOutput.text || 
                        toolOutput.message || 
                        toolOutput.response?.raw ||
                        toolOutput.response ||
                        '';
            
            // Si aún es un objeto y no tiene campos de texto, intentar extraer información útil
            if (toolOutput && typeof toolOutput === 'object') {
              // Para algunos outputs, puede ser un string dentro de un objeto
              if (toolOutput.value) {
                toolOutput = typeof toolOutput.value === 'string' ? toolOutput.value : JSON.stringify(toolOutput.value);
              } else {
                // Intentar extraer solo campos útiles
                const camposUtiles = [];
                if (toolOutput.ok !== undefined) camposUtiles.push(`Estado: ${toolOutput.ok ? 'OK' : 'Error'}`);
                if (toolOutput.score) camposUtiles.push(`Score: ${toolOutput.score}`);
                if (toolOutput.dni) camposUtiles.push(`DNI: ${toolOutput.dni}`);
                
                toolOutput = camposUtiles.length > 0 ? camposUtiles.join('\n') : '';
              }
            }
          }
          
          console.log(`Paso ${index}: ${friendlyName}`, `Output:`, toolOutput);
          
          // Formatear el output de manera conversacional
          let outputHtml = '';
          if (toolOutput && typeof toolOutput === 'string' && toolOutput.trim()) {
            outputHtml = `
              <div class="step-output-content">
                ${formatearOutputConversacional(toolOutput)}
              </div>
            `;
          } else {
            // Si no hay output o es muy complejo, mostrar solo el nombre de la herramienta ejecutada
            outputHtml = '<div class="step-output-content"><em class="ac-muted">Herramienta ejecutada correctamente</em></div>';
          }
          
          stepItem.innerHTML = `
            <div class="step-header">
              <div class="step-icon tool">
                <i class="bi bi-gear"></i>
              </div>
              <div class="ac-flex-1">
                <div class="step-title">${escapeHtml(friendlyName)}</div>
                <div class="step-duration">Paso ${index + 1}</div>
              </div>
            </div>
            <div class="step-content">
              ${outputHtml}
            </div>
          `;
          
          // Asegurar que el contenedor esté visible y agregar el elemento
          if (stepsContainer) {
            stepsContainer.style.display = 'block';
            stepsContainer.style.visibility = 'visible';
            stepsContainer.style.opacity = '1';
            stepsContainer.appendChild(stepItem);
            
            // Scroll automático al final del log
            setTimeout(() => {
              const logContent = document.querySelector('.log-content');
              if (logContent) {
                logContent.scrollTop = logContent.scrollHeight;
              }
            }, 100);
            
            // Animar la aparición
            setTimeout(() => {
              stepItem.style.opacity = '1';
            }, 50);
            
            console.log(`Paso ${index} agregado al DOM: ${friendlyName}`);
            
            // Marcar como completado después de un breve delay
            setTimeout(() => {
              stepItem.classList.remove('processing');
              stepItem.classList.add('completed');
              const icon = stepItem.querySelector('.step-icon');
              if (icon) {
                icon.className = 'step-icon completed';
                icon.innerHTML = '<i class="bi bi-check-circle"></i>';
              }
            }, 600);
          } else {
            console.error('stepsContainer no encontrado');
          }
        } catch (err) {
          console.error('Error al agregar paso:', err, content);
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
    
      function mostrarResumen(message) {
        try {
          const messageText = typeof message === 'string' ? message : (message.message || JSON.stringify(message, null, 2));
          if (messageText && !messageText.startsWith('No se recibió el texto de análisis')) {
            ultimoDetalleExtraFields = messageText;
          }
          
          // Extraer Scoring y detectar si recomienda videollamada
          const scoring = extraerScoring(messageText);
          const tieneVideollamadaTexto = (messageText.includes('**Tipo de atención sugerida**:') && 
                                         (messageText.toLowerCase().includes('videollamada') || messageText.toLowerCase().includes('video llamada'))) ||
                                         messageText.includes('- Sugerir videollamada: Si') || 
                                         messageText.includes('- Sugerir videollamada:Si') ||
                                         messageText.toLowerCase().includes('- sugerir videollamada: si');
          // Mostrar videollamada si el texto lo sugiere O si el Scoring > 640
          const tieneVideollamada = tieneVideollamadaTexto || (scoring !== null && scoring > 640);
          console.log('Scoring extraído:', scoring, 'Videollamada recomendada:', tieneVideollamada);
          
          // Mostrar el resumen en el log
          summaryContent.innerHTML = '';
          const resumenTexto = document.createElement('div');
          resumenTexto.textContent = messageText;
          resumenTexto.style.marginBottom = '1rem';
          summaryContent.appendChild(resumenTexto);
          summarySection.style.display = 'block';
          
          // Mostrar botones en la APP MÓVIL (no en el log)
          mostrarOpcionesEnApp(tieneVideollamada);
          
          // Scroll automático al final del log
          setTimeout(() => {
            const logContent = document.querySelector('.log-content');
            if (logContent) {
              logContent.scrollTop = logContent.scrollHeight;
            }
          }, 100);
        } catch (err) {
          console.error('Error al mostrar resumen:', err);
        }
      }
      
      function mostrarOpcionesEnApp(tieneVideollamada) {
        // El botón ya está en el header, no necesitamos ocultarlo
        
        // Limpiar contenedor
        opcionesAtencionContainer.innerHTML = '';
        resultadoAtencionApp.style.display = 'none';
        resultadoAtencionApp.innerHTML = '';
        
        // Botón Videollamada (siempre disponible, pero destacado si está recomendada)
        const btnVideollamada = document.createElement('button');
        btnVideollamada.className = 'btn w-100';
        btnVideollamada.style.cssText = 'background-color: var(--numia-success); color: white; border: none; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600; margin-bottom: 0.75rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem;';
        if (tieneVideollamada) {
          btnVideollamada.innerHTML = '<div class="ac-inline-flex-gap-sm"><i class="bi bi-camera-video"></i><span>Videollamada</span></div><span class="ac-caption-xs">✓ Opción recomendada - Menos demora</span>';
        } else {
          btnVideollamada.innerHTML = '<div class="ac-inline-flex-gap-sm"><i class="bi bi-camera-video"></i><span>Videollamada</span></div><span class="ac-caption-xs">Menos demora</span>';
        }
        btnVideollamada.addEventListener('click', async () => {
          await solicitarAtencionApp('videollamada', btnVideollamada);
        });
        opcionesAtencionContainer.appendChild(btnVideollamada);
        
        // Botón Presencial (siempre disponible, más chico y con aclaración de demora)
        const btnPresencial = document.createElement('button');
        btnPresencial.className = 'btn';
        btnPresencial.style.cssText = 'background-color: var(--numia-azul); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; width: auto; margin: 0 auto; font-size: 0.9rem;';
        btnPresencial.innerHTML = '<div class="ac-inline-flex-gap-sm"><i class="bi bi-geo-alt"></i><span>Continuar presencial</span></div><span class="ac-caption-xs">Opción con más demora</span>';
        btnPresencial.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Botón Presencial clickeado');
          await solicitarAtencionPresencial();
        });
        opcionesAtencionContainer.appendChild(btnPresencial);
        
        // Contenedor para opciones presenciales (inicialmente oculto)
        const opcionesPresencialContainer = document.createElement('div');
        opcionesPresencialContainer.id = 'opcionesPresencialContainer';
        opcionesPresencialContainer.style.display = 'none';
        opcionesPresencialContainer.style.marginTop = '1rem';
        opcionesAtencionContainer.appendChild(opcionesPresencialContainer);
        
        // Mostrar la sección
        opcionesAtencionSection.style.display = 'block';
        
        // Scroll a la sección
        setTimeout(() => {
          opcionesAtencionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
      function mostrarOpcionesPresencial() {
        console.log('mostrarOpcionesPresencial llamada');
        const opcionesPresencialContainer = document.getElementById('opcionesPresencialContainer');
        console.log('Contenedor encontrado:', opcionesPresencialContainer);
        if (!opcionesPresencialContainer) {
          console.error('No se encontró el contenedor opcionesPresencialContainer');
          return;
        }
        
        // Si ya está visible, ocultarlo
        if (opcionesPresencialContainer.style.display === 'block') {
          opcionesPresencialContainer.style.display = 'none';
          return;
        }
        
        // Mostrar opciones
        opcionesPresencialContainer.innerHTML = `
          <h4 class="ac-subsection-title">¿Cómo podemos ayudarlo?</h4>
          <div class="ac-stack-sm">
            <button class="btn-opcion-presencial btn w-100 ac-option-btn" data-opcion="prestamos">
              <i class="bi bi-cash-coin me-2"></i>Préstamos
            </button>
            <button class="btn-opcion-presencial btn w-100 ac-option-btn" data-opcion="tarjetas">
              <i class="bi bi-credit-card me-2"></i>Tarjetas
            </button>
            <button class="btn-opcion-presencial btn w-100 ac-option-btn" data-opcion="inversiones">
              <i class="bi bi-graph-up-arrow me-2"></i>Inversiones
            </button>
          </div>
        `;
        opcionesPresencialContainer.style.display = 'block';
        console.log('Opciones mostradas, display:', opcionesPresencialContainer.style.display);
        
        // Agregar event listeners a los botones después de un pequeño delay para asegurar que el DOM esté actualizado
        setTimeout(() => {
          const botonesOpcion = opcionesPresencialContainer.querySelectorAll('.btn-opcion-presencial');
          console.log('Botones encontrados:', botonesOpcion.length);
          botonesOpcion.forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const opcion = btn.getAttribute('data-opcion');
              console.log('Opción seleccionada:', opcion);
              await llamarAgenteConOpcion(opcion, btn);
            });
          });
        }, 100);
      }
      
      async function llamarAgenteConOpcion(opcion, btn) {
        try {
          btn.disabled = true;
          if (opcion === 'inversiones') {
            try {
              window.open('app-inversion-bdb.html#cdt', '_blank');
            } catch (eOpen) {}
          }
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Conectando...';
          
          // Ocultar opciones y mostrar loading
          const opcionesPresencialContainer = document.getElementById('opcionesPresencialContainer');
          if (opcionesPresencialContainer) {
            opcionesPresencialContainer.style.display = 'none';
          }
          
          // Mostrar log
          const logContainer = document.querySelector('.log-container');
          if (logContainer) {
            logContainer.classList.add('visible');
          }
          
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');

          summarySection.style.display = 'none';
          summaryContent.innerHTML = '';

          const pasosInicio = Date.now();
          const delayPaso = 800;
          const nPasos = PASOS_ANALISIS_UI.length;
          const pasosAnimacionMs = nPasos * delayPaso + 500;

          stepsContainer.innerHTML = '';
          stepsContainer.style.display = 'block';

          PASOS_ANALISIS_UI.forEach((paso, index) => {
            setTimeout(() => {
              agregarPaso({ name: paso.titulo, output: paso.detalle }, index);
            }, index * delayPaso);
          });

          const dni = DNI_FIJO;
          const mensaje = `Necesito atención sobre ${opcion}. DNI: ${dni}`;

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

          mostrarResumen(messageText || 'No se recibió el texto de análisis de la API.');
          
        } catch (err) {
          console.error('Error al llamar al agente:', err);
          stepsContainer.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${err.message}</div>`;
        } finally {
          btn.disabled = false;
          const opcionTexto = opcion.charAt(0).toUpperCase() + opcion.slice(1);
          const iconos = {
            prestamos: 'bi-cash-coin',
            tarjetas: 'bi-credit-card',
            inversiones: 'bi-graph-up-arrow'
          };
          btn.innerHTML = `<i class="bi ${iconos[opcion]} me-2"></i>${opcionTexto}`;
        }
      }
      
      async function solicitarAtencionPresencial() {
        try {
          opcionesAtencionSection.style.display = 'none';
          resultadoAtencionApp.style.display = 'block';
          resultadoAtencionApp.innerHTML = '<div class="alert alert-info"><i class="bi bi-hourglass-split me-2"></i>Procesando solicitud...</div>';
          
          const nombreActual = getNombreActual();
          const datos = await buildDatosEnqueue(nombreActual);
          const data = await NumiaDemoUsers.enqueueFilaVirtual('16221', '10750', datos);
          console.log('Respuesta de la API presencial:', data);
          
          resultadoAtencionApp.innerHTML = `
            <div class="alert alert-success mt-3">
              <i class="bi bi-check-circle-fill me-2"></i>
              <strong>Atención presencial solicitada correctamente</strong>
              <p class="mb-0 mt-2">Lo llamaremos con su documento: <strong>${datos.dniMasked || '••••••••'}</strong></p>
            </div>
          `;
          
        } catch (err) {
          console.error('Error al solicitar atención presencial:', err);
          resultadoAtencionApp.innerHTML = `<div class="alert alert-danger mt-3"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${err.message}</div>`;
        }
      }
      
      async function solicitarAtencionApp(tipo, btn) {
        try {
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
          
          resultadoAtencionApp.style.display = 'block';
          resultadoAtencionApp.innerHTML = '<div class="alert alert-info"><i class="bi bi-hourglass-split me-2"></i>Procesando solicitud...</div>';
          
          const queueId = tipo === 'videollamada' ? '16223' : '16221';
          const nombreActual = getNombreActual();
          const datos = await buildDatosEnqueue(nombreActual);
          const data = await NumiaDemoUsers.enqueueFilaVirtual(queueId, '10750', datos);
          console.log('Respuesta de la API:', data);
          
          // Mostrar resultados
          let resultadoHtml = '<div class="alert alert-success mt-3">';
          
          if (data.averageWaitingTime !== undefined) {
            const minutos = Math.floor(data.averageWaitingTime / 60);
            const segundos = data.averageWaitingTime % 60;
            resultadoHtml += `<p class="mb-2"><strong>Tiempo de espera estimado:</strong> ${minutos} min ${segundos} seg</p>`;
          }
          
          if (tipo === 'videollamada' && data.videoCallUrl) {
            const videoUrl = data.videoCallUrl + (data.videoCallUrl.includes('?') ? '&' : '?') + 'videocallUser=mobile';
            resultadoHtml += `
              <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success w-100 mt-2">
                <i class="bi bi-camera-video me-2"></i>Iniciar Videollamada
              </a>
            `;
          } else if (tipo === 'presencial') {
            resultadoHtml += '<p class="mb-0"><i class="bi bi-check-circle me-2"></i>Atención presencial solicitada correctamente</p>';
          }
          
          resultadoHtml += '</div>';
          resultadoAtencionApp.innerHTML = resultadoHtml;
          
        } catch (err) {
          console.error('Error al solicitar atención:', err);
          resultadoAtencionApp.innerHTML = `<div class="alert alert-danger mt-3"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${err.message}</div>`;
        } finally {
          btn.disabled = false;
          if (tipo === 'videollamada') {
            btn.innerHTML = '<i class="bi bi-camera-video"></i>Videollamada';
          } else {
            btn.innerHTML = '<i class="bi bi-geo-alt"></i>Presencial';
          }
        }
      }
      
      async function solicitarAtencion(tipo, btn1, btn2, resultadoContainer) {
        try {
          // Deshabilitar ambos botones
          btn1.disabled = true;
          btn2.disabled = true;
          btn1.style.opacity = '0.6';
          btn2.style.opacity = '0.6';
          
          // Mostrar loading
          resultadoContainer.style.display = 'block';
          resultadoContainer.innerHTML = '<div class="ac-white-text"><i class="bi bi-hourglass-split me-2"></i>Procesando solicitud...</div>';
          
          // Determinar la URL según el tipo
          const queueId = tipo === 'videollamada' ? '16223' : '16221';
          const nombreActual = getNombreActual();
          const datos = await buildDatosEnqueue(nombreActual);
          const data = await NumiaDemoUsers.enqueueFilaVirtual(queueId, '10750', datos);
          console.log('Respuesta de la API:', data);
          
          // Mostrar resultados
          let resultadoHtml = '<div class="ac-result-box">';
          
          // Mostrar tiempo de espera
          if (data.averageWaitingTime !== undefined) {
            const minutos = Math.floor(data.averageWaitingTime / 60);
            const segundos = data.averageWaitingTime % 60;
            resultadoHtml += `<div class="ac-white-text ac-mb-half"><strong>Tiempo de espera estimado:</strong> ${minutos} min ${segundos} seg</div>`;
          }
          
          // Si es videollamada, mostrar el enlace
          if (tipo === 'videollamada' && data.videoCallUrl) {
            const videoUrl = data.videoCallUrl + (data.videoCallUrl.includes('?') ? '&' : '?') + 'videocallUser=mobile';
            resultadoHtml += `
              <div class="ac-mt-1">
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="ac-video-link">
                  <i class="bi bi-camera-video me-2"></i>Iniciar Videollamada
                </a>
              </div>
            `;
          } else if (tipo === 'presencial') {
            resultadoHtml += `<div class="ac-white-text ac-mt-half"><i class="bi bi-check-circle me-2"></i>Atención presencial solicitada correctamente</div>`;
          }
          
          resultadoHtml += '</div>';
          resultadoContainer.innerHTML = resultadoHtml;
          
        } catch (err) {
          console.error('Error al solicitar atención:', err);
          resultadoContainer.innerHTML = `<div class="ac-error-text"><i class="bi bi-exclamation-triangle me-2"></i>Error: ${err.message}</div>`;
        } finally {
          // Rehabilitar botones
          btn1.disabled = false;
          btn2.disabled = false;
          btn1.style.opacity = '1';
          btn2.style.opacity = '1';
        }
      }
      
      function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    });

(function () {
      var screenHome = document.getElementById('bacScreenHome');
      var screenAyuda = document.getElementById('bacScreenAyuda');

      function showHome() {
        if (screenHome) screenHome.classList.add('active');
        if (screenAyuda) screenAyuda.classList.remove('active');
      }

      function showAyuda() {
        if (screenHome) screenHome.classList.remove('active');
        if (screenAyuda) {
          screenAyuda.classList.add('active');
          var body = screenAyuda.querySelector('.bac-ayuda-body');
          if (body) body.scrollTop = 0;
        }
      }

      function activarAsesoramiento() {
        if (typeof window.abrirModalAtencionBAC === 'function') {
          window.abrirModalAtencionBAC();
        }
      }

      window.activarAsesoramientoBAC = activarAsesoramiento;

      var btnVerCentroAyuda = document.getElementById('btnVerCentroAyuda');
      if (btnVerCentroAyuda) btnVerCentroAyuda.addEventListener('click', showAyuda);
      var btnAyudaBack = document.getElementById('btnAyudaBack');
      if (btnAyudaBack) btnAyudaBack.addEventListener('click', showHome);
      var btnAyudaClose = document.getElementById('btnAyudaClose');
      if (btnAyudaClose) btnAyudaClose.addEventListener('click', showHome);

      function bindVideollamada(el) {
        if (!el) return;
        el.addEventListener('click', function (e) {
          e.preventDefault();
          activarAsesoramiento();
        });
      }

      bindVideollamada(document.getElementById('btnEjecutivoVideollamada'));
      bindVideollamada(document.getElementById('btnAyudaVideollamada'));

      document.addEventListener('click', function (e) {
        var asesor = e.target.closest('[data-action="asesoramiento"]');
        if (asesor && asesor.id !== 'btnEjecutivoVideollamada' && asesor.id !== 'btnAyudaVideollamada') {
          e.preventDefault();
          activarAsesoramiento();
        }
        var demo = e.target.closest('[data-bac-demo]');
        if (demo) {
          e.preventDefault();
          window.alert('Opción demo: en la app real se abriría este canal de contacto.');
        }
      });

      var btnCerrarPromoLoan = document.getElementById('btnCerrarPromoLoan');
      if (btnCerrarPromoLoan) {
        btnCerrarPromoLoan.addEventListener('click', function (e) {
          e.stopPropagation();
          var p = document.getElementById('bacPromoLoan');
          if (p) p.style.display = 'none';
        });
      }

      var promoPopup = document.getElementById('bacPromoPopup');
      var PROMO_DISMISS_KEY = 'bacPromoDismissed';

      function cerrarPromoPopup(remember) {
        if (!promoPopup) return;
        promoPopup.classList.remove('active');
        promoPopup.setAttribute('aria-hidden', 'true');
        if (remember) {
          try { sessionStorage.setItem(PROMO_DISMISS_KEY, '1'); } catch (err) { /* ignore */ }
        }
      }

      function abrirPromoPopup() {
        if (!promoPopup) return;
        promoPopup.classList.add('active');
        promoPopup.setAttribute('aria-hidden', 'false');
      }

      function irAVideollamadaDesdePromo() {
        cerrarPromoPopup(true);
        activarAsesoramiento();
      }

      var btnPromoVideollamada = document.getElementById('btnPromoVideollamada');
      if (btnPromoVideollamada) btnPromoVideollamada.addEventListener('click', irAVideollamadaDesdePromo);
      var btnPromoPopupClose = document.getElementById('btnPromoPopupClose');
      if (btnPromoPopupClose) btnPromoPopupClose.addEventListener('click', function () { cerrarPromoPopup(true); });
      var btnPromoPopupDismiss = document.getElementById('btnPromoPopupDismiss');
      if (btnPromoPopupDismiss) btnPromoPopupDismiss.addEventListener('click', function () { cerrarPromoPopup(true); });
      var promoBackdrop = document.getElementById('bacPromoPopupBackdrop');
      if (promoBackdrop) promoBackdrop.addEventListener('click', function () { cerrarPromoPopup(true); });

      var bacPromoLoan = document.getElementById('bacPromoLoan');
      if (bacPromoLoan) {
        bacPromoLoan.addEventListener('click', function (e) {
          if (e.target.closest('#btnCerrarPromoLoan')) return;
          irAVideollamadaDesdePromo();
        });
        bacPromoLoan.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            irAVideollamadaDesdePromo();
          }
        });
      }

      var dismissed = false;
      try { dismissed = sessionStorage.getItem(PROMO_DISMISS_KEY) === '1'; } catch (e2) { /* ignore */ }
      if (!dismissed) {
        setTimeout(function () {
          if (screenHome && screenHome.classList.contains('active')) {
            abrirPromoPopup();
          }
        }, 1200);
      }
    })();

    (function () {
      var FV_QUEUE = 16223;
      var FV_BRANCH = 10750;
      var fvPollingInterval = null;
      window.bacCurrentVideoCallUrl = 'about:blank';

      var modalEl = document.getElementById('bacModalAtencion');
      var modalBackdrop = document.getElementById('bacModalAtencionBackdrop');
      var modalClose = document.getElementById('bacModalAtencionClose');
      var fvFormAlert = document.getElementById('bacFvFormAlert');
      var fvTurnInfoSection = document.getElementById('bacFvTurnInfoSection');
      var fvLoadingEl = document.getElementById('bacFvLoading');
      var fv$ = function (id) { return document.getElementById(id); };

      async function getFvEnqueueBody() {
        var sel = document.getElementById('nombreSelector');
        var alias = sel ? sel.value : 'Jorge';
        return NumiaDemoUsers.fetchEnqueueBody(alias, []);
      }

      function fvSetFormAlert(type, msg) {
        fvFormAlert.className = 'bac-fv-alert ' + type;
        fvFormAlert.textContent = msg;
      }

      function fvClearFormAlert() {
        fvFormAlert.className = 'bac-fv-alert';
        fvFormAlert.textContent = '';
      }

      function fvStopPolling() {
        if (fvPollingInterval) {
          clearInterval(fvPollingInterval);
          fvPollingInterval = null;
        }
      }

      function fvResetModal() {
        fvStopPolling();
        fvClearFormAlert();
        if (fvTurnInfoSection) fvTurnInfoSection.classList.remove('active');
        if (fvLoadingEl) fvLoadingEl.style.display = '';
        var vf = document.getElementById('bacVideoFrame');
        if (vf) vf.src = 'about:blank';
        window.bacCurrentVideoCallUrl = 'about:blank';
        var vm = document.getElementById('bacVideoModal');
        if (vm) {
          vm.classList.remove('active');
          vm.setAttribute('aria-hidden', 'true');
        }
      }

      function cerrarModalAtencion() {
        if (!modalEl) return;
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        fvResetModal();
      }

      async function fvEnviarAtencion() {
        fvClearFormAlert();
        if (fvLoadingEl) fvLoadingEl.style.display = '';
        if (fvTurnInfoSection) fvTurnInfoSection.classList.remove('active');
        try {
          var payload = await getFvEnqueueBody();
          var out = await NumiaDemoUsers.enqueueFilaVirtual(String(FV_QUEUE), String(FV_BRANCH), payload);

          var turnCode = out.code || '—';
          var turnNumber = (out.jsonDetails && (out.jsonDetails.turn || out.jsonDetails.actualTurn)) || '—';
          var avgWait = (out.jsonDetails && (out.jsonDetails.averageWaitingTime != null ? out.jsonDetails.averageWaitingTime : out.jsonDetails.serviceTime)) || 'N/A';
          var queueName = (out.jsonDetails && out.jsonDetails.queue && out.jsonDetails.queue.name) || '—';
          var wrName = (out.jsonDetails && out.jsonDetails.waitingRoom && out.jsonDetails.waitingRoom.name) || '—';
          var videoCallUrl = (out.jsonDetails && out.jsonDetails.videoCallUrl) || 'about:blank';
          window.bacCurrentVideoCallUrl = videoCallUrl;

          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fvFillWaitInfo({
            code: turnCode,
            number: turnNumber,
            avgWait: isFinite(avgWait) ? Math.floor(parseFloat(avgWait)) + ' min' : 'N/A',
            queueName: queueName,
            waitingRoom: wrName
          });
          if (fvTurnInfoSection) fvTurnInfoSection.classList.add('active');
          fvStartPolling(turnCode);
        } catch (err) {
          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fvSetFormAlert('danger', err.message);
        }
      }

      window.abrirModalAtencionBAC = function () {
        if (!modalEl) return;
        fvResetModal();
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        fvEnviarAtencion();
      };

      if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModalAtencion);
      if (modalClose) modalClose.addEventListener('click', cerrarModalAtencion);

      function fvFillWaitInfo(info) {
        fv$('bacFvTurnCodeDisplay').textContent = info.code;
        fv$('bacFvTurnNumber').textContent = info.number;
        fv$('bacFvAvgWaitingTime').textContent = info.avgWait;
        fv$('bacFvQueueName').textContent = info.queueName;
        fv$('bacFvWaitingRoomName').textContent = info.waitingRoom;
        fv$('bacFvTurnStatus').textContent = 'Consultando...';
        fv$('bacFvTurnStatus').className = 'bac-fv-info-value bac-fv-status-warn';
        fv$('bacFvCurrentWaitingTime').textContent = 'N/A';
        fv$('bacFvBtnAbrirVideo').disabled = true;
      }

      function fvStartPolling(turnCode) {
        fvStopPolling();
        var mapStatus = function (s) {
          if (s === 'ANNOUNCED') return { text: 'Lo estamos llamando', cls: 'bac-fv-status-ok' };
          if (s === 'WAITING_TO_BE_CALLED') return { text: 'En breve lo llamaremos', cls: 'bac-fv-status-warn' };
          if (s === 'FINALIZED') return { text: 'Atención finalizada', cls: 'bac-fv-status-done' };
          return { text: s || 'Desconocido', cls: 'bac-fv-status-warn' };
        };

        var tick = async function () {
          try {
            var data = await FilaVirtualApi.getTurnByCode(turnCode);
            var m = mapStatus(data.status);
            fv$('bacFvTurnStatus').textContent = m.text;
            fv$('bacFvTurnStatus').className = 'bac-fv-info-value ' + m.cls;
            var avg = (data.averageWaitingTime != null ? data.averageWaitingTime : data.serviceTime);
            if (avg !== undefined && avg !== null && !isNaN(avg)) {
              fv$('bacFvCurrentWaitingTime').textContent = Math.floor(parseFloat(avg)) + ' min';
            }
            if (data.status === 'ANNOUNCED') {
              fv$('bacFvBtnAbrirVideo').disabled = false;
            }
          } catch (e) {
            fv$('bacFvTurnStatus').textContent = 'Error al consultar';
            fv$('bacFvTurnStatus').className = 'bac-fv-info-value bac-fv-status-err';
          }
        };

        tick();
        fvPollingInterval = setInterval(tick, 5000);
      }

      var fvBtnAbrirVideo = document.getElementById('bacFvBtnAbrirVideo');
      var bacVideoModal = document.getElementById('bacVideoModal');
      if (fvBtnAbrirVideo) {
        fvBtnAbrirVideo.addEventListener('click', function () {
          var videoUrl = window.bacCurrentVideoCallUrl || 'about:blank';
          var urlWithParam = videoUrl.indexOf('?') >= 0
            ? videoUrl + '&videocallUser=mobile'
            : videoUrl + '?videocallUser=mobile';
          var vf = document.getElementById('bacVideoFrame');
          if (vf) vf.src = urlWithParam;
          if (bacVideoModal) {
            bacVideoModal.classList.add('active');
            bacVideoModal.setAttribute('aria-hidden', 'false');
          }
          document.body.style.overflow = 'hidden';
        });
      }

      var bacBtnCloseVideo = document.getElementById('bacBtnCloseVideo');
      if (bacBtnCloseVideo && bacVideoModal) {
        bacBtnCloseVideo.addEventListener('click', function () {
          bacVideoModal.classList.remove('active');
          bacVideoModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
        });
        bacVideoModal.addEventListener('click', function (e) {
          if (e.target === bacVideoModal) {
            bacVideoModal.classList.remove('active');
            bacVideoModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
          }
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (bacVideoModal && bacVideoModal.classList.contains('active')) {
          bacVideoModal.classList.remove('active');
          bacVideoModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
        } else if (modalEl && modalEl.classList.contains('active')) {
          cerrarModalAtencion();
        }
      });
    })();
