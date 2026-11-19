"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { rateLimited } from "@/lib/session";

export type UnlockResult = { ok: true; user: string; pass: string; url: string } | { ok: false; error: "wrong" | "limit" | "off" };

const digest = (s: string) => createHash("sha256").update(s).digest();

/**
 * Le credenziali non stanno nel codice: CARD_CODE (codice di sblocco), CARD_USER e CARD_PASS
 * arrivano dall'ambiente (Dokploy). Senza queste variabili la card resta chiusa.
 */
export async function unlockCard(code: string): Promise<UnlockResult> {
  const expected = process.env.CARD_CODE;
  const user = process.env.CARD_USER;
  const pass = process.env.CARD_PASS;
  if (!expected || !user || !pass) return { ok: false, error: "off" };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`card:${ip}`)) return { ok: false, error: "limit" };
  const good = timingSafeEqual(digest(String(code ?? "").trim().slice(0, 200)), digest(expected));
  const url = process.env.CARD_URL || "https://oratoriobedizzolecalvagese.it/wp-login.php";
  return good ? { ok: true, user, pass, url } : { ok: false, error: "wrong" };
}
