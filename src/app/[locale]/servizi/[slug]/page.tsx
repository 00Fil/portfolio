import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { SERVICES, getService } from "@/content/services";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { Brief } from "@/components/sections/Brief";
import { ServiceBackdrop } from "@/components/services/ServiceBackdrop";
import { ServiceStory } from "@/components/services/ServiceStory";
import { STORIES } from "@/content/service-stories";
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
  const tw = await getTranslations("work");
  const cards = (await workCards(locale)).filter((c) => s.projects.includes(c.slug));
  const others = SERVICES.filter((x) => x.slug !== slug);

  return (
    <>
      <main id="main">
        {/* apertura: titolo centrato su uno sfondo di React Bits diverso per ogni servizio */}
        <section className="relative flex min-h-[86svh] items-center overflow-hidden pb-20 pt-[calc(var(--bar-h)+64px)]">
          <ServiceBackdrop k={s.key} />
          <Reveal className="relative mx-auto flex w-full max-w-[980px] flex-col items-center px-5 text-center sm:px-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--sky)]" data-reveal>
              {t("title")} · {s.label[locale]}
            </p>
            <h1 className="mt-6 text-[clamp(46px,7vw,112px)] font-medium leading-[0.95] tracking-[-0.055em] text-ink" data-reveal data-split>
              {s.title[locale]}
            </h1>
            <p className="mt-7 max-w-[56ch] text-[17px] leading-[1.55] text-ink-2 sm:text-[19px]" data-reveal>
              {s.lead[locale]}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
              <Drop href="#brief" accent className="h-12 px-5 font-medium text-ink">
                {t("cta")}
                <ArrowDown size={18} strokeWidth={1.6} aria-hidden />
              </Drop>
            </div>
          </Reveal>
        </section>

        {/* cosa include, raccontato scorrendo */}
        <ServiceStory
          title={t("includes")}
          items={s.includes.map((x) => ({ title: x.title[locale], body: x.body[locale] }))}
          scenes={STORIES[s.key]}
          locale={locale}
          labels={[t("before"), t("after")]}
        />

        {/* tecnologie */}
        <Reveal className="mx-auto mt-24 w-full max-w-[1280px] px-5 sm:mt-32 sm:px-8">
          <p className="t-label text-ink-3" data-reveal>
            {t("tech")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5" data-stagger>
            {s.stack.map((x) => (
              <li key={x.name} className="flex h-11 items-center gap-2.5 rounded-full bg-white/[0.04] px-4 text-[15px] text-ink-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)]">
                {x.path && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-ink" aria-hidden>
                    <path d={x.path} />
                  </svg>
                )}
                {x.name}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* lavori collegati */}
        {cards.length > 0 && (
          <section className="mx-auto mt-24 w-full max-w-[1280px] px-5 sm:mt-32 sm:px-8">
            <p className="t-label mb-8 text-ink-3">{t("related")}</p>
            <div className={`grid gap-x-8 gap-y-16 ${cards.length > 1 ? "lg:grid-cols-2" : "max-w-[760px]"}`}>
              {cards.map((c) => (
                <CoverCard key={c.slug} p={c} open={tw("open")} />
              ))}
            </div>
          </section>
        )}

        {/* richiesta, con il servizio già scelto */}
        <section id="brief" className="mx-auto mt-24 grid w-full max-w-[1280px] scroll-mt-28 gap-10 px-5 sm:mt-36 sm:px-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="t-title2 max-w-[18ch] text-ink sm:text-[40px] sm:leading-[46px]" data-reveal data-split>
              {t("cta")}
            </p>
            <p className="mt-5 max-w-[36ch] text-ink-2" data-reveal>
              {t("ctaLead")}
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            <Brief preset={s.need} />
          </div>
        </section>

        {/* altri servizi */}
        <Reveal className="mx-auto mt-24 w-full max-w-[1280px] px-5 sm:mt-36 sm:px-8">
          <p className="t-label mb-6 text-ink-3" data-reveal>
            {t("others")}
          </p>
          <ul className="grid border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4" data-stagger>
            {others.map((x) => (
              <li key={x.slug} className="border-b border-white/[0.08]">
                <Link href={`/servizi/${x.slug}`} className="group flex items-center justify-between gap-4 py-5 pr-4 transition-colors">
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{x.label[locale]}</span>
                    <span className="mt-1 block text-[17px] font-medium tracking-[-0.015em] text-ink-2 transition-colors group-hover:text-ink">{x.title[locale]}</span>
                  </span>
                  <ArrowUpRight size={17} strokeWidth={1.8} className="shrink-0 text-ink-3 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--sky)]" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </main>
      <Footer withContact={false} />
      <SiteNav detail={{ title: s.title[locale], section: "approach" }} />
    </>
  );
}
