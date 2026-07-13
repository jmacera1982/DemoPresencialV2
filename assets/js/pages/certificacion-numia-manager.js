const questions = [
  { n:1, pts:5, type:'multi',
    text:'Impresión de ticket. Indique cuál de las siguientes afirmaciones son correctas.',
    options:[
      'Es posible imprimir QR de seguimiento sin requerir fila virtual',
      'Es posible imprimir tiempos exactos de espera',
      'Es posible imprimir información obtenida desde otro sistema',
      'Es posible indicar cuántas personas hay en espera antes del turno',
    ] },

  { n:2, pts:5, type:'single',
    text:'Un cliente desea personalizar el puesto de atención simplificando la cantidad de botones visualizados para que no sea posible derivar turnos. ¿Cómo haría esta configuración?',
    options:[
      'Desde perfil de puesto, deshabilitar el botón Derivar, en la opción Botones habilitados',
      'Deshabilitar la opción Derivar trámite desde el puesto de trabajo de la sucursal, debe hacerlo sucursal por sucursal',
      'No es posible',
    ] },

  { n:3, pts:1, type:'single',
    text:'Un cliente requiere que se obtenga información asociada a próxima mejor oferta (NBO). Desea que esa información se visualice en el ticket, tótem y en el puesto de trabajo.',
    options:[
      'No es posible',
      'Sólo es posible disponibilizar la información en el ticket y totem',
      'Es posible desarrollando un conector',
      'Sólo es posible si el CRM es Salesforce',
    ] },

  { n:4, pts:5, type:'multi',
    text:'Un cliente desea implementar perfiles de puestos que sólo se encuentren disponibles en una sucursal piloto. ¿Cómo implementaría esto?',
    options:[
      'Generando el perfil de puesto y asignándolo sólo a esa sucursal',
      'Generando un perfil de puesto sólo en esa sucursal',
      'No es posible hacerlo',
    ] },

  { n:5, pts:5, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son ciertas sobre el módulo de Cartelería digital.',
    options:[
      'Posee un widget Carrusel de texto conformado por un grupo de palabras u oraciones pasantes que se muestran continuamente',
      'Posee un widget de multimedia que permite combinar videos e imágenes',
      'Es posible embeber páginas URL',
      'Existe un widget que permite consumir APIs y disponibilizar el contenido brindándole formato HTML',
      'Existe un widget que permite establecer una videollamada desde un tótem',
    ] },

  { n:6, pts:7, type:'multi',
    text:'Indique qué afirmaciones sobre prioridades son correctas.',
    options:[
      'Es posible establecer prioridades de los turnos generados por citas versus los turnos espontáneos',
      'El ordenamiento por orden de llegada permite al ejecutivo decidir manualmente los turnos que son llamados, entre los que se encuentran en la sala de espera',
      'Existen dos tipos de algoritmos basados en envejecimiento: Por trámite y por Cliente',
      'No es posible establecer dos trámites con las mismas prioridades',
      'Existe una opción llamada "Llamado automático" que permite definir un intervalo de tiempo para que el sistema efectúe de manera automática el llamado de un nuevo turno',
    ] },

  { n:7, pts:1, type:'single',
    text:'¿Es posible establecer puestos que sólo atiendan a determinados tipos de Clientes?',
    options:[
      'Sí, esto se configura a nivel de perfil de puesto de trabajo',
      'Sí, esto se configura a nivel de puesto de trabajo',
      'No es posible',
    ] },

  { n:8, pts:1, type:'single',
    text:'¿Es posible manejar numeración por tipo de trámite?',
    options:[
      'Sí, se pueden establecer numeraciones para citas y numeraciones para filas',
      'Sí, es único para filas y citas',
      'Es único por sucursal',
    ] },

  { n:9, pts:5, type:'single',
    text:'Un cliente requiere que al momento de obtener determinadas citas, se acepten términos y condiciones.',
    options:[
      'Esto es posible desarrollando una interfaz personalizada. En dicha interfaz deben consumirse APIs',
      'Esto es un comportamiento nativo, pero aplica a todas las citas',
      'Esto corresponde a un comportamiento nativo de la solución',
    ] },

  { n:10, pts:10, type:'multi',
    text:'Indique qué requerimientos son cubiertos por la solución (con o sin integración).',
    options:[
      'Ninguna persona que asista a la sucursal puede esperar más de 60 minutos',
      'En el ticket de atención tiene que aparecer los datos del cliente: nombre, apellido, cédula y oferta de productos',
      'Generar código QR para atención presencial',
      'Atender solicitudes a través del canal Chat (WhatsApp o web)',
      'Que exista un puesto en atención comercial que sólo pueda llamar a los turnos de clientes VIP',
    ] },

  { n:11, pts:5, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son ciertas sobre APIs y webhooks.',
    options:[
      'Es posible reproducir el comportamiento de un puesto de atención utilizando APIs',
      'Existen webhooks que se ejecutan ante la ocurrencia de eventos en turnos (encolamiento, llamado, tipificación, etc.)',
      'Existen APIs para el ABM de trámites y puestos de trabajo',
      'Existen APIs para modificar el contenido de etiquetas de diseño',
      'Existen APIs que permiten generar entradas en turneros',
    ] },

  { n:12, pts:5, type:'multi',
    text:'¿La solución permite integración con sistemas de accesos centralizados como Active Directory mediante el protocolo LDAP?',
    options:[
      'Es posible tanto por perfil de acceso como por sucursal',
      'Sí, sólo es posible hacerlo por sucursal',
      'Sí, sólo es posible por perfil de acceso',
      'Sólo es posible por perfil de puesto',
      'No es posible',
    ] },

  { n:13, pts:7, type:'multi',
    text:'Indique cuáles de las siguientes capacidades están incluidas dentro de Numia Manager.',
    options:[
      'La plataforma permite realizar derivaciones a otras sucursales desde el puesto de trabajo',
      'Buscar turnos ausentes dentro de un puesto',
      'Registrar mensajes internos antes de derivar un ticket',
      'Cancelar un llamado realizado',
      'Seguimiento histórico de los tipificados por parte de los ejecutivos',
    ] },

  { n:14, pts:1, type:'single',
    text:'¿La solución posee integración nativa con videollamada?',
    options:[
      'Sí, solo Vonage',
      'Sí, Vonage, Zoom, AWS y Teams',
      'Sí, cualquier proveedor',
      'Zoom y teams',
    ] },

  { n:15, pts:1, type:'single',
    text:'¿Qué canales pueden ser utilizados para notificaciones?',
    options:[
      'Sólo email',
      'Sólo email y SMS',
      'Email y SMS. WhatsApp a través de un tercero',
      'Email, SMS, WhatsApp de forma nativa',
      'Es posible integrarnos con cualquier canal, pero la solución no posee canales nativos',
      'No posee notificaciones',
    ] },

  { n:16, pts:5, type:'single',
    text:'Un cliente requiere poder encolar turnos a través de APIs.',
    options:[
      'Es posible sólo si posee fila virtual',
      'Se requiere un conector',
      'Existen APIs dentro de Numia Manager, no se requieren módulos adicionales',
    ] },

  { n:17, pts:5, type:'single',
    text:'Un cliente requiere atención priorizada por tipo de Cliente, priorizando a la persona por sobre lo que necesita hacer.',
    options:[
      'Será necesario consumir esta priorización desde otro sistema ya que la solución no cuenta con esta capacidad',
      'Debemos configurar las prioridades desde Base de Clientes - Tipo de Clientes. Es posible hacerlo a partir de cualquier dato del Cliente desde la opción Base de Clientes - Datos de priorización y luego indicar este algoritmo en el Perfil de puesto',
      'Debemos configurar las prioridades desde Base de Clientes - Tipo de cliente y luego indicar este algoritmo de priorización en el Perfil de puesto',
      'Debemos configurar las prioridades desde Base de Clientes - Tipo de cliente y luego indicar este algoritmo en el Puesto de cada sucursal',
      'No es posible',
    ] },

  { n:18, pts:2, type:'multi',
    text:'Indique qué afirmaciones son correctas sobre la configuración de trámites.',
    options:[
      'Al momento de configurar un trámite, es posible balancear salas de espera para prevenir la saturación de una sala',
      'Al momento de configurar un trámite es posible indicar a qué otros trámites se puede derivar y a qué sucursales',
      'Es posible especificar SLA por trámites e indicar cuáles se computan en el nivel de servicio',
      'Es posible establecer el texto que se visualizará en el ticket. Este texto es configurable por sucursal',
    ] },

  { n:19, pts:5, type:'single',
    text:'Se requiere que los puestos de atención no pasen más de 45 minutos sin actividad cuando se encuentran en estado Almuerzo.',
    options:[
      'Esta configuración se realiza desde Avanzado - configuración de compañía - Estados del puesto',
      'Esta funcionalidad sólo es posible a través del consumo de API',
      'Esta configuración se realiza desde Avanzado - Tareas. Se debe planificar con qué frecuencia debe ejecutarse esta tarea',
      'Esta configuración se realiza desde Panel de compañía - Perfiles de puesto base - Tiempo máximo inactivo',
      'No es posible',
    ] },

  { n:20, pts:2, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones sobre videollamadas NO son ciertas.',
    options:[
      'La utilización de videollamadas propuesta por Numia requiere descargar una aplicación',
      'Es posible iniciar videollamadas desde un tótem',
      'No es posible deshabilitar el chat durante videollamada',
      'No es posible intercambiar archivos adjuntos',
    ] },

  { n:21, pts:2, type:'multi',
    text:'Indique cuál de las siguientes afirmaciones son correctas sobre Cartelería digital.',
    options:[
      'Es posible establecer vigencia para imágenes y activos',
      'No es posible asociar más de un canal a una TV',
      'La asignación de contenidos de un canal es sólo a través de una agenda de contenido',
      'En caso de pérdida de conexión, el canal siempre fuerza el apagado de la TV',
    ] },

  { n:22, pts:5, type:'single',
    text:'Un cliente solicita que se envíen encuestas ante la finalización y cuando el cliente no se presenta. ¿Es posible esto?',
    options:[
      'Es posible, solamente es posible enviar encuestas ante estos dos eventos',
      'Es posible, también es posible enviar encuestas ante una derivación',
      'Sólo es posible enviar encuestas al finalizar una atención',
      'Se pueden enviar encuestas ante cualquier evento de atención',
    ] },

  { n:23, pts:5, type:'single',
    text:'Un cliente desea enviar recordatorios personalizados a través de los canales SMS, WhatsApp y email. ¿Es esto posible?',
    options:[
      'Sí, requiere integraciones',
      'Sí, es el comportamiento nativo',
      'No es posible',
    ] },

  { n:24, pts:4, type:'multi',
    text:'Numia ofrece funcionalidades de Speech Analytics. Indique qué afirmaciones son correctas.',
    options:[
      'Está disponible sólo para atención virtual',
      'Está disponible para virtual, presencial y Chat',
      'Es posible hacerlo analizando videos o textos grabados por fuera de Numia',
      'Está disponible para todos los clientes de Numia',
    ] , correct:[1,2]},
];

function syncExamMeta() {
  const n = questions.length;
  const max = questions.reduce((a, q) => a + q.pts, 0);
  const minPts = Math.ceil(max / 2);
  const qT = document.getElementById('q-total');
  if (qT) qT.textContent = n;
  const sT = document.getElementById('submit-total');
  if (sT) sT.textContent = n;
  const sm = document.getElementById('stat-maxpts');
  if (sm) sm.textContent = String(max);
  const sp = document.getElementById('stat-passmin');
  if (sp) sp.textContent = String(minPts);
  const sl = document.getElementById('stat-passmin-lbl');
  if (sl) sl.textContent = 'Mín. para aprobar (sobre ' + max + ')';
}
syncExamMeta();

const ANSWER_STORAGE_KEY = 'numiaManagerExamAnswers';
const EMAIL_STORAGE_KEY = 'numiaManagerExamEmail';

function isValidEmail(s) {
  s = (s || '').trim();
  if (s.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function showExamChrome() {
  document.getElementById('email-gate').style.display = 'none';
  document.getElementById('exam-header').style.display = 'block';
  document.getElementById('exam-screen').style.display = 'block';
}

function startWithEmail() {
  const input = document.getElementById('user-email');
  const err = document.getElementById('email-err');
  const v = (input.value || '').trim();
  err.textContent = '';
  if (!v) {
    err.textContent = 'Ingresá un email para continuar.';
    input.focus();
    return;
  }
  if (!isValidEmail(v)) {
    err.textContent = 'Escribí un email válido.';
    input.focus();
    return;
  }
  try {
    sessionStorage.setItem(EMAIL_STORAGE_KEY, v);
  } catch (e) {
    err.textContent = 'No se pudo guardar. Habilitá el almacenamiento de este sitio y probá de nuevo.';
    return;
  }
  showExamChrome();
  buildExam();
}

const userAnswers = questions.map(() => new Set());

function updateProgress(){
  const n = userAnswers.filter(s => s.size > 0).length;
  document.getElementById('answered-count').textContent = n;
  document.getElementById('submit-count').textContent = n;
  document.getElementById('progress-bar').style.width = (n / questions.length * 100) + '%';
}

function toggle(qi, oi, isSingle){
  const s = userAnswers[qi];
  if(isSingle){ s.clear(); s.add(oi); }
  else { if(s.has(oi)) s.delete(oi); else s.add(oi); }
  const card = document.querySelector(`.q-card[data-q="${qi}"]`);
  card.querySelectorAll('.option-label').forEach((lbl, i) => {
    lbl.classList.toggle('selected', s.has(i));
  });
  card.classList.toggle('answered', s.size > 0);
  updateProgress();
}

function buildExam(){
  document.getElementById('q-container').innerHTML = questions.map((q, qi) => `
    <div class="q-card" data-q="${qi}">
      <div class="q-top">
        <div class="q-meta">
          <span class="q-num-badge">Pregunta ${q.n}</span>
          <span class="q-type-badge ${q.type==='multi'?'badge-multi':'badge-single'}">${q.type==='multi'?'Múltiple opción':'Opción única'}</span>
        </div>
        <span class="q-pts-badge">${q.pts} pt${q.pts>1?'s':''}</span>
      </div>
      <p class="q-text">${q.text}</p>
      <div class="options-list">
        ${q.options.map((opt, oi) => `
          <label class="option-label" data-qi="${qi}" data-oi="${oi}" data-single="${q.type==='single'}">
            <div class="custom-input ${q.type==='single'?'custom-radio':'custom-checkbox'}"></div>
            <span class="option-text">${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
  updateProgress();
}

function submitExam(){
  if (!isValidEmail(sessionStorage.getItem(EMAIL_STORAGE_KEY) || '')) {
    alert('No hay un email registrado. Volvé al inicio, ingresá tu correo e iniciá el examen otra vez.');
    document.getElementById('email-gate').style.display = 'flex';
    document.getElementById('exam-header').style.display = 'none';
    document.getElementById('exam-screen').style.display = 'none';
    return;
  }
  const unanswered = userAnswers.filter(s => s.size === 0).length;
  if(unanswered > 0 && !confirm(`Tenés ${unanswered} pregunta${unanswered>1?'s':''} sin responder. ¿Querés enviar de todas formas?`)) return;

  const payload = userAnswers.map(s => [...s].sort((a, b) => a - b));
  try {
    sessionStorage.setItem(ANSWER_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    alert('No se pudo guardar el intento. Revisá que el almacenamiento del navegador esté habilitado.');
    return;
  }
  window.location.href = 'certificacion-numia-manager-resultado.html';
}

(function initPage(){
  const em = (sessionStorage.getItem(EMAIL_STORAGE_KEY) || '').trim();
  if (isValidEmail(em)) {
    const inp = document.getElementById('user-email');
    if (inp) inp.value = em;
    showExamChrome();
    buildExam();
  } else {
    const inp = document.getElementById('user-email');
    if (inp) {
      inp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); startWithEmail(); }
      });
    }
  }
})();

function setupCertificacionManagerBindings() {
  var startButton = document.getElementById('btn-start-exam');
  var submitButton = document.getElementById('btn-submit-exam');
  if (startButton) { startButton.addEventListener('click', startWithEmail); }
  if (submitButton) { submitButton.addEventListener('click', submitExam); }
  document.addEventListener('click', function (event) { var option = event.target.closest('.option-label[data-qi]'); if (!option) return; toggle(Number(option.getAttribute('data-qi')), Number(option.getAttribute('data-oi')), option.getAttribute('data-single') === 'true'); });
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupCertificacionManagerBindings, { once: true }); } else { setupCertificacionManagerBindings(); }
