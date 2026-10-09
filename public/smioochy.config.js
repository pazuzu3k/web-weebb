/* montaje: url y clave de supabase vacías a propósito */
window.SMIOOCHY = {
  supabaseUrl: "",
  supabaseAnonKey: "",
};

(function visitasDueno() {
  function pintar(n) {
    var tag = document.querySelector("[data-visitas-dueno]");
    if (!tag) {
      tag = document.createElement("p");
      tag.setAttribute("data-visitas-dueno", "");
      tag.style.cssText =
        "position:fixed;right:12px;bottom:10px;z-index:80;margin:0;font:11px ui-monospace,monospace;color:#6a6560;letter-spacing:.04em;pointer-events:none";
      document.body.appendChild(tag);
    }
    tag.textContent = String(n || 0);
  }
  function quitar() {
    var tag = document.querySelector("[data-visitas-dueno]");
    if (tag) tag.remove();
  }
  function leer() {
    fetch("/api/diario/sesion", { credentials: "same-origin" })
      .then(function (s) {
        return s.ok ? s.json() : {};
      })
      .then(function (data) {
        if (!data || !data.ok) {
          quitar();
          return;
        }
        return fetch("/api/visitas?total=1", { credentials: "same-origin" }).then(function (r) {
          if (!r.ok) {
            quitar();
            return;
          }
          return r.json().then(function (j) {
            pintar(j.n);
          });
        });
      })
      .catch(quitar);
  }
  function arrancar() {
    leer();
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-home-sesion]")) {
        setTimeout(leer, 400);
      }
    });
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest("[data-home-salir]")) setTimeout(leer, 400);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
