"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rateLimited } from "@/lib/session";

const FILE = process.env.CHATS_FILE || path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "chats.json");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Line = { from: "me" | "bot"; text: string };
export type HandoffResult = { ok: true } | { ok: false; error: "invalid" | "limit" };

/** La conversazione passa a Filippo: salvata in un file e, se configurato, inviata per email (Resend). */
export async function handoff(input: { name: string; email: string; lines: Line[]; page?: string }): Promise<HandoffResult> {
  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().slice(0, 200);
  if (name.length < 2 || !EMAIL.test(email)) return { ok: false, error: "invalid" };
  if (rateLimited(`chat:${email.toLowerCase()}`)) return { ok: false, error: "limit" };
  const lines = (Array.isArray(input.lines) ? input.lines : []).slice(-40).map((l) => ({ from: l.from === "me" ? "me" : "bot", text: String(l.text ?? "").slice(0, 2000) }));
  const item = { id: randomUUID().slice(0, 8), name, email, page: String(input.page ?? "").slice(0, 200), lines, created: new Date().toISOString() };

  let all: unknown[] = [];
  try {
    const v = JSON.parse(await fs.readFile(FILE, "utf8"));
    if (Array.isArray(v)) all = v;
  } catch {
    /* primo messaggio */
  }
  all.push(item);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));

  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO;
  const from = process.env.BOOKING_FROM;
  if (key && to && from) {
    const text = [`Da: ${name} <${email}>`, item.page ? `Pagina: ${item.page}` : "", "", ...lines.map((l) => `${l.from === "me" ? name : "Assistente"}: ${l.text}`)].filter((x) => x !== undefined).join("\n");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Chat dal sito · ${name}`, text }),
    }).catch(() => null);
  }
  return { ok: true };
}
