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

export async function listDiario(): Promise<DiarioEntrada[]> {
  const sql = await getSql();
  const rows = await sql.query<{
    id: number;
    texto: string;
    created_at: string;
  }>(
    `select id, texto, created_at::text as created_at
       from diario_entradas
      order by created_at desc
      limit 80`,
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
    texto: r.texto,
    createdAt: r.created_at,
    archivos: by[r.id] || [],
  }));
}

export async function crearDiario(input: {
  texto: string;
  archivos: { mime: string; nombre: string; bytes: Uint8Array }[];
}): Promise<DiarioEntrada> {
  const texto = String(input.texto || "").slice(0, MAX_TEXTO);
  const incoming = (input.archivos || []).slice(0, MAX_FILES);
  const archivos = incoming.filter((a) => {
    const kind = ALLOWED[a.mime];
    return kind && a.bytes && a.bytes.byteLength > 0 && a.bytes.byteLength <= MAX_BYTES;
  });
  if (!texto.trim() && archivos.length === 0) {
    throw new Error("vacio");
  }
  const sql = await getSql();
  const inserted = await sql.query<{ id: number; texto: string; created_at: string }>(
    `insert into diario_entradas (texto) values ($1)
     returning id, texto, created_at::text as created_at`,
    [texto],
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
