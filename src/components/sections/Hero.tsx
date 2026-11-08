import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { Reveal } from "@/components/motion/Reveal";
import { HeroSky } from "@/components/visual/HeroSky";
import { profile } from "@/content/profile";
import { HeroTitle } from "./HeroTitle";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-28 pt-32">
      <HeroSky />
      <Reveal className="relative flex w-full max-w-[1200px] flex-col items-center px-5 sm:px-8">
        <p className="t-label mb-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-ink-2 backdrop-blur" data-reveal>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--positive)]" aria-hidden />
          {t("status")}
        </p>
        <HeroTitle a={[t("a1"), t("a1b"), t("a2")]} b={[t("b1"), t("b1b"), t("b2")]} photo={profile.photo} />
        <p className="mt-10 max-w-[54ch] text-center text-ink sm:text-[17px] sm:leading-[27px]" data-reveal>
          {t("lead", { name: profile.name })}
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
