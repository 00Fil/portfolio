"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale, useMessages } from "next-intl";
import { gsap } from "gsap";
import { ArrowLeft, CalendarPlus, Check, Clock, Video } from "lucide-react";
import { book, getSlots } from "@/lib/booking-actions";
import { profile } from "@/content/profile";
import { prefersReducedMotion } from "@/lib/env";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import type { ServiceKey } from "@/content/services";

type Path = { id: string; label: string; sub: string; q: string; multi?: boolean; opts?: string[] };
type T = {
  title: string;
  meta: string;
  with: string;
  back: string;
  next: string;
  optional: string;
  edit: string;
  s1: string;
  paths: Path[];
  note: string;
  notePh: string;
  s3: string;
  s4: string;
  name: string;
  email: string;
  company: string;
  confirm: string;
  sumPath: string;
  sumWhen: string;
  loading: string;
  noSlots: string;
  tz: string;
  doneTitle: string;
  doneBody: string;
  addCal: string;
  done: string;
  calTitle: string;
  errTaken: string;
  errGeneric: string;
};
type Day = { day: string; slots: string[] };

/** Il pittogramma di ogni percorso: gli stessi dei servizi. */
const ICON: Record<string, ServiceKey> = { web: "web", webapp: "api", apps: "apps", shop: "shop", ai: "ai", seo: "seo", api: "api", ops: "ops", other: "design" };
/** Da servizio a percorso, per aprire il modulo già sul punto giusto (#brief-web, #brief-ops…). */
export const PRESET: Record<string, string> = { web: "web", seo: "seo", geo: "seo", apps: "apps", design: "other", ai: "ai", hw: "other", api: "api", shop: "shop", ops: "ops", webapp: "webapp" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Prenotazione di una chiamata in quattro passi brevi: cosa ti serve, una domanda su misura per quel percorso,
 * giorno e ora tra quelli davvero liberi, nome ed email. A lato il riepilogo si compone mentre scegli.
 * Segue il tema del sito, chiaro o scuro.
 */
export function Brief({ preset, onClose }: { preset?: string; onClose?: () => void }) {
  const t = (useMessages() as unknown as { brief: T }).brief;
  const locale = useLocale();
  const tz = profile.booking.tz;
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", { timeZone: tz, ...o }).format(new Date(iso));

  const start = preset && PRESET[preset] ? PRESET[preset] : "";
  const [path, setPath] = useState(start);
  const [detail, setDetail] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [slot, setSlot] = useState("");
  const [who, setWho] = useState({ name: "", email: "", company: "" });
  const [i, setI] = useState(start ? 1 : 0);
  const [done, setDone] = useState(false);
  const [days, setDays] = useState<Day[] | null>(null);
  const [dayAt, setDayAt] = useState(0);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);

  const p = useMemo(() => t.paths.find((x) => x.id === path), [t.paths, path]);

  // gli orari liberi si cercano subito, mentre si risponde alle prime domande
  const loadSlots = () =>
    getSlots()
      .then((d) => {
        setDays(d);
        setDayAt(0);
      })
      .catch(() => setDays([]));
  useEffect(() => {
    void loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (to: number) => {
    dir.current = to > i ? 1 : -1;
    setErr("");
    setI(to);
  };

  const pickPath = (id: string) => {
    if (id !== path) {
      setDetail([]);
      setNote("");
    }
    setPath(id);
    window.setTimeout(() => go(1), 180);
  };
  const pickDetail = (o: string) => {
    if (p?.multi) return setDetail((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));
    setDetail([o]);
    window.setTimeout(() => go(2), 220);
  };

  const detailOk = p?.opts ? detail.length > 0 : note.trim().length > 2;
  const whoOk = who.name.trim().length > 1 && EMAIL.test(who.email.trim());

  const submit = async () => {
    if (!whoOk || sending) return;
    setSending(true);
    setErr("");
    const r = await book({ need: [p?.label ?? ""], goal: detail.join(", "), goalNote: note, slot, ...who }).catch(() => ({ ok: false as const, error: "invalid" as const }));
    setSending(false);
    if (r.ok) {
      dir.current = 1;
      setDone(true);
      return;
    }
    if (r.error === "taken") {
      setErr(t.errTaken);
      setSlot("");
      setDays(null);
      void loadSlots();
      go(2);
    } else setErr(t.errGeneric);
  };

  const ics = () => {
    const a = new Date(slot);
    const b = new Date(a.getTime() + profile.booking.minutes * 60e3);
    const z = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//portfolio//booking//IT", "BEGIN:VEVENT", `UID:${z(a)}-${Math.random().toString(36).slice(2)}`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(a)}`, `DTEND:${z(b)}`, `SUMMARY:${t.calTitle}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
  };

  // ogni passo entra dal lato verso cui si va
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(el, { autoAlpha: 0, x: 24 * dir.current }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" }).from(el.querySelectorAll("[data-opt]"), { y: 8, autoAlpha: 0, duration: 0.35, stagger: 0.025, ease: "power2.out" }, 0.08);
    return () => void tl.kill();
  }, [i, done]);

  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
  const when = slot ? cap(fmt(slot, { weekday: "long", day: "numeric", month: "long" })) : "";
  const hour = slot ? fmt(slot, { hour: "2-digit", minute: "2-digit" }) : "";

  const card = "rounded-[16px] bg-[var(--card)] shadow-[inset_0_0_0_1px_var(--hair)]";
  const chip = (on: boolean) =>
    `rounded-[12px] px-3.5 text-[14.5px] transition-[background,box-shadow,color] duration-200 ${on ? "bg-[color-mix(in_srgb,var(--sky)_14%,var(--card))] text-ink shadow-[inset_0_0_0_1.5px_var(--sky)]" : "bg-[var(--card)] text-ink-2 shadow-[inset_0_0_0_1px_var(--hair)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--hair-strong)]"}`;
  const primary = "flex h-12 items-center justify-center gap-2 rounded-[12px] bg-ink px-6 text-[15px] font-medium text-[var(--bg-canvas)] transition-[transform,opacity] active:scale-[.98] disabled:opacity-40";
  const input = "h-12 w-full rounded-[12px] bg-[var(--card)] px-3.5 text-[15.5px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky),0_0_0_4px_color-mix(in_srgb,var(--sky)_16%,transparent)]";
  const h = "text-[clamp(24px,2.6vw,32px)] font-medium leading-tight tracking-[-0.035em] text-ink";
  const dateTile = (iso: string, big = false) => (
    <span className={`flex shrink-0 flex-col items-center justify-center rounded-[10px] bg-[var(--hover)] text-ink ${big ? "h-12 w-12" : "h-9 w-9"}`} aria-hidden>
      <span className={`${big ? "text-[10px]" : "text-[9px]"} uppercase leading-none tracking-[0.06em] text-ink-3`}>{fmt(iso, { month: "short" })}</span>
      <span className={`${big ? "text-[18px]" : "text-[15px]"} font-medium leading-none tabular-nums`}>{fmt(iso, { day: "numeric" })}</span>
    </span>
  );

  // riepilogo: cresce mentre si sceglie
  const summary = (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[14px] font-medium text-[var(--bg-canvas)]" aria-hidden>
          FC
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-medium text-ink">{t.title}</span>
          <span className="block text-[13px] text-ink-3">{t.with}</span>
        </span>
      </div>
      <ul className="mt-5 hidden space-y-2.5 text-[14px] text-ink-2 lg:block">
        <li className="flex items-center gap-2.5">
          <Clock size={16} strokeWidth={1.7} className="text-ink-3" aria-hidden />
          {t.meta}
        </li>
        <li className="flex items-center gap-2.5">
          <Video size={16} strokeWidth={1.7} className="text-ink-3" aria-hidden />
          Google Meet
        </li>
      </ul>
      {(p || slot) && (
        <dl className={`${card} mt-5 hidden divide-y divide-[var(--hair)] lg:block`}>
          {p && (
            <div className="flex items-start gap-3 p-3.5">
              <ServiceIcon k={ICON[p.id]} size={36} />
              <div className="min-w-0 flex-1">
                <dt className="text-[12px] text-ink-3">{t.sumPath}</dt>
                <dd className="text-[14.5px] font-medium text-ink">{p.label}</dd>
                {detail.length > 0 && <dd className="mt-0.5 text-[13px] text-ink-2">{detail.join(", ")}</dd>}
              </div>
              {!done && i > 0 && (
                <button type="button" onClick={() => go(0)} className="text-[12.5px] text-ink-3 hover:text-ink">
                  {t.edit}
                </button>
              )}
            </div>
          )}
          {slot && (
            <div className="flex items-start gap-3 p-3.5">
              {dateTile(slot)}
              <div className="min-w-0 flex-1">
                <dt className="text-[12px] text-ink-3">{t.sumWhen}</dt>
                <dd className="text-[14.5px] font-medium text-ink">{when}</dd>
                <dd className="text-[13px] tabular-nums text-ink-2">
                  {hour} · {t.tz}
                </dd>
              </div>
              {!done && i !== 2 && (
                <button type="button" onClick={() => go(2)} className="text-[12.5px] text-ink-3 hover:text-ink">
                  {t.edit}
                </button>
              )}
            </div>
          )}
        </dl>
      )}
    </aside>
  );

  const progress = done ? 4 : i;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-14">
      {summary}
      <div className="min-w-0">
        {!done && (
          <div className="mb-7 flex items-center gap-3">
            {i > 0 && (
              <button type="button" onClick={() => go(i - 1)} aria-label={t.back} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-[var(--hover)] hover:text-ink">
                <ArrowLeft size={18} strokeWidth={1.8} />
              </button>
            )}
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= progress ? "bg-ink" : "bg-[var(--hair)]"}`} />
              ))}
            </div>
            <span className="font-mono text-[12px] tabular-nums text-ink-3">{i + 1}/4</span>
          </div>
        )}

        <div ref={stage}>
          {done ? (
            <div className="py-2">
              <span data-opt className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sky)] text-[#05131d]">
                <Check size={26} strokeWidth={2.6} />
              </span>
              <h2 data-opt className={`${h} mt-6`}>
                {t.doneTitle}
              </h2>
              <p data-opt className="mt-2 text-[15.5px] text-ink-2">
                {t.doneBody}
              </p>
              <div data-opt className={`${card} mt-6 flex items-center gap-4 p-4`}>
                {dateTile(slot, true)}
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-ink">{when}</span>
                  <span className="block text-[13.5px] tabular-nums text-ink-2">
                    {hour} · {t.meta}
                  </span>
                </span>
              </div>
              <div data-opt className="mt-6 flex flex-col gap-2 sm:flex-row">
                <a href={ics()} download="chiamata.ics" className={`${primary} w-full sm:w-auto`}>
                  <CalendarPlus size={17} strokeWidth={1.8} aria-hidden />
                  {t.addCal}
                </a>
                {onClose && (
                  <button type="button" onClick={onClose} className={`${chip(false)} flex h-12 w-full items-center justify-center sm:w-auto`}>
                    {t.done}
                  </button>
                )}
              </div>
            </div>
          ) : i === 0 ? (
            <div>
              <h2 className={h}>{t.s1}</h2>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup">
                {t.paths.map((x) => (
                  <button key={x.id} type="button" role="radio" aria-checked={path === x.id} data-opt onClick={() => pickPath(x.id)} className={`${chip(path === x.id)} flex items-center gap-3 py-3 text-left`}>
                    <ServiceIcon k={ICON[x.id]} size={38} />
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{x.label}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{x.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : i === 1 && p ? (
            <div>
              <h2 className={h}>{p.q}</h2>
              {p.opts && (
                <div className="mt-6 flex flex-wrap gap-2" role={p.multi ? "group" : "radiogroup"}>
                  {p.opts.map((o) => (
                    <button key={o} type="button" data-opt role={p.multi ? "checkbox" : "radio"} aria-checked={detail.includes(o)} onClick={() => pickDetail(o)} className={`${chip(detail.includes(o))} flex h-11 items-center gap-2`}>
                      {detail.includes(o) && <Check size={15} strokeWidth={2.4} className="text-[var(--sky)]" aria-hidden />}
                      {o}
                    </button>
                  ))}
                </div>
              )}
              <label data-opt className="mt-6 block">
                <span className="text-[13px] font-medium text-ink-2">
                  {t.note} {p.opts && <span className="font-normal text-ink-3">· {t.optional}</span>}
                </span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder={t.notePh} className={`${input} mt-1.5 h-auto resize-none py-3 leading-[1.5]`} />
              </label>
              {(p.multi || !p.opts || note.trim() || detail.length > 0) && (
                <button data-opt type="button" disabled={!detailOk} onClick={() => go(2)} className={`${primary} mt-5 w-full sm:w-auto`}>
                  {t.next}
                </button>
              )}
            </div>
          ) : i === 2 ? (
            <div>
              <h2 className={h}>{t.s3}</h2>
              {!days ? (
                <p className="mt-6 flex items-center gap-3 text-[15px] text-ink-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  {t.loading}
                </p>
              ) : !days.length ? (
                <p className="mt-6 text-[15.5px] text-ink-2">{t.noSlots}</p>
              ) : (
                <>
                  <div role="radiogroup" className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {days.map((d, k) => (
                      <button key={d.day} type="button" data-opt role="radio" aria-checked={k === dayAt} onClick={() => setDayAt(k)} className={`${chip(k === dayAt)} flex h-[66px] flex-col items-center justify-center px-1`}>
                        <span className="text-[11px] uppercase tracking-[0.06em] text-ink-3">{fmt(d.day, { weekday: "short" })}</span>
                        <span className="text-[19px] font-medium leading-tight tabular-nums text-ink">{fmt(d.day, { day: "numeric" })}</span>
                        <span className="text-[10.5px] text-ink-3">{fmt(d.day, { month: "short" })}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-[13px] font-medium text-ink-2">
                    <span>{cap(fmt(days[dayAt].day, { weekday: "long", day: "numeric", month: "long" }))}</span> <span className="font-normal text-ink-3">· {t.tz}</span>
                  </p>
                  <div role="radiogroup" className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {days[dayAt].slots.map((iso) => (
                      <button key={iso} type="button" data-opt role="radio" aria-checked={slot === iso} onClick={() => setSlot(iso)} className={`${chip(slot === iso)} h-11 tabular-nums`}>
                        {fmt(iso, { hour: "2-digit", minute: "2-digit" })}
                      </button>
                    ))}
                  </div>
                  {err && <p className="mt-4 text-[14px] text-[#e5484d]">{err}</p>}
                  <button type="button" disabled={!slot} onClick={() => go(3)} className={`${primary} mt-6 w-full sm:w-auto`}>
                    {t.next}
                  </button>
                </>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <h2 className={h}>{t.s4}</h2>
              {/* su telefono il riepilogo sta qui, prima di confermare */}
              <div data-opt className={`${card} mt-5 flex items-center gap-3 p-3 lg:hidden`}>
                {p && <ServiceIcon k={ICON[p.id]} size={34} />}
                <span className="min-w-0 text-[13.5px] leading-snug">
                  <span className="block truncate font-medium text-ink">{p?.label}</span>
                  <span className="block truncate text-ink-2">
                    <span>{when}</span> · {hour}
                  </span>
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                <label data-opt className="block">
                  <span className="text-[13px] font-medium text-ink-2">{t.name}</span>
                  <input value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} autoComplete="name" required className={`${input} mt-1.5`} />
                </label>
                <label data-opt className="block">
                  <span className="text-[13px] font-medium text-ink-2">{t.email}</span>
                  <input type="email" inputMode="email" value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} autoComplete="email" autoCapitalize="none" required className={`${input} mt-1.5`} />
                </label>
                <label data-opt className="block">
                  <span className="text-[13px] font-medium text-ink-2">
                    {t.company} <span className="font-normal text-ink-3">· {t.optional}</span>
                  </span>
                  <input value={who.company} onChange={(e) => setWho({ ...who, company: e.target.value })} autoComplete="organization" className={`${input} mt-1.5`} />
                </label>
              </div>
              {err && <p className="mt-4 text-[14px] text-[#e5484d]">{err}</p>}
              <button type="submit" disabled={!whoOk || sending} className={`${primary} mt-6 w-full`}>
                {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.confirm}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
