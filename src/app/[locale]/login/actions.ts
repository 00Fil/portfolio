"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimited } from "@/lib/session";
import { closeAdminSession, openAdminSession, requireAdmin } from "@/lib/admin";
import { adminExists, cards, createAdmin, KINDS, newId, removeLogo, reports, saveCards, saveReports, SEVERITIES, setMaintenance, STATES, TESTS, verifyAdmin, writeLogo, type Card, type Entry, type Report } from "@/lib/admin-store";

export type AuthState = { error?: string; user?: string; ok?: boolean } | undefined;

const ip = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/** Solo la prima volta: dopo, esiste un admin e la registrazione e' chiusa per sempre. */
export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const user = String(form.get("user") ?? "").trim();
  const pw = String(form.get("password") ?? "");
  const again = String(form.get("again") ?? "");
  if (adminExists()) return { error: "Chiuso", user };
  if (user.length < 3 || user.length > 60) return { error: "Utente troppo corto", user };
  if (pw.length < 10) return { error: "Password: almeno 10 caratteri", user };
  if (pw !== again) return { error: "Le password non coincidono", user };
  if (!createAdmin(user, pw)) return { error: "Chiuso", user };
  await openAdminSession();
  return { ok: true };
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const user = String(form.get("user") ?? "").trim();
  const pw = String(form.get("password") ?? "");
  if (!user || !pw) return { error: "Compila i campi", user };
  if (rateLimited(`admin:${await ip()}`)) return { error: "Troppi tentativi", user };
  if (!verifyAdmin(user, pw)) return { error: "Credenziali errate", user };
  await openAdminSession();
  return { ok: true };
}

export async function signOut() {
  await closeAdminSession();
  revalidatePath("/", "layout");
}

export async function toggleMaintenance(on: boolean) {
  await requireAdmin();
  setMaintenance(!!on);
  revalidatePath("/", "layout");
}

export type SaveResult = { ok: true } | { ok: false; error: string };
const SLUG = /^[a-z0-9][a-z0-9-]{1,39}$/;
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Crea o aggiorna una card. Il logo arriva gia' ridotto a PNG dal browser. */
export async function saveCard(form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const code = String(form.get("code") ?? "").trim().slice(0, 100);
  const user = String(form.get("user") ?? "").slice(0, 200);
  const pass = String(form.get("pass") ?? "").slice(0, 200);
  let url = String(form.get("url") ?? "").trim().slice(0, 500);
  const rawColors = String(form.get("colors") ?? "").trim();
  const rawColor = String(form.get("color") ?? "").trim();
  let parsedColors: string[] = [];
  if (rawColors) {
    try {
      const arr = JSON.parse(rawColors);
      if (Array.isArray(arr)) {
        parsedColors = arr
          .map((v) => String(v ?? "").trim().toUpperCase())
          .filter((v) => /^#[0-9A-F]{6}$/.test(v))
          .slice(0, 4);
      }
    } catch {
      /* fallback */
    }
  }
  if (!parsedColors.length) {
    parsedColors = [/^#[0-9a-f]{6}$/i.test(rawColor) ? rawColor.toUpperCase() : "#3A5864"];
  }
  const color = parsedColors[0];
  const dropLogo = form.get("dropLogo") === "1";
  const file = form.get("logo");

  if (!SLUG.test(slug)) return { ok: false, error: "URL: lettere minuscole, numeri e trattini" };
  if (!name) return { ok: false, error: "Nome mancante" };
  if (code.length < 4) return { ok: false, error: "Codice: almeno 4 caratteri" };
  if (url) {
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      return { ok: false, error: "Link non valido" };
    }
  }
  const list = cards();
  if (list.some((c) => c.slug === slug && c.id !== id)) return { ok: false, error: "URL gia' usato" };

  let logoBuf: Buffer | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > 1_500_000) return { ok: false, error: "Logo troppo pesante" };
    logoBuf = Buffer.from(await file.arrayBuffer());
    if (!logoBuf.subarray(0, 8).equals(PNG)) return { ok: false, error: "Logo non valido" };
  }

  const prev = list.find((c) => c.id === id);
  const cid = prev?.id ?? newId();
  let logo = prev?.logo ?? 0;
  if (logoBuf) {
    writeLogo(cid, logoBuf);
    logo = Date.now();
  } else if (dropLogo) {
    removeLogo(cid);
    logo = 0;
  }
  const next: Card = { id: cid, slug, name, code, user, pass, url, logo, color, colors: parsedColors, created: prev?.created ?? new Date().toISOString() };
  saveCards(prev ? list.map((c) => (c.id === cid ? next : c)) : [...list, next]);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCard(id: string) {
  await requireAdmin();
  removeLogo(id);
  saveCards(cards().filter((c) => c.id !== id));
  revalidatePath("/", "layout");
}


const pick = <T extends string>(v: unknown, list: readonly T[], fb: T): T => (list.includes(v as T) ? (v as T) : fb);
const txt = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

/** Crea o aggiorna un documento tecnico. Sempre disponibile: il link e' /r/<url>. */
export async function saveReport(raw: string): Promise<SaveResult & { slug?: string }> {
  await requireAdmin();
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Dati non validi" };
  }
  const id = txt(d.id, 32);
  const list = reports();
  const prev = list.find((r) => r.id === id);
  let slug = txt(d.slug, 40).toLowerCase();
  if (!slug) slug = prev?.slug ?? newId().slice(0, 10);
  if (!SLUG.test(slug)) return { ok: false, error: "URL: lettere minuscole, numeri e trattini" };
  if (list.some((r) => r.slug === slug && r.id !== id)) return { ok: false, error: "URL gia' usato" };
  const title = txt(d.title, 120);
  if (!title) return { ok: false, error: "Titolo mancante" };
  const entries: Entry[] = (Array.isArray(d.entries) ? d.entries : []).slice(0, 300).map((e: Record<string, unknown>) => ({
    id: txt(e.id, 32) || newId().slice(0, 8),
    kind: pick(e.kind, KINDS, "change"),
    title: txt(e.title, 200),
    detail: txt(e.detail, 2000),
    area: txt(e.area, 80),
    commit: txt(e.commit, 40),
    severity: pick(e.severity, SEVERITIES, ""),
    state: pick(e.state, STATES, ""),
    test: pick(e.test, TESTS, "da collaudare"),
    evidence: txt(e.evidence, 600),
  })).filter((e) => e.title);
  const now = new Date().toISOString();
  const next: Report = {
    id: prev?.id ?? newId(),
    slug,
    title,
    project: txt(d.project, 80),
    version: txt(d.version, 40),
    status: d.status === "rilasciato" ? "rilasciato" : "bozza",
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(d.date)) ? String(d.date) : now.slice(0, 10),
    env: txt(d.env, 300),
    summary: txt(d.summary, 2000),
    entries,
    created: prev?.created ?? now,
    updated: now,
  };
  saveReports(prev ? list.map((r) => (r.id === next.id ? next : r)) : [...list, next]);
  revalidatePath("/", "layout");
  return { ok: true, slug };
}

export async function deleteReport(id: string) {
  await requireAdmin();
  saveReports(reports().filter((r) => r.id !== id));
  revalidatePath("/", "layout");
}
