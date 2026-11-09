"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMessages } from "next-intl";
import { gsap } from "gsap";
import { ArrowRight, Check, ChevronDown, ChevronUp, CornerDownLeft } from "lucide-react";
import { prefersReducedMotion } from "@/lib/env";
import { Bead } from "@/components/glass/Bead";

/** Fondo di vetro (Goccia) per tasti e opzioni: niente colori al neon. */
const Glass = ({ on = false, radius = 14 }: { on?: boolean; radius?: number }) => (
  <Bead aria-hidden radius={radius} tint={on ? "rgba(255,255,255,.2)" : "rgba(12,14,18,.46)"} className="pointer-events-none absolute inset-0 -z-0 backdrop-blur-xl transition-[background] duration-300" />
);

type Field = { id: string; ph: string; req?: boolean; type?: string };
type Step = { key: string; q: string; hint?: string; multi?: boolean; options?: string[]; fields?: Field[]; note?: string };
type T = {
  kicker: string;
  next: string;
  back: string;
  send: string;
  enter: string;
  key: string;
  optional: string;
  step: string;
  steps: Step[];
  doneTitle: string;
  doneBody: string;
  again: string;
  demo: string;
};

const isVisible = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Richiesta di progetto a passi, come un Typeform: una domanda alla volta, avanzamento in alto,
 * scelta singola che va avanti da sola, Invio per proseguire. Per ora non invia nulla.
 */
export function Brief({ preset, full = false }: { preset?: number; full?: boolean }) {
  const t = (useMessages() as unknown as { brief: T }).brief;
  const steps = t.steps;
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const initial = (): Record<string, string | string[]> => {
    const o = t.steps.find((x) => x.key === "need")?.options?.[preset ?? -1];
    return o ? { need: [o] } : {};
  };
  const [data, setData] = useState<Record<string, string | string[]>>(initial);
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const step = steps[i];
  const last = i === steps.length - 1;

  const val = (k: string) => data[k];
  const set = (k: string, v: string | string[]) => setData((d) => ({ ...d, [k]: v }));

  const valid = (() => {
    if (step.fields) return step.fields.every((f) => !f.req || (f.type === "email" ? EMAIL.test(String(val(f.id) ?? "")) : String(val(f.id) ?? "").trim().length > 1));
    const v = val(step.key);
    return Array.isArray(v) ? v.length > 0 : !!v;
  })();

  const go = (to: number) => {
    dir.current = to > i ? 1 : -1;
    setI(to);
  };
  const next = () => {
    if (!valid) return;
    if (last) {
      dir.current = 1;
      setDone(true);
    } else go(i + 1);
  };

  // ogni domanda entra dal lato verso cui si va
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline();
    tl.fromTo(el, { autoAlpha: 0, x: 28 * dir.current, filter: "blur(6px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }).from(
      q("[data-opt]"),
      { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.035, ease: "power2.out" },
      0.12,
    );
    if (done) tl.from(q("[data-tick]"), { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2.4)" }, 0.1);
    return () => {
      tl.kill();
    };
  }, [i, done]);

  // il primo campo prende il fuoco quando la domanda ha dei campi
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (done) return;
    stage.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  }, [i, done]);

  const pick = (o: string) => {
    if (step.multi) {
      const cur = (val(step.key) as string[]) ?? [];
      set(step.key, cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
      return;
    }
    set(step.key, o);
    if (!step.note) window.setTimeout(() => go(Math.min(i + 1, steps.length - 1)), 320);
  };

  // come nei moduli a domande: la lettera sceglie l'opzione
  useEffect(() => {
    if (done || !step.options) return;
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!stage.current?.closest("form")?.getBoundingClientRect || !isVisible(stage.current)) return;
      const k = e.key.toUpperCase().charCodeAt(0) - 65;
      if (e.key.length === 1 && k >= 0 && k < (step.options?.length ?? 0)) pick(step.options![k]);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  const restart = () => {
    setData(initial());
    setDone(false);
    dir.current = -1;
    setI(0);
  };

  const progress = done ? 1 : i / steps.length;

  return (
    <div className={full ? "relative" : "relative overflow-hidden rounded-[28px] bg-[#0b0c0e] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_40px_80px_-40px_rgba(0,0,0,.9)]"}>
      {/* barra di avanzamento sul bordo, come nei moduli a domande */}
      <span aria-hidden className={`${full ? "fixed" : "absolute"} inset-x-0 top-0 z-10 h-[3px] bg-white/[0.06]`}>
        <span className="block h-full origin-left bg-white/80 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `scaleX(${done ? 1 : (i + 1) / steps.length})` }} />
      </span>
      {!full && <span aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[var(--sky)] opacity-[0.07] blur-[70px]" />}

      <div className={`relative flex items-center justify-between ${full ? "pb-6 sm:pl-9" : "border-b border-white/[0.06] px-6 py-4 sm:px-10"}`}>
        <span className="flex items-center gap-2 text-[13px] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          {t.kicker}
        </span>
        <span className="t-fig font-mono text-[12px] text-ink-3" aria-live="polite">
          {done ? steps.length : i + 1} / {steps.length}
        </span>
      </div>
      <span className="sr-only">{Math.round(progress * 100)}%</span>

      <div className={full ? "relative pt-6" : "relative px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-12"}>
      <form
        className="relative min-h-[380px]"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div ref={stage}>
          {done ? (
            <div className="flex min-h-[360px] flex-col items-start justify-center">
              <span data-tick className="relative flex h-14 w-14 items-center justify-center text-ink">
                <Glass on radius={28} />
                <Check size={26} strokeWidth={2.6} className="relative" />
              </span>
              <h3 className="mt-8 text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.035em] text-ink">{t.doneTitle}</h3>
              <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.55] text-ink-2">{t.doneBody.replace("{name}", String(val("name") ?? "").split(" ")[0])}</p>
              <p className="mt-6 font-mono text-[12px] text-ink-3">{t.demo}</p>
              <button type="button" onClick={restart} className="relative mt-8 h-11 rounded-full px-5 text-[15px] text-ink">
                <Glass radius={22} />
                <span className="relative">{t.again}</span>
              </button>
            </div>
          ) : (
            <fieldset>
              <legend className={`flex items-start gap-3 ${full ? "text-[clamp(28px,3.8vw,50px)]" : "text-[clamp(24px,2.8vw,36px)]"} font-medium leading-[1.15] tracking-[-0.03em] text-ink`}>
                <span className="t-fig mt-[0.45em] flex shrink-0 items-center gap-1 text-[14px] font-medium text-ink-3">
                  {i + 1}
                  <ArrowRight size={13} strokeWidth={2.4} />
                </span>
                {step.q}
              </legend>
              {step.hint && <p className="ml-9 mt-2 text-[15px] text-ink-3">{step.hint}</p>}

              {step.fields && (
                <div className="ml-0 mt-8 grid gap-5 sm:ml-9">
                  {step.fields.map((f) => (
                    <label key={f.id} data-opt className="block">
                      <span className="sr-only">{f.ph}</span>
                      <input
                        type={f.type ?? "text"}
                        value={String(val(f.id) ?? "")}
                        onChange={(e) => set(f.id, e.target.value)}
                        placeholder={f.req ? f.ph : `${f.ph} · ${t.optional}`}
                        autoComplete={f.id === "name" ? "name" : f.id === "email" ? "email" : f.id === "phone" ? "tel" : f.id === "company" ? "organization" : "off"}
                        className="h-14 w-full border-b border-white/20 bg-transparent text-[clamp(19px,1.9vw,24px)] text-ink caret-white outline-none transition-colors placeholder:text-white/35 focus:border-white/70 focus-visible:outline-none"
                      />
                    </label>
                  ))}
                </div>
              )}

              {step.options && (
                <div className={`ml-0 mt-8 grid gap-2 sm:ml-9 ${step.options.length > 5 ? "sm:grid-cols-2" : "max-w-[440px]"}`} role={step.multi ? "group" : "radiogroup"}>
                  {step.options.map((o, k) => {
                    const v = val(step.key);
                    const on = Array.isArray(v) ? v.includes(o) : v === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        data-opt
                        role={step.multi ? "checkbox" : "radio"}
                        aria-checked={on}
                        onClick={() => pick(o)}
                        className={`relative isolate flex min-h-[50px] items-center gap-3 rounded-[14px] px-2.5 py-1.5 text-left text-[15px] transition-[color,transform] duration-200 active:scale-[0.98] ${on ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                      >
                        <Glass on={on} />
                        <span
                          className={`relative flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] font-mono text-[11px] font-medium transition-colors duration-200 ${
                            on ? "bg-white text-black" : "bg-white/10 text-ink-2"
                          }`}
                        >
                          {String.fromCharCode(65 + k)}
                        </span>
                        <span className="relative flex-1">{o}</span>
                        {on && <Check size={16} strokeWidth={2.6} className="relative mr-1 text-ink" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {step.note && (
                <label data-opt className="ml-0 mt-6 block sm:ml-9">
                  <span className="sr-only">{step.note}</span>
                  <textarea
                    rows={2}
                    value={String(val(`${step.key}Note`) ?? "")}
                    onChange={(e) => set(`${step.key}Note`, e.target.value)}
                    placeholder={`${step.note} · ${t.optional}`}
                    className="w-full resize-none border-b border-white/20 bg-transparent py-3 text-[17px] text-ink caret-white outline-none transition-colors placeholder:text-white/35 focus:border-white/70 focus-visible:outline-none"
                  />
                </label>
              )}
            </fieldset>
          )}
        </div>

        {!done && (
          <div className="mt-10 flex items-center justify-between gap-4 sm:ml-9">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!valid}
                className="relative isolate flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-ink transition-[opacity,transform] duration-200 active:scale-[0.97] disabled:opacity-40"
              >
                <Glass on radius={24} />
                <span className="relative">{last ? t.send : "OK"}</span>
                <Check size={16} strokeWidth={2.8} className="relative" />
              </button>
              <span className="hidden items-center gap-1.5 text-[12.5px] text-ink-3 sm:flex">
                {t.enter}
                <span className="flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 font-medium text-ink-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]">
                  {t.key} <CornerDownLeft size={11} strokeWidth={2} />
                </span>
              </span>
            </div>
            <div className="relative isolate flex overflow-hidden rounded-full text-ink">
              <Glass radius={20} />
              <button type="button" aria-label={t.back} onClick={() => go(i - 1)} disabled={i === 0} className="relative flex h-10 w-11 items-center justify-center transition-opacity disabled:opacity-30">
                <ChevronUp size={18} strokeWidth={2.4} />
              </button>
              <span className="relative my-2 w-px bg-white/15" />
              <button type="button" aria-label={t.next} onClick={next} disabled={!valid} className="relative flex h-10 w-11 items-center justify-center transition-opacity disabled:opacity-30">
                <ChevronDown size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
