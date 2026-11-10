import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { readSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { SkyGradient } from "@/components/motion/SkyGradient";
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
  const feats = t.raw("features") as { k: string; v: string }[];

  return (
    <>
      <main id="main" className="mx-auto grid min-h-[100svh] w-full max-w-[1400px] gap-4 px-3 pb-36 pt-[calc(var(--bar-h)+20px)] sm:px-5 lg:grid-cols-2 lg:pb-5">
        {/* a sinistra: cosa trovi dentro, su un gradiente vivo */}
        <section className="theme-dark relative min-h-[300px] overflow-hidden rounded-[32px] bg-[#05131d] sm:rounded-[40px] lg:min-h-0">
          <SkyGradient angle={30} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,16,.1),rgba(3,10,16,.6))]" />
          <div className="pointer-events-none relative flex h-full flex-col justify-end p-7 sm:p-12">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/70">{t("kicker")}</p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
              {feats.map((f, i) => (
                <li key={f.k} className="border-t border-white/20 pt-4">
                  <p className="font-mono text-[11.5px] tabular-nums text-white/55">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-1.5 text-[20px] font-medium tracking-[-0.02em] text-white">{f.k}</p>
                  <p className="mt-1 max-w-[34ch] text-[14.5px] leading-[1.5] text-white/75">{f.v}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        {/* a destra: l'accesso */}
        <section className="flex items-center justify-center rounded-[32px] px-4 py-12 sm:rounded-[40px] sm:py-16">
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
              noAccess: t("noAccess"),
              noAccessCta: t("noAccessCta"),
              errors: { fields: t("errors.fields"), wrong: t("errors.wrong"), limit: t("errors.limit"), off: t("errors.off") },
            }}
          />
        </section>
      </main>
      <SiteNav detail={{ title: t("metaTitle") }} />
    </>
  );
}
