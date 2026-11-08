import { useLocale, useMessages, useTranslations } from "next-intl";
import { profile } from "@/content/profile";
import { Story } from "./Story";

export function Path() {
  const t = useTranslations("story");
  const locale = useLocale();
  const m = useMessages() as unknown as { story: { chapters: { tag: string; title: string; body: string; value: number; unit: string }[] } };
  return <Story chapters={m.story.chapters} title={t("title")} lead={t("lead")} locale={locale} photo={profile.photo} />;
}
