(function(){
      const modalEl = document.getElementById('modalCita');
      const modal = new bootstrap.Modal(modalEl);
      const btnPrimaryCards = document.querySelectorAll('.ad-card .btn.btn-primary');
      const alertBox = document.getElementById('citaAlert');
      const selSchedule = document.getElementById('citaSchedule');
      const selBranch   = document.getElementById('citaBranch');
      const inputFecha  = document.getElementById('citaFecha');
      const slotsWrap   = document.getElementById('citaSlots');
      const btnConfirm  = document.getElementById('citaConfirmar');

      const inFirst = document.getElementById('citaFirst');
      const inLast  = document.getElementById('citaLast');
      const inDni   = document.getElementById('citaDni');
      const inMail  = document.getElementById('citaMail');

      let schedules = [];
      let selectedSlot = null; // { startAt: 'YYYY-MM-DDTHH:mm:ss-0300', defaultDuration: n }

      // habilita el primer botón primario (“Agendar”)
      if (btnPrimaryCards && btnPrimaryCards.length) {
        const btnSolicitar = btnPrimaryCards[0];
        btnSolicitar.removeAttribute('disabled');
        btnSolicitar.addEventListener('click', async () => {
          resetForm();
          modal.show();
          await loadSchedules();
        });
      }

      const pad = n => String(n).padStart(2,'0');

      function setAlert(type, msg){ alertBox.className = `alert alert-${type}`; alertBox.textContent = msg; alertBox.classList.remove('d-none'); }
      function clearAlert(){ alertBox.className = 'alert d-none'; alertBox.textContent=''; }

      function resetForm(){
        clearAlert();
        selSchedule.innerHTML = `<option value="">Cargando...</option>`;
        selBranch.innerHTML   = `<option value="">Selecciona un servicio</option>`;
        selBranch.disabled = true;
        inputFecha.value = '';
        inputFecha.disabled = true;
        slotsWrap.innerHTML = '';
        selectedSlot = null;
        btnConfirm.disabled = true;
        inFirst.value = ''; inLast.value = ''; inDni.value = ''; inMail.value = '';
      }

      async function loadSchedules(){
        try{
          schedules = await DebmediaApi.citasRequest('reducedSchedules', { profile: 'bank' });

          selSchedule.innerHTML = `<option value="">Selecciona un servicio...</option>`;
          schedules.forEach(s => selSchedule.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`));

          const today = new Date();
          const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
          inputFecha.min = ymd(today);
          inputFecha.disabled = false;

          selSchedule.onchange = handleScheduleChange;
          selBranch.onchange = handleBranchOrDateChange;
          inputFecha.onchange = handleBranchOrDateChange;

        }catch(err){ setAlert('danger', err.message); }
      }

      function handleScheduleChange(){
        const schedId = selSchedule.value;
        selBranch.innerHTML = `<option value="">Selecciona sucursal...</option>`;
        selBranch.disabled = true;
        slotsWrap.innerHTML = '';
        btnConfirm.disabled = true;

        if(!schedId){ return; }
        const sched = schedules.find(s => String(s.id) === String(schedId));
        if(!sched || !Array.isArray(sched.branches)) { setAlert('danger','Esta agenda no tiene sucursales asociadas.'); return; }
        const seen = new Set();
        sched.branches.forEach(b=>{ if(!seen.has(b.id)){ selBranch.insertAdjacentHTML('beforeend', `<option value="${b.id}">${b.name}</option>`); seen.add(b.id); }});
        selBranch.disabled = false; clearAlert();
      }

      async function handleBranchOrDateChange(){
        clearAlert();
        slotsWrap.innerHTML = '';
        selectedSlot = null;
        btnConfirm.disabled = true;

        const schedId = selSchedule.value;
        const branchId = selBranch.value;
        const dateStr  = inputFecha.value;

        if(!schedId || !branchId || !dateStr){ return; }

        try{
          const path = `schedules/${encodeURIComponent(schedId)}/branch/${encodeURIComponent(branchId)}/availability?strDate=${encodeURIComponent(dateStr)}`;
          const data = await DebmediaApi.citasRequest(path, { profile: 'bank' });

          const slots = Array.isArray(data) ? data : (Array.isArray(data.slots) ? data.slots : []);
          if(slots.length === 0){ setAlert('info','No hay horarios disponibles para la fecha seleccionada.'); return; }

          const frag = document.createDocumentFragment();
          slots.forEach(slot=>{
            const hora = slot.zonedStartDate.substring(11,16);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-light';
            btn.textContent = hora;
            btn.addEventListener('click', ()=>{
              [...slotsWrap.querySelectorAll('.btn')].forEach(b=>b.classList.remove('active'));
              btn.classList.add('active');
              selectedSlot = { startAt: slot.zonedStartDate, defaultDuration: (slot.defaultDuration||0) };
              btnConfirm.disabled = false;
            });
            frag.appendChild(btn);
          });
          slotsWrap.appendChild(frag);

        }catch(err){ setAlert('danger', err.message); }
      }

      // Helpers para generar endAt con el MISMO offset que startAt (formato ...HH:mm:ss-0300)
      function minutesOffsetFromSuffix(suffix){ // "-0300" -> -180
        const m = suffix.match(/^([+-])(\d{2})(\d{2})$/);
        if(!m) return 0;
        const sign = m[1] === '-' ? -1 : 1;
        return sign * (parseInt(m[2],10)*60 + parseInt(m[3],10));
        }
      function buildEndAtLikeStart(startAtStr, addMinutes){
        // startAtStr: "YYYY-MM-DDTHH:mm:ss-0300"
        const offsetMatch = startAtStr.match(/([+-]\d{4}|Z)$/);
        const offsetSuffix = offsetMatch ? offsetMatch[1] : 'Z';
        const offsetMin = offsetSuffix==='Z' ? 0 : minutesOffsetFromSuffix(offsetSuffix);

        const msStart = new Date(startAtStr).getTime();
        const msEnd = msStart + (addMinutes*60000);

        // Convertimos a "hora local" de ese offset: sumamos offset al UTC para leer UTC* como local de zona
        const d = new Date(msEnd + offsetMin*60000);
        const Y = d.getUTCFullYear(), M = d.getUTCMonth()+1, D = d.getUTCDate();
        const H = d.getUTCHours(), m = d.getUTCMinutes(), S = d.getUTCSeconds();
        return `${Y}-${pad(M)}-${pad(D)}T${pad(H)}:${pad(m)}:${pad(S)}${offsetSuffix}`;
      }

      btnConfirm.addEventListener('click', async ()=>{
        clearAlert();
        if(!selectedSlot){ setAlert('danger','Selecciona un horario primero.'); return; }
        const schedId = selSchedule.value;
        const branchId = selBranch.value;
        if(!schedId || !branchId){ setAlert('danger','Faltan servicio o sucursal.'); return; }
        if(!inFirst.value || !inLast.value || !inDni.value){ setAlert('danger','Completa Nombre, Apellido y DNI.'); return; }

        // start/end con el MISMO offset y formato que la API entrega
        const startAt = selectedSlot.startAt; // usar tal cual "....-0300"
        const endAt   = buildEndAtLikeStart(startAt, selectedSlot.defaultDuration || 0);

        const body = {
          branch:   { id: Number(branchId) },
          schedule: { id: Number(schedId) },
          startAt,  // "YYYY-MM-DDTHH:mm:ss-0300"
          endAt,    // "YYYY-MM-DDTHH:mm:ss-0300"
          customer: {
            firstName: inFirst.value,
            lastName:  inLast.value,
            dni:       String(inDni.value || '').trim(),
            email:     (inMail.value || '').trim() || undefined
          },
          reason: "Solicitud de Tarjeta de Crédito"
        };

        btnConfirm.disabled = true; btnConfirm.textContent = 'Confirmando...';

        try{
          const out = await DebmediaApi.citasRequest('appointments', {
            method: 'POST',
            body,
            profile: 'bank'
          });
          setAlert('success', `¡Cita creada! ID: ${out.id || '(recibido)'}`);
          setTimeout(()=> modal.hide(), 1400);
        }catch(err){
          setAlert('danger', err.message);
        }finally{
          btnConfirm.disabled = false; btnConfirm.textContent = 'Confirmar cita';
        }
      });
    })();
