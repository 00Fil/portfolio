import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { Showcase, type ShowcaseItem } from "@/components/work/Showcase";
import { ArrowUpRight } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { SectionHead } from "./SectionHead";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function showcaseItems(locale: Locale): ShowcaseItem[] {
  return projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    headline: p.headline[locale],
    context: cap(p.context[locale].split(",").slice(1).join(",").trim() || p.context[locale]),
    role: p.role[locale],
    year: p.year,
    stack: p.stack,
  }));
}

export function Work() {
  const t = useTranslations("work");
  const locale = useLocale() as Locale;
  return (
    <section id="work" className="relative pt-24 sm:pt-32">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="01" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Showcase items={showcaseItems(locale)} open={t("case")} />
      <div className="mx-auto flex w-full max-w-[1280px] justify-center px-5 pt-16 sm:px-8 lg:justify-start lg:pt-10">
        <Drop href="/lavori" floating className="h-12 px-5 font-medium text-ink">
          {t("all")}
          <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
        </Drop>
      </div>
    </section>
  );
}
