import { googleReady, googleSaveUrl, originOf } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!googleReady()) return new Response(null, { status: 404 });
  try {
    return Response.redirect(await googleSaveUrl(originOf(req)), 302);
  } catch {
    return new Response(null, { status: 500 });
  }
}
