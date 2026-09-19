// @ts-nocheck
import { startPresence } from "./presence.js";
import { mountAfecciones } from "./afecciones.js";

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
      if (e.target.closest(".cerrar")) return;
      bar.setPointerCapture(e.pointerId);
      const r = win.getBoundingClientRect();
      const parent = document.documentElement;
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      win.style.left = r.left + window.scrollX + "px";
      win.style.top = r.top + window.scrollY + "px";
      win.style.right = "auto";
      win.style.bottom = "auto";
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

function chromePalabra(n) {
  return `<header class="pieza-cab">
    ${cabZzz()}
    <p class="estado">${n ? String(n).padStart(2, "0") : "en proceso"}</p>
  </header>`;
}

function cabZzz(opts) {
  const o = opts || {};
  const inv = o.invisible ? " cab-invisible" : "";
  const atras = o.sinAtras
    ? ""
    : `<button type="button" class="atras" data-atras>z</button>`;
  return `<div class="cab-zzz${inv}">
    <h1><a class="zzz" href="/">zzz</a></h1>
    ${atras}
  </div>`;
}

function bindAtras(root) {
  root.querySelectorAll("[data-atras]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.history.length > 1) history.back();
      else location.href = "/";
    });
  });
}

const LETREROS = [
  {
    letra: "a",
    id: "a",
    nombre: "Newsreader",
    face: '"Newsreader", Times, serif',
    modo: "pagina",
    href: "/letra/a/",
  },
  {
    letra: "b",
    id: "b",
    nombre: "Special Elite",
    face: '"Special Elite", cursive',
    modo: "ventana",
    seccion: "antipodas",
  },
  {
    letra: "c",
    id: "c",
    nombre: "Space Mono",
    face: '"Space Mono", ui-monospace, monospace',
    modo: "pagina",
    href: "/letra/c/",
  },
  {
    letra: "d",
    id: "d",
    nombre: "EB Garamond",
    face: '"EB Garamond", Times, serif',
    modo: "pagina",
    href: "/letra/d/",
  },
  {
    letra: "e",
    id: "e",
    nombre: "Techno",
    face: '"Techno", sans-serif',
    modo: "ventana",
    seccion: "hizo",
  },
];

const PIEZAS = {
  1: {
    titulo: "sitio",
    tipo: "umbral",
    excerpt: "",
    href: "/sitio/",
    cls: "sitio",
    tono: "#eae6dc",
  },
  3: {
    titulo: "seminario",
    tipo: "sesiones",
    excerpt: "¿Puede la contingencia abrir una bifurcación?",
    href: "/seminario/",
    cls: "seminario",
    tono: "#efeae0",
  },
  7: {
    titulo: "01-contingencia",
    tipo: "minuta",
    excerpt: "¿Puede la contingencia abrir una bifurcación?",
    href: "/seminario/sesiones/01-contingencia/",
    cls: "minuta",
    tono: "#f4f0e6",
  },
  8: {
    titulo: "deriva",
    tipo: "vertiente",
    excerpt: "",
    href: "/seminario/sesiones/01-contingencia/#deriva",
    cls: "deriva",
    tono: "#d7e4e6",
  },
  12: {
    titulo: "antípodas",
    tipo: "cuerpo",
    excerpt: "sabes lo ke es no tener piel?",
    href: "/antipodas/",
    cls: "antipodas",
    tono: "#1a1a1a",
  },
  16: {
    titulo: "teatro",
    tipo: "correspondencia",
    excerpt: "you have mail",
    href: "/teatro/",
    cls: "teatro",
    tono: "#141414",
  },
  21: {
    titulo: "loop",
    tipo: "loop",
    excerpt: "¿Puede la contingencia abrir una bifurcación?",
    href: "/loop/",
    cls: "loop",
    tono: "#ece6d8",
  },
  24: {
    titulo: "miochi.html",
    tipo: "html",
    excerpt: "miochi.html",
    href: "/miochis/",
    cls: "miochis",
    tono: "#cfc8b8",
  },
  31: {
    titulo: "enigma",
    tipo: "lectura",
    excerpt: "no es una contraseña.",
    href: "/seminario/enigma-ojo/",
    cls: "enigma",
    tono: "#e6e1d6",
  },
  40: {
    titulo: "dirigido",
    tipo: "en proceso",
    excerpt: "·",
    href: "/dirigido/",
    cls: "dirigido",
    tono: "#e8e3d8",
  },
  41: {
    titulo: "hizo lugar",
    tipo: "cuarto",
    excerpt: "Esto hizo lugar. No decidió qué aparecería en él.",
    href: "/dirigido/hizo-lugar/",
    cls: "hizo",
    tono: "#d8d2c6",
  },
  48: {
    titulo: "superyá",
    tipo: "todavía no",
    excerpt: "todavía no es obra",
    href: "/superya/",
    cls: "superya",
    tono: "#f0eee8",
  },
  54: {
    titulo: "escalera",
    tipo: "tramo",
    excerpt: "",
    href: "/cota/54/",
    cls: "escalera",
    tono: "#f4f4f4",
  },
};

function renderSuperficie(el) {
  const letreros = LETREROS.map(
    (L, i) =>
      `<button type="button" class="letrero" data-letrero="${L.id}" data-letra="${L.letra}" data-modo="${L.modo}" style="--i:${i}">${L.nombre}</button>`,
  ).join("");
  el.innerHTML = `
    ${filtros()}
    <div class="home">
      <div class="letreros">${letreros}</div>
      <div class="dino-bloque">
        <div class="dino-marco">
          <a class="zzz-sueño" href="/">zzz</a>
          <a class="dino-umbral" href="/cotas/">
            <img src="/xerox/dinosaurio.jpg" alt="">
          </a>
        </div>
      </div>
      <div class="capa-ventanas" data-ventanas></div>
    </div>`;
}

function bindHome(root) {
  const capa = root.querySelector("[data-ventanas]");
  if (!capa) return;
  let z = 20;

  const traer = (win) => {
    z += 1;
    win.style.zIndex = String(z);
  };

  const cerrar = (win) => {
    if (win._teatroTick) win._teatroTick();
    win.remove();
  };

  const onEsc = (e) => {
    if (e.key !== "Escape") return;
    const wins = [...capa.querySelectorAll(".ventana")];
    const top = wins.sort(
      (a, b) => (Number(b.style.zIndex) || 0) - (Number(a.style.zIndex) || 0),
    )[0];
    if (top) cerrar(top);
  };
  window.addEventListener("keydown", onEsc);
  root._homeOff = () => window.removeEventListener("keydown", onEsc);

  root.querySelectorAll(".letrero[data-letrero]").forEach((btn) => {
    onActivate(btn, () => {
      const id = btn.getAttribute("data-letrero");
      const L = LETREROS.find((x) => x.id === id);
      if (!L) return;
      if (L.modo === "pagina") ir(L.href);
      else abrirVentana(capa, id, traer, cerrar);
    });
  });

  capa.addEventListener("pointerdown", (e) => {
    const win = e.target.closest(".ventana");
    if (win) traer(win);
  });
}

async function abrirVentana(capa, id, traer, cerrar) {
  const L = LETREROS.find((x) => x.id === id);
  if (!L) return;
  const ya = capa.querySelector('.ventana[data-letrero="' + id + '"]');
  if (ya) {
    traer(ya);
    return;
  }
  const n = capa.querySelectorAll(".ventana").length;
  const x = Math.round(window.innerWidth * 0.42) + (n % 4) * 22;
  const y = 88 + (n % 3) * 28;
  const win = document.createElement("div");
  win.className = "ventana flotante";
  win.setAttribute("data-letrero", id);
  win.style.left = x + "px";
  win.style.top = y + "px";
  win.innerHTML = `<div class="barra">
      <span>${L.nombre}</span>
      <button type="button" class="cerrar" aria-label="cerrar">×</button>
    </div>
    <div class="cuerpo" data-cuerpo></div>`;
  capa.appendChild(win);
  traer(win);
  const cuerpo = win.querySelector("[data-cuerpo]");
  cuerpo.innerHTML = await cuerpoSeccion(L.seccion, L.letra);
  bindSeccionVentana(L.seccion, win, cuerpo);
  dragVentanas(win);
  const cl = win.querySelector(".cerrar");
  cl.addEventListener("pointerdown", (e) => e.stopPropagation());
  onActivate(cl, () => cerrar(win));
}

async function cuerpoSeccion(seccion, letra) {
  const data = await loadMontaje();
  const v = ((data && data.ventanas) || {})[letra];
  const lleno = htmlMontaje(v);
  if (lleno) return lleno;
  if (seccion === "minuta") {
    tocarPagina("minuta");
    let data;
    try {
      const r = await fetch("/seminario/sesiones/01-contingencia/minuta.json");
      data = await r.json();
    } catch {
      data = {
        pregunta: "¿Puede la contingencia abrir una bifurcación?",
        fragmentos: [],
      };
    }
    const frags = (data.fragmentos || [])
      .filter((f) => f.vertiente !== "deriva")
      .map((f) => {
        if (f.hueco) {
          return `<div class="frag" data-strato="vacio"><span class="quien">${f.quien || ""}</span></div>`;
        }
        const re = f.reaparece ? ` data-reaparece="${f.reaparece}"` : "";
        const quien = f.quien ? `<span class="quien">${f.quien}</span>` : "";
        return `<div class="frag"${re}>${quien}${f.cuerpo}</div>`;
      })
      .join("");
    return `<p class="pregunta">${data.pregunta}</p>${frags}`;
  }
  if (seccion === "antipodas") {
    tocarPagina("antipodas");
    return `<p class="licuado-txt" data-umbral-carteles tabindex="0">sabes lo ke es no tener piel?</p>`;
  }
  if (seccion === "teatro") {
    tocarPagina("teatro");
    return `<details class="correspondencia">
      <summary>correspondencia perdida</summary>
      <p>el archivo salta el 02.</p>
    </details>`;
  }
  if (seccion === "seminario") {
    return `<ol class="sesiones">
      <li><a href="/seminario/sesiones/01-contingencia/">¿Puede la contingencia abrir una bifurcación?</a></li>
      <li class="hueco"></li>
    </ol>`;
  }
  if (seccion === "hizo") {
    return `<p class="frase" data-frase>Esto hizo lugar. No decidió qué aparecería en él.</p>
      <div class="mutacion" data-mut></div>
      <p class="tres">
        <button type="button" data-t="dinero">dinero</button>
        <button type="button" data-t="deseo">deseo</button>
        <button type="button" data-t="escritura">escritura</button>
      </p>`;
  }
  return "";
}

function bindSeccionVentana(seccion, win, cuerpo) {
  if (seccion === "minuta") {
    cuerpo.querySelectorAll("[data-reaparece]").forEach((nodo) => {
      onActivate(nodo, () =>
        marcarEnigma(nodo.getAttribute("data-reaparece"), win),
      );
    });
  }
  if (seccion === "antipodas") {
    const u = cuerpo.querySelector("[data-umbral-carteles]");
    onDouble(u, () => soltarCarteles(win));
  }
  if (seccion === "teatro") {
    bindTeatroCaja(win, cuerpo);
  }
  if (seccion === "hizo") {
    const capas = [
      "Esto hizo lugar. No decidió qué aparecería en él.",
      "el dinero abre un cuarto, no una equivalencia",
      "pensé que pagar era una forma de escribir",
      "también pensé que escribir podía devolver el dinero",
      "dejó de parecer verdadera cuando el cuarto estuvo vacío y igual había que ocupar",
    ];
    let i = 0;
    const frase = cuerpo.querySelector("[data-frase]");
    onActivate(frase, () => {
      i = (i + 1) % capas.length;
      frase.textContent = capas[i];
    });
    cuerpo.querySelectorAll(".tres [data-t]").forEach((b) => {
      onActivate(b, () => {
        const mut = cuerpo.querySelector("[data-mut]");
        mut.textContent = b.getAttribute("data-t") + " no equivale";
      });
    });
  }
}

function bindTeatroCaja(box, cuerpo) {
  const spawn = (text, cota) => {
    const m = document.createElement("p");
    m.className = "carta" + (cota ? " cota-num" : "");
    if (cota) {
      m.innerHTML = `<a href="/cota/${cota}/">${cota}</a>`;
      tocarCota(cota);
    } else m.textContent = text;
    cuerpo.appendChild(m);
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
    if (e.target.closest(".carta, details, .barra, .cerrar")) return;
    spawn(TEATRO[Math.floor(performance.now()) % TEATRO.length]);
  };
  cuerpo.addEventListener("click", onClick);
  box._teatroTick = () => {
    clearInterval(tick);
    cuerpo.removeEventListener("click", onClick);
  };
}

function layoutCotas() {
  const W = 1400;
  const H = 860;
  const pad = 48;
  const hubs = {
    1: [240, 430],
    3: [490, 268],
    7: [640, 338],
    8: [724, 214],
    12: [860, 372],
    16: [990, 278],
    21: [404, 492],
    24: [1096, 428],
    31: [572, 156],
    40: [292, 568],
    41: [418, 640],
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
    const r = 0.16 + 0.78 * Math.sqrt((k + 0.35) / 41);
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
          const push = (min - d) / 2;
          dx /= d;
          dy /= d;
          if (!pts[i].hub) {
            pts[i].x -= dx * push;
            pts[i].y -= dy * push;
          }
          if (!pts[j].hub) {
            pts[j].x += dx * push;
            pts[j].y += dy * push;
          }
        }
      }
    }
  }
  for (const p of pts) {
    p.x = Math.min(W - pad, Math.max(pad, p.x));
    p.y = Math.min(H - pad, Math.max(pad, p.y));
  }
  return pts;
}

function rng(seed) {
  let s = ((seed + 1) * 16807) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hiloMental(a, b, rand) {
  const x1 = a.x.toFixed(1);
  const y1 = a.y.toFixed(1);
  const x2 = b.x.toFixed(1);
  const y2 = b.y.toFixed(1);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const side = rand() > 0.5 ? 1 : -1;
  const bulge = Math.min(240, d * (0.2 + rand() * 0.38)) * side;
  if (rand() < 0.48) {
    const b2 = bulge * (0.55 + rand() * 0.7);
    const c1x = a.x + dx * 0.28 + nx * bulge;
    const c1y = a.y + dy * 0.28 + ny * bulge;
    const c2x = a.x + dx * 0.72 - nx * b2;
    const c2y = a.y + dy * 0.72 - ny * b2;
    return `M${x1},${y1} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2},${y2}`;
  }
  const c1x = a.x + dx * 0.32 + nx * bulge;
  const c1y = a.y + dy * 0.32 + ny * bulge;
  const c2x = a.x + dx * 0.68 + nx * bulge * 0.4;
  const c2y = a.y + dy * 0.68 + ny * bulge * 0.4;
  return `M${x1},${y1} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2},${y2}`;
}

function armarHilos(pts, seed) {
  const rand = rng((seed + 1) * 9973 + 41);
  const used = new Set();
  const pares = [];
  const byN = Object.fromEntries(pts.map((p) => [p.n, p]));
  const add = (a, b) => {
    if (!a || !b || a.n === b.n) return;
    const k = a.n < b.n ? a.n + "-" + b.n : b.n + "-" + a.n;
    if (used.has(k)) return;
    used.add(k);
    pares.push([a, b]);
  };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const root = pts[Math.floor(rand() * pts.length)];
  const inTree = new Set([root.n]);
  while (inTree.size < pts.length) {
    let best = null;
    let bestD = Infinity;
    for (const n of inTree) {
      const a = byN[n];
      for (const b of pts) {
        if (inTree.has(b.n)) continue;
        const d = dist(a, b);
        if (d < bestD) {
          bestD = d;
          best = [a, b];
        }
      }
    }
    if (!best) break;
    add(best[0], best[1]);
    inTree.add(best[1].n);
  }

  for (const p of pts) {
    const near = pts
      .filter((q) => q.n !== p.n)
      .sort((a, b) => dist(p, a) - dist(p, b));
    add(p, near[0]);
    add(p, near[1]);
    if (near[2] && rand() > 0.4) add(p, near[2]);
  }

  for (let i = 0; i < 22; i++) {
    add(pts[Math.floor(rand() * pts.length)], pts[Math.floor(rand() * pts.length)]);
  }

  return pares
    .map(([a, b]) => `<path class="hilo" d="${hiloMental(a, b, rand)}" stroke-width="1.45"/>`)
    .join("");
}

function construirRed(cotas, seed) {
  const pts = layoutCotas();
  const nodos = pts
    .map((p) => {
      const href = p.n === 54 ? "/cota/54/" : "/cota/" + p.n + "/";
      return `<a href="${href}" data-cota="${p.n}" class="vacio">
        <circle class="hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="18"/>
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6"/>
        <text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dy="-8">${p.n}</text>
      </a>`;
    })
    .join("");
  return `<svg class="red" viewBox="0 0 1400 860" role="img" aria-label="">
    <g class="hilos">${armarHilos(pts, seed || 0)}</g>
    <g class="nodos">${nodos}</g>
    <g class="raiz-g">
      <circle class="raiz-hit" r="18"/>
      <text class="raiz" text-anchor="middle" dy="5">i</text>
      <animateTransform attributeName="transform" type="translate" dur="240s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.2;0.4;0.6;0.8;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" values="180 220; 1120 170; 980 690; 210 730; 740 390; 180 220"/>
    </g>
  </svg>`;
}

function renderCotas(el) {
  el.innerHTML = `
    ${filtros()}
    <div class="pagina-cotas">
      <header class="cab-home">
        ${cabZzz({ invisible: true })}
      </header>
      <p class="deseo-leyenda" data-deseo hidden>DESEO</p>
      <div class="mapa-wrap" data-mapa></div>
    </div>`;
}

async function bindMapa(root) {
  const wrap = root.querySelector("[data-mapa]");
  if (!wrap) return;
  const cotas = await loadCotas();
  const stop = mountAfecciones(wrap, {
    cotas,
    onCota: (n) => tocarCota(n),
    ir,
  });
  root._mapaOff = typeof stop === "function" ? stop : () => {};
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

function peldaños() {
  return Array.from({ length: 101 }, (_, i) => {
    const n = i + 1;
    if (n === 54) {
      return {
        n: "54",
        titulo: "",
        tipo: "",
        href: "#s1ento54",
        cls: "s1ento",
        revela: "@s1ento54_",
      };
    }
    if (n === 55) {
      return {
        n: "55",
        titulo: "",
        tipo: "",
        href: "/peldano/55/",
        cls: "diario",
      };
    }
    if (n === 101) {
      return {
        n: "101",
        titulo: "",
        tipo: "",
        href: "#i-regreso",
        cls: "ciento-uno",
      };
    }
    return {
      n: String(n),
      titulo: "",
      tipo: "",
      href: "/peldano/" + n + "/",
      cls: "tramo",
    };
  });
}

function bloquePeldaño(p, i) {
  return `<a class="peldaño ${p.cls || ""}" href="${p.href}" style="--i:${i}">
        <div class="contrahuella">
          <span class="peldaño-n">${p.n}</span>
          <p>
            <span class="peldaño-tit">${p.titulo}</span>
            <span class="peldaño-tipo">${p.tipo}</span>
          </p>
        </div>
        <div class="huella"></div>
        <div class="canto-ext"></div>
        <div class="canto-int"></div>
        <div class="trasera"></div>
        <div class="suelo"></div>
      </a>`;
}

function renderEscalera(el) {
  document.documentElement.setAttribute("data-pagina", "escalera");
  el.setAttribute("data-pagina", "escalera");
  el.setAttribute("data-cota", "54");
  el.setAttribute("data-strato", "intervencion");
  el.setAttribute("data-estado", "ocupada");
  const pasos = peldaños();
  const vis = Math.min(42, pasos.length * 3);
  const bloques = Array.from({ length: vis }, (_, k) =>
    bloquePeldaño(pasos[k % pasos.length], k),
  ).join("");
  el.innerHTML = `
    <div class="pagina-escalera" style="--n:${vis}">
      <header class="cab-home cab-escalera">
        ${cabZzz({ invisible: true })}
      </header>
      <div class="escalera" data-escalera>${bloques}</div>
      <p class="s1ento-msg" data-s1ento hidden>@s1ento54_</p>
    </div>`;
  bindEscalera(el, pasos);
}

function bindEscalera(el, pasos) {
  const page = el.querySelector(".pagina-escalera");
  const stair = el.querySelector("[data-escalera]");
  if (!stair || !page) return;
  const ciclo = pasos.length;
  const vis = Math.min(42, ciclo * 3);
  const nodes = [...stair.querySelectorAll(".peldaño")];
  let t = 53;
  let touching = false;
  let lastY = 0;
  let pending = false;
  let revelado = false;
  let i101 = false;
  const msg = el.querySelector("[data-s1ento]");

  const paint = () => {
    const origin = Math.round(t) - Math.floor(vis / 2);
    stair.style.setProperty("--mid", String(t));
    nodes.forEach((node, k) => {
      const idx = origin + k;
      const p = pasos[((idx % ciclo) + ciclo) % ciclo];
      node.style.setProperty("--i", String(idx));
      node.setAttribute("href", p.href || "#");
      let extra = "";
      if (p.cls === "s1ento" && revelado) extra = " abierto";
      if (p.cls === "ciento-uno" && i101) extra = " abierto";
      node.className = "peldaño " + (p.cls || "") + extra;
      const num = node.querySelector(".peldaño-n");
      const tit = node.querySelector(".peldaño-tit");
      const tipo = node.querySelector(".peldaño-tipo");
      if (num) num.textContent = p.n;
      if (tipo) tipo.textContent = "";
      if (tit) {
        if (p.cls === "s1ento" && revelado) {
          tit.innerHTML = `<span class="ig">@s1ento54_</span>`;
        } else if (p.cls === "ciento-uno" && i101) {
          tit.innerHTML = `<em class="i-regreso">i</em>`;
        } else {
          tit.textContent = "";
        }
      }
      const d = Math.abs(idx - t);
      node.style.opacity = d > vis / 2 - 1.5 ? "0" : "";
      node.style.pointerEvents = d > vis / 2 - 2 ? "none" : "auto";
    });
    if (msg) msg.hidden = !revelado;
  };

  const step = (dt) => {
    t += dt;
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      paint();
      pending = false;
    });
  };

  const onWheel = (e) => {
    e.preventDefault();
    step(e.deltaY * 0.0032);
  };

  const onDown = (e) => {
    if (e.target.closest(".cab-escalera, .atras, .zzz, a.peldaño")) return;
    touching = true;
    lastY = e.clientY;
    try {
      page.setPointerCapture(e.pointerId);
    } catch {
      /* */
    }
  };
  const onMove = (e) => {
    if (!touching) return;
    step((lastY - e.clientY) * 0.012);
    lastY = e.clientY;
  };
  const onUp = () => {
    touching = false;
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      step(0.32);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      step(-0.32);
    }
  };

  const onClick = (e) => {
    const a = e.target.closest("a.peldaño");
    if (!a) return;
    if (a.classList.contains("s1ento")) {
      e.preventDefault();
      if (revelado && e.target.closest(".ig")) {
        location.href = "https://www.instagram.com/s1ento54_";
        return;
      }
      revelado = true;
      paint();
      return;
    }
    if (a.classList.contains("ciento-uno")) {
      e.preventDefault();
      if (i101 && e.target.closest(".i-regreso")) {
        ir("/cotas/");
        return;
      }
      i101 = true;
      paint();
    }
  };

  page.addEventListener("wheel", onWheel, { passive: false });
  page.addEventListener("pointerdown", onDown);
  page.addEventListener("pointermove", onMove);
  page.addEventListener("pointerup", onUp);
  page.addEventListener("pointercancel", onUp);
  page.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);
  paint();

  el._escaleraOff = () => {
    page.removeEventListener("wheel", onWheel);
    page.removeEventListener("pointerdown", onDown);
    page.removeEventListener("pointermove", onMove);
    page.removeEventListener("pointerup", onUp);
    page.removeEventListener("pointercancel", onUp);
    page.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKey);
  };
}

function renderCota(el, n, meta) {
  if (String(n) === "54") {
    renderEscalera(el);
    return;
  }
  renderEnProceso(el, "cota", String(n));
}

let MONTAJE = null;
async function loadMontaje() {
  if (MONTAJE) return MONTAJE;
  try {
    const r = await fetch("/montaje/contenidos.json");
    MONTAJE = await r.json();
  } catch {
    MONTAJE = { letras: {}, cotas: {}, peldanos: {} };
  }
  return MONTAJE;
}

function htmlMontaje(bloque) {
  const b = bloque || {};
  const texto = b.texto
    ? `<div class="cuerpo-montaje">${b.texto}</div>`
    : "";
  const imgs = (b.imagenes || [])
    .filter(Boolean)
    .map((src) => `<img class="img-montaje" src="${src}" alt="">`)
    .join("");
  const pdfs = (b.pdfs || [])
    .filter(Boolean)
    .map((src) => `<a class="pdf-montaje" href="${src}">${src.split("/").pop()}</a>`)
    .join("");
  return texto + imgs + pdfs;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => {
    if (ch === "&") return "\u0026amp;";
    if (ch === "<") return "\u0026lt;";
    if (ch === ">") return "\u0026gt;";
    return "\u0026quot;";
  });
}

function cifraFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return dd + " · " + mm;
}

function htmlEntrada(e) {
  const texto = escapeHtml(e.texto || "").replace(/\n/g, "<br>");
  const cuerpo = texto ? `<div class="cuerpo-montaje">${texto}</div>` : "";
  const media = (e.archivos || [])
    .map((a) => {
      const src = "/api/diario/archivo/" + a.id;
      if (a.kind === "pdf") {
        return `<a class="pdf-montaje" href="${src}" target="_blank" rel="noopener">${escapeHtml(a.nombre || "pdf")}</a>`;
      }
      return `<img class="img-montaje" src="${src}" alt="">`;
    })
    .join("");
  const cuando = cifraFecha(e.createdAt);
  return `<article class="entrada-diario" data-id="${e.id}">
    <button type="button" class="borrar-entrada" data-borrar="${e.id}">×</button>
    ${cuando ? `<p class="cuando">${cuando}</p>` : ""}
    ${cuerpo}${media}
  </article>`;
}

async function renderDiario(el) {
  el.setAttribute("data-pagina", "peldano");
  el.setAttribute("data-peldano", "55");
  el.setAttribute("data-strato", "intervencion");
  el.setAttribute("data-estado", "ocupada");
  tocarPagina("diario-55");
  el.innerHTML = `
    <article class="pieza diario">
      <header class="cab-home">
        ${cabZzz({ invisible: true })}
      </header>
      <p class="cifra">55</p>
      <form class="hoja-diario" data-diario>
        <textarea name="texto" rows="9" autocomplete="off"></textarea>
        <div class="adjunto-zona" data-drop>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" multiple hidden data-files>
          <button type="button" class="clip" data-clip>adjunto</button>
          <ul class="lista-adj" data-lista></ul>
        </div>
        <button type="submit" class="dejar">·</button>
      </form>
      <div class="entradas" data-entradas></div>
    </article>`;
  await bindDiario(el);
}

async function bindDiario(el) {
  const form = el.querySelector("[data-diario]");
  const area = form?.querySelector("textarea");
  const input = el.querySelector("[data-files]");
  const clip = el.querySelector("[data-clip]");
  const lista = el.querySelector("[data-lista]");
  const drop = el.querySelector("[data-drop]");
  const box = el.querySelector("[data-entradas]");
  if (!form || !box) return;
  const pending = [];

  const pintarLista = () => {
    if (!lista) return;
    lista.innerHTML = pending
      .map(
        (f, i) =>
          `<li><span>${escapeHtml(f.name)}</span><button type="button" data-x="${i}">×</button></li>`,
      )
      .join("");
  };

  const addFiles = (files) => {
    for (const f of files || []) {
      if (pending.length >= 6) break;
      const ok =
        /^image\/(jpeg|jpg|png|webp|gif)$/i.test(f.type) ||
        f.type === "application/pdf";
      if (!ok) continue;
      if (f.size > 4.5 * 1024 * 1024) continue;
      pending.push(f);
    }
    pintarLista();
  };

  const pintarEntradas = (entradas) => {
    box.innerHTML = (entradas || []).map(htmlEntrada).join("");
  };

  try {
    const r = await fetch("/api/diario/");
    const data = await r.json();
    pintarEntradas(data.entradas || []);
  } catch {
    pintarEntradas([]);
  }

  clip?.addEventListener("click", (e) => {
    e.preventDefault();
    input?.click();
  });
  input?.addEventListener("change", () => {
    addFiles(input.files);
    input.value = "";
  });
  lista?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-x]");
    if (!btn) return;
    pending.splice(Number(btn.getAttribute("data-x")), 1);
    pintarLista();
  });

  const over = (e) => {
    e.preventDefault();
    drop?.classList.add("sobre");
  };
  const leave = (e) => {
    e.preventDefault();
    drop?.classList.remove("sobre");
  };
  drop?.addEventListener("dragover", over);
  drop?.addEventListener("dragenter", over);
  drop?.addEventListener("dragleave", leave);
  drop?.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("sobre");
    addFiles(e.dataTransfer?.files);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = area ? area.value : "";
    if (!texto.trim() && !pending.length) return;
    const fd = new FormData();
    fd.append("texto", texto);
    pending.forEach((f) => fd.append("archivos", f));
    form.classList.add("enviando");
    try {
      const r = await fetch("/api/diario/", { method: "POST", body: fd });
      const data = await r.json();
      if (r.ok && data.entrada) {
        box.insertAdjacentHTML("afterbegin", htmlEntrada(data.entrada));
        if (area) area.value = "";
        pending.length = 0;
        pintarLista();
      }
    } catch {
      /* */
    }
    form.classList.remove("enviando");
  });

  box.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-borrar]");
    if (!btn) return;
    const id = btn.getAttribute("data-borrar");
    const art = btn.closest(".entrada-diario");
    if (!id || !art) return;
    art.classList.add("saliendo");
    try {
      const r = await fetch("/api/diario/?id=" + encodeURIComponent(id), {
        method: "DELETE",
      });
      if (r.ok) art.remove();
      else art.classList.remove("saliendo");
    } catch {
      art.classList.remove("saliendo");
    }
  });
}

async function renderEnProceso(el, tipo, clave) {
  if (tipo === "peldano" && String(clave) === "55") {
    await renderDiario(el);
    return;
  }
  el.setAttribute("data-pagina", tipo);
  if (tipo === "cota") el.setAttribute("data-cota", clave);
  if (tipo === "letra") el.setAttribute("data-letra", clave);
  if (tipo === "peldano") el.setAttribute("data-peldano", clave);
  const data = await loadMontaje();
  const bloque =
    tipo === "letra"
      ? (data.letras || {})[clave]
      : tipo === "peldano"
        ? (data.peldanos || {})[clave]
        : (data.cotas || {})[clave];
  const lleno = htmlMontaje(bloque);
  el.innerHTML = `
    <article class="pieza en-proceso">
      <header class="cab-home">
        ${cabZzz({ invisible: true })}
      </header>
      <p class="leyenda-proceso">en proceso</p>
      <div class="hueco-montaje" data-montaje="${tipo}-${clave}">
        ${lleno || "<!-- MONTAJE: public/montaje/contenidos.json → " + tipo + "s." + clave + " -->"}
      </div>
    </article>`;
}

function renderSeminario(el) {
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(3)}
      <h2>seminario</h2>
      <p class="tipo">sesiones</p>
      <ol class="sesiones">
        <li><a href="/seminario/sesiones/01-contingencia/">¿Puede la contingencia abrir una bifurcación?</a></li>
        <li class="hueco"><!-- MONTAJE: falta el resto de sesiones --></li>
      </ol>
      <a class="volver" href="/">↑</a>
    </article>`;
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
    <article class="pieza minuta">
      ${chromePalabra(7)}
      <div class="cuerpo-largo">
        <p class="pregunta">${data.pregunta}</p>
        ${frags}
        <p class="margen"><a href="/antipodas/">¿ke es no tener piel?</a><a class="contam-cota" href="/cota/20/" data-cota="20">20</a></p>
        <div class="ojo incompleto" data-ojo hidden></div>
        <p class="pageviews" data-views></p>
      </div>
      <div class="vertiente" hidden data-vertiente>
        <p>${deriva ? deriva.cuerpo : ""}</p>
      </div>
      <p class="aviso-presencia">esta página percibe presencias, no identidades</p>
      <a class="volver" href="/">↑</a>
    </article>`;
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
    <article class="pieza antipodas">
      ${chromePalabra(12)}
      <h2>antípodas</h2>
      <p class="tipo">cuerpo</p>
      <p class="cuerpo-largo licuado-txt" data-umbral-carteles tabindex="0">sabes lo ke es no tener piel?</p>
      <a class="volver" href="/">↑</a>
    </article>`;
  const u = el.querySelector("[data-umbral-carteles]");
  onDouble(u, () => soltarCarteles(el));
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
    <article class="pieza teatro" data-teatro>
      ${chromePalabra(16)}
      <h2>teatro</h2>
      <p class="tipo">correspondencia</p>
      <details class="correspondencia">
        <summary>correspondencia perdida</summary>
        <p>el archivo salta el 02.</p>
        <!-- MONTAJE: falta el resto de la correspondencia -->
      </details>
      <a class="volver" href="/">↑</a>
    </article>`;
  const box = el.querySelector("[data-teatro]");
  const spawn = (text, cota) => {
    const m = document.createElement("p");
    m.className = "carta" + (cota ? " cota-num" : "");
    if (cota) {
      m.innerHTML = `<a href="/cota/${cota}/">${cota}</a>`;
      tocarCota(cota);
    } else {
      m.textContent = text;
    }
    box.appendChild(m);
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
    if (e.target.closest(".carta, details, .volver, .pieza-cab")) return;
    spawn(TEATRO[Math.floor(performance.now()) % TEATRO.length]);
  };
  box.addEventListener("click", onClick);
  box.addEventListener(
    "wheel",
    () => {
      if (Math.floor(performance.now() / 400) % 5 === 0) spawn(TEATRO[4]);
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
    <article class="pieza loop">
      ${chromePalabra(21)}
      <h2>loop</h2>
      <p class="pregunta">¿Puede la contingencia abrir una bifurcación?</p>
      <a class="volver" href="/">↑</a>
    </article>`;
}

function renderMiochis(el) {
  tocarPagina("miochis");
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(24)}
      <h2>miochi.html</h2>
      <p class="tipo">html</p>
      <p class="cuerpo-largo">miochi.html</p>
      <a class="volver" href="/">↑</a>
    </article>`;
}

function renderContacto(el) {
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(54)}
      <h2>contacto</h2>
      <p class="tipo">mail</p>
      <p class="hueco"></p><!-- MONTAJE: falta dirección -->
      <a class="volver" href="/">↑</a>
    </article>`;
}

function renderDirigido(el) {
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(40)}
      <h2>dirigido</h2>
      <p class="tipo">en proceso</p>
      <p><a href="/dirigido/hizo-lugar/">·</a></p>
      <a class="volver" href="/">↑</a>
    </article>`;
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
    <article class="pieza hizo">
      ${chromePalabra(41)}
      <h2>hizo lugar</h2>
      <p class="tipo">cuarto</p>
      <p class="frase" data-frase>${capas[0]}</p>
      <div class="mutacion" data-mut></div>
      <p class="tres">
        <button type="button" data-t="dinero">dinero</button>
        <button type="button" data-t="deseo">deseo</button>
        <button type="button" data-t="escritura">escritura</button>
      </p>
      ${reciente ? `<p class="aviso-presencia">·</p>` : ""}
      <a class="volver" href="/">↑</a>
    </article>`;
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
    <article class="pieza">
      ${chromePalabra(48)}
      <h2>superyá</h2>
      <p class="tipo">todavía no</p>
      <div class="ojo-wrap">
        <button type="button" class="ojo" data-ojo-admin aria-label=""></button>
        <p class="todavia">todavía no es obra</p>
      </div>
      <a class="volver" href="/">↑</a>
    </article>`;
  const ojo = el.querySelector("[data-ojo-admin]");
  onDouble(ojo, () => {
    sessionStorage.setItem(ADMIN, "1");
    ojo.classList.add("admin", "pulso");
  });
}

function renderEnigma(el) {
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(31)}
      <h2>enigma</h2>
      <p class="tipo">lectura</p>
      <p class="cuerpo-largo"><a href="/seminario/sesiones/01-contingencia/">nosotrxs</a></p>
      <p>no es una contraseña.</p>
      <a class="volver" href="/">↑</a>
    </article>`;
}

function renderSitio(el) {
  el.innerHTML = `
    <article class="pieza">
      ${chromePalabra(1)}
      <h2>sitio</h2>
      <p class="tipo">umbral</p>
      <p class="hueco"></p>
      <a class="volver" href="/">↑</a>
    </article>`;
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
      bindHome(el);
    } else if (pagina === "cotas") {
      renderCotas(el);
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
    } else if (pagina === "letra") {
      let id = el.getAttribute("data-letra") || "";
      if (!id) {
        const m = location.pathname.match(/\/letra\/([a-e])/);
        id = m ? m[1] : "a";
      }
      await renderEnProceso(el, "letra", id);
    } else if (pagina === "peldano") {
      let n = el.getAttribute("data-peldano") || "";
      if (!n) {
        const m = location.pathname.match(/\/peldano\/(\d+)/);
        n = m ? m[1] : "1";
      }
      await renderEnProceso(el, "peldano", String(n));
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
    else if (pagina === "sitio") renderSitio(el);
    else renderSuperficie(el);

    dragVentanas(el);
    bindAtras(el);
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
    if (el._homeOff) el._homeOff();
    if (el._escaleraOff) el._escaleraOff();
    if (el._mapaOff) el._mapaOff();
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
