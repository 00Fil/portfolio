"use client";

import { House, Layers, LayoutGrid, Mail, Route, Waypoints } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlassTabBar, type Tab } from "./GlassTabBar";
import { GlassTopNav } from "./GlassTopNav";

export const SECTION_IDS = ["home", "work", "approach", "stack", "path", "contact"] as const;

export function SiteNav({ detail }: { detail?: { title: string; section?: "work" | "approach" } }) {
  const sec = detail?.section ?? "work";
  const t = useTranslations("nav");
  const icons = [House, LayoutGrid, Waypoints, Layers, Route, Mail];
  const tabs: Tab[] = SECTION_IDS.map((id, i) => ({ id, label: t(id), icon: icons[i] }));
  return (
    <>
    <GlassTopNav home={!detail} section={sec} />
    <GlassTabBar
      tabs={tabs}
      navLabel={t("label")}
      detail={detail ? { title: detail.title, backLabel: sec === "work" ? t("back") : t(sec), activeIndex: SECTION_IDS.indexOf(sec), section: sec } : undefined}
    />
    </>
  );
}
