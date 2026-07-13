document.addEventListener('DOMContentLoaded', function() {
      var FV_BRANCH = '10750';
      var FV_AUTH_QUEUE = '18306';
      var FV_CHECKIN_QUEUE = '16221';
      var FV_VIDEO_QUEUE = '16223';

      var cedulaIngresada = '';
      var authTimeoutId = null;
      var archivoAdjunto = null;
      var autorizacionEnviada = false;

      var screens = {
        inicio: document.getElementById('screenInicio'),
        autorizacion: document.getElementById('screenAutorizacion'),
        salaEspera: document.getElementById('screenSalaEspera')
      };

      function showScreen(name) {
        Object.keys(screens).forEach(function(k) {
          if (screens[k]) screens[k].classList.remove('active');
        });
        if (screens[name]) screens[name].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function buildPayloadEnqueue() {
        return {
          firstName: 'Paciente',
          lastName: 'Colsanitas',
          dni: cedulaIngresada,
          email: 'mail@mail.com',
          phone: '12345678'
        };
      }

      document.querySelectorAll('[data-volver="inicio"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (authTimeoutId) {
            clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }
          resetAutorizacion();
          showScreen('inicio');
        });
      });

      /* ——— Pantalla inicio ——— */
      document.getElementById('formInicio').addEventListener('submit', function(e) {
        e.preventDefault();
        var cedula = document.getElementById('inputCedula').value.trim();
        var tipo = document.querySelector('input[name="tipoAtencion"]:checked');
        var errCedula = document.getElementById('errorCedula');
        var errTipo = document.getElementById('errorTipo');
        errCedula.style.display = 'none';
        errTipo.style.display = 'none';

        var valid = true;
        if (!cedula) {
          errCedula.textContent = 'Ingrese su número de cédula';
          errCedula.style.display = 'block';
          valid = false;
        }
        if (!tipo) {
          errTipo.textContent = 'Seleccione un tipo de atención';
          errTipo.style.display = 'block';
          valid = false;
        }
        if (!valid) return;

        cedulaIngresada = cedula;

        if (tipo.value === 'autorizacion') {
          document.getElementById('cedulaAutorizacionLabel').textContent = cedulaIngresada;
          resetAutorizacion();
          showScreen('autorizacion');
        } else {
          iniciarAsesoramientoVideollamada();
        }
      });

      /* ——— Autorización: adjuntar → Solicitar autorización → turno → autorizado → Check-in ——— */
      var fileUploadArea = document.getElementById('fileUploadArea');
      var authFileInput = document.getElementById('authFileInput');
      var statusAutorizacion = document.getElementById('statusAutorizacion');
      var fileNameText = document.getElementById('fileNameText');
      var btnSolicitarAutorizacion = document.getElementById('btnSolicitarAutorizacion');
      var btnCheckin = document.getElementById('btnCheckin');
      var turnInfoCard = document.getElementById('turnInfoCard');

      function resetAutorizacion() {
        authFileInput.value = '';
        archivoAdjunto = null;
        autorizacionEnviada = false;
        fileUploadArea.classList.remove('has-file');
        fileNameText.style.display = 'none';
        fileNameText.textContent = '';
        statusAutorizacion.innerHTML = '';
        btnSolicitarAutorizacion.classList.remove('visible');
        btnSolicitarAutorizacion.disabled = false;
        btnSolicitarAutorizacion.innerHTML = '<i class="bi bi-send me-2"></i>Solicitar autorización';
        btnCheckin.classList.remove('visible');
        btnCheckin.classList.remove('is-complete');
        btnCheckin.disabled = false;
        btnCheckin.innerHTML = '<i class="bi bi-box-arrow-in-right"></i><span>Check-in</span>';
        turnInfoCard.classList.remove('visible');
        turnInfoCard.innerHTML = '';
        fileUploadArea.style.pointerEvents = '';
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          authTimeoutId = null;
        }
      }

      fileUploadArea.addEventListener('click', function() {
        if (!autorizacionEnviada && !fileUploadArea.classList.contains('has-file')) {
          authFileInput.click();
        }
      });

      authFileInput.addEventListener('change', function() {
        if (!this.files || this.files.length === 0) return;

        archivoAdjunto = this.files[0];
        fileNameText.textContent = archivoAdjunto.name;
        fileNameText.style.display = 'block';
        fileUploadArea.classList.add('has-file');
        btnSolicitarAutorizacion.classList.add('visible');
      });

      btnSolicitarAutorizacion.addEventListener('click', async function() {
        if (!archivoAdjunto || autorizacionEnviada) return;

        btnSolicitarAutorizacion.disabled = true;
        btnSolicitarAutorizacion.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Enviando solicitud…';
        fileUploadArea.style.pointerEvents = 'none';

        try {
          var data = await FilaVirtualApi.enqueue(FV_AUTH_QUEUE, FV_BRANCH, buildPayloadEnqueue());

          autorizacionEnviada = true;
          btnSolicitarAutorizacion.classList.remove('visible');

          statusAutorizacion.innerHTML =
            '<div class="status-badge pending-auth">' +
              '<i class="bi bi-clock-history"></i> Pendiente autorización' +
            '</div>';

          authTimeoutId = setTimeout(function() {
            statusAutorizacion.innerHTML =
              '<div class="status-badge authorized">' +
                '<i class="bi bi-check-circle-fill"></i> Autorizado' +
              '</div>';
            btnCheckin.classList.add('visible');
          }, 20000);
        } catch (err) {
          console.error('Error al solicitar autorización:', err);
          btnSolicitarAutorizacion.disabled = false;
          btnSolicitarAutorizacion.innerHTML = '<i class="bi bi-send me-2"></i>Solicitar autorización';
          fileUploadArea.style.pointerEvents = '';
          statusAutorizacion.innerHTML =
            '<div class="alert-error">No se pudo registrar la solicitud: ' + err.message + '</div>';
        }
      });

      btnCheckin.addEventListener('click', async function() {
        btnCheckin.disabled = true;
        btnCheckin.innerHTML = '<i class="bi bi-hourglass-split"></i><span>Procesando…</span>';

        try {
          var data = await FilaVirtualApi.enqueue(FV_CHECKIN_QUEUE, FV_BRANCH, buildPayloadEnqueue());

          if (!data) throw new Error('Error en check-in');

          var turn = data.turn || (data.jsonDetails && data.jsonDetails.turn) || '—';
          var waitSec = data.averageWaitingTime != null
            ? data.averageWaitingTime
            : (data.jsonDetails && data.jsonDetails.averageWaitingTime != null
              ? data.jsonDetails.averageWaitingTime
              : null);
          var roomName = (data.waitingRoom && data.waitingRoom.name)
            ? data.waitingRoom.name
            : (data.jsonDetails && data.jsonDetails.waitingRoom && data.jsonDetails.waitingRoom.name
              ? data.jsonDetails.waitingRoom.name
              : '—');

          var tiempoTexto = 'En breve';
          if (waitSec != null && isFinite(Number(waitSec))) {
            var sec = Number(waitSec);
            var min = Math.floor(sec / 60);
            var rest = sec % 60;
            tiempoTexto = min > 0 ? min + ' min ' + rest + ' seg' : rest + ' seg';
          }

          btnCheckin.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Check-in realizado</span>';
          btnCheckin.classList.add('is-complete');

          turnInfoCard.innerHTML =
            '<div class="turn-number">' + turn + '</div>' +
            '<div class="info-row">' +
              '<span class="info-label">Sala de espera</span>' +
              '<span class="info-value">' + roomName + '</span>' +
            '</div>' +
            '<div class="info-row">' +
              '<span class="info-label">Tiempo estimado</span>' +
              '<span class="info-value">' + tiempoTexto + '</span>' +
            '</div>';
          turnInfoCard.classList.add('visible');
        } catch (err) {
          console.error('Error en check-in:', err);
          btnCheckin.disabled = false;
          btnCheckin.innerHTML = '<i class="bi bi-box-arrow-in-right"></i><span>Check-in</span>';
          alert('Error al realizar el check-in. Intente nuevamente.');
        }
      });

      /* ——— Asesoramiento → sala de espera videollamada ——— */
      async function iniciarAsesoramientoVideollamada() {
        showScreen('salaEspera');
        document.getElementById('cedulaSalaLabel').textContent = cedulaIngresada;
        document.getElementById('salaEsperaLoading').style.display = 'block';
        document.getElementById('salaEsperaContenido').style.display = 'none';
        document.getElementById('salaEsperaError').style.display = 'none';
        document.getElementById('btnReintentar').style.display = 'none';

        try {
          var data = await FilaVirtualApi.enqueue(FV_VIDEO_QUEUE, FV_BRANCH, buildPayloadEnqueue());

          mostrarSalaEspera(data);
        } catch (err) {
          console.error('Error sala de espera:', err);
          document.getElementById('salaEsperaLoading').style.display = 'none';
          var errEl = document.getElementById('salaEsperaError');
          errEl.textContent = 'No se pudo conectar con la sala de espera: ' + err.message;
          errEl.style.display = 'block';
          document.getElementById('btnReintentar').style.display = 'block';
        }
      }

      function mostrarSalaEspera(data) {
        document.getElementById('salaEsperaLoading').style.display = 'none';
        document.getElementById('salaEsperaContenido').style.display = 'block';

        var turn = data.turn || (data.jsonDetails && data.jsonDetails.turn) || '—';
        var waitSec = data.averageWaitingTime != null
          ? data.averageWaitingTime
          : (data.jsonDetails && data.jsonDetails.averageWaitingTime != null
            ? data.jsonDetails.averageWaitingTime
            : null);
        var roomName = (data.waitingRoom && data.waitingRoom.name)
          ? data.waitingRoom.name
          : (data.jsonDetails && data.jsonDetails.waitingRoom && data.jsonDetails.waitingRoom.name
            ? data.jsonDetails.waitingRoom.name
            : 'Videollamada Colsanitas');

        document.getElementById('turnoValor').textContent = turn;

        if (waitSec != null && isFinite(Number(waitSec))) {
          var sec = Number(waitSec);
          var min = Math.floor(sec / 60);
          var rest = sec % 60;
          document.getElementById('tiempoEsperaValor').textContent =
            min > 0 ? min + ' min ' + rest + ' seg' : rest + ' seg';
        } else {
          document.getElementById('tiempoEsperaValor').textContent = 'En breve';
        }

        document.getElementById('salaNombre').textContent = roomName;

        var btnVideo = document.getElementById('btnVideoLink');
        var videoUrl = data.videoCallUrl
          || (data.jsonDetails && data.jsonDetails.videoCallUrl);

        if (videoUrl) {
          var url = videoUrl + (videoUrl.indexOf('?') >= 0 ? '&' : '?') + 'videocallUser=mobile';
          btnVideo.href = url;
          btnVideo.style.display = 'inline-flex';
        } else {
          btnVideo.style.display = 'none';
        }
      }

      document.getElementById('btnReintentar').addEventListener('click', function() {
        iniciarAsesoramientoVideollamada();
      });
});
