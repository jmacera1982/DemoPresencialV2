
    const FV_QUEUE   = 16223;
    const FV_BRANCH  = 10750;
    const VIDEO_CALL_URL = 'about:blank';

    let pollingInterval = null;
    let lastTurnCode = null;
    window.currentVideoCallUrl = 'about:blank';

    const formEl = document.getElementById('guardiaForm');
    const formAlert = document.getElementById('formAlert');
    const btnEnviarTurno = document.getElementById('btnEnviarTurno');
    const $ = (id) => document.getElementById(id);

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
      
      if (!data.firstName || !data.lastName || !data.rut || !data.email || !data.phone) {
        setFormAlert('danger', 'Completa todos los campos.');
        return;
      }
      
      btnEnviarTurno.disabled = true;
      btnEnviarTurno.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
      
      try {
        const out = await FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, {
          firstName: data.firstName,
          lastName: data.lastName,
          dni: data.rut,
          email: data.email,
          phone: data.phone
        });
        
        const turnCode = out.code || '—';
        lastTurnCode = turnCode;
        localStorage.setItem('turnCode', turnCode);
        
        const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
        const avgWait = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
        const queueName = out.jsonDetails?.queue?.name || '—';
        const wrName = out.jsonDetails?.waitingRoom?.name || '—';
        const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';
        window.currentVideoCallUrl = videoCallUrl.includes('?') 
          ? `${videoCallUrl}&videocallUser=mobile` 
          : `${videoCallUrl}?videocallUser=mobile`;
        
        // Llenar la información de la atención
        fillWaitModal({
          code: turnCode,
          number: turnNumber,
          avgWait: isFinite(avgWait) ? `${Math.floor(parseFloat(avgWait))} min` : 'N/A',
          queueName,
          waitingRoom: wrName
        });
        
        // Mostrar la sección de información de la atención
        document.getElementById('turnInfoSection').classList.add('active');
        
        // Deshabilitar el formulario (solo lectura)
        formEl.querySelectorAll('input').forEach(input => {
          input.disabled = true;
        });
        btnEnviarTurno.disabled = true;
        btnEnviarTurno.style.display = 'none';
        
        // Iniciar polling
        startPolling(turnCode);
        
      } catch (err) {
        setFormAlert('danger', err.message);
      } finally {
        btnEnviarTurno.disabled = false;
        btnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Generar atención';
      }
    });
    
    function fillWaitModal({code, number, avgWait, queueName, waitingRoom}) {
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
        if (s === 'ANNOUNCED') {
          return { text: 'Lo estamos llamando', cls: 'status-ok' };
        } else if (s === 'WAITING_TO_BE_CALLED') {
          return { text: 'En breve lo llamaremos', cls: 'status-warn' };
        } else if (s === 'FINALIZED') {
          return { text: 'Atención finalizada', cls: 'status-done' };
        } else {
          return { text: s || 'Desconocido', cls: 'status-warn' };
        }
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
    
    // Botón para abrir video
    document.getElementById('btnAbrirVideo').addEventListener('click', () => {
      const videoUrl = window.currentVideoCallUrl || 'about:blank';
      if (videoUrl && videoUrl !== 'about:blank') {
        window.open(videoUrl, '_blank', 'noopener,noreferrer');
      }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('videoModal').classList.contains('active')) {
        document.getElementById('videoModal').classList.remove('active');
        document.body.style.overflow = '';
      }
    });
