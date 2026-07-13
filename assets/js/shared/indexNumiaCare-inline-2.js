document.addEventListener('DOMContentLoaded', function() {
      // Función de pestañas (Divisas / Tasas)
      function showRatesTab(tab) {
        const tabDivisas = document.getElementById('tabDivisas');
        const tabTasas = document.getElementById('tabTasas');
        const tablaDivisas = document.getElementById('tablaDivisas');
        const tablaTasas = document.getElementById('tablaTasas');
        if (tab === 'divisas') {
          tabDivisas.classList.add('active');
          tabTasas.classList.remove('active');
          tablaDivisas.style.display = '';
          tablaTasas.style.display = 'none';
        } else {
          tabDivisas.classList.remove('active');
          tabTasas.classList.add('active');
          tablaDivisas.style.display = 'none';
          tablaTasas.style.display = '';
        }
      }
      // Exponer la función globalmente para el onclick en HTML
      window.showRatesTab = showRatesTab;

      // Control de la burbuja de chat
      const btn = document.getElementById('max-chat');
      const openBtn = document.getElementById('open-chat');
      if (btn) btn.remove();
      if (openBtn && openBtn.dataset.chatUrl) {
        openBtn.onclick = function(event) {
          event.preventDefault();
          window.open(openBtn.dataset.chatUrl, '_blank', 'noopener,noreferrer');
        };
      }
    });
