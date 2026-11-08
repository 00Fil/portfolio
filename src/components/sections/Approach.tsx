import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { PixelEdge } from "@/components/visual/PixelEdge";
import { PixelNetwork } from "@/components/visual/PixelNetwork";

export function Approach() {
  const t = useTranslations("approach");
  return (
    <section id="approach" className="relative">
      <PixelEdge side="top" />
      <div className="bg-[var(--accent)] text-white">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-5 pb-16 pt-4 sm:px-8 sm:pb-24">
          <PixelNetwork />
          <Reveal className="mt-12 grid w-full gap-8 lg:grid-cols-2 lg:gap-16">
            <h2 className="t-title1 sm:text-[48px] sm:leading-[52px]" data-reveal data-split>
              {t("title")}
            </h2>
            <div data-reveal>
              <p className="max-w-[52ch] text-[17px] leading-[27px] text-white/85">{t("body")}</p>
              <div className="mt-8">
                <Drop href="/lavori/relay" className="h-11 px-4 font-medium text-white" accent={false}>
                  {t("cta")}
                  <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden />
                </Drop>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <PixelEdge side="bottom" />
    </section>
  );
}
