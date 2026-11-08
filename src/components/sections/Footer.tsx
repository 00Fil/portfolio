import { useTranslations } from "next-intl";
import { profile } from "@/content/profile";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 pb-32 pt-8 sm:px-8">
      <span className="t-label t-fig text-ink-3">
        © 2026 {profile.name}
      </span>
      <span className="t-foot text-ink-3">{t("made")}</span>
    </footer>
  );
}
