import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, FileText } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { SectionHead } from "./SectionHead";
import { CopyEmail } from "./CopyEmail";

export function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale() as Locale;
  const cv = profile.cv[locale];
  return (
    <Reveal as="section" id="contact" className="mx-auto w-full max-w-[1200px] px-5 pb-40 pt-24 sm:px-8 sm:pb-48 sm:pt-32">
      <SectionHead index="05" title={t("title")} lead={t("lead")} />
      {profile.email && <CopyEmail email={profile.email} copy={t("copy")} copied={t("copied")} />}
      <div className="mt-6 flex flex-wrap gap-3" data-reveal>
        {profile.github && (
          <Drop href={profile.github} external className="h-12 px-5 font-medium text-ink">
            {t("github")}
            <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden className="text-ink-2" />
          </Drop>
        )}
        {profile.linkedin && (
          <Drop href={profile.linkedin} external className="h-12 px-5 font-medium text-ink">
            {t("linkedin")}
            <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden className="text-ink-2" />
          </Drop>
        )}
        {cv && (
          <Drop href={cv} download className="h-12 px-5 font-medium text-ink">
            <FileText size={18} strokeWidth={1.6} aria-hidden className="text-ink-2" />
            {t("cv")}
          </Drop>
        )}
      </div>
    </Reveal>
  );
}
