document.querySelector('.user-dni i').addEventListener('click', function() {
      const dniText = this.previousSibling;
      if (dniText.nodeType === 3) {
        const dni = dniText.textContent.trim();
        if (dni.includes('29328708')) {
          dniText.textContent = 'C.C. •••••••• ';
        } else {
          dniText.textContent = 'C.C. 29328708 ';
        }
      }
    });

    document.querySelector('.token-button').addEventListener('click', function() {
      alert('Generando carnet QR...');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') return;
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
      });
    });

    document.querySelectorAll('.section-arrow').forEach(arrow => {
      arrow.addEventListener('click', function() {
        const section = this.closest('.section-header');
        const title = section.querySelector('.section-title').textContent;
        alert('Navegando a: ' + title);
      });
    });

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

    async function getDisplayName(nombre) {
      var display = await NumiaDemoUsers.resolveDisplayName(nombre, 'salud');
      return display.toUpperCase();
    }

    return nombre.toUpperCase();
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (selectFecha) selectFecha.min = tomorrowStr;

    function getTomorrowDate() {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return days[t.getDay()] + ', ' + t.getDate() + ' de ' + months[t.getMonth()] + ' de ' + t.getFullYear();
    }

    const cancelledUsers = new Set();

    if (userSelector) {
      userSelector.addEventListener('change', function() {
        const selectedUser = this.value;
        if (userNameDisplay) getDisplayName(selectedUser).then(function (name) { userNameDisplay.textContent = name; });

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
            const actionsDiv = appointmentCard.querySelector('.appointment-actions');
            if (actionsDiv) {
              actionsDiv.innerHTML =
                '<button class="btn-confirm" data-action="openCurrentUserAuthModal">' +
                  '<i class="bi bi-shield-check"></i> <span>Autorizar</span>' +
                '</button>' +
                '<button class="btn-cancel-appointment" data-action="cancelCurrentAppointment">' +
                  'Cancelar' +
                '</button>';
            }
          }
          if (agendarSection) agendarSection.style.display = 'none';
        }
      });
      userSelector.dispatchEvent(new Event('change'));
    }

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
          card.innerHTML =
            '<div class="appointment-header">' +
              '<div class="appointment-title">Cita Médica</div>' +
              '<div class="status-badge pending-auth"><i class="bi bi-clock-history"></i> Pendiente Autorización</div>' +
            '</div>' +
            '<div class="appointment-date">' + appt.fecha + '</div>' +
            '<div class="appointment-details">' +
              '<div>Especialidad: <strong>' + appt.especialidad + '</strong></div>' +
              '<div>Horario: <strong>' + appt.hora + '</strong></div>' +
            '</div>' +
            '<div class="appointment-user-origin"><i class="bi bi-person"></i> Paciente: <strong>' + appt.usuario + '</strong></div>';
        } else if (appt.status === 'authorized') {
          card.innerHTML =
            '<div class="appointment-header">' +
              '<div class="appointment-title">Cita Médica</div>' +
              '<div class="status-badge authorized"><i class="bi bi-check-circle-fill"></i> Autorizado</div>' +
            '</div>' +
            '<div class="appointment-date">' + appt.fecha + '</div>' +
            '<div class="appointment-details">' +
              '<div>Especialidad: <strong>' + appt.especialidad + '</strong></div>' +
              '<div>Horario: <strong>' + appt.hora + '</strong></div>' +
            '</div>' +
            '<div class="appointment-user-origin"><i class="bi bi-person"></i> Paciente: <strong>' + appt.usuario + '</strong></div>' +
            '<div class="appointment-actions appointment-actions-spaced">' +
              '<button class="btn-checkin maria-checkin-btn" data-index="' + index + '">' +
                '<i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span>' +
              '</button>' +
            '</div>' +
            '<div class="turn-info-card is-hidden" id="turnInfo-' + index + '"></div>';
        } else if (appt.status === 'checked-in') {
          card.innerHTML =
            '<div class="appointment-header">' +
              '<div class="appointment-title">Cita Médica</div>' +
              '<div class="status-badge authorized"><i class="bi bi-check-circle-fill"></i> Check-in realizado</div>' +
            '</div>' +
            '<div class="appointment-date">' + appt.fecha + '</div>' +
            '<div class="appointment-details">' +
              '<div>Especialidad: <strong>' + appt.especialidad + '</strong></div>' +
              '<div>Horario: <strong>' + appt.hora + '</strong></div>' +
            '</div>' +
            '<div class="appointment-user-origin"><i class="bi bi-person"></i> Paciente: <strong>' + appt.usuario + '</strong></div>' +
            '<div class="turn-info-card">' +
              '<div class="turn-number">' + (appt.turnData ? appt.turnData.turn : '') + '</div>' +
              '<div class="turn-info-row">' +
                '<span class="turn-info-label">Sala de espera</span>' +
                '<span class="turn-info-value">' + (appt.turnData ? appt.turnData.room : '') + '</span>' +
              '</div>' +
              '<div class="turn-info-row">' +
                '<span class="turn-info-label">Tiempo estimado</span>' +
                '<span class="turn-info-value">' + (appt.turnData ? appt.turnData.waitTime : '') + ' min</span>' +
              '</div>' +
            '</div>';
        } else {
          card.innerHTML =
            '<div class="appointment-header"><div class="appointment-title">Cita Médica</div></div>' +
            '<div class="appointment-date">' + appt.fecha + '</div>' +
            '<div class="appointment-details">' +
              '<div>Especialidad: <strong>' + appt.especialidad + '</strong></div>' +
              '<div>Horario: <strong>' + appt.hora + '</strong></div>' +
            '</div>' +
            '<div class="appointment-user-origin"><i class="bi bi-person"></i> Paciente: <strong>' + appt.usuario + '</strong></div>' +
            '<div class="appointment-actions appointment-actions-spaced">' +
              '<button class="btn-confirm maria-authorize-btn" data-index="' + index + '">' +
                '<i class="bi bi-shield-check"></i> <span>Autorizar</span>' +
              '</button>' +
            '</div>';
        }
        container.appendChild(card);
      });

      document.querySelectorAll('.maria-authorize-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          openMariaAuthModal(parseInt(this.getAttribute('data-index')));
        });
      });
      document.querySelectorAll('.maria-checkin-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          performCheckin(parseInt(this.getAttribute('data-index')), this);
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
        var data = await FilaVirtualApi.enqueueByAlias('Maria', '16221', '10750');
        var turn = data.turn || '';
        var waitTime = data.averageWaitingTime || 0;
        var roomName = (data.waitingRoom && data.waitingRoom.name) ? data.waitingRoom.name : '';
        if (mariaAppointments[index]) {
          mariaAppointments[index].status = 'checked-in';
          mariaAppointments[index].turnData = { turn: turn, waitTime: waitTime, room: roomName };
        }
        var turnInfoEl = document.getElementById('turnInfo-' + index);
        if (turnInfoEl) {
          turnInfoEl.style.display = 'block';
          turnInfoEl.innerHTML =
            '<div class="turn-number">' + turn + '</div>' +
            '<div class="turn-info-row"><span class="turn-info-label">Sala de espera</span><span class="turn-info-value">' + roomName + '</span></div>' +
            '<div class="turn-info-row"><span class="turn-info-label">Tiempo estimado</span><span class="turn-info-value">' + waitTime + ' min</span></div>';
        }
        if (btnElement) {
          btnElement.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Check-in realizado</span>';
          btnElement.classList.add('btn-checkin-complete');
          btnElement.disabled = true;
        }
      } catch (err) {
        console.error('Error en check-in:', err);
        if (btnElement) { btnElement.disabled = false; btnElement.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span>'; }
        alert('Error al realizar el check-in. Intente nuevamente.');
      }
    }

    async function performCheckinUser(actionsDiv) {
      if (actionsDiv) {
        actionsDiv.innerHTML = '<button class="btn-checkin" disabled><i class="bi bi-hourglass-split"></i> <span>Procesando...</span></button>';
      }
      try {
        var data = await FilaVirtualApi.enqueueByAlias('Maria', '16221', '10750');
        var turn = data.turn || '';
        var waitTime = data.averageWaitingTime || 0;
        var roomName = (data.waitingRoom && data.waitingRoom.name) ? data.waitingRoom.name : '';
        if (actionsDiv) {
          actionsDiv.innerHTML =
            '<button class="btn-checkin btn-checkin-complete" disabled><i class="bi bi-check-circle-fill"></i> <span>Check-in realizado</span></button>' +
            '<div class="turn-info-card">' +
              '<div class="turn-number">' + turn + '</div>' +
              '<div class="turn-info-row"><span class="turn-info-label">Sala de espera</span><span class="turn-info-value">' + roomName + '</span></div>' +
              '<div class="turn-info-row"><span class="turn-info-label">Tiempo estimado</span><span class="turn-info-value">' + waitTime + ' min</span></div>' +
            '</div>';
        }
      } catch (err) {
        console.error('Error en check-in:', err);
        if (actionsDiv) {
          actionsDiv.innerHTML = '<button class="btn-checkin" data-action="performCheckinUser"><i class="bi bi-box-arrow-in-right"></i> <span>Check-in</span></button>';
        }
        alert('Error al realizar el check-in. Intente nuevamente.');
      }
    }

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

    if (closeModalAutorizar) {
      closeModalAutorizar.addEventListener('click', function() {
        modalAutorizar.classList.remove('active');
      });
    }

    if (modalAutorizar) {
      modalAutorizar.addEventListener('click', function(e) {
        if (e.target === modalAutorizar) modalAutorizar.classList.remove('active');
      });
    }

    if (fileUploadArea) {
      fileUploadArea.addEventListener('click', function() { authFileInput.click(); });
    }

    if (authFileInput) {
      authFileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          modalAutorizar.classList.remove('active');

          FilaVirtualApi.enqueueByAlias('Maria', '18306', '10750').catch(function(err) {
            console.error('Error al invocar API de enqueue:', err);
          });

          if (currentMariaAuthIndex >= 0 && mariaAppointments[currentMariaAuthIndex]) {
            mariaAppointments[currentMariaAuthIndex].status = 'pending-auth';
            renderMariaAppointments();
            var idx = currentMariaAuthIndex;
            setTimeout(function() {
              if (mariaAppointments[idx]) {
                mariaAppointments[idx].status = 'authorized';
                if (userSelector && userSelector.value === 'Maria') renderMariaAppointments();
              }
            }, 20000);
          } else {
            var selectedUser = userSelector ? userSelector.value : '';
            var fecha = appointmentDate ? appointmentDate.textContent : '';
            var hora = appointmentTime ? appointmentTime.textContent : '';
            var especialidad = appointmentSpecialty ? appointmentSpecialty.textContent : '';
            var newIdx = mariaAppointments.length;
            mariaAppointments.push({
              usuario: selectedUser,
              fecha: fecha,
              hora: hora,
              especialidad: especialidad,
              status: 'pending-auth'
            });
            var appointmentCard = document.getElementById('appointmentCard');
            if (appointmentCard) {
              var actionsDiv = appointmentCard.querySelector('.appointment-actions');
              if (actionsDiv) {
                actionsDiv.innerHTML =
                  '<div class="status-badge pending-auth status-badge-full">' +
                    '<i class="bi bi-clock-history"></i> Pendiente Autorización' +
                  '</div>';
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
                    if (userSelector && userSelector.value === 'Maria') renderMariaAppointments();
                  }
                }, 20000);
              }
            }
          }
        }
      });
    }

    if (btnAuthorize) {
      btnAuthorize.addEventListener('click', function() { authFileInput.click(); });
    }

    async function cancelCurrentAppointment() {
      if (confirm('¿Está seguro que desea cancelar esta cita?')) {
        var selectedUser = userSelector ? userSelector.value : '';
        var contact = await NumiaDemoUsers.fetchSaludContact(selectedUser);
        var tel = contact.tel || '';
        var fecha = appointmentDate ? appointmentDate.textContent : '';
        var hora = appointmentTime ? appointmentTime.textContent : '';
        var especialidad = appointmentSpecialty ? appointmentSpecialty.textContent : '';
        var inputValue = 'Se ha cancelado una cita. Tel: ' + tel + ', Fecha: ' + fecha + ', Hora: ' + hora + ', Especialidad: ' + especialidad;

        cancelledUsers.add(selectedUser);
        mariaAppointments.push({
          usuario: selectedUser,
          fecha: fecha,
          hora: hora,
          especialidad: especialidad,
          status: 'new'
        });

        try {
          await NumiaJourneyApi.runJourney(NumiaJourneyApi.FLOWS.SALUD, {
              input_value: inputValue,
              input_type: 'chat',
              tel: tel
            });
        } catch (err) {
          console.error('Error al invocar API de cancelación:', err);
        }

        alert('Cita cancelada');
        if (appointmentsSection) appointmentsSection.style.display = 'none';
        if (agendarSection) agendarSection.style.display = 'block';
      }
    }

    if (btnAgendarCita) {
      btnAgendarCita.addEventListener('click', function() {
        if (modalAgendar) { modalAgendar.classList.add('active'); noAvailability.style.display = 'none'; }
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', function() {
        if (modalAgendar) modalAgendar.classList.remove('active');
      });
    }

    if (modalAgendar) {
      modalAgendar.addEventListener('click', function(e) {
        if (e.target === modalAgendar) modalAgendar.classList.remove('active');
      });
    }

    if (btnBuscarDisponibilidad) {
      btnBuscarDisponibilidad.addEventListener('click', function() {
        var esp = document.getElementById('selectEspecialidad').value;
        var fec = document.getElementById('selectFecha').value;
        var hor = document.getElementById('selectHorario').value;
        if (!esp || !fec || !hor) { alert('Por favor complete todos los campos'); return; }
        noAvailability.style.display = 'block';
      });
    }

    var selectEspecialidad = document.getElementById('selectEspecialidad');
    var selectHorario = document.getElementById('selectHorario');

    if (selectEspecialidad) {
      selectEspecialidad.addEventListener('change', function() {
        if (this.value && selectFecha.value && selectHorario.value) noAvailability.style.display = 'block';
      });
    }
    if (selectFecha) {
      selectFecha.addEventListener('change', function() {
        if (this.value && selectEspecialidad.value && selectHorario.value) noAvailability.style.display = 'block';
      });
    }
    if (selectHorario) {
      selectHorario.addEventListener('change', function() {
        if (this.value && selectEspecialidad.value && selectFecha.value) noAvailability.style.display = 'block';
      });
    }
