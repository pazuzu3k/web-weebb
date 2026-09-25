import { getSql } from "@/lib/db";

const MAX_TEXTO = 20000;
const MAX_FILES = 6;
const MAX_BYTES = 4.5 * 1024 * 1024;
const ALLOWED: Record<string, "imagen" | "pdf"> = {
  "image/jpeg": "imagen",
  "image/jpg": "imagen",
  "image/png": "imagen",
  "image/webp": "imagen",
  "image/gif": "imagen",
  "application/pdf": "pdf",
};

export type DiarioArchivoMeta = {
  id: number;
  kind: string;
  mime: string;
  nombre: string;
};

export type DiarioEntrada = {
  id: number;
  titulo: string;
  texto: string;
  createdAt: string;
  archivos: DiarioArchivoMeta[];
};

function asBytes(v: unknown): Uint8Array {
  if (v instanceof Uint8Array) return v;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(v)) {
    return new Uint8Array(v);
  }
  if (typeof v === "string") {
    if (v.startsWith("\\x")) {
      const hex = v.slice(2);
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      }
      return out;
    }
    try {
      const bin = atob(v);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    } catch {
      return new Uint8Array();
    }
  }
  if (Array.isArray(v)) return Uint8Array.from(v as number[]);
  if (v && typeof v === "object" && "data" in (v as { data?: unknown })) {
    const d = (v as { data: unknown }).data;
    if (Array.isArray(d)) return Uint8Array.from(d as number[]);
  }
  return new Uint8Array();
}

const LUGARES = new Set(["peldano-55", "ventana-b", "ventana-e"]);

export function lugarDe(v: unknown) {
  const s = String(v || "peldano-55");
  return LUGARES.has(s) ? s : "peldano-55";
}

export async function listDiario(lugar = "peldano-55"): Promise<DiarioEntrada[]> {
  const sitio = lugarDe(lugar);
  const sql = await getSql();
  const rows = await sql.query<{
    id: number;
    titulo: string;
    texto: string;
    created_at: string;
  }>(
    `select id, titulo, texto, created_at::text as created_at
       from diario_entradas
      where lugar = $1
      order by created_at desc
      limit 80`,
    [sitio],
  );
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const files = await sql.query<{
    id: number;
    entrada_id: number;
    kind: string;
    mime: string;
    nombre: string;
  }>(
    `select id, entrada_id, kind, mime, nombre
       from diario_archivos
      where entrada_id in (${placeholders})
      order by id asc`,
    ids,
  );
  const by: Record<number, DiarioArchivoMeta[]> = {};
  for (const f of files) {
    (by[f.entrada_id] ||= []).push({
      id: f.id,
      kind: f.kind,
      mime: f.mime,
      nombre: f.nombre,
    });
  }
  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo || "",
    texto: r.texto,
    createdAt: r.created_at,
    archivos: by[r.id] || [],
  }));
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"]/g, (ch) => {
    if (ch === "&") return "\u0026amp;";
    if (ch === "<") return "\u0026lt;";
    if (ch === ">") return "\u0026gt;";
    return "\u0026quot;";
  });
}

export function sanearTexto(input: string) {
  const src = String(input || "").slice(0, MAX_TEXTO);
  const re = /<\/?([a-zA-Z0-9]+)(\s[^<>]*)?\/?>|([^<]+)|</g;
  let out = "";
  let m: RegExpExecArray | null;
  const open: string[] = [];
  const spanStack: string[][] = [];
  const map: Record<string, string> = {
    b: "strong",
    strong: "strong",
    i: "em",
    em: "em",
    u: "u",
    s: "s",
    strike: "s",
    del: "s",
  };
  while ((m = re.exec(src))) {
    if (m[3] != null) {
      out += escapeHtml(m[3]);
      continue;
    }
    if (!m[1]) {
      out += "\u0026lt;";
      continue;
    }
    const name = m[1].toLowerCase();
    const closing = m[0].startsWith("</");
    const attrs = (m[2] || "").toLowerCase();
    if (name === "br") {
      if (!closing) out += "<br>";
      continue;
    }
    if (name === "p" || name === "div" || name === "li") {
      if (closing) out += "<br>";
      continue;
    }
    if (name === "span") {
      if (!closing) {
        const wraps: string[] = [];
        if (/font-weight:\s*(bold|[6-9]00)/.test(attrs)) wraps.push("strong");
        if (/font-style:\s*italic/.test(attrs)) wraps.push("em");
        if (/text-decoration:[^;"]*underline/.test(attrs)) wraps.push("u");
        spanStack.push(wraps);
        wraps.forEach((t) => {
          open.push(t);
          out += "<" + t + ">";
        });
      } else {
        const wraps = spanStack.pop() || [];
        for (let i = wraps.length - 1; i >= 0; i--) {
          const t = wraps[i];
          const j = open.lastIndexOf(t);
          if (j >= 0) {
            open.splice(j, 1);
            out += "</" + t + ">";
          }
        }
      }
      continue;
    }
    const tag = map[name];
    if (!tag) continue;
    if (closing) {
      const j = open.lastIndexOf(tag);
      if (j >= 0) {
        open.splice(j, 1);
        out += "</" + tag + ">";
      }
    } else if (!m[0].endsWith("/>")) {
      open.push(tag);
      out += "<" + tag + ">";
    }
  }
  while (open.length) out += "</" + open.pop() + ">";
  return out.replace(/(?:<br>\s*){3,}/g, "<br><br>").replace(/^(?:<br>\s*)+|(?:<br>\s*)+$/g, "");
}

function textoPlano(html: string) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\u0026nbsp;/gi, " ")
    .replace(/\u0026amp;/g, "&")
    .replace(/\u0026lt;/g, "<")
    .replace(/\u0026gt;/g, ">")
    .replace(/\u0026quot;/g, '"')
    .trim();
}

export async function crearDiario(input: {
  titulo?: string;
  texto: string;
  lugar?: string;
  archivos: { mime: string; nombre: string; bytes: Uint8Array }[];
}): Promise<DiarioEntrada> {
  const titulo = String(input.titulo || "").trim().slice(0, 80);
  const texto = sanearTexto(input.texto || "");
  const lugar = lugarDe(input.lugar);
  const incoming = (input.archivos || []).slice(0, MAX_FILES);
  const archivos = incoming.filter((a) => {
    const kind = ALLOWED[a.mime];
    return kind && a.bytes && a.bytes.byteLength > 0 && a.bytes.byteLength <= MAX_BYTES;
  });
  if (!titulo && !textoPlano(texto) && archivos.length === 0) {
    throw new Error("vacio");
  }
  const sql = await getSql();
  const inserted = await sql.query<{
    id: number;
    titulo: string;
    texto: string;
    created_at: string;
  }>(
    `insert into diario_entradas (titulo, texto, lugar) values ($1, $2, $3)
     returning id, titulo, texto, created_at::text as created_at`,
    [titulo, texto, lugar],
  );
  const row = inserted[0];
  if (!row) throw new Error("insert");
  const metas: DiarioArchivoMeta[] = [];
  for (const a of archivos) {
    const kind = ALLOWED[a.mime];
    const nombre = (a.nombre || "adjunto").replace(/[^\w.\-áéíóúñ ]/gi, "").slice(0, 80) || "adjunto";
    const saved = await sql.query<{ id: number }>(
      `insert into diario_archivos (entrada_id, kind, mime, nombre, bytes)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [row.id, kind, a.mime, nombre, Buffer.from(a.bytes)],
    );
    if (saved[0]) {
      metas.push({
        id: saved[0].id,
        kind,
        mime: a.mime,
        nombre,
      });
    }
  }
  return {
    id: row.id,
    titulo: row.titulo || "",
    texto: row.texto,
    createdAt: row.created_at,
    archivos: metas,
  };
}

export async function getArchivo(id: number): Promise<{
  bytes: Uint8Array;
  mime: string;
  nombre: string;
} | null> {
  if (!id || id < 1) return null;
  const sql = await getSql();
  const rows = await sql.query<{
    bytes: unknown;
    mime: string;
    nombre: string;
  }>(`select bytes, mime, nombre from diario_archivos where id = $1`, [id]);
  const r = rows[0];
  if (!r) return null;
  return {
    bytes: asBytes(r.bytes),
    mime: r.mime || "application/octet-stream",
    nombre: r.nombre || "adjunto",
  };
}

export async function hayPreliminar(): Promise<boolean> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ id: number }>(
      `select id from diario_preliminar where id = 1`,
    );
    return Boolean(rows[0]);
  } catch {
    return false;
  }
}

export async function guardarPreliminar(input: {
  mime: string;
  nombre: string;
  bytes: Uint8Array;
}): Promise<boolean> {
  if (input.mime !== "application/pdf") return false;
  if (!input.bytes?.byteLength || input.bytes.byteLength > MAX_BYTES) return false;
  const nombre =
    (input.nombre || "exceso.pdf").replace(/[^\w.\-áéíóúñ ]/gi, "").slice(0, 80) ||
    "exceso.pdf";
  const sql = await getSql();
  await sql.query(
    `insert into diario_preliminar (id, mime, nombre, bytes)
     values (1, $1, $2, $3)
     on conflict (id) do update
       set mime = excluded.mime, nombre = excluded.nombre, bytes = excluded.bytes`,
    [input.mime, nombre, Buffer.from(input.bytes)],
  );
  return true;
}

export async function getPreliminar(): Promise<{
  bytes: Uint8Array;
  mime: string;
  nombre: string;
} | null> {
  const sql = await getSql();
  const rows = await sql.query<{ bytes: unknown; mime: string; nombre: string }>(
    `select bytes, mime, nombre from diario_preliminar where id = 1`,
  );
  const r = rows[0];
  if (!r) return null;
  return {
    bytes: asBytes(r.bytes),
    mime: r.mime || "application/pdf",
    nombre: r.nombre || "exceso.pdf",
  };
}

export async function editarDiario(
  id: number,
  input: { titulo?: string; texto?: string },
): Promise<{ id: number; titulo: string; texto: string } | null> {
  if (!id || id < 1) return null;
  const titulo = String(input.titulo || "").trim().slice(0, 80);
  const texto = sanearTexto(input.texto || "");
  const sql = await getSql();
  const rows = await sql.query<{ id: number; titulo: string; texto: string }>(
    `update diario_entradas
        set titulo = $2, texto = $3
      where id = $1
      returning id, titulo, texto`,
    [id, titulo, texto],
  );
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, titulo: row.titulo || "", texto: row.texto };
}

export async function borrarDiario(id: number): Promise<boolean> {
  if (!id || id < 1) return false;
  const sql = await getSql();
  await sql.query(`delete from diario_archivos where entrada_id = $1`, [id]);
  const rows = await sql.query<{ id: number }>(
    `delete from diario_entradas where id = $1 returning id`,
    [id],
  );
  return Boolean(rows[0]);
}
