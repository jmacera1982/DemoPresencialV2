(function () {
  var attachment = document.querySelector('.attachment-item');
  if (!attachment) return;

  attachment.addEventListener('click', function (event) {
    event.preventDefault();
    window.alert('Descargando documento: Orden_Medica_29328708.pdf');
  });
})();
