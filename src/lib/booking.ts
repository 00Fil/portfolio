import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { profile } from "@/content/profile";

const B = profile.booking;
const FILE = process.env.BOOKINGS_FILE || path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "bookings.json");

export type Booking = { start: string; name: string; email: string; company?: string; phone?: string; need: string[]; goal?: string; note?: string; budget?: string; created: string };

/** Minuti di scarto tra UTC e il fuso indicato, in quel preciso istante. */
function offsetMin(date: Date, tz: string) {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = s.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
}
/** Data e ora "da muro" nel fuso → istante UTC. */
function zoned(y: number, mo: number, d: number, h: number, mi: number, tz: string) {
  const guess = new Date(Date.UTC(y, mo, d, h, mi));
  return new Date(guess.getTime() - offsetMin(guess, tz) * 60e3);
}
function wallDate(date: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(date).map((x) => [x.type, x.value]));
  return { y: Number(p.year), m: Number(p.month) - 1, d: Number(p.day), wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
}

async function readAll(): Promise<Booking[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

/** Tutti gli orari ancora liberi, raggruppati per giorno (in ora italiana). */
export async function freeSlots(): Promise<{ day: string; slots: string[] }[]> {
  const taken = new Set((await readAll()).map((b) => b.start));
  const now = Date.now();
  const out: { day: string; slots: string[] }[] = [];
  for (let k = 0; k <= B.horizonDays; k++) {
    const w = wallDate(new Date(now + k * 864e5), B.tz);
    if (!B.days.includes(w.wd)) continue;
    const slots: string[] = [];
    B.windows.forEach(([a, b]) => {
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      for (let t = ah * 60 + am; t + B.minutes <= bh * 60 + bm; t += B.minutes) {
        const start = zoned(w.y, w.m, w.d, Math.floor(t / 60), t % 60, B.tz);
        if (start.getTime() - now < B.noticeHours * 36e5) continue;
        const iso = start.toISOString();
        if (!taken.has(iso)) slots.push(iso);
      }
    });
    if (slots.length) out.push({ day: zoned(w.y, w.m, w.d, 12, 0, B.tz).toISOString(), slots });
  }
  return out;
}

export async function saveBooking(b: Booking): Promise<"ok" | "taken" | "invalid"> {
  const free = (await freeSlots()).some((d) => d.slots.includes(b.start));
  if (!free) return (await readAll()).some((x) => x.start === b.start) ? "taken" : "invalid";
  const all = await readAll();
  all.push(b);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  return "ok";
}

/** Avviso via email (Resend), se configurato: RESEND_API_KEY, BOOKING_TO e BOOKING_FROM. */
export async function notify(b: Booking) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO;
  const from = process.env.BOOKING_FROM;
  if (!key || !to || !from) return false;
  const when = new Intl.DateTimeFormat("it-IT", { timeZone: B.tz, dateStyle: "full", timeStyle: "short" }).format(new Date(b.start));
  const text = [
    `Nuova chiamata: ${when} (${B.minutes} minuti)`,
    "",
    `Nome: ${b.name}${b.company ? ` · ${b.company}` : ""}`,
    `Email: ${b.email}${b.phone ? ` · Tel: ${b.phone}` : ""}`,
    `Serve: ${b.need.join(", ")}`,
    b.goal ? `Obiettivo: ${b.goal}` : "",
    b.budget ? `Budget: ${b.budget}` : "",
    b.note ? `Note: ${b.note}` : "",
  ].filter(Boolean).join("\n");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: b.email, subject: `Chiamata · ${b.name} · ${when}`, text }),
  }).catch(() => null);
  return !!r?.ok;
}
