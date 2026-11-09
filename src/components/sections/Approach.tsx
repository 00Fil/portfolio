import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { MethodTrack, type Phase } from "@/components/method/MethodTrack";
import { SectionHead } from "./SectionHead";

/** Metodo: come porto un progetto dall'idea alla produzione, e i principi che lo tengono in piedi. */
export function Approach() {
  const t = useTranslations("method");
  const phases = t.raw("phases") as Phase[];
  return (
    <section id="approach" className="relative pt-24 sm:pt-40">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <MethodTrack phases={phases} output={t("output")} />
    </section>
  );
}
