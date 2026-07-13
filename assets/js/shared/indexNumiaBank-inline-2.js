const FV_QUEUE   = 16223;
    const FV_BRANCH  = 10750;
    const VIDEO_CALL_URL = 'about:blank';

    let pollingInterval = null;
    let lastTurnCode = null;
    window.currentVideoCallUrl = 'about:blank';

    const btnNominaComenzar = document.getElementById('btnNominaComenzar');
    const modalForm = new bootstrap.Modal(document.getElementById('modalGuardiaForm'));
    const modalWait = new bootstrap.Modal(document.getElementById('modalSalaEspera'), { backdrop: 'static', keyboard: false });
    const modalVideo = new bootstrap.Modal(document.getElementById('modalVideo'), { backdrop:'static' });
    const formEl = document.getElementById('guardiaForm');
    const formAlert = document.getElementById('formAlert');
    const btnEnviarTurno = document.getElementById('btnEnviarTurno');
    const $ = (id)=> document.getElementById(id);

    function setFormAlert(type, msg){ formAlert.className = `alert alert-${type}`; formAlert.textContent = msg; formAlert.classList.remove('d-none'); }
    function clearFormAlert(){ formAlert.className = 'alert d-none'; formAlert.textContent = ''; }

    btnNominaComenzar.addEventListener('click', ()=>{ clearFormAlert(); formEl.reset(); modalForm.show(); });

    btnEnviarTurno.addEventListener('click', async ()=>{
      clearFormAlert();
      const data = Object.fromEntries(new FormData(formEl).entries());
      if(!data.firstName || !data.lastName || !data.dni || !data.email || !data.phone){ setFormAlert('danger','Completa todos los campos.'); return; }
      btnEnviarTurno.disabled = true; btnEnviarTurno.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
      try{
        const out = await FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, { firstName:data.firstName, lastName:data.lastName, dni:data.dni, email:data.email, phone:data.phone });
        const turnCode = out.code || '—'; lastTurnCode = turnCode; localStorage.setItem('turnCode', turnCode);
        const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
        const avgWait    = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
        const queueName  = out.jsonDetails?.queue?.name || '—';
        const wrName     = out.jsonDetails?.waitingRoom?.name || '—';
        const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';
        window.currentVideoCallUrl = videoCallUrl.includes('?') ? `${videoCallUrl}&videocallUser=mobile` : `${videoCallUrl}?videocallUser=mobile`;
        fillWaitModal({ code:turnCode, number:turnNumber, avgWait:isFinite(avgWait)?`${Math.floor(parseFloat(avgWait))} min`:'N/A', queueName, waitingRoom:wrName });
        modalForm.hide(); modalWait.show(); startPolling(turnCode);
      }catch(err){ setFormAlert('danger', err.message);
      }finally{ btnEnviarTurno.disabled = false; btnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Generar turno'; }
    });

    // Función global para llenar el modal de sala de espera (presencial: true = turno presencial, solo botón Aceptar)
    window.fillWaitModal = function({code, number, avgWait, queueName, waitingRoom, presencial}){
      $('turnCodeDisplay').textContent = code; $('turnNumber').textContent = number; $('avgWaitingTime').textContent = avgWait;
      $('queueName').textContent = queueName; $('waitingRoomName').textContent = waitingRoom;
      $('turnStatus').textContent = 'Consultando...'; $('turnStatus').className = 'info-value status-warn';
      $('currentWaitingTime').textContent = 'N/A'; $('btnAbrirVideo').disabled = true;
      if (presencial) {
        $('salaEsperaVideoSection').classList.add('d-none');
        $('salaEsperaAceptarSection').classList.remove('d-none');
      } else {
        $('salaEsperaVideoSection').classList.remove('d-none');
        $('salaEsperaAceptarSection').classList.add('d-none');
      }
    }

    // Función global para iniciar el polling del turno (useTurnProfile=true para colas con perfil turn, ej. Inversiones)
    window.startPolling = function(turnCode, useTurnProfile){
      stopPolling();
      const mapStatus = (s)=> s==='ANNOUNCED'?{text:'Lo estamos llamando',cls:'status-ok'}: s==='WAITING_TO_BE_CALLED'?{text:'En breve lo llamaremos',cls:'status-warn'}: s==='FINALIZED'?{text:'Atención finalizada',cls:'status-done'}:{text:s||'Desconocido',cls:'status-warn'};
      const tick = async ()=>{
        try{
          const data = useTurnProfile
            ? await FilaVirtualApi.getTurnByCode(turnCode, { profile: 'turn' })
            : await FilaVirtualApi.getTurnByCode(turnCode);
          const m = mapStatus(data.status); $('turnStatus').textContent = m.text; $('turnStatus').className = `info-value ${m.cls}`;
          const avg = (data.averageWaitingTime ?? data.serviceTime); if(avg!==undefined && avg!==null && !isNaN(avg)){ $('currentWaitingTime').textContent = `${Math.floor(parseFloat(avg))} min`; }
          if(data.status === 'ANNOUNCED'){ $('btnAbrirVideo').disabled = false; }
        }catch(e){ $('turnStatus').textContent = 'Error al consultar'; $('turnStatus').className = 'info-value status-err'; }
      };
      tick(); pollingInterval = setInterval(tick, 5000);
    }
    function stopPolling(){ if(pollingInterval){ clearInterval(pollingInterval); pollingInterval = null; } }
    document.getElementById('btnCloseWait').addEventListener('click', stopPolling);
    document.getElementById('btnAceptarTurno').addEventListener('click', ()=>{
      stopPolling();
      const m = bootstrap.Modal.getInstance(document.getElementById('modalSalaEspera'));
      if (m) m.hide();
    });
    document.getElementById('btnAbrirVideo').addEventListener('click', ()=>{ openVideoModal({ width:'90vw', height:'80vh', url: window.currentVideoCallUrl }); });
    function openVideoModal({width='90vw', height='80vh', url=null}={}){ 
      const videoUrl = url || window.currentVideoCallUrl || 'about:blank';
      if(videoUrl && videoUrl !== 'about:blank'){
        window.open(videoUrl, '_blank', 'noopener,noreferrer');
      }
    }
