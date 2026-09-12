// @ts-nocheck
import { startPresence } from "./presence.js";

const HUELLAS = "smioochy-huellas";
const ENIGMA = "smioochy-enigma";
const ADMIN = "smioochy-admin";
const PASO = "smioochy-paso-luis";

const TEATRO = [
  "algo mío sigue vibrando en tu buffer…",
  "me inhibes…",
  "bug emocional",
  "archivado como correspondencia perdida…",
  "¿Puede la contingencia abrir una bifurcación?",
];

function bundled() {
  try {
    return Boolean(import.meta.env);
  } catch {
    return false;
  }
}

function huellas() {
  try {
    const h = JSON.parse(localStorage.getItem(HUELLAS) || "{}");
    if (!Array.isArray(h.cotas)) h.cotas = [];
    return h;
  } catch {
    return { cotas: [] };
  }
}

function saveHuellas(h) {
  try {
    localStorage.setItem(HUELLAS, JSON.stringify(h));
  } catch {
    /* */
  }
}

function tocarCota(n) {
  const num = Number(n);
  if (!num || num < 1 || num > 54) return;
  const h = huellas();
  if (!h.cotas.includes(num)) {
    h.cotas.push(num);
    saveHuellas(h);
  }
}

function tocarPagina(k) {
  const h = huellas();
  h[k] = 1;
  saveHuellas(h);
}

function onActivate(node, fn) {
  if (!node) return;
  const go = (e) => {
    if (e.type === "click") e.preventDefault();
    fn(e);
  };
  node.addEventListener("click", go);
  node.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn(e);
    }
  });
  if (
    node.tabIndex < 0 &&
    node.tagName !== "A" &&
    node.tagName !== "BUTTON" &&
    node.getAttribute("tabindex") !== "-1"
  ) {
    node.tabIndex = 0;
  }
}

function onDouble(node, fn) {
  if (!node) return;
  let lastEnter = 0;
  let press = 0;
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    fn(e);
  });
  node.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const t = Date.now();
      if (t - lastEnter < 420) {
        e.preventDefault();
        fn(e);
        lastEnter = 0;
      } else lastEnter = t;
    }
  });
  const start = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    press = window.setTimeout(() => fn({ type: "hold" }), 560);
  };
  const cancel = () => clearTimeout(press);
  node.addEventListener("pointerdown", start);
  node.addEventListener("pointerup", cancel);
  node.addEventListener("pointerleave", cancel);
  node.addEventListener("pointercancel", cancel);
}

function dragVentanas(root) {
  root.querySelectorAll(".ventana .barra").forEach((bar) => {
    const win = bar.closest(".ventana");
    if (!win) return;
    let ox = 0;
    let oy = 0;
    bar.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      bar.setPointerCapture(e.pointerId);
      const r = win.getBoundingClientRect();
      const parent = document.documentElement;
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      win.style.left = r.left + window.scrollX + "px";
      win.style.top = r.top + window.scrollY + "px";
      win.style.right = "auto";
      win.style.bottom = "auto";
      win.style.zIndex = "12";
      void parent;
    });
    bar.addEventListener("pointermove", (e) => {
      if (!bar.hasPointerCapture?.(e.pointerId)) return;
      win.style.left = e.clientX - ox + window.scrollX + "px";
      win.style.top = e.clientY - oy + window.scrollY + "px";
    });
  });
}

function ir(href) {
  if (!href) return;
  location.href = href;
}

function ping(path) {
  fetch("/api/visitas", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: path || location.pathname || "/" }),
  }).catch(() => {});
}

let cotasCache = null;
async function loadCotas() {
  if (cotasCache) return cotasCache;
  try {
    const r = await fetch("/cotas.json");
    cotasCache = await r.json();
  } catch {
    cotasCache = {};
  }
  return cotasCache;
}

function filtros() {
  return `<svg class="filtros" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
    <filter id="licuado" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </svg>`;
}

function chromePalabra() {
  return `<div class="palabra"><a href="/">smioochy</a></div>
    <div class="estado">en proceso</div>`;
}

function ventana(opts) {
  const {
    title,
    body,
    x,
    y,
    cls = "",
    umbral = "",
    extra = "",
  } = opts;
  const data = umbral ? ` data-umbral="${umbral}"` : "";
  let pos = "";
  if (x === "auto") pos += "left:auto;right:10px;";
  else if (x !== undefined && x !== null && x !== "")
    pos += `left:${typeof x === "number" ? x + "px" : x};`;
  if (y !== undefined && y !== null && y !== "")
    pos += `top:${typeof y === "number" ? y + "px" : y};`;
  return `<div class="ventana ${cls}" style="${pos}"${data} ${extra}>
    <div class="barra">${title}</div>
    <div class="cuerpo">${body}</div>
  </div>`;
}

function renderSuperficie(el) {
  el.innerHTML = `
    ${filtros()}
    <div class="campo" data-pagina-superficie>
      <div class="mapa-wrap" data-mapa></div>
      ${chromePalabra()}
    </div>`;
}

function layoutCotas() {
  const W = 1400;
  const H = 720;
  const pad = 52;
  const hubs = {
    1: [250, 430],
    3: [490, 268],
    7: [640, 338],
    8: [724, 214],
    12: [860, 372],
    16: [990, 278],
    21: [404, 492],
    24: [1096, 428],
    31: [572, 156],
    40: [292, 568],
    41: [418, 628],
    48: [168, 196],
    54: [1248, 108],
  };
  const pts = [];
  for (let i = 1; i <= 54; i++) {
    if (hubs[i]) pts.push({ n: i, x: hubs[i][0], y: hubs[i][1], hub: true });
    else pts.push({ n: i, x: 0, y: 0, hub: false });
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  let k = 0;
  for (const p of pts) {
    if (p.hub) continue;
    const r = 0.18 + 0.74 * Math.sqrt((k + 0.35) / 41);
    const th = k * golden + 0.55;
    p.x = W / 2 + (W / 2 - pad) * r * Math.cos(th);
    p.y = H / 2 + (H / 2 - pad) * r * Math.sin(th);
    k += 1;
  }
  for (let it = 0; it < 56; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = 54;
        if (d < min) {
          const f = (min - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          if (!pts[i].hub) {
            pts[i].x -= ux * f;
            pts[i].y -= uy * f;
          }
          if (!pts[j].hub) {
            pts[j].x += ux * f;
            pts[j].y += uy * f;
          }
        }
      }
      pts[i].x = Math.min(W - pad, Math.max(pad, pts[i].x));
      pts[i].y = Math.min(H - pad, Math.max(pad, pts[i].y));
    }
  }
  return pts;
}

function hiloPath(a, b, i) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const s = i % 2 ? 1 : -1;
  const a1 = 34 * s + (i % 5) * 9;
  const a2 = -26 * s + (i % 3) * 11;
  const c1x = a.x + dx * 0.32 + nx * a1;
  const c1y = a.y + dy * 0.32 + ny * a1;
  const c2x = a.x + dx * 0.68 + nx * a2;
  const c2y = a.y + dy * 0.68 + ny * a2;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function construirRed(cotas, h) {
  const pts = layoutCotas();
  const byN = {};
  pts.forEach((p) => {
    byN[p.n] = p;
  });
  const edges = new Set();
  const add = (a, b) => {
    if (a === b) return;
    const i = Math.min(a, b);
    const j = Math.max(a, b);
    edges.add(i + "-" + j);
  };
  [
    [3, 7],
    [7, 8],
    [3, 8],
    [7, 31],
    [3, 31],
    [7, 12],
    [12, 16],
    [16, 24],
    [16, 21],
    [21, 7],
    [1, 3],
    [1, 21],
    [40, 41],
    [40, 1],
    [48, 31],
    [48, 3],
    [54, 24],
    [54, 16],
    [12, 24],
    [8, 16],
    [21, 40],
    [1, 48],
  ].forEach(([a, b]) => add(a, b));
  pts.forEach((p) => {
    const near = pts
      .filter((q) => q.n !== p.n)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
      .slice(0, 2);
    near.forEach((q) => add(p.n, q.n));
  });
  for (let i = 0; i < 10; i++) {
    add(pts[i].n, pts[(i * 11 + 17) % 54].n);
  }
  const paths = [...edges].map((key, i) => {
    const [a, b] = key.split("-").map(Number);
    const cls = i % 4 === 0 ? "hilo largo" : "hilo";
    return `<path class="${cls}" d="${hiloPath(byN[a], byN[b], i)}" />`;
  });
  const nodos = pts
    .map((p) => {
      const meta = cotas[p.n] || {};
      const ocupada = meta.abreEstado === "encendido" && meta.abre;
      const vis = h.cotas.includes(p.n) ? " visitada" : "";
      const estado = ocupada ? "ocupada" : "vacio";
      return `<a class="num${vis}" data-cota="${p.n}" data-estado="${estado}" href="/cota/${p.n}/">
        <circle class="hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="26"/>
        <circle class="punto" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${ocupada ? 3 : 2}"/>
        <text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dy="-9">${p.n}</text>
      </a>`;
    })
    .join("");
  return `<svg class="red" viewBox="0 0 1400 720" role="img" aria-label="">
    <g class="hilos">${paths.join("")}</g>
    <g class="nodos">${nodos}</g>
  </svg>`;
}

async function bindMapa(root) {
  const wrap = root.querySelector("[data-mapa]");
  if (!wrap) return;
  const cotas = await loadCotas();
  const h = huellas();
  wrap.innerHTML = construirRed(cotas, h);
  wrap.querySelectorAll("a[data-cota]").forEach((a) => {
    const n = a.getAttribute("data-cota");
    a.addEventListener("click", () => tocarCota(n));
  });
  if (wrap.scrollWidth > wrap.clientWidth) {
    wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
  }
}

function ventanaDeNivel(n, h) {
  const k = String(n);
  if (k === "7") {
    const t = h.minuta ? "01.bak" : "recortes.jpg";
    return ventana({
      title: t,
      body: `<p>${t}</p>`,
      cls: "v-cota",
      umbral: "abre",
    });
  }
  if (k === "12") {
    const t = h.antipodas ? "sin piel" : "figura";
    return ventana({
      title: t,
      body: `<p>${t}</p>`,
      cls: "v-cota",
      umbral: "abre",
    });
  }
  if (k === "16") {
    const t = h.teatro ? "mail.bak" : "you have mail";
    return ventana({
      title: t,
      body: `<p>${t}</p>`,
      cls: "v-cota",
      umbral: "abre",
    });
  }
  if (k === "24") {
    return ventana({
      title: "miochi.html",
      body: `<p>miochi.html</p>`,
      cls: `v-cota ${h.miochis ? "pasada" : "opaca"}`,
      umbral: "abre",
    });
  }
  return "";
}

function renderCota(el, n, meta) {
  const estado = meta.estado || "vacio";
  const abre = meta.abre || "";
  const abreEstado = meta.abreEstado || "apagado";
  const dis =
    abreEstado === "apagado" ? `tabindex="-1" aria-disabled="true"` : `tabindex="0"`;
  el.setAttribute("data-pagina", "cota");
  el.setAttribute("data-cota", n);
  el.setAttribute("data-strato", estado === "ocupada" ? "intervencion" : "vacio");
  el.setAttribute("data-estado", estado);
  el.setAttribute("data-abre", abre);
  el.setAttribute("data-abre-estado", abreEstado);
  const win = ventanaDeNivel(n, huellas());
  const winEsUmbral = /data-umbral=/.test(win);
  const umbralBtn = winEsUmbral
    ? ""
    : `<button type="button" class="umbral-abre" data-abre="${abre}" data-abre-estado="${abreEstado}" ${dis} aria-label=""></button>`;
  el.innerHTML = `
    <div class="cuarto">
      ${chromePalabra()}
      <div class="cifra">${n}</div>
      ${win}
      ${umbralBtn}
      <a class="volver" href="/">↑</a>
    </div>
    <!-- MONTAJE: rellenar cota ${n}; cuando haya destino, data-abre y encender umbral -->
  `;
  if (abreEstado === "encendido" && abre) {
    const u = el.querySelector("[data-umbral], .umbral-abre");
    onActivate(u, () => ir(abre));
  }
}

function renderSeminario(el) {
  el.innerHTML = `
    <div class="pagina-ventanas">
      ${chromePalabra()}
      ${ventana({
        title: ".ask",
        body: `<p><a href="/seminario/sesiones/01-contingencia/">¿Puede la contingencia abrir una bifurcación?</a></p>`,
        x: 48,
        y: 90,
      })}
      ${ventana({
        title: "resto",
        body: `<p class="hueco"></p><!-- MONTAJE: falta el resto de sesiones -->`,
        x: 320,
        y: 220,
      })}
      <a class="volver" href="/">↑</a>
    </div>`;
}

async function renderMinuta(el) {
  tocarPagina("minuta");
  let data;
  try {
    const r = await fetch("/seminario/sesiones/01-contingencia/minuta.json");
    data = await r.json();
  } catch {
    data = { pregunta: "¿Puede la contingencia abrir una bifurcación?", fragmentos: [] };
  }
  const frags = (data.fragmentos || [])
    .filter((f) => f.vertiente !== "deriva")
    .map((f) => {
      if (f.hueco) {
        return `<div class="frag" data-strato="vacio" data-estatuto="vacio"><span class="quien">${f.quien || ""}</span><!-- ${f.hueco} --></div>`;
      }
      const re = f.reaparece
        ? ` data-reaparece="${f.reaparece}"`
        : "";
      const quien = f.quien ? `<span class="quien">${f.quien}</span>` : "";
      return `<div class="frag" data-strato="${f.strato || ""}" data-estatuto="${f.estatuto || ""}"${re}>${quien}${f.cuerpo}</div>`;
    })
    .join("");
  const deriva = (data.fragmentos || []).find((f) => f.vertiente === "deriva");
  el.innerHTML = `
    <div class="campo">
      ${chromePalabra()}
      <article class="minuta-cuerpo">
        <p class="pregunta">${data.pregunta}</p>
        ${frags}
        <p class="margen"><a href="/antipodas/">¿ke es no tener piel?</a><a class="contam-cota" href="/cota/20/" data-cota="20">20</a></p>
        <div class="ojo incompleto" data-ojo hidden></div>
        <p class="pageviews" data-views></p>
      </article>
      <div class="vertiente" hidden data-vertiente>
        <p>${deriva ? deriva.cuerpo : ""}</p>
      </div>
      <p class="aviso-presencia">esta página percibe presencias, no identidades</p>
      <a class="volver" href="/">↑</a>
    </div>`;
  el.querySelectorAll("[data-reaparece]").forEach((nodo) => {
    onActivate(nodo, () => marcarEnigma(nodo.getAttribute("data-reaparece"), el));
  });
  const ojo = el.querySelector("[data-ojo]");
  syncOjo(el, ojo);
  onActivate(ojo, () => revelarViews(el));
  if (location.hash === "#deriva") {
    el.querySelector("[data-vertiente]").hidden = false;
  }
  const onHash = () => {
    const v = el.querySelector("[data-vertiente]");
    if (v) v.hidden = location.hash !== "#deriva";
  };
  window.addEventListener("hashchange", onHash);
  el._hash = onHash;
  if (sessionStorage.getItem(ADMIN) === "1" && ojo) {
    ojo.hidden = false;
    ojo.classList.add("admin");
    onActivate(ojo, () => {
      let velo = document.querySelector(".velo-zonas");
      if (velo) velo.remove();
      else {
        velo = document.createElement("div");
        velo.className = "velo-zonas";
        document.body.appendChild(velo);
      }
    });
  }
}

function enigmaState() {
  try {
    return JSON.parse(sessionStorage.getItem(ENIGMA) || '{"seq":[]}');
  } catch {
    return { seq: [] };
  }
}

function marcarEnigma(id, el) {
  const st = enigmaState();
  const order = ["1", "2", "3"];
  const next = order[st.seq.length];
  if (id === next) st.seq.push(id);
  sessionStorage.setItem(ENIGMA, JSON.stringify(st));
  syncOjo(el, el.querySelector("[data-ojo]"));
}

function syncOjo(el, ojo) {
  if (!ojo) return;
  const st = enigmaState();
  if (st.seq && st.seq.length >= 3) {
    ojo.hidden = false;
  }
}

async function revelarViews(el) {
  const st = enigmaState();
  if (!st.seq || st.seq.length < 3) return;
  try {
    const r = await fetch(
      "/api/visitas?path=" +
        encodeURIComponent("/seminario/sesiones/01-contingencia/"),
    );
    const j = await r.json();
    const p = el.querySelector("[data-views]");
    if (p) {
      p.textContent = String(j.n || 0);
      p.classList.add("revelado");
    }
  } catch {
    /* */
  }
}

function renderAntipodas(el) {
  tocarPagina("antipodas");
  el.innerHTML = `
    ${filtros()}
    <div class="antipodas">
      ${chromePalabra()}
      <div class="cuerpo-licuado"><img src="/xerox/figura.jpg" alt=""></div>
      <button type="button" class="umbral-carteles" data-umbral-carteles>
        <img src="/xerox/activar-carteles.jpg" alt="">
      </button>
      <a class="volver" href="/">↑</a>
    </div>`;
  const u = el.querySelector("[data-umbral-carteles]");
  const suelta = () => soltarCarteles(el);
  onDouble(u, suelta);
}

function soltarCarteles(el) {
  if (el.querySelector(".cartel")) return;
  const textos = ["sabes lo", "ke es no", "tener piel?"];
  const pos = [
    [12, 18],
    [48, 40],
    [28, 62],
  ];
  textos.forEach((t, i) => {
    const c = document.createElement("div");
    c.className = "cartel";
    c.textContent = t;
    c.style.left = pos[i][0] + "vw";
    c.style.top = pos[i][1] + "vh";
    c.tabIndex = 0;
    onDouble(c, () => c.remove());
    el.appendChild(c);
  });
}

function renderTeatro(el) {
  tocarPagina("teatro");
  el.innerHTML = `
    <div class="teatro" data-teatro>
      ${chromePalabra()}
      <div class="teles"><img src="/xerox/teles.jpg" alt=""></div>
      <details class="correspondencia">
        <summary>correspondencia perdida</summary>
        <p>el archivo salta el 02.</p>
        <!-- MONTAJE: falta el resto de la correspondencia -->
      </details>
      <a class="volver" href="/">↑</a>
    </div>`;
  const box = el.querySelector("[data-teatro]");
  const spawn = (text, cota) => {
    const m = document.createElement("div");
    m.className = "msg ventana" + (cota ? " cota-num" : "");
    const x = 8 + ((performance.now() * 13) % 70);
    const y = 10 + ((performance.now() * 7) % 60);
    m.style.left = x + "vw";
    m.style.top = y + "vh";
    if (cota) {
      m.innerHTML = `<a href="/cota/${cota}/">${cota}</a>`;
      tocarCota(cota);
    } else {
      m.innerHTML = `<div class="barra">msg</div><div class="cuerpo">${text}</div>`;
    }
    box.appendChild(m);
    dragVentanas(m);
  };
  let i = 0;
  spawn(TEATRO[0]);
  const tick = window.setInterval(() => {
    i += 1;
    if (i === 3) spawn("", 20);
    else spawn(TEATRO[i % TEATRO.length]);
    if (i > 8) clearInterval(tick);
  }, 2400);
  const onClick = (e) => {
    if (e.target.closest(".msg, details, .volver, .palabra")) return;
    spawn(TEATRO[Math.floor(performance.now()) % TEATRO.length]);
  };
  box.addEventListener("click", onClick);
  box.addEventListener(
    "wheel",
    () => {
      if (Math.floor(performance.now() / 400) % 5 === 0)
        spawn(TEATRO[4]);
    },
    { passive: true },
  );
  el._teatroTick = () => {
    clearInterval(tick);
    box.removeEventListener("click", onClick);
  };
}

function renderLoop(el) {
  el.innerHTML = `
    <div class="pagina-ventanas">
      ${chromePalabra()}
      ${ventana({
        title: "loop",
        body: `<p>¿Puede la contingencia abrir una bifurcación?</p>`,
        x: 80,
        y: 140,
      })}
      <a class="volver" href="/">↑</a>
    </div>`;
}

function renderMiochis(el) {
  tocarPagina("miochis");
  el.innerHTML = `
    <div class="campo">
      ${chromePalabra()}
      <div class="dino"><img src="/xerox/dinosaurio.jpg" alt=""></div>
      <a class="volver" href="/">↑</a>
    </div>`;
}

function renderContacto(el) {
  el.innerHTML = `
    <div class="pagina-ventanas">
      ${chromePalabra()}
      ${ventana({
        title: "mail",
        body: `<p class="hueco"></p><!-- MONTAJE: falta dirección -->`,
        x: 90,
        y: 120,
      })}
      <a class="volver" href="/">↑</a>
    </div>`;
}

function renderDirigido(el) {
  el.innerHTML = `
    <div class="pagina-ventanas">
      ${chromePalabra()}
      ${ventana({
        title: "en proceso",
        body: `<p><a href="/dirigido/hizo-lugar/">·</a></p>`,
        x: 70,
        y: 160,
      })}
      <a class="volver" href="/">↑</a>
    </div>`;
}

function renderHizo(el) {
  const prev = Number(localStorage.getItem(PASO) || 0);
  const now = Date.now();
  const reciente = prev && now - prev < 6 * 3600 * 1000;
  localStorage.setItem(PASO, String(now));
  const capas = [
    "Esto hizo lugar. No decidió qué aparecería en él.",
    "el dinero abre un cuarto, no una equivalencia",
    "pensé que pagar era una forma de escribir",
    "también pensé que escribir podía devolver el dinero",
    "dejó de parecer verdadera cuando el cuarto estuvo vacío y igual había que ocupar",
  ];
  el.innerHTML = `
    <div class="campo">
      ${chromePalabra()}
      <div class="room"><img src="/xerox/room.jpg" alt=""></div>
      <p class="frase" data-frase>${capas[0]}</p>
      <div class="mutacion" data-mut></div>
      <div class="tres">
        <button type="button" data-t="dinero">dinero</button>
        <button type="button" data-t="deseo">deseo</button>
        <button type="button" data-t="escritura">escritura</button>
      </div>
      ${reciente ? `<p class="aviso-presencia">·</p>` : ""}
      <a class="volver" href="/">↑</a>
    </div>`;
  let i = 0;
  const frase = el.querySelector("[data-frase]");
  onActivate(frase, () => {
    i = (i + 1) % capas.length;
    frase.textContent = capas[i];
  });
  el.querySelectorAll(".tres [data-t]").forEach((b) => {
    onActivate(b, () => {
      const mut = el.querySelector("[data-mut]");
      mut.textContent = b.getAttribute("data-t") + " no equivale";
    });
  });
}

function renderSuperya(el) {
  el.innerHTML = `
    <div class="campo">
      ${chromePalabra()}
      <div class="ojo-wrap">
        <button type="button" class="ojo" data-ojo-admin aria-label=""></button>
        <p class="todavia">todavía no es obra</p>
      </div>
      <a class="volver" href="/">↑</a>
    </div>`;
  const ojo = el.querySelector("[data-ojo-admin]");
  onDouble(ojo, () => {
    sessionStorage.setItem(ADMIN, "1");
    ojo.classList.add("admin", "pulso");
  });
}

function renderEnigma(el) {
  el.innerHTML = `
    <div class="pagina-ventanas">
      ${chromePalabra()}
      ${ventana({
        title: "lectura",
        body: `<p><a href="/seminario/sesiones/01-contingencia/">nosotrxs</a></p>
               <p>no es una contraseña.</p>`,
        x: 80,
        y: 120,
      })}
      <a class="volver" href="/">↑</a>
    </div>`;
}

export function boot(el) {
  if (!el) return () => {};
  const pagina = el.getAttribute("data-pagina") || "superficie";
  document.documentElement.setAttribute("data-pagina", pagina);
  document.documentElement.style.background = "";
  const cleaners = [];

  const run = async () => {
    if (pagina === "superficie") {
      renderSuperficie(el);
      await bindMapa(el);
    } else if (pagina === "cota") {
      let n = el.getAttribute("data-cota") || "";
      if (!n) {
        const m = location.pathname.match(/\/cota\/(\d+)/);
        n = m ? m[1] : "";
      }
      n = String(parseInt(n, 10) || 0);
      tocarCota(n);
      const cotas = await loadCotas();
      renderCota(el, n, cotas[n] || { estado: "vacio", abre: "", abreEstado: "apagado" });
    } else if (pagina === "seminario") renderSeminario(el);
    else if (pagina === "minuta") await renderMinuta(el);
    else if (pagina === "antipodas") renderAntipodas(el);
    else if (pagina === "teatro") renderTeatro(el);
    else if (pagina === "loop") renderLoop(el);
    else if (pagina === "miochis") renderMiochis(el);
    else if (pagina === "contacto") renderContacto(el);
    else if (pagina === "dirigido") renderDirigido(el);
    else if (pagina === "hizo-lugar") renderHizo(el);
    else if (pagina === "superya") renderSuperya(el);
    else if (pagina === "enigma") renderEnigma(el);
    else renderSuperficie(el);

    dragVentanas(el);
    ping(location.pathname || "/");
    const stopP = startPresence(location.pathname || "/");
    Promise.resolve(stopP).then((fn) => {
      if (typeof fn === "function") cleaners.push(fn);
    });
  };

  const p = run();
  cleaners.push(() => {
    if (el._hash) window.removeEventListener("hashchange", el._hash);
    if (el._teatroTick) el._teatroTick();
    document.querySelector(".velo-zonas")?.remove();
  });

  void p;
  return () => {
    cleaners.forEach((fn) => {
      try {
        fn();
      } catch {
        /* */
      }
    });
  };
}

if (!bundled()) {
  const el = document.getElementById("territorio");
  if (el && el.getAttribute("data-pagina")) boot(el);
}
