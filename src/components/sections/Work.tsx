import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { projects } from "@/content/projects";
import { ProjectStory, type StoryItem } from "@/components/work/ProjectStory";
import { SectionHead } from "./SectionHead";

export const STORY_ORDER = ["creacloud", "relay", "unispace"];

export function useStories(): { items: StoryItem[]; steps: [string, string, string] } {
  const t = useTranslations("work");
  const items = STORY_ORDER.map((slug) => {
    const p = projects.find((x) => x.slug === slug)!;
    return { slug, name: p.name, kicker: t(`stories.${slug}.kicker`), lines: t.raw(`stories.${slug}.lines`) as [string, string, string] };
  });
  return { items, steps: t.raw("steps") as [string, string, string] };
}

export function Work() {
  const t = useTranslations("work");
  const { items, steps } = useStories();
  return (
    <section id="work" className="relative pt-24 sm:pt-32">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="01" title={t("title")} lead={t("lead")} />
      </Reveal>
      <ProjectStory items={items} steps={steps} cta={t("case")} />
      <div className="mx-auto flex w-full max-w-[1280px] justify-center px-5 pt-12 sm:px-8 lg:justify-start">
        <Drop href="/lavori" floating className="h-12 px-5 font-medium text-ink">
          {t("all")}
          <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
        </Drop>
      </div>
    </section>
  );
}

/** I racconti dei progetti senza intestazione, per la pagina dei lavori. */
export function WorkStories() {
  const t = useTranslations("work");
  const { items, steps } = useStories();
  return <ProjectStory items={items} steps={steps} cta={t("case")} />;
}
