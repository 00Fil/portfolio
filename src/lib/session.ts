import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

const COOKIE = "session";
const DAYS = 14;

/** Un cliente con accesso all'area riservata. Si configura in CLIENT_USERS (JSON), la password è salvata come hash scrypt. */
export type Client = {
  email: string;
  name: string;
  hash: string;
  project?: string;
  /** Fase attuale, da 0 a 4 (Capire, Progettare, Costruire, Rilasciare, Mantenere). */
  phase?: number;
  /** Avanzamento complessivo, da 0 a 100. */
  progress?: number;
  /** Indirizzo della versione in lavorazione da provare, con il suo numero e la data. */
  preview?: string;
  version?: string;
  /** Data dell'ultimo aggiornamento (ISO, es. "2026-11-08"). */
  updated?: string;
  /** Prossimo traguardo. */
  next?: { label: string; date?: string };
  /** Diario del progetto, dal più recente. */
  updates?: { date: string; text: string }[];
  /** Preventivo, contratto, fatture, manuali. */
  docs?: { label: string; url: string; meta?: string }[];
};

export type Session = { email: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 32 ? new TextEncoder().encode(s) : null;
}

export function authReady() {
  return !!secret() && clients().length > 0;
}

export function clients(): Client[] {
  try {
    const v = JSON.parse(process.env.CLIENT_USERS || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function findClient(email: string) {
  return clients().find((c) => c.email.toLowerCase() === email.toLowerCase());
}

/** hash nel formato "scrypt:<sale hex>:<chiave hex>" */
export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, saltHex, keyHex] = stored.split(":");
  if (alg !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scrypt(pw, Buffer.from(saltHex, "hex"), 64);
  const want = Buffer.from(keyHex, "hex");
  return want.length === key.length && timingSafeEqual(want, key);
}

export async function createSession(s: Session) {
  const k = secret();
  if (!k) throw new Error("AUTH_SECRET mancante");
  const expires = new Date(Date.now() + DAYS * 864e5);
  const token = await new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expires).sign(k);
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}

export async function readSession(): Promise<Session | null> {
  const k = secret();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!k || !token) return null;
  try {
    const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
    return { email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}

/* Tentativi di accesso: al massimo 5 ogni 10 minuti per indirizzo, in memoria. */
const tries = new Map<string, number[]>();
export function rateLimited(key: string) {
  const now = Date.now();
  const list = (tries.get(key) ?? []).filter((t) => now - t < 10 * 60e3);
  list.push(now);
  tries.set(key, list);
  return list.length > 5;
}
