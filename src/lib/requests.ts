import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const FILE = process.env.REQUESTS_FILE || path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "requests.json");

export type Priority = "low" | "normal" | "high";
/** Lo stato lo aggiorno io nel file: ricevuta → in valutazione → in lavorazione → completata. */
export type Status = "new" | "review" | "doing" | "done";
export type Request = { id: string; email: string; title: string; body: string; priority: Priority; status: Status; created: string; note?: string };

async function readAll(): Promise<Request[]> {
  try {
    const v = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function listRequests(email: string): Promise<Request[]> {
  const all = await readAll();
  return all.filter((r) => r.email.toLowerCase() === email.toLowerCase()).sort((a, b) => b.created.localeCompare(a.created));
}

export async function addRequest(r: Omit<Request, "id" | "status" | "created">): Promise<Request> {
  const all = await readAll();
  const item: Request = { ...r, id: randomUUID().slice(0, 8), status: "new", created: new Date().toISOString() };
  all.push(item);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  return item;
}

/** Avviso via email (Resend), se configurato, con le stesse variabili delle prenotazioni. */
export async function notifyRequest(r: Request, name: string, project?: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO;
  const from = process.env.BOOKING_FROM;
  if (!key || !to || !from) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: r.email,
      subject: `Richiesta #${r.id} · ${project ?? name} · ${r.title}`,
      text: [`Da: ${name} <${r.email}>`, project ? `Progetto: ${project}` : "", `Priorità: ${r.priority}`, "", r.body].filter(Boolean).join("\n"),
    }),
  }).catch(() => null);
  return !!res?.ok;
}
