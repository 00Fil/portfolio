import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SERVICES, getService } from "@/content/services";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import type { WidgetText } from "@/components/sections/ServiceWidgets";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { workCards } from "@/components/sections/Work";
import { CoverCard } from "@/components/work/CoverCard";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SERVICES.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  const l = locale as Locale;
  return {
    title: s.title[l],
    description: s.lead[l],
    alternates: { canonical: `/${locale}/servizi/${slug}`, languages: { it: `/it/servizi/${slug}`, en: `/en/servizi/${slug}` } },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: l, slug } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const s = getService(slug);
  if (!s) notFound();
  const t = await getTranslations("services");
  const tm = await getTranslations("method");
  const tw = await getTranslations("work");
  const w = t.raw("w") as WidgetText;
  const phases = (tm.raw("phases") as { name: string; title: string; out: string }[]).map(({ name, title, out }) => ({ name, title, out }));
  const cards = (await workCards(locale)).filter((c) => s.projects.includes(c.slug));
  const i = SERVICES.findIndex((x) => x.slug === slug);
  const n = SERVICES[(i + 1) % SERVICES.length];

  return (
    <>
      <main id="main">
        <ServiceDetail
          k={s.key}
          need={s.need}
          label={s.label[locale]}
          title={s.title[locale]}
          short={s.short[locale]}
          lead={s.lead[locale]}
          includes={s.includes.map((x) => ({ title: x.title[locale], body: x.body[locale] }))}
          stack={s.stack}
          phases={phases}
          next={{ slug: n.slug, k: n.key, label: n.label[locale], title: n.title[locale], short: n.short[locale] }}
          others={SERVICES.filter((x) => x.slug !== slug).map((x) => ({ slug: x.slug, title: x.title[locale] }))}
          w={w}
          t={{ services: t("title"), cta: t("cta"), includes: t("includes"), tech: t("tech"), method: tm("title"), methodLead: tm("lead"), next: t("next"), all: t("all"), related: t("related") }}
          related={cards.length ? <CoverCard p={cards[0]} open={tw("open")} /> : undefined}
        />
      </main>
      <Footer withContact={false} />
      <SiteNav detail={{ title: s.title[locale], section: "approach" }} />
    </>
  );
}
