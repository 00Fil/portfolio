import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { readSession } from "@/lib/session";
import { profile } from "@/content/profile";
import { LoginForm } from "@/components/auth/LoginForm";
import { SiteNav } from "@/components/nav/SiteNav";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await readSession()) redirect(`/${locale}/area-clienti`);
  const t = await getTranslations("auth");

  return (
    <>
      <main id="main" className="relative flex min-h-[100svh] items-center justify-center px-4 pb-36 pt-[calc(var(--bar-h)+32px)] lg:pb-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,var(--hair)_1px,transparent_1.4px)] [background-size:24px_24px] [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)]" />
        <div className="relative w-full max-w-[400px] rounded-[24px] bg-[var(--card)] p-7 shadow-[inset_0_0_0_1px_var(--hair),0_40px_80px_-50px_var(--shadow-strong)] sm:p-9">
          <LoginForm
            locale={locale}
            t={{
              title: t("title"),
              lead: t("lead"),
              email: t("email"),
              password: t("password"),
              submit: t("submit"),
              show: t("show"),
              hide: t("hide"),
              forgot: t("forgot"),
              forgotHref: profile.email ? `mailto:${profile.email}` : "#brief",
              noAccess: t("noAccess"),
              noAccessCta: t("noAccessCta"),
              errors: { fields: t("errors.fields"), wrong: t("errors.wrong"), limit: t("errors.limit"), off: t("errors.off") },
            }}
          />
        </div>
      </main>
      <SiteNav detail={{ title: t("metaTitle"), section: "home" }} plain />
    </>
  );
}
