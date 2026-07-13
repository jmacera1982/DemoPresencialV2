// Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
      // Configuración de la API Journey Builder
      const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.BBVA;
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
      var screenHome = document.getElementById('sanScreenHome');
      var screenAyuda = document.getElementById('sanScreenAyuda');
      var screenCita = document.getElementById('sanScreenCita');
      var headerTitle = document.getElementById('bbvaHeaderTitle');
      var headerBack = document.getElementById('btnHeaderBack');
      var headerLogo = document.getElementById('bbvaHeaderLogo');

      function setHeader(title, showBack) {
        var isHome = title === 'Inicio';
        if (headerTitle) {
          headerTitle.textContent = title;
          headerTitle.style.display = isHome ? 'none' : 'block';
        }
        if (headerLogo) headerLogo.style.display = isHome ? 'flex' : 'none';
        if (headerBack) headerBack.style.visibility = showBack ? 'visible' : 'hidden';
      }

      function showHome() {
        if (screenCita && screenCita.classList.contains('active')) {
          limpiarPanelAgenteCita(true);
        }
        ocultarChatCita();
        if (screenHome) screenHome.classList.add('active');
        if (screenAyuda) screenAyuda.classList.remove('active');
        if (screenCita) screenCita.classList.remove('active');
        setHeader('Inicio', false);
      }

      function showAyuda() {
        if (screenCita && screenCita.classList.contains('active')) {
          limpiarPanelAgenteCita(true);
        }
        if (screenHome) screenHome.classList.remove('active');
        if (screenCita) screenCita.classList.remove('active');
        if (screenAyuda) {
          screenAyuda.classList.add('active');
          var body = screenAyuda.querySelector('.san-ayuda-body');
          if (body) body.scrollTop = 0;
        }
        setHeader('Centro de ayuda', true);
      }

      function showCita() {
        if (screenHome) screenHome.classList.remove('active');
        if (screenAyuda) screenAyuda.classList.remove('active');
        if (screenCita) {
          screenCita.classList.add('active');
          screenCita.scrollTop = 0;
        }
        setHeader('Agendar cita', true);
        resetCitaForm();
        initCitaFechaMin();
      }

      if (headerBack) {
        headerBack.addEventListener('click', function () {
          if (screenCita && screenCita.classList.contains('active')) showHome();
          else if (screenAyuda && screenAyuda.classList.contains('active')) showHome();
        });
      }

      var btnAgendarCita = document.getElementById('btnAgendarCita');
      if (btnAgendarCita) btnAgendarCita.addEventListener('click', showCita);

      function activarAsesoramiento() {
        if (typeof window.abrirModalAtencionSAN === 'function') {
          window.abrirModalAtencionSAN();
        }
      }

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
        var demo = e.target.closest('[data-san-demo]');
        if (demo) {
          e.preventDefault();
          window.alert('Opción demo: en la app real se abriría este canal de contacto.');
        }
      });

      var btnCerrarPromoLoan = document.getElementById('btnCerrarPromoLoan');
      if (btnCerrarPromoLoan) {
        btnCerrarPromoLoan.addEventListener('click', function (e) {
          e.stopPropagation();
          var p = document.getElementById('sanPromoLoan');
          if (p) p.style.display = 'none';
        });
      }

      var promoPopup = document.getElementById('sanPromoPopup');
      var PROMO_DISMISS_KEY = 'sanPromoDismissed';

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
      var promoBackdrop = document.getElementById('sanPromoPopupBackdrop');
      if (promoBackdrop) promoBackdrop.addEventListener('click', function () { cerrarPromoPopup(true); });

      var sanPromoLoan = document.getElementById('sanPromoLoan');
      if (sanPromoLoan) {
        sanPromoLoan.addEventListener('click', function (e) {
          if (e.target.closest('#btnCerrarPromoLoan')) return;
          irAVideollamadaDesdePromo();
        });
        sanPromoLoan.addEventListener('keydown', function (e) {
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

      document.querySelectorAll('.bbva-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          document.querySelectorAll('.bbva-tab').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
        });
      });

      var nombreSelector = document.getElementById('nombreSelector');
      var nombreSelectorVisible = document.getElementById('nombreSelectorVisible');
      if (nombreSelector && nombreSelectorVisible) {
        nombreSelectorVisible.addEventListener('change', function () {
          nombreSelector.value = this.value;
          nombreSelector.dispatchEvent(new Event('change'));
        });
        nombreSelector.addEventListener('change', function () {
          nombreSelectorVisible.value = this.value;
        });
      }

      var btnToggleBalanceCard = document.getElementById('btnToggleBalanceCard');
      var btnToggleBalance = document.getElementById('btnToggleBalance');
      if (btnToggleBalanceCard && btnToggleBalance) {
        btnToggleBalanceCard.addEventListener('click', function () { btnToggleBalance.click(); });
      }

      var citaTipo = 'sucursal';
      var citaMotivo = '';
      var citaHoraInput = document.getElementById('citaHora');
      var citaMotivoInput = document.getElementById('citaMotivo');
      var btnConfirmarCita = document.getElementById('btnConfirmarCita');
      var citaSucursalWrap = document.getElementById('citaSucursalWrap');
      var citaSucursal = document.getElementById('citaSucursal');
      var citaFecha = document.getElementById('citaFecha');
      var citaAgendaWrap = document.getElementById('citaAgendaWrap');
      var citaHoraWrap = document.getElementById('citaHoraWrap');
      var citaFormRest = document.getElementById('citaFormRest');
      var citaTransferenciasTip = document.getElementById('citaTransferenciasTip');
      var citaSuccess = document.getElementById('bbvaCitaSuccess');
      var citaSuccessText = document.getElementById('bbvaCitaSuccessText');

      function setCitaTipo(tipo) {
        citaTipo = tipo;
        document.querySelectorAll('#citaTipoToggle button').forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-tipo') === tipo);
        });
        var isVideo = tipo === 'videollamada';
        if (citaAgendaWrap) citaAgendaWrap.classList.toggle('hidden', isVideo);
        if (citaSucursalWrap) citaSucursalWrap.style.display = isVideo ? 'none' : 'block';
        if (citaSucursal) {
          if (isVideo) citaSucursal.removeAttribute('required');
          else citaSucursal.setAttribute('required', 'required');
        }
        if (btnConfirmarCita) {
          btnConfirmarCita.textContent = isVideo ? 'Conectar videollamada ahora' : 'Confirmar cita';
        }
        validateCitaForm();
      }

      var citaAnalisisTimeouts = [];

      function cancelarAnalisisCitaAgente() {
        citaAnalisisTimeouts.forEach(function (id) { clearTimeout(id); });
        citaAnalisisTimeouts = [];
      }

      function limpiarPanelAgenteCita(ocultar) {
        cancelarAnalisisCitaAgente();
        var logContainer = document.querySelector('.log-container');
        var atencionSection = document.getElementById('atencionSection');
        var stepsContainer = document.getElementById('stepsContainer');
        var summarySection = document.getElementById('summarySection');
        var summaryContent = document.getElementById('summaryContent');
        if (stepsContainer) {
          stepsContainer.innerHTML = '';
          stepsContainer.style.display = 'none';
        }
        if (summaryContent) summaryContent.innerHTML = '';
        if (summarySection) summarySection.style.display = 'none';
        if (atencionSection) {
          atencionSection.style.display = 'none';
          atencionSection.classList.remove('active');
        }
        if (ocultar !== false && logContainer) {
          logContainer.classList.remove('visible');
        }
        if (citaFormRest) citaFormRest.classList.remove('visible');
        if (citaTransferenciasTip) citaTransferenciasTip.classList.remove('visible');
      }

      function mostrarChatCita() {
        var shell = document.getElementById('jbChatShell');
        if (!shell) return;
        shell.classList.add('visible');
        shell.setAttribute('aria-hidden', 'false');
        var chat = shell.querySelector('journey-builder-chat');
        if (chat && typeof chat.open === 'function') {
          chat.open();
        }
      }

      function ocultarChatCita() {
        var shell = document.getElementById('jbChatShell');
        if (!shell) return;
        shell.classList.remove('visible');
        shell.setAttribute('aria-hidden', 'true');
        var chat = shell.querySelector('journey-builder-chat');
        if (chat && typeof chat.close === 'function') {
          chat.close();
        }
      }

      function getNombreClienteCita() {
        var sel = document.getElementById('nombreSelectorVisible') || document.getElementById('nombreSelector');
        return sel && sel.value ? sel.value : 'Cliente';
      }

      function escapeHtmlCita(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      function agregarPasoCitaAgente(titulo, detalle, index) {
        var stepsContainer = document.getElementById('stepsContainer');
        if (!stepsContainer) return;
        var stepItem = document.createElement('div');
        stepItem.className = 'step-item processing';
        stepItem.innerHTML =
          '<div class="step-header">' +
            '<div class="step-icon tool"><i class="bi bi-gear"></i></div>' +
            '<div class="ac-flex-1">' +
              '<div class="step-title">' + escapeHtmlCita(titulo) + '</div>' +
              '<div class="step-duration">Paso ' + (index + 1) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="step-content">' +
            '<div class="step-output-content"><em class="ac-log-muted">' + escapeHtmlCita(detalle) + '</em></div>' +
          '</div>';
        stepsContainer.appendChild(stepItem);
        setTimeout(function () {
          stepItem.classList.remove('processing');
          stepItem.classList.add('completed');
          var icon = stepItem.querySelector('.step-icon');
          if (icon) {
            icon.className = 'step-icon completed';
            icon.innerHTML = '<i class="bi bi-check-circle"></i>';
          }
        }, 500);
        var logContent = document.querySelector('.log-content');
        if (logContent) logContent.scrollTop = logContent.scrollHeight;
      }

      function resetCitaTipoToggleOrder() {
        var toggle = document.getElementById('citaTipoToggle');
        if (!toggle) return;
        var btnSucursal = toggle.querySelector('[data-tipo="sucursal"]');
        var btnVideo = toggle.querySelector('[data-tipo="videollamada"]');
        if (btnSucursal && btnVideo) toggle.insertBefore(btnSucursal, btnVideo);
        toggle.querySelectorAll('button').forEach(function (b) { b.classList.remove('recomendado'); });
        var hint = document.getElementById('citaTipoHint');
        if (hint) hint.textContent = 'Elegí sucursal para agendar turno o videollamada para conectarte ahora.';
      }

      function obtenerResumenCitaDemo(motivo, nombre) {
        if (motivo === 'Prestamos') {
          return 'Recomendación para ' + nombre + ':\n\n**Tipo de atención sugerida**: Videollamada inmediata\n\nEl cliente consultó préstamos en los últimos 30 días y tiene productos activos compatibles con precalificación digital. Score crediticio: 720.\n\n- Sugerir videollamada: Sí\n- Tiempo estimado videollamada: ~8 min\n- Tiempo estimado sucursal: ~45 min';
        }
        if (motivo === 'Tarjetas') {
          return 'Recomendación para ' + nombre + ':\n\n**Tipo de atención sugerida**: Sucursal\n\nHistorial de gestiones sobre tarjeta de crédito. Para aumento de límite o reposición conviene agendar turno presencial.\n\n- Sugerir videollamada: No\n- Videollamada disponible para consultas generales.';
        }
        if (motivo === 'Transferencias') {
          return 'Recomendación para ' + nombre + ':\n\n**Tipo de atención sugerida**: Autogestión en app\n\nLa transferencia puede completarse en segundos desde la app BBVA, sin turno ni sucursal. Si el cliente prefiere ayuda, se sugiere chat guiado o videollamada inmediata.\n\n- Sugerir videollamada: Sí\n- Tiempo estimado en app: ~2 min\n- No requiere agendar sucursal';
        }
        return '';
      }

      function aplicarRecomendacionCanalCita(motivo, recomiendaVideo) {
        var toggle = document.getElementById('citaTipoToggle');
        var hint = document.getElementById('citaTipoHint');
        if (!toggle) return;
        var btnSucursal = toggle.querySelector('[data-tipo="sucursal"]');
        var btnVideo = toggle.querySelector('[data-tipo="videollamada"]');
        toggle.querySelectorAll('button').forEach(function (b) { b.classList.remove('recomendado'); });
        if (recomiendaVideo && btnVideo && btnSucursal) {
          toggle.insertBefore(btnVideo, btnSucursal);
          btnVideo.classList.add('recomendado');
          setCitaTipo('videollamada');
          if (hint) hint.textContent = 'El agente recomienda videollamada inmediata: atención más rápida con un especialista.';
        } else {
          if (btnSucursal && btnVideo) toggle.insertBefore(btnSucursal, btnVideo);
          if (btnSucursal) btnSucursal.classList.add('recomendado');
          setCitaTipo('sucursal');
          if (hint) hint.textContent = 'Elegí sucursal para agendar turno o videollamada para conectarte ahora.';
        }
      }

      function mostrarResumenAnalisisCita(texto, motivo, recomiendaVideo) {
        var summaryContent = document.getElementById('summaryContent');
        var summarySection = document.getElementById('summarySection');
        if (summaryContent) {
          var html = '';
          texto.split('\n').forEach(function (linea) {
            linea = linea.trim();
            if (!linea) {
              html += '<div class="ac-spacer-sm"></div>';
              return;
            }
            if (linea.match(/^\*\*.*\*\*:/)) {
              html += '<div class="conversation-line title"><strong>' + escapeHtmlCita(linea.replace(/\*\*/g, '').replace(':', '')) + '</strong></div>';
            } else if (linea.indexOf(':') > -1 && linea.indexOf('-') !== 0) {
              var parts = linea.split(':');
              html += '<div class="conversation-line info"><strong>' + escapeHtmlCita(parts[0].trim()) + ':</strong> ' + escapeHtmlCita(parts.slice(1).join(':').trim()) + '</div>';
            } else {
              html += '<div class="conversation-line">' + escapeHtmlCita(linea) + '</div>';
            }
          });
          summaryContent.innerHTML = '<div class="conversation-output">' + html + '</div>';
        }
        if (summarySection) summarySection.style.display = 'block';
        if (motivo === 'Transferencias') {
          if (citaTransferenciasTip) citaTransferenciasTip.classList.add('visible');
        } else {
          if (citaFormRest) citaFormRest.classList.add('visible');
          aplicarRecomendacionCanalCita(motivo, recomiendaVideo);
        }
        setTimeout(function () {
          var logContent = document.querySelector('.log-content');
          if (logContent) logContent.scrollTop = logContent.scrollHeight;
        }, 100);
      }

      function iniciarAnalisisAgenteCita(motivo) {
        cancelarAnalisisCitaAgente();

        var logContainer = document.querySelector('.log-container');
        var atencionSection = document.getElementById('atencionSection');
        var stepsContainer = document.getElementById('stepsContainer');
        var summarySection = document.getElementById('summarySection');
        var summaryContent = document.getElementById('summaryContent');

        if (logContainer) logContainer.classList.add('visible');
        if (atencionSection) {
          atencionSection.style.display = 'block';
          atencionSection.classList.add('active');
        }
        if (summarySection) summarySection.style.display = 'none';
        if (summaryContent) summaryContent.innerHTML = '';
        if (stepsContainer) {
          stepsContainer.innerHTML = '';
          stepsContainer.style.display = 'block';
        }
        if (citaFormRest) citaFormRest.classList.remove('visible');
        if (citaTransferenciasTip) citaTransferenciasTip.classList.remove('visible');

        var nombreCliente = getNombreClienteCita();
        var motivoLabels = {
          Prestamos: 'Préstamos personales',
          Tarjetas: 'Tarjetas de crédito',
          Transferencias: 'Transferencias'
        };
        var motivoLabel = motivoLabels[motivo] || motivo;
        var pasos = [
          { titulo: 'Analizando tipo de atención solicitada', detalle: 'Motivo: ' + motivoLabel + '. Evaluando canal de agendamiento digital.' },
          { titulo: 'Analizando interacciones anteriores del cliente', detalle: 'Revisando consultas, operaciones y productos de ' + nombreCliente + '.' },
          { titulo: 'Generando recomendación de asesoramiento', detalle: 'Determinando el canal más eficiente según perfil y disponibilidad.' }
        ];
        var delayPaso = 900;
        pasos.forEach(function (paso, index) {
          var tid = setTimeout(function () {
            agregarPasoCitaAgente(paso.titulo, paso.detalle, index);
          }, index * delayPaso);
          citaAnalisisTimeouts.push(tid);
        });

        var recomiendaVideo = motivo === 'Prestamos';
        var textoResumen = obtenerResumenCitaDemo(motivo, nombreCliente);
        var tidFin = setTimeout(function () {
          mostrarResumenAnalisisCita(textoResumen, motivo, recomiendaVideo);
        }, pasos.length * delayPaso + 400);
        citaAnalisisTimeouts.push(tidFin);
      }

      function setCitaMotivo(motivo) {
        var prevMotivo = citaMotivo;
        citaMotivo = motivo;
        var isTransferencias = motivo === 'Transferencias';
        if (motivo !== prevMotivo) {
          limpiarPanelAgenteCita(!motivo);
        }
        if (citaMotivoInput) citaMotivoInput.value = motivo;
        document.querySelectorAll('#citaMotivoToggle button').forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-motivo') === motivo);
        });
        if (citaTransferenciasTip) citaTransferenciasTip.classList.remove('visible');
        if (citaFormRest) citaFormRest.classList.remove('visible');
        if (!isTransferencias && prevMotivo === 'Transferencias') {
          setCitaTipo('sucursal');
        }
        if (motivo) {
          iniciarAnalisisAgenteCita(motivo);
        }
        validateCitaForm();
      }

      function iniciarVideollamadaCita() {
        if (!citaMotivo) {
          window.alert('Seleccioná primero el motivo de tu consulta.');
          return;
        }
        showHome();
        if (typeof activarAsesoramiento === 'function') {
          activarAsesoramiento();
        } else {
          window.alert('Videollamada inmediata — motivo: ' + citaMotivo + ' (demo).');
        }
      }

      function clearCitaHoraSelection() {
        if (citaHoraInput) citaHoraInput.value = '';
        document.querySelectorAll('.bbva-time-slot').forEach(function (s) { s.classList.remove('active'); });
      }

      function updateCitaHoraVisibility() {
        var hasDate = citaFecha && citaFecha.value;
        if (citaHoraWrap) citaHoraWrap.classList.toggle('visible', !!hasDate);
        if (!hasDate) clearCitaHoraSelection();
        validateCitaForm();
      }

      function initCitaFechaMin() {
        if (!citaFecha) return;
        var today = new Date();
        var y = today.getFullYear();
        var m = String(today.getMonth() + 1).padStart(2, '0');
        var d = String(today.getDate()).padStart(2, '0');
        citaFecha.min = y + '-' + m + '-' + d;
        citaFecha.value = '';
        updateCitaHoraVisibility();
      }

      function validateCitaForm() {
        if (!btnConfirmarCita) return;
        if (!citaMotivo) {
          btnConfirmarCita.disabled = true;
          return;
        }
        if (citaMotivo === 'Transferencias') {
          btnConfirmarCita.disabled = true;
          return;
        }
        if (citaTipo === 'videollamada') {
          btnConfirmarCita.disabled = false;
          return;
        }
        var okFecha = citaFecha && citaFecha.value;
        var okHora = citaHoraInput && citaHoraInput.value;
        var okSucursal = citaSucursal && citaSucursal.value;
        btnConfirmarCita.disabled = !(okFecha && okHora && okSucursal);
      }

      document.querySelectorAll('#citaMotivoToggle button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setCitaMotivo(btn.getAttribute('data-motivo'));
        });
      });

      document.querySelectorAll('#citaTipoToggle button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setCitaTipo(btn.getAttribute('data-tipo'));
        });
      });

      document.querySelectorAll('.bbva-time-slot').forEach(function (slot) {
        slot.addEventListener('click', function () {
          document.querySelectorAll('.bbva-time-slot').forEach(function (s) { s.classList.remove('active'); });
          slot.classList.add('active');
          if (citaHoraInput) citaHoraInput.value = slot.getAttribute('data-hora');
          validateCitaForm();
        });
      });

      if (citaFecha) citaFecha.addEventListener('change', updateCitaHoraVisibility);
      if (citaSucursal) citaSucursal.addEventListener('change', validateCitaForm);

      var btnCitaGuiaChat = document.getElementById('btnCitaGuiaChat');
      if (btnCitaGuiaChat) {
        btnCitaGuiaChat.addEventListener('click', function () {
          mostrarChatCita();
        });
      }

      var btnCitaVideoInmediata = document.getElementById('btnCitaVideoInmediata');
      if (btnCitaVideoInmediata) {
        btnCitaVideoInmediata.addEventListener('click', iniciarVideollamadaCita);
      }

      var formAgendarCita = document.getElementById('formAgendarCita');
      if (formAgendarCita) {
        formAgendarCita.addEventListener('submit', function (e) {
          e.preventDefault();
          if (!citaMotivo) return;

          if (citaTipo === 'videollamada') {
            iniciarVideollamadaCita();
            return;
          }

          var lugar = citaSucursal ? citaSucursal.value : '';
          var fechaFmt = citaFecha && citaFecha.value
            ? new Date(citaFecha.value + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : '';
          if (citaSuccessText) {
            citaSuccessText.textContent = 'Tu cita por ' + citaMotivo.toLowerCase() + ' en sucursal' +
              (lugar ? ' (' + lugar + ')' : '') +
              ' quedó agendada para el ' + fechaFmt + ' a las ' + (citaHoraInput ? citaHoraInput.value : '') + ' hs.';
          }
          if (citaSuccess) {
            citaSuccess.classList.add('active');
            citaSuccess.setAttribute('aria-hidden', 'false');
          }
        });
      }

      function resetCitaForm() {
        limpiarPanelAgenteCita(true);
        ocultarChatCita();
        citaMotivo = '';
        citaTipo = 'sucursal';
        if (citaMotivoInput) citaMotivoInput.value = '';
        document.querySelectorAll('#citaMotivoToggle button').forEach(function (b) { b.classList.remove('active'); });
        if (citaFormRest) citaFormRest.classList.remove('visible');
        if (citaTransferenciasTip) citaTransferenciasTip.classList.remove('visible');
        if (formAgendarCita) formAgendarCita.reset();
        clearCitaHoraSelection();
        if (citaHoraWrap) citaHoraWrap.classList.remove('visible');
        resetCitaTipoToggleOrder();
        setCitaTipo('sucursal');
        if (citaSucursalWrap) citaSucursalWrap.style.display = 'block';
        if (citaAgendaWrap) citaAgendaWrap.classList.remove('hidden');
        validateCitaForm();
      }

      function cerrarCitaSuccess() {
        if (citaSuccess) {
          citaSuccess.classList.remove('active');
          citaSuccess.setAttribute('aria-hidden', 'true');
        }
        showHome();
        resetCitaForm();
      }

      var btnCitaSuccessOk = document.getElementById('btnCitaSuccessOk');
      if (btnCitaSuccessOk) btnCitaSuccessOk.addEventListener('click', cerrarCitaSuccess);
      var bbvaCitaSuccessBackdrop = document.getElementById('bbvaCitaSuccessBackdrop');
      if (bbvaCitaSuccessBackdrop) bbvaCitaSuccessBackdrop.addEventListener('click', cerrarCitaSuccess);
    })();

    (function () {
      var FV_QUEUE = 16223;
      var FV_BRANCH = 10750;
      var fvPollingInterval = null;
      window.sanCurrentVideoCallUrl = 'about:blank';

      var modalEl = document.getElementById('sanModalAtencion');
      var modalBackdrop = document.getElementById('sanModalAtencionBackdrop');
      var modalClose = document.getElementById('sanModalAtencionClose');
      var fvFormAlert = document.getElementById('sanFvFormAlert');
      var fvTurnInfoSection = document.getElementById('sanFvTurnInfoSection');
      var fvLoadingEl = document.getElementById('sanFvLoading');
      var fv$ = function (id) { return document.getElementById(id); };

      async function getFvEnqueueBody() {
        var sel = document.getElementById('nombreSelector');
        var alias = sel ? sel.value : 'Jorge';
        return NumiaDemoUsers.fetchEnqueueBody(alias, []);
      }

      function fvSetFormAlert(type, msg) {
        fvFormAlert.className = 'san-fv-alert ' + type;
        fvFormAlert.textContent = msg;
      }

      function fvClearFormAlert() {
        fvFormAlert.className = 'san-fv-alert';
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
        var vf = document.getElementById('sanVideoFrame');
        if (vf) vf.src = 'about:blank';
        window.sanCurrentVideoCallUrl = 'about:blank';
        var vm = document.getElementById('sanVideoModal');
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
        var user = getFvUser();

        try {
          var payload = await getFvEnqueueBody();
          var out = await NumiaDemoUsers.enqueueFilaVirtual(String(FV_QUEUE), String(FV_BRANCH), payload);

          var turnCode = out.code || '—';
          var turnNumber = (out.jsonDetails && (out.jsonDetails.turn || out.jsonDetails.actualTurn)) || '—';
          var avgWait = (out.jsonDetails && (out.jsonDetails.averageWaitingTime != null ? out.jsonDetails.averageWaitingTime : out.jsonDetails.serviceTime)) || 'N/A';
          var queueName = (out.jsonDetails && out.jsonDetails.queue && out.jsonDetails.queue.name) || '—';
          var wrName = (out.jsonDetails && out.jsonDetails.waitingRoom && out.jsonDetails.waitingRoom.name) || '—';
          window.sanCurrentVideoCallUrl = (out.jsonDetails && out.jsonDetails.videoCallUrl) || 'about:blank';

          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fv$('sanFvTurnCodeDisplay').textContent = turnCode;
          fv$('sanFvTurnNumber').textContent = turnNumber;
          fv$('sanFvAvgWaitingTime').textContent = isFinite(avgWait) ? Math.floor(parseFloat(avgWait)) + ' min' : 'N/A';
          fv$('sanFvQueueName').textContent = queueName;
          fv$('sanFvWaitingRoomName').textContent = wrName;
          fv$('sanFvTurnStatus').textContent = 'Consultando...';
          fv$('sanFvTurnStatus').className = 'san-fv-info-value san-fv-status-warn';
          fv$('sanFvCurrentWaitingTime').textContent = 'N/A';
          fv$('sanFvBtnAbrirVideo').disabled = true;
          if (fvTurnInfoSection) fvTurnInfoSection.classList.add('active');
          fvStartPolling(turnCode);
        } catch (err) {
          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fvSetFormAlert('danger', err.message);
        }
      }

      window.abrirModalAtencionSAN = function () {
        if (!modalEl) return;
        fvResetModal();
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        fvEnviarAtencion();
      };

      if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModalAtencion);
      if (modalClose) modalClose.addEventListener('click', cerrarModalAtencion);

      function fvStartPolling(turnCode) {
        fvStopPolling();
        var mapStatus = function (s) {
          if (s === 'ANNOUNCED') return { text: 'Lo estamos llamando', cls: 'san-fv-status-ok' };
          if (s === 'WAITING_TO_BE_CALLED') return { text: 'En breve lo llamaremos', cls: 'san-fv-status-warn' };
          if (s === 'FINALIZED') return { text: 'Atención finalizada', cls: 'san-fv-status-done' };
          return { text: s || 'Desconocido', cls: 'san-fv-status-warn' };
        };

        var tick = async function () {
          try {
            var data = await FilaVirtualApi.getTurnByCode(turnCode);
            var m = mapStatus(data.status);
            fv$('sanFvTurnStatus').textContent = m.text;
            fv$('sanFvTurnStatus').className = 'san-fv-info-value ' + m.cls;
            var avg = (data.averageWaitingTime != null ? data.averageWaitingTime : data.serviceTime);
            if (avg !== undefined && avg !== null && !isNaN(avg)) {
              fv$('sanFvCurrentWaitingTime').textContent = Math.floor(parseFloat(avg)) + ' min';
            }
            if (data.status === 'ANNOUNCED') {
              fv$('sanFvBtnAbrirVideo').disabled = false;
            }
          } catch (e) {
            fv$('sanFvTurnStatus').textContent = 'Error al consultar';
            fv$('sanFvTurnStatus').className = 'san-fv-info-value san-fv-status-err';
          }
        };

        tick();
        fvPollingInterval = setInterval(tick, 5000);
      }

      var fvBtnAbrirVideo = document.getElementById('sanFvBtnAbrirVideo');
      var sanVideoModal = document.getElementById('sanVideoModal');
      if (fvBtnAbrirVideo) {
        fvBtnAbrirVideo.addEventListener('click', function () {
          var videoUrl = window.sanCurrentVideoCallUrl || 'about:blank';
          var urlWithParam = videoUrl.indexOf('?') >= 0 ? videoUrl + '&videocallUser=mobile' : videoUrl + '?videocallUser=mobile';
          var vf = document.getElementById('sanVideoFrame');
          if (vf) vf.src = urlWithParam;
          if (sanVideoModal) {
            sanVideoModal.classList.add('active');
            sanVideoModal.setAttribute('aria-hidden', 'false');
          }
          document.body.style.overflow = 'hidden';
        });
      }

      var sanBtnCloseVideo = document.getElementById('sanBtnCloseVideo');
      if (sanBtnCloseVideo && sanVideoModal) {
        sanBtnCloseVideo.addEventListener('click', function () {
          sanVideoModal.classList.remove('active');
          sanVideoModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
        });
        sanVideoModal.addEventListener('click', function (e) {
          if (e.target === sanVideoModal) {
            sanVideoModal.classList.remove('active');
            sanVideoModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
          }
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (sanVideoModal && sanVideoModal.classList.contains('active')) {
          sanVideoModal.classList.remove('active');
          sanVideoModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = modalEl && modalEl.classList.contains('active') ? 'hidden' : '';
        } else if (modalEl && modalEl.classList.contains('active')) {
          cerrarModalAtencion();
        }
      });
    })();
