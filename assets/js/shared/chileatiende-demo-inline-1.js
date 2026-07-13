(function () {
      var btn = document.getElementById("btn-menu");
      var nav = document.getElementById("nav-principal");
      if (!btn || !nav) return;
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    })();
