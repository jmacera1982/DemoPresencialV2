const baseData = {
  ingresos: 262,
  abandono: 0.0,
  tiempoEspera: { minutes: 5, seconds: 22 },
  agentes: 7,
  incomeData: [270, 275, 280, 275, 280],
  waitingTimeData: [8.5, 5.0, 4.5, 5.5, 4.0],
  coverageData: [
    { tramite: 'Otras Transacciones', participacion: 25.1, ingresos: 64 },
    { tramite: 'Operaciones en Caja', participacion: 19.0, ingresos: 49 },
    { tramite: 'Retiros', participacion: 17.9, ingresos: 46 },
    { tramite: 'Depósitos', participacion: 13.7, ingresos: 35 },
    { tramite: 'Otras Gestiones de Servicio', participacion: 5.8, ingresos: 15 },
    { tramite: 'Gestiones de Tarjetas', participacion: 5.2, ingresos: 13 }
  ]
};

function generateDates(numDays = 7) {
  const dates = [];
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const today = new Date();

  let currentDate = new Date(today);
  const dayOfWeek = currentDate.getDay();

  if (dayOfWeek === 6) {
    currentDate.setDate(today.getDate() + 2);
  } else if (dayOfWeek === 0) {
    currentDate.setDate(today.getDate() + 1);
  }

  let daysAdded = 0;
  while (dates.length < numDays) {
    const currentDayOfWeek = currentDate.getDay();
    if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
      const day = currentDate.getDate();
      const month = monthNames[currentDate.getMonth()];
      dates.push(`${day} ${month}`);
    }

    currentDate.setDate(currentDate.getDate() + 1);
    daysAdded++;
    if (daysAdded > 20) {
      break;
    }
  }

  return dates;
}

function hideTooltip() {
  const tooltip = document.getElementById('chartjs-tooltip');
  if (tooltip) {
    tooltip.classList.remove('is-visible');
  }
}

function revealSimChange(element, variantClass, text) {
  element.textContent = text;
  element.className = `simulated-kpi-change ${variantClass}`;
}

const dates = generateDates(5);

const baseWaitingRoomData = [
  { total: 260, caja3: 50, caja2: 45, caja5: 40, caja4: 35, caja1: 30 },
  { total: 270, caja3: 55, caja2: 50, caja5: 45, caja4: 40, caja1: 35 },
  { total: 280, caja3: 60, caja2: 55, caja5: 50, caja4: 45, caja1: 40 },
  { total: 262, caja3: 49, caja2: 50, caja5: 45, caja4: 40, caja1: 35 },
  { total: 280, caja3: 60, caja2: 55, caja5: 50, caja4: 45, caja1: 40 }
];

const waitingRoomData = {};
dates.forEach((date, index) => {
  waitingRoomData[date] = baseWaitingRoomData[index] || baseWaitingRoomData[0];
});

const waitingRoomCtx = document.getElementById('waitingRoomChart').getContext('2d');
const waitingRoomChart = new Chart(waitingRoomCtx, {
  type: 'bar',
  data: {
    labels: dates,
    datasets: [
      { label: 'Caja 3', data: [50, 55, 60, 49, 60], backgroundColor: '#863DFF' },
      { label: 'Caja 2', data: [45, 50, 55, 50, 55], backgroundColor: '#060A27' },
      { label: 'Caja 5', data: [40, 45, 50, 45, 50], backgroundColor: '#0056b3' },
      { label: 'Caja 4', data: [35, 40, 45, 40, 45], backgroundColor: '#10b981' },
      { label: 'Caja 1', data: [30, 35, 40, 35, 40], backgroundColor: '#f97316' },
      { label: 'Asesor Comercial 9', data: [25, 30, 35, 30, 35], backgroundColor: '#ef4444' },
      { label: 'Asesor Comercial 7', data: [20, 25, 30, 25, 30], backgroundColor: '#059669' },
      { label: 'Asesor SAC 8', data: [15, 20, 25, 20, 25], backgroundColor: '#ec4899' },
      { label: 'Supervisor Caja', data: [10, 15, 20, 15, 20], backgroundColor: '#06b6d4' }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 10, font: { size: 11 } }
      },
      tooltip: {
        enabled: false,
        external(context) {
          const tooltipModel = context.tooltip;
          const existingTooltip = document.getElementById('chartjs-tooltip');

          if (!tooltipModel.opacity || tooltipModel.dataPoints.length === 0) {
            if (existingTooltip) {
              existingTooltip.classList.remove('is-visible');
            }
            return;
          }

          if (!existingTooltip) {
            const newTooltip = document.createElement('div');
            newTooltip.id = 'chartjs-tooltip';
            newTooltip.className = 'custom-tooltip';
            document.body.appendChild(newTooltip);
          }

          const tooltip = document.getElementById('chartjs-tooltip');
          const dataIndex = tooltipModel.dataPoints[0].dataIndex;
          const datasetIndex = tooltipModel.dataPoints[0].datasetIndex;
          const date = dates[dataIndex];
          const dataset = waitingRoomChart.data.datasets[datasetIndex];
          const value = dataset.data[dataIndex];
          const sala = dataset.label;

          const dayData = waitingRoomData[date] || { total: 262, caja3: 49 };
          const totalTurns = dayData.total;
          const participation = ((value / totalTurns) * 100).toFixed(1);

          const avgWaitMinutes = Math.floor((value / 8) + 2);
          const avgWaitSeconds = Math.floor((value % 8) * 7.5);

          const tooltipHTML = `
            <div class="tooltip-title">${date} · Autobanco Kennedy</div>
            <div class="tooltip-row">
              <span class="tooltip-label">Sala de espera</span>
              <span class="tooltip-value">${sala}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Turnos por sala</span>
              <span class="tooltip-value">${value} turnos</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Participación</span>
              <span class="tooltip-value">${participation}%</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Turnos esperados día</span>
              <span class="tooltip-value">${totalTurns} turnos</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Espera estimada</span>
              <span class="tooltip-value">${avgWaitMinutes}m ${avgWaitSeconds}s</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Abandono estimado</span>
              <span class="tooltip-value">0.0%</span>
            </div>
          `;

          tooltip.innerHTML = tooltipHTML;

          const position = context.chart.canvas.getBoundingClientRect();
          const left = position.left + tooltipModel.caretX;
          const top = position.top + tooltipModel.caretY;

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top - tooltip.offsetHeight - 10}px`;
          tooltip.classList.add('is-visible');
        }
      }
    },
    onHover: (event, activeElements) => {
      const canvas = event.native.target;
      canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, max: 500 }
    }
  }
});

const incomeCtx = document.getElementById('incomeChart').getContext('2d');
const incomeChart = new Chart(incomeCtx, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Atenciones esperadas',
      data: baseData.incomeData,
      borderColor: '#863DFF',
      backgroundColor: 'rgba(134, 61, 255, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#863DFF'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    },
    scales: {
      y: { beginAtZero: true, max: 500 }
    }
  }
});

const waitingTimeCtx = document.getElementById('waitingTimeChart').getContext('2d');
const waitingTimeChart = new Chart(waitingTimeCtx, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Caja 1 (estimado)',
      data: baseData.waitingTimeData,
      borderColor: '#863DFF',
      backgroundColor: 'rgba(134, 61, 255, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#863DFF'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    },
    scales: {
      y: { beginAtZero: true, max: 10 }
    }
  }
});

const configButton = document.getElementById('configButton');
const simulationPopup = document.getElementById('simulationPopup');
const closePopup = document.getElementById('closePopup');
const cancelButton = document.getElementById('cancelButton');
const updateButton = document.getElementById('updateButton');
const dashboardContent = document.getElementById('dashboardContent');

configButton.addEventListener('click', () => {
  simulationPopup.classList.add('open');
  dashboardContent.classList.add('popup-open');
});

function closePopupFunc() {
  simulationPopup.classList.remove('open');
  dashboardContent.classList.remove('popup-open');
}

closePopup.addEventListener('click', closePopupFunc);
cancelButton.addEventListener('click', closePopupFunc);

updateButton.addEventListener('click', () => {
  const agents = parseInt(document.getElementById('simAgents').value, 10) || 8;
  const demand = parseInt(document.getElementById('simDemand').value, 10) || 10;

  const baseIngresos = 262;
  const baseTiempo = { minutes: 5, seconds: 22 };
  const baseAgentes = 7;

  const ingresosMultiplier = 1 + (demand / 100);
  const agentEfficiency = 1 + ((agents - baseAgentes) * 0.05);
  const newIngresos = Math.round(baseIngresos * ingresosMultiplier * agentEfficiency);
  const ingresosChange = ((newIngresos - baseIngresos) / baseIngresos * 100).toFixed(1);

  const tiempoMultiplier = 1 - ((agents - baseAgentes) * 0.15) + (demand / 200);
  const newTiempoSeconds = Math.max(60, Math.round((baseTiempo.minutes * 60 + baseTiempo.seconds) * tiempoMultiplier));
  const newTiempoMinutes = Math.floor(newTiempoSeconds / 60);
  const newTiempoSecs = newTiempoSeconds % 60;
  const tiempoChange = (((newTiempoSeconds - (baseTiempo.minutes * 60 + baseTiempo.seconds)) / (baseTiempo.minutes * 60 + baseTiempo.seconds)) * 100).toFixed(1);

  const abandonoBase = 0.0;
  const abandonoChange = Math.max(0, Math.min(100, 97.3 - (agents - baseAgentes) * 5 + demand * 0.5));
  const agentesChange = ((agents - baseAgentes) / baseAgentes * 100).toFixed(1);

  const simIngresosEl = document.getElementById('simIngresos');
  const simIngresosChangeEl = document.getElementById('simIngresosChange');
  simIngresosEl.textContent = newIngresos;
  simIngresosEl.classList.remove('empty');
  revealSimChange(simIngresosChangeEl, ingresosChange >= 0 ? 'positive' : 'negative', `${ingresosChange >= 0 ? '+' : ''}${ingresosChange}%`);

  const simAbandonoEl = document.getElementById('simAbandono');
  const simAbandonoChangeEl = document.getElementById('simAbandonoChange');
  simAbandonoEl.textContent = `${abandonoBase.toFixed(1)}%`;
  simAbandonoEl.classList.remove('empty');
  revealSimChange(simAbandonoChangeEl, 'positive', `+${abandonoChange.toFixed(1)}%`);

  const simTiempoEsperaEl = document.getElementById('simTiempoEspera');
  const simTiempoEsperaChangeEl = document.getElementById('simTiempoEsperaChange');
  simTiempoEsperaEl.textContent = `${newTiempoMinutes}m ${newTiempoSecs}s`;
  simTiempoEsperaEl.classList.remove('empty');
  revealSimChange(simTiempoEsperaChangeEl, tiempoChange < 0 ? 'positive' : 'negative', `${tiempoChange}%`);

  const simAgentesEl = document.getElementById('simAgentes');
  const simAgentesChangeEl = document.getElementById('simAgentesChange');
  simAgentesEl.textContent = agents;
  simAgentesEl.classList.remove('empty');
  revealSimChange(simAgentesChangeEl, agentesChange >= 0 ? 'positive' : 'negative', `${agentesChange >= 0 ? '+' : ''}${agentesChange}%`);

  document.getElementById('kpiIngresos').textContent = newIngresos;
  document.getElementById('kpiIngresosChange').textContent = `${ingresosChange >= 0 ? '+' : ''}${ingresosChange}%`;
  document.getElementById('kpiIngresosChange').parentElement.className = `kpi-change ${ingresosChange >= 0 ? 'positive' : 'negative'}`;

  document.getElementById('kpiTiempoEspera').textContent = `${newTiempoMinutes}m ${newTiempoSecs}s`;
  document.getElementById('kpiTiempoEsperaChange').textContent = `${tiempoChange}%`;
  document.getElementById('kpiTiempoEsperaChange').parentElement.className = `kpi-change ${tiempoChange < 0 ? 'positive' : 'negative'}`;

  document.getElementById('kpiAgentes').textContent = agents;
  document.getElementById('kpiAgentesChange').textContent = `${agentesChange >= 0 ? '+' : ''}${agentesChange}%`;
  document.getElementById('kpiAgentesChange').parentElement.className = `kpi-change ${agentesChange >= 0 ? 'positive' : 'negative'}`;

  const newIncomeData = baseData.incomeData.map((val) => Math.round(val * ingresosMultiplier));
  incomeChart.data.datasets[0].data = newIncomeData;
  incomeChart.update();

  const newWaitingTimeData = baseData.waitingTimeData.map((val) => Math.max(0, val * tiempoMultiplier));
  waitingTimeChart.data.datasets[0].data = newWaitingTimeData;
  waitingTimeChart.update();

  dates.forEach((date, index) => {
    if (waitingRoomData[date]) {
      waitingRoomData[date].total = newIncomeData[index];
    }
  });

  waitingRoomChart.data.datasets.forEach((dataset) => {
    dataset.data = dataset.data.map((val) => Math.round(val * ingresosMultiplier));
  });
  waitingRoomChart.update();

  const coverageTableBody = document.getElementById('coverageTableBody');
  const rows = coverageTableBody.querySelectorAll('tr');
  baseData.coverageData.forEach((item, index) => {
    if (rows[index]) {
      const newIngresosEst = Math.round(item.ingresos * ingresosMultiplier);
      rows[index].cells[2].textContent = newIngresosEst;
    }
  });
});

document.getElementById('waitingTimeSelect').addEventListener('change', (event) => {
  const selected = event.target.value;
  waitingTimeChart.data.datasets[0].label = `${selected} (estimado)`;
  const variations = {
    'Caja 1': [0, 0, 0, 0, 0],
    'Caja 2': [0.5, -0.3, 0.2, -0.1, 0.3],
    'Caja 3': [-0.3, 0.5, -0.2, 0.3, -0.1],
    'Caja 4': [0.2, -0.1, 0.4, -0.2, 0.1],
    'Caja 5': [-0.2, 0.3, -0.1, 0.2, -0.3]
  };
  const variation = variations[selected] || variations['Caja 1'];
  const newData = baseData.waitingTimeData.map((val, index) => Math.max(0, val + variation[index]));
  waitingTimeChart.data.datasets[0].data = newData;
  waitingTimeChart.update();
});

const waitingRoomCanvas = document.getElementById('waitingRoomChart');
const chartContainer = waitingRoomCanvas.closest('.chart-container');

if (chartContainer) {
  chartContainer.addEventListener('mouseleave', hideTooltip);
}

const originalUpdate = waitingRoomChart.update.bind(waitingRoomChart);
waitingRoomChart.update = function updateWaitingRoomChart(mode) {
  originalUpdate(mode);
  setTimeout(() => {
    const activeElements = waitingRoomChart.getActiveElements();
    if (activeElements.length === 0) {
      hideTooltip();
    }
  }, 50);
};
