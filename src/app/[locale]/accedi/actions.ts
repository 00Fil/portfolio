"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authReady, createSession, deleteSession, findClient, rateLimited, verifyPassword } from "@/lib/session";

export type LoginState = { error?: "fields" | "wrong" | "limit" | "off"; email?: string } | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const locale = String(form.get("locale") ?? "it") === "en" ? "en" : "it";
  if (!authReady()) return { error: "off", email };
  if (!EMAIL.test(email) || password.length < 6) return { error: "fields", email };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`${ip}:${email.toLowerCase()}`)) return { error: "limit", email };
  const c = findClient(email);
  // stessa risposta se l'utente non esiste o la password è sbagliata
  const ok = c ? await verifyPassword(password, c.hash) : await verifyPassword(password, "scrypt:00:00").then(() => false);
  if (!c || !ok) return { error: "wrong", email };
  await createSession({ email: c.email, name: c.name });
  redirect(`/${locale}/area-clienti`);
}

export async function logout(form: FormData) {
  const locale = String(form.get("locale") ?? "it") === "en" ? "en" : "it";
  await deleteSession();
  redirect(`/${locale}/accedi`);
}

/** Accesso dalla schermata di manutenzione: apre la sessione e resta dov'è (la pagina si ricarica da sola). */
export type GateState = { error?: "fields" | "wrong" | "limit" | "off"; email?: string; ok?: boolean } | undefined;

export async function loginGate(_: GateState, form: FormData): Promise<GateState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!authReady()) return { error: "off", email };
  if (!EMAIL.test(email) || password.length < 6) return { error: "fields", email };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`${ip}:${email.toLowerCase()}`)) return { error: "limit", email };
  const c = findClient(email);
  const ok = c ? await verifyPassword(password, c.hash) : await verifyPassword(password, "scrypt:00:00").then(() => false);
  if (!c || !ok) return { error: "wrong", email };
  await createSession({ email: c.email, name: c.name });
  return { ok: true };
}
