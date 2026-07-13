(function () {
      var params = new URLSearchParams(window.location.search);

      function param(keys) {
        for (var i = 0; i < keys.length; i++) {
          var v = params.get(keys[i]);
          if (v && String(v).trim()) return String(v).trim();
        }
        return '';
      }

      function getNombreCompleto() {
        var paciente = param(['paciente', 'nombreCompleto', 'nombre_completo', 'patient']);
        if (paciente) return paciente;

        var nombre = param(['nombre', 'firstName', 'first_name', 'nombres']);
        var apellido = param(['apellido', 'lastName', 'last_name', 'apellidos']);
        if (nombre && apellido) return nombre + ' ' + apellido;
        if (nombre) return nombre;
        return 'Jorge Macera';
      }

      function formatDate(d) {
        return d.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      function formatShortDate(d) {
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }

      function addDays(date, days) {
        var d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
      }

      var ahora = new Date();
      var nombre = getNombreCompleto();
      var partes = nombre.split(/\s+/);
      var emailLocal = partes[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'paciente';

      document.getElementById('nombrePaciente').textContent = nombre;
      document.getElementById('emailDestino').textContent = param(['email']) || (emailLocal + '@correo.com');
      document.getElementById('fechaAtencion').textContent = formatDate(ahora);
      document.getElementById('horaAtencion').textContent = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      document.getElementById('fechaFirma').textContent = formatShortDate(ahora);

      var episodio = param(['episodio', 'id']) || ('CAR-' + ahora.getFullYear() + String(ahora.getMonth() + 1).padStart(2, '0') + String(Math.floor(Math.random() * 90000 + 10000)));
      document.getElementById('numEpisodio').textContent = episodio;

      var doc = param(['documento', 'dni', 'doc']);
      if (doc) document.getElementById('docPaciente').textContent = doc;

      var edad = param(['edad', 'age']);
      if (edad) document.getElementById('edadPaciente').textContent = edad + (/\d/.test(edad) && !/año/i.test(edad) ? ' años' : '');

      var cobertura = param(['cobertura', 'obraSocial', 'prepaga']);
      if (cobertura) document.getElementById('coberturaPaciente').textContent = cobertura;

      var afiliado = param(['afiliado', 'numAfiliado']);
      if (afiliado) document.getElementById('afiliadoPaciente').textContent = afiliado;

      var proxima = addDays(ahora, 7);
      document.getElementById('fechaProximaVisita').textContent =
        'Cita sugerida: ' + formatDate(proxima);

      document.title = 'Resumen Cardiología — ' + nombre;

      var btnExportPdf = document.getElementById('btnExportPdf');
      var btnPrint = document.getElementById('btnPrint');

      if (btnPrint) {
        btnPrint.addEventListener('click', function () { window.print(); });
      }

      if (btnExportPdf) {
        btnExportPdf.addEventListener('click', function () {
          if (typeof html2pdf === 'undefined') {
            window.alert('No se pudo cargar la librería de PDF. Usá Imprimir y elegí "Guardar como PDF".');
            return;
          }

          var docEl = document.getElementById('docCard');
          if (!docEl) return;

          var slug = nombre.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-áéíóúñÁÉÍÓÚÑ]/g, '');
          var filename = 'resumen-cardiologia-' + (slug || 'paciente') + '.pdf';

          btnExportPdf.disabled = true;
          var labelEl = document.getElementById('btnExportPdfLabel');
          var prevLabel = labelEl ? labelEl.textContent : 'Exportar PDF';
          if (labelEl) labelEl.textContent = 'Generando PDF…';

          html2pdf().set({
            margin: [0.35, 0.4, 0.35, 0.4],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              scrollY: 0,
              windowWidth: docEl.scrollWidth
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: '.section, .recommendation-box, .patient-banner' }
          }).from(docEl).save().then(function () {
            btnExportPdf.disabled = false;
            if (labelEl) labelEl.textContent = prevLabel;
          }).catch(function (err) {
            console.error(err);
            btnExportPdf.disabled = false;
            if (labelEl) labelEl.textContent = prevLabel;
            window.alert('Error al generar el PDF. Probá con Imprimir → Guardar como PDF.');
          });
        });
      }
    })();
