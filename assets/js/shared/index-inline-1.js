const FV_QUEUES = [16222, 16221]; // Alternar entre estos dos queueId
    
    const NOCO_TABLE_PATH = 'tables/mpgwc03ukvww2hg/records';

    let portalPersonas = [];

    async function loadPortalPersonas() {
      if (portalPersonas.length) {
        return portalPersonas;
      }

      const response = await FilaVirtualApi.fetchPortalPersonas();
      portalPersonas = response.personas || [];
      return portalPersonas;
    }
    
    const btnGenerar = document.getElementById('btnGenerar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnRestaurarTotem = document.getElementById('btnRestaurarTotem');
    const btnRestaurarCarteleria = document.getElementById('btnRestaurarCarteleria');
    const numTurnosInput = document.getElementById('numTurnos');
    const branch10750Check = document.getElementById('branch10750');
    const branch10790Check = document.getElementById('branch10790');
    const resultsContainer = document.getElementById('resultsContainer');
    const summaryResults = document.getElementById('summaryResults');
    const summaryContent = document.getElementById('summaryContent');
    
    let resultados = [];
    
    // Toggle del panel de resultados
    const btnToggleResults = document.getElementById('btnToggleResults');
    const resultsSidebar = document.getElementById('resultsSidebar');
    const toggleIcon = btnToggleResults.querySelector('.toggle-icon');
    
    function expandResultsPanel() {
      if (resultsSidebar.classList.contains('collapsed')) {
        resultsSidebar.classList.remove('collapsed');
        toggleIcon.classList.remove('bi-chevron-right');
        toggleIcon.classList.add('bi-chevron-left');
        btnToggleResults.title = 'Contraer panel';
      }
    }
    
    btnToggleResults.addEventListener('click', () => {
      resultsSidebar.classList.toggle('collapsed');
      if (resultsSidebar.classList.contains('collapsed')) {
        toggleIcon.classList.remove('bi-chevron-left');
        toggleIcon.classList.add('bi-chevron-right');
        btnToggleResults.title = 'Expandir panel';
      } else {
        toggleIcon.classList.remove('bi-chevron-right');
        toggleIcon.classList.add('bi-chevron-left');
        btnToggleResults.title = 'Contraer panel';
      }
    });
    
    btnGenerar.addEventListener('click', async () => {
      const numTurnos = parseInt(numTurnosInput.value);
      
      if (!numTurnos || numTurnos < 1 || numTurnos > 100) {
        alert('Por favor, ingresa un número válido entre 1 y 100');
        return;
      }
      
      // Obtener branches seleccionadas
      const selectedBranches = [];
      if (branch10750Check.checked) selectedBranches.push(10750);
      if (branch10790Check.checked) selectedBranches.push(10790);
      
      if (selectedBranches.length === 0) {
        alert('Por favor, selecciona al menos una branch');
        return;
      }
      
      expandResultsPanel();
      btnGenerar.disabled = true;
      btnGenerar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
      
      resultados = [];
      resultsContainer.innerHTML = '';
      summaryResults.classList.add('d-none');
      
      const personas = await loadPortalPersonas();
      if (!personas.length) {
        alert('No hay personas demo configuradas en el servidor');
        btnGenerar.disabled = false;
        btnGenerar.innerHTML = '<i class="bi bi-play-circle me-2"></i>Generar Turnos';
        return;
      }

      // Generar turnos
      let turnoCounter = 0;
      for (let i = 0; i < numTurnos; i++) {
        const personaMeta = personas[i % personas.length];
        const queueIndex = i % FV_QUEUES.length;
        const queueId = FV_QUEUES[queueIndex];
        const branchIndex = selectedBranches.length > 1 ? (i % selectedBranches.length) : 0;
        const branchId = selectedBranches[branchIndex];
        
        try {
          const out = await FilaVirtualApi.portalEnqueue(personaMeta.id, queueId, branchId);
          const data = out.data || {};
          
          const resultado = {
            numero: turnoCounter + 1,
            personaLabel: out.personaLabel || personaMeta.label,
            dniMasked: out.dniMasked || '••••••••',
            queueId: queueId,
            branchId: branchId,
            success: true,
            status: 200,
            data: data,
            turnCode: data.code || 'N/A',
            error: null
          };
          
          turnoCounter++;
          
          resultados.push(resultado);
          agregarResultado(resultado);
          
          // Pequeña pausa para no sobrecargar el servidor
          if (i < numTurnos - 1) { await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          const queueIndex = i % FV_QUEUES.length;
          const queueId = FV_QUEUES[queueIndex];
          const branchIndex = selectedBranches.length > 1 ? (i % selectedBranches.length) : 0;
          const branchId = selectedBranches[branchIndex];
          const resultado = {
            numero: turnoCounter + 1,
            personaLabel: personaMeta.label,
            dniMasked: '••••••••',
            queueId: queueId,
            branchId: branchId,
            success: false,
            status: 0,
            data: null,
            turnCode: 'N/A',
            error: error.message
          };
          
          turnoCounter++;
          
          resultados.push(resultado);
          agregarResultado(resultado);
        }
      }
      
      mostrarResumen();
      
      btnGenerar.disabled = false;
      btnGenerar.innerHTML = '<i class="bi bi-play-circle me-2"></i>Generar Turnos';
    });
    
    function agregarResultado(resultado) {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      
      const statusClass = resultado.success ? 'status-success' : 'status-error';
      const statusIcon = resultado.success ? 'bi-check-circle' : 'bi-x-circle';
      const statusText = resultado.success ? 'Éxito' : 'Error';
      
      // Determinar el tipo de operación
      const esRestaurarTotem = resultado.tipo === 'restaurar_totem';
      const esRestaurarCarteleria = resultado.tipo === 'restaurar_carteleria';
      const esOperacionSistema = esRestaurarTotem || esRestaurarCarteleria;
      
      let badgesHtml = '';
      if (esRestaurarTotem) {
        badgesHtml = `
          <span class="badge bg-secondary me-2">#${resultado.numero}</span>
          <span class="badge bg-primary me-2">Restaurar Totem</span>
        `;
      } else if (esRestaurarCarteleria) {
        badgesHtml = `
          <span class="badge bg-secondary me-2">#${resultado.numero}</span>
          <span class="badge bg-info me-2">Restaurar Cartelería</span>
        `;
      } else {
        badgesHtml = `
          <span class="badge bg-secondary me-2">#${resultado.numero}</span>
          <span class="badge bg-info me-2">Queue: ${resultado.queueId}</span>
          <span class="badge bg-warning text-dark me-2">Branch: ${resultado.branchId}</span>
        `;
      }
      
      let detalleHtml = '';
      if (esRestaurarTotem) {
        detalleHtml = resultado.success ? 
          `<div class="small text-success">Totem restaurado correctamente</div>` :
          `<div class="small text-danger"><strong>Error:</strong> ${resultado.error}</div>`;
      } else if (esRestaurarCarteleria) {
        detalleHtml = resultado.success ? 
          `<div class="small text-success">Cartelería restaurada correctamente</div>` :
          `<div class="small text-danger"><strong>Error:</strong> ${resultado.error}</div>`;
      } else {
        detalleHtml = `
          <div class="small text-muted mb-1">
            <strong>Persona:</strong> ${resultado.personaLabel || 'Demo'} (doc: ${resultado.dniMasked || '••••••••'})
          </div>
          ${resultado.success ? 
            `<div class="small text-success">Turno generado correctamente</div>` :
            `<div class="small text-danger"><strong>Error:</strong> ${resultado.error}</div>`
          }
        `;
      }
      
      resultItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-2">
              ${badgesHtml}
              <span class="${statusClass}">
                <i class="bi ${statusIcon} me-1"></i>${statusText}
              </span>
              ${resultado.success && !esRestaurarTotem ? `<span class="badge bg-success ms-2">Código: ${resultado.turnCode}</span>` : ''}
            </div>
            ${detalleHtml}
          </div>
          <div class="text-end">
            <span class="badge ${resultado.success ? 'bg-success' : 'bg-danger'}">HTTP ${resultado.status || 'N/A'}</span>
          </div>
        </div>
      `;
      
      resultsContainer.appendChild(resultItem);
      resultItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function mostrarResumen() {
      const exitosos = resultados.filter(r => r.success).length;
      const fallidos = resultados.filter(r => !r.success).length;
      const total = resultados.length;
      
      summaryContent.innerHTML = `
        <div class="mt-2">
          <span class="badge bg-success me-2">Exitosos: ${exitosos}</span>
          <span class="badge bg-danger me-2">Fallidos: ${fallidos}</span>
          <span class="badge bg-secondary">Total: ${total}</span>
        </div>
      `;
      
      summaryResults.classList.remove('d-none');
    }
    
    btnLimpiar.addEventListener('click', () => {
      resultados = [];
      resultsContainer.innerHTML = '<div class="result-item text-center text-muted p-4">No hay resultados aún. Presiona "Generar Turnos" para comenzar.</div>';
      summaryResults.classList.add('d-none');
    });
    
    btnRestaurarTotem.addEventListener('click', async () => {
      await restaurarTotem();
    });
    
    async function restaurarTotem() {
      expandResultsPanel();
      btnRestaurarTotem.disabled = true;
      const originalText = btnRestaurarTotem.innerHTML;
      btnRestaurarTotem.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Restaurando...';
      
      const requestBody = {
        "task": {
          "id": 3930,
          "name": "Tarea Canal 3672",
          "initHour": "00:00:00",
          "endHour": "23:59:59",
          "initDay": "2000-01-01",
          "endDay": "2030-12-31",
          "days": [
            {"id": 1, "name": "MONDAY"},
            {"id": 2, "name": "TUESDAY"},
            {"id": 3, "name": "WEDNESDAY"},
            {"id": 4, "name": "THURSDAY"},
            {"id": 5, "name": "FRIDAY"},
            {"id": 6, "name": "SATURDAY"},
            {"id": 7, "name": "SUNDAY"}
          ],
          "publicities": [
            {
              "id": 16808,
              "showName": "STD-InteractivaSimple",
              "name": "STD-InteractivaSimple"
            }
          ],
          "jsonPublicities": "[{\"id\":16808}]"
        },
        "initDay": "2000-01-01",
        "endDay": "2030-12-31",
        "initHour": "00:00:00",
        "endHour": "23:59:59"
      };
      
      try {
        await DebmediaApi.debsignRequest('stasks', {
          method: 'POST',
          body: requestBody
        });

        const resultado = {
          numero: resultados.length + 1,
          persona: { dni: 'N/A', firstName: 'Sistema', lastName: 'Totem' },
          queueId: 'N/A',
          branchId: 'N/A',
          success: true,
          status: 200,
          data: null,
          turnCode: 'N/A',
          error: null,
          tipo: 'restaurar_totem'
        };
        
        resultados.push(resultado);
        agregarResultado(resultado);
        
        mostrarResumen();
        
        alert('Totem restaurado correctamente');
      } catch (error) {
        console.error('Error al restaurar totem:', error);
        
        // Agregar resultado de error a la lista
        const resultado = {
          numero: resultados.length + 1,
          persona: { dni: 'N/A', firstName: 'Sistema', lastName: 'Totem' },
          queueId: 'N/A',
          branchId: 'N/A',
          success: false,
          status: 0,
          data: null,
          turnCode: 'N/A',
          error: error.message,
          tipo: 'restaurar_totem'
        };
        
        resultados.push(resultado);
        agregarResultado(resultado);
        
        mostrarResumen();
        
        alert(`Error al restaurar totem: ${error.message}`);
      } finally {
        btnRestaurarTotem.disabled = false;
        btnRestaurarTotem.innerHTML = originalText;
      }
    }
    
    btnRestaurarCarteleria.addEventListener('click', () => {
      const modalElement = document.getElementById('modalSeleccionarCarteleria');
      if (!modalElement) {
        console.error('Modal no encontrado');
        alert('Error: Modal no encontrado. Por favor recarga la página.');
        return;
      }
      
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    });
    
    // Event listeners para los botones de selección de cartelería usando delegación de eventos
    document.addEventListener('click', async (e) => {
      if (e.target && e.target.classList.contains('btn-seleccionar-carteleria')) {
        const btn = e.target;
        const nombre = btn.getAttribute('data-nombre');
        const taskId = parseInt(btn.getAttribute('data-task-id'));
        const taskName = btn.getAttribute('data-task-name');
        
        if (!nombre || !taskId || !taskName) {
          console.error('Datos faltantes en el botón:', { nombre, taskId, taskName });
          return;
        }
        
        const modalElement = document.getElementById('modalSeleccionarCarteleria');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        
        await restaurarCarteleria(taskId, taskName, nombre);
      }
    });
    
    async function restaurarCarteleria(taskId, taskName, nombre) {
      expandResultsPanel();
      btnRestaurarCarteleria.disabled = true;
      const originalText = btnRestaurarCarteleria.innerHTML;
      btnRestaurarCarteleria.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Restaurando...';
      
      const requestBody = {
        "task": {
          "id": taskId,
          "name": taskName,
          "initHour": "00:00:00",
          "endHour": "23:59:59",
          "initDay": "2000-01-01",
          "endDay": "2030-12-31",
          "days": [
            {"id": 1, "name": "MONDAY"},
            {"id": 2, "name": "TUESDAY"},
            {"id": 3, "name": "WEDNESDAY"},
            {"id": 4, "name": "THURSDAY"},
            {"id": 5, "name": "FRIDAY"},
            {"id": 6, "name": "SATURDAY"},
            {"id": 7, "name": "SUNDAY"}
          ],
          "publicities": [
            {
              "id": 16660,
              "showName": "Pantalla Numia(5)",
              "name": "1445673176"
            }
          ],
          "jsonPublicities": "[{\"id\":16660}]"
        },
        "initDay": "2000-01-01",
        "endDay": "2030-12-31",
        "initHour": "00:00:00",
        "endHour": "23:59:59"
      };
      
      try {
        await DebmediaApi.debsignRequest('stasks', {
          method: 'POST',
          body: requestBody
        });

        const resultado = {
          numero: resultados.length + 1,
          persona: { dni: 'N/A', firstName: 'Sistema', lastName: 'Cartelería' },
          queueId: 'N/A',
          branchId: 'N/A',
          success: true,
          status: 200,
          data: null,
          turnCode: 'N/A',
          error: null,
          tipo: 'restaurar_carteleria'
        };
        
        resultados.push(resultado);
        agregarResultado(resultado);
        
        mostrarResumen();
        
        alert('Cartelería restaurada correctamente');
      } catch (error) {
        console.error('Error al restaurar cartelería:', error);
        
        // Agregar resultado de error a la lista
        const resultado = {
          numero: resultados.length + 1,
          persona: { dni: 'N/A', firstName: 'Sistema', lastName: `Cartelería ${nombre || ''}` },
          queueId: 'N/A',
          branchId: 'N/A',
          success: false,
          status: 0,
          data: null,
          turnCode: 'N/A',
          error: error.message,
          tipo: 'restaurar_carteleria'
        };
        
        resultados.push(resultado);
        agregarResultado(resultado);
        
        mostrarResumen();
        
        alert(`Error al restaurar cartelería: ${error.message}`);
      } finally {
        btnRestaurarCarteleria.disabled = false;
        btnRestaurarCarteleria.innerHTML = originalText;
      }
    }
    
    btnCargarScores.addEventListener('click', async () => {
      await cargarScores();
    });
    
    async function cargarScores() {
      btnCargarScores.disabled = true;
      btnCargarScores.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cargando...';
      
      scoresContainer.innerHTML = '<div class="text-center text-muted p-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando datos...</div>';
      
      try {
        const data = await DebmediaApi.nocoRequest(NOCO_TABLE_PATH);
        
        if (data.list && data.list.length > 0) {
          mostrarScores(data.list);
        } else {
          scoresContainer.innerHTML = '<div class="text-center text-muted p-4">No se encontraron datos</div>';
        }
      } catch (error) {
        console.error('Error al cargar scores:', error);
        scoresContainer.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> ${error.message}
          </div>
        `;
      } finally {
        btnCargarScores.disabled = false;
        btnCargarScores.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Cargar Datos';
      }
    }
    
    function mostrarScores(lista) {
      // Ordenar por score descendente
      const listaOrdenada = [...lista].sort((a, b) => {
        const scoreA = parseInt(a.score) || 0;
        const scoreB = parseInt(b.score) || 0;
        return scoreB - scoreA;
      });
      
      let html = `
        <table class="table-score">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Score</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      listaOrdenada.forEach(item => {
        const score = parseInt(item.score) || 0;
        const esPrioritario = score > 700;
        const scoreClass = esPrioritario ? 'score-priority' : 'score-normal';
        const estadoBadge = esPrioritario 
          ? '<span class="badge score-priority">PRIORITARIO</span>' 
          : '<span class="badge bg-secondary">Normal</span>';
        
        html += `
          <tr>
            <td><strong>${item.dni || 'N/A'}</strong></td>
            <td class="${scoreClass}"><strong>${score}</strong></td>
            <td>${estadoBadge}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      scoresContainer.innerHTML = html;
    }
    
    // ——— Monitor de Sucursales ———
    const branchesMonitorContainer = document.getElementById('branchesMonitorContainer');
    const btnRefrescarBranches = document.getElementById('btnRefrescarBranches');
    
    async function cargarBranchesMonitor() {
      if (!branchesMonitorContainer) return;
      branchesMonitorContainer.innerHTML = '<div class="text-center text-muted p-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando sucursales...</div>';
      
      try {
        const data = await DebmediaApi.monitorRequest('branches?period=HOUR');
        const branches = Array.isArray(data) ? data : (data.list || data.branches || []);
        
        if (branches.length === 0) {
          branchesMonitorContainer.innerHTML = '<div class="text-center text-muted p-4">No hay sucursales</div>';
          return;
        }
        
        let html = `
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Sucursal</th>
                <th class="text-center">Total turnos</th>
                <th class="text-center">Turno actual</th>
                <th class="text-center">Nivel servicio</th>
                <th class="text-center">Espera promedio</th>
              </tr>
            </thead>
            <tbody>
        `;
        branches.forEach(b => {
          const name = b.name || b.label || `Sucursal ${b.id}`;
          const totalTurns = b.totalTurns != null ? b.totalTurns : '--';
          const totalActualTurn = b.totalActualTurn != null ? b.totalActualTurn : '--';
          const serviceLevel = b.serviceLevel != null ? b.serviceLevel : '--';
          const waitingAvg = b.waiting_average != null ? b.waiting_average : '--';
          html += `
            <tr>
              <td><strong>${name}</strong> <span class="text-muted">(ID: ${b.id})</span></td>
              <td class="text-center"><strong>${totalTurns}</strong></td>
              <td class="text-center">${totalActualTurn}</td>
              <td class="text-center">${serviceLevel}</td>
              <td class="text-center">${waitingAvg}</td>
            </tr>
          `;
        });
        html += '</tbody></table>';
        branchesMonitorContainer.innerHTML = html;
      } catch (error) {
        console.error('Error al mostrar sucursales:', error);
        branchesMonitorContainer.innerHTML = `
          <div class="alert alert-danger mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> ${error.message}
          </div>
        `;
      }
    }
    
    if (btnRefrescarBranches) {
      btnRefrescarBranches.addEventListener('click', () => cargarBranchesMonitor());
    }
    
    // Manejar el cambio de ícono en el desplegable Banca
    const bancaActivosCollapse = document.getElementById('bancaActivosCollapse');
    const bancaActivosChevron = document.getElementById('bancaActivosChevron');
    if (bancaActivosCollapse && bancaActivosChevron) {
      bancaActivosCollapse.addEventListener('show.bs.collapse', function () {
        bancaActivosChevron.classList.remove('bi-chevron-down');
        bancaActivosChevron.classList.add('bi-chevron-up');
      });
      bancaActivosCollapse.addEventListener('hide.bs.collapse', function () {
        bancaActivosChevron.classList.remove('bi-chevron-up');
        bancaActivosChevron.classList.add('bi-chevron-down');
      });
    }
    
    // Manejar el cambio de ícono en el desplegable Salud
    const saludActivosCollapse = document.getElementById('saludActivosCollapse');
    const saludActivosChevron = document.getElementById('saludActivosChevron');
    if (saludActivosCollapse && saludActivosChevron) {
      saludActivosCollapse.addEventListener('show.bs.collapse', function () {
        saludActivosChevron.classList.remove('bi-chevron-down');
        saludActivosChevron.classList.add('bi-chevron-up');
      });
      saludActivosCollapse.addEventListener('hide.bs.collapse', function () {
        saludActivosChevron.classList.remove('bi-chevron-up');
        saludActivosChevron.classList.add('bi-chevron-down');
      });
    }
    
    // Manejar el cambio de ícono en el botón de colapsar Usuarios Numia
    const usuariosNumiaCollapse = document.getElementById('usuariosNumiaCollapse');
    const usuariosNumiaBtn = document.querySelector('[data-bs-target="#usuariosNumiaCollapse"]');
    
    if (usuariosNumiaCollapse && usuariosNumiaBtn) {
      usuariosNumiaCollapse.addEventListener('show.bs.collapse', function () {
        const icon = usuariosNumiaBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-chevron-down');
          icon.classList.add('bi-chevron-up');
        }
        usuariosNumiaBtn.setAttribute('aria-expanded', 'true');
      });
      
      usuariosNumiaCollapse.addEventListener('hide.bs.collapse', function () {
        const icon = usuariosNumiaBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-chevron-up');
          icon.classList.add('bi-chevron-down');
        }
        usuariosNumiaBtn.setAttribute('aria-expanded', 'false');
      });
    }
    
    function syncPortalAuthCard() {
      var loggedOut = document.getElementById('portalAuthLoggedOut');
      var loggedIn = document.getElementById('portalAuthLoggedIn');
      var badge = document.getElementById('portalAuthBadge');
      var err = document.getElementById('portalAuthErr');
      if (!loggedOut || !loggedIn) return;
      var ok = typeof AuthPortal !== 'undefined' && AuthPortal.isAuthenticated();
      if (ok) {
        document.documentElement.classList.add('portal-authenticated');
        loggedOut.classList.add('d-none');
        loggedIn.classList.remove('d-none');
        if (badge) badge.classList.remove('d-none');
      } else {
        document.documentElement.classList.remove('portal-authenticated');
        loggedOut.classList.remove('d-none');
        loggedIn.classList.add('d-none');
        if (badge) badge.classList.add('d-none');
      }
      if (err) err.classList.add('d-none');
    }

    // Cargar scores y monitor de sucursales al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof AuthPortal === 'undefined' || !AuthPortal.isAuthenticated()) {
        if (typeof AuthPortal !== 'undefined' && typeof AuthPortal.require === 'function') {
          AuthPortal.require();
        }
        return;
      }

      syncPortalAuthCard();
      var btn = document.getElementById('portalAuthBtn');
      var pwd = document.getElementById('portalAuthPwd');
      var err = document.getElementById('portalAuthErr');
      if (btn && pwd) {
        btn.addEventListener('click', function () {
          if (typeof AuthPortal === 'undefined') return;
          var v = (pwd.value || '').trim();
          btn.disabled = true;
          AuthPortal.login(v).then(function (ok) {
            if (ok) {
              syncPortalAuthCard();
              pwd.value = '';
              if (err) err.classList.add('d-none');
            } else if (err) {
              err.classList.remove('d-none');
            }
            btn.disabled = false;
          });
        });
        pwd.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') btn.click();
        });
      }
      var lo = document.getElementById('portalAuthLogout');
      if (lo) {
        lo.addEventListener('click', function () {
          if (typeof AuthPortal !== 'undefined') AuthPortal.logout();
          document.documentElement.classList.remove('portal-authenticated');
          if (typeof AuthPortal !== 'undefined' && typeof AuthPortal.require === 'function') {
            AuthPortal.require();
          }
        });
      }

      cargarScores();
      cargarBranchesMonitor();
      // Inicializar tooltips de Bootstrap
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
      // Inicializar popover App Mobile Salud
      const linkAppSalud = document.getElementById('linkAppMobileSalud');
      if (linkAppSalud) {
        const contentEl = document.getElementById('popoverAppSaludContent');
        new bootstrap.Popover(linkAppSalud, {
          content: contentEl ? contentEl.innerHTML : '',
          html: true,
          trigger: 'hover',
          placement: 'top'
        });
      }
      // Inicializar popover Avatar Salud
      const linkAvatarSalud = document.getElementById('linkAvatarSalud');
      if (linkAvatarSalud) {
        const contentEl = document.getElementById('popoverAvatarSaludContent');
        new bootstrap.Popover(linkAvatarSalud, {
          content: contentEl ? contentEl.innerHTML : '',
          html: true,
          trigger: 'hover',
          placement: 'top'
        });
      }
    });
