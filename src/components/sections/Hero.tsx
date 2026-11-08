import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { Reveal } from "@/components/motion/Reveal";
import { Fibers } from "@/components/visual/Fibers";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <Fibers />
      <Reveal className="relative mx-auto w-full max-w-[1200px] px-5 pb-[148px] sm:px-8 sm:pb-[176px]">
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2" data-reveal>
          <span className="t-label text-ink">{t("role")}</span>
          <span className="t-label inline-flex items-center gap-2 text-ink-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--positive)]" aria-hidden />
            {t("status")}
          </span>
        </div>
        <h1 className="max-w-[22ch] text-[clamp(32px,4.4vw,56px)] font-medium leading-[1.08] tracking-[-0.025em] text-ink" data-reveal data-split>
          {t("lead")}
        </h1>
        <p className="t-callout mt-6 max-w-[40ch] text-ink-2" data-reveal>
          {t("sub")}
        </p>
        <div className="mt-10 flex flex-wrap gap-3" data-reveal>
          <Drop href="#work" accent className="h-12 px-5 t-body font-medium text-ink">
            {t("work")}
            <ArrowRight size={18} strokeWidth={1.6} aria-hidden />
          </Drop>
          <Drop href="#contact" className="h-12 px-5 t-body font-medium text-ink">
            {t("contact")}
          </Drop>
        </div>
      </Reveal>
    </section>
  );
}
