import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { GateScreen } from "@/components/auth/GateScreen";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "maintenance" });
  return { title: t("status"), robots: { index: false } };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Maintenance({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("maintenance");
  const a = await getTranslations("auth");
  return (
    <GateScreen
      t={{
        status: t("status"),
        title: t("title"),
        lead: t("lead"),
        email: a("email"),
        password: a("password"),
        submit: a("submit"),
        show: a("show"),
        hide: a("hide"),
        errors: { fields: a("errors.fields"), wrong: a("errors.wrong"), limit: a("errors.limit"), off: a("errors.off") },
      }}
    />
  );
}
