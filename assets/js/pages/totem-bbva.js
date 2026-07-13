
    document.addEventListener('DOMContentLoaded', function () {
      var FV_BRANCH = 10750;
      var FV_QUEUE_PRESENCIAL = 16221;

      var dniIngresado = '';
      var motivoActual = '';
      var turnoPresencialData = null;
      var analisisTimeouts = [];
      var ultimoDetalleExtraFields = 'El cliente cuenta con un Score crediticio >700. Adicionalmente registro el abandono de un proceso de oboarding digital. Se recomienda ofrecer Prestamo personal';

      var screens = {
        dni: document.getElementById('screenDni'),
        cita: document.getElementById('screenCitaMenu'),
        motivos: document.getElementById('screenMotivos'),
        opciones: document.getElementById('screenOpciones'),
        confirmacion: document.getElementById('screenConfirmacion')
      };

      var dniDisplay = document.getElementById('dniDisplay');
      var btnContinuarDni = document.getElementById('btnContinuarDni');
      var btnDelete = document.getElementById('btnDelete');
      var logContainer = document.getElementById('logContainer');
      var atencionSection = document.getElementById('atencionSection');
      var stepsContainer = document.getElementById('stepsContainer');
      var summarySection = document.getElementById('summarySection');
      var summaryContent = document.getElementById('summaryContent');
      var opcionesGrid = document.getElementById('opcionesGrid');

      function showScreen(name) {
        Object.keys(screens).forEach(function (k) {
          if (screens[k]) screens[k].classList.toggle('active', k === name);
        });
      }

      function limpiarPanelAgente() {
        analisisTimeouts.forEach(function (id) { clearTimeout(id); });
        analisisTimeouts = [];
        if (stepsContainer) stepsContainer.innerHTML = '';
        if (summaryContent) summaryContent.innerHTML = '';
        if (summarySection) summarySection.style.display = 'none';
        if (atencionSection) atencionSection.classList.remove('active');
        if (logContainer) logContainer.classList.remove('visible');
      }

      function resetTotem() {
        limpiarPanelAgente();
        dniIngresado = '';
        motivoActual = '';
        turnoPresencialData = null;
        actualizarDisplayDni();
        showScreen('dni');
      }

      function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      function actualizarDisplayDni() {
        if (!dniDisplay) return;
        if (!dniIngresado) {
          dniDisplay.textContent = '';
          dniDisplay.classList.add('empty');
          btnContinuarDni.disabled = true;
        } else {
          dniDisplay.textContent = dniIngresado;
          dniDisplay.classList.remove('empty');
          btnContinuarDni.disabled = false;
        }
      }

      function agregarNumero(n) {
        if (dniIngresado.length < 15) {
          dniIngresado += n;
          actualizarDisplayDni();
        }
      }

      document.querySelectorAll('.keypad-btn[data-number]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          agregarNumero(btn.getAttribute('data-number'));
        });
      });

      if (btnDelete) {
        btnDelete.addEventListener('click', function () {
          dniIngresado = dniIngresado.slice(0, -1);
          actualizarDisplayDni();
        });
      }

      if (btnContinuarDni) {
        btnContinuarDni.addEventListener('click', function () {
          if (!dniIngresado) return;
          showScreen('cita');
        });
      }

      document.getElementById('btnTengoCita').addEventListener('click', function () {
        confirmarCitaAgendada();
      });

      document.getElementById('btnNoTengoCita').addEventListener('click', function () {
        showScreen('motivos');
      });

      document.querySelectorAll('[data-motivo]').forEach(function (card) {
        card.addEventListener('click', function () {
          motivoActual = card.getAttribute('data-motivo');
          iniciarAnalisisAgente(motivoActual);
        });
      });

      document.getElementById('btnVolver').addEventListener('click', resetTotem);

      function buildExtraFields(detalle) {
        return [{ showable: [{ in: 'workstation', format: 'both' }], Detalle: detalle }];
      }

      function buildDatosEnqueue() {
        return {
          dni: dniIngresado,
          extraFields: buildExtraFields(ultimoDetalleExtraFields)
        };
      }

      function obtenerResumenDemo(motivo) {
        var id = dniIngresado || 'cliente';
        if (motivo === 'Prestamos') {
          return 'Recomendación para DNI ' + id + ':\n\n**Tipo de atención sugerida**: Sucursal\n\nConsultas recientes sobre préstamos y perfil compatible con precalificación. Score: 720.\n\n- Sugerir sucursal: Sí\n- Tiempo estimado sucursal: ~45 min';
        }
        if (motivo === 'Tarjetas') {
          return 'Recomendación para DNI ' + id + ':\n\n**Tipo de atención sugerida**: Sucursal\n\nHistorial de gestiones sobre tarjeta de crédito. Para aumento de límite conviene atención presencial.\n\n- Sugerir sucursal: Sí';
        }
        if (motivo === 'Transferencias') {
          return 'Recomendación para DNI ' + id + ':\n\n**Tipo de atención sugerida**: Autogestión en app\n\nLa transferencia puede hacerse desde la app BBVA. Si necesita ayuda en sucursal, un asesor lo orientará en mostrador.\n\n- Sugerir sucursal: Sí\n- No requiere turno presencial para operaciones simples';
        }
        return '';
      }

      function agregarPaso(titulo, detalle, index) {
        var step = document.createElement('div');
        step.className = 'step-item processing';
        step.innerHTML =
          '<div class="step-title">' + escapeHtml(titulo) + '</div>' +
          '<div class="step-duration">Paso ' + (index + 1) + '</div>' +
          '<div class="step-output-content"><em class="step-output-detail">' + escapeHtml(detalle) + '</em></div>';
        stepsContainer.appendChild(step);
        setTimeout(function () { step.classList.add('completed'); }, 500);
        var logContent = document.querySelector('.log-content');
        if (logContent) logContent.scrollTop = logContent.scrollHeight;
      }

      function mostrarResumen(texto) {
        ultimoDetalleExtraFields = texto;
        var html = '';
        texto.split('\n').forEach(function (linea) {
          linea = linea.trim();
          if (!linea) { html += '<br>'; return; }
          if (linea.match(/^\*\*.*\*\*:/)) {
            html += '<div class="conversation-line title">' + escapeHtml(linea.replace(/\*\*/g, '').replace(':', '')) + '</div>';
          } else {
            html += '<div class="conversation-line">' + escapeHtml(linea) + '</div>';
          }
        });
        summaryContent.innerHTML = html;
        summarySection.style.display = 'block';
      }

      function iniciarAnalisisAgente(motivo) {
        limpiarPanelAgente();
        showScreen('motivos');

        logContainer.classList.add('visible');
        atencionSection.classList.add('active');
        stepsContainer.innerHTML = '';
        summarySection.style.display = 'none';

        var labels = {
          Prestamos: 'Préstamos personales',
          Tarjetas: 'Tarjetas de crédito',
          Transferencias: 'Transferencias'
        };
        var label = labels[motivo] || motivo;
        var pasos = [
          { t: 'Analizando tipo de atención solicitada', d: 'Motivo: ' + label + '. Evaluando canal en sucursal.' },
          { t: 'Analizando interacciones anteriores del cliente', d: 'Revisando consultas y productos del DNI ' + dniIngresado + '.' },
          { t: 'Generando recomendación de asesoramiento', d: 'Determinando el canal más eficiente.' }
        ];
        var delay = 900;

        pasos.forEach(function (p, i) {
          analisisTimeouts.push(setTimeout(function () { agregarPaso(p.t, p.d, i); }, i * delay));
        });

        analisisTimeouts.push(setTimeout(function () {
          var texto = obtenerResumenDemo(motivo);
          mostrarResumen(texto);
          mostrarOpcionesAtencion(motivo);
        }, pasos.length * delay + 400));
      }

      function formatearTiempoEspera(segundos) {
        if (segundos == null || segundos === '' || isNaN(segundos)) return 'No disponible';
        var total = Math.max(0, Math.floor(parseFloat(segundos)));
        var minutos = Math.floor(total / 60);
        var segs = total % 60;
        if (minutos > 0 && segs > 0) return minutos + ' min ' + segs + ' seg';
        if (minutos > 0) return minutos + ' min';
        return segs + ' seg';
      }

      function extraerTiempoEsperaSegundos(data) {
        if (!data) return null;
        if (data.averageWaitingTime != null) return data.averageWaitingTime;
        if (data.serviceTime != null) return data.serviceTime;
        if (data.jsonDetails) {
          if (data.jsonDetails.averageWaitingTime != null) return data.jsonDetails.averageWaitingTime;
          if (data.jsonDetails.serviceTime != null) return data.jsonDetails.serviceTime;
        }
        return null;
      }

      function actualizarTiempoEsperaEnCard(valor, loading) {
        var badge = document.getElementById('cardTiempoEspera');
        var valorEl = document.getElementById('cardTiempoEsperaValor');
        if (!badge || !valorEl) return;
        badge.classList.toggle('loading', !!loading);
        valorEl.textContent = valor;
      }

      async function precargarTurnoPresencial() {
        turnoPresencialData = null;
        actualizarTiempoEsperaEnCard('Consultando...', true);
        try {
          turnoPresencialData = await FilaVirtualApi.enqueue(FV_QUEUE_PRESENCIAL, FV_BRANCH, buildDatosEnqueue());
          actualizarTiempoEsperaEnCard(formatearTiempoEspera(extraerTiempoEsperaSegundos(turnoPresencialData)), false);
        } catch (err) {
          console.error('Error al consultar tiempo de espera:', err);
          actualizarTiempoEsperaEnCard('No disponible', false);
        }
      }

      function mostrarOpcionesAtencion(motivo) {
        showScreen('opciones');
        opcionesGrid.innerHTML = '';
        turnoPresencialData = null;

        document.getElementById('opcionesTitle').textContent = 'Atención en sucursal';
        document.getElementById('opcionesSubtitle').textContent =
          motivo === 'Transferencias'
            ? 'Un asesor te orientará en mostrador'
            : 'Según el análisis del agente';

        opcionesGrid.appendChild(crearCardPresencial());
        precargarTurnoPresencial();
      }

      function crearCardPresencial() {
        var card = document.createElement('div');
        card.className = 'opcion-card presencial recomendada';
        card.innerHTML =
          '<div class="opcion-icon"><i class="bi bi-geo-alt"></i></div>' +
          '<div class="opcion-title">Atención en sucursal</div>' +
          '<div class="opcion-espera loading" id="cardTiempoEspera">' +
            '<span class="opcion-espera-label">Tiempo de espera estimado</span>' +
            '<span class="opcion-espera-valor" id="cardTiempoEsperaValor">Consultando...</span>' +
          '</div>' +
          '<div class="opcion-desc">Te llamaremos por tu DNI</div>';
        card.addEventListener('click', function () {
          if (turnoPresencialData) {
            mostrarConfirmacion(turnoPresencialData, 'presencial');
            return;
          }
          solicitarAtencion('presencial');
        });
        return card;
      }

      async function solicitarAtencion(tipo) {
        try {
          var data = await FilaVirtualApi.enqueue(FV_QUEUE_PRESENCIAL, FV_BRANCH, buildDatosEnqueue());
          mostrarConfirmacion(data, tipo);
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }

      async function confirmarCitaAgendada() {
        try {
          await FilaVirtualApi.enqueue(FV_QUEUE_PRESENCIAL, FV_BRANCH, buildDatosEnqueue());
          showScreen('confirmacion');
          document.getElementById('confirmTitle').textContent = '¡Bienvenido! Registramos tu llegada';
          document.getElementById('confirmMessage').innerHTML =
            'Tenés cita agendada. Presentate en recepción.<br>Te llamaremos por tu DNI: <strong>' + escapeHtml(dniIngresado) + '</strong>';
          document.getElementById('tiempoEspera').style.display = 'none';
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }

      function mostrarConfirmacion(data, tipo) {
        showScreen('confirmacion');
        document.getElementById('confirmTitle').textContent = '¡Turno asignado!';
        document.getElementById('confirmMessage').innerHTML =
          'DNI: <strong>' + escapeHtml(dniIngresado) + '</strong><br>En breve un asesor te atenderá en sucursal.';

        var tiempoEl = document.getElementById('tiempoEspera');
        tiempoEl.style.display = 'none';

        var segundos = extraerTiempoEsperaSegundos(data);
        if (segundos != null) {
          tiempoEl.style.display = 'block';
          document.getElementById('tiempoEsperaValor').textContent = formatearTiempoEspera(segundos);
        }
      }

      actualizarDisplayDni();
    });
