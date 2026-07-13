(function () {
      var root = document.documentElement;
      var step = 2;
      document.getElementById("font-up").addEventListener("click", function () {
        var px = parseFloat(getComputedStyle(root).fontSize) || 16;
        root.style.fontSize = Math.min(px + step, 22) + "px";
      });
      document.getElementById("font-down").addEventListener("click", function () {
        var px = parseFloat(getComputedStyle(root).fontSize) || 16;
        root.style.fontSize = Math.max(px - step, 12) + "px";
      });
    })();
