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
import { ServiceVisual, type WidgetText } from "@/components/sections/ServiceWidgets";
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
        {/* apertura: titolo a sinistra, il servizio in azione a destra, su fibre azzurre che sfumano nel nero */}
        <section className="relative overflow-hidden pb-20 pt-[calc(var(--bar-h)+72px)] sm:pb-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]">
            <img src="/visual/fibers-sky.webp" alt="" className="h-full w-full object-cover opacity-50" />
          </div>
          <Reveal className="relative mx-auto grid w-full max-w-[1280px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--sky)]" data-reveal>
                {t("title")} · {s.label[locale]}
              </p>
              <h1 className="mt-5 text-[clamp(48px,6.4vw,100px)] font-medium leading-[0.95] tracking-[-0.055em] text-ink" data-reveal data-split>
                {s.title[locale]}
              </h1>
              <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.55] text-ink-2 sm:text-[19px]" data-reveal>
                {s.lead[locale]}
              </p>
              <div className="mt-9" data-reveal>
                <Drop href="#brief" accent className="h-12 px-5 font-medium text-ink">
                  {t("cta")}
                  <ArrowDown size={18} strokeWidth={1.6} aria-hidden />
                </Drop>
              </div>
            </div>
            <div className="min-w-0 lg:col-span-6" data-reveal>
              <div className="relative h-[300px] overflow-hidden rounded-[32px] bg-[#0d0e10]/70 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] backdrop-blur-sm sm:h-[420px] sm:p-10">
                <ServiceVisual k={s.key} t={w} max={1.8} />
              </div>
            </div>
          </Reveal>
        </section>

        {/* cosa include */}
        <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <p className="t-label text-ink-3" data-reveal>
            {t("includes")}
          </p>
          <ol className="mt-8 grid gap-x-10 sm:grid-cols-2" data-stagger>
            {s.includes.map((it, i) => (
              <li key={i} className="grid grid-cols-[44px_1fr] border-t border-white/[0.08] py-8">
                <span className="t-fig pt-1.5 font-mono text-[13px] text-[var(--sky)]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-[clamp(22px,2vw,28px)] font-medium tracking-[-0.03em] text-ink">{it.title[locale]}</h2>
                  <p className="mt-2 max-w-[46ch] text-[16px] leading-[1.55] text-ink-2">{it.body[locale]}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* tecnologie */}
        <Reveal className="mx-auto mt-16 w-full max-w-[1280px] px-5 sm:mt-24 sm:px-8">
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
