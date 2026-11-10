"use server";

import { refresh } from "next/cache";
import { findClient, rateLimited, readSession } from "@/lib/session";
import { addRequest, notifyRequest, type Priority } from "@/lib/requests";

export type RequestState = { ok?: boolean; error?: "fields" | "limit" | "auth"; at?: number } | undefined;

const PRIORITIES: Priority[] = ["low", "normal", "high"];

export async function sendRequest(_: RequestState, form: FormData): Promise<RequestState> {
  const s = await readSession();
  if (!s) return { error: "auth" };
  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const body = String(form.get("body") ?? "").trim().slice(0, 4000);
  const p = String(form.get("priority") ?? "normal") as Priority;
  if (title.length < 3 || body.length < 3) return { error: "fields" };
  if (rateLimited(`req:${s.email.toLowerCase()}`)) return { error: "limit" };
  const r = await addRequest({ email: s.email, title, body, priority: PRIORITIES.includes(p) ? p : "normal" });
  await notifyRequest(r, s.name, findClient(s.email)?.project);
  refresh();
  return { ok: true, at: Date.now() };
}
