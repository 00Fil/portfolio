import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/routing";
import { WorkTile } from "./WorkTile";
import { RelayPreview } from "@/components/previews/RelayPreview";
import { CreaCloudPreview } from "@/components/previews/CreaCloudPreview";
import { UniSpacePreview } from "@/components/previews/UniSpacePreview";
import { MaturitaPreview } from "@/components/previews/MaturitaPreview";
import { CanaryTile, GitTile, PipelineTile, ReleaseTile } from "@/components/previews/Workflow";
import { SectionHead } from "./SectionHead";

const PREVIEW = {
  relay: <RelayPreview />,
  creacloud: <CreaCloudPreview />,
  unispace: <UniSpacePreview />,
  "maturita-2k26": <MaturitaPreview />,
} as const;

export function Work() {
  const t = useTranslations("work");
  const locale = useLocale() as Locale;
  const tile = (slug: keyof typeof PREVIEW, className: string, aspect: string) => {
    const p = projects.find((x) => x.slug === slug)!;
    return (
      <WorkTile
        key={slug}
        slug={slug}
        className={className}
        aspect={aspect}
        headline={p.headline[locale]}
        context={p.context[locale]}
        tags={p.tags[locale]}
        view={t("view")}
        label={t("open", { name: p.name })}
      >
        {PREVIEW[slug]}
      </WorkTile>
    );
  };
  const demo = "relative aspect-square overflow-hidden rounded-[28px] bg-surface";
  return (
    <Reveal as="section" id="work" className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead index="01" title={t("title")} lead={t("lead")} />
      <div className="grid grid-cols-1 gap-x-4 gap-y-12 lg:grid-cols-12" data-stagger>
        {tile("relay", "lg:col-span-7", "aspect-[4/3]")}
        <div className="grid grid-cols-2 gap-4 self-start lg:col-span-5">
          <div className={demo}>
            <PipelineTile />
          </div>
          <div className={demo}>
            <GitTile />
          </div>
          <div className={demo}>
            <ReleaseTile />
          </div>
          <div className={demo}>
            <CanaryTile />
          </div>
        </div>
        {tile("creacloud", "lg:col-span-6", "aspect-[4/3]")}
        {tile("unispace", "lg:col-span-6", "aspect-[4/3]")}
        {tile("maturita-2k26", "lg:col-span-12", "aspect-[4/3] sm:aspect-[21/9]")}
      </div>
    </Reveal>
  );
}
