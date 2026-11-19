import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CardViewer } from "@/components/card/CardViewer";
import { SiteNav } from "@/components/nav/SiteNav";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "card" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("card");
  return (
    <>
      <main id="main" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-36 pt-[calc(var(--bar-h)+24px)] lg:pb-16">
        <CardViewer
          t={{ code: t("code"), open: t("open"), flip: t("flip"), copied: t("copied"), errors: { wrong: t("wrong"), limit: t("limit"), off: t("off") } }}
        />
      </main>
      <SiteNav detail={{ title: t("metaTitle"), section: "home" }} plain />
    </>
  );
}
