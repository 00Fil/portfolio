import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardViewer } from "@/components/card/CardViewer";
import { SiteNav } from "@/components/nav/SiteNav";
import { cardBySlug } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = cardBySlug((await params).slug);
  return { title: c?.name ?? "Card", robots: { index: false, follow: false } };
}

export default async function CustomCard({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const c = cardBySlug(slug);
  if (!c) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("card");
  return (
    <>
      <main
        id="main"
        className="theme-dark relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-36 pt-[calc(var(--bar-h)+24px)] text-[var(--label-primary)] lg:pb-16"
        style={{
          background:
            "radial-gradient(ellipse 52% 46% at 50% -6%, rgba(255, 250, 240, 0.13) 0%, rgba(190, 210, 245, 0.045) 38%, rgba(7, 8, 10, 0) 74%), #07080a",
        }}
      >
        <CardViewer
          slug={c.slug}
          name={c.name}
          logo={c.logo ? `/api/logo/${c.id}?v=${c.logo}` : undefined}
          t={{ code: t("code"), open: t("open"), flip: t("flip"), site: t("site"), copied: t("copied"), errors: { wrong: t("wrong"), limit: t("limit"), off: t("off") } }}
        />
      </main>
      <SiteNav detail={{ title: c.name, section: "home" }} plain />
    </>
  );
}
