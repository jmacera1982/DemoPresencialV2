function showRatesTab(tab){
      const tabDivisas=document.getElementById('tabDivisas');
      const tabTasas=document.getElementById('tabTasas');
      const tablaDivisas=document.getElementById('tablaDivisas');
      const tablaTasas=document.getElementById('tablaTasas');
      if(tab==='divisas'){ tabDivisas.classList.add('active'); tabTasas.classList.remove('active'); tablaDivisas.style.display=''; tablaTasas.style.display='none'; }
      else { tabDivisas.classList.remove('active'); tabTasas.classList.add('active'); tablaDivisas.style.display='none'; tablaTasas.style.display=''; }
    }
    document.addEventListener('DOMContentLoaded', function() {
      const btn = document.getElementById('max-chat');
      const openBtn = document.getElementById('open-chat');
      if (btn) {
        btn.remove();
      }
      if (openBtn && openBtn.dataset.chatUrl) {
        openBtn.onclick = function(event) {
          event.preventDefault();
          window.open(openBtn.dataset.chatUrl, '_blank', 'noopener,noreferrer');
        };
      }

      // Modal de Inversiones (flujo: selección -> formulario -> API)
      const btnInversiones = document.getElementById('btnInversionesComenzar');
      const modalInversionesEl = document.getElementById('modalInversiones');
      const modalInversiones = new bootstrap.Modal(modalInversionesEl);
      const invStep1 = document.getElementById('invStep1');
      const invStep2 = document.getElementById('invStep2');
      const invForm = document.getElementById('invForm');
      const invFormAlert = document.getElementById('invFormAlert');
      const invDetalleDisplay = document.getElementById('invDetalleDisplay');
      const invBtnVolver = document.getElementById('invBtnVolver');
      const invBtnEnviar = document.getElementById('invBtnEnviar');

      const INV_QUEUE = 8749;
      const INV_BRANCH = 11;

      let selectedInvDetalle = null;

      function invSetAlert(type, msg) {
        invFormAlert.className = `alert alert-${type}`;
        invFormAlert.textContent = msg;
        invFormAlert.classList.remove('d-none');
      }
      function invClearAlert() {
        invFormAlert.className = 'alert d-none';
        invFormAlert.textContent = '';
      }

      function invResetModal() {
        selectedInvDetalle = null;
        invStep1.classList.remove('d-none');
        invStep2.classList.add('d-none');
        invBtnVolver.classList.add('d-none');
        invBtnEnviar.classList.add('d-none');
        invForm.reset();
        invClearAlert();
        document.querySelectorAll('.inv-type-card').forEach(c => c.classList.remove('selected'));
      }

      if (btnInversiones) {
        btnInversiones.addEventListener('click', () => {
          invResetModal();
          modalInversiones.show();
        });
      }

      modalInversionesEl.addEventListener('show.bs.modal', invResetModal);

      document.querySelectorAll('.inv-type-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.inv-type-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedInvDetalle = card.dataset.detalle;
          invStep1.classList.add('d-none');
          invStep2.classList.remove('d-none');
          invDetalleDisplay.textContent = selectedInvDetalle;
          invBtnVolver.classList.remove('d-none');
          invBtnEnviar.classList.remove('d-none');
        });
      });

      invBtnVolver.addEventListener('click', () => {
        invStep2.classList.add('d-none');
        invStep1.classList.remove('d-none');
        invBtnVolver.classList.add('d-none');
        invBtnEnviar.classList.add('d-none');
        selectedInvDetalle = null;
        document.querySelectorAll('.inv-type-card').forEach(c => c.classList.remove('selected'));
      });

      invBtnEnviar.addEventListener('click', async () => {
        invClearAlert();
        const data = Object.fromEntries(new FormData(invForm).entries());
        if (!data.firstName || !data.lastName || !data.dni || !data.email || !data.phone) {
          invSetAlert('danger', 'Completa todos los campos.');
          return;
        }
        invBtnEnviar.disabled = true;
        invBtnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        try {
          const body = {
            firstName: data.firstName,
            lastName: data.lastName,
            dni: data.dni,
            email: data.email,
            phone: data.phone,
            extraFields: [
              {
                showable: [{ in: 'workstation', format: 'both' }],
                "Producto seleccionado": selectedInvDetalle
              }
            ],
            customerExtraFields: [
              {
                showable: [{ in: 'workstation', format: 'both' }]
              }
            ]
          };
          const out = await FilaVirtualApi.enqueue(INV_QUEUE, INV_BRANCH, body);

          // Replicar flujo de sala de espera (igual que Apertura de cuenta nómina)
          const turnCode = out.code || '—';
          const turnNumber = out.jsonDetails?.turn || out.jsonDetails?.actualTurn || '—';
          const avgWait = out.jsonDetails?.averageWaitingTime ?? out.jsonDetails?.serviceTime ?? 'N/A';
          const queueName = out.jsonDetails?.queue?.name || '—';
          const wrName = out.jsonDetails?.waitingRoom?.name || '—';
          const videoCallUrl = out.jsonDetails?.videoCallUrl || 'about:blank';

          window.currentVideoCallUrl = videoCallUrl.includes('?') ? `${videoCallUrl}&videocallUser=mobile` : `${videoCallUrl}?videocallUser=mobile`;

          window.fillWaitModal({
            code: turnCode,
            number: turnNumber,
            avgWait: isFinite(avgWait) ? `${Math.floor(parseFloat(avgWait))} min` : 'N/A',
            queueName,
            waitingRoom: wrName,
            presencial: true
          });

          modalInversiones.hide();
          invResetModal();
          const modalWait = new bootstrap.Modal(document.getElementById('modalSalaEspera'), { backdrop: 'static', keyboard: false });
          modalWait.show();
          window.startPolling(turnCode, true);
        } catch (err) {
          invSetAlert('danger', err.message);
        } finally {
          invBtnEnviar.disabled = false;
          invBtnEnviar.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Generar turno';
        }
      });
    });
