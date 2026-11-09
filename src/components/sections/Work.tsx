import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { COVERS } from "@/content/covers";
import { BRAND } from "@/content/brand-icons";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { CoverCard, type CardData } from "@/components/work/CoverCard";
import { SectionHead } from "./SectionHead";

export async function workCards(locale: Locale): Promise<CardData[]> {
  return COVERS.map((c) => ({
    slug: c.slug,
    name: projects.find((p) => p.slug === c.slug)!.name,
    label: c.label[locale],
    def: c.def[locale],
    stack: c.stack.map((id) => ({ id, name: BRAND[id].title })),
  }));
}

/** Tre copertine: la prima grande, le altre affiancate. Il racconto è nella pagina di ogni progetto. */
export async function Work() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("work");
  const cards = await workCards(locale);
  return (
    <section id="work" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="01" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="mt-12 grid gap-x-8 gap-y-16 sm:mt-16 lg:grid-cols-2">
        <Reveal className="lg:col-span-2">
          <div data-reveal>
            <CoverCard p={cards[0]} open={t("open")} big />
          </div>
        </Reveal>
        {cards.slice(1).map((c) => (
          <Reveal key={c.slug}>
            <div data-reveal>
              <CoverCard p={c} open={t("open")} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
