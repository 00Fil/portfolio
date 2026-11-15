import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SERVICES, getService } from "@/content/services";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import type { WidgetText } from "@/components/sections/ServiceWidgets";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { GeoPage } from "@/components/services/geo/GeoPage";
import { getGeoCopy } from "@/content/geo";
import type { Story } from "@/components/services/ServiceStory";
import { getStory } from "@/content/stories";
import { getProject } from "@/content/projects";
import { profile } from "@/content/profile";

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
  const w = t.raw("w") as WidgetText;
  const story = (t.raw("story") as Record<string, Story> | undefined)?.[s.key];
  const phases = (tm.raw("phases") as { name: string; title: string; out: string }[]).map(({ name, title, out }) => ({ name, title, out }));
  const i = SERVICES.findIndex((x) => x.slug === slug);
  const n = SERVICES[(i + 1) % SERVICES.length];

  const tale = getStory(s.key, locale);
  const faq = tale.faq.items;
  // i progetti veri da mostrare come prova: titolo-risultato, contesto, etichette e icona
  const ICON: Record<string, string> = { relay: "/work/relay/icon.webp", creacloud: "/work/creacloud/icon.svg", unispace: "/work/unispace/mascot-base.webp" };
  const proof = tale.proof.slugs.flatMap((slug) => {
    const pr = getProject(slug);
    return pr ? [{ slug, name: pr.name, headline: pr.headline[locale], context: pr.context[locale], tags: pr.tags[locale], icon: ICON[slug] }] : [];
  });
  // le domande anche come dati strutturati: motori di ricerca e assistenti le leggono senza interpretare la pagina
  const ld = faq.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }
    : null;
  const commonT = { services: t("title"), cta: t("cta"), ctaLead: t("ctaLead"), how: tale.how.title, includes: t("includes"), before: t("before"), after: t("after"), method: tm("title"), methodLead: tm("lead"), next: t("next"), all: t("all") };
  const next = { slug: n.slug, k: n.key, label: n.label[locale], title: n.title[locale], short: n.short[locale] };
  const others = SERVICES.filter((x) => x.slug !== slug).map((x) => ({ slug: x.slug, k: x.key, title: x.title[locale] }));

  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
      <main id="main">
        {s.key === "geo" ? (
          <GeoPage copy={getGeoCopy(locale)} tale={tale} next={next} others={others} t={commonT} />
        ) : (
          <ServiceDetail
            k={s.key}
            need={s.need}
            label={s.label[locale]}
            title={s.title[locale]}
            short={s.short[locale]}
            lead={s.lead[locale]}
            includes={s.includes.map((x) => ({ title: x.title[locale], body: x.body[locale] }))}
            phases={phases}
            next={next}
            others={others}
            w={w}
            story={story}
            tale={tale}
            proof={proof}
            github={profile.github}
            t={commonT}
          />
        )}
      </main>
      <Footer withContact={false} />
      <SiteNav detail={{ title: s.title[locale], section: "approach" }} />
    </>
  );
}
