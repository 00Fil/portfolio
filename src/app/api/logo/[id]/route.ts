import { readLogo } from "@/lib/admin-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const buf = readLogo(id);
  if (!buf) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
