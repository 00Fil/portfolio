"use client";

import * as si from "simple-icons";
import { useLocale, useTranslations } from "next-intl";
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
 * Riga dell'area clienti dentro la capsula di navigazione: acrilico azzurro, sempre visibile.
 * "top": sotto le voci della barra in alto · "bar": sopra le icone della barra in basso, su telefono.
 */
export function ClientRow({ variant }: { variant: "top" | "bar" }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const links = [
    { href: profile.clientArea.ios, label: "iOS", long: "App Store", icon: <Logo path={si.siApple.path} /> },
    { href: profile.clientArea.android, label: "Android", long: "Google Play", icon: <Logo path={si.siGoogleplay.path} /> },
    { href: profile.clientArea.web || `/${locale}/accedi`, label: t("stripWeb"), long: t("stripWeb"), icon: <Globe /> },
  ];
  const top = variant === "top";
  return (
    <div
      role="note"
      aria-label={t("stripLabel")}
      className={`client-row flex items-center gap-3 text-ink ${top ? "mx-[6px] mb-[6px] h-[36px] pl-4 pr-[5px] text-[13px]" : "h-[36px] pl-4 pr-[5px] text-[12px]"}`}
      // concentrica con la capsula: raggio della capsula meno il margine (6 px) sul lato che la tocca
      style={{ borderRadius: top ? "12px 12px 24px 24px" : "27px 27px 10px 10px" }}
    >
      <p className="min-w-0 flex-1 truncate">
        {top ? (
          <>
            <span className="font-medium">{t("stripLead")}</span>
            <span className="text-ink-2"> {t("strip")}</span>
          </>
        ) : (
          <span className="font-medium">{t("stripMobile")}</span>
        )}
      </p>
      <span className="flex shrink-0 items-center gap-1">
        {links.map((l) => (
          <a
            key={l.long}
            href={l.href || "#"}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={l.long}
            className={`flex h-[26px] items-center gap-1.5 rounded-full bg-[var(--strip-btn)] font-medium text-ink shadow-[inset_0_0_0_1px_var(--strip-edge)] transition-colors hover:bg-[var(--strip-btn-hover)] ${top ? "px-3" : "w-[30px] justify-center"}`}
          >
            {l.icon}
            {top && <span>{l.label}</span>}
          </a>
        ))}
      </span>
    </div>
  );
}
