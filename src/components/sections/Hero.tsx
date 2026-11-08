import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { Reveal } from "@/components/motion/Reveal";
import { Fibers } from "@/components/visual/Fibers";
import { HeroTitle } from "./HeroTitle";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-24 pt-28">
      <Fibers />
      <Reveal className="relative flex w-full max-w-[1200px] flex-col items-center px-5 sm:px-8">
        <p className="t-label mb-10 inline-flex items-center gap-2 text-ink-2" data-reveal>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--positive)]" aria-hidden />
          {t("status")}
        </p>
        <HeroTitle a={[t("a1"), t("a2")]} b={[t("b1"), t("b2")]} />
        <p className="mt-10 max-w-[52ch] text-center text-ink-2 sm:text-[17px] sm:leading-[27px]" data-reveal>
          {t("lead")}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
          <Drop href="#work" accent className="h-12 px-5 font-medium text-ink">
            {t("work")}
            <ArrowDown size={18} strokeWidth={1.6} aria-hidden />
          </Drop>
          <Drop href="#contact" floating className="h-12 px-5 font-medium text-ink">
            {t("contact")}
          </Drop>
        </div>
      </Reveal>
    </section>
  );
}
