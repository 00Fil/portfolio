import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";
import { maintenanceOn } from "./lib/maintenance";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/admin-store";

const intl = createMiddleware(routing);

async function signedIn(req: NextRequest) {
  if (await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) return true;
  const token = req.cookies.get("session")?.value;
  const s = process.env.AUTH_SECRET;
  if (!token || !s || s.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(s), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  // /login resta raggiungibile anche in manutenzione, altrimenti l'admin non potrebbe rientrare
  const isLogin = /^\/(it|en)?\/?login\/?$/.test(req.nextUrl.pathname);
  if (maintenanceOn() && !isLogin && !(await signedIn(req))) {
    const locale = req.nextUrl.pathname.split("/")[1] === "en" ? "en" : "it";
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/manutenzione`;
    const res = NextResponse.rewrite(url);
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }
  return intl(req);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|visual|sfx|.*\\..*).*)",
};
