import { appleReady, applePass, originOf } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!appleReady()) return new Response(null, { status: 404 });
  try {
    const buf = await applePass(originOf(req));
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.apple.pkpass", "Content-Disposition": 'attachment; filename="filippo-corsini.pkpass"', "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 500 });
  }
}
