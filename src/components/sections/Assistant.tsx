"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useMessages } from "next-intl";
import { gsap } from "gsap";
import { ArrowUp, ArrowUpRight, CalendarClock, FileText, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { INTENTS, PROJECT_KW, SERVICE_KW, type Widget } from "@/content/assistant";
import { SERVICES, type ServiceKey } from "@/content/services";
import { COVERS } from "@/content/covers";
import { getProject } from "@/content/projects";
import { profile } from "@/content/profile";
import { getSlots } from "@/lib/booking-actions";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { Cover, TAGLINE } from "@/components/work/Covers";
import { Reveal } from "@/components/motion/Reveal";
import { prefersReducedMotion } from "@/lib/env";
import { SectionHead } from "./SectionHead";
import { PRESET } from "./Brief";

type T = { title: string; lead: string; name: string; placeholder: string; send: string; hello: string; fallback: string; book: string; nextFree: string; open: string; area: string; cv: string; service: string; project: string };
type Msg = { id: number; from: "me" | "bot"; text: string; w?: Widget[] };
type QA = { q: string; a: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9€]+/)
    .filter(Boolean);
const hits = (tokens: string[], kw: string[]) => kw.reduce((n, k) => n + (tokens.some((t) => (k.length <= 3 ? t === k : t.startsWith(k))) ? 1 : 0), 0);

/** La risposta: vince ciò che ha più parole in comune con la domanda (progetto, servizio o argomento). */
function answer(q: string, locale: Locale, t: T): Omit<Msg, "id" | "from"> {
  const tokens = norm(q);
  const intent = INTENTS.map((x) => ({ x, n: hits(tokens, x.kw) })).sort((a, b) => b.n - a.n)[0];
  const svc = (Object.keys(SERVICE_KW) as ServiceKey[]).map((k) => ({ k, n: hits(tokens, SERVICE_KW[k]) })).sort((a, b) => b.n - a.n)[0];
  const prj = Object.keys(PROJECT_KW).map((k) => ({ k, n: hits(tokens, PROJECT_KW[k]) })).sort((a, b) => b.n - a.n)[0];

  if (prj.n > 0 && prj.n >= svc.n && prj.n >= intent.n) {
    return { text: t.project.replace("{name}", getProject(prj.k)?.name ?? prj.k), w: [{ kind: "project", slug: prj.k }] };
  }
  if (svc.n > 0 && svc.n >= intent.n) {
    const s = SERVICES.find((x) => x.key === svc.k)!;
    return { text: `${t.service.replace("{name}", s.title[locale].toLowerCase())} ${s.lead[locale]}`, w: [{ kind: "service", key: svc.k }, { kind: "book", path: PRESET[svc.k] ? svc.k : undefined }] };
  }
  if (intent.n > 0) return { text: intent.x.a[locale], w: intent.x.w };
  return { text: t.fallback, w: [{ kind: "book" }] };
}

let slotsCache: Promise<{ day: string; slots: string[] }[]> | null = null;

function BookCard({ path, t, locale }: { path?: string; t: T; locale: Locale }) {
  const [first, setFirst] = useState("");
  useEffect(() => {
    slotsCache ??= getSlots().catch(() => []);
    slotsCache.then((d) => {
      const iso = d[0]?.slots[0];
      if (iso) setFirst(new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", { timeZone: profile.booking.tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)));
    });
  }, [locale]);
  return (
    <a href={`#brief${path ? `-${path}` : ""}`} className="group flex items-center gap-3 rounded-[14px] bg-ink p-3 pr-4 text-[var(--bg-canvas)] transition-transform active:scale-[.985]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--bg-canvas)_14%,transparent)]">
        <CalendarClock size={18} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[14.5px] font-medium">{t.book}</span>
        {first && <span className="mt-0.5 block text-[12.5px] opacity-70">{t.nextFree.replace("{when}", first)}</span>}
      </span>
      <ArrowUpRight size={17} strokeWidth={1.8} className="opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

const row = "group flex items-center gap-3 rounded-[14px] bg-[var(--bg-canvas)] p-2.5 pr-3.5 shadow-[inset_0_0_0_1px_var(--hair)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--hair-strong)]";
const arrow = <ArrowUpRight size={16} strokeWidth={1.8} className="shrink-0 text-ink-3 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />;

function ProjectRow({ slug, locale }: { slug: string; locale: Locale }) {
  return (
    <Link href={`/lavori/${slug}`} className={row}>
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px]">
        <Cover slug={slug} mini />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[14.5px] font-medium text-ink">{getProject(slug)?.name}</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">{TAGLINE[slug]?.[locale]}</span>
      </span>
      {arrow}
    </Link>
  );
}

function WidgetView({ w, t, locale }: { w: Widget; t: T; locale: Locale }) {
  switch (w.kind) {
    case "book":
      return <BookCard path={w.path} t={t} locale={locale} />;
    case "service": {
      const s = SERVICES.find((x) => x.key === w.key)!;
      return (
        <Link href={`/servizi/${s.slug}`} className={row}>
          <ServiceIcon k={s.key} size={44} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[14.5px] font-medium text-ink">{s.title[locale]}</span>
            <span className="mt-0.5 line-clamp-1 text-[12.5px] text-ink-3">{s.short[locale]}</span>
          </span>
          {arrow}
        </Link>
      );
    }
    case "project":
      return <ProjectRow slug={w.slug} locale={locale} />;
    case "projects":
      return (
        <div className="grid gap-2">
          {COVERS.map((c) => (
            <ProjectRow key={c.slug} slug={c.slug} locale={locale} />
          ))}
        </div>
      );
    case "area":
      return (
        <Link href="/accedi" className={row}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--hover)] text-ink">
            <LayoutDashboard size={19} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="flex-1 text-[14.5px] font-medium text-ink">{t.area}</span>
          {arrow}
        </Link>
      );
    case "cv":
      return (
        <Link href="/cv" className={row}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--hover)] text-ink">
            <FileText size={19} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="flex-1 text-[14.5px] font-medium text-ink">{t.cv}</span>
          {arrow}
        </Link>
      );
    case "contact":
      return profile.email ? (
        <a href={`mailto:${profile.email}`} className={row}>
          <span className="flex-1 px-1 text-[14px] text-ink">{profile.email}</span>
          {arrow}
        </a>
      ) : null;
  }
}

/**
 * L'assistente al posto delle domande frequenti: si scrive come in chat e risponde subito,
 * con dentro la risposta i servizi, i lavori o la prenotazione che servono per andare avanti.
 */
export function Assistant() {
  const m = useMessages() as unknown as { assistant: T; faq: { items: QA[] } };
  const t = m.assistant;
  const locale = useLocale() as Locale;
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", text: t.hello }]);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const chips = INTENTS.filter((x) => x.chip).map((x) => x.chip![locale]);
  const asked = msgs.some((x) => x.from === "me");

  const ask = (text: string) => {
    const v = text.trim();
    if (!v || typing) return;
    setMsgs((s) => [...s, { id: seq.current++, from: "me", text: v }]);
    setQ("");
    setTyping(true);
    const r = answer(v, locale, t);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((s) => [...s, { id: seq.current++, from: "bot", ...r }]);
    }, 420 + Math.min(700, r.text.length * 4));
  };

  // ogni messaggio nuovo entra dal basso e la conversazione scorre fino in fondo
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const lastEl = el.querySelector("[data-msg]:last-of-type");
    if (lastEl && !prefersReducedMotion() && msgs.length > 1) gsap.from(lastEl, { y: 12, autoAlpha: 0, duration: 0.45, ease: "power3.out" });
  }, [msgs, typing]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };

  // le domande frequenti restano come dati strutturati per Google e per le AI
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: m.faq.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })) };

  return (
    <section id="assistant" className="relative mx-auto w-full max-w-[1280px] px-5 pt-20 sm:px-8 sm:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <SectionHead index="05" title={t.title} />
          <p className="-mt-4 max-w-[34ch] text-ink-2" data-reveal>
            {t.lead}
          </p>
        </Reveal>

        <div className="flex h-[min(620px,78svh)] flex-col overflow-hidden rounded-[28px] bg-[var(--card)] shadow-[inset_0_0_0_1px_var(--hair),0_40px_80px_-60px_var(--shadow-strong)] lg:col-span-8">
          <header className="flex items-center gap-3 border-b border-[var(--hair)] px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[12.5px] font-medium text-[var(--bg-canvas)]" aria-hidden>
              FC
            </span>
            <span className="text-[15px] font-medium text-ink">{t.name}</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#30a46c]" aria-hidden />
          </header>

          <div ref={list} className="flex-1 space-y-5 overflow-y-auto px-5 py-6" data-lenis-prevent aria-live="polite">
            {msgs.map((x) =>
              x.from === "me" ? (
                <div key={x.id} data-msg className="flex justify-end">
                  <p className="max-w-[80%] rounded-[18px] rounded-br-[6px] bg-ink px-4 py-2.5 text-[15px] leading-[1.45] text-[var(--bg-canvas)]">{x.text}</p>
                </div>
              ) : (
                <div key={x.id} data-msg className="max-w-[560px]">
                  <p className="text-[15.5px] leading-[1.6] text-ink">{x.text}</p>
                  {x.w && x.w.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {x.w.map((w, k) => (
                        <WidgetView key={k} w={w} t={t} locale={locale} />
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div data-msg className="flex gap-1 py-2" aria-hidden>
                {[0, 1, 2].map((k) => (
                  <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--hair-strong)]" style={{ animationDelay: `${k * 0.12}s` }} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--hair)] p-3 sm:p-4">
            {!asked && (
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {chips.map((c) => (
                  <button key={c} type="button" onClick={() => ask(c)} className="h-9 shrink-0 rounded-full px-3.5 text-[13.5px] text-ink-2 shadow-[inset_0_0_0_1px_var(--hair-strong)] transition-colors hover:bg-[var(--hover)] hover:text-ink">
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                maxLength={300}
                className="h-12 min-w-0 flex-1 rounded-full bg-[var(--bg-canvas)] px-5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky)]"
              />
              <button type="submit" aria-label={t.send} disabled={!q.trim() || typing} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-[var(--bg-canvas)] transition-[opacity,transform] active:scale-95 disabled:opacity-30">
                <ArrowUp size={19} strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
