import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { getProject, projects } from "@/content/projects";
import { COVERS, getCover, type Cover } from "@/content/covers";
import { BRAND } from "@/content/brand-icons";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { ProjectHero } from "@/components/work/ProjectHero";
import { Tour } from "@/components/work/Tour";
import { RelaySystem } from "@/components/work/RelaySystem";
import { CoverCard } from "@/components/work/CoverCard";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: getCover(slug).def[locale as Locale],
    alternates: { canonical: `/${locale}/lavori/${slug}`, languages: { it: `/it/lavori/${slug}`, en: `/en/lavori/${slug}` } },
  };
}

/** I token Canone ridipinti con i colori del progetto: tutto ciò che sta nella pagina li eredita. */
const themeVars = (c: Cover) =>
  ({
    "--bg-canvas": c.theme.bg,
    "--bg-surface": c.theme.surface,
    "--bg-sunken": c.theme.light ? "#ebe6de" : "#1c1f2a",
    "--label-primary": c.theme.fg,
    "--label-secondary": c.theme.fg2,
    "--label-tertiary": c.theme.fg2,
    "--line-separator": c.theme.light ? "rgba(41,37,36,.1)" : "rgba(255,255,255,.08)",
    "--line-strong": c.theme.light ? "rgba(41,37,36,.18)" : "rgba(255,255,255,.14)",
    "--accent": c.theme.acc,
    "--sky": c.theme.acc,
    colorScheme: c.theme.light ? "light" : "dark",
    background: c.theme.bg,
    color: c.theme.fg,
  }) as React.CSSProperties;

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: l, slug } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const p = getProject(slug);
  if (!p) notFound();
  const c = getCover(slug);
  const t = await getTranslations("project");
  const tw = await getTranslations("work");
  const order = COVERS.map((x) => x.slug);
  const nextSlug = order[(order.indexOf(slug) + 1) % order.length];
  const next = getCover(nextSlug);

  const meta: [string, string][] = [
    [t("role"), p.role[locale]],
    [t("year"), p.year],
    [t("platforms"), p.platforms[locale]],
  ];

  const list = (title: string, items: string[], numbered = false) =>
    items.length > 0 && (
      <div className="grid gap-6 border-t border-[var(--line-separator)] py-10 sm:grid-cols-12 sm:gap-8 sm:py-14">
        <h3 className="t-label text-ink-3 sm:col-span-4" data-reveal>
          {title}
        </h3>
        <ol className="grid gap-5 sm:col-span-8" data-stagger>
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[36px_1fr] gap-2 text-[17px] leading-[1.5]">
              <span className="t-label t-fig pt-1 text-[var(--accent)]">{numbered ? String(i + 1).padStart(2, "0") : "·"}</span>
              <span className="text-ink">{it}</span>
            </li>
          ))}
        </ol>
      </div>
    );

  return (
    <>
      <div style={themeVars(c)}>
        <main id="main">
          <ProjectHero slug={slug} text={{ def: c.def[locale], label: c.label[locale], scroll: t("scroll") }} />

          {/* in breve: il problema detto semplice, chi, quando, con cosa */}
          <Reveal className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-36">
            <div className="grid gap-12 lg:grid-cols-12">
              <p className="text-[clamp(26px,3.2vw,44px)] font-medium leading-[1.15] tracking-[-0.035em] text-ink lg:col-span-8" data-reveal data-split>
                {p.problem[locale]}
              </p>
              <dl className="grid content-start gap-6 lg:col-span-3 lg:col-start-10" data-stagger>
                {meta.map(([k, v]) => (
                  <div key={k}>
                    <dt className="t-label text-ink-3">{k}</dt>
                    <dd className="mt-1 text-ink">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="t-label text-ink-3">{t("stack")}</dt>
                  <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {c.stack.map((id) => (
                      <span key={id} className="flex items-center gap-1.5 text-[14px] text-ink">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[var(--accent)]" aria-hidden>
                          <path d={BRAND[id].path} />
                        </svg>
                        {BRAND[id].title}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {c.tour ? (
            <Tour
              src={c.tour.src}
              w={c.tour.w}
              h={c.tour.h}
              light={c.theme.light}
              kicker={t("tour")}
              url={slug === "unispace" ? "studykit / studycut" : "creacloud"}
              stops={c.tour.stops.map((s) => ({ x: s.x, y: s.y, s: s.s, title: s.title[locale], body: s.body[locale] }))}
            />
          ) : (
            <RelaySystem kicker={t("system")} title={t("systemTitle")} body={t("systemBody")} nav={t("systemNav")} />
          )}

          {/* sotto il cofano: qui il dettaglio tecnico */}
          <Reveal className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-24 sm:px-8 sm:pt-36">
            <p className="t-label text-[var(--accent)]" data-reveal>
              {t("under")}
            </p>
            <p className="mt-5 max-w-[30ch] text-[clamp(26px,3.2vw,44px)] font-medium leading-[1.15] tracking-[-0.035em] text-ink" data-reveal data-split>
              {p.summary[locale]}
            </p>
            <ul className="mt-14 grid gap-8 sm:grid-cols-3" data-stagger>
              {p.figures.map((f) => (
                <li key={f.value} className="border-t border-[var(--line-strong)] pt-5">
                  <RollingText text={f.value} className="t-fig text-[clamp(36px,4vw,56px)] font-medium tracking-[-0.04em] text-ink" />
                  <p className="mt-2 text-ink-2">{f.label[locale]}</p>
                </li>
              ))}
            </ul>
            <div className="mt-16">
              {list(t("built"), p.built[locale])}
              {list(t("decisions"), p.decisions[locale], true)}
              {list(t("limits"), p.limits[locale])}
              {p.repo && (
                <div className="grid gap-6 border-t border-[var(--line-separator)] py-10 sm:grid-cols-12 sm:gap-8">
                  <h3 className="t-label text-ink-3 sm:col-span-4">{t("source")}</h3>
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--accent)] sm:col-span-8">
                    GitHub
                    <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden />
                  </a>
                </div>
              )}
            </div>
          </Reveal>

          {/* progetto successivo, poi il colore sfuma nel nero del sito */}
          <section className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
            <p className="t-label mb-6 text-ink-3">{t("next")}</p>
            <div className="max-w-[760px]">
              <CoverCard
                p={{
                  slug: next.slug,
                  name: getProject(next.slug)!.name,
                  label: next.label[locale],
                  def: next.def[locale],
                  scroll: t("scroll"),
                  stack: next.stack.map((id) => ({ id, name: BRAND[id].title })),
                }}
                open={tw("open")}
              />
            </div>
          </section>
          <div aria-hidden className="h-[60vh]" style={{ background: `linear-gradient(to bottom, ${c.theme.bg}, #000)` }} />
        </main>
      </div>
      <Footer withContact={false} />
      <SiteNav detail={{ title: p.name }} />
    </>
  );
}
