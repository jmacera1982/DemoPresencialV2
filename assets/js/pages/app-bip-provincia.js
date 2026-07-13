
    (function () {
      var contenido = {
        bienes: {
          title: 'Bienes raíces',
          html: '\n            <div class="bdb-detail-card">\n              <h3>Descripción</h3>\n              <p>Inversión en inmuebles para obtener renta por arriendo o ganancia por revalorización al vender. Suele ser un activo de mediano a largo plazo.</p>\n            </div>\n            <div class="bdb-detail-card">\n              <h3>Beneficios</h3>\n              <ul class="bdb-list-dots">\n                <li>Ingresos recurrentes posibles con canon de arriendo.</li>\n                <li>Potencial de protección frente a inflación en zonas con demanda.</li>\n                <li>Diversificación del patrimonio.</li>\n              </ul>\n            </div>\n            <div id="bloqueAsesoria" class="bloque-asesoria" tabindex="-1">\n              <button type="button" class="bdc-btn-primary bdc-btn-full" data-action="asesoramiento">Recibir asesoramiento</button>\n            </div>\n          '
        },
        empresarial: {
          title: 'Proyectos empresariales o productivos',
          html: '\n            <div class="bdb-detail-card">\n              <h3>Descripción</h3>\n              <p>Aportás capital a una empresa o proyecto productivo a cambio de participación en utilidades, dividendos o revalorización de tu participación.</p>\n            </div>\n            <div class="bdb-detail-card">\n              <h3>Beneficios</h3>\n              <ul class="bdb-list-dots">\n                <li>Posibilidad de retornos superiores a instrumentos muy conservadores.</li>\n                <li>Alineación con sectores o causas que te interesen.</li>\n                <li>Flexibilidad de tamaño de ticket según la oportunidad.</li>\n              </ul>\n            </div>\n            <div id="bloqueAsesoria" class="bloque-asesoria" tabindex="-1">\n              <button type="button" class="bdc-btn-primary bdc-btn-full" data-action="asesoramiento">Recibir asesoramiento</button>\n            </div>\n          '
        },
        obligaciones: {
          title: 'Ahorro para el pago de obligaciones',
          html: '\n            <div class="bdb-detail-card">\n              <h3>Descripción</h3>\n              <p>Ahorrá de forma disciplinada para cubrir un gasto futuro conocido (educación, vivienda, pensión complementaria, etc.), alineando monto, fecha y aportes.</p>\n            </div>\n            <div class="bdb-detail-card">\n              <h3>Beneficios</h3>\n              <ul class="bdb-list-dots">\n                <li>Mayor tiempo disponible suele reducir la cuota periódica necesaria.</li>\n                <li>Te ayuda a separar la meta del gasto corriente.</li>\n                <li>Podés combinar instrumentos según plazo y perfil de riesgo.</li>\n              </ul>\n            </div>\n            <div id="bloqueAsesoria" class="bloque-asesoria" tabindex="-1">\n              <button type="button" class="bdc-btn-primary bdc-btn-full" data-action="asesoramiento">Recibir asesoramiento</button>\n            </div>\n          '
        },
        financieras: {
          title: 'Inversiones financieras',
          html: '\n            <div class="bdb-detail-card">\n              <h3>Descripción</h3>\n              <p>Inversión en instrumentos del sistema financiero y del mercado de capitales (CDT, bonos, acciones, fondos, etc.) con distintas combinaciones de riesgo, plazo y liquidez.</p>\n            </div>\n            <div class="bdb-detail-card">\n              <h3>Beneficios</h3>\n              <ul class="bdb-list-dots">\n                <li>Amplia oferta para armar un portafolio acorde a tu perfil.</li>\n                <li>Posibilidad de diversificar por activo y horizonte.</li>\n                <li>Acceso a mercados regulados (p. ej. Bolsa de Valores de Colombia).</li>\n              </ul>\n            </div>\n            <div id="bloqueAsesoria" class="bloque-asesoria" tabindex="-1">\n              <button type="button" class="bdc-btn-primary bdc-btn-full" data-action="asesoramiento">Recibir asesoramiento</button>\n            </div>\n          '
        },
        cdt: {
          title: 'Plazo fijo UVA',
          html: ''
        }
      };

      function buildCdtHtml() {
        return (
          '<div class="bdb-detail-card">' +
            '<h3>Descripción</h3>' +
            '<p>Plazo fijo digital en pesos o UVA con tasa de referencia de hasta 12% nominal anual (verificá condiciones vigentes en el sitio oficial). Apertura desde $10.000, plazos desde 30 días.</p>' +
          '</div>' +
          '<div class="bdb-detail-card">' +
            '<h3>Beneficios</h3>' +
            '<ul class="bdb-list-dots">' +
              '<li>Tasa fija conocida al contratar.</li>' +
              '<li>Trámite y seguimiento por canales digitales.</li>' +
              '<li>Distintas opciones de plazo según producto.</li>' +
              '<li>Entidad supervisada y marco de seguro de depósitos.</li>' +
            '</ul>' +
          '</div>' +
          '<div id="bloqueAsesoria" class="bloque-asesoria" tabindex="-1">' +
            '<button type="button" class="bdc-btn-primary bdc-btn-full" data-action="asesoramiento">Recibir asesoramiento</button>' +
          '</div>'
        );
      }

      var screenHome = document.getElementById('screen-home');
      var screenAyuda = document.getElementById('screen-ayuda');
      var screenCdt = document.getElementById('screen-cdt');
      var screenInv = document.getElementById('screen-inversiones');
      var detail = document.getElementById('screen-detail');
      var detailTitle = document.getElementById('detailTitle');
      var detailBody = document.getElementById('detailBody');
      var btnBack = document.getElementById('btnBack');

      function setUrlHash(h) {
        try {
          history.replaceState(null, '', h || (location.pathname + (location.search || '')));
        } catch (e) {}
      }

      function hideAllScreens() {
        [screenHome, screenAyuda, screenCdt, screenInv, detail].forEach(function (s) {
          if (s) s.classList.remove('active');
        });
      }

      function showCdt() {
        hideAllScreens();
        if (screenCdt) {
          screenCdt.classList.add('active');
          var body = screenCdt.querySelector('.cdt-body');
          if (body) body.scrollTop = 0;
        }
        setUrlHash('#cdt');
      }

      function showHome() {
        hideAllScreens();
        if (screenHome) screenHome.classList.add('active');
        setUrlHash(location.pathname + (location.search || ''));
      }

      function showAyuda() {
        hideAllScreens();
        if (screenAyuda) screenAyuda.classList.add('active');
        setUrlHash('#ayuda');
      }

      function showInversiones() {
        hideAllScreens();
        if (screenInv) screenInv.classList.add('active');
        setUrlHash('#inversiones');
      }

      function showDetail(id) {
        if (id === 'cdt') {
          showCdt();
          return;
        }
        var c = contenido[id];
        if (!c) return;
        detailTitle.textContent = c.title;
        detailBody.innerHTML = c.html;
        hideAllScreens();
        detail.classList.add('active');
        detailBody.scrollTop = 0;
        try {
          history.replaceState(null, '', location.pathname + (location.search || '') + '#inversiones');
        } catch (e2) {}
      }

      var btnContactarGerente = document.getElementById('btnContactarGerente');
      if (btnContactarGerente) btnContactarGerente.addEventListener('click', showAyuda);
      var btnBannerContinuar = document.getElementById('btnBannerContinuar');
      if (btnBannerContinuar) btnBannerContinuar.addEventListener('click', showAyuda);
      var btnHomeCdt = document.getElementById('btnHomeCdt');
      if (btnHomeCdt) btnHomeCdt.addEventListener('click', showCdt);
      document.getElementById('btnQuickInversiones').addEventListener('click', showInversiones);
      document.getElementById('btnCdtBack').addEventListener('click', showHome);
      document.getElementById('btnCdtVideollamada').addEventListener('click', function (e) {
        e.preventDefault();
        activarAsesoramiento();
      });
      document.getElementById('btnAyudaBack').addEventListener('click', showHome);
      document.getElementById('btnAyudaClose').addEventListener('click', showHome);
      document.getElementById('btnMenuHome').addEventListener('click', showInversiones);
      document.getElementById('btnBipFab').addEventListener('click', showAyuda);
      var btnCerrarPromo = document.getElementById('btnCerrarPromo');
      if (btnCerrarPromo) {
        btnCerrarPromo.addEventListener('click', function (e) {
          e.stopPropagation();
          var p = document.getElementById('bipPromoLoan');
          if (p) p.style.display = 'none';
        });
      }
      var btnCerrarBanner = document.getElementById('btnCerrarBanner');
      if (btnCerrarBanner) {
        btnCerrarBanner.addEventListener('click', function () {
          var b = document.getElementById('homeBannerGerente');
          if (b) b.style.display = 'none';
        });
      }

      document.querySelectorAll('[data-bip-demo]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          window.alert('Opción demo BIP: en la app real se abriría ' + btn.getAttribute('data-bip-demo') + '.');
        });
      });

      var accountsScroll = document.getElementById('accountsScroll');
      if (accountsScroll) {
        document.querySelectorAll('.home-account-nav button').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var card = btn.closest('.home-account-card');
            if (!card) return;
            var cards = Array.prototype.slice.call(accountsScroll.querySelectorAll('.home-account-card'));
            var idx = cards.indexOf(card);
            var next = btn.querySelector('.bi-chevron-right') ? idx + 1 : idx - 1;
            if (next >= 0 && next < cards.length) {
              cards[next].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }
          });
        });
      }

      document.getElementById('screen-ayuda').addEventListener('click', function (e) {
        var videollamada = e.target.closest('#btnAyudaVideollamada, [data-action="asesoramiento"]');
        if (videollamada) {
          e.preventDefault();
          e.stopPropagation();
          activarAsesoramiento();
          return;
        }
        var demo = e.target.closest('[data-ayuda-demo]');
        if (demo) {
          e.preventDefault();
          window.alert('Opción demo: en la app real se abriría este canal de contacto.');
        }
      });

      document.getElementById('btnBackHub').addEventListener('click', showHome);

      document.getElementById('menuTipos').addEventListener('click', function (e) {
        var btn = e.target.closest('.bdb-menu-item');
        if (!btn) return;
        var id = btn.getAttribute('data-id');
        showDetail(id);
      });

      detailBody.addEventListener('click', function (e) {
        var as = e.target.closest('[data-action="asesoramiento"]');
        if (as) {
          e.preventDefault();
          activarAsesoramiento();
        }
      });

      btnBack.addEventListener('click', function () {
        showInversiones();
      });

      document.getElementById('btnVerDesempeno').addEventListener('click', showCdt);

      function activarAsesoramiento() {
        if (typeof window.abrirModalAtencion === 'function') {
          window.abrirModalAtencion();
        }
      }

      window.activarAsesoramiento = activarAsesoramiento;

      document.getElementById('btnRecibirAsesoramiento').addEventListener('click', activarAsesoramiento);

      /* Popup publicitario → videollamada */
      var promoPopup = document.getElementById('bipPromoPopup');
      var PROMO_DISMISS_KEY = 'bipPromoDismissed';

      function cerrarPromoPopup(remember) {
        if (!promoPopup) return;
        promoPopup.classList.remove('active');
        promoPopup.setAttribute('aria-hidden', 'true');
        if (remember) {
          try { sessionStorage.setItem(PROMO_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
        }
      }

      function abrirPromoPopup() {
        if (!promoPopup) return;
        promoPopup.classList.add('active');
        promoPopup.setAttribute('aria-hidden', 'false');
      }

      function irAVideollamadaDesdePromo() {
        cerrarPromoPopup(true);
        activarAsesoramiento();
      }

      var btnPromoVideollamada = document.getElementById('btnPromoVideollamada');
      if (btnPromoVideollamada) btnPromoVideollamada.addEventListener('click', irAVideollamadaDesdePromo);

      var btnPromoPopupClose = document.getElementById('btnPromoPopupClose');
      if (btnPromoPopupClose) btnPromoPopupClose.addEventListener('click', function () { cerrarPromoPopup(true); });

      var btnPromoPopupDismiss = document.getElementById('btnPromoPopupDismiss');
      if (btnPromoPopupDismiss) btnPromoPopupDismiss.addEventListener('click', function () { cerrarPromoPopup(true); });

      var promoBackdrop = document.getElementById('bipPromoPopupBackdrop');
      if (promoBackdrop) promoBackdrop.addEventListener('click', function () { cerrarPromoPopup(true); });

      var bipPromoLoan = document.getElementById('bipPromoLoan');
      if (bipPromoLoan) {
        bipPromoLoan.addEventListener('click', function (e) {
          if (e.target.closest('#btnCerrarPromo')) return;
          irAVideollamadaDesdePromo();
        });
        bipPromoLoan.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            irAVideollamadaDesdePromo();
          }
        });
      }

      var dismissed = false;
      try { dismissed = sessionStorage.getItem(PROMO_DISMISS_KEY) === '1'; } catch (e2) { /* ignore */ }
      if (!dismissed) {
        setTimeout(function () {
          if (screenHome && screenHome.classList.contains('active')) {
            abrirPromoPopup();
          }
        }, 1200);
      }

      function applyHash() {
        var h = (location.hash || '').replace(/^#/, '');
        if (h === 'ayuda') {
          showAyuda();
        } else if (h === 'cdt') {
          showCdt();
        } else if (h === 'inversiones') {
          showInversiones();
        } else if (!h) {
          showHome();
        }
      }
      applyHash();
      window.addEventListener('hashchange', applyHash);
    })();

    // Fila Virtual — misma API que iniciar-videollamada.html
    (function () {
      var FV_QUEUE = 16223;
      var FV_BRANCH = 10750;

      var fvPollingInterval = null;
      window.bdbCurrentVideoCallUrl = 'about:blank';

      var modalEl = document.getElementById('bdbModalAtencion');
      var modalBackdrop = document.getElementById('bdbModalAtencionBackdrop');
      var modalClose = document.getElementById('bdbModalAtencionClose');
      var fvFormEl = document.getElementById('bdbFvGuardiaForm');
      var fvFormAlert = document.getElementById('bdbFvFormAlert');
      var fvBtnEnviarTurno = document.getElementById('bdbFvBtnEnviarTurno');
      var fvTurnInfoSection = document.getElementById('bdbFvTurnInfoSection');
      var fvLoadingEl = document.getElementById('bdbFvLoading');
      var fv$ = function (id) { return document.getElementById(id); };

      async function getFvDemoPayload() {
        var alias = 'Jorge';
        return NumiaDemoUsers.fetchEnqueueBody(alias, []);
      }

      function fvSetFormAlert(type, msg) {
        fvFormAlert.className = 'bdb-fv-alert ' + type;
        fvFormAlert.textContent = msg;
      }

      function fvClearFormAlert() {
        fvFormAlert.className = 'bdb-fv-alert';
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
          fvFormEl.querySelectorAll('input').forEach(function (input) {
            input.disabled = false;
          });
        }
        fvClearFormAlert();
        if (fvTurnInfoSection) fvTurnInfoSection.classList.remove('active');
        if (fvLoadingEl) fvLoadingEl.style.display = '';
        if (fvBtnEnviarTurno) {
          fvBtnEnviarTurno.disabled = false;
          fvBtnEnviarTurno.style.display = 'none';
          fvBtnEnviarTurno.innerHTML = '<i class="bi bi-check2-circle"></i> Generar atención';
        }
        var vf = document.getElementById('bdbVideoFrame');
        if (vf) vf.src = 'about:blank';
        window.bdbCurrentVideoCallUrl = 'about:blank';
        var vm = document.getElementById('bdbVideoModal');
        if (vm) {
          vm.classList.remove('active');
          vm.setAttribute('aria-hidden', 'true');
        }
      }

      function cerrarModalAtencion() {
        if (!modalEl) return;
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        fvResetModal();
      }

      async function fvEnviarAtencion() {
        fvClearFormAlert();
        if (fvLoadingEl) fvLoadingEl.style.display = '';
        if (fvTurnInfoSection) fvTurnInfoSection.classList.remove('active');

        try {
          var payload = await getFvDemoPayload();
          var out = await FilaVirtualApi.enqueue(FV_QUEUE, FV_BRANCH, payload);

          var turnCode = out.code || '—';
          try { localStorage.setItem('turnCode', turnCode); } catch (e) { /* ignore */ }

          var turnNumber = (out.jsonDetails && (out.jsonDetails.turn || out.jsonDetails.actualTurn)) || '—';
          var avgWait = (out.jsonDetails && (out.jsonDetails.averageWaitingTime != null ? out.jsonDetails.averageWaitingTime : out.jsonDetails.serviceTime)) || 'N/A';
          var queueName = (out.jsonDetails && out.jsonDetails.queue && out.jsonDetails.queue.name) || '—';
          var wrName = (out.jsonDetails && out.jsonDetails.waitingRoom && out.jsonDetails.waitingRoom.name) || '—';
          var videoCallUrl = (out.jsonDetails && out.jsonDetails.videoCallUrl) || 'about:blank';
          window.bdbCurrentVideoCallUrl = videoCallUrl;

          var urlWithParam = videoCallUrl.indexOf('?') >= 0
            ? videoCallUrl + '&videocallUser=mobile'
            : videoCallUrl + '?videocallUser=mobile';
          var vf = document.getElementById('bdbVideoFrame');
          if (vf) vf.src = urlWithParam;

          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fvFillWaitInfo({
            code: turnCode,
            number: turnNumber,
            avgWait: isFinite(avgWait) ? Math.floor(parseFloat(avgWait)) + ' min' : 'N/A',
            queueName: queueName,
            waitingRoom: wrName
          });

          if (fvTurnInfoSection) fvTurnInfoSection.classList.add('active');
          fvStartPolling(turnCode);
        } catch (err) {
          if (fvLoadingEl) fvLoadingEl.style.display = 'none';
          fvSetFormAlert('danger', err.message);
        }
      }

      window.abrirModalAtencion = function () {
        if (!modalEl) return;
        fvResetModal();
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        fvEnviarAtencion();
      };

      if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModalAtencion);
      if (modalClose) modalClose.addEventListener('click', cerrarModalAtencion);

      function fvFillWaitInfo(info) {
        fv$('bdbFvTurnCodeDisplay').textContent = info.code;
        fv$('bdbFvTurnNumber').textContent = info.number;
        fv$('bdbFvAvgWaitingTime').textContent = info.avgWait;
        fv$('bdbFvQueueName').textContent = info.queueName;
        fv$('bdbFvWaitingRoomName').textContent = info.waitingRoom;
        fv$('bdbFvTurnStatus').textContent = 'Consultando...';
        fv$('bdbFvTurnStatus').className = 'bdb-fv-info-value bdb-fv-status-warn';
        fv$('bdbFvCurrentWaitingTime').textContent = 'N/A';
        fv$('bdbFvBtnAbrirVideo').disabled = true;
      }

      function fvStartPolling(turnCode) {
        fvStopPolling();
        var mapStatus = function (s) {
          if (s === 'ANNOUNCED') return { text: 'Lo estamos llamando', cls: 'bdb-fv-status-ok' };
          if (s === 'WAITING_TO_BE_CALLED') return { text: 'En breve lo llamaremos', cls: 'bdb-fv-status-warn' };
          if (s === 'FINALIZED') return { text: 'Atención finalizada', cls: 'bdb-fv-status-done' };
          return { text: s || 'Desconocido', cls: 'bdb-fv-status-warn' };
        };

        var tick = async function () {
          try {
            var data = await FilaVirtualApi.getTurnByCode(turnCode);
            var m = mapStatus(data.status);
            fv$('bdbFvTurnStatus').textContent = m.text;
            fv$('bdbFvTurnStatus').className = 'bdb-fv-info-value ' + m.cls;
            var avg = (data.averageWaitingTime != null ? data.averageWaitingTime : data.serviceTime);
            if (avg !== undefined && avg !== null && !isNaN(avg)) {
              fv$('bdbFvCurrentWaitingTime').textContent = Math.floor(parseFloat(avg)) + ' min';
            }
            if (data.status === 'ANNOUNCED') {
              fv$('bdbFvBtnAbrirVideo').disabled = false;
            }
          } catch (e) {
            fv$('bdbFvTurnStatus').textContent = 'Error al consultar';
            fv$('bdbFvTurnStatus').className = 'bdb-fv-info-value bdb-fv-status-err';
          }
        };

        tick();
        fvPollingInterval = setInterval(tick, 5000);
      }

      if (fvBtnEnviarTurno) {
        fvBtnEnviarTurno.addEventListener('click', fvEnviarAtencion);
      }

      var fvBtnAbrirVideo = document.getElementById('bdbFvBtnAbrirVideo');
      var bdbVideoModal = document.getElementById('bdbVideoModal');
      if (fvBtnAbrirVideo) {
        fvBtnAbrirVideo.addEventListener('click', function () {
          var videoUrl = window.bdbCurrentVideoCallUrl || 'about:blank';
          var urlWithParam = videoUrl.indexOf('?') >= 0
            ? videoUrl + '&videocallUser=mobile'
            : videoUrl + '?videocallUser=mobile';
          var vf = document.getElementById('bdbVideoFrame');
          if (vf) vf.src = urlWithParam;
          if (bdbVideoModal) {
            bdbVideoModal.classList.add('active');
            bdbVideoModal.setAttribute('aria-hidden', 'false');
          }
          document.body.style.overflow = 'hidden';
        });
      }

      var bdbBtnCloseVideo = document.getElementById('bdbBtnCloseVideo');
      if (bdbBtnCloseVideo && bdbVideoModal) {
        bdbBtnCloseVideo.addEventListener('click', function () {
          bdbVideoModal.classList.remove('active');
          bdbVideoModal.setAttribute('aria-hidden', 'true');
          if (modalEl && modalEl.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        });
        bdbVideoModal.addEventListener('click', function (e) {
          if (e.target === bdbVideoModal) {
            bdbVideoModal.classList.remove('active');
            bdbVideoModal.setAttribute('aria-hidden', 'true');
            if (modalEl && modalEl.classList.contains('active')) {
              document.body.style.overflow = 'hidden';
            } else {
              document.body.style.overflow = '';
            }
          }
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (bdbVideoModal && bdbVideoModal.classList.contains('active')) {
          bdbVideoModal.classList.remove('active');
          bdbVideoModal.setAttribute('aria-hidden', 'true');
          if (modalEl && modalEl.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        } else if (modalEl && modalEl.classList.contains('active')) {
          cerrarModalAtencion();
        }
      });
    })();

(function () { function setupPreventDefaultLinks() { document.querySelectorAll('.js-prevent-default').forEach(function (link) { link.addEventListener('click', function (event) { event.preventDefault(); }); }); } if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupPreventDefaultLinks, { once: true }); } else { setupPreventDefaultLinks(); } })();
