
    (function(){
      const alertBox = document.getElementById('citaAlert');
      const selSchedule = document.getElementById('citaSchedule');
      const selBranch   = document.getElementById('citaBranch');
      const inputFecha  = document.getElementById('citaFecha');
      const slotsWrap   = document.getElementById('citaSlots');
      const btnConfirm  = document.getElementById('citaConfirmar');

      const inFirst = document.getElementById('citaFirst');
      const inLast  = document.getElementById('citaLast');
      const inRut   = document.getElementById('citaRut');
      const inMail  = document.getElementById('citaMail');

      let schedules = [];
      let selectedSlot = null;

      // Cargar agendas al cargar la página
      window.addEventListener('DOMContentLoaded', async ()=>{
        await loadSchedules();
      });

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
        inFirst.value = ''; inLast.value = ''; inRut.value = ''; inMail.value = '';
      }

      async function loadSchedules(){
        try{
          schedules = await DebmediaApi.citasRequest('reducedSchedules', { profile: 'bank' });
          selSchedule.innerHTML = `<option value="">Selecciona un servicio...</option>`;
          schedules.forEach(s => {
            const opt = document.createElement('option');
            opt.value = String(s.id);
            opt.textContent = s.name;
            selSchedule.appendChild(opt);
          });
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
        sched.branches.forEach(b => {
          if (seen.has(b.id)) return;
          const opt = document.createElement('option');
          opt.value = String(b.id);
          opt.textContent = b.name;
          selBranch.appendChild(opt);
          seen.add(b.id);
        });
        selBranch.disabled = false; clearAlert();
      }

      async function handleBranchOrDateChange(){
        clearAlert(); slotsWrap.innerHTML = ''; selectedSlot = null; btnConfirm.disabled = true;
        const schedId = selSchedule.value; const branchId = selBranch.value; const dateStr  = inputFecha.value;
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
            btn.type = 'button'; btn.className = 'btn btn-light'; btn.textContent = hora;
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

      function minutesOffsetFromSuffix(suffix){ const m = suffix.match(/^([+-])(\d{2})(\d{2})$/); if(!m) return 0; const sign = m[1] === '-' ? -1 : 1; return sign * (parseInt(m[2],10)*60 + parseInt(m[3],10)); }
      function buildEndAtLikeStart(startAtStr, addMinutes){ const offsetMatch = startAtStr.match(/([+-]\d{4}|Z)$/); const offsetSuffix = offsetMatch ? offsetMatch[1] : 'Z'; const offsetMin = offsetSuffix==='Z' ? 0 : minutesOffsetFromSuffix(offsetSuffix); const msStart = new Date(startAtStr).getTime(); const msEnd = msStart + (addMinutes*60000); const d = new Date(msEnd + offsetMin*60000); const Y = d.getUTCFullYear(), M = d.getUTCMonth()+1, D = d.getUTCDate(); const H = d.getUTCHours(), m = d.getUTCMinutes(), S = d.getUTCSeconds(); return `${Y}-${String(M).padStart(2,'0')}-${String(D).padStart(2,'0')}T${String(H).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(S).padStart(2,'0')}${offsetSuffix}`; }

      document.getElementById('citaConfirmar').addEventListener('click', async ()=>{
        clearAlert(); if(!selectedSlot){ setAlert('danger','Selecciona un horario primero.'); return; }
        const schedId = selSchedule.value; const branchId = selBranch.value;
        if(!schedId || !branchId){ setAlert('danger','Faltan servicio o sucursal.'); return; }
        if(!inFirst.value || !inLast.value || !inRut.value){ setAlert('danger','Completa Nombre, Apellido y RUT.'); return; }
        const startAt = selectedSlot.startAt; const endAt = buildEndAtLikeStart(startAt, selectedSlot.defaultDuration || 0);
        const body = { branch:{ id:Number(branchId) }, schedule:{ id:Number(schedId) }, startAt, endAt, customer:{ firstName:inFirst.value, lastName:inLast.value, dni:String(inRut.value||'').trim(), email:(inMail.value||'').trim() || undefined }, reason:"Solicitud de Cita" };
        const btn = document.getElementById('citaConfirmar'); btn.disabled = true; const old = btn.textContent; btn.textContent = 'Confirmando...';
        try{
          const out = await DebmediaApi.citasRequest('appointments', { method: 'POST', body, profile: 'bank' });
          setAlert('success', `¡Cita creada! ID: ${out.id || '(recibido)'} `);
          resetForm();
          setTimeout(()=> clearAlert(), 5000);
        }catch(err){ setAlert('danger', err.message); }
        finally{ btn.disabled = false; btn.textContent = old; }
      });
    })();
