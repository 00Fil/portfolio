"use client";

import { Clock, House, Layers, LayoutGrid, Mail, Route } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlassTabBar, type Tab } from "./GlassTabBar";

export const SECTION_IDS = ["home", "work", "stack", "path", "now", "contact"] as const;

export function SiteNav({ detail }: { detail?: { title: string } }) {
  const t = useTranslations("nav");
  const icons = [House, LayoutGrid, Layers, Route, Clock, Mail];
  const tabs: Tab[] = SECTION_IDS.map((id, i) => ({ id, label: t(id), icon: icons[i] }));
  return (
    <GlassTabBar
      tabs={tabs}
      navLabel={t("label")}
      detail={detail ? { title: detail.title, backLabel: t("back"), activeIndex: 1 } : undefined}
    />
  );
}
