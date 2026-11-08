import { useMessages, useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "./Faq";

export function Questions() {
  const t = useTranslations("faq");
  const m = useMessages() as unknown as { faq: { items: { q: string; a: string }[] } };
  return (
    <Reveal as="section" className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div>
        <h2 className="t-title1 text-ink sm:text-[56px] sm:leading-[60px]" data-reveal data-split>
          {t("title")}
        </h2>
        <p className="mt-4 max-w-[36ch] text-ink-2" data-reveal>
          {t("lead")}
        </p>
      </div>
      <div data-reveal>
        <Faq items={m.faq.items} />
      </div>
    </Reveal>
  );
}
