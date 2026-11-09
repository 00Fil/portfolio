import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { workCards } from "@/components/sections/Work";
import { CoverCard } from "@/components/work/CoverCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  return {
    title: t("pageTitle"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/lavori`, languages: { it: "/it/lavori", en: "/en/lavori" } },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("work");
  const cards = await workCards(locale as Locale);
  return (
    <>
      <main id="main" className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <Reveal as="header" className="max-w-[760px]">
          <h1 className="text-[clamp(56px,9vw,140px)] font-medium leading-[0.9] tracking-[-0.06em] text-ink" data-reveal data-split>
            {t("pageTitle")}
          </h1>
          <p className="mt-6 max-w-[44ch] text-[19px] leading-[1.5] text-ink-2" data-reveal>
            {t("pageLead")}
          </p>
        </Reveal>
        <div className="mt-16 grid gap-20 sm:mt-24">
          {cards.map((c) => (
            <Reveal key={c.slug}>
              <div data-reveal>
                <CoverCard p={c} open={t("open")} big />
              </div>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
      <SiteNav detail={{ title: t("pageTitle") }} />
    </>
  );
}
