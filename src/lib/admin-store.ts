import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

/**
 * Dati del pannello: un file JSON per cosa, in DATA_DIR (di default .data nella cartella del progetto).
 * Su Dokploy la cartella va montata su un volume, altrimenti si perde a ogni deploy.
 */
export const DATA_DIR = process.env.DATA_DIR || (fs.existsSync("/app/data") ? "/app/data" : path.join(process.cwd(), ".data"));
const f = (n: string) => path.join(DATA_DIR, n);

function read<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(f(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}
function write(name: string, v: unknown, exclusive = false) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = f(`${name}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(v, null, 2), { mode: 0o600 });
  if (exclusive) {
    try {
      fs.linkSync(tmp, f(name)); // fallisce se esiste gia': una sola registrazione
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  } else fs.renameSync(tmp, f(name));
}

/* ---- admin: uno solo, creato alla prima visita ---- */
type Admin = { user: string; hash: string; secret: string; created: string };
const admin = () => read<Admin | null>("admin.json", null);
export const adminExists = () => !!admin();

const hash = (pw: string) => {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const check = (pw: string, stored: string) => {
  const [alg, s, k] = stored.split(":");
  if (alg !== "scrypt" || !s || !k) return false;
  const key = scryptSync(pw, Buffer.from(s, "hex"), 64);
  const want = Buffer.from(k, "hex");
  return want.length === key.length && timingSafeEqual(want, key);
};

/** Crea l'unico admin. Restituisce false se esiste gia'. */
export function createAdmin(user: string, password: string) {
  if (adminExists()) return false;
  try {
    write("admin.json", { user, hash: hash(password), secret: randomBytes(32).toString("hex"), created: new Date().toISOString() } satisfies Admin, true);
    return true;
  } catch {
    return false;
  }
}

export function verifyAdmin(user: string, password: string) {
  const a = admin();
  const same = !!a && a.user.toLowerCase() === user.trim().toLowerCase();
  // stesso lavoro anche se l'utente non c'e'
  const ok = check(password, same ? a!.hash : "scrypt:00:00");
  return same && ok;
}

export const ADMIN_COOKIE = "admin";
const DAYS = 30;

export async function signAdminToken() {
  const a = admin();
  if (!a) throw new Error("nessun admin");
  return new SignJWT({ admin: true, u: a.user }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${DAYS}d`).sign(Buffer.from(a.secret, "hex"));
}
export const ADMIN_MAX_AGE = DAYS * 86400;

export async function verifyAdminToken(token?: string) {
  const a = admin();
  if (!a || !token) return false;
  try {
    const { payload } = await jwtVerify(token, Buffer.from(a.secret, "hex"), { algorithms: ["HS256"] });
    return payload.admin === true && payload.u === a.user;
  } catch {
    return false;
  }
}

/* ---- manutenzione ---- */
let flag: { at: number; v: boolean | null } = { at: 0, v: null };
/** true/false se deciso dal pannello, null se mai toccato (allora vale MAN nell'ambiente). */
export function storedMaintenance(): boolean | null {
  const now = Date.now();
  if (now - flag.at < 1000) return flag.v;
  const s = read<{ maintenance?: boolean }>("site.json", {});
  flag = { at: now, v: typeof s.maintenance === "boolean" ? s.maintenance : null };
  return flag.v;
}
export function setMaintenance(on: boolean) {
  write("site.json", { ...read<object>("site.json", {}), maintenance: on });
  flag = { at: 0, v: null };
}

/* ---- card ---- */
export type Card = { id: string; slug: string; name: string; code: string; user: string; pass: string; url: string; logo: number; color?: string; created: string };
export const cards = () => read<Card[]>("cards.json", []);
export const cardBySlug = (slug: string) => cards().find((c) => c.slug === slug);
export const saveCards = (list: Card[]) => write("cards.json", list);
export const newId = () => randomBytes(8).toString("hex");

const logoFile = (id: string) => path.join(DATA_DIR, "logos", `${id}.png`);
export function writeLogo(id: string, buf: Buffer) {
  fs.mkdirSync(path.dirname(logoFile(id)), { recursive: true });
  fs.writeFileSync(logoFile(id), buf);
}
export const readLogo = (id: string) => (/^[a-f0-9]{16}$/.test(id) && fs.existsSync(logoFile(id)) ? fs.readFileSync(logoFile(id)) : null);
export const removeLogo = (id: string) => fs.rmSync(logoFile(id), { force: true });

/**
 * La cartella dei dati sta su un volume? Si legge la tabella dei mount di Linux: conta un mount esattamente su DATA_DIR
 * (di qualunque tipo, tranne tmpfs) o su una cartella madre diversa da "/" che non sia overlay.
 * Restituisce anche il percorso e il tipo di filesystem trovato, per capire cosa succede.
 */
export function dataPersistent(): { ok: boolean; dir: string; fs: string } | null {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const dir = fs.realpathSync(DATA_DIR);
    const lines = fs.readFileSync("/proc/self/mountinfo", "utf8").split("\n");
    let best: { mp: string; fstype: string } | null = null;
    for (const l of lines) {
      const [pre, post] = l.split(" - ");
      if (!post) continue;
      const mp = pre.split(" ")[4]?.replace(/\\040/g, " ");
      const fstype = post.split(" ")[0];
      if (!mp || mp === "/" || !(dir === mp || dir.startsWith(mp + "/"))) continue;
      if (!best || mp.length >= best.mp.length) best = { mp, fstype };
    }
    if (!best) return { ok: false, dir, fs: "overlay" };
    const exact = best.mp === dir;
    const ok = best.fstype !== "tmpfs" && (exact || !["overlay", "proc", "sysfs"].includes(best.fstype));
    return { ok, dir, fs: best.fstype };
  } catch {
    return null;
  }
}
