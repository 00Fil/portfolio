import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { SERVICES, getService } from "@/content/services";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { ServiceVisual, type WidgetText } from "@/components/sections/ServiceWidgets";
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
  const w = t.raw("w") as WidgetText;
  const cards = (await workCards(locale)).filter((c) => s.projects.includes(c.slug));
  const others = SERVICES.filter((x) => x.slug !== slug);

  return (
    <>
      <main id="main">
        {/* apertura: un'unica tela scura con il gradiente del servizio, il titolo a sinistra e il disegno animato a destra */}
        <section className="mx-auto w-full max-w-[1360px] px-3 pt-[calc(var(--bar-h)+28px)] sm:px-5">
          <div className="theme-dark relative overflow-hidden rounded-[32px] bg-[#05070a] sm:rounded-[44px]">
            <ServiceBg k={s.key} />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(3,6,10,.82)_0%,rgba(3,6,10,.45)_45%,transparent_75%)]" />
            <Reveal className="relative grid min-h-[min(760px,calc(100svh-var(--bar-h)-56px))] items-center gap-10 px-6 py-14 sm:px-12 sm:py-16 lg:grid-cols-12 lg:gap-6 lg:px-16">
              <div className="lg:col-span-5">
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/70" data-reveal>
                  {t("title")} · {s.label[locale]}
                </p>
                <h1 className="mt-5 text-[clamp(42px,5.2vw,84px)] font-medium leading-[0.98] tracking-[-0.05em] text-white" data-reveal data-split>
                  {s.title[locale]}
                </h1>
                <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-white/75" data-reveal>
                  {s.lead[locale]}
                </p>
                <div className="mt-9 flex flex-wrap gap-3" data-reveal>
                  <Drop href={`#brief-${s.need}`} accent className="h-12 px-5 font-medium text-ink">
                    {t("cta")}
                    <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
                  </Drop>
                  <Drop href="#include" className="h-12 px-5 font-medium text-ink">
                    {t("includes")}
                  </Drop>
                </div>
                <ol className="mt-12 grid gap-x-6 gap-y-3 border-t border-white/10 pt-6 sm:grid-cols-2" data-reveal>
                  {s.includes.slice(0, 4).map((x, i) => (
                    <li key={i} className="flex items-baseline gap-2.5 text-[14px] text-white/80">
                      <span className="font-mono text-[11px] text-white/45">{String(i + 1).padStart(2, "0")}</span>
                      {x.title[locale]}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative h-[300px] sm:h-[420px] lg:col-span-7 lg:h-[540px]" data-reveal>
                <ServiceVisual k={s.key} t={w} max={1.55} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* cosa include, raccontato scorrendo */}
        <div id="include" className="scroll-mt-10 pt-20 sm:pt-28">
          <ServiceStory
            k={s.key}
            title={t("includes")}
            items={s.includes.map((x) => ({ title: x.title[locale], body: x.body[locale] }))}
            scenes={STORIES[s.key]}
            locale={locale}
            labels={[t("before"), t("after")]}
          />
        </div>

        {/* tecnologie e lavori collegati, affiancati */}
        <section className="mx-auto mt-20 grid w-full max-w-[1280px] gap-5 px-5 sm:mt-28 sm:px-8 lg:grid-cols-12">
          <Reveal className={`rounded-[32px] bg-[var(--card)] p-8 shadow-[inset_0_0_0_1px_var(--hair)] sm:p-10 ${cards.length ? "lg:col-span-5" : "lg:col-span-12"}`}>
            <p className="t-label text-ink-3" data-reveal>
              {t("tech")}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5" data-stagger>
              {s.stack.map((x) => (
                <li key={x.name} className="flex h-11 items-center gap-2.5 rounded-full bg-[var(--chip)] px-4 text-[15px] text-ink-2 shadow-[inset_0_0_0_1px_var(--hair)]">
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
          {cards.length > 0 && (
            <div className="lg:col-span-7">
              <p className="t-label mb-6 mt-6 text-ink-3 lg:mt-0">{t("related")}</p>
              <div className="grid gap-10">
                {cards.slice(0, 1).map((c) => (
                  <CoverCard key={c.slug} p={c} open={tw("open")} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* altri servizi */}
        <Reveal className="mx-auto mt-20 w-full max-w-[1280px] px-5 sm:mt-28 sm:px-8">
          <p className="t-label mb-6 text-ink-3" data-reveal>
            {t("others")}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {others.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/servizi/${x.slug}`}
                  className="group flex h-full items-start justify-between gap-4 rounded-[24px] bg-[var(--card)] p-6 shadow-[inset_0_0_0_1px_var(--hair)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_var(--hair-strong),0_24px_50px_-30px_var(--shadow-strong)]"
                >
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{x.label[locale]}</span>
                    <span className="mt-1.5 block text-[18px] font-medium tracking-[-0.02em] text-ink">{x.title[locale]}</span>
                    <span className="mt-1.5 block text-[14px] leading-[1.5] text-ink-2">{x.short[locale]}</span>
                  </span>
                  <ArrowUpRight size={18} strokeWidth={1.8} className="mt-1 shrink-0 text-ink-3 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--sky)]" />
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
