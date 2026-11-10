"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger);

/* ───────────── Dati d'esempio: una settimana tipo del centro, nomi inventati ───────────── */

type L = Record<Locale, string>;
type Subject = "mat" | "fis" | "ing" | "lat";
const SUBJ: Record<Subject, { name: L; short: L; color: string }> = {
  mat: { name: { it: "Matematica", en: "Maths" }, short: { it: "Mat", en: "Maths" }, color: "#5F6BA3" },
  fis: { name: { it: "Fisica", en: "Physics" }, short: { it: "Fis", en: "Phys" }, color: "#D98A6C" },
  ing: { name: { it: "Inglese", en: "English" }, short: { it: "Ing", en: "Eng" }, color: "#3E9C8F" },
  lat: { name: { it: "Latino", en: "Latin" }, short: { it: "Lat", en: "Latin" }, color: "#C9A23F" },
};
const DAYS: L[] = [
  { it: "Lun", en: "Mon" },
  { it: "Mar", en: "Tue" },
  { it: "Mer", en: "Wed" },
  { it: "Gio", en: "Thu" },
  { it: "Ven", en: "Fri" },
];
const HOURS = [15, 16, 17, 18, 19];

type Tutor = { name: string; subjects: Subject[]; days: number[]; from: number; to: number };
const TUTORS: Tutor[] = [
  { name: "Anna", subjects: ["mat", "fis"], days: [0, 1, 2], from: 15, to: 19 },
  { name: "Paolo", subjects: ["ing", "lat"], days: [1, 3, 4], from: 16, to: 20 },
  { name: "Elena", subjects: ["mat", "ing"], days: [0, 3, 4], from: 15, to: 18 },
];

type Request = { student: string; needs: [Subject, number][] };
const REQUESTS: Request[] = [
  { student: "Marco", needs: [["mat", 2], ["fis", 1]] },
  { student: "Sara", needs: [["ing", 2]] },
  { student: "Luca", needs: [["lat", 1], ["mat", 1]] },
  { student: "Giorgia", needs: [["mat", 1], ["ing", 1]] },
];

/** Vincoli che si possono accendere e spegnere: impegni dei ragazzi e preferenze dei genitori. */
type Rule = { id: string; kind: "busy" | "pref"; student: string; label: L; blocks: (d: number, h: number) => boolean };
const RULES: Rule[] = [
  { id: "marco-calcio", kind: "busy", student: "Marco", label: { it: "Calcio · lun e mer 16–18", en: "Football · Mon & Wed 4–6pm" }, blocks: (d, h) => (d === 0 || d === 2) && h >= 16 && h < 18 },
  { id: "sara-nuoto", kind: "busy", student: "Sara", label: { it: "Nuoto · gio 17–19", en: "Swimming · Thu 5–7pm" }, blocks: (d, h) => d === 3 && h >= 17 && h < 19 },
  { id: "giorgia-musica", kind: "busy", student: "Giorgia", label: { it: "Musica · mar 15–17", en: "Music · Tue 3–5pm" }, blocks: (d, h) => d === 1 && h >= 15 && h < 17 },
  { id: "sara-tardi", kind: "pref", student: "Sara", label: { it: "Solo dopo le 17", en: "Only after 5pm" }, blocks: (_d, h) => h < 17 },
  { id: "luca-ven", kind: "pref", student: "Luca", label: { it: "Mai di venerdì", en: "Never on Fridays" }, blocks: (d) => d === 4 },
];

type Lesson = { student: string; subject: Subject; tutor: string; day: number; hour: number; order: number };

/* ───────────── Il motore: ogni ora richiesta trova il posto migliore che rispetta tutto ───────────── */

function solve(active: Set<string>): { lessons: Lesson[]; missing: number } {
  const units: { student: string; subject: Subject }[] = [];
  REQUESTS.forEach((r) => r.needs.forEach(([s, n]) => Array.from({ length: n }).forEach(() => units.push({ student: r.student, subject: s }))));
  const rules = RULES.filter((r) => active.has(r.id));
  const blocked = (st: string, d: number, h: number) => rules.some((r) => r.student === st && r.blocks(d, h));
  // quante possibilità ha ogni ora richiesta: si piazzano prima le più difficili
  const options = (u: (typeof units)[number]) =>
    TUTORS.filter((t) => t.subjects.includes(u.subject)).reduce((n, t) => n + t.days.length * HOURS.filter((h) => h >= t.from && h < t.to).length, 0) -
    HOURS.length * DAYS.length * 0.1 * rules.filter((r) => r.student === u.student).length;
  units.sort((a, b) => options(a) - options(b));

  const lessons: Lesson[] = [];
  let missing = 0;
  units.forEach((u) => {
    let best: Lesson | null = null;
    let score = Infinity;
    TUTORS.filter((t) => t.subjects.includes(u.subject)).forEach((t) =>
      t.days.forEach((d) =>
        HOURS.forEach((h) => {
          if (h < t.from || h >= t.to) return;
          if (blocked(u.student, d, h)) return;
          if (lessons.some((l) => l.day === d && l.hour === h && (l.tutor === t.name || l.student === u.student))) return;
          // meglio distribuire: poche lezioni dello stesso ragazzo nello stesso giorno, tutor non sovraccarichi, orari non tardi
          const sameDay = lessons.filter((l) => l.student === u.student && l.day === d).length;
          const sameSubj = lessons.some((l) => l.student === u.student && l.subject === u.subject && l.day === d) ? 6 : 0;
          const load = lessons.filter((l) => l.tutor === t.name && l.day === d).length;
          const s = sameDay * 4 + sameSubj + load * 1.5 + (h - 15) * 0.3 + d * 0.05;
          if (s < score) {
            score = s;
            best = { student: u.student, subject: u.subject, tutor: t.name, day: d, hour: h, order: lessons.length };
          }
        }),
      ),
    );
    if (best) lessons.push(best);
    else missing++;
  });
  return { lessons, missing };
}

/* ───────────── Interfaccia ───────────── */

const T = {
  kicker: { it: "Come funziona", en: "How it works" },
  title: { it: "Il calendario si compone da solo", en: "The schedule builds itself" },
  body: {
    it: "Le richieste dei genitori, gli impegni dei ragazzi e le disponibilità dei tutor entrano nel sistema. CreaCloud trova per ogni lezione l’orario che rispetta tutto, senza sovrapposizioni. Accendi o spegni un vincolo e il calendario si ricompone.",
    en: "Parents’ requests, students’ commitments and tutors’ availability go into the system. CreaCloud finds a slot for every lesson that respects all of them, with no overlaps. Switch a constraint on or off and the schedule rebuilds.",
  },
  tabs: [
    { it: "Genitori", en: "Parents" },
    { it: "Ragazzi", en: "Students" },
    { it: "Tutor", en: "Tutors" },
  ],
  hours: { it: "ore a settimana", en: "hours a week" },
  generate: { it: "Genera il calendario", en: "Build the schedule" },
  week: { it: "Settimana tipo", en: "Typical week" },
  lessons: { it: "lezioni", en: "lessons" },
  overlaps: { it: "sovrapposizioni", en: "overlaps" },
  rules: { it: "vincoli rispettati", en: "constraints met" },
  missing: { it: "da ricollocare", en: "to reschedule" },
  with: { it: "con", en: "with" },
};

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-[var(--accent)]" : "bg-[color-mix(in_srgb,var(--label-primary)_14%,transparent)]"}`}>
      <span className={`absolute left-0 top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)] transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] ${on ? "translate-x-[21px]" : "translate-x-[3px]"}`} />
    </button>
  );
}

export function CreaScheduler({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [active, setActive] = useState<Set<string>>(() => new Set(RULES.map((r) => r.id)));
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState<{ lessons: Lesson[]; missing: number } | null>(null);
  const result = useMemo(() => solve(active), [active]);
  const busy = useRef(false);

  const generate = () => {
    if (busy.current) return;
    busy.current = true;
    const old = grid.current?.querySelectorAll("[data-lesson]");
    const swap = () => {
      setShown(result);
      setRun((r) => r + 1);
    };
    if (old?.length && !prefersReducedMotion()) gsap.to(old, { scale: 0.7, autoAlpha: 0, duration: 0.25, stagger: 0.012, ease: "power2.in", onComplete: swap });
    else swap();
  };

  // la prima volta si genera da solo, quando la sezione arriva sullo schermo
  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: root.current, start: "top 60%", once: true, onEnter: () => generate() });
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // cambiando un vincolo si rigenera
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    if (shown) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // le lezioni entrano nell'ordine in cui il motore le piazza, mentre una linea scorre sulla settimana
  useLayoutEffect(() => {
    if (!run) return;
    const el = grid.current!;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-lesson]")).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    if (prefersReducedMotion()) {
      busy.current = false;
      return;
    }
    const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });
    tl.fromTo("[data-scan]", { xPercent: -100, autoAlpha: 1 }, { xPercent: 500, duration: 0.35 + items.length * 0.08, ease: "none" }, 0)
      .to("[data-scan]", { autoAlpha: 0, duration: 0.2 })
      .fromTo(items, { scale: 0.6, autoAlpha: 0, y: 6 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "back.out(2)" }, 0.15)
      .fromTo("[data-stat]", { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }, 0.3 + items.length * 0.08);
    return () => {
      tl.kill();
    };
  }, [run]);

  const toggle = (id: string) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const lessons = shown?.lessons ?? [];
  const at = (d: number, h: number) => lessons.filter((l) => l.day === d && l.hour === h);
  const totalHours = REQUESTS.reduce((n, r) => n + r.needs.reduce((m, [, k]) => m + k, 0), 0);
  const pill = "rounded-full bg-[color-mix(in_srgb,var(--label-primary)_6%,transparent)] px-2.5 py-1 text-[12px] text-ink-2";

  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-8 sm:py-28">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7">
          <p className="t-label text-[var(--accent)]">{T.kicker[locale]}</p>
          <h3 className="mt-4 text-[clamp(26px,3.2vw,46px)] font-medium leading-[1.05] tracking-[-0.04em] text-ink">{T.title[locale]}</h3>
        </div>
        <p className="max-w-[52ch] text-[15.5px] leading-[1.55] text-ink-2 sm:text-[16.5px] lg:col-span-5">{T.body[locale]}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-12 lg:gap-5">
        {/* gli ingressi del motore */}
        <aside className="flex flex-col rounded-[24px] bg-[var(--bg-surface)] p-2 shadow-[0_0_0_1px_var(--line-separator),0_30px_60px_-40px_rgba(41,37,36,.35)] lg:col-span-4">
          <div role="tablist" className="grid grid-cols-3 gap-1 rounded-[18px] bg-[color-mix(in_srgb,var(--label-primary)_5%,transparent)] p-1">
            {T.tabs.map((x, i) => (
              <button key={i} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={`h-9 rounded-[14px] text-[13.5px] font-medium transition-colors ${tab === i ? "bg-[var(--bg-surface)] text-ink shadow-[0_1px_4px_rgba(41,37,36,.12)]" : "text-ink-3 hover:text-ink-2"}`}>
                {x[locale]}
              </button>
            ))}
          </div>

          <div className="min-h-[300px] flex-1 px-3 pb-2 pt-4">
            {tab === 0 && (
              <ul className="divide-y divide-[var(--line-separator)]">
                {REQUESTS.map((r) => {
                  const prefs = RULES.filter((x) => x.kind === "pref" && x.student === r.student);
                  return (
                    <li key={r.student} className="py-3 first:pt-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] font-medium text-ink">{r.student}</span>
                        <span className="text-[12px] text-ink-3">
                          {r.needs.reduce((n, [, k]) => n + k, 0)} {T.hours[locale]}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.needs.map(([s, n]) => (
                          <span key={s} className={pill}>
                            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: SUBJ[s].color }} />
                            {SUBJ[s].name[locale]} × {n}
                          </span>
                        ))}
                      </div>
                      {prefs.map((p) => (
                        <div key={p.id} className="mt-2.5 flex items-center justify-between gap-3">
                          <span className="text-[13.5px] text-ink-2">{p.label[locale]}</span>
                          <Toggle on={active.has(p.id)} onClick={() => toggle(p.id)} label={`${r.student}: ${p.label[locale]}`} />
                        </div>
                      ))}
                    </li>
                  );
                })}
              </ul>
            )}
            {tab === 1 && (
              <ul className="divide-y divide-[var(--line-separator)]">
                {RULES.filter((x) => x.kind === "busy").map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <span>
                      <span className="block text-[15px] font-medium text-ink">{p.student}</span>
                      <span className="text-[13.5px] text-ink-2">{p.label[locale]}</span>
                    </span>
                    <Toggle on={active.has(p.id)} onClick={() => toggle(p.id)} label={`${p.student}: ${p.label[locale]}`} />
                  </li>
                ))}
              </ul>
            )}
            {tab === 2 && (
              <ul className="divide-y divide-[var(--line-separator)]">
                {TUTORS.map((t) => (
                  <li key={t.name} className="py-3 first:pt-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-medium text-ink">{t.name}</span>
                      <span className="text-[12px] tabular-nums text-ink-3">
                        {t.from}–{t.to}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {t.subjects.map((s) => (
                        <span key={s} className={pill}>
                          <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: SUBJ[s].color }} />
                          {SUBJ[s].name[locale]}
                        </span>
                      ))}
                      <span className="ml-auto flex gap-1">
                        {DAYS.map((d, i) => (
                          <span key={i} className={`flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] ${t.days.includes(i) ? "bg-[var(--accent)] text-white" : "text-ink-3"}`}>
                            {d[locale][0]}
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" onClick={generate} className="m-1 flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[var(--accent)] text-[15px] font-medium text-white transition-transform active:scale-[.98]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 3.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
            </svg>
            {T.generate[locale]}
          </button>
        </aside>

        {/* l'uscita: la settimana */}
        <div className="overflow-hidden rounded-[24px] bg-[var(--bg-surface)] shadow-[0_0_0_1px_var(--line-separator),0_30px_60px_-40px_rgba(41,37,36,.35)] lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-separator)] px-4 py-3 sm:px-5">
            <span className="text-[14px] font-medium text-ink">{T.week[locale]}</span>
            <span className="flex flex-wrap gap-1.5">
              <span data-stat className={pill}>
                <b className="font-medium text-ink">{lessons.length}</b>/{totalHours} {T.lessons[locale]}
              </span>
              <span data-stat className={pill}>
                <b className="font-medium text-ink">0</b> {T.overlaps[locale]}
              </span>
              <span data-stat className={pill}>
                <b className="font-medium text-ink">{active.size}</b> {T.rules[locale]}
              </span>
              {!!shown?.missing && (
                <span data-stat className="rounded-full bg-[color-mix(in_srgb,#D98A6C_18%,transparent)] px-2.5 py-1 text-[12px] text-[#9a4f33]">
                  {shown.missing} {T.missing[locale]}
                </span>
              )}
            </span>
          </div>

          <div ref={grid} className="relative overflow-x-auto p-2 sm:p-4">
            <span data-scan aria-hidden className="pointer-events-none absolute inset-y-4 left-[44px] z-10 w-[18%] bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent)_16%,transparent)] to-transparent opacity-0" />
            <div className="grid min-w-[520px] grid-cols-[40px_repeat(5,minmax(0,1fr))] gap-1">
              <span />
              {DAYS.map((d, i) => (
                <span key={i} className="pb-1 text-center text-[12px] font-medium text-ink-3">
                  {d[locale]}
                </span>
              ))}
              {HOURS.map((h) => (
                <div key={h} className="contents">
                  <span className="pt-1.5 text-right text-[11.5px] tabular-nums text-ink-3">{h}:00</span>
                  {DAYS.map((_, d) => {
                    const free = TUTORS.some((t) => t.days.includes(d) && h >= t.from && h < t.to);
                    return (
                      <div key={d} className={`flex min-h-[66px] flex-col gap-1 rounded-[10px] p-1 ${free ? "bg-[color-mix(in_srgb,var(--label-primary)_3.5%,transparent)]" : "bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_srgb,var(--label-primary)_5%,transparent)_6px_7px)]"}`}>
                        {at(d, h).map((l) => (
                          <span
                            key={`${l.student}-${l.subject}-${l.tutor}`}
                            data-lesson
                            data-order={l.order}
                            className="flex items-center gap-1.5 rounded-[7px] px-1.5 py-1 text-[11px] leading-none text-white"
                            style={{ background: SUBJ[l.subject].color }}
                            title={`${l.student} · ${SUBJ[l.subject].name[locale]} ${T.with[locale]} ${l.tutor}`}
                          >
                            <span className="truncate font-medium">{l.student}</span>
                            <span className="ml-auto shrink-0 opacity-80">{SUBJ[l.subject].short[locale]}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
