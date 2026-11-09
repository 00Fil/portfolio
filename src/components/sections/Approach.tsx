import { useTranslations } from "next-intl";
import { Accessibility, Gauge, KeyRound, MessagesSquare, Code2, Minimize2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MethodTrack, type Phase } from "@/components/method/MethodTrack";
import { SectionHead } from "./SectionHead";

const ICONS = [KeyRound, Minimize2, Gauge, Accessibility, MessagesSquare, Code2];

/** Metodo: come porto un progetto dall'idea alla produzione, e i principi che lo tengono in piedi. */
export function Approach() {
  const t = useTranslations("method");
  const phases = t.raw("phases") as Phase[];
  const principles = t.raw("principles") as { title: string; body: string }[];
  return (
    <section id="approach" className="relative pt-24 sm:pt-40">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <MethodTrack phases={phases} output={t("output")} />
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 pb-8 pt-24 sm:px-8 sm:pt-32">
        <h3 className="t-title2 max-w-[20ch] text-ink" data-reveal data-split>
          {t("principlesTitle")}
        </h3>
        <ul className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {principles.map((p, i) => {
            const I = ICONS[i];
            return (
              <li key={p.title}>
                <I size={22} strokeWidth={1.5} className="text-[var(--sky)]" aria-hidden />
                <p className="mt-4 text-[19px] font-medium tracking-[-0.01em] text-ink">{p.title}</p>
                <p className="mt-2 max-w-[38ch] text-ink-2">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
