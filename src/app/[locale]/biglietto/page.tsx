import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/nav/SiteNav";
import { BusinessCard } from "@/components/card/BusinessCard";
import { appleReady, googleReady } from "@/lib/wallet";
import { vcard } from "@/content/vcard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${vcard.name} · Biglietto da visita` };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main id="main" className="relative flex min-h-[100svh] items-center justify-center px-4 pb-32 pt-[calc(var(--bar-h,72px)+24px)]" style={{ background: "var(--page-bg, transparent)" }}>
        <BusinessCard apple={appleReady()} google={googleReady()} />
      </main>
      <SiteNav detail={{ title: vcard.name, section: "home" }} plain />
    </>
  );
}
