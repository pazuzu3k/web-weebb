/* montaje: url y clave de supabase vacías a propósito */
window.SMIOOCHY = {
  supabaseUrl: "",
  supabaseAnonKey: "",
};

(function visitasDueno() {
  var espera = 60000;
  var fetchNativo = window.fetch.bind(window);

  function sesionAbierta() {
    return fetchNativo("/api/diario/sesion", { credentials: "same-origin" })
      .then(function (s) {
        return s.ok ? s.json() : {};
      })
      .then(function (data) {
        return !!(data && data.ok);
      })
      .catch(function () {
        return false;
      });
  }

  window.fetch = function (url, opts) {
    var href = typeof url === "string" ? url : url && url.url;
    var method = (opts && opts.method) || (url && url.method) || "GET";
    if (href && String(href).indexOf("/api/visitas") !== -1 && String(method).toUpperCase() === "POST") {
      return new Promise(function (resolve) {
        setTimeout(function () {
          sesionAbierta().then(function (abierta) {
            if (abierta) {
              resolve(
                new Response(JSON.stringify({ counted: false }), {
                  status: 200,
                  headers: { "content-type": "application/json" },
                }),
              );
              return;
            }
            resolve(fetchNativo(url, opts));
          });
        }, espera);
      });
    }
    return fetchNativo(url, opts);
  };

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
    return sesionAbierta().then(function (abierta) {
      if (!abierta) {
        quitar();
        return false;
      }
      var path = location.pathname || "/";
      return fetchNativo("/api/visitas?path=" + encodeURIComponent(path), {
        credentials: "same-origin",
      }).then(function (r) {
        if (!r.ok) {
          quitar();
          return false;
        }
        return r.json().then(function (j) {
          pintar(j.n);
          return true;
        });
      });
    });
  }
  function reintentar() {
    var n = 0;
    var id = setInterval(function () {
      n += 1;
      leer();
      if (n >= 6) clearInterval(id);
    }, 700);
  }
  function arrancar() {
    leer();
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.matches && e.target.matches("form")) reintentar();
    });
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest("[data-home-salir]")) setTimeout(leer, 500);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
