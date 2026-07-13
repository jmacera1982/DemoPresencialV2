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
            document.getElementById('formModal').classList.remove('hidden');
            document.getElementById('message').classList.add('hidden');
            document.getElementById('reservaForm').reset();
        }
       // window.showForm = showForm;

        function hideForm() {
            document.getElementById('formModal').classList.add('hidden');
        }

        // Función para mostrar mensajes
        function showMessage(text, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = `p-4 rounded-lg mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
            messageDiv.classList.remove('hidden');
        }

        // Función para manejar el envío del formulario
        async function handleSubmit(event) {
            event.preventDefault();
            
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
                email: formData.get('email'),
                phone: formData.get('phone')
            };

            try {
                await FilaVirtualApi.enqueue('11392', '10588', data);
                showMessage('¡Turno reservado exitosamente!');
                    event.target.reset();
                    setTimeout(() => {
                        hideForm();
                    }, 2000);
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al reservar el turno. Por favor, inténtalo de nuevo.', true);
            } finally {
                isLoading = false;
                submitBtn.textContent = 'Reservar Turno';
                submitBtn.disabled = false;
            }
        }

        // Función para el botón "Estoy aquí"
        async function handleEstoyAqui() {
            if (isLoading) return;
            
            isLoading = true;
            const btn = document.getElementById('estoyAquiBtn');
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            try {
                await FilaVirtualApi.enqueueByAlias('Jorge', '15055', '10588');
                alert('¡Notificación enviada exitosamente!');
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
                await FilaVirtualApi.enqueueByAlias('Jorge', '15090', '10588');
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

         // Función para abrir popup de Medicina al Viajero
         function openViajeroPopup() {
             const url = 'https://filavirtual2.debmedia.com/app/buscar/farmacity?queueName=Asesoramiento en Medicina al Viajero&branchId=10588';
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

        // Cerrar modal al hacer clic fuera de él
        document.getElementById('formModal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideForm();
            }
        });

 let fechaSeleccionadaGlobal = null;
    let duracionSeleccionadaGlobal = null;

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
      const branchId = document.getElementById("sucuCombo").value;
      const scheduleId = document.getElementById("salaCombo").value;
      const path = `schedules/${scheduleId}/branch/${branchId}/availability?strDate=${strDateEncoded}`;

      try {
        const data = await DebmediaApi.citasRequest(path, { profile: 'farma' });

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
      fechaSeleccionadaGlobal = fecha;
      duracionSeleccionadaGlobal = duracion;

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
          <label>RUT:</label>
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

    function enviarFormulario(event) {
      event.preventDefault();
      const datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        dni: parseInt(document.getElementById("dni").value),
        email: document.getElementById("email").value,
        motivo: document.getElementById("motivo").value
      };

      crearCita(fechaSeleccionadaGlobal, duracionSeleccionadaGlobal, datos);
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
        branch: { id:  document.getElementById("sucuCombo").value },
        schedule: { id:  document.getElementById("salaCombo").value },
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
          profile: 'farma'
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

 



  try {
    const data = await DebmediaApi.citasRequest('reducedSchedules', { profile: 'farma-list' });

    salaCombo.innerHTML = '<option value="">Seleccionar sala...</option>';
    sucuCombo.innerHTML = '<option value="">Seleccionar sucursal...</option>';

    const addedBranchIds = new Set();
document.getElementById("bloqueFecha").style.display = "block";
    data.forEach(sala => {
      salaCombo.innerHTML += `<option value="${sala.id}">${sala.name}</option>`;

      if (Array.isArray(sala.branches)) {
        sala.branches.forEach(branch => {
          if (!addedBranchIds.has(branch.id)) {
            sucuCombo.innerHTML += `<option value="${branch.id}">${branch.name}</option>`;
            addedBranchIds.add(branch.id);
          }
        });
      }
    });
    document.getElementById('popupModal').style.display='block';

  } catch (err) {
    console.error("Error al cargar combos:", err);
    salaCombo.innerHTML = `<option value="">Error cargando salas</option>`;
    sucuCombo.innerHTML = `<option value="">Error cargando sucursales</option>`;
  }
}
