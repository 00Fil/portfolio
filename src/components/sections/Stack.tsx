import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { SKILL_GROUPS } from "@/content/skills";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { StackLoop } from "./StackLoop";
import { SectionHead } from "./SectionHead";

/** Competenze: un nastro di marchi e nove aree, ognuna in una scheda con la luce che segue il cursore (React Bits). */
export function Stack() {
  const t = useTranslations("stack");
  return (
    <section id="stack" className="relative pt-24 sm:pt-36">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="03" title={t("title")} lead={t("lead")} />
      </Reveal>

      <StackLoop />

      <Reveal className="mx-auto mt-10 grid w-full max-w-[1280px] gap-3.5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {SKILL_GROUPS.map((g, i) => (
          <div key={g.key} data-reveal className="h-full">
            <SpotlightCard
              className="h-full rounded-[28px] border border-white/[0.07] bg-[#111214] p-6"
              spotlightColor="rgba(94, 196, 255, 0.16)"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-[19px] font-medium tracking-[-0.02em] text-ink">{t(`groups.${g.key}`)}</h3>
                <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s.name} className="flex h-8 items-center gap-2 rounded-full bg-white/[0.05] px-3 text-[13px] text-ink-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] transition-colors duration-300 hover:bg-white/[0.09] hover:text-ink">
                    {s.path && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                        <path d={s.path} />
                      </svg>
                    )}
                    {s.name}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
