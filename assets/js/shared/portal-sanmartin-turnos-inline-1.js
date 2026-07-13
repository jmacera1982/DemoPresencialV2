const COMERCIAL_MENU = [
      {
        id: 'altas',
        emoji: '🟢',
        title: 'Altas / Habilitaciones',
        items: [
          'Altas régimen general Comercios',
          'Altas régimen general Industrias',
          'Habilitación Express',
          'Solicitud simplificada',
          'Re.B.A'
        ]
      },
      {
        id: 'mod',
        emoji: '🟡',
        title: 'Modificaciones',
        items: [
          'Ampliación de superficie Comercios',
          'Ampliación de superficie y/o potencia Industrias',
          'Anexo o modificación de rubro Comercio',
          'Anexo o modificación de rubro Industria'
        ]
      },
      {
        id: 'titularidad',
        emoji: '🔵',
        title: 'Cambios de Titularidad',
        items: [
          'Cambio de titularidad / transferencias Comercios',
          'Cambio de titularidad / transferencias Industrias',
          'Otros cambios de titularidad Comercio',
          'Otros cambios de titularidad Industria'
        ]
      },
      {
        id: 'bajas',
        emoji: '🔴',
        title: 'Bajas',
        items: [
          'Bajas a pedido del titular del establecimiento (Comercio)',
          'Bajas a pedido del titular del establecimiento (Industria)',
          'Denuncia de baja por el propietario del inmueble (Comercio)',
          'Denuncia de baja por el propietario del Inmueble (Industria)'
        ]
      },
      {
        id: 'traslados',
        emoji: '🟣',
        title: 'Traslados',
        items: ['Traslados']
      }
    ];

    const PLACEHOLDER = {
      cidi: 'CIDI y documentación ciudadana',
      salud: 'Salud — turnos en centros y vacunatorios',
      obras: 'Obras privadas y permisos de obra',
      ambiental: 'Ambiente — consultas y habilitaciones',
      vecino: 'Atención al vecino y reclamos'
    };

    /* API citas (misma que citas.html; agenda y sucursal fijas) */
    const CITA_SCHEDULE_ID = 11936;
    const CITA_BRANCH_ID = 20640;

    function citaAvailabilityPath(dateStr) {
      return `schedules/${CITA_SCHEDULE_ID}/branch/${CITA_BRANCH_ID}/availability?strDate=${encodeURIComponent(dateStr)}`;
    }

    let citaSelectedSlot = null;
    /** @type {{ category: string, tramite: string, emoji: string } | null} */
    let citaContext = null;

    const pad = (n) => String(n).padStart(2, '0');
    const createNode = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    };
    const citaAlertEl = () => document.getElementById('citaAlert');
    function setCitaAlert(type, msg) {
      const el = citaAlertEl();
      el.className = `alert alert-${type} mt-3`;
      el.textContent = msg;
      el.classList.remove('d-none');
    }
    function clearCitaAlert() {
      const el = citaAlertEl();
      el.className = 'alert d-none';
      el.textContent = '';
    }

    function minutesOffsetFromSuffix(suffix) {
      const m = suffix.match(/^([+-])(\d{2})(\d{2})$/);
      if (!m) return 0;
      const sign = m[1] === '-' ? -1 : 1;
      return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
    }
    function formatFechaHoraCita(isoStr) {
      try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return String(isoStr);
        const texto = d.toLocaleString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return texto.charAt(0).toUpperCase() + texto.slice(1);
      } catch {
        return String(isoStr);
      }
    }

    function buildEndAtLikeStart(startAtStr, addMinutes) {
      const offsetMatch = startAtStr.match(/([+-]\d{4}|Z)$/);
      const offsetSuffix = offsetMatch ? offsetMatch[1] : 'Z';
      const offsetMin = offsetSuffix === 'Z' ? 0 : minutesOffsetFromSuffix(offsetSuffix);
      const msStart = new Date(startAtStr).getTime();
      const msEnd = msStart + addMinutes * 60000;
      const d = new Date(msEnd + offsetMin * 60000);
      const Y = d.getUTCFullYear();
      const M = d.getUTCMonth() + 1;
      const D = d.getUTCDate();
      const H = d.getUTCHours();
      const mi = d.getUTCMinutes();
      const S = d.getUTCSeconds();
      return `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}T${String(H).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(S).padStart(2, '0')}${offsetSuffix}`;
    }

    /** Limpia fecha, horarios y datos del solicitante (no toca el mensaje de alerta). */
    function resetBookingFormFields() {
      citaSelectedSlot = null;
      const fecha = document.getElementById('citaFecha');
      const slotsWrap = document.getElementById('citaSlots');
      const btnConf = document.getElementById('citaConfirmar');
      const today = new Date();
      const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      fecha.min = ymd(today);
      fecha.value = '';
      fecha.disabled = false;
      slotsWrap.replaceChildren();
      btnConf.disabled = true;
      document.getElementById('citaFirst').value = '';
      document.getElementById('citaLast').value = '';
      document.getElementById('citaRut').value = '';
      document.getElementById('citaMail').value = '';
    }

    function resetBookingForm() {
      clearCitaAlert();
      resetBookingFormFields();
    }

    async function handleCitaDateChange() {
      clearCitaAlert();
      const slotsWrap = document.getElementById('citaSlots');
      const btnConf = document.getElementById('citaConfirmar');
      const dateStr = document.getElementById('citaFecha').value;
      slotsWrap.replaceChildren();
      citaSelectedSlot = null;
      btnConf.disabled = true;
      if (!dateStr) return;
      try {
        const data = await DebmediaApi.citasRequest(citaAvailabilityPath(dateStr), { profile: 'sanmartin' });
        const slots = Array.isArray(data) ? data : (Array.isArray(data.slots) ? data.slots : []);
        if (slots.length === 0) {
          setCitaAlert('info', 'No hay horarios disponibles para la fecha seleccionada.');
          return;
        }
        slots.forEach((slot) => {
          const hora = slot.zonedStartDate.substring(11, 16);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn btn-slot';
          btn.textContent = hora;
          btn.addEventListener('click', () => {
            slotsWrap.querySelectorAll('.btn-slot').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            citaSelectedSlot = { startAt: slot.zonedStartDate, defaultDuration: slot.defaultDuration || 0 };
            btnConf.disabled = false;
          });
          slotsWrap.appendChild(btn);
        });
      } catch (err) {
        setCitaAlert('danger', err.message);
      }
    }

    async function handleCitaConfirm() {
      clearCitaAlert();
      if (!citaSelectedSlot) {
        setCitaAlert('danger', 'Seleccioná un horario primero.');
        return;
      }
      const inFirst = document.getElementById('citaFirst');
      const inLast = document.getElementById('citaLast');
      const inRut = document.getElementById('citaRut');
      const inMail = document.getElementById('citaMail');
      if (!inFirst.value || !inLast.value || !inRut.value) {
        setCitaAlert('danger', 'Completá Nombre, Apellido y DNI.');
        return;
      }
      const startAt = citaSelectedSlot.startAt;
      const endAt = buildEndAtLikeStart(startAt, citaSelectedSlot.defaultDuration || 0);
      const reason = citaContext
        ? `${citaContext.category} — ${citaContext.tramite}`
        : 'Solicitud de Cita';
      const body = {
        branch: { id: CITA_BRANCH_ID },
        schedule: { id: CITA_SCHEDULE_ID },
        startAt,
        endAt,
        customer: {
          firstName: inFirst.value,
          lastName: inLast.value,
          dni: String(inRut.value || '').trim(),
          email: (inMail.value || '').trim() || undefined
        },
        reason
      };
      const btn = document.getElementById('citaConfirmar');
      btn.disabled = true;
      const old = btn.textContent;
      btn.textContent = 'Confirmando...';
      try {
        const out = await DebmediaApi.citasRequest('appointments', {
          method: 'POST',
          body,
          profile: 'sanmartin'
        });
        const fechaHoraLegible = formatFechaHoraCita(startAt);
        const idCita = out.id != null ? out.id : '(recibido)';
        resetBookingFormFields();
        setCitaAlert(
          'success',
          `La cita fue generada con éxito. Fecha y hora del turno: ${fechaHoraLegible}. Número de cita: ${idCita}.`
        );
        const alertEl = citaAlertEl();
        if (alertEl) alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => clearCitaAlert(), 8000);
      } catch (err) {
        setCitaAlert('danger', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = old;
      }
    }

    function openBooking(block, tramiteLabel) {
      citaContext = { category: block.title, tramite: tramiteLabel, emoji: block.emoji };
      document.getElementById('bc-cita-category').textContent = block.title;
      document.getElementById('bc-cita-tramite').textContent = tramiteLabel;
      document.getElementById('citaBookingHeading').textContent = `${block.emoji} ${tramiteLabel}`;
      document.getElementById('citaBookingSub').textContent =
        'Elegí la fecha, un horario disponible y completá tus datos. Agenda fija (demo API).';
      resetBookingForm();
      showView('view-cita-booking');
    }

    function showView(id) {
      document.querySelectorAll('.view').forEach((el) => el.classList.toggle('active', el.id === id));
      window.scrollTo(0, 0);
    }

    function renderComercialPills() {
      const wrap = document.getElementById('comercialPills');
      const fragment = document.createDocumentFragment();
      COMERCIAL_MENU.forEach((block) => {
        const button = createNode('button', 'pill-opt');
        button.type = 'button';
        button.setAttribute('data-cat', block.id);
        button.appendChild(createNode('span', 'emoji', block.emoji));
        button.appendChild(createNode('span', '', block.title));
        button.addEventListener('click', () => openCategory(block.id));
        fragment.appendChild(button);
      });
      wrap.replaceChildren(fragment);
    }

    function openCategory(catId) {
      const block = COMERCIAL_MENU.find((b) => b.id === catId);
      if (!block) return;
      document.getElementById('bc-category').textContent = block.title;
      document.getElementById('itemsTitle').textContent = `${block.emoji} ${block.title}`;
      document.getElementById('itemsPanelHead').textContent = `Trámites — ${block.title}`;
      const ul = document.getElementById('itemsList');
      const items = document.createDocumentFragment();
      block.items.forEach((label) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.appendChild(createNode('i', 'bi bi-chevron-right'));
        button.appendChild(createNode('span', '', label));
        button.addEventListener('click', () => {
          openBooking(block, label);
        });
        listItem.appendChild(button);
        items.appendChild(listItem);
      });
      ul.replaceChildren(items);
      showView('view-comercial-items');
    }

    document.querySelector('[data-goto="comercial"]').addEventListener('click', () => {
      showView('view-comercial-menu');
    });

    document.querySelectorAll('[data-goto]').forEach((btn) => {
      if (btn.getAttribute('data-goto') === 'comercial') return;
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-goto');
        document.getElementById('phTitle').textContent = PLACEHOLDER[key] || 'Área';
        showView('view-placeholder');
      });
    });

    document.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-back');
        if (t === 'areas') showView('view-areas');
        if (t === 'comercial-menu') showView('view-comercial-menu');
        if (t === 'comercial-items') {
          resetBookingForm();
          showView('view-comercial-items');
        }
      });
    });

    document.getElementById('bc-to-comercial').addEventListener('click', (e) => {
      e.preventDefault();
      showView('view-comercial-menu');
    });

    document.getElementById('citaFecha').addEventListener('change', handleCitaDateChange);
    document.getElementById('citaConfirmar').addEventListener('click', handleCitaConfirm);

    document.getElementById('bc-turnos').addEventListener('click', (e) => {
      e.preventDefault();
      showView('view-areas');
    });
    document.querySelectorAll('.js-bc-turnos').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showView('view-areas');
      });
    });

    renderComercialPills();
