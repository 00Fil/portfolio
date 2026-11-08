import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { getProject, projects } from "@/content/projects";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { PageEnter } from "@/components/motion/PageEnter";
import { SiteNav } from "@/components/nav/SiteNav";
import { Drop } from "@/components/glass/Drop";
import { Footer } from "@/components/sections/Footer";
import { Slats } from "@/components/visual/Slats";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.line[locale as Locale],
    alternates: { canonical: `/${locale}/lavori/${slug}`, languages: { it: `/it/lavori/${slug}`, en: `/en/lavori/${slug}` } },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: l, slug } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const p = getProject(slug);
  if (!p) notFound();
  const t = await getTranslations("project");
  const idx = projects.findIndex((x) => x.slug === slug);
  const next = projects[(idx + 1) % projects.length];

  const meta: [string, string][] = [
    [t("role"), p.role[locale]],
    [t("year"), p.year],
    [t("platforms"), p.platforms[locale]],
  ];

  const block = (title: string, items: string[], numbered = false) =>
    items.length > 0 && (
      <section className="grid gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8 sm:py-14">
        <h2 className="t-label text-ink-3" data-reveal>
          {title}
        </h2>
        <ol className="grid gap-5" data-stagger>
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[32px_1fr] gap-2">
              <span className="t-label t-fig pt-1 text-ink-3">{numbered ? String(i + 1).padStart(2, "0") : "—"}</span>
              <span className="text-ink">{it}</span>
            </li>
          ))}
        </ol>
      </section>
    );

  return (
    <>
      <PageEnter>
        <main id="main" className="mx-auto w-full max-w-[1200px] px-5 pt-32 sm:px-8 sm:pt-40">
          <Reveal as="header" className="pb-12 sm:pb-16">
            <p className="t-label t-fig mb-6 text-ink-3" data-reveal>
              {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </p>
            <h1 className="t-display text-ink" data-reveal data-split>
              {p.name}
            </h1>
            <p className="t-callout mt-6 max-w-[40ch] text-ink-2" data-reveal>
              {p.line[locale]}
            </p>
          </Reveal>

          {slug === "relay" && <Slats />}

          <Reveal className="grid gap-10 py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8 sm:py-14">
            <dl className="grid content-start gap-5" data-stagger>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="t-label text-ink-3">{k}</dt>
                  <dd className="mt-1 text-ink">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="t-label text-ink-3">{t("stack")}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span key={s} className="t-label rounded-full bg-sunken px-2.5 py-1 normal-case tracking-normal text-ink-2">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              {p.repo && (
                <div>
                  <dt className="t-label text-ink-3">{t("source")}</dt>
                  <dd className="mt-1">
                    <a href={p.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-[var(--accent)]">
                      GitHub
                      <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden className="text-ink-2" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <div>
              <p className="t-callout text-ink" data-reveal>
                {p.summary[locale]}
              </p>
              <ul className="mt-12 grid gap-px overflow-hidden rounded-[28px] sm:grid-cols-3" data-stagger>
                {p.figures.map((f) => (
                  <li key={f.value} className="plate rounded-none p-6">
                    <RollingText text={f.value} className="t-title1 t-fig text-ink" />
                    <p className="t-foot mt-3 text-ink-2">{f.label[locale]}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <section className="grid gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8 sm:py-14">
              <h2 className="t-label text-ink-3" data-reveal>
                {t("problem")}
              </h2>
              <p className="t-callout text-ink" data-reveal>
                {p.problem[locale]}
              </p>
            </section>
            {block(t("built"), p.built[locale])}
            {block(t("decisions"), p.decisions[locale], true)}
            {block(t("limits"), p.limits[locale])}
          </Reveal>

          <Reveal className="py-16 sm:py-24">
            <p className="t-label mb-4 text-ink-3" data-reveal>
              {t("next")}
            </p>
            <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
              <div>
                <p className="t-title1 text-ink">{next.name}</p>
                <p className="mt-2 max-w-[48ch] text-ink-2">{next.line[locale]}</p>
              </div>
              <Drop href={`/lavori/${next.slug}`} accent className="h-12 px-5 font-medium text-ink">
                {next.name}
                <ArrowRight size={18} strokeWidth={1.6} aria-hidden />
              </Drop>
            </div>
          </Reveal>
        </main>
        <Footer />
      </PageEnter>
      <SiteNav detail={{ title: p.name }} />
    </>
  );
}
