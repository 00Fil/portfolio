"use client";

import { House, Layers, LayoutGrid, Mail, Route, Waypoints } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlassTabBar, type Tab } from "./GlassTabBar";
import { GlassTopNav } from "./GlassTopNav";

export const SECTION_IDS = ["home", "approach", "work", "path", "stack", "contact"] as const;

/** `plain`: pagine riservate (accesso, area clienti), senza la striscia promozionale e senza sezione evidenziata. */
export function SiteNav({ detail, plain = false }: { detail?: { title: string; section?: "work" | "approach" | "home" }; plain?: boolean }) {
  const sec = detail?.section ?? "work";
  const t = useTranslations("nav");
  const icons = [House, Waypoints, LayoutGrid, Route, Layers, Mail];
  const tabs: Tab[] = SECTION_IDS.map((id, i) => ({ id, label: t(id), short: t(`tabShort.${id}`), icon: icons[i] }));
  return (
    <>
    <GlassTopNav home={!detail} section={sec} plain={plain} />
    <GlassTabBar
      tabs={tabs}
      navLabel={t("label")}
      plain={plain}
      detail={detail ? { title: detail.title, backLabel: sec === "work" ? t("back") : t(sec), activeIndex: SECTION_IDS.indexOf(sec), section: sec } : undefined}
    />
    </>
  );
}
