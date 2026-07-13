(function () {
'use strict';
// Toggle DNI visibility
    document.querySelector('.user-dni i').addEventListener('click', function() {
      const dniText = this.previousSibling;
      if (dniText.nodeType === 3) {
        const dni = dniText.textContent.trim();
        if (dni.includes('99999999')) {
          dniText.textContent = 'DNI: •••••••• ';
        } else {
          dniText.textContent = 'DNI: 99999999 ';
        }
      }
    });
    
    // Generate Token
    document.querySelector('.token-button').addEventListener('click', function() {
      alert('Generando token...');
      // Aquí iría la lógica para generar el token
    });
    
    // COVID Button
    document.querySelector('.covid-button').addEventListener('click', function() {
      alert('Más información sobre COVID-19');
    });
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
          return;
        }
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Section arrows
    document.querySelectorAll('.section-arrow').forEach(arrow => {
      arrow.addEventListener('click', function() {
        const section = this.closest('.section-header');
        const title = section.querySelector('.section-title').textContent;
        alert(`Navegando a: ${title}`);
      });
    });
    
    // User Selector Logic
    const userSelector = document.getElementById('userSelector');
    const appointmentsSection = document.getElementById('appointmentsSection');
    const agendarSection = document.getElementById('agendarSection');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentSpecialty = document.getElementById('appointmentSpecialty');
    const appointmentTime = document.getElementById('appointmentTime');
    const modalAgendar = document.getElementById('modalAgendar');
    const btnAgendarCita = document.getElementById('btnAgendarCita');
    const closeModal = document.getElementById('closeModal');
    const btnBuscarDisponibilidad = document.getElementById('btnBuscarDisponibilidad');
    const noAvailability = document.getElementById('noAvailability');
    const selectFecha = document.getElementById('selectFecha');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const appointmentCard = document.getElementById('appointmentCard');

    async function getDisplayName(nombre) {
      const display = await NumiaDemoUsers.resolveDisplayName(nombre, 'salud');
      return display.toUpperCase();
    }
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (selectFecha) {
      selectFecha.min = tomorrowStr;
    }
    
    // Function to get tomorrow's date formatted
    function getTomorrowDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const dayName = days[tomorrow.getDay()];
      const day = tomorrow.getDate();
      const month = months[tomorrow.getMonth()];
      const year = tomorrow.getFullYear();
      return `${dayName}, ${day} de ${month} de ${year}`;
    }
    
    // Track users who already cancelled their appointment
    const cancelledUsers = new Set();
    
    // Handle user selection change
    if (userSelector) {
      userSelector.addEventListener('change', function() {
        const selectedUser = this.value;
        
        if (userNameDisplay) {
          getDisplayName(selectedUser).then(function (name) { userNameDisplay.textContent = name; });
        }
        
        // Clear Maria's appointments container when switching away
        const mariaContainer = document.getElementById('cancelledAppointmentsContainer');
        if (mariaContainer) mariaContainer.innerHTML = '';
        const noCitasCard = document.getElementById('noCitasCard');
        if (noCitasCard) noCitasCard.style.display = 'block';
        
        if (selectedUser === 'Maria') {
          if (appointmentsSection) appointmentsSection.style.display = 'none';
          if (agendarSection) agendarSection.style.display = 'block';
          renderMariaAppointments();
        } else if (cancelledUsers.has(selectedUser)) {
          if (appointmentsSection) appointmentsSection.style.display = 'none';
          if (agendarSection) agendarSection.style.display = 'block';
        } else {
          if (appointmentsSection) {
            appointmentsSection.style.display = 'block';
            if (appointmentDate) appointmentDate.textContent = getTomorrowDate();
            if (appointmentSpecialty) appointmentSpecialty.textContent = 'Cardiología';
            if (appointmentTime) appointmentTime.textContent = '10:00';
            // Reset actions to show Autorizar/Cancelar buttons
            const actionsDiv = appointmentCard.querySelector('.appointment-actions');
            if (actionsDiv) {
              actionsDiv.innerHTML = `
                <button class="btn-confirm" id="btnConfirmAppointment" data-action="openCurrentUserAuthModal">
                  <i class="bi bi-shield-check"></i>
                  <span>Autorizar</span>
                </button>
                <button class="btn-cancel-appointment" id="btnCancelAppointment" data-action="cancelCurrentAppointment">
                  Cancelar
                </button>
              `;
            }
          }
          if (agendarSection) agendarSection.style.display = 'none';
        }
      });
      
      // Initialize on load
      userSelector.dispatchEvent(new Event('change'));
    }
    
    // Storage for appointments transferred to Maria's view
    let mariaAppointments = [];
    
    function renderMariaAppointments() {
      const container = document.getElementById('cancelledAppointmentsContainer');
      if (!container) return;
      container.innerHTML = '';
      
      const noCitasCard = document.getElementById('noCitasCard');
      if (noCitasCard) {
        noCitasCard.style.display = mariaAppointments.length > 0 ? 'none' : 'block';
      }
      
      mariaAppointments.forEach(function(appt, index) {
        const card = document.createElement('div');
        card.className = 'maria-appointment-card';
        
        if (appt.status === 'pending-auth') {
          card.innerHTML = `
            <div class="appointment-header">
              <div class="appointment-title">Cita Médica</div>
              <div class="status-badge pending-auth">
                <i class="bi bi-clock-history"></i> Pendiente Autorización
              </div>
            </div>
            <div class="appointment-date">${appt.fecha}</div>
            <div class="appointment-details">
              <div>Especialidad: <strong>${appt.especialidad}</strong></div>
              <div>Horario: <strong>${appt.hora}</strong></div>
            </div>
            <div class="appointment-user-origin">
              <i class="bi bi-person"></i> Paciente: <strong>${appt.usuario}</strong>
            </div>
          `;
        } else if (appt.status === 'authorized') {
          card.innerHTML = `
            <div class="appointment-header">
              <div class="appointment-title">Cita Médica</div>
              <div class="status-badge authorized">
                <i class="bi bi-check-circle-fill"></i> Autorizado
              </div>
            </div>
            <div class="appointment-date">${appt.fecha}</div>
            <div class="appointment-details">
              <div>Especialidad: <strong>${appt.especialidad}</strong></div>
              <div>Horario: <strong>${appt.hora}</strong></div>
            </div>
            <div class="appointment-user-origin">
              <i class="bi bi-person"></i> Paciente: <strong>${appt.usuario}</strong>
            </div>
            <div class="appointment-actions appointment-actions-spaced">
              <button class="btn-checkin maria-checkin-btn" data-index="${index}">
                <i class="bi bi-box-arrow-in-right"></i>
                <span>Check-in</span>
              </button>
            </div>
            <div class="turn-info-card is-hidden" id="turnInfo-${index}"></div>
          `;
        } else if (appt.status === 'checked-in') {
          card.innerHTML = `
            <div class="appointment-header">
              <div class="appointment-title">Cita Médica</div>
              <div class="status-badge authorized">
                <i class="bi bi-check-circle-fill"></i> Check-in realizado
              </div>
            </div>
            <div class="appointment-date">${appt.fecha}</div>
            <div class="appointment-details">
              <div>Especialidad: <strong>${appt.especialidad}</strong></div>
              <div>Horario: <strong>${appt.hora}</strong></div>
            </div>
            <div class="appointment-user-origin">
              <i class="bi bi-person"></i> Paciente: <strong>${appt.usuario}</strong>
            </div>
            <div class="turn-info-card">
              <div class="turn-number">${appt.turnData ? appt.turnData.turn : ''}</div>
              <div class="turn-info-row">
                <span class="turn-info-label">Sala de espera</span>
                <span class="turn-info-value">${appt.turnData ? appt.turnData.room : ''}</span>
              </div>
              <div class="turn-info-row">
                <span class="turn-info-label">Tiempo estimado</span>
                <span class="turn-info-value">${appt.turnData ? appt.turnData.waitTime : ''} min</span>
              </div>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="appointment-header">
              <div class="appointment-title">Cita Médica</div>
            </div>
            <div class="appointment-date">${appt.fecha}</div>
            <div class="appointment-details">
              <div>Especialidad: <strong>${appt.especialidad}</strong></div>
              <div>Horario: <strong>${appt.hora}</strong></div>
            </div>
            <div class="appointment-user-origin">
              <i class="bi bi-person"></i> Paciente: <strong>${appt.usuario}</strong>
            </div>
            <div class="appointment-actions appointment-actions-spaced">
              <button class="btn-confirm maria-authorize-btn" data-index="${index}">
                <i class="bi bi-shield-check"></i>
                <span>Autorizar</span>
              </button>
            </div>
          `;
        }
        
        container.appendChild(card);
      });
      
      // Bind authorize buttons for Maria's appointments
      document.querySelectorAll('.maria-authorize-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          openMariaAuthModal(idx);
        });
      });
      
      // Bind check-in buttons for Maria's appointments
      document.querySelectorAll('.maria-checkin-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          performCheckin(idx, this);
        });
      });
    }
    
    let currentMariaAuthIndex = -1;
    
    function openMariaAuthModal(index) {
      currentMariaAuthIndex = index;
      if (modalAutorizar) {
        authFileInput.value = '';
        fileNameDisplay.classList.remove('visible');
        fileUploadArea.classList.remove('has-file');
        authSuccessMessage.classList.remove('visible');
        btnAuthorize.style.display = 'flex';
        modalAutorizar.classList.add('active');
      }
    }
    
    async function performCheckin(index, btnElement) {
      if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Procesando...</span>';
      }
      try {
        const data = await FilaVirtualApi.enqueueByAlias('Maria', '16221', '10750');
        
        const turn = data.turn || '';
        const waitTime = data.averageWaitingTime || 0;
        const roomName = (data.waitingRoom && data.waitingRoom.name) ? data.waitingRoom.name : '';
        
        if (mariaAppointments[index]) {
          mariaAppointments[index].status = 'checked-in';
          mariaAppointments[index].turnData = { turn: turn, waitTime: waitTime, room: roomName };
        }
        
        const turnInfoEl = document.getElementById('turnInfo-' + index);
        if (turnInfoEl) {
          turnInfoEl.style.display = 'block';
          turnInfoEl.innerHTML =
            '<div class="turn-number">' + turn + '</div>' +
            '<div class="turn-info-row">' +
              '<span class="turn-info-label">Sala de espera</span>' +
              '<span class="turn-info-value">' + roomName + '</span>' +
            '</div>' +
            '<div class="turn-info-row">' +
              '<span class="turn-info-label">Tiempo estimado</span>' +
              '<span class="turn-info-value">' + waitTime + ' min</span>' +
            '</div>';
        }
        
        if (btnElement) {
          btnElement.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Check-in realizado</span>';
          btnElement.classList.add('btn-checkin-complete');
          btnElement.disabled = true;
        }
      } catch (err) {
        console.error('Error en check-in:', err);
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span>';
        }
        alert('Error al realizar el check-in. Intente nuevamente.');
      }
    }
    
    async function performCheckinUser(actionsDiv) {
      if (actionsDiv) {
        actionsDiv.innerHTML =
          '<button class="btn-checkin" disabled>' +
            '<i class="bi bi-hourglass-split"></i> <span>Procesando...</span>' +
          '</button>';
      }
      try {
        const data = await FilaVirtualApi.enqueueByAlias('Maria', '16221', '10750');
        
        const turn = data.turn || '';
        const waitTime = data.averageWaitingTime || 0;
        const roomName = (data.waitingRoom && data.waitingRoom.name) ? data.waitingRoom.name : '';
        
        if (actionsDiv) {
          actionsDiv.innerHTML =
            '<button class="btn-checkin btn-checkin-complete" disabled>' +
              '<i class="bi bi-check-circle-fill"></i> <span>Check-in realizado</span>' +
            '</button>' +
            '<div class="turn-info-card">' +
              '<div class="turn-number">' + turn + '</div>' +
              '<div class="turn-info-row">' +
                '<span class="turn-info-label">Sala de espera</span>' +
                '<span class="turn-info-value">' + roomName + '</span>' +
              '</div>' +
              '<div class="turn-info-row">' +
                '<span class="turn-info-label">Tiempo estimado</span>' +
                '<span class="turn-info-value">' + waitTime + ' min</span>' +
              '</div>' +
            '</div>';
        }
      } catch (err) {
        console.error('Error en check-in:', err);
        if (actionsDiv) {
          actionsDiv.innerHTML =
            '<button class="btn-checkin" data-action="performCheckinUser">' +
              '<i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span>' +
            '</button>';
        }
        alert('Error al realizar el check-in. Intente nuevamente.');
      }
    }
    
    // Authorization modal logic
    const modalAutorizar = document.getElementById('modalAutorizar');
    const closeModalAutorizar = document.getElementById('closeModalAutorizar');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const authFileInput = document.getElementById('authFileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileNameText = document.getElementById('fileNameText');
    const btnAuthorize = document.getElementById('btnAuthorize');
    const authSuccessMessage = document.getElementById('authSuccessMessage');

    AppMobileSaludShared.bindActions({
      openCurrentUserAuthModal: function (event) {
        event.preventDefault();
        openCurrentUserAuthModal();
      },
      cancelCurrentAppointment: function (event) {
        event.preventDefault();
        cancelCurrentAppointment();
      },
      performCheckinUser: function (event, trigger) {
        event.preventDefault();
        performCheckinUser(trigger.parentElement);
      }
    });
    
    // Global function to open auth modal for current user's appointment
    function openCurrentUserAuthModal() {
      currentMariaAuthIndex = -1;
      if (modalAutorizar) {
        authFileInput.value = '';
        fileNameDisplay.classList.remove('visible');
        fileUploadArea.classList.remove('has-file');
        authSuccessMessage.classList.remove('visible');
        btnAuthorize.style.display = 'flex';
        modalAutorizar.classList.add('active');
      }
    }
    
    // Close authorization modal
    if (closeModalAutorizar) {
      closeModalAutorizar.addEventListener('click', function() {
        modalAutorizar.classList.remove('active');
      });
    }
    
    if (modalAutorizar) {
      modalAutorizar.addEventListener('click', function(e) {
        if (e.target === modalAutorizar) {
          modalAutorizar.classList.remove('active');
        }
      });
    }
    
    // File upload area click
    if (fileUploadArea) {
      fileUploadArea.addEventListener('click', function() {
        authFileInput.click();
      });
    }
    
    // File selected → close modal, set pending auth, auto-authorize after 20s
    if (authFileInput) {
      authFileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          modalAutorizar.classList.remove('active');
          
          // Invoke enqueue API
          FilaVirtualApi.enqueueByAlias('Maria', '18306', '10750').catch(function(err) {
            console.error('Error al invocar API de enqueue:', err);
          });
          
          if (currentMariaAuthIndex >= 0 && mariaAppointments[currentMariaAuthIndex]) {
            // Authorization from Maria's view
            mariaAppointments[currentMariaAuthIndex].status = 'pending-auth';
            renderMariaAppointments();
            
            const idx = currentMariaAuthIndex;
            setTimeout(function() {
              if (mariaAppointments[idx]) {
                mariaAppointments[idx].status = 'authorized';
                const currentUser = userSelector ? userSelector.value : '';
                if (currentUser === 'Maria') {
                  renderMariaAppointments();
                }
              }
            }, 20000);
          } else {
            // Authorization from another user's appointment view
            const selectedUser = userSelector ? userSelector.value : '';
            const fecha = appointmentDate ? appointmentDate.textContent : '';
            const hora = appointmentTime ? appointmentTime.textContent : '';
            const especialidad = appointmentSpecialty ? appointmentSpecialty.textContent : '';
            
            // Add to Maria's view with pending-auth status
            const newIdx = mariaAppointments.length;
            mariaAppointments.push({
              usuario: selectedUser,
              fecha: fecha,
              hora: hora,
              especialidad: especialidad,
              status: 'pending-auth'
            });
            
            // Update current user's appointment card
            const appointmentCard = document.getElementById('appointmentCard');
            if (appointmentCard) {
              const actionsDiv = appointmentCard.querySelector('.appointment-actions');
              if (actionsDiv) {
                actionsDiv.innerHTML = `
                  <div class="status-badge pending-auth status-badge-full">
                    <i class="bi bi-clock-history"></i> Pendiente Autorización
                  </div>
                `;
                setTimeout(function() {
                  actionsDiv.innerHTML =
                    '<div class="status-badge authorized status-badge-authorized-full">' +
                      '<i class="bi bi-check-circle-fill"></i> Autorizado' +
                    '</div>' +
                    '<button class="btn-checkin" data-action="performCheckinUser">' +
                      '<i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span>' +
                    '</button>';
                  if (mariaAppointments[newIdx]) {
                    mariaAppointments[newIdx].status = 'authorized';
                    const currentUser = userSelector ? userSelector.value : '';
                    if (currentUser === 'Maria') {
                      renderMariaAppointments();
                    }
                  }
                }, 20000);
              }
            }
          }
        }
      });
    }
    
    // Submit authorization button (alternative to file upload)
    if (btnAuthorize) {
      btnAuthorize.addEventListener('click', function() {
        authFileInput.click();
      });
    }
    
    // Global function to cancel current user's appointment
    async function cancelCurrentAppointment() {
      if (!confirm('¿Está seguro que desea cancelar esta cita?')) {
        return;
      }

      const selectedUser = userSelector ? userSelector.value : '';
      const fecha = appointmentDate ? appointmentDate.textContent : '';
      const hora = appointmentTime ? appointmentTime.textContent : '';
      const especialidad = appointmentSpecialty ? appointmentSpecialty.textContent : '';

      try {
        let tel = '';
        try {
          const contact = await NumiaDemoUsers.fetchSaludContact(selectedUser);
          tel = (contact && contact.tel) || '';
        } catch (contactErr) {
          console.warn('No se pudo obtener contacto salud; se cancela sin tel.', contactErr);
        }

        const inputValue = `Se ha cancelado una cita. Tel: ${tel}, Fecha: ${fecha}, Hora: ${hora}, Especialidad: ${especialidad}`;

        await NumiaJourneyApi.runJourney(NumiaJourneyApi.FLOWS.SALUD, {
          input_value: inputValue,
          input_type: 'chat',
          tel: tel
        });

        cancelledUsers.add(selectedUser);
        mariaAppointments.push({
          usuario: selectedUser,
          fecha: fecha,
          hora: hora,
          especialidad: especialidad,
          status: 'new'
        });

        alert('Cita cancelada');
        if (appointmentsSection) appointmentsSection.style.display = 'none';
        if (agendarSection) agendarSection.style.display = 'block';
      } catch (err) {
        console.error('Error al invocar API de cancelación:', err);
        alert(
          'No se pudo notificar a Journey Builder.\n' +
          ((err && err.message) || 'Error desconocido') +
          '\nRevisá en Render: JOURNEY_API_KEY y JOURNEY_FLOW_SALUD.'
        );
      }
    }
    
    // Open modal to agendar cita
    if (btnAgendarCita) {
      btnAgendarCita.addEventListener('click', function() {
        if (modalAgendar) {
          modalAgendar.classList.add('active');
          noAvailability.style.display = 'none';
        }
      });
    }
    
    // Close modal
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        if (modalAgendar) {
          modalAgendar.classList.remove('active');
        }
      });
    }
    
    // Close modal on overlay click
    if (modalAgendar) {
      modalAgendar.addEventListener('click', function(e) {
        if (e.target === modalAgendar) {
          modalAgendar.classList.remove('active');
        }
      });
    }
    
    // Buscar disponibilidad (siempre muestra no disponible)
    if (btnBuscarDisponibilidad) {
      btnBuscarDisponibilidad.addEventListener('click', function() {
        const especialidad = document.getElementById('selectEspecialidad').value;
        const fecha = document.getElementById('selectFecha').value;
        const horario = document.getElementById('selectHorario').value;
        
        if (!especialidad || !fecha || !horario) {
          alert('Por favor complete todos los campos');
          return;
        }
        
        // Siempre mostrar no disponible
        noAvailability.style.display = 'block';
      });
    }
    
    // Show no availability when any field changes
    const selectEspecialidad = document.getElementById('selectEspecialidad');
    const selectHorario = document.getElementById('selectHorario');
    
    if (selectEspecialidad) {
      selectEspecialidad.addEventListener('change', function() {
        if (this.value && selectFecha.value && selectHorario.value) {
          noAvailability.style.display = 'block';
        }
      });
    }
    
    if (selectFecha) {
      selectFecha.addEventListener('change', function() {
        if (this.value && selectEspecialidad.value && selectHorario.value) {
          noAvailability.style.display = 'block';
        }
      });
    }
    
    if (selectHorario) {
      selectHorario.addEventListener('change', function() {
        if (this.value && selectEspecialidad.value && selectFecha.value) {
          noAvailability.style.display = 'block';
        }
      });
    }
})();
