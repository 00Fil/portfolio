import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";
import { PathLine } from "./PathLine";

const KEYS = ["unibs", "freelance", "maturita", "pcto"] as const;

export function Path() {
  const t = useTranslations("path");
  return (
    <Reveal as="section" id="path" className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead index="03" title={t("title")} />
      <div className="relative">
        <PathLine />
        <ol className="relative" data-stagger>
          {KEYS.map((k) => (
            <li key={k} className="grid grid-cols-[24px_1fr] gap-x-4 pb-12 last:pb-0 sm:grid-cols-[56px_160px_1fr] sm:gap-x-4">
              <span className="relative mt-[9px] flex h-[11px] w-[11px] items-center justify-center rounded-full border border-line-strong bg-canvas" aria-hidden>
                <span className="path-dot h-[5px] w-[5px] rounded-full bg-[var(--accent)]" />
              </span>
              <span className="t-label t-fig col-start-2 pt-[6px] text-ink-3 sm:col-start-auto">{t(`items.${k}.when`)}</span>
              <div className="col-start-2 mt-1 sm:col-start-auto sm:mt-0">
                <p className="t-title3 text-ink">{t(`items.${k}.what`)}</p>
                <p className="mt-1 text-ink-2">{t(`items.${k}.where`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
