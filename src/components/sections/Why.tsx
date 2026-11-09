import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { SectionHead } from "./SectionHead";

/** Le ragioni per scegliere, dette in quattro righe; poi l'invito a scrivere. */
export function Why() {
  const t = useTranslations("why");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section id="why" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="03" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
        {items.map((it, i) => (
          <div key={it.title} className="border-t border-[var(--hair)] pt-6">
            <p className="t-serif text-[56px] italic leading-none text-[var(--sky)]">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-5 text-[22px] font-medium tracking-[-0.025em] text-ink">{it.title}</h3>
            <p className="mt-2 text-[16px] leading-[1.55] text-ink-2">{it.body}</p>
          </div>
        ))}
        </div>
      </Reveal>
      <Reveal className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[var(--card)] p-8 shadow-[inset_0_0_0_1px_var(--hair)] sm:flex-row sm:items-center sm:p-10">
        <p className="text-[clamp(26px,3vw,40px)] font-medium tracking-[-0.035em] text-ink" data-reveal>
          {t("cta")}
        </p>
        <div data-reveal>
          <Drop href="#brief" accent className="h-12 px-5 font-medium text-ink">
            {t("ctaBtn")}
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </Drop>
        </div>
      </Reveal>
    </section>
  );
}
