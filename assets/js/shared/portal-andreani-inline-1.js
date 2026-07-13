const DEMO_TRACK = 'AND123456789AR';

    function showTracking() {
      document.getElementById('trackingResult').style.display = 'block';
      document.getElementById('trackingEmpty').style.display = 'none';
      const num = document.getElementById('trackingInput').value.trim() || DEMO_TRACK;
      document.getElementById('trackNumDisplay').textContent = num.toUpperCase();
    }

    function trackFromInput(val) {
      const v = (val || '').trim().toUpperCase();
      if (!v) return;
      document.getElementById('trackingInput').value = v;
      showTracking();
    }

    document.getElementById('btnTrackHero').addEventListener('click', () => {
      const v = document.getElementById('trackingHero').value;
      document.getElementById('trackingInput').value = v || DEMO_TRACK;
      document.getElementById('seguimiento').scrollIntoView({ behavior: 'smooth' });
      setTimeout(showTracking, 400);
    });

    document.getElementById('btnTrackSection').addEventListener('click', () => {
      trackFromInput(document.getElementById('trackingInput').value);
    });

    document.getElementById('trackingInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = document.getElementById('trackingInput').value.trim();
        if (v) trackFromInput(v);
      }
    });

    // Citas — misma API que citas.html (modal planificar retiro)
    (function () {
      const alertBox = document.getElementById('acitaAlert');
      const selSchedule = document.getElementById('acitaSchedule');
      const selBranch = document.getElementById('acitaBranch');
      const inputFecha = document.getElementById('acitaFecha');
      const slotsWrap = document.getElementById('acitaSlots');
      const btnConfirm = document.getElementById('acitaConfirmar');
      const inFirst = document.getElementById('acitaFirst');
      const inLast = document.getElementById('acitaLast');
      const inRut = document.getElementById('acitaRut');
      const inMail = document.getElementById('acitaMail');
      const modalPlanificar = document.getElementById('modalPlanificarRetiro');

      if (!modalPlanificar || !selSchedule) return;

      let schedules = [];
      let selectedSlot = null;

      const pad = (n) => String(n).padStart(2, '0');
      function setAlert(type, msg) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = msg;
        alertBox.classList.remove('d-none');
      }
      function clearAlert() {
        alertBox.className = 'alert d-none';
        alertBox.textContent = '';
      }

      function resetForm() {
        clearAlert();
        selSchedule.innerHTML = '<option value="">Cargando...</option>';
        selBranch.innerHTML = '<option value="">Selecciona un servicio</option>';
        selBranch.disabled = true;
        inputFecha.value = '';
        inputFecha.disabled = true;
        slotsWrap.innerHTML = '';
        selectedSlot = null;
        btnConfirm.disabled = true;
        if (inFirst) inFirst.value = '';
        if (inLast) inLast.value = '';
        if (inRut) inRut.value = '';
        if (inMail) inMail.value = '';
      }

      async function loadSchedules() {
        try {
          schedules = await DebmediaApi.citasRequest('reducedSchedules', { profile: 'andreani' });
          selSchedule.innerHTML = '<option value="">Selecciona un servicio...</option>';
          schedules.forEach((s) => selSchedule.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`));
          const today = new Date();
          const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          inputFecha.min = ymd(today);
          inputFecha.disabled = false;
          selSchedule.onchange = handleScheduleChange;
          selBranch.onchange = handleBranchOrDateChange;
          inputFecha.onchange = handleBranchOrDateChange;
        } catch (err) {
          setAlert('danger', err.message);
        }
      }

      function handleScheduleChange() {
        const schedId = selSchedule.value;
        selBranch.innerHTML = '<option value="">Selecciona sucursal...</option>';
        selBranch.disabled = true;
        slotsWrap.innerHTML = '';
        btnConfirm.disabled = true;
        if (!schedId) return;
        const sched = schedules.find((s) => String(s.id) === String(schedId));
        if (!sched || !Array.isArray(sched.branches)) {
          setAlert('danger', 'Esta agenda no tiene sucursales asociadas.');
          return;
        }
        const seen = new Set();
        sched.branches.forEach((b) => {
          if (!seen.has(b.id)) {
            selBranch.insertAdjacentHTML('beforeend', `<option value="${b.id}">${b.name}</option>`);
            seen.add(b.id);
          }
        });
        selBranch.disabled = false;
        clearAlert();
      }

      async function handleBranchOrDateChange() {
        clearAlert();
        slotsWrap.innerHTML = '';
        selectedSlot = null;
        btnConfirm.disabled = true;
        const schedId = selSchedule.value;
        const branchId = selBranch.value;
        const dateStr = inputFecha.value;
        if (!schedId || !branchId || !dateStr) return;
        try {
          const path = `schedules/${encodeURIComponent(schedId)}/branch/${encodeURIComponent(branchId)}/availability?strDate=${encodeURIComponent(dateStr)}`;
          const data = await DebmediaApi.citasRequest(path, { profile: 'andreani' });
          const slots = Array.isArray(data) ? data : (Array.isArray(data.slots) ? data.slots : []);
          if (slots.length === 0) {
            setAlert('info', 'No hay horarios disponibles para la fecha seleccionada.');
            return;
          }
          const frag = document.createDocumentFragment();
          slots.forEach((slot) => {
            const hora = slot.zonedStartDate.substring(11, 16);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-light';
            btn.textContent = hora;
            btn.addEventListener('click', () => {
              [...slotsWrap.querySelectorAll('.btn')].forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
              selectedSlot = { startAt: slot.zonedStartDate, defaultDuration: (slot.defaultDuration || 0) };
              btnConfirm.disabled = false;
            });
            frag.appendChild(btn);
          });
          slotsWrap.appendChild(frag);
        } catch (err) {
          setAlert('danger', err.message);
        }
      }

      function minutesOffsetFromSuffix(suffix) {
        const m = suffix.match(/^([+-])(\d{2})(\d{2})$/);
        if (!m) return 0;
        const sign = m[1] === '-' ? -1 : 1;
        return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
      }
      function buildEndAtLikeStart(startAtStr, addMinutes) {
        const offsetMatch = startAtStr.match(/([+-]\d{4}|Z)$/);
        const offsetSuffix = offsetMatch ? offsetMatch[1] : 'Z';
        const offsetMin = offsetSuffix === 'Z' ? 0 : minutesOffsetFromSuffix(offsetSuffix);
        const msStart = new Date(startAtStr).getTime();
        const msEnd = msStart + (addMinutes * 60000);
        const d = new Date(msEnd + offsetMin * 60000);
        const Y = d.getUTCFullYear();
        const M = d.getUTCMonth() + 1;
        const D = d.getUTCDate();
        const H = d.getUTCHours();
        const m = d.getUTCMinutes();
        const S = d.getUTCSeconds();
        return `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}T${String(H).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(S).padStart(2, '0')}${offsetSuffix}`;
      }

      modalPlanificar.addEventListener('shown.bs.modal', async () => {
        const tr = document.getElementById('trackNumDisplay');
        const refEl = document.getElementById('modalCitaTrackRef');
        if (refEl) refEl.textContent = (tr && tr.textContent) ? tr.textContent.trim() : '—';
        resetForm();
        await loadSchedules();
      });

      modalPlanificar.addEventListener('hidden.bs.modal', () => {
        resetForm();
      });

      btnConfirm.addEventListener('click', async () => {
        clearAlert();
        if (!selectedSlot) {
          setAlert('danger', 'Selecciona un horario primero.');
          return;
        }
        const schedId = selSchedule.value;
        const branchId = selBranch.value;
        if (!schedId || !branchId) {
          setAlert('danger', 'Faltan servicio o sucursal.');
          return;
        }
        if (!inFirst.value || !inLast.value || !inRut.value) {
          setAlert('danger', 'Completa Nombre, Apellido y DNI.');
          return;
        }
        const trackRef = (document.getElementById('modalCitaTrackRef') || {}).textContent || '';
        const startAt = selectedSlot.startAt;
        const endAt = buildEndAtLikeStart(startAt, selectedSlot.defaultDuration || 0);
        const body = {
          branch: { id: Number(branchId) },
          schedule: { id: Number(schedId) },
          startAt,
          endAt,
          customer: {
            firstName: inFirst.value,
            lastName: inLast.value,
            dni: String(inRut.value || '').trim(),
            email: (inMail.value || '').trim() || undefined
          },
          reason: `Retiro en sucursal — Envío ${trackRef.trim() || 'N/A'}`
        };
        btnConfirm.disabled = true;
        const old = btnConfirm.textContent;
        btnConfirm.textContent = 'Confirmando...';
        try {
          const out = await DebmediaApi.citasRequest('appointments', {
            method: 'POST',
            body,
            profile: 'andreani'
          });
          setAlert('success', `¡Cita creada! ID: ${out.id || '(recibido)'}`);
          setTimeout(() => {
            const inst = bootstrap.Modal.getInstance(modalPlanificar);
            if (inst) inst.hide();
          }, 1800);
        } catch (err) {
          setAlert('danger', err.message);
        } finally {
          btnConfirm.disabled = false;
          btnConfirm.textContent = old;
        }
      });
    })();

    // Fila Virtual — misma API que iniciar-videollamada.html
    const FV_QUEUE = 16223;
    const FV_BRANCH = 10750;

    let fvPollingInterval = null;
    let lastFvTurnCode = null;
    window.fvCurrentVideoCallUrl = 'about:blank';

    const fvFormEl = document.getElementById('fvGuardiaForm');
    const fvFormAlert = document.getElementById('fvFormAlert');
    const fvBtnEnviarTurno = document.getElementById('fvBtnEnviarTurno');
    const fvTurnInfoSection = document.getElementById('fvTurnInfoSection');
    const fv$ = (id) => document.getElementById(id);

    function fvSetFormAlert(type, msg) {
      fvFormAlert.className = `alert alert-${type}`;
      fvFormAlert.textContent = msg;
      fvFormAlert.classList.remove('d-none');
    }

    function fvClearFormAlert() {
      fvFormAlert.className = 'alert d-none';
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
      if (fvFormEl) {
        fvFormEl.reset();
        fvFormEl.querySelectorAll('input').forEach((input) => { input.disabled = false; });
      }
      fvClearFormAlert();
      if (fvTurnInfoSection) fvTurnInfoSection.classList.remove('active');
      if (fvBtnEnviarTurno) {
        fvBtnEnviarTurno.disabled = false;
        fvBtnEnviarTurno.style.display = '';
        fvBtnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Generar atención';
      }
      const vf = document.getElementById('fvVideoFrame');
      if (vf) vf.src = 'about:blank';
      window.fvCurrentVideoCallUrl = 'about:blank';
      lastFvTurnCode = null;
      const vm = document.getElementById('fvVideoModal');
      if (vm) {
        vm.classList.remove('active');
        vm.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    }

    const modalAtencionEl = document.getElementById('modalAtencion');
    if (modalAtencionEl) {
      modalAtencionEl.addEventListener('hidden.bs.modal', fvResetModal);
    }

    function fvFillWaitInfo({ code, number, avgWait, queueName, waitingRoom }) {
      fv$('fvTurnCodeDisplay').textContent = code;
      fv$('fvTurnNumber').textContent = number;
      fv$('fvAvgWaitingTime').textContent = avgWait;
      fv$('fvQueueName').textContent = queueName;
      fv$('fvWaitingRoomName').textContent = waitingRoom;
      fv$('fvTurnStatus').textContent = 'Consultando...';
      fv$('fvTurnStatus').className = 'fv-info-value fv-status-warn';
      fv$('fvCurrentWaitingTime').textContent = 'N/A';
      fv$('fvBtnAbrirVideo').disabled = true;
    }

    function fvStartPolling(turnCode) {
      fvStopPolling();
      const mapStatus = (s) => {
        if (s === 'ANNOUNCED') return { text: 'Lo estamos llamando', cls: 'fv-status-ok' };
        if (s === 'WAITING_TO_BE_CALLED') return { text: 'En breve lo llamaremos', cls: 'fv-status-warn' };
        if (s === 'FINALIZED') return { text: 'Atención finalizada', cls: 'fv-status-done' };
        return { text: s || 'Desconocido', cls: 'fv-status-warn' };
      };

      const tick = async () => {
        try {
          const data = await FilaVirtualApi.getTurnByCode(turnCode);
          const m = mapStatus(data.status);
          fv$('fvTurnStatus').textContent = m.text;
          fv$('fvTurnStatus').className = `fv-info-value ${m.cls}`;
          const avg = (data.averageWaitingTime ?? data.serviceTime);
          if (avg !== undefined && avg !== null && !isNaN(avg)) {
            fv$('fvCurrentWaitingTime').textContent = `${Math.floor(parseFloat(avg))} min`;
          }
          if (data.status === 'ANNOUNCED') {
            fv$('fvBtnAbrirVideo').disabled = false;
          }
        } catch (e) {
          fv$('fvTurnStatus').textContent = 'Error al consultar';
          fv$('fvTurnStatus').className = 'fv-info-value fv-status-err';
        }
      };

      tick();
      fvPollingInterval = setInterval(tick, 5000);
    }

    if (fvBtnEnviarTurno && fvFormEl) {
      fvBtnEnviarTurno.addEventListener('click', async () => {
        fvClearFormAlert();
        const data = Object.fromEntries(new FormData(fvFormEl).entries());
        if (!data.firstName || !data.lastName || !data.rut || !data.email ) {
          fvSetFormAlert('danger', 'Completa todos los campos.');
          return;
        }

        fvBtnEnviarTurno.disabled = true;
        fvBtnEnviarTurno.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';

        try {
          const out = await FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, {
            firstName: data.firstName,
            lastName: data.lastName,
            dni: data.rut,
            email: data.email
          });

          const turnCode = out.code || '—';
          lastFvTurnCode = turnCode;
          try { localStorage.setItem('turnCode', turnCode); } catch (e) { /* ignore */ }

          const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
          const avgWait = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
          const queueName = out.jsonDetails?.queue?.name || '—';
          const wrName = out.jsonDetails?.waitingRoom?.name || '—';
          const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';
          window.fvCurrentVideoCallUrl = videoCallUrl;

          const urlWithParam = videoCallUrl.includes('?')
            ? `${videoCallUrl}&videocallUser=mobile`
            : `${videoCallUrl}?videocallUser=mobile`;
          const vf = document.getElementById('fvVideoFrame');
          if (vf) vf.src = urlWithParam;

          fvFillWaitInfo({
            code: turnCode,
            number: turnNumber,
            avgWait: isFinite(avgWait) ? `${Math.floor(parseFloat(avgWait))} min` : 'N/A',
            queueName,
            waitingRoom: wrName
          });

          fvTurnInfoSection.classList.add('active');
          fvFormEl.querySelectorAll('input').forEach((input) => { input.disabled = true; });
          fvBtnEnviarTurno.disabled = true;
          fvBtnEnviarTurno.style.display = 'none';

          fvStartPolling(turnCode);
        } catch (err) {
          fvSetFormAlert('danger', err.message);
        } finally {
          fvBtnEnviarTurno.disabled = false;
          fvBtnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Generar atención';
        }
      });
    }

    const fvBtnAbrirVideo = document.getElementById('fvBtnAbrirVideo');
    if (fvBtnAbrirVideo) {
      fvBtnAbrirVideo.addEventListener('click', () => {
        const videoUrl = window.fvCurrentVideoCallUrl || 'about:blank';
        const urlWithParam = videoUrl.includes('?')
          ? `${videoUrl}&videocallUser=mobile`
          : `${videoUrl}?videocallUser=mobile`;
        const vf = document.getElementById('fvVideoFrame');
        if (vf) vf.src = urlWithParam;
        const vm = document.getElementById('fvVideoModal');
        if (vm) {
          vm.classList.add('active');
          vm.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
      });
    }

    const fvBtnCloseVideo = document.getElementById('fvBtnCloseVideo');
    const fvVideoModal = document.getElementById('fvVideoModal');
    if (fvBtnCloseVideo && fvVideoModal) {
      fvBtnCloseVideo.addEventListener('click', () => {
        fvVideoModal.classList.remove('active');
        fvVideoModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
      fvVideoModal.addEventListener('click', (e) => {
        if (e.target === fvVideoModal) {
          fvVideoModal.classList.remove('active');
          fvVideoModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      const vm = document.getElementById('fvVideoModal');
      if (e.key === 'Escape' && vm && vm.classList.contains('active')) {
        vm.classList.remove('active');
        vm.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });

    // Wizard envío
    let envioStep = 1;
    const totalSteps = 4;
    const stepsEl = document.querySelectorAll('#stepsEnvio .step');
    const panels = document.querySelectorAll('.envio-step');

    function updateEnvioUI() {
      panels.forEach((p, i) => {
        p.classList.toggle('d-none', parseInt(p.dataset.step, 10) !== envioStep);
      });
      stepsEl.forEach((s, i) => s.classList.toggle('active', i + 1 === envioStep));
      document.getElementById('btnEnvioPrev').disabled = envioStep === 1;
      document.getElementById('btnEnvioNext').textContent = envioStep === totalSteps ? 'Reiniciar demo' : 'Siguiente';
    }

    document.getElementById('btnEnvioNext').addEventListener('click', () => {
      if (envioStep < totalSteps) { envioStep++; updateEnvioUI(); } else { envioStep = 1; updateEnvioUI(); } }); document.getElementById('btnEnvioPrev').addEventListener('click', () => {
      if (envioStep > 1) {
        envioStep--;
        updateEnvioUI();
      }
    });

    updateEnvioUI();
