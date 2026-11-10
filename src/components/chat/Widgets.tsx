"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarClock, Check, FileText, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Widget } from "@/content/assistant";
import { SERVICES } from "@/content/services";
import { COVERS } from "@/content/covers";
import { getProject } from "@/content/projects";
import { profile } from "@/content/profile";
import { getSlots } from "@/lib/booking-actions";
import { handoff, type Line } from "@/lib/chat-actions";
import { Bead } from "@/components/glass/Bead";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { Cover, TAGLINE } from "@/components/work/Covers";
import type { ChatText } from "./engine";

let slotsCache: Promise<{ day: string; slots: string[] }[]> | null = null;

/** Il primo orario libero, formattato; la richiesta parte una volta sola per tutta la pagina. */
export function useFirstSlot(locale: Locale) {
  const [first, setFirst] = useState("");
  useEffect(() => {
    slotsCache ??= getSlots().catch(() => []);
    void slotsCache.then((d) => {
      const iso = d[0]?.slots[0];
      if (iso) setFirst(new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", { timeZone: profile.booking.tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)));
    });
  }, [locale]);
  return first;
}

function BookCard({ path, t, locale }: { path?: string; t: ChatText; locale: Locale }) {
  const first = useFirstSlot(locale);
  return (
    <Bead as="a" tint="sky" radius={16} href={`#brief${path ? `-${path}` : ""}`} className="drop-soft group flex items-center gap-3 p-3 pr-3.5 text-ink transition-transform active:scale-[.985]">
      <CalendarClock size={20} strokeWidth={1.5} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[14px] font-medium">{t.book}</span>
        {first && <span className="mt-0.5 block text-[12px] opacity-70">{t.nextFree.replace("{when}", first)}</span>}
      </span>
      <ArrowUpRight size={16} strokeWidth={1.8} className="opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </Bead>
  );
}

const row = "drop-soft group flex items-center gap-3 p-2 pr-3 transition-transform active:scale-[.985]";
const arrow = <ArrowUpRight size={15} strokeWidth={1.8} className="shrink-0 text-ink-3 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />;

function ProjectRow({ slug, locale }: { slug: string; locale: Locale }) {
  return (
    <Bead as={Link} radius={16} href={`/lavori/${slug}`} className={row}>
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px]">
        <Cover slug={slug} mini />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[14px] font-medium text-ink">{getProject(slug)?.name}</span>
        <span className="mt-0.5 block truncate text-[12px] text-ink-3">{TAGLINE[slug]?.[locale]}</span>
      </span>
      {arrow}
    </Bead>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Passaggio a Filippo: nome ed email, poi la conversazione gli arriva per intero. */
function Handoff({ t, lines }: { t: ChatText; lines: () => Line[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const ok = name.trim().length > 1 && EMAIL.test(email.trim());
  if (state === "done")
    return (
      <p className="flex items-start gap-2 rounded-[14px] bg-[color-mix(in_srgb,#30a46c_12%,transparent)] p-3 text-[13.5px] leading-snug text-ink">
        <Check size={16} strokeWidth={2.4} className="mt-px shrink-0 text-[#30a46c]" aria-hidden />
        {t.hDone.replace("{email}", email.trim())}
      </p>
    );
  const field = "h-10 w-full rounded-[12px] bg-[color-mix(in_srgb,var(--bg-canvas)_55%,transparent)] px-3 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--hair)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky)]";
  return (
    <Bead
      as="form"
      radius={18}
      className="drop-soft grid gap-2 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ok) return;
        setState("sending");
        const r = await handoff({ name, email, lines: lines(), page: window.location.pathname }).catch(() => ({ ok: false as const }));
        setState(r.ok ? "done" : "error");
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.hName} autoComplete="name" className={field} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.hEmail} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" className={field} />
      {state === "error" && <p className="px-1 text-[12.5px] text-[#e5484d]">{t.hErr}</p>}
      <button type="submit" disabled={!ok || state === "sending"} className="flex h-10 items-center justify-center rounded-[12px] bg-ink text-[14px] font-medium text-[var(--bg-canvas)] transition-opacity disabled:opacity-40">
        {state === "sending" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.hSend}
      </button>
    </Bead>
  );
}

export function WidgetView({ w, t, locale, lines }: { w: Widget; t: ChatText; locale: Locale; lines: () => Line[] }) {
  switch (w.kind) {
    case "book":
      return <BookCard path={w.path} t={t} locale={locale} />;
    case "handoff":
      return <Handoff t={t} lines={lines} />;
    case "service": {
      const s = SERVICES.find((x) => x.key === w.key)!;
      return (
        <Bead as={Link} radius={16} href={`/servizi/${s.slug}`} className={row}>
          <ServiceIcon k={s.key} size={40} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[14px] font-medium text-ink">{s.title[locale]}</span>
            <span className="mt-0.5 line-clamp-1 text-[12px] text-ink-3">{s.short[locale]}</span>
          </span>
          {arrow}
        </Bead>
      );
    }
    case "project":
      return <ProjectRow slug={w.slug} locale={locale} />;
    case "projects":
      return (
        <div className="grid gap-1.5">
          {COVERS.map((c) => (
            <ProjectRow key={c.slug} slug={c.slug} locale={locale} />
          ))}
        </div>
      );
    case "area":
      return (
        <Bead as={Link} radius={16} href="/accedi" className={row}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center text-ink">
            <LayoutDashboard size={18} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="flex-1 text-[14px] font-medium text-ink">{t.area}</span>
          {arrow}
        </Bead>
      );
    case "cv":
      return (
        <Bead as="a" radius={16} href={profile.cv[locale]} download className={row}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center text-ink">
            <FileText size={18} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="flex-1 text-[14px] font-medium text-ink">{t.cv}</span>
          {arrow}
        </Bead>
      );
    case "contact":
      return profile.email ? (
        <Bead as="a" radius={16} href={`mailto:${profile.email}`} className={row}>
          <span className="flex-1 px-1 text-[14px] text-ink">{profile.email}</span>
          {arrow}
        </Bead>
      ) : null;
  }
}
