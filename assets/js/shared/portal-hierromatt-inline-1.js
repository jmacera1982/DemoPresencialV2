(function () {
      /* Mobile menu */
      const menuToggle = document.getElementById('menuToggle');
      const mobileNav = document.getElementById('mobileNav');
      menuToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
      mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => mobileNav.classList.remove('open'));
      });

      /* Wizard state */
      let currentStep = 1;
      const totalSteps = 4;
      const formData = {
        numOrden: '',
        dniConductor: '',
        celular: '',
        patente: '',
        tipoOperacion: '',
        fecha: null,
        horario: null
      };

      const HOURS = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
      const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      /* Simulate some taken slots */
      function getTakenSlots(dateStr) {
        const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b, 10), 0);
        const taken = [];
        for (let i = 0; i < 3; i++) { taken.push(HOURS[(seed + i * 3) % HOURS.length]); } return taken; } function getAvailableDates() { const dates = []; const today = new Date(); today.setHours(0, 0, 0, 0); let added = 0; let d = new Date(today); d.setDate(d.getDate() + 1); while (added < 14) { const day = d.getDay(); if (day !== 0 && day !== 6) { dates.push(new Date(d)); added++; } d.setDate(d.getDate() + 1); } return dates; } function formatDateISO(date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${day}`; } function formatDateLong(date) { return `${DAYS_ES[date.getDay()]} ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`; } function updateStepIndicator() { document.querySelectorAll('.step-item').forEach(item => {
          const step = parseInt(item.dataset.step, 10);
          item.classList.remove('active', 'done');
          if (step < currentStep) item.classList.add('done'); if (step === currentStep) item.classList.add('active'); }); } function showStep(step) { currentStep = step; document.querySelectorAll('.wizard-step').forEach((el, i) => {
          el.classList.toggle('active', i + 1 === step);
        });
        updateStepIndicator();

        const btnBack = document.getElementById('btnBack');
        const btnNext = document.getElementById('btnNext');
        const footer = document.getElementById('wizardFooter');

        btnBack.classList.toggle('d-none', step === 1 || step === 4 && document.getElementById('confirmDone').classList.contains('d-none') === false);

        if (step === 4) {
          if (document.getElementById('confirmDone').classList.contains('d-none')) {
            btnNext.textContent = 'Confirmar turno';
          } else {
            footer.classList.add('d-none');
          }
        } else {
          footer.classList.remove('d-none');
          btnNext.textContent = step === 3 ? 'Revisar →' : 'Siguiente →';
        }

        if (step === 2) renderDates();
        if (step === 3) renderTimes();
        if (step === 4 && document.getElementById('confirmPending').classList.contains('d-none') === false) fillSummary();
      }

      function renderDates() {
        const grid = document.getElementById('dateGrid');
        grid.innerHTML = '';
        getAvailableDates().forEach(date => {
          const iso = formatDateISO(date);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'date-btn' + (formData.fecha === iso ? ' selected' : '');
          btn.innerHTML = `
            <div class="day-name">${DAYS_ES[date.getDay()]}</div>
            <div class="day-num">${date.getDate()}</div>
            <div class="month-name">${MONTHS_ES[date.getMonth()]}</div>
          `;
          btn.addEventListener('click', () => {
            formData.fecha = iso;
            formData.horario = null;
            grid.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('step2Error').classList.add('d-none');
          });
          grid.appendChild(btn);
        });
      }

      function renderTimes() {
        const grid = document.getElementById('timeGrid');
        const label = document.getElementById('selectedDateLabel');
        const dateObj = formData.fecha ? new Date(formData.fecha + 'T12:00:00') : null;
        label.textContent = dateObj ? formatDateLong(dateObj) : '—';

        grid.innerHTML = '';
        if (!formData.fecha) return;

        const taken = getTakenSlots(formData.fecha);
        HOURS.forEach(hour => {
          const btn = document.createElement('button');
          btn.type = 'button';
          const isTaken = taken.includes(hour);
          btn.className = 'time-btn' +
            (isTaken ? ' taken' : '') +
            (formData.horario === hour ? ' selected' : '');
          btn.textContent = hour;
          if (!isTaken) {
            btn.addEventListener('click', () => {
              formData.horario = hour;
              grid.querySelectorAll('.time-btn:not(.taken)').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              document.getElementById('step3Error').classList.add('d-none');
            });
          }
          grid.appendChild(btn);
        });
      }

      function validateStep1() {
        const numOrden = document.getElementById('numOrden').value.trim();
        const dni = document.getElementById('dniConductor').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const patente = document.getElementById('patente').value.trim().toUpperCase();
        const tipo = document.getElementById('tipoOperacion').value;
        const err = document.getElementById('step1Error');

        if (!numOrden || !dni || !celular || !patente || !tipo) {
          err.textContent = 'Complete todos los campos obligatorios.';
          err.classList.remove('d-none');
          return false;
        }
        if (celular.replace(/\D/g, '').length < 8) { err.textContent = 'Ingrese un número de celular válido.'; err.classList.remove('d-none'); return false; } err.classList.add('d-none'); formData.numOrden = numOrden; formData.dniConductor = dni; formData.celular = celular; formData.patente = patente; formData.tipoOperacion = tipo; return true; } function fillSummary() { const dateObj = formData.fecha ? new Date(formData.fecha + 'T12:00:00') : null; const tipoLabel = formData.tipoOperacion === 'retiro' ? 'Retiro en planta' : 'Despacho / carga'; document.getElementById('sumOrden').textContent = formData.numOrden; document.getElementById('sumDni').textContent = formData.dniConductor; document.getElementById('sumCelular').textContent = formData.celular; document.getElementById('sumPatente').textContent = formData.patente; document.getElementById('sumTipo').textContent = tipoLabel; document.getElementById('sumFecha').textContent = dateObj ? formatDateLong(dateObj) : '—'; document.getElementById('sumHorario').textContent = formData.horario || '—'; } function confirmAppointment() { const ref = 'HM-T-' + String(Math.floor(100000 + Math.random() * 900000)); const dateObj = new Date(formData.fecha + 'T12:00:00'); document.getElementById('confirmRef').textContent = ref; document.getElementById('finalOrden').textContent = formData.numOrden; document.getElementById('finalFechaHora').textContent = formatDateLong(dateObj) + ' — ' + formData.horario; document.getElementById('finalPatente').textContent = formData.patente; document.getElementById('confirmPending').classList.add('d-none'); document.getElementById('confirmDone').classList.remove('d-none'); document.getElementById('wizardFooter').classList.add('d-none'); } function resetWizard() { formData.numOrden = ''; formData.dniConductor = ''; formData.celular = ''; formData.patente = ''; formData.tipoOperacion = ''; formData.fecha = null; formData.horario = null; document.getElementById('numOrden').value = ''; document.getElementById('dniConductor').value = ''; document.getElementById('celular').value = ''; document.getElementById('patente').value = ''; document.getElementById('tipoOperacion').value = ''; document.getElementById('confirmPending').classList.remove('d-none'); document.getElementById('confirmDone').classList.add('d-none'); document.getElementById('wizardFooter').classList.remove('d-none'); showStep(1); } document.getElementById('btnNext').addEventListener('click', () => {
        if (currentStep === 1) {
          if (!validateStep1()) return;
          showStep(2);
        } else if (currentStep === 2) {
          if (!formData.fecha) {
            document.getElementById('step2Error').classList.remove('d-none');
            return;
          }
          showStep(3);
        } else if (currentStep === 3) {
          if (!formData.horario) {
            document.getElementById('step3Error').classList.remove('d-none');
            return;
          }
          fillSummary();
          showStep(4);
        } else if (currentStep === 4) {
          confirmAppointment();
        }
      });

      document.getElementById('btnBack').addEventListener('click', () => {
        if (currentStep > 1) showStep(currentStep - 1);
      });

      document.getElementById('btnNuevaCita').addEventListener('click', resetWizard);

      document.getElementById('patente').addEventListener('input', function () {
        this.value = this.value.toUpperCase();
      });
    })();
