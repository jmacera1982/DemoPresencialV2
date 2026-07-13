
    const FV_QUEUE  = 18567;
    const FV_BRANCH = 10827;

    let pollingInterval = null;
    window.currentVideoCallUrl = 'about:blank';

    const formEl = document.getElementById('guardiaForm');
    const formAlert = document.getElementById('formAlert');
    const btnEnviarTurno = document.getElementById('btnEnviarTurno');
    const $ = (id) => document.getElementById(id);

    const SHOWABLE_WORKSTATION = [{ in: 'workstation', format: 'both' }];

    function buildEnqueuePayload(data) {
      return {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dni: data.dni.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        extraFields: [
          {
            showable: SHOWABLE_WORKSTATION,
            Interes: data.interes.trim(),
            Canal: 'web'
          }
        ],
        customerExtraFields: [
          {
            showable: SHOWABLE_WORKSTATION
          }
        ]
      };
    }

    function setFormAlert(type, msg) {
      formAlert.className = `alert alert-${type}`;
      formAlert.textContent = msg;
      formAlert.classList.remove('d-none');
    }

    function clearFormAlert() {
      formAlert.className = 'alert d-none';
      formAlert.textContent = '';
    }

    btnEnviarTurno.addEventListener('click', async () => {
      clearFormAlert();
      const data = Object.fromEntries(new FormData(formEl).entries());

      if (!data.firstName || !data.lastName || !data.dni || !data.email || !data.phone || !data.interes) {
        setFormAlert('danger', 'Completá todos los campos.');
        return;
      }

      btnEnviarTurno.disabled = true;
      btnEnviarTurno.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';

      try {
        const out = await FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, buildEnqueuePayload(data));

        const turnCode = out.code || '—';
        localStorage.setItem('turnCode', turnCode);

        const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
        const avgWait = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
        const queueName = out.jsonDetails?.queue?.name || '—';
        const wrName = out.jsonDetails?.waitingRoom?.name || '—';
        const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';
        window.currentVideoCallUrl = videoCallUrl;

        fillWaitModal({
          code: turnCode,
          number: turnNumber,
          avgWait: isFinite(avgWait) ? `${Math.floor(parseFloat(avgWait))} min` : 'N/A',
          queueName,
          waitingRoom: wrName
        });

        $('turnInfoSection').classList.add('active');

        formEl.querySelectorAll('input, select').forEach(el => { el.disabled = true; });
        btnEnviarTurno.disabled = true;
        btnEnviarTurno.style.display = 'none';

        startPolling(turnCode);

      } catch (err) {
        setFormAlert('danger', err.message);
        btnEnviarTurno.disabled = false;
        btnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Generar atención';
      }
    });

    function fillWaitModal({ code, number, avgWait, queueName, waitingRoom }) {
      $('turnCodeDisplay').textContent = code;
      $('turnNumber').textContent = number;
      $('avgWaitingTime').textContent = avgWait;
      $('queueName').textContent = queueName;
      $('waitingRoomName').textContent = waitingRoom;
      $('turnStatus').textContent = 'Consultando...';
      $('turnStatus').className = 'info-value status-warn';
      $('currentWaitingTime').textContent = 'N/A';
      $('btnAbrirVideo').disabled = true;
    }

    function startPolling(turnCode) {
      stopPolling();
      const mapStatus = (s) => {
        if (s === 'ANNOUNCED') return { text: 'Lo estamos llamando', cls: 'status-ok' };
        if (s === 'WAITING_TO_BE_CALLED') return { text: 'En breve lo llamaremos', cls: 'status-warn' };
        if (s === 'FINALIZED') return { text: 'Atención finalizada', cls: 'status-done' };
        return { text: s || 'Desconocido', cls: 'status-warn' };
      };

      const tick = async () => {
        try {
          const data = await FilaVirtualApi.getTurnByCode(turnCode);
          const m = mapStatus(data.status);

          $('turnStatus').textContent = m.text;
          $('turnStatus').className = `info-value ${m.cls}`;

          const avg = (data.averageWaitingTime ?? data.serviceTime);
          if (avg !== undefined && avg !== null && !isNaN(avg)) {
            $('currentWaitingTime').textContent = `${Math.floor(parseFloat(avg))} min`;
          }

          if (data.status === 'ANNOUNCED') {
            $('btnAbrirVideo').disabled = false;
          }
        } catch (e) {
          $('turnStatus').textContent = 'Error al consultar';
          $('turnStatus').className = 'info-value status-err';
        }
      };

      tick();
      pollingInterval = setInterval(tick, 5000);
    }

    function stopPolling() {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    }

    $('btnAbrirVideo').addEventListener('click', () => {
      const videoUrl = window.currentVideoCallUrl || 'about:blank';
      const urlWithParam = videoUrl.includes('?')
        ? `${videoUrl}&videocallUser=mobile`
        : `${videoUrl}?videocallUser=mobile`;

      $('videoFrame').src = urlWithParam;
      $('videoModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    $('btnCloseVideo').addEventListener('click', () => {
      $('videoModal').classList.remove('active');
      document.body.style.overflow = '';
    });

    $('videoModal').addEventListener('click', (e) => {
      if (e.target === $('videoModal')) {
        $('videoModal').classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('videoModal').classList.contains('active')) {
        $('videoModal').classList.remove('active');
        document.body.style.overflow = '';
      }
    });
