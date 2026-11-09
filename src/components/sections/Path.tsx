import { useMessages, useTranslations } from "next-intl";
import { Timeline, type Milestone } from "./Timeline";

export function Path() {
  const t = useTranslations("story");
  const m = useMessages() as unknown as { story: { chapters: Milestone[] } };
  return <Timeline title={t("title")} lead={t("lead")} items={m.story.chapters} />;
}
