import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";
import { maintenanceOn } from "./lib/maintenance";

const intl = createMiddleware(routing);

async function signedIn(req: NextRequest) {
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
  if (maintenanceOn() && !(await signedIn(req))) {
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
