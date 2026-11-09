"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Drop } from "@/components/glass/Drop";
import { GlassSegmented } from "./GlassSegmented";
import { loadSoundPref, onSound, play, setSound, soundOn } from "@/lib/sound";
import { profile } from "@/content/profile";
import { scrollToY } from "@/lib/scroll";

const NAMES: Record<Locale, string> = { it: "Italiano", en: "English" };

export function TopBar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [sound, setS] = useState(false);

  useEffect(() => {
    setS(loadSoundPref());
    return onSound(setS) as () => void;
  }, []);

  const options = routing.locales.map((l) => ({ value: l, label: l.toUpperCase(), full: NAMES[l] }));
  const onSelect = useCallback(
    (i: number) => {
      const next = routing.locales[i];
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const y = window.scrollY;
      try {
        sessionStorage.setItem("restoreY", String(y));
      } catch {
        /* niente */
      }
      router.replace(`${pathname}${hash}`, { locale: next, scroll: false });
    },
    [pathname, router],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center lg:hidden justify-between px-4 pt-4 sm:px-6 sm:pt-5">
      <a
        href={`/${locale}`}
        onClick={(e) => {
          if (pathname === "/") {
            e.preventDefault();
            scrollToY(0);
          }
        }}
        className="pointer-events-auto t-label rounded-full px-2 py-2 text-white mix-blend-difference"
        aria-label={profile.name}
      >
        {profile.name}
      </a>
      <div className="pointer-events-auto flex items-center gap-2">
        <GlassSegmented id="lens-lang" options={options} selected={routing.locales.indexOf(locale)} onSelect={onSelect} label={t("language")} />
        <Drop
          floating
          className="h-[42px] w-[42px] bg-black/55"
          label={sound ? t("soundOn") : t("soundOff")}
          onClick={() => {
            const on = !soundOn();
            setSound(on);
            if (on) play("toggle");
          }}
        >
          {sound ? <Volume2 size={18} strokeWidth={1.6} aria-hidden /> : <VolumeX size={18} strokeWidth={1.6} aria-hidden className="text-ink-2" />}
        </Drop>
      </div>
    </header>
  );
}
