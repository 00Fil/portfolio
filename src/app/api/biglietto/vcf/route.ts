import { originOf, vcf } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return new Response(vcf(originOf(req)), { headers: { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": 'attachment; filename="filippo-corsini.vcf"', "Cache-Control": "no-store" } });
}
