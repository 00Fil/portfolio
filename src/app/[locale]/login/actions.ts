"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimited } from "@/lib/session";
import { closeAdminSession, openAdminSession, requireAdmin } from "@/lib/admin";
import { adminExists, cards, createAdmin, newId, removeLogo, saveCards, setMaintenance, verifyAdmin, writeLogo, type Card } from "@/lib/admin-store";

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
  const next: Card = { id: cid, slug, name, code, user, pass, url, logo, created: prev?.created ?? new Date().toISOString() };
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
