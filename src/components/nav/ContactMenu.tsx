"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useMessages } from "next-intl";
import * as si from "simple-icons";
import { ArrowUpRight, CalendarClock, Check, FileText, Mail, MessageCircle } from "lucide-react";
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
      icon: copied ? <Check size={18} strokeWidth={2.2} /> : <Mail size={18} strokeWidth={1.5} />,
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
    profile.cv[locale] && { key: "cv", label: t.cv, icon: <FileText size={18} strokeWidth={1.5} />, href: profile.cv[locale], download: true },
  ].filter(Boolean) as never;

  return (
    <div className={compact ? "" : "w-[420px] p-2"}>
      {/* chi risponde, e quando */}
      <div className="flex items-center gap-3.5 px-1 pb-5 pt-1" data-mi data-di>
        <span className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[13px] font-medium text-[var(--bg-canvas)]" aria-hidden>
            FC
          </span>
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

      {/* le due vie principali */}
      <div className="grid grid-cols-2 gap-3" data-mi data-di>
        <a href="#brief" onClick={onPick} className="group flex min-h-[124px] flex-col justify-between rounded-[20px] bg-ink p-4 text-[var(--bg-canvas)] transition-transform active:scale-[.98]">
          <span className="flex items-center justify-between">
            <CalendarClock size={20} strokeWidth={1.5} aria-hidden />
            <ArrowUpRight size={16} strokeWidth={1.5} className="opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-[14.5px] font-medium">{t.book}</span>
            <span className="mt-0.5 block text-[12px] opacity-65">{first ? first : t.bookSub}</span>
          </span>
        </a>
        <button
          type="button"
          onClick={() => {
            onPick?.();
            window.dispatchEvent(new Event("chat:open"));
          }}
          className="group flex min-h-[124px] flex-col justify-between rounded-[20px] bg-[var(--hover)] p-4 text-left text-ink shadow-[inset_0_0_0_1px_var(--hair)] transition-[transform,background] hover:bg-[color-mix(in_srgb,var(--sky)_14%,var(--hover))] active:scale-[.98]"
        >
          <span className="flex items-center justify-between">
            <MessageCircle size={20} strokeWidth={1.5} aria-hidden />
            <span className="h-2 w-2 rounded-full bg-[#30d158]" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-[14.5px] font-medium">{t.chat}</span>
            <span className="mt-0.5 block text-[12px] text-ink-3">{t.chatSub}</span>
          </span>
        </button>
      </div>

      {/* canali */}
      {channels.length > 0 && (
        <div className="mt-4 grid gap-1 border-t border-[var(--hair)] pt-4" style={{ gridTemplateColumns: `repeat(${Math.min(channels.length, compact ? 4 : 5)}, minmax(0, 1fr))` }} data-mi data-di>
          {channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target={c.ext ? "_blank" : undefined}
              rel={c.ext ? "noopener noreferrer" : undefined}
              download={c.download || undefined}
              onClick={(e) => {
                if (c.onClick && navigator.clipboard) {
                  e.preventDefault();
                  c.onClick();
                  return;
                }
                onPick?.();
              }}
              className="flex flex-col items-center gap-2 rounded-[16px] px-1 py-3 text-ink-2 transition-colors hover:bg-[var(--hover)] hover:text-ink"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--hover)] text-ink">{c.icon}</span>
              <span className="w-full truncate text-center text-[12px]">{c.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
