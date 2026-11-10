"use server";

import { headers } from "next/headers";
import { freeSlots, notify, saveBooking, type Booking } from "./booking";
import { rateLimited } from "./session";

export async function getSlots() {
  return freeSlots();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n = 500) => String(v ?? "").trim().slice(0, n);

export async function book(input: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: "invalid" | "taken" | "limit" }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`book:${ip}`)) return { ok: false, error: "limit" };
  const b: Booking = {
    start: clip(input.slot, 40),
    name: clip(input.name, 120),
    email: clip(input.email, 200),
    company: clip(input.company, 160) || undefined,
    phone: clip(input.phone, 40) || undefined,
    need: (Array.isArray(input.need) ? input.need : []).map((x) => clip(x, 80)).slice(0, 12),
    goal: clip(input.goal, 120) || undefined,
    note: clip(input.goalNote, 1000) || undefined,
    budget: clip(input.budget, 80) || undefined,
    created: new Date().toISOString(),
  };
  if (b.name.length < 2 || !EMAIL.test(b.email) || !b.start || Number.isNaN(Date.parse(b.start))) return { ok: false, error: "invalid" };
  const r = await saveBooking(b);
  if (r !== "ok") return { ok: false, error: r };
  await notify(b);
  return { ok: true };
}
