"use client";

import * as si from "simple-icons";
import { useTranslations } from "next-intl";
import { profile } from "@/content/profile";

const Logo = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] fill-current" aria-hidden>
    <path d={path} />
  </svg>
);
const Globe = () => (
  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);

/**
 * Fascia sopra la barra, sempre presente: con ogni progetto c'è l'area clienti,
 * sull'app (iOS e Android) e sul sito.
 */
export function ClientStrip() {
  const t = useTranslations("nav");
  const links = [
    { href: profile.clientArea.ios, label: "iOS", long: "App Store", icon: <Logo path={si.siApple.path} /> },
    { href: profile.clientArea.android, label: "Android", long: "Google Play", icon: <Logo path={si.siGoogleplay.path} /> },
    { href: profile.clientArea.web, label: t("stripWeb"), long: t("stripWeb"), icon: <Globe /> },
  ];
  return (
    <aside aria-label={t("stripLabel")} className="client-strip fixed inset-x-0 top-0 z-[51] flex h-[var(--strip-h)] items-center justify-center gap-3 px-3 text-[12.5px] text-ink sm:gap-5 sm:px-6 sm:text-[13px]">
      <p className="min-w-0 truncate">
        <span className="font-medium sm:hidden">{t("stripMobile")}</span>
        <span className="hidden font-medium sm:inline">{t("stripLead")}</span>
        <span className="hidden text-ink-2 lg:inline"> {t("strip")}</span>
        <span className="hidden text-ink-2 sm:inline lg:hidden"> {t("stripShort")}</span>
      </p>
      <span className="flex shrink-0 items-center gap-1.5">
        {links.map((l) => (
          <a
            key={l.long}
            href={l.href || "#"}
            target={l.href && l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={l.long}
            className="flex h-[26px] items-center gap-1.5 rounded-full bg-[var(--strip-btn)] px-2.5 font-medium text-ink shadow-[inset_0_0_0_1px_var(--strip-edge)] transition-colors hover:bg-[var(--strip-btn-hover)] sm:px-3"
          >
            {l.icon}
            <span className="hidden sm:inline">{l.label}</span>
          </a>
        ))}
      </span>
    </aside>
  );
}
