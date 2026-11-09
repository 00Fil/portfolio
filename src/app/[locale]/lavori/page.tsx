import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { projects } from "@/content/projects";
import { PageEnter } from "@/components/motion/PageEnter";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { WorkIndex } from "@/components/work/WorkIndex";
import { WorkStories } from "@/components/sections/Work";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  return {
    title: t("pageTitle"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/lavori`, languages: { it: "/it/lavori", en: "/en/lavori" } },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: l } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const t = await getTranslations("work");
  const tp = await getTranslations("project");
  const items = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    headline: p.headline[locale],
    role: p.role[locale],
    platforms: p.platforms[locale],
    year: p.year,
    problem: p.problem[locale],
    built: p.built[locale],
    figures: p.figures.map((f) => ({ value: f.value, label: f.label[locale] })),
  }));
  return (
    <>
      <PageEnter>
        <main id="main">
          <WorkIndex
            items={items}
            l={{
              title: t("pageTitle"),
              lead: t("pageLead"),
              project: t("colProject"),
              role: t("colRole"),
              platforms: t("colPlatforms"),
              year: t("colYear"),
              problem: tp("problem"),
              built: tp("built"),
              open: t("case"),
            }}
          />
          <WorkStories />
        </main>
        <Footer />
      </PageEnter>
      <SiteNav detail={{ title: t("pageTitle") }} />
    </>
  );
}
