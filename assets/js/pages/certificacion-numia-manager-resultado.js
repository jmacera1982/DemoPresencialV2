
/* Almacenamiento: respuestas y email del examen */
const STORAGE_KEY = 'numiaManagerExamAnswers';
const EMAIL_KEY = 'numiaManagerExamEmail';
const NOCO_TABLE_PATH = 'tables/m08wmi55gby9ioi/records';

function isValidEmail(s) {
  s = (s || '').trim();
  if (s.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function registerResultInNocodb(email, puntuacion) {
  return DebmediaApi.nocoRequest(NOCO_TABLE_PATH, {
    method: 'POST',
    body: {
      Email: email.trim(),
      Puntuacion: puntuacion,
    },
  });
}

/* Banco completo con respuestas correctas — solo en esta página */
const questions = [
  { n:1, pts:5, type:'multi',
    text:'Impresión de ticket. Indique cuál de las siguientes afirmaciones son correctas.',
    options:['Es posible imprimir QR de seguimiento sin requerir fila virtual','Es posible imprimir tiempos exactos de espera','Es posible imprimir información obtenida desde otro sistema','Es posible indicar cuántas personas hay en espera antes del turno'],
    correct:[0,2,3] },
  { n:2, pts:5, type:'single',
    text:'Un cliente desea personalizar el puesto de atención simplificando la cantidad de botones visualizados para que no sea posible derivar turnos. ¿Cómo haría esta configuración?',
    options:['Desde perfil de puesto, deshabilitar el botón Derivar, en la opción Botones habilitados','Deshabilitar la opción Derivar trámite desde el puesto de trabajo de la sucursal, debe hacerlo sucursal por sucursal','No es posible'],
    correct:[0] },
  { n:3, pts:1, type:'single',
    text:'Un cliente requiere que se obtenga información asociada a próxima mejor oferta (NBO). Desea que esa información se visualice en el ticket, tótem y en el puesto de trabajo.',
    options:['No es posible','Sólo es posible disponibilizar la información en el ticket y totem','Es posible desarrollando un conector','Sólo es posible si el CRM es Salesforce'],
    correct:[2] },
  { n:4, pts:5, type:'multi',
    text:'Un cliente desea implementar perfiles de puestos que sólo se encuentren disponibles en una sucursal piloto. ¿Cómo implementaría esto?',
    options:['Generando el perfil de puesto y asignándolo sólo a esa sucursal','Generando un perfil de puesto sólo en esa sucursal','No es posible hacerlo'],
    correct:[0,1] },
  { n:5, pts:5, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son ciertas sobre el módulo de Cartelería digital.',
    options:['Posee un widget Carrusel de texto conformado por un grupo de palabras u oraciones pasantes que se muestran continuamente','Posee un widget de multimedia que permite combinar videos e imágenes','Es posible embeber páginas URL','Existe un widget que permite consumir APIs y disponibilizar el contenido brindándole formato HTML','Existe un widget que permite establecer una videollamada desde un tótem'],
    correct:[0,1,2,3,4] },
  { n:6, pts:7, type:'multi',
    text:'Indique qué afirmaciones sobre prioridades son correctas.',
    options:['Es posible establecer prioridades de los turnos generados por citas versus los turnos espontáneos','El ordenamiento por orden de llegada permite al ejecutivo decidir manualmente los turnos que son llamados, entre los que se encuentran en la sala de espera','Existen dos tipos de algoritmos basados en envejecimiento: Por trámite y por Cliente','No es posible establecer dos trámites con las mismas prioridades','Existe una opción llamada "Llamado automático" que permite definir un intervalo de tiempo para que el sistema efectúe de manera automática el llamado de un nuevo turno'],
    correct:[0,2,4] },
  { n:7, pts:1, type:'single',
    text:'¿Es posible establecer puestos que sólo atiendan a determinados tipos de Clientes?',
    options:['Sí, esto se configura a nivel de perfil de puesto de trabajo','Sí, esto se configura a nivel de puesto de trabajo','No es posible'],
    correct:[0] },
  { n:8, pts:1, type:'single',
    text:'¿Es posible manejar numeración por tipo de trámite?',
    options:['Sí, se pueden establecer numeraciones para citas y numeraciones para filas','Sí, es único para filas y citas','Es único por sucursal'],
    correct:[0] },
  { n:9, pts:5, type:'single',
    text:'Un cliente requiere que al momento de obtener determinadas citas, se acepten términos y condiciones.',
    options:['Esto es posible desarrollando una interfaz personalizada. En dicha interfaz deben consumirse APIs','Esto es un comportamiento nativo, pero aplica a todas las citas','Esto corresponde a un comportamiento nativo de la solución'],
    correct:[2] },
  { n:10, pts:10, type:'multi',
    text:'Indique qué requerimientos son cubiertos por la solución (con o sin integración).',
    options:['Ninguna persona que asista a la sucursal puede esperar más de 60 minutos','En el ticket de atención tiene que aparecer los datos del cliente: nombre, apellido, cédula y oferta de productos','Generar código QR para atención presencial','Atender solicitudes a través del canal Chat (WhatsApp o web)','Que exista un puesto en atención comercial que sólo pueda llamar a los turnos de clientes VIP'],
    correct:[0,1,2,3,4] },
  { n:11, pts:5, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son ciertas sobre APIs y webhooks.',
    options:['Es posible reproducir el comportamiento de un puesto de atención utilizando APIs','Existen webhooks que se ejecutan ante la ocurrencia de eventos en turnos (encolamiento, llamado, tipificación, etc.)','Existen APIs para el ABM de trámites y puestos de trabajo','Existen APIs para modificar el contenido de etiquetas de diseño','Existen APIs que permiten generar entradas en turneros'],
    correct:[0,1,4] },
  { n:12, pts:5, type:'single',
    text:'¿La solución permite integración con sistemas de accesos centralizados como Active Directory mediante el protocolo LDAP?',
    options:['Es posible tanto por perfil de acceso como por sucursal','Sí, sólo es posible hacerlo por sucursal','Sí, sólo es posible por perfil de acceso','Sólo es posible por perfil de puesto','No es posible'],
    correct:[0] },
  { n:13, pts:7, type:'multi',
    text:'Indique cuáles de las siguientes capacidades están incluidas dentro de Numia Manager.',
    options:['La plataforma permite realizar derivaciones a otras sucursales desde el puesto de trabajo','Buscar turnos ausentes dentro de un puesto','Registrar mensajes internos antes de derivar un ticket','Cancelar un llamado realizado','Seguimiento histórico de los tipificados por parte de los ejecutivos'],
    correct:[0,1,2,3,4] },
  { n:14, pts:1, type:'single',
    text:'¿La solución posee integración nativa con videollamada?',
    options:['Sí, solo Vonage','Sí, Vonage, Zoom y Teams','Sí, cualquier proveedor','No posee esta capacidad'],
    correct:[1] },
  { n:15, pts:1, type:'single',
    text:'¿Qué canales pueden ser utilizados para notificaciones?',
    options:['Sólo email','Sólo email y SMS','Email y SMS. WhatsApp a través de un tercero','Email, SMS, WhatsApp de forma nativa','Es posible integrarnos con cualquier canal, pero la solución no posee canales nativos','No posee notificaciones'],
    correct:[2] },
  { n:16, pts:5, type:'single',
    text:'Un cliente requiere poder encolar turnos a través de APIs.',
    options:['Es posible sólo si posee fila virtual','Se requiere un conector','Existen APIs dentro de Numia Manager, no se requieren módulos adicionales'],
    correct:[2] },
  { n:17, pts:5, type:'single',
    text:'Un cliente requiere atención priorizada por tipo de Cliente, priorizando a la persona por sobre lo que necesita hacer.',
    options:['Será necesario consumir esta priorización desde otro sistema ya que la solución no cuenta con esta capacidad','Debemos configurar las prioridades desde Base de Clientes - Tipo de Clientes. Es posible hacerlo a partir de cualquier dato del Cliente desde la opción Base de Clientes - Datos de priorización y luego indicar este algoritmo en el Perfil de puesto','Debemos configurar las prioridades desde Base de Clientes - Tipo de cliente y luego indicar este algoritmo de priorización en el Perfil de puesto','Debemos configurar las prioridades desde Base de Clientes - Tipo de cliente y luego indicar este algoritmo en el Puesto de cada sucursal','No es posible'],
    correct:[1] },
  { n:18, pts:2, type:'multi',
    text:'Indique qué afirmaciones son correctas sobre la configuración de trámites.',
    options:['Al momento de configurar un trámite, es posible balancear salas de espera para prevenir la saturación de una sala','Al momento de configurar un trámite es posible indicar a qué otros trámites se puede derivar y a qué sucursales','Es posible especificar SLA por trámites e indicar cuáles se computan en el nivel de servicio','Es posible establecer el texto que se visualizará en el ticket. Este texto es configurable por sucursal'],
    correct:[1,2,3] },
  { n:19, pts:5, type:'single',
    text:'Se requiere que los puestos de atención no pasen más de 45 minutos sin actividad cuando se encuentran en estado Almuerzo.',
    options:['Esta configuración se realiza desde Avanzado - configuración de compañía - Estados del puesto','Esta funcionalidad sólo es posible a través del consumo de API','Esta configuración se realiza desde Avanzado - Tareas. Se debe planificar con qué frecuencia debe ejecutarse esta tarea','Esta configuración se realiza desde Panel de compañía - Perfiles de puesto base - Tiempo máximo inactivo','No es posible'],
    correct:[0] },
  { n:20, pts:2, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones sobre videollamadas NO son ciertas.',
    options:['La utilización de videollamadas propuesta por Numia requiere descargar una aplicación','Es posible iniciar videollamadas desde un tótem','No es posible deshabilitar el chat durante videollamada','No es posible intercambiar archivos adjuntos'],
    correct:[0,2,3] },
  { n:21, pts:2, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son correctas sobre Cartelería digital.',
    options:['Es posible establecer vigencia para imágenes y activos','No es posible asociar más de un canal a una TV','La asignación de contenidos de un canal es sólo a través de una agenda de contenido','En caso de pérdida de conexión, el canal siempre fuerza el apagado de la TV'],
    correct:[0] },
  { n:22, pts:5, type:'single',
    text:'Un cliente solicita que se envíen encuestas ante la finalización y cuando el cliente no se presenta. ¿Es posible esto?',
    options:['Es posible, solamente es posible enviar encuestas ante estos dos eventos','Es posible, también es posible enviar encuestas ante una derivación','Sólo es posible enviar encuestas al finalizar una atención','Se pueden enviar encuestas ante cualquier evento de atención'],
    correct:[1] },
  { n:23, pts:5, type:'single',
    text:'Un cliente desea enviar recordatorios personalizados a través de los canales SMS, WhatsApp y email. ¿Es esto posible?',
    options:['Sí, requiere integraciones','Sí, es el comportamiento nativo','No es posible'],
    correct:[1] },
  { n:24, pts:4, type:'multi',
    text:'Numia ofrece funcionalidades de Speech Analytics. Indique qué afirmaciones son correctas.',
    options:['Está disponible sólo para atención virtual','Está disponible para virtual, presencial y Chat','Es posible hacerlo analizando videos o textos grabados por fuera de Numia','Está disponible para todos los clientes de Numia'],
    correct:[1,2] },
];

function loadAnswersFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length !== questions.length) return null;
    return data.map((arr) => {
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr);
    });
  } catch (e) {
    return null;
  }
}

function scoreExam(userSets) {
  let totalScore = 0, nCorrect = 0, nIncorrect = 0, nPartial = 0;
  const results = questions.map((q, qi) => {
    const userSet = userSets[qi];
    const correctSet = new Set(q.correct);
    const uArr = [...userSet].sort((a, b) => a - b);
    const cArr = [...correctSet].sort((a, b) => a - b);
    const isExact = uArr.length === cArr.length && uArr.every((v, i) => v === cArr[i]);
    let status, pts = 0;
    if (q.type === 'single') {
      if (isExact) { status = 'correct'; pts = q.pts; nCorrect++; }
      else { status = 'incorrect'; nIncorrect++; }
    } else {
      if (isExact) { status = 'correct'; pts = q.pts; nCorrect++; }
      else {
        const hits = [...userSet].filter((i) => correctSet.has(i)).length;
        const wrongs = [...userSet].filter((i) => !correctSet.has(i)).length;
        const net = Math.max(0, hits - wrongs);
        if (net > 0) { status = 'partial'; pts = Math.round(q.pts * net / cArr.length); nPartial++; }
        else { status = 'incorrect'; nIncorrect++; }
      }
    }
    totalScore += pts;
    return { q, status, pts, userSet, correctSet };
  });
  const maxPoints = questions.reduce((s, q) => s + q.pts, 0);
  return { totalScore, nCorrect, nIncorrect, nPartial, results, maxPoints, passed: totalScore >= Math.ceil(maxPoints / 2) };
}

function formatUserAnswerText(q, userSet) {
  if (userSet.size === 0) return '(sin respuesta)';
  return [...userSet].sort((a, b) => a - b).map((i) => `• ${q.options[i]}`).join('\n');
}

function buildUserReplyHtml(q, userSet, status) {
  const mod = status === 'partial' ? 'user-reply--partial' : 'user-reply--incorrect';
  if (userSet.size === 0) {
    return `<div class="user-reply ${mod}"><span>Tu respuesta</span><p class="user-reply-empty">(sin respuesta)</p></div>`;
  }
  const lines = [...userSet].sort((a, b) => a - b).map((i) => `<div class="user-reply-line">${q.options[i]}</div>`).join('');
  return `<div class="user-reply ${mod}"><span>Tu respuesta</span><div class="user-reply-lines">${lines}</div></div>`;
}

let lastPdfContext = { totalScore: 0, nCorrect: 0, nIncorrect: 0, nPartial: 0, maxPoints: 100, passed: false, failedOrPartial: [], email: '' };

function buildPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxW = pageW - margin * 2;
  let y = 22;
  const title = 'Certificación Numia — Manager';
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const d = new Date();
  const fecha = d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  doc.setTextColor(80, 80, 80);
  doc.text('Fecha: ' + fecha, margin, y);
  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  const { totalScore, nCorrect, nIncorrect, nPartial, passed, failedOrPartial } = lastPdfContext;
  const lines1 = [];
  if (lastPdfContext.email) {
    lines1.push('Correo: ' + lastPdfContext.email, '');
  }
  const maxP = lastPdfContext.maxPoints || 100;
  lines1.push(
    `Puntaje: ${totalScore} / ${maxP}`,
    `Estado: ${passed ? 'Aprobado' : 'No aprobado'}`,
    '',
    `Preguntas correctas: ${nCorrect}`,
    `Incorrectas: ${nIncorrect}`,
    `Parciales: ${nPartial}`,
  );
  lines1.forEach((line) => {
    const parts = doc.splitTextToSize(line, maxW);
    parts.forEach((p) => { doc.text(p, margin, y); y += 5.5; });
  });
  doc.addPage();
  y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Preguntas en las que no obtuvo el puntaje completo', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (failedOrPartial.length === 0) {
    const t = doc.splitTextToSize('Ninguna. Felicitaciones, contestó en forma completa en todas las preguntas (o no hubo incidencias a detallar en esta sección).', maxW);
    t.forEach((p) => { doc.text(p, margin, y); y += 5; });
  } else {
    const pageH = doc.internal.pageSize.getHeight();
    const bottomY = pageH - 16;
    failedOrPartial.forEach((item) => {
      const q = item.q;
      const head = `Pregunta ${q.n} — ${item.status === 'partial' ? 'Parcial' : 'Incorrecta'} (${item.pts} pts obtenidos de ${q.pts})`;
      const headLines = doc.splitTextToSize(head, maxW);
      const qLines = doc.splitTextToSize(q.text, maxW);
      const ans = formatUserAnswerText(q, item.userSet);
      const ansLines = doc.splitTextToSize(ans, maxW);
      const estH = headLines.length * 5 + 4 + qLines.length * 5 + 2 + 5 + 5 + ansLines.length * 5 + 8;
      if (y + estH > bottomY) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      headLines.forEach((p) => { doc.text(p, margin, y); y += 5; });
      y += 2;
      doc.setFont('helvetica', 'normal');
      qLines.forEach((p) => { doc.text(p, margin, y); y += 5; });
      y += 2;
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('Respuesta dada:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      ansLines.forEach((p) => { doc.text(p, margin, y); y += 5; });
      doc.setTextColor(0, 0, 0);
      y += 6;
    });
  }
  doc.save('resultado-certificacion-numia-manager.pdf');
}

function render(resultsState) {
  const { totalScore, nCorrect, nIncorrect, nPartial, results, passed, maxPoints } = resultsState;
  document.getElementById('res-score').textContent = totalScore;
  const sub = document.getElementById('res-score-sub');
  if (sub) sub.textContent = 'puntos de ' + (maxPoints != null ? maxPoints : 100);
  document.getElementById('res-correct').textContent = nCorrect;
  document.getElementById('res-incorrect').textContent = nIncorrect;
  document.getElementById('res-partial').textContent = nPartial;
  const badge = document.getElementById('res-badge');
  badge.textContent = passed ? '✓ Aprobado' : '✗ No aprobado';
  badge.className = 'results-badge ' + (passed ? 'badge-aprobado' : 'badge-reprobado');

  const failedOrPartial = results.filter((r) => r.status === 'incorrect' || r.status === 'partial');
  lastPdfContext = { totalScore, nCorrect, nIncorrect, nPartial, maxPoints, passed, failedOrPartial: failedOrPartial, email: lastPdfContext.email };

  const chipMap = { incorrect: 'chip-incorrect', partial: 'chip-partial' };
  document.getElementById('review-container').innerHTML = failedOrPartial.length === 0
    ? '<p class="review-all-ok">Ninguna pregunta requiere revisión en este resumen. ¡Buen resultado.</p>'
    : failedOrPartial.map(({ q, status, pts, userSet }) => {
      const chipText = status === 'partial' ? `~ Puntaje parcial — ${pts} pt${pts !== 1 ? 's' : ''} obtenidos` : '✗ Sin puntaje en esta pregunta';
      return `
      <div class="q-card ${status}">
        <div class="q-top">
          <div class="q-meta">
            <span class="q-num-badge">Pregunta ${q.n}</span>
            <span class="q-type-badge ${q.type==='multi'?'badge-multi':'badge-single'}">${q.type==='multi'?'Múltiple opción':'Opción única'}</span>
          </div>
          <span class="q-pts-badge">${q.pts} pt${q.pts>1?'s':''}</span>
        </div>
        <p class="q-text">${q.text}</p>
        ${buildUserReplyHtml(q, userSet, status)}
        <div class="q-result-chip ${chipMap[status]}">${chipText}</div>
      </div>`;
    }).join('');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function init() {
  const userSets = loadAnswersFromStorage();
  const email = (sessionStorage.getItem(EMAIL_KEY) || '').trim();
  if (!userSets) {
    document.getElementById('err-screen').style.display = 'block';
    return;
  }
  if (!isValidEmail(email)) {
    document.getElementById('err-screen').querySelector('p').textContent = 'Falta un email válido. Volvé al examen, ingresá tu correo al inicio y enviá de nuevo la evaluación.';
    document.getElementById('err-screen').style.display = 'block';
    return;
  }
  const state = scoreExam(userSets);
  document.getElementById('results-wrap').style.display = 'block';
  document.getElementById('res-email-line').style.display = 'block';
  document.getElementById('res-email').textContent = email;
  render(state);
  lastPdfContext.email = email;

  const apiLine = document.getElementById('res-api-line');
  registerResultInNocodb(email, state.totalScore)
    .then(function () {
      apiLine.className = 'res-api-line ok';
      apiLine.textContent = 'Resultado enviado correctamente al registro.';
    })
    .catch(function (err) {
      apiLine.className = 'res-api-line warn';
      var m = (err && err.message) ? err.message : 'Error de red, CORS o autenticación';
      if (m.length > 200) m = m.slice(0, 200) + '…';
      apiLine.textContent = 'No se pudo registrar en el servidor. ' + m;
    });

  document.getElementById('btn-retry').addEventListener('click', function () {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* */ }
    window.location.href = 'certificacion-numia-manager.html';
  });
  document.getElementById('btn-pdf').addEventListener('click', function () {
    buildPdf();
  });
}

init();
