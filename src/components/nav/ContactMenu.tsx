"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useMessages } from "next-intl";
import * as si from "simple-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ArrowUpRight01Icon, Calendar03Icon, CheckmarkCircle02Icon, File01Icon, Mail01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import { Drop } from "@/components/glass/Drop";
import { Bead } from "@/components/glass/Bead";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";
import { Clock } from "@/components/sections/Clock";
import { useFirstSlot } from "@/components/chat/Widgets";

type T = { status: string; book: string; bookSub: string; chat: string; chatSub: string; email: string; copied: string; linkedin: string; instagram: string; whatsapp: string; github: string; cv: string };

const Brand = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
    <path d={d} />
  </svg>
);
/** LinkedIn non è più in simple-icons: monogramma disegnato qui. */
const LinkedIn = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="currentColor" />
    <path d="M7.4 10.2v6.6M7.4 7.3v.1M11 16.8v-4c0-1.5 1-2.6 2.4-2.6s2.2 1 2.2 2.6v4M11 10.2v6.6" stroke="var(--bg-canvas)" strokeWidth="1.9" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * Un solo menu per tutti i contatti: chiamata e chat in primo piano, poi i canali (email, social, CV).
 * Lo usano il pannello della barra in alto e il cassetto della barra su telefono.
 */
export function ContactMenu({ onPick, compact = false }: { onPick?: () => void; compact?: boolean }) {
  const t = (useMessages() as unknown as { contactMenu: T }).contactMenu;
  const locale = useLocale() as Locale;
  const first = useFirstSlot(locale);
  const [copied, setCopied] = useState(false);

  const channels: { key: string; label: string; icon: ReactNode; href?: string; onClick?: () => void; ext?: boolean; download?: boolean }[] = [
    profile.email && {
      key: "email",
      label: copied ? t.copied : t.email,
      icon: <HugeiconsIcon icon={(copied ? CheckmarkCircle02Icon : Mail01Icon) as IconSvgElement} size={19} strokeWidth={1.6} />,
      href: `mailto:${profile.email}`,
      onClick: () => {
        void navigator.clipboard?.writeText(profile.email).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        });
      },
    },
    profile.linkedin && { key: "linkedin", label: t.linkedin, icon: <LinkedIn />, href: profile.linkedin, ext: true },
    profile.instagram && { key: "instagram", label: t.instagram, icon: <Brand d={si.siInstagram.path} />, href: profile.instagram, ext: true },
    profile.whatsapp && { key: "whatsapp", label: t.whatsapp, icon: <Brand d={si.siWhatsapp.path} />, href: `https://wa.me/${profile.whatsapp}`, ext: true },
    profile.github && { key: "github", label: t.github, icon: <Brand d={si.siGithub.path} />, href: profile.github, ext: true },
    profile.cv[locale] && { key: "cv", label: t.cv, icon: <HugeiconsIcon icon={File01Icon as IconSvgElement} size={19} strokeWidth={1.6} />, href: profile.cv[locale], download: true },
  ].filter(Boolean) as never;

  return (
    <div className={compact ? "" : "w-[420px] p-2"}>
      {/* chi risponde, e quando */}
      <div className="flex items-center gap-3.5 px-1 pb-4 pt-1" data-mi data-di>
        <span className="relative">
          <Bead tint="dark" className="flex h-11 w-11 items-center justify-center text-[13px] font-medium tracking-[-0.01em] text-white" aria-hidden>
            FC
          </Bead>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#30d158] shadow-[0_0_0_2px_var(--panel-solid,var(--bg-canvas))]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[14.5px] font-medium text-ink">{profile.name}</span>
          <span className="block truncate text-[12.5px] text-ink-3">{t.status}</span>
        </span>
        <span className="t-foot shrink-0 text-right text-ink-3">
          {profile.city}
          <br />
          <Clock locale={locale} />
        </span>
      </div>

      {/* le due vie principali: due gocce di vetro, la prima con l'accento */}
      <div className="grid grid-cols-2 gap-2.5" data-mi data-di>
        <Drop accent radius={24} href="#brief" onClick={onPick} className="!flex min-h-[116px] !items-stretch !justify-between !gap-0 !rounded-[24px] p-4 text-left text-ink">
          <span className="flex w-full flex-col justify-between">
            <span className="flex items-center justify-between">
              <HugeiconsIcon icon={Calendar03Icon as IconSvgElement} size={21} strokeWidth={1.6} aria-hidden />
              <HugeiconsIcon icon={ArrowUpRight01Icon as IconSvgElement} size={16} strokeWidth={1.8} className="opacity-60" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[14.5px] font-medium">{t.book}</span>
              <span className="mt-0.5 block text-[12px] text-ink-2">{first ? first : t.bookSub}</span>
            </span>
          </span>
        </Drop>
        <Drop
          radius={24}
          onClick={() => {
            onPick?.();
            window.dispatchEvent(new Event("chat:open"));
          }}
          className="!flex min-h-[116px] !items-stretch !justify-between !gap-0 !rounded-[24px] p-4 text-left text-ink"
        >
          <span className="flex w-full flex-col justify-between">
            <span className="flex items-center justify-between">
              <HugeiconsIcon icon={Message01Icon as IconSvgElement} size={21} strokeWidth={1.6} aria-hidden />
              <span className="h-2 w-2 rounded-full bg-[#30d158] shadow-[0_0_0_3px_rgba(48,209,88,.22)]" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[14.5px] font-medium">{t.chat}</span>
              <span className="mt-0.5 block text-[12px] text-ink-3">{t.chatSub}</span>
            </span>
          </span>
        </Drop>
      </div>

      {/* canali: una goccia per ciascuno */}
      {channels.length > 0 && (
        <div className="mt-3.5 grid gap-1 pt-1" style={{ gridTemplateColumns: `repeat(${Math.min(channels.length, compact ? 4 : 5)}, minmax(0, 1fr))` }} data-mi data-di>
          {channels.map((c) => {
            const body = (
              <span className="flex flex-col items-center gap-1.5 px-1 py-1.5">
                <Drop
                  {...(c.href && !c.onClick ? { href: c.href, external: c.ext, download: c.download } : { onClick: () => c.onClick?.() })}
                  className="!h-12 !w-12 text-ink"
                  label={c.label}
                >
                  {c.icon}
                </Drop>
                <span className="w-full truncate text-center text-[12px] text-ink-2">{c.label}</span>
              </span>
            );
            return <span key={c.key}>{body}</span>;
          })}
        </div>
      )}
    </div>
  );
}
