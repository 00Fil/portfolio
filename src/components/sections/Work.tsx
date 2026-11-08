import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { WorkRow } from "./WorkRow";
import { SectionHead } from "./SectionHead";

export function Work() {
  const t = useTranslations("work");
  const locale = useLocale() as Locale;
  return (
    <Reveal as="section" id="work" className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead index="01" title={t("title")} lead={t("lead")} />
      <div className="work-list grid gap-3" data-stagger>
        {projects.map((p, i) => (
          <WorkRow
            key={p.slug}
            slug={p.slug}
            index={String(i + 1).padStart(2, "0")}
            name={p.name}
            line={p.line[locale]}
            year={p.year}
            stack={p.stack}
            open={t("open", { name: p.name })}
          />
        ))}
      </div>
    </Reveal>
  );
}
