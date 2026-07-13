function showRatesTab(tab) {
      const eBtn = document.getElementById('tabEspecial'),
            cBtn = document.getElementById('tabConsulta'),
            eTab = document.getElementById('tablaEspecial'),
            cTab = document.getElementById('tablaConsulta');
      if(tab==='especial'){
        eBtn.classList.add('active');
        cBtn.classList.remove('active');
        eTab.style.display=''; cTab.style.display='none';
      } else {
        eBtn.classList.remove('active');
        cBtn.classList.add('active');
        eTab.style.display='none'; cTab.style.display='';
      }
    }
    window.showRatesTab = showRatesTab;

    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('max-chat');
      const openBtn = document.getElementById('open-chat');
      if (btn) btn.remove();
      if (openBtn && openBtn.dataset.chatUrl) {
        openBtn.onclick = (event) => {
          event.preventDefault();
          window.open(openBtn.dataset.chatUrl, '_blank', 'noopener,noreferrer');
        };
      }
    });
