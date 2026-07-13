(function(){
      const modalEl = document.getElementById('modalSimuladorCredito');
      const modal = new bootstrap.Modal(modalEl);
      const btnSimular = document.getElementById('btnSimularPrestamo');
      const alertBox = document.getElementById('simuladorAlert');
      
      // Elementos del formulario
      const inputs = {
        nombre: document.getElementById('simNombre'),
        apellido: document.getElementById('simApellido'),
        dni: document.getElementById('simDni'),
        telefono: document.getElementById('simTelefono'),
        email: document.getElementById('simEmail'),
        ingresos: document.getElementById('simIngresos'),
        gastos: document.getElementById('simGastos'),
        monto: document.getElementById('simMonto'),
        plazo: document.getElementById('simPlazo')
      };
      
      // Elementos de navegación
      const btnAnterior = document.getElementById('btnAnterior');
      const btnSiguiente = document.getElementById('btnSiguiente');
      const btnFinalizar = document.getElementById('btnFinalizar');
      const btnSolicitarAsistencia = document.getElementById('btnSolicitarAsistencia');
      
      // Elementos de pasos
      const stepIndicators = document.querySelectorAll('.step-indicator');
      const stepContents = document.querySelectorAll('.step-content');
      
      // Elementos de resultados
      const resultadoCuota = document.getElementById('resultadoCuota');
      const resultadoTotal = document.getElementById('resultadoTotal');
      const resultadoTasa = document.getElementById('resultadoTasa');
      const resultadoCapacidad = document.getElementById('resultadoCapacidad');
      
      let currentStep = 1;
      let selectedCreditType = null;
      let simulacionData = {};
      
      // Configuración de tipos de crédito
      const creditTypes = {
        personal: { tasa: 12.5, minPlazo: 12, maxPlazo: 60, minMonto: 1000, maxMonto: 5000000 },
        auto: { tasa: 8.9, minPlazo: 12, maxPlazo: 84, minMonto: 50000, maxMonto: 20000000 },
        hipotecario: { tasa: 6.5, minPlazo: 120, maxPlazo: 360, minMonto: 500000, maxMonto: 50000000 },
        libre: { tasa: 14.2, minPlazo: 6, maxPlazo: 48, minMonto: 1000, maxMonto: 10000000 }
      };
      
      // Event listener para cuando se cierra el modal (botón cancelar)
      modalEl.addEventListener('hide.bs.modal', async (event) => {
        // Verificar si hay DNI cargado
        const dniValue = inputs.dni.value.trim();
        
        if (dniValue) {
          // Obtener nombre y apellido del formulario
          const nombreValue = inputs.nombre.value.trim();
          const apellidoValue = inputs.apellido.value.trim();
          
          // Invocar la API de NocoDB antes de cerrar
          try {
            await DebmediaApi.nocoRequest('tables/mjg0v238imgxxvm/records', {
              method: 'POST',
              body: {
                "Title": null,
                "DNI": dniValue,
                "Nombre": nombreValue || null,
                "Apellido": apellidoValue || null,
                "OnboardingPrestamoFinalizado": "No",
                "OnboardingPrestamoIniciado": "Si"
              }
            });
          } catch (error) {
            // Silenciar errores de la API, solo cerrar el modal
            console.error('Error al invocar API:', error);
          }
        }
        // El modal se cerrará automáticamente después de este evento
      });
      
      // Event listeners
      btnSimular.addEventListener('click', () => {
        resetSimulador();
        modal.show();
      });
      
      btnAnterior.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          updateStep();
        }
      });
      
      btnSiguiente.addEventListener('click', () => {
        if (validateCurrentStep()) {
          if (currentStep < 3) { currentStep++; updateStep(); } } }); btnFinalizar.addEventListener('click', () => {
        modal.hide();
        resetSimulador();
      });
      
      btnSolicitarAsistencia.addEventListener('click', () => {
        solicitarAsistencia();
      });
      
      // Event listeners para tarjetas de tipo de crédito
      document.querySelectorAll('.credit-type-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.credit-type-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedCreditType = card.dataset.type;
          updatePlazoOptions();
        });
      });
      
      function resetSimulador() {
        currentStep = 1;
        selectedCreditType = null;
        simulacionData = {};
        
        // Limpiar formularios
        Object.values(inputs).forEach(input => {
          if (input) input.value = '';
        });
        
        // Limpiar selecciones
        document.querySelectorAll('.credit-type-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Resetear pasos
        updateStep();
        clearAlert();
      }
      
      function updateStep() {
        // Actualizar indicadores
        stepIndicators.forEach((indicator, index) => {
          const stepNum = index + 1;
          indicator.classList.remove('active', 'completed');
          
          if (stepNum < currentStep) { indicator.classList.add('completed'); } else if (stepNum === currentStep) { indicator.classList.add('active'); } }); // Mostrar/ocultar contenido stepContents.forEach((content, index) => {
          const stepNum = index + 1;
          if (stepNum === currentStep) {
            content.classList.remove('d-none');
          } else {
            content.classList.add('d-none');
          }
        });
        
        // Actualizar botones
        btnAnterior.classList.toggle('d-none', currentStep === 1);
        btnSiguiente.classList.toggle('d-none', currentStep === 3);
        btnFinalizar.classList.toggle('d-none', currentStep !== 3);
        
        // Actualizar texto del botón siguiente
        if (currentStep === 2) {
          btnSiguiente.textContent = 'Calcular';
        } else if (currentStep === 3) {
          btnSiguiente.textContent = 'Siguiente';
        } else {
          btnSiguiente.textContent = 'Siguiente';
        }
      }
      
      function validateCurrentStep() {
        clearAlert();
        
        if (currentStep === 1) {
          const required = ['nombre', 'apellido', 'dni', 'telefono', 'email', 'ingresos', 'gastos'];
          const missing = required.filter(field => !inputs[field].value.trim());
          
          if (missing.length > 0) {
            setAlert('danger', 'Por favor completa todos los campos requeridos.');
            return false;
          }
          
          // Validar ingresos vs gastos
          const ingresos = parseFloat(inputs.ingresos.value);
          const gastos = parseFloat(inputs.gastos.value);
          
          if (gastos >= ingresos) {
            setAlert('warning', 'Tus gastos no pueden ser iguales o mayores a tus ingresos.');
            return false;
          }
          
          // Guardar datos del paso 1
          simulacionData.personal = {
            nombre: inputs.nombre.value,
            apellido: inputs.apellido.value,
            dni: inputs.dni.value,
            telefono: inputs.telefono.value,
            email: inputs.email.value,
            ingresos: ingresos,
            gastos: gastos
          };
          
        } else if (currentStep === 2) {
          if (!selectedCreditType) {
            setAlert('danger', 'Por favor selecciona un tipo de crédito.');
            return false;
          }
          
          if (!inputs.monto.value || !inputs.plazo.value) {
            setAlert('danger', 'Por favor completa el monto y plazo.');
            return false;
          }
          
          const monto = parseFloat(inputs.monto.value);
          const plazo = parseInt(inputs.plazo.value);
          const config = creditTypes[selectedCreditType];
          
          if (monto < config.minMonto || monto > config.maxMonto) {
            setAlert('danger', `El monto debe estar entre $${config.minMonto.toLocaleString()} y $${config.maxMonto.toLocaleString()}.`);
            return false;
          }
          
          if (plazo < config.minPlazo || plazo > config.maxPlazo) {
            setAlert('danger', `El plazo debe estar entre ${config.minPlazo} y ${config.maxPlazo} meses.`);
            return false;
          }
          
          // Guardar datos del paso 2
          simulacionData.credito = {
            tipo: selectedCreditType,
            monto: monto,
            plazo: plazo,
            tasa: config.tasa
          };
          
          // Calcular simulación
          calcularSimulacion();
        }
        
        return true;
      }
      
      function updatePlazoOptions() {
        if (!selectedCreditType) return;
        
        const config = creditTypes[selectedCreditType];
        const plazoSelect = inputs.plazo;
        
        plazoSelect.innerHTML = '<option value="">Selecciona el plazo</option>';
        
        for (let i = config.minPlazo; i <= config.maxPlazo; i += 6) { const option = document.createElement('option'); option.value = i; option.textContent = `${i} meses`; plazoSelect.appendChild(option); } // Actualizar límites del monto inputs.monto.min = config.minMonto; inputs.monto.max = config.maxMonto; inputs.monto.placeholder = `Mínimo: $${config.minMonto.toLocaleString()}`; } function calcularSimulacion() { const { credito, personal } = simulacionData; const tasaMensual = credito.tasa / 100 / 12; const cuota = credito.monto * (tasaMensual * Math.pow(1 + tasaMensual, credito.plazo)) / (Math.pow(1 + tasaMensual, credito.plazo) - 1); const total = cuota * credito.plazo; const interes = total - credito.monto; // Verificar capacidad de pago (la cuota no debe superar el 30% de los ingresos netos) const ingresosNetos = personal.ingresos - personal.gastos; const capacidadMaxima = ingresosNetos * 0.3; const aprobado = cuota <= capacidadMaxima; // Mostrar resultados resultadoCuota.textContent = `$${cuota.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; resultadoTotal.textContent = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; resultadoTasa.textContent = `${credito.tasa}%`; resultadoCapacidad.textContent = aprobado ? 'Aprobado' : 'Revisar'; resultadoCapacidad.className = aprobado ? 'text-success' : 'text-warning'; // Guardar datos de la simulación simulacionData.resultado = { cuota: cuota, total: total, interes: interes, aprobado: aprobado, capacidadMaxima: capacidadMaxima }; } function solicitarAsistencia() { // Validar solo nombre, apellido y email const nombre = inputs.nombre.value.trim(); const apellido = inputs.apellido.value.trim(); const email = inputs.email.value.trim(); if (!nombre || !apellido || !email) { setAlert('danger', 'Por favor completa al menos el nombre, apellido y email antes de solicitar asistencia.'); return; } // Usar la misma API que el "generar turno" const FV_QUEUE = 16223; const FV_BRANCH = 10750; const data = { firstName: nombre, lastName: apellido, dni: inputs.dni.value.trim() || 'N/A', // Usar valor del campo o 'N/A' si está vacío email: email, phone: inputs.telefono.value.trim() || 'N/A' // Usar valor del campo o 'N/A' si está vacío }; btnSolicitarAsistencia.disabled = true; btnSolicitarAsistencia.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Solicitando...';
        
        FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, data)
        .then(out => {
          if (out.code) {
            // Cerrar el modal del simulador
            modal.hide();
            resetSimulador();
            
            // Usar las funciones existentes para mostrar el modal de sala de espera
            const turnCode = out.code;
            const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
            const avgWait = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
            const queueName = out.jsonDetails?.queue?.name || '—';
            const wrName = out.jsonDetails?.waitingRoom?.name || '—';
            const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';
            
            // Almacenar la URL de videollamada globalmente
            window.currentVideoCallUrl = videoCallUrl.includes('?') ? `${videoCallUrl}&videocallUser=mobile` : `${videoCallUrl}?videocallUser=mobile`;
            
            // Llenar el modal de sala de espera con los datos
            window.fillWaitModal({ 
              code: turnCode, 
              number: turnNumber, 
              avgWait: isFinite(avgWait) ? `${Math.floor(parseFloat(avgWait))} min` : 'N/A', 
              queueName, 
              waitingRoom: wrName 
            });
            
            // Mostrar el modal de sala de espera
            const modalWait = new bootstrap.Modal(document.getElementById('modalSalaEspera'), { backdrop: 'static', keyboard: false });
            modalWait.show();
            
            // Iniciar el polling para verificar el estado del turno
            window.startPolling(turnCode);
            
          } else {
            throw new Error('No se pudo generar el turno');
          }
        })
        .catch(err => {
          setAlert('danger', `Error al solicitar asistencia: ${err.message}`);
        })
        .finally(() => {
          btnSolicitarAsistencia.disabled = false;
          btnSolicitarAsistencia.innerHTML = '<i class="bi bi-headset me-1"></i>Solicitar Asistencia';
        });
      }
      
      function setAlert(type, msg) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = msg;
        alertBox.classList.remove('d-none');
      }
      
      function clearAlert() {
        alertBox.className = 'alert d-none';
        alertBox.textContent = '';
      }
    })();
