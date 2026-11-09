import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { projects } from "@/content/projects";
import { ProjectStory, type StoryItem } from "@/components/work/ProjectStory";
import { SectionHead } from "./SectionHead";

export const STORY_ORDER = ["creacloud", "relay", "unispace"];

function useStories(): StoryItem[] {
  const t = useTranslations("work");
  return STORY_ORDER.map((slug) => ({
    slug,
    name: projects.find((x) => x.slug === slug)!.name,
    beats: t.raw(`stories.${slug}.beats`) as [string, string, string],
  }));
}

export function Work() {
  const t = useTranslations("work");
  return (
    <section id="work" className="relative">
      <ProjectStory items={useStories()} cta={t("discover")}>
        <Reveal className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-32">
          <SectionHead index="01" title={t("title")} lead={t("lead")} />
        </Reveal>
      </ProjectStory>
      <div className="mx-auto flex w-full max-w-[1280px] justify-center px-5 pt-16 sm:px-8 lg:justify-start">
        <Drop href="/lavori" floating className="h-12 px-5 font-medium text-ink">
          {t("all")}
          <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
        </Drop>
      </div>
    </section>
  );
}

/** Le storie senza intestazione, per la pagina dei lavori. */
export function WorkStories() {
  const t = useTranslations("work");
  return <ProjectStory items={useStories()} cta={t("discover")} />;
}
