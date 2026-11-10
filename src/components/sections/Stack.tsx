import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { StackLoop } from "./StackLoop";
import { SectionHead } from "./SectionHead";

/** Competenze: due nastri di marchi in direzioni opposte, niente elenchi. */
export function Stack() {
  const t = useTranslations("stack");
  return (
    <section id="stack" className="relative pt-20 sm:pt-36">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="05" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="mt-10 sm:mt-14">
        <StackLoop />
      </div>
    </section>
  );
}
