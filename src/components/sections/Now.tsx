import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

const KEYS = ["relay", "unispace", "portfolio"] as const;

export function Now() {
  const t = useTranslations("now");
  return (
    <Reveal as="section" id="now" className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead index="04" title={t("title")} lead={t("updated")} />
      <ul className="grid gap-px overflow-hidden rounded-[28px] sm:grid-cols-3" data-stagger>
        {KEYS.map((k, i) => (
          <li key={k} className="plate rounded-none p-6 sm:min-h-[200px] sm:p-7">
            <span className="t-label t-fig text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-6 text-ink">{t(`items.${k}`)}</p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
