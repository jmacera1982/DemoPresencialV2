// Aquí va el JS de reservas, igual al que ya tienes, recortado para simplicidad
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
});
        // Inicializar iconos de Lucide
        lucide.createIcons();

        // Variables globales
        let isLoading = false;

        // Funciones para mostrar/ocultar el formulario
    function showForm() {
      document.getElementById('formModal').style.display = 'block';
      document.getElementById('message').classList.add('hidden');
      document.getElementById('reservaForm').reset();
      
      // Restaurar la visibilidad del formulario
      const form = document.getElementById('reservaForm');
      if (form) {
          form.style.display = 'block';
      }
      
      // Mostrar información de la cola seleccionada
      const queueId = window.currentQueueId || '14003';
      const queueName = queueId === '6653' ? 'Telemedicina (Videollamada)' : 'Guardia (Evaluación inicial)';
      console.log(`Formulario abierto para cola: ${queueId} - ${queueName}`);
      
      // Actualizar el título del modal y mostrar indicador del tipo de servicio
      const modalTitle = document.getElementById('modalTitle');
      const serviceIndicator = document.getElementById('serviceTypeIndicator');
      
      if (modalTitle && serviceIndicator) {
          modalTitle.textContent = `Reserva tu Turno - ${queueName}`;
          
          // Mostrar indicador del tipo de servicio
          serviceIndicator.innerHTML = `
              <div class="service-type-badge ${queueId === '6653' ? 'telemedicina' : 'guardia'}">
                  ${queueId === '6653' ? '🏥 Telemedicina' : '🚨 Guardia'}
              </div>
          `;
          serviceIndicator.classList.remove('hidden');
      }
    }
    window.showForm = showForm;
    
    // Función para mostrar el modal del formulario con el ID de cola específico
    function showFormModal(queueId = null) {
      // Guardar el ID de la cola en una variable global
      if (queueId) {
        window.currentQueueId = queueId;
        console.log('ID de cola establecido:', queueId);
      }
      showForm();
    }
    window.showFormModal = showFormModal;

function hideForm() {
  console.log('hideForm llamado desde:', new Error().stack);
  document.getElementById('formModal').style.display = 'none';
  
  // Limpiar la variable global de cola cuando se cierra el formulario
  if (window.currentQueueId) {
    console.log('Limpiando ID de cola:', window.currentQueueId);
    window.currentQueueId = null;
  }
}
window.hideForm = hideForm;

        // Funciones para el modal de reintegro
        function showReintegroModal() {
            document.getElementById('reintegroModal').style.display = 'block';
            document.getElementById('reintegroMessage').classList.add('hidden');
            document.getElementById('reintegroForm').reset();
            
            // Resetear el nombre del archivo
            document.getElementById('fileName').textContent = 'Seleccionar archivo';
            document.querySelector('.file-upload-label').classList.remove('has-file');
            
            console.log('Modal de reintegro abierto');
        }
        window.showReintegroModal = showReintegroModal;

        function hideReintegroModal() {
            document.getElementById('reintegroModal').style.display = 'none';
            console.log('Modal de reintegro cerrado');
        }
        window.hideReintegroModal = hideReintegroModal;

        // Función para manejar la selección de archivo
        function handleFileSelect(input) {
            const file = input.files[0];
            const fileName = document.getElementById('fileName');
            const label = document.querySelector('.file-upload-label');
            
            if (file) {
                fileName.textContent = file.name;
                label.classList.add('has-file');
                console.log('Archivo seleccionado:', file.name);
            } else {
                fileName.textContent = 'Seleccionar archivo';
                label.classList.remove('has-file');
            }
        }

        // Función para enviar la solicitud de reintegro
        async function enviarReintegro() {
            const submitBtn = document.getElementById('submitReintegroBtn');
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Enviando...';
                submitBtn.disabled = true;
                
                const formData = new FormData(document.getElementById('reintegroForm'));
                
                // Validar que se haya seleccionado un archivo
                const fileInput = document.getElementById('ordenMedicaInput');
                if (!fileInput.files[0]) {
                    throw new Error('Debes seleccionar una orden médica');
                }
                
                // Simular envío (aquí iría la llamada real a la API)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Mostrar mensaje de éxito
                const messageDiv = document.getElementById('reintegroMessage');
                messageDiv.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <div class="flex items-center">
                            <i class="bi bi-check-circle text-green-500 mr-2"></i>
                            <strong>¡Solicitud enviada exitosamente!</strong>
                        </div>
                        <p class="mt-2">Tu solicitud de reintegro ha sido recibida. Te contactaremos en un plazo máximo de 48 horas.</p>
                    </div>
                `;
                messageDiv.classList.remove('hidden');
                
                // Resetear el formulario
                document.getElementById('reintegroForm').reset();
                document.getElementById('fileName').textContent = 'Seleccionar archivo';
                document.querySelector('.file-upload-label').classList.remove('has-file');
                
                console.log('Solicitud de reintegro enviada exitosamente');
                
            } catch (error) {
                console.error('Error al enviar reintegro:', error);
                
                const messageDiv = document.getElementById('reintegroMessage');
                messageDiv.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <div class="flex items-center">
                            <i class="bi bi-exclamation-triangle text-red-500 mr-2"></i>
                            <strong>Error al enviar la solicitud</strong>
                        </div>
                        <p class="mt-2">${error.message}</p>
                    </div>
                `;
                messageDiv.classList.remove('hidden');
                
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
        window.enviarReintegro = enviarReintegro;

        // Función para mostrar mensajes
        function showMessage(text, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = `p-4 rounded-lg mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
            messageDiv.classList.remove('hidden');
        }

        // Función para manejar el envío del formulario
        async function handleSubmit(event) {
            console.log('🚀 handleSubmit EJECUTÁNDOSE - previniendo submit del formulario');
            event.preventDefault();
            
            console.log('=== INICIO DE RESERVA DE TURNO ===');
            
            if (isLoading) return;
            
            isLoading = true;
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.textContent = 'Reservando...';
            submitBtn.disabled = true;

            const formData = new FormData(event.target);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                dni: formData.get('dni'),
                email: formData.get('email')      
            };

            console.log('Datos del formulario:', data);

            try {
                console.log('Enviando solicitud al API...');
                
                // Obtener el ID de la cola desde la variable global
                const queueId = window.currentQueueId || '14003'; // Default a 14003 si no se estableció
                console.log('Usando ID de cola:', queueId);
                
                // Validar que el ID de cola sea válido
                if (!queueId || (queueId !== '6653' && queueId !== '14003')) {
                    throw new Error(`ID de cola inválido: ${queueId}. Debe ser 6653 (Telemedicina) o 14003 (Guardia)`);
                }
                
                const responseData = await FilaVirtualApi.enqueue('16223', '10750', data);
                const response = { ok: true, status: 200 };

                console.log('Respuesta del API:', response.status, response.ok);
                console.log('Headers de respuesta:', response.headers);
                console.log('URL de la respuesta:', response.url);

                if (response.ok) {
                    console.log('Datos del API recibidos:', responseData);
                    
                    // Verificar la estructura de la respuesta
                    console.log('Estructura de la respuesta:', {
                        jsonDetails: responseData.jsonDetails,
                        hasJsonDetails: !!responseData.jsonDetails,
                        actualTurn: responseData.jsonDetails?.actualTurn,
                        averageWaitingTime: responseData.jsonDetails?.averageWaitingTime,
                        queueName: responseData.jsonDetails?.queue?.name,
                        waitingRoomName: responseData.jsonDetails?.waitingRoom?.name
                    });
                    
                    // Extraer información del turno con fallbacks mejorados
                    let turnInfo = {
                        turno: 'N/A',
                        tiempoEspera: 'N/A',
                        especialidad: 'N/A',
                        salaEspera: 'N/A',
                        codigo: responseData.code || 'N/A', // Agregar el código del turno
                        videoCallUrl: null // Agregar campo para URL de videollamada
                    };
                    
                    // Verificar si existe videoCallUrl en el response
                    if (responseData.videoCallUrl) {
                        turnInfo.videoCallUrl = responseData.videoCallUrl;
                        console.log('✅ URL de videollamada encontrada:', responseData.videoCallUrl);
                    } else if (responseData.jsonDetails?.videoCallUrl) {
                        turnInfo.videoCallUrl = responseData.jsonDetails.videoCallUrl;
                        console.log('✅ URL de videollamada encontrada en jsonDetails:', responseData.jsonDetails.videoCallUrl);
                    } else if (responseData.jsonDetails?.queue?.videoCallUrl) {
                        turnInfo.videoCallUrl = responseData.jsonDetails.queue.videoCallUrl;
                        console.log('✅ URL de videollamada encontrada en queue:', responseData.jsonDetails.queue.videoCallUrl);
                    } else {
                        console.log('ℹ️ No se encontró URL de videollamada en el response');
                    }
                    
                    // Intentar extraer datos de diferentes estructuras posibles
                    if (responseData.jsonDetails) {
                        turnInfo.turno = responseData.jsonDetails.actualTurn || responseData.jsonDetails.turn || 'N/A';
                        turnInfo.tiempoEspera = responseData.jsonDetails.averageWaitingTime || responseData.jsonDetails.serviceTime || 'N/A';
                        turnInfo.especialidad = responseData.jsonDetails.queue?.name || 'N/A';
                        turnInfo.salaEspera = responseData.jsonDetails.waitingRoom?.name || 'N/A';
                    } else if (responseData.code) {
                        // Si no hay jsonDetails, usar datos del nivel principal
                        turnInfo.turno = responseData.code || 'N/A';
                        turnInfo.tiempoEspera = responseData.jsonDetails?.serviceTime || 'N/A';
                        turnInfo.especialidad = 'Atención General';
                        turnInfo.salaEspera = 'Sala Principal';
                    }
                    
                    console.log('Información del turno extraída:', turnInfo);
                    
                    // Guardar el código del turno en localStorage
                    if (responseData.code) {
                        localStorage.setItem('turnCode', responseData.code);
                    }
                    
                    // IMPORTANTE: Mostrar información del turno ANTES de cualquier otra cosa
                    console.log('Llamando a showTurnInfoInModal con:', turnInfo);
                    showTurnInfoInModal(turnInfo);
                    
                    console.log('Información del turno mostrada en el modal');
                    
                    // Verificación adicional de que el turno se generó
                    if (turnInfo.turno !== 'N/A') {
                        console.log('✅ TURNO GENERADO EXITOSAMENTE:', turnInfo.turno);
                    } else {
                        console.log('⚠️ ADVERTENCIA: No se pudo extraer el número de turno');
                    }
                    
                } else {
                    throw new Error('Error en la respuesta del servidor: ' + response.status);
                }
            } catch (error) {
                console.error('Error durante la reserva:', error);
                showErrorInModal('Error al reservar el turno: ' + error.message);
            } finally {
                isLoading = false;
                submitBtn.textContent = 'Reservar Turno';
                submitBtn.disabled = false;
                console.log('=== FIN DE RESERVA DE TURNO ===');
            }
            
            // IMPORTANTE: Prevenir que el formulario se envíe
            return false;
        }
        
        // Hacer la función handleSubmit disponible globalmente
        window.handleSubmit = handleSubmit;

        // Función para el botón "Estoy aquí"
        async function handleEstoyAqui() {
            if (isLoading) return;
            
            isLoading = true;
            const btn = document.getElementById('estoyAquiBtn');
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            try {
                const responseData = await FilaVirtualApi.enqueueByAlias('Jorge', '16223', '10588', 'dni-only');
                const response = { ok: true };

                if (response.ok) {
                    
                    // Extraer información del turno
                    const turnInfo = {
                        turno: responseData.jsonDetails?.actualTurn || 'N/A',
                        tiempoEspera: responseData.jsonDetails?.averageWaitingTime || 'N/A',
                        especialidad: responseData.jsonDetails?.queue?.name || 'N/A',
                        salaEspera: responseData.jsonDetails?.waitingRoom?.name || 'N/A'
                    };
                    
                    // Mostrar información del turno en modal flotante
                    showTurnInfo(turnInfo);
                    
                    alert('¡Notificación enviada exitosamente!');
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al enviar la notificación. Por favor, inténtalo de nuevo.');
            } finally {
                isLoading = false;
                btn.textContent = '¡Estoy aquí!';
                btn.disabled = false;
            }
        }

        // Función para el botón "Estoy acá" (nueva sección)
        async function handleEstoyAca() {
            if (isLoading) return;
            
            isLoading = true;
            const btn = document.getElementById('estoyAcaBtn');
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-6 h-6 mr-3 animate-spin"></i>Enviando...';
            btn.disabled = true;

            try {
                const responseData = await FilaVirtualApi.enqueueByAlias('Jorge', '16224', '10588', 'dni-only');
                const response = { ok: true };

                if (response.ok) {
                    
                    // Extraer información del turno
                    const turnInfo = {
                        turno: responseData.jsonDetails?.actualTurn || 'N/A',
                        tiempoEspera: responseData.jsonDetails?.averageWaitingTime || 'N/A',
                        especialidad: responseData.jsonDetails?.queue?.name || 'N/A',
                        salaEspera: responseData.jsonDetails?.waitingRoom?.name || 'N/A'
                    };
                    
                    // Mostrar información del turno en modal flotante
                    showTurnInfo(turnInfo);
                    
                    // Mostrar mensaje de éxito con estilo
                    showSuccessMessage('¡Perfecto! Ya estás registrado en la cola. Te atenderemos pronto.');
                    btn.innerHTML = '<i data-lucide="check" class="w-6 h-6 mr-3"></i>¡Enviado!';
                    btn.classList.remove('bg-primary-500', 'hover:bg-primary-600');
                    btn.classList.add('bg-green-600', 'hover:bg-green-700');
                     
                    // Resetear después de 3 segundos
                    setTimeout(() => {
                        btn.innerHTML = originalContent;
                        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                        btn.classList.add('bg-primary-500', 'hover:bg-primary-600');
                    }, 3000);
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('Error al enviar la notificación. Por favor, inténtalo de nuevo.');
            } finally {
                isLoading = false;
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        }

        // Función para mostrar mensaje de éxito
        function showSuccessMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
            messageDiv.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-3"></i>
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(messageDiv);
            lucide.createIcons();

            // Remover después de 5 segundos
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }

                 // Función para mostrar mensaje de error
         function showErrorMessage(message) {
             const messageDiv = document.createElement('div');
             messageDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
             messageDiv.innerHTML = `
                 <div class="flex items-center">
                     <i data-lucide="alert-circle" class="w-6 h-6 mr-3"></i>
                     <span>${message}</span>
                 </div>
             `;
             document.body.appendChild(messageDiv);
             lucide.createIcons();

             // Remover después de 5 segundos
             setTimeout(() => {
                 messageDiv.remove();
             }, 5000);
         }

                  // Función para mostrar errores dentro del modal
         function showErrorInModal(errorMessage) {
             console.log('=== MOSTRANDO ERROR EN MODAL ===');
             console.log('Mensaje de error:', errorMessage);
             
             try {
                 const form = document.getElementById('reservaForm');
                 
                 if (!form) {
                     console.error('ERROR: No se encontró el formulario para mostrar error');
                     return;
                 }
                 
                 const errorHTML = `
                     <div class="error-container">
                         <div class="error-icon">
                             <i class="bi bi-exclamation-triangle-fill indexNumiaCare-inline-7"></i>
                         </div>
                         <h4 class="text-lg font-semibold text-center mb-4 indexNumiaCare-inline-8">Error en la Reserva</h4>
                         <p class="error-message text-center mb-4">${errorMessage}</p>
                         <div class="text-center">
                             <button class="boton-fecha" data-onclick="resetFormInModal()">Intentar de Nuevo</button>
                             <button class="boton-fecha indexNumiaCare-inline-9" data-onclick="hideForm()">Cerrar</button>
                         </div>
                     </div>
                 `;
                 
                 form.innerHTML = errorHTML;
                 console.log('Error mostrado en modal exitosamente');
                 
             } catch (error) {
                 console.error('ERROR en showErrorInModal:', error);
             }
         }
         
         // Función para resetear el formulario en el modal
         function resetFormInModal() {
             const form = document.getElementById('reservaForm');
             
             const formHTML = `
                 <label>Nombre</label>
                 <input type="text" name="firstName" required class="input-field" />

                 <label>Apellido</label>
                 <input type="text" name="lastName" required class="input-field" />

                 <label>DNI</label>
                 <input type="text" name="dni" required class="input-field" />

                 <label>Email</label>
                 <input type="email" name="email" required class="input-field" />

                 <label>Teléfono</label>
                 <input type="tel" name="phone" required class="input-field" />

                 <div class="d-flex justify-content-between pt-3">
                     <button type="submit" class="boton-fecha" id="submitBtn">Reservar Turno</button>
                     <button type="button" class="boton-fecha" data-onclick="hideForm()">Cancelar</button>
                 </div>
             `;
             
             form.innerHTML = formHTML;
             
             // Reasignar el event listener
             form.addEventListener('submit', handleSubmit);
         }
         
         // Función para mostrar información del turno dentro del modal
         function showTurnInfoInModal(turnInfo) {
             try {
                 // Obtener elementos del DOM
                 const form = document.getElementById('reservaForm');
                 const message = document.getElementById('message');
                 
                 if (!form) {
                     console.error('ERROR: No se encontró el formulario');
                     return;
                 }
                 
                 // Obtener el código del turno desde turnInfo
                 const turnCode = turnInfo.codigo;
                 
                 // Crear el HTML para mostrar la información del turno con actualizaciones en tiempo real
                 const turnInfoHTML = `
                     <div class="turn-info-container">
                         <h4 class="turn-success-title">✅ Turno Reservado Exitosamente</h4>
                         <p class="turn-success-subtitle">¡Tu turno ha sido generado en el sistema!</p>
                         
                         <div class="turn-info-compact-grid">
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Código:</div>
                                 <div class="turn-info-value" id="turnCodeDisplay">${turnCode || 'No disponible'}</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Turno:</div>
                                 <div class="turn-info-value">${turnInfo.turno}</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Estado:</div>
                                 <div class="turn-info-value" id="turnStatus">Consultando...</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Espera Actual:</div>
                                 <div class="turn-info-value" id="currentWaitingTime">Consultando...</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Promedio:</div>
                                 <div class="turn-info-value">${turnInfo.tiempoEspera} min</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Especialidad:</div>
                                 <div class="turn-info-value">${turnInfo.especialidad}</div>
                             </div>
                             <div class="turn-info-row">
                                 <div class="turn-info-label">Sala:</div>
                                 <div class="turn-info-value">${turnInfo.salaEspera}</div>
                             </div>
                                                           ${turnInfo.videoCallUrl+ '?videocallUser=mobile' ? `
                              <div class="turn-info-row video-call-row">
                                  <div class="turn-info-label">Videollamada:</div>
                                  <div class="turn-info-value">
                                      <button data-onclick="showVideoCall('${turnInfo.videoCallUrl}?videocallUser=mobile')" class="video-call-btn">
                                          🎥 Unirse
                                      </button>
                                  </div>
                              </div>
                              ` : ''}
                         </div>
                         
                         <div class="turn-actions">
                             <button class="boton-fecha turn-close-btn" data-onclick="hideForm()">Cerrar</button>
                         </div>
                     </div>
                 `;
                 
                                   // Ocultar el formulario y mostrar la información del turno
                  form.style.display = 'none';
                  message.innerHTML = turnInfoHTML;
                  message.classList.remove('hidden');
                  
                  // Guardar la información del turno para poder volver desde la videollamada
                  window.lastTurnInfo = {
                      turno: turnInfo.turno,
                      tiempoEspera: turnInfo.tiempoEspera,
                      especialidad: turnInfo.especialidad,
                      salaEspera: turnInfo.salaEspera,
                      codigo: turnInfo.codigo,
                      videoCallUrl: turnInfo.videoCallUrl
                  };
                  
                  console.log('✅ Información del turno guardada para navegación:', window.lastTurnInfo);
                  
                  // Iniciar el polling del estado del turno
                  if (turnCode && turnCode !== 'N/A' && turnCode !== 'No disponible') {
                      startTurnStatusPolling(turnCode, turnInfo);
                  }
                 
             } catch (error) {
                 console.error('Error en showTurnInfoInModal:', error);
                 
                 // Mostrar mensaje de error genérico
                 const form = document.getElementById('reservaForm');
                 const message = document.getElementById('message');
                 
                 if (form && message) {
                     form.style.display = 'none';
                     message.innerHTML = `
                         <div class="error-container">
                             <h4 class="text-lg font-semibold text-center mb-4 indexNumiaCare-inline-8">❌ Error al mostrar información del turno</h4>
                             <p class="text-center mb-4">Hubo un problema al procesar la información del turno.</p>
                             <div class="text-center">
                                 <button class="boton-fecha" data-onclick="showForm()">Volver</button>
                             </div>
                         </div>
                     `;
                     message.classList.remove('hidden');
                 }
             }
         }
         

         

         
         // Función para reservar turno real invocando el API
         async function reservarTurnoReal() {
             console.log('=== RESERVANDO TURNO REAL ===');
             
             // Obtener los datos del formulario
             const form = document.getElementById('reservaForm');
             const firstName = form.querySelector('input[name="firstName"]').value;
             const lastName = form.querySelector('input[name="lastName"]').value;
             const dni = form.querySelector('input[name="dni"]').value;
             const email = form.querySelector('input[name="email"]').value;
             const phone = form.querySelector('input[name="phone"]').value;
             
             // Validar que todos los campos estén completos
             if (!firstName || !lastName || !dni || !email || !phone) {
                 alert('Por favor, completa todos los campos del formulario');
                 return;
             }
             
             console.log('Datos del formulario:', { firstName, lastName, dni, email, phone });
             
             // Cambiar el botón a estado de carga
             const submitBtn = document.getElementById('submitBtn');
             const originalText = submitBtn.textContent;
             submitBtn.textContent = 'Reservando...';
             submitBtn.disabled = true;
             
             try {
                 console.log('Invocando API para reservar turno...');
                 
                 // Obtener el ID de la cola desde la variable global
                 const queueId = window.currentQueueId || '14003'; // Default a 14003 si no se estableció
                 console.log('Usando ID de cola en reservarTurnoReal:', queueId);
                 
                 // Validar que el ID de cola sea válido
                 if (!queueId || (queueId !== '6653' && queueId !== '14003')) {
                     throw new Error(`ID de cola inválido: ${queueId}. Debe ser 6653 (Telemedicina) o 14003 (Guardia)`);
                 }
                 
                 const responseData = await FilaVirtualApi.enqueue('16223', '10750', {
                         firstName,
                         lastName,
                         dni,
                         email,
                         phone
                     });
                 const response = { ok: true, status: 200 };
                 
                 console.log('Respuesta del API:', response.status, response.ok);
                 
                 if (response.ok) {
                     const responseData = await response.json();
                     console.log('Datos del API recibidos:', responseData);
                     
                     // Log detallado de la estructura de la respuesta
                     console.log('Estructura de la respuesta:', {
                         hasJsonDetails: !!responseData.jsonDetails,
                         jsonDetailsKeys: responseData.jsonDetails ? Object.keys(responseData.jsonDetails) : 'No existe',
                         actualTurn: responseData.jsonDetails?.actualTurn,
                         turn: responseData.jsonDetails?.turn,
                         averageWaitingTime: responseData.jsonDetails?.averageWaitingTime,
                         serviceTime: responseData.jsonDetails?.serviceTime,
                         queueName: responseData.jsonDetails?.queue?.name,
                         waitingRoomName: responseData.jsonDetails?.waitingRoom?.name,
                         code: responseData.code
                     });
                     
                     // Log específico para el turno
                     console.log('🔍 VALORES DEL TURNO:', {
                         'responseData.jsonDetails.turn': responseData.jsonDetails?.turn,
                         'responseData.jsonDetails.actualTurn': responseData.jsonDetails?.actualTurn,
                         'responseData.code': responseData.code
                     });
                     
                     // Extraer información del turno con fallbacks mejorados
                     let turnInfo = {
                         turno: 'N/A',
                         tiempoEspera: 'N/A',
                         especialidad: 'N/A',
                         salaEspera: 'N/A',
                         codigo: responseData.code || 'N/A', // Agregar el código del turno
                         videoCallUrl: null // Agregar campo para URL de videollamada
                     };
                     
                     // Verificar si existe videoCallUrl en el response
                     if (responseData.videoCallUrl) {
                         turnInfo.videoCallUrl = responseData.videoCallUrl;
                         console.log('✅ URL de videollamada encontrada en reservarTurnoReal:', responseData.videoCallUrl);
                     } else if (responseData.jsonDetails?.videoCallUrl) {
                         turnInfo.videoCallUrl = responseData.jsonDetails.videoCallUrl;
                         console.log('✅ URL de videollamada encontrada en jsonDetails:', responseData.jsonDetails.videoCallUrl);
                     } else if (responseData.jsonDetails?.queue?.videoCallUrl) {
                         turnInfo.videoCallUrl = responseData.jsonDetails.queue.videoCallUrl;
                         console.log('✅ URL de videollamada encontrada en queue:', responseData.jsonDetails.queue.videoCallUrl);
                     } else {
                         console.log('ℹ️ No se encontró URL de videollamada en el response de reservarTurnoReal');
                     }
                     
                     // Intentar extraer datos de diferentes estructuras posibles
                     if (responseData.jsonDetails) {
                         turnInfo.turno = responseData.jsonDetails.turn || responseData.jsonDetails.actualTurn || 'N/A';
                         turnInfo.tiempoEspera = responseData.jsonDetails.serviceTime || responseData.jsonDetails.averageWaitingTime || 'N/A';
                         turnInfo.especialidad = responseData.jsonDetails.queue?.name || 'N/A';
                         turnInfo.salaEspera = responseData.jsonDetails.waitingRoom?.name || 'N/A';
                     } else if (responseData.code) {
                         // Si no hay jsonDetails, usar datos del nivel principal
                         turnInfo.turno = responseData.code || 'N/A';
                         turnInfo.tiempoEspera = responseData.jsonDetails?.serviceTime || 'N/A';
                         turnInfo.especialidad = 'Atención General';
                         turnInfo.salaEspera = 'Sala Principal';
                     }
                     
                     // Redondear el tiempo de espera para mostrar solo la parte entera
                     if (turnInfo.tiempoEspera !== 'N/A' && !isNaN(turnInfo.tiempoEspera)) {
                         const tiempoOriginal = turnInfo.tiempoEspera;
                         turnInfo.tiempoEspera = Math.floor(parseFloat(turnInfo.tiempoEspera));
                         console.log(`Tiempo de espera redondeado: ${tiempoOriginal} → ${turnInfo.tiempoEspera}`);
                     }
                     
                     console.log('Información del turno extraída:', turnInfo);
                     
                     // Log específico para verificar el valor del turno
                     console.log('🎯 VALOR FINAL DEL TURNO:', {
                         'turnInfo.turno': turnInfo.turno,
                         'tipo': typeof turnInfo.turno,
                         'longitud': turnInfo.turno ? turnInfo.turno.length : 'N/A'
                     });
                     
                     // Guardar el código del turno en localStorage
                     if (responseData.code) {
                         localStorage.setItem('turnCode', responseData.code);
                         console.log('✅ Código del turno guardado en localStorage:', responseData.code);
                     }
                     
                     // Mostrar la información del turno en el modal
                     showTurnInfoInModal(turnInfo);
                     
                     console.log('✅ TURNO RESERVADO EXITOSAMENTE:', turnInfo.turno);
                     
                 } else {
                     throw new Error('Error en la respuesta del servidor: ' + response.status);
                 }
                 
             } catch (error) {
                 console.error('Error durante la reserva del turno:', error);
                 
                 // Mostrar error en el modal
                 showErrorInModal('Error al reservar el turno: ' + error.message);
                 
             } finally {
                 // Restaurar el botón
                 submitBtn.textContent = originalText;
                 submitBtn.disabled = false;
                 console.log('=== FIN DE RESERVA DE TURNO ===');
             }
         }
         
         // Hacer las funciones disponibles globalmente
         window.reservarTurnoReal = reservarTurnoReal;
         window.startTurnStatusPolling = startTurnStatusPolling;
         window.stopTurnStatusPolling = stopTurnStatusPolling;
         
         // Función para consultar recurrentemente el estado del turno
         function startTurnStatusPolling(turnCode, turnInfo) {
             // Verificar que se recibió el código del turno
             if (!turnCode || turnCode === 'N/A' || turnCode === 'No disponible') {
                 console.error('No se recibió código de turno válido para consultar:', turnCode);
                 return;
             }
             
             // Inicializar contador de consultas
             let callCount = 0;
             
             // Función para realizar la consulta a la API
             async function consultarEstadoTurno() {
                 try {
                     // Incrementar contador de consultas (solo para logging interno)
                     callCount++;
                     
                     // Consultar la API del estado del turno
                     const response = { ok: true };
                     const data = await FilaVirtualApi.getTurnByCode(turnCode, { profile: 'turn' });
                     
                     if (response.ok) {
                         // Actualizar estado del turno
                         const statusElement = document.getElementById('turnStatus');
                         if (statusElement) {
                             let statusText = data.status || 'Desconocido';
                             
                             // Traducir estados específicos
                             if (data.status === 'ANNOUNCED') {
                                 statusText = 'Lo estamos llamando';
                                 
                                                                   // Si el estado es ANNOUNCED y hay URL de videollamada, mostrarla
                                  if (turnInfo && turnInfo.videoCallUrl) {
                                      const videoCallUrl = turnInfo.videoCallUrl + '?videocallUser=mobile';
                                      statusElement.innerHTML = `
                                          <div>${statusText}</div>
                                          <div class="indexNumiaCare-inline-10">
                                              <button data-onclick="showVideoCall('${videoCallUrl+ '?videocallUser=mobile'}')" class="video-call-btn">
                                                  🎥 Unirse a la videollamada
                                              </button>
                                          </div>
                                      `;
                                  } else {
                                      statusElement.textContent = statusText;
                                  }
                             } else if (data.status === 'WAITING_TO_BE_CALLED') {
                                 statusText = 'En breve lo llamaremos';
                                 statusElement.textContent = statusText;
                             } else if (data.status === 'FINALIZED') {
                                 statusText = 'Atención finalizada';
                                 statusElement.textContent = statusText;
                             } else {
                                 statusElement.textContent = statusText;
                             }
                             
                             statusElement.style.color = getStatusColor(data.status);
                         }
                         
                         // Actualizar tiempo de espera actual
                         const waitingTimeElement = document.getElementById('currentWaitingTime');
                         if (waitingTimeElement) {
                             waitingTimeElement.textContent = data.averageWaitingTime ? `${data.averageWaitingTime} min` : 'N/A';
                         }
                         
                     } else {
                         // Mostrar error en los elementos
                         const statusElement = document.getElementById('turnStatus');
                         const waitingTimeElement = document.getElementById('currentWaitingTime');
                         
                         if (statusElement) {
                             statusElement.textContent = 'Error al consultar';
                             statusElement.style.color = '#dc3545';
                         }
                         
                         if (waitingTimeElement) {
                             waitingTimeElement.textContent = 'Error al consultar';
                             waitingTimeElement.style.color = '#dc3545';
                         }
                     }
                     
                 } catch (error) {
                     console.error(`Error en consulta de estado del turno (consulta #${callCount}):`, error);
                     
                     // Mostrar error en los elementos
                     const statusElement = document.getElementById('turnStatus');
                     const waitingTimeElement = document.getElementById('currentWaitingTime');
                     
                     if (statusElement) {
                         statusElement.textContent = 'Error de conexión';
                         statusElement.style.color = '#dc3545';
                     }
                     
                     if (waitingTimeElement) {
                         waitingTimeElement.textContent = 'Error de conexión';
                         waitingTimeElement.style.color = '#dc3545';
                     }
                 }
             }
             
             // Función para obtener color según el estado
             function getStatusColor(status) {
                 const statusLower = status.toLowerCase();
                 if (statusLower.includes('espera') || statusLower.includes('waiting')) return '#ffc107';
                 if (statusLower.includes('atendiendo') || statusLower.includes('attending')) return '#28a745';
                 if (statusLower.includes('completado') || statusLower.includes('completed')) return '#17a2b8';
                 if (statusLower.includes('cancelado') || statusLower.includes('cancelled')) return '#dc3545';
                 return '#6c757d';
             }
             
             // Realizar la primera consulta inmediatamente
             consultarEstadoTurno();
             
             // Configurar consultas recurrentes cada 5 segundos
             const pollingInterval = setInterval(consultarEstadoTurno, 5000);
             
             // Guardar el intervalo para poder detenerlo si es necesario
             window.turnStatusPollingInterval = pollingInterval;
         }
         
         // Función para detener las consultas recurrentes (opcional)
         function stopTurnStatusPolling() {
             if (window.turnStatusPollingInterval) {
                 clearInterval(window.turnStatusPollingInterval);
                 window.turnStatusPollingInterval = null;
             }
         }
         
                   // Hacer las funciones disponibles globalmente
          window.startTurnStatusPolling = startTurnStatusPolling;
          window.stopTurnStatusPolling = stopTurnStatusPolling;
          window.showVideoCall = showVideoCall;
          
          // Función para abrir la videollamada en una nueva pestaña
          function showVideoCall(videoUrl) {
              try {
                  console.log('Abriendo videollamada en nueva pestaña:', videoUrl);
                  if (!videoUrl) {
                      throw new Error('No se encontró una URL de videollamada válida');
                  }
                  window.open(videoUrl, '_blank', 'noopener,noreferrer');
                  
              } catch (error) {
                  console.error('Error al abrir la videollamada:', error);
                  
                  // Mostrar mensaje de error
                  const message = document.getElementById('message');
                  if (message) {
                      message.innerHTML = `
                          <div class="error-container">
                              <h4 class="text-lg font-semibold text-center mb-4 indexNumiaCare-inline-8">❌ Error al abrir la videollamada</h4>
                              <p class="text-center mb-4">No se pudo abrir la videollamada en una nueva pestaña. Intenta nuevamente.</p>
                              <div class="text-center">
                                  <button class="boton-fecha" data-onclick="showTurnInfoInModal(window.lastTurnInfo)">
                                      Volver al turno
                                  </button>
                              </div>
                          </div>
                      `;
                  }
              }
          }
         
         // Función para mostrar información del turno (modal flotante)
         function showTurnInfo(turnInfo) {
             const turnInfoDiv = document.createElement('div');
             turnInfoDiv.className = 'fixed top-4 left-4 bg-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-md turn-info-display';
             turnInfoDiv.innerHTML = `
                 <div class="flex items-center justify-between mb-3">
                     <h4 class="text-lg font-semibold">Información del Turno</h4>
                     <button data-onclick="this.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                 </div>
                 <div class="space-y-3">
                     <div class="info-row">
                         <span class="info-label">Número de Turno:</span>
                         <span class="info-value">${turnInfo.turno}</span>
                     </div>
                     <div class="info-row">
                         <span class="info-label">Tiempo Promedio de Espera:</span>
                         <span class="info-value">${turnInfo.tiempoEspera} min</span>
                     </div>
                     <div class="info-row">
                         <span class="info-label">Especialidad:</span>
                         <span class="info-value">${turnInfo.especialidad}</span>
                     </div>
                     <div class="info-row">
                         <span class="info-label">Sala de Espera:</span>
                         <span class="info-value">${turnInfo.salaEspera}</span>
                     </div>
                 </div>
             `;
             document.body.appendChild(turnInfoDiv);
         }
         
         // Función para abrir popup de Medicina al Viajero
         function openViajeroPopup() {
             const url = 'https://filavirtual2.debmedia.com/app/buscar/ventasalud?queueName=Atención con especialista - Videollamada&branchId=10750';
             const popup = window.open(url, 'ViajeroPopup', 'width=800,height=600,scrollbars=yes,resizable=yes', 600, 400);
             
             // Enfocar el popup si se abrió correctamente
             if (popup) {
                 popup.focus();
             } else {
                 // Si el popup fue bloqueado, mostrar mensaje
                 showErrorMessage('El popup fue bloqueado. Por favor, permite popups para este sitio.');
             }
         }

        // Event listeners
        document.getElementById('reservaForm').addEventListener('submit', handleSubmit);

        // Cerrar modal al hacer clic fuera de él (solo cuando esté habilitado)
        document.getElementById('formModal').addEventListener('click', function(e) {
            console.log('Modal clickeado, target:', e.target, 'this:', this);
            console.log('pointerEvents del modal:', this.style.pointerEvents);
            
            if (e.target === this && this.style.pointerEvents !== 'none') {
                console.log('Cerrando modal por clic fuera');
                hideForm();
            } else {
                console.log('Modal no se puede cerrar - pointerEvents bloqueado');
            }
        });

window.fechaSeleccionadaGlobal = null;
window.duracionSeleccionadaGlobal = null;

    flatpickr("#fecha", {
      dateFormat: "Y-m-d",
      minDate: "today", // evitar fechas anteriores
      onChange: function(selectedDates, dateStr) {
        if (selectedDates.length > 0) {
          consultarDisponibilidad(dateStr);
        }
      }
    });

    async function consultarDisponibilidad(strDate) {
      const resultados = document.getElementById("resultados");
      resultados.innerHTML = "Consultando disponibilidad...";

      const strDateEncoded = encodeURIComponent(strDate);
              const branchId = document.getElementById("sucuComboValue").value;
              const scheduleId = document.getElementById("salaComboValue").value;
      const citasPath = `${scheduleId}/branch/${branchId}/availability?strDate=${strDateEncoded}`;

      try {
        const data = await DebmediaApi.citasRequest('schedules/' + citasPath, { profile: 'care' });

        const dias = Array.isArray(data) ? data : (Array.isArray(data.slots) ? data.slots : []);

        if (dias.length === 0) {
          resultados.innerHTML = "No hay horarios disponibles para esta fecha.";
          return;
        }

        let html = "<div><h3 class='titulo'>Horarios disponibles:</h3></div>";
        html+="<div>"
        dias.forEach(dia => {
          const horaMinuto = dia.zonedStartDate.substring(11, 16);
          html += `&nbsp<button class="boton-fecha" data-onclick="mostrarFormulario('${dia.zonedStartDate}', ${dia.defaultDuration})">${horaMinuto}</button>&nbsp`;
        });
          html+="</div>"
        resultados.innerHTML = html;

      } catch (err) {
        console.error("Error atrapado:", err);
        resultados.innerHTML = `<strong>Error:</strong> ${err.message}`;
      }
    }

    function mostrarFormulario(fecha, duracion) {
      window.fechaSeleccionadaGlobal = fecha;
      window.duracionSeleccionadaGlobal = duracion;

      const resultados = document.getElementById("formularioDatos");
	document.getElementById("formularioDatos").style.display = "block";

	//document.getElementById("bloqueFecha").style.display = "none";
	//document.getElementById("formularioInicial").style.display = "none";

	document.getElementById("resultados").style.display = "none";


      let html = `
        <h3 class='titulo'>Completa tus datos</h3>
        <form id="formularioTurno" data-onsubmit="return enviarFormulario(event)">
          <label>Nombre:</label>
          <input type="text" id="nombre" required>
          <label>Apellido:</label>
          <input type="text" id="apellido" required>
          <label>DNI:</label>
          <input type="text" id="dni" required>
          <label>Email:</label>
          <input type="email" id="email" required>
          <label>Motivo:</label>
          <select id="motivo" required>
            <option value="">Seleccionar...</option>
            <option value="Consulta general">Consulta general</option>
            <option value="Revisión">Revisión</option>
            <option value="Control de tratamiento">Control de tratamiento</option>
          </select>
          <br><br>
          <button type="submit" class="boton-fecha">Confirmar Turno</button>
        </form>
      `;
      resultados.innerHTML = html;
    }
window.mostrarFormulario = mostrarFormulario;
    function enviarFormulario(event) {
      event.preventDefault();
      const datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        dni: parseInt(document.getElementById("dni").value),
        email: document.getElementById("email").value,
        motivo: document.getElementById("motivo").value
      };

      crearCita(window.fechaSeleccionadaGlobal, window.duracionSeleccionadaGlobal, datos);
    }

    async function crearCita(fechaInicio, duracionMinutos, datosCliente) {
      const resultados = document.getElementById("final");

      const startDate = new Date(fechaInicio);
      const endDate = new Date(startDate.getTime() + duracionMinutos * 60000);

      const pad = n => n.toString().padStart(2, '0');
        resultados.innerHTML = `1`;
      function formatISO(date) {
        const yyyy = date.getFullYear();
        const MM = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const mm = pad(date.getMinutes());
        return `${yyyy}-${MM}-${dd}T${hh}:${mm}:00-0300`;
      }

      const startAt = formatISO(startDate);
      const endAt = formatISO(endDate);

      const data = {
        branch: { id:  document.getElementById("sucuComboValue").value },
        schedule: { id:  document.getElementById("salaComboValue").value },
        startAt: startAt,
        endAt: endAt,
        customer: {
          firstName: datosCliente.nombre,
          lastName: datosCliente.apellido,
          dni: datosCliente.dni
         // email: datosCliente.email
        },
        reason: datosCliente.motivo
      };
      try {
        const resultado = await DebmediaApi.citasRequest('appointments', {
          method: 'POST',
          body: data,
          profile: 'care'
        });



document.getElementById("formularioDatos").style.display = "none";
        resultados.innerHTML = `<strong>✅ La reserva fue creada correctamente. ID: ${resultado.id}</strong>`;

      } catch (error) {
        console.error("Error:", error);
        resultados.innerHTML = `<strong>❌ Error al generar la cita:</strong> ${error.message}`;
      }
    }


async function cargarCombosDesdeAPI() {
  const salaCombo = document.getElementById("salaCombo");
  const sucuCombo = document.getElementById("sucuCombo");

  // Configurar flatpickr
  flatpickr("#fecha", {
    dateFormat: "Y-m-d",
    minDate: "today",
    onChange: function(selectedDates, dateStr) {
      if (selectedDates.length > 0) {
        consultarDisponibilidad(dateStr);
      }
    }
  });

  // Cargar sucursales desde la API
  try {
    const data = await DebmediaApi.citasRequest('reducedSchedules', { profile: 'care' });

    // Limpiar y preparar el contenedor de sucursales
    sucuCombo.innerHTML = '';
    
    const addedBranchIds = new Set();
    
    data.forEach(sala => {
      if (Array.isArray(sala.branches)) {
        sala.branches.forEach(branch => {
          if (!addedBranchIds.has(branch.id)) {
            // Crear card de sucursal
            const sucursalCard = document.createElement('div');
            sucursalCard.className = 'sucursal-card';
            sucursalCard.dataset.value = branch.id;
            sucursalCard.innerHTML = `
              <i class="bi bi-building sucursal-icon"></i>
              <div class="sucursal-info">
                <div class="sucursal-name">${branch.name}</div>
                <div class="sucursal-status">Disponible</div>
              </div>
            `;
            
            // Agregar evento de click
            sucursalCard.addEventListener('click', function() {
              // Remover selección previa
              document.querySelectorAll('.sucursal-card').forEach(card => {
                card.classList.remove('selected');
              });
              
              // Seleccionar esta card
              this.classList.add('selected');
              
              // Actualizar el valor oculto
              document.getElementById('sucuComboValue').value = branch.id;
              
              // Cargar salas basadas en especialidad y sucursal seleccionadas
              cargarSalasPorEspecialidadYSucursal();
            });
            
            sucuCombo.appendChild(sucursalCard);
            addedBranchIds.add(branch.id);
          }
        });
      }
    });
    
    // Agregar eventos de click para las especialidades
    document.querySelectorAll('.especialidad-card').forEach(card => {
      card.addEventListener('click', function() {
        // Remover selección previa
        document.querySelectorAll('.especialidad-card').forEach(c => {
          c.classList.remove('selected');
        });
        
        // Seleccionar esta card
        this.classList.add('selected');
        
        // Actualizar el valor oculto
        document.getElementById('especialidadComboValue').value = this.dataset.value;
        
        // Mostrar el selector de sucursales
        document.querySelector('.sucursal-selector').style.display = 'block';
        
        // Cargar salas basadas en especialidad y sucursal seleccionadas
        cargarSalasPorEspecialidadYSucursal();
      });
    });

    document.getElementById('popupModal').style.display='block';

  } catch (err) {
    console.error("Error al cargar sucursales:", err);
    sucuCombo.innerHTML = `<div class="error-card">
      <i class="bi bi-exclamation-triangle"></i>
      <span>Error cargando sucursales</span>
    </div>`;
  }
}

// Nueva función para cargar salas basadas en especialidad y sucursal
async function cargarSalasPorEspecialidadYSucursal() {
  const salaCombo = document.getElementById("salaCombo");
  const especialidadSeleccionada = document.getElementById("especialidadComboValue").value;
  const sucursalSeleccionada = document.getElementById("sucuComboValue").value;

  // Validar que ambos estén seleccionados
  if (!especialidadSeleccionada || !sucursalSeleccionada) {
    salaCombo.innerHTML = `<div class="loading-card">
      <i class="bi bi-arrow-clockwise spin"></i>
      <span>Selecciona especialidad y sucursal para ver las salas disponibles</span>
    </div>`;
    return;
  }

  // Usar directamente el data-value de la especialidad seleccionada
  const especialidadValue = especialidadSeleccionada;
  
  // Mostrar loading
  salaCombo.innerHTML = `<div class="loading-card">
    <i class="bi bi-arrow-clockwise spin"></i>
    <span>Cargando salas para ${especialidadValue}...</span>
  </div>`;

  try {
    const data = await DebmediaApi.citasRequest('schedules?tags.name=' + encodeURIComponent(especialidadValue), { profile: 'care' });

    // Limpiar contenedor de salas
    salaCombo.innerHTML = '';
    
    // Filtrar salas que pertenezcan a la sucursal seleccionada
    const salasFiltradas = data.filter(sala => {
      return Array.isArray(sala.branches) && 
             sala.branches.some(branch => branch.id === parseInt(sucursalSeleccionada));
    });

    if (salasFiltradas.length === 0) {
      salaCombo.innerHTML = `<div class="error-card">
        <i class="bi bi-exclamation-triangle"></i>
        <span>No hay salas disponibles para ${especialidadValue} en esta sucursal</span>
      </div>`;
      return;
    }

    // Crear cards de salas
    salasFiltradas.forEach(sala => {
      const salaCard = document.createElement('div');
      salaCard.className = 'sala-card';
      salaCard.dataset.value = sala.id;
      salaCard.innerHTML = `
        <i class="bi bi-door-open sala-icon"></i>
        <div class="sala-info">
          <div class="sala-name">${sala.name}</div>
          <div class="sala-status">Disponible</div>
        </div>
      `;
      
      // Agregar evento de click para sala
      salaCard.addEventListener('click', function() {
        // Remover selección previa
        document.querySelectorAll('.sala-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Seleccionar esta card
        this.classList.add('selected');
        
        // Actualizar el valor oculto
        document.getElementById('salaComboValue').value = sala.id;
        
        // Mostrar bloque de fecha cuando se selecciona una sala
        document.getElementById("bloqueFecha").style.display = "block";
      });
      
      salaCombo.appendChild(salaCard);
    });

  } catch (err) {
    console.error("Error al cargar salas:", err);
    salaCombo.innerHTML = `<div class="error-card">
      <i class="bi bi-exclamation-triangle"></i>
      <span>Error cargando salas: ${err.message}</span>
    </div>`;
  }
}
