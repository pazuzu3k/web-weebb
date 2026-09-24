import { getSql } from "@/lib/db";

function cleanPath(path: string): string {
  const p = (path || "/").trim() || "/";
  return p.slice(0, 240);
}

export async function bumpPageview(path: string): Promise<number> {
  try {
    const sql = await getSql();
    const p = cleanPath(path);
    const rows = await sql.query<{ n: number }>(
      `insert into pageviews (path, n) values ($1, 1)
       on conflict (path) do update set n = pageviews.n + 1
       returning n`,
      [p],
    );
    return rows[0]?.n ?? 1;
  } catch {
    return 0;
  }
}

export async function getPageview(path: string): Promise<number> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ n: number }>(
      `select n from pageviews where path = $1`,
      [cleanPath(path)],
    );
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function heartbeat(
  sessionKey: string,
  path: string,
): Promise<void> {
  try {
    const sql = await getSql();
    const key = (sessionKey || "").slice(0, 80);
    if (!key) return;
    await sql.query(
      `insert into presence_heartbeats (session_key, path, seen_at)
       values ($1, $2, now())
       on conflict (session_key, path) do update set seen_at = now()`,
      [key, cleanPath(path)],
    );
  } catch {
    /* db optional */
  }
}

export async function countPresence(path: string): Promise<number> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ n: number }>(
      `select count(*)::int as n
         from presence_heartbeats
        where path = $1
          and seen_at > now() - interval '45 seconds'`,
      [cleanPath(path)],
    );
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

const DIARIO_SESION = "diario-sesion";

export async function marcarSesionDiario(user: string): Promise<void> {
  await heartbeat(user, DIARIO_SESION);
}

export async function soltarSesionDiario(user: string): Promise<void> {
  try {
    const sql = await getSql();
    await sql.query(
      `delete from presence_heartbeats where session_key = $1 and path = $2`,
      [user.slice(0, 80), DIARIO_SESION],
    );
  } catch {
    /* db optional */
  }
}

export async function hayOtraSesionDiario(user: string): Promise<boolean> {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ n: number }>(
      `select count(*)::int as n
         from presence_heartbeats
        where path = $1
          and session_key <> $2
          and seen_at > now() - interval '25 seconds'`,
      [DIARIO_SESION, user.slice(0, 80)],
    );
    return (rows[0]?.n ?? 0) > 0;
  } catch {
    return false;
  }
}
