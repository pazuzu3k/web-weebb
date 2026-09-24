import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const USER = "s1ento54";
const SALT = "3ac867d54d582c412f1b5c1cbb777fab";
const HASH = "507941b0c4f917ea15250e7e0c94cba8f4df4c06b0b852e5fecc00974ab0bc4d";
const SECRET = "9af28b3143333d0f2a03c0d71f2f23015830e16a9a2c6b62f781b2ffff34f632";
const COOKIE = "smioochy_sesion";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(body: string) {
  return createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function credencialesValidas(user: string, pass: string) {
  if (user !== USER) return false;
  const got = scryptSync(pass, SALT, 32);
  const want = Buffer.from(HASH, "hex");
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

export function esHttps(request: Request) {
  const proto = request.headers.get("x-forwarded-proto") || "";
  return proto.split(",")[0]?.trim() === "https" || request.url.startsWith("https:");
}

export function cookieSesion(secure: boolean) {
  const exp = Date.now() + MAX_AGE * 1000;
  const body = Buffer.from(JSON.stringify({ u: USER, exp })).toString("base64url");
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

export function sesionActiva(request: Request) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(/(?:^|;\s*)smioochy_sesion=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1] || "");
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expect = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      u?: string;
      exp?: number;
    };
    return data.u === USER && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
