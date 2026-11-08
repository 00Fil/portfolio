import { useTranslations } from "next-intl";
import { Drop } from "@/components/glass/Drop";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main id="main" className="mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-center px-5 sm:px-8">
      <p className="t-label t-fig text-ink-3">404</p>
      <h1 className="t-title1 mt-4 text-ink">{t("title")}</h1>
      <div className="mt-8">
        <Drop href="/" accent className="h-12 px-5 font-medium text-ink">
          {t("home")}
        </Drop>
      </div>
    </main>
  );
}
