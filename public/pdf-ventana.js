function armarPdf(popup) {
  if (!popup || popup.querySelector(".pdf-ventana") || popup.dataset.ventana) return;
  popup.dataset.ventana = "1";
  const frame = popup.querySelector("iframe");
  const cerrar = popup.querySelector("[data-pdf-cerrar]");
  const barra = document.createElement("div");
  barra.className = "pdf-barra";
  if (cerrar) barra.appendChild(cerrar);
  popup.insertBefore(barra, frame || popup.firstChild);
  const asa = document.createElement("span");
  asa.className = "pdf-asa";
  popup.appendChild(asa);

  barra.addEventListener("pointerdown", (e) => {
    if (e.target.closest("[data-pdf-cerrar]")) return;
    e.preventDefault();
    const rect = popup.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;
    barra.setPointerCapture(e.pointerId);
    const mover = (ev) => {
      popup.style.left = Math.max(0, ev.clientX - ox) + "px";
      popup.style.top = Math.max(0, ev.clientY - oy) + "px";
    };
    const soltar = () => {
      barra.removeEventListener("pointermove", mover);
      barra.removeEventListener("pointerup", soltar);
    };
    barra.addEventListener("pointermove", mover);
    barra.addEventListener("pointerup", soltar);
  });

  asa.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = popup.getBoundingClientRect();
    const ox = e.clientX - rect.width;
    const oy = e.clientY - rect.height;
    asa.setPointerCapture(e.pointerId);
    const mover = (ev) => {
      const w = Math.min(window.innerWidth - rect.left, Math.max(280, ev.clientX - ox));
      const h = Math.min(window.innerHeight - rect.top, Math.max(220, ev.clientY - oy));
      popup.style.width = w + "px";
      popup.style.height = h + "px";
    };
    const soltar = () => {
      asa.removeEventListener("pointermove", mover);
      asa.removeEventListener("pointerup", soltar);
    };
    asa.addEventListener("pointermove", mover);
    asa.addEventListener("pointerup", soltar);
  });
}

function buscar() {
  document.querySelectorAll(".pdf-popup").forEach(armarPdf);
}

const ojo = new MutationObserver(buscar);
ojo.observe(document.documentElement, { childList: true, subtree: true });
buscar();
