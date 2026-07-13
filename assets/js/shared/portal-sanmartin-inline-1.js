document.getElementById('y').textContent = new Date().getFullYear();

    document.getElementById('btnMenu').addEventListener('click', function () {
      document.getElementById('mobileNav').classList.toggle('show');
    });

    document.getElementById('btnSearch').addEventListener('click', function () {
      new bootstrap.Modal(document.getElementById('searchModal')).show();
    });
