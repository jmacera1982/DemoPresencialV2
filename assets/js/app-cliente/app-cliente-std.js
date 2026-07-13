// Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
      // Configuración de la API Journey Builder
      const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.TOTEM_BANKING;

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

      function getNombreActual() {
        const selector = document.getElementById('nombreSelector');
        return selector ? selector.value : 'Jorge';
      }

      async function buildDatosEnqueue(nombreActual) {
        return NumiaDemoUsers.fetchEnqueueBody(nombreActual, []);
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
          stepsContainer.innerHTML = '<div class="alert alert-info"><i class="bi bi-hourglass-split me-2"></i>Conectando con el asistente...</div>';
          stepsContainer.style.display = 'block';
          summarySection.style.display = 'none';
          
          // Scroll automático al log
          setTimeout(() => {
            const logContent = document.querySelector('.log-content');
            if (logContent) {
              logContent.scrollTop = logContent.scrollHeight;
            }
          }, 100);
          
          // Llamar a la API de Journey Builder
          const data = await NumiaJourneyApi.runJourney(JOURNEY_FLOW_ID, {
              input_value: mensaje,
              input_type: 'chat'
            });
        
        console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2));
        
        // Asegurar que el contenedor de logs esté visible (ya está declarado arriba)
        if (logContainer) {
          logContainer.classList.add('visible');
        }
        
        // Asegurar que la sección esté visible
        atencionSection.style.display = 'block';
        atencionSection.classList.add('active');
        
        // Procesar y mostrar los pasos
        let contents = [];
        let messageText = null;
        
        // Función recursiva para buscar tool_use en cualquier estructura
        function buscarToolUse(obj, path = '') {
          if (!obj || typeof obj !== 'object') return;
          
          // Si es un array, buscar en cada elemento
          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              buscarToolUse(item, `${path}[${index}]`);
            });
            return;
          }
          
          // Si tiene name y output, es probablemente un tool_use
          if (obj.name && (obj.output !== undefined || obj.tool_input !== undefined)) {
            console.log(`Encontrado tool_use en ${path}:`, obj);
            contents.push({
              type: 'tool_use',
              name: obj.name,
              tool_name: obj.name,
              tool_input: obj.tool_input || obj.input,
              input: obj.tool_input || obj.input,
              output: obj.output,
              path: path
            });
          }
          
          // Si tiene type === 'tool_use', también es válido
          if (obj.type === 'tool_use' && obj.name) {
            console.log(`Encontrado tool_use (type) en ${path}:`, obj);
            contents.push({
              type: 'tool_use',
              name: obj.name,
              tool_name: obj.name,
              tool_input: obj.tool_input || obj.input,
              input: obj.tool_input || obj.input,
              output: obj.output,
              path: path
            });
          }
          
          // Si tiene tool_use como propiedad anidada
          if (obj.tool_use && obj.tool_use.name) {
            console.log(`Encontrado tool_use anidado en ${path}:`, obj.tool_use);
            contents.push({
              type: 'tool_use',
              name: obj.tool_use.name,
              tool_name: obj.tool_use.name,
              tool_input: obj.tool_use.input || obj.tool_use.tool_input,
              input: obj.tool_use.input || obj.tool_use.tool_input,
              output: obj.tool_use.output,
              path: `${path}.tool_use`
            });
          }
          
          // Buscar recursivamente en todas las propiedades
          for (const key in obj) {
            if (obj.hasOwnProperty(key) && key !== 'tool_use') {
              buscarToolUse(obj[key], path ? `${path}.${key}` : key);
            }
          }
        }
        
        // Buscar en diferentes estructuras de respuesta
        if (data.outputs && data.outputs.length > 0) {
          const firstOutput = data.outputs[0];
          console.log('First output:', firstOutput);
          
          // Buscar en la estructura específica: outputs[0].outputs[0].results.message.content_blocks[0].contents
          if (firstOutput.outputs && firstOutput.outputs.length > 0) {
            const innerOutput = firstOutput.outputs[0];
            
            // Buscar en results.message.content_blocks
            if (innerOutput.results?.message?.content_blocks) {
              innerOutput.results.message.content_blocks.forEach((block, blockIndex) => {
                if (block.contents && Array.isArray(block.contents)) {
                  block.contents.forEach((content, contentIndex) => {
                    // Solo agregar los que son tool_use
                    if (content.type === 'tool_use' && content.name) {
                      console.log(`Encontrado tool_use: ${content.name}`, content);
                      contents.push({
                        type: 'tool_use',
                        name: content.name,
                        tool_name: content.name,
                        tool_input: content.tool_input || content.input,
                        input: content.tool_input || content.input,
                        output: content.output,
                        duration: content.duration,
                        header: content.header
                      });
                    }
                  });
                }
              });
            }
            
            // Buscar mensaje final en artifacts
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
          
          // Buscar en agent_steps si existe (como respaldo)
          if (firstOutput.agent_steps && Array.isArray(firstOutput.agent_steps)) {
            firstOutput.agent_steps.forEach((step, index) => {
              if (step.tool_use && step.tool_use.name) {
                const exists = contents.some(c => c.name === step.tool_use.name);
                if (!exists) {
                  contents.push({
                    type: 'tool_use',
                    name: step.tool_use.name,
                    tool_name: step.tool_use.name,
                    tool_input: step.tool_use.input,
                    input: step.tool_use.input,
                    output: step.tool_use.output
                  });
                }
              }
            });
          }
          
        }
        
        console.log('Contents encontrados:', contents.length);
        console.log('Message text:', messageText);
        
        // Filtrar solo los pasos de tipo tool_use
        const toolUseSteps = contents.filter(content => 
          content.type === 'tool_use' || 
          content.tool_name || 
          content.name ||
          (content.tool_use && content.tool_use.name)
        );
        
        console.log('Pasos tool_use encontrados:', toolUseSteps.length);
        
        // Mostrar los pasos encontrados
        if (toolUseSteps.length > 0) {
          // Limpiar contenedor y asegurar visibilidad
          stepsContainer.innerHTML = '';
          stepsContainer.style.display = 'block';
          stepsContainer.style.visibility = 'visible';
          stepsContainer.style.opacity = '1';
          
          console.log(`Agregando ${toolUseSteps.length} pasos tool_use al DOM`);
          
          // Agregar los pasos uno por uno con delay
          toolUseSteps.forEach((content, index) => {
            setTimeout(() => {
              agregarPaso(content, index);
            }, index * 800); // 800ms entre cada paso
          });
          
          // Mostrar resumen después de todos los pasos
          if (messageText) {
            setTimeout(() => {
              mostrarResumen(messageText);
            }, toolUseSteps.length * 800 + 500);
          }
        } else {
          // Si no hay pasos, mostrar la respuesta completa o el mensaje
          if (messageText) {
            stepsContainer.innerHTML = `
              <div class="alert alert-success">
                <i class="bi bi-check-circle me-2"></i>
                <strong>Proceso completado</strong>
              </div>
            `;
            stepsContainer.style.display = 'block';
            mostrarResumen(messageText);
          } else {
            // Si no hay pasos tool_use, mostrar mensaje amigable
            stepsContainer.innerHTML = `
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Proceso completado</strong>
                <p class="mb-0 mt-2">No se encontraron pasos de herramientas para mostrar. El proceso se ejecutó correctamente.</p>
              </div>
            `;
            stepsContainer.style.display = 'block';
            
            // Si hay mensaje, mostrarlo
            if (messageText) {
              setTimeout(() => {
                mostrarResumen(messageText);
              }, 500);
            }
          }
        }
        
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
          
          // Formatear el nombre de manera amigable (ej: "consultaclientenumia" -> "Consultar Cliente Numia")
          const friendlyName = toolName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
          
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
          stepsContainer.innerHTML = '<div class="alert alert-info"><i class="bi bi-hourglass-split me-2"></i>Conectando con el asistente...</div>';
          
          // Llamar al agente con el DNI fijo y la opción seleccionada
          const dni = DNI_FIJO;
          const mensaje = `Necesito atención sobre ${opcion}. DNI: ${dni}`;
          
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
              }, contents.length * 800 + 500);
            }
          } else {
            if (messageText) {
              mostrarResumen(messageText);
            }
          }
          
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
