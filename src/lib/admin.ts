import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, signAdminToken, verifyAdminToken } from "./admin-store";

export async function openAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, await signAdminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: ADMIN_MAX_AGE });
}
export async function closeAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
export async function isAdmin() {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("non autorizzato");
}
