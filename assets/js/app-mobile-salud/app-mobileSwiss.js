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
    
    // User names mapping
    const userNames = {
      'Jorge': 'JORGE MACERA',
      'Joaquin': 'JOAQUIN ZOILO'
    };
    
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
    
    // Handle user selection change
    if (userSelector) {
      userSelector.addEventListener('change', function() {
        const selectedUser = this.value;
        
        // Update user name display
        if (userNameDisplay && userNames[selectedUser]) {
          userNameDisplay.textContent = userNames[selectedUser];
        }
        
        if (selectedUser === 'Joaquin') {
          // Show appointment for Joaquin
          if (appointmentsSection) appointmentsSection.style.display = 'block';
          if (agendarSection) agendarSection.style.display = 'none';
          
          // Set appointment details for tomorrow
          if (appointmentDate) appointmentDate.textContent = getTomorrowDate();
          if (appointmentSpecialty) appointmentSpecialty.textContent = 'Cardiología';
          if (appointmentTime) appointmentTime.textContent = '10:00';
        } else {
          // Show agendar button for Jorge
          if (appointmentsSection) appointmentsSection.style.display = 'none';
          if (agendarSection) agendarSection.style.display = 'block';
        }
      });
      
      // Initialize on load
      userSelector.dispatchEvent(new Event('change'));
    }
    
    // Confirm appointment
    const btnConfirmAppointment = document.getElementById('btnConfirmAppointment');
    if (btnConfirmAppointment) {
      btnConfirmAppointment.addEventListener('click', function() {
        alert('Cita confirmada exitosamente');
      });
    }
    
    // Cancel appointment
    const btnCancelAppointment = document.getElementById('btnCancelAppointment');
    if (btnCancelAppointment) {
      btnCancelAppointment.addEventListener('click', async function() {
        if (confirm('¿Está seguro que desea cancelar esta cita?')) {
          const fecha = appointmentDate ? appointmentDate.textContent : '';
          const hora = appointmentTime ? appointmentTime.textContent : '';
          const especialidad = appointmentSpecialty ? appointmentSpecialty.textContent : '';
          const inputValue = `Se ha cancelado una cita. Fecha: ${fecha}, Hora: ${hora}, Especialidad: ${especialidad}`;
          
          try {
            await NumiaJourneyApi.runJourney(NumiaJourneyApi.FLOWS.SALUD, {
                input_value: inputValue,
                input_type: 'chat'
              });
          } catch (err) {
            console.error('Error al invocar API de cancelación:', err);
          }
          
          alert('Cita cancelada');
          if (appointmentsSection) appointmentsSection.style.display = 'none';
          if (agendarSection) agendarSection.style.display = 'block';
        }
      });
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
