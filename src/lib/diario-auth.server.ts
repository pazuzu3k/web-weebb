import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const CUENTAS = [
  {
    user: "s1ento54",
    salt: "3ac867d54d582c412f1b5c1cbb777fab",
    hash: "507941b0c4f917ea15250e7e0c94cba8f4df4c06b0b852e5fecc00974ab0bc4d",
  },
  {
    user: "pazuzu",
    salt: "b6fc3e1581782cb69aae2d8b35a3a3a6",
    hash: "98dee7b2d9c43cbd59bb002ec102395a194bc9d8ce512812d7e5bdcd1e8f7daf",
  },
];
const SECRET = "9af28b3143333d0f2a03c0d71f2f23015830e16a9a2c6b62f781b2ffff34f632";
const COOKIE = "smioochy_sesion";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(body: string) {
  return createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function credencialesValidas(user: string, pass: string) {
  const cuenta = CUENTAS.find((c) => c.user === user);
  if (!cuenta) return false;
  const got = scryptSync(pass, cuenta.salt, 32);
  const want = Buffer.from(cuenta.hash, "hex");
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

export function esHttps(request: Request) {
  const proto = request.headers.get("x-forwarded-proto") || "";
  return proto.split(",")[0]?.trim() === "https" || request.url.startsWith("https:");
}

export function cookieSesion(user: string, secure: boolean) {
  const exp = Date.now() + MAX_AGE * 1000;
  const body = Buffer.from(JSON.stringify({ u: user, exp })).toString("base64url");
  const token = `${body}.${sign(body)}`;
  const parts = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function cookieCerrar(secure: boolean) {
  const parts = [`${COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function leerSesion(request: Request): string | null {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(/(?:^|;\s*)smioochy_sesion=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1] || "");
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expect = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      u?: string;
      exp?: number;
    };
    if (!CUENTAS.some((c) => c.user === data.u)) return null;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return data.u || null;
  } catch {
    return null;
  }
}

export function sesionUsuario(request: Request) {
  return leerSesion(request);
}

export function sesionActiva(request: Request) {
  return leerSesion(request) !== null;
}
