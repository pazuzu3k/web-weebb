// @ts-nocheck
const STUB_KEY = "smioochy-presencia-stub";
const SESION_KEY = "smioochy-sesion";
const CHANNEL = "smioochy-presencia";

function sesion() {
  try {
    let id = localStorage.getItem(SESION_KEY);
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        "s" + Math.floor(Date.now() / 1000) + "-" + Math.floor(performance.now());
      localStorage.setItem(SESION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function setMode(mode) {
  document.documentElement.setAttribute("data-presence-mode", mode);
  let tag = document.querySelector(".presencia-stub");
  if (mode === "stub") {
    if (!tag) {
      tag = document.createElement("div");
      tag.className = "presencia-stub";
      tag.textContent = "presencia.stub";
      document.body.appendChild(tag);
    }
  } else if (tag) {
    tag.remove();
  }
}

function stubStart(path) {
  setMode("stub");
  const id = sesion();
  const now = () => Date.now();
  const write = () => {
    let table = {};
    try {
      table = JSON.parse(localStorage.getItem(STUB_KEY) || "{}");
    } catch {
      table = {};
    }
    table[id] = { path, t: now() };
    const cut = now() - 45000;
    for (const k of Object.keys(table)) {
      if (!table[k] || table[k].t < cut) delete table[k];
    }
    try {
      localStorage.setItem(STUB_KEY, JSON.stringify(table));
    } catch {
      /* quota */
    }
    return Object.keys(table).filter((k) => table[k].path === path).length;
  };
  write();
  let ch = null;
  try {
    ch = new BroadcastChannel(CHANNEL);
    ch.postMessage({ path, id });
  } catch {
    ch = null;
  }
  const tick = setInterval(() => {
    write();
    try {
      ch?.postMessage({ path, id });
    } catch {
      /* closed */
    }
  }, 12000);
  return () => {
    clearInterval(tick);
    try {
      ch?.close();
    } catch {
      /* */
    }
  };
}

async function apiStart(path) {
  const id = sesion();
  const beat = async () => {
    const res = await fetch("/api/presencia", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionKey: id, path }),
    });
    if (!res.ok) throw new Error("presencia");
    return res.json();
  };
  await beat();
  setMode("api");
  const tick = setInterval(() => {
    beat().catch(() => {});
  }, 16000);
  return () => clearInterval(tick);
}

/**
 * live (supabase) → api (host) → stub
 * never invents visitors
 */
export function startPresence(path) {
  const cfg =
    (typeof window !== "undefined" && window.SMIOOCHY) || {
      supabaseUrl: "",
      supabaseAnonKey: "",
    };
  if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
    setMode("live");
    return apiStart(path).catch(() => stubStart(path));
  }
  return apiStart(path).catch(() => stubStart(path));
}
