// @ts-nocheck
/* campo de afecciones — el mapa es derivado; el objeto es la transformación */

const DIMS = ["body", "memory", "relation", "technique", "imagination"];
const OPS = ["attracts", "interrupts", "bridges", "transforms", "stabilizes"];
const STAGES = ["activate", "attract", "desynchronize", "connect", "stabilize"];
const W = 1400;
const H = 860;
const GX = 128;
const GY = 80;
const THRESHOLDS = 18;
const CONNECT_MIN = 0.72;
const TRACE_KEEP = 0.11;
const LIVE_MAX = 72;
const DEGREE_MAX = 5;
const NEW_PER_DESIRE = 12;
const HIST_KEY = "smioochy-afecciones";
const HIST_MAX = 8;

const POLES = {
  body: { x: 0.5, y: 0.84 },
  memory: { x: 0.16, y: 0.5 },
  relation: { x: 0.5, y: 0.5 },
  technique: { x: 0.86, y: 0.48 },
  imagination: { x: 0.5, y: 0.14 },
};

const HEX = [
  [50, 5],
  [90, 78],
  [10, 28],
  [50, 95],
  [90, 28],
  [10, 78],
];

function hash01(n, salt) {
  const x = Math.sin((n + 1) * 12.9898 + (salt || 0) * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a) {
  const n = Math.sqrt(dot(a, a)) || 1;
  return a.map((v) => v / n);
}

function cosine(a, b) {
  return clamp01((dot(norm(a), norm(b)) + 1) / 2);
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function vecFrom(obj, keys) {
  return keys.map((k) => clamp01(Number(obj[k] || 0)));
}

function objFrom(vec, keys) {
  const o = {};
  keys.forEach((k, i) => {
    o[k] = clamp01(vec[i] ?? 0);
  });
  return o;
}

function cycleVec(v, dir) {
  const n = v.length;
  const o = new Array(n);
  for (let i = 0; i < n; i++) o[i] = v[(i - dir + n) % n];
  return o;
}

function invertVec(v) {
  return v.map((x) => 1 - x);
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function reduced() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

const EXTRAS = [
  {
    id: "simondon",
    label: "simondon",
    x: 0.37,
    y: 0.31,
    actual: 0.82,
    potential: 0.63,
    intensity: 0.86,
    affect: [0.22, 0.48, 0.81, 0.94, 0.76],
    ops: [0.44, 0.37, 0.91, 0.96, 0.52],
  },
  {
    id: "transduccion",
    label: "transducción",
    x: 0.63,
    y: 0.5,
    actual: 0.71,
    potential: 0.77,
    intensity: 0.74,
    affect: [0.31, 0.29, 0.88, 0.91, 0.58],
    ops: [0.61, 0.22, 0.94, 0.89, 0.33],
  },
  {
    id: "individuacion",
    label: "individuación",
    x: 0.29,
    y: 0.57,
    actual: 0.66,
    potential: 0.81,
    intensity: 0.7,
    affect: [0.54, 0.41, 0.79, 0.62, 0.73],
    ops: [0.38, 0.44, 0.72, 0.93, 0.29],
  },
  {
    id: "deseo",
    label: "deseo",
    x: 0.56,
    y: 0.11,
    actual: 0.41,
    potential: 0.96,
    intensity: 0.81,
    affect: [0.67, 0.36, 0.84, 0.28, 0.93],
    ops: [0.92, 0.71, 0.48, 0.97, 0.18],
  },
  {
    id: "demora",
    label: "demora",
    x: 0.22,
    y: 0.62,
    actual: 0.28,
    potential: 0.91,
    intensity: 0.42,
    affect: [0.71, 0.82, 0.33, 0.19, 0.64],
    ops: [0.21, 0.88, 0.39, 0.55, 0.14],
  },
  {
    id: "infraestructura",
    label: "infraestructura",
    x: 0.18,
    y: 0.28,
    actual: 0.58,
    potential: 0.44,
    intensity: 0.51,
    affect: [0.19, 0.37, 0.46, 0.93, 0.21],
    ops: [0.33, 0.16, 0.77, 0.41, 0.91],
  },
  {
    id: "xerox",
    label: "xerox",
    x: 0.72,
    y: 0.58,
    actual: 0.77,
    potential: 0.39,
    intensity: 0.63,
    affect: [0.81, 0.74, 0.22, 0.48, 0.55],
    ops: [0.29, 0.63, 0.41, 0.52, 0.7],
  },
  {
    id: "huella",
    label: "huella",
    x: 0.78,
    y: 0.36,
    actual: 0.49,
    potential: 0.72,
    intensity: 0.47,
    affect: [0.44, 0.91, 0.38, 0.27, 0.61],
    ops: [0.18, 0.54, 0.66, 0.43, 0.8],
  },
  {
    id: "montaje",
    label: "montaje",
    x: 0.64,
    y: 0.7,
    actual: 0.6,
    potential: 0.68,
    intensity: 0.55,
    affect: [0.36, 0.58, 0.71, 0.77, 0.84],
    ops: [0.47, 0.51, 0.86, 0.79, 0.42],
  },
  {
    id: "presencia",
    label: "presencia",
    x: 0.12,
    y: 0.2,
    actual: 0.35,
    potential: 0.88,
    intensity: 0.38,
    affect: [0.62, 0.33, 0.9, 0.24, 0.71],
    ops: [0.77, 0.29, 0.58, 0.64, 0.21],
  },
];

const PIEZAS = {
  1: { titulo: "sitio", href: "/sitio/", affect: [0.2, 0.3, 0.7, 0.4, 0.5], ops: [0.55, 0.2, 0.8, 0.4, 0.6] },
  3: { titulo: "seminario", href: "/seminario/", affect: [0.18, 0.62, 0.84, 0.71, 0.55], ops: [0.48, 0.41, 0.77, 0.69, 0.58] },
  7: { titulo: "contingencia", href: "/seminario/sesiones/01-contingencia/", affect: [0.41, 0.33, 0.72, 0.38, 0.81], ops: [0.36, 0.91, 0.44, 0.88, 0.12] },
  8: { titulo: "deriva", href: "/seminario/sesiones/01-contingencia/#deriva", affect: [0.58, 0.29, 0.66, 0.22, 0.77], ops: [0.42, 0.74, 0.51, 0.63, 0.19] },
  12: { titulo: "antípodas", href: "/antipodas/", affect: [0.93, 0.28, 0.81, 0.17, 0.64], ops: [0.71, 0.66, 0.39, 0.58, 0.21] },
  16: { titulo: "teatro", href: "/teatro/", affect: [0.33, 0.86, 0.74, 0.21, 0.88], ops: [0.64, 0.47, 0.52, 0.71, 0.33] },
  21: { titulo: "loop", href: "/loop/", affect: [0.27, 0.79, 0.44, 0.61, 0.36], ops: [0.31, 0.22, 0.48, 0.4, 0.93] },
  24: { titulo: "miochi", href: "/miochis/", affect: [0.84, 0.41, 0.58, 0.33, 0.9], ops: [0.69, 0.38, 0.55, 0.77, 0.26] },
  31: { titulo: "enigma", href: "/seminario/enigma-ojo/", affect: [0.24, 0.88, 0.31, 0.46, 0.72], ops: [0.22, 0.81, 0.36, 0.54, 0.47] },
  40: { titulo: "dirigido", href: "/dirigido/", affect: [0.38, 0.44, 0.91, 0.52, 0.48], ops: [0.86, 0.19, 0.73, 0.41, 0.55] },
  41: { titulo: "hizo lugar", href: "/dirigido/hizo-lugar/", affect: [0.61, 0.52, 0.77, 0.34, 0.69], ops: [0.58, 0.27, 0.81, 0.66, 0.38] },
  48: { titulo: "superyá", href: "/superya/", affect: [0.29, 0.36, 0.42, 0.27, 0.81], ops: [0.33, 0.58, 0.29, 0.71, 0.22] },
  54: { titulo: "", href: "/cota/54/", affect: [0.47, 0.61, 0.33, 0.29, 0.74], ops: [0.24, 0.43, 0.68, 0.51, 0.39] },
};

const STRUCTURAL = [
  ["c3", "c7"],
  ["c7", "c8"],
  ["c3", "c31"],
  ["c40", "c41"],
  ["c1", "c3"],
  ["simondon", "transduccion"],
  ["simondon", "individuacion"],
  ["transduccion", "individuacion"],
  ["deseo", "c7"],
  ["demora", "infraestructura"],
  ["xerox", "huella"],
  ["huella", "montaje"],
  ["presencia", "deseo"],
  ["c12", "deseo"],
  ["c16", "huella"],
  ["c24", "presencia"],
  ["c21", "c7"],
  ["simondon", "c3"],
  ["montaje", "c41"],
];

function layoutCotas() {
  const pad = 52;
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
  for (let it = 0; it < 48; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = 52;
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

function makeNodes(cotas) {
  const pts = layoutCotas();
  const nodes = [];
  for (const p of pts) {
    const pieza = PIEZAS[p.n];
    const meta = cotas?.[String(p.n)] || {};
    const occupied = meta.estado === "ocupada";
    const h = hash01(p.n, 3);
    const affect = pieza?.affect || [
      0.15 + 0.7 * hash01(p.n, 1),
      0.15 + 0.7 * hash01(p.n, 2),
      0.15 + 0.7 * hash01(p.n, 3),
      0.15 + 0.7 * hash01(p.n, 4),
      0.15 + 0.7 * hash01(p.n, 5),
    ];
    const ops = pieza?.ops || [
      0.12 + 0.7 * hash01(p.n, 6),
      0.12 + 0.7 * hash01(p.n, 7),
      0.12 + 0.7 * hash01(p.n, 8),
      0.12 + 0.7 * hash01(p.n, 9),
      0.12 + 0.7 * hash01(p.n, 10),
    ];
    nodes.push({
      id: "c" + p.n,
      n: p.n,
      label: pieza?.titulo || "",
      href: pieza?.href || (meta.abre && meta.abreEstado === "encendido" ? meta.abre : "/cota/" + p.n + "/"),
      occupied,
      x: p.x,
      y: p.y,
      px: p.x,
      py: p.y,
      vx: 0,
      vy: 0,
      sigma: occupied ? 78 + 40 * h : 42 + 18 * h,
      state: {
        actual: occupied ? 0.62 + 0.28 * h : 0.08 + 0.16 * h,
        potential: occupied ? 0.34 + 0.28 * h : 0.55 + 0.4 * hash01(p.n, 11),
        intensity: occupied ? 0.58 + 0.32 * h : 0.07 + 0.14 * h,
      },
      affect: objFrom(affect, DIMS),
      operations: objFrom(ops, OPS),
    });
  }
  for (const e of EXTRAS) {
    nodes.push({
      id: e.id,
      n: 0,
      label: e.label,
      href: "",
      occupied: false,
      conceptual: true,
      x: e.x * W,
      y: e.y * H,
      px: e.x * W,
      py: e.y * H,
      vx: 0,
      vy: 0,
      sigma: 46 + 22 * e.intensity,
      state: {
        actual: e.actual,
        potential: e.potential,
        intensity: e.intensity,
      },
      affect: objFrom(e.affect, DIMS),
      operations: objFrom(e.ops, OPS),
    });
  }
  return nodes;
}

function edgeKey(a, b) {
  return a < b ? a + "|" + b : b + "|" + a;
}

function affinity(a, b, dim, phase) {
  let va = vecFrom(a.affect, DIMS);
  let vb = vecFrom(b.affect, DIMS);
  let oa = vecFrom(a.operations, OPS);
  let ob = vecFrom(b.operations, OPS);
  if (phase === 1) {
    va = cycleVec(va, 1);
    vb = cycleVec(vb, 1);
  } else if (phase === 2) {
    va = invertVec(va);
    vb = invertVec(vb);
  } else if (phase === 3) {
    va = cycleVec(va, -1);
    vb = cycleVec(vb, -1);
  }
  const di = DIMS.indexOf(dim);
  const dimBoost = di >= 0 ? va[di] * vb[di] : 0;
  const latent = Math.sqrt((a.state.potential + 0.05) * (b.state.potential + 0.05));
  return clamp01(
    cosine(va, vb) * 0.32 + cosine(oa, ob) * 0.32 + latent * 0.18 + dimBoost * 0.36,
  );
}

function phaseCompat(edge, phase) {
  const base = edge.phaseCompatibility ?? 0.7;
  if (phase === 0) return base;
  if (phase === 1) return 0.35 + 0.65 * (edge.type === "transductive" ? 1 : 0.45);
  if (phase === 2) return 1 - base;
  return 0.4 + 0.5 * (edge.type === "interruptive" ? 1 : 0.35);
}

function edgeType(a, b) {
  if (a.operations.transforms > 0.7 && b.operations.transforms > 0.7) return "transductive";
  if (a.operations.interrupts > 0.7 || b.operations.interrupts > 0.7) return "interruptive";
  if (a.operations.bridges > 0.75 && b.operations.bridges > 0.55) return "bridge";
  return "relational";
}

function seedEdges(nodes, dim) {
  return rewire(nodes, dim, 0, [], { keep: [], take: LIVE_MAX, min: 0.64 });
}

function rewire(nodes, dim, phase, previous, opts) {
  const take = opts.take ?? LIVE_MAX;
  const min = opts.min ?? CONNECT_MIN;
  const keep = opts.keep || [];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const used = new Set();
  const edges = [];
  const degree = Object.fromEntries(nodes.map((n) => [n.id, 0]));

  const pushEdge = (sid, tid, w, extra) => {
    if (!byId[sid] || !byId[tid] || sid === tid) return false;
    const k = edgeKey(sid, tid);
    if (used.has(k)) return false;
    if (degree[sid] >= DEGREE_MAX || degree[tid] >= DEGREE_MAX) return false;
    used.add(k);
    degree[sid]++;
    degree[tid]++;
    const a = byId[sid];
    const b = byId[tid];
    edges.push({
      source: sid,
      target: tid,
      weight: w,
      stability: extra?.stability ?? 0.4 + 0.3 * w,
      phaseCompatibility:
        extra?.phaseCompatibility ??
        0.45 + 0.5 * cosine(vecFrom(a.affect, DIMS), vecFrom(b.affect, DIMS)),
      type: extra?.type ?? edgeType(a, b),
      status: extra?.status ?? "live",
      previousWeight: extra?.previousWeight ?? w,
    });
    return true;
  };

  for (const e of keep) {
    if (e.status === "trace") continue;
    pushEdge(e.source, e.target, e.weight, e);
  }
  for (const [a, b] of STRUCTURAL) {
    const af = byId[a] && byId[b] ? affinity(byId[a], byId[b], dim, phase) : 0.7;
    pushEdge(a, b, Math.max(0.55, af), { stability: 0.6 });
  }

  const scored = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const af = affinity(nodes[i], nodes[j], dim, phase);
      if (af >= min) scored.push({ a: nodes[i].id, b: nodes[j].id, af });
    }
  }
  scored.sort((x, y) => y.af - x.af);
  for (const s of scored) {
    if (edges.length >= take) break;
    pushEdge(s.a, s.b, s.af);
  }

  const traces = previous
    .filter((e) => e.status === "trace" || (e.previousWeight && e.weight < 0.18))
    .slice(0, 36);
  for (const e of traces) {
    const k = edgeKey(e.source, e.target);
    if (used.has(k)) continue;
    used.add(k);
    edges.push({
      ...e,
      status: "trace",
      weight: Math.min(e.weight, 0.1),
    });
  }
  return edges;
}

function computeField(nodes) {
  const field = new Float32Array(GX * GY);
  const dx = W / (GX - 1);
  const dy = H / (GY - 1);
  let mass = 0;
  let cx = 0;
  let cy = 0;
  for (const n of nodes) {
    const I = n.state.intensity;
    if (I < 0.02) continue;
    mass += I;
    cx += n.x * I;
    cy += n.y * I;
    const sig = n.sigma * (0.7 + 0.6 * I);
    const two = 2 * sig * sig;
    const reach = sig * 3.1;
    const x0 = Math.max(0, Math.floor((n.x - reach) / dx));
    const x1 = Math.min(GX - 1, Math.ceil((n.x + reach) / dx));
    const y0 = Math.max(0, Math.floor((n.y - reach) / dy));
    const y1 = Math.min(GY - 1, Math.ceil((n.y + reach) / dy));
    for (let j = y0; j <= y1; j++) {
      const y = j * dy;
      const yy = y - n.y;
      for (let i = x0; i <= x1; i++) {
        const x = i * dx;
        const xx = x - n.x;
        const d2 = xx * xx + yy * yy;
        field[j * GX + i] += I * Math.exp(-d2 / two);
      }
    }
  }
  if (mass > 0) {
    cx /= mass;
    cy /= mass;
    const I = 0.2;
    const sig = 260;
    const two = 2 * sig * sig;
    for (let j = 0; j < GY; j++) {
      const y = j * dy - cy;
      for (let i = 0; i < GX; i++) {
        const x = i * dx - cx;
        field[j * GX + i] += I * Math.exp(-(x * x + y * y) / two);
      }
    }
  }
  return field;
}

function lerpField(a, b, t) {
  const o = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) o[i] = a[i] + (b[i] - a[i]) * t;
  return o;
}

function fieldMax(field) {
  let m = 0.0001;
  for (let i = 0; i < field.length; i++) if (field[i] > m) m = field[i];
  return m;
}

function lerpEdge(x1, y1, v1, x2, y2, v2, level) {
  const t = (level - v1) / (v2 - v1 || 1e-9);
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

function contoursFrom(field) {
  const dx = W / (GX - 1);
  const dy = H / (GY - 1);
  const mx = fieldMax(field);
  const rings = [];
  for (let t = 2; t <= THRESHOLDS - 2; t++) {
    const level = (t / (THRESHOLDS + 1)) * mx * 0.96;
    const segs = [];
    for (let j = 0; j < GY - 1; j++) {
      for (let i = 0; i < GX - 1; i++) {
        const v00 = field[j * GX + i];
        const v10 = field[j * GX + i + 1];
        const v01 = field[(j + 1) * GX + i];
        const v11 = field[(j + 1) * GX + i + 1];
        const b0 = v00 >= level;
        const b1 = v10 >= level;
        const b2 = v11 >= level;
        const b3 = v01 >= level;
        const idx = (b0 ? 1 : 0) | (b1 ? 2 : 0) | (b2 ? 4 : 0) | (b3 ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * dx;
        const y = j * dy;
        const top = () => lerpEdge(x, y, v00, x + dx, y, v10, level);
        const right = () => lerpEdge(x + dx, y, v10, x + dx, y + dy, v11, level);
        const bot = () => lerpEdge(x, y + dy, v01, x + dx, y + dy, v11, level);
        const left = () => lerpEdge(x, y, v00, x, y + dy, v01, level);
        const pair = (a, b) => segs.push([a(), b()]);
        switch (idx) {
          case 1:
          case 14:
            pair(left, top);
            break;
          case 2:
          case 13:
            pair(top, right);
            break;
          case 3:
          case 12:
            pair(left, right);
            break;
          case 4:
          case 11:
            pair(right, bot);
            break;
          case 6:
          case 9:
            pair(top, bot);
            break;
          case 7:
          case 8:
            pair(left, bot);
            break;
          case 5:
            pair(left, top);
            pair(right, bot);
            break;
          case 10:
            pair(top, right);
            pair(left, bot);
            break;
        }
      }
    }
    rings.push(
      ...stitch(segs)
        .filter((poly) => {
          let minx = 1e9;
          let miny = 1e9;
          let maxx = -1e9;
          let maxy = -1e9;
          for (const p of poly) {
            if (p[0] < minx) minx = p[0];
            if (p[1] < miny) miny = p[1];
            if (p[0] > maxx) maxx = p[0];
            if (p[1] > maxy) maxy = p[1];
          }
          return maxx - minx > 110 && maxy - miny > 90;
        })
        .map((poly) => ({
          d: pathOf(chaikin(poly, 3)),
          k: t,
        })),
    );
  }
  return rings;
}

function near(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy < 2.8;
}

function stitch(segs) {
  const used = new Uint8Array(segs.length);
  const out = [];
  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const poly = [segs[s][0], segs[s][1]];
    let grew = true;
    while (grew) {
      grew = false;
      const head = poly[0];
      const tail = poly[poly.length - 1];
      for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        const [a, b] = segs[i];
        if (near(tail, a)) {
          poly.push(b);
          used[i] = 1;
          grew = true;
          break;
        }
        if (near(tail, b)) {
          poly.push(a);
          used[i] = 1;
          grew = true;
          break;
        }
        if (near(head, a)) {
          poly.unshift(b);
          used[i] = 1;
          grew = true;
          break;
        }
        if (near(head, b)) {
          poly.unshift(a);
          used[i] = 1;
          grew = true;
          break;
        }
      }
    }
    if (poly.length > 10) out.push(poly);
  }
  return out;
}

function chaikin(poly, rounds) {
  let p = poly;
  for (let r = 0; r < rounds; r++) {
    const n = [];
    const closed = near(p[0], p[p.length - 1]);
    const m = p.length - (closed ? 1 : 0);
    for (let i = 0; i < m; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      n.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      n.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    if (closed && n.length) n.push(n[0]);
    p = n;
  }
  return p;
}

function pathOf(poly) {
  if (!poly.length) return "";
  let d = "M" + poly[0][0].toFixed(1) + "," + poly[0][1].toFixed(1);
  for (let i = 1; i < poly.length; i++) {
    d += "L" + poly[i][0].toFixed(1) + "," + poly[i][1].toFixed(1);
  }
  if (near(poly[0], poly[poly.length - 1])) d += "Z";
  return d;
}

function hilo(a, b, bulge) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const c1x = a.x + dx * 0.33 + nx * bulge;
  const c1y = a.y + dy * 0.33 + ny * bulge;
  const c2x = a.x + dx * 0.66 + nx * bulge * 0.35;
  const c2y = a.y + dy * 0.66 + ny * bulge * 0.35;
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
}

function simulate(nodes, edges, ticks, dim, phase) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = edges.filter((e) => e.status !== "trace" && e.weight > 0.08);
  const stateDim = dim || "relation";
  for (const n of nodes) {
    n.vx = 0;
    n.vy = 0;
  }
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 16) d2 = 16;
        const d = Math.sqrt(d2);
        const f = 6200 / d2;
        dx /= d;
        dy /= d;
        a.vx -= dx * f;
        a.vy -= dy * f;
        b.vx += dx * f;
        b.vy += dy * f;
      }
    }
    for (const e of links) {
      const a = byId[e.source];
      const b = byId[e.target];
      if (!a || !b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const rest = 70 + (1 - e.weight) * 120;
      const f = (d - rest) * 0.07 * (0.35 + e.weight);
      dx /= d;
      dy /= d;
      a.vx += dx * f;
      a.vy += dy * f;
      b.vx -= dx * f;
      b.vy -= dy * f;
    }
    const pole = POLES[stateDim] || POLES.relation;
    const sign = phase === 2 ? -1 : 1;
    for (const n of nodes) {
      const pull = (n.affect[stateDim] ?? 0.4) * 0.08 * sign;
      n.vx += (pole.x * W - n.x) * pull;
      n.vy += (pole.y * H - n.y) * pull;
      n.vx += (W / 2 - n.x) * 0.0014;
      n.vy += (H / 2 - n.y) * 0.0014;
      n.vx *= 0.68;
      n.vy *= 0.68;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.min(W - 40, Math.max(40, n.x));
      n.y = Math.min(H - 40, Math.max(40, n.y));
    }
  }
}

function loadHist() {
  try {
    const raw = JSON.parse(localStorage.getItem(HIST_KEY) || "null");
    if (raw && Array.isArray(raw.nodes) && Array.isArray(raw.edges)) return raw;
  } catch {
    /* */
  }
  return null;
}

function saveHist(state) {
  try {
    const slim = {
      desirePhase: state.desirePhase,
      dim: state.dim,
      nodes: state.nodes.map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
        state: n.state,
        affect: n.affect,
        operations: n.operations,
      })),
      edges: state.edges,
      history: (state.history || []).slice(-HIST_MAX),
    };
    localStorage.setItem(HIST_KEY, JSON.stringify(slim));
  } catch {
    /* */
  }
}

function applySnap(nodes, snap) {
  if (!snap?.nodes) return;
  const byId = Object.fromEntries(snap.nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    const s = byId[n.id];
    if (!s) continue;
    n.x = s.x;
    n.y = s.y;
    n.px = s.x;
    n.py = s.y;
    if (s.state) n.state = { ...n.state, ...s.state };
    if (s.affect) n.affect = { ...n.affect, ...s.affect };
    if (s.operations) n.operations = { ...n.operations, ...s.operations };
  }
}

function snapshot(state) {
  return {
    timestamp: Date.now(),
    desirePhase: state.desirePhase,
    dim: state.dim,
    nodes: state.nodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      state: clone(n.state),
      affect: clone(n.affect),
      operations: clone(n.operations),
    })),
    edges: clone(state.edges),
  };
}

function hexSvg() {
  const segs = HEX.map((p, i) => {
    const q = HEX[(i + 1) % HEX.length];
    return `<path class="hex-seg" data-seg="${i}" pathLength="1" d="M${p[0]},${p[1]} L${q[0]},${q[1]}"/>`;
  }).join("");
  const petals = DIMS.map((d, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = 50 + Math.cos(ang) * 11.5;
    const y = 50 + Math.sin(ang) * 11.5;
    const rot = (ang * 180) / Math.PI + 90;
    return `<g class="petal" data-dim="${d}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})">
      <ellipse cx="0" cy="-2.2" rx="4.2" ry="7.4"/>
    </g>`;
  }).join("");
  return `<svg class="hexagrama" viewBox="0 0 100 100" aria-hidden="true">
    <g class="hex-lineas">${segs}</g>
    <g class="flor">${petals}<circle class="flor-cor" cx="50" cy="50" r="3.1"/></g>
  </svg>`;
}

function glyphFor(phase) {
  return ["i", "i", "−1", "−i"][phase % 4];
}

export function mountAfecciones(wrap, opts) {
  const cotas = opts?.cotas || {};
  const onCota = opts?.onCota || (() => {});
  const ir = opts?.ir || ((h) => {
    if (h) location.href = h;
  });

  const nodes = makeNodes(cotas);
  let edges = seedEdges(nodes, "relation");
  const state = {
    nodes,
    edges,
    dim: "relation",
    desirePhase: 0,
    history: [],
    busy: false,
    hover: null,
  };

  const prev = loadHist();
  if (prev) {
    applySnap(nodes, prev);
    const live = Array.isArray(prev.edges) ? prev.edges.filter((e) => e.status !== "trace") : [];
    if (live.length > 0 && live.length <= 150) edges = state.edges = prev.edges;
    else edges = state.edges = seedEdges(nodes, prev.dim || "relation");
    state.desirePhase = prev.desirePhase || 0;
    state.dim = prev.dim || "relation";
    state.history = prev.history || [];
  }

  wrap.innerHTML = `
    <svg class="campo" viewBox="0 0 ${W} ${H}" role="img" aria-label="">
      <g class="curvas"></g>
      <g class="hilos"></g>
      <g class="nodos"></g>
      <g class="raiz-g">
        <circle class="raiz-hit" r="22"/>
        <text class="raiz" text-anchor="middle" dy="6">${glyphFor(state.desirePhase)}</text>
      </g>
    </svg>
    <div class="hex-layer" data-hex>
      ${hexSvg()}
    </div>
    <p class="nodo-cifra" data-cifra hidden></p>`;

  const svg = wrap.querySelector(".campo");
  const gCurvas = wrap.querySelector(".curvas");
  const gHilos = wrap.querySelector(".hilos");
  const gNodos = wrap.querySelector(".nodos");
  const raiz = wrap.querySelector(".raiz-g");
  const raizTxt = wrap.querySelector(".raiz");
  const hexLayer = wrap.querySelector("[data-hex]");
  const cifra = wrap.querySelector("[data-cifra]");
  const leyenda = wrap.closest(".pagina-cotas")?.querySelector("[data-deseo]");

  let fieldNow = computeField(nodes);
  let drift = 0;
  let driftRaf = 0;
  let alive = true;

  function placeRaiz() {
    const t = drift;
    const x = 180 + (Math.sin(t * 0.41) * 0.5 + 0.5) * 1040;
    const y = 160 + (Math.cos(t * 0.27) * 0.5 + 0.5) * 540;
    raiz.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }

  function driftLoop(ts) {
    if (!alive) return;
    if (!state.busy) {
      drift += 0.0032;
      placeRaiz();
    }
    driftRaf = requestAnimationFrame(driftLoop);
    void ts;
  }

  function paintCurvas(rings) {
    const existing = [...gCurvas.querySelectorAll("path")];
    const n = Math.max(existing.length, rings.length);
    for (let i = 0; i < n; i++) {
      let p = existing[i];
      if (!p) {
        p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("class", "cota-curva");
        gCurvas.appendChild(p);
      }
      if (!rings[i]) {
        p.remove();
        continue;
      }
      p.setAttribute("d", rings[i].d);
      p.setAttribute("data-k", String(rings[i].k));
      p.style.strokeWidth = String(0.55 + rings[i].k * 0.085);
      p.style.opacity = String(0.28 + rings[i].k * 0.035);
    }
  }

  function paintHilos() {
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    gHilos.innerHTML = edges
      .map((e) => {
        const a = byId[e.source];
        const b = byId[e.target];
        if (!a || !b) return "";
        const traza = e.status === "trace" || e.weight < TRACE_KEEP;
        const w = traza ? 0.7 : 0.7 + e.weight * 1.7;
        const bulge =
          (hash01((a.n || 1) + (b.n || 2), 4) - 0.5) * Math.min(90, Math.hypot(a.x - b.x, a.y - b.y) * 0.22);
        const hi =
          state.hover && (e.source === state.hover || e.target === state.hover);
        const cls = "hilo" + (traza ? " traza" : " vivo") + (hi ? " foco" : "");
        return `<path class="${cls}" d="${hilo(a, b, bulge)}" stroke-width="${w.toFixed(2)}" data-k="${edgeKey(e.source, e.target)}"/>`;
      })
      .join("");
  }

  function paintNodos() {
    gNodos.innerHTML = nodes
      .map((n) => {
        const r = 2.2 + n.state.intensity * 3.4;
        const cls =
          "nodo" +
          (n.conceptual ? " concepto" : n.occupied ? " ocupada" : " vacio") +
          (state.hover === n.id ? " foco" : "");
        const href = n.href || "#";
        const num = n.n ? `<text class="num" x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" text-anchor="middle" dy="-9">${n.n}</text>` : "";
        const nom =
          n.conceptual || (n.label && n.occupied)
            ? `<text class="nom" x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" text-anchor="middle" dy="${n.n ? 16 : -8}">${n.label}</text>`
            : "";
        return `<a href="${href}" data-id="${n.id}" data-cota="${n.n || ""}" class="${cls}">
          <circle class="hit" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="18"/>
          <circle class="dot" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${r.toFixed(1)}"/>
          ${num}${nom}
        </a>`;
      })
      .join("");
  }

  function paint(field) {
    paintCurvas(contoursFrom(field || fieldNow));
    paintHilos();
    paintNodos();
    raizTxt.textContent = glyphFor(state.desirePhase);
    hexLayer.querySelectorAll(".petal").forEach((p) => {
      p.classList.toggle("on", p.getAttribute("data-dim") === state.dim);
    });
  }

  function showCifra(n, evt) {
    if (!cifra || !n) {
      if (cifra) cifra.hidden = true;
      return;
    }
    cifra.hidden = false;
    cifra.textContent = n.state.intensity.toFixed(2) + "  " + n.state.potential.toFixed(2);
    if (evt) {
      cifra.style.left = evt.clientX + 10 + "px";
      cifra.style.top = evt.clientY - 18 + "px";
    }
  }

  function setHex(mode) {
    hexLayer.classList.remove("debil", "activo", "off");
    hexLayer.classList.add(mode);
  }

  function animateSeg(i, on) {
    const p = hexLayer.querySelector(`.hex-seg[data-seg="${i}"]`);
    if (p) p.classList.toggle("drawn", on);
  }

  async function wait(ms) {
    const t = reduced() ? Math.min(70, ms * 0.12) : ms;
    await new Promise((r) => setTimeout(r, t));
  }

  function activateLatent() {
    const v = state.dim;
    for (const n of nodes) {
      const a = n.affect[v] ?? 0.4;
      const boost = n.state.potential * (0.25 + 0.75 * a);
      n.state.intensity = clamp01(n.state.intensity * 0.62 + boost);
      n.state.actual = clamp01(n.state.actual * 0.9 + boost * 0.18);
      n.sigma = (n.conceptual ? 50 : n.occupied ? 72 : 40) * (0.75 + 0.55 * n.state.intensity);
    }
  }

  function calculateAffinities() {
    state._aff = new Map();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const af = affinity(nodes[i], nodes[j], state.dim, state.desirePhase);
        state._aff.set(edgeKey(nodes[i].id, nodes[j].id), af);
      }
    }
  }

  function weakenOld() {
    for (const e of edges) {
      const pc = phaseCompat(e, state.desirePhase);
      e.previousWeight = e.weight;
      e.weight *= pc;
      if (e.weight < 0.16) {
        e.status = "trace";
        e.weight = Math.max(0.04, e.weight);
      }
    }
  }

  function createEmergent() {
    const previous = edges;
    edges = rewire(nodes, state.dim, state.desirePhase, previous, {
      keep: previous.filter((e) => e.status === "live" && e.weight >= 0.2).slice(0, 24),
      take: LIVE_MAX,
      min: CONNECT_MIN,
    });
    state.edges = edges;
  }

  function stabilizeGraph() {
    for (const n of nodes) {
      n.state.intensity = clamp01(n.state.intensity * 0.86 + n.state.actual * 0.14);
      n.px = n.x;
      n.py = n.y;
    }
    for (const e of edges) {
      if (e.status === "trace" && e.weight < 0.03) e.weight = 0.03;
    }
  }

  async function morphTo(oldPos, oldField, duration) {
    const dur = reduced() ? 180 : duration;
    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        if (!alive) return resolve();
        const t = Math.min(1, (now - t0) / dur);
        const k = ease(t);
        for (const n of nodes) {
          const o = oldPos[n.id];
          if (!o) continue;
          n.x = o.x + (n._tx - o.x) * k;
          n.y = o.y + (n._ty - o.y) * k;
        }
        fieldNow = lerpField(oldField, computeField(nodes), k);
        paint(fieldNow);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  async function redistribute() {
    const oldPos = Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    const oldField = fieldNow;
    simulate(nodes, edges, reduced() ? 90 : 220, state.dim, state.desirePhase);
    for (const n of nodes) {
      n._tx = n.x;
      n._ty = n.y;
      n.x = oldPos[n.id].x;
      n.y = oldPos[n.id].y;
    }
    await morphTo(oldPos, oldField, 1500);
    for (const n of nodes) {
      n.x = n._tx;
      n.y = n._ty;
    }
    fieldNow = computeField(nodes);
    paint(fieldNow);
  }

  async function executeDesire() {
    if (state.busy) return;
    state.busy = true;
    document.documentElement.setAttribute("data-deseo", "1");
    wrap.classList.add("deseando");
    state.history.push(snapshot(state));
    if (state.history.length > HIST_MAX) state.history.shift();
    setHex("activo");
    for (let i = 0; i < 6; i++) animateSeg(i, false);

    const stages = [
      [0, activateLatent],
      [1, calculateAffinities],
      [2, weakenOld],
      [3, createEmergent],
      [4, redistribute],
      [5, stabilizeGraph],
    ];

    for (const [i, fn] of stages) {
      animateSeg(i, true);
      const out = fn();
      if (out && typeof out.then === "function") await out;
      else {
        fieldNow = computeField(nodes);
        paint(fieldNow);
        await wait(i === 4 ? 80 : 420);
      }
    }

    state.desirePhase = (state.desirePhase + 1) % 4;
    raizTxt.textContent = glyphFor(state.desirePhase);
    saveHist(state);
    await wait(420);
    setHex("off");
    wrap.classList.remove("deseando");
    document.documentElement.removeAttribute("data-deseo");
    if (leyenda) leyenda.hidden = true;
    state.busy = false;
    paint(fieldNow);
  }

  const onOver = (e) => {
    const g = e.target.closest(".raiz-g");
    if (g) {
      if (leyenda) leyenda.hidden = false;
      if (!state.busy) setHex("debil");
    }
    const a = e.target.closest("a.nodo");
    if (a) {
      const id = a.getAttribute("data-id");
      state.hover = id;
      paintHilos();
      const n = nodes.find((x) => x.id === id);
      showCifra(n, e);
      a.classList.add("foco");
    }
  };

  const onOut = (e) => {
    if (e.target.closest(".raiz-g") && !e.relatedTarget?.closest?.(".raiz-g")) {
      if (leyenda) leyenda.hidden = true;
      if (!state.busy) setHex("off");
    }
    const a = e.target.closest("a.nodo");
    if (a && !a.contains(e.relatedTarget)) {
      state.hover = null;
      paintHilos();
      if (cifra) cifra.hidden = true;
      a.classList.remove("foco");
    }
  };

  const onMove = (e) => {
    if (state.hover && cifra && !cifra.hidden) {
      cifra.style.left = e.clientX + 10 + "px";
      cifra.style.top = e.clientY - 18 + "px";
    }
  };

  const onClick = (e) => {
    const petal = e.target.closest(".petal");
    if (petal) {
      e.preventDefault();
      e.stopPropagation();
      state.dim = petal.getAttribute("data-dim") || "relation";
      hexLayer.querySelectorAll(".petal").forEach((p) => {
        p.classList.toggle("on", p.getAttribute("data-dim") === state.dim);
      });
      return;
    }
    if (e.target.closest(".raiz-g")) {
      e.preventDefault();
      e.stopPropagation();
      executeDesire();
      return;
    }
    const a = e.target.closest("a.nodo");
    if (!a) return;
    if (state.busy) {
      e.preventDefault();
      return;
    }
    const n = a.getAttribute("data-cota");
    if (n) onCota(n);
    const href = a.getAttribute("href");
    if (href && href !== "#") {
      e.preventDefault();
      ir(href);
    } else {
      e.preventDefault();
    }
  };

  wrap.addEventListener("pointerover", onOver);
  wrap.addEventListener("pointerout", onOut);
  wrap.addEventListener("pointermove", onMove);
  wrap.addEventListener("click", onClick);

  setHex("off");
  placeRaiz();
  paint(fieldNow);
  driftRaf = requestAnimationFrame(driftLoop);

  return () => {
    alive = false;
    cancelAnimationFrame(driftRaf);
    wrap.removeEventListener("pointerover", onOver);
    wrap.removeEventListener("pointerout", onOut);
    wrap.removeEventListener("pointermove", onMove);
    wrap.removeEventListener("click", onClick);
    document.documentElement.removeAttribute("data-deseo");
  };
}
